import { useState, useCallback } from 'react';

/**
 * Hook personalizado para gerenciar estados de loading
 * @param {boolean} initialState - Estado inicial do loading
 * @returns {Object} Objeto com estado e funções de controle
 */
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingType, setLoadingType] = useState('inline');

  const startLoading = useCallback((message = 'Carregando...', type = 'inline') => {
    setLoadingMessage(message);
    setLoadingType(type);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('');
  }, []);

  const withLoading = useCallback(async (asyncFunction, message = 'Processando...', type = 'inline') => {
    try {
      startLoading(message, type);
      const result = await asyncFunction();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    loadingMessage,
    loadingType,
    startLoading,
    stopLoading,
    withLoading
  };
};

/**
 * Hook para loading de API calls
 * @returns {Object} Objeto com estado e função para executar calls
 */
export const useApiLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeWithLoading = useCallback(async (apiCall, options = {}) => {
    const { 
      onSuccess, 
      onError, 
      loadingMessage = 'Carregando dados...'
    } = options;

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await apiCall();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      setError(err);
      
      if (onError) {
        onError(err);
      } else {
        console.error('API Error:', err);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    executeWithLoading
  };
};

/**
 * Hook para loading de formulários
 * @returns {Object} Objeto com estado e função para submissão
 */
export const useFormLoading = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const submitWithLoading = useCallback(async (submitFunction, options = {}) => {
    const { 
      onSuccess, 
      onError, 
      resetOnSuccess = true,
      successMessage = 'Operação realizada com sucesso!'
    } = options;

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);
      
      const result = await submitFunction();
      
      setSubmitSuccess(true);
      
      if (onSuccess) {
        onSuccess(result, successMessage);
      }
      
      if (resetOnSuccess) {
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
      
      return result;
    } catch (err) {
      setSubmitError(err.message || 'Erro ao processar solicitação');
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const resetForm = useCallback(() => {
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(false);
  }, []);

  return {
    isSubmitting,
    submitError,
    submitSuccess,
    submitWithLoading,
    resetForm
  };
};

export default useLoading;