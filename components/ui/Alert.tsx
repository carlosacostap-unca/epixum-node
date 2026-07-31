import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type AlertVariant = "info" | "success" | "warning" | "danger";
const styles: Record<AlertVariant, string> = {
  info: "border-info/30 bg-info-soft text-info",
  success: "border-success/30 bg-success-soft text-success",
  warning: "border-warning/30 bg-warning-soft text-warning",
  danger: "border-danger/30 bg-danger-soft text-danger",
};

export function Alert({ variant = "info", title, children, className, ...props }: HTMLAttributes<HTMLDivElement> & { variant?: AlertVariant; title?: ReactNode }) {
  return <div role={variant === "danger" ? "alert" : "status"} className={cn("rounded-md border p-4", styles[variant], className)} {...props}>
    {title && <p className="font-semibold">{title}</p>}
    {children && <div className={cn("text-sm", Boolean(title) && "mt-1")}>{children}</div>}
  </div>;
}
