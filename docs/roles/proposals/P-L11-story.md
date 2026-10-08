# P-L11 — Lecture 11 story plan: quantum dynamics

Role P, proposal only (nothing under `app/` is touched). One track (448), sentence cap 25 words, symbols before use.
Format: `P-L7-story.md`, compressed (one table row per beat). Skill: `skills/03-chapter-plan`. Companion: `P-L10-story.md`
(which owns L11 §§11.1–11.3, ruling 1; its conventions, helpers and §9.2 platform items are reused here).

**Sources read.** `sources/L11/text.md` pp. 1–2 and 10–19 (§§11.4–11.10; 19 pages, footers "n / 19", complete; contact
sheets checked: boxed equations, one two-column table on p.13, no figures). Books: Susskind & Friedman Lecture 4
§4.1–4.13 (time and change: unitarity, the Hamiltonian, ħ, energy conservation, spin in a field, solving the equation),
Lecture 6 §6.9's closing remark (an entangled-spin Hamiltonian; book exercise, not homework). Townsend 2e §2.2,
pp. 36–40 (rotations built from tiny turns: the analogy L11 draws). **Townsend Ch. 4 (time evolution) is not ingested**
(the local PDF extract stops at printed p. 96, then pp. 171–183), so it is not cited.

**Evidence.** Every number was computed twice: the app's engine, bundled read-only to the scratchpad
(`plan448-engine.ts`, `plan448-extra.ts`, `plan448-L11b.ts`: `expm2`, `Rz`, `blochVector`, `prob`, `expectation`,
`eulerLimit`, `isUnitary`, `samePhysicalState`), and the independent numpy script `plan448-L10L11-numpy.py`. All agree.
Judge facts re-checked: H = ĒI + (ħω/2)Z gives U(t) = e^{−iĒt/ħ}R_z(ωt) exactly, and \|+x⟩ evolves to
(\|+z⟩ + e^{iωt}\|−z⟩)/√2 up to a global phase.

**Conventions.** ħ = 1 in the engine. **Example energies (ruling 2 requested):** E₊ = 3ε, E₋ = ε in a fixed energy
unit ε, so Ē = 2ε, ħω = 2ε; time is shown as the angle εt/ħ in degrees. Then a quarter turn of the arrow is εt/ħ =
45°, a full lap 180°, and U(T) = −I exactly. Helpers: `bl(state,o)` = `{kind:'bloch', state, ...o}`; `op(o)` =
operator-space; `mx(src,o)` = `{kind:'matrix', source:src, values:'decimal', ...o}`; `amp(src,o)` = amplitudes with
`labels:'spin'`, `dials:true`; `cp(o)` = complex-plane; `K(t,o)` = the new `clocks` kind (§9.2 S1) with
`levels:{upper:3, lower:1}, start:'+x', timeDeg:t`. `HEX` = `{a0:2, a:[0,0,1]}` (H = 2εI + εZ = diag(3ε, ε)).
`EQ(t)` = `{dir:{thetaDeg:90, phiDeg:2t}}` with `globalPhaseDeg:−3t` (the exact evolved \|+x⟩ at εt/ħ = t°).
Claim keys start `l11`.

**Rosetta (one beat each).** (R1) The notes' θ(t) = ωt is our azimuth φ(t) (L7 ruling: θ is always polar):
`l11-two-level:b4`. (R2) The notes' Z is σ_z, so e^{−iφZ/2} = e^{−iφS_z/ħ} = R_z(φ): `l11-two-level:b2`. (R3) The
notes' "∼" (equal up to a global phase) is written ≅ and read "is the same state as": `l11-two-level:b2`.

## 0. Lecture map

| # | id | Title (≤ 8 words) | Question | Notes | Books |
|---|---|---|---|---|---|
| 1 | `l11-wait` | What happens if we wait? | We can prepare, measure and turn states; how does a state change by itself? | pp.1–2, 10, 19 (§11.4) | Susskind §4.1–4.3 |
| 2 | `l11-unitary` | Waiting keeps every length | What must time evolution do to every state's length? | p.11 (§11.5) | Susskind §4.2–4.4 |
| 3 | `l11-generator` | The Hamiltonian generates each tiny step | What operator moves a state forward by a tiny time? | pp.12–13 (§11.6) | Susskind §4.5–4.6; Townsend §2.2 pp.36–37 |
| 4 | `l11-schrodinger` | The Schrödinger equation | How fast is a state changing at each instant? | pp.14–15 (§11.7) | Susskind §4.12–4.13 |
| 5 | `l11-stationary` | Energy eigenstates stand still | Which states never change at all, and why? | p.16 (§11.8) | Susskind §4.8, §4.10 |
| 6 | `l11-two-level` | Two energies make the arrow turn | What does a spin with two energy levels do as time passes? | pp.17–19 (§11.9–11.10) | Susskind §4.11 |

**Class markers.** None inside: the whole chapter is the second half of Class 11 (minute 27 on). Its first half is
Chapter 10's unit 7 onward, where the `classStart` marker sits (P-L10 §0). Optional opener lede: "Class 11, second
half: the GHZ argument closed Chapter 10." If the user later supplies Lecture 12 notes that start with the optional
P(+x; t) calculation (p.2 says it may move there), Go deeper 3 becomes that class's opening and gets its marker.

**Ownership.** L6 owns R_z, its generator S_z, the matrix exponential and power series (`l6-generator`; its beat b7
already previews Susskind's time step, beyond the lecture: link back, no re-derivation). L7 owns the full-turn sign
(`l7-full-turn`). L5 owns `unitary`. L11 owns: U(t), unitarity of waiting, the anti-Hermitian step and the Hamiltonian
as generator of time translations, U(t) = e^{−iHt/ħ}, the Schrödinger equation, stationary states, and the two-level
precession. The GHZ recap is one link-back beat to `l10-what-ghz-proves`.

**Counts.** 6 units, **36 beats** (5 + 5 + 6 + 6 + 5 + 9), 7 clues, 6 books beats, 9 beats that link back (L10, L7, L6 ×4,
L5, L2, L1), 6 derivations, 3 Go-deeper boxes. Outcomes: (1) say why waiting must be unitary; (2) derive that a tiny step
is I − iH dt/ħ with H Hermitian; (3) build U(t) = e^{−iHt/ħ} and derive the Schrödinger equation from it; (4) explain
why energy eigenstates are stationary; (5) evolve \|+x⟩ under H = ĒI + (ħω/2)Z and read the turning arrow.

## 1. Story beats

### Unit 1 `l11-wait` — What happens if we wait?
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | pp.1, 19 | **Link back to L10** `l10-what-ghz-proves`: no instruction table reproduces the four GHZ correlations, which quantum mechanics meets with certainty; quantum randomness is not ignorance of local answers. That chapter closed; a new one opens. | `{kind:'matrix', tableau:['ZZZ','ZXX','XZX','XXZ'], targets:{…}, state:G}` (P-L10 A2, A3) | `l11GhzCeiling`: best table wins 0.75 → `ghzGame().maxWins/4` (P-L10 E2) |
| b2 | L | p.10 | So far quantum mechanics has been static: states, measurements, composite systems, turns. The new question: start from \|ψ⟩ at time zero; which state do we hold at a later time t? | `bl('+x',{shot:'B-STD'})` | — |
| b3 | L | p.10 | **Link back to L6** `l6-generator`: R_z(φ) = e^{−iφS_z/ħ}, and a tiny turn is R_z(dφ) ≈ I − (i/ħ)S_z dφ; S_z generates turns about z. Time evolution will have the same structure. | `bl('+x',{rotate:{axis:'z', angleDeg:sweep(0,90)}, trail:true, shot:'B-EQUATOR'})` | `l11Rz90`: R_z(90°)\|+x⟩ is \|+y⟩ → `samePhysicalState(apply(Rz(π/2),KET['+x']),KET['+y'])` |
| b4 | B | — | Susskind (§4.1–4.3): the ket evolves deterministically from its value at t = 0, yet outcomes stay probabilistic, unlike classical determinism. (L6's beyond-lecture beat `l6-generator:b7` previewed his §4.5.) | same | — |
| b5 | C | — | Q: If the ket's future is fixed exactly, why can we still not predict one measurement? → R: The equation fixes the state, and the state fixes only probabilities. A known \|+x⟩ still gives z = ±ħ/2 at 50/50. | `bl('+x',{measure:'z'})` | `l11Px`: P(+z) for \|+x⟩ = 0.5 → `prob(KET['+z'],KET['+x'])` |

### Unit 2 `l11-unitary` — Waiting keeps every length
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.11 | Write the state after a wait t as \|ψ(t)⟩ = U(t)\|ψ(0)⟩ (gloss `time-evolution-operator`). | `mx({gate:{name:'Rz', params:[60]}})` (an example U) | — |
| b2 | L | p.11 | A closed system (gloss `closed-system`) keeps total probability: ⟨ψ(t)\|ψ(t)⟩ = ⟨ψ(0)\|ψ(0)⟩. **Derivation D1** turns this into U†U = I. | same | `l11RzUnitary`: `isUnitary(Rz(60°))` = true |
| b3 | L | p.11 | So time evolution is unitary (gloss `unitary`, **link back to L5** `l5-coordinates`). Rotations were unitary for the same reason: waiting cannot make the total probability stop being one. | `bl('+x',{rotate:{axis:'z', angleDeg:sweep(0,360)}, readouts:['averages']})` | `l11LenKept`: \|r⃗\| = 1 throughout → `blochVector` length at 0°, 90°, 270° |
| b4 | B | — | Susskind (§4.2–4.4) argues from "conservation of distinctions": orthogonal states stay orthogonal, so inner products of basis states are kept, which again gives U†U = I. | `mx({product:[{adjoint:{gate:{name:'Rz',params:[60]}}},{gate:{name:'Rz',params:[60]}}]}, {values:'exact'})` | `l11UdagU`: the grid is I |
| b5 | C | p.11 | Q: A matrix keeps \|+z⟩ and \|−z⟩ at length 1. Must it be unitary? → R: No. U = [[1, 1/√2],[0, 1/√2]] keeps both (and \|+y⟩) but stretches \|+x⟩ to squared length 1.707. That is why the notes demand *every* state (Go deeper 1). | `mx(UBAD,{values:'decimal'})` → reveal `mx({product:[{adjoint:UBAD},UBAD]})` (off-diagonal 0.707) | `l11BadX`: `norm2(apply(U1,KET['+x']))` = 1.7071 · `l11BadZ` = 1, 1 · `l11BadY` = 1 |

`UBAD` = U1 = [[1, 1/√2],[0, 1/√2]] in today's `matrix` vocabulary (nested `lin`, exact coefficients only):
`{lin:[{c:'+1/2',src:{pauli:'I'}},{c:'+1/2',src:{pauli:'Z'}},{c:'+1/sqrt2',src:{lin:[{c:'+1/2',src:{pauli:'I'}},
{c:'-1/2',src:{pauli:'Z'}},{c:'+1/2',src:{pauli:'X'}},{c:'+1/2',src:{lin:[{c:'+i',src:{pauli:'Y'}}]}}]}}]}` — ½(I + Z)
plus (1/√2)·[[0,1],[0,1]], checked by hand and to be pinned by a test. No new source is needed.

**Go deeper 1 (beyond the notes; unit end).** Why "every state" forces U†U = I. M = U†U is Hermitian. ⟨ψ\|M\|ψ⟩ = 1 for
\|+z⟩ and \|−z⟩ fixes its diagonal; \|+x⟩ fixes the real part of the corner entry and \|+y⟩ its imaginary part. So four
states suffice, and fewer do not: U1 = [[1, 1/√2],[0, 1/√2]] passes \|±z⟩ and \|+y⟩ but gives \|+x⟩ squared length
1.707; U2 = [[1, i/√2],[0, 1/√2]] passes \|+x⟩ but gives \|+y⟩ 0.293. In a complex space "⟨ψ\|A\|ψ⟩ = 0 for every ψ"
forces A = 0 for *any* A; in a real space it only kills A's symmetric part. Claims: `norm2(apply(U1|U2, KET[k]))` =
[1, 1, 1.7071, 1] and [1, 1, 1, 0.2929]; `isUnitary` false for both. Go further: 709 F4 `f4-unitary`.

### Unit 3 `l11-generator` — The Hamiltonian generates each tiny step
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.12 | A tiny step must be close to doing nothing: U(dt) = I + A dt. **Derivation D2**: unitarity to first order gives A† = −A (gloss `anti-hermitian`). | `mx({lin:[{c:'-i', src:{pauli:'Z'}}]},{values:'exact'})` (an example A) | `l11AntiH`: (−iZ)† = −(−iZ) → `matEq(dagger(A), mscale(A,-1))` |
| b2 | L | p.12 | Pull out −i/ħ: A = −(i/ħ)H with H† = H, so U(dt) = I − (i/ħ)H dt. Physics supplies the name: the generator of time translations (gloss `time-translation`) is the Hamiltonian, the energy observable (gloss `hamiltonian`, from L6). | `op({op:HEX, eigen:true, gauge:true})` | `l11Hlevels`: eigenvalues 3, 1 (units ε) → `eigenHermitian2(H)` |
| b3 | L | p.13 | For a time-independent H, chain many tiny steps: U(t) = lim (I − iHt/(Nħ))^N = e^{−iHt/ħ}, the matrix exponential of L6 (**link back** `l6-generator`). On one energy component the steps trace a polygon that closes onto the circle. | `cp({euler:{rate:'imag', phiDeg:-90, n:sweep(1,64)}})` | `l11Limit`: endpoint → e^{−iπ/2} = −i → `expi(-π/2)` (the overshoot numbers stay in Go deeper 2) |
| b4 | L | p.13 | The notes' two-column table: rotation angle φ ↔ time t, S_z ↔ H, R_z(φ) = e^{−iφS_z/ħ} ↔ U(t) = e^{−iHt/ħ}. | `{layout:'split', top: bl('+x',{rotate:{axis:'z',angleDeg:sweep(0,90)}, trail:true}), bottom: op({op:HEX, eigen:true})}` | `l11RzIsExp`: `matEq(expm2(mscale(SZ,c(0,-1.234))), Rz(1.234))` |
| b5 | B | — | Susskind (§4.5–4.6) gets the same step from unitarity plus continuity; the −i is a convention chosen so H matches classical energy, and ħ makes the units work. Townsend (§2.2, pp. 36–37) builds finite turns from tiny ones the same way. | `op({op:HEX, eigen:true})` | — |
| b6 | C | p.12 | Q: Why write A = −(i/ħ)H instead of keeping A? → R: An anti-Hermitian A has imaginary eigenvalues (b1's −iZ has −i and +i); pulling out −i/ħ leaves a Hermitian H with real eigenvalues, energies a measurement can return. | `mx({lin:[{c:'-i', src:{pauli:'Z'}}]})` → reveal `op({op:HEX, eigen:true})` | `l11AEig`: diag of −iZ = −i, +i · H's eigenvalues 3, 1 (units ε) |

**Go deeper 2 (beyond the notes; unit end).** The finite product is not unitary; only its limit is. For Ē = 0 and
ωt = 180°, (I − iHt/(Nħ))^N stretches \|+x⟩ to squared length 3.47 (N = 1), 1.28 (N = 10), 1.025 (N = 100), 1.0025
(N = 1000); the gap from U(t) shrinks like 1/N (largest entry error 1.15, 0.13, 0.012, 0.0012). On one component it is
709's Euler polygon: \|(1 − iπ/(2N))^N\| = 1.862, 1.332, 1.0195 for N = 1, 4, 64 (go further: 709 F1 `f1-euler`).
Stage `cp({euler:{rate:'imag', phiDeg:-90, n:sweep(1,64)}, show:['modulus']})`. Claims: `stepProduct(H,t,N)` (E3)
squared lengths; `eulerLimit(-π/2, N)` moduli.

### Unit 4 `l11-schrodinger` — The Schrödinger equation
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.14 | U(t) answers "where is the state after a time t". Ask instead how fast it changes. **Derivation D3**: from \|ψ(t+dt)⟩ = (I − iH dt/ħ)\|ψ(t)⟩ to iħ d\|ψ⟩/dt = H\|ψ⟩ (gloss `schrodinger-equation`). | `amp(EQ(0))` | — |
| b2 | L | p.14 | Not a new law: for time-independent H, U(t) = e^{−iHt/ħ} and the equation say the same thing. | `amp(EQ(10))` | `l11FD`: (U(t+h)\|+x⟩ − U(t)\|+x⟩)/h equals −iH U(t)\|+x⟩ (h = 1e−6, tol 1e−5) · `l11DerivZ`: d/dt of \|+z⟩'s amplitude at 0 is −3i (ε/ħ) |
| b3 | L | p.15 | The object that evolves is the state itself: a spin, a three-spin entangled state, later a wavefunction. H gives the direction in which the state moves at each instant. | `amp(EQ(sweep(0,45)))` | — |
| b4 | L | p.15 | Same structure as rotations: d\|ψ⟩/dφ = −(i/ħ)S_z\|ψ⟩ while d\|ψ⟩/dt = −(i/ħ)H\|ψ⟩. S_z drives the change with angle, H with time. | `bl('+x',{rotate:{axis:'z',angleDeg:sweep(0,90)}, trail:true})` | `l11DerivRz`: `generatorOf(Rz)` = S_z (L6's helper) |
| b5 | B | — | Susskind (§4.12–4.13): the equation for ψ(x, t) is a special case; H\|E_j⟩ = E_j\|E_j⟩ is its time-independent partner; his recipe expands \|ψ(0)⟩ in energy eigenstates and attaches e^{−iE_jt/ħ} to each coefficient. | `amp(EQ(30))` | `l11Recipe`: recipe at εt = 30° gives phases −90°, −30° → `arg` of `apply(U, KET['+x'])` |
| b6 | C | — | Q: The equation is first order in time. What fixes the whole future? → R: The state at one instant. Unlike Newton's law, no separate velocity is needed: the equation itself supplies d\|ψ⟩/dt = −(i/ħ)H\|ψ⟩. | `amp(EQ(0))` | — |

### Unit 5 `l11-stationary` — Energy eigenstates stand still
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.16 | If H\|E⟩ = E\|E⟩ (gloss `energy-eigenstate`), **derivation D4** gives e^{−iHt/ħ}\|E⟩ = e^{−iEt/ħ}\|E⟩. | `bl('+z',{globalPhaseDeg:sweep(0,-360)})` | `l11StatZ`: `samePhysicalState(apply(U(t),KET['+z']),KET['+z'])` · P(+z) = 1 · ⟨H⟩ = 3 (units ε) |
| b2 | L | p.16 | Only an overall phase appears, and overall phases change no probability, so these are stationary states (gloss `stationary-state`; **link back to L2** global phase). | `amp({dir:'+z'},{globalPhaseDeg:sweep(0,-540)})` (one dial turning, bar fixed) | `l11StatProb`: bar length 1 at every t |
| b3 | L | p.16 | If every state only gained an overall phase, nothing would ever happen. Observable change needs a *relative* phase, the idea behind every equator state (**link back to L6** `l6-equator`). | `amp(EQ(sweep(0,45)))` | `l11RelPreview`: at εt = 45° phases −135°, −45°, relative 90° |
| b4 | B | — | Susskind (§4.10): energy is conserved, since H commutes with itself; ⟨H⟩ never changes, even for states that move (§4.8: the phase factor can be ignored). | `op({op:HEX, eigen:true})` | `l11EnergyConst`: ⟨H⟩ for \|+x⟩ = 2 (units ε) at εt = 0°, 30°, 45°, 90° |
| b5 | C | — | Q: Prepare \|−z⟩ and wait. What changes? → R: Only its phase e^{−iE₋t/ħ}. P(−z) stays 1, the point stays at the south pole. | `bl('-z',{globalPhaseDeg:sweep(0,-180)})` | `l11StatMinus`: P(−z) = 1 after any wait |

### Unit 6 `l11-two-level` — Two energies make the arrow turn
| beat | ph | src | text gist | stage | claims |
|---|---|---|---|---|---|
| b1 | L | p.17 | A two-level system (gloss `two-level-system`): energy eigenstates \|±z⟩ with E± = Ē ± ħω/2 (gloss `mean-energy`, `angular-frequency`). In the z basis H = diag(E₊, E₋) = ĒI + (ħω/2)Z. **Signature "two clocks", first view: the energy ladder.** | `K(0,{show:['levels']})` | `l11Levels`: Ē = 2, ħω = 2 (units ε) from E₊ = 3, E₋ = 1 |
| b2 | L | p.17 | **Rosettas R2, R3.** **Derivation D5**: I and Z commute, so U(t) = e^{−iĒt/ħ}e^{−iωtZ/2}; the Ē factor is a global phase; the second is R_z(ωt). So U(t) ≅ R_z(ωt): waiting turns the arrow about z. | `mx({gate:{name:'Rz', params:[60]}})` | `l11UisRz`: `matEq(U(t), e^{−iĒt}·Rz(ωt))` at εt = 30° (gap 0) |
| b3 | L | p.17 | Start in \|+x⟩ = (\|+z⟩ + \|−z⟩)/√2. Each component carries its own clock: \|ψ(t)⟩ = (e^{−iE₊t/ħ}\|+z⟩ + e^{−iE₋t/ħ}\|−z⟩)/√2 (gloss `phase-clock`). **Signature, full.** | `K(sweep(0,90))` | `l11Clocks30`: at εt = 30° the hands sit at −90° and −30°, gap 60° → `clockHands` (E3) |
| b4 | L | p.18 | **Rosetta R1. Derivation D6**: factor out e^{−iĒt/ħ} and e^{−iωt/2}; \|ψ(t)⟩ ≅ (\|+z⟩ + e^{iωt}\|−z⟩)/√2, the equator state at azimuth φ(t) = ωt (**link back to L6** `l6-equator`). | `K(45)` | `l11R60`: r⃗ at ωt = 60° = (0.5, 0.866, 0) · at 90°: (0, 1, 0) → `blochVector(apply(U, KET['+x']))` |
| b5 | L | p.18 | The arrow turns about z at ω = (E₊ − E₋)/ħ (**link back to L1** `precession`). Central message: energy eigenstates gain only overall phases; a superposition of different energies gains a changing relative phase (never say "mixture": that word means a mixed state), and that is all the observable motion. | `bl('+x',{rotate:{axis:'z',angleDeg:sweep(0,360)}, trail:true, shot:'B-POLE'})` | `l11Omega`: ω = 2ε/ħ, so one lap takes εt/ħ = 180° |
| b6 | L | p.19 | Consolidation: the turns of Lectures 6–7 were already time evolution; H says which turn nature performs as time passes. Next: the same equation for a particle, ψ(x, t) = ⟨x\|ψ(t)⟩. | `K(sweep(0,180))` | — |
| b7 | B | — | Susskind (§4.11): a spin in a magnetic field along z has H proportional to σ_z; the averages ⟨σ_x⟩ and ⟨σ_y⟩ precess like a gyroscope while ⟨σ_z⟩ stays put, and each single reading is still ±1. | `bl('+x',{rotate:{axis:'z',angleDeg:sweep(0,360)}, readouts:['averages']})` | `l11SzConst`: ⟨S_z⟩ = 0 throughout |
| b8 | C | — | Q: After one period T = 2π/ω the arrow is back at +x. Is the ket back too? → R: U(T) = −e^{−iĒT/ħ}I; for our energies U(T) = −I exactly. The same state, a different ket: Lecture 7's full-turn sign (**link back** `l7-full-turn`). | `K(180)` → reveal `{kind:'hopf', fibers:'one', marked:{state:'+x', rotate:{axis:'z', angleDeg:360}}, mini:true, shot:'HF-FIBER'}` | `l11UT`: U(T) = −I → entries −1, −1 |
| b9 | C | p.17 | Q: Raise both energies by the same amount. Does any prediction change? → R: No. Ē only multiplies the ket by an overall phase; both clocks speed up equally and their gap does not change. | `K(30)` → reveal `K(30,{levels:{upper:6, lower:4}})` | `l11Ebar`: P(+x) at ωt = 60° is 0.75 for levels (3, 1) and (6, 4) → `prob(KET['+x'], evolve(…))` · gap 60° in both |

**Go deeper 3 (beyond the notes; unit end; the notes' p.2 plans it as optional "§11.10" but never gives it).**
A magnet along x sees the motion: P(+x; t) = \|⟨+x\|ψ(t)⟩\|² = cos²(ωt/2) and ⟨S_x⟩(t) = (ħ/2)cos ωt. At ωt = 0, 60°,
90°, 180°: P = 1, 0.75, 0.5, 0 and ⟨S_x⟩ = 0.5ħ, 0.25ħ, 0, −0.5ħ. Stage `bl('+x',{rotate:{axis:'z',
angleDeg:sweep(0,360)}, measure:'x', readouts:['averages']})`. Claims: `prob(KET['+x'], apply(U(t),KET['+x']))`,
`expectation(SX, …)` at those times.

The hopf reveal in b8 is a GL kind already used by L7; it is the only hopf view here (fidelity `hopf-fiber-state`).

## 2. Derivations (one track; `formal` = the same list, P-L10 §9.2 A8). ≥ 2 distinct views each, kinds on the unit's stage.
- **D1 `l11-unitary:b2`** result `U^\dagger(t)U(t) = I`: (1) `\langle\psi(t)|\psi(t)\rangle = \langle\psi(0)|U^\dagger U|\psi(0)\rangle` — "the bra of U\|ψ⟩ is ⟨ψ\|U†." view `mx({gate:{name:'Rz',params:[60]}})`; (2) `= \langle\psi(0)|\psi(0)\rangle` for every \|ψ(0)⟩ — "a closed system keeps the total probability." same; (3) `U^\dagger U = I` — "only the identity leaves every length alone (Go deeper 1)." view `mx({product:[{adjoint:Rz60},Rz60]},{values:'exact'})`.
- **D2 `l11-generator:b1`** result `A^\dagger = -A`: (1) `U(dt) = I + A\,dt` view `mx(A)`; (2) `U^\dagger(dt) = I + A^\dagger dt`; (3) `U^\dagger U = I + (A^\dagger + A)\,dt + A^\dagger A\,dt^2`; (4) "drop dt², the first order must vanish": `A^\dagger + A = 0` view `mx({adjoint:A})`; (5) `A^\dagger = -A`.
- **D3 `l11-schrodinger:b1`** result `i\hbar\tfrac{d}{dt}|\psi(t)\rangle = H|\psi(t)\rangle`: (1) `|\psi(t+dt)\rangle = (I - \tfrac{i}{\hbar}H\,dt)|\psi(t)\rangle` view `amp(EQ(0))`; (2) expand; (3) subtract \|ψ(t)⟩; (4) divide by dt, view `amp(EQ(10))` ("both dials have turned a little, by different amounts"); (5) dt → 0: `\tfrac{d}{dt}|\psi\rangle = -\tfrac{i}{\hbar}H|\psi\rangle`; (6) multiply by iħ.
- **D4 `l11-stationary:b1`** result `e^{-iHt/\hbar}|E\rangle = e^{-iEt/\hbar}|E\rangle`: (1) the power series of L6, view `bl('+z')`; (2) `H^n|E\rangle = E^n|E\rangle` — "H on its own eigenvector just multiplies by E, every time"; (3) sum the series to `e^{-iEt/\hbar}|E\rangle`, view `amp({dir:'+z'},{globalPhaseDeg:-90})`.
- **D5 `l11-two-level:b2`** result `U(t) \cong R_z(\omega t)`: (1) `H = \bar E I + \tfrac{\hbar\omega}{2}Z` view `K(0,{show:['levels']})`; (2) `e^{-iHt/\hbar} = e^{-i\bar Et/\hbar}\,e^{-i\omega tZ/2}` — "I commutes with Z, so the exponential splits"; (3) the Ē factor is a global phase; (4) `e^{-i\omega tZ/2} = R_z(\omega t)`, view `mx({gate:{name:'Rz',params:[60]}})`.
- **D6 `l11-two-level:b4`** result `\varphi(t) = \omega t`: (1) the state with its two clocks, view `K(30)`; (2) substitute E± = Ē ± ħω/2; (3) factor `e^{-i\bar Et/\hbar}e^{-i\omega t/2}`: `|\psi(t)\rangle \cong \tfrac{1}{\sqrt2}(|{+z}\rangle + e^{i\omega t}|{-z}\rangle)`, view `bl('+x',{rotate:{axis:'z',angleDeg:60}, shot:'B-POLE'})`; (4) read the azimuth: `\varphi(t) = \omega t`.

## 3. Try-it per unit (props checked against the widget code)
| unit | widget spec | try this |
|---|---|---|
| wait | `{kind:'bloch', props:{theta:90, phi:0, rotations:true, rotationAngles:[30, 90], landmarks:true}}` | 1. Press R_z(30°) three times, then compare with one R_z(90°). · 2. Which landmark do you reach? (\|+y⟩.) |
| unitary | `{kind:'complex-plane', props:{mode:'multiply', z:[0.6, 0.8], w:[0.8, 0.6]}}` (448 mode) | 1. \|w\| = 1: the product keeps z's length. · 2. Set w = (1, 0.5): the length grows by 1.118. A step that grows lengths is not allowed for waiting. |
| generator | `{kind:'complex-plane', props:{mode:'euler', phi:-90, n:1}}` (709 mode, lazy pane; ruling 5) | 1. n = 1: the end point overshoots the circle. · 2. Raise n to 64: it closes onto −i. (Go deeper 2.) |
| schrodinger | `{kind:'bloch', props:{theta:90, phi:0, rotations:true, rotationAngles:[10], landmarks:true}}` | 1. Press R_z(10°) nine times: many small steps make one quarter turn. |
| stationary | `{kind:'phase-dial', props:{theta:0, rotations:false}}` | 1. Multiply both amplitudes by e^{iπ/2}: the phasors spin, the point stays. That is all an energy eigenstate ever does. |
| two-level | `{kind:'two-clocks', props:{upper:3, lower:1, start:'+x'}}` (W3) | 1. Scrub to εt/ħ = 45°: gap 90°, arrow at +y. · 2. Raise both levels by 2: the hands run faster, the gap does not. · 3. Start at +z: one clock, nothing moves. |

## 4. Challenges (no assigned homework; keys from the engine)
- **wait**: `l11-wa-turn` warm-up choice: R_z(90°)\|+x⟩ is the state \|+y⟩ ✓ / \|−x⟩ / \|+z⟩ / \|−y⟩ · `l11-wa-steps` core numeric: three R_z(30°) steps equal one turn of how many degrees? → 90.
- **unitary**: `l11-un-which` warm-up choice: which can describe waiting? R_z(60°) ✓; diag(1, 2); [[1,1],[0,1]]; ½I (`isUnitary`) · `l11-un-bad` core numeric squared length of U1\|+x⟩ → 1.707 · `l11-un-four` stretch numeric squared length of U2\|+y⟩ → 0.293.
- **generator**: `l11-ge-anti` warm-up choice: which is anti-Hermitian? −iZ ✓; Z; X; I + Z · `l11-ge-dt` core numeric: squared length of (I − iH dt/ħ)\|+x⟩ for H = diag(3ε, ε), dt = 0.01ħ/ε → 1.0005 · `l11-ge-n1` stretch numeric: one big step (N = 1), Ē = 0, ωt = 180°: squared length of \|+x⟩ → 3.467.
- **schrodinger**: `l11-sc-order` core order: the six steps of D3 · `l11-sc-rate` core numeric: d/dt of \|+z⟩'s amplitude at t = 0 is c·i (ε/ħ); c → −3.
- **stationary**: `l11-st-which` warm-up choice: for H = ĒI + (ħω/2)Z the stationary states are "\|+z⟩ and \|−z⟩ only" ✓ · `l11-st-prob` core numeric P(+z) after any wait, from \|+z⟩ → 1 · `l11-st-energy` stretch numeric ⟨H⟩ for \|+x⟩ at εt/ħ = 90° (units ε) → 2.
- **two-level**: `l11-tl-omega` warm-up numeric ħω for E₊ = 3ε, E₋ = ε (units ε) → 2 · `l11-tl-azimuth` core numeric azimuth at εt/ħ = 30° → 60 (°) · `l11-tl-gap` core numeric hand gap at εt/ħ = 45° → 90 · `l11-tl-period` stretch numeric ⟨+x\|U(T)\|+x⟩ → −1 · `l11-tl-px` stretch numeric (Go deeper 3) P(+x) at ωt = 60° → 0.75.
Hints nudge → key idea → setup; walkthroughs follow the derivations above.

## 5. Glossary (new 448 ids; no duplicates in either course; 709 has no dynamics terms yet, Q24 is planned)
| id | term | gloss (≤ 25 words) | first |
|---|---|---|---|
| `time-evolution-operator` | U(t) | The operator that carries a state from time 0 to time t: \|ψ(t)⟩ = U(t)\|ψ(0)⟩. | l11-unitary:b1 |
| `closed-system` | closed system | A system nothing outside acts on, so its total probability stays exactly one as it evolves. | l11-unitary:b2 |
| `anti-hermitian` | anti-Hermitian | An operator equal to minus its conjugate transpose, A† = −A; its eigenvalues are purely imaginary. | l11-generator:b1 |
| `time-translation` | time translation | Letting a system run forward by some time; the Hamiltonian is its generator. | l11-generator:b2 |
| `schrodinger-equation` | Schrödinger equation | iħ d\|ψ⟩/dt = H\|ψ⟩: the Hamiltonian sets how fast, and which way, a state changes. | l11-schrodinger:b1 |
| `energy-eigenstate` | energy eigenstate \|E⟩ | A state with H\|E⟩ = E\|E⟩, so an energy measurement gives E for certain. | l11-stationary:b1 |
| `stationary-state` | stationary state | An energy eigenstate: waiting multiplies it by a phase only, so no prediction ever changes. | l11-stationary:b2 |
| `two-level-system` | two-level system | A system with exactly two energy levels, like a spin ½ in a field along z. | l11-two-level:b1 |
| `mean-energy` | mean energy Ē | The average of the two levels; it adds only an overall phase. | l11-two-level:b1 |
| `angular-frequency` | angular frequency ω | How fast an angle grows, in radians per second; here ω = (E₊ − E₋)/ħ. | l11-two-level:b1 |
| `phase-clock` | phase clock | A dial whose hand is one energy component's phase, turning clockwise at E/ħ. | l11-two-level:b3 |

Reused: `hamiltonian` (L6, first `l6-generator:b7`; L11 is the first notes teaching, ruling 6), `generator`,
`matrix-exponential`, `infinitesimal`, `power-series`, `rotation-operator` (L6), `unitary` (L5), `global-phase`,
`relative-phase`, `state-ray` (L7), `precession` (L1), `full-turn-sign` (L7), `hermitian-conjugate`.

## 6. Review cards
- **wait**: the state evolves deterministically; outcomes stay probabilistic; time evolution will mirror R_z · eq `R_z(d\varphi) \approx I - \tfrac{i}{\hbar}S_z\,d\varphi` · trap: "deterministic ket ⇒ predictable readings".
- **unitary**: \|ψ(t)⟩ = U(t)\|ψ(0)⟩; lengths kept for every state ⇒ U†U = I · eq `U^\dagger U = I` · trap: checking only a basis.
- **generator**: U(dt) = I − iH dt/ħ, H Hermitian = energy; U(t) = e^{−iHt/ħ} · eq `U(t) = e^{-iHt/\hbar}` · trap: the i makes A anti-Hermitian, H Hermitian.
- **schrodinger**: same law, differential form; first order in time · eq `i\hbar\tfrac{d}{dt}|\psi\rangle = H|\psi\rangle` · trap: thinking it adds a new law.
- **stationary**: \|E⟩ → e^{−iEt/ħ}\|E⟩; nothing observable changes; motion needs relative phase · eq `|E(t)\rangle = e^{-iEt/\hbar}|E\rangle` · trap: "stationary" means the ket is constant (it is not; its phase turns).
- **two-level**: U(t) ≅ R_z(ωt); \|+x⟩ turns at ω = (E₊ − E₋)/ħ; Ē unobservable · eq `|\psi(t)\rangle \cong \tfrac{1}{\sqrt2}(|{+z}\rangle + e^{i\omega t}|{-z}\rangle)` · trap: turning at E₊/ħ.

## 7. Symbol-before-use (first beat)
R_z, S_z, dφ, e^{M}: L6 (mapped in `Lecture.symbols` to `l11-wait:b3`) · t, \|ψ(t)⟩: l11-wait:b2 · U(t), U†: l11-unitary:b1–b2 ·
I: b2 (L3) · A, dt: l11-generator:b1 · H, ħ: b2 · N: b3 · d/dt: l11-schrodinger:b1 · \|E⟩, E: l11-stationary:b1 · E₊, E₋,
Ē, ω, Z (= σ_z): l11-two-level:b1 · ≅: b2 · φ(t): b4 · T: b8 · ε (example energy unit): the caption of
l11-generator:b2, which defines it ("H = diag(3ε, ε)") · εt/ħ (time as an angle): the caption of l11-schrodinger:b2.

## 8. Errata and consistency fixes (no physics error found in §§11.4–11.10)
1. **Promised but absent:** p.2 calls the explicit P(+x; t) "Section 11.10" (optional); §11.10 is the consolidation and
   the calculation never appears. The app supplies it as Go deeper 3, labelled beyond the notes.
2. **Notation:** θ(t) = ωt is the azimuth (L7 Rosetta: φ). The notes write e^{−iϕZ/2} (p.17) and e^{−iϕS_z/ħ} (p.10)
   for the same R_z; one Rosetta line. "∼" becomes ≅.
3. **Nit:** p.13 says U(t) = lim (I − iHt/Nħ)^N follows "from the definition" of the matrix exponential; L6 defines
   e^M by its power series, and the limit equals it (a theorem, true for any matrix). The app says "equals".
4. Names: L11 pp.3–8 ("Davie", "referee Charlie") are handled in P-L10 §8 item 3.

## 9. Engine, stage and widget gaps
**9.1 Engine (skill 11).** **E3** `physics/dynamics.ts` (448 engine, shared): `twoLevelH(upper, lower)` → H and
{Ē, ħω}; `evolve(H, t, psi)` (expm2 for 2×2, `qc/cmat expmHermitian` beyond); `stepProduct(H, t, N)` = (I − iHt/N)^N;
`clockHands(levels, start, t)` → hand angles (−E t, wrapped to (−180°, 180°]), lengths \|c±\|, gap = azimuth;
`precession(omega, t)` → {P(+x), ⟨S_x⟩}. Numpy twins: the values in §1. Everything else exists (`expm2`, `Rz`,
`generatorOf`, `eulerLimit`, `isUnitary`, `samePhysicalState`, `blochVector`).
**9.2 Stage contracts.**
- **S1 new SVG kind `clocks`** (skill 10; lazy like the other SVG kinds; prints as a static figure at the beat's end):
  ```ts
  interface ClocksState {
    kind: 'clocks'
    /** Two energies in units of ε (small exact numbers, upper > lower); Ē and ħω are derived, never authored. */
    levels: { upper: number; lower: number }
    /** The starting state (448 Dir, default '+x'): its |±z⟩ amplitudes set the hand lengths. */
    start?: Dir
    /** Elapsed time as εt/ħ in degrees (may sweep). Hand angle = −(level)·timeDeg; gap = (upper − lower)·timeDeg. */
    timeDeg: Scrub
    /** Panels: 'levels' (ladder: E₊, E₋, Ē dashed, a ħω arrow), 'clocks' (one dial per level), 'gap' (the relative
     *  phase as a dial = the Bloch azimuth), 'top' (the equator seen from +z, arrow at φ = ωt). Default all four. */
    show?: ('levels' | 'clocks' | 'gap' | 'top')[]
    readouts?: ('phases' | 'gap' | 'px')[]
    shot?: 'K-STD'
  }
  ```
  Anchors: `level-upper`, `level-lower`, `mean`, `gap-arrow`, `clock-upper`, `clock-lower`, `gap-dial`, `top-arrow`.
  Passport "PHASE CLOCKS · two energy levels"; note "schematic layout; hand angles, hand lengths and the gap are exact".
  Interp: lerp `timeDeg` and the levels; never wrap a sweep (a hand that turns 540° turns 540°). Fallback if S1 slips:
  `{layout:'split', top: cp({spokes:{phasesDeg:[−3t, −t], sizes:[0.707, 0.707]}}), bottom: bl(…, {shot:'B-POLE'})}`
  plus `op({op:HEX})` for the ladder (all existing kinds; no ω slider).
- **S2** none: the counterexample U1 is a nested `lin` (unit 2 note); W pins it with a resolver test.
- **Platform items shared with L10** (P-L10 §9.2): A5 (SVG fidelity shared), A6 (chunk rules), A8 (derivation lint),
  A9 (`Unit.deeper[]`), A10 (448 → 709 chips).
**9.3 Widgets.** **W3** `two-clocks` (new, lazy): draws the `clocks` scene from controls (ComplexPlaneQc pattern):
sliders `upper`, `lower` (or Ē and ω), time with play/pause, start picker (+x, +z, θ = 60°). Reused unchanged:
`bloch` (rotations, rotationAngles), `complex-plane` (`multiply`; `euler`, 709 mode), `phase-dial`.

## 10. Media
Optional Motion Canvas film (skill 15) "two clocks" for the unit-6 opener: every drawn angle from `clockHands` (E3) in
the manifest; not required (the `clocks` kind already animates). No Blender, no Higgsfield.

## 11. Hooks
**Concept map:** `time-evolution` "Waiting is unitary" (l11-unitary; needs `rz`) · `hamiltonian-generator` (l11-generator;
needs `time-evolution`, `rz`) · `schrodinger` (l11-schrodinger; needs `hamiltonian-generator`) · `stationary-states`
(l11-stationary; needs `schrodinger`, `eigen-problem`) · `two-level-precession` (l11-two-level; needs `stationary-states`,
`phase-longitude`, `full-turn`). No 709 twin yet.
**Arcade:** Bloch golf "Waiting game" (start \|+x⟩, target \|−y⟩, par 3, only "wait a quarter period" = R_z(+90°)
allowed; needs an additive `GolfLevel.allowed?: Move[]`, skill 13) · Spot the error: `l11-unitary` ("keeps \|±z⟩, so
unitary"), `l11-generator` ("I − iH dt/ħ is exactly unitary"), `l11-stationary` ("⟨H⟩ is constant, so \|+x⟩ is
stationary"), `l11-two-level` ("the arrow turns at E₊/ħ"), `l11-schrodinger` (a dropped i in step 6).
**Go further in 709 (P-L10 A10):** l11-unitary → F4 `f4-unitary`; l11-generator → F1 `f1-euler`; l11-two-level → Q4
`q4-one-qubit-gates` (R_z as a gate). Q24 (Rabi, Ramsey) once built.

## 12. Fidelity notes
`clocks`: hand angles and the gap are exact; the dials are not places in space; the ladder's spacing is to scale but
Ē's height is a choice of zero (only differences are observable). `bloch` B-POLE (b5, D6): the arrow's azimuth is the
relative phase exactly; the global phase is not drawn. `complex-plane` euler: the polygon is the N-step product on one
energy component; its overshoot is real arithmetic, not a drawing artefact. `hopf` (b8): reused L7 items.

## Rulings requested
1. New SVG kind `clocks` + widget `two-clocks` sharing its scene (S1, W3), or the split fallback of existing kinds?
2. Example energies E₊ = 3ε, E₋ = ε for every picture (quarter turn at εt/ħ = 45°, U(T) = −I exactly)?
3. Go deeper 3 supplies the P(+x; t) calculation the notes promise (p.2) but never give, labelled beyond the notes?
4. No class marker inside L11 (optional opener lede "Class 11, second half"), the GHZ recap as one link-back beat?
5. ≅ for the notes' "∼" (same state up to a global phase), stated once in a Rosetta?
6. Keep the `hamiltonian` gloss's `first` at L6's beyond-lecture beat although L11 is the first notes teaching?
7. N-step overshoot numbers only in Go deeper 2, never in the notes' beat `l11-generator:b3`?
8. Ingest Townsend Ch. 4 (time evolution) for a second books layer, or rely on Susskind Lecture 4 alone?
