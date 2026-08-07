"use client";
/* eslint-disable @next/next/no-img-element -- Runtime external media cannot use the configured Next image optimizer. */

import { useState } from "react";
import dynamic from "next/dynamic";
import type { PublicContentBlock } from "@/lib/content/projection";
import type { RichTextNode } from "@/lib/content/domain";
import { Alert, Button, Card, CardContent, Input } from "@/components/ui";
import { buttonStyles } from "@/components/ui/Button";
import { submitContentActivityAction } from "@/lib/content/learning-actions";

export interface LearningContext { cohortId: string; weekId: string; sectionId: string; revisionId: string }

const HighlightedCode = dynamic(() => import("./HighlightedCode"));

export default function ContentBlockRenderer({ blocks, preview = false, assetUrls = {}, learningContext, onSectionCompleted }: { blocks: PublicContentBlock[]; preview?: boolean; assetUrls?: Record<string, string>; learningContext?: LearningContext; onSectionCompleted?: () => void }) {
  return <>{blocks.map((block) => <section key={block.key} id={`block-${block.key}`} data-block-key={block.key} className="scroll-mt-28"><Block block={block} preview={preview} assetUrls={assetUrls} learningContext={learningContext} onSectionCompleted={onSectionCompleted} /></section>)}</>;
}

