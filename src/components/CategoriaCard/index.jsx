import React, { useState, useRef } from 'react';
import { Badge } from '../ui/badge';
import { Edit, ImageIcon } from 'lucide-react';
import './styles.css';

const CategoriaCard = ({
  imageUrl,
  title,
  description,
  onClick,
  onEdit,
  tags = [],
  className = '',
  disabled = false,
  calculosCount = 0,
  color,
  isSelected = false
}) => {
  const [imageError, setImageError] = useState(false);
  const tagsContainerRef = useRef(null);

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

  const dragRef = useRef({ isDown: false, startX: 0, startY: 0, scrollLeft: 0 });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (!tagsContainerRef.current) return;
    const el = tagsContainerRef.current;
    dragRef.current.isDown = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.scrollLeft = el.scrollLeft;
    el.classList.add('grabbing');
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDown || !tagsContainerRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
      tagsContainerRef.current.scrollLeft = dragRef.current.scrollLeft - dx;
    }
  };

  const endDrag = () => {
    dragRef.current.isDown = false;
    if (tagsContainerRef.current) {
      tagsContainerRef.current.classList.remove('grabbing');
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
        relative group cursor-pointer bg-white rounded-lg border-2 transition-all duration-200 p-4 w-full
        ${
          isSelected 
            ? 'border-[#00418F] bg-blue-50 shadow-lg shadow-blue-100' 
            : 'border-gray-200 hover:border-[#00418F] hover:shadow-md'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'}
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`Navegar para categoria ${title}`}
      aria-disabled={disabled}
    >


      {/* Layout principal */}
      <div className="flex items-center gap-4 w-full">
        {/* Ícone da categoria */}
        <div 
          className="flex items-center justify-center w-12 h-12 rounded-lg flex-shrink-0 transition-all duration-200"
          style={{
            backgroundColor: color ? `${color}20` : '#00418F20',
          }}
        >
          {imageUrl && !imageError ? (
            <img 
              src={imageUrl} 
              alt={`Ícone da categoria ${title}`}
              className="w-8 h-8 object-cover rounded-md"
              onError={handleImageError}
            />
          ) : (
            <ImageIcon 
              className="w-6 h-6" 
              style={{ color: color || '#00418F' }} 
              aria-hidden="true" 
            />
          )}
        </div>

        {/* Informações da categoria */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate leading-tight">
                {title}
              </h3>
            </div>
            
            {/* Contador de cálculos */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {calculosCount} {calculosCount === 1 ? 'cálculo' : 'cálculos'}
              </span>
              
              {/* Botão de editar */}
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-blue-100 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label={`Editar categoria ${title}`}
                >
                  <Edit className="w-4 h-4 text-gray-600 hover:text-blue-600" />
                </button>
              )}
            </div>
          </div>
          
          {/* Tags da categoria */}
          {tags && tags.length > 0 && (
            <div className="mt-2 relative">
              <div
                ref={tagsContainerRef}
                className="tags-scroll"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerLeave={endDrag}
              >
                {tags.map((tag, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="text-xs font-medium px-2 py-0.5 bg-gray-50 text-gray-700 border-gray-200 inline-flex"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriaCard;