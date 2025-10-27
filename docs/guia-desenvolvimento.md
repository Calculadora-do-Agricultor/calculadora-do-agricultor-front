# Guia de Desenvolvimento — Calculadora do Agricultor

Este guia resume a arquitetura, padrões e fluxos já existentes no projeto para acelerar a manutenção e evolução, mantendo consistência e desempenho. Foca em como usar o que já existe — sem criar novas funcionalidades — e serve como referência rápida para futuras contribuições.

---

## Visão Geral
- Aplicação React (`react 19`, Vite, Tailwind CSS) com Firebase (Auth, Firestore) e Vitest.
- Padrões já implementados: lazy loading de páginas, preload de rotas críticas, cache de consultas Firestore, sistema de loading padronizado, validação segura de expressões matemáticas.
- Estrutura orientada a componentes e páginas, com divisão clara por responsabilidade.

---

## Estrutura do Projeto
- `src/components` — Componentes reutilizáveis (UI, modais, listas, navegação).
- `src/pages` — Páginas de alto nível (Calculator, Home, Login, Register, Admin, etc.).
- `src/context` — Contextos globais (AuthContext, ToastContext).
- `src/hooks` — Hooks personalizados (Firestore otimizado, fórmula, FAQ, loading, etc.).
- `src/services` — Integrações com Firebase e serviços (faqService, formulaService, etc.).
- `src/utils` — Utilitários (mathEvaluator, preloadRoutes, firebaseErrors).
- `vite.config.js` — Configuração de build e otimizações.
- `tests` — Testes unitários com Vitest (ex.: `FormulaPreviewModal.test.jsx`).

---

## Ambiente e Execução
- Variáveis (`.env.local`):
  - `VITE_FIREBASE_*` conforme README.
- Scripts:
  - `npm run dev` — desenvolvimento
  - `npm run build` — build produção
  - `npm run preview` — preview produção
  - `npm run test` — testes com Vitest
- Deploy: Firebase Hosting (workflows em `.github/workflows`).

---

## Roteamento e Lazy Loading
- Rotas com `react-router-dom` definidas em `src/App.jsx`.
- Páginas carregadas com `React.lazy`: `Home`, `Login`, `Register`, `Calculator`, `CreateCalculationPage`, `EditCalculationPage`, `LogsManagement`, `UserManagement`, `FAQ`, `FAQAdmin`, `Dashboard`, `DataIntegrityPage`.
- Proteção de rotas:
  - `PrivateRoute` — exige autenticação
  - `ProtectedRoute` — suporte a `adminOnly` e redirecionamentos
- Preload de rotas críticas:
  - `src/utils/preloadRoutes.js` — `preloadCriticalRoutes` e `preloadAdminRoutes` antecipam componentes mais acessados.

---

## Contextos Globais
- `AuthContext` — contexto de autenticação e privilégios (`isAdmin`).
- `ToastContext` — sistema de notificações com `useToast()`.
  - Padrão: usar `success`, `error`, `info` — já integrado em componentes como `CreateCalculation`.

---

## Componentes-Chave
- Navegação e layout:
  - `Navbar` — links, menus (desktop e mobile), perfil do usuário.
  - `Footer` — links úteis, contato e seções institucionais.
- Calculadora:
  - `Categories` e `CategoriaCard` — listagem e seleção por categoria.
  - `CalculationList` — lista de cálculos por categoria com busca, filtros e ações.
  - `CalculationModal` — execução de cálculos com parâmetros e pré-visualização de fórmula.
  - `FormulaPreviewModal` — mostra estrutura da fórmula, parâmetros e status de preenchimento.
- Administração:
  - `CreateCalculation` — fluxo em etapas para criar cálculos (nome, descrição, parâmetros, resultados, revisão).
  - `EditCalculation` — fluxo semelhante para editar cálculos existentes.
  - `LogsManagement` — métricas e paginação de logs.
- Utilidade:
  - `LoadingSpinner` — loading padronizado (`tipo="inline" | "overlay" | "full"`).
  - `OptimizedImage` — lazy loading, placeholder e fallback para imagens.
  - `PrivateRoute`, `ProtectedRoute` — proteção de rotas.

---

## Hooks e Serviços
- Firestore otimizado: `useOptimizedFirestore`
  - Cache em memória com invalidação e debounce; evita consultas redundantes.
- Fórmulas: `useFormulaService` e `formulaService` (CRUD de fórmulas, busca e métricas).
- FAQ: `useFAQ` e `faqService` com categorias pré-definidas.
- Integridade de dados: `useDataIntegrityCheck`
  - Valida duplicidades e consistência; usa `validateExpression`.
- Loading e Toast:
  - `useLoading` — gerenciamento de estados de carregamento.
  - `useToast` — feedback ao usuário (ex.: `toastSuccess`, `toastError`).
