# P review: 709 F8 "Hidden rhythms" (main e36eaf1, reviewed 2026-10-11)

Reviewer: independent P verifier (read-only; not the builder). Skill: `skills/06-chapter-review/SKILL.md`.

## Verdict
**PASS** (0 blocking, 4 should-fix, 5 nits). Every displayed number, all 18 challenge keys and all 12 Try-it lines check out. The faults are an incoming reference that names the wrong chapter, a Ground symbol, a walkthrough's wording, and page and equation numbers.
- **Must-check outcomes:**
  - **Order of 2 mod 21:** 2^x mod 21 runs 1, 2, 4, 8, 16, 11, 1. The order is 6 by scan, and the least shift period of a 60-long list is also 6. ord(5) = 6, the units of 21 number 12, and every order divides 12. 2¹⁰⁰ ≡ 2⁴ = 16.
  - **gcd, inverse and Euclid:**
    - 84 = 2·36 + 12 and 36 = 3·12, so gcd = 12 = 1·84 − 2·36 (Thm A4.2, p. 626).
    - 2⁻¹ ≡ 11 and 4⁻¹ ≡ 16, while 3 has no inverse.
    - Splitting 21: 2³ = 8, 63 = 7·9, gcd 7 and gcd 3. Both gcds are proper factors whenever x^{r/2} ≢ ±1, a stronger statement than N&C's "at least one", and true.
    - The powers of 3 run 3, 9, 6, 18, 12, 15, never 1.
  - **Sums of n-th roots of unity:**
    - Σω^k = 0 for N = 2, 5 and 12, and Σω^{jk} = 0 for N = 8 with j = 2, 3. It equals 8 at j = 8.
    - Every third 12th root gives 0, and |1 + ω + ω²| = 1 + 2 cos 30° = 2.7321.
    - The 5th roots are 0.309 + 0.951i, 72° apart.
  - **DFT:**
    - Unitarity: max|F₈†F₈ − I| = 0 (N&C Ex. 5.1, p. 217, derived in full).
    - The sign is + (N&C Eq. 5.1, p. 217; numpy `fft` is the conjugate, `ifft(norm='ortho')` equals F).
    - Entries: (F₈)₁₁ = 0.25 + 0.25i and (F₈)₀₀ = 0.3536.
    - Combs: step 2 gives 0.7071 at 0 and 4, step 4 gives 0.5 ×4, and the shifted comb gives ĉ₄ = −0.7071. Step 3 on 8 gives 0.375/0.2429/0.2429, and |ĉ_k| = √(3/8) D₃(3k/8) at every k.
  - **The 32-input comb and the continued-fraction recovery of 6:**
    - The tallest bars are 0, 16 (0.1875 each) and 5, 11, 21, 27 (0.1168 each).
    - 5/32 = [0; 6, 2, 2], with convergents 1/6, 2/13, 5/32. |5/32 − 1/6| = 0.0104 ≤ 1/72 = 0.0139. 2¹³ ≡ 2.
    - The convergent test on all 32 bars returns 6 only for y = 5 and 27 (27/32 = [0; 1, 5, 2, 2] → 5/6), with P = 0.2336.
    - 11/32 → 1/3, 16/32 → 1/2 and 21/32 → 2/3.
  - **Dirichlet kernel values:**
    - D₈: 1 at 0, 0.6407 at 1/16 (squared 0.4105 > 4/π² = 0.4053), and 0 at 1/8. The window minimum is at the edge.
    - D₆₄(1/128) = 0.63668 > 2/π = 0.63662. D₄(1/8) = 0.6533. The gap D₁₀₀₀₀ − 2/π is about 3e-9.
  - **Bridges:**
    - **Out:** `qc-f7-xor` (F7.3), `qc-f7-gf2` (F7.4), `qc-f1-euler` (F1.4), `qc-f1-phase` (F1.5: f1-phase:b2 shows the opposite pair cancel), `qc-f2-inner-product` (F2.2), `qc-f4-unitary` (F4.4) and `qc-f1-multiply` (F1.3) land on the units their sentences name.
    - **In:** Q11:476 (`qc-f8-clock`, `qc-f8-roots`) and Q16:129 (`qc-f8-roots`) are right. F1's forward reference is wrong (item 1), and F7's is still words (P-F7 item 3).
  - **Glossary:** F8's 11 ids are new. No duplicates exist in F1–F7, Q1–Q17 or 448, and F8 sets no `introduces` on a reused id.

