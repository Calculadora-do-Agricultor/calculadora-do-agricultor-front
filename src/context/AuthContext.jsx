import React, { createContext, useState, useEffect } from "react";
import { authWrapper, firestoreWrapper } from "../services/firebaseWrapper";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [preferences, setPreferences] = useState({
    theme: "light",
    hideFooter: false,
    language: "pt-BR",
    notifications: {
      email: true,
      push: true,
      marketing: false
    },
    accessibility: {
      highContrast: false,
      fontSize: "medium",
      reducedMotion: false
    },
    privacy: {
      shareLocation: false,
      shareUsageData: true,
      profileVisibility: "private"
    }
  });

  useEffect(() => {
    const unsubscribe = authWrapper.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          try {
            const userData = await firestoreWrapper.getDocument("users", firebaseUser.uid);

          if (userData) {
            // Verificar se a conta está ativa
            if (userData.active === false) {
              console.warn('Tentativa de acesso com conta desativada:', {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                timestamp: new Date().toISOString()
              });

              // Deslogar o usuário imediatamente
              await authWrapper.signOut();
              setUser(null);
              setIsAdmin(false);

              setLoading(false);

              // Dispara um evento customizado para mostrar mensagem de conta desativada
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('accountDisabled'));
              }, 100);
              return;
            }

            setUser({ uid: firebaseUser.uid, ...userData });
            setIsAdmin(userData.role === 'admin');


            // Carregar as preferências do usuário, se existirem
            if (userData.preferences) {
              setPreferences(userData.preferences);
            } else {
              // Se o usuário não tiver preferências definidas, criar com valores padrão
              const defaultPreferences = {
                theme: "light",
                hideFooter: false,
                language: "pt-BR",
                notifications: {
                  email: true,
                  push: true,
                  marketing: false
                },
                accessibility: {
                  highContrast: false,
                  fontSize: "medium",
                  reducedMotion: false
                },
                privacy: {
                  shareLocation: false,
                  shareUsageData: true,
                  profileVisibility: "private"
                }
              };
              setPreferences(defaultPreferences);
              try {
                // Use firestoreWrapper.updateDocument aqui também
                await firestoreWrapper.updateDocument("users", firebaseUser.uid, {
                  preferences: defaultPreferences
                });
              } catch (error) {
                console.error("Erro ao definir preferências padrão:", error);
              }
            }
          } else { // Caso userData seja null (usuário existe no auth, mas não no Firestore)
             setUser(null);
             setIsAdmin(false);
          }
        } catch (error) {
          console.error("Erro ao carregar dados do usuário Firestore:", error);
          // Trate erros de leitura do Firestore (ex: exibir mensagem, deslogar)
          setUser(null);
        } finally { // Adicione um finally para garantir que loading seja false
           setLoading(false);
        }
      } else {
        // Se não estiver logado, resetar para valores padrão
        setUser(null);
        setIsAdmin(false);
        setPreferences({
          theme: "light",
          hideFooter: false,
          language: "pt-BR",
          notifications: {
            email: true,
            push: true,
            marketing: false
          },
          accessibility: {
            highContrast: false,
            fontSize: "medium",
            reducedMotion: false
          },
          privacy: {
            shareLocation: false,
            shareUsageData: true,
            profileVisibility: "private"
          }
        });
        setLoading(false); // Garante que loading seja false mesmo sem usuário
        }
      } catch (error) {
        console.error("Erro no onAuthStateChanged:", error);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Função para atualizar preferências
  const updatePreferences = async (newPreferences, showNotification = true) => {
    if (user) {
      const updatedPreferences = { ...preferences, ...newPreferences };
      setPreferences(updatedPreferences);

      try {
        // CORREÇÃO AQUI: Usando firestoreWrapper.updateDocument
        await firestoreWrapper.updateDocument("users", user.uid, {
          preferences: updatedPreferences
        }, showNotification);
      } catch (error) {
        console.error("Erro ao atualizar preferências:", error);
      }
    }
  };

  // Função para atualizar a preferência de ocultar rodapé (mantida para compatibilidade)
  const toggleHideFooter = async (value, toastCallback = null) => {
    try {
      await updatePreferences({ hideFooter: value }, false);
      if (toastCallback) {
        if (value) {
          toastCallback.success('Footer desativado');
        } else {
          toastCallback.success('Footer ativado');
        }
      }
    } catch (error) {
      if (toastCallback) {
        toastCallback.error('Erro ao alterar configuração do footer');
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin,
      preferences,
      updatePreferences,
      hideFooter: preferences.hideFooter,
      toggleHideFooter
    }}>
      {children}
    </AuthContext.Provider>
  );
};