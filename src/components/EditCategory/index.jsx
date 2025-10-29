import { useState, useEffect } from "react"
import { doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "../../services/firebaseConfig"
import { X, Save, AlertCircle, Loader2, Trash2, Plus, Tag } from "lucide-react"
import { useToast } from "../../context/ToastContext"
import "./styles.css"

// Configuration constants for easy future updates
const CATEGORY_NAME_MAX = 50
const CATEGORY_DESCRIPTION_MAX = 150
const MAX_TAGS = 3
const TAG_MAX_LENGTH = 32

const EditCategory = ({ category, onUpdate, onCancel }) => {
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [categoryImageUrl, setCategoryImageUrl] = useState("")
  const [categoryColor, setCategoryColor] = useState("#00418F")
  const [categoryTags, setCategoryTags] = useState([])
  const [newTag, setNewTag] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const { success, error: toastError } = useToast()

  useEffect(() => {
    if (category) {
      setCategoryName(category.name || "")
      setCategoryDescription(category.description || "")
      setCategoryImageUrl(category.imageUrl || "")
      setCategoryColor(category.color || "#00418F")
      setCategoryTags(category.tags || [])
    }
  }, [category])

  const handleUpdateCategory = async () => {
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

      // Atualizar a categoria no Firestore
      const categoryRef = doc(db, "categories", category.id)
      await updateDoc(categoryRef, {
        name: categoryName.trim(),
        description: categoryDescription.trim(),
        imageUrl: categoryImageUrl.trim(),
        color: categoryColor,
        tags: categoryTags,
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
              <span className={`ml-2 text-sm ${categoryName.length > CATEGORY_NAME_MAX ? 'text-red-500' : 'text-gray-500'}`}>
                {categoryName.length} / {CATEGORY_NAME_MAX}
              </span>
            </label>
            <input
              id="edit-category-name"
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
            <label htmlFor="edit-category-description" className="input-label">
              Descrição da Categoria
              <span className={`ml-2 text-sm ${categoryDescription.length > CATEGORY_DESCRIPTION_MAX ? 'text-red-500' : 'text-gray-500'}`}>
                {categoryDescription.length} / {CATEGORY_DESCRIPTION_MAX}
              </span>
            </label>
            <textarea
              id="edit-category-description"
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
                placeholder={categoryTags.length >= MAX_TAGS ? "Remova uma tag para adicionar outra" : "Adicionar nova tag"}
                className={`input-field flex-1 min-w-0 ${categoryTags.length >= MAX_TAGS ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
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
                disabled={!newTag.trim() || categoryTags.length >= MAX_TAGS || isSubmitting}
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