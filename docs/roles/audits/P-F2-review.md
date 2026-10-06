# P review: 709 F2 "Vectors and inner products" (main 157556a, reviewed 2026-10-06)

Reviewer: independent P verifier (read-only; not the builder). Skill: `skills/06-chapter-review/SKILL.md`.

## Verdict
**FIX-FIRST** (3 blocking, 5 should-fix, 6 nits, plus 1 builder's-language question).
- **Numbers are right:** every displayed number and all 19 challenge keys check out with an independent numpy route. The vectors, inner products, norms, angles, frames and Gram–Schmidt are all correct, and so is the HW1 P5 spin-1 walkthrough (residual (1, 0, −1)/√2, ‖S_x|0x⟩‖ = 0).
- **Blocking:**
  - All five Try-its are written for a `hilbert-plane` widget, but the `complex-plane` widget ships (item 1).
  - The spin-1 challenge prints its answer in the prompt (item 2).
  - A Formal sentence says orthogonal states are "not opposite in the lab", contradicting n2 Fig. 5 (item 3).
- **Must-check outcomes:**
  - `qc-ket`, `qc-inner-product` and `qc-basis` are reused, not redefined. The new `qc-shadow` duplicates Q1's `qc-projection` term (item 5).
  - The bridges `qc-f1-plane`, `qc-f1-phase` and `qc-f3-change-of-basis` resolve to the right units.
  - The caption/picture mismatches are item 6.

## Evidence summary
- **`revQ14F2-f2.py`** (scratchpad): 75 checks, 0 mismatches against the displayed values and `claims-qc709/f2.json`. My own route: explicit-sum inner products with the bra conjugated, a hand-written classical Gram–Schmidt, and closed forms. It does not use `cmat`, `orthonormalize` or numpy QR.
  - **Vectors:** |+x⟩ = (0.7071, 0.7071); ‖|+z⟩+|+x⟩‖ = 1.8478; N&C Eq. 2.8 holds for a random (a₁, a₂); N&C Ex. 2.1 dependence holds.
  - **Inner products:**
    - ⟨+x|+y⟩ = 0.5 + 0.5i, so ⟨+y|+x⟩ = 0.5 − 0.5i, |·|² = 0.5.
    - ⟨+y|+y⟩ = 1 while the bilinear form is 0.
    - The weighted product (2,1) gives √2.
    - Conjugate symmetry, ket-linearity and bra-antilinearity hold on random vectors.
  - **Norm and angle:** 45° between |+z⟩ and |+x⟩ (and 2 × 45° = 90° on the Bloch sphere); 90° between |+x⟩ and |−x⟩; ‖|+x⟩+|−x⟩‖² = 2 = ‖√2|+z⟩‖²; √2 < 2 and 3 = 1 + 2. The Cauchy–Schwarz split α = cβ + w is orthogonal and Pythagorean.
  - **Frames:**
    - planeDeg 53.13° → (0.6, 0.8), and the amplitudes at θ = 106.26° give 0.6.
    - x-coordinates are 0.9899 and −0.1414, and Parseval gives 1 (0.98 + 0.02).
    - Completeness holds in both frames.
  - **Gram–Schmidt:**
    - (|+x⟩, |+z⟩) → shadow 0.7071, residual (0.5, −0.5), e₂ = |−x⟩.
    - (1, i), (1, 0) → (1, ±i)/√2, orthogonal.
    - (1,1), (2,2) keeps one vector.
  - **HW1 P5 (spin-1):**
    - S_x|±1x⟩ = ±|±1x⟩, ⟨+1x|−1x⟩ = 0, and the three vectors are independent.
    - The GS residual normalizes to (1, 0, −1)/√2, and ‖S_x|0x⟩‖ = 0.
    - The middle eigenvalue is 0, and U is unitary.
    - Part (e)'s probabilities are (¼, ½, ¼).
- **Vitest:** `npx vitest run src/content/qc709`: 68 passed (4 files). The twin `f2.py` uses its own routes (QR, `matrix_rank`, `solve`) and has no matching slips. It shares the flawed `f2GsSpin1Check` (item 4).
- **Sources read:**
  - Axler 4e: 6.2–6.4 (pp. 183–184), 6.7–6.17 (pp. 186–190), §6A Ex. 15 (p. 192), 6.22–6.32 (pp. 197–201).
  - N&C §2.1.1 (pp. 62–63, Eqs. 2.5–2.9, Ex. 2.1) and §2.1.4 (pp. 65–66, Eqs. 2.13–2.17).
  - 709 notes n1 pp. 3–5 (Figs. 2–3, the weighted M) and n2 pp. 6–9 (Gram–Schmidt Fig. 4, Eqs. 1.1–1.2, Fig. 5, completeness).
  - HW1 P5 (submitted, so a full walkthrough is allowed).
  - Offsets: Axler = PDF − 14 and N&C = PDF − 28, both confirmed on the page heads.
  - REVISED L5–L7 is n/a: F2 has phase `'core'` and no lecture source; its own notes citations were checked instead.
- **Widgets and stages:** read from source, with no screenshots and no Playwright (per the brief).
  - The `complex-plane` widget (`widgets/ComplexPlane.tsx`, 448 modes) has three modes: `multiply` (z, w, zw), `powers-of-i` (a button-only i^k coefficient on |−z⟩) and `conjugate` (z, z*, z*z).
  - It has no ket arrows, frames, sums or inner products.

## Blocking
1. **None of the five Try-its can be done on the widget that ships.** Q9/Q11 precedent: a false or impossible tryThis is Blocking.
   - **Why:** the plan's §3 specified a `hilbert-plane` widget (`mode: 'add' | 'angle' | 'components'`). The build substituted `complex-plane` but kept the plan's instructions word for word.
   - **(a) `f2-vectors`** (`F2.ts:151`, `powers-of-i`): "Drag $|{+}z\rangle$ and $|{+}x\rangle$: where is the sum? / Scale one by 2 / Make the sum land on $(1,1)$". The mode has no drag, no kets and no sum.
     - *Fix:* "Press ×i: the second number of $\tfrac1{\sqrt2}(|{+}z\rangle + c|{-}z\rangle)$ runs through $1, i, -1, -i$ — four different kets from one list shape."
   - **(b) `f2-inner-product`** (`:223`, `conjugate`): "Set both to $|{+}z\rangle$ … $|{+}x\rangle, |{+}y\rangle$". There are no kets.
     - *Fix:* "Drag $z$ anywhere: $z^*z$ is never negative. That mirror is why $\langle\psi|\psi\rangle \ge 0$."
   - **(c) `f2-norm-angle`** (`:295`, `multiply`):
     - "At $0°$ and $90°$: $\langle\alpha|\beta\rangle = 0$": no inner product is shown. The `zw` readout is $i$, not $0$.
     - "Make them parallel: triangle equality": no sum is shown.
     - *Fix:* keep step 1 as "read $w$'s angle, $45°$" and replace the other two with angle readings.
   - **(d) `f2-orthonormal`** (`:378`, `conjugate`): "Switch to the x frame". There are no frames.
     - *Fix:* "Set $z = 0.6$, then $z = 0.8$: $z^*z$ reads $0.36$ and $0.64$, which sum to $1$."
   - **(e) `f2-gram-schmidt`** (`:455`, `conjugate`): "Start with $|{+}x\rangle, |{+}z\rangle$ … subtract the shadow". There are no vectors.
     - *Fix:* point the Try-it at the stage ("Scroll the derivation: watch the shadow subtracted"). Alternatively, add the plan's §9.3 `hilbert-plane` widget mode.
2. **`f2-gs-spin1` gives away its own answer, and its key does not come from Gram–Schmidt.**
   - **The spoiler:** the prompt (`F2.ts:504`) says "$|0x\rangle$ satisfies $\hat S_x|0x\rangle = 0$. What eigenvalue of $S_x$ does it carry?". The answer, 0, is in the question, and the name "$|0x\rangle$" gives it away a second time.
   - **The key:** `V.f2GsSpin1` = `eigh(SX1).values[1]`, the middle eigenvalue. Nothing graded comes out of the Gram–Schmidt construction the problem is about.
   - *Fix:*
     - Ask for the construction's own output: "…Gram–Schmidt it and normalize. What is the first z-component of the result?" Answer 0.7071, via a new key `f2GsSpin1E0 = orthonormalize([PLUS1X, MINUS1X, Z1_PLUS])[2][0].re` with a numpy twin. (HW1 P5 part (e)'s P(S_x = 0 | +1z) = 0.5 is an alternative.)
     - Call the result "the leftover $|\chi\rangle$" in the prompt. Keep the walkthrough's "orthogonal to the ±ħ eigenstates ⇒ the 0 eigenstate" argument as the reveal.
