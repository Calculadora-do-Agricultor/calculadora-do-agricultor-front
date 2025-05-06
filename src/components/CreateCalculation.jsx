import React, { useState, useEffect } from "react";
import { db } from "../services/firebaseConfig";
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

  // Estados para feedback ao usuário
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Carregar categorias para o dropdown
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const querySnapshot = await getDocs(collection(db, "categories"));
        const categoriesData = querySnapshot.docs.map((doc) => doc.data());
        setCategories(categoriesData);
      } catch (err) {
        console.error("Erro ao carregar categorias:", err);
        setError("Não foi possível carregar as categorias. Tente novamente mais tarde.");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Função para validar os campos do formulário
  const validateForm = () => {
    if (!calculationName.trim()) {
      setError("O nome do cálculo é obrigatório.");
      return false;
    }
    if (!calculationDescription.trim()) {
      setError("A descrição do cálculo é obrigatória.");
      return false;
    }
    if (!selectedCategory) {
      setError("Selecione uma categoria.");
      return false;
    }
    if (parameters.some(param => !param.name.trim())) {
      setError("Todos os parâmetros devem ter um nome.");
      return false;
    }
    if (!resultName.trim()) {
      setError("O nome do resultado é obrigatório.");
      return false;
    }
    if (!expression.trim()) {
      setError("A expressão de cálculo é obrigatória.");
      return false;
    }
    return true;
  };

  // Função para salvar o cálculo no Firestore
  const handleCreateCalculation = async () => {
    // Limpa mensagens anteriores
    setError("");
    setSuccess(false);
    
    // Valida o formulário
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
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

      setSuccess(true);
      setError("");
      
      // Aguarda um momento para mostrar a mensagem de sucesso antes de redirecionar
      setTimeout(() => {
        if (onCreate) onCreate(); // Retorna para a tela inicial
      }, 1500);
    } catch (err) {
      console.error("Erro ao criar cálculo:", err);
      setError("Erro ao criar cálculo. Verifique sua conexão e tente novamente.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Função para mudar de etapa
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="container mx-auto p-4 max-w-md">
      {/* Mensagens de feedback */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <p>Cálculo criado com sucesso!</p>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-2"></div>
            <p>Processando...</p>
          </div>
        </div>
      )}

      {/* Etapa 1: Básico */}
      {step === 1 && (
        <div className="flex flex-col justify-center items-center space-y-4">
          <h2 className="text-2xl font-bold text-blue-900">Básico</h2>
          
          {loadingCategories ? (
            <div className="flex justify-center items-center py-4 w-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            </div>
          ) : (
            <>
              <div className="w-full">
                <label htmlFor="calculationName" className="block text-gray-700 text-sm font-bold mb-2">Nome do Cálculo</label>
                <input
                  id="calculationName"
                  type="text"
                  placeholder="Nome do Cálculo"
                  value={calculationName}
                  onChange={(e) => setCalculationName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  aria-required="true"
                />
              </div>
              
              <div className="w-full">
                <label htmlFor="calculationDescription" className="block text-gray-700 text-sm font-bold mb-2">Descrição do Cálculo</label>
                <textarea
                  id="calculationDescription"
                  placeholder="Descrição do Cálculo"
                  value={calculationDescription}
                  onChange={(e) => setCalculationDescription(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline min-h-[80px]"
                  required
                  aria-required="true"
                />
              </div>
              
              <div className="w-full">
                <label htmlFor="categorySelect" className="block text-gray-700 text-sm font-bold mb-2">Categoria</label>
                <select
                  id="categorySelect"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  aria-required="true"
                >
                  <option value="">Selecione a Categoria</option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4 w-full justify-end mt-4">
                <button 
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors" 
                  onClick={onCancel}
                  type="button"
                >
                  Cancelar
                </button>
                <button 
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors" 
                  onClick={nextStep}
                  type="button"
                >
                  Próxima Etapa
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Etapa 2: Parâmetros */}
      {step === 2 && (
        <div className="flex flex-col justify-center items-center space-y-4 w-full">
          <div className="flex justify-between items-center w-full mb-4">
            <h2 className="text-blue-900 font-bold text-2xl">Parâmetros</h2>
            <button
              onClick={addParameter}
              className="bg-blue-300 hover:bg-blue-400 text-blue-900 px-3 py-2 rounded border border-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Adicionar parâmetro"
              type="button"
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Adicionar
              </span>
            </button>
          </div>

          {parameters.length === 0 ? (
            <div className="text-center text-gray-500 py-4 w-full border border-dashed border-gray-300 rounded">
              Nenhum parâmetro adicionado. Clique em "Adicionar" para criar um parâmetro.
            </div>
          ) : (
            <div className="space-y-4 w-full">
              {parameters.map((param, index) => (
                <div key={index} className="flex items-center gap-2 w-full p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-grow">
                    <label htmlFor={`param-${index}`} className="block text-gray-700 text-sm font-bold mb-1">
                      Parâmetro {index + 1}
                    </label>
                    <input
                      id={`param-${index}`}
                      type="text"
                      placeholder="Nome do Parâmetro"
                      value={param.name}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      onChange={(e) => {
                        const newParams = [...parameters];
                        newParams[index].name = e.target.value;
                        setParameters(newParams);
                      }}
                      required
                      aria-required="true"
                    />
                  </div>
                  <button
                    onClick={() => removeParameter(index)}
                    className="bg-red-500 hover:bg-red-700 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    aria-label={`Remover parâmetro ${index + 1}`}
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex space-x-4 w-full justify-end mt-4">
            <button 
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors" 
              onClick={prevStep}
              type="button"
            >
              Voltar
            </button>
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors" 
              onClick={nextStep}
              type="button"
            >
              Próxima Etapa
            </button>
          </div>
        </div>
      )}

      {/* Etapa 3: Resultados */}
      {step === 3 && (
        <div className="flex flex-col justify-center items-center space-y-4 w-full">
          <h2 className="text-blue-900 font-bold text-2xl mb-4">Resultados</h2>
          
          <div className="w-full">
            <label htmlFor="resultName" className="block text-gray-700 text-sm font-bold mb-2">Nome do Resultado</label>
            <input
              id="resultName"
              type="text"
              placeholder="Nome do Resultado"
              value={resultName}
              onChange={(e) => setResultName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              aria-required="true"
            />
          </div>
          
          <div className="w-full">
            <label htmlFor="resultDescription" className="block text-gray-700 text-sm font-bold mb-2">Descrição do Resultado</label>
            <textarea
              id="resultDescription"
              placeholder="Descrição do Resultado"
              value={resultDescription}
              onChange={(e) => setResultDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline min-h-[80px]"
            />
          </div>
          
          <div className="w-full">
            <label htmlFor="selectedParams" className="block text-gray-700 text-sm font-bold mb-2">Parâmetros Utilizados</label>
            <div className="relative">
              <select
                id="selectedParams"
                multiple
                value={selectedParams}
                onChange={(e) => setSelectedParams(Array.from(e.target.selectedOptions, option => option.value))}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline min-h-[100px]"
                aria-describedby="paramsHelp"
              >
                {parameters.map((param, index) => (
                  <option key={index} value={param.name}>{param.name}</option>
                ))}
              </select>
              <p id="paramsHelp" className="text-xs text-gray-500 mt-1">Segure Ctrl para selecionar múltiplos parâmetros</p>
            </div>
          </div>
          
          <div className="w-full">
            <label htmlFor="expression" className="block text-gray-700 text-sm font-bold mb-2">Expressão de Cálculo</label>
            <input
              id="expression"
              type="text"
              placeholder="Expressão (Ex: (param1 + param2) * 2)"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              aria-required="true"
              aria-describedby="expressionHelp"
            />
            <p id="expressionHelp" className="text-xs text-gray-500 mt-1">Use os nomes dos parâmetros exatamente como foram definidos</p>
          </div>
          
          <div className="flex space-x-4 w-full justify-end mt-6">
            <button 
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors" 
              onClick={prevStep}
              type="button"
              disabled={loading}
            >
              Voltar
            </button>
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors flex items-center" 
              onClick={handleCreateCalculation}
              type="button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </>
              ) : "Criar Cálculo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCalculation;
