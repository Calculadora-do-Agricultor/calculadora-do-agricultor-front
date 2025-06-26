import React from 'react';
import { ChartBarIcon, FunnelIcon } from '@heroicons/react/24/outline';

const MetricsToggle = ({ showFilteredMetrics, onToggle }) => {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-3 bg-white rounded-xl p-3 border border-[#0066FF]/10">
        <button
          onClick={() => !showFilteredMetrics && onToggle()}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!showFilteredMetrics 
            ? 'bg-[#00418F] text-white' 
            : 'bg-transparent text-gray-500 hover:bg-gray-50'
          }`}
        >
          <ChartBarIcon className="h-4 w-4" />
          <span>Visão Geral</span>
        </button>
        <button
          onClick={() => showFilteredMetrics && onToggle()}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showFilteredMetrics 
            ? 'bg-[#00418F] text-white' 
            : 'bg-transparent text-gray-500 hover:bg-gray-50'
          }`}
        >
          <FunnelIcon className="h-4 w-4" />
          <span>Dados Filtrados</span>
        </button>
      </div>
      <div className="ml-2 text-sm text-gray-500">
        {showFilteredMetrics ? '(Mostrando apenas dados que correspondem aos filtros aplicados)' : '(Mostrando todos os dados do sistema)'}
      </div>
    </div>
  );
};

export default MetricsToggle;