- Logs e localização:
  - `useLocationLogger` — coleta de localização (quando permitido) e registra logs.

---

## Fluxo de Criação/Edição de Cálculos
- Padrão em etapas: Básico → Parâmetros → Resultados → Revisão.
- Campos principais:
  - `name`, `description`, `categories: []`, `parameters: []`, `results: []`, `tags`, timestamps.
- Parâmetros/resultados incluem `ordem`, `tipo`, `createdAt` e metadados.
- Expressões:
  - Validação com `validateExpression` e avaliação segura com `evaluateExpression`.
- Persistência:
  - `CreateCalculation`: `addDoc(collection(db, "calculations"), data)`.
  - `EditCalculation`: atualiza documento existente com `updateDoc`.

---

## Validação e Expressões Matemáticas
- Utilitário: `src/utils/mathEvaluator.js`.
- Sintaxe de variáveis: `@[NomeDaVariavel]` (ex.: `@[Comprimento] * @[Largura]`).
- Operadores suportados: `+ - * / ()` e funções (`abs`, `pow`, etc.).
- Segurança:
  - Bloqueia expressões perigosas; não usa `eval`.
  - `validateExpression` deve ser chamado antes de avaliar.

---

## Performance
- Vite:
  - `optimizeDeps.include` com libs críticas para pré-bundling.
  - `build.terserOptions` removendo `console` e `debugger`.
- Preload de rotas e lazy loading de páginas.
- Firestore:
  - Cache por 5 min; `invalidateCache()` para sincronização.
- UI:
  - CSS otimizado em páginas grandes (`Calculator.css`, `LogsManagement.css`).
  - `OptimizedImage` para imagens.
- Evitar re-renders:
  - Uso de `memo`, `useMemo`, `useCallback` onde apropriado.

---

## Testes
- Framework: Vitest.
- Exemplos:
  - `tests/FormulaPreviewModal.test.jsx` valida renderização de seções, status de parâmetros e mensagens.
- Execução:
  - `npm run test` para modo watcher
  - `npm run test:run` para execução única

---

## Padrões de Código e UI
- Estilo:
  - Seguir convenções existentes de nomenclatura e estrutura.
  - Tailwind para estilos rápidos; CSS modular nas páginas pesadas.
- Importações:
  - Preferir import direto de componentes quando o índice global (`src/components/index.js`) limita exportações para otimizar bundle.
- Feedback ao usuário:
  - Reutilizar `useToast` e `LoadingSpinner` — não criar sistemas paralelos.
- Acessibilidade:
  - Definir `aria-label` nos botões e elementos interativos.
  - Evitar bloquear a navegação com overlays permanentes.

---

## Firestore e Regras
- Estruturas comuns:
  - `calculations/{id}` — metadados, parâmetros, resultados, tags, timestamps.
  - `users/{id}` — perfil e preferências.
  - `logs/{id}` — atividade do sistema (com ou sem localização).
- Regras e índices: ver `firestore.rules` e `firestore.indexes.json`.

---

## Rotina de PRs (Checklist)
- Rodar `npm run lint` e `npm run test`.
- Verificar lazy loading e preload quando adicionar páginas.
- Garantir uso de `useToast` e `LoadingSpinner` para UX consistente.
- Validar expressões com `validateExpression` e uso seguro de `evaluateExpression`.
- Atualizar documentação se o comportamento de componentes/hooks/serviços mudar.

---

## Onde Estender Sem Quebrar Padrões
- Novas páginas: seguir padrão lazy + preload quando críticas.
- Novos cálculos: usar `CreateCalculation`/`EditCalculation` e manter metadados (`ordem`, `tipo`, `createdAt`).
- Novos hooks/serviços: padronizar API, erros e integração com cache quando aplicável.
- UI: manter consistência com Tailwind e componentes existentes; reutilizar padrões.

---

## Referências Úteis
- `src/App.jsx` — definição de rotas e lazy loading.
- `src/utils/preloadRoutes.js` — preload crítico e admin.
- `src/hooks/useOptimizedFirestore.js` — cache de consultas.
- `src/components/CreateCalculation/index.jsx` — fluxo de criação e validações.
- `src/components/EditCalculation/index.jsx` — fluxo de edição e validações.
- `src/components/FormulaPreviewModal/index.jsx` — estrutura e validação de parâmetros.
- `src/components/LoadingSpinner` — sistema de loading padronizado.
- `src/context/ToastContext.jsx` — sistema de notificações.
- `vite.config.js` — otimizações de build e dev server.

---

Mantendo estes padrões, o projeto segue escalável, consistente e com boa performance, facilitando o trabalho de toda a equipe.