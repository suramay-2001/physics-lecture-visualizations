# P review: 709 F7 "Bits and logic that can run backwards" (main e36eaf1, reviewed 2026-10-11)

Reviewer: independent P verifier (read-only; not the builder). Skill: `skills/06-chapter-review/SKILL.md`.

## Verdict
**PASS** (0 blocking, 4 should-fix, 5 nits). Every displayed number, all 16 challenge keys and all 10 Try-it lines check out.
- **Must-check outcomes:**
  - **Truth tables:** AND 0001, OR 0111, XOR 0110 and NAND 1110 are built from the gate definitions. The census is 4/16/256, with 2 constant, 70 balanced and 184 neither (n = 3), and 6 balanced, 8 neither (n = 2).
  - **Reversibility (bijection):** AND has 3 preimages of 0 and CNOT is a bijection. 256 maps 2→2 hold 24 permutations (brute force), and Toffoli's PᵀP = I. (x, y) ↦ (x, y ⊕ f(x)) is an involution for all 16 two-bit f.
  - **Toffoli/Fredkin:** Toffoli 110 → 111, AND at c = 0 and NAND at c = 1 (N&C Fig. 3.18, p. 160). The widget's Fredkin is controlled by the first bit, while N&C Fig. 3.15 uses the third (nit 8).
  - **GF(2):**
    - (001; 111) reduces by a swap, then row 2 into row 1, to rank 2 and kernel {000, 110}. y·110 = 0 for 000, 001, 110, 111.
    - (110; 011; 101) has GF(2) rank 2, against real det 2 and real rank 3.
    - Hamming [7,4]: 1110000 is a codeword, each single flip reads its own place, and there are 16 codewords, so k = 4.
  - **Query costs:** 2^{n−1} + 1 = 513 at n = 10 (adversary: C(1024 − k, 512) = 0 first at k = 513). Grover k* = round(π/(4 arcsin 2⁻¹⁰) − ½) = round(803.748) = 804, with success 0.99999976. The classical worst case is N − 1 = 1 048 575.
  - **`introduces`:** boolean:b4 sets it on Q4's `qc-xor` and xor:b4 on Q16's `qc-bit-dot`. Each is per chapter (Q4.story:559 and Q16.story:61 keep theirs). F7's 12 new glossary ids exist nowhere else in 709, so no glossary term is duplicated.
  - **Bridges:**
    - **Out:** `qc-f6-pairs` (F6.1), `qc-f4-unitary` (F4.4), `qc-f3-matrix-of-map` (F3.2), `qc-f2-vectors` (F2.1), `qc-q4-one-qubit-gates` and `qc-l1-logic` resolve to the units their labels and sentences name.
    - **In:** Q4 :553/555/564/566, Q5 :51/53/102/184/186, Q15 :137/140, Q16 :67/129/217/220/341/344, Q17 :57 and F8 :73/217/423 ("Unit F7.3" = f7-xor, "Unit F7.4" = f7-gf2). Each lands on the unit its sentence is about.
    - The one gap is F7 → F8 (item 3).

## Evidence summary
- **`revF78-f7.py`** (scratchpad), a route that shares no code with `f7.py`:
  - truth tables as Python lambdas and the census by `itertools.product`;
  - a state-vector simulator with index-flip Toffolis and `tensordot` Hadamards, and purity from the 4×2 reshape;
  - GF(2) rank as log₂|span|, null spaces by enumeration, the big-O threshold by a scan, and Grover from arcsin.
- **Result:** 95 of the 96 keys of `claims-qc709/f7.json` agree to 1e-9 (f7Rows3 = 8 is trivial), with 0 mismatches. All 16 challenge answers and every hint and prose number were re-derived. Examples:
  - garbage P = 0.5625 + 0.0625, with every other basis state at 0.0625;
  - Landauer at 300 K = 2.871e-21 J = 0.01792 eV;
  - (3n² + 5n + 7)/n² = 4.028 at n = 6 and 3.857 at n = 7.
- **Vitest (targeted, shared with F8), 565 passed, 0 failed:**
  - F7*/F8* content, the bits/numtheory/fourier engines, the bits/plot/complexPlane/fourier stages and bridges (15 files, 292 tests);
  - `claims.test.ts`, `visualSpecs.test.tsx` and `ComplexPlaneQc.test.tsx` filtered to F7/F8 (273).
