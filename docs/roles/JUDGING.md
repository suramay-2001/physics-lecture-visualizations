# How the orchestrator judges role output

A role's work counts as done only when a measurement that could have failed says so.
Scores are recorded in `BUILD-LOG.md` → "Evidence / score history" with the date and the command or readout.

## Phase 0 gate (pass = all true)
| Check | Threshold | How it is measured |
|---|---|---|
| Passport + caption contrast over the dark stage | ≥ 4.5 : 1 at the brightest pixel under each label | `window.__gate.contrast()` (canvas readback vs computed text color) |
| Prose + KaTeX legibility | body text ≥ 4.5 : 1 on paper; no KaTeX errors; no horizontal overflow at 900–1440 px | computed styles + `.katex-error` count + `scrollWidth === innerWidth` |
| Frame time, Hopf stage (≥ 64 fibers) | p95 ≤ 8 ms on the user's laptop | `window.__gate.stats()` while scrubbing |
| Frame time, lab stage (~2000 atoms) | p95 ≤ 8 ms | same |
| WebGL contexts | exactly 1 per page visit | `window.__gate.contexts` |
| ScrollTrigger hygiene | trigger count returns to baseline after /gate → / → /gate; no duplicates under StrictMode | `window.__gate.triggers()` |
| Build health | `tsc -b`, `vitest run`, `vite build` all pass | command exit codes |

## Every later phase
| Role | Gate |
|---|---|
| P physics | 0 open "wrong" issues; every number on screen traced to a `Claim` or engine-computed answer; symbol-before-use lint green; fidelity contract present for every stage |
| D designer | every beat matches its scene spec (screenshot per beat); passport on every stage; reserved colors unused elsewhere; motion list closed |
| W web dev | tests + build green; 1 WebGL context per lecture page; no `@babylonjs` in lecture chunks; no console errors while scrolling every unit |
| S security | 0 open high/critical; CSP loads with 0 violations; no runtime third-party requests (network log); verbatim-overlap test green |

## Conflict resolution
1. Physics truth beats beauty. A visual that misleads without a fidelity note is a defect.
2. Security controls beat convenience, except where they would break the learning goal. Then the user decides.
3. Anything that changes a decision the user locked goes back to the user before building.
