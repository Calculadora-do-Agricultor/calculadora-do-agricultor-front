import React, { useState, useContext, useRef, useEffect } from "react";
import {
  Edit,
  Trash2,
  MoreVertical,
  Lock,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import "./styles.css";

const CategoryActions = ({ category, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { isAdmin, user } = useContext(AuthContext);
  const menuRef = useRef(null);
  
  // Verifica se o usuário atual é o criador da categoria ou um administrador
  const canEdit = isAdmin || (user && category.createdBy === user.uid);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleEdit = () => {
    setShowMenu(false);
    if (onEdit) {
      onEdit(category);
    }
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    if (onDelete) {
      onDelete(category);
    }
  };

  return (
    <div className="category-actions" ref={menuRef}>
      <button
        className="actions-toggle"
        onClick={(e) => {
          e.stopPropagation(); // Impede que o clique propague para o item da categoria
          setShowMenu(!showMenu);
        }}
        aria-label="Opções da categoria"
      >
        <MoreVertical size={16} />
      </button>

      {showMenu && (
        <div className="actions-menu">
          {canEdit ? (
            <>
              <button className="action-item" onClick={handleEdit}>
                <Edit size={16} />
                <span>Editar</span>
              </button>
              <button
                className="action-item delete"
                onClick={handleDeleteClick}
              >
                <Trash2 size={16} />
                <span>Excluir</span>
              </button>
            </>
          ) : (
            <div className="action-item disabled">
              <Lock size={16} />
              <span>Acesso restrito a administradores</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryActions;