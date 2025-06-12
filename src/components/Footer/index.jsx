

import { useState, useEffect, useContext } from "react"
import { Link, useLocation } from "react-router-dom"
import { Facebook, Instagram, Linkedin, Youtube, Phone, Mail, MapPin, ChevronUp, Wheat } from 'lucide-react'
import { AuthContext } from "../../context/AuthContext"

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const location = useLocation()
  const isCalculatorPage = location.pathname.includes('/calculator')
  const { hideFooter, user } = useContext(AuthContext)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Se o rodapé estiver oculto E o usuário estiver logado, apenas renderiza o botão de voltar ao topo
  if (user && hideFooter) {
    return (
      <>
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className={`fixed ${isCalculatorPage ? 'right-25' : 'right-6'} bottom-6  bg-[#FFEE00] hover:bg-[#FFEE00]/80 text-[#00418F] p-3 rounded-full shadow-lg transition-all duration-300 z-50`}
            aria-label="Voltar ao topo"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        )}
      </>
    );
  }

  return (
    <>
      {/* Botão de voltar ao topo */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={`fixed ${isCalculatorPage ? 'right-25' : 'right-6'} bottom-6  bg-[#FFEE00] hover:bg-[#FFEE00]/80 text-[#00418F] p-3 rounded-full shadow-lg transition-all duration-300 z-50`}
          aria-label="Voltar ao topo"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

      <footer className="w-full bg-gradient-to-b from-[#00418F] to-[#00418F]/90 text-white mt-auto">
        {/* Ondulação decorativa no topo do footer */}
        {/* <div className="w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-12"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-white"
            ></path>
          </svg>
        </div> */}

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo e Sobre */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Wheat className="h-8 w-8 text-[#FFEE00]" />
                <h2 className="text-xl font-bold">Calculadora do Agricultor</h2>
              </div>
              <p className="text-white/80 leading-relaxed">
                Uma ferramenta essencial que ajuda agricultores a otimizar suas operações através de cálculos precisos e
                confiáveis para melhorar a produtividade no campo.
              </p>
            </div>

            {/* Links Úteis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b border-[#00418F]/30 pb-2">Links Úteis</h3>
              <ul className="space-y-2 text-white/80">
                <li>
                  <Link
                    to="/"
                    className="hover:text-[#FFEE00] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-[#FFEE00] rounded-full group-hover:w-2 group-hover:h-2 transition-all"></span>
                    Início
                  </Link>
                </li>
                <li>
                  <Link
                    to="/calculator"
                    className="hover:text-[#FFEE00] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-[#FFEE00] rounded-full group-hover:w-2 group-hover:h-2 transition-all"></span>
                    Calculadora
                  </Link>
                </li>
                <li>
                  <Link
                    to="/politica-de-privacidade"
                    className="hover:text-[#FFEE00] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-[#FFEE00] rounded-full group-hover:w-2 group-hover:h-2 transition-all"></span>
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link
                    to="/termos-de-uso"
                    className="hover:text-[#FFEE00] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-[#FFEE00] rounded-full group-hover:w-2 group-hover:h-2 transition-all"></span>
                    Termos de Uso
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b border-[#00418F]/30 pb-2">Contato</h3>
              <div className="space-y-3 text-white/80">
                <p className="flex items-center gap-3">
                  <Phone className="text-[#FFEE00] h-5 w-5" />
                  <span>(11) 1234-5678</span>
                </p>
                <p className="flex items-center gap-3">
                  <Mail className="text-[#FFEE00] h-5 w-5" />
                  <span className="break-all">contato@calculadoradoagricultor.com.br</span>
                </p>
                <p className="flex items-start gap-3">
                  <MapPin className="text-yellow-400 h-5 w-5 mt-1 flex-shrink-0" />
                  <span>Av. Agricultura Sustentável, 123 - São Paulo, SP</span>
                </p>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b border-[#00418F]/30 pb-2">Sugestões de Melhorias</h3>
              <p className="text-gray-300">Envie sugestões para tornarmos sua experiência ainda melhor:</p>
              <form className="mt-2 space-y-2">
                <input
                  type="email"
                  placeholder="Sua sugestão"
                  className="w-full px-4 py-2 rounded bg-[#00418F]/80 border border-[#00418F]/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFEE00]"
                />
                <button
                  type="submit"
                  className="w-full bg-[#FFEE00] hover:bg-[#FFEE00]/80 text-[#00418F] font-medium py-2 px-4 rounded transition-colors"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>

          {/* Redes Sociais e Copyright */}
          <div className="mt-12 pt-8 border-t border-[#00418F]/30">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex gap-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#00418F]/80 hover:bg-[#FFEE00] hover:text-[#00418F] p-3 rounded-full transition-all duration-300"
                  aria-label="Facebook"
                >
<Facebook size={20} strokeWidth={2} aria-hidden="true" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#00418F]/80 hover:bg-[#FFEE00] hover:text-[#00418F] p-3 rounded-full transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#00418F]/80 hover:bg-[#FFEE00] hover:text-[#00418F] p-3 rounded-full transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#00418F]/80 hover:bg-[#FFEE00] hover:text-[#00418F] p-3 rounded-full transition-all duration-300"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
              <p className="text-white/80 text-center md:text-right">
                © {new Date().getFullYear()} Calculadora do Agricultor. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer

