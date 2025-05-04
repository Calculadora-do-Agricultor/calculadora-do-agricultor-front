import React from "react";

export function Categorias({ categorias, aoSelecionar }) {
  if (!categorias || categorias.length === 0) {
    return <p>Nenhuma categoria disponível.</p>;
  }

  return (
    <div className="flex flex-col gap-4 justify-center">
      {categorias.map((cat, index) => (
        <button
          key={index}
          onClick={() => aoSelecionar(cat.name)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          {cat.name}
        </button>

      ))}
    </div>
  );
}
