import React from 'react';
import {
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  MapPinIcon,
  ArrowTopRightOnSquareIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Dot = () => <span className="mx-2 text-[#00418F]/30">•</span>;

const LogCard = ({ log, formatDate, onLocationClick }) => {
  const hasGeo = Boolean(log?.location?.latitude && log?.location?.longitude);

  return (
    <div className="flex items-center gap-2 text-sm">
      <ClockIcon className="h-4 w-4 text-[#00418F]" />
      <span className="text-gray-800">
        {log?.date ? formatDate(log.date) : 'Data indisponível'}
      </span>

      <Dot />

      <UserIcon className="h-4 w-4 text-[#00418F]" />
      <span className="text-gray-800 truncate max-w-[160px]">
        {log?.idUser || 'Usuário desconhecido'}
      </span>

      <Dot />

      <DocumentTextIcon className="h-4 w-4 text-[#00418F]" />
      <span className="text-gray-800 truncate flex-1">
        {log?.description || 'Sem descrição'}
      </span>

      <Dot />

      <GlobeAltIcon className="h-4 w-4 text-[#00418F]" />
      <span className="text-gray-800 font-mono truncate max-w-[140px]">
        {log?.ip || 'IP não disponível'}
      </span>

      <Dot />

      <MapPinIcon className="h-4 w-4 text-[#00418F]" />
      {hasGeo ? (
        <button
          onClick={() => onLocationClick(log.location.latitude, log.location.longitude)}
          className="text-[#00418F] hover:text-[#00418F]/80 transition-colors px-2 py-0.5 rounded-md hover:bg-[#00418F]/10"
          title="Abrir no Google Maps"
        >
          <span className="inline-flex items-center gap-1">
            Mapa
            <ArrowTopRightOnSquareIcon className="h-3 w-3" />
          </span>
        </button>
      ) : (
        <span className="text-gray-600 italic truncate max-w-[200px]">
          {log?.location?.status || 'Localização não disponível'}
        </span>
      )}
    </div>
  );
};

export default LogCard;