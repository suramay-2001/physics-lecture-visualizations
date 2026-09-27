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
  - **Phase 4a story navigation DONE (2026-09-27)** — spec `docs/roles/proposals/D-nav-story.md` (approved):
    topbar Lectures panel + Motion toggle; lecture opener, beamline route rail (atom), "02 / 05" chapter cards +
    step strip, "Where next" fork, Story/Read toggle; Arcade v1 (Route the beam 6 · Spot the error 5 · Bloch
    golf 5, engine verdicts); Concept map v1 (22 concepts, L1–L7); Help routes back to chapters. Audit:
    `docs/roles/audits/P4a-security.md` (PASS).
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
  - **Phase 4b skill DONE (44fcd9c)**: `skills/course-builder/` (SKILL.md + references pipeline, content-model,
    navigation, roles-and-gates, media, lecture-checklist), copied to `~/.claude/skills/course-builder/`.
  - **Stage scenes for L2–L7 DONE**: `BlochScene` (pure-state sphere; shots B-STD, B-EQUATOR, B-POLE = straight top
    view, +x right / +y up), `OperatorSpaceScene` (a₀I + a·σ), `HopfScene` (reveal levels 1–5, mini Bloch sphere).
    Placeholders deleted. DEV route `#/dev/lecture/demo-spaces` exercises all three.
  - **Claim ledger for many lectures**: `content/claimKit.ts` (keyedClaim, tf/uf/pct/d), `content/values.ts`
    `mergeValues` (throws on a duplicate key); numpy twins for every lecture in `pipeline/make_claim_fixtures.py`.
  - **Lecture 2 BUILT (2026-09-27)**: `L2.values.ts` (83 engine values), `L2.story.ts` (38 beats, 5 clues),
    `L2.review.ts`, `L2.ts` (5 units, 20 challenges; Euler proof is homework → hints only, no walkthrough shipped),
    31 glossary terms, 3 fidelity items, 5 Arcade items, concept map units. Engine: `bilinear`, `vconj`,
    `ketFromCoeff`, `relativeCoeff`, `mutuallyUnbiased`, `csqrt`, `cpow` (numpy fixtures). Stage rule: `showPrep` only
    with a ±z source (validated). PhaseDial relabelled θ → φ.
  - **Lecture 3 BUILT (2026-09-27, merged 5a6f604)** by a worktree content agent (brief:
    `skills/course-builder/references/lecture-agent-brief.md`): 6 units, 38 beats, 6 reveals, 22 challenges, 20 glossary
    terms, 9 fidelity items, the Townsend erratum (`Correction.source: 'book'`, "the book says"), Arcade items.
  - **Engine for L4–L7 DONE** (6a26603): charPoly2, inv2, eigenvectorFor, basisChange, expmSeries, generatorOf, mpow,
    commutator, spread/spreadsFromBloch/uncertaintyCheck, rayAngle/blochAngle, relativeSign, jointProb,
    sequenceOutcomes (numpy "lectures4to7"). Bloch stage: rotate about any axis, dropLines, averages/spreads/bound
    readouts (f160b03). Widgets: Bloch rotationAngles, PhaseDial `rotations`, complex-plane angle φ.
  - **Plans for L3–L7 written and judged** (`docs/roles/proposals/P-L{3..7}-story.md`); cross-lecture rulings below.

## Next action
**Pipeline per lecture (since L3):** a worktree agent builds lecture N from the brief template while the orchestrator
QA-merges lecture N−1 and runs an independent P review of it. In flight (2026-09-27): L4 content agent (worktree) and
the L3 P review. When the L4 agent reports: merge, gate, both e2e projects, visual QA of every beat + reveal, P review,
then launch L5 the same way (fill the template with the L5 rulings from `P-L5-story.md` §11 and the cross-lecture
rulings below). After L7: the Babylon /lab.

