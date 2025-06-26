import React, { useRef, useEffect } from "react"
import { X, Copy, Calculator, Check, Info } from "lucide-react"
import { useCalculationResult } from "../../hooks/useCalculationResult"
import "./styles.css"
import { useFormParameters } from "../../hooks/useFormParameters"

const CalculationModal = ({ calculation, isOpen, onClose }) => {
const { paramValues, setParamValue, allFieldsFilled } = useFormParameters(calculation)
const { results, error } = useCalculationResult(calculation, paramValues, allFieldsFilled)

  const modalRef = useRef(null)
  const [copied, setCopied] = React.useState({})

const handleParamChange = setParamValue

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(prev => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [key]: false }))
      }, 2000)
    }).catch(err => {
      console.error("Copy error:", err)
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

  if (!isOpen || !calculation) return null

  return (
    <div className="calculation-modal-overlay">
      <div className="calculation-modal" ref={modalRef}>
        <div className="calculation-modal-header">
          <div className="calculation-modal-title">
            <div className="calculation-modal-icon"><Calculator size={24} /></div>
            <div>
              <h2>{calculation.name || "Cálculo"}</h2>
              <p>{calculation.description || "Nenhuma descrição disponível"}</p>
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
              {error && <p className="error-message">{error}</p>}

              {calculation.results && calculation.results.length > 0 && Object.keys(results).map(key => (
                <div key={key} className="calculation-result">
                  <div className="calculation-result-label">
                    <span className="result-name">{results[key]?.name}</span>
                    {results[key]?.unit && <span className="unit">({results[key]?.unit})</span>}
                  </div>
                  <div className="calculation-result-value">
                    <span>{results[key]?.value || "0"}</span>
                    <button
                      onClick={() => copyToClipboard(results[key]?.value || "0", key)}
                      className={`copy-button ${copied[key] ? "copied" : ""}`}
                      aria-label="Copy result"
                      disabled={!allFieldsFilled}
                    >
                      {copied[key] ? <Check size={16} /> : <Copy size={16} />}
                      <span className="copy-text">{copied[key] ? "Copiado" : "Copiar"}</span>
                    </button>
                  </div>
                  {results[key]?.description && (
                    <div className="calculation-result-description">{results[key].description}</div>
                  )}
                </div>
              ))}
              {(!calculation.results || calculation.results.length === 0) && (
                <>
                  <div className="calculation-result primary">
                    <div className="calculation-result-label">
                      <span className="result-name">{calculation.resultName || "Resultado"}</span>
                      <span className="unit">{calculation.resultUnit || ""}</span>
                    </div>
                    <div className="calculation-result-value">
                      <span>{results.value || "0"}</span>
                      <button
                        onClick={() => copyToClipboard(results.value || "0", "main")}
                        className={`copy-button ${copied["main"] ? "copied" : ""}`}
                        aria-label="Copy result"
                        disabled={!allFieldsFilled}
                      >
                        {copied["main"] ? <Check size={16} /> : <Copy size={16} />}
                        <span className="copy-text">{copied["main"] ? "Copiado" : "Copiar"}</span>
                      </button>
                    </div>
                  </div>

                  {calculation.additionalResults?.map((result, i) => (
                    <div key={i} className="calculation-result secondary">
                      <div className="calculation-result-label">
                        <span className="result-name">{result.name}</span>
                        <span className="unit">{result.unit}</span>
                      </div>
                      <div className="calculation-result-value">
                        <span>{results[result.key] || "0"}</span>
                        <button
                          onClick={() => copyToClipboard(results[result.key] || "0", result.key)}
                          className={`copy-button ${copied[result.key] ? "copied" : ""}`}
                          aria-label="Copy result"
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

export default CalculationModal
