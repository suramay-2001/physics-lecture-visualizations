# Independent P truth review: Physics 448 Lectures 12 and 13 (lean pass, read-only)

Scope: `app/src/content/L12*.ts`, `L13*.ts` (stories, values, review cards, glossary rows, bridges), `physics/wave.ts`, `constants.ts`, `ring.ts`, the `wavefunction` kind,
the eight Arcade rounds, plans `P-L12-story.md`, `P-L13-story.md`, rulings `448-L12L13.md`. No Playwright, no screenshots; page images of the notes were read (L12 pp. 4, 8, 13; L13 p. 7).

## Verdicts

| Chapter | Verdict | Blocking | Should-fix | Nits |
|---|---|---|---|---|
| L12 Quantum dynamics and the position basis | **FIX-FIRST** (one displayed-number defect, a three-line fix; every computed value is right) | 1 | 7 | 7 |
| L13 Position, momentum and the Schrödinger equation | **PASS with fixes** | 0 | 8 | 10 |

Evidence: 76 values recomputed with my own python (scipy erf and quad, closed forms, no engine): every displayed number of both chapters, including the step products N = 1…256 by exact
momentum-space integrals (norms 2, 1.3366, 1.0685, 1.0160, 1.0039; gaps 0.7575 … 0.0034), cells, intervals, widths, the helium and spreading numbers: 0 differences beyond display rounding.
All 124 keyed claims (57 + 67) were read against the sentence that uses them; 40 Townsend and Susskind locators were checked against `sources/` (printed = PDF − 16); 13 Try-its were checked against the
widget code; every stage readout of every beat (about 70 lines, resolved with the real resolvers) was compared with the prose; sentence caps by script (TeX counts one word); 30 "Unit n.m" pointers
resolved to unit ids; glossary id and term lists scanned for duplicates (none); 6-gram scan against the notes, Townsend Ch. 4 and 6, Susskind Lectures 8 and 9. Counts match the relay notes
(L12: 6 units, 39 beats, 6 derivations, 19 challenges, 4 rounds; L13: 7, 47, 9, 28, 4) except the L13 glossary (N10).

## Blocking

| # | Where | Finding and exact fix |
|---|---|---|
| B1 | `L12.story.ts:42, 93, 121, 148` (l12-law:b6 stage, its derivation step 4, l12-law:b8 reveal) | `three()` gives each arrow the size 1/√3 (an amplitude c_n), and the chain of "weighted arrows" is the survival amplitude Σ|c_n|²e^{−iE_nt/ħ}, whose arrows are 1/3 long (the plan, P-L12 §1 b6 and b8, says `sizes:[1/3,1/3,1/3]`; the challenge walkthrough `L12.ts:169` uses 1/3). The complex-plane kind prints "sum, size, size²" for every chain, so b6 and step 4 show **size² 0.333** beside "falls to 1/9", and the b8 reveal shows **size 1.732, size² 3** beside "stays at 1". Fix: add `const third = (p: number[]) => ({ phasesDeg: p, sizes: [1/3, 1/3, 1/3] })` and use it at lines 93, 121, 148 (keep `three` for the `spokes`). The readouts become size² 0.111 and 1. |

## Should-fix

| # | Where | Finding and exact fix |
|---|---|---|
| S1 | `L12.ts:207`, `L12.story.ts:227, 230` | "his Larmor frequency ω₀": the word "Larmor" is not in Townsend (no hit in the extracted text); §4.3 defines ω₀ = geB₀/2mc (Eq. 4.17, p. 115). Fix: "the notes’ ω is his ω₀, the frequency of the precession". |
| S2 | `L12.story.ts:419` | "(his Eqs. 6.9–6.12)" for ⟨φ|ψ⟩ = ∫φ*ψ: that result is Example 6.1 on p. 195; Eqs. 6.9–6.12 are the norm, the Born density and ψ(x). Fix: "(his Example 6.1, p. 195)". |
| S3 | `L13.story.ts:518` | "§6.3 (p. 199, Eq. 6.31) … give the matrix elements of p̂": Eq. 6.31 is [x̂, p̂] = iħ; the matrix elements are Eq. 6.43 (§6.4, p. 202). Fix: "§6.3 (p. 199, Eq. 6.31) gives [x̂,p̂] = iħ; §6.4 (p. 202, Eqs. 6.43–6.45) gives the matrix elements and the form of p̂". |
| S4 | `L13.story.ts:713` | "Unit 11.2 used T for the period": T = 2π/ω is in Unit 11.6 (`l11-two-level:b8`, `L11.story.ts:694`); Unit 11.2 (`l11-unitary`) has no T. Fix: "Unit 11.6". |
| S5 | `L13.story.ts:652`, `L13.ts:725` | The spreading time m a²/ħ uses Townsend’s a = √2σ, but the beat has just written the width in σ and never says a = √2σ (Unit 13.2 uses a for the shift). The challenge calls it "a packet of width 10⁻¹⁰ m": width read as σ gives 1.73×10⁻¹⁶ s, log₁₀ = −15.76, not the keyed −16.06. Fix: b6 add "where $a = \sqrt2\,\sigma$ (Unit 13.4)"; prompt "with Townsend’s parameter $a = 10^{-10}$ m ($a = \sqrt2\,\sigma$)". |
| S6 | `L12.story.ts:611–614`, `L12.values.ts:79, 150` | The sentence is a packet with b = 1 shifted by a = 2, but claim `l12PeakPos` is the packet at 0 shifted by 3; both give 3, so the claim does not test the sentence. Fix: a value for (b = 1, a = 2), or reword the sentence to b = 0, a = 3. |
| S7 | `L12.story.ts:265, 273, 309, 320` (claims `:304, 313, 328`) | "the middle cell" is the cell [0, w) (the readout prints "cell [0, 0.25)"); an even count has two middle cells, and b2 never gives the window −8ℓ…8ℓ (only `L12.ts:342` does), so "chop the line into 4 cells" cannot give "0 to 4ℓ". Fix: "the cell that starts at 0", and "in the window from −8ℓ to 8ℓ" in b2. |
| S8 | `L12.story.ts:265, 287, 309, 338`; `glossary.ts:328` | Unit 12.3 uses "packet", "density" and ψ(xₙ) before Unit 12.4 defines ψ(x) and the density, and the gloss "wave packet" first appears in `l13-plane-wave:b4`. Fix: one plain sentence in l12-continuum:b2 (a packet is a bell-shaped bump of amplitude), move the gloss `first` there, and say "chance per ℓ" instead of "density" in b4 and b6. |
| S9 | `L13.story.ts:685`, `L13.ts:742, 761` | The beat opens "The notes’ optional §13.10", but the two-wave fringe example (p = 2 and 4, spacing π, speed 3 = (p₁+p₂)/2m) is ours; the challenges say "(optional, §13.10)". Fix: put "Beyond the notes:" before "Two energies make a moving pattern." and title the challenges "(beyond the notes)". |
| S10 | `L13.story.ts:540` | "That is why position needs a continuous basis": the trace argument shows only that [x̂, p̂] = iħ needs infinitely many dimensions (oscillator levels are a discrete infinite basis where it holds). Fix: "…needs an infinite-dimensional space; the continuous position basis supplies one." |
| S11 | `L13.ts:216–219`; same lines in `L12.ts:473` | Try-it 2 ends "The i in p̂ is what makes its averages real", but the widget (multiply mode) shows only real × real = real; also "drag w" needs the "Drag which number" switch first. Fix: "Choose drag w, put w on the real axis: the product is real again. Without the i, p̂ψ would be real for a real ψ." |
| S12 | `L13.ts:146, 345, 355, 729–731`; `L12.ts:347, 514` | Typed constants and answers in prompts and hints (λ = 45.3 pm, ħ = 1.05×10⁻³⁴, m = 9.1×10⁻³¹, "about 8.6×10⁻¹⁷ s", √(2π) ≈ 2.507) have no V key or claim (skill 06 pitfall). Fix: build them with `d(V…)` and `constants.ts`, or drop the digits. |
| S13 | `BUILD-LOG.md`; `P-L13-story.md:210` | BUILD-LOG has no L12/L13 entry, and the planned Arcade game "Squeeze" was dropped with no ruling (only the relay note says so). Fix: log it as deferred in `448-L12L13.md` and BUILD-LOG. |

## Nits

