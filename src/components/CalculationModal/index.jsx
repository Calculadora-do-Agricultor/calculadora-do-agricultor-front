import { useRef, useEffect, useState } from "react"
import { X, Copy, Calculator, Check, Info, HelpCircle, Save, Eye } from "lucide-react"
import useCalculationResult from "../../hooks/useCalculationResult"
import { useFormParameters } from "../../hooks/useFormParameters"
import { useToast } from "../../context/ToastContext"
import { CalculationHistoryService } from "../../services/calculationHistoryService"
import "./styles.css"
import CalculationResult from "../CalculationResult"
import { Tooltip } from "../ui/Tooltip"
import FormulaPreviewModal from "../FormulaPreviewModal"

const CalculationModal = ({ calculation, isOpen, onClose }) => {
  const { paramValues, setParamValue, allFieldsFilled } = useFormParameters(calculation)
  const { results, error } = useCalculationResult(calculation, paramValues, allFieldsFilled)
  const { success, error: toastError } = useToast()
  const modalRef = useRef(null)
  const [copied, setCopied] = useState({})
  const [isSavingHistory, setIsSavingHistory] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [historyTitle, setHistoryTitle] = useState("")
  const [showFormulaPreview, setShowFormulaPreview] = useState(false)



  const handleParamChange = (paramName, value, param) => {
    setParamValue(paramName, value);
  };

  // Save calculation to history
  const handleSaveToHistory = () => {
    if (!allFieldsFilled || !calculation) {
      toastError("Preencha todos os parâmetros antes de salvar no histórico.");
      return;
    }
    
    // Generate default title
    const defaultTitle = `${calculation.name} - ${new Date().toLocaleDateString('pt-BR')}`;
    setHistoryTitle(defaultTitle);
    setShowSaveDialog(true);
  };

  const handleConfirmSave = async () => {
    if (!historyTitle.trim()) {
      toastError("Por favor, insira um nome para o cálculo.");
      return;
    }

    setIsSavingHistory(true);
    try {
      const calculationId = calculation.id || calculation.name?.toLowerCase().replace(/\s+/g, '_') || 'unknown_calculation';
      const { parametersUsed, results: resultsFormatted } = CalculationHistoryService.transformToHistoryFormat(
        calculation,
        paramValues,
        results
      );

      await CalculationHistoryService.saveCalculationHistory(
        calculationId,
        parametersUsed,
        resultsFormatted,
        historyTitle.trim()
      );

      success("Cálculo salvo no histórico com sucesso!");
      setShowSaveDialog(false);
      setHistoryTitle("");
    } catch (error) {
      console.error("Error saving to history:", error);
      toastError("Erro ao salvar no histórico. Tente novamente.");
    } finally {
      setIsSavingHistory(false);
    }
  };

  // Copia o resultado para a área de transferência (combinando ambas as versões)
  const copyToClipboard = (text, resultId, resultName) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied((prev) => ({
          ...prev,
          [resultId]: true,
        }));
        setTimeout(() => {
          setCopied((prev) => ({
            ...prev,
            [resultId]: false,
          }));
        }, 2000);
        // Toast de sucesso da branch develop
        if (success) {
          success(
            `Valor "${resultName || "Resultado"}" copiado para a área de transferência!`,
          );
        }
      },
      (err) => {
        console.error("Erro ao copiar texto: ", err);
        if (toastError) {
          toastError("Não foi possível copiar o resultado. Tente novamente.");
        }
      },
    );
  };

  // useEffect para controle de ESC e scroll
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      // Bloqueia o scroll do body quando o modal está aberto
      document.body.style.overflow = "hidden";
    } else {
      // Restaura o scroll do body quando o modal é fechado
      document.body.style.overflow = "unset";
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
            <div className="calculation-modal-icon">
              <Calculator size={24} />
            </div>
            <div>
              <h2>{calculation.name || "Calculation"}</h2>
              <p>{calculation.description || "Calculation description"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="calculation-modal-close"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="calculation-modal-content">
          <div className="calculation-modal-section">
            <div className="section-header">
              <h3>Parâmetros</h3>
              <div className="section-actions">
                <button
                  onClick={() => setShowFormulaPreview(true)}
                  className="preview-formula-button"
                  title="Visualizar fórmula antes de calcular"
                >
                  <Eye size={16} />
                  Visualizar Fórmula
                </button>
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
            </div>

            <div className="calculation-modal-parameters">
              {calculation.parameters && paramValues &&
                calculation.parameters.map((param, index) => (
                  <div key={param.name} className="calculation-modal-parameter">
                    <label htmlFor={param.name}>
                      {param.name}
                      {param.required && <span className="required">*</span>}
                      {param.unit && (
                        <span className="unit">({param.unit})</span>
                      )}
                      {param.tooltip && (
                        <Tooltip content={param.tooltip} position="top">
                          <HelpCircle
                            size={16}
                            className="tooltip-icon"
                            style={{
                              marginLeft: "6px",
                              color: "#6b7280",
                              cursor: "help",
                            }}
                          />
                        </Tooltip>
                      )}
                    </label>
                    {param.type === "select" ? (
                      <select
                        id={param.name}
                        value={paramValues[param.name] || ""}
                        onChange={(e) =>
                          handleParamChange(param.name, e.target.value, param)
                        }
                      >
                        <option value="">Selecione...</option>
                        {param.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="input-wrapper">
                        <input
                          type={param.type === "number" ? "number" : "text"}
                          id={param.name}
                          value={paramValues[param.name] || ""}
                          onChange={(e) =>
                            handleParamChange(param.name, e.target.value, param)
                          }
                          placeholder={
                            param.description ||
                            `Digite o valor para ${param.name}`
                          }
                          title={param.tooltip || param.description}
                          step={
                            param.type === "number" ? param.step : undefined
                          }
                          max={
                            param.type === "number"
                              ? param.max || undefined
                              : undefined
                          }
                        />
                        {param.max &&
                          param.max !== "" &&
                          param.max !== null &&
                          param.max !== undefined && (
                            <div className="input-constraints">
                              <div className="constraint-range">
                                <span>Max: {param.max}</span>
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          <div className="calculation-modal-divider"></div>

          <div className="calculation-modal-section">
            <div className="section-header">
              <h3>Resultados</h3>
              <button
                onClick={handleSaveToHistory}
                disabled={!allFieldsFilled || isSavingHistory}
                className={`save-history-button ${!allFieldsFilled ? 'disabled' : ''}`}
                title={!allFieldsFilled ? "Preencha todos os parâmetros para salvar" : "Salvar cálculo no histórico"}
              >
                <Save size={16} />
                {isSavingHistory ? "Salvando..." : "Salvar no Histórico"}
              </button>
            </div>

            <div
              className={`calculation-modal-results ${!allFieldsFilled ? "inactive" : ""}`}
            >
              {/* Verifica se estamos usando o novo formato de múltiplos resultados */}
              {calculation.results && calculation.results.length > 0 ? (
                // Novo formato: múltiplos resultados - usando CalculationResult component
                Object.entries(results).map(([key, result]) => {
                  // Verifica se o resultado está no formato novo (objeto com name, value, etc)
                  // ou no formato antigo (apenas o valor)
                  const isObject = typeof result === 'object' && result !== null;
                  const resultIndex = parseInt(key.split('_')[1], 10);
                  const resultTemplate = calculation.results?.[resultIndex];

                  const name = isObject ? result.name : resultTemplate?.name;
                  const value = isObject ? result.value : result;
                  const unit = isObject ? result.unit : resultTemplate?.unit;
                  const description = isObject ? result.description : resultTemplate?.description;

                  return (
                    <CalculationResult
                      key={key}
                      name={name}
                      value={value}
                      unit={unit}
                      description={description}
                      copied={copied[key]}
                      disabled={!allFieldsFilled}
                      onCopy={() =>
                        copyToClipboard(
                          value || "0",
                          key,
                          name
                        )
                      }
                    />
                  )
                })
              ) : (
                <>
                  <CalculationResult
                    name={calculation.resultName || "Resultado"}
                    value={results.value || "0"}
                    unit={calculation.resultUnit || ""}
                    copied={copied["main"]}
                    onCopy={() =>
                      copyToClipboard(
                        results.value || "0",
                        "main",
                        calculation.resultName || "Resultado",
                      )
                    }
                    disabled={!allFieldsFilled}
                    primary
                  />

                  {calculation.additionalResults?.map((result, index) => (
                    <CalculationResult
                      key={index}
                      name={result.name}
                      value={results[result.key] || "0"}
                      unit={result.unit}
                      copied={copied[result.key]}
                      onCopy={() =>
                        copyToClipboard(
                          results[result.key] || "0",
                          result.key,
                          result.name,
                        )
                      }
                      disabled={!allFieldsFilled}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Diálogo para nomear o cálculo ao salvar */}
      {showSaveDialog && (
        <div className="calculation-modal-overlay" style={{ zIndex: 10000 }}>
          <div className="calculation-modal" style={{ maxWidth: '500px', height: 'auto' }}>
            <div className="calculation-modal-header">
              <div className="calculation-modal-title">
                <div className="calculation-modal-icon">
                  <Save size={24} />
                </div>
                <div>
                  <h2>Salvar no Histórico</h2>
                  <p>Dê um nome para este cálculo</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setHistoryTitle("");
                }}
                className="calculation-modal-close"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="calculation-modal-content">
              <div className="calculation-modal-parameter">
                <label htmlFor="historyTitle">
                  Nome do Cálculo
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="historyTitle"
                    value={historyTitle}
                    onChange={(e) => setHistoryTitle(e.target.value)}
                    placeholder="Ex: Análise de Produtividade - Janeiro 2024"
                    maxLength={100}
                    autoFocus
                  />
                </div>
                <div className="input-constraints">
                  {historyTitle.length}/100 caracteres
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setHistoryTitle("");
                  }}
                  className="calculation-modal-close"
                  style={{
                    background: '#f3f4f6',
                    color: '#4b5563',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmSave}
                  disabled={!historyTitle.trim() || isSavingHistory}
                  className={`save-history-button ${!historyTitle.trim() ? 'disabled' : ''}`}
                  style={{ padding: '12px 24px' }}
                >
                  <Save size={16} />
                  {isSavingHistory ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Formula Preview Modal */}
      <FormulaPreviewModal
        calculation={calculation}
        paramValues={paramValues}
        isOpen={showFormulaPreview}
        onClose={() => setShowFormulaPreview(false)}
        onProceedToCalculation={() => {
          setShowFormulaPreview(false)
          // Focus on first empty parameter if not all filled
          if (!allFieldsFilled && calculation?.parameters) {
            const firstEmptyParam = calculation.parameters.find(param => {
              const value = paramValues[param.name]
              return !value || value === ''
            })
            if (firstEmptyParam) {
              setTimeout(() => {
                const input = document.getElementById(firstEmptyParam.name)
                if (input) input.focus()
              }, 100)
            }
          }
        }}
      />
    </div>
  );
};

export default CalculationModal;
