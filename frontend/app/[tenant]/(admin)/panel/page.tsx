/**
 * Placeholder. The real panel — contact details, hero image, portfolio,
 * services, testimonials, Instagram picks, all editing into
 * `client_overrides` — is docs/product/prompts/admin-universal/02-client-panel.md,
 * a separate ticket (B13, panel write-back). This exists only so the auth gate
 * in layout.tsx has somewhere to land and can be verified end to end.
 */
export default function PanelPage() {
  return (
    <div className="p-4">
      <p className="text-sm text-admin-muted">Signed in. Panel content is a separate ticket.</p>
    </div>
  )
}
