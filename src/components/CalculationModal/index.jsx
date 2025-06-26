import React, { useRef, useEffect } from "react"
import { X, Copy, Calculator, Check, Info } from "lucide-react"
import { useCalculationResult } from "../../hooks/useCalculationResult"
import { useToast } from "../../context/ToastContext"
import "./styles.css"
import CalculationResult from "../CalculationResult"

const CalculationModal = ({ calculation, isOpen, onClose }) => {
  const { paramValues, setParamValues, results, allFieldsFilled, error } = useCalculationResult(calculation)
  const modalRef = useRef(null)
  const [copied, setCopied] = React.useState({})
  const { success, error: toastError, info } = useToast()

  const handleParamChange = (paramName, value) => {
    setParamValues(prev => ({ ...prev, [paramName]: value }))
  }

  const copyToClipboard = (text, key, resultName) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(prev => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [key]: false }))
      }, 2000)
      success(`Valor "${resultName || 'Resultado'}" copiado para a área de transferência!`)
    }).catch(err => {
      console.error("Copy error:", err)
      toastError("Não foi possível copiar o resultado. Tente novamente.")
    })
  }

  useEffect(() => {
    const handleEsc = e => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      window.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      window.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])
  
  useEffect(() => {
    if (error) {
      toastError("Erro no cálculo: " + error)
    } else if (allFieldsFilled && Object.keys(results).length > 0) {
      info("Cálculo realizado com sucesso!")
    }
  }, [error, allFieldsFilled, results, toastError, info])

  if (!isOpen || !calculation) return null

  return (
    <div className="calculation-modal-overlay">
      <div className="calculation-modal" ref={modalRef}>
        <div className="calculation-modal-header">
          <div className="calculation-modal-title">
            <div className="calculation-modal-icon"><Calculator size={24} /></div>
            <div>
              <h2>{calculation.name || "Calculation"}</h2>
              <p>{calculation.description || "Calculation description"}</p>
            </div>
          </div>
          <button onClick={onClose} className="calculation-modal-close" aria-label="Close">
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
                    <Check size={14} /> Completo
                  </span>
                ) : (
                  <span className="badge warning">
                    <Info size={14} /> Preencha todos os campos
                  </span>
                )}
              </div>
            </div>

            <div className="calculation-modal-parameters">
              {calculation.parameters?.map((param, i) => (
                <div key={i} className="calculation-modal-parameter">
                  <label htmlFor={`param-${i}`}>
                    {param.name} {param.unit && <span className="unit">({param.unit})</span>}
                  </label>
                  {param.type === "select" ? (
                    <select
                      id={`param-${i}`}
                      value={paramValues[param.name] || ""}
                      onChange={e => handleParamChange(param.name, e.target.value)}
                    >
                      <option value="">Selecione uma opção</option>
                      {param.options?.map((opt, idx) => (
                        <option key={idx} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`param-${i}`}
                      type="number"
                      value={paramValues[param.name] || ""}
                      onChange={e => handleParamChange(param.name, e.target.value)}
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
              {error && <p style={{ color: "red" }}>{error}</p>}

              {calculation.results && calculation.results.length > 0 ? (
                Object.keys(results).map(key => (

                  <CalculationResult
                    key={key}
                    name={results[key]?.name}
                    value={results[key]?.value}
                    unit={results[key]?.unit}
                    description={results[key]?.description}
                    copied={copied[key]}
                    onCopy={() => copyToClipboard(results[key]?.value || "0", key)}
                    disabled={!allFieldsFilled}
                  />
                ))
              ) : (
                <>
                  <CalculationResult
                    name={calculation.resultName || "Result"}
                    value={results.value || "0"}
                    unit={calculation.resultUnit || ""}
                    copied={copied["main"]}
                    onCopy={() => copyToClipboard(results.value || "0", "main")}
                    disabled={!allFieldsFilled}
                    primary
                  />

                  {calculation.additionalResults?.map((result, i) => (
                    <CalculationResult
                      key={i}
                      name={result.name}
                      value={results[result.key] || "0"}
                      unit={result.unit}
                      copied={copied[result.key]}
                      onCopy={() => copyToClipboard(results[result.key] || "0", result.key)}
                      disabled={!allFieldsFilled}
                    />

                  ))}
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div >
  )
}

export default CalculationModal
