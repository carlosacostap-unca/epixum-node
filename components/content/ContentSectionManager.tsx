"use client";

import { useMemo, useState, useTransition } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ContentSection } from "@/types";
import { Badge, Button, Card, CardContent, EmptyState, Input, LinkButton } from "@/components/ui";
import { createContentSectionAction, duplicateContentSectionAction, reorderContentSectionsAction, setContentSectionStateAction } from "@/lib/content/actions";

const statusLabels = { draft: "Borrador", scheduled: "Programada", published: "Publicada", hidden: "Oculta" } as const;
const statusVariants = { draft: "warning", scheduled: "info", published: "success", hidden: "neutral" } as const;

export default function ContentSectionManager({ cohortId, weekId, sections: initialSections }: { cohortId: string; weekId: string; sections: ContentSection[] }) {
  const [sections, setSections] = useState(initialSections);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const ids = useMemo(() => sections.map((section) => section.id), [sections]);

  const run = (operation: () => Promise<{ success: boolean; error?: string; message?: string }>) => startTransition(async () => {
    setMessage("");
    const result = await operation();
    setMessage(result.success ? result.message ?? "Cambio guardado." : result.error ?? "No se pudo guardar.");
  });

  const create = () => {
    if (!title.trim()) return;
    startTransition(async () => {
      const result = await createContentSectionAction(cohortId, weekId, { title });
      if (!result.success) return setMessage(result.error);
      setTitle("");
      setMessage(result.message ?? "Sección creada.");
      window.location.reload();
    });
  };

  const move = (activeId: string, overId: string) => {
    const from = ids.indexOf(activeId);
    const to = ids.indexOf(overId);
    if (from < 0 || to < 0 || from === to) return;
    const previous = sections;
    const next = arrayMove(sections, from, to).map((section, index) => ({ ...section, position: index + 1 }));
    setSections(next);
    startTransition(async () => {
      const result = await reorderContentSectionsAction(cohortId, weekId, next.map((section) => section.id));
      if (!result.success) setSections(previous);
      setMessage(result.success ? result.message ?? "Orden actualizado." : result.error);
    });
  };

  const dragEnd = ({ active, over }: DragEndEvent) => { if (over) move(String(active.id), String(over.id)); };

  return <div className="space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><h2 id="academic-content-heading" className="text-xl font-bold">Contenidos de la semana</h2><p className="mt-1 text-sm text-muted">Cada sección se publica y se programa de manera independiente.</p></div>
      <div className="flex flex-wrap gap-2"><LinkButton href={`/cohorts/${cohortId}/content-analytics?week=${weekId}`} variant="secondary">Ver trazabilidad</LinkButton><LinkButton href={`/cohorts/${cohortId}/weeks/${weekId}/content/manage`} variant="secondary">Vista de gestión</LinkButton></div>
    </div>
    <Card><CardContent className="flex flex-col gap-3 p-4 sm:flex-row"><Input label="Título de la nueva sección" containerClassName="flex-1" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={500} placeholder="Por ejemplo: Tu primer programa con Node.js" /><Button onClick={create} disabled={pending || !title.trim()} className="sm:self-end">Crear borrador</Button></CardContent></Card>
    {message && <p role="status" className="rounded-md bg-surface-muted px-3 py-2 text-sm">{message}</p>}
    {!sections.length ? <EmptyState title="Todavía no hay contenidos" description="Creá la primera sección para comenzar a construir el recorrido de esta semana." /> :
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}><SortableContext items={ids} strategy={verticalListSortingStrategy}><ol className="space-y-3" aria-label="Secciones ordenables">
        {sections.map((section, index) => <SortableSection key={section.id} section={section} number={index + 1} cohortId={cohortId} weekId={weekId} disabled={pending} onMove={(direction) => { const target = index + direction; if (target >= 0 && target < sections.length) move(section.id, sections[target].id); }} onDuplicate={() => run(() => duplicateContentSectionAction(cohortId, weekId, section.id))} onState={(status, scheduledAt) => run(() => setContentSectionStateAction(cohortId, weekId, section.id, { status, scheduledAt }))} />)}
      </ol></SortableContext></DndContext>}
  </div>;
}

function SortableSection({ section, number, cohortId, weekId, disabled, onMove, onDuplicate, onState }: { section: ContentSection; number: number; cohortId: string; weekId: string; disabled: boolean; onMove: (direction: -1 | 1) => void; onDuplicate: () => void; onState: (status: ContentSection["status"], scheduledAt?: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const [schedule, setSchedule] = useState("");
  return <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={isDragging ? "opacity-60" : undefined}>
    <Card><CardContent className="grid gap-4 p-4 md:grid-cols-[auto_1fr_auto] md:items-center">
      <button type="button" className="min-h-11 min-w-11 cursor-grab rounded-md border bg-surface-muted font-bold" aria-label={`Arrastrar sección ${number}: ${section.title}`} {...attributes} {...listeners}>⋮⋮</button>
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold uppercase tracking-wide text-muted">Sección {number}</span><Badge variant={statusVariants[section.status]}>{statusLabels[section.status]}</Badge></div><h3 className="mt-1 truncate font-bold">{section.title}</h3>{section.scheduledAt && <p className="mt-1 text-xs text-muted">Aparece {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(section.scheduledAt))}</p>}</div>
      <div className="flex flex-wrap gap-2 md:justify-end"><Button variant="ghost" size="sm" onClick={() => onMove(-1)} disabled={disabled || number === 1} aria-label={`Subir ${section.title}`}>↑</Button><Button variant="ghost" size="sm" onClick={() => onMove(1)} disabled={disabled} aria-label={`Bajar ${section.title}`}>↓</Button><LinkButton size="sm" variant="secondary" href={`/cohorts/${cohortId}/weeks/${weekId}/content/${section.id}/edit`}>Editar</LinkButton><Button size="sm" variant="ghost" onClick={onDuplicate} disabled={disabled}>Duplicar</Button>
        {section.status !== "published" && <Button size="sm" onClick={() => onState("published")} disabled={disabled}>Publicar</Button>}{section.status !== "hidden" && <Button size="sm" variant="secondary" onClick={() => onState("hidden")} disabled={disabled}>Ocultar</Button>}{section.status !== "draft" && <Button size="sm" variant="ghost" onClick={() => onState("draft")} disabled={disabled}>Borrador</Button>}
      </div>
      <details className="md:col-start-2 md:col-span-2"><summary className="cursor-pointer text-sm font-semibold text-primary">Programar publicación</summary><div className="mt-2 flex flex-wrap items-end gap-2"><Input label="Fecha y hora" type="datetime-local" value={schedule} onChange={(event) => setSchedule(event.target.value)} /><Button size="sm" variant="secondary" disabled={!schedule || disabled} onClick={() => onState("scheduled", new Date(schedule).toISOString())}>Programar</Button></div></details>
    </CardContent></Card>
  </li>;
}
