import { createServerClient } from "@/lib/pocketbase-server";
import { redirect } from "next/navigation";
import { Assignment, Delivery } from "@/types";

import CompleteDeliveriesForm from "./CompleteDeliveriesForm";
import IncompleteDeliveriesForm from "./IncompleteDeliveriesForm";

export const dynamic = 'force-dynamic';

export default async function StudentFormPage() {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || user.role !== 'estudiante') {
    redirect("/");
  }

  // 1. Fetch Assignments for Sprint 1
  // We first need to find "Sprint 1"
  let sprint1Id = "";
  try {
      const sprint1 = await pb.collection('sprints').getFirstListItem('title ~ "Sprint 1" || title ~ "sprint 1"', {
          sort: 'created',
      });
      sprint1Id = sprint1.id;
  } catch (e) {
      console.error("Error fetching Sprint 1:", e);
      // Fallback: try to get the first sprint if "Sprint 1" not found by name
      try {
          const firstSprint = await pb.collection('sprints').getFirstListItem('', { sort: 'created' });
          sprint1Id = firstSprint.id;
      } catch (innerE) {
          console.error("Error fetching any sprint:", innerE);
      }
  }

  let assignments: Assignment[] = [];
  if (sprint1Id) {
      try {
          assignments = await pb.collection('assignments').getFullList<Assignment>({
              filter: `sprint = "${sprint1Id}"`,
              sort: 'created',
          });
      } catch (e) {
          console.error("Error fetching assignments for Sprint 1:", e);
      }
  }

  // 2. Fetch Deliveries for this student
  let deliveries: Delivery[] = [];
  try {
      deliveries = await pb.collection('deliveries').getFullList<Delivery>({
          filter: `student = "${user.id}"`,
      });
  } catch (e) {
      console.error("Error fetching deliveries:", e);
  }

  // 3. Determine if all assignments are delivered
  // We consider "delivered" if there is a delivery record for the assignment
  const allDelivered = assignments.length > 0 && assignments.every(assignment => 
      deliveries.some(d => d.assignment === assignment.id)
  );

  // 4. Check if survey already exists
  let existingSurvey = null;
  if (sprint1Id) {
      try {
          existingSurvey = await pb.collection('student_surveys').getFirstListItem(
              `sprint="${sprint1Id}" && student="${user.id}"`
          );
      } catch (e) {
          // No survey found, which is fine
      }
  }

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-white">Encuesta del Sprint 1</h1>
      
      {/* TP Status Section */}
      <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">Estado de Entregas - Sprint 1</h2>
          {assignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {assignments.map((assignment, index) => {
                    const delivery = deliveries.find(d => d.assignment === assignment.id);
                    const isDelivered = !!delivery;
                    
                    return (
                        <div key={assignment.id} className={`p-4 rounded-xl border ${isDelivered ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-lg text-zinc-700 dark:text-zinc-300">TP {index + 1}</span>
                                {isDelivered ? (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-300">Entregado</span>
                                ) : (
                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full dark:bg-red-900 dark:text-red-300">Pendiente</span>
                                )}
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate" title={assignment.title}>
                                {assignment.title}
                            </p>
                            {isDelivered && (
                                <a href={delivery.repositoryUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 block dark:text-blue-400">
                                    Ver Repositorio
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200">
                No se encontraron trabajos prácticos para el Sprint 1.
            </div>
          )}
      </div>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 max-w-3xl mx-auto">
        {existingSurvey ? (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-green-900/30 dark:text-green-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">¡Encuesta Completada!</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                    Ya has enviado tu respuesta para este sprint. ¡Gracias por tu participación!
                </p>
            </div>
        ) : assignments.length > 0 ? (
            allDelivered ? (
                <CompleteDeliveriesForm userId={user.id} sprintId={sprint1Id} />
            ) : (
                <IncompleteDeliveriesForm userId={user.id} sprintId={sprint1Id} />
            )
        ) : (
            <p className="text-center text-zinc-500">No hay información suficiente para mostrar el formulario.</p>
        )}
      </div>
    </div>
  );
}
