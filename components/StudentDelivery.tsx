"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDelivery, updateDelivery } from "@/lib/actions";
import { validateRepositoryUrl } from "@/lib/deliveries/validation";
import type { Delivery } from "@/types";
import { Alert, Badge, Button, Card, CardContent, CardHeader, Input } from "@/components/ui";

interface StudentDeliveryProps {
  assignmentId: string;
  delivery: Delivery | null;
  canEdit?: boolean;
}

export default function StudentDelivery({ assignmentId, delivery, canEdit = true }: StudentDeliveryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [url, setUrl] = useState(delivery?.repositoryUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const isDelivered = Boolean(delivery);

  function startEditing() {
    setError(null);
    setFieldError(null);
    setSuccess(null);
    setUrl(delivery?.repositoryUrl || "");
    setIsEditing(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldError(null);
    setSuccess(null);

    const validation = validateRepositoryUrl(url);
    if (!validation.success) {
      setFieldError(validation.error);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("assignmentId", assignmentId);
    formData.append("repositoryUrl", validation.value);

    try {
      const result = delivery
        ? await updateDelivery(delivery.id, formData)
        : await createDelivery(formData);

      if (result.success) {
        setUrl(validation.value);
        setIsEditing(false);
        setSuccess(result.message);
        router.refresh();
      } else {
        const repositoryError = "fieldErrors" in result ? result.fieldErrors?.repositoryUrl : undefined;
        setFieldError(repositoryError || null);
        if (!repositoryError) setError(result.error || "No pudimos guardar la entrega.");
      }
    } catch {
      setError("Ocurrió un error inesperado. Revisá los datos e intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-labelledby="student-delivery-heading">
      <Card className={isDelivered ? "border-success/30" : "border-warning/30"}>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">Próximo paso</p>
            <h2 id="student-delivery-heading" className="mt-1 text-2xl font-bold">Mi entrega</h2>
          </div>
          <Badge variant={isDelivered ? "success" : "warning"} role="status">
            {isDelivered ? "Entregada" : "Pendiente"}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-5 p-5 sm:p-6">
          {success && <Alert variant="success" title={success}>El estado de este trabajo ya fue actualizado.</Alert>}

          {!isEditing && (
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="min-w-0">
                {delivery ? (
                  <>
                    <p className="font-semibold">Tu entrega está registrada</p>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      Podés consultar el repositorio enviado y actualizarlo si necesitás corregir el enlace.
                    </p>
                    <dl className="mt-4 grid gap-3 rounded-md bg-surface-muted p-4 text-sm">
                      <div>
                        <dt className="font-semibold text-muted">Repositorio</dt>
                        <dd className="mt-1 min-w-0">
                          <a href={delivery.repositoryUrl} target="_blank" rel="noopener noreferrer" className="block truncate font-medium text-primary underline-offset-4 hover:underline">
                            {delivery.repositoryUrl}
                            <span className="sr-only"> (abre en una pestaña nueva)</span>
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-muted">Fecha de entrega</dt>
                        <dd className="mt-1">{formatDeliveryDate(delivery.created)}</dd>
                      </div>
                    </dl>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">Todavía no realizaste esta entrega</p>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      Prepará la URL de un repositorio público o accesible para el equipo docente.
                    </p>
                  </>
                )}
              </div>

              {canEdit && (
                <Button size="lg" onClick={startEditing} className="w-full md:w-auto">
                  {isDelivered ? "Actualizar entrega" : "Realizar entrega"}
                </Button>
              )}
            </div>
          )}

          {!canEdit && (
            <Alert variant="warning" title="Cursada finalizada">
              Esta entrega forma parte de tu historial y ya no admite modificaciones.
            </Alert>
          )}

          {isEditing && canEdit && (
            <form onSubmit={handleSubmit} className="space-y-5 rounded-md border bg-surface-muted p-4 sm:p-5">
              <div>
                <h3 className="font-bold">{delivery ? "Actualizar entrega" : "Realizar entrega"}</h3>
                <p className="mt-1 text-sm text-muted">Ingresá el enlace completo del repositorio correspondiente a este trabajo.</p>
              </div>

              {error && <Alert variant="danger" title="No pudimos guardar la entrega">{error}</Alert>}

              <Input
                id="repository-url"
                type="text"
                inputMode="url"
                label="URL del repositorio"
                description="El repositorio debe ser público o accesible para el equipo docente."
                error={fieldError}
                placeholder="https://github.com/usuario/repositorio"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  if (fieldError) setFieldError(null);
                }}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoFocus
                required
              />

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={() => {
                  setIsEditing(false);
                  setError(null);
                  setFieldError(null);
                  setUrl(delivery?.repositoryUrl || "");
                }}>Cancelar</Button>
                <Button type="submit" loading={loading}>{delivery ? "Guardar actualización" : "Confirmar entrega"}</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function formatDeliveryDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeStyle: "short" }).format(new Date(value));
}
