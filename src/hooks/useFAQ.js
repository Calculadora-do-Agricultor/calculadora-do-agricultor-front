import { useState, useCallback, useMemo } from 'react';
import { faqService } from '../services/faqService';
import { useToast } from '../context/ToastContext';

export const useFAQ = () => {
  const [faqItems, setFaqItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Carregar todos os itens do FAQ
  const loadFAQItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await faqService.getAllFAQItems();
      setFaqItems(items);
    } catch (err) {
      setError(err.message);
      toast?.error('Erro ao carregar itens do FAQ');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Carregar apenas itens ativos (para exibição pública)
  const loadActiveFAQItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await faqService.getActiveFAQItems();
      setFaqItems(items);
    } catch (err) {
      setError(err.message);
      toast?.error('Erro ao carregar FAQ');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Carregar itens por categoria
  const loadFAQItemsByCategory = useCallback(async (category) => {
    setLoading(true);
    setError(null);
    try {
      const items = await faqService.getFAQItemsByCategory(category);
      setFaqItems(items);
    } catch (err) {
      setError(err.message);
      toast?.error('Erro ao carregar itens da categoria');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Criar novo item do FAQ
  const createFAQItem = useCallback(async (faqData) => {
    setLoading(true);
    setError(null);
    try {
      const newItem = await faqService.createFAQItem(faqData);
      setFaqItems(prev => [...prev, newItem]);
      toast?.success('Item do FAQ criado com sucesso!');
      return newItem;
    } catch (err) {
      setError(err.message);
      toast?.error('Erro ao criar item do FAQ');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Atualizar item do FAQ
  const updateFAQItem = useCallback(async (id, faqData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedItem = await faqService.updateFAQItem(id, faqData);
      setFaqItems(prev => 
        prev.map(item => item.id === id ? { ...item, ...updatedItem } : item)
      );
      toast?.success('Item do FAQ atualizado com sucesso!');
      return updatedItem;
    } catch (err) {
      setError(err.message);
      toast?.error('Erro ao atualizar item do FAQ');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Deletar item do FAQ
  const deleteFAQItem = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await faqService.deleteFAQItem(id);
      setFaqItems(prev => prev.filter(item => item.id !== id));
      toast?.success('Item do FAQ removido com sucesso!');
    } catch (err) {
      setError(err.message);
      toast?.error('Erro ao remover item do FAQ');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Alternar status ativo/inativo
  const toggleFAQItemStatus = useCallback(async (id, isActive) => {
    setLoading(true);
    setError(null);
    try {
      await faqService.toggleFAQItemStatus(id, isActive);
      setFaqItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, isActive } : item
        )
      );
      toast?.success(`Item ${isActive ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (err) {
      setError(err.message);
      toast?.error('Erro ao alterar status do item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Reordenar itens
  const reorderFAQItems = useCallback(async (items) => {
    setLoading(true);
    setError(null);
    try {
      await faqService.reorderFAQItems(items);
      setFaqItems(items);
      toast?.success('Ordem dos itens atualizada com sucesso!');
    } catch (err) {
      setError(err.message);
      toast?.error('Erro ao reordenar itens');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar itens
  const searchFAQItems = useCallback(async (searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      const items = await faqService.searchFAQItems(searchTerm);
      setFaqItems(items);
    } catch (err) {
      setError(err.message);
      toast?.error('Erro ao buscar itens');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    faqItems,
    loading,
    error,
    loadFAQItems,
    loadActiveFAQItems,
    loadFAQItemsByCategory,
    createFAQItem,
    updateFAQItem,
    deleteFAQItem,
    toggleFAQItemStatus,
    reorderFAQItems,
    searchFAQItems,
    setFaqItems,
    setError
  };
};

// Hook específico para administração do FAQ
export const useFAQAdmin = () => {
  const faqHook = useFAQ();
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('category');
  const [sortOrder, setSortOrder] = useState('asc');

  // Filtrar e ordenar itens
  const filteredAndSortedItems = useMemo(() => {
    let items = [...faqHook.faqItems];

    // Filtrar por categoria
    if (selectedCategory !== 'todos') {
      items = items.filter(item => item.category === selectedCategory);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(item => 
        item.question.toLowerCase().includes(term) ||
        item.answer.toLowerCase().includes(term) ||
        (item.tags && item.tags.some(tag => 
          tag.toLowerCase().includes(term)
        ))
      );
    }

    // Ordenar
    items.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue?.seconds * 1000 || 0);
        bValue = new Date(bValue?.seconds * 1000 || 0);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return items;
  }, [faqHook.faqItems, selectedCategory, searchTerm, sortBy, sortOrder]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = faqHook.faqItems.length;
    const active = faqHook.faqItems.filter(item => item.isActive).length;
    const inactive = total - active;
    
    const byCategory = faqHook.faqItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      active,
      inactive,
      byCategory
    };
  }, [faqHook.faqItems]);

  return {
    ...faqHook,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredAndSortedItems,
    stats
  };
};