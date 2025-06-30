import React, { useEffect, useRef } from "react";
import { X, Calculator, Play, ArrowLeft, Info, Hash } from "lucide-react";
import { Button } from "../ui/button";
import "./styles.css";

const FormulaPreviewModal = ({
  calculation,
  paramValues,
  isOpen,
  onClose,
  onProceedToCalculation,
}) => {
  const modalRef = useRef(null);

  // Handle ESC key and overlay click
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    const handleOverlayClick = (e) => {
      if (e.target === e.currentTarget) onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";

      // Add overlay click listener
      const overlay = document.querySelector(".formula-preview-overlay");
      if (overlay) {
        overlay.addEventListener("click", handleOverlayClick);
      }
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
      const overlay = document.querySelector(".formula-preview-overlay");
      if (overlay) {
        overlay.removeEventListener("click", handleOverlayClick);
      }
    };
  }, [isOpen, onClose]);

  // Format expression for display
  const formatExpression = (expression) => {
    if (!expression) return "Não definida";

    // Replace parameter names with their display values
    let formattedExpression = expression;

    if (calculation?.parameters) {
      calculation.parameters.forEach((param) => {
        const value = paramValues?.[param.name];

        if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
        ) {
          // Replace parameter name with its value in the expression
          const regex = new RegExp(`\\b${param.name}\\b`, "g");
          formattedExpression = formattedExpression.replace(regex, `${value}`);
        } else {
          // Keep parameter name if no value provided
          const regex = new RegExp(`\\b${param.name}\\b`, "g");
          formattedExpression = formattedExpression.replace(
            regex,
            `${param.name}`,
          );
        }
      });
    }

    return formattedExpression;
  };

  // Check if all required parameters are filled
  const allRequiredFilled = () => {
    if (!calculation?.parameters) return true;

    return calculation.parameters
      .filter((param) => param.required)
      .every((param) => {
        const value = paramValues?.[param.name];
        return (
          value !== undefined && value !== null && String(value).trim() !== ""
        );
      });
  };

  if (!isOpen || !calculation) return null;

  return (
    <div className="formula-preview-overlay">
      <div className="formula-preview-modal" ref={modalRef}>
        {/* Header */}
        <div className="formula-preview-header">
          <div className="formula-preview-title">
            <div className="formula-preview-icon">
              <Calculator size={24} />
            </div>
            <div>
              <h2>Visualização da Fórmula</h2>
              <p>{calculation.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="formula-preview-close"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="formula-preview-content">
          {/* Calculation Description */}
          {calculation.description && (
            <div className="formula-preview-section">
              <div className="section-header">
                <Info size={18} />
                <h3>Descrição</h3>
              </div>
              <p className="calculation-description">
                {calculation.description}
              </p>
            </div>
          )}

          {/* Formula Structure */}
          <div className="formula-preview-section">
            <div className="section-header">
              <Hash size={18} />
              <h3>Estrutura da Fórmula</h3>
            </div>

            {/* Main formula */}
            {calculation.expression && (
              <div className="formula-display">
                <div className="formula-label">Fórmula Principal:</div>
                <div className="formula-expression">
                  <code>{formatExpression(calculation.expression)}</code>
                </div>
              </div>
            )}

            {/* Results formulas */}
            {calculation.results && calculation.results.length > 0 && (
              <div className="results-formulas">
                <div className="formula-label">Resultados:</div>
                {calculation.results.map((result, index) => (
                  <div key={index} className="formula-display">
                    <div className="result-name">{result.name}:</div>
                    <div className="formula-expression">
                      <code>{formatExpression(result.expression)}</code>
                      {result.unit && (
                        <span className="formula-unit">({result.unit})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Parameters */}
          <div className="formula-preview-section">
            <div className="section-header">
              <Calculator size={18} />
              <h3>Parâmetros Necessários</h3>
            </div>

            {calculation.parameters && calculation.parameters.length > 0 ? (
              <div className="parameters-list">
                {calculation.parameters.map((param, index) => {
                  const value = paramValues?.[param.name];
                  const hasValue =
                    value !== undefined &&
                    value !== null &&
                    String(value).trim() !== "";

                  return (
                    <div
                      key={index}
                      className={`parameter-item ${hasValue ? "filled" : "empty"}`}
                    >
                      <div className="parameter-header">
                        <span className="parameter-name">
                          {param.name}
                          {param.required && (
                            <span className="required">*</span>
                          )}
                        </span>
                        <span className="parameter-status">
                          {hasValue ? (
                            <span className="status-filled">✓ Preenchido</span>
                          ) : (
                            <span className="status-empty">⚠ Pendente</span>
                          )}
                        </span>
                      </div>

                      <div className="parameter-details">
                        {param.description && (
                          <p className="parameter-description">
                            {param.description}
                          </p>
                        )}

                        <div className="parameter-meta">
                          <span className="parameter-type">
                            Tipo: {param.type}
                          </span>
                          {param.unit && (
                            <span className="parameter-unit">
                              Unidade: {param.unit}
                            </span>
                          )}
                          {hasValue && (
                            <span className="parameter-value">
                              Valor: {value}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-parameters">Nenhum parâmetro necessário</p>
            )}
          </div>

          {/* Status Summary */}
          <div className="formula-preview-section">
            <div className="status-summary">
              {allRequiredFilled() ? (
                <div className="status-ready">
                  <div className="status-icon success">
                    <Calculator size={20} />
                  </div>
                  <div>
                    <h4>Pronto para Calcular</h4>
                    <p>Todos os parâmetros obrigatórios foram preenchidos</p>
                  </div>
                </div>
              ) : (
                <div className="status-pending">
                  <div className="status-icon warning">
                    <Info size={20} />
                  </div>
                  <div>
                    <h4>Parâmetros Pendentes</h4>
                    <p>
                      Preencha todos os campos obrigatórios antes de calcular
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="formula-preview-footer">
          <Button variant="outline" onClick={onClose} icon={ArrowLeft}>
            Voltar
          </Button>

          <Button
            variant="primary"
            onClick={onProceedToCalculation}
            disabled={!allRequiredFilled()}
            icon={Play}
          >
            {allRequiredFilled() ? "Calcular" : "Preencher Parâmetros"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormulaPreviewModal;
