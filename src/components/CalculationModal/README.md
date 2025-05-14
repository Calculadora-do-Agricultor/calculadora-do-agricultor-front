# Componente CalculationModal

Este componente implementa um modal genérico para exibir e interagir com cálculos agrícolas. O modal recebe os parâmetros do cálculo e os transforma em inputs interativos, além de exibir os resultados calculados em tempo real.

## Funcionalidades

- Exibe um modal com título e descrição do cálculo
- Renderiza inputs dinâmicos baseados nos parâmetros do cálculo (texto, número, seleção)
- Calcula resultados em tempo real conforme o usuário preenche os parâmetros
- Permite copiar os resultados para a área de transferência
- Design responsivo e acessível
- Animações suaves de entrada e saída

## Como usar

```jsx
import { useState } from "react";
import { CalculationModal } from "../components/CalculationModal";

function SeuComponente() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState(null);
  
  // Exemplo de dados de cálculo
  const calculation = {
    id: "calc123",
    name: "Cálculo de Adubo",
    description: "Calcula a quantidade de adubo necessária",
    parameters: [
      {
        name: "Espaçamento",
        type: "number",
        unit: "m"
      },
      {
        name: "Área",
        type: "select",
        options: [
          { label: "Pequena", value: "100" },
          { label: "Média", value: "300" },
          { label: "Grande", value: "700" }
        ]
      },
      {
        name: "Quantidade Desejada",
        type: "number",
        unit: "kg/área"
      }
    ],
    resultName: "Quantidade de Adubo",
    resultUnit: "g/m",
    expression: "(parseFloat(Área) * parseFloat('Quantidade Desejada')) / parseFloat(Espaçamento)"
  };

  return (
    <div>
      <button onClick={() => {
        setSelectedCalculation(calculation);
        setIsModalOpen(true);
      }}>
        Abrir Cálculo
      </button>

      {selectedCalculation && (
        <CalculationModal
          calculation={selectedCalculation}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
```

## Propriedades

| Propriedade   | Tipo     | Descrição                                     |
|---------------|----------|-----------------------------------------------|
| calculation   | Object   | Objeto contendo os dados do cálculo           |
| isOpen        | Boolean  | Estado que controla se o modal está aberto    |
| onClose       | Function | Função para fechar o modal                    |

## Estrutura do objeto calculation

```javascript
{
  id: String,                // ID único do cálculo
  name: String,              // Nome do cálculo
  description: String,       // Descrição do cálculo
  parameters: Array,         // Array de objetos de parâmetros
  resultName: String,        // Nome do resultado principal
  resultUnit: String,        // Unidade do resultado principal
  expression: String,        // Expressão matemática para o cálculo
  additionalResults: Array   // Resultados adicionais (opcional)
}
```

### Estrutura de um parâmetro

```javascript
{
  name: String,              // Nome do parâmetro
  type: String,              // Tipo do input ('text', 'number', 'select')
  unit: String,              // Unidade de medida (opcional)
  options: Array             // Opções para select (apenas para type='select')
}
```

### Estrutura de uma opção (para parâmetros do tipo select)

```javascript
{
  label: String,             // Texto exibido na opção
  value: String              // Valor da opção
}
```

## Implementação da expressão

A expressão matemática é avaliada dinamicamente usando `Function` do JavaScript. Os nomes dos parâmetros são usados como variáveis na expressão.

Exemplo:
```javascript
// Se os parâmetros forem "Comprimento" e "Largura"
// A expressão poderia ser:
"Comprimento * Largura"
```

## Estilização

O componente vem com estilos predefinidos em `styles.css` que seguem o design system do projeto. Os estilos incluem:

- Cores consistentes com a identidade visual
- Layout responsivo
- Animações de entrada e saída
- Estados de hover e focus para melhor usabilidade

## Acessibilidade

O componente implementa práticas de acessibilidade como:

- Rótulos adequados para inputs
- Foco gerenciado corretamente
- Contraste de cores adequado
- Suporte a navegação por teclado