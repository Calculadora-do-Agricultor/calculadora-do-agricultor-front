
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube} from 'react-icons/fa';
const Footer = () => {
  return (
    <footer className="w-full bg-blue-900 text-white px-6 py-2 flex justify-between items-ceenter text-base md:text-lg">
      <span>Copyrigth (C) 2025</span>
      <a href="politica-de-privacidade" className="hover:underline">
        Política de Privaciade
      </a>
      <div className="flex gap-4 text-white">
        <a href="https://facebook.com" target="_black" rel="noopener noreferrer"><FaFacebookF className="hover:text-yellow-400" /></a>
        <a href="https://instagrem.com" target="_black" rel="noopener noreferrer"><FaInstagram className="hover:text-yellow-400" /></a>
        <a href="https://youtube.com" target="_black" rel="noopener noreferrer"><FaYoutube className="hover:text-yellow-400" /></a>
        <a href="https://linkedin.com" target="_black" rel="noopener noreferrer"><FaLinkedinIn className="hover:text-yellow-400" /></a>
      </div>
      </footer>
  )
}
export default Footer;






