import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { createAdminServerClient } from "@/lib/pocketbase-server";
import { JAVASCRIPT_ASSESSMENT_QUESTION_COUNT, JAVASCRIPT_ASSESSMENT_VERSION, summarizeAssessmentAttempts } from "@/lib/cohorts/javascript-assessment";
import { isValidWhatsAppInvitationUrl, WHATSAPP_INVITATION_URL } from "@/lib/cohorts/onboarding";
import type { Cohort, JavascriptAssessmentResult, User } from "@/types";
import WeeklyClassSchedule from "./WeeklyClassSchedule";

export default async function WeeklyCohortHome({ cohort, user }: { cohort: Cohort; user: User }) {
  if (!isValidWhatsAppInvitationUrl(WHATSAPP_INVITATION_URL)) throw new Error("La URL configurada para WhatsApp no es válida.");
  const qrDataUrl = await QRCode.toDataURL(WHATSAPP_INVITATION_URL, { width: 240, margin: 1, errorCorrectionLevel: "M" });
  const pb = await createAdminServerClient();
  const attempts = user.role === "estudiante" ? await pb.collection("javascript_assessment_results").getFullList<JavascriptAssessmentResult>({
    filter: pb.filter("cohort = {:cohort} && student = {:student} && assessmentVersion = {:version}", { cohort: cohort.id, student: user.id, version: JAVASCRIPT_ASSESSMENT_VERSION }),
    sort: "-completedAt",
  }) : [];
  const summary = attempts.length > 0 ? summarizeAssessmentAttempts(attempts)[0] : null;

  return <main className="container mx-auto max-w-3xl p-8"><div className="grid gap-6">
    <WeeklyClassSchedule />
    <section className="flex h-full flex-col rounded-2xl border bg-surface p-7">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Comunidad</p><h2 className="mt-2 text-2xl font-bold">Sumate al grupo de WhatsApp</h2><p className="mt-3 text-muted">Escaneá el código o abrí el enlace desde tu dispositivo.</p>
      <div className="mx-auto mt-6 flex w-fit max-w-full flex-col items-center gap-4"><div className="rounded-2xl bg-white p-3"><Image src={qrDataUrl} alt="Código QR de invitación al grupo de WhatsApp" width={240} height={240} unoptimized /></div><a href={WHATSAPP_INVITATION_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-12 w-60 max-w-full items-center justify-center whitespace-nowrap rounded-xl bg-emerald-600 px-5 py-3 text-center font-semibold text-white hover:bg-emerald-700">Abrir invitación</a></div>
    </section>
    <section className="flex h-full flex-col rounded-2xl border bg-surface p-7">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">Diagnóstico</p><h2 className="mt-2 text-2xl font-bold">Test inicial de JavaScript</h2><p className="mt-3 text-muted">Respondé {JAVASCRIPT_ASSESSMENT_QUESTION_COUNT} preguntas para conocer tu punto de partida. Después podrás practicar sin modificar el diagnóstico inicial.</p>
      {user.role === "estudiante" ? <>{summary && <p className="mt-3 text-sm text-muted">Diagnóstico inicial: {summary.initialScore}/{JAVASCRIPT_ASSESSMENT_QUESTION_COUNT} · {summary.practiceCount} práctica{summary.practiceCount === 1 ? "" : "s"} · mejor nota: {summary.bestScore}/{JAVASCRIPT_ASSESSMENT_QUESTION_COUNT}</p>}<div className="mt-auto flex justify-center pt-6"><Link href={`/cohorts/${cohort.id}/assessment`} className="inline-flex min-h-12 w-60 max-w-full items-center justify-center whitespace-nowrap rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700">{summary ? "Practicar nuevamente" : "Comenzar diagnóstico"}</Link></div></> : <div className="mt-auto flex justify-center pt-6"><Link href={`/cohorts/${cohort.id}/assessment-report`} className="inline-flex min-h-12 w-60 max-w-full items-center justify-center whitespace-nowrap rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700">Ver reporte docente</Link></div>}
    </section>
  </div></main>;
}
