import { z } from "zod";

export const backupApiConfigSchema = z.object({
  baseUrl: z
    .string()
    .url({ message: "Informe uma URL válida" })
    .min(1, { message: "A URL é obrigatória" }),
  token: z.string().min(1, { message: "Informe o token/chave" }),
});

export const defaultBackupApiConfig = {
  baseUrl: import.meta.env?.VITE_BACKUP_API_BASE_URL || "",
  token: import.meta.env?.VITE_BACKUP_API_TOKEN || "",
};

