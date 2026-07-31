import type { Team } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function StudentTeamInfo({ team, currentUserId }: { team: Team; currentUserId: string }) {
  const members = team.expand?.members || [];
  const baseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL?.replace(/\/$/, "") || "";
  return <section className="min-w-0 space-y-5" aria-labelledby="team-name">
    <Card className="overflow-hidden bg-gradient-to-br from-primary-soft to-surface"><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Tu identidad de equipo</p><CardTitle id="team-name" className="mt-1 text-2xl">{team.name}</CardTitle></div><Badge variant="primary">{members.length} integrantes</Badge></div></CardHeader><CardContent><p className="text-sm text-muted">Este es el espacio privado de coordinación de tu equipo dentro de la cohorte.</p></CardContent></Card>
    <Card><CardHeader><CardTitle>Integrantes</CardTitle></CardHeader><CardContent><ul className="grid gap-3 sm:grid-cols-2">{members.map((member) => { const isMe = member.id === currentUserId; const avatar = member.avatar ? `${baseUrl}/api/files/${member.collectionId}/${member.id}/${member.avatar}` : null; return <li key={member.id} className={`flex min-w-0 items-center gap-3 rounded-lg border p-3 ${isMe ? "border-primary/40 bg-primary-soft" : "bg-surface-muted"}`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface text-sm font-bold">{avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : member.name?.slice(0, 1).toUpperCase()}</div>
      <div className="min-w-0"><p className="truncate font-semibold">{member.name} {isMe && <span className="text-primary">(vos)</span>}</p><p className="truncate text-sm text-muted">{member.email}</p></div>
    </li>; })}</ul></CardContent></Card>
  </section>;
}
