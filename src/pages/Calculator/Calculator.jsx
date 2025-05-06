import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { getDocs, collection, getDoc, doc, query, where} from "firebase/firestore";

import { auth, db } from "../../services/firebaseConfig";
import { Categories, CalculationList } from "../../components";
import CreateCategory from "../../components/CreateCategory";

export default function Calculator() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const navigate = useNavigate();
  const fetchCategorias = async () => {
    try {
      const categoriasSnapshot = await getDocs(collection(db, "categories"));
  
      const categoriasComCalculos = await Promise.all(
        categoriasSnapshot.docs.map(async (doc) => {
          const categoria = { id: doc.id, ...doc.data() };
  
          // Busca todos os cálculos que pertencem a esta categoria
          const calculosSnapshot = await getDocs(
            query(
              collection(db, "calculations"),
              where("category", "==", categoria.name)
            )
          );
  
          const calculos = calculosSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          return { ...categoria, calculos };
        })
      );
  
      setCategorias(categoriasComCalculos);
    } catch (error) {
      console.error("Erro ao buscar categorias com cálculos:", error);
    }
  };
  
  // Verificar se o usuário é admin
  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          setIsAdmin(docSnap.data().role === "admin");
        }
      });
    }

    fetchCategorias();
  }, [user]);

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4 text-blue-900">Categorias</h1>

      <Categories categories={categorias} onSelect={setCategoriaSelecionada} />

      {isAdmin && (
        <>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="fixed bottom-20 right-15 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Criar
          </button>

          {showOptions && (
            <div className="border border-black w-80 h-20 rounded flex items-center justify-center mt-2">
              <div className="flex gap-4 justify-around">
                <button
                  onClick={() => {
                    setShowCreateCategory(true);
                    setShowOptions(false);
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Criar Categoria
                </button>
                <button
                  onClick={() => {
                    navigate("/admin/criar-calculo"); // navega para a nova página
                  }}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Criar Cálculo
                </button>
              </div>
            </div>
          )}

          {showCreateCategory && (
            <CreateCategory
              onCreate={() => {
                fetchCategorias();
                setShowCreateCategory(false);
              }}
              onCancel={() => setShowCreateCategory(false)}
            />
          )}
        </>
      )}

      {categoriaSelecionada && <CalculationList category={categoriaSelecionada} />}
    </div>
  );
}
