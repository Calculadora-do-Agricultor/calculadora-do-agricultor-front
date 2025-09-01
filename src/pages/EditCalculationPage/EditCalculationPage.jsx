import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import EditCalculation from "@/components/EditCalculation";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";

const EditCalculationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCalculation = async () => {
      try {
        setLoading(true);
        const calculationDoc = await getDoc(doc(db, "calculations", id));

        if (calculationDoc.exists()) {
          setCalculation({
            id: calculationDoc.id,
            ...calculationDoc.data(),
          });
        } else {
          setError("Cálculo não encontrado.");
        }
      } catch (err) {
        console.error("Erro ao carregar cálculo:", err);
        setError(
          "Erro ao carregar dados do cálculo. Verifique sua conexão e tente novamente.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCalculation();
    }
  }, [id]);

  const handleCancel = () => {
    navigate(-1);
  };

  const handleUpdate = () => {
    navigate("/calculator");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner 
          tipo="full" 
          mensagem="Carregando cálculo..." 
          tamanho="medium" 
          cor="primary" 
          delay={200}
          ariaLabel="Carregando dados do cálculo"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 text-center shadow-sm">
          <div className="mb-4 text-red-500">
            <AlertTriangle size={36} className="mx-auto" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-gray-800">Erro</h1>
          <p className="mb-6 text-gray-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center rounded-lg bg-[#00418F] px-4 py-2 text-white"
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      {calculation && (
        <EditCalculation
          calculationId={id}
          onUpdate={handleUpdate}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default EditCalculationPage;
