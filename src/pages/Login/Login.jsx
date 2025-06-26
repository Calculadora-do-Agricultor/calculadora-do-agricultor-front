import React, { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../../services/firebaseConfig";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useToast } from "../../context/ToastContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas";
import {
  EnvelopeIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  LockClosedIcon,
  EyeSlashIcon,
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
import { cn } from "../../lib/utils";

// Schema de validação com Zod


const Login = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { success, error: toastError, info } = useToast();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Listener para evento de conta desativada
  useEffect(() => {
    const handleAccountDisabled = () => {
      setError("Sua conta foi desativada por um administrador.");
      setErrorCode("account-disabled");
    };

    window.addEventListener('accountDisabled', handleAccountDisabled);
    
    return () => {
      window.removeEventListener('accountDisabled', handleAccountDisabled);
    };
  }, []);

  const handleLogin = async (values) => {
    setError("");
    setErrorCode("");
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );
      const user = userCredential.user;

      // Removida verificação de e-mail para melhorar experiência do usuário


      // Verificar se a conta está ativa antes de prosseguir
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        if (userData.active === false) {
          // Deslogar imediatamente e mostrar erro
          await signOut(auth);
          setError("Sua conta foi desativada por um administrador.");
          toastError("Sua conta foi desativada por um administrador.");
          setErrorCode("account-disabled");
          setIsLoading(false);
          return;
        }
      }

      localStorage.setItem("authToken", "logado");

      if (values.rememberMe) {
        localStorage.setItem("rememberedEmail", values.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }


      success("Bem-vindo de volta! Login realizado com sucesso.");

      navigate("/Calculator");
    } catch (error) {
      // Log do erro para monitoramento de segurança
      console.error('Login error:', {
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
        email: values.email // Log apenas do email, não da senha
      });
      
      // Definir código de erro específico do Firebase Auth
      setErrorCode(error.code || 'default');
      setError("Erro de autenticação");
      
      // Mensagens de erro mais específicas para o usuário
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {

        // Notificação de email ou senha incorretos removida conforme solicitado
      } else if (error.code === 'auth/too-many-requests') {
        // Notificação de muitas tentativas removida conforme solicitado
      } else if (error.code === 'auth/user-disabled') {
        // Mantendo apenas o registro do erro sem exibir notificação
      } else {
        // Notificação genérica de erro de login removida conforme solicitado

      }
      
      // Log adicional para erros críticos de segurança
      if (error.code === 'auth/too-many-requests' || error.code === 'auth/user-disabled') {
        console.warn('Security alert - Login attempt blocked:', {
          code: error.code,
          email: values.email,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Não redirecionar se há erro de conta desativada
    if (!loading && user && errorCode !== "account-disabled") {
      navigate("/Calculator", { replace: true });
    }

    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      form.setValue("email", rememberedEmail);
      form.setValue("rememberMe", true);
    }
  }, [user, loading, navigate, form, errorCode]);

  return (
    <div className="min-h-[calc(100vh-64px-40px)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(135deg, #00418f, #0066cc)'}}>
            <ArrowRightOnRectangleIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{background: 'linear-gradient(135deg, #00418f, #0066cc)', WebkitBackgroundClip: 'text'}}>
            Bem-vindo de volta
          </h1>
          <p className="text-gray-600 text-sm">
            Entre com suas credenciais para acessar sua conta
          </p>
        </div>

        {/* Formulário */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-5">
            {/* Campo Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="email"
                        placeholder="seu@email.com"
                        className={cn(
                          "pl-10 h-11 border-gray-200 transition-all duration-200",
                          "hover:border-gray-400 bg-white/50"
                        )}
                        style={{
                          '--tw-ring-color': '#00418f33',
                          borderColor: form.formState.errors.email ? '#ef4444' : undefined
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#00418f';
                          e.target.style.boxShadow = '0 0 0 3px #00418f33';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                        disabled={isLoading}
                        tabIndex={1}
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
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-gray-700 font-medium">
                      Senha
                    </FormLabel>
                    <Link
                      to="/recuperar-senha"
                      className="text-sm hover:underline transition-colors"
                      style={{color: '#00418f'}}
                      onMouseEnter={(e) => e.target.style.color = '#003366'}
                      onMouseLeave={(e) => e.target.style.color = '#00418f'}
                      tabIndex={6}
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        className={cn(
                          "pl-10 pr-10 h-11 border-gray-200 transition-all duration-200",
                          "hover:border-gray-400 bg-white/50"
                        )}
                        style={{
                          '--tw-ring-color': '#00418f33',
                          borderColor: form.formState.errors.password ? '#ef4444' : undefined
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#00418f';
                          e.target.style.boxShadow = '0 0 0 3px #00418f33';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                        disabled={isLoading}
                        tabIndex={2}
                      />
                      <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-200 focus:outline-none"
                        style={{
                          color: showPassword ? '#00418f' : undefined
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#00418f'}
                        onMouseLeave={(e) => e.target.style.color = showPassword ? '#00418f' : '#9ca3af'}
                        onFocus={(e) => e.target.style.color = '#00418f'}
                        aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                        disabled={isLoading}
                        tabIndex={3}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            {/* Checkbox Lembrar */}
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        id="remember-me-checkbox"
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-200 transition-colors"
                        style={{
                          accentColor: '#00418f',
                          '--tw-ring-color': '#00418f33'
                        }}
                        onFocus={(e) => {
                          e.target.style.boxShadow = '0 0 0 2px #00418f33';
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = 'none';
                        }}
                        disabled={isLoading}
                        tabIndex={4}
                      />
                    </FormControl>
                    <FormLabel htmlFor="remember-me-checkbox" className="text-sm text-gray-600 font-normal cursor-pointer">
                      Lembrar meu email
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Alert de Erro */}
            {error && (
              <AuthAlert 
                errorCode={errorCode} 
                context="login"
                onClose={() => {
                  setError("");
                  setErrorCode("");
                }} 
              />
            )}

            {/* Botão de Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-11 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]",
                "shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                "focus:ring-2 focus:ring-offset-2"
              )}
              style={{
                background: 'linear-gradient(135deg, #00418f, #0066cc)',
                '--tw-ring-color': '#00418f66'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.background = 'linear-gradient(135deg, #003366, #004d99)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.background = 'linear-gradient(135deg, #00418f, #0066cc)';
                }
              }}
              tabIndex={5}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Entrando...</span>
                </div>
              ) : (
                "Entrar"
              )}
            </Button>



            {/* Link para Registro */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <Link
                  to="/Register"
                  className="font-semibold hover:underline transition-colors"
                   style={{color: '#00418f'}}
                   onMouseEnter={(e) => e.target.style.color = '#003366'}
                   onMouseLeave={(e) => e.target.style.color = '#00418f'}
                   tabIndex={7}
                >
                  Cadastre-se aqui
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

export default Login;
