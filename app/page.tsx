import { getSprints } from "@/lib/data";
import { Sprint } from "@/types";
import Link from "next/link";
import { getCurrentUser, createServerClient } from "@/lib/pocketbase-server";
import FormattedDate from "@/components/FormattedDate";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await getCurrentUser();
  const pb = await createServerClient();

  // 1. Student View (Navigation Cards)
  if (user && user.role === 'estudiante') {
    let hasCompletedSurvey = false;
    
    try {
        // Try to find Sprint 1
        const sprint1 = await pb.collection('sprints').getFirstListItem('title ~ "Sprint 1" || title ~ "sprint 1"', {
            sort: 'created',
        });
        
        if (sprint1) {
            // Check if survey exists
            const existingSurvey = await pb.collection('student_surveys').getFirstListItem(
                `sprint="${sprint1.id}" && student="${user.id}"`
            );
            if (existingSurvey) {
                hasCompletedSurvey = true;
            }
        }
    } catch (e) {
        // If sprint not found or survey not found (404), hasCompletedSurvey remains false
    }

    return (
        <div className="container mx-auto p-8 min-h-screen">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                Curso de Node.js
                </h1>
                <p className="text-xl text-zinc-500 dark:text-zinc-400">
                Domina el backend con Node.js, paso a paso.
                </p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
                {!hasCompletedSurvey && (
                <Link href="/student-form" className="block md:col-span-2 p-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg border border-transparent hover:shadow-xl hover:scale-[1.02] transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black opacity-10 rounded-full blur-xl"></div>
                    
                    <div className="relative flex items-center">
                        <div className="w-16 h-16 bg-white/20 text-white rounded-xl flex items-center justify-center mr-6 backdrop-blur-sm">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-2 text-white">Encuesta del Sprint 1</h2>
                            <p className="text-indigo-100 text-lg">Completa este formulario obligatorio para continuar con el curso.</p>
                        </div>
                        <div className="ml-auto">
                            <svg className="w-8 h-8 text-white opacity-70 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </div>
                    </div>
                </Link>
                )}

                <Link href="/sprints" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Mis Sprints</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">Accede a tus tareas, entregas y progresos del curso.</p>
                </Link>
                
                <Link href="/my-team" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-purple-500 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Mi Equipo</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">Ver quiénes son tus compañeros de equipo y vuestro progreso.</p>
                </Link>

                <Link href="/reviews" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-green-500 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Revisiones</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">Reserva turnos de revisión con tus docentes.</p>
                </Link>

                <Link href="/inquiries" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-orange-500 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Consultas</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">Pregunta dudas y ayuda a tus compañeros.</p>
                </Link>
            </div>
        </div>
    );
  }

  // 2. Teacher / Admin View (Navigation Cards)
  if (user && (user.role === 'docente' || user.role === 'admin')) {
    return (
      <div className="container mx-auto p-8 min-h-screen">
          <header className="mb-12 text-center">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
              Panel Docente
              </h1>
              <p className="text-xl text-zinc-500 dark:text-zinc-400">
              Gestiona el curso, sprints y equipos.
              </p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
              <Link href="/sprints" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Gestionar Sprints</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Crea, edita y administra los sprints y entregas del curso.</p>
              </Link>
              
              <Link href="/teams" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-purple-500 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Gestionar Equipos</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Organiza a los estudiantes en equipos de trabajo.</p>
              </Link>

              <Link href="/reviews" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-green-500 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Revisiones</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Gestiona los turnos de revisión para los estudiantes.</p>
              </Link>

              <Link href="/inquiries" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-orange-500 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Consultas</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Responde dudas y gestiona las consultas del curso.</p>
              </Link>
              <Link href="/dashboard-cursada" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M7 6h10M7 18h10" /></svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Dashboard Cursada</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Consulta el estado de aprobacion de cada alumno por sprint.</p>
              </Link>
              <Link href="/dashboard" className="block p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Dashboard</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Visualiza métricas y progreso del curso sprint a sprint.</p>
              </Link>
          </div>
      </div>
    );
  }

  // 3. Guest View
  let sprints: Sprint[] = [];
  let error = null;

  try {
    sprints = await getSprints();
  } catch (e) {
    console.error("Error fetching sprints:", e);
    error = "No se pudieron cargar los sprints. Asegúrate de que la colección 'sprints' exista y sea pública.";
  }

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Curso de Node.js
        </h1>
        <p className="text-xl text-zinc-500 dark:text-zinc-400">
          Domina el backend con Node.js, paso a paso.
        </p>
      </header>

      {error ? (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <span className="font-medium">Error:</span> {error}
        </div>
      ) : sprints.length === 0 ? (
        <div className="text-center py-10">
             <p className="text-xl text-zinc-500">No hay sprints disponibles todavía.</p>
        </div>
      ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sprints.map((sprint) => (
                  <Link 
                    href={`/sprints/${sprint.id}`} 
                    key={sprint.id} 
                    className="group block p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm hover:shadow-md transition-all border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
                        Sprint
                      </span>
                      {(sprint.startDate || sprint.endDate) && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 flex gap-1">
                          {sprint.startDate && <FormattedDate date={sprint.startDate} />} 
                          {sprint.startDate && sprint.endDate && " - "}
                          {sprint.endDate && <FormattedDate date={sprint.endDate} />}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {sprint.title}
                    </h2>
                    <p className="text-zinc-600 dark:text-zinc-400 line-clamp-3">
                      {sprint.description}
                    </p>
                  </Link>
                ))}
              </div>
      )}
    </div>
  );
}
