import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ show, message, type = 'success' }) => {
  if (!show) return null;

  const toastStyles = {
    success: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-400',
      icon: <CheckCircle className="h-5 w-5 text-green-400" />
    },
    error: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-400',
      icon: <XCircle className="h-5 w-5 text-red-400" />
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-400',
      icon: <AlertCircle className="h-5 w-5 text-yellow-400" />
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-400',
      icon: <Info className="h-5 w-5 text-blue-400" />
    }
  };

  const styles = toastStyles[type];

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center rounded-lg border px-4 py-3 shadow-lg transition-all duration-300 ${styles.bg} ${styles.text} ${styles.border}`}
      role="alert"
    >
      <div className="mr-2">{styles.icon}</div>
      <div className="text-sm font-medium">{message}</div>
    </div>
  );
};

export default Toast;