

import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  LanguageIcon,
  SunIcon,
  MoonIcon,
  PencilIcon,
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon,
  BellIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
} from "@heroicons/react/24/outline"
import { signOut } from "firebase/auth"
import { auth, db } from "../../services/firebaseConfig"
import { useNavigate } from "react-router-dom"
import { useAuthState } from "react-firebase-hooks/auth"
import { useEffect, useState, useContext } from "react"
import { doc, getDoc } from "firebase/firestore"
import { AuthContext } from "../../context/AuthContext"

const Settings = () => {
  const navigate = useNavigate()
  const [user] = useAuthState(auth)
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")
  const [isAdmin, setIsAdmin] = useState(false)
  const { preferences, updatePreferences, hideFooter, toggleHideFooter } = useContext(AuthContext)

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setLoading(true)
        try {
          const userRef = doc(db, "users", user.uid)
          const docSnap = await getDoc(userRef)

          if (docSnap.exists()) {
            const userData = docSnap.data()
            setUserName(userData.name)

            // Determinar o cargo do usuário
            if (userData.role === "admin") {
              setUserRole("Administrador")
              setIsAdmin(true)
            } else {
              setUserRole("Usuário")
              setIsAdmin(false)
            }
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserData()
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  // Função para renderizar o badge do cargo
  const renderRoleBadge = () => {
    if (userRole === "Administrador") {
      return (
        <div className="flex items-center bg-[#FFEE00] text-[#00418F] px-3 py-1 rounded-full font-medium text-sm shadow-sm">
          <ShieldCheckIcon className="w-4 h-4 mr-1" />
          {userRole}
        </div>
      )
    } else {
      return (
        <div className="flex items-center bg-[#00418F]/10 text-[#00418F] px-3 py-1 rounded-full font-medium text-sm">
          <UserIcon className="w-4 h-4 mr-1" />
          {userRole}
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col items-center justify-start bg-gradient-to-b from-[#00418F]/10 to-white p-4 md:p-8 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl border border-[#00418F]/10 overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-[#00418F]/5 p-6 border-b border-[#00418F]/10">
          <h1 className="text-2xl font-bold text-[#00418F]">Configurações da Conta</h1>
          <p className="text-[#00418F]/70">Gerencie suas informações pessoais e preferências</p>
        </div>

        {/* Conteúdo principal */}
        <div className="flex flex-col md:flex-row">
          {/* Barra lateral */}
          <div className="w-full md:w-64 p-6 border-b md:border-b-0 md:border-r border-[#00418F]/10">
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4 group">
                <div className="w-24 h-24 bg-gradient-to-br from-[#00418F] to-[#0066CC] rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl">
                  <UserIcon className="w-12 h-12 text-white" />
                </div>
                <button className="absolute bottom-0 right-0 bg-[#FFEE00] p-2 rounded-full hover:bg-[#FFEE00]/80 transition-all duration-300 transform hover:scale-110 shadow-md">
                  <PencilIcon className="w-4 h-4 text-[#00418F]" />
                </button>
              </div>

              {loading ? (
                <div className="animate-pulse h-6 w-32 bg-gray-200 rounded mb-2"></div>
              ) : (
                <h2 className="text-xl font-bold text-[#00418F] mb-2">{userName}</h2>
              )}

              {loading ? <div className="animate-pulse h-6 w-24 bg-gray-200 rounded"></div> : renderRoleBadge()}
            </div>

            {/* Navegação */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                  activeTab === "profile" ? "bg-[#00418F] text-white" : "text-[#00418F] hover:bg-[#00418F]/10"
                }`}
              >
                <UserIcon className="w-5 h-5 mr-3" />
                <span className="font-medium">Perfil</span>
              </button>

              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                  activeTab === "notifications" ? "bg-[#00418F] text-white" : "text-[#00418F] hover:bg-[#00418F]/10"
                }`}
              >
                <BellIcon className="w-5 h-5 mr-3" />
                <span className="font-medium">Notificações</span>
              </button>

              <button
                onClick={() => setActiveTab("appearance")}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                  activeTab === "appearance" ? "bg-[#00418F] text-white" : "text-[#00418F] hover:bg-[#00418F]/10"
                }`}
              >
                <SunIcon className="w-5 h-5 mr-3" />
                <span className="font-medium">Aparência</span>
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                  activeTab === "security" ? "bg-[#00418F] text-white" : "text-[#00418F] hover:bg-[#00418F]/10"
                }`}
              >
                <LockClosedIcon className="w-5 h-5 mr-3" />
                <span className="font-medium">Segurança</span>
              </button>

              {/* Removida a seção de Administração */}

              {/* Seção de Administração removida */}
            </nav>

            <div className="mt-8 pt-6 border-t border-[#00418F]/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-3 bg-red-50 rounded-lg text-red-600 hover:bg-red-100 transition-all duration-300 font-medium"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
                Sair
              </button>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 p-6">
            {activeTab === "profile" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-semibold text-[#00418F] mb-4">Informações Pessoais</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center p-3.5 bg-white rounded-lg hover:bg-[#FFEE00]/10 transition-all duration-300 text-[#00418F] border border-[#00418F]/10 hover:border-[#00418F]/30 shadow-sm">
                      <UserIcon className="w-5 h-5 mr-3 text-[#00418F]" />
                      <div className="flex-1 text-left">
                        <span className="font-medium">Nome de usuário</span>
                        <p className="text-sm text-gray-500">{userName || "Não definido"}</p>
                      </div>
                      <PencilIcon className="w-4 h-4 text-[#00418F]/50" />
                    </button>

                    <button className="w-full flex items-center p-3.5 bg-white rounded-lg hover:bg-[#FFEE00]/10 transition-all duration-300 text-[#00418F] border border-[#00418F]/10 hover:border-[#00418F]/30 shadow-sm">
                      <EnvelopeIcon className="w-5 h-5 mr-3 text-[#00418F]" />
                      <div className="flex-1 text-left">
                        <span className="font-medium">E-mail</span>
                        <p className="text-sm text-gray-500">{user?.email || "Não definido"}</p>
                      </div>
                      <PencilIcon className="w-4 h-4 text-[#00418F]/50" />
                    </button>

                    <button className="w-full flex items-center p-3.5 bg-white rounded-lg hover:bg-[#FFEE00]/10 transition-all duration-300 text-[#00418F] border border-[#00418F]/10 hover:border-[#00418F]/30 shadow-sm">
                      <PhoneIcon className="w-5 h-5 mr-3 text-[#00418F]" />
                      <div className="flex-1 text-left">
                        <span className="font-medium">Telefone</span>
                        <p className="text-sm text-gray-500">Não definido</p>
                      </div>
                      <PencilIcon className="w-4 h-4 text-[#00418F]/50" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#00418F] mb-4">Preferências</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center p-3.5 bg-white rounded-lg hover:bg-[#FFEE00]/10 transition-all duration-300 text-[#00418F] border border-[#00418F]/10 hover:border-[#00418F]/30 shadow-sm">
                      <LanguageIcon className="w-5 h-5 mr-3 text-[#00418F]" />
                      <div className="flex-1 text-left">
                        <span className="font-medium">Idioma</span>
                        <p className="text-sm text-gray-500">Português (Brasil)</p>
                      </div>
                      <PencilIcon className="w-4 h-4 text-[#00418F]/50" />
                    </button>

                    <button className="w-full flex items-center p-3.5 bg-white rounded-lg hover:bg-[#FFEE00]/10 transition-all duration-300 text-[#00418F] border border-[#00418F]/10 hover:border-[#00418F]/30 shadow-sm">
                      <CogIcon className="w-5 h-5 mr-3 text-[#00418F]" />
                      <div className="flex-1 text-left">
                        <span className="font-medium">Configurações avançadas</span>
                        <p className="text-sm text-gray-500">Personalizar experiência</p>
                      </div>
                      <PencilIcon className="w-4 h-4 text-[#00418F]/50" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-lg font-semibold text-[#00418F] mb-4">Aparência</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <button 
                    onClick={() => updatePreferences({ theme: "light" })}
                    className={`flex flex-col items-center p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${
                      preferences.theme === "light" 
                        ? "bg-white border-2 border-[#FFEE00]" 
                        : "bg-[#00418F]/5 border border-[#00418F]/10 hover:border-[#00418F]/30"
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                      preferences.theme === "light" 
                        ? "bg-[#FFEE00]" 
                        : "bg-[#00418F]/10"
                    }`}>
                      <SunIcon className="w-8 h-8 text-[#00418F]" />
                    </div>
                    <span className="font-medium text-[#00418F]">Modo Claro</span>
                    <p className="text-sm text-gray-500 mt-2 text-center">Interface clara para uso diurno</p>
                  </button>

                  <button 
                    onClick={() => updatePreferences({ theme: "dark" })}
                    className={`flex flex-col items-center p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${
                      preferences.theme === "dark" 
                        ? "bg-white border-2 border-[#FFEE00]" 
                        : "bg-[#00418F]/5 border border-[#00418F]/10 hover:border-[#00418F]/30"
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                      preferences.theme === "dark" 
                        ? "bg-[#FFEE00]" 
                        : "bg-[#00418F]/10"
                    }`}>
                      <MoonIcon className="w-8 h-8 text-[#00418F]" />
                    </div>
                    <span className="font-medium text-[#00418F]">Modo Escuro</span>
                    <p className="text-sm text-gray-500 mt-2 text-center">Interface escura para uso noturno</p>
                  </button>
                </div>
                
                <h3 className="text-lg font-semibold text-[#00418F] mb-4">Elementos da Interface</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#00418F]/10 hover:border-[#00418F]/30 shadow-sm">
                    <div className="flex items-center">
                      {hideFooter ? (
                        <EyeSlashIcon className="w-5 h-5 mr-3 text-[#00418F]" />
                      ) : (
                        <EyeIcon className="w-5 h-5 mr-3 text-[#00418F]" />
                      )}
                      <div>
                        <span className="font-medium text-[#00418F]">Ocultar Rodapé</span>
                        <p className="text-sm text-gray-500">Esconde o rodapé em todas as páginas</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={hideFooter} 
                        onChange={(e) => toggleHideFooter(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00418F]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00418F]"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-lg font-semibold text-[#00418F] mb-4">Segurança</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center p-4 bg-white rounded-lg hover:bg-[#FFEE00]/10 transition-all duration-300 text-[#00418F] border border-[#00418F]/10 hover:border-[#00418F]/30 shadow-sm">
                    <LockClosedIcon className="w-5 h-5 mr-3 text-[#00418F]" />
                    <div className="flex-1 text-left">
                      <span className="font-medium">Alterar senha</span>
                      <p className="text-sm text-gray-500">Atualize sua senha para maior segurança</p>
                    </div>
                    <div className="bg-[#00418F]/5 p-1 rounded">
                      <PencilIcon className="w-4 h-4 text-[#00418F]" />
                    </div>
                  </button>

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start">
                      <ShieldCheckIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Verificação em duas etapas</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Adicione uma camada extra de segurança à sua conta ativando a verificação em duas etapas.
                        </p>
                        <button className="mt-3 px-3 py-1.5 bg-white text-yellow-700 text-sm font-medium rounded border border-yellow-300 hover:bg-yellow-50 transition-colors">
                          Ativar agora
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-lg font-semibold text-[#00418F] mb-4">Notificações</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#00418F]/10">
                    <div className="flex items-center">
                      <div className="bg-[#00418F]/10 p-2 rounded-lg mr-3">
                        <EnvelopeIcon className="w-5 h-5 text-[#00418F]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-[#00418F]">E-mails</h4>
                        <p className="text-sm text-gray-500">Receber notificações por e-mail</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00418F]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#00418F]/10">
                    <div className="flex items-center">
                      <div className="bg-[#00418F]/10 p-2 rounded-lg mr-3">
                        <BellIcon className="w-5 h-5 text-[#00418F]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-[#00418F]">Notificações no aplicativo</h4>
                        <p className="text-sm text-gray-500">Receber alertas dentro do aplicativo</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00418F]"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
