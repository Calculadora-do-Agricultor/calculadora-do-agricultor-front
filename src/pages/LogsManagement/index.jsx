import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  startAfter,
  endBefore,
} from "firebase/firestore";
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
  ShieldCheckIcon,
  ChartBarIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ServerIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import MetricCard from "../../components/MetricCard";
import LogCard from "../../components/LogCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import "./LogsManagement.css";

// Constantes
const LOGS_PER_PAGE = 10;
const METRIC_TOOLTIPS = {
  totalLogs: "Total de registros de atividades no sistema",
  withLocation: "Registros que contêm informações de localização",
  withoutLocation: "Registros sem informações de localização",
  uniqueUsers: "Número de usuários únicos que geraram registros",
  uniqueIps: "Número de endereços IP únicos registrados",
};

const LogsManagement = () => {
  // Estados principais
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [firstVisible, setFirstVisible] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);

  // Estados de filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [ipFilter, setIpFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilteredMetrics, setShowFilteredMetrics] = useState(false);

  // Estados de UI
  const [isExporting, setIsExporting] = useState(false);

  const { user, isAdmin } = useContext(AuthContext);

  // Função para formatar data
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

  // Função para abrir localização no mapa
  const openInMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  // Função para buscar logs
  const fetchLogs = async (page = 1, direction = "next") => {
    setLoading(true);
    try {
      const logsCollectionRef = collection(db, "logs");
      let q = query(
        logsCollectionRef,
        orderBy("date", "desc"),
        limit(LOGS_PER_PAGE)
      );

      if (page > 1 && direction === "next" && lastVisible) {
        q = query(
          logsCollectionRef,
          orderBy("date", "desc"),
          startAfter(lastVisible),
          limit(LOGS_PER_PAGE)
        );
      } else if (direction === "prev" && firstVisible) {
        q = query(
          logsCollectionRef,
          orderBy("date", "desc"),
          endBefore(firstVisible),
          limit(LOGS_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(q);
      const logsData = [];
      querySnapshot.forEach((doc) => {
        logsData.push({ id: doc.id, ...doc.data() });
      });

      if (logsData.length > 0) {
        setFirstVisible(querySnapshot.docs[0]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }

      setLogs(logsData);
      
      // Calcular total de páginas (aproximação)
      const totalSnapshot = await getDocs(query(logsCollectionRef));
      setTotalPages(Math.ceil(totalSnapshot.size / LOGS_PER_PAGE));
      
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
      setError("Falha ao carregar os logs. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Função para filtrar logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = searchQuery
        ? Object.values(log)
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        : true;

      const matchesUser = userFilter
        ? (log.idUser || log.email || "")
            .toLowerCase()
            .includes(userFilter.toLowerCase())
        : true;

      const matchesIp = ipFilter
        ? (log.ip || "").toLowerCase().includes(ipFilter.toLowerCase())
        : true;

      const matchesLocation = locationFilter
        ? (log.location?.city || log.location?.country || "")
            .toLowerCase()
            .includes(locationFilter.toLowerCase())
        : true;

      return matchesSearch && matchesUser && matchesIp && matchesLocation;
    });
  }, [logs, searchQuery, userFilter, ipFilter, locationFilter]);

  // Função para calcular métricas
  const calculateMetrics = (logsToAnalyze) => {
    const totalLogs = logsToAnalyze.length;
    const logsWithLocation = logsToAnalyze.filter(
      (log) => log.location?.latitude && log.location?.longitude
    ).length;
    const logsWithoutLocation = totalLogs - logsWithLocation;
    const uniqueUsers = new Set(
      logsToAnalyze
        .filter((log) => log.idUser || log.userId)
        .map((log) => log.idUser || log.userId)
    ).size;
    const uniqueIPs = new Set(
      logsToAnalyze
        .filter((log) => log.ip && log.ip !== "IP não disponível")
        .map((log) => log.ip)
    ).size;

    return {
      totalLogs,
      logsWithLocation,
      logsWithoutLocation,
      uniqueUsers,
      uniqueIPs,
    };
  };

  // Função para exportar CSV
  const exportLogsToCSV = () => {
    try {
      setIsExporting(true);

      if (filteredLogs.length === 0) {
        alert("Não há logs para exportar com os filtros atuais.");
        return;
      }

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

      let csvContent = headers.join(",") + "\n";

      filteredLogs.forEach((log) => {
        const row = [
          '"' + (log.id || '') + '"',
          '"' + (log.date ? formatDate(log.date) : 'Data indisponível') + '"',
          '"' + (log.idUser || log.email || 'Usuário desconhecido') + '"',
          '"' + (log.description || '') + '"',
          '"' + (log.ip || 'IP não disponível') + '"',
          '"' + (log.location?.latitude || '') + '"',
          '"' + (log.location?.longitude || '') + '"',
          '"' + (log.location?.status || '') + '"',
        ];
        csvContent += row.join(",") + "\n";
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `logs_${new Date().toISOString().slice(0, 10)}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao exportar logs:", error);
      alert("Ocorreu um erro ao exportar os logs. Por favor, tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  // Função para limpar filtros
  const clearFilters = () => {
    setSearchQuery("");
    setUserFilter("");
    setIpFilter("");
    setLocationFilter("");
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
  };

  // Função para mudar página
  const changePage = (newPage) => {
    if (newPage > currentPage) {
      fetchLogs(newPage, "next");
    } else {
      fetchLogs(newPage, "prev");
    }
    setCurrentPage(newPage);
  };

  // Efeito para carregar logs iniciais
  useEffect(() => {
    if (user && isAdmin) {
      fetchLogs(1);
    }
  }, [user, isAdmin]);

  // Calcular métricas
  const metrics = calculateMetrics(showFilteredMetrics ? filteredLogs : logs);

  // Verificação de autenticação
  if (!user || !isAdmin) {
    return <Navigate to="/login" />;
  }

  // Estado de carregamento
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner
          tipo="inline"
          mensagem="Carregando logs..."
          size="lg"
          color="primary"
        />
      </div>
    );
  }

  // Estado de erro
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
              onClick={() => fetchLogs(1)}
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

          {/* Cards de Métricas */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 auto-rows-fr">
            <MetricCard
              title="Total de Logs"
              value={metrics.totalLogs}
              icon={DocumentTextIcon}
              tooltip={METRIC_TOOLTIPS.totalLogs}
              className="h-full transform bg-gradient-to-br from-blue-50 via-blue-100/30 to-blue-50 border-blue-200/50 shadow-lg hover:scale-105 transition-all duration-300"
            />
            <MetricCard
              title="Com Localização"
              value={metrics.logsWithLocation}
              icon={GlobeAltIcon}
              tooltip={METRIC_TOOLTIPS.withLocation}
              className="h-full transform bg-gradient-to-br from-emerald-50 via-emerald-100/30 to-emerald-50 border-emerald-200/50 shadow-lg hover:scale-105 transition-all duration-300"
            />
            <MetricCard
              title="Sem Localização"
              value={metrics.logsWithoutLocation}
              icon={ExclamationTriangleIcon}
              tooltip={METRIC_TOOLTIPS.withoutLocation}
              className="h-full transform bg-gradient-to-br from-amber-50 via-amber-100/30 to-amber-50 border-amber-200/50 shadow-lg hover:scale-105 transition-all duration-300"
            />
            <MetricCard
              title="Usuários Únicos"
              value={metrics.uniqueUsers}
              icon={UsersIcon}
              tooltip={METRIC_TOOLTIPS.uniqueUsers}
              className="h-full transform bg-gradient-to-br from-violet-50 via-violet-100/30 to-violet-50 border-violet-200/50 shadow-lg hover:scale-105 transition-all duration-300"
            />
            <MetricCard
              title="IPs Únicos"
              value={metrics.uniqueIPs}
              icon={ServerIcon}
              tooltip={METRIC_TOOLTIPS.uniqueIps}
              className="h-full transform bg-gradient-to-br from-indigo-50 via-indigo-100/30 to-indigo-50 border-indigo-200/50 shadow-lg hover:scale-105 transition-all duration-300"
            />
          </div>
        </div>

        {/* Barra de busca e exportação */}
        <div className="border-b border-[#00418F]/10 bg-gradient-to-r from-[#00418F]/5 to-transparent p-6">
          <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
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
                onClick={clearFilters}
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
          </div>
        </div>

        {/* Conteúdo principal - Lista de logs */}
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#00418F]">
              Registros de Atividade
            </h3>
            <div className="text-sm text-[#00418F]/70">
              {filteredLogs.length}{" "}
              {filteredLogs.length === 1 ? "registro encontrado" : "registros encontrados"}
            </div>
          </div>

          {/* Lista de Logs */}
          {filteredLogs.length > 0 ? (
            <div className="space-y-2 sm:space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="transform rounded-lg sm:rounded-xl border border-[#00418F]/10 bg-white p-3 sm:p-4 transition-all duration-200 hover:border-[#00418F]/40 sm:hover:shadow-lg"
                >
                  <LogCard
                    log={log}
                    onLocationClick={openInMaps}
                    formatDate={formatDate}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#00418F]/10 bg-white/50 p-8 text-center">
              <ExclamationCircleIcon className="h-12 w-12 text-[#00418F]/30" />
              <h3 className="mt-4 text-lg font-medium text-[#00418F]">
                Nenhum registro encontrado
              </h3>
              <p className="mt-2 text-sm text-[#00418F]/70">
                Tente ajustar os filtros para encontrar o que procura
              </p>
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-[#00418F]/10 pt-4">
              <div className="text-sm text-[#00418F]/70">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-full bg-[#00418F]/10 p-2 text-[#00418F] transition-all hover:bg-[#00418F]/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                  Anterior
                </button>
                <span className="text-sm font-medium text-[#00418F]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 rounded-full bg-[#00418F]/10 p-2 text-[#00418F] transition-all hover:bg-[#00418F]/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Próxima
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsManagement;