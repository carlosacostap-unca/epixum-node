"use client";

import { useRouter } from "next/navigation";
import type { Cohort } from "@/types";

export default function CohortSelector({ cohorts, currentId }: { cohorts: Cohort[]; currentId?: string }) {
  const router = useRouter();
  return <select aria-label="Seleccionar cohorte" value={currentId || ""} onChange={(event) => event.target.value && router.push(`/cohorts/${event.target.value}`)} className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"><option value="" disabled>Seleccionar cohorte</option>{cohorts.map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.name}</option>)}</select>;
}
