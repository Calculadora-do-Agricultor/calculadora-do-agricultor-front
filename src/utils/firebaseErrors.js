// Mapeamento de códigos de erro do Firebase/Firestore para mensagens amigáveis
// Uso: mapFirebaseError(err) => { code, title, message, severity, isNetworkError, hints }

const NETWORK_CODES = new Set([
  'unavailable', // Firestore network unavailable
  'deadline-exceeded',
  'network-request-failed', // Auth/Storage
  'failed-precondition', // e.g., missing index can feel like failure; treat separately
]);

export function mapFirebaseError(err) {
  const rawCode = (err?.code || err?.name || '').toString();
  const code = rawCode.toLowerCase();

  // Base defaults
  let title = 'Erro ao acessar dados';
  let message = 'Falha ao comunicar com o serviço de dados. Tente novamente.';
  let severity = 'warning';
  let isNetworkError = false;
  const hints = [];

  // Specific mappings (Auth/Firestore common)
  switch (code) {
    case 'unavailable':
    case 'network-request-failed':
      title = 'Falha de rede';
      message = 'Não foi possível conectar ao Firestore. Verifique sua conexão ou tente novamente em instantes.';
      severity = 'destructive';
      isNetworkError = true;
      hints.push('Se estiver em dev, considere ativar emuladores (`VITE_FIREBASE_USE_EMULATORS=true`).');
      break;
    case 'deadline-exceeded':
      title = 'Tempo de resposta excedido';
      message = 'O servidor demorou para responder. Tente novamente ou ajuste os filtros.';
      severity = 'warning';
      isNetworkError = true;
      break;
    case 'permission-denied':
      title = 'Permissão negada';
      message = 'Você não possui acesso aos registros. Faça login como administrador.';
      severity = 'info';
      break;
    case 'failed-precondition':
      title = 'Pré-condição falhou';
      message = 'Consulta inválida ou índice ausente. Ajuste os filtros ou configure índices no Firestore.';
      severity = 'warning';
      hints.push('Confira regras/índices do Firestore e simplifique filtros complexos.');
      break;
    case 'not-found':
      title = 'Coleção não encontrada';
      message = 'A coleção de logs não foi localizada. Verifique a configuração do projeto.';
      severity = 'info';
      break;
    default:
      // Keep defaults; enrich with original message when available
      if (err?.message) {
        message = err.message;
      }
  }

  return { code, title, message, severity, isNetworkError, hints };
}

export function logFirebaseError(err, context = 'Firestore') {
  const info = mapFirebaseError(err);
  // console group for clearer debug
  /* eslint-disable no-console */
  console.groupCollapsed(`[${context}] ${info.title} (${info.code || 'unknown'})`);
  console.log('Mensagem:', info.message);
  if (info.hints?.length) console.log('Dicas:', info.hints);
  console.log('Detalhes brutos:', {
    code: err?.code,
    name: err?.name,
    message: err?.message,
    stack: err?.stack?.split('\n')[0],
  });
  console.groupEnd();
  /* eslint-enable no-console */
  return info;
}