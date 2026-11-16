# P review: 448 Lectures 19 and 20, with the L14 to L20 infinite-well move (main at bd1380b, 2026-11-16)

**Verdict: FIX-FIRST.** Every displayed number, every answer key and every tolerance is right. The physics of every beat is right. One blocking item: Lecture 14 still promises an outcome that it no longer teaches. Six should-fix items and a short list of nits follow. All are wording, caption, citation or bookkeeping; none changes a number.

## Evidence

- Independent numpy script (does not import the repo engine): a throwaway script `review_l19l20.py` (with `kin.py` and `l20_check.py`) kept in the reviewer's scratchpad, not in the repo. Routes: the L19 barrier by a 4 x 4 `np.linalg.solve` of the four matching conditions; the finite well by `brentq` on the even and odd conditions; tails, boxes and trial functions by `scipy.integrate.quad`; the alpha exponent by `quad` of the Coulomb integrand.
- About 110 values recomputed: all of the 56 `l19` and 85 `l20` keys that a learner reads, every challenge and practice answer, and every tolerance. All agree with the engine and with the committed twins (`claims-448/l19.json`, `l20.json`: key sets equal to the `V` objects, 56 and 85) to the displayed digits. Two samples: L19 `l19PrWidth` 2.91125 (mine 2.91125), L20 `l20PrE1` 0.69576 eV (mine 0.69576).
- Physics re-derived from the notes: the three regional solutions, the four conditions, Steps 1 to 3 of the elimination and the D2 algebra (L19 notes pp. 3 to 8); the even and odd conditions, the parity argument, the infinite-wall caveat and the infinite-wall limit (L20 notes pp. 3 to 8, 12). Signs, factors of 2, the E to V0 limit (T tends to 1 over 1 + k²a²/4 = 0.5000 for ka = 2), parity, the wall condition and "finite level below its infinite twin" (ratios 0.636, 0.620, 0.582, and 0.789 to 0.969 as V0 rises to 2048) all hold.
- Citations checked on page images: Townsend pp. 217 (Fig. 6.9), 229 (Eq. 6.135), 242 and 243 (Problems 6.16 to 6.19, 6.21, 6.23), plus the digest for Eqs. 6.86 to 6.110, 6.142 to 6.146 and Ex. 6.6. Problem numbers and pages are right in every ref. The practice questions differ from the book problems (3L against 2L; a cubic against x(x - L); 0.55 nm against one ångström; numeric g against the symbolic strength).
- 7-word overlap of every string in `L19*.ts` and `L20*.ts` against both notes, Townsend `text.md` and the digest: 0 prose hits. The only 7-gram hit is a LaTeX `pmatrix` (L20.story.ts:220). 6-gram hits are generic phrases.
- Move check: no dangling `l14-box`, `l14TBox*` (but `l14TBoxNodes4`, kept on purpose), `l14TWall2P1`, `l14PrE1Ev`, `l14PrWall3`, `l14-pr-box-energy`, `l14-pr-wall` or `qc-l14-box` in `app/`, `pipeline/`, `docs/context/` or `skills/`. `qc-l20-box` resolves to `l20-infinite` (Q27 says Unit 20.2: correct). `Unit 14.5` in L13, L15, L17 and L20 is `l14-stationary`: correct after the move. The glossary `infinite-well` first use is `l20-infinite:b1`. Concept stations exist for all ten units. L13:699 and L14:410 point to Lecture 20. Nav count 113 = 104 - 1 + 5 + 5.
- Stage scenes: all `barrierWave` scenes have 0 < E < V0 <= 8 and a in [0.5, 1] (the E to V0 scene is E = 1.998, V0 = 2, a = 1); all `well` scenes are V0 = 8, a = 2, n = 1 to 3 (three levels). In range. The `wavefunction-well-eigen` fidelity text already says the window may clip tails.
- Not run (the Playwright run owns `app/`): contact sheets and console check. This review is source-and-numbers only.

## Blocking

**S1. Lecture 14 still lists the infinite-well outcome that moved to Lecture 20.** `app/src/content/L14.ts:27` says the learner will "Solve the energy equation between two walls and say why only whole numbers of half-waves fit." After ruling R2 the only box content left in L14 is `l14-stationary:b6`, which points to Lecture 20 and teaches no solution; Lecture 20 now holds the derivation (`l20-infinite:b2`). The L14 outcomes list is shown to learners, so it states something L14 does not deliver. L14 practice questions (`l14-pr-period`, `l14-pr-mean-energy`, L14.ts:543, 559) give the box energies in a hint, which is fine.
Fix: delete that bullet from `L14.ts` outcomes (L14 then has six), or reword it to "Say that a particle held between walls has quantised energies (solved in Lecture 20)". Update `L14.test.ts` if it counts outcomes.

## Should-fix

**N1. The reason given for "every finite level stays under its twin" is garbled.** `app/src/content/L20.story.ts:472` (`l20-compare:b2`): "The cotangent grows from below, which is why every finite level stays under its twin." The true reason covers both conditions: tan(ka/2) and -cot(ka/2) become large and positive only as ka/2 approaches an odd multiple of pi/2, or a multiple of pi, from below. So k stays under n pi / a for every level, even and odd. Checked: the level-1 even root is 1.2524 against pi/2 = 1.5708 at V0 = 8.
Fix: replace the sentence with "Both conditions need ka/2 to approach the pole from below, so k stays under n pi / a and every finite level lies under its twin."

**N2. Caption does not match the stage of `l20-finite:b9`.** `L20.story.ts:434`: the caption says "each new level is born as the well deepens", but the stage is `MATCH_EVEN()`, the even mismatch for one fixed well (V0 = 8, a = 2) against E/V0. It shows two zeros, not a well deepening.
Fix: caption "the even mismatch for the well with V0 = 8: its zeros are the two even levels; a deeper well would add more zeros", or draw the thresholds with a points plot like `RATIO_DEPTH`.

**N3. The STM numbers cannot be reproduced from the prose.** `app/src/content/L19.story.ts:401` (`l19-energy:b2`): "a gap one ångström wider cuts the current by the factor 0.1288. The thick form gives 0.1288, the same to four digits." The exact factor depends on the electron energy and the starting gap; the values file uses E = 4 eV, V0 = 8 eV and a gap going from 5 Å to 6 Å (my numbers: exact 0.128837, thick 0.128829), but the prose names none of them. A learner who computes from "4 eV below the top" gets the thick form only, and for other gaps the "four digits" claim fails (a 1 Å to 2 Å gap gives 0.1588 exact against 0.1288 thick).
Fix: add "for a gap that grows from 5 Å to 6 Å, with the electron 4 eV below the top and 8 eV down from the vacuum level" or drop the exact value and keep only the thick form.

**N4. The alpha-decay model does not state its mass, and its picture is a different barrier.** `L19.story.ts:414` (`l19-energy:b3`) and its stage `BARRIER_THICK(3)`. My exponents: 97.357 and 52.344 (alpha mass 3727.4 MeV) agree with the engine, but with the reduced mass of alpha plus a 234-nucleon daughter they are 96.54 and 51.90, so the "19.5 decades" would read 19.4. The prose says only "a point alpha particle", so the 97.4 cannot be reproduced. The picture beside it is the rectangular E = V0/2 curve, which the caption does not mark as a stand-in.
Fix: say "the alpha's own mass, 3727 MeV, and no recoil correction", and caption the stage "a stand-in: a rectangular barrier, not the Coulomb one".

**N5. Townsend page range in `l19-recap` is short.** `app/src/content/L19.ts:86`: "§6.10, pp. 225–228 (Eqs. 6.111–6.135)". Eq. 6.135 (the step R and T) is on p. 229 (page image p245), and §6.10 begins on p. 224. Fix: "pp. 224–229".

**N6. R1: L19 restates content that L18 keeps.** `L19.story.ts:299` (`l19-thick:b2`) re-derives the thick form (e^{κa} - e^{-κa} tends to e^{κa}) and re-quotes the κa = 3 pair 0.00987/0.00992; `L19.story.ts:344` (`l19-thick:b5`) repeats L18's "as a to 0 the thick form tends to 4" (L18.story.ts, `l18-tunnel:b3`, key `l18ThickAtZero`). Both use the L18 keys, which is correct, and the notes do ask for the thick form (L19 p. 8), so this is the judge's call rather than an error. If R1 is to be read strictly: shorten b2 to "Unit 18.4's thick form T ≈ 16 E(V0 - E)/V0² e^{-2κa}; here we read it" and keep the new ratios (0.964, 0.995). `l19-thick:b1` D2 is the notes' own algebra from the D1 amplitude and is fine to keep.

