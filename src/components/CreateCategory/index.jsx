// src/components/CreateCategory.jsx
import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import "./styles.css";

const CreateCategory = ({ onCreate, onCancel }) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCategory = async () => {
    if (!categoryName || !categoryDescription) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);
      const categoryRef = doc(db, "categories", categoryName);
      await setDoc(categoryRef, {
        name: categoryName,
        description: categoryDescription,
        createdAt: new Date(),
      });
      setCategoryName("");
      setCategoryDescription("");
      setError("");
      if (onCreate) onCreate();
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao criar a categoria. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-category-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Criar Nova Categoria</h2>
        </div>
        
        <div className="input-group">
          <input
            type="text"
            placeholder="Nome da Categoria"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="input-field"
            disabled={isSubmitting}
          />
        </div>

        <div className="input-group">
          <textarea
            placeholder="Descrição da Categoria"
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
            className="input-field textarea-field"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="button-group">
          <button
            onClick={handleCreateCategory}
            className="create-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Criando..." : "Criar Categoria"}
          </button>
          <button 
            onClick={onCancel}
            className="cancel-button"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;
