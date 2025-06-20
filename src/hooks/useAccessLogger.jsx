import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

/**
 * Hook personalizado para registrar logs de acesso dos usuários
 * @param {string} userId - ID do usuário autenticado
 * @returns {Object} - Funções e estados relacionados ao registro de logs de acesso
 */
export const useAccessLogger = (userId = null) => {
  const [isLogging, setIsLogging] = useState(false);
  const [logError, setLogError] = useState(null);
  const [userIp, setUserIp] = useState(null);

  // Função para obter o IP do usuário
  const fetchUserIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Erro ao obter IP do usuário:', error);
      return 'IP não disponível';
    }
  };

  // Efeito para obter o IP do usuário quando o hook é inicializado
  useEffect(() => {
    const getIp = async () => {
      const ip = await fetchUserIp();
      setUserIp(ip);
    };
    getIp();
  }, []);

  // Função para criar um log de acesso no Firestore
  const createAccessLog = async (userId, page, action = 'acesso') => {
    if (!userId) {
      console.warn('Tentativa de criar log sem ID de usuário');
      return null;
    }

    try {
      setIsLogging(true);
      setLogError(null);
      
      // Obter IP se ainda não estiver disponível
      const ip = userIp || await fetchUserIp();
      
      // Dados do log de acesso
      const logData = {
        userId: userId,
        ip: ip,
        timestamp: serverTimestamp(),
        page: page,
        action: action,
        userAgent: navigator.userAgent,
        sessionId: localStorage.getItem('sessionId') || crypto.randomUUID()
      };

      // Salvar o log no Firestore
      const logsCollectionRef = collection(db, "accessLogs");
      const docRef = await addDoc(logsCollectionRef, logData);
      
      console.log('Log de acesso registrado com sucesso:', docRef.id);
      setIsLogging(false);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar log de acesso:', error);
      setLogError(error.message);
      setIsLogging(false);
      return null;
    }
  };

  return {
    isLogging,
    logError,
    userIp,
    createAccessLog
  };
};

export default useAccessLogger;