# P review: Physics 448 Lectures 14 and 15 (independent truth review, LEAN)

Reviewer: P (separate pass, 2026-11-07). Read-only; no Playwright, no screenshots, no suites. Recomputed with my own scripts
(`scratchpad/rev_own.py`, `rev_own15.py`: numpy/scipy, FFT split-step propagation, closed forms; never the repo engine or the planners' scripts).

## Verdicts
- **Lecture 14: PASS with fixes** (0 blocking, 5 should-fix, 5 nits).
- **Lecture 15: FIX-FIRST** (1 blocking: a false sentence in a derivation step, one-line fix; then PASS with the should-fixes below).

## Evidence
- Numbers: 46 L14 and 40 L15 displayed values and claim sentences re-derived (state, units, sign); all agree to the shown digits. L14: cells 0.341 / sum 1 /
  0.0125 / 0.399, |psi| peak 0.632, KE 4.625 = 4.5 + 0.125, <V> 2.5, omega 4.5, curvature 9, KE 0.125 -> 0.5, top hat cut at 2*pi*n gives 2n (8, 16), tent 0.375,
  box E (1.234, 0.308, 0.4 nm 2.350 eV, 0.55 nm 1.243 eV), slosh 0.375 / +-0.354 / 0.729 / 0.0214 / T = 6.79, phase 70.7 deg, 3 nodes, overlaps 8/3pi, 64/9pi^2,
  64/25pi^2, 400-level sum 1.0000, one wall to 2L 0.360, to 3L 0.128 (overlap 9/8pi), <E> 7.550, 12/pi, Dp = pi/L. L15: E 1.125, period 5.585, crests 0.75,
  phases -34.4 / -137.5 deg, FFT packet: Dp 0.5 at t = 0 and 6, width sqrt(10), peak ratio 0.316, centres 6 / 9 / -6, fringes pi and 3.0 (tracked), near pair
  15.7 / 3.0 / 1.507, 45 pair 4.5 / 2.278, t_spread 1.28 / 0.32, growth sqrt(2), electron 1.455 and 0.727 (1e6 m/s), T = 8.638 fs, boost centre 7.
- Practice (5 + 3): each re-solved from the lecture with my own script; all walkthroughs complete; none is an HW6 or HW7 problem as posed (see S2 for one near-copy).
- Citations (36): Townsend eq. and page anchors 6.33 (p. 199), 6.58 (204), 6.67/6.72, 6.73-6.77 and Ex. 6.4 (208-209), 6.78-6.86 (213-214), 6.96-6.98 (216-218),
  6.99-6.110 and Ex. 6.6 (219-224), 6.150-6.155 (234-235), 6.168 (236) checked on OCR; Problems 6.4, 6.6, 6.11, 6.13, 6.15, 6.16, 6.18 read on page images (PDF 255-258),
  each description matches; Susskind ch. 9 sections 9.1-9.4; every `pages:` span of the 12 units against the notes' page markers. All correct. No printed-page slip.
- Copyright: 5-word n-gram scan of all L14/L15 strings against the notes, Townsend and Susskind: longest shared run is 6 words except the lecture title (8) and the
  term "time-independent Schrodinger equation" (7). No verbatim paragraph. Sentence-order tracking is flagged in S6.
- Registry: no duplicate glossary id or term (291 entries; 11 new, every `uses`/`first` exists); both bridges (`sl-q24-rabi`, `sl-q3-uncertainty`) land on built units
  (q24-rabi, q3-uncertainty); `qc-l14-box` row present; all prerequisite and `needs` concept ids exist; two-clocks and amplitude-bars Try-it lines match the widgets'
  controls (time slider 1 deg steps, Ebar and hbar-omega sliders, start |+x>/|+z>, theta slider; readout "gap: one clock only" exists).

## Moves M1 and M2
- L13 notes units intact: l13-delta ... l13-time (13.1-13.7) plus l13-flow all present; box unit gone; e2e count 94 holds (`e2e/nav.spec.ts:19`).
- Dangling references to `l13-stationary`, `l13TBox*`, `l13Fringe*`, `l13FreeMean2`, `qc-l13-stationary`, `l13PrE1Ev`, `l13PrWall3`, `l13-sc-mean`, `l13-ee-*`: none in `app/`,
  `pipeline/`, `e2e/`, `skills/` (only comments and the absence tests at `L14.test.ts:199-203`, `L15.test.ts:114`).
- Pointers in L13: `L13.story.ts:656` (b3 -> Unit 15.1), `:739` (b8 -> Units 15.4, 14.5, 14.6). Present and correct. Moved material is complete in its new home
  (stationary + box in L14, fringes + free-centre in L15).
- Nothing taught twice: **not yet true**, see S1 and Q1. Also pending L16: `l13-schrodinger:b6/b7` (free Gaussian width, Ex. 6.4) still sit in L13 and are echoed by
  `l15-gaussian:b4/b6` and `l15-pr-spread`; M2 hands them to L16, so this clears when L16 lands (L15 already points forward).

## Blocking
| # | Where | Defect | Exact fix |
|---|---|---|---|
| B1 | `app/src/content/L15.story.ts:281` (l15-group-velocity:b2, derivation step 3, `why`) | Says the cosine "does not change sign with its argument, so it is a slow envelope". False (a cosine changes sign) and a non sequitur; the envelope is slow because its argument holds only the small differences Dk and Dw, against the carrier's k0 and wbar. | Replace the second sentence with: "Its argument holds only the small differences $\\Delta k$ and $\\Delta\\omega$, so it varies slowly compared with the carrier." |

## Should-fix
| # | Where | Defect | Exact fix |
|---|---|---|---|
| S1 | `L14.story.ts:195` (dispersion:b2), `:304` (time:b3), `:330-337` (stationary:b1-b2) vs `L13.story.ts:661` (l13-schrodinger:b4), l13-time:b3-b4, `L13.story.ts:739` (b8) | Taught twice. b2 re-derives the same plane-wave derivation (same four steps, same `PL(2)` stage); time:b3 restates the energy-shift argument and the lowest-energy point; stationary:b1-b2 repeat b8's projection. M1 says L14 owns only what its notes add. | Make dispersion:b2 a link-back to Unit 13.6 plus the new reverse framing (match omega(k)); cut time:b3 to one recap sentence, then the clock gap and the new caveats; leave stationary (core in the notes) and trim L13 b8 to its pointer. Or decide Q1 first. |
| S2 | `app/src/content/L14.ts:350` and `:342-358` (l14-di-tophat), `:360` (l14-pr-kinetic) | The option `why` gives the tent's closed form (3/2mL^2) one challenge before l14-pr-kinetic asks for it (leaks the practice answer). l14-di-tophat is the HW7 top-hat problem re-posed (same L = 1 top hat), is not labelled `practice`, and the lecture never teaches <p^2> = hbar^2 * integral |psi'|^2 (only the hints do). | Option text: "The slope jumps but stays finite, so the energy is finite." Add `practice: 'homework'` to l14-di-tophat, change the shape (a one-sided step), and state <p^2> = hbar^2 * integral |psi'|^2 dx in one sentence of l14-dispersion:b4. |
| S3 | `L14.story.ts:306` (time:b3), `L14.ts:443` | epsilon means the arbitrary energy shift in W H W† = H + epsilon and, in the same beat, the clocks' energy unit (3 epsilon, epsilon). L13 had a warning sentence; L14 dropped it. | Add after the clock sentence: "(here $\\epsilon$ is the clocks' energy unit, not the shift above)"; same note in the l14-ti-gap prompt. |
| S4 | `L14.story.ts:99, :332, :374, :385`; `L15.story.ts:163, :208, :365` | hbar = m = 1 is stated only at `L14.story.ts:184` and `L15.story.ts:104`; other beats print bare energies and times (4.625, 1.234, 0.308, 1.2, 0.5) the learner cannot reproduce. | Add "(with $\\hbar = m = 1$)" to the first numeric beat of each unit: l14-schrodinger:b1, l14-stationary:b1, l15-packet-evolution:b2, l15-dispersion:b1. |
| S5 | `L14.story.ts:62` (components:b2), `:99` (schrodinger:b1), `L14.ts:234` | "the unit packet" and ell are used before sigma = 1 ell is stated (first in b3); the symbols map points sigma and ell at b2, which contains neither. Delta p is defined only in a hint (`L14.ts:234`) yet beats use it (`L14.story.ts:238`). | b2: "for the packet with $\\sigma = 1\\,\\ell$ (the unit packet)". schrodinger:b1: add "$\\Delta p = \\hbar/2\\sigma = 0.5$" before the 0.125. |
| S6 | `L15.story.ts:413` (dispersion:b4), `L14.story.ts:306` (tail of time:b3) | Each tracks a boxed passage of the notes (p. 9; p. 10) sentence by sentence in the same order with the words swapped (no run over 6 words, so not verbatim). | Re-cut in the lecture's own order (e.g. open with the "can it keep its width?" question, then the two caveats merged into one sentence). |

## Nits
| # | Where | Defect | Exact fix |
|---|---|---|---|
| N1 | `L14.ts:124, :400, :481, :638`; `L14.story.ts:343, :509`; `L15.ts:572`; `L15.story.ts:125` | Sentences of 26-29 words outside the surfaces `symbols.test.ts` holds (Try-it, `refs.adds`, walkthrough; the beat at `L15.story.ts:125` passes only because the counter splits at "Eq."). | Split at the colon or semicolon. |
| N2 | `L14.story.ts:259` | "falls apart" overstates; the packet spreads and keeps its norm. | "so a free packet travels and spreads". |
| N3 | `L14.ts:482, :597`; `L15.ts:114, :188` | Try-it says "the equal mix"; the widget's control reads |+x>. | "Set the starting state to |+x>, the equal mix." |
| N4 | `L15.review.ts:12` | The card types "6" and "3" by hand (hard rule: every number from the engine). | Use `${d(V.l15FreeMean2, 0)}` and carry the claim `l15FreeMean2`. |
| N5 | `L15.ts:653-654` | Hint gives hbar = 1.055e-34 J s, which yields 8.634 fs; the answer 8.638 passes at tolerance 0.005 by a 0.0015 margin only. | Give hbar = 1.0546e-34. |
| N6 | `L15.ts:152, :431, :450`; `L14.ts:153, :229, :246, :512` | Core and warm-up challenges replay the beat's displayed numbers (house pattern from L13; the answer is on screen above). | Optional: vary one input per challenge (p = 3, 7: spacing pi/2, speed 5; p0 = 2.5, t = 4: 10) with a claim each. |

