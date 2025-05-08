import { useState } from "react";
import { CalculationModal } from "../../components/CalculationModal";

export default function ModalTest() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Exemplo de cálculo que simula o da imagem (Cálculo de Adubo)
  const exampleCalculation = {
    id: "calc-adubo",
    name: "Cálculo de Adubo",
    description: "Adubo em gramas por metro",
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
          { label: "Selecione uma opção", value: "" },
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto px-6 py-8 max-w-7xl flex-grow">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary text-center bg-clip-text text-transparent bg-gradient-to-r from-[#00418F] to-[#0066CC] mb-3">
            Teste do Modal de Cálculo
          </h1>
          <p className="text-gray-600 text-center text-lg font-medium">
            Demonstração do componente genérico de modal para cálculos
          </p>
        </header>

        <div className="flex justify-center">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md w-full">
            <h2 className="text-xl font-bold text-[#00418F] mb-4">Demonstração</h2>
            <p className="text-gray-600 mb-6">
              Clique no botão abaixo para abrir o modal de cálculo de adubo, similar ao exemplo da imagem.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-gradient-to-r from-[#00418F] to-[#0066CC] text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center"
            >
              Abrir Modal de Cálculo
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Cálculo */}
      <CalculationModal
        calculation={exampleCalculation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}