# P review: 709 Q12 "Detecting and measuring entanglement" (main 157556a, reviewed 2026-10-06)

Reviewer: independent P verifier (read-only; not the builder). Skill: `skills/06-chapter-review/SKILL.md`.

## Verdict
**FIX-FIRST** (3 blocking, 8 should-fix, 7 nits).
- Every displayed number and all 21 challenge keys are right (51/51 independent numpy checks).
- E2 agrees everywhere: `isPPT`, `negativity`, `concurrence`, `eofFromC` and `chshMaxHorodecki` on PB(p), Werner(w), ψ(30°), the W/GHZ pairs and the separable mix.
- **Blocking:**
  - All six Try-it lines are false or cannot be done on their widgets (item 1).
  - Two derivation views carry captions that contradict what is drawn (item 2).
  - Two learner sentences are false, one of them repeating the chapter's own erratum (item 3).
- **Must-check outcomes:**
  - PPT, negativity and concurrence agree with E2.
  - The Procrustean family is right, and erratum B9 is confirmed on the render.
  - The Werner family is right, but two graded challenges are Bergou ⚑ P3.5(a)/(b) in substance (item 6).
  - `qc-ebit` is not redefined, but it is not linked either (item 8).

## Evidence summary
- **`revQ12Q13-q12.py`** (scratchpad): 51/51 checks, my own route.
  - Partial transpose by explicit index loops on both A and B; Wootters via the non-Hermitian `eigvals(ρρ̃)`; Horodecki from an SVD of T; the Procrustean step built as a controlled-Givens 8×8 on (A, A′, B).
  - Also a witness scan: ⟨W⟩ over 2000 random product states, minimum +4.6e-5 ≥ 0.
- **`revQ12Q13-probe.ts`** (bundled with rolldown, run with node): E2 verdicts.
  - PB(0.5): `isPPT` false, N = 0.1036, C = 0.5, M_CHSH = 1.414.
  - PB(1/√2): M_CHSH = 2.000.
  - Werner(1/3): `isPPT` true, C = 0.
  - Werner(½): N = 0.125, C = 0.25, E_F = 0.118.
  - W pair: C = ⅔. GHZ pair: PPT, C = 0.
  - Every `V.q12*` matches numpy to 1e-6.
- **Vitest:** `npx vitest run src/content/qc709`: 68 passed (4 files).
- **Sources read:**
  - Bergou pp. 40–46 and 52–59 (PDF 53–59, 65–72; render p65.png for Eqs. 3.59–3.60), Problems 3.5–3.7 (pp. 61–62).
  - N&C Theorem 12.15 (PDF 604) and §12.5.2 (PDF 606).
  - Revised L7 notes (qc709-n7 p. 35); HW2 (unrelated: spin-1).
- **Widgets read:** `OperatorBuilder.tsx`, `PhaseDial.tsx`, `DepositStats.tsx`; stage code `matrix.ts` (`trace`, `svd`, unclamped `spectrum`) and `MatrixScene.tsx:298–307`.
- **Not done (economy):** no screenshots, no Playwright.

## Blocking
1. **All six Try-it lines are false or impossible on their widgets** (Q11 item 1 precedent).
   - **`q12-ppt` (`Q12.ts:154`)** says "Build ½I + (1/√2)σ_x". `OperatorBuilder` only builds S_n = (ħ/2)(P₊ − P₋) for a chosen axis, with no weights and no I term. (The arithmetic is right: the eigenvalues are 1.207 and −0.207.)
   - **`q12-witness` (`:223`)** says σ_z averages to "±1". The widget builds S_z = (ħ/2)σ_z, shows the eigen-relation ±ħ/2, and shows no average.
   - **`q12-locc` (`:269`) and `q12-concurrence` (`:397`)** say "Set θ = 45°" and "Dial θ … C climbs from 0 to 1". `PhaseDial` is one qubit, (|+z⟩ + e^{iφ}|−z⟩)/√2, and its `theta` prop is the relative phase φ. It has no pair, no Schmidt angle and no C.
   - **`q12-entropy` (`:326`)** says "Build diag(0.75, 0.25) and read its eigenvalues". The widget cannot build that.
   - **`q12-multipartite` (`:463`)** says W's qubit gives "about half each way, whichever axis you choose". This is false twice over:
     - W's qubit has ρ_A = diag(⅔, ⅓), so P(+z) = 0.667 (numpy). Only GHZ's qubit (½I) is axis-blind.
     - `DepositStats` draws a pure |+x⟩ with a fixed z axis and has no axis control.
   - *Fix:*
     - Make the four `operator-builder` lines say what the widget does. For example: "Build $S_z$: its two outcomes, $\pm\hbar/2$, are its eigenvalues; a density matrix may have none below 0".
     - Swap `phase-dial` for `amplitude-bars` with `state: [60, 0]`. Its bars cos30°, sin30° are the Schmidt coefficients. Use "set the polar angle to 90°: equal bars, a maximal pair, $C = 1$".
     - Multipartite: "This is $|{+x}\rangle$: half each way along z. A GHZ qubit splits half and half along every axis; a W qubit does not ($\tfrac23$ up along z)". Back the ⅔ with a new `V` key.
