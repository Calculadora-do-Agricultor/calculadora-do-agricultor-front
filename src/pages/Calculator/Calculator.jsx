import { useNavigate } from "react-router-dom";
import { useState } from "react";
import plantio from "../../assets/plantio.svg";

const Calculator = () => {
  const [tab, setTab] = useState("categorias");
  const navigate = useNavigate();

  const categorias = [
    {
      titulo: "Plantio",
      descricao:
        "Engloba todas as atividades relacionadas à implantação da lavoura",
      icon: () => <img src={plantio} alt="" className="h-8 w-8" />,
      route: "/Calculator/plantio",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-4 py-10">
      <div className="mb-6 flex w-full max-w-2xl space-x-10 border-b-2 border-gray-300 text-xl">
        <button
          className={`pb-3 font-semibold transition ${
            tab === "categorias"
              ? "border-b-4 border-blue-900 text-blue-900"
              : "text-gray-500"
          }`}
          onClick={() => setTab("categorias")}
        >
          Categorias
        </button>
        <button
          className={`pb-3 font-semibold transition ${
            tab === "favoritos"
              ? "border-b-4 border-blue-900 text-blue-900"
              : "text-gray-500"
          }`}
          onClick={() => setTab("favoritos")}
        >
          Favoritos
        </button>
      </div>

      {tab === "categorias" ? (
        <div className="w-full max-w-2xl space-y-6">
          {categorias.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <div
                key={index}
                onClick={() => navigate(cat.route)}
                className="flex cursor-pointer items-center justify-between rounded-xl border bg-gray-50 p-6 shadow-md transition hover:shadow-lg"
              >
                <div className="flex items-center gap-6">
                  <Icon className="h-8 w-8 text-blue-900" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {cat.titulo}
                    </h2>
                    <p className="text-base text-gray-500">{cat.descricao}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-12 text-center text-lg text-gray-500">
          Nenhum favorito adicionado.
        </div>
      )}
    </div>
  );
};

export default Calculator;
