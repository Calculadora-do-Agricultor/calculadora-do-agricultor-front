

import { useState } from "react"
import { collection, addDoc } from "firebase/firestore"
import { db } from "../../services/firebaseConfig"
import { X, Plus, AlertCircle, Loader2, Tag } from "lucide-react"
import { useToast } from "../../context/ToastContext"
import "./styles.css"

// Configuration constants for easy future updates
const CATEGORY_NAME_MAX = 50
const CATEGORY_DESCRIPTION_MAX = 150
const MAX_TAGS = 3
const TAG_MAX_LENGTH = 32

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

    if (categoryName.length > CATEGORY_NAME_MAX) {
      setError(`O nome da categoria deve ter no máximo ${CATEGORY_NAME_MAX} caracteres.`)
      return
    }

    if (categoryDescription.length > CATEGORY_DESCRIPTION_MAX) {
      setError(`A descrição da categoria deve ter no máximo ${CATEGORY_DESCRIPTION_MAX} caracteres.`)
      return
    }

    if (categoryTags.length > MAX_TAGS) {
      setError(`Você pode adicionar no máximo ${MAX_TAGS} tags.`)
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
              <span className={`ml-2 text-sm ${categoryName.length > CATEGORY_NAME_MAX ? 'text-red-500' : 'text-gray-500'}`}>
                {categoryName.length} / {CATEGORY_NAME_MAX}
              </span>
            </label>
            <input
              id="category-name"
              type="text"
              placeholder="Ex: Adubação, Irrigação, Plantio..."
              value={categoryName}
              onChange={(e) => {
                if (e.target.value.length <= CATEGORY_NAME_MAX) {
                  setCategoryName(e.target.value)
                }
              }}
              className={`input-field ${categoryName.length > CATEGORY_NAME_MAX ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
              maxLength={CATEGORY_NAME_MAX}
            />
          </div>

          <div className="input-group">
            <label htmlFor="category-description" className="input-label">
              Descrição da Categoria
              <span className={`ml-2 text-sm ${categoryDescription.length > CATEGORY_DESCRIPTION_MAX ? 'text-red-500' : 'text-gray-500'}`}>
                {categoryDescription.length} / {CATEGORY_DESCRIPTION_MAX}
              </span>
            </label>
            <textarea
              id="category-description"
              placeholder="Descreva o propósito desta categoria de cálculos..."
              value={categoryDescription}
              onChange={(e) => {
                if (e.target.value.length <= CATEGORY_DESCRIPTION_MAX) {
                  setCategoryDescription(e.target.value)
                }
              }}
              className={`input-field textarea-field ${categoryDescription.length > CATEGORY_DESCRIPTION_MAX ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
              rows={4}
              maxLength={CATEGORY_DESCRIPTION_MAX}
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
              <span className={`ml-2 text-sm ${categoryTags.length >= MAX_TAGS ? 'text-red-500' : 'text-gray-500'}`}>
                {categoryTags.length} / {MAX_TAGS}
              </span>
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
              {categoryTags.length === 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-gray-400 border border-dashed border-gray-300 select-none">
                <Tag size={14} className="mr-1" />
                Sem tags
              </span>
            )}
            </div>
            {categoryTags.length >= MAX_TAGS && (
              <p className="text-sm text-amber-600 mb-2 flex items-center gap-1">
                <AlertCircle size={14} />
                Limite máximo de {MAX_TAGS} tags atingido.
              </p>
            )}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder={categoryTags.length >= MAX_TAGS ? "Remova uma tag para adicionar outra" : "Adicionar nova tag"}
                className={`input-field flex-1 min-w-0 ${categoryTags.length >= MAX_TAGS ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={categoryTags.length >= MAX_TAGS || isSubmitting}
                maxLength={TAG_MAX_LENGTH}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newTag.trim() && categoryTags.length < MAX_TAGS) {
                    e.preventDefault();
                    setCategoryTags([...categoryTags, newTag.trim()]);
                    setNewTag('');
                  }
                }}
              />
              <span className={`text-sm ${newTag.length > TAG_MAX_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                {newTag.length} / {TAG_MAX_LENGTH}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (newTag.trim() && categoryTags.length < MAX_TAGS) {
                    setCategoryTags([...categoryTags, newTag.trim()]);
                    setNewTag('');
                  }
                }}
                className={`px-4 py-2 rounded-md transition-colors ${
                  categoryTags.length >= MAX_TAGS || !newTag.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                disabled={!newTag.trim() || categoryTags.length >= MAX_TAGS}
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
