import type { ContentBlock } from "./domain.ts";

export const contentBlockLabels: Record<ContentBlock["type"], string> = {
  rich_text: "Texto enriquecido", callout: "Destacado", cards: "Tarjetas", steps: "Pasos",
  image: "Imagen", video: "Video", code: "Código", link: "Enlace o botón", embed: "Contenido embebido",
  terminal: "Terminal", command_reference: "Referencia de comandos",
  glossary: "Glosario", question: "Pregunta", checklist: "Auto-comprobación", validator: "Validador", generator: "Generador",
};

export function createContentBlock(type: ContentBlock["type"], key = uniqueContentKey(type)): ContentBlock {
  const doc = { type: "doc" as const, content: [{ type: "paragraph" as const, content: [] }] };
  switch (type) {
    case "rich_text": return { key, type, content: doc };
    case "callout": return { key, type, title: "Nuevo destacado", body: doc, tone: "info" };
    case "cards": return { key, type, title: "Tarjetas", columns: 2, items: [{ key: `${key}_item`, title: "Nueva tarjeta", body: "Descripción" }] };
    case "steps": return { key, type, title: "Pasos", items: [{ key: `${key}_step`, title: "Primer paso", body: "Descripción" }] };
    case "image": return { key, type, source: { externalUrl: "https://example.com/image.png" }, alt: "Descripción de la imagen" };
    case "video": return { key, type, source: { externalUrl: "https://example.com/video.mp4" }, title: "Descripción del video" };
    case "code": return { key, type, title: "Ejemplo", language: "javascript", code: "console.log('Hola');" };
    case "terminal": return { key, type, title: "Terminal", rows: [{ key: `${key}_prompt`, kind: "prompt", label: "Prompt", value: "PS C:\\Proyecto>" }, { key: `${key}_command`, kind: "command", label: "Comando", value: "echo Hola" }, { key: `${key}_response`, kind: "response", label: "Respuesta", value: "Hola" }] };
    case "command_reference": return { key, type, title: "Comandos esenciales", items: [{ key: `${key}_command`, command: "pwd", purpose: "Muestra la carpeta actual.", tryIt: "Confirmá dónde estás." }] };
    case "link": return { key, type, label: "Abrir recurso", url: "https://example.com", variant: "primary", newTab: false };
    case "embed": return { key, type, provider: "youtube", url: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ", title: "Video" };
    case "glossary": return { key, type, title: "Glosario", items: [{ key: `${key}_term`, term: "Término", definition: "Definición" }] };
    case "question": return { key, type, activityKey: `${key}_activity`, required: true, questionKind: "single", prompt: "Nueva pregunta", options: [{ key: `${key}_option_a`, label: "Opción A", code: false }, { key: `${key}_option_b`, label: "Opción B", code: false }], correctOptionKeys: [`${key}_option_a`] };
    case "checklist": return { key, type, activityKey: `${key}_activity`, required: true, title: "Antes de continuar", items: [{ key: `${key}_check`, label: "Completé este paso" }] };
    case "validator": return { key, type, activityKey: `${key}_activity`, required: true, label: "Ingresá el valor", rule: { kind: "semantic_version" } };
    case "generator": return { key, type, title: "Generador", variables: [{ key: `${key}_value`, label: "Valor", inputType: "text", required: true }], template: `{{${key}_value}}`, language: "text" };
  }
}

export function uniqueContentKey(prefix: string, now = Date.now(), random = Math.random()) {
  return `${prefix}_${now.toString(36)}${Math.floor(random * 1_000_000).toString(36)}`.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 80);
}
