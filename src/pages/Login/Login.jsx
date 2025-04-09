import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../sevices/firebaseConfig";
import { EnvelopeIcon,  LockClosedIcon } from '@heroicons/react/24/outline';



const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login realizado com sucesso!");
      navigate("/");
    } catch (error) {
      alert("Erro: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white]">
      <div className="bg-blue-100 p-8 rounded-2xl shadow-xl w-full max-w-sm">
      <div className="flex justify-center mb-4">
        <h2 className="text-2xl font-bold text-blue-800 mb-2">Entrar</h2>
      </div>


        <div className="mb-6">
          <h3 className="text-blue-700 font-semibold text-sm">Bem-vindo de volta!</h3>
          <p className="text-sm text-gray-600">Preencha as informações abaixo para entrar:</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
        <div className="relative">
        <input
            type="email"
            placeholder="Email"
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setEmail(e.target.value)}
            required
         />

  <EnvelopeIcon className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
</div>
        <div className="relative">
          <input
            type="password"
            placeholder="Senha"
            className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <LockClosedIcon className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
        </div>

        <button
          type="submit"
          className="w-40 bg-blue-700 text-white py-2 rounded-lg font-semibold text-lg hover:bg-blue-800 transition mx-auto block mt-5"
          >
          Entrar
        </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
