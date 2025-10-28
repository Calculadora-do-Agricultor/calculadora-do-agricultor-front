import React, { memo } from 'react';
import {
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  MapPinIcon,
  ArrowTopRightOnSquareIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Chip = ({ children }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-[#00418F]/10 text-[#00418F] px-2 py-1 text-xs sm:text-[13px]">
    {children}
  </span>
);

const LogCard = ({ log, formatDate, onLocationClick }) => {
  const hasGeo = Boolean(log?.location?.latitude && log?.location?.longitude);

  const description = log?.description || 'Sem descrição';
  const userId = log?.idUser || 'Usuário desconhecido';
  const ip = log?.ip || 'IP não disponível';
  const formattedDate = log?.date ? formatDate(log.date) : 'Data indisponível';

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Linha principal: descrição como foco */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <DocumentTextIcon className="h-5 w-5 text-[#00418F]" />
          <span className="text-gray-900 font-medium truncate" title={description}>
            {description}
          </span>
        </div>
        <div className="flex items-center">
          {hasGeo ? (
            <button
              onClick={() => onLocationClick(log.location.latitude, log.location.longitude)}
              className="inline-flex items-center gap-1 rounded-md bg-[#00418F]/10 text-[#00418F] px-2 py-1 text-xs sm:text-[13px] hover:bg-[#00418F]/15"
              title="Abrir no Google Maps"
              aria-label="Abrir localização no Google Maps"
            >
              <MapPinIcon className="h-4 w-4" />
              Mapa
              <ArrowTopRightOnSquareIcon className="h-3 w-3" />
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 text-gray-600 px-2 py-1 text-xs sm:text-[13px]">
              <MapPinIcon className="h-4 w-4" />
              Sem localização
            </span>
          )}
        </div>
      </div>

      {/* Linha secundária: metadados como chips */}
      <div className="flex flex-wrap items-center gap-2">
        <Chip>
          <ClockIcon className="h-3.5 w-3.5" />
          <span className="truncate max-w-[140px] sm:max-w-[180px]" title={formattedDate}>{formattedDate}</span>
        </Chip>
        <Chip>
          <UserIcon className="h-3.5 w-3.5" />
          <span className="truncate max-w-[120px] sm:max-w-[160px]" title={userId}>{userId}</span>
        </Chip>
        <Chip>
          <GlobeAltIcon className="h-3.5 w-3.5" />
          <span className="truncate max-w-[120px] sm:max-w-[160px] font-mono" title={ip}>{ip}</span>
        </Chip>
      </div>
    </div>
  );
};

export default memo(LogCard);