function Block({ block, preview, assetUrls, learningContext, onSectionCompleted }: { block: PublicContentBlock; preview: boolean; assetUrls: Record<string, string>; learningContext?: LearningContext; onSectionCompleted?: () => void }) {
  switch (block.type) {
    case "rich_text": return <div className="prose dark:prose-invert max-w-none">{renderRichNodes(block.content.content ?? [])}</div>;
    case "callout": return <Alert variant={block.tone === "neutral" ? "info" : block.tone} title={block.title}>{block.eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-wide">{block.eyebrow}</p>}<div className="prose prose-sm dark:prose-invert">{renderRichNodes(block.body.content ?? [])}</div></Alert>;
    case "cards": return <div><OptionalHeading>{block.title}</OptionalHeading><div className={`grid gap-4 ${block.columns === 3 ? "md:grid-cols-3" : block.columns === 2 ? "md:grid-cols-2" : ""}`}>{block.items.map((item) => <Card key={item.key}><CardContent><p className="text-xs font-bold uppercase tracking-wide text-primary">{item.eyebrow}</p><h3 className="mt-1 text-lg font-bold">{item.title}</h3><p className="mt-2 leading-7 text-muted">{item.body}</p></CardContent></Card>)}</div></div>;
    case "steps": return <div><OptionalHeading>{block.title}</OptionalHeading><ol className="space-y-4">{block.items.map((item, index) => <li key={item.key} className="flex gap-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft font-bold text-primary">{index + 1}</span><div><h3 className="font-bold">{item.title}</h3><p className="mt-1 leading-7 text-muted">{item.body}</p></div></li>)}</ol></div>;
    case "image": { const url = block.source.externalUrl ?? (block.source.assetId ? assetUrls[block.source.assetId] : undefined); return url ? <figure><img src={url} alt={block.alt} className="h-auto w-full rounded-lg border" />{block.caption && <figcaption className="mt-2 text-center text-sm text-muted">{block.caption}</figcaption>}</figure> : <MediaPlaceholder label={`Imagen subida: ${block.alt}`} />; }
    case "video": { const url = block.source.externalUrl ?? (block.source.assetId ? assetUrls[block.source.assetId] : undefined); return url ? <figure><video controls preload="metadata" className="w-full rounded-lg border" aria-label={block.title} poster={block.posterAssetId ? assetUrls[block.posterAssetId] : undefined}><source src={url} /></video>{block.caption && <figcaption className="mt-2 text-center text-sm text-muted">{block.caption}</figcaption>}</figure> : <MediaPlaceholder label={`Video subido: ${block.title}`} />; }
    case "code": return <CodeBlock title={block.title} language={block.language} code={block.code} />;
    case "terminal": return <TerminalBlock block={block} />;
    case "command_reference": return <CommandReferenceBlock block={block} />;
    case "link": return <a className={buttonStyles({ variant: block.variant === "text" ? "ghost" : block.variant })} href={block.url} target={block.newTab ? "_blank" : undefined} rel={block.newTab ? "noreferrer" : undefined}>{block.label}</a>;
    case "embed": return <div className="aspect-video overflow-hidden rounded-lg border"><iframe src={block.url} title={block.title} className="h-full w-full" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen sandbox="allow-scripts allow-same-origin allow-presentation" /></div>;
    case "glossary": return <div><OptionalHeading>{block.title}</OptionalHeading><dl className="divide-y rounded-lg border">{block.items.map((item) => <div key={item.key} className="p-4"><dt className="font-bold">{item.term}</dt><dd className="mt-1 leading-7 text-muted">{item.definition}</dd></div>)}</dl></div>;
    case "question": return <QuestionActivity block={block} disabled={preview || !learningContext} context={learningContext} onSectionCompleted={onSectionCompleted} />;
    case "checklist": return <ChecklistActivity block={block} disabled={preview || !learningContext} context={learningContext} onSectionCompleted={onSectionCompleted} />;
    case "validator": return <ValidatorActivity block={block} disabled={preview || !learningContext} context={learningContext} onSectionCompleted={onSectionCompleted} />;
    case "generator": return <GeneratorBlock block={block} />;
  }
}

function QuestionActivity({ block, disabled, context, onSectionCompleted }: { block: Extract<PublicContentBlock, { type: "question" }>; disabled: boolean; context?: LearningContext; onSectionCompleted?: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);
  const toggle = (key: string) => setSelected((current) => block.questionKind === "multiple" ? current.includes(key) ? current.filter((item) => item !== key) : [...current, key] : [key]);
  const submit = async () => { if (!context) return; setPending(true); const result = await submitContentActivityAction(context.cohortId, context.weekId, context.sectionId, { revisionId: context.revisionId, activityKey: block.activityKey, attemptKey: crypto.randomUUID(), response: { selectedOptionKeys: selected } }); setFeedback(result.success ? result.message ?? "Respuesta registrada." : result.error); if (result.success && result.data.sectionCompleted) onSectionCompleted?.(); setPending(false); };
  return <fieldset disabled={disabled || pending} className="rounded-lg border p-5"><legend className="px-2 font-bold">{block.prompt}</legend><div className="mt-3 grid gap-2">{block.options.map((option) => <label key={option.key} className="flex min-h-11 items-center gap-3 rounded-md border p-3"><input type={block.questionKind === "multiple" ? "checkbox" : "radio"} name={block.activityKey} value={option.key} checked={selected.includes(option.key)} onChange={() => toggle(option.key)} className="size-5 accent-primary" /><span className={option.code ? "font-mono" : undefined}>{option.label}</span></label>)}</div><Button className="mt-4" disabled={disabled || pending || !selected.length} onClick={submit} loading={pending}>Comprobar respuesta</Button>{feedback && <p role="status" className="mt-3 rounded-md bg-surface-muted p-3 text-sm">{feedback}</p>}</fieldset>;
}

function ChecklistActivity({ block, disabled, context, onSectionCompleted }: { block: Extract<PublicContentBlock, { type: "checklist" }>; disabled: boolean; context?: LearningContext; onSectionCompleted?: () => void }) {
  const [checked, setChecked] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async () => { if (!context) return; setPending(true); const result = await submitContentActivityAction(context.cohortId, context.weekId, context.sectionId, { revisionId: context.revisionId, activityKey: block.activityKey, attemptKey: crypto.randomUUID(), response: { checkedItemKeys: checked } }); setFeedback(result.success ? result.message ?? "Auto-comprobación registrada." : result.error); if (result.success && result.data.sectionCompleted) onSectionCompleted?.(); setPending(false); };
  return <fieldset disabled={disabled || pending} className="rounded-lg border p-5"><legend className="px-2 font-bold">{block.title}</legend>{block.description && <p className="mb-3 text-sm text-muted">{block.description}</p>}<div className="grid gap-3">{block.items.map((item) => <label key={item.key} className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={checked.includes(item.key)} onChange={() => setChecked((current) => current.includes(item.key) ? current.filter((key) => key !== item.key) : [...current, item.key])} className="size-5 accent-primary" />{item.label}</label>)}</div><Button className="mt-4" disabled={disabled || pending} onClick={submit} loading={pending}>Guardar auto-comprobación</Button>{feedback && <p role="status" className="mt-3 rounded-md bg-surface-muted p-3 text-sm">{feedback}</p>}</fieldset>;
}

function ValidatorActivity({ block, disabled, context, onSectionCompleted }: { block: Extract<PublicContentBlock, { type: "validator" }>; disabled: boolean; context?: LearningContext; onSectionCompleted?: () => void }) {
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);
  const githubProfileUrl = block.presentation === "github_profile" ? githubProfileUrlFor(value) : undefined;
  const submit = async () => { if (!context) return; setPending(true); const result = await submitContentActivityAction(context.cohortId, context.weekId, context.sectionId, { revisionId: context.revisionId, activityKey: block.activityKey, attemptKey: crypto.randomUUID(), response: { value } }); setFeedback(result.success ? result.message ?? "Valor registrado." : result.error); if (result.success && result.data.sectionCompleted) onSectionCompleted?.(); setPending(false); };
  return <div className="rounded-lg border p-5"><Input label={block.label} placeholder={block.placeholder} description={block.helpText} disabled={disabled || pending} value={value} onChange={(event) => setValue(event.target.value)} />{block.presentation === "github_profile" && <div className="mt-3 rounded-md bg-surface-muted p-3 text-sm"><p className="font-semibold">Perfil para comprobar</p>{githubProfileUrl ? <><code className="mt-1 block break-all">{githubProfileUrl}</code><a className={`${buttonStyles({ variant: "secondary", size: "sm" })} mt-3 w-full sm:w-auto`} href={githubProfileUrl} target="_blank" rel="noreferrer">Abrir perfil en GitHub</a><p className="mt-2 text-muted">El formato es válido. Abrí el enlace y confirmá que muestra tu propia cuenta antes de validar.</p></> : <p className="mt-1 text-muted">Escribí sólo el nombre que aparece después de github.com/. El enlace se habilitará cuando el formato sea válido.</p>}</div>}<Button className="mt-3" disabled={disabled || pending || !value.trim()} onClick={submit} loading={pending}>Validar</Button>{feedback && <p role="status" className="mt-3 rounded-md bg-surface-muted p-3 text-sm">{feedback}</p>}</div>;
}

