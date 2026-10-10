# P review: 709 Q16 "One query, many answers: Deutsch–Jozsa and Bernstein–Vazirani" (main eb12685, reviewed 2026-10-10)

Reviewer: independent P verifier (read-only; not the builder). Skill: `skills/06-chapter-review/SKILL.md`.

## Verdict
**PASS** (0 blocking, 2 should-fix, 4 nits, 1 builder's-language question).
- **Numbers are right:** every displayed number, all 12 challenge keys and both running examples check out with my own numpy route.
  - DJ n = 3: `F_BALN` = 1 on {001, 010, 011, 100}, and `F_BAL` = x·101.
  - BV n = 4: a = 1011, b = 1.
- **Exact classical minimax:** a brute-force minimax over every adaptive deterministic strategy gives **2, 3, 5** for n = 1, 2, 3, equal to 2^{n−1}+1. The engine's `djMinimaxQueries` agrees and is asserted at module load.
- **The phase-kickback form is honest:** I ran Bergou's ancilla circuit (Fig. 7.1, target in |−⟩) with a dense f-CNOT. Every amplitude the chapter draws in the phase form is reproduced to 1e-12.
- **No book Corrections** (none required by the rulings). Bergou's two print slips (the target's 1/√2 in Eq. 7.4, and the garbled Walsh condition on p. 120) are silently written right. I confirmed both on the page images.

## Evidence summary
- **`rev709q-q16.py`** (scratchpad): 36 checks, 0 mismatches. My own route: dense Kronecker H^{⊗n}, an explicit 2^{n+1}-dimensional f-CNOT with the |−⟩ target, exhaustive enumeration and a memoised minimax over (query, answer) histories. No engine code.
  - **Hadamards:**
    - H|1⟩ = (+0.7071, −0.7071), and H⊗H|11⟩ = (+½, −½, −½, +½).
    - H^{⊗3}|101⟩ has bars of 0.3536 with mean 0. Its minus signs are on **001, 011, 100, 110**, exactly as the hadamard-n:b4 reveal says.
    - (H^{⊗3})²|101⟩ = |101⟩. The Walsh sums Σ(−1)^{x·010} = 0 and Σ(−1)^{x·000} = 8. 1011·1101 = 0.
  - **DJ:**
    - After the query the bars are 0.3536. Down bars sit on 001, 010, 011, 100, matching the dj:b2 caption, with mean 0.
    - The output has P = ¼ on each of 100, 101, 110, 111, matching the dj:b3 caption, and 0 on 000.
    - f ≡ 1 gives ⟨000|out⟩ = −1 and a query mean of −0.3536.
    - x·101 lands on |101⟩ with P = 1.
    - ⟨000|out⟩ = 0 for all 70 balanced 3-bit tables.
  - **Classical cost:**
    - f(011) = 1 and f(110) = 0.
    - The minimax gives 2, 3, 5, and 2⁹+1 = 513.
    - For N = 8, k = 3, enumerating all 70 × 56 cases gives 1/7 = 0.1429, by enumeration rather than the formula.
    - 2·C(512,10)/C(1024,10) = 0.0018684.
  - **BV:**
    - Before the last H the bars are 0.25, 8 up and 8 down, with mean 0. The output amplitude on |1011⟩ is −1.
    - f(1000) = 0. Bergou's n+1 classical method uses 5 queries and recovers a.
    - "balanced ⇔ a ≠ 0" holds for all 32 (a, b).
    - b = 0 and b = 1 give identical output probabilities.
- **Vitest:** 9 files, 195 passed (Q15–Q17 content and the four engines). `Q16.tryits.test.tsx` checks the AmplitudeBars and ComplexPlane markup and slider ranges against each line. I re-read both widgets' declared props.
- **Pages read:**
  - **Bergou images**, printed pp. 117–120 = PDF − 10 for Ch. 7 (Ch. 6 is PDF − 11): Fig. 7.1, Eqs. 7.1–7.12, and "2^(n−1)+1 … in the worst case" on p. 117. Also P7.3 on p. 143.
  - **N&C text**, printed = PDF − 28: §1.4.4 with 2ⁿ/2 + 1 on p. 34, Eqs. 1.46–1.47 on p. 34, Eqs. 1.48–1.51 on p. 35, and the probabilistic remark with Exercise 1.1 on p. 36.
  - Every cited § and page is right, including the corrected "p. 36" (the plan said p. 35).
- **Stages:** the `amplitudes` 'signed' mode draws the dashed mean line and a "mean = …" readout (`AmplitudesScene.tsx:120–125`), so every caption that cites the mean line has it. `djCircuit('ancilla')` is Fig. 7.1 exactly: H on the inputs only, and the target initialised to |−⟩.

## Blocking
None.

## Should-fix
1. **Ground track uses N and |ψ_out⟩ without defining them.**
   - **N:** the `q16-classical-cost:b1` Ground derivation writes $\tfrac{N}{2} = 2^{n-1} = 4$ and "the first $N/2 = 4$ inputs". The Ground text only says "there are eight inputs".
   - **|ψ_out⟩:** the `q16-dj:b3` Ground derivation ends on $\langle0|\psi_{\text{out}}\rangle$. Only the Formal text defines $|\psi_{\text{out}}\rangle$, as "the state after the last column".
   - *Fix:* Ground classical-cost:b1 → "…so there are $N = 2^n = 8$ inputs." Ground dj:b3, last sentence → "Call the state after the last column $|\psi_{\text{out}}\rangle$; one reading of it decides, for certain: …".
2. **The clue `q16-classical-cost:b3` draws the ancilla circuit (`circ(C_DJA(F_BALN), 3)`) for its question, then the phase form for its reveal.**
   - **R2 allows the ancilla form only** in dj:b1 and the classical queries. dj:b2 tells the reader "From here on we draw the circuit in that form, without the target wire".
   - **The result:** the clue silently brings the target wire back, and the picture changes shape between question and reveal.
   - *Fix:* question stage `circ(C_DJ(F_BALN), 3)`. Drop the "third classical-cost clue" exception from the `Q16.story.ts`/`Q16.values.ts` headers.

## Nits
3. **A typed literal outside `V`:** the `q16-hadamard-n:b3` Ground step 3 `viewCaption` reads "mean $0.3536$". The value is right (1/√8), but it has no claim.
   - *Fix:* `` `…mean $${d(V.q16H3Amp, 4)}$` `` plus a `q16H3Amp` claim on that step.
   - Same class: the `q16-dj-lin` distractor "each with chance $0.25$" → `${d(V.q16DjBalnP, 2)}`.
4. **classical-cost:b2 (both tracks) and the review card say the miss chance is "about $2^{1-k}$".** The very next example is N = 8, k = 3: 0.1429 against 2^{−2} = 0.25.
   - *Fix:* "about $2^{1-k}$ when $N \gg k$" (the engine's own doc says this).
5. **Four clue questions have no caption on the question stage:** `q16-hadamard-n:b4`, `q16-dj:b4`, `q16-classical-cost:b3` and `q16-bv:b4`. Every Q15 clue has one.
   - *Fix:* one line each, e.g. "the input $|101\rangle$ before the Hadamards", "the circuit for $f = x\cdot101$, not yet read", "the circuit run once" and "the output for $a = 1011$, as chances".
6. **bv:b1 Formal says "at least $n$ queries are needed".** True for $a$ alone, and Bergou p. 120 says the same. But the method's $n+1$ also finds $b$, and that cost is tight.
   - *Fix:* append "($n + 1$ if $b$ is wanted too)".

## Builder's-language questions
- **Bergou says classically "n times at least" for BV, then describes n+1 queries** (p. 120). The chapter states both ("at least n … Bergou's method uses n + 1"). I agree with that choice; no box is needed.

## Checked and right
- **Derivations:**
  - D1: the per-wire rule → tensor product → parity, with Ground ending on the stated result.
  - D2: the Walsh sum factorises over bits. The (x ⊕ y)·z step for (H^{⊗n})² is right.
  - D3: the all-zeros row of H^{⊗n} is uniform +2^{−n/2}, and "8 × (−0.3536) × 0.3536 = −1" holds.
  - D4: the adversary argument, both the "different answer kills constant" and "same answer kills balanced" halves.
  - D5: (−1)^{a·x⊕b} = (−1)^b(−1)^{a·x}, and the Walsh sum keeps y = a.
  - Every `why` is a fair one-sentence reason, and both tracks end on the result.
- **The print slip in Eq. 7.4:** dj:b2 Formal's "(Eq. 7.4, with the target's $1/\sqrt2$ kept)" handles it without a box, which the rulings allow (no box without an engine check).
- **Captions against stages:** every beat and reveal caption matches its circuit and bars, including the down-bar lists, the "100 %", "one bar −1" and "eight up, eight down" captions, and the target readings 1, 0, 0.
- **Try-its:**
  - The AmplitudeBars x-basis rows on |−z⟩ read 1/√2 and −1/√2. θ = 0° gives both +; |−x⟩ gives (0, 1); φ = 0° gives (1, 0).
  - The ComplexPlane phasor sums are 0 then 2, and 3 then 1.
  - All four are one-qubit stand-ins (R5) and true on their widgets.
- **Challenges:**
  - Recomputed −0.5, 0, 0, 0, −1, |101⟩, 5, 513, 0.143, 1011, 5, and "no".
  - The distractor reasons are right (e.g. the four-strings distractor is the non-linear f's output).
  - Hints step nudge → idea → setup.
- **Rulings:**
  - R1: the running examples.
  - R2: phase form in every amplitude view, apart from item 2.
  - R3: the randomized cost is kept, with N&C p. 36.
  - R4: the minimax is in the engine.
  - R5: stand-ins.
  - R7: P7.3 is cited only, and its summary matches p. 143 (f(x) + f(x̄), two evaluations).
- **Text hygiene:**
  - No raw TeX outside `$…$`, and no plan ids in learner text.
  - The 7 new glossary ids/terms duplicate nothing in 709. Q5's `qc-phase-kickback`, `qc-walsh-hadamard` and `qc-balanced` are reused, not redefined.
  - Unit cross-references ("Unit 16.1/16.2/16.4", "Chapter Q4/Q5") resolve.
