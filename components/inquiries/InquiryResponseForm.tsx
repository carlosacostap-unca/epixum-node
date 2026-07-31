"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInquiryResponse } from "@/lib/actions-inquiries";
import { Alert, Button, Card, CardContent, Textarea } from "@/components/ui";

export default function InquiryResponseForm({ inquiryId }: { inquiryId: string }) {
  const [content, setContent] = useState(""); const [pending, setPending] = useState(false); const [error, setError] = useState<string | null>(null); const router = useRouter();
  async function submit(event: React.FormEvent) { event.preventDefault(); setError(null); if (content.trim().length < 2) return setError("Escribí una respuesta antes de enviar."); setPending(true); const result = await createInquiryResponse(inquiryId, content); setPending(false); if (!result.success) return setError(result.error || "No pudimos enviar la respuesta."); setContent(""); router.refresh(); }
  return <Card><CardContent className="p-5 sm:p-6"><form onSubmit={submit} className="space-y-4"><div><h3 className="font-bold">Agregar respuesta</h3><p className="mt-1 text-sm text-muted">Tu mensaje se sumará al final de la conversación.</p></div>{error && <Alert variant="danger">{error}</Alert>}<Textarea label="Respuesta" value={content} onChange={event => setContent(event.target.value)} placeholder="Escribí tu respuesta…" rows={4} required /><div className="flex justify-end"><Button type="submit" loading={pending} disabled={!content.trim()}>Responder</Button></div></form></CardContent></Card>;
}
