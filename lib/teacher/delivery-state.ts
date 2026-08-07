export type TeacherDeliveryState = "submitted" | "overdue" | "due-soon" | "pending";

export interface DeliveryProjectionStudent { id: string }
export interface DeliveryProjectionAssignment { id: string; week?: string; sprint?: string }
export interface DeliveryProjectionPeriod { id: string; cohort?: string; endDate?: string }
export interface DeliveryProjectionRecord { id: string; assignment: string; student: string; repositoryUrl?: string; created?: string }

export interface TeacherDeliveryPair {
  key: string;
  studentId: string;
  assignmentId: string;
  periodId: string;
  state: TeacherDeliveryState;
  scheduled: boolean;
  dueDate?: string;
  delivery?: DeliveryProjectionRecord;
}

export interface TeacherDeliveryProjection {
  pairs: TeacherDeliveryPair[];
  counts: Record<TeacherDeliveryState, number> & { total: number; unscheduled: number };
}

export function projectTeacherDeliveryStates(input: {
  students: DeliveryProjectionStudent[];
  assignments: DeliveryProjectionAssignment[];
  deliveries: DeliveryProjectionRecord[];
  periods: DeliveryProjectionPeriod[];
  cohortId?: string;
  periodIds?: string[];
  now?: Date;
}): TeacherDeliveryProjection {
  const now = input.now ?? new Date();
  const today = academicDateKey(now);
  const selected = input.periodIds ? new Set(input.periodIds) : null;
  const periods = new Map(input.periods.filter(period => (!input.cohortId || period.cohort === input.cohortId) && (!selected || selected.has(period.id))).map(period => [period.id, period]));
  const deliveries = new Map<string, DeliveryProjectionRecord>();
  for (const delivery of input.deliveries) {
    const key = pairKey(delivery.student, delivery.assignment);
    if (!deliveries.has(key)) deliveries.set(key, delivery);
  }

  const pairs: TeacherDeliveryPair[] = [];
  for (const assignment of input.assignments) {
    const periodId = assignment.week || assignment.sprint;
    if (!periodId) continue;
    const period = periods.get(periodId);
    if (!period) continue;
    for (const student of input.students) {
      const key = pairKey(student.id, assignment.id);
      const delivery = deliveries.get(key);
      const dueDate = normalizedDateKey(period.endDate);
      pairs.push({
        key,
        studentId: student.id,
        assignmentId: assignment.id,
        periodId,
        delivery,
        dueDate,
        scheduled: Boolean(dueDate),
        state: delivery ? "submitted" : missingState(today, dueDate),
      });
    }
  }

  return {
    pairs,
    counts: {
      total: pairs.length,
      submitted: pairs.filter(pair => pair.state === "submitted").length,
      overdue: pairs.filter(pair => pair.state === "overdue").length,
      "due-soon": pairs.filter(pair => pair.state === "due-soon").length,
      pending: pairs.filter(pair => pair.state === "pending").length,
      unscheduled: pairs.filter(pair => !pair.scheduled && pair.state !== "submitted").length,
    },
  };
}

export function pairKey(studentId: string, assignmentId: string) { return `${studentId}:${assignmentId}`; }

function missingState(today: string, dueDate?: string): Exclude<TeacherDeliveryState, "submitted"> {
  if (!dueDate) return "pending";
  const days = dateDifference(today, dueDate);
  if (days < 0) return "overdue";
  if (days <= 7) return "due-soon";
  return "pending";
}

function academicDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function normalizedDateKey(value?: string) {
  const key = value?.slice(0, 10);
  return key && /^\d{4}-\d{2}-\d{2}$/.test(key) ? key : undefined;
}

function dateDifference(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

