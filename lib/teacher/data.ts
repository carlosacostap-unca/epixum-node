import type { Assignment, Cohort, CohortEnrollment, Delivery, EnrollmentRequest, Inquiry, JavascriptAssessmentResult, Review, Sprint, StudentSurvey, User, Week } from "@/types";
import { projectTeacherAttention, type TeacherAttentionInput, type TeacherAttentionItem } from "./attention";
import { projectTeacherDeliveryStates } from "./delivery-state";

export type TeacherAttentionSourceId = "inquiries" | "deliveries" | "followUps" | "reviews" | "enrollmentRequests";
export interface TeacherSourceResult { available: boolean; count: number; message?: string }
export interface TeacherAttentionData { items: TeacherAttentionItem[]; sources: Record<TeacherAttentionSourceId, TeacherSourceResult>; allClear: boolean }

type ListOptions = { filter?: string; expand?: string; fields?: string; sort?: string };
export interface TeacherDataClient {
  filter(template: string, values?: Record<string, unknown>): string;
  collection(name: string): {
    getFullList<T>(options?: ListOptions): Promise<T[]>;
    getFirstListItem<T>(filter: string, options?: ListOptions): Promise<T>;
  };
}

type SourceLoaders = Record<TeacherAttentionSourceId, () => Promise<TeacherAttentionInput[keyof TeacherAttentionInput]>>;

export async function loadTeacherAttentionData(pb: TeacherDataClient, cohorts: Cohort[], now = new Date()): Promise<TeacherAttentionData> {
  if (!cohorts.length) return emptyAttentionData();
  const cohortIds = cohorts.map(cohort => cohort.id);
  const cohortById = new Map(cohorts.map(cohort => [cohort.id, cohort]));
  const scope = (field: string) => relationScope(pb, field, cohortIds);

  const loaders: SourceLoaders = {
    inquiries: async () => {
      const rows = await pb.collection("inquiries").getFullList<Inquiry>({ filter: `status = 'Pendiente' && (${scope("cohort")})`, expand: "author,cohort,week,class,assignment", fields: "id,title,author,cohort,week,class,assignment,created,updated,expand.author.id,expand.author.name,expand.author.email,expand.cohort.id,expand.cohort.name,expand.week.title,expand.class.title,expand.assignment.title", sort: "updated" });
      return rows.filter(row => cohortById.has(row.cohort)).map(row => ({ id: row.id, cohortId: row.cohort, cohortName: cohortById.get(row.cohort)?.name || row.expand?.cohort?.name || "Cohorte", title: row.title, authorId: row.author, authorName: personLabel(row.expand?.author), contextLabel: row.expand?.assignment?.title || row.expand?.class?.title || row.expand?.week?.title || "Consulta general", updated: row.updated || row.created }));
    },
    deliveries: async () => {
      const [enrollments, weeks, sprints, assignments, deliveries] = await Promise.all([
        pb.collection("cohort_enrollments").getFullList<CohortEnrollment>({ filter: `status = 'active' && (${scope("cohort")})`, expand: "user", fields: "id,user,cohort,status,expand.user.id,expand.user.name,expand.user.email" }),
        pb.collection("weeks").getFullList<Week>({ filter: scope("cohort"), fields: "id,cohort,number,title,endDate" }),
        pb.collection("sprints").getFullList<Sprint>({ filter: scope("cohort"), fields: "id,cohort,title,endDate" }),
        pb.collection("assignments").getFullList<Assignment>({ filter: `(${scope("week.cohort")}) || (${scope("sprint.cohort")})`, fields: "id,title,week,sprint" }),
        pb.collection("deliveries").getFullList<Delivery>({ filter: `(${scope("assignment.week.cohort")}) || (${scope("assignment.sprint.cohort")})`, fields: "id,assignment,student,repositoryUrl,created" }),
      ]);
      const periods = [...weeks, ...sprints];
      const studentById = new Map(enrollments.map(row => [row.user, row.expand?.user]));
      const assignmentById = new Map(assignments.map(row => [row.id, row]));
      const periodById = new Map(periods.map(row => [row.id, row]));
      const results: NonNullable<TeacherAttentionInput["deliveryRisks"]> = [];
      for (const cohort of cohorts) {
        const cohortEnrollments = enrollments.filter(row => row.cohort === cohort.id);
        const projection = projectTeacherDeliveryStates({ students: cohortEnrollments.map(row => ({ id: row.user })), assignments, deliveries, periods, cohortId: cohort.id, now });
        for (const pair of projection.pairs) {
          if (pair.state !== "overdue" && pair.state !== "due-soon") continue;
          const assignment = assignmentById.get(pair.assignmentId); const period = periodById.get(pair.periodId); const student = studentById.get(pair.studentId);
          if (!assignment || !period || !pair.dueDate) continue;
          results.push({ id: pair.key, cohortId: cohort.id, cohortName: cohort.name, studentId: pair.studentId, studentName: personLabel(student), assignmentId: assignment.id, assignmentTitle: assignment.title, periodId: period.id, periodLabel: "number" in period ? `Semana ${period.number}` : period.title, state: pair.state, dueDate: pair.dueDate });
        }
      }
      return results;
    },
    followUps: async () => {
      const rows = await pb.collection("student_surveys").getFullList<StudentSurvey>({ filter: `futurePlan = 'contact_teacher' && (${scope("sprint.cohort")})`, expand: "student,sprint", fields: "id,student,sprint,created,expand.student.id,expand.student.name,expand.student.email,expand.sprint.id,expand.sprint.title,expand.sprint.cohort", sort: "created" });
      return rows.map(row => ({ id: row.id, cohortId: row.expand?.sprint?.cohort || "", cohortName: cohortById.get(row.expand?.sprint?.cohort || "")?.name || "Cohorte", studentId: row.student, studentName: personLabel(row.expand?.student), periodId: row.sprint, periodLabel: row.expand?.sprint?.title || "Sprint", created: row.created })).filter(row => cohortById.has(row.cohortId));
    },
    reviews: async () => {
      const upcoming = pb.filter("startTime >= {:now}", { now: now.toISOString() });
      const rows = await pb.collection("reviews").getFullList<Review>({ filter: `status = 'pending' && student != '' && ${upcoming} && (${scope("sprint.cohort")})`, expand: "student,sprint", fields: "id,student,sprint,startTime,expand.student.id,expand.student.name,expand.student.email,expand.sprint.id,expand.sprint.title,expand.sprint.cohort", sort: "startTime" });
      return rows.map(row => ({ id: row.id, cohortId: row.expand?.sprint?.cohort || "", cohortName: cohortById.get(row.expand?.sprint?.cohort || "")?.name || "Cohorte", studentId: row.student, studentName: personLabel(row.expand?.student), periodId: row.sprint, periodLabel: row.expand?.sprint?.title || "Sprint", startTime: row.startTime })).filter(row => cohortById.has(row.cohortId));
    },
    enrollmentRequests: async () => {
      const rows = await pb.collection("enrollment_requests").getFullList<EnrollmentRequest>({ filter: `status = 'pending' && (${scope("cohort")})`, fields: "id,firstName,lastName,cohort,created", sort: "created" });
      return rows.filter(row => cohortById.has(row.cohort)).map(row => ({ id: row.id, cohortId: row.cohort, cohortName: cohortById.get(row.cohort)?.name || "Cohorte", personName: `${row.firstName} ${row.lastName}`.trim(), created: row.created }));
    },
  };
  return settleAttentionSources(loaders);
}

