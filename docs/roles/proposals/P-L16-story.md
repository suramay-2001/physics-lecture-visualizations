# P-L16 — Lecture 16 story plan: Gaussian packets and Ehrenfest

Role P, proposal only (nothing under `app/` is touched). One track (448), sentence cap 25 words, symbols before use. Format: `P-L13-story.md`; skill `skills/03-chapter-plan`.
Siblings: `P-L17-story.md` (classical mean motion, the step, probability current), `P-L18-story.md` (packets at a step, E < V₀, tunnelling); the parallel L14–L15 plan owns the Schrödinger equation, stationary states, free particles, group velocity and dispersion. Numbers: `planL16L18-numpy.py` (scratchpad; own FFT, eigen-decomposition, Crank–Nicolson; 170 values, every assert passes, two runs byte-identical).

**Sources read.** Notes `sources/L16/text.md` pp. 1–11 (page images checked: pp. 4 and 9; the text layer is exact). Neighbours: L15 §15.5–15.6 (the Gaussian preview: "full solution and Ehrenfest belong in Lecture 16"), L17 §17.1–17.2 and App. A (they finish 16.6). Townsend 2e Ch. 6 via `digest-G4.md`: §6.6 pp. 204–210 (Eqs. 6.58–6.77, Ex. 6.2–6.4), §6.3 pp. 197–200 (Eqs. 6.33–6.36), Problems 6.1, 6.4, 6.6. Susskind & Friedman Lecture 9 §9.4, §9.6, §9.7 (cite by section: the extract has no printed pages). Homework types: HW7 P1 (Gaussian minimum-uncertainty packet), HW6 P4 (one spin under H = ħωZ/2).
**Conventions.** As P-L13: ħ = m = 1, ℓ, ħ/ℓ, mℓ²/ħ; Δx = σ, Δp = ħ/2σ; claim keys `l16…`; a moved beat keeps its `l13…` keys. Notes' τ = ħt/2mσ² = t/t_s, t_s = 2mσ²/ħ ("spreading time"); Townsend's T = ma²/ħ with a = √2 σ is the same time (Rosetta in `l16-spread:b6`).

## Ownership (decisions proposed; the judge rules)
| item (today) | proposal | why |
|---|---|---|
| `l13-schrodinger:b6` (Townsend §6.6 spreading, electron and marble times) and clue `b7` (Δx at t = 2, 4); keys `l13FreeDp4`, `l13SpreadElectron*`, `l13SpreadMarble*`, `l13FreeSd2`, `l13FreeSd4`; challenge `l13-sc-sd`, `l13-sc-electron` | **move to L16** (`l16-spread:b6`, clue `b7`; challenges keep their ids). L13 keeps one pointer sentence appended to `l13-schrodinger:b5`: "Exactly how wide a free packet gets: Lecture 16." | L15 gives only the qualitative spreading and the scaling t_spread ~ 2mσ²/ħ and defers the exact Δx(t) to L16 (L15 pp. 9–11). The notes of L16 derive it. |
| `l13-time:b6a` (Townsend §6.3, momentum conserved iff H commutes with p̂, d⟨p⟩/dt = −⟨V′⟩ = −2); key `l13EhrenfestDpDt`; challenge `l13-ti-ehren` | **move to L16** (`l16-ehrenfest:b5`; challenge id kept). Pointer in L13: none needed (`l13-time:b5` stands without it). | L16 §16.5 derives both Ehrenfest equations; L13 only quotes them. |
| `l12-law:b7b` (rate law d⟨A⟩/dt = (i/ħ)⟨[H, A]⟩, Townsend §4.2, derivation, key `l12TRateLaw`) | **stays in L12** (recommendation); L16 opens with a link-back beat and adds only what is new (the cancellation argument, then x̂ and p̂). One-word edit in L12: "Lecture 13 uses this law" → "Lecture 16". | The L12 notes do not teach the law, but the Townsend pass built it there with spin views and L13 `b6b` cites "Unit 12.1". A second derivation would be the duplicate the skill forbids; moving it costs edits in two built lectures for no new teaching. (Alternative in Q2.) |
| `l13-stationary` (box, nodes, quantised energies) | not mine: the L14–L15 plan takes it (L14 §14.5). L16 uses it only by name. | |
| `l13-flow` (current, step, barrier, Correction p. 231) | to L17 (current, step above V₀) and L18 (below the step, barrier, Correction): see those plans. | |
Claim keys stay stable; each moved key is deleted from `L13.values.ts` in the same commit that adds it to `L16.values.ts` (`mergeValues` throws on a duplicate). Their numpy twins in `claims-448/g4*.json` stay; the glob in `claims.test.ts` finds them.

