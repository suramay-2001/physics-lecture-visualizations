# P-L12 — Lecture 12 story plan: quantum dynamics and the position basis

Role P, proposal only (nothing under `app/` is touched). One track (448), sentence cap 25 words, symbols before use.
Format: `P-L11-story.md` (one table row per beat). Skill: `skills/03-chapter-plan`. Companion: `P-L13-story.md`
(it reuses the new `wavefunction` kind specified here in §9.2 and the engine module `physics/wave.ts` of §9.1: ONE build for both).

**Sources read.** Notes `sources/L12/text.md` pp. 1–14 (footers "n / 14", complete). **Vision read of p. 13**: it holds ONE sentence
(translating the state to the right shifts the graph to the right) and no figure or equation, so nothing was lost by the text
extractor. Pages 4, 8, 12 and 13 were checked on the page images (the two generator tables and boxed equations of pp. 4 and 12; one overflow on p. 8, §8). Books: Townsend 2e
§4.1 pp. 111–113 and §4.3 pp. 115–117 (time evolution, precession, now ingested), Ch. 6 §6.1 pp. 191–195, §6.2 pp. 195–197,
§6.3 pp. 197–200, §6.4 pp. 201–202 (position states, translation, generator; printed = PDF − 16); Susskind & Friedman Lecture 8
§8.1–8.2 (functions as vectors, X and P; the extract has no printed pages, so cite by section) and Lecture 4 §4.12–4.13.

**Evidence.** Every number was computed by two routes in `planL12L13-numpy.py` (scratchpad, 134 values, all asserts pass): the
engine as specified in §9.1 (FFT grid N = 4096 on [−32, 32), ħ = m = 1) against closed forms, `erf`, `scipy.integrate.quad`,
explicit matrices and finite differences. The numbers that already have an engine (P(+x; t)) were also run through the app's
`dynamics.ts precession` and agree to 1e−15 (0.75, 0.5, 4e−33, 0.25, 1).

**Conventions.** ħ = 1 and m = 1 inside the engine; lengths in a fixed length ℓ, momenta in ħ/ℓ, time in mℓ²/ħ (the UI appends the
units). A Gaussian packet is ψ(x) = (2πσ²)^(−1/4) e^{−(x−x₀)²/4σ²} e^{ip₀x}: ⟨x⟩ = x₀, Δx = σ, ⟨p⟩ = p₀, Δp = ħ/2σ. Spin
examples keep L11's energies and time as the angle εt/ħ in degrees; the three-level example has E = ε, 2ε, 4ε. Operators wear hats
(x̂, p̂) where an eigenvalue of the same name appears; L7's preview symbol p_x is this p̂ in one dimension. Helpers: `K(t,o)` = `clocks`
(levels 3, 1; start +x), `cp(o)` = complex-plane, `bl(s,o)` = bloch, `W(src,o)` = the new `wavefunction` kind with
`PK(x0,σ,p0)` = `{packet:{x0, sigma:σ, p0}}` (§9.2). Claim keys start `l12`.

**Rosetta (one beat each).** (R1) The notes' "∼" (same state up to a global phase) is ≅ (L11 R5): `l12-motion:b1`. (R2) The notes' θ(t) = ωt
is the azimuth φ(t) (L7, L11 R1): same beat. (R3) The notes' table writes the rotation generator L̂; our spin chapters used S_z (L11 R2): `l12-law:b3`.

## 0. Lecture map

| # | id | Title (≤ 8 words) | Question | Notes | Books |
|---|---|---|---|---|---|
| 1 | `l12-law` | One law, three generators | What is "time-dependent" in the law, and why is H the generator? | pp.3–5 (§12.1) | Townsend §4.1 pp.111–113 |
| 2 | `l12-motion` | Seeing the motion in a measurement | How does a changing relative phase show up as a chance? | pp.6–8 (§12.2–12.3) | Townsend §4.3 pp.115–117 |
| 3 | `l12-continuum` | From a few basis states to a continuum | How do we label states of a particle on a line? | p.9 (§12.4) | Townsend §6.1; Susskind §8.1.2 |
| 4 | `l12-wavefunction` | The wavefunction is the ket in the position basis | What is ψ(x), and what do its squares mean? | p.10 (§12.5) | Townsend §6.1 pp.194–195 |
| 5 | `l12-position-op` | Position is multiplication by x | What does x̂ do to a wavefunction? | p.11 (§12.6) | Townsend §6.1 p.195; Susskind §8.2 |
| 6 | `l12-translations` | Momentum is the generator of shifts | What operator moves a state along the line? | pp.12–14 (§12.7–12.8) | Townsend §6.2–6.4; Susskind §8.2.2 |

**Class markers.** None. The chapter is one class. Optional opener lede: "Class 12: the dynamical law, then a particle on a line."
**Ownership.** L11 owns U(t), the Hamiltonian as generator, the Schrödinger equation, stationary states and the two-level precession
(`l11-two-level`); the notes' §12.1–12.2 recap them, so this chapter gives each a **link-back beat** (b1 of units 1 and 2) and teaches
only what is new: the naming of the equation, the Noether table, the energy equation as an eigenvalue problem, the general
superposition formula, and the cos²(ωt/2) derivation (L11's Go deeper 3, `l11-two-level:b10`, states it; see Rulings 3). L12 owns the position basis, ψ(x),
x̂ → x and the first derivation of p̂ = −iħ∂ₓ. **L13's §13.2 repeats that derivation** (Rulings 2). L6 owns generators and R_z; L7 owns the
[x, p_x] preview that L13 cashes in.
**Counts.** 6 units, **38 beats** (8 + 6 + 6 + 5 + 5 + 8), 6 clues, 6 books beats, 3 link-backs, 6 derivations, 1 Go-deeper beat. Outcomes:
(1) name the law and the two meanings of "time-independent"; (2) write |ψ(t)⟩ for any superposition of energies; (3) derive P(+x; t) = cos²(ωt/2);
(4) explain why the position basis is continuous and what ψ(x) and |ψ|² are; (5) show x̂ acts as multiplication; (6) derive p̂ = −iħ∂ₓ from translations.

## 1. Story beats

### Unit 1 `l12-law` — One law, three generators
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.3 | **Link back to L11** `l11-schrodinger`: iħ d\|ψ⟩/dt = H\|ψ⟩ is the *time-dependent Schrödinger equation* (gloss `schrodinger-equation`, L11): "time-dependent" says the **state** changes. | `K(30,{show:['clocks']})` | — |
| b2 | L | p.3 | A second, separate idea: H itself may be time independent (∂H/∂t = 0, gloss `time-independent-hamiltonian`). Only then \|ψ(t)⟩ = e^{−iHt/ħ}\|ψ(0)⟩. The equation holds either way. | `K(sweep(0,90))` | — |
| b3 | L | pp.3–4 | Unitarity gives *a* Hermitian generator, not which observable it is. **Rosetta R3.** Noether's theorem, roughly (gloss `noether-theorem`): each continuous symmetry pairs a generator with a conserved quantity: shifts in space ↔ p̂ ↔ momentum, rotations ↔ L̂ ↔ angular momentum, time shifts ↔ H ↔ energy. Three unitaries of one shape: T(a) = e^{−iap̂/ħ}, R(φ) = e^{−iφL̂/ħ}, U(t) = e^{−itH/ħ}. | `{layout:'split', top: W(PK(0,1),{shift:sweep(0,3)}), bottom: bl('+x',{rotate:{axis:'z',angleDeg:sweep(0,90)}, trail:true})}` | — |
| b4 | L | p.4 | The qualification: even if H(t) depends on time the equation still gives the instant-by-instant change, but energy need not be conserved. For H constant, time symmetry gives energy conservation (L11 `l11-stationary:b4`). | `K(sweep(0,90),{readouts:['phases']})` | — |
| b5 | L | p.5 | Energies a measurement can return are H\|Eₙ⟩ = Eₙ\|Eₙ⟩, historically "the time-independent Schrödinger equation" (gloss `energy-eigenvalue-equation`): an ordinary eigenvalue problem (**link back** `l3-eigen`), nothing new. Example H = diag(ε, 2ε, 4ε). | `mx({lin:[…]},{values:'exact'})` (diag(1,2,4)) | `l12MeanH`: ⟨H⟩ of an equal mix = 7/3 → `energyAverage` |
| b6 | L | p.5 | If every state were an eigenstate nothing would move. Superpositions move: \|ψ(0)⟩ = Σcₙ\|Eₙ⟩ gives \|ψ(t)⟩ = Σcₙe^{−iEₙt/ħ}\|Eₙ⟩ (**D1**). Equal mix of ε, 2ε, 4ε at εt/ħ = 90°: each energy's chance stays ⅓, but the chance of still finding the start state drops to 1/9. | `cp({chain:{phasesDeg:[-90,-180,0], sizes:[1/3,1/3,1/3]}})` | `l12EnergyChance90` = 1/3 · `l12Survival90` = 1/9 → `levels.survival` (E2) · `l12Survival45` = 1/3 |
| b7 | B | — | Townsend §4.1 pp.111–113: unitarity (eqs. 4.2–4.3), U(dt) = 1 − iH dt/ħ, the equation, e^{−iHt/ħ} as a limit of steps, ⟨H⟩ constant, and U(t)\|E⟩ = e^{−iEt/ħ}\|E⟩. He names it simply "the Schrödinger equation". | `cp({spokes:{phasesDeg:[-90,-180,0], sizes:[0.577,0.577,0.577]}})` | `l12Phases90`: hands at −90°, −180°, 0° |
| b8 | C | p.3 | Q: Is the law "time-dependent" because H depends on t? → R: No: the state depends on t. And if all three energies were equal nothing observable would change: survival stays 1. | `K(30)` → reveal `cp({chain:{phasesDeg:[-180,-180,-180], sizes:[1/3,1/3,1/3]}})` | `l12SurvivalEqual` = 1 |

### Unit 2 `l12-motion` — Seeing the motion in a measurement
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | pp.6–7 | **Link back to L11** `l11-two-level`: H = ĒI + (ħω/2)Z gives U(t) ≅ R_z(ωt), and \|ψ(t)⟩ ≅ (\|+z⟩ + e^{iωt}\|−z⟩)/√2, the equator state at azimuth φ = ωt. **Rosettas R1, R2.** | `K(sweep(0,90),{show:['clocks','gap']})` | — |
| b2 | L | p.8 | Prepare \|+x⟩ again and again, wait t, measure X. The amplitude for +x is ⟨+x\|ψ(t)⟩ = ½(1 + e^{iωt}): two arrows of length ½ laid tip to tail. | `cp({chain:{phasesDeg:[0,60], sizes:[0.5,0.5]}})` | `l12AmpAbs60`: \|amplitude\| at ωt = 60° is 0.866 |
| b3 | L | p.8 | Square it: P(+x; t) = \|½(1 + e^{iωt})\|² = cos²(ωt/2) (**D2**), and P(−x; t) = sin²(ωt/2). At ωt = 60°, 90°: 0.75, 0.5; and 0.25 for −x. | `K(sweep(0,90),{readouts:['px']})` | `l12Px60` 0.75 · `l12Px90` 0.5 · `l12PmX60` 0.25 → `precession` |
| b4 | L | p.8 | The full chain, the notes' first complete dynamical example: energy splitting ⇒ relative phase grows ⇒ the arrow turns ⇒ the x chance oscillates. After one period T = 2π/ω the chance is back to 1. | `{layout:'split', top: K(sweep(0,180),{show:['top'],readouts:['px']}), bottom: bl('+x',{rotate:{axis:'z',angleDeg:sweep(0,360)}, measure:'x'})}` | `l12PxPeriod` = 1 at εT/ħ = 180° |
| b5 | B | — | Townsend §4.3 pp.115–117 (eqs. 4.17–4.25): a spin ½ in a field B₀ along z has H = ω₀S_z; the notes' ω is his Larmor frequency ω₀; he finds ⟨+x\|ψ(t)⟩ = cos(ω₀t/2) and ⟨S_x⟩ = (ħ/2)cos ω₀t. | `K(60,{readouts:['px']})` | `l12Px180`: P(+x) at ωt = 180° is 0 |
| b6 | C | p.8 | Q: When does an x magnet first read −x with certainty? → R: at half a period, ωt = 180° (εt/ħ = 90°): the arrow points at −x. | `K(0,{readouts:['px']})` → reveal `K(90,{readouts:['px']})` | `l12PminusXHalfPeriod` = 1 |

### Unit 3 `l12-continuum` — From a few basis states to a continuum
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.9 | Everything so far had finite bases: two for a spin, eight for three spins. L1 set position and mass aside; now we go back to them. | `W(PK(0,1))` | — |
| b2 | L | p.9 | A position measurement can return any real x, so the basis is labelled by x: a ket \|x⟩ with x̂\|x⟩ = x\|x⟩, the same structure as Z\|±z⟩ = ±\|±z⟩ (gloss `position-eigenstate`). Chop the line into 4 cells: the chance per cell. | `W(PK(0,1),{cells:4,readouts:['cell']})` | `l12CellP4`: cell [0, 4) holds 0.500 |
| b3 | L | p.9 | Completeness Σ\|n⟩⟨n\| = I becomes I = ∫dx\|x⟩⟨x\| (gloss `continuous-completeness`), and orthonormality δₙₘ becomes ⟨x\|x′⟩ = δ(x − x′) (gloss `dirac-delta`). **D4**. | `W(PK(0,1),{cells:8,readouts:['cell']})` | `l12CellP8` 0.477 · `l12CellP64` 0.0987 · `l12CellsSum64` = 1 |
| b4 | L | p.9 | Do not dwell on δ: it is the continuous Kronecker delta (**link back** `l4-basis`). Its job is to say distinct positions are orthogonal and the continuum resolves the identity. | `W(PK(0,1),{cells:64,readouts:['cell']})` | `l12CellDensity64`: chance ÷ width = 0.395 per ℓ |
| b5 | B | — | Townsend §6.1 pp.191–194: why a sum fails (infinitely many points between a and a + Δx), the integral (6.3), I = ∫dx\|x⟩⟨x\|, ⟨x\|x′⟩ = δ (6.6). Susskind §8.1.2: functions as vectors, sums become integrals, Kronecker becomes δ. | `W(PK(0,1),{cells:512,readouts:['cell']})` | `l12CellP512` 0.0125 · `l12CellDensity512` 0.3989 |
| b6 | C | p.9 | Q: Can a measurement leave a particle at exactly one x? → R: No (Townsend p.191–192: a microscope resolves only Δx ≈ λ/sin φ); \|x⟩ is an idealisation. The density still gives every interval's chance. | `W(PK(0,1),{cells:512})` → reveal `W(PK(0,1),{readouts:['peak']})` | `l12DensityAt0` = 0.3989 per ℓ |

### Unit 4 `l12-wavefunction` — The wavefunction is the ket in the position basis
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.10 | Insert I = ∫dx\|x⟩⟨x\|: \|ψ⟩ = ∫dx ψ(x)\|x⟩ with ψ(x) ≡ ⟨x\|ψ⟩, and ψ(x, t) = ⟨x\|ψ(t)⟩ (gloss `wavefunction`). Not a new object: the components of the same ket, a continuous column vector. | `W(PK(0,1),{show:['re','im','density']})` | `l12Norm` = 1 |
| b2 | L | p.10 | Normalised: ∫\|ψ\|²dx = 1. One point has zero chance; \|ψ\|² is a density (gloss `probability-density`): chance in dx = \|ψ\|²dx. | `W(PK(0,1),{show:['density'],readouts:['norm','peak']})` | `l12DensityAt0` is b6's of unit 3; here `l12PRight`: P(x > 0) = 0.5 |
| b3 | L | p.10 | Chance of finding it between a and b is ∫ₐᵇ\|ψ\|²dx (**D3**, with the projector onto the interval, **link back** `l3-projectors`). | `W(PK(0,1),{show:['density'],interval:[-1,1],readouts:['interval']})` | `l12P1sigma` 0.683 · `l12P2sigma` 0.954 → `wave.interval` (E1) |
| b4 | L | p.10 | Same Born rule: P(n) = \|⟨n\|ψ⟩\|² before, P(x to x + dx) = \|⟨x\|ψ⟩\|²dx now (**link back** `l1-sequential`, gloss `born-rule`). | `W(PK(0,1),{cells:8})` → `W(PK(0,1),{show:['density']})` (sweep of detail) | — |
| b5 | B | — | Townsend §6.1 pp.194–195 (6.9)–(6.12) and Example 6.1: ⟨φ\|ψ⟩ = ∫dx φ\*(x)ψ(x) by inserting the identity. Susskind §8.1.1 reviews ψ(x) as the state's components. | `W(PK(0,1),{show:['re','im','density']})` | — |
| b6 | C | p.10 | Q: A packet 4 times narrower has density 1.60 per ℓ at its centre. Above 1: is something wrong? → R: No. A density is not a chance; every interval's chance is at most 1. | `W(PK(0,0.25),{show:['density'],readouts:['peak']})` → reveal `W(PK(0,0.25),{show:['density'],interval:[-0.25,0.25],readouts:['interval','peak']})` | `l12PeakQuarter` 1.596 |

### Unit 5 `l12-position-op` — Position is multiplication by x
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.11 | ⟨x\| is an eigenbra: ⟨x\|x̂ = x⟨x\|, so ⟨x\|x̂\|ψ⟩ = xψ(x): in the position representation x̂ → x (**D5**, gloss `position-operator`). | `W(PK(2,1),{overlay:['xpsi']})` | `l12XPsiAt2`: (x̂ψ)(2) = 1.263 |
| b2 | L | p.11 | ⟨x̂⟩ = ⟨ψ\|x̂\|ψ⟩ = ∫dx x\|ψ\|²: the mean of a probability density. | `W(PK(2,1),{show:['density'],readouts:['xmean','xspread']})` | `l12MeanX` 2.0 · `l12SdX` 1.0 |
| b3 | L | p.11 | Nothing new about observables: still Hermitian, eigenvalues still the outcomes (**link back** `l3-eigen`); only the basis changed. | `W(PK(2,1),{show:['density']})` | `l12MeanX2` = 5 = x₀² + σ² |
| b4 | B | — | Townsend §6.1 p.195 (6.13)–(6.14): ⟨x⟩ = ∫dx ψ\*xψ. Susskind §8.2 (eigenvectors of X are delta functions) and §8.1.4 (X is Hermitian). | `W(PK(2,1),{overlay:['xpsi']})` | — |
| b5 | C | p.11 | Q: Is "multiply by x" Hermitian? → R: Yes: x is real, so ⟨φ\|xψ⟩ = ⟨xφ\|ψ⟩; the residual of two packets is 0. | `W(PK(-1,1),{overlay:['xpsi']})` → reveal `W(PK(1.5,0.7),{overlay:['xpsi']})` | `l12XHermResidual` = 0 |

### Unit 6 `l12-translations` — Momentum is the generator of shifts
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.12 | Let T(a) move a state right by a: T(a)\|x⟩ = \|x + a⟩ (gloss `translation-operator`). It is unitary, so its tiny step is I − (i/ħ)G da with G Hermitian (**link back** `l11-generator`, `l6-generator`). Physics says G = p̂ (gloss `momentum-operator`, `momentum` from L7), so T(a) = e^{−iap̂/ħ}. | `W(PK(0,1),{shift:sweep(0,3)})` | `l12ShiftNorm`: T(3) keeps ∫\|ψ\|² = 1 → `wave.translate` |
| b2 | L | p.12 | **Three generators**: rotation φ ↔ S_z, time t ↔ H, space a ↔ p̂; R_z(φ) = e^{−iφS_z/ħ}, U(t) = e^{−itH/ħ}, T(a) = e^{−iap̂/ħ}. | `{layout:'split', top: bl('+x',{rotate:{axis:'z',angleDeg:sweep(0,90)}}), bottom: W(PK(0,1),{shift:sweep(0,3)})}` | — |
| b3 | L | pp.12–13 | The shifted state's wavefunction is ψₐ(x) = ⟨x\|T(a)\|ψ⟩ = ψ(x − a): the amplitude that was at x − a is now at x. "This sign is important" (p.13): shifting right moves the graph right. | `W(PK(0,1),{shift:sweep(0,3),overlay:['original'],readouts:['xmean']})` | `l12ShiftMean` 3.0 · `l12ShiftPeak` 0.399 · `l12ShiftErr` ≈ 0 (the engine's T(3)ψ equals ψ(x − 3) to 1e−15) |
| b4 | L | p.14 | Take a = da. Route 1: ψ(x − da) ≃ ψ − da ψ′. Route 2: ⟨x\|(I − (i/ħ)p̂ da)\|ψ⟩ = ψ − (i/ħ)da ⟨x\|p̂\|ψ⟩. Compare the da terms: ⟨x\|p̂\|ψ⟩ = −iħ ψ′(x) (**D6**). | `W(PK(0,1),{shift:0.01,overlay:['original']})` | `l12PPsiIm1` Im(p̂ψ)(1) = 0.246 · `l12FirstOrderCoef`: the Taylor error is 0.158 da² |
| b5 | L | p.14 | The endpoint: in the position representation x̂ = x and p̂ = −iħ∂ₓ. Next lecture puts them into H = p̂²/2m + V(x̂). A real ψ gives an imaginary p̂ψ. | `W(PK(0,1),{overlay:['ppsi'],show:['re','im']})` | `l12PPsiRe1` = 0 |
| b6 | B | — | Townsend §6.2 pp.195–197 (translation is unitary; active vs passive, footnote p.197), §6.3 pp.197–199 ((6.24)–(6.31): G Hermitian, [x̂, G] = iħ), §6.4 pp.201–202 (the same Taylor route). Susskind §8.2.2: P = −iħ d/dx fixed by Hermiticity and units (a second route). | `W(PK(0,1),{shift:sweep(0,3),overlay:['original']})` | — |
| b7 | C | p.13 | Q: Why ψ(x − a), not ψ(x + a), for a rightward shift? → R: A peak at b of ψ sits where x − a = b, that is x = a + b (Townsend p.196). | `W(PK(1,1),{overlay:['original']})` → reveal `W(PK(1,1),{shift:2,overlay:['original'],readouts:['xmean']})` | `l12PeakPos` = 3.0 for x₀ = 0, a = 3 |
| b8 | D | — | **Go deeper 1** (beyond the notes): finite shifts from tiny ones, like L11's Go deeper 2. (I − iap̂/(Nħ))^N → T(a), with norm² 2.000, 1.337, 1.069, 1.016, 1.004 and distance to the exact shift 0.758, 0.267, 0.058, 0.0138, 0.0034 for N = 1, 4, 16, 64, 256 (a = 2, σ = 1): not unitary, the gap shrinks like 1/N. | `W(PK(0,1),{shift:2,overlay:['original']})` | `l12StepNorm{1,4,16,64,256}` · `l12StepGap{1,4,16,64,256}` → `wave.translateBySteps` |

