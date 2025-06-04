import React from 'react';

const BrazilFlag = ({ className = '', width = '32', height = '32' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 480"
      width={width}
      height={height}
      className={className}
    >
      {/* Fundo verde */}
      <path fill="#009c3b" d="M0 0h640v480H0z" />
      
      {/* Losango amarelo */}
      <path fill="#f7df1e" d="M321.4 436l301.5-227.5L319.6 44 17.1 272.2z" />
      
      {/* Círculo azul */}
      <circle cx="319.6" cy="240" r="124.6" fill="#002776" />
      
      {/* Faixa branca */}
      <path
        fill="#fff"
        d="M319.6 106.6c-11.5 0-35.6 4.3-58.2 19.4 3.3-1 6.6-1.8 10-2.4 28.4-4.8 57.2 1.2 79.9 16.9a107.4 107.4 0 0 1 42.1 64.3c4 20.5 2 41.2-6.3 61.2 1-1.5 2-3 2.9-4.6 14.8-25.6 14.8-56 0-81.6-14.9-25.6-41.2-44.6-70.4-44.6z"
      />
    </svg>
  );
}

export default BrazilFlag;