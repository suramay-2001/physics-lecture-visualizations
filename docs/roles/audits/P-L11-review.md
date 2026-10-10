# P review: 448 L11 "Quantum dynamics" (merge 6a7303c, reviewed on main eb12685, 2026-10-10)

**Verdict: FIX-FIRST** (0 blocking, 5 should-fix, 9 nits).
- All 81 `V` keys, all 18 challenge keys and all six derivations are right. The lecture follows §§11.4–11.10 step for step.
- The R2 energies, the clocks kind and the Go-deeper split are clean.
- The builders flagged two items:
  - **R7 is broken in the picture of `l11-generator:b3`** (item 1). The overshoot sizes are on screen there, through the complex-plane kind's Euler readout rather than `stepProduct`.
  - **"Unit 10.8" is right** (item 14).
- Three more items say something false: a caption that claims eigenvalues its bars cannot show, a Rosetta that credits ≅ to the notes, and a rate quoted for the wrong state. One Try-it line says "nothing moves" when a hand turns.

Evidence (scratchpad `rev448-*`, read-only on main):
- **Numbers.**
  - `rev448-l10l11.py` is an independent numpy and scipy route: `expm`, `matrix_power`, explicit Bloch vectors and finite differences. It is not the twins' helpers.
  - It recomputes all 81 L11 keys (dumped by `rev448-dump1011.test.ts`), the 14 yes/no facts included. They agree to 1e-9.
  - Spot values: Err10 = 0.13031 (|(1 − iπ/20)¹⁰ + i|) and Euler64 = 1.019458.
- **Code read for every caption and Try-it line.**
  - Kinds: `stage/svg/complexPlane.ts` (readouts), `clocks.ts` (readouts, `gap0`), `amplitudes.ts` (readouts), and the `OperatorSpaceScene.tsx` header.
  - Widgets: `widgets/TwoClocks.tsx`, `BlochSphere.tsx`, `ComplexPlane.tsx` with `ComplexPlaneQc.tsx`, `PhaseDial.tsx`.
  - Content and UI: `components/RouteRail.tsx` (unit numbering), `content/bridges448.ts`, `arcade/games.ts`.
- **Sources.** Notes `sources/L11` pp. 1–2 and 10–19. Susskind `chapter004.md` §§4.1–4.13. Townsend `text.md` pp. 36–37.
- **Not run.** No Playwright and no suite vitest: a full run was in progress on main. Stage checks are from the kinds' code.

## Blocking

None.

## Should-fix

1. **R7 broken in the picture (`l11-generator:b3`, `L11.story.ts:307`).**
   - The complex-plane kind always adds `euler-end` and `euler-size` readouts for `rate: 'imag'` (`complexPlane.ts:294–296`). The story's `SvgStage` draws them.
   - So the notes' own beat b3 shows "size 1.862" at N = 1, falling through 1.332 to 1.019 at N = 64. Go deeper 2 states the same three numbers.
   - The R7 lint (`L11.test.ts`) checks b3's text only.
   - This is not `stepProduct`: the 3.467 … 1.0025 squared lengths never reach a picture.
   - *Fix:*
     - Add an additive `euler.size?: false` (default true, so 709 F1 stays byte-identical) that drops both lines. Set it on b3.
     - Extend the lint to `complexReadouts(resolveComplexPlane(b3.stage))`.
2. **Caption claims what the bars cannot show (`l11-wait:b1`, `:101`).**
   - The caption ends "and ZZZ reads +1 where the other three settings read −1". The stage is amplitude bars of |G⟩, which draw no eigenvalue.
   - The circuit source also prints "after column 5".
   - *Fix:* use the planned tableau `{kind:'matrix', tableau:['ZZZ','ZXX','XZX','XXZ'], players:['Alice','Bob','Charlie'], targets:{ZZZ:1, ZXX:-1, XZX:-1, XXZ:-1}, state:{terms:'000-011-101-110'}}`. It draws ±1, ✓ and "wins 4 of 4". Or cut the caption to "four basis states of size ½".
3. **Rosetta credits ≅ to the notes (`l11-two-level:b2`, `:569`).**
   - The text says "The notes write $Z$ for $\\sigma_z$, and $\\cong$ for “is the same state as”". The notes write a tilde (pp. 2, 17, 18); ≅ is the app's choice (R5).
   - *Fix:* "The notes write $Z$ for $\\sigma_z$. We write $\\cong$ for “is the same state as” (equal up to an overall phase) where the notes use a tilde."
   - This keeps the R5 lint's substring and still avoids the ∼ glyph.
4. **A rate quoted for the wrong state (`l11-schrodinger:b2` caption, `:422`).**
   - The caption, under the running |+x⟩ picture, says "at $t = 0$ the $|{+z}\\rangle$ amplitude changes at the rate $-3i$".
   - `l11DerivZ` is `ketRate(H, |+z⟩)`, for a spin that *starts* in |+z⟩. For the pictured |+x⟩ the |+z⟩ amplitude 1/√2 changes at −3i/√2 ≈ −2.12i ε/ħ.
   - *Fix:* "… each amplitude changes at $-iE/\\hbar$ times itself: $-3i\\,\\varepsilon/\\hbar$ times the $|{+z}\\rangle$ one". Or name the |+z⟩ start, as `l11-sc-rate` does.
5. **A false Try-it line (`l11-two-level` Try-it 3, `L11.ts:539`).**
   - It says "Choose the start |+z⟩. Only one clock has a hand, and nothing moves however far you drag the time."
   - The one hand turns: the readout is "hand −3t°" (`clocks.ts:136`), the phase $e^{-iE_+t/\\hbar}$. Only the arrow, the gap line and P(+x) stand still.
   - The line contradicts the unit's own pitfall: "The ket's phase turns; only the predictions stand still."
   - *Fix:* "Only one clock has a hand. Drag the time: that hand turns (an overall phase), but the arrow and P(+x) never move."

## Nits

6. **`l11-stationary:b4` caption** "⟨H⟩ stays at 2ε … while the state moves". The stage is H alone in operator space (gauge off): no state and no ⟨H⟩. *Fix:* "H's two levels, 3ε and ε · for |+x⟩, ⟨H⟩ is their midpoint 2ε at every time".
7. **`l11-st-which` distractor why**, "These are equal mixes of the two energies" (`L11.ts:467`). The lecture reserves "mixture" (pitfall 2; the R lint misses "mixes"). *Fix:* "equal superpositions".
8. **Hand-typed decimals.**
   - `l11-un-bad` "(0.707 + 0.5, 0.5)" and "1.207²"; `l11-un-four` "0.207"; Arcade `l11-keeps-z` "1.707".
   - None of these comes from `V`. *Fix:* exact forms ($(1 + 1/\\sqrt2)/\\sqrt2$), or new keys.
9. **`l11-generator` Try-it caption** "N tiny turns chained", while the widget's slider is "n (steps)" and its title "(1 + iφ/n)ⁿ". Use one letter.
10. **`l11-stationary` Try-it 1** says "An energy eigenstate's ket changes in just this way". The dial shows |+x⟩ (relative phase 0), which is not an eigenstate of the example H. *Fix:* "an overall phase changes nothing; that is all an energy eigenstate ever gains".
11. **Bridge label** `'One-qubit gates, R_z among them'` (`bridges448.ts:47`) prints a literal underscore in the BridgeLink text (`BridgeLink.tsx:179`). *Fix:* "the z rotation among them".
12. **Stale code comments in `L11.values.ts`.**
    - `l11Over10` says 1.2758; the value is 1.27602.
    - `l11Err10` says 0.1255; the value is 0.13031.
    - `l11Err100` says 0.01232; the value is 0.012413.
    - `l11Err1000` says 0.001233; the value is 0.0012345.
    - The learner text and claims are right.
