"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { RichTextDocument } from "@/lib/content/domain";
import { Button } from "@/components/ui";

export default function ContentRichTextEditor({ value, onChange }: { value: RichTextDocument; onChange: (value: RichTextDocument) => void }) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, protocols: ["https", "mailto"] } })],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => onChange(current.getJSON() as RichTextDocument),
    editorProps: { attributes: { class: "prose prose-sm dark:prose-invert min-h-36 max-w-none p-4 focus:outline-none" } },
  });
  if (!editor) return <div className="min-h-36 animate-pulse rounded-md border bg-surface-muted" />;
  const link = () => { const href = window.prompt("URL HTTPS o mailto:", editor.getAttributes("link").href ?? "https://"); if (href) editor.chain().focus().extendMarkRange("link").setLink({ href }).run(); };
  return <div className="overflow-hidden rounded-md border bg-surface"><div className="flex flex-wrap gap-1 border-b bg-surface-muted p-2" role="toolbar" aria-label="Formato del texto">
    <Button size="sm" variant={editor.isActive("bold") ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleBold().run()} aria-pressed={editor.isActive("bold")}>Negrita</Button>
    <Button size="sm" variant={editor.isActive("italic") ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleItalic().run()} aria-pressed={editor.isActive("italic")}>Cursiva</Button>
    <Button size="sm" variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>Título</Button>
    <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleBulletList().run()}>Lista</Button>
    <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleOrderedList().run()}>Numeración</Button>
    <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleBlockquote().run()}>Cita</Button>
    <Button size="sm" variant="ghost" onClick={link}>Enlace</Button>
  </div><EditorContent editor={editor} /></div>;
}
