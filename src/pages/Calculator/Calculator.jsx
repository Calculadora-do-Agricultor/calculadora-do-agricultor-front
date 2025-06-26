import { useState, useEffect, useContext, useRef, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  getDocs,
  collection,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { AdminContext } from "../../context/AdminContext";
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
  Tags,
  FileSpreadsheet,
} from "lucide-react";
import { auth, db } from "../../services/firebaseConfig";
import CalculationList from "@/components/CalculationList";
import { Categories } from "@/components";
import CreateCategory from "@/components/CreateCategory";
import EditCalculation from "@/components/EditCalculation";
import logoClara from "@/assets/logoClara.svg";
import "./Calculator.css";

export default function Calculator() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [user] = useAuthState(auth);
  const { isAdmin } = useContext(AdminContext);
  const [showOptions, setShowOptions] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid ou list
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [userCount, setUserCount] = useState(0);
  const [showUserCount, setShowUserCount] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [showEditCalculation, setShowEditCalculation] = useState(false);
  const [calculationToEdit, setCalculationToEdit] = useState(null);

  const [currentSortOption, setCurrentSortOption] = useState("name_asc");
  const [selectedComplexities, setSelectedComplexities] = useState([]);
  const [showCategoryDescription, setShowCategoryDescription] = useState(false);
  const [calculos, setCalculos] = useState([]);

  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar todas as categorias e todos os cálculos em paralelo
      const [categoriasSnapshot, calculosSnapshot] = await Promise.all([
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "calculations"))
      ]);

      // Mapear categorias
      const categoriasMap = new Map();
      categoriasSnapshot.docs.forEach(doc => {
        const categoria = { id: doc.id, ...doc.data(), calculos: [] };
        categoriasMap.set(doc.id, categoria);
      });

      // Agrupar cálculos por categoria
      calculosSnapshot.docs.forEach(doc => {
        const calculo = { id: doc.id, ...doc.data() };
        const categories = calculo.categories || [];
        
        categories.forEach(categoryId => {
          const categoria = categoriasMap.get(categoryId);
          if (categoria) {
            categoria.calculos.push(calculo);
          }
        });
      });

      const categoriasComCalculos = Array.from(categoriasMap.values());
      setCategorias(categoriasComCalculos);


    } catch (error) {
      console.error("Erro ao buscar categorias com cálculos:", error);
    } finally {
      setLoading(false);
    }
  }, [categoriaSelecionada]);

  // Atualizar a exibição da contagem de usuários com base no status de admin
  useEffect(() => {
    setShowUserCount(isAdmin);
    // Apenas buscar contagem de usuários se for admin
    if (isAdmin) {
      fetchUserCount();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (user) {
      fetchCategorias();
    }
  }, [user, fetchCategorias]);

  // Limpar categoria selecionada ao montar o componente
  useEffect(() => {
    setCategoriaSelecionada(null);
  }, []);

  useEffect(() => {
    // Escutar eventos de mudança de modo de visualização
    const handleViewModeChange = (event) => {
      setViewMode(event.detail);
    };

    window.addEventListener("changeViewMode", handleViewModeChange);

    return () => {
      window.removeEventListener("changeViewMode", handleViewModeChange);
    };
  }, []);

  // Função para focar no campo de pesquisa quando pressionar Ctrl+K ou Command+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle edit calculation
  const handleEditCalculation = (calculation) => {
    setCalculationToEdit(calculation);
    setShowEditCalculation(true);
  };

  // Total de cálculos em todas as categorias (memoizado)
  const totalCalculos = useMemo(() => {
    return categorias.reduce(
      (total, cat) => total + (cat.calculos?.length || 0),
      0,
    );
  }, [categorias]);

  // Encontrar a categoria selecionada (memoizado)
  const categoriaAtual = useMemo(() => {
    return categorias.find(
      (cat) => cat.name === categoriaSelecionada,
    );
  }, [categorias, categoriaSelecionada]);

  const fetchUserCount = useCallback(async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      setUserCount(usersSnapshot.size);
    } catch (error) {
      console.error("Erro ao buscar contagem de usuários:", error);
      setUserCount(0);
    }
  }, []);

  return (
    <div className="calculator-page">
      <div className="main-content">
        {/* Banner principal */}
        <div className="main-banner">
          <div className="banner-content">
            <h1>Calculadora do Agricultor</h1>
            <p>
              Ferramentas de cálculo especializadas para otimizar suas
              atividades agrícolas e aumentar sua produtividade.
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

        {/* Categorias móveis */}
        <div className="mobile-categories-section">
          <div className="mobile-categories-header">
            <h3>Categorias</h3>
          </div>
          <div className="mobile-categories-content">
            <Categories
              categories={categorias}
              onSelect={setCategoriaSelecionada}
              selectedCategory={categoriaSelecionada}
              onCategoryUpdated={fetchCategorias}
              idPrefix="mobile-"
            />
          </div>
        </div>

        {/* Conteúdo principal com sidebar e lista de cálculos */}
        <div className="content-container" id="calculator-calculations-list">
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
                <div className="categories-container-calculator">
                  <div className="categories-header">
                    <h2>Categorias</h2>
                  </div>
                  <Categories
                    categories={categorias}
                    onSelect={(category) => {
                      setCategoriaSelecionada(category);
                    }}
                    selectedCategory={categoriaSelecionada}
                    onCategoryUpdated={fetchCategorias}
                    idPrefix="desktop-"
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
                <p>
                  Escolha uma categoria no painel lateral para ver os cálculos
                  disponíveis.
                </p>
              </div>
            ) : (
              <>
                <div className="category-header">
                  <div className="category-info">
                    <div className="category-title-wrapper">
                      <h2>{categoriaSelecionada}</h2>
                      {categoriaAtual?.description && (
                        <button
                          className={`category-description-indicator ${showCategoryDescription ? "active" : ""}`}
                          onClick={() =>
                            setShowCategoryDescription(!showCategoryDescription)
                          }
                          aria-label="Mostrar/ocultar descrição da categoria"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="info-icon"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {!categoriaAtual?.description && (
                      <p>
                        Explore nossa coleção de cálculos e conversores para{" "}
                        {categoriaSelecionada.toLowerCase()}.
                      </p>
                    )}
                  </div>
                  {categoriaAtual?.calculos?.length > 0 && (
                    <div className="category-badge">
                      <CalculatorIcon size={16} />
                      <span>
                        {categoriaAtual.calculos.length} cálculo
                        {categoriaAtual.calculos.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Descrição da categoria em largura total */}
                {categoriaAtual?.description && showCategoryDescription && (
                  <div className="category-description-container">
                    <div className="category-description-legend">
                      <span>Descrição da categoria:</span>
                    </div>
                    <div className="category-description">
                      {categoriaAtual.description}
                    </div>
                  </div>
                )}

                {/* Breadcrumbs */}
                
                <div className="breadcrumbs">
                  <span
                    className="breadcrumb-link"
                    onClick={() => {
                      setCategoriaSelecionada(null);
                      navigate("/");
                    }}
                    style={{
                      cursor: "pointer",
                      color: "#007bff",
                      transition: "color 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.color = "#0056b3"}
                    onMouseOut={(e) => e.target.style.color = "#007bff"}
                    role="link"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        setCategoriaSelecionada(null);
                        navigate("/");
                      }
                    }}
                  >
                    Início
                  </span>
                  <ChevronRight size={16} aria-hidden="true" />

                  <span
                    className="breadcrumb-link"
                    onClick={() => {
                      setCategoriaSelecionada(null);
                      navigate("/calculator", { state: { from: "breadcrumb" } });
                    }}
                    style={{
                      cursor: "pointer",
                      color: "#007bff",
                      transition: "color 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.color = "#0056b3"}
                    onMouseOut={(e) => e.target.style.color = "#007bff"}
                    role="link"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        setCategoriaSelecionada(null);
                        navigate("/calculator", { state: { from: "breadcrumb" } });
                      }
                    }}
                  >
                    Calculadora
                  </span>
                  <ChevronRight size={16} aria-hidden="true" />

                  <span
                    className="current"
                    style={{
                      fontWeight: "bold",
                      color: "#333"
                    }}
                    role="text"
                    aria-current="page"
                  >
                    {categoriaSelecionada}
                  </span>
                </div>

                {/* Lista de cálculos */}
                <CalculationList
                  category={categoriaSelecionada}
                  calculations={categoriaAtual?.calculos || []}
                  searchTerm={searchTerm}
                  viewMode={viewMode}
                  sortOption={currentSortOption}
                  complexityFilters={selectedComplexities}
                  onEditCalculation={handleEditCalculation}
                  onCalculationDeleted={fetchCategorias}
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
            fetchCategorias(); // Recarrega os dados após a atualização
            setShowEditCalculation(false);
            setCalculationToEdit(null);
          }}
          onCancel={() => {
            setShowEditCalculation(false);
            setCalculationToEdit(null);
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
                    setShowCreateCategory(true);
                    setShowOptions(false);
                  }}
                  className="admin-option create-category"
                >
                  <Tags size={20} />
                  <span>Criar Categoria</span>
                </button>
                <button
                  onClick={() => {
                    navigate("/admin/criar-calculo");
                    setShowOptions(false);
                  }}
                  className="admin-option create-calculation"
                >
                  <FileSpreadsheet size={20} />
                  <span>Criar Cálculo</span>
                </button>
              </div>
            </div>
          )}

          {showCreateCategory && (
            <CreateCategory
              onCreate={() => {
                fetchCategorias();
                setShowCreateCategory(false);
              }}
              onCancel={() => setShowCreateCategory(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
