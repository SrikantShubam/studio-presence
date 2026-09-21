"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Field,
  Feedback,
  Panel,
  PageHeading,
  inputClass,
  monoClass,
} from "./primitives";
import { SAMPLE_ESTIMATE } from "./demo-data";
import {
  calculateQuote,
  errorMessage,
  money,
  type Mode,
  type SaveConfig,
  type WorkspaceConfig,
} from "./types";

export default function CalculatorTab({
  config,
  mode,
  canEdit,
  onSave,
}: {
  config: WorkspaceConfig;
  mode: Mode;
  canEdit: boolean;
  onSave: SaveConfig;
}) {
  const initial =
    config.sections.estimate ?? (mode === "demo" ? SAMPLE_ESTIMATE : undefined);
  const [estimate, setEstimate] = useState(initial);
  const [area, setArea] = useState(1000);
  const [homeIndex, setHomeIndex] = useState(0);
  const [finishIndex, setFinishIndex] = useState(0);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  if (!estimate)
    return (
      <>
        <PageHeading
          title="Estimate calculator"
          description="Pricing follows your studio's configured estimate model."
        />
        <Panel title="Calculator is not configured">
          <p className="p-5 text-sm text-admin-muted">
            Ask your operator to configure this section for your studio.
          </p>
        </Panel>
      </>
    );
  const rates = estimate.ratePerSqft ?? { basic: 0, standard: 0, premium: 0 };
  const home = estimate.homeTypes[homeIndex];
  const finishes = estimate.finishLevels.length
    ? estimate.finishLevels
    : [
        { id: "basic", label: "Basic", low: 1, high: 1 },
        { id: "standard", label: "Standard", low: 1, high: 1 },
        { id: "premium", label: "Premium", low: 1, high: 1 },
      ];
  const finish = finishes[finishIndex] ?? finishes[0]!;
  const base = rates[finish.id as keyof typeof rates] ?? rates.standard;
  const quote = calculateQuote(
    area,
    base * (finish.low ?? 1),
    base * (finish.high ?? 1),
    home?.factor ?? 1,
  );
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!estimate) return;
    setPending(true);
    setMessage("");
    setError("");
    try {
      const values = Object.values(rates);
      if (
        values.some((value) => !Number.isFinite(value) || value <= 0) ||
        estimate.homeTypes.some(
          (value) => !Number.isFinite(value.factor) || value.factor <= 0,
        )
      )
        throw new Error("Rates and multipliers must be positive numbers.");
      if (finishes.some((value) => (value.low ?? 1) > (value.high ?? 1)))
        throw new Error("A finish minimum cannot exceed its maximum.");
      await onSave({
        "sections.estimate.ratePerSqft": rates,
        "sections.estimate.homeTypes": estimate.homeTypes,
        "sections.estimate.finishLevels": finishes,
        "sections.estimate.area": {
          min: 400,
          max: 3500,
          step: 50,
          default: 1000,
        },
        "sections.estimate.resultNote": estimate.resultNote ?? "",
      });
      setMessage(
        mode === "demo"
          ? "Sample pricing saved in this browser."
          : "Pricing saved to the website.",
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
        title="Pricing you can test before publishing."
        description={
          mode === "demo"
            ? "Adjust your baseline rates, then see what a client would receive."
            : "Saving updates the pricing used by your public website."
        }
      />
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <Panel
          title="Pricing model"
          description="Baseline rates per square foot and home multipliers"
        >
          <form onSubmit={save} className="p-5">
            <fieldset disabled={!canEdit || pending} className="grid gap-5">
              {(["basic", "standard", "premium"] as const).map((key) => (
                <Field
                  key={key}
                  label={`${key[0]!.toUpperCase()}${key.slice(1)} baseline (₹/sqft)`}
                >
                  <input
                    className={`${inputClass} ${monoClass}`}
                    type="number"
                    required
                    min="1"
                    max="100000"
                    step="1"
                    value={rates[key]}
                    onChange={(event) =>
                      setEstimate({
                        ...estimate,
                        ratePerSqft: {
                          ...rates,
                          [key]: Number(event.target.value),
                        },
                      })
                    }
                  />
                </Field>
              ))}
              <h3 className="border-t border-admin-border pt-4 font-semibold">
                Home type multipliers
              </h3>
              {estimate.homeTypes.map((type, index) => (
                <Field key={type.id} label={type.label}>
                  <input
                    className={`${inputClass} ${monoClass}`}
                    type="number"
                    required
                    min="0.1"
                    max="10"
                    step="0.01"
                    value={type.factor}
                    onChange={(event) =>
                      setEstimate({
                        ...estimate,
                        homeTypes: estimate.homeTypes.map((item, i) =>
                          i === index
                            ? { ...item, factor: Number(event.target.value) }
                            : item,
                        ),
                      })
                    }
                  />
                </Field>
              ))}
              <Field label="Estimate note">
                <textarea
                  className={inputClass}
                  rows={3}
                  value={estimate.resultNote ?? ""}
                  onChange={(event) =>
                    setEstimate({ ...estimate, resultNote: event.target.value })
                  }
                />
              </Field>
              <Button type="submit" variant="primary">
                {pending
                  ? "Saving…"
                  : mode === "demo"
                    ? "Save sample pricing"
                    : "Save pricing to website"}
              </Button>
            </fieldset>
            <Feedback error={error} message={message} />
          </form>
        </Panel>
        <Panel
          title="Live quote preview"
          description="Matches the public calculator's rate rounding"
        >
          <div className="p-5">
            <label htmlFor="carpet-area" className="flex justify-between gap-3">
              Carpet area
              <span className={monoClass}>
                {area.toLocaleString("en-IN")} sqft
              </span>
            </label>
            <input
              id="carpet-area"
              className="my-6 w-full accent-admin-primary"
              type="range"
              min={400}
              max={3500}
              step={50}
              value={area}
              onChange={(event) => setArea(Number(event.target.value))}
            />
            <div
              className={`${monoClass} flex justify-between text-[10px] text-admin-muted`}
            >
              <span>400 sqft</span>
              <span>3,500 sqft</span>
            </div>
            <h3 className="mt-6 font-semibold">Home type</h3>
            <div
              className="my-3 flex flex-wrap gap-2"
              role="group"
              aria-label="Home type"
            >
              {estimate.homeTypes.map((type, index) => (
                <Button
                  key={type.id}
                  variant={homeIndex === index ? "primary" : undefined}
                  aria-pressed={homeIndex === index}
                  onClick={() => setHomeIndex(index)}
                >
                  {type.label}
                </Button>
              ))}
            </div>
            <h3 className="mt-6 font-semibold">Finish package</h3>
            <div
              className="my-3 flex flex-wrap gap-2"
              role="group"
              aria-label="Finish package"
            >
              {finishes.map((level, index) => (
                <Button
                  key={level.id}
                  variant={finishIndex === index ? "primary" : undefined}
                  aria-pressed={finishIndex === index}
                  onClick={() => setFinishIndex(index)}
                >
                  {level.label}
                </Button>
              ))}
            </div>
            <div
              className="mt-8 border-y border-admin-border py-6"
              aria-live="polite"
            >
              <p className="text-xs text-admin-muted">Indicative investment</p>
              <p
                className={`${monoClass} mt-3 break-words text-xl sm:text-2xl`}
              >
                {money(quote.low)} – {money(quote.high)}
              </p>
              <p className="mt-2 text-[11px] text-admin-muted">
                Area × rounded baseline × finish factor × home factor
              </p>
            </div>
            <p className="mt-5 text-xs leading-6 text-admin-muted">
              {estimate.resultNote}
            </p>
            {!estimate.enabled && (
              <p className="mt-4 text-xs text-admin-alert">
                The calculator is currently disabled on the public website.
              </p>
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}
