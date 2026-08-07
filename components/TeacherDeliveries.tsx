"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Delivery, User } from "@/types";
import { Badge, Card, CardContent, EmptyState, Input, Select } from "@/components/ui";
import { projectTeacherDeliveryStates, type TeacherDeliveryState } from "@/lib/teacher/delivery-state";
import { teacherStudentHref } from "@/lib/teacher/routes";

type DeliveryFilter = "all" | TeacherDeliveryState;

interface TeacherDeliveriesProps {
  deliveries: Delivery[];
  students: User[];
  assignmentId: string;
  cohortId?: string;
  periodId?: string;
  periodEndDate?: string;
  focusStudentId?: string;
}

export default function TeacherDeliveries({ deliveries, students, assignmentId, cohortId = "", periodId = "period", periodEndDate, focusStudentId }: TeacherDeliveriesProps) {
  const focusedName = students.find(student => student.id === focusStudentId);
  const [searchTerm, setSearchTerm] = useState(focusedName ? studentName(focusedName) : "");
  const [status, setStatus] = useState<DeliveryFilter>("all");
  const projection = useMemo(() => projectTeacherDeliveryStates({ students, assignments: [{ id: assignmentId, week: periodId }], deliveries, periods: [{ id: periodId, cohort: cohortId || undefined, endDate: periodEndDate }], cohortId: cohortId || undefined }), [assignmentId, cohortId, deliveries, periodEndDate, periodId, students]);
  const studentById = useMemo(() => new Map(students.map(student => [student.id, student])), [students]);
  const rows = projection.pairs.map(pair => ({ student: studentById.get(pair.studentId)!, pair })).filter(row => Boolean(row.student)).sort((a, b) => studentName(a.student).localeCompare(studentName(b.student), "es"));
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("es");
  const filteredRows = rows.filter(({ student, pair }) => (status === "all" || pair.state === status) && (!normalizedSearch || `${studentName(student)} ${student.email || ""}`.toLocaleLowerCase("es").includes(normalizedSearch)));
  const coverage = rows.length ? Math.round((projection.counts.submitted / rows.length) * 100) : 0;

  return <section id={`assignment-${assignmentId}-deliveries`} aria-labelledby="staff-deliveries-heading" className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-primary">Seguimiento docente</p><h2 id="staff-deliveries-heading" className="mt-1 text-2xl font-bold">Entregas de la cohorte</h2><p className="mt-2 text-sm text-muted">{periodEndDate ? `El período finaliza el ${formatDueDate(periodEndDate)}.` : "Este trabajo no tiene una fecha de cierre configurada; las faltantes se muestran como pendientes."}</p></div><p className="text-sm text-muted" role="status" aria-live="polite">{filteredRows.length} de {rows.length} estudiante{rows.length === 1 ? "" : "s"}</p></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6" aria-label="Resumen de entregas">
      <Metric label="Estudiantes" value={rows.length} help="matriculados" />
      <Metric label="Entregadas" value={projection.counts.submitted} help={`${coverage}% de cobertura`} variant="success" />
      <Metric label="Vencidas" value={projection.counts.overdue} help="requieren atención" variant={projection.counts.overdue ? "danger" : "neutral"} />
      <Metric label="Vencen pronto" value={projection.counts["due-soon"]} help="próximos 7 días" variant={projection.counts["due-soon"] ? "warning" : "neutral"} />
      <Metric label="Pendientes" value={projection.counts.pending} help={projection.counts.unscheduled ? `${projection.counts.unscheduled} sin fecha` : "en término"} variant={projection.counts.pending ? "warning" : "neutral"} />
      <Metric label="Cobertura" value={`${coverage}%`} help={`${projection.counts.submitted} de ${rows.length}`} variant="info" />
    </div>
    <Card><CardContent className="space-y-5 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]"><Input id="delivery-student-search" type="search" label="Buscar estudiante" placeholder="Nombre o correo" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} /><Select id="delivery-status-filter" label="Estado de entrega" value={status} onChange={event => setStatus(event.target.value as DeliveryFilter)}><option value="all">Todos los estados</option><option value="submitted">Entregada</option><option value="overdue">Vencida</option><option value="due-soon">Vence pronto</option><option value="pending">Pendiente</option></Select></div>
      {!rows.length ? <EmptyState title="No hay estudiantes matriculados" description="Cuando la cohorte tenga estudiantes, aparecerá aquí el seguimiento de sus entregas." /> : !filteredRows.length ? <EmptyState title="No encontramos coincidencias" description="Probá con otra búsqueda o cambiá el estado de entrega seleccionado." /> : <>
        <ul className="grid gap-3 md:hidden" aria-label="Entregas en formato móvil">{filteredRows.map(row => <li key={row.student.id} className={`rounded-md border bg-surface p-4 ${row.student.id === focusStudentId ? "border-primary" : ""}`}><DeliveryIdentity {...row} /><dl className="mt-4 grid gap-3 border-t pt-4 text-sm"><div className="flex items-start justify-between gap-4"><dt className="font-semibold text-muted">Repositorio</dt><dd className="min-w-0 truncate text-right">{row.pair.delivery?.repositoryUrl ? displayHost(row.pair.delivery.repositoryUrl) : "Sin repositorio"}</dd></div><div className="flex items-start justify-between gap-4"><dt className="font-semibold text-muted">Fecha</dt><dd>{row.pair.delivery?.created ? formatDate(row.pair.delivery.created) : row.pair.dueDate ? formatDueDate(row.pair.dueDate) : "Sin fecha"}</dd></div></dl><DeliveryAction row={row} cohortId={cohortId} /></li>)}</ul>
        <div className="hidden overflow-x-auto rounded-md border md:block"><table className="min-w-full divide-y divide-border text-sm"><caption className="sr-only">Estado de entrega de cada estudiante de la cohorte</caption><thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-muted"><tr><th className="px-4 py-3">Estudiante</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Repositorio</th><th className="px-4 py-3">Fecha</th><th className="px-4 py-3 text-right">Acceso</th></tr></thead><tbody className="divide-y divide-border bg-surface">{filteredRows.map(row => <tr key={row.student.id} className={row.student.id === focusStudentId ? "bg-primary-soft" : undefined}><td className="px-4 py-4"><Identity student={row.student} /></td><td className="px-4 py-4"><StateBadge state={row.pair.state} /></td><td className="max-w-64 px-4 py-4 text-muted">{row.pair.delivery?.repositoryUrl ? displayHost(row.pair.delivery.repositoryUrl) : "Sin repositorio"}</td><td className="whitespace-nowrap px-4 py-4 text-muted">{row.pair.delivery?.created ? formatDate(row.pair.delivery.created) : row.pair.dueDate ? formatDueDate(row.pair.dueDate) : "Sin fecha"}</td><td className="whitespace-nowrap px-4 py-4 text-right"><DeliveryAction row={row} cohortId={cohortId} compact /></td></tr>)}</tbody></table></div>
      </>}
    </CardContent></Card>
  </section>;
}

