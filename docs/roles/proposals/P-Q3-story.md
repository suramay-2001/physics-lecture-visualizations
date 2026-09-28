# P-Q3-story — Q3 "Measurement, the Bloch sphere and uncertainty" (role P, Physics 709)

Proposal only. Nothing under `app/` is modified. Format: `P-Q1-story.md` (two tracks, bridges, the same 13 sections).
Map entry: `P-709-map.md` §2 Q3; rulings: `decisions/qc709-map.md` (ruling 3), `qc709-pilots.md`, `qc709-nc.md` (ruling 1,
superseded), `homework-status.md`. Q3 is the notes' Lecture 3 (9/14), so it is also the chapter's Read mode.

**Sources read.**
- 709 notes Lecture 3, pp. 11–17: the text layer (`sources/qc709-n3/text.md`) and all seven page renders, by eye. The
  renders add no figures; they show the boxed Eq. 1.9 and the highlights "a projection operator to state |M⟩", "dual or
  Hermitian conjugated operator", "an eigenvector of A, with eigenvalue a_i", and the ⟨ψ|Aⁿ|ψ⟩ line.
- Bergou 2e: Eq. 1.2 and Fig. 1.1, p. 2 (PDF 17); Eq. 2.20, p. 19 (PDF 33); §5.2, pp. 79–80 (the six postulates on
  p. 80; PDF 91).
- Axler 4e (printed = PDF − 14): 5.5 p. 134, 5.71 p. 175, 5.76 p. 176, 6.14 p. 189, 7.1 p. 228, 7.5 p. 230, 7.10–7.12
  p. 233, 7.13–7.14 p. 234, 7.31 p. 246. Axler's T* is our T† and his ⟨u, v⟩ is our ⟨v|u⟩ (C9).
- N&C (printed = PDF − 28): Eq. 1.4 p. 15; Fig. 2.2 p. 65; Eq. 2.22 p. 67; Eq. 2.32 p. 69; p. 70 (Hermitian, Ex. 2.17);
  Box 2.2 p. 72; §2.1.9 and Thm 2.2 pp. 76–77; Eqs. 2.103–2.115 pp. 87–88; Box 2.4 p. 89; Ex. 2.59–2.60 p. 90.
- Overlaps: 448 `l3-projectors`, `l3-postulates`, `l3-eigen`, `l3-spread`, `l4-projectors`, `l4-matrices`, `l4-average`,
  `l5-operators`, `l6-bloch`, `l6-equator`, `l7-two-angles`, `l7-order`, `l7-compatible`, `l7-spreads`, `l7-uncertainty`;
  709 Q1 (Born rule, projector preview), Q2 (completeness, U, A' = UAU†), F1 (phases).
- Homework (`homework-status.md`): 709 HW1 P1–P5, 448 `l3-eig-real` and `l4-g-sy` are **submitted**. So Q3 proves
  "Hermitian ⇒ real eigenvalues" (D2), works ⟨S⟩ and ΔS for |+n⟩ in full (D3, D4) and shows ⟨+n|−n⟩ = 0. 448's own
  three challenges stay hints-only in 448.

**Evidence.** Every number was computed twice: by the app's engine (`q23plan-engine.ts`, bundled with rolldown; read-only
imports of `physics/{complex,linalg,spin,sg,operators}.ts` and `physics/qc/{cmat,gates,state,measure}.ts`, including
`robertsonBound`, `varianceN`, `moment`, `funcHermitian`, `eigh`) and by an independent numpy script (`q23plan-numpy.py`).
They agree on all 604 numbers (170 keys, both chapters) to 2 × 10⁻⁶.

**Conventions.**
- Tracks, phases, captions, claims and stage shorthand as `P-Q2-story.md`; also `bloch{…}` = `{kind:'bloch',
  shot:'B-STD', …}` (709 poles: |0⟩ = |+z⟩ north), `ops{…}` = `{kind:'operator-space', shot:'O-STD', …}`.
- **ψ** = Q2's running state, the real arrow (0.866, 0.5) = `{planeDeg:30}`, used on the plane.
- **|+n⟩** = the chapter's sphere state, θ = 60°, φ = 45°: `ketFromBloch(π/3, π/4)` = (0.866, 0.354 + 0.354i),
  n̂ = (0.612, 0.612, 0.5). Its antipode |−n⟩ = (0.5, −0.612 − 0.612i).
