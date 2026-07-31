import { Alert } from "@/components/ui";
import type { EnrollmentStatus } from "@/types";

export default function EnrollmentStatusNotice({ status }: { status?: EnrollmentStatus }) {
  if (status !== "completed") return null;
  return <Alert variant="warning" title="Cursada finalizada">Podés consultar el historial de contenidos, pero no realizar nuevas entregas ni otras acciones de cursada.</Alert>;
}
