import React from 'react';

// Utilitário para preload de rotas críticas
// Baseado nas recomendações de performance do Vite

/**
 * Precarrega componentes críticos para melhorar a performance
 * Deve ser chamado após o carregamento inicial da aplicação
 */
export const preloadCriticalRoutes = () => {
  // Preload da página da calculadora (rota mais usada)
  import('../pages/Calculator/Calculator.jsx').catch(() => {
    // Silenciosamente falha se não conseguir precarregar
  });
  
  // Preload de componentes críticos da calculadora
  import('../components/CalculationList/index.jsx').catch(() => {});
  import('../components/Categories/index.jsx').catch(() => {});
};

/**
 * Precarrega rotas administrativas quando o usuário é admin
 */
export const preloadAdminRoutes = () => {
  import('../pages/CreateCalculationPage/CreateCalculationPage.jsx').catch(() => {});
  import('../pages/LogsManagement/index.jsx').catch(() => {});
  import('../pages/UserManagement/index.jsx').catch(() => {});
  import('../components/CreateCalculation/index.jsx').catch(() => {});
  import('../components/EditCalculation/index.jsx').catch(() => {});
};

/**
 * Precarrega rotas de configurações quando o usuário está logado
 */
export const preloadUserRoutes = () => {
  import('../pages/Settings/Settings.jsx').catch(() => {});
};

/**
 * Hook para preload inteligente baseado no contexto do usuário
 */
export const useIntelligentPreload = (user, isAdmin) => {
  React.useEffect(() => {
    // Preload crítico sempre
    const timer = setTimeout(() => {
      preloadCriticalRoutes();
    }, 2000); // Aguarda 2s após carregamento inicial
    
    return () => clearTimeout(timer);
  }, []);
  
  React.useEffect(() => {
    if (user) {
      // Preload rotas de usuário logado
      const timer = setTimeout(() => {
        preloadUserRoutes();
        
        // Se for admin, preload rotas administrativas
        if (isAdmin) {
          preloadAdminRoutes();
        }
      }, 5000); // Aguarda 5s para não interferir na experiência inicial
      
      return () => clearTimeout(timer);
    }
  }, [user, isAdmin]);
};