- **Operator space only after eigenvalues** (`q3-spectral:b1` on): its readouts and passport name eigenvalues.
- **Rosetta lines:** `q3-bloch:b1` cap F (the notes' ϕ is φ; Bergou's and N&C's θ, φ agree); `q3-spin-operators:b2`
  cap F (the notes' "right/left states" are |±x⟩, N6); `q3-spin-operators:b5` F (N&C's ±1 is our ±ħ/2).

## 0. Chapter map

Q3 answers the map's question: **"What exactly happens, in numbers, when you measure, and why can't two spin components
both be sharp?"**

| # | id | Title (≤ 8 words) | Driving question | Sources | 448 bridges | Link-backs |
|---|---|---|---|---|---|---|
| 1 | `q3-born` | Chances from overlaps and projectors | How does an overlap become a chance, and how does an operator hold it? | notes p. 11; Bergou §5.2 p. 80; N&C Eqs. 2.103–2.104 | `l3-postulates`, `l3-projectors` | Units 1.3 (Born rule), 2.4 (outer product), 2.5 (completeness) |
| 2 | `q3-bloch` | Every spin state is a point on a sphere | Which two angles fix any spin state, and where is its opposite? | notes p. 12, Eqs. 1.4–1.5; Bergou Eq. 1.2; N&C Eq. 1.4 | `l6-bloch`, `l7-two-angles` | Unit 2.3 (the x states) |
| 3 | `q3-spin-operators` | Spin operators built from projectors | How do Stern–Gerlach filters build S_z, S_x, S_y and S_n? | notes pp. 12–13, Eqs. 1.6–1.7; N&C Fig. 2.2, Ex. 2.60 | `l4-projectors`, `l4-matrices`, `l2-plus-y` | Units 2.5 (UAU†), 1.3 (\|±y⟩) |
| 4 | `q3-observables` | Measurement rules and why observables are Hermitian | What does a measurement do to a state, what is its average, and why is its operator Hermitian? | notes pp. 13–14; Bergou Eq. 2.20; Axler 7.1, 7.5, 7.13–7.14 | `l3-postulates`, `l4-average`, `l6-bloch` | Unit 1.2 (filters) |
| 5 | `q3-spectral` | Real eigenvalues, spectral form and spread | Why are an observable's values real, and how do its eigenvectors give powers and spreads? | notes pp. 15–16; Axler 5.5, 7.12, 7.31; N&C Box 2.2 | `l3-eigen`, `l5-operators`, `l7-spreads` | Unit 2.5 (diagonal form) |
| 6 | `q3-uncertainty` | Commutators and the floor under two spreads | When can two quantities both be sharp, and how small can two spreads be together? | notes pp. 16–17, Eqs. 1.8–1.9; Axler 5.76, 6.14; N&C Thm 2.2, Box 2.4 | `l7-compatible`, `l7-order`, `l7-uncertainty` | Unit 1.2 (z, x, z) |

**Outcomes** (Ground wording):
- Write a chance as a projector sandwich, ⟨ψ|P|ψ⟩, and check that a basis's chances add to 1.
- Place any spin state on the sphere with two angles, and find its opposite state.
- Build S_z, S_x, S_y and S_n from projectors, and name the Pauli matrices.
- Say what a measurement does to the state, find an average, and explain why observables are Hermitian.
- Prove that a Hermitian operator's eigenvalues are real, and compute ⟨S⟩ and ΔS for any |+n⟩.
- State and prove the uncertainty relation, and test it on |+x⟩, |+z⟩ and |+n⟩.

**Prerequisites** (concepts): Q2 `qc-basis`, `qc-operator-matrix`, `qc-change-of-basis`, `qc-x-states`; Q1
`qc-superposition`; F1 `qc-euler`. 448 twins: `born-rule`, `bloch-sphere`, `spin-matrices`, `observables`,
`eigen-problem`, `uncertainty`.

**Openers and films.** No opener. Films deferred (§10).

## 1. Story beats per unit

Stage kinds: `hilbert-plane` (units 1, 3, 4), `bloch` (units 2–6), `amplitudes` (units 3, 4), `lab-r3` (units 3, 4, 6),
`operator-space` (units 5–6). Fidelity items used: 448's `plane-shadow-born`, `plane-update-bookkeeping`,
`plane-image-not-state`, `bloch-born`, `bloch-spread-distance`, `bloch-not-lab-space`, `op-parallel-commute`,
`op-commutator-arrow`, `lab-filter-is-projector`, `lab-moment-opposite`, `lab-prepared-offstage`.

### Unit `q3-born` — Chances from overlaps and projectors

**`q3-born:b1` [L]** (the rule, for any two states)
- **G:** "Unit 1.3 met the Born rule: a chance is a size squared. The notes now state it for any two states. The overlap ⟨α|β⟩ is the [[qc-amplitude|probability amplitude]] for a system prepared in |β⟩ to be found in |α⟩, and the chance is |⟨α|β⟩|². For |+z⟩ and |+x⟩ it is ½."
- **F:** "P_{α|β} = |⟨α|β⟩|² for normalized kets, with ⟨α|β⟩ the amplitude (notes p. 11) <<qc-l3-postulates|the Born rule and the state after a measurement>>. The notes' example: |⟨+x|+z⟩|² = ½."
- **Cap:** G/F "|+z⟩ read in the x frame: ½ and ½"
- **Stage:** `plane{ psi:'+z', basis:'x', shadows:true }`; flag `plane-shadow-born`.
- **Claims:** `q3Pzx` — `prob(KET['+x'], KET['+z'])` → 0.5.

**`q3-born:b2` [L]** (a chance is a projector sandwich; D1)
- **G:** "Write the chance as ⟨ψ|M⟩⟨M|ψ⟩. The middle pair |M⟩⟨M| is an outer product (Unit 2.4), the [[qc-projector|projector]] P_M onto |M⟩: it keeps the part of a state along |M⟩. So the chance is a sandwich, p_M = ⟨ψ|P_M|ψ⟩. For ψ and |+x⟩ it is 0.933."
- **F:** "p_M = |⟨M|ψ⟩|² = ⟨ψ|M⟩⟨M|ψ⟩ = ⟨ψ|P_M|ψ⟩ with P_M = |M⟩⟨M| (notes p. 11; D1): the probability is the projector's average in ψ. Here P_{+x}ψ has length 0.966, and ⟨ψ|P_{+x}|ψ⟩ = 0.933."
- **Cap:** G "ψ onto |+x⟩: a shadow 0.966 long, chance 0.933" · F "⟨ψ|P_{+x}|ψ⟩ = 0.933 = |⟨+x|ψ⟩|²"
- **Stage:** `plane{ psi:{planeDeg:30}, basis:'x', project:1 }` (readout |P̂ψ| = 0.966).
- **Derivation:** D1 (§2).
- **Claims:** `q3Born` — `prob(KET['+x'], ψ)` and `sandwich(projector(KET['+x']), ψ)` → 0.9330 both · `q3ProjLen` — `norm(apply(projector(+x), ψ))` → 0.9659.
- **Bridge (G):** "<<qc-l3-projectors|Spin Lab 3.3>> pulls out one outcome's piece the same way."

**`q3-born:b3` [L]** (the projectors of a basis add to I)
- **G:** "Make a projector Λ_i = |e_i⟩⟨e_i| for every arrow of an orthonormal basis. Unit 2.5 showed they add up to I, the operator that changes nothing. So the chances add to 1, and ψ = Σ_i|e_i⟩⟨e_i|ψ⟩ hands back its components."
- **F:** "An ON basis obeys ⟨i|j⟩ = δ_ij and Σ_iΛ_i = 1, Λ_i ≡ |i⟩⟨i| (notes p. 11; N&C Eq. 2.22, p. 67). Then Σ_i p_i = ⟨ψ|Σ_iΛ_i|ψ⟩ = 1 and |β⟩ = Σ_i|e_i⟩⟨e_i|β⟩ = Σ_i c_i|e_i⟩."
- **Cap:** G "ψ along x: chances 0.933 and 0.067, adding to 1" · F "P_{+x} + P_{−x} = I"
- **Stage:** `plane{ psi:{planeDeg:30}, basis:'x', shadows:true }`.
- **Claims:** `q3Born` (0.9330, 0.0670) · `q3Complete` — `matEq(projector(+x) + projector(−x), I2)`, same for ±z → true, true.

**`q3-born:b4` [B]** (Bergou's postulates: the chance and the state after)
- **G:** "Bergou lists the same rules as postulates. A projector used twice acts as once, P² = P. So the chance is also the squared length of P|ψ⟩. After the result, the state is P|ψ⟩ rescaled to length 1: here, |+x⟩."
- **F:** "Bergou §5.2 (p. 80): P_iP_j = δ_ijP_i, Σ_jP_j = I, p_j = ‖P_j|ψ⟩‖² = ⟨ψ|P_j²|ψ⟩ = ⟨ψ|P_j|ψ⟩, and the state after outcome j is P_j|ψ⟩/√p_j. N&C Eqs. 2.103–2.104 (p. 88) say the same for projective measurements."
- **Cap:** G "P_{+x}ψ, rescaled: the state after a + result is |+x⟩" · F "‖P_{+x}ψ‖ = 0.966 → P_{+x}ψ/‖P_{+x}ψ‖ = |+x⟩"
- **Stage:** `plane{ psi:{planeDeg:30}, basis:'x', project:1, renormalize:true }`; flag `plane-update-bookkeeping`.
- **Refs:** Bergou §5.2, p. 80; N&C pp. 87–88.
- **Claims:** `q3ProjLen` → 0.9659 · `q3AfterPlus` — `samePhysicalState(normalize(apply(projector(+x), ψ)), KET['+x'])` → true.

**`q3-born:b5` [C]** (does the projector see a phase?)
- **Q G:** "Multiply |M⟩ by −1, or by i. Does the projector |M⟩⟨M| change?"
- **Q F:** "Is |M⟩⟨M| invariant under |M⟩ → e^{iγ}|M⟩?"
- **Reveal G:** "No. The ket gains the phase and the bra gains its mirror image, and the two cancel: (i|M⟩)(−i⟨M|) = |M⟩⟨M|. A projector, like a chance, sees only the state, never its phase."
- **Reveal F:** "No: e^{iγ}|M⟩⟨M|e^{−iγ} = |M⟩⟨M|, so projectors, and all probabilities, depend only on the ray (Chapter F1)."
- **Reveal cap:** G/F "P for i|+x⟩ equals P for |+x⟩"
- **Stage:** question and reveal `plane{ psi:'+x', others:[{ket:{neg:'+x'}, role:'ghost', badge:'$-|M\rangle$'}] }`.
- **Claims:** `q3PhaseProj` — `matEq(projector(vscale(KET['+x'], I)), projector(KET['+x']))` → true.

### Unit `q3-bloch` — Every spin state is a point on a sphere

**`q3-bloch:b1` [L]** (two angles, Eq. 1.4)
- **G:** "Make the first amplitude real and at least 0: turning both together changes nothing (Chapter F1). With the chances adding to 1, every spin state is then |+n⟩ = cos(θ/2)|+z⟩ + e^{iφ}sin(θ/2)|−z⟩. The [[qc-polar-angle|polar angle]] θ runs from 0° to 180°; the [[qc-azimuth|azimuth]] φ runs all the way round."
- **F:** "Up to a global phase every normalized ket is |+n⟩ = |θ, φ⟩ = cos(θ/2)|+z⟩ + e^{iφ}sin(θ/2)|−z⟩ with 0 ≤ θ ≤ π, 0 ≤ φ < 2π (notes p. 12, Eq. 1.4; Bergou Eq. 1.2, p. 2; N&C Eq. 1.4, p. 15)."
- **Cap:** G "θ = 60°, φ = 45°: amplitudes 0.866 and 0.354 + 0.354i" · F "Rosetta: the notes' ϕ is φ here; Bergou and N&C use the same θ, φ and |0⟩ = |+z⟩"
- **Stage:** `bloch{ state:{thetaDeg:60, phiDeg:45} }` (ket readouts ψ₁, ψ₂).
- **Claims:** `q3N` — `ketFromBloch(π/3, π/4)` → (0.8660, 0.3536 + 0.3536i).
- **Bridge (G):** "<<qc-l6-bloch|three averages make a point>> builds the same sphere from averages."

**`q3-bloch:b2` [L]** (the sphere)
- **G:** "The same two angles name an arrow of length 1 in space, n̂ = (sin θ cos φ, sin θ sin φ, cos θ). So every spin state is one point on a sphere of radius 1, the [[qc-bloch-sphere|Bloch sphere]]. |0⟩ = |+z⟩ sits at the north pole; here n̂ = (0.612, 0.612, 0.5)."
- **F:** "|+n⟩ ↔ n̂ = (sin θ cos φ, sin θ sin φ, cos θ) ∈ S² (notes p. 12), one-to-one on rays: the global phase is gone. |±x⟩ and |±y⟩ sit on the equator at φ = 0, π and ±π/2 <<qc-l6-equator|relative phase sets the longitude>>."
- **Cap:** G/F "n̂ = (0.612, 0.612, 0.5)"
- **Stage:** `bloch{ state:{thetaDeg:60, phiDeg:45}, dropLines:['z'] }`; flag `bloch-not-lab-space`.
- **Claims:** `q3NVec` — `blochVector(|+n⟩)` → (0.6124, 0.6124, 0.5).

**`q3-bloch:b3` [L]** (the opposite state, Eq. 1.5)
- **G:** "The opposite point has angles 180° − θ and φ + 180°. Its state is |−n⟩ = sin(θ/2)|+z⟩ − e^{iφ}cos(θ/2)|−z⟩. Its overlap with |+n⟩ is cos(θ/2)sin(θ/2) − sin(θ/2)cos(θ/2) = 0, since the phases cancel: opposite points are states at right angles."
- **F:** "|−n⟩ = |π − θ, φ + π⟩ = sin(θ/2)|+z⟩ − e^{iφ}cos(θ/2)|−z⟩ (Eq. 1.5), and ⟨+n|−n⟩ = cos(θ/2)sin(θ/2) − e^{−iφ}sin(θ/2)e^{iφ}cos(θ/2) = 0 (notes p. 12). Its Bloch vector is −n̂ <<qc-l7-two-angles|sphere angles are twice state angles>>."
- **Cap:** G "the dot opposite |+n⟩ is |−n⟩" · F "⟨+n|−n⟩ = 0; r(|−n⟩) = −n̂"
- **Stage:** `bloch{ state:{thetaDeg:60, phiDeg:45}, measure:{thetaDeg:60, phiDeg:45} }` (the dashed axis ends in the ±n̂ dots; readout P(+) along n̂ = 1.000).
- **Claims:** `q3MinusN` — `ketFromBloch(2π/3, 5π/4)` → (0.5, −0.6124 − 0.6124i), equal to the notes' form · `q3NOrth` — `inner(|+n⟩, |−n⟩)` → 0 · `q3MinusNVec` → (−0.6124, −0.6124, −0.5).

**`q3-bloch:b4` [C]** (the south pole)
- **Q G:** "The point opposite |+z⟩ is the south pole. Is its state −|+z⟩, the arrow turned around?"
- **Q F:** "Is −|+z⟩ the state at the south pole?"
- **Reveal G:** "No. −|+z⟩ is |+z⟩ times the phase −1: the same state, still at the north pole. The south pole is |−z⟩, at right angles. Eq. 1.5 at θ = 0 gives −|−z⟩, again the south pole."
- **Reveal F:** "No: −|+z⟩ = e^{iπ}|+z⟩ is the same ray. The antipode of n̂ = ẑ is |π, π⟩ = −|−z⟩ ≅ |−z⟩; opposite points are orthogonal kets, not negated ones."
- **Reveal cap:** G/F "−|+z⟩: north pole; |−z⟩: south pole"
- **Stage:** question `bloch{ state:'+z' }`; reveal `bloch{ state:'-z', path:{about:'x'} }` (an explicit half turn, never an antipodal jump).
- **Claims:** `q3MinusZpole` — `ketFromBloch(π, π)` → (0, −1), `samePhysicalState(·, KET['-z'])` → true, `samePhysicalState(−|+z⟩, |+z⟩)` → true.

### Unit `q3-spin-operators` — Spin operators built from projectors

**`q3-spin-operators:b1` [L]** (the filter is a projector)
- **G:** "A z magnet that passes only its + beam acts as P_{+z} = |+z⟩⟨+z|, the table [[1, 0], [0, 0]]. It turns α|+z⟩ + β|−z⟩ into α|+z⟩. Rescaled, that is |+z⟩: for ψ, (0.866, 0.5) becomes (0.866, 0), then (1, 0)."
- **F:** "SG_{z+} ↔ P̂_{±z} = |±z⟩⟨±z| = diag(1, 0), diag(0, 1) (notes p. 12). P̂_{+z}|ψ⟩ = α|+z⟩ is not normalized; the state after is P̂_{+z}|ψ⟩/‖P̂_{+z}|ψ⟩‖ = |+z⟩ up to phase."
- **Cap:** G "ψ through the + filter: (0.866, 0), rescaled (1, 0)" · F "P̂_{+z}ψ = (0.866, 0)"
- **Stage:** `plane{ psi:{planeDeg:30}, basis:'z', project:1, renormalize:true }`; flag `lab-filter-is-projector` in words (caption).
- **Claims:** `q3ReducePsi` — `apply(projector(+z), ψ)` → (0.8660, 0).
- **Bridge (G):** "<<qc-l4-projectors|a projector asks a yes/no question>>."

**`q3-spin-operators:b2` [L]** (the same projector in the x basis)
- **G:** "Write P_{+z} in the x basis with Unit 2.5's rule P' = UPU†. Every entry becomes ½: each is a product of two overlaps ⟨±x|+z⟩ = 0.707. The table changed, yet squaring still gives it back: P² = P in every basis."
- **F:** "(P̃_{+z})_{αβ} = ⟨α|+z⟩⟨+z|β⟩ for α, β ∈ {+x, −x} gives ½(1 1; 1 1) = ÛP̂_{+z}Û⁻¹ with Û = H (notes p. 12). P² = P is basis-free: (UPU†)² = UP²U†."
- **Cap:** G "|+z⟩ in the x frame: 0.707 and 0.707" · F "Rosetta: the notes' 'right/left states' here are |±x⟩ (N6), not circular light"
- **Stage:** `plane{ psi:'+z', basis:'x', shadows:true }`.
- **Claims:** `q3PzInX` — `H·projector(+z)·H†` → ½[[1, 1], [1, 1]] · `q3Idem` → true, true.

**`q3-spin-operators:b3` [L]** (S_z from its projectors)
- **G:** "A spin reading along z is +ħ/2 or −ħ/2. Weight each projector by its reading and add: S_z = (ħ/2)P_{+z} − (ħ/2)P_{−z}. That is the [[qc-spin-operator|spin operator]] S_z = (ħ/2)[[1, 0], [0, −1]]."
- **F:** "𝒮_z = (ħ/2)𝒫_{+z} + (−ħ/2)𝒫_{−z} (notes p. 12): an observable is its values times their projectors <<qc-l4-matrices|spin matrices built from their outcomes>>."
- **Cap:** G/F "S_z = (ħ/2)P_{+z} − (ħ/2)P_{−z}"
- **Stage:** `lab{ benches:[main('oven', [Z])], readouts:['fractions'], shot:'L-PLATE' }`; flag `lab-moment-opposite`.
- **Claims:** `q3SzBuild` — `matEq(½(projector(+z) − projector(−z)), SZ)` → true.

**`q3-spin-operators:b4` [L]** (x and y)
- **G:** "Along x, the projectors of Unit 2.3's |±x⟩ are P_{±x} = ½[[1, ±1], [±1, 1]], so S_x = (ħ/2)[[0, 1], [1, 0]]. For y, the notes ask for states that split 50/50 along both z and x. They are |±y⟩ = (|+z⟩ ± i|−z⟩)/√2, as in Unit 1.3."
- **F:** "P̂_{±x} from Eqs. 1.1–1.2 and 𝒮_x = (ħ/2)(𝒫_{+x} − 𝒫_{−x}) (notes p. 13). |⟨±z|±y⟩|² = |⟨±x|±y⟩|² = ½ fixes |±y⟩ up to phase <<qc-l2-plus-y|real numbers cannot make +y>>; 𝒮_y = (ħ/2)(𝒫_{+y} − 𝒫_{−y})."
- **Cap:** G "|+y⟩: chance ½ along z and ½ along x" · F "|⟨+z|+y⟩|² = |⟨+x|+y⟩|² = 0.5"
- **Stage:** `amp{ state:{dir:'+y'}, dials:true, labels:'spin' }`.
- **Claims:** `q3SxBuild`, `q3SyBuild` → true, true · `q3PmX` → ½[[1, −1], [−1, 1]] · `q3Y5050` → 0.5, 0.5, 0.5.

**`q3-spin-operators:b5` [L]** (the Pauli matrices and S_n)
- **G:** "Take out ħ/2: S_i = (ħ/2)σ_i, where σ_x, σ_y, σ_z are the three [[qc-pauli-matrices|Pauli matrices]]. A magnet along n̂ measures S_n = (ħ/2)(|+n⟩⟨+n| − |−n⟩⟨−n|). Worked out, S_n = (ħ/2)σ_n with σ_n = n_xσ_x + n_yσ_y + n_zσ_z."
- **F:** "Eq. 1.6: σ_x = (0 1; 1 0), σ_y = (0 −i; i 0), σ_z = (1 0; 0 −1); Eq. 1.7: σ_n = (cos θ, sin θ e^{−iφ}; sin θ e^{iφ}, −cos θ) = n̂·σ⃗ (notes p. 13). Its readings are ±1: N&C's ±1 is our ±ħ/2 (N&C ⚑ Ex. 2.60, p. 90)."
- **Cap:** G "the magnet along n̂: readings ±ħ/2 at the two dots" · F "σ_n's corner entry: 0.612 − 0.612i"
- **Stage:** `bloch{ state:{thetaDeg:60, phiDeg:45}, measure:{thetaDeg:60, phiDeg:45} }`.
- **Claims:** `q3SnIsSpinAlong` — `matEq(½(projector(|+n⟩) − projector(|−n⟩)), spinAlong(n̂))` → true · `q3SigmaN[0][1]` → 0.6124 − 0.6124i · `q3SigmaNEig` → −1, 1.

**`q3-spin-operators:b6` [C]** (same table, different operator)
- **Q G:** "P_{+z} written in the x basis has the same four numbers as P_{+x} written in the z basis. Are P_{+z} and P_{+x} the same operator?"
- **Q F:** "[P_{+z}]_x = [P_{+x}]_z as matrices. Does P_{+z} = P_{+x}?"
- **Reveal G:** "No. P_{+z} keeps |+z⟩ whole, while P_{+x} shortens it to 0.707 of |+x⟩. The tables match only because H swaps the roles of the two bases."
- **Reveal F:** "No: H P_{+z} H† = P_{+x} as matrices because H = H† maps z-coordinates to x-coordinates both ways; yet P_{+x}|+z⟩ has norm 0.707 while P_{+z}|+z⟩ = |+z⟩."
- **Reveal cap:** G/F "P_{+x}|+z⟩: length 0.707; P_{+z}|+z⟩: length 1"
- **Stage:** question `plane{ psi:'+z', others:[{ket:'+x', role:'second'}] }`; reveal `plane{ psi:'+z', basis:'x', project:1 }`.
- **Claims:** `q3PzInXisPx` → true · `q3NotSame` — `matEq(projector(+z), projector(+x))` → false · `q3PxOnZ` → 0.7071.

### Unit `q3-observables` — Measurement rules and why observables are Hermitian

**`q3-observables:b1` [L]** (what a measurement does)
- **G:** "A measurement jumps the state into the state of the result it gives: |ψ⟩ → |α⟩. A [[qc-selective-measurement|selective measurement]] lets one result through and blocks the rest, like a magnet with one beam stopped. Behind the + filter, every atom is in |+z⟩."
- **F:** "Measurement projects |ψ⟩ onto one 'measurement state' |α_i⟩, with P_i = |⟨α_i|ψ⟩|² for normalized kets; a selective measurement keeps one |α_i⟩ and rejects the rest (notes pp. 13–14) <<qc-l3-postulates|the Born rule and the state after a measurement>>."
- **Cap:** G/F "oven → z (keep +) → z: all + at the plate; ½ blocked"
- **Stage:** `lab{ benches:[main('oven', [Zp, Z])], readouts:['fractions','blocked'], shot:'L-TRACK' }`.
- **Claims:** `q3Selective` — `benchTheory({source:'oven', axes:['z','z'], keep:['+']})` → plus 0.5, minus 0, blocked [0.5].

**`q3-observables:b2` [L]** (the operator and its average)
- **G:** "Give each result its value M_α, and build M = Σ_α M_α|α⟩⟨α|. The [[qc-expectation-value|expectation value]] is ⟨M⟩ = ⟨ψ|M|ψ⟩ = Σ_α M_αP_α: each value times its chance, added. For |+n⟩ along z: (ħ/2)(0.75) − (ħ/2)(0.25) = 0.25ħ."
- **F:** "ℳ_α = M_α|α⟩⟨α| (M_α ∈ ℝ), ℳ = Σ_αℳ_α an [[qc-observable|observable]], ⟨M⟩ = ⟨ψ|ℳ|ψ⟩ = Σ_αM_αP_α (notes p. 14) <<qc-l4-average|the average that no atom reads>>. For |+n⟩: ⟨S_z⟩ = 0.25ħ = (ħ/2)cos θ."
- **Cap:** G "|+n⟩ along z: chances 0.75 and 0.25, average 0.25ħ" · F "⟨S_z⟩ = 0.25ħ"
- **Stage:** `amp{ state:{dir:{thetaDeg:60, phiDeg:45}}, mode:'probability', labels:'spin' }`.
- **Claims:** `q3Pz` → 0.75, 0.25 · `q3AvgSz` — `expectation(SZ, |+n⟩)` → 0.25, equal to `q3AvgSzSum`.

**`q3-observables:b3` [L]** (the average spin is the point; D3)
- **G:** "Do the same along x and y. For |+n⟩ the three averages together are ⟨S⟩ = (ħ/2)n̂: the point on the sphere is the average spin, measured in units of ħ/2. Here ⟨S⟩ = (0.306, 0.306, 0.25)ħ."
- **F:** "⟨S_z⟩ = (ħ/2)(cos²(θ/2) − sin²(θ/2)) = (ħ/2)cos θ and ⟨S_x⟩ + i⟨S_y⟩ = ħα*β = (ħ/2)sin θ e^{iφ}, with α, β the amplitudes of Eq. 1.4, so ⟨S⃗⟩ = (ħ/2)n̂ (D3). Bergou's n_j = Tr(ρσ_j) (Eq. 2.20, p. 19) is the same statement."
- **Cap:** G/F "⟨S⟩ = (0.306, 0.306, 0.25)ħ = (ħ/2)n̂"
- **Stage:** `bloch{ state:{thetaDeg:60, phiDeg:45}, readouts:['averages'] }`.
- **Derivation:** D3 (§2).
- **Claims:** `q3AvgS` → (0.3062, 0.3062, 0.25) · `q3AvgSigma` — ⟨σ_i⟩ → n̂.
- **Bridge (G):** "<<qc-l5-averages|three averages from one column>>."

**`q3-observables:b4` [L]** (the adjoint)
- **G:** "Every operator A has a partner A†, its [[qc-adjoint|adjoint]]: the bra of A|α⟩ is ⟨α|A†. As a table, A† is A mirrored across its diagonal with every entry conjugated. Unit 2.4's A turns arrows by +45°; its adjoint [[1, 1], [−1, 1]] turns them by −45°."
- **F:** "⟨β|A†|α⟩ = ⟨Aβ|α⟩ = ⟨α|Aβ⟩* = ⟨α|A|β⟩* defines A†, so (A†)_ij = A*_ji; (A†)† = A, (AB)† = B†A†, (cA)† = c*A† (notes p. 14; Axler 7.1, p. 228, and 7.5, p. 230)."
- **Cap:** G "A†ψ: turned back by 45°, stretched by 1.414" · F "(AB)† = B†A† ≠ A†B† here"
- **Stage:** `plane{ psi:{planeDeg:30}, image:{matrix:[['1','1'],['-1','1']], label:'$A^\dagger|\psi\rangle$'} }`; flag `plane-image-not-state`.
- **Claims:** `q3AdagA` — `dagger(A)` → [[1, 1], [−1, 1]]; `norm(apply(dagger(A), ψ))` → 1.4142 · `q3AdjProd` → true, false · `q3AdjScale` → true.

**`q3-observables:b5` [L]** (why an observable is Hermitian)
- **G:** "An operator is Hermitian when A† = A ([[qc-hermitian-matrix|Hermitian]], Unit 1.5). A measured value is a real number, so ⟨ψ|M|ψ⟩ must be real in every state. The notes show this forces M† = M: an observable's operator is Hermitian."
- **F:** "If ⟨ψ|M|ψ⟩ ∈ ℝ for all ψ, then ⟨ψ|M|ψ⟩ = ⟨ψ|Mψ⟩* = ⟨Mψ|ψ⟩ = ⟨ψ|M†|ψ⟩, so ⟨ψ|(M − M†)|ψ⟩ = 0 for all ψ; over ℂ that forces M = M† (notes p. 14; Axler 7.13–7.14, p. 234). This covers projective observables only (N7; Q12 widens it)."
- **Cap:** G "all three averages are real numbers" · F "a non-Hermitian (0 1; 0 0) gives ⟨+n|·|+n⟩ = 0.306 + 0.306i"
- **Stage:** as b3.
- **Claims:** `q3NonHerm` — `sandwich([[0,1],[0,0]], |+n⟩)` → 0.3062 + 0.3062i; `isHermitian` → false.

**`q3-observables:b6` [C]** (real arrows are not enough)
- **Q G:** "The quarter turn J = [[0, −1], [1, 0]] gives ⟨v|Jv⟩ = 0, a real number, for every real arrow v. Yet J† ≠ J. Does J break the theorem?"
- **Q F:** "⟨v|Jv⟩ = 0 for all real v, though J is anti-Hermitian. Is the theorem false?"
- **Reveal G:** "No. The theorem asks for every state, complex ones included. For |+y⟩, ⟨+y|J|+y⟩ = −i, which is not real. Real arrows alone cannot catch a non-Hermitian operator."
- **Reveal F:** "No: over ℝ, ⟨v, Tv⟩ = 0 for all v allows T ≠ 0 (a rotation by π/2); over ℂ it forces T = 0 (Axler 7.13, p. 234). Here ⟨+y|J|+y⟩ = −i."
- **Reveal cap:** G/F "real arrows: 0; |+y⟩: −i"
- **Stage:** question `plane{ psi:{planeDeg:30}, image:{matrix:[['0','-1'],['1','0']], label:'$J\psi$'} }` (the image stands at right angles to ψ); reveal `amp{ state:{dir:'+y'}, dials:true, labels:'spin' }`.
- **Claims:** `q3JReal` — `sandwich(J, ψ)`, `sandwich(J, (0.28, 0.96))`, `sandwich(J, KET['+y'])` → 0, 0, −i.

### Unit `q3-spectral` — Real eigenvalues, spectral form and spread

**`q3-spectral:b1` [L]** (the eigenvalue problem)
- **G:** "An [[qc-eigenvector|eigenvector]] of A is an arrow A only stretches: A|a⟩ = a|a⟩, and the stretch a is its [[qc-eigenvalue|eigenvalue]]. The eigenvalues solve the [[qc-characteristic-equation|characteristic equation]] det(A − aI) = 0, where a 2×2 table's det is (top-left × bottom-right) − (top-right × bottom-left). The picture draws M = [[1, 2 − i], [2 + i, −3]] as an arrow 3 long, half its eigenvalue gap. Its gauge sits at their midpoint, −1."
- **F:** "A|α_i⟩ = a_i|α_i⟩, i.e. Σ_j A_kj c_j^{(i)} = a_i c_k^{(i)}; the a_i solve det(Â − a1) = 0 (notes p. 15; Axler 5.5, p. 134). An eigenvalue with two LI eigenvectors is [[qc-degenerate|degenerate]]."
- **Cap:** G "M = [[1, 2 − i], [2 + i, −3]]: a² + 2a − 8 = 0, so a = 2 or −4" · F "the arrow: half the gap, 3; the gauge: the midpoint, −1"
- **Stage:** `ops{ op:{matrix:[['1','2-i'],['2+i','-3']]}, eigen:true, labels:'plain' }`.
- **Claims:** `q3MPoly` — `charPoly2(M)` → [1, 2, −8] · `q3MVals` — `eigh(M).values` → [−4, 2] · `q3MGauge` — `decomposeHermitian(M)` → a₀ = −1, |a⃗| = 3.
- **Bridge (G):** "<<qc-l3-eigen|Spin Lab 3.2>> finds the directions an operator only stretches."

**`q3-spectral:b2` [L]** (Hermitian means real eigenvalues; D2)
- **G:** "For a Hermitian A every eigenvalue is real. Sandwich A between ⟨a| and |a⟩ in two ways. Letting A act on the ket gives a⟨a|a⟩; letting it act on the bra gives a*⟨a|a⟩. Since ⟨a|a⟩ is not zero, a = a*."
- **F:** "a₁⟨a₁|a₁⟩ = ⟨a₁|A|a₁⟩ = ⟨a₁|A†|a₁⟩ = ⟨Aa₁|a₁⟩ = ⟨a₁|Aa₁⟩* = a₁*⟨a₁|a₁⟩, and ⟨a₁|a₁⟩ > 0, so a₁ ∈ ℝ (notes p. 15; D2; Axler 7.12, p. 233; N&C ⚑ Ex. 2.17, p. 70, one direction; no open sheet assigns it). The quarter turn J, not Hermitian, has eigenvalues ±i."
- **Cap:** G "M's eigenvalues 2 and −4: real" · F "J = (0 −1; 1 0): eigenvalues ±i"
- **Stage:** as b1.
- **Derivation:** D2 (§2).
- **Claims:** `q3MVals` → [−4, 2] · `q3JEig` — `eigen2(J).values` → ±i.

**`q3-spectral:b3` [L]** (orthogonal eigenvectors, an orthonormal basis)
- **G:** "Eigenvectors with different eigenvalues are at right angles. So, rescaled, a Hermitian operator's eigenvectors form an orthonormal basis. M's two eigenvectors have overlap 0, and so do |+n⟩ and |−n⟩ for S_n."
- **F:** "(a₂ − a₁)⟨a₂|a₁⟩ = 0 uses ⟨a₂|A = a₂⟨a₂|, with a₂ real by D2 (N8); in a degenerate eigenspace, Gram–Schmidt (Unit 2.2) makes the eigenvectors ON. Hence an ON eigenbasis (notes p. 15; Axler 7.31, p. 246)."
- **Cap:** G/F "⟨eigenvector 1|eigenvector 2⟩ = 0"
- **Stage:** as b1.
- **Claims:** `q3MOrth` → 0 · `q3NOrth` → 0.

**`q3-spectral:b4` [L]** (diagonal form, spectral representation, f(A))
- **G:** "In its own eigenbasis a Hermitian operator's table is diagonal, with its eigenvalues down the diagonal. So A = Σ_i a_i|a_i⟩⟨a_i|, its [[qc-spectral-representation|spectral representation]], and any function acts on the eigenvalues: f(A) = Σ_i f(a_i)|a_i⟩⟨a_i|. Squaring S_z gives (ħ²/4)I."
- **F:** "A = Σ_ia_i|α_i⟩⟨α_i| and f(A) = Σ_if(a_i)|α_i⟩⟨α_i| (notes p. 15; N&C Box 2.2, p. 72). With Unit 2.5's U (new basis = eigenbasis) the diagonal table is UAU†; the notes write Û†ÂÛ, which needs Û's columns to be the eigenvectors (N21)."
- **Cap:** G "S_z: diagonal in its own basis, readings ±ħ/2" · F "y basis: Uσ_yU† = diag(1, −1), U†σ_yU = σ_x"
- **Stage:** `ops{ op:{named:'Sz'}, eigen:true }` (Pauli passport, defined in `q3-spin-operators:b5`).
- **Claims:** `q3F` — `funcHermitian(S_n, a ↦ a²)` → ¼I · `q3DiagUAUd` → diag(1, −1) · `q3DiagUdAU` → [[0, 1], [1, 0]].
- **Bridge (G):** "<<qc-l5-operators|operators change coordinates too>> diagonalizes with B."

**`q3-spectral:b5` [L]** (moments and spread; D4)
- **G:** "Powers work the same way: ⟨Aⁿ⟩ = Σ_ip_ia_iⁿ. The [[qc-dispersion|dispersion]] (ΔA)² = ⟨A²⟩ − ⟨A⟩² measures how widely readings scatter. For |+n⟩ along z: ⟨S_z²⟩ = 0.25ħ² and ⟨S_z⟩² = 0.0625ħ², so (ΔS_z)² = 0.1875ħ²."
- **F:** "⟨ψ|Aⁿ|ψ⟩ = Σ_i|⟨α_i|ψ⟩|²a_iⁿ (notes pp. 15–16). With S_i² = (ħ²/4)I, (ΔS_i)² = (ħ²/4)(1 − n_i²) for |+n⟩ (D4): here (0.156, 0.156, 0.1875)ħ² <<qc-l7-spreads|spreads you can read off the sphere>>."
- **Cap:** G "ΔS_z = 0.433ħ for |+n⟩" · F "(ΔS_x, ΔS_y, ΔS_z) = (0.395, 0.395, 0.433)ħ"
- **Stage:** `bloch{ state:{thetaDeg:60, phiDeg:45}, dropLines:['x','y','z'], readouts:['averages','spreads'] }`; flag `bloch-spread-distance`.
- **Derivation:** D4 (§2).
- **Claims:** `q3Mom` — `moment(|+n⟩, SZ, 1)`, `moment(|+n⟩, SZ, 2)` → 0.25, 0.25; `q3AvgSz`² → 0.0625; `varianceN` → 0.1875; ΔS_z → 0.4330 · `q3Var` → (0.15625, 0.15625, 0.1875) · `q3SpreadsN` → (0.3953, 0.3953, 0.4330).

**`q3-spectral:b6` [C]** (zero spread)
- **Q G:** "Which states give S_n, the spin along n̂, no spread at all?"
- **Q F:** "For which ψ is (ΔS_n)² = 0?"
- **Reveal G:** "Its eigenvectors, |+n⟩ and |−n⟩. In |+n⟩ every reading is +ħ/2, so the average is ħ/2 and nothing scatters: (ΔS_n)² = ħ²/4 − ħ²/4 = 0."
- **Reveal F:** "(ΔA)² = ‖(A − ⟨A⟩)ψ‖² vanishes iff Aψ = ⟨A⟩ψ: exactly the eigenvectors of A. For |+n⟩, ⟨S_n⟩ = ħ/2 and (ΔS_n)² = 0."
- **Reveal cap:** G/F "|+n⟩: ⟨S_n⟩ = 0.5ħ, (ΔS_n)² = 0"
- **Stage:** question `bloch{ state:{thetaDeg:60, phiDeg:45} }`; reveal `bloch{ state:{thetaDeg:60, phiDeg:45}, measure:{thetaDeg:60, phiDeg:45} }`.
- **Claims:** `q3EigZero` — `expectation(S_n, |+n⟩)`, `varianceN(|+n⟩, S_n)` → 0.5, 0.

### Unit `q3-uncertainty` — Commutators and the floor under two spreads

**`q3-uncertainty:b1` [L]** (commutators; Eq. 1.8)
- **G:** "The [[qc-commutator|commutator]] [A, B] = AB − BA measures how much the order matters. For spin, [S_x, S_y] = iħS_z, and likewise round the cycle x → y → z → x. The [[qc-anticommutator|anticommutator]] {A, B} = AB + BA is zero for two different spin components."
- **F:** "[A,B] = −[B,A], [A, B + C] = [A,B] + [A,C], [A, BC] = B[A,C] + [A,B]C and the Jacobi identity (notes p. 16). Eq. 1.8: [S_i, S_j] = iħε_ijkS_k, {S_i, S_j} = (ħ²/2)δ_ijI; S² = ΣS_i² = (3ħ²/4)I commutes with every S_i."
- **Cap:** G "S_x and S_y: arrows at right angles, so the order matters" · F "[S_x, S_y] = iħS_z; S² = 0.75ħ² I"
- **Stage:** `ops{ op:{named:'Sx'}, add:{named:'Sy'} }`; flag `op-commutator-arrow`.
- **Claims:** `q3CommXY` — `matEq(commutator(SX, SY), i·SZ)` → true · `q3AntiXY`, `q3AntiXX` → true, true · `q3S2` → 0.75 I · `q3S2Comm` → true · `q3Jacobi` → true.
- **Bridge (G):** "<<qc-l7-compatible|compatible measurements share a basis and commute>>."

**`q3-uncertainty:b2` [L]** (compatible observables)
- **G:** "Two observables are [[qc-compatible|compatible]] when their operators commute. Then, if A's eigenvalues are all different, each eigenvector of A is an eigenvector of B too: a [[qc-simultaneous-eigenvector|simultaneous eigenvector]]. Measuring A and then B keeps both values sharp."
- **F:** "0 = ⟨a_i|[A,B]|a_j⟩ = (a_i − a_j)⟨a_i|B|a_j⟩, so B is diagonal in A's eigenbasis (notes p. 16); if AB ≠ BA, no complete set |a, b⟩ exists, since diagonal tables commute (p. 17; Axler 5.76, p. 176; N&C Thm 2.2, p. 77)."
- **Cap:** G "S_x and P_{+x}: parallel arrows, so they commute" · F "[S_x, P_{+x}] = 0; in x: P_{+x} = diag(1, 0)"
- **Stage:** `ops{ op:{named:'Sx'}, add:{matrix:[['1/2','1/2'],['1/2','1/2']]} }`; flag `op-parallel-commute`.
- **Claims:** `q3CompatPx` — `commutator(SX, projector(+x))` → 0, `H·projector(+x)·H†` → diag(1, 0).
- **Bridge (G):** "<<qc-l7-order|swapping the order of two measurements>>."

**`q3-uncertainty:b3` [L]** (shifted operators and the Schwarz inequality)
- **G:** "Shift an observable by its average: ΔA = A − ⟨A⟩I. Then the dispersion is the squared length of ΔA|ψ⟩. The [[qc-schwarz-inequality|Schwarz inequality]] says an overlap is never bigger than the lengths allow: |⟨a|b⟩|² ≤ ⟨a|a⟩⟨b|b⟩. For (1, i) and (2, 1): 5 ≤ 10."
- **F:** "ΔA = A − ⟨ψ|A|ψ⟩1 gives ⟨(ΔA)²⟩ = ‖ΔA|ψ⟩‖² = ⟨A²⟩ − ⟨A⟩² (notes p. 17). Schwarz: ⟨a|a⟩⟨b|b⟩ ≥ |⟨a|b⟩|², from ‖|a⟩ + λ|b⟩‖² ≥ 0 at λ = −⟨b|a⟩/⟨b|b⟩ (notes p. 17; Axler 6.14, p. 189)."
- **Cap:** G "|+n⟩: ΔS_x and ΔS_y drawn as distances to the axes" · F "|⟨a|b⟩|² = 5 ≤ 10; at the best λ, ‖a + λb‖² = 1"
- **Stage:** `bloch{ state:{thetaDeg:60, phiDeg:45}, dropLines:['x','y'], readouts:['spreads'] }`.
- **Claims:** `q3Schwarz` → 5, 10, λ = −0.4 − 0.2i, 1 · `q3Var[0]` — ‖ΔS_x|+n⟩‖² → 0.15625.

**`q3-uncertainty:b4` [L]** (the uncertainty relation; D5)
- **G:** "Put |a⟩ = ΔA|ψ⟩ and |b⟩ = ΔB|ψ⟩ into Schwarz. Then split ΔAΔB into half its commutator plus half its anticommutator. The commutator half alone gives the [[qc-uncertainty-relation|uncertainty relation]]: (ΔA)²(ΔB)² ≥ ¼|⟨[A, B]⟩|²."
- **F:** "Eq. 1.9: ⟨(ΔA)²⟩⟨(ΔB)²⟩ ≥ ¼|⟨[A,B]⟩|² for every ψ (notes p. 17; D5). For |+n⟩, S_x, S_y: 0.0244ħ⁴ ≥ 0.0156ħ⁴; the anticommutator term dropped in D5 is 0.0088ħ⁴ <<qc-l7-uncertainty|a floor under the product of spreads>>."
- **Cap:** G "ΔS_x·ΔS_y = 0.156ħ², above the floor ½|⟨S_z⟩| = 0.125ħ²" · F "⟨[S_x, S_y]⟩ = 0.25iħ²: purely imaginary"
- **Stage:** `bloch{ state:{thetaDeg:60, phiDeg:45}, dropLines:['x','y'], readouts:['spreads','bound'] }`.
- **Derivation:** D5 (§2).
- **Claims:** `q3Rob` — `robertsonBound(|+n⟩, SX, SY)` → product 0.15625, bound 0.125; squares 0.024414, 0.015625 · `q3CommExp` → 0.25i · `q3Cov2` → 0.008789.

**`q3-uncertainty:b5` [L]** (the notes' two examples)
- **G:** "For |+x⟩, S_x is sharp, so the left side is 0; and ⟨S_z⟩ = 0 makes the right side 0 as well. For |+z⟩, (ΔS_x)² = (ΔS_y)² = ħ²/4, and both sides equal ħ⁴/16: this state sits exactly on the floor."
- **F:** "|+x⟩: (ΔS_x)² = 0, (ΔS_y)² = ħ²/4, ¼|iħ⟨S_z⟩|² = 0. |+z⟩: ¼(ħ/2)²ħ² = ħ⁴/16 = (ΔS_x)²(ΔS_y)², equality (notes p. 17; ⟨S_x⟩ and ΔS_x for |+z⟩ are N&C ⚑ Ex. 2.59, p. 90)."
- **Cap:** G "|+z⟩: ΔS_x·ΔS_y = 0.25ħ² = ½|⟨S_z⟩|" · F "|+z⟩: 0.0625ħ⁴ = 0.0625ħ⁴"
- **Stage:** `bloch{ state:'+z', readouts:['spreads','bound'] }`.
- **Claims:** `q3RobZ` → product 0.25, bound 0.25, squares 0.0625, 0.0625 · `q3RobX` → variances 0, 0.25; product 0, bound 0.

**`q3-uncertainty:b6` [B]** (spread, not disturbance)
- **G:** "Nielsen and Chuang warn against a common misreading. The relation is not about one measurement disturbing another. Prepare many copies of |+z⟩; measure x on some and z on others. The x readings scatter, and the z readings never do."
- **F:** "N&C Box 2.4 (p. 89) reaches ΔCΔD ≥ |⟨[C,D]⟩|/2 by splitting ⟨ψ|AB|ψ⟩ into real and imaginary parts and applying Cauchy–Schwarz. Its content is the statistics of separate, identically prepared ensembles, not the effect of one measurement on another."
- **Cap:** G/F "copies of |+z⟩: x gives ½ and ½; z gives all +"
- **Stage:** `lab{ benches:[{id:'A', source:'+z', devices:[{axis:'x'}]}, {id:'B', source:'+z', devices:[Z]}], readouts:['fractions'], shot:'L-3Q' }`; flag `lab-prepared-offstage`.
- **Refs:** N&C Box 2.4, p. 89.
- **Claims:** `q3EnsX` → 0.5, 0.5 · `q3EnsZ` → 1, 0.

**`q3-uncertainty:b7` [C]** (a zero floor)
- **Q G:** "For |+x⟩ both sides of the uncertainty relation are 0. Does that make S_x and S_y compatible?"
- **Q F:** "In |+x⟩, (ΔS_x)²(ΔS_y)² = 0 = ¼|⟨[S_x, S_y]⟩|². Are S_x and S_y compatible?"
- **Reveal G:** "No. Compatibility belongs to the operators, and [S_x, S_y] = iħS_z is never zero. The floor depends on the state: it vanishes for |+x⟩ only because ⟨S_z⟩ = 0 there."
- **Reveal F:** "No: compatibility means [A,B] = 0 as operators. The bound ¼|⟨[A,B]⟩|² is state-dependent and vanishes whenever ⟨S_z⟩ = 0, as the notes remark."
- **Reveal cap:** G/F "|+x⟩: ΔS_x·ΔS_y = 0 and ½|⟨S_z⟩| = 0"
- **Stage:** question `bloch{ state:'+x', readouts:['spreads'] }`; reveal `bloch{ state:'+x', readouts:['spreads','bound'] }`.
- **Claims:** `q3RobX` → 0, 0 · `q3CommXY` → true.

**Beat count:** 5 + 4 + 6 + 6 + 6 + 7 = **34 beats**, 6 of them clues with reveals. Phase mix: 26 [L] · 2 [B] · 6 [C];
within every unit the order is L → B → C.

## 2. Derivations

**D1 · `q3-born:b2` · result p_M = ⟨ψ|P_M|ψ⟩**
- Ground:
  1. `p_M = |\langle M|\psi\rangle|^2` — The Born rule of Unit 1.3: a chance is an amplitude's size squared.
  2. `|z|^2 = z^*z` — For any complex number, the size squared is the number times its mirror image (Chapter F1).
  3. `\langle M|\psi\rangle^* = \langle\psi|M\rangle` — Swapping the two sides of an inner product conjugates it (Unit 1.5).
  4. `p_M = \langle\psi|M\rangle\langle M|\psi\rangle` — Steps 2 and 3 with z = ⟨M|ψ⟩.
  5. `P_M = |M\rangle\langle M|` — Group the middle ket and bra as one operator, an outer product (Unit 2.4).
  6. `p_M = \langle\psi|P_M|\psi\rangle` — So the chance is P_M sandwiched in the state.
- Formal:
  1. `p_M = |\langle M|\psi\rangle|^2 = \langle\psi|M\rangle\langle M|\psi\rangle` — Conjugate symmetry.
  2. `p_M = \langle\psi|P_M|\psi\rangle` — With P_M = |M⟩⟨M| (notes p. 11).
- Check: ψ, M = +x → 0.933 both ways (`q3Born`).

**D2 · `q3-spectral:b2` · result a₁ = a₁\*, a real eigenvalue** (the notes' proof, p. 15)
- Ground:
  1. `A|a_1\rangle = a_1|a_1\rangle,\quad A^\dagger = A` — An eigenvector of a Hermitian operator.
  2. `\langle a_1|A|a_1\rangle = a_1\langle a_1|a_1\rangle` — Let A act on the ket; the number a₁ comes out of the ket side unchanged.
  3. `\langle a_1|A|a_1\rangle = \langle a_1|A^\dagger|a_1\rangle` — A and A† are the same operator.
  4. `\langle a_1|A^\dagger|a_1\rangle = \langle Aa_1|a_1\rangle` — That is what the adjoint means: A† on the right is A inside the bra (Unit 3.4).
  5. `\langle Aa_1|a_1\rangle = \langle a_1|Aa_1\rangle^*` — Swapping the two sides conjugates (Unit 1.5).
  6. `\langle a_1|Aa_1\rangle^* = a_1^*\langle a_1|a_1\rangle` — Take a₁ out, then conjugate; ⟨a₁|a₁⟩ is real, so it is unchanged.
  7. `a_1\langle a_1|a_1\rangle = a_1^*\langle a_1|a_1\rangle` — Steps 2 to 6 are one chain of equal numbers.
  8. `a_1 = a_1^*` — ⟨a₁|a₁⟩ is a squared length, not zero for an eigenvector, so we may divide by it.
- Formal:
  1. `a_1\langle a_1|a_1\rangle = \langle a_1|A^\dagger|a_1\rangle = \langle Aa_1|a_1\rangle = a_1^*\langle a_1|a_1\rangle` — A = A†, the definition of A†, conjugate symmetry.
  2. `a_1 = a_1^*` — ⟨a₁|a₁⟩ > 0.
- Check: M's eigenvalues −4, 2 (`q3MVals`); J, not Hermitian, has ±i (`q3JEig`).

**D3 · `q3-observables:b3` · result ⟨S⃗⟩ = (ħ/2)n̂ for |+n⟩**
- Ground:
  1. `\alpha = \cos\tfrac\theta2,\quad \beta = e^{i\varphi}\sin\tfrac\theta2` — The two amplitudes of |+n⟩ (Unit 3.2).
  2. `\langle S_z\rangle = \tfrac\hbar2\big(|\alpha|^2 - |\beta|^2\big)` — Each reading ±ħ/2 times its chance, added (b2).
  3. `\cos^2\tfrac\theta2 - \sin^2\tfrac\theta2 = \cos\theta` — The double-angle rule for cosine.
  4. `\langle S_z\rangle = \tfrac\hbar2\cos\theta` — Steps 2 and 3.
  5. `\langle S_x\rangle + i\langle S_y\rangle = \hbar\,\alpha^*\beta` — Sandwich the tables of S_x and S_y (Unit 3.3) and add, the second times i.
  6. `\hbar\,\alpha^*\beta = \tfrac\hbar2\sin\theta\,e^{i\varphi}` — α is real, and 2 sin(θ/2)cos(θ/2) = sin θ.
  7. `\langle S_x\rangle = \tfrac\hbar2\sin\theta\cos\varphi,\quad \langle S_y\rangle = \tfrac\hbar2\sin\theta\sin\varphi` — The real and imaginary parts of e^{iφ} (Chapter F1).
  8. `\langle\vec S\rangle = \tfrac\hbar2\,\hat n` — Compare with n̂ = (sin θ cos φ, sin θ sin φ, cos θ).
- Formal:
  1. `\langle\sigma_z\rangle = \cos\theta,\quad \langle\sigma_x\rangle + i\langle\sigma_y\rangle = 2\alpha^*\beta = \sin\theta\,e^{i\varphi}` — Direct sandwiches with Eqs. 1.4 and 1.6.
  2. `\langle\vec S\rangle = \tfrac\hbar2\,\hat n` — S⃗ = (ħ/2)σ⃗.
- Check: (0.306, 0.306, 0.25)ħ (`q3AvgS`).

**D4 · `q3-spectral:b5` · result (ΔS_i)² = (ħ²/4)(1 − n_i²)**
- Ground:
  1. `(\Delta A)^2 = \langle A^2\rangle - \langle A\rangle^2` — The dispersion: the average square minus the squared average.
  2. `S_i^2 = \tfrac{\hbar^2}4\,I` — Both readings of S_i square to ħ²/4, so the squared table is ħ²/4 times I.
  3. `\langle S_i^2\rangle = \tfrac{\hbar^2}4` — In a state of length 1, the average of I is 1.
  4. `\langle S_i\rangle = \tfrac\hbar2\,n_i` — From D3.
  5. `(\Delta S_i)^2 = \tfrac{\hbar^2}4 - \tfrac{\hbar^2}4\,n_i^2` — Put steps 3 and 4 into step 1.
  6. `(\Delta S_i)^2 = \tfrac{\hbar^2}4\,(1 - n_i^2)` — Take out the common factor.
- Formal:
  1. `\sigma_i^2 = I \Rightarrow \langle S_i^2\rangle = \tfrac{\hbar^2}4` — Eq. 1.8 with i = j.
  2. `(\Delta S_i)^2 = \tfrac{\hbar^2}4\,(1 - n_i^2)` — With D3.
- Check: (0.15625, 0.15625, 0.1875)ħ² (`q3Var`).

**D5 · `q3-uncertainty:b4` · result ⟨(ΔA)²⟩⟨(ΔB)²⟩ ≥ ¼|⟨[A, B]⟩|²** (the notes' proof, p. 17)
- Ground:
  1. `|a\rangle = \Delta A|\psi\rangle,\quad |b\rangle = \Delta B|\psi\rangle` — Two vectors built from the shifted operators of b3.
  2. `\langle a|a\rangle = \langle(\Delta A)^2\rangle,\quad \langle b|b\rangle = \langle(\Delta B)^2\rangle` — ΔA is Hermitian, so the bra of |a⟩ is ⟨ψ|ΔA, and its squared length is the dispersion.
  3. `\langle(\Delta A)^2\rangle\langle(\Delta B)^2\rangle \ge |\langle\Delta A\,\Delta B\rangle|^2` — The Schwarz inequality, with ⟨a|b⟩ = ⟨ψ|ΔAΔB|ψ⟩.
  4. `\Delta A\,\Delta B = \tfrac12[\Delta A, \Delta B] + \tfrac12\{\Delta A, \Delta B\}` — Any product is half its commutator plus half its anticommutator.
  5. `[\Delta A, \Delta B] = [A, B]` — The shifts are multiples of I, and I commutes with everything.
  6. `\langle[A,B]\rangle\ \text{imaginary},\quad \langle\{\Delta A, \Delta B\}\rangle\ \text{real}` — For Hermitian A and B, the commutator is anti-Hermitian and the anticommutator Hermitian.
  7. `|\langle\Delta A\,\Delta B\rangle|^2 = \tfrac14|\langle[A,B]\rangle|^2 + \tfrac14\langle\{\Delta A,\Delta B\}\rangle^2` — A size squared is the real part squared plus the imaginary part squared.
  8. `|\langle\Delta A\,\Delta B\rangle|^2 \ge \tfrac14|\langle[A,B]\rangle|^2` — Dropping a square, never negative, can only make the right side smaller.
  9. `\langle(\Delta A)^2\rangle\langle(\Delta B)^2\rangle \ge \tfrac14|\langle[A,B]\rangle|^2` — Chain steps 3 and 8.
- Formal:
  1. `\langle(\Delta A)^2\rangle\langle(\Delta B)^2\rangle \ge |\langle\Delta A\,\Delta B\rangle|^2` — Schwarz with |a⟩ = ΔA|ψ⟩, |b⟩ = ΔB|ψ⟩.
  2. `\langle\Delta A\,\Delta B\rangle = \tfrac12\langle[A,B]\rangle + \tfrac12\langle\{\Delta A,\Delta B\}\rangle` — Its first term is imaginary and its second real.
  3. `\langle(\Delta A)^2\rangle\langle(\Delta B)^2\rangle \ge \tfrac14|\langle[A,B]\rangle|^2` — Keep only the imaginary part.
- Check: |+n⟩: 0.024414 = 0.015625 + 0.008789 (`q3Rob`, `q3Cov2`; the Schrödinger form is an equality for pure spin-½ states).

## 3. Try-it widget per unit

| Unit | Widget spec | Why this one |
|---|---|---|
| `q3-born` | `{kind:'projector', props:{state:30, basis:45, editableBasis:true}}` | ψ's shadows on \|±x⟩: 0.933 and 0.067; a chance is a squared shadow, ⟨ψ\|P\|ψ⟩. |
| `q3-bloch` | `{kind:'bloch', props:{theta:60, phi:45, editable:true, landmarks:true, measure:'z'}}` | Two angles place every state; the landmarks are the six named states. |
| `q3-spin-operators` | `{kind:'operator-builder', props:{axis:'z'}}` | Build S_z from its projectors, then tilt the axis. |
| `q3-observables` | `{kind:'deposit-stats', props:{state:'+x', axis:'z', seed:709}}` | Single readings are ±ħ/2; their average settles near ⟨S_z⟩ = 0. |
| `q3-spectral` | `{kind:'bloch', props:{theta:60, phi:45, editable:true, measure:'x'}}` | The averages table gives (ΔS_i)² = ħ²/4 − ⟨S_i⟩². |
| `q3-uncertainty` | `{kind:'bloch', props:{theta:90, phi:0, editable:true, landmarks:true}}` | Find the states whose ΔS_xΔS_y sits on ½\|⟨S_z⟩\|. |

**Try this:**
- `q3-born`: (1) Read 0.933 and 0.067. (2) Turn the basis to 30°: one shadow is the whole arrow.
- `q3-bloch`: (1) θ = 90°: which φ gives |+y⟩? (2) Opposite points: compare the z bars.
- `q3-spin-operators`: (1) Do the projectors add to I? (2) Tilt: the matrices fill in, the checks stay ✓.
- `q3-observables`: (1) Fire 10, then 100 atoms: the average's scatter shrinks. (2) Every single reading is still ±ħ/2.
- `q3-spectral`: (1) θ = 0: which spread is zero? (2) θ = 90°: what is (ΔS_z)²?
- `q3-uncertainty`: (1) Stay on the x–z circle (φ = 0): is the product on the floor? (2) Move to φ = 45°.

## 4. Challenges per unit

Tolerance 0.005 unless stated. Hints climb nudge → key idea → setup. **Homework:** every assigned item is submitted;
none is open (`homework-status.md`).

### `q3-born`
1. **warm-up · numeric · `q3-b-overlap`** — "What is |⟨+x|+z⟩|²?"
   - Answer: **0.5** = `q3Pzx`. Hints: (1) ⟨+x| = (1, 1)/√2. (2) ⟨+x|+z⟩ = 1/√2. (3) Square it.
   - Walkthrough: ½, the notes' example.
2. **core · numeric · `q3-b-sandwich`** — "ψ = (0.6, 0.8). What is ⟨ψ|P_{+x}|ψ⟩?"
   - Answer: **0.98** = `sandwich(projector(+x), vec(0.6, 0.8)).re`. Hints: (1) It equals |⟨+x|ψ⟩|². (2) ⟨+x|ψ⟩ = 1.4/√2. (3) 1.96/2.
   - Walkthrough: 0.98.
3. **core · numeric · `q3-b-phase`** — "ψ = (0.6, 0.8i). What is ⟨ψ|P_{−x}|ψ⟩?"
   - Answer: **0.5** = `sandwich(projector(−x), vec(0.6, c(0, 0.8))).re`. Hints: (1) ⟨−x|ψ⟩ = (0.6 − 0.8i)/√2. (2) Size squared, not square. (3) (0.36 + 0.64)/2.
   - Walkthrough: ½: a quarter-turn phase gives 50/50 along x.
4. **stretch · numeric · `q3-b-missing`** — "Keep only P_{+x} of the x basis. What is ⟨ψ|P_{+x}|ψ⟩ for ψ = (0.866, 0.5)?"
   - Answer: **0.933** = `q3Born[0]`. Hints: (1) One projector alone. (2) It is below 1. (3) The rest belongs to P_{−x}.
   - Walkthrough: 0.933; with P_{−x} (0.067) the total is 1: completeness.

### `q3-bloch`
1. **warm-up · numeric · `q3-s-theta`** — "Which polar angle θ, in degrees, gives P(+z) = 0.75?"
   - Answer: **60** = `acos(2·0.75 − 1)` in degrees. Hints: (1) P(+z) = cos²(θ/2). (2) cos(θ/2) = 0.866. (3) θ/2 = 30°.
   - Walkthrough: 60°.
2. **core · numeric · `q3-s-nx`** — "For θ = 90°, φ = 60°, what is n_x?"
   - Answer: **0.5** = `blochVector(ketFromBloch(π/2, π/3))[0]`. Hints: (1) n_x = sin θ cos φ. (2) sin 90° = 1. (3) cos 60°.
   - Walkthrough: 0.5.
3. **core · numeric · `q3-s-minus`** — "For θ = 60°, φ = 0, what is the |+z⟩ amplitude of |−n⟩?"
   - Answer: **0.5** = `ketFromBloch(2π/3, π)[0].re`. Hints: (1) Eq. 1.5. (2) It is sin(θ/2). (3) sin 30°.
   - Walkthrough: |−n⟩ = (0.5, −0.866).
4. **stretch · numeric · `q3-s-120`** — "For θ = 120°, φ = 0, what is |⟨+z|+n⟩|²?"
   - Answer: **0.25** = `prob(+z, ketFromBloch(2π/3, 0))`. Hints: (1) cos²(θ/2). (2) θ/2 = 60°. (3) 0.5².
   - Walkthrough: ¼: below the equator, down is more likely.

### `q3-spin-operators`
1. **warm-up · numeric · `q3-o-pz`** — "Apply P_{+z} to (0.6, 0.8). How long is the result?"
   - Answer: **0.6** = `norm(apply(projector(+z), vec(0.6, 0.8)))`. Hints: (1) P_{+z} keeps the first entry. (2) (0.6, 0). (3) Its length.
   - Walkthrough: 0.6; squared, the chance 0.36.
2. **core · numeric · `q3-o-sigman`** — "For θ = 60°, what is the top-left entry of σ_n?"
   - Answer: **0.5** = `nDotSigma(n̂(60°, 0))[0][0].re`. Hints: (1) Eq. 1.7. (2) It is cos θ. (3) cos 60°.
   - Walkthrough: 0.5.
3. **core · choice · `q3-o-sy`** — "Which table is σ_y?"
   - Options: **[[0, −i], [i, 0]]** ✓ · [[0, i], [i, 0]] · [[0, 1], [−1, 0]] · [[0, i], [−i, 0]].
   - Check: `matEq(SIGMA_Y, …)`. Hints: (1) It must be Hermitian. (2) Its eigenvectors are |±y⟩. (3) Apply it to (1, i).
   - Walkthrough: [[0, −i], [i, 0]] sends (1, i) to (1, i).
4. **stretch · numeric · `q3-o-px`** — "What is the top-right entry of P_{+x} in the z basis?"
   - Answer: **0.5** = `projector(+x)[0][1].re`. Hints: (1) |+x⟩⟨+x|. (2) (1/√2)(1/√2). (3) Every entry is ½.
   - Walkthrough: ½; P_{+z} in the x basis has the same entries (clue b6).

### `q3-observables`
1. **warm-up · numeric · `q3-m-avg`** — "Readings +ħ/2 with chance 0.9 and −ħ/2 with 0.1. What is ⟨S_z⟩, in units of ħ?"
   - Answer: **0.4** = `expectation(SZ, vec(√0.9, √0.1))`. Hints: (1) Value times chance, added. (2) 0.5 × 0.9 − 0.5 × 0.1. (3) 0.45 − 0.05.
   - Walkthrough: 0.4ħ.
2. **core · numeric · `q3-m-sx`** — "For |+n⟩ (θ = 60°, φ = 45°), what is ⟨S_x⟩ in units of ħ?"
   - Answer: **0.3062** = `q3AvgS[0]`. Hints: (1) ⟨S_x⟩ = (ħ/2)n_x. (2) n_x = sin 60° cos 45°. (3) 0.5 × 0.612.
   - Walkthrough: 0.306ħ (D3).
3. **core · choice · `q3-m-adjoint`** — "What is (AB)†?"
   - Options: A†B† · **B†A†** ✓ · (BA)* · A*B*.
   - Check: `q3AdjProd` → true, false. Hints: (1) Take the adjoint of A(B|α⟩). (2) The bra of B|α⟩ is ⟨α|B†. (3) Then A acts inside.
   - Walkthrough: ⟨α|(AB)† = ⟨α|B†A†.
4. **stretch · choice · `q3-m-hermitian`** — "Which table can be an observable?"
   - Options: **[[1, 2 − i], [2 + i, −3]]** ✓ · [[0, 1], [0, 0]] · [[0, −1], [1, 0]] · [[1, i], [i, 1]].
   - Check: `q3HermOpts` → true, false, false, false. Hints: (1) Mirror and conjugate. (2) The corners must be conjugates. (3) i and i are not.
   - Walkthrough: only the first equals its adjoint.

### `q3-spectral`
1. **warm-up · numeric · `q3-e-eig`** — "What is the larger eigenvalue of [[1, 2 − i], [2 + i, −3]]?"
   - Answer: **2** = `max(eigh(M).values)`. Hints: (1) det(M − aI) = 0. (2) a² + 2a − 8 = 0. (3) Factor.
   - Walkthrough: (a − 2)(a + 4) = 0.
2. **core · numeric · `q3-e-disp`** — "For |+n⟩ at θ = 60°, what is (ΔS_z)² in units of ħ²?"
   - Answer: **0.1875** = `varianceN(|+n⟩, SZ)`. Hints: (1) ⟨S_z²⟩ = ħ²/4. (2) ⟨S_z⟩ = 0.25ħ. (3) 0.25 − 0.0625.
   - Walkthrough: 0.1875ħ² (D4).
3. **core · numeric · `q3-e-f`** — "With f(a) = a², what is the top-left entry of f(S_z), in units of ħ²?"
   - Answer: **0.25** = `funcHermitian(SZ, a ↦ a²)[0][0].re`. Hints: (1) f acts on the eigenvalues. (2) (±½)² = ¼. (3) Both entries equal.
   - Walkthrough: S_z² = (ħ²/4)I.
4. **stretch · numeric · `q3-e-spread-x`** — "For |+n⟩ (θ = 60°, φ = 45°), what is (ΔS_x)² in units of ħ²?"
   - Answer: **0.15625** = `q3Var[0]`. Hints: (1) (ħ²/4)(1 − n_x²). (2) n_x = 0.612. (3) n_x² = 0.375.
   - Walkthrough: 0.25 × 0.625 = 0.15625.

### `q3-uncertainty`
1. **warm-up · numeric · `q3-u-comm`** — "For |+z⟩, what is the imaginary part of ⟨[S_x, S_y]⟩, in units of ħ²?"
   - Answer: **0.5** = `sandwich(commutator(SX, SY), KET['+z']).im`. Hints: (1) [S_x, S_y] = iħS_z. (2) ⟨S_z⟩ = ħ/2. (3) i × ½.
   - Walkthrough: 0.5i ħ².
2. **core · numeric · `q3-u-floor`** — "For |+n⟩ (θ = 60°, φ = 45°), what is ¼|⟨[S_x, S_y]⟩|², in units of ħ⁴?"
   - Answer: **0.015625** = `q3Rob[4]`, tolerance 5e−5. Hints: (1) ⟨[S_x, S_y]⟩ = iħ⟨S_z⟩. (2) ⟨S_z⟩ = 0.25ħ. (3) ¼ × 0.0625.
   - Walkthrough: 1/64.
3. **core · choice · `q3-u-which`** — "Which states put ΔS_xΔS_y exactly on the floor ½|⟨S_z⟩|?"
   - Options: **every state with n_x = 0 or n_y = 0** ✓ · only |±z⟩ · no state · every state.
   - Check: slack 0 for (60°, 90°) and (60°, 0°), 0.03125 for (60°, 45°) (`c_q3SatNx0`, `c_q3SatNy0`, `q3Rob`). Hints: (1) Product² = (1 − n_x²)(1 − n_y²)/16. (2) Floor² = n_z²/16. (3) Expand with n_x² + n_y² + n_z² = 1.
   - Walkthrough: the gap is n_x²n_y²/16.
4. **stretch · numeric · `q3-u-schwarz`** — "a = (1, i), b = (2, 1). What is |⟨a|b⟩|²?"
   - Answer: **5** = `abs2(inner(vec(1, I), vec(2, 1)))`. Hints: (1) Conjugate a. (2) 1 × 2 + (−i) × 1. (3) |2 − i|².
   - Walkthrough: 5 ≤ 2 × 5 = 10.
5. **stretch · order · `q3-u-steps`** — "Put the proof of Eq. 1.9 in order."
   - Steps: "Set |a⟩ = ΔA|ψ⟩ and |b⟩ = ΔB|ψ⟩." · "Schwarz: ⟨a|a⟩⟨b|b⟩ ≥ |⟨a|b⟩|²." · "Split ΔAΔB into half a commutator and half an anticommutator." · "The first part's average is imaginary, the second's real." · "Drop the real part's square."
   - Hints: (1) Name the vectors first. (2) The inequality comes before the split. (3) Dropping comes last.
   - Walkthrough: D5.

## 5. Glossary terms new in Q3

| id | Term | Ground gloss | Formal definition | First use | bridge |
|---|---|---|---|---|---|
| `qc-projector` | projector P_M | An operator that keeps only the part of a state along one arrow. | P_M = \|M⟩⟨M\|; P² = P = P†. | `q3-born:b2` | `l3-projectors` |
| `qc-polar-angle` | polar angle θ | How far a point on the sphere is tipped down from the north pole, 0° to 180°. | θ ∈ [0, π] in Eq. 1.4. | `q3-bloch:b1` | `l6-bloch` |
| `qc-azimuth` | azimuth φ | How far round from the x direction a point sits, all the way round. | φ ∈ [0, 2π), the relative phase. | `q3-bloch:b1` | `l6-equator` |
| `qc-bloch-sphere` | Bloch sphere | A sphere of radius 1 on which every spin state is exactly one point. | S² ≅ rays of ℂ², \|+n⟩ ↔ n̂. | `q3-bloch:b2` | `l6-bloch` |
| `qc-spin-operator` | spin operator S_n | The operator whose readings are ±ħ/2: the spin along one axis. | S_n = (ħ/2)(P_{+n} − P_{−n}) = (ħ/2)n̂·σ⃗. | `q3-spin-operators:b3` | `l4-matrices` |
| `qc-pauli-matrices` | Pauli matrices | Three 2×2 tables; spin along x, y or z is ħ/2 times one of them. | σ_x, σ_y, σ_z of Eq. 1.6; σ_iσ_j = δ_ijI + iε_ijkσ_k. | `q3-spin-operators:b5` | `l4-matrices` |
| `qc-selective-measurement` | selective measurement | A measurement that lets one result through and blocks every other. | A filter P_α; the kept state is P_α\|ψ⟩/‖P_α\|ψ⟩‖. | `q3-observables:b1` | `l3-postulates` |
| `qc-expectation-value` | expectation value ⟨M⟩ | The average of many readings of copies of one state. | ⟨ψ\|M\|ψ⟩ = ΣM_αP_α. | `q3-observables:b2` | `l3-spread` |
| `qc-observable` | observable | A measurable quantity; quantum physics gives it a Hermitian operator. | M = ΣM_α\|α⟩⟨α\|, M = M†. | `q3-observables:b2` | `l3-eigen` |
| `qc-adjoint` | adjoint A† | The partner of an operator that acts on bras as A acts on kets. | ⟨β\|A†\|α⟩ = ⟨α\|A\|β⟩*; (A†)_ij = A*_ji. | `q3-observables:b4` | `l3-eigen` |
| `qc-eigenvector` | eigenvector | An arrow an operator only stretches or flips, never turns. | A\|a⟩ = a\|a⟩, \|a⟩ ≠ 0. | `q3-spectral:b1` | `l3-eigen` |
| `qc-eigenvalue` | eigenvalue | The stretch factor of an eigenvector; for an observable, a possible reading. | A root of det(A − aI) = 0. | `q3-spectral:b1` | `l3-eigen` |
| `qc-characteristic-equation` | characteristic equation | The equation whose solutions are an operator's eigenvalues. | det(Â − a1) = 0. | `q3-spectral:b1` | `l4-eigen` |
| `qc-degenerate` | degenerate | Said of an eigenvalue shared by two or more independent eigenvectors. | dim ker(A − a) ≥ 2. | `q3-spectral:b1` | — |
| `qc-spectral-representation` | spectral representation | An operator written as each eigenvalue times its projector, added up. | A = Σa_i\|a_i⟩⟨a_i\|; f(A) = Σf(a_i)\|a_i⟩⟨a_i\|. | `q3-spectral:b4` | `l3-projectors` |
| `qc-dispersion` | dispersion (ΔA)² | How widely single readings scatter: the average squared distance from their average. | ⟨A²⟩ − ⟨A⟩² = ‖(A − ⟨A⟩)ψ‖². | `q3-spectral:b5` | `l3-spread` |
| `qc-commutator` | commutator [A, B] | AB − BA: how much the order of two operators matters. | [A, B] = AB − BA. | `q3-uncertainty:b1` | `l7-compatible` |
| `qc-anticommutator` | anticommutator {A, B} | AB + BA, both orders added. | {A, B} = AB + BA. | `q3-uncertainty:b1` | — |
| `qc-compatible` | compatible | Said of two quantities whose operators commute, so both can be sharp at once. | [A, B] = 0. | `q3-uncertainty:b2` | `l7-compatible` |
| `qc-simultaneous-eigenvector` | simultaneous eigenvector | A state that is an eigenvector of two operators at once. | A\|a, b⟩ = a\|a, b⟩, B\|a, b⟩ = b\|a, b⟩. | `q3-uncertainty:b2` | `l7-compatible` |
| `qc-schwarz-inequality` | Schwarz inequality | An overlap is never bigger than the two lengths allow. | \|⟨a\|b⟩\|² ≤ ⟨a\|a⟩⟨b\|b⟩. | `q3-uncertainty:b3` | — |
| `qc-uncertainty-relation` | uncertainty relation | A lower limit on the product of two spreads, set by the average of their commutator. | Eq. 1.9 (Robertson). | `q3-uncertainty:b4` | `l7-uncertainty` |

Reused: `qc-amplitude` (F1); `qc-born-rule`, `qc-hermitian-matrix` (Q1); `qc-completeness`, `qc-outer-product`,
`qc-unitary` (Q2).

## 6. Review card per unit (both tracks)

### `q3-born`
- **G points:** (1) A chance is |⟨α|β⟩|². (2) It is a projector sandwich, ⟨ψ|P|ψ⟩. (3) A basis's projectors add to I, so its chances add to 1. (4) After a result, the state is P|ψ⟩ rescaled.
- **F points:** (1) P_M = |M⟩⟨M|, P² = P. (2) Σ_iΛ_i = 1. (3) p = ‖Pψ‖²; update Pψ/√p.
- **Equations:** $p_M = |\langle M|\psi\rangle|^2 = \langle\psi|P_M|\psi\rangle,\quad \sum_i |e_i\rangle\langle e_i| = I$
- **Trap:** thinking a phase on |M⟩ changes the chance: P is unchanged.

### `q3-bloch`
- **G points:** (1) Two angles fix any spin state. (2) They name a point on a sphere of radius 1. (3) The opposite point is the state at right angles. (4) −|ψ⟩ is the same point, not the opposite one.
- **F points:** (1) Eqs. 1.4–1.5. (2) n̂ = (sin θ cos φ, sin θ sin φ, cos θ). (3) ⟨+n|−n⟩ = 0 ↔ antipodes.
- **Equations:** $|{+n}\rangle = \cos\tfrac\theta2|{+z}\rangle + e^{i\varphi}\sin\tfrac\theta2|{-z}\rangle,\quad |{-n}\rangle = \sin\tfrac\theta2|{+z}\rangle - e^{i\varphi}\cos\tfrac\theta2|{-z}\rangle$
- **Trap:** taking −|+z⟩ for the south pole: it is |+z⟩ again.

### `q3-spin-operators`
- **G points:** (1) A filter is a projector. (2) Its table depends on the basis, P² = P does not. (3) S_z = (ħ/2)(P_{+z} − P_{−z}), and so for x, y. (4) S_n = (ħ/2)σ_n.
- **F points:** (1) P̃ = UPU†. (2) Eq. 1.6, the Pauli matrices. (3) Eq. 1.7, σ_n = n̂·σ⃗.
- **Equations:** $S_z = \tfrac\hbar2(P_{+z} - P_{-z}),\quad S_i = \tfrac\hbar2\sigma_i,\quad \sigma_n = \hat n\cdot\vec\sigma$
- **Trap:** equal tables in different bases are not equal operators (P_{+z} in x vs P_{+x} in z).

### `q3-observables`
- **G points:** (1) A measurement jumps the state to the result's state. (2) The average is Σ value × chance = ⟨ψ|M|ψ⟩. (3) For |+n⟩, ⟨S⟩ = (ħ/2)n̂. (4) Real averages in every state force M = M†.
- **F points:** (1) ℳ = ΣM_α|α⟩⟨α|. (2) Adjoint rules. (3) The Hermiticity theorem needs ℂ (Axler 7.13–7.14).
- **Equations:** $\langle M\rangle = \langle\psi|M|\psi\rangle = \sum_\alpha M_\alpha P_\alpha,\quad \langle\vec S\rangle = \tfrac\hbar2\hat n,\quad (AB)^\dagger = B^\dagger A^\dagger$
- **Trap:** checking Hermiticity on real arrows only: the quarter turn passes, yet ⟨+y|J|+y⟩ = −i.

### `q3-spectral`
- **G points:** (1) Eigenvalues solve det(A − aI) = 0. (2) A Hermitian operator's eigenvalues are real. (3) Its eigenvectors make an orthonormal basis, where its table is diagonal. (4) (ΔS_i)² = (ħ²/4)(1 − n_i²).
- **F points:** (1) The notes' proof (D2). (2) A = Σa_i|a_i⟩⟨a_i|, f(A). (3) ⟨Aⁿ⟩ = Σp_ia_iⁿ.
- **Equations:** $A|a\rangle = a|a\rangle,\quad a = a^*,\quad A = \sum_i a_i|a_i\rangle\langle a_i|,\quad (\Delta A)^2 = \langle A^2\rangle - \langle A\rangle^2$
- **Trap:** diagonalizing with the wrong side of U: with Unit 2.5's U the diagonal table is UAU†.

### `q3-uncertainty`
- **G points:** (1) [A, B] measures how much order matters; [S_x, S_y] = iħS_z. (2) Commuting observables share eigenvectors. (3) Schwarz plus the commutator half gives the floor. (4) The floor depends on the state; compatibility does not.
- **F points:** (1) Eq. 1.8. (2) Diagonal in A's eigenbasis (non-degenerate case). (3) Eq. 1.9 and its equality at |+z⟩.
- **Equations:** $[S_i, S_j] = i\hbar\epsilon_{ijk}S_k,\quad \langle(\Delta A)^2\rangle\langle(\Delta B)^2\rangle \ge \tfrac14|\langle[A,B]\rangle|^2$
- **Trap:** reading 0 ≥ 0 at |+x⟩ as "compatible".

## 7. Symbol-before-use tables

Abbreviations: bo, bl, so, ob, sp, un. Carried from F1, Q1 and Q2, mapped in `Lecture.symbols` to `q3-born` as a
recap: |ψ⟩, ψ (Q2's arrow at 30°), ⟨·|, ⟨·|·⟩, |±z⟩, |±x⟩, |±y⟩, |0⟩, |1⟩, |e_i⟩, c_i, δ_ij, α, β, i, e^{iφ}, †, I, U,
H, A, A_ij, |α⟩⟨β|, ħ, ‖·‖, P (probability), [S_z, S_x] (Formal).

### 7.1 Ground track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $\vert\alpha\rangle$, $\vert\beta\rangle$, $\vert M\rangle$, $p_M$ | bo:b1–b2 | bo:b1–b2 | **FLAG** | \|α⟩, \|β⟩ are the notes' state letters; α, β stay numbers (amplitudes) elsewhere. |
| $P_M$ | bo:b2 | bo:b2 | OK | Tag `qc-projector`. |
| $\Lambda_i$ | bo:b3 | bo:b3 | OK | The notes' letter. |
| $\theta$, $\varphi$, $\vert{+n}\rangle$ | bl:b1 | bl:b1 | OK | θ polar, φ azimuth (locked). |
| $\hat n$, $n_x, n_y, n_z$ | bl:b2 | bl:b2 | OK | — |
| $\vert{-n}\rangle$ | bl:b3 | bl:b3 | OK | — |
| $P_{\pm z}$, $P_{\pm x}$ | so:b1, so:b4 | so:b1, so:b4 | OK | — |
| $S_z$, $S_x$, $S_y$ | so:b3–b4 | so:b3–b4 | OK | S_z met in Q1 as a spin value; here an operator. |
| $\sigma_x, \sigma_y, \sigma_z$, $\sigma_n$, $S_n$ | so:b5 | so:b5 | OK | — |
| $M_\alpha$, $P_\alpha$, $\langle M\rangle$ | ob:b2 | ob:b2 | OK | — |
| $\langle\vec S\rangle$ | ob:b3 | ob:b3 | OK | "the three averages together". |
| $A^\dagger$ | ob:b4 | ob:b4 | OK | † met on vectors in Q1. |
| $J$ | ob:b6 | ob:b6 | OK | The quarter turn. |
| $a$, $\vert a\rangle$, $\det$, $M$ (matrix) | sp:b1 | sp:b1 | **FLAG** | M here is a matrix; in ob:b2 it was an observable. The sp:b1 caption writes M's entries. |
| $f$, $A^n$, $(\Delta A)^2$ | sp:b4–b5 | sp:b4–b5 | OK | — |
| $[A,B]$, $\{A,B\}$ | un:b1 | un:b1 | OK | — |
| $\Delta A$ (operator) | un:b3 | un:b3 | OK | The shifted operator. |
| $\vert a\rangle$, $\vert b\rangle$, $\lambda$ (Schwarz) | un:b3 | un:b3 | **FLAG** | New meaning of \|a⟩ (not an eigenvector); the notes' letters, stated in place. |

### 7.2 Formal track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $P_{\alpha\vert\beta}$ | bo:b1 | bo:b1 | OK | The notes' symbol. |
| $\tilde P_{+z}$, $\hat U$ | so:b2 | so:b2 | OK | Û = H. |
| $\mathcal S_z$, $\mathcal P_{\pm z}$, $\mathcal M_\alpha$ | so:b3, ob:b2 | so:b3, ob:b2 | **FLAG** (minor) | The notes' calligraphic letters, once each; plain letters elsewhere. |
| $\vec\sigma$, $\hat n\cdot\vec\sigma$ | so:b5 | so:b5 | OK | — |
| $\epsilon_{ijk}$ | un:b1 | un:b1 (gloss `qc-pauli-matrices`) | gloss | The Levi-Civita symbol, named in the gloss. |
| $\mathrm{Tr}\,\rho$ | ob:b3 | Bergou citation only | **FLAG** (minor) | ρ is Q6's; the F text only names Bergou's Eq. 2.20. |
| $\ker$ | — | gloss `qc-degenerate` only | OK | — |

**Counts:** Ground 3 FLAGs, Formal 2 FLAGs, all resolved in place.

## 8. Errata

The notes' physics is right. Items were checked on the page renders (img) or in the maths (math); every `Correction` is
paraphrased, source `'notes'`.

### 8.1 Corrections (errata box, with `check()`)
| # | Where | The notes say (paraphrased) | It should say | `check` |
|---|---|---|---|---|
| N21 (new) | p. 15 (img + math) | Û†ÂÛ is diagonal, Û being the unitary change of basis. | With p. 9's Û (U_ij = ⟨α'_i\|α_j⟩, eigenbasis as the new basis), the diagonal table is ÛÂÛ†, as p. 9's own rule Â' = ÛÂÛ† gives. Û†ÂÛ is diagonal when Û's columns are the eigenvectors, i.e. for p. 9's Û†. | `isDiagonal(V.q3DiagUAUd) && !isDiagonal(V.q3DiagUdAU)` (σ_y, U from z to y) |

### 8.2 Silent fixes and notes (no box)
| # | Where | Point | Action |
|---|---|---|---|
| N6 (map) | p. 12 | "Right/left states" means \|±x⟩, not p. 9's circular R, L. | Rosetta in `q3-spin-operators:b2`. |
| — | p. 12 | P̂_{+z}\|ψ⟩ = c↑\|+z⟩ is called the reduced state. | It must be rescaled; F text of `q3-spin-operators:b1`. |
| N7 (map) | p. 14 | Measurements are represented only by Hermitian operators. | True for projective observables; Q12 generalizes (F text of `q3-observables:b5`). |
| — | p. 14 | "can be satisfied only if M = M†" | Holds over ℂ (Axler 7.13–7.14); clue `q3-observables:b6` shows why. |
| N8 (map) | p. 15 | The orthogonality proof uses a₂ real without saying so. | F text of `q3-spectral:b3`. |
| — | p. 16 | ⟨ψ\|ΔA²\|ψ⟩ appears before ΔA is defined (p. 17). | Read (ΔA)²; the app defines dispersion first as ⟨A²⟩ − ⟨A⟩². |
| — | p. 17 | λ = −⟨b\|a⟩/⟨b\|b⟩ | Needs \|b⟩ ≠ 0; if \|b⟩ = 0 the inequality is trivial. |

**Checked and correct:** the probability-amplitude definition and example (p. 11); p_M = ⟨ψ|P_M|ψ⟩; Λ_i and completeness;
Eqs. 1.4–1.5 and ⟨+n|−n⟩ = 0 (antipode verified); P̂_{±z}; P̃_{+z} = ÛP̂_{+z}Û⁻¹ = ½(1 1; 1 1); P² = P; 𝒮_z, 𝒫_{±x},
𝒮_x; |±y⟩ (the 50–50 requirement); Eq. 1.6; 𝒮_n = (ħ/2)σ̂_n and Eq. 1.7; the measurement statements; ⟨M⟩ = ΣM_αP_α;
the adjoint and its three rules; (A†)_ij = A*_ji; the eigenproblem; proof 1 (real eigenvalues); proof 2 (with N8);
spectral representation and f(A); ⟨Aⁿ⟩ = Σp_ia_iⁿ; the four commutator properties; Eq. 1.8, S² = ¾ħ² and [S_i, S²] = 0;
the compatibility theorem and its proof; simultaneous eigenvectors; the Schwarz lemma; the commutator lemma; Eq. 1.9 and
its proof; both examples (0 ≥ 0 at |+x⟩; ħ⁴/16 equality at |+z⟩). Bergou p. 80 and Eq. 2.20; N&C Box 2.4.

## 9. Engine gaps and stage-contract gaps

### 9.1 Engine
None. Existing and sufficient: `spin.ts` (`KET`, `ketFromBloch`, `blochVector`, `prob`, `projector`, `sandwich`,
`expectation`, `nDotSigma`, `spinAlong`, `spreadsFromBloch`, `samePhysicalState`, `SX`, `SY`, `SZ`, `SIGMA_*`),
`linalg.ts` (`inner`, `apply`, `matmul`, `dagger`, `commutator`, `anticommutator`, `charPoly2`, `isHermitian`, `isDiagonal`,
`normalize`, `norm`, `norm2`), `operators.ts` (`eigen2`), `qc/cmat.ts` (`eigh`, `funcHermitian`, `changeU`),
`qc/measure.ts` (`moment`, `varianceN`, `robertsonBound`, `expectationN`), `qc/gates.ts` (`H`, `I2`), `sg.ts`
(`benchTheory`). The map's `robertsonBound` and `moment` have landed.

### 9.2 Stage contract
No new fields. Checks for the builder: (a) `bloch` shows `measure` with `{thetaDeg, phiDeg}` (bl:b3, so:b5, sp:b6) and
`readouts:['bound']` with `'spreads'` (un:b4, b5, b7), both drawn in 448; screenshot them under the 709 passport.
(b) `ops` with authored complex cells (`'2-i'`) and `labels:'plain'` (sp:b1–b3), then the Pauli passport (sp:b4, un:b1–b2).
(c) The reveal of `q3-bloch:b4` goes north to south by `path:{about:'x'}`, never by a geodesic between antipodes.

### 9.3 Widget gaps
None.

## 10. Media
- **Opener:** none.
- **Film (deferred) `qc-q3-project`** "A projector is a shadow, then a stretch": ψ onto |+x⟩, then rescaled; manifest `q3ProjLen`, `q3Born`.
- **Film (deferred) `qc-q3-floor`** "The floor under two spreads": a state slides from |+n⟩ to |+z⟩; manifest `q3Rob`, `q3RobZ`, `q3SpreadsN`.
- **Decor (Higgsfield, credits need the user):** a dim lab with a single brass magnet and a frosted glass plate; no deposit, no numbers.

## 11. Hooks

### 11.1 Concept-map stations
| id | label | chapter · unit | needs | sameAs (448) |
|---|---|---|---|---|
| `qc-born-projector` | Chances as projector sandwiches | Q3 · `q3-born` | `qc-superposition`, `qc-basis` | `born-rule` |
| `qc-bloch-sphere` | The Bloch sphere: two angles per state | Q3 · `q3-bloch` | `qc-x-states`, `qc-euler` | `bloch-sphere` |
| `qc-spin-operators` | Spin operators and Pauli matrices | Q3 · `q3-spin-operators` | `qc-born-projector`, `qc-bloch-sphere`, `qc-change-of-basis` | `spin-matrices` |
| `qc-observables` | Averages and Hermitian observables | Q3 · `q3-observables` | `qc-spin-operators`, `qc-operator-matrix` | `observables` |
| `qc-spectral` | Real eigenvalues, spectral form and spread | Q3 · `q3-spectral` | `qc-observables` | `eigen-problem` |
| `qc-uncertainty` | Commutators and the uncertainty relation | Q3 · `q3-uncertainty` | `qc-spectral` | `uncertainty` |

### 11.2 Arcade (5 levels)
Label constant: `const Q3x = (unit, label) => ({ lecture: 'Q3', unit, label })`.
1. **`q3-born` · Route the beam · `qc-quarter-minus`** — "A quarter on the minus spot"
   - Level: `source:'+z'`, `target:{spot:'minus', fraction:0.25, label:'¼'}`, `maxDevices:1`, `start:{axes:['z'], keep:[]}` (gives 0).
   - Hint: "The chance of − is the squared overlap with the magnet's − state."
   - Why: a magnet tilted 60° gives P(−) = sin²30° = ¼ (`sgTilt60`); −60° works too, and the game accepts any.
   - `solution:{axes:[60], keep:[]}`.
2. **`q3-bloch` · Bloch golf · `qc-golf-antipode`** — "The opposite state"
   - `start:'+x'`, `target:'-x'`, `par:2`, `solution:[{axis:'z', sign:1}, {axis:'z', sign:1}]`.
   - Hint: "Opposite states are opposite points." Why: two quarter turns about z carry +x through +y to −x (`rotateBloch` checks).
3. **`q3-spin-operators` · Bloch golf · `qc-golf-plus-y`** — "Up to +y"
   - `start:'+z'`, `target:'+y'`, `par:1`, `solution:[{axis:'x', sign:-1}]`.
   - Hint: "Turn about the axis at right angles to both z and y." Why: R_x(−90°) carries +z to +y, the state that splits 50/50 along z and x (`golfXminusZ`).
4. **`q3-spectral` · Spot the error · `qc-diagonal-everywhere`** — "Diagonal in every basis?"
   - Steps: "S_z is diagonal in the z basis." · "In the x basis its table is US_zU†." · "A diagonal table stays diagonal in every basis." · "Its eigenvalues ±ħ/2 are the same in every basis."
   - `wrong: 2`. Why: in the x basis S_z = (ħ/2)(0 1; 1 0), off-diagonal (`q2SzInX`); only the eigenbasis makes it diagonal.
5. **`q3-uncertainty` · Spot the error · `qc-floor-not-compatible`** — "A zero floor"
   - Steps: "[S_x, S_y] = iħS_z." · "For |+x⟩, ΔS_x = 0, so the left side of Eq. 1.9 is 0." · "The right side is 0 too, since ⟨S_z⟩ = 0." · "So S_x and S_y are compatible in the state |+x⟩."
   - `wrong: 3`. Why: compatibility is [A, B] = 0 for the operators, never true here; the floor merely vanishes (`q3RobX`).

## 12. Questions for the judge

**Q1. Homework now submitted.** The map planned "⟨+n|−n⟩ stated, not worked" (HW1 P4(b)), ruling 3 framed the
`l7-spreads` bridge carefully (HW1 P1), and `qc709-nc.md` #1 made D2 hints-only (448 `l3-eig-real`).
`homework-status.md` now records all three as submitted. This plan works each in full (bl:b3, D2, D3, D4). *Recommend:*
confirm; 448's own `l3-eig-real`, `l4-g-sy` and HW1-twin challenges stay hints-only in 448, unchanged.

**Q2. N21 (Û†ÂÛ on p. 15).** p. 15 reuses p. 9's symbol Û with the opposite order, and with p. 9's Û the product Û†ÂÛ
is not diagonal (σ_y, z → y: it gives σ_x). *Recommend:* a box correction in the notes' voice, as written in §8.1; the
alternative is a silent Rosetta note that "p. 15's Û is 448's B".

**Q3. Robertson's route.** 448 L7 proves the relation through Reference A (a squared length) and only cites the Schwarz
route. Q3's D5 is the notes' Schwarz proof, so it is not a second copy of 448's derivation. *Recommend:* keep D5 in both
tracks, with the bridge to `l7-uncertainty`.

**Q4. The Born rule's owner.** Q1 owns the Born rule (`qc-born-rule`), Q2 owns completeness, and 448 owns the postulates.
Q3's first unit keeps one link-back sentence and teaches only what p. 11 adds: the projector sandwich (D1) and
P² = P. *Recommend:* confirm that this counts as "teaches only what its notes add".
