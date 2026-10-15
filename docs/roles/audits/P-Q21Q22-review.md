# P truth review (lean): 709 Q21 "Protecting qubits from noise" and Q22 "Stabilizers, CSS codes and Gottesman–Knill"

Reviewer P, 2026-10-15, read-only on main. Paths are under `app/src/content/qc709/` unless stated. Sources read as page images: Bergou PDF pp. 169–172, 181, 183–184, 190, 192, 194 (printed 161–164, 173, 175–176, 182, 184, 186); N&C text for every cited page and figure.

## Verdicts
- **Q21: FIX-FIRST** (1 blocking, a one-word fix in a Try-it line; 3 should-fix; 3 nits). Physics, numbers and Corrections are right.
- **Q22: PASS with fixes** (0 blocking; 7 should-fix; 5 nit rows). All 4 Corrections confirmed; E1 needs rewording.

## Evidence
- 7/7 Correction boxes checked against the page image, each "our calculation finds" recomputed in `scratchpad/corr.py` (numpy, no repo code): table below.
- Every prose sentence of both chapters read against its value (Q21 109 `claim()`s, Q22 77). About 35 (Q21) and 40 (Q22) values recomputed by throwaway python/itertools: repetition counts, all challenge answers, Shor syndromes (22 distinct, 27 of 36), K-L matrix, quantum Hamming numbers, DFS 0.48/0.24/0.12/0.36/0.416; [6,2] code, Hamming and dual weights, distances of Steane, five-qubit, Shor and bit-flip codes, failures by weight 0,0,21,7,28,0,7,1, P_L at 0.01/0.05/0.1, p*, 28 of 35, 24 Cliffords, TXT†, tableau bits, 2^50, 2^100. No displayed number is wrong.
- Lints: `symbols.test.ts -t Q21|Q22` 24 passed (one file only). Own scan of text, formal, captions and every derivation `why`: 0 sentences over 25 (Ground) or 40 (Formal). No duplicate glossary id or term (665 ids scanned, none involve Q21/Q22); every `[[tag]]`, `<<bridge>>` and station `needs` id resolves.
- Not done by instruction: Playwright, screenshots, return-bar (`ret`) follow-through (bridges checked by registry target only).

## Corrections (page = printed Bergou page; PDF = printed + 8)
| # | Box | What the page prints (checked) | Our calculation (recomputed) | Verdict |
|---|---|---|---|---|
| 1 | Q21 p. 163, fix for qubit 2 | after "−1 and −1 for both", text says "Having obtained 1 for both measurements, we apply X2"; p. 162 (Table 9.1, example) has it right | flip of qubit 2 gives Z1Z2 = Z2Z3 = −1 (helpers 11); none gives 00 | CONFIRMED |
| 2 | Q21 p. 164, Shor group 1 | first cluster "first gives 1 and the second −1", third cluster the identical pair | Z in groups 1, 2, 3 gives (−1,+1), (−1,−1), (+1,−1) for X1…X6, X4…X9 | CONFIRMED |
| 3 | Q21 p. 176, Eq. 9.56 | last term printed `ab*z*|0⟩⟨0|` | true term is |0⟩⟨1|; printed trace 1 + ab*z* = 1.24 at a=.6, b=.8, z=.5 | CONFIRMED |
| 4 | Q22 p. 173 | "d1 > 2tf + 1 and d2⊥ > 2tp + 1", "weight less than tf" | Steane d = 3, t = 1: 3 > 3 false, 3 ≥ 3 true; 21 of 21 one-qubit errors fixed | CONFIRMED, wording (S8) |
| 5 | Q22 p. 175, dual distance | after the [7,3] dual: "This code also has a distance of 3" | all 7 nonzero dual words weigh 4; Hamming d = 3 | CONFIRMED (nearest antecedent is the dual) |
| 6 | Q22 p. 182, Eq. 10.9 | last line `FYF† = Z` | FZF† = Z, FYF† = −X, FXF† = Y | CONFIRMED |
| 7 | Q22 p. 184, Eq. 10.14 | g2 = I2 ⊗ (−iY2) ⊗ Z3 …, first factor labelled I2 | (−iY)² = −I, so g² = −I: not a stabilizer element | CONFIRMED |
Also checked, no box needed: Eq. 10.21 reads GΛy = x on page 186; Table 9.1 and p. 161 (p²(3−2p), break-even ½) correct; Eqs. 9.8, 9.16, 9.34, 10.2–10.4, 10.12–10.13, Theorems 1 and 2 sit on the pages cited; Q22's [6,2] code is Bergou's own (Eqs. 9.35–9.37) and is cited as such.

