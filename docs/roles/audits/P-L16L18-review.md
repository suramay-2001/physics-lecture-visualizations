# P review: Physics 448 Lectures 16, 17 and 18 (independent truth review, LEAN)

Reviewer: P (separate pass, 2026-11-07). Read-only; no Playwright, no screenshots, no suites. Recomputed with my own scripts
(`scratchpad/rev_own.py`, `rev_own17.py`, `rev_own18*.py`: numpy/scipy, own FFT split-step with a 16384-point box, closed forms; never the repo engine or the planners' scripts).

## Verdicts
- **Lecture 16: FIX-FIRST** (1 blocking, B1: a false statement about what a widget shows, one-line fix; then PASS with the fixes: S1, S2, S8 and nits N5, N7, N8).
- **Lecture 17: PASS with fixes** (0 blocking; S3, S4, S5, S7, S8; nits N1-N5, N9).
- **Lecture 18: PASS with fixes** (0 blocking; S4, S6, S8; nits N5, N6). The Correction and every moved item are sound.

## Evidence
- Numbers: every keyed value of the three lectures was re-derived (state, units, sign), about 45 claim sentences per lecture. L16: Dx(t) 1.414 / 2.236 / 2.062 / 1.118, peak 0.399 / 0.282, products
  0.707 / 1.118, t(20) ratio 1.005, centres 6 / 7, spreading times 8.64e-17 s and 9.48e24 s (3.0e17 yr), chirp Dp 0.640, C -0.4, focus 0.976, minimum width 0.781, back at 1.951 (width 1, FFT-confirmed),
  Ehrenfest -2 / 1.5, quartic -1.75 against -1, spin -0.866, practice 4.319 fs and 7.481 fs. The closed form of Eq. 6.76 was re-derived through the exponent (A, B, prefactor (2 pi s^2)^(-1/4)).
  L17: mean 8 and width 1.414 (constant force), harmonic well 0 / 0.5 / -2 / 1 (simulated), two peaks 4.01 and 9.0025, Gaussian 5 and 4, ratio 2.005, sine 0.8825 / 0.875 / 0.6065 / 0.5, r 1/3, tau 4/3, 16/9,
  1.980, 0.961, currents 2 / 0.222 / 1.778, fringes 1.778 / 0.444 / 1.571, R + T, R2 / T2 / R3 / T3, E = 1.5 V0 (0.0718 / 0.9282), ramped block 0.09375 / 0.1935 / 2.0645 (also numerically), 9.25 and 1.0278.
  L18: areas 0.1482 / 0.8518 (run) and 0.1489 / 0.1230 / 0.1135 / 0.1117 (energy-weighted R), detector 0.2660 and exact peak 0.2565 (0.9645, by a numerical current), below-step R = 1, |1+r|^2 = 2, lengths 0.25 / 0.5 / 1.151,
  barrier T = 1/cosh^2 at ka = 1, 1/2, 2, 3 (0.4200, 0.7864, 0.07065, 0.009866), thick form 0.009915, packet T 0.41966 (simulated; the energy average is 0.41965), inner current 0.8399, Appendix A route re-derived,
  book electron 0.7061 / 0.7068 / 0.6072 / 1.188 / 0.5597 A, e^-2, 0.9979, 1.812 %, 8/9 above-barrier minimum, first resonance 2.221, field exponent 13.04 and T 2.17e-6. All agree to the shown digits.
- Twins: every `l16`, `l17`, `l18` key exists in `claims-448/l1{6,7,8}.json`; the moved keys agree with mine (fixture `l18TBookAT` 0.7061046, `l18TBookBohrT` 0.7068264, `l18BookWidthFor068` 0.55968).
- Practice (4 + 3 + 4): each re-solved from the lecture with my own script; all have full walkthroughs; T1 count (3 to 5) holds. Near-copies and spoilers are in the tables.
- Citations (30 anchors): Townsend page images read (PDF 216, 224, 225, 241, 243, 245, 246, 247, 248, 250, 254, 255, 259, 260): Eqs. 6.35-6.36 (p. 200), Ex. 6.3 (p. 208), Eqs. 6.73-6.77 and Ex. 6.4 (p. 209),
  Fig. 6.12 and the Shankar footnote (p. 225), Figs. 6.13-6.14 and Eqs. 6.118-6.122 (p. 227), Eqs. 6.131-6.140 (pp. 229-230, the substitution and the F, G, C naming), Eqs. 6.141-6.146 and the printed 0.68 (pp. 230-231),
  Ex. 6.7 and Fig. 6.16 (p. 232), Eq. 6.149 and Fig. 6.17 (p. 234), Problems 6.1, 6.4, 6.6, 6.22-6.25 (each description matches). Susskind Lecture 9 sections 9.3, 9.4, 9.6 and 9.7 exist with the cited content.
  The `pages:` span of all 11 units agrees with the notes' page markers (one nit below). All correct; no printed-page slip.
- Copyright: 5-word n-gram scan of every string in the three lectures against the three notes, the Townsend digest and the OCR text. Longest shared run is 6 words (common phrases) and 8 against my private digest's own wording
  of one Townsend remark (not the book's text). No verbatim paragraph. Sentence-by-sentence tracking is flagged in S-rows.
- Registry: no duplicate glossary id or term (301 entries); `ehrenfest-theorem`, `chirp` and the L17-L18 entries have a `first` that exists; the three 709 bridges (`sl-q24-decoupling`, `sl-q26-beamsplitter`, `sl-q27-josephson`) land on built units.
  Unit numbers quoted in the text (11.5, 11.6, 13.4, 14.5, 15.3, 15.6, 16.2, 16.3, 17.2, 17.3) were checked; one is stale (S5).

## Moves M1 and M2
- L13 notes units intact: l13-delta ... l13-time (13.1-13.7) present; `l13-flow` gone; L13 outcomes have no step or barrier line.
- Grep of `app/`, `e2e/`, `pipeline/`, `skills/` for `l13-flow`, `l13-pr-step`, `l13-pr-tunnel`, `qc-l13-flow`, `qc-l17-current` and the old `l13T...` / `l13Free...` / `l13Spread...` / `l13Ehrenfest...` keys: only comments and absence tests
  (`L13.test.ts:242-246`, `L16.test.ts:115`, `L18.test.ts:154-186`); no live reference. Nothing from the old unit was dropped: b1 is l18-below:b5, b2 is l18-tunnel:b5 with the Correction, b3 is l18-tunnel:b7, b4 is l18-tunnel:b6.
- Pointers in L13: `L13.story.ts:649` (Unit 15.1), `:692` (Lecture 16), `:699` (Units 14.5, 14.6, 15.4), `:771` (Lectures 17 and 18). Present and right.
- Nothing taught twice: not yet true, see S4 (L17/L18 repeat the E = 4V0/3 numbers three times) and N-rows (L13.story.ts:418, L15 preview).

## Extra checks
- (a) Correction (`L18.ts:30-37`): says the right thing. The page image (PDF 247) prints 0.68; I get kappa a = 0.60715, T = 0.70610 for 5 eV, 10 eV, 0.53 A, and 0.70683 for 0.529177 A; 0.68 needs 0.5597 A; the thick form gives 1.188.
  Both routes (the four matching conditions, the closed form) agree; the `check()` tests the claim (0.7061, 0.7068, and a gap above 0.02 from the printed value). Keys and twins resolve.
- (b) Optics Lab row `qc-l18-tunnel` is used twice. `O6.ts:96` (a centrifugal barrier's height) belongs on L18's tunnelling unit: right. `O4.ts:118` (Airy levels of a V-shaped well) says nothing about current or tunnelling and the unit teaches no
  bound-state levels: it should land on neither L17's current unit nor L18's tunnelling unit (see S6). Both links were loose from the start ("the probability-flow unit").
- (c) L13 teaches nothing L14-L18 own; one forward fact remains (N8).
- (d) `wavefunction` `potential`: the profile and energy line come from the engine's own array (`wavefunction.ts:88-103`); frames are cached at 0.5 and the remainder is evolved by the engine, never interpolated (`:62-79`); the reach check refuses a
  packet that could meet the periodic edge. L17/L18 stage states carry inputs only. Hand-typed constants: the points of TWO_PEAKS and RESTORING (`L17.story.ts:43-60`; values right).

## Blocking
| # | Where | Defect | Exact fix |
|---|---|---|---|
| B1 | `L16.ts:269` (l16-spread visual.tryThis[0]) | Says the faster hand has turned twice as far. With levels 3 and 1 the hands sit at 90 and 30 degrees at 30 degrees of time (three times as far); only the 60 degree gap is twice the slow turn (`dynamics.ts:68`, turned = arg - E t). | "The hands sit 60° apart: the faster one has turned 90° and the slower one 30°." |

## Should-fix
| # | Where | Defect | Exact fix |
|---|---|---|---|
| S1 | `L16.ts:104` (l16-start visual.tryThis[1]) | Describes two numbers z with a sum of two arrows. The `multiply` mode draws z, w and zw only (`ComplexPlane.tsx:101-105`). | Reword to the widget: "Drag w away from the real axis: zw turns and keeps the length of z. Different turns for different momenta are what change the interference in position." |
| S2 | `L16.ts:504-520` (l16-pr-spin) | Same system and start as the released spin problem (H = hbar w Z/2, |+x>); the answer is the derivative of that problem's result. Not a fresh problem. | Change the system: H = hbar w X/2, start |+z>, ask d<Z>/dt at wt = pi/4 (answer -0.7071 w, from [X,Z] = -2iY); re-key `l16PrSpinDXdt`, twin and walkthrough. |
| S3 | `L17.ts:511-520` (l17-pr-edge) and `L17.story.ts:328` | Practice inputs (plateau 10, ramp 1 then 1/2, ratio 2.065) are the Go-deeper beat's own, which prints the answer; it is also the released energy-cost problem's type. | Use plateau 8 and ramps 2 then 1 (ratio 2.154: (1/e)/(8+2e/3)); re-key `l17TrapRatio` for the practice, twin, walkthrough and hint (L = 8). |
| S4 | `L17.ts:164, 204-225` (l17-mf-var, l17-pr-mean); `L17.ts:394` and `L18.ts:239` (l17-cu-T, l18-de-T); `L18.story.ts:223-225` | The practice l17-pr-mean repeats l17-mf-var (F = x^2, packet at 3, sigma 1/2: 9.25 and 1.0278). l18-de-T repeats l17-cu-T (k2/k1 = 1/2, answer 8/9), and l18-detector:b6 re-teaches every number of l17-current:b6 after b5 said it defines nothing new. Its title says the force "weakens" (|F| grows). | l17-pr-mean: mu = 2, sigma 1/2 (1.0625), title "A restoring force that grows with distance". l18-de-T: k2/k1 = 1/3 (tau 1.5, T 0.75). Cut l18-detector:b6 to one sentence plus the density against share point. |
| S5 | `L17.story.ts:238` (l17-step:b2) | "(Unit 13.6)" for phi_E: Unit 13.6 now only points forward (`L13.story.ts:699`); phi_E is defined in Unit 14.5. | Write "(Unit 14.5)"; set the glossary `energy-eigenfunction` `first` (`glossary.ts:341`) to the L14 beat that defines it. |
| S6 | `O4.ts:118` (Optics Lab) | Link `<<qc-l18-tunnel|the tunnelling unit>>` after the Airy-level sentence; neither L17's nor L18's unit supports it (the paragraph above already links `qc-l14-box`). | Delete that link; keep `O6.ts:96` on `qc-l18-tunnel`. |
| S7 | `L17.story.ts:495` (l17-current:b7) | Overclaims: the mean force equals the force at the mean "for a localised packet, and not otherwise". It is exact only for a linear force; a narrow packet gives an approximation. | "…equals the force at the mean exactly for a linear force and approximately for a narrow packet in a slowly varying force." |
| S8 | `L16.story.ts:263` (l16-spread:b5), `:325` (l16-ehrenfest:b1); `L17.story.ts:289` (step:b4), `:347` (current:b1); `L18.story.ts:98` (packet:b3), `:337` (below:b3) | Each follows a boxed passage of the notes sentence by sentence in the same order with words swapped (no run over 6 words, so not verbatim). | Re-cut in the lecture's own order (open on the question or the number, merge the caveats into one sentence, drop the matching analogy sentences). |

## Nits
| # | Where | Defect | Exact fix |
|---|---|---|---|
| N1 | `L17.story.ts:95` (mean-force:b1) | "A quick check shows they can differ" does not follow: a fixed mean with a growing width shows that mean and width are separate, not that the forces differ. | "A quick check: a fixed mean position does not mean a fixed width, so the width may matter." |
| N2 | `L17.story.ts:328` (step:b8) | A jump in phi puts the derivative of a delta function in phi'', not a delta function. | "…the derivative of a delta function in $\\varphi''$…" |
| N3 | `L17.story.ts:102` (mean-force:b2) | Omega is never called the oscillator's angular frequency before "a well with Omega = 1" and "a quarter period". | Add "($\\Omega$ is the oscillator's angular frequency; the period is $2\\pi/\\Omega$)". |
| N4 | `L17.ts:94`; `L17.ts:112-113` | Unit 17.1 cites no L16 pages though b4 and b6 take their example and the variance form from L16 pp. 9-10. The amplitude-bars Try-it asks for values the widget cannot take. | Add "L16 pp. 9-10 (§16.6)" to `pages`; mark the second line as a thought exercise. |
| N5 | `L17.ts:21-22`; `L16.story.ts:206`; `L18.story.ts:98`; `L18.ts:474, 488` | Sentences of 26-31 words (outcomes, a caption, two refs, one prompt). | Split at the colon or semicolon. |
| N6 | `L18.story.ts:337`; `L18.values.ts` `l18PenetrationTime` | "Peaks at t = 4" is the largest of frames every half unit; a fine run peaks near 4.05 (0.1023). | "peaks near $t = 4$" and relax the claim to a tolerance of 0.5. |
| N7 | `L16.ts:304, 341, 293, 323`; `L16.ts:368` | l16-sp-sd, l16-sp-prod, l16-sp-peak and l16-sp-electron replay numbers the beats print (house pattern). l16-pr-double passes with the hint constants by 0.0017 of a 0.005 tolerance. | Vary one input per challenge (optional); widen the tolerance of l16-pr-double to 0.01. |
| N8 | `L13.story.ts:418` | Still states Dx Dp = 1.118 at t = 4 for the free packet, a result Unit 16.3 derives, with no pointer. | Append "(Unit 16.3 derives this)". |
| N9 | `L17.test.ts` (absent) | L14, L15, L16 and L18 each have a lecture test pinning units, beats and practice count; L17 has none. | Add one (3 units, 24 beats, 3 practice, 14 + 3 challenges). |

## Checked and right
Derivation steps of l16-evolve:b2, l16-spread:b2, l16-ehrenfest:b2 and :b3, l17-step:b3, l17-current:b2, :b4 and :b5, l18-below:b2, l18-tunnel:b2 and :b4 (each step true, each `why` fair, last step is the stated result).
The r versus tau and R versus T notation (M4) and the Rosetta lines are in place; `spreading-time` is reused, not redefined (M5). Beat order and phases obey the lints; sources are paraphrased and cited by section and page.
