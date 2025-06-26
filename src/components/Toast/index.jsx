import React, { forwardRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import './styles.css';

const Toast = forwardRef(({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose,
  position = 'bottom-right'
}, ref) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose && onClose();
      }, 300); // Tempo para a animação de saída completar
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose && onClose();
    }, 300);
  };

  const toastStyles = {
    success: {
      bg: 'bg-green-100',
      border: 'border-green-500',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />
    },
    error: {
      bg: 'bg-red-100',
      border: 'border-red-500',
      icon: <XCircleIcon className="h-5 w-5 text-red-500" />
    },
    info: {
      bg: 'bg-blue-100',
      border: 'border-blue-500',
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />
    },
    warning: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-500',
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
    }
  };

  const style = toastStyles[type];

  const toastElement = (
    <div 
      ref={ref}
      className={`toast ${position} ${style.bg} ${style.border} ${isVisible ? 'toast-enter' : 'toast-exit'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center">
        <span className="mr-2">{style.icon}</span>
        <span className="block flex-grow">{message}</span>
        <button 
          onClick={handleClose} 
          className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Fechar"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  return createPortal(toastElement, document.body);
});

Toast.displayName = 'Toast';

export default Toast;