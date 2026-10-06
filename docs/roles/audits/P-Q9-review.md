# P review: 709 Q9 "Parts of a whole: reduced states, entropy, Schmidt" (main dda6938 → 692229b, reviewed 2026-10-06)

**Verdict: FIX-FIRST** (1 blocking, 5 should-fix, 5 nits).
- Every displayed number, all 25 challenge answers and every sign in the captions recompute correctly.
- All 12 derivations end on their stated results, and the citations land on the right pages.
- **The one Blocking item is a false instruction in Unit 9.6's visual tryThis** (item 1).
- **Must-check outcomes:**
  - HW2 P2(d) and P7(e) have full, correct walkthroughs.
  - Every Unit 9.6 number (trace distance, fidelity, the Fuchs–van de Graaf bounds) is right.
  - The unit is Bergou-only, with no [L] beat, as ruled.
- **Rulings:** the build skipped ruling 6, the entropy sweep (item 3). The others are followed.
- **Matrix-interp platform fix:** not needed for any Q9 beat. Every `spectrum` view, including `spectrum+partialTrace`, sits next to Hermitian grids (probe, `P-Q8-review.md` §Must-check).

Evidence (scratchpad `revQ8Q9-*`):
- **`revQ8Q9-recompute.py`:** 65 Q9 check sites. 0 mismatches against the displayed decimals and against `claims-qc709/q9.json` where keyed.
  - Own route: partial traces by `einsum`, entropies from `eigvalsh`, fidelity by `scipy.linalg.sqrtm`, D by eigenvalue sums.
  - Schmidt form checked as an exact vector identity; steering by explicit projectors and normalised post-states.
  - All four β_xy built from HW2's own formula.
- **`revQ8Q9-probe.test.ts`:** 0 interpolation throws over 3,372 kind-pairs (all 709 chapters, beats, clue/reveal and derivation views).
- **Vitest:**
  - `src/content src/physics/qc src/stage/svg/matrix.test.ts`: 3856 passed on dda6938.
  - `src/content/qc709`: 68 passed on 692229b. The Q9 files are unchanged between the two commits.
- **Sources read:**
  - notes L7 pp. 38–40; HW2 P2 and P7;
  - Bergou printed pp. 16–17 and 24–28 (§2.1, §2.5–2.7) and p. 47 (§3.7.1);
  - N&C Thm 2.7 p. 109, §11.3 p. 510, and Eqs. 9.20 p. 404, 9.53 p. 409, 9.97–9.99 p. 415;
  - Axler 7E.
- **Not done (economy):** no screenshots and no Playwright.

