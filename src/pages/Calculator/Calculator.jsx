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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary text-center">Cálculos e Conversores</h1>
        <p className="text-gray-600 text-center mt-2">Selecione uma categoria para explorar os cálculos disponíveis</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar com categorias */}
        <div className="md:col-span-1">
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-64 rounded-lg shadow-custom"></div>
          ) : (
            <Categories
              categories={categorias}
              onSelect={setCategoriaSelecionada}
              selectedCategory={categoriaSelecionada}
            />
          )}
        </div>

        {/* Conteúdo principal */}
        <div className="md:col-span-3">
          {categoriaSelecionada && (
            <>
              <div className="bg-white p-5 rounded-lg mb-6 border border-gray-200 shadow-custom">
                <h2 className="text-xl font-semibold text-primary mb-2">{categoriaSelecionada}</h2>
                <p className="text-gray-600">
                  Explore nossa coleção de cálculos e conversores para {categoriaSelecionada.toLowerCase()}.
                </p>
              </div>
              <CalculationList category={categoriaSelecionada} />
            </>
          )}
        </div>
      </div>

      {/* Área de administração */}
      {isAdmin && (
        <>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="fixed bottom-8 right-8 bg-primary hover:bg-primary-light text-white p-3 rounded-full shadow-custom-lg transition-all duration-300 z-10 flex items-center justify-center transform hover:scale-105"
            aria-label="Opções de administrador"
          >
            {showOptions ? <X className="h-6 w-6" /> : <PlusCircle className="h-6 w-6" />}
          </button>

          {showOptions && (
            <div className="fixed bottom-24 right-8 bg-white rounded-lg shadow-custom-lg border border-gray-200 overflow-hidden z-10 w-64 transition-all duration-300 transform">
              <div className="p-4 bg-primary text-white font-medium">Opções de Administrador</div>
              <div className="p-4 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowCreateCategory(true)
                    setShowOptions(false)
                  }}
                  className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-md transition-all duration-300 w-full flex items-center justify-center shadow-sm hover:shadow transform hover:scale-102"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Criar Categoria
                </button>
                <button
                  onClick={() => {
                    navigate("/admin/criar-calculo")
                  }}
                  className="bg-secondary hover:bg-secondary-light text-primary px-4 py-2 rounded-md transition-all duration-300 w-full flex items-center justify-center shadow-sm hover:shadow transform hover:scale-102"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Criar Cálculo
                </button>
              </div>
            </div>
          )}

          {showCreateCategory && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-custom-lg max-w-md w-full p-6 transform transition-all duration-300">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                  <h3 className="text-xl font-semibold text-primary">Criar Nova Categoria</h3>
                  <button onClick={() => setShowCreateCategory(false)} className="text-gray-500 hover:text-danger transition-colors p-1 rounded-full hover:bg-gray-100">
                    <X className="h-5 w-5" />
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