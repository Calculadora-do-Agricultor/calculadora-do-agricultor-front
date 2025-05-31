import { useState } from 'react';
import { MapPin, X, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import './styles.css';

/**
 * Modal para solicitar permissão de localização do usuário
 * @param {Object} props - Propriedades do componente
 * @param {boolean} props.isOpen - Controla se o modal está aberto
 * @param {Function} props.onClose - Função chamada ao fechar o modal
 * @param {Function} props.onAccept - Função chamada quando o usuário aceita compartilhar localização
 * @param {Function} props.onDecline - Função chamada quando o usuário recusa compartilhar localização
 * @param {string} props.permissionStatus - Status atual da permissão ('prompt', 'granted', 'denied')
 */
const LocationPermissionModal = ({ 
  isOpen, 
  onClose, 
  onAccept, 
  onDecline,
  permissionStatus = 'prompt'
 }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAccept = async () => {
    setLoading(true);
    await onAccept();
    setLoading(false);
  };

  const handleDecline = () => {
    onDecline();
  };

  return (
    <div className="location-permission-modal-overlay">
      <div className="location-permission-modal">
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <MapPin size={20} />
            </div>
            <h2 className="modal-title">Permissão de Localização</h2>
          </div>
          <button onClick={onClose} className="close-button" aria-label="Fechar modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="location-icon-container">
            <MapPin size={48} className="location-icon" />
          </div>
          
          <h3 className="modal-subtitle">Compartilhe sua localização</h3>
          
          <p className="modal-description">
            A Calculadora do Agricultor gostaria de acessar sua localização para melhorar a experiência do usuário e personalizar o serviço de acordo com sua região.
          </p>
          
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
          
          <div className="privacy-note">
            <Info size={16} className="info-icon" />
            <p>
              Seus dados de localização são utilizados para análises de alcance da Calculadora do Agricultor 
              e para melhorar nossos serviços com suporte a múltiplos idiomas no futuro. 
              Você pode alterar esta configuração a qualquer momento nas configurações da sua conta.
            </p>
          </div>

          {permissionStatus === 'denied' && (
            <div className="permission-denied-warning">
              <AlertTriangle size={16} className="warning-icon" />
              <p>
                Você negou a permissão de localização. Para compartilhar sua localização, 
                você precisará alterar as configurações do seu navegador.
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            onClick={handleDecline} 
            className="decline-button" 
            disabled={loading}
          >
            Não compartilhar
          </button>
          <button 
            onClick={handleAccept} 
            className="accept-button" 
            disabled={loading || permissionStatus === 'denied'}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                <span>Processando...</span>
              </>
            ) : (
              'Compartilhar localização'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;