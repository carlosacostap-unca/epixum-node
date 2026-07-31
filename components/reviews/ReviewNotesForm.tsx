"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Review } from "@/types";
import { updateReviewNotes } from "@/lib/actions-reviews";
import { Alert, Button, Input, Textarea } from "@/components/ui";

export default function ReviewNotesForm({ review }: { review: Review }) {
  const router = useRouter(); const [pending, startTransition] = useTransition(); const [privateNote, setPrivateNote] = useState(review.private_note || ""); const [publicNote, setPublicNote] = useState(review.public_note || ""); const [zoomLink, setZoomLink] = useState(review.zoomLink || ""); const [roomNumber, setRoomNumber] = useState(review.roomNumber || ""); const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  function save(event: React.FormEvent) { event.preventDefault(); setMessage(null); startTransition(async () => { const result = await updateReviewNotes(review.id, privateNote, publicNote, zoomLink, roomNumber); if (!result.success) return setMessage({ ok: false, text: result.error || "No pudimos guardar los cambios." }); setMessage({ ok: true, text: "Información actualizada correctamente." }); router.refresh(); }); }
  return <form onSubmit={save} className="space-y-6">{message && <Alert variant={message.ok ? "success" : "danger"}>{message.text}</Alert>}<fieldset className="grid gap-4 rounded-md border bg-surface-muted p-4 sm:grid-cols-2"><legend className="px-1 text-sm font-bold">Modalidad y acceso</legend><Input type="url" label="Enlace de videollamada" value={zoomLink} onChange={event => setZoomLink(event.target.value)} placeholder="https://meet.google.com/…" /><Input label="Sala o aula" value={roomNumber} onChange={event => setRoomNumber(event.target.value)} placeholder="Sala 3" /></fieldset><Textarea label="Nota privada" description="Visible sólo para docentes y administradores." value={privateNote} onChange={event => setPrivateNote(event.target.value)} rows={4} /><Textarea label="Retroalimentación para el estudiante" description="Este contenido sí será visible para el estudiante." value={publicNote} onChange={event => setPublicNote(event.target.value)} rows={6} /><div className="flex justify-end"><Button type="submit" loading={pending}>Guardar cambios</Button></div></form>;
}
