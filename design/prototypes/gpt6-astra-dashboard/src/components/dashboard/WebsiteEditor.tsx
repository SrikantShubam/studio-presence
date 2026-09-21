"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Check, ChevronRight, FileText, Image as ImageIcon, Images, Layers, Loader2, Monitor, PanelBottom, Phone, Plus, RotateCcw, Save, Smartphone, Trash2, Upload } from "lucide-react";
import { Badge, Button, Dialog, Field, PageHeading } from "@/components/ui/primitives";
import { StudioWebsite } from "@/components/site/StudioWebsite";
import type { StudioSettings, WebsiteContent, WebsiteSection, WebsiteSectionKey } from "@/lib/types";
import { apiRequest, errorMessage } from "@/lib/utils";

const SECTIONS = [
  { key: "hero", label: "Hero", icon: ImageIcon },
  { key: "about", label: "About studio", icon: FileText },
  { key: "projects", label: "Projects", icon: Images },
  { key: "services", label: "Services", icon: Layers },
  { key: "contact", label: "Contact", icon: Phone },
  { key: "footer", label: "Footer", icon: PanelBottom },
] as const;
const PAGES: Record<string, WebsiteSectionKey[]> = {
  Home: ["hero", "about", "projects", "services", "contact", "footer"],
  About: ["about", "contact", "footer"],
  Projects: ["projects", "contact", "footer"],
  Services: ["services", "contact", "footer"],
  Contact: ["contact", "footer"],
};

type Props = {
  initialDraft: WebsiteContent;
  published: WebsiteContent;
  settings: StudioSettings;
  onSaved: (content: WebsiteContent, published: boolean) => void;
};

