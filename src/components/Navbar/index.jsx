import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoClara from '../../assets/logoClara.svg';
import { authWrapper, firestoreWrapper } from '../../services/firebaseWrapper';

import { NavLinks, ProfileMenu, MobileMenu } from './components';

const Navbar = () => {
  const [userName, setUserName] = useState('');
  // user precisa ser um estado ou ser observado se authWrapper.getCurrentUser() não for síncrono.
  // Se for assíncrono ou se mudar, considere usar um useEffect para setar 'user'.
  // Por simplicidade, assumimos que getCurrentUser() retorna o user de forma síncrona ou null.
  const user = authWrapper.getCurrentUser();

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        try {
          const userData = await firestoreWrapper.getDocument('users', user.uid);
          if (userData) {
            setUserName(userData.name);
          } else {
            setUserName(''); // Limpar nome se o documento do usuário não for encontrado
          }
        } catch (error) {
          console.error('Erro ao buscar nome do usuário:', error);
          setUserName(''); // Limpar nome em caso de erro
        }
      } else {
        setUserName(''); // Limpar nome se não houver usuário logado
      }
    };

    fetchUserName();
  }, [user]); // Dependência em 'user' para re-executar quando o estado de autenticação mudar

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
        {user !== null && <div className="hidden lg:block"><ProfileMenu userName={userName} /></div>}
        <MobileMenu user={user} userName={userName} />
      </div>
    </nav>
  );
};

export default Navbar;