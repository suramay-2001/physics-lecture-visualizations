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
**State on 2026-09-28** (three worktree agents in flight; merge each when it reports: gate-main.sh → preview e2e on
`PW_PREVIEW_PORT=5196` and dev e2e on `PW_DEV_PORT=5178`, run separately → visual QA → `graphify update .`):
1. **709 pilots F1 and Q1: IN FLIGHT** (worktree agents; briefs `brief-709-F1.md` port 5194 and `brief-709-Q1.md` port 5195).
   Both were resumed after a session-limit stop. On each report:
   - merge, gate, both e2e, then contact sheets of every beat and reveal in BOTH tracks;
   - an independent P truth review per chapter, then the fix commit;
   - the two branches share append-only lists (`qc709/concepts.ts`, `bridges.ts`, the 709 fidelity registry,
     `arcade/games.ts`, the e2e route lists): resolve by keeping both sides.
2. **709 stage kinds batch 1: MERGED** (the SVG route, `complex-plane`, `amplitudes`, `circuit`, Q1's fields).
   - QA fix f644e48: print-figure labels.
   - Entry-closure headroom is about 1.6 KB gzip; watch it.
   - `gradientScale` ≤ 1.25.
   - `amplitudes` sources: `{dir}`, `{ket}`, `{bell}`, `{circuit, upTo}`.
3. **Lab:**
   - Grapher review fixes MERGED; `expr.answerMode.test.ts` freezes learner parsing.
   - SG bench and its review fixes MERGED (review `P-sg-review.md`; ruling: `l1-zxz` stays; `l3-four` is now z,z,x,x).
4. **Reading controls** (6dfc2d9): compact Story/Read and track toggles in the sticky rail. `flushReadingProbe()` reads
   the place at the moment of a switch. The header copies keep only the top, because reaching them scrolls there.
   This cured a real dev flake (see Hard-won).

DONE since the last update:
- **709 platform part B** (merge 2dd0da3; APIs for chapter builders are in `docs/roles/interface-changes.md`):
  - `Beat.formal` / `captionFormal`, `derivation {result, ground[], formal[]}`, `<<id|shown>>` bridges, `ReturnBar`,
    `PrintNotes` + `FigureFor`. hopf is still a placeholder figure.
  - Q0 specs are `@dev-only` (the demo chapter is DEV-only).
  - QA fix 6a08a81: unit questions typeset their TeX.
- the Operator Lab (merge de36cf5, all 16 review fixes); the Grapher bench (merge 5a5620b); the
QC engine core (merge 8890dfe); 709 platform part A (merge 2ebece8); the F1 and Q1 pilot plans, accepted with rulings in
`docs/roles/decisions/qc709-pilots.md`; the Motion Canvas film spike (`films/`, `pipeline/films/`).
THEN: the stage-kind batch `complex-plane` + `amplitudes` + `circuit` (SVG; they double as print figures) → build F1 and
Q1 as pilots with the two-track brief → QA both tracks → P review → plan and build the rest in batches. The Bloch-ball
bench and the "Under the hood" panel follow when a slot is free.
Lecture pipeline (kept for re-runs): worktree agent from the brief template → merge → gate → both e2e projects → contact
sheets + reveals (throwaway spec kept at scratchpad `_qa-reveal.spec.ts`, copy into `app/e2e/`, `QA_LECTURE=L{N}`) →
independent P review → fix commit. After a lecture change: `UPDATE_META=1 npx vitest run src/content/meta.test.ts`.

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
| L6 | Bloch point, equator phase, active turns, Sz generator, mixtures (beyond) | P-L6 (38 beats) | **done** (38 beats, 7 reveals) |
| L7 | two angles, full turn, order, compatible, spreads, uncertainty | P-L7 (44 beats) | **done** (44 beats, 11 reveals; pp. 1–13, page 14 missing) |

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
- 2026-09-27 **Lecture 6** (merge 2dbd170): gate 1904/1904; Playwright preview 39/39 + dev 40/40; visual QA 38 beats + 7
  reveals caught stage gaps no test could see: the Bloch-ball scene (built for L1) drew no magnet axis, no recipe and
  a pure comparison as a ring labelled "mixture", and cropped on portrait stages; a split stage stacked the lower view's
  readouts under the upper view's. Fixed in the scene/overlay (below). Independent P review FIX-FIRST (all 20 challenge
  answers re-derived correct) → 23 fixes: "P(+) along x is still 0.5" (false), a caption quoting ψ★'s angles over a
  sweep, det −1 read as a mirror, a warm-up whose key failed for |±z⟩, an Arcade round with two defensible errors,
  "only a mixture stays 50/50", ħ dropped in two formulas, refs over 25 words. Gate 1904/1904 after fixes.
