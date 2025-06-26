import React from 'react';
import CategoriaCard from './index';
import {
  CalculatorIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  BeakerIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

// Exemplo de uso do componente CategoriaCard
const CategoriaCardExample = () => {
  const handleCategoryClick = (categoryName) => {
    console.log(`Navegando para categoria: ${categoryName}`);
    // Aqui você implementaria a navegação real
    // Por exemplo: navigate(`/categorias/${categoryId}`);
  };

  const categoriesData = [
    {
      id: 1,
      icon: CalculatorIcon,
      title: "Cálculos Básicos",
      description: "Operações matemáticas fundamentais para agricultura, incluindo área, volume e conversões de unidades.",
      calculosCount: 12,
      badge: { text: "Popular", variant: "default" }
    },
    {
      id: 2,
      icon: CurrencyDollarIcon,
      title: "Análise Financeira",
      description: "Cálculos de custos, receitas, ROI e análise de viabilidade econômica para projetos agrícolas.",
      calculosCount: 8,
      badge: { text: "Nova", variant: "secondary" }
    },
    {
      id: 3,
      icon: ChartBarIcon,
      title: "Produtividade",
      description: "Métricas de produtividade, rendimento por hectare e comparativos de safras.",
      calculosCount: 15
    },
    {
      id: 4,
      icon: ClockIcon,
      title: "Planejamento Temporal",
      description: "Cronogramas de plantio, colheita e ciclos de produção agrícola.",
      calculosCount: 6
    },
    {
      id: 5,
      icon: BeakerIcon,
      title: "Análise de Solo",
      description: "Cálculos para correção de pH, fertilização e análise química do solo.",
      calculosCount: 10,
      badge: { text: "Técnico", variant: "outline" }
    },
    {
      id: 6,
      icon: TruckIcon,
      title: "Logística",
      description: "Cálculos de transporte, armazenamento e distribuição de produtos agrícolas.",
      calculosCount: 4,
      disabled: true // Exemplo de categoria desabilitada
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Categorias de Cálculos
        </h1>
        <p className="text-gray-600 mb-8">
          Selecione uma categoria para ver os cálculos disponíveis
        </p>
        
        {/* Grid responsivo de cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesData.map((category) => (
            <CategoriaCard
              key={category.id}
              icon={category.icon}
              title={category.title}
              description={category.description}
              calculosCount={category.calculosCount}
              badge={category.badge}
              disabled={category.disabled}
              onClick={() => handleCategoryClick(category.title)}
              className="h-full" // Garante altura uniforme
            />
          ))}
        </div>
        
        {/* Exemplo de uso com diferentes tamanhos */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Variações de Layout
          </h2>
          
          {/* Layout em linha única */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
            {categoriesData.slice(0, 4).map((category) => (
              <CategoriaCard
                key={`inline-${category.id}`}
                icon={category.icon}
                title={category.title}
                description={category.description.substring(0, 80) + '...'}
                calculosCount={category.calculosCount}
                onClick={() => handleCategoryClick(category.title)}
                className="h-48" // Altura fixa menor
              />
            ))}
          </div>
          
          {/* Card destacado */}
          <div className="max-w-md mx-auto">
            <CategoriaCard
              icon={CalculatorIcon}
              title="Categoria em Destaque"
              description="Esta é uma categoria especial com layout destacado para chamar atenção do usuário."
              calculosCount={25}
              badge={{ text: "Destaque", variant: "default" }}
              onClick={() => handleCategoryClick("Categoria em Destaque")}
              className="border-2 border-[#00418F] shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriaCardExample;