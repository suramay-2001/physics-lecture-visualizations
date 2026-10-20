# P-L13 — Lecture 13 story plan: position, momentum and the Schrödinger equation

Role P, proposal only (nothing under `app/` is touched). One track (448), sentence cap 25 words, symbols before use.
Format: `P-L11-story.md`. Skill: `skills/03-chapter-plan`. Companion: `P-L12-story.md`, whose §9.1 (engine module `physics/wave.ts`), §9.2 (the ONE new SVG kind
`wavefunction`) and §9.3 (widget `wave-lab`) this chapter uses unchanged; its conventions, helpers (`K`, `cp`, `bl`, `W`, `PK`) and glossary are reused here.

**Sources read.** Notes `sources/L13/text.md` pp. 1–12 (footers read "n / ??": the PDF has 12 pages, manifest). Page images checked: pp. 3, 7, 11 (the translation box, the
two-column table and commutator, the energy-shift box) and the L12 pages the chapter follows (P-L12 header). Books: Townsend 2e Ch. 6, printed pp. 191–244 (PDF − 16): §6.1 pp. 193–194 (delta), §6.3 pp. 197–200 (generator, [x̂, p̂], Ehrenfest), §6.4 pp. 201–202, §6.5 pp. 202–204
(momentum states, de Broglie), §6.6 pp. 204–210 (Gaussian packet, spreading), §6.7 pp. 210–212 (double slit); Ch. 4 §4.1 p. 112; Susskind & Friedman Lecture 8 §8.2–8.5 and Lecture 9 §9.1–9.3 (extract has no printed pages: cite by section).

**Evidence.** Two routes per number in `planL12L13-numpy.py` (scratchpad, 134 values, all asserts pass): the engine as specified (P-L12 §9.1: FFT grid, ħ = m = 1, analytic plane sources) against closed forms,
`erf`, `scipy.integrate.quad`, explicit matrices, 7-point finite differences, and Townsend's closed form (6.76) for the spreading packet. SI numbers use CODATA constants.

**Conventions.** As P-L12. New here: momentum-space amplitude ψ̃(p, t) = ⟨p\|ψ(t)⟩; Gaussian packets have Δx = σ, Δp = ħ/2σ, so ΔxΔp = ħ/2. Claim keys start `l13`.

**Rosetta (one beat each).** (R5) The notes' momentum amplitude ϕ(p, t) is written ψ̃(p, t) ("psi tilde") so φ stays the azimuth and rotation angle: `l13-momentum-space:b1`. (R6) Townsend's packet parameter a is √2 σ: `l13-momentum-space:b5a` (Formal-free, one line).
(R7) The notes use T̂ both for the translation T̂(a) (p. 3) and for the hypothetical time operator (p. 11), and L11 used T for the period; we write the time operator t̂ and keep T(a): `l13-time:b2`.

## 0. Lecture map

| # | id | Title (≤ 8 words) | Question | Notes | Books |
|---|---|---|---|---|---|
| 1 | `l13-delta` | A position eigenstate is a spike | What does an eigenstate of x̂ look like? | pp.2–3 (§13.1) | Townsend §6.1 pp.193–194; Susskind §8.2.1 |
| 2 | `l13-generator` | Why the shift's generator is momentum | What justifies calling −iħ∂ₓ momentum? | pp.3–4 (§13.2) | Townsend §6.3 pp.198–200; Susskind §8.2.2 |
| 3 | `l13-plane-wave` | A momentum eigenstate is a plane wave | What does an eigenstate of p̂ look like? | pp.4–5 (§13.3) | Townsend §6.5 pp.202–204, §6.7 |
| 4 | `l13-momentum-space` | One ket, two sets of components | How do ψ(x) and ψ̃(p) describe one state? | pp.5–6 (§13.4) | Townsend §6.5–6.6; Susskind §8.3 |
| 5 | `l13-two-bases` | Position in the momentum basis | What is x̂ in the p picture, and does the physics change? | pp.6–8 (§13.5–13.6) | Townsend §6.3–6.4; Susskind §8.4–8.5 |
| 6 | `l13-schrodinger` | The Schrödinger equation of a particle | What does the law become in the position basis? | pp.8–10 (§13.7–13.8) | Townsend §6.6 pp.208–210; Susskind L9 §9.1–9.2 |
| 7 | `l13-time` | Why time is a parameter, not an operator | Why is there no time operator beside x̂? | pp.10–12 (§13.9) | Townsend §6.3 pp.199–200 |
| 8 | `l13-energy-eq` | The energy equation in position space (optional) | Where does H\|E⟩ = E\|E⟩ fit? | pp.11–12 (§13.10) | Susskind L9 §9.3 |

