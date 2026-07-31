import Link from "next/link";
import type { ReactNode } from "react";
import { Badge, Card, CardContent, EmptyState, PageHeader } from "@/components/ui";
import InquiryList from "@/components/inquiries/InquiryList";
import type { Assignment, Class, Inquiry, User } from "@/types";
import { cn } from "@/lib/cn";

export type AcademicDetailSection = "overview" | "classes" | "assignments" | "inquiries";

interface AcademicDetailProps {
  cohortId: string;
  containerId: string;
  cohortName: string;
  kind: "week" | "sprint";
  positionLabel: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  publication?: "draft" | "published";
  classes: Class[];
  assignments: Assignment[];
  inquiries: Inquiry[];
  currentUser: User;
  activeSection: AcademicDetailSection;
  weekId?: string;
  actions?: ReactNode;
  management?: ReactNode;
}

export default function AcademicDetail(props: AcademicDetailProps) {
  const { cohortId, containerId, cohortName, kind, positionLabel, title, description, startDate, endDate, publication, classes, assignments, inquiries, currentUser, activeSection, weekId, actions, management } = props;
  const canonicalPath = `/cohorts/${cohortId}/${kind === "week" ? "weeks" : "sprints"}/${containerId}`;
  const tabs = [
    { id: "overview" as const, label: "Resumen" },
    { id: "classes" as const, label: `Clases (${classes.length})` },
    { id: "assignments" as const, label: `Trabajos (${assignments.length})` },
    { id: "inquiries" as const, label: `Consultas (${inquiries.length})` },
  ];

  return <main className="mx-auto w-full max-w-[var(--content-reading)] space-y-7 px-4 py-8 lg:px-8">
    <PageHeader eyebrow={`${cohortName} · ${positionLabel}`} title={title} description={dateRange(startDate, endDate)} actions={actions} />
    <div className="flex flex-wrap items-center gap-2">
      {publication && <Badge variant={publication === "published" ? "success" : "warning"}>{publication === "published" ? "Publicado" : "Borrador"}</Badge>}
      <Badge variant="neutral">{classes.length} clase{classes.length === 1 ? "" : "s"}</Badge>
      <Badge variant="neutral">{assignments.length} trabajo{assignments.length === 1 ? "" : "s"}</Badge>
    </div>
    {management}
    <nav aria-label={`Secciones de ${title}`} className="flex gap-1 overflow-x-auto border-b">
      {tabs.map(tab => <Link key={tab.id} href={`${canonicalPath}?section=${tab.id}`} aria-current={activeSection === tab.id ? "page" : undefined} className={cn("min-h-11 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold", activeSection === tab.id ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground")}>{tab.label}</Link>)}
    </nav>
    <section aria-labelledby={`academic-${activeSection}-heading`}>
      {activeSection === "overview" && <Overview title={title} description={description} classes={classes} assignments={assignments} inquiries={inquiries} canonicalPath={canonicalPath} />}
      {activeSection === "classes" && <ContentList kind="classes" items={classes} cohortId={cohortId} />}
      {activeSection === "assignments" && <ContentList kind="assignments" items={assignments} cohortId={cohortId} />}
      {activeSection === "inquiries" && <div><h2 id="academic-inquiries-heading" className="mb-4 text-xl font-bold">Consultas contextuales</h2><InquiryList inquiries={inquiries} currentUser={currentUser} context={{ cohortId, weekId, basePath: `/cohorts/${cohortId}/inquiries` }} /></div>}
    </section>
  </main>;
}

function Overview({ title, description, classes, assignments, inquiries, canonicalPath }: { title: string; description?: string; classes: Class[]; assignments: Assignment[]; inquiries: Inquiry[]; canonicalPath: string }) {
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.7fr)]">
    <Card><CardContent className="p-6"><h2 id="academic-overview-heading" className="text-xl font-bold">Acerca de {title}</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted">{description || "Todavía no se agregó una descripción para este contenido."}</p></CardContent></Card>
    <Card><CardContent className="p-6"><h2 className="text-lg font-bold">Contenido</h2><div className="mt-4 grid gap-3"><SummaryLink href={`${canonicalPath}?section=classes`} label="Clases" value={classes.length} /><SummaryLink href={`${canonicalPath}?section=assignments`} label="Trabajos prácticos" value={assignments.length} /><SummaryLink href={`${canonicalPath}?section=inquiries`} label="Consultas" value={inquiries.length} /></div></CardContent></Card>
  </div>;
}

function SummaryLink({ href, label, value }: { href: string; label: string; value: number }) { return <Link href={href} className="flex min-h-11 items-center justify-between rounded-md border px-3 py-2 text-sm font-semibold hover:border-primary"><span>{label}</span><Badge variant="neutral">{value}</Badge></Link>; }

function ContentList({ kind, items, cohortId }: { kind: "classes"; items: Class[]; cohortId: string } | { kind: "assignments"; items: Assignment[]; cohortId: string }) {
  const classes = kind === "classes";
  const heading = classes ? "Clases" : "Trabajos prácticos";
  if (!items.length) return <div><h2 id={`academic-${kind}-heading`} className="mb-4 text-xl font-bold">{heading}</h2><EmptyState title={`No hay ${classes ? "clases" : "trabajos prácticos"}`} description="El equipo docente todavía no agregó contenido en esta sección." /></div>;
  return <div><div className="mb-4 flex items-center justify-between gap-4"><h2 id={`academic-${kind}-heading`} className="text-xl font-bold">{heading}</h2><span className="text-sm text-muted">{items.length} resultado{items.length === 1 ? "" : "s"}</span></div><ol className="grid gap-3">{items.map((item, index) => {
    const classDate = "date" in item ? item.date : undefined;
    return <li key={item.id}><Link href={`/cohorts/${cohortId}/${classes ? "classes" : "assignments"}/${item.id}`} className="group flex min-h-20 items-start gap-4 rounded-lg border bg-surface p-4 hover:border-primary"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-sm font-bold">{index + 1}</span><span className="min-w-0"><span className="font-bold group-hover:text-primary">{item.title}</span>{classDate && <span className="mt-1 block text-xs text-muted">{formatDate(classDate)}</span>}<span className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{plainText(item.description)}</span></span><span className="ml-auto text-primary" aria-hidden="true">→</span></Link></li>;
  })}</ol></div>;
}

function plainText(value?: string) { return (value || "Sin descripción").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(); }
function formatDate(value: string) { return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function dateRange(start?: string, end?: string) { const format = (value?: string) => value ? new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value)) : null; const from = format(start); const to = format(end); if (from && to) return `${from} — ${to}`; if (from) return `Comienza el ${from}`; if (to) return `Finaliza el ${to}`; return "Fechas a confirmar"; }
