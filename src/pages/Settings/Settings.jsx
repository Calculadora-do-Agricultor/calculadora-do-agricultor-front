import { UserIcon, EnvelopeIcon, PhoneIcon, LockClosedIcon, LanguageIcon, SunIcon, MoonIcon, PencilIcon } from "@heroicons/react/24/outline";
import { signOut } from "firebase/auth";
import { auth, db } from "../../services/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

const Settings = () => {
  const navigate = useNavigate();

  const [user] = useAuthState(auth);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          setUserName(docSnap.data().name);
        }
      });
    }
  }, [user]);



  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };
  return (
    <div className="flex flex-col items-center justify-start bg-gradient-to-b from-[#00418F]/10 to-white p-8 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl border border-[#00418F]/10">
        <div className="flex flex-col items-center mb-8">
          {/* Seção do Perfil */}
          <div className="relative mb-4">
            <div className="w-36 h-36 bg-[#00418F] rounded-full flex items-center justify-center shadow-lg">
              <UserIcon className="w-20 h-20 text-white" />
            </div>
            <button className="absolute bottom-2 right-2 bg-[#FFEE00] p-2 rounded-full hover:bg-[#FFEE00]/80 transition-all duration-300 transform hover:scale-110 shadow-md">
              <PencilIcon className="w-4 h-4 text-[#00418F]" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-[#00418F] mb-1">{userName}</h2>
          <p className="text-[#00418F] font-medium mb-8">AGRICULTOR</p>

          {/* Seção dos Botões */}
          <div className="w-full space-y-3">
            <button className="w-full flex items-center p-3.5 bg-[#00418F]/5 rounded-lg hover:bg-[#FFEE00]/10 transition-all duration-300 transform hover:scale-[1.02] text-[#00418F] border border-[#00418F]/10 hover:border-[#00418F]/30">
              <UserIcon className="w-5 h-5 mr-3 text-[#00418F]" />
              <span className="font-medium">Alterar nome de usuário</span>
            </button>

            <button className="w-full flex items-center p-3.5 bg-[#00418F]/5 rounded-lg hover:bg-[#FFEE00]/10 transition-all duration-300 transform hover:scale-[1.02] text-[#00418F] border border-[#00418F]/10 hover:border-[#00418F]/30">
              <EnvelopeIcon className="w-5 h-5 mr-3 text-[#00418F]" />
              <span className="font-medium">Alterar e-mail</span>
            </button>

            <button className="w-full flex items-center p-3.5 bg-[#00418F]/5 rounded-lg hover:bg-[#FFEE00]/10 transition-all duration-300 transform hover:scale-[1.02] text-[#00418F] border border-[#00418F]/10 hover:border-[#00418F]/30">
              <PhoneIcon className="w-5 h-5 mr-3 text-[#00418F]" />
              <span className="font-medium">Alterar telefone</span>
            </button>

            <button className="w-full flex items-center p-3.5 bg-[#00418F]/5 rounded-lg hover:bg-[#FFEE00]/10 transition-all duration-300 transform hover:scale-[1.02] text-[#00418F] border border-[#00418F]/10 hover:border-[#00418F]/30">
              <LockClosedIcon className="w-5 h-5 mr-3 text-[#00418F]" />
              <span className="font-medium">Alterar senha</span>
            </button>

            <button className="w-full flex items-center p-3.5 bg-[#00418F]/5 rounded-lg hover:bg-[#FFEE00]/10 transition-all duration-300 transform hover:scale-[1.02] text-[#00418F] border border-[#00418F]/10 hover:border-[#00418F]/30">
              <LanguageIcon className="w-5 h-5 mr-3 text-[#00418F]" />
              <span className="font-medium">Alterar idioma</span>
            </button>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 p-3.5 bg-[#FFEE00] rounded-lg text-[#00418F] hover:bg-[#FFEE00]/80 transition-all duration-300 transform hover:scale-[1.02] font-medium shadow-md">
                <SunIcon className="w-5 h-5 inline mr-2" />
                Modo claro
              </button>
              <button className="flex-1 p-3.5 bg-[#00418F]/5 rounded-lg text-[#00418F] hover:bg-[#FFEE00]/10 transition-all duration-300 transform hover:scale-[1.02] font-medium border border-[#00418F]/10 hover:border-[#00418F]/30">
                <MoonIcon className="w-5 h-5 inline mr-2" />
                Modo escuro
              </button>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full p-3.5 bg-[#C00812] rounded-lg text-white hover:bg-[#C00812]/80 transition-all duration-300 transform hover:scale-[1.02] font-medium mt-6 shadow-md"
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