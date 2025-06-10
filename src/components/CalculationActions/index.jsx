import React, { useState, useContext, useRef, useEffect } from "react";
import {
  Edit,
  Trash2,
  MoreVertical,
  Share2,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { AuthContext } from "../../context/AuthContext";
import "./styles.css";

const CalculationActions = ({ calculation, onEdit, onDeleted }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, "calculations", calculation.id));
      setShowDeleteConfirm(false);
      if (onDeleted) onDeleted(calculation.id);
    } catch (error) {
      console.error("Erro ao excluir cálculo:", error);
      alert("Erro ao excluir cálculo. Tente novamente.");
    } finally {
      setIsDeleting(false);
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
        onClick={() => setShowMenu(!showMenu)}
        aria-label="Opções do cálculo"
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
              {/* <button className="action-item" onClick={handleShare}>
                <Share2 size={16} />
                <span>Compartilhar</span>
              </button> */}
              <button
                className="action-item delete"
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setShowMenu(false);
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

      {showDeleteConfirm && (
        <div className="delete-confirmation">
          <div className="delete-confirmation-content">
            <div className="delete-icon">
              <AlertTriangle size={24} />
            </div>
            <h3>Confirmar exclusão</h3>
            <p>
              Tem certeza que deseja excluir o cálculo "{calculation.name}"?
            </p>
            <p className="delete-warning">Esta ação não pode ser desfeita.</p>

            <div className="delete-actions">
              <button
                className="cancel-button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                className="confirm-button"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculationActions;
