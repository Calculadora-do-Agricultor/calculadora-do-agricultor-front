import React, { useState, useEffect, useContext } from "react"
import { Search, Filter, Loader2, AlertCircle, AlertTriangle } from "lucide-react"
import { AuthContext } from "../../context/AuthContext"
import { deleteDoc, doc } from "firebase/firestore"
import { db } from "../../services/firebaseConfig"
import CategoryActions from "../CategoryActions"
import EditCategory from "../EditCategory"
import "./styles.css"

const Categories = ({ categories, onSelect, selectedCategory, onCategoryUpdated, idPrefix = "" }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCategories, setFilteredCategories] = useState(categories || [])
  const [filterOption, setFilterOption] = useState("all")
  const { isAdmin, user } = useContext(AuthContext)
  
  // Estados para edição e exclusão
  const [categoryToEdit, setCategoryToEdit] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!categories) return
    
    let result = [...categories]
    
    // Aplicar filtro por quantidade de cálculos
    if (filterOption === "most") {
      result = result.sort((a, b) => (b.calculos?.length || 0) - (a.calculos?.length || 0))
    } else if (filterOption === "least") {
      result = result.sort((a, b) => (a.calculos?.length || 0) - (b.calculos?.length || 0))
    } else if (filterOption === "alphabetical") {
      result = result.sort((a, b) => a.name.localeCompare(b.name))
    }
    
    // Aplicar busca por texto
    if (searchTerm.trim() !== "") {
      result = result.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredCategories(result)
  }, [categories, searchTerm, filterOption])

  // Função para abrir o modal de edição
  const handleEditCategory = (category) => {
    setCategoryToEdit(category)
    setShowEditModal(true)
  }

  // Função para fechar o modal de edição
  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setCategoryToEdit(null)
  }

  // Função para atualizar a categoria
  const handleUpdateCategory = () => {
    setShowEditModal(false)
    setCategoryToEdit(null)
    // Notificar o componente pai para atualizar a lista de categorias
    if (onCategoryUpdated) {
      onCategoryUpdated()
    }
  }

  // Função para abrir o modal de exclusão
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category)
    setShowDeleteModal(true)
  }

  // Função para confirmar a exclusão
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return

    try {
      setIsDeleting(true)
      
      // Verificar se a categoria tem cálculos associados
      if (categoryToDelete.calculos && categoryToDelete.calculos.length > 0) {
        alert("Esta categoria possui cálculos associados e não pode ser excluída. Remova os cálculos primeiro.")
        setIsDeleting(false)
        setShowDeleteModal(false)
        setCategoryToDelete(null)
        return
      }
      
      // Excluir a categoria do Firestore
      await deleteDoc(doc(db, "categories", categoryToDelete.id))
      
      // Fechar o modal
      setShowDeleteModal(false)
      setCategoryToDelete(null)
      
      // Notificar o componente pai para atualizar a lista de categorias
      if (onCategoryUpdated) {
        onCategoryUpdated()
      }
    } catch (error) {
      console.error("Erro ao excluir categoria:", error)
      alert("Erro ao excluir categoria. Tente novamente.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Função para cancelar a exclusão
  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setCategoryToDelete(null)
  }

  // Verificar se o usuário pode editar a categoria
  const canEditCategory = (category) => {
    return isAdmin || (user && category.createdBy === user.uid)
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="categories-empty">
        <p>Nenhuma categoria disponível.</p>
      </div>
    )
  }

  return (
    <div className="categories-wrapper">
      <div className="categories-search">
        <div className="search-input-container">
          <Search size={18} className="search-icon" />
          <input
            id={`${idPrefix}search-categories`}
            type="text"
            placeholder="Buscar categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Buscar categorias"
          />
          {searchTerm && (
            <button 
              className="search-clear-button"
              onClick={() => setSearchTerm("")}
              aria-label="Limpar busca"
            >
              &times;
            </button>
          )}
        </div>
        
        <div className="filter-container">
          <div className="filter-label">
            <Filter size={14} />
            <span>Filtrar por:</span>
          </div>
          <select 
            className="filter-select"
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="alphabetical">Ordem alfabética</option>
            <option value="most">Mais cálculos</option>
            <option value="least">Menos cálculos</option>
          </select>
        </div>
      </div>
      
      <div className="categories-scroll-container">
        <div className="categories-container">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, index) => (
              <div
                key={index}
                className={`category-item-container ${selectedCategory === category.name ? "selected" : ""}`}
              >
                <div 
                  className="category-item"
                  onClick={() => onSelect(category.name)}
                >
                  <div className="category-info-wrapper">
                    <span className="category-name">{category.name}</span>
                    <span className="category-count-badge">{category.calculos?.length || 0}</span>
                  </div>
                  {selectedCategory === category.name && (
                    <span className="selected-indicator"></span>
                  )}
                </div>
                {canEditCategory(category) && (
                  <div className="category-actions-wrapper" onClick={(e) => e.stopPropagation()}>
                    <CategoryActions
                      category={category}
                      onEdit={() => handleEditCategory(category)}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="categories-empty">
              <p>Nenhuma categoria encontrada.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de edição de categoria */}
      {showEditModal && categoryToEdit && (
        <EditCategory
          category={categoryToEdit}
          onUpdate={handleUpdateCategory}
          onCancel={handleCloseEditModal}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && categoryToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <div className="delete-modal-icon">
                <AlertTriangle size={24} />
              </div>
              <h3>Confirmar Exclusão</h3>
            </div>
            <div className="delete-modal-body">
              <p>Tem certeza que deseja excluir a categoria <strong>{categoryToDelete.name}</strong>?</p>
              <p className="delete-warning">Esta ação não pode ser desfeita.</p>
            </div>
            <div className="delete-modal-footer">
              <button 
                className="cancel-button" 
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                className="delete-button" 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <span>Excluir</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories
