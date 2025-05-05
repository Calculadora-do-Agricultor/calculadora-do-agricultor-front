import { Link } from 'react-router-dom';
import logoClara from '../../assets/logoClara.svg';

const Navbar = () => {
  return (

    <nav className="bg-blue-900 w-full px-6 py-3 flex items-center border-b-4 border-yellow-400 shadow-md justify-between">
      <div className="flex items-center space-x-3">
        <img src={logoClara} alt="Logo" className="h-12" />
        <div className="text-white">
          <h1 className="text-lg font-bold">Calculadora do</h1>
          <h2 className="text-lg">Agricultor</h2>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-4 text-white">
            <Link className='hover:bg-yellow-400 rounded' to="/">Página Inicial</Link>
            <Link className='hover:bg-yellow-400 rounded'to="/Login">Entrar</Link>
            <Link className='hover:bg-yellow-400 rounded' to="/Register">Cadastre-se</Link>
            <Link className='hover:bg-yellow-400 rounded'to="/calculator">Calculadora</Link>
            <Link className='hover:bg-yellow-400 rounded'to="/Settings">Configurações</Link>
          </div>
          {/* Bandeira ou ícone */}
          <img
            src="https://flagcdn.com/w40/br.png"
            alt="Bandeira do Brasil"
            className="h-6 w-8 rounded-sm"
          />
      </div>
    </nav>
  )
}
export default Navbar;