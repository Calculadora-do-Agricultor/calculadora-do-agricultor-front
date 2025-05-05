import React, { useState } from "react";
import { doc, setDoc } from 'firebase/firestore';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth, db } from "../../services/firebaseConfig";
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [errorMessage, setErrorMessage] = useState('');

  const [createUserWithEmailAndPassword, user, loading, error] = useCreateUserWithEmailAndPassword(auth);

  const handleRegister = async (e) => {
    e.preventDefault();

    setErrorMessage('');

    try {
      const result = await createUserWithEmailAndPassword(email, password);
      console.log("Cadastro realizado com sucesso!", result.user);

      if (result && result.user) {
        const uid = result.user.uid;
        
        await setDoc(doc(db, "users", uid), {
          name: name,
          email: email,
          createdAt: new Date(),
          role: "user", 
          env: import.meta.env.VITE_ENV || "dev"
        });

        console.log("Usuário registrado e salvo no Firestore.");
      }
    } catch (err) {
      setErrorMessage("Erro ao criar conta. Tente novamente.");
      console.error("Erro ao salvar no Firestore:", err);
    }
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="flex items-center justify-center bg-white px-4 h-[calc(100vh-64px-40px)]">
      <form
        className="bg-blue-100 p-12 rounded-2xl shadow-xl w-full max-w-md space-y-3"
        onSubmit={handleRegister}
      >
        <h2 className="text-2xl font-bold text-blue-800 text-center">Cadastre-se</h2>
        <div className="mb-6">
          <h3 className="text-lg text-blue-700 font-semibold">Bem-vindo à Calculadora do Agricultor!</h3>
          <p className="text-sm text-gray-600">Preencha os dados abaixo para criar sua conta.</p>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Nome"
            className="w-full p-3 pl-4 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setName(e.target.value)}
            required
          />
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

        {errorMessage && (
          <div className="text-red-500 text-center mt-2">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          className="w-40 bg-blue-700 text-white py-2 rounded-lg font-semibold text-lg hover:bg-blue-800 transition mx-auto block mt-5"
        >
          Registrar
        </button>
      </form>
    </div>
  );
};

export default Register;
