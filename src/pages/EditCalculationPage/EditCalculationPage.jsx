"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../../services/firebaseConfig"
import EditCalculation from "../../components/EditCalculation"
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react"

const EditCalculationPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [calculation, setCalculation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCalculation = async () => {
      try {
        setLoading(true)
        const calculationDoc = await getDoc(doc(db, "calculations", id))

        if (calculationDoc.exists()) {
          setCalculation({
            id: calculationDoc.id,
            ...calculationDoc.data(),
          })
        } else {
          setError("Cálculo não encontrado.")
        }
      } catch (err) {
        console.error("Erro ao carregar cálculo:", err)
        setError("Erro ao carregar dados do cálculo. Verifique sua conexão e tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCalculation()
    }
  }, [id])

  const handleCancel = () => {
    navigate(-1)
  }

  const handleUpdate = () => {
    navigate("/calculator")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={36} className="animate-spin mx-auto mb-4 text-[#00418F]" />
          <p className="text-gray-600">Carregando cálculo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle size={36} className="mx-auto" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Erro</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 bg-[#00418F] text-white rounded-lg"
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {calculation && <EditCalculation calculationId={id} onUpdate={handleUpdate} onCancel={handleCancel} />}
    </div>
  )
}

export default EditCalculationPage
