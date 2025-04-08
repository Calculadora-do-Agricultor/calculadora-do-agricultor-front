import React from "react";
import { useState } from "react";
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from "../../sevices/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { setUserProperties } from "firebase/analytics";

const Register =() => {
    const navigate = useNavigate();
    const[email, setEmail] = useState('');
    const[password, setPassword] = useState('');

    
    const[createUserWithEmailAndPassword,user,loading,error,]
    = useCreateUserWithEmailAndPassword(auth);

    function handleSignOut(e){
        e.preventDefault();
        createUserWithEmailAndPassword(email,password )
    }

    if(loading){
        return <p>carregando...</p>
    }
    
  return(
    <form className="p-4 justify-center max-w-sm mx-auto mt-10 bg-blue-100 shadow rounded">
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
    <button
      type="submit"
      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      onClick={handleSignOut}
    >
      Entrar
    </button>
  </form>
    );
};  

  export default Register;