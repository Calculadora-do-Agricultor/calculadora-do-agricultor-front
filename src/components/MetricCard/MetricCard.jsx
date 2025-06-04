import React from 'react';

const MetricCard = ({ title, value, icon: Icon, className = '' }) => {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-[#0066FF]/10 hover:border-[#0066FF]/20 transition-all duration-200 hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#0066FF]/70 font-medium">{title}</p>
          <p className="text-2xl font-bold text-[#0066FF] mt-1">{value}</p>
        </div>
        <div className="p-3 bg-[#0066FF]/10 rounded-lg">
          <Icon className="h-6 w-6 text-[#0066FF]" />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;