- **Sources read.** N&C uses PDF − 28, confirmed on the page heads 129–160 and on the page image of p. 131. Bergou uses PDF − 15 / − 10 / − 8.
  - N&C pp. 129–134, 136–139, 152–153 and 155–160.
  - Bergou pp. 3, 12, 117–118, 126 and 170–171.
- **Try-its:** read against `widgets/BitTable.tsx` and `stage/svg/bits.ts` (no screenshots; read-only brief). All 10 lines can be done, and every readout and note string matches the code:
  - "AND(1 1) = 1", "1s: k of 4", "balanced" and "not constant or balanced";
  - "3 inputs → one output" with ×3, "reversible", and Toffoli(1 1 0) = 1 1 1;
  - 1101, "differ in 3 places", and a·b = 1 both before and after presses at places 1, 2, 4;
  - "swap rows 1 and 2", "add row 2 to row 1" and "null space: 000, 110"; a flip resets the step count, and the second run gives "000, 100";
  - 100/1024/32 and 400/1 048 576/1024, with n² as the dashed `vs` curve.
- **Captions:** every caption of the 27 beats, the reveals and the derivation views agrees with what its resolver draws. Examples:
  - `versus` gives the AND and CNOT panels;
  - the reduction ends after 3 moves on 101/011/000;
  - the cost:b3 dashed curve is n²;
  - the signed bars are (−1)^{110·x}.
- **Arcade:** the 5 F7 rounds are true, and their `wrong` indices are right.

## Blocking
None.

## Should-fix
1. **cost:b2 Formal: the beat and its derivation give different n₀.**
   - The beat defines O by "$f(n) \le c\,g(n)$ for all $n > n_0$" (N&C p. 136) and says "With $c = 4$ and $n_0 = 6$ … for $n \ge 7$".
   - Its derivation's `result` is "n_0 = 7", and the last Formal step reads "for $n \ge n_0 = 7$". The glossary and `insightFormal` keep "n > n₀".
   - *Fix:* end the derivation on "$n > n_0 = 6$, i.e. $n \ge 7$". Alternatively, use "n ≥ n₀" everywhere and n₀ = 7. `f7-c-n0` ("least n from which …") can stay 7.
2. **Some N&C page cites do not hold the statement they support** (checked on the page text and on the image of p. 131):
   - **boolean:b1 F and review formal point 1:** "$f:\{0,1\}^n\to\{0,1\}$ … (N&C §3.1.2, p. 129)". p. 129 defines a logic gate {0,1}^k → {0,1}^l. The term "Boolean function" is defined at the foot of p. 132 and the top of p. 133.
     - *Fix:* "pp. 129, 132–133".
   - **`qc-truth-table` gloss "(N&C p. 129)":** pp. 129–134 print no truth table; the first are Fig. 3.15 (p. 157) and Fig. 3.17 (p. 159).
     - *Fix:* "Fig. 3.17, p. 159".
   - **boolean:b4 F and the review card, "NAND is universal … (N&C p. 133)":** p. 133 proves universality from wires, ancillas, FANOUT, CROSSOVER and AND/XOR/NOT. NAND alone is Ex. 3.8 on p. 134.
     - *Fix:* "(N&C pp. 133–134, ⚑ Ex. 3.8)".
3. **The forward reference to F8 is still in words, though both chapters are merged.**
   - xor:b6's reveal (F) says "… the case of one bit in the roots-of-unity sum of Chapter F8".
   - Ruling R7 turns these words into bridges at the merge. F8 already did so in the other direction, and `qc-f8-roots` is registered (bridges.ts:93) and used by Q16:129.
   - *Fix:* "… the case $N = 2$, one bit at a time, of <<qc-f8-roots|Unit F8.3>>'s sum". Also drop the stale header line `F7.story.ts:20` ("F8 is built in parallel").
