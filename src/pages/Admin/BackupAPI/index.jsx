import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";
import { backupApiConfigSchema, defaultBackupApiConfig } from "@/schemas/backupApi";
import { getConfig, saveConfig, triggerBackup } from "@/services/backupApiService";

function BackupAPI() {
  const toast = useToast();
  const form = useForm({
    resolver: zodResolver(backupApiConfigSchema),
    defaultValues: { ...defaultBackupApiConfig, ...getConfig() },
    mode: "onChange",
  });

  const [starting, setStarting] = React.useState(false);
  const [backupResult, setBackupResult] = React.useState(null);
  const formatDateTime = React.useCallback((value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d)) return String(value);
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium", timeZone: "America/Sao_Paulo" }).format(d);
  }, []);

  const onSubmit = (values) => {
    const saved = saveConfig(values);
    toast.success("Configuração salva");
    form.reset(saved);
  };

  const onStartBackup = async () => {
    setStarting(true);
    const res = await triggerBackup();
    setStarting(false);
    if (res.status === "ok") {
      toast.success(res.message || "Backup iniciado");
      setBackupResult(res.data || null);
    } else if (res.status === "pending") {
      toast.info(res.message || "Backup pendente");
      setBackupResult(null);
    } else {
      toast.error(res.message || "Falha ao iniciar backup");
      setBackupResult(null);
    }
  };

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
        <h2 className="text-lg font-semibold">Backup</h2>
        <p className="mt-2 text-sm text-gray-600">Dispara o backup completo do Firestore para SQL.</p>
        <div className="mt-4">
          <Button onClick={onStartBackup} variant="outline" disabled={starting}>
            {starting ? "Iniciando..." : "Iniciar backup"}
          </Button>
        </div>
        {backupResult && (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md border p-3">
              <div className="text-sm text-gray-600">Status</div>
              <div className="text-base font-medium">{backupResult.status || "-"}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-sm text-gray-600">Início</div>
              <div className="text-base font-medium">{formatDateTime(backupResult.startedAt)}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-sm text-gray-600">Término</div>
              <div className="text-base font-medium">{formatDateTime(backupResult.completedAt)}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-sm text-gray-600">Cálculos</div>
              <div className="text-base font-medium">{backupResult.counts?.calculations ?? 0}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-sm text-gray-600">Categorias</div>
              <div className="text-base font-medium">{backupResult.counts?.categories ?? 0}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-sm text-gray-600">Outros</div>
              <div className="text-base font-medium">{backupResult.counts?.extra ?? 0}</div>
            </div>
          </div>
        )}
      </div>

      {/* Histórico removido: API possui apenas o endpoint de backup */}
    </div>
  );
}

export default BackupAPI;