2. **Two derivation views contradict their captions.**
   - **(a) `q12-concurrence:b2`, Ground step 2 (`Q12.story.ts:502`)** is captioned "Schmidt bars 0.75, 0.25". The `svd` panel draws `svd(A).s` = **0.866, 0.500** (`matrix.ts:194`), under the label "Schmidt weights" (`MatrixScene.tsx:307`).
     - A learner who uses the drawn numbers in the caption's own C = 2√(λ₁λ₂) gets 2√(0.433) = 1.32.
     - The same panel sits under the entropy:b1 and concurrence:b2/b3 stages. The 0.866 also coincides with C, which compounds the confusion.
     - *Fix:* caption "Schmidt coefficients $0.866, 0.5$; squared, the weights $0.75, 0.25$". The stage label itself is outside Q12; flag it to the stage owner.
   - **(b) `q12-witness:b2`, Ground step 3 (`:249`)** is captioned "Tr(ρW) = −0.104", but its view is `mx(ρ, {trace: true})`, which draws **Tr ρ = 1** (`matrix.ts:116, 273`). Formal step 2 (`:254`) uses the same view.
     - *Fix:* use the ρ^{T_B} spectrum view with `highlight: [[0, 0]]`, captioned "the negative bar, $-0.104$, is $\mathrm{Tr}(\rho W)$".
3. **Two false statements.**
   - **(a) `q12-ppt:b2` Ground (`:121`)** says "The matrix changes; its row-sums do not."
     - That is false: PB(0.5)'s row sums go from (0.5, 0, 0, 0) to (0.25, 0.25, 0.25, −0.25) (numpy).
     - The same text, and Ground step 1 (`:146`), also say the blocks are "one per value of Bob's bit". In fact the 2×2 blocks are indexed by Alice's (m, n), and T_B transposes inside each block.
     - *Fix:* "Write ρ as a 2×2 grid of blocks, one per pair of Alice's indices; ρ^{T_B} transposes inside each block (Bob's indices). The matrix changes; its trace does not."
   - **(b) `q12-ppt:b4` Formal (`:179`)** says "The running state satisfies every Bell inequality for p ≤ 1/√2". The chapter's own correction (`Q12.ts:543–546`) says this is proved only for CHSH.
     - *Fix:* "satisfies CHSH for p ≤ 1/√2 (Horodecki: $S_{\max} = 2\sqrt{2p^2}$)".

## Should-fix
4. **The CHSH threshold is a literal, and two error-box checks test nothing.**
   - `q12ChshThresh = Math.SQRT1_2` in both the values file and numpy (`q12.py:307`). Its claim (`Q12.story.ts:184`) and the B10 check (`Q12.ts:546`) compare the literal with itself.
   - "breaks no CHSH bound" (`ppt:b4`, `q12-pp-vs-chsh`) has no claim at all. The B11 check is `() => true` (`Q12.ts:532`).
   - *Fix:*
     - Add `q12ChshMaxAt05 = chshMaxHorodecki(PB(0.5))` (1.414) and `q12ChshMaxAtThresh` (2.000), each with a numpy twin, and key the claim and B10 to them.
     - For B11, compare Σp_kE with ΣE on ½|00⟩⟨00| + ½|Φ⁺⟩⟨Φ⁺| (0.5 vs 1).
5. **Erratum B11 misquotes Bergou** (p. 52, render p65.png).
   - Eq. 3.59 is E(ρ) = Σ_k E(|ψ^{(k)}⟩), with no p_k. Eq. 3.60 is inf Σ_k p_k **E(ρ_AB)**: p_k is present, but the argument is wrong.
   - `Q12.ts:530` merges the two, and `entropy:b4` (`Q12.story.ts:447`) says "Eq. 3.60 … restores p_k".
   - *Fix:*
     - `says`: "Eq. 3.59 drops $p_k$; Eq. 3.60 averages $E(\rho_{AB})$ instead of $E(|\psi^{(k)}\rangle)$".
     - b4: "(Bergou Eq. 3.60, corrected)".
