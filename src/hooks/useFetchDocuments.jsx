import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

/**
 * Hook para buscar múltiplos documentos do Firestore
 * @param {string} collectionName - Nome da coleção
 * @param {Object} options - Opções de consulta
 * @returns {Object} { data, loading, error, refetch }
 */
export const useFetchDocuments = (collectionName, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    if (!collectionName) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let q = collection(db, collectionName);
      
      // Aplicar filtros where se fornecidos
      if (options.where) {
        options.where.forEach(([field, operator, value]) => {
          q = query(q, where(field, operator, value));
        });
      }
      
      // Aplicar ordenação se fornecida
      if (options.orderBy) {
        const [field, direction = 'asc'] = options.orderBy;
        q = query(q, orderBy(field, direction));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setData(documents);
    } catch (err) {
      console.error('Erro ao buscar documentos:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [collectionName, JSON.stringify(options)]);

  const refetch = () => {
    fetchDocuments();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};

export default useFetchDocuments;