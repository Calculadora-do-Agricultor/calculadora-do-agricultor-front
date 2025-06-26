import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Copy,
  Calculator,
  Check,
  Info,
  FileText,
  Calendar,
  User,
  Eye,
  HelpCircle,
} from "lucide-react";
import { Tooltip } from "../ui/Tooltip";
import { doc, getDoc, updateDoc, increment, setDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import DraggableList from "../DraggableList";
import {
  evaluateExpression,
  normalizeMathFunctions,
  validateExpression,
} from "../../utils/mathEvaluator";
import { useCalculationResult } from "../../hooks/useCalculationResult";
import { useFormParameters } from "../../hooks/useFormParameters";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/useAuth";
import CalculationResult from "../CalculationResult";
import "./styles.css";

const CalculationModal = ({ calculation, isOpen, onClose }) => {
  // Estados da branch feat/validador-parametros-calculo
  const [paramValues, setParamValues] = useState({});
  const [results, setResults] = useState({});
  const [copied, setCopied] = useState({});
  const [allFieldsFilled, setAllFieldsFilled] = useState(false);
  const modalRef = useRef(null);

  // Hooks da branch develop
  const { success, error: toastError, info } = useToast();
  const { user } = useAuth();

  // useEffect para registrar visualização (da branch develop)
  useEffect(() => {
    if (!isOpen || !user?.uid || !calculation?.id) return;

    let cancelled = false;

    const registerView = async () => {
      try {
        const viewRef = doc(
          db,
          "calculations",
          calculation.id,
          "views",
          user.uid,
        );
        const viewSnap = await getDoc(viewRef);

        if (!viewSnap.exists() && !cancelled) {
          await setDoc(viewRef, { viewedAt: new Date() });

          const calcRef = doc(db, "calculations", calculation.id);
          await updateDoc(calcRef, {
            views: increment(1),
          });
        }
      } catch (err) {
        console.error("Erro ao registrar visualização:", err);
      }
    };

    registerView();

    return () => {
      cancelled = true; // evita duplicação se o componente desmontar rapidamente
    };
  }, [isOpen, calculation?.id, user?.uid]);

  // useEffect para inicializar valores (da branch feat/validador-parametros-calculo)
  useEffect(() => {
    if (calculation && calculation.parameters) {
      const initialValues = {};
      calculation.parameters.forEach((param) => {
        initialValues[param.name] = "";
      });
      setParamValues(initialValues);

      // Initialize results with zero values to maintain stable layout
      const initialResults = {};
      if (calculation.results && calculation.results.length > 0) {
        calculation.results.forEach((result, index) => {
          initialResults[`result_${index}`] = {
            name: result.name,
            description: result.description,
            value: "0",
            unit: result.unit || "",
          };
        });
      } else {
        initialResults.value = "0";
        if (
          calculation.additionalResults &&
          calculation.additionalResults.length > 0
        ) {
          calculation.additionalResults.forEach((result) => {
            initialResults[result.key] = "0";
          });
        }
      }
      setResults(initialResults);

      setAllFieldsFilled(false);
    }
  }, [calculation]);

  // Verifica se todos os campos estão preenchidos
  useEffect(() => {
    if (calculation && calculation.parameters) {
      const filled = calculation.parameters.every(
        (param) => paramValues[param.name] && paramValues[param.name] !== "",
      );
      setAllFieldsFilled(filled);
    }
  }, [paramValues, calculation]);

  // Calcula os resultados quando os valores dos parâmetros mudam
  useEffect(() => {
    if (calculation && Object.keys(paramValues).length > 0 && allFieldsFilled) {
      try {
        // Prepara o objeto de resultados
        const newResults = {};

        // Verifica se o cálculo tem múltiplos resultados (novo formato)
        if (calculation.results && calculation.results.length > 0) {
          // Processa cada resultado definido
          calculation.results.forEach((result, index) => {
            const calculatedValue = calculateExpressionResult(
              result.expression,
              paramValues,
            );
            newResults[`result_${index}`] = {
              name: result.name,
              description: result.description,
              value: calculatedValue.toString(),
              unit: result.unit || "",
            };
          });
        } else {
          // Compatibilidade com o formato antigo (resultado único)
          const calculatedValue = calculateResult(calculation, paramValues);
          newResults.value = calculatedValue.toString();

          // Calcula resultados adicionais se existirem (formato antigo)
          if (
            calculation.additionalResults &&
            calculation.additionalResults.length > 0
          ) {
            calculation.additionalResults.forEach((result) => {
              if (result.key === "coleta50m") {
                newResults[result.key] = (
                  (calculatedValue * 50) /
                  1000
                ).toString();
              }
            });
          }
        }

        setResults(newResults);
      } catch (error) {
        console.error("Erro ao calcular resultado:", error);
      }
    }
  }, [paramValues, calculation, allFieldsFilled]);

  // Função para calcular o resultado com base na expressão do cálculo (formato antigo)
  const calculateResult = (calculation, values) => {
    if (calculation.expression) {
      try {
        return calculateExpressionResult(calculation.expression, values);
      } catch (error) {
        console.error("Erro ao avaliar expressão:", error);
        return 0;
      }
    }

    return 0; // Valor padrão se não houver expressão
  };

  // Função para calcular o resultado de uma expressão com base nos valores dos parâmetros
  const calculateExpressionResult = (expression, values) => {
    try {
      // Cria um contexto com os valores dos parâmetros
      const context = {};

      // Converte os valores para números quando possível
      Object.keys(values).forEach((key) => {
        context[key] = Number.parseFloat(values[key]) || 0;
      });

      // Valida a expressão antes de calcular
      const validation = validateExpression(expression, context);
      if (!validation.isValid) {
        console.error("Erro de validação:", validation.errorMessage);
        return 0;
      }

      // Normaliza as funções matemáticas na expressão
      const normalizedExpression = normalizeMathFunctions(expression);

      // Avalia a expressão de forma segura
      return evaluateExpression(normalizedExpression, context, true);
    } catch (error) {
      console.error("Erro ao avaliar expressão:", error);
      return 0;
    }
  };

  // Atualiza o valor de um parâmetro (versão completa da branch feat/validador-parametros-calculo)
  const handleParamChange = (paramName, value, param) => {
    if (param && param.type === "number") {
      let numericValue = value;
      // Só processa o valor se não estiver vazio
      if (value !== "") {
        const numValue = parseFloat(numericValue);
        if (!isNaN(numValue)) {
          // Aplica a máscara (step) apenas se estiver definida no parâmetro
          if (param.step) {
            const step = parseFloat(param.step);
            if (!isNaN(step)) {
              // Determina o número de casas decimais do step
              const stepDecimals =
                param.step.toString().split(".")[1]?.length || 0;
              // Arredonda o valor de acordo com o step e mantém as casas decimais
              const roundedValue = Math.round(numValue / step) * step;
              // Limita o número de casas decimais para evitar zeros extras
              numericValue = Number(
                roundedValue.toFixed(stepDecimals),
              ).toString();
            }
          } else {
            // Se não tiver step, limita a 2 casas decimais
            numericValue = Number(numValue.toFixed(2)).toString();
          }
        } else {
          numericValue = "";
        }
      }
      // Aplica apenas o limite máximo se houver um valor numérico
      if (numericValue !== "") {
        const currentValue = parseFloat(numericValue);
        if (param.max !== "" && currentValue > parseFloat(param.max)) {
          const maxValue = parseFloat(param.max);
          const stepDecimals =
            param.step?.toString().split(".")[1]?.length || 2;
          numericValue = Number(maxValue.toFixed(stepDecimals)).toString();
        }
      }
      setParamValues((prev) => ({
        ...prev,
        [paramName]: numericValue,
      }));
    } else {
      setParamValues((prev) => ({
        ...prev,
        [paramName]: value,
      }));
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
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // useEffect para toast de feedback (da branch develop)
  useEffect(() => {
    if (allFieldsFilled && Object.keys(results).length > 0 && info) {
      info("Cálculo realizado com sucesso!");
    }
  }, [allFieldsFilled, results, info]);

  if (!isOpen || !calculation) return null;

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
              {calculation.parameters &&
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
            </div>

            <div
              className={`calculation-modal-results ${!allFieldsFilled ? "inactive" : ""}`}
            >
              {/* Verifica se estamos usando o novo formato de múltiplos resultados */}
              {calculation.results && calculation.results.length > 0 ? (
                // Novo formato: múltiplos resultados - usando CalculationResult component
                Object.keys(results).map((key) => (
                  <CalculationResult
                    key={key}
                    name={results[key]?.name}
                    value={results[key]?.value}
                    unit={results[key]?.unit}
                    description={results[key]?.description}
                    copied={copied[key]}
                    onCopy={() =>
                      copyToClipboard(
                        results[key]?.value || "0",
                        key,
                        results[key]?.name,
                      )
                    }
                    disabled={!allFieldsFilled}
                  />
                ))
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
    </div>
  );
};

export default CalculationModal;
