"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Inquiry, User } from "@/types";
import { deleteInquiry, updateInquiryStatus } from "@/lib/actions-inquiries";
import { Alert, Badge, Button, Card, CardContent } from "@/components/ui";

export default function InquiryDetailsHeader({ inquiry, currentUser, cohortId }: { inquiry: Inquiry; currentUser: User | null; cohortId?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const canModify = currentUser?.id === inquiry.author || currentUser?.role === "docente" || currentUser?.role === "admin";
  const resolved = inquiry.status === "Resuelta";
  const contextHref = inquiry.class ? `/cohorts/${cohortId}/classes/${inquiry.class}` : inquiry.assignment ? `/cohorts/${cohortId}/assignments/${inquiry.assignment}` : null;
  const contextLabel = inquiry.expand?.class?.title || inquiry.expand?.assignment?.title || inquiry.expand?.week?.title || "Consulta general";

  function changeStatus(status: "Pendiente" | "Resuelta") {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateInquiryStatus(inquiry.id, status);
      if (!result.success) return setFeedback(result.error);
      setFeedback(status === "Resuelta" ? "Consulta marcada como resuelta." : "Consulta reabierta.");
      router.refresh();
    });
  }

  function remove() {
    if (!window.confirm("¿Eliminar esta consulta y su conversación? Esta acción no se puede deshacer.")) return;
    startTransition(async () => {
      const result = await deleteInquiry(inquiry.id);
      if (!result.success) return setFeedback(result.error);
      router.push(cohortId ? `/cohorts/${cohortId}/inquiries` : "/inquiries");
    });
  }

  return <section aria-labelledby="question-heading" className="space-y-4">
    {feedback && <Alert variant={feedback.includes("resuelta") || feedback.includes("reabierta") ? "success" : "danger"}>{feedback}</Alert>}
    <Card className={resolved ? "border-success/30" : "border-warning/30"}><CardContent className="p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><div className="flex flex-wrap items-center gap-2"><Badge variant={resolved ? "success" : "warning"}>{inquiry.status}</Badge>{contextHref ? <Link href={contextHref} className="text-sm font-semibold text-primary hover:underline">{contextLabel}</Link> : <span className="text-sm text-muted">{contextLabel}</span>}</div><h2 id="question-heading" className="mt-5 text-xl font-bold">Pregunta</h2></div>
        {canModify && <div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm" loading={pending} onClick={() => changeStatus(resolved ? "Pendiente" : "Resuelta")}>{resolved ? "Reabrir consulta" : "Marcar como resuelta"}</Button><Button variant="danger" size="sm" disabled={pending} onClick={remove}>Eliminar</Button></div>}
      </div>
      <p className="mt-4 whitespace-pre-wrap text-base leading-7">{inquiry.description}</p>
      <div className="mt-6 border-t pt-4 text-sm text-muted"><span className="font-semibold text-foreground">{inquiry.expand?.author?.name || "Usuario"}</span> · <time dateTime={inquiry.created}>{formatDate(inquiry.created)}</time></div>
    </CardContent></Card>
  </section>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeStyle: "short" }).format(new Date(value)); }
