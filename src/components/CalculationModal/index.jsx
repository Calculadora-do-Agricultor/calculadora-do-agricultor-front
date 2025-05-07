import { useState, useEffect } from "react";
import { X, Copy } from "lucide-react";
import "./styles.css";

/**
 * Componente de Modal para exibição e interação com cálculos
 * @param {Object} props
 * @param {Object} props.calculation - Objeto contendo os dados do cálculo
 * @param {boolean} props.isOpen - Estado que controla se o modal está aberto
 * @param {Function} props.onClose - Função para fechar o modal
 */
export function CalculationModal({ calculation, isOpen, onClose }) {
  const [paramValues, setParamValues] = useState({});
  const [results, setResults] = useState({});
  const [copied, setCopied] = useState(false);

  // Inicializa os valores dos parâmetros quando o cálculo muda
  useEffect(() => {
    if (calculation && calculation.parameters) {
      const initialValues = {};
      calculation.parameters.forEach((param) => {
        initialValues[param.name] = "";
      });
      setParamValues(initialValues);
    }
  }, [calculation]);

  // Calcula os resultados quando os valores dos parâmetros mudam
  useEffect(() => {
    if (calculation && Object.keys(paramValues).length > 0) {
      try {
        // Verifica se todos os parâmetros necessários estão preenchidos
        const allParamsFilled = calculation.parameters.every(
          (param) => paramValues[param.name] !== ""
        );

        if (allParamsFilled) {
          // Calcula o resultado principal
          const calculatedValue = calculateResult(calculation, paramValues);
          
          // Prepara o objeto de resultados
          const newResults = {
            value: calculatedValue.toFixed(2)
          };
          
          // Calcula resultados adicionais se existirem
          if (calculation.additionalResults && calculation.additionalResults.length > 0) {
            calculation.additionalResults.forEach(result => {
              if (result.key === 'coleta50m') {
                // Exemplo: para o cálculo de coleta em 50 metros
                newResults[result.key] = (calculatedValue * 50 / 1000).toFixed(2); // Convertendo g/m para kg em 50m
              }
            });
          }
          
          setResults(newResults);
        }
      } catch (error) {
        console.error("Erro ao calcular resultado:", error);
      }
    }
  }, [paramValues, calculation]);

  // Função para calcular o resultado com base na expressão do cálculo
  const calculateResult = (calculation, values) => {
    // Esta é uma implementação simplificada
    // Em um caso real, você precisaria interpretar a expressão matemática
    // e aplicar os valores dos parâmetros
    
    // Exemplo: se tivermos uma expressão como "param1 * param2"
    if (calculation.expression) {
      try {
        // Cria um contexto com os valores dos parâmetros
        const context = {};
        
        // Converte os valores para números quando possível
        Object.keys(values).forEach(key => {
          context[key] = parseFloat(values[key]) || 0;
        });
        
        // Substitui os nomes dos parâmetros na expressão pelos valores
        let expressionToEval = calculation.expression;
        Object.keys(context).forEach(key => {
          // Substitui todas as ocorrências do nome do parâmetro pelo seu valor
          const regex = new RegExp(key, 'g');
          expressionToEval = expressionToEval.replace(regex, context[key]);
        });
        
        // Avalia a expressão
        // eslint-disable-next-line no-eval
        const result = eval(expressionToEval);
        
        // Calcula resultados adicionais se existirem
        if (calculation.additionalResults && calculation.additionalResults.length > 0) {
          // Exemplo: para o cálculo de coleta em 50 metros
          if (calculation.additionalResults.some(r => r.key === 'coleta50m')) {
            context.coleta50m = result * 50 / 1000; // Convertendo g/m para kg em 50m
          }
        }
        
        return result;
      } catch (error) {
        console.error("Erro ao avaliar expressão:", error);
        return 0;
      }
    }
    
    return 0; // Valor padrão se não houver expressão
  };

  // Atualiza o valor de um parâmetro
  const handleParamChange = (paramName, value) => {
    setParamValues((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  // Copia o resultado para a área de transferência
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error("Erro ao copiar texto: ", err);
      }
    );
  };

  if (!isOpen || !calculation) return null;

  return (
    <div className="calculation-modal-overlay">
      <div className="calculation-modal">
        <div className="calculation-modal-header">
          <div className="calculation-modal-title">
            <h2>{calculation.name || "Cálculo de Adubo"}</h2>
            <p>{calculation.description || "Adubo em gramas por metro"}</p>
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
            <h3>Parâmetros</h3>
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
                          onChange={(e) =>
                            handleParamChange(param.name, e.target.value)
                          }
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
                        onChange={(e) =>
                          handleParamChange(param.name, e.target.value)
                        }
                        placeholder={`Digite ${param.name.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}
            </div>
          </div>

          <div className="calculation-modal-section">
            <h3>Resultados</h3>
            <div className="calculation-modal-results">
              <div className="calculation-result">
                <div className="calculation-result-label">
                  <span>{calculation.resultName || "Quantidade Desejada de Adubo"}</span>
                  <span className="unit">{calculation.resultUnit || "(g/m)"}</span>
                </div>
                <div className="calculation-result-value">
                  <span>{results.value || 0}</span>
                  <button
                    onClick={() => copyToClipboard(results.value?.toString() || "0")}
                    className={`copy-button ${copied ? "copied" : ""}`}
                    aria-label="Copiar resultado"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* Você pode adicionar mais resultados aqui se necessário */}
              {calculation.additionalResults &&
                calculation.additionalResults.map((result, index) => (
                  <div key={index} className="calculation-result">
                    <div className="calculation-result-label">
                      <span>{result.name}</span>
                      <span className="unit">{result.unit}</span>
                    </div>
                    <div className="calculation-result-value">
                      <span>{results[result.key] || 0}</span>
                      <button
                        onClick={() =>
                          copyToClipboard(results[result.key]?.toString() || "0")
                        }
                        className={`copy-button ${copied ? "copied" : ""}`}
                        aria-label="Copiar resultado"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}