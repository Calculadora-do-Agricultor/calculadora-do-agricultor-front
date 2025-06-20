import React, { useState } from 'react';
import {
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  ServerIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

/**
 * Componente para exibir um card de log de acesso
 * @param {Object} log - Dados do log de acesso
 * @param {Function} formatDate - Função para formatar a data
 */
const AccessLogCard = ({ log, formatDate }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Função para formatar o agente do usuário de forma mais legível
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
  
  return (
    <div className="overflow-hidden rounded-xl border border-[#00418F]/10 bg-white/80 shadow-md transition-all duration-300 hover:shadow-lg">
      {/* Cabeçalho do card */}
      <div className="flex items-center justify-between border-b border-[#00418F]/10 bg-gradient-to-r from-[#00418F]/10 to-transparent p-4">
        <div className="flex items-center">
          <div className="mr-3 rounded-full bg-[#00418F]/10 p-2">
            <ComputerDesktopIcon className="h-5 w-5 text-[#00418F]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#00418F]">
              Log de Acesso
            </h3>
            <p className="text-sm text-[#00418F]/70">{log.timestamp ? formatDate(log.timestamp) : "Data indisponível"}</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="rounded-full p-1 text-[#00418F]/70 transition-colors duration-200 hover:bg-[#00418F]/10 hover:text-[#00418F]"
          aria-label={expanded ? "Recolher detalhes" : "Expandir detalhes"}
        >
          {expanded ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Conteúdo principal */}
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Usuário */}
          <div className="flex items-start">
            <UserIcon className="mr-3 h-5 w-5 text-[#00418F]/70" />
            <div>
              <p className="text-sm font-medium text-[#00418F]/70">Usuário</p>
              <p className="font-medium text-[#00418F]">{log.email || log.userId || 'Usuário não identificado'}</p>
            </div>
          </div>

          {/* Página acessada */}
          <div className="flex items-start">
            <DocumentTextIcon className="mr-3 h-5 w-5 text-[#00418F]/70" />
            <div>
              <p className="text-sm font-medium text-[#00418F]/70">Página</p>
              <p className="font-medium text-[#00418F]">{log.page || 'Página não especificada'}</p>
            </div>
          </div>

          {/* IP */}
          <div className="flex items-start">
            <ServerIcon className="mr-3 h-5 w-5 text-[#00418F]/70" />
            <div>
              <p className="text-sm font-medium text-[#00418F]/70">Endereço IP</p>
              <p className="font-medium text-[#00418F]">{log.ip || 'IP não disponível'}</p>
            </div>
          </div>

          {/* Ação */}
          <div className="flex items-start">
            <GlobeAltIcon className="mr-3 h-5 w-5 text-[#00418F]/70" />
            <div>
              <p className="text-sm font-medium text-[#00418F]/70">Ação</p>
              <p className="font-medium text-[#00418F]">{log.action || 'Acesso'}</p>
            </div>
          </div>
        </div>

        {/* Detalhes expandidos */}
        {expanded && (
          <div className="mt-4 border-t border-[#00418F]/10 pt-4">
            <h4 className="mb-3 font-medium text-[#00418F]">Detalhes adicionais</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Agente do usuário */}
              <div className="flex items-start">
                <ComputerDesktopIcon className="mr-3 h-5 w-5 text-[#00418F]/70" />
                <div>
                  <p className="text-sm font-medium text-[#00418F]/70">Navegador</p>
                  <p className="font-medium text-[#00418F]">
                    {formatUserAgent(log.userAgent)}
                  </p>
                </div>
              </div>

              {/* ID da sessão */}
              <div className="flex items-start">
                <ClockIcon className="mr-3 h-5 w-5 text-[#00418F]/70" />
                <div>
                  <p className="text-sm font-medium text-[#00418F]/70">ID da Sessão</p>
                  <p className="font-medium text-[#00418F]">
                    {log.sessionId ? log.sessionId.substring(0, 12) + "..." : "Não disponível"}
                  </p>
                </div>
              </div>

              {/* User Agent completo (para referência técnica) */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-start">
                  <DocumentTextIcon className="mr-3 h-5 w-5 text-[#00418F]/70" />
                  <div className="w-full">
                    <p className="text-sm font-medium text-[#00418F]/70">User Agent Completo</p>
                    <p className="break-words rounded-lg bg-[#00418F]/5 p-2 text-sm font-mono text-[#00418F]/80">
                      {log.userAgent || "Não disponível"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessLogCard;