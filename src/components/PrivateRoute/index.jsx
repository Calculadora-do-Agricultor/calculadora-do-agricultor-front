import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authWrapper, firestoreWrapper } from '../../services/firebaseWrapper';

const PrivateRoute = ({ requiresAuth = true, requiredRole }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const user = authWrapper.getCurrentUser();

  useEffect(() => {
    const getUserRole = async () => {
      if (user) {
        try {
          setLoading(true);
          const userData = await firestoreWrapper.getDocument('users', user.uid);

          if (userData) {
            setRole(userData.role);
          } else {
            console.log('No such document!');
            setRole(null);
          }
        } catch (err) {
          console.error('Erro ao buscar dados do usuário:', err);
          setRole(null);
          setError(err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    getUserRole();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Se a rota requer autenticação e o usuário não está logado
  if (requiresAuth && !user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // Se a rota não requer autenticação (login/registro) e o usuário está logado
  if (!requiresAuth && user) {
    return <Navigate to='/calculator' replace />;
  }

  // Verificação de papel específico (role)
  if (requiredRole && role !== requiredRole) {
    return <Navigate to='/not-authorized' replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
