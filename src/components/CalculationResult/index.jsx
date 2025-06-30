import React from "react"
import { Copy, Check } from "lucide-react"
import "./style.css"

const CalculationResult = ({ name, value, unit, description, disabled, copied, onCopy, primary }) => {
  const handleCopy = () => {
    if (disabled || !onCopy) return;
    onCopy();
  };

  return (
    <div className={`calculation-result ${disabled ? "inactive" : ""} ${primary ? "primary" : ""}`}>
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