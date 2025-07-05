import React from 'react';

import LoadingSpinner from '../LoadingSpinner';

const LoadingExample = () => {
  return (
    <div className="space-y-8 p-4">
      <div>
        <h3 className="mb-4 text-lg font-medium">Loading Pequeno</h3>
        <LoadingSpinner tipo="inline" tamanho="small" mensagem="Carregando..." />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">Loading Padrão</h3>
        <LoadingSpinner tipo="inline" tamanho="medium" mensagem="Processando dados..." />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">Loading Grande</h3>
        <LoadingSpinner tipo="inline" tamanho="large" mensagem="Aguarde um momento..." />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">Loading com Cor Personalizada</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <LoadingSpinner
            tipo="inline"
            tamanho="medium"
            mensagem="Carregando..."
            cor="blue"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">Loading com Cor e Tamanho Personalizado</h3>
        <div className="bg-green-50 p-6 rounded-lg">
          <LoadingSpinner
            tipo="inline"
            tamanho="large"
            mensagem="Enviando dados..."
            cor="green"
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingExample;