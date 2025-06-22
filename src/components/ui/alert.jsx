import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldExclamationIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  KeyIcon,
  UserCircleIcon,
  NoSymbolIcon
} from "@heroicons/react/24/outline"

const alertVariants = cva(
  "relative w-full rounded-lg border-l-4 p-4 mb-4 shadow-sm transition-all duration-200 flex items-start gap-3",
  {
    variants: {
      variant: {
        default: "bg-blue-50 border-l-blue-400 text-blue-800 [&>svg]:text-blue-600",
        destructive:
          "bg-red-50 border-l-red-400 text-red-800 [&>svg]:text-red-600",
        warning:
          "bg-yellow-50 border-l-yellow-400 text-yellow-800 [&>svg]:text-yellow-600",
        success:
          "bg-green-50 border-l-green-400 text-green-800 [&>svg]:text-green-600",
        info:
          "bg-blue-50 border-l-blue-400 text-blue-800 [&>svg]:text-blue-600",
        // Variantes específicas para erros de autenticação com cores do tema da aplicação
        "auth-email":
          "bg-blue-50 border-l-blue-500 text-blue-900 [&>svg]:text-blue-700",
        "auth-password":
          "bg-red-50 border-l-red-500 text-red-900 [&>svg]:text-red-700",
        "auth-account":
          "bg-blue-50 border-l-blue-600 text-blue-900 [&>svg]:text-blue-700",
        "auth-blocked":
          "bg-gray-50 border-l-gray-500 text-gray-900 [&>svg]:text-gray-700",
        "auth-disabled":
          "bg-amber-50 border-l-amber-500 text-amber-900 [&>svg]:text-amber-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Mapeamento de ícones para cada tipo de erro
const getAlertIcon = (variant, customIcon) => {
  if (customIcon) return customIcon
  
  const iconMap = {
    default: InformationCircleIcon,
    destructive: ExclamationCircleIcon,
    warning: ExclamationTriangleIcon,
    success: CheckCircleIcon,
    info: InformationCircleIcon,
    "auth-email": EnvelopeIcon,
    "auth-password": KeyIcon,
    "auth-account": UserCircleIcon,
    "auth-blocked": NoSymbolIcon,
  }
  return iconMap[variant] || InformationCircleIcon
}

const Alert = React.forwardRef(({ className, variant, children, onClose, icon, ...props }, ref) => {
  const IconComponent = getAlertIcon(variant, icon)
  
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <div className="flex-shrink-0 mt-0.5">
        <IconComponent className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        {children}
      </div>
      {onClose && (
        <div className="flex-shrink-0 ml-2">
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-current/60 hover:text-current hover:bg-current/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-current/30 focus:ring-offset-1 disabled:pointer-events-none group"
            aria-label="Fechar alerta"
          >
            <XMarkIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
            <span className="sr-only">Fechar</span>
          </button>
        </div>
      )}
    </div>
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-2 font-semibold text-base leading-tight tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm leading-relaxed [&_p]:leading-relaxed mt-1", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

// Componente específico para erros de autenticação
const AuthAlert = ({ errorCode, customMessage, onClose, context = "login", ...props }) => {
  const getAuthErrorConfig = (code, context) => {
    const errorConfigs = {
      // Erros de email
      "auth/invalid-email": {
        variant: "auth-email",
        title: "Email Inválido",
        description: "O formato do email inserido não é válido. Verifique se você digitou corretamente e tente novamente."
      },
      "auth/user-not-found": {
        variant: "auth-account",
        title: "Conta Não Encontrada",
        description: "Não encontramos uma conta associada a este email. Verifique o email digitado ou crie uma nova conta."
      },
      "auth/email-already-in-use": {
        variant: "auth-email",
        title: "Email Já Cadastrado",
        description: "Este email já está sendo usado por outra conta. Tente fazer login ou use um email diferente."
      },
      "auth/missing-email": {
        variant: "auth-email",
        title: "Email Obrigatório",
        description: "Por favor, insira um endereço de email válido para continuar."
      },
      
      // Erros de senha
      "auth/wrong-password": {
        variant: "auth-password",
        title: "Senha Incorreta",
        description: "A senha inserida está incorreta. Verifique sua senha e tente novamente."
      },
      "auth/invalid-credential": {
        variant: "auth-password",
        title: "Credenciais Inválidas",
        description: "Email ou senha incorretos. Verifique suas informações e tente novamente."
      },
      "auth/weak-password": {
        variant: "auth-password",
        title: "Senha Muito Fraca",
        description: "A senha deve ter pelo menos 6 caracteres, incluindo letras maiúsculas e números para maior segurança."
      },
      "auth/missing-password": {
        variant: "auth-password",
        title: "Senha Obrigatória",
        description: "Por favor, insira uma senha para continuar."
      },
      "auth/requires-recent-login": {
        variant: "auth-password",
        title: "Reautenticação Necessária",
        description: "Por segurança, você precisa fazer login novamente para realizar esta ação."
      },
      
      // Erros de conta
      "auth/user-disabled": {
        variant: "auth-blocked",
        title: "Conta Suspensa",
        description: "Sua conta foi temporariamente suspensa por motivos de segurança. Entre em contato com o suporte."
      },
      "account-disabled": {
        variant: "auth-disabled",
        title: "Conta Desativada",
        description: "Sua conta foi desativada por um administrador. Para reativar sua conta, entre em contato com o suporte: suporte@calculadoradoagricultor.com | (11) 9999-9999 | Atendimento: Segunda a Sexta, 8h às 18h"
      },
      "auth/account-exists-with-different-credential": {
        variant: "auth-account",
        title: "Conta Existente",
        description: "Já existe uma conta com este email usando um método de login diferente. Tente fazer login normalmente."
      },
      "auth/operation-not-allowed": {
        variant: "auth-blocked",
        title: "Operação Não Permitida",
        description: "Este método de autenticação não está habilitado. Entre em contato com o suporte."
      },
      
      // Erros de limite/segurança
      "auth/too-many-requests": {
        variant: "auth-blocked",
        title: "Muitas Tentativas",
        description: "Detectamos muitas tentativas de login. Por segurança, aguarde alguns minutos antes de tentar novamente."
      },
      "auth/popup-blocked": {
        variant: "warning",
        title: "Pop-up Bloqueado",
        description: "O pop-up de autenticação foi bloqueado pelo navegador. Permita pop-ups para este site."
      },
      "auth/cancelled-popup-request": {
        variant: "info",
        title: "Login Cancelado",
        description: "O processo de login foi cancelado. Tente novamente se desejar continuar."
      },
      
      // Erros de rede e sistema
      "auth/network-request-failed": {
        variant: "warning",
        title: "Erro de Conexão",
        description: "Problema de conexão com a internet. Verifique sua conexão e tente novamente."
      },
      "auth/timeout": {
        variant: "warning",
        title: "Tempo Esgotado",
        description: "A operação demorou muito para ser concluída. Verifique sua conexão e tente novamente."
      },
      "auth/internal-error": {
        variant: "destructive",
        title: "Erro Interno",
        description: "Ocorreu um erro interno no sistema. Tente novamente em alguns instantes."
      },
      
      // Erros específicos de cadastro
      "auth/admin-restricted-operation": {
        variant: "auth-blocked",
        title: "Operação Restrita",
        description: "Esta operação está restrita por políticas administrativas."
      },
      
      // Erros genéricos contextuais
      "default": {
        variant: "destructive",
        title: context === "register" ? "Erro no Cadastro" : "Erro no Login",
        description: context === "register" 
          ? "Não foi possível completar o cadastro. Verifique os dados inseridos e tente novamente."
          : "Não foi possível fazer login. Verifique suas credenciais e tente novamente."
      }
    }
    
    return errorConfigs[code] || errorConfigs["default"]
  }
  
  const config = getAuthErrorConfig(errorCode, context)
  
  return (
    <Alert variant={config.variant} onClose={onClose} {...props}>
      <AlertTitle>{config.title}</AlertTitle>
      <AlertDescription>
        {customMessage || config.description}
      </AlertDescription>
    </Alert>
  )
}

export { Alert, AlertTitle, AlertDescription, AuthAlert }