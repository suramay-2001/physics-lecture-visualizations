# Security

Spin Lab is a static study site. It has no server, accounts, cookies, analytics or third-party requests. Everything is
served from its own origin under a strict Content-Security-Policy (`app/public/_headers`, generated from `app/build/csp.ts`).

## Reporting a vulnerability

Please use GitHub's **Report a vulnerability** button on this repository's Security tab (private vulnerability
reporting). Don't open a public issue for security problems.

## What the repo guards against

- **No secrets or personal data in git.** `pipeline/audit_public.py` scans every blob in the full history and every
  commit message for credentials, personal home paths, e-mail addresses, signed URLs and course PDFs. The pre-commit
  hook runs the same checks on staged lines; enable it per clone with `git config core.hooksPath .githooks`.
- **No copied course text.** Instructor notes and textbooks stay local (`sources/` is git-ignored). The app paraphrases
  and cites them, and a verbatim test fails the build on any 8-word overlap with a source.
- **The app's own checks** run in every test run (`app/src/**/*.security.test.ts`, plus `e2e/security.spec.ts`):
  - no `eval`-like code or raw HTML sinks;
  - zero CSP violations and zero third-party requests on every route;
  - hostile `localStorage` values can't crash a page.
