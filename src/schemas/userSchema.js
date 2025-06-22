import * as z from "zod";

export const userSchema = z.object({
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
  email: z.string()
    .email("Email inválido")
    .min(1, "Email é obrigatório"),
  role: z.enum(["user", "admin"], {
    errorMap: () => ({ message: "Role deve ser 'user' ou 'admin'" })
  }).default("user"),
  active: z.boolean().default(true),
  createdAt: z.date().optional(),
  preferences: z.object({
    theme: z.enum(["light", "dark"]).default("light"),
    hideFooter: z.boolean().default(false),
    language: z.string().default("pt-BR"),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      marketing: z.boolean().default(false)
    }).default({}),
    accessibility: z.object({
      highContrast: z.boolean().default(false),
      fontSize: z.enum(["small", "medium", "large"]).default("medium"),
      reducedMotion: z.boolean().default(false)
    }).default({}),
    privacy: z.object({
      shareLocation: z.boolean().default(false),
      shareUsageData: z.boolean().default(true),
      profileVisibility: z.enum(["public", "private"]).default("private")
    }).default({})
  }).optional()
});

// Schema para atualização de usuário (campos opcionais)
export const updateUserSchema = userSchema.partial();

// Schema específico para alteração de status
export const userStatusSchema = z.object({
  active: z.boolean()
});