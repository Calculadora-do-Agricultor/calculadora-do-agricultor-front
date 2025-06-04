import React from 'react';
import {
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  MapPinIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const LogCard = ({ log, formatDate, openInMaps }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#0066FF]/10 hover:border-[#0066FF]/20 transition-colors duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <ClockIcon className="h-5 w-5 text-[#0066FF]/70" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#0066FF]/70 font-medium mb-1">Data</p>
            <p className="text-sm text-gray-700">{log.date ? formatDate(log.date) : 'Data indisponível'}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <UserIcon className="h-5 w-5 text-[#0066FF]/70" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#0066FF]/70 font-medium mb-1">Usuário</p>
            <p className="text-sm text-gray-700 truncate">{log.idUser || 'Usuário desconhecido'}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <DocumentTextIcon className="h-5 w-5 text-[#0066FF]/70" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#0066FF]/70 font-medium mb-1">Descrição</p>
            <p className="text-sm text-gray-700">{log.description || 'Sem descrição'}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <MapPinIcon className="h-5 w-5 text-[#0066FF]/70" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#0066FF]/70 font-medium mb-1">Localização</p>
            {log.location && log.location.latitude && log.location.longitude ? (
              <button
                onClick={() => openInMaps(log.location.latitude, log.location.longitude)}
                className="text-sm text-[#0066FF] hover:text-[#0066FF]/80 transition-colors duration-200 flex items-center px-2 py-1 rounded-md hover:bg-[#0066FF]/5"
                title="Abrir localização no Google Maps"
              >
                <span className="mr-2">Ver no mapa</span>
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
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
  );
};

export default LogCard;