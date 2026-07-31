"use client";

import { useActionState } from "react";
import type { Cohort } from "@/types";
import type { ActionResult } from "@/lib/cohorts/actions";

export default function CohortForm({ action, cohort }: {
  action: (state: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
  cohort?: Cohort;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-2">
      <label className="space-y-1"><span className="text-sm font-medium">Nombre</span><input name="name" required defaultValue={cohort?.name} className="w-full rounded-lg border p-2 dark:bg-zinc-950" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Identificador</span><input name="slug" required defaultValue={cohort?.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className="w-full rounded-lg border p-2 dark:bg-zinc-950" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Modalidad</span><select name="mode" defaultValue={cohort?.mode || "weekly"} className="w-full rounded-lg border p-2 dark:bg-zinc-950"><option value="weekly">Por semanas</option><option value="sprints_and_teams">Sprints y equipos</option></select></label>
      <label className="space-y-1"><span className="text-sm font-medium">Estado</span><select name="status" defaultValue={cohort?.status || "active"} className="w-full rounded-lg border p-2 dark:bg-zinc-950"><option value="active">Activa</option><option value="archived">Archivada</option></select></label>
      <label className="space-y-1"><span className="text-sm font-medium">Inicio</span><input name="startDate" type="date" defaultValue={cohort?.startDate?.slice(0, 10)} className="w-full rounded-lg border p-2 dark:bg-zinc-950" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Fin</span><input name="endDate" type="date" defaultValue={cohort?.endDate?.slice(0, 10)} className="w-full rounded-lg border p-2 dark:bg-zinc-950" /></label>
      <div className="md:col-span-2 flex items-center gap-4"><button disabled={pending} className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-60">{pending ? "Guardando…" : cohort ? "Guardar cambios" : "Crear cohorte"}</button>{state && <p className={state.success ? "text-sm text-green-600" : "text-sm text-red-600"}>{state.success ? state.message : state.error}</p>}</div>
    </form>
  );
}
