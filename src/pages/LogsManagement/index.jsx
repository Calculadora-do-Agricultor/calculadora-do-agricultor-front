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
import "../Dashboard/Dashboard.css";

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

  // Função para buscar logs (carrega todos para permitir filtro em qualquer página)
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const logsCollectionRef = collection(db, "logs");
      const q = query(logsCollectionRef, orderBy("date", "desc"));

      const querySnapshot = await getDocs(q);
      const logsData = [];
      querySnapshot.forEach((doc) => {
        logsData.push({ id: doc.id, ...doc.data() });
      });

      setLogs(logsData);
      setTotalPages(Math.max(1, Math.ceil(logsData.length / LOGS_PER_PAGE)));
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
    setCurrentPage(newPage);
  };

  // Efeito para carregar logs iniciais
  useEffect(() => {
    if (user && isAdmin) {
      fetchLogs();
    }
  }, [user, isAdmin]);

  // Resetar página ao alterar filtros/busca e ajustar quando necessário
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, userFilter, ipFilter, locationFilter]);

  const computedTotalPages = Math.max(1, Math.ceil(filteredLogs.length / LOGS_PER_PAGE));
  useEffect(() => {
    if (currentPage > computedTotalPages) {
      setCurrentPage(computedTotalPages);
    }
  }, [computedTotalPages, currentPage]);

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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Gerenciamento de Logs</h1>
        <p>Visualize e gerencie os logs de atividades</p>
        <button
          onClick={() => fetchLogs(1)}
          className="refresh-button"
          disabled={loading}
          title="Atualizar logs"
        >
          {loading ? (
            <LoadingSpinner tipo="inline" tamanho="small" cor="white" />
          ) : (
            <ArrowPathIcon className="h-4 w-4" />
          )}
          Atualizar
        </button>
      </div>

      <div className="recent-calculations">
        <div className="section-header">
          <h2>Métricas</h2>
          <div className="chart-actions">
            <button
              className={`export-button ${!showFilteredMetrics ? "bg-[#f8fafc]" : ""}`}
              onClick={() => setShowFilteredMetrics(false)}
            >
              <ChartBarIcon className="h-4 w-4" />
              Visão Geral
            </button>
            <button
              className={`export-button ${showFilteredMetrics ? "bg-[#f8fafc]" : ""}`}
              onClick={() => setShowFilteredMetrics(true)}
            >
              <FunnelIcon className="h-4 w-4" />
              Dados Filtrados
            </button>
          </div>
        </div>
        <div className="p-2">
          <div className="mb-4 text-sm text-[#00418F]/70 flex items-center gap-2">
            <InformationCircleIcon className="h-4 w-4" />
            {showFilteredMetrics
              ? "Exibindo métricas dos dados filtrados"
              : "Exibindo métricas de todos os registros"}
          </div>
          <div className="metrics-grid">
            <MetricCard
              title="Total de Logs"
              value={metrics.totalLogs}
              icon={DocumentTextIcon}
              tooltip={METRIC_TOOLTIPS.totalLogs}
            />
            <MetricCard
              title="Com Localização"
              value={metrics.logsWithLocation}
              icon={GlobeAltIcon}
              tooltip={METRIC_TOOLTIPS.withLocation}
            />
            <MetricCard
              title="Sem Localização"
              value={metrics.logsWithoutLocation}
              icon={ExclamationTriangleIcon}
              tooltip={METRIC_TOOLTIPS.withoutLocation}
            />
            <MetricCard
              title="Usuários Únicos"
              value={metrics.uniqueUsers}
              icon={UsersIcon}
              tooltip={METRIC_TOOLTIPS.uniqueUsers}
            />
            <MetricCard
              title="IPs Únicos"
              value={metrics.uniqueIPs}
              icon={ServerIcon}
              tooltip={METRIC_TOOLTIPS.uniqueIps}
            />
          </div>
        </div>
      </div>

      <div className="recent-calculations">
        <div className="section-header">
          <h2>Busca e Exportação</h2>
        </div>
        <div className="p-2">
          <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
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
            <button
              onClick={exportLogsToCSV}
              disabled={isExporting || filteredLogs.length === 0}
              className={`refresh-button ${isExporting || filteredLogs.length === 0 ? "opacity-70 cursor-not-allowed" : ""}`}
              title="Exportar CSV"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {isExporting ? "Exportando..." : "Exportar CSV"}
            </button>
          </div>
        </div>
      </div>

      <div className="recent-calculations">
        <div className="section-header">
          <h2>Filtros</h2>
          <div className="chart-actions">
            <button onClick={clearFilters} className="export-button">
              <ExclamationCircleIcon className="h-4 w-4" />
              Limpar Filtros
            </button>
          </div>
        </div>
        <div className="p-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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

      <div className="recent-calculations">
        <div className="section-header">
          <h2>Registros de Atividade</h2>
          <div className="chart-actions">
            <span className="text-sm text-[#00418F]/70">
              {filteredLogs.length}{" "}
              {filteredLogs.length === 1 ? "registro encontrado" : "registros encontrados"}
            </span>
          </div>
        </div>
        <div className="p-2">
          {filteredLogs.length > 0 ? (
            <div className="space-y-2 sm:space-y-4">
              {filteredLogs
                .slice((currentPage - 1) * LOGS_PER_PAGE, (currentPage - 1) * LOGS_PER_PAGE + LOGS_PER_PAGE)
                .map((log) => (
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
                  {currentPage} / {computedTotalPages}
                </span>
                <button
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === computedTotalPages}
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
