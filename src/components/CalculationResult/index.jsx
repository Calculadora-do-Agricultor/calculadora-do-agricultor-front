import React, { useState } from "react"
import { Copy, Check } from "lucide-react"
import "./style.css"

const CalculationResult = ({ name, value, unit, description, disabled }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (disabled) return
    navigator.clipboard.writeText(value?.toString() || "").then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(err => {
      console.error("Copy error:", err)
    })
  }

  return (
    <div className={`calculation-result ${disabled ? "inactive" : ""}`}>
      <div className="calculation-result-label">
        <span className="result-name">{name}</span>
        {unit && <span className="unit">({unit})</span>}
      </div>
      <div className="calculation-result-value">
        <span>{value || "0"}</span>
        <button
          onClick={handleCopy}
          className={`copy-button ${copied ? "copiado" : ""}`}
          aria-label="Copy result"
          disabled={disabled}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span className="copy-text">{copied ? "Copiado" : "Copiar"}</span>
        </button>
      </div>
      {description && <div className="calculation-result-description">{description}</div>}
    </div>
  )
}

export default CalculationResult