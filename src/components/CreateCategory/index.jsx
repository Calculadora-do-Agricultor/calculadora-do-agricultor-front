

import { useState } from "react"
import { collection, addDoc } from "firebase/firestore"
import { db } from "../../services/firebaseConfig"
import { X, Plus, AlertCircle, Loader2 } from "lucide-react"
import "./styles.css"

const CreateCategory = ({ onCreate, onCancel }) => {
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateCategory = async () => {
    // Validação
    if (!categoryName.trim()) {
      setError("O nome da categoria é obrigatório.")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      // Usando addDoc para gerar um ID automático
      await addDoc(collection(db, "categories"), {
        name: categoryName.trim(),
        description: categoryDescription.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      setCategoryName("")
      setCategoryDescription("")

      if (onCreate) onCreate()
    } catch (err) {
      console.error("Erro ao criar categoria:", err)
      setError("Ocorreu um erro ao criar a categoria. Por favor, tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="create-category-modal">
      <div className="modal-content">
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <Plus size={20} />
            </div>
            <h2 className="modal-title">Criar Nova Categoria</h2>
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
          <button onClick={onCancel} className="cancel-button" disabled={isSubmitting} type="button">
            Cancelar
          </button>
          <button onClick={handleCreateCategory} className="create-button" disabled={isSubmitting} type="button">
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Criando...</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Criar Categoria</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateCategory
