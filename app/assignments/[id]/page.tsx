import { getAssignment, getAssignmentCohortId, getLinks, getDeliveries, getUserDelivery, getCohortStudents } from "@/lib/data";
import { Assignment, Link as LinkType, Delivery, Inquiry, User } from "@/types";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/pocketbase-server";
import AssignmentDetailsManagement from "@/components/AssignmentDetailsManagement";
import StudentDelivery from "@/components/StudentDelivery";
import TeacherDeliveries from "@/components/TeacherDeliveries";
import { getInquiries } from "@/lib/actions-inquiries";
import InquiryList from "@/components/inquiries/InquiryList";
import { Badge, Card, CardContent, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { requireCohortAccess } from "@/lib/cohorts/access";
import { appendSearchParams, cohortPath } from "@/lib/cohorts/route-compatibility";

export const dynamic = 'force-dynamic';

export default async function AssignmentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ cohortId?: string; [key: string]: string | string[] | undefined }> }) {
  const { id } = await params;
  const query = await searchParams;
  const requestedCohortId = typeof query.cohortId === "string" ? query.cohortId : undefined;
  let assignment: Assignment;
  let resolvedCohortId = "";
  let links: LinkType[] = [];
  let inquiries: Inquiry[] = [];
  const user = await getCurrentUser();
  let deliveries: Delivery[] = [];
  let students: User[] = [];
  let userDelivery: Delivery | null = null;
  
  try {
    assignment = await getAssignment(id);
    resolvedCohortId = await getAssignmentCohortId(assignment);
    if (requestedCohortId && requestedCohortId !== resolvedCohortId) return notFound();
    links = await getLinks(id, 'assignment');
    inquiries = await getInquiries({ cohortId: resolvedCohortId, assignmentId: id });
    
    if (user) {
        if (user.role === 'docente' || user.role === 'admin') {
            [deliveries, students] = await Promise.all([getDeliveries(id), getCohortStudents(resolvedCohortId)]);
        } else if (user.role === 'estudiante') {
            userDelivery = await getUserDelivery(id, user.id);
        }
    }
  } catch (e) {
    console.error(e);
    return notFound();
  }
  if (!requestedCohortId) redirect(appendSearchParams(cohortPath(resolvedCohortId, `/assignments/${id}`), query, ["cohortId"]));
  const access = await requireCohortAccess(resolvedCohortId);

  const isAuthorized = user && (user.role === 'docente' || user.role === 'admin');

  if (isAuthorized) {
    return (
        <div className="container mx-auto p-8 min-h-screen space-y-8">
            <AssignmentDetailsManagement user={user} cohortId={requestedCohortId!} assignment={assignment} links={links} inquiries={inquiries} />
            <TeacherDeliveries deliveries={deliveries} students={students} assignmentId={assignment.id} />
        </div>
    );
  }

  const parentHref = assignment.week
    ? `/cohorts/${resolvedCohortId}/weeks/${assignment.week}?section=assignments`
    : `/cohorts/${resolvedCohortId}/sprints/${assignment.sprint}?section=assignments`;

  return (
    <main className="mx-auto w-full max-w-[var(--content-reading)] space-y-8 px-4 py-8 lg:px-8">
      <PageHeader
        eyebrow={`${access.cohort.name} · Trabajo práctico`}
        title={assignment.title}
        description="Revisá tu estado y completá el siguiente paso antes de consultar la consigna y los recursos."
        actions={<LinkButton href={parentHref} variant="secondary">Volver al contenido</LinkButton>}
      />

      {user?.role === "estudiante" && (
        <StudentDelivery assignmentId={assignment.id} delivery={userDelivery} canEdit={access.canMutateStudentWork} />
      )}

      <section aria-labelledby="assignment-description-heading">
        <Card>
          <CardContent className="p-6 sm:p-8">
            <Badge variant="info">Consigna</Badge>
            <h2 id="assignment-description-heading" className="mt-4 text-2xl font-bold">Qué tenés que hacer</h2>
            <div
              className="prose mt-4 max-w-none text-foreground dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: assignment.description || "Todavía no se agregó una consigna para este trabajo." }}
            />
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="assignment-resources-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-primary">Material de apoyo</p>
            <h2 id="assignment-resources-heading" className="mt-1 text-2xl font-bold">Recursos para la entrega</h2>
          </div>
          <span className="text-sm text-muted">{links.length} recurso{links.length === 1 ? "" : "s"}</span>
        </div>
        {links.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {links.map((link) => <AssignmentResourceCard key={link.id} resource={link} />)}
          </div>
        ) : (
          <EmptyState title="No hay recursos adicionales" description="La consigna contiene toda la información disponible para realizar este trabajo." />
        )}
      </section>

      <section aria-labelledby="assignment-inquiries-heading" className="border-t pt-8">
        <div className="mb-5">
          <p className="text-sm font-semibold text-primary">Acompañamiento</p>
          <h2 id="assignment-inquiries-heading" className="mt-1 text-2xl font-bold">Consultas sobre este trabajo</h2>
          <p className="mt-2 text-sm text-muted">Hacé una pregunta sin perder el contexto de la consigna.</p>
        </div>
        <InquiryList inquiries={inquiries} currentUser={user} context={{ cohortId: resolvedCohortId, weekId: assignment.week, assignmentId: id, basePath: `/cohorts/${resolvedCohortId}/inquiries` }} />
      </section>
    </main>
  );
}

function AssignmentResourceCard({ resource }: { resource: LinkType }) {
  return (
    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="group flex min-h-32 flex-col rounded-lg border bg-surface p-5 hover:border-primary hover:shadow-md" aria-label={`${resource.title}, abre en una pestaña nueva`}>
      <div className="flex items-center justify-between gap-3">
        <Badge variant="neutral">Enlace</Badge>
        <span className="text-lg text-primary" aria-hidden="true">↗</span>
      </div>
      <h3 className="mt-4 font-bold group-hover:text-primary">{resource.title}</h3>
      <p className="mt-2 truncate text-xs text-muted">{displayHost(resource.url)}</p>
    </a>
  );
}

function displayHost(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}
