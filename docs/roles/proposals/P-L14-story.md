# P-L14 — Lecture 14 story plan: the Schrödinger equation, time and stationary states

Role P, proposal only (nothing under `app/` is touched). One track (448), sentence cap 25 words, symbols before use. Format: `P-L13-story.md`. Skill: `skills/03-chapter-plan`. Companion: `P-L15-story.md`
(same ownership table, §A). Beat gists are compressed notes: the builder writes each out in sentences of at most 25 words (house cap) and defines every symbol before use. Helpers reused from `L13.story.ts`: `K` (clocks), `cp`, `W` (wavefunction), `PK`, `PL`, `TW`, `BOX`; claim keys of moved beats keep their `l13…` names, new ones start `l14`.

**Sources read.** Notes `sources/L14/text.md` pp. 1–12 in full (footers read "n / 12": no unresolved references any more). Page images read: pp. 9 and 11 (the energy-shift box; the TISE and interference box), and L15 pp. 6, 10.
Books: Townsend 2e §6.8 pp. 213–218 (Eqs. 6.78–6.86, 6.96–6.98), §6.9 pp. 219–224 (6.99–6.110, Ex. 6.6), §4.6 pp. 134–136 (4.63–4.65, Ex. 4.3), §6.11 pp. 234–237 (6.150–6.155, 6.167–6.172), end-of-chapter Problems 6.13, 6.15, 6.16, 6.18 (digest `digest-G4.md`; printed = PDF − 16;
PDF 240 = printed p. 224 is an OCR-only page: the builder re-reads it on the image before citing it, ruling T6). Susskind & Friedman Lecture 9 §9.1–9.3 (no printed pages: cite by section). Homework `sl448-hw6`, `sl448-hw7` for problem TYPES only (new numbers, never the problems; both submitted, `homework-status.md`).
Built lectures read by targeted grep: `L13.story.ts`/`L13.ts` (units, beats, claim keys, practice), `L11` `l11-stationary`, `L12` `l12-law`.

**Evidence.** `planL14L15-numpy.py` (scratchpad, 91 values, every assert passes, byte-identical on a second run): route A = own numpy (4096-point FFT grid on [−32, 32), tridiagonal `eigh` for boxes, 7-point stencils, `e^{-iHt}` by eigendecomposition),
route B = closed forms, `erf`, `scipy.integrate.quad`. Independent of the repo engine. Numbers below are from it. Units: ħ = m = 1 (lengths in ℓ, momenta in ħ/ℓ, times in mℓ²/ħ); SI only where Townsend's examples are SI.

**Rosetta (one beat each).** (R7, kept) the notes' hypothetical time operator T̂ is written t̂ (`l14-time-operator:b1`). (new) the notes' V̂(ε) = e^{−iεT̂/ħ} is written W(ε) because V is the potential (as built in L13; `l14-time-operator:b2`).
(kept) the notes' ϕ(p,t) is ψ̃(p,t) (L15). φ_E(x) keeps its subscript, so it never meets the azimuth φ.

**Builder note (2026-11-06, as built under ruling M1 of `448-L14L18.md`).** The judge kept `l13-schrodinger` and `l13-time` in Lecture 13, so the built lecture has **6 units, 32 beats**: `l14-components` (5), `l14-schrodinger` (6: a recap of Unit 13.6, the proof that V multiplies, the permissions of each step, the synthesis, Townsend, clue), `l14-dispersion` (7), `l14-time` (4: a recap of Unit 13.7, Noether and the shift-then-wait check, the energy-shift argument with the clock gap and the Pauli precision, clue; the planned `l14-time-operator` was folded into it) and `l14-stationary` (7), then the books-only `l14-box` (3). Moved claim keys are renamed `l14TBox…`, `l14PrE1Ev`, `l14PrWall3` (the claim lint requires the lecture prefix), the moved practice questions are `l14-pr-box-energy` and `l14-pr-wall`, and the Optics Lab row is `qc-l14-box`. Not built: the Arcade rounds `l14-components`, `l14-dispersion`, `l14-stationary`; the group-velocity box stays for L15.

