import React, { useState } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import { Badge } from '../ui/badge';
import { Edit, ImageIcon } from 'lucide-react';

const CategoriaCard = ({
  imageUrl, // URL da imagem da categoria
  title,
  description,
  onClick,
  onEdit,
  tags = [], // Array de tags da categoria
  className = '',
  disabled = false,
  calculosCount = 0,
  color // Nova prop para a cor
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
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
        shadow-sm hover:shadow-md transition-all duration-200 p-4 w-full
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#00418F] hover:scale-[1.02]'}
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`Navegar para categoria ${title}`}
      aria-disabled={disabled}
    >


      {/* Conteúdo principal - Layout horizontal */}
      <div className="flex items-center gap-4 w-full">
        {/* Imagem da categoria */}
        <div 
          className="flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200 flex-shrink-0 overflow-hidden p-2"
          style={{
            backgroundColor: color ? `${color}50` : '#00418F20',
          }}
        >
          {imageUrl && !imageError ? (
            <img 
              src={imageUrl} 
              alt={`Ícone da categoria ${title}`}
              className="w-full h-full object-cover rounded-md"
              onError={handleImageError}
            />
          ) : (
            <ImageIcon 
              className="w-5 h-5" 
              style={{ color: color || '#00418F' }} 
              aria-hidden="true" 
            />
          )}
        </div>

        {/* Nome da categoria */}
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h3>
          {/* Tags da categoria */}
          <div className="flex flex-wrap gap-1 mt-1">
            {tags && tags.length > 0 && tags.map((tag, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="text-xs font-medium px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Área direita - Contador e botão de editar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Contador de cálculos */}
          <div className="text-right">
            <p className="text-xs text-gray-500">{calculosCount} {calculosCount === 1 ? 'cálculo' : 'cálculos'}</p>
          </div>
          
          {/* Botão de editar - sempre visível */}
           {onEdit && (
             <button
               onClick={handleEdit}
               className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 border border-gray-200 hover:border-gray-300 cursor-pointer"
               aria-label={`Editar categoria ${title}`}
             >
               <Edit className="w-4 h-4 text-gray-600" />
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default CategoriaCard;