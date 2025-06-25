import React from 'react';
import {
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  MapPinIcon,
  ArrowTopRightOnSquareIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const LogCard = ({ log, formatDate, onLocationClick }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#00418F]/20 hover:border-[#00418F]/40 transition-colors duration-150">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <ClockIcon className="h-5 w-5 text-[#00418F]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#00418F] font-medium mb-1">Data</p>
            <p className="text-sm text-gray-800">{log.date ? formatDate(log.date) : 'Data indisponível'}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <UserIcon className="h-5 w-5 text-[#00418F]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#00418F] font-medium mb-1">Usuário</p>
            <p className="text-sm text-gray-800 truncate">{log.idUser || 'Usuário desconhecido'}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <DocumentTextIcon className="h-5 w-5 text-[#00418F]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#00418F] font-medium mb-1">Descrição</p>
            <p className="text-sm text-gray-800">{log.description || 'Sem descrição'}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <GlobeAltIcon className="h-5 w-5 text-[#00418F]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#00418F] font-medium mb-1">IP</p>
            <p className="text-sm text-gray-800 font-mono">{log.ip || 'IP não disponível'}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <MapPinIcon className="h-5 w-5 text-[#00418F]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#00418F] font-medium mb-1">Localização</p>
            {log.location && log.location.latitude && log.location.longitude ? (
              <button
                onClick={() => onLocationClick(log.location.latitude, log.location.longitude)}
                className="text-sm text-[#00418F] hover:text-[#00418F]/80 transition-colors duration-300 flex items-center px-2 py-1 rounded-md hover:bg-[#00418F]/10"
                title="Abrir localização no Google Maps"
              >
                <span className="mr-2">Ver no mapa</span>
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </button>
            ) : (
              <p className="text-sm text-gray-600 italic">
                {log.location && log.location.status ? log.location.status : 'Localização não disponível'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogCard;