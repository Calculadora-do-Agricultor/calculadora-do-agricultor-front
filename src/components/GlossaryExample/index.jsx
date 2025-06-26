import React from 'react';
import GlossaryTerm from '../ui/GlossaryTerm';

const GlossaryExample = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Exemplo de Uso do Glossário</h2>
      
      <div className="space-y-4">
        <p className="text-gray-700">
          A <GlossaryTerm term="agricultura familiar">agricultura familiar</GlossaryTerm> é 
          fundamental para a produção de alimentos no Brasil. Para ter sucesso, é importante 
          realizar um bom <GlossaryTerm term="planejamento agrícola">planejamento</GlossaryTerm> e 
          implementar práticas de <GlossaryTerm term="manejo sustentável">manejo sustentável</GlossaryTerm>.
        </p>

        <p className="text-gray-700">
          O agricultor deve considerar tanto os <GlossaryTerm term="custo fixo">custos fixos</GlossaryTerm> quanto 
          os <GlossaryTerm term="custo variável">custos variáveis</GlossaryTerm> para calcular 
          a <GlossaryTerm term="margem líquida">margem líquida</GlossaryTerm> do seu negócio.
        </p>

        <p className="text-gray-700">
          Durante a <GlossaryTerm term="safra">safra</GlossaryTerm>, é essencial monitorar 
          a <GlossaryTerm term="produtividade">produtividade</GlossaryTerm> e realizar o controle 
          adequado com <GlossaryTerm term="defensivos agrícolas">defensivos</GlossaryTerm> 
          e <GlossaryTerm term="fertilizantes">fertilizantes</GlossaryTerm>.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Dica:</h3>
          <p className="text-gray-700">
            Passe o mouse sobre os termos sublinhados para ver suas definições. Termos como 
            <GlossaryTerm term="produto orgânico">produto orgânico</GlossaryTerm> e 
            <GlossaryTerm term="certificação">certificação</GlossaryTerm> são importantes 
            para quem busca mercados diferenciados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlossaryExample;