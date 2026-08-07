import { z } from "zod";
import type { CohortMode } from "@/types";

export const cohortModes = ["sprints_and_teams", "weekly"] as const;
export function assertAdminRole(role: string | undefined) { if (role !== "admin") throw new Error("Sólo un administrador puede acceder a esta operación."); }
export const cohortModeSchema = z.enum(cohortModes);
export const cohortStatusSchema = z.enum(["active", "archived"]);
export const enrollmentStatusSchema = z.enum(["active", "completed"]);
export const enrollmentEntryTypeSchema = z.enum(["new", "repeater"]);
export const weekPublicationStatusSchema = z.enum(["draft", "published"]);

export const normalizedEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("El correo no es válido.");

export const cohortInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  mode: cohortModeSchema,
  status: cohortStatusSchema.default("active"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const admissionInputSchema = z.object({
  displayName: z.string().trim().min(2).max(160),
  email: normalizedEmailSchema,
  dni: z.string().trim().max(32).optional(),
  birthDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  phone: z.string().trim().max(50).optional(),
  cohortId: z.string().trim().min(1),
  entryType: enrollmentEntryTypeSchema,
});

export const existingStudentEnrollmentInputSchema = z.object({
  userId: z.string().trim().min(1),
  entryType: enrollmentEntryTypeSchema,
});

export const weekInputSchema = z.object({
  number: z.coerce.number().int().min(0),
  title: z.string().trim().min(2).max(180),
  description: z.string().max(100_000).default(""),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export function normalizeEmail(email: string) {
  return normalizedEmailSchema.parse(email);
}

export function assertExclusiveAcademicParent(parent: { sprint?: string | null; week?: string | null }) {
  const sprint = parent.sprint?.trim() || "";
  const week = parent.week?.trim() || "";
  if (Boolean(sprint) === Boolean(week)) {
    throw new Error("El contenido debe pertenecer exactamente a un sprint o a una semana.");
  }
  return sprint ? { sprint, week: null } : { sprint: null, week };
}

export const capabilitiesByMode: Record<CohortMode, ReadonlySet<string>> = {
  sprints_and_teams: new Set(["sprints", "teams", "chat", "content", "deliveries", "inquiries", "reviews", "surveys", "dashboard"]),
  weekly: new Set(["weeks", "content", "deliveries", "inquiries", "dashboard"]),
};

export function assertModeCapability(mode: CohortMode, capability: string) {
  if (!capabilitiesByMode[mode].has(capability)) {
    throw new Error(`La modalidad ${mode} no admite el módulo ${capability}.`);
  }
}
