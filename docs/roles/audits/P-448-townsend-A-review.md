# P-448-townsend-A review: Townsend pass, Lectures 1-4 and 9-10 (independent reviewer P)

Scope: `git diff 9df157d..HEAD` of `app/src/content/L{1,2,3,4,9,10}*`, rulings T1-T11, plans G1 and G3. Read-only; no suites, no Playwright, no screenshots.

## Verdicts

| Lecture | Verdict | Blocking | Should-fix | Nits |
|---|---|---|---|---|
| L1 | FIX-FIRST | 1 | 1 | 2 |
| L2 | FIX-FIRST | 1 | 2 | 0 |
| L3 | PASS with fixes | 0 | 1 | 3 |
| L4 | FIX-FIRST | 1 | 1 | 3 |
| L9 | PASS with fixes | 0 | 2 | 2 |
| L10 | PASS with fixes | 0 | 5 | 3 |

## Evidence
- Recomputed with a private numpy script (explicit kets, `eigvalsh`, tables by `itertools`, 64-plan search; no repo engine, no planner script): 80+ values
  (every `Tn`/`Pr` key of the six lectures, the Bell margin scan, both GHZ practice keys). All agree with the printed digits; the one wrong statement is B1 below.
- Page images read (printed p. = PDF - 16): 60+ pages, see the citation sample. Not re-read: PDF 182-186 (printed 166-170: Eqs. 5.62-5.69, Ex. 5.3, used by
  `l10-what-ghz-proves:b7c`); its values (each outcome 1/4, fidelity 1 after the turn, mixture = I/2) were recomputed and are right, the page/equation labels are unverified.
- Copyright (T11): 6-word overlap sweep of every new `text`/`why`/`caption`/`prompt`/walkthrough line against `sources/townsend/text.md`, `sources/L{1,2,3,4,9,10}/text.md`
  and Susskind ch. 1-4: zero sentence-level overlaps (two hits: a stock phrase in Susskind, and L10 against itself). Short 5-word runs are generic ("the bra and the ket"). PASS.
- Dangling ids: scripted check of every `lN-unit:bK` string in `app/src`, `app/e2e`, `pipeline`, `docs/context` against the beat ids of all lectures: two dangling (S-L10-1, N-L9-1). `app/dist` still has old ids (stale build, ignore).
- Practice counts (T1): L1 5, L2 4, L3 5, L4 4, L9 5, L10 5; all have a `practice` tag, three hints and a walkthrough. After B2 and B3 L2 and L4 drop to 3 (still inside 3-5).
- Experimental numbers (T4): none as digits (Aspect, 21 cm line, 242 sd all in words); every digit is a `V` key. Books-only units (T3): none were created, all new beats sit inside existing units. PASS.

## Blocking

| # | Where | Problem | Exact fix |
|---|---|---|---|
| B1 | `L1.story.ts:230` (`l1-sequential:b5b`), claim `l1TnExp3Down`; `L1.ts:212` formula board | Says "with the path recorded, a share 1/4 of the beam reads down". False. 1/4 is Experiment 3 with the -x path BLOCKED (`benchTheory` keep '+'). Recording the path with both beams kept gives 1/2 (ones + ones: 1/4 + 1/4), which is what `l3-spin-example:b5c` correctly calls "a recorded x result". The two lectures contradict. Townsend p. 8 says the 50/50 returns when either path is blocked. | Reword: "With the -x path blocked (Experiment 3), a share 1/4 of the beam reads down; recording the path and keeping both beams gives 1/2." Rename the claim sentence ("one path blocked: 1/4 of the beam reads down") and the board line to `P(-z \mid \text{one path blocked}) = ...`. Optionally add `l1TnExp3Both` = 0.5 (both beams recorded: `benchTheory` x then z, no keep) so the 1/2 is a keyed number. |
| B2 | `L2.ts:597` `l2-p-real` | Re-teaches HW2 Susskind Ex. 2.3 (planner label "H2-1c": real coefficients cannot give 50/50 in z and in x, "complex numbers are a necessity"; the homework-status row lists Ex. 2.3 as HW2). It also repeats the existing `l2-y-why-complex` (same answer, same walkthrough "c = +-1 gives |+-x>, 0 or 1"). Brief item 4. Its three claims `l2PRealPxMin/Max/Count` are sentence fragments ("a real state gives an x chance of 0 or" / "1, and nothing else"). | Delete the challenge and the three claims (and `l2PRealPx*` in `L2.values.ts`, `pipeline/claims_448/g1.py`, `__fixtures__/claims-448/g1.json`). Replace with a new core numeric not on the sheet, e.g. chance of +x for a state with a stated relative phase of 70 degrees measured along x (cos of half the gap), or the +y/-y chances for the column (1, e^{i 30 deg})/sqrt2; full walkthrough, new key. |
| B3 | `L4.ts:406` `l4-p-hermitian` | Re-teaches HW2 "real eigenvalues of a Hermitian matrix" (planner "H2-3"), and `l3-eig-real` is a hints-only assigned challenge in L3; `l4-basis:b6a` says that proof "is only named" here. The ordered five steps ARE the proof. The walkthrough is one "check" line, so it is not a full walkthrough (T1). | Delete it (and `l4PHerm*` keys, twin, fixture). Replace with a numeric not on the sheet: e.g. "A = [[3, 1+i],[1-i, 1]]: how far apart are its two eigenvalues?" (trace 4, determinant 1, so 2 +- sqrt3, gap 3.464), or the trace of a sum of two x-basis projectors; three hints, a full walkthrough. |

