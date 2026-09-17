# Auth provider setup evidence

Date: 2026-09-17
Release line: `archive/pr15-mixed-2026-09-14`
Feature branch: `codex/auth-email-password`

This checklist is the operator record for the authentication release. It intentionally contains no API keys, passwords, SMTP credentials, access tokens, or user secrets.

## Supabase Auth

- [ ] Email/password provider enabled.
- [ ] Google provider remains enabled and its callback uses the same-origin `/auth/callback` route.
- [ ] Email confirmation enabled.
- [ ] Password reset enabled.
- [ ] Auth rate limits reviewed for sign-in, signup, confirmation resend, and recovery.
- [ ] Site URL set to the approved platform origin.
- [ ] Redirect allowlist contains only approved localhost origins, the exact approved Vercel preview origin, the final platform origin, `/auth/confirm`, and `/auth/recovery` paths on those origins.
- [ ] Click tracking disabled for Auth emails so confirmation and recovery URLs are not rewritten.

## Brevo SMTP

- [ ] Brevo SMTP configured in Supabase Auth SMTP settings.
- [ ] The Studio Presence auth sender domain is verified in Brevo.
- [ ] The From address belongs to that verified sender domain.
- [ ] A confirmation email, recovery email, and email-change email were delivered from the configured sender.
- [ ] No credentials or message tokens were copied into this repository.

## Exact template copies

Upload the exact contents of these files to the matching Supabase Auth email templates:

- `backend/supabase/templates/confirmation.html`
- `backend/supabase/templates/recovery.html`
- `backend/supabase/templates/email_change.html`

Record dashboard screenshots or a redacted provider export in the PR, not in this file. The PR must distinguish provider setup evidence from local automated tests and human browser validation.
