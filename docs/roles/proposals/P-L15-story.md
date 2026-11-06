# P-L15 — Lecture 15 story plan: free particles, wavepackets, group velocity and dispersion

Role P, proposal only (nothing under `app/` is touched). One track (448), sentence cap 25 words, symbols before use. Format: `P-L13-story.md`; companion `P-L14-story.md` (its §A holds the ownership table for L14 and L15; this plan only lists L15's rows and what it adds).
Helpers as `L13.story.ts`: `W`, `PK`, `PL`, `TW`, `K`, `BOX`; keys of moved beats keep `l13…` names, new ones start `l15`. L15 is built after L14 (it uses L14's plot curves `freeOmega`, `linearOmega`).

**Sources read.** Notes `sources/L15/text.md` pp. 1–11 in full (footers read "n / 11"); page images read: pp. 6 (the two-wave envelope) and 10 (the Gaussian and the scaling argument). L14 pp. 9, 11 for the link-backs. Books: Townsend 2e §6.5 pp. 202–204, §6.6 pp. 204–210 (6.58, 6.67, 6.72–6.77, Ex. 6.4), §6.3 p. 199 (6.33), Problems 6.4, 6.6; Susskind & Friedman Lecture 9 §9.1–9.4 (by section).
Homework `sl448-hw7` (the Gaussian problem) for the TYPE of one practice question (new numbers; submitted). The notes defer the exact Gaussian solution and Ehrenfest to Lecture 16 ("do not derive today", p. 11): L15 uses numbers from the engine and does not derive the closed form.

**Evidence.** `planL14L15-numpy.py` (scratchpad, 91 values for both plans, all asserts pass, byte-identical twice): route A = own numpy FFT grid (4096 points on [−32, 32)), `e^{-iHt}` by matrix exponential, tracked crests and envelopes; route B = closed forms, `erf`, `quad`. SI numbers use CODATA. A note found on the way: a packet of p₀ = 3 run to t = 6 reaches x = 18 and its far tail wraps the periodic window, so L15's width demos use p₀ = 1.5 (centre 9 at t = 6); momentum statistics are unaffected by the window.

**Conventions.** Beat gists are compressed notes: the builder writes each out in sentences of at most 25 words (house cap) and defines every symbol before use. ħ = m = 1 (ℓ, ħ/ℓ, mℓ²/ħ). The notes' ϕ(p, t) is ψ̃(p, t) (one Rosetta line in `l15-packet-evolution:b1`, R5 of L13); v_g, v_phase as `v_g`, `v_{phase}`; E_p = p²/2m.

**Builder note (2026-11-06, as built under rulings M1-M7 of `448-L14L18.md`).** Built as planned: 6 units, **34 beats** (3 + 5 + 6 + 7 + 6 + 7), 5 derivations, 27 challenges (3 practice: `l15-pr-dp`, `l15-pr-boost`, `l15-pr-spread`), 7 glossary entries, 6 review cards, 6 formula boards. Differences from the plan: (1) the plan's claim that the `shift` stand-in is exact "to 1e-8" came from a p0 = 3 check; for the p0 = 1.5 demos about 0.0013 of the weight lies below p = 0, so the text instead says the shift is exact for the first-order law i hbar d_t psi = c p psi, whatever the sign of p, and `momentumTail`/`l15LinearTail` were dropped; (2) a split of two `wavefunction` states is refused by the stage lint, so Unit 15.5 pairs the shifted packet with the `plot` of the two dispersion relations and the clue's reveal uses `overlay: ['original']`; (3) moved keys took the `l15` prefix (`l15FreeMean2`, `l15FringeSpacing`, `l15FringeSpeed`, `l15FringeSpeedFormula`) and the moved challenges became `l15-pz-mean`, `l15-gv-fringe`, `l15-gv-fspeed` (L13 now has 27 challenges); (4) extra keys: input echoes (`l15EchoT12`, `l15EchoK1Near`, `l15EchoK2Near`, `l15PlaneP15`, `l15MeanP15`, `l15Dx08`, `l15Dx04`) so the number reader finds every input backed, and `l15PzSpeed` for the practice warm-up; (5) a station `motion-puzzle` was added so every built unit is on the map; (6) the lecture title became 'Free particles and packets: group velocity and dispersion' (the notes' own title was a 7-word match). Not built: the Arcade rounds of section 11 and the optional film.

## A. Ownership: L15's rows (full table in P-L14 §A)
| item | proposal |
|---|---|
| `l13-schrodinger:b3` (free centre at 6) | `l13FreeMean2` becomes the clue of `l15-puzzle` |
| `l13-schrodinger:b6` Townsend Ex. 6.4 (SI spreading times), `l13FreeDp4`, `l13-sc-electron` | NOT here: they go to L16 (`l16-spread:b6`; P-L16 proposes it and Townsend §6.6 is L16's assigned reading). L15 keeps the scaling argument and one line, in `l15-gaussian:b6`, that Townsend's T = ma²/ħ equals t_spread with a = √2σ; the SI numbers are Unit 16.3's |
| `l13-schrodinger:b8` two-wave fringes (π ℓ, 3.0 ℓ/t) | MOVES here: `l15-group-velocity:b1` (keys `l13FringeSpacing`, `l13FringeSpeed`, `l13FringeSpeedFormula`) |
| exact Δx(t) = σ√(1 + (ħt/2mσ²)²), `l13FreeSd2`, `l13FreeSd4`, Ehrenfest | stay with L16 (notes p. 11 and p. 1 say so); L15 shows only measured numbers (`l15PeakRatioT6`, `l15QuadWidth6`, `l15WidthAtTSpread`) under its own keys and says "Unit 16.2 derives it" |
| glossary `gaussian-packet`, `spreading-time` | L15 owns them (first use in reading order). P-L16 also defines `spreading-time` at `l16-evolve:b1`: one id only, recommend L15 (Q1). `chirp` is P-L16's gloss: L15 says "a correlation between position and momentum" in plain words and never links it |

## 0. Lecture map
| # | id | Title (≤ 8 words) | Question | Notes | Books |
|---|---|---|---|---|---|
| 1 | `l15-puzzle` | Stationary states do not move | If energy eigenstates stand still, how can a particle move? | pp.1–2 (§15.1) | — |
| 2 | `l15-free-eigenstate` | A free momentum state is an energy state | What do the energy eigenstates of p̂²/2m look like, and why is none a particle? | pp.3–4 (§15.2) | Townsend §6.6 p.204; Susskind L9 §9.3 |
| 3 | `l15-packet-evolution` | Evolve each momentum component | How does any free packet evolve? | pp.4–5 (§15.3) | Townsend §6.6 pp.208–210; Susskind L9 §9.3 |
| 4 | `l15-group-velocity` | How fast does a packet move? | What speed does the moving envelope have? | pp.6–7 (§15.4) | Townsend §6.3 p.199; Susskind L9 §9.1, §9.4 |
| 5 | `l15-dispersion` | Why does the packet spread? | What makes a free packet broaden, and what would stop it? | pp.8–9 (§15.5) | Susskind L9 §9.1–9.2 |
| 6 | `l15-gaussian` | The Gaussian: uncertainty meets dynamics | How fast does a Gaussian spread, from a scaling argument? | pp.10–11 (§15.6–15.7) | Townsend §6.6 pp.204–210, Ex. 6.4 |
**Counts.** 6 units, **34 beats** (3 + 5 + 6 + 7 + 6 + 7), 6 clues, 5 books beats, 3 link-backs, 5 derivations, 3 practice questions. Optional per the notes: the phase-velocity aside (p. 7) and the full Gaussian (p. 9): the aside stays one lecture beat (cheap and drawn by the stage), the full Gaussian is L16's.
Outcomes: (1) say why motion needs a superposition of energies; (2) write the free energy eigenstates and say why none is a particle; (3) evolve any free packet by one phase per momentum; (4) derive v_g = dω/dk from two waves and get p/m; (5) tell group from phase velocity; (6) say why curvature of ω(k) means spreading; (7) estimate the spreading time 2mσ²/ħ.

## 1. Story beats (W = `wavefunction`; phase L lecture · B books · C clue)
### Unit 1 `l15-puzzle`
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.2 | **Link back** (Unit 14.6): Ĥ\|E⟩ = E\|E⟩ gives \|ψ(t)⟩ = e^{−iEt/ħ}\|E⟩ and a fixed density. A superposition of two energies has a relative phase that changes the density: this is the ingredient for motion. | `W(BOX(4,[1,2]),{time:sweep(0,6.8),show:['density']})` | — |
| b2 | L | p.2 | Set up: a particle prepared near x₀ with momenta around p₀, all forces removed. Classically it moves at v₀ = p₀/m. Quantum mechanically: does its position distribution move at p₀/m, and does its shape change? The free Hamiltonian is Ĥ = p̂²/2m, V = 0. For p₀ = 3, m = 1 the classical speed is 3 ℓ per unit time. | `W(PK(0,1,3),{time:0,show:['density'],readouts:['pmean']})` | `l15ClassicalV` 3 |
| b3 | C | p.2 | Q: A free packet with p₀ = 3 starts at the origin. Where is its centre at t = 2? → R: 6 ℓ, the classical answer; the next units show why. | `W(PK(0,1,3),{time:0,readouts:['xmean']})` → reveal `time:2` | `l13FreeMean2` 6 |
### Unit 2 `l15-free-eigenstate`
| b1 | L | p.3 | Momentum eigenstates are energy eigenstates of the free particle: Ĥ\|p⟩ = (p̂²/2m)\|p⟩ = (p²/2m)\|p⟩, so E_p = p²/2m (**D1**; gloss `free-particle`). The converse fails: p and −p share one energy. | `W(PL(2),{show:['re']})` → `W(PL(-2),{show:['re']})` | — |
| b2 | L | p.3 | Evolve in the position basis: ψ_p(x, t) = e^{i(px − E_pt)/ħ}/√(2πħ) = e^{i(kx−ωt)}/√(2πħ) with ω(k) = ħk²/2m (link back Unit 14.3). Take p = 1.5: E = 1.125, the phase at a point turns once in 5.59, and the crests of Re ψ move right at 0.75 = p/2m (the phase velocity, Unit 15.4). | `W(PL(1.5),{time:sweep(0,5.6),show:['re','phase']})` | `l15E15` 1.125 · `l15PlanePeriod` 5.59 · `l15CrestSpeed15` 0.75 |
| b3 | L | pp.3–4 | Is this a particle moving right? Crests move, but \|ψ_p\|² is the same at every x and t: perfectly defined momentum, no position. The integral over x diverges: a generalised, δ-normalised eigenstate. The 1/2πħ is a formal squared amplitude, not a density of a finite interval (the notes' caution). | `W(PL(1.5),{show:['density'],readouts:['pmean','pspread']})` | `l15FlatDensity` 0 (spread of \|ψ\|² over the window) |
| b4 | B | — | Townsend §6.6 p.204 (6.58): \|⟨x\|p⟩\|²dx = dx/2πħ, independent of x, so Δx = ∞, "not a physical state". Susskind L9 §9.3: momentum eigenvectors solve the time-independent equation with E = p²/2m. | `W(PL(1.5),{show:['density']})` | — |
| b5 | C | p.3 | Q: A free particle has energy 2 (m = 1). How many momenta carry it? → R: two, p = ±2: the same energy, opposite directions. | `W(PL(2),{show:['re']})` → reveal `W(TW(2,-2),{show:['density']})` | `l15SameEnergyCount` 2 |
### Unit 3 `l15-packet-evolution`
| b1 | L | p.4 | One ket, many momentum amplitudes: \|ψ(0)⟩ = ∫dp ψ̃(p, 0)\|p⟩ (Unit 13.4; **Rosetta**: the notes' ϕ is our ψ̃). The choice of ψ̃(p, 0) decides where the packet is and how localised. | `W(PK(0,1,1.5),{panels:['position','momentum']})` | — |
| b2 | L | p.4 | Which basis makes the evolution easy? One where Ĥ is diagonal: momentum. Evolve each component separately: ψ̃(p, t) = e^{−ip²t/2mħ}ψ̃(p, 0) (**D2**). Each component gains its own phase and keeps its size: after t = 1.2 the p = 1 component has turned −34.4°, p = 2 has turned −137.5°. | `W(PK(0,1,1.5),{panels:['momentum'],show:['density','phase'],time:sweep(0,1.2)})` | `l15PhaseP1Deg` −34.4 · `l15PhaseP2Deg` −137.5 |
| b3 | L | p.5 | Back to position space: ψ(x, t) = (2πħ)^{−1/2}∫dp ψ̃(p, 0)e^{i(px − p²t/2m)/ħ}: the free solution for any normalisable start. The packet stays normalised (1 at t = 6). | `W(PK(0,1,1.5),{panels:['position','momentum'],time:sweep(0,6),readouts:['norm']})` | `l15NormT6` 1 |
| b4 | L | p.5 | What changes and what does not. \|ψ̃(p, t)\|² is fixed, so ⟨p⟩ and Δp are constant (Δp = 0.5 at t = 0 and at t = 6; ⟨p⟩ = 1.5 at t = 6). But \|ψ(x, t)\|² moves and flattens: its peak is 0.316 of its start by t = 6. Different phases make the sum at each x interfere differently. | `W(PK(0,1,1.5),{panels:['position','momentum'],time:sweep(0,6),readouts:['pspread','pmean','peak']})` | `l15DpT0` 0.5 · `l15DpT6` 0.5 · `l15MeanPT6` 1.5 · `l15PeakRatioT6` 0.316 · `l15PhiDrift` (check < 10⁻⁹) |
| b5 | B | — | Townsend §6.6 pp.208–210 (6.73)–(6.75): momentum states are energy eigenstates, multiply each by e^{−ip²t/2mħ} and transform back; p.209–210: \|⟨p\|ψ(t)⟩\|² = \|⟨p\|ψ(0)⟩\|². Susskind L9 §9.3: only the phase of ψ̃ changes, P(p) is constant (momentum is conserved for a free particle). | `W(PK(0,1,1.5),{panels:['position','momentum'],time:sweep(0,6)})` | — |
| b6 | C | p.5 | Q: The momentum distribution never changes. How can the position distribution? → R: the phases between components change, so the interference at each x changes. | `W(PK(0,1,1.5),{panels:['momentum'],time:0})` → reveal both panels, `time:6` | — |
### Unit 4 `l15-group-velocity`
| b1 | L | p.6 | An easier route to the speed: add just two waves of nearby momenta. They are not normalisable and their pattern repeats, yet the pattern's envelope moves like a narrow packet. For p = 2 and 4 the density of ψ = (e^{ip₁x−iE₁t} + e^{ip₂x−iE₂t})/√2 has fringes π ℓ apart, moving at 3.0 ℓ per unit time = (p₁ + p₂)/2m. | `W(TW(2,4),{time:sweep(0,2),show:['density']})` | `l13FringeSpacing` π · `l13FringeSpeed` 3.0 · `l13FringeSpeedFormula` 3.0 |
| b2 | L | p.6 | Algebra: with k₀, ω̄, Δk, Δω the sums and differences, e^{iA} + e^{iB} = 2e^{i(A+B)/2}cos[(A−B)/2], so ψ ∝ 2e^{i(k₀x−ω̄t)}cos[(Δk x − Δω t)/2]: a fast carrier times a slow envelope (**D3**; gloss `envelope`). Take k₁ = 2.8, k₂ = 3.2: the fringes are 15.7 ℓ apart. | `W(TW(2.8,3.2),{window:{x:[-16,16]},show:['re','density']})` | `l15FringeSpacingNear` 15.7 |
| b3 | L | p.6 | Follow the envelope, not the crests: Δk x − Δω t = constant gives v_env = Δω/Δk, and for Δk → 0 the group velocity v_g = dω/dk (gloss `group-velocity`). For the near pair Δω/Δk = 3.0 (D3 continues). | same with `time:sweep(0,3)` | `l15EnvSpeedNear` 3.0 |
| b4 | L | p.7 | For the free particle ω = ħk²/2m, so v_g = ħk/m = p/m: the classical velocity, recovered without a trajectory. A packet with p₀ = 3 has its centre at 9 ℓ at t = 3. | `W(PK(0,1,3),{time:sweep(0,3),readouts:['xmean']})` | `l15Centre3` 9 |
| b5 | L | p.7 | Optional aside: the crests of one plane wave move at v_phase = ω/k = p/2m (gloss `phase-velocity`): at k = 3, 1.5 against 3.0 for the envelope, ratio 2. The crests of the near pair go at 1.507 (ω̄/k₀). No contradiction: a crest is not the particle. | `W(TW(2.8,3.2),{window:{x:[-16,16]},time:sweep(0,3),show:['re','density']})` | `l15PhaseV3` 1.5 · `l15CarrierSpeedNear` 1.507 · `l15GroupPhaseRatio` 2 |
| b6 | B | — | Townsend §6.3 p.199 (6.33): d⟨x⟩/dt = ⟨p⟩/m exactly, for any packet, a second route to the same speed (Unit 16.4 derives it). Susskind L9 §9.4: the centre of the packet travels at ⟨p/m⟩; §9.1: with Ĥ = c p̂ every component moves at c. | `W(PK(0,1,3),{time:sweep(0,3)})` | — |
| b7 | C | p.7 | Board check. Q: A packet is centred on p₀ = −3. Which way does it go, and is its energy negative? → R: to the left (centre at −6 at t = 2); the energy is positive, ⟨p̂²/2m⟩ = 4.625. | `W(PK(0,1,-3),{time:0})` → reveal `time:2` | `l15NegCentre2` −6 · `l15NegEnergy` 4.625 |
### Unit 5 `l15-dispersion`
| b1 | L | p.8 | The velocity v_g(p) = p/m depends on p. A packet with momentum spread Δp holds velocities spread by Δv ~ Δp/m (0.5 for Δp = 0.5): faster parts run ahead, slower ones lag. This is dispersion (gloss `dispersion`). v_g is 1 at k = 1 and 3 at k = 3. | `W(PK(0,1,1.5),{panels:['position','momentum'],time:sweep(0,6),readouts:['xspread','pspread']})` | `l15DeltaV` 0.5 · `l15Vg1` 1 · `l15Vg3` 3 |
| b2 | L | p.8 | Is spreading inevitable because Δp > 0? No: the uncertainty relation says several momenta are needed; what happens depends on how ω varies with k. Expand about k₀ with q = k − k₀: ω = ω₀ + ω₀′q + ½ω₀″q² + …. The linear term only shifts the envelope, x → x − v_g t; curvature ω₀″ ≠ 0 adds relative phases, so the shape changes (**D4**). For the free particle ω″ = ħ/m = 1. | plot `freeOmega`, markers k = 2.8, 3.2 → `W(PK(0,1,1.5),{time:sweep(0,6)})` | `l15Omega2nd` 1 |
| b3 | L | p.9 | Linear against quadratic. ω = ck (k > 0): ω″ = 0, every component moves at c, the envelope translates without broadening (idealised, one direction). ω = ħk²/2m: ω″ = ħ/m, components part ways, an unchirped packet spreads. The shift field of the stage stands in for ω = ck (T(a) shifts every component by the same a); the packet's weight below p = 0 is under 10⁻⁸, so the stand-in is exact to that. | `{layout:'split', top: W(PK(0,1,1.5),{shift:sweep(0,6),readouts:['xspread']}), bottom: W(PK(0,1,1.5),{time:sweep(0,6),readouts:['xspread']})}` | `l15LinearTail` (check < 10⁻⁸) |
| b4 | L | p.9 | Payoff and care. A packet can satisfy the uncertainty relation and still keep its width if every wave number it contains travels at one speed (an idealised one-way wave in one dimension; real beams diffract and media disperse). Spreading need not be monotonic either: a correlation between position and momentum, a chirp, can first squeeze the packet. The simple picture holds for an unchirped Gaussian with a real envelope. | plot `freeOmega` vs `linearOmega` | — |
| b5 | B | — | Susskind L9 §9.1–9.2, Figs 9.1–9.2: the packet of a first-order c p̂ equation keeps its shape; the packet of a free particle moves and spreads. Townsend §6.6 p.209 (6.77): the width grows while Δp does not (Unit 16.2). | `W(PK(0,1,1.5),{time:sweep(0,6)})` | — |
| b6 | C | p.9 | Q: A packet moves 6 ℓ. How wide is it afterwards if every component moves at the same speed, and how wide for the free particle (σ = 1)? → R: 1 against 3.16. | `W(PK(0,1,1.5),{shift:0,time:0,readouts:['xspread']})` → reveal the split of b3 at 6 | `l15LinearWidth6` 1 · `l15QuadWidth6` 3.16 |
### Unit 6 `l15-gaussian`
| b1 | L | p.10 | The Gaussian of the homework, ψ(x, 0) = (2πσ²)^{−1/4}exp[−(x−x₀)²/4σ² + ip₀(x−x₀)/ħ]: ⟨x⟩ = x₀, Δx = σ, and a Gaussian momentum amplitude centred on p₀ with Δp = ħ/2σ, so ΔxΔp = ħ/2 for an unchirped packet (gloss `gaussian-packet`). For σ = 0.8: Δp = 0.625, product 0.5. <<sl-q3-uncertainty\|Go further in 709: the uncertainty relation>> | `W(PK(0,0.8,1.5),{panels:['position','momentum'],readouts:['xspread','pspread','product']})` | `l15Dp08` 0.625 · `l15Prod08` 0.5 |
| b2 | L | p.10 | What should happen: the centre moves at p₀/m, and the spread of momenta gives a spread of velocities Δv ~ Δp/m = ħ/2mσ = 0.625. A narrower packet has the bigger Δp, so it spreads faster. The uncertainty principle does not push the packet apart: Schrödinger evolution does, acting on the momenta the principle says must be present. | `W(PK(0,0.8,1.5),{time:sweep(0,3)})` | `l15Dv08` 0.625 |
| b3 | L | p.10 | Scaling: the velocity spread matters when Δv·t ~ σ, so t_spread ~ σ/Δv = 2mσ²/ħ (**D5**; gloss `spreading-time`): 1.28 for σ = 0.8, 0.32 for σ = 0.4. | `W(PK(0,0.8,1.5),{time:sweep(0,1.28)})` | `l15Tspread08` 1.28 · `l15Tspread04` 0.32 |
| b4 | L | p.11 | Optional preview, not derived here (Unit 16.2): ⟨x⟩ₜ = x₀ + p₀t/m and Δx(t) = σ√(1 + (ħt/2mσ²)²). At t = t_spread the width has grown by √2 = 1.414. | `W(PK(0,0.8,1.5),{time:1.28,readouts:['xspread']})` | `l15WidthAtTSpread` 1.414 |
| b5 | L | p.11 | Consolidation (§15.7): ψ̃(p, t) = e^{−ip²t/2mħ}ψ̃(p, 0) and \|ψ̃\|² fixed; ψ(x, t) = (2πħ)^{−1/2}∫dp ψ̃(p, 0)e^{i(px − p²t/2m)/ħ}; ω = ħk²/2m and v_g = p/m. Exit: a momentum eigenstate has a sharp velocity and no place. A packet gets its place from many momenta, and the phases between them keep shifting, so it moves and spreads. Next: one Gaussian exactly, then Ehrenfest. | `W(PK(0,0.8,1.5),{panels:['position','momentum'],time:sweep(0,4)})` | — |
| b6 | B | — | Townsend §6.6 pp.208–209 (6.77): his time T, defined by ħ²T²/m²a⁴ = 1, is ma²/ħ. With his width constant a = √2σ (Rosetta R6 of L13) it is 2mσ²/ħ, the same scale as the scaling argument (ratio 1). Unit 16.3 gives his SI examples and Unit 16.2 the exact width. | `W(PK(0,0.5),{time:sweep(0,2)})` | `l15TspreadEqTownsend` 1 |
| b7 | C | p.10 | Q: Squeeze a packet to half its width. What happens to its spreading time? → R: it is a quarter as long (1.28 → 0.32). | `W(PK(0,0.8,1.5),{time:0.5})` → reveal `W(PK(0,0.4,1.5),{time:0.5})` | `l15TspreadRatio` 4 |

## 2. Derivations (one track; ≥ 2 distinct views each, on the unit's `wavefunction` stage)
- **D1 `l15-free-eigenstate:b1`** result `\hat H|p\rangle = \tfrac{p^2}{2m}|p\rangle`: (1) `\hat p|p\rangle = p|p\rangle` view W plane p = 2; (2) `\hat p^2|p\rangle = p\,\hat p|p\rangle = p^2|p\rangle` — "apply p̂ twice"; (3) `\hat H|p\rangle = \tfrac{\hat p^2}{2m}|p\rangle = \tfrac{p^2}{2m}|p\rangle` view W plane p = −2.
- **D2 `l15-packet-evolution:b2`** result `\tilde\psi(p,t) = e^{-ip^2t/2m\hbar}\,\tilde\psi(p,0)`: (1) `|\psi(0)\rangle = \int dp\,\tilde\psi(p,0)|p\rangle` view W momentum t = 0; (2) `|\psi(t)\rangle = e^{-i\hat Ht/\hbar}\int dp\,\tilde\psi(p,0)|p\rangle` — "the law is linear"; (3) `= \int dp\,\tilde\psi(p,0)\,e^{-iE_pt/\hbar}|p\rangle` — "|p⟩ is an energy eigenstate"; (4) overlap with ⟨p|: the result, view W momentum t = 1.2.
- **D3 `l15-group-velocity:b2`** result `v_g = d\omega/dk`: (1) `\psi \propto e^{i(k_1x-\omega_1t)} + e^{i(k_2x-\omega_2t)}` view W two waves t = 0; (2) `e^{iA}+e^{iB} = 2e^{i(A+B)/2}\cos\tfrac{A-B}{2}`; (3) `\psi \propto 2e^{i(k_0x-\bar\omega t)}\cos\tfrac{\Delta k\,x-\Delta\omega\,t}{2}` — "a carrier times an envelope"; (4) `\Delta k\,x-\Delta\omega\,t = \text{const} \Rightarrow \Delta k\,\tfrac{dx}{dt} = \Delta\omega`, view W two waves t = 3; (5) `v_{\rm env} = \tfrac{\Delta\omega}{\Delta k} \to \tfrac{d\omega}{dk}`.
- **D4 `l15-dispersion:b2`** result `\omega(k) = \omega_0 + v_g\,q + \tfrac12\omega_0''q^2 + \cdots`: (1) `\psi \propto \int dk\,A(k)\,e^{i[kx-\omega(k)t]}` view W packet t = 0; (2) `q = k - k_0` and the expansion of ω; (3) the linear term gives `e^{iq(x-v_gt)}`, a rigid shift of the envelope; (4) the quadratic term `\tfrac12\omega_0''q^2t` is left over and changes the shape, view W packet t = 6.
- **D5 `l15-gaussian:b3`** result `t_{\rm spread}\sim \tfrac{2m\sigma^2}{\hbar}`: (1) `\Delta p = \tfrac{\hbar}{2\sigma}` view W σ = 0.8; (2) `\Delta v\sim\tfrac{\Delta p}{m} = \tfrac{\hbar}{2m\sigma}`; (3) `\Delta v\,t\sim\sigma` — "the spread of velocities matters when it carries a part a width away"; (4) `t\sim\tfrac{\sigma}{\Delta v} = \tfrac{2m\sigma^2}{\hbar}`, view W σ = 0.4.

## 3. Try-it per unit (existing widgets; no `wave-lab`, Q5 of P-L14)
| unit | widget spec | try this |
|---|---|---|
| puzzle | `{kind:'two-clocks', props:{upper:3, lower:1, start:'+x'}}` | 1. With one energy nothing moves; with two, the gap between the hands changes the chances. |
| free-eigenstate | `{kind:'complex-plane', props:{mode:'multiply', z:[1,0], w:[0.6,-0.8]}}` | 1. A stand-in: one phase turning at the rate E_p. |
| packet-evolution | `{kind:'two-clocks', props:{upper:4, lower:1, start:'+x'}}` | 1. Two momenta, two rates (p = 2 and 1): each only turns; its size never changes. |
| group-velocity | `{kind:'two-clocks', props:{upper:8, lower:2, start:'+x'}}` | 1. The gap of the two hands turns at ω₂ − ω₁ = 6: the envelope moves at 6/2 = 3. |
| dispersion | `{kind:'two-clocks', props:{upper:4, lower:1, start:'+x'}}` | 1. Hands that turn at rates not in proportion to k fall out of step: that is spreading. |
| gaussian | `{kind:'amplitude-bars', props:{state:'+x', basis:'z'}}` | 1. A stand-in for "a few components": more components, a narrower packet. |

## 4. Challenges (tolerance 0.005 for decimals, 0 for integers)
- **puzzle**: `l15-pz-v` warm-up numeric the speed for p₀ = 4.5, m = 1.5 → 3 · `l15-pz-which` core choice: which states have a time-independent density (an energy eigenstate ✓, an equal mix of two energies ✗).
- **free-eigenstate**: `l15-fe-energy` warm-up numeric E_p for p = 1.5 → 1.125 · `l15-fe-period` core numeric 2π/E_p → 5.585 · `l15-fe-flat` core choice: \|ψ_p\|² against x → constant ✓ · `l15-fe-count` core numeric momenta sharing E = 2 → 2.
- **packet-evolution**: `l15-pe-phase` warm-up numeric the phase turned by p = 2 after t = 1.2, in degrees → 137.5 (magnitude, tolerance 0.05) · `l15-pe-dp` core numeric Δp at t = 6 for σ = 1 → 0.5 · `l15-pe-order` core order the steps of D2 · `l15-pr-dp` **practice** (below).
- **group-velocity**: `l15-gv-env` warm-up numeric the envelope speed for k₁ = 4, k₂ = 5 → 4.5 (`l15PrEnvSpeed45`) · `l15-gv-carrier` core numeric the carrier speed ω̄/k₀ for the same pair → 2.278 (`l15PrCarrier45`) · `l15-gv-phase` core choice: phase velocity p/2m against group p/m (the crest runs at half the envelope speed ✓) · `l15-gv-order` core order the steps of D3 · `l15-gv-electron` stretch numeric the envelope speed of an electron packet of wavelength 0.50 nm, in 10⁶ m/s → 1.455 (`l15VgElectron`; phase speed 0.727) · `l15-pr-boost` **practice**.
- **dispersion**: `l15-di-curv` warm-up numeric ω″ for the free particle (ħ = m = 1) → 1 · `l15-di-dv` core numeric Δv for Δp = 0.5 → 0.5 · `l15-di-lin` core choice: which relation keeps a packet's shape: ω = ck ✓ · `l15-di-order` core order the steps of D4.
- **gaussian**: `l15-ga-dp` warm-up numeric Δp for σ = 0.8 → 0.625 · `l15-ga-t` core numeric t_spread for σ = 0.8 → 1.28 · `l15-ga-ratio` core numeric the factor by which halving σ shortens t_spread → 4 · `l15-pr-spread` **practice**.
**Practice (T1; 3 here; walkthroughs in full; new numbers).**
| id | tag | prompt | answer (key, route) | mirrors |
|---|---|---|---|---|
| `l15-pr-dp` | homework, core numeric | A free particle (ħ = m = 1) has the Gaussian ψ(x, 0) with σ = 0.8. Find Δp at t = 0 and at t = 5. | 0.625 and 0.625 (`l15PrDp`, `l15PrDpT5`; twin: FFT, then analytic ħ/2σ) | the HW7 minimum-uncertainty Gaussian: momentum width, and what a larger σ does |
| `l15-pr-boost` | townsend 6.6 | A packet at x₀ = −2 ℓ with σ = 1 is multiplied by e^{1.5ix} (ħ = m = 1). Where is its centre at t = 6? | 7 (`l15PrBoost`, integer, tolerance 0; twin: FFT evolution) | Townsend Problem 6.6: a position-dependent phase leaves ⟨x⟩ and adds p₀ to ⟨p⟩ |
| `l15-pr-spread` | townsend 6.4 | An electron packet has a = 1 nm (Townsend's width constant, σ = a/√2). Find its spreading time T = ma²/ħ in femtoseconds. | 8.638 fs (`l15PrSpreadFs`; twin: CODATA) | Townsend Problem 6.4 and Ex. 6.4 |

## 5. Glossary (new 448 ids; all free in `ids.json`; reused: `wave-packet`, `plane-wave`, `momentum-wavefunction`, `fourier-transform`, `wave-number`, `angular-frequency`, `relative-phase`, `stationary-state`, `energy-eigenstate`, `generalized-eigenstate`, `dispersion-relation` (L14))
| id | term | gloss (≤ 25 words) | first |
|---|---|---|---|
| `free-particle` | free particle | A particle with V = 0; its Hamiltonian is p̂²/2m, its momentum states are its energy states and E = p²/2m. | l15-free-eigenstate:b1 |
| `envelope` | envelope | The slowly varying factor that multiplies a fast carrier wave; it shows where the superposition is large. | l15-group-velocity:b2 |
| `group-velocity` | group velocity v_g | The speed dω/dk of a packet's envelope; for a free particle p/m. | l15-group-velocity:b3 |
| `phase-velocity` | phase velocity | The speed ω/k of the crests of one plane wave; for a free particle p/2m. | l15-group-velocity:b5 |
| `dispersion` | dispersion | The spreading of a packet because waves of different wave number travel at different speeds. | l15-dispersion:b1 |
| `gaussian-packet` | Gaussian packet | A packet shaped like e^{−x²/4σ²}: Δx = σ, Δp = ħ/2σ, so ΔxΔp = ħ/2, the least allowed. | l15-gaussian:b1 |
| `spreading-time` | spreading time | The time 2mσ²/ħ after which the spread of velocities has moved parts of a packet a width apart; a free Gaussian is then √2 times as wide. | l15-gaussian:b3 |
Notation beats: none new (`group-velocity` is a term, not notation; ω, k, Δk, Δω are defined in D3's beat).

## 6. Review cards
- **puzzle**: an energy eigenstate has a fixed density; motion needs a superposition of energies · eq `|\psi(t)\rangle = e^{-iEt/\hbar}|E\rangle` · trap: expecting a stationary state to move.
- **free-eigenstate**: momentum eigenstates are energy eigenstates, E_p = p²/2m; none is normalisable · eq `\psi_p(x,t) = \tfrac{1}{\sqrt{2\pi\hbar}}e^{i(px-E_pt)/\hbar}` · trap: reading the crests as a moving particle.
- **packet-evolution**: one phase per momentum; \|ψ̃\|² never changes; \|ψ\|² does · eq `\tilde\psi(p,t) = e^{-ip^2t/2m\hbar}\tilde\psi(p,0)` · trap: "the momentum spread grows as the packet spreads".
- **group-velocity**: the envelope moves at dω/dk = p/m, the crests at p/2m · eq `v_g = d\omega/dk = p/m` · trap: giving the particle the phase velocity.
- **dispersion**: curvature of ω(k) makes the components part ways; a linear ω translates rigidly · eq `\omega''=\hbar/m` · trap: blaming the uncertainty principle directly.
- **gaussian**: Δp = ħ/2σ, t_spread ~ 2mσ²/ħ, halving σ quarters it · eq `t_{\rm spread}\sim 2m\sigma^2/\hbar` · trap: believing a narrower packet spreads more slowly.

## 6b. Formula boards (`Unit.equations`; Townsend equations as printed, ruling T2)
- **puzzle**: `|\psi(t)\rangle = e^{-iEt/\hbar}|E\rangle` (4.15, p. 113).
- **free-eigenstate**: `E_p = \tfrac{p^2}{2m}`, `\langle x|p\rangle = \tfrac{e^{ipx/\hbar}}{\sqrt{2\pi\hbar}}` (6.173, p. 237), `|\langle x|p\rangle|^2dx = \tfrac{dx}{2\pi\hbar}` (6.58, p. 204).
- **packet-evolution**: `|\psi(t)\rangle = \int dp\,e^{-ip^2t/2m\hbar}|p\rangle\langle p|\psi(0)\rangle` (6.74, p. 208), `\psi(x,t) = \int dp\,e^{-ip^2t/2m\hbar}\langle x|p\rangle\langle p|\psi(0)\rangle` (6.75, p. 209).
- **group-velocity**: `\psi\propto 2e^{i(k_0x-\bar\omega t)}\cos\tfrac{\Delta k\,x-\Delta\omega\,t}{2}`, `v_g = \tfrac{d\omega}{dk} = \tfrac{p}{m}`, `v_{\rm phase} = \tfrac{\omega}{k} = \tfrac{p}{2m}`, `\tfrac{d\langle x\rangle}{dt} = \tfrac{\langle p\rangle}{m}` (6.33, p. 199).
- **dispersion**: `\omega(k) = \omega_0 + \omega_0'\,q + \tfrac12\omega_0''q^2 + \cdots`, `\omega'' = \hbar/m`.
- **gaussian**: `\Delta x = a/\sqrt2` (6.67, p. 205), `\Delta p = \hbar/\sqrt2\,a` (6.72, p. 207), `T = ma^2/\hbar` (p. 209, defined by the factor in 6.77), `t_{\rm spread}\sim 2m\sigma^2/\hbar`.

## 7. Symbol-before-use (first beat)
E, \|E⟩: Unit 14 (mapped to `Lecture.symbols`) · v₀, p₀, x₀, m: l15-puzzle:b2 · E_p, ψ_p, ω(k): l15-free-eigenstate:b1–b2 · ψ̃(p, t): l15-packet-evolution:b1 · k₁, k₂, k₀, ω̄, Δk, Δω: l15-group-velocity:b2 · v_g, v_env: b3 · v_phase: b5 · q, ω₀′, ω₀″: l15-dispersion:b2 · σ, Δv, t_spread: l15-gaussian:b1–b3.

## 8. Errata and consistency fixes (no physics error found; no Correction box)
Recomputed and holding (page images L15 pp. 6, 10; text layer elsewhere): the two-wave identity and v_env = Δω/Δk, v_g = p/m, v_phase = p/2m, ψ̃(p, t) = e^{−ip²t/2mħ}ψ̃(p, 0), Δp = ħ/2σ, t_spread = 2mσ²/ħ, and the previewed Δx(t) (engine: 3.162 at t = 6, σ = 1). Notes' wording kept honestly: the 1/2πħ of \|ψ_p\|² is not a probability density; the linear-dispersion example is one direction only; the chirp caveat is stated in words (no stage draws a chirp).
Notation only: ϕ(p, t) → ψ̃(p, t); the notes' "vgroup/vphase" → v_g, v_phase. One carry-over: Townsend's T = ma²/ħ is the notes' t_spread with a = √2σ (stated once, `l15-gaussian:b6`).

## 9. Engine, stage and widget gaps
**9.1 Engine** (`physics/wave.ts`; twin `claims_448/l15.py`; tests `wave15.test.ts`): `groupVelocity(k, m)` = ħk/m, `phaseVelocity(k, m)` = ħk/2m, `pairEnvelopeSpeed(k1, k2, m)` = (ω₂ − ω₁)/(k₂ − k₁), `pairCarrierSpeed(k1, k2, m)` = ω̄/k₀, `omegaSecond(m)` (ω″ by a central difference of L14's `omegaFree`), `spreadScale(σ, m)` = 2mσ²/ħ, `momentumTail(psi, g)` (weight at p < 0), `crestSpeed(p, m)` (tracked first maximum of Re ψ at two times). `constants.ts`: `groupSpeedFromWavelength(m, λ)` = h/(mλ). Reused: `packet`, `freeEvolve`, `translate`, `meanX`, `meanP`, `spreadX`, `spreadP`, `peakDensity`, `planeSamples` (two waves and tracked fringes), `momentumDensity`, `deBroglie`, `spreadTime`, `YEAR_S`.
**9.2 Stage contract.** None new: every picture is `wavefunction` (fields `source`, `time`, `shift`, `window`, `panels`, `show`, `readouts` all exist), `plot` with L14's `freeOmega` and `linearOmega`, `clocks`. The momentum panel with `show: ['density','phase']` draws the phase band (checked in `WavefunctionScene.tsx`). The non-dispersive picture uses `shift` as a stand-in for ω = ck (exact for components with k > 0; the packet's weight below 0 is under 10⁻⁸).
**9.3 Widgets.** None (Q5 of P-L14: `wave-lab` would serve units 3–6 best).

## 10. Media
None (optional film "a packet spreads": every sample from `freeEvolve`).

## 11. Hooks
**Concept map:** `free-states` (l15-free-eigenstate; needs `tise`) · `evolve-components` (l15-packet-evolution; needs `free-states`, `momentum-space`) · `group-velocity` (l15-group-velocity; needs `evolve-components`) · `dispersion-spreading` (l15-dispersion; needs `group-velocity`) · `gaussian-spreading` (l15-gaussian; needs `dispersion-spreading`, `commutator-bases`).
**Arcade:** Spot the error: `l15-packet-evolution` ("the momentum spread grows as the packet spreads"), `l15-group-velocity` ("the particle moves at the phase velocity ω/k"), `l15-gaussian` ("a narrower packet spreads more slowly"), `l15-dispersion` ("a packet with ω = ck spreads like a free particle"). A "Squeeze and wait" game (drag σ, read t_spread) is possible later; it needs a game type, so it is deferred like L13's.
**Go further in 709:** `sl-q3-uncertainty` (exists, reused in `l15-gaussian:b1`); no new row.

## 12. Fidelity notes
`wavefunction`: ψ is an amplitude along a line, Re/Im and density on different scales; the `shift` stand-in for linear dispersion is exact for k > 0 components; the two-wave pictures are periodic, not packets (the notes say so); the phase band is a code for an angle. `plot` of ω(k): exact in ħ = m = 1.

## 13. Builder estimate and order
One builder, **≈ 120 steps** (≤ 170): engine and twin 20, 6 units' story/values/review/glossary 60, concept map and arcade 8, claim keys moved from L13 (the L14 builder trims them: `l13FreeMean2` and the three fringe keys) 4, tests and gate 18, relay 4. Order: after L14 merges.

## Questions for the judge (recommendation first)
1. **`spreading-time` is defined twice** (here at `l15-gaussian:b3`, in P-L16 at `l16-evolve:b1`). *Recommend L15 owns the gloss* (first in reading order); L16 links back and adds the exact reading. Example 6.4's SI numbers, `l13FreeSd2/4` and Ehrenfest all go to L16 (agreed in both plans).
2. **Two-wave fringes moved from `l13-schrodinger:b8`.** *Recommend move:* they are the notes' §15.4 envelope.
3. **Stand-in for linear dispersion** (`shift` field, exact to 10⁻⁸ for the Gaussian with p₀ = 1.5) rather than a new stage option. *Recommend approve.*
4. **Chirp caveat in words only, and the word.** *Recommend yes:* a chirp needs a new source field (ψ·e^{−iαx²}), and P-L16 owns the gloss `chirp` and its first use (`l16-spread:b8`); L15 never links it.
5. **p₀ = 1.5 for the width demos** (window wrap, see Evidence) while the notes' arithmetic needs no p₀. *Recommend keep.*
6. **L15 practice is 3** (HW7 Gaussian type, Townsend 6.6 and 6.4); no Townsend or homework problem is about group velocity, so its challenges are ordinary ones. *Recommend accept.*