## Nits

1. Sentence cap (25 words, Ground-up): `L19.ts:295` (32 words, Try-it), `L19.ts:478` (26 words), `L20.ts:380` (28 words). Split each at its colon or comma.
2. Stale comments in `L19.values.ts:112–113`: "2.0200" and "2.0803" should read 2.0313 and 2.1249 (the claims and my numbers use the latter). The values themselves are right.
3. `L20.story.ts:251` (`l20-infinite:b7`) opens with "A wall that moves away" but both walls move (as in Townsend's Ex. 6.6). Also "the even levels get 0 ... the odd levels share the rest" means the parity of n, while "even state" elsewhere in the lecture means parity of the function. Say "levels with even n" and "levels with odd n".
4. `L20.story.ts:221` and `:227`: the matrix and the determinant are cited as Eqs. 6.101–6.102 and 6.103–6.105, but those are Townsend's centred-box forms (`sin(ka/2)` entries). The lecture's matrix is the wall-at-zero form of Problem 6.13. Say "the analogue of".
5. `L20.ts:307` (`l20-pr-wall` walkthrough) prints the answer to Townsend Problem 6.16(a), 0.360. Fine as a method check, but it solves an assigned-style book problem; drop the number or keep only "the same steps give the book's case".
6. `L19.review.ts:33` says the current is the same "on all three sides"; say "in all three regions".
7. `L19.story.ts:443` (`l19-energy:b5`): "The two parts together return the starting value" holds only when each part is weighted by its share (0.4196 and 0.5804). Say so.
8. `L20.story.ts:400` (`l20-finite:b7`): the stage is level 3 in a window of -3 to 3 and the caption says its tail is the longest; the window clips that tail (about 2.7 percent of the peak height at the edge). Add "(the window clips it)".
9. `L19.ts:280`: pages "pp. 6–9" would be "pp. 6–8, p. 9" (p. 9 only supplies the clue questions).
10. `l20-pr-kink` is tagged `practice: 'homework'` and `l20-pr-kink`'s tent function repeats `l14-pr-kinetic`'s tent (L14.ts:363) in a new quantity (mean energy in a box); acceptable, noted for the judge.

## Checked and right (no action)

- Elimination algebra in `l19-match:b2–b3` and D2 in `l19-thick:b1`: each step true; the last step ends on the stated result; `why` lines are fair. D1 for k = κ gives tau = e^{-ika}/cosh κa; arg tau = -57.296 degrees at ka = 1 (engine 57.29578).
- Challenge keys with tolerances: all pass at the stated tolerance, none is spoiled by its hints. Hint arithmetic checked (cosh 1.5 = 2.352 and its square 5.53; sinh κa = 9.85; κa = 2.98; k tan k = 3.799).
- The E to V0 caution, the alpha exponent (up to the mass choice in N4), the macroscopic κa = 1.3410 × 10²⁷ CGS, the delta barrier (0.6400; 0.6200, 0.6377, 0.6398 for widths 0.1, 0.01, 0.001), and the beyond-the-notes packet energies (2.03125, 2.12488, 1.96355).
- L20: the infinite-well derivation and the 8/(3 pi) overlap; the even and odd conditions; parity argument; the thresholds (n - 1)² pi² / 2a²; sloshing (period 15.279, swing 1.0808); the Gaussian estimate 0.5; the oscillator algebra [X, P] = i and a†a = (X² + P² - 1)/2.
- Shared L18 keys are cited by their L18 names (`l18BarrierT1`, `l18BarrierT2`, `l18BarrierT3`, `l18BarrierThick3`, `l18BarrierInnerCurrent`, `l18TEV0T`, `l18ThickAtZero`, `l18MaxPenetration`, `l18BarrierWeightedT`); `l19L18Route` is a cross-check, not a re-key.
- `sl-q27-josephson` is a second use from `l19-energy:b2`; no new bridge rows.
