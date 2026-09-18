# Studio Presence authentication email templates

These files are the source copies for Supabase Auth. Paste the matching HTML into the Supabase Dashboard. Supabase stores the active template in its project settings, so a repository file alone does not change a sent email.

| File | Paste into Supabase Auth template | Use it now? | Subject |
| --- | --- | --- | --- |
| `magic-link.html` | Magic Link | Yes. The current login uses `signInWithOtp`. | Your secure Studio Presence sign-in link |
| `confirm-signup.html` | Confirm signup | No. Use after the email and password signup UI ships. | Confirm your Studio Presence account |
| `recover-password.html` | Reset password | No. Use after the forgot-password and reset-password routes ship. | Reset your Studio Presence password |

All three templates use `{{ .ConfirmationURL }}`. Supabase replaces it with the single-use URL for the relevant event. Do not replace it with a static Studio Presence URL.

## Supabase setup

1. In Brevo, authenticate the Studio Presence sending domain. Add every DNS record Brevo shows, then wait until Brevo marks the domain authenticated.
2. In Brevo, create an SMTP key. Keep it private. `BREVO_API_KEY` is not a substitute for the SMTP password unless Brevo explicitly labels that exact key as usable for SMTP.
3. In Supabase Dashboard, open Authentication, then SMTP settings. Enable custom SMTP and enter:
   - Host: `smtp-relay.brevo.com`
   - Port: `587`
   - Username: the Brevo SMTP login shown in your Brevo account
   - Password: the Brevo SMTP key
   - Sender email: a mailbox on the authenticated Studio Presence domain
   - Sender name: `Studio Presence`
4. In Supabase Dashboard, open Authentication, then URL configuration.
   - Set Site URL to the stable production platform root, not a preview deployment.
   - Add exact redirect URLs for `http://localhost:3000/**`, the current Vercel preview origin followed by `/**`, and the production platform origin followed by `/**`.
   - Do not add a broad wildcard for every Vercel project. The app deliberately returns to the same origin that started the authentication flow.
5. In Supabase Dashboard, open Authentication, then Email Templates. Paste each file into the matching template and set the subject shown in the table.
6. In Brevo's transactional-email settings, leave click tracking disabled for authentication mail. Tracking wrappers can interfere with single-use authentication links.

## Safe verification order

1. Test the magic-link template through the deployed login page. Confirm that it arrives from the Studio Presence sender and that clicking it in the same browser reaches `/auth/callback` without a PKCE error.
2. After the email and password signup PR lands, test account confirmation with a new disposable email address.
3. After the recovery route lands, request a reset, open the recovery email in the same browser, set a new password, then sign in with that password.

Never commit an SMTP key, Brevo API key, or a copied Supabase project secret. The repository only keeps these template sources and this runbook.
