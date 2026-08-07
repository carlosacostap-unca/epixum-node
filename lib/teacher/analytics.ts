import type { ProgressRow } from "@/components/analytics/ProgressMatrix";
import type { AnalyticsProgress } from "@/lib/analytics";
import { matchesSearch } from "@/lib/analytics";

export function isCompleteProgressRow(row: ProgressRow) { const applicable = row.cells.filter(cell => cell.total > 0); return applicable.length > 0 && applicable.every(cell => cell.status === "complete"); }
export function isAttentionProgressRow(row: ProgressRow) { return row.cells.some(cell => cell.total > 0 && cell.status === "pending"); }

export function teacherProgressPopulation(rows: ProgressRow[], input: { search?: string; progress?: AnalyticsProgress; detail?: string; followUpIds?: Set<string> }) {
  const segment = rows.filter(row => matchesSearch([row.name, row.email], input.search || "")).filter(row => !input.progress || input.progress === "all" || row.cells.some(cell => cell.status === input.progress));
  const followUpIds = input.followUpIds || new Set<string>();
  const detailRows = segment.filter(row => input.detail === "complete" ? isCompleteProgressRow(row) : input.detail === "attention" ? isAttentionProgressRow(row) : input.detail === "follow-up" ? followUpIds.has(row.id) : true);
  return { segment, detailRows, complete: segment.filter(isCompleteProgressRow).length, attention: segment.filter(isAttentionProgressRow).length, followUp: segment.filter(row => followUpIds.has(row.id)).length };
}

