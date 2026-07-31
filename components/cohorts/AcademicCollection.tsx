import Link from "next/link";
import { Badge, Card, CardContent, EmptyState } from "@/components/ui";

export type AcademicCollectionItem = {
  id: string;
  position: number;
  label: string;
  title: string;
  description?: string;
  href: string;
  startDate?: string;
  endDate?: string;
  publication: "draft" | "published";
  classCount: number;
  assignmentCount: number;
  completedAssignments?: number;
};

export default function AcademicCollection({ items, staff, emptyTitle, emptyDescription }: { items: AcademicCollectionItem[]; staff: boolean; emptyTitle: string; emptyDescription: string }) {
  if (!items.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return <ol className="relative grid gap-4 before:absolute before:bottom-8 before:left-[1.45rem] before:top-8 before:w-px before:bg-border sm:before:left-[1.7rem]">
    {items.map(item => <AcademicItem key={item.id} item={item} staff={staff} />)}
  </ol>;
}

function AcademicItem({ item, staff }: { item: AcademicCollectionItem; staff: boolean }) {
  const phase = temporalPhase(item.startDate, item.endDate);
  const completed = item.completedAssignments ?? 0;
  const percent = item.assignmentCount ? Math.round((completed / item.assignmentCount) * 100) : 0;
  return <li className="relative grid grid-cols-[3rem_1fr] gap-3 sm:grid-cols-[3.5rem_1fr]">
    <div className="z-10 mt-5 flex size-12 items-center justify-center rounded-full border-4 border-background bg-primary text-sm font-bold text-white sm:size-14" aria-label={`Posición ${item.position}`}>{item.position}</div>
    <Link href={item.href} className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2">
      <Card className="transition group-hover:border-primary group-hover:shadow-md"><CardContent className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={item.publication === "published" ? "success" : "warning"}>{item.publication === "published" ? "Publicado" : "Borrador"}</Badge>
          <Badge variant={phase === "current" ? "info" : "neutral"}>{phaseLabel(phase)}</Badge>
          <span className="ml-auto text-xs font-semibold text-muted">{item.label}</span>
        </div>
        <h2 className="mt-4 text-xl font-bold group-hover:text-primary">{item.title}</h2>
        {item.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{item.description}</p>}
        <p className="mt-3 text-sm text-muted">{dateRange(item.startDate, item.endDate)}</p>
        <div className="mt-5 border-t pt-4">
          {staff ? <dl className="grid grid-cols-2 gap-4"><Count label="Clases" value={item.classCount} /><Count label="Trabajos" value={item.assignmentCount} /></dl> : <div>
            <div className="flex items-center justify-between gap-4 text-sm"><span className="font-medium">Progreso de entregas</span><span className="text-muted">{completed} de {item.assignmentCount}</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-label={`Progreso de ${item.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><div className="h-full rounded-full bg-success" style={{ width: `${percent}%` }} /></div>
          </div>}
        </div>
      </CardContent></Card>
    </Link>
  </li>;
}

function Count({ label, value }: { label: string; value: number }) { return <div><dt className="text-xs text-muted">{label}</dt><dd className="mt-1 text-xl font-bold">{value}</dd></div>; }

function temporalPhase(start?: string, end?: string): "completed" | "current" | "upcoming" | "unscheduled" {
  const now = Date.now(); const startTime = start ? new Date(start).getTime() : Number.NaN; const endTime = end ? new Date(end).getTime() : Number.NaN;
  if (Number.isFinite(endTime) && endTime < now) return "completed";
  if (Number.isFinite(startTime) && startTime > now) return "upcoming";
  if (Number.isFinite(startTime) || Number.isFinite(endTime)) return "current";
  return "unscheduled";
}
function phaseLabel(phase: ReturnType<typeof temporalPhase>) { return { completed: "Finalizado", current: "En curso", upcoming: "Próximo", unscheduled: "Sin fecha" }[phase]; }
function dateRange(start?: string, end?: string) {
  const format = (value?: string) => value ? new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(value)) : null;
  const from = format(start); const to = format(end);
  if (from && to) return `${from} — ${to}`; if (from) return `Desde el ${from}`; if (to) return `Hasta el ${to}`; return "Fechas a confirmar";
}