## 2. Derivations (one track; every one has ≥ 2 distinct views on kinds the unit already shows)
- **D1 `l12-law:b6`** result `|\psi(t)\rangle = \sum_n c_n e^{-iE_nt/\hbar}|E_n\rangle`: (1) `|\psi(0)\rangle = \sum_n c_n|E_n\rangle` view `cp({spokes:{phasesDeg:[0,0,0],sizes:[0.577,0.577,0.577]}})`; (2) `|\psi(t)\rangle = \sum_n c_n\,U(t)|E_n\rangle` — "U is linear"; (3) `U(t)|E_n\rangle = e^{-iE_nt/\hbar}|E_n\rangle` — "each energy ket only turns" (L11 stationary) view spokes at −90°, −180°, 0; (4) the sum, view `cp({chain:…})` ("the survival amplitude is the chain of the three weighted arrows").
- **D2 `l12-motion:b3`** result `P(+x;t) = \cos^2(\omega t/2)`: (1) `\langle +x|\psi(t)\rangle = \tfrac12(1 + e^{i\omega t})` view chain [0, 60], sizes ½; (2) `P = |\tfrac12(1 + e^{i\omega t})|^2`; (3) `1 + e^{i\theta} = 2e^{i\theta/2}\cos\tfrac{\theta}{2}` — "two unit arrows span a rhombus whose diagonal points at half the angle" view chain sizes [1, 1]; (4) `P = \cos^2(\omega t/2)` view `K(30,{readouts:['px']})`.
- **D3 `l12-wavefunction:b3`** result `P(a<x<b) = \int_a^b|\psi(x)|^2dx`: (1) `\Pi = \int_a^b dx\,|x\rangle\langle x|` — "the projector onto positions between a and b" view W interval; (2) `P = \langle\psi|\Pi|\psi\rangle` (Born, L3); (3) insert completeness: `= \int_a^b dx\,\langle\psi|x\rangle\langle x|\psi\rangle`; (4) `= \int_a^b|\psi(x)|^2dx` view W with cells 8 and interval.
- **D4 `l12-continuum:b3`** result `\int dx\,|x\rangle\langle x| = I`: (1) `I = \sum_n|n\rangle\langle n|` view W cells 4; (2) refine the cells, `|c_n|^2\to|\psi(x_n)|^2\Delta x` view cells 64; (3) the sum of areas becomes an area, `\sum_n \Delta x\,|x_n\rangle\langle x_n|\to\int dx\,|x\rangle\langle x|`; (4) result view curve.
- **D5 `l12-position-op:b1`** result `\langle x|\hat x|\psi\rangle = x\,\psi(x)`: (1) `\hat x|x\rangle = x|x\rangle`, so its bra `\langle x|\hat x = x\langle x|` view W show re; (2) `\langle x|\hat x|\psi\rangle = x\langle x|\psi\rangle`; (3) `= x\,\psi(x)` view W overlay xpsi.
- **D6 `l12-translations:b4`** result `\langle x|\hat p|\psi\rangle = -i\hbar\,\psi'(x)`: (1) `\psi_{da}(x) = \psi(x - da)` view W shift 0.01; (2) `\simeq \psi(x) - da\,\psi'(x)`; (3) `\psi_{da}(x) = \psi(x) - \tfrac{i}{\hbar}da\,\langle x|\hat p|\psi\rangle` — "the same shifted wavefunction, from the operator"; (4) `-\tfrac{i}{\hbar}\langle x|\hat p|\psi\rangle = -\psi'(x)` view overlay ppsi; (5) `\langle x|\hat p|\psi\rangle = -i\hbar\,\psi'(x)`.

## 3. Try-it per unit
| unit | widget spec | try this |
|---|---|---|
| law | `{kind:'two-clocks', props:{upper:3, lower:1, start:'+x'}}` (L11 W3) | 1. Scrub to εt/ħ = 30°: the hands sit 60° apart. · 2. Raise both levels by 2: nothing observable changes. |
| motion | `{kind:'two-clocks', props:{upper:3, lower:1, start:'+x'}}` with the px readout | 1. Scrub to 30° (ωt = 60°): P(+x) = 0.75. · 2. To 90°: P(+x) = 0. |
| continuum | `{kind:'wave-lab', props:{sigma:1, cells:8}}` (W1, §9.3) | 1. Cells 8: the middle cell holds 0.477. · 2. Cells 64: 0.0987 each, density 0.395. · 3. Cells 512: the bars fuse into the curve. |
| wavefunction | `{kind:'wave-lab', props:{sigma:1, interval:[-1,1]}}` | 1. Drag the interval to [−2, 2]: 0.954. · 2. Set σ = 0.25: the peak density is 1.596 and every chance is still ≤ 1. |
| position-op | `{kind:'wave-lab', props:{sigma:1, x0:2, overlay:['xpsi']}}` | 1. Move x₀: ⟨x⟩ follows it. · 2. x̂ψ is ψ tilted by the factor x. |
| translations | `{kind:'wave-lab', props:{sigma:1, shift:0, overlay:['original','ppsi']}}` | 1. Drag the shift to 3: the graph moves right, ⟨x⟩ = 3, the norm stays 1. · 2. Show p̂ψ: purely imaginary for this real packet. |

