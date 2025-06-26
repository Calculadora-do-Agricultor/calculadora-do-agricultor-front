import { useState, useEffect } from "react"
import { doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "../../services/firebaseConfig"
import { X, Save, AlertCircle, Loader2, Trash2 } from "lucide-react"
import { useToast } from "../../context/ToastContext"
import "./styles.css"

const EditCategory = ({ category, onUpdate, onCancel }) => {
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const { success, error: toastError } = useToast()

  useEffect(() => {
    if (category) {
      setCategoryName(category.name || "")
      setCategoryDescription(category.description || "")
    }
  }, [category])

  const handleUpdateCategory = async () => {
    // Validação
    if (!categoryName.trim()) {
      setError("O nome da categoria é obrigatório.")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      // Atualizar a categoria no Firestore
      const categoryRef = doc(db, "categories", category.id)
      await updateDoc(categoryRef, {
        name: categoryName.trim(),
        description: categoryDescription.trim(),
        updatedAt: new Date(),
      })

      success(`Categoria "${categoryName}" atualizada com sucesso!`)
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error("Erro ao atualizar categoria:", err)
      setError("Ocorreu um erro ao atualizar a categoria. Por favor, tente novamente.")
      toastError("Falha ao atualizar categoria. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    // Verificar se a categoria tem cálculos associados
    if (category.calculos && category.calculos.length > 0) {
      setError("Esta categoria possui cálculos associados e não pode ser excluída.");
      toastError("Não é possível excluir uma categoria com cálculos associados.");
      setShowConfirmDelete(false); // Fechar o modal de confirmação
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteDoc(doc(db, "categories", category.id));
      success(`Categoria "${category.name}" excluída com sucesso!`);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Erro ao excluir categoria:", err);
      setError("Ocorreu um erro ao excluir a categoria.");
      toastError("Falha ao excluir categoria. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmDelete) {
    return (
      <div className="edit-category-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Confirmar Exclusão</h2>
          </div>
          <div className="modal-body">
            <p>Tem certeza de que deseja excluir a categoria <strong>{category.name}</strong>? Esta ação não pode ser desfeita.</p>
          </div>
          <div className="modal-footer">
            <button onClick={() => setShowConfirmDelete(false)} className="cancel-button">Cancelar</button>
            <button onClick={handleDelete} className="delete-button">Excluir</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-category-modal">
      <div className="modal-content">
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <Save size={20} />
            </div>
            <h2 className="modal-title">Editar Categoria</h2>
          </div>
          <button onClick={onCancel} className="close-button" aria-label="Fechar modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="input-group">
            <label htmlFor="edit-category-name" className="input-label">
              Nome da Categoria <span className="required">*</span>
            </label>
            <input
              id="edit-category-name"
              type="text"
              placeholder="Ex: Adubação, Irrigação, Plantio..."
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="input-field"
              disabled={isSubmitting}
            />
          </div>

          <div className="input-group">
            <label htmlFor="edit-category-description" className="input-label">
              Descrição da Categoria
            </label>
            <textarea
              id="edit-category-description"
              placeholder="Descreva o propósito desta categoria de cálculos..."
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              className="input-field textarea-field"
              disabled={isSubmitting}
              rows={4}
            />
            <p className="input-help">Uma boa descrição ajuda os usuários a entenderem o propósito desta categoria.</p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="modal-footer-left">
            <button 
              onClick={() => setShowConfirmDelete(true)} 
              className="delete-button" 
              disabled={isSubmitting} 
              type="button"
              aria-label="Excluir categoria"
            >
              <Trash2 size={16} />
              <span>Excluir</span>
            </button>
          </div>
          <div className="modal-footer-right">
            <button onClick={onCancel} className="cancel-button" disabled={isSubmitting} type="button">
              Cancelar
            </button>
            <button onClick={handleUpdateCategory} className="update-button" disabled={isSubmitting} type="button">
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Atualizando...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditCategory