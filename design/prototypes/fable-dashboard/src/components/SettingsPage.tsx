import { useState } from 'react';
import {
  Building2,
  Mail,
  Users,
  Bell,
  Palette,
  Shield,
  MessageCircle,
  Globe,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  Plus,
  Trash2,
  Lock,
  Server,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}
import { useStore } from '../store';
import { teamMembers } from '../data';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Label,
  Select,
  Separator,
  Switch,
  Badge,
} from './ui';

export function SettingsPage() {
  const store = useStore();

  // Meta token visibility
  const [showMetaSecret, setShowMetaSecret] = useState(false);
  const [showWabaToken, setShowWabaToken] = useState(false);

  // Toggle states
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [metaTokenStatus, setMetaTokenStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');

  // Instagram URLs
  const [instaUrls, setInstaUrls] = useState([
    'https://www.instagram.com/p/ABC123/',
    'https://www.instagram.com/p/DEF456/',
    'https://www.instagram.com/p/GHI789/',
    '',
    '',
    '',
  ]);

  const handleValidateMeta = () => {
    setMetaTokenStatus('loading');
    setTimeout(() => {
      setMetaTokenStatus('valid');
      store.addToast('Meta App token validated successfully', 'success');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Studio Identity & Domain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Studio Identity & Domain
          </CardTitle>
          <CardDescription>Your studio's public presence and branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="studio-name">Studio Name</Label>
              <Input id="studio-name" value="Ashish Interiors" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" value="Premium Interior Design — Patna, Ranchi, Lucknow" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Primary City</Label>
              <Select id="city">
                <option>Patna</option>
                <option>Ranchi</option>
                <option>Lucknow</option>
                <option>Indore</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Custom Domain</Label>
              <div className="flex items-center gap-2">
                <Input id="domain" value="ashish-interiors.in" />
                <Badge variant="success" className="shrink-0">
                  <CheckCircle className="h-3 w-3 mr-1" /> Active
                </Badge>
              </div>
            </div>
          </div>
          <Button size="sm">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Account Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Account Credentials & Lead Routing
          </CardTitle>
          <CardDescription>Login and notification email configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary-email">Primary Login Email</Label>
              <Input id="primary-email" value="ashish@ashish-interiors.in" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-email">
                <span className="flex items-center gap-1.5">
                  Notification Email
                  <Badge variant="secondary" className="text-[10px]">Lead Routing</Badge>
                </span>
              </Label>
              <Input id="notification-email" value="leads@ashish-interiors.in" />
              <p className="text-[10px] text-muted-foreground">
                All new enquiry alerts are sent to this address
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Studio WhatsApp Number</Label>
              <div className="flex">
                <span className="flex items-center rounded-l-md border border-r-0 border-input bg-muted px-2 text-sm text-muted-foreground">+91</span>
                <Input id="whatsapp" value="9876543210" className="rounded-l-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Button variant="outline" size="sm" className="mt-0.5">
                <Key className="h-3 w-3" />
                Reset Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Access & Workspace Isolation
          </CardTitle>
          <CardDescription>Manage team members and their permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div
                key={member.email}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {member.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      member.role === 'Owner'
                        ? 'default'
                        : member.role === 'Editor'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {member.role}
                  </Badge>
                  {member.role !== 'Owner' && (
                    <button className="rounded p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm">
            <Plus className="h-3 w-3" />
            Invite Member
          </Button>

          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Each studio's data is isolated using <strong>Postgres Row-Level Security (RLS)</strong>.
                Team members can only access data belonging to their assigned workspace.
                Owner role has full access, Editors can modify content, and Viewers have read-only access.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-whatsapp/10 p-2 text-whatsapp">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Instant WhatsApp Lead Alerts</p>
                <p className="text-xs text-muted-foreground">Get notified immediately when a new lead arrives</p>
              </div>
            </div>
            <Switch checked={whatsappAlerts} onChange={setWhatsappAlerts} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Daily Summary Email Digest</p>
                <p className="text-xs text-muted-foreground">Receive a daily email with all activity summary</p>
              </div>
            </div>
            <Switch checked={dailyDigest} onChange={setDailyDigest} />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </CardTitle>
          <CardDescription>Choose your preferred dashboard theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'light', label: 'Light', icon: Sun },
              { key: 'dark', label: 'Dark', icon: Moon },
              { key: 'system', label: 'System', icon: Monitor },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => store.setTheme(key as any)}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors cursor-pointer ${
                  store.theme === key
                    ? 'border-foreground bg-muted'
                    : 'border-border hover:border-foreground/30'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instagram oEmbed Meta App */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <InstagramIcon className="h-4 w-4" />
            Instagram oEmbed — Meta App Credentials
          </CardTitle>
          <CardDescription>
            Configure Meta Graph API credentials for Instagram post embedding via oEmbed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>Note:</strong> Meta terminated the Instagram Basic Display API in December 2024.
              Automated feeds are no longer supported. Studios curate up to 6 post/reel URLs manually.
              The oEmbed endpoint (<code className="font-mono">graph.facebook.com</code>) returns verified embed HTML only.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meta-app-id">Meta App ID (CLIENT_ID)</Label>
              <Input id="meta-app-id" value="1234567890123456" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta-secret">Meta App Secret / System User Token</Label>
              <div className="flex gap-2">
                <Input
                  id="meta-secret"
                  type={showMetaSecret ? 'text' : 'password'}
                  value="a]s8d7f6g5h4j3k2l1z0x9c8v7b6n5m4"
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowMetaSecret(!showMetaSecret)}
                >
                  {showMetaSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button size="sm" onClick={handleValidateMeta} disabled={metaTokenStatus === 'loading'}>
              {metaTokenStatus === 'loading' ? 'Validating...' : 'Validate Meta Token'}
            </Button>
            {metaTokenStatus === 'valid' && (
              <Badge variant="success">
                <CheckCircle className="h-3 w-3 mr-1" /> Token Valid
              </Badge>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Rate limit: 1,000 requests/hour</p>
            <p>• Prohibits saving or deriving from metadata</p>
            <p>• Renders verified oEmbed HTML only</p>
          </div>
        </CardContent>
      </Card>

      {/* Instagram Curated Strip */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CameraIcon className="h-4 w-4" />
            Instagram Curated Strip Manager
          </CardTitle>
          <CardDescription>
            Hand-curate up to 6 Instagram post/reel URLs for your homepage gallery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {instaUrls.map((url, idx) => (
              <div key={idx} className="space-y-1">
                <Label htmlFor={`insta-${idx}`}>Post {idx + 1}</Label>
                <Input
                  id={`insta-${idx}`}
                  value={url}
                  onChange={(e) => {
                    const newUrls = [...instaUrls];
                    newUrls[idx] = e.target.value;
                    setInstaUrls(newUrls);
                  }}
                  placeholder="https://www.instagram.com/p/..."
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Preview Grid */}
          <div>
            <p className="text-xs font-medium mb-3">Homepage Preview (3-tile grid)</p>
            <div className="grid grid-cols-3 gap-2">
              {instaUrls
                .filter((u) => u)
                .slice(0, 3)
                .map((_url, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-lg border border-border bg-muted flex items-center justify-center"
                  >
                    <div className="text-center">
                      <InstagramIcon className="h-6 w-6 mx-auto text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground mt-1">Post {idx + 1}</p>
                      <Badge variant="success" className="text-[8px] mt-1">oEmbed ✓</Badge>
                    </div>
                  </div>
                ))}
              {instaUrls.filter((u) => u).length < 3 &&
                Array.from({ length: 3 - instaUrls.filter((u) => u).length }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="aspect-square rounded-lg border border-dashed border-border flex items-center justify-center"
                  >
                    <span className="text-xs text-muted-foreground">Empty slot</span>
                  </div>
                ))}
            </div>
          </div>

          <Button size="sm">
            <CheckCircle className="h-3 w-3" />
            Validate & Sync oEmbeds
          </Button>
        </CardContent>
      </Card>

      {/* Meta WABA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Meta WhatsApp Business Platform (WABA)
          </CardTitle>
          <CardDescription>
            Optional enterprise add-on for studios upgrading beyond standard wa.me deep-links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Badge variant="secondary" className="mb-2">Optional Add-on</Badge>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="waba-id">WhatsApp Business Account ID</Label>
              <Input id="waba-id" placeholder="WABA_ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-id">Phone Number ID</Label>
              <Input id="phone-id" placeholder="PHONE_ID" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="system-token">Permanent System User Access Token</Label>
              <div className="flex gap-2">
                <Input
                  id="system-token"
                  type={showWabaToken ? 'text' : 'password'}
                  placeholder="Enter your system user token..."
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowWabaToken(!showWabaToken)}
                >
                  {showWabaToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Webhook Verification Endpoint</Label>
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
              <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
              <code className="font-mono text-xs text-muted-foreground">
                https://api.studio-presence.in/webhooks/meta-waba
              </code>
            </div>
          </div>

          <Button variant="outline" size="sm">
            <Lock className="h-3 w-3" />
            Save WABA Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}