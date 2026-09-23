"use client";

import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { ChevronDown, X } from "lucide-react";
import type { LeadStatus } from "@studio/backend";
import { STATUS_LABELS } from "./types";

export const buttonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-none border border-admin-border bg-admin-bg px-3 py-2 text-xs font-medium text-admin-ink hover:bg-admin-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-primary disabled:cursor-not-allowed disabled:opacity-50";
export const inputClass =
  "min-h-11 w-full min-w-0 rounded-none border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-primary disabled:opacity-50";
export const selectClass =
  "min-h-11 w-full min-w-0 appearance-none rounded-none border border-admin-border bg-admin-bg pl-3 pr-9 py-2 text-sm text-admin-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-primary disabled:cursor-not-allowed disabled:opacity-50";
export const monoClass =
  "[font-family:var(--font-dashboard-mono)] tabular-nums";

export function Select({
  className = "",
  containerClassName = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  containerClassName?: string;
}) {
  return (
    <div className={`relative flex w-full items-center ${containerClassName}`}>
      <select className={`${selectClass} ${className}`} {...props}>
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted"
      />
    </div>
  );
}
export function Button({
  variant,
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" }) {
  return (
    <button
      type={type}
      className={`${buttonClass} ${variant === "primary" ? "border-admin-primary! bg-admin-primary! text-admin-on-primary! hover:opacity-90" : ""} ${className}`}
      {...props}
    />
  );
}
export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 border border-admin-border px-2 py-1 text-[10px] text-admin-muted ${className}`}>
      {children}
    </span>
  );
}
export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex border px-2 py-1 text-[10px] ${status === "new" ? "border-admin-alert text-admin-alert" : "border-admin-border text-admin-muted"}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
export function Panel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 border border-admin-border bg-admin-bg ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-3">
        <div>
          <h2 className="text-[15px] font-semibold">{title}</h2>
          {description && (
            <p className="mt-1 text-[11px] text-admin-muted">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[27px]">
          {title}
        </h1>
        <p className="mt-2 text-xs text-admin-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid min-w-0 content-start gap-2 text-xs">
      <span className="font-medium">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-admin-muted">{hint}</span>}
    </label>
  );
}
export function Feedback({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  if (!error && !message) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={`my-3 border border-admin-border p-3 text-xs ${error ? "text-admin-alert" : "text-admin-ink"}`}
    >
      {error || message}
    </p>
  );
}
export function Dialog({
  open,
  onClose,
  title,
  eyebrow,
  side,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  side?: "left" | "right";
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialog.showModal();
    document.body.classList.add("overflow-hidden");
    return () => {
      dialog.close();
      document.body.classList.remove("overflow-hidden");
      previous?.focus();
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')).filter((node) => node.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={`fixed border border-admin-border bg-admin-bg p-0 text-admin-ink backdrop:bg-transparent ${side ? `inset-y-0 ${side === "left" ? "left-0 right-auto" : "right-0 left-auto"} m-0 h-dvh max-h-dvh w-full max-w-md` : "inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg"}`}
    >
      <header className="flex items-start justify-between gap-3 border-b border-admin-border p-5">
        <div className="min-w-0">
          {eyebrow && <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-admin-muted">{eyebrow}</p>}
          <h2 id={id} className="text-lg font-semibold">
            {title}
          </h2>
        </div>
        <Button
          onClick={onClose}
          className="w-11 px-0"
          aria-label="Close dialog"
          title="Close dialog"
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      </header>
      {children}
    </dialog>
  );
}
