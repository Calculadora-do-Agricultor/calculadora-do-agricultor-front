import { useState, useCallback, useEffect } from 'react';
import { glossaryTerms } from '../data/glossary';

const STORAGE_KEY = 'glossary_favorites';
const DEBOUNCE_DELAY = 300;

export const useGlossary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Debounce para o termo de busca
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setLoading(false);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Gerenciamento de favoritos
  const toggleFavorite = useCallback((term) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(term)
        ? prev.filter(t => t !== term)
        : [...prev, term];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((term) => {
    return favorites.includes(term);
  }, [favorites]);

  // Busca um termo específico no glossário
  const getTerm = useCallback((term) => {
    const normalizedTerm = term.toLowerCase().trim();
    return glossaryTerms[normalizedTerm] || null;
  }, []);

  // Filtra termos baseado em uma busca
  const searchTerms = useCallback((query) => {
    const normalizedQuery = query.toLowerCase().trim();
    return Object.entries(glossaryTerms)
      .filter(([term, definition]) => 
        term.toLowerCase().includes(normalizedQuery) ||
        definition.toLowerCase().includes(normalizedQuery)
      )
      .sort((a, b) => {
        // Prioriza favoritos
        const aIsFavorite = favorites.includes(a[0]);
        const bIsFavorite = favorites.includes(b[0]);
        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;
        return 0;
      })
      .reduce((acc, [term, definition]) => {
        acc[term] = definition;
        return acc;
      }, {});
  }, [favorites]);

  // Verifica se um termo existe no glossário
  const hasTerm = useCallback((term) => {
    const normalizedTerm = term.toLowerCase().trim();
    return normalizedTerm in glossaryTerms;
  }, []);

  // Retorna todos os termos do glossário
  const getAllTerms = useCallback(() => {
    return glossaryTerms;
  }, []);

  // Retorna apenas os termos favoritos
  const getFavoriteTerms = useCallback(() => {
    return favorites.reduce((acc, term) => {
      if (glossaryTerms[term]) {
        acc[term] = glossaryTerms[term];
      }
      return acc;
    }, {});
  }, [favorites]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
    loading,
    favorites,
    toggleFavorite,
    isFavorite,
    getTerm,
    searchTerms,
    hasTerm,
    getAllTerms,
    getFavoriteTerms
  };
};