13. **"after column 5"** on `l11-wait:b1` (the amplitudes circuit cursor). Item 2's fix removes it.
14. **"Unit 10.8" (builder's item 2): correct.**
    - `RouteRail` numbers units `lecture.number.(k + 1)`, and `l10-what-ghz-proves` is L10's eighth unit. The Arcade labels it "10.8" too.
    - The notes' own §10.8 is the classical impossibility (app Unit 10.6). *Optional:* "(Unit 10.8, What the game proves)".

## Builder's language questions

None raised. "εt/ħ read as an angle" is defined once (`l11-schrodinger:b2` caption) and used consistently after it.

## Checked and right

- **Numbers (81 keys).**
  - wait: −1; |G⟩ from the circuit, ½, eigenvalues (+1, −1, −1, −1); R_z(90°)|+x⟩ ≅ |+y⟩; R_z(dφ) = I − iS_z dφ + O(dφ²); ½.
  - unitary: R_z(60°) unitary; |r| = 1; U₁|+x⟩ 1.707, |±z⟩ and |+y⟩ 1, off-diagonal 0.707; U₂ |+x⟩ 1 and |+y⟩ 0.293; neither unitary; only R_z of the four candidates.
  - generator: (−iσ_z)† = iσ_z; eigenvalues ±i; 3 and 1; e^{−iφS_z} = R_z(φ); the step 1.0005.
  - Go deeper 2: 3.467, 1.276, 1.025, 1.0025; gaps 1.151, 0.130, 0.0124, 0.00123; Euler 1.862, 1.332, 1.0195.
  - schrodinger: finite difference = −iHU|+x⟩; −3; the generator of R_z is S_z; |c±| = 0.707 throughout; phases −90°, −30°.
  - stationary: |+z⟩ only gains a phase with ⟨H⟩ = 3; P(+z) and P(−z) = 1; relative phase 90° at 45°; ⟨H⟩ = 2 and weights ½ at every time.
  - two-level: Ē = ħω = 2; U = e^{−iĒt}R_z(ωt) at 30° and 77°; hands −90°, −30°, gap 60°, gap 90° at 45°; r = (0.5, 0.866, 0) and r_y = 1; lap 180°; ⟨S_z⟩ = 0; U(T) = −I with ⟨+x|U(T)|+x⟩ = −1; P(+x) 0.75 for (3, 1) and (6, 4) with gap 60°.
  - Go deeper 3: P = 1, 0.75, 0.5, 0 and ⟨S_x⟩ = 0.5, 0.25, 0, −0.5 ħ.
  - challenges: 90°.
  - No displayed "−0": r_z at 30° is exactly 0.
- **Challenge keys (18).**
  - Numeric: 90, 1.707, 0.293, 1.0005, 3.467, −3, 1, 2, 2, 60, 90, −1, 0.75.
  - The choice keys (|+y⟩, R_z(60°), −iσ_z, "|±z⟩ only") and the D3 order are true, and every distractor's why holds, except item 7's word.
- **Derivations.**
  - D1–D6 match pp. 11, 12, 14, 16, 17 and 18 step for step: the dt² drop, the six Schrödinger steps, and the series on |E⟩.
  - In D5, I and Z commute so the exponential splits, and Ē is a global phase. In D6 the factor $e^{-i\\bar Et/\\hbar}e^{-i\\omega t/2}$ leaves $e^{+i\\omega t}$ on |−z⟩.
  - The `eq()` helper draws $e^{-3it}(|+z\\rangle + e^{2it}|-z\\rangle)/\\sqrt2$ exactly: azimuth 2t, global phase −3t.
- **Captions against the stage code.**
  - clocks: "gap = 90°" (`gap0`), hands −90°/−30°, the ladder 3ε and ε around Ē = 2ε, the top arrow at 60°.
  - Bloch: the turn and length captions match. The global-phase beats keep the point fixed.
  - hopf: one lap gives the ket sign −1. matrix: R_z(60°), U†U = I, the off-diagonal 0.707 of U₁†U₁.
  - Exceptions: items 1, 2, 4 and 6.
- **Try-it lines.** All doable except item 5.
  - Bloch: R_z(30°) three times reads φ = 90°, and nine R_z(10°) presses do the same. "Wait for the point to stop" is needed: a press restarts from the current ket.
  - Complex plane: the multiply readout shows r = 1.00 for z, w and zw, with "drag w". The Euler n slider runs 1–64, and N = 1 ends at 1 − 1.571i.
  - Phase dial: "multiply both by e^{iπ/2}" is there without `rotations`.
  - Two clocks: the Ē slider runs 0.5–8 in 0.5 steps, so 2ε → 4ε is reachable, and ħω stays 2ε.
- **Citations.**
  - Unit pages: pp. 1–2, 10, 19; p. 11; pp. 12–13; pp. 14–15; p. 16; pp. 17–19. Each matches its § and the "n / 19" footer.
  - The deeper refs, p. 11, p. 13 and p. 2's planned §11.10, are right.
  - Susskind:
    - §4.2 and §4.4: the conservation of distinctions.
    - §4.3: determinism of the state.
    - §§4.5–4.6: unitarity plus continuity, the −i as a convention aimed at energy, ħ for units.
    - §4.8 and §4.10: phase-factor and [H, H] = 0.
    - §4.11: the gyroscope, and each reading still ±1.
    - §§4.12–4.13: the special case, the time-independent equation, the recipe.
  - Townsend pp. 36–37: finite rotations from infinitesimal ones.
- **Rulings and Go deeper.**
  - R1: clocks only in unit 6, and the widget shares the scene.
  - R2: 3ε and ε, except one 6ε/4ε reveal.
  - R3: cos²(ωt/2) only in b10. R4: no marker, "Class 11, second half", one link-back.
  - R6: `hamiltonian` first is `l6-generator:b7`, introduced here once. R8: Susskind Lecture 4 plus Townsend §2.2.
  - The three Go-deeper beats are beyond the notes, open "Beyond the notes:", come last in their units, and carry no step of the notes' argument.
- **Fidelity to the notes.**
  - §§11.4–11.10 are in order and nothing important is dropped.
  - Covered: "static so far", the R_z analogy, "simply waiting cannot cause the total probability to cease being one", the identification of H with physics, the rotation/time table, "not a new law", "the state itself evolves", stationary states and relative phase, the central message and the consolidation.
  - The p. 13 "definition" nit is handled with "tends to".
- **Unit references.** All map to the right earlier units:
  - Unit 6.4: R_z = e^{−iφS_z/ħ}, power series, matrix exponential.
  - Unit 6.3: `rotation-operator` first. Unit 6.2: the equator.
  - Unit 5.3: `unitary` first. Units 1.5 and 7.2: global phase, full-turn sign.
  - Unit 7.1: θ is polar. Unit 1.1: `precession` first.
- **Glossary.**
  - 11 new ids, each linked at its `first` beat. The `mixture` link sits in the pitfall that says a superposition is not one.
  - No duplicate term in 448, and no collision with the 290 709 ids.
- **Chips.** `f4-unitary`, `f1-euler` and `q4-one-qubit-gates` exist with matching titles, in Go-deeper beats only.
- **Arcade.** The five spot-the-error rounds have the right wrong step and a true why (U†U = I + H²dt²/ħ²; the dropped i; the arrow at (E₊ − E₋)/ħ). The Waiting game runs +x → +y → −x → −y in three R_z(+90°) waits, par 3, a quarter period being εt/ħ = 45°.
