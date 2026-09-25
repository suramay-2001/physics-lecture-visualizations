# L1 security diff audit — Round 3 (role S)

Scope: `git diff l1-freeze..6faffe2 -- app/` (W1, P, D merged since the freeze) + round-3 fix #1.
Method: greps + reads of the diff, the production bundle (`npm run build` in the S worktree), and the BUILT app
driven on installed Chrome (`channel: 'chrome'`, no browser download).

## 0. Summary

_pending_

## 1. Findings

_pending_

## 2. HTML sinks, inline style/script, injected stylesheets

_pending_

## 3. drei imports and CDN strings; remote assets

_pending_

## 4. eval-like code, postMessage / window.open, storage writes

_pending_

## 5. DEV-only tools in the production bundle (`__stage`, `__stageD`, Workbench, `?measure`)

_pending_

## 6. Origins in the built `dist/`

_pending_

## 7. Runtime: CSP violations and third-party requests on the built app (31 L1 beats)

_pending_

## 8. Verbatim overlap (new L1 content) and `npm audit`

_pending_

## 9. Round-3 fix #1 (stale-dist guard) — evidence

_pending_
