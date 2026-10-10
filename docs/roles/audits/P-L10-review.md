# P review: 448 L10 "Entanglement and the GHZ game" (merge b638342, reviewed on main eb12685, 2026-10-10)

**Verdict: FIX-FIRST** (1 blocking, 5 should-fix, 10 nits).
- All 104 `V` keys, all 27 challenge keys and all six derivations are right. The GHZ proof and the quantum strategy follow the notes.
- Rulings R1–R5 and R7 are honoured: the class marker, Lecture 11's names, "the source", Go-deeper beats last in their units, the additive stage fields, one `ghz-game` widget.
- The blocking item is one false sentence, repeated in a pitfall and a review card. It says matched axes are what an instruction table cannot explain, but unit 4 shows 8 of 64 tables do.
- The rest is presentation: two captions that describe pictures the stage does not draw, an unnamed path, a plan id, and one citation.

Evidence (scratchpad `rev448-*`, read-only on main):
- **Numbers.** `rev448-l10l11.py` is an independent numpy route: kron, partial trace by reshape, brute-force tables, Horodecki for the CHSH maximum. It is not the twins' helpers. It recomputes all 104 L10 keys (dumped by `rev448-dump1011.test.ts`) and they agree to 1e-9.
- **Widget seeds.** `rev448-ghzw.test.ts` replays the widget's own referee and sampler.
  - Quantum, seed 7, 20 rounds: 20 wins, Alice −1 in 11.
  - Both, seed 10, 40 rounds: the plan wins 29, every loss is ZZZ; |G⟩ wins 40.
- **Strings.** `rev448-scan.py` checks raw TeX, `_` or `^` outside `$…$`, percentages and plan ids. `rev448-gloss1011.py` checks the glossary.
- **Code read for every caption and Try-it line.**
  - Widgets: `widgets/TwoSpin.tsx`, `widgets/GhzGame.tsx`.
  - Kinds: `stage/svg/twoQubit.ts` and `TwoQubitScene.tsx`, the `matrix.ts` tableau with `MatrixScene.tsx`, the `amplitudes.ts` readouts, and the zero-length rule in `draw.tsx` `Arrow`.
  - Content and games: `content/bridges448.ts`, `arcade/games.ts`.
- **Sources.** Notes `sources/L10` pp. 1–17 and `sources/L11` pp. 1–9. Susskind `chapter006.md` §§6.7–6.9 and `chapter007.md` §§7.9–7.10. Townsend `text.md` pp. 179–180.
- **Not run.** No Playwright and no suite vitest: a full run was in progress on main. Stage checks are from the kinds' code.

## Blocking

1. **A false claim about instruction tables, three times.**
   - Review card trap (`L10.review.ts:46`): "the three matched axes together are what a table struggles to explain".
   - Unit pitfall (`L10.ts:338`): "it takes all the matched axes together to push a table of answers".
   - Both say perfect anticorrelation on XX, YY and ZZ strains a table of answers. It does not.
     - `l10-instructions:b5` and `l10-in-three` show 8 of the 64 three-setting tables reproduce all three. The card for that unit says "Matched axes alone can never refute tables".
     - Only mismatched settings (the GHZ inputs, the CHSH axes) defeat tables. That misconception is exactly the one Bell and GHZ address.
   - *Fix:* trap "Treating $ZZ = -1$ as something quantum. A dealer's penny and dime do that, and a table copies all three matched axes (Unit 10.4); only mixed settings, as in the GHZ game, defeat tables." Make the same change to the pitfall.

## Should-fix

2. **Caption describes a different picture (`l10-no-table:b6` reveal, `L10.story.ts:642`).**
   - The caption reads "random choice of plan · 50/50 on average".
   - The stage is `game({ values: CARD.minus })`: the one plan "always −1", with ✓✓✓✗ and "wins 3 of 4".
   - *Fix:* caption "the best plan wins 3 of 4; a plan drawn at random from all 64 wins half the time". Or drop `values` and show the bare needs.
3. **Caption names a step the stage does not draw (`l10-quantum-wins:b5`, `:724`).**
   - The caption reads "the bars after $X_BX_C$, then after $Z_A$".
   - The stage is `amp(onG([X1, X2]))` with no `upTo`, so it shows only $X_BX_C|G\rangle$, which is not $\pm|G\rangle$.
   - *Fix:* `amp(onG([gate('X',1), gate('X',2), gate('Z',0)], sweep(7, 8)), { dials: true })`. Column 7 is after $X_BX_C$ and column 8 after $Z_A$. Or cut the caption to its first half.
4. **An unnamed path (`l10-correlations:b4`, `:349–351`).**
   - The text says "Slide from |ud⟩ to the singlet … from 1 to 0.5 to 0". The caption gives "at 30° … at 45°".
   - The family cos t|ud⟩ − sin t|du⟩ and the letter t appear only in the Try-it caption and in `l10-co-path`. This is the same defect as P-L9 item 3.
   - *Fix:* "Slide along $\\cos t\\,|ud\\rangle - \\sin t\\,|du\\rangle$ from $t = 0$ (the product) to $t = 45^\\circ$ (the singlet)". Keep the caption's 30° and 45°, now with $t$.