3. **One Formal sentence is false and contradicts the source it cites** (`F2.story.ts:254`, `f2-norm-angle:b2`): "Orthogonal in [[qc-state-space|state space]] is not opposite in the lab (notes n2 Fig. 5)".
   - Orthogonal spin-½ states *are* opposite in the lab. n2 Fig. 5 makes exactly this warning: |±x⟩ are opposite spin directions that sit at 90° in state space.
   - The chapter itself says so in the `f2-n-orth` walkthrough ("though they are opposite spins") and in the review trap.
   - *Fix:* "Orthogonal in state space is opposite in the lab, not perpendicular: $|{\pm}x\rangle$ are $90°$ apart here but $180°$ apart on the Bloch sphere (notes n2 Fig. 5)."

## Should-fix
4. **Claims that check nothing, or the wrong thing.**
   - **(a) `f2GsSpin1Check`** (`F2.values.ts:104`) is ⟨v|S_x|v⟩ = 0, an *expectation value*. It cannot tell an eigenvector from a non-eigenvector: |+1z⟩ also gives 0, with ‖S_x|+1z⟩‖ = 0.707. It is also never used.
     - *Fix:* replace it with `f2GsSpin1SxNorm` = ‖S_x·e₃‖ (0) and claim it beside item 2's new key.
   - **(b) `f2Completeness`** tests `[0][0].re === 1` only, with exact float equality.
     - *Fix:* `yes(matEq(madd(…), identity(2), 1e-12))`.
   - **(c) "0.5 + 0.5i" claims only half its number.** The displayed value (`inner-product:b5` reveal; the b2 stage and its conjugate 0.5 − 0.5i) is claimed only through its real part (`f2InnerXY`, "real part again"). The keys `f2InnerXYIm` and `f2InnerYXImNeg` exist, are twinned and are never claimed.
     - *Fix:* add the two claims to b5's reveal and to b2.
   - **(d) A unit-wide claim stands in for every ½:** `f2InnerXY` backs "the shared one-half of this unit's examples" (`F2.ts:210`). The ½ in "$\tfrac12 + \tfrac{i^2}2$" is not ⟨+x|+y⟩'s real part. Name a constant key for it instead, or claim each site.
