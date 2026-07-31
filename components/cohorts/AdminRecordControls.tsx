"use client";

import { useState, useTransition } from "react";
import { cancelAdmissionAction, setEnrollmentStatusAction } from "@/lib/cohorts/actions";

export function EnrollmentControls({ id, status }: { id: string; status: "active" | "completed" }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const next = status === "active" ? "completed" : "active";
  const update = () => {
    if (status === "active" && !window.confirm("¿Desmatricular a este estudiante? Perderá el acceso activo, pero se conservará su historial.")) return;
    startTransition(async () => {
      const result = await setEnrollmentStatusAction(id, next);
      setMessage(result.success ? result.message || "Actualizado" : result.error);
    });
  };
  const className = status === "active"
    ? "rounded border border-red-300 px-2 py-1 text-xs text-red-700 disabled:opacity-50"
    : "rounded border px-2 py-1 text-xs disabled:opacity-50";
  return <div className="mt-2"><button disabled={pending} className={className} onClick={update}>{pending ? "Actualizando…" : status === "active" ? "Desmatricular" : "Rematricular"}</button>{message && <span className="ml-2 text-xs text-zinc-500">{message}</span>}</div>;
}

export function AdmissionControls({ id, status }: { id: string; status: "pending" | "claimed" | "cancelled" }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  if (status !== "pending") return null;
  return <div className="mt-2"><button disabled={pending} className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 disabled:opacity-50" onClick={() => { if (!window.confirm("¿Cancelar esta admisión pendiente?")) return; startTransition(async () => { const result = await cancelAdmissionAction(id); setMessage(result.success ? result.message || "Cancelada" : result.error); }); }}>{pending ? "Cancelando…" : "Cancelar admisión"}</button>{message && <span className="ml-2 text-xs text-zinc-500">{message}</span>}</div>;
}
