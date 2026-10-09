# P review: 448 L9 "Composite quantum systems" (merge af0013e, reviewed on main f6ccc5a, 2026-10-10)

**Verdict: FIX-FIRST** (0 blocking, 3 should-fix, 9 nits).
- Every displayed number, all 18 challenge keys and all five derivations are right. The proof and the exit check follow the notes.
- Rulings R1–R4, R6 and R8 are honoured: the matrix pair view, the class marker, the Rosetta, Go-deeper-only determinant, the R6 stop line and "the dealer".
- What remains is presentation: one caption with raw subscripts, one caption that claims what its stage cannot draw, and an unnamed path.
- As with P-Q7, the should-fix items go through `07-chapter-fix` before sign-off.

Evidence (scratchpad `rev448-*`, read-only on main):
- **Numbers.** `rev448-l9.py` is an independent numpy route (kron, reshape-rank, explicit sums; not the twins' helpers). It recomputes all 55 `V` keys and they agree to 1e-9. Its own 20 000 Haar states give 0 products and a largest |ψ_uuψ_dd − ψ_udψ_du| of 0.49968 (bound ½).
- **Strings.** Every learner string was dumped from the built lecture (`rev448-dump.test.ts`) and scanned for raw TeX, `_`/`^` outside `$…$`, plan ids, percentages and sentences over 25 words.
- **Code read for every caption and Try-it line.** `widgets/PairGrid.tsx`; `stage/svg/matrix.ts` (pair view, readouts, validation); `stage/svg/MatrixScene.tsx` (PairScene); `content/stage.ts` (pair passports).
- **Sources.** Notes `sources/L9` pp. 7–14, with the p. 5 render. Susskind Lecture 6, §§6.1–6.7 (`chapter006.md`).
- **Targeted vitest.** L8/L9 content, claims, bridges448, pair, matrixPair, PairGrid and games9: 11 files, 3069 tests passed. No Playwright run (brief), so no contact sheets: every stage check below is from the kind's code.

## Blocking

None.

## Should-fix

1. **Raw subscripts outside TeX.**
   - `l9-singlet:b3` caption (`L9.story.ts:516`) prints "here α_u, α_d, β_u, β_d" in plain text, so the learner sees the underscores.
   - The raw-TeX lint (`content.test.tsx:232`) only catches backslash commands, so it passes.
   - *Fix:* `here $\\alpha_u, \\alpha_d, \\beta_u, \\beta_d$`. Consider extending `RAW_TEX_RE` to `[A-Za-zα-ω]_[A-Za-z0-9{]` and `\^\{`.
2. **Caption claims what the stage cannot draw.**
   - `l9-tensor:b4` caption (`:89`) reads "2 × 6 = 12 basis states, and the twelve chances add to 1".
   - The stage is the photon-die label table: boxes hold the names |H1⟩…|V6⟩. The pair view rejects `norm` on a frame table (`matrix.ts:687`), so no chance is ever drawn.
   - The 1/12 belongs to the text only.
   - *Fix:* caption "2 × 6 = 12 basis states, one box each". Keep the 1/12 sentence in the text.
3. **An unnamed path.**
   - `l9-counting:b5` (no caption) and `l9-counting:b7` ("along this path only the first state is a product", `:481`) sweep `FAM(0→45°)`.
   - The family cos t|ud⟩ − sin t|du⟩ and the letter t are first named at `l9-singlet:b8`. Only the counting Try-it caption names them earlier.
   - *Fix:* b7 caption "along $\\cos t\\,|ud\\rangle - \\sin t\\,|du\\rangle$, $t$ from 0° to 45°: only $t = 0$ is a product". Give b5 the same path caption, without the verdict.

## Nits

4. **`l9-product:b3` caption** ("the second row stays the first row, rescaled", `:337`) fails at the end of its own sweep.
   - At θ_A = 180° the first row is 0 and the second is not.
   - *Fix:* "each row is Bob's row times one of Alice's amplitudes".
5. **Glossary `two-spin-basis`** is reached only through `introduces`; no `[[two-spin-basis|…]]` link exists. L6 and L7 link every entry they own.
   - *Fix:* link it at `l9-two-spins:b2` ("the pair's $z$ basis").
6. **Literal underscores in SVG labels.**
   - Factor labels "α_u = 0.866" (`MatrixScene.tsx:472`).
   - Table titles "rows: σ_A ↓ · columns: σ_B →" (`matrix.ts:282`).
   - Passport "BASIS LABELS · H_A ⊗ H_B" (`stage.ts:1212`).
   - The det readout writes "ψuuψdd" with none. Use `<tspan baseline-shift>` subscripts, or one plain form throughout.
7. **Coin naming.**
   - The classical Try-it caption says "row a, column b" (`L9.ts:195`), but the table titles read σ_A/σ_B and the readouts ⟨a⟩, ⟨b⟩.
   - `l9-classical:b3` starts using a, b without saying they are the two coin scores.
   - *Fix:* one clause, "write a and b for the two scores".
8. **Notes p. 8 point dropped.** Looking at her own coin tells Alice which coin Bob has, because each coin was definite. `l9-classical:b4` keeps only the "definite all along" half. Add one clause.
9. **`l9-singlet` summary** (`L9.ts:547`) skips a step: "then α_uβ_d ≠ 0, so β_u = 0 follows from α_uβ_u = 0". Insert "so α_u ≠ 0". The beat, review card and order challenge all have the step.
10. **`l9-two-spins:b1`** says "Each spin has two dimensions". Make it "Each spin's state space has two dimensions".
11. **`l9-product` Try-it 2** says "Bob's column totals stay at 0.5", but the widget opens on amplitudes.
    - The amplitude columns do not total 0.5. What stays fixed is the readout line "Bob: u 0.5, d 0.5" (`matrix.ts:816`).
    - *Fix:* "Bob's readout stays u 0.5, d 0.5 (switch the boxes to chances to see it as column totals)".
12. **Go-deeper refs.** The two Go-deeper beats (`l9-counting:b7`, `l9-singlet:b8`) carry no `refs`; L8's three do. Optional: cite 709 F6 or Susskind §6.7, "degrees of entanglement".

## Builder's language questions

None raised. "Two boxes off the diagonal" (`l9-singlet:b1`) is fine: the singlet's boxes are the anti-diagonal of the table.

## Checked and right

- **Numbers (55 keys).**
  - tensor: 12, 18, 1/12.
  - classical:
    - the dealer: ½, ⟨σ_A⟩ = ⟨σ_B⟩ = 0, ⟨σ_Aσ_B⟩ = −1, correlation −1;
    - biased coins: 0.7, 0.4 → ⟨a⟩ 0.4, ⟨b⟩ −0.2, ⟨ab⟩ −0.08, correlation 0;
    - fair coins: ¼ and 0.
  - two-spins: 4; ⟨ud|ud⟩ = 1; ⟨ud|du⟩ = 0; ½; norm 1.
  - product:
    - factors 0.866, 0.5, 0.707, 0.707;
    - boxes 0.612, 0.612, 0.354, 0.354; chances 0.375, 0.125; norm 1;
    - Bob's P(u) = 0.5 at θ_A = 0°, 60°, 120°, 180°.
  - counting: 0.866 and −0.5; parameters 2, 4, 6; 0 of 20 000.
  - singlet:
    - ±0.707; not a product; the exit state is |+x⟩⊗|+x⟩; the flipped state is not a product;
    - det 0.250, 0.433, 0.500 (= ½ sin 2t), product 0; max ≤ ½.
- **Challenge keys (18).**
  - Numeric: 12, 18, −1, 0, −0.08, 0, 4, 0.354 (tol 0.001 accepts 0.5 × 0.707), 1, 2, 6.
  - The four choice keys and the two order sequences are each the true one, and every distractor's "why" holds.
- **Derivations.**
  - D1 (⟨ab⟩ = ⟨a⟩⟨b⟩), D2 (ψ_ab = α_aβ_b), D3 (the norm factors), D4 (8 − 1 − 1 = 6 > 4).
  - D5 (the no-factor proof) is exactly the notes' p. 13 argument with the R3 renaming: a, b, c, d → α_u, α_d, β_u, β_d.
  - The `l9-singlet:b7` reveal also uses α_u ≠ 0 implicitly, and that holds: α_uβ_u = ½.
- **Captions against the stage code.**
  - Box texts (`pairNumber`: three decimals, exact ½, 1/√2), readouts (`pairReadouts`) and highlights all match, at every other beat.
  - The `l9-classical:b3` caption equals the `means` readout: 0.4, −0.2, −0.08.
- **Try-it lines.** All 18 are doable with PairGrid's real controls:
  - the Table / State / Boxes segments;
  - θ and φ sliders in 5° and 15° steps (60°, 90° and 180° reachable), and t from 0° to 90°;
  - P(+1) in 0.05 steps;
  - the opt-in "Go deeper (beyond the notes): show the factoring test" checkbox.
  - The readouts quoted are the code's own strings ("dim = 2 × 6 = 12", ⟨ab⟩ = −0.08, correlation 0, every box 1/2, singlet det 0.5, product det 0).
- **Citations.**
  - The notes' pages for §§9.4–9.9 are right: 7, 8, 9, 10, 11 and 11–13.
  - Susskind §6.1.2 has the table: Alice's labels at the side, Bob's die across the top, a different bracket for Alice.
  - §6.2 has the dealer and the two separate dealers. §6.3 reads the label pair as one index. §6.4 names Bob's spin τ.
  - §6.6 has 8 − 2 − 2 = 4. §6.7 has 6 parameters, degrees of entanglement, "maximally entangled", and Exercise 6.3.
- **Rulings and markers.**
  - The class marker "Class 9 · from minute 23" sits on `l9-tensor:b1`; the notes' tensor products start at minute 23.
  - Go-deeper sits only at `l9-counting:b7` and `l9-singlet:b8`. Both are beyond the notes (random states, the determinant), and neither carries the notes' argument.
  - R6: nothing about each spin alone; `l9-singlet:b5` forwards to Lecture 10.
- **Fidelity to the notes.**
  - The order is §9.4 → §9.9. The notes' bans (no tensor-product matrices, no Hamiltonians, no angular-momentum addition) are respected: the "matrix" is drawn as a table of boxes.
  - Nothing important is missing except nit 8.
- **Glossary.**
  - 448 has 216 entries, with no duplicate id and no duplicate term ("basis" and "$z$ basis" are different terms).
  - None of the 258 709 ids (all `qc-`) collides with a 448 id.
  - tensor product, product state, entangled state and singlet are also 709 terms, which P5 allows.
- **Chips into 709.**
  - `f6-pairs`, `f6-kron`, `f6-growth` (its 2·2ⁿ − 2 against 2n), `f6-product-or-not` (det/rank), `q6-entangled` and `q9-schmidt` all exist.
  - Each matches its label, and all sit in clue reveals or Go-deeper beats.
- **Hygiene.**
  - No plan id in learner text, no amplitude as a percentage, and no sentence over 25 words.
  - The six Arcade spot-the-error rounds (`games.ts`, Units 9.1–9.6) have the right wrong step and a true "why".
