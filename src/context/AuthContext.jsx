import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../services/firebaseConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUser({ uid: firebaseUser.uid, ...userData });
          
          // Verificar se o usuário é administrador
          setIsAdmin(userData.role === "admin");
          
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
              await updateDoc(docRef, {
                preferences: defaultPreferences
              });
            } catch (error) {
              console.error("Erro ao definir preferências padrão:", error);
            }
          }
        }
      } else {
        // Se não estiver logado, resetar para valores padrão
        setUser(null);
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
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Função para atualizar preferências
  const updatePreferences = async (newPreferences) => {
    if (user) {
      const updatedPreferences = { ...preferences, ...newPreferences };
      setPreferences(updatedPreferences);
      
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          preferences: updatedPreferences
        });
      } catch (error) {
        console.error("Erro ao atualizar preferências:", error);
      }
    }
  };

  // Função para atualizar a preferência de ocultar rodapé (mantida para compatibilidade)
  const toggleHideFooter = async (value) => {
    await updatePreferences({ hideFooter: value });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      preferences, 
      updatePreferences,
      hideFooter: preferences.hideFooter, 
      toggleHideFooter, 
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
