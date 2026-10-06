# P review: 709 Q6 "Two qubits: products, entanglement and the Bell basis" (main 28d166f, reviewed 2026-10-06)

**Verdict: FIX-FIRST** (3 blocking, 6 should-fix, 7 nits).
- Every number in the engine is right: all 24 challenge answers, all 14 derivations and every number in the captions.
- Three things a learner sees are false:
  - In the eq. 2.6 beat, the circuit brackets name the wrong operator at the input.
  - One view captioned "diag(0, 1, 2, 3)" draws diag(0, 2, 1, 3), because of the engine's Bell-basis order.
  - A review card says every entangled pair has equal singular values.
- HW2 walkthroughs are missing, though ruling 12 releases them.
- Q6 duplicates Q4's ⊗-on-operators notation beat.
- Many answers and claims are literals or mis-keyed constants.

Evidence (scratchpad `revQ6Q7-*`):
- `revQ6Q7-q6.py`: my own route.
  - Bell states come from the preparation circuit, with CNOT as a permutation.
  - The triplet and singlet are found by diagonalizing S²_tot + 0.1 S_z,tot.
  - Heisenberg images are found as full strings with signs.
  - The product tests use the SVD.
  - 26 keys compared with `claims-qc709/q6.json`: 0 mismatches. 19 structural checks pass (orthonormality, U β_xy = |xy⟩, the Π_xy factorization, {II, XX, −YY, ZZ} projecting onto Φ⁺, the spin-1 block).
- `vitest src/content src/physics/qc`: 3791 passed.
- Plan and build agree beat for beat: 37 beats with the same ids as P-Q6-story §1.
- **Sources:** notes L5 pp. 21–26 and L6 pp. 27–29 read in full; HW2 P1–P2.
- **Book pages checked:**
  - Bergou: p. 2 (eqs. 1.3–1.4), p. 32 (eq. 3.4, read on the PDF-45 render) and p. 37 (§3.4).
  - N&C: pp. 25–26 (PDF 53–54), p. 71 (§2.1.7) and p. 454 (§10.5.1).
  - Axler: p. 370 (9D).
- `revQ6Q7-probe.test.ts`: the engine's own stage resolvers, run with vitest from the scratchpad. `resolveMatrixStage` of M̂ with `basis: 'bell'` gives diag [0, 2, 1, 3] with rows ⟨Φ+|, ⟨Φ−|, ⟨Ψ+|, ⟨Ψ−| (item 2). `circuitReadouts` gives "measuring ZI after column 0" (item 1).
- **Not done (economy):** no screenshots (F4 and F5 are building). Items 1 and 2 were confirmed with the engine's own resolvers instead.

## Blocking

1. **The eq. 2.6 brackets name the wrong operator at the input.**
   - `circuit.observable` draws its `pauli` label literally at column `at`, with the readout "measuring ZI after column 0" (`circuit.ts:94`). It does not conjugate.
   - `q6-parities:b1` puts `{pauli: 'ZI', at: 0}` or `{pauli: 'IZ', at: 0}` at the input in four places:
     - the main stage (`Q6.story.ts:691`), caption "Z₁ at the meters is X₁X₂ at the input";
     - Ground line 3 (`:702`), "at the input: X₁X₂";
     - Ground line 5 (`:704`), "Z₂ at the meters is Z₁Z₂ at the input";
     - Formal line 2 (`:708`).
   - So the stage says ZI and IZ are measured at the input, contradicting its own captions and eq. 2.6. I recompute U†(ZI)U = +XX and U†(IZ)U = +ZZ.
   - *Fix:*
     - Use `{pauli: 'XX', at: 0}` at `:702`, and `{pauli: 'ZZ', at: 0}` at `:704` and `:708`.
     - For the main stage, split `circ(C_U, 2, {observable: {pauli: 'ZI', at: 2}})` over `circ(C_U, 2, {observable: {pauli: 'XX', at: 0}})`.
     - Add `q6HeisZIString`/`q6HeisIZString = heisenberg(UB, ·)!.pauli` keys. The claims at `:693-694` and `q6.py` `clifford_sign` check only the sign today. Assert each drawn input label equals that string.
