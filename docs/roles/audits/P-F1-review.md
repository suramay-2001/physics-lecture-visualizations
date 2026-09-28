# P review: 709 F1 "Numbers that turn" (merge 54d3f65, 2026-09-28)

**Verdict: FIX-FIRST.** The physics, the numbers and every derivation are right. Three items must be fixed before release: raw TeX in two unit titles, a displayed sum that does not add up, and an unmarked N&C exercise.

Evidence (scratchpad `f1review-*`):
- Contact sheets of all 35 beats and 5 reveals in both tracks, 0 console errors.
- A numpy recompute of 97 displayed decimals, all 24 challenge answers and their hints.
- Source pages read from `sources/*/text.md`.
- Every bridge followed and returned, both tracks.
- `vitest` content/claims/symbols/qc709: 1486 passed.

## Blocking

1. **Raw TeX in unit titles.** `F1.ts:102` and `F1.ts:369` print as source ("$e^{i\varphi}$: walking round…") on every plain-text surface:
   - the unit H2 and the rail (1.1, 1.4);
   - the 709 home "Where you stopped" card (`CourseHome709.tsx:84`);
   - the 448 return bar.
   *Fix:* Unicode titles ("The gap that x² = −1 leaves", "eⁱᵠ: walking round the unit circle") and regenerate meta, or render titles with `Tex` everywhere. Add a lint that forbids `$` in titles.
2. **"26.6° + 71.6° = 98.1°" is false as written** (26.6 + 71.6 = 98.2). It is the chapter's headline fact, in `F1.story.ts:398` (text), `:400` (caption) and `F1.review.ts:58`. The literals also bypass `V`.
   - True values: 26.565° + 71.565° = 98.130° (`f1Arg21Deg`, `f1Arg13Deg`, `f1ArgProdDeg`).
   - *Fix:* print `d(V.…, 3)`, or write "≈".
3. **N&C Ex. 2.65 is answered without "N&C ⚑".** `F1.story.ts:722` (f1-phase:b6 Formal) gives "in the basis |±x⟩ this pair reads (1, 0) and (0, 1)". That is Ex. 2.65's answer (p. 93).
   - Addendum §3.2 cited "N&C Ex. 2.65"; the build turned it into "(N&C, p. 93)".
   - The standing rule in `qc709-nc.md` requires the mark, so that a sheet assigning the exercise can gate it.
   - *Fix:* "(N&C ⚑ Ex. 2.65, p. 93)". No sheet assigns it today.

## Should-fix

4. **Ground-up never says why the limit is e^{iφ}.**
   - b3 (`:500`) gives only (1 + 1/n)ⁿ → e. b4 (`:515`) grows at rate iφ. b5 (`:552`) concludes "So e^{iφ} = cos φ + i sin φ".
   - The step "(1 + x/n)ⁿ settles near eˣ, so rate iφ gives e^{iφ}" is missing. It exists only in Formal b3.
   - The shared derivation head (`:521`) shows `lim` to Ground-up readers, never introduced.
   - *Fix:* add the eˣ sentence, with a claim.
   - **Ruling on "Grow 1 by its own size":** unclear. Use "Grow 1 by 100% in one step: 2. By 50% twice: 1.5² = 2.25."
5. **cos and sin are never defined in Ground-up.** They first appear at `:379`. D4 step 1 (`:405`) reads them off "the right triangle", which only works for acute angles, yet the chapter uses 98°, 120°, 180° and 240°.
   *Fix:* one sentence: "cos φ and sin φ are the across and up coordinates of the point at angle φ on the unit circle".
6. **δ₋ = π is not a convention** (`:722` "a choice of convention"; Ground `:720` "choosing"). δ₊ = 0 is the convention. Given |α| = |β|, orthogonality forces δ₋ − δ₊ = π.
   *Fix:* "fix δ₊ = 0 (a convention); orthogonality then forces δ₋ = π".
7. **f1-multiply:b6's Formal caption contradicts its stage.** The caption (`:436`) is "1/(3+4i) = 0.12 − 0.16i"; the stage draws the powers of e^{iπ/6} up to z³ = i.
   *Fix:* caption "(cos 30° + i sin 30°)³ = i".
8. **Renumbering left a forward reference.** f1-phase:b3's Ground D7 step 5 (`:671`) says "A chance is a size squared". Chances are first defined at b4. In the old order, Bergou (old b3) defined them first.
   *Fix:* "Brightness is a size squared…", or define chance here.
9. **"√2 = 1.414, a real number that no fraction equals"** (`:81`) contradicts itself: 1.414 is a fraction.
   *Fix:* "≈".
10. **Axler citations.**
    - "z⁻¹ = z*/|z|² (Axler, p. 4)" (`:434`, ref `:438`): p. 4 (1.5) only defines 1/α. The formula follows from zz* = |z|² (p. 121).
    - "§4A" (`F1.ts:110, 202, 282`; `F1.story.ts:255`): Axler 4e Chapter 4 has no lettered sections (ToC: "Exercises 4"). Use "Ch. 4". The pages are right.
11. **"(N&C, p. xxx)" (`:149`) reads as a placeholder.** The page is correct: the front-matter gate table (PDF 26) says π/8 = √S and S = √Z.
    *Fix:* "(N&C, front matter, p. xxx)".
12. **Builder-flagged overlaps.**
    - f1-euler:b4 (also b7 and its reveal): the label `e^(iφ)` (`ComplexPlaneScene.tsx:116`) runs into the "−1" tick and reads as "−1e^(iφ)", i.e. like −e^{iφ}. It is in caret notation and, at φ = 180°, is e^{iπ}. This mildly misleads: move the label and typeset it.
    - f1-multiply:b3: "|z| = 2.236" crosses the z arrow and hides its "z". It is legible and does not mislead (Nit).

