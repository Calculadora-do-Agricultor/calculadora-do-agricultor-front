import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { db } from "@/services/firebaseConfig";
import { AuthContext } from "@/context/AuthContext";
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
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import MetricCard from "@/components/MetricCard";
import LogCard from "@/components/LogCard";
import EmptyState from "@/components/ui/EmptyState";
import "./LogsManagement.css";

// Constantes para tooltips das métricas
const METRIC_TOOLTIPS = {
  totalLogs: "Total de registros de atividades no sistema",
  withLocation: "Registros que contêm informações de localização",
  withoutLocation: "Registros sem informações de localização",
  uniqueUsers: "Número de usuários únicos que geraram registros",
  uniqueIps: "Número de endereços IP únicos registrados",
};

const LogsManagement = () => {
  const [logs, setLogs] = useState([]);
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

  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const logsPerPage = 10;

  // Título e descrição da página
  const pageTitle = "Histórico de Atividades";
  const pageDescription =
    "Visualize e analise todas as atividades realizadas no sistema, com informações detalhadas sobre cada ação.";

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
        logsData.push({ id: doc.id, ...doc.data() });
      });

      setLogs(logsData);

      // Calcular total de páginas com base nos logs regulares
      updatePagination(logsData);

      setError(null);
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
      setError("Falha ao carregar os logs. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar a paginação com base nos logs regulares
  const updatePagination = (regularLogs) => {
    const totalItems = regularLogs.length;
    setTotalPages(Math.ceil(totalItems / logsPerPage));
    setCurrentPage(1);
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchLogs();
    }
  }, [user, isAdmin]);

  // Filtrar logs com base nos filtros aplicados usando useMemo
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
    // Filtro de localização
    let matchesLocation = true;
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
        log.location &&
        ((log.location.latitude &&
          log.location.latitude.toString().includes(locationFilterLower)) ||
          (log.location.longitude &&
            log.location.longitude.toString().includes(locationFilterLower)) ||
          (log.location.status &&
            log.location.status.toLowerCase().includes(locationFilterLower)));

      matchesLocation = hasLocationMatch;
    }

    // Filtro de usuário
    const matchesUser =
      userFilter === "" ||
      (log.idUser &&
        log.idUser.toLowerCase().includes(userFilter.toLowerCase())) ||
      (log.userId &&
        log.userId.toLowerCase().includes(userFilter.toLowerCase())) ||
      (log.email && log.email.toLowerCase().includes(userFilter.toLowerCase()));

    // Filtro de IP (para ambos os tipos de logs)
    const matchesIp =
      ipFilter === "" ||
      (log.ip && log.ip.toLowerCase().includes(ipFilter.toLowerCase()));

    // Filtro de data
    let matchesDate = true;
    const logTimestamp = log.date;
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
        (field) => field && field.toString().toLowerCase().includes(query),
      );

      // Verifica também nos campos de localização
      if (!matchesSearch && log.location) {
        matchesSearch =
          (log.location.status &&
            log.location.status.toLowerCase().includes(query)) ||
          (log.location.latitude &&
            log.location.latitude.toString().includes(query)) ||
          (log.location.longitude &&
            log.location.longitude.toString().includes(query));
      }
    }

    return (
      matchesLocation &&
      matchesUser &&
      matchesIp &&
      matchesDate &&
      matchesSearch
    );
    });
  }, [logs, filterType, dateFilter, startDate, endDate, userFilter, ipFilter, locationFilter, searchQuery]);

  // Atualizar paginação quando os logs filtrados mudarem
  useEffect(() => {
    const totalItems = filteredLogs.length;
    setTotalPages(Math.ceil(totalItems / logsPerPage));
    setCurrentPage(1);
  }, [filteredLogs, logsPerPage]);

  // Calcular métricas para os cards
  const calculateMetrics = (logsToAnalyze) => {
    const totalLogs = logsToAnalyze.length;

    // Métricas para logs regulares
    const logsWithLocation = logsToAnalyze.filter(
      (log) => log.location && log.location.latitude && log.location.longitude,
    ).length;

    const logsWithoutLocation = logsToAnalyze.filter(
      (log) =>
        !log.location || !log.location.latitude || !log.location.longitude,
    ).length;

    // Métricas para todos os logs
    const uniqueUsers = new Set(
      logsToAnalyze
        .filter((log) => log.idUser || log.userId)
        .map((log) => log.idUser || log.userId),
    ).size;

    // Métricas de IPs únicos
    const uniqueIPs = new Set(
      logsToAnalyze
        .filter((log) => log.ip && log.ip !== "IP não disponível")
        .map((log) => log.ip),
    ).size;

    return {
      totalLogs,
      logsWithLocation,
      logsWithoutLocation,
      uniqueUsers,
      uniqueIPs,
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
        alert("Não há logs para exportar com os filtros atuais.");
        setIsExporting(false);
        return;
      }

      // Criar cabeçalhos do CSV
      let csvContent = "";
      const headers = [
        "ID",
        "Data/Hora",
        "Usuário",
        "Descrição",
        "IP",
        "Latitude",
        "Longitude",
        "Status Localização",
      ];

      // Adicionar cabeçalhos ao CSV
      csvContent += headers.join(",") + "\n";

      // Adicionar dados de cada log
      logsToExport.forEach((log) => {
        const row = [];

        // Campos dos logs regulares
        row.push(`"${log.id || ""}"`);
        row.push(`"${log.date ? formatDate(log.date) : "Data indisponível"}"`);
        row.push(`"${log.idUser || log.email || "Usuário desconhecido"}"`);
        row.push(`"${log.description || ""}"`);
        row.push(`"${log.ip || "IP não disponível"}"`);
        row.push(`"${log.location?.latitude || ""}"`);
        row.push(`"${log.location?.longitude || ""}"`);
        row.push(`"${log.location?.status || ""}"`);

        csvContent += row.join(",") + "\n";
      });

      // Criar um blob e link para download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      // Configurar e simular clique no link
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `logs_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
    } catch (error) {
      console.error("Erro ao exportar logs:", error);
      alert("Ocorreu um erro ao exportar os logs. Por favor, tente novamente.");
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
    else if (userAgent.includes("MSIE") || userAgent.includes("Trident"))
      browser = "Internet Explorer";

    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac OS")) os = "macOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (
      userAgent.includes("iOS") ||
      userAgent.includes("iPhone") ||
      userAgent.includes("iPad")
    )
      os = "iOS";

    return `${browser} em ${os}`;
  };

  if (!user || !isAdmin) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <ExclamationCircleIcon className="w-6 h-6 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="logs-container flex min-h-screen flex-col items-center justify-start bg-gradient-to-br from-[#00418F]/5 via-white to-[#FFEE00]/5 p-4 md:p-8">
      <div className="w-full max-w-7xl transform overflow-hidden rounded-2xl border border-[#00418F]/10 bg-white/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
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

        {/* Menu Superior com Alternância de Visão */}
        <div className="border-b border-[#00418F]/10 bg-gradient-to-r from-[#00418F]/5 to-transparent p-6">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <button
                className={`flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all duration-200 ${
                  !showFilteredMetrics
                    ? "bg-[#00418F] text-white"
                    : "bg-[#00418F]/10 text-[#00418F]"
                }`}
                onClick={() => setShowFilteredMetrics(false)}
              >
                <ChartBarIcon className="h-5 w-5" />
                Visão Geral
              </button>
              <button
                className={`flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all duration-200 ${
                  showFilteredMetrics
                    ? "bg-[#00418F] text-white"
                    : "bg-[#00418F]/10 text-[#00418F]"
                }`}
                onClick={() => setShowFilteredMetrics(true)}
              >
                <FunnelIcon className="h-5 w-5" />
                Dados Filtrados
              </button>
            </div>
            <div className="flex items-center gap-2">
              <InformationCircleIcon className="h-5 w-5 text-[#00418F]/70" />
              <span className="text-sm text-[#00418F]/70">
                {showFilteredMetrics
                  ? "Exibindo métricas dos dados filtrados"
                  : "Exibindo métricas de todos os registros"}
              </span>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 auto-rows-fr">
            <div className="flex-1 min-w-[200px]">
              <MetricCard
                title="Total de Logs"
                value={metrics.totalLogs}
                icon={DocumentTextIcon}
                tooltip={METRIC_TOOLTIPS.totalLogs}
                className="h-full transform bg-gradient-to-br from-blue-50 via-blue-100/30 to-blue-50 border-blue-200/50 shadow-lg hover:scale-105 transition-all duration-300"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <MetricCard
                title="Com Localização"
                value={metrics.logsWithLocation}
                icon={GlobeAltIcon}
                tooltip={METRIC_TOOLTIPS.withLocation}
                className="h-full transform bg-gradient-to-br from-emerald-50 via-emerald-100/30 to-emerald-50 border-emerald-200/50 shadow-lg hover:scale-105 transition-all duration-300"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <MetricCard
                title="Sem Localização"
                value={metrics.logsWithoutLocation}
                icon={ExclamationTriangleIcon}
                tooltip={METRIC_TOOLTIPS.withoutLocation}
                className="h-full transform bg-gradient-to-br from-amber-50 via-amber-100/30 to-amber-50 border-amber-200/50 shadow-lg hover:scale-105 transition-all duration-300"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <MetricCard
                title="Usuários Únicos"
                value={metrics.uniqueUsers}
                icon={UsersIcon}
                tooltip={METRIC_TOOLTIPS.uniqueUsers}
                className="h-full transform bg-gradient-to-br from-violet-50 via-violet-100/30 to-violet-50 border-violet-200/50 shadow-lg hover:scale-105 transition-all duration-300"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <MetricCard
                title="IPs Únicos"
                value={metrics.uniqueIPs}
                icon={ServerIcon}
                tooltip={METRIC_TOOLTIPS.uniqueIps}
                className="h-full transform bg-gradient-to-br from-indigo-50 via-indigo-100/30 to-indigo-50 border-indigo-200/50 shadow-lg hover:scale-105 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Barra de busca global e botão de exportação */}
        <div className="border-b border-[#00418F]/10 bg-gradient-to-r from-[#00418F]/5 to-transparent p-6">
          <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Busca global */}
            <div className="relative w-full md:w-2/3">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
                <MagnifyingGlassIcon className="h-5 w-5 text-[#00418F]/70" />
              </div>
              <label htmlFor="search-logs" className="sr-only">
                Buscar em todos os campos dos logs
              </label>
              <input
                id="search-logs"
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
              className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium shadow-lg transition-all duration-200 ${
                isExporting || filteredLogs.length === 0
                  ? "cursor-not-allowed bg-gray-300 text-gray-500"
                  : "bg-[#00418F] text-white hover:scale-105 hover:bg-[#00418F]/90"
              }`}
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              {isExporting ? "Exportando..." : "Exportar CSV"}
            </button>
          </div>

          {/* Seção de Filtros */}
          <div className="mt-8 rounded-xl bg-white/50 p-6 shadow-lg backdrop-blur-sm border border-[#00418F]/10">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#00418F]/10 p-2">
                  <FunnelIcon className="h-6 w-6 text-[#00418F]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#00418F]">
                    Filtros de Pesquisa
                  </h3>
                  <p className="text-sm text-[#00418F]/70">
                    Refine sua busca usando os filtros abaixo
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFilterType("all");
                  setDateFilter("all");
                  setUserFilter("");
                  setIpFilter("");
                  setLocationFilter("");
                  setStartDate("");
                  setEndDate("");
                }}
                className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100 hover:scale-105 shadow-sm"
              >
                <ExclamationCircleIcon className="h-4 w-4" />
                Limpar Filtros
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Filtro de usuário */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#00418F]/70">
                  Usuário
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
                    <UserIcon className="h-5 w-5 text-[#00418F]/70" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por usuário..."
                    className="w-full rounded-xl border border-[#00418F]/20 bg-white/80 py-3 pr-4 pl-12 text-gray-700 placeholder-[#00418F]/60 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-[#00418F]/30 focus:border-[#00418F] focus:ring-[#00418F]/20"
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Filtro de IP */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#00418F]/70">
                  Endereço IP
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
                    <ServerIcon className="h-5 w-5 text-[#00418F]/70" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por IP..."
                    className="w-full rounded-xl border border-[#00418F]/20 bg-white/80 py-3 pr-4 pl-12 text-gray-700 placeholder-[#00418F]/60 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-[#00418F]/30 focus:border-[#00418F] focus:ring-[#00418F]/20"
                    value={ipFilter}
                    onChange={(e) => setIpFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Filtro de localização */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#00418F]/70">
                  Localização
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
                    <MapPinIcon className="h-5 w-5 text-[#00418F]/70" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por localização..."
                    className="w-full rounded-xl border border-[#00418F]/20 bg-white/80 py-3 pr-4 pl-12 text-gray-700 placeholder-[#00418F]/60 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-[#00418F]/30 focus:border-[#00418F] focus:ring-[#00418F]/20"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Filtro de Data */}
            <div className="mt-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#00418F]/70">
                  Período
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setDateFilter("all")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      dateFilter === "all"
                        ? "bg-[#00418F] text-white"
                        : "bg-[#00418F]/10 text-[#00418F] hover:bg-[#00418F]/20"
                    }`}
                  >
                    Todas as datas
                  </button>
                  <button
                    onClick={() => setDateFilter("today")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      dateFilter === "today"
                        ? "bg-[#00418F] text-white"
                        : "bg-[#00418F]/10 text-[#00418F] hover:bg-[#00418F]/20"
                    }`}
                  >
                    Hoje
                  </button>
                  <button
                    onClick={() => setDateFilter("yesterday")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      dateFilter === "yesterday"
                        ? "bg-[#00418F] text-white"
                        : "bg-[#00418F]/10 text-[#00418F] hover:bg-[#00418F]/20"
                    }`}
                  >
                    Ontem
                  </button>
                  <button
                    onClick={() => setDateFilter("last-week")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      dateFilter === "last-week"
                        ? "bg-[#00418F] text-white"
                        : "bg-[#00418F]/10 text-[#00418F] hover:bg-[#00418F]/20"
                    }`}
                  >
                    Última semana
                  </button>
                  <button
                    onClick={() => setDateFilter("last-month")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      dateFilter === "last-month"
                        ? "bg-[#00418F] text-white"
                        : "bg-[#00418F]/10 text-[#00418F] hover:bg-[#00418F]/20"
                    }`}
                  >
                    Último mês
                  </button>
                  <button
                    onClick={() => setDateFilter("custom")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      dateFilter === "custom"
                        ? "bg-[#00418F] text-white"
                        : "bg-[#00418F]/10 text-[#00418F] hover:bg-[#00418F]/20"
                    }`}
                  >
                    Personalizado
                  </button>
                </div>
              </div>
            </div>

            {/* Filtros de data personalizada */}
            {dateFilter === "custom" && (
              <div className="mt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#00418F]/70">
                      Data Inicial
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
                        <CalendarDaysIcon className="h-5 w-5 text-[#00418F]/70" />
                      </div>
                      <input
                        type="date"
                        className="w-full rounded-xl border border-[#00418F]/20 bg-white/80 py-3 pr-4 pl-12 text-gray-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-[#00418F]/30 focus:border-[#00418F] focus:ring-[#00418F]/20"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#00418F]/70">
                      Data Final
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
                        <CalendarDaysIcon className="h-5 w-5 text-[#00418F]/70" />
                      </div>
                      <input
                        type="date"
                        className="w-full rounded-xl border border-[#00418F]/20 bg-white/80 py-3 pr-4 pl-12 text-gray-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-[#00418F]/30 focus:border-[#00418F] focus:ring-[#00418F]/20"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conteúdo principal - Cards de logs */}
            <div className="overflow-x-auto bg-white/70 backdrop-blur-sm mt-8">
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
              ) : (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#00418F]">
                      Registros de Atividade
                    </h3>
                    <div className="text-sm text-[#00418F]/70">
                      {filteredLogs.length} {filteredLogs.length === 1 ? 'registro encontrado' : 'registros encontrados'}
                    </div>
                  </div>

                  {/* Grid de Logs */}
                  <div className="space-y-4">
                {currentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="transform rounded-xl border border-[#00418F]/10 bg-white p-4 transition-all duration-300 hover:border-[#00418F]/40"
                  >
                    <LogCard log={log} onLocationClick={openInMaps} formatDate={formatDate} />
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {filteredLogs.length > 0 && (
                <div className="mt-6 flex items-center justify-between border-t border-[#00418F]/10 pt-4">
                  <div className="text-sm text-[#00418F]/70">
                    Mostrando {indexOfFirstLog + 1} - {Math.min(indexOfLastLog, filteredLogs.length)} de {filteredLogs.length}
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-1 rounded-full bg-[#00418F]/10 p-2 text-[#00418F] transition-all hover:bg-[#00418F]/20 disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                      Anterior
                    </button>
                    <span className="text-sm font-medium text-[#00418F]">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-1 rounded-full bg-[#00418F]/10 p-2 text-[#00418F] transition-all hover:bg-[#00418F]/20 disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      Próxima
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

                  {/* Estado vazio */}
                  {filteredLogs.length === 0 && (
                    <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-[#00418F]/10 bg-white/50 p-8 text-center">
                      <ExclamationCircleIcon className="h-12 w-12 text-[#00418F]/30" />
                      <h3 className="mt-4 text-lg font-medium text-[#00418F]">
                        Nenhum registro encontrado
                      </h3>
                      <p className="mt-2 text-sm text-[#00418F]/70">
                        Tente ajustar os filtros para encontrar o que procura
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Indicador de filtros ativos */}
            {(filterType !== "all" ||
              dateFilter !== "all" ||
              userFilter ||
              ipFilter ||
              locationFilter) && (
              <div className="mt-6 rounded-xl border border-[#00418F]/10 bg-white/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <FunnelIcon className="h-5 w-5 text-[#00418F]/70" />
                  <span className="text-sm font-medium text-[#00418F]/70">Filtros ativos</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterType !== "all" && (
                    <span className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 shadow-sm">
                      <MapPinIcon className="h-4 w-4" />
                      {filterType === "with-location" ? "Com Localização" : "Sem Localização"}
                    </span>
                  )}
                  {dateFilter !== "all" && (
                    <span className="flex items-center gap-1 rounded-lg bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700 shadow-sm">
                      <CalendarDaysIcon className="h-4 w-4" />
                      {dateFilter === "today"
                        ? "Hoje"
                        : dateFilter === "yesterday"
                        ? "Ontem"
                        : dateFilter === "last-week"
                        ? "Última Semana"
                        : dateFilter === "last-month"
                        ? "Último Mês"
                        : "Período Personalizado"}
                    </span>
                  )}
                  {userFilter && (
                    <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 shadow-sm">
                      <UserIcon className="h-4 w-4" />
                      Usuário: {userFilter}
                    </span>
                  )}
                  {ipFilter && (
                    <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 shadow-sm">
                      <ServerIcon className="h-4 w-4" />
                      IP: {ipFilter}
                    </span>
                  )}
                  {locationFilter && (
                    <span className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm">
                      <MapPinIcon className="h-4 w-4" />
                      Localização: {locationFilter}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>


        </div>
      </div>
    </div>
  );
};

export default LogsManagement;