"use client"

import { useState, useEffect, useContext } from "react"
import { Search, Filter, Loader2, AlertTriangle, X, FolderPlus, SearchX } from "lucide-react"
import { AuthContext } from "../../context/AuthContext"
import { AdminContext } from "../../context/AdminContext"
import { deleteDoc, doc } from "firebase/firestore"
import { db } from "../../services/firebaseConfig"
import CategoryActions from "../CategoryActions"
import EditCategory from "../EditCategory"
import EmptyState from "../ui/EmptyState"

const Categories = ({ categories, onSelect, selectedCategory, onCategoryUpdated, idPrefix = "" }) => {
  // Add this style for hiding scrollbar in category names
  const scrollbarHideStyle = {
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  }

  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCategories, setFilteredCategories] = useState(categories || [])
  const [filterOption, setFilterOption] = useState("all")
  const { user } = useContext(AuthContext)
  const { isAdmin } = useContext(AdminContext)

  // Estados para edição
  const [categoryToEdit, setCategoryToEdit] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

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

    // Aplicar busca por texto em categorias e cálculos
    if (searchTerm.trim() !== "") {
      const searchTermLower = searchTerm.toLowerCase()
      result = result.filter((category) => {
        // Busca no nome da categoria
        const categoryMatch = category.name.toLowerCase().includes(searchTermLower)
        
        // Busca nos cálculos da categoria
        const calculosMatch = category.calculos?.some(calculo => {
          return (
            (calculo.name || calculo.nome || "").toLowerCase().includes(searchTermLower) ||
            (calculo.description || calculo.descricao || "").toLowerCase().includes(searchTermLower) ||
            (calculo.tags || []).some(tag => tag.toLowerCase().includes(searchTermLower))
          )
        })

        return categoryMatch || calculosMatch
      })
    }

    setFilteredCategories(result)

    // Removida a seleção automática da categoria
  }, [categories, searchTerm, filterOption, onSelect])

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



  // Verificar se o usuário pode editar a categoria
  const canEditCategory = (category) => {
    return isAdmin || (user && category.createdBy === user.uid)
  }

  if (!categories || categories.length === 0) {
    return (
      <EmptyState
        type="category"
        title="Nenhuma categoria cadastrada"
        message="Clique no botão abaixo para adicionar uma nova categoria"
        actionLabel="Adicionar Categoria"
        onAction={() => window.location.href = '/categories/new'}
        className="mx-2"
      />
    )
  }

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-b-xl p-4 sm:p-5 lg:p-6">
      {/* Search and Filter Section */}
      <div className="mb-4 space-y-3 sm:space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200"
          />
          <input
            id={`${idPrefix}search-categories`}
            type="text"
            placeholder="Buscar categorias e cálculos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-900 bg-gray-50 transition-all duration-200 focus:outline-none focus:border-blue-600 focus:bg-white focus:shadow-lg focus:shadow-blue-100"
            aria-label="Buscar categorias"
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
              onClick={() => {
                setSearchTerm("")
                onSelect(null)
              }}
              aria-label="Limpar busca"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <Filter size={14} />
            
          </div>
          <select
            className="flex-1 sm:flex-none sm:min-w-[140px] px-3 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-900 cursor-pointer transition-all duration-200 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200"
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

      {/* Search Result Legend */}
      {searchTerm && (
        <div className="mb-3 text-sm text-green-600 font-medium">
          Categorias que contêm o cálculo pesquisado:
        </div>
      )}
      {/* Categories List */}
      <div className="flex-1 overflow-y-auto max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-100">
        <div className="space-y-2 pr-2">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, index) => (
              <div key={index} className="relative">
                <div
                  className={`flex items-center w-full p-3 sm:p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm hover:border-gray-300 ${
                    selectedCategory === category.name
                      ? "bg-blue-50 border-blue-500"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => onSelect(category.name)}
                >
                  {/* Category Info */}
                  <div className="flex-1 min-w-0 flex items-center justify-between ">
                     <div className="flex-1 min-w-0 pr-2 sm:max-w-[70%]">
                       <span 
                         className={`block overflow-x-auto font-medium text-sm sm:text-base transition-colors duration-200 overflow-x-auto scrollbar-none whitespace-nowrap pb-1 ${ 
                           selectedCategory === category.name
                             ? "text-blue-700"
                             : "text-gray-800 group-hover:text-blue-600"
                         }`}
                         style={{
                           scrollbarWidth: "none",
                           msOverflowStyle: "none",
                         }}
                       >
                         {category.name}
                       </span>
                     </div>
 
                     <div className="flex select-none items-center gap-2 sm:gap-3 flex-shrink-0">
                       {/* Count Badge */}
                       <span
                         className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-medium transition-all duration-200 ${ 
                           selectedCategory === category.name ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                         }`}
                       >
                         {category.calculos?.length || 0}
                       </span>

                       {/* Actions */}
                       {canEditCategory(category) && (
                         <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                           <CategoryActions 
                            category={category} 
                            onEdit={() => handleEditCategory(category)} 
                           />
                         </div>
                       )}
                     </div>
                   </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={searchTerm ? SearchX : FolderPlus}
              title={searchTerm ? "Nenhuma categoria encontrada" : "Nenhuma categoria disponível"}
              message={searchTerm
                ? "Tente ajustar sua busca ou filtros para encontrar o que procura"
                : isAdmin
                  ? "Não há categorias cadastradas. Crie sua primeira categoria para começar."
                  : "Não há categorias disponíveis no momento. Entre em contato com o administrador."}
              actionLabel={searchTerm ? "Limpar pesquisa" : isAdmin ? "Adicionar Categoria" : undefined}
              onAction={searchTerm ? () => setSearchTerm("") : isAdmin ? () => setShowCreateCategory(true) : undefined}
            />
          )}
        </div>
      </div>

      {/* Modal de edição de categoria */}
      {showEditModal && categoryToEdit && (
        <EditCategory
          category={categoryToEdit}
          onUpdate={handleUpdateCategory}
          onCancel={handleCloseEditModal}
        />
      )}


    </div>
  )
}

export default Categories
