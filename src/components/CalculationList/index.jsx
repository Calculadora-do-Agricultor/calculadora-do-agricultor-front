"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../../services/firebaseConfig"
import { ArrowRight } from "lucide-react"
import { CalculationModal } from "../CalculationModal"
import "./styles.css"

export function CalculationList({ category, searchTerm = "" }) {
  const [calculations, setCalculations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filteredCalculations, setFilteredCalculations] = useState([])
  const [selectedCalculation, setSelectedCalculation] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      <div className="calculations-loading">
        <div className="loading-spinner"></div>
        <p>Carregando cálculos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="calculations-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Tentar novamente
        </button>
      </div>
    )
  }

  if (filteredCalculations.length === 0) {
    return (
      <div className="calculations-empty">
        {searchTerm ? (
          <p>Nenhum cálculo encontrado para "{searchTerm}".</p>
        ) : (
          <p>Não há cálculos disponíveis para esta categoria.</p>
        )}
      </div>
    )
  }

  return (
    <div className="calculations-grid">
      {filteredCalculations.map((calculation) => (
        <div key={calculation.id} className="calculation-card">
          <div className="calculation-content">
            <h3 className="calculation-title">{calculation.name || calculation.nome}</h3>
            <p className="calculation-description">
              {calculation.description || calculation.descricao || "Sem descrição disponível."}
            </p>
          </div>
          <div className="calculation-footer">
            <button 
              className="details-button"
              onClick={() => {
                setSelectedCalculation(calculation)
                setIsModalOpen(true)
              }}
            >
              Ver detalhes <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ))}
      
      {/* Modal de Cálculo */}
      {selectedCalculation && (
        <CalculationModal
          calculation={selectedCalculation}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}
