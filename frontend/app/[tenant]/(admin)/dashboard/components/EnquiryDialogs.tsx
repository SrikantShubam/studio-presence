"use client";

import { useState, type FormEvent } from "react";
import { Check, Phone, Save } from "lucide-react";
import { PhoneInput as InternationalPhoneInput } from "react-international-phone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { Button, Dialog, Field, Feedback, Select, buttonClass, inputClass } from "./primitives";
import {
  assigneeDisplayName,
  contactPhone,
  errorMessage,
  normalizeContactPhone,
  projectTypeOptions,
  projectTypeValue,
  STATUS_LABELS,
  type Enquiry,
  type LeadAction,
  type LeadInput,
  type Mode,
  type WorkspaceMember,
} from "./types";

const sourceLabels: Record<Enquiry["source"], string> = {
  estimate: "Estimate calculator",
  form: "Website direct form",
  whatsapp: "WhatsApp floating CTA",
  call: "Walk-in / call",
  other: "Digital QR card",
};

const phoneFieldClass = [
  "relative rounded-xl border border-admin-border bg-admin-bg",
  "[&_.react-international-phone-input-container]:!w-full",
  "[&_.react-international-phone-country-selector-button]:!border-0",
  "[&_.react-international-phone-country-selector-button]:!h-11",
  "[&_.react-international-phone-country-selector-button]:!min-h-11",
  "[&_.react-international-phone-country-selector-button]:!justify-start",
  "[&_.react-international-phone-country-selector-button]:!px-2",
  "[&_.react-international-phone-country-selector-button]:!bg-transparent",
  "[&_.react-international-phone-country-selector-button]:!text-admin-ink",
  "[&_.react-international-phone-country-selector-button:hover]:!bg-transparent",
  "[&_.react-international-phone-country-selector-button__dropdown-arrow]:!border-t-admin-muted",
  "[&_.react-international-phone-input]:!min-h-11",
  "[&_.react-international-phone-input]:!w-full",
  "[&_.react-international-phone-input]:!border-0",
  "[&_.react-international-phone-input]:!bg-transparent",
  "[&_.react-international-phone-input]:!text-admin-ink",
  "[&_.react-international-phone-country-selector-dropdown]:!max-h-72",
  "[&_.react-international-phone-country-selector-dropdown]:!rounded-md",
  "[&_.react-international-phone-country-selector-dropdown]:!border-admin-border",
  "[&_.react-international-phone-country-selector-dropdown]:!bg-admin-surface",
  "[&_.react-international-phone-country-selector-dropdown]:!text-admin-ink",
].join(" ");

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
  const [projectTypeOther, setProjectTypeOther] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const phone = normalizeContactPhone(values.phone);
    const projectType = projectTypeValue(values.projectType, projectTypeOther);
    if (!phone) {
      setError("Enter a valid international mobile number.");
      return;
    }
    if (!projectType) {
      setError("Describe the project type when Other is selected.");
      return;
    }
    setError("");
    setPending(true);
    try {
      const result = await action({
        kind: "create",
        values: { ...values, name: values.name.trim(), phone: `+${phone}`, projectType },
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
    max: number;
  }[] = [
    { key: "name", label: "Client name", required: true, max: 120 },
    { key: "locality", label: "Locality / city", max: 160 },
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
                required={field.required}
                maxLength={field.max}
                value={values[field.key]}
                onChange={(event) =>
                  setValues({ ...values, [field.key]: event.target.value })
                }
              />
            </Field>
          ))}
          <Field label="Mobile number" hint="Choose a country, then enter the mobile number.">
            <div className={phoneFieldClass}>
              <InternationalPhoneInput
                defaultCountry="in"
                forceDialCode
                required
                value={values.phone}
                onChange={(value) => setValues({ ...values, phone: value })}
              />
            </div>
          </Field>
          <Field label="Project type">
            <Select
              aria-label="Project type"
              required
              value={values.projectType}
              onChange={(event) => setValues({ ...values, projectType: event.target.value })}
            >
              <option value="">Select project type</option>
              {projectTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </Field>
          {values.projectType === "Other" && (
            <Field label="Describe the project type">
              <input
                className={inputClass}
                required
                maxLength={160}
                value={projectTypeOther}
                onChange={(event) => setProjectTypeOther(event.target.value)}
              />
            </Field>
          )}
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
  studioName,
  mode,
  action,
  onClose,
  onUpdated,
  members = [],
  currentRole = "viewer",
  currentUserId,
  canAssign = false,
}: {
  enquiry: Enquiry;
  studioName?: string;
  mode: Mode;
  action: LeadAction;
  onClose: () => void;
  onUpdated: (item: Enquiry) => void;
  members?: WorkspaceMember[];
  currentRole?: WorkspaceMember["role"];
  currentUserId?: string;
  canAssign?: boolean;
}) {
  const [status, setStatus] = useState(enquiry.status);
  const [notes, setNotes] = useState(enquiry.notes ?? "");
  const [assignee, setAssignee] = useState(enquiry.assigned_to ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const canUpdateWork = mode === "demo"
    ? currentRole === "owner" || currentRole === "viewer" || (currentRole === "editor" && enquiry.assigned_to === currentUserId)
    : currentRole === "owner" || currentRole === "viewer" || (currentRole === "editor" && enquiry.assigned_to === currentUserId);
  const canAssignLead = mode === "demo" ? currentRole === "owner" : canAssign;
  const assignableMembers = members.filter((member) => member.role === "owner" || member.role === "editor");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canUpdateWork) return;
    setPending(true);
    setError("");
    setMessage("");
    try {
      const result = await action({ kind: "update", id: enquiry.id, status, notes });
      if (!result.ok) throw new Error(result.error);
      let saved: Enquiry = {
        ...result.data,
        status,
        notes: notes.trim() || null,
        updated_at: result.data.updated_at ?? new Date().toISOString(),
      };
      if (canAssignLead && assignee && assignee !== enquiry.assigned_to) {
        const assignment = await action({ kind: "assign", id: enquiry.id, userId: assignee });
        if (!assignment.ok) throw new Error(assignment.error);
        saved = {
          ...assignment.data,
          status,
          notes: notes.trim() || null,
          updated_at: assignment.data.updated_at ?? saved.updated_at,
        };
      }
      onUpdated(saved);
      setMessage(mode === "demo" ? "Sample changes saved for this session." : "Enquiry updated.");
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
      eyebrow={`Enquiry details - ${studioName || "Studio workspace"}`}
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      <div className="admin-scrollbar max-h-[calc(100dvh-90px)] overflow-y-auto px-6 pb-28">
        <p className="pt-4 text-xs text-admin-muted">{enquiry.locality || "Locality not supplied"}</p>
        <div className="border-t border-admin-border py-5 rounded-xl">
          <div className="mb-1 flex items-center justify-between gap-3">
            <strong>{enquiry.project_type || "Project brief"}</strong>
            <span className="font-mono text-xs">{enquiry.budget_band || "Budget not supplied"}</span>
          </div>
          <p className="text-[11px] text-admin-muted">{enquiry.timeline || "Timeline not supplied"} · Received {new Date(enquiry.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}</p>
        </div>
        <div className="border-t border-admin-border py-5 rounded-xl">
          <h3 className="text-xs font-semibold">Client brief</h3>
          <p className="mb-3 mt-2 whitespace-pre-wrap text-sm leading-6">{enquiry.message || "No client brief added yet."}</p>
          <p className="text-[11px] text-admin-muted">Source: {sourceLabels[enquiry.source]}</p>
        </div>
        <form onSubmit={submit}>
          <fieldset disabled={pending || mode === "unavailable" || !canUpdateWork} className="grid gap-5">
            <div className="border-t border-admin-border py-5 rounded-xl">
              <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-xs font-semibold">Assignee</h3><span className="text-[10px] text-admin-muted">{assigneeDisplayName(enquiry.assigned_to, members)}</span></div>
              {canAssignLead && assignableMembers.length > 0 ? (
                <Field label="Assign to active owner or editor">
                  <Select aria-label="Lead assignee" value={assignee} onChange={(event) => setAssignee(event.target.value)}>
                    {assignableMembers.map((member) => <option key={member.user_id} value={member.user_id}>{member.display_name || member.email || member.role}</option>)}
                  </Select>
                </Field>
              ) : (
                <p className="text-xs text-admin-muted">{canAssignLead ? "No active owner or editor is available." : "Only the workspace owner can reassign enquiries."}</p>
              )}
            </div>
            <div className="border-t border-admin-border py-5 rounded-xl">
              <div className="mb-3 flex items-center justify-between"><h3 className="text-xs font-semibold">Lead status</h3><span className="text-[10px] text-admin-muted">{STATUS_LABELS[status]}</span></div>
              <Select aria-label="Lead status" value={status} onChange={(event) => setStatus(event.target.value as Enquiry["status"])}>
                {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </Select>
              <p className="mt-2 text-[10px] text-admin-muted">Opening WhatsApp does not automatically mark a lead contacted.</p>
            </div>
            <div className="border-t border-admin-border py-5 rounded-xl">
              <Field label="Private studio notes" hint="Notes are private and saved to your workspace.">
                <textarea className={inputClass} rows={6} maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Next step, measurements, preferences…" />
              </Field>
              <div className="mt-3 flex items-center gap-3">
                <Button type="submit" disabled={pending || mode === "unavailable" || !canUpdateWork}><Save aria-hidden="true" className="size-4" />{pending ? "Saving…" : "Save changes"}</Button>
                {message && <span className="flex items-center gap-1 text-[11px] text-admin-muted"><Check aria-hidden="true" className="size-3.5" />Saved</span>}
              </div>
              {!canUpdateWork && <p className="mt-2 text-[10px] text-admin-muted">Only the assigned editor or workspace owner can update status and notes.</p>}
            </div>
            <Feedback error={error} message={message} />
          </fieldset>
        </form>
        <p className="mt-5 text-[10px] text-admin-muted">{enquiry.id.startsWith("sample-") ? "Demo phone" : "Client phone"}: <span className="font-mono">{contactPhone(enquiry.phone) ? `+${contactPhone(enquiry.phone)}` : enquiry.phone}</span></p>
      </div>
      {contactPhone(enquiry.phone) && (
        <div className="sticky bottom-0 flex gap-2.5 border-t border-admin-border bg-admin-bg px-6 py-4 rounded-xl">
          <a className={buttonClass + " flex-1 justify-center"} href={"https://wa.me/" + contactPhone(enquiry.phone)} target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faWhatsapp} aria-hidden="true" className="size-4 text-admin-primary" />WhatsApp</a>
          <a className={buttonClass + " flex-1 justify-center"} href={"tel:+" + contactPhone(enquiry.phone)}><Phone aria-hidden="true" className="size-4" />Call client</a>
        </div>
      )}
    </Dialog>
  );
}
