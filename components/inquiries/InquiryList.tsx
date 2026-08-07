"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Inquiry, User } from "@/types";
import { Button, EmptyState, Input, LinkButton, Select } from "@/components/ui";
import InquiryCard from "./InquiryCard";

type StatusFilter = "all" | "pending" | "resolved" | "mine";

interface InquiryListProps {
  inquiries: Inquiry[];
  currentUser: User | null;
  context?: { cohortId?: string; weekId?: string; classId?: string; assignmentId?: string; basePath?: string };
  showSearch?: boolean;
  canCreate?: boolean;
}

export default function InquiryList({ inquiries, currentUser, context, showSearch = false, canCreate = Boolean(currentUser) }: InquiryListProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState<StatusFilter>(normalizeStatus(searchParams.get("status")));
  const [contentContext, setContentContext] = useState(searchParams.get("context") || "all");

  useEffect(() => {
    if (!showSearch) return;
    const timer = window.setTimeout(() => updateUrl({ search: searchTerm || null }), 350);
    return () => window.clearTimeout(timer);
    // searchParams is intentionally read inside updateUrl to preserve unrelated cohort params.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, showSearch]);

  const contexts = useMemo(() => inquiryContexts(inquiries), [inquiries]);
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("es");
  const filtered = inquiries.filter(inquiry => {
    const statusMatch = status === "all" || (status === "pending" && inquiry.status === "Pendiente") || (status === "resolved" && inquiry.status === "Resuelta") || (status === "mine" && inquiry.author === currentUser?.id);
    const contextMatch = contentContext === "all" || inquiryMatchesContext(inquiry, contentContext);
    const text = [inquiry.title, inquiry.description, inquiry.expand?.author?.name, inquiry.expand?.author?.email, inquiry.expand?.week?.title, inquiry.expand?.class?.title, inquiry.expand?.assignment?.title].filter(Boolean).join(" ").toLocaleLowerCase("es");
    return statusMatch && contextMatch && (!normalizedSearch || text.includes(normalizedSearch));
  });
  const ordered = [...filtered].sort((a, b) => Number(a.status === "Resuelta") - Number(b.status === "Resuelta") || (a.status === "Pendiente" ? (a.updated || a.created).localeCompare(b.updated || b.created) : (b.updated || b.created).localeCompare(a.updated || a.created)));
  const activeContextLabel = contentContext === "all" ? null : contexts.find(item => item.value === contentContext)?.label || (contentContext.startsWith("week:") ? "Semana seleccionada" : contentContext.startsWith("sprint:") ? "Sprint seleccionado" : "Contexto seleccionado");

  let newInquiryHref = `${context?.basePath || "/inquiries"}/new`;
  const newParams = new URLSearchParams();
  if (context?.classId) newParams.set("classId", context.classId);
  if (context?.assignmentId) newParams.set("assignmentId", context.assignmentId);
  if (context?.weekId) newParams.set("weekId", context.weekId);
  if (newParams.size) newInquiryHref += `?${newParams}`;

  function updateUrl(changes: Record<string, string | null>) {
    if (!showSearch) return;
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => value && value !== "all" ? params.set(key, value) : params.delete(key));
    const query = params.toString(); replace(query ? `${pathname}?${query}` : pathname);
  }
  function changeStatus(value: StatusFilter) { setStatus(value); updateUrl({ status: value }); }
  function changeContext(value: string) { setContentContext(value); updateUrl({ context: value }); }
  function clearFilters() { setSearchTerm(""); setStatus("all"); setContentContext("all"); updateUrl({ search: null, status: null, context: null }); }

  return <section aria-label="Bandeja de consultas" className="space-y-5">
    <div className="rounded-lg border bg-surface p-4 sm:p-5">
      <div className={`grid gap-4 ${showSearch ? "md:grid-cols-[minmax(0,1fr)_12rem_15rem]" : "sm:grid-cols-2"}`}>
        {showSearch && <Input id="inquiry-search" type="search" label="Buscar consultas" placeholder="Título, autor o contenido" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} />}
        <Select id="inquiry-status" label="Estado" value={status} onChange={event => changeStatus(event.target.value as StatusFilter)}><option value="all">Todos los estados</option><option value="pending">Pendientes</option><option value="resolved">Resueltas</option>{currentUser && <option value="mine">Mis consultas</option>}</Select>
        <Select id="inquiry-context" label="Contexto" value={contentContext} onChange={event => changeContext(event.target.value)}><option value="all">Todos los contextos</option>{contentContext !== "all" && !contexts.some(item => item.value === contentContext) && <option value={contentContext}>{activeContextLabel}</option>}{contexts.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</Select>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="text-sm text-muted" role="status" aria-live="polite">{ordered.length} consulta{ordered.length === 1 ? "" : "s"} coincidente{ordered.length === 1 ? "" : "s"}{activeContextLabel ? ` · ${activeContextLabel}` : ""}{status !== "all" ? ` · ${status === "pending" ? "Pendientes" : status === "resolved" ? "Resueltas" : "Propias"}` : ""}</p>
        <div className="flex flex-wrap gap-2">{(searchTerm || status !== "all" || contentContext !== "all") && <Button variant="ghost" size="sm" onClick={clearFilters}>Limpiar filtros</Button>}{canCreate && <LinkButton href={newInquiryHref} size="sm">Nueva consulta</LinkButton>}</div>
      </div>
    </div>
    {ordered.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{ordered.map(inquiry => <InquiryCard key={inquiry.id} inquiry={inquiry} currentUser={currentUser} basePath={context?.basePath} />)}</div> : <EmptyState title="No encontramos consultas" description={activeContextLabel ? `No hay consultas en ${activeContextLabel.toLocaleLowerCase("es")} con los filtros activos.` : "Ajustá los filtros o creá una nueva consulta para iniciar una conversación."} action={(searchTerm || status !== "all" || contentContext !== "all") ? <Button onClick={clearFilters}>Limpiar filtros</Button> : canCreate ? <LinkButton href={newInquiryHref}>Nueva consulta</LinkButton> : undefined} />}
  </section>;
}

function normalizeStatus(value: string | null): StatusFilter { return value === "pending" || value === "resolved" || value === "mine" ? value : "all"; }
function inquiryContextKey(inquiry: Inquiry) { if (inquiry.class) return `class:${inquiry.class}`; if (inquiry.assignment) return `assignment:${inquiry.assignment}`; if (inquiry.week) return `week:${inquiry.week}`; return "general"; }
function inquiryMatchesContext(inquiry: Inquiry, context: string) { if (context.startsWith("sprint:")) { const sprintId = context.slice("sprint:".length); return inquiry.expand?.class?.sprint === sprintId || inquiry.expand?.assignment?.sprint === sprintId; } return inquiryContextKey(inquiry) === context; }
function inquiryContexts(inquiries: Inquiry[]) { const values = new Map<string, string>(); inquiries.forEach(inquiry => { const key = inquiryContextKey(inquiry); const label = inquiry.expand?.class?.title || inquiry.expand?.assignment?.title || inquiry.expand?.week?.title || "Consulta general"; values.set(key, label); }); return [...values].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, "es")); }
