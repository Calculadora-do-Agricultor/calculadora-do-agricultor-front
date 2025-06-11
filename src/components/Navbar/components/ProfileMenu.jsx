import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { handleLogout } from '../../../hooks/useAuthentication';
import BrazilFlag from "../../BrazilFlag";
import { ChevronDownIcon, UserIcon, CogIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const ProfileMenu = ({ userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 text-base ${location.pathname === '/Settings' ? 'bg-[#FFEE00] text-[#00418F]' : 'text-white hover:bg-[#FFEE00] hover:text-[#00418F] focus:ring focus:ring-[#FFEE00]'}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <UserIcon className="w-5 h-5" />
        <span className="font-medium">Olá {userName}!</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 transition-all duration-300 transform"
          role="menu"
        >
          <Link
            to="/Settings"
            className={`flex items-center gap-2 px-4 py-2 transition-all duration-300 transform hover:scale-105 rounded-lg ${location.pathname === '/Settings' ? 'bg-[#00418F] text-[#FFEE00]' : 'text-gray-800 hover:bg-[#00418F] hover:text-[#FFEE00]'}`}
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            <CogIcon className="w-5 h-5" />
            <span>Configurações</span>
          </Link>
          <div className="block px-4 py-2 text-gray-800 hover:bg-[#00418F] hover:text-[#FFEE00] transition-all duration-300 transform hover:scale-105 rounded-lg cursor-pointer">
            <div className="flex items-center gap-2">
              <BrazilFlag width="20" height="20" />
              <span>Português (Brasil)</span>
            </div>
          </div>
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-800 hover:bg-[#00418F] hover:text-[#FFEE00] transition-all duration-300 transform hover:scale-105 rounded-lg"
            role="menuitem"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;