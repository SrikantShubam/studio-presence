"use client";

import { useState, type FormEvent } from "react";
import { Check, MessageCircle, Phone, Save } from "lucide-react";
import { Button, Dialog, Field, Feedback, buttonClass, inputClass } from "./primitives";
import {
  contactPhone,
  errorMessage,
  normalizeIndianPhone,
  STATUS_LABELS,
  type Enquiry,
  type LeadAction,
  type LeadInput,
  type Mode,
} from "./types";

const sourceLabels: Record<Enquiry["source"], string> = {
  estimate: "Estimate calculator",
  form: "Website direct form",
  whatsapp: "WhatsApp floating CTA",
  call: "Walk-in / call",
  other: "Digital QR card",
};

export function NewEnquiryDialog({
  mode,
  action,
  onClose,
  onCreated,
}: {
  mode: Mode;
  action: LeadAction;
  onClose: () => void;
  onCreated: (item: Enquiry) => void;
}) {
  const [values, setValues] = useState<LeadInput>({
    name: "",
    phone: "",
    locality: "",
    projectType: "",
    budgetBand: "",
    timeline: "",
    message: "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const phone = normalizeIndianPhone(values.phone);
    if (!phone) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setError("");
    setPending(true);
    try {
      const result = await action({
        kind: "create",
        values: { ...values, name: values.name.trim(), phone: `+${phone}` },
      });
      if (!result.ok) throw new Error(result.error);
      onCreated(result.data);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setPending(false);
    }
  }
  const fields: {
    key: keyof LeadInput;
    label: string;
    required?: boolean;
    type?: string;
    max: number;
  }[] = [
    { key: "name", label: "Client name", required: true, max: 120 },
    {
      key: "phone",
      label: "Indian mobile number",
      required: true,
      type: "tel",
      max: 30,
    },
    { key: "locality", label: "Locality / city", max: 160 },
    { key: "projectType", label: "Project type", max: 160 },
    { key: "budgetBand", label: "Budget band", max: 100 },
    { key: "timeline", label: "Timeline", max: 160 },
  ];
  return (
    <Dialog
      open
      title="Log walk-in lead"
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      <form onSubmit={submit} className="p-5">
        <p className="mb-5 text-xs text-admin-muted">
          {mode === "demo"
            ? "Sample only. This lead stays in this session and no message is sent."
            : "Record a conversation from a studio visit or phone call."}
        </p>
        <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <Field key={field.key} label={field.label}>
              <input
                className={inputClass}
                type={field.type ?? "text"}
                required={field.required}
                maxLength={field.max}
                value={values[field.key]}
                onChange={(event) =>
                  setValues({ ...values, [field.key]: event.target.value })
                }
              />
            </Field>
          ))}
        </fieldset>
        <div className="mt-4">
          <Field label="Project brief">
            <textarea
              className={inputClass}
              disabled={pending}
              rows={3}
              maxLength={3000}
              value={values.message}
              onChange={(event) =>
                setValues({ ...values, message: event.target.value })
              }
            />
          </Field>
        </div>
        <Feedback error={error} />
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button disabled={pending} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={pending}>
            {pending
              ? "Saving…"
              : mode === "demo"
                ? "Add sample lead"
                : "Add enquiry"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export function EnquiryDetails({
  enquiry,
  mode,
  action,
  onClose,
  onUpdated,
}: {
  enquiry: Enquiry;
  mode: Mode;
  action: LeadAction;
  onClose: () => void;
  onUpdated: (item: Enquiry) => void;
}) {
  const [status, setStatus] = useState(enquiry.status);
  const [notes, setNotes] = useState(enquiry.notes ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    try {
      const result = await action({
        kind: "update",
        id: enquiry.id,
        status,
        notes,
      });
      if (!result.ok) throw new Error(result.error);
      onUpdated(result.data);
      setMessage(
        mode === "demo"
          ? "Sample changes saved for this session."
          : "Enquiry updated.",
      );
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <Dialog
      open
      side="right"
      title={enquiry.name}
      eyebrow="Enquiry details · Studio workspace"
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      <div className="max-h-[calc(100dvh-90px)] overflow-y-auto px-6 pb-28">
        <p className="pt-4 text-xs text-admin-muted">{enquiry.locality || "Locality not supplied"}</p>
        <div className="border-t border-admin-border py-5">
          <div className="mb-1 flex items-center justify-between gap-3">
            <strong>{enquiry.project_type || "Project brief"}</strong>
            <span className="font-mono text-xs">{enquiry.budget_band || "Budget not supplied"}</span>
          </div>
          <p className="text-[11px] text-admin-muted">{enquiry.timeline || "Timeline not supplied"} · Received {new Date(enquiry.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}</p>
        </div>
        <div className="border-t border-admin-border py-5">
          <h3 className="text-xs font-semibold">Client brief</h3>
          <p className="mb-3 mt-2 whitespace-pre-wrap text-sm leading-6">{enquiry.message || "No client brief added yet."}</p>
          <p className="text-[11px] text-admin-muted">Source: {sourceLabels[enquiry.source]}</p>
        </div>
        <form onSubmit={submit}>
          <fieldset disabled={pending || mode === "unavailable"} className="grid gap-5">
            <div className="border-t border-admin-border py-5">
              <div className="mb-3 flex items-center justify-between"><h3 className="text-xs font-semibold">Lead status</h3><span className="text-[10px] text-admin-muted">{STATUS_LABELS[status]}</span></div>
              <select aria-label="Lead status" className={inputClass} value={status} onChange={(event) => setStatus(event.target.value as Enquiry["status"])}>
                {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <p className="mt-2 text-[10px] text-admin-muted">Opening WhatsApp does not automatically mark a lead contacted.</p>
            </div>
            <div className="border-t border-admin-border py-5">
              <Field label="Private studio notes" hint="Notes are private and saved to your workspace.">
                <textarea className={inputClass} rows={6} maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Next step, measurements, preferences…" />
              </Field>
              <div className="mt-3 flex items-center gap-3">
                <Button type="submit" disabled={pending || mode === "unavailable"}><Save aria-hidden="true" className="size-4" />{pending ? "Saving…" : "Save notes"}</Button>
                {message && <span className="flex items-center gap-1 text-[11px] text-admin-muted"><Check aria-hidden="true" className="size-3.5" />Saved</span>}
              </div>
              <p className="mt-2 text-[10px] text-admin-muted">Closing also saves your note when it has changed.</p>
            </div>
            <Feedback error={error} message={message} />
          </fieldset>
        </form>
        <p className="mt-5 text-[10px] text-admin-muted">{enquiry.id.startsWith("sample-") ? "Demo phone" : "Client phone"}: <span className="font-mono">+{enquiry.phone}</span></p>
      </div>
      {contactPhone(enquiry.phone) && (
        <div className="sticky bottom-0 flex gap-2.5 border-t border-admin-border bg-admin-bg px-6 py-4">
          <a className={buttonClass + " flex-1 justify-center border-admin-primary text-admin-primary"} href={"https://wa.me/" + contactPhone(enquiry.phone)} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" className="size-4" />WhatsApp</a>
          <a className={buttonClass + " flex-1 justify-center"} href={"tel:+" + contactPhone(enquiry.phone)}><Phone aria-hidden="true" className="size-4" />Call client</a>
        </div>
      )}
    </Dialog>
  );
}
