"use client";

import { useState, useTransition } from "react";
import { approveEnrollmentRequestAction, rejectEnrollmentRequestAction } from "@/lib/cohorts/enrollment-request-actions";

export default function EnrollmentRequestControls({ requestId }: { requestId: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const resolve = (decision: "approve" | "reject") => {
    const prompt = decision === "approve" ? "¿Aprobar la solicitud y habilitar la matrícula?" : "¿Rechazar esta solicitud?";
    if (!window.confirm(prompt)) return;
    startTransition(async () => {
      const result = decision === "approve" ? await approveEnrollmentRequestAction(requestId) : await rejectEnrollmentRequestAction(requestId);
      setMessage(result.success ? result.message : result.error);
    });
  };
  return <div className="mt-4"><div className="flex flex-wrap gap-2"><button type="button" disabled={pending} onClick={() => resolve("approve")} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{pending ? "Procesando…" : "Aprobar y matricular"}</button><button type="button" disabled={pending} onClick={() => resolve("reject")} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60 dark:text-red-300 dark:hover:bg-red-950/30">Rechazar</button></div>{message && <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>}</div>;
}
