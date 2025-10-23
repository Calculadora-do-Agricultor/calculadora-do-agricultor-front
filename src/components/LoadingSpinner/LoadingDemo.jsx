import React, { useState } from 'react';
import LoadingSpinner from './index';
import LoadingAdvanced from './LoadingAdvanced';
import { useLoading, useApiLoading, useFormLoading } from '../../hooks/useLoading';
import { Play, Square, RefreshCw } from 'lucide-react';

/**
 * Componente de demonstração dos diferentes tipos de loading
 * Útil para testes e visualização dos componentes
 */
const LoadingDemo = () => {
  const [activeDemo, setActiveDemo] = useState(null);
  const { isLoading, loadingMessage, loadingType, withLoading } = useLoading();
  const { isLoading: apiLoading, executeWithLoading } = useApiLoading();
  const { isSubmitting, submitWithLoading } = useFormLoading();

  const demos = [
    {
      id: 'inline-basic',
      title: 'Loading Inline Básico',
      description: 'Loading simples para uso em componentes',
      component: (
        <LoadingSpinner 
          mensagem="Carregando dados..." 
          tipo="inline"
          size="md"
        />
      )
    },
    {
      id: 'overlay-form',
      title: 'Loading Overlay',
      description: 'Loading que aparece sobre o conteúdo',
      component: (
        <div className="relative h-32 bg-gray-50 rounded-lg p-4 border">
          <p>Conteúdo do formulário aqui...</p>
          <input className="mt-2 p-2 border rounded" placeholder="Campo de exemplo" />
          <LoadingSpinner 
            mensagem="Salvando formulário..." 
            tipo="overlay"
            size="md"
          />
        </div>
      )
    },
    {
      id: 'dots-animation',
      title: 'Animação de Pontos',
      description: 'Loading com animação de pontos saltitantes',
      component: (
        <LoadingAdvanced 
          mensagem="Processando..." 
          tipo="inline"
          animacao="dots"
          size="md"
          color="emerald"
        />
      )
    },
    {
      id: 'bars-animation',
      title: 'Animação de Barras',
      description: 'Loading com barras animadas',
      component: (
        <LoadingAdvanced 
          mensagem="Analisando dados..." 
          tipo="inline"
          animacao="bars"
          size="lg"
          color="green"
        />
      )
    },
    {
      id: 'skeleton-loading',
      title: 'Skeleton Loading',
      description: 'Loading tipo skeleton para conteúdo',
      component: (
        <LoadingAdvanced 
          tipo="inline"
          animacao="skeleton"
          size="md"
        />
      )
    }
  ];

  const simulateApiCall = async () => {
    await executeWithLoading(
      async () => {
        // Simula chamada de API
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { success: true, data: 'Dados carregados!' };
      },
      {
        onSuccess: (data) => console.log('API Success:', data),
        onError: (err) => console.error('API Error:', err)
      }
    );
  };

  const simulateFormSubmit = async () => {
    await submitWithLoading(
      async () => {
        // Simula envio de formulário
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { id: 123, message: 'Formulário enviado!' };
      },
      {
        onSuccess: (data, message) => console.log('Form Success:', data, message),
        onError: (err) => console.error('Form Error:', err)
      }
    );
  };

  const simulateWithLoading = async (type) => {
    await withLoading(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
      },
      'Executando operação...',
      type
    );
  };

  const showFullScreenDemo = () => {
    setActiveDemo('full-screen');
    setTimeout(() => setActiveDemo(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔄 Sistema de Loading Padronizado
        </h1>
        <p className="text-gray-600">
          Demonstração dos componentes de loading disponíveis no sistema
        </p>
      </div>

      {/* Demos Estáticos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demos.map((demo) => (
          <div key={demo.id} className="bg-white rounded-lg border p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">{demo.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{demo.description}</p>
            <div className="flex items-center justify-center h-24 bg-gray-50 rounded">
              {demo.component}
            </div>
          </div>
        ))}
      </div>

      {/* Demos Interativos */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🎮 Demos Interativos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Full Screen Demo */}
          <button
            onClick={showFullScreenDemo}
            className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <Play className="h-5 w-5 mr-2 text-blue-600" />
            <span className="text-blue-700 font-medium">Full Screen</span>
          </button>

          {/* API Loading Demo */}
          <button
            onClick={simulateApiCall}
            disabled={apiLoading}
            className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors disabled:opacity-50"
          >
            {apiLoading ? (
              <LoadingSpinner tipo="inline" tamanho="small" cor="green" />
            ) : (
              <RefreshCw className="h-5 w-5 mr-2 text-green-600" />
            )}
            <span className="text-green-700 font-medium">API Call</span>
          </button>

          {/* Form Submit Demo */}
          <button
            onClick={simulateFormSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <LoadingSpinner tipo="inline" tamanho="small" cor="primary" />
            ) : (
              <Square className="h-5 w-5 mr-2 text-purple-600" />
            )}
            <span className="text-purple-700 font-medium">Form Submit</span>
          </button>

          {/* Overlay Demo */}
          <button
            onClick={() => simulateWithLoading('overlay')}
            className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
          >
            <Play className="h-5 w-5 mr-2 text-orange-600" />
            <span className="text-orange-700 font-medium">Overlay</span>
          </button>
        </div>
      </div>

      {/* Variações de Tamanho */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          📏 Variações de Tamanho
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['sm', 'md', 'lg', 'xl'].map((size) => (
            <div key={size} className="text-center">
              <h4 className="font-medium text-gray-700 mb-3 capitalize">{size}</h4>
              <div className="flex items-center justify-center h-20 bg-gray-50 rounded">
                <LoadingSpinner 
                  size={size}
                  color="emerald"
                  mensagem={size === 'sm' ? '' : `Tamanho ${size}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Variações de Cor */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🎨 Variações de Cor
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {['primary', 'green', 'emerald', 'blue', 'gray'].map((color) => (
            <div key={color} className="text-center">
              <h4 className="font-medium text-gray-700 mb-3 capitalize">{color}</h4>
              <div className="flex items-center justify-center h-16 bg-gray-50 rounded">
                <LoadingSpinner 
                  size="md"
                  color={color}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Código de Exemplo */}
      <div className="bg-gray-900 rounded-lg p-6 text-white">
        <h2 className="text-xl font-semibold mb-4">💻 Exemplo de Uso</h2>
        <pre className="text-sm overflow-x-auto">
          <code>{`import LoadingSpinner from '@/components/LoadingSpinner';
import LoadingAdvanced from '@/components/LoadingSpinner/LoadingAdvanced';
import { useLoading } from '@/hooks/useLoading';

// Loading básico
<LoadingSpinner 
  mensagem="Carregando dados..." 
  tipo="inline"
  size="md"
  color="emerald"
/>

// Loading avançado
<LoadingAdvanced 
  mensagem="Processando..." 
  tipo="overlay"
  animacao="dots"
  size="lg"
/>

// Com hook
const { withLoading } = useLoading();
await withLoading(apiCall, 'Salvando...', 'full');`}</code>
        </pre>
      </div>

      {/* Loading States Ativos */}
      {isLoading && (
        <LoadingSpinner 
          mensagem={loadingMessage}
          tipo={loadingType}
        />
      )}

      {/* Full Screen Demo */}
      {activeDemo === 'full-screen' && (
        <LoadingSpinner 
          mensagem="Demonstração de loading em tela cheia" 
          tipo="full"
          size="lg"
          color="emerald"
        />
      )}
    </div>
  );
};

export default LoadingDemo;