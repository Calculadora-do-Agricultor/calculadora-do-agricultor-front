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
      localStorage.setItem('authToken', 'logado');
      alert("Login realizado com sucesso!");
      navigate("/Calculator");
    } catch (error) {
      alert("Erro: " + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center bg-white px-4 h-[calc(100vh-64px-40px)]">
          <div className="bg-blue-100 p-12 rounded-2xl shadow-xl w-full max-w-md space-y-3">
          <div className="flex justify-center mb-2">
            <h2 className="text-2xl font-bold text-blue-800 mb-2">Entrar</h2>
          </div>

            <div className="mb-6">
              <h3 className="text-lg text-blue-700 font-semibold">Bem-vindo de volta!</h3>
              <p className="text-sm text-gray-600">Preencha as informações abaixo para entrar:</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
            <div className="relative">
            <input
                type="email"
                placeholder="Email"
                className="w-full p-3 pl-10 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) => setEmail(e.target.value)}
             e="password"
            plac   required
            />

  <EnvelopeIcon className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
</div>
        <div className="relative">
          <input
            typeholder="Senha"
            placeholder="Senha"
            className="w-full p-3 pl-10 pr-10 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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
