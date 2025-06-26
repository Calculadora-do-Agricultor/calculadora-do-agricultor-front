import React from 'react';
import { useToast } from '../../context/ToastContext';
import './styles.css';

const ToastDemo = () => {
  const { success, error, info, warning } = useToast();

  const handleSuccessToast = () => {
    success('Operação realizada com sucesso!', 3000);
  };

  const handleErrorToast = () => {
    error('Ocorreu um erro ao processar sua solicitação.', 4000);
  };

  const handleInfoToast = () => {
    info('Esta é uma mensagem informativa.', 3000);
  };

  const handleWarningToast = () => {
    warning('Atenção! Esta ação pode ter consequências.', 4000);
  };

  return (
    <div className="toast-demo-container">
      <h2 className="toast-demo-title">Demonstração do Sistema de Notificações</h2>
      <p className="toast-demo-description">
        Clique nos botões abaixo para ver os diferentes tipos de notificações disponíveis no sistema.
      </p>
      
      <div className="toast-demo-buttons">
        <button 
          className="toast-demo-button success" 
          onClick={handleSuccessToast}
        >
          Sucesso
        </button>
        
        <button 
          className="toast-demo-button error" 
          onClick={handleErrorToast}
        >
          Erro
        </button>
        
        <button 
          className="toast-demo-button info" 
          onClick={handleInfoToast}
        >
          Informação
        </button>
        
        <button 
          className="toast-demo-button warning" 
          onClick={handleWarningToast}
        >
          Aviso
        </button>
      </div>
      
      <div className="toast-demo-info">
        <h3>Como usar o sistema de notificações:</h3>
        <pre className="toast-demo-code">
          {`// Importe o hook useToast
import { useToast } from '../../context/ToastContext';

// Use o hook em seu componente
const { success, error, info, warning } = useToast();

// Exiba notificações
success('Mensagem de sucesso', 3000); // duração em ms
error('Mensagem de erro');
info('Mensagem informativa');
warning('Mensagem de aviso');`}
        </pre>
      </div>
    </div>
  );
};

export default ToastDemo;