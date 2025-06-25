import React, { useState, useEffect, useContext, memo } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore"; // Removi getDoc não utilizado aqui
import { db, auth } from "../../services/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { AuthContext } from "../../context/AuthContext";
import {
  ArrowRight,
  Search,
  Calendar,
  Clock, // Não utilizado, pode ser removido
  LayoutGrid, // Não utilizado, pode ser removido
  ListIcon, // Não utilizado, pode ser removido
  SlidersHorizontal,
  Share2, // Não utilizado, pode ser removido
  ChevronDown,
  AlertCircle,
  Eye,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import CalculationModal from "../CalculationModal";
import { Tooltip } from "../ui/Tooltip"; // Tooltip importado, mas não utilizado. Se não for usar, pode ser removido.
import CalculationActions from "../CalculationActions";
import "./styles.css";
const CalculationList = ({
  category,
  calculations: externalCalculations,
  searchTerm = "",
  viewMode = "grid",
  sortOption: initialSortOption = "name_asc",
  complexityFilters = [], // Não utilizado no código fornecido, pode ser removido se não for usar.
  onEditCalculation,
  onCalculationDeleted,
}) => {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredCalculations, setFilteredCalculations] = useState([]);
  const [selectedCalculation, setSelectedCalculation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState(initialSortOption);
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Estados para o modal de exclusão global
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [calculationToDelete, setCalculationToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Usar o isAdmin do AuthContext em vez de verificar localmente
  const { isAdmin: contextIsAdmin } = useContext(AuthContext);

  useEffect(() => {
    setIsAdmin(contextIsAdmin);
  }, [contextIsAdmin]);



  // Efeito para bloquear/desbloquear scroll do body quando o modal de exclusão está aberto
  useEffect(() => {
    if (showDeleteModal) {
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "unset";
      setDeleteError(null);
      setDeleteSuccess(false);
    }

    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "unset";
    };
  }, [showDeleteModal]);

  // Fetch calculations from Firestore or use externalCalculations
  useEffect(() => {
    if (externalCalculations) {
      setCalculations(externalCalculations);
      setLoading(false);
      return;
    }

    const fetchCalculations = async () => {
      try {
        setLoading(true);
        setError(null);

        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categoryDoc = categoriesSnapshot.docs.find(
          (doc) => doc.data().name === category,
        );

        if (!categoryDoc) {
          setCalculations([]);
          setLoading(false);
          return;
        }

        const categoryId = categoryDoc.id;

        const q = query(
          collection(db, "calculations"),
          where("categories", "array-contains", categoryId),
        );
        const querySnapshot = await getDocs(q);

        const calculationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          views: doc.data().views || 0,
          createdAt: doc.data().createdAt || { toDate: () => new Date() },
          updatedAt: doc.data().updatedAt || { toDate: () => new Date() },
          tags: doc.data().tags || [],
        }));

        setCalculations(calculationsData);
      } catch (err) {
        console.error("Erro ao buscar cálculos:", err);
        setError(
          "Não foi possível carregar os cálculos. Tente novamente mais tarde.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (category && !externalCalculations) {
      fetchCalculations();
    }
  }, [category, externalCalculations]);

  // Filter and sort calculations based on search term and sort option
  useEffect(() => {
    if (!calculations.length) {
      setFilteredCalculations([]);
      return;
    }

    let filtered = [...calculations];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((calc) => {
        const name = calc.name || calc.nome || "";
        const description = calc.description || calc.descricao || "";
        const tags = calc.tags || [];

        return (
          name.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower) ||
          tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      });
    }

    // Apply sorting
    filtered = sortCalculations(filtered, sortOption);

    setFilteredCalculations(filtered);
  }, [searchTerm, calculations, sortOption]);

  const sortCalculations = (calcs, option) => {
    switch (option) {
      case "name_asc":
        return [...calcs].sort((a, b) =>
          (a.name || a.nome || "").localeCompare(b.name || b.nome || ""),
        );
      case "name_desc":
        return [...calcs].sort((a, b) =>
          (b.name || b.nome || "").localeCompare(a.name || a.nome || ""),
        );
      case "date_newest":
        return [...calcs].sort(
          (a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime(), // Usar getTime() para garantir comparação numérica
        );
      case "date_oldest":
        return [...calcs].sort(
          (a, b) => a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime(), // Usar getTime() para garantir comparação numérica
        );
      case "views_desc":
        return [...calcs].sort((a, b) => (b.views || 0) - (a.views || 0));
      default:
        return calcs;
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Hoje";
    if (diffInDays === 1) return "Ontem";
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} meses atrás`;
    return `${Math.floor(diffInDays / 365)} anos atrás`;
  };

  // Função para abrir o modal do cálculo
  const handleCalculationClick = (calculation) => {
    if (!calculation) return;

    // Reseta o estado do modal antes de abrir um novo
    setSelectedCalculation(null);
    setIsModalOpen(false);

    // Pequeno delay para garantir que o estado anterior foi limpo antes de setar o novo
    setTimeout(() => {
      setSelectedCalculation(calculation);
      setIsModalOpen(true);
    }, 0);
  };

  // Função para abrir o modal de exclusão
  const handleDeleteClick = (calculation) => {
    setCalculationToDelete(calculation);
    setShowDeleteModal(true);
  };

  // Função para confirmar a exclusão
  const handleConfirmDelete = async () => {
    if (!calculationToDelete) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);

      // Adicionar um pequeno atraso para mostrar o estado de loading
      await new Promise((resolve) => setTimeout(resolve, 500));

      await deleteDoc(doc(db, "calculations", calculationToDelete.id));

      // Remover o cálculo da lista
      setFilteredCalculations((prev) =>
        prev.filter((calc) => calc.id !== calculationToDelete.id),
      );
      setCalculations((prev) =>
        prev.filter((calc) => calc.id !== calculationToDelete.id),
      );

      // Mostrar mensagem de sucesso antes de fechar o modal
      setDeleteSuccess(true);

      // Notificar o componente pai que um cálculo foi excluído
      if (onCalculationDeleted) {
        onCalculationDeleted();
      }

      // Fechar o modal após um breve delay para mostrar a mensagem de sucesso
      setTimeout(() => {
        setShowDeleteModal(false);
        setCalculationToDelete(null);
      }, 1500);
    } catch (error) {
      console.error("Erro ao excluir cálculo:", error);
      setDeleteError("Não foi possível excluir o cálculo. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Função para cancelar a exclusão
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCalculationToDelete(null);
  };

  // Skeleton loading component - Corrigido!
  const CalculationSkeleton = () => (
    <div className="calculation-card is-loading">
      <div className="calculation-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-description"></div>
        <div className="skeleton-description"></div>
        <div className="skeleton-description" style={{ width: "70%" }}></div>
      </div>
      <div className="calculation-footer">
        <div className="skeleton-button"></div>
      </div>
    </div>
  );

  // Removi o console.log que estava disparando a cada render
  // useEffect(() => {
  //   console.log('Estado do modal:', { isModalOpen, selectedCalculation });
  // }, [isModalOpen, selectedCalculation]);

  if (loading) {
    return (
      <div className="calculations-container">
        <div className="calculations-header">
          <div className="calculations-count">
            <div className="skeleton-text"></div>
          </div>
          <div className="calculations-actions">
            <div className="skeleton-action"></div>
            <div className="skeleton-action"></div>
          </div>
        </div>
        <div className={`calculations-${viewMode}`}>
          {Array(6)
            .fill()
            .map((_, index) => (
              <CalculationSkeleton key={index} />
            ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calculations-error">
        <AlertCircle size={48} className="mb-4 text-red-500" />
        <h3 className="mb-2 text-xl font-semibold text-gray-800">
          Erro ao carregar cálculos
        </h3>
        <p className="mb-4 text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-red-100 px-4 py-2 font-medium text-red-700 transition-colors hover:bg-red-200"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (filteredCalculations.length === 0) {
    return (
      <div className="calculations-empty">
        <Search size={48} className="mb-4 text-gray-400" />
        <h3 className="mb-2 text-xl font-semibold text-gray-800">
          {searchTerm
            ? "Nenhum resultado encontrado"
            : "Nenhum cálculo disponível"}
        </h3>
        <p className="mb-4 text-gray-600">
          {searchTerm
            ? `Não encontramos nenhum cálculo para "${searchTerm}" nesta categoria.`
            : "Não há cálculos disponíveis para esta categoria no momento."}
        </p>
        {searchTerm && (
          <button
            onClick={() => window.location.reload()} // Poderia ser uma função para limpar o termo de pesquisa
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            Limpar pesquisa
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* O modal está sendo renderizado dentro do componente principal e também dentro do #calculation-modal-container
          Isso causa duplicação. A melhor prática é renderizar o modal em um Portal FORA da estrutura principal do componente
          para evitar problemas de empilhamento e z-index.
          Deixei apenas a renderização dentro do Portal. */}

      <div className="calculations-container">
        <div className="calculations-header">
          <div className="calculations-count">
            {filteredCalculations.length} cálculo(s) encontrado(s)
          </div>
          <div className="calculations-actions">
            <div className="sort-dropdown">
              <button
                className="sort-button"
                onClick={() => setShowSortOptions(!showSortOptions)}
              >
                <SlidersHorizontal size={16} />
                Ordenar
                <ChevronDown size={16} />
              </button>
              {showSortOptions && (
                <div className="sort-options">
                  <button
                    className={sortOption === "name_asc" ? "active" : ""}
                    onClick={() => {
                      setSortOption("name_asc");
                      setShowSortOptions(false);
                    }}
                  >
                    Nome (A-Z)
                  </button>
                  <button
                    className={sortOption === "name_desc" ? "active" : ""}
                    onClick={() => {
                      setSortOption("name_desc");
                      setShowSortOptions(false);
                    }}
                  >
                    Nome (Z-A)
                  </button>
                  <button
                    className={sortOption === "date_newest" ? "active" : ""}
                    onClick={() => {
                      setSortOption("date_newest");
                      setShowSortOptions(false);
                    }}
                  >
                    Mais recentes
                  </button>
                  <button
                    className={sortOption === "date_oldest" ? "active" : ""}
                    onClick={() => {
                      setSortOption("date_oldest");
                      setShowSortOptions(false);
                    }}
                  >
                    Mais antigos
                  </button>
                  <button
                    className={sortOption === "views_desc" ? "active" : ""}
                    onClick={() => {
                      setSortOption("views_desc");
                      setShowSortOptions(false);
                    }}
                  >
                    Mais visualizados
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`calculations-${viewMode}`}>
          {filteredCalculations.map((calculation) => (
            <div
              key={calculation.id}
              id={`calculation-${calculation.id}`}
              className="calculation-card"
              // O onClick no card inteiro é ok, mas o handleCalculationClick
              // já está sendo chamado no div 'calculation-content'.
              // Removi o onClick duplicado do div pai para evitar chamadas múltiplas.
              // O cursor: pointer deve ser aplicado ao 'calculation-content'
            >
              <div
                className="calculation-content"
                onClick={(e) => {
                  e.stopPropagation(); // Evita que o clique se propague para o pai se o pai também tiver um onClick
                  handleCalculationClick(calculation);
                }}
                style={{ cursor: "pointer" }}
              >
                <h3 className="calculation-title">
                  {calculation.name || calculation.nome}
                </h3>
                <p className="calculation-description">
                  {calculation.description || calculation.descricao}
                </p>
                <div className="calculation-tags">
                  {calculation.tags?.map((tag, index) => (
                    <span key={index} className="calculation-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="calculation-metadata">
                  <span className="metadata-item">
                    <Calendar size={14} />
                    {getTimeAgo(calculation.createdAt.toDate())}
                  </span>
                  <span className="metadata-item">
                    <Eye size={14} />
                    {calculation.views || 0} visualizações
                  </span>
                </div>
              </div>
              <div
                className="calculation-actions"
                onClick={(e) => e.stopPropagation()} // Impede que o clique nas ações abra o modal do cálculo
              >
                <CalculationActions
                  calculation={calculation}
                  onEdit={onEditCalculation}
                  onDelete={handleDeleteClick}
                  isAdmin={isAdmin}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Renderização do CalculationModal fora do fluxo principal com createPortal
          Garantindo que ele seja um filho direto do body ou de um elemento portal */}
      {isModalOpen && selectedCalculation && (
        <CalculationModal
          calculation={selectedCalculation}
          isOpen={isModalOpen} // Passa o estado diretamente
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCalculation(null);
          }}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && calculationToDelete && (
        <div
          className="delete-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="delete-modal">
            {deleteSuccess ? (
              <div className="delete-modal-success">
                <CheckCircle className="delete-modal-success-icon" size={48} />
                <h2 id="delete-success-modal-title">Cálculo excluído</h2>
                <p>O cálculo foi excluído com sucesso.</p>
              </div>
            ) : (
              <>
                <div className="delete-modal-header">
                  <AlertTriangle className="delete-modal-icon" size={48} />
                  <h2 id="delete-modal-title">Confirmar exclusão</h2>
                </div>
                <div className="delete-modal-content">
                  <p>
                    Tem certeza que deseja excluir o cálculo{" "}
                    <strong>
                      "{calculationToDelete.name || calculationToDelete.nome}"
                    </strong>
                    ?
                  </p>
                  <p className="delete-modal-warning">
                    Esta ação não pode ser desfeita.
                  </p>

                  {deleteError && (
                    <div className="delete-modal-error">
                      <AlertCircle size={16} />
                      <span>{deleteError}</span>
                    </div>
                  )}
                </div>
                <div className="delete-modal-actions">
                  <button
                    className="delete-modal-cancel"
                    onClick={handleCancelDelete}
                    disabled={isDeleting}
                    aria-label="Cancelar exclusão"
                  >
                    Cancelar
                  </button>
                  <button
                    className="delete-modal-confirm"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    aria-label="Confirmar exclusão"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Excluindo...</span>
                      </>
                    ) : (
                      "Sim, excluir"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default memo(CalculationList);