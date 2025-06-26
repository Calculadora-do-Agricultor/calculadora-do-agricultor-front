import React, { useState, useEffect, useContext } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { AuthContext } from "../../context/AuthContext";
import { AdminContext } from "../../context/AdminContext";
import { Navigate } from "react-router-dom";
import {
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  UsersIcon,
  UserIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import "./UserManagement.css";

// Implementação das métricas gerais de usuários (sem opção de filtro)
const UserMetrics = ({ users }) => {
  // Calcular métricas para os cards
  const calculateMetrics = (usersToAnalyze) => {
    const totalUsers = usersToAnalyze.length;
    const activeUsers = usersToAnalyze.filter(user => user.status === "active").length;
    const inactiveUsers = usersToAnalyze.filter(user => user.status === "inactive").length;
    const adminUsers = usersToAnalyze.filter(user => user.role === "admin").length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
    };
  };

  const metrics = calculateMetrics(users);

  return (
    <div className="border-b border-[#00418F]/10 bg-gradient-to-r from-[#00418F]/5 to-transparent p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#00418F]">
          Métricas de Usuários
        </h2>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl p-6 border border-[#00418F]/20 hover:border-[#00418F]/40 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-[#00418F]/80 font-medium mb-2">Total de Usuários</p>
              <p className="text-3xl font-bold text-[#00418F] leading-tight">{metrics.totalUsers}</p>
            </div>
            <div className="ml-4 p-4 bg-gradient-to-br from-[#00418F] to-[#00418F]/80 rounded-xl shadow-md">
              <UsersIcon className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#00418F]/20 hover:border-[#00418F]/40 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-[#00418F]/80 font-medium mb-2">Usuários Ativos</p>
              <p className="text-3xl font-bold text-[#00418F] leading-tight">{metrics.activeUsers}</p>
            </div>
            <div className="ml-4 p-4 bg-gradient-to-br from-[#00418F] to-[#00418F]/80 rounded-xl shadow-md">
              <UserPlusIcon className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#00418F]/20 hover:border-[#00418F]/40 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-[#00418F]/80 font-medium mb-2">Usuários Inativos</p>
              <p className="text-3xl font-bold text-[#00418F] leading-tight">{metrics.inactiveUsers}</p>
            </div>
            <div className="ml-4 p-4 bg-gradient-to-br from-[#00418F] to-[#00418F]/80 rounded-xl shadow-md">
              <UserMinusIcon className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#00418F]/20 hover:border-[#00418F]/40 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-[#00418F]/80 font-medium mb-2">Administradores</p>
              <p className="text-3xl font-bold text-[#00418F] leading-tight">{metrics.adminUsers}</p>
            </div>
            <div className="ml-4 p-4 bg-gradient-to-br from-[#00418F] to-[#00418F]/80 rounded-xl shadow-md">
              <ShieldCheckIcon className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const usersPerPage = 10;

  const { user } = useContext(AuthContext);
  const { isAdmin } = useContext(AdminContext);

  // Função para buscar os usuários
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCollectionRef = collection(db, "users");
      const querySnapshot = await getDocs(usersCollectionRef);

      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });

      setUsers(usersData);
      setTotalPages(Math.ceil(usersData.length / usersPerPage));
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setError("Falha ao carregar os usuários. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin]);

  // Filtrar usuários com base nos filtros aplicados
  const filteredUsers = users.filter((user) => {
    // Filtro de papel (role)
    let matchesRole = true;
    if (filterRole === "admin") {
      matchesRole = user.role === "admin";
    } else if (filterRole === "user") {
      matchesRole = user.role === "user" || !user.role;
    }

    // Filtro de status
    let matchesStatus = true;
    if (filterStatus === "active") {
      matchesStatus = user.active !== false; // Se não tiver a propriedade active, considera como ativo
    } else if (filterStatus === "inactive") {
      matchesStatus = user.active === false;
    }

    // Filtro de busca (nome ou email)
    const matchesSearch =
      searchQuery === "" ||
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesRole && matchesStatus && matchesSearch;
  });

  // Paginação
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Função para alterar o papel do usuário (admin/user)
  const toggleUserRole = async (userId, currentRole) => {
    try {
      const userRef = doc(db, "users", userId);
      const newRole = currentRole === "admin" ? "user" : "admin";
      await updateDoc(userRef, { role: newRole });
      
      // Atualizar o estado local
      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, role: newRole };
        }
        return user;
      }));
    } catch (err) {
      console.error("Erro ao alterar papel do usuário:", err);
      setError("Falha ao alterar papel do usuário. Por favor, tente novamente.");
    }
  };

  // Função para ativar/desativar usuário
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, "users", userId);
      const newStatus = currentStatus === false;
      await updateDoc(userRef, { active: newStatus });
      
      // Atualizar o estado local
      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, active: newStatus };
        }
        return user;
      }));
    } catch (err) {
      console.error("Erro ao alterar status do usuário:", err);
      setError("Falha ao alterar status do usuário. Por favor, tente novamente.");
    }
  };

  // Verificar se o usuário é administrador
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Componente para exibir um usuário
  const UserCard = ({ user }) => {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#00418F]/20 hover:border-[#00418F]/40 transition-colors duration-150">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="flex items-start space-x-3 md:col-span-1">
            <div className="flex-shrink-0">
              <UserIcon className="h-5 w-5 text-[#00418F]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-[#00418F] font-medium mb-1">Nome</p>
              <p className="text-sm text-gray-800">{user.name || 'Nome não definido'}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 md:col-span-1">
            <div className="flex-shrink-0">
              <UserIcon className="h-5 w-5 text-[#00418F]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-[#00418F] font-medium mb-1">Email</p>
              <p className="text-sm text-gray-800 truncate">{user.email || 'Email não disponível'}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 md:col-span-1">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-5 w-5 text-[#00418F]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-[#00418F] font-medium mb-1">Papel</p>
              <div className="flex items-center">
                {user.role === "admin" ? (
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                    <ShieldCheckIcon className="h-3 w-3 mr-1" />
                    Administrador
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    <UserIcon className="h-3 w-3 mr-1" />
                    Usuário
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 md:col-span-1">
            <div className="flex-shrink-0">
              {user.active === false ? (
                <XCircleIcon className="h-5 w-5 text-[#00418F]" />
              ) : (
                <CheckCircleIcon className="h-5 w-5 text-[#00418F]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-[#00418F] font-medium mb-1">Status</p>
              <div className="flex items-center">
                {user.active === false ? (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                    <XCircleIcon className="h-3 w-3 mr-1" />
                    Inativo
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Ativo
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 md:col-span-1">
            <button
              onClick={() => toggleUserRole(user.id, user.role)}
              className="inline-flex items-center rounded-md bg-[#00418F]/10 px-3 py-2 text-sm font-medium text-[#00418F] hover:bg-[#00418F]/20 transition-colors duration-150"
              title={user.role === "admin" ? "Tornar usuário comum" : "Tornar administrador"}
            >
              {user.role === "admin" ? (
                <>
                  <UserIcon className="h-4 w-4 mr-1" />
                  Tornar usuário
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  Tornar admin
                </>
              )}
            </button>
            
            <button
              onClick={() => toggleUserStatus(user.id, user.active)}
              className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                user.active === false
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-red-100 text-red-800 hover:bg-red-200"
              }`}
              title={user.active === false ? "Ativar usuário" : "Desativar usuário"}
            >
              {user.active === false ? (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Ativar
                </>
              ) : (
                <>
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Desativar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="user-management-container">
      <div className="user-management-content">
        <div className="border-b border-[#00418F]/10 bg-gradient-to-r from-[#00418F]/5 to-transparent p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#00418F]">Gerenciamento de Usuários</h1>
            <button
              onClick={fetchUsers}
              className="flex items-center rounded-lg bg-[#00418F] px-4 py-2 text-white shadow-sm hover:bg-[#00418F]/90 transition-colors duration-150"
              title="Atualizar lista de usuários"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Atualizar
            </button>
          </div>
        </div>
        
        {/* Métricas de Usuários */}
        <UserMetrics users={users} />

        {/* Filtros */}
        <div className="border-b border-[#00418F]/10 bg-gradient-to-r from-[#00418F]/5 to-transparent p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Filtro de busca */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
                <UserIcon className="h-5 w-5 text-[#00418F]/70" />
              </div>
              <label htmlFor="search-users" className="sr-only">
                Buscar usuários por nome ou email
              </label>
              <input
                id="search-users"
                type="text"
                placeholder="Buscar por nome ou email..."
                className="w-full rounded-xl border border-[#00418F]/20 bg-white/80 py-3 pr-4 pl-12 text-gray-700 placeholder-[#00418F]/60 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-[#00418F]/30 focus:border-[#00418F] focus:ring-[#00418F]/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filtro de papel */}
            <select
              className="cursor-pointer rounded-xl border border-[#00418F]/20 bg-white/80 pl-4 pr-12 py-3 font-medium text-[#00418F] shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-[#00418F]/30 focus:border-[#00418F] focus:ring-[#00418F]/20 appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2300418F'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.25em 1.25em'
              }}
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">Todos os papéis</option>
              <option value="admin">Administradores</option>
              <option value="user">Usuários comuns</option>
            </select>

            {/* Filtro de status */}
            <select
              className="cursor-pointer rounded-xl border border-[#00418F]/20 bg-white/80 pl-4 pr-12 py-3 font-medium text-[#00418F] shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-[#00418F]/30 focus:border-[#00418F] focus:ring-2 focus:ring-[#00418F]/20 appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2300418F'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.25em 1.25em'
              }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>

          {/* Indicador de filtros ativos */}
          {(filterRole !== "all" || filterStatus !== "all" || searchQuery) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#00418F]/10 pt-4">
              <span className="text-sm font-medium text-[#00418F]/70">
                Filtros ativos:
              </span>
              {filterRole !== "all" && (
                <span className="rounded-full bg-[#00418F]/10 px-3 py-1 text-sm font-medium text-[#00418F]">
                  {filterRole === "admin" ? "Administradores" : "Usuários comuns"}
                </span>
              )}
              {filterStatus !== "all" && (
                <span className="rounded-full bg-[#00418F]/10 px-3 py-1 text-sm font-medium text-[#00418F]">
                  {filterStatus === "active" ? "Ativos" : "Inativos"}
                </span>
              )}
              {searchQuery && (
                <span className="rounded-full bg-[#00418F]/10 px-3 py-1 text-sm font-medium text-[#00418F]">
                  Busca: {searchQuery}
                </span>
              )}
              <button
                onClick={() => {
                  setFilterRole("all");
                  setFilterStatus("all");
                  setSearchQuery("");
                }}
                className="ml-2 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-200 transition-colors duration-150"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Lista de usuários */}
        <div className="p-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="spinner"></div>
              <p className="ml-3 text-[#00418F]">Carregando usuários...</p>
            </div>
          ) : error ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <ExclamationCircleIcon className="h-12 w-12 text-red-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Erro ao carregar usuários</h3>
              <p className="mt-1 text-gray-500">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-4 rounded-md bg-[#00418F] px-4 py-2 text-white shadow-sm hover:bg-[#00418F]/90 transition-colors duration-150"
              >
                Tentar novamente
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <UsersIcon className="h-12 w-12 text-[#00418F]/50" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum usuário encontrado</h3>
              <p className="mt-1 text-gray-500">
                {users.length === 0
                  ? "Não há usuários cadastrados no sistema."
                  : "Nenhum usuário corresponde aos filtros aplicados."}
              </p>
              {users.length > 0 && (
                <button
                  onClick={() => {
                    setFilterRole("all");
                    setFilterStatus("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 rounded-md bg-[#00418F] px-4 py-2 text-white shadow-sm hover:bg-[#00418F]/90 transition-colors duration-150"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {currentUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}

              {/* Paginação */}
              {filteredUsers.length > usersPerPage && (
                <div className="mt-6 flex items-center justify-between border-t border-[#00418F]/10 pt-4">
                  <div className="text-sm text-[#00418F]/70">
                    Mostrando <span className="font-medium text-[#00418F]">{indexOfFirstUser + 1}</span> a{" "}
                    <span className="font-medium text-[#00418F]">
                      {Math.min(indexOfLastUser, filteredUsers.length)}
                    </span>{" "}
                    de <span className="font-medium text-[#00418F]">{filteredUsers.length}</span> usuários
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`rounded-md p-2 ${currentPage === 1 ? "cursor-not-allowed text-[#00418F]/30" : "text-[#00418F] hover:bg-[#00418F]/10"}`}
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`rounded-md p-2 ${currentPage === totalPages ? "cursor-not-allowed text-[#00418F]/30" : "text-[#00418F] hover:bg-[#00418F]/10"}`}
                    >
                      <ChevronRightIcon className="h-5 w-7" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;