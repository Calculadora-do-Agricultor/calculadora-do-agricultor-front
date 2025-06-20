import { useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useAccessLogger } from '../../hooks/useAccessLogger';

/**
 * Componente de middleware para registrar automaticamente os logs de acesso
 * Este componente não renderiza nada visualmente, apenas registra os logs
 */
const AccessLoggerMiddleware = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const { createAccessLog } = useAccessLogger(user?.uid);

  useEffect(() => {
    // Função para mapear a rota atual para um nome de página mais amigável
    const getPageName = (pathname) => {
      const routes = {
        '/': 'Home',
        '/login': 'Login',
        '/Register': 'Registro',
        '/settings': 'Configurações',
        '/calculator': 'Calculadora',
        '/admin/criar-calculo': 'Criar Cálculo',
        '/admin/logs': 'Gerenciamento de Logs',
        '/admin/users': 'Gerenciamento de Usuários'
      };

      // Verificar rotas exatas
      if (routes[pathname]) {
        return routes[pathname];
      }

      // Verificar rotas com parâmetros
      if (pathname.startsWith('/edit-calculation/')) {
        return 'Editar Cálculo';
      }

      return pathname; // Retorna o caminho original se não encontrar correspondência
    };

    // Registrar log de acesso quando o usuário navega para uma nova página
    const logAccess = async () => {
      if (user?.uid) {
        const pageName = getPageName(location.pathname);
        await createAccessLog(user.uid, pageName);
      }
    };

    logAccess();
  }, [location.pathname, user, createAccessLog]);

  // Este componente não renderiza nada visualmente
  return null;
};

export default AccessLoggerMiddleware;