## Fidelity and framing (checked, no defect)
- Order and sections follow the notes in both lectures (14.1-14.6, 15.1-15.7); each notes concept in the overview lists is taught. Omitted on purpose and recorded in the plan:
  the optional p_t = -i hbar d/dt aside (R5), the optional group-velocity box (moved to L15). Not omitted by accident: the notes' recap of x-hat and p-hat is the L14 consolidation beat.
- Derivations: every `why` other than B1 is a fair reason; both last steps end on the stated result. Choice options, hints and walkthroughs read true on a full read.
- Overclaims: none beyond N2. Scope caveats of the notes (one spinless particle; Pauli excludes only an unrestricted conjugate operator; one-way idealised
  linear dispersion; chirped packets can first narrow) are all kept.
- Books-only unit `l14-box` opens with the required lede (T3) and sits after the lecture units; T1 counts: L14 five practice, L15 three; refs problem numbers correct.
- Unit cross-references (Units 11.5, 12.1, 12.3, 12.7, 13.4, 13.6, 13.7, 14.2, 14.3, 14.5, 15.1, 15.4) all land on the intended unit by registry order.

## Questions for the judge
- **Q1 (edition of L13).** `sources/L14/text.md` p. 2 says the lecture picks up exactly where the old section 13.7 began, which reads as the owner having re-cut Lecture 13 to end at
  13.6. `sources/L13/text.md` is the 15 October copy (12 pages, still has 13.7-13.10), and M1 took it as current. If the current Lecture_13.pdf ends at 13.6, then
  l13-schrodinger (b4-b8) and l13-time have no notes behind them and S1 resolves by retiring them in favour of L14. Please confirm with the owner before the S1 fix.
