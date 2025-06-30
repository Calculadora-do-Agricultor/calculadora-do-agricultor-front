import React from 'react';
import { ChartBarIcon, FunnelIcon } from '@heroicons/react/24/outline';

const MetricsToggle = ({ showFilteredMetrics, onToggle }) => {
  return (
    <div className="flex items-center gap-4">
      <button
        className={`flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all duration-200 ${
          !showFilteredMetrics
            ? "bg-[#00418F] text-white"
            : "bg-[#00418F]/10 text-[#00418F]"
        }`}
        onClick={() => onToggle(false)}
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
        onClick={() => onToggle(true)}
      >
        <FunnelIcon className="h-5 w-5" />
        Dados Filtrados
      </button>
    </div>
  );
};

export default MetricsToggle;