"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, FileText, Image as ImageIcon, Images, Layers, Monitor, PanelBottom, Phone, Share2, Smartphone, Upload } from "lucide-react";
import { createPortal } from "react-dom";
import {
  Button,
  Dialog,
  Field,
  Feedback,
  Panel,
  PageHeading,
  Select,
  inputClass,
  buttonClass,
} from "./primitives";
import {
  applyConfigPatch,
  canUploadWorkspaceLogo,
  errorMessage,
  type Mode,
  type SaveConfig,
  type WorkspaceConfig,
} from "./types";

const SECTIONS = [
  { id: "hero", label: "Hero", icon: ImageIcon },
  { id: "about", label: "About studio", icon: FileText },
  { id: "portfolio", label: "Projects", icon: Images },
  { id: "services", label: "Services", icon: Layers },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "footer", label: "Footer", icon: PanelBottom },
] as const;
type Section = (typeof SECTIONS)[number]["id"];
const PAGES: Record<string, Section[]> = { Home: ["hero", "about", "portfolio", "services", "contact", "footer"], About: ["about", "contact", "footer"], Projects: ["portfolio", "contact", "footer"], Services: ["services", "contact", "footer"], Contact: ["contact", "footer"] };

export default function WebsiteEditor({
  config,
  tenant,
  mode,
  canEdit,
  canUploadAssets,
  onSave,
}: {
  config: WorkspaceConfig;
  tenant: string;
  mode: Mode;
  canEdit: boolean;
  canUploadAssets: boolean;
  onSave: SaveConfig;
}) {
  const [patch, setPatch] = useState<Record<string, unknown>>({});
  const [section, setSection] = useState<Section>("hero");
  const [page, setPage] = useState("Home");
  const [language, setLanguage] = useState("English");
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [preview, setPreview] = useState<"draft" | "published">("draft");
  const [pending, setPending] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState("");
  const [uploadingOgImage, setUploadingOgImage] = useState(false);
  const [selectedOgFile, setSelectedOgFile] = useState("");
  const [showCustomOgUrl, setShowCustomOgUrl] = useState(false);
  const [review, setReview] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const draft = applyConfigPatch(config, patch);
  const sectionEnabled =
    section === "hero" ? draft.sections.hero.enabled :
    section === "about" ? Boolean(draft.sections.about?.enabled) :
    section === "portfolio" ? draft.sections.portfolio.enabled :
    section === "services" ? Boolean(draft.sections.services?.enabled) :
    section === "contact" ? Boolean(draft.sections.contact?.enabled) :
    Boolean(draft.sections.footer?.enabled);
  const dirty = Object.keys(patch).length > 0;
  const canUploadLogo = canUploadWorkspaceLogo({ canUploadAssets });
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  function update(path: string, value: unknown) {
    setPatch((previous) => ({ ...previous, [path]: value }));
    setFeedback("");
  }
  function field(
    label: string,
    path: string,
    value: string | undefined,
    multiline = false,
  ) {
    return (
      <Field label={label}>
        {multiline ? (
          <textarea
            className={inputClass}
            rows={5}
            maxLength={5000}
            value={value ?? ""}
            onChange={(event) => update(path, event.target.value)}
          />
        ) : (
          <input
            className={inputClass}
            maxLength={500}
            value={value ?? ""}
            onChange={(event) => update(path, event.target.value)}
          />
        )}
      </Field>
    );
  }
  async function uploadLogo(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      setError("File exceeds the 2 MB limit. Please select an image under 2 MB.");
      setSelectedLogoFile("");
      return;
    }
    if (file.type && !["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) {
      setError("Unsupported format. Please upload a PNG, JPG, WebP, or SVG logo.");
      setSelectedLogoFile("");
      return;
    }
    setUploadingLogo(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assetType", "logo");
      const response = await fetch("/api/onboarding/upload", { method: "POST", body: formData });
      const payload = (await response.json()) as { assetPath?: string; faviconPath?: string; error?: string };
      if (!response.ok || !payload.assetPath) throw new Error(payload.error ?? "Logo upload failed.");
      update("brand.logo", payload.assetPath);
      if (payload.faviconPath) update("brand.favicon", payload.faviconPath);
      setFeedback("Logo uploaded. Review and save to apply it.");
    } catch (uploadError) {
      setError(errorMessage(uploadError));
    } finally {
      setUploadingLogo(false);
    }
  }

  async function uploadOgImage(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      setError("File exceeds the 2 MB limit. Please select an image under 2 MB.");
      setSelectedOgFile("");
      return;
    }
    if (file.type && !["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Unsupported format. Please upload a PNG, JPG, or WebP photo.");
      setSelectedOgFile("");
      return;
    }
    setUploadingOgImage(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assetType", "photo");
      const response = await fetch("/api/onboarding/upload", { method: "POST", body: formData });
      const payload = (await response.json()) as { assetPath?: string; error?: string };
      if (!response.ok || !payload.assetPath) throw new Error(payload.error ?? "Social share image upload failed.");
      update("brand.ogImage", payload.assetPath);
      setFeedback("Social share image uploaded. Review and save to apply it.");
    } catch (uploadError) {
      setError(errorMessage(uploadError));
    } finally {
      setUploadingOgImage(false);
    }
  }

  async function save() {
    setPending(true);
    setError("");
    try {
      await onSave(patch);
      setPatch({});
      setReview(false);
      setRevision((value) => value + 1);
      setFeedback(
        mode === "demo"
          ? "Demo changes saved in this browser."
          : "Website changes saved. The public preview has been refreshed.",
      );
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <PageHeading
        title="See your website. Make it yours."
        description={
          mode === "demo"
            ? "Try changes in the draft preview. Save locally to keep them in this browser."
            : "Review edits before saving them to your public website."
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!dirty || pending}
              onClick={() => {
                setPatch({});
                setFeedback("Unsaved changes discarded.");
              }}
            >
              Discard
            </Button>
            <Button
              variant="primary"
              disabled={!dirty || pending || !canEdit}
              onClick={() => setReview(true)}
            >
              Review & save
            </Button>
          </div>
        }
      />
      <Feedback error={error} message={feedback} />
      <div className="mb-4 flex flex-wrap items-end gap-4 border border-admin-border bg-admin-surface p-4">
        <label className="grid min-w-40 gap-1 text-xs font-medium">
          Page
          <Select
            value={page}
            onChange={(event) => {
              setPage(event.target.value);
              setSection(PAGES[event.target.value]![0]!);
            }}
          >
            <option>Home</option>
            <option>About</option>
            <option>Projects</option>
            <option>Services</option>
            <option>Contact</option>
          </Select>
        </label>
        <label className="grid min-w-40 gap-1 text-xs font-medium">
          Language
          <Select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option>English</option>
            <option>Hindi</option>
          </Select>
        </label>
        <p className="pb-2 text-[10px] text-admin-muted">Language changes the editor view. Publish translated content separately.</p>
      </div>
      <Panel title="Studio identity & search" description="Set the public logo and the metadata used when your site is shared.">
        <div className="grid gap-4 p-4 lg:grid-cols-2">
          {/* Compact Logo Card */}
          <div className="flex flex-col justify-between border border-admin-border bg-admin-surface p-3.5">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xs font-semibold text-admin-ink">Choose logo</h3>
                  <p className="mt-0.5 text-[11px] text-admin-muted">
                    {canUploadLogo
                      ? "Header, favicon & documents · PNG, JPG, WebP"
                      : "Available from authenticated dashboard."}
                  </p>
                </div>
                {/* Compact Current Logo Box */}
                <div className="shrink-0 text-right">
                  <div className="mb-1 flex items-center justify-end gap-1">
                    <span
                      className={`inline-block size-1.5 rounded-full ${
                        draft.brand.logo ? "bg-admin-success" : "bg-admin-muted"
                      }`}
                    />
                    <span className="text-[10px] uppercase tracking-wider text-admin-muted">
                      {draft.brand.logo ? "Active" : "None"}
                    </span>
                  </div>
                  <div className="flex h-11 w-24 items-center justify-center border border-admin-border bg-admin-bg p-1">
                    {draft.brand.logo ? (
                      <img
                        src={draft.brand.logo}
                        alt="Current studio logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-admin-muted">No logo</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Action row */}
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-admin-border pt-3">
              <label
                className={`${buttonClass} shrink-0 cursor-pointer border-admin-border bg-admin-raised px-2.5 py-1.5 text-xs text-admin-ink hover:bg-admin-surface ${
                  uploadingLogo || !canUploadLogo ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <Upload aria-hidden="true" className="size-3" />
                <span>{uploadingLogo ? "Uploading…" : "Choose logo"}</span>
                <input
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  disabled={uploadingLogo || !canUploadLogo}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setSelectedLogoFile(file.name);
                    void uploadLogo(file);
                  }}
                />
              </label>
              <span className="min-w-0 flex-1 truncate text-[11px] text-admin-muted">
                {selectedLogoFile ? (
                  <span className="inline-flex items-center gap-1 font-medium text-admin-ink">
                    <Check aria-hidden="true" className="size-3 text-admin-success" />
                    {selectedLogoFile}
                  </span>
                ) : draft.brand.logo ? (
                  "Active logo in use"
                ) : (
                  "No file chosen"
                )}
              </span>
              {draft.brand.logo && (
                <button
                  type="button"
                  onClick={() => {
                    update("brand.logo", "");
                    setSelectedLogoFile("");
                  }}
                  className="text-[11px] text-admin-muted hover:text-admin-alert"
                  title="Remove logo"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Compact Social Share Image Card */}
          <div className="flex flex-col justify-between border border-admin-border bg-admin-surface p-3.5">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xs font-semibold text-admin-ink">Social share image</h3>
                  <p className="mt-0.5 text-[11px] text-admin-muted">
                    Chat & link preview card · 1200 × 630 recommended
                  </p>
                </div>
                {/* Compact Social Thumbnail */}
                <div className="shrink-0 text-right">
                  <div className="mb-1 flex items-center justify-end gap-1">
                    <span
                      className={`inline-block size-1.5 rounded-full ${
                        draft.brand.ogImage ? "bg-admin-success" : "bg-admin-muted"
                      }`}
                    />
                    <span className="text-[10px] uppercase tracking-wider text-admin-muted">
                      {draft.brand.ogImage ? "Custom" : "Auto"}
                    </span>
                  </div>
                  <div className="flex h-11 w-24 items-center justify-center overflow-hidden border border-admin-border bg-admin-bg">
                    {draft.brand.ogImage ? (
                      <img
                        src={draft.brand.ogImage}
                        alt="Social share preview"
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] text-admin-muted">
                        <Share2 aria-hidden="true" className="size-3 opacity-50" />
                        <span>Dynamic</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Action row */}
            <div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-admin-border pt-3">
                <label
                  className={`${buttonClass} shrink-0 cursor-pointer border-admin-border bg-admin-raised px-2.5 py-1.5 text-xs text-admin-ink hover:bg-admin-surface ${
                    uploadingOgImage || !canUploadLogo ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  <Upload aria-hidden="true" className="size-3" />
                  <span>{uploadingOgImage ? "Uploading…" : "Choose image"}</span>
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={uploadingOgImage || !canUploadLogo}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setSelectedOgFile(file.name);
                      void uploadOgImage(file);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowCustomOgUrl((v) => !v)}
                  className="text-[11px] text-admin-muted hover:text-admin-ink"
                >
                  {showCustomOgUrl ? "Hide URL" : "Paste URL"}
                </button>
                <span className="min-w-0 flex-1 truncate text-[11px] text-admin-muted">
                  {selectedOgFile && (
                    <span className="inline-flex items-center gap-1 font-medium text-admin-ink">
                      <Check aria-hidden="true" className="size-3 text-admin-success" />
                      {selectedOgFile}
                    </span>
                  )}
                </span>
                {draft.brand.ogImage && (
                  <button
                    type="button"
                    onClick={() => {
                      update("brand.ogImage", "");
                      setSelectedOgFile("");
                    }}
                    className="text-[11px] text-admin-muted hover:text-admin-alert"
                    title="Remove social share image"
                  >
                    Remove
                  </button>
                )}
              </div>
              {showCustomOgUrl && (
                <div className="mt-2.5">
                  <input
                    className={inputClass}
                    type="url"
                    value={draft.brand.ogImage ?? ""}
                    placeholder="https://your-studio.in/share-image.jpg"
                    onChange={(event) => update("brand.ogImage", event.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Engine Metadata (Spacious & Prominent) */}
        <div className="grid gap-4 border-t border-admin-border p-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
            <Field
              label="Meta title"
              hint={`${(draft.seo.title ?? "").length} / 160 characters · Browser tab & Google headline`}
            >
              <input
                className={inputClass}
                maxLength={160}
                value={draft.seo.title}
                onChange={(event) => update("seo.title", event.target.value)}
              />
            </Field>

            <Field
              label="Meta description"
              hint={`${(draft.seo.description ?? "").length} / 320 characters · Primary snippet in Google search results`}
            >
              <textarea
                className={inputClass}
                rows={4}
                maxLength={320}
                value={draft.seo.description}
                onChange={(event) => update("seo.description", event.target.value)}
              />
            </Field>
          </div>

          {/* Search Result Snippet Simulation */}
          <div className="border border-admin-border bg-admin-bg p-3">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-admin-muted">
              Google search result preview
            </p>
            <p className="truncate text-xs text-admin-primary">
              https://{tenant}.studiopresence.in
            </p>
            <p className="truncate text-sm font-semibold text-admin-ink hover:underline">
              {draft.seo.title || config.business.name}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-admin-muted">
              {draft.seo.description || "Interior design studio portfolio, residential and commercial design services."}
            </p>
          </div>
        </div>
      </Panel>
      <div className="grid items-start gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Panel title="Website sections">
          <div className="grid grid-cols-2 gap-2 p-4">
            {SECTIONS.filter((item) => PAGES[page]!.includes(item.id)).map((item) => (
              <Button
                key={item.id}
                aria-pressed={section === item.id}
                variant={section === item.id ? "primary" : undefined}
                onClick={() => setSection(item.id)}
              >
                <item.icon aria-hidden="true" className="size-3.5" strokeWidth={1.8} />{item.label}
              </Button>
            ))}
          </div>
          <fieldset
            className="grid gap-4 border-t border-admin-border p-4"
            disabled={pending || !canEdit}
          >
            <label className="flex items-center justify-between gap-3 border border-admin-border bg-admin-bg px-3 py-2 text-xs">
              Show on website
              <input
                type="checkbox"
                className="size-4 accent-admin-primary"
                checked={sectionEnabled}
                onChange={(event) => update("sections." + section + ".enabled", event.target.checked)}
              />
            </label>
            {section === "hero" && (
              <>
                {field(
                  "Headline",
                  "sections.hero.headline",
                  draft.sections.hero.headline,
                )}
                {field(
                  "Description",
                  "sections.hero.sub",
                  draft.sections.hero.sub,
                  true,
                )}
                {field(
                  "Button label",
                  "sections.hero.ctaLabel",
                  draft.sections.hero.ctaLabel,
                )}
                {field(
                  "Image path",
                  "sections.hero.image",
                  draft.sections.hero.image,
                )}
                <p className="text-[10px] text-admin-muted">
                  Use an existing image path beginning with /.
                </p>
              </>
            )}
            {section === "about" &&
              (draft.sections.about ? (
                <>
                  {field(
                    "Heading",
                    "sections.about.heading",
                    draft.sections.about.heading,
                  )}
                  {field(
                    "About your studio",
                    "sections.about.body",
                    draft.sections.about.body,
                    true,
                  )}
                </>
              ) : (
                <p>This section is not configured.</p>
              ))}
            {section === "portfolio" && (
              <>
                {field(
                  "Projects introduction",
                  "sections.portfolio.introText",
                  draft.sections.portfolio.introText,
                  true,
                )}
                {draft.sections.portfolio.projects.map((project, index) => (
                  <div
                    className="grid gap-3 border border-admin-border p-3"
                    key={project.slug}
                  >
                    <p className="text-[10px] text-admin-muted">
                      {project.slug}
                    </p>
                    {(["title", "location", "cover"] as const).map((key) => (
                      <Field
                        key={key}
                        label={
                          key === "cover"
                            ? "Image path"
                            : key === "title"
                              ? "Project title"
                              : "Location"
                        }
                      >
                        <input
                          className={inputClass}
                          value={project[key] ?? ""}
                          onChange={(event) =>
                            update(
                              "sections.portfolio.projects",
                              draft.sections.portfolio.projects.map(
                                (item, i) =>
                                  i === index
                                    ? { ...item, [key]: event.target.value }
                                    : item,
                              ),
                            )
                          }
                        />
                      </Field>
                    ))}
                  </div>
                ))}
              </>
            )}
            {section === "services" &&
              (draft.sections.services ? (
                draft.sections.services.items.map((service, index) => (
                  <div
                    className="grid gap-3 border border-admin-border p-3"
                    key={index}
                  >
                    {(["title", "blurb"] as const).map((key) => (
                      <Field
                        key={key}
                        label={
                          key === "title" ? "Service title" : "Description"
                        }
                      >
                        <textarea
                          rows={key === "title" ? 1 : 3}
                          className={inputClass}
                          value={service[key]}
                          onChange={(event) =>
                            update(
                              "sections.services.items",
                              draft.sections.services!.items.map((item, i) =>
                                i === index
                                  ? { ...item, [key]: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </Field>
                    ))}
                  </div>
                ))
              ) : (
                <p>This section is not configured.</p>
              ))}
            {section === "contact" && (
              <>
                {field("Phone", "business.phone", draft.business.phone)}
                {field(
                  "WhatsApp",
                  "business.whatsapp",
                  draft.business.whatsapp,
                )}
                {field("Email", "business.email", draft.business.email)}
                {field("Opening hours", "business.hours", draft.business.hours)}
              </>
            )}
            {section === "footer" &&
              (draft.sections.footer ? (
                field(
                  "Footer reassurance",
                  "sections.footer.reassuranceLine",
                  draft.sections.footer.reassuranceLine,
                  true,
                )
              ) : (
                <p>This section is not configured.</p>
              ))}
            <p className="text-[10px] leading-5 text-admin-muted">
              Section visibility and structure follow your studio configuration.
            </p>
          </fieldset>
        </Panel>
        <section
          className="min-w-0 border border-admin-border bg-admin-surface"
          aria-label="Website preview"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-admin-border p-3">
            <div className="flex flex-wrap gap-1">
              <Button
                aria-pressed={device === "desktop"}
                onClick={() => setDevice("desktop")}
              >
                <Monitor aria-hidden="true" className="size-3.5" strokeWidth={1.8} />Desktop
              </Button>
              <Button
                aria-pressed={device === "phone"}
                onClick={() => setDevice("phone")}
              >
                <Smartphone aria-hidden="true" className="size-3.5" strokeWidth={1.8} />Phone
              </Button>
            </div>
            <a
              className={buttonClass}
              href={`/${tenant}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open public site <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </div>
          <div className="flex flex-wrap gap-2 border-b border-admin-border p-3">
            <Button
              variant={preview === "draft" ? "primary" : undefined}
              onClick={() => setPreview("draft")}
            >
              Draft preview
            </Button>
            <Button
              variant={preview === "published" ? "primary" : undefined}
              onClick={() => setPreview("published")}
            >
              Published site
            </Button>
          </div>
          <div className="overflow-x-auto bg-admin-bg p-2">
            <div
              className={device === "phone" ? "mx-auto w-[375px]" : "w-full"}
            >
              {preview === "draft" ? (
                <DraftFrame config={draft} />
              ) : (
                <iframe
                  key={revision}
                  title="Published website preview"
                  src={`/${tenant}`}
                  className="h-[740px] w-full border border-admin-border bg-admin-surface"
                />
              )}
            </div>
          </div>
          <p className="p-3 text-[10px] text-admin-muted">
            {preview === "draft"
              ? "Demo preview updates as you type. Check Published site for the exact public layout."
              : "This is the saved public website. Unsaved changes are not included."}
          </p>
        </section>
      </div>
      <Dialog
        open={review}
        title={
          mode === "demo"
            ? "Save local demo changes?"
            : "Save changes to your website?"
        }
        onClose={() => {
          if (!pending) setReview(false);
        }}
      >
        <div className="p-5">
          <p className="mb-4 text-sm">
            {mode === "demo"
              ? "These edits stay in this browser."
              : "These edits update published content immediately through the existing website editor."}
          </p>
          <p className="text-xs text-admin-muted">
            {Object.keys(patch).length} fields changed.
          </p>
          <Feedback error={error} />
          <div className="mt-5 flex justify-end gap-2">
            <Button disabled={pending} onClick={() => setReview(false)}>
              Keep editing
            </Button>
            <Button variant="primary" disabled={pending} onClick={save}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

function DraftFrame({ config }: { config: WorkspaceConfig }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  useEffect(() => {
    ready();
  }, []);
  function ready() {
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    if (!doc.head.querySelector("link"))
      document
        .querySelectorAll('link[rel="stylesheet"], style')
        .forEach((node) => doc.head.append(node.cloneNode(true)));
    doc.documentElement.dataset.adminTheme =
      document.documentElement.dataset.adminTheme ?? "light";
    setBody(doc.body);
  }
  const { business, sections } = config;
  return (
    <>
      <iframe
        ref={frame}
        title="Draft website preview"
        className="h-[740px] w-full border border-admin-border bg-admin-surface"
        onLoad={ready}
      />
      {body &&
        createPortal(
          <article className="bg-admin-surface text-admin-ink">
            <header className="border-b border-admin-border p-6 text-sm font-semibold">
              {business.name}
            </header>
            {sections.hero.enabled && sections.hero.headline && (
              <section className="border-b border-admin-border p-6 py-12">
                {sections.hero.image && (
                  <img
                    src={sections.hero.image}
                    alt=""
                    className="mb-6 h-64 w-full object-cover"
                  />
                )}
                <h1 className="text-3xl font-semibold">
                  {sections.hero.headline}
                </h1>
                <p className="my-5 text-sm">{sections.hero.sub}</p>
                <span className="inline-block border border-admin-border px-4 py-3 text-xs">
                  {sections.hero.ctaLabel}
                </span>
              </section>
            )}
            {sections.about?.enabled && sections.about.body && (
              <section className="border-b border-admin-border p-6 py-10">
                <h2 className="text-2xl font-semibold">
                  {sections.about.heading}
                </h2>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-7">
                  {sections.about.body}
                </p>
              </section>
            )}
            {sections.portfolio.enabled &&
              sections.portfolio.projects.length > 0 && (
                <section className="grid gap-6 border-b border-admin-border p-6 py-10">
                  <p>{sections.portfolio.introText}</p>
                  {sections.portfolio.projects.map((project) => (
                    <div key={project.slug}>
                      {project.cover && (
                        <img
                          src={project.cover}
                          alt={project.title}
                          className="mb-3 h-56 w-full object-cover"
                        />
                      )}
                      <h2 className="text-xl font-semibold">{project.title}</h2>
                      <p className="mt-2 text-sm text-admin-muted">
                        {project.location}
                      </p>
                    </div>
                  ))}
                </section>
              )}
            {sections.services?.enabled &&
              sections.services.items.length > 0 && (
                <section className="grid gap-6 border-b border-admin-border p-6 py-10">
                  {sections.services.items.map((service, index) => (
                    <div key={index}>
                      <h2 className="text-xl font-semibold">{service.title}</h2>
                      <p className="mt-2 text-sm">{service.blurb}</p>
                    </div>
                  ))}
                </section>
              )}
            {sections.contact?.enabled && (
              <section className="p-6 py-10">
                <p>{business.phone}</p>
                <p>{business.email}</p>
                <p>{business.hours}</p>
              </section>
            )}
            {sections.footer?.enabled && (
              <footer className="border-t border-admin-border p-6 text-xs">
                {sections.footer.reassuranceLine}
              </footer>
            )}
          </article>,
          body,
        )}
    </>
  );
}
