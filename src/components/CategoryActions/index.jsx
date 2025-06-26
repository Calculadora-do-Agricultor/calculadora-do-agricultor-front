import React, { useContext } from "react";
import {
  Edit,
  Lock,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import "./styles.css";

const CategoryActions = ({ category, onEdit }) => {
  const { user, isAdmin } = useContext(AuthContext);
  
  // Verifica se o usuário atual é o criador da categoria ou um administrador
  const canEdit = isAdmin || (user && category.createdBy === user.uid);

  const handleEdit = (e) => {
    e.stopPropagation(); // Impede que o clique propague para o item da categoria
    if (onEdit && canEdit) {
      onEdit(category);
    }
  };

  return (
    <div className="category-actions">
      {canEdit ? (
        <button
          className="edit-button"
          onClick={handleEdit}
          aria-label="Editar categoria"
          title="Editar categoria"
        >
          <Edit size={16} />
        </button>
      ) : (
        <button
          className="edit-button disabled"
          disabled
          aria-label="Acesso restrito"
          title="Acesso restrito a administradores"
        >
          <Lock size={16} />
        </button>
      )}
    </div>
  );
};

export default CategoryActions;