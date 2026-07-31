"use client";
import { useState } from "react";
import type { Team, User } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { Input } from "@/components/ui/FormField";
import { Tabs } from "@/components/ui/Tabs";
import { createCohortTeam } from "@/lib/actions-teams";
import TeamsBoard from "./TeamsBoard";

export default function TeamsWorkspace({ teams, students, cohortId }: { teams: Team[]; students: User[]; cohortId: string }) {
  const [name, setName] = useState(""); const [creating, setCreating] = useState(false); const [error, setError] = useState("");
  const assigned = new Set(teams.flatMap((team) => team.members || [])).size;
  const create = async () => { setCreating(true); setError(""); const result = await createCohortTeam(cohortId, name); setCreating(false); if (!result.success) setError(result.error || "No se pudo crear el equipo."); else setName(""); };
  const summary = <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-3"><Card className="p-5"><p className="text-sm text-muted">Equipos</p><p className="mt-1 text-3xl font-bold">{teams.length}</p></Card><Card className="p-5"><p className="text-sm text-muted">Estudiantes asignados</p><p className="mt-1 text-3xl font-bold">{assigned}</p></Card><Card className="p-5"><p className="text-sm text-muted">Sin asignar</p><p className="mt-1 text-3xl font-bold">{Math.max(0, students.length - assigned)}</p></Card></div>
    {!teams.length ? <EmptyState title="Todavía no hay equipos" description="Creá el primer equipo desde la pestaña Organizar." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{teams.map((team) => <Card className="p-5" key={team.id}><div className="flex items-center justify-between"><h3 className="font-semibold">{team.name}</h3><Badge variant="info">{team.members?.length || 0} integrantes</Badge></div><ul className="mt-4 space-y-2 text-sm">{(team.expand?.members || []).map((member) => <li key={member.id}>{member.name}</li>)}</ul></Card>)}</div>}
  </div>;
  const organize = <div className="space-y-6"><Card className="p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-end"><Input label="Nombre del nuevo equipo" value={name} onChange={(event) => setName(event.target.value)} error={error || undefined} containerClassName="flex-1" /><Button onClick={create} loading={creating} disabled={!name.trim()}>Crear equipo</Button></div></Card><TeamsBoard initialTeams={teams} allStudents={students} cohortId={cohortId} /></div>;
  return <Tabs label="Modos de gestión de equipos" items={[{ id: "summary", label: "Resumen", content: summary }, { id: "organize", label: "Organizar", content: organize }]} />;
}