- 2026-09-27 **Lecture 7** (merge a7efc32): gate 2126/2126; Playwright preview 41/41 + dev 41/41; visual QA 44 beats + 11
  reveals: operator-space sums printed the resultant's numbers unlabelled (λ = +3.5, −1.5 beside "B has eigenvalues 3
  and −1") → readouts now start "sum:". Independent P review FIX-FIRST (all 24 answers correct) → fixes: "a full turn
  returns minus the state … the state itself" (−|ψ⟩ IS the same state: say ket), the belt captions and gloss ("two
  turns leave none" is false), a catch-all `l7SpinHalf` claim that backed every ½ in four units (removed; "spin ½" is
  exempt in the number reader, the p± ½ is backed by p₊ at ⟨S⟩ = 0, the bound's ½ by a new `l7BoundSharp`), an Arcade
  round with a second wrong step, I + 4S_z → I + 4S_z/ħ, Reference A's unstated ΔA, ΔB ≠ 0, Reference B tags,
  citations (Townsend pp. 36–41; Susskind §5.4–5.7). Map intro no longer promises "in preparation" stations.
  Gate 2127/2127 after fixes; preview 41/41, dev 41/41.
- 2026-09-28 **Motion Canvas film spike** (merge d2e42b1; user approved the install): `films/` own package, exact pins
  (core/2d/vite-plugin 3.17.2, vite 8.3.1), overrides (plugin's vite peer; @xmldom/xmldom 0.9.12 for 13 advisories),
  `--ignore-scripts`, npm audit 0. f1-euler-limit: 120 frames 1080×1350 in ~1.3 s, 1.53 MB WebP (q80), three renders
  byte-identical, 651 manifest checks recomputed with the engine (self-test proves mutations fail).
- 2026-09-27 **G-lab gate PASSED** (lab foundation, merge a9b9b2b): entry chunk 870 KB unchanged; lab mount chunk 1.23 MB
  raw / 289 KB gzip + 21 lazy shader chunks (335 KB / 71 KB, GLSL/WGSL pairs, WebGL fetches the GLSL half); 0 CSP
  violations, 0 cross-origin requests, 0 tripwire trips on `#/lab`; contexts 2 on /lab after a lecture, 1 after
  leaving, 0 Babylon engines; lecture canvas 0 frames on /lab; frame p95 ≤ 3.0 ms (GUI ring linked to the bead), 1.0 ms
  static GUI; right-handed scene matches the r3f Bloch camera within 2e-8 view heights, R_z(+90°) lands on |+y⟩.
  Preview 50/50; dev 41 + the StrictMode lab test; vitest 2179.
- 2026-09-27 **Bundle split**: main chunk 1.45 MB raw / 448 KB gzip → 870 KB / 284 KB gzip; each lecture its own chunk
  (59–99 KB raw, 18–30 KB gzip). `content/meta.ts` + generated `meta.generated.ts` (21 KB) list lectures for the topbar,
  home, map, Arcade, fork and formula sheet; `content/load.ts` loads a lecture per page (cache; loading and retry
  states), the help page loads all. Chunk contract (d): no lecture module in the entry closure, no two lectures in one
  chunk. Two e2e tests read the lecture right after `goto` and silently SKIPPED once it loaded async: now they wait for
  the lecture head (skip count back to 16 on dev). Gate 2131/2131; preview 41/41, dev 41/41.
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

- Split stages: each slot now has its own readout column (`StageOverlay`: `.stage-readouts[data-slot="bottom"]` at the
  lower slot's top-right). One shared column made the lower view's ψ look like the upper view's (L6 QA).
- Bloch ball (`BlochBallScene`): draws `measure` (dashed axis, amber/cobalt ±n̂ dots, "P(+) along n̂" readout), `recipe`
  (ingredient dots + dashed chord, for the point AND the comparison: `ResolvedBall.compareRecipe`), a pure comparison
  as a filled silver dot labelled "pure state", shot `B-SECTION` (x–z plane face on), and backs the camera off on
  narrow stages (FIT 1.55). Labels: the comparison's goes radially outward; the state's chip moves inward when the
  comparison lies further out on the same ray. A new lecture that uses a scene field for the first time must get a
  screenshot check of that field: resolver support does not mean the scene draws it.

- Lectures load per page (`content/load.ts`): application code must import `content/meta` (the registry) or
  `content/load`, never `content/index` (the eager registry is for tests and DEV tools; importing it from app code puts
  all seven lectures back in the main chunk; chunk contract (d) fails if that happens). An e2e test that reads a
  lecture's DOM right after `goto` must first wait for `.lecture-head h1`, or a `test.skip(...)` guard skips silently.

- Lab (Babylon): import `engine.pure` with only the texture extensions needed (the `Engines/engine` entry drags in 8
  texture-loader chunks). A hidden r3f canvas in `frameloop='demand'` still draws on resize: `pauseStageHost` sets
  'never' on /lab. Babylon GUI's texture is device-resolution: scale sizes by DPR (the built-in
  `adjustToEngineHardwareScalingLevel` measured slower). Babylon arrives by an async import, so StrictMode's first
  effect is cancelled before any engine exists; the real fresh-canvas check is leave-and-return (`e2e/lab-dev.spec.ts`).
  Babylon's CDN strings stay in the bundle (base URLs point at a dead path; allowlisted with reasons in
  `cdn.security.test.ts`); the verbatim test skips GLSL/WGSL shader text (single-letter swizzles matched algebra).
