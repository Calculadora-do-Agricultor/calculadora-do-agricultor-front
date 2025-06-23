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
  // ClipboardDocumentListIcon, // Não utilizado no código fornecido
  // UsersIcon, // Não utilizado no código fornecido
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Corrigido o import, era 'Button' mas não tinha o path completo
import {
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth, db } from "../../services/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState, useContext } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { verifyBeforeUpdateEmail } from "firebase/auth";
import "react-toastify/dist/ReactToastify.css";
// import { zodResolver } from "@hookform/resolvers/zod" // Não utilizado no código fornecido
// import { updateUserSchema } from "@/schemas/userSchema" // Não utilizado no código fornecido

const Settings = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [isAdmin, setIsAdmin] = useState(false);
  const { preferences, updatePreferences /* hideFooter, toggleHideFooter */ } =
    useContext(AuthContext); // hideFooter e toggleHideFooter não são usados na seção de aparência do código fornecido

  // ESTADOS PARA EDIÇÃO DE PERFIL
  const [editingName, setEditingName] = useState("");
  const [editingEmail, setEditingEmail] = useState("");
  const [editingPhone, setEditingPhone] = useState(""); // NOVO ESTADO PARA O TELEFONE
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setLoading(true);
        try {
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserName(userData.name);
            setEditingName(userData.name);
            setEditingEmail(user.email);
            setEditingPhone(userData.phone || ""); // Inicializar editingPhone com o dado do Firestore ou vazio

            if (userData.role === "admin") {
              setUserRole("Administrador");
              setIsAdmin(true);
            } else {
              setUserRole("Usuário");
              setIsAdmin(false);
            }
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          toast.error("Erro ao carregar dados do usuário.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout.");
    }
  };

  const handleReauthenticate = async () => {
    setError("");
    if (!user) return false;

    if (!currentPassword) {
      setError("Por favor, digite sua senha atual para confirmar a alteração.");
      return false;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (err) {
      console.error("Erro de reautenticação:", err.code, err.message);
      if (err.code === "auth/wrong-password") {
        setError("Senha atual incorreta. Por favor, tente novamente.");
      } else if (err.code === "auth/user-not-found") {
        setError("Usuário não encontrado.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Credenciais inválidas. Por favor, verifique sua senha.");
      } else {
        setError("Erro ao reautenticar. Tente novamente mais tarde.");
      }
      return false;
    }
  };

  const handleSaveName = async () => {
    if (!user) {
      toast.error("Usuário não autenticado.");
      return;
    }
    if (!editingName.trim()) {
      setError("O nome não pode estar vazio.");
      return;
    }
    if (editingName === userName) {
      toast.info("Nenhuma alteração no nome foi detectada.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateProfile(user, { displayName: editingName });

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { name: editingName });

      setUserName(editingName);
      setSuccess("Nome atualizado com sucesso!");
      toast.success("Nome atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar nome:", err);
      setError("Erro ao atualizar nome. Por favor, tente novamente.");
      toast.error("Erro ao atualizar nome.");
    } finally {
      setIsSaving(false);
    }
  };

 const handleSaveEmail = async () => {
    if (!user) {
      toast.error("Usuário não autenticado.");
      return;
    }

    // Primeiro fazemos a reautenticação
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      // Reautenticar antes de qualquer validação
      const reauthenticated = await handleReauthenticate();
      if (!reauthenticated) {
        setIsSaving(false);
        return;
      }

      // Depois validamos o e-mail
      if (!editingEmail.trim()) {
        setError("O e-mail não pode estar vazio.");
        setIsSaving(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editingEmail)) {
        setError("Por favor, insira um e-mail válido.");
        setIsSaving(false);
        return;
      }

      if (editingEmail === user.email) {
        toast.info("Nenhuma alteração no e-mail foi detectada.");
        setIsSaving(false);
        return;
      }

      // Por fim, atualizamos o e-mail
     await verifyBeforeUpdateEmail(user, editingEmail);

      
      // Atualizamos também no Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { email: editingEmail });

      setSuccess("Enviamos um link de confirmação para seu novo e-mail. Clique nele para concluir a alteração.");
toast.success("Confirme o novo e-mail clicando no link que enviamos.");
      
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Erro ao atualizar e-mail:", err);
      if (err.code === "auth/invalid-email") {
        setError("E-mail inválido.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Este e-mail já está em uso por outra conta.");
      } else if (err.code === "auth/requires-recent-login") {
        setError("Por favor, faça logout e login novamente antes de tentar alterar o e-mail.");
      } else {
        setError("Erro ao atualizar e-mail. Tente novamente mais tarde.");
      }
      toast.error("Erro ao atualizar e-mail.");
    } finally {
      setIsSaving(false);
    }
  };

  // NOVA FUNÇÃO PARA SALVAR O TELEFONE NO FIRESTORE
  const handleSavePhone = async () => {
    if (!user) {
      toast.error("Usuário não autenticado.");
      return;
    }
    // Opcional: Adicione validação para o formato do telefone, se necessário
    if (!editingPhone.trim()) {
      setError("O número de telefone não pode estar vazio.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { phone: editingPhone }); // Salva o telefone no documento do usuário no Firestore

      setSuccess("Telefone atualizado com sucesso!");
      toast.success("Telefone atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar telefone:", err);
      setError("Erro ao atualizar telefone. Por favor, tente novamente.");
      toast.error("Erro ao atualizar telefone.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!user) {
      toast.error("Usuário não autenticado.");
      return;
    }
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("Por favor, preencha todos os campos de senha.");
      return;
    }
    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("A nova senha e a confirmação de senha não coincidem.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("A nova senha não pode ser igual à senha atual.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const reauthenticated = await handleReauthenticate();
      if (!reauthenticated) {
        setIsSaving(false);
        return;
      }

      await updatePassword(user, newPassword);
      setSuccess("Senha atualizada com sucesso!");
      toast.success("Senha atualizada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      console.error("Erro ao atualizar senha:", err);
      if (err.code === "auth/weak-password") {
        setError("A senha é muito fraca. Por favor, use uma senha mais forte.");
      } else if (err.code === "auth/requires-recent-login") {
        setError(
          "Esta ação requer que você faça login novamente. Por favor, digite sua senha atual.",
        );
      } else {
        setError("Erro ao atualizar senha. Tente novamente mais tarde.");
      }
      toast.error("Erro ao atualizar senha.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderRoleBadge = () => {
    if (userRole === "Administrador") {
      return (
        <div className="flex items-center rounded-full bg-[#FFEE00] px-3 py-1 text-sm font-medium text-[#00418F] shadow-sm">
          <ShieldCheckIcon className="mr-1 h-4 w-4" />
          {userRole}
        </div>
      );
    } else {
      return (
        <div className="flex items-center rounded-full bg-[#00418F]/10 px-3 py-1 text-sm font-medium text-[#00418F]">
          <UserIcon className="mr-1 h-4 w-4" />
          {userRole}
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-[#00418F]/10 to-[#EFF2FF] p-4 md:p-8">
      <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-[#00418F]/10 bg-white shadow-lg">
        {/* Cabeçalho */}
        <div className="border-b border-[#00418F]/10 bg-[#00418F]/5 p-6">
          <h1 className="text-2xl font-bold text-[#00418F]">
            Configurações da Conta
          </h1>
          <p className="text-[#00418F]/70">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>

        {/* Conteúdo principal */}
        <div className="flex flex-col md:flex-row">
          {/* Barra lateral */}
          <div className="w-full border-b border-[#00418F]/10 p-6 md:w-64 md:border-r md:border-b-0">
            <div className="mb-6 flex flex-col items-center">
              <div className="group relative mb-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#00418F] to-[#0066CC] shadow-lg transition-all duration-300 group-hover:shadow-xl">
                  <UserIcon className="h-12 w-12 text-white" />
                </div>
                <button className="absolute right-0 bottom-0 transform rounded-full bg-[#FFEE00] p-2 shadow-md transition-all duration-300 hover:scale-110 hover:bg-[#FFEE00]/80">
                  <PencilIcon className="h-4 w-4 text-[#00418F]" />
                </button>
              </div>

              {loading ? (
                <div className="mb-2 h-6 w-32 animate-pulse rounded bg-gray-200"></div>
              ) : (
                <h2 className="mb-2 text-xl font-bold text-[#00418F]">
                  {userName}
                </h2>
              )}

              {loading ? (
                <div className="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
              ) : (
                renderRoleBadge()
              )}
            </div>

            {/* Navegação */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex w-full items-center rounded-lg p-3 transition-all duration-200 ${
                  activeTab === "profile"
                    ? "bg-[#00418F] text-white"
                    : "text-[#00418F] hover:bg-[#00418F]/10"
                }`}
              >
                <UserIcon className="mr-3 h-5 w-5" />
                <span className="font-medium">Perfil</span>
              </button>

              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex w-full items-center rounded-lg p-3 transition-all duration-200 ${
                  activeTab === "notifications"
                    ? "bg-[#00418F] text-white"
                    : "text-[#00418F] hover:bg-[#00418F]/10"
                }`}
              >
                <BellIcon className="mr-3 h-5 w-5" />
                <span className="font-medium">Notificações</span>
              </button>

              <button
                onClick={() => setActiveTab("appearance")}
                className={`flex w-full items-center rounded-lg p-3 transition-all duration-200 ${
                  activeTab === "appearance"
                    ? "bg-[#00418F] text-white"
                    : "text-[#00418F] hover:bg-[#00418F]/10"
                }`}
              >
                <SunIcon className="mr-3 h-5 w-5" />
                <span className="font-medium">Aparência</span>
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`flex w-full items-center rounded-lg p-3 transition-all duration-200 ${
                  activeTab === "security"
                    ? "bg-[#00418F] text-white"
                    : "text-[#00418F] hover:bg-[#00418F]/10"
                }`}
              >
                <LockClosedIcon className="mr-3 h-5 w-5" />
                <span className="font-medium">Segurança</span>
              </button>
            </nav>

            <div className="mt-8 border-t border-[#00418F]/10 pt-6">
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center rounded-lg bg-red-50 p-3 font-medium text-red-600 transition-all duration-300 hover:bg-red-100"
              >
                <ArrowLeftOnRectangleIcon className="mr-2 h-5 w-5" />
                Sair
              </button>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 p-6">
            {activeTab === "profile" && (
              <div className="animate-fadeIn space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-[#00418F]">
                    Informações Pessoais
                  </h3>
                  <div className="space-y-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex w-full items-center rounded-lg border border-[#00418F]/10 bg-white p-3.5 text-[#00418F] shadow-sm transition-all duration-300 hover:border-[#00418F]/30 hover:bg-[#FFEE00]/10">
                          <UserIcon className="mr-3 h-5 w-5 text-[#00418F]" />
                          <div className="flex-1 text-left">
                            <span className="font-medium">Nome de usuário</span>
                            <p className="text-sm text-gray-500">
                              {userName || "Não definido"}
                            </p>
                          </div>
                          <PencilIcon className="h-4 w-4 text-[#00418F]/50" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Editar Nome de Usuário</DialogTitle>
                          <DialogDescription>
                            Altere seu nome de usuário aqui. Clique em salvar
                            quando terminar.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="username" className="text-right">
                              Nome
                            </label>
                            <input
                              id="username"
                              defaultValue={userName}
                              onChange={(e) => {
                                setEditingName(e.target.value);
                                setError("");
                                setSuccess("");
                              }}
                              className="col-span-3 rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#00418F] focus:outline-none"
                            />
                          </div>
                          {error && (
                            <p className="col-span-4 mt-2 text-center text-sm text-red-500">
                              {error}
                            </p>
                          )}
                          {success && (
                            <p className="col-span-4 mt-2 text-center text-sm text-green-500">
                              {success}
                            </p>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            onClick={handleSaveName}
                            className="bg-[#00418F] hover:bg-[#00418F]/90"
                            disabled={isSaving}
                          >
                            {isSaving ? "Salvando..." : "Salvar alterações"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex w-full items-center rounded-lg border border-[#00418F]/10 bg-white p-3.5 text-[#00418F] shadow-sm transition-all duration-300 hover:border-[#00418F]/30 hover:bg-[#FFEE00]/10">
                          <EnvelopeIcon className="mr-3 h-5 w-5 text-[#00418F]" />
                          <div className="flex-1 text-left">
                            <span className="font-medium">E-mail</span>
                            <p className="text-sm text-gray-500">
                              {user?.email || "Não definido"}
                            </p>
                          </div>
                          <PencilIcon className="h-4 w-4 text-[#00418F]/50" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Editar E-mail</DialogTitle>
                          <DialogDescription>
                            Altere seu endereço de e-mail aqui. Para sua
                            segurança, confirme sua senha atual.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="email" className="text-right">
                              E-mail
                            </label>
                            <input
                              id="email"
                              type="email"
                              defaultValue={user?.email}
                              onChange={(e) => {
                                setEditingEmail(e.target.value);
                                setError("");
                                setSuccess("");
                              }}
                              className="col-span-3 rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#00418F] focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label
                              htmlFor="currentPassword"
                              className="text-right"
                            >
                              Senha Atual
                            </label>
                            <div className="relative col-span-3">
                              <input
                                id="currentPassword"
                                type={showPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => {
                                  setCurrentPassword(e.target.value);
                                  setError("");
                                  setSuccess("");
                                }}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#00418F] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 transform"
                              >
                                {showPassword ? (
                                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                                ) : (
                                  <EyeIcon className="h-5 w-5 text-gray-500" />
                                )}
                              </button>
                            </div>
                          </div>
                          {error && (
                            <p className="col-span-4 mt-2 text-center text-sm text-red-500">
                              {error}
                            </p>
                          )}
                          {success && (
                            <p className="col-span-4 mt-2 text-center text-sm text-green-500">
                              {success}
                            </p>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            onClick={handleSaveEmail}
                            className="bg-[#00418F] hover:bg-[#00418F]/90"
                            disabled={isSaving}
                          >
                            {isSaving ? "Salvando..." : "Salvar alterações"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex w-full items-center rounded-lg border border-[#00418F]/10 bg-white p-3.5 text-[#00418F] shadow-sm transition-all duration-300 hover:border-[#00418F]/30 hover:bg-[#FFEE00]/10">
                          <PhoneIcon className="mr-3 h-5 w-5 text-[#00418F]" />
                          <div className="flex-1 text-left">
                            <span className="font-medium">Telefone</span>
                            {/* Mostra o telefone do estado, ou "Não definido" */}
                            <p className="text-sm text-gray-500">
                              {editingPhone || "Não definido"}
                            </p>
                          </div>
                          <PencilIcon className="h-4 w-4 text-[#00418F]/50" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Editar Telefone</DialogTitle>
                          <DialogDescription>
                            Adicione ou altere seu número de telefone aqui.
                            Clique em salvar quando terminar.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="phone" className="text-right">
                              Telefone
                            </label>
                            <input
                              id="phone"
                              type="tel"
                              value={editingPhone} // Vincula o valor do input ao estado
                              onChange={(e) => {
                                setEditingPhone(e.target.value); // Atualiza o estado ao digitar
                                setError(""); // Limpa o erro ao digitar
                                setSuccess(""); // Limpa o sucesso ao digitar
                              }}
                              placeholder="(11) 99999-9999"
                              className="col-span-3 rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#00418F] focus:outline-none"
                            />
                          </div>
                          {error && (
                            <p className="col-span-4 mt-2 text-center text-sm text-red-500">
                              {error}
                            </p>
                          )}
                          {success && (
                            <p className="col-span-4 mt-2 text-center text-sm text-green-500">
                              {success}
                            </p>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            onClick={handleSavePhone} // Chama a nova função para salvar o telefone
                            className="bg-[#00418F] hover:bg-[#00418F]/90"
                            disabled={isSaving}
                          >
                            {isSaving ? "Salvando..." : "Salvar alterações"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-[#00418F]">
                    Preferências
                  </h3>
                  <div className="space-y-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex w-full items-center rounded-lg border border-[#00418F]/10 bg-white p-3.5 text-[#00418F] shadow-sm transition-all duration-300 hover:border-[#00418F]/30 hover:bg-[#FFEE00]/10">
                          <LanguageIcon className="mr-3 h-5 w-5 text-[#00418F]" />
                          <div className="flex-1 text-left">
                            <span className="font-medium">Idioma</span>
                            <p className="text-sm text-gray-500">
                              Português (Brasil)
                            </p>
                          </div>
                          <PencilIcon className="h-4 w-4 text-[#00418F]/50" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Selecionar Idioma</DialogTitle>
                          <DialogDescription>
                            Escolha o idioma de sua preferência para a interface
                            do aplicativo.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Idioma disponível:
                            </label>
                            <select className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#00418F] focus:outline-none">
                              <option value="pt-BR">Português (Brasil)</option>
                              <option value="en-US" disabled>
                                English (US) - Em breve
                              </option>
                              <option value="es-ES" disabled>
                                Español - Em breve
                              </option>
                            </select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            className="bg-[#00418F] hover:bg-[#00418F]/90"
                          >
                            Salvar alterações
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex w-full items-center rounded-lg border border-[#00418F]/10 bg-white p-3.5 text-[#00418F] shadow-sm transition-all duration-300 hover:border-[#00418F]/30 hover:bg-[#FFEE00]/10">
                          <CogIcon className="mr-3 h-5 w-5 text-[#00418F]" />
                          <div className="flex-1 text-left">
                            <span className="font-medium">
                              Configurações avançadas
                            </span>
                            <p className="text-sm text-gray-500">
                              Personalizar experiência
                            </p>
                          </div>
                          <PencilIcon className="h-4 w-4 text-[#00418F]/50" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Configurações Avançadas</DialogTitle>
                          <DialogDescription>
                            Personalize sua experiência com configurações
                            avançadas do aplicativo.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-sm font-medium">
                                  Notificações push
                                </label>
                                <p className="text-xs text-gray-500">
                                  Receber notificações no dispositivo
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                className="rounded"
                                defaultChecked
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-sm font-medium">
                                  Modo desenvolvedor
                                </label>
                                <p className="text-xs text-gray-500">
                                  Ativar recursos para desenvolvedores
                                </p>
                              </div>
                              <input type="checkbox" className="rounded" />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-sm font-medium">
                                  Analytics
                                </label>
                                <p className="text-xs text-gray-500">
                                  Compartilhar dados de uso anônimos
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                className="rounded"
                                defaultChecked
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            className="bg-[#00418F] hover:bg-[#00418F]/90"
                          >
                            Salvar configurações
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="animate-fadeIn space-y-6">
                <h3 className="mb-4 text-lg font-semibold text-[#00418F]">
                  Aparência
                </h3>
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <button
                    onClick={() => updatePreferences({ theme: "light" })}
                    className={`flex flex-col items-center rounded-lg p-6 shadow-md transition-all duration-300 hover:shadow-lg ${
                      preferences.theme === "light"
                        ? "border-2 border-[#FFEE00] bg-white"
                        : "border border-[#00418F]/10 bg-[#00418F]/5 hover:border-[#00418F]/30"
                    }`}
                  >
                    <div
                      className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                        preferences.theme === "light"
                          ? "bg-[#FFEE00]"
                          : "bg-[#00418F]/10"
                      }`}
                    >
                      <SunIcon className="h-8 w-8 text-[#00418F]" />
                    </div>
                    <span className="font-medium text-[#00418F]">
                      Modo Claro
                    </span>
                    <p className="mt-2 text-center text-sm text-gray-500">
                      Interface clara para uso diurno
                    </p>
                  </button>

                  <button
                    onClick={() => updatePreferences({ theme: "dark" })}
                    className={`flex flex-col items-center rounded-lg p-6 shadow-md transition-all duration-300 hover:shadow-lg ${
                      preferences.theme === "dark"
                        ? "border-2 border-[#FFEE00] bg-gray-800 text-white"
                        : "border border-[#00418F]/10 bg-[#00418F]/5 text-[#00418F] hover:border-[#00418F]/30"
                    }`}
                  >
                    <div
                      className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                        preferences.theme === "dark"
                          ? "bg-gray-700"
                          : "bg-[#00418F]/10"
                      }`}
                    >
                      <MoonIcon className="${preferences.theme === 'dark' ? 'text-white' : 'text-[#00418F]'} h-8 w-8" />
                    </div>
                    <span className="${preferences.theme === 'dark' ? 'text-white' : 'text-[#00418F]'} font-medium">
                      Modo Escuro
                    </span>
                    <p className="${preferences.theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mt-2 text-center text-sm">
                      Interface escura para uso noturno
                    </p>
                  </button>
                </div>

                <div className="mt-6">
                  <h4 className="mb-3 text-base font-semibold text-[#00418F]">
                    Outras Preferências de Aparência
                  </h4>
                  <div className="flex items-center justify-between rounded-lg border border-[#00418F]/10 bg-white p-4 shadow-sm">
                    <div>
                      <label
                        htmlFor="hide-footer"
                        className="text-sm font-medium text-[#00418F]"
                      >
                        Ocultar rodapé
                      </label>
                      <p className="text-xs text-gray-500">
                        Oculte o rodapé em todas as páginas para uma
                        visualização mais limpa.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="hide-footer"
                      checked={preferences.hideFooter}
                      onChange={() =>
                        updatePreferences({
                          hideFooter: !preferences.hideFooter,
                        })
                      }
                      className="form-checkbox h-5 w-5 cursor-pointer rounded text-[#00418F] focus:ring-[#00418F]"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="animate-fadeIn space-y-6">
                <h3 className="mb-4 text-lg font-semibold text-[#00418F]">
                  Segurança da Conta
                </h3>
                <div className="space-y-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="flex w-full items-center rounded-lg border border-[#00418F]/10 bg-white p-3.5 text-[#00418F] shadow-sm transition-all duration-300 hover:border-[#00418F]/30 hover:bg-[#FFEE00]/10">
                        <LockClosedIcon className="mr-3 h-5 w-5 text-[#00418F]" />
                        <div className="flex-1 text-left">
                          <span className="font-medium">Alterar Senha</span>
                          <p className="text-sm text-gray-500">
                            Redefina sua senha para maior segurança
                          </p>
                        </div>
                        <PencilIcon className="h-4 w-4 text-[#00418F]/50" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Alterar Senha</DialogTitle>
                        <DialogDescription>
                          Preencha os campos abaixo para alterar sua senha. Você
                          precisará de sua senha atual.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label
                            htmlFor="current-password"
                            className="text-right"
                          >
                            Senha atual
                          </label>
                          <div className="relative col-span-3">
                            <input
                              id="current-password"
                              type={showPassword ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => {
                                setCurrentPassword(e.target.value);
                                setError("");
                                setSuccess("");
                              }}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-transparent focus:ring-2 focus:ring-[#00418F] focus:outline-none"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeSlashIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="new-password" className="text-right">
                            Nova senha
                          </label>
                          <div className="relative col-span-3">
                            <input
                              id="new-password"
                              type={showNewPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => {
                                setNewPassword(e.target.value);
                                setError("");
                                setSuccess("");
                              }}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-transparent focus:ring-2 focus:ring-[#00418F] focus:outline-none"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                            >
                              {showNewPassword ? (
                                <EyeSlashIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label
                            htmlFor="confirm-new-password"
                            className="text-right"
                          >
                            Confirmar nova senha
                          </label>
                          <div className="relative col-span-3">
                            <input
                              id="confirm-new-password"
                              type={
                                showConfirmNewPassword ? "text" : "password"
                              }
                              value={confirmNewPassword}
                              onChange={(e) => {
                                setConfirmNewPassword(e.target.value);
                                setError("");
                                setSuccess("");
                              }}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-transparent focus:ring-2 focus:ring-[#00418F] focus:outline-none"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                              onClick={() =>
                                setShowConfirmNewPassword(
                                  !showConfirmNewPassword,
                                )
                              }
                            >
                              {showConfirmNewPassword ? (
                                <EyeSlashIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        {error && (
                          <p className="col-span-4 mt-2 text-center text-sm text-red-500">
                            {error}
                          </p>
                        )}
                        {success && (
                          <p className="col-span-4 mt-2 text-center text-sm text-green-500">
                            {success}
                          </p>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          type="submit"
                          onClick={handleSavePassword}
                          className="bg-[#00418F] hover:bg-[#00418F]/90"
                          disabled={isSaving}
                        >
                          {isSaving ? "Salvando..." : "Salvar alterações"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="animate-fadeIn space-y-6">
                <h3 className="mb-4 text-lg font-semibold text-[#00418F]">
                  Configurações de Notificação
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-[#00418F]/10 bg-white p-4 shadow-sm">
                    <div>
                      <label
                        htmlFor="email-notifications"
                        className="text-sm font-medium text-[#00418F]"
                      >
                        Notificações por E-mail
                      </label>
                      <p className="text-xs text-gray-500">
                        Receber atualizações importantes e avisos por e-mail.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="email-notifications"
                      className="form-checkbox h-5 w-5 cursor-pointer rounded text-[#00418F] focus:ring-[#00418F]"
                      defaultChecked
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-[#00418F]/10 bg-white p-4 shadow-sm">
                    <div>
                      <label
                        htmlFor="sms-notifications"
                        className="text-sm font-medium text-[#00418F]"
                      >
                        Notificações por SMS
                      </label>
                      <p className="text-xs text-gray-500">
                        Receber alertas urgentes via mensagens de texto (apenas
                        se o telefone estiver cadastrado).
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="sms-notifications"
                      className="form-checkbox h-5 w-5 cursor-pointer rounded text-[#00418F] focus:ring-[#00418F]"
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-[#00418F]/10 bg-white p-4 shadow-sm">
                    <div>
                      <label
                        htmlFor="app-notifications"
                        className="text-sm font-medium text-[#00418F]"
                      >
                        Notificações no Aplicativo
                      </label>
                      <p className="text-xs text-gray-500">
                        Ver notificações dentro do aplicativo.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="app-notifications"
                      className="form-checkbox h-5 w-5 cursor-pointer rounded text-[#00418F] focus:ring-[#00418F]"
                      defaultChecked
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
