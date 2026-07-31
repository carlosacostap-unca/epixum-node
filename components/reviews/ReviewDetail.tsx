import type { Review, User } from "@/types";
import { Badge, Card, CardContent, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import ReviewNotesForm from "./ReviewNotesForm";

export default function ReviewDetail({ review, user, cohortId }: { review: Review; user: User; cohortId?: string }) {
  const staff = user.role !== "estudiante"; const state = statusMeta(review.status); const backHref = cohortId ? `/cohorts/${cohortId}/reviews/${review.sprint}` : `/reviews/${review.sprint}`;
  return <main className="mx-auto w-full max-w-[var(--content-reading)] space-y-8 px-4 py-8 lg:px-8">
    <PageHeader eyebrow={`${review.expand?.sprint?.title || "Sprint"} · Revisión`} title="Detalle del turno" description={formatRange(review)} actions={<LinkButton href={backHref} variant="secondary">Volver a la agenda</LinkButton>} />
    <div className="grid gap-6 md:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.4fr)]">
      <Card><CardContent className="p-6"><div className="flex flex-wrap gap-2"><Badge variant={state.variant}>{state.label}</Badge><Badge variant="neutral">{meetingMode(review)}</Badge></div><dl className="mt-6 grid gap-5 text-sm"><Detail label="Horario" value={formatRange(review)} /><Detail label="Docente" value={review.expand?.teacher?.name || "Docente a confirmar"} /><Detail label="Estudiante" value={review.expand?.student?.name || "Sin reservar"} />{review.roomNumber && <Detail label="Sala o aula" value={review.roomNumber} />}</dl>{review.zoomLink && <a href={review.zoomLink} target="_blank" rel="noopener noreferrer" className="mt-6 flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">Unirse a la reunión<span className="sr-only">, abre en una pestaña nueva</span></a>}</CardContent></Card>
      <section aria-labelledby="review-feedback-heading"><h2 id="review-feedback-heading" className="mb-4 text-xl font-bold">{staff ? "Gestión y notas" : "Retroalimentación"}</h2>{staff ? <Card><CardContent className="p-6"><ReviewNotesForm review={review} /></CardContent></Card> : review.public_note ? <Card><CardContent className="p-6"><p className="whitespace-pre-wrap leading-7">{review.public_note}</p></CardContent></Card> : <EmptyState title="Todavía no hay retroalimentación" description="El equipo docente publicará aquí las observaciones destinadas al estudiante." />}</section>
    </div>
  </main>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="font-semibold text-muted">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>; }
function statusMeta(status: Review["status"]): { label: string; variant: "info" | "success" | "danger" } { if (status === "completed") return { label: "Completado", variant: "success" }; if (status === "cancelled") return { label: "Cancelado", variant: "danger" }; return { label: "Pendiente", variant: "info" }; }
function meetingMode(review: Review) { if (review.zoomLink && review.roomNumber) return "Híbrida"; if (review.zoomLink) return "Virtual"; if (review.roomNumber) return "Presencial"; return "Modalidad a confirmar"; }
function formatRange(review: Review) { const start = new Date(review.startTime); const end = new Date(review.endTime); return `${new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(start)}, ${new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(start)} a ${new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(end)}`; }
