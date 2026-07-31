"use client";

import { useActionState } from "react";
import type { Cohort } from "@/types";
import { registerStudentAction, type ActionResult } from "@/lib/cohorts/actions";

export default function AdmissionForm({ cohorts, selectedCohort }: { cohorts: Cohort[]; selectedCohort?: string }) {
  const [state, action, pending] = useActionState<ActionResult | undefined, FormData>(registerStudentAction, undefined);
  return (
    <form action={action} className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-2">
      <label className="space-y-1"><span className="text-sm font-medium">Nombre completo</span><input name="displayName" required className="w-full rounded-lg border p-2 dark:bg-zinc-950" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Correo de Google</span><input name="email" type="email" required className="w-full rounded-lg border p-2 dark:bg-zinc-950" /></label>
      <label className="space-y-1"><span className="text-sm font-medium">Cohorte</span><select name="cohortId" defaultValue={selectedCohort} required className="w-full rounded-lg border p-2 dark:bg-zinc-950">{cohorts.map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.name}</option>)}</select></label>
      <label className="space-y-1"><span className="text-sm font-medium">Condición</span><select name="entryType" defaultValue="new" className="w-full rounded-lg border p-2 dark:bg-zinc-950"><option value="new">Alumno nuevo</option><option value="repeater">Recursante</option></select></label>
      <div className="md:col-span-2 flex items-center gap-4"><button disabled={pending} className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-60">{pending ? "Registrando…" : "Registrar alumno"}</button>{state && <p className={state.success ? "text-sm text-green-600" : "text-sm text-red-600"}>{state.success ? state.message : state.error}</p>}</div>
    </form>
  );
}
