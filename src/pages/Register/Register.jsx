import React, { useState } from "react";
import { useEffect } from "react";
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from "../../sevices/firebaseConfig";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [
    createUserWithEmailAndPassword,
    user,
    loading,
    error,
  ] = useCreateUserWithEmailAndPassword(auth);

  const handleRegister = async (e) => {
    e.preventDefault();
    await createUserWithEmailAndPassword(email, password);

   
  };

  useEffect(() => {
    if (user) {
      alert("Conta criada com sucesso!");
      navigate("/login"); // ou para onde você quiser redirecionar
    }
  }, [user]);
  
  return (
    <form onSubmit={handleRegister} className="p-4 justify-center max-w-sm mx-auto mt-10 bg-blue-100 shadow rounded">
      <h2 className="text-lg font-bold mb-4 text-center">Registro</h2>
      <input
        type="email"
        placeholder="E-mail"
        className="w-full mb-3 p-2 border border-gray-400 rounded"
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Senha"
        className="w-full mb-3 p-2 border border-gray-400 rounded"
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {}
      {error?.code === "auth/email-already-in-use" && (
        <p className="text-red-500 text-sm mb-3">
          Este e-mail já está em uso. Faça login ou use outro.
        </p>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Carregando..." : "Registrar"}
      </button>
    </form>
  );
};

export default Register;
