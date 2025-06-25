import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { AuthContext } from '../../contexts/AuthContext';
import MetricCard from '../../components/MetricCard/MetricCard';
import { 
  Users, Calculator, FolderKanban, Clock, 
  Download, Image, BarChart3, LineChart,
  Calendar, Eye
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalCalculations: 0,
    totalCategories: 0,
    activeUsers: 0
  });
  const [calculationsByCategory, setCalculationsByCategory] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [recentCalculations, setRecentCalculations] = useState([]);

  // Verificar se o usuário é administrador
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const userDoc = await getDocs(query(
          collection(db, 'users'),
          where('uid', '==', currentUser.uid)
        ));

        if (userDoc.empty || !userDoc.docs[0].data().isAdmin) {
          navigate('/');
          return;
        }

        fetchDashboardData();
      } catch (err) {
        console.error('Erro ao verificar status de administrador:', err);
        setError('Erro ao verificar permissões de administrador');
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [currentUser, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados em paralelo
      const [usersData, calculationsData, categoriesData, accessLogsData, recentCalcsData] = await Promise.all([
        fetchUsers(),
        fetchCalculations(),
        fetchCategories(),
        fetchAccessLogs(),
        fetchRecentCalculations()
      ]);

      // Processar dados para métricas
      const totalUsers = usersData.length;
      const totalCalculations = calculationsData.length;
      const totalCategories = categoriesData.length;
      
      // Usuários ativos nos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const activeUsers = new Set(
        accessLogsData
          .filter(log => log.timestamp.toDate() > sevenDaysAgo)
          .map(log => log.userId)
      ).size;

      setMetrics({
        totalUsers,
        totalCalculations,
        totalCategories,
        activeUsers
      });

      // Processar cálculos por categoria
      const calcsByCategory = categoriesData.map(category => {
        const count = calculationsData.filter(calc => calc.categoryId === category.id).length;
        return {
          categoryId: category.id,
          categoryName: category.name,
          count
        };
      }).sort((a, b) => b.count - a.count);
      
      setCalculationsByCategory(calcsByCategory);

      // Processar atividade de usuários (logs de acesso por dia)
      const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();
      
      const activityByDay = last7Days.map(day => {
        const dayStart = new Date(day);
        const dayEnd = new Date(day);
        dayEnd.setDate(dayEnd.getDate() + 1);
        
        const count = accessLogsData.filter(log => {
          const logDate = log.timestamp.toDate();
          return logDate >= dayStart && logDate < dayEnd;
        }).length;
        
        return {
          date: day,
          count
        };
      });
      
      setUserActivity(activityByDay);
      
      // Definir cálculos recentes
      setRecentCalculations(recentCalcsData);
      
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError('Erro ao carregar dados do dashboard');
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const fetchCalculations = async () => {
    const calculationsSnapshot = await getDocs(collection(db, 'calculations'));
    return calculationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const fetchCategories = async () => {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    return categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const fetchAccessLogs = async () => {
    // Buscar logs de acesso dos últimos 30 dias
    const thirtyDaysAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const logsSnapshot = await getDocs(
      query(
        collection(db, 'Logs'),
        where('timestamp', '>=', thirtyDaysAgo),
        orderBy('timestamp', 'desc')
      )
    );
    return logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const fetchRecentCalculations = async () => {
    const recentCalcsSnapshot = await getDocs(
      query(
        collection(db, 'calculations'),
        orderBy('createdAt', 'desc'),
        limit(10)
      )
    );
    
    const calculations = recentCalcsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    // Buscar nomes das categorias para os cálculos
    const categoryIds = [...new Set(calculations.map(calc => calc.categoryId))];
    const categoriesSnapshot = await getDocs(
      query(
        collection(db, 'categories'),
        where('id', 'in', categoryIds.length > 0 ? categoryIds : ['placeholder'])
      )
    );
    
    const categoriesMap = {};
    categoriesSnapshot.docs.forEach(doc => {
      categoriesMap[doc.id] = doc.data().name;
    });
    
    return calculations.map(calc => ({
      ...calc,
      categoryName: categoriesMap[calc.categoryId] || 'Sem categoria'
    }));
  };

  const exportAsCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    
    // Converter dados para CSV
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

  const exportAsImage = (chartId) => {
    // Placeholder para exportação como imagem
    // Implementação real dependeria de biblioteca de gráficos
    console.log(`Exportando gráfico ${chartId} como imagem`);
    alert('Funcionalidade de exportação como imagem será implementada em breve!');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data desconhecida';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Carregando dados do dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button className="retry-button" onClick={fetchDashboardData}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard Administrativo</h1>
        <p>Visão geral das métricas e atividades do sistema</p>
      </div>
      
      {/* Métricas principais */}
      <div className="metrics-grid">
        <MetricCard 
          title="Total de Usuários" 
          value={metrics.totalUsers} 
          icon={Users}
        />
        <MetricCard 
          title="Total de Cálculos" 
          value={metrics.totalCalculations} 
          icon={Calculator}
        />
        <MetricCard 
          title="Total de Categorias" 
          value={metrics.totalCategories} 
          icon={FolderKanban}
        />
        <MetricCard 
          title="Usuários Ativos (7 dias)" 
          value={metrics.activeUsers} 
          change={(metrics.activeUsers / metrics.totalUsers) * 100 - 100}
          changeDescription="vs. total de usuários"
          icon={Clock}
        />
      </div>
      
      {/* Gráficos */}
      <div className="dashboard-charts">
        {/* Gráfico de Cálculos por Categoria */}
        <div className="chart-container">
          <div className="chart-header">
            <h2>Cálculos por Categoria</h2>
            <div className="chart-actions">
              <button 
                className="export-button"
                onClick={() => exportAsCSV(calculationsByCategory, 'calculos-por-categoria')}
              >
                <Download size={16} />
                CSV
              </button>
              <button 
                className="export-button"
                onClick={() => exportAsImage('calculos-por-categoria')}
              >
                <Image size={16} />
                Imagem
              </button>
            </div>
          </div>
          
          {calculationsByCategory.length > 0 ? (
            <div className="chart-placeholder">
              <BarChart3 size={48} color="#64748b" />
              <p>Visualização de gráfico será implementada em breve!</p>
              <ul className="chart-data-list">
                {calculationsByCategory.slice(0, 5).map((category) => (
                  <li key={category.categoryId}>
                    <span className="category-name">{category.categoryName}</span>
                    <span className="category-count">{category.count} cálculos</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="chart-placeholder">
              <p>Nenhum dado disponível</p>
            </div>
          )}
        </div>
        
        {/* Gráfico de Atividade de Usuários */}
        <div className="chart-container">
          <div className="chart-header">
            <h2>Atividade de Usuários (7 dias)</h2>
            <div className="chart-actions">
              <button 
                className="export-button"
                onClick={() => exportAsCSV(userActivity, 'atividade-usuarios')}
              >
                <Download size={16} />
                CSV
              </button>
              <button 
                className="export-button"
                onClick={() => exportAsImage('atividade-usuarios')}
              >
                <Image size={16} />
                Imagem
              </button>
            </div>
          </div>
          
          {userActivity.length > 0 ? (
            <div className="chart-placeholder">
              <LineChart size={48} color="#64748b" />
              <p>Visualização de gráfico será implementada em breve!</p>
              <ul className="chart-data-list">
                {userActivity.map((day) => (
                  <li key={day.date}>
                    <span className="date">{new Date(day.date).toLocaleDateString('pt-BR')}</span>
                    <span className="activity-count">{day.count} acessos</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="chart-placeholder">
              <p>Nenhum dado disponível</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Cálculos Recentes */}
      <div className="recent-calculations">
        <div className="section-header">
          <h2>Cálculos Recentes</h2>
          <button 
            className="export-button"
            onClick={() => exportAsCSV(recentCalculations, 'calculos-recentes')}
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>
        
        <div className="calculations-table-container">
          {recentCalculations.length > 0 ? (
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
                {recentCalculations.map((calc) => (
                  <tr key={calc.id}>
                    <td>{calc.name}</td>
                    <td>{calc.categoryName}</td>
                    <td>{formatDate(calc.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Eye size={16} color="#64748b" />
                        {calc.views || 0}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="chart-placeholder">
              <p>Nenhum cálculo recente disponível</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;