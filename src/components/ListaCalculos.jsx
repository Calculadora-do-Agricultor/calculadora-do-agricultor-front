import { useEffect, useState } from "react";
import { db } from "../services/firebaseConfig"; // Ajuste para seu Firebase
import { collection, query, where, getDocs } from "firebase/firestore";

export function ListaCalculos({ categoria }) {
  const [calculos, setCalculos] = useState([]);
  const [setLoading] = useState(true);

  // Buscar cálculos da categoria selecionada
  useEffect(() => {
    const fetchCalculos = async () => {
      const q = query(collection(db, "calculos"), where("categoria", "==", categoria));
      const querySnapshot = await getDocs(q);

      const calculosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCalculos(calculosData);
      setLoading(false);
    };

    if (categoria) {
      fetchCalculos();
    }
  }, [categoria]);

  return (
    <div>
      {calculos.length === 0 ? (
        <p>Não há cálculos disponíveis para esta categoria.</p>
      ) : (
        <ul>
          {calculos.map((calculo) => (
            <li key={calculo.id}>
              <h3>{calculo.nome}</h3>
              <p>{calculo.descricao}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
