import React from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const Alert = ({ type = 'error', message, onClose }) => {
  const alertStyles = {
    success: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-400',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-400" />
    },
    error: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-400',
      icon: <XCircleIcon className="h-5 w-5 text-red-400" />
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-400',
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-400',
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-400" />
    }
  };

  const style = alertStyles[type];

  return (
    <div className={`${style.bg} ${style.border} ${style.text} border px-4 py-3 rounded relative mb-4`} role="alert">
      <div className="flex items-center">
        <span className="mr-2">{style.icon}</span>
        <span className="block sm:inline">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;