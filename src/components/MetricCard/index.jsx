import React, { useState, useEffect } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const MetricTooltip = ({ tooltip }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative">
      <InformationCircleIcon className="h-4 w-4 text-[#00418F]/60 cursor-help" />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity w-48 text-center z-10">
        {tooltip}
        <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, tooltip, className = '' }) => {
  return (
    <div className="relative group h-full">
      <div className={`h-full flex flex-col bg-white rounded-xl p-6 border border-[#00418F]/20 group-hover:border-[#00418F]/40 ${className}`}>
        <div className="flex items-center justify-between h-full">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm text-[#00418F]/80 font-medium">{title}</p>
              {tooltip && <MetricTooltip tooltip={tooltip} />}
            </div>
            <p className="text-3xl font-bold text-[#00418F] leading-tight">{value}</p>
          </div>
          <div className="ml-4 p-4 bg-[#00418F] rounded-xl">
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;