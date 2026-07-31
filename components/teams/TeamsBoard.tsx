"use client";

import { useEffect, useMemo, useState } from "react";
import { DndContext, DragOverlay, PointerSensor, KeyboardSensor, closestCorners, useSensor, useSensors, type DragStartEvent, type DragOverEvent } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { Team, User } from "@/types";
import { TeamColumn } from "./TeamColumn";
import { StudentItem } from "./StudentItem";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { saveTeamOrganization } from "@/lib/actions-teams";

interface TeamsBoardProps { initialTeams: Team[]; allStudents: User[]; cohortId: string }

function buildItems(teams: Team[], students: User[]) {
  const result: Record<string, string[]> = {};
  const assigned = new Set<string>();
  for (const team of teams) { result[team.id] = [...(team.members || [])]; team.members?.forEach((id) => assigned.add(id)); }
  result.unassigned = students.filter((student) => !assigned.has(student.id)).map((student) => student.id);
  return result;
}

export default function TeamsBoard({ initialTeams, allStudents, cohortId }: TeamsBoardProps) {
  const baseline = useMemo(() => buildItems(initialTeams, allStudents), [initialTeams, allStudents]);
  const [items, setItems] = useState(baseline);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const dirty = JSON.stringify(items) !== JSON.stringify(baseline);
  const students = useMemo(() => Object.fromEntries(allStudents.map((student) => [student.id, student])), [allStudents]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const findContainer = (id: string) => id in items ? id : Object.keys(items).find((key) => items[key].includes(id));
  const teamOptions = [{ id: "unassigned", name: "Sin asignar" }, ...initialTeams.map((team) => ({ id: team.id, name: team.name }))];
  const move = (studentId: string, to: string) => { const from = findContainer(studentId); if (!from || from === to) return; setFeedback(null); setItems((current) => ({ ...current, [from]: current[from].filter((id) => id !== studentId), [to]: [...current[to], studentId] })); };
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || active.id === over.id) return;
    const from = findContainer(String(active.id));
    const to = findContainer(String(over.id));
    if (!from || !to || from === to) return;
    setFeedback(null);
    setItems((current) => {
      const target = current[to];
      const targetIndex = String(over.id) in current ? target.length : Math.max(0, target.indexOf(String(over.id)));
      return { ...current, [from]: current[from].filter((id) => id !== active.id), [to]: [...target.slice(0, targetIndex), String(active.id), ...target.slice(targetIndex)] };
    });
  };
  const save = async () => {
    setSaving(true); setFeedback(null);
    const result = await saveTeamOrganization(cohortId, items);
    setSaving(false);
    setFeedback(result.success ? { tone: "success", text: result.message || "Organización guardada." } : { tone: "danger", text: result.error || "No se pudo guardar." });
  };

  return <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={({ active }: DragStartEvent) => setActiveId(String(active.id))} onDragOver={onDragOver} onDragEnd={() => setActiveId(null)} onDragCancel={() => setActiveId(null)}>
    <div className="space-y-5">
      <div className="sticky top-2 z-20 flex flex-col gap-3 rounded-xl border bg-surface/95 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div><p className="font-semibold">Organización de estudiantes</p><p className="text-sm text-muted">Arrastrá cada persona al equipo correspondiente y guardá al terminar.</p></div>
        <div className="flex gap-2"><Button variant="secondary" disabled={!dirty || saving} onClick={() => { setItems(baseline); setFeedback(null); }}>Descartar</Button><Button disabled={!dirty} loading={saving} onClick={save}>Guardar cambios</Button></div>
      </div>
      {dirty && <Alert variant="warning" title="Hay cambios sin guardar">Podés revisar toda la distribución antes de confirmarla.</Alert>}
      {feedback && <Alert variant={feedback.tone}>{feedback.text}</Alert>}
      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
        <TeamColumn id="unassigned" name="Sin asignar" members={items.unassigned || []} students={students} isUnassigned teamOptions={teamOptions} onMove={move} />
        {initialTeams.map((team) => <TeamColumn key={team.id} id={team.id} name={team.name} members={items[team.id] || []} students={students} teamOptions={teamOptions} onMove={move} />)}
      </div>
    </div>
    <DragOverlay>{activeId && students[activeId] ? <StudentItem student={students[activeId]} /> : null}</DragOverlay>
  </DndContext>;
}
