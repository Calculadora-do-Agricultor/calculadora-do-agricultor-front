import React, { useState } from "react";
import { doc, setDoc } from 'firebase/firestore';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth, db } from "../../services/firebaseConfig";
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import Alert from '../../components/Alert/Alert';

const Register = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      setErrorMessage('Por favor, insira seu nome.');
      return false;
    }

    if (!email.trim()) {
      setErrorMessage('Por favor, insira seu email.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Por favor, insira um email válido.');
      return false;
    }

    if (!password.trim()) {
      setErrorMessage('Por favor, insira uma senha.');
      return false;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      setErrorMessage('A senha deve conter pelo menos uma letra maiúscula.');
      return false;
    }

    if (!/[0-9]/.test(password)) {
      setErrorMessage('A senha deve conter pelo menos um número.');
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return false;
    }

    return true;
  };

  const [createUserWithEmailAndPassword, user, authLoading, error] = useCreateUserWithEmailAndPassword(auth);

  const handleRegister = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

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
      let errorMsg;
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMsg = "Este email já está em uso.";
          break;
        case 'auth/invalid-email':
          errorMsg = "Email inválido.";
          break;
        case 'auth/network-request-failed':
          errorMsg = "Erro de conexão. Verifique sua internet e tente novamente.";
          break;
        case 'auth/weak-password':
          errorMsg = "A senha é muito fraca. Tente uma senha mais forte.";
          break;
        default:
          errorMsg = "Erro ao criar conta. Tente novamente.";
      }
      setErrorMessage(errorMsg);
      console.error("Erro ao salvar no Firestore:", err);
    } finally {
      setLoading(false);
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
            className="w-full p-3 pl-10 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setName(e.target.value)}
            required
          />
          <UserIcon className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
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
            minLength={6}
          />
          <LockClosedIcon className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
        </div>

        <div className="relative">
          <input
            type="password"
            placeholder="Confirme a Senha"
            className="w-full p-3 pl-10 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
          <LockClosedIcon className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
        </div>

        {errorMessage && <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />}

        <button
          type="submit"
          disabled={loading}
          className={`w-40 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'} text-white py-2 rounded-lg font-semibold text-lg transition mx-auto block mt-5`}
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
    </div>
  );
};

export default Register;
