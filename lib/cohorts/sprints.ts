"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCohortAccess } from "./access";
import type { ActionResult } from "./actions";

const sprintInputSchema = z.object({
  title: z.string().trim().min(2, "Ingresá un título.").max(180),
  description: z.string().trim().max(100_000).default(""),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).refine(data => !data.startDate || !data.endDate || data.endDate >= data.startDate, { message: "La fecha de fin debe ser posterior al inicio.", path: ["endDate"] });

export async function createCohortSprintAction(cohortId: string, _: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  try {
    const { pb, user } = await requireCohortAccess(cohortId, { capability: "sprints" });
    if (user.role !== "admin" && user.role !== "docente") throw new Error("No autorizado.");
    const data = sprintInputSchema.parse(Object.fromEntries(formData));
    await pb.collection("sprints").create({ ...data, cohort: cohortId, startDate: data.startDate || null, endDate: data.endDate || null });
    revalidatePath(`/cohorts/${cohortId}/sprints`);
    return { success: true, message: "Sprint creado." };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues[0]?.message || "Revisá los datos." };
    return { success: false, error: error instanceof Error ? error.message : "No se pudo crear el sprint." };
  }
}