- Worktree agents: make `app/node_modules` a real folder of per-package symlinks (a single symlink to the whole folder
  shares Vite and chunk-report caches with the main checkout). Remove the worktree with `rm -rf` of that folder (links
  only) and `rm` of the `sources` link first.

- Orchestrator vs agents: the scratchpad is SHARED with subagents, and an agent overwrote `gate.sh` to point at its own
  worktree (a "green" gate then tested the wrong tree). The main checkout's gate is `gate-main.sh` (agents must not edit
  it); check the path it `cd`s into when a result looks odd. Worktree agents run Playwright's preview project on port
  5186; the main checkout uses `PW_PREVIEW_PORT=5196` while an agent is running, or both runs lose their server.
- Page text contrast (both schemes) is tested from the tokens in `index.css` (`src/index.contrast.test.ts`). Amber is a
  FILL colour (`--up`, the + outcome); amber TEXT uses `--up-text` (#804f00 light, #f0a93a dark).

- Films (Motion Canvas, `films/README.md`): `cd films && npm ci --ignore-scripts`, then `node pipeline/films/render.ts`
  (starts Vite in-process, drives Motion Canvas's own Renderer in the installed Chrome), `sh pipeline/films/encode.sh`,
  `node pipeline/films/check_manifest.ts`. Vite 8 needed: explicit JSX config, core+2d pre-bundled together, the 2D
  inspector stubbed, geometry drawn as engine point lists (node sizes round to 1/64 px), and the clock runs one frame
  ahead (nominal 32 fps + a one-frame lead-in; the check compares planned vs actual start frames). Still to do: a film
  argument (render.ts is wired to f1-euler-limit), the app wiring (OpenerSpec `dir`, films.test.ts, captions in the
  course pack), and the label font (system Helvetica today).
- **709 platform B lessons (2026-09-28).**
  - **Scroll restores:** `restoreWhenSettled` gives up once anything else scrolls the page. Otherwise a scroll right
    after a track switch was pulled back.
  - **Print running head:** use `@page` margin boxes. A `position: fixed` head overlaps the content.
  - **No PDFs under `app/`:** a test forbids `*.pdf` there. Print tests call `page.pdf()` in memory only.
  - **Print media reuses screen transitions:** a print-media screenshot catches opacity mid-transition. Print rules
    that reveal something also set `transition: none`.
  - **Dev specs from a worktree:** a worktree can run `@dev-only` specs from a scratchpad Vite config with
    `server.fs.allow` widened to the main `node_modules`.

- **The place a swap keeps is read at the moment of the switch (2026-09-28).** The reading position used to be probed
  once per frame after a scroll. A control that scrolls when reached (the header toggles at the top of the page) then
  let a frame race decide between the reader's beat and the page top. It failed 5/12 at 6 workers. Any control that
  swaps the page calls `flushReadingProbe()` in its handler, and place-keeping tests use controls that are in reach
  (the rail copies).
- **Diagnose flakes by instrumenting, not guessing.** Record apply/stop events on `window`, and stress with
  `--repeat-each=12 --workers=6`. The first guess (scroll anchoring) was wrong.

## Open issues
- SG fix report: the floor's mesh has the same inside-out winding as the magnets had. It is invisible from above; making
  it visible adds a horizon edge (D's call). The Grapher's `gr-solid` mesh may share the fault: unchecked.
- Print: the `hopf` kind still prints a labelled placeholder figure.
- Leaving a 448 lecture in Read mode logs errors from the Bloch widget's r3f Canvas: a `removeChild` NotFoundError in
  production, and "synchronously unmount a root" in dev. This is pre-existing on main. The two Read-mode bridge tests
  ignore exactly these messages. A follow-up task was offered as a chip (platform B agent).
- Openers placed (user, 2026-09-27): Hopf film on the home page under "Where this is heading"; the belt trick opens
  `l7-full-turn` (Unit 7.2) via `Unit.opener`.
- Lecture 7 page 14 is missing from the PDF the user supplied (asked 2026-09-27); L7 is built from pp. 1–13.
- L4 plan: the 3×3 Gram–Schmidt homework (L4 p.5) is referenced but its sheet is not in `sources/`; no challenge is
  written for it until the user shares it (it would be hints-only anyway).
- Bundle: done (see Evidence). The main chunk still carries KaTeX, GSAP, the glossary and the 2D widgets (870 KB raw);
  further splitting is possible but not needed for the /lab.
- The "truly home" golf level (L7 plan) needs a sign target in `GamePage` and a move set that cannot undo in pairs; the
  plan's fallback spot-the-error round `arrow-back-ket-back` ships instead.
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
7. Printed-page offsets: Axler PDF − 14, Townsend PDF − 16. Bergou (709) is NOT constant: 15 in Ch. 1 drifting to 5
   (the e-book drops blank pages); use the per-chapter table in `docs/roles/proposals/P-709-map.md` (d)-E1.
   Nielsen & Chuang (709 companion, `sources/nc-full`, added by the user 2026-09-28): PDF − 28, constant.
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