**Class markers.** None. Optional opener lede: "Class 13: momentum and the Schrödinger equation." Unit 8 is the notes' optional §13.10 ("best used at the start of Lecture 14"): marked **optional** in the app (Rulings 4).
**Ownership.** L12 owns ψ(x), x̂ → x, T(a) and the derivation of p̂ = −iħ∂ₓ (unit 2 here is a link-back plus the *justification* the notes add on p. 4, Rulings 1). L13 owns the delta eigenfunction, plane waves and p = ħk, the momentum representation,
x̂ = iħ∂ₚ, [x̂, p̂] = iħ in both bases (cashing in L7's preview `l7-uncertainty:b4`), the position-space Schrödinger equation, and the time-parameter argument. L11 owns the dynamical law; L12 owns its naming.
**Counts.** 8 units, **49 beats** (6 + 5 + 7 + 6 + 8 + 7 + 7 + 3), 6 clues, 7 books beats, 4 link-backs, 9 derivations, 2 Go-deeper beats. Outcomes: (1) say why an exact position state is an idealisation; (2) explain why −iħ∂ₓ is Hermitian and is called momentum;
(3) show e^{ipx/ħ} is the momentum eigenfunction; (4) move between ψ(x) and ψ̃(p); (5) derive x̂ = iħ∂ₚ and check [x̂, p̂] = iħ in both; (6) turn the abstract law into the position-space equation and check it on a plane wave; (7) say why time is a parameter.

## 1. Story beats (W = `wavefunction`, helpers as P-L12)

### Unit 1 `l13-delta` — A position eigenstate is a spike
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.2 | **Link back to L12** `l12-wavefunction`, `l12-position-op`: ψ(x, t) = ⟨x\|ψ(t)⟩ and x̂ → x. The notes' shorthand (x̂ψ)(x, t) = ⟨x\|x̂\|ψ(t)⟩ is an operator acting on a function, not a number for the whole state. | `W(PK(0,1),{overlay:['xpsi']})` | — |
| b2 | L | p.2 | What does a state of exact position x₀ look like in the position basis? Solve x̂\|x₀⟩ = x₀\|x₀⟩: (x − x₀)ψ_{x₀}(x) = 0 (**D1**), so the amplitude vanishes away from x₀: ⟨x\|x₀⟩ = δ(x − x₀). | `W(PK(0,1))` → `W(PK(0,0.125))` | — |
| b3 | L | p.3 | Exact position means no amplitude anywhere else, like a column with one nonzero entry. A real state is a very narrow packet near x₀. Shrink σ = 1, ½, ⅛: the peak density 0.399, 0.798, 3.19 per ℓ; the chance within 0.25 ℓ of x₀: 0.197, 0.383, 0.954. | `W(PK(0,sweep(1,0.125)),{show:['density'],interval:[-0.25,0.25],readouts:['interval','peak']})` | `l13Peak1` 0.399 · `l13Peak05` 0.798 · `l13Peak0125` 3.19 · `l13NarrowP1` 0.197 · `l13NarrowP05` 0.383 · `l13NarrowP0125` 0.954 |
| b4 | L | p.3 | The delta is a distribution, \|x₀⟩ a generalised eigenket (gloss `generalized-eigenstate`), with ∫δ(x − x₀)f dx = f(x₀). Never square a delta: the narrow packets' peak density grows without bound while each stays normalised. | `W(PK(0,0.125),{show:['density'],readouts:['norm','peak']})` | `l13NarrowNorm0125` = 1 |
| b5 | B | — | Townsend §6.1 pp.193–194 ((6.5)–(6.8)): δ(x − x′) appears only inside integrals; p.205 (6.64): δ(x) is the limit of ever narrower Gaussians. Susskind §8.2.1: eigenvectors of X are delta functions. | `W(PK(0,0.125),{show:['density']})` | — |
| b6 | C | p.3 | Q: Can a real particle be in \|x₀⟩? → R: No. A sharper position needs a wider momentum spread: the σ = ⅛ packet has Δp = 4 ħ/ℓ (unit 4). | `W(PK(0,0.125),{show:['density']})` → reveal `W(PK(0,0.125),{panels:['position','momentum'],show:['density'],readouts:['pspread']})` | `l13Dp0125` = 4.0 |

### Unit 2 `l13-generator` — Why the shift's generator is momentum
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | pp.3–4 | **Link back to L12** `l12-translations`: T(a)\|x⟩ = \|x + a⟩ gives ⟨x\|T(a)\|ψ⟩ = ψ(x − a) ≃ ψ − aψ′; with T(a) = e^{−iap̂/ħ} ≃ I − iap̂/ħ the linear terms give (p̂ψ)(x) = −iħψ′. Stated once, not re-derived. | `W(PK(0,1),{shift:0.5,overlay:['original','ppsi']})` | — |
| b2 | L | p.4 | Why call the generator momentum? Unitarity alone gives *a* Hermitian generator; naming it momentum, and the ħ, uses experiment and the quantum–classical link: e^{ikx} has measured de Broglie momentum ħk. The sign comes from T being a rightward shift. | `W(PK(0,1,3),{show:['re','im','density'],readouts:['pmean']})` | `l13MeanP3`: a packet carrying e^{3ix} has ⟨p⟩ = 3 ħ/ℓ |
| b3 | L | p.4 | Quick checks: ħ∂ₓ has units of momentum; and the i makes p̂ Hermitian, shown by parts (**D2**; boundary terms vanish for decaying wavefunctions). | `W(PK(-1,1,2),{overlay:['ppsi']})` → `W(PK(1,1,3),{overlay:['ppsi']})` | `l13HermResidual` = 0 · `l13PPsiCentre`: (p̂ψ) at the centre of the p₀ = 3 packet is 1.895 = 3ψ(x₀) |
| b4 | B | — | Townsend §6.3 pp.198–200: the generator is Hermitian (6.27), [x̂, p̂] = iħ follows from the translation (6.28)–(6.31), and "momentum" is justified by Ehrenfest, d⟨x⟩/dt = ⟨p̂⟩/m (6.33); footnote p.197: other books define T(a) the other way. Susskind §8.2.2: −iD is Hermitian, ħ fixes the units. | `W(PK(0,1))` | — |
| b5 | C | p.4 | Q: Is ⟨p⟩ zero for a real packet? → R: Yes. p̂ψ is imaginary for real ψ, so ⟨ψ\|p̂ψ⟩ vanishes; a momentum needs a phase e^{ip₀x}. | `W(PK(0,1))` → reveal `W(PK(0,1,3),{readouts:['pmean']})` | `l13MeanPReal` = 0 |

### Unit 3 `l13-plane-wave` — A momentum eigenstate is a plane wave
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.4 | Solve p̂\|p⟩ = p\|p⟩ in the position basis: −iħ d⟨x\|p⟩/dx = p⟨x\|p⟩ gives ⟨x\|p⟩ = C e^{ipx/ħ} = C e^{ikx} with p = ħk (**D3**; glosses `plane-wave`, `wave-number`). | `W({plane:{p:3}},{show:['re','im']})` | — |
| b2 | L | p.4 | Normalised: ⟨x\|p⟩ = e^{ipx/ħ}/√(2πħ); check by differentiating. T(a) multiplies e^{ikx} by e^{−ika}, so the generator's value is ħk, the momentum. | `W({plane:{p:2}},{shift:sweep(0,0.7),show:['re','im','phase']})` | `l13ShiftPhaseRad` = −1.4 (−80.2°) for p = 2, a = 0.7 |
| b3 | L | p.5 | A plane wave has one exact momentum but the same \|ψ\| everywhere: completely delocalised, the opposite of the spike. | `W({plane:{p:3}},{show:['density'],readouts:['pmean','pspread']})` | `l13FlatSingle`: \|ψ\|² is the same at every x (spread 0) |
| b4 | L | p.5 | Caveat: ∫\|e^{ipx/ħ}\|²dx = ∞, so \|p⟩ is a generalised eigenstate (δ-normalised). Physical states are normalisable superpositions; a very broad packet is nearly a plane wave (σ = 4: Δp = 0.125 ħ/ℓ). | `W(PK(0,4,3),{panels:['position','momentum'],readouts:['pspread']})` | `l13Dp4` 0.125 |
| b5 | B | — | Townsend §6.5 pp.202–204 ((6.46)–(6.56)): N = 1/√(2πħ) from the delta representation; λ = h/p is the de Broglie relation (gloss `de-broglie-relation`). Example 6.5 (pp.211–212): helium at 2.2 km/s has λ = 45 pm; behind slits 8 μm apart the fringes at 1.95 m are 11 μm apart. | `W({plane:{p:3}},{readouts:['wavelength']})` | `l13LambdaHePm` 45 · `l13FringeHeUm` 11 → `wave.deBroglie`, `wave.fringeSpacing` (E1b) |
| b6 | C | p.4 | Q: For p = 3 ħ/ℓ, over what length does the phase turn once? → R: λ = 2πħ/p = 2.094 ℓ. | `W({plane:{p:3}},{show:['re']})` → reveal `W({plane:{p:3}},{show:['re'],readouts:['wavelength']})` | `l13Lambda3` 2.094 |
| b7 | D | — | **Go deeper 1** (beyond the notes): on a ring of 6 sites the shift T\|j⟩ = \|j + 1 mod 6⟩ is unitary; its eigenvalues are the six sixth roots of unity (phases 0°, ±60°, ±120°, 180°), its eigenvectors discrete plane waves: the discrete Fourier transform. <<sl-f8-dft\|Go further in 709: the discrete Fourier transform>> | `cp({clock:6, spokes:{phasesDeg:[0,-60,-120,-180,-240,-300]}})` | `l13RingPhases` · `l13RingDiag` = 0 · `l13RingUnitary` = 0 → `ring.eigenphases` (E1b) |

### Unit 4 `l13-momentum-space` — One ket, two sets of components
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.5 | A basis of momentum eigenstates is as good as the position basis: \|ψ⟩ = ∫dp ψ̃(p)\|p⟩ with ψ̃(p, t) = ⟨p\|ψ(t)⟩ (gloss `momentum-wavefunction`). **Rosetta R5.** Another representation of the same ket, not another state. | `W(PK(0,1,3),{panels:['position','momentum']})` | `l13MeanPFromPhi`: ∫p\|ψ̃\|²dp = 3 ħ/ℓ |
| b2 | L | p.5 | Insert ∫dp\|p⟩⟨p\|: ψ(x) = (2πħ)^{−1/2}∫dp e^{ipx/ħ}ψ̃(p), and inversely ψ̃(p) = (2πħ)^{−1/2}∫dx e^{−ipx/ħ}ψ(x): the Fourier pair with p for the wave number (**D4**; gloss `fourier-transform`). | `W(PK(0,1),{panels:['position','momentum']})` | `l13PhiPeak1`: peak of \|ψ̃\|² for σ = 1 is 0.798 per ħ/ℓ |
| b3 | L | p.5 | \|ψ(x, t)\|²dx and \|ψ̃(p, t)\|²dp are both chances: one ket, one system, two equally valid sets of amplitudes. | `W(PK(0,1),{panels:['position','momentum'],show:['density'],readouts:['norm']})` | `l13NormP1` = 1 |
| b4 | L | p.6 | Both normalisations hold; they are one rule, since the Fourier transform is unitary. "Representation", not "picture" (kept for later). | `W(PK(0,0.5),{panels:['position','momentum'],show:['density']})` → `W(PK(0,2),…)` | `l13NormP05` = 1 · `l13NormP2` = 1 |
| b5 | B | — | Townsend §6.5 (6.57) p.204 (the pair); §6.6 pp.204–209 ((6.59)–(6.72)): the transform of a Gaussian is a Gaussian; Δx = a/√2, Δp = ħ/(√2a), so ΔxΔp = ħ/2, the minimum. **Rosetta R6** (a = √2σ). Susskind §8.3, §8.5. | `W(PK(0,sweep(1,0.5)),{panels:['position','momentum'],readouts:['xspread','pspread','product']})` | `l13Dp1` 0.5 · `l13Dp05` 1.0 · `l13Dp2` 0.25 · `l13DxDp1` 0.5 |
| b6 | C | p.6 | Q: Halve the position width: what happens to the momentum spread? → R: it doubles (Δp = ħ/2σ), and the product stays ħ/2. | `W(PK(0,1),{panels:['position','momentum'],readouts:['product']})` → reveal `W(PK(0,0.5),…)` | `l13DxDp05` = 0.5 |

### Unit 5 `l13-two-bases` — Position in the momentum basis
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.6 | In its own basis momentum is multiplication: ⟨p\|p̂\|ψ⟩ = pψ̃(p), parallel to ⟨x\|x̂\|ψ⟩ = xψ(x). Swap roles: position must now become a derivative. | `W(PK(0,1),{panels:['position','momentum'],readouts:['pmean']})` | `l13PMeanFromPhiMul`: ∫p\|ψ̃\|²dp = 0 for the packet at rest |
| b2 | L | p.6 | Differentiate ψ̃(p) = (2πħ)^{−1/2}∫dx e^{−ipx/ħ}ψ(x) with respect to p: −ix/ħ comes down; times iħ it is the transform of xψ, which is ⟨p\|x̂\|ψ⟩. So (x̂ψ̃)(p) = iħ ∂ψ̃/∂p (**D5**). | `W(PK(2,1),{panels:['momentum'],show:['re','im']})` | `l13XMeanFromP`: ⟨x⟩ = ∫ψ̃\*(iħ∂ₚψ̃)dp = 2 ℓ for the packet at x₀ = 2 |
| b3 | L | p.7 | The board table: x̂ is x \| iħ∂ₚ, p̂ is −iħ∂ₓ \| p. Neither operator changed; the basis did. | `W(PK(2,1,3),{panels:['position','momentum'],overlay:['xpsi','ppsi']})` | — |
| b4 | L | p.7 | Commutator in the position basis (**D6**): [x̂, p̂]ψ = −iħxψ′ + iħ(xψ)′ and (xψ)′ = ψ + xψ′, so [x̂, p̂]ψ = iħψ. | `W(PK(2,1),{overlay:['xpsi','ppsi'],show:['re','im']})` | `l13CommRatio`: ([x̂, p̂]ψ)/ψ = i at x = −1, 0.5, 2 · `l13CommExp`: ⟨[x̂, p̂]⟩ = i |
| b5 | L | pp.7–8 | In the momentum basis: iħ∂ₚ(pψ̃) − iħp∂ₚψ̃ = iħψ̃. The surviving term is the derivative of the multiplying variable. So [x̂, p̂] = iħI in every basis, and ΔxΔp ≥ ħ/2: **cashes in L7's preview** (`l7-uncertainty:b4`); the Gaussians of unit 4 sit exactly on it. <<sl-q3-uncertainty\|Go further in 709: the uncertainty relation>> | `W(PK(0,2),{panels:['position','momentum'],readouts:['product']})` | `l13DxDp2` = 0.5 |
| b6 | B | — | Townsend §6.3 p.199 (6.31) and §6.4 p.202 ((6.43)–(6.45)): matrix elements of p̂ in the position basis. Susskind §8.4 (commutators, Poisson brackets) and §8.5 (the uncertainty principle). | `W(PK(0,1),{panels:['position','momentum']})` | — |
| b7 | C | p.8 | Q: Why does the commutator survive? → R: Differentiation also hits the multiplying variable: ∂ₓ(xψ) − x∂ₓψ = ψ; the same in p. | `W(PK(2,1),{overlay:['xpsi']})` → reveal `W(PK(2,1),{overlay:['xpsi','ppsi']})` | — |
| b8 | D | — | **Go deeper 2** (beyond the notes): no finite matrices X, P satisfy XP − PX = iħI: the trace of a commutator is 0, the trace of iħI₃ is 3iħ. A random 3 × 3 pair gives \|tr[X, P]\| ≈ 4e−16. That is why position needs a continuous basis. | `mx({lin:[…commutator of two Paulis…]},{values:'exact'})` | `l13TraceComm` = 0 · `l13TraceIdentity` = 3 |

### Unit 6 `l13-schrodinger` — The Schrödinger equation of a particle
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.8 | **Link back to L11 and L12** `l11-schrodinger`, `l12-law`: iħ d\|ψ⟩/dt = Ĥ\|ψ⟩. For one particle on a line the classical energy p²/2m + V suggests Ĥ = p̂²/2m + V(x̂, t) (gloss `kinetic-energy-operator`). Not a new law. | `W(PK(0,1,3),{time:sweep(0,2)})` | — |
| b2 | L | pp.8–9 | Project on ⟨x\| (the position kets do not depend on t): iħ∂ₜψ = (1/2m)⟨x\|p̂²\|ψ⟩ + Vψ; applying −iħ∂ₓ twice, ⟨x\|p̂²\|ψ⟩ = −ħ²ψ″. So iħ∂ₜψ = −(ħ²/2m)∂ₓ²ψ + Vψ (**D7**; gloss `position-space-schrodinger`). | `W(PK(0,1,3),{time:sweep(0,2),panels:['position','momentum']})` | `l13SchroResidual`: (ψ(t + h) − ψ(t))/h = −iĤψ to 1e−4 at h = 1e−6 (a check, not shown) |
| b3 | L | p.9 | What did and did not happen: kinetic energy through p̂, potential through x̂, and the position basis turned the law into a differential equation. ψ(x, t) is an amplitude, not a displacement. Scope: one spinless particle, one dimension, a local scalar potential. | `W(PK(0,1,3),{time:sweep(0,2),show:['density']})` | `l13FreeMean2`: the free packet's centre is at 6 ℓ at t = 2 (p₀t/m) |
| b4 | L | pp.9–10 | The historical route: a plane wave Ae^{i(kx−ωt)} with E = ħω, p = ħk and E = p²/2m: iħ∂ₜψ = ħωψ = Eψ and −(ħ²/2m)∂ₓ²ψ = (ħ²k²/2m)ψ = Eψ, so one equation for both (**D8**). | `W({plane:{p:2}},{time:sweep(0,1),show:['re','im','phase']})` | `l13OmegaK2` = 2 · `l13PlanePhaseDeg2` = −114.6° at t = 1 |
| b5 | L | p.10 | What this shows and what it does not: a first time derivative stands for the energy, a second space derivative for the kinetic energy; linearity gives superpositions of plane waves. A single plane wave solves it only for constant V. ψ is an amplitude; a water wave is observable. | `W(PK(0,1,3),{time:sweep(0,4)})` | — |
| b6 | B | — | Townsend §6.6 pp.208–210 ((6.73)–(6.77)): the Gaussian under free evolution; the spreading time T = ma²/ħ is 10⁻¹⁶ s for an electron in an atom-sized packet and 10²⁵ s (3 × 10¹⁷ years) for 1 g with a = 0.1 cm; Δp never changes. Ch. 4 §4.1 p.112: Schrödinger first wrote it as a wave equation. Susskind L9 §9.1–9.2. | `W(PK(0,1,3),{time:sweep(0,4),panels:['position','momentum']})` | `l13FreeDp4` 0.5 · `l13SpreadElectronSeconds` 8.6e−17 · `l13SpreadMarbleSeconds` 9.5e24 · `l13SpreadMarbleYears` 3.0 (×10¹⁷) |
| b7 | C | p.10 | Q: Does a free packet keep its width? → R: No. Δx grows from 1 to 1.41 at t = 2 and 2.24 at t = 4 (σ√(1 + (ħt/2mσ²)²)), while Δp stays 0.5. | `W(PK(0,1,3),{time:0,show:['density'],readouts:['xspread']})` → reveal `…time:4` | `l13FreeSd2` 1.414 · `l13FreeSd4` 2.236 |

### Unit 7 `l13-time` — Why time is a parameter, not an operator
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.10 | A real difference: the experimenter chooses the measurement time with a clock; the state gives the chances of positions then: P(x in dx \| t) = \|ψ(x, t)\|²dx. At each t the wavefunction is a complete state; \|ψ\|² is not a joint density of x and t. | `W(PK(0,1,3),{time:sweep(0,4),show:['density'],readouts:['norm']})` | `l13FreeNorm4` = 1 at t = 4 |
| b2 | L | p.10 | No conflict with generators: a generator's parameter need not be an observable. U(a) = e^{−iap̂/ħ} shifts in space, U(τ) = e^{−iĤτ/ħ} in time; with no explicit t in H, time symmetry gives energy conservation (Noether, L12). No separate operator needed. **Rosetta R7.** | `{layout:'split', top: W(PK(0,1),{shift:sweep(0,3)}), bottom: K(sweep(0,90))}` | `l13FreeCommutator`: [Ĥ_free, p̂] = 0, so momentum is conserved |
| b3 | L | p.11 | Could time be conjugate to energy, [t̂, Ĥ] = iħ? Then V(ε) = e^{−iεt̂/ħ} gives V Ĥ V† = Ĥ + ε (**D9**): every energy shifted by any ε. The same algebra for x̂ and p̂ shifts a momentum curve rigidly: multiplying ψ by e^{iεx} adds ε, here 1.5, to every momentum and leaves Δp = 0.5. | `W(PK(0,1),{panels:['position','momentum'],boost:sweep(0,1.5),readouts:['pmean','pspread']})` | `l13BoostMean` 1.5 · `l13BoostSd` 0.5 · `l13WpWdag` = 0 (e^{−iεx̂}p̂e^{iεx̂} = p̂ + ε) |
| b4 | L | p.11 | But energies have a lowest value E ≥ E₀; a free particle has E = p²/2m ≥ 0, and a negative shift would need states below it. Read it carefully: time evolution changes the phases of existing energy components; clocks and time intervals are measurable; Pauli's argument rules out a universal conjugate to a Hamiltonian bounded below, not every time observable. | `K(sweep(0,90))` | — |
| b5 | L | p.12 | Consolidation (the notes' four points): the state is a ket and wavefunctions are its components; x̂ = x, p̂ = −iħ∂ₓ \| p̂ = p, x̂ = iħ∂ₚ; the differential equation is the abstract law in the position basis; Ĥ generates time shifts without a universal energy-shifting operator, and time says *when* positions are predicted. | `W(PK(0,1,3),{panels:['position','momentum'],time:sweep(0,2)})` | — |
| b6 | B | — | Townsend §6.3 pp.199–200 ((6.33)–(6.36)): momentum is conserved exactly when Ĥ commutes with p̂, that is V independent of x: the spatial twin of energy conservation. For V = x²/2 and a packet at x₀ = 2, d⟨p⟩/dt = −⟨V′⟩ = −2. | `W(PK(2,1),{overlay:['ppsi']})` | `l13EhrenfestDpDt` = −2 |
| b7 | C | p.11 | Q: Why would shifting every free-particle energy by −1 break something? → R: The lowest free energy is 0 (p = 0); −1 is not in the spectrum. | `W({plane:{p:0}},{show:['re']})` → reveal `W(PK(0,1),{panels:['momentum'],readouts:['pmean']})` | `l13MinFreeEnergy` = 0 |

### Unit 8 `l13-energy-eq` — The energy equation in position space (optional)
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | pp.11–12 | **Optional (notes §13.10).** For a time-independent Ĥ and \|ψ(0)⟩ = \|E⟩, \|ψ(t)⟩ = e^{−iEt/ħ}\|E⟩ (L11, L12). Projecting Ĥ\|E⟩ = E\|E⟩ on ⟨x\| with φ_E(x) = ⟨x\|E⟩ gives [−(ħ²/2m)d²/dx² + V]φ_E = Eφ_E: not a separate postulate (gloss `energy-eigenfunction`). | `W({plane:{p:2}},{time:sweep(0,2),show:['density']})` | — |
| b2 | L | p.12 | Stationary: ψ(x, t) = e^{−iEt/ħ}φ_E(x); the phase turns but \|ψ\|² = \|φ_E\|² does not. A superposition of different energies moves: waves p = 2 and 4 (E = 2 and 8, m = 1) give fringes π ℓ apart, travelling at (p₁ + p₂)/2m = 3 ℓ per unit time. | `W({twoWaves:{p1:2,p2:4}},{time:sweep(0,2),show:['density']})` | `l13FringeSpacing` π · `l13FringeSpeed` 3.0 (tracked) = `l13FringeSpeedFormula` 3.0 |
| b3 | B | — | Susskind L9 §9.3: the time-independent equation for free particles; any solution is a sum of energy eigenstates, only phases change. | `W({twoWaves:{p1:2,p2:4}},{time:1})` | — |

## 2. Derivations (one track; ≥ 2 distinct views each, kinds already on the unit's stage)
- **D1 `l13-delta:b2`** result `\langle x|x_0\rangle = \delta(x-x_0)`: (1) `\hat x|x_0\rangle = x_0|x_0\rangle` view W σ = 1; (2) project on ⟨x\|: `x\,\psi_{x_0}(x) = x_0\,\psi_{x_0}(x)`; (3) `(x - x_0)\,\psi_{x_0}(x) = 0` — "a product is zero only if one factor is" view W σ = ⅛; (4) the amplitude lives at x₀ alone: `\langle x|x_0\rangle = \delta(x - x_0)`.
- **D2 `l13-generator:b3`** result `\int\varphi^*(-i\hbar\psi')dx = \int(-i\hbar\varphi')^*\psi\,dx`: (1) `\langle\varphi|\hat p\psi\rangle = \int\varphi^*(-i\hbar\psi')dx` view W(−1, 1, 2) overlay ppsi; (2) integrate by parts: `= [-i\hbar\varphi^*\psi] + \int(i\hbar\varphi'^*)\psi\,dx`; (3) the boundary term vanishes; the sign flip is absorbed by conjugating: `i\hbar\varphi'^* = (-i\hbar\varphi')^*`, view W(1, 1, 3); (4) result, so `\hat p = \hat p^\dagger`.
- **D3 `l13-plane-wave:b1`** result `\langle x|p\rangle = C e^{ipx/\hbar}`: (1) `\hat p|p\rangle = p|p\rangle` view W plane p = 3 show re, im; (2) project: `-i\hbar\,\tfrac{d}{dx}\langle x|p\rangle = p\,\langle x|p\rangle`; (3) `\tfrac{d}{dx}f = \tfrac{ip}{\hbar}f` — "the function whose slope is a constant times itself"; (4) result, view W plane show phase.
- **D4 `l13-momentum-space:b2`** result `\psi(x) = \tfrac{1}{\sqrt{2\pi\hbar}}\int dp\,e^{ipx/\hbar}\tilde\psi(p)`: (1) `\psi(x) = \langle x|\psi\rangle = \int dp\,\langle x|p\rangle\langle p|\psi\rangle` — "insert the momentum identity" view W position panel; (2) substitute `\langle x|p\rangle = e^{ipx/\hbar}/\sqrt{2\pi\hbar}`; (3) result, view both panels.
- **D5 `l13-two-bases:b2`** result `(\hat x\tilde\psi)(p) = i\hbar\,\partial_p\tilde\psi(p)`: (1) `\tilde\psi(p) = \tfrac{1}{\sqrt{2\pi\hbar}}\int dx\,e^{-ipx/\hbar}\psi(x)` view W momentum panel; (2) `\partial_p\tilde\psi = \tfrac{1}{\sqrt{2\pi\hbar}}\int dx\,(-\tfrac{ix}{\hbar})e^{-ipx/\hbar}\psi`; (3) multiply by iħ: `i\hbar\,\partial_p\tilde\psi = \tfrac{1}{\sqrt{2\pi\hbar}}\int dx\,e^{-ipx/\hbar}\,x\psi(x)`, view W position overlay xpsi; (4) `= \langle p|\hat x|\psi\rangle`.
- **D6 `l13-two-bases:b4`** result `[\hat x,\hat p]\psi = i\hbar\psi`: (1) `\hat x(\hat p\psi) = -i\hbar\,x\psi'` view W overlay ppsi; (2) `\hat p(\hat x\psi) = -i\hbar\,(x\psi)'` view overlay xpsi; (3) product rule `(x\psi)' = \psi + x\psi'`; (4) subtract: `-i\hbar x\psi' + i\hbar(\psi + x\psi') = i\hbar\psi`.
- **D7 `l13-schrodinger:b2`** result `i\hbar\,\partial_t\psi = -\tfrac{\hbar^2}{2m}\partial_x^2\psi + V\psi`: (1) `i\hbar\,\langle x|\tfrac{d}{dt}|\psi\rangle = \langle x|\hat H|\psi\rangle` view W time sweep; (2) `\langle x|\hat p^2|\psi\rangle = -\hbar^2\psi''` — "apply −iħ∂ₓ twice"; (3) `\langle x|V(\hat x)|\psi\rangle = V(x)\psi`; (4) assemble, view both panels.
- **D8 `l13-schrodinger:b4`** result `i\hbar\,\partial_t\psi = -\tfrac{\hbar^2}{2m}\partial_x^2\psi`: (1) `\psi = Ae^{i(kx - \omega t)}` view W plane t = 0; (2) `i\hbar\,\partial_t\psi = \hbar\omega\psi = E\psi`; (3) `-\tfrac{\hbar^2}{2m}\partial_x^2\psi = \tfrac{\hbar^2k^2}{2m}\psi = E\psi` view plane t = 1; (4) the two left sides equal for the same ψ: the equation.
- **D9 `l13-time:b3`** result `V\hat H V^\dagger = \hat H + \epsilon`: (1) `V\hat H V^\dagger = \hat H - \tfrac{i\epsilon}{\hbar}[\hat t,\hat H] + \dots` view W boost 0; (2) `[\hat t,\hat H] = i\hbar` ends the series; (3) `= \hat H + \epsilon`, view W boost 1.5 (the x̂, p̂ twin).

## 3. Try-it per unit
| unit | widget spec | try this |
|---|---|---|
| delta | `{kind:'wave-lab', props:{sigma:1, interval:[-0.25,0.25]}}` | 1. Shrink σ to ⅛: the chance in the window climbs to 0.954 and the peak to 3.19. · 2. The delta is the limit you never reach. |
| generator | `{kind:'wave-lab', props:{sigma:1, p0:3, overlay:['ppsi']}}` | 1. p̂ψ is almost 3ψ: ⟨p⟩ = 3. · 2. Set p₀ = 0: p̂ψ turns imaginary and ⟨p⟩ = 0. |
| plane-wave | `{kind:'wave-lab', props:{plane:{p:3}}}` | 1. Wavelength 2.094 ℓ. · 2. The density is flat: perfectly known p, no position at all. |
| momentum-space | `{kind:'wave-lab', props:{sigma:1, panels:['position','momentum']}}` | 1. Halve σ: Δp doubles, ΔxΔp stays 0.5. · 2. Add p₀: only the momentum curve slides. |
| two-bases | `{kind:'wave-lab', props:{sigma:2, x0:2, overlay:['xpsi','ppsi'], panels:['position','momentum']}}` | 1. Compare ψ, x̂ψ, p̂ψ. · 2. Widest σ = 4: the narrowest momentum curve. |
| schrodinger | `{kind:'wave-lab', props:{sigma:1, p0:3, time:0}}` | 1. Press play: the centre moves at p₀/m = 3 ℓ per unit time. · 2. Δx grows (1 → 2.24 at t = 4) while Δp stays 0.5. |
| time | `{kind:'wave-lab', props:{sigma:1, panels:['momentum'], boost:0}}` | 1. Drag the boost to 1.5: the momentum curve slides by 1.5, its width does not change. |
| energy-eq | `{kind:'wave-lab', props:{twoWaves:{p1:2,p2:4}, time:0}}` | 1. Fringes π ℓ apart. · 2. Play: they move at 3 ℓ per unit time. |

## 4. Challenges (no homework; keys from the engine)
- **delta**: `l13-de-peak` warm-up numeric peak density of the σ = ⅛ packet → 3.19 · `l13-de-chance` core numeric chance within 0.25 ℓ for σ = ⅛ → 0.954 · `l13-de-real` core choice: "a real particle can be in \|x₀⟩" → false ✓.
- **generator**: `l13-ge-mean` warm-up numeric ⟨p⟩ of the e^{3ix} packet → 3 · `l13-ge-i` core choice: the i in −iħ∂ₓ is there so p̂ is Hermitian ✓ · `l13-ge-centre` stretch numeric (p̂ψ)(x₀) for p₀ = 3, σ = 1 → 1.895.
- **plane-wave**: `l13-pw-lam` warm-up numeric λ for p = 3 → 2.094 · `l13-pw-he` core numeric helium fringe spacing in μm → 11 · `l13-pw-ring` stretch numeric the phase (degrees) of the ring shift's first nonzero eigenvalue → 60.
- **momentum-space**: `l13-ms-dp` warm-up numeric Δp for σ = 1 → 0.5 · `l13-ms-half` core numeric Δp for σ = ½ → 1 · `l13-ms-prod` core numeric ΔxΔp for σ = 2 → 0.5 · `l13-ms-order` core order the three steps of D4.
- **two-bases**: `l13-tb-comm` warm-up choice: [x̂, p̂] = iħ holds in both bases ✓ · `l13-tb-xmean` core numeric ⟨x⟩ through iħ∂ₚ for x₀ = 2 → 2 · `l13-tb-order` core order the four steps of D6 · `l13-tb-trace` stretch numeric \|tr(iħI₃)\|/ħ → 3.
- **schrodinger**: `l13-sc-omega` warm-up numeric ω = ħk²/2m for k = 2, m = 1 → 2 · `l13-sc-mean` core numeric the centre at t = 2 for p₀ = 3 → 6 · `l13-sc-sd` core numeric Δx at t = 4 for σ = 1 → 2.236 · `l13-sc-order` core order D7 · `l13-sc-electron` stretch numeric log₁₀ of the spreading time (s) of an atom-sized electron packet → −16 (tolerance 0.1).
- **time**: `l13-ti-which` warm-up choice: time is a parameter that labels the state ✓ · `l13-ti-boost` core numeric ⟨p⟩ after multiplying by e^{1.5ix} → 1.5 · `l13-ti-min` core numeric the lowest free-particle energy → 0 · `l13-ti-ehren` stretch numeric d⟨p⟩/dt for V = x²/2, x₀ = 2 → −2.
- **energy-eq**: `l13-ee-space` warm-up numeric the fringe spacing for p = 2 and 4 → 3.142 · `l13-ee-speed` core numeric the fringe speed → 3.
Hints nudge → key idea → setup; walkthroughs follow the derivations above.

## 5. Glossary (new 448 ids; no duplicates; reused from L12: `wavefunction`, `position-eigenstate`, `dirac-delta`, `position-operator`, `momentum-operator`, `translation-operator`, `noether-theorem`; from earlier: `commutator`, `uncertainty-relation`, `hamiltonian`, `schrodinger-equation`, `energy-eigenstate`, `stationary-state`, `hermitian`, `unitary`)
| id | term | gloss (≤ 25 words) | first |
|---|---|---|---|
| `generalized-eigenstate` | generalised eigenstate | An idealised eigenstate such as \|x₀⟩ or \|p⟩ that cannot be normalised; physical states are normalisable superpositions of them. | l13-delta:b4 |
| `plane-wave` | plane wave e^{ikx} | A wave of one wavelength whose size is the same everywhere; the momentum eigenfunction. | l13-plane-wave:b1 |
| `wave-number` | wave number k | Phase turned per unit length, k = 2π/λ; the momentum is p = ħk. | l13-plane-wave:b1 |
| `de-broglie-relation` | de Broglie relation | A particle of momentum p has wavelength λ = h/p = 2πħ/p. | l13-plane-wave:b5a |
| `momentum-wavefunction` | momentum amplitude ψ̃(p) | The components ⟨p\|ψ⟩ of a state in the momentum basis; its square is the momentum density. | l13-momentum-space:b1 |
| `fourier-transform` | Fourier transform | The integral that turns ψ(x) into ψ̃(p) and back; it is unitary. | l13-momentum-space:b2 |
| `wave-packet` | wave packet | A normalisable superposition of momentum states that is localised in position. | l13-plane-wave:b4 |
| `gaussian-packet` | Gaussian packet | A packet shaped like e^{−x²/4σ²}: Δx = σ, Δp = ħ/2σ, so ΔxΔp = ħ/2, the smallest allowed. | l13-momentum-space:b5a |
| `kinetic-energy-operator` | kinetic energy p̂²/2m | The energy of motion, written with the momentum operator; in position space −(ħ²/2m)d²/dx². | l13-schrodinger:b1 |
| `position-space-schrodinger` | position-space Schrödinger equation | iħ∂ₜψ = −(ħ²/2m)∂ₓ²ψ + Vψ: the abstract law for one particle, written in the position basis. | l13-schrodinger:b2 |
| `free-particle` | free particle | A particle with V = 0; its energy eigenstates are plane waves and E = p²/2m. | l13-schrodinger:b4 |
| `lowest-energy` | lowest energy E₀ | The smallest energy a system can have; every energy is ≥ E₀ (a free particle: 0). | l13-time:b3 |
| `time-operator` | time operator t̂ | A hypothetical observable with [t̂, Ĥ] = iħ; ordinary quantum mechanics has none, time is a parameter. | l13-time:b3 |
| `energy-eigenfunction` | energy eigenfunction φ_E(x) | The position-basis form ⟨x\|E⟩ of an energy eigenstate; it solves the time-independent equation. | l13-energy-eq:b1 |

## 6. Review cards
- **delta**: x̂\|x₀⟩ = x₀\|x₀⟩ forces amplitude only at x₀; exact position is an idealisation, narrow packets are the real thing · eq `\langle x|x_0\rangle = \delta(x - x_0)` · trap: squaring a delta.
- **generator**: p̂ = −iħ∂ₓ is Hermitian; calling it momentum rests on experiment and Ehrenfest · eq `\hat p = -i\hbar\,\tfrac{d}{dx}` · trap: believing unitarity alone names the observable.
- **plane-wave**: e^{ipx/ħ}/√(2πħ); p = ħk; flat density · eq `\langle x|p\rangle = \tfrac{e^{ipx/\hbar}}{\sqrt{2\pi\hbar}}` · trap: normalising a plane wave.
- **momentum-space**: one ket, two components; the Fourier pair; Δp = ħ/2σ for a Gaussian · eq `\Delta x\,\Delta p = \hbar/2` · trap: treating ψ̃ as another state.
- **two-bases**: x̂ = iħ∂ₚ, p̂ = p; [x̂, p̂] = iħ in both · eq `[\hat x,\hat p] = i\hbar` · trap: forgetting the product rule.
- **schrodinger**: the law in the position basis; ψ is an amplitude; free packets spread, Δp does not · eq `i\hbar\,\partial_t\psi = -\tfrac{\hbar^2}{2m}\partial_x^2\psi + V\psi` · trap: reading ψ as a displacement.
- **time**: time labels the state, position labels an outcome; no unrestricted energy-shift operator · eq `V\hat H V^\dagger = \hat H + \epsilon` · trap: "time cannot be measured".
- **energy-eq**: the energy equation is the eigenvalue problem in position space; stationary means \|ψ\|² fixed · eq `\left[-\tfrac{\hbar^2}{2m}\tfrac{d^2}{dx^2} + V\right]\varphi_E = E\varphi_E` · trap: "stationary" means the ket is constant.

## 7. Symbol-before-use (first beat)
x̂, ψ(x, t), \|x⟩, δ: L12 (mapped in `Lecture.symbols` to `l13-delta:b1`) · x₀, ψ_{x₀}: l13-delta:b2 · p̂, T(a), ψ′: L12 · ħ∂ₓ, units: l13-generator:b3 · ⟨p⟩, p₀: l13-generator:b2 · \|p⟩, k, C: l13-plane-wave:b1 · λ: b5 · ψ̃(p), \|p⟩⟨p\|: l13-momentum-space:b1–b2 · Δx, Δp, σ: b5 (caption of b3, which defines σ) · iħ∂ₚ: l13-two-bases:b2 · [x̂, p̂]: b4 (L7 symbol `[x, p_x]` mapped here) · V, m, Ĥ: l13-schrodinger:b1 · ω, E, A: b4 · t̂, V(ε), E₀: l13-time:b3 · ε (a shift of energy; not L11's unit ε: the caption says "ε here is any number") · φ_E: l13-energy-eq:b1.

## 8. Errata and consistency fixes (no physics error found; no Correction box)
Recomputed and holding: the shift ψ(x − a) and −iħ∂ₓ, ⟨x\|p⟩ = e^{ipx/ħ}/√(2πħ), both Fourier relations, x̂ = iħ∂ₚ, [x̂, p̂]ψ = iħψ in both bases (`l13CommRatio`, `l13XMeanFromP`), the free-particle check, the p. 11 shift V Ĥ V† = Ĥ + ε (via its x̂, p̂ twin, `l13WpWdag` 1.6e−14), and Townsend's printed numbers (45 pm, 11 μm, 10⁻¹⁶ s, 10²⁵ s, 3 × 10¹⁷ years: all reproduced).
1. **Footers (page images pp. 3, 7, 11).** Every page ends "n / ??": an unresolved LaTeX reference. The PDF has 12 pages. Cite by the footer's n.
2. **Notation clash (page images pp. 3 and 11).** T̂(a) is the translation on p. 3 and T̂ the hypothetical time operator on p. 11, in one lecture (and L11's T is the period): R7, t̂.
3. **ϕ(p) vs φ.** The notes' momentum amplitude ϕ clashes with the course's azimuth φ: R5, ψ̃.
4. **Overlap.** §13.2 repeats L12 §12.7–12.8 (the notes teach it twice on purpose): ownership above.
5. **Sign nit (p. 11 box).** With V Ĥ V† = Ĥ + ε the state V\|E⟩ has energy E − ε, since ĤV\|E⟩ = (E − ε)V\|E⟩. The argument needs only that ε is any real number, so it stands; the app words it "shifted by ε" and shows the x̂, p̂ twin.
6. **Rounding, not an error (Townsend p. 212).** λ/d is printed 5.6 × 10⁻⁶ from the rounded 45 pm; the engine gives 5.66 × 10⁻⁶. The app shows 45 pm and 11 μm only.
7. **Scope remark kept (p. 10).** The plane-wave check in §13.8 is for V = 0 (ħω = ħ²k²/2m); for constant V ≠ 0 the energy gains V. The app keeps its examples free and says so.
8. **Omitted by the notes' own flag (p. 11).** The "optional, only if a student asks" history formalism (p_t = −iħ∂ₜ) is left out (Rulings 5).

## 9. Engine, stage and widget gaps
**9.1 Engine.** **E1** `physics/wave.ts` is P-L12 §9.1 (this chapter uses `packet`, `meanP`, `spreadP`, `interval`, `pOp`, `toMomentum`, `fromMomentum`, `boost`, `freeEvolve`, `commutatorXP`, `translate`). **E1b (new here, same module, with twins in the ledger):**
`deBroglie(h, m, v)` = h/(mv); `fringeSpacing(L, lam, d)` = Lλ/d; `spreadTime(m, a)` = ma²/ħ; `gaussianWidth(σ, t, m)` = σ√(1 + (ħt/2mσ²)²) (the closed form; the engine's `spreadX` of `freeEvolve` is checked against it);
`ring.shift(n)` (the cyclic permutation) and `ring.eigenphases(n)` (degrees, through `qc/fourier dftMatrix`; twin `np.linalg.eig`); `traceCommutator(X, P)` via `qc/cmat`. A new constants module `physics/constants.ts` (CODATA 2019: h, ħ, m_e, m_He, the year in seconds) is needed for units 3 and 6 (Rulings 6).
Fixture tolerances: 1e−9 (1e−6 for `interval`, 5e−5 for the 7-point stencil in `l13XMeanFromP`; the checks `l13SchroResidual` 1e−4).
**9.2 Stage contract.** None new: every picture is S1 `wavefunction` (P-L12 §9.2) with L13's fields `plane`, `twoWaves`, `boost`, `time`, `panels`, `overlay`. The two other kinds are existing: `complex-plane` with `clock: 6` + `spokes` (Go deeper 1), `matrix` (Go deeper 2), `clocks` (unit 7).
**9.3 Widgets.** W1 `wave-lab` (P-L12 §9.3), extended with a plane/two-wave source picker, a play button for `time`, and a boost slider (all fields exist in S1).

## 10. Media
None. (Optional Motion Canvas film "the packet spreads": every drawn sample from `wave.ts freeEvolve`.)

## 11. Hooks
**Concept map:** `delta-spike` (l13-delta; needs `position-basis`) · `plane-wave` (l13-plane-wave; needs `momentum-generator`) · `momentum-space` (l13-momentum-space; needs `plane-wave`, `wavefunction`) · `commutator-bases` (l13-two-bases; needs `momentum-space`, `uncertainty`) · `schrodinger-position` (l13-schrodinger; needs `commutator-bases`, `schrodinger`) · `time-parameter` (l13-time; needs `schrodinger-position`, `dynamical-law`) · `energy-eq-position` (l13-energy-eq; needs `schrodinger-position`, `stationary-states`).
**Arcade:** "Squeeze" (new, skill 13): drag σ to hit a target Δp; verdict from `spreadP` (Δp = ħ/2σ) · Spot the error: `l13-plane-wave` ("\|e^{ipx}\|² integrates to 1"), `l13-two-bases` ("x̂ → x commutes with −iħ∂ₓ"), `l13-schrodinger` ("one plane wave solves it for any V"), `l13-time` ("time is a parameter because it cannot be measured").
**Go further in 709:** l13-plane-wave → F8 `f8-dft` (`sl-f8-dft`, new bridge row), l13-two-bases → Q3 `q3-uncertainty` (`sl-q3-uncertainty`, new bridge row). Both targets are built units (ids checked).

## 12. Fidelity notes
`wavefunction` as P-L12 §9.2: exact samples; the scales of Re/Im and density differ; ψ is not a wave in space; no exact position state is ever drawn (units 1, 3: the spike is a limit, the plane wave is drawn over the window only). `complex-plane` clock: the six phases are exact roots of unity.

## Rulings requested
1. L12 owns the first derivation of p̂ = −iħ∂ₓ; L13 unit 2 is a link-back plus the notes' justification (units, Hermitian i, "uses experiment") and Townsend's Ehrenfest argument?
2. ψ̃(p, t) for the notes' ϕ(p, t) (R5), and t̂ for the notes' time operator T̂ (R7)?
3. Townsend's a = √2σ in one Rosetta line, with Δx = σ as the course's width (R6)?
4. §13.10 as an optional lecture-phase unit 8 (3 beats), or Go deeper beats of unit 7, or left to Lecture 14's chapter?
5. Omit the notes' "only if a student asks" p_t formalism?
6. SI numbers (helium fringes, spreading times) need a constants module: first SI use in 448; approve, or keep units 3 and 6 dimensionless?
7. Go deeper 1 (the 6-ring, DFT) and Go deeper 2 (the trace argument) beyond the notes?
8. One shared `wavefunction` kind and `wave-lab` for both chapters: build order L12 first, or one platform pass before both?
