# P review: 709 Q7 "GHZ and Mermin: certainty without instructions" (main 28d166f, reviewed 2026-10-06)

**Verdict: FIX-FIRST** (0 blocking, 8 should-fix, 5 nits).
- Every displayed number, all 24 challenge answers, all 7 derivations and every sign in the captions are right.
- No Blocking item, but should-fix items must still go through `07-chapter-fix` before sign-off (the skill sends every FIX-FIRST there).
- The engine's Mermin target in `bits.ts` is sign-reversed against the notes (item 1). Q7 already works around it, so no number a learner sees is wrong.
- The rest is wiring and hygiene: concept edges still stubbed, two answer keys bound to the wrong claim, vacuous constant claims, raw `^{…}` outside TeX, and a ruling id in learner text.

Evidence (scratchpad `revQ6Q7-*`):
- `revQ6Q7-q7.py`: my own route. GHZ is built as CNOT₁₃·CNOT₁₂·(H⊗I⊗I)|000⟩. Probabilities come from rank-1 projectors. Eigenvalues come from ⟨ψ|P|ψ⟩ plus the residual ‖Pψ − ⟨P⟩ψ‖. Mermin cards are scored against both targets.
  - 43 keys compared with `claims-qc709/q7.json`: 0 mismatches.
  - 69 structural checks pass, among them (1+s)/4 with s = (−i)^{n_y}Π for all 64 (bases, outcomes) runs, and eq. 2.9 for all four ζ.
- `vitest src/content src/physics/qc`: 3791 passed (29 files).
- Plan and build agree beat for beat: 31 beats with the same ids as P-Q7-story §1.
- **Sources:** notes L6 pp. 29–32 and L7 pp. 33–35 read in full from `sources/qc709-n6`, `-n7`; HW2 P5 and P7; Bergou pp. 57–58 (PDF 70–71, eqs. 3.81–3.82) and p. 186 (PDF 194, Problem 10.1).
- **Not done (economy):** no screenshots, as the brief asks (F4 and F5 are building). Captions were read from source.

## Must-resolve: the Mermin sign (engine flag)

**By hand.** On |GHZ⟩ = (|000⟩+|111⟩)/√2, X|0⟩ = |1⟩, X|1⟩ = |0⟩, Y|0⟩ = i|1⟩ and Y|1⟩ = −i|0⟩:
- XXX swaps |000⟩ ↔ |111⟩, so XXX|GHZ⟩ = +|GHZ⟩.
- XYY|000⟩ = i·i|111⟩ = −|111⟩ and XYY|111⟩ = (−i)(−i)|000⟩ = −|000⟩, so XYY|GHZ⟩ = −|GHZ⟩.
- YXY and YYX put the same two Y factors on each term, so both are −1 as well.

**In numpy.** `revQ6Q7-q7.py`, eigenvalue route: on GHZ+ the values are XXX +1 and XYY = YXY = YYX = −1, each with residual 0. On GHZ− = (|000⟩−|111⟩)/√2 they are XXX −1 and XYY = YXY = YYX = +1.

**The notes' convention.**
- Notes p. 29 define |GHZ⟩ with a **plus** sign.
- Eq. 2.12 (p. 33) gives Ô_XXX = +1 and Ô_YYX = Ô_YXY = Ô_XYY = −1, and the p. 33 list agrees.
- HW2 P7 uses the same state.
- So the notes, HW2, `state.ts` `ghz(3)` and `gates.ts` `pauliEigenvalue` all agree.
- `bits.ts:146` `MERMIN_TARGET = { XXX: -1, XYY: 1, YXY: 1, YYX: 1 }` is the GHZ− convention, which is Mermin's 1990 sign choice. Its docstring is wrong in saying that "|GHZ⟩ is a simultaneous eigenstate of all four with these eigenvalues".

