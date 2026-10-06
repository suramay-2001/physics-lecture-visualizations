# P review: 709 F4 "Eigenvalues, Hermitian and unitary operators" (main 3da8dc5, reviewed 2026-10-07)

Reviewer: independent P verifier (read-only; not the builder). Skill: `skills/06-chapter-review/SKILL.md`.

## Verdict
**FIX-FIRST** (4 blocking, 9 should-fix, 9 nits, plus 2 builder's-language questions).
- **Numbers are right.** Every displayed number and every challenge key except one (item 2) checks out by an independent route. That includes every spectral reconstruction:
  - $\sigma_x = P_{+x} - P_{-x}$, $Z\otimes Z = P_+ - P_-$ and $I = P_{+x} + P_{-x}$.
  - $B^\dagger XB = \mathrm{diag}(1,-1)$, $\sqrt{\tfrac12(I+X)} = P_{+x}$, $e^{-i(\frac12\sigma_z)\pi} = \mathrm{diag}(-i, i)$ and $\sqrt{\mathrm{diag}(4,9)}$.
- **Blocking:**
  - Sixteen of eighteen Try-its are impossible on the shipped widgets (item 1).
  - The HW1 P5(c) challenge is the wrong problem and gives its answer away (item 2).
  - The two eigenvectors are called "at right angles" on Bloch pictures where they are opposite, and one view draws a state that is not an eigenvector (item 3).
  - The Axler Rosetta caption gets the linear slot backwards (item 4).
- **Must-check outcomes:**
  - Characteristic polynomials, eigenpairs, Hermitian ⇒ real/orthogonal, unitary ⇒ $|\lambda| = 1$ and positivity are all stated correctly. The $\sqrt A$ and $e^{-iHt}$ prose is also right.
  - The bridges `qc-f4-eigen` (from Q3) and `qc-f4-spectral` (from F3 ×3) land on real units. F4 itself has no bridges (item 10).
  - Q3's `qc-eigenvalue`, `qc-eigenvector`, `qc-characteristic-equation`, `qc-degenerate` and `qc-spectral-representation` are reused, not redefined.

## Evidence summary
- **`revF3F4-recompute.py`** (scratchpad): 92/92 checks pass for F3+F4. My route: pure-Python index sums and the closed-form 2×2 quadratic, with numpy used only for `svd`/`rank`. It does not use `eigh`, `fromEigen` or the twins' helpers.
  - **Spectra:** ±0.7071 (tr 0, det −0.5, gap 1.4142); $|{+}n\rangle = (0.9239, 0.3827)$ with $Av = \lambda v$ checked; $R$: $\lambda^2+1$, $\pm i$, $R(1,-i) = i(1,-i)$, $R = -iY$.
  - **Degeneracy:** $Z\otimes Z$ is $\pm1$, each of rank 2. The shear has nullity 1.
  - **Single values:** $[[2,i],[-i,2]]$ → 3; $|\langle{+}x|{-}x\rangle| = 0$; $\|H(0.6, 0.8i)\| = 1$; $|\lambda(S)| = 1$; $e^{-i\sigma_z\pi/4} = 0.7071 - 0.7071i$.
  - **Turn angles and commutator:** π/2 rad and 180°; $[X,Z] = -2iY$ (max 2); $[Z, P_0] = 0$.
  - **Singular values and positivity:** shear SVs 2.5616 and 1.5616 ($A^\dagger A$ = [[4,2],[2,5]], top eigenvalue 6.5616); $I+\tfrac12(X+Z)$ → 1.7071, 0.2929; $P_{+x}^2 = P_{+x}$.
  - **Bloch angles:** $|{+}n\rangle$ sits at (45°, 0°) and $|{-}n\rangle$ at **(135°, 180°)**.
- **Vitest:** `claims`, `content`, `symbols` and `bridges` filtered to F3|F4: 185 passed. The twin `f4.py` has its own eigh, phase fix-up, closed-form quadratic and functional calculus. Two twins are weak (item 11).
- **Sources read:**
  - Axler 4e: 5.5–5.8, 5.27, Ex. 5B.11, 5.76, 6.2 (slot convention), 7.1–7.14, 7.18–7.24, 7.29/7.31, 7.34–7.39, 7.44–7.58, 7.70 and 7.93.
  - N&C: pp. 69–72 (Box 2.2) and p. 75 (§2.1.8).
  - Notes: n3 pp. 14–16 and n4 pp. 17–19.
  - HW1 P5 (spin-1, submitted).
  - 448 L3 p. 5 (the live Hermitian homework).
- **Widgets read:** `OperatorAction`, `OperatorBuilder` and `BlochSphere.tsx`. For stage kinds: `operator-space` (a ±â eigen axis, so the eigenvectors sit at opposite ends), `bloch` and `matrix` `spectrum` (the readout "eigenvalues …").

## Blocking
1. **Sixteen of eighteen Try-its are impossible.**
   - **Why:** the plan's §3 widget modes (`operator-space` "eigen", `matrix` "edit-hermitian", "spectral-build", "commutator" and "sqrt") do not exist. The build swapped in existing widgets but kept the plan's steps.
   - **(a) `f4-eigen`** (`F4.ts:133`, operator-action ½(X+Z)): the steps mention an "operator arrow", "shrink it" and "±0.707 bars", none of which exist.
     - *Fix:* "Tick *show eigen-directions*: the readout lists −0.71 and 0.71; drag $v$ onto a line and the widget says it's an eigenvector." / "Set $b = 0$: the lines snap to the axes." / "Press [[2,1],[1,2]]: eigenvalues 1 and 3."
   - **(b) `f4-hermitian`** (`:211`, operator-builder): the widget has no entries, sliders or bars, and it cannot break Hermiticity.
     - *Fix:* `{axis:'y'}`: "Step through $S_y$: the corners are $\mp i$, yet the ✓ Hermitian check holds and the outcomes $\pm\hbar/2$ are real." / "Pick tilt: every angle keeps the ✓."
   - **(c) `f4-spectral`** (`:290`): the eigenvalues cannot be set. At 45° the widget shows $\tfrac\hbar2\sigma_n$; that part is partial credit.
     - *Fix:* "Step 3 *is* the spectral sum $\tfrac\hbar2P_+ - \tfrac\hbar2P_-$; at tilt 45° it rebuilds $\tfrac\hbar2\sigma_n$."
   - **(d) `f4-unitary`** (`:361`, bloch): step 1 works. There is no eigenvalue readout and no x rotation (the buttons are $R_z$ only).
     - *Fix (2):* "Press $R_z(360°)$: the arrow comes home, but both phasors read $-1/\sqrt2$: an overall $-1$."
     - *Fix (3):* "Set θ = 0 and press any $R_z$: $|0\rangle$ never moves; it is an eigenvector of every $R_z$."
   - **(e) `f4-commuting`** (`:440`, operator-action σz): there is one matrix, no pair and no commutator.
     - *Fix:* "Tick eigen-directions: the axes. Press P+z: the same lines (a shared basis). Press σx: the lines turn to ±45°."
   - **(f) `f4-positive`** (`:512`, operator-builder): there is no editing, no bars and no square root.
     - *Fix:* operator-action `{preset:'P+x'}`: "Eigenvalues 0 and 1: none negative." / "Press σz: a −1 appears." / "Press [[2,1],[1,2]]: 1 and 3, positive but not a projector."
2. **`f4-h-gs` ("HW1 P5(c)", `F4.ts:260`) is not HW1 P5(c), its key is not from Gram–Schmidt, and its wording gives the answer.**
   - **The problem:** HW1 P5 is spin-1 in three dimensions. Gram–Schmidt on $|{+}1z\rangle$ against $|{\pm}1x\rangle$ gives $|0x\rangle = (1,0,-1)/\sqrt2$ with $\hat S_x|0x\rangle = 0$, and part (c) asks why GS *had* to land on an eigenvector.
   - **The challenge:** it asks for a spin-½ Bloch θ "on the equator". Every equator point has θ = 90°, so the words give the answer.
   - **The key:** `f4GsAngleDeg = blochAngles(|+x⟩).θ`, which is not a Gram–Schmidt output (F2 item 2 class).
   - **The walkthrough:** `assigned` hides it (`ChallengeCard.tsx:179`) and it is empty (`:269`), although HW1 is submitted.
   - *Fix:*
     - Turn it into a choice on the real (c): "Why must Gram–Schmidt deliver an $S_x$ eigenvector?" The correct option: "$S_x$ is Hermitian, so its eigenvectors are orthonormal and complete; the only direction orthogonal to $|{\pm}1x\rangle$ is the third eigenvector."
     - Drop `assigned`, add a walkthrough, and retire `f4GsAngleDeg`.
     - Do not duplicate F2's spin-1 numeric challenge.
3. **The two eigenvectors are called "at right angles" on pictures where they are opposite** (F2 item 3 class; n2 Fig. 5).
   - **(a) `f4-eigen:b3`** (`F4.story.ts:188–191`): "the $+0.7071$ arrow points at 45° in the x–z plane, the other at right angles to it", and the caption says "two directions at right angles".
     - The stage is `operator-space` (a ±â axis) plus `bloch` at 45°. There the eigenvectors are antipodal: Bloch 45° and (135°, φ = 180°).
     - As states they are at 22.5° and 112.5°.
     - *Fix:* "…its partner points the opposite way on the sphere; as states the two are at right angles (overlap 0)."
   - **(b) `f4-hermitian:b4` views** (`:300` ground, `:304` formal) are `bl({thetaDeg:135, phiDeg:0})`, captioned "the orthogonal direction, at right angles".
     - That point is (0.707, 0, −0.707). It has overlap² **0.5** with $|{+}n\rangle$ and is *not* an eigenvector of ½(X+Z).
     - *Fix:* `bl({thetaDeg:135, phiDeg:180})` with "the $-0.7071$ direction: opposite on the sphere, orthogonal as states". Alternatively draw state space: `hp({psi:{planeDeg:22.5}, others:[{ket:{planeDeg:112.5}, role:'second'}]})`.
4. **`f4-eigen:b1` captionFormal is backwards** (`:153`): "Axler … reads his inner product linear in the SECOND slot, ours in the first".
   - Axler 6.2 (p. 183) is linear in the **first** slot. Ours ($\langle\varphi|\psi\rangle$) is linear in the ket, the second.
   - It also captions an eigen picture with an inner-product fact.
   - *Fix:* "Rosetta: Axler's $T^*$ is our $A^\dagger$; his $\langle u, v\rangle$ is linear in $u$, ours in the ket". Better, move it to `f4-hermitian:b1` and give b1 an eigen caption.

## Should-fix
5. **Notes pages are stale for the revised notes.**
   - **"notes p. 15"** appears at `F4.ts:201,219,280`, `F4.story.ts:278–280,290,339`, `F4.review.ts:31,41` and in the header. Change it to **n4 p. 17**, where the reality proof, orthogonality, $U^\dagger AU$ and the spectral form now are. p. 15 only defines $A^\dagger$.
   - **"notes p. 16"**: for unitary (`F4.ts:354`) cite **n2 p. 9** ($A^\dagger = A^{-1}$, $UU^\dagger = 1$). For commuting (`:433`, story `:527,539,553`) cite **n4 pp. 18–19**, where the compatible-observables theorem and its proof are.
   - **Eigen:** add n4 p. 17 beside n3 p. 14. (`qc709-nc.md` #1 carries the stale p. 15 too.)
6. **Axler 4e numbers come from another edition.** Corrections:
   - "5.5–5.8, p. 133" → pp. 134–135.
   - "5D, 5.27, p. 163, char. poly of a 2×2" → 5.27 is §5B p. 146 (zeros of the *minimal* polynomial). The 2×2 quadratic is **Ex. 5B.11, p. 151**.
   - "7.13, p. 234" → **7.12, p. 233**.
   - "7B, 7.22, p. 243" → §7A, p. 238.
   - "7.24" (normal) → **7.18** (p. 235).
   - "7.29, p. 246, complex spectral theorem" → 7.29 is the *real* theorem (p. 245); the complex one is **7.31, p. 246**.
   - "7.43, p. 251" → **7.34/7.38**, pp. 251–252.
   - "7.44–7.52, the square root" → **7.36, 7.39** (pp. 251–253). 7.44–7.52 are isometries.
   - "7E, 7.51, p. 270" → §7D, **p. 260** (7.53 on p. 261).
   - "7F, 7.58, p. 285" → 7.58 is QR. Use **SVD 7.70 (p. 273)** and **polar 7.93 (p. 286)**.
   - N&C "§2.2 Box 2.2" → **§2.1.6**, Box 2.2, p. 72. The functional calculus is **§2.1.8, p. 75**, not Box 2.2.
7. **`f4-hermitian:b4` derivation slips.**
   - The formal sign (`:290`): $\langle a_2|A|a_1\rangle - \langle Aa_2|a_1\rangle = (\lambda_1-\lambda_2)\langle a_2|a_1\rangle$, not $(\lambda_2-\lambda_1)$.
   - The formal view `mx(½(X+Z), basis [+x,−x])` draws ½(X+Z) unchanged ($H\cdot\tfrac12(X+Z)\cdot H$ = itself) under ⟨±x| labels, so it illustrates nothing.
   - *Fix:* use `basis: [{dir:{thetaDeg:45,phiDeg:0}}, {dir:{thetaDeg:135,phiDeg:180}}]`, which gives diag(0.7071, −0.7071).
8. **`f4-unitary:b5`.** The clue stage (`:502`) shows σx's spectrum readout "eigenvalues −1, 1", which is the reveal's answer; drop `spectrum` there. The reveal formal (`:507`), "The Pauli matrices are *the* Hermitian and unitary 2×2 tables", is false: $H$, $\pm I$ and every $\mathbf n\cdot\boldsymbol\sigma$ also qualify. Say "are examples".
9. **Symbols and terms used before they are taught.**
   - **$H$ has two meanings:** Hadamard (unitary:b1–b2, `f4-u-isunitary`) and a Hermitian generator (unitary:b4, the `f4-s-exp` prompt, the unit insight). Rename the generator $K$.
   - **The determinant:** "its determinant (Chapter F3)" (eigen:b2) points to F3, which never defines it. Give $ad - bc$ inline.
   - **$Z\otimes Z$:** "$Z\otimes Z$ (Chapter F6's language)" (eigen:b4, hermitian:b5, spectral:b4) refers ahead, because F6 follows F4 (`course709.spec.ts:71`). Write $\mathrm{diag}(1,-1,-1,1)$ and say F6 names it $Z\otimes Z$.
10. **F4 bridges nothing.** It has zero `<<…>>` despite 17 lines that mention "Chapter F1/F2/F3". The rulings require bridges to merged prerequisites, and the header ("F2 … not on this branch") is stale.
    - *Fix:* `<<qc-f3-matrix-of-map|…>>` at eigen:b1, `<<qc-f3-change-of-basis|…>>` at spectral:b2 and `<<qc-f2-orthonormal|…>>` at hermitian:b4, plus an F1 bridge at unitary:b3.
11. **Claims and twins that check nothing.**
    - `C.half` (0.5 = 0.5) is the unit claim of all six units.
    - `xzVecMinus` checks only $\|v\| = 1$, which any unit vector passes, and `shearSV` checks only the ordering.
    - The twin `f4SAbsEig` reads $|S_{00}|$, not an eigenvalue, and `f4XZpolyDet` repeats `f4XZdet`'s det route.
    - *Fix:* drop `C.half`, check $Av = \lambda v$ and the SV values, and use `eig` in the twin.
12. **`f4-s-diagonal`** (`F4.ts:324`): "top-left diagonal entry" depends on the eigenvector order. `eigh` is ascending, so it would give −0.7071, but the key is +0.7071. Add "with $|{+}n\rangle$ first" or ask for "the larger diagonal entry".
13. **Glossary:** `qc-polar-decomposition`'s term "polar form" (`F4.glossary.ts:70`) collides with F1's `qc-polar-form`, a complex number. Rename it "polar decomposition".

## Nits
14. `f4-u-isunitary` (`:379`): "½(X+Z): a projector-like Hermitian table". It is not projector-like, since its eigenvalues are ±0.7071.
15. `f4-p-positive`: options σz and [[1,0],[0,−1]] are the same matrix.
16. The `f4-p-svd` hint "6.56" is hand-typed; take it from `d(V.f4ShearSV0**2)`.
17. `F4.review.ts:82` formal trap ("'Same spectrum' is not 'unitary' …") does not parse as a trap.
18. "the hermitian unit's orthonormality" (`F4.story.ts:352,360`) is plan wording.
19. `f4-hermitian:b1` formal says "this unit proves the two facts", but b3 cites the general reality proof rather than proving it.
20. "A complex diagonal entry is never its own conjugate" should say "non-real" (here and in F3).
21. Stale header comments: `F4.story.ts:21–23`, and the glossary header says "no Beat.introduces" while eigen:b1 marks `qc-eigenvalue`/`qc-eigenvector`.
22. The key `f4XZsqrtValLow` is about ½(I+X), not ½(X+Z).

## Builder's-language questions
- `f4-hermitian:b2` proves reality for every 2×2 Hermitian by the discriminant. `qc709-nc.md` #1 says "no derivation in the app" while 448 L3's homework ("You will prove this in homework", L3 p. 5) stands. Is this special-case route acceptable? I lean yes, if b2 says "2×2 only; the general proof is the 448 homework".
- Is "tables" for matrices and "stretch" for an eigenvalue consistent across F3, F4 and Q3? It reads well, but "stretch" also names singular values in positive:b3.

## Checked and right
- Every challenge key except item 2:
  - `f4-e-trace` 2, `f4-e-eigenvalue` 0.7071, `f4-e-defective` 1, `f4-h-realeig` 3, `f4-h-orthogonal` 0.
  - `f4-s-square` 1, `f4-s-rebuild` 1, `f4-s-exp` 0, `f4-u-unitcircle` 1, `f4-u-rotation` 180, `f4-c-commutator` 2, `f4-p-sqrt` 3, `f4-p-svd` 2.5616.
  - Every choice key: quarter-turn; [[1,i],[−i,1]]; $H$; ±1; σz & diag(1,0); commute; $P_{+x}$.
- **Derivations:** each has ≥ 2 distinct views per track. Every step is true except item 7's sign. Each track ends on its stated result.
- **Notation beats:** eigenpair, characteristic equation, degenerate, spectral representation, function of an operator, unit-circle eigenvalues, simultaneous eigenbasis and positive operator each introduce their notation at the beat named in the glossary.
- **The positive unit:** the polar and SVD prose is right ($A = U\sqrt{A^\dagger A}$, singular values = $\sqrt{\mathrm{spec}(A^\dagger A)}$, shown as the operator-space of [[4,2],[2,5]]). So is "positive ⊄ projector", and $I$'s square roots (σx, σz, I, …).
- There is no raw TeX outside `$…$` and no amplitude percentage. No challenge touches HW2, which is on tensor products. There is no HW3.