(Old, done:) Build **Lecture 3** from `docs/roles/proposals/P-L3-story.md` with the rulings in "Cross-lecture rulings" below,
following `skills/course-builder/references/lecture-checklist.md` exactly as L2 was built (engine helpers + numpy
fixtures → `L3.values.ts` + claim twins → story/review/lecture files → glossary/fidelity/concepts/Arcade → gate →
both e2e projects → visual QA of every beat and reveal → independent P review → commit). First engine task: the
Hermitian guard in `eigenHermitian2` and a complex `expectationC` (L3 and L7 planners both found that
`expectation` drops the imaginary part and `eigenHermitian2` accepts non-Hermitian input). Then L4 → L7, then /lab.
Also in L3: (1) tilt the greyed prep module to the source's axis so `showPrep` works for ±x sources (an x magnet
can prepare ±x; only ±y stays impossible) and relax the validation to forbid only ±y; (2) stage fields G1 `image`,
G2 `project`/`renormalize`, G3 lab readout `spread`; (3) operator-space `labels: 'plain'` (passport variant already
added in `content/stage.ts`); (4) `eigen2` for any 2×2 (added in `physics/operators.ts`, tests pass; numpy fixture
still to add); `spreadAlong` (added in `physics/sg.ts`, test still to add).

## Plan (agreed with user 2026-09-23, revamped 2026-09-24)
See `docs/roles/PLAN.md`. Order (user, 2026-09-27): gate → L1 slice → Blender (done) → **story navigation /
cinematic UI design** → extract skill → L2 → L7 → Babylon /lab.

### Lecture status (2026-09-27)
| Lecture | Topic | Plan | Built in the revamp |
|---|---|---|---|
| L1 | Stern–Gerlach, sequences, averages, logic, state vectors | P2-L1 | **done** (31 beats, truth sign-off PASS) |
| L2 | vector spaces, inner products, complex numbers, +y, three bases | P-L2 (38 beats) | **done** (38 beats, 5 reveals) |
| L3 | operators, eigen, projectors, postulates, spin example, spread | P-L3 (38 beats) | **done** (38 beats, 6 reveals) |
| L4 | principles, projectors (2nd pass), example, average, spin matrices, eigen | P-L4 (46 beats) | **done** (45 beats, 9 reveals) |
| L5 | averages, inverse problem, coordinates, operators in a basis, invariance | P-L5 (36 beats) | **done** (36 beats, 7 reveals) |
| L6 | Bloch point, equator phase, active turns, Sz generator, mixtures (beyond) | P-L6 (38 beats) | queued |
| L7 | two angles, full turn, order, compatible, spreads, uncertainty | P-L7 (44 beats) | queued (page 14 missing) |

### Cross-lecture rulings (judge, 2026-09-27; applied to the plans by their planners)
- **Ownership rule:** a concept is introduced once, in the first lecture whose notes teach it; a later lecture whose
  notes repeat it keeps a unit but opens with one link-back beat and teaches only what its own notes add.
  Consequences: L3 owns pp. 14–17 (|+x⟩ example, ⟨A⟩, spread; badge "taught at the start of Lecture 4"),
  `projectors` and `expectation`; L4 owns the S_x eigenproblem (`eigen-problem`); L5 owns B, c_new = B†c_old,
  A_new = B†AB (written B_{z←x}), diagonalization, basis invariance; L6 owns the full Bloch sphere; L7 owns
  commutators and the uncertainty relation (variance: introduced L3, full treatment L7).
- **Townsend §1.4 Example 1.2, p. 17** says 75 % for +ħ/2; it is 25 % (75 % is −ħ/2). Found independently by the
  L3, L4 and L7 planners on the rendered page. L3 shows it as a book-erratum line in its corrections box.
- **Notation:** θ is always the Bloch polar angle; φ the azimuth / relative phase / Rz angle (φ₀ for a starting
  longitude). The notes' equatorial θ (L6, L7) is renamed in the app, stated once in a Rosetta line.
- **Operator-space stage** may appear in L3 (Hermitian examples, $S_z$ from projectors) with a new passport variant
  that does not show σ: `OperatorSpaceState.labels: 'plain'` → "OPERATOR SPACE · 2×2 Hermitian" and a note reading
  the arrow as half the eigenvalue gap and the gauge as their midpoint. The σ passport starts at `l4-matrices:b5`.
- **L3 stage additions approved:** G1 `HilbertPlaneState.image` (Â|ψ⟩ as a true-length arrow, real matrices only),
  G2 `project`/`renormalize` (Rule 3 as a picture), G3 lab readout `spread` (±Δσ bracket, distinct from sigma-band).