5. **Glossary reuse: no redefinition of `qc-ket`, `qc-inner-product` or `qc-basis` (good), but two other slips.**
   - **(a) `qc-shadow` (F2) duplicates Q1's `qc-projection`.** Both have the same `term`, "projection (shadow)", and the same concept, so the course glossary lists two identical headwords.
     - Its notation beat (`gram-schmidt:b2`) also comes after "shadow" is already used in `norm-angle:b4`, `norm-angle:b5` and the `orthonormal:b3` derivation.
     - *Fix:* drop `qc-shadow` and tag `[[qc-projection|shadow]]` at first use (`norm-angle:b4`). If F2 must own a notation beat, give it a distinct term ("orthogonal decomposition $\alpha = c\beta + w$") at `norm-angle:b5`.
   - **(b) `norm-angle:b1` Formal links the vector norm to F1's complex modulus** (`[[qc-modulus|norm]]`).
     - *Fix:* use `[[qc-norm|norm]]` (Q1), as the Ground track does.
6. **Three captions describe something other than what is drawn.**
   - **(a) `norm-angle:b1`:** the caption says "$\|{+}x\| = 1$, a unit state", but the stage draws ψ at `planeDeg: 30`, not |+x⟩ (45°).
     - *Fix:* use `psi: '+x'`.
   - **(b) `norm-angle:b6` reveal:** the caption says "parallel: $3 = 1 + 2$; perpendicular: $1.414 < 2$", but the stage is `sumOf: [{planeDeg:0},{planeDeg:0}]`, two unit arrows summing to 2. The perpendicular case is not drawn.
     - *Fix:* caption "parallel: lengths add ($1 + 1 = 2$ drawn; $(1,0)+(2,0)$ gives $3$)". Or draw `sumOf: ['+z','-z']` for the perpendicular case as a split.
   - **(c) `vectors:b5` clue:** the badge "(1,1)" sits on the unit |+x⟩ arrow, which is (1,1)/√2. The reveal's `sumOf: ['+z','-z']` draws the true (1,1).
     - *Fix:* badge "(1,1)/√2 direction", or draw the clue with the same `sumOf`.