## Should-fix

| # | Where | Problem | Exact fix |
|---|---|---|---|
| S-L1-1 | `L1.ts:296` `l1-p-chain` | "What fraction of the first beam survives?" is ambiguous (beam leaving the oven, or beam leaving the first magnet). Answer 0.1033 is the second reading; the first gives 0.0517. | "...What fraction of the atoms that leave the first magnet survive the third?" |
| S-L2-1 | `L2.story.ts:228` (`b7c`) and `L2.ts` board line `|-x> -> e^{i\delta}...` | `\delta` is the unit's coordinate symbol (`\delta = <+x|psi>`, same unit board); b7c uses it for an overall phase. `e` is also moved to this beat (`L2.ts` symbols) although `l2-complex` (taught after this unit) teaches `e^{i\theta}`. | Rename the overall phase (`\varepsilon_0`, or "an overall phase factor") in b7c and the board line; add one Rosetta clause "his $\delta$ here is a phase, not the coordinate $\delta$"; keep `e` first at `l2-complex:b5` and point b7c at it in words. |
| S-L2-2 | `L2.story.ts:454` (`b7b`) | "Only a gap of a quarter turn gives 50/50, so the factor $i$ is forced": Eq. 1.28 allows +-pi/2 (p. 19 says so), so $\pm i$. | "...a gap of a quarter turn either way gives 50/50, so the factor is $\pm i$; the convention fixes $+i$." |
| S-L3-1 | `L3.story.ts:371` and `:609` | Captions still say "(the merged-beam device is not drawn)" and "(Our lab cannot draw the merged device.)". False now that `LabDevice.merge` ships (and `lab-merge-not-drawn` was removed from the fidelity list). | Use `xMerge` as the stage of `l3-spin-example:b5a`, drop the parentheses in both captions. |
| S-L4-1 | `L4.story.ts:131` (`l4-basis:b6b` text and ref) | Cites "p. 24, Eq. 1.38": p. 24 opens at Eq. 1.42; 1.38 is on p. 23. | Cite "Eqs. 1.42-1.46" (all on p. 24) or write "p. 23, Eq. 1.38; p. 24, Eqs. 1.42-1.46". |
| S-L9-1 | `L9.ts:790` `l9-pq-phase-x` walkthrough | Prints `\langle Z_A Z_B\rangle = 1`: operators on the pair are L10's (`l10-local`, T/plan ownership); L9 symbols gain `Z_A`, `Z_B` with no definition. | "Along $z$ the two readings always agree (chances 1/2, 0, 0, 1/2) whatever $\varphi$." Drop `l9PrQ4z`'s digit, keep as a claim of "both z readings agree" or remove `Z_A`, `Z_B` from `L9.ts` symbols. |
| S-L9-2 | `L9.story.ts:107` (`l9-tensor:b5b`) vs `:602`/`l9-two-spins:b5b` caption | `c_{ij}` is defined in unit 1, but the Rosetta "his $c_{ij}$ are our $\psi_{ab}$" sits in the caption of unit 3. | Move the clause to the `l9-tensor:b5b` caption ("our $\psi_{ab}$ in Unit 9.3"). |
| S-L10-1 | `glossary.ts:290` `locality` | `first: 'l10-instructions:b4'`; the beat is now `b4a`. Dangling. | `first: 'l10-instructions:b4a'`. |
| S-L10-2 | `L10.story.ts:640` (`b4c`) | "any mixture of tables gives opposite results at least 1/3 of the time" holds only when the two players pick different axes uniformly at random (Townsend p. 158: axes "at random"; p. 159 restricts to different axes). Not stated. | Add "when the players pick two different axes at random" before "So any mixture"; same for "Equal groups give 1/2". |
| S-L10-3 | `L10.story.ts:681` (`b4d`) | "the rule fails for every $\Theta$ below 90 degrees": at $\Theta = 0$ it holds with equality (margin 0; Townsend p. 162 and `L10.ts` board say $0<\Theta<90$). | "for every $\Theta$ between 0 and 90 degrees". |
| S-L10-4 | `L10.story.ts:632` (`b4b`) | "its answer to a z reading and to an x reading, never both at once" misstates the model: p. 157 gives the particle definite values of BOTH $S_z$ and $S_x$ and only forbids reading both. | "It holds an answer for a $z$ reading and one for an $x$ reading, though only one of them can be read." |
| S-L10-5 | `L10.story.ts:486` (`b5b`) text and ref | Cites "p. 149, Eqs. 5.26-5.27"; those equations are on p. 148 (p. 149 uses them for 2 hbar^2). Also "total spin squared is 2 ... and 0" lacks "in units of $\hbar^2$". | "pp. 148-149, Eqs. 5.26-5.27" and "in units of $\hbar^2$". |

