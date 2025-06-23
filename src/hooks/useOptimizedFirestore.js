import { useState, useEffect, useCallback, useRef } from 'react';
import { getDocs, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

// Cache simples para consultas do Firestore
const queryCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Hook otimizado para consultas ao Firestore com cache e debouncing
 */
export const useOptimizedFirestore = (collectionName, queryOptions = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Gerar chave única para cache baseada na consulta
  const getCacheKey = useCallback((collection, options) => {
    return `${collection}_${JSON.stringify(options)}`;
  }, []);

  // Verificar se existe dados em cache válidos
  const getCachedData = useCallback((cacheKey) => {
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  // Salvar dados no cache
  const setCachedData = useCallback((cacheKey, data) => {
    queryCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }, []);

  // Função para executar a consulta
  const executeQuery = useCallback(async () => {
    const cacheKey = getCacheKey(collectionName, queryOptions);
    
    // Verificar cache primeiro
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      let q = collection(db, collectionName);

      // Aplicar filtros se fornecidos
      if (queryOptions.where) {
        queryOptions.where.forEach(([field, operator, value]) => {
          q = query(q, where(field, operator, value));
        });
      }

      // Aplicar ordenação se fornecida
      if (queryOptions.orderBy) {
        const [field, direction = 'asc'] = queryOptions.orderBy;
        q = query(q, orderBy(field, direction));
      }

      // Aplicar limite se fornecido
      if (queryOptions.limit) {
        q = query(q, limit(queryOptions.limit));
      }

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Salvar no cache
      setCachedData(cacheKey, results);
      setData(results);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
        console.error('Erro na consulta Firestore:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [collectionName, queryOptions, getCacheKey, getCachedData, setCachedData]);

  // Debounced execution
  const debouncedExecuteQuery = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      executeQuery();
    }, 300); // 300ms de debounce
  }, [executeQuery]);

  // Executar consulta quando dependências mudarem
  useEffect(() => {
    debouncedExecuteQuery();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedExecuteQuery]);

  // Função para invalidar cache
  const invalidateCache = useCallback(() => {
    const cacheKey = getCacheKey(collectionName, queryOptions);
    queryCache.delete(cacheKey);
    executeQuery();
  }, [collectionName, queryOptions, getCacheKey, executeQuery]);

  // Função para limpar todo o cache
  const clearAllCache = useCallback(() => {
    queryCache.clear();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: executeQuery,
    invalidateCache,
    clearAllCache
  };
};

/**
 * Hook específico para buscar categorias com cálculos otimizado
 */
export const useOptimizedCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategoriesWithCalculations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar categorias e cálculos em paralelo
      const [categoriesSnapshot, calculationsSnapshot] = await Promise.all([
        getDocs(collection(db, 'categorias')),
        getDocs(collection(db, 'calculos'))
      ]);

      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        calculos: []
      }));

      const calculationsData = calculationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Agrupar cálculos por categoria
      const categoriesMap = new Map(categoriesData.map(cat => [cat.id, cat]));
      
      calculationsData.forEach(calc => {
        const category = categoriesMap.get(calc.categoriaId);
        if (category) {
          category.calculos.push(calc);
        }
      });

      setCategories(Array.from(categoriesMap.values()));
    } catch (err) {
      setError(err);
      console.error('Erro ao buscar categorias:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategoriesWithCalculations();
  }, [fetchCategoriesWithCalculations]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategoriesWithCalculations
  };
};