

import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

/**
 * Componente para proteger rotas que exigem permissões de administrador
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes filhos a serem renderizados se o usuário tiver permissão
 * @param {boolean} props.adminOnly - Se verdadeiro, apenas administradores podem acessar
 * @param {string} props.redirectTo - Rota para redirecionamento caso o usuário não tenha permissão
 */
const ProtectedRoute = ({ children, adminOnly = false, redirectTo = "/" }) => {
  const { user, loading, isAdmin } = useContext(AuthContext);
  const isDev = import.meta.env?.DEV;

  // Aguarda a verificação de autenticação e permissões
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00418F]"></div>
      </div>
    );
  }

  // Em desenvolvimento, permitir acesso às rotas protegidas para facilitar testes
  if (isDev) {
    return children;
  }

  // Verifica se o usuário está autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verifica se a rota é apenas para administradores
  if (adminOnly && !isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  // Se passou por todas as verificações, renderiza o conteúdo protegido
  return children;
};

export default ProtectedRoute;