export async function settleAttentionSources(loaders: SourceLoaders): Promise<TeacherAttentionData> {
  const ids = Object.keys(loaders) as TeacherAttentionSourceId[];
  const settled = await Promise.allSettled(ids.map(id => loaders[id]()));
  const input: TeacherAttentionInput = {}; const sources = {} as Record<TeacherAttentionSourceId, TeacherSourceResult>;
  settled.forEach((result, index) => {
    const id = ids[index];
    if (result.status === "fulfilled") { (input as Record<string, unknown>)[id === "deliveries" ? "deliveryRisks" : id] = result.value; sources[id] = { available: true, count: result.value?.length ?? 0 }; }
    else sources[id] = { available: false, count: 0, message: "No pudimos cargar esta fuente. Reintentá actualizando la página." };
  });
  const items = projectTeacherAttention(input);
  return { items, sources, allClear: items.length === 0 && Object.values(sources).every(source => source.available) };
}

export class TeacherStudentOverviewNotFoundError extends Error {}
export interface TeacherStudentOverviewData {
  enrollment: CohortEnrollment;
  student: User;
  periods: Array<Week | Sprint>;
  assignments: Assignment[];
  sources: {
    deliveries: SettledData<Delivery[]>;
    inquiries: SettledData<Inquiry[]>;
    assessments: SettledData<JavascriptAssessmentResult[]>;
    reviews: SettledData<Review[]>;
    followUps: SettledData<StudentSurvey[]>;
  };
}
export type SettledData<T> = { available: true; data: T } | { available: false; data: T; message: string };

