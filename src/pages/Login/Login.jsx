"use client";

import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../services/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { Alert } from "../../components";

const Login = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError("Verifique seu e-mail antes de continuar.");
        setIsLoading(false);
        return;
      }

      // Proteção contra log duplicado por sessão
      const sessionId = crypto.randomUUID();
      localStorage.setItem("sessionId", sessionId);

      await addDoc(collection(db, "Logs"), {
        userId: user.uid,
        email: user.email,
        acao: "Login",
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        sessionId: sessionId,
      });

      localStorage.setItem("authToken", "logado");

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

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
          errorMessage =
            "Muitas tentativas de login. Por favor, tente novamente mais tarde.";
          break;
        case "auth/network-request-failed":
          errorMessage =
            "Erro de conexão. Verifique sua internet e tente novamente.";
          break;
        default:
          errorMessage = "Ocorreu um erro ao fazer login. Tente novamente.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      navigate("/Calculator", { replace: true });
    }

    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex h-[calc(100vh-64px-40px)] items-center justify-center bg-white px-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-blue-200 bg-blue-100 p-8 shadow-xl md:p-12">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold text-blue-800">Entrar</h2>
          <div className="mt-3">
            <h3 className="text-lg font-semibold text-blue-700">
              Bem-vindo de volta!
            </h3>
            <p className="text-sm text-gray-600">
              Preencha as informações abaixo para entrar:
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-blue-800"
            >
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                tabIndex="1"
                placeholder="seu@email.com"
                className="w-full rounded-lg border border-gray-400 p-3 pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <EnvelopeIcon className="absolute top-3.5 left-3 h-5 w-5 text-gray-500" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-blue-800"
              >
                Senha
              </label>
              <Link
                to="/recuperar-senha"
                className="text-sm text-blue-600 transition-colors hover:text-blue-800 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                tabIndex="2"
                placeholder="Sua senha"
                className="w-full rounded-lg border border-gray-400 p-3 pr-10 pl-10 transition-all duration-200 hover:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <LockClosedIcon className="absolute top-3.5 left-3 h-5 w-5 text-gray-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3.5 right-3 text-gray-500 transition-colors duration-200 hover:text-blue-600"
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-700 focus:ring-blue-500"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700"
            >
              Lembrar meu email
            </label>
          </div>

          {error && (
            <Alert type="error" message={error} onClose={() => setError("")} />
          )}

          <div className="flex flex-col items-center pt-2">
            <button
              tabIndex="3"
              type="submit"
              disabled={isLoading}
              className={`w-full ${isLoading ? "cursor-not-allowed bg-blue-400" : "bg-blue-700 hover:bg-blue-800"} rounded-lg py-3 text-lg font-semibold text-white transition`}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </div>

          <div className="pt-2 text-center text-sm text-gray-600">
            Não tem uma conta?{" "}
            <Link
              to="/Register"
              className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              Cadastre-se
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
