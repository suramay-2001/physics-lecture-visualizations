# P-L19 — Lecture 19 story plan: tunnelling through a finite barrier

Role P, proposal only (nothing under `app/` is touched). One track (448), sentence cap 25 words, symbols before use. Format: `P-L18-story.md`; skill `skills/03-chapter-plan`.
Siblings: `P-L18-story.md` (owns the barrier result, see Ownership), `P-L20-story.md` (bound states; takes the infinite well over from L14). Numbers: `planL19L20-numpy.py` (scratchpad; 4 × 4 linear solves, closed forms, scipy quad/brentq, a Crank–Nicolson packet run; 184 values for both lectures, every assert passes, two runs byte-identical).

**Sources read.** Notes `sources/L19/text.md` pp. 1–9 (page image checked: p. 6, the boxed T; the text layer is exact; every algebra step on pp. 4–7 re-derived, below). Townsend 2e via `digest-G4.md`: §6.10 pp. 230–234 (Eqs. 6.141–6.149, Ex. 6.7, the p. 231 macroscopic estimate), Problem 6.21 (end of Ch. 6, pp. 237–244). Susskind: none (the notes say none). Built: `L18.ts`/`L18.story.ts` unit `l18-tunnel` (four matching conditions, App. A route, thick form, inner current, Correction, three practice questions) and `l18-below`. **Page images of Townsend:** the problem pages (pp. 237–244, Problem 6.21) are OCR-only in the digest (ruling T6): the builder re-reads it before citing.
**Conventions.** ħ = m = 1 in the engine; amplitudes r and τ (the notes' t, ruling M4; Rosetta in `l19-regions:b2`); Townsend's q is our κ, his F, G, C are our A, B, τ (Rosetta in `l19-match:b6`). Claim keys `l19…`; numbers L18 already owns are cited by the L18 key (imported `V`), never re-keyed.

## Ownership (decisions proposed; the judge rules)
| item | proposal | why |
|---|---|---|
| barrier T, the App. A route (`l18-tunnel:b2`, D3), thick form, inner current, p. 231 Correction, `l18-pr-tunnel`/`resonance`/`field` | **stay in L18** | M2 gives a topic to the notes that teach it; the L18 notes teach the barrier as their last section and appendix, L19's notes teach it as the whole lecture. Moving the unit would gut a reviewed L18 (new ids, Correction twin, three practice questions, Optics Lab row `qc-l18-tunnel`) for no gain. |
| the stationary state as a whole: r, A, B, τ, the fringes, the density inside, the direct-elimination route, energy bookkeeping, applications | **L19 owns** | L18 derives only |F/A|² by marching back from x = a. L19 solves the same four equations by elimination and gets all four amplitudes. Nothing is derived twice: `l19-match:b1` is a link-back, and `l19L18Route` checks the two routes agree. |
| the thick-barrier form and its numbers (κa = 3: 0.00987 against 0.00992) | stay in L18; L19 links back and adds only what the notes add (width doubling, height, mass, E → V₀ limit) | |
| Townsend's barrier beats (Eqs. 6.141–6.149, Ex. 6.7, p. 231 electron) | stay in L18; L19's books beats take only the p. 231 macroscopic estimate and Problem 6.21 (the thin–tall limit) | not yet built |
**Nothing moves out of L19's neighbours**; no claim key changes lecture, so no twin, bridge, concept or e2e pin is renamed. **L19 is built with SVG kinds only** (add `'L19'` to e2e `SVG_ONLY`); it needs the stage addition S1 (§9.2) built first.

## 0. Lecture map
| # | id | Title (≤ 8 words) | Question | Notes | Books |
|---|---|---|---|---|---|
| 1 | `l19-recap` | A tail is not transmission | What does a second edge add to the infinite step? | pp.2, 4 (§19.1) | — |
| 2 | `l19-regions` | Three regions, two kinds of solution | Why waves outside and exponentials inside? | pp.3–4 (§19.2) | Townsend §6.10 p.230 (Rosetta) |
| 3 | `l19-match` | Four conditions give the transmitted amplitude | What do all four amplitudes look like? | pp.4–7 (§19.3–19.4 algebra) | Townsend (6.143)–(6.144) |
| 4 | `l19-thick` | Reading T: width, height, mass | How does T change with the barrier and the particle? | pp.6–9 (§19.4) | Townsend p.231 (macroscopic) |
| 5 | `l19-energy` | Tunnelling without borrowing energy | What is conserved, and where is tunnelling used? | p.8 (§19.5) | Townsend Problem 6.21 |
**Class markers.** Opener lede "Class 19: tunnelling through a finite barrier." The notes' 75-minute plan and the "Slow pace" option are lecture matter, not app content; the 10-minute buffer is ignored. The notes' appendix is empty (p. 9 title only).
**Counts.** 5 units, **25 beats** (3 + 3 + 7 + 7 + 5), 5 clues, 3 books beats, 2 link-backs, 1 Go-deeper, 2 derivations, 16 challenges + 3 practice questions, 4 glossary entries. Outcomes: (1) say why a finite barrier transmits while an infinite step does not; (2) write the three regional solutions and the four matching conditions; (3) solve them for τ and read T = |τ|²; (4) read the thick-barrier form and predict how T changes with width, height and mass; (5) say why tunnelling conserves energy and give two uses.

## 1. Story beats (S = the new `wavefunction` source `barrierWave:{E,V0,a}` of §9.2; W = `wavefunction` with a packet and L17's `potential`; CP = `complex-plane`; PLOT = `plot`)
Scenario S: E = 2, V₀ = 4, so k = κ = 2; a = ½ (κa = 1) unless stated.
### Unit 1 `l19-recap` — A tail is not transmission
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.2 | **Link back to L18** (`l18-packet`, `l18-below`). A packet ends as two packets; R and T are their areas, R + T = 1. We compute them with plane waves, not because a plane wave is a particle. With equal potential on both sides k_out = k_in and T = |τ|²; with unequal sides L18 gave the speed factor. Nothing new is defined. | `W(PK(-10,2.5,2),{potential:{step:{V0:4}},time:sweep(0,10),readouts:['transmitted']})` | L18's `l18MaxPenetration` 0.0794 (shared) |
| b2 | L | p.2 | The infinite step has a tail but no outgoing wave. A barrier of finite width has another edge: the tail can reach it and turn into a travelling wave. Same packet, barrier of width ½: about 42 % of it is found beyond the barrier at t = 10. | `W(PK(-10,2.5,2),{potential:{barrier:{V0:4,a:0.5}},time:sweep(0,10),readouts:['reflected','transmitted']})` | L18's `l18StageBarrierAreaR` 0.4193 (shared) |
| b3 | C | p.9 | Q: why did the infinite step have a tail but no transmission? → R: nothing beyond it can carry the flow away; a decaying exponential alone has zero current. | step packet → reveal barrier packet | L18's `l18EvanescentCurrent` 0 (shared) |

### Unit 2 `l19-regions` — Three regions, two kinds of solution
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.3 | One equation, two signs. Outside, V = 0: φ″ = −k²φ, k = √(2mE)/ħ, so waves e^{±ikx}. Inside, V₀ > E: φ″ = +κ²φ, κ = √(2m(V₀ − E))/ħ, so e^{±κx}. Where the sign of the curvature flips, so does the shape. Scenario S: k = κ = 2. | `S(2,4,1)` (show `re`, `density`, window [−6, 7]) | `l19KS` 2 · `l19KappaS` 2 (engine `decayConstant`, `√2E`) |
| b2 | L | p.3 | Write one solution in three pieces, incident amplitude 1: φ_I = e^{ikx} + r e^{−ikx} (x < 0); φ_II = Ae^{κx} + Be^{−κx} (0 ≤ x ≤ a); φ_III = τe^{ikx} (x > a). Nothing arrives from the right, so III has no e^{−ikx}. **Rosetta:** the notes' t is our τ. | `S(2,4,1)` → `CP chain` (arrows r, A, B left as unknowns: shown as labels only) | — |
| b3 | C | p.4 | Q: the region is only a wide, so why keep both exponentials inside? → R: the region is finite, so the growing one stays bounded; in an infinite region it would blow up and be dropped, as for the infinite step. At the right edge the two pieces have equal size when k = κ: for κa = 2, |B/A| = e^{2κa} = 54.6. | `S(2,4,1)` → reveal | `l19RatioBA2` 54.60 |

### Unit 3 `l19-match` — Four conditions give the transmitted amplitude
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.4 | **Link back to L18** (`l18-tunnel:b1`). At each finite jump φ and φ′ are continuous. Four conditions: at 0: 1 + r = A + B, ik(1 − r) = κ(A − B); at a: Ae^{κa} + Be^{−κa} = τe^{ika}, κ(Ae^{κa} − Be^{−κa}) = ikτe^{ika}. Four unknowns r, A, B, τ: amplitudes, not yet chances. L18 marched back from x = a to find |F/A|²; today we eliminate directly and keep every amplitude. | `S(2,4,0.5)` | `l19MatchResidual` 0 (the four residuals of the engine's solution, to 1e-12) |
| b2 | L | p.4 | **Step 1.** Divide the slope condition at a by κ, add and subtract the two right-edge equations: A = ½τe^{ika}(1 + ik/κ)e^{−κa}, B = ½τe^{ika}(1 − ik/κ)e^{+κa}. The exponentials e^{±κa} come from joining at x = a, not at the origin. For κa = 1: |A| = 0.169, |B| = 1.246, per unit incident amplitude. | `S(2,4,0.5)` → CP view of 1 ± ik/κ | `l19AbsA` 0.1686 · `l19AbsB` 1.2456 |
| b3 | L | pp.5–6 | **Steps 2–3.** Adding the two left-edge equations removes r: 2 = A + B + (κ/ik)(A − B). Insert Step 1 and group e^{κa} and e^{−κa}: τ = 4e^{−ika}/[2(e^{κa} + e^{−κa}) + i(κ/k − k/κ)(e^{κa} − e^{−κa})] (**D1**). For k = κ the bracket is real: τ = e^{−ika}/cosh κa, so |τ| = 0.648 and its phase is −ka = −57.3°. | `S(2,4,0.5)` → `CP` arrow τ | `l19AbsT` 0.6481 · `l19PhaseTdeg` −57.30 · `l19L18Route` 0.4200 (1/|A/F|² of the L18 route equals |τ|²) |
| b4 | L | p.5, 6 | Because both outside regions are V = 0, k and the speed are equal, so T = |τ|² (the speed factor of L18 cancels). T = 0.4200. Reflected: R = |r|² = 0.5800 from the same solve, and R + T = 1 to 1e-12. | `S(2,4,0.5)` readouts `reflection`, `transmission` | `l19T1` 0.4200 (= `l18BarrierT1`, shared) · `l19R1` 0.5800 · `l19RplusT` 1 |
| b5 | L | p.4 | What the whole stationary state looks like. Left of the barrier incident and reflected waves interfere: the density swings between (1 − |r|)² = 0.057 and (1 + |r|)² = 3.103. Inside it falls and rises with e^{±κx}; right of the barrier it is flat at T = 0.42. The current is the same everywhere: k(1 − |r|²) = k|τ|² = 0.840, and inside it is 2κ Im(B*A) = 0.840 (link to `l18-tunnel:b4`). | `S(2,4,0.5)` show `density` | `l19FringeMax` 3.103 · `l19FringeMin` 0.0568 · `l19CurrentLeft` 0.8399 · `l19CurrentIn` 0.8399 (= `l18BarrierInnerCurrent`, shared) |
| b6 | B | — | Townsend (6.143)–(6.144) p.230–231: the same four conditions with his F, G, C for our A, B, τ and q for κ; his T = 1/(1 + ((k² + q²)/2kq)² sinh²qa) is the notes' form: V₀²/16E(V₀ − E) times (e^{κa} − e^{−κa})² equals ((k² + κ²)/2kκ)² sinh²κa, since V₀²/E(V₀ − E) = (κ/k + k/κ)² (here 4). Both forms give 0.4200 to 1e-16. | `PLOT barrierT` marker κa = 1 | `l19Identity` 4 · `l19T1` (shared) |
| b7 | C | p.9 | Q: if both sides have the same V, what links the transmitted amplitude to the transmitted chance? → R: T = |τ|²; with different sides it needs the speed factor. | `S(2,4,0.5)` → reveal | `l19T1` (shared) |

### Unit 4 `l19-thick` — Reading T: width, height, mass
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.6, 7 | The boxed result: T = [1 + V₀²(e^{κa} − e^{−κa})²/16E(V₀ − E)]⁻¹. Since T > 0 for any finite a, a particle can pass where E < V₀. Algebra for reference (**D2**, optional in the notes): |den|² = 4(e^{κa} + e^{−κa})² + (κ/k − k/κ)²(e^{κa} − e^{−κa})², then (u + v)² = (u − v)² + 4uv with uv = 1 and (κ/k − k/κ)² + 4 = (κ/k + k/κ)². For κa = 2: T = 0.0707. | `S(2,4,1)` → `CP` den arrow → `PLOT barrierT` | `l19T2` 0.07065 (= 1/cosh²2) |
| b2 | L | p.8 | **Thick barrier** (κa ≫ 1): e^{κa} − e^{−κa} ≈ e^{κa}, so T ≈ [16E(V₀ − E)/V₀²]e^{−2κa}. The amplitude falls as e^{−κa}; the chance is its square, hence the 2. How good: exact over thick is 0.964 at κa = 2, 0.995 at κa = 3 (L18: 0.00987 against 0.00992). | `PLOT barrierT vs barrierThick` | `l19ThickRatio2` 0.9644 · `l19ThickRatio3` 0.9951 |
| b3 | L | p.8 | Width: widen by δa and T falls by e^{−2κδa}. Doubling a does not halve the exponent's effect, it doubles the exponent: from κa = 1.5 to 3, T goes 0.1807 → 0.00987, a factor 0.0546; the slope of ln T against a is −2κ = −4 (measured −3.98). Height: V₀ 4 → 8 at E = 2, a = ½: κ 2 → 3.46, T 0.420 → 0.0910. | `PLOT barrierT` markers 1.5 and 3 | `l19T15` 0.1807 · `l19DoubleFactor` 0.0546 · `l19LogSlope` −3.980 · `l19TwoKappa` 4 · `l19KappaV8` 3.464 · `l19TV8` 0.0910 |
| b4 | L | p.8 | Mass: κ ∝ √m. An electron and a proton meet a barrier 1 eV above E, 1 Å wide: κ_e = 0.512 Å⁻¹, κ_p = 21.95 Å⁻¹ (ratio 42.85). For E = 1 eV, V₀ = 2 eV: the electron has T = 0.777; the proton's T is 10^{−18.47}. 1/κ is the penetration length. | `PLOT barrierT vs barrierThick` | `l19KappaEl` 0.5123 · `l19KappaPr` 21.953 · `l19MassKappaRatio` 42.85 · `l19TElectron` 0.7775 · `l19TProtonLog10` −18.47 |
| b5 | L | p.8 | Do not stretch the thick form. As E → V₀, κ → 0 and the displayed prefactor misleads; the exact form is finite, and e^{κa} − e^{−κa} ≈ 2κa turns it into 1/T = 1 + k²a²/4 (L18, Ex. 6.7): for ka = 2, T = 0.5 (0.4994 at E = 0.999V₀). As a → 0 the thick form gives 4, the exact one 1 (L18). | `PLOT barrierT vs barrierThick` | `l19LimitT` 0.5000 (E = V₀(1 − 10⁻⁹)) · `l19LimitT999` 0.4994 · L18's `l13TEV0T` 0.5, `l18ThickAtZero` 4 (shared) |
| b6 | B | — | Townsend p.231: with 1 g, 1 erg below the top and 1 cm, κa is of order 10²⁷, so e^{−2κa} is beyond any count: his own digit. We recompute κa = 1.34 × 10²⁷ in CGS. | `PLOT barrierT vs barrierThick` | `l19MacroKappaA` 1.341e27 (relative tolerance 1e-3) |
| b7 | C | p.9 | Q: widen a thick barrier from κa = 1.5 to 3: by what factor does T fall? → R: 0.0546, not ½ (it is e^{−2κδa} times a slowly varying prefactor). | `PLOT barrierT` → reveal | `l19DoubleFactor` (shared) |

### Unit 5 `l19-energy` — Tunnelling without borrowing energy
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.8 | No. V does not depend on time and we solved for one energy E. The transmitted wave has the same E, and the barrier lends nothing. Inside, E − V₀ = −2 is not a kinetic energy a particle could show. A packet run confirms it: the mean energy 2.0196 before the barrier and after, to 2e-8. | `W(PK(-10,2.5,2),{potential:{barrier:{V0:4,a:0.5}},time:sweep(0,10)})` | `l19EnergyStart` 2.0196 · `l19EnergyDrift` 1.7e-8 (tolerance 1e-6) |
| b2 | L | p.8 | Scanning tunnelling microscopy: electrons tunnel across a vacuum gap between tip and surface. For a work function 4.0 eV, κ = 1.025 Å⁻¹; a gap 1 Å wider cuts the current by 0.129, one decade for about 1.1 Å. | `PLOT barrierT vs barrierThick` | `l19StmKappa` 1.0246 · `l19StmFactorExact` 0.1288 (the exact ratio, 5 Å → 6 Å) · `l19StmFactorThick` 0.1288 |
| b3 | L | p.8 | Alpha decay: an alpha escapes the nucleus through the Coulomb barrier although its energy is below the top. Model (not data): daughter Z = 90, radius 7.4 fm. At 4.27 MeV the barrier ends at 60.7 fm and the exponent 2∫κ dr = 97.4; at 8.0 MeV it is 52.3. The difference is 19.5 decades of T. Link back to the stack of barriers (`l18-tunnel:b6`). | `PLOT barrierT vs barrierThick` | `l19TurnB4` 60.70 · `l19Gamow4` 97.36 · `l19Gamow8` 52.34 · `l19GamowFactor10` 19.55 |
| b4 | B | — | Townsend Problem 6.21 (end of Ch. 6, pp. 237–244; page image re-read first): the delta barrier is the limit of a barrier with V₀a fixed and a → 0. With strength g = 2mV₀a/ħ² = 3 and k = 2: T = 1/(1 + g²/4k²) = 0.640. The exact formula gives 0.620, 0.638, 0.640 for a = 0.1, 0.01, 0.001. | `PLOT barrierT` | `l19DeltaTexact` 0.64 · `l19DeltaT_a0.1` 0.6200 · `…_a0.01` 0.6377 · `…_a0.001` 0.6398 |
| b5 | D | — | Beyond the notes: the transmitted packet can look faster than the incident one, yet nothing is lent: T(E) grows with E, so the transmitted part is weighted toward the high-energy end of the packet. The incident mean kinetic energy is 2.020; the transmitted part's is 2.080 (the momentum-space weighting T|φ|²; a time-dependent run gives 2.075); the reflected part has less. | `W(PK(-10,2.5,2),{potential:{barrier:{V0:4,a:0.5}},time:10,readouts:['pmean']})` | `l19IncMeanKin` 2.0200 · `l19TransKinMeanMom` 2.0803 · `l19TransKinMeanCN` 2.0748 (twin, tolerance 1e-2) |

## 2. Derivations (one track; ≥ 2 distinct views; kinds on each unit's stage)
- **D1 `l19-match:b3`** result `\tau = \dfrac{4e^{-ika}}{2(e^{\kappa a}+e^{-\kappa a})+i(\frac{\kappa}{k}-\frac{k}{\kappa})(e^{\kappa a}-e^{-\kappa a})}`: (1) the four conditions, view S; (2) at a, divide the slope condition by κ; add and subtract, view CP (1 ± ik/κ); (3) `A = \tfrac12\tau e^{ika}(1+\tfrac{ik}{\kappa})e^{-\kappa a}`, `B = \tfrac12\tau e^{ika}(1-\tfrac{ik}{\kappa})e^{\kappa a}`; (4) add the two left-edge conditions: `2 = A+B+\tfrac{\kappa}{ik}(A-B)`; (5) substitute and group e^{±κa}; (6) divide: result, view S barrier.
- **D2 `l19-thick:b1`** (optional) result `T^{-1} = 1+\tfrac{V_0^2}{16E(V_0-E)}(e^{\kappa a}-e^{-\kappa a})^2`: (1) `|{\rm den}|^2 = 4(e^{\kappa a}+e^{-\kappa a})^2+(\tfrac{\kappa}{k}-\tfrac{k}{\kappa})^2(e^{\kappa a}-e^{-\kappa a})^2`, view CP; (2) `(e+e^{-})^2 = (e-e^{-})^2+4`, view PLOT; (3) `4+(\tfrac{\kappa}{k}-\tfrac{k}{\kappa})^2 = (\tfrac{\kappa}{k}+\tfrac{k}{\kappa})^2`; (4) `(\tfrac{\kappa}{k}+\tfrac{k}{\kappa})^2 = \tfrac{V_0^2}{E(V_0-E)}`: result.
The L18 derivation D3 is not repeated; D1 states the link.

## 3. Try-it per unit (existing widgets; `wave-lab` deferred, R7)
| unit | widget spec | try this |
|---|---|---|
| recap | `{kind:'amplitude-bars', props:{state:'+z', basis:'x'}}` | 1. A share can be small and still nonzero: so can T. |
| regions | `{kind:'complex-plane', props:{mode:'multiply', z:[1,0], w:[0.5403,0.8415]}}` | 1. e^{ikx} turns; e^{κx} only grows: a turn against a stretch. |
| match | `{kind:'complex-plane', props:{mode:'multiply', z:[0.6481,0], w:[0.5403,-0.8415]}}` | 1. τ has size 0.648 and angle −57.3° (= −ka). |
| thick | `{kind:'amplitude-bars', props:{state:'+z', basis:'z'}}` | 1. Square the amplitude: a factor e^{−κa} becomes e^{−2κa}. |
| energy | `{kind:'amplitude-bars', props:{state:'+z', basis:'x'}}` | 1. Two shares, one energy each: nothing is lent between them. |

## 4. Challenges (keys from the engine; hints nudge → key idea → setup; practice walkthroughs in full pending the HW8 answer, Q3)
- **recap**: `l19-re-tail` warm-up choice: "a decaying exponential beyond an infinite step carries current" → false ✓ · `l19-re-second` core choice: "a finite barrier transmits because it is thin, not because it has a second edge" → false ✓.
- **regions**: `l19-rg-kappa` warm-up numeric κ for V₀ − E = 2 (ħ = m = 1) → 2 (tolerance 0) · `l19-rg-ratio` core numeric |B/A| for κa = 2 and k = κ → 54.60 (`l19RatioBA2`).
- **match**: `l19-ma-absT` core numeric |τ| for k = κ = 2, a = ½ → 0.648 · `l19-ma-phase` core numeric arg τ in degrees for k = κ = 2, a = 0.75 → −85.94 (`l19PhaseT75deg`) · `l19-ma-same` core choice: "T = |τ|² still holds if the right side has a different V" → false ✓ · `l19-ma-order` core order D1.
- **thick**: `l19-th-sech` warm-up numeric T for E = V₀/2, κa = 1.5 → 0.181 · `l19-th-double` core numeric T(κa = 3)/T(κa = 1.5) → 0.0546 · `l19-th-mass` core numeric κ_proton/κ_electron → 42.85 · `l19-th-limit` core choice: "the thick form stays valid as E → V₀" → false ✓ · `l19-th-order` core order D2.
- **energy**: `l19-en-same` warm-up choice: "a tunnelled particle has less energy than it came with" → false ✓ · `l19-en-stm` core numeric κ for φ = 4.0 eV → 1.025 (Å⁻¹) · `l19-en-alpha` core numeric decades of T between 4.27 and 8.0 MeV → 19.55.
**Practice (T1; ids `l19-pr-…`):**
- `l19-pr-delta` core, `practice: 'townsend'` (Problem 6.21 type, end of Ch. 6): a delta barrier of strength g = 2.5 hit with k = 1.5: T = 1/(1 + g²/4k²) → 0.590 (`l19PrDelta`; twin: the exact barrier formula with V₀a fixed and a = 0.001, 0.5900 to 1e-3).
- `l19-pr-width` core, `practice: 'townsend'` (Problem 6.23 type: solve (6.144) for the width): electron, E = 3 eV, V₀ = 7 eV, find a for T = 1 % → 2.911 Å (`l19WidthT1`; engine `barrierWidthForT`, tolerance 0.005).
- `l19-pr-stm` stretch, `practice: 'townsend'` (Problem 6.25 type, exponential current against a distance): φ = 5.1 eV, the gap grows 0.5 Å: current ratio → 0.314 (`l19PrStm`; two routes: e^{−2κΔa} and the exact barrier ratio 0.3144).

## 5. Glossary (new 448 ids; no duplicates; reused: `tunnelling`, `evanescent-wave`, `penetration-depth`, `reflection-amplitude`, `transmission-coefficient`, `probability-flux`)
| id | term | gloss (≤ 25 words) | first |
|---|---|---|---|
| `matching-conditions` | matching conditions | At a finite jump of V the function and its slope are both continuous; joining the regional solutions with them fixes the amplitudes. | l19-match:b1 |
| `thick-barrier` | thick barrier | A barrier with κa ≫ 1: T is about a prefactor times e^{−2κa}, so it falls exponentially with width. | l19-thick:b2 |
| `scanning-tunnelling-microscope` | scanning tunnelling microscope | A sharp tip held a few ångströms above a surface; the tunnelling current changes tenfold with about an ångström of gap. | l19-energy:b2 |
| `alpha-decay` | alpha decay | A nucleus emits an alpha particle by tunnelling through the Coulomb barrier; the rate depends on T, which is exponentially sensitive to the energy. | l19-energy:b3 |
(`parity` is already taken by L10's GHZ term; L20 uses `even-odd-state`.)

## 6. Review cards
- **recap**: a decaying tail has density but no current; a second edge lets it connect to a wave · eq `R+T=1` · trap: "a tail means transmission".
- **regions**: waves where E > V, exponentials where E < V; both exponentials survive in a finite region · eq `\varphi''=-k^2\varphi,\ \varphi''=\kappa^2\varphi` · trap: dropping one exponential.
- **match**: four conditions, four unknowns; τ = 4e^{−ika}/[…]; T = |τ|² · eq `T=|\tau|^2` · trap: using T = |τ|² when the sides differ.
- **thick**: T ≈ [16E(V₀ − E)/V₀²]e^{−2κa}; doubling the width squares the exponential factor; heavier means smaller T · eq `T\simeq\tfrac{16E(V_0-E)}{V_0^2}e^{-2\kappa a}` · trap: using it as E → V₀.
- **energy**: E is the same on both sides; the barrier filters, it does not lend · eq `E_{\rm out}=E_{\rm in}` · trap: "tunnelling violates conservation".

## 7. Symbol-before-use (first beat)
k, κ, φ_I, φ_II, φ_III, r, τ: `l19-regions:b1–b2` (τ Rosetta in b2) · A, B: b2 · a, V₀, E: L18 (mapped to `l19-recap:b1`) · the four equations: `l19-match:b1` · cosh, sinh: L18 (`l18-tunnel:b2`), `l19-match:b3` uses cosh · g: `l19-energy:b4`.

## 8. Errata (page image p. 6 checked; every printed formula recomputed)
Recomputed and holding: the ansatz, the four conditions, A and B (p. 4), the elimination (p. 5), τ (p. 5), the boxed T (p. 6, image), the identity chain of the p. 7 reference algebra (checked with k, κ numbers to 1e-12 and symbolically), the thick form, the E → V₀ remark (T → 1/(1 + k²a²/4)), the three closing answers (p. 9). None needs a Correction.
1. **Revision note in the printed text (p. 6).** "Replace the first board environment…" is an instructor's editing note left in; no content. Ignored.
2. **Notation.** The notes' t is τ here (M4); Townsend's q is κ, his F, G, C are A, B, τ.
3. **Wording (p. 8).** The notes say "the displayed prefactor form inapplicable" as E → V₀; true, and the app shows the exact limit.
4. **Homework (pp. 1, 9 of L19; p. 1 of L20).** HW8, due Nov 12, includes a below-barrier scattering problem "with today's setup": the sheet is not ingested, so it starts OPEN (`homework-status.md`). See Q3.

## 9. Engine, stage and widget gaps
**9.1 Engine** (new file `physics/wave19.ts`; tests + twin `pipeline/claims_448/l19.py` → `claims-448/l19.json`; reused: `barrierT`, `barrierThick`, `decayConstant`, `barrierAmplitudes` (its B, F, G, C are our r, A, B, τ), `barrierInnerCurrent`, `barrierWidthForT`, `wkbExponent`, `momentumAverage`, `evolveV`, `HBAR2_OVER_2M_EV_A2`): `transmissionAmplitude(E, V0, a)` (the closed form of the notes; twin: the 4 × 4 `numpy.linalg.solve`); `barrierStateSamples(xs, E, V0, a)` → ψ(x) of the stationary solution, incident amplitude 1 (twin: the same solve); `barrierTAny(E, V0, a)` (below, at and above the top: sin² form; twin closed forms); `meanEnergy(psi, g, V)` = ⟨p²/2 + V⟩ (twin: second-difference Hamiltonian on the Crank–Nicolson run, 1e-6); `deltaBarrierT(g, k)`; `gamowExponent(E, Z, R)` = `wkbExponent` with a Coulomb V (twin: scipy quad and the closed arccos form, agree to 1e-8); MeV·fm constants in `constants.ts`. Tolerances 1e-9 closed forms; 2e-3 for time-dependent runs.
**9.2 Stage contract.** **S1** (the one new stage piece of L19, built first by the stage agent): `wavefunction.source.barrierWave: {E, V0, a}` (0 < E < V₀ ≤ 8, 0.1 ≤ a ≤ 4; a stationary solution, incident amplitude 1, sampled by `barrierStateSamples` on the window; default window [−6, a + 6]), shows `re`, `im`, `density`, draws the V profile and the E line like the step and barrier potentials, readouts `reflection`, `transmission` (|r|², |τ|²) and the existing `norm` refused; `time`, `boost`, `shift`, `cells`, `interval`, `overlay`, `potential` refused with a message naming the field. Fidelity `wavefunction-barrier-stationary` (exact; the density is not normalisable, drawn per unit incident density). **Fallback if S1 is declined:** `plot` points mode (≤ 24 points) of |ψ|² from `V` keys over the three regions; units keep every number and lose the continuous picture. Everything else is existing: `wavefunction` packets with `potential`, `plot` curves `barrierT`, `barrierThick`, `complex-plane` (`chain`, `multiply`).
**9.3 Widgets.** None (R7).

## 10. Media / 11. Hooks / 12. Fidelity
**Media.** None. **Canvas:** none. Every stage is SVG (`wavefunction`, `plot`, `complex-plane`) and the Try-its are `amplitude-bars` and `complex-plane`: **add `'L19'` to the e2e `SVG_ONLY` list** (L19 expects zero WebGL contexts and zero canvases).
**Concept map** (five stations): `tunnel-tail` (l19-recap; needs `evanescent-wave`) · `three-regions` (l19-regions; needs `tunnelling`) · `matching` (l19-match; needs `matching-conditions`) · `thick-barrier` (l19-thick) · `tunnelling-uses` (l19-energy).
**Arcade:** Spot the error: `l19-recap` ("a tail means the particle gets through"), `l19-thick` ("doubling the width halves the exponent's effect"), `l19-energy` ("the particle borrows energy inside the barrier").
**Go further in 709:** `l19-energy:b2` → `sl-q27-josephson` (existing row; a second use). No new row.
**Fidelity.** `S` is exact; the packet scenes are `wavefunction-potential-splitstep`.

## Builder estimate and questions for the judge
**Builder (one agent, worktree, ≤ 170 steps):** ~140: 5 units / 25 beats / 2 derivations (~55), engine and twin (~25), 16 challenges + 3 practice (~30), glossary, concepts, e2e, bridges (~15), tests (~15). Needs S1 (stage agent, ~25 steps, shared with L20's S2 and S3) merged first; builds after L18 is fixed.
1. Ownership: the barrier result stays in L18 and L19 adds the direct-elimination amplitudes and the stationary picture (recommended), or move `l18-tunnel` b2–b3 and the thick form into L19?
2. Approve S1 and the engine file (recommended), or the points-plot fallback?
3. **Ask the user whether HW8 (due Nov 12) is submitted.** If open, `l19-pr-width` (the closest to "below-barrier scattering") and the barrier challenges become hints-only until the answer is recorded.
4. Alpha decay is a stated model (Z = 90, R = 7.4 fm), no reported half-lives (T4): approve?
5. Keep `l19-energy:b5` (energy filtering, beyond the notes) as Go-deeper?
