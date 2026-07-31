"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { User } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { StudentItem } from "./StudentItem";

export function TeamColumn({ id, name, members, students, isUnassigned = false, teamOptions, onMove }: { id: string; name: string; members: string[]; students: Record<string, User>; isUnassigned?: boolean; teamOptions?: Array<{ id: string; name: string }>; onMove?: (studentId: string, teamId: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return <Card className={`p-5 ${isOver ? "ring-2 ring-primary" : ""}`}>
    <div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-semibold">{name}</h3><Badge variant={isUnassigned ? "neutral" : "info"}>{members.length}</Badge></div>
    <div ref={setNodeRef} className="min-h-32 space-y-2 rounded-lg" aria-label={`Integrantes de ${name}`}>
      <SortableContext items={members} strategy={verticalListSortingStrategy}>
        {members.map((memberId) => students[memberId] ? <StudentItem key={memberId} student={students[memberId]} teamId={id} teamOptions={teamOptions} onMove={(teamId) => onMove?.(memberId, teamId)} /> : null)}
      </SortableContext>
      {!members.length && <p className="flex min-h-28 items-center justify-center rounded-lg border border-dashed p-4 text-center text-sm text-muted">Arrastrá estudiantes aquí</p>}
    </div>
  </Card>;
}
