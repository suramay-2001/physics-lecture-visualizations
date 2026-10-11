# P review: 709 Q18 "Hidden periods: Simon, the QFT and phase estimation" (main c8ebe51, reviewed 2026-10-11)

Reviewer: independent P verifier (read-only; not the builder). Skill: `skills/06-chapter-review/SKILL.md`.

## Verdict
**PASS** (0 blocking, 3 should-fix, 9 nits).
- **Numbers are right.** Every displayed number and all 18 challenge keys agree with my own dense-matrix route.
- **All five book Corrections are CONFIRMED** on page images, which I re-rendered at 200 dpi from the PDF (printed = PDF − 10). None is cut. Each `check()` computes the discrepancy, and each box is worded "Our calculation finds …":
  - **Eq. 7.33 (p. 126):** the last line keeps 1/2^{(n+1)/2}. The check gives a printed squared length of 0.25 against 1, and the 1 comes from the circuit.
  - **Eqs. 7.34–7.35 (p. 127):** both print 1/2^m. The check gives 0.125 against 1. Eq. 7.36 does carry 2^{−m/2}.
  - **p. 127 expansion:** the page prints "2^{m−1}a₁ + 2^{m−1}a₂ + …". The check finds that 110 reads as 8 and 4 of the 8 strings are misread.
  - **Simon's equations (p. 126, last paragraph):** the page says "n independent equations yⱼ·ξ = 0, j = 1, …, n". The check finds s⊥ has rank 2 and three independent checks leave only 000.
  - **α/2π (pp. 129–130):** the page gives eigenvalues e^{±2iα}, then says a₊/2^m estimates α/2π and a₋/2^m estimates (2π − α)/2π. The check runs the circuit and finds the printed readings 001 and 111 have chance 0, while 010 and 110 have 0.5 each.
- **φ/τ (R1) holds in both tracks.**
  - φ is always an angle: in e^{iφ}, in the φ challenge and on the notation card.
  - τ is always the fraction of a turn: in the captions, the plot's x axis (`plot.ts` CURVE_X `'τ'`) and the counting eigenphases τ±.
  - The single Rosetta line is kickback:b1 (Formal).
- **No caption contradicts its picture.** I checked each caption against the resolver and scene code: the controlled-unitary feed lines (`CircuitScene` `feeds`), the 4-wire dial row, `keep` bars and peBest3. I took no screenshots, because the brief bars Playwright.

## Evidence summary
- **`rev709q18-check.py`** (scratchpad): 76 checks, 0 mismatches. My own route:
  - dense 2ⁿ matrices built gate by gate (q0 = top = MSB), np.fft and exact enumeration;
  - a 200 000-run Monte Carlo of Simon's run count (3.335);
  - the full order-finding state at t = 5, not the mixture formula. The mixture agrees to 8e−16.
