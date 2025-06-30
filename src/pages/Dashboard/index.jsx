import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { AuthContext } from '../../context/AuthContext';
import { 
  Users, 
  Calculator, 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  FileImage,
  Loader2,
  Filter,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import MetricCard from '../../components/MetricCard';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAdmin } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalCalculations: 0,
    totalCategories: 0,
    recentCalculations: [],
    calculationsByCategory: [],
    userActivity: []
  });
  
  // Estados para filtragem
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d, all
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCategoryFilters, setShowCategoryFilters] = useState(false);
  const [showActivityFilters, setShowActivityFilters] = useState(false);
  
  // Refs para detectar cliques fora dos filtros
  const categoryFilterRef = useRef(null);
  const activityFilterRef = useRef(null);
  const [filteredUserActivity, setFilteredUserActivity] = useState([]);
  const [filteredCalculationsByCategory, setFilteredCalculationsByCategory] = useState([]);
  const [filteredRecentCalculations, setFilteredRecentCalculations] = useState([]);
  const [recentCalculationsDateRange, setRecentCalculationsDateRange] = useState('7d');
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [activitySortOrder, setActivitySortOrder] = useState('desc'); // asc, desc

  // Função para aplicar filtro de data aos dados de atividade
  const applyDateFilter = (data, range) => {
    if (range === 'all') return data;
    
    const now = new Date();
    let startDate;
    
    switch(range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
  };
  
  // Função para aplicar filtro de categoria
  const applyCategoryFilter = (data, category) => {
    if (category === 'all') return data;
    return data.filter(item => item.category === category);
  };
  
  // Função para aplicar ordenação aos dados
  const applySortOrder = (data, order, key = 'createdAt') => {
    if (!data || data.length === 0) return [];
    
    return [...data].sort((a, b) => {
      // Verificar se os dados existem
      const dateA = a[key] instanceof Date ? a[key] : new Date(a[key]);
      const dateB = b[key] instanceof Date ? b[key] : new Date(b[key]);
      
      if (order === 'asc') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  };

  // Efeito para aplicar filtros quando os dados ou filtros mudam
  useEffect(() => {
    if (metrics.userActivity.length > 0) {
      const dateFiltered = applyDateFilter(metrics.userActivity, dateRange);
      const sorted = applySortOrder(dateFiltered, activitySortOrder, 'date');
      setFilteredUserActivity(sorted);
    }
    
    if (metrics.calculationsByCategory.length > 0) {
      setFilteredCalculationsByCategory(applyCategoryFilter(metrics.calculationsByCategory, categoryFilter));
    }

    if (metrics.recentCalculations.length > 0) {
      const dateFiltered = applyDateFilter(metrics.recentCalculations, recentCalculationsDateRange);
      const sorted = applySortOrder(dateFiltered, sortOrder);
      setFilteredRecentCalculations(sorted);
    }
  }, [metrics, dateRange, categoryFilter, recentCalculationsDateRange, sortOrder, activitySortOrder]);

  // Efeito para detectar cliques fora dos filtros
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verificar se o clique foi fora do filtro de categoria
      if (categoryFilterRef.current && !categoryFilterRef.current.contains(event.target)) {
        setShowCategoryFilters(false);
      }
      
      // Verificar se o clique foi fora do filtro de atividade
      if (activityFilterRef.current && !activityFilterRef.current.contains(event.target)) {
        setShowActivityFilters(false);
      }
    };

    // Adicionar event listener apenas se algum filtro estiver aberto
    if (showCategoryFilters || showActivityFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryFilters, showActivityFilters]);

  // Função para buscar dados do dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar contagem de usuários
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Buscar cálculos
      const calculationsSnapshot = await getDocs(collection(db, 'calculations'));
      const totalCalculations = calculationsSnapshot.size;
      
      // Buscar categorias
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const totalCategories = categoriesSnapshot.size;

      // Buscar cálculos recentes
      const recentCalculationsQuery = query(
        collection(db, 'calculations'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentCalculationsSnapshot = await getDocs(recentCalculationsQuery);
      
      // Agrupar categorias por ID para referência rápida
      const categoriesMap = {};
      categoriesSnapshot.docs.forEach(doc => {
        categoriesMap[doc.id] = doc.data().name;
      });
      
      const recentCalculations = recentCalculationsSnapshot.docs.map(doc => {
        const data = doc.data();
        const categoryIds = data.categories || [];
        const categoryNames = categoryIds.map(id => categoriesMap[id] || 'N/A').filter(name => name !== 'N/A');
        
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          categoryNames: categoryNames
        };
      });

      // Agrupar cálculos por categoria
      const calculationsByCategory = [];
      const categoryCountMap = {};

      calculationsSnapshot.docs.forEach(doc => {
        const calculation = doc.data();
        const categories = calculation.categories || [];
        
        categories.forEach(categoryId => {
          if (categoriesMap[categoryId]) {
            const categoryName = categoriesMap[categoryId];
            categoryCountMap[categoryName] = (categoryCountMap[categoryName] || 0) + 1;
          }
        });
      });

      Object.keys(categoryCountMap).forEach(category => {
        calculationsByCategory.push({
          category,
          count: categoryCountMap[category]
        });
      });

      // Buscar logs para atividade de usuários
      const logsQuery = query(
        collection(db, 'Logs'),
        orderBy('timestamp', 'desc'),
        limit(30)
      );
      const logsSnapshot = await getDocs(logsQuery);
      
      // Agrupar logs por dia para criar dados de atividade
      const activityMap = {};
      logsSnapshot.docs.forEach(doc => {
        const log = doc.data();
        const date = log.timestamp?.toDate() || new Date();
        const dateString = date.toISOString().split('T')[0];
        
        activityMap[dateString] = (activityMap[dateString] || 0) + 1;
      });

      // Garantir que temos dados para os últimos 7 dias, mesmo sem atividade
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        last7Days.push(dateString);
      }
      
      const userActivity = last7Days.map(date => ({
        date,
        count: activityMap[date] || 0
      }));

      setMetrics({
        totalUsers,
        totalCalculations,
        totalCategories,
        recentCalculations,
        calculationsByCategory,
        userActivity
      });
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError('Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  // Efeito para verificar permissões e carregar dados iniciais
  useEffect(() => {
    // Verificar se o usuário é administrador
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [isAdmin, navigate]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Função para exportar dados como CSV
  const exportAsCSV = (data, filename) => {
    // Converter dados para formato CSV
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(','));
    const csv = [headers, ...rows].join('\n');
    
    // Criar blob e link para download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Referências para os gráficos
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);
  
  // Função para exportar dados como imagem
  const exportAsImage = (chartRef, filename) => {
    if (!chartRef.current) {
      alert('Não foi possível exportar o gráfico. Tente novamente.');
      return;
    }
    
    try {
      // Obter o elemento SVG do gráfico
      const svgElement = chartRef.current.container.querySelector('svg');
      
      if (!svgElement) {
        console.error('Elemento SVG não encontrado');
        alert('Não foi possível exportar o gráfico. Elemento SVG não encontrado.');
        return;
      }
      
      // Criar um canvas temporário
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Definir dimensões do canvas
      const svgRect = svgElement.getBoundingClientRect();
      canvas.width = svgRect.width;
      canvas.height = svgRect.height;
      
      // Converter SVG para string
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      
      img.onload = () => {
        // Desenhar imagem no canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // Converter canvas para URL de dados
        const dataUrl = canvas.toDataURL('image/png');
        
        // Criar link para download
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = dataUrl;
        link.click();
      };
      
      // Carregar SVG como imagem
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    } catch (error) {
      console.error('Erro ao exportar imagem:', error);
      alert('Ocorreu um erro ao exportar a imagem. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader2 className="animate-spin" size={48} />
        <p>Carregando dados do dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard Administrativo</h1>
        <p>Visão geral das métricas e atividades da plataforma</p>
        <button 
          onClick={() => fetchDashboardData()} 
          className="refresh-button"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Atualizar dados
        </button>
      </div>

      <div className="metrics-grid">
        <MetricCard 
          title="Usuários" 
          value={metrics.totalUsers} 
          icon={Users} 
          description="Total de usuários registrados" 
        />
        <MetricCard 
          title="Cálculos" 
          value={metrics.totalCalculations} 
          icon={Calculator} 
          description="Total de cálculos disponíveis" 
        />
        <MetricCard 
          title="Categorias" 
          value={metrics.totalCategories} 
          icon={FileSpreadsheet} 
          description="Total de categorias de cálculos" 
        />
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <div className="chart-header">
            <h2>Cálculos por Categoria</h2>
            <div className="chart-actions">
              <div className="filter-dropdown" ref={categoryFilterRef}>
                <button 
                  onClick={() => setShowCategoryFilters(prev => !prev)} 
                  className="filter-button"
                >
                  <Filter size={16} />
                  Filtrar
                  <ChevronDown size={14} />
                </button>
                {showCategoryFilters && (
                  <div className="filter-menu">
                    <div className="filter-group">
                      <label>Categoria:</label>
                      <select 
                        value={categoryFilter} 
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">Todas</option>
                        {metrics.calculationsByCategory.map((item) => (
                          <option key={item.category} value={item.category}>
                            {item.category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => exportAsCSV(filteredCalculationsByCategory, 'calculos-por-categoria')} 
                className="export-button"
              >
                <Download size={16} />
                CSV
              </button>
              <button 
                onClick={() => exportAsImage(barChartRef, 'calculos-por-categoria')} 
                className="export-button"
              >
                <FileImage size={16} />
                PNG
              </button>
            </div>
          </div>
          <div className="chart-container-inner">
            <ResponsiveContainer width="100%" height={300} aspect={undefined}>
              <BarChart
                ref={barChartRef}
                data={filteredCalculationsByCategory.length > 0 ? filteredCalculationsByCategory : metrics.calculationsByCategory}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Quantidade" fill="#00418F" />
              </BarChart>
            </ResponsiveContainer>
            
            <ul className="chart-data-list">
              {(filteredCalculationsByCategory.length > 0 ? filteredCalculationsByCategory : metrics.calculationsByCategory).map((item, index) => (
                <li key={index}>
                  <span className="category-name">{item.category}</span>
                  <span className="category-count">{item.count} cálculos</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h2>Atividade de Usuários</h2>
            <div className="chart-actions">
              <div className="filter-dropdown" ref={activityFilterRef}>
                <button 
                  onClick={() => setShowActivityFilters(prev => !prev)} 
                  className="filter-button"
                >
                  <Filter size={16} />
                  Filtrar
                  <ChevronDown size={14} />
                </button>
                {showActivityFilters && (
                  <div className="filter-menu">
                    <div className="filter-group">
                      <label>Período:</label>
                      <select 
                        value={dateRange} 
                        onChange={(e) => setDateRange(e.target.value)}
                        className="filter-select"
                      >
                        <option value="7d">Últimos 7 dias</option>
                        <option value="30d">Últimos 30 dias</option>
                        <option value="90d">Últimos 90 dias</option>
                        <option value="all">Todo o período</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Ordenação:</label>
                      <select 
                        value={activitySortOrder} 
                        onChange={(e) => setActivitySortOrder(e.target.value)}
                        className="filter-select"
                      >
                        <option value="desc">Mais recentes primeiro</option>
                        <option value="asc">Mais antigos primeiro</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => exportAsCSV(filteredUserActivity, 'atividade-usuarios')} 
                className="export-button"
              >
                <Download size={16} />
                CSV
              </button>
              <button 
                onClick={() => exportAsImage(lineChartRef, 'atividade-usuarios')} 
                className="export-button"
              >
                <FileImage size={16} />
                PNG
              </button>
            </div>
          </div>
          <div className="chart-container-inner">
            <ResponsiveContainer width="100%" height={300} aspect={undefined}>
              <LineChart
                ref={lineChartRef}
                data={filteredUserActivity.length > 0 ? filteredUserActivity : metrics.userActivity}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDate(value)}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => `Data: ${formatDate(value)}`}
                  formatter={(value) => [`${value} acessos`, 'Atividade']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Atividade" 
                  stroke="#00418F" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
            
            <ul className="chart-data-list">
              {(filteredUserActivity.length > 0 ? filteredUserActivity : metrics.userActivity).map((item, index) => (
                <li key={index}>
                  <span className="date">{formatDate(item.date)}</span>
                  <span className="activity-count">{item.count} acessos</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="recent-calculations">
        <div className="section-header">
          <h2>Cálculos Recentes</h2>
          <div className="chart-actions">
            <button 
              onClick={() => exportAsCSV(filteredRecentCalculations.length > 0 ? filteredRecentCalculations : metrics.recentCalculations, 'calculos-recentes')} 
              className="export-button"
            >
              <Download size={16} />
              CSV
            </button>
          </div>
        </div>
        <div className="calculations-table-container">
          <table className="calculations-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Data de Criação</th>
                <th>Visualizações</th>
              </tr>
            </thead>
            <tbody>
              {(filteredRecentCalculations.length > 0 ? filteredRecentCalculations : metrics.recentCalculations).map((calc) => (
                <tr key={calc.id}>
                  <td>{calc.name}</td>
                  <td>
                    {calc.categories && calc.categories.length > 0 
                      ? calc.categoryNames && calc.categoryNames.length > 0 
                        ? calc.categoryNames.join(', ') 
                        : 'N/A'
                      : 'N/A'}
                  </td>
                  <td>{formatDate(calc.createdAt)}</td>
                  <td>{calc.views || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;