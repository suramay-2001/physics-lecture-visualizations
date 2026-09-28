# P-Q2-story — Q2 "Coordinates, bases and turning frames" (role P, Physics 709)

Proposal only. Nothing under `app/` is modified. Format: `P-Q1-story.md` (two tracks, bridges, the same 13 sections).
Map entry: `P-709-map.md` §2 Q2; rulings: `decisions/qc709-map.md`, `qc709-pilots.md` (with its amendment),
`qc709-nc.md`, `homework-status.md`. Q2 is the notes' Lecture 2 (9/9), so it is also the chapter's Read mode.

**Sources read.**
- 709 notes Lecture 2, pp. 6–10: the text layer (`sources/qc709-n2/text.md`) and all five page renders, by eye. The
  renders add Fig. 4 (Gram–Schmidt in 3D, with the shaded span), Fig. 5 (the |±x⟩ frame at ±45° with 1/√2 ticks and
  the caption's two warnings), Fig. 6 (a turn plus a uniform stretch keeps a right angle) and the highlights: "linearly
  independent", the unique-components theorem, c_i = ⟨e_i|ψ⟩, U_ij = ⟨α'_i|α_j⟩, "An operator is unitary".
- Bergou 2e: Eq. 1.8, p. 4 (H; PDF 19); §14.2, p. 257 (polarization qubit; PDF 263, render checked).
- Axler 4e (printed = PDF − 14): 2.15 p. 32, 2.28 p. 39, 2.35 p. 44, 3.29–3.31 p. 69, 3.82 p. 92, 3.84 p. 93, 5.1 p. 133,
  6.27–6.28 p. 199, 6.30 p. 200, 6.32–6.33 p. 201.
- N&C (printed = PDF − 28): §1.3.3 p. 22 (Eq. 1.19), Eq. 2.12 p. 64, p. 66 (Gram–Schmidt, Ex. 2.8), Eq. 2.22 p. 67,
  Eq. 2.25 p. 68, Ex. 2.20 p. 71.
- Overlaps: 448 `l2-inner-product`, `l2-three-bases`, `l3-operators`, `l4-basis`, `l5-coordinates`, `l5-operators`,
  `l5-invariance`, `l6-generator`, `l7-two-angles`; 709 F1 (`f1-phase:b6` owns δ₋ = π) and Q1 (all five units).
- Homework: every current sheet is submitted (`homework-status.md`), including HW1 P5 (spin-1 Gram–Schmidt). No guard
  binds Q2; its worked examples still differ from HW1's.

**Evidence.** Every number was computed twice: by the app's engine (`q23plan-engine.ts`, bundled into the scratchpad
with the repo's rolldown; read-only imports of `physics/{complex,linalg,spin,sg,operators}.ts` and
`physics/qc/{cmat,gates,state,measure}.ts`) and by an independent numpy script (`q23plan-numpy.py`). They agree on all
592 numbers (164 keys, both chapters) to 2 × 10⁻⁶.

**Conventions.**
- Beat ids, phases [L]/[B]/[C], tracks **G** (≤ 25 words per sentence) and **F** (≤ 40), captions and claims: as in
  `P-Q1-story.md`. [L] = the notes say it.
- Stage shorthand as Q1: `plane{…}` = `{kind:'hilbert-plane', shot:'H-FLAT', …}`; `amp{…}` = `{kind:'amplitudes',
  shot:'A-BARS', …}`; `lab{…}` with `main(src, devices)`; `Z = {axis:'z'}`. `zB` = the two basis entries
  `{ket:'±z', role:'basis'}`. Q2 uses no sphere and no operator space: the sphere is Q3's, and the operator-space
  passport names eigenvalues, which Q3 defines.
- **ψ** = the chapter's running state, the plane arrow at 30°: `{planeDeg:30}` = `ketFromBloch(π/3, 0)` = (0.866, 0.5).
- **Photon angle χ** (the notes' ϕ), because φ is the Bloch azimuth; χ is also 448's polarizer angle. Every photon
  picture uses χ = 45°.
- **Rosetta lines** (each once): `q2-spin-space:b1` cap F (the notes' |→⟩, |←⟩ and N&C's |±⟩ are |±x⟩; R and L are
  kept for light); `q2-change:b1` cap F (U = 448's B†, C7); `q2-photon:b1` cap F (ϕ → χ; |x⟩ is not |+x⟩; Bergou's
  |0⟩ = |H⟩ = |x⟩).
- **Unit order.** The map lists `q2-change` before `q2-operators`. This plan swaps them (notes p. 10 before pp. 8–9's
  operator half), so A_ij, outer products and |e_i⟩⟨e_j| exist before A' = UAU† needs them (§12 Q1).

## 0. Chapter map

Q2 answers the map's question: **"The same arrow can wear different coordinates: how do we translate between them
without changing any prediction?"**

| # | id | Title (≤ 8 words) | Driving question | Sources | 448 bridges | Link-backs |
|---|---|---|---|---|---|---|
| 1 | `q2-basis` | Independent arrows and a basis | When does a set of arrows give every vector one, and only one, address? | notes p. 6; Axler 2.15, 2.28, 2.35, 6.27–6.30 | `l4-basis`, `l2-inner-product` | Unit 1.4 (zero vector), 1.5 (inner product) |
| 2 | `q2-gram-schmidt` | Straightening a basis with Gram–Schmidt | How do we turn independent arrows into an orthonormal basis? | notes pp. 6–7, Fig. 4; Axler 6.32; N&C p. 66 | `l4-basis` | Unit 1.5 (the bra's conjugate) |
| 3 | `q2-spin-space` | Spin states in the z and x frames | How do the notes pin down the numbers in \|±x⟩, and how do we go back? | notes pp. 7–8, Eqs. 1.1–1.2, Fig. 5 | `l2-three-bases`, `l7-two-angles` | Unit 1.2 (½ and ½), F1.5 (δ₋) |
| 4 | `q2-operators` | Operators, outer products and their tables | What does an operator do to arrows, and how does a basis turn it into a table? | notes p. 10, Fig. 6; Axler 3.31, 5.1; N&C Eqs. 2.12, 2.25 | `l3-operators` | Unit 1.5 (bras) |
| 5 | `q2-change` | Changing coordinates with one matrix | How do the numbers of a state, and of an operator, change with the basis? | notes pp. 8–9, Eq. 1.3; Bergou Eq. 1.8; Axler 3.82–3.84; N&C Eq. 1.19, Ex. 2.20 | `l5-coordinates`, `l5-operators`, `l5-invariance` | Units 2.1, 2.3, 2.4 |
| 6 | `q2-photon` | Turning the frame of a photon | Why does turning the polarizer frame only put a phase on circular light? | notes p. 9; Bergou §14.2 p. 257 | `l1-average`, `l6-generator`, `l7-two-angles` | Units 2.5; F1 (Euler) |

**Outcomes** (Ground wording):
- Test whether arrows are independent, and find a vector's components in a basis.
- Turn independent arrows into an orthonormal basis with Gram–Schmidt.
- Derive |±x⟩ from the Stern–Gerlach facts, and write |±z⟩ back in the x basis.
- Read an operator as a table, and build one from outer products.
- Change a state's coordinates with U, and an operator's table with UAU†.
- Show that turning a polarizer frame changes |x⟩ but only puts a phase on |R⟩, and read J_z = ±ħ from it.

**Prerequisites** (concepts): Q1 `qc-inner-product`, `qc-vector-space`, `qc-superposition`; F1 `qc-phase`, `qc-euler`.
448 twins: `principles`, `mutually-unbiased`, `operators`, `basis-change`, `rz`.

**Openers and films.** No opener (Part I's is Q1's). Films deferred (§10).

## 1. Story beats per unit

Stage kinds: `hilbert-plane` (units 1–6), `amplitudes` (units 2, 3, 6), `lab-r3` (unit 3, b2). Fidelity items used:
448's `plane-real-slice`, `plane-half-angles`, `plane-bloch-doubles`, `plane-frame-turn-passive`,
`plane-image-not-state`, `lab-prepared-offstage`; 709's `qc-plane-vectors-not-states`, `qc-amp-hue-is-phase`.

### Unit `q2-basis` — Independent arrows and a basis

**`q2-basis:b1` [L]** (linear independence)
- **G:** "A set of arrows is [[qc-linearly-independent|linearly independent]] when no mix of them adds to the zero vector, unless every number in the mix is zero. Otherwise one arrow can be built from the others. For example, |+x⟩ is (|+z⟩ + |−z⟩)/√2, so these three arrows are dependent."
- **F:** "{|α_1⟩, …, |α_n⟩} ⊂ V is linearly independent (LI) if Σ_i c_i|α_i⟩ = 0 forces every c_i = 0, and linearly dependent (LD) otherwise (notes p. 6; Axler 2.15, p. 32). In V²(ℂ), |+x⟩ − (|+z⟩ + |−z⟩)/√2 = 0 is a dependence."
- **Cap:** G "|+x⟩ lies along |+z⟩ + |−z⟩: the three are dependent" · F "‖|+x⟩ − (|+z⟩ + |−z⟩)/√2‖ = 0"
- **Stage:** `plane{ psi:'+x', others:zB, sumOf:['+z','-z'] }` (the sum, length 1.414, lies along |+x⟩); flag `qc-plane-vectors-not-states`.
- **Claims:** `q2Dep` — `norm(vsub(KET['+x'], vscale(vadd(KET['+z'], KET['-z']), Math.SQRT1_2)))` → 0 · `q2DepZZX` — `isIndependent([+z, −z, +x])` → false.
- **Bridge (G):** "<<qc-l4-basis|Spin Lab 4.1>> builds bases from the same idea."

**`q2-basis:b2` [L]** (dimension)
- **G:** "In a flat plane, two arrows that point different ways are independent, but a third is always a mix of them. The largest number of independent arrows is the [[qc-dimension|dimension]]. It is 2 for the plane and for a qubit's space V²(ℂ)."
- **F:** "V(F) is n-dimensional if its largest LI set has n members (notes p. 6; Axler 2.35, p. 44). V²(ℂ) has dimension 2 over ℂ: |+z⟩, |+x⟩ is LI although not orthogonal, while |+z⟩, |−z⟩, |+x⟩ has rank 2."
- **Cap:** G "|+z⟩ and |+x⟩: independent, 45° apart" · F "rank(|+z⟩, |−z⟩, |+x⟩) = 2"
- **Stage:** `plane{ psi:'+x', others:[{ket:'+z', role:'basis'}], arc:true, arcLabel:'$45^\circ$' }`.
- **Claims:** `q2IndepZX` — `isIndependent([+z, +x])` → true · `q2Dim` — `rankN(fromColumns([+z, −z, +x]))` → 2 · `q2Ang[0]` — `angleBetween(+z, +x)` → 45°.

**`q2-basis:b3` [L]** (a basis and unique components; D1)
- **G:** "Take n independent arrows in a space of dimension n. Every vector is a mix of them, and the mixing numbers are unique: no second recipe exists. The arrows form a [[qc-basis|basis]], and the numbers are the vector's [[qc-component|components]]. The arrow ψ at 30° is 0.866 of |+z⟩ plus 0.5 of |−z⟩."
- **F:** "If {|e_1⟩, …, |e_n⟩} is LI in Vⁿ, each |α⟩ ∈ Vⁿ has a unique expansion |α⟩ = Σ_i c_i|e_i⟩ (notes p. 6; Axler 2.28, p. 39): two expansions would differ by Σ_i(c_i − c'_i)|e_i⟩ = 0 (D1). The statement's V^N and |α_i⟩ read Vⁿ and |e_i⟩ (N3)."
- **Cap:** G "ψ = 0.866 |+z⟩ + 0.5 |−z⟩" · F "components of ψ in {|±z⟩}: (0.866, 0.5)"
- **Stage:** `plane{ psi:{planeDeg:30}, basis:'z', shadows:true }`.
- **Derivation:** D1 (§2).
- **Claims:** `q2Comp30` — `components(ψ, [+z, −z])` → (0.8660, 0.5).

**`q2-basis:b4` [L]** (orthonormal)
- **G:** "A basis is [[qc-orthonormal|orthonormal]] when its arrows are at right angles to each other and each has length 1. In symbols ⟨e_i|e_j⟩ = δ_ij, where the [[qc-kronecker-delta|Kronecker delta]] δ_ij is 1 if i = j and 0 if not."
- **F:** "The |α_i⟩ are orthonormal (ON) when ⟨α_i|α_j⟩ = δ_ij: pairwise orthogonal, each of norm 1 (notes p. 6; Axler 6.27, p. 199). An ON list of length n in Vⁿ is LI, hence a basis (Axler 6.28)."
- **Cap:** G "|+z⟩ and |−z⟩: at right angles, each of length 1" · F "⟨+z|−z⟩ = 0, ⟨±z|±z⟩ = 1"
- **Stage:** `plane{ psi:'+z', others:[{ket:'-z', role:'basis'}], rightAngle:true }`.
- **Claims:** `q2Orth` — `inner(+z, −z)` → 0.

**`q2-basis:b5` [L]** (components are overlaps)
- **G:** "In an orthonormal basis a component is just an overlap: c_i = ⟨e_i|ψ⟩. Apply the bra ⟨e_j| to ψ = Σ c_i|e_i⟩, and δ_ij keeps only c_j. In the basis |+x⟩, |−x⟩, ψ has components 0.966 and 0.259."
- **F:** "In an ON basis ⟨e_j|ψ⟩ = Σ_i c_i⟨e_j|e_i⟩ = Σ_i c_iδ_ji = c_j (notes p. 6; Axler 6.30, p. 200, whose ⟨v, e_k⟩ is our ⟨e_k|v⟩). For ψ, (⟨+x|ψ⟩, ⟨−x|ψ⟩) = (0.966, 0.259)."
- **Cap:** G "ψ in the x frame: 0.966 and 0.259" · F "c_x(ψ) = (0.966, 0.259)"
- **Stage:** `plane{ psi:{planeDeg:30}, basis:'x', shadows:true }`; flag `plane-frame-turn-passive`.
- **Claims:** `q2Comp30x` — `components(ψ, [+x, −x])` → (0.9659, 0.2588), equal to `inner(±x, ψ)`.
- **Bridge (G):** "<<qc-l2-inner-product|Spin Lab 2.2>> reads coordinates the same way."

**`q2-basis:b6` [C]** (a slanted basis)
- **Q G:** "|+z⟩ and |+x⟩ are independent, so they form a basis of the plane. Are the components of |−z⟩ in this basis its overlaps with them?"
- **Q F:** "In the non-orthogonal basis {|+z⟩, |+x⟩}, is c_i = ⟨e_i|−z⟩?"
- **Reveal G:** "No. |−z⟩ = −|+z⟩ + √2|+x⟩, so its components are −1 and 1.414. The overlaps are 0 and 0.707. The shortcut c_i = ⟨e_i|ψ⟩ needs an orthonormal basis."
- **Reveal F:** "No: the unique solution of |−z⟩ = c_1|+z⟩ + c_2|+x⟩ is (−1, √2), while (⟨+z|−z⟩, ⟨+x|−z⟩) = (0, 0.707). Reading components as overlaps needs ⟨e_i|e_j⟩ = δ_ij."
- **Reveal cap:** G/F "components (−1, 1.414); overlaps (0, 0.707)"
- **Stage:** question and reveal `plane{ psi:'-z', others:[{ket:'+z', role:'basis'}, {ket:'+x', role:'second'}] }` (no readouts; the caption carries the numbers).
- **Claims:** `q2NonOrth` — `components(−z, [+z, +x])` → (−1, 1.4142) · `q2NonOrthOv` — `inner(+z, −z)`, `inner(+x, −z)` → 0, 0.7071.

### Unit `q2-gram-schmidt` — Straightening a basis with Gram–Schmidt

**`q2-gram-schmidt:b1` [L]** (the task)
- **G:** "Independent arrows need not be at right angles. The [[qc-gram-schmidt|Gram–Schmidt procedure]] turns any independent set into an orthonormal one, one arrow at a time. Try it on |β_1⟩ = |+z⟩ and |β_2⟩, the arrow at 60°; their overlap is 0.5."
- **F:** "Gram–Schmidt maps an LI list {|β_1⟩, …, |β_n⟩} to an ON list {|α_1⟩, …, |α_n⟩} with the same span at every step (notes p. 6; Axler 6.32–6.33, p. 201). Example: |β_1⟩ = |+z⟩, |β_2⟩ = (0.5, 0.866), ⟨β_1|β_2⟩ = 0.5."
- **Cap:** G "two independent arrows, 60° apart" · F "⟨β_1|β_2⟩ = 0.5 ≠ 0"
- **Stage:** `plane{ psi:{planeDeg:60}, others:[{ket:'+z', role:'basis'}], arc:true, arcLabel:'$60^\circ$' }`.
- **Claims:** `q2Gs60` — `inner(+z, plane(60))` → 0.5.
- **Note:** |β_j⟩ and |α'_j⟩ are the notes' letters for arrows; from Unit 2.3 on, α and β are numbers (§7).

**`q2-gram-schmidt:b2` [L]** (take away the shadow)
- **G:** "Keep the first arrow: |α'_1⟩ = |β_1⟩. From |β_2⟩ take away its shadow on |α'_1⟩, which is 0.5 of |α'_1⟩. What is left, |α'_2⟩, stands at right angles to |α'_1⟩ and is 0.866 long."
- **F:** "|α'_2⟩ = |β_2⟩ − |α'_1⟩⟨α'_1|β_2⟩/⟨α'_1|α'_1⟩ = (0, 0.866), and ⟨α'_1|α'_2⟩ = ⟨β_1|β_2⟩ − ⟨β_1|β_2⟩ = 0 by construction (N&C ⚑ Ex. 2.8, p. 66, asks for the general proof; no sheet assigns it)."
- **Cap:** G "what is left: 0.866 long, straight up" · F "|α'_2⟩ = (0, 0.866), ⟨α'_1|α'_2⟩ = 0"
- **Stage:** `plane{ psi:{planeDeg:60}, basis:'z', project:2 }` (readout |P̂ψ| = 0.866).
- **Claims:** `q2GsRes` — `gramSchmidt([+z, plane(60)]).steps[1].residual` → (0, 0.8660) · `q2GsResOrth` — `inner(+z, residual)` → 0.

**`q2-gram-schmidt:b3` [L]** (rescale)
- **G:** "Last, divide each leftover by its length so that it has length 1. Here |α_2⟩ = |α'_2⟩/0.866 = |−z⟩. So |+z⟩ and |−z⟩ are the orthonormal basis the recipe builds."
- **F:** "|α_i⟩ = |α'_i⟩/√⟨α'_i|α'_i⟩ (notes p. 6). The notes rescale at the end, Axler at each step; since each projection divides by ⟨α'_i|α'_i⟩, both give the same list."
- **Cap:** G "rescaled to length 1: the leftover becomes |−z⟩" · F "|α_2⟩ = |α'_2⟩/0.866 = |−z⟩"
- **Stage:** `plane{ psi:{planeDeg:60}, basis:'z', project:2, renormalize:true }` (readout "1.000 · rescaled"). The drawer's `plane-update-bookkeeping` names Rule 3; here the rescaling is Gram–Schmidt's (§9.2 note).
- **Claims:** `q2GsE2` — `gramSchmidt([+z, plane(60)]).steps[1].e` → (0, 1).

**`q2-gram-schmidt:b4` [L]** (the general recipe; Fig. 4)
- **G:** "With more arrows, repeat. From each new arrow take away its shadows on all the arrows already made, then rescale. In three dimensions the third arrow loses its shadow on the flat plane of the first two, as in the notes' Fig. 4."
- **F:** "|α'_j⟩ = |β_j⟩ − Σ_{i<j}|α'_i⟩⟨α'_i|β_j⟩/⟨α'_i|α'_i⟩ (notes p. 6, Fig. 4). From (1, 1, 0), (1, 0, 1), (0, 1, 1): |α'_2⟩ = (0.5, −0.5, 1), |α'_3⟩ = (−0.667, 0.667, 0.667), mutually orthogonal."
- **Cap:** G "(1, 1, 0), (1, 0, 1), (0, 1, 1) become three arrows at right angles" · F "|α'_3⟩ = (−0.667, 0.667, 0.667)"
- **Stage:** as b3 (a 3D picture needs `vector-3d`, deferred by ruling 5; the caption carries the 3D numbers).
- **Claims:** `q2Gs3DRes` — `gramSchmidt([(1,1,0), (1,0,1), (0,1,1)]).steps[k].residual` → (0.5, −0.5, 1), (−0.6667, 0.6667, 0.6667) · `q2Gs3DOrth` — pairwise `inner` of the basis → 0, 0, 0.

**`q2-gram-schmidt:b5` [B]** (complex arrows)
- **G:** "The recipe works with complex numbers too; each shadow uses the bra, whose numbers are conjugated (Unit 1.5). Start from |+y⟩ = (1, i)/√2, then |+z⟩. The leftover is (0.5, −0.5i), which rescales to |−y⟩ = (1, −i)/√2."
- **F:** "With |β_1⟩ = |+y⟩, |β_2⟩ = |+z⟩: ⟨+y|+z⟩ = 1/√2, |α'_2⟩ = |+z⟩ − |+y⟩/√2 = (1/2, −i/2), and |α_2⟩ = |−y⟩ exactly. N&C give the same recipe on p. 66."
- **Cap:** G/F "from |+y⟩ and |+z⟩, Gram–Schmidt builds |+y⟩, |−y⟩"
- **Stage:** `amp{ state:{dir:'-y'}, dials:true, labels:'spin' }`.
- **Refs:** N&C p. 66.
- **Claims:** `q2GsYOv` — `inner(+y, +z)` → 0.7071 · `q2GsYRes` — residual → (0.5, −0.5i) · `q2GsYE2` — `gramSchmidt([+y, +z]).basis[1]` equals `KET['-y']` → true.

**`q2-gram-schmidt:b6` [C]** (dependent input)
- **Q G:** "Feed the recipe three arrows of the plane: |+z⟩, |−z⟩ and |+x⟩. What does it make of the third?"
- **Q F:** "Apply Gram–Schmidt to the LD list |+z⟩, |−z⟩, |+x⟩ in V². What is |α'_3⟩?"
- **Reveal G:** "Nothing. Its shadows on |+z⟩ and |−z⟩ make up all of |+x⟩, so the leftover is the zero vector. It cannot be rescaled, so the recipe stops at two arrows. A zero leftover is how Gram–Schmidt detects dependence."
- **Reveal F:** "|α'_3⟩ = |+x⟩ − |+z⟩⟨+z|+x⟩ − |−z⟩⟨−z|+x⟩ = 0: the list was LD, and the output has dim V² = 2 members."
- **Reveal cap:** G/F "leftover of |+x⟩: the zero vector; two arrows out"
- **Stage:** question `plane{ psi:'+x', others:zB }`; reveal `plane{ psi:'+x', basis:'z', shadows:true }`.
- **Claims:** `q2GsDep` — `gramSchmidt([+z, −z, +x]).basis.length` → 2; reuses `q2Dep` → 0.

### Unit `q2-spin-space` — Spin states in the z and x frames

**`q2-spin-space:b1` [L]** (amplitudes)
- **G:** "A spin state is |ψ⟩ = α|+z⟩ + β|−z⟩. Here α and β are numbers, its components in the z basis, called [[qc-amplitude|probability amplitudes]]. They may be complex: for α = 0.866 and β = 0.5i, the chances along z are 0.75 and 0.25."
- **F:** "In {|±z⟩} the components α = ⟨+z|ψ⟩, β = ⟨−z|ψ⟩ are the probability amplitudes (notes p. 7); Bergou and N&C write α|0⟩ + β|1⟩ with |0⟩ ≡ |+z⟩ (C1). For (0.866, 0.5i): P(±z) = 0.75, 0.25."
- **Cap:** G "amplitudes 0.866 and 0.5i: chances 0.75 and 0.25" · F "Rosetta: the notes' |→⟩, |←⟩ and N&C's |±⟩ are |±x⟩ here; R and L are kept for light (Unit 2.6)"
- **Stage:** `amp{ state:{dir:{thetaDeg:60, phiDeg:90}}, dials:true, labels:'spin' }`.
- **Claims:** `q2AmpEx` — `ketFromBloch(π/3, π/2)` → (0.8660, 0.5i) · `q2AmpExP` — `prob(±z, ·)` → 0.75, 0.25.

**`q2-spin-space:b2` [L]** (|α| = |β| for the x states)
- **G:** "Atoms from the + beam of an x magnet split half and half in a z magnet (Unit 1.2). So |+x⟩ has |α|² = |β|² = ½: both amplitudes have size 1/√2 = 0.707. Nothing in the experiment prefers up to down along z."
- **F:** "Write |s_x = ±⟩ = α|+z⟩ + e^{iδ±}β|−z⟩ with α, β ≥ 0. The equal SG_z statistics of |±x⟩, which the z → −z symmetry of the set-up requires, give α = β = 1/√2 (notes p. 7)."
- **Cap:** G/F "|+x⟩ atoms in a z magnet: ½ and ½"
- **Stage:** `lab{ benches:[main('+x', [Z])], readouts:['fractions'], shot:'L-PLATE' }`; flag `lab-prepared-offstage`.
- **Claims:** `q2XHalf` — `benchTheory({source:'+x', axes:['z'], keep:[]})` → 0.5, 0.5.

**`q2-spin-space:b3` [L]** (a choice and a consequence; link-back to F1.5)
- **G:** "Chapter F1 showed that turning both amplitudes together changes nothing (Unit F1.5). So the notes may take δ₊ = 0 for |+x⟩. Then |−x⟩ has no choice left: it must be at right angles to |+x⟩, and that forces δ₋ = 180°, a minus sign."
- **F:** "⟨+x|−x⟩ = ½(1 + e^{i(δ₋ − δ₊)}) = 0 forces δ₋ − δ₊ = π; δ₊ = 0 with α real is the convention (N19: the notes 'choose' both). Hence Eqs. 1.1–1.2: |±x⟩ = (|+z⟩ ± |−z⟩)/√2, the columns (1, ±1)/√2."
- **Cap:** G "|−x⟩: the second amplitude points the opposite way" · F "|⟨+x|ψ_δ⟩| = 1, 0.707, 0 at δ = 0°, 90°, 180°"
- **Stage:** `amp{ state:{dir:'-x'}, dials:true, labels:'spin' }`.
- **Claims:** `q2XOrth` — `inner(+x, −x)` → 0 · `q2Delta` — `abs(inner(+x, normalize(vec(1, expi(δ)))))` at δ = 0, π/2, π → 1, 0.7071, 0.

**`q2-spin-space:b4` [L]** (going back)
- **G:** "Add the two equations: the |−z⟩ parts cancel, and |+z⟩ = (|+x⟩ + |−x⟩)/√2. Subtract them instead: |−z⟩ = (|+x⟩ − |−x⟩)/√2. These are the z states written in the x basis."
- **F:** "Adding and subtracting Eqs. 1.1–1.2 gives |±z⟩ = (|+x⟩ ± |−x⟩)/√2 (notes pp. 7–8): the γ₁ = γ₂ = 1/√2 that the z → x → z experiment implies, and the inverse change of basis."
- **Cap:** G "|+z⟩ in the x frame: 0.707 and 0.707" · F "|+z⟩ = (|+x⟩ + |−x⟩)/√2"
- **Stage:** `plane{ psi:'+z', basis:'x', shadows:true }`.
- **Claims:** `q2ZfromX` — `vscale(vadd(+x, −x), 1/√2)`, `vscale(vsub(+x, −x), 1/√2)` → (1, 0), (0, 1).

**`q2-spin-space:b5` [L]** (Fig. 5: the x frame is the z frame turned by 45°)
- **G:** "Draw |+z⟩ across and |−z⟩ up. Then |+x⟩ is the diagonal at 45°, and |−x⟩ points 45° below: the x frame is the z frame turned by 45°. In the lab +x and −x are opposite, yet here they are only 90° apart."
- **F:** "Fig. 5 (notes p. 8): {|±x⟩} is {|±z⟩} rotated by 45° in the real slice. State angles are half the sphere's: ⟨+x|−x⟩ = 0 at 90° here is 180° on Chapter Q3's sphere <<qc-l7-two-angles|sphere angles are twice state angles>>. Complex states such as |+y⟩ leave this slice."
- **Cap:** G "the x frame: the z frame turned by 45°" · F "45° between |+z⟩ and |+x⟩; |+x⟩, |−x⟩: 90° here, 180° on the sphere"
- **Stage:** `plane{ psi:'+x', basis:'x', others:zB, ticks:true }`; flags `plane-half-angles`, `plane-bloch-doubles`, `plane-real-slice`.
- **Claims:** `q2Ang` — `angleBetween(+z, +x)`, `angleBetween(+x, −x)`, `blochAngle(+x, −x)` → 45°, 90°, 180°.
- **Bridge (G):** "<<qc-l2-three-bases|Spin Lab 2.5>> meets the third frame, y."

**`q2-spin-space:b6` [C]** (why not 90°?)
- **Q G:** "Could the notes have chosen δ₋ = 90° instead, making the second state (|+z⟩ + i|−z⟩)/√2?"
- **Q F:** "Is (|+z⟩ + e^{iπ/2}|−z⟩)/√2 an admissible |−x⟩?"
- **Reveal G:** "No. That state is |+y⟩, and an x magnet passes it on its + side half the time. |−x⟩ must never land on that side, so its overlap with |+x⟩ must be 0. Only 180° gives that."
- **Reveal F:** "No: |⟨+x|ψ_{π/2}⟩|² = 0.5 and ψ_{π/2} = |+y⟩ (Unit 1.3), unbiased with respect to {|±x⟩}. Orthogonality to |+x⟩ forces δ₋ = π."
- **Reveal cap:** G/F "(|+z⟩ + i|−z⟩)/√2 is |+y⟩: chance 0.5 of +x, not 0"
- **Stage:** question and reveal `amp{ state:{dir:'+y'}, dials:true, labels:'spin' }` (z-basis bars only; the x chance is in the caption).
- **Claims:** `q2Delta90` — `prob(+x, normalize(vec(1, I)))` → 0.5, and `samePhysicalState(·, KET['+y'])` → true.

### Unit `q2-operators` — Operators, outer products and their tables

**`q2-operators:b1` [L]** (linear operators)
- **G:** "A [[qc-linear-operator|linear operator]] A turns each vector |ψ⟩ of a space into another vector A|ψ⟩ of the same space. It respects mixing: A(a|ψ_1⟩ + b|ψ_2⟩) = aA|ψ_1⟩ + bA|ψ_2⟩ for any numbers a and b."
- **F:** "A linear operator is a linear map of V into itself, A(a|ψ_1⟩ + b|ψ_2⟩) = aA|ψ_1⟩ + bA|ψ_2⟩ (notes p. 10; Axler 5.1, p. 133). The notes say 'onto'; Unit 1.2's projector |+z⟩⟨+z| is linear but reaches only one line (N20)."
- **Cap:** G "an operator: one arrow in, one arrow out" · F "rank(|+z⟩⟨+z|) = 1 < 2: not onto"
- **Stage:** `plane{ psi:'+z', image:{matrix:[['1','-1'],['1','1']], label:'$A|{+z}\rangle$'} }`; flag `plane-image-not-state`.
- **Claims:** `q2ProjRank` — `rankN(projector(KET['+z']))` → 1 · `q2FigA[0]` — `apply(A, +z)` → (1, 1).
- **Bridge (G):** "<<qc-l3-operators|Spin Lab 3.1>> starts operators the same way."

**`q2-operators:b2` [L]** (Fig. 6: a turn and a stretch)
- **G:** "The table A = [[1, −1], [1, 1]] turns every arrow by 45° and stretches it by 1.414. It sends |+z⟩ to (1, 1) and |−z⟩ to (−1, 1): both 1.414 long and still at right angles."
- **F:** "A = √2 R(45°) is a rotation times a uniform scaling, as in Fig. 6 (notes p. 10): ⟨A(+z)|A(−z)⟩ = 0 and ‖Av‖ = √2‖v‖. Such an A keeps orthogonality; a general linear operator keeps neither angles nor length ratios."
- **Cap:** G "every arrow turned 45° and stretched to 1.414" · F "⟨A{+z}|A{−z}⟩ = 0; ‖A|±z⟩‖ = 1.414"
- **Stage:** `plane{ psi:{planeDeg:sweep(0,90)}, image:{matrix:[['1','-1'],['1','1']], label:'$A|\psi\rangle$'} }` (the image rides 45° ahead at |image| = 1.41).
- **Claims:** `q2FigA` — `apply(A, ±z)` → (1, 1), (−1, 1); `inner` → 0; `norm` → 1.4142 · `q2FigAAngle` — `angleBetween(+z, A(+z))` → 45°.

**`q2-operators:b3` [L]** (most operators bend right angles)
- **G:** "Most operators are not like that. The shear K = [[1, 1], [0, 1]] leaves |+z⟩ alone but tips |−z⟩ over to (1, 1). The two images are 45° apart, no longer at right angles."
- **F:** "For the shear K, K|+z⟩ = |+z⟩ and K|−z⟩ = (1, 1), so ⟨K(+z)|K(−z)⟩ = 1 ≠ 0: linearity alone preserves neither orthogonality nor norms."
- **Cap:** G/F "K|−z⟩ = (1, 1): 45° from K|+z⟩"
- **Stage:** `plane{ psi:'-z', others:[{ket:'+z', role:'basis'}], image:{matrix:[['1','1'],['0','1']], label:'$K|{-z}\rangle$'} }`.
- **Claims:** `q2Shear` — `apply(K, −z)` → (1, 1); `inner(K(+z), K(−z))` → 1; `angleBetween` → 45°.

**`q2-operators:b4` [L]** (the outer product)
- **G:** "Put a ket before a bra: |α⟩⟨β|. This [[qc-outer-product|outer product]] is an operator. Acting on |ψ⟩ it gives |α⟩⟨β|ψ⟩, a copy of |α⟩ scaled by the overlap ⟨β|ψ⟩. So |+z⟩⟨+x| sends ψ to 0.966|+z⟩."
- **F:** "|α⟩⟨β|: |ψ⟩ ↦ ⟨β|ψ⟩|α⟩, with matrix αβ† (notes p. 10; N&C p. 67). |+z⟩⟨+x| = [[0.707, 0.707], [0, 0]]; it annihilates |−x⟩ and maps |+x⟩ to |+z⟩."
- **Cap:** G "|+z⟩⟨+x| applied to ψ: 0.966 of |+z⟩" · F "|+z⟩⟨+x|ψ⟩ = (0.966, 0); |+z⟩⟨+x|−x⟩ = 0"
- **Stage:** `plane{ psi:{planeDeg:30}, image:{matrix:[['sqrt(2)/2','sqrt(2)/2'],['0','0']], label:'$|{+z}\rangle\langle{+x}|\psi\rangle$'} }`.
- **Claims:** `q2Outer` — `outer(+z, +x)` → [[0.7071, 0.7071], [0, 0]] · `q2OuterPsi` — `apply(·, ψ)` → (0.9659, 0) · `q2OuterMx` → (0, 0).

**`q2-operators:b5` [L]** (an operator's table)
- **G:** "Pick an orthonormal basis. The numbers A_ij = ⟨e_i|A|e_j⟩ are the operator's [[qc-matrix-element|matrix elements]]. Then the components of A|ψ⟩ are f_i = Σ_j A_ij c_j: a row times the column of c's. For A and ψ, (f_1, f_2) = (0.366, 1.366)."
- **F:** "f_i = ⟨e_i|A|ψ⟩ = Σ_j⟨e_i|A|e_j⟩c_j = Σ_j A_ij c_j, i.e. f = Âc; and A = Σ_ij A_ij|e_i⟩⟨e_j| (notes p. 10; Axler 3.31, p. 69; N&C Eqs. 2.12, 2.25, pp. 64, 68). Column j is A|e_j⟩."
- **Cap:** G "A applied to ψ: (0.366, 1.366)" · F "A_12 = ⟨+z|A|−z⟩ = −1; Σ_ij A_ij|e_i⟩⟨e_j| = A"
- **Stage:** `plane{ psi:{planeDeg:30}, image:{matrix:[['1','-1'],['1','1']], label:'$A|\psi\rangle$'} }`.
- **Claims:** `q2Fac` — `apply(A, ψ)` → (0.3660, 1.3660) · `q2Aij` → [[1, −1], [1, 1]] · `q2SumOuter` — `Σ A_ij outer(e_i, e_j)` equals A → true.

**`q2-operators:b6` [C]** (a shift)
- **Q G:** "Define a rule that adds |+z⟩ to every vector. Is it a linear operator?"
- **Q F:** "Is T|ψ⟩ = |ψ⟩ + |+z⟩ linear on V²?"
- **Reveal G:** "No. It sends the zero vector to |+z⟩, of length 1. A linear operator must send 0 to 0, since A(0·ψ) = 0·Aψ. A shift is not linear."
- **Reveal F:** "No: T(0) = |+z⟩ ≠ 0, while linearity forces A(0) = A(0·ψ) = 0·Aψ = 0."
- **Reveal cap:** G/F "the zero vector goes to |+z⟩, length 1"
- **Stage:** question `plane{ psi:'+x', others:[{ket:'+z', role:'basis'}] }`; reveal `plane{ psi:'+x', sumOf:['+x','+z'] }` (the shifted arrow is not a scaling).
- **Claims:** `q2Shift` — `norm(vadd(vec(0,0), +z))` → 1.

### Unit `q2-change` — Changing coordinates with one matrix

**`q2-change:b1` [L]** (the translation rule; D2)
- **G:** "One arrow |α⟩ has components c_j in an old orthonormal basis and c'_i in a new one. Each new component is an overlap: c'_i = ⟨α'_i|α⟩. Putting in the old expansion gives c'_i = Σ_j U_ij c_j, with U_ij = ⟨α'_i|α_j⟩."
- **F:** "c'_i = ⟨α'_i|α⟩ = Σ_j⟨α'_i|α_j⟩c_j = Σ_j U_ij c_j, the [[qc-change-of-basis-matrix|change-of-basis matrix]] U_ij = ⟨α'_i|α_j⟩ (notes p. 8; D2). Column j of U lists the old |α_j⟩ in the new basis."
- **Cap:** G "same arrow, new frame: new numbers from U" · F "Rosetta: the notes' U is 448's B†: c' = Uc is Spin Lab's c_new = B†c_old (C7)"
- **Stage:** `plane{ psi:{planeDeg:30}, basis:'z', shadows:true }`, then b2 turns the frame (the interpolation turns it through 45°); flag `plane-frame-turn-passive`.
- **Derivation:** D2 (§2).
- **Claims:** reuses `q2Comp30` → (0.866, 0.5).
- **Bridge (G):** "<<qc-l5-coordinates|Spin Lab 5.3>> writes the same rule with B."

**`q2-change:b2` [L]** (z to x)
- **G:** "From z to x, U holds the four overlaps ⟨±x|±z⟩: U = [[1, 1], [1, −1]]/√2. Its first column is |+z⟩ written in the x basis. For ψ it gives d = Uc = (0.966, 0.259), as in Unit 2.1."
- **F:** "U_{z→x} = (⟨±x|±z⟩) = (1 1; 1 −1)/√2 (notes p. 9), so d = Uc: ψ ↦ (0.966, 0.259). The squared entries still add to 1."
- **Cap:** G "ψ in the x frame: 0.966 and 0.259" · F "U_{z→x}c = (0.966, 0.259); 0.933 + 0.067 = 1"
- **Stage:** `plane{ psi:{planeDeg:30}, basis:'x', shadows:true }`.
- **Claims:** `q2U` — `changeU([+x, −x])` → (1/√2)[[1, 1], [1, −1]] · `q2D30` — `apply(U, ψ)` → (0.9659, 0.2588) · `q2Px30` — `prob(±x, ψ)` → 0.9330, 0.0670 (sum 1).

**`q2-change:b3` [L]** (Eq. 1.3 and its sign)
- **G:** "The notes also do it by hand. Put |±z⟩ = (|+x⟩ ± |−x⟩)/√2 into ψ = c_1|+z⟩ + c_2|−z⟩ and collect: d_1 = (c_1 + c_2)/√2 and d_2 = (c_1 − c_2)/√2. Eq. 1.3 prints c_2 − c_1; the matrix below it is right."
- **F:** "Substitution gives d_2 = (c_1 − c_2)/√2 = 0.259 for ψ; Eq. 1.3's (c_2 − c_1)/√2 has the wrong sign, and the matrix d = Uc on the same page corrects it (N4; N&C Eq. 1.19, p. 22, has the right sign)."
- **Cap:** G "d_2 = (c_1 − c_2)/√2 = 0.259, not −0.259" · F "Eq. 1.3's sign would give −0.259"
- **Stage:** as b2.
- **Claims:** `q2D30[1]` → 0.2588 · `q2Printed` — (c_2 − c_1)/√2 → −0.2588.

**`q2-change:b4` [L]** (U is unitary)
- **G:** "U never changes a length or an angle. The reason is the [[qc-completeness|completeness relation]]: adding |α_k⟩⟨α_k| over a whole orthonormal basis gives I, the operator that changes nothing. So UU† = I: U is [[qc-unitary|unitary]], and U† undoes it."
- **F:** "[UU†]_ij = Σ_k⟨α'_i|α_k⟩⟨α_k|α'_j⟩ = ⟨α'_i|α'_j⟩ = δ_ij, by Σ_k|α_k⟩⟨α_k| = 1 (notes p. 9; N&C Eq. 2.22, p. 67). Here [U†]_ij = U*_ji = ⟨α_i|α'_j⟩; the notes print ⟨α_j|α'_i⟩, which is U*_ij (N5)."
- **Cap:** G "U then U†: back where we started" · F "z → y: [U†]_12 = ⟨+z|−y⟩ = 0.707, not ⟨−z|+y⟩ = 0.707i"
- **Stage:** as b2.
- **Claims:** `q2Unit` — `isUnitary(U_{z→x})`, `isUnitary(U_{z→y})` → true, true · `q2UyDag01` — `dagger(changeU([+y, −y]))[0][1]` → 0.7071 · `q2UyNotes01` — `inner(−z, +y)` → 0.7071i · `q2UyRight01` — `inner(+z, −y)` → 0.7071.

**`q2-change:b5` [L]** (an operator's table changes too; D3)
- **G:** "An operator's table depends on the basis as well. Slip the identity I in on both sides of A: the new table is A' = UAU†, the [[qc-similarity-transform|similarity transform]]. S_z's table in the x basis swaps the two numbers: (ħ/2)[[0, 1], [1, 0]]."
- **F:** "A'_kl = ⟨k'|A|l'⟩ = Σ_ij⟨k'|i⟩A_ij⟨j|l'⟩ = Σ_ij U_ki A_ij U*_lj, so A' = UAU† (notes p. 9; D3; Axler 3.84, p. 93; N&C ⚑ Ex. 2.20, p. 71, no sheet assigns it). With U = U_{z→x}: US_zU† is S_x's table."
- **Cap:** G "S_zψ is one arrow; in x coordinates it reads (0.129, 0.483)" · F "UAU†·(Uc) = U(Ac): (0.129, 0.483)ħ"
- **Stage:** `plane{ psi:{planeDeg:30}, basis:'x', image:{named:'Sz', label:'$S_z|\psi\rangle$'} }`; flags `plane-image-not-state`, `plane-frame-turn-passive`.
- **Derivation:** D3 (§2).
- **Claims:** `q2SzX` — `matEq(U SZ U†, SX)` → true · `q2SzPsiX` — `apply(U, apply(SZ, ψ))` → (0.1294, 0.4830), equal to `apply(SX, apply(U, ψ))`.
- **Bridge (G):** "<<qc-l5-operators|Spin Lab 5.4>> changes operator tables with B."

**`q2-change:b6` [B]** (the same U is the Hadamard gate)
- **G:** "Quantum computing knows this table as the [[qc-hadamard|Hadamard gate]] H: H|0⟩ = (|0⟩ + |1⟩)/√2 and H|1⟩ = (|0⟩ − |1⟩)/√2. Using it twice gives back the start: H² = I. Chapter Q4 uses H as a gate."
- **F:** "With |0⟩ ≡ |+z⟩, the notes' U_{z→x} equals Bergou's H (Eq. 1.8, p. 4): H = H† = H⁻¹. As U it relabels coordinates (passive); as a gate it moves the state (active); Q4 owns gates."
- **Cap:** G/F "H|0⟩ = |+x⟩, H|1⟩ = |−x⟩, H² = I"
- **Stage:** `amp{ state:{dir:'+x'}, labels:'spin' }`.
- **Refs:** Bergou Eq. 1.8, p. 4.
- **Claims:** `q2UisH` — `matEq(changeU([+x, −x]), H)` → true · `q2HH` — `matEq(matmul(H, H), I2)` → true · `q2H0` — `apply(H, ket('0'))` = `KET['+x']` → true.

**`q2-change:b7` [C]** (does Eq. 1.3's sign matter?)
- **Q G:** "Eq. 1.3's slip flips only the sign of d_2, so both chances along x stay the same. Does the slip matter?"
- **Q F:** "If d_2 = (c_2 − c_1)/√2, which state do the new components describe?"
- **Reveal G:** "Yes. For ψ at 30°, the wrong numbers (0.966, −0.259) describe the state at 60°. A z magnet would then read 0.25 and 0.75 instead of 0.75 and 0.25."
- **Reveal F:** "Yes: U†(0.966, −0.259) = (0.5, 0.866), the state at 60°, the mirror image of ψ in the 45° line. The x statistics agree; the z statistics and every relative sign do not."
- **Reveal cap:** G/F "wrong sign → the state at 60°: P(+z) = 0.25, not 0.75"
- **Stage:** question `plane{ psi:{planeDeg:30}, basis:'x' }` (no shadows); reveal `plane{ psi:{planeDeg:60}, others:[{ket:{planeDeg:30}, role:'ghost', badge:'ψ'}], basis:'z', shadows:true }`.
- **Claims:** `q2Wrong` — `apply(dagger(U), (0.9659, −0.2588))` → (0.5, 0.8660), `samePhysicalState(·, plane(60))` → true · `q2WrongPz` → 0.25, 0.75.

### Unit `q2-photon` — Turning the frame of a photon

**`q2-photon:b1` [L]** (two polarizations)
- **G:** "Light is a wave of electric field, and its [[qc-polarization|polarization]] is the direction the field swings. One photon has two basis states: |x⟩, swinging across, and |y⟩, swinging up. Any other straight-line polarization is a mix of them."
- **F:** "A photon's polarization state lies in span{|x⟩, |y⟩} with ⟨x|y⟩ = 0 (notes p. 9); classically this is the direction of the oscillating E field."
- **Cap:** G "|x⟩ across, |y⟩ up: two states at right angles" · F "Rosetta: the notes' frame angle ϕ is χ here; photon |x⟩, |y⟩ (no sign) are not spin |±x⟩, |±y⟩; Bergou's |0⟩ = |H⟩ = |x⟩"
- **Stage:** `plane{ labels:'photon', psi:{planeDeg:0}, others:[{ket:{planeDeg:90}, role:'basis'}], rightAngle:true }` (proposed `labels:'photon'`, §9.2 S1).
- **Claims:** none (definitions; the unit's numbers start at b2).

**`q2-photon:b2` [L]** (a turned frame)
- **G:** "Turn the polarizer frame by an angle χ: |x'⟩ = cos χ|x⟩ + sin χ|y⟩ and |y'⟩ = −sin χ|x⟩ + cos χ|y⟩. At χ = 45°, |x'⟩ = (0.707, 0.707). For light the state turns by the same angle as the filter."
- **F:** "The frame change U_ij = ⟨i'|j⟩ = (cos χ, sin χ; −sin χ, cos χ) is real orthogonal, hence unitary (notes p. 9). It has determinant +1, a rotation; the spin U_{z→x} = H has −1."
- **Cap:** G "the frame turned by 45°: |x'⟩ = (0.707, 0.707)" · F "U(45°) unitary, det U = +1; det H = −1"
- **Stage:** `plane{ labels:'photon', psi:{planeDeg:45}, others:[{ket:{planeDeg:135}, role:'second', badge:"$|y'\rangle$"}], rightAngle:true }`.
- **Claims:** `q2Pol45` → (0.7071, 0.7071) · `q2FrameU45Unitary` → true · `q2DetU` — `det(H)`, `det(U(45°))` → −1, +1.

**`q2-photon:b3` [L]** (circular light)
- **G:** "Two more states mix x and y with a quarter-turn phase: |R⟩ = (|x⟩ + i|y⟩)/√2 and |L⟩ = (|x⟩ − i|y⟩)/√2. In them the field turns round in a circle, one way or the other: [[qc-circular-polarization|circular polarization]]."
- **F:** "|R⟩, |L⟩ = (|x⟩ ± i|y⟩)/√2 (notes p. 9) are orthonormal and unbiased with respect to {|x⟩, |y⟩}: |⟨x|R⟩|² = ½. They carry the same numbers as the spin states |±y⟩ of Unit 1.3."
- **Cap:** G "|R⟩: amplitudes 0.707 and 0.707i" · F "⟨R|L⟩ = 0; |⟨x|R⟩|² = 0.5"
- **Stage:** `amp{ state:{dir:'+y'}, dials:true, labels:'bits' }` (|0⟩ = |x⟩, per the b1 Rosetta; the source names the numbers, not the physics).
- **Claims:** `q2R` → (0.7071, 0.7071i) · `q2RL` — `inner(R, L)` → 0 · `q2PxR` — `prob(pol(0), R)` → 0.5.

**`q2-photon:b4` [L]** (turning the frame only rephases |R⟩; D4)
- **G:** "Build |R'⟩ the same way on the turned frame and collect the x and y parts. Both carry the same factor cos χ − i sin χ = e^{−iχ} (Chapter F1). So |R'⟩ = e^{−iχ}|R⟩: the same state with a new phase. Likewise |L'⟩ = e^{+iχ}|L⟩."
- **F:** "|R'⟩ = (|x'⟩ + i|y'⟩)/√2 = e^{−iχ}|R⟩ and |L'⟩ = e^{iχ}|L⟩ (notes p. 9; D4): a frame turn is diagonal on {|R⟩, |L⟩}, with eigenvalues e^{∓iχ}."
- **Cap:** G "turning the frame by 45°: both dials of |R⟩ turn back by 45°" · F "|R'⟩ = e^{−i45°}|R⟩ = (0.5 − 0.5i, 0.5 + 0.5i)"
- **Stage:** `amp{ state:{dir:'+y'}, dials:true, labels:'bits', globalPhaseDeg:sweep(0,-45) }` (proposed §9.2 S2); fallback: static bars, the caption carries e^{−iχ}.
- **Derivation:** D4 (§2).
- **Claims:** `q2Rp45` — `vscale(vadd(pol(45), vscale(pol(135), I)), 1/√2)` → (0.5 − 0.5i, 0.5 + 0.5i) · `q2Rp45Phase` — equals `vscale(R, expi(−π/4))` → true · `q2LpPhase` → true.

**`q2-photon:b5` [L]** (the generator and J_z = ±ħ)
- **G:** "The notes write the turn as e^{−iJ_zχ/ħ}, where J_z is the photon's spin about its line of flight, the turn's [[qc-generator|generator]]. Since the turn multiplies |R⟩ by e^{−iχ}, J_z|R⟩ = ħ|R⟩ and J_z|L⟩ = −ħ|L⟩. A photon's spin is ±ħ, twice an electron's ħ/2."
- **F:** "|R'(L')⟩ = e^{−iJ_zχ/ħ}|R(L)⟩ for all χ gives J_z|R⟩ = ħ|R⟩, J_z|L⟩ = −ħ|L⟩ (notes p. 9) <<qc-l6-generator|Sz generates the turn>>: the [[qc-helicity|helicity]] ±ħ. In {|x⟩, |y⟩}, J_z = ħ(0 −i; i 0)."
- **Cap:** G "|L⟩: the dials turn the other way" · F "J_z/ħ on {|x⟩, |y⟩}: eigenvalues ±1 on |R⟩, |L⟩"
- **Stage:** `amp{ state:{dir:'-y'}, dials:true, labels:'bits', globalPhaseDeg:sweep(0,45) }`.
- **Claims:** `q2JzR`, `q2JzL` — `apply(SIGMA_Y, R) = R`, `apply(SIGMA_Y, L) = −L` → true, true · `q2FrameExp` — `cos χ I − i sin χ J = rotation([0,1,0], 2χ)` → true.

**`q2-photon:b6` [B]** (light versus spin)
- **G:** "Light-based quantum computers use this: Bergou sets |0⟩ = |H⟩, horizontal (our |x⟩), and |1⟩ = |V⟩. A polarizer turned by 45° passes half of |x⟩ light. A spin magnet turned by 45° passes 0.854 of |+z⟩ atoms."
- **F:** "Bergou §14.2 (p. 257): |0⟩ = |H⟩, |1⟩ = |V⟩, so a frame turn χ is R_y(2χ) on the qubit sphere: 45° here is 90° there <<qc-l7-two-angles|sphere angles are twice state angles>>. Malus: cos²χ = 0.5; spin: cos²(θ/2) = 0.854."
- **Cap:** G "45°: light passes 0.5, spin passes 0.854" · F "|⟨x|x'⟩|² = 0.5 vs |⟨+z|θ = 45°⟩|² = 0.854"
- **Stage:** `plane{ labels:'photon', psi:{planeDeg:45}, basis:'z', shadows:true }`.
- **Refs:** Bergou §14.2, p. 257 (its θ is half the sphere's polar angle: B33, §8.3).
- **Claims:** `q2Malus45` → 0.5 · `q2Spin45` — `prob(+z, ketFromBloch(π/4, 0))` → 0.8536 · `q2PolBloch45` — `blochAngle(pol(0), pol(45))` → 90° · `q2FrameIsRy` → true.
- **Bridge (G):** "<<qc-l1-average|Spin Lab 1.3>> compares polarizers and magnets."

**`q2-photon:b7` [C]** (a quarter turn of the frame)
- **Q G:** "Turn the frame by 90°. What happens to |x⟩ light, and to |R⟩ light?"
- **Q F:** "At χ = 90°, compare |x'⟩ with |x⟩ and |R'⟩ with |R⟩."
- **Reveal G:** "|x'⟩ = |y⟩: the new x filter blocks all of the old |x⟩ light. But |R'⟩ = −i|R⟩ is the same state: every filter reads it as before. Circular light has no preferred direction to turn."
- **Reveal F:** "|⟨x|x'⟩|² = 0 while |⟨R|R'⟩|² = 1: {|R⟩, |L⟩} are the eigenstates of every frame turn, the J_z basis."
- **Reveal cap:** G/F "|⟨x|x'⟩|² = 0; |⟨R|R'⟩|² = 1"
- **Stage:** question `amp{ state:{dir:'+y'}, dials:true, labels:'bits' }`; reveal the same with `globalPhaseDeg:-90`.
- **Claims:** `q2Rot90` — `prob(pol(0), pol(90))` → 0, `prob(R, R'(90°))` → 1, `inner(R, R')` → −i · `q2Rp90isMinusIR` → true.

**Beat count:** 6 + 6 + 6 + 6 + 7 + 7 = **38 beats**, 6 of them clues with reveals. Phase mix: 29 [L] · 3 [B] · 6 [C]; within every unit the order is L → B → C (the phase-order lint).

## 2. Derivations

**D1 · `q2-basis:b3` · result: the components are unique, c_i = c'_i**
- Ground:
  1. `|\alpha\rangle = \sum_i c_i|e_i\rangle` — Suppose one recipe gives the numbers c_i.
  2. `|\alpha\rangle = \sum_i c'_i|e_i\rangle` — Suppose a second recipe gives numbers c'_i.
  3. `0 = \sum_i (c_i - c'_i)|e_i\rangle` — Subtract the second line from the first; the left sides cancel.
  4. `c_i - c'_i = 0\ \text{for every } i` — The arrows are independent, so only the all-zero mix gives the zero vector.
  5. `c_i = c'_i` — The two recipes were the same all along.
- Formal:
  1. `\sum_i (c_i - c'_i)|e_i\rangle = 0 \Rightarrow c_i = c'_i` — Linear independence of {|e_i⟩} (notes p. 6).

**D2 · `q2-change:b1` · result c'_i = Σ_j U_ij c_j, U_ij = ⟨α'_i|α_j⟩**
- Ground:
  1. `|\alpha\rangle = \sum_j c_j|\alpha_j\rangle` — The arrow written in the old basis.
  2. `c'_i = \langle\alpha'_i|\alpha\rangle` — In an orthonormal basis a component is an overlap (Unit 2.1).
  3. `c'_i = \langle\alpha'_i|\big(\textstyle\sum_j c_j|\alpha_j\rangle\big)` — Put step 1 into step 2.
  4. `c'_i = \sum_j \langle\alpha'_i|\alpha_j\rangle\,c_j` — The bra passes into the sum, and numbers leave the ket side unchanged (Unit 1.5).
  5. `U_{ij} = \langle\alpha'_i|\alpha_j\rangle` — Name the overlaps: a table with row i and column j.
  6. `c'_i = \sum_j U_{ij}c_j` — Row i of the table times the old column gives new component i.
- Formal:
  1. `c'_i = \langle\alpha'_i|\alpha\rangle = \sum_j\langle\alpha'_i|\alpha_j\rangle c_j` — ON expansion and linearity in the ket.
  2. `c'_i = \sum_j U_{ij}c_j` — With U_ij = ⟨α'_i|α_j⟩ (notes p. 8).
- Check: ψ → (0.966, 0.259) (`q2D30`).

**D3 · `q2-change:b5` · result A' = UAU†**
- Ground:
  1. `A_{ij} = \langle i|A|j\rangle,\quad A'_{kl} = \langle k'|A|l'\rangle` — The operator's table in the old basis {|i⟩} and in the new one {|k'⟩}.
  2. `I = \sum_i |i\rangle\langle i|` — The completeness relation (Unit 2.5): this sum changes nothing.
  3. `A'_{kl} = \langle k'|\,I A I\,|l'\rangle` — Two copies of "change nothing" change nothing.
  4. `A'_{kl} = \sum_{i,j}\langle k'|i\rangle A_{ij}\langle j|l'\rangle` — Write out both sums; the middle pair is A_ij.
  5. `\langle k'|i\rangle = U_{ki},\quad \langle j|l'\rangle = U^*_{lj}` — The first is an entry of U; the second has its sides swapped, so it is conjugated.
  6. `A'_{kl} = \sum_{i,j}U_{ki}A_{ij}U^*_{lj}` — Put step 5 into step 4.
  7. `A' = UAU^\dagger` — U*_lj is entry (j, l) of U†, so the double sum is a product of three tables.
- Formal:
  1. `A'_{kl} = \sum_{i,j}\langle k'|i\rangle A_{ij}\langle j|l'\rangle = \sum_{i,j}U_{ki}A_{ij}U^*_{lj}` — Two resolutions of the identity (notes p. 9).
  2. `A' = UAU^\dagger` — (U†)_jl = U*_lj.
- Check: U_{z→x}S_zU_{z→x}† = S_x's table (`q2SzX`).

**D4 · `q2-photon:b4` · result |R'⟩ = e^{−iχ}|R⟩**
- Ground:
  1. `|R'\rangle = (|x'\rangle + i|y'\rangle)/\sqrt2` — The recipe for |R⟩, built on the turned frame.
  2. `|x'\rangle + i|y'\rangle = (\cos\chi - i\sin\chi)|x\rangle + (\sin\chi + i\cos\chi)|y\rangle` — Put in |x'⟩ and |y'⟩ from b2 and collect the x and y parts.
  3. `\sin\chi + i\cos\chi = i(\cos\chi - i\sin\chi)` — Multiply out the right side: i cos χ − i² sin χ, and i² = −1.
  4. `\cos\chi - i\sin\chi = e^{-i\chi}` — Euler's formula at the angle −χ (Chapter F1).
  5. `|x'\rangle + i|y'\rangle = e^{-i\chi}\big(|x\rangle + i|y\rangle\big)` — Both parts carry the same factor, so it comes out in front.
  6. `|R'\rangle = e^{-i\chi}|R\rangle` — Divide both sides by √2.
- Formal:
  1. `|x'\rangle + i|y'\rangle = e^{-i\chi}|x\rangle + ie^{-i\chi}|y\rangle` — Substitute and apply Euler's formula.
  2. `|R'\rangle = e^{-i\chi}|R\rangle` — Same for |L'⟩ with i → −i (notes p. 9).
- Check: χ = 45° → (0.5 − 0.5i, 0.5 + 0.5i) (`q2Rp45`).

## 3. Try-it widget per unit

| Unit | Widget spec | Why this one |
|---|---|---|
| `q2-basis` | `{kind:'basis-translator', props:{target:'x', mode:'state', theta:60, phi:0}}` | ψ's two columns: z (0.866, 0.5) and x (0.966, 0.259). The widget's θ is the sphere angle, twice the plane angle. |
| `q2-gram-schmidt` | `{kind:'projector', props:{state:60, basis:0, editableBasis:true}}` | The shadow on \|+z⟩ is what Gram–Schmidt removes; the other shadow is what is left. |
| `q2-spin-space` | `{kind:'amplitude-bars', props:{state:[90, 0], basis:'z', editable:true}}` | \|+x⟩; set φ to 180° (\|−x⟩) and to 90° (\|+y⟩), then switch the basis to x. |
| `q2-operators` | `{kind:'operator-action', props:{preset:'[[2,1],[1,2]]'}}` | Real symmetric only: a stretch that bends right angles except along two directions. |
| `q2-change` | `{kind:'basis-translator', props:{target:'x', mode:'operator', operator:'Sz'}}` | S_z's table in the x basis: the swap. |
| `q2-photon` | `{kind:'projector', props:{state:45, basis:0, editableBasis:true}}` | For light the arrow is the polarization, so the squared shadow is Malus's law. Caption: "the widget names spin axes; read \|+z⟩ as \|x⟩". |

**Try this:**
- `q2-basis`: (1) Read the x column of ψ. (2) Set θ = 90°: which column is (1, 0)?
- `q2-gram-schmidt`: (1) Read the shadow on |+z⟩ at 60°. (2) Turn the basis until one shadow is zero: now the arrows are already orthogonal.
- `q2-spin-space`: (1) φ = 180°: |−x⟩. (2) φ = 90°: the z bars stay ½, ½; which basis tells it from |±x⟩?
- `q2-operators`: (1) Drag the arrow: where does it only stretch? (2) Are the images of |+z⟩ and |−z⟩ at right angles?
- `q2-change`: (1) S_z in the x basis: diagonal? (2) Switch to S_x: now?
- `q2-photon`: (1) Basis at 45°: half passes. (2) Basis at 90°: nothing passes. (3) Why does spin need 180° for that?

## 4. Challenges per unit

Tolerance 0.005 unless stated. Hints climb nudge → key idea → setup. **Homework:** none assigned is open; no item
reproduces HW1 P5. F walkthroughs where they differ.

### `q2-basis`
1. **warm-up · numeric · `q2-b-dim`** — "What is the dimension of V²(ℂ), the space of a qubit's kets?"
   - Answer: **2** = `q2Dim`. Hints: (1) Count independent arrows. (2) |+z⟩, |−z⟩ already give every vector. (3) A third is always a mix.
   - Walkthrough: two, so every basis has two arrows.
2. **core · numeric · `q2-b-comp`** — "ψ = (0.6, 0.8). What is its component along |+x⟩?"
   - Answer: **0.9899** = `inner(KET['+x'], vec(0.6, 0.8)).re`. Hints: (1) The basis is orthonormal. (2) c = ⟨+x|ψ⟩. (3) (0.6 + 0.8)/√2.
   - Walkthrough: 1.4/1.414 = 0.990.
3. **core · choice · `q2-b-independent`** — "Which set is linearly independent?"
   - Options: |+z⟩, |−z⟩, |+x⟩ · **|+z⟩, |+x⟩** ✓ · |+x⟩, −|+x⟩ · |+z⟩ and the zero vector.
   - Check: `isIndependent` → false, true, false, false. Hints: (1) Look for a mix that gives 0. (2) Three arrows in a plane. (3) Any set holding 0 is dependent.
   - Walkthrough: only |+z⟩, |+x⟩: they point different ways.
4. **stretch · numeric · `q2-b-slanted`** — "In the basis |+z⟩, |+x⟩, what is the component of |−z⟩ along |+x⟩?"
   - Answer: **1.4142** = `components(KET['-z'], [KET['+z'], KET['+x']])[1].re`. Hints: (1) Not an overlap: the basis is slanted. (2) Solve c_1|+z⟩ + c_2|+x⟩ = |−z⟩. (3) The |−z⟩ part needs c_2/√2 = 1.
   - Walkthrough: c_2 = √2, c_1 = −1 (clue b6).

### `q2-gram-schmidt`
1. **warm-up · numeric · `q2-g-left`** — "|β_1⟩ = |+z⟩, |β_2⟩ = (0.6, 0.8). How long is the leftover |α'_2⟩?"
   - Answer: **0.8** = `norm(gramSchmidt([+z, vec(0.6, 0.8)]).steps[1].residual)`. Hints: (1) Remove the shadow on |+z⟩. (2) It is 0.6|+z⟩. (3) What is left is (0, 0.8).
   - Walkthrough: 0.8; rescaled, |−z⟩.
2. **core · numeric · `q2-g-3d`** — "|β_1⟩ = (1, 1, 0), |β_2⟩ = (1, 0, 1). What is ⟨α'_2|α'_2⟩?"
   - Answer: **1.5** = `norm2(q2Gs3DRes[1])`. Hints: (1) ⟨β_1|β_2⟩ = 1, ⟨β_1|β_1⟩ = 2. (2) Remove ½ of β_1. (3) (0.5, −0.5, 1).
   - Walkthrough: 0.25 + 0.25 + 1 = 1.5.
3. **core · numeric · `q2-g-third`** — "Continue with |β_3⟩ = (0, 1, 1). What is the first entry of |α'_3⟩?"
   - Answer: **−0.6667** = `q2Gs3DRes[2][0]`. Hints: (1) Remove the shadows on α'_1 and α'_2. (2) Their sizes are ½ and 1/3 of those arrows. (3) (0, 1, 1) − (0.5, 0.5, 0) − (1/6, −1/6, 1/3).
   - Walkthrough: (−2/3, 2/3, 2/3).
4. **stretch · choice · `q2-g-order`** — "Run the recipe on the 60° arrow first, then |+z⟩. What comes out?"
   - Options: |+z⟩, |−z⟩ · **(0.5, 0.866) and (0.866, −0.5)** ✓ · (0.5, 0.866) and |−z⟩ · the same basis in the other order.
   - Check: `q2GsOrder`. Hints: (1) The first arrow is kept. (2) Remove from |+z⟩ its shadow on the 60° arrow. (3) Rescale.
   - Walkthrough: order matters: the first arrow survives. **F:** the flags span(β_1…β_k) depend on the order.

### `q2-spin-space`
1. **warm-up · numeric · `q2-s-amp`** — "|ψ⟩ = 0.866|+z⟩ + 0.5i|−z⟩. What is P(−z)?"
   - Answer: **0.25** = `q2AmpExP[1]`. Hints: (1) Size squared. (2) |0.5i|² = 0.5². (3) Not (0.5i)².
   - Walkthrough: 0.25.
2. **core · numeric · `q2-s-delta`** — "For (|+z⟩ + e^{iδ}|−z⟩)/√2 with δ = 90°, what is |⟨+x|ψ⟩|?"
   - Answer: **0.7071** = `q2Delta[1]`. Hints: (1) ⟨+x| = (1, 1)/√2. (2) The overlap is (1 + e^{iδ})/2. (3) |1 + i| = √2.
   - Walkthrough: √2/2.
3. **core · choice · `q2-s-inverse`** — "Which is |−z⟩ in the x basis?"
   - Options: **(|+x⟩ − |−x⟩)/√2** ✓ · (|+x⟩ + |−x⟩)/√2 · |−x⟩ · (|+x⟩ + i|−x⟩)/√2.
   - Check: `q2ZfromX[1]`. Hints: (1) Subtract Eq. 1.2 from Eq. 1.1. (2) The |+z⟩ parts cancel. (3) Divide by √2.
   - Walkthrough: b4.
4. **stretch · numeric · `q2-s-angle`** — "In the real plane, what angle (degrees) separates |+z⟩ and |−x⟩?"
   - Answer: **45** = `angleBetween(KET['+z'], KET['-x'])`. Hints: (1) |−x⟩ = (1, −1)/√2. (2) It points 45° below |+z⟩. (3) cos = 0.707.
   - Walkthrough: 45° here, 90° on the sphere.

### `q2-operators`
1. **warm-up · numeric · `q2-o-len`** — "A = [[1, −1], [1, 1]]. How long is A|+z⟩?"
   - Answer: **1.4142** = `norm(apply(A, KET['+z']))`. Hints: (1) A|+z⟩ is the first column. (2) (1, 1). (3) Pythagoras.
   - Walkthrough: √2.
2. **core · numeric · `q2-o-outer`** — "Apply |+z⟩⟨+x| to |−z⟩. What is the first component?"
   - Answer: **0.7071** = `apply(outer(+z, +x), −z)[0].re`. Hints: (1) The result is ⟨+x|−z⟩|+z⟩. (2) ⟨+x|−z⟩ = 1/√2. (3) The second component is 0.
   - Walkthrough: (0.707, 0).
3. **core · numeric · `q2-o-element`** — "For A = [[1, −1], [1, 1]], what is A_12 = ⟨+z|A|−z⟩?"
   - Answer: **−1** = `q2Aij[0][1]`. Hints: (1) A|−z⟩ is column 2. (2) (−1, 1). (3) Take its |+z⟩ part.
   - Walkthrough: −1.
4. **stretch · choice · `q2-o-linear`** — "Which rule is a linear operator?"
   - Options: add |+z⟩ to every vector · **multiply every vector by 3** ✓ · square each component · replace each component by its size.
   - Check: `q2Shift` → 1 (the shift fails). Hints: (1) Test 0 ↦ 0. (2) Test doubling. (3) Squaring doubles to four times.
   - Walkthrough: only scaling by 3 respects sums and scaling.

### `q2-change`
1. **warm-up · numeric · `q2-c-u22`** — "For z → x, what is U_22 = ⟨−x|−z⟩?"
   - Answer: **−0.7071** = `changeU([+x, −x])[1][1].re`. Hints: (1) ⟨−x| = (1, −1)/√2. (2) Pick its second entry. (3) −1/√2.
   - Walkthrough: −0.707.
2. **core · numeric · `q2-c-d2`** — "c = (0.6, 0.8). What is d_2, the |−x⟩ component?"
   - Answer: **−0.1414** = `apply(U, vec(0.6, 0.8))[1].re`. Hints: (1) d_2 = (c_1 − c_2)/√2. (2) Not Eq. 1.3's sign. (3) −0.2/1.414.
   - Walkthrough: −0.141 (N4).
3. **core · numeric · `q2-c-sz`** — "In the x basis, what is the top-right entry of S_z, in units of ħ?"
   - Answer: **0.5** = `(U SZ U†)[0][1].re`. Hints: (1) A' = UAU†. (2) U = H. (3) H σ_z H = σ_x.
   - Walkthrough: S_z reads (ħ/2)(0 1; 1 0) in x.
4. **stretch · numeric · `q2-c-dagger`** — "For z → y, what is the imaginary part of [U†]_21 = ⟨α_2|α'_1⟩ = ⟨−z|+y⟩?"
   - Answer: **0.7071** = `dagger(changeU([+y, −y]))[1][0].im`. Hints: (1) [U†]_21 = U*_12. (2) U_12 = ⟨+y|−z⟩ = −i/√2. (3) Conjugate it.
   - Walkthrough: i/√2 (N5's index order).

### `q2-photon`
1. **warm-up · numeric · `q2-p-malus`** — "x-polarized light meets a polarizer turned by 60°. What fraction passes?"
   - Answer: **0.25** = `prob(pol(0), pol(60))`. Hints: (1) Squared shadow. (2) cos 60° = 0.5. (3) Square it.
   - Walkthrough: 0.25.
2. **core · numeric · `q2-p-spin`** — "|+z⟩ atoms meet a magnet tilted by 60°. What fraction lands +?"
   - Answer: **0.75** = `prob(KET['+z'], ketFromBloch(Math.PI/3, 0))`. Hints: (1) Spin uses half the angle. (2) cos²30°. (3) 0.866².
   - Walkthrough: 0.75, against light's 0.25.
3. **core · numeric · `q2-p-phase`** — "Turn the frame by χ = 30°. What is the real part of the factor e^{−iχ} on |R⟩?"
   - Answer: **0.866** = `expi(-Math.PI/6).re`. Hints: (1) |R'⟩ = e^{−iχ}|R⟩. (2) Euler: cos χ − i sin χ. (3) cos 30°.
   - Walkthrough: 0.866; the imaginary part is −0.5.
4. **stretch · numeric · `q2-p-jz`** — "In {|x⟩, |y⟩}, J_z/ħ = [[0, −i], [i, 0]]. What is ⟨R|J_z|R⟩/ħ?"
   - Answer: **1** = `sandwich(SIGMA_Y, KET['+y']).re`. Hints: (1) Apply the table to (1, i)/√2. (2) You get (1, i)/√2 back. (3) ⟨R|R⟩ = 1.
   - Walkthrough: +1: |R⟩ is the eigenstate with J_z = +ħ.

## 5. Glossary terms new in Q2

| id | Term | Ground gloss | Formal definition | First use | bridge |
|---|---|---|---|---|---|
| `qc-linearly-independent` | linearly independent | Arrows none of which can be built from the others by scaling and adding. | Σc_i\|α_i⟩ = 0 ⇒ all c_i = 0. | `q2-basis:b1` | `l4-basis` |
| `qc-dimension` | dimension | The largest number of independent arrows a space holds; 2 for a qubit. | The size of any basis of V. | `q2-basis:b2` | `l2-three-bases` |
| `qc-basis` | basis | Independent arrows from which every vector is built in exactly one way. | An LI spanning list; expansions are unique (Axler 2.28). | `q2-basis:b3` | `l4-basis` |
| `qc-component` | component | How much of one basis arrow a vector contains. | c_i in \|α⟩ = Σc_i\|e_i⟩; c_i = ⟨e_i\|α⟩ in an ON basis. | `q2-basis:b3` | `l2-inner-product` |
| `qc-orthonormal` | orthonormal | Arrows at right angles to each other, each of length 1. | ⟨e_i\|e_j⟩ = δ_ij. | `q2-basis:b4` | `l4-basis` |
| `qc-kronecker-delta` | Kronecker delta δ_ij | A shorthand that is 1 when its two labels match and 0 when they differ. | δ_ij = 1 (i = j), 0 (i ≠ j). | `q2-basis:b4` | — |
| `qc-gram-schmidt` | Gram–Schmidt procedure | A recipe that makes independent arrows orthonormal: remove the shadows on earlier arrows, then rescale. | \|α'_j⟩ = \|β_j⟩ − Σ_{i<j}\|α'_i⟩⟨α'_i\|β_j⟩/⟨α'_i\|α'_i⟩, then normalize. | `q2-gram-schmidt:b1` | `l4-basis` |
| `qc-linear-operator` | linear operator | A rule that turns vectors into vectors and respects adding and scaling. | A linear map V → V. | `q2-operators:b1` | `l3-operators` |
| `qc-outer-product` | outer product \|α⟩⟨β\| | A ket followed by a bra: it makes a copy of the ket, scaled by an overlap. | \|ψ⟩ ↦ ⟨β\|ψ⟩\|α⟩; matrix αβ†. | `q2-operators:b4` | `l3-projectors` |
| `qc-matrix-element` | matrix element A_ij | One entry of an operator's table: how much of arrow i it makes from arrow j. | A_ij = ⟨e_i\|A\|e_j⟩. | `q2-operators:b5` | `l3-operators` |
| `qc-change-of-basis-matrix` | change-of-basis matrix U | The table that turns a vector's old components into its new ones. | U_ij = ⟨α'_i\|α_j⟩, c' = Uc; U = 448's B†. | `q2-change:b1` | `l5-coordinates` |
| `qc-hadamard` | Hadamard matrix H | The table that turns z components into x components; used twice, it undoes itself. | H = (1 1; 1 −1)/√2 = H† = H⁻¹ (Bergou Eq. 1.8). | `q2-change:b6` | — |
| `qc-completeness` | completeness relation | Adding every basis arrow times its own bra gives the operator that changes nothing. | Σ_k\|α_k⟩⟨α_k\| = I for an ON basis. | `q2-change:b4` | `l4-basis` |
| `qc-unitary` | unitary | A table undone by its conjugated mirror image; it keeps all lengths and angles. | UU† = U†U = I. | `q2-change:b4` | `l5-coordinates` |
| `qc-similarity-transform` | similarity transform | Rewriting an operator's table for a new basis: U times the old table times U†. | A' = UAU†. | `q2-change:b5` | `l5-operators` |
| `qc-polarization` | polarization | The direction in which a light wave's electric field swings. | The photon state in span{\|x⟩, \|y⟩}. | `q2-photon:b1` | `l1-average` |
| `qc-circular-polarization` | circular polarization | Light whose field turns round in a circle; its states are \|R⟩ and \|L⟩. | (\|x⟩ ± i\|y⟩)/√2, the J_z eigenstates. | `q2-photon:b3` | — |
| `qc-generator` | generator | The operator in the exponent of a turn; it sets how fast each state's phase turns. | U(χ) = e^{−iJ_zχ/ħ}. | `q2-photon:b5` | `l6-generator` |
| `qc-helicity` | helicity | A photon's spin about its line of flight: +ħ or −ħ. | J_z eigenvalues ±ħ on \|R⟩, \|L⟩ (the notes' R = positive helicity). | `q2-photon:b5` | — |

Reused: `qc-amplitude` (F1), `qc-born-rule`, `qc-inner-product`, `qc-bra`, `qc-zero-vector` (Q1).

## 6. Review card per unit (both tracks)

### `q2-basis`
- **G points:** (1) Arrows are independent when only the all-zero mix gives 0. (2) The dimension is the most independent arrows: 2 for a qubit. (3) In a basis every vector has unique components. (4) In an orthonormal basis a component is an overlap.
- **F points:** (1) LI, dim, basis (Axler 2.15, 2.28, 2.35). (2) ⟨e_i|e_j⟩ = δ_ij ⇒ c_i = ⟨e_i|ψ⟩. (3) Non-ON bases need a linear solve.
- **Equations:** $\sum_i c_i|\alpha_i\rangle = 0 \Rightarrow c_i = 0,\quad |\psi\rangle = \sum_i c_i|e_i\rangle,\quad c_i = \langle e_i|\psi\rangle$
- **Trap:** reading components as overlaps in a slanted basis: |−z⟩ in {|+z⟩, |+x⟩} is (−1, 1.414), not (0, 0.707).

### `q2-gram-schmidt`
- **G points:** (1) Keep the first arrow. (2) From each new arrow remove its shadows on the earlier ones. (3) Rescale each leftover to length 1. (4) A zero leftover means the input was dependent.
- **F points:** (1) The notes' formula with unnormalized α'. (2) Spans are preserved step by step. (3) Complex arrows need the conjugated bra.
- **Equations:** $|\alpha'_j\rangle = |\beta_j\rangle - \sum_{i<j}|\alpha'_i\rangle\frac{\langle\alpha'_i|\beta_j\rangle}{\langle\alpha'_i|\alpha'_i\rangle},\quad |\alpha_j\rangle = \frac{|\alpha'_j\rangle}{\sqrt{\langle\alpha'_j|\alpha'_j\rangle}}$
- **Trap:** forgetting to rescale: (0, 0.866) is at right angles to |+z⟩ but has length 0.866.

### `q2-spin-space`
- **G points:** (1) A spin state's z components are its amplitudes. (2) The 50/50 split along z gives |±x⟩ equal sizes. (3) δ₊ = 0 is a choice; δ₋ = 180° is forced. (4) The x frame is the z frame turned by 45°.
- **F points:** (1) Eqs. 1.1–1.2 and their inverse. (2) State angles are half the sphere's. (3) The slice is real only.
- **Equations:** $|{\pm x}\rangle = \tfrac{1}{\sqrt2}(|{+z}\rangle \pm |{-z}\rangle),\quad |{\pm z}\rangle = \tfrac{1}{\sqrt2}(|{+x}\rangle \pm |{-x}\rangle)$
- **Trap:** "any phase will do for |−x⟩": δ₋ = 90° gives |+y⟩, which passes an x magnet half the time.

### `q2-operators`
- **G points:** (1) A linear operator turns vectors into vectors and respects mixing. (2) A turn plus a stretch keeps right angles; most operators do not. (3) |α⟩⟨β| copies |α⟩, scaled by ⟨β|ψ⟩. (4) In a basis an operator is a table, A_ij = ⟨e_i|A|e_j⟩.
- **F points:** (1) V → V, into (not onto). (2) f = Âc. (3) A = Σ A_ij|e_i⟩⟨e_j|.
- **Equations:** $f_i = \sum_j A_{ij}c_j,\quad A_{ij} = \langle e_i|A|e_j\rangle,\quad A = \sum_{i,j}A_{ij}|e_i\rangle\langle e_j|$
- **Trap:** a shift "add |+z⟩" is not linear: it moves the zero vector.

### `q2-change`
- **G points:** (1) New components are overlaps with the new basis: c' = Uc. (2) From z to x, U is the Hadamard table H. (3) U keeps lengths: UU† = I. (4) Operator tables change as A' = UAU†.
- **F points:** (1) U_ij = ⟨α'_i|α_j⟩ = 448's B†. (2) Completeness proves unitarity. (3) Eq. 1.3's sign and [U†]_ij's indices (N4, N5).
- **Equations:** $c'_i = \sum_j U_{ij}c_j,\quad U_{ij} = \langle\alpha'_i|\alpha_j\rangle,\quad UU^\dagger = I,\quad A' = UAU^\dagger$
- **Trap:** trusting Eq. 1.3's sign: it turns ψ at 30° into the state at 60°.

### `q2-photon`
- **G points:** (1) A photon has two polarization states, |x⟩ and |y⟩. (2) For light the state turns with the filter: Malus's cos²χ. (3) |R⟩ and |L⟩ only pick up a phase when the frame turns. (4) So J_z = ±ħ: a photon's spin.
- **F points:** (1) The frame U is a rotation (det +1). (2) |R'⟩ = e^{−iχ}|R⟩, |L'⟩ = e^{iχ}|L⟩. (3) χ in the lab is 2χ on the qubit sphere.
- **Equations:** $|x'\rangle = \cos\chi|x\rangle + \sin\chi|y\rangle,\quad |R'\rangle = e^{-i\chi}|R\rangle,\quad J_z|R\rangle = \hbar|R\rangle$
- **Trap:** "a new phase makes a new state": |R'⟩ = −i|R⟩ at 90° is the same state.

## 7. Symbol-before-use tables

Abbreviations: bs, gs, sp, op, ch, ph. Carried from Q1 and F1, mapped in `Lecture.symbols` to `q2-basis` as a recap:
|ψ⟩, ⟨·|, ⟨·|·⟩, |±z⟩, |±x⟩, |±y⟩, |0⟩, |1⟩, 0 (zero vector), ‖·‖, i, e^{iφ}, †, ℂ, Vⁿ(ℂ), ħ, S_z, P (probability),
δ (F1's phase), the Born rule; Formal only: |+z⟩⟨+z| and [S_z, S_x] (Q1 `q1-sequences`).

### 7.1 Ground track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $c_i$, $\vert\alpha_i\rangle$, $n$ | bs:b1 | bs:b1 | OK | The notes' letters. |
| $\vert e_i\rangle$ | bs:b3 | bs:b3 | OK | Basis arrows. |
| $\psi$ (the arrow at 30°) | bs:b3 | bs:b3 | OK | The running state. |
| $\delta_{ij}$ | bs:b4 | bs:b4 | OK | Tag `qc-kronecker-delta`. |
| $\vert\beta_j\rangle$, $\vert\alpha'_j\rangle$, $\vert\alpha_j\rangle$ | gs:b1–b3 | gs:b1–b3 | **FLAG** | Arrows here; α, β are numbers from sp:b1 on. gs:b1 note and sp:b1 text say so. |
| $\alpha$, $\beta$ (amplitudes) | sp:b1 | sp:b1 | OK | — |
| $\delta_\pm$ | sp:b3 | F1 (link-back) / sp:b3 | gloss | Carried from F1. |
| $A$, $a$, $b$ | op:b1 | op:b1 | OK | A is also Fig. 6's table in op:b2. |
| $K$ | op:b3 | op:b3 | OK | The shear. |
| $A_{ij}$, $f_i$ | op:b5 | op:b5 | OK | — |
| $c'_i$, $U$, $U_{ij}$, $\vert\alpha'_i\rangle$ | ch:b1 | ch:b1 | OK | Primes now mean the new basis (gs used them for leftovers; different unit). |
| $d_1$, $d_2$ | ch:b2 | ch:b2 | OK | The notes' letters for x components. |
| $I$, $U^\dagger$ | ch:b4 | ch:b4 | OK | I: "the operator that changes nothing". |
| $A'$ | ch:b5 | ch:b5 | OK | — |
| $H$ | ch:b6 | ch:b6 | OK | Tag `qc-hadamard`; S_z's x table (ch:b5) is written without H. |
| $\vert x\rangle$, $\vert y\rangle$ | ph:b1 | ph:b1 | **FLAG** | Not \|±x⟩: the b1 caption says so. |
| $\chi$, $\vert x'\rangle$, $\vert y'\rangle$ | ph:b2 | ph:b2 | OK | χ is the notes' ϕ. |
| $\vert R\rangle$, $\vert L\rangle$ | ph:b3 | ph:b3 | OK | — |
| $J_z$ | ph:b5 | ph:b5 | OK | — |

### 7.2 Formal track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| LI, LD, $V(F)$ | bs:b1–b2 | bs:b1–b2 | OK | — |
| $V^n$ vs the notes' $V^N$ | bs:b3 | bs:b3 | OK | N3. |
| $\vert s_x = \pm\rangle$ | sp:b2 | sp:b2 | OK | The notes' notation, once. |
| $\hat c$, $\hat f$, $\hat A$ | op:b5 | op:b5 | OK | Columns and matrix. |
| $R(45^\circ)$ | op:b2 | op:b2 | OK | A rotation of the plane. |
| $\vert k'\rangle$, $\vert l'\rangle$, $A'_{kl}$ | ch:b5 | ch:b5, D3 | OK | The notes' shorthand. |
| $\det$ | ph:b2 | ph:b2 | **FLAG** (minor) | Used only as ±1; Q3 defines det for the characteristic equation. |
| $R_y$ | ph:b6 | 448 L6 via bridge | gloss | Formal only. |
| $\sigma_y$ | — | — | — | Avoided: J_z is written as its table (Pauli matrices are Q3's). |

**Counts:** Ground 2 FLAGs, Formal 1 FLAG, all resolved in text.

## 8. Errata

The notes' physics is right. Each item below was checked on the page render (img) or in the maths (math), and every
`Correction` is paraphrased, source `'notes'` unless marked.

### 8.1 Corrections (errata box, with `check()`)
| # | Where | The notes say (paraphrased) | It should say | `check` |
|---|---|---|---|---|
| N4 (map) | p. 9, Eq. 1.3 (img) | The \|−x⟩ coefficient is (c₂ − c₁)/√2. | (c₁ − c₂)/√2, as the matrix just below it gives. The printed sign turns the state at 30° into the one at 60°. | `close(V.q2D30[1], (V.q2Comp30[0] - V.q2Comp30[1]) / Math.SQRT2) && V.q2Printed < 0 && V.q2WrongIs60` |
| N5 (map) | p. 9 (img) | [Û†]_ij = U*_ji equals ⟨α_j\|α'_i⟩. | U*_ji = ⟨α_i\|α'_j⟩; the printed bracket is U*_ij. The boxed proof uses the right form. The two differ once U is not symmetric, e.g. z → y. | `close(V.q2UyDag01.re, Math.SQRT1_2) && close(V.q2UyNotes01.im, Math.SQRT1_2) && Math.abs(V.q2UyNotes01.re) < 1e-12` |
| N20 (new) | p. 10 (img) | A linear operator maps V onto itself. | Into itself: its outputs need not fill V. The projector \|+z⟩⟨+z\| is linear, yet every output lies on one line. | `V.q2ProjRank === 1` |

### 8.2 Silent fixes and notes (no box)
| # | Where | Point | Action |
|---|---|---|---|
| N3 (map) | p. 6 | The basis theorem writes V^N, Σc_i\|α_i⟩ and "{α_i} not LI" for Vⁿ, \|e_i⟩, {e_i}. | Read as intended; F text of `q2-basis:b3`. |
| N19 (new) | p. 7 | "We choose … δ₋ = π." | Only δ₊ = 0 is a choice; orthogonality forces δ₋ (`q2-spin-space:b3`; F1 says the same). |
| N6 (map) | p. 7 | \|→⟩, \|←⟩ name \|±x⟩; p. 9's R, L are circular light. | Rosetta; never "right/left" for \|±x⟩ (C4). |
| — | p. 9 | R = (\|x⟩ + i\|y⟩)/√2 carries J_z = +ħ. | Optics books that name handedness from the receiver call it left-circular; the gloss `qc-helicity` keeps the notes' R = positive helicity. |
| — | p. 10, Fig. 6 | The turn angle is called φ. | App text gives the value (45°): φ is the Bloch azimuth. |

### 8.3 Found for later chapters (book, `source:'book'`)
- **B33 (map)** Bergou p. 257: in cos θ|0⟩ + sin θ e^{iφ}|1⟩ the Bloch polar angle is 2θ. Q2 states it in F only (b6 ref).
- **B35 (new, img)** Bergou p. 257: the printed U = (cos θ, ie^{−iφ}sin θ; ie^{iφ}sin θ, cos θ) gives U|0⟩ = cos θ|0⟩ +
  ie^{iφ}sin θ|1⟩, not the stated cos θ|0⟩ + e^{iφ}sin θ|1⟩. At θ = 30°, φ = 0 the two states overlap 0.625
  (`q2BergouOverlap`). U itself is unitary; the phase i is lost. Q24 owns §14 (§12 Q3).

**Checked and correct:** LI/LD and dimension (p. 6); the unique-components proof; ON and c_i = ⟨e_i|ψ⟩; Gram–Schmidt
and Fig. 4; Eqs. 1.1–1.2 and the |α| = |β| argument; the inverse (pp. 7–8); Fig. 5 and both of its warnings; U_ij and
the "column j" reading; the d = Ûc matrix; c'_i = ΣU_ik c_k; A'_kl and Â' = ÛÂÛ†; the boxed ÛÛ† = 1̂; the frame turn
and its unitarity; |R'⟩ = e^{−iϕ}|R⟩, |L'⟩ = e^{iϕ}|L⟩ and J_z = ±ħ (sign checked: e^{−iϕσ_y} is the active turn that
takes |x⟩ to |x'⟩); linearity; Fig. 6; f_i = ΣA_ij c_j; A = ΣA_ij|e_i⟩⟨e_j|. Bergou Eq. 1.8; N&C Eq. 1.19 (it confirms N4).

## 9. Engine gaps and stage-contract gaps

### 9.1 Engine
Existing and sufficient: `linalg.ts` (`inner`, `norm`, `norm2`, `vadd`, `vsub`, `vscale`, `normalize`, `outer`, `apply`,
`matmul`, `dagger`, `matEq`, `isUnitary`, `fromColumns`, `gramSchmidt`), `qc/cmat.ts` (`components`, `isIndependent`,
`rankN`, `changeU`, `angleBetween`), `spin.ts` (`KET`, `ketFromBloch`, `prob`, `projector`, `samePhysicalState`,
`blochAngle`, `rotation`, `SX`, `SZ`, `SIGMA_Y`), `qc/gates.ts` (`H`, `I2`), `qc/state.ts` (`ket`), `sg.ts` (`benchTheory`).

| # | Function | Formula | Used by | numpy twin |
|---|---|---|---|---|
| E1 | `qc/optics.ts`: `polKet(χ)`, `circular: {R, L}`, `frameTurn(χ)` | (cos χ, sin χ); (1, ±i)/√2; (cos χ, −sin χ; sin χ, cos χ) = e^{−iχσ_y} | ph:b2–b7, `q2-p-*` | explicit arrays; `frameTurn(χ)` vs `scipy.linalg.expm(−1j·χ·σ_y)` |

Fallback for E1: the photon claims compose `ketFromBloch(2χ, 0)`, `KET['±y']` and `rotation([0,1,0], 2χ)` (as the
evidence scripts do), with a `bridge448`-style test that pins the identification. E1 only gives the photon its own names.

### 9.2 Stage contract
| # | Gap | Proposal | Fallback |
|---|---|---|---|
| S1 | The plane's 709 passport and readouts name \|0⟩ = \|+z⟩, \|1⟩ = \|−z⟩; the photon unit needs \|x⟩, \|y⟩. | `HilbertPlaneState.labels?: 'spin' \| 'photon'` (additive). 'photon': axis labels \|x⟩ across, \|y⟩ up; shadow and bar names \|x⟩, \|y⟩; passport "STATE SPACE · photon polarization (real slice)"; fidelity `qc-plane-photon-angles` (exact): "For light the state turns by the filter's own angle: no halving." Drops `plane-half-angles` from that drawer. | Spin labels, with a misleading-class fidelity line "in this unit the axes stand for \|x⟩ and \|y⟩". |
| S2 | `amplitudes` cannot show a global phase (\|R'⟩ = e^{−iχ}\|R⟩). | `AmplitudesState.globalPhaseDeg?: Scrub`: every amplitude times e^{iγ} before drawing; dials turn together, bar lengths and chances unchanged; readout "phase γ° · same state". Q4 and Q16 will want it too. | Static bars; the caption carries the phase. |

Notes, no request: (a) `vector-3d` for Fig. 4 stays deferred (ruling 5); gs:b4's caption carries the 3D numbers.
(b) On gs:b3 the drawer's `plane-update-bookkeeping` names Rule 3 while the arrow grows by Gram–Schmidt's rescaling;
W may add the one-line 709 note `qc-plane-gs-rescale`, or the caption's "rescaled" stands. (c) The unused 448 variant
`bloch.labels:'poincare'` puts S₁ on x and S₃ on z while its fidelity text puts H and V at the poles; Q2 avoids it.

### 9.3 Widget gaps
None. The photon Try-it reuses `projector` with a caption Rosetta.

## 10. Media
- **Opener:** none (Part I's Blender opener plays before Q1).
- **Film (deferred) `qc-q2-two-grids`** "One arrow, two grids": the z frame turns 45° under ψ; manifest `q2Comp30`, `q2D30`, `q2Px30`.
- **Film (deferred) `qc-q2-photon-frame`** "Turning the frame rephases R": the dials of \|R⟩ and \|L⟩ counter-turn; manifest `q2Rp45`, `q2Pol45`.
- **Decor (Higgsfield, credits need the user):** polarizing filters over a sunlit bench, glare fading as one turns; no labels, no numbers.

## 11. Hooks

### 11.1 Concept-map stations
| id | label | chapter · unit | needs | sameAs (448) |
|---|---|---|---|---|
| `qc-basis` | Independent arrows, bases, unique components | Q2 · `q2-basis` | `qc-inner-product` | `principles` |
| `qc-gram-schmidt` | Gram–Schmidt builds an orthonormal basis | Q2 · `q2-gram-schmidt` | `qc-basis` | — |
| `qc-x-states` | The x states from the Stern–Gerlach facts | Q2 · `q2-spin-space` | `qc-basis`, `qc-phase` (F1) | `mutually-unbiased` |
| `qc-operator-matrix` | Operators, outer products and tables | Q2 · `q2-operators` | `qc-basis` | `operators` |
| `qc-change-of-basis` | Changing basis: U, H and UAU† | Q2 · `q2-change` | `qc-operator-matrix`, `qc-x-states` | `basis-change` |
| `qc-photon-frames` | Photon polarization and turning frames | Q2 · `q2-photon` | `qc-change-of-basis`, `qc-euler` (F1) | `rz` |

### 11.2 Arcade (5 levels, all Spot the error)
Label constant: `const Q2x = (unit, label) => ({ lecture: 'Q2', unit, label })`.
1. **`q2-basis` · `qc-slanted-overlaps`** — "Components from overlaps"
   - Steps: "|+z⟩ and |+x⟩ are independent, so they form a basis." · "Every vector has unique components in it." · "The components of |−z⟩ are its overlaps, 0 and 0.707." · "Unique components mean one recipe per vector."
   - `wrong: 2`. Why: overlaps give components only in an orthonormal basis; here they are −1 and 1.414 (`q2NonOrth`).
2. **`q2-gram-schmidt` · `qc-gs-no-rescale`** — "A basis that is too short"
   - Steps: "Keep |α'_1⟩ = |+z⟩." · "The shadow of the 60° arrow on |+z⟩ is 0.5|+z⟩." · "Removing it leaves (0, 0.866), at right angles to |+z⟩." · "So |+z⟩ and (0, 0.866) form an orthonormal basis."
   - `wrong: 3`. Why: (0, 0.866) has length 0.866; rescale it first (`q2GsResLen`).
3. **`q2-spin-space` · `qc-delta-ninety`** — "Any phase for |−x⟩?"
   - Steps: "|±x⟩ = (|+z⟩ + e^{iδ±}|−z⟩)/√2, with equal sizes." · "δ₊ = 0 is a free choice of phase." · "δ₋ is free too, so take δ₋ = 90°." · "The z chances of that state are ½ and ½."
   - `wrong: 2`. Why: orthogonality forces δ₋ = 180°; 90° gives |+y⟩, with P(+x) = 0.5 (`q2Delta90`).
4. **`q2-change` · `qc-eq13-sign`** — "A sign in the notes" (credited to the notes' Eq. 1.3, N4)
   - Steps: "ψ = c₁|+z⟩ + c₂|−z⟩." · "Put in |±z⟩ = (|+x⟩ ± |−x⟩)/√2." · "Collecting gives d₂ = (c₂ − c₁)/√2." · "Either way, the chances along x are d₁² and d₂²."
   - `wrong: 2`. Why: d₂ = (c₁ − c₂)/√2; the printed sign describes the state at 60° (`q2Wrong`). Step 4 holds for both signs.
5. **`q2-photon` · `qc-frame-phase`** — "Turning the frame on circular light"
   - Steps: "|R⟩ = (|x⟩ + i|y⟩)/√2." · "Turning the frame by χ gives |R'⟩ = e^{−iχ}|R⟩." · "A new phase factor makes a new state." · "So a filter for |R⟩ passes |R'⟩ with the same chance."
   - `wrong: 2`. Why: a global phase changes no chance; |R'⟩ is the state |R⟩ (`q2Rot90`: 1).

## 12. Questions for the judge

**Q1. Unit order.** The map lists `q2-change` (notes pp. 8–9) before `q2-operators` (p. 10), but p. 9's A' = UAU† uses
A_ij, outer products and the identity as a sum. This plan puts `q2-operators` fourth, so every symbol exists before D3.
*Recommend:* accept; the Read mode keeps the notes' order, and the story states the swap in the chapter note.

**Q2. Ownership against 448 L5.** 448 owns B, c_new = B†c_old and A_new = B†AB (`l5-coordinates`, `l5-operators`). Q2
derives c' = Uc and A' = UAU† again (D2, D3), in the notes' convention U = B†, by the notes' route (overlaps; two
identity insertions). *Recommend:* keep both derivations (709 chapters stand alone and these are the notes' own
proofs), with bridges and the Rosetta line; no 448 edit.

**Q3. Bergou p. 257 (B35).** The printed polarization U drops a phase i. Q2 cites p. 257 only for |0⟩ = |H⟩ and the angle
doubling. *Recommend:* record B35 now and box it in Q24, which owns §14; Q2 shows no Bergou formula from that page.

**Q4. Stage gaps S1 and S2.** *Recommend:* build both before Q2 (small, additive; S2 also serves Q4's global phases). With
the fallbacks, 5 of the photon unit's 7 beats would carry a misleading label or a caption-only phase.

**Q5. δ₋ (N19).** F1 already states that δ₋ = π is forced. *Recommend:* a silent note (no box): the notes' "choose" is
loose wording, and Q2's b3 gives the forced value with the reason.
