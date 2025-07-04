import React, { useState, useEffect, memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  History,
  Clock,
  User,
  Calendar,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Loader2,
  X,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { CalculationHistoryService } from "../../services/calculationHistoryService";
import { useToast } from "../../context/ToastContext";

const CalculationHistoryModal = ({
  isOpen,
  onClose,
  onOpen,
  calculation,
  calculationHistoryId,
}) => {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { error: toastError, success: toastSuccess } = useToast();

  // Fetch real data from Firestore
  const fetchHistoryData = async () => {
    if (!calculationHistoryId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await CalculationHistoryService.getCalculationHistory(
        50,
        calculationHistoryId,
      );
      setHistoryData(data);
    } catch (err) {
      console.error("Error fetching calculation history:", err);
      setError("Erro ao carregar histórico de cálculos");
      toastError("Erro ao carregar histórico de cálculos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && calculationHistoryId) {
      fetchHistoryData();
    }
  }, [isOpen, calculationHistoryId]);

  // Adicionar listener para tecla ESC no modal de exclusão
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showDeleteModal && !deletingId) {
        handleCancelDelete();
      }
    };

    if (showDeleteModal) {
      document.addEventListener('keydown', handleEscKey);
      // Prevenir scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showDeleteModal, deletingId]);

  const formatDate = (timestamp) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (timestamp) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleViewDetails = (historyItem) => {
    setSelectedItem(historyItem);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedItem(null);
  };

  const handleDeleteClick = (historyItem) => {
    // Fechar o modal principal primeiro
    onClose();
    
    // Aguardar um momento antes de abrir o modal de exclusão
    setTimeout(() => {
      setItemToDelete(historyItem);
      setDeleteError(null);
      setDeleteSuccess(false);
      setDeletingId(null);
      setShowDeleteModal(true);
    }, 200);
  };

  const handleCancelDelete = () => {
    // Resetar todos os estados e fechar modal
    setShowDeleteModal(false);
    setItemToDelete(null);
    setDeleteError(null);
    setDeleteSuccess(false);
    setDeletingId(null);
    
    // Reabrir o modal do histórico após fechar o modal de exclusão
    setTimeout(() => {
      onOpen();
    }, 100);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setDeletingId(itemToDelete.id);
    setDeleteError(null);
    setDeleteSuccess(false);

    try {
      await CalculationHistoryService.deleteCalculationHistory(itemToDelete.id);

      // Remove item da lista local
      setHistoryData((prev) =>
        prev.filter((item) => item.id !== itemToDelete.id),
      );

      setDeleteSuccess(true);
      toastSuccess("Cálculo excluído do histórico com sucesso");

      // Fechar modal após 1.5 segundos
      setTimeout(() => {
        handleCancelDelete();
      }, 1500);
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      setDeleteError("Erro ao excluir item do histórico. Tente novamente.");
      toastError("Erro ao excluir item do histórico");
    } finally {
      setDeletingId(null);
    }
  };



  const getMainParameters = (item) => {
    if (!item.parametersUsed || !calculation?.parameters) return [];

    // Mapeia os IDs de volta aos nomes dos parâmetros
    const entries = Object.entries(item.parametersUsed).slice(0, 2);
    return entries.map(([paramId, value]) => {
      // Encontra o parâmetro correspondente pelo ID
      const param = calculation.parameters.find((p) => {
        const expectedId =
          p.id || `param_${p.name.toLowerCase().replace(/\s+/g, "_")}`;
        return expectedId === paramId;
      });

      let displayValue = value;

      // Se for um campo de seleção, formata como "Nome da Opção -> Valor"
      if (param && param.type === "select" && param.options) {
        const selectedOption = param.options.find(
          (option) => option.value == value,
        );
        if (selectedOption) {
          displayValue = `${selectedOption.label} → ${selectedOption.value}`;
        }
      }

      return {
        name: param
          ? param.name
          : paramId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value: displayValue,
        unit: param?.unit || "",
      };
    });
  };

  const getMainResults = (item) => {
    if (!item.results) return [];

    // Mapeia os IDs de volta aos nomes dos resultados
    const entries = Object.entries(item.results).slice(0, 2);
    return entries.map(([resultId, value]) => {
      let resultName = resultId;
      let resultUnit = "";
      let result = null;

      // Verifica se é um resultado principal (novo formato)
      if (calculation?.results && calculation.results.length > 0) {
        result = calculation.results.find((r) => {
          const expectedId =
            r.id || `res_${r.name.toLowerCase().replace(/\s+/g, "_")}`;
          return expectedId === resultId;
        });
        if (result) {
          resultName = result.name;
          resultUnit = result.unit || "";
        }
      }

      // Verifica se é um resultado adicional
      if (calculation?.additionalResults) {
        const additionalResult = calculation.additionalResults.find((r) => {
          const expectedId = r.id || `res_${r.key}`;
          return expectedId === resultId;
        });
        if (additionalResult) {
          resultName = additionalResult.name || additionalResult.key;
          resultUnit = additionalResult.unit || "";
          result = additionalResult;
        }
      }

      // Se não encontrou, usa o ID formatado
      if (resultName === resultId) {
        resultName = resultId
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
      }

      let displayValue = value;

      // Se for um resultado de seleção, formata como "Nome da Opção -> Valor"
      if (result && result.type === "select" && result.options) {
        const selectedOption = result.options.find(
          (option) => option.value == value,
        );
        if (selectedOption) {
          displayValue = `${selectedOption.label} → ${selectedOption.value}`;
        }
      } else if (typeof value === "number") {
        displayValue = formatCurrency(value);
      }

      return {
        name: resultName,
        value: displayValue,
        unit: resultUnit,
      };
    });
  };

  // Função para obter TODOS os parâmetros (para página de detalhes)
  const getAllParameters = (item) => {
    if (!item.parametersUsed || !calculation?.parameters) return [];

    const entries = Object.entries(item.parametersUsed);
    return entries.map(([paramId, value]) => {
      const param = calculation.parameters.find((p) => {
        const expectedId =
          p.id || `param_${p.name.toLowerCase().replace(/\s+/g, "_")}`;
        return expectedId === paramId;
      });

      let displayValue = value;

      if (param && param.type === "select" && param.options) {
        const selectedOption = param.options.find(
          (option) => option.value == value,
        );
        if (selectedOption) {
          displayValue = `${selectedOption.label} → ${selectedOption.value}`;
        }
      }

      return {
        name: param
          ? param.name
          : paramId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value: displayValue,
        unit: param?.unit || "",
        type: param?.type || "text",
        description: param?.description || "",
      };
    });
  };

  // Função para obter TODOS os resultados (para página de detalhes)
  const getAllResults = (item) => {
    if (!item.results) return [];

    const entries = Object.entries(item.results);
    return entries.map(([resultId, value]) => {
      let resultName = resultId;
      let resultUnit = "";
      let result = null;
      let description = "";

      if (calculation?.results && calculation.results.length > 0) {
        result = calculation.results.find((r) => {
          const expectedId =
            r.id || `res_${r.name.toLowerCase().replace(/\s+/g, "_")}`;
          return expectedId === resultId;
        });
        if (result) {
          resultName = result.name;
          resultUnit = result.unit || "";
          description = result.description || "";
        }
      }

      if (calculation?.additionalResults) {
        const additionalResult = calculation.additionalResults.find((r) => {
          const expectedId = r.id || `res_${r.key}`;
          return expectedId === resultId;
        });
        if (additionalResult) {
          resultName = additionalResult.name || additionalResult.key;
          resultUnit = additionalResult.unit || "";
          result = additionalResult;
          description = additionalResult.description || "";
        }
      }

      if (resultName === resultId) {
        resultName = resultId
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
      }

      let displayValue = value;

      if (result && result.type === "select" && result.options) {
        const selectedOption = result.options.find(
          (option) => option.value == value,
        );
        if (selectedOption) {
          displayValue = `${selectedOption.label} → ${selectedOption.value}`;
        }
      } else if (typeof value === "number") {
        displayValue = formatCurrency(value);
      }

      return {
        name: resultName,
        value: displayValue,
        unit: resultUnit,
        type: result?.type || "number",
        description: description,
      };
    });
  };

  // Memoized content component to prevent unnecessary re-renders
  const MemoizedDialogContent = memo(({ children, ...props }) => (
    <DialogContent {...props}>{children}</DialogContent>
  ));

  return (
    <>
      <Dialog open={isOpen && !showDeleteModal} onOpenChange={onClose}>
        <MemoizedDialogContent className="flex h-[85vh] sm:h-[80vh] w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:max-w-5xl flex-col overflow-hidden p-0">
          <DialogHeader className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 sm:px-6 py-3 sm:py-4">
            <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
              {showDetails ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToList}
                    className="rounded-lg p-2 transition-colors hover:bg-blue-200"
                  >
                    <ArrowLeft className="h-5 w-5 text-blue-600" />
                  </Button>
                  <div className="rounded-lg bg-blue-100 p-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  Detalhes do Cálculo
                </>
              ) : (
                <>
                  <div className="rounded-lg bg-blue-100 p-2">
                    <History className="h-6 w-6 text-blue-600" />
                  </div>
                  Histórico de Cálculos
                </>
              )}
            </DialogTitle>
            <DialogDescription className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-700">
              {showDetails ? (
                selectedItem ? (
                  <span>
                    Visualizando detalhes de{" "}
                    <span className="font-semibold text-blue-700">
                      "{selectedItem.title || "Cálculo sem título"}"
                    </span>
                  </span>
                ) : (
                  "Detalhes do cálculo selecionado"
                )
              ) : (
                <span>
                  Visualize e gerencie os cálculos salvos de{" "}
                  <span className="font-semibold text-blue-700">
                    "{calculation?.name || "Cálculo"}"
                  </span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

        <div className="flex flex-1 flex-col overflow-hidden px-3 sm:px-6 py-3 sm:py-4">
          <div className="relative h-full w-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {/* Lista de Histórico */}
            <div
              className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                showDetails
                  ? "pointer-events-none translate-x-[-100%] opacity-0"
                  : "translate-x-0 opacity-100"
              }`}
            >
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Carregando histórico...
                  </span>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                  Erro: {error}
                </div>
              )}

              {!isLoading && !error && historyData.length === 0 && (
                <div className="py-8 text-center">
                  <History className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    Nenhum histórico encontrado
                  </h3>
                  <p className="text-gray-600">
                    Ainda não há cálculos salvos para este item.
                  </p>
                </div>
              )}

              {!isLoading && !error && historyData.length > 0 && (
                <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden">
                  {historyData.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                        <div className="flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {formatDate(item.timestamp)}
                            </span>
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {formatTime(item.timestamp)}
                            </span>
                          </div>
                          <h3 className="mb-2 font-medium text-gray-900">
                            {item.title || "Cálculo sem título"}
                          </h3>

                          {/* Prévia dos Parâmetros */}
                          <div className="mb-3">
                            <div className="mb-2 flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              <span className="text-sm font-semibold tracking-wide text-blue-700 uppercase">
                                Prévia de Parâmetros
                              </span>
                            </div>
                            <div className="rounded-md border border-blue-100 bg-blue-50 p-3">
                              <div className="space-y-1">
                                {getMainParameters(item).slice(0, 3).map((param, index) => (
                                  <div key={index} className="text-sm text-blue-800">
                                    <span className="font-medium">{param.name}:</span> {param.value}
                                  </div>
                                ))}
                                {getAllParameters(item).length > getMainParameters(item).slice(0, 3).length && (
                                  <div className="text-xs text-blue-600 italic mt-2">
                                    ... e mais {getAllParameters(item).length - getMainParameters(item).slice(0, 3).length} {getAllParameters(item).length - getMainParameters(item).slice(0, 3).length === 1 ? 'parâmetro' : 'parâmetros'} (ver detalhes)
                                  </div>
                                )}
                                {getMainParameters(item).length === 0 && (
                                  <div className="text-sm text-blue-600 italic">
                                    Nenhum parâmetro disponível
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Prévia dos Resultados */}
                          <div className="mb-3">
                            <div className="mb-2 flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="text-sm font-semibold tracking-wide text-green-700 uppercase">
                                Prévia de Resultados
                              </span>
                            </div>
                            <div className="rounded-md border border-green-100 bg-green-50 p-3">
                              <div className="space-y-1">
                                {getMainResults(item).slice(0, 3).map((result, index) => (
                                  <div key={index} className="text-sm text-green-800">
                                    <span className="font-medium">{result.name}:</span> {result.value}
                                  </div>
                                ))}
                                {getAllResults(item).length > getMainResults(item).slice(0, 3).length && (
                                  <div className="text-xs text-green-600 italic mt-2">
                                    ... e mais {getAllResults(item).length - getMainResults(item).slice(0, 3).length} {getAllResults(item).length - getMainResults(item).slice(0, 3).length === 1 ? 'resultado' : 'resultados'} (ver detalhes)
                                  </div>
                                )}
                                {getMainResults(item).length === 0 && (
                                  <div className="text-sm text-green-600 italic">
                                    Nenhum resultado disponível
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 sm:mt-0 sm:ml-4 flex flex-row sm:flex-col gap-2">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="flex items-center gap-1 rounded-md bg-blue-600 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-white transition-colors hover:bg-blue-700 flex-1 sm:flex-none justify-center"
                          >
                            <Eye className="h-3 w-3" />
                            Ver Detalhes
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="flex items-center gap-1 rounded-md bg-red-600 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-white transition-colors hover:bg-red-700 flex-1 sm:flex-none justify-center"
                          >
                            <Trash2 className="h-3 w-3" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Página de Detalhes */}
            <div
              className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                showDetails
                  ? "translate-x-0 opacity-100"
                  : "pointer-events-none translate-x-full opacity-0"
              }`}
            >
              {showDetails && selectedItem && (
                <div className="flex h-full flex-col">
                  {/* Informações do Cabeçalho */}
                  <div className="mb-4 rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h2 className="mb-2 text-base sm:text-lg font-bold text-gray-800">
                          {selectedItem.title || "Cálculo sem título"}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center text-indigo-600">
                            <Calendar className="mr-1 h-4 w-4" />
                            <span className="font-medium">
                              {formatDate(selectedItem.timestamp)}
                            </span>
                          </div>
                          <div className="flex items-center text-purple-600">
                            <Clock className="mr-1 h-4 w-4" />
                            <span className="font-medium">
                              {formatTime(selectedItem.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo Scrollável */}       
                  <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 sm:pr-2">
                    <div className="space-y-6">
                      {/* Seção de Parâmetros */}
                      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 sm:p-6">
                        <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <h3 className="text-sm sm:text-lg font-bold tracking-wide text-blue-800 uppercase">
                            Parâmetros Utilizados
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                          {getAllParameters(selectedItem).map(
                            (param, index) => (
                              <div
                                key={index}
                                className="rounded-lg border border-blue-200 bg-white p-3 sm:p-4 shadow-sm"
                              >
                                <div className="flex flex-col space-y-2">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                                    <span className="text-xs sm:text-sm font-semibold text-gray-800">
                                      {param.name}
                                    </span>
                                    {param.type && (
                                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 whitespace-nowrap">
                                        {param.type === "select"
                                          ? "Seleção"
                                          : param.type === "number"
                                            ? "Número"
                                            : "Texto"}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm sm:text-base font-bold text-blue-700 break-words">
                                    {param.value}
                                  </div>
                                  {param.description && (
                                    <div className="text-xs text-gray-500 italic">
                                      {param.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      {/* Seção de Resultados */}
                      <div className="rounded-lg border border-green-100 bg-green-50 p-3 sm:p-6">
                        <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <h3 className="text-sm sm:text-lg font-bold tracking-wide text-green-800 uppercase">
                            Resultados Obtidos
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                          {getAllResults(selectedItem).map((result, index) => (
                            <div
                              key={index}
                              className="rounded-lg border border-green-200 bg-white p-3 sm:p-4 shadow-sm"
                            >
                              <div className="flex flex-col space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                                  <span className="text-xs sm:text-sm font-semibold text-gray-800">
                                    {result.name}
                                  </span>
                                  {result.type && (
                                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 whitespace-nowrap">
                                      {result.type === "select"
                                        ? "Seleção"
                                        : result.type === "number"
                                          ? "Número"
                                          : "Texto"}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm sm:text-base font-bold text-green-700 break-words">
                                  {result.value}
                                </div>
                                {result.description && (
                                  <div className="text-xs text-gray-500 italic">
                                    {result.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

          <div className="flex flex-shrink-0 justify-end border-t border-gray-200 bg-gray-50 px-3 sm:px-6 py-3 sm:py-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4 sm:px-8 py-2 font-medium transition-colors hover:bg-gray-100 text-sm sm:text-base"
            >
              Fechar
            </Button>
          </div>
        </MemoizedDialogContent>
      </Dialog>

      {/* Modal de Exclusão usando Dialog do ShadCN */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="w-[95vw] sm:w-[90vw] sm:max-w-md mx-auto">
          {deleteSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="mb-2 text-lg font-semibold text-gray-900">
                  Cálculo excluído com sucesso!
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  O cálculo foi removido do seu histórico.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="flex justify-center bg-gray-50 px-6 py-4">
                <Button
                  onClick={handleCancelDelete}
                  className="px-6 py-2 font-medium"
                >
                  Fechar
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold leading-6 text-gray-900">
                  Confirmar Exclusão
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  Tem certeza que deseja excluir o cálculo{" "}
                  <strong>"{itemToDelete?.title || "sem título"}"</strong> do histórico?
                  Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>

                {deleteError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-700">
                        {deleteError}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 bg-gray-50 px-6 py-4">
                <Button
                  variant="outline"
                  onClick={handleCancelDelete}
                  disabled={deletingId === itemToDelete?.id}
                  className="px-4 py-2 font-medium transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  disabled={deletingId === itemToDelete?.id}
                  className="flex items-center gap-2 bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === itemToDelete?.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Excluindo...</span>
                    </>
                  ) : (
                    "Sim, excluir"
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CalculationHistoryModal;
