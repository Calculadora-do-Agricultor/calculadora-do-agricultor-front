// src/components/CreateCategory.jsx
import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

const CreateCategory = ({ onCreate, onCancel }) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [error, setError] = useState("");

  const handleCreateCategory = async () => {
    if (!categoryName || !categoryDescription) {
      setError("Preencha todos os campos.");
      return;
    }

    try {
      const categoryRef = doc(db, "categories", categoryName);
      await setDoc(categoryRef, {
        name: categoryName,
        description: categoryDescription,
        createdAt: new Date(),
      });
      setCategoryName("");
      setCategoryDescription("");
      setError("");
      alert("Categoria criada com sucesso!");
      if (onCreate) onCreate();
    } catch (err) {
      console.error(err);
      setError("Erro ao criar categoria.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-xl font-semibold mb-4">Criar Categoria</h2>
      <input
        type="text"
        placeholder="Nome da Categoria"
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        className="border p-2 rounded mb-2 w-full max-w-sm" // Adicionado classes para estilização
      />
      <textarea
        placeholder="Descrição da Categoria"
        value={categoryDescription}
        onChange={(e) => setCategoryDescription(e.target.value)}
        className="border p-2 rounded mb-4 w-full max-w-sm h-24" // Adicionado classes para estilização
      />
      <button
        className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400" // Melhorias no estilo do botão
        onClick={handleCreateCategory}
      >
        Criar Categoria
      </button>
      <button onClick={onCancel} className="bg-red-600 px-4 py-2 rounded">
        Fechar
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>} {/* Estilização da mensagem de erro */}
    </div>
  )
};

export default CreateCategory;