function githubProfileUrlFor(value: string) {
  const username = value.trim();
  return /^(?!-)(?!.*--)[A-Za-z0-9-]{1,39}(?<!-)$/.test(username) ? `https://github.com/${username}` : undefined;
}

function GeneratorBlock({ block }: { block: Extract<PublicContentBlock, { type: "generator" }> }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const complete = block.variables.every((variable) => !variable.required || Boolean(values[variable.key]?.trim()));
  const output = block.variables.reduce((text, variable) => {
    const value = values[variable.key]?.trim();
    return text.replaceAll(`{{${variable.key}}}`, value || (variable.required ? `{{${variable.key}}}` : ""));
  }, block.template);
  const copy = async () => { if (!complete) return; await navigator.clipboard.writeText(output); setCopied(true); window.setTimeout(() => setCopied(false), 1500); };
  return <div className="rounded-lg border p-5"><h2 className="text-xl font-bold">{block.title}</h2>{block.description && <p className="mt-1 text-muted">{block.description}</p>}<div className="mt-4 grid gap-3 sm:grid-cols-2">{block.variables.map((variable) => <Input key={variable.key} label={variable.label} type={variable.inputType} placeholder={variable.placeholder} value={values[variable.key] ?? ""} onChange={(event) => { setCopied(false); setValues((current) => ({ ...current, [variable.key]: event.target.value })); }} required={variable.required} />)}</div><div className="mt-4 overflow-hidden rounded-md bg-zinc-950 text-zinc-50"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-2"><span className="font-semibold">Comandos generados</span><Button size="sm" variant="secondary" disabled={!complete} onClick={copy}>{copied ? "Copiados" : "Copiar comandos"}</Button></div><pre className="overflow-x-auto p-4 text-sm"><code>{output}</code></pre></div>{!complete && <p className="mt-2 text-sm text-muted">Completá los campos obligatorios para copiar los comandos.</p>}</div>;
}

function CodeBlock({ title, language, code }: { title?: string; language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1500); };
  return <div className="overflow-hidden rounded-lg border bg-zinc-950 text-zinc-50"><div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-2"><div><span className="font-semibold">{title}</span><span className="ml-2 text-xs text-zinc-400">{language}</span></div><Button size="sm" variant="secondary" onClick={copy}>{copied ? "Copiado" : "Copiar"}</Button></div><pre className="overflow-x-auto p-4 text-sm"><HighlightedCode language={language} code={code} /></pre></div>;
}