- **Book errata** (Townsend Ex. 1.2) go in the lecture's corrections box, labelled as the book's, plus one
  Spot-the-error round credited to the book. Verified by the judge on the rendered page (2026-09-27).
- L2 Q1: the complex-numbers unit uses the Bloch top view (B-POLE) as its unit circle; Q2 only marked homework is
  hints-only; Q3 pasted blocks in the notes count as lecture content.

### Lecture 7 (added 2026-09-27)
- Source: `Lecture_7.pdf` (path in the git-ignored local config), typeset, text layer complete; visual pass done
  (boxed equations and two tables, no figures). **Footers read "n / 14" but the PDF has 13 pages: page 14 is
  missing** (after Reference B). Ask the user for it before authoring L7.
- Content: 7.1 Bloch recap, state-ray angle η = Δθ/2 · 7.2 Rz(2π) = −I, Rz(4π) = I · 7.3 Rz(φ) = e^{−iφSz/ħ},
  generator · 7.4 update rule, measurement order · 7.5 common eigenbasis ⇔ [A,B] = 0 · 7.6 projector order,
  [Sx,Sy] = iħSz · 7.7 spreads, (ΔSᵢ)² = ħ²/4 (1 − rᵢ²) · 7.8 ΔSxΔSy ≥ (ħ/2)|⟨Sz⟩| from Bloch geometry ·
  7.9 Robertson, Δx Δp ≥ ħ/2 preview · Ref A squared-norm proof · Ref B rotation of ⟨S⟩, p± = ½ ± ⟨Sn⟩/ħ.
- Judge/P check (2026-09-27): every derivation above re-done against the engine conventions; no erratum found.
- Books: Townsend Ch2 rotation sections (already ingested) + §3.1 p.75, §3.2 p.80, §3.5 p.91 (PDF 91–112 added);
  Susskind Lecture 5 "Uncertainty and Time Dependence"; public: Zwiebach MIT 8.05 Notes 5 §2, §7 (cited by L7).
- **Notation clash to handle in the Rosetta:** L7 uses θ for the EQUATORIAL angle (azimuth) and ϕ for the applied
  rotation; the app's Bloch angles are (θ polar, φ azimuth). L7 content must rename or gloss, never mix.
- Engine needs for L7: commutator helper, spreads from r (ΔSᵢ), uncertainty-bound check, measurement-order
  probabilities (sg.ts sequences cover most), derivative of Rz at 0 (expm2 exists).
- Belt-trick opener: the 360° sign is taught in **L7 §7.2** (L6 builds Rz but never takes the full turn), so
  the user's rule "belt where Rz(2π) = −1 is taught" places it at L7 §7.2, not L6.

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
| Claim keys | alphanumeric, lecture-prefixed (`l2…`), unique course-wide | claimKey regex `^([A-Za-z0-9]+) · `; `mergeValues` throws on duplicates |
| Assigned homework | `walkthrough: []` in the content file (tested), hints only | a withheld walkthrough would still ship in the JS bundle |
| B-POLE shot | el 90°, camera up = physics +y, ±z pole labels hidden | makes the equator the complex unit circle (1 right, i up); the old el 80° view was rotated ~140° |
| Bloch readout | parts under 0.005 print as 0 | float residue printed "−0.71 − 0.00i" |

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

- 2026-09-27 **Lecture 2** (8c6faa5 + review fixes c58af8f): gate 1035/1035; Playwright preview 31/31 + dev 36/36;
  visual QA 38 beats + 5 reveals (caught B-POLE tilted view and "− 0.00i"); independent P review FIX-FIRST → fixed
  (raw float "1.23e-32" in a walkthrough → new raw-float test).
- 2026-09-27 **Lecture 3** (merge 5a6f604): gate 1240/1240; Playwright preview 33/33 + dev 37/37; visual QA 38 beats +
  6 reveals (two blocking beats moved off the tracking close-up; image readout reworded). Independent P review
  FIX-FIRST → fixed (6364fbc): a wrong "swapped basis" matrix option; Susskind is "a common misconception", not "the
  most common"; claims tightened; gate 1241/1241.
