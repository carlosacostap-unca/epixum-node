import ContentBaseManager from "@/components/content/ContentBaseManager";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/cohorts/access";
import { getContentBaseDetails, listContentBases } from "@/lib/content/template-actions";

export const dynamic = "force-dynamic";
export default async function ContentBasesPage({ searchParams }: { searchParams: Promise<{ base?: string }> }) {
  await requireAdmin();
  const query = await searchParams;
  const bases = await listContentBases();
  const selected = query.base ? await getContentBaseDetails(query.base) : undefined;
  return <main className="space-y-8"><PageHeader eyebrow="Administración" title="Bases de contenido" description="Versiones reutilizables de cursos, semanas y secciones. Las copias existentes nunca se actualizan automáticamente." /><ContentBaseManager bases={bases} selected={selected} /></main>;
}
