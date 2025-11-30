## Objetivo
- Adicionar uma barra de busca global no header que sugere resultados conforme o usuário digita (cálculos, categorias e FAQ) e, ao clicar, navega para a página correspondente já filtrando o conteúdo.

## Ponto de Inserção
- Inserir o componente de busca em `src/components/Navbar/index.jsx` próximo aos links de navegação, mantendo o layout atual do header.
  - Referência: `src/components/Navbar/index.jsx:37-55`.

## Componente
- Criar `src/components/GlobalSearch/index.jsx` com:
  - Campo `Input` já existente (`src/components/ui/input.jsx`) e ícone de busca.
  - Dropdown de sugestões com Tailwind + Radix primitives existentes (`ScrollArea`, `DropdownMenu` ou overlay absoluto), com suporte a teclado (↑/↓/Enter/Escape) e ARIA (`role="combobox"`, `listbox`).
  - Debounce de 250–300ms para consultas.

## Fonte de Dados
- Cálculos: buscar da coleção `calculations` apenas os campos mínimos (`id`, `name`/`nome`, `tags`, `categories`).
- Categorias: buscar da coleção `categories` (`id`, `name`, `color`, opcional `imageUrl`).
- FAQ: reutilizar `useFAQ`/`faqService` para obter itens ativos e filtrar em memória.
- Carregar sob demanda ao focar o campo (lazy) e cachear em memória para sessões subsequentes; se o usuário não estiver logado, exibir apenas sugestões públicas (FAQ e páginas).

## Lógica de Sugestões
- Filtrar por `includes` case-insensitive em:
  - Cálculos: `name`/`nome`, `description`/`descricao`, `tags`.
  - Categorias: `name`.
  - FAQ: `question`, `answer`, `tags`.
- Ranking simples (match em nome > tags > descrição) e limitar a 6 resultados por grupo.
- Mostrar grupos com rótulos e ícones (ex.: `CalculatorIcon` para cálculos, `TagIcon` para FAQ).
  - Utilizar `ScrollArea` existente: `src/components/ui/scroll-area.jsx`.

## Navegação ao Clique
- Cálculo: navegar para `"/calculator?category=<nomeCategoria>&q=<termo>"` (se soubermos a categoria; caso haja múltiplas, usar a primeira) ou apenas `"/calculator?q=<termo>"`.
- Categoria: `"/calculator?category=<nomeCategoria>"`.
- FAQ: `"/faq?q=<termo>"`.
- Usar `useNavigate` e passar `state` opcional com metadados (ex.: `source: 'global-search'`).

## Ajustes nas Páginas Alvo
- `Calculator.jsx`:
  - Ler `q` e `category` de `location.search` e inicializar `searchTerm` (`src/pages/Calculator/Calculator.jsx:56`) e `categoriaSelecionada` (`src/pages/Calculator/Calculator.jsx:48`) em um `useEffect` de montagem.
  - Mantém o filtro atual em `CalculationList` (`src/components/CalculationList/index.jsx:141-170`).
  - Opcional: rolar até a seção de lista (`#calculator-calculations-list`).
- `FAQ.jsx`:
  - Ler `q` de `location.search` e inicializar `searchTerm` (`src/pages/FAQ/FAQ.jsx:9-14, 154-163`).

## UX/Acessibilidade
- Placeholder amigável e dica de atalho (ex.: `Ctrl/Cmd + K`).
- Suporte completo a teclado dentro do dropdown; indicadores de loading e empty-state.
- Roles/aria para combobox/listbox; foco gerenciado.

## Performance
- Debounce + limite de resultados.
- Cache em memória das listas (evitar consultas repetidas).
- Opcional: acoplar preload leve no `useIntelligentPreload` (`src/utils/preloadRoutes.js`) após 2–5s para usuários logados.

## Segurança/Permissões
- Consultas a cálculos/categorias apenas quando autenticado (rotas protegidas já existem em `src/App.jsx:63-90`).
- Para não autenticados, oferecer FAQ e páginas públicas.

## Entregáveis
- Novo componente `GlobalSearch` e sua integração no `Navbar`.
- Suporte a query string em `Calculator.jsx` e `FAQ.jsx` para inicializar filtros.
- Estilo coeso com Tailwind/Radix já usados no projeto.

## Testes/Validação
- Fluxos:
  - Digitar termo e ver sugestões por tipo.
  - Clique em sugestão de cálculo/categoria direciona para `/calculator` filtrado.
  - Clique em sugestão de FAQ direciona para `/faq` com a busca aplicada.
  - Com e sem usuário autenticado.
- Verificar acessibilidade básica (tab/aria) e desempenho com listas grandes.

Confirma que posso implementar conforme o plano acima?