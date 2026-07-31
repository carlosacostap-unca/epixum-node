"use client";

import { useState } from "react";
import { EnrollmentControls } from "@/components/cohorts/AdminRecordControls";
import type { EnrollmentEntryType, EnrollmentStatus } from "@/types";

export type EnrollmentListItem = { id: string; name: string; email: string; status: EnrollmentStatus; entryType: EnrollmentEntryType };

const entryTypeLabel = (entryType: EnrollmentEntryType) => entryType === "repeater" ? "Recursante" : "Primera cursada";
const statusLabel = (status: EnrollmentStatus) => status === "active" ? "Activa" : "Desmatriculado";

export default function EnrollmentList({ enrollments }: { enrollments: EnrollmentListItem[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | EnrollmentStatus>("active");
  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  const visible = enrollments.filter((item) => (status === "all" || item.status === status) && (!normalizedQuery || `${item.name} ${item.email}`.toLocaleLowerCase("es").includes(normalizedQuery)));
  const activeCount = enrollments.filter((item) => item.status === "active").length;

  return <section>
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><h2 className="text-xl font-semibold">Alumnos matriculados ({activeCount})</h2><p className="text-sm text-zinc-500">El historial incluye {enrollments.length} registro{enrollments.length === 1 ? "" : "s"}.</p></div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nombre o correo" aria-label="Buscar matrículas" className="rounded-lg border p-2 text-sm dark:bg-zinc-950" />
        <select value={status} onChange={(event) => setStatus(event.target.value as "all" | EnrollmentStatus)} aria-label="Filtrar matrículas por estado" className="rounded-lg border p-2 text-sm dark:bg-zinc-950"><option value="active">Matriculados</option><option value="completed">Desmatriculados</option><option value="all">Todos</option></select>
      </div>
    </div>
    <div className="space-y-2">{visible.length ? visible.map((item) => <div key={item.id} className="rounded-lg border p-4"><div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-medium">{item.name || item.email || "Estudiante"}</p><p className="text-sm text-zinc-500">{item.email} · {statusLabel(item.status)} · {entryTypeLabel(item.entryType)}</p></div><EnrollmentControls id={item.id} status={item.status} /></div></div>) : <p className="rounded-lg border border-dashed p-4 text-sm text-zinc-500">No hay matrículas que coincidan con la búsqueda y el filtro.</p>}</div>
  </section>;
}
