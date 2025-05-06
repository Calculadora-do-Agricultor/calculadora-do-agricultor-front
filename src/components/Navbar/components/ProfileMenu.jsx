import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { handleLogout } from '../../../hooks/useAuthentication';
import { BrazilFlag } from '../../../components/BrazilFlag';

const ProfileMenu = ({ userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

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
        className="flex items-center space-x-2 text-white px-3 py-1 rounded-lg hover:bg-yellow-500 transition duration-200"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="font-medium">Olá {userName}!</span>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50"
          role="menu"
        >
          <Link
            to="/profile"
            className="block px-4 py-2 text-gray-800 hover:bg-yellow-100 transition duration-200"
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            Ver Perfil
          </Link>
          <Link
            to="/Settings"
            className="block px-4 py-2 text-gray-800 hover:bg-yellow-100 transition duration-200"
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            Configurações
          </Link>
          <div className="block px-4 py-2 text-gray-800 hover:bg-yellow-100 transition duration-200 cursor-pointer">
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
            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-yellow-100 transition duration-200"
            role="menuitem"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;