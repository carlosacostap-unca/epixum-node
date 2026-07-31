import { Skeleton } from "@/components/ui";

export default function AcademicLoadingState() {
  return <main className="mx-auto w-full max-w-[var(--content-reading)] space-y-6 px-4 py-8 lg:px-8" role="status" aria-live="polite">
    <span className="sr-only">Cargando contenido académico</span>
    <Skeleton className="h-4 w-40" /><Skeleton className="h-10 w-2/3" />
    <div className="grid gap-4"><Skeleton className="h-36 w-full" /><Skeleton className="h-36 w-full" /><Skeleton className="h-36 w-full" /></div>
  </main>;
}
