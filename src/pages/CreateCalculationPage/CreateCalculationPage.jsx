import React from "react";
import { useNavigate } from "react-router-dom";
import CreateCalculation from "../../components/CreateCalculation";

const CreateCalculationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-900">Criar Cálculo</h1>

      <CreateCalculation
        onCreate={() => navigate("/calculadora")} // volta para a tela principal
        onCancel={() => navigate("/calculadora")} // cancelar também volta
      />
    </div>
  );
};

export default CreateCalculationPage;
