import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type PocketBase from "pocketbase";
import type { ReactNode } from "react";
import WeeklyCohortHome from "@/components/cohorts/WeeklyCohortHome";
import TeacherAttentionWorkspace from "@/components/teacher/TeacherAttentionWorkspace";
import { Badge, Card, CardContent, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { getAccessibleCohorts } from "@/lib/cohorts/access";
import { createServerClient, getCurrentUser } from "@/lib/pocketbase-server";
import { loadTeacherAttentionData } from "@/lib/teacher/data";
import type { Assignment, Cohort, Delivery, Inquiry, Review, Sprint, User, Week } from "@/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  const cohorts = await getAccessibleCohorts(user); const cohort = cohorts.find(item => item.status === "active") || cohorts[0] || null;
  if (user.role === "estudiante" && cohort?.mode === "weekly") return <WeeklyCohortHome cohort={cohort} user={user} />;
  const pb = await createServerClient();
  if (user.role === "estudiante") return <StudentHome user={user} cohort={cohort} pb={pb} canSwitchCohorts={cohorts.length > 1} />;
  if (user.role === "admin") return <AdminHome user={user} cohort={cohort} pb={pb} cohortCount={cohorts.length} />;
  if (user.role === "docente") return <TeacherHome user={user} cohorts={cohorts} pb={pb} />;
  notFound();
}

async function StudentHome({ user, cohort, pb, canSwitchCohorts }: { user: User; cohort: Cohort | null; pb: PocketBase; canSwitchCohorts: boolean }) {
  if (!cohort) return <HomeFrame><PageHeader eyebrow="Inicio" title={`Hola, ${firstName(user)}`} description="Tu espacio personal de cursada." /><EmptyState title="Todavía no tenés una cohorte asignada" description="Cuando se confirme tu matrícula, vas a encontrar aquí tus próximas actividades." /></HomeFrame>;
  const weekly = cohort.mode === "weekly"; const scope = weekly ? "assignment.week.cohort" : "assignment.sprint.cohort";
  const [assignments, deliveries, pendingInquiries, recentInquiries, reviews, nextContent] = await Promise.all([
    pb.collection("assignments").getFullList<Assignment>({ filter: pb.filter(`${weekly ? "week.cohort" : "sprint.cohort"} = {:cohort}`, { cohort: cohort.id }) }).catch(() => []),
    pb.collection("deliveries").getFullList<Delivery>({ filter: pb.filter(`student = {:student} && ${scope} = {:cohort}`, { student: user.id, cohort: cohort.id }) }).catch(() => []),
    count(pb, "inquiries", pb.filter("cohort = {:cohort} && status = 'Pendiente'", { cohort: cohort.id })),
    pb.collection("inquiries").getList<Inquiry>(1, 3, { filter: pb.filter("cohort = {:cohort}", { cohort: cohort.id }), sort: "-created" }).then(result => result.items).catch(() => []),
    weekly ? Promise.resolve([] as Review[]) : pb.collection("reviews").getFullList<Review>({ filter: pb.filter("student = {:student} && sprint.cohort = {:cohort} && status = 'pending'", { student: user.id, cohort: cohort.id }), sort: "startTime" }).catch(() => []),
    weekly ? pb.collection("weeks").getList<Week>(1, 1, { filter: pb.filter("cohort = {:cohort} && publicationStatus = 'published'", { cohort: cohort.id }), sort: "number" }).then(result => result.items[0] || null).catch(() => null) : pb.collection("sprints").getList<Sprint>(1, 1, { filter: pb.filter("cohort = {:cohort}", { cohort: cohort.id }), sort: "startDate,created" }).then(result => result.items[0] || null).catch(() => null),
  ]);
  const delivered = new Set(deliveries.map(item => item.assignment)); const pendingAssignments = assignments.filter(item => !delivered.has(item.id)).length;
  const nextHref = nextContent ? (weekly ? `/cohorts/${cohort.id}/weeks/${nextContent.id}` : `/cohorts/${cohort.id}/sprints/${nextContent.id}`) : `/cohorts/${cohort.id}`;
  return <HomeFrame>
    <PageHeader eyebrow={cohort.name} title={`Hola, ${firstName(user)}`} description="Retomá tu cursada desde el próximo paso y revisá lo que necesita atención." actions={canSwitchCohorts ? <LinkButton href="/cohorts" variant="secondary">Cambiar cohorte</LinkButton> : undefined} />
    <section className="rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white shadow-md sm:p-8"><Badge className="bg-white/15 text-white">Próximo paso</Badge><h2 className="mt-4 text-2xl font-bold">{nextContent?.title || (weekly ? "Revisar las semanas disponibles" : "Revisar los sprints disponibles")}</h2><p className="mt-2 max-w-2xl text-blue-100">Encontrá las clases, materiales y trabajos prácticos organizados en el orden de la cursada.</p><Link href={nextHref} className="mt-6 inline-flex min-h-11 items-center rounded-md bg-white px-4 py-2 font-semibold text-blue-800 hover:bg-blue-50">Continuar cursada →</Link></section>
    <div className="grid gap-4 md:grid-cols-3"><HomeMetric label="Trabajos pendientes" value={pendingAssignments} description={pendingAssignments ? "Entregas que todavía podés completar" : "Estás al día con tus entregas"} href={weekly ? `/cohorts/${cohort.id}/weeks` : `/cohorts/${cohort.id}/sprints`} /><HomeMetric label="Consultas abiertas" value={pendingInquiries} description="Preguntas de tu cohorte que siguen activas" href={`/cohorts/${cohort.id}/inquiries`} /><HomeMetric label="Próxima revisión" value={reviews[0] ? formatDate(reviews[0].startTime) : "Sin turno"} description={reviews[0] ? "Tenés una revisión reservada" : "No hay una revisión próxima"} href={weekly ? `/cohorts/${cohort.id}` : `/cohorts/${cohort.id}/reviews`} /></div>
    {recentInquiries.length > 0 && <section><div className="flex items-center justify-between gap-4"><h2 className="text-lg font-bold">Actividad reciente en consultas</h2><Link href={`/cohorts/${cohort.id}/inquiries`} className="text-sm font-semibold text-primary">Ver todas</Link></div><div className="mt-3 grid gap-3">{recentInquiries.map(inquiry => <Link key={inquiry.id} href={`/cohorts/${cohort.id}/inquiries/${inquiry.id}`} className="flex items-center justify-between gap-4 rounded-md border bg-surface p-4 hover:border-primary"><div className="min-w-0"><p className="truncate font-semibold">{inquiry.title}</p><p className="mt-1 text-xs text-muted">Actualizada {formatDate(inquiry.updated || inquiry.created)}</p></div><Badge variant={inquiry.status === "Resuelta" ? "success" : "warning"}>{inquiry.status}</Badge></Link>)}</div></section>}
  </HomeFrame>;
}

