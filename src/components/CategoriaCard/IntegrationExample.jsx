import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoriaCard from './index';
import { useFetchDocuments } from '../../hooks/useFetchDocuments';
import {
  CalculatorIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  BeakerIcon,
  TruckIcon,
  CogIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

// Mapeamento de ícones por categoria
const CATEGORY_ICONS = {
  'calculos-basicos': CalculatorIcon,
  'analise-financeira': CurrencyDollarIcon,
  'produtividade': ChartBarIcon,
  'planejamento': ClockIcon,
  'solo': BeakerIcon,
  'logistica': TruckIcon,
  'configuracao': CogIcon,
  'default': HomeIcon
};

// Função para determinar badge baseado em critérios
const getBadgeForCategory = (category) => {
  const calculosCount = category.calculos?.length || 0;
  const isNew = category.createdAt && 
    new Date(category.createdAt.toDate()) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 dias
  
  if (isNew) {
    return { text: 'Nova', variant: 'secondary' };
  }
  
  if (calculosCount >= 15) {
    return { text: 'Popular', variant: 'default' };
  }
  
  if (calculosCount === 0) {
    return { text: 'Em breve', variant: 'outline' };
  }
  
  return null;
};

// Componente de integração com Firebase
const CategoriaCardIntegration = ({ 
  showOnlyActive = true,
  maxCategories = null,
  gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
}) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Hook para buscar categorias do Firebase
  const { documents: fetchedCategories, loading: fetchLoading, error: fetchError } = useFetchDocuments('categories');
  
  useEffect(() => {
    if (fetchedCategories) {
      let processedCategories = fetchedCategories.map(category => ({
        ...category,
        icon: CATEGORY_ICONS[category.slug] || CATEGORY_ICONS.default,
        badge: getBadgeForCategory(category),
        calculosCount: category.calculos?.length || 0
      }));
      
      // Filtrar apenas categorias ativas se solicitado
      if (showOnlyActive) {
        processedCategories = processedCategories.filter(cat => cat.active !== false);
      }
      
      // Limitar número de categorias se especificado
      if (maxCategories) {
        processedCategories = processedCategories.slice(0, maxCategories);
      }
      
      // Ordenar por popularidade (número de cálculos)
      processedCategories.sort((a, b) => b.calculosCount - a.calculosCount);
      
      setCategories(processedCategories);
    }
    
    setLoading(fetchLoading);
    setError(fetchError);
  }, [fetchedCategories, fetchLoading, fetchError, showOnlyActive, maxCategories]);
  
  const handleCategoryClick = (category) => {
    // Navegar para a página de cálculos da categoria
    navigate(`/calculator?category=${category.id}`, {
      state: { 
        categoryName: category.name,
        categoryDescription: category.description 
      }
    });
  };
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erro ao carregar categorias
        </h3>
        <p className="text-gray-600">
          {error.message || 'Ocorreu um erro inesperado. Tente novamente.'}
        </p>
      </div>
    );
  }
  
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma categoria encontrada
        </h3>
        <p className="text-gray-600">
          Não há categorias disponíveis no momento.
        </p>
      </div>
    );
  }
  
  return (
    <div className={`grid ${gridCols} gap-6`}>
      {categories.map((category) => (
        <CategoriaCard
          key={category.id}
          icon={category.icon}
          title={category.name}
          description={category.description}
          calculosCount={category.calculosCount}
          badge={category.badge}
          disabled={category.calculosCount === 0}
          onClick={() => handleCategoryClick(category)}
          className="h-full transition-all duration-200 hover:scale-105"
        />
      ))}
    </div>
  );
};

// Exemplo de uso em diferentes contextos
export const CategoriaCardExamples = () => {
  return (
    <div className="space-y-12 p-8">
      {/* Seção principal - todas as categorias */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Todas as Categorias
        </h2>
        <CategoriaCardIntegration />
      </section>
      
      {/* Seção destacada - top 4 categorias */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Categorias Populares
        </h2>
        <CategoriaCardIntegration 
          maxCategories={4}
          gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        />
      </section>
      
      {/* Seção compacta - layout horizontal */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Acesso Rápido
        </h2>
        <CategoriaCardIntegration 
          maxCategories={3}
          gridCols="grid-cols-1 lg:grid-cols-3"
        />
      </section>
    </div>
  );
};

export default CategoriaCardIntegration;