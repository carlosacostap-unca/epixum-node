"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import pb from "@/lib/pocketbase";
import type { Message, User } from "@/types";
import { Alert } from "@/components/ui/Alert";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function TeamChat({ teamId, currentUser }: { teamId: string; currentUser: User }) {
  const [messages, setMessages] = useState<Message[]>([]); const [draft, setDraft] = useState(""); const [loading, setLoading] = useState(true); const [sending, setSending] = useState(false); const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const fetchMessages = useCallback(async () => { try { const result = await pb.collection("messages").getList<Message>(1, 50, { filter: `team = "${teamId}"`, sort: "created", expand: "sender", requestKey: null }); setMessages(result.items); setError(""); } catch { setError("No pudimos actualizar los mensajes."); } finally { setLoading(false); } }, [teamId]);
  useEffect(() => { void fetchMessages(); const timer = window.setInterval(fetchMessages, 60000); return () => window.clearInterval(timer); }, [fetchMessages]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const send = async (event: React.FormEvent) => { event.preventDefault(); const text = draft.trim(); if (!text) return; setSending(true); setError(""); try { await pb.collection("messages").create({ text, sender: currentUser.id, team: teamId }); setDraft(""); await fetchMessages(); } catch { setError("El mensaje no se envió. Tu texto sigue disponible para reintentar."); } finally { setSending(false); } };
  return <Card className="flex h-[min(70dvh,42rem)] min-h-[30rem] min-w-0 flex-col overflow-hidden lg:sticky lg:top-6">
    <header className="flex items-center justify-between gap-3 border-b p-4"><div><h2 className="font-bold">Chat del equipo</h2><p className="text-xs text-muted">{messages.length ? `${messages.length} mensajes recientes` : "Conversación compartida"}</p></div><IconButton label="Actualizar mensajes" onClick={() => void fetchMessages()} disabled={loading}><span aria-hidden="true">↻</span></IconButton></header>
    {error && <Alert variant="danger" className="m-3">{error}</Alert>}
    <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain bg-surface-muted p-3 sm:p-4" aria-live="polite">
      {loading && !messages.length ? <p className="py-12 text-center text-sm text-muted">Cargando mensajes…</p> : !messages.length ? <div className="flex h-full flex-col items-center justify-center px-6 text-center"><p className="font-semibold">La conversación está vacía</p><p className="mt-1 text-sm text-muted">Podés iniciar la coordinación con un saludo.</p></div> : messages.map((message) => { const mine = message.sender === currentUser.id; return <article key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] rounded-xl px-3 py-2 shadow-sm ${mine ? "bg-primary text-white" : "border bg-surface"}`}>{!mine && <p className="mb-1 text-xs font-bold text-muted">{message.expand?.sender?.name || "Integrante"}</p>}<p className="break-words whitespace-pre-wrap text-sm">{message.text}</p><time className={`mt-1 block text-[11px] ${mine ? "text-white/75" : "text-muted"}`}>{new Date(message.created).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</time></div></article>; })}
      <div ref={endRef} />
    </div>
    <form onSubmit={send} className="sticky bottom-0 flex items-end gap-2 border-t bg-surface p-3"><label className="min-w-0 flex-1"><span className="sr-only">Mensaje</span><textarea rows={2} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="Escribí un mensaje…" className="max-h-32 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label><Button type="submit" loading={sending} disabled={!draft.trim()} aria-label="Enviar mensaje">Enviar</Button></form>
  </Card>;
}
