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
      className="bg-blue-900 w-full px-6 py-3 flex items-center border-b-4 border-yellow-400 shadow-md justify-between"
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
        
        <img
          src="https://flagcdn.com/w40/br.png"
          alt="Bandeira do Brasil"
          className="h-6 w-8 rounded-sm ml-4"
        />
      </div>
    </nav>
  );
};

export default Navbar;