import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { handleLogout } from '../../../hooks/useAuthentication';
import { HomeIcon, CalculatorIcon, CogIcon, UserIcon, ArrowRightOnRectangleIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const MobileMenu = ({ user, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const linkStyle = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center w-full text-left px-4 py-2 transition-all duration-300 transform hover:scale-105 text-white ${isActive ? 'bg-yellow-400 text-black font-bold' : 'hover:bg-yellow-500 hover:text-black'}`;
  };

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white p-2 hover:bg-yellow-500 rounded-lg transition duration-200"
        aria-label="Menu de navegação"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-16 right-0 left-0 bg-blue-900 shadow-lg z-50 border-t-4 border-yellow-400">
          <Link
            to="/"
            className={`${linkStyle('/')} border-b border-blue-800`}
            onClick={() => setIsOpen(false)}
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Página Inicial
          </Link>

          {user === null ? (
            <>
              <Link
                to="/Login"
                className={`${linkStyle('/Login')} border-b border-blue-800`}
                onClick={() => setIsOpen(false)}
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                Entrar
              </Link>
              <Link
                to="/Register"
                className={`${linkStyle('/Register')} border-b border-blue-800`}
                onClick={() => setIsOpen(false)}
              >
                <UserPlusIcon className="w-5 h-5 mr-2" />
                Cadastre-se
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/calculator"
                className={`${linkStyle('/calculator')} border-b border-blue-800`}
                onClick={() => setIsOpen(false)}
              >
                <CalculatorIcon className="w-5 h-5 mr-2" />
                Calculadora
              </Link>
              <Link
                to="/Settings"
                className={`${linkStyle('/Settings')} border-b border-blue-800`}
                onClick={() => setIsOpen(false)}
              >
                <CogIcon className="w-5 h-5 mr-2" />
                Configurações
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="flex items-center w-full text-left px-4 py-2 text-white hover:bg-yellow-500 hover:text-black transition-all duration-300 transform hover:scale-105 border-b border-blue-800"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                Sair
              </button>
              <div className="px-4 py-2 text-white font-medium border-t border-blue-800 mt-2">
                Olá {userName}!
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileMenu;