# DigitalPlat `srikantsubham.qd.je` and Vercel verification

Date: 2026-09-16

## Conclusion

`srikantsubham.qd.je` is not reliably workable on Vercel without either access to the `qd.je` parent zone or an exception/change from Vercel. The DNS delegation itself can work: DigitalPlat says it delegates registered names to external authoritative nameservers, where the owner manages A, CNAME, TXT, and other records. The blockage is Vercel's ownership check, not ordinary DNS hosting.

## Why Vercel asks for `_vercel.qd.je`

Vercel documents its ownership challenge as a TXT record at `_vercel.example.com` containing a `vc-domain-verify=...` value. When adding a domain already associated with another Vercel account, Vercel requires access to the DNS zone at the verification name.

The current Mozilla Public Suffix List snapshot (2026-09-15) does not contain `qd.je` or a `*.qd.je` rule. Under the usual PSL/eTLD+1 interpretation, `qd.je` is therefore treated as the registrable/organizational boundary for `srikantsubham.qd.je`, rather than `srikantsubham.qd.je` being treated as the independently registrable boundary. Vercel consequently derives the ownership challenge at `_vercel.qd.je`. The user controls only the delegated child zone `srikantsubham.qd.je`; that zone cannot authoritatively create `_vercel.qd.je`.

This is consistent with Vercel's public support explanation for free-subdomain providers: if the provider's suffix is not on the PSL, Vercel's domain checker uses the root/parent domain for account matching and asks for the parent TXT record.

## Ranked options

1. **Use a domain whose registrable boundary the user controls.** This is the dependable workaround: use an owned apex domain, or a free-domain provider whose user namespace is correctly represented in the relevant tooling and supports the required DNS records.

2. **Ask Vercel support for a provider-specific/manual exception.** Provide proof of DigitalPlat registration and delegation, the authoritative NS response for `srikantsubham.qd.je`, and the exact challenge. This is discretionary and not documented as a guaranteed path.

3. **Ask DigitalPlat to pursue public-suffix registration for `qd.je` (or an appropriate wildcard rule), then wait for Vercel's domain-boundary data to recognize it.** DigitalPlat's own provider documentation and control of the namespace are the right basis for a PSL submission. PSL inclusion is not itself a Vercel feature flag: Vercel must consume the updated list or otherwise update its domain logic. PSL inclusion also changes security/cookie boundaries and should be requested only with provider-owner justification; Mozilla warns that the PSL is not intended to work around arbitrary third-party limits.

4. **Ask DigitalPlat to publish the TXT in the parent zone on the user's behalf.** This can satisfy a one-off challenge if DigitalPlat is willing and if the name is not concurrently shared, but it creates an operational and multi-user collision problem. It is not a general scalable solution for a free public namespace.

5. **Delegate/use Vercel nameservers only if Vercel accepts the domain first.** Nameserver configuration can make Vercel authoritative for a domain, but it does not bypass the initial ownership boundary when Vercel has calculated that boundary as `qd.je`.

## Is purging `qd.je` recommended?

No. Purging or deleting records in `qd.je` is not a fix, and the user does not control that parent zone. Removing parent data could damage every delegated name beneath it, break delegation, or make unrelated sites unavailable. The correct remedies are provider/Vercel support, correct public-suffix treatment, or a different domain.

## Sources

- [Vercel: Claiming Domain Ownership](https://vercel.com/docs/domains/working-with-domains/claim-domain-ownership) — prerequisites, `_vercel.<domain>` TXT challenge, and verification flow.
- [Vercel: Adding and Configuring a Custom Domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain) — subdomain DNS configuration and ownership verification behavior.
- [Vercel Community: Troubleshooting domain configuration issues](https://community.vercel.com/t/troubleshooting-domain-configuration-issues-on-vercel/36631/9) — Vercel staff/community explanation of the unlisted-free-subdomain case.
- [DigitalPlat Domains](https://domain.digitalplat.org/) — `*.qd.je` public namespace and external-DNS/provider-neutral model.
- [DigitalPlat FreeDomain platform guide](https://github.com/DigitalPlatDev/FreeDomain/blob/main/documents/tutorial/platform/index.md) — registration/delegation boundary and external management of TXT/CNAME/A records.
- [Mozilla Public Suffix List: learn](https://publicsuffix.org/learn/) and [current list](https://publicsuffix.org/list/public_suffix_list.dat) — why suffixes are needed and the current list snapshot; `qd.je` is absent.
- [Mozilla PSL contribution guide](https://github.com/publicsuffix/list/blob/main/CONTRIBUTING.md) — amendments are submitted to the list project and require provider-backed review.
- [Cloudflare: Subdomain setup](https://developers.cloudflare.com/dns/zone-setups/subdomain-setup/setup/) — DNS delegation means the child zone is managed separately from the parent; it does not give child-zone control over parent names.
