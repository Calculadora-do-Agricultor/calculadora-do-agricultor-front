import React from 'react';

import Loading, { LOADING_SIZES } from '../ui/loading';

const LoadingExample = () => {
  return (
    <div className="space-y-8 p-4">
      <div>
        <h3 className="mb-4 text-lg font-medium">Loading Pequeno</h3>
        <Loading size={LOADING_SIZES.SMALL} message="Carregando..." />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">Loading Padrão</h3>
        <Loading message="Processando dados..." />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">Loading Grande</h3>
        <Loading size={LOADING_SIZES.LARGE} message="Aguarde um momento..." />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">Loading com Cor Personalizada</h3>
        <Loading
          size={LOADING_SIZES.DEFAULT}
          message="Carregando..."
          color="blue-500"
          containerClassName="bg-gray-50 p-4 rounded-lg"
        />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">Loading com Cor e Tamanho Personalizado</h3>
        <Loading
          size={LOADING_SIZES.LARGE}
          message="Enviando dados..."
          color="green-500"
          containerClassName="bg-green-50 p-6 rounded-lg"
        />
      </div>
    </div>
  );
};

export default LoadingExample;