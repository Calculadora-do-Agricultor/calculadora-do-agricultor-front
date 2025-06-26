import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

export const LOADING_SIZES = {
  SMALL: 'sm',
  DEFAULT: 'default',
  LARGE: 'lg'
};

const Loading = ({
  size = LOADING_SIZES.DEFAULT,
  message = 'Carregando...',
  className,
  containerClassName,
  color = 'primary'
}) => {
  const sizeClasses = {
    [LOADING_SIZES.SMALL]: 'w-4 h-4 border-2',
    [LOADING_SIZES.DEFAULT]: 'w-8 h-8 border-3',
    [LOADING_SIZES.LARGE]: 'w-12 h-12 border-4',
  };

  const spinnerSize = sizeClasses[size] || sizeClasses[LOADING_SIZES.DEFAULT];
  const spinnerColor = `border-t-${color}`;

  return (
    <div 
      role="status" 
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center gap-3', containerClassName)}
    >
      <div
        className={cn(
          'animate-spin rounded-full',
          'border-gray-200 dark:border-gray-700',
          spinnerColor,
          spinnerSize,
          className
        )}
      />
      {message && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      )}
      <span className="sr-only">{message}</span>
    </div>
  );
};

Loading.propTypes = {
  size: PropTypes.oneOf(Object.values(LOADING_SIZES)),
  message: PropTypes.string,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  color: PropTypes.string
};

export default Loading;