## 0. Lecture map
| # | id | Title (≤ 8 words) | Question | Notes | Books |
|---|---|---|---|---|---|
| 1 | `l16-start` | A Gaussian packet to evolve | Which numbers fix the packet, and what does free evolution leave alone? | pp.2–3 (§16.1–16.2) | Townsend §6.6 pp.204–207, Ex. 6.2 |
| 2 | `l16-evolve` | The free Gaussian at time t | What is ψ(x, t) exactly? | pp.4–5 (§16.3) | Townsend §6.6 pp.208–209 (6.73–6.76) |
| 3 | `l16-spread` | Moving, spreading, and the uncertainty bound | What do the centre, the width and ΔxΔp do? | pp.5–6 (§16.4), p.11 | Townsend Ex. 6.4 p.209 (6.77) |
| 4 | `l16-ehrenfest` | The centre obeys Ehrenfest's equations | How does an average change, and what do ⟨x⟩ and ⟨p⟩ obey? | pp.7–8 (§16.5), p.11 (§16.7) | Townsend §6.3 pp.199–200 (6.33–6.34), Problem 6.1; Susskind §9.4, §9.6 |
**Class markers.** Optional opener lede "Class 16: Gaussian packets and Ehrenfest." **§16.6** (when the mean motion is classical) is *not* taught in Class 16 (L17 notes p. 2, p. 12): it is Lecture 17's Unit 17.1, so L16 ends on the two Ehrenfest equations and a one-beat handoff.
**Ownership inside.** L15 owns group velocity and the qualitative spreading; L16 owns ψ(x, t), Δx(t), t_s, the width-versus-uncertainty reading, the chirp remark, and Ehrenfest's two equations. L12 owns the rate law (link-back). L17 owns ⟨F⟩ ≠ F(⟨x⟩).
**Counts.** 4 units, **27 beats** (6 + 6 + 8 + 7), 4 clues, 4 books beats, 3 moved beats (`l16-spread:b6`, `b7`, `l16-ehrenfest:b5`), 2 link-backs, 4 derivations, 1 Go-deeper beat; 16 challenges (3 moved) + 4 practice questions. Outcomes: (1) say what x₀, p₀, σ, Δp mean for the packet and why |φ(p, t)|² never changes; (2) write the exact ψ(x, t) and check it at t = 0; (3) read the centre, Δx(t) and t_s from it, and say why ΔxΔp ≥ ħ/2 is not what makes it spread; (4) derive d⟨x⟩/dt = ⟨p⟩/m and d⟨p⟩/dt = −⟨V′⟩ from the rate law.

## 1. Story beats (W = `wavefunction`; PK(x0,σ,p0); phases L lecture · B books · C clue · D deeper)
### Unit 1 `l16-start` — A Gaussian packet to evolve
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.2 | **Link back to L15** (`Unit 15.x`, by name): a free particle's momentum amplitudes only get phases, so |φ(p, t)|² is fixed. Yet a localised atom, force removed, can change its position distribution. Pose the two questions: how much spreading, and how can the distribution change with no force. | `W(PK(0,1,3),{panels:['position','momentum']})` | — |
| b2 | L | p.2 | Two kinds of change: the centre can move (it has ⟨p⟩ ≠ 0), and the packet can spread even when ⟨p⟩ = 0. A force is not needed for spreading; a force would change the average momentum. | `W(PK(0,1),{time:sweep(0,4),panels:['position','momentum'],readouts:['xmean','xspread','pspread']})` | `l16DpFixed` Δp(4) − Δp(0) = 0 |
| b3 | L | p.3 | Start from the L15 Gaussian ψ(x, 0) = (2πσ²)^{−1/4} e^{−(x−x₀)²/4σ²} e^{ip₀(x−x₀)/ħ}. Density: a Gaussian of width σ about x₀; ⟨x⟩ = x₀, Δx = σ, ⟨p⟩ = p₀ (the phase). The Fourier transform (your homework) is a Gaussian too: Δp = ħ/2σ, ΔxΔp = ħ/2. Do not redo it. | `W(PK(0,1,3),{panels:['position','momentum'],readouts:['xspread','pspread','product']})` | `l16Dp1` 0.5 · `l16Product0` 0.5 · `l16Peak0` 0.399 |
| b4 | L | p.3 | What changes? φ(p, t) = φ(p, 0)e^{−ip²t/2mħ}: only phases, so the momentum chances, centre p₀ and width Δp stay exactly as they were. What changes is how the momenta interfere when recombined in position space. | `W(PK(0,1,3),{time:sweep(0,4),panels:['position','momentum'],show:['density']})` | `l16DpFixed` (shared) |
| b5 | B | — | Townsend §6.6 pp.204–207 (6.59)–(6.72): the same transform with his a = √2σ (Unit 13.4's Rosetta, no new line); p.208 Ex. 6.3 and Problem 6.6: a real wavefunction has ⟨p⟩ = 0 and a phase e^{ip₀x/ħ} shifts ⟨p⟩ by p₀. | `W(PK(0,1,3),{panels:['position','momentum']})` | — |
| b6 | C | p.2 | Q: p₀ = 0 but Δp > 0: must ⟨x⟩ move? → R: No. ⟨x⟩ stays at x₀ (0 at t = 4) while Δx grows to 2.24. | `W(PK(0,1),{time:0,show:['density'],readouts:['xmean','xspread']})` → reveal `time:4` | `l16CentreStays` 0 · `l16Dx4P0` 2.236 |

### Unit 2 `l16-evolve` — The free Gaussian at time t
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.4 | The only new step is recombining the components: ψ(x, t) = (N_p/√2πħ)∫dp exp[−σ²(p−p₀)²/ħ² + ip(x−x₀)/ħ − ip²t/2mħ]. Write q = p − p₀, X = x − x₀ − p₀t/m, τ = ħt/2mσ² = t/t_s with the **spreading time** t_s = 2mσ²/ħ (gloss `spreading-time`). | `W(PK(0,1,3),{time:0})` | `l16Ts1` t_s = 2 |
| b2 | L | p.4 | Collect terms: the integral is ∫dq e^{−Aq²+Bq} with A = σ²(1 + iτ)/ħ², B = iX/ħ (**D1**). The Gaussian identity (supplied, not derived) gives √(π/A)e^{B²/4A}. X already hints at a centre moving at p₀/m. | `W(PK(0,1,3),{time:0})` → `W(PK(0,1,3),{time:2,panels:['position','momentum']})` | — |
| b3 | L | p.4 | The result: ψ(x, t) = (2πσ²)^{−1/4}(1 + iτ)^{−1/2} exp[−X²/4σ²(1 + iτ)] exp[(i/ħ)(p₀(x−x₀) − p₀²t/2m)]. At t = 0, τ = 0 and it is the initial state; the complex factor 1 + iτ changes the width and the phase. Check: the formula and the grid evolution agree. | `W(PK(0,1,3),{time:sweep(0,4),show:['re','im','density']})` | `l16FormulaGap` ≤ 1e−8 (formula vs `freeEvolve`, t = 1, 2, 4; a check, not shown) · `l16FormulaT0Gap` = 0 |
| b4 | B | — | Townsend §6.6 pp.208–209 (6.73)–(6.76), Problem 6.4(a): his form 1/√(√π[a + iħt/ma]) e^{−x²/2a²[1+iħt/ma²]}; with a = √2σ it is ours (1 + iħt/ma² = 1 + iτ). | `W(PK(0,1,3),{time:2})` | `l16TownsendGap` ≤ 1e−8 (his (6.76) against ours) |
| b5 | L | p.5 | What a detector sees is |ψ|², not ψ: the carrier phase drops out and only 1 + iτ matters. So the t = 0 check (τ = 0 gives back the initial state) and the meaning of t_s are what to keep from the formula. | `W(PK(0,1,3),{time:sweep(0,4),show:['density']})` | — |
| b6 | C | p.4 | Q: for p₀ = 3, where is the centre of |ψ|² at t = 2? → R: X = 0 there, x = x₀ + p₀t/m = 6 ℓ. | `W(PK(0,1,3),{time:0,show:['density']})` → reveal `time:2` | `l16Mean2` 6 |

### Unit 3 `l16-spread` — Moving, spreading, and the uncertainty bound
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.5 | Take the modulus squared: |1 + iτ| = √(1 + τ²), Re[1/(1 + iτ)] = 1/(1 + τ²). The density is a normalised Gaussian at every time: |ψ|² = e^{−X²/2σ²(1+τ²)}/(√2π σ√(1 + τ²)). The peak falls as 1/√(1 + τ²) while the area stays 1. | `W(PK(0,1,3),{time:sweep(0,4),show:['density'],readouts:['xmean','xspread','peak']})` | `l16Peak0` 0.399 · `l16PeakTs` 0.282 · `l16Norm4` 1 |
| b2 | L | p.5 | Read off the centre ⟨x⟩ = x₀ + p₀t/m and the width Δx(t) = σ√(1 + (t/t_s)²) (**D2**). At t = t_s it is √2σ; for t ≫ t_s, Δx → ħt/2mσ = Δp t/m: L15's velocity-spread estimate, now exact. | `W(PK(0,1,3),{time:sweep(0,4),readouts:['xspread']})` → `PLOT packetWidth` | `l13FreeSd2` √2 (moved key, t = t_s = 2) · `l13FreeSd4` √5 (moved) · `l16FarRatio` 1.005 (Δx at t = 20 over Δp t) |
| b3 | L | p.5 | Narrower packets spread sooner and wider: t_s ∝ σ². At t = 2 the σ = 1 packet has Δx 1.414, the σ = ½ packet 2.062; the two widths are equal, 1.118, at t = 1. | `W(PK(0,sweep(1,0.5)),{time:2,readouts:['xspread']})` | `l16Dx05T2` 2.062 · `l16DxCross` 1.118 (t = 1) |
| b4 | L | p.6 | No contradiction with uncertainty: Δp is fixed, so ΔxΔp = (ħ/2)√(1 + (t/t_s)²) ≥ ħ/2. The initial Gaussian saturates the bound; later the phases carry position–momentum correlations (the product is larger). | `W(PK(0,1,3),{time:sweep(0,4),panels:['position','momentum'],readouts:['xspread','pspread','product']})` | `l16ProductTs` 0.7071 · `l16Product4` 1.118 |
| b5 | L | p.6 | Avoid the slogan "the uncertainty principle makes the particle spread". The relation constrains the initial state; the Hamiltonian governs the evolution. Nothing random or lost was added: the area stays 1. | `W(PK(0,1,3),{time:sweep(0,4),readouts:['norm','xspread']})` | `l16Norm4` (shared) |
| b6 | B | — | Townsend Ex. 6.4 p.209 (6.77): Δx = (a/√2)√(1 + ħ²t²/m²a⁴); spreading time T = ma²/ħ **= t_s with a = √2σ**: 10⁻¹⁶ s for an electron with a = 10⁻⁸ cm, 10²⁵ s (3 × 10¹⁷ years) for 1 g with a = 1 mm; a smaller a spreads faster; ⟨p⟩ distribution never changes. [Moved from `l13-schrodinger:b6`.] | `PLOT packetWidth` | moved: `l13SpreadElectronMant` 8.6 · `l13SpreadMarbleMant` 9.5 · `l13SpreadMarbleYearsMant` 3.0 · `l13SpreadElectronLog10` −16.06 · `l13FreeDp4` 0.5 |
| b7 | C | p.5 | Q: does a free packet keep its width? → R: No: Δx 1.41 at t = 2, 2.24 at t = 4, Δp stays 0.5. [Moved from `l13-schrodinger:b7`.] | `W(PK(0,1,3),{time:0,readouts:['xspread']})` → reveal `time:4` | `l13FreeSd2`, `l13FreeSd4` |
| b8 | D | p.11 | **Go deeper (notes' optional extension; ask-if-a-student-asks).** For any free packet (Δx_t)² = (Δx₀)² + 2tC_xp/m + t²(Δp)²/m², with C_xp = ½⟨(x̂ − ⟨x⟩)(p̂ − ⟨p⟩) + (p̂ − ⟨p⟩)(x̂ − ⟨x⟩)⟩. An unchirped Gaussian has C_xp = 0, so it only widens; with C_xp < 0 a packet narrows first. Example: ψ e^{iβx²}, β = −0.2: Δp = 0.640, C_xp = −0.4, narrowest 0.781 at t = 0.976, back to 1.0 at t = 1.95. Bridge: a spread of phases refocusing is the spin echo, <<sl-q24-decoupling\|Go further in 709: undoing dephasing>>. | `PLOT packetWidth vs packetWidthChirp` | `l16ChirpDp` 0.640 · `l16ChirpFocusTime` 0.976 · `l16ChirpMinWidth` 0.781 · `l16ChirpDxBack` 1.000 (t = 1.95) |

### Unit 4 `l16-ehrenfest` — The centre obeys Ehrenfest's equations
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.7 | **Link back to L12** (`l12-law`, the rate law d⟨A⟩/dt = (i/ħ)⟨[H, A]⟩, defined there; Rosetta: the notes add ∂Â/∂t only when Â depends on t). The notes' reading: bra and ket evolve with conjugate phases; if Â commutes with Ĥ the two contributions cancel and ⟨A⟩ is constant. Now apply it to x̂ and p̂. | `W(PK(2,1,1.5),{time:sweep(0,2),readouts:['xmean','pmean']})` | — |
| b2 | L | p.8 | First equation. With Ĥ = p̂²/2m + V(x̂) and [x̂, p̂] = iħ: [V(x̂), x̂] = 0, and [p̂², x̂] = p̂[p̂, x̂] + [p̂, x̂]p̂ = −2iħp̂ (**D3**). So d⟨x⟩/dt = ⟨p⟩/m, exact for every state, not only a Gaussian. | `W(PK(2,1,1.5),{time:sweep(0,2),readouts:['xmean','pmean']})` → `…overlay:['ppsi']` | `l16EhrenfestDxdt` 1.5 (the commutator ⟨[Ĥ, x̂]⟩ on the grid, V = x²/2, packet at 2 with p₀ = 1.5, equals ⟨p⟩/m) |
| b3 | L | p.8 | Second equation. Kinetic energy commutes with p̂, so [Ĥ, p̂] = [V(x̂), p̂]. On a test function f: [V, p̂]f = V(−iħf′) − (−iħ)(Vf)′ = iħV′f, so [V, p̂] = iħV′(x̂) and d⟨p⟩/dt = −⟨V′⟩ = ⟨F(x̂)⟩ (**D4**). | `W(PK(2,1),{overlay:['ppsi']})` → `W(PK(2,1),{overlay:['xpsi']})` | `l16EhrenfestDpdt` −2 (commutator route, V = x²/2) = `l13EhrenfestDpDt` −2 (−⟨V′⟩ route, moved key) |
| b4 | L | p.8 | These two are **Ehrenfest's theorem**: they look like Newton's laws for the average position and momentum. Check on L16's own Gaussian: V = 0 gives d⟨p⟩/dt = 0 and ⟨x⟩ = x₀ + p₀t/m, as in Unit 16.3 (grid ⟨x⟩ minus x₀ + p₀t at t = 4 is 0). Whether ⟨F⟩ equals F(⟨x⟩) is not yet decided: Lecture 17. | `W(PK(0,1,3),{time:sweep(0,4),readouts:['xmean','pmean']})` | `l16EhrenfestFreeGap` ≤ 1e−8 · `l16FreeMeanP4` 3 |
| b5 | B | — | Townsend §6.3 pp.199–200 (6.33)–(6.34): his derivation, Problem 6.1 (induction on [xⁿ, p̂], then [F(x), p̂] = iħF′). Momentum is conserved exactly when Ĥ commutes with p̂, i.e. V does not depend on x: the spatial twin of energy conservation. For V = x²/2 and a packet at 2: d⟨p⟩/dt = −2. Susskind §9.4, §9.6 reach the same two equations. [Moved from `l13-time:b6a`.] | `W(PK(2,1),{overlay:['ppsi']})` | moved `l13EhrenfestDpDt` −2 |
| b6 | L | p.11 (§16.7) | What to retain (the notes' four lines): ⟨x⟩ₜ = x₀ + p₀t/m; Δx(t) = σ√(1 + (t/t_s)²); d⟨x⟩/dt = ⟨p⟩/m; d⟨p⟩/dt = −⟨V′⟩. One state, one Hamiltonian: both the motion and the spreading. Exit: the centre moves like Newton, but the force Newton uses is not yet the average force. | `W(PK(0,1,3),{panels:['position','momentum'],time:sweep(0,4)})` | — |
| b7 | C | p.8 | Q: for a free particle (F = 0) the packet widens. What does the second equation say about ⟨p⟩? → R: it stays 3 forever: widening is not momentum change. | `W(PK(0,1,3),{time:0,readouts:['pmean','xspread']})` → reveal `time:4` | `l16FreeMeanP4` (shared) |

## 2. Derivations (one track; ≥ 2 distinct views; kinds already on the unit's stage: `wavefunction`, `plot`)
- **D1 `l16-evolve:b2`** result `\psi(x,t) = \tfrac{N_p}{\sqrt{2\pi\hbar}}e^{\frac{i}{\hbar}[p_0(x-x_0)-p_0^2t/2m]}\int dq\,e^{-Aq^2+Bq}`: (1) `\psi(x,t) = \tfrac{N_p}{\sqrt{2\pi\hbar}}\int dp\,e^{-\sigma^2(p-p_0)^2/\hbar^2}e^{ip(x-x_0)/\hbar}e^{-ip^2t/2m\hbar}` view W t = 0 — "initial amplitudes times the free phase"; (2) put `p = p_0 + q` — "centre the integral on the average momentum"; (3) collect the exponent: `-\tfrac{\sigma^2}{\hbar^2}(1+i\tau)q^2 + \tfrac{iX}{\hbar}q + \text{phase}`, view W t = 2; (4) name `A`, `B`: the result.
- **D2 `l16-spread:b2`** result `\Delta x(t) = \sigma\sqrt{1+(t/t_s)^2}`: (1) `|\psi|^2 = \tfrac{e^{-X^2/2\sigma^2(1+\tau^2)}}{\sqrt{2\pi}\,\sigma\sqrt{1+\tau^2}}` view W; (2) compare with `e^{-X^2/2s^2}/\sqrt{2\pi}s` — "a Gaussian is read by its exponent"; (3) `s^2 = \sigma^2(1+\tau^2)`, view PLOT packetWidth; (4) result; `t\gg t_s`: `\Delta x\to\hbar t/2m\sigma`.
- **D3 `l16-ehrenfest:b2`** result `\tfrac{d}{dt}\langle x\rangle = \langle p\rangle/m`: (1) `[\hat H,\hat x] = \tfrac{1}{2m}[\hat p^2,\hat x]` — "V(x̂) commutes with x̂" view W; (2) `[\hat p^2,\hat x] = \hat p[\hat p,\hat x]+[\hat p,\hat x]\hat p` (rule `[AB,C]=A[B,C]+[A,C]B`); (3) `= -2i\hbar\hat p`, view W overlay ppsi; (4) `\tfrac{d}{dt}\langle x\rangle = \tfrac{i}{\hbar}\langle[\hat H,\hat x]\rangle = \langle p\rangle/m`.
- **D4 `l16-ehrenfest:b3`** result `\tfrac{d}{dt}\langle p\rangle = -\langle V'(\hat x)\rangle`: (1) `[\hat H,\hat p] = [V(\hat x),\hat p]` — "p̂²/2m commutes with p̂" view W ppsi; (2) `[V,\hat p]f = V(-i\hbar f') - (-i\hbar)(Vf)'`; (3) `(Vf)' = V'f + Vf'`, view W xpsi; (4) `= i\hbar V'f`, so `\tfrac{d}{dt}\langle p\rangle = \tfrac{i}{\hbar}\langle i\hbar V'\rangle = -\langle V'\rangle`.

## 3. Try-it per unit (existing widgets only; `wave-lab` still deferred, R7)
| unit | widget spec | try this |
|---|---|---|
| start | `{kind:'complex-plane', props:{mode:'multiply', z:[0.8,0], w:[0.6,-0.8]}}` (a stand-in: a phase turns a number, its size stays) | 1. The arrow turns but keeps its length: a free phase leaves |φ(p, t)|² alone. · 2. A distribution changes only when different arrows turn by different angles. |
| evolve | `{kind:'complex-plane', props:{mode:'multiply', z:[1,0], w:[0.7071,0.7071]}}` | 1. 1 + iτ at τ = 1 has length √2 and angle 45°: the width factor. |
| spread | `{kind:'two-clocks', props:{upper:3, lower:1, start:'+x'}}` (stand-in for components with different phase rates) | 1. Two hands with different speeds fall apart: that is spreading. |
| ehrenfest | `{kind:'bloch', props:{state:'+x'}}` (a stand-in: it draws a spin, not a packet; say so in the caption) | 1. Turn it about z: the average ⟨S⟩ follows a classical arrow exactly, because the spin Hamiltonian is linear in S. Unit 17.1 says when a packet does the same. |

## 4. Challenges (keys from the engine; hints nudge → key idea → setup; no homework is open: HW6/HW7 are submitted, `homework-status.md`)
- **start**: `l16-st-dp` warm-up numeric Δp for σ = ½ → 1 · `l16-st-fixed` core choice: "|φ(p, t)|² of a free packet changes with t" → false ✓ · `l16-st-centre` core numeric ⟨x⟩ at t = 3 for x₀ = 1, p₀ = 0 → 1.
- **evolve**: `l16-ev-ts` warm-up numeric t_s for σ = 1.5 (ħ = m = 1) → 4.5 · `l16-ev-centre` core numeric the centre at t = 2 for p₀ = 3, x₀ = 1 → 7 · `l16-ev-order` core order D1.
- **spread**: `l16-sp-dx` warm-up numeric Δx at t = t_s for σ = 2 → 2.828 · `l16-sp-peak` core numeric the peak density at t = t_s for σ = 1 → 0.282 · `l13-sc-sd` (moved) · `l13-sc-electron` (moved) · `l16-sp-prod` core numeric ΔxΔp at t = 2t_s for σ = 1 → 1.118 · `l16-sp-which` core choice: "the uncertainty principle forces the packet to spread" → false ✓.
- **ehrenfest**: `l16-eh-dx` warm-up numeric d⟨x⟩/dt for ⟨p⟩ = 1.5, m = 1 → 1.5 · `l13-ti-ehren` (moved; stretch) · `l16-eh-order` core order the four steps of D3 · `l16-eh-which` core choice: "Ehrenfest's equations hold only for Gaussian packets" → false ✓.
**Practice (T1; walkthroughs in full; HW6/HW7 submitted):**
- `l16-pr-width` core, `practice: 'homework'` (HW7 P1 type, new numbers): a packet with σ = 0.5 and p₀ = 2 (ħ = m = 1): ⟨p²⟩ from |φ|² and the mean kinetic energy ⟨p̂²⟩/2m → 2.5 (key `l16PrKinetic`; ledger two routes: closed form and grid).
- `l16-pr-double` stretch, `practice: 'townsend'` (Problem 6.4 type, `refs`: Problem 6.4, p. 238): an electron packet with σ = 0.5 nm: after how many femtoseconds has Δx doubled? → √3 t_s = 7.48 fs (`l16PrDoubleFs`; tolerance 0.02 for three significant figures).
- `l16-pr-quartic` core, `practice: 'townsend'` (Problem 6.1 type): V = x⁴/4, Gaussian packet at x₀ = 1, σ = ½, p₀ = 0: d⟨p⟩/dt → −1.75 (`l16PrQuarticDpdt`, the commutator on the grid equals −⟨x³⟩ = −(x₀³ + 3x₀σ²); also shown: the force at the centre is −1, set up for Unit 17.1).
- `l16-pr-spin` warm-up, `practice: 'homework'` (HW6 P4 type): H = ħωZ/2, start |+x⟩: use d⟨X⟩/dt = (i/ħ)⟨[H, X]⟩, not the solution, to find d⟨X⟩/dt at ωt = π/3 in units of ω → −0.866 (`l16PrSpinDXdt`).

## 5. Glossary (new 448 ids; no duplicates with the 280 existing ids or the L14–L15 plan)
| id | term | gloss (≤ 25 words) | first |
|---|---|---|---|
| `spreading-time` | spreading time t_s | The time 2mσ²/ħ after which a free Gaussian packet has grown to √2 times its starting width; narrower packets have shorter t_s. | l16-evolve:b1 |
| `ehrenfest-theorem` | Ehrenfest's theorem | The averages obey d⟨x⟩/dt = ⟨p⟩/m and d⟨p⟩/dt = ⟨F⟩: Newton-like laws for the centre, exact for any state. | l16-ehrenfest:b4 |
| `chirp` | chirp, position–momentum correlation | A packet whose momentum depends on position (C_xp ≠ 0); with C_xp < 0 it narrows before it spreads. | l16-spread:b8 |
Reused: `wave-packet`, `plane-wave`, `momentum-wavefunction`, `wavefunction`, `variance`, `constant-of-motion` (L12), `commutator`. `gaussian-packet` and `group-velocity`: owned by the L14–L15 plan (L15 §15.6 introduces the Gaussian); if that plan does not define `gaussian-packet`, `l16-start:b3` defines it (one id, never two).

## 6. Review cards
- **start**: the packet is fixed by x₀, p₀, σ; Δp = ħ/2σ; free evolution multiplies φ(p) by a phase · eq `\Delta x\,\Delta p = \hbar/2` · trap: thinking a phase changes the momentum chances.
- **evolve**: ψ(x, t) with the factor 1 + iτ; t = 0 check · eq `\psi(x,t) = \tfrac{1}{(2\pi\sigma^2)^{1/4}\sqrt{1+i\tau}}\,e^{-X^2/4\sigma^2(1+i\tau)}\,e^{i[\dots]}` · trap: dropping the 1 + iτ in the width.
- **spread**: centre x₀ + p₀t/m, width σ√(1 + (t/t_s)²), Δp fixed, ΔxΔp ≥ ħ/2 · eq `\Delta x(t) = \sigma\sqrt{1+(t/t_s)^2}` · trap: "the uncertainty principle makes it spread".
- **ehrenfest**: the rate law with x̂ and p̂ gives Newton-like laws for averages · eq `\tfrac{d}{dt}\langle x\rangle = \tfrac{\langle p\rangle}{m},\ \tfrac{d}{dt}\langle p\rangle = -\langle V'\rangle` · trap: replacing ⟨V′⟩ by V′(⟨x⟩) (Unit 17.1).

## 7. Symbol-before-use (first beat)
x₀, p₀, σ, Δx, Δp: L15/L13 (mapped to `l16-start:b3`) · ψ(x, 0), φ(p, t): l16-start:b3–b4 (φ is the notes' momentum amplitude, written ψ̃ in L13: one Rosetta line in b3) · q, X, τ, t_s, A, B, N_p: l16-evolve:b1–b2 · ⟨x⟩ₜ, Δx(t): l16-spread:b2 · C_xp, β: l16-spread:b8 · V(x̂), F, ⟨F⟩, [·,·]: L12/L13, `l16-ehrenfest:b2–b3`.

## 8. Errata (page images checked: p. 4, p. 9; every formula recomputed, no Correction box)
Recomputed and holding: ψ(x, t) of §16.3 against FFT evolution (gap 9e−10), Δx(t), t_s, ΔxΔp, the variance formula of p. 11 (a chirped packet, three times), both Ehrenfest equations (commutator on the grid), Townsend (6.76)–(6.77) and Ex. 6.4 (8.64e−17 s; 9.48e24 s = 3.00e17 yr).
1. **Footers (L17 pp. 1–12)** read "n / ??" (an unresolved LaTeX reference; L16's own read "n / 11"); not content.
2. **§16.6 pp. 9–10 is carried into Lecture 17** by the instructor's own record (L17 p. 12); L16 does not teach it (Ownership).
3. **Overlap.** §16.5 re-derives the rate law the Townsend pass already built in `l12-law:b7b`: handled as a link-back (Ownership; Q2).
4. **Notation.** The notes' momentum amplitude ϕ(p, t) is ψ̃ in L13; Townsend's width a is √2σ; Townsend writes p_x. One line each in `l16-start:b3`, `l16-evolve:b4`, `l16-ehrenfest:b5`.

## 9. Engine, stage and widget gaps
**9.1 Engine** (`physics/wave.ts`, tests + numpy twin `pipeline/claims_448/l16.py` → `__fixtures__/claims-448/l16.json`, a different route each): `gaussianExact(g, {x0, sigma, p0}, t, m)` (the §16.3 closed form on the grid; twin: the same formula in numpy complex arithmetic against `np.fft` evolution); `chirpPacket(g, {x0, sigma, p0, beta})` and `covarianceXP(psi, g)` (C_xp, twin: dense operators); `chirpWidth(sigma, beta, t)` (closed form; twin: FFT evolution); `commutatorRate(psi, g, Vx, 'x' | 'p')` = i⟨[Ĥ, Â]⟩ with the spectral p̂ (twin: finite-difference Hamiltonian matrix); the existing `freeEvolve`, `gaussianWidth`, `spreadX`, `meanP`, `spreadP`, `constants.spreadTime` (= m a²/ħ) are reused. SI: `constants.ts` electron mass and ħ. Tolerances 1e−9 (1e−8 where the 64-long periodic grid wraps: keep packets within |x| ≤ 20), 2e−3 for the chirp numbers.
**9.2 Stage contract.** No new kind and no new field. Two additive `plot` curves (tables in `stage/svg/plot.ts`, names in `PlotCurveName`; ruling T2 pattern): `packetWidth` (x = t, 0–4; y = Δx in ℓ for σ = 1, from `gaussianWidth`; label t) and `packetWidthChirp` (same axes, the σ = 1, β = −0.2 packet from `chirpWidth`); drawn as curve + `vs`. Other pictures: `wavefunction` (sources packet; fields `time`, `panels`, `overlay`, `readouts` xmean/xspread/pmean/pspread/product/peak/norm), `complex-plane` and `clocks`/`bloch` stand-ins in Try-its only.
**9.3 Widgets.** None (deferred `wave-lab`, R7); recommendation Q5.

## 10. Media / 11. Hooks / 12. Fidelity
**Media.** None (optional Motion Canvas film "a packet spreads and refocuses": every sample from `gaussianExact` and `chirpPacket`).
**Concept map:** `gaussian-evolution` (l16-evolve; needs `momentum-space`, `free-particle`) · `spreading` (l16-spread; needs `gaussian-evolution`, `uncertainty`) · `ehrenfest` (l16-ehrenfest; needs `dynamical-law`, `position-operator`).
**Arcade:** Spot the error: `l16-spread` ("the uncertainty principle makes the packet spread"), `l16-ehrenfest` ("d⟨p⟩/dt = −V′(⟨x⟩)"). **Go further in 709:** l16-spread:b8 → Q24 `q24-decoupling` (`sl-q24-decoupling`, new `bridges448.ts` row; built unit, id checked); optionally l16-ehrenfest:b1 → `sl-q24-bloch-eq` (the Bloch vector obeys a classical torque law exactly because H is linear in S; Rabi and Lindblad themselves have no honest tie to this lecture).
**Fidelity.** `wavefunction` as P-L12 §9.2 (exact samples; ψ is not a wave in space); `plot` curves are exact functions of t with the stated σ, β.

## Builder estimate and questions for the judge
**Builder (one agent, worktree, ≤ 170 steps):** ~125 steps (4 units, 27 beats incl. 3 moved, 4 derivations, 5 engine functions with twins, 2 plot curves, 14 challenges, 4 practice, edits to `L13.*` and `L12.story.ts`'s one word, one `bridges448.ts` row). Independent of L17 and L18; can run in parallel with the L14–L15 build.
1. Move `l13-schrodinger:b6/b7` and `l13-time:b6a` into L16 as above (recommended), or leave them in L13 and link back?
2. The rate law: keep `l12-law:b7b` as the owner with a link-back in L16 (recommended), or move its derivation to L16 (the notes teach it there) and leave a pointer in L12?
3. Chirp (b8) as a Go-deeper beat with two plot curves (recommended), or drop it to keep L16 to the notes' main line?
4. `gaussian-packet` / `group-velocity` ids: confirm L14–L15 defines them.
5. Build the `wave-lab` widget now (L13, L15, L16, L17, L18 all want sliders for σ, t, p₀, step and barrier) as one platform task before the builds (recommended), or keep the stand-ins?