## 4. Challenges (no homework; keys from the engine)
- **law**: `l12-la-name` warm-up choice: the equation iħ d\|ψ⟩/dt = H\|ψ⟩ is "the time-dependent Schrödinger equation, true whether or not H depends on t" ✓ · `l12-la-surv` core numeric survival chance of the equal ε, 2ε, 4ε mix at εt/ħ = 90° → 0.111 · `l12-la-mean` core numeric ⟨H⟩ (units ε) → 2.333.
- **motion**: `l12-mo-px` warm-up numeric P(+x) at ωt = 60° → 0.75 · `l12-mo-half` core numeric the first ωt (degrees) with P(−x) = 1 → 180 · `l12-mo-when` stretch numeric the εt/ħ (degrees) where P(+x) = 0.5 for levels 3ε, ε → 45.
- **continuum**: `l12-co-zero` warm-up choice: chance of exactly x = 0 → "zero; only intervals have chances" ✓ · `l12-co-cell` core numeric chance in the cell [0, 0.25) of the unit packet → 0.0987.
- **wavefunction**: `l12-wf-dens` warm-up numeric \|ψ(0)\|² (per ℓ) → 0.399 · `l12-wf-p` core numeric P(−1 < x < 1) → 0.683 · `l12-wf-right` core choice P(x > 0) → 0.5 ✓.
- **position-op**: `l12-po-mean` warm-up numeric ⟨x⟩ for the packet at x₀ = 2 → 2 · `l12-po-xpsi` core numeric (x̂ψ)(2) → 1.263 · `l12-po-x2` stretch numeric ⟨x²⟩ → 5.
- **translations**: `l12-tr-dir` warm-up choice: after T(a), a > 0, the graph moves to the right ✓ · `l12-tr-peak` core numeric new peak position after T(3) of a packet centred at 0 → 3 · `l12-tr-ppsi` core numeric Im(p̂ψ)(1) → 0.246 · `l12-tr-order` core order: the five steps of D6 · `l12-tr-steps` stretch numeric norm² of the 16-step product (Go deeper 1) → 1.069.
Hints nudge → key idea → setup; walkthroughs follow the derivations above.

