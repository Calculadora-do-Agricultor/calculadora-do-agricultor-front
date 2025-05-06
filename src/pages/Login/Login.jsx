import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebaseConfig";
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Alert from '../../components/Alert/Alert';



const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      setError("Por favor, insira seu email.");
      return false;
    }
    if (!password.trim()) {
      setError("Por favor, insira sua senha.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, insira um email válido.");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('authToken', 'logado');
      navigate("/Calculator");
    } catch (error) {
      let errorMessage = "";
      switch (error.code) {
        case "auth/wrong-password":
        case "auth/user-not-found":
          errorMessage = "Email ou senha incorretos.";
          break;
        case "auth/invalid-email":
          errorMessage = "Email inválido.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Muitas tentativas de login. Por favor, tente novamente mais tarde.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
          break;
        default:
          errorMessage = "Ocorreu um erro ao fazer login. Tente novamente.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
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
            required
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

        {error && <Alert type="error" message={error} onClose={() => setError("")} />}
        <button
          type="submit"
          disabled={loading}
          className={`w-40 ${loading ? 'bg-blue-400' : 'bg-blue-700 hover:bg-blue-800'} text-white py-2 rounded-lg font-semibold text-lg transition mx-auto block mt-5`}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
