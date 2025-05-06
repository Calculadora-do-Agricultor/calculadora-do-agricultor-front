import React, { useState, useEffect } from "react";
import { FaTractor, FaClipboardCheck, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PlantioPage = () => {
  const navigate = useNavigate();
  const [modalAberto, setModalAberto] = useState(null);

  useEffect(() => {
    document.body.style.overflow = modalAberto ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modalAberto]);

  const [numeroLinhas, setNumeroLinhas] = useState("");
  const [espacamento, setEspacamento] = useState("");
  const [velocidade, setVelocidade] = useState("");
  const [eficiencia, setEficiencia] = useState("");

  const [larguraUtil, setLarguraUtil] = useState(0);
  const [capacidadeOperacional, setCapacidadeOperacional] = useState(0);

  useEffect(() => {
    const linhas = parseFloat(numeroLinhas);
    const esp = parseFloat(espacamento);
    const vel = parseFloat(velocidade);
    const ef = parseFloat(eficiencia);

    if (!isNaN(linhas) && !isNaN(esp) && !isNaN(vel) && !isNaN(ef)) {
      const largura = linhas * esp;
      const capacidade = (vel * largura * (ef / 100)) / 10;
      setLarguraUtil(largura.toFixed(2));
      setCapacidadeOperacional(capacidade.toFixed(2));
    } else {
      setLarguraUtil(0);
      setCapacidadeOperacional(0);
    }
  }, [numeroLinhas, espacamento, velocidade, eficiencia]);

  return (
    <div className="min-h-screen bg-white px-4 py-10 text-gray-800">
      <div className="mx-auto max-w-5xl">
        <div className="relative mb-10 flex items-center justify-center">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 text-blue-900 hover:text-blue-700"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-center text-3xl font-bold text-blue-900">
            Plantio
          </h1>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-6">
          <div
            onClick={() => setModalAberto("capacidade")}
            className="relative flex aspect-square w-40 cursor-pointer flex-col items-center justify-center rounded-xl bg-gray-100 p-4 text-center shadow-md transition duration-200 hover:shadow-lg"
          >
            <div className="absolute top-0 left-0 h-1 w-full rounded-t-xl bg-blue-500" />
            <FaTractor className="mb-2 text-3xl text-black" />
            <h2 className="mb-1 text-sm font-semibold text-black">
              Capacidade Operacional
            </h2>
            <p className="text-xs text-gray-600">Plantio</p>
          </div>

          <div
            onClick={() => setModalAberto("capacidade")}
            className="relative flex aspect-square w-40 cursor-pointer flex-col items-center justify-center rounded-xl bg-gray-100 p-4 text-center shadow-md transition duration-200 hover:shadow-lg"
          >
            <div className="absolute top-0 left-0 h-1 w-full rounded-t-xl bg-blue-500" />
            <FaClipboardCheck className="mb-2 text-3xl text-black" />
            <h2 className="mb-1 text-sm font-semibold text-black">
              Plantadeiras
            </h2>
            <p className="text-xs text-gray-600">Sementes/Metro</p>
          </div>
        </div>
      </div>

      {modalAberto === "capacidade" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4 py-6">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaTractor className="text-xl text-black" />
                <div className="text-left">
                  <h2 className="text-lg leading-none font-bold text-black">
                    Capacidade Operacional
                  </h2>
                  <p className="text-xs text-gray-600">(Plantio)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-blue-600 hover:text-blue-800">
                  <i className="fas fa-info-circle"></i>
                </button>
                <button className="text-red-500 hover:text-red-700">
                  <i className="fas fa-trash"></i>
                </button>
                <button
                  onClick={() => setModalAberto(null)}
                  className="text-xl font-bold text-gray-600 hover:text-black"
                >
                  ×
                </button>
              </div>
            </div>

            <h3 className="text-md mb-3 text-center font-semibold">
              Parâmetros
            </h3>
            <div className="mb-6 space-y-2">
              <div>
                <label className="text-sm font-medium">
                  Número de Linhas do Implemento
                </label>
                <input
                  type="number"
                  value={numeroLinhas}
                  onChange={(e) => setNumeroLinhas(e.target.value)}
                  placeholder="Número de linhas"
                  className="w-full rounded border border-gray-400 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Espaçamento Entre Linhas (m)
                </label>
                <input
                  type="number"
                  value={espacamento}
                  onChange={(e) => setEspacamento(e.target.value)}
                  placeholder="Espaçamento entre linhas"
                  className="w-full rounded border border-gray-400 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Velocidade de Trabalho (km/h)
                </label>
                <input
                  type="number"
                  value={velocidade}
                  onChange={(e) => setVelocidade(e.target.value)}
                  placeholder="Velocidade de trabalho"
                  className="w-full rounded border border-gray-400 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Eficiência Operacional (%)
                </label>
                <input
                  type="number"
                  value={eficiencia}
                  onChange={(e) => setEficiencia(e.target.value)}
                  placeholder="Eficiência operacional"
                  className="w-full rounded border border-gray-400 px-3 py-2"
                />
              </div>
            </div>

            <h3 className="text-md mb-3 text-center font-semibold">
              Resultados
            </h3>
            <div className="space-y-4">
              <div className="w-full rounded-xl bg-gray-50 p-5 shadow-lg">
                <span className="text-lg text-gray-700">
                  <strong>Largura Útil de Trabalho (m):</strong>{" "}
                  {parseFloat(larguraUtil).toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="w-full rounded-xl bg-blue-100 p-5 shadow-lg">
                <span className="text-lg text-gray-700">
                  <strong>Capacidade Operacional (ha/h):</strong>{" "}
                  {parseFloat(capacidadeOperacional).toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalAberto === "plantadeiras" && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-start justify-center bg-black pt-20">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-center text-xl font-bold">
              Modal Plantadeiras
            </h2>
            <p className="text-center text-sm text-gray-500">
              Conteúdo ainda será adicionado.
            </p>
            <button
              onClick={() => setModalAberto(null)}
              className="mt-4 w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantioPage;
