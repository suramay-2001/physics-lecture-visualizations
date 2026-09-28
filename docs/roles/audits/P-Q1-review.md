# P review: 709 Q1 "Stern–Gerlach and the rules of the game" (merge 29742f0, 2026-09-28)

**Verdict: FIX-FIRST.** Every number and all four derivations are right. Two things must be fixed first. One text-and-stage link breaks the chapter's own sign erratum N1. One clue answer starts with the wrong word.

Evidence (scratchpad `q1review-*`):
- Contact sheets of all 38 beats and 7 reveals in both tracks, with 0 console errors.
- A numpy recompute from CODATA constants.
- Both RNGs ported to reproduce the seeded tallies.
- 13 of 13 bridges followed out and back.
- Sources read in the text layers and the notes' page renders.
- `vitest src/content`: 1677 passed.

## Blocking

1. **Sign convention against N1.**
   - `Q1.story.ts:163` links μ_z's "one up" to `spot-plus`. From b6 on, the bench labels that spot +ħ/2 (`sequences:b1`: its atoms are spin up). For silver, μ_z up means S_z = −ħ/2, so this is the notes' pre-N1 convention.
   - b5 and b8 also put the ghost band's +μ end over the + spot. b5 lacks `lab-moment-opposite`.
   - Ground never says the moment opposes the spin, except in `q1-t-sign`. Its prompt "The field grows upward" (`Q1.ts:322`) sits beside b6's +ħ/2-on-top picture under a "z · field gradient" arrow.
   - *Fix:*
     - b5: "two values, equal in size and opposite in sign, one per {{up|spot}}". Add `lab-moment-opposite` to b5 and b8.
     - b6 Ground: "For silver the tiny magnet points against the spin, so which spot is +ħ/2 depends on which way the field grows; the bench paints + on top."
     - Prompt: "B_z grows upward (∂B_z/∂z > 0)".
     - 448 `l1-quantized:b3` shares the ±μ/±ħ/2 picture: W should look at it there too.
2. **`q1-superposition:b6` Ground reveal (`:451`) is false as written.** The question asks: "Is (|+z⟩+|−z⟩)/√2 *just* a half-and-half beam?" The answer begins "Yes, they differ."
   - *Fix:* "No: they differ." The Formal wording is correct.

## Should-fix

3. **Readouts contradict or spoil the text.**
   - `sequences:b4` (`:284`, hidden-label): the caption says "P(+z) = 1", while the readout shows "+ 353 · − 344 · Born 50.0%".
   - The `sequences:b7` question (`:317`) shows "Born 100.0%" and an all-+ plate before "Show me".
   - *Fix:* gate the tally and Born readout off under `hidden-label`, as for `classical` (W). Give the b7 question `beamTo: 'gap'`.
4. **Hydrogen beat b8 (`:212`).**
   - It draws the classical smear band, while its text says one undeflected beam was expected.
   - "Was expected" is N&C's shaky history: spin was proposed in 1925, and old quantum theory gave hydrogen an orbital moment.
   - *Fix:* drop `ghostBand`. Write "…so without spin the beam would pass straight through."
   - The ruling (the bench draws silver, both tracks, plus the fidelity line) is met.
5. **Errata box.**
   - The builder is right: N13 (`Q1.ts:153`, check `q1Defl > 0`) and N15 (`:165`, check on the S_z eigenvalue) test nothing about their claims.
   - Neither is an erratum. "Screen" is already mapped to "plate" in the Rosetta, and N&C E3 ruled "the gloss stands" for ħ. N15 also puts "engine" in learner text.
   - N17's check (`:173`) only re-derives Δz.
   - *Fix:* remove N13 and N15 (plan §8.2). Give N17 a relevant check, or make it a note.
6. **N2 is unfair to the notes (`Q1.ts:213`).**
   - The notes say "a bilinear mapping of a vector and a dual vector". Pairing a bra with a ket *is* bilinear.
   - The conjugation lives in the ket-to-bra map, as the app's own `ip:b1` Formal and `qc-dual-space` gloss say.
   - *Fix:* "Pairing a bra with a ket is bilinear, but the ket-to-bra map conjugates, so as a function of two kets it is sesquilinear (the notes' fifth rule)…"
7. **Near-copies the 8-gram test misses.** The test needs two shared 8-grams; each of these has at most one.
   - N9 "says" (`:177`) keeps 10 of the notes' 11 words.
   - N14 (`:159`) and N2 (`:213`) share 6- and 7-grams with the notes.
   - The gloss `qc-superposition` (`Q1.glossary.ts:130`) keeps the notes' sentence frame.
   - *Fix:* paraphrase.
