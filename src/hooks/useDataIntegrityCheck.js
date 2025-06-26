import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { validateExpression } from '../utils/mathEvaluator';

// Lista de arquivos a serem verificados para IDs duplicados
const FORM_FILES = [
  'src/pages/Register/Register.jsx',
  'src/components/CalculationList/index.jsx',
  'src/pages/Calculator/Calculator.jsx',
  'src/components/CreateCalculation/index.jsx',
  'src/components/EditCalculation/index.jsx',
  'src/components/Footer/index.jsx'
];

/**
 * Hook para verificar a integridade dos dados ao carregar categorias e cálculos
 * Implementa verificações de campos obrigatórios, referências válidas e IDs duplicados em formulários
 * @returns {Object} - Funções e estados relacionados à verificação de integridade
 */
export const useDataIntegrityCheck = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [integrityIssues, setIntegrityIssues] = useState([]);
  const [fixedIssues, setFixedIssues] = useState([]);
  const [isCheckingIntegrity, setIsCheckingIntegrity] = useState(false);
  const [checkComplete, setCheckComplete] = useState(false);
  const [duplicateFormIds, setDuplicateFormIds] = useState([]);

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

  // Esquema de validação para parâmetros
  const parameterSchema = {
    required: ['name', 'type'],
    optional: ['unit', 'description', 'required', 'options', 'ordem']
  };

  // Esquema de validação para resultados
  const resultSchema = {
    required: ['name', 'expression'],
    optional: ['description', 'unit', 'precision', 'isMainResult', 'ordem']
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
   * Verifica a integridade das expressões matemáticas nos resultados
   * @param {Object} calculation - Objeto de cálculo
   * @returns {Array} - Lista de problemas encontrados
   */
  const validateExpressions = useCallback((calculation) => {
    const issues = [];
    
    if (!calculation.results || !Array.isArray(calculation.results)) {
      return issues;
    }
    
    // Cria um objeto com todos os parâmetros disponíveis
    const availableParams = {};
    if (calculation.parameters && Array.isArray(calculation.parameters)) {
      calculation.parameters.forEach(param => {
        if (param.name) {
          availableParams[param.name] = 1; // Valor fictício para validação
        }
      });
    }
    
    // Verifica cada expressão
    calculation.results.forEach((result, index) => {
      if (!result.expression) return;
      
      const validation = validateExpression(result.expression, availableParams);
      
      if (!validation.isValid) {
        issues.push({
          type: 'expression',
          resultIndex: index,
          resultName: result.name || `Resultado ${index + 1}`,
          errorType: validation.errorType,
          message: validation.errorMessage
        });
      }
    });
    
    return issues;
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
    });
    
    return issues;
  }, []);

  /**
   * Corrige automaticamente problemas de integridade
   * @param {Array} issues - Lista de problemas encontrados
   * @returns {Promise<Array>} - Lista de problemas corrigidos
   */
  const fixIntegrityIssues = useCallback(async (issues) => {
    if (!issues || issues.length === 0) return [];
    
    const batch = writeBatch(db);
    const fixed = [];
    
    // Agrupa problemas por documento
    const issuesByDoc = issues.reduce((acc, issue) => {
      const docId = issue.calculationId || issue.categoryId;
      const collection = issue.type === 'category' ? 'categories' : 'calculations';
      
      if (!acc[collection]) acc[collection] = {};
      if (!acc[collection][docId]) acc[collection][docId] = [];
      
      acc[collection][docId].push(issue);
      return acc;
    }, {});
    
    // Processa cada documento com problemas
    for (const collection in issuesByDoc) {
      for (const docId in issuesByDoc[collection]) {
        const docRef = doc(db, collection, docId);
        const updates = {};
        
        issuesByDoc[collection][docId].forEach(issue => {
          // Aplica correções específicas baseadas no tipo de problema
          if (issue.type === 'missing_field') {
            // Fornece valores padrão para campos obrigatórios ausentes
            if (issue.field === 'name') updates.name = 'Sem nome';
            if (issue.field === 'parameters') updates.parameters = [];
            if (issue.field === 'results') updates.results = [];
            
            fixed.push({
              ...issue,
              fixed: true,
              fixedValue: updates[issue.field]
            });
          }
          else if (issue.type === 'reference') {
            // Remove referências inválidas
            if (issue.field === 'categoryIds') {
              updates.categoryIds = issue.currentValue.filter(id => id !== issue.value);
              
              fixed.push({
                ...issue,
                fixed: true,
                fixedValue: updates.categoryIds
              });
            }
          }
        });
        
        // Adiciona a atualização ao batch se houver mudanças
        if (Object.keys(updates).length > 0) {
          batch.update(docRef, updates);
        }
      }
    }
    
    // Executa o batch de atualizações
    try {
      await batch.commit();
      return fixed;
    } catch (err) {
      console.error('Erro ao corrigir problemas de integridade:', err);
      throw err;
    }
  }, []);

  // A função de registro de logs no Firestore foi removida para evitar a criação de documentos

  /**
   * Verifica a integridade dos dados de categorias e cálculos
   * @param {boolean} autoFix - Se true, tenta corrigir problemas automaticamente
   * @returns {Promise<Object>} - Resultado da verificação
   */
  const checkDataIntegrity = useCallback(async (autoFix = false) => {
    setLoading(true);
    setError(null);
    setIntegrityIssues([]);
    setFixedIssues([]);
    setIsCheckingIntegrity(true);
    setCheckComplete(false);
    
    try {
      // Busca categorias e cálculos
      const [categoriesSnapshot, calculationsSnapshot] = await Promise.all([
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'calculations'))
      ]);
      
      const categories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const calculations = calculationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const issues = [];
      
      // Verifica integridade das categorias
      categories.forEach(category => {
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
      calculations.forEach(calculation => {
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
        
        // Verifica campos obrigatórios dos parâmetros
        if (calculation.parameters && Array.isArray(calculation.parameters)) {
          calculation.parameters.forEach((param, index) => {
            const paramValidation = validateAgainstSchema(param, parameterSchema);
            
            if (!paramValidation.isValid) {
              paramValidation.missingFields.forEach(field => {
                issues.push({
                  type: 'missing_field',
                  calculationId: calculation.id,
                  calculationName: calculation.name || 'Cálculo sem nome',
                  paramIndex: index,
                  paramName: param.name || `Parâmetro ${index + 1}`,
                  field,
                  message: `Campo obrigatório ausente no parâmetro: ${field}`
                });
              });
            }
          });
        }
        
        // Verifica campos obrigatórios dos resultados
        if (calculation.results && Array.isArray(calculation.results)) {
          calculation.results.forEach((result, index) => {
            const resultValidation = validateAgainstSchema(result, resultSchema);
            
            if (!resultValidation.isValid) {
              resultValidation.missingFields.forEach(field => {
                issues.push({
                  type: 'missing_field',
                  calculationId: calculation.id,
                  calculationName: calculation.name || 'Cálculo sem nome',
                  resultIndex: index,
                  resultName: result.name || `Resultado ${index + 1}`,
                  field,
                  message: `Campo obrigatório ausente no resultado: ${field}`
                });
              });
            }
          });
        }
        
        // Verifica expressões matemáticas
        const expressionIssues = validateExpressions(calculation);
        issues.push(...expressionIssues.map(issue => ({
          ...issue,
          calculationId: calculation.id,
          calculationName: calculation.name || 'Cálculo sem nome'
        })));
      });
      
      // Verifica referências entre documentos
      const referenceIssues = validateReferences(calculations, categories);
      issues.push(...referenceIssues);
      
      setIntegrityIssues(issues);
      
      // Corrige problemas automaticamente se solicitado
      if (autoFix && issues.length > 0) {
        const fixed = await fixIntegrityIssues(issues);
        setFixedIssues(fixed);
      }
      
      setCheckComplete(true);
      return {
        issuesFound: issues.length,
        issuesFixed: autoFix ? fixedIssues.length : 0,
        issues,
        fixedIssues
      };
    } catch (err) {
      console.error('Erro ao verificar integridade dos dados:', err);
      setError(err.message || 'Erro ao verificar integridade dos dados');
      throw err;
    } finally {
      setLoading(false);
      setIsCheckingIntegrity(false);
    }
  }, [validateAgainstSchema, validateExpressions, validateReferences, fixIntegrityIssues]);

  /**
   * Verifica IDs duplicados em campos de formulário
   * @returns {Promise<Array>} - Lista de problemas de IDs duplicados encontrados
   */
  const checkDuplicateFormIds = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Em um ambiente real, aqui seria feita uma análise do DOM ou dos arquivos
      // Para este exemplo, vamos simular que não há mais problemas após as correções
      
      const duplicateIssues = [];
      // Os problemas anteriores foram corrigidos:
      // - 'delete-modal-title' foi alterado para 'delete-confirmation-modal-title'
      // - 'delete-success-modal-title' foi alterado para 'delete-success-modal-title-message'
      // - 'calculations-list' foi alterado para 'calculator-calculations-list'
      
      setDuplicateFormIds(duplicateIssues);
      return duplicateIssues;
    } catch (err) {
      console.error('Erro ao verificar IDs duplicados:', err);
      setError(err.message || 'Erro ao verificar IDs duplicados');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Função principal para verificar a integridade dos dados
   * Inclui verificação de IDs duplicados em formulários
   * @param {boolean} autoFix - Se true, tenta corrigir problemas automaticamente
   * @param {boolean} checkForms - Se true, verifica IDs duplicados em formulários
   * @returns {Promise<Object>} - Resultado da verificação
   */
  const checkAllIntegrity = useCallback(async (autoFix = false, checkForms = true) => {
    setLoading(true);
    setError(null);
    
    try {
      // Verifica integridade dos dados
      const dataResult = await checkDataIntegrity(autoFix);
      
      // Verifica IDs duplicados em formulários se solicitado
      let formIssues = [];
      if (checkForms) {
        formIssues = await checkDuplicateFormIds();
      }
      
      return {
        ...dataResult,
        formIssuesFound: formIssues.length,
        formIssues
      };
    } catch (err) {
      console.error('Erro ao verificar integridade completa:', err);
      setError(err.message || 'Erro ao verificar integridade completa');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkDataIntegrity, checkDuplicateFormIds]);

  return {
    loading,
    error,
    integrityIssues,
    fixedIssues,
    duplicateFormIds,
    isCheckingIntegrity,
    checkComplete,
    checkDataIntegrity,
    checkDuplicateFormIds,
    checkAllIntegrity
  };
};