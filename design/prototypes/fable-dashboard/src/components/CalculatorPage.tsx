import { useState, useMemo } from 'react';
import {
  Calculator,
  Save,
  RotateCcw,
  Info,
  IndianRupee,
  Ruler,
  Home,
} from 'lucide-react';
import { useStore } from '../store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Label, Textarea, Separator } from './ui';

const defaultRates = {
  essential: 1200,
  premium: 1800,
  luxe: 2600,
};

const defaultMultipliers = {
  '1bhk': 0.94,
  '2bhk': 1.0,
  '3bhk': 1.06,
  '4bhk': 1.12,
};

const defaultDisclaimer = 'Prices are indicative and may vary based on site conditions, material availability, and custom requirements. Final quotation after site visit and detailed discussion.';

export function CalculatorPage() {
  const store = useStore();

  // Pricing config
  const [rates, setRates] = useState({ ...defaultRates });
  const [multipliers, setMultipliers] = useState({ ...defaultMultipliers });
  const [disclaimer, setDisclaimer] = useState(defaultDisclaimer);

  // Live simulator
  const [carpetArea, setCarpetArea] = useState(1200);
  const [homeType, setHomeType] = useState('3bhk');
  const [finishPackage, setFinishPackage] = useState('premium');

  const calculation = useMemo(() => {
    const baseRate = rates[finishPackage as keyof typeof rates];
    const multiplier = multipliers[homeType as keyof typeof multipliers];
    const effectiveRate = Math.round(baseRate * multiplier);
    const minEstimate = effectiveRate * carpetArea * 0.9;
    const maxEstimate = effectiveRate * carpetArea * 1.1;

    let weeks: number;
    if (carpetArea <= 800) weeks = 6;
    else if (carpetArea <= 1200) weeks = 10;
    else if (carpetArea <= 2000) weeks = 14;
    else weeks = 18;

    return { effectiveRate, minEstimate, maxEstimate, weeks };
  }, [carpetArea, homeType, finishPackage, rates, multipliers]);

  const formatLakh = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${(val / 1000).toFixed(0)}K`;
  };

  const handlePublish = () => {
    store.addToast('Rates published to site successfully!', 'success');
  };

  const handleReset = () => {
    setRates({ ...defaultRates });
    setMultipliers({ ...defaultMultipliers });
    setDisclaimer(defaultDisclaimer);
    store.addToast('Rates reset to defaults', 'info');
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left: Config */}
      <div className="space-y-4">
        {/* Per-sqft Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Per-SqFt Baseline Pricing
            </CardTitle>
            <CardDescription>Base rates for each finish package tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="essential">Essential</Label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">₹</span>
                  <Input
                    id="essential"
                    type="number"
                    value={String(rates.essential)}
                    onChange={(e) => setRates({ ...rates, essential: Number(e.target.value) })}
                  />
                  <span className="text-xs text-muted-foreground">/sqft</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="premium">Premium</Label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">₹</span>
                  <Input
                    id="premium"
                    type="number"
                    value={String(rates.premium)}
                    onChange={(e) => setRates({ ...rates, premium: Number(e.target.value) })}
                  />
                  <span className="text-xs text-muted-foreground">/sqft</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="luxe">Luxe</Label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">₹</span>
                  <Input
                    id="luxe"
                    type="number"
                    value={String(rates.luxe)}
                    onChange={(e) => setRates({ ...rates, luxe: Number(e.target.value) })}
                  />
                  <span className="text-xs text-muted-foreground">/sqft</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multipliers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home Type Multipliers
            </CardTitle>
            <CardDescription>Adjust pricing factors for different home sizes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(multipliers).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`mult-${key}`}>
                    {key.toUpperCase().replace('BHK', ' BHK')}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`mult-${key}`}
                      type="number"
                      step="0.01"
                      value={String(value)}
                      onChange={(e) =>
                        setMultipliers({ ...multipliers, [key]: Number(e.target.value) })
                      }
                    />
                    <span className="text-xs text-muted-foreground font-mono">x</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Disclaimer & Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={disclaimer}
              onChange={(e) => setDisclaimer(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button className="flex-1" onClick={handlePublish}>
            <Save className="h-4 w-4" />
            Publish Rates to Site
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            Reset Defaults
          </Button>
        </div>
      </div>

      {/* Right: Live Simulator */}
      <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Card className="border-foreground/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Live Estimate Simulator
            </CardTitle>
            <CardDescription>Test your pricing in real-time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Carpet Area Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                  Carpet Area
                </Label>
                <span className="font-mono text-sm font-bold">{carpetArea.toLocaleString()} sqft</span>
              </div>
              <input
                type="range"
                min={400}
                max={3500}
                step={50}
                value={carpetArea}
                onChange={(e) => setCarpetArea(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-foreground"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>400</span>
                <span>1,000</span>
                <span>2,000</span>
                <span>3,500</span>
              </div>
            </div>

            <Separator />

            {/* Home Type */}
            <div className="space-y-2">
              <Label>Home Type</Label>
              <div className="grid grid-cols-4 gap-2">
                {['1bhk', '2bhk', '3bhk', '4bhk'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setHomeType(type)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                      homeType === type
                        ? 'border-foreground bg-primary text-primary-foreground'
                        : 'border-border bg-background hover:bg-muted'
                    }`}
                  >
                    {type.toUpperCase().replace('BHK', ' BHK')}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Finish Package */}
            <div className="space-y-2">
              <Label>Finish Package</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'essential', label: 'Essential', desc: 'Clean & functional' },
                  { key: 'premium', label: 'Premium', desc: 'Quality materials' },
                  { key: 'luxe', label: 'Luxe', desc: 'Premium finishes' },
                ].map((pkg) => (
                  <button
                    key={pkg.key}
                    onClick={() => setFinishPackage(pkg.key)}
                    className={`rounded-lg border p-3 text-left transition-colors cursor-pointer ${
                      finishPackage === pkg.key
                        ? 'border-foreground bg-primary text-primary-foreground'
                        : 'border-border bg-background hover:bg-muted'
                    }`}
                  >
                    <span className="text-xs font-semibold block">{pkg.label}</span>
                    <span className={`text-[10px] ${finishPackage === pkg.key ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {pkg.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Result */}
            <div className="rounded-xl bg-muted/70 p-5 space-y-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Estimated Range</p>
                <p className="font-mono text-3xl font-bold tracking-tight">
                  {formatLakh(calculation.minEstimate)} – {formatLakh(calculation.maxEstimate)}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-background p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Effective Rate</p>
                  <p className="font-mono text-sm font-bold">₹{calculation.effectiveRate.toLocaleString()}/sqft</p>
                </div>
                <div className="rounded-lg bg-background p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Timeline</p>
                  <p className="font-mono text-sm font-bold">{calculation.weeks} weeks</p>
                </div>
                <div className="rounded-lg bg-background p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Area</p>
                  <p className="font-mono text-sm font-bold">{carpetArea} sqft</p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-muted-foreground leading-relaxed">{disclaimer}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}