**The wrong route** is `merminInstructionSets()`'s built-in target, together with its numpy fixture:
- `pipeline/make_qc_fixtures.py:1162` hand-copies the same `target`, so `bits.test.ts:122` checks the engine against a copy of the same sign and cannot catch the error.
- `maxMatches` (3) and the 32/32 histogram survive by symmetry. For every card, matches against the engine target = 4 − matches against the correct one; verified on all 64.
- Each card's own `.matches` is wrong. An engine probe (`revQ6Q7-probe.test.ts`, run with vitest from the scratchpad) finds that 64 of 64 cards disagree with a recount against `pauliEigenvalue(ghz(3), ·)`.
- Today nothing on screen reads `.matches`: the tableau stage calls `pauliEigenvalue` directly (`matrix.ts:313`). The plan's Mermin Arcade levels (P-Q7-story §11.2) would, so this has to be fixed before they are built.

**Exact fix (owner: W-709 engine):**
1. `app/src/physics/qc/bits.ts:146`: `export const MERMIN_TARGET = { XXX: 1, XYY: -1, YXY: -1, YYX: -1 } as const`. Rewrite its docstring as "notes eq. 2.12, for GHZ = (|000⟩+|111⟩)/√2 = `state.ts` `ghz(3)`".
   - Keep it a literal: `gates.ts` imports `bits.ts`, so `bits.ts` cannot call `pauliEigenvalue` without an import cycle.
2. `pipeline/make_qc_fixtures.py:1162`: `target = {"XXX": 1, "XYY": -1, "YXY": -1, "YYX": -1}`. Then regenerate the fixtures.
3. A new test in `app/src/physics/qc/bits.test.ts`. It can import `gates.ts` and `state.ts` without a cycle:
   ```ts
   it('MERMIN_TARGET is the actual GHZ eigenvalue, and every card is scored against it', () => {
     const keys = ['XXX', 'XYY', 'YXY', 'YYX'] as const
     for (const k of keys) expect(MERMIN_TARGET[k]).toBe(pauliEigenvalue(ghz(3), k))
     for (const a of merminInstructionSets().assignments)
       expect(a.matches).toBe(keys.filter((k) => a.values[k] === pauliEigenvalue(ghz(3), k)).length)
   })
   ```
4. Then delete the "Engine note" paragraph in `Q7.values.ts:11-20`. Keep its independent recount, `matchesAgainstCorrect`.

**Q7's displayed numbers are right either way.**
- `Q7.values.ts:173-177` scores each card against `pauliEigenvalue(G3, ·)`. The `q7Card*` values are pure card arithmetic.
- Every Mermin number checks out: the 64 cards, best 3, the 32/0/32 split, card 1 = (+1, −1, −1, +1), card 2 = (−1, −1, −1, −1), and forced −1.
- The tableau ✓/✗ marks come from `pauliEigenvalue`. "Fails YYX" (card 1) and "fails XXX" (card 2) are correct.

## Blocking

None.

## Should-fix

1. **The engine Mermin sign.** See the section above; the fix belongs to the engine owner, not to the chapter fixer.
2. **The concept stubs are still stubbed** (a known follow-up, confirmed open).
   - `concepts.ts:113`: `qc-ghz` needs `['qc-circuits']`.
   - `concepts.ts:116`: `qc-ghz-parity` lacks the plan's parities edge.
   - `Q7.ts:28` prerequisites use `qc-circuits`.
   - Q6 is merged. Its stations are suffixed `-station` (`concepts.ts:121-126`), not the plan's `qc-bell-basis` / `qc-parities`.
   - *Fix:*
     - `qc-ghz` needs `['qc-bell-basis-station']`.
     - `qc-ghz-parity` needs `['qc-ghz-table', 'qc-parities-station']`.
     - In `Q7.ts:28`, replace `'qc-circuits'` with `'qc-bell-basis-station', 'qc-operator-tensor-station', 'qc-parities-station'`.
     - Delete the stub comments at `concepts.ts:110-112` and `Q7.ts:26-27`.
