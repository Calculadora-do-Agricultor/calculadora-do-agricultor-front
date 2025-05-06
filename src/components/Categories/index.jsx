import React from "react";

export function Categories({ categories, onSelect }) {
  if (!categories || categories.length === 0) {
    return <p>Nenhuma categoria disponível.</p>;
  }

  return (
    <div className="flex flex-col gap-4 justify-center">
      {categories.map((category, index) => (
        <button
          key={index}
          onClick={() => onSelect(category.name)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}