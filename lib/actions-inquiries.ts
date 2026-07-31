"use server";

import { revalidatePath } from "next/cache";
import type { Assignment, Class, Inquiry, InquiryResponse, Sprint, Week } from "@/types";
import { createServerClient } from "./pocketbase-server";
import { getLegacyCohort, requireCohortAccess } from "./cohorts/access";

export interface InquiryFilter {
  cohortId?: string;
  weekId?: string;
  classId?: string;
  assignmentId?: string;
  status?: string;
  authorId?: string;
  search?: string;
}

async function resolveCohortId(cohortId?: string) {
  return cohortId || (await getLegacyCohort()).id;
}

async function getAcademicContext(pb: Awaited<ReturnType<typeof createServerClient>>, data: {
  cohortId: string;
  weekId?: string;
  classId?: string;
  assignmentId?: string;
}) {
  if (data.classId && data.assignmentId) throw new Error("La consulta sólo puede relacionarse con una clase o con un trabajo práctico.");

  let parentCohortId: string | undefined;
  let parentWeekId: string | undefined;
  if (data.classId) {
    const item = await pb.collection("classes").getOne<Class>(data.classId);
    parentWeekId = item.week;
    if (item.week) parentCohortId = (await pb.collection("weeks").getOne<Week>(item.week)).cohort;
    if (item.sprint) parentCohortId = (await pb.collection("sprints").getOne<Sprint>(item.sprint)).cohort;
  }
  if (data.assignmentId) {
    const item = await pb.collection("assignments").getOne<Assignment>(data.assignmentId);
    parentWeekId = item.week;
    if (item.week) parentCohortId = (await pb.collection("weeks").getOne<Week>(item.week)).cohort;
    if (item.sprint) parentCohortId = (await pb.collection("sprints").getOne<Sprint>(item.sprint)).cohort;
  }
  if (data.weekId) {
    const week = await pb.collection("weeks").getOne<Week>(data.weekId);
    if (week.cohort !== data.cohortId) throw new Error("La semana no pertenece a la cohorte seleccionada.");
    if (parentWeekId && parentWeekId !== week.id) throw new Error("El contenido seleccionado no pertenece a esta semana.");
  }
  if (parentCohortId && parentCohortId !== data.cohortId) throw new Error("El contenido seleccionado pertenece a otra cohorte.");
  return { weekId: parentWeekId || data.weekId };
}

async function requireInquiry(id: string, activeEnrollment = false) {
  const pb = await createServerClient();
  const inquiry = await pb.collection("inquiries").getOne<Inquiry>(id, { expand: "author,class,assignment,cohort,week" });
  const context = await requireCohortAccess(inquiry.cohort, { activeEnrollment });
  return { ...context, inquiry };
}

export async function getInquiries(filter?: InquiryFilter) {
  const cohortId = await resolveCohortId(filter?.cohortId);
  const context = await requireCohortAccess(cohortId);
  const filters = [context.pb.filter("cohort = {:cohort}", { cohort: cohortId })];
  if (filter?.weekId) filters.push(context.pb.filter("week = {:week}", { week: filter.weekId }));
  if (filter?.classId) filters.push(context.pb.filter("class = {:class}", { class: filter.classId }));
  if (filter?.assignmentId) filters.push(context.pb.filter("assignment = {:assignment}", { assignment: filter.assignmentId }));
  if (filter?.status) filters.push(context.pb.filter("status = {:status}", { status: filter.status }));
  if (filter?.authorId) filters.push(context.pb.filter("author = {:author}", { author: filter.authorId }));

  if (filter?.search) {
    const term = filter.search.trim();
    const responses = await context.pb.collection("inquiry_responses").getList(1, 50, {
      filter: context.pb.filter("inquiry.cohort = {:cohort} && content ~ {:term}", { cohort: cohortId, term }),
      fields: "inquiry",
    });
    const clauses = ["title ~ {:term}", "description ~ {:term}", "author.name ~ {:term}", "author.email ~ {:term}", "class.title ~ {:term}", "assignment.title ~ {:term}", "week.title ~ {:term}"];
    const values: Record<string, string> = { term };
    responses.items.slice(0, 20).forEach((record, index) => {
      const key = `response${index}`;
      values[key] = String(record.inquiry);
      clauses.push(`id = {:${key}}`);
    });
    filters.push(context.pb.filter(`(${clauses.join(" || ")})`, values));
  }

  return context.pb.collection("inquiries").getFullList<Inquiry>({
    filter: filters.join(" && "), sort: "-created", expand: "author,class,assignment,cohort,week",
  });
}

