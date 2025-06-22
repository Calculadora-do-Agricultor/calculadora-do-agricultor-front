import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "@/services/firebaseConfig";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Button,
  AuthAlert,
} from "../../components/ui";
import { TermsOfUseModal } from "@/components";
import useLocationLogger from "@/hooks/useLocationLogger";

// Schema de validação com Zod
const registerSchema = z.object({
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  email: z.string()
    .email("Email inválido")
    .min(1, "Email é obrigatório"),
  password: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
  confirmPassword: z.string()
    .min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

const Register = () => {
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading } = useContext(AuthContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);

  // Hook para gerenciar logs de localização
  const { locationPermission, logUserRegistration, isLogging } = useLocationLogger();

  // Hook do Firebase para criação de usuário
  const [createUserWithEmailAndPassword, firebaseUser, firebaseLoading, firebaseError] = 
    useCreateUserWithEmailAndPassword(auth);

  // Configuração do formulário com react-hook-form e Zod
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // Observar valores do formulário para validações em tempo real
  const watchedPassword = form.watch("password");
  const watchedConfirmPassword = form.watch("confirmPassword");

  // Validações visuais da senha
  const hasMinLength = watchedPassword?.length >= 6;
  const hasUpperCase = /[A-Z]/.test(watchedPassword || "");
  const hasNumber = /[0-9]/.test(watchedPassword || "");
  const passwordsMatch = watchedPassword === watchedConfirmPassword && watchedConfirmPassword !== "";

  // useEffect para redirecionar se o usuário já estiver autenticado
  useEffect(() => {
    if (!authLoading && authUser) {
      navigate("/Calculator", { replace: true });
    }
  }, [authUser, authLoading, navigate]);

  // Função para processar o registro após a decisão sobre a localização
  const processRegistration = async (shouldRequestLocation) => {
    try {
      setIsLoading(true);
      console.log("Iniciando processRegistration, shouldRequestLocation:", shouldRequestLocation);

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
        preferences: {
          theme: "light",
          hideFooter: false,
          language: "pt-BR",
          notifications: {
            email: true,
            push: true,
            marketing: false
          },
          accessibility: {
            highContrast: false,
            fontSize: "medium",
            reducedMotion: false
          },
          privacy: {
            shareLocation: false,
            shareUsageData: true,
            profileVisibility: "private"
          }
        },
      });

      // Registrar o log de usuário com ou sem localização
      try {
        console.log(
          "Registrando log de usuário com ID:",
          uid,
          "Aceitou localização:",
          shouldRequestLocation,
        );
        await logUserRegistration(uid, shouldRequestLocation);
      } catch (logError) {
        console.error("Erro ao registrar log:", logError);
        // Mesmo com erro no log, continuamos o fluxo de registro
      }

      localStorage.setItem("authToken", "logado");
      navigate("/Calculator");
      console.log("Usuário registrado e salvo no Firestore.");
    } catch (error) {
      // Log do erro para monitoramento de segurança
      console.error('Registration processing error:', {
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
        email: registrationData?.email
      });
      
      setErrorCode(error.code || 'default');
      setErrorMessage("Erro de cadastro");
      console.error("Erro ao processar registro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (values) => {
    try {
      setErrorMessage("");
      setErrorCode("");
      setIsLoading(true);

      // Armazenar os dados de registro para uso após a permissão de localização
      setRegistrationData({
        name: values.name,
        email: values.email,
        password: values.password
      });

      // Mostrar o modal de termos de uso
      setShowTermsModal(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Registration error:', {
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
        email: values.email
      });
      
      setErrorCode(error.code);
      setErrorMessage("Erro de cadastro");
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers para o modal de termos de uso
  const handleAcceptTerms = async (acceptedLocationSharing) => {
    try {
      setIsProcessing(true);
      console.log(
        "Usuário aceitou os termos. Compartilhar localização:",
        acceptedLocationSharing,
      );

      // Fechando o modal antes de processar o registro
      setShowTermsModal(false);
      // Processa o registro com a escolha de localização do usuário
      await processRegistration(acceptedLocationSharing);
    } catch (error) {
      console.error("Erro ao processar registro:", error);
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

  if (firebaseLoading || isProcessing || isLogging) {
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
    <div className="min-h-[calc(100vh-64px-40px)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-8">
      {/* Modal de termos de uso */}
      <TermsOfUseModal
        isOpen={showTermsModal}
        onClose={handleCloseTermsModal}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
      />
      
      <div className="w-full max-w-md">
        {/* Card principal com glassmorphism */}
        <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UserPlusIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Cadastre-se
              </h1>
              <p className="text-gray-600 mt-2">
                Crie sua conta na Calculadora do Agricultor
              </p>
            </div>
          </div>

          {/* Formulário */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
              {/* Campo Nome */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Nome Completo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Seu nome completo"
                          {...field}
                          className={cn(
                            "pl-10 h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20",
                            "hover:border-gray-400 bg-white/50"
                          )}
                          disabled={isLoading}
                        />
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              {/* Campo Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          {...field}
                          className={cn(
                            "pl-10 h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20",
                            "hover:border-gray-400 bg-white/50"
                          )}
                          disabled={isLoading}
                        />
                        <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              {/* Campo Senha */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Sua senha"
                          {...field}
                          className={cn(
                            "pl-10 pr-10 h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20",
                            "hover:border-gray-400 bg-white/50"
                          )}
                          disabled={isLoading}
                        />
                        <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:text-blue-600"
                          aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    
                    {/* Indicadores de validação da senha */}
                    {watchedPassword && (
                      <div className="mt-2 space-y-1 text-xs">
                        <div className="flex items-center">
                          {hasMinLength ? (
                            <CheckCircleIcon className="mr-1 h-4 w-4 text-green-500" />
                          ) : (
                            <XCircleIcon className="mr-1 h-4 w-4 text-red-500" />
                          )}
                          <span className={hasMinLength ? "text-green-600" : "text-red-600"}>
                            Mínimo de 6 caracteres
                          </span>
                        </div>
                        <div className="flex items-center">
                          {hasUpperCase ? (
                            <CheckCircleIcon className="mr-1 h-4 w-4 text-green-500" />
                          ) : (
                            <XCircleIcon className="mr-1 h-4 w-4 text-red-500" />
                          )}
                          <span className={hasUpperCase ? "text-green-600" : "text-red-600"}>
                            Pelo menos uma letra maiúscula
                          </span>
                        </div>
                        <div className="flex items-center">
                          {hasNumber ? (
                            <CheckCircleIcon className="mr-1 h-4 w-4 text-green-500" />
                          ) : (
                            <XCircleIcon className="mr-1 h-4 w-4 text-red-500" />
                          )}
                          <span className={hasNumber ? "text-green-600" : "text-red-600"}>
                            Pelo menos um número
                          </span>
                        </div>
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Campo Confirmar Senha */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Confirmar Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirme sua senha"
                          {...field}
                          className={cn(
                            "pl-10 pr-10 h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20",
                            "hover:border-gray-400 bg-white/50"
                          )}
                          disabled={isLoading}
                        />
                        <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:text-blue-600"
                          aria-label={showConfirmPassword ? "Esconder senha" : "Mostrar senha"}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    
                    {/* Indicador de confirmação de senha */}
                    {watchedConfirmPassword && (
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
                    
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              {/* Alert de Erro */}
              {errorMessage && (
                <AuthAlert 
                  errorCode={errorCode} 
                  context="register"
                  onClose={() => {
                    setErrorMessage("");
                    setErrorCode("");
                  }} 
                />
              )}

              {/* Botão de Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
                  "text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]",
                  "shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                  "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Cadastrando...</span>
                  </div>
                ) : (
                  "Cadastrar"
                )}
              </Button>

              {/* Link para Login */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Já tem uma conta?{" "}
                  <Link
                    to="/Login"
                    className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    Faça login aqui
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;
