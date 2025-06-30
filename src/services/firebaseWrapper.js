import { getAuthInstance, getDbInstance } from './firebaseOptimized';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, deleteDoc, query } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
  onAuthStateChanged,
  EmailAuthProvider
} from 'firebase/auth';

// Sistema de notificação interno
let toastInstance = null;

export const setToastInstance = (toast) => {
  toastInstance = toast;
};

const notify = {
  success: (message) => toastInstance?.success(message),
  error: (message) => toastInstance?.error(message),
  info: (message) => toastInstance?.info(message),
  warning: (message) => toastInstance?.warning(message)
};

// Cache para armazenar dados offline
const offlineCache = new Map();

// Estado da conexão
let isOnline = navigator.onLine;

// Configurações de retry
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 segundo
  maxDelay: 10000, // 10 segundos
};

// Função para calcular delay exponencial
const getExponentialDelay = (retryCount) => {
  const delay = Math.min(
    RETRY_CONFIG.initialDelay * Math.pow(2, retryCount),
    RETRY_CONFIG.maxDelay
  );
  return delay + Math.random() * 1000; // Adiciona jitter
};

// Função para executar operação com retry
async function withRetry(operation) {
  let lastError;
  
  for (let retryCount = 0; retryCount <= RETRY_CONFIG.maxRetries; retryCount++) {
    try {
      const result = await operation();
      if (retryCount > 0) {
        notify.success('Operação realizada com sucesso após retry');
      }
      return result;
    } catch (error) {
      lastError = error;
      
      if (retryCount < RETRY_CONFIG.maxRetries) {
        const delay = getExponentialDelay(retryCount);
        notify.warning(`Tentativa ${retryCount + 1} falhou. Tentando novamente em ${Math.round(delay/1000)}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  notify.error(`Operação falhou após ${RETRY_CONFIG.maxRetries} tentativas`);
  throw lastError;
}

// Monitorar estado da conexão
window.addEventListener('online', () => {
  isOnline = true;
  notify.success('Conexão restaurada. Sincronizando dados...');
  syncOfflineData();
});

window.addEventListener('offline', () => {
  isOnline = false;
  notify.warning('Você está offline. As operações serão salvas localmente.');
});

// Função para sincronizar dados offline quando voltar online
async function syncOfflineData() {
  const db = getDbInstance();
  
  if (offlineCache.size === 0) {
    return;
  }

  notify.info(`Iniciando sincronização de ${offlineCache.size} operações pendentes...`);
  let successCount = 0;
  let errorCount = 0;
  
  for (const [key, operation] of offlineCache.entries()) {
    try {
      await withRetry(async () => {
        switch (operation.type) {
          case 'set':
            await setDoc(doc(db, operation.collection, operation.id), operation.data);
            break;
          case 'update':
            await updateDoc(doc(db, operation.collection, operation.id), operation.data);
            break;
          case 'add':
            await addDoc(collection(db, operation.collection), operation.data);
            break;
          case 'delete':
            await deleteDoc(doc(db, operation.collection, operation.id));
            break;
        }
      }, notify);
      
      offlineCache.delete(key);
      successCount++;
    } catch (error) {
      console.error('Erro ao sincronizar dados offline:', error);
      notify.error(`Erro ao sincronizar operação ${operation.type}: ${error.message}`);
      errorCount++;
    }
  }

  if (successCount > 0) {
    notify.success(`${successCount} operações sincronizadas com sucesso`);
  }
  if (errorCount > 0) {
    notify.error(`${errorCount} operações falharam durante a sincronização`);
  }
}

// Wrapper para operações do Firestore com fallback
export const firestoreWrapper = {
  // Buscar documento
  async getDocument(collectionName, documentId) {
    const db = getDbInstance();
    const docRef = doc(db, collectionName, documentId);

    try {
      if (!isOnline) {
        const cachedData = offlineCache.get(`${collectionName}/${documentId}`);
        if (cachedData) {
          notify.info('Usando dados do cache offline');
          return cachedData.data;
        }
        notify.warning('Documento não encontrado no cache offline');
        return null;
      }

      const docSnap = await withRetry(async () => await getDoc(docRef), notify);
      if (docSnap.exists()) {
        const data = docSnap.data();
        offlineCache.set(`${collectionName}/${documentId}`, { type: 'get', data });
        return data;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar documento:', error);
      notify.error(`Erro ao buscar documento: ${error.message}`);
      return null;
    }
  },

  async getCollection(collectionName) {
    const db = getDbInstance();
    const collectionRef = collection(db, collectionName);

    try {
      if (!isOnline) {
        const cachedDocs = Array.from(offlineCache.entries())
          .filter(([key]) => key.startsWith(collectionName + '/'))
          .map(([, value]) => value.data);

        if (cachedDocs.length > 0) {
          notify.info('Usando dados do cache offline');
          return cachedDocs;
        }
        notify.warning('Nenhum documento encontrado no cache offline');
        return [];
      }

      const querySnapshot = await withRetry(async () => await getDocs(collectionRef), notify);
      const documents = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        documents.push({ id: doc.id, ...data });
        offlineCache.set(`${collectionName}/${doc.id}`, { type: 'get', data });
      });
      return documents;
    } catch (error) {
      console.error('Erro ao buscar coleção:', error);
      notify.error(`Erro ao buscar coleção: ${error.message}`);
      return [];
    }
  },

  // Criar/Atualizar documento
  async setDocument(collectionName, docId, data) {
    try {
      if (!isOnline) {
        offlineCache.set(`${collectionName}/${docId}`, {
          type: 'set',
          collection: collectionName,
          id: docId,
          data
        });
        notify.info('Documento será sincronizado quando voltar online');
        return true;
      }

      await withRetry(async () => {
        const db = getDbInstance();
        await setDoc(doc(db, collectionName, docId), data);
      }, notify);
      notify.success('Documento salvo com sucesso');
      return true;
    } catch (error) {
      notify.error(`Erro ao salvar documento: ${error.message}`);
      throw error;
    }
  },

  // Atualizar documento
  async updateDocument(collectionName, docId, data, showNotification = true) {
    try {
      if (!isOnline) {
        offlineCache.set(`${collectionName}/${docId}`, {
          type: 'update',
          collection: collectionName,
          id: docId,
          data
        });
        if (showNotification) {
          notify.info('Atualização será sincronizada quando voltar online');
        }
        return true;
      }

      await withRetry(async () => {
        const db = getDbInstance();
        await updateDoc(doc(db, collectionName, docId), data);
      }, notify);
      if (showNotification) {
        notify.success('Documento atualizado com sucesso');
      }
      return true;
    } catch (error) {
      notify.error(`Erro ao atualizar documento: ${error.message}`);
      throw error;
    }
  },

  // Adicionar documento
  async addDocument(collectionName, data) {
    try {
      if (!isOnline) {
        const tempId = `temp_${Date.now()}`;
        offlineCache.set(`${collectionName}/${tempId}`, {
          type: 'add',
          collection: collectionName,
          data
        });
        notify.info('Documento será adicionado quando voltar online');
        return tempId;
      }

      const docRef = await withRetry(async () => {
        const db = getDbInstance();
        return await addDoc(collection(db, collectionName), data);
      }, notify);
      notify.success('Documento adicionado com sucesso');
      return docRef.id;
    } catch (error) {
      notify.error(`Erro ao adicionar documento: ${error.message}`);
      throw error;
    }
  },

  // Deletar documento
  async deleteDocument(collectionName, docId) {
    try {
      if (!isOnline) {
        offlineCache.set(`${collectionName}/${docId}`, {
          type: 'delete',
          collection: collectionName,
          id: docId
        });
        notify.info('Documento será deletado quando voltar online');
        return true;
      }

      await withRetry(async () => {
        const db = getDbInstance();
        await deleteDoc(doc(db, collectionName, docId));
      }, notify);
      notify.success('Documento deletado com sucesso');
      return true;
    } catch (error) {
      notify.error(`Erro ao deletar documento: ${error.message}`);
      throw error;
    }
  }
};

// Wrapper para operações de autenticação com fallback
export const authWrapper = {
  // Obter usuário atual
  getCurrentUser() {
    const auth = getAuthInstance();
    return auth.currentUser;
  },

  // Observar mudanças no estado de autenticação
  onAuthStateChanged(callback) {
    const auth = getAuthInstance();
    return auth.onAuthStateChanged(callback);
  },

  // Verificar estado da conexão
  isOnline() {
    return isOnline;
  },

  // Login com email e senha
  async signInWithEmailAndPassword(email, password) {
    const auth = getAuthInstance();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      if (!isOnline) {
        // Tentar recuperar credenciais do cache local
        const cachedCredentials = localStorage.getItem(`auth_${email}`);
        if (cachedCredentials) {
          return JSON.parse(cachedCredentials);
        }
      }
      throw error;
    }
  },

  // Criar novo usuário
  async createUserWithEmailAndPassword(email, password) {
    const auth = getAuthInstance();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Armazenar credenciais no cache local
      localStorage.setItem(`auth_${email}`, JSON.stringify(userCredential));
      return userCredential;
    } catch (error) {
      if (!isOnline) {
        throw new Error('Não é possível criar uma nova conta offline');
      }
      throw error;
    }
  },

  // Fazer logout
  async signOut() {
    const auth = getAuthInstance();
    try {
      await signOut(auth);
      // Limpar cache local de autenticação
      Object.keys(localStorage)
        .filter(key => key.startsWith('auth_'))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  },

  // Reautenticar usuário
  async reauthenticate(password) {
    const auth = getAuthInstance();
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, password);
    try {
      await reauthenticateWithCredential(user, credential);
    } catch (error) {
      if (!isOnline) {
        throw new Error('Não é possível reautenticar offline');
      }
      throw error;
    }
  },

  // Atualizar email
  async updateEmail(newEmail) {
    const auth = getAuthInstance();
    const user = auth.currentUser;
    try {
      await updateEmail(user, newEmail);
    } catch (error) {
      if (!isOnline) {
        throw new Error('Não é possível atualizar o email offline');
      }
      throw error;
    }
  },

  // Atualizar senha
  async updatePassword(newPassword) {
    const auth = getAuthInstance();
    const user = auth.currentUser;
    try {
      await updatePassword(user, newPassword);
    } catch (error) {
      if (!isOnline) {
        throw new Error('Não é possível atualizar a senha offline');
      }
      throw error;
    }
  }
};