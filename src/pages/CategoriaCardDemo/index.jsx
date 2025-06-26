import React from 'react';
import CategoriaCard from '../../components/CategoriaCard';
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

const CategoriaCardDemo = () => {
  const handleCategoryClick = (categoryName) => {
    alert(`Navegando para categoria: ${categoryName}`);
  };

  const categoriesData = [
    {
      id: 1,
      icon: CalculatorIcon,
      title: "Cálculos Básicos",
      description: "Operações matemáticas fundamentais para agricultura, incluindo área, volume e conversões de unidades essenciais para o dia a dia.",
      calculosCount: 12,
      badge: { text: "Popular", variant: "default" }
    },
    {
      id: 2,
      icon: CurrencyDollarIcon,
      title: "Análise Financeira",
      description: "Cálculos de custos, receitas, ROI e análise de viabilidade econômica para projetos agrícolas e investimentos.",
      calculosCount: 8,
      badge: { text: "Nova", variant: "secondary" }
    },
    {
      id: 3,
      icon: ChartBarIcon,
      title: "Produtividade",
      description: "Métricas de produtividade, rendimento por hectare e comparativos de safras para otimização da produção.",
      calculosCount: 15
    },
    {
      id: 4,
      icon: ClockIcon,
      title: "Planejamento Temporal",
      description: "Cronogramas de plantio, colheita e ciclos de produção agrícola para maximizar resultados.",
      calculosCount: 6
    },
    {
      id: 5,
      icon: BeakerIcon,
      title: "Análise de Solo",
      description: "Cálculos para correção de pH, fertilização e análise química do solo para melhor aproveitamento.",
      calculosCount: 10,
      badge: { text: "Técnico", variant: "outline" }
    },
    {
      id: 6,
      icon: TruckIcon,
      title: "Logística",
      description: "Cálculos de transporte, armazenamento e distribuição de produtos agrícolas.",
      calculosCount: 0,
      badge: { text: "Em breve", variant: "outline" },
      disabled: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Demonstração do CategoriaCard
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Componente reutilizável para exibir categorias de cálculos de forma visual e interativa.
              Clique em qualquer card para testar a funcionalidade.
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Seção principal */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Categorias Disponíveis
          </h2>
          <p className="text-gray-600 mb-8">
            Grid responsivo com todas as categorias de cálculos
          </p>
          
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
                className="h-full"
              />
            ))}
          </div>
        </section>

        {/* Seção de variações */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Variações de Layout
          </h2>
          <p className="text-gray-600 mb-8">
            Diferentes configurações e tamanhos do componente
          </p>
          
          {/* Layout compacto */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Layout Compacto (4 colunas)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoriesData.slice(0, 4).map((category) => (
                <CategoriaCard
                  key={`compact-${category.id}`}
                  icon={category.icon}
                  title={category.title}
                  description={category.description.substring(0, 80) + '...'}
                  calculosCount={category.calculosCount}
                  onClick={() => handleCategoryClick(category.title)}
                  className="h-48"
                />
              ))}
            </div>
          </div>
          
          {/* Card destacado */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Card em Destaque
            </h3>
            <div className="max-w-md mx-auto">
              <CategoriaCard
                icon={CalculatorIcon}
                title="Categoria Premium"
                description="Esta é uma categoria especial com layout destacado para chamar atenção do usuário. Possui bordas especiais e sombra mais pronunciada."
                calculosCount={25}
                badge={{ text: "Premium", variant: "default" }}
                onClick={() => handleCategoryClick("Categoria Premium")}
                className="border-2 border-[#00418F] shadow-lg hover:shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Seção de estados */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Estados do Componente
          </h2>
          <p className="text-gray-600 mb-8">
            Diferentes estados visuais e funcionais
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Estado normal */}
            <CategoriaCard
              icon={HomeIcon}
              title="Estado Normal"
              description="Card em estado padrão, totalmente funcional e interativo."
              calculosCount={5}
              onClick={() => handleCategoryClick("Estado Normal")}
            />
            
            {/* Estado com badge */}
            <CategoriaCard
              icon={CogIcon}
              title="Com Badge"
              description="Card com badge de destaque para chamar atenção."
              calculosCount={3}
              badge={{ text: "Novo", variant: "secondary" }}
              onClick={() => handleCategoryClick("Com Badge")}
            />
            
            {/* Estado desabilitado */}
            <CategoriaCard
              icon={TruckIcon}
              title="Desabilitado"
              description="Card em estado desabilitado, sem interação disponível."
              calculosCount={0}
              badge={{ text: "Em breve", variant: "outline" }}
              disabled={true}
              onClick={() => handleCategoryClick("Desabilitado")}
            />
          </div>
        </section>

        {/* Seção de informações técnicas */}
        <section className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Informações Técnicas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Características
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Totalmente responsivo</li>
                <li>• Acessível (ARIA, navegação por teclado)</li>
                <li>• Suporte a ícones de múltiplas bibliotecas</li>
                <li>• Badges opcionais customizáveis</li>
                <li>• Estados visuais claros</li>
                <li>• Animações suaves</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Tecnologias
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• React 19+</li>
                <li>• Tailwind CSS</li>
                <li>• Heroicons</li>
                <li>• Class Variance Authority</li>
                <li>• Componentes UI customizados</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              💡 Dica de Uso
            </h4>
            <p className="text-blue-800 text-sm">
              Para usar este componente em seu projeto, importe-o de <code className="bg-blue-100 px-1 rounded">@/components/CategoriaCard</code> 
              e passe as props necessárias. Consulte o README.md para documentação completa.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CategoriaCardDemo;