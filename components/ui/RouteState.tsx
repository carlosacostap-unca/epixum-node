import type { ReactNode } from "react";
import { LinkButton, Button } from "./Button";
import { Skeleton } from "./States";

export function RouteLoadingState({ label = "Cargando contenido" }: { label?: string }) {
  return <main className="mx-auto w-full max-w-[var(--content-wide)] space-y-6 px-4 py-8 lg:px-8" aria-busy="true" aria-label={label}>
    <span className="sr-only">{label}…</span>
    <Skeleton className="h-5 w-32" /><Skeleton className="h-10 w-2/3 max-w-xl" /><Skeleton className="h-5 w-full max-w-2xl" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-36" /><Skeleton className="h-36" /><Skeleton className="h-36" /></div>
  </main>;
}

export function RouteErrorState({ reset, title = "No pudimos cargar esta pantalla", description = "La información sigue segura. Reintentá la carga o volvé al inicio." }: { reset: () => void; title?: string; description?: ReactNode }) {
  return <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-4 py-12"><section role="alert" className="w-full rounded-lg border border-danger/30 bg-danger-soft p-6"><p className="text-sm font-semibold text-danger">Ocurrió un problema</p><h1 className="mt-2 text-2xl font-bold">{title}</h1><div className="mt-2 text-sm text-muted">{description}</div><div className="mt-6 flex flex-wrap gap-3"><Button onClick={reset}>Reintentar</Button><LinkButton href="/" variant="secondary">Volver al inicio</LinkButton></div></section></main>;
}

export function RouteNotFoundState({ title = "No encontramos esta pantalla", description = "Es posible que el contenido haya cambiado de lugar o que no tengas acceso dentro de esta cohorte." }: { title?: string; description?: ReactNode }) {
  return <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-4 py-12"><section className="w-full rounded-lg border bg-surface p-8 text-center"><p className="text-sm font-semibold text-primary">404</p><h1 className="mt-2 text-2xl font-bold">{title}</h1><div className="mx-auto mt-3 max-w-lg text-sm text-muted">{description}</div><div className="mt-6 flex justify-center"><LinkButton href="/cohorts">Ver mis cohortes</LinkButton></div></section></main>;
}
