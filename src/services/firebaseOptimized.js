// Configuração otimizada do Firebase
// Importa apenas os módulos necessários para reduzir bundle size

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços apenas quando necessário
let authInstance = null;
let dbInstance = null;

// Lazy initialization do Auth
export const getAuthInstance = () => {
  if (!authInstance) {
    authInstance = getAuth(app);
    
    // Conectar ao emulador em desenvolvimento se configurado
    if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR) {
      connectAuthEmulator(authInstance, 'http://localhost:9099');
    }
  }
  return authInstance;
};

// Lazy initialization do Firestore
export const getDbInstance = () => {
  if (!dbInstance) {
    dbInstance = getFirestore(app);
    
    // Conectar ao emulador em desenvolvimento se configurado
    if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR) {
      connectFirestoreEmulator(dbInstance, 'localhost', 8080);
    }
  }
  return dbInstance;
};

// Exports para compatibilidade com código existente
export const auth = getAuthInstance();
export const db = getDbInstance();

export default app;