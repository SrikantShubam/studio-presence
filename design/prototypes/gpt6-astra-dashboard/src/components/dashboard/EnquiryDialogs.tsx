"use client";

import { useState, type FormEvent } from "react";
import { Check, Loader2, MessageCircle, Phone, Save } from "lucide-react";
import { Button, Dialog, Field, StatusBadge } from "@/components/ui/primitives";
import { CITY_DEMAND } from "@/lib/demo-data";
import { ENQUIRY_STATUSES, type Enquiry, type EnquiryStatus } from "@/lib/types";
import { apiRequest, errorMessage, whatsappURL } from "@/lib/utils";

export function NewEnquiryDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (enquiry: Enquiry) => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setPending(true);
    setError("");
    try {
      const enquiry = await apiRequest<Enquiry>("/api/enquiries", "POST", { ...values, value: Number(values.value) });
      form.reset();
      onCreated(enquiry);
      onClose();
    } catch (error) { setError(errorMessage(error)); }
    finally { setPending(false); }
  }

  return (
    <Dialog open={open} onClose={() => { if (!pending) { setError(""); onClose(); } }} title="Log an offline enquiry" eyebrow="Your enquiry desk">
      <div className="p-6">
        <p className="mb-5 text-[12px] text-muted-foreground">Keep walk-ins and phone consultations with your website enquiries.</p>
        <form className="grid gap-[18px]" onSubmit={submit}>
          <Field label="Client name"><input name="name" required maxLength={80} placeholder="e.g. Ananya Sinha" autoComplete="name" autoFocus /></Field>
          <div className="form-grid">
            <Field label="Indian mobile number"><input name="phone" required inputMode="tel" pattern="[6-9][0-9]{9}" maxLength={10} placeholder="10-digit mobile" autoComplete="tel-national" /></Field>
            <Field label="City"><select name="city">{CITY_DEMAND.map((city) => <option key={city.name}>{city.name}</option>)}</select></Field>
          </div>
          <div className="form-grid">
            <Field label="Locality"><input name="locality" required maxLength={80} placeholder="e.g. Boring Road" /></Field>
            <Field label="Source"><select name="source"><option>Studio walk-in</option><option>Phone consultation</option></select></Field>
          </div>
          <div className="form-grid">
            <Field label="Project type"><select name="projectType"><option>Full home</option><option>Modular kitchen</option><option>Renovation</option><option>Commercial space</option></select></Field>
            <Field label="Budget in lakh"><input className="font-mono" name="value" type="number" min="0.1" max="1000" step="0.1" placeholder="12.0" required /></Field>
          </div>
          <Field label="Client brief"><textarea name="brief" rows={3} maxLength={2000} placeholder="What would they like to create?" /></Field>
          {error && <p role="alert" className="text-[12px] text-destructive">{error}</p>}
          <div className="flex items-center justify-between border-t border-border pt-4"><span className="text-[10px] text-muted-foreground">Saved securely to your workspace</span><Button type="submit" variant="primary" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <Check />}{pending ? "Saving…" : "Save enquiry"}</Button></div>
        </form>
      </div>
    </Dialog>
  );
}

export function EnquiryDetails({ enquiry, onClose, onUpdated, studioName }: { enquiry: Enquiry; onClose: () => void; onUpdated: (enquiry: Enquiry) => void; studioName: string }) {
  const [notes, setNotes] = useState(enquiry.notes);
  const [savedNotes, setSavedNotes] = useState(enquiry.notes);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const dirty = notes !== savedNotes;

  async function update(patch: { status?: EnquiryStatus; notes?: string }) {
    setPending(true);
    setError("");
    try {
      const updated = await apiRequest<Enquiry>(`/api/enquiries/${enquiry.id}`, "PATCH", patch);
      onUpdated(updated);
      if (patch.notes !== undefined) { setSavedNotes(patch.notes); setSaved(true); }
      return true;
    } catch (error) { setError(errorMessage(error)); return false; }
    finally { setPending(false); }
  }

  async function close() {
    if (pending) return;
    if (dirty && !(await update({ notes }))) return;
    onClose();
  }

  return (
    <Dialog open side onClose={close} title={enquiry.name} eyebrow="Enquiry details · Studio workspace">
      <div className="px-6 pb-6">
        <p className="pt-4 text-muted-foreground">{enquiry.locality}, {enquiry.city}</p>
        <div className="section-line"><div className="mb-1 flex items-center justify-between gap-3"><strong>{enquiry.projectType}</strong><span className="font-mono">{enquiry.budget}</span></div><p className="text-[11px] text-muted-foreground">{enquiry.timeline} · Received {enquiry.age.toLowerCase()}</p></div>
        <div className="section-line"><h3>Client brief</h3><p className="mb-3 mt-2">{enquiry.brief || "No client brief added yet."}</p><p className="text-[11px] text-muted-foreground">Source: {enquiry.source}</p></div>
        <div className="section-line">
          <div className="mb-3 flex items-center justify-between"><h3>Lead status</h3><StatusBadge status={enquiry.status} /></div>
          <select aria-label="Lead status" value={enquiry.status} disabled={pending} onChange={(event) => update({ status: event.target.value as EnquiryStatus })}>{ENQUIRY_STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
          <p className="mt-2 text-[10px] text-muted-foreground">Opening WhatsApp does not automatically mark a lead contacted.</p>
        </div>
        <div className="section-line">
          <Field label="Private studio notes"><textarea rows={6} value={notes} onChange={(event) => { setNotes(event.target.value); setSaved(false); }} maxLength={10000} placeholder="Next step, measurements, preferences…" /></Field>
          <div className="mt-3 flex items-center gap-3"><Button disabled={!dirty || pending} onClick={() => update({ notes })}>{pending ? <Loader2 className="animate-spin" /> : <Save />}Save notes</Button>{saved && <span className="flex items-center gap-1 text-[11px] text-success"><Check />Saved</span>}</div>
          <p className="mt-2 text-[10px] text-muted-foreground">Notes are private and saved to your workspace. Closing also saves your note.</p>
        </div>
        {error && <p role="alert" className="mt-3 text-destructive">{error}</p>}
        <p className="mt-5 text-[10px] text-muted-foreground">{enquiry.id.startsWith("sample-") ? "Demo phone" : "Client phone"}: <span className="font-mono">+{enquiry.phone}</span></p>
      </div>
      <div className="sticky bottom-0 flex gap-2.5 border-t border-border bg-background px-6 py-[18px]">
        <a className="btn flex-1 !text-success" href={whatsappURL(enquiry, studioName)} target="_blank" rel="noopener noreferrer"><MessageCircle />WhatsApp</a>
        <a className="btn flex-1" href={`tel:+${enquiry.phone}`}><Phone />Call client</a>
      </div>
    </Dialog>
  );
}
