import { teacherAssignmentHref, teacherStudentHref } from "./routes";

export type TeacherAttentionType = "inquiry" | "delivery-risk" | "follow-up" | "review" | "enrollment-request";
export type TeacherAttentionUrgency = "critical" | "upcoming" | "routine";

export interface TeacherAttentionItem {
  id: string;
  type: TeacherAttentionType;
  urgency: TeacherAttentionUrgency;
  cohortId: string;
  cohortName: string;
  studentId?: string;
  personName?: string;
  periodId?: string;
  contextLabel: string;
  title: string;
  reason: string;
  timestamp: string;
  href: string;
  actionLabel: string;
}

export interface TeacherAttentionInput {
  inquiries?: Array<{ id: string; cohortId: string; cohortName: string; title: string; authorId?: string; authorName?: string; contextLabel: string; updated: string }>;
  deliveryRisks?: Array<{ id: string; cohortId: string; cohortName: string; studentId: string; studentName: string; assignmentId: string; assignmentTitle: string; periodId: string; periodLabel: string; state: "overdue" | "due-soon"; dueDate: string }>;
  followUps?: Array<{ id: string; cohortId: string; cohortName: string; studentId: string; studentName: string; periodId?: string; periodLabel: string; created: string }>;
  reviews?: Array<{ id: string; cohortId: string; cohortName: string; studentId: string; studentName: string; periodId?: string; periodLabel: string; startTime: string }>;
  enrollmentRequests?: Array<{ id: string; cohortId: string; cohortName: string; personName: string; created: string }>;
}

export function projectTeacherAttention(input: TeacherAttentionInput): TeacherAttentionItem[] {
  const items: TeacherAttentionItem[] = [];
  for (const inquiry of input.inquiries ?? []) items.push({ id: `inquiry:${inquiry.id}`, type: "inquiry", urgency: "routine", cohortId: inquiry.cohortId, cohortName: inquiry.cohortName, studentId: inquiry.authorId, personName: inquiry.authorName, contextLabel: inquiry.contextLabel, title: inquiry.title, reason: "Consulta pendiente de respuesta", timestamp: inquiry.updated, href: `/cohorts/${inquiry.cohortId}/inquiries/${inquiry.id}`, actionLabel: "Abrir consulta" });
  for (const risk of input.deliveryRisks ?? []) items.push({ id: `delivery:${risk.id}`, type: "delivery-risk", urgency: risk.state === "overdue" ? "critical" : "upcoming", cohortId: risk.cohortId, cohortName: risk.cohortName, studentId: risk.studentId, personName: risk.studentName, periodId: risk.periodId, contextLabel: `${risk.periodLabel} · ${risk.assignmentTitle}`, title: risk.studentName, reason: risk.state === "overdue" ? "Entrega vencida" : "Entrega próxima a vencer", timestamp: risk.dueDate, href: teacherAssignmentHref(risk.cohortId, risk.assignmentId, risk.studentId), actionLabel: "Revisar entrega" });
  for (const followUp of input.followUps ?? []) items.push({ id: `follow-up:${followUp.id}`, type: "follow-up", urgency: "critical", cohortId: followUp.cohortId, cohortName: followUp.cohortName, studentId: followUp.studentId, personName: followUp.studentName, periodId: followUp.periodId, contextLabel: followUp.periodLabel, title: followUp.studentName, reason: "Solicitó contacto docente", timestamp: followUp.created, href: teacherStudentHref(followUp.cohortId, followUp.studentId, { signal: "follow-up" }), actionLabel: "Abrir estudiante" });
  for (const review of input.reviews ?? []) items.push({ id: `review:${review.id}`, type: "review", urgency: "upcoming", cohortId: review.cohortId, cohortName: review.cohortName, studentId: review.studentId, personName: review.studentName, periodId: review.periodId, contextLabel: review.periodLabel, title: review.studentName, reason: "Revisión reservada próxima", timestamp: review.startTime, href: `/cohorts/${review.cohortId}/reviews/appointments/${review.id}`, actionLabel: "Abrir revisión" });
  for (const request of input.enrollmentRequests ?? []) items.push({ id: `enrollment:${request.id}`, type: "enrollment-request", urgency: "routine", cohortId: request.cohortId, cohortName: request.cohortName, personName: request.personName, contextLabel: request.cohortName, title: request.personName, reason: "Solicitud de matriculación pendiente", timestamp: request.created, href: `/staff/enrollment-requests?status=pending&request=${encodeURIComponent(request.id)}`, actionLabel: "Revisar solicitud" });
  return sortTeacherAttention(items);
}

export function sortTeacherAttention(items: TeacherAttentionItem[]) {
  const rank: Record<TeacherAttentionUrgency, number> = { critical: 0, upcoming: 1, routine: 2 };
  return [...items].sort((a, b) => rank[a.urgency] - rank[b.urgency] || a.timestamp.localeCompare(b.timestamp) || a.id.localeCompare(b.id));
}

