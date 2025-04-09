import React, { useState } from "react";
import { useEffect } from "react";
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from "../../sevices/firebaseConfig";
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const [createUserWithEmailAndPassword, user, loading, error,]
    = useCreateUserWithEmailAndPassword(auth);

  function handleSignOut(e) {
    e.preventDefault();
    createUserWithEmailAndPassword(email, password)
  }

  if (loading) {
    return <p>carregando...</p>
  }

  return (
    <div className="flex items-center justify-center bg-white px-4 h-[calc(100vh-64px-40px)]">
      <form className="bg-blue-100 p-12 rounded-2xl shadow-xl w-full max-w-md space-y-3">
        <h2 className="text-2xl font-bold text-blue-800 text-center">Cadastre-se</h2>
        <div className="mb-6">
          <h3 className="text-lg text-blue-700 font-semibold">Bem-vindo à Calculadora do Agricultor!</h3>
          <p className="text-sm text-gray-600">Preencha os dados abaixo para criar sua conta.</p>
        </div>

        <div className="relative">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 pl-10 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <EnvelopeIcon className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
        </div>

        <div className="relative">
          <input
            type="password"
            placeholder="Senha"
            className="w-full p-3 pl-10 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <LockClosedIcon className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
        </div>

        <button
          type="submit"
          className="w-40 bg-blue-700 text-white py-2 rounded-lg font-semibold text-lg hover:bg-blue-800 transition mx-auto block mt-5"
          onClick={handleSignOut}
        >
          Entrar
        </button>
      </form>
    </div>

  );
};

export default Register;