import { useEffect, useState } from "react";
import { db } from "../../services/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { styles } from "./styles";

export function CalculationList({ category }) {
  const [calculations, setCalculations] = useState([]);
  const [setLoading] = useState(true);

  useEffect(() => {
    const fetchCalculations = async () => {
      const q = query(collection(db, "calculos"), where("categoria", "==", category));
      const querySnapshot = await getDocs(q);

      const calculationsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCalculations(calculationsData);
      setLoading(false);
    };

    if (category) {
      fetchCalculations();
    }
  }, [category]);

  return (
    <div className={styles.container}>
      {calculations.length === 0 ? (
        <p className={styles.message}>Não há cálculos disponíveis para esta categoria.</p>
      ) : (
        <ul className={styles.list}>
          {calculations.map((calculation) => (
            <li key={calculation.id} className={styles.item}>
              <h3 className={styles.title}>{calculation.nome}</h3>
              <p className={styles.description}>{calculation.descricao}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}