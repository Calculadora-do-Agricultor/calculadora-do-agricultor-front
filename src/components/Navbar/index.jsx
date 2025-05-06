import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoClara from '../../assets/logoClara.svg';
import { auth, db } from '../../services/firebaseConfig.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';

import NavLinks from './components/NavLinks';
import ProfileMenu from './components/ProfileMenu';
import MobileMenu from './components/MobileMenu';

const Navbar = () => {
  const [user] = useAuthState(auth);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          setUserName(docSnap.data().name);
        }
      });
    }
  }, [user]);

  return (
    <nav
      className="fixed top-0 z-50 bg-[#00418F] w-full px-6 py-3 flex items-stretch border-b-4 border-[#FFEE00] shadow-md justify-between h-20"
      role="navigation"
      aria-label="Navegação principal"
    >
      <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition duration-200">
        <img src={logoClara} alt="Logo da Calculadora do Agricultor" className="h-12" />
        <div className="text-white">
          <h1 className="text-lg font-bold">Calculadora do Agricultor</h1>
        </div>
      </Link>

      <div className="flex items-center space-x-4">
        <NavLinks user={user} />
        {user !== null && <ProfileMenu userName={userName} />}
        <MobileMenu user={user} userName={userName} />
      </div>
    </nav>
  );
};

export default Navbar;
