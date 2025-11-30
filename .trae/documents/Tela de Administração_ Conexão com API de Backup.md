## Objetivo
Criar uma tela em Administração para preparar a conexão com a API de backup do Firestore para banco local, deixando-a pendente (sem chamadas reais até a API estar pronta), mas com toda a estrutura de UI, rotas e serviço pronta para ativar.

## Novas Rotas e Navegação
- Adicionar rota protegida: `/admin/backup` (apenas para admins) no `App.jsx`.
- Incluir item "Backup da API" no menu de Administração (`Navbar` → `NavLinks.jsx`).

## Tela "Backup da API"
- Local: `src/pages/Admin/BackupAPI/index.jsx` seguindo o padrão de páginas.
- Seções:
  - Configuração: campos para `Base URL` e `Token/Chave` (com `react-hook-form` + `zod`).
  - Status: "Último backup", "Estado da API" e mensagens de pendência.
  - Ações: botões "Testar conexão" e "Iniciar backup" (desabilitados enquanto pendente).
- UI: utilizar componentes de `src/components/ui` (inputs, buttons, dialog/toast) e Tailwind.

## Serviço (pendente, pronto para integrar)
- Criar `src/services/backupApiService.js` com assinaturas:
  - `saveConfig({ baseUrl, token })` – apenas persiste no front (localStorage) por enquanto.
  - `getConfig()` – lê a config salva.
  - `testConnection()` – retorna um estado "pendente" sem chamar rede.
  - `triggerBackup()` – retorna "pendente" sem chamar rede.
  - `getBackupHistory()` – retorna lista vazia/simulada.
- Implementar estrutura com `fetch` e `AbortController`, mas condicionar chamadas reais à presença de `import.meta.env.VITE_BACKUP_API_BASE_URL` e flag interna `ENABLED`. Enquanto a API não estiver pronta, manter `ENABLED=false`.

## Validação e Estado
- `zod` para validar URL e token.
- Feedback com toasts (sucesso/aviso de pendência/erro de validação).
- Loading e desabilitar ações conforme pendência.

## Flags de Pendência
- Ambiente: preparar `VITE_BACKUP_API_BASE_URL` e `VITE_BACKUP_API_TOKEN` (sem exigir valores agora).
- Serviço: `ENABLED=false` por padrão; quando ativarmos, trocar para `true` e as funções passam a usar `fetch` nos endpoints:
  - `GET /health` para `testConnection`
  - `POST /backup` para `triggerBackup`
  - `GET /backup/history` para `getBackupHistory`

## Pontos de Extensão
- Persistir configuração em Firestore (ex.: coleção `app_configs`) via `firebaseWrapper.js` quando desejado.
- Agendamento de backups e logs em `src/pages/LogsManagement` futuramente.

## Verificação
- Navegar até `/admin/backup` autenticado como admin.
- Preencher config e observar validação/toasts.
- Ver botões desabilitados e mensagens de "Conexão pendente".

Se aprovar, implemento as rotas, a página, o serviço e o item de menu conforme o plano, mantendo todas as integrações reais desligadas até a API estar pronta.