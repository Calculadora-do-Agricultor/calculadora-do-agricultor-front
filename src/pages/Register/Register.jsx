import { useState, useContext, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "../../services/firebaseConfig";
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import Alert from "../../components/Alert/Alert";
import TermsOfUseModal from "../../components/TermsOfUseModal";
import useLocationLogger from "../../hooks/useLocationLogger";

const Register = () => {
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role] = useState("user");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [formTouched, setFormTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Hook para gerenciar logs de localização
  const { locationPermission, logUserRegistration, isLogging } =
    useLocationLogger();

  // Password validation states
  const hasMinLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  const validateForm = () => {
    if (!name.trim()) {
      setErrorMessage("Por favor, insira seu nome.");
      return false;
    }

    if (!email.trim()) {
      setErrorMessage("Por favor, insira seu email.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Por favor, insira um email válido.");
      return false;
    }

    if (!password.trim()) {
      setErrorMessage("Por favor, insira uma senha.");
      return false;
    }

    if (password.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      setErrorMessage("A senha deve conter pelo menos uma letra maiúscula.");
      return false;
    }

    if (!/[0-9]/.test(password)) {
      setErrorMessage("A senha deve conter pelo menos um número.");
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return false;
    }

    return true;
  };

  const [
    createUserWithEmailAndPassword,
    firebaseUser,
    firebaseLoading,
    firebaseError,
  ] = useCreateUserWithEmailAndPassword(auth);

  // useEffect para redirecionar se o usuário já estiver autenticado
  useEffect(() => {
    if (!authLoading && authUser) {
      navigate("/Calculator", { replace: true });
    }
  }, [authUser, authLoading, navigate]);

  const handleInputFocus = (field) => {
    setFormTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Função para processar o registro após a decisão sobre a localização
  const processRegistration = async (shouldRequestLocation) => {
    try {
      setIsLoading(true);
      console.log('Iniciando processRegistration, shouldRequestLocation:', shouldRequestLocation);
      
      // Verificar se temos os dados de registro
      if (!registrationData) {
        throw new Error("Dados de registro não encontrados");
      }
      
      // Primeiro, criar o usuário no Firebase Authentication
      const result = await createUserWithEmailAndPassword(
        registrationData.email,
        registrationData.password,
      );

      if (!result) {
        throw new Error("Falha no cadastro do usuário");
      }

      console.log("Cadastro realizado com sucesso!", result.user);
      const uid = result.user.uid;

      // Salvar os dados do usuário no Firestore
      await setDoc(doc(db, "users", uid), {
        name: registrationData.name,
        email: registrationData.email,
        createdAt: new Date(),
        role: "user",
        env: import.meta.env.VITE_ENV || "dev",
      });

      // Registrar o log de usuário com ou sem localização
      try {
        console.log('Registrando log de usuário com ID:', uid, 'Aceitou localização:', shouldRequestLocation);
        await logUserRegistration(uid, shouldRequestLocation);
      } catch (logError) {
        console.error('Erro ao registrar log:', logError);
        // Mesmo com erro no log, continuamos o fluxo de registro
      }

      localStorage.setItem("authToken", "logado");
      navigate("/Calculator");
      console.log("Usuário registrado e salvo no Firestore.");
    } catch (err) {
      let errorMsg;
      switch (err.code) {
        case "auth/email-already-in-use":
          errorMsg = "Email já cadastrado. Use outro email ou faça login.";
          break;
        case "auth/invalid-email":
          errorMsg = "Email inválido. Verifique o formato.";
          break;
        case "auth/network-request-failed":
          errorMsg = "Erro de conexão. Verifique sua internet.";
          break;
        case "auth/weak-password":
          errorMsg =
            "Senha fraca. Use 6+ caracteres, letras maiúsculas e números.";
          break;
        case "auth/operation-not-allowed":
          errorMsg = "Cadastro temporariamente indisponível.";
          break;
        case "auth/too-many-requests":
          errorMsg = "Muitas tentativas. Aguarde alguns minutos.";
          break;
        default:
          errorMsg =
            "Erro no cadastro. Tente novamente ou contate o suporte.";
      }
      setErrorMessage(errorMsg);
      console.error("Erro ao processar registro:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    // Armazenar os dados de registro para uso após a permissão de localização
    setRegistrationData({ name, email, password });

    // Mostrar o modal de termos de uso
    setShowTermsModal(true);
    setIsLoading(false);
  };

  // Handlers para o modal de termos de uso
  const handleAcceptTerms = async (acceptedLocationSharing) => {
    try {
      setIsProcessing(true);
      console.log('Usuário aceitou os termos. Compartilhar localização:', acceptedLocationSharing);
      
      // Fechando o modal antes de processar o registro
      setShowTermsModal(false);
      // Processa o registro com a escolha de localização do usuário
      await processRegistration(acceptedLocationSharing);
    } catch (error) {
      console.error('Erro ao processar registro:', error);
      setShowTermsModal(false);
      // Em caso de erro, continua sem localização
      await processRegistration(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineTerms = async () => {
    setShowTermsModal(false);
    setIsLoading(false);
    // Usuário recusou os termos, não prosseguimos com o registro
  };

  const handleCloseTermsModal = () => {
    setShowTermsModal(false);
    setIsLoading(false);
  };

  if (firebaseLoading || isLoading || isProcessing || isLogging) {
    return (
      <div className="flex h-[calc(100vh-64px-40px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-700"></div>
          <p className="mt-4 font-medium text-blue-800">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px-40px)] items-center justify-center bg-white px-4 py-8">
      {/* Modal de termos de uso */}
      <TermsOfUseModal
        isOpen={showTermsModal}
        onClose={handleCloseTermsModal}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
      />
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-blue-200 bg-blue-100 p-8 shadow-xl md:p-12">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold text-blue-800">Cadastre-se</h2>
          <div className="mt-3">
            <h3 className="text-lg font-semibold text-blue-700">
              Bem-vindo à Calculadora do Agricultor!
            </h3>
            <p className="text-sm text-gray-600">
              Preencha os dados abaixo para criar sua conta.
            </p>
          </div>
        </div>

          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-blue-800"
              >
                Nome
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  value={name}
                  placeholder="Seu nome completo"
                  className="w-full rounded-lg border border-gray-400 p-3 pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => handleInputFocus("name")}
                  required
                />
                <UserIcon className="absolute top-3.5 left-3 h-5 w-5 text-gray-500" />
              </div>
            </div>

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
                  placeholder="seu@email.com"
                  className="w-full rounded-lg border border-gray-400 p-3 pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => handleInputFocus("email")}
                  required
                />
                <EnvelopeIcon className="absolute top-3.5 left-3 h-5 w-5 text-gray-500" />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-blue-800"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Sua senha"
                  className="w-full rounded-lg border border-gray-400 p-3 pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => handleInputFocus("password")}
                  required
                />
                <LockClosedIcon className="absolute top-3.5 left-3 h-5 w-5 text-gray-500" />
                <button
                  type="button"
                  className="absolute top-3.5 right-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {formTouched.password && (
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex items-center">
                    {hasMinLength ? (
                      <CheckCircleIcon className="mr-1 h-4 w-4 text-green-500" />
                    ) : (
                      <XCircleIcon className="mr-1 h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`${hasMinLength ? "text-green-600" : "text-red-600"}`}
                    >
                      Mínimo de 6 caracteres
                    </span>
                  </div>
                  <div className="flex items-center">
                    {hasUpperCase ? (
                      <CheckCircleIcon className="mr-1 h-4 w-4 text-green-500" />
                    ) : (
                      <XCircleIcon className="mr-1 h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`${hasUpperCase ? "text-green-600" : "text-red-600"}`}
                    >
                      Pelo menos uma letra maiúscula
                    </span>
                  </div>
                  <div className="flex items-center">
                    {hasNumber ? (
                      <CheckCircleIcon className="mr-1 h-4 w-4 text-green-500" />
                    ) : (
                      <XCircleIcon className="mr-1 h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`${hasNumber ? "text-green-600" : "text-red-600"}`}
                    >
                      Pelo menos um número
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-blue-800"
              >
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  placeholder="Confirme sua senha"
                  className="w-full rounded-lg border border-gray-400 p-3 pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => handleInputFocus("confirmPassword")}
                  required
                />
                <LockClosedIcon className="absolute top-3.5 left-3 h-5 w-5 text-gray-500" />
                <button
                  type="button"
                  className="absolute top-3.5 right-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formTouched.confirmPassword && (
                <div className="mt-2 flex items-center text-xs">
                  {passwordsMatch ? (
                    <>
                      <CheckCircleIcon className="mr-1 h-4 w-4 text-green-500" />
                      <span className="text-green-600">Senhas coincidem</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="mr-1 h-4 w-4 text-red-500" />
                      <span className="text-red-600">Senhas não coincidem</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {errorMessage && <Alert message={errorMessage} type="error" />}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-700 px-4 py-3 text-center font-medium text-white shadow-md transition-all duration-300 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : "Cadastrar"}
              </button>
            </div>

            <div className="mt-4 text-center text-sm">
              <span className="text-gray-600">Já tem uma conta?</span>{" "}
              <Link
                to="/login"
                className="font-medium text-blue-700 hover:text-blue-800"
              >
                Faça login
              </Link>
            </div>
          </form>
      </div>
    </div>
  );
};

export default Register;


  // Função para processar o registro
  const processRegistration = async (data, acceptedLocationSharing = false) => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      // Criar usuário no Firebase Authentication
      const res = await createUser(data.email, data.password);
      const { uid } = res.user;

      // Criar documento do usuário no Firestore
      await insertDocument({
        name: data.name,
        email: data.email,
        uid,
        createdAt: new Date(),
      });

      // Registrar log de registro com localização se aceito
      try {
        console.log('Registrando log de usuário com ID:', uid, 'Aceitou localização:', acceptedLocationSharing);
        await logUserRegistration(uid, acceptedLocationSharing);
      } catch (logError) {
        console.error('Erro ao registrar log:', logError);
        // Continuar com o registro mesmo se houver erro no log
      }

      // Limpar formulário e redirecionar
      reset();
      setIsLoading(false);
      navigate('/login');
    } catch (error) {
      console.error('Erro durante o registro:', error);
      setErrorMessage(getErrorMessage(error.message));
      setIsLoading(false);
    }
  };
