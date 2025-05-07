import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthState } from "react-firebase-hooks/auth"
import { getDocs, collection, getDoc, doc, query, where } from "firebase/firestore"
import { PlusCircle, X } from "lucide-react"
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto px-6 py-8 max-w-7xl flex-grow">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary text-center bg-clip-text text-transparent bg-gradient-to-r from-[#00418F] to-[#0066CC] mb-3">Cálculos e Conversores</h1>
          <p className="text-gray-600 text-center text-lg font-medium">Selecione uma categoria para explorar os cálculos disponíveis</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar com categorias */}
          <div className="md:col-span-4 md:sticky md:top-4 self-start">
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-64 rounded-xl shadow-lg"></div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <Categories
                  categories={categorias}
                  onSelect={setCategoriaSelecionada}
                  selectedCategory={categoriaSelecionada}
                />
              </div>
            )}
          </div>

          {/* Conteúdo principal */}
          <div className="md:col-span-8">
            {categoriaSelecionada && (
              <>
                <div className="bg-white p-6 rounded-xl mb-8 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h2 className="text-2xl font-bold text-primary mb-3 bg-clip-text text-transparent bg-gradient-to-r from-[#00418F] to-[#0066CC]">{categoriaSelecionada}</h2>
                  <p className="text-gray-600 text-lg">
                    Explore nossa coleção de cálculos e conversores para {categoriaSelecionada.toLowerCase()}.
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <CalculationList category={categoriaSelecionada} />
                </div>
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
            className="fixed bottom-8 right-8 bg-gradient-to-r from-[#00418F] to-[#0066CC] text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 z-10 flex items-center justify-center transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#00418F] focus:ring-opacity-50 backdrop-blur-sm"
            aria-label="Opções de administrador"
          >
            {showOptions ? <X className="h-6 w-6" /> : <PlusCircle className="h-6 w-6" />}
          </button>

          {showOptions && (
            <div className="fixed bottom-24 right-8 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-10 w-72 transition-all duration-300 transform animate-fade-up">
              <div className="p-5 bg-gradient-to-r from-[#00418F] to-[#0066CC] text-white font-semibold">
                <h3 className="text-lg">Opções de Administrador</h3>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <button
                  onClick={() => {
                    setShowCreateCategory(true)
                    setShowOptions(false)
                  }}
                  className="bg-gradient-to-r from-[#00418F] to-[#0066CC] text-white px-5 py-3 rounded-xl transition-all duration-300 w-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-[#00418F] focus:ring-opacity-50 group"
                >
                  <PlusCircle className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="font-medium">Criar Categoria</span>
                </button>
                <button
                  onClick={() => {
                    navigate("/admin/criar-calculo")
                  }}
                  className="bg-gradient-to-r from-[#FFEE00] to-[#FFD700] text-[#00418F] font-medium px-5 py-3 rounded-xl transition-all duration-300 w-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-[#FFEE00] focus:ring-opacity-50 group"
                >
                  <PlusCircle className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Criar Cálculo</span>
                </button>
              </div>
            </div>
          )}

          {showCreateCategory && (
            <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-20 backdrop-blur-sm animate-fade-in">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100 animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00418F] to-[#0066CC]">Criar Nova Categoria</h3>
                  <button 
                    onClick={() => setShowCreateCategory(false)} 
                    className="text-gray-500 hover:text-[#00418F] transition-colors p-2 rounded-full hover:bg-gray-100/80 group"
                  >
                    <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </div>
                <CreateCategory
                  onCreate={() => {
                    fetchCategorias()
                    setShowCreateCategory(false)
                  }}
                  onCancel={() => setShowCreateCategory(false)}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}