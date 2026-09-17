# Three-branch deployment topology

Studio Presence has three long-lived deployment branches:

| Branch | Platform root | Purpose |
| --- | --- | --- |
| `candidate` | `https://candidate.srikantshubams-projects.vercel.app` | Integration and human QA |
| `preview` | `https://preview.srikantshubams-projects.vercel.app` | Alpha baseline shown to prospects |
| `main` | Production platform origin | Production only |

Tenant URLs are host-scoped, not path-scoped:

`<tenant-slug>.<stage-root>`

For example, a tenant on candidate is `studio-name.candidate.srikantshubams-projects.vercel.app`; the same tenant on preview is `studio-name.preview.srikantshubams-projects.vercel`.

The `abc.preview...` form is therefore a tenant host, not a deployment fallback alias. The application must fail closed for unknown, retired, multi-level, and legacy tenant hosts. `/tenant-slug/dashboard` is not a substitute for a valid tenant hostname on candidate or preview.

Vercel deployment settings are deny-by-default: only `main`, `preview`, and `candidate` enable Git deployments. Temporary PR branches are deployed only through an explicitly requested, manually initiated deployment and are never stable application environments.

Each Vercel environment must set `NEXT_PUBLIC_ROOT_DOMAIN` to its own platform root and `NEXT_PUBLIC_TENANT_ROUTING=host`. Supabase Site URL and redirect allowlists must include only the approved platform roots, approved tenant-host patterns, localhost development origins, and the exact production origin required by the auth flow.
