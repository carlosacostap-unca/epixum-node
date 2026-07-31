"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabItem { id: string; label: ReactNode; content: ReactNode; disabled?: boolean }
export function Tabs({ items, defaultValue, value, onValueChange, label = "Secciones", className }: { items: TabItem[]; defaultValue?: string; value?: string; onValueChange?: (value: string) => void; label?: string; className?: string }) {
  const uid = useId(); const [internal, setInternal] = useState(defaultValue || items.find(item => !item.disabled)?.id || ""); const active = value ?? internal;
  const select = (id: string) => { if (value === undefined) setInternal(id); onValueChange?.(id); };
  const move = (current: number, direction: number) => {
    let next = current;
    do { next = (next + direction + items.length) % items.length; } while (items[next]?.disabled && next !== current);
    select(items[next].id);
    document.getElementById(`${uid}-tab-${items[next].id}`)?.focus();
  };
  return <div className={className}>
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b">{items.map((item, index) => <button key={item.id} id={`${uid}-tab-${item.id}`} type="button" role="tab" aria-selected={active === item.id} aria-controls={`${uid}-panel-${item.id}`} tabIndex={active === item.id ? 0 : -1} disabled={item.disabled} onClick={() => select(item.id)} onKeyDown={(event) => { if (event.key === "ArrowRight") move(index, 1); if (event.key === "ArrowLeft") move(index, -1); }} className={cn("min-h-11 whitespace-nowrap border-b-2 px-4 text-sm font-semibold", active === item.id ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground")}>{item.label}</button>)}</div>
    {items.map(item => <div key={item.id} id={`${uid}-panel-${item.id}`} role="tabpanel" aria-labelledby={`${uid}-tab-${item.id}`} hidden={active !== item.id} tabIndex={0} className="py-5">{item.content}</div>)}
  </div>;
}
