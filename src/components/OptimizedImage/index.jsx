import React, { useState, useCallback, memo } from 'react';

/**
 * Componente de imagem otimizado com lazy loading e fallback
 */
const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  fallback = null,
  placeholder = null,
  loading = 'lazy',
  ...props 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  // Se houve erro e existe fallback, mostrar fallback
  if (imageError && fallback) {
    return fallback;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Placeholder enquanto carrega */}
      {!imageLoaded && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          {placeholder}
        </div>
      )}
      
      {/* Imagem principal */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        {...props}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;