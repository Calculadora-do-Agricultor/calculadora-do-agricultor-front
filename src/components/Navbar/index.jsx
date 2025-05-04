import { Link, useLocation } from "react-router-dom";
import Logotipo from "../../assets/Logotipo.svg";
import {
  CalculatorIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const location = useLocation(); // Obtém a localização atual

  // Função para verificar se o link está ativo
  const isActive = (path) => location.pathname === path ? "bg-yellow-400 text-black" : "";

  return (
    <nav className="flex w-full items-center justify-between border-b-4 border-yellow-400 bg-blue-900 px-6 py-2 shadow-md">
      <div className="flex items-center space-x-3">
        <img src={Logotipo} alt="Logotipo" className="h-20" />
      </div>

      <div className="flex items-center space-x-2">
        <div className="mb-1 flex items-end space-x-4 text-lg text-white">
          <Link
            className={`flex items-center gap-1 rounded px-3 py-1 transition hover:bg-yellow-400 hover:text-black ${isActive("/Calculator")}`}
            to="/Calculator"
          >
            <CalculatorIcon className="h-6 w-6" />
            Calculadora
          </Link>

          <Link
            className={`flex items-center gap-1 rounded px-3 py-1 transition hover:bg-yellow-400 hover:text-black ${isActive("/empresas")}`}
            to="/empresas"
          >
            <BuildingOfficeIcon className="h-6 w-6" />
            Empresa
          </Link>

          <Link
            className={`flex items-center gap-1 rounded px-3 py-1 transition hover:bg-yellow-400 hover:text-black ${isActive("/configuracoes")}`}
            to="/configuracoes"
          >
            <Cog6ToothIcon className="h-6 w-6" />
            Configurações
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
