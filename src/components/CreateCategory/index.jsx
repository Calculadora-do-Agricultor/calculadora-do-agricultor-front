

import { useState } from "react"
import { collection, addDoc } from "firebase/firestore"
import { db } from "../../services/firebaseConfig"
import { X, Plus, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "../../context/ToastContext"
import "./styles.css"

const CreateCategory = ({ onCreate, onCancel }) => {
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [categoryImageUrl, setCategoryImageUrl] = useState("")
  const [categoryColor, setCategoryColor] = useState("#00418F")
  const [categoryTags, setCategoryTags] = useState([])
  const [newTag, setNewTag] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { success, error: toastError } = useToast()

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
        imageUrl: categoryImageUrl.trim(),
        color: categoryColor,
        tags: categoryTags,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      setCategoryName("")
      setCategoryDescription("")

      success(`Categoria criada com sucesso!`)
      if (onCreate) onCreate()
    } catch (err) {
      console.error("Erro ao criar categoria:", err)
      setError("Ocorreu um erro ao criar a categoria. Por favor, tente novamente.")
      toastError("Falha ao criar categoria. Tente novamente.")
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

          <div className="input-group">
            <label htmlFor="category-image-url" className="input-label">
              URL da Imagem da Categoria
            </label>
            <input
              id="category-image-url"
              type="url"
              placeholder="https://exemplo.com/imagem.jpg"
              value={categoryImageUrl}
              onChange={(e) => setCategoryImageUrl(e.target.value)}
              className="input-field"
              disabled={isSubmitting}
            />
            <p className="input-help">Insira a URL de uma imagem para representar esta categoria. Se a URL for inválida, um ícone padrão será exibido.</p>
          </div>

          <div className="input-group">
            <label htmlFor="category-color" className="input-label">
              Cor da Categoria
            </label>
            <input
              id="category-color"
              type="color"
              value={categoryColor}
              onChange={(e) => setCategoryColor(e.target.value)}
              className="input-field h-10"
              disabled={isSubmitting}
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              Tags/Badges
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {categoryTags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100">
                  {tag}
                  <button
                    type="button"
                    onClick={() => setCategoryTags(tags => tags.filter((_, i) => i !== index))}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Adicionar nova tag"
                className="input-field flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newTag.trim()) {
                    e.preventDefault();
                    setCategoryTags([...categoryTags, newTag.trim()]);
                    setNewTag('');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newTag.trim()) {
                    setCategoryTags([...categoryTags, newTag.trim()]);
                    setNewTag('');
                  }
                }}
                className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={!newTag.trim()}
              >
                <Plus size={20} />
              </button>
            </div>
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