| # | Where | Finding and fix |
|---|---|---|
| N1 | `L12.ts:266` (26 words), `:379` (28), `L13.ts:217` (29), `:515` (27) | Sentences over 25 words in prompts and Try-its, which the platform lint does not scan. Split each. |
| N2 | `L12.story.ts:76, 309, 486`; `L13.story.ts:110` | Runs of 6 to 7 words shared with the notes ("but energy need not be conserved", "are orthogonal and that the continuum …", "its eigenvalues are still the possible … outcomes", "the delta is a distribution, not an ordinary …"): below the 8-gram test. Rephrase. |
| N3 | `L12.story.ts:415, 508`; `L13.story.ts:333, 685, 722–744, 769` | φ is the azimuth, a second state and φ_E (13.4 says "we keep φ for the azimuth"); V is the potential (13.6, 13.7) and the energy-shift unitary V(ε) in the same unit. Rename the unitary W(ε) and the second state χ. |
| N4 | `L12.ts:116`, `L13.ts:209, 394` (and the matching ref lines) | §4.1 runs to p. 114, §6.3 starts on p. 197, §6.6 runs to p. 210. |
| N5 | `L13.story.ts:280`; `L12.story.ts:576` | Stage prints "Δp = 0.13" beside the prose 0.125; "imaginary part follows the slope" (it follows minus the slope). |
| N6 | `L12.ts:379, 304, 123`; `L13.ts:632, 800` | The widget shows r, not r², and the bars as percentages; the same "raise Ē" line appears in three units. |
| N7 | `L13.ts:474` | Title "From ψ(x) to ψ̃(p)" but the steps build ψ(x) from ψ̃(p). |
| N8 | `glossary.ts:335` | "time operator … none, because time is a parameter": the unit’s reason is the lowest energy. |
| N9 | `constants.ts` header and `spreadTime` note; `pipeline/make_fixtures.py:1079` | Header says CODATA 2018 (2022 is current; mₑ moves by 1.4×10⁻⁹, no displayed digit changes); "√2 or so" is exactly √2; the 79 eV binding energy is 1.4×10⁻³⁴ kg (2×10⁻⁸ relative), not 1×10⁻³⁵. |
| N10 | relay `2026-10-14-L13.md`; `L13.story.ts:769` | The relay says 14 L13 glossary entries; `glossary.ts` has 12 (L12: 11, right). Our V = x²/2 example follows Townsend’s sentences unlabelled: add "Our example:". |

## Known items

- **Try-its (R7)**: all 13 sets are true on the widgets they name (two-clocks: 30° gives a 60° gap, P(+x) = 0.750; 90° gives 180° and 0; the Ē slider exists; amplitude-bars θ, φ sliders; complex-plane multiply with
  r readouts; basis-translator "Diagonal" and "Not diagonal" lines). Exceptions are S11 and N6.
- **P_CUT = 16**: harmless. With and without the cut the step-product norm for N = 256 agrees to 1e-14, because the Gaussian momentum density at p = 16 is e^{−512}. It is valid only for Δp ≪ 16 and silent beyond:
  a dev-only assertion in `translateBySteps` would keep a later σ < 1/8 caller honest.
- **"Squeeze"**: not built, and nothing in the app promises it (S13).
- **SI constants**: h, e, c are exact; mₑ, u and the helium-4 atom mass 4.00260325413 u are CODATA values, labelled measured; the numpy twin rebuilds mₑ from R∞, α and h and agrees (9.10938370152×10⁻³¹ kg).

## Corrections table (what the lectures attribute to the sources)

No Correction boxes and no `reported` values exist (R8, confirmed). The notes’ slips are layout and notation only: the p. 8 "full chain" box overflows the margin, L13 footers read "k / ??", ∼ for ≅, θ(t) for the azimuth,
L̂ against S_z (p. 4 against p. 12), T̂ for the shift (L13 p. 3) and for the time operator (p. 11), Û(a) for the shift (L13 p. 10), ϕ(p). Every notes quotation in the beats matches its page.