## Blocking
| # | file:line | Problem | Exact fix |
|---|---|---|---|
| B1 | Q21.ts:230 (test `Q21.tryits.test.tsx:102`) | "Press place 1 and place 2 of row a to make it 011": widget places count left to right (`BitTable.tsx:114`), so 110 becomes 000, not 011, and "still says a·b = 1" is false (000·010 = 0) | write "place 1 and place 3"; make the test flip 110 at places 1 and 3 and assert 011 (it only greps the phrase) |

## Should-fix
| # | file:line | Problem | Exact fix |
|---|---|---|---|
| S1 | Q21.story.ts:252; Q21.review.ts:48 | "Bergou's table (p. 163)": Table 9.1 is on p. 162 | change to p. 162 in both |
| S2 | Q21.story.ts:563, 614; Q21.review.ts:108 | `c_P = Tr(PA)/2` attributed to Bergou p. 164 and "Eq. 9.4"; Eq. 9.4 is U_AE on basis states, p. 164 gives the Pauli expansion only | "(Pauli expansion: Bergou p. 164; the trace formula is our working-out)"; review card "Eq. 9.4" becomes "p. 164" |
| S3 | Q21.story.ts:289 | "is Eq. 9.1 with ε = 0.5 (up to the phase −i)": the −i sits on the flipped branch only, not a global phase | "has the form of Eq. 9.1 with ε = 0.5; the flip part also carries a factor −i, which changes no chance" |
| S4 | Q22.story.ts:761–762, 765; Q22.ts:432–433; Q22.review.ts:93, 107 | "Above p* the code makes things worse", "P_L < p only below p*": P_L − p changes sign again at p = 0.5 and 0.9354 (P_L(½) = ½ exactly); true only on 0.0646 < p < ½, the plotted range | "Between p = 0.0646 and ½ …"; drop "only"; add "(bit flips only)" to Ground b4 |
| S5 | Q22.story.ts:857, 868–870, 895–934; Q22.ts symbols S_0…S_3 | In Unit 22.6, S is the stabilizer group (b1, b3) and the phase gate (b2, b5): the plan's own FLAG; the lint accepts one definition site, so it cannot see it | keep S for the gate, rename the tracked groups Σ₀…Σ₃ and "USU†" to "UΣU†" in this unit |
| S6 | Q22.story.ts:640 | derivation step cites "Eq. 9.42 with x = 0" for |C2⟩; Eq. 9.41 defines |x + C2⟩ (9.42 is H^{⊗n}|x⟩); line 605 already says 9.41 | "Eq. 9.41 with x = 0" |
| S7 | Q22.story.ts:103–115, 395–424, 533; Q22.ts:29 | Ground uses symbols never named in Ground prose: `M` and `C` (linear:b3 derivation), the X half x and Z half z of a row (axis letters, exempt from the lint), the superscript T in H_XH_Zᵀ and x z'ᵀ (transpose); T also names the gate at clifford:b5 | linear:b2 Ground: "the table of checks, the check matrix $M$ (F7)"; check-matrix:b1 Ground: "write a row as $(x|z)$"; css:b1 Ground: "$H_Z^{T}$ is $H_Z$ turned on its side"; no change to the gate's T |
| S8 | Q22.ts:617–618 (E1 box); Q22.review.ts (css trap) | "the inequalities must be ≥": the printed strict test is over-strong (sufficient, not tight) and fails on the book's own Steane example; it is not false. Box omits "weight less than tf" | "should be ≥: the strict version is only sufficient, and Steane's own d = 3, t = 1 fails it; the page also says 'less than tf' where 'at most' is meant" |
| S9 | Q22 (no `Q22x` in `games.ts:140` area) | the 7 planned Arcade rounds (P-Q22 §11.2, incl. the Correction echoes `qc-s-table`, `qc-dual-distance`) are not built (BUILD-LOG:69) | build `Q22x` with the Q21 pattern, or record the deferral in BUILD-LOG |
| S10 | Q22.ts:23 | `prerequisites` omit Q21, yet stabilizer:b2/b4, check-matrix:b4–b6 and decode:b3 lean on its bit-flip, Shor, degeneracy and room-count ideas | add `qc-bitflip-code-station`, `qc-shor-code-station`, `qc-kl-station` |

## Nits
| # | file:line | Fix |
|---|---|---|
| N1 | Q21.story.ts:134 (+ `symbols.k` Q21.ts:84) | summation index k clashes with k = stored qubits (kl:b4): write `\sum_{w\ge2}\binom3w p^w(1-p)^{3-w}` |
| N2 | P-Q21-story.md §1 b4/b5 and §7.1 | stale order: the five-copy clue is now b5, qubit obstacles b4 (code and symbol map already right) |
| N3 | Q21.review.ts (classical Formal trap) | "p ≥ ½": at p = ½ the vote ties the bare bit; write "p > ½" |
| N4 | Q22.story.ts:189 | "one qubit has 16, ±1 …" reads oddly: "has 16 of them: ±1 or ±i times I, X, Y, Z" |
| N5 | Q22.story.ts:664 | weight-3 logical operator shows d ≤ 3 only: add "and no lighter one exists (all strings checked)" |
| N6 | Q22.story.ts:469 | "(Bergou's signs)" ambiguous: "(for Bergou's code words)" |
| N7 | Q22.story.ts:485 | [[3,1,1]] beside Q21's "bit-flip code fixes bit flips": add "d = 1: it fixes only the flips it was built for" |
| N8 | Q22.story.ts:1000, 986; Q22.review.ts:13; bridges.ts:79 | "The tableau says 11" but the stage draws the dense run (tableau asserted in `Q22.test.ts:109–110`): "the full simulation and the tableau (checked in a test) agree"; "bits grow like n²" while stored n(2n+1): "about 2n²"; `(d−1)/2` becomes ⌊(d−1)/2⌋; bridge `qc-q4-one-qubit-gates` label says Hadamard but S sits in `Q4.story.ts:371` (b6): add `beat` |

## Known items (brief §5)
1. **Q22x Arcade not built**: confirmed (S9).
2. **Q22 stabilizer station needs Q21 bit-flip station**: already done, `concepts.ts:278` lists `qc-bitflip-code-station`; all 14 station `needs` ids resolve. The lecture-level `prerequisites` still omit it (S10).
3. **Q21 clue reordered**: confirmed, five-copy clue is `q21-classical:b5`, the clue-last rule holds in all 14 units of both chapters; no code, test, e2e or game refers to the old b4/b5 ids; only the plan is stale (N2).

## Checked and right
Sentence caps, symbol-before-use lints, glossary (both chapters), clue-last order, 33 and 37 beats, derivations end on the stated result in both tracks (Ground steps ≥ Formal), all try-it lines other than B1 (promised readouts recomputed), forward hooks name Papers chapters only in words, running qubit 0.6|0⟩ + 0.8|1⟩ and R_x(60°) labelled "our" (ruling R7), p* labelled "our calculation".

