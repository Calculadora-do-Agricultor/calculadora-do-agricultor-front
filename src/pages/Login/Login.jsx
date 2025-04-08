import React from "react";
import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../../sevices/firebaseConfig";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      alert("Login realizado com sucesso!");
      console.log(user);
      navigate("/");
    } catch (error) {
      console.log("Erro ao fazer login:", error.message);
      alert("Erro: " + error.message);
    }
  };
  return (
    <form onSubmit={handleLogin} className="p-4 justify-center max-w-sm mx-auto mt-10 bg-blue-100 shadow rounded">
      <h2 className="text-lg font-bold mb-4 text-center">Login</h2>
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
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Entrar
      </button>
    </form>
  );
};

export default Login;