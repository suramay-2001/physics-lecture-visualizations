# P-L18 — Lecture 18 story plan: quantum reflection and tunnelling

Role P, proposal only (nothing under `app/` is touched). One track (448), sentence cap 25 words, symbols before use. Format: `P-L13-story.md`; skill `skills/03-chapter-plan`.
Siblings: `P-L16-story.md`, `P-L17-story.md` (whose §9.2 defines the one stage addition S1 used here); the L14–L15 plan owns stationary states. Numbers: `planL16L18-numpy.py` (scratchpad; Crank–Nicolson packets, 4 × 4 matching solves, quadrature; 170 values, every assert passes, two runs byte-identical).

**Sources read.** Notes `sources/L18/text.md` pp. 1–11 (page image checked: p. 10; text layer exact). L17 (recap), L16 p. 11 (spreading). Townsend 2e via `digest-G4.md`: §6.10 pp. 224–234 (Eqs. 6.111–6.149, Figs. 6.12–6.17, Ex. 6.7), Problems 6.23–6.25. Susskind: no reading (the notes say none). Built: `L13.story.ts` `l13-flow:b3`–`b6`, `L13.ts` Correction. **Page images of Townsend:** pp. 232–234 and the problems pp. 243–244 are OCR-only in the digest (ruling T6): the builder re-reads them on the page image before citing Ex. 6.7, Eqs. 6.147–6.149 and Problems 6.24–6.25; p. 231 (PDF 247) was verified.
Homework types: HW7 P1 (Gaussian Δp = ħ/2σ, what happens as σ grows). **Conventions.** As P-L13/P-L17: ħ = m = 1; amplitudes r and 𝗍 (the notes' t, P-L17 Q3); the notes' κ is Townsend's q (Rosetta in `l18-below:b5`); claim keys `l18…`, moved beats keep `l13…` keys.

## Ownership (decisions proposed; the judge rules)
| item (today in L13) | proposal | why |
|---|---|---|
| `l13-flow:b3` (E < V₀: R = 1, C ≠ 0, T = 0; keys `l13TStepRbelow`, `l13TStepTbelow`) | **move to L18** as the books beat `l18-below:b5` | notes §18.5–18.6 |
| `l13-flow:b4` (barrier, sinh form, thick form, Ex. 6.7, p. 231 electron; keys `l13TBookQa`, `l13TBookAT`, `l13TBookBohrT`, `l13TEV0T`) and **the Correction at p. 231** (`L13.ts` `corrections`, `source: 'book'`, check on `l13TBookAT`, `l13TBookBohrT`) | **move to L18** as `l18-tunnel:b5`; the Correction object and its test move with it. | notes §18.7 and App. A teach the barrier |
| `l13-flow:b5` clue (decay length; `l13TDecayFactor`) and `b6` deeper (stack of barriers; `l13TThickRatio`) | **move to L18** as `l18-tunnel:b7` and `b8` | |
| `l13-pr-tunnel` (5 eV, 8 eV, 0.30 nm; `l13PrTunnelPct`, `l13TBookBohrT` also in the unit claims) | **move to L18**, id kept | |
| `l13-flow:b1`, `b2`, `l13-pr-step` | to L17 | |
| `l13-stationary` | the L14–L15 plan | |
Shell edits in L13 and key moves: see P-L17's table (one deletion of `l13-flow`, one pointer sentence, outcome 9 removed; the pitfall "no function inside a step the particle cannot cross" goes with L18). The Correction text stays: "Our calculation finds 0.706 … the page prints 0.68", with `qa` = 0.607 and the Bohr radius 0.529177 Å giving 0.707. **L18 is built with SVG kinds only** (add to e2e `SVG_ONLY`) and after L17 merges (S1).
**Inside:** L17 owns the algebra R = |r|², T = (k₂/k₁)|𝗍|², R + T = 1 and the continuity equation. L18 owns the packet picture of those fractions (areas of two outgoing packets), the derivation of j ≈ vρ, the E < V₀ step, and the barrier.

## 0. Lecture map
| # | id | Title (≤ 8 words) | Question | Notes | Books |
|---|---|---|---|---|---|
| 1 | `l18-packet` | A packet splits at the step | What do R and T mean for an actual packet? | pp.2–4 (§18.1–18.2) | Townsend §6.10 p.225, Fig. 6.12 |
| 2 | `l18-detector` | Probability current from a moving Gaussian | How much probability crosses a detector per second? | pp.4–7 (§18.3–18.4a), p.11 (App. B) | Townsend (6.122)–(6.126) |
| 3 | `l18-below` | Below the step: a tail is not transmission | What happens when E < V₀? | pp.7–8 (§18.5–18.6) | Townsend §6.10 pp.229–230 (6.137–6.140) |
| 4 | `l18-tunnel` | A finite barrier lets it through | Why can a wave get through a barrier it cannot climb? | p.9 (§18.7), pp.10–11 (App. A, B) | Townsend §6.10 pp.230–234 (6.141–6.149), Ex. 6.7 |
**Class markers.** Optional opener lede "Class 18: quantum reflection and tunnelling." App. A (exact barrier) is lecture phase marked optional in the app, as the notes call it; App. B's checks are folded into units 2 and 4. The notes' record at the end of L17 (p. 12) asks to note the actual stopping point after delivery: BUILD-LOG, not the app.
**Counts.** 4 units, **29 beats** (6 + 9 + 6 + 8), 4 clues, 5 books beats, 4 moved beats in all (2 books, 1 clue, 1 Go-deeper), 2 link-backs, 4 derivations, 2 Go-deeper beats (1 moved); 14 challenges + 4 practice questions (1 moved). Outcomes: (1) say what R and T are for a real packet and why they are areas; (2) derive j ≈ vρ and read R and T from currents; (3) solve the E < V₀ step and say why a tail is not transmission; (4) set up and read the barrier's T, and know the thick-barrier form and where it fails.

## 1. Story beats (W = `wavefunction` with the L17 `potential` field POT; CP = `complex-plane`; PLOT = `plot`)
### Unit 1 `l18-packet` — A packet splits at the step
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | pp.2–3 | **Link back to L17** (`l17-step`): value and slope matched at x = 0 gave r = (k₁ − k₂)/(k₁ + k₂) and 𝗍 = 2k₁/(k₁ + k₂); we have the amplitudes, not yet fractions. **Do not mix two identities**: 1 + r = 𝗍 comes from A + B = C at x = 0 (amplitudes); R + T = 1 is probability conservation (fractions). For E = 4V₀/3: 1 + 1/3 = 4/3, and 1/9 + 8/9 = 1. | `CP chain` (arrows 1 and r, sum 𝗍) | `l18AmpIdentity` 1 + r − 𝗍 = 0 · `l18FracIdentity` R + T − 1 = 0 |
| b2 | L | p.3 | A plane wave has the same density everywhere, so nothing is there to watch pass. Use the normalised packet of L15–L16 instead: a finite superposition near k₁ > 0 runs at the step and, afterwards, two localised packets leave: one back, one forward. | `W(PK(-10,2,3),{potential:{step:{V0:3.375}},time:sweep(0,10),window:{x:[-16,16]}})` (E = 4V₀/3) | — |
| b3 | L | p.4 | Define the chances before any current: R = ∫_{−∞}^{0}|ψ|²dx and T = ∫_{0}^{∞}|ψ|²dx long after the collision; the state is normalised and nothing is absorbed, so R + T = 1. Areas, not peak heights, are the probabilities. | same, `time:10`, `readouts:['reflected','transmitted']` | `l18StepAreaL` 0.1864 · `l18StepAreaR` 0.8136 (t = 10) · `l18StepNorm` 1 |
| b4 | L | p.4 | The full time-dependent problem would follow every momentum through the step. Instead solve one plane wave at a time: for a narrow energy spread r(k), 𝗍(k) hardly change across the packet, so the outgoing packets are about r and 𝗍 times the incoming envelope; the different speeds fix the probability ratios. A broad packet needs the energy-weighted average of R(E): here ⟨R⟩ = 0.1875 against 0.1864 measured; for σ = 3, 6, 12 the average is 0.1382, 0.1156, 0.1122, approaching the plane-wave R = 1/9. | `PLOT stepR` markers at E/V₀ = 4/3 | `l18StepWeightedR` 0.1875 (two routes: the momentum-space average of R(p²/2) and the time-dependent run, agree within 2e−3) · `l18WeightedR3` 0.1382 · `l18WeightedR6` 0.1156 · `l18WeightedR12` 0.1122 · `l18StepR43` 0.1111 |
| b5 | B | — | Townsend §6.10 p.225, Fig. 6.12 and fn. 20: a packet launched at a well or step splits into a reflected and a transmitted part; a packet sharply peaked in energy and broad against the interaction region may be treated as a plane wave. | `W(PK(-10,2,3),{potential:{step:{V0:3.375}},time:sweep(0,10)})` | — |
| b6 | C | pp.3–4 | Q: which gives the chance of reflection, the peak height of the reflected packet or its area? → R: its area: the two packets have different widths, so peak heights mislead. | `W(…,time:10,readouts:['reflected'])` → reveal `readouts:['transmitted']` | `l18StepAreaL` 0.1864 · `l18StepAreaR` 0.8136 (shared; whole-grid chances, because by t = 10 the reflected packet has partly left the drawn window) |

### Unit 2 `l18-detector` — Probability current from a moving Gaussian
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.4 | Ask something we can picture: a detector at x_d, a localised packet of mean speed v₀ = p₀/m going past. How much probability crosses per unit time? For a packet that barely spreads, ρ ≈ (√2π σ)^{−1}exp[−(x − x₀ − v₀t)²/2σ²]. Nothing new: the Gaussian of L15 and L16 with its centre moving. | `W(PK(-12,4,2),{time:sweep(0,12),interval:[7.9,8.1],readouts:['interval']})` | — |
| b2 | L | p.5 | In a short time dt the packet moves dx = v₀dt, so the probability in the slice that passes the detector is dP ≈ ρ(x_d, t)v₀dt: **j(x_d, t) = dP/dt ≈ v₀ρ(x_d, t)** (**D1**; gloss `probability-flux`: probability per time, signed). It is not another density. Units: probability/length × length/time. | same | `l18DetPeakRigid` 0.1995 (peak of v₀ρ at x_d = 8, σ = 4, p₀ = 2) |
| b3 | L | p.5 | Payoff (optional in the notes): over the whole passage ∫j dt = ∫v₀ρ dt = 1, because the whole packet goes by once. A chain-rule check, ∂ρ/∂t = −v₀∂ρ/∂x and ∂j/∂x = v₀∂ρ/∂x, gives ∂ρ/∂t + ∂j/∂x = 0 without redoing L17's derivation. Rigid translation holds only until spreading matters. | `W(PK(-12,4,2),{time:sweep(0,12),interval:[7.9,8.1]})` | `l18DetTotal` 1.000 (exact packet, quadrature in time, to 3e−7) |
| b4 | L | p.6 | Back to the experiment: far from the step each outgoing packet is again travelling waves, reflected at speed v₁ = ħk₁/m and transmitted at v₂ = ħk₂/m. Use j = ρv per component: j_in = +v₁|A|², j_ref = −v₁|B|², j_tr = +v₂|C|²; the sign of j_ref says leftward. These are one-way components, not the interfering total wave. | `W(PK(-10,2,3),{potential:{step:{V0:3.375}},time:sweep(0,10)})` | — |
| b5 | L | p.6 | **Link back to L17** (`l17-current`, defined there): R = |j_ref|/j_in = |r|², T = j_tr/j_in = (v₂/v₁)|𝗍|² = (k₂/k₁)|𝗍|². There is no speed factor in R (same speed magnitude); the transmitted packet is slower and compressed in the narrow-band limit: the factor is what separates a ratio of densities from a probability integrated over a region ratio. R + T = 1 is the packet's two areas adding up. | `PLOT stepT vs stepDensityRatio` | `l18CurrentFactorR` 1 · `l18CurrentFactorT` 0.5 (k₂/k₁ at E = 4V₀/3) |
| b6 | L | p.7 | Numbers: E = 4V₀/3, k₂/k₁ = v₂/v₁ = ½, r = 1/3, 𝗍 = 4/3, R = 1/9, T = ½(4/3)² = 8/9. The transmitted density is 16/9 of the incident but moves at half the speed: its share of the flow is 8/9, not 16/9. | `PLOT stepT vs stepDensityRatio` markers at 4/3 | `l18StepT43` 0.8889 · `l18DensityRatio` 1.778 |
| b7 | B | — | Townsend (6.122)–(6.126) pp.227–228: j in the region of the incident and reflected waves is (ħk/m)(|A|² − |B|²), and R, T are ratios of the currents; the same step, the same numbers as Unit 17.3. | `PLOT stepT vs stepR` | — |
| b8 | C | p.6 | Q: the reflected packet moves as fast as the incident one. So why does T carry a speed factor and R none? → R: R compares two flows at equal speed, so speeds cancel; the transmitted wave is slower, so for the same density it carries less flow. | `PLOT stepT vs stepDensityRatio` → reveal | `l18CurrentFactorR`, `l18CurrentFactorT` (shared) |
| b9 | D | p.11 (App. B) | Beyond the core: the exact current of a free Gaussian that spreads: j = ρ(x, t)[v₀ + (σ̇/σ)(x − x_c)], σ(t) = σ₀√(1 + (ħt/2mσ₀²)²). The first term translates the packet, the second is outward flow from its centre. For σ = 4, p₀ = 2 the detector's peak current is 0.1905, 0.955 of the rigid 0.1995. (L16 gives σ(t).) | `W(PK(-12,4,2),{time:sweep(0,12),interval:[7.9,8.1]})` | `l18ExactCurrentGap` 9e−11 (closed form against ħ/m Im ψ*ψ′, a check, not shown) · `l18DetPeakExact` 0.1905 · `l18DetPeakRatio` 0.955 |

### Unit 3 `l18-below` — Below the step: a tail is not transmission
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.7 | Lower E below V₀. A classical particle turns round; the SE still decides what the wave does on the right. There φ″ = κ²φ with κ = √(2m(V₀ − E))/ħ: real exponentials, not travelling waves (gloss `evanescent-wave`). On the left k = √(2mE)/ħ. For E = V₀/2: k = κ. | `W(PK(-10,2.5,2),{potential:{step:{V0:4}},time:sweep(0,10)})` (E = 2, V₀ = 4) | `l18K` 2 · `l18Kappa` 2 |
| b2 | L | p.8 | Choose φ_L = Ae^{ikx} + Be^{−ikx} and φ_R = Ce^{−κx} (the growing exponential cannot stay bounded). Matching: A + B = C and ik(A − B) = −κC, so r = (k − iκ)/(k + iκ) (**D2**). Numerator and denominator have the same size: R = |r|² = 1. Every particle is reflected, yet φ_R ≠ 0. For k = κ: r = −i, a phase of −90°, and the density at the edge |1 + r|² = 2. | `W(PK(-10,2.5,2),{potential:{step:{V0:4}},time:sweep(0,10)})` → `CP chain` (1 and r = −i, sum 1 − i) | `l18AbsR` 1 · `l18PhaseDeg` −90 · `l18EdgeDensity` 2 (two routes: closed form and the 2 × 2 solve) |
| b3 | L | p.8 | Penetration is not transmission. On the right ρ_R = |C|²e^{−2κx} ≠ 0: the amplitude falls over 1/κ, the density over 1/(2κ). A packet can have a temporary tail inside, but no packet leaves toward +∞: with R = 1 the final transmission is zero. **Nonzero density in x > 0 does not mean nonzero outgoing flow.** In the run: at most 7.9 % of the packet is in x > 0 (at t = 5), and 0.05 % at the end. | `W(…,readouts:['transmitted'])` | `l18MaxPenetration` 0.0794 (t = 5) · `l18LateRight` 4.7e−4 · `l18DecayLenDensity` 0.25 (= 1/2κ, κ = 2) |
| b4 | L | p.8 | The check (optional in the notes): j = (ħ/m)Im(φ*φ′) with φ = Ce^{−κx} gives φ*φ′ = −κ|C|²e^{−2κx}, real, so j = 0. One real exponential carries no current. | `PLOT stepT vs stepR` (T = 0 below 1) | `l18EvanescentCurrent` 0 (engine, at x = 0 and x = 1) |
| b5 | B | — | Townsend §6.10 pp.229–230 (6.137)–(6.140): the same solution by the substitution ik₀ → −q (**Rosetta:** his q is our κ); R = 1, C = 2kA/(k + iq) ≠ 0; the substitution is fine for R but not for T, which comes from the current. [Moved from `l13-flow:b3`.] | `W(TW(3,-3),{show:['density']})` | moved `l13TStepRbelow` 1 · `l13TStepTbelow` 0 |
| b6 | C | pp.7–8 | Q: for E = V₀/2 (κ = 2), how far into the step does the density fall to 1 % of its edge value? → R: x = ln 100/2κ = 1.15 ℓ. | `W(PK(-10,2.5,2),{potential:{step:{V0:4}},time:5})` → reveal | `l18X1pct` 1.151 |

### Unit 4 `l18-tunnel` — A finite barrier lets it through
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.9 | What if the potential falls back to 0 after a width a? An infinite step holds a tail with T = 0, but far enough on, travelling waves are allowed again. Three regions: φ_I = Ae^{ikx} + Be^{−ikx}; φ_II = Ce^{κx} + De^{−κx} (both exponentials now); φ_III = Fe^{ik(x−a)}. Match φ and φ′ at 0 and at a. A wave leaves although E < V₀: **tunnelling** (gloss `tunnelling` exists). | `W(PK(-10,2.5,2),{potential:{barrier:{V0:4,a:0.5}},time:sweep(0,10),readouts:['reflected','transmitted']})` | `l18StageBarrierAreaR` 0.4193 (right of the barrier at t = 10) · `l18StageBarrierWeightedT` 0.4198 · `l18BarrierTE0` T(E₀) = 0.4200 |
| b2 | L | p.10 | App. A, the short route: propagate value and slope backward from x = a where φ(a) = F, φ′(a) = ikF. Inside φ = F cosh κ(x − a) + (ikF/κ) sinh κ(x − a); at 0: φ(0) = F(cosh κa − i(k/κ) sinh κa). From 2A = φ(0) + φ′(0)/ik: A/F = cosh κa + (i/2)(κ/k − k/κ) sinh κa, T = |F/A|² (same speed both sides) (**D3**), so T = [1 + V₀² sinh²(κa)/4E(V₀ − E)]^{−1}. | `PLOT barrierT` → `W(…barrier…)` | `l18AppendixAT` 0.41997 (A/F route) = `l18BarrierT1` (the 4 × 4 matching solve and `barrierT`, three routes) |
| b3 | L | p.10 | Limits. At E = V₀/2 the prefactor V₀²/4E(V₀ − E) is 1, so T = 1/cosh²κa: κa = ½, 1, 2, 3 gives 0.786, 0.420, 0.0707, 0.00987. For κa ≫ 1, sinh ≈ e^{κa}/2: T ≈ [16E(V₀ − E)/V₀²]e^{−2κa} (4e^{−2κa} here: 0.00992 at κa = 3, 0.5 % high). As a → 0, T → 1; the thick form would give 4, so never use it there. | `PLOT barrierT vs barrierThick` | `l18BarrierT05` 0.7864 · `l18BarrierT2` 0.0707 · `l18BarrierT3` 0.009866 · `l18BarrierThick3` 0.009915 · `l18ThickAtZero` 4 |
| b4 | L | p.11 (App. B) | The current survives inside: with φ = Ce^{κx} + De^{−κx}, φ*φ′ = κ|C|²e^{2κx} − κ|D|²e^{−2κx} + κ(D*C − C*D); the first two terms are real, the cross term is not: j = (2ħκ/m)Im(D*C). Two exponentials with zero current each can carry current together, and it equals T times the incident one (0.840 each for k = 2, κa = 1). | `W(…barrier…,time:sweep(0,10))` | `l18BarrierInnerCurrent` 0.8399 = `l18BarrierOuterCurrent` 0.8399 (Im(D*C) from the matching solve against T·k|A|²) |
| b5 | B | — | Townsend §6.10 pp.230–233 (6.141)–(6.146), Fig. 6.15: four matching conditions, the same T; Ex. 6.7 (Fig. 6.16): at E = V₀ the inside is a straight line and T = 1/(1 + k²a²/4), 0.5 for ka = 2. His p. 231 electron (E = 5 eV, V₀ = 10 eV, a = 0.53 Å, the Bohr radius): κa = 0.607; **our calculation finds T = 0.706** (0.707 with 0.529177 Å) where the page prints 0.68 (**Correction**, `source: 'book'`: the 4 × 4 solve and Eq. 6.144 agree; 0.68 would need a = 0.56 Å; the thick form gives 1.19, outside its range). [Moved from `l13-flow:b4` with its Correction.] | `PLOT barrierT` marker at κa = 0.607 | moved `l13TBookQa` 0.607 · `l13TBookAT` 0.706 · `l13TBookBohrT` 0.707 · `l13TEV0T` 0.5 · `l18BookWidthFor068` 0.560 (Å) |
| b6 | B | — | Townsend §6.10 pp.233–234 (6.147)–(6.149), Fig. 6.17 (page image to be re-read, T6): a smooth barrier is a stack of thin square ones; T ≈ exp(−2∫√(2m(V − E))dx/ħ) over the stretch where the root is real. Bridge: <<sl-q27-josephson\|Go further in 709: Cooper pairs tunnelling through an insulating barrier>>; and by name the ammonia splitting of Unit 12.x, which is a tunnelling rate. | `PLOT barrierT vs barrierThick` | — |
| b7 | C | — | Q: widen a thick barrier by one decay length 1/κ: by what factor does T fall? → R: e^{−2} = 0.135. [Moved from `l13-flow:b5`.] | `PLOT barrierT vs barrierThick` → reveal | moved `l13TDecayFactor` 0.1353 |
| b8 | D | — | Beyond the notes (moved from `l13-flow:b6`): for 5 eV against a square barrier 10 eV high and 300 pm wide, the exact T is 0.998 of the thick form. | `PLOT barrierT vs barrierThick` | moved `l13TThickRatio` 0.998 |

## 2. Derivations (one track; ≥ 2 distinct views; kinds on each unit's stage)
- **D1 `l18-detector:b2`** result `j(x_d,t)\simeq v_0\,\rho(x_d,t)`: (1) the packet at two times, a detector at `x_d`, view W; (2) in `dt` it moves `dx = v_0\,dt`; (3) the probability in that slice is `dP = \rho(x_d,t)\,dx`, view W interval strip; (4) `j = dP/dt = v_0\rho` — "length per time times probability per length".
- **D2 `l18-below:b2`** result `r = \tfrac{k-i\kappa}{k+i\kappa}`: (1) the waves, view W; (2) `A+B = C`; (3) `ik(A-B) = -\kappa C`, view CP; (4) with `r = B/A`: `ik(1-r) = -\kappa(1+r)`; (5) solve for `r`; `|r| = 1`.
- **D3 `l18-tunnel:b2`** result `T = \Big[1+\tfrac{V_0^2}{4E(V_0-E)}\sinh^2\kappa a\Big]^{-1}`: (1) `\varphi(a) = F,\ \varphi'(a) = ikF`, view PLOT; (2) `\varphi(x) = F\cosh\kappa(x-a)+\tfrac{ikF}{\kappa}\sinh\kappa(x-a)`; (3) `\varphi(0),\varphi'(0)`, view W barrier; (4) `2A = \varphi(0)+\varphi'(0)/ik` gives `A/F = \cosh\kappa a+\tfrac i2(\tfrac\kappa k-\tfrac k\kappa)\sinh\kappa a`; (5) `T = |F/A|^2`, `T^{-1} = 1+\tfrac14(\tfrac\kappa k+\tfrac k\kappa)^2\sinh^2\kappa a`; (6) `k^2 = 2mE/\hbar^2`, `\kappa^2 = 2m(V_0-E)/\hbar^2`: result.
- **D4 `l18-tunnel:b4`** (short) result `j = \tfrac{2\hbar\kappa}{m}\mathrm{Im}(D^*C)`: (1) `\varphi^*\varphi'` for `Ce^{\kappa x}+De^{-\kappa x}`; (2) real terms drop; (3) the cross term `\kappa(D^*C-C^*D) = 2i\kappa\,\mathrm{Im}(D^*C)`, views W and PLOT.
The L17 derivation D6 of R + T = 1 is not repeated here (ownership).

## 3. Try-it per unit (existing widgets; `wave-lab` deferred, R7)
| unit | widget spec | try this |
|---|---|---|
| packet | `{kind:'complex-plane', props:{mode:'add', z:[1,0], w:[0.3333,0]}}` | 1. 1 + r = 𝗍 is an arrow sum; R + T = 1 is not. |
| detector | `{kind:'amplitude-bars', props:{state:'+z', basis:'x'}}` | 1. The shares add to 1 however the amplitudes look; flow, not amplitude, is shared. |
| below | `{kind:'complex-plane', props:{mode:'multiply', z:[1,0], w:[0,-1]}}` | 1. r = −i has length 1 and angle −90°: all reflected, with a phase. |
| tunnel | `{kind:'amplitude-bars', props:{state:'+z', basis:'z'}}` | 1. Tilt the state: the weaker share is small but never zero, as T never is. |

## 4. Challenges (keys from the engine; hints nudge → key idea → setup; no homework is open)
- **packet**: `l18-pk-id` warm-up choice: "1 + r = 𝗍 and R + T = 1 are the same equation" → false ✓ · `l18-pk-area` core choice: "the chance of reflection is the peak height of the reflected packet" → false ✓ · `l18-pk-R` core numeric R for k₁ = 3k₂ → 0.25.
- **detector**: `l18-de-j` warm-up numeric j for ρ = 0.2 and v₀ = 2 → 0.4 · `l18-de-T` core numeric T for k₂/k₁ = ½ and |𝗍|² = 16/9 → 0.889 · `l18-de-order` core order D1 · `l18-de-sign` core choice: "j_ref is negative because the reflected fraction is negative" → false ✓.
- **below**: `l18-be-r` warm-up numeric |r|² for E < V₀ → 1 · `l18-be-edge` core numeric |1 + r|² for k = κ → 2 · `l18-be-len` core numeric the density decay length for κ = 2 → 0.25.
- **tunnel**: `l18-tu-sech` warm-up numeric T for E = V₀/2, κa = 1 → 0.420 · `l18-tu-thick` core numeric the thick-barrier T for E = V₀/2, κa = 3 → 0.00992 · `l18-tu-a0` core choice: "the thick-barrier form tends to 1 as a → 0" → false ✓ (it tends to 4) · `l18-tu-order` core order D3.
**Practice (T1; walkthroughs in full):**
- `l13-pr-tunnel` (moved, id kept) stretch, `practice: 'townsend'` (Problem 6.23, p. 243): 5 eV electron, 8 eV barrier, 0.30 nm → 1.812 % (`l13PrTunnelPct`, tolerance 0.02).
- `l18-pr-resonance` core, `practice: 'townsend'` (Problem 6.24 type, p. 243; page image re-read first, T6): a particle with E = 2V₀ over a barrier of V₀: T = 1/(1 + sin²(k′a)/8); the smallest T over all widths → 0.889 (`l18PrAboveTmin`, the engine's `barrierT` scanned; T = 1 at k′a = π, a = 2.221 for V₀ = 1).
- `l18-pr-field` stretch, `practice: 'townsend'` (Problem 6.25 type, p. 244, re-read first): a triangular barrier (work function 4.5 eV, field 5 V/nm): the exponent 2∫√(2m(W − eFx))dx/ħ → 13.04 (`l18PrFieldExponent`; two routes: quadrature and the closed form 4W^{3/2}/(3ħeF) × √2m); T ≈ 2.2 × 10⁻⁶ (tolerance 0.05 on the exponent).
- `l18-pr-energy` warm-up, `practice: 'homework'` (HW7 P1 type: Δp = ħ/2σ): a packet with σ = 6 and p₀ = 3: estimate the energy spread ΔE ≈ p₀Δp/m → 0.25 (`l18PrEnergySpread`); say whether R(E) over that spread differs much from R(p₀²/2m) (it does by 4 %: 0.1156 against 0.1111).

## 5. Glossary (new 448 ids; no duplicates; `tunnelling`, `probability-current`, `transmission-coefficient` reused and re-pointed by P-L17)
| id | term | gloss (≤ 25 words) | first |
|---|---|---|---|
| `probability-flux` | probability flux j | The probability crossing a point per unit time, positive to the right; for a travelling wave j = vρ. | l18-detector:b2 |
| `evanescent-wave` | evanescent wave | A wave that decays as e^{−κx} where E < V; it has density but carries no current. | l18-below:b1 |
| `penetration-depth` | decay length 1/2κ | The distance over which the density of an evanescent wave falls by a factor e; 1/κ for its amplitude. | l18-below:b3 |
Reused: `potential-step`, `reflection-amplitude`, `continuity-equation` (L17), `wave-packet`, `energy-eigenfunction`.

## 6. Review cards
- **packet**: R and T are the two outgoing areas; a narrow energy range makes them r, 𝗍 times the envelope; broad packets average R(E) · eq `R+T=1` · trap: confusing 1 + r = 𝗍 with R + T = 1.
- **detector**: j ≈ vρ; R = |r|², T = (k₂/k₁)|𝗍|² · eq `j = v\rho` · trap: giving R a speed factor.
- **below**: φ_R = Ce^{−κx}; |r| = 1; density decays over 1/2κ; no flow · eq `r = \tfrac{k-i\kappa}{k+i\kappa}` · trap: "tail means transmission".
- **tunnel**: T = [1 + V₀² sinh²κa/4E(V₀ − E)]^{−1} ≈ e^{−2κa} for thick barriers · eq `T\simeq\tfrac{16E(V_0-E)}{V_0^2}e^{-2\kappa a}` · trap: using the thick form for a thin barrier.

## 7. Symbol-before-use (first beat)
r, 𝗍, k₁, k₂, A, B, C, R, T: L17 (mapped to `l18-packet:b1`) · ρ, v₀, x_d, dP, j: `l18-detector:b1–b2` · v₁, v₂: b4 · κ, k, φ_L, φ_R: `l18-below:b1–b2` · a, φ_I, φ_II, φ_III, D, F, V₀: `l18-tunnel:b1` · cosh, sinh: b2 · σ̇: `l18-detector:b9`.

## 8. Errata (page image p. 10 checked; every formula recomputed)
Recomputed and holding: App. A (A/F, T⁻¹, T(E), the thick form), the infinite-step r, the current inside the barrier, j = vρ and the exact current of a spreading Gaussian (gap 9e−11), the packet areas against the energy-weighted average, Townsend (6.139)–(6.146), Ex. 6.7, the p. 231 electron.
1. **Class slip (p. 3).** "I said r + t = 1": L17's printed pages say t = 1 + r (checked p. 6 text); nothing to correct in print. The app teaches the two identities apart (`l18-packet:b1`, a pitfall).
2. **Text layer, App. A (p. 10).** "T − 1" is T⁻¹ with a lost superscript: the page image prints T^{−1}. No erratum.
3. **Rigid translation (p. 5).** ∫j dt = 1 is for a packet that does not spread; the exact free Gaussian also gives 1 (to 3e−7) with peak ratio 0.955: `l18-detector:b9` says both.
4. **Correction (Townsend p. 231).** The printed 0.68 against our 0.706 (two numpy routes, the 4 × 4 linear system and Eq. 6.144; the engine's `barrierT`): moved with its beat from L13 (ruling T5); the independent review re-verifies it on PDF p. 247.
5. **Notation.** κ against Townsend's q; k₂ against his k₀; the notes' t against time (𝗍).

## 9. Engine, stage and widget gaps
**9.1 Engine** (tests + twin `pipeline/claims_448/l18.py` → `claims-448/l18.json`): `scatter.ts`: `stepEvanescent(E, V0)` {k, kappa, r (complex), edgeDensity} (twin: the 2 × 2 solve); `barrierAmplitudes(E, V0, a, m, hbar)` {B, F, G, C} (twin: the 4 × 4 linear system); `barrierInnerCurrent(…)` = 2κ Im(D*C); `weightedAverage(mw, g, fn)`: ∫|φ(p)|²fn(p²/2)dp over a `toMomentum` density (twin: scipy quad of the Gaussian); `wkbExponent(E, Vfun, x1, x2, m, hbar)` (Gauss–Legendre; twin: scipy quad); `gaussianCurrentClosed(σ, p₀, x₀, x, t)` = ρ(v₀ + σ̇(x − x_c)/σ) (twin: the numpy derivative of the closed-form ψ). Reused from L16/L17: `gaussianExact`, `probabilityCurrent`, `evolveV`, `barrierT`, `barrierThick`, `stepRT`, `decayConstant`. `constants.ts`: `HBAR2_OVER_2M_EV_A2` (3.80998 eV Å² for the electron, CODATA). Tolerances 1e−9 for closed forms, 2e−3 for time-dependent runs against the Crank–Nicolson twin (dx = 0.02, dt = 0.004, 4 s of CPU per run).
**9.2 Stage contract.** No new addition beyond S1 of P-L17 §9.2 (`wavefunction.potential` with `step`, `barrier`; readouts `reflected`, `transmitted`; scenarios kept inside the 64-long grid: σ ≤ 2.5, x₀ = −10, t ≤ 10; the 5σ edge check holds). Existing curves `stepR`, `stepT`, `barrierT`, `barrierThick` and P-L17's additive `stepDensityRatio`; `complex-plane` `chain`; `wavefunction` `twoWaves` and `interval`. If S1 is declined, units 1–4 keep every number (the engine claims are unchanged) and lose the animated packet pictures only (P-L17 §9.2 fallback).
**9.3 Widgets.** None (R7).

## 10. Media / 11. Hooks / 12. Fidelity
**Media.** None (optional film "tunnelling": every sample from `evolveV` with a manifest of the two areas).
**Concept map:** `packet-scattering` (l18-packet; needs `potential-step`, `spreading`) · `probability-flux` (l18-detector; needs `probability-current`) · `evanescent-wave` (l18-below; needs `potential-step`) · `tunnelling` (l18-tunnel; needs `evanescent-wave`, `stationary-states`).
**Arcade:** Spot the error: `l18-packet` ("r + 𝗍 = 1"), `l18-below` ("a tail means the particle gets through"), `l18-tunnel` ("T ≈ e^{−2κa} for a very thin barrier").
**Go further in 709:** l18-tunnel:b6 → Q27 `q27-josephson` (`sl-q27-josephson`, new `bridges448.ts` row; built unit, id checked); Rabi and Lindblad (Q24) have no honest tie to this lecture.
**Fidelity.** `wavefunction` exact samples; its `potential` profile and ψ use different scales; `plot` curves exact functions; a packet is drawn partly outside the 32-long window at late times (readouts count the whole grid).

## Builder estimate and questions for the judge
**Builder (one agent, worktree, ≤ 170 steps):** ~150: 4 units / 29 beats incl. 4 moved / 4 derivations (~60), engine and twin (~30), the Correction and its test, moves and deletions in L13 (shared with L17's pass: do them once, in whichever builder merges first; ~20), 13 challenges + 4 practice (~25), bridges and e2e (~10). Builds after L17 (S1).
1. The Correction moves with the barrier beat to L18 (recommended), or stays in L13 until the unit is deleted? The L13 Correction test must move at the same time.
2. Quantify the notes' "narrow-energy" remark with the energy-weighted average (b4, an engine claim beyond the notes; recommended), or state it in words?
3. Problems 6.24 and 6.25 as practice only (recommended; no beats), and the engine function `wkbExponent` for 6.25: approve?
4. Keep the `l18-detector` unit's rigid-versus-exact current comparison (b9) as Go-deeper (recommended)?
5. The L17 numbering of D6 (R + T = 1) is the one derivation; L18's packet picture adds none (Ownership): confirm.
