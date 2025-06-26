import React, { useState } from 'react';
import { useGlossary } from '../../hooks/useGlossary';
import { motion } from 'framer-motion';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const GlossarioPage = () => {
  const { getAllTerms, toggleFavorite, isFavorite } = useGlossary();
  const [selectedLetter, setSelectedLetter] = useState(null);
  const allTerms = getAllTerms();

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

  const filteredTerms = selectedLetter ? { [selectedLetter]: termsByLetter[selectedLetter] } : termsByLetter;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Glossário Agrícola</h1>
      
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
        {Object.entries(filteredTerms).map(([letter, terms]) => (
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
                    <h3 className="text-lg font-semibold text-gray-900">{term}</h3>
                    <button
                      onClick={() => toggleFavorite(term)}
                      className="text-2xl text-yellow-500 hover:text-yellow-600 transition-colors"
                      aria-label={isFavorite(term) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                      {isFavorite(term) ? '★' : '☆'}
                    </button>
                  </div>
                  <p className="text-gray-700">{definition}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GlossarioPage;