8. **Ruling 7 is not met at first use.**
   - The zero vector 0 first appears in Formal `sequences:b2` (`:256`). "SG_{z+}|−z⟩ = 0" there is credited to notes p. 2, which lacks it.
   - It appears again in the `superposition:b7` reveal caption (`:479`).
   - Both come before the note at `vs:b3`. The plan's Rosetta clause was dropped.
   - *Fix:* restore it at `sequences:b1`, and add "(the zero vector, Unit 1.4)" at b7.
9. **D1 Ground is not derived.** Step 4 (`:103`) gives "force = −slope" by the analogy of a ball rolling downhill.
   - *Fix:* "E = mgh rises by mg per metre, and gravity pulls down with mg: a push is minus the slope."
   - D2 does start from Newton, t = L/v and ½at².
10. **`vs:b4` overlap (builder flag, `:540`): judged real.**
    - The readout "image = 6.00 × ψ · eigenvector" hides "of ℂ²" and the passport's ⓘ, which opens this unit's `qc-plane-vectors-not-states` note.
    - "Eigenvector" is undefined in Q1.
    - *Fix:* suppress or move the image readout.
11. **Citations.**
    - Axler 1.27 is on p. 15, not 14 (`Q1.ts:202, 572`).
    - Axler's adjoint is 7.1 on p. 228, not pp. 183–184 (`:705`).
    - Bergou p. 1 has only Eq. 1.1: "complex" and normalization come from Eq. 1.2 on p. 2 (`:415, 417, 422`; `Q1.ts:447`).
    - N&C Fig. 1.23 is on p. 45 (`:273`).
12. **Hand-typed constants.** The glosses `qc-hbar` "1.05 × 10⁻³⁴" and `qc-bohr-magneton` "9.27 × 10⁻²⁴" (`Q1.glossary.ts:47, 64`) have no V key and no claim. `Q1.values.ts` promises no ħ.
    - *Fix:* drop them until E1 lands.
13. **`ip:b7` Ground (`:703`):** "his ⟨α, β⟩ is our ⟨β|α⟩: same size, opposite phase". These two are equal; the phase is opposite only to our ⟨α|β⟩, which is never named.

## Nits

14. **The b9 question (`:221`)** draws the same 1000 T/m bench at half the split of b5–b8. Fine under "not to scale", or say so.
15. **Undefined stage symbols in Ground:**
    - |0⟩ = |+z⟩ labels from `superposition:b1`, before b5;
    - a₀, a, λ and "unitary" (`ip:b5`, `b8`);
    - the D3 head P(+,+,±), and Δ in the D2 head;
    - probability readouts on the polynomial beat `vs:b5`.
16. **Formal:**
    - `sequences:b6` (`:306`): "[S_z,S_x] ≠ 0 ⇒ no common eigenstate" needs "iS_y has no zero eigenvalue".
    - The b3 captionFormal (`:96`) omits 1000 T/m.
    - `vs:b4`: "packs the two distributive laws" holds only once 1α = α is added. ℤ/3 with c·v ≡ 1 satisfies the combined law but fails a(u+v) = au+av.
17. **D4 Ground step 8 (`:634`)** should name (z+w)* = z*+w*.
18. **`q1-p-not-unit` (`Q1.ts:556`)** prints the cross term 2·½·(1/√2) from `q1AmpX`: the value is right, the key is wrong.
19. **Unlinted caps:** books lines `Q1.ts:572` (28 words) and `:448` (26); N17's shouldSay (27). "Engine" also appears in `qc-hbar` Formal.
20. **The `qc-l3-projectors` popover** repeats its title.
21. **Dev tally drift (448 widget).**
    - `SGLab.tsx:116` runs `fireMany` inside a setState updater, which StrictMode calls twice.
    - Dev shows 86/114 for seed 709's first 200 atoms; production shows 100/100. Both are reproduced.
22. **For the judge:**
    - The `q1-sequences` preset z(+), x(+), z is literally HW1 P2's θ = 90° case, the notes' example. No text names a maximum, varies θ, or gives ¼ of the first filter's output, so I read it as within ruling 3.
    - `q1-i-weighted` states that (1, −i) is an eigenvector of 2I − σ_y. That is a result, not the method, consistent with "state |±y⟩" for 448's assigned S_y item.

## Builder's language questions

- **a and v:** keep them. v is only ever a speed; a is defined in place in 1.1 and 1.4. Only the stage's a and a₀ are undefined (item 15).
- **"Motion about the nucleus makes no magnet at all":** keep it; it is true for l = 0. Fix the history instead (item 4).
- **"Unit 1.x":** keep it. It matches the rail, and 448 links always say "Spin Lab".
- **"Gaussian units":** correct. eħ/2m_ec = 9.274 × 10⁻²¹ erg/G = 9.274 × 10⁻²⁴ J/T.

## Dropped numbers

No beat is misleading or empty.
- "Many precession turns" is true: 1.8 × 10⁶ turns at 1 T and 1.8 × 10⁴ at 0.01 T, in 63.64 µs.
- ħ is named without a value, and "g ≈ 2" is fine.
- Only the glossary still prints ħ (item 12).

## Checked and right

**Stern–Gerlach numbers from first principles:**
- μ_B 9.27401 × 10⁻²⁴ J/T (`q1MuB`).
- F 9.274 × 10⁻²¹ N (`q1Force`).
- m 1.791 × 10⁻²⁵ kg (`q1Mass`).
- a 5.1776 × 10⁴ m/s² (`q1Accel`).
- t 63.636 µs (`q1Flight`).
- Δz 0.10483 and 0.20967 mm (`q1Defl`, `q1DeflG2`, `q1SignDown`).
- The fixtures agree to 7 × 10⁻¹².

**Seeded tallies:**
- The stage deposit (LCG seed 1000) gives +358 −344, +358 −345 and +692 −708 (51.0, 50.9 and 49.4 %), exactly as on screen.
- The plan's film tallies (seed 709; 496, 246, 126, 132) reproduce.

**All other numbers:**
- **Sequences:** ½, 1, ⅛, ½/¼ blocked, 1/16 (`q1Zxz*`, `q1Zzz`, `q1Zxzx`, …).
- **Superposition:** 0.707i, 0.866/0.5/0.75/0.25, 1 vs 0.5, 1.414, 0.64, 0.2, 0.146, 1.3066.
- **Vector space and inner product:** 1.848, 3, 5, 1.414 − 0.707i, 25/5/−7, eigenvalues 1 and 3, 2/2/6, 45°, 0/−1, −0.6.
- No displayed sum of rounded numbers is false.

**Derivations:** D1–D4 are true and in order in both tracks, apart from items 9 and 17.

**Homework:**
- HW1 P1–P5 are not worked.
- 448 `l2-c-euler` and `l3-eig-real` are untouched; `l4-g-sy` is covered in item 22.
- D4 carries "N&C ⚑ Ex. 2.6"; Ex. 2.57 is cited, not worked.

**Rulings:** 4 (axioms only; F2 named in words), 7 (the note at `vs:b3`, but see item 8) and 8 (the b7 badge) are met.

**Other errata:** N1, N8a, N9 content, N10 (the lazy scaling passes all 7 of the notes' rules), N11, N12, N14, N16 and N18 are right and in the notes' voice.

**Citations (22 checked):**
- Notes pp. 2–5 and 7.
- N&C pp. xxix, 43–45, 61–62, 65, 66, 86 and 91.
- Axler pp. 12, 14, 31, 183 and 184.
- Bergou p. 1.

**Bridges, concepts, titles and caps:**
- All 13 bridges land and return to the same beat and track.
- The 5 `sameAs` twins and the F1 needs are sound.
- Titles are plain text.
- Sentence caps pass.

## Judge's rulings (Claude, 2026-09-28)
- **Item 22, preset:** the `q1-sequences` preset z(+), x(+), z stays. It is the notes' own example, and no text varies θ, names a maximum or gives the HW1 P2 fraction. This is the same ruling as for the SG bench's `l1-zxz`.
- **Item 22, eigenvector:** `q1-i-weighted` stays. It states a result and walks through no method, as `P-709-NC` §5 allows for `l4-g-sy`.
- **Item 1 and 448 L1:** the fix pass checks 448 `l1-quantized:b3`. A 448 edit is allowed only if that beat's text, caption or
  stage links "moment up" to the +ħ/2 spot without the moment-opposite note. The edit must be minimal: the fidelity
  flag or one clause. It is reported separately, and 448's claims and e2e must stay green.
- **Item 21:** the 448 SGLab widget's StrictMode double-fire is fixed in the same pass: it is a dev-only drift, but a
  real bug.
