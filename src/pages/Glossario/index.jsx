import React, { useState } from 'react';
import { useGlossary } from '../../hooks/useGlossary';
import { motion } from 'framer-motion';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const GlossarioPage = () => {
  const { getAllTerms, toggleFavorite, isFavorite, searchTerm, setSearchTerm, debouncedTerm, searchTerms, loading } = useGlossary();
  const [selectedLetter, setSelectedLetter] = useState(null);
  const allTerms = getAllTerms();

  // Função para destacar matches
  const highlightMatch = (text, term) => {
    if (!term.trim()) return text;
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('(' + escapedTerm + ')', 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 rounded-sm px-0.5">$1</mark>');
  };

  // Agrupa termos por letra inicial
  const termsByLetter = Object.entries(allTerms).reduce((acc, [term, definition]) => {
    const firstLetter = term.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push({ term, definition });
    return acc;
  }, {});

  // Ordena termos dentro de cada letra
  Object.keys(termsByLetter).forEach(letter => {
    termsByLetter[letter].sort((a, b) => a.term.localeCompare(b.term));
  });

  // Lógica de filtragem
  let filteredTerms;
  if (debouncedTerm) {
    const searched = searchTerms(debouncedTerm);
    const searchedByLetter = Object.entries(searched).reduce((acc, [term, definition]) => {
      const firstLetter = term.charAt(0).toUpperCase();
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push({ term, definition });
      return acc;
    }, {});

    Object.keys(searchedByLetter).forEach(letter => {
      searchedByLetter[letter].sort((a, b) => a.term.localeCompare(b.term));
    });

    filteredTerms = selectedLetter ? { [selectedLetter]: searchedByLetter[selectedLetter] || [] } : searchedByLetter;
  } else {
    filteredTerms = selectedLetter ? { [selectedLetter]: termsByLetter[selectedLetter] || [] } : termsByLetter;
  }

  let termsContent;
  if (loading) {
    termsContent = (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  } else if (Object.keys(filteredTerms).length > 0) {
    termsContent = Object.entries(filteredTerms).map(([letter, terms]) => (
      <motion.div
        key={letter}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{letter}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {terms.map(({ term, definition }) => (
            <motion.div
              key={term}
              layout
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 
                  className="text-lg font-semibold text-gray-900"
                  dangerouslySetInnerHTML={{ __html: debouncedTerm ? highlightMatch(term, debouncedTerm) : term }}
                />
                <button
                  onClick={() => toggleFavorite(term)}
                  className="text-2xl text-yellow-500 hover:text-yellow-600 transition-colors"
                  aria-label={isFavorite(term) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  {isFavorite(term) ? '★' : '☆'}
                </button>
              </div>
              <p 
                className="text-gray-700"
                dangerouslySetInnerHTML={{ __html: debouncedTerm ? highlightMatch(definition, debouncedTerm) : definition }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    ));
  } else if (debouncedTerm) {
    termsContent = <p className="text-center text-gray-600 py-8">Nenhum termo encontrado para "{debouncedTerm}"</p>;
  } else {
    termsContent = <p className="text-center text-gray-600 py-8">Nenhum termo disponível</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Glossário Agrícola</h1>
      
      {/* Barra de busca */}
      <div className="mb-6">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          Pesquisar no Glossário
        </label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite um termo..."
        />
      </div>

      {/* Filtro alfabético */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedLetter(null)}
          className={`px-3 py-1 rounded-md transition-colors ${!selectedLetter
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
        >
          Todos
        </button>
        {ALPHABET.map(letter => (
          <button
            key={letter}
            onClick={() => setSelectedLetter(letter)}
            disabled={!termsByLetter[letter]}
            className={`px-3 py-1 rounded-md transition-colors ${selectedLetter === letter
              ? 'bg-blue-500 text-white'
              : termsByLetter[letter]
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Lista de termos */}
      <div className="space-y-8">
        {termsContent}
      </div>
    </div>
  );
};

export default GlossarioPage;