# P check: the two Q20 Corrections (ruling Z3) — independent re-read on the page images

Checker [P]. Pages read as images: printed 147–148 (PDF p156–p157), 155–157 (PDF p164–p166), offsets from
`P-709-map.md` (d)-E1 (chapter 8: PDF = printed + 9). Numbers recomputed in my own numpy (never the repo engine).
Section check: §8.3 opens on printed p. 149, so p. 148 is the end of §8.2 (the `where` is right).

## Correction 1: pair fidelity, Bergou p. 148, end of §8.2 — SHIP
- Printed: after averaging over the direction, the output's fidelity to the ideal |ψ⟩|ψ⟩ is 2/3, below the circuit's 5/6.
- Printed p. 147 (Eq. 8.5): the 5/6 is the fidelity of ONE output qubit, ⟨ψ|ρ₁|ψ⟩. So the book compares a single-copy figure
  for the circuit with a number it labels as the pair's.
- Mine (ψ fixed, η Haar-uniform, p = |⟨ψ|η⟩|²): single copy ∫(p² + (1−p)²) = 2/3; pair ∫(p³ + (1−p)³) = 1/2
  (Monte Carlo 400 000 draws: 0.6668, 0.5001). Bužek–Hillery cloner, two ψ: single 5/6, pair 2/3 (0.833333, 0.666667).
- So 2/3 is right as a single-copy value and wrong as the pair value the text names; the pair value is 1/2.
  The box says exactly this and keeps the conclusion (circuit wins on both measures: 5/6 > 2/3 and 2/3 > 1/2).
- Box text: numbers render 0.833 / 0.5 / 0.667, all correct. `says` shares at most 5 consecutive words with the page. No change.

## Correction 2: constant in Eqs. 8.42–8.43, Bergou pp. 156–157 — SHIP
- Printed (both equations): block constant = 1 − (2 − c₁ − c₂) + (3/4)c₁c₂; 8.43's second line asks this to be ≥ 0.
- Eq. 8.41 as printed, rebuilt independently as I − c₁ I_A⊗P_BC − c₂ I_B⊗P_AC in the 8.40 basis: matches the printed
  matrix at three (c₁,c₂) pairs. Its 2×2 block has trace 2 − c₁ − c₂ and determinant 1 − c₁ − c₂ + (3/4)c₁c₂.
- At c₁ = c₂ = 2/3: printed constant = 2/3, quadratic λ² − (2/3)λ + 2/3, discriminant −20/9 = −2.2222, roots
  1/3 ± 0.7454i (non-real, impossible for a real symmetric block). True determinant 0, eigenvalues 0 and 2/3.
- The printed constant also contradicts the book's own Eq. 8.44: ≥ 0 on it gives a LOWER bound c₂ ≥ (1−c₁)/(1+(3/4)c₁)
  (0.2222 at c₁ = 2/3), while 8.44 is the upper bound (2 − 2c₁)/(2 − (3/2)c₁), which is the true determinant at equality.
- Independent optimum: bisecting on min eig of the full 8×8 Π₀ ≥ 0 over c₁ gives max(c₁ + c₂) = 4/3 at (2/3, 2/3), so
  P = (1/4)(4/3)(1 − |⟨ψ₁|ψ₂⟩|²) = (1/3)(1 − |⟨ψ₁|ψ₂⟩|²): Eqs. 8.46–8.47 hold, so only the constant is a slip.
- Box text: discriminant −2.2222, true determinant 0, eigenvalues 0 and 0.6667 all correct; the strings render "0" not "−0"
  (the eigenvalue is +5e-17 in the engine). `where` pages and equation numbers match the images. No change.

## Verdict: both SHIP as worded. Scratch scripts are in the session scratchpad (q20chk.py, q20chk2.py); no repo file changed.