export async function loadTeacherStudentOverview(pb: TeacherDataClient, cohort: Cohort, studentId: string): Promise<TeacherStudentOverviewData> {
  const enrollment = await pb.collection("cohort_enrollments").getFirstListItem<CohortEnrollment>(pb.filter("cohort = {:cohort} && user = {:student}", { cohort: cohort.id, student: studentId }), { expand: "user", fields: "id,user,cohort,status,entryType,enrolledAt,completedAt,expand.user.*" }).catch(() => null);
  if (!enrollment?.expand?.user || enrollment.cohort !== cohort.id || enrollment.user !== studentId) throw new TeacherStudentOverviewNotFoundError("El estudiante no pertenece a esta cohorte.");
  const periodCollection = cohort.mode === "weekly" ? "weeks" : "sprints";
  const periods = await pb.collection(periodCollection).getFullList<Week | Sprint>({ filter: pb.filter("cohort = {:cohort}", { cohort: cohort.id }), sort: cohort.mode === "weekly" ? "number" : "startDate,created" });
  const periodIds = new Set(periods.map(period => period.id));
  const assignments = (await pb.collection("assignments").getFullList<Assignment>({ filter: pb.filter(`${cohort.mode === "weekly" ? "week" : "sprint"}.cohort = {:cohort}`, { cohort: cohort.id }), fields: "id,title,week,sprint" })).filter(assignment => periodIds.has((assignment.week || assignment.sprint) ?? ""));
  const assignmentIds = new Set(assignments.map(assignment => assignment.id));
  const loaders = {
    deliveries: () => pb.collection("deliveries").getFullList<Delivery>({ filter: pb.filter(`student = {:student} && assignment.${cohort.mode === "weekly" ? "week" : "sprint"}.cohort = {:cohort}`, { student: studentId, cohort: cohort.id }), fields: "id,assignment,student,repositoryUrl,created,updated" }).then(rows => rows.filter(row => row.student === studentId && assignmentIds.has(row.assignment))),
    inquiries: () => pb.collection("inquiries").getFullList<Inquiry>({ filter: pb.filter("cohort = {:cohort} && author = {:student}", { cohort: cohort.id, student: studentId }), expand: "week,class,assignment", sort: "-updated" }).then(rows => rows.filter(row => row.cohort === cohort.id && row.author === studentId)),
    assessments: () => pb.collection("javascript_assessment_results").getFullList<JavascriptAssessmentResult>({ filter: pb.filter("cohort = {:cohort} && student = {:student}", { cohort: cohort.id, student: studentId }), sort: "-completedAt" }).then(rows => rows.filter(row => row.cohort === cohort.id && row.student === studentId)),
    reviews: () => pb.collection("reviews").getFullList<Review>({ filter: pb.filter("sprint.cohort = {:cohort} && student = {:student}", { cohort: cohort.id, student: studentId }), expand: "sprint", sort: "-startTime" }).then(rows => rows.filter(row => row.student === studentId && row.expand?.sprint?.cohort === cohort.id)),
    followUps: () => pb.collection("student_surveys").getFullList<StudentSurvey>({ filter: pb.filter("sprint.cohort = {:cohort} && student = {:student} && futurePlan = 'contact_teacher'", { cohort: cohort.id, student: studentId }), expand: "sprint", sort: "-created" }).then(rows => rows.filter(row => row.student === studentId && row.expand?.sprint?.cohort === cohort.id && row.futurePlan === "contact_teacher")),
  };
  const ids = Object.keys(loaders) as Array<keyof typeof loaders>;
  const settled = await Promise.allSettled(ids.map(id => loaders[id]()));
  const sources = {} as TeacherStudentOverviewData["sources"];
  settled.forEach((result, index) => { const id = ids[index]; (sources as Record<string, SettledData<unknown[]>>)[id] = result.status === "fulfilled" ? { available: true, data: result.value } : { available: false, data: [], message: "No pudimos cargar esta información." }; });
  return { enrollment, student: enrollment.expand.user, periods, assignments, sources };
}

function relationScope(pb: TeacherDataClient, field: string, ids: string[]) {
  const values: Record<string, string> = {}; const clauses = ids.map((id, index) => { const key = `cohort${index}`; values[key] = id; return `${field} = {:${key}}`; });
  return pb.filter(clauses.join(" || "), values);
}

function personLabel(user?: Pick<User, "name" | "email">) { return user?.name || user?.email || "Estudiante"; }
function emptyAttentionData(): TeacherAttentionData {
  const empty = { available: true, count: 0 }; return { items: [], allClear: true, sources: { inquiries: { ...empty }, deliveries: { ...empty }, followUps: { ...empty }, reviews: { ...empty }, enrollmentRequests: { ...empty } } };
}