## A. Ownership (the judge rules; the L15 plan and the L16–L18 planner's plans use the same table)
Fact found: the L14 notes pick up exactly where the earlier edition of Lecture 13 numbered its §13.7 (notes p. 2). The built L13 still teaches old §13.7–13.10 (`l13-schrodinger`, `l13-time`, `l13-schrodinger:b8`) and carries the Townsend books units. `sources/L13` is the Oct-15 edition (12 pp., still has §13.7–13.10): the owner has apparently re-cut L13 to end at §13.6 (Q1).
Rule: the lecture that teaches a concept in the NOTES owns it; a one-line pointer stays in L13 ("the equation itself is Unit 14.2"). Keys and challenge ids of moved items stay unchanged.
| item built in L13 | the notes now teach it in | proposal | keys that travel |
|---|---|---|---|
| `l13-schrodinger` b1–b5 (D7, D8) | L14 §14.1–14.2 | MOVE to L14 `l14-schrodinger` (b1–b3 + books) and `l14-dispersion` (D8) | `l13SchroOk`, `l13OmegaK2`, `l13PlanePhaseDegMag` |
| `l13-schrodinger:b3` free-centre sentence | L15 §15.4 | its number goes to L15 `l15-puzzle` clue | `l13FreeMean2` → L15 |
| `l13-schrodinger:b6` (Townsend Ex. 6.4, SI spreading times) | L16 §16.3–16.4 (exact width and t_s); L15 §15.6 only gives the scaling t ~ 2mσ²/ħ | MOVE to L16 `l16-spread:b6` (P-L16 proposes the same; L15 keeps one line: T = ma²/ħ = 2mσ²/ħ) | `l13FreeDp4`, `l13SpreadElectronMant`, `l13SpreadMarbleMant`, `l13SpreadMarbleYearsMant`, `l13SpreadElectronLog10`, challenge `l13-sc-electron` → L16 |
| `l13-schrodinger:b7` clue (Δx at t = 2, 4) | L16 §16.3–16.4 (the exact width) | MOVE to L16 (`l16-spread:b7`, as P-L16 proposes) | `l13FreeSd2`, `l13FreeSd4` |
| `l13-schrodinger:b8` (optional §13.10) | L14 §14.5 (core now) and L15 §15.4 (two waves) | SPLIT: TISE and stationary → L14 `l14-stationary:b1–b3`; the p = 2, 4 fringes → L15 `l15-group-velocity:b1` | `l13FringeSpacing`, `l13FringeSpeed`, `l13FringeSpeedFormula` → L15 |
| `l13-time` b1–b5, b7 | L14 §14.3–14.4 | MOVE → `l14-time` (b1, b2) and `l14-time-operator` (b3–b5, b7 clue) | `l13FreeNorm4`, `l13FreeCommutatorOk`, `l13BoostMean`, `l13BoostSd`, `l13WpWdag`, `l13MinFreeEnergy` |
| `l13-time:b6b` (Townsend §4.6) | L14 §14.3 | MOVE → `l14-time:b4` | `l13TTimeBound`, `l13TAmmDtRatio` |
| `l13-time:b6a` (Ehrenfest, V = x²/2) | L16 §16.5 | MOVE to L16 (`l16-ehrenfest:b5`, as P-L16 proposes) | `l13EhrenfestDpDt` |
| old l13-stationary b1 (projection) | L14 §14.5 | FOLD into `l14-stationary:b2` and `l14-schrodinger:b5` (refs) | none |
| old l13-stationary b2 (oscillating vs exponential) | L14 §14.5 | MOVE → `l14-stationary:b6` | `l13TBoxNodes4` |
| old l13-stationary b3–b5 + `l14-pr-box-energy`, `l14-pr-wall` | no lecture notes teach the box | MOVE as the books-only unit `l14-box` after the lecture units (T3) | `l13TBox*`, `l13PrE1Ev`, `l13PrWall3`, `l13TWall2P1` |
| `l13-flow` (current, step, barrier) + the p. 231 Correction | L17 §17.3–17.6 (current, step E > V₀), L18 §18.5–18.7 (E < V₀, barrier) | MOVE to L17/L18 (other planner); L13 keeps it until that builder lands | all `l13T…` flow keys, `l13-pr-step`, `l13-pr-tunnel` |
After the L14 pass L13 holds 5 units (delta … two-bases) and a closing pointer. The builder also updates: `Lecture.symbols`, glossary `first` ids (`kinetic-energy-operator` → `l14-schrodinger:b1`, `position-space-schrodinger` → `:b3`, `energy-eigenfunction` → `l14-stationary:b1`,
`time-operator` → `l14-time-operator:b1`, `lowest-energy` → `:b3`, `evolution-time` → `l14-time:b4`, `infinite-well` → `l14-box:b1`), prose "Unit 13.6/13.7" → "Unit 14.2/14.4" (also in the kept `l13-flow`), concept stations, arcade rounds `SC13`/`TI13`, `L13.test.ts`, e2e lists.

