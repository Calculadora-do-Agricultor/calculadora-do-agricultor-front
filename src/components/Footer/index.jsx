
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaPhone, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Seção Sobre */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sobre Nós</h3>
            <p className="text-sm text-gray-300">
              Calculadora do Agricultor é uma ferramenta que ajuda agricultores a
              otimizar suas operações através de cálculos precisos e confiáveis.
            </p>
          </div>

          {/* Links Úteis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Links Úteis</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/" className="hover:text-yellow-400 transition-colors">Início</Link></li>
              <li><Link to="/calculator" className="hover:text-yellow-400 transition-colors">Calculadora</Link></li>
              <li><Link to="/politica-de-privacidade" className="hover:text-yellow-400 transition-colors">Política de Privacidade</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contato</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p className="flex items-center gap-2">
                <FaPhone className="text-yellow-400" />
                <span>(11) 1234-5678</span>
              </p>
              <p className="flex items-center gap-2">
                <FaEnvelope className="text-yellow-400" />
                <span>contato@calculadoradoagricultor.com.br</span>
              </p>
            </div>
          </div>
        </div>

        {/* Redes Sociais e Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-4 text-white">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">
                <FaFacebookF className="text-xl" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">
                <FaInstagram className="text-xl" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">
                <FaLinkedinIn className="text-xl" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">
                <FaYoutube className="text-xl" />
              </a>
            </div>
            <p className="text-sm text-gray-300">
              © {new Date().getFullYear()} Calculadora do Agricultor. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;






