import { Link } from 'react-router-dom';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  to,
  href,
  onClick,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  // Variantes de estilo
  const variants = {
    primary: 'bg-[#00418F] hover:bg-[#00418F]/80 text-white',
    secondary: 'bg-white hover:bg-gray-100 text-[#00418F] border-2 border-[#00418F]',
    outline: 'bg-transparent hover:bg-[#00418F]/10 text-[#00418F] border-2 border-[#00418F]',
    ghost: 'bg-transparent hover:bg-[#00418F]/10 text-[#00418F]'
  };

  // Tamanhos
  const sizes = {
    small: 'py-2 px-4 text-sm',
    medium: 'py-3 px-6 text-base',
    large: 'py-3 px-8 text-lg'
  };

  // Classes base
  const baseClasses = `
    font-bold rounded-lg transition duration-300 transform hover:scale-105
    inline-flex items-center justify-center gap-2
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Conteúdo do botão
  const content = (
    <>
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </>
  );

  // Se for um link interno
  if (to) {
    return (
      <Link
        to={to}
        className={baseClasses}
        {...props}
      >
        {content}
      </Link>
    );
  }

  // Se for um link externo
  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {content}
      </a>
    );
  }

  // Botão normal
  return (
    <button
      className={baseClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;