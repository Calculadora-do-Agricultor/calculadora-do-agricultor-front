import { useState, useEffect, useCallback } from 'react';
import { FormulaService } from '../services/formulaService';
import { useToast } from '../context/ToastContext';

/**
 * Hook personalizado para gerenciar operações com fórmulas
 * Fornece interface simplificada para CRUD de fórmulas com tratamento de erros
 */
export const useFormulaService = () => {
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  /**
   * Carrega fórmulas do usuário
   * @param {Object} options - Opções de consulta
   */
  const loadFormulas = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const userFormulas = await FormulaService.getUserFormulas(options);
      setFormulas(userFormulas);
      return userFormulas;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao carregar fórmulas';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Salva uma nova fórmula
   * @param {Object} formulaData - Dados da fórmula
   * @returns {Promise<string|null>} - ID da fórmula criada ou null em caso de erro
   */
  const saveFormula = useCallback(async (formulaData) => {
    setLoading(true);
    setError(null);
    
    try {
      const formulaId = await FormulaService.saveFormula(formulaData);
      toast.success('Fórmula salva com sucesso!');
      
      // Recarregar lista de fórmulas
      await loadFormulas();
      
      return formulaId;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao salvar fórmula';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast, loadFormulas]);

  /**
   * Atualiza uma fórmula existente
   * @param {string} formulaId - ID da fórmula
   * @param {Object} updateData - Dados para atualização
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  const updateFormula = useCallback(async (formulaId, updateData) => {
    setLoading(true);
    setError(null);
    
    try {
      await FormulaService.updateFormula(formulaId, updateData);
      toast.success('Fórmula atualizada com sucesso!');
      
      // Recarregar lista de fórmulas
      await loadFormulas();
      
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao atualizar fórmula';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, loadFormulas]);

  /**
   * Remove uma fórmula (soft delete)
   * @param {string} formulaId - ID da fórmula
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  const deleteFormula = useCallback(async (formulaId) => {
    setLoading(true);
    setError(null);
    
    try {
      await FormulaService.deleteFormula(formulaId);
      toast.success('Fórmula removida com sucesso!');
      
      // Recarregar lista de fórmulas
      await loadFormulas();
      
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao remover fórmula';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, loadFormulas]);

  /**
   * Recupera uma fórmula específica por ID
   * @param {string} formulaId - ID da fórmula
   * @returns {Promise<Object|null>} - Dados da fórmula ou null
   */
  const getFormula = useCallback(async (formulaId) => {
    setLoading(true);
    setError(null);
    
    try {
      const formula = await FormulaService.getFormula(formulaId);
      return formula;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao carregar fórmula';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Valida integridade de uma fórmula
   * @param {string} formulaId - ID da fórmula
   * @returns {Promise<Object|null>} - Resultado da validação
   */
  const validateFormulaIntegrity = useCallback(async (formulaId) => {
    setLoading(true);
    setError(null);
    
    try {
      const validationResult = await FormulaService.validateFormulaIntegrity(formulaId);
      
      if (validationResult.isValid) {
        toast.success('Fórmula válida e íntegra!');
      } else {
        toast.warning('Problemas de integridade detectados na fórmula');
      }
      
      return validationResult;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao validar fórmula';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Filtra fórmulas por categoria
   * @param {string} category - Categoria para filtrar
   * @returns {Array} - Fórmulas filtradas
   */
  const getFormulasByCategory = useCallback((category) => {
    if (!category) return formulas;
    return formulas.filter(formula => formula.category === category);
  }, [formulas]);

  /**
   * Busca fórmulas por nome ou descrição
   * @param {string} searchTerm - Termo de busca
   * @returns {Array} - Fórmulas encontradas
   */
  const searchFormulas = useCallback((searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') return formulas;
    
    const term = searchTerm.toLowerCase().trim();
    return formulas.filter(formula => 
      formula.name.toLowerCase().includes(term) ||
      formula.description.toLowerCase().includes(term) ||
      formula.category.toLowerCase().includes(term)
    );
  }, [formulas]);

  /**
   * Obtém estatísticas das fórmulas do usuário
   * @returns {Object} - Estatísticas
   */
  const getFormulaStats = useCallback(() => {
    const stats = {
      total: formulas.length,
      byCategory: {},
      complexityDistribution: {
        low: 0,
        medium: 0,
        high: 0
      },
      recentlyCreated: 0
    };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    formulas.forEach(formula => {
      // Contagem por categoria
      stats.byCategory[formula.category] = (stats.byCategory[formula.category] || 0) + 1;
      
      // Distribuição de complexidade
      const complexity = formula.metadata?.complexity || 0;
      if (complexity <= 5) {
        stats.complexityDistribution.low++;
      } else if (complexity <= 15) {
        stats.complexityDistribution.medium++;
      } else {
        stats.complexityDistribution.high++;
      }
      
      // Fórmulas criadas recentemente
      if (formula.createdAt && formula.createdAt.toDate() > oneWeekAgo) {
        stats.recentlyCreated++;
      }
    });

    return stats;
  }, [formulas]);

  /**
   * Limpa erros
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Carregar fórmulas automaticamente quando o hook é montado
  useEffect(() => {
    loadFormulas();
  }, []);

  return {
    // Estado
    formulas,
    loading,
    error,
    
    // Operações CRUD
    loadFormulas,
    saveFormula,
    updateFormula,
    deleteFormula,
    getFormula,
    
    // Validação
    validateFormulaIntegrity,
    
    // Utilitários
    getFormulasByCategory,
    searchFormulas,
    getFormulaStats,
    clearError
  };
};

export default useFormulaService;