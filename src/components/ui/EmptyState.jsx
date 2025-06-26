import React from 'react';
import { AlertCircle, FolderPlus, Calculator, History, Search } from 'lucide-react';

const iconMap = {
  category: FolderPlus,
  calculation: Calculator,
  history: History,
  search: Search,
  default: AlertCircle
};

const EmptyState = ({
  type = 'default',
  icon,
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  secondaryOnAction,
  className = ''
}) => {
  const Icon = icon || iconMap[type] || iconMap.default;

  return (
    <div 
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="rounded-full bg-[#00418F]/10 p-6 mb-4">
        <Icon className="h-12 w-12 text-[#00418F]" aria-hidden="true" />
      </div>
      {title && (
        <h3 className="text-xl font-semibold text-[#00418F] mb-3">
          {title}
        </h3>
      )}
      {message && (
        <p className="text-base text-gray-600 mb-6 max-w-md">
          {message}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-[#00418F] hover:bg-[#00418F]/90 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00418F]/20"
          >
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && secondaryOnAction && (
          <button
            onClick={secondaryOnAction}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-[#00418F] bg-[#00418F]/10 hover:bg-[#00418F]/20 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00418F]/20"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;