function TerminalBlock({ block }: { block: Extract<PublicContentBlock, { type: "terminal" }> }) {
  return <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-50" role="group" aria-label={block.title || "Transcripción de terminal"}>
    <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-4 py-3"><span className="size-2.5 rounded-full bg-red-400" aria-hidden="true" /><span className="size-2.5 rounded-full bg-amber-300" aria-hidden="true" /><span className="size-2.5 rounded-full bg-emerald-400" aria-hidden="true" /><strong className="ml-auto text-xs uppercase tracking-[0.18em] text-zinc-400">{block.title || "Terminal"}</strong></div>
    <dl className="divide-y divide-zinc-800 px-4 sm:px-5">{block.rows.map((row) => <div key={row.key} className="grid gap-1 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-baseline sm:gap-4"><dt className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">{row.label}</dt><dd className="min-w-0 overflow-x-auto"><code className={`whitespace-pre text-sm ${row.kind === "command" ? "font-bold text-emerald-300" : "text-zinc-100"}`}>{row.value}</code></dd></div>)}</dl>
  </div>;
}

function CommandReferenceBlock({ block }: { block: Extract<PublicContentBlock, { type: "command_reference" }> }) {
  return <div><OptionalHeading>{block.title}</OptionalHeading><div className="overflow-hidden rounded-xl border" role="list" aria-label={block.title || "Referencia de comandos"}>
    <div className="hidden grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto] gap-4 bg-surface-muted px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted md:grid" aria-hidden="true"><span>Comando</span><span>Para qué sirve</span><span>Probalo</span><span>Acción</span></div>
    <div className="divide-y">{block.items.map((item) => <div key={item.key} role="listitem" className="grid gap-3 p-4 md:grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-center md:gap-4">
      <div><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted md:hidden">Comando</span><code className="inline-block rounded-md bg-zinc-950 px-3 py-2 font-bold text-emerald-300">{item.command}</code></div>
      <div><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted md:hidden">Para qué sirve</span><p className="leading-6">{item.purpose}</p></div>
      <div><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted md:hidden">Probalo</span><p className="text-sm leading-6 text-muted">{item.tryIt}</p></div>
      <CommandCopyButton command={item.command} />
    </div>)}</div>
  </div></div>;
}

function CommandCopyButton({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(command); setCopied(true); window.setTimeout(() => setCopied(false), 1500); };
  return <Button size="sm" variant="secondary" className="w-full md:w-auto" aria-label={`Copiar comando ${command}`} onClick={copy}>{copied ? "Copiado" : "Copiar"}</Button>;
}

function renderRichNodes(nodes: RichTextNode[]): React.ReactNode { return nodes.map((node, index) => {
  const children = node.content ? renderRichNodes(node.content) : node.text;
  const marked = (node.marks ?? []).reduce<React.ReactNode>((content, mark) => mark.type === "bold" ? <strong>{content}</strong> : mark.type === "italic" ? <em>{content}</em> : mark.type === "strike" ? <s>{content}</s> : mark.type === "code" ? <code>{content}</code> : mark.type === "link" ? <a href={mark.attrs.href}>{content}</a> : content, children);
  if (node.type === "text") return <span key={index}>{marked}</span>;
  if (node.type === "paragraph") return <p key={index}>{children}</p>;
  if (node.type === "heading") { const Tag = `h${node.attrs?.level ?? 2}` as "h2" | "h3" | "h4"; return <Tag key={index}>{children}</Tag>; }
  if (node.type === "bulletList") return <ul key={index}>{children}</ul>;
  if (node.type === "orderedList") return <ol key={index}>{children}</ol>;
  if (node.type === "listItem") return <li key={index}>{children}</li>;
  if (node.type === "blockquote") return <blockquote key={index}>{children}</blockquote>;
  if (node.type === "hardBreak") return <br key={index} />;
  if (node.type === "horizontalRule") return <hr key={index} />;
  return <span key={index}>{children}</span>;
}); }

function OptionalHeading({ children }: { children?: string }) { return children ? <h2 className="mb-4 text-2xl font-bold">{children}</h2> : null; }
function MediaPlaceholder({ label }: { label: string }) { return <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed bg-surface-muted p-6 text-center text-muted">{label}</div>; }
