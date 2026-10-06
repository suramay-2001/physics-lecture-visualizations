# P review: 709 F3 "Matrices and linear maps" (main 3da8dc5, reviewed 2026-10-07)

Reviewer: independent P verifier (read-only; not the builder). Skill: `skills/06-chapter-review/SKILL.md`.

## Verdict
**FIX-FIRST** (3 blocking, 8 should-fix, 8 nits, plus 2 builder's-language questions).
- **Numbers are right.** Every displayed number and all 17 challenge keys check out by an independent route, and so does every `matrix` stage result.
- **Blocking:**
  - Most Try-its cannot be done: the widgets get props they do not have (item 1).
  - One Ground-up sentence says $X$ swaps x-up and x-down (item 2).
  - One Ground-up sentence says a unitary's adjoint is not its table inverse in a skewed frame (item 3).
- **Must-check outcomes:**
  - Linearity, matrix columns, product order, $H$, projectors, adjoint and $U_{ij} = \langle\alpha'_i|\alpha_j\rangle$ (direction $d = Uc$, inverse $U^\dagger$) are all correct.
  - The `matrix` views (gate, product, adjoint, lin, basis) resolve to the right tables, but they draw only the *result*, never the factors. Items 4(e) and 4(c) follow from that.
  - The bridges `qc-f3-change-of-basis` (used by F2 ×2) and `qc-f3-matrix-of-map` (used by F6 ×2) land on real units. So does F3's own `qc-f2-orthonormal`.
  - The caption/picture mismatches are item 4.

## Evidence summary
- **`revF3F4-recompute.py`** (scratchpad): 92/92 checks pass for F3+F4. My route: explicit index sums in pure Python, with no numpy for F3 and none of the twins' helpers.
  - **F3 checks:** $X|{\pm}z\rangle$, $Z|{-}z\rangle$, $|0\rangle\langle0|(0.6,0.8)$, $H(0.6,0.8) = (0.9899, -0.1414)$, $\langle1|H|1\rangle = -0.7071$, $HX_{00} = 0.7071$, $HXH = Z$, $HZH = X$, $XZ = -ZX$, $[X,Z] = -2ZX$, $X^2 = H^2 = I$, $S^\dagger$, $(XZ)^\dagger = ZX$, Hermiticity of $X, Y, Z, H$ (and not $S$ or $\mathrm{diag}(1,2i)$), $S^\dagger S = I$.
  - **Change of basis:** $U$ is built row by row from $\langle\text{new}_i|\text{old}_j\rangle$ and equals $H$. Also $\langle{+}x|{+}z\rangle$, $UZU^\dagger = X$, $UXU^\dagger = Z$, $U^\dagger U = I$, and the stage's $B^\dagger ZB$ equals $UZU^\dagger$.
- **Vitest:** `claims`, `content`, `symbols` and `bridges` tests filtered to F3|F4: 185 passed. The twin `f3.py` builds every gate by hand and $U$ from overlaps, with no matching slips. Its comment has one slip (nit 16).
- **Sources read:**
  - Axler 4e: 3.4–3.9 (pp. 54–56), 3.31–3.32 (pp. 69–70), 3.41 (p. 73), 3.79–3.83 (pp. 90–92), 7.7 and 7.9 (pp. 231–232, the margin caution).
  - N&C: §2.1.2 (p. 63, Eq. 2.10) and §2.1.6 (pp. 69–70: Eq. 2.32–2.34, Ex. 2.13–2.15).
  - Notes: n2 pp. 8–10 (§I.C.4, §I.D, §I.D.1) and n3 pp. 15–16, plus n4 p. 17.
  - Offsets confirmed: Axler = PDF − 14, N&C = PDF − 28.
  - F3 has phase `'core'` and no lecture of its own, so "REVISED L5–L7" means its notes citations, which were checked.
- **Widgets and stages:** read from source, with no Playwright, per the brief.
  - `OperatorAction.tsx`: props `a, b, d, preset`, real symmetric only.
  - `OperatorBuilder.tsx`: prop `axis` only; it builds $S_n = \tfrac\hbar2(P_+-P_-)$.
  - `BasisTranslator.tsx`: props `target, mode, operator, theta, phi`.
  - `stage/svg/matrix.ts` and `MatrixScene.tsx`: a cell's hue is its phase. `product`, `adjoint` and `lin` resolve to one grid; `basis` draws $B^\dagger MB$.

## Blocking
1. **Nine of fifteen Try-its are impossible on the widget that ships, and the intended setup never loads.**
   - **Why:** the plan's §3 specified a `matrix-builder` widget with `compose`, `showDagger` and `basis` modes, which does not exist. The build kept the plan's props (`op`, `compose`, `showDagger`, `basis`), which every widget ignores, and kept its wording.
   - Same class as F2 item 1 and Q11–Q13.
   - **(a) `f3-linear-maps`** (`F3.ts:141`, operator-action):
     - Steps 1 and 2 work. The widget's default happens to be $X$, and it has a σz preset.
     - Step 3 ("square the amplitudes … check homogeneity") cannot be done: the widget only applies a linear matrix to a *unit* vector.
     - *Fix:* "Press P+z: the projector keeps the up part of every arrow, and it is still a matrix, so it is linear."
   - **(b) `f3-matrix-of-map`** (`:208`, operator-builder; `op:'H'` is ignored, so the axis is x):
     - It builds $\tfrac\hbar2 X$ from projectors, never "column by column", and never shows $H$.
     - *Fix:* use props `{axis:'x'}`.
       - "Step to the end: the table is $\tfrac\hbar2$ times $X$; read column 0, $(0, 1)$."
       - "Pick tilt, set 45°: the table is $\tfrac\hbar2$ times $H$."
       - "Read the top-right entry: $\tfrac\hbar2\langle0|X|1\rangle$."
   - **(c) `f3-products`** (`:263`): none of "Multiply $H\cdot X$", "Sandwich $HXH$" or "Compare $XZ$, $ZX$" is possible. The widget multiplies nothing, and $XZ$ is not symmetric, so it cannot even be entered.
     - *Fix:* point the Try-its at the stage ("Scroll b1–b3: watch $HX$, then $HXH = Z$, then $XZ$"), as F2 fix 1(e) did, or drop the widget.
   - **(d) `f3-adjoint`** (`:329`; `op:'S'` and `showDagger` are ignored, so it shows $X$): the widget has no dagger control and no complex entries. All three steps are impossible.
     - *Fix:* operator-builder `{axis:'y'}`: "Step through $S_y$: the corners are $-i$ and $+i$, mirror images, and the ✓ $S_y^\dagger = S_y$ check passes."
   - **(e) `f3-change-of-basis`** (`:402`; `op` and `basis` are ignored, so it opens in *state* mode):
     - "Draw $Z$ in the z frame" is impossible: the widget never shows an operator's z-frame table.
     - *Fix:* props `{target:'x', mode:'operator', operator:'Sz'}` (the Q2 precedent, `Q2.ts:478`).
       - "$S_z$ in the x basis is $\tfrac\hbar2$ times $X$."
       - "Switch to $S_x$: it turns diagonal, $\tfrac\hbar2 Z$."
       - "Switch the basis to y: $B_{z\leftarrow y} \ne B_{y\leftarrow z}$."
2. **`f3-products:b2` Ground-up is false** (`F3.story.ts:331`): "flipping x-up and x-down (that is $X$) looks, after the Hadamard change, exactly like flipping the sign of the down state ($Z$)".
   - $X$ swaps $|0\rangle \leftrightarrow |1\rangle$ and *fixes* $|{+}x\rangle$: $X|{\pm}x\rangle = \pm|{\pm}x\rangle$. It is $Z$ that swaps $|{\pm}x\rangle$.
   - *Fix:* "So swapping up and down (that is $X$) looks, in the x frame, exactly like flipping the sign of the down state ($Z$)."
3. **`f3-adjoint:b4` Ground-up is false** (`:450`): "In a skewed frame … a unitary's mirror is not its table inverse."
   - $U^\dagger = U^{-1}$ as maps, so in *any* basis $\mathcal M(U^\dagger) = \mathcal M(U^{-1}) = \mathcal M(U)^{-1}$.
   - What fails is the conjugate transpose of the table, which (Axler's caution, p. 232) need not equal the table of $U^\dagger$.
   - *Fix:* "…and a unitary's table, conjugate-transposed, need not give back its inverse."

## Should-fix
4. **Captions that do not match their pictures** (each read against the kind's code):
   - **(a) `f3-linear-maps:b4`** (`:144–145`): the caption says "$I|{+}x\rangle = (0.7071, 0.7071)$", but the stage is `hp({psi:{planeDeg:30}})`, a 30° state that the image readout prints as (0.866, 0.5). The 0.7071 is also hand-typed.
     - *Fix:* `psi: '+x'`, with the number taken from `d(V.f3Identity)`.
   - **(b) `f3-linear-maps:b5` reveal** (`:163–164`): the two ghosts are both at `planeDeg 0` with two badges. The plane draws unit directions only, so the arrows coincide, the badges collide, and "(2,0)→(4,0)" is not drawn.
     - *Fix:* keep only ψ, and put the numbers in the caption alone.
   - **(c) `f3-matrix-of-map:b3` formal** (`:249`): "these are all real, so no hue shows". This is false. Hue is the phase (`phaseHue.ts`): positive cells are cyan (215°), and $H$'s $-1/\sqrt2$ and $Z$'s $-1$ draw at phase π (hue 35°).
     - *Fix:* "…all real, so only two hues show: one for $+$, one for $-$ (phase π)."
   - **(d) `f3-change-of-basis:b1` ground step 2** (`:497`): the viewCaption "$|0\rangle$'s new coordinates $U(1,0)$" sits under `amp(K('0'))`, which draws the *old* coordinates (1, 0). The amplitudes kind has no basis option.
     - *Fix:* "$|0\rangle$'s old coordinates $c = (1, 0)$".
   - **(e) `f3-products:b3`** (`:346`): "$XZ$ and $ZX$ differ by a sign", but the stage draws only $XZ$.
     - *Fix:* `split(mx(prod(gate('X'),gate('Z'))), mx(prod(gate('Z'),gate('X'))))`.
5. **`f3-change-of-basis:b4` formal labels the wrong product** (`:551`). $\sum_k\langle\alpha'_i|\alpha_k\rangle\langle\alpha_k|\alpha'_j\rangle$ is $[UU^\dagger]_{ij}$, which is what notes n2 p. 9 write. It is not $[U^\dagger U]_{ij}$.
   - I checked this entrywise with the complex y frame.
   - *Fix:* write $[UU^\dagger]_{ij} = \dots = \delta_{ij}$, "so $U^\dagger U = I$ too (a square matrix)".
6. **`f3-m-act` walkthrough conflates a gate with a change of frame** (`F3.ts:245`): "since applying $H$ IS changing to the x frame". This contradicts `f3-change-of-basis:b2` ("The map itself is unchanged").
   - *Fix:* "…the same number as the x-frame coordinate, because the z→x matrix $U$ happens to equal $H$. Applying a gate moves the state; changing frame only renames it."
7. **`f3-change-of-basis:b3` Ground-up** (`:537`): "Measuring spin along z, seen by someone using the x frame, looks like a spin along x." This says the observable changes.
   - *Fix:* "Spin along z, written in the x frame, has the same table that spin along x has in the z frame."
8. **Citations:**
   - `f3-linear-maps:b2` (`:119`): "Axler Eq. 3.5" should be **3.4** (the linear map lemma, p. 54). 3.5 defines sums of maps.
   - `f3-adjoint:b2` (`:428`): "N&C §2.1.6, Eq. 2.13–2.15" should be **Exercises 2.13–2.15** (p. 70). Eqs 2.13–2.15 are in §2.1.4; antilinearity is Eq. 2.33.
   - `f3-adjoint:b3` (`:440`): "the notes prove the reality on p. 15" should be **notes n4 p. 17**. In the revised notes, p. 15 only defines $A^\dagger$ and p. 16 argues observable ⇒ Hermitian. The ruling text in `qc709-nc.md` #1 carries the stale page too.
9. **Duplicate glossary terms** (F2 item 5 class):
   - `qc-matrix-of-map` ("matrix element $A_{ij}$") has the same term as Q2's `qc-matrix-element`.
   - `qc-change-of-basis` ("change-of-basis matrix $U$") has the same term as Q2's `qc-change-of-basis-matrix`.
   - `qc-hermitian` duplicates Q1's `qc-hermitian-matrix`.
   - *Fix:* reuse Q2's two ids, as F3 already does for `qc-adjoint` and `qc-unitary`, and repoint the `introduces`. Alternatively rename the F3 terms, e.g. "matrix of a linear map $\mathcal M(A)$", and add `uses` links.
10. **Symbols before use are not really checked.** Every F3 symbol is registered at `F3.outcomes[0]`, which contains none of them (`F3.ts:32` says so).
    - **$S$ has two meanings:** a generic map in `f3-products:b1` ($(ST)_{jk}$) and the phase gate in `f3-adjoint`.
    - **$Y$:** Ground-up `f3-adjoint:b3` names $Y$ but never gives it.
    - **"Determinant" and "trace":** `f3-change-of-basis:b2` uses both, undefined.
    - *Fix:* use $A, B$ for generic maps in the product, add $Y$'s table at adjoint:b3, and register each symbol at its real first site.
11. **A review-card claim backs the wrong statement** (`F3.review.ts:76,80`). "Each of $H$'s own $0.7071$ entries mirrors itself" is claimed with `C.hx` ($HX$'s (0,0) entry), and $H$ also has a $-0.7071$.
    - *Fix:* drop the point, or say "$H^\dagger = H$" with `C.hdag`. Do the same for the filler point at `:65` ("$HX$'s own (0,0) entry … enters that same product").

## Nits
12. `f3-adjoint:b3`: "the Pauli gates $X$, $Y$, $Z$ and $H$". $H$ is not a Pauli gate; say "the Pauli gates and $H$".
13. `f3-change-of-basis:b5` reveal: "mirror images under the Hadamard" clashes with "mirror" = adjoint. Say "swapped by the Hadamard".
14. `f3-products:b3`: "Two gates that do not commute cannot be measured together sharply". It is observables that are measured.
15. Smaller wording fixes:
    - "the products unit" (`:539`, `:567`) is plan wording; use "Hadamard sandwich, above".
    - The `f3-l-linear` option $|a|$ has a why-text that is odd ("never sends a vector to its negative"). Better: "$f(-v) = f(v) \ne -f(v)$".
    - In "$\mathrm{diag}(1,2i)$: a complex diagonal entry", say "non-real".
16. `f3.py:70`: "U's columns are just the new basis bras". It is the *rows*, since $U_{ij} = \langle\text{new}_i|\text{old}_j\rangle$.
17. `f3-adjoint:b4` reuses b3's $H^\dagger$ picture, so no skewed frame is shown. That is acceptable, but the caption cannot be seen in it.
18. `F3.ts:29`: the prerequisites comment ("F2 … not yet registered") is stale now that F2 has merged. Tighten it to F2's own stations.
19. No Formal derivation step carries a `viewCaption`. That is harmless if the W-709 #7 lint does not need one, but Ground-up has them all.

## Builder's-language questions
- "Mirror" for the adjoint is fine in Ground-up, but it is also used for "mirror images" (item 13) and F1's conjugate mirror. Should one word be kept for one meaning?
- "Right-angled frame" for an orthonormal basis: acceptable, and the chapter does link it to `qc-orthonormal-basis`.

## Checked and right
- Every challenge key and walkthrough:
  - `f3-l-act` 1, `f3-l-proj` 0, `f3-m-entry` 1, `f3-m-hadamard` −0.7071, `f3-m-act` 0.9899, `f3-p-hxh` −1, `f3-p-inverse` 1.
  - `f3-a-sdag` −1, `f3-a-unitary` 1, `f3-cb-coord` 0.7071, `f3-cb-zinx` 1, `f3-cb-unitary` 1, `f3-cb-xinx` 1.
  - Every choice key: (b,a), $XZ = -ZX$, $Y$, $ZX$.
- The `matrix-of-map:b5` clue uses `values:'none'`, so nothing is spoiled. Its reveal readout is "(0, 1) = 1".
- Derivations: each has ≥ 2 distinct views per track, and every step is true. One label is wrong (item 5). The $B^\dagger AB$ form with $U = B^\dagger$ is right and matches `changeU` and `applyBasis`.
- Notation beats: `qc-matrix-of-map`, `qc-matrix-product` and `qc-change-of-basis` each introduce their notation. Q2/Q3's `qc-linear-operator`, `qc-outer-product`, `qc-unitary` and `qc-adjoint` are reused, not redefined.
- There is no raw TeX outside `$…$` and no amplitude percentage. The lint hits were all `${d()}` template artifacts.
