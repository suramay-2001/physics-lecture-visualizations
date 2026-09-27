# BUILD-LOG — Quantum Spin Lab (Physics 448 interactive notes)

## Current state
- v1 app (schema, 12 widgets, pages, L1) + physics engine: done, tests green.
- **Revamp** (plan: `docs/roles/PLAN.md`, rubric: `docs/roles/JUDGING.md`, decisions: `docs/roles/decisions/L1.md`):
  - Phase 0 gate: **PASSED 2026-09-25** (judge re-measured; see Evidence). Gate code merged at `app/src/gate/`
    (throwaway reference: store/View/ScrollTrigger pattern, `hopf.ts`, `ball.ts` with tests).
  - Round 1 complete: P1, P2, S, W, D proposals judged; decisions #1–#25 in `docs/roles/decisions/L1.md`.
  - Rounds 2–3 complete: L1 story (31 beats) live with lab, state-plane and Bloch-ball scenes; truth sign-off PASS.
  - Security P0 done: source paths moved to git-ignored `pipeline/course.config.local.json`; local history
    rewritten (filter-branch) + reflog expired + gc; 0 leaking blobs verified.
  - Physics fixes applied to L1: photon cos²θ vs spin cos²(θ/2); logic-unit overclaim removed.
  - **L1 vertical slice COMPLETE** (2026-09-26, main 47fb7e1): 31 beats + 7 reveals, truth sign-off PASS.
  - **Phase 3a Blender DONE (2026-09-27)** — rulings `docs/roles/decisions/P3-blender.md` (#1–#11):
    - `pipeline/blender/`: `common.py` (render settings), `opener_hopf.py`, `opener_belt.py`, `lab_assets.py`,
      `gen_opener_data.ts` (engine → JSON, git-ignored), `render_openers.sh`. Scripts are the source of truth;
      no `.blend` is kept.
    - Chapter openers rendered: `app/public/openers/{hopf,belt}/0000–0119.webp` + `poster.webp` (hopf 4.0 MB,
      belt 1.0 MB). Player `app/src/openers/OpenerScrub.tsx` (2D canvas, ≤ 9 decoded bitmaps, story's centre-line
      mapping, poster under reduced motion / < 900 px). Captions `openerCopy.ts` (claims tested). **Placement in
      the course is still the user's call**; preview only at DEV route `#/dev/openers`.
    - New engine code: `physics/belt.ts` (quaternion = SU(2) belt-trick homotopy), `openers/openerData.ts`
      (Hopf fibers via `physics/hopf.ts`); `tokens.ts hopfRampHex`.
    - Lab hardware GLB `app/public/models/lab.glb` (4 754 tris, 136 KB, geometry only): yoke + bolts, coils,
      arrow mount, oven (shields, flange, stand), slit on U-bracket, plate frame + foot, stop, rail profile.
      Loaded by `stage/scenes/lab/hardware.ts`, swapped into the rig in place; poles stay procedural.

## Next action
Phase 3b: the Babylon `/lab` route (lazy): Operator Lab on `physics/expr.ts` + `operators.ts`, 3D grapher, SG
sandbox with Babylon GUI in-scene controls, Inspector bundled locally (dynamic import on toggle, never the CDN);
a build test asserts no `@babylonjs` code in lecture chunks. Cosmetic backlog: busy end-on lab shots, split-pane lab readouts flash
during transitions.

## Plan (agreed with user 2026-09-23, revamped 2026-09-24)
See `docs/roles/PLAN.md`. Order: gate → L1 vertical slice → extract skill → L2–L6.

## Locked decisions & tuned constants
| Decision | Value | Why |
|---|---|---|
| Internal units | ħ = 1, S = σ/2 | Keeps engine dimensionless; lectures use ±ħ/2 so UI appends ħ |
| Phase convention | eigenvectors: first component real ≥ 0 | Matches L4/L5 "choose a real and positive" |
| |+y⟩ | (1, i)/√2 | L2 derivation (c = +i) |
| Rz(φ) | diag(e^{-iφ/2}, e^{iφ/2}) | L6 convention; Rz(2π) = −I is tested |
| Sources in git | never | copyrighted; app paraphrases + cites |
| Lecture 1 "3/4 at 45°" | corrected to cos²(22.5°) ≈ 0.854; 3/4 occurs at 60° | numpy + engine agree; used as a "spot the error" challenge |
| Lecture 4 p.10 "theoretical mean is zero" | corrected to ħ/4 | leftover from the |+x⟩ example |
| Green Book (quant interviews) | excluded | not physics; format inspiration only |
| Reif | reference-only (§1.2–1.6 binomial) | scanned; only finite-sample statistics are relevant |
| Blender assets | geometry/frames only; engine computes, Blender draws | P3 #4; CLAUDE.md "physics visuals computed in code" |
| GLB compression | none (no meshopt/Draco/wasm) | CSP `script-src 'self'` blocks wasm; 136 KB raw is fine (P3 #1) |
| GLB axes | exported +Y up OFF = physics axes; app units, module-local frames of geometry.ts | no transform to get wrong (P3 #3) |
| Hopf opener camera | r 6.5 → 10 → 18 → 22 u; outer rings omit fibers with φ within ±0.95/±1.15 rad of 0 | spec's r 7–9 sat inside the θ = 130° fibers (reach 4.5 u) (P3 #7–8) |
| Belt homotopy | R_u(s) = Rot_n(u)(2πs)·Rot_z(2πs), n(u) = (sin πu, 0, cos πu); slack 2 | exact start at 720° twist, both ends +1, flat at u = 1; no cusps (P3 #5) |
| Opener player | ≤ 9 decoded ImageBitmaps (+1 on screen), coarse-to-fine load, 2.2 vh/frame | D §5.3 memory budget (a decoded frame is 5.83 MB) |

## Evidence / score history
- 2026-09-23: engine 18/18 tests vs numpy fixtures (seed 448). Mutation checks above.
- 2026-09-25 Phase-0 gate, re-measured by judge on the user's Mac (Apple M5, Chrome, 1440×900 @2×, canvas
  2880×1800): p95 frame ms lab 3.8 · Hopf-64 5.4 · Hopf-128 4.4 · Bloch ball 4.7 (limit 8). Label contrast:
  20 labels, worst 7.95:1 (hopf mini-passport; limit 4.5) — passes only because of the label backing panels
  (without: as low as 1.01). Contexts: 1 live (4 created / 3 lost over 4 visits). Triggers 3→0→3 each route
  round-trip. <900 px: no canvas. Tests 58/58. Stage bg L* 12.8 (Y 1.5%) — judged by L* (perceived lightness).
- 2026-09-25 W0 contracts, verified by judge before tagging `l1-freeze` (8c11c46): tsc 0; vitest 157/157
  (14 files); build OK (70 assets); L1.ts diff 0 lines; mutation: invalid beat id → 2 content tests fail;
  Workbench demo story: 1 WebGL context, 0 lost, stays 1/0 over 3 route round-trips (gate was 1 per visit).
- 2026-09-25 S merged (2d373a9): vitest 395 passed / 51 skipped (expr spec awaiting W1) / 1 todo; judge
  re-checked the BUILT app: CSP meta present, 0 CSP violations on #/, #/lecture/L1, #/gate, #/help,
  #/formulas (listener + console), 0 third-party requests, fonts loaded = Barlow Condensed, Literata Variable,
  Martian Mono (self-hosted). S found KaTeX negative-size bypass (\kern{-500em}) → renderUserTex rejects >40em.
- 2026-09-25 W1 + P merged (main 066b3de): build → vitest 726/726 (29 files); Playwright on installed Chrome:
  preview 10/10, dev 13/13 (after fixing a stale e2e assumption: L1 now has a story, 5 triggers). Live L1 at
  1000×640, foreground tab: 5 story units, 31 beats, 5 triggers, 1 WebGL context, 0 lost, 0 KaTeX errors, no
  overflow. Integration catch: S's auto-activating expr spec disagreed with W1 on `__proto__` reason
  (bad-char vs unknown-identifier) — both reject; spec relaxed. Judge found a truth defect (round3 #5).
- 2026-09-25 D merged (main 96aca00) — Round 2 complete: build → vitest 738/738 (31 files); Playwright preview
  10/10, dev 13/13. D self-check: p95 ≤ 6.4 ms all L1 units (1000×640 / 1440×900), worst label contrast 5.72:1,
  0 label overlaps. Judge visual QA (foreground tab): l1-quantized:b4 physics right (+699·−0, Born 100%) but
  stale cobalt deposit from previous beat (round3 #8); l1-vectors:b3 plane correct (1/√2 projections, 0.500/0.500);
  duplicate ⓘ in passports (#9).
- 2026-09-25 Round 3a merged (P, S, W) + beamTo on b1: build → vitest 797/797 (36 files); Playwright preview 13/13,
  dev 15/15; classical-beat walk: 1 beat, 0 quantum readouts. S audit: 0 High/Medium; built app 31/31 beats +
  7/7 reveals, 0 CSP violations, 0 third-party requests, 0 verbatim 8-grams, npm audit 0. Judge confirmed W's
  `sigmaBand` = spread of the MEAN reading 2√(p(1−p)/N) (caption ±0.224 at p=0.854, N=10); `sigmaFraction` kept.
- 2026-09-26 Round 3b by the integrator (subagents stalled 4×): fixes #8 #14 #15 #16 #17 #19 #20, D1–D3, real
  Bloch-ball scene. vitest 813/813 (40 files); Playwright preview 13/13 + dev 15/15 (before the ball scene);
  production bundle has no `__gate`; judge QA screenshot of l1-vectors:b7 reveal at 1440×900 via a throwaway
  Playwright script (the pane was 280 px wide → static reading version, itself verified).
- 2026-09-26 **L1 VERTICAL SLICE COMPLETE** (main 47fb7e1): tsc 0; vitest 816/816 (40 files); Playwright preview
  13/13 + dev 15/15 (installed Chrome); npm audit 0. Round 3 all items closed (#11 chip flash judged unnecessary:
  segment chips already show the label change; classical ring caption reworded). Judge visual QA of all 31 beats +
  7 reveals (38 frames) → truth sign-off PASS (`docs/roles/audits/L1-truth-report.md`).
- 2026-09-27 **Phase 3a Blender**: build OK; vitest 852/852 (+36: belt 12, opener data/copy/ring 18, GLB audit 5,
  ramp 1); Playwright preview 13/13 (L1: 0 CSP violations, 0 third-party requests with lab.glb loading; lab bench
  p95 1.5 ms) + dev 19/19 (+4 openers: scrub reaches frame ≥ 110, ≤ 10 decoded, caption↔frame ranges, 2→0→2
  triggers, reduced motion fetches 0 frames). Renders: Cycles 128 spp + OIDN, ≈ 9–15 s/frame headless on the M5
  (GPU via Metal under --factory-startup); background measured (23,30,43) vs #161d2c (22,29,44). Frames avg
  hopf 32.5 KB (max 62) · belt 7.0 KB (budget 70). GLB 4 754 tris / 136 KB (budget 60 k / 600 KB). Judge visual
  QA: 8 lab beats with vs without hardware (GLB blocked → procedural fallback, no page errors); 16-frame contact
  sheets of both films. Production JS contains no openers code (DEV route dropped); GLTFLoader only in the lazy
  LabR3Scene chunk.

## Hard-won platform knowledge
- OneNote PDF exports (L1, L2): PyMuPDF `get_image_info()` returns the SAME image list on every page,
  so image-area flags are meaningless there. Handwriting is stored as hundreds of vector paths per
  page (`page.get_drawings()`), and pasted screenshots carry equations the text layer never sees
  (e.g. L2's c = ±i derivation, L2's "1 → i → −1 → −i ↔ +x → +y → −x → −y"). Rule: every lecture
  gets a visual pass via `sources/<L>/sheets/*.png`, regardless of the flag.
- Reif PDF is a tiff2pdf scan (no text layer at all).
- macOS filesystems are case-insensitive: writing `app.css` over Vite's `App.css` kept git's recorded name
  `App.css`, which breaks `import './app.css'` on Linux/CI hosts. Fixed with `git mv -f`. Check
  `git ls-files` casing after any case-only rename.
- The Browser pane's `preview_start` reads `.claude/launch.json` from the session's ORIGINAL folder, not this
  repo. Workaround: start Vite yourself (`npx vite --port 5178 --strictPort` in `app/`, background) and call
  `preview_start` with `url`. Background browser tabs don't paint, so screenshots come back blank; front the
  tab (`tabs_select`) before taking a screenshot. DOM/JS checks work in background tabs.
- The user sometimes clicks around in the pane; do QA in a separate tab rather than the user's.
- Townsend 2E PDF: text layer present, no bookmarks; printed page = PDF page − 16.
- Gate/Browser pane: the pane throttles rAF to ~1 frame/2 s when unfocused and its screenshots can be offset
  from scroll; measure with the gate's `bench()` (renders frames itself, GPU-fenced) and `scrollTo(…, {wait:false})`.
  Large emulated viewports (1440×900) screenshot tiny; emulate 1000×640 for visual checks. `javascript_tool`
  times out at 45 s — run `bench()` and `contrastAll()` (~30 s) in separate calls.
- drei `<View>` decides visibility via React state → a stage is blank for 1–2 frames on entry; hidden by a
  dark column background. Real build: custom View visibility in the frame loop.
- `cdn.security` and `csp.security` tests read the BUILT `dist/`; right after a merge a stale `dist/` made 6
  tests fail until `vite build` ran. Always build before vitest (CI order: build → test). Round-3 fix for S:
  detect stale dist (older than src) and fail with a clear "run npm run build" message.
- Subagents with broad read-heavy briefs (whole books + many deliverables) stalled at the 600 s watchdog
  with nothing written (P and S, round 1, 2026-09-25). Fix that worked in the relaunch prompt: first action
  = write the doc skeleton, then fill one section at a time; read with offset/limit and greps only; split
  big roles (P → P1 verification, P2 story/layers).
- Same failure again (D Round 3b, 2026-09-25): 10 items + 31-beat browser QA in one brief → stalled with ZERO
  commits, and the worktree was auto-deleted (nothing to recover). Rule now: builders commit after EVERY item,
  and code/test work, new visuals, and browser QA are separate sequential agents (D-a → D-b → D-c).
- ROOT CAUSE of the stalls (found 2026-09-25): the auto-mode safety classifier was timing out ("temporarily
  unavailable (timed out)"), so every tool call waited; subagents made no progress and hit the 600 s watchdog —
  even a 1-item brief stalled. It was not brief size. When this happens: do the work in the main context in small
  steps, retry tool calls after a pause, and relaunch subagents only once plain tool calls are fast again.
- Axler 4e: printed page = PDF page − 14.
- Blender headless: `Blender -b --factory-startup --python-exit-code 1 -P script.py -- args`. `--factory-startup`
  keeps the user's add-ons out (the MCP add-on would try to bind :9876 a second time) and makes it safe to set
  Cycles GPU prefs (never saved). In the MCP GUI, scripts build in their OWN scene (`common.scene`) and never
  touch the user's scene or preferences; exec with `ARGS={...}` for low-res look-dev frames.
- Node 24 runs app TS directly (type stripping) when imports carry `.ts` and syntax is erasable (tsconfig has
  `erasableSyntaxOnly` + `allowImportingTsExtensions`); `pipeline/blender/package.json` `"type": "module"`
  silences the MODULE_TYPELESS warning (there is a stray `~/package.json`).
- meshopt's decoder is WebAssembly: blocked by our CSP (no `'wasm-unsafe-eval'`). Keep GLBs uncompressed.
- Tests that read files under `src/` must use `src/security/node.ts` (`fs`, `path`, `APP_DIR`), not `node:fs`
  imports: tsconfig.app has no @types/node on purpose. `readFileSync(p)` (no encoding) returns bytes.
- e2e type-checks with the build (`tsc -b`): any new `window.__x` hook needs a declaration in `e2e/helpers.ts`.
- Scroll-scrubbed films follow the viewport CENTRE line (story mapping): a test must scroll the section from
  `top − vh/2` to `bottom − vh/2` to reach the last frame.
- Canva MCP needs OAuth (user must authorize in claude.ai connector settings). Blender MCP needs
  Blender running with the MCP add-on on localhost:9876 (was not running 2026-09-23).
  Higgsfield connected (995 credits at start) — spending credits needs the user's go-ahead.

## Open issues
- Opener placement DECIDED (user, 2026-09-27): Hopf film on the home page under "Where this is heading" (after
  the lecture list; lazy player, `level={3}`); the belt trick opens the L6 rotations unit — until L6 exists it
  is only on `#/dev/openers` and its 1.0 MB of frames ship unreferenced in `dist/openers/belt/`.
- Blocked on user: authorize Canva connector (formula cards). Higgsfield credits need the user's go-ahead.
- Course's own sources (Vavilov 2019 notes, Walker 2020 notes) are not public; public analogues:
  MIT 8.05 (Zwiebach) L3–6, Susskind TM lectures, 3B1B Essence of Linear Algebra ch. 9/13/14.

## KT points (handover for the next compaction)
1. Roles run in the main context (subagents stalled on classifier timeouts; user approved "You continue directly").
   Keep role discipline anyway: D look/spec, P claims + tests, S audit, W wiring; Claude judges with evidence.
2. Build before vitest (security tests read `dist/`). Commands from `app/`: `npm run build`, `npx vitest run`,
   `PW_PREVIEW_PORT=5186 npx playwright test --project=preview`, `PW_DEV_PORT=5178 npx playwright test --project=dev`
   (5178 = the long-running dev server; reuseExistingServer picks it up).
3. Visual QA = throwaway `e2e/_qa-*.spec.ts` writing PNGs to the scratchpad + PIL contact sheets; delete before
   committing. Blender look-dev = exec the script in the MCP GUI with `ARGS` (low res), final renders headless.
4. Every learner-visible number comes from `app/src/physics/` with a test; Blender/opener frames state nothing —
   their DOM captions carry the claims (`openerCopy.test.ts`).
5. Opener pipeline: `node pipeline/blender/gen_opener_data.ts` → `sh pipeline/blender/render_openers.sh [hopf|belt]`
   (≈ 20–30 min each). Lab GLB: `Blender -b --factory-startup -P pipeline/blender/lab_assets.py`, then
   `npx vitest run src/stage/scenes/lab/hardware.test.ts`.
6. After code changes: `graphify update .` (check graph for `sources/`, `/Users/`, `node_modules`: must be 0).
7. Printed-page offsets: Axler PDF − 14, Townsend PDF − 16.

## Resume checklist
1. Read this file, then CLAUDE.md
2. `cd app && npx vitest run` (expect all green), `npm run dev`
3. Continue at "Next action"