## 0. Lecture map
| # | id | Title (≤ 8 words) | Question | Notes | Books |
|---|---|---|---|---|---|
| 1 | `l14-components` | Components: discrete first, then continuous | What is new in ψ(x) compared with ψ(a), and what is not? | pp.2–3 (§14.1 checkpoint) | Townsend §6.11 pp.234–235 |
| 2 | `l14-schrodinger` | The Schrödinger equation of a particle | How does the abstract law become a differential equation? | pp.3–5 (§14.1) | Townsend §6.8 pp.213–214; Ch. 4 p.112 |
| 3 | `l14-dispersion` | From matter-wave dispersion to the equation | Which equation makes every plane wave turn at ω(k)? | pp.5–7 (§14.2) | Susskind L9 §9.1–9.2 |
| 4 | `l14-time` | Why time is a parameter | Why does x have an operator and t not? | pp.8–9 (§14.3) | Townsend §4.6 pp.134–136 |
| 5 | `l14-time-operator` | Could time be an operator? | What would an operator conjugate to H do? | pp.9–10 (§14.4) | — |
| 6 | `l14-stationary` | Energy eigenstates and the time-independent equation | What does Ĥ\|E⟩ = E\|E⟩ become along x, and what is "stationary"? | pp.10–12 (§14.5–14.6) | Townsend §6.8 pp.217–218 |
| 7 | `l14-box` | Standing waves in a box (beyond the notes) | Why are the energies of a box quantised? | — | Townsend §6.9 pp.219–224 |
**Counts.** 7 units, **40 beats** (6 + 6 + 7 + 5 + 6 + 7 + 3), 7 clues, 7 books beats, 3 link-backs, 6 derivations (one moved), 5 practice questions (two moved). Optional (notes' flag): the group-velocity box of §14.2 is L15's core, so L14 only points forward; the notes' optional p_t = −iħ∂ₜ aside (p. 10) stays omitted (ruling R5 of `448-L12L13.md`; Q8).
Outcomes: (1) tell a discrete component from a continuous one and a chance from a density; (2) write Ĥ = p̂²/2m + V(x̂) and project the law on ⟨x|; (3) say why V acts by multiplication; (4) get the free equation from ω(k) = ħk²/2m; (5) say why time is a parameter and why an unrestricted energy-shifting t̂ cannot exist; (6) get the time-independent equation from Ĥ|E⟩ = E|E⟩ and say what "stationary" means; (7) show a superposition of two energies is not stationary. Prerequisites as L13 minus `schrodinger`.

## 1. Story beats (W = `wavefunction`; phase L lecture · B books · C clue · D deeper)
### Unit 1 `l14-components`
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.2 | **Link back** (Unit 12.3): ψ(a) = ⟨a\|ψ⟩ for a ∈ {+, −} and ψ(x) = ⟨x\|ψ⟩ for x on the line are both sets of complex components of one ket; the sum becomes an integral. At one fixed x₀ it is a single complex number. Defines nothing new. | `{layout:'split', top: amplitudes(ket +x), bottom: W(PK(0,1),{show:['re','im']})}` | — |
| b2 | L | p.3 | A chance is \|ψ(a)\|²; for a line only \|ψ(x₀)\|²dx is a chance. Chop [−8, 8] into 16 equal cells: the cell [0, 1) holds 0.341; the chances of all 16 add to 1. With 512 cells the chance ÷ width is 0.399 ℓ⁻¹: the density. | `W(PK(0,1),{cells:16,readouts:['cell']})` → `cells:512` | `l14Cell16` 0.341 · `l14CellsSum` 1 · `l14Cell512Dens` 0.399 |
| b3 | L | p.3 | The kets \|x⟩ are generalised (δ-normalised) eigenkets, so ψ(x) has units ℓ^{−1/2}: the peak of \|ψ\| for σ = 1 is 0.632 ℓ^{−1/2}. The notes call this "not needed on the board". | `W(PK(0,1),{show:['re','density'],readouts:['peak']})` | `l14AmpUnit` 0.632 |
| b4 | L | p.3 | **Link back** (Units 12.5, 13.2, 13.5): x̂ → x, p̂ → −iħ∂ₓ, [x̂, p̂] = iħ in both bases. The new lecture uses them, it does not re-derive them. | `W(PK(0,1,3),{overlay:['xpsi','ppsi']})` | — |
| b5 | B | — | Townsend §6.11 pp.234–235 (6.150)–(6.155): the same statement for any observable with a continuous eigenvalue a: da\|⟨a\|ψ⟩\|² is the chance that A lies in da. | `W(PK(0,1),{cells:16})` | — |
| b6 | C | p.3 | Q: If \|ψ(0)\|² = 0.399 ℓ⁻¹, what is the chance of finding the particle exactly at x = 0? → R: zero. Only intervals have chances; a cell of width 1/32 ℓ holds 0.0125. | `W(PK(0,1),{cells:512,readouts:['cell']})` | `l14Cell512` 0.0125 |
### Unit 2 `l14-schrodinger`
| b1 | L | p.3 | **Link back** (Units 11.4, 12.1): iħ d\|ψ⟩/dt = Ĥ\|ψ⟩. For one particle on a line with a real potential take Ĥ = p̂²/2m + V(x̂). The notes stress this is an *assumption*: the classical energy identifies the operators, it does not prove every classical expression quantises. A packet with p₀ = 3 has ⟨p̂²/2m⟩ = 4.625 = 4.5 + 0.125 (gloss `kinetic-energy-operator`). | `W(PK(0,1,3),{panels:['position','momentum'],readouts:['pmean','pspread']})` | `l14TkinP0` 4.625 · `l14TkinSpread` 0.125 |
| b2 | L | p.4 | Why V acts by multiplication. \|x⟩ is an eigenket of x̂, hence of every function of x̂: V(x̂)\|x⟩ = V(x)\|x⟩. V real makes V(x̂) Hermitian, and the adjoint gives ⟨x\|V(x̂) = V(x)⟨x\|. \|x⟩ is not an eigenket of the whole Ĥ, since p̂ moves position. Scope: V(x, t) is fine at each t; a nonlocal or p-dependent potential is not. For V = x²/2 and a packet at x₀ = 2: ⟨V⟩ = ∫V\|ψ\|²dx = 2.5. | `W(PK(2,1),{overlay:['xpsi'],show:['re','density']})` | `l14VMean` 2.5 |
| b3 | L | pp.4–5 | Project the law on ⟨x\|. The kets \|x⟩ do not depend on t, so ⟨x\| passes through d/dt and the derivative becomes partial. ⟨x\|p̂²\|ψ⟩ = −ħ²ψ″ (apply −iħ∂ₓ twice) and ⟨x\|V\|ψ⟩ = Vψ: **D1**, giving iħ∂ₜψ = −(ħ²/2m)∂ₓ²ψ + Vψ (gloss `position-space-schrodinger`). | `W(PK(0,1,3),{time:sweep(0,2),panels:['position','momentum']})` | `l13SchroOk` (check: (ψ(t+h)−ψ(t))/h = −iĤψ, not shown) |
| b4 | L | p.5 | Synthesis: this is not a second law but the first written out in one basis for one Hamiltonian. ψ(x, t) holds amplitudes for where the particle will be found. It is not a displacement and not a second object beside the ket. Scope: nonrelativistic, one spinless particle, a local scalar potential; for V(x, t) the same equation holds but e^{−iĤt/ħ} no longer gives the propagator. | `W(PK(0,1,3),{time:sweep(0,2),show:['density']})` | — |
| b5 | B | — | Townsend §6.8 pp.213–214 (6.78)–(6.81): the same projection (his (6.79) is ⟨x\|V(x̂) = ⟨x\|V(x)); Ch. 4 §4.1 p.112: Schrödinger first wrote it as a wave equation. | `W(PK(0,1,3),{time:sweep(0,2)})` | — |
| b6 | C | pp.4–5 | Q: Why may ⟨x\| pass through V(x̂) but not through the whole Ĥ? → R: \|x⟩ is an eigenket of V(x̂) (multiplication) but p̂ is a derivative: it mixes neighbouring x. | `W(PK(2,1),{overlay:['xpsi']})` → reveal `…overlay:['xpsi','ppsi']` | — |
### Unit 3 `l14-dispersion`
| b1 | L | pp.5–6 | Reverse the reasoning. p = ħk, E = ħω and E = p²/2m give ħω = (ħk)²/2m, the dispersion relation ω(k) = ħk²/2m (gloss `dispersion-relation`, notation beat). ω(3) = 4.5; doubling k multiplies ω by 4. | plot `freeOmega` (k −4…4), markers k = 1, 2, 3 | `l14Omega3` 4.5 · `l14OmegaDouble` 4 |
| b2 | L | p.6 | What operations reveal ω and k²? For ψ_k = Ae^{i(kx−ωt)}: i∂ₜψ = ωψ and −∂ₓ²ψ = k²ψ. The simplest linear local equation that reproduces ω = ħk²/2m is i∂ₜψ = −(ħ/2m)∂ₓ²ψ; times ħ it is the free Schrödinger equation (**D2**; moved D8). | `W(PL(2),{time:sweep(0,1),show:['re','im','phase']})` | `l13OmegaK2` 2 · `l13PlanePhaseDegMag` 114.6° |
| b3 | L | p.7 | Compare light: ω = c\|k\| gives ω² = c²k² and ∂ₜ²E = c²∂ₓ²E, the second-order equation that follows from Maxwell's first-order pair. A single right-moving branch also obeys the first-order (∂ₜ + c∂ₓ)E = 0: a linear relation does not force the order. The comparison is of dispersion relations, not of derivative counts. | plot `freeOmega` vs `linearOmega` | — |
| b4 | L | p.7 | Curvature and kinetic energy: for a sinusoid ∂ₓ²ψ_k = −k²ψ_k, so faster oscillation means bigger k² and bigger p²/2m: why the kinetic operator is a curvature (gloss `curvature`). Squeeze σ from 1 to ½: Δp doubles and ⟨p̂²/2m⟩ goes from 0.125 to 0.5. Component-wise only: not a local kinetic-energy density. | `W(PK(0,0.5),{panels:['position','momentum'],readouts:['pspread']})` | `l14Curv3` −9 · `l14GaussT1` 0.125 · `l14GaussTRatio` 4 |
| b5 | L | p.7 | Why does it work for a packet? Linearity: ψ = ∫dk A(k)e^{i[kx−ω(k)t]}, each term solves the equation, so the sum does (two waves p = 2, 4 check to 5·10⁻⁷). Assumed vs derived: the V(x)ψ term comes from Unit 14.2; the curvature argument is component-wise. The notes' optional group-velocity box is Unit 15.4. | `W(TW(2,4),{time:sweep(0,2),show:['re','density']})` | `l14TwoWaveResidual` (check < 10⁻⁶) |
| b6 | B | — | Susskind L9 §9.1–9.2: a first-order equation with Ĥ = c p̂ moves every component at c, so the shape never changes; Ĥ = p̂²/2m gives the equation above, and its packets move and fall apart. | `W(PK(0,1,1.5),{time:sweep(0,4)})` | — |
| b7 | C | — | Q: A matter wave has twice the wave number. By what factor is its frequency larger, and by what factor for light? → R: 4 for matter (ω ∝ k²), 2 for light. | plot `freeOmega` → reveal `freeOmega` vs `linearOmega` | `l14OmegaDouble` (reveal repeats it) |
### Unit 4 `l14-time`
| b1 | L | p.8 | The experiment: prepare an atom and look for it a second later. An outside clock fixes when; the state says where the apparatus may find it: P(x in dx \| t) = \|ψ(x, t)\|²dx. At each t, ψ is a complete description; \|ψ\|² is not a joint density of x and t. At t = 4 the free packet is still normalised. | `W(PK(0,1,3),{time:sweep(0,4),show:['density'],readouts:['norm']})` | `l13FreeNorm4` 1 |
| b2 | L | pp.8–9 | Generators side by side: U_x(a) = e^{−iap̂/ħ} (parameter: distance a, generator p̂) and U_t(τ) = e^{−iĤτ/ħ} (duration τ, generator Ĥ). A generator's parameter need not be an observable. For the free Ĥ, [Ĥ, p̂] = 0: momentum is conserved. | `{layout:'split', top: W(PK(0,1),{shift:sweep(0,3)}), bottom: K(sweep(0,90))}` | `l13FreeCommutatorOk` (1: the residual is rounding-sized) |
| b3 | L | p.9 | What Noether says: shift symmetry in space ⇒ conserved momentum, in time ⇒ conserved energy. A time-dependent Ĥ need not conserve energy yet still generates evolution (time-ordered propagator). And a shift exists even when V breaks the symmetry: generator and *conserved* generator are related but distinct. Shift a free packet (p₀ = 1.5) by 3, wait 2, or wait 2 then shift: the centre is at 6 either way. <<sl-q24-rabi\|Go further in 709: a driven spin does not conserve energy>> | `W(PK(0,1,1.5),{shift:3,time:sweep(0,2),readouts:['xmean']})` | `l14ShiftThenWait` 6 · `l14WaitThenShift` 6 |
| b4 | B | — | Townsend §4.6 pp.134–136 (4.63)–(4.65), Ex. 4.3: only ΔE is a spread; t is a parameter. For any A without explicit time, ΔE ΔA/\|d⟨A⟩/dt\| ≥ ħ/2, and Δt = ΔA/\|d⟨A⟩/dt\| is an evolution time (gloss `evolution-time`). Ammonia: Δt = ħ/2A is 0.318 of the half-period. | `K(sweep(0,180))` | `l13TTimeBound` 0.5 · `l13TAmmDtRatio` 0.318 |
| b5 | C | p.9 | Q: Is energy conserved if Ĥ depends on t, and does Ĥ still generate evolution? → R: evolution yes, conservation no (a driven spin gains and loses energy, Unit 12.7). | `K(sweep(0,90))` | — |
### Unit 5 `l14-time-operator`
| b1 | L | p.9 | Take the objection seriously: x̂ generates shifts of momentum, so should some t̂ generate shifts of energy, [t̂, Ĥ] = iħ? **Rosetta R7** (the notes write T̂). A boost e^{iεx̂} moves a whole momentum curve: ε = 1.5 adds 1.5 and leaves Δp = 0.5 (gloss `time-operator`, notation beat). | `W(PK(0,1),{panels:['position','momentum'],boost:sweep(0,1.5),readouts:['pmean','pspread']})` | `l13BoostMean` 1.5 · `l13BoostSd` 0.5 |
| b2 | L | p.9 | If t̂ existed, W(ε) = e^{−iεt̂/ħ} gives W Ĥ W† = Ĥ − (iε/ħ)[t̂, Ĥ] + … = Ĥ + ε, exact when higher commutators vanish (**D3**, moved D9; **Rosetta**: the notes' V̂(ε)). The x̂, p̂ twin e^{−iεx̂}p̂e^{iεx̂} = p̂ + ε is verified on the grid. | `W(PK(0,1),{panels:['position','momentum'],boost:0})` → `boost:1.5` | `l13WpWdag` 0 |
| b3 | L | p.9 | The snag: unitary conjugation keeps the spectrum, yet Ĥ + ε moves every energy by any ε, so the spectrum would have no bound in either direction. A free particle has E = p²/2m ≥ 0: a lowest energy (gloss `lowest-energy`). | `W({plane:{p:0}},{show:['re']})` | — |
| b4 | L | p.9 | Time evolution is not an energy shift: c_E(t) = e^{−iEt/ħ}c_E(0). The components keep their size and only turn; with levels 3ε and ε the gap of the two hands after εt/ħ = 45° is 90°. | `K(sweep(0,90))` | `l14ClockGap90` 90 |
| b5 | L | p.10 | Precision (Pauli): the argument rules out an unrestricted self-adjoint t̂ conjugate to a semibounded Ĥ, not every time observable. Times of arrival, time POVMs and clocks inside an enlarged system are fine. It is not a choice of zero of energy. So t in the wavefunction stays an outside parameter that labels the evolving state. | `K(sweep(0,90))` | — |
| b6 | C | p.9 | Q: Why would shifting every free-particle energy by −1 break something? → R: the lowest free energy is 0 (p = 0); −1 is not in the spectrum. | `W({plane:{p:0}},{show:['re']})` → reveal `W(PK(0,1),{panels:['momentum'],readouts:['pmean']})` | `l13MinFreeEnergy` 0 |
### Unit 6 `l14-stationary`
| b1 | L | p.11 | Start from an energy eigenket of a time-independent Ĥ: \|ψ(t)\rangle = e^{−iEt/ħ}\|E⟩ (Units 11.5, 12.1). Define φ_E(x) = ⟨x\|E⟩ (gloss `energy-eigenfunction`). The notes insist energy already has a definition as an eigenvalue: this is not a separation of variables. | `W(BOX(4,2),{show:['re','im'],readouts:['energy']})` | `l14BoxE2` 1.234 |
| b2 | L | p.11 | Project Ĥ\|E⟩ = E\|E⟩ on ⟨x\|: [−(ħ²/2m)d²/dx² + V(x)]φ_E = Eφ_E, the time-independent Schrödinger equation (**D4**; gloss `time-independent-schrodinger`). A box level obeys it to 10⁻¹² on the grid. | `W(BOX(4,2),{show:['re']})` → `{show:['re'],panels:['position','momentum']}` | `l14BoxTiseResidual` (check < 10⁻⁶) |
| b3 | L | p.11 | What "stationary" means: ψ(x, t) = e^{−iEt/ħ}φ_E(x); the phase keeps turning but \|ψ\|² = \|φ_E\|² does not move (drift 0). It does not say the particle sits at a point. Level 1 of a width-4 box has E₁ = 0.308. | `W(BOX(4,1),{time:sweep(0,4),show:['density','phase'],readouts:['energy']})` | `l14BoxE1` 0.308 · `l14StationaryDrift` 0 |
| b4 | L | pp.11–12 | A superposition of two energies is not stationary: \|ψ\|² = \|c₁\|²\|φ₁\|² + \|c₂\|²\|φ₂\|² + 2Re[c₁\*c₂φ₁\*φ₂e^{−i(E₂−E₁)t/ħ}] (**D5**). Levels 1 and 2 of the box at x = 1: the direct terms add to 0.375, the cross term swings ±0.354, so the density runs 0.729 → 0.021 over half the period 2π/(E₂ − E₁) = 6.79. | `W(BOX(4,[1,2]),{time:sweep(0,6.8),show:['density']})` | `l14SloshMean` 0.375 · `l14CrossAmp` 0.354 · `l14SloshD0` 0.729 · `l14SloshDHalf` 0.0214 · `l14SloshPeriod` 6.79 |
| b5 | L | p.12 | Consolidation: (1) ψ(x, t) = ⟨x\|ψ(t)⟩ with x̂ = x, p̂ = −iħ∂ₓ; (2) the law is iħ∂ₜψ = [−ħ²∂ₓ²/2m + V]ψ; (3) Ĥ\|E⟩ = E\|E⟩ is the time-independent equation. Exit: Ĥ generates time shifts without a universal energy-shifting operator; the TISE gives the shape of an energy state, the TDSE governs any state. | `{layout:'split', top: W(BOX(4,[1,2]),{time:sweep(0,6.8),show:['density']}), bottom: K(sweep(0,90))}` | — |
| b6 | B | — | Townsend §6.8 pp.217–218 (6.96)–(6.98), Figs. 6.8–6.9. Where E > V the function bends back toward the axis and oscillates (6.97). Where E < V it bends away and is exponential (6.98). φ and φ′ stay continuous unless V is infinite. Level n has n − 1 nodes: level 4 has 3 (gloss `node`). | `W(BOX(4,4),{show:['re'],readouts:['energy']})` | `l13TBoxNodes4` 3 |
| b7 | C | p.11 | Q: In a stationary state "nothing changes". What does keep changing? → R: the phase of ψ: at x₀ it has turned by −70.7° at t = 4 (E₁t = 1.234 rad); the density has not. | `W(BOX(4,1),{show:['re','im','phase']})` → reveal `…time:4` | `l14PhaseTurnDeg` −70.7 |
### Unit 7 `l14-box` (books only, T3; moved from old l13-stationary)
| b1 | B | — | Lede: the lecture notes do not cover this. V infinite outside 0 < x < L (Townsend §6.9 pp.219–221, (6.99)–(6.110), his Problem 6.13): sin kL = 0, E_n = ħ²π²n²/2mL², φ_n = √(2/L) sin(nπx/L); electron in 0.4 nm: E₁ = 2.35 eV. Derivation **D6** as built (6 steps). | `W(BOX(4,1),{panels:['position','momentum'],…})` | `l13TBoxE1Ev` 2.35 |
| b2 | B | — | Ex. 6.6 pp.221–224: ground state of a box, walls pulled to twice the width: overlap 8/3π, chance of the new ground state 64/9π² = 0.72, new third level 0.26, even levels 0, odd levels sum to 1. | `W(BOX(4,[1,2]),…)` | `l13TBoxOverlap` … `l13TBoxSumOdd` |
| b3 | C | — | Squeeze the box to half its width: energy ×4, momentum spread ×2. | as built | `l13TBoxEnergyRatio`, `l13TBoxDpRatio` |

## 2. Derivations (one track; ≥ 2 distinct views each, kinds already on the unit's stage)
- **D1 `l14-schrodinger:b3`** result `i\hbar\,\partial_t\psi = -\tfrac{\hbar^2}{2m}\partial_x^2\psi + V\psi`: (1) `i\hbar\,\tfrac{d}{dt}|\psi\rangle = \hat H|\psi\rangle` view W time sweep; (2) `i\hbar\,\partial_t\langle x|\psi\rangle = \tfrac{1}{2m}\langle x|\hat p^2|\psi\rangle + \langle x|V(\hat x)|\psi\rangle` — "the kets |x⟩ do not depend on t"; (3) `\langle x|\hat p^2|\psi\rangle = -\hbar^2\psi''` — "apply −iħ∂ₓ twice"; (4) `\langle x|V(\hat x)|\psi\rangle = V(x)\psi` — "|x⟩ is an eigenket of V(x̂)", view W both panels; (5) result.
- **D2 `l14-dispersion:b2`** result `i\hbar\,\partial_t\psi = -\tfrac{\hbar^2}{2m}\partial_x^2\psi`: (1) `\psi_k = Ae^{i(kx-\omega t)}` view W plane t = 0; (2) `i\partial_t\psi_k = \omega\psi_k,\ -\partial_x^2\psi_k = k^2\psi_k`; (3) `\omega = \hbar k^2/2m \Rightarrow i\partial_t\psi = -\tfrac{\hbar}{2m}\partial_x^2\psi` — "a first time and a second space derivative"; (4) times ħ, view W plane t = 1.
- **D3 `l14-time-operator:b2`** result `W\hat HW^\dagger = \hat H + \epsilon`: (1) `W(\epsilon)\hat HW(\epsilon)^\dagger = \hat H - \tfrac{i\epsilon}{\hbar}[\hat t,\hat H] + \cdots` view W boost 0; (2) `[\hat t,\hat H] = i\hbar` ends the series; (3) `= \hat H + \epsilon`, view W boost 1.5 (the x̂, p̂ twin).
- **D4 `l14-stationary:b2`** result `\left[-\tfrac{\hbar^2}{2m}\tfrac{d^2}{dx^2}+V\right]\varphi_E = E\varphi_E`: (1) `\hat H|E\rangle = E|E\rangle` view W box position; (2) `\langle x|\hat H|E\rangle = E\langle x|E\rangle` — "multiply by ⟨x|"; (3) `\langle x|\hat p^2|E\rangle = -\hbar^2\varphi_E''` and `\langle x|V|E\rangle = V\varphi_E`; (4) result, view W box both panels.
- **D5 `l14-stationary:b4`** result `|\psi|^2 = \dots + 2\,\mathrm{Re}[\dots]`: (1) `\psi = c_1e^{-iE_1t/\hbar}\varphi_1 + c_2e^{-iE_2t/\hbar}\varphi_2` view W box n = 1; (2) `|\psi|^2 = (\psi_1+\psi_2)^*(\psi_1+\psi_2)`; (3) the two diagonal terms are time independent; (4) the cross term `2\,\mathrm{Re}[c_1^*c_2\varphi_1^*\varphi_2e^{-i(E_2-E_1)t/\hbar}]`, view W box [1, 2] time.
- **D6 `l14-box:b1`** as built in old l13-stationary:b3 (6 steps, ≥ 3 views).

## 3. Try-it per unit (existing widgets; `wave-lab` stays deferred, Q5)
| unit | widget spec | try this |
|---|---|---|
| components | `{kind:'amplitude-bars', props:{state:'+x', basis:'z'}}` | 1. Two components, two chances: 0.5 each. A line has a continuum of them, so only intervals get chances. |
| schrodinger | `{kind:'two-clocks', props:{upper:3, lower:1, start:'+x'}}` | 1. Stand-in: each energy turns its own clock; Ĥ sets the rates. |
| dispersion | `{kind:'two-clocks', props:{upper:4, lower:1, start:'+x'}}` | 1. Stand-in for k and 2k: the second hand turns four times as fast, ω ∝ k². |
| time | `{kind:'two-clocks', props:{upper:3, lower:1, start:'+x'}}` | 1. Time is the slider, not an outcome of any measurement. |
| time-operator | same | 1. The hands turn; the chances of the two energies never move. |
| stationary | `{kind:'two-clocks', props:{upper:3, lower:1, start:'+z'}}` | 1. One energy, one hand: nothing changes. Add the equal mix and a gap opens. |
| box | as built | as built |

## 4. Challenges (keys from the engine; tolerance 0.005 for decimals, 0 for integers)
- **components**: `l14-co-amp` warm-up numeric peak \|ψ\| for σ = 1 → 0.632 · `l14-co-cell` core numeric chance in [0, 1) → 0.341 · `l14-co-units` core choice the unit of ψ(x): ℓ^{−1/2} ✓.
- **schrodinger**: `l14-sc-tkin` warm-up numeric ⟨p̂²/2m⟩ of the σ = 1, p₀ = 3 packet → 4.625 · `l14-sc-v` core numeric ⟨V⟩ for V = x²/2, x₀ = 2 → 2.5 · `l13-sc-order` (moved) core order the steps of D1.
- **dispersion**: `l13-sc-omega` (moved) warm-up numeric ω for k = 2 → 2 · `l14-di-double` core numeric ω(2k)/ω(k) → 4 · `l14-di-tophat` core choice: which wavefunction has infinite kinetic energy: a top hat ✓ (claims `l14TopHatT4` 8, `l14TopHatT8` 16: ⟨T⟩ cut at P = 2πn/L grows as 2n, no limit) · `l14-pr-kinetic` stretch **practice** (below).
- **time**: `l13-ti-which` (moved) warm-up choice: time is a parameter that labels the state ✓ · `l14-ti-shift` core numeric the centre after shift 3 and wait 2 (p₀ = 1.5) → 6.
- **time-operator**: `l13-ti-boost` (moved) core numeric ⟨p⟩ after e^{1.5ix} → 1.5 · `l13-ti-min` (moved) core numeric the lowest free energy → 0 · `l14-to-order` core order the steps of D3.
- **stationary**: `l14-st-which` warm-up choice: in a stationary state \|ψ\|² is constant and the phase is not ✓ · `l14-st-mean` core numeric the time-average of the density of the 1 + 2 mix at x = 1 → 0.375 · `l14-st-order` core order the steps of D4 · `l14-pr-period`, `l14-pr-mean-energy` **practice**.
- **box**: `l14-pr-box-energy`, `l14-pr-wall` (moved **practice**, Townsend 6.18, 6.16).
**Practice (T1; 5 in the lecture; walkthroughs in full, all homeworks submitted; new numbers).**
| id | tag | prompt | answer (key, route) | mirrors |
|---|---|---|---|---|
| `l14-pr-kinetic` | homework, core numeric | A particle on a line has ψ = A(1 − \|x\|/L) for \|x\| < L, zero outside, with L = 2 ℓ (ħ = m = 1). Find ⟨p̂²/2m⟩. | 0.375 (`l14PrTentT`; twin: `quad` of ½∫\|ψ′\|²) ; a top hat of the same width has no finite value | the HW7 problem on kinetic energy and sharp edges |
| `l14-pr-period` | homework, core numeric | In a box of width 3 ℓ (ħ = m = 1) the particle starts in an equal mix of levels 1 and 2. After what time does the density first repeat? | 3.820 = 12/π (`l14PrPeriod`; twin: `eigh` of the box matrix) | HW6 type: relative phase of two energies |
| `l14-pr-mean-energy` | townsend 6.15 | Box of width 2 ℓ, ψ = 0.6φ₁ + 0.8iφ₃. Find ⟨E⟩. (The chance of E₁ is 0.36.) | 7.550 (`l14PrMeanE`; `l14PrChanceE1` 0.36) | Townsend Problem 6.15 (his state has other coefficients) |
| `l14-pr-box-energy`, `l14-pr-wall` | townsend 6.18, 6.16 | as built | `l13PrE1Ev`, `l13PrWall3` | |

## 5. Glossary (new 448 ids, checked against `ids.json`: all free; reused: `schrodinger-equation`, `energy-eigenstate`, `stationary-state`, `time-translation`, `noether-theorem`, `relative-phase`, `wave-packet`, `momentum-wavefunction`)
| id | term | gloss (≤ 25 words) | first |
|---|---|---|---|
| `dispersion-relation` | dispersion relation ω(k) | The angular frequency of a plane-wave component as a function of its wave number; for a free matter wave ω = ħk²/2m. | l14-dispersion:b1 |
| `curvature` | curvature | How quickly the slope of a function changes: for a sine it is −k² times the function, so faster oscillation costs more kinetic energy. | l14-dispersion:b4 |
| `time-independent-schrodinger` | time-independent Schrödinger equation | The energy eigenvalue equation in the position basis: [−ħ²d²/2m dx² + V]φ_E = Eφ_E. | l14-stationary:b2 |
| `node` | node | A point where a real function crosses zero; level n of a box has n − 1 nodes inside the walls. | l14-stationary:b6 |
Re-homed (first moves): see §A. Notation beats: `dispersion-relation` (`introduces: 'notation'`, `l14-dispersion:b1`), `time-operator` (`l14-time-operator:b1`).

## 6. Review cards
- **components**: ψ(a) and ψ(x) are components of one ket; a density is not a chance · eq `P(x\in dx) = |\psi(x)|^2dx` · trap: reading \|ψ(x₀)\|² as the chance of the point x₀.
- **schrodinger**: Ĥ = p̂²/2m + V(x̂) is an assumption; V acts by multiplication; the equation is the law in one basis · eq `i\hbar\,\partial_t\psi = -\tfrac{\hbar^2}{2m}\partial_x^2\psi + V\psi` · trap: calling it a second law.
- **dispersion**: ω = ħk²/2m motivates one time and two space derivatives; linearity extends it to packets · eq `\omega(k) = \hbar k^2/2m` · trap: "a linear relation forces a second-order equation".
- **time**: time labels the state, position an outcome; a generator's parameter need not be an observable · eq `\hat U_t(\tau) = e^{-i\hat H\tau/\hbar}` · trap: "time cannot be measured".
- **time-operator**: an unrestricted t̂ would shift every energy; the spectrum has a lowest value · eq `W\hat HW^\dagger = \hat H + \epsilon` · trap: concluding that no clock exists.
- **stationary**: the phase turns, \|ψ\|² does not; a superposition of two energies sloshes · eq `\left[-\tfrac{\hbar^2}{2m}\tfrac{d^2}{dx^2}+V\right]\varphi_E = E\varphi_E` · trap: "stationary means at rest".
- **box**: as built.

## 6b. Formula boards (`Unit.equations`; Townsend equations as printed, ruling T2; PDF 240 = p. 224 re-read first, T6)
- **components**: `\psi(a) = \langle a|\psi\rangle`, `\psi(x) = \langle x|\psi\rangle`, `\int da\,|\langle a|\psi\rangle|^2 = 1` (6.154, p. 235), `da\,|\langle a|\psi\rangle|^2` (6.155, p. 235).
- **schrodinger**: `\hat H = \tfrac{\hat p_x^2}{2m} + V(\hat x)` (6.168, p. 236), `\langle x|V(\hat x) = \langle x|V(x)` (6.79, p. 213), `\left[-\tfrac{\hbar^2}{2m}\tfrac{\partial^2}{\partial x^2}+V(x)\right]\psi(x,t) = i\hbar\tfrac{\partial}{\partial t}\psi(x,t)` (6.81, p. 214).
- **dispersion**: `\omega(k) = \tfrac{\hbar k^2}{2m}`, `i\,\partial_t\psi_k = \omega\psi_k,\ -\partial_x^2\psi_k = k^2\psi_k`.
- **time**: `\hat U_x(a) = e^{-ia\hat p/\hbar},\ \hat U_t(\tau) = e^{-i\hat H\tau/\hbar}`, `\Delta E\,\Delta t \ge \hbar/2` (4.63, p. 134), `\Delta E\,\Delta A/|d\langle A\rangle/dt| \ge \hbar/2` (Ex. 4.3, p. 136).
- **time-operator**: `W\hat HW^\dagger = \hat H + \epsilon`, `c_E(t) = e^{-iEt/\hbar}c_E(0)` (the one-energy case is 4.15, p. 113).
- **stationary**: `\psi_E(x,t) = \langle x|E\rangle e^{-iEt/\hbar}` (6.83, p. 214), `\left[-\tfrac{\hbar^2}{2m}\tfrac{d^2}{dx^2}+V\right]\psi_E = E\psi_E` (6.86, p. 214), `\psi'' = -k^2(x)\psi` (6.97) and `\psi'' = q^2(x)\psi` (6.98, p. 218).
- **box**: `k_nL = n\pi` (6.105, p. 220), `E_n = \tfrac{\hbar^2\pi^2n^2}{2mL^2}` (6.110, p. 221), `\varphi_n = \sqrt{2/L}\,\sin\tfrac{n\pi x}{L}` (his Problem 6.13: wall at 0, so no cosines).

## 7. Symbol-before-use (first beat)
ψ(a), a, ψ(x), x₀, dx: l14-components:b1–b2 · ℓ^{−1/2}: b3 · Ĥ, V(x̂), V(x), m: l14-schrodinger:b1–b2 (mapped to `Lecture.symbols`) · ⟨x\|, ∂ₜ, ∂ₓ²: b3 · ω, k, ψ_k, A: l14-dispersion:b1–b2 · c (speed of light), E field: b3 · U_x(a), U_t(τ): l14-time:b2 · t̂, W(ε), ε (any number, not L11's unit): l14-time-operator:b1–b2 · c_E: b4 · φ_E, E: l14-stationary:b1 · c₁, c₂, E₁, E₂: b4 · L, n, E_n: l14-box:b1.

## 8. Errata and consistency fixes (no physics error found; no Correction box)
Recomputed from the text layer and re-read on the page images (L14 pp. 9, 11): the energy-shift box (VĤV† = Ĥ − (iε/ħ)[T̂, Ĥ] = Ĥ + ε, sign checked), the TISE box, the interference term (2 Re[c₁\*c₂φ₁\*φ₂e^{−i(E₂−E₁)t/ħ}]), ω = ħk²/2m, v_phase = p/2m, the light comparison. Notation: T̂ for the time operator (R7), V̂(ε) clashes with the potential (W(ε)), a one-line note that with VĤV† = Ĥ + ε the state V\|E⟩ has energy E − ε (so "any real ε" is all the argument needs; carried from the L13 plan). No numerical slip in L14.

## 9. Engine, stage and widget gaps
**9.1 Engine** (`physics/wave.ts`, fixtures `claims_448/l14.py`, numpy twin of every `l14…` key by `eigh`, `quad`, FFT; tests `wave14.test.ts`): `kineticEnergy(psi, g, m)` (momentum-space route; moments of a packet), `omegaFree(k, m)`, `omegaLinear(k, c)`, `tentKinetic(L)` (closed form ħ²·3/2mL²; checked against the FFT value to 2 %), `topHatKineticCut(L, P)` (closed form (P − sin PL/L)/πL; `l14TopHatT4` and `T8` use P = 2πn/L so the sine drops out), `boxMeanEnergy(L, terms)`, `boxPairParts(L, n1, n2, t, x)` → {direct1, direct2, cross, total} (total checked against `boxState`), `boxResidual(psi, g, E, a, b)` (7-point stencil), `densityDrift(psi_t, psi_0)`. Reused unchanged: `packet`, `freeEvolve`, `translate`, `shiftAndEvolve`, `boost`, `meanP`, `spreadP`, `interval`, `cellChances`, `boxState`, `boxEnergy`, `boxPairEnergy`, `boxOverlap`, `planeSamples`, `clockHands`. Constants: none new.
**9.2 Stage contract.** The ONE smallest addition: two `plot` curves (additive, T2 style; tables in `stage/svg/plot.ts`, names in `PlotCurveName`): `freeOmega` (x = k from −4 to 4, y = ω = k²/2 from `omegaFree`) and `linearOmega` (y = c\|k\|, c = 1, meets the parabola at k = 2), drawn as curve + `vs`, `markers` at whole k; fidelity `plot-free-omega` (exact; ħ = m = 1, the axis is labelled ω). Everything else is `wavefunction` (fields as in `stage-kinds`), `clocks`, `amplitudes`.
**9.3 Widgets.** None. L14–L16 lean on stand-ins; see Q5.

## 10. Media
None.

## 11. Hooks
**Concept map:** `components` (l14-components; needs `wavefunction`) · `schrodinger-position` (re-homed; l14-schrodinger; needs `commutator-bases`, `schrodinger`) · `matter-dispersion` (l14-dispersion; needs `schrodinger-position`) · `time-parameter` (re-homed; l14-time; needs `schrodinger-position`, `dynamical-law`) · `no-time-operator` (l14-time-operator; needs `time-parameter`) · `tise` (l14-stationary; needs `schrodinger-position`, `stationary-states`) · `standing-waves` (re-homed; l14-box; needs `tise`).
**Arcade:** re-home the `SC13` and `TI13` Spot-the-error rounds; new: `l14-components` ("\|ψ(0)\|² = 0.399 is the chance of x = 0"), `l14-dispersion` ("doubling k doubles ω for a matter wave"), `l14-stationary` ("stationary means the particle is at rest").
**Go further in 709:** one new bridge row `sl-q24-rabi` (`q24-rabi`, "Rabi oscillations and the rotating frame"), used in `l14-time:b3`; `import './bridges448'` already in the lecture file pattern. Existing rows `sl-f8-dft`, `sl-q3-uncertainty` stay in L13.

## 12. Fidelity notes
`wavefunction` as before: exact samples, Re/Im and density on different scales, ψ is not a wave in space; the box source draws walls (`wavefunction-box-walls`); the equal mix of levels 1 and 2 is two levels standing in for the many a real sudden change makes. The clocks are stand-ins for phases. The plot of ω(k) is exact for ħ = m = 1.

## 13. Builder estimate and order
One builder, **≈ 160 steps** (≤ 170): engine and twin 28, plot curves 10, 7 units' story/values/review/glossary 70, **L13 trim** (move 3 units out, keys, symbols, concepts, arcade, tests, e2e lists, `UPDATE_META=1` twice) 32, gate 12, relay 4. If the judge wants slack, split the L13 trim into a 40-step pre-pass. Order: L14 first (owns the plot curves and the L13 trim), then L15, L16 (which also deletes the keys of `l13-schrodinger:b6/b7` and `l13-time:b6a` from `L13.values.ts`), L17, L18; the L13 `l13-flow` removal belongs to the L17/L18 builder. Merges are serial because five builders edit L13 (`UPDATE_META=1` twice after each).

## Questions for the judge (recommendation first)
1. **Notes edition.** Confirm L13's notes now end at §13.6 and re-ingest `sources/L13` (the file here is the old 12-page edition). *Recommend yes; plan assumes it.*
2. **Ownership of `l13-schrodinger`, `l13-time`, old l13-stationary (§A).** Move to L14, pointer left in L13. *Recommend move.* Fallback: L13 keeps units 6–7 and L14 units 2–5 become 2-beat link-backs plus only the new notes points (V by multiplication, light comparison, Noether subtlety, Pauli precision): about 18 beats.
3. **Cross-planner splits.** `l13-schrodinger:b6/b7` and `l13-time:b6a` to L16 (P-L16 proposes the same moves), `l13-flow` to L17/L18, `l13-schrodinger:b8`'s two-wave fringes to L15. *Recommend yes.* Two small collisions with P-L16 (the glossary id `spreading-time`; the first use of the word chirp) are in P-L15's questions 1 and 4: each recommends one owner, so no id is defined twice.
4. **Ids stay.** Moved claim keys and challenge ids keep `l13…` names (stored progress and the numpy fixtures stay valid). *Recommend yes; the builder checks whether a lint ties challenge ids to unit ids and adds an alias if so.*
5. **`wave-lab`** (deferred by R7): L13–L16 now show time sweeps, boxes and packets only through stand-in widgets. *Recommend one platform pass (skill 12) before the L15 build.*
6. **Two plot curves** `freeOmega`, `linearOmega` (T2-style additions). *Recommend approve.*
7. **Closed forms** `tentKinetic`, `topHatKineticCut` as engine functions (checked against FFT in tests). *Recommend yes.*
8. **p_t = −iħ∂ₜ aside** stays omitted (R5). *Recommend keep omitted.*
9. **Unit 1 as a unit** (the notes' 7-minute checkpoint, 6 beats), or fold into unit 2. *Recommend unit.*
