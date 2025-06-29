import React, { useState, useEffect } from "react";
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
      console.log("No calculationHistoryId provided");
      return;
    }

    console.log(
      "Fetching history for calculationHistoryId:",
      calculationHistoryId,
    );
    setIsLoading(true);
    setError(null);

    try {
      const data = await CalculationHistoryService.getCalculationHistory(
        50,
        calculationHistoryId,
      );
      console.log("Fetched history data:", data);
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
    setItemToDelete(historyItem);
    setShowDeleteModal(true);
    setDeleteError(null);
    setDeleteSuccess(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
    setDeleteError(null);
    setDeleteSuccess(false);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setDeletingId(itemToDelete.id);
    setDeleteError(null);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex h-[80vh] max-w-5xl flex-col overflow-hidden p-0">
        <DialogHeader className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
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
          <DialogDescription className="mt-2 text-base text-gray-700">
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

        <div className="flex flex-1 flex-col overflow-hidden px-6 py-4">
          <div className="relative h-full w-full">
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
                <div className="flex-1 space-y-4 overflow-y-auto">
                  {historyData.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
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

                          {/* Parâmetros Principais */}
                          <div className="mb-3">
                            <div className="mb-2 flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              <span className="text-sm font-semibold tracking-wide text-blue-700 uppercase">
                                Parâmetros Principais
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {getMainParameters(item).map((param, index) => (
                                <div
                                  key={index}
                                  className="rounded-md border border-blue-100 bg-blue-50 p-2"
                                >
                                  <div className="text-xs font-medium text-blue-600">
                                    {param.name}
                                  </div>
                                  <div className="text-sm font-semibold text-blue-800">
                                    {param.value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Resultados Principais */}
                          <div className="mb-3">
                            <div className="mb-2 flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="text-sm font-semibold tracking-wide text-green-700 uppercase">
                                Resultados Principais
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {getMainResults(item).map((result, index) => (
                                <div
                                  key={index}
                                  className="rounded-md border border-green-100 bg-green-50 p-2"
                                >
                                  <div className="text-xs font-medium text-green-600">
                                    {result.name}
                                  </div>
                                  <div className="text-sm font-semibold text-green-800">
                                    {result.value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="ml-4 flex flex-col gap-2">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700"
                          >
                            <Eye className="h-3 w-3" />
                            Ver Detalhes
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-700"
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
                  <div className="mb-4 rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h2 className="mb-2 text-lg font-bold text-gray-800">
                          {selectedItem.title || "Cálculo sem título"}
                        </h2>
                        <div className="flex items-center gap-4 text-sm">
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
                  <div className="flex-1 overflow-y-auto pr-2">
                    <div className="space-y-6">
                      {/* Seção de Parâmetros */}
                      <div className="rounded-lg border border-blue-100 bg-blue-50 p-6">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <h3 className="text-lg font-bold tracking-wide text-blue-800 uppercase">
                            Parâmetros Utilizados
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {getAllParameters(selectedItem).map(
                            (param, index) => (
                              <div
                                key={index}
                                className="rounded-lg border border-blue-200 bg-white p-4 shadow-sm"
                              >
                                <div className="flex flex-col space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-800">
                                      {param.name}
                                    </span>
                                    {param.type && (
                                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                                        {param.type === "select"
                                          ? "Seleção"
                                          : param.type === "number"
                                            ? "Número"
                                            : "Texto"}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-base font-bold text-blue-700">
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
                      <div className="rounded-lg border border-green-100 bg-green-50 p-6">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <h3 className="text-lg font-bold tracking-wide text-green-800 uppercase">
                            Resultados Obtidos
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {getAllResults(selectedItem).map((result, index) => (
                            <div
                              key={index}
                              className="rounded-lg border border-green-200 bg-white p-4 shadow-sm"
                            >
                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-gray-800">
                                    {result.name}
                                  </span>
                                  {result.type && (
                                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                                      {result.type === "select"
                                        ? "Seleção"
                                        : result.type === "number"
                                          ? "Número"
                                          : "Texto"}
                                    </span>
                                  )}
                                </div>
                                <div className="text-base font-bold text-green-700">
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

        <div className="flex flex-shrink-0 justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-8 py-2 font-medium transition-colors hover:bg-gray-100"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="bg-opacity-50 fixed inset-0 z-[70] flex items-center justify-center bg-black p-4">
          <div className="mx-4 w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
            {deleteSuccess ? (
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Cálculo Excluído
                </h3>
                <p className="text-gray-600">
                  O cálculo foi excluído do histórico com sucesso.
                </p>
              </div>
            ) : (
              <>
                <div className="p-6">
                  <div className="mb-4 flex items-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      Confirmar Exclusão
                    </h3>
                    <p className="mb-4 text-gray-600">
                      Tem certeza que deseja excluir o cálculo{" "}
                      <span className="font-semibold text-gray-900">
                        "{itemToDelete?.title || "sem título"}"
                      </span>{" "}
                      do histórico?
                    </p>
                    <p className="text-sm font-medium text-red-600">
                      Esta ação não pode ser desfeita.
                    </p>

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
                </div>

                <div className="flex justify-end space-x-3 bg-gray-50 px-6 py-4">
                  <Button
                    variant="outline"
                    onClick={handleCancelDelete}
                    disabled={deletingId === itemToDelete?.id}
                    className="px-4 py-2 font-medium transition-colors hover:bg-gray-100"
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
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default CalculationHistoryModal;
