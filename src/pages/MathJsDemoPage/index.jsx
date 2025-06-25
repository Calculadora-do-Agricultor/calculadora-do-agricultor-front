import React from 'react';
import { Link } from 'react-router-dom';
import MathJsDemo from '../../components/MathJsDemo';
import './styles.css';

/**
 * Página de demonstração do Math.js para administradores
 */
const MathJsDemoPage = () => {
  return (
    <div className="math-js-demo-page">
      <div className="page-header">
        <Link to="/admin" className="back-button">
          <i className="fas fa-arrow-left"></i> Voltar
        </Link>
        <h1>Sandbox Seguro Math.js</h1>
      </div>

      <div className="page-description">
        <p>
          Esta página demonstra o uso da biblioteca Math.js para criar um ambiente seguro
          para avaliação de expressões matemáticas. O Math.js fornece uma alternativa segura
          ao uso do construtor <code>Function</code> para avaliação dinâmica de expressões.
        </p>
        <p>
          Ao contrário do <code>Function</code> ou <code>eval()</code>, o Math.js executa as expressões
          em um sandbox isolado, prevenindo a execução de código malicioso e garantindo que apenas
          operações matemáticas seguras sejam permitidas.
        </p>
      </div>

      <div className="security-info">
        <h2>Segurança Implementada</h2>
        <ul>
          <li>Sandbox isolado para execução de expressões</li>
          <li>Restrição de funções disponíveis</li>
          <li>Validação rigorosa de sintaxe</li>
          <li>Prevenção de acesso a objetos globais</li>
          <li>Tratamento robusto de erros</li>
        </ul>
      </div>

      <MathJsDemo />

      <div className="implementation-notes">
        <h2>Notas de Implementação</h2>
        <p>
          A implementação atual usa a versão mais recente do Math.js com configurações
          de segurança aprimoradas. Todas as expressões são validadas e executadas em um
          ambiente controlado, garantindo que apenas operações matemáticas legítimas sejam
          permitidas.
        </p>
        <p>
          Os administradores podem usar este sandbox para testar expressões antes de
          implementá-las em cálculos dinâmicos no sistema.
        </p>
      </div>
    </div>
  );
};

export default MathJsDemoPage;