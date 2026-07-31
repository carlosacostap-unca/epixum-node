"use client";

import { useActionState } from "react";
import type { Week } from "@/types";
import type { ActionResult } from "@/lib/cohorts/actions";

export default function WeekForm({ action, week }: { action: (state: ActionResult | undefined, formData: FormData) => Promise<ActionResult>; week?: Week }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return <form action={formAction} className="grid gap-3 rounded-xl border p-5 md:grid-cols-2"><label className="space-y-1"><span className="text-sm font-medium">Número</span><input name="number" type="number" min="1" required defaultValue={week?.number} className="w-full rounded-lg border p-2 dark:bg-zinc-950" /></label><label className="space-y-1"><span className="text-sm font-medium">Título</span><input name="title" required defaultValue={week?.title} className="w-full rounded-lg border p-2 dark:bg-zinc-950" /></label><label className="space-y-1"><span className="text-sm font-medium">Inicio (informativo)</span><input name="startDate" type="date" defaultValue={week?.startDate?.slice(0, 10)} className="w-full rounded-lg border p-2 dark:bg-zinc-950" /></label><label className="space-y-1"><span className="text-sm font-medium">Fin (informativo)</span><input name="endDate" type="date" defaultValue={week?.endDate?.slice(0, 10)} className="w-full rounded-lg border p-2 dark:bg-zinc-950" /></label><label className="space-y-1 md:col-span-2"><span className="text-sm font-medium">Descripción</span><textarea name="description" rows={3} defaultValue={week?.description} className="w-full rounded-lg border p-2 dark:bg-zinc-950" /></label><div className="md:col-span-2 flex gap-3"><button disabled={pending} className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60">{pending ? "Guardando…" : week ? "Guardar" : "Crear semana"}</button>{state && <p className={state.success ? "text-sm text-green-600" : "text-sm text-red-600"}>{state.success ? state.message : state.error}</p>}</div></form>;
}
