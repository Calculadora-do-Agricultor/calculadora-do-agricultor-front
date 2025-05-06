import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, CalculatorIcon, CogIcon, ArrowRightOnRectangleIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const NavLinks = ({ user }) => {
  const location = useLocation();

  const linkStyle = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 text-base ${isActive ? 'bg-yellow-400' : 'hover:bg-yellow-500 focus:ring focus:ring-yellow-300'}`;
  };

  return (
    <div className="hidden lg:flex items-center space-x-4 text-white h-full">
      <Link className={linkStyle('/')} to="/">
        <HomeIcon className="w-5 h-5 mr-2" />
        Página Inicial
      </Link>
      {user === null ? (
        <>
          <Link className={linkStyle('/Login')} to='/Login'>
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
            Entrar
          </Link>
          <Link className={linkStyle('/Register')} to='/Register'>
            <UserPlusIcon className="w-5 h-5 mr-2" />
            Cadastre-se
          </Link>
        </>
      ) : (
        <>
          <Link className={linkStyle('/calculator')} to="/calculator">
            <CalculatorIcon className="w-5 h-5 mr-2" />
            Calculadora
          </Link>
        </>
      )}
    </div>
  );
};

export default NavLinks;