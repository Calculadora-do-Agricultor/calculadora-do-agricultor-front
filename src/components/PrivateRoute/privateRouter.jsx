import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig.js';

const PrivateRoute = ({ requiredRole }) => {
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

  if (loading || role === null) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to='/not-authorized' replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
