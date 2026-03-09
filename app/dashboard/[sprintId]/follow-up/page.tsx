
import { createServerClient } from "@/lib/pocketbase-server";
import { redirect } from "next/navigation";
import { Sprint, StudentSurvey, User } from "@/types";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function FollowUpSurveysPage({ params }: { params: Promise<{ sprintId: string }> }) {
    const { sprintId } = await params;
    const pb = await createServerClient();
    const user = pb.authStore.model;

    if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
        redirect("/");
    }

    // Fetch sprint
    let sprint: Sprint | null = null;
    try {
        sprint = await pb.collection('sprints').getOne<Sprint>(sprintId);
    } catch (e) {
        console.error("Error fetching sprint:", e);
        return <div>Sprint no encontrado</div>;
    }

    // Fetch follow-up surveys
    let surveys: StudentSurvey[] = [];
    try {
        surveys = await pb.collection('student_surveys').getFullList<StudentSurvey>({
            filter: `sprint = "${sprintId}" && status = "incomplete_deliveries" && futurePlan = "continue"`,
            expand: 'student',
        });
    } catch (e) {
        console.error("Error fetching surveys:", e);
    }

    return (
        <div className="container mx-auto p-8 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Requieren Seguimiento</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">{sprint.title}</p>
                </div>
                <Link href="/dashboard" className="text-blue-600 hover:underline dark:text-blue-400">
                    &larr; Volver al Dashboard
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {surveys.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 text-center text-zinc-500">
                        No hay estudiantes que requieran seguimiento específico.
                    </div>
                ) : (
                    surveys.map((survey) => {
                        const student = survey.expand?.student as User;
                        return (
                            <div key={survey.id} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
                                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
                                        {student?.name?.[0] || '?'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-zinc-900 dark:text-white">{student?.name || `${student?.firstName || ''} ${student?.lastName || ''}`}</h3>
                                        <p className="text-sm text-zinc-500">{student?.email}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Motivos del Retraso</h4>
                                        <p className="text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg">{survey.delayFactors || '-'}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Reflexión sobre Actitud</h4>
                                        <p className="text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg">{survey.attitudeReflection || '-'}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Aprendizajes</h4>
                                        <p className="text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg">{survey.learningExperience || '-'}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Estrategias Futuras</h4>
                                        <p className="text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg">{survey.futureStrategies || '-'}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Compromiso Personal</h4>
                                        <p className="text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg">{survey.personalCommitment || '-'}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Plan de Acción</h4>
                                        <p className="text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg">{survey.actionPlan || '-'}</p>
                                    </div>
                                    {survey.additionalComments && (
                                        <div className="md:col-span-2">
                                            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Comentarios Adicionales</h4>
                                            <p className="text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg">{survey.additionalComments}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4">
                                     <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Plan Futuro</h4>
                                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                        Continuar con mayor compromiso
                                     </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
