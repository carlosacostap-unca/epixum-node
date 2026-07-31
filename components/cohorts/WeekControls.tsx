"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteWeekAction, setWeekPublicationAction } from "@/lib/cohorts/weeks";

export default function WeekControls({ cohortId, weekId, published }: { cohortId: string; weekId: string; published: boolean }) {
  const [pending, start] = useTransition(); const [message, setMessage] = useState(""); const router = useRouter();
  const publication = () => start(async () => { const result = await setWeekPublicationAction(cohortId, weekId, !published); setMessage(result.success ? result.message || "" : result.error); router.refresh(); });
  const remove = () => { if (!window.confirm("¿Eliminar esta semana vacía? Esta acción no se puede deshacer.")) return; start(async () => { const result = await deleteWeekAction(cohortId, weekId, true); if (result.success) router.push(`/cohorts/${cohortId}/weeks`); else setMessage(result.error); }); };
  return <div className="flex flex-wrap items-center gap-3"><button disabled={pending} onClick={publication} className="rounded-lg bg-blue-600 px-4 py-2 text-white">{published ? "Volver a borrador" : "Publicar manualmente"}</button><button disabled={pending} onClick={remove} className="rounded-lg border border-red-300 px-4 py-2 text-red-600">Eliminar semana</button>{message && <span className="text-sm text-zinc-500">{message}</span>}</div>;
}
