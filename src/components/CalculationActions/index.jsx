import React, { useState, useContext, useRef, useEffect } from "react";
import {
  Edit,
  Trash2,
  MoreVertical,
  Share2,
  Lock,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import "./styles.css";

const CalculationActions = ({ calculation, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { isAdmin, user } = useContext(AuthContext);
  const menuRef = useRef(null);
  
  // Verifica se o usuário atual é o criador do cálculo ou um administrador
  const canEdit = isAdmin || (user && calculation.createdBy === user.uid);

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
    window.location.href = `/edit-calculation/${calculation.id}`;
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    if (onDelete) {
      onDelete(calculation);
    }
  };



  // const handleShare = () => {
  //   // Implementação futura
  //   setShowMenu(false);
  //   alert("Funcionalidade de compartilhamento será implementada em breve.");
  // };

  return (
    <div className="calculation-actions" ref={menuRef}>
      <button
        className="actions-toggle"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        aria-label="Opções do cálculo"
      >
        <MoreVertical size={16} />
      </button>

      {showMenu && (
        <div className="actions-menu">
          {canEdit ? (
            <>
              <button className="action-item" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEdit();
              }}>
                <Edit size={16} />
                <span>Editar</span>
              </button>
              {/* <button className="action-item" onClick={handleShare}>
                <Share2 size={16} />
                <span>Compartilhar</span>
              </button> */}
              <button
                className="action-item delete"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteClick();
                }}
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

export default CalculationActions;
