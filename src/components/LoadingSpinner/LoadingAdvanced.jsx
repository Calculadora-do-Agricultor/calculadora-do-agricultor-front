import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Componente de loading avançado com diferentes tipos de animação
 * @param {Object} props - Propriedades do componente
 * @param {string} props.mensagem - Mensagem opcional a ser exibida
 * @param {'full'|'inline'|'overlay'} props.tipo - Tipo de loading
 * @param {'spinner'|'dots'|'bars'|'skeleton'} props.animacao - Tipo de animação
 * @param {number} props.delay - Delay em ms antes de exibir o loading
 * @param {string} props.size - Tamanho do loading (sm, md, lg, xl)
 * @param {string} props.className - Classes CSS adicionais
 * @param {string} props.color - Cor do loading
 */
const LoadingAdvanced = ({ 
  mensagem = 'Carregando...', 
  tipo = 'inline',
  animacao = 'spinner',
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
    sm: { spinner: 'h-4 w-4', dot: 'h-2 w-2', bar: 'h-1', skeleton: 'h-4' },
    md: { spinner: 'h-6 w-6', dot: 'h-3 w-3', bar: 'h-1.5', skeleton: 'h-6' },
    lg: { spinner: 'h-8 w-8', dot: 'h-4 w-4', bar: 'h-2', skeleton: 'h-8' },
    xl: { spinner: 'h-12 w-12', dot: 'h-6 w-6', bar: 'h-3', skeleton: 'h-12' }
  };

  const colorClasses = {
    primary: 'text-primary bg-primary',
    green: 'text-green-600 bg-green-600',
    emerald: 'text-emerald-600 bg-emerald-600',
    blue: 'text-blue-600 bg-blue-600',
    gray: 'text-gray-600 bg-gray-600',
    white: 'text-white bg-white'
  };

  // Componente Spinner
  const SpinnerAnimation = () => (
    <Loader2 
      className={`animate-spin ${sizeClasses[size].spinner} ${colorClasses[color].split(' ')[0]} ${className}`}
      role="status"
      aria-label="Carregando"
    />
  );

  // Componente Dots
  const DotsAnimation = () => (
    <div className="flex space-x-1" role="status" aria-label="Carregando">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size].dot} ${colorClasses[color].split(' ')[1]} rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );

  // Componente Bars
  const BarsAnimation = () => (
    <div className="flex items-end space-x-1" role="status" aria-label="Carregando">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size].bar} w-1 ${colorClasses[color].split(' ')[1]} animate-pulse`}
          style={{ 
            height: `${12 + (i % 3) * 8}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );

  // Componente Skeleton
  const SkeletonAnimation = () => (
    <div className="animate-pulse space-y-2" role="status" aria-label="Carregando">
      <div className={`${sizeClasses[size].skeleton} bg-gray-200 rounded w-3/4`} />
      <div className={`${sizeClasses[size].skeleton} bg-gray-200 rounded w-1/2`} />
      <div className={`${sizeClasses[size].skeleton} bg-gray-200 rounded w-5/6`} />
    </div>
  );

  // Seleciona o componente de animação
  const getAnimationComponent = () => {
    switch (animacao) {
      case 'dots':
        return <DotsAnimation />;
      case 'bars':
        return <BarsAnimation />;
      case 'skeleton':
        return <SkeletonAnimation />;
      default:
        return <SpinnerAnimation />;
    }
  };

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
          {getAnimationComponent()}
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
          {getAnimationComponent()}
          {mensagem && (
            <p className="text-xs font-medium text-muted-foreground">
              {mensagem}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Loading tipo 'inline' - apenas a animação com texto opcional
  return (
    <div 
      className="flex items-center justify-center space-x-3"
      role="status"
      aria-live="polite"
      aria-label={mensagem}
    >
      {getAnimationComponent()}
      {mensagem && animacao !== 'skeleton' && (
        <span className="text-sm font-medium text-muted-foreground">
          {mensagem}
        </span>
      )}
    </div>
  );
};

export default LoadingAdvanced;