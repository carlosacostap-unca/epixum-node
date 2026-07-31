import { getClass, getClassCohortId, getLinks } from "@/lib/data";
import { Class, Link as LinkType, Inquiry } from "@/types";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import FormattedDate from "@/components/FormattedDate";
import { getCurrentUser } from "@/lib/pocketbase-server";
import ClassDetailsManagement from "@/components/ClassDetailsManagement";
import { getInquiries } from "@/lib/actions-inquiries";
import InquiryList from "@/components/inquiries/InquiryList";
import { appendSearchParams, cohortPath } from "@/lib/cohorts/route-compatibility";

export const dynamic = 'force-dynamic';

export default async function ClassPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ cohortId?: string; manage?: string }> }) {
  const { id } = await params;
  const query = await searchParams; const requestedCohortId = query.cohortId;
  let classData: Class;
  let resolvedCohortId = "";
  let links: LinkType[] = [];
  let inquiries: Inquiry[] = [];
  const user = await getCurrentUser();
  
  try {
    classData = await getClass(id);
    resolvedCohortId = await getClassCohortId(classData);
    if (requestedCohortId && requestedCohortId !== resolvedCohortId) return notFound();
    if (query.manage === "1") {
      links = await getLinks(id);
      inquiries = await getInquiries({ cohortId: resolvedCohortId, classId: id });
    }
  } catch (e) {
    console.error(e);
    return notFound();
  }
  if (query.manage !== "1") redirect(appendSearchParams(cohortPath(resolvedCohortId, `/classes/${id}`), query, ["cohortId", "manage"]));

  const isAuthorized = user && (user.role === 'docente' || user.role === 'admin');

  if (isAuthorized) {
    return <div className="container mx-auto p-8 min-h-screen">
      <ClassDetailsManagement user={user} cohortId={resolvedCohortId} classData={classData} links={links} inquiries={inquiries} />
    </div>;
  }

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <Link href={classData.week ? `/cohorts/${resolvedCohortId}/weeks/${classData.week}` : `/cohorts/${resolvedCohortId}/sprints/${classData.sprint}`} className="text-blue-500 hover:underline mb-8 inline-block">&larr; Volver</Link>
      
      <header className="mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl mb-4">
          {classData.title}
        </h1>
        {classData.date && (
            <p className="text-sm text-zinc-400 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <FormattedDate date={classData.date} showTime={true} />
            </p>
        )}
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-3xl mb-8">
          {classData.description}
        </p>
      </header>

      <div className="space-y-6 mb-12">
        <h2 className="text-2xl font-bold mb-4">Recursos de la clase</h2>
        
        {links.length === 0 ? (
          <p className="text-zinc-500">No hay recursos disponibles para esta clase.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links.map((link) => (
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                key={link.id}
                className="block p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                    LINK
                  </span>
                  <svg className="w-5 h-5 text-zinc-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </div>
                <h3 className="text-lg font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 truncate">
                    {link.url}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Consultas</h2>
        <InquiryList inquiries={inquiries} currentUser={user} context={{ cohortId: resolvedCohortId, weekId: classData.week, classId: id, basePath: `/cohorts/${resolvedCohortId}/inquiries` }} />
      </div>
    </div>
  );
}
