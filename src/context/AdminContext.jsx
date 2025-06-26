import React, { createContext, useState, useEffect, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { AuthContext } from "./AuthContext";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setIsAdmin(userData.role === "admin");
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, [user]);

  return (
    <AdminContext.Provider value={{ 
      isAdmin,
      loading
    }}>
      {children}
    </AdminContext.Provider>
  );
};