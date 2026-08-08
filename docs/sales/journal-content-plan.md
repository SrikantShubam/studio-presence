# The Journal — content plan

Fixes the core problem with the blog mockups: **all six placeholder posts are written for startup
founders and CTOs, not for interior design studios.**

---

## The problem

The README states the blog exists to build credibility and domain authority for **selling to
interior design studios**. The six placeholder posts are:

| Post | Audience it actually serves |
|---|---|
| Why most "AI-powered" products fail at the demo stage | Startup founders / CTOs |
| Inside Fenor's rebuild | Fintech / founders |
| The MVP is not a smaller product | Founders |
| Retrieval isn't understanding | ML engineers |
| What breaks when Flutter apps hit real users | Mobile developers |
| Reading a client's system before touching a screen | Enterprise buyers |

An interior designer in Patna will never search for any of this. Worse — it reinforces the exact
impression the `/interiors` page exists to correct: *this studio does AI for tech companies, it
isn't for me, it's probably expensive.*

---

## The pillar: UI/UX and website commentary

**Decided.** Not AI/product content — that lane is crowded and everyone is already in it.

This resolves the two-audience problem without splitting anything. A teardown of an interior
studio's website *is* design commentary:

- **Studio owners** see: *he understands what my website is supposed to do*
- **Product/tech buyers** see: real design judgement **demonstrated**, not claimed

One feed, one journal, one audience-facing story. Interior design studios are the primary subject
matter because that's the vertical being sold into; the commentary framing is what lets a passing
tech buyer read the same content as evidence of capability.

Categories: `Teardowns` · `Comparisons` · `Patterns` · `Studio Notes`

Full multi-channel system — Instagram carousels, YouTube, and how they escalate into the journal —
is in `content-system.md`.

---

## First ten posts — write these before any more AI content

Ranked by what earns trust with a studio owner and what they actually search.

| # | Title | Category | Why it works |
|---|---|---|---|
| 1 | What a studio website actually costs in India — and why nobody publishes it | Comparisons | Publishing a number when competitors won't *is* the trust play. Cold-outreach opener |
| 2 | Your Instagram gets likes. Here's why it doesn't get you projects | Patterns | Their exact felt pain. Highly shareable in designer WhatsApp groups |
| 3 | We tore down three interior studio websites | Teardowns | **The flagship.** Anonymised, rebuilt, side by side. Doubles as a warm opener and generates the next post |
| 4 | JustDial vs your own website: the actual maths | Comparisons | ₹6,000–50,000/year with auto-debit lock-in. Concrete, no exaggeration needed |
| 5 | Why "interior designer near me" doesn't find you | Patterns | Local SEO without jargon. Sets up the GBP retainer |
| 6 | How to photograph your projects on a phone | Studio Notes | Genuinely useful **and** fixes our own intake bottleneck. Link it from the onboarding SOP |
| 7 | Every good studio site puts the phone number in the same place | Patterns | Pure design judgement. This is the post that pulls the product/tech audience in |
| 8 | ₹15,000 site vs ₹50,000 site: what actually differs | Comparisons | Justifies the ladder and pre-empts the price objection before it's raised |
| 9 | Five things to check on your own site right now | Patterns | Saveable, shareable, and reliably generates inbound DMs |
| 10 | A 3BHK in Patna: how one studio's site turned a follower into a project | Studio Notes | The case study. **Write this only when it's true** |

**Rule:** post 10 doesn't get written until there's a real client and real numbers. Same guardrail as
client demos — nothing fabricated, ever, on our own site either.

⚠️ **Teardowns: never name and shame.** Anonymise the studio in public content unless they've agreed.
Send the named version privately to the studio itself — that's the warm opener. The moment a studio
owner sees a peer publicly mocked, every prospect in that city stops trusting you.

---

## Voice and byline

⚠️ **"Vector Veda Team" → a named human byline.**

You're one person plus a partner. In a market whose entire pitch is *a real person who won't
disappear*, a named author is a credibility asset, not a weakness. "Team" reads as either a
pretence or a faceless agency — both work against you.

Write in first person. "We rebuilt three studio websites" is fine; "Our team leveraged" is not.

---

## Layout: use the editorial direction

`blog-editorial.html` over `blog-listing.html`:

- **Cheaper to maintain.** A card grid needs a good header image for every post or it looks broken.
  You will not reliably produce those.
- **Reads as more authoritative** — which is the entire stated purpose.
- **Degrades gracefully.** Six entries in a dated index list looks deliberate. Six cards in a
  3-column grid looks thin.
- Sticky sidebar carries newsletter + about without a separate strip.