async function TeacherHome({ user, cohorts, pb }: { user: User; cohorts: Cohort[]; pb: PocketBase }) {
  const data = await loadTeacherAttentionData(pb, cohorts);
  return <TeacherAttentionWorkspace user={user} data={data} retryHref="/" />;
}

async function AdminHome({ user, cohort, pb, cohortCount }: { user: User; cohort: Cohort | null; pb: PocketBase; cohortCount: number }) {
  const [users, activeEnrollments, requests] = await Promise.all([count(pb, "users", ""), count(pb, "cohort_enrollments", "status = 'active'"), count(pb, "enrollment_requests", "status = 'pending'")]);
  return <HomeFrame><PageHeader eyebrow="Administración" title={`Hola, ${firstName(user)}`} description="Estado general de la plataforma y accesos directos a las operaciones frecuentes." actions={<LinkButton href="/staff/attention" variant="secondary">Atención docente</LinkButton>} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><HomeMetric label="Cohortes" value={cohortCount} description="Activas y archivadas accesibles" href="/admin/cohorts" /><HomeMetric label="Usuarios" value={users} description="Cuentas registradas" href="/admin/users" /><HomeMetric label="Matrículas activas" value={activeEnrollments} description="En todas las cohortes" href="/admin/users?status=active" /><HomeMetric label="Solicitudes pendientes" value={requests} description="Requieren una decisión" href="/staff/enrollment-requests" priority={requests > 0} /></div><div className="grid gap-5 lg:grid-cols-2"><ActionCard title="Gestionar cohortes" description="Creá cursadas, actualizá su configuración y administrá matrículas." href="/admin/cohorts" action="Abrir cohortes" /><ActionCard title="Gestionar usuarios" description="Buscá personas, revisá sus inscripciones y actualizá roles." href="/admin/users" action="Abrir usuarios" /></div>{cohort && <QuickLinks cohort={cohort} />}</HomeFrame>;
}

function HomeFrame({ children }: { children: ReactNode }) { return <main className="mx-auto w-full max-w-[var(--content-dashboard)] space-y-8 px-4 py-8 lg:px-8">{children}</main>; }
function HomeMetric({ label, value, description, href, priority = false }: { label: string; value: number | string; description: string; href: string; priority?: boolean }) { return <Link href={href} className={`rounded-lg border bg-surface p-5 shadow-sm transition hover:border-primary hover:shadow-md ${priority ? "border-warning/50" : ""}`}><p className="text-sm font-medium text-muted">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p><p className="mt-2 text-sm text-muted">{description}</p></Link>; }
function ActionCard({ title, description, href, action }: { title: string; description: string; href: string; action: string }) { return <Card><CardContent><h2 className="text-xl font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted">{description}</p><LinkButton href={href} variant="secondary" className="mt-5">{action}</LinkButton></CardContent></Card>; }
function QuickLinks({ cohort }: { cohort: Cohort }) { const content = cohort.mode === "weekly" ? `/cohorts/${cohort.id}/weeks` : `/cohorts/${cohort.id}/sprints`; return <section><h2 className="text-lg font-bold">Accesos de {cohort.name}</h2><div className="mt-3 flex flex-wrap gap-3"><LinkButton href={content} variant="secondary">Contenido</LinkButton><LinkButton href={`/cohorts/${cohort.id}/inquiries`} variant="secondary">Consultas</LinkButton><LinkButton href={`/cohorts/${cohort.id}/dashboard`} variant="secondary">Tablero</LinkButton></div></section>; }
async function count(pb: PocketBase, collection: string, filter: string) { return pb.collection(collection).getList(1, 1, { filter }).then(result => result.totalItems).catch(() => 0); }
function firstName(user: User) { return user.firstName || user.name?.trim().split(/\s+/)[0] || ""; }
function formatDate(value: string) { return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)); }
