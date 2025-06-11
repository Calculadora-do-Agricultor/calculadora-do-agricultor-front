import React from 'react';

const MetricsToggle = ({ showFilteredMetrics, onToggle }) => {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-[#0066FF]/10">
        <span className={`text-sm font-medium transition-colors duration-300 ${
          !showFilteredMetrics ? 'text-[#00418F]' : 'text-gray-500'
        }`}>
          Métricas Gerais
        </span>
        <button
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 ${
            showFilteredMetrics ? 'bg-[#00418F]' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
              showFilteredMetrics ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-sm font-medium transition-colors duration-300 ${
          showFilteredMetrics ? 'text-[#00418F]' : 'text-gray-500'
        }`}>
          Métricas Filtradas
        </span>
      </div>
    </div>
  );
};

export default MetricsToggle;