**Port across from the card version:** the category filter chips. With two audiences, segmentation
isn't optional.

**Keep from editorial:** the masthead, the cover-story treatment, the dated index, the sidebar.

---

## The blog's real job during outreach

**It is not SEO.** SEO pays off in 6–12 months. Outreach starts the week GST clears. These are two
different jobs and only one of them is urgent.

| Job | Timeline | What it needs |
|---|---|---|
| **Survive the credibility check** | Immediate | 3–6 good posts that read like someone who knows this business |
| Rank and bring inbound traffic | 6–12 months | Volume, keyword targeting, consistency |

The sequence that actually happens: intern DMs a studio → studio Googles "Vector Veda" → lands on
the site. At that moment the blog either says *these people know interiors and won't disappear*, or
it says *this is an AI agency, not for me*. That's the whole job.

**Minimum before the first DM goes out: 3 posts.** Not ten. Comprehensiveness isn't what's being
judged — credibility is.

---

## Posts as outreach collateral

The strongest cold outreach in this market gives before it asks. A post you can *send* outperforms a
pitch, because it carries no ask and proves competence in one click.

> Hi [Name], I'm Srikant from Vector Veda. I wrote this on what studio websites actually cost in
> India — most agencies won't publish numbers, so I did. Thought it might be useful. [link]

No pitch. They read it, they see you're real, and frequently **they** ask about price. That inverts
the dynamic entirely — and it sidesteps the platform-limit problem, because a useful link is far
less likely to be reported as spam than a sales message.

### Post → outreach moment mapping

| Moment in the sequence | Send this | Why it works |
|---|---|---|
| **Cold first touch** | What a studio website actually costs in India | Publishes a number nobody else will. Pure reciprocity, zero ask |
| **Replied but hesitant** | Your Instagram gets likes. Here's why it doesn't get you projects | Names their pain without selling |
| **"I already have a website"** | Why "interior designer near me" doesn't find you | Reframes: the site isn't the problem, findability is |
| **"Too expensive"** | JustDial vs your own website: the actual maths | Compares against money they already spend, not against zero |
| **"Send me details"** | We rebuilt three studio websites — here's what changed | The teardown post *is* the details |
| **Said yes, chasing content** | How to photograph your projects on a phone | Solves your own intake bottleneck. Send right after the deposit clears |
| **Day 90 check-in** | Google Business Profile: the 30-minute setup | Sets up the local-SEO retainer conversation |

**Write in this order**, not in SEO-value order. The first three are the ones the intern needs on day one.

### The teardown post is also a lead magnet

"We rebuilt three studio websites" gives the intern a soft opener that isn't a pitch:

> "We do free teardowns of studio websites — want yours?"

A teardown is 20 minutes of work, produces something genuinely useful, and ends with a natural
"want us to fix it?" It also generates the next post. This is the single highest-leverage piece of
content in the list.

---

## Turn objections into posts

Every objection the intern hears twice should become a post. Then the intern **sends the post
instead of arguing** — which scales, and stops the same conversation being re-fought on every call.

The objection column in the lead tracker (`intern-kit.md` §7) is the content pipeline. Review it
monthly.

---

## Dating and cadence discipline — matters more than volume

Three things that quietly destroy the credibility check:

1. **All posts dated the same week.** Reads as "we spun this up for the campaign." Space the
   publish dates, even if you write them in one sitting.
2. **Newest post older than ~6 weeks during active outreach.** A journal that stopped four months
   ago signals abandonment — precisely the fear you are selling against.
3. **"Vector Veda Team" byline.** The DM says *"I'm Srikant from Vector Veda."* The prospect clicks
   through and every post is by a faceless team. The DM and the site should tell the same story —
   use your name.

---

## What not to do during the interiors push

- **Don't optimise for SEO first.** The keywords that matter are low-volume and 6+ months out.
  Outreach doesn't wait for them.
- **Don't publish AI/tech posts while actively selling interiors.** A prospect landing mid-check and
  seeing fintech content dilutes exactly what the page is trying to fix. Queue them; publish after
  the vertical is established.
- **Don't gate anything behind an email form.** You're not running a funnel yet, you're proving
  you're real. A gate at this stage costs more trust than it captures addresses.
- **Don't link the DM to the homepage.** Link to the *post*. Let the post's footer carry a quiet
  link to `/interiors`.

---

## Publishing cadence

One post per fortnight, sustained, beats six in a week then silence. A journal whose last entry is
four months old signals abandonment — the same reason we decided not to ship a blog on *client*
sites.

If you can't hold fortnightly, hold monthly and say so on the page.
