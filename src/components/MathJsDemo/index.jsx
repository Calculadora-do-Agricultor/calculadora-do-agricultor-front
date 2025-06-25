import React, { useState } from 'react';
import ExpressionSandbox from '../ExpressionSandbox';
import * as math from 'mathjs';
import './styles.css';

/**
 * Componente que demonstra as capacidades do math.js para administradores
 */
const MathJsDemo = () => {
  const [selectedExample, setSelectedExample] = useState(0);
  const [customExpression, setCustomExpression] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // Parâmetros de exemplo para demonstração
  const demoParameters = [
    // Exemplo 1: Área de retângulo
    [
      { name: 'comprimento', type: 'number' },
      { name: 'largura', type: 'number' }
    ],
    // Exemplo 2: Volume de cubo
    [
      { name: 'lado', type: 'number' }
    ],
    // Exemplo 3: Área de círculo usando pi e pow
    [
      { name: 'raio', type: 'number' }
    ],
    // Exemplo 4: Conversão de unidades
    [
      { name: 'polegadas', type: 'number' }
    ],
    // Exemplo 5: Expressão complexa
    [
      { name: 'x', type: 'number' },
      { name: 'y', type: 'number' },
      { name: 'z', type: 'number' }
    ],
    // Exemplo personalizado
    []
  ];

  // Expressões de exemplo para demonstração
  const demoExpressions = [
    '@[comprimento] * @[largura]', // Área de retângulo
    'pow(@[lado], 3)', // Volume de cubo
    'pi * pow(@[raio], 2)', // Área de círculo
    '@[polegadas] * 2.54', // Conversão de polegadas para centímetros
    'sqrt(pow(@[x], 2) + pow(@[y], 2)) + log(@[z])', // Expressão complexa
    customExpression // Expressão personalizada
  ];

  // Descrições das expressões de exemplo
  const demoDescriptions = [
    'Área de um retângulo: comprimento × largura',
    'Volume de um cubo: lado³',
    'Área de um círculo: π × raio²',
    'Conversão de polegadas para centímetros: polegadas × 2.54',
    'Expressão complexa: √(x² + y²) + log(z)',
    'Expressão personalizada'
  ];

  // Manipula a mudança de exemplo selecionado
  const handleExampleChange = (index) => {
    setSelectedExample(index);
    setShowCustom(index === 5);
  };

  // Manipula a mudança na expressão personalizada
  const handleCustomExpressionChange = (e) => {
    setCustomExpression(e.target.value);
    demoExpressions[5] = e.target.value;
  };

  return (
    <div className="math-js-demo">
      <div className="demo-header">
        <h2>Demonstração do Math.js</h2>
        <div className="version-info">
          <span>Versão: {math.version}</span>
        </div>
      </div>

      <div className="demo-description">
        <p>
          O Math.js é uma biblioteca matemática extensa para JavaScript e Node.js que oferece um ambiente
          seguro para avaliação de expressões matemáticas. Esta demonstração mostra como usar o Math.js
          para criar e testar expressões matemáticas de forma segura.
        </p>
      </div>

      <div className="example-selector">
        <h3>Selecione um exemplo:</h3>
        <div className="example-buttons">
          {demoDescriptions.map((desc, index) => (
            <button
              key={index}
              className={`example-button ${selectedExample === index ? 'selected' : ''}`}
              onClick={() => handleExampleChange(index)}
            >
              {desc}
            </button>
          ))}
        </div>
      </div>

      {showCustom && (
        <div className="custom-expression">
          <h3>Digite sua expressão personalizada:</h3>
          <input
            type="text"
            value={customExpression}
            onChange={handleCustomExpressionChange}
            placeholder="Ex: sin(x) + cos(y)"
            className="custom-expression-input"
          />
          <p className="custom-expression-help">
            Use @[nome] para variáveis. Ex: @[x] + @[y]
          </p>
        </div>
      )}

      <div className="demo-sandbox">
        <h3>Teste a expressão: {demoDescriptions[selectedExample]}</h3>
        <ExpressionSandbox
          expression={demoExpressions[selectedExample]}
          parameters={demoParameters[selectedExample]}
          onChange={showCustom ? handleCustomExpressionChange : undefined}
        />
      </div>

      <div className="math-js-features">
        <h3>Recursos do Math.js</h3>
        <div className="features-grid">
          <div className="feature-item">
            <h4>Sandbox Seguro</h4>
            <p>Avaliação de expressões em um ambiente isolado e seguro, prevenindo execução de código malicioso.</p>
          </div>
          <div className="feature-item">
            <h4>Funções Matemáticas Avançadas</h4>
            <p>Suporte a funções trigonométricas, logarítmicas, estatísticas e muito mais.</p>
          </div>
          <div className="feature-item">
            <h4>Validação de Sintaxe</h4>
            <p>Verificação robusta de sintaxe antes da execução para evitar erros.</p>
          </div>
          <div className="feature-item">
            <h4>Prevenção de Código Malicioso</h4>
            <p>Bloqueio de funções potencialmente perigosas como eval() e acesso a objetos globais.</p>
          </div>
          <div className="feature-item">
            <h4>Tratamento de Erros</h4>
            <p>Mensagens de erro claras e detalhadas para facilitar a depuração.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathJsDemo;