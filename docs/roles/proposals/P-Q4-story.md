# P-Q4-story — Q4 "The qubit, gates and circuits" (role P, Physics 709)

Proposal only. Nothing under `app/` is modified. Format: `P-Q3-story.md` (two tracks, bridges, the same 13 sections).
Map entry: `P-709-map.md` §3 Q4; rulings: `decisions/qc709-Q2Q3.md`, `qc709-nc.md`, `homework-status.md`. Q4 opens Part II.
No instructor notes cover it yet (only `qc709-n1`–`n3` are ingested), so Bergou is the main line and N&C fills it in.

**Sources read.**
- Bergou 2e (printed = PDF − 15): §1.1–1.3, pp. 1–5 (PDF 16–20), Eqs. 1.1–1.9, Figs. 1.1–1.4; Problems 1–5, pp. 11–12.
- N&C (printed = PDF − 28): §1.2–1.3.6, pp. 13–26: Eqs. 1.1–1.27, Figs. 1.2–1.12, Box 1.1. §1.3.7 (teleportation) is Q9's.
- Overlaps: 709 Q1 (Born rule), Q2 (`qc-hadamard` as the z → x change of basis, `qc-unitary`, the photon unit), Q3 (the
  Bloch sphere, Pauli matrices), F1 (phases; T was met in `f1-ph-pi8`). 448: `l1-vectors`, `l3-operators`,
  `l3-postulates`, `l6-bloch`, `l6-active`, `l6-generator`, `l7-full-turn`, `l2-three-bases`.
- Homework (`homework-status.md`): only 709 HW1 exists, and it is submitted. No sheet assigns Bergou's Chapter 1 problems
  or N&C §1.2–1.3. Bergou P1.1, P1.4(a) and P1.4(b) are used below with the ⚑ mark (`qc709-nc.md` standing rule).

**Evidence.** Every number was computed twice: by the app's engine (`q45plan-engine.ts`, bundled with rolldown; read-only
imports of `physics/{complex,linalg,spin}.ts` and `physics/qc/{cmat,gates,state,circuit,measure,bits}.ts`) and by an
independent numpy script (`q45plan-numpy.py`: explicit matrices, `np.kron`, qubit 0 most significant). They agree on all
515 numbers (202 keys, both chapters) to 2 × 10⁻⁶. **The engine run found a defect (E1, §9.1):** a one-qubit
`runCircuit` corrupts the shared `KET` constants. The helper works round it with a fresh `psi0`.

**Conventions** (stated once, in `q4-qubit:b1` and `q4-registers:b1`, and in the passports).
- |0⟩ ≡ |+z⟩ (north pole), |1⟩ ≡ |−z⟩. H = (X + Z)/√2. Qubit 0 is the leftmost label, the top wire and the most
  significant bit: |10⟩ is bar 2 of 4.
- **ψ** = Q3's running state (0.866, 0.5) = `ketFromBloch(π/3, 0)` = R_y(60°)|0⟩: θ = 60°, φ = 0 on the sphere. In a
  circuit it is prepared by the gate `g(Ry, 0, π/3)`, drawn "R_y(60°)" (defined in `q4-one-qubit-gates:b6`).
- **χ** is a gate angle (P(χ), R_z(χ)). φ stays the azimuth, as locked in Q3.
- Claim keys are camelCase `q4…` in `Q4.values.ts`, as `Q3.values.ts`. Structural facts use `yes()` (1/0).
- Tracks, phases, captions, claims and bridges as `P-Q3-story.md`. Phase tags: **[L]** is the main line (Bergou's order,
  with N&C where Bergou is silent), **[B]** an N&C aside, **[C]** a clue. See §12 Q1 for the `phase` value.
- Stage shorthand: `bloch{…}` = `{kind:'bloch', shot:'B-STD', …}` (709 poles); `amp{…}` = `{kind:'amplitudes',
  shot:'A-BARS', labels:'bits', …}`; `circ{…}` = `{kind:'circuit', shot:'Q-WIRES', …}`; `split(A / B)` =
  `{layout:'split', top:A, bottom:B}`, where "`/ amp{same}`" reads the same `circuit`, `upTo` and `outcomes` as `circ`.
- Circuit shorthand in `{version:1, qubits, init, columns}`: `g(G, q)` = `{op:'gate', gate:G, targets:[q]}`, `g(G, q, χ)`
  adds `params:[χ]` (radians); `cx(c, t)` adds `controls:[c]` to an X; `m(q, b)` = `{op:'measure', qubit:q, bit:b}`.

| Name | qubits · init | columns |
|---|---|---|
| `C_X`, `C_H`, `C_HH`, `C_HZ`, `C_PSIH` | 1 · `'0'` | `[g(X,0)]`; `[g(H,0)]`; `[g(H,0)] [g(H,0)]`; `[g(H,0)] [g(Z,0)]`; `[g(Ry,0,π/3)] [g(H,0)] [m(0,0)]` |
| `C_PROD` | 2 · `'00'` | `[g(Ry,0,π/3), g(H,1)]` |
| `C_PRODM` | 2 · `'00'` | `C_PROD`'s column, then `[m(0,0), m(1,1)]` |
| `C_H3` | 3 · `'000'` | `[g(H,0), g(H,1), g(H,2)]` |
| `C_CX10` | 2 · `'10'` | `[cx(0,1)]` |
| `C_CZH` | 2 · `'++'` | `[g(H,1)] [cx(0,1)] [g(H,1)]` |
| `C_COPY` | 2 · `'00'` | `[g(Ry,0,π/3)] [cx(0,1)]`; `C_COPYM` adds `[m(0,0)]` |
| `C_BELL` | 2 · `'00'` | `[g(H,0)] [cx(0,1)]`; `C_BELLM` adds `[m(0,0), m(1,1)]` |
| `C_SWAP3` | 2 · `'10'` | `[cx(0,1)] [cx(1,0)] [cx(0,1)]` |
| `C_HHCX` | 2 · `'01'` | `[g(H,0), g(H,1)] [cx(0,1)] [g(H,0), g(H,1)]` |
| `C_M2` | 2 · `'00'` | `[g(Ry,0,π/3)] [cx(0,1)] [g(H,1)] [m(0,0)]` |

