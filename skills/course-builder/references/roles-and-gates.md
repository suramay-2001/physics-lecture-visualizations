# Roles, judge, gates

## Execution model
Claude orchestrates and judges; four roles propose and build: **P** subject verifier + plain-language editor,
**D** 3D designer, **W** web developer, **S** security auditor (OWASP + PII). Round 1 propose (docs) → judge
reconciles, asks the user only real conflicts of intent → round 2 build → integrate → round 3 verify → gates.
Every "done" needs a measurement that could have failed.

## Role briefs (short)
- **P**: claim ledger (every quantitative sentence tested), fidelity contract per stage, reader layers, errata
  with evidence, cross-source check (notes ↔ course book ↔ other books), notation Rosetta.
- **D**: beauty-first lighting with a mandatory space passport; reserved encodings (here amber = +,
  cobalt = −, near-white = the state, orchid = operators, silver = structure); one shot + one change per beat;
  motion is a closed list; labels in the DOM with a collision pass.
- **W**: one WebGL context for all stages (views in one canvas), scroll → store → frame loop without React
  churn, lazy chunks, trigger hygiene, static fallback < 900 px / no WebGL / context loss, e2e instrumentation.
- **S**: CSP (script-src 'self', no wasm eval), self-hosted fonts, no CDN strings, safe TeX renderers (authored
  vs user), no eval parsers, storage sanitizing, verbatim-overlap test, PII sweep of tracked files and history.

## Gates (measured on the user's machine)
Contrast ≥ 4.5 : 1 on composited pixels (labels over the rendered stage) · p95 frame ≤ 8 ms · one WebGL context,
zero leaked across route round trips · zero scroll triggers leaked · 0 CSP violations and 0 third-party
requests on every route · npm audit clean · unit + e2e green in production build and dev · truth sign-off: judge
screenshots every beat and reveal and checks each number against its text.

## Subagent method (anti-stall)
Brief one deliverable per agent; first action writes the file skeleton, then one section at a time with saves;
read with offset/limit; builders commit after every item; code, visuals and browser QA are separate agents.
If tool calls are slow (safety check timeouts), stop spawning and work directly in small steps.
