# P truth review — the Operator Lab bench (2026-09-27)

Independent, read-only review of the merged Operator Lab (merge 67a8349). **Verdict: FIX-FIRST.** Every number on screen
in the four screenshot states is correct, recomputed in numpy:
- A = S_x, ψ₀ = |+z⟩, τ = π/2
- the dragged state
- commutator mode with B = S_y
- the non-Hermitian [[1,2],[0,−1]]

`npx vitest run src/lab` passed 73/73. The Try-this is true as written. The preset allowlist is sound. The defects are a
crash, false or misleading text, unit inconsistencies, Predict-first leaks and label clashes.

File paths are under `app/src/lab/benches/operator/` unless stated.

## Blocking
1. **model.ts:359–361 — crash on typed Hermitian matrices.** The stats call `expectation` (physics/spin.ts:94). It
   throws when the imaginary part exceeds a fixed 1e-9, and this happens in two ways:
   - Entries ≥ 10⁴ (the parser allows up to 10⁶): rounding in ⟨A²⟩ exceeds that for about ⅓ of τ values. Example:
     [[1e6,1e6],[1e6,−1e6]] from |+z⟩ at τ = π/2 gives Im = 1.2e-4.
   - A crafted `2+9e-10i` passes the Hermitian test but still throws.

   The route falls back to its error page, and the module-level store keeps the bad matrix until a reload.
   **Fix:** compute from the Bloch vector (⟨A⟩ = a₀ + a·r, ΔA = √(|a|² − (a·r)²), P(λ₊) = (1 + â·r)/2), or
   symmetrise M and use a tolerance scaled by ‖A‖². Add a τ-sweep test with both matrices.
2. **model.ts:357 with OperatorBench.tsx:395 — false text for every non-Hermitian A.** `eigenstate = !axis` is always
   true when A is not Hermitian. So the bead twin says "ψ₀ is an eigenstate: only the phase changes", which is false,
   e.g. for ψ₀ = |+x⟩. It is false even for true eigenvectors with a complex λ (the norm changes).
   **Fix:** `eigenstate = hermitian && (…)`. For a non-Hermitian A, say "no turn: A is not Hermitian".
3. **OperatorBench.tsx:505 against 500–501 — label clash in the commute-xy view.** The "[A,B]/2i" label covers "λ₋"
   in "λ₋ = −0.5 ħ", so it reads "[A,B]/2i = −0.5 ħ".
   **Fix:** projected labels avoid each other (hide the lower-priority one); anchor [A,B]/2i at its arrow's midpoint.

## Should-fix
4. **fidelity.ts:53.** "A unitary is never drawn as an arrow here" is false: the (σx+σz)/√2 preset is unitary and is
   drawn. **Text:** "The turn U(τ) = e^{−iτA} is not drawn in operator space: in general its a⃗ is complex, so it has
   no point there; the picture shows what it does. (A unitary that is also Hermitian, like (σx+σz)/√2, is drawn like
   any operator.)"
5. **model.ts:421.** "exp(−iτA) is not a turn" is false in general: A = H + icI is a turn times a growth factor, and
   this A at τ = π gives U = −I. **Text:** "A is not Hermitian: exp(−iτA) is not unitary in general, so no turn is
   drawn."
6. **Predict-first leaks.** Gate all of these on `pending`:
   - the bead twin's aria-valuetext keeps "turn X°" (HandleTwin.tsx:33, OperatorBench.tsx:392), which gives
     2|a|τ and so the eigenvalue gap;
   - its disabled text reveals "ψ₀ is an eigenstate" (line 395);
   - the z/x/y basis radios (253–257) let a student see S_x, S_y or S_z as a diagonal matrix; disable them while
     results are hidden;
   - the "not Hermitian" lines (model.ts:386–389, 420) still show.
7. **Units.**
   - a⃗ and b⃗ are shown without ħ while a₀ and |a⃗| carry it (model.ts:392, 410).
   - a×b is in ħ² (412).
   - The phase should read −a₀τ/ħ, to match the fidelity note's 2|a⃗|τ/ħ (428).
   - `unit` sticks after a drag or typed cells (store.ts:51, 80), contradicting OperatorBench.tsx:225. A typed
     non-Hermitian matrix after S_x shows "(units of ħ)" beside eigenvalues that have no ħ.
   - fidelity.ts:25 writes /ħ even for plain-number presets.
   - τ itself is consistent.
8. **model.ts:428–429.** "phase −a₀τ = 0°" sits beside "only the phase changes" while χ = −45° (S_z from |+z⟩).
   Rename it "overall factor e^{−ia₀τ}".
9. **model.ts:406.** For a non-Hermitian A the class line never says "not normal". The eigenvectors are not
   orthogonal (|⟨λ₁|λ₂⟩|² = ½), while the passport says opposite points are orthogonal. Add "eigenvectors not
   orthogonal (A not normal)" when `!cls.normal`.
10. **model.ts:219–239 with store.ts:77.** Cells are rounded to 4 decimals and all four are re-parsed on any edit. On
    the Hadamard preset, typing `-1/sqrt(2)` into one cell leaves three at 0.7071, and "unitary · squares to I"
    disappears. Write exact forms or re-parse only the edited cell.
11. **A non-Hermitian readout hides its cause.** M₁₀ = 0.5+0.001i shows "not Hermitian", yet the matrix, a⃗ and λ
    display as Hermitian and real (`amp` drops parts < 0.005). Show 3–4 significant digits when A is not Hermitian.
12. **Label overlaps.**
    - |λ₋⟩ on |−x⟩ and |λ₊⟩ on |+x⟩ at both sizes (511–512): merge into "|λ₋⟩ = |−x⟩" when â is within 10° of a pole.
    - The "a₀ gauge" chip on the "…: no" line at 1440 commutator (503): move it below the readout column.

## Nits
13. **model.ts:407:** |a⃗| > 300 reads "arrows drawn at scale 0". Use 2 significant figures.
14. **model.ts:413:** "a ∥ b" renders as "a ı b" (missing glyph in the mono font). For a non-Hermitian A, say "commute",
    not "compatible".
15. **1440 dragged:** "after:" wraps mid-number. Use nowrap per amplitude.
16. **fidelity.ts:43:** the gauge shows only Re a₀. **fidelity.ts:49:** say "sign (and phase e^{−ia₀τ})".
