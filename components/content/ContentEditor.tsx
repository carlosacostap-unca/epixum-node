"use client";
/* eslint-disable @next/next/no-img-element -- External author URLs are intentionally previewed without the configured optimizer. */

import { useMemo, useState, useTransition } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ContentBlock } from "@/lib/content/domain";
import { contentBlockSchema, contentBlocksSchema } from "@/lib/content/domain";
import { contentBlockLabels, createContentBlock, uniqueContentKey } from "@/lib/content/block-factory";
import { saveContentRevisionAction } from "@/lib/content/actions";
import { uploadContentAssetAction } from "@/lib/content/actions";
import { Alert, Button, Card, CardContent, Input, LinkButton, Select, Textarea } from "@/components/ui";
import ContentRichTextEditor from "./ContentRichTextEditor";

export default function ContentEditor({ cohortId, weekId, sectionId, title, status, revisionId, revisionNumber, initialBlocks }: { cohortId: string; weekId: string; sectionId: string; title: string; status: "draft" | "scheduled" | "published" | "hidden"; revisionId: string; revisionNumber: number; initialBlocks: ContentBlock[] }) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedType, setSelectedType] = useState<ContentBlock["type"]>("rich_text");
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [currentRevision, setCurrentRevision] = useState(revisionId);
  const [currentNumber, setCurrentNumber] = useState(revisionNumber);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const ids = useMemo(() => blocks.map((block) => block.key), [blocks]);

  const update = (key: string, block: ContentBlock) => setBlocks((current) => current.map((item) => item.key === key ? block : item));
  const move = (key: string, direction: -1 | 1) => setBlocks((current) => { const from = current.findIndex((item) => item.key === key); const to = from + direction; return to < 0 || to >= current.length ? current : arrayMove(current, from, to); });
  const dragEnd = ({ active, over }: DragEndEvent) => { if (!over || active.id === over.id) return; setBlocks((current) => arrayMove(current, current.findIndex((item) => item.key === active.id), current.findIndex((item) => item.key === over.id))); };
  const add = () => setBlocks((current) => [...current, createContentBlock(selectedType)]);
  const duplicate = (block: ContentBlock) => { const key = uniqueContentKey(block.type); setBlocks((current) => [...current.slice(0, current.findIndex((item) => item.key === block.key) + 1), { ...structuredClone(block), key, ...( "activityKey" in block ? { activityKey: `${key}_activity` } : {}) } as ContentBlock, ...current.slice(current.findIndex((item) => item.key === block.key) + 1)]); };

  const save = () => {
    const parsed = contentBlocksSchema.safeParse(blocks);
    if (!parsed.success) return setMessage({ kind: "error", text: parsed.error.issues.map((issue) => `${issue.path.join(".") || "Contenido"}: ${issue.message}`).join(" · ") });
    if (status === "published" && !window.confirm("Esta sección está publicada. Al guardar, el cambio aparecerá inmediatamente para los alumnos. ¿Continuar?")) return;
    startTransition(async () => {
      const result = await saveContentRevisionAction(cohortId, weekId, sectionId, currentRevision, { blocks: parsed.data });
      if (!result.success) return setMessage({ kind: "error", text: result.error });
      setCurrentRevision(result.data.revisionId); setCurrentNumber(result.data.revisionNumber);
      setMessage({ kind: "success", text: result.message ?? "Cambios guardados." });
    });
  };

  return <div className="space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm text-muted">Revisión {currentNumber}</p><h1 className="text-2xl font-bold">{title}</h1></div><div className="flex flex-wrap gap-2"><LinkButton variant="secondary" href={`/cohorts/${cohortId}/weeks/${weekId}/content/${sectionId}/edit?preview=1`}>Vista previa</LinkButton><Button onClick={save} loading={pending}>Guardar</Button></div></div>
    {message && <Alert variant={message.kind === "error" ? "danger" : "success"} title={message.kind === "error" ? "No se pudo guardar" : "Contenido guardado"}>{message.text}</Alert>}
    <Card><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end"><Select label="Tipo de bloque" containerClassName="flex-1" value={selectedType} onChange={(event) => setSelectedType(event.target.value as ContentBlock["type"])}>{Object.entries(contentBlockLabels).map(([type, label]) => <option key={type} value={type}>{label}</option>)}</Select><Button onClick={add}>Agregar bloque</Button></CardContent></Card>
    <DndContext id={`content-editor-${sectionId}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}><SortableContext items={ids} strategy={verticalListSortingStrategy}><ol className="space-y-4" aria-label="Bloques de contenido ordenables">{blocks.map((block, index) => <SortableBlock key={block.key} cohortId={cohortId} weekId={weekId} block={block} number={index + 1} total={blocks.length} onUpdate={(next) => update(block.key, next)} onMove={(direction) => move(block.key, direction)} onDuplicate={() => duplicate(block)} onRemove={() => blocks.length > 1 ? setBlocks((current) => current.filter((item) => item.key !== block.key)) : setMessage({ kind: "error", text: "La sección debe conservar al menos un bloque." })} />)}</ol></SortableContext></DndContext>
    <div className="sticky bottom-3 flex justify-end rounded-lg border bg-surface/95 p-3 shadow-lg backdrop-blur"><Button onClick={save} loading={pending}>Guardar revisión</Button></div>
  </div>;
}

function SortableBlock({ cohortId, weekId, block, number, total, onUpdate, onMove, onDuplicate, onRemove }: { cohortId: string; weekId: string; block: ContentBlock; number: number; total: number; onUpdate: (block: ContentBlock) => void; onMove: (direction: -1 | 1) => void; onDuplicate: () => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.key });
  return <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={isDragging ? "opacity-60" : undefined}><Card><div className="flex flex-wrap items-center gap-2 border-b p-3"><button type="button" className="min-h-11 min-w-11 cursor-grab rounded-md border bg-surface-muted" aria-label={`Arrastrar bloque ${number}: ${contentBlockLabels[block.type]}`} {...attributes} {...listeners}>⋮⋮</button><div className="mr-auto"><p className="text-xs font-bold uppercase tracking-wide text-muted">Bloque {number}</p><h2 className="font-bold">{contentBlockLabels[block.type]}</h2></div><Button size="sm" variant="ghost" onClick={() => onMove(-1)} disabled={number === 1} aria-label="Subir bloque">↑</Button><Button size="sm" variant="ghost" onClick={() => onMove(1)} disabled={number === total} aria-label="Bajar bloque">↓</Button><Button size="sm" variant="ghost" onClick={onDuplicate}>Duplicar</Button><Button size="sm" variant="danger" onClick={onRemove}>Eliminar</Button></div><CardContent><BlockConfiguration cohortId={cohortId} weekId={weekId} block={block} onUpdate={onUpdate} /></CardContent></Card></li>;
}

function BlockConfiguration({ cohortId, weekId, block, onUpdate }: { cohortId: string; weekId: string; block: ContentBlock; onUpdate: (block: ContentBlock) => void }) {
  if (block.type === "rich_text") return <ContentRichTextEditor value={block.content} onChange={(content) => onUpdate({ ...block, content })} />;
  if (block.type === "code") return <div className="grid gap-3"><Input label="Título" value={block.title ?? ""} onChange={(event) => onUpdate({ ...block, title: event.target.value })} /><Input label="Lenguaje" value={block.language} onChange={(event) => onUpdate({ ...block, language: event.target.value })} /><Textarea label="Código" value={block.code} onChange={(event) => onUpdate({ ...block, code: event.target.value })} className="min-h-52 font-mono" spellCheck={false} /></div>;
  if (block.type === "image" || block.type === "video") return <MediaBlockConfiguration cohortId={cohortId} weekId={weekId} block={block} onUpdate={onUpdate} />;
  return <JsonBlockConfiguration block={block} onUpdate={onUpdate} />;
}

function MediaBlockConfiguration({ cohortId, weekId, block, onUpdate }: { cohortId: string; weekId: string; block: Extract<ContentBlock, { type: "image" | "video" }>; onUpdate: (block: ContentBlock) => void }) {
  const [uploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState("");
  const externalUrl = block.source.externalUrl ?? "";
  const accessibleText = block.type === "image" ? block.alt : block.title;
  const upload = (file?: File) => { if (!file) return; startUpload(async () => { const result = await uploadContentAssetAction(cohortId, weekId, { kind: block.type, file, ...(block.type === "image" ? { alt: block.alt } : { title: block.title }) }); if (!result.success) return setUploadError(result.error); onUpdate({ ...block, source: { assetId: result.data.asset.id } }); setUploadError(""); }); };
  return <div className="grid gap-4">
    <Input label={block.type === "image" ? "Texto alternativo" : "Título accesible"} value={accessibleText} onChange={(event) => onUpdate(block.type === "image" ? { ...block, alt: event.target.value } : { ...block, title: event.target.value })} required />
    <Input label="URL externa HTTPS" type="url" value={externalUrl} placeholder={block.type === "image" ? "https://…/imagen.webp" : "https://…/video.mp4"} onChange={(event) => onUpdate({ ...block, source: { externalUrl: event.target.value } })} description="Podés usar una URL externa o subir un archivo; la última opción elegida reemplaza a la anterior." />
    <Input label="Subir archivo" type="file" accept={block.type === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "video/mp4,video/webm"} disabled={uploading} onChange={(event) => upload(event.target.files?.[0])} description={block.type === "image" ? "JPG, PNG, WebP o GIF; máximo 10 MB." : "MP4 o WebM; máximo 100 MB."} />
    {block.source.assetId && <p className="text-sm text-success">Archivo subido y vinculado: {block.source.assetId}</p>}{uploadError && <p role="alert" className="text-sm text-danger">{uploadError}</p>}
    {externalUrl && <div className="rounded-md border bg-surface-muted p-3"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Previsualización</p>{block.type === "image" ? <img src={externalUrl} alt={block.alt} className="max-h-72 rounded-md object-contain" /> : <video src={externalUrl} controls className="max-h-72 w-full rounded-md" aria-label={block.title} />}</div>}
  </div>;
}

function JsonBlockConfiguration({ block, onUpdate }: { block: Exclude<ContentBlock, { type: "rich_text" | "code" }>; onUpdate: (block: ContentBlock) => void }) {
  const [draft, setDraft] = useState(() => JSON.stringify(Object.fromEntries(Object.entries(block).filter(([name]) => name !== "key" && name !== "type")), null, 2));
  const [error, setError] = useState("");
  const apply = () => { try { const parsed = JSON.parse(draft); const result = contentBlockSchema.parse({ key: block.key, type: block.type, ...parsed }); onUpdate(result); setError(""); } catch (cause) { setError(cause instanceof Error ? cause.message : "La configuración no es válida."); } };
  return <div><Textarea label={`Configuración de ${contentBlockLabels[block.type]} (JSON)`} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={apply} className="min-h-56 font-mono text-xs" spellCheck={false} /><div className="mt-2 flex items-center justify-between gap-3"><p className="text-xs text-muted">La clave estable del bloque es <code>{block.key}</code>.</p><Button size="sm" variant="secondary" onClick={apply}>Validar configuración</Button></div>{error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}</div>;
}
