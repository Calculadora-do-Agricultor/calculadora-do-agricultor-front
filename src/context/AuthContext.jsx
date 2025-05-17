import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../services/firebaseConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hideFooter, setHideFooter] = useState(false);
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
          
          // Carregar a preferência de ocultar rodapé, se existir
          if (userData.hideFooter !== undefined) {
            setHideFooter(userData.hideFooter);
          } else {
            // Se o usuário não tiver a preferência definida, definir como falso (rodapé visível) por padrão
            setHideFooter(false);
            try {
              await updateDoc(docRef, {
                hideFooter: false
              });
            } catch (error) {
              console.error("Erro ao definir preferência padrão de rodapé:", error);
            }
          }
        }
      } else {
        // Se não estiver logado, sempre mostrar o rodapé
        setUser(null);
        setHideFooter(false);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Função para atualizar a preferência de ocultar rodapé
  const toggleHideFooter = async (value) => {
    // Só permite alterar a configuração se o usuário estiver logado
    if (user) {
      setHideFooter(value);
      
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          hideFooter: value
        });
      } catch (error) {
        console.error("Erro ao atualizar preferência de rodapé:", error);
      }
    } else {
      // Se não estiver logado, sempre mostra o rodapé
      setHideFooter(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, hideFooter, toggleHideFooter, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
