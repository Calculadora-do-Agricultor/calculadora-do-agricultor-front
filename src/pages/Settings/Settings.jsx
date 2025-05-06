import { UserIcon, EnvelopeIcon, PhoneIcon, LockClosedIcon, LanguageIcon, SunIcon, MoonIcon, PencilIcon } from "@heroicons/react/24/outline";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebaseConfig";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };
  return (
    <div className="flex flex-col items-center justify-start bg-gradient-to-b from-blue-50 to-white p-8 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl">
        <div className="flex flex-col items-center mb-8">
          {/* Seção do Perfil */}
          <div className="relative mb-4">
            <div className="w-36 h-36 bg-blue-900 rounded-full flex items-center justify-center">
              <UserIcon className="w-20 h-20 text-white" />
            </div>
            <button className="absolute bottom-2 right-2 bg-yellow-400 p-2 rounded-full hover:bg-yellow-500 transition-colors shadow-md">
              <PencilIcon className="w-4 h-4 text-blue-900" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-blue-900 mb-1">NOME DO PERFIL</h2>
          <p className="text-blue-700 font-medium mb-8">AGRICULTOR</p>

          {/* Seção dos Botões */}
          <div className="w-full space-y-3">
            <button className="w-full flex items-center p-3.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all transform hover:scale-[1.01] text-blue-900 border border-blue-100">
              <UserIcon className="w-5 h-5 mr-3 text-blue-700" />
              <span className="font-medium">Alterar nome de usuário</span>
            </button>

            <button className="w-full flex items-center p-3.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all transform hover:scale-[1.01] text-blue-900 border border-blue-100">
              <EnvelopeIcon className="w-5 h-5 mr-3 text-blue-700" />
              <span className="font-medium">Alterar e-mail</span>
            </button>

            <button className="w-full flex items-center p-3.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all transform hover:scale-[1.01] text-blue-900 border border-blue-100">
              <PhoneIcon className="w-5 h-5 mr-3 text-blue-700" />
              <span className="font-medium">Alterar telefone</span>
            </button>

            <button className="w-full flex items-center p-3.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all transform hover:scale-[1.01] text-blue-900 border border-blue-100">
              <LockClosedIcon className="w-5 h-5 mr-3 text-blue-700" />
              <span className="font-medium">Alterar senha</span>
            </button>

            <button className="w-full flex items-center p-3.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all transform hover:scale-[1.01] text-blue-900 border border-blue-100">
              <LanguageIcon className="w-5 h-5 mr-3 text-blue-700" />
              <span className="font-medium">Alterar idioma</span>
            </button>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 p-3.5 bg-blue-900 rounded-lg text-white hover:bg-blue-800 transition-all transform hover:scale-[1.01] font-medium shadow-md">
                <SunIcon className="w-5 h-5 inline mr-2" />
                Modo claro
              </button>
              <button className="flex-1 p-3.5 bg-blue-50 rounded-lg text-blue-900 hover:bg-blue-100 transition-all transform hover:scale-[1.01] font-medium border border-blue-100">
                <MoonIcon className="w-5 h-5 inline mr-2" />
                Modo escuro
              </button>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full p-3.5 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-all transform hover:scale-[1.01] font-medium mt-6 shadow-md"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;