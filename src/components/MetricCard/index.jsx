import React from 'react';

const MetricCard = ({ title, value, icon, className = '' }) => {
  // Renderiza o ícone com base no tipo recebido
  const renderIcon = () => {
    // Se o ícone já for um elemento JSX (React.ReactNode)
    if (React.isValidElement(icon)) {
      return icon;
    }
    
    // Se o ícone for um componente React (função/classe)
    if (typeof icon === 'function') {
      const IconComponent = icon;
      return <IconComponent className="h-7 w-7 text-white" />;
    }
    
    // Caso não seja nenhum dos dois, retorna null
    return null;
  };

  return (
    <div className={`bg-white rounded-xl p-6 border border-[#00418F]/20 hover:border-[#00418F]/40 hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-[#00418F]/80 font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-[#00418F] leading-tight">{value}</p>
        </div>
        <div className="ml-4 p-4 bg-gradient-to-br from-[#00418F] to-[#00418F]/80 rounded-xl shadow-md">
          {renderIcon()}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;