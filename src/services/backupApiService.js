const CONFIG_KEY = "backupApiConfig";
const ENABLED = false;

function readEnvDefaults() {
  const baseUrl = import.meta.env?.VITE_BACKUP_API_BASE_URL || "";
  const token = import.meta.env?.VITE_BACKUP_API_TOKEN || "";
  return { baseUrl, token };
}

export function getConfig() {
  const raw = localStorage.getItem(CONFIG_KEY);
  if (!raw) return readEnvDefaults();
  try {
    const parsed = JSON.parse(raw);
    return {
      baseUrl: parsed?.baseUrl || "",
      token: parsed?.token || "",
    };
  } catch {
    return readEnvDefaults();
  }
}

export function saveConfig(config) {
  const normalized = {
    baseUrl: String(config?.baseUrl || ""),
    token: String(config?.token || ""),
  };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(normalized));
  return normalized;
}

export async function testConnection() {
  const { baseUrl, token } = getConfig();
  if (!ENABLED || !baseUrl) {
    return { status: "pending", message: "Conexão pendente" };
  }
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${baseUrl}/health`, {
      method: "GET",
      headers: { Authorization: token ? `Bearer ${token}` : undefined },
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!res.ok) return { status: "error", message: `HTTP ${res.status}` };
    return { status: "ok", message: "API ativa" };
  } catch (e) {
    return { status: "error", message: String(e?.message || e) };
  }
}

export async function triggerBackup() {
  const { baseUrl, token } = getConfig();
  if (!ENABLED || !baseUrl) {
    return { status: "pending", message: "Backup pendente" };
  }
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(`${baseUrl}/backup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: JSON.stringify({ source: "firestore" }),
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!res.ok) return { status: "error", message: `HTTP ${res.status}` };
    const data = await res.json().catch(() => ({}));
    return { status: "ok", message: "Backup iniciado", data };
  } catch (e) {
    return { status: "error", message: String(e?.message || e) };
  }
}

export async function getBackupHistory() {
  const { baseUrl, token } = getConfig();
  if (!ENABLED || !baseUrl) {
    return [];
  }
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${baseUrl}/backup/history`, {
      method: "GET",
      headers: { Authorization: token ? `Bearer ${token}` : undefined },
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!res.ok) return [];
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

