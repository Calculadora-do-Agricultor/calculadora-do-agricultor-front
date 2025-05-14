import { useState } from "react";
import { CalculationModal } from "./index";

// Este é um componente de exemplo para demonstrar como usar o CalculationModal
export function CalculationModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Exemplo de um objeto de cálculo
  const exampleCalculation = {
    id: "calc123",
    name: "Cálculo de Adubo",
    description: "Calcula a quantidade de adubo necessária com base no espaçamento e área",
    category: "Adubação",
    parameters: [
      {
        name: "Espaçamento",
        type: "number",
        unit: "m"
      },
      {
        name: "Área",
        type: "select",
        options: [
          { label: "Pequena (até 100m²)", value: "100" },
          { label: "Média (100-500m²)", value: "300" },
          { label: "Grande (acima de 500m²)", value: "700" }
        ]
      },
      {
        name: "Quantidade Desejada de Adubo",
        type: "number",
        unit: "kg/área"
      }
    ],
    resultName: "Quantidade Desejada de Adubo",
    resultUnit: "g/m",
    expression: "(parseFloat(Área) * parseFloat('Quantidade Desejada de Adubo')) / parseFloat(Espaçamento)",
    additionalResults: [
      {
        name: "Coleta de Adubo em 50 Metros",
        unit: "kg",
        key: "coleta50m"
      }
    ]
  };

  return (
    <div className="example-container">
      <button 
        onClick={() => setIsModalOpen(true)}
        className="open-modal-button"
      >
        Abrir Modal de Exemplo
      </button>

      <CalculationModal
        calculation={exampleCalculation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}