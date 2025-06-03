import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, CalculatorIcon, CogIcon, ArrowRightOnRectangleIcon, UserPlusIcon, ShieldCheckIcon, ClipboardDocumentListIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { AuthContext } from '../../../context/AuthContext';

const NavLinks = ({ user }) => {
  const location = useLocation();
  const { isAdmin } = useContext(AuthContext);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setAdminMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const linkStyle = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 text-base ${isActive ? 'bg-[#FFEE00] text-[#00418F]' : 'text-white hover:bg-[#FFEE00] hover:text-[#00418F]'}`;
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
          
          {isAdmin && (
            <div className="relative" ref={adminMenuRef}>
              <button
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 text-base ${location.pathname.startsWith('/admin') ? 'bg-[#FFEE00] text-[#00418F]' : 'text-white hover:bg-[#FFEE00] hover:text-[#00418F] focus:ring focus:ring-[#FFEE00]'}`}
                aria-haspopup="true"
                aria-expanded={adminMenuOpen}
              >
                <ShieldCheckIcon className="w-5 h-5" />
                <span className="font-medium">Administração</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${adminMenuOpen ? 'transform rotate-180' : ''}`} />
              </button>

              {adminMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 transition-all duration-300 transform"
                  role="menu"
                >
                  <Link
                    to="/admin/logs"
                    className="block px-4 py-2 text-gray-800 hover:bg-[#00418F] hover:text-[#FFEE00] transition-all duration-300 transform hover:scale-105 rounded-lg"
                    role="menuitem"
                    onClick={() => setAdminMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardDocumentListIcon className="w-5 h-5" />
                      <span>Gerenciar Logs</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NavLinks;