# Spin Lab revamp — orchestrated four-role plan

## Context
Spin Lab (this repository) is a working Vite + React + TS app:
a tested spin-½ engine (`app/src/physics/`, 48 tests vs independent numpy fixtures), a content schema
(`app/src/content/schema.ts`), Lecture 1 authored (`app/src/content/L1.ts`), 12 widgets, pages, and a
design identity ("glass plate": amber = + outcome, cobalt = − outcome). The user wants a revamp —
scroll-linked 3D storytelling (GSAP + three.js), abstract spaces in 2D/3D, an Operator Lab, equation↔scene
links, a 3D grapher, Babylon.js where it earns its place, Blender assets, Townsend 2E as a reference —
executed by four specialist subagents with Claude as orchestrator and judge, after the user and Claude
agree on the concepts (done in this planning round).

## Locked decisions
| Area | Decision |
|---|---|
| Engines | three.js (r3f) for lectures. Babylon.js only on a lazy `/lab` route: in-scene 3D controls (Babylon GUI) + student sandbox (Babylon Inspector). Both read `app/src/physics/`. |
| Scroll | GSAP ScrollTrigger, scroll-**linked** (native scroll, no ScrollSmoother). Per unit a pinned stage; beats = lecture says → books add → clues; challenges unpinned below. Static + reduced-motion path. |
| Spaces (first) | Lab ℝ³ (SG apparatus) · Hopf fibration S³→S² · operator space a₀I + a·σ · Bloch ball with mixed states |
| Equations | Operator Lab + equation↔scene term links + general 3D grapher |
| Look | Hybrid: light paper prose, dark "phosphor" stage. **Beauty-first lighting** everywhere, compensated by a mandatory **space passport** on every stage. |
| Fidelity | Every scene names its distortions ("what this picture gets right / wrong"); some challenges test them. |
| Readers | **Core text** for "stuck after the reading" + inline **glosses** for "meeting it cold" + a **review card** per unit for "exam review". One source of truth. |
| Devices | Laptop only; < 900 px gets a static reading version (existing 2D widgets). |
| Sharing | None. Each student plays locally; only self-typed input is untrusted. |
| Hosting | Decide later; build host-agnostic. Nothing is published without the user's go-ahead. |
| Homework items | Hints only (existing `assigned` flag). |
| Blender | After the Phase-0 gate; user starts Blender with the MCP add-on (localhost:9876). |
| Order | Gate → L1 vertical slice → extract skill → L2–L6. |
| Reference | Townsend 2E (printed page = PDF page − 16): Ch1 ↔ L1–L2, Ch2 ↔ L3–L6, §5.7 density operator. Add to `pipeline/course.config.json`. |

## Execution model: Claude orchestrates and judges; four subagents propose and build
```
                 ┌──────────── graphify concept graph (sources + code) ─────────────┐
                 ▼                                                                  │
 ROUND 1  PROPOSE (parallel, read-only → docs/roles/proposals/<role>-<phase>.md)    │
   [P] physics   [D] 3D designer   [W] web developer   [S] security auditor         │
                 └──────────────┬───────────────┘                                   │
 JUDGE   Claude reconciles conflicts → docs/roles/decisions/<phase>.md;             │
         any conflict of intent goes to the user before building                    │
 ROUND 2  BUILD (each subagent in its own git worktree)                             │
   W first: stage/story infra + math interfaces  ──▶  then in parallel:             │
     D: scenes on W's interfaces   P: content/beats/fidelity/layers   S: hardening  │
 INTEGRATE Claude merges worktrees, resolves conflicts, runs the full test suite    │
 ROUND 3  VERIFY (parallel)                                                         │
   P: numbers + rendered-scene truth report   S: diff audit   D: visual QA vs spec  │
 JUDGE   pass all gates → commit, graphify update, BUILD-LOG ─────────────────────────┘
         fail → targeted fix tasks back to the owning role (loop)
```
- Subagents run via the Agent tool (`isolation: "worktree"` for builders); ≤ 4 concurrent, well under the
  medium workflow-size guideline. Every subagent prompt carries: this plan, `CLAUDE.md`, `BUILD-LOG.md`,
  its role brief below, the interfaces it must honor, and its acceptance checks.
