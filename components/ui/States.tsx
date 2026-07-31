import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button, type ButtonProps, LinkButton, type LinkButtonProps } from "./Button";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-surface-muted", className)} {...props} />; }

export function EmptyState({ title, description, icon, action, className }: { title: string; description?: ReactNode; icon?: ReactNode; action?: ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border border-dashed bg-surface p-8 text-center", className)}>{icon && <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted" aria-hidden="true">{icon}</div>}<h2 className="text-lg font-bold">{title}</h2>{description && <div className="mx-auto mt-2 max-w-lg text-sm text-muted">{description}</div>}{action && <div className="mt-5 flex justify-center">{action}</div>}</div>;
}

export function ErrorState({ title = "No pudimos completar la operación", description, retryLabel = "Reintentar", onRetry, className }: { title?: string; description?: ReactNode; retryLabel?: string; onRetry?: ButtonProps["onClick"]; className?: string }) {
  return <div role="alert" className={cn("rounded-lg border border-danger/30 bg-danger-soft p-6 text-danger", className)}><h2 className="text-lg font-bold">{title}</h2>{description && <div className="mt-2 text-sm">{description}</div>}{onRetry && <Button variant="secondary" className="mt-4" onClick={onRetry}>{retryLabel}</Button>}</div>;
}

export function EmptyStateLink({ children, ...props }: LinkButtonProps) { return <LinkButton {...props}>{children}</LinkButton>; }
