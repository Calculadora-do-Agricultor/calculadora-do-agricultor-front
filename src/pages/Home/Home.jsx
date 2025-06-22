import {
  CalculatorIcon,
  ChartBarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import logoEscura from "../../assets/logoEscura.svg";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../services/firebaseConfig";
import { Button } from "../../components/ui";

const Home = () => {
  const [user] = useAuthState(auth);
  return (
    <div className="min-h-[calc(100vh-64px-40px)] bg-gradient-to-b from-[#00418F]/10 to-[#EFF2FF]">
      {/* Banner Principal */}
      <section className="relative overflow-hidden bg-[#00418F]/10 px-4 py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 lg:flex-row">
          <div className="space-y-6 text-center lg:w-1/2 lg:text-left">
            <h1 className="text-4xl leading-tight font-bold text-[#00418F] lg:text-5xl">
              Simplifique seus Cálculos Agrícolas
            </h1>
            <p className="text-lg text-[#00418F]">
              Sua ferramenta completa para cálculos agrícolas precisos. Evite
              perdas, maximize lucros e tome decisões mais assertivas no campo.
            </p>
            <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
              {user ? (
                <Button
                  to="/calculator"
                  variant="primary"
                  size="medium"
                  icon={CalculatorIcon}
                >
                  Acessar Calculadora
                </Button>
              ) : (
                <>
                  <Button to="/register" variant="primary" size="medium">
                    Cadastrar-se
                  </Button>
                  <Button to="/login" variant="secondary" size="medium">
                    Fazer Login
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center lg:w-1/2">
            <img
              src={logoEscura}
              alt="Logo da Calculadora do Agricultor"
              className="w-80 transform transition duration-500 hover:scale-105 lg:w-96"
            />
          </div>
        </div>
      </section>

      {/* Seção de Benefícios */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-center text-3xl font-bold text-[#00418F]">
            Por que escolher nossa calculadora?
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-gray-600">
            Desenvolvida especialmente para agricultores, nossa calculadora
            oferece soluções para todas as etapas do cultivo, desde o
            planejamento até a colheita. Com categorias específicas para cada
            tipo de cálculo e área administrativa para personalização completa.
          </p>
          <div className="mx-auto grid max-w-5xl grid-cols-1 justify-items-center gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="transform rounded-xl bg-white p-6 shadow-[0_4px_20px_rgba(0,65,143,0.15)] border border-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,65,143,0.25)]">
              <div className="mb-4 w-fit rounded-full bg-[#00418F]/10 p-3">
                <CalculatorIcon className="h-8 w-8 text-[#00418F]" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[#00418F]">
                Cálculos Essenciais
              </h3>
              <p className="text-gray-600">
                Todas as fórmulas necessárias para plantio, adubação, irrigação
                e muito mais em um só lugar.
              </p>
            </div>

            {/* Card 2 */}
            <div className="transform rounded-xl bg-white p-6 shadow-[0_4px_20px_rgba(0,65,143,0.15)] border border-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,65,143,0.25)]">
              <div className="mb-4 w-fit rounded-full bg-[#00418F]/10 p-3">
                <ChartBarIcon className="h-8 w-8 text-[#00418F]" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[#00418F]">
                Gestão Personalizada
              </h3>
              <p className="text-gray-600">
                Área administrativa para a Marchesan criar e editar seus
                próprios cálculos adaptados à realidade dos seus usuários.
              </p>
            </div>

            {/* Card 3 */}
            <div className="transform rounded-xl bg-white p-6 shadow-[0_4px_20px_rgba(0,65,143,0.15)] border border-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,65,143,0.25)]">
              <div className="mb-4 w-fit rounded-full bg-[#00418F]/10 p-3">
                <ClockIcon className="h-8 w-8 text-[#00418F]" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[#00418F]">
                Prevenção de Perdas
              </h3>
              <p className="text-gray-600">
                Evite erros de cálculo que podem resultar em prejuízos
                financeiros e desperdício de recursos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Sobre */}
      <section className="bg-[#00418F]/10 px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-[#00418F]">
            Sobre o Projeto
          </h2>
          <p className="text-lg leading-relaxed text-gray-700">
            A Calculadora do Agricultor é fruto da cooperação empresa-escola,
            através dos projetos Integradores do curso de Desenvolvimento de
            Software Multiplataforma. Este software foi desenvolvido pelos
            alunos da Fatec Matão "Luiz Marchesan", com base na planilha da
            empresa Marchesan.
          </p>
          {!user && (
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button to="/register" variant="primary" size="large">
                Comece a Usar
              </Button>
              <Button to="/login" variant="secondary" size="large">
                Já tenho conta
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
