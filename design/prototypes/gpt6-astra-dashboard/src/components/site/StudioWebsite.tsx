"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, Check, Loader2, MessageCircle, PanelsTopLeft, Phone } from "lucide-react";
import { Button, Field } from "@/components/ui/primitives";
import { PricingSimulator } from "@/components/dashboard/CalculatorTab";
import type { Enquiry, PricingSettings, StudioSettings, WebsiteContent, WebsiteSectionKey } from "@/lib/types";
import { CITY_DEMAND } from "@/lib/demo-data";
import { apiRequest, errorMessage } from "@/lib/utils";

type Props = { content: WebsiteContent; settings: StudioSettings; pricing?: PricingSettings; preview?: boolean; sections?: WebsiteSectionKey[] };

export function StudioWebsite({ content, settings, pricing, preview = false, sections }: Props) {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const show = (section: WebsiteSectionKey) => content[section].enabled && (!sections || sections.includes(section));
  const suffix = preview ? "-preview" : "";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setPending(true); setError("");
    try {
      await apiRequest<Enquiry>("/api/enquiries", "POST", { ...values, value: Number(values.value), source: "Website Direct Form" });
      setSent(true);
    } catch (error) { setError(errorMessage(error)); }
    finally { setPending(false); }
  }

  return (
    <div className="site-preview @container bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5">
        <a href={preview ? "#" : "/site"} className="flex items-center gap-2 text-[12px] font-semibold"><PanelsTopLeft />{settings.name}</a>
        <nav aria-label={preview ? "Preview website navigation" : "Website navigation"} className="flex flex-wrap gap-4 text-[10px] text-muted-foreground">
          {(["about", "projects", "services", "contact"] as const).filter(show).map((key) => <a key={key} href={`#${key}${suffix}`} className="capitalize hover:text-foreground">{key === "about" ? "Our studio" : key}</a>)}
        </nav>
      </header>
      {show("hero") && <section className="grid @lg:grid-cols-2">
        <div className="flex flex-col justify-center gap-5 px-7 py-12 @lg:px-10"><p className="text-[9px] font-medium uppercase tracking-[2px]">Independent interior design · {settings.city}</p><h1>{content.hero.title}</h1><p className="max-w-md text-[12px] leading-relaxed text-muted-foreground">{content.hero.body}</p><a href={`#contact${suffix}`} className="btn btn-primary mt-1 self-start">{content.hero.button}<ArrowUpRight /></a></div>
        {/* User-supplied HTTPS image URLs are intentionally rendered without an image-proxy allowlist. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={content.hero.image} alt="Living room with warm timber finishes and neutral furniture" className="h-full min-h-[310px] w-full object-cover" />
      </section>}
      {show("about") && <section id={`about${suffix}`} className="site-section grid gap-5 @lg:grid-cols-2"><div><p className="mb-3 text-[9px] uppercase tracking-[2px] text-muted-foreground">The studio</p><h2>{content.about.title}</h2></div><p className="self-center text-[12px] leading-7 text-muted-foreground">{content.about.body}</p></section>}
      {show("projects") && <section id={`projects${suffix}`} className="site-section"><p className="mb-3 text-[9px] uppercase tracking-[2px] text-muted-foreground">Selected work</p><h2>{content.projects.title}</h2><p className="mt-3 text-[12px] text-muted-foreground">{content.projects.body}</p><div className="mt-7 grid gap-5 @md:grid-cols-2">{content.projects.items.map((project, i) => <article key={i}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={project.image} alt={project.title} loading="lazy" className="aspect-[4/3] w-full object-cover" /><h3 className="mt-3">{project.title}</h3><p className="mt-1 text-[10px] text-muted-foreground">{project.location}</p>
      </article>)}</div></section>}
      {show("services") && <section id={`services${suffix}`} className="site-section"><p className="mb-3 text-[9px] uppercase tracking-[2px] text-muted-foreground">What we do</p><h2>{content.services.title}</h2><p className="mt-3 text-[12px] text-muted-foreground">{content.services.body}</p><div className="mt-6 grid gap-4 @lg:grid-cols-3">{content.services.items.map((service, i) => <article key={i} className="border border-border p-4"><span className="mb-6 block font-mono text-[10px] text-muted-foreground">0{i + 1}</span><h3>{service.title}</h3><p className="my-3 text-[11px] text-muted-foreground">{service.description}</p><p className="font-mono text-[10px]">{service.price}</p></article>)}</div></section>}
      {!preview && pricing && <section className="site-section grid gap-8 @xl:grid-cols-2"><div className="pt-5"><p className="mb-3 text-[9px] uppercase tracking-[2px] text-muted-foreground">Plan with confidence</p><h2>A little clarity, before we begin.</h2><p className="mt-4 text-[12px] leading-6 text-muted-foreground">Explore an indicative investment for your home. Every project is different; your final quote follows a personal consultation and site visit.</p></div><PricingSimulator pricing={pricing} /></section>}
      {show("contact") && <section id={`contact${suffix}`} className="site-section grid gap-8 @xl:grid-cols-2">
        <div><p className="mb-3 text-[9px] uppercase tracking-[2px] text-muted-foreground">Let’s make something personal</p><h2>{content.contact.title}</h2><p className="mb-6 mt-4 text-[12px] leading-6 text-muted-foreground">{content.contact.body}</p><div className="flex flex-wrap gap-2"><a href={`https://wa.me/${settings.phone}`} className="btn" target="_blank" rel="noopener noreferrer"><MessageCircle />WhatsApp</a><a href={`tel:+${settings.phone}`} className="btn"><Phone />Call the studio</a></div></div>
        {preview ? <div className="flex flex-col justify-center border border-border bg-muted/30 p-6"><p className="mb-4 text-[12px] font-medium">Tell us about your space</p><div className="mb-3 border border-border bg-background px-3 py-3 text-[11px] text-muted-foreground">Your name</div><div className="mb-4 border border-border bg-background px-3 py-3 text-[11px] text-muted-foreground">What are you imagining?</div><p className="text-[10px] text-muted-foreground">Visitors can send a project brief from your published site.</p></div>
          : sent ? <div role="status" className="self-start border border-border p-8"><Check className="mb-4 text-success" /><h3>Your project starts here.</h3><p className="mt-3 text-[12px] text-muted-foreground">Thanks for reaching out. Your enquiry is with our studio, and we’ll be in touch to talk about your space.</p><Button className="mt-5" onClick={() => setSent(false)}>Send another enquiry</Button></div>
          : <form className="grid gap-4" onSubmit={submit}>
            <div className="form-grid"><Field label="Your name"><input name="name" required maxLength={80} autoComplete="name" /></Field><Field label="Mobile number"><input name="phone" required inputMode="tel" pattern="[6-9][0-9]{9}" maxLength={10} placeholder="10-digit Indian mobile" autoComplete="tel-national" /></Field></div>
            <div className="form-grid"><Field label="City"><select name="city">{CITY_DEMAND.map((city) => <option key={city.name}>{city.name}</option>)}</select></Field><Field label="Locality"><input name="locality" required maxLength={80} /></Field></div>
            <div className="form-grid"><Field label="Your project"><select name="projectType"><option>Full home</option><option>Modular kitchen</option><option>Renovation</option><option>Commercial space</option></select></Field><Field label="Budget in lakh"><input className="font-mono" name="value" type="number" min={0.1} max={1000} step={0.1} required /></Field></div>
            <Field label="Tell us a little more"><textarea name="brief" rows={3} maxLength={2000} /></Field>
            {error && <p role="alert" className="text-destructive">{error}</p>}
            <Button type="submit" variant="primary" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <ArrowRight />}{pending ? "Sending…" : "Start a conversation"}</Button>
            <p className="text-[10px] text-muted-foreground">Your details are only used to respond to your project enquiry.</p>
          </form>}
      </section>}
      {show("footer") && <footer className="flex flex-wrap items-center justify-between gap-4 px-7 py-6"><div><p className="text-[12px] font-semibold">{content.footer.title}</p><p className="mt-1 text-[10px] text-muted-foreground">{content.footer.body}</p></div><span className="text-[9px] text-muted-foreground">Made with Studio Presence</span></footer>}
    </div>
  );
}
