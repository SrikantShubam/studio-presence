# Universal admin — Login

Attach: none required

Covers both `/panel/login` and `/dashboard/login` — same screen, one design. Where it routes after
sign-in depends on tier, but the screen itself is identical.

Paste `00-universal-system.md` first, then this:

```
Design the LOGIN screen for the studio owner's admin area.

Centred single card on the page background — this is the one screen in the whole product where a
centred layout is correct, because there is genuinely nothing else on the page.

CARD CONTENTS:
- The client's logo and studio name at the top, small
- Heading: "Sign in to your site"
- One email field, clearly labelled "Email address"
- Primary green button: "Email me a sign-in link"
- One line beneath, secondary text: "We'll send you a link. No password to remember."
- At the bottom, a text link: "Trouble signing in? Message us on WhatsApp"

No password field. No "create account". No social sign-in buttons. No nav, no footer, no marketing
copy of any kind.

ALSO DESIGN THE SENT STATE — the same card after submission:
- A confirmation: "Check your email. We sent a link to ashish@studio.in"
- Secondary text: "The link works for 15 minutes."
- A "Resend" text link, greyed out with a 30-second countdown before it becomes tappable
- A "Use a different email" text link

Show mobile (390px) and desktop.

ANTI-GOALS: no password field, no illustration, no stock photography, no gradient background, no
"welcome back!" copy, no branded hero. This is a door, not a lobby.
```
