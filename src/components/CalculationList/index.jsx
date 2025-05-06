import { useEffect, useState } from "react";
import { db } from "../../services/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { styles } from "./styles";

export function CalculationList({ category }) {
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCalculations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Corrigindo para usar a coleção "calculations" e o campo "category"
        const q = query(collection(db, "calculations"), where("category", "==", category));
        const querySnapshot = await getDocs(q);

        const calculationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCalculations(calculationsData);
      } catch (err) {
        console.error("Erro ao buscar cálculos:", err);
        setError("Não foi possível carregar os cálculos. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchCalculations();
    }
  }, [category]);

  return (
    <div className={styles.container}>
      {loading ? (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" aria-label="Carregando"></div>
          <span className="sr-only">Carregando...</span>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p>{error}</p>
        </div>
      ) : calculations.length === 0 ? (
        <p className={styles.message}>Não há cálculos disponíveis para esta categoria.</p>
      ) : (
        <ul className={styles.list}>
          {calculations.map((calculation) => (
            <li key={calculation.id} className={styles.item}>
              <h3 className={styles.title}>{calculation.name || calculation.nome}</h3>
              <p className={styles.description}>{calculation.description || calculation.descricao}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}