2. **"diag(0, 1, 2, 3)" over a matrix that draws diag(0, 2, 1, 3).**
   - `matrix` `basis: 'bell'` uses `BELL_BASIS` in the order Φ⁺, Φ⁻, Ψ⁺, Ψ⁻ (`state.ts:114`, `matrix.ts:140`), not β₀₀, β₀₁, β₁₀, β₁₁. Plan §9.1 warned about exactly this order.
   - `q6-parities:b5` Ground line 2 (`:797`), "in the Bell basis: diag(0, 1, 2, 3)", therefore draws M̂ = diag(0, 2, 1, 3). Formal line 1 (`:803`) is the same view.
   - *Fix:* `const BXY: AmpSource[] = [{bell:'Phi+'}, {bell:'Psi+'}, {bell:'Phi-'}, {bell:'Psi-'}]`. Use `basis: BXY` at `:755`, `:756`, `:760`, `:797` and `:803`, as `TS_KETS` already does at `:480`.
3. **A false review-card statement.**
   - `Q6.review.ts:59`: "Singular values: one for a product, two equal ones for an entangled pair."
   - Counter-example from this chapter's own Ψ₂ = (√3|00⟩ + |11⟩)/2 (`bell-circuit:b6`): it is entangled (det C = 0.433) with singular values 0.866 and 0.5.
   - *Fix:* "one non-zero singular value for a product, two for an entangled pair (equal ones for a Bell state)".

## Should-fix

