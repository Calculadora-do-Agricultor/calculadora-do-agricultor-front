# CategoriaCard Component

Componente reutilizável para exibir categorias de cálculos de forma visual e interativa.

## 📋 Características

- **Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Acessível**: Suporte completo a navegação por teclado e screen readers
- **Customizável**: Aceita ícones de diferentes bibliotecas e badges opcionais
- **Interativo**: Efeitos hover e estados visuais claros
- **Modular**: Totalmente desacoplado da lógica de negócio

## 🚀 Uso Básico

```jsx
import CategoriaCard from '../components/CategoriaCard';
import { CalculatorIcon } from '@heroicons/react/24/outline';

function MeuComponente() {
  const handleClick = () => {
    // Lógica de navegação
    console.log('Categoria clicada!');
  };

  return (
    <CategoriaCard
      icon={CalculatorIcon}
      title="Cálculos Básicos"
      description="Operações matemáticas fundamentais para agricultura"
      calculosCount={12}
      onClick={handleClick}
    />
  );
}
```

## 📝 Props

| Prop | Tipo | Obrigatório | Padrão | Descrição |
|------|------|-------------|--------|-----------|
| `icon` | `React.Component` | ❌ | - | Componente de ícone (ex: Heroicons, Lucide, etc.) |
| `title` | `string` | ✅ | - | Título da categoria |
| `description` | `string` | ✅ | - | Descrição da categoria |
| `onClick` | `function` | ❌ | - | Função executada ao clicar no card |
| `badge` | `object` | ❌ | - | Badge opcional `{ text: string, variant: string }` |
| `className` | `string` | ❌ | `''` | Classes CSS adicionais |
| `disabled` | `boolean` | ❌ | `false` | Desabilita a interação com o card |
| `calculosCount` | `number` | ❌ | `0` | Número de cálculos na categoria |

## 🎨 Variantes de Badge

O componente suporta diferentes variantes de badge:

```jsx
// Badge padrão
<CategoriaCard badge={{ text: "Popular", variant: "default" }} />

// Badge secundário
<CategoriaCard badge={{ text: "Nova", variant: "secondary" }} />

// Badge outline
<CategoriaCard badge={{ text: "Técnico", variant: "outline" }} />
```

## 🖼️ Ícones Suportados

O componente aceita qualquer ícone que seja um componente React:

```jsx
// Heroicons
import { CalculatorIcon } from '@heroicons/react/24/outline';

// Lucide React
import { Calculator } from 'lucide-react';

// React Icons
import { FaCalculator } from 'react-icons/fa';

// Material Design Icons
import { MdCalculate } from 'react-icons/md';
```

## 📱 Layout Responsivo

O componente é totalmente responsivo e funciona bem em diferentes layouts:

```jsx
{/* Grid responsivo */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {categorias.map(categoria => (
    <CategoriaCard key={categoria.id} {...categoria} />
  ))}
</div>

{/* Layout em linha */}
<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
  {categorias.map(categoria => (
    <CategoriaCard key={categoria.id} {...categoria} className="h-48" />
  ))}
</div>
```

## ♿ Acessibilidade

O componente segue as melhores práticas de acessibilidade:

- **Navegação por teclado**: Suporte completo a `Tab`, `Enter` e `Space`
- **ARIA labels**: Labels descritivos para screen readers
- **Estados visuais**: Indicadores claros de foco e hover
- **Semântica**: Uso correto de roles e propriedades ARIA

## 🎯 Estados do Componente

### Estado Normal
```jsx
<CategoriaCard
  title="Categoria Ativa"
  description="Esta categoria está disponível para uso"
  onClick={handleClick}
/>
```

### Estado Desabilitado
```jsx
<CategoriaCard
  title="Categoria Desabilitada"
  description="Esta categoria não está disponível"
  disabled={true}
/>
```

### Com Badge
```jsx
<CategoriaCard
  title="Categoria Nova"
  description="Esta é uma categoria recém-adicionada"
  badge={{ text: "Nova", variant: "secondary" }}
  onClick={handleClick}
/>
```

## 🔧 Customização

### Classes CSS Personalizadas
```jsx
<CategoriaCard
  className="border-2 border-blue-500 shadow-lg"
  title="Categoria Destacada"
  description="Esta categoria tem estilo personalizado"
/>
```

### Altura Fixa
```jsx
<CategoriaCard
  className="h-64"
  title="Card com Altura Fixa"
  description="Este card tem altura definida"
/>
```

## 🧪 Exemplo Completo

Veja o arquivo `ExampleUsage.jsx` para um exemplo completo de implementação com diferentes variações e casos de uso.

## 🎨 Design System

O componente segue o design system do projeto:

- **Cores primárias**: `#00418F` (azul principal)
- **Bordas**: `border-gray-200` com hover em `border-[#00418F]`
- **Sombras**: `shadow-sm` com hover em `shadow-md`
- **Transições**: `transition-all duration-200`
- **Tipografia**: Tailwind CSS typography scale

## 📦 Dependências

- React 19+
- @heroicons/react (para ícones padrão)
- Tailwind CSS (para estilização)
- Badge component (componente interno do projeto)