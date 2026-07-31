"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { InquiryResponse, User } from "@/types";
import { deleteInquiryResponse } from "@/lib/actions-inquiries";
import { Badge, EmptyState, IconButton } from "@/components/ui";

export default function InquiryResponseList({ responses, currentUser, inquiryId }: { responses: InquiryResponse[]; currentUser: User | null; inquiryId: string }) {
  const router = useRouter(); const [pending, startTransition] = useTransition();
  if (!responses.length) return <EmptyState title="Todavía no hay respuestas" description="La primera respuesta aparecerá aquí y la conversación se ordenará cronológicamente." />;
  return <ol className="space-y-4">{responses.map((response, index) => {
    const author = response.expand?.author; const staff = author?.role === "docente" || author?.role === "admin"; const canDelete = currentUser?.id === response.author || currentUser?.role === "docente" || currentUser?.role === "admin";
    return <li key={response.id}><article className="rounded-lg border bg-surface p-5"><header className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><span className="font-bold">{author?.name || "Usuario"}</span>{staff && <Badge variant="info">Equipo docente</Badge>}</div><p className="mt-1 text-xs text-muted">Respuesta {index + 1} · <time dateTime={response.created}>{formatDate(response.created)}</time></p></div>{canDelete && <IconButton label={`Eliminar respuesta de ${author?.name || "usuario"}`} disabled={pending} onClick={() => { if (!window.confirm("¿Eliminar esta respuesta?")) return; startTransition(async () => { await deleteInquiryResponse(response.id, inquiryId); router.refresh(); }); }}><span aria-hidden="true">×</span></IconButton>}</header><p className="mt-4 whitespace-pre-wrap text-sm leading-7">{response.content}</p></article></li>;
  })}</ol>;
}
function formatDate(value: string) { return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
