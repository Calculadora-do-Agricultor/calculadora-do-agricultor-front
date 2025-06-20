import React, { useState, useEffect, useContext } from "react";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { AuthContext } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import {
  ClockIcon,
  UserIcon,
  MapPinIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  ArrowTopRightOnSquareIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ServerIcon,
  ComputerDesktopIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { MetricCard, LogCard, MetricsToggle } from "@/components";
import AccessLogCard from "../../components/LogCard/AccessLogCard";
import "./LogsManagement.css";

const LogsManagement = () => {
  const [logs, setLogs] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [ipFilter, setIpFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showFilteredMetrics, setShowFilteredMetrics] = useState(false);
  const [logType, setLogType] = useState("all"); // 'all', 'regular', 'access'
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const logsPerPage = 10;

  const { user, isAdmin } = useContext(AuthContext);

  // Função para formatar a data
  const formatDate = (timestamp) => {
    if (!timestamp) return "Data indisponível";

    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  // Função para abrir a localização em um serviço de mapas
  const openInMaps = (latitude, longitude) => {
    // Opções de serviços de mapas
    const mapServices = [
      {
        name: "Google Maps",
        url: `https://www.google.com/maps?q=${latitude},${longitude}`,
      },
      {
        name: "Waze",
        url: `https://www.waze.com/ul?ll=${latitude},${longitude}&navigate=yes`,
      },
      {
        name: "Bing Maps",
        url: `https://www.bing.com/maps?cp=${latitude}~${longitude}&lvl=15`,
      },
    ];

    // Abre o Google Maps por padrão
    window.open(mapServices[0].url, "_blank");
  };

  // Função para buscar os logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Buscar logs regulares
      const logsCollectionRef = collection(db, "logs");
      const q = query(logsCollectionRef, orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);

      const logsData = [];
      querySnapshot.forEach((doc) => {
        logsData.push({ id: doc.id, ...doc.data(), logType: 'regular' });
      });

      // Buscar logs de acesso
      const accessLogsCollectionRef = collection(db, "accessLogs");
      const accessQ = query(accessLogsCollectionRef, orderBy("timestamp", "desc"));
      const accessQuerySnapshot = await getDocs(accessQ);

      const accessLogsData = [];
      accessQuerySnapshot.forEach((doc) => {
        accessLogsData.push({ id: doc.id, ...doc.data(), logType: 'access' });
      });

      setLogs(logsData);
      setAccessLogs(accessLogsData);
      
      // Calcular total de páginas com base no tipo de log selecionado
      updatePagination(logsData, accessLogsData, logType);
      
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
      setError("Falha ao carregar os logs. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  
  // Função para atualizar a paginação com base no tipo de log selecionado
  const updatePagination = (regularLogs, accessLogs, selectedLogType) => {
    let totalItems = 0;
    
    if (selectedLogType === 'all') {
      totalItems = regularLogs.length + accessLogs.length;
    } else if (selectedLogType === 'regular') {
      totalItems = regularLogs.length;
    } else if (selectedLogType === 'access') {
      totalItems = accessLogs.length;
    }
    
    setTotalPages(Math.ceil(totalItems / logsPerPage));
    setCurrentPage(1); // Resetar para a primeira página ao mudar o tipo de log
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchLogs();
    }
  }, [user, isAdmin]);
  
  // Atualizar paginação quando o tipo de log mudar
  useEffect(() => {
    if (logs.length > 0 || accessLogs.length > 0) {
      updatePagination(logs, accessLogs, logType);
    }
  }, [logType, logs, accessLogs]);

  // Combinar logs com base no tipo selecionado
  const combinedLogs = () => {
    if (logType === 'all') {
      return [...logs, ...accessLogs];
    } else if (logType === 'regular') {
      return logs;
    } else if (logType === 'access') {
      return accessLogs;
    }
    return [];
  };
  
  // Filtrar logs com base nos filtros aplicados
  const filteredLogs = combinedLogs().filter((log) => {
    // Filtro de localização (apenas para logs regulares)
    let matchesLocation = true;
    if (log.logType === 'regular') {
      if (filterType === "with-location") {
        matchesLocation =
          log.location && log.location.latitude && log.location.longitude;
      } else if (filterType === "without-location") {
        matchesLocation =
          !log.location || !log.location.latitude || !log.location.longitude;
      }
      
      // Filtro de texto de localização
      if (locationFilter && matchesLocation) {
        const locationFilterLower = locationFilter.toLowerCase();
        // Verifica se há alguma informação de localização que corresponda ao filtro
        const hasLocationMatch = 
          (log.location && 
           ((log.location.latitude && log.location.latitude.toString().includes(locationFilterLower)) ||
            (log.location.longitude && log.location.longitude.toString().includes(locationFilterLower)) ||
            (log.location.status && log.location.status.toLowerCase().includes(locationFilterLower))));
        
        matchesLocation = hasLocationMatch;
      }
    }

    // Filtro de usuário
    const matchesUser =
      userFilter === "" ||
      (log.idUser && log.idUser.toLowerCase().includes(userFilter.toLowerCase())) ||
      (log.userId && log.userId.toLowerCase().includes(userFilter.toLowerCase())) ||
      (log.email && log.email.toLowerCase().includes(userFilter.toLowerCase()));
    
    // Filtro de IP (para ambos os tipos de logs)
    const matchesIp =
      ipFilter === "" ||
      (log.ip && log.ip.toLowerCase().includes(ipFilter.toLowerCase()));

    // Filtro de data
    let matchesDate = true;
    const logTimestamp = log.logType === 'access' ? log.timestamp : log.date;
    if (logTimestamp && dateFilter !== "all") {
      const logDate = logTimestamp.toDate();
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      switch (dateFilter) {
        case "today":
          matchesDate = logDate.toDateString() === today.toDateString();
          break;
        case "yesterday":
          matchesDate = logDate.toDateString() === yesterday.toDateString();
          break;
        case "last-week":
          matchesDate = logDate >= lastWeek;
          break;
        case "last-month":
          matchesDate = logDate >= lastMonth;
          break;
        case "custom":
          if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
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

    // Busca global em todos os campos relevantes
    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableFields = [
        log.idUser,
        log.userId,
        log.email,
        log.ip,
        log.description,
        log.page,
        log.action,
        log.userAgent,
      ];
      
      // Verifica se algum dos campos contém a consulta
      matchesSearch = searchableFields.some(
        field => field && field.toString().toLowerCase().includes(query)
      );
      
      // Verifica também nos campos de localização se for um log regular
      if (!matchesSearch && log.logType === 'regular' && log.location) {
        matchesSearch = 
          (log.location.status && log.location.status.toLowerCase().includes(query)) ||
          (log.location.latitude && log.location.latitude.toString().includes(query)) ||
          (log.location.longitude && log.location.longitude.toString().includes(query));
      }
    }
    
    return matchesLocation && matchesUser && matchesIp && matchesDate && matchesSearch;
  });

  // Calcular métricas para os cards
  const calculateMetrics = (logsToAnalyze) => {
    const totalLogs = logsToAnalyze.length;
    
    // Separar logs por tipo
    const regularLogs = logsToAnalyze.filter(log => log.logType === 'regular');
    const accessLogs = logsToAnalyze.filter(log => log.logType === 'access');
    
    // Métricas para logs regulares
    const logsWithLocation = regularLogs.filter(
      (log) => log.location && log.location.latitude && log.location.longitude,
    ).length;

    const logsWithoutLocation = regularLogs.filter(
      (log) =>
        !log.location || !log.location.latitude || !log.location.longitude,
    ).length;

    // Métricas para todos os logs
    const uniqueUsers = new Set(
      logsToAnalyze
        .filter(log => log.idUser || log.userId)
        .map(log => log.idUser || log.userId)
    ).size;

    return {
      totalLogs,
      regularLogsCount: regularLogs.length,
      accessLogsCount: accessLogs.length,
      logsWithLocation,
      logsWithoutLocation,
      uniqueUsers,
    };
  };

  const metrics = calculateMetrics(showFilteredMetrics ? filteredLogs : logs);

  // Paginação
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  // Função para exportar logs em formato CSV
  const exportLogsToCSV = () => {
    try {
      setIsExporting(true);
      
      // Determinar quais logs exportar (filtrados ou todos)
      const logsToExport = filteredLogs;
      
      if (logsToExport.length === 0) {
        alert('Não há logs para exportar com os filtros atuais.');
        setIsExporting(false);
        return;
      }
      
      // Criar cabeçalhos do CSV com base no tipo de log
      let csvContent = '';
      const commonHeaders = ['ID', 'Data/Hora', 'Usuário'];
      
      // Adicionar cabeçalhos específicos com base nos tipos de logs presentes
      const hasRegularLogs = logsToExport.some(log => log.logType === 'regular');
      const hasAccessLogs = logsToExport.some(log => log.logType === 'access');
      
      let headers = [...commonHeaders];
      
      if (hasRegularLogs) {
        headers.push('Descrição', 'Latitude', 'Longitude', 'Status Localização');
      }
      
      if (hasAccessLogs) {
        headers.push('IP', 'Página', 'Ação', 'Navegador');
      }
      
      // Adicionar cabeçalhos ao CSV
      csvContent += headers.join(',') + '\n';
      
      // Adicionar dados de cada log
      logsToExport.forEach(log => {
        const row = [];
        
        // Campos comuns
        row.push(`"${log.id || ''}"`);
        
        // Data formatada
        const timestamp = log.logType === 'access' ? log.timestamp : log.date;
        row.push(`"${timestamp ? formatDate(timestamp) : 'Data indisponível'}"`);
        
        // Usuário (pode estar em campos diferentes dependendo do tipo de log)
        const userId = log.idUser || log.userId || log.email || 'Usuário desconhecido';
        row.push(`"${userId}"`);
        
        // Campos específicos para logs regulares
        if (log.logType === 'regular') {
          row.push(`"${log.description || ''}"`);
          row.push(`"${log.location?.latitude || ''}"`);
          row.push(`"${log.location?.longitude || ''}"`);
          row.push(`"${log.location?.status || ''}"`);
          
          // Preencher com valores vazios para colunas de logs de acesso
          if (hasAccessLogs) {
            row.push('""', '""', '""', '""');
          }
        }
        
        // Campos específicos para logs de acesso
        if (log.logType === 'access') {
          // Preencher com valores vazios para colunas de logs regulares
          if (hasRegularLogs) {
            row.push('""', '""', '""', '""');
          }
          
          row.push(`"${log.ip || ''}"`);
          row.push(`"${log.page || ''}"`);
          row.push(`"${log.action || ''}"`);
          
          // Extrair informações básicas do user agent
          const userAgentInfo = log.userAgent ? formatUserAgent(log.userAgent) : 'Desconhecido';
          row.push(`"${userAgentInfo}"`);
        }
        
        csvContent += row.join(',') + '\n';
      });
      
      // Criar um blob e link para download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Configurar e simular clique no link
      link.setAttribute('href', url);
      link.setAttribute('download', `logs_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExporting(false);
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
      alert('Ocorreu um erro ao exportar os logs. Por favor, tente novamente.');
      setIsExporting(false);
    }
  };
  
  // Função para formatar o agente do usuário de forma mais legível (para exportação)
  const formatUserAgent = (userAgent) => {
    if (!userAgent) return "Desconhecido";
    
    // Extrair informações básicas do user agent
    let browser = "Desconhecido";
    let os = "Desconhecido";
    
    if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";
    else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) browser = "Internet Explorer";
    
    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac OS")) os = "macOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";
    
    return `${browser} em ${os}`;
  };

  // Verificar se o usuário é administrador
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="logs-container flex min-h-screen flex-col items-center justify-start bg-gradient-to-br from-[#00418F]/5 via-white to-[#FFEE00]/5 p-4 md:p-8">
      <div className="w-full max-w-6xl transform overflow-hidden rounded-2xl border border-[#00418F]/10 bg-white/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
        {/* Cabeçalho */}
        <div className="border-b border-[#00418F]/10 bg-gradient-to-r from-[#00418F]/20 to-[#00418F]/10 p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <ShieldCheckIcon className="mr-4 h-10 w-10 text-[#00418F]" />
              <div>
                <h1 className="bg-gradient-to-r from-[#00418F] to-[#0066FF] bg-clip-text text-3xl font-bold text-transparent">
                  Gerenciamento de Logs
                </h1>
                <p className="mt-1 text-[#00418F]/70">
                  Visualize e gerencie os logs de atividades dos usuários
                </p>
              </div>
            </div>
            <button
              onClick={fetchLogs}
              className="group flex transform items-center justify-center rounded-xl bg-[#00418F] p-3 text-white shadow-lg transition-all duration-150 hover:scale-105 hover:bg-[#00418F]/90 hover:shadow-xl"
              title="Atualizar logs"
            >
              <ArrowPathIcon className="h-6 w-6 transition-transform duration-500 group-hover:rotate-180" />
              <span className="ml-2 font-medium">Atualizar</span>
            </button>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="border-b border-[#00418F]/10 bg-gradient-to-r from-[#00418F]/5 to-transparent p-6">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-lg font-semibold text-[#00418F]">
              Métricas Gerais
            </h2>
            <MetricsToggle
              showFilteredMetrics={showFilteredMetrics}
              onToggle={() => setShowFilteredMetrics(!showFilteredMetrics)}
            />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard
              title="Total de Logs"
              value={metrics.totalLogs}
              icon={DocumentTextIcon}
            />
            <MetricCard
              title="Logs Regulares"
              value={metrics.regularLogsCount}
              icon={ChartBarIcon}
            />
            <MetricCard
              title="Logs de Acesso"
              value={metrics.accessLogsCount}
              icon={ComputerDesktopIcon}
            />
            <MetricCard
              title="Com Localização"
              value={metrics.logsWithLocation}
              icon={GlobeAltIcon}
            />
            <MetricCard
              title="Usuários Únicos"
              value={metrics.uniqueUsers}
              icon={UsersIcon}
            />
          </div>
        </div>

        {/* Barra de busca global e botão de exportação */}
        <div className="border-b border-[#00418F]/10 bg-gradient-to-r from-[#00418F]/5 to-transparent p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            {/* Busca global */}
            <div className="relative w-full md:w-2/3">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
                <MagnifyingGlassIcon className="h-5 w-5 text-[#00418F]/70" />
              </div>
              <input
                type="text"
                placeholder="Buscar em todos os campos..."
                className="w-full rounded-xl border border-[#00418F]/20 bg-white/80 py-3 pr-4 pl-12 text-gray-700 placeholder-[#00418F]/60 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-[#00418F]/30 focus:border-[#00418F] focus:ring-[#00418F]/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Botão de exportação */}
            <button
              onClick={exportLogsToCSV}
              disabled={isExporting || filteredLogs.length === 0}
              className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium shadow-lg transition-all duration-200 ${isExporting || filteredLogs.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#00418F] text-white hover:bg-[#00418F]/90 hover:scale-105'}`}
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              {isExporting ? 'Exportando...' : 'Exportar CSV'}
            </button>
          </div>
          
          {/* Filtros avançados */}
          <div className="mb-4 flex items-center">
            <FunnelIcon className="mr-2 h-5 w-5 text-[#00418F]/70" />
            <h3 className="text-md font-semibold text-[#00418F]">Filtros Avançados</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Filtro de usuário */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
                <UserIcon className="h-5 w-5 text-[#00418F]/70" />
              </div>
              <input
                type="text"
                placeholder="Filtrar por usuário..."
                className="w-full rounded-xl border border-[#00418F]/20 bg-white/80 py-3 pr-4 pl-12 text-gray-700 placeholder-[#00418F]/60 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-[#00418F]/30 focus:border-[#00418F] focus:ring-[#00418F]/20"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              />
            </div>

            {/* Filtro de IP */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
                <ServerIcon className="h-5 w-5 text-[#00418F]/70" />
              </div>
              <input
                type="text"
                placeholder="Filtrar por IP..."
                className="w-full rounded-xl border border-[#00418F]/20 bg-white/80 py-3 pr-4 pl-12 text-gray-700 placeholder-[#00418F]/60 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-[#00418F]/30 focus:border-[#00418F] focus:ring-[#00418F]/20"
                value={ipFilter}
                onChange={(e) => setIpFilter(e.target.value)}
              />
            </div>
            
            {/* Filtro de localização */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
                <MapPinIcon className="h-5 w-5 text-[#00418F]/70" />
              </div>
              <input
                type="text"
                placeholder="Filtrar por localização..."
                className="w-full rounded-xl border border-[#00418F]/20 bg-white/80 py-3 pr-4 pl-12 text-gray-700 placeholder-[#00418F]/60 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-[#00418F]/30 focus:border-[#00418F] focus:ring-[#00418F]/20"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Filtro de data */}
            <select
              className="cursor-pointer rounded-xl border border-[#00418F]/20 bg-white/80 pl-4 pr-12 py-3 font-medium text-[#00418F] shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-[#00418F]/30 focus:border-[#00418F] focus:ring-[#00418F]/20 appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2300418F'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.25em 1.25em'
              }}
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

            {/* Filtro de tipo de log */}
            <select
              className="cursor-pointer rounded-xl border border-[#00418F]/20 bg-white/80 pl-4 pr-12 py-3 font-medium text-[#00418F] shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-[#00418F]/30 focus:border-[#00418F] focus:ring-2 focus:ring-[#00418F]/20 appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2300418F'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.25em 1.25em'
              }}
              value={logType}
              onChange={(e) => setLogType(e.target.value)}
            >
              <option value="all">Todos os tipos de logs</option>
              <option value="regular">Logs regulares</option>
              <option value="access">Logs de acesso</option>
            </select>
          </div>

          {/* Filtros de data personalizada */}
          {dateFilter === "custom" && (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                type="date"
                placeholder="Data inicial"
                className="cursor-pointer rounded-xl border border-[#00418F]/20 bg-white/80 px-4 py-3 text-[#00418F] shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-[#00418F]/30 focus:border-[#00418F] focus:ring-2 focus:ring-[#00418F]/20"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                placeholder="Data final"
                className="cursor-pointer rounded-xl border border-[#00418F]/20 bg-white/80 px-4 py-3 text-[#00418F] shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-[#00418F]/30 focus:border-[#00418F] focus:ring-2 focus:ring-[#00418F]/20"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}

          {/* Indicador de filtros ativos */}
          {(filterType !== "all" || dateFilter !== "all" || userFilter || logType !== "all") && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#00418F]/10 pt-4">
              <span className="text-sm font-medium text-[#00418F]/70">
                Filtros ativos:
              </span>
              {filterType !== "all" && (
                <span className="rounded-full bg-[#00418F]/10 px-3 py-1 text-sm font-medium text-[#00418F]">
                  {filterType === "with-location"
                    ? "Com localização"
                    : "Sem localização"}
                </span>
              )}
              {logType !== "all" && (
                <span className="rounded-full bg-[#00418F]/10 px-3 py-1 text-sm font-medium text-[#00418F]">
                  {logType === "regular"
                    ? "Logs regulares"
                    : "Logs de acesso"}
                </span>
              )}
              {userFilter && (
                <span className="rounded-full bg-[#00418F]/10 px-3 py-1 text-sm font-medium text-[#00418F]">
                  Usuário: "{userFilter}"
                </span>
              )}
              {dateFilter !== "all" && (
                <span className="rounded-full bg-[#00418F]/10 px-3 py-1 text-sm font-medium text-[#00418F]">
                  {dateFilter === "today" && "Hoje"}
                  {dateFilter === "yesterday" && "Ontem"}
                  {dateFilter === "last-week" && "Última semana"}
                  {dateFilter === "last-month" && "Último mês"}
                  {dateFilter === "custom" && "Período personalizado"}
                </span>
              )}
              <button
                onClick={() => {
                  setFilterType("all");
                  setDateFilter("all");
                  setUserFilter("");
                  setStartDate("");
                  setEndDate("");
                  setLogType("all");
                }}
                className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-200"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Conteúdo principal - Cards de logs */}
        <div className="overflow-x-auto bg-white/70 backdrop-blur-sm">
          {loading ? (
            <div className="loading-state flex flex-col items-center justify-center space-y-4 p-16">
              <div className="spinner"></div>
              <p className="font-medium text-[#00418F]/70">
                Carregando logs...
              </p>
            </div>
          ) : error ? (
            <div className="error-state m-4 flex items-center justify-center rounded-xl border border-red-100 bg-red-50/50 p-12 text-red-600 backdrop-blur-sm">
              <ExclamationCircleIcon className="icon-animated mr-3 h-8 w-8" />
              <span className="text-lg font-medium">{error}</span>
            </div>
          ) : currentLogs.length === 0 ? (
            <div className="empty-state m-4 flex flex-col items-center justify-center rounded-xl bg-[#00418F]/5 p-16 text-[#00418F]/70">
              <DocumentTextIcon className="icon-animated mb-4 h-20 w-20" />
              <p className="text-xl font-medium">Nenhum log encontrado</p>
              <p className="mt-2 text-sm opacity-80">
                Não há logs que correspondam aos critérios de pesquisa.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-4">
              {currentLogs.map((log) => (
              <div key={log.id} className="mb-4">
                {log.logType === 'access' ? (
                  <AccessLogCard
                    log={log}
                    formatDate={formatDate}
                  />
                ) : (
                  <LogCard
                    log={log}
                    formatDate={formatDate}
                    openInMaps={openInMaps}
                  />
                )}
              </div>
            ))}
            </div>
          )}
        </div>

        {/* Paginação */}
        {!loading && !error && filteredLogs.length > 0 && (
          <div className="flex flex-col items-center justify-between border-t border-[#00418F]/10 bg-gradient-to-r from-[#00418F]/10 to-transparent px-8 py-6 sm:flex-row">
            <div className="mb-4 text-sm font-medium text-[#00418F]/70 sm:mb-0">
              Mostrando{" "}
              <span className="font-semibold text-[#00418F]">
                {indexOfFirstLog + 1}
              </span>{" "}
              a{" "}
              <span className="font-semibold text-[#00418F]">
                {Math.min(indexOfLastLog, filteredLogs.length)}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-[#00418F]">
                {filteredLogs.length}
              </span>{" "}
              logs
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button flex items-center justify-center rounded-xl p-3 text-[#00418F] hover:bg-[#00418F]/10"
                title="Página anterior"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-2">
                <span className="rounded-xl bg-gradient-to-r from-[#00418F] to-[#0066FF] px-4 py-2 font-semibold text-white shadow-lg">
                  {currentPage}
                </span>
                <span className="font-medium text-[#00418F]/50">de</span>
                <span className="rounded-lg bg-[#00418F]/10 px-3 py-2 font-semibold text-[#00418F]">
                  {totalPages}
                </span>
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="pagination-button flex items-center justify-center rounded-xl p-3 text-[#00418F] hover:bg-[#00418F]/10"
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
