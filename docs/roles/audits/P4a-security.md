# Phase 4a (story navigation, Arcade, Concept map) — security audit (S role, run by the integrator)

Date 2026-09-27. Scope: `git diff aa4353e..HEAD -- app/src` (27 files, +2 467 / −59). Threat model unchanged:
static, client-only, no accounts, no sharing; untrusted input = what a student types.

| Check (OWASP 2025 / PII) | Finding |
|---|---|
| A05 Injection: new HTML sinks | none. No `dangerouslySetInnerHTML`, `eval`, `new Function`, `postMessage`, `window.open` in the diff. Game, map and fork texts are authored and go through `Rich` (authored KaTeX only). Unknown `#/arcade/:gameId` renders the id as React text. |
| A05: typed input | the only new input path is SGLab's tilt field, which already uses `parseNumber` (no eval; tested). |
| Storage (semi-trusted) | two new keys: `spinlab.motion.v1` ∈ {full, reduce}, `spinlab.readmode.v1` ∈ {read}. Any other stored value reads as "no choice"; every access is in try/catch; blocked storage keeps the choice for the visit only. Progress for games uses the existing sanitized `progress.gameLevel`. |
| A02 Misconfiguration / CSP | no CSP change needed: inline `style` attributes (CSS custom property `--i`) are covered by `style-src-attr 'unsafe-inline'` as before. Production e2e: 0 CSP violations and 0 third-party requests on #/, #/lecture/L1, #/arcade, #/map, #/formulas, #/help. |
| A03 Supply chain | no new dependency; `npm audit`: 0 vulnerabilities. |
| DEV-only surface | `window.__openers` lives in the DEV-only `#/dev/openers` chunk; production JS contains no openers-preview code (checked with grep on dist/assets). |
| PII | no user data leaves the browser; no analytics; nothing new is logged. |
| A10 Exceptional conditions | route rail and map measure the DOM defensively (missing elements → Infinity / no edge); golf rotations are unitary (tests). |
Verdict: PASS, no findings.
