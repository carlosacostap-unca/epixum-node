import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageHeader({ eyebrow, title, description, actions, className }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode; className?: string }) {
  return <header className={cn("flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between", className)}><div className="max-w-3xl">{eyebrow && <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">{eyebrow}</div>}<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>{description && <div className="mt-3 text-base leading-7 text-muted">{description}</div>}</div>{actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}</header>;
}
