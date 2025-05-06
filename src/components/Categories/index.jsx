import React from "react";

export function Categories({ categories, onSelect, selectedCategory }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-custom text-center">
        <p className="text-gray-500 font-medium">Nenhuma categoria disponível.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-custom p-4 border border-gray-100">
      <h3 className="text-primary font-semibold mb-4 text-lg border-b border-gray-100 pb-2">Categorias</h3>
      <div className="flex flex-col gap-3">
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => onSelect(category.name)}
            className={`px-4 py-3 rounded-md transition-all duration-300 text-left font-medium flex items-center ${selectedCategory === category.name
              ? 'bg-primary text-white shadow-md transform scale-102'
              : 'bg-gray-50 text-primary hover:bg-primary-light hover:text-white'}`}
          >
            <span className="flex-1">{category.name}</span>
            {category.calculos && category.calculos.length > 0 && (
              <span className={`text-xs px-2 py-1 rounded-full ${selectedCategory === category.name ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                {category.calculos.length}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}