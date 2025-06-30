import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const FAQ_COLLECTION = 'faq';

// Categorias disponíveis para o FAQ
const FAQ_CATEGORIES = {
  plantio: {
    id: 'plantio',
    name: 'Plantio e Cultivo',
    icon: '🌱',
    description: 'Dúvidas sobre plantio, cultivo e manejo de culturas'
  },
  solo: {
    id: 'solo',
    name: 'Solo e Nutrição',
    icon: '🌍',
    description: 'Questões sobre análise de solo, adubação e correção'
  },
  calculadora: {
    id: 'calculadora',
    name: 'Uso da Calculadora',
    icon: '🧮',
    description: 'Como usar as funcionalidades da calculadora'
  },
  tecnico: {
    id: 'tecnico',
    name: 'Suporte Técnico',
    icon: '🔧',
    description: 'Problemas técnicos e suporte ao usuário'
  }
};

export const faqService = {
  // Categorias disponíveis
  CATEGORIES: Object.values(FAQ_CATEGORIES).map(cat => ({
    value: cat.id,
    label: cat.name,
    icon: cat.icon,
    description: cat.description
  })),

  // Buscar todos os itens do FAQ
  async getAllFAQItems() {
    try {
      const q = query(
        collection(db, FAQ_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar no lado do cliente para evitar índice composto
      return items.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA; // Ordem decrescente
      });
    } catch (error) {
      console.error('Erro ao buscar itens do FAQ:', error);
      throw error;
    }
  },

  // Buscar itens do FAQ por categoria
  async getFAQItemsByCategory(category) {
    try {
      const q = query(
        collection(db, FAQ_COLLECTION),
        where('category', '==', category)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar itens do FAQ por categoria:', error);
      throw error;
    }
  },

  // Buscar um item específico do FAQ
  async getFAQItem(id) {
    try {
      const docRef = doc(db, FAQ_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Item do FAQ não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar item do FAQ:', error);
      throw error;
    }
  },

  // Criar novo item do FAQ
  async createFAQItem(faqData) {
    try {
      const docData = {
        ...faqData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      };
      
      const docRef = await addDoc(collection(db, FAQ_COLLECTION), docData);
      return {
        id: docRef.id,
        ...docData
      };
    } catch (error) {
      console.error('Erro ao criar item do FAQ:', error);
      throw error;
    }
  },

  // Atualizar item do FAQ
  async updateFAQItem(id, faqData) {
    try {
      const docRef = doc(db, FAQ_COLLECTION, id);
      const updateData = {
        ...faqData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updateData);
      return {
        id,
        ...updateData
      };
    } catch (error) {
      console.error('Erro ao atualizar item do FAQ:', error);
      throw error;
    }
  },

  // Deletar item do FAQ
  async deleteFAQItem(id) {
    try {
      const docRef = doc(db, FAQ_COLLECTION, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erro ao deletar item do FAQ:', error);
      throw error;
    }
  },

  // Ativar/Desativar item do FAQ
  async toggleFAQItemStatus(id, isActive) {
    try {
      const docRef = doc(db, FAQ_COLLECTION, id);
      await updateDoc(docRef, {
        isActive,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erro ao alterar status do item do FAQ:', error);
      throw error;
    }
  },

  // Reordenar itens do FAQ
  async reorderFAQItems(items) {
    try {
      const batch = [];
      
      items.forEach((item, index) => {
        const docRef = doc(db, FAQ_COLLECTION, item.id);
        batch.push(
          updateDoc(docRef, {
            order: index + 1,
            updatedAt: serverTimestamp()
          })
        );
      });
      
      await Promise.all(batch);
      return true;
    } catch (error) {
      console.error('Erro ao reordenar itens do FAQ:', error);
      throw error;
    }
  },

  // Buscar itens ativos do FAQ (para exibição pública)
  async getActiveFAQItems() {
    try {
      const q = query(
        collection(db, FAQ_COLLECTION),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar no lado do cliente para evitar índice composto
      return items.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA; // Ordem decrescente
      });
    } catch (error) {
      console.error('Erro ao buscar itens ativos do FAQ:', error);
      throw error;
    }
  },

  // Buscar por texto (busca em pergunta, resposta e tags)
  async searchFAQItems(searchTerm) {
    try {
      // Como o Firestore não suporta busca full-text nativa,
      // vamos buscar todos os itens e filtrar no cliente
      const allItems = await this.getActiveFAQItems();
      
      const searchTermLower = searchTerm.toLowerCase();
      
      return allItems.filter(item => 
        item.question.toLowerCase().includes(searchTermLower) ||
        item.answer.toLowerCase().includes(searchTermLower) ||
        (item.tags && item.tags.some(tag => 
          tag.toLowerCase().includes(searchTermLower)
        ))
      );
    } catch (error) {
      console.error('Erro ao buscar itens do FAQ:', error);
      throw error;
    }
  }
};

// Exportar FAQ_CATEGORIES para uso externo
export { FAQ_CATEGORIES };

// Schema de validação para itens do FAQ
export const faqItemSchema = {
  question: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 200
  },
  answer: {
    type: 'string',
    required: true,
    minLength: 20,
    maxLength: 2000
  },
  category: {
    type: 'string',
    required: true,
    enum: Object.keys(FAQ_CATEGORIES)
  },
  tags: {
    type: 'array',
    required: false,
    items: {
      type: 'string',
      maxLength: 30
    },
    maxItems: 10
  },
  order: {
    type: 'number',
    required: false,
    min: 1
  },
  isActive: {
    type: 'boolean',
    required: false,
    default: true
  }
};