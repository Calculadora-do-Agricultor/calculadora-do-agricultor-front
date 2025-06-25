import React, { useState, useEffect } from 'react';
import { 
  validateExpression, 
  testExpression, 
  ExpressionErrorType
} from '../../utils/mathEvaluator';
import * as math from 'mathjs';
import './styles.css';

/**
 * Componente que fornece um sandbox seguro para testar expressões matemáticas
 * usando a biblioteca math.js
 */
const ExpressionSandbox = ({ expression, onChange, parameters = [] }) => {
  const [sandboxExpression, setSandboxExpression] = useState(expression || '');
  const [validationResult, setValidationResult] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [exampleValues, setExampleValues] = useState({});
  const [availableFunctions, setAvailableFunctions] = useState([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Inicializa valores de exemplo para os parâmetros
  useEffect(() => {
    const initialValues = {};
    parameters.forEach(param => {
      // Atribui um valor padrão baseado no tipo do parâmetro
      if (param.type === 'number') {
        initialValues[param.name] = 10;
      } else if (param.type === 'select' && param.options && param.options.length > 0) {
        initialValues[param.name] = parseFloat(param.options[0].value) || 0;
      } else {
        initialValues[param.name] = 0;
      }
    });
    setExampleValues(initialValues);
  }, [parameters]);

  // Define as funções disponíveis do math.js
  useEffect(() => {
    // Define diretamente as funções matemáticas disponíveis
    const mathFunctions = [
      { name: 'abs', description: 'Valor absoluto' },
      { name: 'sqrt', description: 'Raiz quadrada' },
      { name: 'pow', description: 'Potência' },
      { name: 'sin', description: 'Seno' },
      { name: 'cos', description: 'Cosseno' },
      { name: 'tan', description: 'Tangente' },
      { name: 'log', description: 'Logaritmo' },
      { name: 'exp', description: 'Exponencial' },
      { name: 'derivative', description: 'Derivada' },
      { name: 'simplify', description: 'Simplificar expressão' },
      { name: 'parse', description: 'Analisar expressão' },
      { name: 'add', description: 'Adição' },
      { name: 'subtract', description: 'Subtração' },
      { name: 'multiply', description: 'Multiplicação' },
      { name: 'divide', description: 'Divisão' },
      { name: 'round', description: 'Arredondamento' },
      { name: 'floor', description: 'Arredondamento para baixo' },
      { name: 'ceil', description: 'Arredondamento para cima' },
      { name: 'max', description: 'Valor máximo' },
      { name: 'min', description: 'Valor mínimo' }
    ];
    
    setAvailableFunctions(mathFunctions);
  }, []);

  // Valida a expressão sempre que ela mudar
  useEffect(() => {
    if (sandboxExpression) {
      const result = validateExpression(sandboxExpression, exampleValues);
      setValidationResult(result);

      // Se a validação passar, testa a expressão com os valores de exemplo
      if (result.isValid) {
        const test = testExpression(sandboxExpression, exampleValues);
        setTestResult(test);
      } else {
        setTestResult(null);
      }
    } else {
      setValidationResult(null);
      setTestResult(null);
    }
  }, [sandboxExpression, exampleValues]);

  // Atualiza o valor de exemplo de um parâmetro
  const handleExampleValueChange = (paramName, value) => {
    setExampleValues(prev => ({
      ...prev,
      [paramName]: parseFloat(value) || 0
    }));
  };

  // Atualiza a expressão e notifica o componente pai
  const handleExpressionChange = (e) => {
    const newExpression = e.target.value;
    setSandboxExpression(newExpression);
    if (onChange) {
      onChange(newExpression);
    }
  };

  // Renderiza o status de validação
  const renderValidationStatus = () => {
    if (!validationResult) return null;

    return (
      <div className={`validation-status ${validationResult.isValid ? 'valid' : 'invalid'}`}>
        {validationResult.isValid ? (
          <div className="valid-message">
            <i className="fas fa-check-circle"></i>
            <span>Expressão válida</span>
          </div>
        ) : (
          <div className="invalid-message">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{validationResult.errorMessage}</span>
          </div>
        )}
      </div>
    );
  };

  // Renderiza o resultado do teste
  const renderTestResult = () => {
    if (!testResult || !validationResult?.isValid) return null;

    return (
      <div className="test-result">
        <h4>Resultado do teste:</h4>
        <div className="result-value">
          {testResult.success ? (
            <span className="success">{testResult.value}</span>
          ) : (
            <span className="error">{testResult.error}</span>
          )}
        </div>
      </div>
    );
  };

  // Renderiza os campos para valores de exemplo
  const renderExampleValues = () => {
    if (!parameters || parameters.length === 0) return null;

    return (
      <div className="example-values">
        <h4>Valores de teste:</h4>
        <div className="parameters-grid">
          {parameters.map(param => (
            <div key={param.name} className="parameter-input">
              <label htmlFor={`example-${param.name}`}>{param.name}:</label>
              <input
                id={`example-${param.name}`}
                type="number"
                value={exampleValues[param.name] || 0}
                onChange={(e) => handleExampleValueChange(param.name, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderiza as funções disponíveis
  const renderAvailableFunctions = () => {
    if (!showAdvancedOptions || availableFunctions.length === 0) return null;

    return (
      <div className="available-functions">
        <h4>Funções disponíveis:</h4>
        <div className="functions-grid">
          {availableFunctions.map((func, index) => (
            <div key={index} className="function-item">
              <div className="function-name">{func.name}</div>
              <div className="function-description">{func.description}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="expression-sandbox">
      <div className="sandbox-header">
        <h3>Sandbox de Expressões Math.js</h3>
        <div className="version-info">
          <span>Versão do math.js: {math.version}</span>
        </div>
      </div>

      <div className="expression-input-container">
        <label htmlFor="expression-input">Expressão:</label>
        <input
          id="expression-input"
          type="text"
          className="expression-input"
          value={sandboxExpression}
          onChange={handleExpressionChange}
          placeholder="Digite uma expressão matemática (ex: 2 * x + y)"
        />
      </div>

      {renderValidationStatus()}
      {renderExampleValues()}
      {renderTestResult()}

      <div className="advanced-options">
        <button 
          className="toggle-advanced-btn" 
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
        >
          {showAdvancedOptions ? 'Ocultar funções disponíveis' : 'Mostrar funções disponíveis'}
        </button>
      </div>

      {renderAvailableFunctions()}

      <div className="sandbox-info">
        <p>
          <strong>Nota:</strong> Este sandbox usa a biblioteca math.js em um ambiente isolado e seguro.
          Todas as expressões são validadas e executadas em um contexto restrito para evitar código malicioso.
        </p>
      </div>
    </div>
  );
};

export default ExpressionSandbox;