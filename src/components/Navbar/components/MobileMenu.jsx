import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { handleLogout } from '../../../hooks/useAuthentication';
import { HomeIcon, CalculatorIcon, CogIcon, UserIcon, ArrowRightOnRectangleIcon, UserPlusIcon, ShieldCheckIcon, ClipboardDocumentListIcon, ChevronDownIcon, UsersIcon, BookOpenIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { AuthContext } from '../../../context/AuthContext';

const MobileMenu = ({ user, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const location = useLocation();
  const { isAdmin } = useContext(AuthContext);

  const linkStyle = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center w-full text-left px-4 py-2 transition-all duration-300 transform hover:scale-105 ${isActive ? 'bg-[#FFEE00] text-[#00418F] font-bold' : 'text-white hover:bg-[#FFEE00] hover:text-[#00418F]'}`;
  };

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white p-2 hover:bg-[#FFEE00] hover:text-[#00418F] rounded-lg transition-all duration-300 transform hover:scale-105"
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
        <div className="absolute top-16 right-0 left-0 bg-[#00418F] shadow-lg z-50 border-t-4 border-[#FFEE00]">
          <Link
            to="/"
            className={`${linkStyle('/')} border-b border-[#00418F]/80`}
            onClick={() => setIsOpen(false)}
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Página Inicial
          </Link>

          {/* Menu Dropdown de Ajuda */}
          <div className="border-b border-[#00418F]/80">
            <button
              onClick={() => setHelpMenuOpen(!helpMenuOpen)}
              className={`flex items-center w-full text-left px-4 py-2 transition-all duration-300 transform hover:scale-105 ${(location.pathname === '/glossario' || location.pathname === '/faq') ? 'bg-[#FFEE00] text-[#00418F] font-bold' : 'text-white hover:bg-[#FFEE00] hover:text-[#00418F]'}`}
            >
              <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
              Ajuda
              <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform duration-200 ${helpMenuOpen ? 'transform rotate-180' : ''}`} />
            </button>
            
            {helpMenuOpen && (
              <div className="bg-[#00418F]/80 pl-6">
                <Link
                  to="/glossario"
                  className={`flex items-center w-full text-left px-4 py-2 transition-all duration-300 transform hover:scale-105 ${location.pathname === '/glossario' ? 'bg-[#FFEE00] text-[#00418F] font-bold' : 'text-white hover:bg-[#FFEE00] hover:text-[#00418F]'}`}
                  onClick={() => {
                    setHelpMenuOpen(false);
                    setIsOpen(false);
                  }}
                >
                  <BookOpenIcon className="w-5 h-5 mr-2" />
                  Glossário
                </Link>
                <Link
                  to="/faq"
                  className={`flex items-center w-full text-left px-4 py-2 transition-all duration-300 transform hover:scale-105 ${location.pathname === '/faq' ? 'bg-[#FFEE00] text-[#00418F] font-bold' : 'text-white hover:bg-[#FFEE00] hover:text-[#00418F]'}`}
                  onClick={() => {
                    setHelpMenuOpen(false);
                    setIsOpen(false);
                  }}
                >
                  <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                  FAQ
                </Link>
              </div>
            )}
          </div>

          {user === null ? (
            <>
              <Link
                to="/Login"
                className={`${linkStyle('/Login')} border-b border-[#00418F]/80`}
                onClick={() => setIsOpen(false)}
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                Entrar
              </Link>
              <Link
                to="/Register"
                className={`${linkStyle('/Register')} border-b border-[#00418F]/80`}
                onClick={() => setIsOpen(false)}
              >
                <UserPlusIcon className="w-5 h-5 mr-2" />
                Cadastrar-se
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/calculator"
                className={`${linkStyle('/calculator')} border-b border-[#00418F]/80`}
                onClick={() => setIsOpen(false)}
              >
                <CalculatorIcon className="w-5 h-5 mr-2" />
                Calculadora
              </Link>
              
              {isAdmin && (
                <div className="border-b border-[#00418F]/80">
                  <button
                    onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                    className={`flex items-center w-full text-left px-4 py-2 transition-all duration-300 transform hover:scale-105 ${location.pathname.startsWith('/admin') ? 'bg-[#FFEE00] text-[#00418F] font-bold' : 'text-white hover:bg-[#FFEE00] hover:text-[#00418F]'}`}
                  >
                    <ShieldCheckIcon className="w-5 h-5 mr-2" />
                    Administração
                    <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform duration-200 ${adminMenuOpen ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  {adminMenuOpen && (
                    <div className="bg-[#00418F]/80 pl-6">
                      <Link
                        to="/admin/dashboard"
                        className={`flex items-center w-full text-left px-4 py-2 transition-all duration-300 transform hover:scale-105 ${location.pathname === '/admin/dashboard' ? 'bg-[#FFEE00] text-[#00418F] font-bold' : 'text-white hover:bg-[#FFEE00] hover:text-[#00418F]'}`}
                        onClick={() => {
                          setAdminMenuOpen(false);
                          setIsOpen(false);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
                          <rect width="7" height="9" x="3" y="3" rx="1" />
                          <rect width="7" height="5" x="14" y="3" rx="1" />
                          <rect width="7" height="9" x="14" y="12" rx="1" />
                          <rect width="7" height="5" x="3" y="16" rx="1" />
                        </svg>
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/logs"
                        className={`flex items-center w-full text-left px-4 py-2 transition-all duration-300 transform hover:scale-105 ${location.pathname === '/admin/logs' ? 'bg-[#FFEE00] text-[#00418F] font-bold' : 'text-white hover:bg-[#FFEE00] hover:text-[#00418F]'}`}
                        onClick={() => {
                          setAdminMenuOpen(false);
                          setIsOpen(false);
                        }}
                      >
                        <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                        Gerenciar Logs
                      </Link>
                      <Link
                        to="/admin/users"
                        className={`flex items-center w-full text-left px-4 py-2 transition-all duration-300 transform hover:scale-105 ${location.pathname === '/admin/users' ? 'bg-[#FFEE00] text-[#00418F] font-bold' : 'text-white hover:bg-[#FFEE00] hover:text-[#00418F]'}`}
                        onClick={() => {
                          setAdminMenuOpen(false);
                          setIsOpen(false);
                        }}
                      >
                        <UsersIcon className="w-5 h-5 mr-2" />
                        Gerenciar Usuários
                      </Link>
                      <Link
                        to="/admin/faq"
                        className={`flex items-center w-full text-left px-4 py-2 transition-all duration-300 transform hover:scale-105 ${location.pathname === '/admin/faq' ? 'bg-[#FFEE00] text-[#00418F] font-bold' : 'text-white hover:bg-[#FFEE00] hover:text-[#00418F]'}`}
                        onClick={() => {
                          setAdminMenuOpen(false);
                          setIsOpen(false);
                        }}
                      >
                        <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                        Gerenciar FAQ
                      </Link>
                      <Link
                        to="/admin/data-integrity"
                        className={`flex items-center w-full text-left px-4 py-2 transition-all duration-300 transform hover:scale-105 ${location.pathname === '/admin/data-integrity' ? 'bg-[#FFEE00] text-[#00418F] font-bold' : 'text-white hover:bg-[#FFEE00] hover:text-[#00418F]'}`}
                        onClick={() => {
                          setAdminMenuOpen(false);
                          setIsOpen(false);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                        Integridade de Dados
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              <Link
                to="/Settings"
                className={`${linkStyle('/Settings')} border-b border-[#00418F]/80`}
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
                className="flex items-center w-full text-left px-4 py-2 text-white hover:bg-[#FFEE00] hover:text-[#00418F] transition-all duration-300 transform hover:scale-105 border-b border-[#00418F]/20"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                Sair
              </button>
              <div className="px-4 py-2 text-white font-medium border-t border-[#00418F]/20 mt-2">
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