import React, { useState, useEffect, useCallback } from 'react';
import { 
  validateExpression, 
  testExpression, 
  getExpressionSyntaxDocs,
  ExpressionErrorType
} from '../../utils/mathEvaluator';
import './styles.css';

const ExpressionValidator = ({ expression, onChange, parameters = [], onValidationChange }) => {
  const [validationResult, setValidationResult] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [showDocs, setShowDocs] = useState(false);
  const [exampleValues, setExampleValues] = useState({});
  const [autoValidate, setAutoValidate] = useState(false);
  const syntaxDocs = getExpressionSyntaxDocs();

  // Inicializa valores de exemplo para os parâmetros
  useEffect(() => {
    const initialValues = {};
    parameters.forEach(param => {
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

  // Valida a expressão quando autoValidate está ativo ou quando o botão é clicado
  const validateCurrentExpression = useCallback(() => {
    if (expression) {
      const result = validateExpression(expression, exampleValues);
      setValidationResult(result);
      onValidationChange?.(result.isValid);

      if (result.isValid) {
        const test = testExpression(expression, exampleValues);
        setTestResult(test);
      } else {
        setTestResult(null);
      }
    } else {
      setValidationResult(null);
      setTestResult(null);
      onValidationChange?.(false);
    }
  }, [expression, exampleValues, onValidationChange]);

  useEffect(() => {
    validateCurrentExpression();
  }, [expression, exampleValues, validateCurrentExpression]);

  // Atualiza o valor de exemplo de um parâmetro
  const handleExampleValueChange = (paramName, value) => {
    setExampleValues(prev => ({
      ...prev,
      [paramName]: parseFloat(value) || 0
    }));
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
            <span>{validationResult.errorMessage || "Expressão inválida! Corrija e tente novamente."}</span>
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

  // Renderiza a documentação de sintaxe
  const renderSyntaxDocs = () => {
    if (!showDocs) return null;

    return (
      <div className="syntax-docs">
        <h3>{syntaxDocs.title}</h3>
        <p>{syntaxDocs.description}</p>

        <div className="docs-section">
          <h4>Sintaxe de Variáveis</h4>
          <div className="docs-item">
            <div className="docs-format">{syntaxDocs.variableSyntax.format}</div>
            <div className="docs-description">{syntaxDocs.variableSyntax.description}</div>
            <div className="docs-example">Exemplo: {syntaxDocs.variableSyntax.example}</div>
          </div>
        </div>

        <div className="docs-section">
          <h4>Operadores</h4>
ando          <div className="docs-grid">
            {syntaxDocs.operators.map((op) => (
              <div key={op.symbol} className="docs-item">
                <div className="docs-format">{op.symbol}</div>
                <div className="docs-description">{op.description}</div>
                <div className="docs-example">Exemplo: {op.example}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="docs-section">
          <h4>Funções Matemáticas</h4>
          <div className="docs-grid">
            {syntaxDocs.mathFunctions.map((func) => (
              <div key={func.name} className="docs-item">
                <div className="docs-format">{func.name}</div>
                <div className="docs-description">{func.description}</div>
                <div className="docs-example">Exemplo: {func.example}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="docs-section">
          <h4>Constantes</h4>
          <div className="docs-grid">
            {syntaxDocs.constants.map((constant) => (
              <div key={constant.name} className="docs-item">
                <div className="docs-format">{constant.name}</div>
                <div className="docs-description">{constant.description}</div>
                <div className="docs-example">Exemplo: {constant.example}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="docs-section">
          <h4>Exemplos de Expressões</h4>
          <div className="docs-grid">
            {syntaxDocs.examples.map((example, index) => (
              <div key={`example-${index}`} className="docs-item">
                <div className="docs-description">{example.description}</div>
                <div className="docs-example">{example.expression}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="docs-section">
          <h4>Restrições</h4>
          <ul className="restrictions-list">
            {syntaxDocs.restrictions.map((restriction, index) => (
              <li key={index}>{restriction}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="expression-validator">
      <div className="validator-header">
        <h3>Validador de Expressões</h3>
        <div className="validator-actions">
          <button 
            className="validate-btn" 
            onClick={validateCurrentExpression}
            disabled={!expression}
          >
            Validar Expressão
          </button>
          <button 
            className="toggle-docs-btn" 
            onClick={() => setShowDocs(!showDocs)}
          >
            {showDocs ? 'Ocultar Documentação' : 'Mostrar Documentação'}
          </button>
        </div>
      </div>

      {renderSyntaxDocs()}
      {renderValidationStatus()}
      {renderExampleValues()}
      {renderTestResult()}
    </div>
  );
};

export default ExpressionValidator;