6. **Two graded challenges are ⚑ P3.5 in substance.**
   - Bergou P3.5 (p. 61) is exactly p|Ψ⁻⟩⟨Ψ⁻| + (1−p)¼I: (a) the PPT range, (b) the concurrence as a function of p.
   - `q12-pp-werner` (`Q12.ts:172`) asks (a) and walks through it. `q12-co-werner` (`:415`) is (b) at w = ½, with the closed form in hint 2.
   - The ruling (`qc709-Q10Q13.md`, Q12/Q13 bullet 1) forbids graded ⚑ items. The plan's §12 Q1 ("Werner … not tied to one problem") does not survive these prompts.
   - *Fix:* re-key both on PB(p): λ_min at p = 0.2 (`q12BergLamMinAt02` = −0.0123, already twinned) and C(PB(½)) = 0.5 (a new engine key). Keep the Werner threshold as "(Bergou ⚑ P3.5, cited)".
7. **Citations.**
   - The witness is "§3.5 pp. 42–44" (`Q12.ts:222`), but Eq. 3.27 is on p. 41 and Eq. 3.28 on p. 42, and pp. 42–44 are the continuous-variable criteria. → "pp. 41–42".
   - N&C Theorem 12.15 is on p. 576, not 573 (`:324`).
   - Eq. 3.79 is on p. 57 (`:396` says "pp. 54–56").
8. **Cross-chapter glossary.**
   - Q10 already owns `qc-ppt`, term "PPT criterion" (`Q10.glossary.ts:35`; q10-separable:b3 already shows Φ⁺'s ρ^{T_B} spectrum). Q12 adds `qc-ppt-criterion` with the same term, so the glossary has two entries for one term.
     - *Fix:* drop `qc-ppt-criterion`; link `[[qc-ppt|PPT criterion]]` in ppt:b3; open b2 with "Chapter Q10 used this flip as a quick test; here is why it works".
   - `qc-ebit` (Q11) is not redefined, but `locc:b2` bolds **ebit** without a link (`Q12.story.ts:300, 302`).
     - *Fix:* `[[qc-ebit|ebit]]`.
   - ppt:b1's "separable" (`:109, 111`) does not link Q10's `qc-separable-state`. The glossary header names a non-existent `qc-separable` and calls Q10 "not yet built".
   - `qc-monogamy` and `qc-ppt-criterion` are never linked from any beat.
9. **Undefined or clashing symbols in Ground-up.**
   - `h` in entropy:b1 (`:392`) is defined only in Formal.
     - *Fix:* add "h(x) = −x log₂x − (1−x) log₂(1−x)".
   - ρ̃ in concurrence:b4 Ground (`:531`) is never defined.
     - *Fix:* "ρ̃: conjugate every entry, then apply σ_y⊗σ_y on both sides".
   - `A` in concurrence:b2 Ground is the coefficient matrix, but A is also Alice's qubit throughout.
     - *Fix:* use $A_{jk}$, as Formal does.
10. **Two derivation steps whose view does not show the step.**
    - ppt:b3 Ground step 4 (`:161–162`) says "the correlations grow as p increases". By numpy, T = diag(−p, −p, 1−2p): T_zz falls from +1 through 0 at p = ½ to −1, and the step is about λ_min, not T.
      - *Fix:* caption "xx, yy grow as −p; zz passes 0 at p = ½", or swap in the ρ^{T_B} bar view.
    - witness:b2 Ground step 2 (`:248`) says "build W from ρ's own blocks". W is built from |η⟩.
      - *Fix:* why "Flip the projector onto |η⟩", with the ρ^{T_B} spectrum as the view.
11. **Bound entanglement is equated with PPT entanglement.**
    - The glossary gloss ("they have a positive partial transpose") and `multipartite:b4` define bound-entangled states as PPT-entangled ones. Bergou p. 53 states only PPT entangled ⇒ bound; whether NPT bound entanglement exists is open.
    - *Fix:* "Every entangled state with a positive partial transpose is bound: no Bell pair can be distilled from it."

## Nits
12. Learner text says "erratum B9 / B11 / B12" (`Q12.ts:272`; `Q12.story.ts:313, 355, 447, 602`; the locc review trap). These are plan ids, and the corrections box shows no B-numbers. Write "(see Corrections)".
13. The title "Local moves and a shared coin" (`Q12.ts:262`) and multipartite:b4's "with a shared coin" are off: LOCC is a phone call, not shared randomness (LOSR is strictly weaker). Use "and a phone call".
14. `concurrence:b1` puts the `qc-concurrence` link on "tilde state" (`:480`) and leaves **concurrence** bold and unlinked. Swap them.
15. λ is overloaded in one unit: Schmidt λ₁, λ₂ (b2), Wootters λ₁…λ₄ and λ_j^− (b4). Add a one-line Rosetta at b4.
16. locc:b3 Ground "she retries": the failed pair is the product |00⟩, so the retry needs a fresh copy (Bergou p. 46).
17. **Notes alignment:** the revised L7 notes (qc709-n7 p. 35) make the "GHZ pair is a classical mixture, unlike W" point. multipartite:b2 says "Chapter Q8's box", which is fine; the unit's `lecture` could add "L7 p. 35 (via Q8)".
18. The numpy twins of `q12WCircuitFid` and `q12Psi30CircuitFid` are |⟨ψ|ψ⟩| (`q12.py:277–278`), trivially 1. The TS side does run the circuit, so they are harmless, but they are not independent.

## Builder's-language questions
- `q12-mu-sloc`'s distractor "Only for three qubits — … settled there" reads as half-right. Prefer "Yes, with an entangling gate", explained as "not local".
- ppt:b1 says "Chapter Q10's $S \le 2$ test". Name it the CHSH test on first use in Ground.

## Checked and right
- **PB(p) (Bergou Eq. 3.23–3.26, p. 41):**
  - The matrix and ρ^{T_B} match Eqs. 3.24–3.25.
  - λ = {p/2, p/2, ½[(1−p) ± √((1−p)² + p²)]}; λ_min = −0.1036 (p = ½), −0.2362 (p = 1/√2), −0.5 (p = 1).
  - Spectrum at p = ½: −0.104, 0.25, 0.25, 0.604, sum 1.
  - The `matrix` spectrum is unclamped `eigh`, so the negative bar really shows.
- **Werner:** λ_min = (1−3w)/4 and C = max(0, (3w−1)/2), both zero at w = ⅓. At w = ½: −0.125, C = 0.25, S(ρ_A) = 1. The CHSH threshold is 1/√2 for both families.
- **Witness:** W = (|η⟩⟨η|)^{T_B}; Tr(ρW) = λ₋ = −0.1036; W has eigenvalues (−0.354, 0.146, 0.354, 0.854); ⟨W⟩ ≥ 0 on product states; the separable mix is PPT.
- **Procrustean (§3.6.2, p. 46):**
  - U_A as Bergou's map.
  - p_s = 2sin²θ: 0.5 at 30°, 1 at 45°.
  - Success gives exactly Φ⁺, and the regrouped identity holds.
  - Failure gives |00⟩_AB. **B9 confirmed**: Bergou prints |10⟩_AB.
  - Bars: before U_A (0.75, 0.25); after U_A (0.25, 0.5, 0.25).
- **Entropy:** E(30°) = h(0.75) = 0.811, unchanged by H_A; additivity gives 1.623; product 0, Bell 1. N&C Thm 12.15's direction (λ_ψ ≺ λ_φ) is right.
- **Concurrence:** C = |⟨ψ|ψ̃⟩| = 2√(λ₁λ₂) = 2|det A| = sin60° = 0.866, and E(C) = 0.811 (Eqs. 3.65–3.71). The Wootters formula agrees on pure states. A product has C = 0, and a single qubit is orthogonal to its flip (Eq. 3.67).
- **Multipartite:**
  - Tr_C GHZ = ½(|00⟩⟨00| + |11⟩⟨11|), with C = 0.
  - W's ρ_AB matches Eq. 3.85, with C_AB = C_AC = ⅔ and C_{A:BC} = 2√2/3.
  - CKW is saturated: 8/9 = 8/9. **B12 confirmed** (p. 59 prints "|v₀⟩ = |00⟩").
  - The SLOCC statement matches Eq. 3.83.
- **General:**
  - Bergou's "all Bell inequalities" (p. 41) is a genuine overstatement, so B10 is a fair erratum; its check is fixed in item 4.
  - No raw TeX outside `$…$` (scripted scan), no amplitudes shown as percentages, and derivations have ≥ 2 distinct views per track.
  - Both notation beats really introduce their terms (T_B at ppt:b2; ψ̃ and C at concurrence:b1).
  - No duplicate glossary id. `qc-ebit` is not redefined, and the bridge `qc-l4-projectors` resolves.
