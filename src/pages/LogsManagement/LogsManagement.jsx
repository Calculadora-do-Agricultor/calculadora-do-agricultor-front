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

  // Filtrar logs com base no termo de pesquisa e tipo de filtro
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      (log.description && log.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.idUser && log.idUser.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'with-location') {
      return matchesSearch && log.location && 
        log.location.latitude && log.location.longitude;
    }
    if (filterType === 'without-location') {
      return matchesSearch && (!log.location || 
        !log.location.latitude || !log.location.longitude);
    }
    
    return matchesSearch;
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
              className="p-3 bg-[#00418F] text-white rounded-xl hover:bg-[#00418F]/90 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 group"
              title="Atualizar logs"
            >
              <ArrowPathIcon className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
              <span className="ml-2 font-medium">Atualizar</span>
            </button>
          </div>
        </div>

        {/* Filtros e pesquisa */}
        <div className="p-6 border-b border-[#00418F]/10 bg-gradient-to-r from-[#00418F]/5 to-transparent">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-[#00418F]/50" />
              </div>
              <input
                type="text"
                placeholder="Pesquisar logs..."
                className="pl-12 pr-4 py-3 w-full rounded-xl border border-[#00418F]/20 focus:border-[#00418F] focus:ring-2 focus:ring-[#00418F]/20 transition-all duration-300 shadow-sm bg-white/70 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-3 rounded-xl border border-[#00418F]/20 focus:border-[#00418F] focus:ring-2 focus:ring-[#00418F]/20 transition-all duration-300 bg-white/70 backdrop-blur-sm text-[#00418F] shadow-sm cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos os logs</option>
              <option value="with-location">Com localização</option>
              <option value="without-location">Sem localização</option>
            </select>
          </div>
        </div>

        {/* Conteúdo principal - Tabela de logs */}
        <div className="overflow-x-auto bg-white/70 backdrop-blur-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 space-y-4">
              <div className="spinner"></div>
              <p className="text-[#00418F]/70 animate-pulse">Carregando logs...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-12 text-red-600 bg-red-50/50 backdrop-blur-sm rounded-xl m-4 border border-red-100">
              <ExclamationCircleIcon className="h-8 w-8 mr-3" />
              <span className="text-lg">{error}</span>
            </div>
          ) : currentLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-[#00418F]/70 bg-[#00418F]/5 rounded-xl m-4">
              <DocumentTextIcon className="h-20 w-20 mb-4 animate-bounce" />
              <p className="text-xl font-medium">Nenhum log encontrado</p>
              <p className="text-sm mt-2">Não há logs que correspondam aos critérios de pesquisa.</p>
            </div>
          ) : (
            <div className="grid gap-4 p-4">
              {currentLogs.map((log) => (
                <div key={log.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-[#00418F]/10 hover:border-[#00418F]/20 transform hover:-translate-y-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-3">
                      <ClockIcon className="h-5 w-5 text-[#00418F]/70" />
                      <div>
                        <p className="text-sm text-[#00418F]/70 font-medium">Data</p>
                        <p className="text-sm text-gray-700">{log.date ? formatDate(log.date) : 'Data indisponível'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <UserIcon className="h-5 w-5 text-[#00418F]/70" />
                      <div>
                        <p className="text-sm text-[#00418F]/70 font-medium">Usuário</p>
                        <p className="text-sm text-gray-700">{log.idUser || 'Usuário desconhecido'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <DocumentTextIcon className="h-5 w-5 text-[#00418F]/70" />
                      <div>
                        <p className="text-sm text-[#00418F]/70 font-medium">Descrição</p>
                        <p className="text-sm text-gray-700">{log.description || 'Sem descrição'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="h-5 w-5 text-[#00418F]/70" />
                      <div>
                        <p className="text-sm text-[#00418F]/70 font-medium">Localização</p>
                        {log.location && log.location.latitude && log.location.longitude ? (
                          <button
                            onClick={() => openInMaps(log.location.latitude, log.location.longitude)}
                            className="text-sm text-[#00418F] hover:text-[#00418F]/70 transition-colors duration-200 flex items-center group"
                          >
                            Ver no mapa
                            <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                          </button>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
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
              Mostrando <span className="text-[#00418F]">{indexOfFirstLog + 1}</span> a <span className="text-[#00418F]">
                {Math.min(indexOfLastLog, filteredLogs.length)}
              </span> de <span className="text-[#00418F]">{filteredLogs.length}</span> logs
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-xl flex items-center justify-center ${currentPage === 1 ? 'text-[#00418F]/30 cursor-not-allowed' : 'text-[#00418F] hover:bg-[#00418F]/10 hover:shadow-md'} transition-all duration-200 transform hover:scale-105`}
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
              
              <span className="px-4 py-2 rounded-xl bg-[#00418F] text-white font-medium shadow-md">
                {currentPage}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-xl flex items-center justify-center ${currentPage === totalPages ? 'text-[#00418F]/30 cursor-not-allowed' : 'text-[#00418F] hover:bg-[#00418F]/10 hover:shadow-md'} transition-all duration-200 transform hover:scale-105`}
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsManagement;