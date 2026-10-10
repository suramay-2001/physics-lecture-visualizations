# P review: 709 Q15 "Secret keys from quantum rules" (main eb12685, reviewed 2026-10-10)

Reviewer: independent P verifier (read-only; not the builder). Skill: `skills/06-chapter-review/SKILL.md`.

## Verdict
**PASS** (0 blocking, 2 should-fix, 6 nits, 2 builder's-language questions).
- **Numbers are right:** every displayed decimal, every challenge key and every Try-it reading checks out with my own numpy route.
- **Both book Corrections are CONFIRMED** against the page images, and each `check()` computes the discrepancy from the engine:
  - **Eq. 6.6 (Bergou p. 111, PDF p. 122):** the page prints ½ for x = y and ¼ for x ≠ y, with no δ_ab. For |Φ⁺⟩ = (|00⟩+|11⟩)/√2 the exact table gives 0 to unequal results at x = y. `eq66Check()` builds the table from `localBasisProbs` and finds a printed gap of 0.5 and a corrected gap of 0. One clause tests a literal (item 3).
  - **σ_z defence (Bergou p. 113, PDF p. 124):** the page says that if Charlie has measured Bob's qubit the σ_z switch "does not happen", so a compared subset shows errors. That is false. My exact P(a, s, b, c) table for Charlie-reads-first equals the honest one (gap 0, error rate 0), and Charlie names the bit with chance 1. `sharingCheat` computes the same full table.
- **The four 448 L8 bridges land on the right units:** `qc-l8-key/-bb84/-attack/-test` → `l8-key/-bb84/-attack/-test`, which are Lecture 8's units 5–8, matching the text's "Spin Lab 8.5–8.8". The story never re-derives BB84's ¼.

## Evidence summary
- **`rev709q-q15.py`** (scratchpad): 57 checks, 0 mismatches. My own route: explicit 2- and 4-dimensional vectors, a brute-force USD optimum, an eigen-decomposition of Γ, explicit controlled-R_y matrices and exact branch sums. No engine code.
  - **B92:** s = 0.7071. A brute-force USD scan gives 0.2929, with E₀ scale 1/(1+s) = 0.5858. Under a never-wrong Eve, Q = s/2 = 0.3536 and Eve is right 0.6464. Under a minimum-error Eve, Q = 0.1464 and Eve is right 0.8536. Bob's kept share is 0.2929 under every Eve.
  - **Helstrom axis:** Γ = (ρ₁−ρ₀)/2 has eigenvalues ±0.3536 and trace norm 0.7071. The guess-|0⟩ axis is (θ, φ) = (45°, 180°), which is `HAX`. P(+n̂ | 0) = P(−n̂ | +) = 0.8536, so the b92:b4 caption ("by symmetry the same for |+⟩") is right.
  - **Probe:** at ξ = 90°, the x-error is 0.1464, Eve's guess is 0.8536 and |r_A| = |r_E| = 0.7071. At ξ = 0° they are 0, 0.5 and 1. At ξ = 180°, Q = ½(0 + ½) = 0.25.
  - **E91:**
    - The singlet's same-basis agreement is 0 for both xx and yy, and xy agreement is 0.5.
    - CHSH uses S = E₁₁ + E₁₂ + E₂₁ − E₂₂ (the engine's `lhvChsh` form). At Q10's settings the singlet gives 2.8284. |+x⟩|−x⟩ gives 1.4142, with a Horodecki maximum of 2.
    - Φ⁺ gives exactly 2 at (z, x | x, z) and has a Horodecki maximum of 2.8284 (the "max S" readout the e91:b4 caption explains). Its T is diag(1, −1, 1), which matches the e91:b4 caption.
  - **Sharing at θ = 22.5°:**
    - Both local arrows have length 0.7071, and P(+x) = 0.5.
    - |ψ₊⟩ sits at (45°, 0°) with x-part 0.7071. ψ± are 90° apart on the sphere, overlap 0.7071, and Charlie's USD succeeds with 0.2929.
    - USD success 0.5 at θ = 30°.
    - Try-it readings: P(+x) on ψ₊/ψ₋ = 0.854/0.146 and |α|² = 0.854.
    - z-agreement is 1 honest and 0.5 after the grab. A σ_z applied first leaves Charlie's guess at 0.5 and the record gap at 0.
  - **Pad:** caesar("secret", 3) = vhfuhw, and the distractors are tfdsfu (shift 1) and vifuhw (uneven shifts). 10110 ⊕ 01101 = 11011. The copy overlap is 0.5, and the reuse wire reads 1 = m₁ ⊕ m₂.
- **Vitest:** `npx vitest run` on Q15/Q16/Q17 content and crypto/povm/oracles/grover gives 9 files, 195 passed. `Q15.tryits.test.tsx` checks every Try-it line against the real widget code and output: `benchModel` (kept 50/51, 0.269, ±0.019) and BlochSphere/PairGrid markup. I re-read the widget props and readouts.
- **Pages read (images):** Bergou printed pp. 106, 107, 108, 109, 110, 111, 112, 113, 114 (= PDF − 11). N&C (= PDF − 28), from the text extract: Vernam §12.6.1 pp. 582–583, BB84 p. 587, B92 Eq. 12.188 pp. 589–590, EPR protocol p. 591. Every citation in the chapter matches.
- **No screenshots or Playwright, per the brief.** Captions were judged against the stage kinds' resolver source (`stage/svg/bb84.ts`, `stage/svg/twoQubit.ts`).

## Blocking
None.

## Should-fix
1. **`m` carries three meanings in one chapter.** The symbol table pins it to the message bit (`q15-otp:b2`).
   - **The other two uses:** it is the size of the test sample in `q15-bb84:b2` Formal ("a public test sample of $m$ bits … $(1 - Q)^m$"), and Charlie's x reading in the `q15-sharing:b5` reveal Formal ("his $x$ reading $m$ … $a = m \oplus \gamma$").
   - **Same problem the builder already fixed elsewhere:** the build notes renamed c→γ and φ→ξ for exactly this kind of clash.
   - *Fix:* write sharing:b5 Formal as "the $x$ reading he took of Bob's qubit, $\beta'$, and his own result $\gamma$, hence $a = \beta' \oplus \gamma$". In bb84:b2 write "a test sample of $N_{\mathrm{test}}$ bits misses her with chance $(1 - Q)^{N_{\mathrm{test}}}$". Then add `\beta'` and `N_test` to `symbols`.
2. **Ground track uses $P_E$ and Γ without defining them.**
   - **$P_E$:** the `q15-b92:b4` Ground derivation writes $P_E = (1-\sqrt{1-s^2})/2$ in steps 1 and 3. The Ground text never names it.
   - **Γ:** step 2's `why`/`viewCaption` and the `q15-b92:b5` reveal Ground caption ("Eve's best axis beside $\Gamma$'s two eigenvalues") use Γ, which only the Formal text defines.
   - *Fix:* append to b92:b4 Ground text "Call her error rate $P_E$. Chapter Q14 found it from Helstrom's operator $\Gamma$, half the difference of the two states' density matrices." Alternatively, reword the Ground caption to "Eve's best axis beside the two eigenvalues of Chapter Q14's best-split operator".

## Nits
3. **Eq. 6.6 box: one clause of `check()` tests a literal.** `eq66Check().printedRowSum` is the typed `4 * 0.5`, so `V.q15Eq66PrintedSum > 1.5` cannot fail. The discrepancy itself (printedGap 0.5 and correctedGap 0, from the engine's Φ⁺ table) is real, so the box stands.
   - *Fix:* compute the sum from the same printed-value function the gap loop uses (Σ_{a,b} printed(x = y, a, b)), or drop that clause and the "add up to 2" sentence.
4. **`q15-b92:b1` caption ("bars … each 0.7071 long") is backed by `q15Overlap` = |⟨0|+⟩|.** That value equals the drawn amplitude 1/√2 only numerically (the P-Q1-review item 5 class).
   - *Fix:* add `q15B92Amp` = |⟨11|C_B92(1)⟩| with a numpy twin, or caption "each $1/\sqrt2$ long".
5. **`q15-bb84:b1` caption: "a seeded run of 16 photons: the rounds with matching bases are kept, the rest dimmed".** The kind draws only the last `BB84_LIMITS.rows` = 12 rows (`bb84.ts:96`); the readout counts all 16.
   - *Fix:* "a seeded run of 16 photons (the last 12 drawn): …".
6. **The `q15-bb84:b2` stage also shows "Eve knows N of K"** (`readouts: ['eve-knows']`), which neither caption mentions.
   - *Fix:* append "and how many kept bits Eve knows".
7. **The `q15-ot-xor` distractor `00011` has the why "ordinary binary addition with the carry kept".** 10110 + 01101 = 100011, and 00011 is that sum with the overflow bit dropped.
   - *Fix:* "That is ordinary binary addition with the top carry dropped; XOR drops every carry."
8. **Typed literals outside `V`:** the `q15-b92` unit `insight` (`Q15.ts:239`) hard-codes "0.2929" and "Q = 0.1464". Both values are right.
   - *Fix:* `` `…answers ${d(V.q15B92Kept, 4)} of the time … leaves only Q = ${d(V.q15QMinEve, 4)}.` ``
   - The `q15-bb-q` distractors "$0.50$" and "$0.125$" are deliberate wrong values, and may stay typed.

## Builder's-language questions
- **Bergou's "≈ 35.3%" on p. 107:** 1/(2√2) = 35.355%, which rounds to 35.4%. The builder calls this a truncation and ships no box. I agree no box is needed: the rulings do not list it, the books entry says "about 35%", and every displayed value is the engine's 0.3536.
- **P6.2 in the BB84 unit:** P6.2 (p. 114) is the entangling attack on **B92**, but it is cited in the BB84 unit's pages. That is defensible, because the unit carries the entangling attack. A reader may expect a BB84 problem, though; "(the same attack on B92)" would help.

## Checked and right
- **Derivations:**
  - D1 (pad): Ground ends on c ⊕ k = m, Formal on associativity.
  - D2 (Q = s/2): the step "Bob's success is 1−s for either state" is the key fact, and it is true (E₀|0⟩ and E₁|+⟩ both give (1−s²)/(1+s)).
  - D3 (Q = P_E): its eigenvalues and trace norm are right.
  - D4 (Eqs. 6.1–6.5): checked against p. 110, both the z zeros and φ₀₀ = φ₁₁.
  - E91: (H⊗H)Ψ⁻ = −Ψ⁻ and (U⊗U)Ψ⁻ = det U Ψ⁻.
  - D6: a = β ⊕ γ on all four branches.
  - Every `why` is a fair one-line reason.
- **Captions against stages:**
  - The C_PAD |11⟩→|10⟩→|11⟩ readings are right, and so is the C_REUSE third wire (1, never touching the key wire).
  - So are the C_COPY Φ⁺ bars, the C_SX singlet then H⊗H bars on |01⟩, |10⟩, and the C_SPLIT share wire 0 then 1.
  - The bloch-ball pairs, the Γ spectrum bars and the `HAX` measure readout match their captions.
  - two-qubit: the rLength readouts (1, 0.7071) and the S/max S readouts (2.8284/2.8284, 1.4142/2, 2/2.8284) match their captions.
  - In the `condition` views Bob's arrow is on +x and Charlie's at (45°, 0°).
- **Try-its:** all five match the widgets' declared props and rendered readouts:
  - bench Send 1/10/100/1000, compare bases, New run = next seed;
  - BlochSphere `measure` bars and |α|², |β|²;
  - the PairGrid family cos t|ud⟩ − sin t|du⟩.
- **Challenges:** all 16 keys and hints recomputed, including the stretch θ = 30° with tolerance 0.5°.
  - The ¼ warm-up (`q15-bb-q`) recalls the result with "(Spin Lab 8.7)". It does not re-derive it, consistent with R4.
- **Rulings:**
  - R2 unit order otp → b92 → bb84 → e91 → sharing.
  - R3: five units, with both B92 attacks in one unit.
  - R4: no seeded B92 ledger; BB84 is bridged.
  - R5: θ = 22.5°.
  - R6: the probe beat is `'deeper'` and says "Beyond the notes".
  - R7: P6.1–P6.4 cited only.
  - R8: `crypto.ts` plus `usdPovm`/`helstromPovm`.
- **Corrections:** both are worded "Our calculation finds …".
- **Text hygiene:**
  - No raw TeX outside `$…$`, and no plan ids in learner text (the only hits are code identifiers and comments).
  - The 15 glossary ids and terms duplicate nothing in 709.
  - Unit references check out (Unit 10.5 = q10-violation, 14.4 = q14-usd, 14.5 = q14-min-error), and so does Q14's E₀-as-inconclusive note.