## 5. Glossary (new 448 ids; none duplicates an existing 448 id; `position`, `momentum`, `completeness-relation`, `generator`, `hamiltonian`, `stationary-state`, `energy-eigenstate`, `born-rule` are reused)
| id | term | gloss (≤ 25 words) | first |
|---|---|---|---|
| `time-independent-hamiltonian` | time-independent Hamiltonian | A Hamiltonian that does not change with time, ∂H/∂t = 0; only then is U(t) = e^{−iHt/ħ}. | l12-law:b2 |
| `noether-theorem` | Noether's theorem (roughly) | Each continuous symmetry of the laws comes with a generator and a conserved quantity: shifts with momentum, rotations with angular momentum, time shifts with energy. | l12-law:b3 |
| `energy-eigenvalue-equation` | energy eigenvalue equation | H\|Eₙ⟩ = Eₙ\|Eₙ⟩, historically the time-independent Schrödinger equation: the energies a measurement can return and their states. | l12-law:b5 |
| `position-eigenstate` | position eigenstate \|x⟩ | The idealised state of one exact position x, with x̂\|x⟩ = x\|x⟩; a basis label, not a physical state. | l12-continuum:b2 |
| `continuous-completeness` | continuous completeness relation | I = ∫dx\|x⟩⟨x\|: the sum over a basis becomes an integral over the positions. | l12-continuum:b3 |
| `dirac-delta` | Dirac delta δ(x − x′) | The continuous Kronecker delta: zero unless x = x′, with unit area; it appears inside integrals. | l12-continuum:b3 |
| `wavefunction` | wavefunction ψ(x) | The components ⟨x\|ψ⟩ of a state in the position basis; the same ket, written as a function of position. | l12-wavefunction:b1 |
| `probability-density` | probability density \|ψ(x)\|² | Chance per unit length; multiplied by dx it gives the chance of finding the particle in that stretch. | l12-wavefunction:b2 |
| `position-operator` | position operator x̂ | The observable of position; on wavefunctions it multiplies by x. | l12-position-op:b1 |
| `translation-operator` | translation operator T(a) | The unitary that shifts a state right by a: T(a)\|x⟩ = \|x + a⟩ and ψₐ(x) = ψ(x − a). | l12-translations:b1 |
| `momentum-operator` | momentum operator p̂ | The generator of shifts, T(a) = e^{−iap̂/ħ}; on wavefunctions it is −iħ d/dx. | l12-translations:b1 |

## 6. Review cards
- **law**: the state changes by the time-dependent equation; H constant gives e^{−iHt/ħ}; superpositions of energies move, each energy's chance does not · eq `|\psi(t)\rangle = \sum_n c_n e^{-iE_nt/\hbar}|E_n\rangle` · trap: "time-dependent equation ⇒ time-dependent H".
- **motion**: amplitude ½(1 + e^{iωt}); P(+x; t) = cos²(ωt/2) · eq `P(+x;t) = \cos^2(\omega t/2)` · trap: confusing ωt with ωt/2.
- **continuum**: positions label a continuous basis; sums become integrals; a single point has no chance · eq `\int dx\,|x\rangle\langle x| = I` · trap: reading \|ψ(x)\|² as a chance.
- **wavefunction**: ψ(x) = ⟨x\|ψ⟩; density \|ψ\|²; chance ∫\|ψ\|²dx · eq `P(a<x<b) = \int_a^b|\psi|^2dx` · trap: a density above 1 is an error.
- **position-op**: x̂ multiplies; ⟨x̂⟩ is the mean of the density · eq `\langle x|\hat x|\psi\rangle = x\,\psi(x)` · trap: thinking x̂ changes the state's shape by a shift.
- **translations**: T(a) = e^{−iap̂/ħ}, ψₐ(x) = ψ(x − a), p̂ = −iħ∂ₓ · eq `\hat p = -i\hbar\,\tfrac{d}{dx}` · trap: the sign of the shift.

## 7. Symbol-before-use (first beat)
U(t), H, ħ, \|E\ₙ⟩, Z: L11 (in `Lecture.symbols` → `l12-law:b1`) · ε, εt/ħ: L11 caption · ∂H/∂t: l12-law:b2 · T(a), R(φ), L̂, p̂: b3 · Eₙ, cₙ, Σ: b5–b6 · ω, ≅, φ(t): l12-motion:b1 · \|±x⟩, P(±x; t): b2–b3 · x̂, \|x⟩, δ, ∫dx: l12-continuum:b2–b3 · ψ(x), ψ(x, t): l12-wavefunction:b1 · \|ψ\|²dx, P(a < x < b): b2–b3 · ⟨x̂⟩: l12-position-op:b2 · ψₐ, da, ψ′: l12-translations:b3–b4 · σ (packet width), ℓ: the caption of `l12-continuum:b2` ("a packet of width σ = 1ℓ").

## 8. Errata and consistency fixes (no physics error found)
Every boxed result was recomputed (P(+x; t), the sign of the shift ψ(x − a), p̂ = −iħ∂ₓ from both routes, the survival numbers); all hold. So: **no Correction box**.
1. **Overflow, p.8 (page image).** The green "full chain" box runs past the right margin and its last words ("…oscillating measurement probab") are cut off. A typesetting slip; the app prints the full chain: splitting ⇒ relative phase ⇒ rotation ⇒ oscillating probability.
2. **p.13 is a one-sentence page (vision read).** It carries only the "this sign is important" remark. The app draws the picture the notes lack (Townsend Fig. 6.2, p.196).
3. **Naming.** p.3 corrects L11's class-time naming; the built L11 never mislabelled the equation, but its gloss `schrodinger-equation` (term "Schrödinger equation") should now read "time-dependent Schrödinger equation" (Rulings 4).
4. **Overlap, not an error.** §12.1–12.3 duplicate L11's units 4–6 and Go deeper 3 (the class boundary moved: p.2). Handled by ownership (§0).
5. **Notation.** The notes themselves write the rotation generator L̂ on p.4 and S_z on p.12 (both page images) for the same role: our S_z (R3); "∼" → ≅ (R1); θ(t) → φ(t) (R2). The p.4 table also prints p, L without hats while the formulas below it use p̂, L̂.
6. **Grid hazard (engine).** The p̂ step product amplifies any high-momentum round-off; `translateBySteps` band-limits at |p| ≤ 40 (§9.1).