- **Rosetta lines:** `q4-qubit:b1` cap F (|0⟩, |1⟩); `q4-registers:b1` cap F (qubit numbering); `q4-circuits:b2` F (Φ⁺,
  N&C: β₀₀; Bergou: Ψ₊, ruling `qc709-nc.md` #3); `q4-one-qubit-gates:b6` F (T, N&C: π/8 gate).

## 0. Chapter map

Q4 answers the map's question: **"If a bit is a light switch, what is a qubit, and what does a 'gate' do to it?"**

| # | id | Title (≤ 8 words) | Driving question | Sources | 448 bridges | Link-backs |
|---|---|---|---|---|---|---|
| 1 | `q4-qubit` | From a bit to a qubit | What can a qubit hold that a bit cannot, and what does reading it give? | Bergou §1.1 pp. 1–2, Eqs. 1.1–1.2; N&C §1.2 pp. 13–16, Eqs. 1.1–1.4, Figs. 1.2–1.3 | `l1-vectors`, `l3-postulates`, `l6-bloch` | Units 1.3 (Born rule), 3.2 (sphere); F1 (phase) |
| 2 | `q4-one-qubit-gates` | One-qubit gates turn the sphere | What does a gate do to one qubit, and why must it be unitary? | Bergou §1.2 pp. 3–4, Eqs. 1.5–1.8, Figs. 1.2–1.3; N&C §1.3.1 pp. 17–20, Eqs. 1.8–1.17, Fig. 1.4, Box 1.1 | `l6-active`, `l6-generator`, `l7-full-turn` | Units 2.5 (U, H), 3.3 (Pauli) |
| 3 | `q4-registers` | Registers: 2ⁿ amplitudes for n qubits | How do several qubits make one state, and how many numbers does it take? | Bergou §1.1 p. 2, Eqs. 1.3–1.4; N&C §1.2.1 pp. 16–17, Eq. 1.5 | `l2-vector-space` | Unit 1.4 (vector space) |
| 4 | `q4-cnot` | CNOT: flip the target when the control is 1 | How does a two-qubit gate act, and why can no gate lose information? | Bergou §1.2 pp. 3–4, Eq. 1.9, Fig. 1.4, ⚑ P1.1, P1.4(b); N&C §1.3.2 pp. 20–22, Eq. 1.18, Figs. 1.6, 1.8; §1.3.5 pp. 24–25 | `l3-operators` | Units 2.4 (tables), 4.2 |
| 5 | `q4-circuits` | Circuits: wires are time, products run backwards | How do you read a circuit, and what can a few gates build? | Bergou §1.3 pp. 4–5, ⚑ P1.4(a); N&C §1.3.4 pp. 22–24, Eq. 1.20, Figs. 1.7–1.10; §1.3.6 pp. 25–26, Eqs. 1.23–1.27, Fig. 1.12 | `l3-operators` | Units 4.2, 4.4 |
| 6 | `q4-measure` | Reading a register, whole or one qubit | What does reading one qubit of two leave in the other? | N&C §1.2.1 pp. 16–17, Eq. 1.6; §1.3.3 p. 22, Eq. 1.19; §1.3.4 p. 24, Fig. 1.10; §1.3.5 p. 25 | `l3-postulates`, `l2-three-bases` | Units 3.1 (state after a result), 4.4 |

**Outcomes** (Ground wording):
- Write a qubit as α|0⟩ + β|1⟩, read its chances, and place it on the sphere.
- Apply X, Z, H and phase gates as tables and as turns of the sphere.
- Build a two-qubit state by multiplying amplitudes, and count the 2ⁿ amplitudes of n qubits.
- Use CNOT's truth table and matrix, and say why every gate is reversible.
- Read a circuit left to right, multiply its matrices right to left, and build a Bell pair and a SWAP.
- Read all or one of a register's qubits, and find the state left behind.

**Prerequisites** (concepts): Q1 `qc-superposition`; Q2 `qc-operator-matrix`, `qc-change-of-basis`, `qc-x-states`; Q3
`qc-born-projector`, `qc-bloch-sphere`, `qc-spin-operators`; F1 `qc-euler`, `qc-phase`. 448 twins: `bloch-sphere`,
`spin-matrices`. Taught inline because F6 and F7 are not built: the product of two 2-vectors (`q4-registers:b2`) and
XOR (`q4-cnot:b2`).

**Openers and films.** The Part II opener and two films are planned in §10; all are deferred under the usage cap.

## 1. Story beats per unit

Stage kinds: `amplitudes` (all units), `circuit` (units 2–6), `bloch` (units 1–2). No new kinds or fields. Fidelity
items used: `qc-amp-engine`, `qc-amp-zero-is-up`, `qc-amp-hue-is-phase`, `qc-amp-bars-not-places`,
`qc-circuit-engine-state`, `qc-circuit-wires-are-time`, 448's `bloch-not-lab-space`.

### Unit `q4-qubit` — From a bit to a qubit

**`q4-qubit:b1` [L]** (bit and qubit; Bergou Eq. 1.1)
- **G:** "A bit is 0 or 1, like a switch that is off or on. A [[qc-qubit|qubit]] is a two-level system whose states |0⟩ and |1⟩ play the parts of 0 and 1. It can also be in a superposition α|0⟩ + β|1⟩, as in Unit 1.3. In this course |0⟩ is |+z⟩ and |1⟩ is |−z⟩."
- **F:** "|ψ⟩ = α|0⟩ + β|1⟩, a unit vector of ℂ² (Bergou Eq. 1.1, p. 1; N&C Eq. 1.1, p. 13); {|0⟩, |1⟩} is the [[qc-computational-basis|computational basis]]. Lock: |0⟩ ≡ |+z⟩, |1⟩ ≡ |−z⟩ <<qc-l1-vectors|states are vectors>>."
- **Cap:** G "ψ = 0.866|0⟩ + 0.5|1⟩: two bars" · F "Rosetta: Bergou's and N&C's |0⟩, |1⟩ are our |+z⟩, |−z⟩"
- **Stage:** `amp{ state:{dir:{thetaDeg:60, phiDeg:0}}, labels:'spin', dials:true }`; flag `qc-amp-zero-is-up`.
- **Claims:** `q4Psi` — `ketFromBloch(π/3, 0)` → (0.866, 0.5).
- **Bridge (G):** "<<qc-l1-vectors|states are vectors>> first drew spin states as arrows."

**`q4-qubit:b2` [L]** (reading a qubit)
- **G:** "You cannot read α and β off a qubit. Reading it gives 0 with chance |α|² or 1 with chance |β|², the Born rule of Unit 1.3. Afterwards the qubit is |0⟩ or |1⟩, whichever was read. For ψ the chances are 0.75 and 0.25."
- **F:** "A computational-basis measurement returns 0 w.p. |α|² and 1 w.p. |β|², leaving |0⟩ or |1⟩ (N&C pp. 13, 15) <<qc-l3-postulates|the Born rule and the state after a measurement>>. Normalization, |α|² + |β|² = 1, is the chances adding to 1."
- **Cap:** G/F "ψ read: 0 with chance 0.75, 1 with chance 0.25"
- **Stage:** `amp{ state:{dir:{thetaDeg:60, phiDeg:0}}, mode:'probability' }`.
- **Claims:** `q4P` — `probs(ψ)` → 0.75, 0.25.

**`q4-qubit:b3` [L]** (the sphere again; Bergou Eq. 1.2)
- **G:** "Unit 3.2 put every spin state on a sphere with two angles. Bergou does the same for a qubit, with |0⟩ at the north pole and |1⟩ at the south. ψ sits at θ = 60°, φ = 0. A phase in front of the whole state does not move the point."
- **F:** "Bergou Eq. 1.2 (p. 2) and N&C Eq. 1.4 (p. 15) are Unit 3.2's |θ, φ⟩. N&C Eq. 1.3 keeps a factor e^{iγ} in front; it changes no chance, so it is dropped (Chapter F1) <<qc-l6-bloch|three averages make a point>>."
- **Cap:** G "ψ on the sphere: (0.866, 0, 0.5)" · F "e^{iγ}ψ, γ swept to 90°: the point stays"
- **Stage:** `bloch{ state:{thetaDeg:60, phiDeg:0}, globalPhaseDeg:{from:0, to:90} }`; flag `bloch-not-lab-space`.
- **Claims:** `q4PsiVec` — `blochVector(ψ)` → (0.866, 0, 0.5) · `q4PhaseSame` — `samePhysicalState(iψ, ψ)` → true.

**`q4-qubit:b4` [B]** (qubits in the lab; N&C Fig. 1.2)
- **G:** "Any two-level system can hold a qubit. Bergou names electron and nuclear spins and a photon's polarization. Nielsen and Chuang add an atom's two lowest levels. A short flash of light moves the atom from |0⟩ half way to |1⟩, into |+⟩ = (|0⟩ + |1⟩)/√2."
- **F:** "Bergou §1.1 lists spins and photon polarization (Unit 2.6); N&C Fig. 1.2 (p. 14) adds two atomic levels, ground |0⟩ and excited |1⟩. A shorter pulse leaves |+⟩ ≡ (|0⟩ + |1⟩)/√2 (N&C Eq. 1.2), our |+x⟩."
- **Cap:** G/F "|+⟩ = |+x⟩: chances 0.5 and 0.5"
- **Stage:** `amp{ state:{ket:'+'}, mode:'probability' }`.
- **Claims:** `q4Plus` → (0.7071, 0.7071) · `q4PlusP` → 0.5, 0.5.

**`q4-qubit:b5` [C]** (how much does a qubit hold?)
- **Q G:** "A point on the sphere needs two angles, each with endless digits. Could one qubit store a whole book?"
- **Q F:** "θ and φ are real numbers. Can one qubit deliver unboundedly many bits?"
- **Reveal G:** "No. One reading gives one bit, 0 or 1, and leaves |0⟩ or |1⟩. The angles show up only as chances, found by reading many identical copies."
- **Reveal F:** "No: one measurement yields one bit and collapses the state; α and β are estimated only from many identically prepared copies (N&C pp. 15–16). A later chapter makes the limit exact."
- **Reveal cap:** G/F "ψ read many times: 0.75 and 0.25"
- **Stage:** question `bloch{ state:{thetaDeg:60, phiDeg:0} }`; reveal `amp{ state:{dir:{thetaDeg:60, phiDeg:0}}, mode:'probability' }`.
- **Claims:** `q4P` → 0.75, 0.25.

### Unit `q4-one-qubit-gates` — One-qubit gates turn the sphere

**`q4-one-qubit-gates:b1` [L]** (NOT is X; D1)
- **G:** "A [[qc-gate|gate]] changes a qubit's state. The quantum NOT swaps |0⟩ and |1⟩. Being linear, it turns α|0⟩ + β|1⟩ into α|1⟩ + β|0⟩. As a table acting on the column (α, β) it is X = [[0, 1], [1, 0]], Unit 3.3's σ_x."
- **F:** "NOT: α|0⟩ + β|1⟩ ↦ α|1⟩ + β|0⟩ (Bergou Eq. 1.5); on the column (α, β)ᵀ (Eq. 1.6) it is X = σ_x (Eq. 1.7, p. 3; N&C Eqs. 1.10–1.12). Its columns are X|0⟩ and X|1⟩ (D1)."
- **Cap:** G "Xψ = (0.5, 0.866): the chances swap to 0.25 and 0.75" · F "X|0⟩ = |1⟩"
- **Stage:** `split( circ{ circuit:C_X, upTo:{from:0, to:1} } / amp{same} )`; flag `qc-circuit-wires-are-time`.
- **Derivation:** D1 (§2).
- **Claims:** `q4X0` → (0, 1) · `q4XPsi` → (0.5, 0.866) · `q4XP` → 0.25, 0.75.

**`q4-one-qubit-gates:b2` [L]** (gates are unitary)
- **G:** "Every gate is [[qc-unitary|unitary]], as in Unit 2.5: U†U = I. That keeps the chances adding to 1, and U† undoes the gate. So no gate loses information: the output always tells you the input."
- **F:** "Gates are unitary because they are time evolutions (Bergou p. 3); U†U = I is exactly what preserves |α|² + |β|² = 1 for every input, and every unitary is a legal gate (N&C p. 18). X†X = I."
- **Cap:** G/F "X†X = I: X undoes itself"
- **Stage:** as b1, `upTo:1`.
- **Claims:** `q4XUnitary` → true.

**`q4-one-qubit-gates:b3` [L]** (Z, and gates as turns)
- **G:** "The Z gate, [[1, 0], [0, −1]], keeps |0⟩ and flips the sign of |1⟩. Zψ still reads 0.75 and 0.25. On the sphere Z turns the point half way round the z axis, to φ = 180°. X is likewise a half turn about x."
- **F:** "Z = σ_z (N&C Eq. 1.13, p. 19). One-qubit gates act on the sphere as rotations (p. 19): with R_n(χ) = e^{−iχn̂·σ⃗/2}, X = iR_x(π) and Z = iR_z(π) <<qc-l6-generator|S_z generates the turn>>. Zψ has Bloch vector (−0.866, 0, 0.5)."
- **Cap:** G "Zψ: same chances, the point turned to φ = 180°" · F "X = iR_x(π): the factor i is a global phase"
- **Stage:** `bloch{ state:{thetaDeg:60, phiDeg:0}, rotate:{axis:'z', angleDeg:{from:0, to:180}} }`.
- **Claims:** `q4ZPsi` → (0.866, −0.5) · `q4ZP` → 0.75, 0.25 · `q4ZBloch` → (−0.866, 0, 0.5) · `q4XisRx`, `q4ZRz` → true, true.

**`q4-one-qubit-gates:b4` [L]** (Hadamard; D2)
- **G:** "The [[qc-hadamard|Hadamard]] gate sends |0⟩ to |+⟩ and |1⟩ to |−⟩ = (|0⟩ − |1⟩)/√2. It turns a sure bit into an even mix, which no classical gate does. It is Unit 2.5's H, now used as a gate: H = (X + Z)/√2, and H² = I."
- **F:** "H|0⟩ = |+⟩, H|1⟩ = |−⟩ (Bergou Eq. 1.8, p. 4; N&C Eq. 1.14, p. 19), so H = (1/√2)(1 1; 1 −1) = (X + Z)/√2, Unit 2.5's z → x change of basis. H² = I (D2)."
- **Cap:** G "H|0⟩ = (0.707, 0.707): chances 0.5 and 0.5" · F "H|1⟩ = (0.707, −0.707)"
- **Stage:** `split( circ{ circuit:C_H, upTo:{from:0, to:1} } / amp{same} )`.
- **Derivation:** D2 (§2).
- **Claims:** `q4H0` → (0.7071, 0.7071) · `q4H1` → (0.7071, −0.7071) · `q4HH`, `q4HXZ` → true, true.

**`q4-one-qubit-gates:b5` [L]** (H on the sphere)
- **G:** "On the sphere H is a half turn about the axis half way between x and z. It swaps the x and z axes and flips y. So ψ, 60° from the north pole, lands 30° from it: Hψ = (0.966, 0.259)."
- **F:** "H = iR_n(π), n̂ = (x̂ + ẑ)/√2; N&C Fig. 1.4 (p. 19) gets the same map from R_y(90°) then R_x(180°): H = iR_x(π)R_y(π/2). Hψ has Bloch vector (0.5, 0, 0.866) and chances 0.933, 0.067, Unit 3.1's |⟨+x|ψ⟩|²."
- **Cap:** G "Hψ: θ from 60° to 30°" · F "H = iR_x(π)R_y(π/2) = iR_n(π)"
- **Stage:** `bloch{ state:{thetaDeg:60, phiDeg:0}, rotate:{axis:{thetaDeg:45, phiDeg:0}, angleDeg:{from:0, to:180}} }`.
- **Claims:** `q4HPsi` → (0.9659, 0.2588) · `q4HBloch` → (0.5, 0, 0.866) · `q4HP` → 0.933, 0.067 · `q4HTurn`, `q4HNC` → true, true.
- **Bridge (G):** "<<qc-l6-active|turn the state, keep the axes>>."

**`q4-one-qubit-gates:b6` [L]** (phase gates and rotations; D3)
- **G:** "R_z(χ) = [[e^{−iχ/2}, 0], [0, e^{iχ/2}]] turns the sphere by the angle χ about z. The [[qc-phase-gate|phase gate]] P(χ) = [[1, 0], [0, e^{iχ}]] makes the same turn. The two differ only by a [[qc-global-phase|global phase]], which changes no chance. S = P(90°) turns |+⟩ into |+y⟩."
- **F:** "R_z(β) = diag(e^{−iβ/2}, e^{iβ/2}) (N&C Eq. 1.16) and the real R_y(γ) (Eq. 1.15); P(χ) = e^{iχ/2}R_z(χ), so Z = P(π), S = P(π/2), T = P(π/4) (T, N&C: π/8 gate; Chapter F1). Box 1.1: U = e^{iα}R_z(β)R_y(γ)R_z(δ); R_z(2π) = −I <<qc-l7-full-turn|a full turn flips the sign>>."
- **Cap:** G "S|+⟩ = |+y⟩: a quarter turn about z" · F "T = e^{iπ/8}R_z(π/4); R_z(360°) = −I"
- **Stage:** `bloch{ state:'+x', rotate:{axis:'z', angleDeg:{from:0, to:90}} }`.
- **Derivation:** D3 (§2).
- **Claims:** `q4SPlus` → true · `q4SPlusVec` → (0, 1, 0) · `q4PRz`, `q4TRz`, `q4Rz2pi` → true, true, true.

**`q4-one-qubit-gates:b7` [C]** (two Hadamards: a NOT?)
- **Q G:** "H takes |0⟩ half way to |1⟩. Do two H gates in a row make a NOT?"
- **Q F:** "Is H a square root of X, that is, H² = X?"
- **Reveal G:** "No. H² = I: two half turns about one axis make a full turn, back to the start. A half-way gate that works is R_x(90°); done twice, it is a NOT up to a phase."
- **Reveal F:** "No: H² = I (N&C p. 19). R_x(π/2)² = R_x(π) = −iX, a square root of NOT up to a global phase; R_x(π/2)|0⟩ also reads 0.5, 0.5."
- **Reveal cap:** G/F "H·H = I; R_x(90°)·R_x(90°) = −iX"
- **Stage:** question `split( circ{ circuit:C_HH, upTo:1 } / amp{same} )` (one H only); reveal `bloch{ state:'+z', rotate:{axis:{thetaDeg:45, phiDeg:0}, angleDeg:{from:0, to:360}} }`.
- **Claims:** `q4HH` → true · `q4HHisX` → false · `q4SqrtNot` → true · `q4SqrtNotHalf` → 0.5, 0.5.

### Unit `q4-registers` — Registers: 2ⁿ amplitudes for n qubits

**`q4-registers:b1` [L]** (two qubits, four basis states)
- **G:** "Two bits have four settings: 00, 01, 10 and 11. Two qubits, a [[qc-register|register]], have four basis states |00⟩, |01⟩, |10⟩, |11⟩, and a state gives each one an amplitude. The left digit belongs to the first qubit, drawn on the top wire."
- **F:** "|ψ⟩ = α₀₀|00⟩ + α₀₁|01⟩ + α₁₀|10⟩ + α₁₁|11⟩, Σ_x|α_x|² = 1 (N&C Eq. 1.5, p. 16). Lock: the left label is qubit 0, the top wire and the most significant bit."
- **Cap:** G "|01⟩: one bar, the second of four" · F "Rosetta: Bergou's qubit 1 and N&C's first qubit are our qubit 0"
- **Stage:** `amp{ state:{ket:'01'} }`; flag `qc-amp-bars-not-places`.
- **Claims:** `q4Ket01` → (0, 1, 0, 0).

**`q4-registers:b2` [L]** (a product of two qubits)
- **G:** "Put ψ beside a second qubit in |+⟩. Each two-qubit amplitude is a product: the first qubit's amplitude for its digit times the second's for its digit. So |10⟩ gets 0.5 × 0.707 = 0.354. This is the [[qc-tensor-product|tensor product]] ψ ⊗ |+⟩."
- **F:** "(|a⟩ ⊗ |b⟩)_{ij} = a_ib_j, the Kronecker product of the columns; Bergou Eq. 1.3 (p. 2) builds the basis this way. ψ ⊗ |+⟩ = (0.612, 0.612, 0.354, 0.354), with chances 0.375, 0.375, 0.125, 0.125 adding to 1."
- **Cap:** G "ψ ⊗ |+⟩: bars 0.612, 0.612, 0.354, 0.354" · F "chances sum: 1"
- **Stage:** `split( circ{ circuit:C_PROD } / amp{same} )` (the R_y(60°) box prepares ψ, `q4-one-qubit-gates:b6`).
- **Claims:** `q4Prod` → (0.6124, 0.6124, 0.3536, 0.3536) · `q4ProdIsKron` → true · `q4ProdP` → 0.375, 0.375, 0.125, 0.125 · `q4ProdPsum` → 1.
- **Bridge (G):** "<<qc-l2-vector-space|kets add and scale like vectors>>."

**`q4-registers:b3` [L]** (n qubits)
- **G:** "Each extra qubit doubles the count. n qubits have 2ⁿ basis states |x⟩, labelled by the n-digit binary numbers x. H on each of three qubits turns |000⟩ into 8 equal bars of 0.354. For 500 qubits, 2⁵⁰⁰ is a number with 151 digits."
- **F:** "The N-qubit basis is |x⟩ = |x₁…x_N⟩, x = 0, …, 2^N − 1, and |Ψ⟩ = Σ_x c_x|x⟩ (Bergou Eqs. 1.3–1.4, p. 2). H^{⊗3}|000⟩ has every c_x = 1/√8 = 0.354; N&C (p. 17) notes that 2⁵⁰⁰ exceeds the number of atoms in the Universe."
- **Cap:** G "three qubits: 8 bars of 0.354" · F "2⁵⁰⁰: 151 digits"
- **Stage:** `split( circ{ circuit:C_H3 } / amp{same} )`.
- **Claims:** `q4Dim[0]` → 8 · `q4H3Amp` → 0.3536 · `q4H3isWH` → true · `q4Digits500` → 151.

**`q4-registers:b4` [L]** (a label is a number)
- **G:** "Read a label as a binary number to find its bar: |101⟩ is bar number 5, counting from 0. Bar 6 of three qubits is |110⟩."
- **F:** "|x₁x₂x₃⟩ ↦ x = 4x₁ + 2x₂ + x₃ (big-endian, N&C's |x₁x₂…x_n⟩, p. 17): |101⟩ ↦ 5 and 6 ↦ |110⟩."
- **Cap:** G/F "|101⟩: bar number 5"
- **Stage:** `amp{ state:{ket:'101'} }`.
- **Claims:** `q4Idx101` → 5 · `q4Bits6` → 110.

**`q4-registers:b5` [C]** (is every state a product?)
- **Q G:** "Every pair of one-qubit states makes a two-qubit state. Is every two-qubit state such a pair?"
- **Q F:** "Is every |Ψ⟩ ∈ ℂ⁴ of the form |a⟩ ⊗ |b⟩?"
- **Reveal G:** "No. For a product, (first bar × last bar) − (second bar × third bar) is always 0. For (|00⟩ + |11⟩)/√2 it is 0.5. Such states are called entangled; a later chapter studies them."
- **Reveal F:** "No: |Ψ⟩ is a product iff det[[c₀₀, c₀₁], [c₁₀, c₁₁]] = 0. For (|00⟩ + |11⟩)/√2 it is 0.5, for ψ ⊗ |+⟩ it is 0."
- **Reveal cap:** G/F "ψ ⊗ |+⟩: 0; (|00⟩ + |11⟩)/√2: 0.5"
- **Stage:** question `split( circ{ circuit:C_PROD } / amp{same} )`; reveal `amp{ state:{bell:'00+11'} }`.
- **Claims:** `q4ProdDet` → 0 · `q4BellDet` → 0.5 · `q4ProdProduct`, `q4BellProduct` → true, false.

### Unit `q4-cnot` — CNOT: flip the target when the control is 1

**`q4-cnot:b1` [L]** (control and target; Eq. 1.9)
- **G:** "[[qc-cnot|CNOT]] acts on two qubits, a control and a target. If the control is |0⟩ nothing happens; if it is |1⟩ the target flips. So |10⟩ becomes |11⟩, and |11⟩ becomes |10⟩."
- **F:** "C-NOT (Bergou Eq. 1.9, Fig. 1.4, p. 4; N&C Eq. 1.18, p. 21): |00⟩ ↦ |00⟩, |01⟩ ↦ |01⟩, |10⟩ ↦ |11⟩, |11⟩ ↦ |10⟩. The control (the dot, top wire) passes unchanged."
- **Cap:** G/F "|10⟩ → |11⟩: the bar moves one place"
- **Stage:** `split( circ{ circuit:C_CX10, upTo:{from:0, to:1} } / amp{same} )`.
- **Claims:** `q4Cnot10` → |11⟩ · `q4CnotTable` → 00, 01, 11, 10.

**`q4-cnot:b2` [L]** (XOR)
- **G:** "In one line: the target B becomes B ⊕ A, where ⊕ is [[qc-xor|XOR]], adding bits without carrying. So 0 ⊕ 0 = 0, 0 ⊕ 1 = 1, 1 ⊕ 0 = 1 and 1 ⊕ 1 = 0. That is why CNOT is also called the XOR gate."
- **F:** "|A, B⟩ ↦ |A, B ⊕ A⟩ with ⊕ addition mod 2 (N&C p. 21); Bergou calls C-NOT the exclusive-OR gate (p. 4). A later Foundations chapter treats Boolean logic in full."
- **Cap:** G/F "⊕: 0, 1, 1, 0"
- **Stage:** as b1, `upTo:1`.
- **Claims:** `q4Xor` → 0, 1, 1, 0.

**`q4-cnot:b3` [L]** (the matrix; D4)
- **G:** "Write the four outputs as columns, in the order |00⟩, |01⟩, |10⟩, |11⟩. The table is the identity with its last two columns swapped. It is unitary, and applying it twice changes nothing."
- **F:** "U_CN = |0⟩⟨0| ⊗ I + |1⟩⟨1| ⊗ X, its columns read off Eq. 1.9 (D4; Bergou ⚑ P1.1(b)–(c); N&C Fig. 1.6): U_CN†U_CN = I and U_CN² = I."
- **Cap:** G "CNOT's table: [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]]" · F "U_CN² = I"
- **Stage:** as b1.
- **Derivation:** D4 (§2).
- **Claims:** `q4CnotMat` → as cap · `q4CnotUnitary`, `q4Cnot2` → true, true.

**`q4-cnot:b4` [L]** (controlled gates and CZ)
- **G:** "Any gate U can be controlled the same way: apply U to the target only when the control is |1⟩. With U = Z this is CZ, which flips the sign of |11⟩ and nothing else. CZ does not care which wire is the control."
- **F:** "C-U = |0⟩⟨0| ⊗ I + |1⟩⟨1| ⊗ U, a [[qc-controlled-gate|controlled gate]] (N&C Fig. 1.8, p. 23). CZ = diag(1, 1, 1, −1) is symmetric in its wires, and CZ = (I ⊗ H) CNOT (I ⊗ H) (Bergou ⚑ P1.4(b))."
- **Cap:** G "CZ on |+⟩|+⟩: only the |11⟩ bar changes sign" · F "(I ⊗ H) CNOT (I ⊗ H) = CZ"
- **Stage:** `split( circ{ circuit:C_CZH, upTo:{from:0, to:3} } / amp{same} )`; flag `qc-amp-hue-is-phase`.
- **Claims:** `q4CZpp` → (0.5, 0.5, 0.5, −0.5) · `q4CZ`, `q4CZSym`, `q4CZfromCnot`, `q4CZcircuit` → true ×4.

**`q4-cnot:b5` [B]** (reversible, unlike AND)
- **G:** "Bergou explains why AND has no quantum version: output 0 comes from three inputs, 00, 01 and 10, so the input cannot be recovered. CNOT keeps its control, so its output always tells you its input."
- **F:** "Unitary ⇒ invertible, so an irreversible classical gate (AND; XOR alone, N&C p. 21) has no direct quantum version (Bergou p. 3). Keeping the control makes XOR reversible; N&C's Toffoli gate does the same for AND (Unit 5.2)."
- **Cap:** G/F "AND gives 0 for three of its four inputs"
- **Stage:** as b1.
- **Claims:** `q4AndZeros` → 3.

**`q4-cnot:b6` [C]** (does CNOT copy?)
- **Q G:** "CNOT turns |00⟩ into |00⟩ and |10⟩ into |11⟩: it copies a bit onto a blank target. Feed it ψ and a blank |0⟩. Do you get two copies of ψ?"
- **Q F:** "CNOT(|x⟩|0⟩) = |x⟩|x⟩ for x ∈ {0, 1}. Does CNOT(ψ ⊗ |0⟩) equal ψ ⊗ ψ?"
- **Reveal G:** "No. Linearity gives 0.866|00⟩ + 0.5|11⟩, two bars. Two copies of ψ would fill all four bars: 0.75, 0.433, 0.433, 0.25. The bit was copied; the qubit was not."
- **Reveal F:** "No: a|00⟩ + b|11⟩ ≠ a²|00⟩ + ab(|01⟩ + |10⟩) + b²|11⟩ unless ab = 0 (N&C Eqs. 1.21–1.22, pp. 24–25). No circuit copies an unknown state: the no-cloning theorem, proved in a later chapter."
- **Reveal cap:** G/F "CNOT(ψ, 0): (0.866, 0, 0, 0.5); ψ ⊗ ψ: (0.75, 0.433, 0.433, 0.25)"
- **Stage:** question `split( circ{ circuit:C_COPY, upTo:1 } / amp{same} )` (before the CNOT); reveal the same with `upTo:{from:1, to:2}`.
- **Claims:** `q4CopyBasis` → true · `q4CopyOut` → (0.866, 0, 0, 0.5) · `q4PsiPsi` → (0.75, 0.433, 0.433, 0.25) · `q4CopyFails` → true.

### Unit `q4-circuits` — Circuits: wires are time, products run backwards

**`q4-circuits:b1` [L]** (reading a circuit; D6)
- **G:** "A [[qc-circuit|circuit]] draws each qubit as a wire and each gate as a box on it. Read it left to right: that is the order in time. The matrices multiply the other way round: H then Z is the product ZH."
- **F:** "Wires are time or a moving carrier, not copper, and inputs default to |0…0⟩ (N&C p. 23). A circuit U₁ then U₂ is the operator U₂U₁ (D6): H then Z sends |0⟩ to |−⟩, and Z then H sends it to |+⟩."
- **Cap:** G "H then Z: |0⟩ ends as (0.707, −0.707)" · F "the circuit's matrix is ZH ≠ HZ"
- **Stage:** `split( circ{ circuit:C_HZ, upTo:{from:0, to:2} } / amp{same} )`; flag `qc-circuit-wires-are-time`.
- **Derivation:** D6 (§2).
- **Claims:** `q4HthenZ` → (0.7071, −0.7071) · `q4ZthenH` → (0.7071, 0.7071) · `q4CircOrder`, `q4CircOrderWrong` → true, false.
- **Bridge (G):** "<<qc-l3-operators|operators are machines that turn states into states>>."

**`q4-circuits:b2` [L]** (the Bell pair; D5)
- **G:** "H on the top qubit, then CNOT. From |00⟩, H makes (|00⟩ + |10⟩)/√2. CNOT flips the target only in the |10⟩ part, giving (|00⟩ + |11⟩)/√2. This [[qc-bell-state|Bell state]] is called Φ⁺."
- **F:** "N&C Fig. 1.12 (p. 25): (H ⊗ I) then CNOT maps |00⟩ ↦ (|00⟩ + |11⟩)/√2 = Φ⁺ (N&C: β₀₀; Bergou: Ψ₊), D5; the other inputs give N&C's Eq. 1.27. Φ⁺ fails Unit 4.3's product test."
- **Cap:** G "after H: bars at |00⟩, |10⟩; after CNOT: at |00⟩, |11⟩" · F "Φ⁺ = (0.707, 0, 0, 0.707)"
- **Stage:** `split( circ{ circuit:C_BELL, upTo:{from:0, to:2} } / amp{same} )`.
- **Derivation:** D5 (§2).
- **Claims:** `q4BellMid` → (0.7071, 0, 0.7071, 0) · `q4Bell` → (0.7071, 0, 0, 0.7071) · `q4BellIsPhi` → true · `q4BellTable`.

**`q4-circuits:b3` [L]** (SWAP from three CNOTs; D7)
- **G:** "Three CNOTs, the middle one upside down, swap two qubits. Follow |10⟩: it becomes |11⟩, then |01⟩, and the last CNOT leaves |01⟩ alone. In bits: a, b becomes a, a ⊕ b, then b, a ⊕ b, then b, a."
- **F:** "|a, b⟩ ↦ |a, a ⊕ b⟩ ↦ |b, a ⊕ b⟩ ↦ |b, a⟩ (N&C Eq. 1.20, Fig. 1.7, p. 23; Bergou ⚑ P1.4(a)), so CNOT₀₁CNOT₁₀CNOT₀₁ = [[qc-swap-gate|SWAP]] (D7)."
- **Cap:** G/F "|10⟩ → |11⟩ → |01⟩ → |01⟩"
- **Stage:** `split( circ{ circuit:C_SWAP3, upTo:{from:0, to:3} } / amp{same} )`.
- **Derivation:** D7 (§2).
- **Claims:** `q4SwapSteps` → 10, 11, 01, 01 · `q4SwapIsSwap` → true.

**`q4-circuits:b4` [L]** (universality)
- **G:** "CNOT and the one-qubit gates are enough for everything: any unitary on any number of qubits can be built from them. Bergou and Nielsen and Chuang state this here without proof. CZ from H, CNOT and H is one small example."
- **F:** "CNOT together with all one-qubit unitaries is a [[qc-universal-gate-set|universal set]] (Bergou p. 5; N&C p. 22, proof in N&C §4.5), the quantum counterpart of NAND's universality. Box 1.1 already reduces one-qubit gates to R_z and R_y."
- **Cap:** G/F "CZ = H, CNOT, H on the bottom wire"
- **Stage:** `split( circ{ circuit:C_CZH } / amp{same} )`.
- **Claims:** `q4CZcircuit` → true.

**`q4-circuits:b5` [B]** (what a circuit may not do)
- **G:** "Nielsen and Chuang list three things quantum circuits never do: loop back, join two wires into one, or split one wire into copies. Joining loses information, and copying is what Unit 4.4's clue showed to fail."
- **F:** "Quantum circuits are acyclic and forbid FANIN (not reversible) and FANOUT (no-cloning), N&C p. 23. A measurement is a meter with a double-line classical output (Fig. 1.10, Unit 4.6)."
- **Cap:** G/F "no loops, no joins, no copies"
- **Stage:** `split( circ{ circuit:C_BELL } / amp{same} )`.
- **Claims:** none (no numbers).

**`q4-circuits:b6` [C]** (Hadamards around a CNOT)
- **Q G:** "Put an H on both wires before and after a CNOT. Is the top wire still the control?"
- **Q F:** "Is (H ⊗ H) CNOT₀₁ (H ⊗ H) a CNOT whose control is qubit 0?"
- **Reveal G:** "No. The result is a CNOT pointing the other way: the bottom wire controls the top. Here |01⟩ comes out as |11⟩, so the top qubit flipped. Seen through Hadamards, control and target trade places."
- **Reveal F:** "No: (H ⊗ H) CNOT₀₁ (H ⊗ H) = CNOT₁₀, since HXH = Z and CZ is symmetric. In the |±⟩ basis control and target exchange roles."
- **Reveal cap:** G/F "|01⟩ → |11⟩: the top qubit flipped"
- **Stage:** question `split( circ{ circuit:C_HHCX, upTo:0 } / amp{same} )` (input only, so no spoiler); reveal the same with `upTo:{from:0, to:3}`.
- **Claims:** `q4HHcx01` → |11⟩ · `q4HHcnot`, `q4HXH` → true, true.

### Unit `q4-measure` — Reading a register, whole or one qubit

**`q4-measure:b1` [L]** (reading every qubit)
- **G:** "Reading a register gives a string x with chance |c_x|², where c_x is the amplitude of |x⟩. The state becomes |x⟩. In a circuit, a reading is a meter; a double line carries the bit it produces. For ψ ⊗ |+⟩: 00 and 01 with 0.375 each, 10 and 11 with 0.125 each."
- **F:** "Outcome x w.p. |α_x|², post-state |x⟩ (N&C p. 16); the meter and the double-line classical wire are N&C Fig. 1.10 (p. 24)."
- **Cap:** G/F "ψ ⊗ |+⟩ read: 0.375, 0.375, 0.125, 0.125"
- **Stage:** `split( circ{ circuit:C_PRODM } / amp{same, mode:'probability'} )`.
- **Claims:** `q4ProdMeasure` → 0.375, 0.375, 0.125, 0.125.

**`q4-measure:b2` [L]** (reading one qubit of two)
- **G:** "You can read just the first qubit. The chance of 0 is the chance of |00⟩ plus that of |01⟩. Keep only those two amplitudes and rescale them to length 1. What is left for the second qubit depends on the reading."
- **F:** "P(q₀ = 0) = |α₀₀|² + |α₀₁|², post-state (α₀₀|00⟩ + α₀₁|01⟩)/√(|α₀₀|² + |α₀₁|²) (N&C Eq. 1.6, p. 16). For 0.612(|00⟩ + |01⟩) + 0.354(|10⟩ − |11⟩): 0 w.p. 0.75 leaves |0⟩|+⟩, 1 w.p. 0.25 leaves |1⟩|−⟩."
- **Cap:** G "read 1 (chance 0.25): the second qubit is left in |−⟩" · F "post-states |0⟩|+⟩ and |1⟩|−⟩"
- **Stage:** `split( circ{ circuit:C_M2, outcomes:'1' } / amp{same} )`.
- **Claims:** `q4M2` → (0.6124, 0.6124, 0.3536, −0.3536) · `q4M2p` → 0.75, 0.25 · `q4M2post0IsPlus`, `q4M2post1IsMinus` → true, true · `q4M2outcome1prob` → 0.25.

**`q4-measure:b3` [L]** (a Bell pair's readings agree)
- **G:** "Read the first qubit of Φ⁺: 0 or 1, half the time each. After a 0 the state is |00⟩; after a 1 it is |11⟩. So reading the second qubit always repeats the first."
- **F:** "For Φ⁺, P(q₀ = 0) = P(q₀ = 1) = ½ with post-states |00⟩, |11⟩: the outcomes are perfectly correlated (N&C p. 17). That these correlations beat any classical model is a later chapter's result."
- **Cap:** G/F "Φ⁺ read: 00 or 11, never 01 or 10"
- **Stage:** `split( circ{ circuit:C_BELLM } / amp{same, mode:'probability'} )`.
- **Claims:** `q4BellM` → 0.5, 0.5 · `q4BellMpost` → |00⟩, |11⟩.

**`q4-measure:b4` [B]** (reading in the |±⟩ basis)
- **G:** "A qubit can also be read in the basis |+⟩, |−⟩. Nielsen and Chuang rewrite ψ = α|0⟩ + β|1⟩ in that basis, and the chance of + is |α + β|²/2. For ψ it is 0.933, Unit 3.1's number. In a circuit: H, then an ordinary reading."
- **F:** "ψ = ((α + β)/√2)|+⟩ + ((α − β)/√2)|−⟩ (N&C Eq. 1.19, p. 22), so P(+) = |α + β|²/2 = |⟨+x|ψ⟩|² = 0.933. H maps |±⟩ to |0⟩, |1⟩, so reading after H is reading in |±⟩ <<qc-l2-three-bases|three bases, each blind to the others>>."
- **Cap:** G/F "ψ in the ± basis: 0.933 and 0.067"
- **Stage:** `split( circ{ circuit:C_PSIH } / amp{same, mode:'probability'} )`.
- **Claims:** `q4PlusBasis` → 0.933, 0.067 · `q4PlusBasisViaH` → equal · `q4PlusFormula` → 0.933.

**`q4-measure:b5` [C]** (does the other qubit keep the amplitudes?)
- **Q G:** "Start from 0.866|00⟩ + 0.5|11⟩, Unit 4.4's failed copy, and read the first qubit. Does the second qubit still carry 0.866 and 0.5?"
- **Q F:** "After measuring q₀ of a|00⟩ + b|11⟩, does q₁ keep any trace of a and b?"
- **Reveal G:** "No. After a 0 the second qubit is exactly |0⟩; after a 1, exactly |1⟩. The numbers 0.75 and 0.25 show only in how often each happens."
- **Reveal F:** "No: the post-states are |00⟩ and |11⟩, w.p. |a|² = 0.75 and |b|² = 0.25; the amplitudes are gone after one reading (N&C p. 25), another way to see that no copy was made."
- **Reveal cap:** G/F "read 0 (0.75): |00⟩; read 1 (0.25): |11⟩"
- **Stage:** question `split( circ{ circuit:C_COPY } / amp{same} )`; reveal `split( circ{ circuit:C_COPYM, outcomes:'0' } / amp{same} )`.
- **Claims:** `q4CopyRead` → 0.75, 0.25 · `q4CopyReadPost` → |00⟩, |11⟩.

**Beat count:** 5 + 7 + 5 + 6 + 6 + 5 = **34 beats**, 6 of them clues with reveals. Phase mix: 24 [L] · 4 [B] · 6 [C];
within every unit the order is L → B → C.

## 2. Derivations

**D1 · `q4-one-qubit-gates:b1` · result X = [[0, 1], [1, 0]]** (Bergou Eqs. 1.5–1.7)
- Ground:
  1. `|0\rangle \mapsto |1\rangle,\quad |1\rangle \mapsto |0\rangle` — The NOT gate, asked of the two basis states.
  2. `\alpha|0\rangle + \beta|1\rangle \mapsto \alpha|1\rangle + \beta|0\rangle` — A gate is linear: it acts on each part and keeps the amplitudes.
  3. `\alpha|0\rangle + \beta|1\rangle = \begin{pmatrix}\alpha\\ \beta\end{pmatrix}` — Write a qubit as a column: the top entry for |0⟩, the bottom for |1⟩.
  4. `X\begin{pmatrix}1\\ 0\end{pmatrix} = \begin{pmatrix}0\\ 1\end{pmatrix},\quad X\begin{pmatrix}0\\ 1\end{pmatrix} = \begin{pmatrix}1\\ 0\end{pmatrix}` — Step 1 in columns; a table's columns are what it makes of |0⟩ and |1⟩ (Unit 2.4).
  5. `X = \begin{pmatrix}0 & 1\\ 1 & 0\end{pmatrix}` — Put the two columns side by side.
- Formal:
  1. `X_{ij} = \langle i|X|j\rangle = 1 - \delta_{ij}` — Matrix elements from the action on the basis (Unit 2.4).
  2. `X = \sigma_x` — Eq. 1.7.
- Check: X|0⟩ = |1⟩, Xψ = (0.5, 0.866) (`q4X0`, `q4XPsi`).

**D2 · `q4-one-qubit-gates:b4` · result H = (X + Z)/√2 and H² = I**
- Ground:
  1. `H|0\rangle = \tfrac1{\sqrt2}(|0\rangle + |1\rangle),\quad H|1\rangle = \tfrac1{\sqrt2}(|0\rangle - |1\rangle)` — Bergou's definition of the gate.
  2. `H = \tfrac1{\sqrt2}\begin{pmatrix}1 & 1\\ 1 & -1\end{pmatrix}` — The two outputs are the table's columns (D1's method).
  3. `X + Z = \begin{pmatrix}1 & 1\\ 1 & -1\end{pmatrix}` — Add the two tables entry by entry.
  4. `H = \tfrac1{\sqrt2}(X + Z)` — Compare steps 2 and 3.
  5. `H^2 = \tfrac12(X^2 + XZ + ZX + Z^2)` — Multiply out, keeping the order inside each product.
  6. `X^2 = Z^2 = I,\quad ZX = -XZ` — Unit 3.6's Pauli rules: each squares to I, and two different ones anticommute.
  7. `H^2 = \tfrac12(I + I) = I` — The middle terms cancel.
- Formal:
  1. `H = \tfrac1{\sqrt2}(X + Z)` — Eq. 1.8's columns.
  2. `H^2 = \tfrac12\big(2I + \{X, Z\}\big) = I` — {σ_i, σ_j} = 2δ_ijI.
- Check: `q4HXZ`, `q4HH`.

**D3 · `q4-one-qubit-gates:b6` · result P(χ) = e^{iχ/2}R_z(χ): both turn the point by χ about z**
- Ground:
  1. `|\psi\rangle = \cos\tfrac\theta2|0\rangle + e^{i\varphi}\sin\tfrac\theta2|1\rangle` — A point on the sphere (Unit 3.2).
  2. `P(\chi)|\psi\rangle = \cos\tfrac\theta2|0\rangle + e^{i(\varphi + \chi)}\sin\tfrac\theta2|1\rangle` — P(χ) multiplies the |1⟩ amplitude by e^{iχ}, and multiplying adds angles (Chapter F1).
  3. `(\theta, \varphi) \to (\theta, \varphi + \chi)` — Same polar angle, azimuth moved on by χ: a turn by χ about z.
  4. `R_z(\chi) = \begin{pmatrix}e^{-i\chi/2} & 0\\ 0 & e^{i\chi/2}\end{pmatrix}` — N&C's z rotation (Eq. 1.16).
  5. `R_z(\chi) = e^{-i\chi/2}P(\chi)` — Take e^{−iχ/2} out of both diagonal entries.
  6. `P(\chi) = e^{i\chi/2}R_z(\chi)` — So the two differ by a global phase and make the same turn.
- Formal:
  1. `P(\chi)|\theta, \varphi\rangle = |\theta, \varphi + \chi\rangle` — Unit 3.2's |θ, φ⟩.
  2. `P(\chi) = e^{i\chi/2}R_z(\chi),\quad R_z(\chi) = e^{-i\chi\sigma_z/2}` — Factor out the global phase.
- Check: `q4PRz`, `q4TRz`, `q4ZRz`, `q4SPlus`.

**D4 · `q4-cnot:b3` · result the CNOT table, U_CN² = I** (Bergou ⚑ P1.1(b)–(c))
- Ground:
  1. `|00\rangle, |01\rangle, |10\rangle, |11\rangle \;\to\; \text{columns } 1, 2, 3, 4` — Number the basis states in binary order (Unit 4.3).
  2. `U|00\rangle = |00\rangle,\quad U|01\rangle = |01\rangle` — Control 0: nothing happens, so columns 1 and 2 are those of I.
  3. `U|10\rangle = |11\rangle,\quad U|11\rangle = |10\rangle` — Control 1: the target flips, so column 3 is |11⟩ and column 4 is |10⟩.
  4. `U_{CN} = \begin{pmatrix}1&0&0&0\\ 0&1&0&0\\ 0&0&0&1\\ 0&0&1&0\end{pmatrix}` — The four columns side by side.
  5. `U_{CN}^2|x, y\rangle = |x, y \oplus x \oplus x\rangle = |x, y\rangle` — XOR with the same bit twice gives the bit back.
  6. `U_{CN}^\dagger = U_{CN} = U_{CN}^{-1}` — The table is real and symmetric, so its adjoint is itself, which step 5 shows is its inverse: it is unitary.
- Formal:
  1. `U_{CN} = |0\rangle\langle0| \otimes I + |1\rangle\langle1| \otimes X` — Eq. 1.9 in operator form.
  2. `U_{CN}^2 = |0\rangle\langle0| \otimes I + |1\rangle\langle1| \otimes X^2 = I` — Cross terms vanish, X² = I; U_CN† = U_CN.
- Check: `q4CnotMat`, `q4Cnot2`, `q4CnotUnitary`.

**D5 · `q4-circuits:b2` · result (H ⊗ I) then CNOT: |00⟩ ↦ (|00⟩ + |11⟩)/√2**
- Ground:
  1. `|00\rangle = |0\rangle \otimes |0\rangle` — The input, one qubit per wire.
  2. `(H \otimes I)|00\rangle = \tfrac1{\sqrt2}(|0\rangle + |1\rangle) \otimes |0\rangle` — H acts on the top qubit only.
  3. `= \tfrac1{\sqrt2}(|00\rangle + |10\rangle)` — Multiply out with Unit 4.3's product rule.
  4. `U_{CN}|00\rangle = |00\rangle,\quad U_{CN}|10\rangle = |11\rangle` — CNOT's truth table, one term at a time.
  5. `U_{CN}\tfrac1{\sqrt2}(|00\rangle + |10\rangle) = \tfrac1{\sqrt2}(|00\rangle + |11\rangle)` — A gate is linear, so it acts on each term.
- Formal:
  1. `U_{CN}(H \otimes I)|00\rangle = \tfrac1{\sqrt2}(|00\rangle + |11\rangle) = \Phi^+` — Linearity and Eq. 1.9.
  2. `U_{CN}(H \otimes I)|xy\rangle = \tfrac1{\sqrt2}\big(|0, y\rangle + (-1)^x|1, \bar y\rangle\big)` — N&C Eq. 1.27, all four inputs.
- Check: `q4BellMid`, `q4Bell`, `q4BellTable`.

**D6 · `q4-circuits:b1` · result a circuit U₁ then U₂ is the matrix U₂U₁**
- Ground:
  1. `|\psi_1\rangle = U_1|\psi_0\rangle` — The first box acts first, on the input.
  2. `|\psi_2\rangle = U_2|\psi_1\rangle` — The second box acts on what the first produced.
  3. `|\psi_2\rangle = U_2U_1|\psi_0\rangle` — Put step 1 into step 2.
  4. `U_{\text{circuit}} = U_2U_1` — The box drawn last is written first: wires run left to right, products right to left.
  5. `ZH|0\rangle = Z|+\rangle = |-\rangle` — H then Z, checked on |0⟩.
- Formal:
  1. `U_{\text{circuit}} = U_K \cdots U_2U_1` — Composition of maps.
  2. `ZH \neq HZ` — ZH|0⟩ = |−⟩ but HZ|0⟩ = |+⟩.
- Check: `q4CircOrder`, `q4HthenZ`, `q4ZthenH`.

**D7 · `q4-circuits:b3` · result CNOT₀₁CNOT₁₀CNOT₀₁ = SWAP** (N&C Eq. 1.20; Bergou ⚑ P1.4(a))
- Ground:
  1. `|a, b\rangle \to |a, a \oplus b\rangle` — First CNOT: the top controls, and the bottom becomes a ⊕ b.
  2. `\to |a \oplus (a \oplus b), a \oplus b\rangle` — Second CNOT: the bottom controls, and the top is XORed with it.
  3. `a \oplus (a \oplus b) = b` — XOR with a twice cancels, since a ⊕ a = 0.
  4. `\to |b, (a \oplus b) \oplus b\rangle = |b, a\rangle` — Third CNOT: the top, now b, controls; b ⊕ b cancels.
  5. `|a, b\rangle \to |b, a\rangle` — True for all four basis states, so by linearity for every state.
- Formal:
  1. `\mathrm{CNOT}_{01}\mathrm{CNOT}_{10}\mathrm{CNOT}_{01}|a, b\rangle = |b, a\rangle` — N&C Eq. 1.20.
  2. `\mathrm{CNOT}_{01}\mathrm{CNOT}_{10}\mathrm{CNOT}_{01} = \mathrm{SWAP}` — Equal on a basis, hence equal.
- Check: `q4SwapSteps`, `q4SwapIsSwap`.

## 3. Try-it widget per unit

No existing widget runs a circuit (§9.3 W1). Each unit uses the closest existing widget; units 3–5 are the weak fits.

| Unit | Widget spec | Why this one |
|---|---|---|
| `q4-qubit` | `{kind:'amplitude-bars', props:{state:[60, 0], basis:'z', editable:true}}` | ψ's two amplitudes and chances 0.75, 0.25; drag the state and watch the chances. |
| `q4-one-qubit-gates` | `{kind:'bloch', props:{theta:60, phi:0, editable:true, rotations:true, rotationAngles:[45, 90, 180, 360], landmarks:true}}` | The R_z buttons are T, S and Z turns up to a phase; 360° shows R_z(2π) = −I. |
| `q4-registers` | `{kind:'amplitude-bars', props:{state:[60, 0], basis:'z', editable:true}}` | Read ψ's two amplitudes, then multiply each by \|+⟩'s 0.707: the four product bars. |
| `q4-cnot` | `{kind:'amplitude-bars', props:{state:'+x', basis:'z', editable:true}}` | A control in \|+⟩ is 1 half the time: the target flips in that half. |
| `q4-circuits` | `{kind:'amplitude-bars', props:{state:[60, 0], basis:'x', editable:true}}` | H is the z → x change of basis: its output's z bars are ψ's x bars. |
| `q4-measure` | `{kind:'amplitude-bars', props:{state:[60, 0], basis:'x', editable:true}}` | Reading in \|±⟩: 0.933 and 0.067. |

**Try this:**
- `q4-qubit`: (1) Make the chances 0.5 and 0.5. (2) Keep θ, change φ: do the chances move? · `q4-one-qubit-gates`: (1) From \|+x⟩, press 90° twice. (2) Press 360°: same point, ket times −1.
- `q4-registers`: (1) Multiply ψ's bars by 0.707. (2) Do the four chances add to 1? · `q4-cnot`: (1) Set \|0⟩: does the target ever flip? (2) Set \|1⟩.
- `q4-circuits`: (1) Switch the basis between z and x. (2) Which state has x bars 1 and 0? · `q4-measure`: (1) Find a state with P(+) = 1. (2) One with P(+) = P(−).

## 4. Challenges per unit

Tolerance 0.005 unless stated. Hints climb nudge → key idea → setup. **Homework:** no sheet assigns any item below
(`homework-status.md`); ⚑ items follow `qc709-nc.md` and turn hints-only (`walkthrough: []`) if a later sheet assigns them.

### `q4-qubit`
1. **warm-up · numeric · `q4-q-p1`** — "A qubit is 0.6|0⟩ + 0.8|1⟩. What is the chance of reading 1?"
   - Answer: **0.64** = `q4ChP1`. Hints: (1) A chance is a size squared. (2) The \|1⟩ amplitude is 0.8. (3) 0.8². Walkthrough: 0.64; the chance of 0 is 0.36.
2. **core · numeric · `q4-q-complex`** — "A qubit is 0.6|0⟩ + 0.8i|1⟩. What is the chance of reading 1?"
   - Answer: **0.64** = `q4ChComplex`. Hints: (1) Size squared, not square. (2) \|0.8i\| = 0.8. (3) 0.8². Walkthrough: 0.64: the phase i changes no chance.
3. **core · numeric · `q4-q-theta`** — "A qubit reads 0 with chance 0.25. What is its polar angle θ, in degrees?"
   - Answer: **120** = `q4ChTheta`. Hints: (1) P(0) = cos²(θ/2). (2) cos(θ/2) = 0.5. (3) θ/2 = 60°. Walkthrough: θ = 120°: below the equator, 1 is the likelier reading.
4. **stretch · choice · `q4-q-phase`** — "Which state is the same as ψ = 0.866|0⟩ + 0.5|1⟩?"
   - Options: **−0.866\|0⟩ − 0.5\|1⟩** ✓ · 0.866\|0⟩ − 0.5\|1⟩ · 0.5\|0⟩ + 0.866\|1⟩ · 0.866\|0⟩ + 0.5i\|1⟩.
   - Check: `q4ChPhase` → 1, 0, 0, 0. Hints: (1) Which one is ψ times one number? (2) A number of size 1. (3) −1. Walkthrough: −ψ = e^{iπ}ψ, a global phase; the others move the point.

### `q4-one-qubit-gates`
1. **warm-up · numeric · `q4-g-x`** — "Apply X to 0.6|0⟩ + 0.8|1⟩. What is the chance of reading 0?"
   - Answer: **0.64** = `q4ChX`. Hints: (1) X swaps the amplitudes. (2) The \|0⟩ amplitude is now 0.8. (3) Square it. Walkthrough: 0.64.
2. **core · numeric · `q4-g-h`** — "Apply H to |1⟩. What is the |1⟩ amplitude of the result?"
   - Answer: **−0.7071** = `q4H1[1]` (Bergou ⚑ P1.1(a)). Hints: (1) H\|1⟩ is H's second column. (2) (1/√2)(1, −1). (3) The bottom entry. Walkthrough: H\|1⟩ = \|−⟩ = (0.707, −0.707).
3. **core · choice · `q4-g-z`** — "Which gate leaves the chances of reading 0 and 1 unchanged for every state?"
   - Options: **Z** ✓ · X · H · R_x(90°).
   - Check: `q4ChZ` → 1, 0, 0, 0 on the state (0.36 + 0.48i, 0.48 − 0.64i). Hints: (1) Which gate only changes phases? (2) Its table is diagonal. (3) A phase has size 1. Walkthrough: Z multiplies the \|1⟩ amplitude by −1, a size-1 number.
4. **stretch · numeric · `q4-g-hpsi`** — "Apply H to ψ = 0.866|0⟩ + 0.5|1⟩. What is the chance of reading 0?"
   - Answer: **0.933** = `q4HP[0]`. Hints: (1) The \|0⟩ amplitude is (α + β)/√2. (2) It is 0.966. (3) Square it. Walkthrough: 0.966² = 0.933, the same as \|⟨+x\|ψ⟩\|².

### `q4-registers`
1. **warm-up · numeric · `q4-r-count`** — "How many amplitudes does a 5-qubit register have?"
   - Answer: **32** = `q4ChCount`. Hints: (1) Each qubit doubles the count. (2) 2ⁿ. (3) 2⁵. Walkthrough: 32.
2. **core · numeric · `q4-r-prod`** — "What is the |01⟩ amplitude of (0.6|0⟩ + 0.8|1⟩) ⊗ (0.6|0⟩ + 0.8|1⟩)?"
   - Answer: **0.48** = `q4ChProd`. Hints: (1) First digit from the first qubit. (2) 0.6 for its 0. (3) 0.8 for the second's 1. Walkthrough: 0.6 × 0.8 = 0.48.
3. **core · numeric · `q4-r-index`** — "Counting from 0, which bar is |110⟩?"
   - Answer: **6** = `q4ChIndex`. Hints: (1) Read 110 in binary. (2) 4 + 2 + 0. (3) Qubit 0 is the 4s digit. Walkthrough: 6.
4. **stretch · choice · `q4-r-product`** — "Which state is a product of two one-qubit states?"
   - Options: **½(\|00⟩ + \|01⟩ + \|10⟩ + \|11⟩)** ✓ · (\|00⟩ + \|11⟩)/√2 · (\|01⟩ − \|10⟩)/√2 · (\|00⟩ + \|01⟩ + \|10⟩)/√3.
   - Check: `q4ChProductDet` → 0, 0.5, 0.5, −0.3333. Hints: (1) Test (first × last) − (second × third). (2) A product gives 0. (3) Only one does. Walkthrough: ½(1, 1, 1, 1) = \|+⟩ ⊗ \|+⟩.

### `q4-cnot`
1. **warm-up · choice · `q4-c-table`** — "CNOT, with the top wire as control, acts on |11⟩. What comes out?"
   - Options: **\|10⟩** ✓ · \|11⟩ · \|01⟩ · \|00⟩. Check: `q4ChTable` → 10. Hints: (1) The control is 1. (2) The target flips. (3) 1 → 0. Walkthrough: \|10⟩.
2. **core · numeric · `q4-c-entry`** — "In CNOT's table (order |00⟩, |01⟩, |10⟩, |11⟩), what is the entry in row 4, column 3?"
   - Answer: **1** = `q4ChEntry` (Bergou ⚑ P1.1(b)). Hints: (1) Column 3 is CNOT\|10⟩. (2) That is \|11⟩. (3) Row 4 is \|11⟩'s entry. Walkthrough: 1 (D4).
3. **core · numeric · `q4-c-cz`** — "CZ acts on ½(|00⟩ + |01⟩ + |10⟩ + |11⟩). What is the |11⟩ amplitude after?"
   - Answer: **−0.5** = `q4CZpp[3]`. Hints: (1) CZ changes one sign. (2) The sign of \|11⟩. (3) ½ → −½. Walkthrough: −0.5; the other three stay 0.5.
4. **stretch · numeric · `q4-c-copy`** — "CNOT acts on (0.6|0⟩ + 0.8|1⟩) ⊗ |0⟩. What is the |11⟩ amplitude?"
   - Answer: **0.8** = `q4ChCopy`. Hints: (1) Expand: 0.6\|00⟩ + 0.8\|10⟩. (2) CNOT maps \|10⟩ to \|11⟩. (3) The amplitude rides along. Walkthrough: 0.6\|00⟩ + 0.8\|11⟩: not two copies (clue b6).

### `q4-circuits`
1. **warm-up · choice · `q4-k-order`** — "A circuit applies A, then B, then C. Which product is its matrix?"
   - Options: **CBA** ✓ · ABC · BAC · ACB. Check: `q4ChOrder` → true. Hints: (1) The first gate acts first on the ket. (2) It stands next to the ket. (3) Read right to left. Walkthrough: CBA\|ψ⟩ (D6).
2. **core · numeric · `q4-k-bell`** — "H on the top qubit, then CNOT, act on |10⟩. What is the |11⟩ amplitude?"
   - Answer: **−0.7071** = `q4BellTable[2][3]`. Hints: (1) H\|1⟩ = \|−⟩. (2) (\|00⟩ − \|10⟩)/√2. (3) CNOT moves \|10⟩ to \|11⟩. Walkthrough: (\|00⟩ − \|11⟩)/√2, N&C's β₁₀.
3. **core · order · `q4-k-swap`** — "Put the states of |a, b⟩ through the three-CNOT swap in order."
   - Steps: "\|a, b⟩" · "\|a, a ⊕ b⟩" · "\|b, a ⊕ b⟩" · "\|b, a⟩". Hints: (1) The first CNOT's control is the top. (2) The second's is the bottom. (3) a ⊕ a = 0. Walkthrough: D7 (Bergou ⚑ P1.4(a)).
4. **stretch · numeric · `q4-k-hzh`** — "What is the top-right entry of HZH?"
   - Answer: **1** = `q4HZH` (HZH = X). Hints: (1) H = (X + Z)/√2. (2) HZH swaps the roles of X and Z. (3) X's top-right entry. Walkthrough: HZH = X, whose top-right entry is 1.

### `q4-measure`
1. **warm-up · numeric · `q4-m-all`** — "A two-qubit state has amplitudes (0.5, 0.5, 0.5, 0.5). What is the chance of reading 10?"
   - Answer: **0.25** = `q4ChAll`. Hints: (1) Bar 2. (2) Size squared. (3) 0.5². Walkthrough: 0.25.
2. **core · numeric · `q4-m-first`** — "For 0.6|00⟩ + 0.8|11⟩, what is the chance that the first qubit reads 1?"
   - Answer: **0.64** = `q4ChFirst`. Hints: (1) Add the chances with first digit 1. (2) Only \|11⟩. (3) 0.8². Walkthrough: 0.64, and the state becomes \|11⟩.
3. **core · numeric · `q4-m-plus`** — "|0⟩ is read in the |+⟩, |−⟩ basis. What is the chance of +?"
   - Answer: **0.5** = `q4ChPlus0`. Hints: (1) \|α + β\|²/2. (2) α = 1, β = 0. (3) ½. Walkthrough: ½.
4. **stretch · numeric · `q4-m-post`** — "Read the first qubit of ½(|00⟩ + |01⟩ + |10⟩ − |11⟩) and get 1. What is the |11⟩ amplitude afterwards?"
   - Answer: **−0.7071** = `q4ChPost[3]`. Hints: (1) Keep \|10⟩ and \|11⟩. (2) ½(\|10⟩ − \|11⟩). (3) Rescale to length 1. Walkthrough: (\|10⟩ − \|11⟩)/√2 = \|1⟩\|−⟩.

## 5. Glossary terms new in Q4

| id | Term | Ground gloss | Formal definition | First use | bridge |
|---|---|---|---|---|---|
| `qc-qubit` | qubit | A two-level system used to hold quantum information; its states \|0⟩ and \|1⟩ play the parts of 0 and 1. | A unit vector of ℂ² up to phase, α\|0⟩ + β\|1⟩. | `q4-qubit:b1` | `l1-vectors` |
| `qc-computational-basis` | computational basis | The two states \|0⟩ and \|1⟩ of a qubit, or the strings \|x⟩ of a register. | {\|x⟩ : x ∈ {0,1}ⁿ}, orthonormal. | `q4-qubit:b1` | — |
| `qc-gate` | gate | An operation that changes the state of one or more qubits. | A unitary on ℂ^{2ⁿ}. | `q4-one-qubit-gates:b1` | `l3-operators` |
| `qc-phase-gate` | phase gate P(χ) | The gate that keeps \|0⟩ and multiplies \|1⟩ by e^{iχ}: a turn by χ about z. | diag(1, e^{iχ}) = e^{iχ/2}R_z(χ); S = P(π/2), T = P(π/4). | `q4-one-qubit-gates:b6` | `l6-equator` |
| `qc-global-phase` | global phase | One phase multiplying the whole state; it changes no chance. | \|ψ⟩ ↦ e^{iγ}\|ψ⟩, the same ray. | `q4-one-qubit-gates:b6` | `l2-complex` |
| `qc-register` | register | Several qubits taken together as one system. | ℂ² ⊗ ⋯ ⊗ ℂ², dimension 2ⁿ. | `q4-registers:b1` | — |
| `qc-tensor-product` | tensor product ⊗ | Two qubits side by side: each joint amplitude is a product of one amplitude from each. | (\|a⟩ ⊗ \|b⟩)_{ij} = a_ib_j. | `q4-registers:b2` | — |
| `qc-cnot` | CNOT | The two-qubit gate that flips the target when the control is \|1⟩. | \|0⟩⟨0\| ⊗ I + \|1⟩⟨1\| ⊗ X. | `q4-cnot:b1` | — |
| `qc-xor` | XOR ⊕ | Adding two bits and forgetting any carry: 1 ⊕ 1 = 0. | Addition mod 2. | `q4-cnot:b2` | — |
| `qc-controlled-gate` | controlled gate | A gate applied to the target only when the control qubit is \|1⟩. | \|0⟩⟨0\| ⊗ I + \|1⟩⟨1\| ⊗ U. | `q4-cnot:b4` | — |
| `qc-circuit` | circuit | Wires for qubits and boxes for gates, read left to right in time. | A product U_K⋯U₁ drawn in time order. | `q4-circuits:b1` | — |
| `qc-bell-state` | Bell state | One of four two-qubit states made by H then CNOT; Φ⁺ = (\|00⟩ + \|11⟩)/√2. | β_xy = (\|0, y⟩ + (−1)^x\|1, ȳ⟩)/√2 (N&C Eq. 1.27). | `q4-circuits:b2` | — |
| `qc-swap-gate` | SWAP | The gate that exchanges two qubits' states. | \|a, b⟩ ↦ \|b, a⟩ = CNOT₀₁CNOT₁₀CNOT₀₁. | `q4-circuits:b3` | — |
| `qc-universal-gate-set` | universal gate set | A few kinds of gate from which every gate can be built. | CNOT and U(2) generate U(2ⁿ). | `q4-circuits:b4` | — |

Reused: `qc-superposition`, `qc-born-rule` (Q1); `qc-hadamard`, `qc-unitary` (Q2); `qc-bloch-sphere`,
`qc-pauli-matrices` (Q3); `qc-amplitude`, `qc-phase` (F1).

## 6. Review card per unit (both tracks)

### `q4-qubit`
- **G points:** (1) A qubit is α\|0⟩ + β\|1⟩, with \|0⟩ = \|+z⟩. (2) Reading gives 0 or 1 with chances \|α\|², \|β\|². (3) It is a point on the sphere; a phase in front changes nothing. (4) One reading gives one bit.
- **F points:** (1) A unit vector of ℂ² up to phase. (2) Bergou Eq. 1.2 = Unit 3.2's \|θ, φ⟩. (3) Any two-level system can be a qubit.
- **Equations:** $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle,\quad |\alpha|^2 + |\beta|^2 = 1$
- **Trap:** thinking a qubit stores its angles for reading: one reading gives one bit.

### `q4-one-qubit-gates`
- **G points:** (1) A gate is a unitary table; X swaps the amplitudes. (2) Z flips the sign of \|1⟩. (3) H makes \|±⟩ and H² = I. (4) Gates turn the sphere; P(χ) and R_z(χ) differ by a global phase.
- **F points:** (1) X = σ_x, Z = σ_z, H = (X + Z)/√2. (2) H = iR_n(π), n̂ = (x̂ + ẑ)/√2. (3) U = e^{iα}R_z(β)R_y(γ)R_z(δ).
- **Equations:** $X = \begin{pmatrix}0&1\\1&0\end{pmatrix},\quad H = \tfrac1{\sqrt2}\begin{pmatrix}1&1\\1&-1\end{pmatrix},\quad P(\chi) = e^{i\chi/2}R_z(\chi)$
- **Trap:** calling H a "square root of NOT": H² = I.

### `q4-registers`
- **G points:** (1) n qubits have 2ⁿ basis strings. (2) Side by side, amplitudes multiply. (3) A label is a binary number. (4) Not every state is a product.
- **F points:** (1) Bergou Eqs. 1.3–1.4. (2) (\|a⟩ ⊗ \|b⟩)_{ij} = a_ib_j. (3) Product iff det[c] = 0.
- **Equations:** $|\Psi\rangle = \sum_{x=0}^{2^n - 1} c_x|x\rangle,\quad (|a\rangle \otimes |b\rangle)_{ij} = a_ib_j$
- **Trap:** reading bars as places in space: they are basis strings.

### `q4-cnot`
- **G points:** (1) CNOT flips the target when the control is 1. (2) B → B ⊕ A. (3) Its table is I with two columns swapped, and CNOT² = I. (4) It copies bits, not qubits.
- **F points:** (1) U_CN = \|0⟩⟨0\| ⊗ I + \|1⟩⟨1\| ⊗ X. (2) CZ is symmetric; CZ = (I ⊗ H)CNOT(I ⊗ H). (3) Unitary ⇒ reversible.
- **Equations:** $|A, B\rangle \mapsto |A, B \oplus A\rangle,\quad U_{CN}^2 = I$
- **Trap:** "CNOT copies ψ": it gives a\|00⟩ + b\|11⟩.

### `q4-circuits`
- **G points:** (1) Wires are time, read left to right. (2) Matrices multiply right to left. (3) H then CNOT makes Φ⁺. (4) Three CNOTs make a SWAP; CNOT and one-qubit gates make everything.
- **F points:** (1) U = U_K⋯U₁. (2) N&C Eq. 1.27. (3) No loops, FANIN or FANOUT.
- **Equations:** $U_{CN}(H \otimes I)|00\rangle = \tfrac1{\sqrt2}(|00\rangle + |11\rangle),\quad \mathrm{SWAP} = \mathrm{CNOT}_{01}\mathrm{CNOT}_{10}\mathrm{CNOT}_{01}$
- **Trap:** writing the matrices in the order the boxes are drawn.

### `q4-measure`
- **G points:** (1) Reading a register gives x with chance \|c_x\|². (2) Reading one qubit adds up the matching chances and rescales what is left. (3) Φ⁺'s readings always agree. (4) H then a reading is a reading in \|±⟩.
- **F points:** (1) N&C Eq. 1.6. (2) N&C Eq. 1.19. (3) The meter and double line.
- **Equations:** $P(q_0 = 0) = |\alpha_{00}|^2 + |\alpha_{01}|^2,\quad P(+) = \tfrac12|\alpha + \beta|^2$
- **Trap:** forgetting to rescale the state left behind.

## 7. Symbol-before-use tables

Abbreviations: qu, ga, re, cn, ci, me. Carried from F1 and Q1–Q3, mapped in `Lecture.symbols` to `q4-qubit` as a recap:
\|ψ⟩, ⟨·\|·⟩, \|±z⟩, \|±x⟩, \|±y⟩, \|0⟩, \|1⟩, α, β, i, e^{iφ}, θ, φ, n̂, †, I, U, H (Unit 2.5), σ_x, σ_y, σ_z, ħ,
\|·\|, P (probability), δ_ij, {A, B}, R_n (448 L6, Formal).

### 7.1 Ground track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| ψ (the running state) | qu:b1 cap | Conventions; qu:b1 | OK | (0.866, 0.5), Q3's ψ. |
| $\vert+\rangle$ | qu:b4 | qu:b4 | OK | N&C's name; equal to \|+x⟩, said in place. |
| $X$, $Z$ | ga:b1, ga:b3 | ga:b1, ga:b3 | OK | X was σ_x in Unit 3.3. |
| $U^\dagger U = I$ | ga:b2 | Unit 2.5 | OK | Link-back. |
| $R_x$, $R_z(\chi)$, $\chi$ | ga:b3 cap, ga:b6 | ga:b6 | **FLAG** | ga:b3's Ground text says "half turn"; R_x appears only in the F cap. χ is a gate angle, not the azimuth φ. |
| $P(\chi)$, $S$, global phase | ga:b6 | ga:b6 | OK | P(χ) here is a gate, not a probability; T only in F. |
| $R_y(60°)$ box | re:b2 stage | ga:b6 (F) | **FLAG** | The circuit draws R_y before Ground defines it; re:b2's G says "the box prepares ψ". |
| $\vert00\rangle$…$\vert11\rangle$, $x$ | re:b1, re:b3 | re:b1, re:b3 | OK | Left digit = qubit 0. |
| $\otimes$ | re:b2 | re:b2 | OK | Tag `qc-tensor-product`. |
| $\oplus$ | cn:b2 | cn:b2 | OK | Tag `qc-xor`; ci:b3 reuses it. |
| Φ⁺ | ci:b2 | ci:b2 | OK | Name only; entanglement is a later chapter's. |
| $c_x$ | me:b1 | re:b3 (F) | OK | "amplitude of x" in G. |

### 7.2 Formal track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $e^{i\gamma}$ | qu:b3 | qu:b3 | OK | N&C Eq. 1.3's γ. |
| $R_n(\chi) = e^{-i\chi\hat n\cdot\vec\sigma/2}$ | ga:b3 | ga:b3 | OK | 448 L6's turn. |
| $R_y(\gamma)$, $R_z(\beta)$, α, β, γ, δ (Box 1.1) | ga:b6 | ga:b6 | **FLAG** | N&C's letters; α, β here are angles, not amplitudes (stated in place). |
| $U_{CN}$, $\vert i\rangle\langle i\vert \otimes U$ | cn:b3, cn:b4 | cn:b3, cn:b4 | OK | Outer products from Unit 2.4. |
| β₀₀, Ψ₊ (Rosetta) | ci:b2 | ci:b2 | OK | Names only. |
| FANIN, FANOUT | ci:b5 | ci:b5 | OK | N&C's words, glossed in place. |

**Counts:** Ground 2 FLAGs, Formal 1 FLAG, all resolved in place.

## 8. Errata

Bergou §1.1–1.3 and N&C §1.2–1.3.6 are right. Items were checked in the maths and, for figures, on the page renders.

### 8.1 Corrections (errata box)
None.

### 8.2 Silent fixes and notes (no box)
| # | Where | Point | Action |
|---|---|---|---|
| — | Bergou p. 3 | "AND … has no quantum version." | True of the two-in, one-out gate; a reversible embedding exists (Toffoli, N&C §1.4.1). Scope note in `q4-cnot:b5` F. |
| — | Bergou p. 4 | C-NOT "also known as the exclusive OR gate". | The target's update is XOR; unlike classical XOR the gate keeps its control and is reversible. `q4-cnot:b2`, b5. |
| — | N&C p. 19, Fig. 1.4 | H as a 90° turn about ŷ, then 180° about x̂. | Exact as a map of the sphere; as matrices H = iR_x(π)R_y(π/2). `q4-one-qubit-gates:b5` F. |
| — | Bergou pp. 2, 5; N&C p. 17 | Qubits numbered 1, 2 (Bergou) and x₁…x_n (N&C). | Our qubit 0 is their first; Rosetta in `q4-registers:b1`. |
| — | N&C p. 14 | Ground \|0⟩, excited \|1⟩. | Prose only; Q4 has no Hamiltonian, so N&C rule E8 does not bite. |

**Checked and correct:** Bergou Eqs. 1.1–1.9 and Figs. 1.1–1.4; the universality statement (p. 5); P1.1, P1.2(b) (the
control ends in e^{iθσ_z}\|ψ⟩ with probability ½), P1.4(a)–(b). N&C Eqs. 1.1–1.6, 1.8–1.14, 1.18–1.22 and 1.23–1.27;
Box 1.1 (1.15)–(1.17); the H² = I remark; the Bell-state correlation (p. 17); the copying argument (pp. 24–25).

## 9. Engine gaps and stage-contract gaps

### 9.1 Engine
**E1 (defect, blocking for Q4 and Q5).** `qc/state.ts` `ket(label)` with a one-character label returns the shared
`KET` array itself (`kronAll([v])` returns `v`), and `runCircuit` starts from it and mutates it in place (`applyOp`).
So any one-qubit circuit run without `psi0` overwrites `KET['+z']` (init `'0'`), `KET['-z']`, `KET['+x']` or
`KET['-x']` for the rest of the session, in both courses. Reproduced: after `runCircuit` on
`{qubits:1, init:'0', columns:[[R_y(π/3)]]}`, `ket('00')` returns (0.75, 0.433, 0.433, 0.25).
Fix: `ket()` returns a copy (or `startState` copies); regression test: run each one-qubit init through a gate and assert
`KET` unchanged (448's spin tests share it). Also check the `amplitudes` resolver's `{ket}`/`{dir}` sources for in-place
scaling (`globalPhaseDeg`). Affects Q4's one-qubit circuits (`C_X` … `C_PSIH`) and every Q5 interferometer circuit.
Fallback: none is safe (an idle padding wire changes the pictures), so fix it first (§12 Q2).

Otherwise none. Existing and sufficient: `qc/gates.ts` (`X`, `Z`, `H`, `P`, `S`, `T`, `Rx`, `Ry`, `Rz`, `cnot`, `cz`,
`SWAP2`, `walshHadamard`), `qc/state.ts` (`ket`, `kron`, `bell`, `indexOfBits`, `bitsOfIndex`, `isProduct`),
`qc/circuit.ts` (`runCircuit`, `circuitUnitary`), `qc/measure.ts` (`probs`, `marginal`, `measureQubit`,
`measureInBasis`), `qc/bits.ts` (`xor`, `truthTable`), `spin.ts` (`ketFromBloch`, `blochVector`, `rotation`,
`samePhysicalState`), `linalg.ts` (`matEq`, `isUnitary`, `matmul`), `qc/cmat.ts` (`kronM`).

### 9.2 Stage contract
No new kinds or fields. Checks for the builder: (a) every split passes `validateLayout`; (b) the one-qubit circuits of E1
render correctly only after the fix; (c) `bloch.rotate` about `{thetaDeg:45, phiDeg:0}` sweeps 180° (ga:b5) and 360°
(ga:b7 reveal) by angle, never as a no-op; (d) `bloch.globalPhaseDeg` (qu:b3) moves no point; (e) the `Ry` glyph reads
"R_y(60°)", else set `GateOp.label`; (f) `amp{ state:{ket:'101'} }` draws 8 bars; (g) inputs `'++'`, `'01'`, `'10'`
are labelled on the wires; (h) if the passport does not say the left digit is qubit 0, `q4-registers:b1`'s caption does.

### 9.3 Widget gaps
**W1 `circuit-lab`** (not essential): a one- or two-qubit gate palette over `runCircuit`, with bars from the engine. It
would serve Q4's units 3–6 and Q5. Fallback: the existing widgets of §3. *Recommend:* defer (§12 Q6).

## 10. Media
- **Part II opener (Blender, deferred):** gold traces of a serialized Deutsch circuit, with amplitude columns rising from
  `runCircuit` states column by column (Q5's `C_D` for f(x) = x; data `q5D1`, `q5D2`, `q5D3`). Blender draws engine
  data only.
- **Film (deferred) `qc-q4-hadamard`** "Hadamard is a half turn about x + z": ψ turned by R_n(π); manifest `q4HPsi`,
  `q4HBloch`, `q4HTurn`, `q4HNC`.
- **Film (deferred) `qc-q4-bell`** "Building a Bell pair, bar by bar": manifest `q4BellMid`, `q4Bell`.
- **Decor (Higgsfield, credits need the user):** gold-plated coax lines, clamps and frost in blue light on a cold stage;
  no text, no numbers, no circuit diagrams.

## 11. Hooks

### 11.1 Concept-map stations
| id | label | chapter · unit | needs | sameAs (448) |
|---|---|---|---|---|
| `qc-qubit` | The qubit: two levels, one sphere | Q4 · `q4-qubit` | `qc-superposition`, `qc-bloch-sphere` | — |
| `qc-one-qubit-gates` | One-qubit gates as turns of the sphere | Q4 · `q4-one-qubit-gates` | `qc-qubit`, `qc-spin-operators`, `qc-change-of-basis` | — |
| `qc-registers` | Registers and the tensor product | Q4 · `q4-registers` | `qc-qubit`, `qc-vector-space` | — |
| `qc-cnot` | CNOT and controlled gates | Q4 · `q4-cnot` | `qc-registers`, `qc-one-qubit-gates` | — |
| `qc-circuits` | Circuits, Bell pairs and SWAP | Q4 · `q4-circuits` | `qc-cnot` | — |
| `qc-readout` | Reading a register | Q4 · `q4-measure` | `qc-circuits`, `qc-born-projector` | — |

New bridge id to register in `content/qc709/bridges.ts`: `qc-l6-active` (448's unit exists). All other bridge ids
used here exist.

**Future bridges (TODO; targets not built):** F6 ⊗ (`q4-registers:b2`), F7 XOR (`q4-cnot:b2`), Q8 entanglement
(`q4-registers:b5`, `q4-circuits:b2`), Q9 teleportation (`q4-measure:b2`), no-cloning (`q4-cnot:b6`), Q21 Holevo (`q4-qubit:b5`).

### 11.2 Arcade (5 levels)
Label constant: `const Q4x = (unit, label) => ({ lecture: 'Q4', unit, label })`.
1. **`q4-qubit` · Route the beam · `qc-quarter-plus`** — "A quarter on the plus spot"
   - Level: `source:'+z'`, `target:{spot:'plus', fraction:0.25, label:'¼'}`, `maxDevices:1`, `start:{axes:['z'], keep:[]}` (gives 1).
   - Hint: "A state tipped θ from the north pole reads + with chance cos²(θ/2)."
   - Why: a magnet tilted 120° passes cos²60° = ¼ (`q4ArcSg`), the qubit of `q4-q-theta`; −120° works too (`q4ArcSgNeg`).
   - `solution:{axes:[120], keep:[]}`.
2. **`q4-one-qubit-gates` · Bloch golf · `qc-golf-h-on-one`** — "H on |1⟩"
   - `start:'-z'`, `target:'-x'`, `par:1`, `solution:[{axis:'y', sign:1}]`.
   - Hint: "H sends |1⟩ to |−⟩. Which quarter turn takes the south pole there?" Why: R_y(+90°) carries −z to −x; H gets there by a half turn about (x̂ + ẑ)/√2 (`q4HTurn`).
3. **`q4-cnot` · Spot the error · `qc-cnot-copies`** — "A CNOT copier"
   - Steps: "CNOT maps $|0\rangle|0\rangle$ to $|0\rangle|0\rangle$ and $|1\rangle|0\rangle$ to $|1\rangle|1\rangle$." · "So it copies the control's bit onto a blank target." · "A qubit $a|0\rangle + b|1\rangle$ is a sum of those two inputs." · "So CNOT turns $(a|0\rangle + b|1\rangle)|0\rangle$ into two copies of the qubit."
   - `wrong: 3`. Why: linearity gives a\|00⟩ + b\|11⟩, not the product of two copies (`q4CopyFails`; N&C Eqs. 1.21–1.22).
4. **`q4-circuits` · Spot the error · `qc-circuit-order`** — "Reading order"
   - Steps: "The circuit applies $H$ to $|0\rangle$, then $Z$." · "The first gate drawn acts first on the state." · "So the circuit's matrix is $HZ$." · "$HZ|0\rangle = |+\rangle$."
   - `wrong: 2`. Why: the first gate stands next to the ket, so the matrix is ZH, and ZH\|0⟩ = \|−⟩ (`q4CircOrder`).
5. **`q4-measure` · Spot the error · `qc-plus-chance-square`** — "Squaring, not sizing"
   - Steps: "$\psi = 0.6|0\rangle + 0.8i|1\rangle$." · "In the $|\pm\rangle$ basis the $+$ amplitude is $(\alpha + \beta)/\sqrt2$." · "Its chance is $(\alpha + \beta)^2/2 = (0.6 + 0.8i)^2/2$." · "So $P(+) = -0.14 + 0.48i$."
   - `wrong: 2`. Why: a chance is a size squared, \|α + β\|²/2 = 0.5 (`q4ArcPlus`); the wrong step's value is `q4ArcWrong`.

## 12. Questions for the judge

**Q1. Phase value without notes.** No instructor notes cover Q4 or Q5, and `'core'` is lint-restricted to F chapters.
*Recommend:* `'lecture'` for [L] beats, with Bergou or N&C as each beat's cited source; if Lecture 4–5 notes are
ingested later, one pass adds their Rosetta lines and any [B] beats.

**Q2. Engine defect E1.** A one-qubit `runCircuit` overwrites the shared `KET` constants (§9.1). *Recommend:* the Q4 build
agent fixes it first, with a regression test (skill `11-engine-module`), as ruling Q2-4 did for S1–S2. Q5 builds after
that merge.

**Q3. Inline tensor product and XOR.** F6 and F7 are not built, so Q4 teaches ⊗ (`q4-registers:b2`) and ⊕
(`q4-cnot:b2`) in one beat each, with glossary entries `qc-tensor-product` and `qc-xor`. *Recommend:* Q4 owns both
entries now; when F6 and F7 are planned they take ownership and Q4's beats become link-backs.

**Q4. Bergou's Chapter 1 problems.** Q4 works ⚑ P1.1 (D4, `q4-g-h`, `q4-c-entry`), P1.4(a) (D7) and P1.4(b)
(`q4-cnot:b4`) in full. No sheet assigns them today. *Recommend:* keep the walkthroughs; when a new 709 sheet is ingested,
ask the user, and turn any assigned item to `walkthrough: []`.

**Q5. Previews of entanglement.** Φ⁺ (`q4-circuits:b2`), the product test (`q4-registers:b5`) and the Bell correlations
(`q4-measure:b3`) touch Q8's subject. *Recommend:* keep them as named previews, with no entanglement measure and a TODO
bridge to Q8.

**Q6. Widget W1 (`circuit-lab`).** *Recommend:* defer under the usage cap; the §3 fallbacks carry units 3–6.