- **Judge rubric** (evidence-based-scoring skill): each claim of "done" needs a measurement that could have
  failed (test output, frame time, contrast readout, chunk list, audit grep), recorded in BUILD-LOG.

## Role briefs

### [P] PhD physics verifier + plain-language editor
- **Claim ledger:** every quantitative sentence is a `Claim` checked in vitest; each new engine function gets
  a numpy fixture computed by an independent algorithm (extend `pipeline/make_fixtures.py`).
- **Fidelity contract** per stage (`fidelity: { exact[], schematic[], misleading[] }`). Seed list: Bloch
  angle = 2× Hilbert angle; stereographic Hopf keeps circles, distorts distance; lab field model qualitative;
  beam glow is not light; operator space draws a⃗ in 3D and a₀ as a separate gauge (4th dimension).
- **Reader layers:** writes core text; tags terms with glosses (`glossary.ts`); writes each unit's review card.
  Lint rules as tests: summaries ≤ 25-word sentences; **symbol-before-use** (every TeX symbol defined in the
  unit, a prerequisite, or the glossary); notation Rosetta (lecture ↑/+z · Townsend |±z⟩ · Susskind |u⟩|d⟩|r⟩|l⟩|i⟩|o⟩).
- **Cross-source check** lecture ↔ Townsend ↔ Susskind ↔ Axler; errata as `Correction` (known: L1 p.4 45°≠3/4,
  L4 p.10 mean ħ/4 not 0, L4 "Chapter 4" → Susskind Lecture 3).
- **New concept content:** superposition vs mixture in the Bloch ball; global phase as a Hopf fiber;
  +i vs −i ↔ right-handed axes (Townsend Fig. 1.10); photon-polarization counterexample to "sphere = space".

