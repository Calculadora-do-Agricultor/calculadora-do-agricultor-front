import React, { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { X, Copy, Calculator, Check, Info } from "lucide-react" // Removi as importações não utilizadas de 'lucide-react'
// Removi as importações de Firebase e DraggableList, pois não são usadas no código fornecido.
// import { doc, getDoc } from "firebase/firestore"
// import { db } from "../../services/firebaseConfig"
// import DraggableList from "../DraggableList"
import { evaluateExpression, normalizeMathFunctions, validateExpression } from "../../utils/mathEvaluator"
import "./styles.css"

/**
 * Componente de Modal para exibição e interação com cálculos
 * @param {Object} props
 * @param {Object} props.calculation - Objeto contendo os dados do cálculo
 * @param {boolean} props.isOpen - Estado que controla se o modal está aberto
 * @param {Function} props.onClose - Função para fechar o modal
 */
const CalculationModal = ({ calculation, isOpen, onClose }) => {
  const [paramValues, setParamValues] = useState({})
  const [results, setResults] = useState({})
  const [copied, setCopied] = useState({})
  const [allFieldsFilled, setAllFieldsFilled] = useState(false)
  const modalRef = useRef(null)

  // Fecha o modal ao pressionar Escape
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Inicializa os valores dos parâmetros quando o cálculo muda
  useEffect(() => {
    if (calculation && calculation.parameters) {
      const initialValues = {}
      calculation.parameters.forEach((param) => {
        initialValues[param.name] = ""
      })
      setParamValues(initialValues)

      // Inicializa os resultados com valores padrão para manter o layout estável
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

  // Função para calcular resultado de uma expressão
  const calculateExpressionResult = (expression, params) => {
    try {
      // Cria um contexto com os valores dos parâmetros
      const context = {}
      // Converte os valores para números quando possível
      Object.keys(params).forEach((key) => {
        context[key] = Number.parseFloat(params[key]) || 0
      })

      // Valida a expressão antes de calcular
      const validation = validateExpression(expression, context)
      if (!validation.isValid) {
        console.error("Erro de validação na expressão:", validation.errorMessage)
        return 0
      }

      // Normaliza as funções matemáticas na expressão
      const normalizedExpression = normalizeMathFunctions(expression)

      return evaluateExpression(normalizedExpression, context, true)
    } catch (error) {
      console.error('Erro ao calcular expressão:', error)
      return 0
    }
  }

  // Função para calcular resultado no formato antigo (reutiliza calculateExpressionResult)
  const calculateResult = (calc, params) => {
    try {
      return calculateExpressionResult(calc.expression, params)
    } catch (error) {
      console.error('Erro ao calcular resultado (formato antigo):', error)
      return 0
    }
  }

  // Calcula os resultados quando os valores dos parâmetros mudam
  useEffect(() => {
    if (calculation && Object.keys(paramValues).length > 0 && allFieldsFilled) {
      try {
        const newResults = {};

        if (calculation.results && calculation.results.length > 0) {
          // Novo formato: múltiplos resultados
          calculation.results.forEach((result, index) => {
            const calculatedValue = calculateExpressionResult(result.expression, paramValues);
            newResults[`result_${index}`] = {
              name: result.name,
              description: result.description,
              value: calculatedValue.toFixed(2),
              unit: result.unit || "",
            };
          });
        } else {
          // Compatibilidade com o formato antigo: resultado único
          const calculatedValue = calculateResult(calculation, paramValues);
          newResults.value = calculatedValue.toFixed(2);

          // Calcula resultados adicionais se existirem (formato antigo)
          if (calculation.additionalResults && calculation.additionalResults.length > 0) {
            calculation.additionalResults.forEach((result) => {
              if (result.key === "coleta50m") {
                newResults[result.key] = ((calculatedValue * 50) / 1000).toFixed(2);
              }
            });
          }
        }
        setResults(newResults);
      } catch (error) {
        console.error("Erro ao calcular resultados:", error);
      }
    }
  }, [paramValues, calculation, allFieldsFilled])

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

  // Fecha o modal ao pressionar ESC e controla o scroll do body
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      window.addEventListener("keydown", handleEsc)
      // Bloqueia o scroll do body quando o modal está aberto
      document.body.style.overflow = 'hidden'
    } else {
      // Restaura o scroll do body quando o modal é fechado
      document.body.style.overflow = 'unset'
    }

    // Cleanup function para garantir que o scroll seja restaurado
    return () => {
      window.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !calculation) return null

  return createPortal(
    <div className="calculation-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="calculation-modal" ref={modalRef}>
        <div className="calculation-modal-header">
          <div className="calculation-modal-title">
            <div className="calculation-modal-icon">
              <Calculator size={24} />
            </div>
            <div>
              <h2>{calculation.name || calculation.nome}</h2>
              <p>{calculation.description || calculation.descricao}</p>
            </div>
          </div>
          <button
            className="calculation-modal-close"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={24} />
          </button>
        </div>
        <div className="calculation-modal-content">
          {/* Seção de parâmetros */}
          <div className="calculation-modal-section">
            <div className="section-header">
              <h3>Parâmetros</h3>
              <div className="section-badge">
                {allFieldsFilled ? (
                  <div className="badge success">
                    <Check size={14} />
                    Todos os campos preenchidos
                  </div>
                ) : (
                  <div className="badge warning">
                    <Info size={14} />
                    Preencha todos os campos
                  </div>
                )}
              </div>
            </div>
            <div className="calculation-modal-parameters">
              {calculation.parameters?.map((param, index) => (
                <div key={param.name} className="calculation-modal-parameter">
                  <label htmlFor={`param-${index}`}>
                    {param.label || param.name}
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
                      type="number"
                      value={paramValues[param.name] || ""}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      placeholder={`Digite o valor para ${param.label || param.name}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="calculation-modal-divider" />

          {/* Seção de resultados */}
          <div className="calculation-modal-section">
            <div className="section-header">
              <h3>Resultados</h3>
            </div>
            <div className={`calculation-modal-results ${!allFieldsFilled ? "inactive" : ""}`}>
              {calculation.results && calculation.results.length > 0 ? (
                // Novo formato com múltiplos resultados
                Object.keys(results).map((key) => {
                    const resultData = results[key];
                    if (!resultData) return null; // Adiciona uma verificação para garantir que resultData existe

                    return (
                        <div key={key} className="calculation-result">
                            <div className="result-header">
                                <h4>{resultData.name}</h4>
                                {resultData.description && (
                                    <p className="result-description">{resultData.description}</p>
                                )}
                            </div>
                            <div className="result-value">
                                <span className="value">
                                    {resultData.value || "0"}
                                </span>
                                {resultData.unit && (
                                    <span className="unit">{resultData.unit}</span>
                                )}
                                <button
                                    className={`copy-button ${copied[key] ? "copied" : ""}`}
                                    onClick={() => copyToClipboard(resultData.value?.toString() || "0", key)}
                                    aria-label="Copiar resultado"
                                    disabled={!allFieldsFilled}
                                >
                                    {copied[key] ? (
                                        <Check size={16} />
                                    ) : (
                                        <Copy size={16} />
                                    )}
                                    <span className="copy-text">{copied[key] ? "Copiado" : "Copiar"}</span>
                                </button>
                            </div>
                        </div>
                    );
                })
              ) : (
                // Formato antigo com resultado único
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
    </div>,
    document.body
  );
};

export default CalculationModal;