4. **HW2 walkthroughs are withheld** (rulings qc709-remap #12 and `homework-status.md`: HW2 submitted 2026-10-02).
   - Six challenges carry `assigned` and `walkthrough: []`. `ChallengeCard.tsx:177-182` then shows "Assigned as homework … hints only":
     - `q6-b-p1a` (`Q6.ts:463`), `q6-b-p1c` (`:476`), `q6-b-stot` (`:491`);
     - `q6-c-p2a` (`:548`), `q6-c-p2c` (`:560`), `q6-p-p2b` (`:614`).
   - The file header (`Q6.ts:11-12`) promises full walkthroughs, and Q7 gives them.
   - *Fix:* drop `assigned` and write the steps:
     - P1(a): ½(1,1,1,1) against (|01⟩+|10⟩)/√2 → 1/√2.
     - P1(c): (−½ − ½)/√2 = −1/√2.
     - P1(e): S_x^tot|1,0⟩ = (ħ/√2)(|1,1⟩ + |1,−1⟩) → ħ/√2.
     - P2(a): ⟨β₁₁|0+⟩ = ½ → ¼.
     - P2(c): (√3+1)/(2√2) → (2+√3)/4 = 0.933.
     - P2(b): ⟨X⟩₀⟨X⟩₊ = 0·1.
5. **A second ⊗-on-operators notation beat, against ruling Q6Q7 #2 (amended).**
   - `q6-tensor:b1` `introduces: ['qc-operator-tensor']` (`Q6.story.ts:163`), and `Q6.glossary.ts:30` adds `qc-operator-tensor`.
   - Q4 already owns `qc-tensor-operator` (`Q4.glossary.ts:66`, introduced at `q4-registers:b2`). So there are two ids for one term, and Q6's own header says it owns no such beat.
   - *Fix:*
     - Delete Q6's entry. Link `[[qc-tensor-operator|tensor product of operators]]` at `tensor:b1` F, and drop `introduces` there. The block rule stays as a link-back beat.
     - Update the comment at `F6.glossary.ts:7`.
     - The concept station `qc-operator-tensor-station` can stay.
6. **Literal, constant-keyed and mis-keyed answers and claims** (remap ruling "engine-backed answers"; the P-Q5 item 4/5 defect class).
   - **Literal answers:**
     - `q6-t-zz` `answer: 0` (`Q6.ts:344`) and `q6-b-overlap` `answer: 0` (`:453`).
     - `q6-m-amp` (`q6R2`), `q6-t-avg` (`q6Sqrt32`) and `q6-c-mid` (`q6NegR2`) are keyed to constants.
     - `q6-c-p2a` asks for outcome **11** but answers `q6Quarter`. The engine key `q6P2a` exists, computes outcome **00**, and is unused.
   - **Mis-keyed claims.** `claims.test` checks the claim's key, so the twin compares a constant, not the number the label names:
     - `claim('q6R2', …, close(V.q6P1aMid…))` (`Q6.story.ts:465`) and `close(V.q6StotEntry…)` (`:481`);
     - `claim('q6NegR2', … V.q6P1cS)` (`:466`);
     - `claim('q6Sqrt32', … V.q6Psi2ExpXX)` (`:819`).
   - **Vacuous constants backing shown numbers:**
     - `tensor:b4` "⟨Z₁X₂⟩ = 0.5" and "⟨X₁X₂⟩ = 0.866" (`:219`);
     - `tensor:b5`, the arrow parts (`:252-253`);
     - `bell-basis:b6` caption, which prints `d(V.q6R2)`/`d(V.q6NegR2)` for \|+x,−x⟩'s Φ⁻ and Ψ⁻ parts (`:461`);
     - `bell-basis:b8` "−0.5" (`q6NegHalf`);
     - `bell-circuit:b5` "0.25 each" (`:623-626`);
     - `parities:b6` "⟨ZZ⟩ = 1" for Ψ₂, which is unclaimed (`q6Psi2ExpZZ` is unused).
   - **Hand-typed V entries:** `q6RankPhi: 2`, `q6DetProd: 0`, `q6DetPP: 0` (`Q6.values.ts:147-149`).
   - *Fix:*
     - Add engine keys: `expectationN(runCircuit(C_PROD).states[1], ·)` for ZX/XX/ZZ, `inner(PHI_PLUS, PHI_MINUS)`, `abs2(psi1BellAmps[3])`, `runCircuit(C_BM('11')).states[3][3].re`, `components(ket('+-'), [PHI_MINUS, PSI_MINUS])`, `det(coefMatrix(PHI_MINUS))`, an SVD rank, and `det(coefMatrix(ket('++')))`, each with a twin.
     - Re-key the four claims to `q6P1aMid`, `q6StotEntry`, `q6P1cS` and `q6Psi2ExpXX`.
     - Print the captions with `d(V.key)`.
7. **"2 × 2 = 4, not 2 + 2" contrasts two equal numbers.**
   - For two qubits 2 + 2 = 4 as well, so the example cannot show that composition multiplies. It appears in:
     - `q6-many:b1` text (`Q6.story.ts:94`);
     - the unit question "double the amplitudes instead of adding two" (`Q6.ts:226`);
     - the review point and trap (`Q6.review.ts:13`, `18`).
   - *Fix:* use the qubit plus spin-1 pair (6, not 5; the `q6-m-dim` challenge) or three qubits (8, not 6). Ask "Why do joined systems multiply their dimensions instead of adding them?"
8. **The correlation grid is used one beat before its notation beat.**
   - The `tensor:b4` derivation shows the `two-qubit` grid ("the zx cell: 0.5 × 1", `:227`).
   - Its Formal `why` and caption use T = r_A r_Bᵀ and T_zx = r_{A,z}r_{B,x} (`:236`).
   - `qc-correlation-grid` is introduced at `tensor:b5`. `Q6.ts:66-67` registers r_A and r_B at b4, which hides this from the lint.
   - *Fix:* end b4 on ⟨A⊗B⟩ = ⟨A⟩⟨B⟩ with `amp`/`matrix` views, and move the grid views and T = r_A r_Bᵀ to b5.
9. **N&C pages.**
   - Eq. 1.27 (the β_xy rule) and Fig. 1.12 are on p. 26 (PDF 54); only eqs. 1.23–1.26 are on p. 25.
   - *Fix:* `Q6.ts:424` "§1.3.6, pp. 25–26" and `Q6.ts:508` "Fig. 1.12, p. 26".

## Nits

10. **Raw caret in an outcome.** `Q6.ts:19` "N qubits carry 2^N" renders as plain `<li>`. Write 2ᴺ.
11. **HW2 locators are mixed.** "HW2 P1(a)–(c)", "HW2 P1(e)" and "HW2 P1(d)" sit beside "709 HW2, Problem 2(a)". Ruling 7 prefers "709 HW2, Problem n(x)".
12. **The `q6-tensor` review trap** (`Q6.review.ts:36`), "expecting a product operator to be diagonal somewhere": X⊗Z is diagonal in the product basis {\|±⟩}⊗{\|0⟩, \|1⟩}. *Fix:* "…to be diagonal in the 0,1 basis".
13. **An unclaimed number.** The `q6-many:b4` reveal, "1024", has no claim, while `q6AmpN10` exists unused.
14. **A clue that hints at its answer.** The `bell-circuit:b7` stage shows the wires starting at \|11⟩ (the C_BM prep), which hints at "11". *Fix:* `amp({bell:'Psi-'})` for the clue.
15. **`introduces` is inconsistent.** `qc-entangled` and `qc-factoring-test` are introduced by beats (`entangled:b2`, `b4`), but their entries carry no `introduces` field.
16. **The Try-it swap** (known follow-up, closed by `07ef15b`). All six specs are now valid canvas-free kinds, and the props match their try-this text: \|ψ₁⟩ at θ = 60° gives 0.866 and 0.5, and \|−⟩ gives a full x bar. The crash got past vitest and was caught only by Playwright, so add a unit test that validates each `visual.props` against its widget kind.

## Notes alignment (revised notes L5–L7, HW2)

- **Every notes citation is right:**
  - p. 21: N bits against 2ᴺ amplitudes, and d₁d₂;
  - p. 22: product states, ⟨A⊗B⟩ = ⟨A⟩⟨B⟩, 6 against 4, 2N/(2^{N+1} − 2) ≈ 1% at N = 10, and Φ not factoring;
  - p. 23: A₁ → A⊗I, eq. 2.1 and σ_x⊗σ_z;
  - p. 24: CNOT as a projector sum;
  - p. 25: eqs. 2.3–2.4 and orthonormality;
  - p. 26: triplet and singlet, Fig. 7, and β_xy → \|xy⟩;
  - p. 27: U† prepares, eq. 2.5 and eq. 2.6;
  - p. 28: [XX, ZZ] = 0, eq. 2.7, the factorized Π_xy, M̂ and eq. 2.8;
  - p. 29: stabilizer generators.
- **The Rosettas are right:** σ̂_1x (p. 23) against σ̂_x1 (p. 27); "separable" defined as pure here, widened in Q10; Bergou eq. 3.4 writes Φ± = (\|01⟩ ± \|10⟩)/√2, so its Ψ± are our Φ±, as the pitfall says.
- **HW2:** P1(a)–(e) → `bell-basis:b6`–`b8`; P2(a)–(c) → `bell-circuit:b5`–`b6` and `parities:b6`. The values are right; only the walkthroughs are missing (item 4).
- **Missing [L] beats:** none. Notes p. 25's CNOT = (1⊗H)CZ(1⊗H) and HW2 P3 are Q4 material.

## Derivation views and notation beats

- **Derivation views:** all 14 derivations have at least 2 distinct views in each track, and each view shows its step. Two exceptions:
  - In `parities:b1`, three views name the wrong operator (item 1).
  - In `parities:b5`, one view contradicts its caption (item 2).
- **Good views:**
  - `tensor:b2`: X, then blocks, then the `C_XZ` check \|01⟩ → −\|11⟩, then the highlighted Z blocks;
  - `entangled:b3`: a product's one singular value against Φ⁺'s two;
  - `bell-circuit:b2`: β₁₀, then \|−⟩\|0⟩, then the 10 bar, with Formal U·B = I;
  - `bell-basis:b7`: X⊗I, I⊗X, their sum, then the triplet block;
  - `parities:b3`: ½(I − XX) on the Bell basis, then Π₁₀ = a single 1.
- **Notation beats:** each introduces its term.
  - `qc-composite-space` (`many:b1`), `qc-pauli-string` (`tensor:b3`), `qc-correlation-grid` (`tensor:b5`), `qc-bell-basis` (`bell-basis:b1`, tagged "(notes, N&C: β₀₀)" per ruling 9), `qc-beta-xy` (`b2`), `qc-bell-projector` (`bell-circuit:b4`), `qc-stabilizer` (`parities:b4`) and `qc-number-operator` (`b5`).
  - The exception is `qc-operator-tensor` (item 5).
- **Rulings 1 and 3:** ⟨A⊗B⟩ and the grid sit in `q6-tensor`, and HW2 P1(e) sits in `q6-bell-basis`. XZ is a Pauli string and X·Z is a product.
- **Glossary:** no duplicate ids across the 709 glossaries; the one duplicated concept is item 5.
- **Bridges:** `qc-l4-projectors`, `qc-l7-compatible` and `qc-l2-three-bases` resolve. The last is a weak fit for the Bell basis, since 448 has no two-qubit twin; the plan accepts it.
- **Cross-references:** Units 4.2–4.5, 6.5 and 6.6, Q9 (Schmidt rank, "maximally entangled"), Q10 (separable) and Q11 (dense coding) all resolve. Part IX is Error correction.
- **Concept stations:** `concepts.ts:121-126` match plan §11.1.

## Checked and right

- **The many and tensor units:**
  - 4, 8 and 1024 amplitudes; 2³⁰ ≈ 1.07 × 10⁹, which is 16 GiB at 16 bytes per amplitude; 6 dimensions for a qubit and a spin-1.
  - (X⊗Z)₂₄ = −1, and (X⊗Z)\|01⟩ = −\|11⟩.
  - ψ₁ = (0.866, 0.5) gives ⟨Z⟩ = 0.5 and ⟨X⟩ = 0.866. ⟨ZX⟩ = 0.5, ⟨XX⟩ = 0.866 and ⟨ZZ⟩ = 0. r_A = (0.866, 0, 0.5) and r_B = (1, 0, 0), so only T_xx and T_zx are non-zero.
- **The entangled unit:**
  - 14 against 6 parameters, a share of 0.4286; 2046 against 20, a share of 0.98%.
  - det C is ½ for Φ⁺, −½ for Φ⁻, −½ for CZ\|++⟩, and 0 for \|++⟩ and the product state.
  - Singular values: (0.707, 0.707) against (1, 0).
- **The Bell-basis unit:**
  - The Bell basis is orthonormal. T(Φ⁺) = diag(1, −1, 1) and T(Ψ⁻) = −I.
  - \|++⟩ = (½, 0.707, ½, 0) and \|−−⟩ = (½, −0.707, ½, 0) in the triplet-and-singlet basis.
  - \|+−⟩ = 0.707 Φ⁻ − 0.707 Ψ⁻, and the symmetrized state is Φ⁻ = (\|1,1⟩ − \|1,−1⟩)/√2.
  - S_x^tot is the spin-1 S_x (entries ħ/√2) plus a singlet zero.
- **The Bell-circuit unit:**
  - U β_xy = \|xy⟩ with certainty. Π₁₀ has entries ±½.
  - \|0+⟩ gives ¼ for each outcome. Ψ₂ has amplitudes 0.966 and 0.259, and chances 0.933 and 0.067. CNOT β₁₁ has amplitude −0.707 at 11.
- **The parities unit:**
  - U†ZIU = XX and U†IZU = ZZ; UXXU† = ZI and UZZU† = IZ.
  - XX·ZZ = ZZ·XX = −YY. The Bell states give XX = (−1)^x and ZZ = (−1)^y.
  - M̂ = 0, 1, 2, 3 on β_xy, and UM̂U† = diag(0, 1, 2, 3) = 2n̂₁ + n̂₂.
  - ⟨XX⟩ and ⟨ZZ⟩ are 0 and 0 for \|0+⟩, and 0.866 and 1 for Ψ₂.
- **Spoilers and units:** no clue is spoiled by its stage except nit 14. Amplitudes are never shown as percentages. ħ is appended in the text ("0.707ħ", "in units of ħ").
