import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

/**
 * Hook personalizado para gerenciar a coleta de localização e geração de logs
 * @param {string} userId - ID do usuário (opcional)
 * @returns {Object} - Funções e estados relacionados à coleta de localização e geração de logs
 */
export const useLocationLogger = (userId = null) => {
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const [isLogging, setIsLogging] = useState(false);
  const [logError, setLogError] = useState(null);
  
  // Função para solicitar permissão de localização
  const requestLocationPermission = async () => {
    try {
      // Verificar se o navegador suporta geolocalização
      if (!navigator.geolocation) {
        console.error('Geolocalização não é suportada por este navegador');
        return { permissionGranted: false, locationData: { status: 'Geolocalização não suportada pelo navegador' } };
      }

      // Função para obter a posição atual como uma Promise
      const getCurrentPositionPromise = () => {
        return new Promise((resolve, reject) => {
          // Variáveis para controlar a melhor precisão obtida
          let bestPosition = null;
          let bestAccuracy = Infinity;
          let watchId = null;
          
          // Função para processar a posição e verificar se é mais precisa
          const processPosition = (position) => {
            console.log('Precisão atual:', position.coords.accuracy, 'metros');
            
            // Se a precisão for melhor que a anterior, atualiza a melhor posição
            if (position.coords.accuracy < bestAccuracy) {
              bestAccuracy = position.coords.accuracy;
              bestPosition = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
              };
              
              // Se a precisão for boa o suficiente (menos de 20 metros), podemos parar
              if (bestAccuracy < 20 && watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
                resolve({ permissionGranted: true, locationData: bestPosition });
              }
            }
          };
          
          // Primeiro, tenta obter uma posição única
          navigator.geolocation.getCurrentPosition(
            (position) => {
              processPosition(position);
              
              // Se não conseguimos uma precisão boa o suficiente, inicia o watchPosition
              if (watchId === null && bestAccuracy > 20) {
                watchId = navigator.geolocation.watchPosition(
                  processPosition,
                  (error) => {
                    // Se ocorrer erro no watchPosition, usa a melhor posição obtida até agora
                    if (bestPosition) {
                      resolve({ permissionGranted: true, locationData: bestPosition });
                    } else {
                      handlePositionError(error, resolve);
                    }
                    
                    if (watchId !== null) {
                      navigator.geolocation.clearWatch(watchId);
                      watchId = null;
                    }
                  },
                  { 
                    enableHighAccuracy: true, 
                    timeout: 20000, 
                    maximumAge: 0 
                  }
                );
                
                // Define um timeout para parar o watchPosition após 10 segundos
                setTimeout(() => {
                  if (watchId !== null) {
                    navigator.geolocation.clearWatch(watchId);
                    watchId = null;
                    
                    if (bestPosition) {
                      resolve({ permissionGranted: true, locationData: bestPosition });
                    } else {
                      resolve({ 
                        permissionGranted: false, 
                        locationData: { status: 'Não foi possível obter localização com precisão adequada' }
                      });
                    }
                  }
                }, 10000);
              } else if (watchId === null) {
                // Se já temos uma boa precisão, resolve imediatamente
                resolve({ permissionGranted: true, locationData: bestPosition });
              }
            },
            (error) => handlePositionError(error, resolve),
            { 
              enableHighAccuracy: true, 
              timeout: 20000, 
              maximumAge: 0 
            }
          );
          
          // Função para tratar erros de posição
          const handlePositionError = (error, resolveFunc) => {
            console.error('Erro ao obter localização:', error);
            let errorMessage = 'Falha na coleta da localização';
            
            // Personalizar mensagem de erro com base no código de erro
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Usuário negou a coleta de localização';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Informações de localização indisponíveis';
                break;
              case error.TIMEOUT:
                errorMessage = 'Tempo esgotado ao coletar localização';
                break;
            }
            
            resolveFunc({ 
              permissionGranted: false, 
              locationData: { status: errorMessage }
            });
          };
        });
      };

      return await getCurrentPositionPromise();
    } catch (error) {
      console.error('Erro ao solicitar permissão de localização:', error);
      return { 
        permissionGranted: false, 
        locationData: { status: 'Erro inesperado ao solicitar localização' }
      };
    }
  };

  // Função para obter o IP do usuário
  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org/?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Erro ao obter IP:', error);
      return 'IP não disponível';
    }
  };

  // Função para criar um log no Firestore
  const createLog = async (userId, description, acceptedLocationSharing) => {
    try {
      setIsLogging(true);
      
      // Obter o IP do usuário
      const userIP = await getUserIP();
      
      // Dados básicos do log - incluindo IP
      const logData = {
        idUser: userId, // id do usuário
        description: description, // descrição da ação
        date: serverTimestamp(), // data da ação
        ip: userIP, // endereço IP do usuário
        location: { status: 'Usuário optou por não compartilhar localização' } // valor padrão
      };

      // Se o usuário aceitou compartilhar localização, tentar obter os dados
      if (acceptedLocationSharing) {
        console.log('Solicitando permissão de localização...');
        
        // Solicitar permissão e obter localização
        const { permissionGranted, locationData } = await requestLocationPermission();
        
        // Sempre usar os dados de localização retornados, que agora sempre terão um valor
        logData.location = locationData;
        console.log('Dados de localização registrados:', locationData);
      }

      // Salvar o log no Firestore
      console.log('Salvando log no Firestore');
      const logsCollectionRef = collection(db, "logs");
      await addDoc(logsCollectionRef, logData);
      console.log('Log salvo com sucesso');
      
      setIsLogging(false);
      return logData;
    } catch (error) {
      console.error('Erro ao criar log:', error);
      setLogError(error.message);
      setIsLogging(false);
      return null;
    }
  };

  // Função para registrar um log de registro de usuário
  const logUserRegistration = async (userId, acceptedLocationSharing = false) => {
    try {
      // Criar o log com os campos simplificados
      return await createLog(
        userId,
        'Cadastro de usuário', // description
        acceptedLocationSharing
      );
    } catch (error) {
      console.error('Erro ao registrar log de usuário:', error);
      return null;
    }
  };

  return {
    locationPermission,
    isLogging,
    logError,
    requestLocationPermission,
    createLog,
    logUserRegistration,
  };
};

export default useLocationLogger;