- 2026-09-27 **Lecture 4** (merge 9a2eebb): gate 1445/1445; Playwright preview 35/35 + dev 38/38; visual QA 45 beats + 9
  reveals caught two LAB bugs (an unreachable plate painted a 50/50 deposit; a 60° prep bench read "θ = 0°"), fixed
  a0a4363. Independent P review FIX-FIRST → fixed (9f30faf): an order challenge marked a correct answer wrong
  (normalize/phase commute); "perfectly distinguishable"; second passes now link back; gate 1447/1447.
- 2026-09-27 **Lecture 5** (merge 80740f9, glossary conflict resolved): gate 1656/1656; Playwright preview 37/37 + dev
  39/39; visual QA 36 beats + 7 reveals clean. Platform fix found by the L5 agent: lazy Try-it widgets in a non-last
  unit made later units' triggers stale → one ResizeObserver on the lecture (13708e6); control run proves it.
- 2026-09-27 **Phase 4a navigation**: build OK; vitest 882/882; Playwright preview 28/28 + dev 35/35 (new: nav 9,
  arcade 4, map 3, openers 5); npm audit 0; production CSP 0 violations on 6 routes. Judge visual QA caught 3 real
  bugs tests could not see (atom offset by the key-hint line; words run together in inline-block title spans;
  game "Solved" box inheriting challenge-card styles) and one test caught an app.css range deletion (logged).

## Hard-won platform knowledge
- Anything inserted BETWEEN story units after first layout (a lazy film, `UnitOpener`) moves every later unit without
  changing their own heights, so their ScrollTrigger positions go stale and beats stop activating. Such a block must
  watch its own height and call `scheduleStoryRefresh()` (stage/useStoryScroll.ts), as `UnitOpener` does.
- A background agent can die mid-task on a usage limit: its worktree keeps the partial files. Resume it with
  SendMessage (it keeps its context); have it `git merge --ff-only main` first if main moved.
- Rich text term syntax `{{key|shown}}` cannot wrap TeX that contains `|` (kets): the splitter breaks and the test
  reports "term listed but unused". Inside TeX use `\htmlClass{term-key}{|{+z}\rangle}` instead.
- Symbol lint is per lecture: kets and letters carried from an earlier lecture must be mapped in `Lecture.symbols`
  (L2 maps them to its first unit id as a recap) or come from a gloss tag's `symbols`. `\leftrightarrow` and
  `\mathbb` count as symbols (use `\Leftrightarrow`; write "complex numbers" in words).
- The claims reader needs ≥ 1 displayed number per unit with a story; an input like "½" in a caption needs a claim
  with that value too (L2 added `l2PsiTAlpha`).
- Playwright starts ONE webServer per run (the config checks argv for "preview"): running both projects without
  `--project` leaves the preview tests with no server (all fail in ~170 ms). Always run the two projects separately.
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
- Townsend 2E PDF: text layer present, no bookmarks; printed page = PDF page − 16. The file moved on
  2026-09-27 (into the Books & Textbooks folder); the local config was updated. If a source goes MISSING,
  `mdfind -name "<title>"` finds it. `ingest.py --only <ids>` re-extracts just those sources.
- Some `sources/*/text.md` files are classified as binary by `grep` (odd bytes): use `grep -a`.
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
- NEVER replace a CSS/code region by "from marker A to marker B" without asserting what lies between: on
  2026-09-27 a chapter-card edit cut `.unit-head … .formula-unit` in app.css and silently deleted ~40 unrelated
  rules (.stage, .block-label, .board, .try-this, widget sizing); a widget island collapsed to 0 px height.
  Caught by the islands e2e + visual QA; repaired by rebuilding from HEAD with asserted rule counts per range.
- Since Phase 4a the lecture opener fills the first screen: e2e that expect a stage to draw must scroll to a
  beat first. A unit far from the viewport unmounts its view; on return it re-warms one frame later (poll).
- Scroll-scrubbed films follow the viewport CENTRE line (story mapping): a test must scroll the section from
  `top − vh/2` to `bottom − vh/2` to reach the last frame.
- Canva MCP needs OAuth (user must authorize in claude.ai connector settings). Blender MCP needs
  Blender running with the MCP add-on on localhost:9876 (was not running 2026-09-23).
  Higgsfield connected (995 credits at start) — spending credits needs the user's go-ahead.

## Open issues
- Opener placement DECIDED (user, 2026-09-27): Hopf film on the home page under "Where this is heading" (after
  the lecture list; lazy player, `level={3}`); the belt trick opens **L7 §7.2** (user confirmed 2026-09-27). Until L7 is built it is only on `#/dev/openers` and its 1.0 MB of frames
  ship unreferenced in `dist/openers/belt/`.
