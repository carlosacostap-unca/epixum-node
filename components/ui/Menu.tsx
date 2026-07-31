"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Menu({ trigger, label, children, align = "end", side = "bottom" }: { trigger: ReactNode; label: string; children: ReactNode; align?: "start" | "end"; side?: "top" | "bottom" }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); root.current?.querySelector<HTMLButtonElement>("button")?.focus(); } };
    document.addEventListener("pointerdown", close); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, []);
  return <div ref={root} className="relative inline-block">
    <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={() => setOpen(value => !value)} className="rounded-md">{trigger}</button>
    {open && <div role="menu" aria-label={label} data-side={side} className={cn("absolute z-50 min-w-52 rounded-md border bg-surface-elevated p-1 shadow-md", side === "top" ? "bottom-full mb-2" : "top-full mt-2", align === "end" ? "right-0" : "left-0")} onClick={() => setOpen(false)}>{children}</div>}
  </div>;
}

export function MenuItem({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" role="menuitem" className={cn("flex min-h-10 w-full items-center rounded-sm px-3 py-2 text-left text-sm hover:bg-surface-muted", className)} {...props}>{children}</button>;
}
