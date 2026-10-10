# P review: 709 Q17 "Searching an unsorted list: Grover" (main eb12685, reviewed 2026-10-10)

Reviewer: independent P verifier (read-only; not the builder). Skill: `skills/06-chapter-review/SKILL.md`.

## Verdict
**PASS** (0 blocking, 2 should-fix, 5 nits, 1 builder's-language question).
- **Numbers are right:** every displayed number and all 14 challenge keys check out with dense 2ⁿ matrices of Bergou's own operators.
- **k\* by N&C's closest-integer rule:** 2 for N = 8 and 25 for N = 1024. CI(π/(4α) − ½) equals both the brute-force "nearest vertical" k and Bergou's n̄ = round((π/4)√N − ½) for every N = 2², …, 2¹⁰, 2¹², 2¹⁶, 2²⁰.
- **Success chances:** N = 4 gives 1. N = 8 gives 0.7813, 0.9453 and 0.3301. N = 16 with M = 4 gives 1. N = 1024 gives 0.9995 at k = 25, and 0.4960 at k = 12.
- **All four book Corrections are CONFIRMED** on page images (re-rendered at 200–300 dpi from the source PDF). None is cut. Each `check()` computes a discrepancy:
  - **B18 (Eq. 7.15, p. 121):** the page prints c₁|w₀⟩ + (2/√N + c₂)(|x₀⟩ − (2/√N)|x₀⟩). Both the missing c₁ and the last ket are slips. The check only sees the ket (item 1).
  - **B19 (pp. 121–122):** the page prints a plus sign in both |x₀⊥⟩ and |w₀⊥⟩, and writes −U_f = −(I − 2|w₀⟩⟨w₀|). I get an overlap of 2/√7 = 0.756 instead of 0. −U_f and −U_{w₀} differ by 1.75 in their largest entry.
  - **B20 (p. 123):** the page prints cos α = (1 − 1/√N)^½, and calls the chance of measuring x ≠ x₀, cos²α_n̄, O(1/N²). The true cos α is 0.9354, against the printed form's 0.8040. The total miss chance is 7/128 = 0.0547 ≤ 1/N. It is the per-item share, 1/128, that is O(1/N²).
  - **Eq. 7.22 (p. 124):** the middle line's last term lacks its factor 4. ‖(U_x − I)ψ‖² = 4|⟨x|ψ⟩|². With weight 1 the line gives D₁ ≤ 1 against D₁ = 4. N&C's Eq. 6.43 (p. 269) has the 4.
- **The −U₀ labelling (R3) is right:**
  - The circuit's third column is labelled `−U_0` and flips all but 000.
  - H(−U₀)H = 2|w₀⟩⟨w₀| − I, so the circuit's step equals Q = −U_HU₀U_HU_f **exactly**, and using U₀ instead gives −Q.
  - The oracle:b3 captions call the sign a global phase.
- **The grover-plane picture matches its captions (resolver read line by line):**
  - The arrow sits at (2k+1)α, with a 2α step arc.
  - The mirrors are at 0 and α, and the ghost is the arrow reflected in the horizontal axis.
  - Theorem 1's test vectors are drawn: v₁ 0 → 0 → 2α and v₂ α → −α → 3α.
  - The k\* ring and vertical tick are drawn.
  - The layout rule pins every circuit/amplitudes view beside it to the same k.

## Evidence summary
- **`rev709q-q17.py`** (scratchpad): 68 checks, 0 mismatches. My own route: dense U_f, U₀, U_H and Q matrices, a basis-restricted check that BᵀQB = R(2α) and BᵀD B is the w₀-mirror, explicit D_k sums over all 8 oracles, and brute-force k\*. No engine code.
  - **Mark:** the bars are 0.3536. After the mark the mean is 0.2652 and P(x₀) = 0.125.
  - **Plane:** α = 20.70°, cos α = 0.9354, 2/√8 = 0.7071, cos 2α = 0.75 and sin 2α = 0.6614. R_{w₀}R_{x₀⊥} = R(+41.41°) and the reverse product is R(−41.41°). Two mirrors at 30° give a 60° turn.
  - **Iterate:**
    - The unmarked amplitudes stay equal at k = 1–3, and the arrow sits at 103.52° (k = 2) and 144.93° (k = 3).
    - Inversion about the mean gives 0.1768 and 0.8839 = sin 3α, and the mean stays 0.2652.
    - The arrow ends 13.5° over vertical at k = 2 and 27.9° short at k = 1. The raw step counts are 1.67 and 24.63.
  - **Optimal:**
    - D₁, D₂, D₃ = 4, 14, 25 (each ≤ 4k²), and the fixed steps leave |w₀⟩ unchanged.
    - Eq. 7.29 gives 11.57 at N = 1024, so k ≥ 12. The hint's 535.8 and 133.96 are right.
- **Vitest:** 9 files, 195 passed. `Q17.tryits.test.tsx` renders PhaseDial, Projector and OperatorAction and matches every quoted reading. My recompute agrees: 0.354/12.5%, 0.884/78.1%, ≈94.5% at 103.5°, ≈33% at 145°, eigenvalues ±1, and σz = diag(1, −1).
- **Pages read:**
  - **Bergou images**, printed pp. 120–125 = PDF − 10: Eqs. 7.13–7.29, Theorem 1 and Figs. 7.2–7.5.
  - **N&C text**, printed = PDF − 28: §6.1.1 p. 248, Eq. 6.3 p. 249, Eq. 6.5 p. 250, Eq. 6.7 p. 251, the inversion about the mean and Eqs. 6.8–6.13 p. 252, Eq. 6.15 with CI rounding halves down p. 253, Eqs. 6.16–6.17 p. 254, and §6.6 with Eq. 6.43 pp. 269–271.
  - Every story citation is right. One unit `books` page range is off (item 5).

## Blocking
None.

## Should-fix
1. **The B18 check cannot see half of its own claim.**
   - **The test point:** `V.q17E1Printed = eq715Gaps(3, 5, 1, 0).printed` tests Eq. 7.15 at c₁ = 1, c₂ = 0, where the printed factor (2/√N + c₂) equals the true (2c₁/√N + c₂).
   - **What it misses:** the box's "the factor lacks c₁" is untested. At (1, 0) a right-hand side with the ket fixed but the factor still printed misses Q|ψ⟩ by **0.0000** (my run).
   - **At a generic point:** at (c₁, c₂) = (0.6, −0.8), which the chapter already uses for `q17PlaneClosed`, the printed form misses by 0.356 and the ket-only fix still misses by 0.283.
   - *Fix:*
     - `q17E1Printed: eq715Gaps(3, X0, 0.6, -0.8).printed`.
     - Add `q17E1FactorOnly`, the gap with only the ket corrected, and assert it > 0.2 in `check()`.
     - Reword `shouldSay` "for eight strings and the start |w₀⟩" → "for eight strings and the mix 0.6|w₀⟩ − 0.8|x₀⟩", and quote both gaps. Lower the printed-gap threshold in `check()` from 0.5 to 0.3.
2. **About a dozen learner-visible numbers are typed, not read from `V`.** The header says this never happens. Every value is right, but none has a claim:
   - `q17-or-blind` walkthrough "1/8 = 0.125".
   - `q17-or-mean` hint "+0.3536 … −0.3536".
   - `q17-pl-sin` walkthrough "0.25".
   - `q17-pl-alpha` hint "0.3536".
   - `q17-tr-step` hint "α = 20.70°".
   - `q17-it-one` hints "62.11°", "0.8839".
   - `q17-it-kopt` walkthrough "about 1.79°", "about 24.6".
   - `q17-it-over` hint "144.93°".
   - `q17-op-bound` hints/walkthrough "0.5858", "535.8", "√133.96".
   - `q17-op-tight` distractor why "0.9995".
   - *Fix:* interpolate `d(V.q17Blind, 3)`, `d(V.q17Bar, 4)`, `d(V.q17SinN16, 2)`, `d(V.q17SinA, 4)`, `d(V.q17AlphaDeg, 2)`, `d(3*V.q17AlphaDeg, 2)`, `d(V.q17InvMarked, 4)`, `d(V.q17KoptRaw…)` and `d(V.q17P1024, 4)`.
   - Add `q17Alpha1024Deg`, `q17KoptRaw1024` and `q17BbbvRhs1024` (= N(2−√2) − 2√N) with numpy twins, and use the existing `q17Angle3` for 144.93°.

## Nits
3. **The B20 box says "the engine's own overlap gives 0.9354"**, but `V.q17CosA` is `Math.cos(groverAngle(8))`. The measured ⟨w₀|x₀⊥⟩ (`cosAlphaMeasured().measured`) is computed and never used.
   - *Fix:* add `q17CosMeasured: cosForms.measured`, quote it in the box, and test `close(V.q17CosMeasured, V.q17CosA)` in `check()`.
4. **θ has two meanings.** `q17-plane:b1` Formal introduces θ as N&C's angle (θ/2 = α). `q17-two-reflections:b3` Formal derivation step 1 reuses it as a generic mirror-line angle, "$R_\theta = \cos2\theta\,Z + \sin2\theta\,X$".
   - *Fix:* write that line's angle as $\beta$ ($R_\beta$), and register it in `symbols`.
5. **The `q17-iterate` N&C `books` entry reads "§6.1.3–6.1.4, pp. 252–254, Eqs. 6.7, 6.12–6.17".** Eq. 6.7 is on p. 251, in §6.1.2. The story's own "N&C Eq. 6.7, pp. 251–252" is right.
   - *Fix:* "§6.1.2–6.1.4, pp. 251–254, Eqs. 6.7, 6.12–6.17".
6. **The `q17-op-bound` prompt calls Eq. 7.29 "the fewest queries any algorithm can use".** The bound holds only for success above one half for every x, as the clue reveal itself stresses.
   - *Fix:* "… the fewest queries any algorithm can use to succeed with chance above one half for every $x_0$, as a real number."
7. **The B19 box says "by symmetry so does |w₀⊥⟩ with |w₀⟩", but `check()` does not compute it.** My value is the same 0.756.
   - *Fix:* add `perpOverlap`'s mirror case for |w₀⊥⟩ (the overlap with |w₀⟩) and assert it, or drop "by symmetry".

## Builder's-language questions
- **The Projector stand-in still shows its own slider label, "polarization χ"** (`Projector.tsx:107`), on three Grover units. The Try-its say "drag the arrow", which works, so this is acceptable under R7. A `light={false}` relabel or a W16 `oracle-bench` would read better later.

## Checked and right
- **Derivations:**
  - D2: sin α from the 1/N chances, with the minus-sign Gram–Schmidt.
  - D1: U_f on any c₁|w₀⟩ + c₂|x₀⟩ and −U_{w₀}|x₀⟩, which compose to the corrected Eq. 7.15. My corrected gap is 0 at three (c₁, c₂).
  - D3: the v₁/v₂ argument and (cZ + sX)Z = R(2α), with XZ the +90° turn.
  - D4: Eq. 7.18.
  - D5: k\* = CI((π − 2α)/(4α)), within α of vertical, so P_fail ≤ sin²α.
  - Optimality: the Ground terms are "2 − √2 − 2|a_x|" summed with Σ|a_x| ≤ √N. The Formal steps cite Eqs. 7.25 and 7.27 correctly.
  - Every `why` is fair, and both tracks end on the result.
- **Captions against stages:** every beat and reveal caption matches.
  - The mark bars and mean line, and the α arc with shadow 0.3536 and chance 0.125.
  - The ghost below the axis, the mirror labels, and the product tables (2-decimal cells, as the build note says).
  - The trail, the "13.5° past the vertical tick" with the ring at k\*, and the N = 4 bar on |11⟩.
  - C_D(2) column 7 = |w₀⟩, the 91.3°/0.9995 and 0.4960 readouts for N = 1024, and every `upTo`.
- **Bridges:** `qc-l7-two-angles` → `l7-two-angles` and `qc-f3-matrix-of-map` → `f3-matrix-of-map` exist and resolve.
- **Rulings:**
  - R1: `grover-plane` built.
  - R2: running and side cases.
  - R3: −U₀ label and global-phase caption.
  - R4: four boxes, each worded "Our calculation finds …".
  - R5: optimality in both tracks.
  - R6: CI named in the text and the engine.
  - R7: stand-ins.
  - R8: `groverStepMatrix` is the circuit's unitary, cross-checked against −U_HU₀U_HU_f (`q17QIsCircuit`).
- **Text hygiene:**
  - No raw TeX outside `$…$`, and no plan ids in learner text (only "R3/R4" in a code comment).
  - The 10 glossary ids/terms duplicate nothing in 709.
  - The "Unit 17.3" and Chapter Q5/Q16 references resolve.
  - D (operator) and D_k (sum) are explicitly told apart in both tracks.
