import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";
import { backupApiConfigSchema, defaultBackupApiConfig } from "@/schemas/backupApi";
import { getConfig, saveConfig, testConnection, triggerBackup, getBackupHistory } from "@/services/backupApiService";

function BackupAPI() {
  const toast = useToast();
  const form = useForm({
    resolver: zodResolver(backupApiConfigSchema),
    defaultValues: { ...defaultBackupApiConfig, ...getConfig() },
    mode: "onChange",
  });

  const [history, setHistory] = React.useState([]);
  const [loadingHistory, setLoadingHistory] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [starting, setStarting] = React.useState(false);

  const onSubmit = (values) => {
    const saved = saveConfig(values);
    toast.success("Configuração salva");
    form.reset(saved);
  };

  const onTest = async () => {
    setTesting(true);
    const res = await testConnection();
    setTesting(false);
    if (res.status === "ok") toast.success(res.message || "API ativa");
    else if (res.status === "pending") toast.info(res.message || "Conexão pendente");
    else toast.error(res.message || "Erro ao testar");
  };

  const onStartBackup = async () => {
    setStarting(true);
    const res = await triggerBackup();
    setStarting(false);
    if (res.status === "ok") toast.success(res.message || "Backup iniciado");
    else if (res.status === "pending") toast.info(res.message || "Backup pendente");
    else toast.error(res.message || "Falha ao iniciar backup");
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    const list = await getBackupHistory();
    setHistory(Array.isArray(list) ? list : []);
    setLoadingHistory(false);
  };

  React.useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[#00418F]">Backup da API</h1>
      <p className="mt-2 text-sm text-gray-600">Preparação da conexão com a API de backup do Firestore. A integração está pendente.</p>

      <div className="mt-6 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Configuração</h2>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Base URL</label>
            <Input placeholder="https://api.exemplo.com" {...form.register("baseUrl")} aria-invalid={!!form.formState.errors.baseUrl} />
            {form.formState.errors.baseUrl && (
              <span className="mt-1 block text-sm text-red-600">{form.formState.errors.baseUrl.message}</span>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Token/Chave</label>
            <Input placeholder="token opcional" {...form.register("token")} aria-invalid={!!form.formState.errors.token} />
            {form.formState.errors.token && (
              <span className="mt-1 block text-sm text-red-600">{form.formState.errors.token.message}</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="primary">Salvar</Button>
            <Button type="button" variant="secondary" onClick={() => form.reset(getConfig())}>Recarregar</Button>
          </div>
        </form>
      </div>

      <div className="mt-6 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Status</h2>
        <p className="mt-2 text-sm text-gray-600">A API permanece pendente até ativarmos a integração.</p>
        <div className="mt-4 flex gap-3">
          <Button onClick={onTest} disabled={testing}>
            {testing ? "Testando..." : "Testar conexão"}
          </Button>
          <Button onClick={onStartBackup} variant="outline" disabled={starting}>
            {starting ? "Iniciando..." : "Iniciar backup"}
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Histórico de backups</h2>
          <Button variant="ghost" onClick={loadHistory} disabled={loadingHistory}>{loadingHistory ? "Atualizando..." : "Atualizar"}</Button>
        </div>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">Nenhum backup registrado ainda.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {history.map((item, idx) => (
              <li key={idx} className="rounded border px-3 py-2 text-sm">
                {JSON.stringify(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default BackupAPI;

