"use client";

import { useState, type FormEvent } from "react";
import { Button, Dialog, Field, Feedback, inputClass } from "./primitives";
import {
  errorMessage,
  normalizeIndianPhone,
  STATUS_LABELS,
  type Enquiry,
  type LeadAction,
  type LeadInput,
  type Mode,
} from "./types";
import { ContactActions } from "./EnquiryDesk";

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
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      <div className="p-5">
        <p className="text-xs text-admin-muted">
          {[enquiry.project_type, enquiry.locality, enquiry.budget_band]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p className="my-5 whitespace-pre-wrap text-sm">
          {enquiry.message || "No brief supplied."}
        </p>
        <div className="mb-6 flex flex-wrap gap-2">
          <ContactActions enquiry={enquiry} />
        </div>
        <form onSubmit={submit}>
          <fieldset
            disabled={pending || mode === "unavailable"}
            className="grid gap-5"
          >
            <Field label="Lead status">
              <select
                className={inputClass}
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as Enquiry["status"])
                }
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Private notes"
              hint="Up to 2,000 characters. Notes are never shown on your public site."
            >
              <textarea
                className={inputClass}
                rows={9}
                maxLength={2000}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </Field>
            <Button type="submit" variant="primary">
              {pending ? "Saving…" : "Save enquiry"}
            </Button>
          </fieldset>
          <Feedback error={error} message={message} />
        </form>
      </div>
    </Dialog>
  );
}
