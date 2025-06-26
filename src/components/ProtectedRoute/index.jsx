

import { useEffect, useState, useContext } from "react"
import { Navigate } from "react-router-dom"
import { authWrapper, firestoreWrapper } from "../../services/firebaseWrapper"
import { AuthContext } from "../../context/AuthContext"

/**
 * Componente para proteger rotas que exigem permissões de administrador
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes filhos a serem renderizados se o usuário tiver permissão
 * @param {boolean} props.adminOnly - Se verdadeiro, apenas administradores podem acessar
 * @param {string} props.redirectTo - Rota para redirecionamento caso o usuário não tenha permissão
 */
const ProtectedRoute = ({ children, adminOnly = false, redirectTo = "/" }) => {
  const { loading } = useContext(AuthContext)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [checkingPermissions, setCheckingPermissions] = useState(true)
  const user = authWrapper.getCurrentUser()

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setCheckingPermissions(false)
        return
      }

      try {
        const userData = await firestoreWrapper.getDocument("users", user.uid)
        
        if (userData) {
          setIsAdmin(userData.role === "admin")
          setIsActive(userData.active !== false)
          
          // Se a conta estiver desativada, desloga o usuário
          if (userData.active === false) {
            console.warn("Conta desativada detectada. Deslogando usuário.")
            await authWrapper.signOut()
            // Dispara evento para mostrar mensagem de conta desativada
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('accountDisabled'))
            }, 100)
            return
          }
        } else {
          setIsAdmin(false)
          setIsActive(false)
        }
      } catch (error) {
        console.error("Erro ao verificar permissões do usuário:", error)
        setIsAdmin(false)
      } finally {
        setCheckingPermissions(false)
      }
    }

    checkAdminStatus()
  }, [user])

  // Aguarda a verificação de autenticação e permissões
  if (loading || checkingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00418F]"></div>
      </div>
    )
  }

  // Verifica se o usuário está autenticado
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Verifica se a conta está ativa
  if (!isActive) {
    return <Navigate to="/login" replace />
  }

  // Verifica se a rota é apenas para administradores
  if (adminOnly && !isAdmin) {
    return <Navigate to={redirectTo} replace />
  }

  // Se passou por todas as verificações, renderiza o conteúdo protegido
  return children
}

export default ProtectedRoute