export async function getInquiry(id: string) {
  try {
    const { inquiry } = await requireInquiry(id);
    return { success: true as const, data: inquiry };
  } catch (error: unknown) {
    if ((error as { status?: number })?.status !== 404) console.error("Error fetching inquiry:", error);
    return { success: false as const, error: "Consulta no encontrada" };
  }
}

export async function createInquiry(data: { title: string; description: string; cohortId?: string; weekId?: string; classId?: string; assignmentId?: string }) {
  try {
    const cohortId = await resolveCohortId(data.cohortId);
    const context = await requireCohortAccess(cohortId, { activeEnrollment: true });
    const academic = await getAcademicContext(context.pb, { ...data, cohortId });
    const record = await context.pb.collection("inquiries").create<Inquiry>({
      title: data.title.trim(), description: data.description.trim(), status: "Pendiente", author: context.user.id,
      cohort: cohortId, week: academic.weekId || null, class: data.classId || null, assignment: data.assignmentId || null,
    });
    revalidatePath(`/cohorts/${cohortId}/inquiries`);
    revalidatePath("/inquiries");
    if (academic.weekId) revalidatePath(`/cohorts/${cohortId}/weeks/${academic.weekId}`);
    return { success: true as const, data: record };
  } catch (error: unknown) {
    console.error("Error creating inquiry:", error);
    return { success: false as const, error: error instanceof Error ? error.message : "Error al crear la consulta" };
  }
}

export async function updateInquiryStatus(id: string, status: "Pendiente" | "Resuelta") {
  try {
    const { pb, user, inquiry } = await requireInquiry(id, true);
    if (user.role === "estudiante" && inquiry.author !== user.id) throw new Error("No autorizado.");
    await pb.collection("inquiries").update(id, { status });
    revalidatePath(`/inquiries/${id}`); revalidatePath(`/cohorts/${inquiry.cohort}/inquiries/${id}`); revalidatePath("/inquiries"); revalidatePath(`/cohorts/${inquiry.cohort}/inquiries`);
    return { success: true as const, message: status === "Resuelta" ? "Consulta resuelta." : "Consulta reabierta." };
  } catch (error: unknown) {
    return { success: false as const, error: error instanceof Error ? error.message : "Error al actualizar estado" };
  }
}

export async function deleteInquiry(id: string) {
  try {
    const { pb, user, inquiry } = await requireInquiry(id, true);
    if (user.role === "estudiante" && inquiry.author !== user.id) throw new Error("No autorizado.");
    await pb.collection("inquiries").delete(id);
    revalidatePath("/inquiries"); revalidatePath(`/cohorts/${inquiry.cohort}/inquiries`);
    return { success: true as const };
  } catch (error: unknown) {
    return { success: false as const, error: error instanceof Error ? error.message : "Error al eliminar la consulta" };
  }
}

export async function getInquiryResponses(inquiryId: string) {
  try {
    const { pb } = await requireInquiry(inquiryId);
    return pb.collection("inquiry_responses").getFullList<InquiryResponse>({ filter: pb.filter("inquiry = {:inquiry}", { inquiry: inquiryId }), sort: "created", expand: "author" });
  } catch (error) {
    console.error("Error fetching responses:", error);
    return [];
  }
}

export async function createInquiryResponse(inquiryId: string, content: string) {
  try {
    const { pb, user } = await requireInquiry(inquiryId, true);
    await pb.collection("inquiry_responses").create({ inquiry: inquiryId, author: user.id, content: content.trim() });
    revalidatePath(`/inquiries/${inquiryId}`);
    const inquiry = await pb.collection("inquiries").getOne<Inquiry>(inquiryId, { fields: "cohort" });
    revalidatePath(`/cohorts/${inquiry.cohort}/inquiries/${inquiryId}`);
    return { success: true as const };
  } catch (error: unknown) {
    return { success: false as const, error: error instanceof Error ? error.message : "Error al enviar respuesta" };
  }
}

export async function deleteInquiryResponse(responseId: string, inquiryId: string) {
  try {
    const { pb, user } = await requireInquiry(inquiryId, true);
    const response = await pb.collection("inquiry_responses").getOne<InquiryResponse>(responseId);
    if (response.inquiry !== inquiryId) throw new Error("La respuesta no pertenece a esta consulta.");
    if (user.role === "estudiante" && response.author !== user.id) throw new Error("No autorizado.");
    await pb.collection("inquiry_responses").delete(responseId);
    revalidatePath(`/inquiries/${inquiryId}`);
    return { success: true as const };
  } catch (error: unknown) {
    return { success: false as const, error: error instanceof Error ? error.message : "Error al eliminar respuesta" };
  }
}