- Lecture 7 page 14 is missing from the PDF the user supplied (asked 2026-09-27).
- L4 plan: the 3×3 Gram–Schmidt homework (L4 p.5) is referenced but its sheet is not in `sources/`; no challenge is
  written for it until the user shares it (it would be hints-only anyway).
- `arcade/games.ts` ROT trains point at a placeholder unit `'rotations'` (L7): repoint to the L6/L7 unit ids when built.
- Bundle: the main chunk is 1.24 MB raw / 386 KB gzip after L5 (all lecture content is in it; three.js islands 909 KB
  separately). After L7, split lecture content per lecture (lazy `L{N}` modules behind a light metadata registry for the
  topbar, map, arcade, formulas and help pages) before the /lab work.
- Blocked on user: authorize Canva connector (formula cards). Higgsfield credits need the user's go-ahead.
- Course's own sources (Vavilov 2019 notes, Walker 2020 notes) are not public; public analogues:
  MIT 8.05 (Zwiebach) L3–6, Susskind TM lectures, 3B1B Essence of Linear Algebra ch. 9/13/14.

## KT points (handover for the next compaction)
1. Roles run in the main context (subagents stalled on classifier timeouts; user approved "You continue directly").
   Keep role discipline anyway: D look/spec, P claims + tests, S audit, W wiring; Claude judges with evidence.
2. Build before vitest (security tests read `dist/`). The commit gate is `gate.sh` in the session scratchpad (build,
   then vitest; exits 1 on any failure; a `;`/grep chain once let a failing commit through). Commands from `app/`:
   `npm run build`, `npx vitest run`, `PW_PREVIEW_PORT=5186 npx playwright test --project=preview`,
   `PW_DEV_PORT=5178 npx playwright test --project=dev` (run the two projects SEPARATELY; 5178 = the long-running dev
   server; reuseExistingServer picks it up).
3. Visual QA = throwaway `e2e/_qa-*.spec.ts` writing PNGs to the scratchpad + PIL contact sheets; delete before
   committing. Blender look-dev = exec the script in the MCP GUI with `ARGS` (low res), final renders headless.
4. Every learner-visible number comes from `app/src/physics/` with a test; Blender/opener frames state nothing —
   their DOM captions carry the claims (`openerCopy.test.ts`).
5. Opener pipeline: `node pipeline/blender/gen_opener_data.ts` → `sh pipeline/blender/render_openers.sh [hopf|belt]`
   (≈ 20–30 min each). Lab GLB: `Blender -b --factory-startup -P pipeline/blender/lab_assets.py`, then
   `npx vitest run src/stage/scenes/lab/hardware.test.ts`.
6. After code changes: `graphify update .` (check graph for `sources/`, `/Users/`, `node_modules`: must be 0).
7. Printed-page offsets: Axler PDF − 14, Townsend PDF − 16.
8. A lecture build = `skills/course-builder/references/lecture-checklist.md`. L2 is the worked example: engine
   helpers with numpy fixtures (`make_fixtures.py` `lecture2`), `L2.values.ts` + twins (`make_claim_fixtures.py`),
   story/review/lecture files, glossary + fidelity + concepts + Arcade (+ `games.test.ts` checks), register in
   `content/index.ts` and `content/values.ts`, add the route to `e2e/security.spec.ts` ROUTES and the id to
   `e2e/story.spec.ts` BUILT, update e2e counts (topbar units, fork, level totals), then visual QA and a P review.
9. Visual QA recipe: the story e2e writes one PNG per beat to `e2e/__screens__/<L>/` (git-ignored); PIL contact
   sheets per unit in the scratchpad; a throwaway spec clicks "Show me" on each clue for the reveal pictures.
10. Stage scenes available: lab-r3, hilbert-plane, bloch, bloch-ball, operator-space, hopf. DEV demo routes:
    `#/dev/lecture/demo`, `#/dev/lecture/demo-spaces`, `#/dev/openers`.

## Resume checklist
1. Read this file, then CLAUDE.md
2. `cd app && npx vitest run` (expect all green), `npm run dev`
3. Continue at "Next action"
