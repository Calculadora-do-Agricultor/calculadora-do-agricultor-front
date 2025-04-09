import logoEscura from '../../assets/logoEscura.svg';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-green-50 p-4 gap-6 h-[calc(100vh-64px-40px)]">
      <div>
        <img src={logoEscura} alt="Logo da Calculadora" style={{ width: '204px' }} />
      </div>

      <h1 className="text-3xl font-bold text-center">Calculadora do Agricultor</h1>
      <p>A Calculadora do Agricultor 
        é fruto da cooperação empresa-escola, através
         dos projetos Integradores do curso de Analise de Processos 
         Agroindustriais e Interdisciplinares do curso de Desenvolvimento
          de Software Multiplataforma. Este software foi desenvolvido pelos alunos
           da Fatec Matão "Luiz Marchesan", com base na planilha da empresa Marchesan.</p>
      
    </div>
  );
};

export default Home;

