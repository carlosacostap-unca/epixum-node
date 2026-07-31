"use client";
import { useState, useTransition } from "react";
import { enrollAllStudentsAction } from "@/lib/cohorts/actions";
import { Alert, Button, ConfirmationDialog } from "@/components/ui";

export default function BulkEnrollmentControl({ cohortId, candidates }: { cohortId: string; candidates: Array<{ id: string; name: string; email: string }> }) {
  const [open, setOpen] = useState(false); const [pending, startTransition] = useTransition(); const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const confirm = () => startTransition(async () => { const response = await enrollAllStudentsAction(cohortId); setResult({ ok: response.success, text: response.success ? response.message || "Matriculación completada." : response.error }); setOpen(false); });
  return <div className="space-y-3"><Button type="button" variant="secondary" onClick={() => setOpen(true)} disabled={!candidates.length}>Revisar matriculación masiva</Button>{result && <Alert variant={result.ok ? "success" : "danger"}>{result.text}</Alert>}<ConfirmationDialog open={open} onOpenChange={setOpen} title="Confirmar matriculación masiva" confirmLabel={`Matricular ${candidates.length}`} confirmVariant="primary" busy={pending} onConfirm={confirm} description={<div><p>Se crearán matrículas de recursante únicamente para estudiantes sin una matrícula previa en esta cohorte.</p><p className="mt-3 font-semibold text-foreground">Vista previa ({candidates.length})</p><ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">{candidates.slice(0, 10).map((student) => <li key={student.id}>{student.name || student.email}</li>)}</ul>{candidates.length > 10 && <p className="mt-2">y {candidates.length - 10} estudiantes más.</p>}</div>} /></div>;
}