7. **The `f2-o-dependent` question gives its answer away by wording** (`F2.ts:414`): "Which **triple** in ℂ² is linearly dependent?", and only one option is a triple.
   - *Fix:* keep the N&C Ex. 2.1 triple and ask "Which coefficients show it?". Options: $(1,-1)+(1,2) = (2,1)$ ✓; $2(1,-1)-(1,2) = (2,1)$ ✗; $(1,-1)-(1,2) = (2,1)$ ✗; "none: it is independent" ✗.
8. **The complex Gram–Schmidt example cannot show what its Formal text claims** (`gram-schmidt:b4`).
   - The text says "the conjugation in ⟨e₁|v⟩ is exactly what keeps the shadow correct". But for (1, i), (1, 0) the bare product gives the same, correct e₂, because v₂'s complex slot is 0 (numpy: ⟨e₁|w_bare⟩ = 0).
   - *Fix:* use (1, i), (0, 1). The conjugated route gives e₂ ∝ (1, −i)/√2. The bare route leaves ⟨e₁|w⟩ = −1.414i ≠ 0, which is the review card's trap, shown live.

## Nits
9. **Citation form:**
   - **Equation numbers written as sections:** "N&C §2.13–2.15", "§2.14", "§2.16" and "§2.17" are equation numbers (`inner-product:b2`, `insightFormal`s, `norm-angle:b1`, `gram-schmidt:b2`). Write "N&C Eqs. 2.13–2.15" and so on.
   - **Axler items:** "Axler §6.2/§6.7/§1.20" are numbered items, not sections. Write "Axler 6.2" (the `books` entries already do).
   - **Page slips:**
     - N&C's spanning-set Eqs. 2.5–2.8 are on p. 63; `vectors:b4` refs say p. 62.
     - n1 Fig. 2 is on p. 4; `vectors:b2` refs say p. 3.
