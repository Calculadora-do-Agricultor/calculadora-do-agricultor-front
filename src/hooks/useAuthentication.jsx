import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } from "firebase/auth"

import { useState, useEffect } from "react";

// Função de logout independente, sem hooks
export const handleLogout = async () => {
    const auth = getAuth();
    try {
        await signOut(auth);
    } catch (error) {
        // Pode-se adicionar lógica de erro se necessário
        console.error("Erro ao fazer logout:", error);
    }
};

export const useAuthentication = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(null);
    const [cancelled, setCancelled] = useState(false);

    const auth = getAuth();

    function checkIfIsCancelled() {
        if (cancelled) {
            throw new Error("Operação cancelada");
        }
    }

    const createUser = async (data) => {
        checkIfIsCancelled();

        setLoading(true);

        try {
            const { user } = await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            );

            await updateProfile(user, {
                displayName: data.displayName,
            });
            return user;
        } catch (error) {
            console.log(error.message);
            console.log(typeof error.message);

            let systemErrorMessage;

            if (error.message.includes("Password")) {
                systemErrorMessage = "A senha precisa conter pelo menos 6 caracteres.";
            } else if (error.message.includes("email-already")) {
                systemErrorMessage = "E-mail já cadastrado.";
            } else {
                systemErrorMessage = "Ocorreu um erro, por favor tente mais tarde.";
            }
            setError(systemErrorMessage);
            setLoading(false);
            return null;
        }
    };

    return { createUser, error, loading };
}

export default useAuthentication;