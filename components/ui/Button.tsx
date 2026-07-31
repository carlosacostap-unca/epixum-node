import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-primary text-white shadow-sm hover:bg-primary-hover dark:text-zinc-950",
  secondary: "border-border-strong bg-surface text-foreground shadow-sm hover:bg-surface-muted",
  ghost: "border-transparent bg-transparent text-foreground hover:bg-surface-muted",
  danger: "border-transparent bg-danger text-white shadow-sm hover:opacity-90 dark:text-zinc-950",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-1.5 text-sm",
  md: "min-h-11 px-4 py-2 text-sm",
  lg: "min-h-12 px-5 py-2.5 text-base",
};

export function buttonStyles({ variant = "primary", size = "md", className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn("inline-flex items-center justify-center gap-2 rounded-md border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50", variants[variant], sizes[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({ variant, size, loading = false, disabled, className, children, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonStyles({ variant, size, className })} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
    {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />}
    {children}
  </button>;
}

export type LinkButtonProps = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { variant?: ButtonVariant; size?: ButtonSize };

export function LinkButton({ variant, size, className, children, ...props }: LinkButtonProps) {
  return <Link className={buttonStyles({ variant, size, className })} {...props}>{children}</Link>;
}

export interface IconButtonProps extends Omit<ButtonProps, "aria-label"> {
  label: string;
  children: ReactNode;
}

export function IconButton({ label, children, className, variant = "ghost", size = "sm", ...props }: IconButtonProps) {
  return <Button aria-label={label} title={label} variant={variant} size={size} className={cn("aspect-square px-0", className)} {...props}>{children}</Button>;
}