3. **Two answer keys are bound to the wrong claim.** The values happen to agree; the twins check a different run.
   - `q7-t-s` (`Q7.ts:273`) asks for s in "a YYX run with Π = −1" but answers `V.q7S1Re`, the XXX (+,+,+) run. *Fix:* add `q7SYyxPiMinusRe: sOfRun(['y','y','x'],[1,1,-1]).re` (I recompute 1) and its twin, and answer with it.
   - `q7-t-p` (`Q7.ts:283-284`) says "If s = i" but answers `q7P1AtSNegI`, computed at s = −i. *Fix:* reword to "If s = −i", which is the XXY (+,+,+) run the key actually computes, and make hint 1 "|1 − i|² = 2".
   - `q7-t-hw-yyx` answers the expression `V.q7BracketYyxPiMinus ** 2`. *Fix:* add `q7PYyxPiMinus = abs2(ghzBracket(...))` (0.25) with its own twin.
4. **Vacuous constant claims back shown numbers.** These are `q7Half`, `q7Quarter`, `q7Eighth` and `q7ThreeEighths`, literals in both `Q7.values.ts:216-219` and `q7.py`; this is the defect class of remap ruling "engine-backed answers".
   - `ghz:b4` reveal: "the reading itself had probability ½" → claim `q7AfterQ2P`, which exists and is unused.
   - `parity-table:b4` caption: "XXX: four bars of 0.25" → `q7Table011` plus `q7RunCircMatchXxx`, which ties the drawn C_RUN bars to the table. Both exist; the second is unused.
   - `parity-table:b6` reveal and `bit-strings:b3` caption: "0.125" → `q7TableXxy101` (b6 lacks it).
   - `bit-strings:b2` caption: "YYX: odd strings 0.25 each" → add `q7TableYyx001 = tableYyx[1]` (I recompute 0.25). The only odd-string key that exists today, `q7TableXyy001`, is unused.
   - `ghz:b3` Ground step 5: "P(n) = ⅛, ⅜, ⅜, ⅛" → add `weightStats`-derived `q7ZerosPlusP0`/`P1` keys.
   - `brackets:b1` "fair coin" → `q7SingleXProb`-style key for one y reading.
   - `observables:b4` "50% each way" → `q7SingleXProb`.
5. **Raw `^{…}` outside TeX.**
   - The lint (`RAW_TEX_RE = /\\[A-Za-z]+/`) catches only backslash commands. These slip through and render literally:
     - `Q7.ts:21` (an outcome, rendered as plain `<li>` at `LecturePage.tsx:248`);
     - `Q7.ts:259` (summary, `Rich`);
     - `Q7.ts:264` (`insightFormal`, `Rich`): "s = (−i)^{n_y}Π".
   - *Fix:* write `$s = (-i)^{n_y}\\Pi$` in the summary and the insight. In the outcome, write "s, a power of −i times the product Π of the readings".
   - Also extend the lint to `/\^\{|_\{/` in plain runs.
6. **n_y and Π are used before they are defined, in both tracks.**
   - The `parity-table:b1` derivation reaches s = (−i)^{n_y}Π (Ground lines 5–6, Formal line 2) one beat before `parity-table:b2` defines them (`qc-ny-pi`, `first: 'q7-parity-table:b2'`).
   - `Q7.ts:73-74` registers both symbols at b1, which hides this from the lint.
   - *Fix:* end b1's derivation at (1+s)/4 and P = |1+s|²/16, and move the factorization lines into a derivation on b2. Alternatively, define both terms in b1's Ground line 5 `why` ("n_y = how many qubits were read in y; Π = ε₁ε₂ε₃").
7. **A sign in `parity-table:b4` F** (`Q7.story.ts:360`): "n_y = 1, 3 give s = ∓iΠ, ±iΠ".
   - Since Π already carries the ±, the lower signs give s = +iΠ for n_y = 1, which is wrong.
   - *Fix:* "n_y = 1 gives s = −iΠ = ∓i and n_y = 3 gives s = iΠ = ±i, so P = ⅛ for all".
