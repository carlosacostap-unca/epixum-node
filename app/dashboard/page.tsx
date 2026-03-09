import { createServerClient } from "@/lib/pocketbase-server";
import { redirect } from "next/navigation";
import { Sprint, Assignment, Delivery, User, StudentSurvey } from "@/types";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    redirect("/");
  }

  // Fetch all sprints
  let sprints: Sprint[] = [];
  try {
      sprints = await pb.collection('sprints').getFullList<Sprint>({
          sort: 'created',
      });
  } catch (e) {
      console.error("Error fetching sprints:", e);
  }

  // Fetch all students
  let students: User[] = [];
  try {
      students = await pb.collection('users').getFullList<User>({
          filter: 'role = "estudiante"',
      });
  } catch (e) {
      console.error("Error fetching students:", e);
  }

  // Prepare dashboard data
  const dashboardData = await Promise.all(sprints.map(async (sprint) => {
      // Get assignments for this sprint
      let assignments: Assignment[] = [];
      try {
          assignments = await pb.collection('assignments').getFullList<Assignment>({
              filter: `sprint = "${sprint.id}"`,
              requestKey: null,
          });
      } catch (e) {
          console.error(`Error fetching assignments for sprint ${sprint.id}:`, e);
      }

      // Get all deliveries for assignments in this sprint
      // Since we can't easily join, we might need to fetch all deliveries or filter by assignments
      // A better way is to fetch deliveries where assignment.sprint = sprint.id, but PocketBase filtering on relation fields is limited depending on version.
      // We'll iterate assignments to get IDs.
      const assignmentIds = assignments.map(a => a.id);
      let deliveries: Delivery[] = [];
      
      if (assignmentIds.length > 0) {
          try {
              // Construct filter: assignment = "id1" || assignment = "id2" ...
              const filter = assignmentIds.map(id => `assignment = "${id}"`).join(" || ");
              deliveries = await pb.collection('deliveries').getFullList<Delivery>({
                  filter: filter,
                  requestKey: null,
              });
          } catch (e) {
              console.error(`Error fetching deliveries for sprint ${sprint.id}:`, e);
          }
      }

      // Get surveys for this sprint
      let surveys: StudentSurvey[] = [];
      try {
          surveys = await pb.collection('student_surveys').getFullList<StudentSurvey>({
              filter: `sprint = "${sprint.id}"`,
              requestKey: null,
          });
      } catch (e) {
          // Collection might not exist yet or no permissions
          console.error(`Error fetching surveys for sprint ${sprint.id}:`, e);
      }

      // Calculate metrics
      const totalStudents = students.length;
      const totalAssignments = assignments.length;
      
      // Calculate how many students delivered all assignments
      let studentsWithAllDeliveries = 0;
      students.forEach(student => {
          const studentDeliveries = deliveries.filter(d => d.student === student.id);
          // Check if student has a delivery for every assignment
          const hasAll = assignments.every(a => studentDeliveries.some(d => d.assignment === a.id));
          if (hasAll) studentsWithAllDeliveries++;
      });

      // Survey stats
      const surveysCompleted = surveys.filter(s => s.status === 'completed').length;
      const surveysFollowUp = surveys.filter(s => s.status === 'incomplete_deliveries' && s.futurePlan === 'continue').length;
      const surveysRetake = surveys.filter(s => s.status === 'incomplete_deliveries' && s.futurePlan === 'retake').length;
      const totalSurveys = surveys.length;

      return {
          sprint,
          totalAssignments,
          studentsWithAllDeliveries,
          surveysCompleted,
          surveysFollowUp,
          surveysRetake,
          totalSurveys,
      };
  }));

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Dashboard del Curso</h1>
        <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
            &larr; Volver al Panel
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
          {dashboardData.map((data) => (
              <div key={data.sprint.id} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between items-center">
                      <div>
                          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{data.sprint.title}</h2>
                          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">{data.totalAssignments} Trabajos Prácticos</p>
                      </div>
                      <div className="text-right">
                          <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{data.studentsWithAllDeliveries}</span>
                          <span className="text-zinc-400 text-lg"> / {students.length}</span>
                          <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold mt-1">Entregas Completas</p>
                      </div>
                  </div>
                  
                  <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Delivery Progress */}
                      <Link href={`/dashboard/${data.sprint.id}/deliveries`} className="block bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 group-hover:underline">Progreso de Entregas</h3>
                            <svg className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </div>
                          <div className="relative pt-1">
                              <div className="flex mb-2 items-center justify-between">
                                  <div>
                                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 dark:bg-blue-800 dark:text-blue-200">
                                          Completado
                                      </span>
                                  </div>
                                  <div className="text-right">
                                      <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-300">
                                          {Math.round((data.studentsWithAllDeliveries / (students.length || 1)) * 100)}%
                                      </span>
                                  </div>
                              </div>
                              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200 dark:bg-blue-800">
                                  <div style={{ width: `${Math.round((data.studentsWithAllDeliveries / (students.length || 1)) * 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                              </div>
                          </div>
                      </Link>

                      {/* Survey Stats - Positive */}
                      <Link href={`/dashboard/${data.sprint.id}/positive`} className="block bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800 hover:shadow-md hover:border-green-300 transition-all cursor-pointer group">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 uppercase tracking-wide group-hover:underline">Encuestas Positivas</h3>
                            <svg className="w-4 h-4 text-green-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </div>
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{data.surveysCompleted}</p>
                          <p className="text-xs text-green-700 dark:text-green-500 mt-1">Estudiantes con todo al día</p>
                      </Link>
                      
                      {/* Survey Stats - Follow Up */}
                      <Link href={`/dashboard/${data.sprint.id}/follow-up`} className="block bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800 hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide group-hover:underline">Requieren Seguimiento</h3>
                            <svg className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </div>
                          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{data.surveysFollowUp}</p>
                          <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">Siguen con compromiso</p>
                      </Link>

                      {/* Survey Stats - Retake */}
                      <Link href={`/dashboard/${data.sprint.id}/retake`} className="block bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800 hover:shadow-md hover:border-red-300 transition-all cursor-pointer group">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 uppercase tracking-wide group-hover:underline">Solicitan Recursar</h3>
                            <svg className="w-4 h-4 text-red-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </div>
                          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{data.surveysRetake}</p>
                          <p className="text-xs text-red-700 dark:text-red-500 mt-1">Recursan en junio</p>
                      </Link>
                  </div>
              </div>
          ))}

          {dashboardData.length === 0 && (
              <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                  <p className="text-zinc-500">No hay sprints configurados en el sistema.</p>
              </div>
          )}
      </div>
    </div>
  );
}