type Row = { student: User; pair: ReturnType<typeof projectTeacherDeliveryStates>["pairs"][number] };
function DeliveryIdentity({ student, pair }: Row) { return <div className="flex items-start justify-between gap-3"><Identity student={student} /><StateBadge state={pair.state} /></div>; }
function Identity({ student }: { student: User }) { return <div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">{initials(student)}</span><span className="min-w-0"><span className="block font-semibold">{studentName(student)}</span><span className="block max-w-64 truncate text-xs text-muted">{student.email || "Correo no informado"}</span></span></div>; }
function DeliveryAction({ row, cohortId, compact = false }: { row: Row; cohortId: string; compact?: boolean }) { if (row.pair.delivery?.repositoryUrl) return <a href={row.pair.delivery.repositoryUrl} target="_blank" rel="noopener noreferrer" className={compact ? "font-semibold text-primary hover:underline" : "mt-4 flex min-h-11 w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold text-primary"}>Abrir entrega<span className="sr-only"> de {studentName(row.student)}, abre en una pestaña nueva</span></a>; if (cohortId) return <Link href={teacherStudentHref(cohortId, row.student.id, { signal: `assignment:${row.pair.assignmentId}` })} className={compact ? "font-semibold text-primary hover:underline" : "mt-4 flex min-h-11 w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold text-primary"}>Abrir estudiante</Link>; return <span className="text-muted">Sin entrega</span>; }
function StateBadge({ state }: { state: TeacherDeliveryState }) { const config = state === "submitted" ? ["Entregada", "success"] as const : state === "overdue" ? ["Vencida", "danger"] as const : state === "due-soon" ? ["Vence pronto", "warning"] as const : ["Pendiente", "warning"] as const; return <Badge variant={config[1]}>{config[0]}</Badge>; }
function Metric({ label, value, help, variant = "neutral" }: { label: string; value: number | string; help: string; variant?: "neutral" | "success" | "warning" | "danger" | "info" }) { return <Card><CardContent className="p-4"><Badge variant={variant}>{label}</Badge><p className="mt-3 text-3xl font-bold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted">{help}</p></CardContent></Card>; }
function studentName(student: User) { return student.name || [student.firstName, student.lastName].filter(Boolean).join(" ") || student.email || "Estudiante sin nombre"; }
function initials(student: User) { return studentName(student).split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "?"; }
function displayHost(url: string) { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } }
function formatDate(value: string) { return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(value)); }
function formatDueDate(value: string) { return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`)); }