5. **Plan id in learner text (`l10-no-table:b5` reveal caption, `:627`).**
   - "the plan T₁ wins three inputs and loses one" uses the plan's `T1`. The learner never meets that name.
   - *Fix:* "this plan wins three inputs and loses $ZXX$".
6. **Citation (`l10-empty-centre:b7` ref and the unit `books`, `L10.story.ts:260`, `L10.ts:214`).**
   - "Susskind calls such a pair maximally entangled", cited to "end of §6.8".
   - The term and his two statements are in **§6.7** (`chapter006.md` ≈ l. 440–461). The end of §6.8 restates "know everything … nothing about its constituent parts" without the term.
   - *Fix:* `where: '§6.7; end of §6.8'`, with the adds "§6.7 names the singlet maximally entangled; the end of §6.8 explains why nothing is known about either part".

## Nits

7. **`l10-empty-centre:b5`** ends "At the centre every axis is ½." (`uf` → "½"). *Fix:* "every axis gives $+1$ with chance ½".
8. **`l10-empty-centre:b4`**: "If spin $i$ has Bloch vector $\\vec r_i$ with chance $p_i$" reads as the $i$-th spin. The notes have one spin prepared in state $i$. *Fix:* "If the spin is prepared with Bloch vector $\\vec r_i$ with chance $p_i$".
9. **`l10-empty-centre:b7`** (books, no caption) shows the readout "Tr ρ² = 1.000" (the pair's) next to text that says tr ρ_A² = ½. Two different ρ's, unlabelled.
   - *Fix:* caption "the readout is the pair's Tr ρ² = 1; Alice's own is ½". Or use `readouts: ['entropy']` (S(ρ_A) = 1 bit).
   - "tr" versus "Tr" also differs.
10. **Captions that say more than one picture shows.**
    - `l10-what-ghz-proves:b1` "six fixed answers": the tableau shows the four row products.
    - `:b5` "whatever the others measure": one setting (ZXX) is drawn.
    - `:b8` reveal "Alice's bars total one half": say "the four bars with Alice's bit 0".
    - *Fix:* reword. For b5 a split ZZZ/ZXX view, as planned, also works.
11. **"after column 7" readouts.**
    - Every amplitudes view built with `onG`/`onSing` prints the amplitudes kind's `after column k` line (`amplitudes.ts:237`) for a circuit the learner never sees: `quantum-wins:b5, b7, b8`, `what-ghz-proves:b5, b8` and the derivation views.
    - *Fix:* an additive flag that drops the `after` line when no circuit is drawn. Or use `{terms}` where the state is fixed.
12. **`l10-quantum-wins` Try-it 2**: "Read the line under the ledger". `RoundTable` prints the stats line *above* the table of rounds. *Fix:* "the line above the table of rounds".
13. **Uncredited book exercise.** σ·τ's singlet eigenvalue (`l10-correlations:b5`, `l10-co-dot`) is Susskind Exercise 6.9; the text presents −3 as his. *Fix:* add "(his Exercise 6.9)" to the ref and to the challenge title.
14. **`l10-no-table:b1`** says "Write each answer as a sign $s = (-1)^{\\text{bit}}$", but the app's answers are already ±1 from `ghz-game:b3`. $s$ also means an eigenvalue in `l10-lo-act` and `l10-qw-*`. *Fix:* "Lecture 10 wrote answers as bits; with $(-1)^{\\text{bit}}$ an even number of 1s is a product of $+1$".
15. **Arcade `centre-is-a-hidden-state`** why: "her spin has no state of its own". It has ρ_A = I/2. *Fix:* "no pure state of its own".
16. **Literal underscores in SVG readouts**: "|r_A| = … · |r_B| = …" (`twoQubit.ts:307`), as in P-L9 item 6.

## Builder's language questions

None raised. "Plan" for an instruction table in units 5–8 is consistent with "table" in unit 4 and the Rosetta.

## Checked and right

- **Numbers (104 keys).**
  - local: 0.707; Y|u⟩ = i|d⟩, Y|d⟩ = −i|u⟩; −1; |dd⟩; the commutators; ¼ ×4.
  - empty-centre: 0 for all six local averages; |r_A| = |r_B| = 0; ½ at (60°, 30°) and at 70°; mixes 0, r_z = 0.5, 0.707; ½; pair purity 1; ρ_A = I/2 with purity ½; mix XX 0 against the singlet's −1.
  - correlations: ZZ = XX = YY = −1; T = −I; path |r_A| = 1, 0.5, 0 and T_xx = 0, −0.866, −1; σ·τ = −3; ⟨Z_AX_B⟩ = 0; |ud⟩ T = diag(0, 0, −1), r_z = 1.
  - Go deeper: −n·m gives −1, −0.5, 0, +0.5, +1, with P(opposite) = 0.75 at 60°. LHV ≤ 2 by brute force. 2√2 from the Horodecki criterion. The drawn axes (z, x; 135° at φ = 180° and φ = 0) give |S| = 2.828.
  - instructions: 4 of 16, A_Z = +1 in 2 of 4 (½), 8 of 64.
  - GHZ: dim 8; "always −1" wins 3 and loses ZZZ; 64 plans, 32 + 32, none even; every plan's row products multiply to +1, the needs to −1; best ¾; uniform plan ½; T1 loses ZXX only.
  - |G⟩: ±½, norm 1, 4 terms; ZZZ +1, ZXX = XZX = XXZ = −1; ¼ on 000, 011, 101, 110; Alice ½ under every input; under ZXX only 001, 010, 100, 111.
  - Go deeper 2: (S·H)^⊗3 (|000⟩ + |111⟩)/√2 = |G⟩; X → +Z, Y → +X; Mermin's ceiling 3.
  - Go deeper 3: ZZZ·ZXX·XZX·XXZ = −III.
- **Challenge keys (27).** All numeric keys equal their `V` value. The choice keys (|uu⟩; X_A, Y_A; ZZZ; 001; the two locality items) and the order key are the true ones, and every distractor's "why" holds. The `l10-gg-wins` hint "by symmetry" holds: flipping both of Alice's answers sends k wins to 4 − k.
- **Derivations.**
  - D1–D3 match notes pp. 3, 4 and 7 step for step.
  - D4 is the p. 12 product with the R2 names. D5 and D6 are the p. 15 arguments.
  - Each view shows what its caption says. The D3 view is "every phase is reversed"; D6 step 3 uses `globalPhaseDeg: 180`.
- **Captions against the stage code.**
  - two-qubit: dashed axes; a zero arrow drawn as a dot (`Arrow`, len < 1.5); `Tr ρ²` is the pair's purity; grid cells by sign and size; `S = 2.828` at b9.
  - tableau: the "needs" column, ✓/✗, "wins k of 4", the product row "phase −1" at `what-ghz-proves:b9`.
  - Every other caption matches its picture. Exceptions: items 2, 3, 9 and 10.
- **Try-it lines.** All 22 are doable.
  - TwoSpin: Pair state, t in 5° steps (30° and 45° reachable), Alice/Bob axis, Alice first/Bob first, Measure 100 pairs, the readout line above the balls.
  - GhzGame: the pair mode starts all +1, has "Hide the plan" and "Bob answered the opposite in n of n". The table mode starts at "always −1" with its verdict line and the proof line. Quantum and both modes have Play 20 or 40 rounds and the fixed-input segment.
  - The XZX recipe (flip A_X and C_Z) loses XZX only.
- **Citations.**
  - Unit pages: pp. 2–3, 4–6, 7–8, 9, 10–11, 12–13 + L11 pp. 3–4, 14–16 + L11 pp. 5–6, 17 + L11 pp. 7–9. Each matches its § and footer.
  - Susskind: §6.8 (σ for Alice, τ for Bob). §6.9 (σ·τ cannot be read by two separate apparatuses). §7.9 (Bob's unitary leaves ρ_A unchanged). §7.10 (the disconnected "quantum sim").
  - Townsend pp. 179–180: the reduced operator of the entangled pair is that of a completely unpolarized ensemble, set against the 50-50 mix, as in `l10-empty-centre:b8`.
- **Rulings, markers, Go deeper.**
  - "Class 11 starts here" is on `l10-quantum-wins:b1`. The quantum strategy opened Class 11 (L11 p. 1).
  - The §11.1 recap is the sentence in `no-table:b3`.
  - The four Go-deeper beats (−n·m, CHSH, the GHZ rotation, −III) are beyond the notes, last in their units, and carry no step of the notes' argument.
  - The notes' Bell-inequality remark stays number-free (`what-ghz-proves:b4`).
- **Fidelity to the notes.**
  - §10.1–§10.10 and §11.1–§11.3 are all present and in order, with nothing important dropped.
  - Covered: the identity rule, the two kinds of uncertainty, "this part still looks classical", "no contradiction yet", the class challenge, and "what has been ruled out" (p. 13).
  - Also covered: the product-versus-individual warning, the λ restriction, the 2022 Nobel, no-signalling, and Einstein 1935.
- **Glossary.**
  - 15 new ids, each linked at its `first` beat. 448 has 242 entries with no duplicate term.
  - None collides with the 290 709 ids. maximally entangled, GHZ state and no signalling are also 709 terms, which P5 allows.
- **Chips.** `f6-operator`, `q9-partial-trace`, `q6-parities`, `q10-chsh`, `q10-hidden`, `q10-no-signal` and `q7-mermin` all exist with matching titles. They sit in clue reveals and Go-deeper beats only.
- **Hygiene and Arcade.**
  - No raw TeX outside `$…$` and no amplitude shown as a percent (only chances, as "%").
  - The four spot-the-error rounds and the four GHZ levels have the right wrong step and a true "why", except item 15. The `ghz-share-g` distractor 11 equals the seed-7 Alice count, a fair trap.
