import React, { useState, useEffect } from "react";
import { db } from "../services/firebaseConfig"; // Supondo que você já tenha configurado o Firestore
import { collection, addDoc, getDocs } from "firebase/firestore";


const CreateCalculation = ({ onCreate, onCancel }) => {
  // Estado para controlar a navegação entre as etapas
  const [step, setStep] = useState(1);

  // Dados do cálculo
  const [calculationName, setCalculationName] = useState("");
  const [calculationDescription, setCalculationDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Dados dos parâmetros
  const [parameters, setParameters] = useState([{ name: "", type: "text", options: [] }]);

  const addParameter = () => {
    setParameters([...parameters, { name: "", type: "text", options: [] }]);
  };

  // Função para remover um parâmetro
  const removeParameter = (index) => {
    const updatedParameters = parameters.filter((_, i) => i !== index);
    setParameters(updatedParameters);
  };

  // Dados dos resultados
  const [resultName, setResultName] = useState("");
  const [resultDescription, setResultDescription] = useState("");
  const [selectedParams, setSelectedParams] = useState([]);
  const [expression, setExpression] = useState("");

  // Estado de erro
  const [error, setError] = useState("");

  // Carregar categorias para o dropdown
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const categoriesData = querySnapshot.docs.map((doc) => doc.data());
      setCategories(categoriesData);
    };

    fetchCategories();
  }, []);

  // Função para salvar o cálculo no Firestore
  const handleCreateCalculation = async () => {
    if (!calculationName || !calculationDescription || !selectedCategory) {
      setError("Preencha todos os campos.");
      return;
    }

    try {
      await addDoc(collection(db, "calculations"), {
        name: calculationName,
        description: calculationDescription,
        category: selectedCategory,
        parameters,
        resultName,
        resultDescription,
        selectedParams,
        expression,
        createdAt: new Date(),
      });

      alert("Cálculo criado com sucesso!");
      setError("");

      if (onCreate) onCreate(); // Retorna para a tela inicial
    } catch (err) {
      console.error(err);
      setError("Erro ao criar cálculo.");
    }
  };

  // Função para mudar de etapa
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="container">
      {error && <p className="error">{error}</p>}

      {/* Etapa 1: Básico */}
      {step === 1 && (
        <div className="flex flex-col justify-center items-center space-y-4">
          <h2 className="text-2xl font-bold text-blue-900">Básico</h2>
          <input
            type="text"
            placeholder="Nome do Cálculo"
            value={calculationName}
            onChange={(e) => setCalculationName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline max-w-sm h-10"
          />
          <textarea
            placeholder="Descrição do Cálculo"
            value={calculationDescription}
            onChange={(e) => setCalculationDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline max-w-sm h-10"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline max-w-sm h-10"
          >
            <option value="">Selecione a Categoria</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <div className="flex space-x-4">
            <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={onCancel}>Fechar</button>
            <button className="bg-blue-500 text-white rounded w-30 h-8" onClick={nextStep}>Próxima Etapa</button>
          </div>
        </div>
      )}

      {/* Etapa 2: Parâmetros */}
      {step === 2 && (
        <div className="flex flex-col justify-center items-center space-y-4">
          <div className="flex felx-row gap-5">
            <h2 className="text-blue-900 font-bold text-2xl">Parâmetros</h2>
            <button
              onClick={addParameter}
              className="bg-blue-300 text-blue-900 px-2 py-2 rounded border border-blue-900"
            >
              Adicionar
            </button>
          </div>

          {parameters.map((param, index) => (
            <div key={index} className="flex items-center gap-2 ">
              <input
                type="text"
                placeholder="Nome do Parâmetro"
                value={param.name}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline max-w-sm h-10"
                onChange={(e) => {
                  const newParams = [...parameters];
                  newParams[index].name = e.target.value;
                  setParameters(newParams);
                }}
              />
              {/* Botão de Excluir */}
              <button
                onClick={() => removeParameter(index)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Excluir
              </button>
            </div>
          ))}

          <div className="flex space-x-4">
            <button className="bg-blue-900 text-white rounded w-15 h-8" onClick={prevStep}>Voltar</button>
            <button className="bg-blue-500 text-white rounded w-30 h-8" onClick={nextStep}>Próxima Etapa</button>
          </div>
        </div>
      )}

      {/* Etapa 3: Resultados */}
      {step === 3 && (
        <div className="flex flex-col justify-center items-center space-y-4">
          <h2 className="text-blue-900 font-bold text-2xl">Resultados</h2>
          <input
            type="text"
            placeholder="Nome do Resultado"
            value={resultName}
            onChange={(e) => setResultName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline max-w-sm h-10"
          />
          <textarea
            placeholder="Descrição do Resultado"
            value={resultDescription}
            onChange={(e) => setResultDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline max-w-sm h-10"
          />
          <select
            multiple
            value={selectedParams}
            onChange={(e) => setSelectedParams(Array.from(e.target.selectedOptions, option => option.value))}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline max-w-sm h-10"
          >
            {parameters.map((param, index) => (
              <option key={index} value={param.name}>{param.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Expressão (Ex: (param1 + param2) * 2)"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline max-w-sm h-10"
          />
          <div className="flex space-x-4">
            <button className="bg-blue-900 text-white rounded w-15 h-8" onClick={prevStep}>Voltar</button>
            <button className="bg-blue-500 text-white rounded w-30 h-8" onClick={handleCreateCalculation}>Criar Cálculo</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCalculation;
