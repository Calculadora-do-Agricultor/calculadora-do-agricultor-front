import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, CalculatorIcon, CogIcon, ArrowRightOnRectangleIcon, UserPlusIcon, ShieldCheckIcon, ClipboardDocumentListIcon, ChevronDownIcon, UsersIcon, BookOpenIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { AuthContext } from '../../../context/AuthContext';

const NavLinks = ({ user }) => {
  const location = useLocation();
  const { isAdmin } = useContext(AuthContext);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const adminMenuRef = useRef(null);
  const helpMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setAdminMenuOpen(false);
      }
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target)) {
        setHelpMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const linkStyle = (path) => {
    const isActive = location.pathname === path;
    return `flex xl:flex-row flex-col xl:items-center items-center justify-center px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 text-base ${isActive ? 'bg-[#FFEE00] text-[#00418F]' : 'text-white hover:bg-[#FFEE00] hover:text-[#00418F]'}`;
  };

  return (
    <div className="hidden lg:flex items-center xl:space-x-4 space-x-2 text-white h-full">
      <Link className={linkStyle('/')} to="/">
        <HomeIcon className="w-5 h-5 xl:mr-2 xl:mb-0 mb-1" />
        <span className="text-xs xl:text-base text-center">Página Inicial</span>
      </Link>
      
      {/* Menu Dropdown de Ajuda */}
      <div className="relative" ref={helpMenuRef}>
        <button
          onClick={() => setHelpMenuOpen(!helpMenuOpen)}
          className={`flex xl:flex-row flex-col xl:items-center items-center justify-center xl:space-x-2 space-x-0 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 text-base ${(location.pathname === '/glossario' || location.pathname === '/faq') ? 'bg-[#FFEE00] text-[#00418F]' : 'text-white hover:bg-[#FFEE00] hover:text-[#00418F] focus:ring focus:ring-[#FFEE00]'}`}
          aria-haspopup="true"
          aria-expanded={helpMenuOpen}
        >
          <QuestionMarkCircleIcon className="w-5 h-5 xl:mr-0 xl:mb-0 mb-1" />
          <span className="font-medium xl:text-base text-xs text-center">Ajuda</span>
          <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 xl:ml-2 ml-0 xl:mt-0 -mt-1 ${helpMenuOpen ? 'transform rotate-180' : ''}`} />
        </button>

        {helpMenuOpen && (
          <div
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 transition-all duration-300 transform"
            role="menu"
          >
            <Link
              to="/faq"
              className={`block px-4 py-2 transition-all duration-300 transform hover:scale-105 rounded-lg ${location.pathname === '/faq' ? 'bg-[#00418F] text-[#FFEE00]' : 'text-gray-800 hover:bg-[#00418F] hover:text-[#FFEE00]'}`}
              role="menuitem"
              onClick={() => setHelpMenuOpen(false)}
            >
              <div className="flex flex-row items-center gap-2">
                <QuestionMarkCircleIcon className="w-5 h-5" />
                <span>FAQ</span>
              </div>
            </Link>
          </div>
        )}
      </div>
      {user === null ? (
        <>
          <Link className={linkStyle('/Login')} to='/Login'>
            <ArrowRightOnRectangleIcon className="w-5 h-5 xl:mr-2 xl:mb-0 mb-1" />
            <span className="text-xs xl:text-base">Entrar</span>
          </Link>
          <Link className={linkStyle('/Register')} to='/Register'>
            <UserPlusIcon className="w-5 h-5 xl:mr-2 xl:mb-0 mb-1" />
            <span className="text-xs xl:text-base">Cadastrar-se</span>
          </Link>
        </>
      ) : (
        <>
          <Link className={linkStyle('/calculator')} to="/calculator">
            <CalculatorIcon className="w-5 h-5 xl:mr-2 xl:mb-0 mb-1" />
            <span className="text-xs xl:text-base">Calculadora</span>
          </Link>
          
          {isAdmin && (
            <div className="relative" ref={adminMenuRef}>
              <button
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                className={`flex xl:flex-row flex-col xl:items-center items-center justify-center xl:space-x-2 space-x-0 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 text-base ${location.pathname.startsWith('/admin') ? 'bg-[#FFEE00] text-[#00418F]' : 'text-white hover:bg-[#FFEE00] hover:text-[#00418F] focus:ring focus:ring-[#FFEE00]'}`}
                aria-haspopup="true"
                aria-expanded={adminMenuOpen}
              >
                <ShieldCheckIcon className="w-5 h-5 xl:mr-0 xl:mb-0 mb-1" />
                <span className="font-medium xl:text-base text-xs text-center">Administração</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 xl:ml-2 ml-0 xl:mt-0 -mt-1 ${adminMenuOpen ? 'transform rotate-180' : ''}`} />
              </button>

              {adminMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 transition-all duration-300 transform"
                  role="menu"
                >
                  <Link
                    to="/admin/dashboard"
                    className={`block px-4 py-2 transition-all duration-300 transform hover:scale-105 rounded-lg ${location.pathname === '/admin/dashboard' ? 'bg-[#00418F] text-[#FFEE00]' : 'text-gray-800 hover:bg-[#00418F] hover:text-[#FFEE00]'}`}
                    role="menuitem"
                    onClick={() => setAdminMenuOpen(false)}
                  >
                    <div className="flex flex-row items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <rect width="7" height="9" x="3" y="3" rx="1" />
                        <rect width="7" height="5" x="14" y="3" rx="1" />
                        <rect width="7" height="9" x="14" y="12" rx="1" />
                        <rect width="7" height="5" x="3" y="16" rx="1" />
                      </svg>
                      <span>Dashboard</span>
                    </div>
                  </Link>
                  <Link
                    to="/admin/logs"
                    className={`block px-4 py-2 transition-all duration-300 transform hover:scale-105 rounded-lg ${location.pathname === '/admin/logs' ? 'bg-[#00418F] text-[#FFEE00]' : 'text-gray-800 hover:bg-[#00418F] hover:text-[#FFEE00]'}`}
                    role="menuitem"
                    onClick={() => setAdminMenuOpen(false)}
                  >
                    <div className="flex flex-row items-center gap-2">
                      <ClipboardDocumentListIcon className="w-5 h-5" />
                      <span>Gerenciar Logs</span>
                    </div>
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`block px-4 py-2 transition-all duration-300 transform hover:scale-105 rounded-lg ${location.pathname === '/admin/users' ? 'bg-[#00418F] text-[#FFEE00]' : 'text-gray-800 hover:bg-[#00418F] hover:text-[#FFEE00]'}`}
                    role="menuitem"
                    onClick={() => setAdminMenuOpen(false)}
                  >
                    <div className="flex flex-row items-center gap-2">
                      <UsersIcon className="w-5 h-5" />
                      <span>Gerenciar Usuários</span>
                    </div>
                  </Link>
                  <Link
                    to="/admin/faq"
                    className={`block px-4 py-2 transition-all duration-300 transform hover:scale-105 rounded-lg ${location.pathname === '/admin/faq' ? 'bg-[#00418F] text-[#FFEE00]' : 'text-gray-800 hover:bg-[#00418F] hover:text-[#FFEE00]'}`}
                    role="menuitem"
                    onClick={() => setAdminMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <QuestionMarkCircleIcon className="w-5 h-5" />
                      <span>Gerenciar FAQ</span>
                    </div>
                  </Link>
                  <Link
                    to="/admin/data-integrity"
                    className={`block px-4 py-2 transition-all duration-300 transform hover:scale-105 rounded-lg ${location.pathname === '/admin/data-integrity' ? 'bg-[#00418F] text-[#FFEE00]' : 'text-gray-800 hover:bg-[#00418F] hover:text-[#FFEE00]'}`}
                    role="menuitem"
                    onClick={() => setAdminMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      <span>Integridade de Dados</span>
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