## Evidence summary
- **`revF78-f8.py`** (scratchpad): a route that shares no code with `f8.py`:
  - Python `%`/`pow`, brute-force inverses and orders;
  - explicit exp-sum DFT matrices (not numpy fft);
  - continued fractions by integer Euclid, with convergents evaluated from the nested form;
  - D_M as a direct sum of M arrows.
- **Result:** 122 of the 122 keys of `claims-qc709/f8.json` agree to 1e-8, with 0 mismatches. I re-derived all 18 challenge answers and their hint numbers, and the extra values below:
  - 17 mod 12 = 5; gcd(91, 35) = 7; 5⁻¹ ≡ 17 (mod 21); gcd(3, 15) = 3; 30°; |Σ_{k<9}ω^{3k}| = 0; Σω^{12k} = 6; (F₄)₁₂ = −0.5; the spike 1/√8 = 0.354; ĉ₄ = −0.5; the geometric sum 1.481; chord 1.732; D₄(1/8) = 0.653; 0.1101₂ = 0.8125; 13/64 → 1/4; 21/32 → 2/3;
  - the phasor sizes 2.879 (0/20/40°), 2 and 0.
- **Vitest:** shared with F7 (see P-F7): 565 passed, 0 failed, including `fourier.test`, `numtheory.test`, `fourierStage.test` and `ComplexPlaneQc.test`.
- **Sources read** (offsets confirmed on the page heads):
  - N&C (PDF − 28): App. 4 pp. 625–638, §5.1 pp. 217–218, §5.3.1 pp. 226–230.
  - Bergou: pp. 127–129 (PDF − 10) and p. 60 (P3.3, PDF − 13).
  - Axler (PDF − 14): 4.8 p. 123, de Moivre p. 125.
- **Try-its, read against `ComplexPlaneQc.tsx` (`rootsUse`, `rootsState`, ROOTS_RANGE j 0–12), `complexPlane.ts` readouts and `ComplexPlane.tsx` (448 multiply, `deg` rounding):**
  - "corners used: 3 of 12, each 4 times" and "12 of 12, each 1 time";
  - the roots readouts "sum = 0", "size 0", "sum = 8" and "size 8";
  - the phasor sizes "2.879", "2" and "0";
  - φ=-135° → zw φ=90°, and w = −i → zw φ=135°;
  - all are as the code prints them.
- **Captions:** all 28 beats, the reveals and the derivation views match their resolvers. For example:
  - CHAIN(8, 3) is a closed star;
  - CHAIN(12, 3, 4) is the square 0/90/180/270°;
  - the `amplitudes` hue follows the phase, so the shifted spike at 4 is "the opposite colour";
  - `{dft:8}` box hues are 45jk°;
  - the fractions:b4 spoke sits at 60° beside z at 56.25°.
- **Arcade:** the 6 F8 rounds are true (3, 9, 6, 18, 12, 15; √3 = 1.732; ortho `ifft` = F; 0.6407 → 0.6367; 2³ = 8), and their `wrong` indices are right.

## Blocking
None.

## Should-fix
1. **An incoming forward reference names the wrong chapter.**
   - F1's clue reveal `f1-phase:b7` (Formal, `F1.story.ts:914`) proves 1 + ω + ω² = 0, then says "For every $N \ge 2$ … sums to zero the same way; Chapter F4 builds this". F4 is eigenvalues. The general sum is built in F8's roots unit (roots:b2–b3), which the F8 plan names as this clue's link-back.
   - *Fix:* "…; <<qc-f8-roots|Chapter F8>> builds this" (the id is registered). In roots:b2, say also that F1.5's clue did the case N = 3 by the same ωS = S argument.
2. **Ground track: ω is used before its prose defines it.**
   - roots:b1 Ground never names ω; only its expandable derivation does ("Call the arrow you reach ω").
   - roots:b2 Ground ("Turning the whole set by ω …") and roots:b3/b4 then use ω. The `symbols` table sends ω to `F8.outcomes[2]`, which does not define it either.
   - *Fix:* add to roots:b1 Ground: "Call the first stop, one turn from 1, $\omega$."
3. **The `f8-f-21` walkthrough contradicts the story.**
   - The walkthrough says "Since $k = 2$ and $r = 3$ share no factor, this bar would suggest the period 3".
   - fractions:b5's reveal (F) says that bar 21 is k = 4 of r = 6, a shared factor 2 that the fraction reduces to 2/3.
   - *Fix:* "In lowest terms the convergent is 2/3, so the bar suggests the period 3. The true $k = 4$ and $r = 6$ shared the factor 2, and the test $2^3 = 8 \ne 1$ rejects it."
