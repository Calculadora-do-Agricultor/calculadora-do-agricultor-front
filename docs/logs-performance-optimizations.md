# Otimizações de Performance — Página de Logs

Este documento descreve as otimizações aplicadas na página de Logs para garantir alto desempenho e fluidez mesmo com grandes volumes de dados.

## Objetivos

- Virtualização de lista para reduzir custo de renderização.
- Paginação e lazy loading com infinite scroll.
- Uso de componentes ShadcnUI para consistência visual e desenvolvimento ágil.
- Cache inteligente em memória com TTL por filtros e página.
- Consultas ao backend (Firestore) com filtros eficientes e agregação de contagem.
- Responsividade da interface sob carga elevada.
- Benchmarks de performance antes e depois das mudanças.

## Mudanças Principais

- Virtualização com `@tanstack/react-virtual`:
  - Inicialização do virtualizer com `estimateSize` e `overscan`.
  - Renderização de itens apenas dentro da viewport.

- Paginação e Lazy Loading:
  - `LOGS_PER_PAGE = 10` com cursores (`startAfter`) por página.
  - Infinite scroll com listener no container e limiar de proximidade do fim (`nearBottomThreshold`).
  - Estado `hasMore` controla carregamentos adicionais.

- Cache Inteligente:
  - `cacheRef: Map` com TTL de 5 minutos (`CACHE_TTL_MS`).
  - Chave de cache baseada em filtros e página: `{p,u,ip,sd,ed}`.
  - Cache para dados e contagem agregada.

- Consultas Otimizadas (Firestore):
  - Filtros server-side: `where("idUser", "==", value)`, `where("ip", "==", value)`.
  - Intervalo de datas: `where("date", ">=")` e `where("date", "<=")` com `Timestamp`.
  - `orderBy("date", "desc")` quando aplicável.
  - `getCountFromServer(baseQuery)` para total de registros (com fallback em falhas).

- UI e Responsividade:
  - Integração de `Button` e `Input` (ShadcnUI) em filtros e ações.
  - Container rolável em altura fixa (`h-[65vh]`) e layout responsivo.

## Benchmark de Performance

### Como Executar

1. Inicie o servidor de desenvolvimento: `npm run dev`.
2. Abra `/admin/logs` (bypass de dev habilitado).
3. No "Painel de Benchmark (dev)", pressione:
   - "Rodar Benchmark" para comparar render sem e com virtualização.
   - Opcionalmente, alternar o estado de virtualização com o botão dedicado.

### Métricas Coletadas

- Tempo de busca (fetch) via `performance.now()` no ciclo de `fetchLogs`.
- Tempo de render (render) aproximado via duas `requestAnimationFrame` consecutivas.

### Resultados (Exemplo)

> Observação: valores exatos variam conforme volume e ambiente.

- Baseline (sem virtualização):
  - Fetch: ~X ms
  - Render: ~Y ms

- Otimizado (com virtualização):
  - Fetch: ~X ms (inalterado)
  - Render: ~Z ms (redução significativa versus Y)

## Considerações e Limitações

- Filtros por localização são aplicados client-side se o esquema não suportar índices adequados.
- Virtualização melhora custo de render, mas não substitui boas práticas de consulta.
- Cache em memória é por sessão; para persistência, considerar um cache distribuído ou IndexedDB.

## Próximos Passos

- Adicionar botões e componentes adicionais do ShadcnUI conforme o design final (ex.: `select`, `dropdown-menu`).
- Avaliar prefetch sob ociosidade (Idle) para páginas adjacentes.
- Implementar testes automatizados de performance em cenários controlados.

---

Última atualização: automatizada com as mudanças atuais.