import Link from "next/link";
import EnrollmentRequestForm from "@/components/cohorts/EnrollmentRequestForm";
import { Alert, PageHeader } from "@/components/ui";
import { createAdminServerClient } from "@/lib/pocketbase-server";
import type { Cohort } from "@/types";

export const dynamic = "force-dynamic";

export default async function EnrollmentRequestPage() {
  const pb = await createAdminServerClient();
  const cohorts = await pb.collection("cohorts").getFullList<Cohort>({ filter: "mode = 'weekly' && status = 'active'", sort: "startDate,name" });
  return <main className="mx-auto min-h-screen max-w-[var(--content-form)] px-5 py-10 sm:px-8">
    <Link href="/login" className="text-sm font-semibold text-primary hover:text-primary-hover">← Volver al ingreso</Link>
    <PageHeader className="my-8" eyebrow="Acceso a la cursada" title="Solicitar matriculación" description="Completá tus datos para que el equipo docente pueda verificar tu identidad y asociarte a la cohorte correcta." />
    {cohorts.length > 0 ? <EnrollmentRequestForm cohorts={cohorts} /> : <Alert variant="warning" title="No hay cohortes abiertas">En este momento no hay cohortes semanales disponibles para solicitudes.</Alert>}
  </main>;
}
