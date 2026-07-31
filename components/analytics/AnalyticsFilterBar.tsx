"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/FormField";

export interface FilterOption { value: string; label: string }
export function AnalyticsFilterBar({ cohorts = [], currentCohortId, periods = [], showProgress = true, statuses = [], searchLabel = "Buscar estudiante", defaultStatus = "all" }: { cohorts?: FilterOption[]; currentCohortId?: string; periods?: FilterOption[]; showProgress?: boolean; statuses?: FilterOption[]; searchLabel?: string; defaultStatus?: string }) {
  const router = useRouter(); const pathname = usePathname(); const params = useSearchParams();
  const set = (key: string, value: string) => { const next = new URLSearchParams(params.toString()); if (!value || value === "all") next.delete(key); else next.set(key, value); next.delete("detail"); router.replace(`${pathname}${next.size ? `?${next}` : ""}`); };
  const switchCohort = (cohortId: string) => { const next = new URLSearchParams(params.toString()); next.delete("period"); next.delete("detail"); const destination = pathname.replace(/\/cohorts\/[^/]+/, `/cohorts/${cohortId}`); router.replace(`${destination}${next.size ? `?${next}` : ""}`); };
  return <div className="grid gap-4 rounded-lg border bg-surface p-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Filtros del tablero">
    {cohorts.length > 0 && <Select label="Cohorte" value={currentCohortId} onChange={(event) => switchCohort(event.target.value)}>{cohorts.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select>}
    <Input label={searchLabel} type="search" defaultValue={params.get("search") || ""} onBlur={(event) => set("search", event.target.value.trim())} onKeyDown={(event) => { if (event.key === "Enter") set("search", event.currentTarget.value.trim()); }} />
    {periods.length > 0 && <Select label="Período" value={params.get("period") || "all"} onChange={(event) => set("period", event.target.value)}><option value="all">Todos</option>{periods.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select>}
    {showProgress && <Select label="Progreso" value={params.get("progress") || "all"} onChange={(event) => set("progress", event.target.value)}><option value="all">Todos</option><option value="complete">Completo</option><option value="pending">Pendiente</option><option value="empty">Sin actividades</option></Select>}
    {statuses.length > 0 && <Select label="Estado" value={params.get("status") || defaultStatus} onChange={(event) => set("status", event.target.value)}><option value="all">Todos</option>{statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select>}
    {params.size > 0 && <Button variant="secondary" className="self-end" onClick={() => router.replace(pathname)}>Limpiar filtros</Button>}
  </div>;
}
