"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const controlStyles = "w-full rounded-md border border-border-strong bg-surface px-3 py-2.5 text-sm text-foreground shadow-sm transition placeholder:text-muted/70 hover:border-muted focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70 aria-[invalid=true]:border-danger";

export interface FieldFrameProps {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({ id, label, description, error, required, children, className }: FieldFrameProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return <div className={cn("space-y-1.5", className)}>
    <label htmlFor={id} className="block text-sm font-semibold text-foreground">{label}{required && <span className="ml-1 text-danger" aria-hidden="true">*</span>}</label>
    {children}
    {description && <p id={descriptionId} className="text-xs text-muted">{description}</p>}
    {error && <p id={errorId} className="text-xs font-medium text-danger" role="alert">{error}</p>}
  </div>;
}

type SharedFieldProps = { label: ReactNode; description?: ReactNode; error?: ReactNode; containerClassName?: string };

export type InputProps = InputHTMLAttributes<HTMLInputElement> & SharedFieldProps;
export function Input({ label, description, error, containerClassName, className, id: suppliedId, required, ...props }: InputProps) {
  const generatedId = useId(); const id = suppliedId || generatedId;
  const describedBy = [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return <FormField id={id} label={label} description={description} error={error} required={required} className={containerClassName}>
    <input id={id} required={required} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={cn(controlStyles, className)} {...props} />
  </FormField>;
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & SharedFieldProps;
export function Select({ label, description, error, containerClassName, className, id: suppliedId, required, children, ...props }: SelectProps) {
  const generatedId = useId(); const id = suppliedId || generatedId;
  const describedBy = [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return <FormField id={id} label={label} description={description} error={error} required={required} className={containerClassName}>
    <select id={id} required={required} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={cn(controlStyles, className)} {...props}>{children}</select>
  </FormField>;
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & SharedFieldProps;
export function Textarea({ label, description, error, containerClassName, className, id: suppliedId, required, ...props }: TextareaProps) {
  const generatedId = useId(); const id = suppliedId || generatedId;
  const describedBy = [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return <FormField id={id} label={label} description={description} error={error} required={required} className={containerClassName}>
    <textarea id={id} required={required} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={cn(controlStyles, "min-h-28 resize-y", className)} {...props} />
  </FormField>;
}

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & SharedFieldProps;
export function Checkbox({ label, description, error, containerClassName, className, id: suppliedId, ...props }: CheckboxProps) {
  const generatedId = useId(); const id = suppliedId || generatedId;
  return <div className={cn("space-y-1.5", containerClassName)}>
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm font-medium">
      <input id={id} type="checkbox" aria-invalid={Boolean(error)} aria-describedby={description ? `${id}-description` : error ? `${id}-error` : undefined} className={cn("mt-0.5 h-5 w-5 rounded border-border-strong accent-primary", className)} {...props} />
      <span>{label}</span>
    </label>
    {description && <p id={`${id}-description`} className="pl-8 text-xs text-muted">{description}</p>}
    {error && <p id={`${id}-error`} role="alert" className="pl-8 text-xs font-medium text-danger">{error}</p>}
  </div>;
}

export interface RadioOption { value: string; label: ReactNode; description?: ReactNode; disabled?: boolean }
export interface RadioGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type">, SharedFieldProps { options: RadioOption[] }
export function RadioGroup({ label, description, error, containerClassName, options, id: suppliedId, name, required, value, defaultValue, ...props }: RadioGroupProps) {
  const generatedId = useId(); const id = suppliedId || generatedId; const groupName = name || id;
  return <fieldset className={cn("space-y-3", containerClassName)} aria-describedby={description ? `${id}-description` : error ? `${id}-error` : undefined}>
    <legend className="text-sm font-semibold">{label}{required && <span className="ml-1 text-danger" aria-hidden="true">*</span>}</legend>
    {description && <p id={`${id}-description`} className="text-xs text-muted">{description}</p>}
    <div className="grid gap-2">{options.map((option) => <label key={option.value} className="flex cursor-pointer gap-3 rounded-md border bg-surface p-3 hover:bg-surface-muted">
      <input type="radio" name={groupName} value={option.value} checked={value === undefined ? undefined : value === option.value} defaultChecked={value === undefined && defaultValue !== undefined ? defaultValue === option.value : undefined} required={required} disabled={option.disabled} className="mt-0.5 h-5 w-5 accent-primary" {...props} />
      <span><span className="block text-sm font-medium">{option.label}</span>{option.description && <span className="mt-0.5 block text-xs text-muted">{option.description}</span>}</span>
    </label>)}</div>
    {error && <p id={`${id}-error`} role="alert" className="text-xs font-medium text-danger">{error}</p>}
  </fieldset>;
}
