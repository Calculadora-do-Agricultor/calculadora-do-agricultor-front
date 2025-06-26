import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Badge } from '../ui/badge';

const CategoriaCard = ({
  icon: IconComponent,
  title,
  description,
  onClick,
  badge,
  className = '',
  disabled = false,
  calculosCount = 0
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`
        relative group cursor-pointer bg-white rounded-lg border border-gray-200 
        shadow-sm hover:shadow-md transition-all duration-200 p-6
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#00418F] hover:-translate-y-1'}
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`Navegar para categoria ${title}`}
      aria-disabled={disabled}
    >
      {/* Badge opcional no canto superior direito */}
      {badge && (
        <div className="absolute top-3 right-3">
          <Badge 
            variant={badge.variant || 'default'} 
            className="text-xs font-medium"
          >
            {badge.text}
          </Badge>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="flex flex-col h-full">
        {/* Ícone */}
        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-[#00418F]/10 group-hover:bg-[#00418F]/20 transition-colors duration-200">
          {IconComponent && (
            <IconComponent 
              className="w-6 h-6 text-[#00418F]" 
              aria-hidden="true"
            />
          )}
        </div>

        {/* Título */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Descrição */}
        <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
          {description}
        </p>

        {/* Footer com contador de cálculos e seta */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-xs text-gray-500">
            {calculosCount} {calculosCount === 1 ? 'cálculo' : 'cálculos'}
          </span>
          
          <ChevronRightIcon 
            className="w-4 h-4 text-gray-400 group-hover:text-[#00418F] transition-colors duration-200" 
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};

export default CategoriaCard;