import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  className = '', 
  color = 'green',
  text = null 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  const spinnerClass = `animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`;

  const SpinnerSVG = () => (
    <svg 
      className={spinnerClass}
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  if (text) {
    return (
      <div className="flex items-center justify-center space-x-2">
        <SpinnerSVG />
        <span className="text-sm text-gray-600">{text}</span>
      </div>
    );
  }

  // Para uso como overlay de página inteira
  if (size === 'xl' && !className.includes('inline')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <SpinnerSVG />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return <SpinnerSVG />;
};

export default LoadingSpinner;