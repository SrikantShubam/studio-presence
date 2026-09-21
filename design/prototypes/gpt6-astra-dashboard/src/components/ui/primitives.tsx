"use client";

import { Children, cloneElement, isValidElement, useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { X } from "lucide-react";
import type { EnquiryStatus } from "@/lib/types";

export function Button({ variant = "default", className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" | "ghost" | "danger" }) {
  return <button type={type} className={`btn ${variant === "default" ? "" : `btn-${variant}`} ${className}`} {...props} />;
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`badge ${className}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: EnquiryStatus }) {
  return <Badge className={status === "New" ? "border-destructive/20 bg-destructive/6 text-destructive" : status === "Won" ? "text-success" : ""}>{status === "New" && <span className="inline-block size-1 bg-current" />}{status}</Badge>;
}

export function PageHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div>{action && <div className="shrink-0">{action}</div>}</div>;
}

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  type ControlProps = { children?: ReactNode; "aria-label"?: string; "aria-labelledby"?: string; "aria-describedby"?: string };
  function associateControls(nodes: ReactNode): ReactNode {
    return Children.map(nodes, (child) => {
      if (!isValidElement<ControlProps>(child)) return child;
      if (typeof child.type === "string" && ["input", "select", "textarea"].includes(child.type)) {
        return cloneElement(child, {
          "aria-labelledby": child.props["aria-labelledby"] || (child.props["aria-label"] ? undefined : labelId),
          "aria-describedby": [child.props["aria-describedby"], hint ? hintId : undefined].filter(Boolean).join(" ") || undefined,
        });
      }
      return child.props.children ? cloneElement(child, {}, associateControls(child.props.children)) : child;
    });
  }
  return <label className={`field ${className}`}><span id={labelId}>{label}</span>{associateControls(children)}{hint && <span id={hintId} className="text-[10px] text-muted-foreground">{hint}</span>}</label>;
}

/** Native dialog provides focus trapping, Escape handling, and focus restoration. */
export function Dialog({ open, onClose, title, eyebrow, side = false, children }: { open: boolean; onClose: () => void; title: string; eyebrow?: string; side?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog ref={ref} aria-labelledby={titleId} className={side ? "studio-dialog studio-sheet" : "studio-dialog"} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); } }}>
      <div className="flex items-start justify-between gap-4 border-b border-border p-6">
        <div>{eyebrow && <p className="mb-2 text-[11px] text-muted-foreground">{eyebrow}</p>}<h2 id={titleId} className={side ? "text-[24px] tracking-[-0.7px]" : ""}>{title}</h2></div>
        <Button className="icon-button shrink-0" onClick={onClose} aria-label="Close dialog"><X /></Button>
      </div>
      {children}
    </dialog>
  );
}
