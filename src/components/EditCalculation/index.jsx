

import { useState, useEffect, useCallback } from "react"
import { db } from "../../services/firebaseConfig"
import { collection, doc, getDoc, updateDoc, getDocs, query, where, writeBatch } from "firebase/firestore"
import { useToast } from "../../context/ToastContext"
import {
  PlusCircle,
  X,
  Hash,
  ChevronRight,
  ChevronLeft,
  Calculator,
  Save,
  Info,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Trash2,
  ArrowLeft,
  Loader2,
  Sliders,
  FileText,
  Edit,
  Undo2,
  Redo2,
} from "lucide-react"
import DraggableList from "../DraggableList"
import { MultiSelect } from "../ui"
import { evaluateExpression, normalizeMathFunctions, validateExpression } from "../../utils/mathEvaluator"
import ExpressionValidator from "../ExpressionValidator"
import "../DraggableList/styles.css"
import "./styles.css"

const EditCalculation = ({ calculationId, onUpdate, onCancel }) => {
  // Estado para controlar a navegação entre as etapas
  const [step, setStep] = useState(1)
  const totalSteps = 4
  
  // Hook de Toast para notificações
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast()

  // Dados do cálculo
  const [calculationName, setCalculationName] = useState("")
  const [originalName, setOriginalName] = useState("") // Para verificar se o nome foi alterado
  const [calculationDescription, setCalculationDescription] = useState("")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([])
  const [tags, setTags] = useState([])
  const [currentTag, setCurrentTag] = useState("")
  const [lastModified, setLastModified] = useState(null)

  // Dados dos parâmetros
  const [parameters, setParameters] = useState([
    { name: "", type: "number", unit: "", description: "", required: true, options: [] },
  ])

  // Dados dos resultados
  const [results, setResults] = useState([
    {
      name: "",
      description: "",
      expression: "",
      unit: "",
      precision: 2,
      isMainResult: true,
    },
  ])

  // Estados para histórico de undo/redo das expressões
  const [expressionHistory, setExpressionHistory] = useState({})
  const [expressionHistoryIndex, setExpressionHistoryIndex] = useState({})

  // Função para salvar estado no histórico
  const saveExpressionToHistory = (resultIndex, expression) => {
    setExpressionHistory(prev => {
      const history = prev[resultIndex] || []
      const currentIndex = expressionHistoryIndex[resultIndex] || 0
      
      // Remove itens após o índice atual (quando fazemos uma nova ação após undo)
      const newHistory = history.slice(0, currentIndex + 1)
      newHistory.push(expression)
      
      // Limita o histórico a 50 itens
      if (newHistory.length > 50) {
        newHistory.shift()
      }
      
      return {
        ...prev,
        [resultIndex]: newHistory
      }
    })
    
    setExpressionHistoryIndex(prev => {
      const history = expressionHistory[resultIndex] || []
      const newIndex = Math.min(history.length, 49)
      return {
        ...prev,
        [resultIndex]: newIndex
      }
    })
  }

  // Função para desfazer alteração na expressão
  const undoExpression = (resultIndex) => {
    const history = expressionHistory[resultIndex] || []
    const currentIndex = expressionHistoryIndex[resultIndex] || 0
    
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      const previousExpression = history[newIndex]
      
      const updatedResults = [...results]
      updatedResults[resultIndex].expression = previousExpression
      setResults(updatedResults)
      
      setExpressionHistoryIndex(prev => ({
        ...prev,
        [resultIndex]: newIndex
      }))
    }
  }

  // Função para refazer alteração na expressão
  const redoExpression = (resultIndex) => {
    const history = expressionHistory[resultIndex] || []
    const currentIndex = expressionHistoryIndex[resultIndex] || 0
    
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1
      const nextExpression = history[newIndex]
      
      const updatedResults = [...results]
      updatedResults[resultIndex].expression = nextExpression
      setResults(updatedResults)
      
      setExpressionHistoryIndex(prev => ({
        ...prev,
        [resultIndex]: newIndex
      }))
    }
  }

  // Função para atualizar expressão com histórico
  const updateExpressionWithHistory = (resultIndex, newExpression) => {
    const updatedResults = [...results]
    const oldExpression = updatedResults[resultIndex].expression
    
    // Só salva no histórico se a expressão realmente mudou
    if (oldExpression !== newExpression) {
      saveExpressionToHistory(resultIndex, oldExpression)
      updatedResults[resultIndex].expression = newExpression
      setResults(updatedResults)
    }
  }

  // Dados de visualização
  const [previewMode, setPreviewMode] = useState(false)
  const [previewValues, setPreviewValues] = useState({})
  const [previewResults, setPreviewResults] = useState({})

  // Estados para feedback ao usuário
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState({
    basic: {},
    parameters: {},
    results: {},
  })



  // Carregar categorias para o dropdown
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  // Verificar se o nome do cálculo já existe
  const checkCalculationNameExists = useCallback(
    async (name) => {
      if (name === originalName) return false // Se o nome não mudou, não precisa verificar

      try {
        const q = query(collection(db, "calculations"), where("name", "==", name))
        const querySnapshot = await getDocs(q)
        return !querySnapshot.empty
      } catch (err) {
        console.error("Erro ao verificar nome do cálculo:", err)
        return false
      }
    },
    [originalName],
  )

  // Carregar dados do cálculo e categorias em paralelo
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingCategories(true)
        
        // Carregar dados em paralelo para melhor performance
        const [calculationDoc, categoriesSnapshot] = await Promise.all([
          getDoc(doc(db, "calculations", calculationId)),
          getDocs(collection(db, "categories"))
        ])

        // Processar categorias
        const categoriesData = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setCategories(categoriesData)

        // Processar dados do cálculo
        if (calculationDoc.exists()) {
          const calculationData = calculationDoc.data()

          // Preencher os estados com os dados existentes
          setCalculationName(calculationData.name)
          setOriginalName(calculationData.name)
          setCalculationDescription(calculationData.description)
          
          // Converter categoria antiga (string) para novo formato (array de IDs)
          if (calculationData.categories && Array.isArray(calculationData.categories)) {
            // Novo formato: array de IDs
            setSelectedCategoryIds(calculationData.categories)
          } else if (calculationData.category) {
            // Formato antigo: string com nome da categoria - converter para ID
            const categoryId = categoriesData.find(cat => cat.name === calculationData.category)?.id
            setSelectedCategoryIds(categoryId ? [categoryId] : [])
          } else {
            setSelectedCategoryIds([])
          }
          setTags(calculationData.tags || [])

          // Parâmetros e resultados
          if (calculationData.parameters && calculationData.parameters.length > 0) {
            const parametersWithIds = calculationData.parameters.map((param, index) => ({
              ...param,
              id: param.id || `param-${Date.now()}-${index}`
            }))
            setParameters(parametersWithIds)
          }

          if (calculationData.results && calculationData.results.length > 0) {
            const resultsWithIds = calculationData.results.map((result, index) => ({
              ...result,
              id: result.id || `result-${Date.now()}-${index}`
            }))
            setResults(resultsWithIds)
          }
        } else {
          setError("Cálculo não encontrado.")
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err)
        setError("Erro ao carregar dados. Verifique sua conexão e tente novamente.")
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchData()
  }, [calculationId])



  // Funções para manipular parâmetros
  const addParameter = () => {
    const newParam = { 
      id: `param-${Date.now()}-${Math.random()}`,
      name: "", 
      type: "number", 
      unit: "", 
      description: "", 
      required: true, 
      options: [],
      ordem: parameters.length + 1
    }
    setParameters([...parameters, newParam])
  }

  const removeParameter = (index) => {
    const paramName = parameters[index].name
    const updatedParameters = parameters.filter((_, i) => i !== index)
    
    // Reordena os parâmetros restantes
    const reorderedParameters = updatedParameters.map((param, i) => ({
      ...param,
      ordem: i + 1
    }))
    setParameters(reorderedParameters)

    // Atualizar expressões de resultados que usam este parâmetro
    const paramRegex = new RegExp(paramName, "g")
    const updatedResults = results.map((result) => {
      if (result.expression.includes(paramName)) {
        return {
          ...result,
          expression: result.expression.replace(paramRegex, "0"),
        }
      }
      return result
    })
    setResults(updatedResults)
  }

  const updateParameter = (index, field, value) => {
    const updatedParameters = [...parameters]

    // Se estamos atualizando o nome, precisamos atualizar as expressões
    if (field === "name" && updatedParameters[index].name) {
      const oldName = updatedParameters[index].name
      const newName = value

      // Atualizar expressões de resultados que usam este parâmetro
      const updatedResults = results.map((result) => {
        if (result.expression.includes(oldName)) {
          const paramRegex = new RegExp(oldName, "g")
          return {
            ...result,
            expression: result.expression.replace(paramRegex, newName),
          }
        }
        return result
      })
      setResults(updatedResults)
  
    }

    updatedParameters[index][field] = value
    setParameters(updatedParameters)
  }

  const addOptionToParameter = (paramIndex) => {
    const updatedParameters = [...parameters]
    if (!updatedParameters[paramIndex].options) {
      updatedParameters[paramIndex].options = []
    }
    updatedParameters[paramIndex].options.push({ label: "", value: "" })
    setParameters(updatedParameters)

  }

  const updateParameterOption = (paramIndex, optionIndex, field, value) => {
    const updatedParameters = [...parameters]
    updatedParameters[paramIndex].options[optionIndex][field] = value
    setParameters(updatedParameters)
  }

  const removeParameterOption = (paramIndex, optionIndex) => {
    const updatedParameters = [...parameters]
    const optionLabel = updatedParameters[paramIndex].options[optionIndex].label
    updatedParameters[paramIndex].options = updatedParameters[paramIndex].options.filter((_, i) => i !== optionIndex)
    setParameters(updatedParameters)

  }

  // Função para reordenar parâmetros
  const reorderParameters = useCallback((newParameters) => {
    // Adiciona campo ordem aos parâmetros reordenados
    const parametersWithOrder = newParameters.map((param, index) => ({
      ...param,
      ordem: index + 1
    }))
    setParameters(parametersWithOrder)
  }, [])

  // Funções para manipular resultados
  const addResult = () => {
    const newResult = {
      id: `result-${Date.now()}-${Math.random()}`,
      name: "",
      description: "",
      expression: "",
      unit: "",
      precision: 2,
      isMainResult: false,
      ordem: results.length + 1
    }
    setResults([...results, newResult])
  }

  const removeResult = (index) => {
    const resultName = results[index].name
    const updatedResults = results.filter((_, i) => i !== index)
    
    // Reordena os resultados restantes e ajusta o resultado principal se necessário
    const reorderedResults = updatedResults.map((result, i) => {
      const newResult = { ...result, ordem: i + 1 }
      // Se não há resultado principal, torna o primeiro como principal
      if (i === 0 && !updatedResults.some(r => r.isMainResult)) {
        newResult.isMainResult = true
      }
      return newResult
    })
    setResults(reorderedResults)
  }

  const updateResult = (index, field, value) => {
    const updatedResults = [...results]

    // Se estamos alterando o resultado principal
    if (field === "isMainResult" && value === true) {
      updatedResults.forEach((result, i) => {
        if (i !== index) {
          result.isMainResult = false
        }
      })

    }

    updatedResults[index][field] = value
    setResults(updatedResults)

    if (field === "expression") {

    }
  }

  // Função para reordenar resultados
  const reorderResults = useCallback((newResults) => {
    // Adiciona campo ordem aos resultados reordenados
    const resultsWithOrder = newResults.map((result, index) => ({
      ...result,
      ordem: index + 1
    }))
    setResults(resultsWithOrder)
    // Não fazer scroll automático durante reordenação
  }, [])

  // Função para inserir um parâmetro na expressão
  const insertParameterInExpression = (resultIndex, paramName) => {
    const textarea = document.getElementById(`result-expression-${resultIndex}`)
    const currentExpression = results[resultIndex].expression
    
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const paramText = `@[${paramName}]`
      
      // Insere o parâmetro na posição do cursor
      const newExpression = currentExpression.substring(0, start) + paramText + currentExpression.substring(end)
      updateExpressionWithHistory(resultIndex, newExpression)
      
      // Reposiciona o cursor após o parâmetro inserido
      setTimeout(() => {
        const newCursorPosition = start + paramText.length
        textarea.setSelectionRange(newCursorPosition, newCursorPosition)
        textarea.focus()
      }, 0)
    } else {
      // Fallback: adiciona no final se não conseguir encontrar o textarea
      const newExpression = currentExpression + `@[${paramName}]`
      updateExpressionWithHistory(resultIndex, newExpression)
    }
  }

  // Função para inserir uma função matemática na expressão
  const insertMathFunction = (resultIndex, funcName) => {
    const textarea = document.getElementById(`result-expression-${resultIndex}`)
    const currentExpression = results[resultIndex].expression
    
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const funcText = `${funcName}()`
      
      // Insere a função na posição do cursor
      const newExpression = currentExpression.substring(0, start) + funcText + currentExpression.substring(end)
      updateExpressionWithHistory(resultIndex, newExpression)
      
      // Reposiciona o cursor dentro dos parênteses da função
      setTimeout(() => {
        const newCursorPosition = start + funcText.length - 1 // Posiciona dentro dos parênteses
        textarea.setSelectionRange(newCursorPosition, newCursorPosition)
        textarea.focus()
      }, 0)
    } else {
      // Fallback: adiciona no final se não conseguir encontrar o textarea
      const newExpression = currentExpression + `${funcName}()`
      updateExpressionWithHistory(resultIndex, newExpression)
    }
  }

  // Função para inserir operador na posição do cursor
  const insertOperatorInExpression = (resultIndex, operator) => {
    const textarea = document.getElementById(`result-expression-${resultIndex}`)
    const currentExpression = results[resultIndex].expression
    
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      
      // Insere o operador na posição do cursor
      const newExpression = currentExpression.substring(0, start) + operator + currentExpression.substring(end)
      updateExpressionWithHistory(resultIndex, newExpression)
      
      // Reposiciona o cursor após o operador inserido
      setTimeout(() => {
        const newCursorPosition = start + operator.length
        textarea.setSelectionRange(newCursorPosition, newCursorPosition)
        textarea.focus()
      }, 0)
    } else {
      // Fallback: adiciona no final se não conseguir encontrar o textarea
      const newExpression = currentExpression + operator
      updateExpressionWithHistory(resultIndex, newExpression)
    }
  }

  // Função para adicionar uma tag
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
  
    }
  }

  // Função para remover uma tag
  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))

  }

  // Validação por etapa
  const validateStep = (currentStep) => {
    let isValid = true
    const errors = {
      basic: {},
      parameters: {},
      results: {},
    }

    if (currentStep === 1) {
      if (!calculationName.trim()) {
        errors.basic.name = "O nome do cálculo é obrigatório."
        isValid = false
      }
      if (!calculationDescription.trim()) {
        errors.basic.description = "A descrição do cálculo é obrigatória."
        isValid = false
      }
      if (!selectedCategoryIds || selectedCategoryIds.length === 0) {
        errors.basic.categories = "Selecione pelo menos uma categoria."
        isValid = false
      }
    } else if (currentStep === 2) {
      parameters.forEach((param, index) => {
        if (!param.name.trim()) {
          if (!errors.parameters[index]) errors.parameters[index] = {}
          errors.parameters[index].name = "O nome do parâmetro é obrigatório."
          isValid = false
        }

        if (param.type === "select" && (!param.options || param.options.length === 0)) {
          if (!errors.parameters[index]) errors.parameters[index] = {}
          errors.parameters[index].options = "Adicione pelo menos uma opção para o parâmetro de seleção."
          isValid = false
        }

        if (param.type === "select" && param.options) {
          param.options.forEach((option, optIndex) => {
            if (!option.label.trim() || !option.value.trim()) {
              if (!errors.parameters[index]) errors.parameters[index] = {}
              if (!errors.parameters[index].optionErrors) errors.parameters[index].optionErrors = {}
              errors.parameters[index].optionErrors[optIndex] = "Preencha o rótulo e o valor da opção."
              isValid = false
            }
          })
        }
      })
    } else if (currentStep === 3) {
      let hasMainResult = false

      results.forEach((result, index) => {
        if (!result.name.trim()) {
          if (!errors.results[index]) errors.results[index] = {}
          errors.results[index].name = "O nome do resultado é obrigatório."
          isValid = false
        }

        if (!result.expression.trim()) {
          if (!errors.results[index]) errors.results[index] = {}
          errors.results[index].expression = "A expressão de cálculo é obrigatória."
          isValid = false 
         } else {
          // Valida a expressão matemática usando a função validateExpression
          const paramValues = {}
          parameters.forEach(param => {
            if (param.name) {
              paramValues[param.name] = param.type === "number" ? 10 : 0
            }
          })
          
          const validationResult = validateExpression(result.expression, paramValues)
          
          if (!validationResult.isValid) {
            if (!errors.results[index]) errors.results[index] = {}
            errors.results[index].expression = validationResult.errorMessage
            isValid = false
          }
        }

        if (result.isMainResult) {
          hasMainResult = true
        }
      })

      if (!hasMainResult && results.length > 0) {
        errors.results.general = "Defina pelo menos um resultado como principal."
        isValid = false
      }
    }

    setValidationErrors(errors)
    return isValid
  }

  // Função para avançar para a próxima etapa
  const nextStep = async () => {
    if (validateStep(step)) {
      // Verificação especial para o nome do cálculo na primeira etapa
      if (step === 1 && calculationName !== originalName) {
        const exists = await checkCalculationNameExists(calculationName)
        if (exists) {
          setValidationErrors({
            ...validationErrors,
            basic: { ...validationErrors.basic, name: "Este nome de cálculo já existe." },
          })
          return
        }
      }

      setStep(step + 1)
      window.scrollTo(0, 0)
    }
  }

  // Função para voltar para a etapa anterior
  const prevStep = () => {
    setStep(step - 1)
    window.scrollTo(0, 0)
  }

  // Função para calcular o resultado com base na expressão
  const calculateResult = (expression, values) => {
    try {
           // Primeiro valida a expressão
      const validation = validateExpression(expression, values)
      if (!validation.isValid) {
        console.error("Erro de validação:", validation.errorMessage)
        return "Erro: " + validation.errorMessage
      }
      
      // Normaliza as funções matemáticas na expressão
      const normalizedExpression = normalizeMathFunctions(expression)

      // Avalia a expressão de forma segura
      const result = evaluateExpression(normalizedExpression, values, true)
      
      // Retorna "Erro" se o resultado for 0 devido a erro (mantém compatibilidade)
      return result === 0 && normalizedExpression.includes('@[') ? "Erro" : result
    } catch (error) {
      console.error("Erro ao calcular resultado:", error)
      return "Erro: " + error.message
    }
  }

  // Função para atualizar a visualização prévia
  const updatePreview = () => {
    if (!previewMode) return

    const calculatedResults = {}

    results.forEach((result, index) => {
      try {
        const value = calculateResult(result.expression, previewValues)
        calculatedResults[index] = typeof value === "number" ? value.toFixed(result.precision) : value
      } catch (error) {
        calculatedResults[index] = "Erro"
      }
    })

    setPreviewResults(calculatedResults)
  }

  // Atualiza a visualização prévia quando os valores mudam
  useEffect(() => {
    updatePreview()
  }, [previewValues, previewMode])

  // Inicializa os valores de visualização prévia
  useEffect(() => {
    if (previewMode) {
      const initialValues = {}
      parameters.forEach((param) => {
        if (param.name) {
          initialValues[param.name] = param.type === "number" ? "0" : ""
        }
      })
      setPreviewValues(initialValues)
    }
  }, [previewMode, parameters])

  // Função para atualizar o cálculo no Firestore
  // Função para validar o cálculo antes de salvar
  const validateCalculation = () => {
    const errors = {
      basic: {},
      parameters: {},
      results: {}
    }
    let isValid = true
  
    // Validar dados básicos
    if (!calculationName.trim()) {
      errors.basic.name = "Nome do cálculo é obrigatório"
      isValid = false
    }
    if (!selectedCategoryIds || selectedCategoryIds.length === 0) {
      errors.basic.categories = "Pelo menos uma categoria é obrigatória"
      isValid = false
    }
  
    // Validar parâmetros
    parameters.forEach((param, index) => {
      if (!param.name.trim()) {
        if (!errors.parameters[index]) errors.parameters[index] = {}
        errors.parameters[index].name = "Nome do parâmetro é obrigatório"
        isValid = false
      }
    })
  
    // Validar resultados
    results.forEach((result, index) => {
      if (!result.name.trim()) {
        if (!errors.results[index]) errors.results[index] = {}
        errors.results[index].name = "Nome do resultado é obrigatório"
        isValid = false
      }
      if (!result.expression.trim()) {
        if (!errors.results[index]) errors.results[index] = {}
        errors.results[index].expression = "Expressão é obrigatória"
        isValid = false
      }
    })
  
    return { isValid, errors }
  }
  
  // Função para atualizar o cálculo
  const handleUpdateCalculation = async () => {
    // Valida o formulário
    if (!validateStep(3)) {
      toastError("Verifique os campos obrigatórios antes de continuar.")
      return
    }
    
    try {
      setLoading(true);
      
      // Prepara parâmetros com ordem
      const parametersWithOrder = parameters.map((param, index) => ({
        ...param,
        ordem: param.ordem || index + 1,
        lastModified: new Date(),
        tipo: 'parameter'
      }))

      // Prepara resultados com ordem
      const resultsWithOrder = results.map((result, index) => ({
        ...result,
        ordem: result.ordem || index + 1,
        lastModified: new Date(),
        tipo: 'result'
      }))
      
      // Update the Firestore document
      const calculationRef = doc(db, "calculations", calculationId);
      await updateDoc(calculationRef, {
        name: calculationName,
        description: calculationDescription,
        categories: selectedCategoryIds, // Array de IDs em vez de string
        tags: tags,
        parameters: parametersWithOrder,
        results: resultsWithOrder,
        lastModified: new Date(),
      });
      setSuccess(true);
      toastSuccess(`Cálculo "${calculationName}" atualizado com sucesso!`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Erro ao atualizar cálculo:", error);
      setError("Erro ao atualizar cálculo. Tente novamente.");
      toastError("Falha ao atualizar cálculo. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  
  // Connect the function to the UI element
  <button onClick={handleUpdateCalculation} disabled={loading}>
    {loading ? "Atualizando..." : "Atualizar Cálculo"}
  </button>



  // Renderizar o indicador de progresso
  const renderProgressIndicator = () => (
    <div className="progress-indicator mb-8">
      <div className="flex justify-between">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`step-indicator ${i + 1 <= step ? "active" : ""} ${i + 1 < step ? "completed" : ""}`}
            onClick={() => i + 1 < step && setStep(i + 1)}
          >
            <div className="step-number">{i + 1 < step ? <CheckCircle size={16} /> : i + 1}</div>
            <div className="step-label">
              {i === 0 ? "Básico" : i === 1 ? "Parâmetros" : i === 2 ? "Resultados" : "Revisão"}
            </div>
          </div>
        ))}
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}></div>
      </div>
    </div>
  )

  if (loadingCategories) {
    return (
      <div className="create-calculation-container">
        <div className="loading-indicator">
          <Loader2 size={36} className="animate-spin" />
          <p>Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="create-calculation-container edit-mode">
      <div className="create-calculation-header">
        <div className="flex items-center">
          <button onClick={onCancel} className="back-button mr-4" aria-label="Voltar">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-primary">
            <Edit size={20} className="inline-block mr-2" />
            Editar Cálculo
          </h1>
        </div>

        <div className="header-actions">


          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`preview-toggle-button ${previewMode ? "active" : ""}`}
          >
            {previewMode ? "Editar" : "Visualizar"}
          </button>
        </div>
      </div>



      {/* Mensagens de feedback */}
      {error && (
        <div className="error-message" role="alert">
          <AlertTriangle size={18} />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="success-message" role="alert">
          <CheckCircle size={18} />
          <p>Cálculo atualizado com sucesso!</p>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-container">
            <Loader2 size={36} className="animate-spin" />
            <p>Processando...</p>
          </div>
        </div>
      )}

      {/* Indicador de progresso */}
      {renderProgressIndicator()}

      {/* Conteúdo principal */}
      <div className="create-calculation-content">
        {/* Etapa 1: Básico */}
        {step === 1 && !previewMode && (
          <div className="step-container">
            <div className="step-header">
              <FileText size={20} />
              <h2>Informações Básicas</h2>
            </div>

            {loadingCategories ? (
              <div className="loading-indicator">
                <Loader2 size={24} className="animate-spin" />
                <p>Carregando categorias...</p>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="edit-calculationName">
                    Nome do Cálculo <span className="required">*</span>
                  </label>
                  <input
                    id="edit-calculationName"
                    type="text"
                    placeholder="Ex: Cálculo de Adubação, Conversão de Unidades..."
                    value={calculationName}
                    onChange={(e) => setCalculationName(e.target.value)}
                    className={validationErrors.basic?.name ? "input-error" : ""}
                  />
                  {validationErrors.basic?.name && <div className="error-text">{validationErrors.basic.name}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="edit-calculationDescription">
                    Descrição do Cálculo <span className="required">*</span>
                  </label>
                  <textarea
                    id="edit-calculationDescription"
                    placeholder="Descreva o propósito deste cálculo e como ele pode ser útil..."
                    value={calculationDescription}
                    onChange={(e) => setCalculationDescription(e.target.value)}
                    className={validationErrors.basic?.description ? "input-error" : ""}
                    rows={4}
                  />
                  {validationErrors.basic?.description && (
                    <div className="error-text">{validationErrors.basic.description}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="edit-categorySelect">
                    Categorias <span className="required">*</span>
                  </label>
                  <MultiSelect
                    options={categories.map(category => ({
                      value: category.id,
                      label: category.name
                    }))}
                    value={selectedCategoryIds}
                    onValueChange={setSelectedCategoryIds}
                    placeholder="Selecione pelo menos uma categoria..."
                    searchPlaceholder="Buscar categorias..."
                    maxCount={2}
                    className={validationErrors.basic?.categories ? "border-red-500" : ""}
                  />
                  {validationErrors.basic?.categories && (
                    <div className="error-text">{validationErrors.basic.categories}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="edit-tags">Tags (opcional)</label>
                  <div className="tags-input-container">
                    <div className="tags-list">
                      {tags.map((tag, index) => (
                        <div key={index} className="tag-item">
                          <span>{tag}</span>
                          <button type="button" onClick={() => removeTag(tag)} className="tag-remove-button">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="tags-input-wrapper">
                      <input
                        id="edit-tags"
                        type="text"
                        placeholder="Adicionar tag..."
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      />
                      <button type="button" onClick={addTag} className="tag-add-button" disabled={!currentTag.trim()}>
                        <PlusCircle size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="help-text">
                    <Info size={14} />
                    <span>As tags ajudam os usuários a encontrar seu cálculo mais facilmente.</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Etapa 2: Parâmetros */}
        {step === 2 && !previewMode && (
          <div className="step-container">
            <div className="step-header">
              <Sliders size={20} />
              <h2>Parâmetros de Entrada</h2>
            </div>

            <div className="help-box mb-4">
              <HelpCircle size={18} />
              <div>
                <p className="font-medium">
                  Parâmetros são os valores que o usuário irá inserir para realizar o cálculo.
                </p>
                <p className="text-sm">
                  Defina um nome claro, escolha o tipo adequado e adicione uma unidade quando aplicável.
                </p>
              </div>
            </div>

            <div className="warning-box mb-4">
              <AlertTriangle size={18} />
              <div>
                <p className="font-medium">Atenção ao modificar parâmetros existentes!</p>
                <p className="text-sm">
                  Alterar o nome de um parâmetro atualizará automaticamente as expressões de cálculo que o utilizam.
                  Remover um parâmetro pode quebrar expressões existentes.
                </p>
              </div>
            </div>

            <DraggableList
              items={parameters}
              onReorder={reorderParameters}
              keyExtractor={(param) => param.id}
              renderItem={(param, index) => (
                <div className="parameter-card">
                  <div className="parameter-card-header">
                    <h3>Parâmetro {index + 1}</h3>
                    {parameters.length > 1 && (
                      <button
                        onClick={() => removeParameter(index)}
                        className="remove-button"
                        type="button"
                        aria-label="Remover parâmetro"
                      >
                        <Trash2 size={16} />
                        <span>Remover</span>
                      </button>
                    )}
                  </div>

                <div className="parameter-form">
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label htmlFor={`param-name-${index}`}>
                        Nome <span className="required">*</span>
                      </label>
                      <input
                        id={`param-name-${index}`}
                        type="text"
                        placeholder="Ex: Comprimento, Peso, Quantidade..."
                        value={param.name}
                        onChange={(e) => updateParameter(index, "name", e.target.value)}
                        className={validationErrors.parameters[index]?.name ? "input-error" : ""}
                      />
                      {validationErrors.parameters[index]?.name && (
                        <div className="error-text">{validationErrors.parameters[index].name}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor={`param-type-${index}`}>Tipo</label>
                      <select
                        id={`param-type-${index}`}
                        value={param.type}
                        onChange={(e) => updateParameter(index, "type", e.target.value)}
                      >
                        <option value="number">Número</option>
                        <option value="select">Seleção</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor={`param-unit-${index}`}>Unidade</label>
                      <input
                        id={`param-unit-${index}`}
                        type="text"
                        placeholder="Ex: kg, m, L..."
                        value={param.unit || ""}
                        onChange={(e) => updateParameter(index, "unit", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor={`param-description-${index}`}>Descrição</label>
                    <textarea
                      id={`param-description-${index}`}
                      placeholder="Descreva o que este parâmetro representa..."
                      value={param.description || ""}
                      onChange={(e) => updateParameter(index, "description", e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="form-group form-checkbox">
                    <input
                      id={`param-required-${index}`}
                      type="checkbox"
                      checked={param.required}
                      onChange={(e) => updateParameter(index, "required", e.target.checked)}
                    />
                    <label htmlFor={`param-required-${index}`}>Obrigatório</label>
                  </div>

                  {param.type === "select" && (
                    <div className="select-options-container">
                      <div className="select-options-header">
                        <h4>Opções de Seleção</h4>
                        <button type="button" onClick={() => addOptionToParameter(index)} className="add-option-button">
                          <PlusCircle size={14} />
                          <span>Adicionar Opção</span>
                        </button>
                      </div>

                      {validationErrors.parameters[index]?.options && (
                        <div className="error-text mb-2">{validationErrors.parameters[index].options}</div>
                      )}

                      {param.options && param.options.length > 0 ? (
                        <div className="select-options-list">
                          {param.options.map((option, optIndex) => (
                            <div key={optIndex} className="select-option-item">
                              <div className="form-row">
                                <div className="form-group flex-1">
                                  <label htmlFor={`option-label-${index}-${optIndex}`}>Rótulo</label>
                                  <input
                                    id={`option-label-${index}-${optIndex}`}
                                    type="text"
                                    placeholder="Ex: Pequeno, Médio, Grande..."
                                    value={option.label}
                                    onChange={(e) => updateParameterOption(index, optIndex, "label", e.target.value)}
                                    className={
                                      validationErrors.parameters[index]?.optionErrors?.[optIndex] ? "input-error" : ""
                                    }
                                  />
                                </div>

                                <div className="form-group flex-1">
                                  <label htmlFor={`option-value-${index}-${optIndex}`}>Valor</label>
                                  <input
                                    id={`option-value-${index}-${optIndex}`}
                                    type="text"
                                    placeholder="Ex: small, medium, large..."
                                    value={option.value}
                                    onChange={(e) => updateParameterOption(index, optIndex, "value", e.target.value)}
                                    className={
                                      validationErrors.parameters[index]?.optionErrors?.[optIndex] ? "input-error" : ""
                                    }
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeParameterOption(index, optIndex)}
                                  className="remove-option-button"
                                  aria-label="Remover opção"
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              {validationErrors.parameters[index]?.optionErrors?.[optIndex] && (
                                <div className="error-text">
                                  {validationErrors.parameters[index].optionErrors[optIndex]}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-options-message">
                          <p>Nenhuma opção adicionada. Clique em "Adicionar Opção" para começar.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              )}
            />

            <button onClick={addParameter} className="add-parameter-button" type="button">
              <PlusCircle size={18} />
              <span>Adicionar Parâmetro</span>
            </button>
          </div>
        )}

        {/* Etapa 3: Resultados */}
        {step === 3 && !previewMode && (
          <div className="step-container">
            <div className="step-header">
              <Calculator size={20} />
              <h2>Resultados do Cálculo</h2>
            </div>

            <div className="help-box mb-4">
              <HelpCircle size={18} />
              <div>
                <p className="font-medium">Resultados são os valores calculados com base nos parâmetros inseridos.</p>
                <p className="text-sm">Defina a expressão matemática usando os parâmetros e operadores matemáticos.</p>
              </div>
            </div>

            {validationErrors.results?.general && (
              <div className="error-message mb-4" role="alert">
                <AlertTriangle size={18} />
                <p>{validationErrors.results.general}</p>
              </div>
            )}

            <DraggableList
              items={results}
              onReorder={reorderResults}
              keyExtractor={(result) => result.id}
              renderItem={(result, resultIndex) => (
                <div className="result-card">
                  <div className="result-card-header">
                    <div className="flex items-center">
                      <h3>Resultado {resultIndex + 1}</h3>
                      {result.isMainResult && <span className="main-result-badge">Principal</span>}
                    </div>
                    {results.length > 1 && (
                      <button
                        onClick={() => removeResult(resultIndex)}
                        className="remove-button"
                        type="button"
                        aria-label="Remover resultado"
                      >
                        <Trash2 size={16} />
                        <span>Remover</span>
                      </button>
                    )}
                  </div>

                <div className="result-form">
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label htmlFor={`result-name-${resultIndex}`}>
                        Nome <span className="required">*</span>
                      </label>
                      <input
                        id={`result-name-${resultIndex}`}
                        type="text"
                        placeholder="Ex: Área Total, Volume Final..."
                        value={result.name}
                        onChange={(e) => updateResult(resultIndex, "name", e.target.value)}
                        className={validationErrors.results[resultIndex]?.name ? "input-error" : ""}
                      />
                      {validationErrors.results[resultIndex]?.name && (
                        <div className="error-text">{validationErrors.results[resultIndex].name}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor={`result-unit-${resultIndex}`}>Unidade</label>
                      <input
                        id={`result-unit-${resultIndex}`}
                        type="text"
                        placeholder="Ex: kg, m², L..."
                        value={result.unit || ""}
                        onChange={(e) => updateResult(resultIndex, "unit", e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`result-precision-${resultIndex}`}>Precisão</label>
                      <select
                        id={`result-precision-${resultIndex}`}
                        value={result.precision}
                        onChange={(e) => updateResult(resultIndex, "precision", Number.parseInt(e.target.value))}
                      >
                        <option value="0">0 decimais</option>
                        <option value="1">1 decimal</option>
                        <option value="2">2 decimais</option>
                        <option value="3">3 decimais</option>
                        <option value="4">4 decimais</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor={`result-description-${resultIndex}`}>Descrição</label>
                    <textarea
                      id={`result-description-${resultIndex}`}
                      placeholder="Descreva o que este resultado representa..."
                      value={result.description || ""}
                      onChange={(e) => updateResult(resultIndex, "description", e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="form-group">
                    <div className="expression-header">
                      <label htmlFor={`result-expression-${resultIndex}`}>
                        Expressão de Cálculo <span className="required">*</span>
                      </label>
                      <div className="expression-tools">
                        <div className="math-operators">
                          {["+", "-", "*", "/", "(", ")", "**"].map((op) => (
                            <button
                              key={op}
                              type="button"
                              onClick={() => insertOperatorInExpression(resultIndex, op)}
                              className="operator-button"
                            >
                              {op}
                            </button>
                          ))}
                        </div>

                        <div className="math-functions">
                          <button
                            type="button"
                            className="function-dropdown-button"
                            onClick={() =>
                              document.getElementById(`functions-dropdown-${resultIndex}`).classList.toggle("show")
                            }
                          >
                            Funções
                          </button>
                          <div id={`functions-dropdown-${resultIndex}`} className="function-dropdown-content">
                            {[
                              { name: "Math.sqrt", label: "Raiz Quadrada" },
                              { name: "Math.pow", label: "Potência" },
                              { name: "Math.abs", label: "Valor Absoluto" },
                              { name: "Math.round", label: "Arredondar" },
                              { name: "Math.floor", label: "Arredondar para Baixo" },
                              { name: "Math.ceil", label: "Arredondar para Cima" },
                              { name: "Math.sin", label: "Seno" },
                              { name: "Math.cos", label: "Cosseno" },
                              { name: "Math.tan", label: "Tangente" },
                              { name: "Math.log", label: "Logaritmo Natural" },
                              { name: "Math.exp", label: "Exponencial" },
                            ].map((func) => (
                              <button
                                key={func.name}
                                type="button"
                                onClick={() => {
                                  insertMathFunction(resultIndex, func.name)
                                  document.getElementById(`functions-dropdown-${resultIndex}`).classList.remove("show")
                                }}
                              >
                                {func.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="expression-controls">
                      <div className="undo-redo-buttons">
                        <button
                          type="button"
                          onClick={() => undoExpression(resultIndex)}
                          className="undo-redo-button"
                          disabled={!expressionHistory[resultIndex] || expressionHistoryIndex[resultIndex] <= 0}
                          title="Desfazer (Ctrl+Z)"
                        >
                          <Undo2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => redoExpression(resultIndex)}
                          className="undo-redo-button"
                          disabled={!expressionHistory[resultIndex] || expressionHistoryIndex[resultIndex] >= (expressionHistory[resultIndex]?.length - 1 || 0)}
                          title="Refazer (Ctrl+Y)"
                        >
                          <Redo2 size={16} />
                        </button>
                      </div>
                    </div>

                    <textarea
                      id={`result-expression-${resultIndex}`}
                      placeholder="Ex: @[param1] * @[param2] / 100"
                      value={result.expression}
                      onChange={(e) => updateExpressionWithHistory(resultIndex, e.target.value)}
                      className={`expression-input ${validationErrors.results[resultIndex]?.expression ? "input-error" : ""}`}
                      rows={3}
                    />
                    {validationErrors.results[resultIndex]?.expression && (
                      <div className="error-text">{validationErrors.results[resultIndex].expression}</div>
                    )}

                    {/* Validador de expressão */}
                    {result.expression && (
                      <ExpressionValidator 
                        expression={result.expression} 
                        onChange={(e) => updateExpressionWithHistory(resultIndex, e)}
                        parameters={parameters}
                      />
                    )}
                  </div>

                  <div className="parameters-list">
                    <label>Inserir Parâmetros:</label>
                    <div className="parameters-buttons">
                      {parameters.map((param, paramIndex) => (
                        <button
                          key={paramIndex}
                          type="button"
                          onClick={() => insertParameterInExpression(resultIndex, param.name)}
                          className="parameter-button"
                          disabled={!param.name.trim()}
                        >
                          <Hash size={14} />
                          <span>{param.name || `Parâmetro ${paramIndex + 1}`}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group form-checkbox">
                    <input
                      id={`result-main-${resultIndex}`}
                      type="checkbox"
                      checked={result.isMainResult}
                      onChange={(e) => updateResult(resultIndex, "isMainResult", e.target.checked)}
                    />
                    <label htmlFor={`result-main-${resultIndex}`}>Definir como resultado principal</label>
                  </div>
                </div>
              </div>
              )}
            />

            <button onClick={addResult} className="add-result-button" type="button">
              <PlusCircle size={18} />
              <span>Adicionar Resultado</span>
            </button>
          </div>
        )}

        {/* Etapa 4: Revisão */}
        {step === 4 && !previewMode && (
          <div className="step-container">
            <div className="step-header">
              <CheckCircle size={20} />
              <h2>Revisão Final</h2>
            </div>

            <div className="review-section">
              <h3>Informações Básicas</h3>
              <div className="review-item">
                <span className="review-label">Nome:</span>
                <span className="review-value">{calculationName}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Categorias:</span>
                <span className="review-value">
                  {selectedCategoryIds.map((categoryId) => {
                    const category = categories.find(cat => cat.id === categoryId)
                    return category ? category.name : categoryId
                  }).join(", ")}
                </span>
              </div>
              <div className="review-item">
                <span className="review-label">Descrição:</span>
                <span className="review-value">{calculationDescription}</span>
              </div>
              {tags.length > 0 && (
                <div className="review-item">
                  <span className="review-label">Tags:</span>
                  <div className="review-tags">
                    {tags.map((tag, index) => (
                      <span key={index} className="review-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="review-section">
              <h3>Parâmetros ({parameters.length})</h3>
              {parameters.map((param, index) => (
                <div key={index} className="review-parameter">
                  <div className="review-parameter-header">
                    <span className="parameter-name">{param.name}</span>
                    <span className="parameter-type">
                      {param.type === "number" ? "Número" : "Seleção"}
                      {param.unit && ` (${param.unit})`}
                    </span>
                  </div>
                  {param.description && <div className="parameter-description">{param.description}</div>}
                  {param.type === "select" && param.options && param.options.length > 0 && (
                    <div className="parameter-options">
                      <span className="options-label">Opções:</span>
                      <div className="options-list">
                        {param.options.map((option, optIndex) => (
                          <div key={optIndex} className="option-item">
                            {option.label} ({option.value})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="review-section">
              <h3>Resultados ({results.length})</h3>
              {results.map((result, index) => (
                <div key={index} className="review-result">
                  <div className="review-result-header">
                    <div>
                      <span className="result-name">{result.name}</span>
                      {result.unit && <span className="result-unit">({result.unit})</span>}
                      {result.isMainResult && <span className="main-result-badge">Principal</span>}
                    </div>
                    <span className="result-precision">{result.precision} casas decimais</span>
                  </div>
                  {result.description && <div className="result-description">{result.description}</div>}
                  <div className="result-expression">
                    <span className="expression-label">Expressão:</span>
                    <code>{result.expression}</code>
                  </div>
                </div>
              ))}
            </div>

            <div className="confirmation-box">
              <p>
                Todos os dados estão corretos? Ao confirmar, o cálculo será atualizado e as alterações serão
                disponibilizadas para os usuários.
              </p>
            </div>
          </div>
        )}

        {/* Modo de visualização prévia */}
        {previewMode && (
          <div className="preview-container">
            <div className="preview-header">
              <h2>Visualização do Cálculo</h2>
            </div>

            <div className="preview-calculation">
              <div className="preview-calculation-header">
                <h3>{calculationName || "Nome do Cálculo"}</h3>
                <p>{calculationDescription || "Descrição do cálculo"}</p>
              </div>

              <div className="preview-parameters">
                <h4>Parâmetros</h4>
                {parameters.map((param, index) => (
                  <div key={index} className="preview-parameter">
                    <label>
                      {param.name} {param.unit && `(${param.unit})`}
                    </label>
                    {param.type === "number" ? (
                      <input
                        type="number"
                        value={previewValues[param.name] || ""}
                        onChange={(e) =>
                          setPreviewValues({
                            ...previewValues,
                            [param.name]: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    ) : param.type === "select" ? (
                      <select
                        value={previewValues[param.name] || ""}
                        onChange={(e) =>
                          setPreviewValues({
                            ...previewValues,
                            [param.name]: e.target.value,
                          })
                        }
                      >
                        <option value="">Selecione...</option>
                        {param.options &&
                          param.options.map((option, optIndex) => (
                            <option key={optIndex} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={previewValues[param.name] || ""}
                        onChange={(e) =>
                          setPreviewValues({
                            ...previewValues,
                            [param.name]: e.target.value,
                          })
                        }
                        placeholder="Texto"
                      />
                    )}
                    {param.description && <div className="parameter-help-text">{param.description}</div>}
                  </div>
                ))}
              </div>

              <div className="preview-results">
                <h4>Resultados</h4>
                {results.map((result, index) => (
                  <div key={index} className={`preview-result ${result.isMainResult ? "main-result" : ""}`}>
                    <div className="result-header">
                      <span>
                        {result.name} {result.unit && `(${result.unit})`}
                      </span>
                      {result.isMainResult && <span className="main-badge">Principal</span>}
                    </div>
                    <div className="result-value">
                      {previewResults[index] !== undefined ? previewResults[index] : "—"}
                    </div>
                    {result.description && <div className="result-help-text">{result.description}</div>}
                  </div>
                ))}
              </div>


            </div>
          </div>
        )}
      </div>

      {/* Botões de navegação */}
      <div className="navigation-buttons">
        {step > 1 && (
          <button onClick={prevStep} className="prev-button" type="button">
            <ChevronLeft size={18} />
            <span>Voltar</span>
          </button>
        )}

        {step < totalSteps ? (
          <button onClick={nextStep} className="next-button" type="button">
            <span>Próximo</span>
            <ChevronRight size={18} />
          </button>
        ) : (
          <button onClick={handleUpdateCalculation} className="update-button" type="button" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Atualizando...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Atualizar Cálculo</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default EditCalculation
