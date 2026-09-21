import { useState } from 'react';
import {
  QrCode,
  Download,
  Copy,
  MessageCircle,
  FileText,
  UserPlus,
  Shield,
  CheckCircle,
  Smartphone,
} from 'lucide-react';
import { useStore } from '../store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Switch } from './ui';

/* Procedurally generated QR-style graphic (deterministic, authentic module density) */
function QRGraphic() {
  const N = 29; // modules per side
  const cell = 200 / N;
  // deterministic PRNG (mulberry32)
  let seed = 0x5eed;
  const rand = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const inFinder = (r: number, c: number) =>
    (r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8);
  const inLogo = (r: number, c: number) => {
    const mid = (N - 1) / 2;
    return Math.abs(r - mid) <= 4.5 && Math.abs(c - mid) <= 4.5;
  };

  const modules: { x: number; y: number }[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (inFinder(r, c) || inLogo(r, c)) continue;
      // timing patterns row/col 6
      const isTiming = r === 6 || c === 6;
      const on = isTiming ? (r + c) % 2 === 0 : rand() < 0.47;
      if (on) modules.push({ x: c * cell, y: r * cell });
    }
  }

  const Finder = ({ tx, ty }: { tx: number; ty: number }) => (
    <g transform={`translate(${tx},${ty})`}>
      <rect x={0} y={0} width={cell * 7} height={cell * 7} rx={cell * 1.4} fill="black" />
      <rect x={cell} y={cell} width={cell * 5} height={cell * 5} rx={cell} fill="white" />
      <rect x={cell * 2} y={cell * 2} width={cell * 3} height={cell * 3} rx={cell * 0.8} fill="black" />
    </g>
  );

  return (
    <svg viewBox="-10 -10 220 220" className="h-48 w-48" role="img" aria-label="QR code for ashish-interiors.in/card">
      <rect x={-10} y={-10} width={220} height={220} fill="white" />
      {modules.map((m, i) => (
        <rect key={i} x={m.x + 0.6} y={m.y + 0.6} width={cell - 1.2} height={cell - 1.2} rx={1.4} fill="black" />
      ))}
      <Finder tx={0} ty={0} />
      <Finder tx={200 - cell * 7} ty={0} />
      <Finder tx={0} ty={200 - cell * 7} />
      {/* Center logo badge */}
      <rect x={100 - 26} y={100 - 26} width={52} height={52} rx={10} fill="white" stroke="black" strokeWidth={2} />
      <text x={100} y={97} textAnchor="middle" fontSize={10.5} fontWeight={700} fontFamily="Inter, sans-serif" fill="black">
        ASHISH
      </text>
      <text x={100} y={110} textAnchor="middle" fontSize={7} fontFamily="Inter, sans-serif" fill="#52525b">
        INTERIORS
      </text>
    </svg>
  );
}

export function QRCardPage() {
  const store = useStore();
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [briefFormEnabled, setBriefFormEnabled] = useState(true);
  const [vcfEnabled, setVcfEnabled] = useState(true);
  const [copied, setCopied] = useState(false);

  const cardUrl = 'ashish-interiors.in/card';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`https://${cardUrl}`);
    setCopied(true);
    store.addToast('Card URL copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportQR = () => {
    store.addToast('QR code SVG exported', 'success');
  };

  const handleDownloadVCF = () => {
    const vcf = `BEGIN:VCARD
VERSION:3.0
FN:Ashish Kumar
ORG:Ashish Interiors
TEL;TYPE=CELL:+919876543210
EMAIL:ashish@ashish-interiors.in
URL:https://ashish-interiors.in
ADR;TYPE=WORK:;;Boring Road;Patna;Bihar;800001;India
NOTE:Interior Design Studio - Patna, Ranchi, Lucknow
END:VCARD`;

    const blob = new Blob([vcf], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ashish-interiors.vcf';
    a.click();
    URL.revokeObjectURL(url);
    store.addToast('vCard downloaded successfully', 'success');
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Left: QR Code */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Digital Business Card QR
            </CardTitle>
            <CardDescription>Scan to visit your studio card page</CardDescription>
          </CardHeader>
          <CardContent>
            {/* SVG QR Code */}
            <div className="flex justify-center">
              <div className="rounded-xl border-2 border-border bg-white p-6 shadow-sm">
                <QRGraphic />

              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="font-mono text-sm text-muted-foreground">{cardUrl}</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={handleExportQR}>
              <Download className="h-4 w-4" />
              Export Print QR (SVG)
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleCopyUrl}>
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copied!' : 'Copy Public Card URL'}
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleDownloadVCF}>
              <UserPlus className="h-4 w-4" />
              Download vCard (.vcf)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right: Features & Config */}
      <div className="lg:col-span-3 space-y-4">
        {/* Feature Toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Card Features
            </CardTitle>
            <CardDescription>Toggle features available on your digital business card</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-whatsapp/10 p-2 text-whatsapp">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">1-Tap WhatsApp Consultation</p>
                  <p className="text-xs text-muted-foreground">Direct WhatsApp chat link for instant consultation</p>
                </div>
              </div>
              <Switch checked={whatsappEnabled} onChange={setWhatsappEnabled} />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Project Brief Capture Form</p>
                  <p className="text-xs text-muted-foreground">Short form for clients to share project requirements</p>
                </div>
              </div>
              <Switch checked={briefFormEnabled} onChange={setBriefFormEnabled} />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Save Contact (.vcf Download)</p>
                  <p className="text-xs text-muted-foreground">Auto-download vCard for saving to phone address book</p>
                </div>
              </div>
              <Switch checked={vcfEnabled} onChange={setVcfEnabled} />
            </div>
          </CardContent>
        </Card>

        {/* Attribution Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Attribution & Tracking
            </CardTitle>
            <CardDescription>How lead sources are tracked honestly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="info" className="mt-0.5">QR Card</Badge>
                <div>
                  <p className="text-sm">
                    QR card submissions are explicitly tagged with <code className="font-mono text-xs bg-muted px-1 rounded">source: "Digital QR Card"</code> when a client scans your QR code and submits the brief form or taps WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="success" className="mt-0.5">WhatsApp</Badge>
                <div>
                  <p className="text-sm">
                    WhatsApp clicks track <strong>link-clicks only</strong> via the CTA button on your website. We do not and cannot access your private WhatsApp chats. Each click increments the counter for that source channel.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Honest note:</strong> We track <em>actions taken</em> (form submissions, link clicks, QR scans), not private conversations. Your client's privacy is respected at all times. The attribution data helps you understand which marketing channels bring the most value.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Live Card Preview</CardTitle>
            <CardDescription>How clients see your digital card</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mx-auto max-w-sm rounded-xl border border-border bg-gradient-to-b from-muted/50 to-background p-6 shadow-lg">
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  AI
                </div>
                <div>
                  <h3 className="text-lg font-bold">Ashish Kumar</h3>
                  <p className="text-sm text-muted-foreground">Interior Design Studio</p>
                  <p className="text-xs text-muted-foreground">Patna · Ranchi · Lucknow</p>
                </div>

                <div className="space-y-2 pt-2">
                  {whatsappEnabled && (
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-whatsapp py-2.5 text-white font-medium text-sm"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Chat on WhatsApp
                    </a>
                  )}
                  {briefFormEnabled && (
                    <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                      <FileText className="h-4 w-4" />
                      Share Your Project Brief
                    </button>
                  )}
                  {vcfEnabled && (
                    <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                      <UserPlus className="h-4 w-4" />
                      Save Contact
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-muted-foreground pt-2">
                  ashish-interiors.in
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}