4. **Symbols used without definition, and indices that start at different numbers.**
   - Formal xor:b5 derivation step 2 uses $u$ undefined. *Fix:* "with $u = a\cdot x$ for the pair's first member".
   - Formal xor:b2 uses $k$ in "(x ⊕ k) ⊕ k = x" and $s$ in Simon's promise without defining them. *Fix:* "for any string $k$" and "a hidden string $s$".
   - Formal cost:b4 uses "$k^*$" undefined. *Fix:* "the best number of steps $k^* = 804$".
   - **Index bases:**
     - These count from 0: x₀x₁ (xor:b4, reversible:b5), "pivots in columns 0 and 2" and "free column 1" (gf2:b4), and "a 1 in place 0" (xor:b5 Ground derivation).
     - `f7-g-null`'s option `why` uses s₁, s₂, s₃, and gf2:b3 and `f7-g-syn` count "places 1 to 7".
     - *Fix:* use s₀s₁s₂ in `f7-g-null`, and say once at gf2:b3 that places count from 1 there because the syndrome spells the place number.

## Nits
5. **Ground gf2:b4 reuses $y$** (reversible:b3's spare bit) for the measured strings. *Fix:* "outcome strings $y$".
6. **The review card's "Toffoli gives AND at $c = 0$ and NAND at $c = 1$" has no figure cite.** *Fix:* add "(Figs. 3.17–3.18, pp. 159–160)", as reversible:b3 has.
7. **boolean:b2 counts different things in the two tracks.** Its Ground caption says "$2^4 = 16$ functions (OR is one of them)", while the Formal caption counts "tables". *Fix:* use one word in both.
8. **The Fredkin control bit is on the other side from N&C.** `gateTable('Fredkin')` swaps the last two bits under the first. N&C Fig. 3.15 (p. 157) swaps a and b under c, so the widget's Fredkin table differs from the book's row by row.
   - *Fix:* one line in the `bits.ts` doc and the widget note: "control first (N&C Fig. 3.15 puts it last)".
9. **`f7.py` takes `f7HammingK` from `np.linalg.matrix_rank`, a real rank, for a GF(2) rank.** It agrees here (3), but the check is not a GF(2) route. *Fix:* use `rref_masks(M7)`. Also gf2:b1 F's "is a field" could link F1's `qc-field` gloss.

## Checked and right
- **Boolean:**
  - The counts are 2^{2^n} = 4, 16, 256; C(8,4) = 70 (27.3 %); C(4,2) = 6.
  - T_BAL3 is balanced.
  - The NAND identities hold on every input.
  - The half-adder gives sum 0 and carry 1 for 1 + 1 (Fig. 3.5, p. 132).
- **Reversible:**
  - Bergou p. 3 says AND has no quantum version.
  - N&C p. 153 treats irreversibility as erasure and gives Landauer's bound. p. 155 says reversible computing has no floor.
  - Eqs. 3.7–3.8 (p. 158) give uncomputation. The three-bit AND cleans w on all 8 inputs.
  - With garbage, P(00) = 0.625 and the reduced purity is 0.625; when clean, P(00) = 1.
- **XOR and GF(2):**
  - The sums and dot products: 1011 ⊕ 0110 = 1101, 110·011 = 1, Σ(−1)^{110·x} = 0 and Σ(−1)^{000·x} = 8. a·x ⊕ b is balanced iff a ≠ 0 (16 cases).
  - Bergou: Eqs. 7.1–7.2 (p. 118) and Eq. 7.30's bitwise ⊕ (p. 126). The check matrix, weight, syndrome He and d = wt(x + y) are on pp. 170–171 over F₂, which honours R5.
- **Cost:**
  - 45 = C(10,2) (N&C p. 138); O, Ω and Θ are on pp. 136–137; "polynomial = efficient" is on p. 139.
  - p. 153 names BPP and BQP and mentions P.
  - 2³⁰ = 1.07e9, 2⁵⁰ = 1.13e15, and 21² − 20² = 41.
- **Derivations:** all seven have ≥ 2 distinct views in each track and end on their stated result.
- **Rulings:** R1–R8 are followed (R6: "mixing gates" plus the Q4 chip; R8: ⚑ items are cited only).
- **Housekeeping:** there is no raw TeX in learner prose (scanned outside `tex`, `result` and `equations`) and no plan ids, and every Foundations reference is a chip.
