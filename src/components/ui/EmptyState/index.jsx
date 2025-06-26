import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const EmptyState = ({ 
  title = "Nenhum resultado encontrado", 
  description = "Não há dados para exibir no momento.",
  icon: Icon = ExclamationCircleIcon,
  action = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="rounded-full bg-gray-100 p-6 mb-4">
        <Icon className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">{description}</p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;