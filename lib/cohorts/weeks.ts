"use server";

import { revalidatePath } from "next/cache";
import type { Assignment, Class, Week } from "@/types";
import { requireCohortAccess } from "./access";
import { weekInputSchema } from "./domain";
import type { ActionResult } from "./actions";
import { canStudentViewWeek, weekPublicationPatch } from "./publication";
import { notFound } from "next/navigation";

const fail = (error: unknown): ActionResult => ({ success: false, error: error instanceof Error ? error.message : "Ocurrió un error." });

export async function getWeeks(cohortId: string) {
  const { pb, user } = await requireCohortAccess(cohortId, { capability: "weeks" });
  const staff = user.role === "admin" || user.role === "docente";
  return pb.collection("weeks").getFullList<Week>({
    filter: staff ? pb.filter("cohort = {:cohort}", { cohort: cohortId }) : pb.filter("cohort = {:cohort} && publicationStatus = 'published'", { cohort: cohortId }),
    sort: "number",
  });
}

export async function getWeek(cohortId: string, weekId: string) {
  const context = await requireCohortAccess(cohortId, { capability: "weeks" });
  const week = await context.pb.collection("weeks").getOne<Week>(weekId).catch(() => notFound());
  if (week.cohort !== cohortId) notFound();
  if (context.user.role === "estudiante" && !canStudentViewWeek(week.publicationStatus)) notFound();
  return { ...context, week };
}

export async function getWeekContent(cohortId: string, weekId: string) {
  const context = await getWeek(cohortId, weekId);
  const [classes, assignments] = await Promise.all([
    context.pb.collection("classes").getFullList<Class>({ filter: context.pb.filter("week = {:week}", { week: weekId }), sort: "date,created" }),
    context.pb.collection("assignments").getFullList<Assignment>({ filter: context.pb.filter("week = {:week}", { week: weekId }), sort: "created" }),
  ]);
  return { ...context, classes, assignments };
}

export async function createWeekAction(cohortId: string, _: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  try {
    const { pb, user } = await requireCohortAccess(cohortId, { capability: "weeks" });
    if (user.role !== "admin" && user.role !== "docente") throw new Error("No autorizado.");
    const data = weekInputSchema.parse(Object.fromEntries(formData));
    await pb.collection("weeks").create({ ...data, cohort: cohortId, publicationStatus: "draft", publishedAt: null, startDate: data.startDate || null, endDate: data.endDate || null });
    revalidatePath(`/cohorts/${cohortId}/weeks`);
    return { success: true, message: "Semana creada como borrador." };
  } catch (error) { return fail(error); }
}

export async function updateWeekAction(cohortId: string, weekId: string, _: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  try {
    const { pb, user, week } = await getWeek(cohortId, weekId);
    if (user.role !== "admin" && user.role !== "docente") throw new Error("No autorizado.");
    const data = weekInputSchema.parse(Object.fromEntries(formData));
    await pb.collection("weeks").update(week.id, { ...data, startDate: data.startDate || null, endDate: data.endDate || null });
    revalidatePath(`/cohorts/${cohortId}/weeks`); revalidatePath(`/cohorts/${cohortId}/weeks/${weekId}`);
    return { success: true, message: "Semana actualizada." };
  } catch (error) { return fail(error); }
}

export async function setWeekPublicationAction(cohortId: string, weekId: string, publish: boolean): Promise<ActionResult> {
  try {
    const { pb, user, week } = await getWeek(cohortId, weekId);
    if (user.role !== "admin" && user.role !== "docente") throw new Error("No autorizado.");
    await pb.collection("weeks").update(week.id, weekPublicationPatch(publish));
    revalidatePath(`/cohorts/${cohortId}/weeks`); revalidatePath(`/cohorts/${cohortId}/weeks/${weekId}`);
    return { success: true, message: publish ? "Semana publicada." : "Semana devuelta a borrador." };
  } catch (error) { return fail(error); }
}

export async function deleteWeekAction(cohortId: string, weekId: string, confirmed: boolean): Promise<ActionResult> {
  try {
    if (!confirmed) throw new Error("La eliminación requiere confirmación explícita.");
    const { pb, user, week } = await getWeek(cohortId, weekId);
    if (user.role !== "admin" && user.role !== "docente") throw new Error("No autorizado.");
    const [classes, assignments] = await Promise.all([
      pb.collection("classes").getList(1, 1, { filter: pb.filter("week = {:week}", { week: week.id }) }),
      pb.collection("assignments").getList(1, 1, { filter: pb.filter("week = {:week}", { week: week.id }) }),
    ]);
    if (classes.totalItems || assignments.totalItems) throw new Error("No se puede eliminar una semana con clases o trabajos. Eliminá o trasladá primero su contenido.");
    await pb.collection("weeks").delete(week.id);
    revalidatePath(`/cohorts/${cohortId}/weeks`);
    return { success: true, message: "Semana eliminada." };
  } catch (error) { return fail(error); }
}