export default function WebsiteEditor({ initialDraft, published, settings, onSaved }: Props) {
  const [content, setContent] = useState<WebsiteContent>(() => structuredClone(initialDraft));
  const [savedDraft, setSavedDraft] = useState(initialDraft);
  const [section, setSection] = useState<WebsiteSectionKey>("hero");
  const [page, setPage] = useState("Home");
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const changes = SECTIONS.filter(({ key }) => JSON.stringify(content[key]) !== JSON.stringify(savedDraft[key]));
  const publicationChanges = SECTIONS.filter(({ key }) => JSON.stringify(content[key]) !== JSON.stringify(published[key]));
  const dirty = changes.length > 0;
  const current = content[section];

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function updateSection(patch: Partial<WebsiteSection>) {
    setContent((previous) => ({ ...previous, [section]: { ...previous[section], ...patch } }));
    setFeedback("");
  }

  async function save(kind: "draft" | "publish") {
    setPending(true); setError("");
    try {
      const result = await apiRequest<{ websiteDraft: WebsiteContent }>("/api/workspace", "PATCH", { kind, data: content });
      setSavedDraft(result.websiteDraft);
      onSaved(result.websiteDraft, kind === "publish");
      setFeedback(kind === "publish" ? "Your website is published. The live site is up to date." : "Website draft saved. Your live site is unchanged.");
      setReviewOpen(false);
    } catch (error) { setError(errorMessage(error)); }
    finally { setPending(false); }
  }

  return (
    <>
      <PageHeading title="See your website. Make it yours." description="Edit a section and check the result in the preview. Publish when it feels right." action={<div className="flex gap-2"><Button disabled={!dirty || pending} onClick={() => setDiscardOpen(true)}><RotateCcw />Discard changes</Button><Button variant="primary" disabled={pending || !dirty} onClick={() => save("draft")}>{pending ? <Loader2 className="animate-spin" /> : <Save />}Save draft</Button></div>} />
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3 border border-border px-4 py-3">
        <div className="flex items-center gap-3"><span className="text-[11px] text-muted-foreground">Editing</span><select aria-label="Website page" className="!w-auto !py-[7px]" value={page} onChange={(event) => { setPage(event.target.value); setSection(PAGES[event.target.value][0]); }}>{Object.keys(PAGES).map((name) => <option key={name}>{name}</option>)}</select><Badge>English</Badge></div>
        <div className="flex flex-wrap items-center gap-3"><span className={`text-[11px] ${dirty ? "font-medium" : "text-muted-foreground"}`}>{dirty ? `${changes.length} section${changes.length === 1 ? "" : "s"} with unsaved changes` : publicationChanges.length ? "Draft saved · ready to review" : "Website up to date"}</span><Button onClick={() => setReviewOpen(true)} disabled={pending || publicationChanges.length === 0}>Review & publish<ChevronRight /></Button></div>
      </div>
      {(feedback || error) && <p role={error ? "alert" : "status"} className={`mb-4 border border-border px-4 py-3 text-[12px] ${error ? "text-destructive" : "text-success"}`}>{error || feedback}</p>}
      <div className="grid items-start gap-[18px] min-[1100px]:grid-cols-[300px_minmax(0,1fr)]">
        <section className="panel overflow-hidden" aria-label="Website section controls">
          <div className="grid grid-cols-2 gap-1.5 border-b border-border p-3.5">
            {SECTIONS.filter(({ key }) => PAGES[page].includes(key)).map(({ key, label, icon: Icon }) => <button key={key} className={`flex items-center gap-[7px] border p-2 text-left text-[11px] ${section === key ? "border-border bg-muted font-semibold" : "border-transparent hover:bg-muted/50"} ${!content[key].enabled ? "opacity-50" : ""}`} aria-pressed={section === key} onClick={() => setSection(key)}><Icon className="!size-3.5" />{label}{content[key].enabled && <span className="ml-auto size-1 bg-current" />}</button>)}
          </div>
          <fieldset disabled={pending} className="grid gap-4 p-[17px]">
            <div className="flex items-center justify-between"><h3>{SECTIONS.find((item) => item.key === section)?.label}</h3><Badge>English</Badge></div>
            <label className="flex items-center justify-between gap-4 text-[11px]">Show on website<input type="checkbox" checked={current.enabled} onChange={(event) => updateSection({ enabled: event.target.checked })} /></label>
            <Field label="Heading"><input maxLength={300} value={current.title} onChange={(event) => updateSection({ title: event.target.value })} /></Field>
            <Field label="Description"><textarea rows={4} maxLength={3000} value={current.body} onChange={(event) => updateSection({ body: event.target.value })} /></Field>
            {section === "hero" && <>
              <Field label="Button label"><input maxLength={100} value={content.hero.button} onChange={(event) => setContent({ ...content, hero: { ...content.hero, button: event.target.value } })} /></Field>
              <Field label="Hero image URL" hint="Use an HTTPS image URL or your existing local image."><input maxLength={2000} value={content.hero.image} onChange={(event) => setContent({ ...content, hero: { ...content.hero, image: event.target.value } })} /></Field>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={content.hero.image} alt="Current hero image" className="h-[110px] w-full border border-border object-cover" />
            </>}
            {section === "projects" && <>
              {content.projects.items.map((project, index) => <div key={index} className="grid gap-3 border border-border p-3">
                <div className="flex justify-between"><h3 className="!text-[11px]">Project <span className="font-mono">{index + 1}</span></h3><button aria-label={`Remove project ${index + 1}`} onClick={() => setContent({ ...content, projects: { ...content.projects, items: content.projects.items.filter((_, i) => i !== index) } })}><Trash2 className="!size-3.5 text-muted-foreground" /></button></div>
                {(["title", "location", "image"] as const).map((key) => <Field key={key} label={key === "image" ? "Image URL" : key === "location" ? "Location & scope" : "Project title"}><input value={project[key]} maxLength={key === "image" ? 2000 : 200} onChange={(event) => setContent({ ...content, projects: { ...content.projects, items: content.projects.items.map((item, i) => i === index ? { ...item, [key]: event.target.value } : item) } })} /></Field>)}
              </div>)}
              <Button disabled={content.projects.items.length >= 12} onClick={() => setContent({ ...content, projects: { ...content.projects, items: [...content.projects.items, { title: "New project", location: "Add location & scope", image: content.hero.image }] } })}><Plus />Add project</Button>
            </>}
            {section === "services" && <>
              {content.services.items.map((service, index) => <div key={index} className="grid gap-3 border border-border p-3">
                <div className="flex justify-between"><h3 className="!text-[11px]">Service <span className="font-mono">{index + 1}</span></h3><button aria-label={`Remove service ${index + 1}`} onClick={() => setContent({ ...content, services: { ...content.services, items: content.services.items.filter((_, i) => i !== index) } })}><Trash2 className="!size-3.5 text-muted-foreground" /></button></div>
                {(["title", "description", "price"] as const).map((key) => <Field key={key} label={key === "price" ? "Price note" : key === "description" ? "Description" : "Service title"}><input value={service[key]} maxLength={key === "description" ? 1000 : 200} onChange={(event) => setContent({ ...content, services: { ...content.services, items: content.services.items.map((item, i) => i === index ? { ...item, [key]: event.target.value } : item) } })} /></Field>)}
              </div>)}
              <Button disabled={content.services.items.length >= 12} onClick={() => setContent({ ...content, services: { ...content.services, items: [...content.services.items, { title: "New service", description: "Describe what this includes.", price: "Ask for a quote" }] } })}><Plus />Add service</Button>
            </>}
            <p className="text-[11px] leading-relaxed text-muted-foreground">{section === "contact" ? "Studio contact details are managed in Workspace settings. Visitor briefs are saved directly to your enquiry desk." : "Your preview updates as you type. Save a draft to keep your changes without changing the live website."}</p>
          </fieldset>
        </section>
        <section className="panel min-w-0 overflow-hidden min-[1100px]:sticky min-[1100px]:top-3.5" aria-label="Live website preview">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3.5 py-3">
            <div className="desk-tabs flex-nowrap"><button aria-pressed={device === "desktop"} className={`flex items-center gap-1.5 ${device === "desktop" ? "active" : ""}`} onClick={() => setDevice("desktop")}><Monitor />Desktop</button><button aria-pressed={device === "phone"} className={`flex items-center gap-1.5 ${device === "phone" ? "active" : ""}`} onClick={() => setDevice("phone")}><Smartphone />Phone</button></div>
            <a href="/site" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-muted-foreground">{settings.domain}<ArrowUpRight className="!size-3" /></a>
          </div>
          <div className="bg-muted p-2.5 min-[1200px]:p-[18px]">
            <div className="mx-auto h-[740px] max-w-full overflow-y-auto border border-border bg-background" style={{ width: device === "phone" ? 375 : "100%" }}><StudioWebsite content={content} settings={settings} preview sections={PAGES[page]} /></div>
          </div>
          <p className="border-t border-border px-3.5 py-3 text-[10px] text-muted-foreground">Interactive preview · Your live website only changes after publishing.</p>
        </section>
      </div>
      <Dialog open={reviewOpen} onClose={() => { if (!pending) setReviewOpen(false); }} title="Ready to make it live?" eyebrow="Review your website changes">
        <div className="p-6"><p className="text-[12px] text-muted-foreground">These sections will replace the current published version of your website.</p><ul className="my-5">{publicationChanges.map(({ key, label }) => <li key={key} className="flex items-center justify-between border-b border-border py-3"><span>{label}</span><Badge>{content[key].enabled ? "Updated" : "Hidden"}</Badge></li>)}</ul>{error && <p className="mb-4 text-destructive" role="alert">{error}</p>}<div className="flex justify-end gap-2"><Button disabled={pending} onClick={() => setReviewOpen(false)}>Keep editing</Button><Button variant="primary" disabled={pending} onClick={() => save("publish")}>{pending ? <Loader2 className="animate-spin" /> : <Upload />}{pending ? "Publishing…" : "Publish website"}</Button></div></div>
      </Dialog>
      <Dialog open={discardOpen} onClose={() => setDiscardOpen(false)} title="Discard unsaved changes?">
        <div className="p-6"><p className="mb-6 text-muted-foreground">Your last saved draft will be restored. Your published website will not change.</p><div className="flex justify-end gap-2"><Button onClick={() => setDiscardOpen(false)}>Keep editing</Button><Button variant="primary" onClick={() => { setContent(structuredClone(savedDraft)); setDiscardOpen(false); setFeedback("Your last saved draft has been restored."); setError(""); }}><Check />Discard changes</Button></div></div>
      </Dialog>
    </>
  );
}