## 9. Engine, stage and widget gaps
**9.1 Engine (skill 11).** **E1** `physics/wave.ts` (448 engine, shared by L12 and L13; ħ = m = 1): `GRID` (N = 4096 on [−32, 32), dx = 1/64); `packet(g,{x0,sigma,p0})`; `norm`, `meanX`, `spreadX`, `meanP`, `spreadP`
(p̂ spectrally); `interval(psi,g,a,b)` = exact integral of a cubic spline of \|ψ\|² through the nodes (agrees with `erf` to 1e−7 for σ ≥ 1/8); `cellChances(psi,g,[lo,hi],n)`; `dpdx` (spectral), `pOp` = −i dψ/dx, `pOpFD` (central
differences); `xTimes`; `translate(psi,g,a)` = IFFT(e^{−ika}·FFT); `translateBySteps(psi,g,a,N)` = (I − iap̂/N)^N with a band limit \|p\| ≤ 40; `boost(psi,g,ε)` = e^{iεx}ψ;
`toMomentum`/`fromMomentum` (true phase e^{ipL/2}·FFT·dx/√2π, ordered by increasing p); `freeEvolve(psi,g,t,m)`; `commutatorXP`. Plane and two-plane sources are **analytic** (a shift is the phase e^{−ipa}, time e^{−ip²t/2}, a boost adds ε),
never put on the periodic grid. **E2** `physics/dynamics.ts` additions: `levels.evolve(E, c, t)` = cₙe^{−iEₙt}; `levels.survival(E, c, t)` = \|Σ\|cₙ\|²e^{−iEₙt}\|².
Numpy twins (all in the ledger `planL12L13-numpy.py`; port to `pipeline/make_fixtures.py` `lecture12_13_cases`): closed forms (`erf`, the analytic Gaussian, `np.linalg.eigh` exponential), `scipy.integrate.quad`,
explicit matrices, finite differences. Fixture tolerance 1e−9 (1e−6 for `interval`, 5e−5 for the stencil-based ones).
**9.2 Stage contract S1: ONE new SVG kind `wavefunction`** (skill 10; lazy chunk like the other SVG kinds; prints as a static figure at the beat's end; L13 uses it too, so build every field below once).
No existing kind draws a continuous complex function: `plot` takes NAMED real curves only, `amplitudes` has at most 32 bars.
```ts
interface WavefunctionState {
  kind: 'wavefunction'
  /** Exactly one source (ħ = m = 1; lengths in ℓ, momenta in ħ/ℓ). packet: Gaussian, ⟨x⟩ = x0, Δx = sigma, ⟨p⟩ = p0 (default 0) · plane: e^{ipx}, |ψ| flat, drawn over the window,
   *  not normalisable ("generalised eigenstate") · twoWaves: (e^{ip1x} + e^{ip2x})/√2. The engine draws every sample; content writes inputs only. */
  source: { packet: { x0: Scrub; sigma: Scrub; p0?: Scrub } } | { plane: { p: number } } | { twoWaves: { p1: number; p2: number } }
  /** Applied in this order, each may sweep: boost ε multiplies by e^{iεx̂}; shift a applies T(a) = e^{−iap̂}; time t applies free evolution e^{−ip̂²t/2}. */
  boost?: Scrub; shift?: Scrub; time?: Scrub
  /** 'position' ψ(x) (default) · 'momentum' φ(p); both = two stacked panels of the SAME state, same colours. */
  panels?: ('position' | 'momentum')[]
  /** Curves: re, im (thin lines, one amplitude scale), density (|ψ|², filled, own scale), phase (hue band under the density). Default ['re','im','density']. */
  show?: ('re' | 'im' | 'density' | 'phase')[]
  /** original = the state before boost/shift/time (dashed grey) · xpsi = (x̂ψ)(x) · ppsi = (p̂ψ)(x) = −iψ′ (re and im, dashed). Position panel only. */
  overlay?: ('original' | 'xpsi' | 'ppsi')[]
  /** Chop the position window into n equal cells (4, 8, 16, 64, 512): one bar per cell = its chance, the density curve dashed behind; n large looks like the curve. */
  cells?: number
  /** A shaded stretch [a, b] and its chance ∫|ψ|²dx. */
  interval?: [number, number]
  /** Default x: [−8, 8], p: [−8, 8] (bounds within ±16). */
  window?: { x?: [number, number]; p?: [number, number] }
  /** norm ∫|ψ|²dx · xmean/xspread · pmean/pspread · product (ΔxΔp, in ħ) · interval · peak (max |ψ|², per ℓ) · cell (the cell [0, w): chance and chance ÷ w) · wavelength (2π/p, plane only). */
  readouts?: ('norm' | 'xmean' | 'xspread' | 'pmean' | 'pspread' | 'product' | 'interval' | 'peak' | 'cell' | 'wavelength')[]
  shot?: 'W-STD'
}
```
Validation (message names the field): σ ∈ [1/8, 4]; \|x0\| ≤ 6; \|p0\| ≤ 6; \|p\|, \|p1\|, \|p2\| ≤ 8; \|boost\| ≤ 6; \|shift\| ≤ 8; time 0–8; `cells` one of the five; `interval` a < b inside the window; `overlay` and `cells` need the position panel;
`wavelength` needs a plane source; a plane or two-wave source takes no `cells`/`interval`/`overlay: original`. Interp: lerp σ, x0, p0, boost, shift, time (never wrap or snap a sweep); a change of source or panels switches at the half-way point; cells fuse by cross-fade.
Anchors `psi-re psi-im density phase-band interval cell-bar original xpsi ppsi momentum-panel`. Passport "WAVEFUNCTION · amplitude along a line". Fidelity: `wavefunction-engine` (exact: every sample is the engine's), `wavefunction-scales` (schematic: Re and Im share one scale, the density its own),
`wavefunction-not-a-wave` (misleading if read as a wave in space: ψ is an amplitude, the notes warn on L13 p.9), `wavefunction-no-delta` (misleading: no exact position state is drawn; narrow packets only). Print 320 × 300 (two panels 320 × 420).
**9.3 Widgets.** **W1** `wave-lab` (new, lazy; ComplexPlaneQc pattern, shares the S1 scene): sliders σ, x₀, p₀, shift, time, boost, a cells picker, a draggable interval, panel and overlay toggles. Reused unchanged: `two-clocks`.
**Platform items** shared with P-L10/P-L11: none new (A5, A6, A8 as ruled).

## 10. Media
No film, no Blender, no Higgsfield. (A Motion Canvas film "the packet moves" is possible later; every drawn sample would come from `wave.ts`.)

## 11. Hooks
**Concept map:** `dynamical-law` (l12-law; needs `schrodinger`, `hamiltonian-generator`) · `time-signal` (l12-motion; needs `two-level-precession`) · `position-basis` (l12-continuum; needs `completeness`) · `wavefunction` (l12-wavefunction; needs `position-basis`) · `momentum-generator` (l12-translations; needs `wavefunction`, `hamiltonian-generator`, `rz`). No 709 twin.
**Arcade:** Spot the error: `l12-law` ("time-dependent equation, so H must depend on t"), `l12-motion` ("P(+x) = cos²(ωt)"), `l12-wavefunction` ("a density above 1 is an error"), `l12-translations` ("a rightward shift gives ψ(x + a)").
**Go further in 709:** l12-translations → F4 `f4-unitary` (`sl-f4-unitary`, existing row).

## 12. Fidelity notes
`wavefunction`: see §9.2. `clocks` (units 1–2) and `complex-plane` chains: exact (L11 and F1 notes); a chain's length is an amplitude, the picture is not a place in space. `bloch` B-POLE: the azimuth is the relative phase exactly.

## Rulings requested
1. One new SVG kind `wavefunction` + widget `wave-lab` + engine `physics/wave.ts`, built once for L12 and L13 (S1, W1, E1)?
2. L13 §13.2 repeats L12 §12.7–12.8. Keep L12 as the owner of the derivation and give L13 a link-back plus the new checks (P-L13 unit 2), or fold the whole derivation into L13?
3. The notes' own §12.3 derives cos²(ωt/2); L11's Go deeper 3 already states it. Keep it as L12's lecture-phase unit 2 and turn L11's Go deeper 3 into a one-line pointer to L12?
4. Retitle the gloss `schrodinger-equation` to "time-dependent Schrödinger equation" (L11 edit) and add `time-independent-hamiltonian` and `energy-eigenvalue-equation` here?
5. A three-level example (ε, 2ε, 4ε; survival 1/9 at εt/ħ = 90°) for the general superposition formula, beyond the notes' one-line formula?
6. No class marker, opener lede only?
7. Hats on x̂, p̂ (the notes' style); L7's p_x preview is the same operator?
8. Go deeper 1 (N tiny shifts, not unitary) as the translation twin of L11's Go deeper 2?