10. **Unclaimed displayed number and an orphan key:**
    - `f2GsUnitE2Neg` (e₂'s −0.7071, displayed in the `f2-gs-second` walkthrough "(0.7071, −0.7071)") is computed but never claimed.
    - `f2IndepXZ` duplicates `f2IndepXZb` and is unused.
11. **Garbled review trap:** the `f2-norm-angle` review Formal trap ("…not the lab's half-angle convention in reverse") is hard to parse.
    - *Fix:* "Orthogonal states are $90°$ apart in state space but $180°$ apart on the Bloch sphere: the Bloch angle is twice the state-space angle."
12. **Symbols ahead of their definitions:**
    - `inner-product:b1` uses a₁, b₁ without tying them to α, β. Add "for $|\alpha\rangle = (a_1, a_2)$, $|\beta\rangle = (b_1, b_2)$".
    - `norm-angle:b1` Formal uses $c_i$ before `orthonormal:b3` defines coordinates.
    - `inner-product:b4` Formal uses † and "Hermitian positive-definite" ahead of F3/F4. Say "a diagonal $M$ with positive entries", as the challenge does.
13. **Bridge only in one track:** the `qc-f1-plane` chip appears only in the Ground track of `norm-angle:b5`. The Formal text names F1's $|z+w| \le |z|+|w|$ without the chip.
14. **Notation beat names its term in one track only:** `vectors:b1` is the notation beat for `qc-complex-vector-space`, but only Formal names or links the space. Ground could say "this list space is called $\mathbb C^2$".

## Builder's-language questions
- **Engine identifiers appear in learner text at 12 sites** (F1 review item 15 flagged the same class; F2 has far more):
  - `bilinear` (`inner-product:b3` Formal and derivation);
  - `weightedInner` (b4);
  - `angleBetween` (`norm-angle:b4` ×2);
  - `isIndependent` (`orthonormal:b1`, `gram-schmidt:b5`);
  - `components` (`orthonormal:b3`);
  - `projectOnto` with the internal tag "F2 shadow" (`gram-schmidt:b2`, glossary `qc-shadow`);
  - `orthonormalize`/`gramSchmidt` (b2 derivation, b3, b5);
  - `eigh` (`f2-gs-spin1` walkthrough 3).
- *Suggested:* delete the parentheticals. For the spin-1 walkthrough, write "Diagonalizing the explicit $S_x$ matrix gives eigenvalues $\hbar, 0, -\hbar$, so this agrees."

## Checked and right
- **Numbers and keys:** every displayed number (0.7071, 1.8478, 0.5 ± 0.5i, 1, 0, 1.4142, 45°, 90°, 2, 3, 0.6/0.8, 0.9899/−0.1414, (0.5, −0.5), (1, ±i)/√2) is right, and so are all 19 challenge keys with their hints and walkthroughs.
- **HW1 P5:** the walkthrough is mathematically right and matches the sheet's parts (b)–(c). The residual is (1/√2, 0, −1/√2), and the Hermitian-orthogonality argument is valid.
- **Rosetta (`inner-product:b2` captionFormal):** correct. Axler's ⟨u, v⟩ is first-slot linear (6.2), so Axler ⟨u, v⟩ = our ⟨v|u⟩. N&C (·,·) = ours, linear in the ket.
- **Axler references:** 6.3(b) weights, 6.4 the Euclidean default, 6.9–6.17, §6A Ex. 15 (ℝ², Ex. 16 for ℝⁿ) and 6.22–6.32 all match the 4e pages cited.
- **Glossary reuse:** `qc-ket` and `qc-inner-product` (Q1) and `qc-basis` (Q2), plus `qc-norm`, `qc-bra`, `qc-dimension`, `qc-orthonormal-basis`, `qc-outer-product` and `qc-completeness`, resolve to their single owners. F2 redefines none, and none appears in an F2 `introduces`. F2's five new ids are unique across `qc709/*.glossary.ts`; only `qc-shadow` repeats a *term* (item 5(a)).
- **Bridges** (registered in `bridges.ts`; targets exist; labels match unit order):
  - `qc-f1-plane` → F1 `f1-plane` (unit 2, "Numbers as points and arrows"; it teaches |z+w| ≤ |z|+|w|);
  - `qc-f1-phase` → F1 `f1-phase` (unit 5);
  - `qc-f3-change-of-basis` → F3 `f3-change-of-basis` (unit 5), in both tracks of `orthonormal:b4`.
  - The return (`ret`) landing was not exercised, since this review ran without a browser.
- **Derivations:** all five derivations have at least 2 distinct views per track. Each view shows its step (bare product → 0, mirrored → 1, shadow and leftover, the x-frame re-read). Every step is true, and both tracks end on the stated result.
- **Notation beats:** `qc-complex-vector-space`, `qc-orthogonal` and `qc-linear-independence` each introduce their term (with nit 14 and item 5(a) as the exceptions).
- **Phase and lint:** the phase is `'core'`/`'books'`/`'clue'`, never `'lecture'`. There is no raw TeX outside `$…$`, no percentages, and no plan ids in learner text (`revQ14F2-lint.py`).
- **Captions:** apart from item 6, every stage matches its caption: |+x⟩ amplitudes, the parallelogram sum, the right angles, the 45° arc, the 53.13° ψ in both frames, and the GS projection.
