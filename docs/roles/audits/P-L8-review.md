# P review: 448 L8 "Polarization and BB84" (merge e4018ed, reviewed on main f6ccc5a, 2026-10-10)

**Verdict: FIX-FIRST** (1 blocking, 9 should-fix, 9 nits).
- Every engine value, every prose number and all six derivations are right. So are the photon/electron factor of 2, the circular-state phase signs and the sifted-versus-per-photon denominators.
- One challenge prompt states a false fact that steers the learner to the wrong key.
- The rest is these:
  - two captions that do not match their pictures;
  - a widget amplitude with the opposite sign to the notes;
  - a symbol (Q̂) shown before it is defined, and with another meaning;
  - Rosetta, citation, raw-TeX and glossary hygiene.

Evidence (scratchpad `rev448-*`, read-only on main):
- **Numbers.** `rev448-l8.py` is an independent numpy route: explicit Pauli matrices, `scipy.linalg.expm`, and exact BB84 enumeration over Alice, Bob and Eve. It recomputes all 89 `V` keys, which agree to 1e-6 relative.
  - (¾)^20 = 0.003171, (¾)^100 = 3.207 × 10⁻¹³, (¾)^16 = 0.010023, (¾)^17 = 0.007517, and the smallest m is 17.
- **Seeded runs.** 20 seeded scenarios behind captions and Try-it lines were run through the app's own resolver and `benchModel` (`rev448-bb84.test.ts`): seeds 9, 20, 84 and 85, plus Catch Eve's 200-photon run (101 kept, so m ∈ [17, 21] is feasible).
- **Strings.** Every learner string was dumped from the built lecture and scanned for raw TeX, `_`/`^` outside `$…$`, plan ids, percentages and sentences over 25 words.
- **Code read for every caption and Try-it line.**
  - `Bb84Bench.tsx`, `PolarizationDial.tsx`, `Projector.tsx`, `BlochSphere.tsx`.
  - `stage/svg/bb84.ts` and `Bb84Scene.tsx`; `BlochScene.tsx` (drop lines, photon readout); `blochLabels.ts`; `HilbertPlaneScene.tsx`; `budget.ts`.
- **Sources.** Notes `sources/L8` pp. 1–11 and `sources/L9` pp. 1–6 (the p. 5 render). Townsend §2.7, pp. 59–65 (PDF 75–81).
- **Targeted vitest.** 11 files, 3069 tests passed: L8/L9 content, claims, bridges448, lecture8 engine and stage, Lecture8Widgets, games9. No Playwright run (brief); stage checks are from code.

## Blocking

1. **`l8-vs-mixed` prompt is false** (`L8.ts:161`). It says the mixture's Pauli averages still square to 1.
   - At r = (0, 0, 0.6), ⟨σ_z⟩² = 0.36.
   - What still holds is that every reading squares to 1, so ⟨σ_i²⟩ = 1.
   - Read as written, the prompt gives r² = 1 and a total of 2, not the key 2.64.
   - *Fix:* "Every Pauli reading still squares to 1, so $\\langle\\sigma_i^2\\rangle = 1$."

## Should-fix

2. **Overclaim at `l8-key:b1`** (`L8.story.ts:464`): BB84 "gives Alice and Bob shared random bits that Eve cannot read".
   - The notes state the goal: bits hidden from Eve.
   - They keep the claim narrow: Eve is not guaranteed to be caught (L9 p. 6).
   - `l8-attack:b5` then has Eve knowing half the sifted bits.
   - *Fix:* "…shared random bits, and a test that shows whether Eve has been listening."
3. **`l8-variance-sum:b4` caption does not match its picture** (`:122`). The caption speaks of two dashed lines.
   - For |+z⟩ both drop lines run from r = (0, 0, 1) to the origin (`BlochScene.tsx:227–228`). They coincide on the z axis, so one segment shows.
   - *Fix:* caption "both distances to the x and y axes are the full radius, so (Δσ_x)² = (Δσ_y)² = 1". Or move the drop lines to the STAR state of b2.
4. **`l8-photon-spin:b3` split: the two panels show different states** (`:391–392`).
   - The top plane turns a linear polarization 0° → 90°. The bottom sphere shows |C₊⟩, which "never moves" by the caption.
   - The caption never says the top arrow is not C₊; C₊ cannot live in the real slice.
   - *Fix:* "top: the lab turn, shown on a linear polarization (C₊ is not in this plane) · bottom: C₊ sits on the turning axis and only gains $e^{-i\\varphi}$".
5. **The Projector widget prints ⟨A|ψ⟩ with the opposite sign to the notes.**
   - With `labels: 'polarization'` the second port is e₂ = (−sin b, cos b) (`Projector.tsx:39`). At b = 45° that is the vector at 135°, which is −|A⟩.
   - So an H photon reads ⟨A|ψ⟩ = −0.707, while the notes (p. 3) give ⟨A|H⟩ = +1/√2.
   - The story stage flips its second axis to −45° (`HilbertPlaneScene.tsx:331–344`) and agrees with the notes. Chances are unaffected.
   - *Fix:* for polarization labels use e₂ at b − 90° (as the stage does at 45°). The spin labels share the convention; that is out of scope here.
6. **Q̂ and Q appear before they are defined, and Q̂ with another meaning.**
   - The ledger readout prints "Q̂ = …" and "exact Q = …" from `l8-bb84:b4`. Captions use Q̂ at `l8-attack:b3` (caption and view caption) and `l8-attack:b7`.
   - Q is defined at `l8-attack:b3` and Q̂ only at `l8-test:b1`, as the notes do it: n_err/m on the test sample. `l8-test:b3`'s caption then uses the readout's other meaning.
   - The readout's Q̂ is the error share of ALL kept rounds (`bb84Tally`), which Alice and Bob never see. When a test exists, it sits next to a second line, "test Q̂".
   - *Fix:* label the all-kept tally "kept-bit error share" (or "Q from all kept rounds"). Keep Q̂ for the test line, and add Q̂ to the symbols map at its first caption.
7. **Raw TeX outside `$…$`.** The lint (`content.test.tsx:232`) only catches backslash commands.
   - The Townsend card's `adds` (`L8.ts:369`) shows "e^{∓iφ}" and "J_z" literally.
   - Also `L8.story.ts:366` ("the generator σ_y") and outcome 3 (`L8.ts:22`, "σ_y").
   - *Fix:* `$e^{\\mp i\\varphi}$`, `$J_z$`, `$\\sigma_y$`, and widen the lint to `_` and `^{`.
8. **A citation attributes to Townsend what he does not say.**
   - The same `adds` (`L8.ts:369`) ends by saying optics books disagree on which circular state is right-handed.
   - Townsend says nothing of the kind. His footnote 13 (p. 64) pairs positive helicity with right-circular light, and his |R⟩ is our |C₊⟩ with e^{−iφ} (Eq. 2.116).
   - *Fix:* drop that sentence from `adds` (or make it an app note, not a book claim).
9. **Two Rosetta lines (ruling R3).**
   - (a) The notes write the one-time pad with m for the message bit (p. 6); the app writes x with no learner-visible line.
     - *Fix:* add to `l8-key:b2`'s caption "the notes write m; here x, since m is the test size later".
   - (b) The ϑ → χ line sits at `l8-turning:b3` (`:284`), but χ is used from `l8-polarization:b2` (text and caption).
     - It also says "as in Unit 1.3", and L1's learner text never writes χ (only a comment in `L1.values.ts` does).
     - *Fix:* move the line to `l8-polarization:b2` and drop "as in Unit 1.3" (here and in the `L8.story.ts` header).
10. **Eleven L8 glossary entries are never linked from the lecture.** L6 and L7 link every entry they own.
    - The eleven: `variance-sum`, `polarization`, `hv-basis`, `da-basis`, `rotation-pol`, `linear-polarization`, `circular-states`, `photon-spin`, `bb84`, `xor`, `qber`.
    - Three of them (hv-basis, linear-polarization, circular-states) appear only through `introduces`.
    - *Fix:* link at first use:
      - `[[qber|error rate]]` (attack:b3) and `[[xor|⊕]]` (key:b2);
      - `[[bb84|BB84]]` (key:b1) and `[[polarization]]` (polarization:b1);
      - `[[da-basis|…]]` (polarization:b3) and `[[rotation-pol|…]]` (turning:b1);
      - `[[variance-sum|…]]` (variance-sum:b3) and `[[photon-spin|spin 1]]` (photon-spin:b2).

## Nits

11. **Precision mismatch.** The `l8-variance-sum:b2` caption prints 0.625, 0.625, 0.750, while the budget bars print two decimals: 0.63, 0.63, 0.75 (`budget.ts:16`). Show `d(…, 2)` or widen the bar text.
12. **Captions that describe things not drawn.**
    - `l8-key:b2` (`:473`) gives the pad's bits while the stage is the p. 8 ledger.
    - `l8-polarization:b4` (`:201`) says "certain for D/A", but only the H/V frame is drawn.
13. **Symbols.**
    - `l8-turning:b4`'s text uses Δχ before defining it (`:290`); it is defined only in derivation step 2's "why".
    - The symbols map puts `\vec r` first in a Go-deeper beat (`l8-variance-sum:b6`), but `l8-photon-spin:b4` uses it in the notes' line. Say "Bloch vector r" there.
14. **Hand-typed numbers.** They bypass `V`, though claims cover them:
    - `l8-test:b6` reveal: "1.002%", "0.0075" (`:773`);
    - D6 step 3, the "why" and its view caption: "0.0032" (`:720`, `:722`);
    - `l8-attack:b4`: "⅛" (`:647`).
    - Use `d()` or `uf()` of `l8Miss16`, `l8Miss17`, `l8Miss20` and `l8PerPhoton`.
15. **Notes points dropped.**
    - The p. 8 caveat: a 0-of-2 sample proves nothing about errors or Eve (`l8-bb84:b6`).
    - The p. 7 remark that Eve may still hold partial information after late announcement (`l8-bb84:b7` reveal).
    - The p. 5 sentence that the ray angle is half the Bloch separation: claim `l8RayHV` exists with no prose.
    - The p. 3 absorbing-polarizer sentence.
    - One clause each.
16. **Ledger grammar.** The ledger prints "1 bits stay secret" (`stage/svg/bb84.ts:214`); seen at `l8-test:b3`'s start.
17. **`l8-attack:b7` ref** (`:686`) says the L9 notes hint that a partial Eve leaves less trace. L9 p. 3 says only that she gains less information. Fix: "learns less".
18. **Wrong code comments.** `L8.values.ts:200–201` give (¾)^100 as 3.17 × 10⁻¹³; it is 3.207 × 10⁻¹³. The displayed "3.2" is right.
19. **Fidelity note** `poincare-double-angle` (`fidelity.ts:447`) uses χ for a lab turn. L8 uses φ for turns and χ for the angle; write "turned by $\\varphi$ … by $2\\varphi$".

## Builder's language questions

None raised.
- "Light uses the whole angle where spin uses half of it" (`l8-turning:b5`) is a fair one-line contrast and matches the L1 book card.
- "Snooping half the time" (Go deeper) is fine.

## Checked and right

- **Numbers (89 keys).**
  - variance:
    - r = (0.612, 0.612, 0.500) and r² = 1; variances 0.625, 0.625, 0.750;
    - σ_i² = I; total 2 on a 13 × 12 grid; |+z⟩ gives (1, 1, 0);
    - θ = 54.7356° gives ⅓ and ⅔; mixtures total 2.64 and 3.
  - polarization: 0.75 and 0.25; 0.707 and ½; ⟨D|A⟩ = 0; mutually unbiased; ¼ at 60°.
  - turning:
    - +0.5; the columns; unitary;
    - the cos-difference identity on 6 pairs; 0.933 and 0.067; 0 at 90°, ½ at 45°;
    - spin 180° → 0; blocking angle 150°.
  - photon-spin:
    - i dR/dφ = σ_y; R = e^{−iφσ_y}; eigenvalues ±1 with eigenvectors C±;
    - phases −40° and +40°; (0.866, 0, 0.5);
    - sphere 90°/180° for light and 45°/180° for the electron; ray angle 90°;
    - J_z = σ_z in the C± basis; R(180°) = −I, R(360°) = I, R_y(360°) = −I, R_y(720°) = I.
  - key: 1011 ⊕ 0110 = 1101, and 0 ⊕ 1 = 1.
  - BB84:
    - ½; 0; ½; the board keeps 1, 4, 5, 6, both strings 0010, luck rounds 2 and 8; test 0/2, leaving 00;
    - ½ and 0; Q = ¼ from H and from D; ⅛ per photon sent; Eve knows ½;
    - the exit check ½ (0 with Eve in D/A); f = ½ gives ⅛ and ¼.
- **Challenge keys (23).**
  - Numeric: 2, 1, 2.64, 0.5, 0.25, 0.933, 150, 90, −40, 1, 0.5, 0.5, 0.25, 0.125, 0.0032 (tol 1e-4 accepts 0.0032), 17.
  - The order steps (the matrix build), the sift options (bits-agree distractor 1, 2, 4, 5, 6, 8; bases-differ 2, 3, 7, 8) and every choice "why" are true.
- **Derivations D1–D6.** Every step and "why" holds:
  - D4: −iG = [[0, −1], [1, 0]] ⇒ G = σ_y;
  - D5 conditions on matched bases;
  - D6 uses independence.
- **Factors and signs.**
  - Light at 2φ against the electron at φ (the dial computes `photonSphereAngle`).
  - R_pol(φ)|C±⟩ = e^{∓iφ}|C±⟩, as Townsend's Eq. 2.116.
  - H/V on ±z, D/A on ±x and C± on ±y, consistent with r(χ) = (sin 2χ, 0, cos 2χ).
  - Q (sifted) against ⅛ (per photon), stated both ways.
- **Try-it lines.** All 24 are doable with the real controls, and every quoted readout matches the code:
  - Bloch: the |+z⟩ landmark; whole-degree sliders; ⟨S⟩ in ħ, so "double each".
  - Projector: χ 0–359° in 1° steps; analyzer 0–90° in 5° steps; ports named H/V, D/A or "60°/150°".
  - Dial: buttons set 45°, 90° or 180°; switching the carrier resets the turn; 180° reads a sphere turn of 360° and 100%.
  - Bench: Send 1/10/100/1000, Eve, compare bases, m, New run.
    - Seed 84 gives Q̂ > 0 after Eve is switched on (0.2), 0 test errors with no Eve, and Q̂ 0.269 ± 0.019 at 1000.
    - "No-error chance" reads 0.0075, 0.0100 and 0.0032 at m = 17, 16 and 20.
- **Captions against the stages.**
  - Ledger checks, dashed test boxes and outlined rows 2 and 8 (`Bb84Scene.tsx`).
  - At `l8-test:b3`'s start: seed 20, 10 photons, Q̂ = 0 with Eve on.
  - Q̂ 0.259 and Eve knows 492 of 1000 at seed 9.
  - Poincaré pole labels and "lab X° → sphere 2X°"; hv's D at 45° and A at −45°.
- **Citations.**
  - Notes pages per unit: L8 pp. 2, 3, 4, 5, 6, 7–8, 9 and 10–11; L9 pp. 3, 3–5 and 6.
  - Townsend: §2.7 opens on p. 59, Eqs. 2.109–2.110 on pp. 60–61, cos²60° = 0.25 and Eqs. 2.111–2.113 on p. 62, and Example 2.8 on p. 65.
  - Instructor references and BB84 1984 on p. 11.
- **Class marker and Go deeper.**
  - "Class 9 starts here" on `l8-attack:b1` is the right boundary: Lecture 8 stops at the §8.6 transition, and L9 §9.2 imports §8.7.
  - The three Go-deeper beats (mixtures, R(180°) = −I, a partial Eve) are beyond the notes and none carries their argument; `l8-vs-mixed` is badged.
- **Fidelity to the notes.**
  - §§8.1–8.9 come in order, with L9's additions in the attack and test units: Eve's half, the narrow-claim caveat, and m = 100.
  - The exit check, with its D/A variant, moved into the attack unit, per the plan.
- **Glossary and chips.**
  - No duplicate 448 id or term; no collision with the 258 `qc-` ids.
  - polarization, helicity and XOR are also 709 terms, which P5 allows.
  - The chips go to Q2 `q2-photon` (a clue reveal), Q13 `q13-no-cloning` (a clue reveal) and Q14 `q14-min-error` (Go deeper). Each exists and matches its label.
- **Hygiene and Arcade.**
  - No plan id in learner text, every percentage is a chance (never an amplitude), and no sentence is over 25 words.
  - Catch Eve and the four spot-the-error rounds give true "why"s and correct unit numbers (8.1, 8.3, 8.4, 8.6–8.8).
