"use client";

import { useActionState } from "react";
import { Alert, Badge, Button, Card, CardContent, Input, LinkButton, Select } from "@/components/ui";
import { createEnrollmentRequestAction, type EnrollmentRequestActionResult } from "@/lib/cohorts/enrollment-request-actions";
import type { Cohort } from "@/types";

export default function EnrollmentRequestForm({ cohorts }: { cohorts: Cohort[] }) {
  const [state, action, pending] = useActionState<EnrollmentRequestActionResult | undefined, FormData>(createEnrollmentRequestAction, undefined);
  if (state?.success) return <Card className="border-success/30"><CardContent className="p-7 sm:p-8"><Badge variant="success">Solicitud enviada</Badge><h2 className="mt-4 text-2xl font-bold">Recibimos tu solicitud</h2><p className="mt-3 leading-7 text-muted">{state.message}</p><ol className="mt-5 grid gap-3 text-sm"><li className="rounded-md bg-surface-muted p-3"><strong>1.</strong> El equipo docente verificará tus datos.</li><li className="rounded-md bg-surface-muted p-3"><strong>2.</strong> Cuando tu acceso esté habilitado, podrás ingresar con el correo informado.</li></ol><LinkButton href="/login" className="mt-6">Volver al ingreso</LinkButton></CardContent></Card>;

  return <form action={action} className="space-y-6" aria-describedby="request-privacy">
    <Card><CardContent className="space-y-5 p-6 sm:p-7"><fieldset><legend className="text-lg font-bold">1. Identidad</legend><p className="mt-1 text-sm text-muted">Usaremos estos datos para comprobar tu registro académico.</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><Input name="firstName" label="Nombre" autoComplete="given-name" required maxLength={80} /><Input name="lastName" label="Apellido" autoComplete="family-name" required maxLength={80} /><Input name="dni" label="DNI" inputMode="numeric" autoComplete="off" required maxLength={20} /><Input name="birthDate" label="Fecha de nacimiento" type="date" autoComplete="bday" required /></div></fieldset></CardContent></Card>
    <Card><CardContent className="space-y-5 p-6 sm:p-7"><fieldset><legend className="text-lg font-bold">2. Contacto</legend><p className="mt-1 text-sm text-muted">Informá un medio vigente por si necesitamos resolver una coincidencia.</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><Input name="email" label="Correo actual de Google" type="email" autoComplete="email" required description="Debe ser el mismo correo con el que ingresarás a la plataforma." /><Input name="phone" label="Teléfono de contacto" type="tel" autoComplete="tel" required maxLength={50} /></div></fieldset></CardContent></Card>
    <Card><CardContent className="space-y-5 p-6 sm:p-7"><fieldset><legend className="text-lg font-bold">3. Cursada</legend><p className="mt-1 text-sm text-muted">Seleccioná la cohorte a la que necesitás acceder.</p><Select name="cohortId" label="Cohorte" required defaultValue={cohorts.length === 1 ? cohorts[0].id : ""} containerClassName="mt-5"><option value="" disabled>Seleccioná una cohorte</option>{cohorts.map(cohort => <option key={cohort.id} value={cohort.id}>{cohort.name}</option>)}</Select></fieldset></CardContent></Card>
    <label className="hidden" aria-hidden="true">Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label>
    {state && !state.success && <Alert variant="danger" title="Revisá la solicitud">{state.error}</Alert>}
    <div className="flex flex-col gap-4 rounded-lg border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"><p id="request-privacy" className="max-w-xl text-sm leading-6 text-muted">El equipo docente utilizará estos datos únicamente para verificar tu identidad y resolver la matriculación.</p><Button type="submit" loading={pending} size="lg" className="shrink-0">{pending ? "Enviando…" : "Enviar solicitud"}</Button></div>
  </form>;
}
