import React, { useState, useEffect } from "react";
import { db } from "../../services/firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { PlusCircle, X, Hash } from "lucide-react";
import "./styles.css";

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
  const [results, setResults] = useState([{ 
    name: "", 
    description: "", 
    expression: "", 
    unit: "" 
  }]);

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
    if (results.some(result => !result.name.trim())) {
      setError("Todos os resultados devem ter um nome.");
      return false;
    }
    if (results.some(result => !result.expression.trim())) {
      setError("Todos os resultados devem ter uma expressão de cálculo.");
      return false;
    }
    return true;
  };

  // Função para adicionar um novo resultado
  const addResult = () => {
    setResults([...results, { name: "", description: "", expression: "", unit: "" }]);
  };

  // Função para remover um resultado
  const removeResult = (index) => {
    const updatedResults = results.filter((_, i) => i !== index);
    setResults(updatedResults);
  };

  // Função para atualizar um resultado
  const updateResult = (index, field, value) => {
    const updatedResults = [...results];
    updatedResults[index][field] = value;
    setResults(updatedResults);
  };

  // Função para inserir um parâmetro na expressão
  const insertParameterInExpression = (resultIndex, paramName) => {
    const updatedResults = [...results];
    updatedResults[resultIndex].expression += paramName;
    setResults(updatedResults);
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
        results,
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  aria-required="true"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="w-full flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              Cancelar
            </button>
            <button
              onClick={nextStep}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      {/* Etapa 2: Parâmetros */}
      {step === 2 && (
        <div className="flex flex-col justify-center items-center space-y-4">
          <h2 className="text-2xl font-bold text-blue-900">Parâmetros</h2>
          
          {parameters.map((param, index) => (
            <div key={index} className="w-full bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Parâmetro {index + 1}</h3>
                {parameters.length > 1 && (
                  <button
                    onClick={() => removeParameter(index)}
                    className="text-red-500 hover:text-red-700"
                    type="button"
                  >
                    Remover
                  </button>
                )}
              </div>
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Nome do Parâmetro"
                  value={param.name}
                  onChange={(e) => {
                    const updatedParameters = [...parameters];
                    updatedParameters[index].name = e.target.value;
                    setParameters(updatedParameters);
                  }}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                
                <select
                  value={param.type}
                  onChange={(e) => {
                    const updatedParameters = [...parameters];
                    updatedParameters[index].type = e.target.value;
                    setParameters(updatedParameters);
                  }}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="text">Texto</option>
                  <option value="number">Número</option>
                  <option value="select">Seleção</option>
                </select>
              </div>
            </div>
          ))}
          
          <button
            onClick={addParameter}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            type="button"
          >
            Adicionar Parâmetro
          </button>

          <div className="w-full flex justify-between space-x-4">
            <button
              onClick={prevStep}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              Voltar
            </button>
            <button
              onClick={nextStep}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      {/* Etapa 3: Resultados */}
      {step === 3 && (
        <div className="flex flex-col justify-center items-center space-y-4">
          <h2 className="text-2xl font-bold text-blue-900">Resultados</h2>
          
          {results.map((result, resultIndex) => (
            <div key={resultIndex} className="w-full bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Resultado {resultIndex + 1}</h3>
                {results.length > 1 && (
                  <button
                    onClick={() => removeResult(resultIndex)}
                    className="text-red-500 hover:text-red-700 flex items-center"
                    type="button"
                  >
                    <X size={16} className="mr-1" /> Remover
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">Nome do Resultado</label>
                    <input
                      type="text"
                      placeholder="Nome do Resultado"
                      value={result.name}
                      onChange={(e) => updateResult(resultIndex, 'name', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">Unidade</label>
                    <input
                      type="text"
                      placeholder="Unidade (ex: kg, m, etc)"
                      value={result.unit}
                      onChange={(e) => updateResult(resultIndex, 'unit', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">Descrição do Resultado</label>
                  <textarea
                    placeholder="Descrição do Resultado"
                    value={result.description}
                    onChange={(e) => updateResult(resultIndex, 'description', e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline min-h-[60px]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-gray-700 text-sm font-bold">Expressão de Cálculo</label>
                    <div className="flex space-x-1">
                      <button 
                        type="button" 
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-200"
                        onClick={() => updateResult(resultIndex, 'expression', result.expression + '+')}  
                      >
                        +
                      </button>
                      <button 
                        type="button" 
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-200"
                        onClick={() => updateResult(resultIndex, 'expression', result.expression + '-')}  
                      >
                        -
                      </button>
                      <button 
                        type="button" 
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-200"
                        onClick={() => updateResult(resultIndex, 'expression', result.expression + '*')}  
                      >
                        *
                      </button>
                      <button 
                        type="button" 
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-200"
                        onClick={() => updateResult(resultIndex, 'expression', result.expression + '/')}  
                      >
                        /
                      </button>
                      <button 
                        type="button" 
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-200"
                        onClick={() => updateResult(resultIndex, 'expression', result.expression + '(')}  
                      >
                        (
                      </button>
                      <button 
                        type="button" 
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-200"
                        onClick={() => updateResult(resultIndex, 'expression', result.expression + ')')}  
                      >
                        )
                      </button>
                    </div>
                  </div>
                  <textarea
                    placeholder="Expressão de Cálculo (ex: param1 * param2 / 100)"
                    value={result.expression}
                    onChange={(e) => updateResult(resultIndex, 'expression', e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline min-h-[60px] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">Inserir Parâmetros</label>
                  <div className="flex flex-wrap gap-2">
                    {parameters.map((param, paramIndex) => (
                      <button
                        key={paramIndex}
                        type="button"
                        onClick={() => insertParameterInExpression(resultIndex, param.name)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-3 py-1 rounded flex items-center"
                      >
                        <Hash size={14} className="mr-1" /> {param.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={addResult}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center"
            type="button"
          >
            <PlusCircle size={18} className="mr-2" /> Adicionar Resultado
          </button>

          <div className="w-full flex justify-between space-x-4 mt-4">
            <button
              onClick={prevStep}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              Voltar
            </button>
            <button
              onClick={handleCreateCalculation}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              disabled={loading}
            >
              {loading ? "Criando..." : "Criar Cálculo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCalculation;