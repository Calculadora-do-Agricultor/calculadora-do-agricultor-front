"use client"

import { useState, useEffect, useRef } from "react"
import { X, Copy, Calculator, Check, Info } from "lucide-react"
import "./styles.css"

/**
 * Componente de Modal para exibição e interação com cálculos
 * @param {Object} props
 * @param {Object} props.calculation - Objeto contendo os dados do cálculo
 * @param {boolean} props.isOpen - Estado que controla se o modal está aberto
 * @param {Function} props.onClose - Função para fechar o modal
 */
export function CalculationModal({ calculation, isOpen, onClose }) {
  const [paramValues, setParamValues] = useState({})
  const [results, setResults] = useState({})
  const [copied, setCopied] = useState({})
  const [allFieldsFilled, setAllFieldsFilled] = useState(false)
  const modalRef = useRef(null)

  // Inicializa os valores dos parâmetros quando o cálculo muda
  useEffect(() => {
    if (calculation && calculation.parameters) {
      const initialValues = {}
      calculation.parameters.forEach((param) => {
        initialValues[param.name] = ""
      })
      setParamValues(initialValues)

      // Initialize results with zero values to maintain stable layout
      const initialResults = {}
      if (calculation.results && calculation.results.length > 0) {
        calculation.results.forEach((result, index) => {
          initialResults[`result_${index}`] = {
            name: result.name,
            description: result.description,
            value: "0",
            unit: result.unit || "",
          }
        })
      } else {
        initialResults.value = "0"
        if (calculation.additionalResults && calculation.additionalResults.length > 0) {
          calculation.additionalResults.forEach((result) => {
            initialResults[result.key] = "0"
          })
        }
      }
      setResults(initialResults)

      setAllFieldsFilled(false)
    }
  }, [calculation])

  // Verifica se todos os campos estão preenchidos
  useEffect(() => {
    if (calculation && calculation.parameters) {
      const filled = calculation.parameters.every((param) => paramValues[param.name] && paramValues[param.name] !== "")
      setAllFieldsFilled(filled)
    }
  }, [paramValues, calculation])

  // Calcula os resultados quando os valores dos parâmetros mudam
  useEffect(() => {
    if (calculation && Object.keys(paramValues).length > 0 && allFieldsFilled) {
      try {
        // Prepara o objeto de resultados
        const newResults = {}

        // Verifica se o cálculo tem múltiplos resultados (novo formato)
        if (calculation.results && calculation.results.length > 0) {
          // Processa cada resultado definido
          calculation.results.forEach((result, index) => {
            const calculatedValue = calculateExpressionResult(result.expression, paramValues)
            newResults[`result_${index}`] = {
              name: result.name,
              description: result.description,
              value: calculatedValue.toFixed(2),
              unit: result.unit || "",
            }
          })
        } else {
          // Compatibilidade com o formato antigo (resultado único)
          const calculatedValue = calculateResult(calculation, paramValues)
          newResults.value = calculatedValue.toFixed(2)

          // Calcula resultados adicionais se existirem (formato antigo)
          if (calculation.additionalResults && calculation.additionalResults.length > 0) {
            calculation.additionalResults.forEach((result) => {
              if (result.key === "coleta50m") {
                newResults[result.key] = ((calculatedValue * 50) / 1000).toFixed(2)
              }
            })
          }
        }

        setResults(newResults)
      } catch (error) {
        console.error("Erro ao calcular resultado:", error)
      }
    }
  }, [paramValues, calculation, allFieldsFilled])

  // Função para calcular o resultado com base na expressão do cálculo (formato antigo)
  const calculateResult = (calculation, values) => {
    if (calculation.expression) {
      try {
        return calculateExpressionResult(calculation.expression, values)
      } catch (error) {
        console.error("Erro ao avaliar expressão:", error)
        return 0
      }
    }

    return 0 // Valor padrão se não houver expressão
  }

  // Função para calcular o resultado de uma expressão com base nos valores dos parâmetros
  const calculateExpressionResult = (expression, values) => {
    try {
      // Cria um contexto com os valores dos parâmetros
      const context = {}

      // Converte os valores para números quando possível
      Object.keys(values).forEach((key) => {
        context[key] = Number.parseFloat(values[key]) || 0
      })

      // Substitui os nomes dos parâmetros na expressão pelos valores
      let expressionToEval = expression
      Object.keys(context).forEach((key) => {
        // Substitui todas as ocorrências do nome do parâmetro pelo seu valor
        const regex = new RegExp(key, "g")
        expressionToEval = expressionToEval.replace(regex, context[key])
      })

      // Avalia a expressão
      // eslint-disable-next-line no-eval
      return eval(expressionToEval)
    } catch (error) {
      console.error("Erro ao avaliar expressão:", error)
      return 0
    }
  }

  // Atualiza o valor de um parâmetro
  const handleParamChange = (paramName, value) => {
    setParamValues((prev) => ({
      ...prev,
      [paramName]: value,
    }))
  }

  // Copia o resultado para a área de transferência
  const copyToClipboard = (text, resultId) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied((prev) => ({
          ...prev,
          [resultId]: true,
        }))
        setTimeout(() => {
          setCopied((prev) => ({
            ...prev,
            [resultId]: false,
          }))
        }, 2000)
      },
      (err) => {
        console.error("Erro ao copiar texto: ", err)
      },
    )
  }

  // Fecha o modal ao pressionar ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      window.addEventListener("keydown", handleEsc)
    }

    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [isOpen, onClose])

  if (!isOpen || !calculation) return null

  return (
    <div className="calculation-modal-overlay">
      <div className="calculation-modal" ref={modalRef}>
        <div className="calculation-modal-header">
          <div className="calculation-modal-title">
            <div className="calculation-modal-icon">
              <Calculator size={24} />
            </div>
            <div>
              <h2>{calculation.name || "Cálculo"}</h2>
              <p>{calculation.description || "Descrição do cálculo"}</p>
            </div>
          </div>
          <button onClick={onClose} className="calculation-modal-close" aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <div className="calculation-modal-content">
          <div className="calculation-modal-section">
            <div className="section-header">
              <h3>Parâmetros</h3>
              <div className="section-badge">
                {allFieldsFilled ? (
                  <span className="badge success">
                    <Check size={14} />
                    Completo
                  </span>
                ) : (
                  <span className="badge warning">
                    <Info size={14} />
                    Preencha todos os campos
                  </span>
                )}
              </div>
            </div>

            <div className="calculation-modal-parameters">
              {calculation.parameters &&
                calculation.parameters.map((param, index) => (
                  <div key={index} className="calculation-modal-parameter">
                    <label htmlFor={`param-${index}`}>
                      {param.name}
                      {param.unit && <span className="unit">({param.unit})</span>}
                    </label>
                    {param.type === "select" ? (
                      <div className="select-wrapper">
                        <select
                          id={`param-${index}`}
                          value={paramValues[param.name] || ""}
                          onChange={(e) => handleParamChange(param.name, e.target.value)}
                        >
                          <option value="">Selecione uma opção</option>
                          {param.options &&
                            param.options.map((option, idx) => (
                              <option key={idx} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                        </select>
                      </div>
                    ) : (
                      <input
                        id={`param-${index}`}
                        type={param.type === "number" ? "number" : "text"}
                        value={paramValues[param.name] || ""}
                        onChange={(e) => handleParamChange(param.name, e.target.value)}
                        placeholder={`Digite ${param.name.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}
            </div>
          </div>

          <div className="calculation-modal-divider"></div>

          <div className="calculation-modal-section">
            <div className="section-header">
              <h3>Resultados</h3>
            </div>

            <div className={`calculation-modal-results ${!allFieldsFilled ? "inactive" : ""}`}>
              {/* Verifica se estamos usando o novo formato de múltiplos resultados */}
              {calculation.results && calculation.results.length > 0 ? (
                // Novo formato: múltiplos resultados
                Object.keys(results).map((key) => (
                  <div key={key} className="calculation-result">
                    <div className="calculation-result-label">
                      <span className="result-name">{results[key].name}</span>
                      {results[key].unit && <span className="unit">({results[key].unit})</span>}
                    </div>
                    <div className="calculation-result-value">
                      <span>{results[key].value || "0"}</span>
                      <button
                        onClick={() => copyToClipboard(results[key].value?.toString() || "0", key)}
                        className={`copy-button ${copied[key] ? "copied" : ""}`}
                        aria-label="Copiar resultado"
                        disabled={!allFieldsFilled}
                      >
                        {copied[key] ? <Check size={16} /> : <Copy size={16} />}
                        <span className="copy-text">{copied[key] ? "Copiado" : "Copiar"}</span>
                      </button>
                    </div>
                    {results[key].description && (
                      <div className="calculation-result-description">{results[key].description}</div>
                    )}
                  </div>
                ))
              ) : (
                // Formato antigo: resultado único
                <>
                  <div className="calculation-result primary">
                    <div className="calculation-result-label">
                      <span className="result-name">{calculation.resultName || "Resultado"}</span>
                      <span className="unit">{calculation.resultUnit || ""}</span>
                    </div>
                    <div className="calculation-result-value">
                      <span>{results.value || "0"}</span>
                      <button
                        onClick={() => copyToClipboard(results.value?.toString() || "0", "main")}
                        className={`copy-button ${copied["main"] ? "copied" : ""}`}
                        aria-label="Copiar resultado"
                        disabled={!allFieldsFilled}
                      >
                        {copied["main"] ? <Check size={16} /> : <Copy size={16} />}
                        <span className="copy-text">{copied["main"] ? "Copiado" : "Copiar"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Resultados adicionais (formato antigo) */}
                  {calculation.additionalResults &&
                    calculation.additionalResults.map((result, index) => (
                      <div key={index} className="calculation-result secondary">
                        <div className="calculation-result-label">
                          <span className="result-name">{result.name}</span>
                          <span className="unit">{result.unit}</span>
                        </div>
                        <div className="calculation-result-value">
                          <span>{results[result.key] || "0"}</span>
                          <button
                            onClick={() => copyToClipboard(results[result.key]?.toString() || "0", result.key)}
                            className={`copy-button ${copied[result.key] ? "copied" : ""}`}
                            aria-label="Copiar resultado"
                            disabled={!allFieldsFilled}
                          >
                            {copied[result.key] ? <Check size={16} /> : <Copy size={16} />}
                            <span className="copy-text">{copied[result.key] ? "Copiado" : "Copiar"}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
