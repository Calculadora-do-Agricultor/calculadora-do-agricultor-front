"use client"

import { useState, useEffect, useCallback } from "react"
import { db } from "../../services/firebaseConfig"
import { collection, addDoc, getDocs, query, where } from "firebase/firestore"
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
} from "lucide-react"
import "./styles.css"

const CreateCalculation = ({ onCreate, onCancel }) => {
  // Estado para controlar a navegação entre as etapas
  const [step, setStep] = useState(1)
  const totalSteps = 4

  // Dados do cálculo
  const [calculationName, setCalculationName] = useState("")
  const [calculationDescription, setCalculationDescription] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [tags, setTags] = useState([])
  const [currentTag, setCurrentTag] = useState("")

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
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Verificar se o nome do cálculo já existe
  const checkCalculationNameExists = useCallback(async (name) => {
    try {
      const q = query(collection(db, "calculations"), where("name", "==", name))
      const querySnapshot = await getDocs(q)
      return !querySnapshot.empty
    } catch (err) {
      console.error("Erro ao verificar nome do cálculo:", err)
      return false
    }
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const querySnapshot = await getDocs(collection(db, "categories"))
        const categoriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setCategories(categoriesData)
      } catch (err) {
        console.error("Erro ao carregar categorias:", err)
        setError("Não foi possível carregar as categorias. Tente novamente mais tarde.")
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Funções para manipular parâmetros
  const addParameter = () => {
    setParameters([...parameters, { name: "", type: "number", unit: "", description: "", required: true, options: [] }])
  }

  const removeParameter = (index) => {
    const updatedParameters = parameters.filter((_, i) => i !== index)
    setParameters(updatedParameters)
  }

  const updateParameter = (index, field, value) => {
    const updatedParameters = [...parameters]
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
    updatedParameters[paramIndex].options = updatedParameters[paramIndex].options.filter((_, i) => i !== optionIndex)
    setParameters(updatedParameters)
  }

  // Funções para manipular resultados
  const addResult = () => {
    setResults([
      ...results,
      {
        name: "",
        description: "",
        expression: "",
        unit: "",
        precision: 2,
        isMainResult: false,
      },
    ])
  }

  const removeResult = (index) => {
    const updatedResults = results.filter((_, i) => i !== index)
    setResults(updatedResults)
  }

  const updateResult = (index, field, value) => {
    const updatedResults = [...results]
    updatedResults[index][field] = value

    // Se estamos definindo um resultado como principal, desmarque os outros
    if (field === "isMainResult" && value === true) {
      updatedResults.forEach((result, i) => {
        if (i !== index) {
          result.isMainResult = false
        }
      })
    }

    setResults(updatedResults)
  }

  // Função para inserir um parâmetro na expressão
  const insertParameterInExpression = (resultIndex, paramName) => {
    const updatedResults = [...results]
    updatedResults[resultIndex].expression += paramName
    setResults(updatedResults)
  }

  // Função para inserir uma função matemática na expressão
  const insertMathFunction = (resultIndex, funcName) => {
    const updatedResults = [...results]
    updatedResults[resultIndex].expression += `${funcName}()`
    setResults(updatedResults)
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
      if (!selectedCategory) {
        errors.basic.category = "Selecione uma categoria."
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
      if (step === 1) {
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
      // Substitui os nomes dos parâmetros pelos valores
      let expressionToEval = expression

      // Substitui funções matemáticas comuns
      expressionToEval = expressionToEval
        .replace(/Math\.pow\(/g, "Math.pow(")
        .replace(/Math\.sqrt\(/g, "Math.sqrt(")
        .replace(/Math\.abs\(/g, "Math.abs(")
        .replace(/Math\.round\(/g, "Math.round(")
        .replace(/Math\.floor\(/g, "Math.floor(")
        .replace(/Math\.ceil\(/g, "Math.ceil(")
        .replace(/Math\.sin\(/g, "Math.sin(")
        .replace(/Math\.cos\(/g, "Math.cos(")
        .replace(/Math\.tan\(/g, "Math.tan(")
        .replace(/Math\.log\(/g, "Math.log(")
        .replace(/Math\.exp\(/g, "Math.exp(")
        .replace(/Math\.PI/g, "Math.PI")

      // Substitui os nomes dos parâmetros pelos valores
      Object.keys(values).forEach((key) => {
        const regex = new RegExp(key, "g")
        expressionToEval = expressionToEval.replace(regex, values[key])
      })

      // Avalia a expressão
      // eslint-disable-next-line no-eval
      return eval(expressionToEval)
    } catch (error) {
      console.error("Erro ao calcular resultado:", error)
      return "Erro"
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

  // Função para salvar o cálculo no Firestore
  const handleCreateCalculation = async () => {
    // Limpa mensagens anteriores
    setError("")
    setSuccess(false)

    // Valida o formulário
    if (!validateStep(3)) {
      return
    }

    try {
      setLoading(true)

      await addDoc(collection(db, "calculations"), {
        name: calculationName,
        description: calculationDescription,
        category: selectedCategory,
        parameters,
        results,
        tags,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      setSuccess(true)
      setError("")

      // Aguarda um momento para mostrar a mensagem de sucesso antes de redirecionar
      setTimeout(() => {
        if (onCreate) onCreate() // Retorna para a tela inicial
      }, 1500)
    } catch (err) {
      console.error("Erro ao criar cálculo:", err)
      setError("Erro ao criar cálculo. Verifique sua conexão e tente novamente.")
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  // Renderiza o indicador de progresso
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

  return (
    <div className="create-calculation-container">
      <div className="create-calculation-header">
        <div className="flex items-center">
          <button onClick={onCancel} className="back-button mr-4" aria-label="Voltar">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-primary">Criar Novo Cálculo</h1>
        </div>

        {step < totalSteps && (
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`preview-toggle-button ${previewMode ? "active" : ""}`}
          >
            {previewMode ? "Editar" : "Visualizar"}
          </button>
        )}
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
          <p>Cálculo criado com sucesso!</p>
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
                  <label htmlFor="calculationName">
                    Nome do Cálculo <span className="required">*</span>
                  </label>
                  <input
                    id="calculationName"
                    type="text"
                    placeholder="Ex: Cálculo de Adubação, Conversão de Unidades..."
                    value={calculationName}
                    onChange={(e) => setCalculationName(e.target.value)}
                    className={validationErrors.basic?.name ? "input-error" : ""}
                  />
                  {validationErrors.basic?.name && <div className="error-text">{validationErrors.basic.name}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="calculationDescription">
                    Descrição do Cálculo <span className="required">*</span>
                  </label>
                  <textarea
                    id="calculationDescription"
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
                  <label htmlFor="categorySelect">
                    Categoria <span className="required">*</span>
                  </label>
                  <select
                    id="categorySelect"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={validationErrors.basic?.category ? "input-error" : ""}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.basic?.category && (
                    <div className="error-text">{validationErrors.basic.category}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="tags">Tags (opcional)</label>
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
                        id="tags"
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

            {parameters.map((param, index) => (
              <div key={index} className="parameter-card">
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
                        <option value="text">Texto</option>
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
            ))}

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

            {results.map((result, resultIndex) => (
              <div key={resultIndex} className="result-card">
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
                              onClick={() => updateResult(resultIndex, "expression", result.expression + op)}
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

                    <textarea
                      id={`result-expression-${resultIndex}`}
                      placeholder="Ex: param1 * param2 / 100"
                      value={result.expression}
                      onChange={(e) => updateResult(resultIndex, "expression", e.target.value)}
                      className={`expression-input ${validationErrors.results[resultIndex]?.expression ? "input-error" : ""}`}
                      rows={3}
                    />
                    {validationErrors.results[resultIndex]?.expression && (
                      <div className="error-text">{validationErrors.results[resultIndex].expression}</div>
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
            ))}

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
                <span className="review-label">Categoria:</span>
                <span className="review-value">{selectedCategory}</span>
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
                      {param.type === "number" ? "Número" : param.type === "text" ? "Texto" : "Seleção"}
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
                Todos os dados estão corretos? Ao confirmar, o cálculo será criado e disponibilizado para os usuários.
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

              <div className="preview-calculate">
                <button onClick={updatePreview} className="calculate-button">
                  <Calculator size={16} />
                  <span>Calcular</span>
                </button>
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
          <button onClick={handleCreateCalculation} className="create-button" type="button" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Criando...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Criar Cálculo</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default CreateCalculation
