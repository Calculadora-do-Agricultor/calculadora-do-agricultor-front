import { CalculatorIcon, ChartBarIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import logoEscura from '../../assets/logoEscura.svg';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-64px-40px)] bg-gradient-to-b from-blue-50 to-white">
      {/* Banner Principal */}
      <section className="relative overflow-hidden bg-blue-50 py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-blue-700">
              Simplifique seus Cálculos Agrícolas
            </h1>
            <p className="text-lg text-blue-800">
              Sua ferramenta completa para cálculos agrícolas precisos. Evite perdas,
              maximize lucros e tome decisões mais assertivas no campo.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                to="/Register"
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
              >
                Começar Agora
              </Link>
              <Link
                to="/Login"
                className="bg-white hover:bg-gray-100 text-blue-700 font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105 border-2 border-blue-700"
              >
                Fazer Login
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center items-center">
            <img
              src={logoEscura}
              alt="Logo da Calculadora do Agricultor"
              className="w-80 lg:w-96 transform hover:scale-105 transition duration-500"
            />
          </div>
        </div>
      </section>

      {/* Seção de Benefícios */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
            Por que escolher nossa calculadora?
          </h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
            Desenvolvida especialmente para agricultores, nossa calculadora oferece soluções para todas as etapas do cultivo,
            desde o planejamento até a colheita. Com categorias específicas para cada tipo de cálculo e área administrativa para
            personalização completa.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center max-w-5xl mx-auto">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
              <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                <CalculatorIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Cálculos Essenciais</h3>
              <p className="text-gray-600">Todas as fórmulas necessárias para plantio, adubação, irrigação e muito mais em um só lugar.</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
              <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                <ChartBarIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Gestão Personalizada</h3>
              <p className="text-gray-600">Área administrativa para a Marchesan criar e editar seus próprios cálculos adaptados à realidade dos seus usuários.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
              <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                <ClockIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Prevenção de Perdas</h3>
              <p className="text-gray-600">Evite erros de cálculo que podem resultar em prejuízos financeiros e desperdício de recursos.</p>
            </div>

            
          </div>
        </div>
      </section>

      {/* Seção Sobre */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-700 mb-6">Sobre o Projeto</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            A Calculadora do Agricultor é fruto da cooperação empresa-escola, através
            dos projetos Integradores do curso de Desenvolvimento
            de Software Multiplataforma. Este software foi desenvolvido pelos alunos
            da Fatec Matão "Luiz Marchesan", com base na planilha da empresa Marchesan.
          </p>
          <Link
            to="/Register"
            className="inline-block mt-8 bg-blue-700 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105"
          >
            Comece a Usar Gratuitamente
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

