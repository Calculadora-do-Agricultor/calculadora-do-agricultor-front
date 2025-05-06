"use client"

import { useEffect, useState } from "react"
import { db } from "../../services/firebaseConfig"
import { collection, query, where, getDocs } from "firebase/firestore"
import { Loader2, Search, Calculator, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export function CalculationList({ category, searchTerm = "", viewMode = "grid" }) {
  const [calculations, setCalculations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filteredCalculations, setFilteredCalculations] = useState([])

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

  // Filtrar cálculos com base no termo de pesquisa
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCalculations(calculations)
      return
    }

    const filtered = calculations.filter((calc) => {
      const name = calc.name || calc.nome || ""
      const description = calc.description || calc.descricao || ""
      const searchLower = searchTerm.toLowerCase()

      return name.toLowerCase().includes(searchLower) || description.toLowerCase().includes(searchLower)
    })

    setFilteredCalculations(filtered)
  }, [searchTerm, calculations])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-custom border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-gray-500">Carregando cálculos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm my-4" role="alert">
        <p className="font-medium">Erro</p>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (filteredCalculations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-custom border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {searchTerm ? (
            <>
              <Search className="h-12 w-12 text-primary-light mb-4" />
              <h3 className="text-lg font-medium text-primary-dark mb-2">Nenhum resultado encontrado</h3>
              <p className="text-gray-500 mb-4">Não encontramos nenhum cálculo para "{searchTerm}" nesta categoria.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-primary hover:text-primary-dark font-medium transition-colors"
              >
                Limpar pesquisa
              </button>
            </>
          ) : (
            <>
              <Calculator className="h-12 w-12 text-primary-light mb-4 animate-pulse-slow" />
              <h3 className="text-lg font-medium text-primary-dark mb-2">Nenhum cálculo disponível</h3>
              <p className="text-gray-500">Não há cálculos disponíveis para esta categoria no momento.</p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {viewMode === "grid" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCalculations.map((calculation) => (
            <Link
              to={`/calculo/${calculation.id}`}
              key={calculation.id}
              className="bg-white rounded-lg shadow-custom hover:shadow-custom-lg transition-all duration-300 overflow-hidden border border-gray-200 group hover:border-primary-light transform hover:-translate-y-1"
            >
              <div className="p-5">
                <h3 className="text-xl font-semibold text-primary mb-2 group-hover:text-primary-light transition-colors">
                  {calculation.name || calculation.nome}
                </h3>
                <p className="text-gray-600 line-clamp-3">{calculation.description || calculation.descricao}</p>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {calculation.updatedAt ? new Date(calculation.updatedAt.toDate()).toLocaleDateString() : ""}
                </span>
                <span className="text-primary group-hover:text-primary-light font-medium text-sm flex items-center">
                  Ver detalhes
                  <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-custom border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredCalculations.map((calculation) => (
              <li key={calculation.id}>
                <Link to={`/calculo/${calculation.id}`} className="block hover:bg-gray-50 transition-colors p-4 group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-primary group-hover:text-primary-light transition-colors">
                        {calculation.name || calculation.nome}
                      </h3>
                      <p className="text-gray-600 mt-1 line-clamp-2">
                        {calculation.description || calculation.descricao}
                      </p>
                    </div>
                    <span className="text-primary group-hover:text-primary-light font-medium text-sm flex items-center">
                      <ArrowRight className="ml-1 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">
                      {calculation.updatedAt ? new Date(calculation.updatedAt.toDate()).toLocaleDateString() : ""}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
