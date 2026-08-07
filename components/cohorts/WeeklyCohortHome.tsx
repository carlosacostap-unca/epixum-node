import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { createAdminServerClient } from "@/lib/pocketbase-server";
import { JAVASCRIPT_ASSESSMENT_QUESTION_COUNT, JAVASCRIPT_ASSESSMENT_VERSION, summarizeAssessmentAttempts } from "@/lib/cohorts/javascript-assessment";
import { isValidWhatsAppInvitationUrl, WHATSAPP_INVITATION_URL } from "@/lib/cohorts/onboarding";
import { getWeeks } from "@/lib/cohorts/weeks";
import { getStudentWeekContent, type StudentContentSummary } from "@/lib/content/student";
import { chooseLearningWeek, studentWeekContentHref } from "@/lib/content/reader";
import { Badge, LinkButton, PageHeader } from "@/components/ui";
import type { Cohort, JavascriptAssessmentResult, User, Week } from "@/types";
import WeeklyClassSchedule from "./WeeklyClassSchedule";

export default async function WeeklyCohortHome({ cohort, user }: { cohort: Cohort; user: User }) {
  const whatsappAvailable = isValidWhatsAppInvitationUrl(WHATSAPP_INVITATION_URL);
  const qrDataUrl = whatsappAvailable ? await QRCode.toDataURL(WHATSAPP_INVITATION_URL, { width: 240, margin: 1, errorCorrectionLevel: "M" }) : null;
  const pb = await createAdminServerClient();
  const [attempts, learning] = await Promise.all([
    user.role === "estudiante" ? pb.collection("javascript_assessment_results").getFullList<JavascriptAssessmentResult>({
      filter: pb.filter("cohort = {:cohort} && student = {:student} && assessmentVersion = {:version}", { cohort: cohort.id, student: user.id, version: JAVASCRIPT_ASSESSMENT_VERSION }),
      sort: "-completedAt",
    }) : Promise.resolve([]),
    user.role === "estudiante" ? getWeeklyLearningJourney(cohort.id) : Promise.resolve(null),
  ]);
  const summary = attempts.length > 0 ? summarizeAssessmentAttempts(attempts)[0] : null;

  return <main className="mx-auto w-full max-w-[var(--content-dashboard)] space-y-8 px-4 py-8 lg:px-8">
    <PageHeader eyebrow={cohort.name} title={user.role === "estudiante" ? `Hola, ${firstName(user)}` : "Experiencia de bienvenida"} description={user.role === "estudiante" ? "Retomá tu aprendizaje desde el próximo paso y encontrá los recursos de tu cursada." : "Revisá los recursos iniciales que reciben los estudiantes de esta cohorte."} />
    {user.role === "estudiante" && <WeeklyLearningHero cohort={cohort} learning={learning} />}
    <section aria-labelledby="onboarding-heading" className="space-y-4"><div><p className="text-sm font-semibold uppercase tracking-wide text-primary">Acompañamiento</p><h2 id="onboarding-heading" className="mt-1 text-2xl font-bold">Información para tu cursada</h2></div><div className="grid gap-6 lg:grid-cols-2"><div className="lg:col-span-2"><WeeklyClassSchedule /></div>
    <section className="flex h-full flex-col rounded-2xl border bg-surface p-7">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Comunidad</p><h2 className="mt-2 text-2xl font-bold">Sumate al grupo de WhatsApp</h2><p className="mt-3 text-muted">Escaneá el código o abrí el enlace desde tu dispositivo.</p>
      {whatsappAvailable && qrDataUrl ? <div className="mx-auto mt-6 flex w-fit max-w-full flex-col items-center gap-4"><div className="hidden rounded-2xl bg-white p-3 sm:block"><Image src={qrDataUrl} alt="Código QR de invitación al grupo de WhatsApp" width={240} height={240} unoptimized /></div><a href={WHATSAPP_INVITATION_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-12 w-60 max-w-full items-center justify-center whitespace-nowrap rounded-xl bg-emerald-600 px-5 py-3 text-center font-semibold text-white hover:bg-emerald-700">Abrir invitación</a></div> : <p role="status" className="mt-6 rounded-xl bg-surface-muted p-4 text-sm text-muted">La invitación a la comunidad no está disponible en este momento. El resto de tu cursada sigue accesible.</p>}
    </section>
    <section className="flex h-full flex-col rounded-2xl border bg-surface p-7">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">Diagnóstico</p><h2 className="mt-2 text-2xl font-bold">Test inicial de JavaScript</h2><p className="mt-3 text-muted">Respondé {JAVASCRIPT_ASSESSMENT_QUESTION_COUNT} preguntas para conocer tu punto de partida. Después podrás practicar sin modificar el diagnóstico inicial.</p>
      {user.role === "estudiante" ? <>{summary && <p className="mt-3 text-sm text-muted">Diagnóstico inicial: {summary.initialScore}/{JAVASCRIPT_ASSESSMENT_QUESTION_COUNT} · {summary.practiceCount} práctica{summary.practiceCount === 1 ? "" : "s"} · mejor nota: {summary.bestScore}/{JAVASCRIPT_ASSESSMENT_QUESTION_COUNT}</p>}<div className="mt-auto flex justify-center pt-6"><Link href={`/cohorts/${cohort.id}/assessment`} className="inline-flex min-h-12 w-60 max-w-full items-center justify-center whitespace-nowrap rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700">{summary ? "Practicar nuevamente" : "Comenzar diagnóstico"}</Link></div></> : <div className="mt-auto flex justify-center pt-6"><Link href={`/cohorts/${cohort.id}/assessment-report`} className="inline-flex min-h-12 w-60 max-w-full items-center justify-center whitespace-nowrap rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700">Ver reporte docente</Link></div>}
    </section>
  </div></section></main>;
}

export interface WeeklyLearningJourney {
  week: Week;
  sections: StudentContentSummary[];
  progress: { completed: number; total: number; percentage: number };
  continueSection: StudentContentSummary | null;
}

export function WeeklyLearningHero({ cohort, learning }: { cohort: Cohort; learning: WeeklyLearningJourney | null }) {
  const section = learning?.continueSection;
  const href = learning ? studentWeekContentHref(cohort.id, learning.week.id, section) : `/cohorts/${cohort.id}/weeks`;
  const complete = Boolean(learning?.progress.total && learning.progress.completed === learning.progress.total);
  return <section className="rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white shadow-md sm:p-8">
    <Badge className="bg-white/15 text-white">{complete ? "Recorrido completo" : "Próximo paso"}</Badge>
    <p className="mt-4 text-sm font-semibold text-blue-100">{learning ? `Semana ${learning.week.number} · ${learning.week.title}` : "Contenido semanal"}</p>
    <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{section?.title || (learning ? "Revisar los contenidos de la semana" : "Tu recorrido comienza pronto")}</h2>
    <p className="mt-3 max-w-2xl text-blue-100">{learning ? `${learning.progress.completed} de ${learning.progress.total} secciones completadas. ${section?.started ? "Volvé al último punto alcanzado." : complete ? "Podés volver a revisar el recorrido cuando quieras." : "Empezá por la próxima sección disponible."}` : "Todavía no hay secciones disponibles. Podés revisar las semanas publicadas mientras el equipo docente prepara el contenido."}</p>
    <div className="mt-6 flex flex-wrap gap-3"><Link href={href} className="inline-flex min-h-11 items-center rounded-md bg-white px-4 py-2 font-semibold text-blue-800 hover:bg-blue-50">{section?.started ? "Continuar donde dejé" : complete ? "Revisar recorrido" : learning ? "Comenzar recorrido" : "Ver semanas"} →</Link><LinkButton href={`/cohorts/${cohort.id}/inquiries`} variant="secondary" className="border-white/35 bg-transparent text-white hover:bg-white/10">Ir a consultas</LinkButton></div>
  </section>;
}

async function getWeeklyLearningJourney(cohortId: string): Promise<WeeklyLearningJourney | null> {
  const weeks = await getWeeks(cohortId);
  const journeys = await Promise.all(weeks.map(async (week) => ({ week, ...(await getStudentWeekContent(cohortId, week.id)) })));
  const selected = chooseLearningWeek(journeys.map((journey) => ({ ...journey.week, progress: journey.progress })));
  return selected ? journeys.find((journey) => journey.week.id === selected.id) ?? null : null;
}

function firstName(user: User) { return user.firstName || user.name?.trim().split(/\s+/)[0] || ""; }
