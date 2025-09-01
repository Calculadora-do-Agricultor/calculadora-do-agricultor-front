import React, { useState, useEffect } from 'react';
import LoadingSpinner from './index';
import LoadingAdvanced from './LoadingAdvanced';
import { useLoading, useApiLoading } from '../../hooks/useLoading';
import { useFetchDocuments } from '../../hooks/useFetchDocuments';

/**
 * Exemplo prático de integração do sistema de loading
 * Mostra como substituir loadings existentes pelos novos componentes padronizados
 */

// ===== EXEMPLO 1: Substituindo loading em componente de categorias =====
const CategoriesWithNewLoading = () => {
  const { data: categories, loading, error, refetch } = useFetchDocuments('categories');
  const { isLoading, withLoading } = useLoading();

  const handleRefresh = async () => {
    await withLoading(
      async () => {
        await refetch();
      },
      'Atualizando categorias...',
      'overlay'
    );
  };

  // Loading inicial da página
  if (loading) {
    return (
      <LoadingSpinner 
        mensagem="Carregando categorias..." 
        tipo="full"
        size="lg"
        color="emerald"
      />
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">Erro ao carregar categorias</p>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Categorias</h2>
        <button 
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Atualizar
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((category) => (
          <div key={category.id} className="p-4 border rounded-lg">
            <h3 className="font-medium">{category.name}</h3>
            <p className="text-sm text-gray-600">{category.description}</p>
          </div>
        ))}
      </div>

      {/* Loading overlay durante refresh */}
      {isLoading && (
        <LoadingSpinner 
          mensagem="Atualizando categorias..." 
          tipo="overlay"
        />
      )}
    </div>
  );
};

// ===== EXEMPLO 2: Loading em formulário =====
const FormWithLoading = () => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { isSubmitting, submitError, submitSuccess, submitWithLoading } = useLoading();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await submitWithLoading(
      async () => {
        // Simula envio para API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simula possível erro (descomente para testar)
        // if (Math.random() > 0.7) throw new Error('Erro simulado');
        
        console.log('Formulário enviado:', formData);
        setFormData({ name: '', description: '' });
      },
      {
        onSuccess: () => console.log('Categoria criada com sucesso!'),
        onError: (err) => console.error('Erro ao criar categoria:', err)
      }
    );
  };

  return (
    <div className="relative max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Nova Categoria</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
        >
          {isSubmitting ? (
            <LoadingSpinner tipo="inline" tamanho="small" cor="white" />
          ) : (
            'Criar Categoria'
          )}
        </button>
        
        {submitError && (
          <div className="text-red-600 text-sm">{submitError}</div>
        )}
        
        {submitSuccess && (
          <div className="text-green-600 text-sm">Categoria criada com sucesso!</div>
        )}
      </form>
      
      {/* Loading overlay durante submissão */}
      {isSubmitting && (
        <LoadingSpinner 
          mensagem="Criando categoria..." 
          tipo="overlay"
        />
      )}
    </div>
  );
};

// ===== EXEMPLO 3: Loading com diferentes animações =====
const LoadingVariationsExample = () => {
  const [activeLoading, setActiveLoading] = useState(null);

  const loadingTypes = [
    { type: 'spinner', message: 'Carregando com spinner...' },
    { type: 'dots', message: 'Carregando com pontos...' },
    { type: 'bars', message: 'Carregando com barras...' },
    { type: 'skeleton', message: 'Carregando com skeleton...' }
  ];

  const startLoading = (type) => {
    setActiveLoading(type);
    setTimeout(() => setActiveLoading(null), 3000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Variações de Loading</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loadingTypes.map((loading) => (
          <button
            key={loading.type}
            onClick={() => startLoading(loading.type)}
            className="p-4 border rounded-lg hover:bg-gray-50 text-center"
          >
            <div className="mb-2 h-12 flex items-center justify-center">
              {loading.type === 'spinner' && <LoadingSpinner tipo="inline" tamanho="medium" />}
              {loading.type === 'dots' && <LoadingAdvanced animacao="dots" size="md" />}
              {loading.type === 'bars' && <LoadingAdvanced animacao="bars" size="md" />}
              {loading.type === 'skeleton' && <LoadingAdvanced animacao="skeleton" size="md" />}
            </div>
            <span className="text-sm font-medium capitalize">{loading.type}</span>
          </button>
        ))}
      </div>
      
      {activeLoading && (
        <div className="relative h-32 bg-gray-50 rounded-lg">
          <LoadingAdvanced 
            mensagem={loadingTypes.find(l => l.type === activeLoading)?.message}
            tipo="overlay"
            animacao={activeLoading}
            size="lg"
          />
        </div>
      )}
    </div>
  );
};

// ===== EXEMPLO 4: Migração de código antigo =====
const MigrationExample = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Exemplo de Migração</h2>
      
      {/* ANTES - Código antigo */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-medium text-red-800 mb-2">❌ ANTES (Código Antigo)</h3>
        <pre className="text-sm text-red-700 overflow-x-auto">
{`// Código antigo inconsistente
{loading && (
  <div className="flex items-center justify-center">
    <Loader2 className="animate-spin h-6 w-6" />
    <span>Carregando...</span>
  </div>
)}

// Ou diferentes implementações
{isLoading ? (
  <div className="text-center">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
) : (
  <Content />
)}`}
        </pre>
      </div>
      
      {/* DEPOIS - Código novo */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-800 mb-2">✅ DEPOIS (Código Padronizado)</h3>
        <pre className="text-sm text-green-700 overflow-x-auto">
{`// Código novo padronizado
import { LoadingSpinner } from '@/components';
import { useLoading } from '@/hooks/useLoading';

// Loading simples
{loading && (
  <LoadingSpinner 
    mensagem="Carregando dados..." 
    tipo="inline"
  />
)}

// Loading com hook
const { withLoading } = useLoading();
await withLoading(apiCall, 'Salvando...', 'overlay');

// Loading de página
<LoadingSpinner 
  mensagem="Carregando página..." 
  tipo="full"
  size="lg"
/>`}
        </pre>
      </div>
    </div>
  );
};

// ===== COMPONENTE PRINCIPAL =====
const IntegrationExample = () => {
  const [activeExample, setActiveExample] = useState('categories');

  const examples = {
    categories: { component: CategoriesWithNewLoading, title: 'Categorias com Loading' },
    form: { component: FormWithLoading, title: 'Formulário com Loading' },
    variations: { component: LoadingVariationsExample, title: 'Variações de Loading' },
    migration: { component: MigrationExample, title: 'Exemplo de Migração' }
  };

  const ActiveComponent = examples[activeExample].component;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🔗 Exemplos de Integração do Sistema de Loading
        </h1>
        <p className="text-gray-600">
          Veja como integrar os novos componentes de loading em diferentes cenários
        </p>
      </div>
      
      {/* Navegação */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(examples).map(([key, example]) => (
          <button
            key={key}
            onClick={() => setActiveExample(key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeExample === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {example.title}
          </button>
        ))}
      </div>
      
      {/* Conteúdo */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default IntegrationExample;