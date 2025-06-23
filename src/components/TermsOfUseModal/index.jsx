import { useState, useEffect } from 'react';
import { X, Info, FileText, CheckCircle } from 'lucide-react';
import './styles.css';

/**
 * Modal para exibir os termos de uso da aplicação
 * @param {Object} props - Propriedades do componente
 * @param {boolean} props.isOpen - Controla se o modal está aberto
 * @param {Function} props.onClose - Função chamada ao fechar o modal
 * @param {Function} props.onAccept - Função chamada quando o usuário aceita os termos
 * @param {Function} props.onDecline - Função chamada quando o usuário recusa os termos
 */
const TermsOfUseModal = ({ 
  isOpen, 
  onClose, 
  onAccept, 
  onDecline
 }) => {
  const [loading, setLoading] = useState(false);
  const [acceptLocationSharing, setAcceptLocationSharing] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Adiciona/remove a classe no body para bloquear o scroll quando o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup: remover a classe quando o componente for desmontado
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);
  
  if (!isOpen) return null;

  const handleAccept = async () => {
    if (!acceptTerms) return;
    
    setLoading(true);
    await onAccept(acceptLocationSharing);
    setLoading(false);
  };

  const handleDecline = () => {
    onDecline();
  };

  return (
    <div className="terms-modal-overlay">
      <div className="terms-modal">
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <FileText size={20} />
            </div>
            <h2 className="modal-title">Termos de Uso</h2>
          </div>
          <button onClick={onClose} className="close-button" aria-label="Fechar modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="terms-icon-container">
            <FileText size={48} className="terms-icon" />
          </div>
          
          <h3 className="modal-subtitle">Termos de Uso da Calculadora do Agricultor</h3>
          
          <div className="terms-content">
            <p>Bem-vindo à Calculadora do Agricultor. Ao utilizar nosso serviço, você concorda com os seguintes termos:</p>
            
            <h4>1. Uso do Serviço</h4>
            <p>A Calculadora do Agricultor oferece ferramentas para auxiliar agricultores em seus cálculos e planejamentos. Nossos serviços estão disponíveis apenas para maiores de 18 anos.</p>
            
            <h4>2. Conta de Usuário</h4>
            <p>Para utilizar nossos serviços, você precisa criar uma conta com informações precisas e completas. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta.</p>
            
            <h4>3. Segurança e Coleta de Dados</h4>
            <p>Para garantir a segurança de todos os usuários e da aplicação, coletamos automaticamente seu endereço IP durante o uso dos nossos serviços. Esta informação é utilizada exclusivamente para:</p>
            <ul>
              <li>Prevenção de fraudes e atividades maliciosas</li>
              <li>Monitoramento de segurança da aplicação</li>
              <li>Análise de logs para manutenção e melhorias do sistema</li>
              <li>Proteção contra ataques e tentativas de invasão</li>
            </ul>
            <p>Adicionalmente, a coleta de localização é <strong>opcional</strong> e é utilizada para fins de marketing e personalização da experiência do usuário, conforme descrito na seção de benefícios abaixo.</p>
            
            <h4>4. Privacidade</h4>
            <p>Nossa Política de Privacidade descreve como coletamos, usamos e compartilhamos suas informações pessoais. Ao utilizar nossos serviços, você concorda com nossa coleta e uso de informações conforme descrito.</p>
            
            <h4>5. Conteúdo</h4>
            <p>Você é responsável por todo o conteúdo que enviar ou criar usando nossos serviços. Não permitimos conteúdo ilegal, ofensivo ou que viole direitos de terceiros.</p>
            
            <h4>6. Modificações</h4>
            <p>Podemos modificar estes termos a qualquer momento. Continuando a usar o serviço após as alterações, você concorda com os novos termos.</p>
          </div>
          
          <div className="checkbox-container">
            <label htmlFor="accept-terms" className="checkbox-label">
              <input 
                id="accept-terms"
                type="checkbox" 
                checked={acceptTerms} 
                onChange={(e) => setAcceptTerms(e.target.checked)} 
                className="terms-checkbox"
              />
              <span>Eu li e aceito os termos de uso</span>
            </label>
          </div>
          
          <div className="checkbox-container">
            <label htmlFor="accept-location" className="checkbox-label">
              <input 
                id="accept-location"
                type="checkbox" 
                checked={acceptLocationSharing} 
                onChange={(e) => setAcceptLocationSharing(e.target.checked)} 
                className="location-checkbox"
                disabled={!acceptTerms}
              />
              <span>Aceito compartilhar minha localização para melhorar a experiência do usuário</span>
            </label>
          </div>
          
          <div className="location-benefits">
            <h4>Benefícios de compartilhar sua localização:</h4>
            <div className="benefits-list">
              <div className="benefit-item">
                <CheckCircle size={16} className="benefit-icon" />
                <span>Personalização do idioma baseado na sua localização</span>
              </div>
              <div className="benefit-item">
                <CheckCircle size={16} className="benefit-icon" />
                <span>Conteúdo e cálculos adaptados para sua região</span>
              </div>
              <div className="benefit-item">
                <CheckCircle size={16} className="benefit-icon" />
                <span>Melhor suporte e assistência técnica local</span>
              </div>
            </div>
          </div>
          
          <div className="privacy-note">
            <Info size={16} className="info-icon" />
            <p>
              Seus dados de localização são utilizados para análises de alcance da Calculadora do Agricultor 
              e para melhorar nossos serviços com suporte a múltiplos idiomas no futuro. 
              Você pode alterar esta configuração a qualquer momento nas configurações da sua conta.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            onClick={handleDecline} 
            className="decline-button" 
            disabled={loading}
          >
            Recusar
          </button>
          <button 
            onClick={handleAccept} 
            className="accept-button" 
            disabled={loading || !acceptTerms}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                <span>Processando...</span>
              </>
            ) : (
              'Aceitar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUseModal;