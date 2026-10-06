# Hosting readiness and options (2026-10-06)

Scope: the production build of `app/` (`npm run build` → `app/dist/`) at main b0fb56b, and the public GitHub repo.

## What the site is
- **A fully static single-page app.** No server code, no database, no login, no cookies, no analytics.
- **Routing:** `HashRouter` (`#/709/ch/Q3`), so the host needs no rewrite rules or SPA fallback.
- **Paths:** `base: './'`, so the build works from a domain root or a sub-path.
- **Storage:** learner progress and preferences live in each visitor's own `localStorage` and never leave the browser.

## Readiness checklist
| Check | Result |
|---|---|
| Build size | **Ready.** 18 MB in 547 files; the largest is 1.4 MB (`mountLab-*.js`). Far inside every host's limits (Cloudflare free: 20,000 files, 25 MiB per file) |
| Source maps in production | **Ready.** None are emitted |
| Inline scripts, eval, third-party requests | **Ready.** None. `connect-src 'self'` fails closed, and the security e2e counts 0 third-party requests and 0 CSP violations |
| CSP | **Ready.** Two layers: a build-time `<meta>` CSP, which works on any host, and a generated `public/_headers` with the full header set. `build/csp.security.test.ts` fails if they drift apart |
| Security headers (`_headers`) | **Ready on hosts that read `_headers`.** CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP, `X-Frame-Options: DENY`, and immutable caching for hashed `/assets/*` |
| Dependencies that ship | **Ready.** `app/`: 0 known vulnerabilities. `films/` is a local tool and does not ship |
| Licenses | **Ready.** `LICENSE` (MIT), `LICENSE-CONTENT` (CC BY-NC 4.0); font licenses ship in `dist/licenses/` |
| Page title and description | **Gap.** `index.html` still says "Spin Lab — Physics 448" only |
| HTML caching | **Gap (small).** `index.html` has no explicit `Cache-Control: no-cache`, so a stale copy can briefly outlive a deploy |
| CI | **Gap.** The repo has no GitHub Actions workflow, so nothing re-runs the gate on GitHub before a deploy |
| Branch protection | **Gap.** `main` is unprotected (public API: `protected: false`) |
| Repo security toggles | **Unknown.** Secret scanning with push protection, Dependabot alerts and private vulnerability reporting need admin access to read; confirm them in Settings → Code security |
| `app/README.md` | **Gap (cosmetic).** Still the Vite template text |

## Owner decisions before going live
1. **Who may see the site.** The instructors OK'd putting the course material in a public repo. Confirm that also covers a public website, which search engines will index. Options:
   - **public**;
   - **unlisted**: public, but with `X-Robots-Tag: noindex` so search engines skip it;
   - **class-only**: behind Cloudflare Access, which sends a one-time e-mail PIN and is free for small groups.
2. **The Higgsfield decor clips** (`app/public/decor/qc709/`, 3 files). Check that your plan allows public redistribution, or ship without them; the pages fall back to a poster.
3. **Domain.** Either the host's free subdomain, or your own domain. With your own domain:
   - The HSTS `includeSubDomains` applies to every subdomain. Use a dedicated subdomain, or drop that flag.
   - Turn on DNSSEC and add a CAA record.

## Hosting options
| Option | Security headers | Deploy path and secrets | Cost | Verdict |
|---|---|---|---|---|
| **Cloudflare Workers (static assets)** | **Full.** Reads our `_headers` as-is | GitHub Actions builds and tests, then `wrangler deploy` with an API token scoped to one account (Workers Scripts: Edit), stored as a secret of a protected `production` environment | Free plan fits | **Recommended.** Every header applies, the site is served from a global CDN, and nothing new needs writing apart from a small `wrangler.jsonc` |
| Cloudflare Pages | Full (`_headers`) | Same as above, or Cloudflare's Git integration | Free | Equivalent today; Cloudflare steers new projects to Workers |
| Netlify | Full (`_headers`) | Actions plus a personal access token (broader scope than Cloudflare's) | Free tier, credit-based | Good |
| GitHub Pages | **Meta tag only.** No custom headers, so `frame-ancestors`/`X-Frame-Options`, `Permissions-Policy`, COOP and `nosniff` are lost | Actions with OIDC (`actions/deploy-pages`): **no stored secret at all** | Free | Simplest and acceptable. With no login and no actions to hijack, the lost clickjacking protection matters little. Not the most secure |
| Vercel | Full, but via `vercel.json`, a second copy of the headers | Actions plus a token, or the Git app | Hobby is non-commercial only | Workable; adds a config to keep in sync |
| Firebase Hosting / AWS S3 + CloudFront | Full via their config | A service account or IAM role (OIDC possible on AWS) | Free tier / pay-per-use | More setup and more cloud permissions than this site needs |

## Recommended setup (Cloudflare Workers)
1. **Workflow** `.github/workflows/deploy.yml`, triggered on pushes to `main`:
   - `permissions: contents: read`;
   - actions pinned by commit SHA;
   - Node 24;
   - `npm ci --ignore-scripts`, then `npm run build`, then `npx vitest run`;
   - Playwright on the runner's installed Chrome (`channel: 'chrome'`, no browser download).
   - Deploy only if every step passes.
2. **Deploy step:**
   - Use `wrangler deploy` with `assets.directory: ./app/dist` and no Worker script, so `_headers` applies to every response.
   - The API token lives in a GitHub **environment** secret, limited to the `main` branch and scoped to this one account.
3. **Hardening added to `_headers`:**
   - `Cache-Control: no-cache` on `/` and `/index.html`;
   - `Cross-Origin-Resource-Policy: same-origin`;
   - `X-Robots-Tag: noindex` if you choose "unlisted".
4. **Repo settings:**
   - Protect `main`: block force-push and deletion, and require the CI check once it exists.
   - Turn on secret scanning with push protection, Dependabot alerts and private vulnerability reporting.
5. **Smoke test after the first deploy:**
   - Check the live response headers with `curl -I`.
   - Run the security e2e against the live URL (expect 0 CSP violations and 0 third-party requests).
   - Check a bridge round-trip and a reload on a deep `#/709/ch/…` link.

## Later, optional
- **Trusted Types** (`require-trusted-types-for 'script'`). This needs a policy for KaTeX's HTML output first.
- **CSP reporting** (`report-to`). This needs an endpoint, so skip it unless you want monitoring.