8. **Learner text is wrong in two places.**
   - (a) **A ruling id.** `mermin:b5` refs `adds` (`Q7.story.ts:777`) ends "(ruling qc709-remap.md #13)". *Fix:* end at "not worked in full".
   - (b) **"Heisenberg-picture".** The `q7-mermin` Formal review point (`Q7.review.ts:124`) calls eq. 2.13 "the Heisenberg-picture product". Eq. 2.13 is a plain operator product; no picture is involved. *Fix:* "eq. 2.13: the operator product carries a sign the product of numbers cannot".

## Nits

9. **Hand-typed prose numbers.** They are right and claimed on the beat, but bypass `d()`:
   - `ghz:b3` text: "1.5", "2.25", "0.75";
   - `insightFormal` (`Q7.ts:135`): "2.25", "0.75";
   - `brackets:b3` `viewCaption`: "0.707";
   - `parity-table:b1` caption: "0.5".
   - *Fix:* use `d(V.…)`.
10. **Raw braces in captions.**
    - `brackets:b1` caption `|{+y}⟩: …` and the claim label (`Q7.story.ts:168`) render "|{+y}⟩".
    - *Fix:* "|+y⟩", or `$|{+y}\\rangle$`.
11. **`brackets:b4` reveal claims** only ⟨−y|0⟩ and Im⟨+y|1⟩, while it states ζ = +i from ⟨−y|1⟩ = +i/√2. *Fix:* add `q7ZetaYMinusDeg` (90).
12. **`mermin:b5` F**, "each satisfy g|GHZ⟩ = +|GHZ⟩": g is not defined. *Fix:* "each operator g of the three satisfies …". Also link `[[qc-stabilizer|stabilizers]]` (Q6's entry) in the Ground text, and `[[qc-pauli-string|Pauli strings]]` at `observables:b1`.
13. **Try-it widgets** (canvas-free substitutes for the plan's `bloch`). The `q7-ghz` and `q7-bit-strings` SG `deposit-stats` show a single spin. That is fair for "each qubit alone is a coin", but the try-this text should say "one qubit of GHZ alone".

## Notes alignment (revised notes L6–L7, HW2)

- **No wrong page.** All citations match:
  - p. 29: GHZ_N, the x/y bases and P(000) = ½;
  - p. 30: runs, the eight brackets and eq. 2.9;
  - pp. 30–31: s and eq. 2.10;
  - p. 31: the table and the surviving strings;
  - pp. 31–32: the product as a reading;
  - p. 33: eqs. 2.11–2.12 and the dispersions;
  - p. 34: the Mermin product and eq. 2.13.
- **Bergou:** eq. 3.81 (GHZ) is p. 57 and eq. 3.82 (W) is p. 58 (§3.9); Problem 10.1(a) is p. 186.
- **HW2:** P5(b)–(c) → `ghz:b3`; P7(a) → `observables:b3`; P7(b) → `observables:b5`; P7(c) → `mermin:b2`/`b6`; P7(d) → `parity-table:b5`. Walkthroughs are full, as ruling 12 requires.
  - P7(e) (Tr₃ GHZ) is correctly deferred to Q9 ("Chapter Q9 computes this", `ghz:b2` F; the outline has Q9 as reduced states).
  - The silent notes from plan §8 are handled as planned. The HW2 P5(c) self-reference is not exposed.
- **Missing [L] beats:** none. The p. 34–35 density-matrix paragraph belongs to Q8.

## Derivation views and notation beats

**Derivation views:** every derivation has at least 2 distinct views per track, and each view shows its step.

| Derivation | Ground views | Formal views |
|---|---|---|
| `ghz:b3` zero-count variance | amp GHZ (2 bars), amp \|+++⟩ (8 bars) | the same pair |
| `brackets:b3` ζ | amp \|+y⟩ dials → amp \|−x⟩ (reversed dial) → cplane conj (i ↔ −i) → ζ spokes | amp → spokes |
| `parity-table:b1` (1+s)/4 | amp GHZ → cplane z+w sum (s = 1) → powers of −i → modulus at s = −i | sum → powers |
| `bit-strings:b1` parity | C_RUN XXX (even), YYX (odd), XXY (flat) | XXX → YYX |
| `observables:b3` eigenvalues | matrix XXX → amp after XXX → amp after YYX (signed, negative) → C_RUN XXX | YYX amp → C_RUN |
| `mermin:b2` forced −1 | tableau card 1 → card 2 → quantum values | card 1 → card 2 |
| `mermin:b4` −XXX | tableau → grid Y·X·Y = −X → tableau product | grid → tableau product |

Two weak spots:
- The last Ground step of `observables:b3` (zero spread) reuses the XXX outcome bars. That is acceptable but indirect.
- The `parity-table:b1` view ordering carries item 6's definition gap.

**Notation beats:** each really introduces its term.

| Term | Beat |
|---|---|
| `qc-ghz` | `ghz:b1` |
| `qc-ghz-run` | `brackets:b2` (b_k, ε_k, capital-letter run names) |
| `qc-zeta` | `brackets:b3` |
| `qc-ny-pi` | `parity-table:b2` (but used one beat early: item 6) |
| `qc-mermin-observables` | `observables:b1` (eq. 2.11, Ô² = I) |
| `qc-hidden-values` | `mermin:b1` |

**Glossary:**
- No duplicated ids across the 709 glossaries (checked across all `*.glossary.ts`).
- The reused entries all exist where the header says: `qc-pauli-string`, `qc-parity` and `qc-stabilizer` (Q6); `qc-compatible`, `qc-dispersion` and `qc-eigenvalue` (Q3); `qc-hidden-label` (Q1).

**Bridges:**
- `<<qc-l3-spread|…>>` (`observables:b4` F) and the glossary bridge `qc-l1-logic` both resolve in `bridges.ts:53,57`. Ruling 6 is met.
- The cross-references resolve: Unit 4.2 (one-qubit gates), Unit 6.2 (Pauli strings in `q6-tensor`), Unit 6.6 (parities), Units 7.5 and 7.6, Q9 (reduced states) and Q10 (CHSH).

## Checked and right

- **The GHZ unit:** amplitude 0.707; P(000) = P(111) = ½; 2 of 8 bars; post-reading |000⟩ and |111⟩. The zero-count is ⟨n⟩ = 3/2, ⟨n²⟩ = 9/2 and Var = 9/4 for GHZ, against 3/2 and 3/4 for |+++⟩.
- **The brackets:** ⟨±x|0⟩ = ⟨±y|0⟩ = 1/√2. ⟨+y|1⟩ = −i/√2 and ⟨−y|1⟩ = +i/√2. ζ sits at 0°, 180°, 270° and 90°.
- **The parity table:** s = 1, −1 and −i for the three named runs. The brackets are ½, 0, 0 and ½, and the chances ¼, 0 and ⅛, with |1 − i| = 1.414. P(011) = ¼ and P(010) = 0 in XXX. P(000) = 0 in YXY, P(001) = ¼ in XYY, and P(101) = P(000) = ⅛ in XXY and YYY. A single qubit gives ½.
- **The observables:** all four square to I and commute. The means are +1, −1, −1, −1 with variance 0. ⟨σ_x1⟩ = 0 with variance 1. ZZI = IZZ = ZIZ = +1. SWAP₂₃ leaves GHZ fixed.
- **The Mermin product:** (YYX)(YXY)(XYY) = −XXX, with phase (+1)(−1). Qubit 2 contributes Y·X·Y = −X.
- **Every challenge answer and distractor `why`** is correct. In particular, `q7-o-sym`'s "flip all three bits" distractor is fairly worded.
- **Amplitudes** are never shown as percentages; only probabilities are ("50% each way").
