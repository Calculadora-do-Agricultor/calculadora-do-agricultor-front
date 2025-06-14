import { useState, useEffect } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../../services/firebaseConfig"
import { X, Save, AlertCircle, Loader2, Trash2 } from "lucide-react"
import "./styles.css"

const EditCategory = ({ category, onUpdate, onCancel, onDelete }) => {
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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

      if (onUpdate) onUpdate()
    } catch (err) {
      console.error("Erro ao atualizar categoria:", err)
      setError("Ocorreu um erro ao atualizar a categoria. Por favor, tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
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
            <label htmlFor="category-name" className="input-label">
              Nome da Categoria <span className="required">*</span>
            </label>
            <input
              id="category-name"
              type="text"
              placeholder="Ex: Adubação, Irrigação, Plantio..."
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="input-field"
              disabled={isSubmitting}
            />
          </div>

          <div className="input-group">
            <label htmlFor="category-description" className="input-label">
              Descrição da Categoria
            </label>
            <textarea
              id="category-description"
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
              onClick={() => onDelete && onDelete(category)} 
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