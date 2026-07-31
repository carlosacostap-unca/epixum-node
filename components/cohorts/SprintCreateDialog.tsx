"use client";

import { useActionState, useState } from "react";
import { Alert, Button, Dialog, Input, Textarea } from "@/components/ui";
import { createCohortSprintAction } from "@/lib/cohorts/sprints";
import type { ActionResult } from "@/lib/cohorts/actions";

export default function SprintCreateDialog({ cohortId }: { cohortId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult | undefined, FormData>(async (previous, formData) => {
    const result = await createCohortSprintAction(cohortId, previous, formData);
    if (result.success) setOpen(false);
    return result;
  }, undefined);
  return <>
    <Button onClick={() => setOpen(true)}>Crear sprint</Button>
    <Dialog open={open} onOpenChange={setOpen} title="Crear sprint" description="Definí el período y el propósito general. El contenido se agrega después.">
      <form action={formAction} className="space-y-5">
        <Input name="title" label="Título" required maxLength={180} />
        <Textarea name="description" label="Descripción" rows={4} />
        <div className="grid gap-4 sm:grid-cols-2"><Input name="startDate" label="Fecha de inicio" type="date" /><Input name="endDate" label="Fecha de fin" type="date" /></div>
        {state && !state.success && <Alert variant="danger" title="No se pudo crear">{state.error}</Alert>}
        <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setOpen(false)} disabled={pending}>Cancelar</Button><Button type="submit" loading={pending}>Crear sprint</Button></div>
      </form>
    </Dialog>
  </>;
}
