"use client";

import { useState, type FormEvent } from "react";
import { Calculator, Check, Loader2, RotateCcw } from "lucide-react";
import { Badge, Button, Field, PageHeading } from "@/components/ui/primitives";
import { DEFAULT_PRICING } from "@/lib/demo-data";
import type { PricingSettings } from "@/lib/types";
import { apiRequest, errorMessage } from "@/lib/utils";

type Props = { initialPricing: PricingSettings; onPublished: (pricing: PricingSettings) => void };

export default function CalculatorTab({ initialPricing, onPublished }: Props) {
  const [pricing, setPricing] = useState<PricingSettings>(() => structuredClone(initialPricing));
  const [saved, setSaved] = useState(initialPricing);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const dirty = JSON.stringify(pricing) !== JSON.stringify(saved);

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setError(""); setFeedback("");
    try {
      const result = await apiRequest<{ pricing: PricingSettings }>("/api/workspace", "PATCH", { kind: "pricing", data: pricing });
      setSaved(result.pricing); onPublished(result.pricing);
      setFeedback("Your pricing is published. The live site now uses these rates.");
    } catch (error) { setError(errorMessage(error)); }
    finally { setPending(false); }
  }

  return (
    <>
      <PageHeading title="Pricing you can test before publishing." description="Adjust your baseline rates, then see what a client would receive." />
      <div className="grid items-start gap-[22px] min-[1000px]:grid-cols-2">
        <section className="panel">
          <div className="panel-heading"><div><h2>Your pricing model</h2><p className="panel-description">Rates in rupees per square foot</p></div><Badge>{dirty ? "Unsaved draft" : "Published rates"}</Badge></div>
          <form className="grid gap-[18px] p-5" onSubmit={publish}>
            <div className="form-grid">
              {["Essential", "Premium", "Luxe"].map((label, index) => <Field key={label} label={label}><div className="relative"><span className="pointer-events-none absolute left-3 top-2.5 font-mono text-muted-foreground">₹</span><input className="!pl-7 font-mono" aria-label={`${label} rate`} type="number" min={100} max={20000} step={50} required value={pricing.rates[index]} onChange={(event) => setPricing({ ...pricing, rates: pricing.rates.map((rate, i) => i === index ? Number(event.target.value) : rate) as PricingSettings["rates"] })} /></div></Field>)}
            </div>
            <h3 className="mt-1">Home type multipliers</h3>
            <div className="form-grid">
              {pricing.factors.map((factor, index) => <Field key={index} label={`${index + 1} BHK`}><input className="font-mono" aria-label={`${index + 1} BHK multiplier`} type="number" min={0.1} max={5} step={0.01} required value={factor} onChange={(event) => setPricing({ ...pricing, factors: pricing.factors.map((value, i) => i === index ? Number(event.target.value) : value) as PricingSettings["factors"] })} /></Field>)}
            </div>
            <Field label="Result disclaimer"><textarea rows={3} required maxLength={2000} value={pricing.note} onChange={(event) => setPricing({ ...pricing, note: event.target.value })} /></Field>
            <Field label="Included in the estimate"><input required maxLength={2000} value={pricing.inclusions} onChange={(event) => setPricing({ ...pricing, inclusions: event.target.value })} /></Field>
            <div className="flex flex-wrap items-center gap-2.5"><Button variant="primary" type="submit" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <Check />}{pending ? "Publishing…" : "Publish rates to site"}</Button><Button onClick={() => { setPricing(structuredClone(DEFAULT_PRICING)); setFeedback(""); }} disabled={pending}><RotateCcw />Reset defaults</Button></div>
            <p className="text-[11px] text-muted-foreground" role="status">{feedback || "Changes stay in your draft until you publish them."}</p>
            {error && <p role="alert" className="text-[12px] text-destructive">{error}</p>}
          </form>
        </section>
        <PricingSimulator pricing={pricing} />
      </div>
    </>
  );
}

export function PricingSimulator({ pricing }: { pricing: PricingSettings }) {
  const [area, setArea] = useState(1200);
  const [home, setHome] = useState(1);
  const [finish, setFinish] = useState(1);
  const rate = pricing.rates[finish] * pricing.factors[home];
  const base = area * rate;
  return (
    <section className="panel !bg-muted/35">
      <div className="panel-heading"><div><h2>Try the client experience</h2><p className="panel-description">Updates as you adjust pricing</p></div><Calculator className="text-muted-foreground" /></div>
      <div className="p-5">
        <div className="flex items-center justify-between"><label htmlFor="carpet-area">Carpet area</label><strong className="font-mono font-medium">{area.toLocaleString("en-IN")} sqft</strong></div>
        <input id="carpet-area" type="range" min={400} max={3500} step={50} value={area} onChange={(event) => setArea(Number(event.target.value))} className="my-[22px]" />
        <div className="flex justify-between font-mono text-[10px] text-muted-foreground"><span>400 sqft</span><span>3,500 sqft</span></div>
        <hr className="my-5 border-border" />
        <h3>Home type</h3>
        <div className="mb-6 mt-3 flex flex-wrap gap-[7px]" role="group" aria-label="Home type">{[1, 2, 3, 4].map((value, i) => <Button key={value} variant={home === i ? "primary" : "default"} aria-pressed={home === i} onClick={() => setHome(i)}><span className="font-mono">{value}</span> BHK</Button>)}</div>
        <h3>Finish package</h3>
        <div className="mt-3 flex flex-wrap gap-[7px]" role="group" aria-label="Finish package">{["Essential", "Premium", "Luxe"].map((value, i) => <Button key={value} variant={finish === i ? "primary" : "default"} aria-pressed={finish === i} onClick={() => setFinish(i)}>{value}</Button>)}</div>
        <hr className="my-5 border-border" />
        <p className="text-[11px] text-muted-foreground">Your indicative investment</p>
        <div aria-live="polite" aria-atomic="true"><p className="mb-1 mt-5 font-mono text-[clamp(24px,2.5vw,36px)] tracking-[-1px]">₹{(base * 0.9 / 100000).toFixed(1)}L – ₹{(base * 1.1 / 100000).toFixed(1)}L</p><p className="text-muted-foreground"><span className="font-mono">₹{Math.round(rate).toLocaleString("en-IN")}/sqft</span> effective rate</p></div>
        <div className="section-line flex items-center justify-between gap-3"><span>Typical project timeline</span><strong><span className="font-mono">{["8–10", "10–14", "14–18"][finish]}</span> weeks</strong></div>
        <p className="my-4 text-[12px]">{pricing.inclusions}</p>
        <p className="text-[11px] text-muted-foreground">{pricing.note}</p>
        <p className="mt-4 text-[10px] text-muted-foreground">Indicative range = area × rate × home factor, <span className="font-mono">±10%</span>.</p>
      </div>
    </section>
  );
}
