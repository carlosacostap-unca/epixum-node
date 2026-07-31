"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Assignment, Class, Sprint } from "@/types";
import { createInquiry } from "@/lib/actions-inquiries";
import { Alert, Button, Card, CardContent, Input, LinkButton, Select, Textarea } from "@/components/ui";

interface Props { cohortId?: string; weekId?: string; basePath?: string; initialClassId?: string; initialAssignmentId?: string; classes: Class[]; assignments: Assignment[]; sprints: Sprint[] }

export default function CreateInquiryForm({ cohortId, weekId, basePath, initialClassId, initialAssignmentId, classes, assignments, sprints }: Props) {
  const initialSprintId = initialClassId ? classes.find(item => item.id === initialClassId)?.sprint : assignments.find(item => item.id === initialAssignmentId)?.sprint;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sprintId, setSprintId] = useState(initialSprintId || "");
  const [classId, setClassId] = useState(initialClassId || "");
  const [assignmentId, setAssignmentId] = useState(initialAssignmentId || "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const cancelHref = basePath || "/inquiries";
  const filteredClasses = weekId ? classes.filter(item => item.week === weekId) : classes.filter(item => item.sprint === sprintId);
  const filteredAssignments = weekId ? assignments.filter(item => item.week === weekId) : assignments.filter(item => item.sprint === sprintId);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(null);
    if (title.trim().length < 4) return setError("Escribí un título de al menos 4 caracteres.");
    if (description.trim().length < 10) return setError("Contá tu duda con al menos 10 caracteres para que podamos ayudarte.");
    setPending(true);
    const result = await createInquiry({ title, description, cohortId, weekId, classId: classId || undefined, assignmentId: assignmentId || undefined });
    setPending(false);
    if (!result.success) return setError(result.error || "No pudimos crear la consulta.");
    router.push(cohortId ? `/cohorts/${cohortId}/inquiries/${result.data.id}` : `/inquiries/${result.data.id}`);
    router.refresh();
  }

  return <Card><CardContent className="p-6 sm:p-8"><form onSubmit={submit} className="space-y-6">
    {error && <Alert variant="danger" title="Revisá la consulta">{error}</Alert>}
    <div><h2 className="text-lg font-bold">Tu pregunta</h2><p className="mt-1 text-sm text-muted">Un título claro y el contexto correcto ayudan a responder más rápido.</p></div>
    <Input label="Título" value={title} onChange={event => setTitle(event.target.value)} placeholder="Resumen breve de tu duda" required maxLength={140} />
    <Textarea label="Descripción" value={description} onChange={event => setDescription(event.target.value)} placeholder="Explicá qué intentaste, qué esperabas y qué ocurrió." required rows={8} />
    <fieldset className="space-y-4 rounded-md border bg-surface-muted p-4"><legend className="px-1 text-sm font-bold">Contexto académico (opcional)</legend>
      {!weekId && <Select label="Sprint" value={sprintId} onChange={event => { setSprintId(event.target.value); setClassId(""); setAssignmentId(""); }}><option value="">Consulta general</option>{sprints.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</Select>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Clase" value={classId} disabled={Boolean(assignmentId) || (!weekId && !sprintId)} onChange={event => { setClassId(event.target.value); if (event.target.value) setAssignmentId(""); }}><option value="">Ninguna</option>{filteredClasses.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</Select>
        <Select label="Trabajo práctico" value={assignmentId} disabled={Boolean(classId) || (!weekId && !sprintId)} onChange={event => { setAssignmentId(event.target.value); if (event.target.value) setClassId(""); }}><option value="">Ninguno</option>{filteredAssignments.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</Select>
      </div>
    </fieldset>
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><LinkButton href={cancelHref} variant="secondary">Cancelar</LinkButton><Button type="submit" loading={pending}>Publicar consulta</Button></div>
  </form></CardContent></Card>;
}
