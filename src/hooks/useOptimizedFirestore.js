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
 * Inclui verificação de integridade de dados
 */
export const useOptimizedCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [integrityIssues, setIntegrityIssues] = useState([]);
  const [integrityChecked, setIntegrityChecked] = useState(false);

  // Esquema de validação para categorias
  const categorySchema = {
    required: ['name'],
    optional: ['description', 'createdAt', 'updatedAt']
  };

  // Esquema de validação para cálculos
  const calculationSchema = {
    required: ['name', 'parameters', 'results'],
    optional: ['description', 'createdAt', 'updatedAt', 'tags', 'categoryIds']
  };

  /**
   * Verifica se um objeto atende aos requisitos do esquema
   * @param {Object} data - Objeto a ser validado
   * @param {Object} schema - Esquema de validação
   * @returns {Object} - Resultado da validação {isValid, missingFields}
   */
  const validateAgainstSchema = useCallback((data, schema) => {
    const missingFields = [];
    
    // Verifica campos obrigatórios
    for (const field of schema.required) {
      if (data[field] === undefined || data[field] === null || 
          (typeof data[field] === 'string' && data[field].trim() === '')) {
        missingFields.push(field);
      }
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }, []);

  /**
   * Verifica referências entre categorias e cálculos
   * @param {Array} calculations - Lista de cálculos
   * @param {Array} categories - Lista de categorias
   * @returns {Array} - Lista de problemas de referência encontrados
   */
  const validateReferences = useCallback((calculations, categories) => {
    const issues = [];
    const categoryIds = new Set(categories.map(cat => cat.id));
    
    calculations.forEach(calc => {
      // Verifica se as categorias referenciadas existem
      if (calc.categoryIds && Array.isArray(calc.categoryIds)) {
        calc.categoryIds.forEach(catId => {
          if (!categoryIds.has(catId)) {
            issues.push({
              type: 'reference',
              calculationId: calc.id,
              calculationName: calc.name,
              message: `Referência inválida: categoria com ID ${catId} não existe`,
              field: 'categoryIds',
              value: catId
            });
          }
        });
      }
      
      // Verifica se a categoriaId principal existe
      if (calc.categoriaId && !categoryIds.has(calc.categoriaId)) {
        issues.push({
          type: 'reference',
          calculationId: calc.id,
          calculationName: calc.name,
          message: `Referência inválida: categoria principal com ID ${calc.categoriaId} não existe`,
          field: 'categoriaId',
          value: calc.categoriaId
        });
      }
    });
    
    return issues;
  }, []);

  /**
   * Verifica a integridade dos dados carregados
   * @param {Array} categoriesData - Lista de categorias
   * @param {Array} calculationsData - Lista de cálculos
   * @returns {Array} - Lista de problemas encontrados
   */
  const checkDataIntegrity = useCallback((categoriesData, calculationsData) => {
    const issues = [];
    
    // Verifica integridade das categorias
    categoriesData.forEach(category => {
      const validation = validateAgainstSchema(category, categorySchema);
      
      if (!validation.isValid) {
        validation.missingFields.forEach(field => {
          issues.push({
            type: 'missing_field',
            categoryId: category.id,
            categoryName: category.name || 'Categoria sem nome',
            field,
            message: `Campo obrigatório ausente: ${field}`
          });
        });
      }
    });
    
    // Verifica integridade dos cálculos
    calculationsData.forEach(calculation => {
      // Verifica campos obrigatórios do cálculo
      const calcValidation = validateAgainstSchema(calculation, calculationSchema);
      
      if (!calcValidation.isValid) {
        calcValidation.missingFields.forEach(field => {
          issues.push({
            type: 'missing_field',
            calculationId: calculation.id,
            calculationName: calculation.name || 'Cálculo sem nome',
            field,
            message: `Campo obrigatório ausente: ${field}`
          });
        });
      }
    });
    
    // Verifica referências entre documentos
    const referenceIssues = validateReferences(calculationsData, categoriesData);
    issues.push(...referenceIssues);
    
    return issues;
  }, [validateAgainstSchema, validateReferences]);

  const fetchCategoriesWithCalculations = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIntegrityIssues([]);

    try {
      // Buscar categorias e cálculos em paralelo
      const [categoriesSnapshot, calculationsSnapshot] = await Promise.all([
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'calculations'))
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

      // Verificar integridade dos dados
      const issues = checkDataIntegrity(categoriesData, calculationsData);
      setIntegrityIssues(issues);
      setIntegrityChecked(true);
      
      // Registrar problemas no console para depuração
      if (issues.length > 0) {
        console.warn(`Encontrados ${issues.length} problemas de integridade nos dados:`, issues);
      }

      // Agrupar cálculos por categoria
      const categoriesMap = new Map(categoriesData.map(cat => [cat.id, cat]));
      
      calculationsData.forEach(calc => {
        // Verificar se a categoria existe antes de adicionar o cálculo
        const category = categoriesMap.get(calc.categoriaId);
        if (category) {
          category.calculos.push(calc);
        } else if (calc.categoryIds && Array.isArray(calc.categoryIds) && calc.categoryIds.length > 0) {
          // Fallback: usar a primeira categoria da lista de categoryIds
          const fallbackCategory = categoriesMap.get(calc.categoryIds[0]);
          if (fallbackCategory) {
            fallbackCategory.calculos.push(calc);
          }
        }
      });

      setCategories(Array.from(categoriesMap.values()));
    } catch (err) {
      setError(err);
      console.error('Erro ao buscar categorias:', err);
    } finally {
      setLoading(false);
    }
  }, [checkDataIntegrity]);

  useEffect(() => {
    fetchCategoriesWithCalculations();
  }, [fetchCategoriesWithCalculations]);

  return {
    categories,
    loading,
    error,
    integrityIssues,
    integrityChecked,
    refetch: fetchCategoriesWithCalculations
  };
};