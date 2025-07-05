import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig.js';
import LoadingSpinner from '../LoadingSpinner';

const PrivateRoute = ({ requiresAuth = true, requiredRole }) => {
  const [user, loading, error] = useAuthState(auth);
  const [role, setRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const getUserRole = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setRole(docSnap.data().role);
          } else {
            console.log('No such document!');
            setRole(null);
          }
        } catch (err) {
          console.error('Erro ao buscar dados do usuário:', err);
          setRole(null); 
        }
      }
    };

    getUserRole();
  }, [user]);

  if (loading) {
    return (
      <LoadingSpinner
        tipo="full"
        mensagem="Autenticando usuário..."
        size="md"
        color="primary"
        delay={100}
        ariaLabel="Carregando autenticação"
      />
    );
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