### [D] 3D designer
- **Beauty-first** lighting on all stages; **space passport** is mandatory: persistent label
  ("PHYSICAL SPACE ℝ³ · metres" / "STATE SPACE · Bloch sphere · not a place" / "OPERATOR SPACE" / "S³ via
  stereographic projection"), axes labelled in that space's units (x, y, z vs ⟨σx⟩, ⟨σy⟩, ⟨σz⟩ vs a_x, a_y, a_z),
  fidelity note one click away.
- **Reserved encodings:** amber = +, cobalt = −, near-white = the state, silver = structure; Hopf fibers use a
  luminance ramp, not hue.
- **Stage format:** prose 45% / stage 55%; stage background 6–18% luminance; captions and labels in the DOM.
- **Scene specs** (`docs/roles/scene-specs/<unit>.md`): each beat = one shot + one change; motion is a closed
  numbered list; reduced motion = cuts. Spaces: lab ℝ³ (knife-edge pole over groove, gradient streamlines,
  instanced atoms with trails, persistent plate deposit), Hopf (fiber tubes + linked mini Bloch sphere; global
  phase slides along a fiber while the Bloch point stays), operator space (arrow a⃗, eigen-axis ±â through a
  ghost Bloch sphere, a₀ gauge), Bloch ball (translucent ball, purity readout, selective vs non-selective
  measurement animations).
- **Blender (post-gate):** SG magnet/oven/plate GLB (self-hosted Draco decoder if used); two chapter-opener
  image sequences (Hopf fibration, 720° belt trick) scrubbed on canvas.

### [W] Web developer
- **One WebGL context** on lecture pages: global r3f `<Canvas>` + drei `<View>` per pinned stage.
- **Scroll → state without React churn:** ScrollTrigger writes beat progress to a mutable store; `useFrame`
  interpolates typed `StageState`; React re-renders only on beat change; kill triggers on route change;
  StrictMode-safe.
- **Schema (backward compatible):** `Unit.story?: Beat[]` `{ id, text, stage: StageState, terms? }`,
  `StageKind = 'lab-r3' | 'hopf' | 'operator-space' | 'bloch-ball' | 'bloch'`, `fidelity`, `review`,
  glossary; passport text derived from `StageKind`.
- **New pure-TS math** in `app/src/physics/`: `hopf.ts`, `operators.ts` (decompose a₀, a⃗; classify; 2×2
  `expm` via s = tr/2, q² = −det(M − sI), q→0 limit), `density.ts`, `field.ts`, `expr.ts` (complex-matrix and
  grapher compiler extending the recursive-descent approach in `app/src/ui/parseNumber.ts`; no eval/Function).
- **`/lab` (Babylon):** `@babylonjs/core`, `@babylonjs/gui`, `@babylonjs/inspector` (dynamic import on toggle,
  never the CDN default); route-level `lazy()`; a build test asserts no `@babylonjs` code in lecture chunks.
- **Term links:** KaTeX `trust` as a function allowing only `\htmlClass` matching `^term-[a-z0-9-]+$`;
  focusable terms; hover/focus → store → stage highlight.
- **Reuse:** `physics/{spin,sg,linalg,complex,random}.ts`, `ui/{Rich,primitives,texfmt,parseNumber}.tsx|ts`,
  `content/schema.ts`, `progress.ts`, existing widgets (static fallback + Lab panels), `widgets/registry.tsx`.

### [S] Security auditor (OWASP Top 10:2025 + PII)
Threat model: static, client-only, no accounts, **no sharing** → untrusted input is only what a student types.
| OWASP 2025 | Here | Control |
|---|---|---|
| A05 Injection | KaTeX HTML sink in `app/src/ui/Rich.tsx`; typed expressions | separate `renderUserTex` (trust off, `maxSize`, `maxExpand`, length cap); trusted renderer only for authored content; no eval in `expr.ts` |
| A02 Misconfiguration | no CSP | meta CSP `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; worker-src 'self' blob:`; `_headers` template ready for a header-capable host |
| A03 Supply chain | npm deps; Inspector/Draco CDN defaults; Google Fonts | `npm audit` gate; lockfile; bundle Inspector; self-host Draco + fonts; zero runtime third-party scripts |
| A08 Integrity | third-party assets | none at runtime after self-hosting |
| A10 Exceptional conditions | NaN/∞, huge grids, WebGL context loss | clamp resolution, guard non-finite values, `webglcontextlost` handler + fallback |
| A06 Insecure design | future sharing | documented: any sharing feature requires validation + size caps first |
| A01/A04/A07/A09 | no auth/secrets/server | recorded N/A; re-open if accounts appear |
PII/leakage: self-host fonts (Google Fonts leaks visitor IPs); move local source paths from
`pipeline/course.config.json` into git-ignored `course.config.local.json`; keep `sources/` ignored plus a
**verbatim-overlap check** (n-gram overlap of `app/` text vs `sources/`) in tests; validate the
`progress.ts` localStorage shape; no analytics; git identity already GitHub-noreply (verified) — keep.

## Phases
0. **Gate** (throwaway, `app/src/gate/`, one W subagent + D review): pinned dark stage beside prose + KaTeX
   (composited contrast ≥ 4.5:1 incl. passport text), ≤ 8 ms/frame for Hopf (≥ 64 fibers) and lab scene on the
   user's laptop, ScrollTrigger + `<View>` survive StrictMode/resize/route change with zero leaked
   triggers/contexts. Report numbers; kill or reshape before Phase 1.
1. **Propose (L1):** P concept specs, D scene specs, W interface design, S threat audit of the proposals →
   Claude judges → short conceptual review with the user on anything contested.
2. **Build L1 slice:** W infra → D scenes ∥ P content/layers/fidelity ∥ S hardening → integrate → verify loop.
3. **Blender + `/lab`:** Blender assets and chapter openers (user starts Blender); Babylon Lab with in-scene
   controls, Inspector sandbox, Operator Lab, grapher.
4. **Skill extraction** (skill-creator): pipeline + schema + role briefs + gates + orchestration as a reusable
   course-building skill.
5. **L2–L6** through the same propose → build → verify loop.

## Verification
- `cd app && npx vitest run`: engine + new math vs numpy fixtures, claims, symbol-before-use lint, parser fuzz,
  verbatim-overlap check, localStorage validation.
- Playwright (new devDependency): scroll each unit, screenshot every beat, zero console errors / CSP violations,
  rAF frame-time sampling, framebuffer contrast readout; `/lab` loads Babylon while lecture routes don't.
- `npm run build` + chunk assertion; `npm audit` clean (or documented).
- Per-phase reports in `docs/roles/audits/` (physics truth, security, visual QA) judged by Claude.
- `graphify update .` after code changes; `BUILD-LOG.md` rewritten at every phase boundary.