4. **Equation and page cites.**
   - **geometric:b2 F:** "$\tfrac{2|\theta|}{\pi} \le |1 - e^{i\theta}| \le |\theta|$ for $|\theta| \le \pi$ (Eq. 7.41)". That form is Bergou **Eq. 7.42, p. 129**; Eq. 7.41 (p. 128) is the 0 ≤ θ ≤ π version.
     - *Fix:* "(Eqs. 7.41–7.42, pp. 128–129)". In the review card, change "Eqs. 7.40–7.41" to "7.40–7.42".
   - **euclid:b3 F:** "It divides the count of residues that have an inverse … (N&C p. 631)". p. 631 defines the count (Thm A4.9); the divisibility is **Ex. A4.16, p. 633**.
     - *Fix:* "(N&C p. 631; Ex. A4.16, p. 633)".
   - **`fourier.ts` `convergents` doc:** cites "Thm A4.15, p. 637". The theorem is on p. 636, as the story says.

## Nits
5. **Ground dft:b2 says "$F$ is unitary".** Only the caption names the table F. *Fix:* "the table $F$".
6. **Formal symbols with no definition.**
   - euclid:b1's derivation uses $q$ in "$a - qb$". *Fix:* "with quotient $q$".
   - euclid:b3 writes "$\mathrm{ord}(2)$" undefined. *Fix:* "the order of 2".
7. **Convergents are counted from different starts.**
   - fractions:b4 Ground and the review card call 1/6 "the first convergent", skipping 0/1.
   - `f8-f-cf` asks for "the first convergent after 0/1", and N&C counts [a₀] = 0 as the 0th.
   - *Fix:* say "the first convergent after 0" everywhere.
8. **fractions Try-it, bullet 2: one click rarely lands on φ=-90°.** The 448 multiply widget snaps a click to a 0.05 grid, so "click the bottom of the circle" reads φ=-90° only within about ±1.7 px. A near miss gives −87° and 132°.
   - *Fix:* "drag w until its row reads 0 − 1i (φ=-90°)".
9. **roots:b1 Formal names de Moivre without F1's gloss.** *Fix:* link `[[qc-de-moivre|de Moivre]]` instead of naming him in passing.

## Checked and right
- **Clock:**
  - 9 + 5 ≡ 2 (mod 12), 14 ≡ 2 and −3 mod 12 = 9.
  - The comb {0, 6, …, 30} has 6 teeth of chance 1/6.
  - N&C Eq. A4.2 (p. 626) gives the remainder; the order is defined on p. 633.
- **Euclid:**
  - Cor. A4.4 (p. 627) and Thm A4.5 (p. 628) are cited correctly.
  - Thm A4.11 and the algorithm are on pp. 633–635, and R4 is honoured: φ(N) never appears.
- **Roots:** ωS = S gives S = 0, and z = ω^j gives N or 0. This is cited to Axler 4.8 (p. 123) and de Moivre (p. 125).
- **DFT:**
  - The shift theorem holds: ĉ_k → ω^{sk}ĉ_k and the sizes do not change.
  - For c_j = √(r/N) on multiples of r, ĉ_k = 1/√r when N/r | k, and 0 otherwise.
  - Bergou's U_F (Eq. 7.34, p. 127) has the + sign, and its 1/2^m prefactor slip goes to Q18 under R6, as the books entry says.
- **Geometric:**
  - The S − uS trick gives 1.875.
  - Chords: 1 at 60°, 1.4142 at 90° and 0.9589 at 1 rad.
  - Jordan's bound gives D ≥ 2/π on |δ| ≤ 1/(2M) (Bergou pp. 128–129), and the bound is sharp from above.
  - A comb of A teeth has |ĉ_k| = √(A/N) D_A(rk/N).
- **Fractions:**
  - 0.101₂ = 0.625 = 225°; doubling gives 1.01₂, which lands at 90°.
  - The binary fraction is on N&C p. 218.
  - Thm A4.16 (p. 637) is the 1/(2q²) criterion. "Real runs take 2^m ≥ N² = 441" matches §5.3.1's 2L + 1 bits (p. 229).
- **Rulings:** R1–R8 are followed. For R7, the roots mode replaces the stand-ins and its Try-it gate passes. For R8, Ex. 5.1 is derived and P3.3 (p. 60, mod-N Bell states χ_{n,m}) is cited only.
- **Derivations:** all 8 have ≥ 2 distinct views in each track and end on their stated result.
- **Housekeeping:** there is no raw TeX in learner prose and no plan ids. Foundations references are chips, and chapters are named in words.