| Item | Where in the lectures | Source prints | Verdict |
|---|---|---|---|
| H, Eqs. 4.4–4.15, "Schrödinger first proposed the equation in 1926" | `L12.ts:116`; `L13.ts:623` | Townsend §4.1 pp. 111–114 (4.8 on p. 112, 4.14–4.15 on p. 113) | right (N4) |
| H = ω₀S_z, cos(ω₀t/2), ⟨S_x⟩ = (ħ/2)cos ω₀t | `L12.story.ts:227` | §4.3 Eqs. 4.17, 4.24, 4.28, pp. 115–117; no "Larmor" | right except S1 |
| Microscope resolution ≈ a wavelength | `L12.story.ts:338` | §6.1 Eq. 6.2, pp. 191–192 | right |
| I = ∫dx\|x⟩⟨x\|, ⟨x\|x′⟩ = δ, ⟨x⟩ = ∫ψ*xψ | `L12.ts:296, 465` | §6.1 Eqs. 6.4–6.6 (pp. 193–194), 6.13–6.14 (p. 195) | right |
| ⟨φ\|ψ⟩ = ∫φ*ψ | `L12.story.ts:419` | Example 6.1, p. 195 | citation wrong (S2) |
| Peak at b moves to a + b; active against passive, footnote | `L12.story.ts:611, 601` | §6.2 Fig. 6.2, p. 196; p. 197 and footnote 2 | right |
| Hermitian generator, [x̂, G] = iħ, d⟨x⟩/dt = ⟨p⟩/m, momentum conserved when [H, p̂] = 0 | `L13.story.ts:199, 769` | §6.3 Eqs. 6.27–6.36, pp. 198–200 | right |
| "matrix elements of p̂ … Eq. 6.31" | `L13.story.ts:518` | Eq. 6.31 is the commutator; matrix elements are Eq. 6.43, p. 202 | citation wrong (S3) |
| δ as the limit of narrower Gaussians | `L13.story.ts:118` | Eq. 6.64, p. 205 | right |
| N = 1/√(2πħ), λ = h/p, the pair | `L13.story.ts:288, 389` | Eqs. 6.46–6.57, pp. 202–204 | right |
| Helium 2.2 km/s, d = 8 μm, L = 1.95 m: 45 pm, 11 μm | `L13.story.ts:288` | Example 6.5, pp. 211–212 (45 pm, 11 μm); ours 45.3 pm, 11.05 μm | right |
| Δx = a/√2, Δp = ħ/(√2a), ΔxΔp = ħ/2; a = √2σ | `L13.story.ts:389` | Eqs. 6.67, 6.72, p. 207 | right |
| Spreading σ√(1+(ħt/2mσ²)²), T = ma²/ħ; 1 g, 0.1 cm: 10²⁵ s; electron, 10⁻⁸ cm: 10⁻¹⁶ s | `L13.story.ts:652` | Eqs. 6.73–6.77, Example 6.4, pp. 208–209; ours 9.5×10²⁴ s, 3.0×10¹⁷ yr, 8.6×10⁻¹⁷ s | right (S5) |
| Susskind §8.1.1, 8.1.2, 8.1.4, 8.2, 8.2.1, 8.2.2, 8.3, 8.4, 8.5; Lecture 9 §9.1–9.3 | `L12.ts`, `L13.ts` refs | Section headings and contents in `chapter008.md`, `chapter009.md` | right |

## Checked and right

Every derivation step is true and each last step is the stated result (6 + 9 derivations). All 8 Arcade rounds have exactly one first wrong step (index 2), each `why` is correct, unit labels 12.1, 12.2, 12.4, 12.6,
13.3, 13.5, 13.6, 13.7 match. The three chips (`sl-f4-unitary`, `sl-f8-dft`, `sl-q3-uncertainty`) and the L11 back-pointer land on units that teach the idea. Unit order follows the notes. Challenge answers
and hints (47 challenges) recompute, including all walkthrough arithmetic. No clue beat spoils its answer in its stage readouts.

## R fixes (fix pass, 2026-10-16)

Every item is fixed. `674865c` = L12 content, glossary, engine and pipeline comments; `4f189e8` = L13 content, Arcade round, regenerated `meta.detail.generated.ts`; "docs" = the commit that holds this section.
Checks run: vitest on `src/content`, `src/arcade`, `physics/wave` (54 files, green), `UPDATE_META=1` twice (second run wrote nothing), `tsc -b` clean, claims twin rerun (`claims.json` byte-identical),
`npm run build`, Playwright preview: `story.spec.ts -g "L12|L13"`, `arcade.spec.ts`, `l11-widgets.spec.ts` (17 passed).

| Item | Commit | What changed |
|---|---|---|
| B1 | 674865c | `third()` (sizes 1/3) at the b6 stage, derivation step 4 and the b8 reveal; `three()` kept for the spokes. Readouts: size² 0.111 and 1. |
| S1 | 674865c | "his Larmor frequency" replaced by "his ω₀, the frequency of the precession" (story and `L12.ts` book row; `[[precession]]` marker added). |
| S2 | 674865c | "(his Example 6.1, p. 195)". The second state is now χ (N3). |
| S3 | 4f189e8 | §6.3 Eq. 6.31 is [x̂, p̂] = iħ; §6.4 Eqs. 6.43–6.45 give the matrix elements. |
| S4 | 4f189e8 | "Unit 11.6 used T for the period." |
| S5 | 4f189e8 | b6 says a = √2 σ (Unit 13.4); the challenge prompt says Townsend's parameter a (a = √2 σ). |
| S6 | 674865c | `l12PeakPos` now computes the b = 1 packet shifted by a = 2 (value and numpy twin; still 3.0, JSON unchanged); claim text updated. |
| S7 | 674865c | "the cell that starts at 0" everywhere; b2 gives the window from −8ℓ to 8ℓ; claim texts name the cells. |
| S8 | 674865c | One packet sentence in `l12-continuum:b2` with the `[[wave-packet]]` marker, gloss `first` moved there (gloss no longer needs plane waves); "chance per ℓ" instead of "density" in b4 and b6, and in the 12.3 challenge hints. |
| S9 | 4f189e8 | "Beyond the notes: two energies make a moving pattern."; challenge titles "(beyond the notes)". |
| S10 | 4f189e8 | "…needs an infinite-dimensional space; the continuous position basis supplies one." |
| S11 | 4f189e8 + 674865c | Try-it 2 (L13): "drag w" switch named, product real again, "Without the i, p̂ψ would be real for a real ψ"; the L12 Try-it names the switch too. |
| S12 | 674865c + 4f189e8 | λ, fringe, m, ħ, 8.6×10⁻¹⁷, 0.4 per ℓ, 0.63 now come from `d(V…)` and `physics/constants`; the √(2π) digits are dropped. |
| S13 | docs | Squeeze logged as ruling R9 in `448-L12L13.md` and in BUILD-LOG (L12/L13 entry added). It needs a new game type, so its idea is the fifth L13 Spot-the-error round `l13-squeeze` (Unit 13.4, test in `L13.test.ts`). |
| N1 | 674865c + 4f189e8 | The four long sentences split (`L12.ts` 266, 379; `L13.ts` 217, 515). |
| N2 | 674865c + 4f189e8 | The four shared-wording runs rephrased. |
| N3 | 674865c + 4f189e8 | Second state χ (symbol row `\chi` added); the energy-shift unitary is W(ε) (symbol row `W` added; review card and equations updated). |
| N4 | 674865c + 4f189e8 | §4.1 pp. 111–114; §6.3 pp. 197–200; §6.6 pp. 204–210 (story refs and `L13.ts` rows). |
| N5 | 674865c + 4f189e8 | "follows minus the slope"; the beat says the readout rounds Δp = 0.125 to two decimals. |
| N6 | 674865c + 4f189e8 | Percent bars and r (not r²) in the Try-its; the three "raise Ē" lines now differ. |
| N7 | 4f189e8 | Title "From ψ̃(p) to ψ(x)". |
| N8 | 674865c | Time-operator gloss: "because energies have a lowest value". |
| N9 | 674865c | Header says CODATA 2018 with the 2022 shift stated; "√2 or so" → "the factor √2"; helium binding-energy comment 1.4e-34 kg. |
| N10 | 4f189e8 + docs | "Our example:" before V = x²/2; relay `2026-10-14-L13.md` now says 12 glossary entries (and 5 rounds). |
| Known: P_CUT | 674865c | `translateBySteps` throws when the state has content above `P_CUT`; test in `wave.test.ts`. |
