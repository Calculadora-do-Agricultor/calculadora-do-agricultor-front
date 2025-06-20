import { useEffect, useState, useContext } from "react"
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore"
import { db, auth } from "../../services/firebaseConfig"
import { useAuthState } from "react-firebase-hooks/auth"
import { AuthContext } from "../../context/AuthContext"
import {
  ArrowRight,
  Search,
  Calendar,
  Clock,
  LayoutGrid,
  ListIcon,
  SlidersHorizontal,
  Share2,
  ChevronDown,
  AlertCircle,
  Eye,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import CalculationModal  from "../CalculationModal"
import { Tooltip } from "../ui/Tooltip"
import CalculationActions from "../CalculationActions"
import "./styles.css"

const CalculationList = ({
  category,
  searchTerm = "",
  viewMode = "grid",
  sortOption: initialSortOption = "name_asc",
  complexityFilters = [],
  onEditCalculation,
}) =>{
  const [user] = useAuthState(auth)
  const [isAdmin, setIsAdmin] = useState(false)

  // Usar o isAdmin do AuthContext em vez de verificar localmente
  const { isAdmin: contextIsAdmin } = useContext(AuthContext)
  
  useEffect(() => {
    setIsAdmin(contextIsAdmin)
  }, [contextIsAdmin])
  const [calculations, setCalculations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filteredCalculations, setFilteredCalculations] = useState([])
  const [selectedCalculation, setSelectedCalculation] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sortOption, setSortOption] = useState(initialSortOption)
  const [showSortOptions, setShowSortOptions] = useState(false)
  
  // Estados para o modal de exclusão global
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [calculationToDelete, setCalculationToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  // Efeito para bloquear/desbloquear scroll do body quando o modal de exclusão está aberto
  useEffect(() => {
    if (showDeleteModal) {
      // Bloqueia o scroll do body quando o modal está aberto
      document.body.style.overflow = 'hidden'
    } else {
      // Restaura o scroll do body quando o modal é fechado
      document.body.style.overflow = 'unset'
      // Limpa os estados de erro e sucesso quando o modal é fechado
      setDeleteError(null)
      setDeleteSuccess(false)
    }

    // Cleanup function para garantir que o scroll seja restaurado
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showDeleteModal])


  useEffect(() => {
    const fetchCalculations = async () => {
      try {
        setLoading(true)
        setError(null)

        const q = query(collection(db, "calculations"), where("category", "==", category))
        const querySnapshot = await getDocs(q)

        const calculationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Add default values for missing fields
          views: doc.data().views || 0,
          createdAt: doc.data().createdAt || { toDate: () => new Date() },
          updatedAt: doc.data().updatedAt || { toDate: () => new Date() },
          tags: doc.data().tags || [],
        }))

        setCalculations(calculationsData)
      } catch (err) {
        console.error("Erro ao buscar cálculos:", err)
        setError("Não foi possível carregar os cálculos. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    if (category) {
      fetchCalculations()
    }
  }, [category])



  // Filter calculations based on search term
  useEffect(() => {
    if (!calculations.length) {
      setFilteredCalculations([])
      return
    }

    let filtered = [...calculations]

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter((calc) => {
        const name = calc.name || calc.nome || ""
        const description = calc.description || calc.descricao || ""
        const tags = calc.tags || []

        return (
          name.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower) ||
          tags.some((tag) => tag.toLowerCase().includes(searchLower))
        )
      })
    }

    // Apply sorting
    filtered = sortCalculations(filtered, sortOption)

    setFilteredCalculations(filtered)
  }, [searchTerm, calculations, sortOption])

  const sortCalculations = (calcs, option) => {
    switch (option) {
      case "name_asc":
        return [...calcs].sort((a, b) => (a.name || a.nome || "").localeCompare(b.name || b.nome || ""))
      case "name_desc":
        return [...calcs].sort((a, b) => (b.name || b.nome || "").localeCompare(a.name || a.nome || ""))
      case "date_newest":
        return [...calcs].sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
      case "date_oldest":
        return [...calcs].sort((a, b) => a.createdAt.toDate() - b.createdAt.toDate())
      case "views_desc":
        return [...calcs].sort((a, b) => (b.views || 0) - (a.views || 0))
      default:
        return calcs
    }
  }



  const getTimeAgo = (date) => {
    const now = new Date()
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return "Hoje"
    if (diffInDays === 1) return "Ontem"
    if (diffInDays < 7) return `${diffInDays} dias atrás`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} meses atrás`
    return `${Math.floor(diffInDays / 365)} anos atrás`
  }

  // Função para abrir o modal de exclusão
  const handleDeleteClick = (calculation) => {
    setCalculationToDelete(calculation)
    setShowDeleteModal(true)
  }

  // Função para confirmar a exclusão
  const handleConfirmDelete = async () => {
    if (!calculationToDelete) return

    try {
      setIsDeleting(true)
      setDeleteError(null)
      
      // Adicionar um pequeno atraso para mostrar o estado de loading
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await deleteDoc(doc(db, "calculations", calculationToDelete.id))
      
      // Remover o cálculo da lista
      setFilteredCalculations((prev) => prev.filter((calc) => calc.id !== calculationToDelete.id))
      setCalculations((prev) => prev.filter((calc) => calc.id !== calculationToDelete.id))
      
      // Mostrar mensagem de sucesso antes de fechar o modal
      setDeleteSuccess(true)
      
      // Fechar o modal após um breve delay para mostrar a mensagem de sucesso
      setTimeout(() => {
        setShowDeleteModal(false)
        setCalculationToDelete(null)
      }, 1500)
    } catch (error) {
      console.error("Erro ao excluir cálculo:", error)
      setDeleteError("Não foi possível excluir o cálculo. Tente novamente.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Função para cancelar a exclusão
  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setCalculationToDelete(null)
  }

  // Skeleton loading component
  const CalculationSkeleton = () => (
    <div className="calculation-card is-loading">
      <div className="calculation-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-description"></div>
        <div className="skeleton-description"></div>
        <div className="skeleton-description" style={{ width: "70%" }}></div>
      </div>
      <div className="calculation-footer">
        <div className="skeleton-button"></div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="calculations-container">
        <div className="calculations-header">
          <div className="calculations-count">
            <div className="skeleton-text"></div>
          </div>
          <div className="calculations-actions">
            <div className="skeleton-action"></div>
            <div className="skeleton-action"></div>
          </div>
        </div>
        <div className={`calculations-${viewMode}`}>
          {Array(6)
            .fill()
            .map((_, index) => (
              <CalculationSkeleton key={index} />
            ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="calculations-error">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Erro ao carregar cálculos</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (filteredCalculations.length === 0) {
    return (
      <div className="calculations-empty">
        <Search size={48} className="text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {searchTerm ? "Nenhum resultado encontrado" : "Nenhum cálculo disponível"}
        </h3>
        <p className="text-gray-600 mb-4">
          {searchTerm
            ? `Não encontramos nenhum cálculo para "${searchTerm}" nesta categoria.`
            : "Não há cálculos disponíveis para esta categoria no momento."}
        </p>
        {searchTerm && (
          <button onClick={() => window.location.reload()} className="text-blue-600 hover:text-blue-800 font-medium">
            Limpar pesquisa
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="calculations-container">
      <div className="calculations-header">
        <div className="calculations-count">
          <span>
            {filteredCalculations.length} cálculo{filteredCalculations.length !== 1 ? "s" : ""} encontrado
            {filteredCalculations.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="calculations-actions">
          <div className="sort-dropdown">
            <button
              className="sort-button"
              onClick={() => setShowSortOptions(!showSortOptions)}
              aria-expanded={showSortOptions}
              aria-haspopup="true"
            >
              <SlidersHorizontal size={16} />
              <span>Ordenar</span>
              <ChevronDown size={14} className={`transition-transform ${showSortOptions ? "rotate-180" : ""}`} />
            </button>
            {showSortOptions && (
              <div className="sort-options">
                <button
                  className={sortOption === "name_asc" ? "active" : ""}
                  onClick={() => {
                    setSortOption("name_asc")
                    setShowSortOptions(false)
                  }}
                >
                  Nome (A-Z)
                </button>
                <button
                  className={sortOption === "name_desc" ? "active" : ""}
                  onClick={() => {
                    setSortOption("name_desc")
                    setShowSortOptions(false)
                  }}
                >
                  Nome (Z-A)
                </button>
                <button
                  className={sortOption === "date_newest" ? "active" : ""}
                  onClick={() => {
                    setSortOption("date_newest")
                    setShowSortOptions(false)
                  }}
                >
                  Mais recentes
                </button>
                <button
                  className={sortOption === "date_oldest" ? "active" : ""}
                  onClick={() => {
                    setSortOption("date_oldest")
                    setShowSortOptions(false)
                  }}
                >
                  Mais antigos
                </button>
                <button
                  className={sortOption === "views_desc" ? "active" : ""}
                  onClick={() => {
                    setSortOption("views_desc")
                    setShowSortOptions(false)
                  }}
                >
                  Mais visualizados
                </button>
              </div>
            )}
          </div>
          <div className="view-toggle">
            <Tooltip content="Visualização em grade">
              <button
                className={`view-button ${viewMode === "grid" ? "active" : ""}`}
                aria-label="Visualização em grade"
                onClick={() => window.dispatchEvent(new CustomEvent("changeViewMode", { detail: "grid" }))}
              >
                <LayoutGrid size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Visualização em lista">
              <button
                className={`view-button ${viewMode === "list" ? "active" : ""}`}
                aria-label="Visualização em lista"
                onClick={() => window.dispatchEvent(new CustomEvent("changeViewMode", { detail: "list" }))}
              >
                <ListIcon size={16} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className={`calculations-${viewMode}`}>
        {filteredCalculations.map((calculation) => (
          <div key={calculation.id} className="calculation-card">
            {(isAdmin || (user && calculation.createdBy === user.uid)) && (
              <div className="calculation-actions-wrapper">
                <CalculationActions
                  calculation={calculation}
                  onEdit={onEditCalculation}
                  onDelete={() => handleDeleteClick(calculation)}
                />
              </div>
            )}


            <div className="calculation-content">
              <div className="calculation-header">
                <h3 className="calculation-title">{calculation.name || calculation.nome}</h3>
              </div>

              <p className="calculation-description">
                {calculation.description || calculation.descricao || "Sem descrição disponível."}
              </p>

              {calculation.tags && calculation.tags.length > 0 && (
                <div className="calculation-tags">
                  {calculation.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="calculation-tag">
                      {tag}
                    </span>
                  ))}
                  {calculation.tags.length > 3 && (
                    <span className="calculation-tag-more">+{calculation.tags.length - 3}</span>
                  )}
                </div>
              )}

              <div className="calculation-meta">
                <div className="meta-item">
                  <Calendar size={14} />
                  <span>{calculation.createdAt.toDate().toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <Clock size={14} />
                  <span>{getTimeAgo(calculation.updatedAt.toDate())}</span>
                </div>
                <div className="meta-item">
                  <Eye size={14} />
                  <span>{calculation.views || 0} visualizações</span>
                </div>
              </div>
            </div>

            <div className="calculation-footer">
              <div className="calculation-actions">

                <Tooltip content="Compartilhar">
                  <button
                    className="action-button share-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Implementação de compartilhamento
                      if (navigator.share) {
                        navigator.share({
                          title: calculation.name || calculation.nome,
                          text: calculation.description || calculation.descricao,
                          url: window.location.href,
                        })
                      } else {
                        alert("Compartilhamento não suportado neste navegador")
                      }
                    }}
                    aria-label="Compartilhar"
                  >
                    <Share2 size={16} />
                  </button>
                </Tooltip>
              </div>

              <button
                className="details-button"
                onClick={() => {
                  setSelectedCalculation(calculation)
                  setIsModalOpen(true)
                }}
                aria-label="Abrir cálculo"
              >
                <span>Abrir cálculo</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Cálculo */}
      {selectedCalculation && (
        <CalculationModal
          calculation={selectedCalculation}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Modal de Exclusão Global */}
      {showDeleteModal && calculationToDelete && (
        <div className="delete-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="delete-modal">
            {deleteSuccess ? (
              <div className="delete-modal-success">
                <CheckCircle className="delete-modal-success-icon" size={48} />
                <h2 id="delete-modal-title">Cálculo excluído</h2>
                <p>O cálculo foi excluído com sucesso.</p>
              </div>
            ) : (
              <>
                <div className="delete-modal-header">
                  <AlertTriangle className="delete-modal-icon" size={48} />
                  <h2 id="delete-modal-title">Confirmar exclusão</h2>
                </div>
                <div className="delete-modal-content">
                  <p>
                    Tem certeza que deseja excluir o cálculo <strong>"{calculationToDelete.name || calculationToDelete.nome}"</strong>?
                  </p>
                  <p className="delete-modal-warning">
                    Esta ação não pode ser desfeita.
                  </p>
                  
                  {deleteError && (
                    <div className="delete-modal-error">
                      <AlertCircle size={16} />
                      <span>{deleteError}</span>
                    </div>
                  )}
                </div>
                <div className="delete-modal-actions">
                  <button 
                    className="delete-modal-cancel" 
                    onClick={handleCancelDelete}
                    disabled={isDeleting}
                    aria-label="Cancelar exclusão"
                  >
                    Cancelar
                  </button>
                  <button 
                    className="delete-modal-confirm" 
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    aria-label="Confirmar exclusão"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Excluindo...</span>
                      </>
                    ) : (
                      "Sim, excluir"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
export default CalculationList;