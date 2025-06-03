import React, { useState, useEffect, useContext } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { AuthContext } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  ClockIcon,
  UserIcon,
  MapPinIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  ArrowTopRightOnSquareIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import './LogsManagement.css';

const LogsManagement = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const logsPerPage = 10;

  const { user, isAdmin } = useContext(AuthContext);

  // Função para formatar a data
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data indisponível';
    
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  // Função para abrir a localização em um serviço de mapas
  const openInMaps = (latitude, longitude) => {
    // Opções de serviços de mapas
    const mapServices = [
      {
        name: 'Google Maps',
        url: `https://www.google.com/maps?q=${latitude},${longitude}`
      },
      {
        name: 'Waze',
        url: `https://www.waze.com/ul?ll=${latitude},${longitude}&navigate=yes`
      },
      {
        name: 'Bing Maps',
        url: `https://www.bing.com/maps?cp=${latitude}~${longitude}&lvl=15`
      }
    ];

    // Abre o Google Maps por padrão
    window.open(mapServices[0].url, '_blank');
  };

  // Função para buscar os logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const logsCollectionRef = collection(db, 'logs');
      const q = query(logsCollectionRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const logsData = [];
      querySnapshot.forEach((doc) => {
        logsData.push({ id: doc.id, ...doc.data() });
      });

      setLogs(logsData);
      setTotalPages(Math.ceil(logsData.length / logsPerPage));
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
      setError('Falha ao carregar os logs. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchLogs();
    }
  }, [user, isAdmin]);

  // Filtrar logs com base no termo de pesquisa, tipo de filtro, data e usuário
  const filteredLogs = logs.filter(log => {
    // Filtro de pesquisa
    const matchesSearch = searchTerm === '' || 
      (log.description && log.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.idUser && log.idUser.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtro de localização
    let matchesLocation = true;
    if (filterType === 'with-location') {
      matchesLocation = log.location && log.location.latitude && log.location.longitude;
    } else if (filterType === 'without-location') {
      matchesLocation = !log.location || !log.location.latitude || !log.location.longitude;
    }
    
    // Filtro de usuário
    const matchesUser = userFilter === '' || 
      (log.idUser && log.idUser.toLowerCase().includes(userFilter.toLowerCase()));
    
    // Filtro de data
    let matchesDate = true;
    if (log.date && dateFilter !== 'all') {
      const logDate = log.date.toDate();
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      switch (dateFilter) {
        case 'today':
          matchesDate = logDate.toDateString() === today.toDateString();
          break;
        case 'yesterday':
          matchesDate = logDate.toDateString() === yesterday.toDateString();
          break;
        case 'last-week':
          matchesDate = logDate >= lastWeek;
          break;
        case 'last-month':
          matchesDate = logDate >= lastMonth;
          break;
        case 'custom':
          if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Include the entire end date
            matchesDate = logDate >= start && logDate <= end;
          } else if (startDate) {
            const start = new Date(startDate);
            matchesDate = logDate >= start;
          } else if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            matchesDate = logDate <= end;
          }
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesLocation && matchesUser && matchesDate;
  });

  // Paginação
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  // Verificar se o usuário é administrador
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="logs-container flex flex-col items-center justify-start bg-gradient-to-br from-[#00418F]/5 via-white to-[#FFEE00]/5 p-4 md:p-8 min-h-screen">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl w-full max-w-6xl border border-[#00418F]/10 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-[#00418F]/20 to-[#00418F]/10 p-8 border-b border-[#00418F]/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-10 w-10 text-[#00418F] mr-4" />
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00418F] to-[#0066FF]">Gerenciamento de Logs</h1>
                <p className="text-[#00418F]/70 mt-1">Visualize e gerencie os logs de atividades dos usuários</p>
              </div>
            </div>
            <button
              onClick={fetchLogs}
              className="p-3 bg-[#00418F] text-white rounded-xl hover:bg-[#00418F]/90 transition-all duration-150 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 group"
              title="Atualizar logs"
            >
              <ArrowPathIcon className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
              <span className="ml-2 font-medium">Atualizar</span>
            </button>
          </div>
        </div>

        {/* Filtros e pesquisa */}
        <div className="p-6 border-b border-[#00418F]/10 bg-gradient-to-r from-[#00418F]/5 to-transparent">
          <div className="space-y-4">
            {/* Primeira linha - Pesquisa e filtro de localização */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                  <MagnifyingGlassIcon className="h-6 w-6 text-[#00418F]/70" />
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar logs..."
                  className="pl-14 pr-4 py-3 w-full rounded-xl border-2 border-[#00418F]/30 focus:border-[#00418F] focus:ring-2 focus:ring-[#00418F]/20 transition-all duration-300 shadow-sm bg-white/80 backdrop-blur-sm text-gray-700 placeholder-[#00418F]/60"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select
                className="px-4 py-3 rounded-xl border-2 border-[#00418F]/30 focus:border-[#00418F] focus:ring-2 focus:ring-[#00418F]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm text-[#00418F] shadow-sm cursor-pointer font-medium"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Todos os logs</option>
                <option value="with-location">Com localização</option>
                <option value="without-location">Sem localização</option>
              </select>
            </div>

            {/* Segunda linha - Filtros adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro de usuário */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <UserIcon className="h-5 w-5 text-[#00418F]/70" />
                </div>
                <input
                  type="text"
                  placeholder="Filtrar por usuário..."
                  className="pl-12 pr-4 py-3 w-full rounded-xl border-2 border-[#00418F]/30 focus:border-[#00418F] focus:ring-2 focus:ring-[#00418F]/20 transition-all duration-300 shadow-sm bg-white/80 backdrop-blur-sm text-gray-700 placeholder-[#00418F]/60"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                />
              </div>

              {/* Filtro de data */}
              <select
                className="px-4 py-3 rounded-xl border-2 border-[#00418F]/30 focus:border-[#00418F] focus:ring-2 focus:ring-[#00418F]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm text-[#00418F] shadow-sm cursor-pointer font-medium"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">Todas as datas</option>
                <option value="today">Hoje</option>
                <option value="yesterday">Ontem</option>
                <option value="last-week">Última semana</option>
                <option value="last-month">Último mês</option>
                <option value="custom">Período personalizado</option>
              </select>

              {/* Data inicial (aparece apenas quando "custom" está selecionado) */}
              {dateFilter === 'custom' && (
                <input
                  type="date"
                  placeholder="Data inicial"
                  className="px-4 py-3 rounded-xl border-2 border-[#00418F]/30 focus:border-[#00418F] focus:ring-2 focus:ring-[#00418F]/20 transition-all duration-300 shadow-sm bg-white/80 backdrop-blur-sm text-[#00418F] cursor-pointer"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              )}

              {/* Data final (aparece apenas quando "custom" está selecionado) */}
              {dateFilter === 'custom' && (
                <input
                  type="date"
                  placeholder="Data final"
                  className="px-4 py-3 rounded-xl border-2 border-[#00418F]/30 focus:border-[#00418F] focus:ring-2 focus:ring-[#00418F]/20 transition-all duration-300 shadow-sm bg-white/80 backdrop-blur-sm text-[#00418F] cursor-pointer"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              )}
            </div>

            {/* Indicador de filtros ativos */}
            {(searchTerm || filterType !== 'all' || dateFilter !== 'all' || userFilter) && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#00418F]/10">
                <span className="text-sm text-[#00418F]/70 font-medium">Filtros ativos:</span>
                {searchTerm && (
                  <span className="px-3 py-1 bg-[#00418F]/10 text-[#00418F] rounded-full text-sm font-medium">
                    Busca: "{searchTerm}"
                  </span>
                )}
                {filterType !== 'all' && (
                  <span className="px-3 py-1 bg-[#00418F]/10 text-[#00418F] rounded-full text-sm font-medium">
                    {filterType === 'with-location' ? 'Com localização' : 'Sem localização'}
                  </span>
                )}
                {userFilter && (
                  <span className="px-3 py-1 bg-[#00418F]/10 text-[#00418F] rounded-full text-sm font-medium">
                    Usuário: "{userFilter}"
                  </span>
                )}
                {dateFilter !== 'all' && (
                  <span className="px-3 py-1 bg-[#00418F]/10 text-[#00418F] rounded-full text-sm font-medium">
                    {dateFilter === 'today' && 'Hoje'}
                    {dateFilter === 'yesterday' && 'Ontem'}
                    {dateFilter === 'last-week' && 'Última semana'}
                    {dateFilter === 'last-month' && 'Último mês'}
                    {dateFilter === 'custom' && 'Período personalizado'}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setDateFilter('all');
                    setUserFilter('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium hover:bg-red-200 transition-colors duration-200"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo principal - Cards de logs */}
        <div className="overflow-x-auto bg-white/70 backdrop-blur-sm">
          {loading ? (
            <div className="loading-state flex flex-col items-center justify-center p-16 space-y-4">
              <div className="spinner"></div>
              <p className="text-[#00418F]/70 font-medium">Carregando logs...</p>
            </div>
          ) : error ? (
            <div className="error-state flex items-center justify-center p-12 text-red-600 bg-red-50/50 backdrop-blur-sm rounded-xl m-4 border border-red-100">
              <ExclamationCircleIcon className="h-8 w-8 mr-3 icon-animated" />
              <span className="text-lg font-medium">{error}</span>
            </div>
          ) : currentLogs.length === 0 ? (
            <div className="empty-state flex flex-col items-center justify-center p-16 text-[#00418F]/70 bg-[#00418F]/5 rounded-xl m-4">
              <DocumentTextIcon className="h-20 w-20 mb-4 icon-animated" />
              <p className="text-xl font-medium">Nenhum log encontrado</p>
              <p className="text-sm mt-2 opacity-80">Não há logs que correspondam aos critérios de pesquisa.</p>
            </div>
          ) : (
            <div className="grid gap-4 p-4">
              {currentLogs.map((log, index) => (
                <div key={log.id} className="log-card bg-white rounded-xl p-6 shadow-sm border border-[#00418F]/10 hover:border-[#00418F]/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <ClockIcon className="h-6 w-6 text-[#00418F]/70 icon-animated" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#00418F]/70 font-semibold mb-1">Data</p>
                        <p className="text-sm text-gray-700 break-words">{log.date ? formatDate(log.date) : 'Data indisponível'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <UserIcon className="h-6 w-6 text-[#00418F]/70 icon-animated" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#00418F]/70 font-semibold mb-1">Usuário</p>
                        <p className="text-sm text-gray-700 break-words">{log.idUser || 'Usuário desconhecido'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon className="h-6 w-6 text-[#00418F]/70 icon-animated" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#00418F]/70 font-semibold mb-1">Descrição</p>
                        <p className="text-sm text-gray-700 break-words">{log.description || 'Sem descrição'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <MapPinIcon className="h-6 w-6 text-[#00418F]/70 icon-animated" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#00418F]/70 font-semibold mb-1">Localização</p>
                        {log.location && log.location.latitude && log.location.longitude ? (
                          <button
                            onClick={() => openInMaps(log.location.latitude, log.location.longitude)}
                            className="map-button text-sm text-[#00418F] hover:text-[#00418F]/80 transition-all duration-300 flex items-center group px-2 py-1 rounded-md hover:bg-[#00418F]/5"
                            title="Abrir localização no Google Maps"
                          >
                            <span className="mr-2">Ver no mapa</span>
                            <ArrowTopRightOnSquareIcon className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                          </button>
                        ) : (
                          <p className="text-sm text-gray-500 italic opacity-75">
                            {log.location && log.location.status ? log.location.status : 'Localização não disponível'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginação */}
        {!loading && !error && filteredLogs.length > 0 && (
          <div className="px-8 py-6 flex flex-col sm:flex-row items-center justify-between border-t border-[#00418F]/10 bg-gradient-to-r from-[#00418F]/10 to-transparent">
            <div className="text-sm text-[#00418F]/70 mb-4 sm:mb-0 font-medium">
              Mostrando <span className="text-[#00418F] font-semibold">{indexOfFirstLog + 1}</span> a <span className="text-[#00418F] font-semibold">
                {Math.min(indexOfLastLog, filteredLogs.length)}
              </span> de <span className="text-[#00418F] font-semibold">{filteredLogs.length}</span> logs
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button p-3 rounded-xl flex items-center justify-center text-[#00418F] hover:bg-[#00418F]/10"
                title="Página anterior"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00418F] to-[#0066FF] text-white font-semibold shadow-lg">
                  {currentPage}
                </span>
                <span className="text-[#00418F]/50 font-medium">de</span>
                <span className="px-3 py-2 rounded-lg bg-[#00418F]/10 text-[#00418F] font-semibold">
                  {totalPages}
                </span>
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-button p-3 rounded-xl flex items-center justify-center text-[#00418F] hover:bg-[#00418F]/10"
                title="Próxima página"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsManagement;