import React, { useState, useMemo } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon, TagIcon } from '@heroicons/react/24/outline';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Dados do FAQ organizados por categoria
  const faqData = {
    plantio: {
      title: 'Plantio e Cultivo',
      icon: '🌱',
      items: [
        {
          id: 'plantio-1',
          question: 'Qual é a melhor época para plantar milho?',
          answer: 'O milho deve ser plantado preferencialmente no início do período chuvoso, entre setembro e dezembro, dependendo da região. É importante considerar a temperatura do solo (mínimo 16°C) e a disponibilidade de água.',
          tags: ['milho', 'época', 'plantio', 'clima']
        },
        {
          id: 'plantio-2',
          question: 'Como calcular o espaçamento ideal entre plantas?',
          answer: 'O espaçamento varia conforme a cultura. Para milho: 70-90cm entre fileiras e 20-25cm entre plantas. Para soja: 40-50cm entre fileiras. Use nossa calculadora para obter valores precisos baseados na sua cultura específica.',
          tags: ['espaçamento', 'densidade', 'produtividade']
        },
        {
          id: 'plantio-3',
          question: 'Qual a profundidade ideal para semear?',
          answer: 'A regra geral é plantar a uma profundidade de 2-3 vezes o diâmetro da semente. Sementes pequenas (1-2cm), sementes médias (2-4cm), sementes grandes (4-6cm). Ajuste conforme umidade e tipo de solo.',
          tags: ['profundidade', 'semeadura', 'sementes']
        }
      ]
    },
    solo: {
      title: 'Solo e Nutrição',
      icon: '🌍',
      items: [
        {
          id: 'solo-1',
          question: 'Como interpretar a análise de solo?',
          answer: 'A análise de solo mostra pH, matéria orgânica, fósforo, potássio e outros nutrientes. pH ideal: 6.0-7.0 para maioria das culturas. Matéria orgânica: mínimo 2.5%. Use nossa calculadora para interpretar os resultados.',
          tags: ['análise', 'pH', 'nutrientes', 'interpretação']
        },
        {
          id: 'solo-2',
          question: 'Quando fazer calagem?',
          answer: 'Faça calagem quando o pH estiver abaixo de 5.5 ou quando a saturação por bases for inferior a 60%. Aplique calcário 2-3 meses antes do plantio para permitir a reação no solo.',
          tags: ['calagem', 'pH', 'calcário', 'correção']
        },
        {
          id: 'solo-3',
          question: 'Como calcular a necessidade de adubo?',
          answer: 'Base-se na análise de solo, expectativa de produtividade e exigência da cultura. Nossa calculadora considera estes fatores e recomenda as quantidades de N, P e K necessárias.',
          tags: ['adubação', 'NPK', 'fertilizantes', 'cálculo']
        }
      ]
    },
    calculadora: {
      title: 'Uso da Calculadora',
      icon: '🧮',
      items: [
        {
          id: 'calc-1',
          question: 'Como criar um novo cálculo?',
          answer: 'Acesse a seção "Calculadora", clique em "Novo Cálculo", escolha a categoria (plantio, solo, etc.), preencha os parâmetros solicitados e clique em "Calcular". O resultado será exibido com explicações detalhadas.',
          tags: ['novo cálculo', 'tutorial', 'como usar']
        },
        {
          id: 'calc-2',
          question: 'Posso salvar meus cálculos?',
          answer: 'Sim! Todos os cálculos são automaticamente salvos no seu histórico. Você pode acessá-los, editá-los e compartilhá-los a qualquer momento através do menu "Meus Cálculos".',
          tags: ['salvar', 'histórico', 'editar']
        },
        {
          id: 'calc-3',
          question: 'Como interpretar os resultados?',
          answer: 'Cada resultado inclui: valor calculado, unidade de medida, explicação do cálculo e recomendações práticas. Clique no ícone "?" ao lado de cada resultado para mais detalhes.',
          tags: ['resultados', 'interpretação', 'explicação']
        }
      ]
    },
    tecnico: {
      title: 'Suporte Técnico',
      icon: '🔧',
      items: [
        {
          id: 'tec-1',
          question: 'A calculadora não está funcionando',
          answer: 'Verifique sua conexão com a internet, atualize a página (F5) e tente novamente. Se o problema persistir, limpe o cache do navegador ou entre em contato conosco.',
          tags: ['erro', 'não funciona', 'problema técnico']
        },
        {
          id: 'tec-2',
          question: 'Como recuperar minha senha?',
          answer: 'Na tela de login, clique em "Esqueci minha senha", digite seu email e siga as instruções enviadas para sua caixa de entrada. Verifique também a pasta de spam.',
          tags: ['senha', 'recuperar', 'login']
        },
        {
          id: 'tec-3',
          question: 'Posso usar no celular?',
          answer: 'Sim! Nossa calculadora é totalmente responsiva e funciona perfeitamente em smartphones e tablets. Recomendamos usar no modo paisagem para melhor visualização.',
          tags: ['mobile', 'celular', 'responsivo']
        }
      ]
    }
  };

  const categories = [
    { id: 'todos', name: 'Todas as Categorias', icon: '📋' },
    { id: 'plantio', name: 'Plantio e Cultivo', icon: '🌱' },
    { id: 'solo', name: 'Solo e Nutrição', icon: '🌍' },
    { id: 'calculadora', name: 'Uso da Calculadora', icon: '🧮' },
    { id: 'tecnico', name: 'Suporte Técnico', icon: '🔧' }
  ];

  // Filtrar itens baseado na busca e categoria
  const filteredItems = useMemo(() => {
    let items = [];
    
    if (selectedCategory === 'todos') {
      Object.values(faqData).forEach(category => {
        items.push(...category.items.map(item => ({ ...item, category: category.title })));
      });
    } else {
      items = faqData[selectedCategory]?.items.map(item => ({ 
        ...item, 
        category: faqData[selectedCategory].title 
      })) || [];
    }

    if (searchTerm) {
      items = items.filter(item => 
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return items;
  }, [searchTerm, selectedCategory]);

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encontre respostas rápidas para suas dúvidas sobre agricultura e uso da nossa calculadora
          </p>
        </div>

        {/* Busca e Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Campo de busca */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por pergunta, resposta ou palavra-chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filtro por categoria */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar sua busca ou escolher uma categoria diferente
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.question}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <TagIcon className="h-4 w-4" />
                          {item.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {expandedItems.has(item.id) ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </button>
                
                {expandedItems.has(item.id) && (
                  <div className="px-6 pb-4 border-t border-gray-100">
                    <div className="pt-4 text-gray-700 leading-relaxed">
                      {item.answer}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Seção de contato */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Não encontrou o que procurava?
          </h2>
          <p className="text-gray-600 mb-6">
            Nossa equipe está sempre pronta para ajudar com suas dúvidas específicas sobre agricultura
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:suporte@calculadoradoagricultor.com"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              📧 Enviar Email
            </a>
            <a
              href="/glossario"
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              📚 Consultar Glossário
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;