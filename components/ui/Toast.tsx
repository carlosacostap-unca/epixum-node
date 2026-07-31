"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type ToastVariant = "info" | "success" | "warning" | "danger";
interface ToastMessage { id: number; title: string; description?: string; variant: ToastVariant }
interface ToastApi { toast: (message: Omit<ToastMessage, "id"> & { duration?: number }) => void }
const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const toast = useCallback((message: Omit<ToastMessage, "id"> & { duration?: number }) => {
    const id = Date.now() + Math.random(); const duration = message.duration ?? 4500;
    setMessages(current => [...current, { id, title: message.title, description: message.description, variant: message.variant }]);
    window.setTimeout(() => setMessages(current => current.filter(item => item.id !== id)), duration);
  }, []);
  const api = useMemo(() => ({ toast }), [toast]);
  return <ToastContext.Provider value={api}>{children}<div aria-live="polite" aria-atomic="false" className="fixed bottom-4 right-4 z-[70] grid w-[min(24rem,calc(100%-2rem))] gap-2">{messages.map(message => <div key={message.id} role={message.variant === "danger" ? "alert" : "status"} className={cn("rounded-md border bg-surface-elevated p-4 shadow-md", message.variant === "success" && "border-success/40", message.variant === "warning" && "border-warning/40", message.variant === "danger" && "border-danger/40")}><p className="font-semibold">{message.title}</p>{message.description && <p className="mt-1 text-sm text-muted">{message.description}</p>}</div>)}</div></ToastContext.Provider>;
}

export function useToast() { const context = useContext(ToastContext); if (!context) throw new Error("useToast debe usarse dentro de ToastProvider"); return context; }
