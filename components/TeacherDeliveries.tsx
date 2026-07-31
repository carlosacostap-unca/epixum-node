"use client";

import { useMemo, useState } from "react";
import type { Delivery, User } from "@/types";
import { Badge, Card, CardContent, EmptyState, Input, Select } from "@/components/ui";

type DeliveryFilter = "all" | "submitted" | "missing";

interface TeacherDeliveriesProps {
  deliveries: Delivery[];
  students: User[];
  assignmentId: string;
}

export default function TeacherDeliveries({ deliveries, students, assignmentId }: TeacherDeliveriesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<DeliveryFilter>("all");

  const rows = useMemo(() => {
    const byStudent = new Map(deliveries.map(delivery => [delivery.student, delivery]));
    return students
      .map(student => ({ student, delivery: byStudent.get(student.id) || null }))
      .sort((a, b) => studentName(a.student).localeCompare(studentName(b.student), "es"));
  }, [deliveries, students]);

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("es");
  const filteredRows = rows.filter(({ student, delivery }) => {
    const matchesStatus = status === "all" || (status === "submitted" ? Boolean(delivery) : !delivery);
    const identity = `${studentName(student)} ${student.email || ""}`.toLocaleLowerCase("es");
    return matchesStatus && (!normalizedSearch || identity.includes(normalizedSearch));
  });

  const submitted = rows.filter(row => row.delivery).length;
  const missing = rows.length - submitted;
  const coverage = rows.length ? Math.round((submitted / rows.length) * 100) : 0;

  return (
    <section id={`assignment-${assignmentId}-deliveries`} aria-labelledby="staff-deliveries-heading" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">Seguimiento docente</p>
          <h2 id="staff-deliveries-heading" className="mt-1 text-2xl font-bold">Entregas de la cohorte</h2>
          <p className="mt-2 text-sm text-muted">Identificá quiénes entregaron y quiénes necesitan seguimiento.</p>
        </div>
        <p className="text-sm text-muted" role="status" aria-live="polite">
          {filteredRows.length} de {rows.length} estudiante{rows.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Resumen de entregas">
        <Metric label="Estudiantes" value={rows.length} help="matriculados" />
        <Metric label="Entregadas" value={submitted} help="con repositorio" variant="success" />
        <Metric label="Faltantes" value={missing} help="requieren seguimiento" variant={missing ? "warning" : "neutral"} />
        <Metric label="Cobertura" value={`${coverage}%`} help={`${submitted} de ${rows.length}`} variant="info" />
      </div>

      <Card>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
            <Input
              id="delivery-student-search"
              type="search"
              label="Buscar estudiante"
              placeholder="Nombre o correo"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
            />
            <Select id="delivery-status-filter" label="Estado de entrega" value={status} onChange={event => setStatus(event.target.value as DeliveryFilter)}>
              <option value="all">Todos los estados</option>
              <option value="submitted">Entregada</option>
              <option value="missing">Pendiente</option>
            </Select>
          </div>

          {!rows.length ? (
            <EmptyState title="No hay estudiantes matriculados" description="Cuando la cohorte tenga estudiantes, aparecerá aquí el seguimiento de sus entregas." />
          ) : !filteredRows.length ? (
            <EmptyState title="No encontramos coincidencias" description="Probá con otra búsqueda o cambiá el estado de entrega seleccionado." />
          ) : (
            <>
              <ul className="grid gap-3 md:hidden" aria-label="Entregas en formato móvil">
                {filteredRows.map(({ student, delivery }) => (
                  <li key={student.id} className="rounded-md border bg-surface p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary" aria-hidden="true">{initials(student)}</span>
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">{studentName(student)}</h3>
                          <p className="truncate text-xs text-muted">{student.email || "Correo no informado"}</p>
                        </div>
                      </div>
                      <Badge variant={delivery ? "success" : "warning"}>{delivery ? "Entregada" : "Pendiente"}</Badge>
                    </div>
                    <dl className="mt-4 grid gap-3 border-t pt-4 text-sm">
                      <div className="flex items-start justify-between gap-4"><dt className="font-semibold text-muted">Repositorio</dt><dd className="min-w-0 truncate text-right">{delivery ? displayHost(delivery.repositoryUrl) : "Sin repositorio"}</dd></div>
                      <div className="flex items-start justify-between gap-4"><dt className="font-semibold text-muted">Fecha</dt><dd>{delivery ? formatDate(delivery.created) : "—"}</dd></div>
                    </dl>
                    {delivery ? <a href={delivery.repositoryUrl} target="_blank" rel="noopener noreferrer" className="mt-4 flex min-h-11 w-full items-center justify-center rounded-md border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-muted">Abrir entrega<span className="sr-only"> de {studentName(student)}, abre en una pestaña nueva</span></a> : <p className="mt-4 rounded-md bg-warning-soft px-3 py-2 text-center text-sm font-medium text-warning">Entrega pendiente</p>}
                  </li>
                ))}
              </ul>

              <div className="hidden overflow-x-auto rounded-md border md:block">
              <table className="min-w-full divide-y divide-border text-sm">
                <caption className="sr-only">Estado de entrega de cada estudiante de la cohorte</caption>
                <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Estudiante</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Estado</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Repositorio</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Fecha</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Acceso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {filteredRows.map(({ student, delivery }) => (
                    <tr key={student.id}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary" aria-hidden="true">{initials(student)}</span>
                          <span className="min-w-0">
                            <span className="block font-semibold">{studentName(student)}</span>
                            <span className="block max-w-64 truncate text-xs text-muted">{student.email || "Correo no informado"}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4"><Badge variant={delivery ? "success" : "warning"}>{delivery ? "Entregada" : "Pendiente"}</Badge></td>
                      <td className="max-w-64 px-4 py-4 text-muted">{delivery ? displayHost(delivery.repositoryUrl) : "Sin repositorio"}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-muted">{delivery ? formatDate(delivery.created) : "—"}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        {delivery ? <a href={delivery.repositoryUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline-offset-4 hover:underline">Abrir entrega<span className="sr-only"> de {studentName(student)}, abre en una pestaña nueva</span></a> : <span className="text-muted">Sin acceso</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function Metric({ label, value, help, variant = "neutral" }: { label: string; value: number | string; help: string; variant?: "neutral" | "success" | "warning" | "info" }) {
  return <Card><CardContent className="p-4"><Badge variant={variant}>{label}</Badge><p className="mt-3 text-3xl font-bold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted">{help}</p></CardContent></Card>;
}

function studentName(student: User) { return student.name || [student.firstName, student.lastName].filter(Boolean).join(" ") || student.email || "Estudiante sin nombre"; }
function initials(student: User) { return studentName(student).split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "?"; }
function displayHost(url: string) { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } }
function formatDate(value: string) { return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(value)); }
