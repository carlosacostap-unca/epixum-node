import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import type { AcademicProgressStatus } from "@/lib/cohorts/progress";

export interface ProgressPeriod { id: string; label: string; detail?: string }
export interface ProgressCell { periodId: string; status: AcademicProgressStatus; completed: number; total: number; href?: string }
export interface ProgressRow { id: string; name: string; email?: string; href?: string; cells: ProgressCell[] }

export function ProgressMatrix({ periods, rows, emptyText = "No hay estudiantes que coincidan con los filtros." }: { periods: ProgressPeriod[]; rows: ProgressRow[]; emptyText?: string }) {
  if (!rows.length) return <Card><CardContent className="p-8 text-center text-muted">{emptyText}</CardContent></Card>;
  return <div className="min-w-0">
    <div className="hidden max-w-full overflow-x-auto rounded-lg border lg:block"><table className="min-w-full border-collapse text-sm"><thead><tr className="bg-surface-muted"><th className="sticky left-0 z-10 min-w-64 bg-surface-muted p-4 text-left">Estudiante</th>{periods.map(period => <th key={period.id} className="min-w-40 p-4 text-center"><span className="block">{period.label}</span>{period.detail && <span className="font-normal text-muted">{period.detail}</span>}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-t"><th scope="row" className="sticky left-0 z-10 bg-surface p-4 text-left"><StudentIdentity row={row} /></th>{periods.map(period => <td key={period.id} className="p-4 text-center"><ProgressValue cell={row.cells.find(cell => cell.periodId === period.id)} /></td>)}</tr>)}</tbody></table></div>
    <div className="grid gap-4 lg:hidden">{rows.map(row => <Card key={row.id}><CardContent className="p-5"><StudentIdentity row={row} /><dl className="mt-4 grid gap-3 sm:grid-cols-2">{periods.map(period => <div key={period.id} className="rounded-md bg-surface-muted p-3"><dt className="text-sm font-semibold">{period.label}</dt><dd className="mt-2"><ProgressValue cell={row.cells.find(cell => cell.periodId === period.id)} /></dd></div>)}</dl></CardContent></Card>)}</div>
  </div>;
}

function StudentIdentity({ row }: { row: ProgressRow }) { return <>{row.href ? <Link href={row.href} className="block font-semibold text-primary hover:underline">{row.name}</Link> : <span className="block font-semibold">{row.name}</span>}<span className="text-xs font-normal text-muted">{row.email}</span></>; }
function ProgressValue({ cell }: { cell?: ProgressCell }) {
  const value: ProgressCell = cell || { periodId: "", status: "empty", completed: 0, total: 0, href: undefined };
  const config = value.status === "complete" ? ["Completo", "success"] as const : value.status === "pending" ? ["Pendiente", "warning"] as const : ["Sin actividades", "neutral"] as const;
  const content = <><Badge variant={config[1]}>{config[0]}</Badge><p className="mt-1 text-xs text-muted">{value.completed}/{value.total} entregas</p></>;
  return value.href ? <Link href={value.href} className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">{content}<span className="sr-only">. Abrir evidencia</span></Link> : <div>{content}</div>;
}
