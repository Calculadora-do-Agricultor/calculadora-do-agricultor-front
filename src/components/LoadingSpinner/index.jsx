import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Componente de loading padronizado para todo o sistema
 * @param {Object} props - Propriedades do componente
 * @param {string} props.mensagem - Mensagem opcional a ser exibida
 * @param {'full'|'inline'|'overlay'} props.tipo - Tipo de loading
 * @param {number} props.delay - Delay em ms antes de exibir o loading
 * @param {string} props.size - Tamanho do spinner (sm, md, lg, xl)
 * @param {string} props.className - Classes CSS adicionais
 * @param {string} props.color - Cor do spinner
 */
const LoadingSpinner = ({ 
  mensagem = 'Carregando...', 
  tipo = 'inline',
  delay = 0,
  size = 'md', 
  className = '', 
  color = 'primary'
}) => {
  const [shouldShow, setShouldShow] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!shouldShow) {
    return null;
  }

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'text-primary',
    green: 'text-green-600',
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  const spinnerClass = `animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`;

  const SpinnerIcon = () => (
    <Loader2 
      className={spinnerClass}
      role="status"
      aria-label="Carregando"
    />
  );

  // Loading tipo 'full' - ocupa a tela toda
  if (tipo === 'full') {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        role="status"
        aria-live="polite"
        aria-label={mensagem}
      >
        <div className="flex flex-col items-center space-y-4 rounded-lg bg-card p-8 shadow-lg border">
          <SpinnerIcon />
          {mensagem && (
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              {mensagem}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Loading tipo 'overlay' - aparece sobre o conteúdo
  if (tipo === 'overlay') {
    return (
      <div 
        className="absolute inset-0 z-40 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg"
        role="status"
        aria-live="polite"
        aria-label={mensagem}
      >
        <div className="flex flex-col items-center space-y-3 rounded-lg bg-card/90 p-6 shadow-md border">
          <SpinnerIcon />
          {mensagem && (
            <p className="text-xs font-medium text-muted-foreground">
              {mensagem}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Loading tipo 'inline' - apenas o spinner com texto opcional
  return (
    <div 
      className="flex items-center justify-center space-x-2"
      role="status"
      aria-live="polite"
      aria-label={mensagem}
    >
      <SpinnerIcon />
      {mensagem && (
        <span className="text-sm font-medium text-muted-foreground">
          {mensagem}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;