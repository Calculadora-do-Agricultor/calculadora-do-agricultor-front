
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthState } from "react-firebase-hooks/auth"
import { getDocs, collection, getDoc, doc, query, where } from "firebase/firestore"
import { PlusCircle, X, Search, ChevronRight, CalculatorIcon, LayoutGrid, List, Filter, Info } from "lucide-react"
import { auth, db } from "../../services/firebaseConfig"
import { Categories } from "../../components/Categories"
import { CalculationList } from "../../components/CalculationList"
import CreateCategory from "../../components/CreateCategory"

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
  const navigate = useNavigate()

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

  // Verificar se o usuário é admin
  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid)
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          setIsAdmin(docSnap.data().role === "admin")
        }
      })
    }

    fetchCategorias()
  }, [user])

  // Total de cálculos em todas as categorias
  const totalCalculos = categorias.reduce((total, cat) => total + (cat.calculos?.length || 0), 0)

  // Encontrar a categoria selecionada
  const categoriaAtual = categorias.find((cat) => cat.name === categoriaSelecionada)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        {/* Header com banner */}
        <div className="relative mb-8 bg-[#00418F] rounded-xl overflow-hidden">
          <div className="relative z-10 px-6 py-10 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Calculadora do Agricultor</h1>
                <p className="text-blue-100 max-w-2xl">
                  Explore nossa coleção de ferramentas de cálculo para diversas aplicações.
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-xl">
                <CalculatorIcon className="h-16 w-16 text-[#FFEE00]" />
              </div>
            </div>
          </div>
        </div>

        {/* Barra de pesquisa e controles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-auto md:flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar cálculos..."
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00418F] focus:border-[#00418F]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <div className="flex items-center">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#00418F]"
                >
                  <Filter className="h-5 w-5" />
                </button>

                <span className="text-sm text-gray-500 mx-2">Visualização:</span>

                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid" ? "bg-[#00418F]/10 text-[#00418F]" : "text-gray-500 hover:bg-gray-100"
                  }`}
                  aria-label="Visualização em grade"
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>

                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list" ? "bg-[#00418F]/10 text-[#00418F]" : "text-gray-500 hover:bg-gray-100"
                  }`}
                  aria-label="Visualização em lista"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                <select className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#00418F] focus:border-[#00418F]">
                  <option>Nome (A-Z)</option>
                  <option>Nome (Z-A)</option>
                  <option>Mais recentes</option>
                  <option>Mais antigos</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="bg-[#00418F] hover:bg-[#003166] text-white px-4 py-2 rounded-lg flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <span>Aplicar Filtros</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar com categorias */}
          <div className="md:col-span-4 lg:col-span-3">
            {loading ? (
              <div className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
                  <div className="bg-[#00418F] px-4 py-3">
                    <h2 className="text-white font-semibold text-lg">Categorias</h2>
                  </div>
                  <Categories
                    categories={categorias}
                    onSelect={setCategoriaSelecionada}
                    selectedCategory={categoriaSelecionada}
                  />
                </div>

                {/* Estatísticas */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Estatísticas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total de Categorias</span>
                      <span className="font-semibold">{categorias.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total de Cálculos</span>
                      <span className="font-semibold">{totalCalculos}</span>
                    </div>
                    {categoriaAtual && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Cálculos nesta categoria</span>
                        <span className="font-semibold">{categoriaAtual.calculos?.length || 0}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Conteúdo principal */}
          <div className="md:col-span-8 lg:col-span-9">
            {loading ? (
              <div className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ) : !categoriaSelecionada ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-blue-50 p-4 rounded-full mb-4">
                    <ChevronRight className="h-12 w-12 text-[#00418F]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Selecione uma categoria</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Escolha uma categoria no painel lateral para ver os cálculos disponíveis.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-[#00418F] mb-2">{categoriaSelecionada}</h2>
                      <p className="text-gray-600">
                        Explore nossa coleção de cálculos e conversores para {categoriaSelecionada.toLowerCase()}.
                      </p>
                    </div>
                    {categoriaAtual?.calculos?.length > 0 && (
                      <div className="hidden md:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                        <CalculatorIcon className="h-4 w-4 text-[#00418F]" />
                        <span className="text-sm font-medium text-[#00418F]">
                          {categoriaAtual.calculos.length} cálculo{categoriaAtual.calculos.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Breadcrumbs */}
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Início</span>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span>Calculadora</span>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span className="font-medium text-[#00418F]">{categoriaSelecionada}</span>
                  </div>
                </div>

                <CalculationList category={categoriaSelecionada} searchTerm={searchTerm} viewMode={viewMode} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Área de administração */}
      {isAdmin && (
        <>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-[#00418F] to-[#0066CC] text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 z-10 flex items-center justify-center transform hover:scale-110 hover:rotate-180 focus:outline-none focus:ring-2 focus:ring-[#00418F] focus:ring-opacity-50 backdrop-blur-sm group"
            aria-label="Opções de administrador"
            style={{
              animation: 'bounce 1s infinite',
              boxShadow: '0 4px 15px rgba(0, 65, 143, 0.3)',
            }}
          >
            {showOptions ? (
              <X className="h-6 w-6 transition-transform duration-300 transform group-hover:rotate-90" />
            ) : (
              <PlusCircle className="h-6 w-6 transition-transform duration-300 transform group-hover:rotate-90" />
            )}
            <style jsx>{`
              @keyframes bounce {
                0%, 100% {
                  transform: translateY(0);
                }
                50% {
                  transform: translateY(-5px);
                }
              }
              
              button:hover {
                box-shadow: 0 8px 25px rgba(0, 65, 143, 0.4);
                transform: translateY(-2px) scale(1.1);
              }
              
              button:active {
                transform: translateY(1px) scale(0.95);
              }
            `}</style>
          </button>

          {showOptions && (
            <div className="fixed bottom-24 right-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10 w-64">
              <div className="p-4 bg-[#00418F] text-white">
                <h3 className="text-lg font-semibold">Opções de Administrador</h3>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowCreateCategory(true)
                    setShowOptions(false)
                  }}
                  className="bg-[#00418F] text-white px-4 py-3 rounded-lg w-full flex items-center justify-center"
                >
                  <PlusCircle className="h-5 w-5 mr-3" />
                  <span className="font-medium">Criar Categoria</span>
                </button>
                <button
                  onClick={() => {
                    navigate("/admin/criar-calculo")
                    setShowOptions(false)
                  }}
                  className="bg-[#FFEE00] text-[#00418F] font-medium px-4 py-3 rounded-lg w-full flex items-center justify-center"
                >
                  <PlusCircle className="h-5 w-5 mr-3" />
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
