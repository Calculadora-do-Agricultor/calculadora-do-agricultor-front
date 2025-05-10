"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthState } from "react-firebase-hooks/auth"
import { getDocs, collection, getDoc, doc, query, where } from "firebase/firestore"
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
  TrendingUp,
  Star,
  Clock,
  Calendar,
  Users,
  ChevronDown,
  Bookmark,
  History,
  Award,
  Loader2,
} from "lucide-react"
import { auth, db } from "../../services/firebaseConfig"
import { Categories } from "../../components/Categories"
import { CalculationList } from "../../components/CalculationList"
import CreateCategory from "../../components/CreateCategory"
import EditCalculation from "../../components/EditCalculation"
import logoClara from '../../assets/logoClara.svg';
import "./calculator.css"

export default function Calculator() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [user] = useAuthState(auth)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [showCreateCategory, setShowCreateCategory] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("grid") // grid ou list
  const [showFilters, setShowFilters] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showFeaturedCalculations, setShowFeaturedCalculations] = useState(true)
  const [recentCalculations, setRecentCalculations] = useState([])
  const [popularCalculations, setPopularCalculations] = useState([])
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

      // Buscar cálculos recentes e populares
      fetchFeaturedCalculations()
    } catch (error) {
      console.error("Erro ao buscar categorias com cálculos:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFeaturedCalculations = async () => {
    try {
      // Buscar cálculos recentes
      const recentQuery = query(collection(db, "calculations"), where("createdAt", "!=", null))
      const recentSnapshot = await getDocs(recentQuery)
      const recentCalcs = recentSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
        .slice(0, 4)

      setRecentCalculations(recentCalcs)

      // Buscar cálculos populares (baseado em visualizações)
      const popularQuery = query(collection(db, "calculations"))
      const popularSnapshot = await getDocs(popularQuery)
      const popularCalcs = popularSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 4)

      setPopularCalculations(popularCalcs)
    } catch (error) {
      console.error("Erro ao buscar cálculos em destaque:", error)
    }
  }

  // Verificar se o usuário é admin e buscar contagem de usuários
  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid)
          const docSnap = await getDoc(userRef)
          if (docSnap.exists()) {
            const isUserAdmin = docSnap.data().role === "admin"
            setIsAdmin(isUserAdmin)
            setShowUserCount(isUserAdmin)
            // Apenas buscar contagem de usuários se for admin
            if (isUserAdmin) {
              await fetchUserCount()
            }
          }
        } catch (error) {
          console.error("Erro ao verificar permissões do usuário:", error)
        }
      }
    }

    checkAdminAndFetchData()
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

  // Função para formatar data
  const formatDate = (date) => {
    if (!date) return ""
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }



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

        {/* Cálculos em destaque (visível apenas na página inicial) */}
        {showFeaturedCalculations && !categoriaSelecionada && (
          <div className="featured-calculations">
            <div className="featured-section">
              <div className="section-header">
                <h2>
                  <Clock size={20} /> Cálculos Recentes
                </h2>
                <button className="view-all-button">
                  Ver todos <ChevronRight size={16} />
                </button>
              </div>
              <div className="featured-grid">
                {recentCalculations.length > 0 ? (
                  recentCalculations.map((calc) => (
                    <div key={calc.id} className="featured-card">
                      <div className="featured-card-content">
                        <h3>{calc.name}</h3>
                        <p>{calc.description}</p>
                        <div className="featured-card-meta">
                          <span>
                            <Calendar size={14} /> {formatDate(calc.createdAt?.toDate())}
                          </span>
                          <span>
                            <BookOpen size={14} /> {calc.category}
                          </span>
                        </div>
                      </div>
                      <div className="featured-card-actions">
                        <button
                          className="featured-card-button"
                          onClick={() => {
                            setCategoriaSelecionada(calc.category)
                            setShowFeaturedCalculations(false)
                            // Scroll para a lista de cálculos
                            document.getElementById("calculations-list")?.scrollIntoView({ behavior: "smooth" })
                          }}
                        >
                          Acessar <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="featured-loading">
                    <Loader2 size={24} className="animate-spin" />
                    <p>Carregando cálculos recentes...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="featured-section">
              <div className="section-header">
                <h2>
                  <Star size={20} /> Cálculos Populares
                </h2>
                <button className="view-all-button">
                  Ver todos <ChevronRight size={16} />
                </button>
              </div>
              <div className="featured-grid">
                {popularCalculations.length > 0 ? (
                  popularCalculations.map((calc) => (
                    <div key={calc.id} className="featured-card">
                      <div className="featured-card-content">
                        <h3>{calc.name}</h3>
                        <p>{calc.description}</p>
                        <div className="featured-card-meta">
                          <span>
                            <TrendingUp size={14} /> {calc.views || 0} visualizações
                          </span>
                          <span>
                            <BookOpen size={14} /> {calc.category}
                          </span>
                        </div>
                      </div>
                      <div className="featured-card-actions">
                        <button
                          className="featured-card-button"
                          onClick={() => {
                            setCategoriaSelecionada(calc.category)
                            setShowFeaturedCalculations(false)
                            // Scroll para a lista de cálculos
                            document.getElementById("calculations-list")?.scrollIntoView({ behavior: "smooth" })
                          }}
                        >
                          Acessar <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="featured-loading">
                    <Loader2 size={24} className="animate-spin" />
                    <p>Carregando cálculos populares...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Seção de categorias em destaque */}
            <div className="categories-highlight">
              <h2>Categorias de Cálculos</h2>
              <p>Explore nossa coleção de cálculos organizados por categorias especializadas</p>

              <div className="categories-grid">
                {categorias.slice(0, 6).map((categoria) => (
                  <button
                    key={categoria.id}
                    className="category-card"
                    onClick={() => {
                      setCategoriaSelecionada(categoria.name)
                      setShowFeaturedCalculations(false)
                      // Scroll para a lista de cálculos
                      document.getElementById("calculations-list")?.scrollIntoView({ behavior: "smooth" })
                    }}
                  >
                    <div className="category-icon">{categoria.icon || <CalculatorIcon size={24} />}</div>
                    <div className="category-info">
                      <h3>{categoria.name}</h3>
                      <span className="category-count">
                        {categoria.calculos?.length || 0} cálculo{categoria.calculos?.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <ChevronRight size={20} className="category-arrow" />
                  </button>
                ))}
              </div>

              {categorias.length > 6 && (
                <div className="categories-more">
                  <button
                    className="view-all-categories"
                    onClick={() => {
                      const sidebar = document.querySelector(".sidebar")
                      if (sidebar) {
                        sidebar.scrollIntoView({ behavior: "smooth" })
                      }
                    }}
                  >
                    Ver todas as categorias ({categorias.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

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
                      setShowFeaturedCalculations(false)
                    }}
                    selectedCategory={categoriaSelecionada}
                  />
                </div>
{/* console.log("Categorias:", categorias);
console.log("Categoria selecionada:", categoriaSelecionada);
console.log("Usuário:", user);
console.log("É administrador?", isAdmin);
console.log("Cálculos recentes:", recentCalculations);
console.log("Cálculos populares:", popularCalculations);
console.log("Contagem de usuários:", userCount);
console.log("Modo de visualização:", viewMode);
console.log("Termo de pesquisa:", searchTerm);
console.log("Opções de filtragem:", currentSortOption, selectedComplexities); */}
                {/* Links rápidos */}
                <div className="quick-links">
                  <h3 className="quick-links-header">Links Rápidos</h3>
                  <div className="quick-links-content">
                    <a href="#" className="quick-link">
                      <Bookmark size={16} />
                      <span>Favoritos</span>
                    </a>
                    <a href="#" className="quick-link">
                      <History size={16} />
                      <span>Histórico</span>
                    </a>
                    <a href="#" className="quick-link">
                      <Award size={16} />
                      <span>Mais Usados</span>
                    </a>
                  </div>
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

                {/* Filtros */}
                <div className="filters-bar">
                  <button
                    className={`filter-toggle ${showFilters ? "active" : ""}`}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter size={16} />
                    <span>Filtros</span>
                    <ChevronDown size={14} className={showFilters ? "rotate" : ""} />
                  </button>

                  {showFilters && (
                    <div className="filters-panel">
                      <div className="filters-grid">
                        <div className="filter-group">
                          <label>Ordenar por</label>
                          <select
                            className="filter-select"
                            value={currentSortOption}
                            onChange={(e) => setCurrentSortOption(e.target.value)}
                          >
                            <option value="name_asc">Nome (A-Z)</option>
                            <option value="name_desc">Nome (Z-A)</option>
                            <option value="date_newest">Mais recentes</option>
                            <option value="date_oldest">Mais antigos</option>
                            <option value="views_desc">Mais visualizados</option>
                          </select>
                        </div>

                        <div className="filter-group">
                          <label>Complexidade</label>
                          <div className="filter-options">
                            <label className="filter-option">
                              <input
                                type="checkbox"
                                name="complexity"
                                value="easy"
                                checked={selectedComplexities.includes("easy")}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedComplexities([...selectedComplexities, "easy"])
                                  } else {
                                    setSelectedComplexities(selectedComplexities.filter((item) => item !== "easy"))
                                  }
                                }}
                              />
                              <span>Fácil</span>
                            </label>
                            <label className="filter-option">
                              <input
                                type="checkbox"
                                name="complexity"
                                value="medium"
                                checked={selectedComplexities.includes("medium")}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedComplexities([...selectedComplexities, "medium"])
                                  } else {
                                    setSelectedComplexities(selectedComplexities.filter((item) => item !== "medium"))
                                  }
                                }}
                              />
                              <span>Médio</span>
                            </label>
                            <label className="filter-option">
                              <input
                                type="checkbox"
                                name="complexity"
                                value="hard"
                                checked={selectedComplexities.includes("hard")}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedComplexities([...selectedComplexities, "hard"])
                                  } else {
                                    setSelectedComplexities(selectedComplexities.filter((item) => item !== "hard"))
                                  }
                                }}
                              />
                              <span>Avançado</span>
                            </label>
                          </div>
                        </div>

                        <div className="filter-actions">
                          <button className="filter-apply">Aplicar Filtros</button>
                          <button
                            className="filter-clear"
                            onClick={() => {
                              setCurrentSortOption("name_asc")
                              setSelectedComplexities([])
                            }}
                          >
                            Limpar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
