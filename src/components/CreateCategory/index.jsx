import { useState } from "react"
import { collection, addDoc, query, where, getDocs } from "firebase/firestore"
import { db } from "../../services/firebaseConfig"
import { Loader2 } from "lucide-react"

export default function CreateCategory({ onCreate, onCancel }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("O nome da categoria é obrigatório")
      return
    }

    try {
      setLoading(true)
      setError("")

      // Verifica se já existe uma categoria com o mesmo nome
      const q = query(
        collection(db, "categories"),
        where("name", "==", name.trim())
      )
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        setError("Já existe uma categoria com este nome")
        setLoading(false)
        return
      }

      await addDoc(collection(db, "categories"), {
        name: name.trim(),
        description: description.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      setName("")
      setDescription("")
      onCreate()
    } catch (error) {
      console.error("Erro ao criar categoria:", error)
      setError("Ocorreu um erro ao criar a categoria. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome da Categoria <span className="text-red-500">*</span>
        </label>
        <input
          id="category-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00418F] focus:border-[#00418F]"
          placeholder="Digite o nome da categoria"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="category-description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          id="category-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00418F] focus:border-[#00418F]"
          placeholder="Digite uma descrição para a categoria (opcional)"
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#00418F] text-white rounded-md hover:bg-[#003166] focus:outline-none focus:ring-2 focus:ring-[#00418F] focus:ring-opacity-50 transition-colors"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
              Criando...
            </span>
          ) : (
            "Criar Categoria"
          )}
        </button>
      </div>
    </form>
  )
}
