"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button, type ButtonVariant } from "./Button";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  variant?: "dialog" | "drawer";
}

export function Dialog({ open, onOpenChange, title, description, children, footer, className, variant = "dialog" }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      previousFocus.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => { onOpenChange(false); previousFocus.current?.focus(); };
    const handleCancel = (event: Event) => { event.preventDefault(); onOpenChange(false); };
    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("cancel", handleCancel);
    return () => { dialog.removeEventListener("close", handleClose); dialog.removeEventListener("cancel", handleCancel); };
  }, [onOpenChange]);

  return <dialog ref={ref} aria-labelledby="ui-dialog-title" aria-describedby={description ? "ui-dialog-description" : undefined} className={cn(
    "m-auto max-h-[calc(100dvh-2rem)] w-[min(36rem,calc(100%-2rem))] overflow-hidden rounded-xl border bg-surface-elevated p-0 text-foreground shadow-md backdrop:bg-zinc-950/60",
    variant === "drawer" && "mr-0 h-dvh max-h-dvh w-[min(32rem,100%)] rounded-none border-y-0 border-r-0",
    className,
  )} onClick={(event) => { if (event.target === ref.current) onOpenChange(false); }}>
    <div className="flex max-h-[inherit] flex-col">
      <header className="flex items-start justify-between gap-4 border-b p-5">
        <div><h2 id="ui-dialog-title" className="text-xl font-bold">{title}</h2>{description && <p id="ui-dialog-description" className="mt-1 text-sm text-muted">{description}</p>}</div>
        <Button variant="ghost" size="sm" aria-label="Cerrar" className="aspect-square px-0 text-xl" onClick={() => onOpenChange(false)}>×</Button>
      </header>
      <div className="overflow-y-auto p-5">{children}</div>
      {footer && <footer className="flex flex-wrap justify-end gap-3 border-t p-5">{footer}</footer>}
    </div>
  </dialog>;
}

export function Drawer(props: Omit<DialogProps, "variant">) { return <Dialog {...props} variant="drawer" />; }

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  onConfirm: () => void | Promise<void>;
  busy?: boolean;
}

export function ConfirmationDialog({ open, onOpenChange, title, description, confirmLabel = "Confirmar", cancelLabel = "Cancelar", confirmVariant = "danger", onConfirm, busy }: ConfirmationDialogProps) {
  return <Dialog open={open} onOpenChange={onOpenChange} title={title} footer={<><Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>{cancelLabel}</Button><Button variant={confirmVariant} loading={busy} onClick={onConfirm}>{confirmLabel}</Button></>}>
    <div className="text-sm text-muted">{description}</div>
  </Dialog>;
}