- **Values, by unit:**
  - **Simon:** bars 0.3536 → 0.7071 at 00101/11101 → ±0.5 at 000, 001, 110, 111 (signs +, −, +, −). P(01) = 0.25. Rank 2. Two runs 0.375. Expected runs 3.333 and 10.6047 (n = 10). Collision 3/7, equal to the union bound.
  - **QFT:** F8 = np.fft.ifft·√8 (sign +), and the 7-column H/cS/cT/SWAP circuit equals F8 to 1e−15. Product angles for 101 are 180°, 90°, 225°; the bottom wire of 110 is 270°. |U_F|001⟩ − H⊗³|001⟩|_max = 0.7071.
  - **Kickback:** 225° on |11⟩. The controls equal U_F|101⟩. Target |+⟩ reads 000 and 101 with 0.5 each. U² at τ = 3/8 turns 270°.
  - **Phase estimation:**
    - The arrow chain gives 0.4105.
    - τ = 1/3: 0.6878/0.1749 at m = 3; 0.6849/0.1720 at m = 4; 0.6842 at m = 5; the limit is 0.6839; within one step 0.8628.
    - Worst cases 0.4105/0.4066/0.4056. The minimum of peBest3 over 20 001 τ is 0.4105.
    - t = 6. Within 1/8 has chance 0.9820 (N&C's |x − b| ≤ 7 event: 0.9806).
    - Tails at m = 8 are 0.189, 0.099 and 0.067. Bergou's 1/(2k−1) also holds at m = 3, 5, 10 for k = 2–4.
  - **Counting (own Q = (2|w₀⟩⟨w₀| − I)U_f):** M = 0 reads 000 with 1. M = 2 reads 010/110 with 0.5 each. M = 1 reads 001/111 with 0.3532 each and 000 with exactly 3/64. On the plane, Q = [[0.5, −0.866], [0.866, 0.5]], matching Eq. 7.44.
  - **Order:** r = 6. Peaks at 0, 5, 11, 16, 21, 27 (circuit and comb). Good readings 5 and 27. Success 0.2295 (t = 5) and 0.3320 (t = 11). CF[27/32] = [0; 1, 5, 2, 2] → 5/6. gcd 7, 3.
- **Vitest (targeted):** 16 files, 5 425 passed.
  - Q18, Q18.tryits, qft, oracles, qftStage, bridges, notation.numbers/taught, symbols, notationMark.corpus, claims, content, walk, verbatim, notation.context/classes.
  - Two scratch vitest files (`rev709q18-vt/`) listed the notation marks on all 1 147 Q18 TeX spans and dumped the learner text.
- **Pages read:**
  - **Bergou images:** pp. 126–130 and P7.2 (pp. 142–143). Bergou's text, p. 118 (§7.1 bit dot).
  - **N&C text:** pp. 217–230, 233–234, 240–242, 246 and 261–263.
  - Every citation checks out except item 5.

## Blocking
None.

## Should-fix
1. **Ground derivations use Formal-only symbols.** Ground prose never defines them:
   - **D1 (simon:b3):** n and z. Ground says "three bits x" and never names n or z.
   - **D5 (phase-est:b3):** δ, in "each 360°δ further turned". Ground b2 and b3 never name the leftover.
   - **D6 (counting:b3):** |α±⟩ and a± (step 2, step 4 and the result).
   - **D7 (order:b1):** U_x, |u_s⟩ and r. Ground speaks of U₂ and 6. D7's Ground step 2 also has the same TeX as step 3 (both are the result), so the relabelling is never shown.
   - *Fix:*
     - Ground simon:b1: "three bits ($n = 3$) …". Simon:b2: "say the pair is $z$ and $z \oplus s$".
     - Ground phase-est:b2: "the leftover $\delta = \tau - 3/8$".
     - Ground counting:b1: "the special states $|\alpha_\pm\rangle$". Counting:b3: "readings $a_\pm$".
     - D7 Ground: use $U_2$ and 6. Make step 2 show the shift, $U_2\sum_k e^{-2\pi isk/6}|2^k\rangle = e^{2\pi is/6}\sum_k e^{-2\pi is(k+1)/6}|2^{k+1}\rangle$.
2. **The classical-bound wording in simon:b6 is too strong.** The text says "s shows up only when two queries collide" (Ground) and "s = x ⊕ x′ needs a collision" (Formal).
   - **Why it is false:** without a collision, k queries rule out every s among their C(k,2) XORs. At the chapter's own n = 3, the queries {000, 001, 010, 101} answer 0, 1, 2, 3 with no collision, and their six XORs are every nonzero string except 110. So s is fixed with no collision.
   - **Why it is not Blocking:** the Ω(2^{n/2}) conclusion and the 0.4286 are right, because elimination also needs C(k,2) ≥ 2ⁿ − 2.
   - *Fix:*
     - Ground: "… s shows up when two queries collide, or once every other string is ruled out; either way it takes about 2^{n/2} queries."
     - Formal: add "or C(k,2) ≥ 2ⁿ − 2 eliminations".
3. **Two notation cards misstate Q18 formulas.** The marks render cleanly (the corpus test passes), but the card text is wrong here.
   - **`cdot`:** marked on 31 spans, including y·s, z·y and (z⊕s)·y. The card says "multiply matching entries and add the results", with no mod 2. For 111·110 that gives 2 where the chapter's formula (and F7/Q16) gives 0. *Fix:* give `cdot` a `here` for 0/1 strings and bit variables beside ⊕: "Here: the bit dot product; add the matching products and keep only odd/even (mod 2)", with a learn-it link to `f7-xor`.
   - **`abs`:** marked on |G| and |K| in order:b4 Formal (Eq. 5.77). The card explains a modulus √(zz*), but here the bars count a set's elements. *Fix:* add a set case to `abs`'s `here` (a capital set letter: "the number of elements of K"), or write the count in words in that sentence.

## Nits
4. **Numbers typed into captions instead of read from `V`** (all values right):
   - simon:b3 viewCaption "±0.5", simon:b5 reveal captionFormal "0.25", counting:b3 caption "0.5", counting:b5 reveal caption "0.0469".
   - The `q18-q-wire` walkthrough's "top 0°, middle 180°" for 110 has no claim at all.
   - *Fix:* interpolate `d(V.…)`, and add `q18Prod110Top/Mid` from `qftProductAngles(6, 3)`.
5. **The N&C §5.4.3 range starts a page late.** It is cited as "pp. 241–242" in order:b4, both units' `lecture.pages` and the order `books`. §5.4.3 and the definition of the hidden subgroup problem begin on **p. 240**; Fig. 5.5 and Eq. 5.77 are on p. 241. *Fix:* "pp. 240–242".
6. **The `q18-p-third` hint 3 is ambiguous.** "the squared size of eight arrows … divided by 8" reads as |Σ|²/8 = 5.50. *Fix:* "Add eight unit arrows, each 360°δ further turned, divide the sum by 8, then square its size."
7. **qft:b4 Formal numbers wires 1–3**, as in "H, cR₂, cR₃ on wire 1 … SWAP(1, 3)". The drawn circuit labels them q0–q2. *Fix:* use q0–q2, or "the top wire …".
8. **The qft:b1 Ground caption says "45° times a·y"** right after Unit 18.1 taught "·" as the bit dot. *Fix:* "45° times a times y".
9. **Generic or loose wording:**
   - The `q18-k-which` walkthrough quotes 225° on a generic question. *Fix:* "turned by φ (225° in the running example)".
   - The `q18-o-eig` hint says "The order of 2 mod 21 is the number of eigenstates". U₂ on 21 places has 21 eigenstates. *Fix:* "of different eigenvalues".
   - order:b2 Formal never says what L is. *Fix:* "L = 5, the number of bits of N = 21".
   - order:b4 Ground lists "the period of 2^x mod 21 and the order" as two things, but they are the same number.
10. **The counting Try-it says "Drag the arrow to about 45° … the row reads P = 50.0%".** That reading is exact only at 45°. The Projector's slider (step 1°, still labelled "polarization χ", as noted in Q17) reaches 45 exactly. *Fix:* "Set the slider to 45°" or "about 50%".
11. **Small wording slips:**
    - counting:b5 captionFormal says "the circuit of Unit 18.5", but it sits inside Unit 18.5. *Fix:* "the counting circuit".
    - The qft review Formal point says "the inputs differ by up to 0.7071". *Fix:* "the outputs".
12. **Corrections bookkeeping:**
    - E5's `where` should be "Bergou pp. 129–130", since the sentence starts at the foot of p. 129.
    - The `qc-quantum-counting` gloss cites "Bergou p. 130" for α/π. *Fix:* add "(corrected)".
    - E1's rank comes from `simonPerp` (enumeration). Taking it from the circuit's support, {y : yChances[y] > 0}, would tie the box to Simon's circuit.

## Builder's-language questions
- **Simon draws two oracle boxes**, each labelled U_f (one per answer bit). This is acceptable under R5, since Bergou's single U_f is their product. A caption word ("U_f, one answer bit per box") would help.

## Checked and right
- **Rulings:**
  - R1: τ, with one Rosetta line.
  - R2: five boxes, each "Our calculation finds".
  - R3: `q18-order` is all books/clue.
  - R4: peBest3 has 257 sample points at spacing 1/256, so every 1/16 cusp is a sample point; `keep` is probability-only and validated.
  - R5: n = 3, s = 110 on 5 wires.
  - R6: N = 4, m = 3.
  - R7: the Try-its use existing widgets. `Q18.tryits.test.tsx` renders them, and I re-derived each promised reading.
  - R8: Ex. 5.8 and P7.2 are cited only.
- **QFT convention:**
  - U_F|a⟩ = 2^{−m/2}Σ e^{+2πiay/2^m}|y⟩, which equals `dftMatrix` and F8's Fourier view.
  - q0 is the MSB, as in `state.ts`.
  - The product form puts 0.a_m on the top wire (N&C Eq. 5.4).
  - PE's top control takes U^{2^{m−1}} (Fig. 7.6).
  - The inverse runs the columns reversed with S†/T†. That gives 11 columns for m = 3 and 16 for m = 4.
- **Phase estimation:**
  - Bergou Eqs. 7.38–7.43 are paraphrased correctly, including |δ| ≤ 2^{−(m+1)} and 2|θ|/π ≤ |1 − e^{iθ}| ≤ |θ| for |θ| ≤ π.
  - "Bergou rounds it to 0.4" is accurate.
  - N&C's t = n + ⌈log₂(2 + 1/(2ε))⌉ (Eq. 5.35, p. 224) is right.
- **Counting:**
  - Eq. 7.44 and |α±⟩ = (|w₀⟩ ∓ i|w₀⊥⟩)/√2 are checked numerically, and Q is consistent with Q17.
  - "N&C writes θ = 2α" is right (sin²(θ/2) = M/N, p. 262).
  - Eq. 6.33 is on p. 263, written for 2N.
- **Order finding:**
  - The 21/2 example matches F8 (euclid:b4 cracks 21 with order 6).
  - Only 5 and 27 pass the convergent test at t = 5.
  - No speed claim goes beyond N&C's O(L³) (Box 5.2, p. 228).
- **Bridges:**
  - The four new ones land on the units that teach their topics: `qc-f8-dft` → F8.4, `-geometric` → F8.5, `-fractions` → F8.6 (binary 0.101₂ and continued fractions), `-euclid` → F8.2.
  - The reused ones are right too: `qc-f8-roots` → F8.3, `qc-f8-clock` → F8.1, `qc-f7-xor` → F7.3, `qc-f7-gf2` → F7.4, `qc-f4-unitary` → F4.4.
  - The unit numbers in the chips are correct.
- **Text hygiene:**
  - No raw TeX outside `$…$`: the 57 hits are all derivation display lines.
  - No plan ids in learner text.
  - The 10 glossary ids/terms duplicate nothing in 709, and the reused ids exist.
  - "Unit 18.2" and "Unit 18.5" resolve.
  - "not §7.1's bit dot" is right (Bergou defines x·z mod 2 on p. 118).

## R fixes (709 Q18 fix pass)

Every should-fix and every nit is fixed; no item was declined. Commits are on the fix branch, in this order.

| Item | Fix | Commit |
|---|---|---|
| 1 | Ground now defines its own symbols. Simon b1 says $n = 3$ bits; b2 calls the pair $z$ and $z \oplus s$; phase-est b2 names the leftover $\delta = \tau - 3/8$; counting b1 names $|\alpha_\pm\rangle$ and b3 the readings $a_\pm$. D7 (order b1) uses $U_2$, 6 and $|u_s\rangle$ in Ground, shows the shift in step 2 ($U_2\sum_k e^{-2\pi isk/6}|2^k\rangle = e^{2\pi is/6}\sum_k e^{-2\pi is(k+1)/6}|2^{k+1}\rangle$), and the derivation's result is now the running example $U_2|u_s\rangle = e^{2\pi is/6}|u_s\rangle$, so both tracks end on it (Formal's last line goes from $r$ to 6). | 15fa8fc |
| 2 | simon b6: Ground says $s$ shows up on a collision or once every other string is ruled out, either way about $2^{n/2}$ queries; Formal adds the elimination bound $\binom{k}{2} \ge 2^n - 2$ and says a collision "occurs with probability at most" the union bound. | 15fa8fc |
| 3 | `cdot` between bit strings or bit variables says "the bit dot product: add the matching products, then keep only whether the sum is odd", with its own learn-it link to F7.3 (`taughtHere`). `abs` around a set letter says "the number of elements of K". Both are read from the chapter's own text (`content/notationVocab.ts`): `bits` when the chapter links the glossary entry `qc-bit-dot` (F7, Q16, and Q18 after its simon b3 now links it), `sets` for capitals the chapter writes as sets (`G = \{…\}`, `h \in K`). A capital letter alone is not enough: `|S|` in Q10 and Q15 is the CHSH number. Two single bits (1·0), numbers, angles (225°·y), names (a·bi), powers and gate letters (X·Z) keep the plain dot. `notation.classes.test.ts` names the Q18 sites, the F7 and Q16 sites, the 448 chapters and the Q10 `|S|` sites; the corpus layout test now passes the vocabulary too. | 6a9aab7 |
| 4 | simon b3 viewCaption, simon b5 reveal captionFormal, counting b3 caption and counting b5 reveal caption read their numbers from `V`. New keys `q18Prod110Top` and `q18Prod110Mid` (with `q18Prod110Bot` now claimed in qft b3) feed the `q18-q-wire` walkthrough; numpy twins in `pipeline/claims_qc709/q18.py`, fixture regenerated. | b22f3ac |
| 5 | N&C §5.4.3 is cited as pp. 240–242 in order b4, both units' `lecture.pages` and both `books`. | b22f3ac |
| 6 | `q18-p-third` hint 3: "Add eight unit arrows, each turned 360°δ further than the last, divide the sum by 8, then square its size." | b22f3ac |
| 7 | qft b4 Formal names wires "top, middle, bottom" (the drawn labels are q0–q2). | b22f3ac |
| 8 | qft b1 Ground caption: "45° times a times y". | b22f3ac |
| 9 | `q18-k-which` walkthrough: "turned by φ (225° in the running example)". `q18-o-eig` hint: "number of different eigenvalues". order b2 Formal: "$L = 5$ is the number of bits of $N = 21$". order b4 Ground: Simon's string and the order are the puzzle; the shift of the order is the period of $2^x$. | b22f3ac |
| 10 | Counting Try-it: "Set the slider to 45°" (the Try-it test checks the new words). | b22f3ac |
| 11 | counting b5 captionFormal: "the counting circuit". qft review Formal: "the outputs differ by up to 0.7071". | b22f3ac |
| 12 | E5 `where` is "Bergou pp. 129–130" (the page test now reads pp?.). The `qc-quantum-counting` gloss says "Bergou p. 130, corrected". E1's rank comes from the circuit's support (`yChances > 0`), in the engine and in its numpy twin. | b22f3ac |

The Builder's-language question (two oracle boxes drawn for Simon) is unchanged: acceptable under R5, as the review says.
