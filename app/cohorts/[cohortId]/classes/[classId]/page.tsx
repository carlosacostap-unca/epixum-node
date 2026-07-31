import { notFound } from "next/navigation";
import { getClass, getClassCohortId, getLinks } from "@/lib/data";
import { requireCohortAccess } from "@/lib/cohorts/access";
import { getInquiries } from "@/lib/actions-inquiries";
import { Badge, Card, CardContent, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import InquiryList from "@/components/inquiries/InquiryList";
import type { Link as ResourceLink } from "@/types";

export const dynamic = "force-dynamic";

export default async function CohortClassPage({ params }: { params: Promise<{ cohortId: string; classId: string }> }) {
  const { cohortId, classId } = await params;
  const context = await requireCohortAccess(cohortId);
  const classData = await getClass(classId).catch(() => null);
  if (!classData || await getClassCohortId(classData) !== cohortId) notFound();
  const [resources, inquiries] = await Promise.all([getLinks(classId), getInquiries({ cohortId, classId })]);
  const staff = context.user.role !== "estudiante";
  const parentHref = classData.week ? `/cohorts/${cohortId}/weeks/${classData.week}?section=classes` : `/cohorts/${cohortId}/sprints/${classData.sprint}?section=classes`;

  return <main className="mx-auto w-full max-w-[var(--content-reading)] space-y-8 px-4 py-8 lg:px-8">
    <PageHeader eyebrow={`${context.cohort.name} · Clase`} title={classData.title} description={classData.date ? formatDate(classData.date) : "Fecha a confirmar"} actions={<div className="flex flex-wrap gap-3"><LinkButton href={parentHref} variant="secondary">Volver al contenido</LinkButton>{staff && <LinkButton href={`/classes/${classId}?cohortId=${cohortId}&manage=1`}>Administrar clase</LinkButton>}</div>} />

    <Card><CardContent className="p-6 sm:p-8"><div className="flex items-center gap-2"><Badge variant="info">Descripción</Badge>{classData.date && <Badge variant="neutral">{formatTime(classData.date)}</Badge>}</div><div className="mt-5 whitespace-pre-wrap text-base leading-8 text-foreground">{classData.description || "Todavía no se agregó una descripción para esta clase."}</div></CardContent></Card>

    <section aria-labelledby="class-resources-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-primary">Material de estudio</p><h2 id="class-resources-heading" className="mt-1 text-2xl font-bold">Recursos de la clase</h2></div><span className="text-sm text-muted">{resources.length} recurso{resources.length === 1 ? "" : "s"}</span></div>
      {resources.length ? <div className="grid gap-4 sm:grid-cols-2">{resources.map(resource => <ResourceCard key={resource.id} resource={resource} />)}</div> : <EmptyState title="No hay recursos disponibles" description="El equipo docente todavía no agregó materiales para esta clase." />}
    </section>

    <section aria-labelledby="class-inquiries-heading" className="border-t pt-8"><div className="mb-5"><p className="text-sm font-semibold text-primary">Acompañamiento</p><h2 id="class-inquiries-heading" className="mt-1 text-2xl font-bold">Consultas sobre esta clase</h2><p className="mt-2 text-sm text-muted">Preguntá sin perder el contexto del contenido que estás revisando.</p></div><InquiryList inquiries={inquiries} currentUser={context.user} context={{ cohortId, weekId: classData.week, classId, basePath: `/cohorts/${cohortId}/inquiries` }} /></section>
  </main>;
}

function ResourceCard({ resource }: { resource: ResourceLink }) {
  const type = resourceType(resource.url);
  return <a href={resource.url} target="_blank" rel="noopener noreferrer" className="group flex min-h-36 flex-col rounded-lg border bg-surface p-5 hover:border-primary hover:shadow-md" aria-label={`${resource.title}, ${type.label}, abre en una pestaña nueva`}><div className="flex items-center justify-between gap-3"><Badge variant={type.variant}>{type.label}</Badge><span className="text-lg text-primary" aria-hidden="true">↗</span></div><h3 className="mt-4 font-bold group-hover:text-primary">{resource.title}</h3><p className="mt-2 truncate text-xs text-muted">{displayHost(resource.url)}</p></a>;
}

function resourceType(url: string): { label: string; variant: "info" | "success" | "warning" | "neutral" } {
  const value = url.toLowerCase();
  if (/\.pdf(?:$|[?#])/.test(value)) return { label: "PDF", variant: "warning" };
  if (/youtube\.com|youtu\.be|vimeo\.com/.test(value)) return { label: "Video", variant: "info" };
  if (/github\.com|gitlab\.com|bitbucket\.org/.test(value)) return { label: "Repositorio", variant: "success" };
  if (/docs\.google\.com|notion\.|\.docx?(?:$|[?#])/.test(value)) return { label: "Documento", variant: "info" };
  return { label: "Enlace", variant: "neutral" };
}
function displayHost(url: string) { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } }
function formatDate(value: string) { return new Intl.DateTimeFormat("es-AR", { dateStyle: "full", timeStyle: "short" }).format(new Date(value)); }
function formatTime(value: string) { return new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }
