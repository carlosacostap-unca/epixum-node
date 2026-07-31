import { requireCohortAccess } from "@/lib/cohorts/access";
import { getStudentTeam, getStudents, getTeams } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Alert } from "@/components/ui/Alert";
import TeamsWorkspace from "@/components/teams/TeamsWorkspace";
import StudentTeamInfo from "@/components/StudentTeamInfo";
import TeamChat from "@/components/TeamChat";

export const dynamic = "force-dynamic";
export default async function CohortTeamsPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = await params;
  const access = await requireCohortAccess(cohortId, { capability: "teams" });
  const staff = access.user.role === "docente" || access.user.role === "admin";
  if (staff) {
    const [teams, students] = await Promise.all([getTeams(cohortId), getStudents(cohortId)]);
    return <div className="space-y-8"><PageHeader eyebrow={access.cohort.name} title="Equipos" description="Consultá la composición actual o reorganizá estudiantes con una confirmación explícita." /><TeamsWorkspace teams={teams} students={students} cohortId={cohortId} /></div>;
  }
  const team = await getStudentTeam(access.user.id, cohortId);
  return <div className="space-y-8"><PageHeader eyebrow={access.cohort.name} title="Mi equipo" description="Tu espacio compartido para conocer al grupo y mantener la conversación." />{team ? <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)]"><StudentTeamInfo team={team} currentUserId={access.user.id} /><TeamChat teamId={team.id} currentUser={access.user} /></div> : <Alert variant="warning" title="Todavía no tenés equipo">Cuando el equipo docente te asigne uno, sus integrantes y el chat aparecerán acá.</Alert>}</div>;
}
