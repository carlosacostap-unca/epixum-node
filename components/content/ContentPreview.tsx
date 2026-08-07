import type { ContentSection } from "@/types";
import type { PublicContentRevision } from "@/lib/content/projection";
import { Alert, Badge, LinkButton } from "@/components/ui";
import ContentBlockRenderer from "./ContentBlockRenderer";

export default function ContentPreview({ cohortId, weekId, section, revision, assetUrls = {}, backHref }: { cohortId: string; weekId: string; section: ContentSection; revision: PublicContentRevision; assetUrls?: Record<string, string>; backHref: string }) {
  return <main className="mx-auto w-full max-w-[var(--content-reading)] px-4 pb-24 pt-8 lg:px-8">
    <div className="sticky top-3 z-30 mb-7 flex flex-wrap items-center gap-3 rounded-lg border border-info/30 bg-info-soft/95 p-3 shadow-lg backdrop-blur"><Badge variant="info">Vista previa como alumno</Badge><p className="mr-auto text-sm text-info">No publica contenido ni registra avance.</p><LinkButton size="sm" variant="secondary" href={backHref}>Volver al editor</LinkButton></div>
    <header className="mb-8"><p className="text-sm font-bold uppercase tracking-wide text-primary">Vista previa · Revisión {revision.revisionNumber}</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{section.title}</h1>{section.summary && <p className="mt-3 text-lg leading-8 text-muted">{section.summary.replace(/<[^>]*>/g, " ")}</p>}</header>
    <Alert variant="info" title="Modo de prueba">Las actividades se muestran sin enviar respuestas. Volvé al editor para modificar su configuración.</Alert>
    <div className="mt-8 space-y-8"><ContentBlockRenderer blocks={revision.blocks} assetUrls={assetUrls} preview /></div>
    <footer className="mt-10 border-t pt-5 text-sm text-muted"><LinkButton variant="ghost" href={`/cohorts/${cohortId}/weeks/${weekId}?section=content`}>Volver a los contenidos</LinkButton></footer>
  </main>;
}
