import React from 'react';
import { useGlossary } from '../../hooks/useGlossary';

const MAX_RESULTS = 10;

const highlightMatch = (text, term) => {
  if (!term.trim()) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 rounded-sm px-0.5">$1</mark>');
};

const GlossarySearch = () => {
  const { 
    searchTerm, 
    setSearchTerm, 
    debouncedTerm,
    loading,
    toggleFavorite,
    isFavorite,
    searchTerms 
  } = useGlossary();

  const filteredTerms = searchTerms(debouncedTerm);

  return (
    <div className="p-6 max-w-2xl mx-auto">
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

      <div className="space-y-4">
        {Object.entries(filteredTerms).length > 0 ? (
          Object.entries(filteredTerms)
            .slice(0, MAX_RESULTS)
            .map(([term, definition]) => (
              <div key={term} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 
                    className="text-lg font-semibold text-gray-900"
                    dangerouslySetInnerHTML={{ __html: highlightMatch(term, debouncedTerm) }}
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
                  dangerouslySetInnerHTML={{ __html: highlightMatch(definition, debouncedTerm) }}
                />
              </div>
            ))
        ) : loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : searchTerm ? (
          <p className="text-gray-500 text-center py-4">
            Nenhum termo encontrado para "{searchTerm}"
          </p>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Digite algo para pesquisar no glossário
          </p>
        )}
      </div>
    </div>
  );
};

export default GlossarySearch;