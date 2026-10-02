# P review: 709 Q2 "Coordinates, bases and turning frames" (merge b14f5ba; reviewed 2026-10-02)

**Verdict: FIX-FIRST.** The engine values are all right: 66 keys were recomputed independently and agree. Three things a
learner reads are false: one displayed complex number, one review-card equation, and one Ground-up reason. Against the
revised notes, Q2's citations need one page fix (Lecture 2 did not move). Under the two new standing rules, every
derivation needs a second view and seven notations need a beat. The plans for both are below.

Evidence (scratchpad `revQ2Q3-*`):
- **Numbers:** `revQ2Q3-recompute.py`, the reviewer's own numpy route (explicit matrices, `lstsq`, `matrix_rank`, a
  hand-written Gram–Schmidt). 66 Q2 keys agree with `claims-qc709/q2.json` to 1e-9.
- **Challenges:** all 20 answers and every hint were re-derived by hand.
- **Display bugs:** two were confirmed live on the dev server (`#/709/ch/Q2`, Formal track) by reading the KaTeX
  annotations. A normal load, track switch and scroll gave 0 console errors.
- **Citations:** `revQ2Q3-cites.py` and `revQ2Q3-snip*.py` looked up every book citation in the source text layers
  (Axler PDF − 14, N&C PDF − 28, Bergou's per-chapter table from P-709-map E1). The notes citations were checked
  against the revised `qc709-n2` text.
- **Not re-run (economy):** the full contact sheets and the live out-and-back for each bridge. Instead, the 9 bridge
  ids (10 links) were resolved in `bridges.ts`, and every "Spin Lab N.M" label was checked against 448's unit order.

## Blocking

1. **A displayed amplitude has the wrong sign** (`q2-photon:b4` captionFormal, `Q2.story.ts:605`).
   - The live page shows "|R′⟩ = e^{−i45°}|R⟩ = (0.500 −0.500i, 0.500 + −0.5i)".
   - The second entry is 0.5 **+ 0.5i** (`q2Rp45Im1` = +0.5, and the claim on the same beat says so). The template
     prints `d(-V.q2Rp45Im1, 1)`.
   - *Fix:* `${d(V.q2Rp45Re1)} + ${d(V.q2Rp45Im1)}i` for the second entry and `${d(V.q2Rp45Re0)} - ${d(-V.q2Rp45Im0)}i`
     for the first, so neither shows "+ −" or "−0.500i".
2. **A false equation on the photon review card** (`Q2.review.ts:110`, rendered live).
   - The Formal trap reads "spin's cos²(χ/2) → cos²(45°) = 0.8536 at the matching Bloch angle".
   - cos²45° = 0.5. The 0.8536 is cos²22.5°, a magnet tilted by the **same** 45°.
   - "At the matching Bloch angle" is also wrong: a 45° photon turn matches a 90° tilt on the sphere, where spin also
     gives 0.5. The labels of claim `q2Spin45` (`Q2.story.ts:652`, `Q2.review.ts:116`) repeat the phrase.
   - *Fix:* "light's $\cos^2 45° = 0.5$, but a magnet tilted by the same 45° passes $\cos^2 22.5° = 0.854$". Relabel
     both claims "spin at the same 45° tilt".
3. **The Ground-up reason for δ₊ = 0 is false** (`q2-spin-space:b3` text, `Q2.story.ts:270`, taken from plan
   `P-Q2-story.md:190`).
   - The beat says "turning both amplitudes together changes nothing (F1), **so** the notes may take δ₊ = 0".
   - A global phase cannot change δ₊: e^{iγ}(α, e^{iδ₊}β) keeps the relative phase δ₊. That is exactly the global versus
     relative distinction that F1's fifth unit teaches.
   - The global phase only makes α real. δ₊ = 0 is the choice of which point on the equator is called +x (δ₊ = 90°
     would put "+x" where |+y⟩ is).
   - The Formal track is right ("δ₊ = 0 with α real is the convention").
   - *Fix:* "Turning both amplitudes together changes nothing (F1), so the first can be real. Which point on the equator
     we call +x is our choice: the notes take δ₊ = 0. Then |−x⟩ has no choice left…"

## Should-fix

4. **Internal erratum ids in learner text.** The errata box shows no ids (`LecturePage.tsx:279`), so these labels point
   at nothing:
   - "(N4; …)" at `Q2.story.ts:466` and "(N5)" at `:476`;
   - "(N4, N5)" at `Q2.review.ts:93`;
   - "(N4)" at `Q2.ts:504` and "(N5's index order)" at `:526`.
   - *Fix:* write "(see the errata box)".
5. **`q2-gram-schmidt:b4`: a three-dimensional text on a two-dimensional stage.**
   - Its stage is b3's stage exactly (`Q2.story.ts:194` = `:183`), the 60° pair in the plane, while the text walks the
     (1,1,0), (1,0,1), (0,1,1) example "as in Fig. 4".
   - Fig. 4 is on notes **p. 7**, not p. 6 (`:191`). Fig. 4 has no numbers, yet the claim labels say "Fig. 4's
     residual" (`:196–197`).
   - *Fix:* use a `matrix {coef}` view of the three columns (see D-views). Cite "pp. 6–7, Fig. 4". Relabel the claims as
     "the 3D example's".
6. **The generator gloss clashes with the chapter's U(χ)** (`Q2.glossary.ts:153`).
   - The gloss says "U(χ) = e^{−iJ_zχ/ħ}". In b2 Formal, U(χ) = (cos χ, sin χ; −sin χ, cos χ) is the coordinate table,
     which equals e^{+iJ_zχ/ħ} (its transpose). The operator that turns |x⟩ into |x′⟩ is e^{−iJ_zχ/ħ}
     (`q2FrameExp`).
   - *Fix:* "e^{−iJ_zχ/ħ} turns the frame (|x⟩ → |x′⟩); the coordinate table U(χ) is its inverse".
7. **Photon amplitude bars show |0⟩, |1⟩ before Ground is told |0⟩ = |x⟩.**
   - b3, b4, b5 and b7 use `labels: 'bits'` (`:592, 606, 634, 662`). In Ground, |0⟩ = |H⟩ = |x⟩ is first said at b6. In
     Formal, only b1's Rosetta caption says it.
   - *Fix:* add `labels: 'photon'` to `amplitudes`, as S1 did for `hilbert-plane` (preferred). Otherwise add one Ground
     clause at b3.
8. **Book citation.** Axler 3.29–3.31, p. 69 is cited for "reading amplitudes as overlaps in an orthonormal basis"
   (`Q2.ts:342`). Those items define a matrix and the matrix of a linear map. Overlaps as coefficients are Axler 6.30,
   p. 200. *Fix:* cite 6.30, p. 200.

## Nits

9. **Hand-typed numbers, outside the file's own d() rule.** Every value is right (recomputed), but none is printed from
   `V`:
   - "1.414" (`:344, 346, 347`);
   - "(0.5, 0.866)" (`:155`);
   - "(0.5, −0.5i)" (`:206`);
   - "0.5" (`:319, 591, 646`);
   - the options of `q2-g-order` (`Q2.ts:326–327`);
   - "−0.5" (`Q2.ts:575`);
   - "(1/6, −1/6, 1/3)" (`Q2.ts:315`).
10. **`q2-p-spin` gets light's value from the spin value** (`Q2.ts:564`): the walkthrough prints `1 − V.q2PSpin60`. This
    equals cos²60° only by coincidence. *Fix:* use `V.q2PMalus60`.
11. **`q2-change:b5` Ground** says S_z's x-basis table "swaps the two numbers". The diagonal (½, −½) does not swap: it
    moves off the diagonal as (½, ½). Say "moves off the diagonal".
12. **`q2-photon:b7` reveal:** "no preferred direction to turn" should be "no preferred transverse axis". Circular light
    does have a sense of rotation.
13. **TeX outside `$…$`:** "e^{−iχ}" in a `q2-p-phase` hint (`Q2.ts:574`) and "J_z" in the Ground insight (`:540`)
    render as raw text.
14. **`q2BergouOverlap`** (B35, 0.625) is computed and claimed but shown nowhere. That is allowed by ruling Q2-3; tag it
    for Q24, or drop it.

## Notes alignment (revised notes, Lecture 2, pp. 6–10)

- **Lecture 2 is unchanged by the revision.** Every unit-level citation is right:
  - p. 6; pp. 6–7 with Fig. 4;
  - pp. 7–8 with Eqs. 1.1–1.2 and Fig. 5;
  - p. 10 with Fig. 6;
  - pp. 8–9 with Eq. 1.3;
  - p. 9.
- **Beat-level citations:** 27 checked. The only wrong page is `gram-schmidt:b4` (item 5: Fig. 4 is on p. 7).
- **Errata:** all three are still present in the revised text: Eq. 1.3's (c₂ − c₁), the bracket ⟨α_j|α′_i⟩ on p. 9,
  and "onto" on p. 10. Their `check()`s test their own claims.
- **Missing [L] beats: none.** The revised Fig. 4, 5 and 6 captions (the 3D Gram–Schmidt, state angles versus space
  angles and the real slice, a rotation times a scaling) are all covered: by b4 (after item 5), by `spin-space:b5`, and
  by `operators:b2`.

## Derivation views (standing rule: ≥ 2 distinct views per derivation, in both tracks)

The `matrix` field names below are provisional; W's API for the kind is still in build. ψ is the chapter's arrow at 30°.

- **D1, the uniqueness of components** (`basis:b3`). Ground has 5 lines; Formal has 1 line, which must be split in two.
  - G1–2 (two recipes): `hilbert-plane {psi:{planeDeg:30}, basis:'z', shadows:true}`, showing 0.866 and 0.5.
  - G3–4 (a zero mix, then independence): `hilbert-plane {psi:'+x', others:zBasis, sumOf:['+z','-z']}`. This is b1's
    dependent picture, the only way a non-zero mix can give 0.
  - G5: `matrix {coef:{ket:{planeDeg:30}}, rows:['|+z⟩','|−z⟩']}`: one column, one recipe.
  - Formal: F1 "Σ(c_i − c′_i)|e_i⟩ = 0" goes to view 2, and F2 "⇒ c_i = c′_i" to view 3.
- **D2, c′ = Uc** (`change:b1`; 6 Ground lines, 2 Formal).
  - G1: plane, basis z, shadows (c).
  - G2–3: `hilbert-plane {psi:{planeDeg:30}, basis:'x', shadows:true}`, giving 0.966 and 0.259.
  - G4–5: `matrix {gate:'H', rows:['⟨+x|','⟨−x|'], cols:['|+z⟩','|−z⟩'], highlight:[[0,0],[0,1]]}`.
  - G6: `matrix {coef:{ket:{planeDeg:30}, basis:'x'}}`.
  - Formal: F1 goes to view 2, and F2 to view 3 with row i lit.
- **D3, A′ = UAU†** (`change:b5`; 7 Ground, 2 Formal).
  - G1: `matrix {gate:'Sz'}` with |±z⟩ labels.
  - G2: `matrix {outer:['+z','+z']}`, then G3: `matrix {gate:'I'}` (Σ|i⟩⟨i| = I).
  - G4–6: `matrix {gate:'H', highlight:row k}` for the U entries, with the conjugated column lit for U*_lj.
  - G7: the current `hilbert-plane … image:{named:'Sz'}`, plus `matrix {gate:'Sz', basis:'x'}` = (½)(0 1; 1 0).
  - Formal: F1 goes to `matrix Sz` with A_ij lit, and F2 to the x-basis table.
- **D4, |R′⟩ = e^{−iχ}|R⟩** (`photon:b4`; 6 Ground, 2 Formal).
  - G1: b2's photon plane (the frame turned 45°).
  - G2: `complex-plane {z:{re:.707,im:-.707}, w:{re:.707,im:.707}, show:['parts']}`, the two coefficients.
  - G3: the same, with `show:['product','arc']` (w = i·z, a quarter turn).
  - G4: `complex-plane {z:{re:.707,im:-.707}, circle:true, show:['arg']}` (e^{−i45°}).
  - G5–6: the current `amplitudes … globalPhaseDeg: sweep(0,−45)`.
  - Formal: F1 goes to view G3, and F2 to the amplitudes.
- **Proofs the notes give that Q2 does not mark as derivations.** Under the rule these become D5–D7, each with views:
  - **The unitarity proof** (p. 9, `change:b4` Formal): `matrix {outer:['+x','+x']}`, then `{outer:['-x','-x']}`, then
    `{gate:'I'}` (completeness), then `matrix {gate:'H'}` (UU† = I).
  - **δ₋ is forced** (`spin-space:b3`): `complex-plane {z:1, w:{phase δ}, show:['sum']}` with δ swept from 0 to 180°. The
    sum ½(1 + e^{iδ}) shrinks to 0 at 180°. Then the current `amplitudes {dir:'-x'}`.
  - **The leftover is orthogonal** (`gram-schmidt:b2`): the current `project:2` plane, then
    `matrix {coef}` of α′₁ and α′₂ with ⟨α′₁|α′₂⟩ = 0 lit.

## Notation beats (standing rule: one introducing beat, a stage view and a caption in both tracks)

| New space or notation | Introducing beat | Visual |
|---|---|---|
| V^n(F) and its dimension; V²(ℂ) and its real slice (spaces) | `basis:b2` | the current `hilbert-plane` with the `qc-plane-vectors-not-states` fidelity line; tag `introduces` |
| Components as a column (c₁, c₂) | `basis:b3` | `matrix {coef}` next to the plane |
| δ_ij | `basis:b4` | `matrix {gate:'I'}` labelled with ⟨e_i\|e_j⟩ |
| ℝ³ (the 3D Gram–Schmidt example) | `gram-schmidt:b4` | `matrix {coef}` of three columns (item 5) |
| Linear operator A: V → V | `operators:b1` | the current plane image |
| Outer product \|α⟩⟨β\| | `operators:b4` | `matrix {outer:['+z','+x']}`, with phase colour and ket/bra labels (today it is a plane image only) |
| A_ij table, f = Âc | `operators:b5` | `matrix {gate:A, highlight:[[0,1]]}` |
| U_ij and † | `change:b2`, `change:b4` | `matrix {gate:'H'}`; for †, the z → y table and its mirror with conjugated cells lit (this also shows N5) |
| Completeness Σ\|α_k⟩⟨α_k\| = I | `change:b4` | two `outer` tables summing to I |
| The photon space span{\|x⟩, \|y⟩}; \|R⟩, \|L⟩ | `photon:b1`, `photon:b3` | the current photon plane; `amplitudes` with photon labels (item 7) |
| J_z, e^{−iJ_zχ/ħ}, helicity | `photon:b5` | the amplitudes phase sweep, plus `matrix {gate:σ_y}` as J_z/ħ |

Ownership of † must be settled across chapters. Q2 uses U† first, but `qc-adjoint` is glossed in Q3. The proposal: Q2
introduces † on matrices (`change:b4`), and Q3 `observables:b4` introduces the adjoint operator.

## Builder's language questions
- None are recorded in BUILD-LOG or in the Q2 commit messages (eaa141c, 213e546, b14f5ba).

## Checked and right

- **Numbers:** 66 of the 148 keys were recomputed independently and match. The rest are booleans and repeats of those
  values.
  - In prose: 0.866/0.5, 0.966/0.259, (−1, 1.414) against overlaps (0, 0.707), 0.933/0.067, the printed −0.259, and
    U†(0.966, −0.259) = (0.5, 0.866), which gives P(+z) = 0.25 instead of 0.75.
  - Gram–Schmidt: (0.5, −0.5, 1), (−⅔, ⅔, ⅔), 1.5, (0.866, −0.5).
  - Operators: A|ψ⟩ = (0.366, 1.366) and |+z⟩⟨+x|ψ⟩ = 0.966.
  - S_zψ in x = (0.129, 0.483); U S_z U† = S_x.
  - Photon: det H = −1, det U(45°) = +1, J_z|R⟩ = +ħ|R⟩, Malus 0.25 and 0.5, spin 0.75 and 0.854, ⟨R|R′⟩ = −i.
- **Challenges:** all 20 keys, hints and walkthroughs are right. N5's index order in `q2-c-dagger` checks out:
  [U†]₂₁ = ⟨−z|+y⟩ = i/√2.
- **Derivations:** D1–D4 are true and in order in both tracks, and each ends on its stated result.
  - The `why`s are fair.
  - D3's U*_lj = ⟨j|l′⟩ step is right.
  - D4's i(cos χ − i sin χ) step is right.
- **Errata:** the three corrections are real and in the notes' voice. The rulings are met:
  - Q2-1: the unit order;
  - Q2-2: D2 and D3 kept, with the Rosetta U = B†. This was checked against 448 L5's B_{z←x}, whose columns are the new
    kets;
  - Q2-3: no formula from Bergou p. 257 is shown;
  - Q2-4: S1 and S2 are used;
  - Q2-5: N19 is silent.
- **Citations:**
  - Axler 2.15 p. 32, 2.28 p. 39, 2.35 p. 44, 6.27–6.30 pp. 199–200, 6.32 p. 201, 3.31 p. 69, 5.1 p. 133, and 3.82–3.84
    pp. 92–93.
  - N&C Ex. 2.8 p. 66, Eqs. 2.12 p. 64 / 2.25 p. 68 / 2.22 p. 67, Eq. 1.19 p. 22 (the correct sign), and Ex. 2.20
    p. 71.
  - Bergou Eq. 1.8 p. 4. Bergou p. 257 gives |0⟩ = |H⟩ inside §14.2, whose running head is "Probabilistic CNOT Gate";
    the citation stands.
- **Bridges:** all 9 ids (10 links) resolve. The labels Spin Lab 1.3, 2.2, 2.5, 3.1, 4.1, 5.3 and 5.4 match 448's unit order.
- **Arcade:** the five spot-the-error rounds have the right wrong step and a true `why`.
- **Homework:** none is open (HW1 and HW2 are submitted), and no 448 assigned challenge is worked.
- **Widgets:** the `projector` widget uses plane angles, so "basis 45° passes half" is right.
