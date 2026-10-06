# P review: 709 Q8 "Mixtures, the density matrix and the Bloch ball" (main dda6938 → 692229b, reviewed 2026-10-06)

**Verdict: FIX-FIRST** (1 blocking, 5 should-fix, 5 nits).
- Every displayed number, all 26 challenge answers and every sign in the captions recompute correctly.
- All 14 derivations (both tracks) end on their stated results, and every citation I checked lands on the right page.
- **The one Blocking item is a false sentence, repeated in three places:** "no ket reproduces both the z and the x statistics" of the GHZ box. One ket does (item 1).
- **Must-check outcomes:**
  - `q8-ball:b3` still teaches the eigenvalue fact correctly, but nothing on the stage or in a claim backs it (item 2).
  - The matrix-interp platform fix is **not needed for any other beat** in any 709 chapter (item 2).
  - All recipe/unitary claims hold with the fixed `ensembleUnitary`, including the trine (k = 3 > d = 2).
  - The Rosetta line on n is right.
  - HW2 P4 and P6 have full, correct walkthroughs (one letter clash, item 4).

Evidence (scratchpad `revQ8Q9-*`):
- **`revQ8Q9-recompute.py`:** my own route, with kets from the notes' formulas, averages as ⟨ψ|A|ψ⟩, ρ(t) by `scipy.linalg.expm`, eigenvectors checked against Eq. 2.19, and the trine U built by hand from the theorem (solve, then complete by a cross product). 58 Q8 check sites; every one agrees with the displayed decimal and with `claims-qc709/q8.json` where keyed. 0 mismatches across both chapters (143 checks).
- **`revQ8Q9-probe.test.ts`** (run with vitest from the scratchpad, against the app's own `resolve`/`interpolate`):
  - Every transition a reader can trigger in all 709 chapters: beat→beat with either side revealed or not, clue→reveal, and derivation views (in order, back to the beat, and arbitrary jumps). That is 3,372 kind-pairs at s ∈ {0, 1}, 19 t-steps each.
  - Result: 0 throws, and 0 spectrum views next to a same-size non-Hermitian matrix.
  - It also runs `ensembleUnitary` on five recipe pairs.
- **`revQ8Q9-zxket.py`:** the counterexample for item 1.
- **Vitest:**
  - `src/content src/physics/qc src/stage/svg/matrix.test.ts`: 3856 passed (30 files) on dda6938.
  - `src/content/qc709`: 68 passed on 692229b. The Q8/Q9 files are byte-identical between the two commits; the Q6 diff leaves the unit order unchanged.
- **Sources read:**
  - notes L7 pp. 34–38 (`qc709-n7`); HW2 P4, P6 and P7(e);
  - Bergou printed pp. 15–21 (Eqs. 2.1–2.28) and p. 80 (postulates 4a–6a), with PDF offset +14;
  - N&C Thm 2.6 p. 103 and Ex. 2.72 p. 105 (offset +28).
- **Not done (economy, per brief):** no screenshots and no Playwright (F4/F5 builds running). Captions were read from source.

## Must-check: `q8-ball:b3` and the matrix-interp defect
- **The physics is still taught correctly.**
  - G: "On the surface |r| = 1, so the determinant is 0. Then one eigenvalue is 0 and the other is 1."
  - F: det ρ = 0 and Tr ρ = 1 force eigenvalues 1 and 0, so ρ = |u⟩⟨u|.
  - Both match notes p. 37 and Bergou p. 19. The caption "the surface: eigenvalues 1 and 0" is right.
- **What was lost** (plan §1, `P-Q8-story.md:354-355`): `mx(out(N), {spectrum:'bars'})` and the claims `q8NEig` (1, 0) and `q8NRLen` (1). The stage now shows ρ's entries only, and the beat claims only `q8NDet`. `V.q8NEigLarge`, `q8NEigSmall` and `q8NRLen` are computed but unused (`Q8.values.ts:248-250`).
- **Defect confirmed by probe.** With the view restored, b2→b3 interpolates fine. But b3→b4 throws at t = 0.05 ("eigh: the matrix is not Hermitian"), because b4's bottom is ρσ_x = [[¼, ¾], [¼, ¼]]. The interp blends the grids and recomputes the spectrum (`matrix.ts:289-303`).
- **Needed elsewhere? No.**
  - No current beat, clue/reveal or derivation step in any 709 chapter puts a `spectrum` view next to a same-size non-Hermitian grid.
  - The Q9 `spectrum+partialTrace` views all sit next to Hermitian ρ's.
  - The fix is needed only to restore b3's planned view.
- **Recommend doing it anyway** (W-709 platform, small):
  - In `interpGrid`, when a spectrum is requested and the lerped grid (or its reduced grid) is not Hermitian to 1e-9, return `pick(a, b, t)`, a crossfade.
  - Extend `content.test.tsx:258-277`, which sweeps only beat→beat and clue→reveal pairs, to derivation-view transitions too. A spectrum step next to a ρσ_x step would crash only in the browser today.

## Blocking
1. **"No ket reproduces both the z and the x statistics" is false.**
   - **Where:**
     - `Q8.ts:206` insightFormal ("No ket reproduces both the z and x statistics of the box: …");
     - `Q8.story.ts:182` `q8-why:b4` Formal ("No ket reproduces both the z and the x statistics, so the pair is in no pure state");
     - `Q8.review.ts` `q8-why` Formal point 1.
   - **Counterexample:** |χ⟩ = (|00⟩ + i|11⟩)/√2 matches every probability of the box in the zz, zx, xz and xx joint bases (and in yy, zy, yz). It differs only in xy/yx: ⟨X₁Y₂⟩ = 1 against 0, with probability gaps of 0.25 (`revQ8Q9-zxket.py`).
   - The x test rules out Φ⁺ only. The notes (p. 35) make the x comparison against Φ⁺ and then simply state that no state vector describes the pair.
   - The Ground-up `q8-why:b4` ("So no single state of the pair describes the box") has a true conclusion drawn from too little.
   - **Fix:**
     - insightFormal: "$\langle X_1X_2\rangle_{\mathrm{box}} = 0 \ne \langle X_1X_2\rangle_{\Phi^+} = 1$ rules out $\Phi^+$; the box's purity $\mathrm{Tr}\,\rho_{12}^2 = \tfrac12 < 1$ (Unit 8.4) rules out every ket."
     - b4 Formal: "Φ⁺ fails the x test, and no ket passes every test: the box has purity ½ (Unit 8.4), every ket has purity 1 …". Add claim `q8BoxPur` to b4.
     - b4 Ground-up: "Φ⁺ is ruled out, and Unit 8.4 shows that no single state of the pair can describe the box."
     - Review Formal point 1: "Purity ½ < 1: no ket describes the pair (the x test alone only rules out Φ⁺)."

## Should-fix
2. **`q8-ball:b3` has nothing on the stage or in a claim backing "eigenvalues 1 and 0"** (see Must-check).
   - *Fix now:* add claims `q8NEigLarge` (1), `q8NEigSmall` (0) and `q8NRLen` (1) to `q8-ball:b3`.
   - *After the platform fix:* restore the plan's `mx(out(N), { spectrum: 'bars' })` as b3's bottom view.
3. **Vacuous constants back shown numbers whose engine keys exist and go unused.** This is the Q7-review item-4 defect class.
   - `q8Half`, `q8Quarter`, `q8NegQuarter`, `q8ThreeQuarter`, `q8Eighth`, `q8Third` and `q8R2` are literals in `Q8.values.ts:152-160` and in `q8.py`, so their claims prove nothing. Swap each for the existing key:

     | Beat | Shown | Key to claim |
     |---|---|---|
     | `q8-why:b1` | chance ½ | `q8GhzP3` |
     | `q8-mixed:b2` | box purity 0.5 | `q8BoxPur` |
     | `q8-mixed:b3` | r = (0.5, 0, 0.5), length 0.707 | `q8ZXRx/Ry/Rz`, `q8ZXRLen` |
     | `q8-mixed:b4` | purity 0.75, ⟨S_z⟩ = ⟨S_x⟩ = 0.25ħ | `q8ZXPur`, `q8ZXAz`, `q8ZXAx` |
     | `q8-mixed:b6` | r = (0.75, 0, −0.25) | `q8P4SigX/Y/Z` (`q8P4Rho*` for the matrix) |
     | `q8-ball:b1` | a₀ = 0.5, arrow (0.25, 0, 0.25) | `q8ZXA0`, `q8ZXAx`, `q8ZXAz` |
     | `q8-ball:b2` | det ρ = 0.125 | `q8ZXDet` |
     | `q8-ball:b4` | Tr(ρσ) = 0.5, 0, 0.5 | `q8ZXRx/Ry/Rz` |
     | `q8-trace-rule:b4`/`b5` | diag(0.75, 0.25) | `q8NonSel0/1` |
     | `q8-recipes:b1` | x-poles recipe | `q8HalfGapX` (only Z is claimed) |
     | `q8-recipes:b2` | "eigenstates of the H gate", same ρ | `q8UHEigPlus/Minus`, `q8EigRecipeGap` |
     | `q8-recipes:b4` | the trine gives ½I | `q8TrineGap` |

   - Keep the generic constants only for weights that the content itself sets (½, ¼, ¾ inputs).
4. **HW2 P6 letter clash in the `q8-b-pur` walkthrough** (`Q8.ts:496`).
   - It uses **a** for Unit 3.3's operator-space arrow (r = 2a), but HW2 P6 writes **a** for our r, as `q8-ball:b5` Formal says.
   - A student checking HW2 P6(a) ("ρ = ½(1 + a·σ)") meets a = r/2 here.
   - *Fix:* append "(HW2 writes $\mathbf a$ for our $\mathbf r$; here $\mathbf a = \mathbf r/2$ is Unit 3.3's arrow)".
5. **Three glossary entries are never linked:** `qc-thermal-state` (first `q8-mixed:b5`), `qc-maximally-mixed` (`q8-mixed:b7`) and `qc-unitary-freedom` (`q8-recipes:b4`).
   - Their `first` beats never write `[[id|…]]`; a grep finds 0 links in any chapter.
   - *Fix:* link "thermal" in b5 (both tracks), "maximally mixed state" in the b7 reveal, and "unitary-freedom theorem" in the b4 Formal.
6. **Inconsistent energy sign between Units 8.3 and 8.4.**
   - 8.3 uses Ĥ = (ħω/2)Z for "a spin in a field along z", which puts |0⟩ higher for ω > 0.
   - 8.4 says spin up has *less* energy, and the `q8-trace-rule:b5` reveal calls Unit 8.4's thermal state "the physical case" of that Ĥ. A Gibbs state of 8.3's Ĥ would have p↑ = 0.119, not 0.881.
   - The notes (p. 36) fix only E_Z = E↓ − E↑.
   - *Fix:* in the b5 reveal (both tracks), write "a thermal state (Unit 8.4) is diagonal too, so it is stationary". Or state in `q8-mixed:b5` that the field is taken so that up is lower, i.e. Ĥ = −(E_Z/2)Z.

## Nits
7. **`q8-w-which` walkthrough** (`Q8.ts:255`): "Only the xx (or yy) cell differs: 0 against 1". The yy cell is 0 against −1. *Fix:* "0 against +1 (xx) or −1 (yy)".
8. **Hand-typed prose numbers.** They are right and claimed, but bypass `d()` (Q7 item 9 precedent):
   - `q8-pure-rho:b2`/`b4` Formal: 0.75, 0.25, 0.433;
   - `q8-trace-rule:b1`: 0.612 (×5);
   - `q8-mixed:b5`: 0.881, 0.119, 0.381, 0.762;
   - `q8-ball:b6` reveal: 1.414, −0.25, 1.207, −0.207;
   - `q8-recipes:b2`: 0.854, 0.146;
   - `Q8.ts` walkthroughs.
   - **Two have no key at all:** `q8-t-y` hint "ρ₀₁ = 0.306 − 0.306i" and the `q8-trace-rule` tryThis "0.866" (φ = 0). *Fix:* add `q8RhoN01Re/Im` and `q8XAtPhi0` with twins, then use `d(V.…)` throughout.
9. **`q8-mixed:b3` Formal uses n twice.** It writes the members' unit vectors as n_n and, in the same sentence, says "the notes and Bergou write n for this vector" (meaning r). *Fix:* write the members' vectors as $\hat{\mathbf r}_n$ or $\mathbf r_n$, and keep the Rosetta line as is.
10. **Code comments.**
    - `Q8.values.ts:86` cites "Bergou p. 36" for the thermal box; it is notes p. 36.
    - The `matrix.ts:220-221` docstring cites `q8-ball:b6` as the "not a state" flag case, but b6's source is `lin`, so its flag reads "negative" (`matrix.ts:223`).
11. **Ground-up result tex in `q8-recipes:b4`** uses q_j and |φ_j⟩, which the Ground-up text never names (the steps use the weighted |φ̃⟩). *Fix:* add "with the second recipe's chances $q_j$ and kets $|\varphi_j\rangle$" to step 1's `why`.

## Builder's-language questions
- `q8-pure-rho:b4` G: "ρ equals its own mirrored transpose" for Hermitian. This is fine for Ground-up, and "mirror" is Chapter F1's word.
- `q8-why` visual: a one-spin oven SG lab stands in for a two-qubit box. It is acceptable as an analogy (the tryThis claims only 50/50), but a `two-qubit` stage would be truer if one is ever added to the visual slot.

## Checked and right
- **Must-check, the recipes.**
  - `ensembleUnitary` gives U = H for z-poles→x-poles and for {|0⟩, |+⟩}→{|u±⟩}, both unitary to 3e-16.
  - Trine→z-poles (padded to 3) and its reverse are unitary to 4e-16, with A·U = B to 1e-16.
  - My hand-built trine U (Bergou's theorem, row i = √2(⟨0|ψ̃_i⟩, ⟨1|ψ̃_i⟩), completed by a cross product) matches the engine's first two columns and is unitary.
  - The Ground-up table (ψ̃₁ = (φ̃₁ + φ̃₂)/√2, ψ̃₂ = (φ̃₁ − φ̃₂)/√2, with the weighted Eq. 2.19 |u±⟩) holds exactly.
  - The claims are safe under either U convention (engine A·U = B is the theorem's U*; every U here is real).
- **Must-check, the Rosetta line** "the notes and Bergou write n" (`q8-mixed:b3` F): true. See notes Eq. 2.14 (p. 37) and Bergou Eq. 2.18 (p. 19). The HW2 P6 "a" is noted in `q8-ball:b5` F.
- **Must-check, the HW2 walkthroughs.**
  - P4(a) gives ½[[1−p, 1−p], [1−p, 1+p]].
  - P4(b) gives 1 − p + p² = 1 − p(1 − p) < 1 for 0 < p < 1, which is 0.8125 at ¼; the minimum is ¾ at p = ½.
  - P4(c) gives (1 − p, 0, −p), the chord from |+⟩ to |1⟩.
  - P6(a)–(d): det ρ = (1 − |r|²)/4 ≥ 0; Tr ρ² = ½(1 + |r|²), which is 0.625 at 0.5; ⟨σ_α⟩ = r_α; and |r⟩ = cos(θ/2)|0⟩ + e^{iφ}sin(θ/2)|1⟩ with |c₁| = 0.5 at 60°.
  - Every part of each problem is covered.
- **Displayed numbers.**
  - Box: P(01) = 0, ⟨XX⟩ = ⟨YY⟩ = 0, ⟨ZZ⟩ = 1, purity ½. Φ⁺: (1, −1, 1), coherence ½.
  - N state: 0.75, 0.25, |ρ₀₁| = 0.433, ρ₀₁ = 0.306 − 0.306i at −45°; Tr(Xρ) = Tr(Yρ) = 0.612, Tr(Zρ) = 0.5.
  - Evolution: [Ĥ, ρ]₀₁ = ρ₀₁ in ħω units; a quarter period takes −45° to −135° (φ 45° → 135°, a counterclockwise precession).
  - Measurement: an unrecorded z reading gives diag(0.75, 0.25).
  - ZX mixture: purity ¾, det ⅛, λ = (2 ± √2)/4.
  - Thermal: p↑ = e²/(1 + e²) = 0.881, ⟨S_z⟩ = 0.381ħ, r_z = tanh 1 = 0.762.
  - Bad matrix: |r| = √2, det −¼, eigenvalues 1.207 and −0.207.
  - Convex mix: r_x = 0.75. Trine: |r| = 0.
- **Signs.** The captionFormal [Ĥ, ρ] = ħω[[0, ρ₀₁], [−ρ₁₀, 0]], von Neumann against Heisenberg (iħȦ = [A, Ĥ]), and Tr(Yρ) = −2 Im ρ₀₁ are all right.
- **Citations against pages.**
  - Notes: pp. 34–35 (box, read qubit 1 in the notes, noted), p. 35 (ρ, coherences, Tr), p. 36 (trace rule, von Neumann, ensemble, thermal), pp. 36–37 (|+z⟩/|+x⟩ example), Eqs. 2.14–2.16 (p. 37), 2.17–2.20 (p. 37), 2.21 and the theorem (p. 38).
  - Bergou: Eqs. 2.1–2.2 (p. 15), 2.11 (p. 17), 2.13 (p. 17), the purity theorem (p. 18), 2.18–2.20 (§2.3 p. 19), 2.21–2.24 (pp. 19–20; the misplaced bracket in 2.24 is a real erratum), 2.25–2.27 (p. 20), 2.28 (p. 21), and 4a–6a (§5.2 p. 80).
  - N&C: p. 103 and p. 105.
- **Lints and wiring.**
  - Raw TeX (lint green; hand scan clean). No plan or ruling ids in learner text. No amplitudes as percentages.
  - Bridges: "Unit 3.2" (θ = 60°, φ = 45°, `q3-bloch`), 3.3, 3.4, 3.5 and "Unit 6.6" (`q6-parities`) all land on the right units.
  - No duplicated glossary ids across the 709 glossaries; `qc-mixture` and `qc-precession` are reused from Q1.
  - Ruling items: Ĥ throughout, Schrödinger in the von Neumann beat, the Bloch-ball notation beat in 8.4, GHZ reads qubit 3 (with the notes' qubit 1 noted), no ⚑ problems, no swept chord.
  - Every derivation track has ≥ 2 distinct views that show their step. All nine notation beats introduce their term in both tracks.