## R fixes (2026-10-15)
Every item above is fixed; commits `3560df3` (Q21), `c5db23b` (Q22 text, engine value, bridge) and `0c1809c` (Q22 Arcade). Checks: `src/content` (45 files) green, Q22 arcade and games tests, claims twins byte-identical on a second run, `tsc -b`, `npm run build`, Playwright preview `story.spec.ts -g "Q21|Q22"` (4) and `arcade.spec.ts` (5).

| Item | Commit | What changed |
|---|---|---|
| B1 | 3560df3 | Q21.ts:230 now says place 1 and place 3; `Q21.tryits.test.tsx` flips 110 at places 1 and 3 with the widget's own `flip`, asserts 011 and `a·b = 1` (and that places 1 and 2 give 000) |
| S1 | 3560df3 | Table 9.1 cited as p. 162 in `Q21.story.ts` and `Q21.review.ts` |
| S2 | 3560df3 | "(Pauli expansion: Bergou p. 164; the trace formula is our working-out)" at both story sites; review card "Eq. 9.4" became "p. 164" |
| S3 | 3560df3 | "has the form of Eq. 9.1 ...; the flip part also carries a factor −i, which changes no chance" |
| S4 | c5db23b | decode:b4 Ground "(bit flips only)" and "From p* up to one half the code makes things worse"; Formal adds P_L > p up to ½ and P_L(½) = ½ (new keyed value `q22PLHalf`, claim, numpy twin); insightFormal, pitfall and both review traps reworded, "only" dropped |
| S5 | c5db23b | Unit 22.6 tracked groups are Σ₀…Σ₃, "UΣU†" (Σ defined as the group S of Unit 22.1 in b1 Formal; b3 prose names Σ₀…Σ₃); symbols map updated; S stays the phase gate |
| S6 | c5db23b | "Eq. 9.41 with x = 0" |
| S7 | c5db23b | linear:b2 Ground names M and C; check-matrix:b1 Ground names x, z and (x\|z); b2 Ground names the transpose T and x z'ᵀ + z x'ᵀ; css:b1 Ground "H_Zᵀ is H_Z turned on its side"; M and C symbol sites moved to linear:b2 |
| S8 | c5db23b | E1 box: "should be ≥: the strict version is only sufficient, and Steane's own d = 3, t = 1 fails it", plus "weight less than t_f" should read "at most t_f"; css review trap reworded |
| S9 | 0c1809c | `Q22x` rounds in `games.ts` (seven, plan order, incl. `qc-s-table` and `qc-dual-distance` Correction echoes) and `Q22.arcade.test.ts` recomputing each wrong step; BUILD-LOG line 69 still lists the deferral and needs the judge's update |
| S10 | c5db23b | `prerequisites` add `qc-bitflip-code-station`, `qc-shor-code-station`, `qc-kl-station` |
| N1 | 3560df3 | sum index w (w already means "flips" in b1); symbol `k` now defined at kl:b4 |
| N2 | 3560df3 | `P-Q21-story.md` b4/b5 swapped and §7.1, §11.3 references updated |
| N3 | 3560df3 | "p > ½" |
| N4 | c5db23b | "has 16 of them: ±1 or ±i times I, X, Y, Z" |
| N5 | c5db23b | css:b4 (both tracks): d ≤ 3 from the weight-3 operator, "no lighter string does this (every string was checked)" |
| N6 | c5db23b | "(for Bergou's code words)" |
| N7 | c5db23b | "The bit-flip code has d = 1: it fixes only the flips it was built for." |
| N8 | c5db23b | gk:b2 "The full simulation and the tableau (checked in a test) agree"; gk:b1 captions "about 2n² (dashed shows n², the same growth)"; review "rounded down" for (d−1)/2; new bridge row `qc-q4-phase-gate` (beat `q4-one-qubit-gates:b6`) used for the S gate at clifford:b2, because adding `beat` to `qc-q4-one-qubit-gates` would also move F7's Hadamard link |