## Nits

| # | Where | Note |
|---|---|---|
| N-L1-1 | `L1.ts` `l1-quantized:b5c` | "$g\approx2$" and the 107.87 u in `l1-p-gradient` are hand-typed constants with no `V` key (the number reader passes them; `M_SILVER` is in the engine). Optional. |
| N-L1-2 | `L1.story.ts:230` and four others | Citation-led opening sentences run 27-33 words by my count (`l1-sequential:b5b`, `l2-inner-product:b7c`, `l4-basis:b6b`, `l4-projectors:b5b`, `:b5c`); the repo cap test passes, so likely citations are exempt. Shorten if the cap is meant to include them. |
| N-L3-1 | `L3.story.ts` `l3-eigen:b6b` step 4 | View caption "the conjugate undoes the turn" shows only the single 45-degree turn (`RQ_IMG`); the picture does not draw $\hat R^\dagger\hat R$. Say "one turn: the arrow at 45 degrees" or drop the view. |
| N-L3-2 | `L3.story.ts` `l3-postulates:b6b` | Text promises "0.5 after a relative phase of 90 degrees"; the stage only sweeps the overall phase. Add a second hold or word it as a number only. |
| N-L3-3 | `L3.ts` `l3-p-bra` | Tagged `townsend` but cites equations, not a problem number (T1 asks for the problem number). Tag as is and cite "idea of Eq. 2.27, p. 35", or re-tag per T1. |
| N-L4-1 | `L4.story.ts:295` (`l4-projectors:b5b`) | Caption says "left ... right"; layout is `split` (top/bottom). |
| N-L4-2 | `L4.ts` `l4-p-proj` | Prompt already says "which is the chance that an $x$ magnet reads +", which is hint 2. Drop the clause from the prompt. |
| N-L4-3 | `L4.ts` `l4-p-phase` | Hint 3 states the eigenvalue $(1+i)/\sqrt2$, i.e. the answer's modulus and angle; acceptable for a last hint, but make it "its size is 1 and its real and imaginary parts are equal". |
| N-L9-1 | `L9.story.ts:11` | Header comment names `l9-singlet:b5`; now `b5a`. |
| N-L9-2 | `L9.story.ts:602` `l9-singlet:b5b` | "Townsend calls the three states that stay as they are the triplet": he defines triplet by total spin s = 1 (p. 182); exchange symmetry is a consequence. Say "the three states with total spin one, which a swap leaves unchanged". |
| N-L10-1 | `L10.story.ts` `TABLE_POINTS` | x = 1..8 "kind of pair" is not numbered on screen (1 and 8 are $+++$ and $---$); add marker labels or a caption clause. |
| N-L10-2 | `L9.ts` `l9-pq-phase-x`, `L10.ts` `l10-pq-phase-corr` | Same state $(|uu\rangle + e^{i\varphi}|dd\rangle)/\sqrt2$ in both (phi 70 and 50). Different observable, fine, but L9's second question ("does the phase show along z?") is not checked by the numeric answer. |
| N-L10-3 | `L10.ts` `l10-pq-biased-referee`, `l10-pq-stray-ghz` | Mirror HW6 types; only the typed HW2 sheet could be compared, so these two (and L1/L3 "H1-/H3-" mirrors) are judged by content: all prompts use new numbers and none matches a sheet I could read. |

## Per-lecture notes (Checked and right)
- L1: `l1-quantized:b5c` derivation (I = q/T, mu = IA = qL/2m, g, F_z) true step by step, SI note correct (p. 1 is Gaussian), mu_B = 9.274e-24 J/T recomputed; `l1-p-gradient` 14.89 T/m (mass cancels, 2kT energy as in Problem 1.1 p. 25) matches an independent derivation; `l1-average:b4b` sigma 5 and 500, z = 1 and 100 (exact scatter sqrt(N/4), p. 17 text confirmed); `l1-vectors:b5b` 0.906/0.821/0.179.
- L2: `l2-plus-y:b7b` derivation (Eqs. 1.23-1.28) every step true and the sweeping views agree (resultant 2|cos(Delta/2)|); 0.883/0.821/0.50 and 0.6710 correct; 7 and 1/3 (both orders) correct.
- L3: R_y(90) naive bra 0 vs adjoint 1; 40-degree naive length cos 40 = 0.7660; identity in the x basis, interference 1/2 + (-1/2) = 0, `l3-p-paths` 0.125 vs 0; surd 0.8727, 9/10, 0.18.
- L4: double-sum derivation with delta, projector derivation (lambda^2 = lambda), `l4-p-yprob` 0.8599, 0.8550, U unitary with eigenvalue angle 45.
- L9: Eqs. 5.3-5.4, 5.30-5.31, 5.37-5.39 verified as vector identities; swap spectrum (3 x +1, 1 x -1); 0.375, 6, 0.45/0.05, 0.3355.
- L10: [Sx, Sy] = i Sz, S_z values 1, 0, 0, -1, S^2 = 2 and 0; H matrix (A/2)(1, -1, 2, ...) = Eq. 5.14; tables 8, 6, 1/3, 1/2, singlet 1/4 = 1/12 below; Bell margin max 1/8 at 60, zero at 90; Ex. 5.1 sign slip confirmed on p. 156 (third amplitude printed negative, every chance fine; the caption note is true); 0.75, 0.0670, 0.8830 (cos^2 20), 5/6, 0.6428.

## Citation sample (verified on the page image; OK unless marked)
L1: p. 1 Eq. 1.1; p. 7 Fig. 1.4; pp. 8-9 Exp. 4, Figs. 1.5-1.6, "add amplitudes"; p. 17 sqrt(N) paragraph; pp. 10-13 Eqs. 1.5-1.15; p. 25 Problem 1.1; Problem 1.7 (text layer; cited chain is its (a)).
L2: p. 15 Eqs. 1.17-1.19; pp. 18-19 Eqs. 1.23-1.30; p. 25 Eq. 1.50; p. 30 Eqs. 2.3-2.11; p. 31 Eqs. 2.12-2.15, 2.17-2.18; p. 32 Eqs. 2.19-2.20; Problem 1.5 (text layer).
L3: pp. 34-35 Eqs. 2.25-2.28 and fn. 3; p. 42 Eq. 2.46-2.47a; p. 43 Eqs. 2.47b-2.50, fn. 7; p. 44 Fig. 2.5, Eqs. 2.51-2.53; p. 45 Eqs. 2.54-2.56, fn. 8; p. 46 Fig. 2.6, Eq. 2.57.
L4: p. 24 Eqs. 1.42-1.49 (Eq. 1.38 NOT on this page: S-L4-1); pp. 43-44 Eqs. 2.48, 2.51-2.53, Fig. 2.5; p. 46 Eq. 2.57.
L9: p. 141 Eqs. 5.1-5.3; p. 142 Eqs. 5.4-5.7; p. 143 Eqs. 5.8-5.9; p. 149 Eqs. 5.30-5.31; p. 151 Eqs. 5.37-5.39; p. 152 balls; p. 181 Eqs. 5.102-5.104; p. 182 Eqs. 5.105-5.107 and the exchange remark; p. 183 entanglement definition; Problem 5.26 (text layer).
L10: p. 142 Eq. 5.6; p. 143 Eq. 5.9; p. 145 Eqs. 5.14-5.18; p. 147 Eq. 5.24 (and the 1420 MHz sentence); p. 148 Eqs. 5.25-5.27 (b5b cites p. 149: S-L10-5); pp. 155-156 Ex. 5.1, Fig. 5.4; p. 157 Eq. 5.40; p. 158 Eq. 5.41; p. 159 Eqs. 5.42-5.47 and the "at least one third / one half" sentences; p. 160 Eqs. 5.48-5.49, Fig. 5.6; p. 161 Eqs. 5.50-5.57; p. 162 Eqs. 5.58-5.60; p. 164 Aspect / Kwiat results (words only in the app, OK); p. 171 Eq. 5.70; p. 179 Eqs. 5.87-5.94; p. 180 Eqs. 5.95-5.97; p. 181 Eqs. 5.99-5.101; Problems 5.8-5.10 (text layer).
Not verified: Eqs. 5.62-5.69 and Ex. 5.3 (pp. 166-171); Eq. 1.32/1.38 pages (22-23); pp. 36-39.

## Next
`07-chapter-fix` on B1-B3 first, then the should-fix list (every item is a one-line edit except the two replacement practice questions). Then rerun `UPDATE_META=1` twice, `claims.test.ts`, `L10.test.ts`, `L9.test.ts`, and the symbol tests.