## Nits

13. Label collisions: "e" with "Re" on f1-euler:b3; "z⁸" with "Re" on the f1-multiply:b7 reveal. The Formal caption of that reveal wraps inside "−2 + 2i".
14. Ground-up meets symbols it was never given:
    - |0⟩ and |1⟩ on the f1-number-line:b6 stage (the prose never introduces them);
    - the labels Re z, Im z and arg z;
    - the a₀/a₁ readout at f1-phase:b4 (`amplitudes.ts:32`), where the text says α, β;
    - "diag" in `f1-ph-pi8` walkthrough[1] (prefix it "In Formal terms").
15. "Engine" appears in learner text: `:118`, `:382`, glossary `qc-argument`.
16. Formal notation:
    - `(z − z*)/2i` should be `/(2i)` (`:226`);
    - "limits of sequences" should be "Cauchy sequences" (`:69`);
    - roots of unity sum to 0 only for N ≥ 2 (`:746`);
    - "so the ladder stops at ℂ" should be "by that theorem";
    - de Moivre says "whole number" in the beat but "integer" in the glossary;
    - α and β are reused as angles in f1-euler:b5 Formal;
    - D6 Formal lists 4cos²(φ/2) before 2 + 2cos φ, against the order of its reasons.
17. The FTA sentence (`:149`) matches Axler 4.12 for 7 words, so the 8-gram test misses it. It is standard wording; rephrasing is optional. A 4- and 5-gram scan found no other near-copies.
18. Two wording fixes:
    - Glossary `qc-algebraically-closed` (Ground): "every polynomial equation" needs "with an unknown".
    - The f1-plane Try-it calls z*z "always positive": say "never negative".
19. **For the judge:** 448 L2 p. 7 asks for cos θ + i sin θ = e^{iθ} and names no method. D5 proves the same statement by the limit. Ruling 1 covers only the series, so I request no change and only flag the risk.
20. Several twins in `f1.py` are literals, not computations: `f1Re34`, `f1Im34`, `f1I34Re/Im`, `f1ConjRealIm`, `f1ConjImag`.

## Builder's language questions

- **"Grow 1 by its own size":** rewrite (item 4).
- **"2x = 3 needs fractions: x = 3/2":** keep.
- **The four-sentence Formal reveal of f1-number-line:b7:** keep. Fix the "so" and p. xxx (items 16, 11).
- **The four-sentence Formal text of f1-phase:b6:** keep. Fix the convention claim and add the ⚑ (items 6, 3).

## Checked and right

- **Numbers and their claims:**
  - **number-line:** 1.414 `f1Sqrt2`; 0.707 `f1YAmp`, `f1SqrtIRe`; −1 `f1IPow2026`; 16 `f1Sq4iNeg`.
  - **plane:**
    - 5 `f1Abs34`; 25 `f1ZZstar`; 13 `f1Abs512`, `f1Prod23`;
    - 4.472, 2.236, 7.236 `f1AbsSum`, `f1Abs1m2`, `f1TwoSides`.
  - **multiply:**
    - −1 + 7i `f1Prod*`; −4 + 3i `f1I34*`; 7.071 `f1AbsProd`; 5.398 `f1SizesAdded`;
    - 0.6 + 0.8i `f1Dir34*`; 0.12 − 0.16i `f1Inv34*`; 16 and −4 `f1OnePlusI8/4`; 105° `f1Angle105Deg`.
  - **euler:**
    - π `f1Pi`; 2.25 `f1Grow2`; 2.7169 `f1E1000`; 2.71828 `f1E`;
    - 3.297/1.601/1.051/1.080/1.005 `f1Euler{1,10,100,64,1000}Abs`;
    - 3.467 `f1Euler2Abs`; −0.598 − 0.801i `f1Deg180*`; 0.2588 `f1Cos75`.
  - **phase:**
    - 1.732 `f1Phasor60Abs`; 4, 3, 2, 1, 0 `f1Interf*`; 0.866 and 0.75 `f1GlobalAbs`, `f1Global`;
    - 2, 1.5, 1, 0 `f1RelSum*`; 0.75 and 0.5 `f1Mz60`, `f1Mz90`; 120° `f1SizeOneDeg`; 22.5° `f1Pi8`; 0 `f1Three`.
  - Live readouts spot-checked (n = 4: −2.321 + 1.204i).
- **Derivations.** D0–D7 are true in both tracks, and every "why" holds. D5 Formal's bounds are correct.
- **Homework.**
  - There is no series walkthrough anywhere, and `f1-e-series` hints match `l2-c-euler`.
  - HW1 P1–P5 are not worked. The f1-phase:b4 readout |α+β|² stops short of P(Sx = +), which is a P1(a) case: keep it that way.
  - Bergou Ch. 1 problems are untouched.
- **Citations (21 checked):**
  - Axler pp. 2–4, 120, 121, 125.
  - Bergou pp. 1, 2, 7–8.
  - N&C pp. xxx, 13, 15, 71, 85, 93, 174, 175, 207.
  - Notes pp. 7, 12; 448 L2 p. 7.
  - **Ex. 2.18 is on p. 71** (the addendum's p. 70 was wrong). **Ex. 4.3 is on p. 175.**
- **Bridges.** All 6 land on the right unit and return to the same beat. The 4 `sameAs: 'complex-numbers'` stations are right. "Met in Spin Lab 2.3" (L2 unit 3) opens `#/map#map-L2`.
- **Renumbering.** Ids run b1–b7, the commit lists old → new, and no text cites an old number.
- **Sentence caps.** Ground-up ≤ 25 and Formal ≤ 40 everywhere.