## Must-check: Unit 9.6 (Bergou-only)
- **Recomputed.**
  - D(|0⟩, |+⟩): ρ₀ − ρ₊ has eigenvalues ±0.707, so D = 0.707 = ½|r₁ − r₂| = ½√2.
  - D(Unit 8.4's mixture, ½I) = ½·0.707 = 0.354.
  - F(|0⟩, |+⟩) = 0.707. F(|0⟩, ½I) = √½ = 0.707.
  - F(mixture, ½I) = Tr√(ρ/2) = (√λ₊ + √λ₋)/√2 = 0.924, so the bounds are 1 − F = 0.076 ≤ 0.354 ≤ √(1 − F²) = 0.383.
  - At overlap 0.6: D = 0.8. The Hilbert-plane angle is 53.13° and the Bloch compare point sits at θ = 106.26°.
  - D(singlet, coin) = 0.5, while the reduced states are 0 apart.
- **The derivation's matrix** [[sin²α, −sin α cos α], [−sin α cos α, −sin²α]] is right: trace 0, det −sin²α. Its view at α = 45° is exactly ρ₀ − ρ₊ in the 0/1 basis.
- **Rules.**
  - Every 9.6 beat is `books` or `clue`, and the unit summary says it is Bergou-only (ruling 8).
  - The fidelity convention is the root, as in Bergou Eq. 2.61 and N&C 9.53, and the text says so.
  - Bergou P2.5 is only cited (ruling 5).
- **Errata.** B4 is real: Bergou p. 26 sums the eigenvalues of A†A instead of their square roots; Q9 says "the sum of A's singular values". B5 is real: Eq. 2.56 prints U_B|u_k⟩ for U_B|v_k⟩.

## Blocking
1. **The Unit 9.6 visual tryThis is false** (`Q9.ts:577`): "Turn the basis to 90°: the shadow is 0, and F = 0."
   - The `projector` widget (`widgets/Projector.tsx:31-33`) draws the shadows cos(t − b) and −sin(t − b).
   - At state 45° and basis 90°, both shadows have size 0.707. Neither is 0.
   - A shadow of 0 happens at basis 45°: the state then lies along the first axis (shadow 1) and is orthogonal to the second (shadow 0). The slider runs 0–90°.
   - A learner who tries it sees the claim contradicted.
   - *Fix:* "Turn the basis to 45°: one shadow is 1 (F = 1), the other 0 (F = 0)."
   - (The same widget is misread in `Q2.ts:538`, "Basis at 45°: half passes. Basis at 90°: nothing passes" with state 45°; outside Q9's scope, flagged for the Q2 owner.)

## Should-fix
2. **The Ground-up review card uses notation that Ground-up never defines.**
   - `Q9.review.ts` `q9-distance` `equations` shows D = ½‖ρ₁ − ρ₂‖₁ and F = Tr√(ρ₁^{1/2}ρ₂ρ₁^{1/2}). Ground-up `q9-distance:b1` "introduces" `qc-trace-norm` but its text never names the trace norm, and Ground-up b3 defines F only for pure states.
   - *Fix:* in b1's Ground-up text add "We write $D = \tfrac12\|\rho_1 - \rho_2\|_1$; the double bars, the trace norm, add up the sizes of the eigenvalues." Then set the Ground-up `equations` to `D = \tfrac12\|\rho_1 - \rho_2\|_1,\quad F = |\langle\psi_1|\psi_2\rangle|` and move the mixed-state F into `formal.equations`.
3. **Ruling 6 (the entropy sweep) was not built.**
   - The plan (`P-Q9-story.md:70, 471, 476`) has `mx(RHALF(sweep), {spectrum:'entropy'})` with w from ½ to 1, captioned "length swept from 0 to 1: S falls from 1 to 0".
   - `q9-entropy:b3` (Ground step 3, Formal step 2) shows a static length-0.5 matrix instead, and no Q9 state scrubs anything (grep: no `from:`).
   - *Fix:* `mx({ rho: mixSrc([{ from: 0.5, to: 1 }, { ket: '0' }], [{ from: 0.5, to: 0 }, { ket: '1' }]) }, { spectrum: 'entropy' })` with the plan's caption. It stays Hermitian throughout, so it is interp-safe.
4. **Unused engine keys and vacuous constants for shown numbers.** This is `P-Q8-review.md` item 3 and the Q7 item-4 class.
   - `q9Half`, `q9Quarter`, `q9ThreeQuarter`, `q9R2` and `q9Ang0P` (`ANG0P = 45`, `Q9.values.ts:264`) are literals in V and in the twin.
   - Claim the existing keys on the beats that state the numbers:

     | Beat | Shown | Key to claim |
     |---|---|---|
     | `q9-partial-trace:b3` caption | "both arrows zero; grid −1, −1, −1" (only `cHalf` today) | `q9SingArrowsLen`, `q9SingXX/YY/ZZ` |
     | `q9-partial-trace:b4` | the T_βxy formula | the 12 `q9BellGrid*` keys (computed, unused) |
     | `q9-partial-trace:b5` | "T_zz = 1, T_xx = T_yy = 0" | `q9GhzR12XX/YY/ZZ`, `q9GhzR12ArrowsLen` |
     | `q9-partial-trace:b6` clue | "both give ⟨Z_A⟩ = 0.5" | `q9Psi2ExpZ1` (and `q9ProdExpZ1` on this beat) |
     | `q9-schmidt:b4` | ρ_B = 0.854\|+⟩⟨+\| + 0.146\|−⟩⟨−\|, spec ρ_B, r_A = (0.5, 0, 0.5) | `q9SpecBLarge/Small`, `q9RhoB00`, `q9RhoB01Abs`, `q9RA2` |
     | `q9-purification:b3` reveal | "− leaves \|u₋⟩", "z leaves \|0⟩ or \|+⟩, half each" | `q9SteerXF1`, `q9SteerZ1`, `q9SteerZF0/F1` |
     | `q9-purification:b1` Formal | "every ρ_A has a purification" | `q9PurifyGap` (the engine's `purify`) |
     | `q9-d-singcoin` walkthrough | "reduced states are 0 apart" | `q9DSingCoinA` |
     | `q9-distance:b4` viewCaption | α = 45° | make `q9Ang0P` = degrees(acos `q9F0P`) |

5. **The `q9-schmidt` Formal review trap** (`Q9.review.ts:69`) is garbled and too strong: "the Schmidt basis is basis-dependent on neither side alone: it is forced by ρ_A".
   - For degenerate ρ_A (any Bell state) the Schmidt basis is not unique.
   - *Fix:* "Assuming any product basis will do: the Schmidt basis is $\rho_A$'s eigenbasis (with B's partners fixed by it), unique only when $\rho_A$'s eigenvalues differ."
6. **The glossary entry `qc-singular-values` (first `q9-schmidt:b5`) is never linked** (grep: 0 `[[qc-singular-values|` anywhere). *Fix:* link "singular values" in b5's Ground-up text.

## Nits
7. **`q9-distance:b4` Ground step 6** says "For mixed states only the bounds of Unit 9.6 remain", but this beat *is* Unit 9.6. *Fix:* "only the bounds above remain".
8. **The `q9-schmidt` tryThis** "Read x at θ = 45°: the average is 0.707, A's arrow direction in P" invites a misreading: A's own ⟨X⟩ in P is 0.5, since |r_A| = 0.707. *Fix:* append "; A itself, at length 0.707, gives 0.5".
9. **Hand-typed prose numbers.** They are right and claimed, but bypass `d()`: 0.433, 0.75, 0.25, 0.601, 0.811, 0.854, 0.146, 0.924, 0.383, 0.707, 0.354, 0.076, 0.8 and 0.36 across the beats; "0.527 bit" and "0.811 bit" in the walkthroughs; the tryThis "0.707" and "0.854". *Fix:* `d(V.…)`.
10. **`q9-purification:b2` "that gate is Unit 8.6's recipe table, H".** In general U_B is the table's transpose, since P = Σ_k √λ_k|u_k⟩(Σ_i U_ik|i⟩). It is exact here because H is symmetric. *Fix (Formal):* add "(its transpose in general)".
11. **Citations and comments.**
    - "Axler 7E p. 270" is the section start; the SVD theorem 7.70 is on p. 273.
    - `Q9.values.ts:161` calls the thermal box "HW2's"; it is the notes' p. 36 example (Unit 8.4).
    - The `Q9.ts:7` header omits §2.1.

## Builder's-language questions
- `q9-partial-trace:b3` G: "a fair coin along every axis": it is the right picture for r_A = 0.
- `q9-same-part` visual: a `deposit-stats` of |+x⟩ along z stands in for "one half of either pair". It is fine as the 50/50 picture, but it is not literally either pair's qubit.

## Checked and right
- **Must-check, HW2 P2(d)** (`q9-p-p2d`, `q9-partial-trace:b4`). The expansion ½(|0y⟩⟨0y| + |1ȳ⟩⟨1ȳ| + (−1)^x(cross terms)) is right. The cross terms die by ⟨ȳ|y⟩ = 0, so ρ₁ = ½I for all four. The "no contradiction" step is right: the Bell measurement is joint and reads the XX and ZZ parities. β₁₀ = Φ⁻ and β₁₁ = Ψ⁻ match HW2's formula. The P2 parts (a)–(c) belong to Q6.
- **HW2 P7(e)** (`q9-p-p7e`, b5): Tr₃|GHZ⟩⟨GHZ| = the Unit 8.1 box, the corner is 0, it is a mixture of products, so the pair is not entangled and GHZ is fragile.
- **T_βxy = diag((−1)^x, −(−1)^{x+y}, (−1)^y)** checked on all four Bell states.
- **Partial trace.**
  - ψ₁⊗|+⟩: ρ_A = [[0.75, 0.433], [0.433, 0.25]], ⟨Z_A⟩ = 0.5, ⟨X_A⟩ = 0.866.
  - Ψ₂: the 0.433 coherence sits off its block's diagonal, so ρ_A = diag(0.75, 0.25) with purity 0.625.
  - Singlet: ρ_A = ½I and T = −I.
  - Block formula: (ρ_A)_{aa′} = Σ_b ρ_{ab,a′b}.
- **Same part.** The coin has ρ_A = ½I, T_c = diag(0, 0, −1) and purity ½, and yy separates it from the singlet (0 against −1). Bergou Eq. 2.8's state is (|01⟩ + |10⟩)/√2 = Ψ⁺ ↦ ½I, and erratum B2 (Eq. 2.9's Tr as Tr_B) is real.
- **Entropy.**
  - S(mixture) = 0.601, S(½I) = 1, S(¼I₄) = 2.
  - S(|r|) at 0, 0.5, 0.707 and 1 is 1, 0.811, 0.601 and 0.
  - E: product 0, Bell 1, Ψ₂ 0.811. S(GHZ box) = 1. S(thermal) = h(0.881) = 0.527.
  - "Mixing non-orthogonal states gives less than the Shannon entropy of the weights" (0.601 < 1) is right.
- **Schmidt.**
  - P = (|00⟩ + |+⟩|1⟩)/√2 from C_PUR (controlled H, ruling 3). Its amplitudes are 0.707, 0.5 and 0.5 (10 is 0), and ⟨ṽ₀|ṽ₁⟩ = 0.25.
  - ρ_A(P) is Unit 8.4's mixture. P = 0.924|u₊⟩|+⟩ + 0.383|u₋⟩|−⟩ holds exactly, and the singular values match.
  - ρ_B = 0.854|+⟩⟨+| + 0.146|−⟩⟨−|, with r_A = (0.5, 0, 0.5) and r_B = (0.707, 0, 0), equal lengths.
  - Ranks are 1, 2 and 2.
  - cos 22.5°|00⟩ + sin 22.5°|11⟩ has the same weights and E = 0.601, and the stated local unitaries map one state to the other.
- **Purification.**
  - Tr_B P = the mixture, and (I⊗H)Ψ_eig = P.
  - Reading B along x gives + with chance 0.854, leaving |u₊⟩ (fidelity 1), or − with 0.146, leaving |u₋⟩.
  - Reading B along z gives ½ → |0⟩ and ½ → |+⟩. E(P) = 0.601.
- **Citations against pages.**
  - Notes: p. 38 (ρ(1) = Tr₂ρ Rosetta, the singlet matrix), p. 39 (½I, the classical mixture, Eqs. 2.22–2.23, log₂d), p. 40 (Eqs. 2.24–2.28, rank N, shared eigenvalues, the purification remark).
  - Bergou: Eqs. 2.3–2.5 (p. 16), 2.8–2.10 (pp. 16–17), 2.47–2.48 (p. 24), 2.52 (p. 25), 2.53–2.56 (pp. 25–26), 2.57–2.62 (pp. 26–28), 3.41 (§3.7.1 p. 47).
  - N&C: as listed above. The Rosetta "Bergou: Φ₋" for the singlet matches Q6's eq. 3.4 note.
- **Rulings and lints.**
  - Letters O, Π and p₊ are used (ruling Q2). E has its own notation beat, `q9-entropy:b4` (ruling 7). The `two-qubit` entropy readout reads E for kets (ruling 9).
  - Raw TeX lint is green and a hand scan is clean. No plan ids in learner text. No percentages.
  - Every derivation track has ≥ 2 distinct views that illustrate their step. All nine `introduces` terms (on seven beats) are introduced in both tracks, except the Ground-up trace norm (item 2).
  - The bridges "Unit 6.3/6.4/6.5", "Unit 8.1/8.3/8.4/8.5/8.6" and "Unit 9.2/9.3" all land on the right units.
  - No duplicated glossary ids across the 709 glossaries.
