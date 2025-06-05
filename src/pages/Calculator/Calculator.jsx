

import { useState, useEffect, useRef, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthState } from "react-firebase-hooks/auth"
import { getDocs, collection, getDoc, doc, query, where } from "firebase/firestore"
import { AuthContext } from "../../context/AuthContext"
import {
  PlusCircle,
  X,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Sparkles,
  Info,
  CalculatorIcon,
  BookOpen,
  Users,
  ChevronDown,
  Loader2,
} from "lucide-react"
import { auth, db } from "../../services/firebaseConfig"
import { CalculationList, Categories, CreateCategory, EditCalculation } from "@/components"
import logoClara from '@/assets/logoClara.svg';
import "./Calculator.css"

export default function Calculator() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [user] = useAuthState(auth)
  const { isAdmin } = useContext(AuthContext)
  const [showOptions, setShowOptions] = useState(false)
  const [showCreateCategory, setShowCreateCategory] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("grid") // grid ou list
  const [showFilters, setShowFilters] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const [userCount, setUserCount] = useState(0)
  const [showUserCount, setShowUserCount] = useState(false)
  const searchInputRef = useRef(null)
  const navigate = useNavigate()

  const [showEditCalculation, setShowEditCalculation] = useState(false)
  const [calculationToEdit, setCalculationToEdit] = useState(null)

  const [currentSortOption, setCurrentSortOption] = useState("name_asc")
  const [selectedComplexities, setSelectedComplexities] = useState([])

  const fetchCategorias = async () => {
    try {
      setLoading(true)
      const categoriasSnapshot = await getDocs(collection(db, "categories"))

      const categoriasComCalculos = await Promise.all(
        categoriasSnapshot.docs.map(async (doc) => {
          const categoria = { id: doc.id, ...doc.data() }

          // Busca todos os cálculos que pertencem a esta categoria
          const calculosSnapshot = await getDocs(
            query(collection(db, "calculations"), where("category", "==", categoria.name)),
          )

          const calculos = calculosSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))

          return { ...categoria, calculos }
        }),
      )

      setCategorias(categoriasComCalculos)

      // Seleciona a primeira categoria por padrão se não houver nenhuma selecionada
      if (categoriasComCalculos.length > 0 && !categoriaSelecionada) {
        setCategoriaSelecionada(categoriasComCalculos[0].name)
      }


    } catch (error) {
      console.error("Erro ao buscar categorias com cálculos:", error)
    } finally {
      setLoading(false)
    }
  }



  // Atualizar a exibição da contagem de usuários com base no status de admin
  useEffect(() => {
    setShowUserCount(isAdmin)
    // Apenas buscar contagem de usuários se for admin
    if (isAdmin) {
      fetchUserCount()
    }
  }, [isAdmin])

  useEffect(() => {
    fetchCategorias()

    // Escutar eventos de mudança de modo de visualização
    const handleViewModeChange = (event) => {
      setViewMode(event.detail)
    }

    window.addEventListener("changeViewMode", handleViewModeChange)

    return () => {
      window.removeEventListener("changeViewMode", handleViewModeChange)
    }
  }, [user])

  // Função para focar no campo de pesquisa quando pressionar Ctrl+K ou Command+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Handle edit calculation
  const handleEditCalculation = (calculation) => {
    setCalculationToEdit(calculation)
    setShowEditCalculation(true)
  }

  // Total de cálculos em todas as categorias
  const totalCalculos = categorias.reduce((total, cat) => total + (cat.calculos?.length || 0), 0)

  // Encontrar a categoria selecionada
  const categoriaAtual = categorias.find((cat) => cat.name === categoriaSelecionada)





  const fetchUserCount = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"))
      setUserCount(usersSnapshot.size)
    } catch (error) {
      console.error("Erro ao buscar contagem de usuários:", error)
      setUserCount(0)
    }
  }

  return (
    <div className="calculator-page">
      {/* Menu móvel */}
      {showMobileMenu && (
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <h3>Menu</h3>
            <button onClick={() => setShowMobileMenu(false)} aria-label="Fechar menu">
              <X size={24} />
            </button>
          </div>
          <div className="mobile-menu-content">
            <div className="mobile-menu-section">
              <h4>Categorias</h4>
              <ul className="mobile-categories">
                {categorias.map((categoria) => (
                  <li key={categoria.id}>
                    <button
                      className={categoriaSelecionada === categoria.name ? "active" : ""}
                      onClick={() => {
                        setCategoriaSelecionada(categoria.name)
                        setShowMobileMenu(false)
                      }}
                    >
                      {categoria.name}
                      <ChevronRight size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="main-content">
        {/* Banner principal */}
        <div className="main-banner">
          <div className="banner-content">
            <h1>Calculadora do Agricultor</h1>
            <p>
              Ferramentas de cálculo especializadas para otimizar suas atividades agrícolas e aumentar sua
              produtividade.
            </p>
            <div className="banner-stats">
              <div className="stat-item">
                <div className="stat-icon">
                  <CalculatorIcon size={20} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{totalCalculos}</span>
                  <span className="stat-label">Cálculos</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <BookOpen size={20} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{categorias.length}</span>
                  <span className="stat-label">Categorias</span>
                </div>
              </div>
              {showUserCount && (
                <div className="stat-item">
                  <div className="stat-icon">
                    <Users size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{userCount}</span>
                    <span className="stat-label">Usuários</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="banner-image">
            <img src={logoClara} alt="Ilustração de calculadora" />
          </div>
        </div>



        {/* Conteúdo principal com sidebar e lista de cálculos */}
        <div className="content-container" id="calculations-list">
          {/* Sidebar com categorias */}
          <div className="sidebar">
            {loading ? (
              <div className="sidebar-loading">
                <div className="skeleton-header"></div>
                <div className="skeleton-item"></div>
                <div className="skeleton-item"></div>
                <div className="skeleton-item"></div>
              </div>
            ) : (
              <>
                <div className="categories-container">
                  <div className="categories-header">
                    <h2>Categorias</h2>
                  </div>
                  <Categories
                    categories={categorias}
                    onSelect={(category) => {
                      setCategoriaSelecionada(category)
                    }}
                    selectedCategory={categoriaSelecionada}
                  />
                </div>
              </>
            )}
          </div>

          {/* Conteúdo principal */}
          <div className="main-area">
            {loading ? (
              <div className="main-area-loading">
                <div className="skeleton-header"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-grid">
                  <div className="skeleton-card"></div>
                  <div className="skeleton-card"></div>
                  <div className="skeleton-card"></div>
                  <div className="skeleton-card"></div>
                </div>
              </div>
            ) : !categoriaSelecionada ? (
              <div className="select-category-message">
                <div className="message-icon">
                  <ChevronRight size={48} />
                </div>
                <h3>Selecione uma categoria</h3>
                <p>Escolha uma categoria no painel lateral para ver os cálculos disponíveis.</p>
              </div>
            ) : (
              <>
                <div className="category-header">
                  <div className="category-info">
                    <h2>{categoriaSelecionada}</h2>
                    <p>Explore nossa coleção de cálculos e conversores para {categoriaSelecionada.toLowerCase()}.</p>
                  </div>
                  {categoriaAtual?.calculos?.length > 0 && (
                    <div className="category-badge">
                      <CalculatorIcon size={16} />
                      <span>
                        {categoriaAtual.calculos.length} cálculo{categoriaAtual.calculos.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Breadcrumbs */}
                <div className="breadcrumbs">
                  <span>Início</span>
                  <ChevronRight size={16} />
                  <span>Calculadora</span>
                  <ChevronRight size={16} />
                  <span className="current">{categoriaSelecionada}</span>
                </div>

                {/* Lista de cálculos */}
                <CalculationList
                  category={categoriaSelecionada}
                  searchTerm={searchTerm}
                  viewMode={viewMode}
                  sortOption={currentSortOption}
                  complexityFilters={selectedComplexities}
                  onEditCalculation={handleEditCalculation}
                />
              </>
            )}
          </div>
        </div>

        {/* Seção de recursos */}
        {/* <div className="resources-section">
          <div className="resources-content">
            <h2>Recursos Adicionais</h2>
            <p>Além dos cálculos, oferecemos recursos complementares para auxiliar nas suas atividades agrícolas.</p>
            <button className="resources-button">
              <span>Explorar recursos</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="resources-illustration">
            <Sparkles size={48} className="sparkles-icon" />
          </div>
        </div> */}

    
      </div>

      {/* Interface de Edição de Cálculo */}
      {showEditCalculation && calculationToEdit && (
        <EditCalculation
          calculation={calculationToEdit}
          onUpdate={() => {
            fetchCategorias() // Recarrega os dados após a atualização
            setShowEditCalculation(false)
            setCalculationToEdit(null)
          }}
          onCancel={() => {
            setShowEditCalculation(false)
            setCalculationToEdit(null)
          }}
        />
      )}

      {/* Área de administração */}
      {isAdmin && (
        <>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="admin-button"
            aria-label="Opções de administrador"
          >
            {showOptions ? <X size={24} /> : <PlusCircle size={24} />}
          </button>

          {showOptions && (
            <div className="admin-menu">
              <div className="admin-menu-header">
                <h3>Opções de Administrador</h3>
              </div>
              <div className="admin-menu-options">
                <button
                  onClick={() => {
                    setShowCreateCategory(true)
                    setShowOptions(false)
                  }}
                  className="admin-option create-category"
                >
                  <PlusCircle size={20} />
                  <span>Criar Categoria</span>
                </button>
                <button
                  onClick={() => {
                    navigate("/admin/criar-calculo")
                    setShowOptions(false)
                  }}
                  className="admin-option create-calculation"
                >
                  <PlusCircle size={20} />
                  <span>Criar Cálculo</span>
                </button>
              </div>
            </div>
          )}

          {showCreateCategory && (
            <CreateCategory
              onCreate={() => {
                fetchCategorias()
                setShowCreateCategory(false)
              }}
              onCancel={() => setShowCreateCategory(false)}
            />
          )}
        </>
      )}
    </div>
  )
}
