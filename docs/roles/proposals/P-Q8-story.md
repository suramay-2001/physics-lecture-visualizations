# P-Q8-story — Q8 "Mixtures, the density matrix and the Bloch ball" (role P, Physics 709)

Proposal only. Nothing under `app/` is modified. Format: `P-Q6-story.md` (two tracks; the 13 sections of
`skills/03-chapter-plan`), with the two standing gates: every derivation list, in both tracks, steps the stage through
≥ 2 distinct views (`DerivStep.view`, `viewCaption`; W-709 #7), and every new space or notation gets exactly one notation
beat (`Beat.introduces`, `GlossEntry.introduces`; W-709 #8). Map entry: `P-709-remap-L1L7.md` §1.1 (L7 §G–§I.1), §1.3
(HW2 P4, P6, P7(e)), §1.4, §2 Q8, §4 rows Q8 D1–D13 and HW2, §5, §6. Rulings: `qc709-remap.md` (#2, #9, #10, #12, and the
review rulings: no raw TeX, engine-backed answers), `qc709-Q6Q7.md` (#2, #7, build order). Planned together with
`P-Q9-story.md`, which takes this chapter's ρ, Tr and Bloch ball to two qubits.

**Sources read.**
- Notes L7 pp. 34–38 (text; the renders of p. 35 and p. 37 checked by eye against the text).
- HW2 P4 and P6 (worked in full here, ruling 12) and P7(e) (stated in Unit 8.1; Q9 works it).
- Bergou, as the re-map cites it (printed pages; read): §2.1 p. 15, Eqs. 2.1–2.2; §2.2 p. 17, Eqs. 2.12–2.13; p. 18 (Tr ρ² = 1
  iff pure); §2.3 p. 19, Eqs. 2.18–2.20 (the notes' 2.14–2.16); pp. 19–20, Eqs. 2.21–2.24 (the notes' 2.17–2.20; Eq. 2.24 has
  a misplaced bracket, erratum B3); p. 20, Eqs. 2.25–2.27 (convexity; a pure state has one recipe); §2.4 pp. 20–21, the
  decomposition theorem and Eq. 2.28; §5.2 p. 80, postulates 4a–6a.
- N&C (cited, headings and equations checked): §2.4.1–2.4.2 pp. 99–105, Theorem 2.6 p. 103 (unitary freedom),
  Exercise 2.72 p. 105 (the Bloch ball).
- Ownership (re-map §2.2): Q8 owns ρ, Tr, coherences, mixtures, purity, the Bloch ball, positivity, convexity, the
  recipes and the von Neumann equation. Q7 owns GHZ; Q6 owns Bell states and the correlation grid; Q4 owns ⊗ on operators
  (`qc-tensor-operator`, ruling Q6Q7 #2); Q3 owns projectors, Pauli matrices, the Bloch sphere, operator space a₀I + a·σ,
  commutators; Q2 owns |a⟩⟨b|; Q1 owns the word "mixture" (`qc-mixture`). Q9 owns the partial trace and entropy.

**Evidence.** Every number was computed twice, for Q8 and Q9 at once.
- The app's engine on main c4f6fb7 (`q89plan-engine.ts`, scratchpad, bundled with rolldown). E1 has merged, so every
  call is the one `Q8.values.ts` will make: `densityOf`, `mixtureN`, `purityN`, `reducedBloch`, `partialTrace`,
  `spectrum`, `eigenEnsemble`, `ensembleUnitary`, `evolveRho`, `thermalPolarization`, `isDensity`, `cmat.detN`, `eigh`.
- An independent numpy/scipy route (`q89plan-numpy.py`): states from the notes' formulas (the N state, Eq. 2.19's u±);
  averages as ⟨ψ|σ|ψ⟩ instead of traces; measurement by explicit projectors; the box by projecting qubit 3 and tracing it
  with `einsum`; ρ(t) by `scipy.linalg.expm` and a finite difference; thermal weights from Boltzmann factors; HW2 P4 and P6
  from their closed forms; the recipe unitary by `lstsq` with a full-SVD completion.
- Result (`q89plan-compare.py`): 500 numbers under 188 keys (both chapters) agree to 6 decimals, with **one exception**:
  `q8TrineUUnitary`. The engine's `ensembleUnitary` returns a U that solves A·U = B but is **not unitary** when one recipe
  has more members than the dimension (the padding case of the theorem). This is an engine bug (§9.1, §12 Q1). The
  numpy file runs byte-identically twice.

**Conventions** (Q6's, plus these).
- **The Bloch vector of ρ is r** (ruling 10). Rosetta, once, in the Bloch-ball notation beat: "the notes and Bergou
  write n; HW2 P6 writes a". In Q3, n is a direction of a pure state; here r may be shorter than 1.
- **Operator-space a.** Q3's picture writes an operator as a₀I + a·σ. For ρ this is a₀ = ½ and a = r/2. HW2 P6's a is our
  r, not Q3's a; the plan says so in place (§7.2 FLAG).
- **Qubits.** Engine q0 = the notes' qubit 1 = the top wire. The GHZ box reads **qubit 3** (q2), so the box holds qubits 1
  and 2 and is the notes' ρ₁₂ = Tr₃ (p. 35; HW2 P7(e)); the notes' p. 34 reads qubit 1 (§8, §12 Q2).
- **Bell names (ruling 9).** First Bell name in the chapter: "$\Phi^+$ (notes, N&C: $\beta_{00}$; Bergou: $\Psi_+$)", in Unit 8.1.
- **Units.** ħ = 1 in the engine, S = σ/2, the UI appends ħ (⟨S_z⟩ = 0.25ħ). The thermal unit uses x = E_Z/k_BT, a pure
  number; no physical constants are displayed.
- **Phases.** [L] notes; [B] a second source (Bergou, N&C, or the HW2 sheet, cited "HW2 P4"); [C] clue.
- **Numbers.** Every number in a G, F or caption string is rendered from its listed claim with `d(V.key, n)`; the plan
  prints the value for review only. Every answer key is `V.key`, never a literal. Matrix entries and chances print as
  decimals or fractions; an amplitude is never a percentage; this chapter shows no percent at all.
- **Text.** All inline math is TeX inside `$…$`; no TeX command outside `$…$`. No plan ids (D1, §5, b3) in learner text:
  cross-references read "Unit 8.4", "Chapter Q9". Units: 8.1 `q8-why`, 8.2 `q8-pure-rho`, 8.3 `q8-trace-rule`, 8.4
  `q8-mixed`, 8.5 `q8-ball`, 8.6 `q8-recipes`.
- **Claim keys** `q8…` in `Q8.values.ts`, as `Q5.values.ts`.

**Stage shorthand.** Each form expands to exactly one `StageState` (a derivation `view` is always one state; `split` is for
beat stages only). Q6's forms carry over; the new ones are marked new.

| Shorthand | Expands to | Needs |
|---|---|---|
| `amp(S, f)` | `{kind:'amplitudes', state:S, ...f}` | — |
| `circ(C, k, f)` | `{kind:'circuit', circuit:C, upTo:k, ...f}` | — |
| `mx(src, f)` | `{kind:'matrix', source:src, labels:'kets', values:'exact', ...f}` ('exact' falls back to decimals off its table) | v1 |
| `tq(S, f)` | `{kind:'two-qubit', source:{ket:S}, labels:'q1-q2', arrows:'reduced', grid:'T', ...f}` | two-qubit |
| `tqR(M, f)` (new) | as `tq`, with `source:{rho:M}` (M a `matrix` ρ source) | two-qubit |
| `ball(P, f)` (new) | `{kind:'bloch-ball', point:P, purity:true, shot:'B-STD', ...f}` | — |
| `bl(D, f)` (new) | `{kind:'bloch', state:D, shot:'B-STD', ...f}` | — |
| `ops(a0, a, f)` (new) | `{kind:'operator-space', op:{a0, a}, eigen:true, shot:'O-STD', ...f}` (a₀, a from the values file) | — |
| `split(A / B)` | `{layout:'split', top:A, bottom:B}` (the two kinds differ; GL over SVG is allowed, as Q4 does) | — |

| Matrix source | Expands to | Needs |
|---|---|---|
| `out(K)` | `{outer:[K]}` = \|K⟩⟨K\| | v1 |
| `mix([w, K], …)` | `{rho:{mixture:[{w, ket:K}, …]}}`; w is an engine value or an exact fraction in code, and may sweep | v1 |
| `pa('X')`, `pa('XX')` | `{pauli:'X'}`; two letters: `{kron:[{pauli:'X'},{pauli:'X'}]}` | v1 |
| `prod(A, B, …)` | `{product:[A, B, …]}` = A·B·… as written | matrix-v2 |
| `lin([c, A], …)` | `{lin:[{c, src:A}, …]}`, c from the fixed exact set (±1, ±½, …) | matrix-v2 |
| field `spectrum:'bars'` | eigenvalue bars beside the matrix (`spectrum`) | matrix-v2 |

| Name | Source | Value |
|---|---|---|
| `N` | `{dir:{thetaDeg:60, phiDeg:45}}`: Q3's `N_STATE` (Unit 3.2) | $0.866\|0\rangle + 0.5e^{i45^\circ}\|1\rangle$ |
| `Nt` | `{dir:{thetaDeg:60, phiDeg:{from:45, to:135}}}`: N under $H = \tfrac\omega2Z$ for a quarter period | φ: 45° → 135° |
| `ZX` | `mix([1/2, {ket:'0'}], [1/2, {ket:'+'}])` (notes p. 36) | [[¾, ¼], [¼, ¼]] |
| `BOX` | `mix([1/2, {ket:'00'}], [1/2, {ket:'11'}])` (notes p. 35) | ½(\|00⟩⟨00\| + \|11⟩⟨11\|) |
| `TH` | `mix([V.q8ThermP[0], {ket:'0'}], [V.q8ThermP[1], {ket:'1'}])` at x = 2 | diag(0.881, 0.119) |
| `P4(p)` | `mix([p, {ket:'1'}], [1−p, {ket:'+'}])`; the sweep is `p:{from:0, to:1}` with `1−p` as `{from:1, to:0}` | HW2 P4 |
| `GHZ` | `{bell:'000+111'}` (`state.bell` takes any two-term content) | Q7's GHZ |
| ball points | `bZX` = `{mix:[{of:'+z', w:1/2}, {of:'+x', w:1/2}]}`; `bN` = `{thetaDeg:60, phiDeg:45}`; `bTH` = `{r:[0, 0, V.q8ThermR]}`; `bU` = `{mix:[{of:{thetaDeg:45, phiDeg:0}, w:V.q8ZXEig[0]}, {of:{thetaDeg:135, phiDeg:180}, w:V.q8ZXEig[1]}]}` | — |

**Circuits** (Q7's, gate shorthand as Q5): `C_GHZ` = 3 · `'000'` · `[g(H,0)] [cx(0,1)] [cx(0,2)]`; `C_GHZM(q)` = `C_GHZ`
then `[m(q,0)]`, clbits 1. Q8 uses `C_GHZM(2)` (read qubit 3) at k = 4 with `outcomes:'0'` or `'1'`. All carry
`wires:['1','2','3']`.

## 0. Chapter map

Q8 answers the map's question: **"How do you describe a box of qubits when nobody wrote down which state each one is in?"**
It is the second chapter of Part III, "Correlations and the density matrix".

| # | id | Title (≤ 8 words) | Driving question | Sources | 448 bridges | Link-backs |
|---|---|---|---|---|---|---|
| 1 | `q8-why` | The GHZ box: a coin, not a superposition | A GHZ qubit was read and the record lost: what is left in the box? | notes L7 pp. 34–35; HW2 P7(e) (stated) | `l6-mixture` | Q7 `q7-ghz` (GHZ, `C_GHZM`); Q6 Φ⁺ and the grid |
| 2 | `q8-pure-rho` | One state as a matrix | What do we gain by writing a state as $\|\psi\rangle\langle\psi\|$? | notes L7 p. 35; Bergou §2.1 p. 17, Eq. 2.11 | `l4-projectors` | Q2 outer products; Q3 projectors, `N_STATE` |
| 3 | `q8-trace-rule` | Averages and motion from the density matrix | How do averages, readings and time evolution look in the matrix language? | notes L7 p. 36; Bergou §2.1 p. 15, Eq. 2.1; §5.2 p. 80 | `l1-average`, `l3-postulates` | Q3 averages, commutators; Q2 precession |
| 4 | `q8-mixed` | Mixtures: chances without phases | How do we write a box whose members are in different states? | notes L7 pp. 36–37; Bergou §2.1 p. 15, Eq. 2.2; p. 18; HW2 P4 | `l6-mixture` | Q1 `qc-mixture` (the word) |
| 5 | `q8-ball` | The Bloch ball: mixed states inside | Where do mixed states sit, if pure states fill the sphere's surface? | notes L7 p. 37, Eqs. 2.14–2.16; Bergou §2.3 p. 19, Eqs. 2.18–2.20; N&C Ex. 2.72 p. 105; HW2 P6 | `l6-bloch` | Q3 `q3-bloch`, operator space |
| 6 | `q8-recipes` | One matrix, many recipes | If two boxes give the same matrix, can any experiment tell them apart? | notes L7 pp. 37–38, Eqs. 2.17–2.21; Bergou pp. 19–21, Eqs. 2.21–2.28; N&C Thm 2.6 p. 103 | — | Q3 H eigenstates; Q2 changes of basis |

**One move against the map** (§12 Q2): the box reads qubit 3, not qubit 1, so that it is the notes' ρ₁₂ = Tr₃ and HW2
P7(e)'s state from the first beat on. Nothing else changes order.

**Outcomes** (Ground wording):
- Explain why a box from which a reading was lost is a coin toss, not a superposition, and name the x test that tells them apart.
- Write a pure state as the matrix $\rho = |\psi\rangle\langle\psi|$, read chances off its diagonal and phases off its corners.
- Compute an average as $\mathrm{Tr}(A\rho)$, and say what a reading without a record does to ρ.
- State how ρ moves in time, and why diagonal ρ stands still under $\tfrac\omega2Z$.
- Build ρ for a mixture, and use $\mathrm{Tr}\,\rho^2$ to tell mixed from pure.
- Place any one-qubit ρ in the Bloch ball, from $\rho = \tfrac12(I + \mathbf r\cdot\boldsymbol\sigma)$ and $r_j = \mathrm{Tr}(\rho\sigma_j)$.
- Show that one ρ has many recipes, and that a pure state has exactly one.

**Prerequisites** (concepts): Q7 `qc-ghz`; Q6 `qc-bell-basis`, `qc-correlation-grid` (two-qubit picture); Q3
`qc-born-projector`, `qc-bloch-sphere`, `qc-spin-operators`, `qc-observables`, `qc-uncertainty` (commutators); Q2
`qc-operator-matrix`, `qc-photon-frames` (the generator, $U(\chi) = e^{-iJ_z\chi/\hbar}$); Q1 `qc-sg-quantization`
(precession). Reused glossary: `qc-mixture`
(Q1), `qc-outer-product`, `qc-matrix-element`, `qc-hadamard`, `qc-unitary` (Q2), `qc-projector`, `qc-bloch-sphere`,
`qc-pauli-matrices`, `qc-expectation`, `qc-eigenvalue`, `qc-commutator`, `qc-selective-measurement` (Q3), `qc-tensor-product`,
`qc-tensor-operator` (Q4), `qc-pauli-string`, `qc-correlation-grid`, `qc-product-state` (Q6), `qc-ghz` (Q7). 448 twins:
`l6-mixture`, `l6-bloch`, `l1-average`, `l3-postulates`, `l4-projectors`.

**Openers and films.** Part III's opener (the old map's "two recipes, one point", a Blender still) is re-homed here; one
Motion Canvas film is planned and deferred (§10).

## 1. Story beats per unit

Kinds per unit (a derivation `view` may use only kinds that the unit's beat stages show; checked per unit below):
`q8-why` circuit, amplitudes, two-qubit, matrix · `q8-pure-rho` amplitudes, matrix · `q8-trace-rule` matrix, bloch ·
`q8-mixed` matrix, two-qubit, bloch-ball · `q8-ball` operator-space, bloch-ball, matrix · `q8-recipes` bloch-ball, matrix.
Fidelity items used: `qc-amp-engine`, `qc-amp-hue-is-phase`, `qc-circuit-engine-state`, the `matrix` items
(`qc-matrix-entries`, `qc-matrix-trace-engine`, `qc-matrix-hue-is-phase`, `qc-matrix-not-a-space`), the `two-qubit` items
(`qc-tq-local-arrows`, `qc-tq-grid-signed`, `qc-tq-not-two-places`), 448's ball items (`ball-surface-pure`,
`ball-born-inside`, `ball-many-recipes`, `ball-inside-not-partly-up`, `ball-direction-average`), `bloch-rotation-exact`,
`op-one-point`, `op-a0-gauge`.

**Two placements against the re-map's §5** (§12 Q3): the Bloch ball as a *space* is introduced in Unit 8.4, where the
first mixture's point falls inside the sphere; Unit 8.5 then derives its exact form. The Hamiltonian is written $\hat H$
everywhere, because H is the Hadamard gate (Q2, Q4) and Unit 8.6 uses both (§12 Q4).

### Unit `q8-why` — The GHZ box: a coin, not a superposition

**`q8-why:b1` [L]** (read one qubit, lose the record)
- **G:** "Take Chapter Q7's GHZ state, $(|000\rangle + |111\rangle)/\sqrt2$. Read qubit 3 alone, and shut qubits 1 and 2 in a box. The reading is 0 or 1, each with chance ½. After a 0 the box holds $|00\rangle$; after a 1 it holds $|11\rangle$."
- **F:** "Measure qubit 3 of $|\mathrm{GHZ}\rangle = (|000\rangle + |111\rangle)/\sqrt2$ in the 0/1 basis and keep qubits 1 and 2 (notes p. 34, which reads qubit 1; by symmetry nothing changes). Each outcome has probability ½, and the pair is left in $|00\rangle$ or $|11\rangle$ accordingly."
- **Cap:** G "read qubit 3: 000 or 111, chance ½ each" · F "$P(0) = P(1) = \tfrac12$; the pair is left in $|00\rangle$ or $|11\rangle$"
- **Stage:** `split( circ(C_GHZM(2), 4, {outcomes:'0'}) / amp({circuit:C_GHZM(2), upTo:4, outcomes:'0'}) )`.
- **Claims:** `q8GhzP3` → 0.5, 0.5 · `q8GhzPost` → $|000\rangle$ (outcome 0), $|111\rangle$ (outcome 1).
- **Terms:** `qc-ghz` (Q7, link-back).

**`q8-why:b2` [L]** (the box without its record)
- **G:** "Now someone hands us the box but not the record. We open it and read both qubits. We find 00 or 11, each half the time, and never 01 or 10. It is as if a fair coin had chosen $|00\rangle$ or $|11\rangle$."
- **F:** "Without the record, z readings of the pair give 00 or 11 with probability ½ each, never 01 or 10 (notes pp. 34–35). The box behaves like an ensemble prepared by a fair coin: $|00\rangle$ or $|11\rangle$, each with probability ½."
- **Cap:** G "the box's table: chances ½ at 00 and 11; the bits always agree" · F "box: $P(00) = P(11) = \tfrac12$, $\langle Z_1Z_2\rangle = 1$"
- **Stage:** `split( tqR(BOX, {highlight:['zz']}) / mx(BOX) )` — needs: two-qubit. The matrix is shown as a table; ρ is named in Unit 8.2 and the caption does not use the symbol.
- **Claims:** `q8BoxP` → (0.5, 0, 0, 0.5) · `q8BoxZZ` → 1.
- **Fidelity:** `qc-tq-not-two-places`.

**`q8-why:b3` [L]** (the x test; D1)
- **G:** "Could the box hold Chapter Q6's $\Phi^+ = (|00\rangle + |11\rangle)/\sqrt2$ instead (the notes' $\beta_{00}$)? In z it gives the same outcomes with the same chances. Now read x on both qubits and multiply the two results. $\Phi^+$ always gives +1. The coin box gives +1 and −1 equally often, so its average is 0."
- **F:** "The superposition $\Phi^+$ (notes, N&C: $\beta_{00}$; Bergou: $\Psi_+$) has the same z statistics. But $\langle X_1X_2\rangle_{\Phi^+} = +1$, while the coin ensemble gives $\tfrac12\langle00|XX|00\rangle + \tfrac12\langle11|XX|11\rangle = 0$ (notes p. 35). Repeated XX readings tell the two apart."
- **Cap:** G "x test: $\Phi^+$ gives +1, the box 0" · F "$\langle XX\rangle$: 1 against 0"
- **Stage:** `split( tqR(BOX, {highlight:['xx']}) / amp({bell:'Phi+'}, {mode:'probability'}) )` — needs: two-qubit.
- **Claims:** `q8BoxXX` → 0 · `q8PhiXX` → 1 · `q8PhiP` → (0.5, 0, 0, 0.5).
- **Fidelity:** `qc-tq-grid-signed`.

**`q8-why:b4` [L]** (no ket fits; the GHZ link is gone)
- **G:** "So no single state of the pair describes the box. It is a [[qc-mixture|mixture]], the word from Chapter Q1: states with chances. Both members, $|00\rangle$ and $|11\rangle$, are products, so the box holds no entanglement. Losing one qubit destroyed the three-way GHZ link."
- **F:** "No ket reproduces both the z and the x statistics, so the pair is in no [[qc-pure-state|pure state]]; it is a [[qc-mixture|mixture]] (notes p. 35). A mixture of the products $|00\rangle$ and $|11\rangle$ carries no entanglement: GHZ entanglement does not survive the loss of one qubit, unlike the W state's. Chapter Q9 obtains this box from GHZ without reading qubit 3 at all (HW2 P7(e))."
- **Cap:** G "the box: no arrows, one grid cell" · F "box: $r_1 = r_2 = 0$, only $T_{zz} = 1$"
- **Stage:** `tqR(BOX)` — needs: two-qubit.
- **Claims:** `q8BoxGrid` → $T_{zz}$ = 1, all others 0 · `q8BoxArrows` → (0, 0, 0), (0, 0, 0).
- **Fidelity:** `qc-tq-local-arrows`.

**`q8-why:b5` [C]** (the y test)
- **Q G:** "Read y on both qubits and multiply. What is the average for $\Phi^+$, and what is it for the box?"
- **Q F:** "Compute $\langle Y_1Y_2\rangle$ for $\Phi^+$ and for the coin ensemble."
- **Reveal G:** "For $\Phi^+$ it is −1: the two y readings always disagree. For the box it is 0, as for x. Only the superposition links the qubits along x and y."
- **Reveal F:** "$\langle YY\rangle_{\Phi^+} = -1$ and $\langle YY\rangle_{\rm box} = 0$: $\Phi^+$'s grid is $\mathrm{diag}(1, -1, 1)$, the box's $\mathrm{diag}(0, 0, 1)$."
- **Reveal cap:** G/F "$yy$: −1 against 0"
- **Stage:** question `amp({bell:'Phi+'}, {mode:'probability'})` (z bars only; no grid, so nothing is given away); reveal `tq({bell:'Phi+'}, {highlight:['xx','yy']})` — needs: two-qubit.
- **Claims:** `q8PhiYY` → −1 · `q8BoxYY` → 0 · `q8PhiGrid` → diag(1, −1, 1) · `q8BoxGrid` → diag(0, 0, 1).

### Unit `q8-pure-rho` — One state as a matrix

**`q8-pure-rho:b1` [L] · notation beat, `introduces: ['qc-density-matrix']`** (ρ = |ψ⟩⟨ψ|)
- **G:** "Here is a new way to write a state. Take the ket $|\psi\rangle$ and its bra $\langle\psi|$, and form $\rho = |\psi\rangle\langle\psi|$, the [[qc-density-matrix|density matrix]]. It is Chapter Q3's projector onto $|\psi\rangle$. For one qubit it is a 2 × 2 table. Our example is Unit 3.2's state, with $\theta$ = 60° and $\varphi$ = 45°."
- **F:** "For a pure state the [[qc-density-matrix|density operator]] is the projector $\rho = |\psi\rangle\langle\psi|$ (notes p. 35), and $\rho^2 = |\psi\rangle\langle\psi|\psi\rangle\langle\psi| = \rho$. The running example is Unit 3.2's $|\psi\rangle = \cos30^\circ|0\rangle + e^{i45^\circ}\sin30^\circ|1\rangle$."
- **Cap:** G "$\rho = |\psi\rangle\langle\psi|$: a 2 × 2 table" · F "$\rho = |\psi\rangle\langle\psi|$ at $\theta$ = 60°, $\varphi$ = 45°"
- **Stage:** `split( amp(N, {dials:true}) / mx(out(N)) )`.
- **Claims:** `q8NAngles` → 60, 45 (inputs) · `q8NAmps` → (0.866, 0.354 + 0.354i) · `q8RhoN` → [[0.75, 0.306 − 0.306i], [0.306 + 0.306i, 0.25]] · `q8RhoNSqGap` → 0.
- **Terms:** `qc-outer-product` (Q2), `qc-projector` (Q3).

**`q8-pure-rho:b2` [L]** (the diagonal holds the chances; D2)
- **G:** "Write $|\psi\rangle = c_0|0\rangle + c_1|1\rangle$. The entry in row i and column j is $\rho_{ij} = c_ic_j^*$, where the star is Chapter F1's mirror. On the diagonal this is $|c_0|^2$ and $|c_1|^2$: the chances of reading 0 and 1."
- **F:** "In an orthonormal basis, $\rho_{ij} = \langle e_i|\psi\rangle\langle\psi|e_j\rangle = c_ic_j^*$ (notes p. 35). The diagonal $\rho_{ii} = |c_i|^2$ holds the Born probabilities of the basis states, here 0.75 and 0.25."
- **Cap:** G "diagonal: chances 0.75 and 0.25" · F "$\rho_{ii} = |c_i|^2$"
- **Stage:** `split( amp(N, {mode:'probability'}) / mx(out(N), {highlight:[[0,0],[1,1]]}) )`.
- **Claims:** `q8RhoN` diagonal → 0.75, 0.25.

**`q8-pure-rho:b3` [L] · notation beat, `introduces: ['qc-trace']`** (Tr ρ = 1; D3)
- **G:** "Add up the diagonal of a square matrix and you get its [[qc-trace|trace]], written $\mathrm{Tr}$. The diagonal of $\rho$ holds the chances, so $\mathrm{Tr}\,\rho = 1$. A [[qc-pure-state|pure]] $\rho$ also squares to itself: $\rho^2 = \rho$."
- **F:** "The [[qc-trace|trace]] $\mathrm{Tr}\,A = \sum_i\langle e_i|A|e_i\rangle$ sums the diagonal and is the same in every orthonormal basis. For a pure state $\mathrm{Tr}\,\rho = \sum_i\langle e_i|\psi\rangle\langle\psi|e_i\rangle = \langle\psi|\psi\rangle = 1$ (notes p. 35). Unit trace holds for every density matrix; $\rho^2 = \rho$ only for pure ones (Unit 8.4)."
- **Cap:** G "$\mathrm{Tr}$: 0.75 + 0.25 = 1" · F "$\mathrm{Tr}\,\rho = 1$"
- **Stage:** `mx(out(N), {trace:true})`.
- **Claims:** `q8RhoN` diagonal → 0.75, 0.25 · `q8RhoNTr` → 1 · `q8RhoNSqGap` → 0.
- **Fidelity:** `qc-matrix-trace-engine`.

**`q8-pure-rho:b4` [L] · notation beat, `introduces: ['qc-coherence']`** (the corners carry the phase)
- **G:** "The two corners, $\rho_{01}$ and $\rho_{10}$, are called [[qc-coherence|coherences]]. Their size here is 0.433, and their hue is the relative phase of $c_0$ and $c_1$. They are mirrors of each other, so $\rho$ equals its own mirrored transpose. Turn $\varphi$, and only the corners turn."
- **F:** "The off-diagonal entries $\rho_{ij}$, $i \ne j$, are the [[qc-coherence|coherences]]: they carry the relative phases, exactly what a classical mixture lacks (notes p. 35). Since $\rho_{ji} = \rho_{ij}^*$, $\rho$ is Hermitian, $(|\psi\rangle\langle\psi|)^\dagger = |\psi\rangle\langle\psi|$. Here $\rho_{01} = 0.433e^{-i\varphi}$ with $\varphi$ = 45°."
- **Cap:** G "turning $\varphi$ turns the corners; the diagonal stays" · F "$\rho_{01} = c_0c_1^* = 0.433e^{-i\varphi}$"
- **Stage:** `mx(out({dir:{thetaDeg:60, phiDeg:{from:45, to:225}}}), {highlight:[[0,1],[1,0]]})`.
- **Claims:** `q8RhoN01Abs` → 0.433 · `q8RhoN01Deg` → −45 · `q8RhoNHermGap` → 0.
- **Fidelity:** `qc-matrix-hue-is-phase`.

**`q8-pure-rho:b5` [C]** (the overall phase drops out)
- **Q G:** "Multiply $|\psi\rangle$ by an overall phase $e^{i\gamma}$. Which entries of $\rho$ change?"
- **Q F:** "How does $\rho$ change under $|\psi\rangle \to e^{i\gamma}|\psi\rangle$?"
- **Reveal G:** "None. Each entry is $c_i$ times the mirror of $c_j$, so the two phase factors cancel. $\rho$ keeps only what readings can see: the two angles of Unit 3.2."
- **Reveal F:** "$\rho \to e^{i\gamma}|\psi\rangle\langle\psi|e^{-i\gamma} = \rho$. The global phase drops out, so $\rho$ is the physical state itself: two real parameters for a pure qubit."
- **Reveal cap:** G/F "the same $\rho$ for every $\gamma$"
- **Stage:** question `amp(N, {dials:true, globalPhaseDeg:{from:0, to:180}})`; reveal `mx(out(N))`.
- **Claims:** `q8PhaseGap` → 0.

### Unit `q8-trace-rule` — Averages and motion from the density matrix

**`q8-trace-rule:b1` [L]** (⟨A⟩ = Tr(Aρ); D4)
- **G:** "Once we have $\rho$, an average needs no ket. Multiply the operator's matrix by $\rho$ and add up the diagonal: $\langle A\rangle = \mathrm{Tr}(A\rho)$. For $A = X$ this gives 0.612. That is the x part of the arrow of Unit 3.2."
- **F:** "$\langle\psi|A|\psi\rangle = \sum_{i,j}c_i^*A_{ij}c_j = \sum_{i,j}A_{ij}\rho_{ji} = \mathrm{Tr}(A\rho) = \mathrm{Tr}(\rho A)$ (notes p. 36; Bergou Eq. 2.11). For $A = \sigma_x$ this is 0.612, the x component of the Bloch vector. The form survives where no ket exists, which is why $\rho$ is useful."
- **Cap:** G "$\mathrm{Tr}(X\rho) = 0.612$" · F "$\mathrm{Tr}(\sigma_x\rho) = \langle\psi|\sigma_x|\psi\rangle = 0.612$"
- **Stage:** `mx(prod(pa('X'), out(N)), {trace:true})` — needs: matrix-v2.
- **Claims:** `q8TrN` → 0.612, 0.612, 0.5 · `q8ExpXN` → 0.612.
- **Terms:** `qc-expectation` (Q3).

**`q8-trace-rule:b2` [L] · notation beat, `introduces: ['qc-von-neumann-equation']`** (how ρ moves; D5)
- **G:** "A state moves in time by the Schrödinger equation, $i\hbar\tfrac{d}{dt}|\psi\rangle = \hat H|\psi\rangle$. Here $\hat H$ is the energy operator, not the H gate. A dot means a rate of change in time. Applied to both halves of $\rho = |\psi\rangle\langle\psi|$, the rule becomes the [[qc-von-neumann-equation|von Neumann equation]] $i\hbar\dot\rho = [\hat H, \rho]$."
- **F:** "With $i\hbar|\dot\psi\rangle = \hat H|\psi\rangle$ and $-i\hbar\langle\dot\psi| = \langle\psi|\hat H$, differentiating $\rho = |\psi\rangle\langle\psi|$ gives the [[qc-von-neumann-equation|von Neumann equation]] $i\hbar\dot\rho = [\hat H, \rho]$ (notes p. 36). Its sign is opposite to Heisenberg's $i\hbar\dot A = [A, \hat H]$, because $\rho$ is the state, not an observable. We write $\hat H$ for the Hamiltonian, since H is the Hadamard gate."
- **Cap:** G "$[\hat H, \rho]$ for $\hat H = \tfrac{\hbar\omega}2Z$: zero on the diagonal" · F "$[\hat H, \rho] = \hbar\omega\begin{pmatrix}0 & \rho_{01}\\ -\rho_{10} & 0\end{pmatrix}$"
- **Stage:** `mx(lin([1, prod(Hs, out(N))], [-1, prod(out(N), Hs)]))` with `Hs = lin([1/2, pa('Z')])` ($\hat H$ in units of ħω) — needs: matrix-v2.
- **Claims:** `q8VNComm` → [[0, 0.306 − 0.306i], [−0.306 − 0.306i, 0]] · `q8VNComm01Abs` → 0.433 · `q8VNCheck` → 0.

**`q8-trace-rule:b3` [L]** (the corners turn, the diagonal stays)
- **G:** "Take $\hat H = \tfrac{\hbar\omega}{2}Z$, a spin in a field along z, as in Chapter Q1's precession. The diagonal of $\rho$ never moves: the chances stay 0.75 and 0.25. The corners turn at rate $\omega$. After a quarter period the corner's hue has gone from −45° to −135°."
- **F:** "For $\hat H = \tfrac{\hbar\omega}2\sigma_z$ the commutator has zero diagonal and $[\hat H, \rho]_{01} = \hbar\omega\rho_{01}$, so $\rho_{01}(t) = \rho_{01}(0)e^{-i\omega t}$ while $\rho_{00}$, $\rho_{11}$ stay fixed. On the sphere the arrow precesses about z: $\varphi$ goes from 45° to 135° in a quarter period."
- **Cap:** G "a quarter period: the corner turns, the diagonal stays" · F "$\rho_{01}(t) = \rho_{01}(0)e^{-i\omega t}$"
- **Stage:** `split( bl(bN, {rotate:{axis:'z', angleDeg:{from:0, to:90}}, trail:true}) / mx(out(Nt), {highlight:[[0,1],[1,0]]}) )`. Both panes sweep with the same hold progress.
- **Claims:** `q8RhoQuarterDiag` → 0.75, 0.25 · `q8RhoQuarter01Abs` → 0.433 · `q8RhoQuarter01Deg` → −135 · `q8NQuarterR` → (−0.612, 0.612, 0.5).
- **Fidelity:** `bloch-rotation-exact`, `qc-matrix-hue-is-phase`.

**`q8-trace-rule:b4` [B]** (a reading with no record erases the corners)
- **G:** "Readings work with $\rho$ too. The chance of reading 0 is $\mathrm{Tr}(P_0\rho)$, here 0.75. Suppose we read but keep no record. Then $\rho$ becomes the chance-weighted sum of the two outcomes, and its corners are gone. That is how the GHZ box of Unit 8.1 lost its link."
- **F:** "For projectors $P_j$, Bergou's postulates 4a–6a give $p_j = \mathrm{Tr}(P_j\rho)$, the post-state $P_j\rho P_j/p_j$ and, unrecorded, $\sum_jP_j\rho P_j$ (Bergou §5.2 p. 80; they reduce to the pure-state rules when $\rho = |\psi\rangle\langle\psi|$). A z reading of our $\rho$ gives $p_0 = 0.75$; unrecorded, $\mathrm{diag}(0.75, 0.25)$: the coherences are erased."
- **Cap:** G "read, no record: the corners vanish" · F "$\sum_jP_j\rho P_j = \mathrm{diag}(0.75, 0.25)$"
- **Stage:** `split( amp(N, {mode:'probability'}) / mx(mix([V.q8MeasP[0], {ket:'0'}], [V.q8MeasP[1], {ket:'1'}])) )`.
- **Claims:** `q8MeasP` → 0.75, 0.25 · `q8NonSel` → diag(0.75, 0.25).
- **Terms:** `qc-projector`, `qc-selective-measurement` (Q3).

**`q8-trace-rule:b5` [C]** (what stands still)
- **Q G:** "Under $\hat H = \tfrac{\hbar\omega}2Z$, which density matrices never change in time?"
- **Q F:** "For $\hat H = \tfrac{\hbar\omega}2\sigma_z$, which $\rho$ satisfy $\dot\rho = 0$?"
- **Reveal G:** "Those with no corners: the diagonal ones. Their commutator with $\hat H$ is zero, so nothing turns. The unrecorded reading of the last beat is one of them."
- **Reveal F:** "Exactly those commuting with $\sigma_z$, the diagonal $\rho$: $[\hat H, \mathrm{diag}(p_0, p_1)] = 0$. States without coherences in the energy basis are stationary; Unit 8.4's thermal state is the physical case."
- **Reveal cap:** G/F "$[\hat H, \mathrm{diag}(0.75, 0.25)] = 0$"
- **Stage:** question `bl(bN, {rotate:{axis:'z', angleDeg:{from:0, to:360}}})`; reveal `mx(mix([V.q8MeasP[0], {ket:'0'}], [V.q8MeasP[1], {ket:'1'}]))`.
- **Claims:** `q8CommDiag` → 0.

### Unit `q8-mixed` — Mixtures: chances without phases

**`q8-mixed:b1` [L] · notation beat, `introduces: ['qc-ensemble']`** (Σ p_n|ψ_n⟩⟨ψ_n|; the box written down)
- **G:** "Now we can write down the box of Unit 8.1. Picture a collection whose members are in states $|\psi_n\rangle$ with chances $p_n$: an [[qc-ensemble|ensemble]]. Its density matrix weights each member's $\rho$ by its chance and adds them: $\rho = \sum_np_n|\psi_n\rangle\langle\psi_n|$. For the box, $\rho = \tfrac12|00\rangle\langle00| + \tfrac12|11\rangle\langle11|$."
- **F:** "An [[qc-ensemble|ensemble]] $\{p_n, |\psi_n\rangle\}$ has $\rho = \sum_np_n|\psi_n\rangle\langle\psi_n|$ (notes p. 36; Bergou Eq. 2.2), where the $|\psi_n\rangle$ need not be orthogonal. Then $\mathrm{Tr}\,\rho = \sum_np_n = 1$ and $\langle A\rangle = \sum_np_n\langle\psi_n|A|\psi_n\rangle = \mathrm{Tr}(\rho A)$ (Bergou Eq. 2.1). The GHZ box is $\rho_{12} = \tfrac12(|00\rangle\langle00| + |11\rangle\langle11|)$, with no coherence between 00 and 11."
- **Cap:** G "the box: ½ twice on the diagonal, empty corners" · F "$\rho_{12}$: coherence 0, where $\Phi^+$ has 0.5"
- **Stage:** `split( mx(BOX, {highlight:[[0,3],[3,0]]}) / tqR(BOX) )` — needs: two-qubit.
- **Claims:** `q8BoxP` → (0.5, 0, 0, 0.5) · `q8BoxCoh` → 0 · `q8PhiCoh` → 0.5.
- **Terms:** `qc-mixture` (Q1).

**`q8-mixed:b2` [L] · notation beat, `introduces: ['qc-purity']`** (Tr ρ² tells mixed from pure)
- **G:** "How mixed is a state? Square $\rho$ and take the trace. For a pure state $\rho^2 = \rho$, so $\mathrm{Tr}\,\rho^2 = 1$. For the box it is 0.5, less than 1, so the box is [[qc-mixed-state|mixed]]. This number is the [[qc-purity|purity]]."
- **F:** "The [[qc-purity|purity]] $\mathrm{Tr}\,\rho^2$ is 1 exactly for pure states and below 1 for [[qc-mixed-state|mixed]] ones (notes pp. 35–36). Bergou p. 18 proves both directions from the eigenvalues $0 \le \lambda_j \le 1$ of $\rho$. The box has $\mathrm{Tr}\,\rho_{12}^2 = 0.5$; $\Phi^+$ has 1."
- **Cap:** G "purity: box 0.5, $\Phi^+$ 1" · F "$\mathrm{Tr}\,\rho^2$: 0.5 against 1"
- **Stage:** `mx(prod(BOX, BOX), {trace:true})` — needs: matrix-v2.
- **Claims:** `q8BoxPur` → 0.5 · `q8PhiPur` → 1.

**`q8-mixed:b3` [L] · space beat, `introduces: ['qc-bloch-ball']`** (one qubit: the mixture's arrow lies inside)
- **G:** "Back to one qubit. Mix $|0\rangle$ and $|+\rangle$, half and half. Each member has its arrow on the sphere of Unit 3.2. The mixture's arrow $\mathbf r$ is their chance-weighted average. It ends inside the sphere, at the middle of the chord. Pure states sit on the surface and mixtures inside: the [[qc-bloch-ball|Bloch ball]]."
- **F:** "For a qubit ensemble, $\rho$'s Bloch vector is the weighted mean $\mathbf r = \sum_np_n\mathbf n_n$ of the members' unit vectors, so $|\mathbf r| \le 1$: pure states fill the sphere and mixed states its interior, the [[qc-bloch-ball|Bloch ball]] (notes p. 37; Bergou §2.3). Rosetta: the notes and Bergou write $\mathbf n$ for this vector; we keep $\mathbf r$. Here $\mathbf r = (0.5, 0, 0.5)$, of length 0.707."
- **Cap:** G "the mixture's arrow: inside, at the chord's middle" · F "$\mathbf r = (0.5, 0, 0.5)$, $|\mathbf r| = 0.707$"
- **Stage:** `split( ball(bZX, {recipe:true}) / mx(ZX) )`.
- **Claims:** `q8ZXR` → (0.5, 0, 0.5) · `q8ZXRLen` → 0.707 · `q8ZX` → [[0.75, 0.25], [0.25, 0.25]].
- **Terms:** `qc-bloch-sphere` (Q3). **Bridge:** `qc-l6-mixture`.
- **Fidelity:** `ball-direction-average`, `ball-inside-not-partly-up`, `ball-born-inside`.

**`q8-mixed:b4` [L]** (the notes' mixture by the numbers; D7)
- **G:** "Its matrix is half of $|0\rangle$'s plus half of $|+\rangle$'s: $\tfrac34$ and $\tfrac14$ on the diagonal, $\tfrac14$ in each corner. Its purity is 0.75. Its spin averages are $\langle S_z\rangle = \langle S_x\rangle = 0.25\hbar$, and $\langle S_y\rangle = 0$."
- **F:** "$\rho = \tfrac12|0\rangle\langle0| + \tfrac14(|0\rangle + |1\rangle)(\langle0| + \langle1|) = \begin{pmatrix}3/4 & 1/4\\ 1/4 & 1/4\end{pmatrix}$, with $\mathrm{Tr}\,\rho^2 = 0.75$, $\langle S_z\rangle = \langle S_x\rangle = 0.25\hbar$ and $\langle S_y\rangle = 0$ (notes pp. 36–37)."
- **Cap:** G "purity 0.75; $\langle S_z\rangle = \langle S_x\rangle = 0.25\hbar$" · F "$\mathrm{Tr}\,\rho^2 = 0.75$"
- **Stage:** `split( ball(bZX, {recipe:true}) / mx(ZX, {trace:true}) )`.
- **Claims:** `q8ZX` · `q8ZXPur` → 0.75 · `q8ZXS` → (0.25, 0, 0.25) ($S_x$, $S_y$, $S_z$ in units of ħ).

**`q8-mixed:b5` [L]** (a thermal box; D6)
- **G:** "Atoms in a field along z make a natural mixture. Spin up, $|0\rangle$, has less energy than spin down, by $E_Z$. The thermal energy $k_BT$ sets the odds: $p_\uparrow/p_\downarrow = e^{E_Z/k_BT}$. At $E_Z = 2k_BT$ the chances are 0.881 and 0.119, so $\langle S_z\rangle = 0.381\hbar$."
- **F:** "In equilibrium $p_\uparrow/p_\downarrow = e^{(E_\downarrow - E_\uparrow)/k_BT}$, so $\rho = \mathrm{diag}(p_\uparrow, p_\downarrow)$ and $\langle S_z\rangle = \tfrac\hbar2(p_\uparrow - p_\downarrow) = \tfrac\hbar2\tanh(E_Z/2k_BT)$, with $E_Z = E_\downarrow - E_\uparrow$ (notes p. 36). At $E_Z/k_BT = 2$: $p_\uparrow = 0.881$, $\langle S_z\rangle = 0.381\hbar$ and $\mathbf r = (0, 0, 0.762)$."
- **Cap:** G "$E_Z = 2k_BT$: chances 0.881 and 0.119" · F "$\mathbf r = (0, 0, \tanh 1) = (0, 0, 0.762)$"
- **Stage:** `split( ball(bTH) / mx(TH) )`.
- **Claims:** `q8ThermX` → 2 (input) · `q8ThermP` → 0.881, 0.119 · `q8ThermSz` → 0.381 · `q8ThermR` → 0.762.
- **Bridge:** `qc-l1-average` (the oven).

**`q8-mixed:b6` [B]** (a |1⟩ and |+⟩ mixture: HW2 P4; D13)
- **G:** "Homework 2, Problem 4 mixes $|1\rangle$ with chance p and $|+\rangle$ with chance $1 - p$. The purity works out to $1 - p + p^2$, below 1 unless p is 0 or 1. The averages are $\langle\sigma_x\rangle = 1 - p$, $\langle\sigma_y\rangle = 0$ and $\langle\sigma_z\rangle = -p$. At $p = 0.25$ the purity is 0.8125."
- **F:** "HW2 P4: $\rho = p|1\rangle\langle1| + (1 - p)|+\rangle\langle+| = \tfrac12\begin{pmatrix}1 - p & 1 - p\\ 1 - p & 1 + p\end{pmatrix}$, so $\mathrm{Tr}\,\rho^2 = 1 - p + p^2 < 1$ for $0 < p < 1$ and $\mathbf r = (1 - p, 0, -p)$. At $p = 0.25$: purity 0.8125 and $\mathbf r = (0.75, 0, -0.25)$."
- **Cap:** G "p = 0.25: purity 0.8125" · F "$\mathbf r = (1 - p, 0, -p)$ at $p = 0.25$"
- **Stage:** `split( ball({mix:[{of:'-z', w:1/4}, {of:'+x', w:3/4}]}, {recipe:true}) / mx(P4(1/4)) )`.
- **Claims:** `q8P4In` → 0.25 (input) · `q8P4Pur` → 0.8125 (p = 0.25) · `q8P4Sig25` → (0.75, 0, −0.25) · `q8P4Rho25` → [[0.375, 0.375], [0.375, 0.625]].

**`q8-mixed:b7` [C]** (the most mixed qubit)
- **Q G:** "What is the smallest purity a qubit can have, and where in the ball does that state sit?"
- **Q F:** "Minimize $\mathrm{Tr}\,\rho^2$ over one-qubit density matrices. Where is the minimum in the ball?"
- **Reveal G:** "0.5, at the centre: $\rho = \tfrac12I$, an oven with no field. Its arrow has length 0, so every reading is a fair coin. Unit 8.5 shows why the purity grows with the arrow's length."
- **Reveal F:** "$\mathrm{Tr}\,\rho^2 = \tfrac12(1 + |\mathbf r|^2) \ge \tfrac12$ (derived in Unit 8.5), with equality only at $\mathbf r = 0$, the maximally mixed state $\tfrac12I$."
- **Reveal cap:** G/F "centre: purity 0.5"
- **Stage:** question `ball(bZX)`; reveal `ball('oven')`.
- **Claims:** `q8PurR` → 0.5 (|r| = 0).

### Unit `q8-ball` — The Bloch ball: mixed states inside

**`q8-ball:b1` [L]** (four numbers, one fixed; D8)
- **G:** "Unit 3.3 showed that every 2 × 2 Hermitian matrix is $a_0I + \mathbf a\cdot\boldsymbol\sigma$, four real numbers. For $\rho$ the trace must be 1, which fixes $a_0 = \tfrac12$. The arrow is then half the Bloch vector: $\rho = \tfrac12(I + \mathbf r\cdot\boldsymbol\sigma)$."
- **F:** "Since $I, \sigma_x, \sigma_y, \sigma_z$ span the 2 × 2 matrices and $\rho$ is Hermitian with unit trace, $\rho = \tfrac12(I + r_x\sigma_x + r_y\sigma_y + r_z\sigma_z)$ with real $r_j$ (notes Eq. 2.14; Bergou Eq. 2.18). In Unit 3.3's operator space this is $a_0 = \tfrac12$ and $\mathbf a = \mathbf r/2$."
- **Cap:** G "$\rho$ as an operator: $a_0 = 0.5$, arrow $(0.25, 0, 0.25)$" · F "$a_0 = \tfrac12$, $\mathbf a = \mathbf r/2$"
- **Stage:** `split( ops(V.q8ZXA[0], [V.q8ZXA[1], V.q8ZXA[2], V.q8ZXA[3]]) / ball(bZX) )`.
- **Claims:** `q8ZXA` → 0.5; (0.25, 0, 0.25) · `q8ZXR` → (0.5, 0, 0.5).
- **Fidelity:** `op-one-point`, `op-a0-gauge`.

**`q8-ball:b2` [L] · notation beat, `introduces: ['qc-positive-operator']`** (why |r| ≤ 1; D8)
- **G:** "Written out, $\rho = \tfrac12\begin{pmatrix}1 + r_z & r_x - ir_y\\ r_x + ir_y & 1 - r_z\end{pmatrix}$. Its two eigenvalues act as chances, so neither may be negative: $\rho$ is [[qc-positive-operator|positive]], written $\rho \ge 0$. Their product, the determinant, is $(1 - |\mathbf r|^2)/4$. So $|\mathbf r| \le 1$, and the arrow never leaves the ball."
- **F:** "Hermiticity makes the $r_j$ real (notes Eq. 2.15). A density matrix is [[qc-positive-operator|positive]], $\langle\varphi|\rho|\varphi\rangle = \sum_np_n|\langle\varphi|\psi_n\rangle|^2 \ge 0$ (Bergou Eq. 2.13), written $\rho \ge 0$; so both eigenvalues are non-negative and $\det\rho = (1 - |\mathbf r|^2)/4 \ge 0$, that is $|\mathbf r| \le 1$. Our mixture has $\det\rho = 0.125$."
- **Cap:** G "$\det\rho = 0.125 \ge 0$: inside the ball" · F "$\det\rho = (1 - |\mathbf r|^2)/4$"
- **Stage:** `split( ball(bZX) / mx(ZX) )`.
- **Claims:** `q8ZXDet` → 0.125 · `q8ZXRLen` → 0.707.

**`q8-ball:b3` [L]** (the surface is pure)
- **G:** "On the surface $|\mathbf r| = 1$, so the determinant is 0. Then one eigenvalue is 0 and the other is 1. So $\rho$ is $|u\rangle\langle u|$ for a single state $|u\rangle$: a pure state. That is why Unit 8.2's $\rho$ sits on the surface."
- **F:** "If $|\mathbf r| = 1$, then $\det\rho = 0$ and $\mathrm{Tr}\,\rho = 1$ force eigenvalues 1 and 0, so $\rho = |u\rangle\langle u|$ with $|u\rangle$ the eigenvector of eigenvalue 1 (notes p. 37; Bergou p. 19). The surface is exactly the set of pure states; Unit 8.2's $\rho$ has eigenvalues 1 and 0."
- **Cap:** G "the surface: eigenvalues 1 and 0" · F "$|\mathbf r| = 1 \Leftrightarrow \rho = |u\rangle\langle u|$"
- **Stage:** `split( ball(bN) / mx(out(N), {spectrum:'bars'}) )` — needs: matrix-v2.
- **Claims:** `q8NDet` → 0 · `q8NEig` → 1, 0 · `q8NRLen` → 1.
- **Fidelity:** `ball-surface-pure`.

**`q8-ball:b4` [L]** (reading r off ρ; D9)
- **G:** "To find the arrow from $\rho$, take the average of each Pauli matrix: $r_j = \mathrm{Tr}(\rho\sigma_j)$. It works because $\mathrm{Tr}(\sigma_j\sigma_k)$ is 2 when $j = k$ and 0 otherwise. For our mixture, $\mathrm{Tr}(\rho\sigma_x) = 0.5$, $\mathrm{Tr}(\rho\sigma_y) = 0$ and $\mathrm{Tr}(\rho\sigma_z) = 0.5$."
- **F:** "From $\mathrm{Tr}\,\sigma_j = 0$ and $\mathrm{Tr}(\sigma_j\sigma_k) = 2\delta_{jk}$, $\mathrm{Tr}(\rho\sigma_j) = \tfrac12\sum_kr_k\mathrm{Tr}(\sigma_k\sigma_j) = r_j$ (notes Eq. 2.16; Bergou Eq. 2.20). So $\mathbf r = (\langle\sigma_x\rangle, \langle\sigma_y\rangle, \langle\sigma_z\rangle)$: the ball's coordinates are the three averages."
- **Cap:** G "$\mathrm{Tr}(\rho\sigma_x) = 0.5$" · F "$r_j = \mathrm{Tr}(\rho\sigma_j)$"
- **Stage:** `split( ball(bZX) / mx(prod(ZX, pa('X')), {trace:true}) )` — needs: matrix-v2.
- **Claims:** `q8ZXR` → (0.5, 0, 0.5) · `q8TrSS` → 2 on the diagonal, 0 off it.
- **Bridge:** `qc-l6-bloch` (three averages make a point).

**`q8-ball:b5` [B]** (pure exactly on the surface: HW2 P6; D14)
- **G:** "Homework 2, Problem 6 runs the same idea backwards. Squaring $\rho$ gives the purity $\tfrac12(1 + |\mathbf r|^2)$. That is 1 exactly when $|\mathbf r| = 1$, and less inside: 0.625 at length 0.5. Each average is one component, $\langle\sigma_j\rangle = r_j$. A surface point at angles $\theta$ and $\varphi$ is Unit 3.2's state $\cos\tfrac\theta2|0\rangle + e^{i\varphi}\sin\tfrac\theta2|1\rangle$."
- **F:** "HW2 P6 (which writes $\mathbf a$ for our $\mathbf r$): $(\mathbf r\cdot\boldsymbol\sigma)^2 = |\mathbf r|^2I$ gives $\rho^2 = \tfrac14\big((1 + |\mathbf r|^2)I + 2\mathbf r\cdot\boldsymbol\sigma\big)$, so $\mathrm{Tr}\,\rho^2 = \tfrac12(1 + |\mathbf r|^2)$, which is 1 iff $|\mathbf r| = 1$. Also $\langle\sigma_\alpha\rangle = r_\alpha$; for $|\mathbf r| = 1$ at angles ($\theta$, $\varphi$) the state is $\cos\tfrac\theta2|0\rangle + e^{i\varphi}\sin\tfrac\theta2|1\rangle$."
- **Cap:** G "purity 0.5, 0.625, 1 at lengths 0, 0.5, 1" · F "$\mathrm{Tr}\,\rho^2 = \tfrac12(1 + |\mathbf r|^2)$"
- **Stage:** `split( ball(bN) / mx(out(N)) )`.
- **Claims:** `q8PurR` → 0.5, 0.625, 1 (|r| = 0, 0.5, 1) · `q8NAmps` → (0.866, 0.354 + 0.354i).

**`q8-ball:b6` [C]** (a matrix that looks fine)
- **Q G:** "Is $\begin{pmatrix}1/2 & 1/\sqrt2\\ 1/\sqrt2 & 1/2\end{pmatrix}$ a density matrix? Its trace is 1, it equals its own mirrored transpose, and every entry lies between 0 and 1."
- **Q F:** "Is $\begin{pmatrix}1/2 & 1/\sqrt2\\ 1/\sqrt2 & 1/2\end{pmatrix}$ a density matrix?"
- **Reveal G:** "No. Its arrow is $(1.414, 0, 0)$, outside the ball. Its determinant is −0.25, so one eigenvalue is negative: −0.207. A chance cannot be negative."
- **Reveal F:** "No: $\mathbf r = (\sqrt2, 0, 0)$, $\det\rho = -0.25 < 0$, eigenvalues 1.207 and −0.207. Unit trace and Hermiticity are not enough; positivity fails."
- **Reveal cap:** G/F "eigenvalues 1.207 and −0.207"
- **Stage:** question `mx(lin([1/2, pa('I')], [1/√2, pa('X')]))`; reveal the same with `{spectrum:'bars'}` (the negative bar flagged) — needs: matrix-v2.
- **Claims:** `q8BadR` → (1.414, 0, 0) · `q8BadDet` → −0.25 · `q8BadEig` → 1.207, −0.207 · `q8BadIsDensity` → false.

### Unit `q8-recipes` — One matrix, many recipes

**`q8-recipes:b1` [L]** (the centre, two ways; D10)
- **G:** "Mix $|0\rangle$ and $|1\rangle$ half and half. In another box, mix $|+\rangle$ and $|-\rangle$ half and half. Both give $\rho = \tfrac12I$, the centre of the ball. The boxes were made differently, yet no reading can ever tell them apart."
- **F:** "$\tfrac12I = \tfrac12(|0\rangle\langle0| + |1\rangle\langle1|) = \tfrac12(|{+x}\rangle\langle{+x}| + |{-x}\rangle\langle{-x}|)$ (notes Eqs. 2.17–2.18; Bergou Eq. 2.22). Every prediction is $\mathrm{Tr}(A\rho)$, so two ensembles with one $\rho$ are indistinguishable: $\rho$, not the recipe, is the state."
- **Cap:** G "two recipes, one centre" · F "$\tfrac12I$ from the z poles or the x poles"
- **Stage:** `ball({mix:[{of:'+z', w:1/2}, {of:'-z', w:1/2}]}, {recipe:true})`.
- **Claims:** `q8HalfGap` → 0 (z poles), 0 (x poles).
- **Fidelity:** `ball-many-recipes`. **Bridge:** `qc-l6-mixture`.

**`q8-recipes:b2` [L]** (the mixture's own recipe; D10)
- **G:** "Unit 8.4's mixture has a second recipe too. Its matrix has two eigenvectors, $|u_+\rangle$ and $|u_-\rangle$, which are the eigenstates of the H gate. Mix them with chances 0.854 and 0.146 and you get the same $\rho$. These chances are $\rho$'s eigenvalues."
- **F:** "With $|u_\pm\rangle = ((\sqrt2 \pm 1)|0\rangle \pm |1\rangle)/\sqrt{4 \pm 2\sqrt2}$, the eigenstates of H, $\tfrac12(|0\rangle\langle0| + |{+x}\rangle\langle{+x}|) = \tfrac{2 + \sqrt2}4|u_+\rangle\langle u_+| + \tfrac{2 - \sqrt2}4|u_-\rangle\langle u_-|$ (notes Eqs. 2.19–2.20; Bergou Eqs. 2.23–2.24, bracket corrected). The weights 0.854 and 0.146 are $\rho$'s eigenvalues, and $|u_\pm\rangle$ sit at $\theta$ = 45° and 135° on the x–z circle."
- **Cap:** G "the eigen-recipe: 0.854 and 0.146" · F "spectrum of $\rho$: $\tfrac{2 \pm \sqrt2}4$"
- **Stage:** `split( ball(bU, {recipe:true}) / mx(ZX, {spectrum:'bars'}) )` — needs: matrix-v2.
- **Claims:** `q8ZXEig` → 0.854, 0.146 · `q8UPlus` → (0.924, 0.383) · `q8UMinus` → (0.383, −0.924) · `q8UThetaDeg` → 45, 135 · `q8UHEig` → +1, −1 · `q8EigRecipeGap` → 0.
- **Terms:** `qc-hadamard` (Q2), `qc-eigenvalue` (Q3).

**`q8-recipes:b3` [L] · space beat, `introduces: ['qc-convex-set']`** (chords stay inside; a pure state has one recipe; D11)
- **G:** "Mix any two density matrices with weights t and $1 - t$, and you get another density matrix. On the ball, the new point lies on the straight segment between the two. So the set has no dents: it is [[qc-convex-set|convex]]. A surface point is no mixture of two other states, so a pure state has exactly one recipe."
- **F:** "For $0 \le t \le 1$, $\rho(t) = t\rho_1 + (1 - t)\rho_2$ is a density matrix (notes Eq. 2.21; Bergou Eq. 2.25; both call the weight $\theta$): density matrices form a [[qc-convex-set|convex set]], the ball. A pure $\rho$ is an extreme point. If $|\psi\rangle\langle\psi| = t\rho_1 + (1 - t)\rho_2$ with $0 < t < 1$, then $\langle\psi^\perp|\rho_k|\psi^\perp\rangle = 0$ forces $\rho_1 = \rho_2 = |\psi\rangle\langle\psi|$ (Bergou Eqs. 2.26–2.27)."
- **Cap:** G "weights 0.25 and 0.75: a point on the chord, inside" · F "$\mathbf r(t) = t\mathbf r_1 + (1 - t)\mathbf r_2$"
- **Stage:** `split( ball({mix:[{of:'+z', w:1/4}, {of:'+x', w:3/4}]}, {recipe:true}) / mx(mix([1/4, {ket:'0'}], [3/4, {ket:'+'}])) )`.
- **Claims:** `q8ConvIn` → 0.25, 0.75 (inputs) · `q8Conv` → t = 0.25: r = (0.75, 0, 0.25), purity 0.8125, smallest eigenvalue 0.105.
- **Fidelity:** `ball-surface-pure`.

**`q8-recipes:b4` [B]** (how two recipes are related: unitary freedom; D12)
- **G:** "How are two recipes for one $\rho$ related? Weight each member's ket by the square root of its chance. Then each weighted ket of one recipe is a combination of the other recipe's. The table of combinations is a unitary matrix, like a gate. For both pairs of recipes above, it is the H gate."
- **F:** "Two ensembles give the same $\rho$ iff $\sqrt{p_i}|\psi_i\rangle = \sum_jU_{ij}\sqrt{q_j}|\varphi_j\rangle$ for a unitary U, the shorter list padded with zero vectors (notes p. 38; Bergou pp. 20–21, Eq. 2.28; N&C Theorem 2.6 p. 103). From the z poles to the x poles, U = H; from $\{|0\rangle, |{+x}\rangle\}$ to $\{|u_\pm\rangle\}$, U = H again. The trine, three states 120° apart with weight $\tfrac13$ each, needs a 3 × 3 U."
- **Cap:** G "the combination table: the H gate" · F "U = H for both pairs"
- **Stage:** `split( ball(bZX, {recipe:true}) / mx({gate:{name:'H'}}) )`. The matrix is H's own; the claim checks that the engine's U equals it.
- **Claims:** `q8UfreePoles` → H · `q8UfreeZX` → H · `q8TrineW`, `q8TrineDeg` → $\tfrac13$, 120 (inputs) · `q8TrineGap` → 0 · `q8TrineUSize` → 3 · `q8TrineUUnitary` → 0 (**needs the engine fix of §9.1**; the engine returns 1 today).
- **Terms:** `qc-unitary` (Q2).

**`q8-recipes:b5` [C]** (a third recipe for the centre)
- **Q G:** "One friend says her box is half $|{+y}\rangle$ and half $|{-y}\rangle$. Another says his is half $|0\rangle$ and half $|1\rangle$. Can any experiment tell the two boxes apart?"
- **Q F:** "Can any measurement distinguish $\tfrac12(|{+y}\rangle\langle{+y}| + |{-y}\rangle\langle{-y}|)$ from $\tfrac12(|0\rangle\langle0| + |1\rangle\langle1|)$?"
- **Reveal G:** "No. Both are $\tfrac12I$, the centre of the ball. Every prediction is a trace with $\rho$, and the two $\rho$ are equal."
- **Reveal F:** "No: both equal $\tfrac12I$, and all statistics are $\mathrm{Tr}(A\rho)$. The y poles are a third recipe for the same point."
- **Reveal cap:** G/F "the y poles: the same centre"
- **Stage:** question `ball({mix:[{of:'+z', w:1/2}, {of:'-z', w:1/2}]}, {recipe:true})`; reveal `ball({mix:[{of:'+y', w:1/2}, {of:'-y', w:1/2}]}, {recipe:true})`.
- **Claims:** `q8HalfGap` → 0 (y poles).

### 1.7 Claim ledger (engine call → value; numpy route)

| Key | Engine call (`Q8.values.ts`) | Value | numpy route |
|---|---|---|---|
| `q8GhzP3`, `q8GhzPost` | `marginal(ghz(3), [2])`; `postMeasure(ghz(3), [2], b)` | ½, ½; \|000⟩, \|111⟩ | projector ⊗ on qubit 3 |
| `q8BoxTr3Gap` | `densityGap(partialTrace(densityOf(ghz(3)), [2]), BOX)` | 0 | project qubit 3, sum, `einsum` trace |
| `q8BoxP`, `q8BoxCoh`, `q8BoxXX`/`YY`/`ZZ`, `q8BoxGrid`, `q8BoxArrows`, `q8BoxPur` | `mixtureN`; `traceN(matmul(pauliString(s), BOX))`; `reducedBloch`; `purityN` | see beats | explicit matrix, traces |
| `q8PhiP`, `q8PhiCoh`, `q8PhiXX`/`YY`/`ZZ`, `q8PhiGrid`, `q8PhiPur` | `probs`, `densityOf(bell('Phi+'))`, `expectationN` | see beats | `vdot` |
| `q8NAngles`, `q8NAmps`, `q8RhoN`, `q8RhoN01Abs`, `q8RhoN01Deg`, `q8RhoNSqGap`, `q8RhoNHermGap`, `q8RhoNTr`, `q8PhaseGap` | `ketFromBloch(60°, 45°)`; `densityOf`; `densityGap`; `traceN` | see beats | the formula cos(θ/2), e^{iφ}sin(θ/2); `np.outer` |
| `q8TrN`, `q8ExpXN` | `traceN(matmul(σ_j, ρ))`; `expectationN(N, X)` | 0.612, 0.612, 0.5 | ⟨ψ\|σ\|ψ⟩; sin 60° cos 45° |
| `q8MeasP`, `q8NonSel` | `traceN(P_jρ)`; Σ P_jρP_j | 0.75, 0.25; diag(0.75, 0.25) | \|c_i\|² |
| `q8VNComm`, `q8VNComm01Abs`, `q8VNCheck` | `commutator(Ĥ, ρ)` with Ĥ = Z/2; finite difference of `evolveRho` | see beats; 0 | `expm` and a central difference |
| `q8RhoQuarter01Abs`/`Deg`, `q8RhoQuarterDiag`, `q8NQuarterR`, `q8CommDiag` | `evolveRho(Ĥ, ρ, π/2)`; `reducedBloch` | 0.433, −135°; 0.75, 0.25; (−0.612, 0.612, 0.5); 0 | N at φ = 135° by formula |
| `q8ThermX`, `q8ThermR`, `q8ThermP`, `q8ThermSz` | `thermalPolarization(2)`; (1 ± r)/2 | 0.762; 0.881, 0.119; 0.381 | Boltzmann factors e^{∓x/2} |
| `q8ZX`, `q8ZXPur`, `q8ZXS`, `q8ZXR`, `q8ZXRLen`, `q8ZXDet`, `q8ZXA` | `mixtureN`; `purityN`; `reducedBloch`; `detN` | see beats | explicit matrix; ⟨ψ\|σ\|ψ⟩ averages |
| `q8P4In`, `q8P4Pur`, `q8P4Rho25`, `q8P4Sig25` | `mixtureN` at p; `purityN`; traces | 0.8125; see beat | closed forms 1 − p + p², (1 − p, 0, −p) |
| `q8PurR` | `purityN` of ½(I + rσ_z) | 0.5, 0.625, 1 | (1 + r²)/2 |
| `q8NDet`, `q8NEig`, `q8NRLen`, `q8TrSS` | `detN`, `spectrum`, `reducedBloch`, traces | 0; 1, 0; 1; 2δ | `np.linalg` |
| `q8BadR`, `q8BadDet`, `q8BadEig`, `q8BadIsDensity` | traces, `detN`, `eigh`, `isDensity` | (1.414, 0, 0); −0.25; 1.207, −0.207; false | `eigvalsh` |
| `q8HalfGap` | `densityGap(mixtureN(poles), ½I)` | 0, 0, 0 | explicit kets |
| `q8ZXEig`, `q8UPlus`, `q8UMinus`, `q8UThetaDeg`, `q8UHEig`, `q8EigRecipeGap` | `eigenEnsemble(ZX)` (kets sign-fixed: first component real ≥ 0, as Eq. 2.19) | 0.854, 0.146; (0.924, 0.383), (0.383, −0.924); 45°, 135°; ±1; 0 | Eq. 2.19 formulas |
| `q8ConvIn`, `q8Conv` | `mixtureN` at t; `reducedBloch`; `eigh` | see beat | explicit |
| `q8UfreePoles`, `q8UfreeZX` | `ensembleUnitary(e₁, e₂)` | H, H | `lstsq` with a full-SVD completion |
| `q8TrineW`, `q8TrineDeg`, `q8TrineGap`, `q8TrineUSize`, `q8TrineUUnitary`, `q8TrineRLen` | inputs ⅓, 120°; `ensembleUnitary(trine, zPoles)`; `reducedBloch` | 0; 3; **0 after the fix** (1 today); 0 | full-SVD completion: 0 |

## 2. Derivations

Each step is `tex` — `why` — **view** (the exact `StageState`, in the shorthand above) — *viewCaption*. A step without a
view inherits the previous one in its own list. Every list has ≥ 2 distinct views, and every view uses a kind its unit's
beats show. The last `tex` of each list ends on the result. `Hs` = `lin([1/2, pa('Z')])` ($\hat H$ in units of ħω).

**D1 · `q8-why:b3` · result `\langle X_1X_2\rangle_{\rm box} = 0 \ne \langle X_1X_2\rangle_{\Phi^+} = 1`** (notes pp. 34–35)
- Ground (4 views):
  1. `|\mathrm{GHZ}\rangle = \tfrac1{\sqrt2}(|000\rangle + |111\rangle)` — Chapter Q7's state has two bars, at 000 and 111. **view** `amp({circuit:C_GHZM(2), upTo:3})` · *GHZ: two bars*
  2. `\text{qubit 3 reads 0} \Rightarrow |00\rangle,\quad \text{reads 1} \Rightarrow |11\rangle` — Reading qubit 3 keeps one bar and leaves the pair in a product. **view** `amp({circuit:C_GHZM(2), upTo:4, outcomes:'0'})` · *after a 0, only 000 is left*
  3. `\langle00|X_1X_2|00\rangle = 0,\quad \langle11|X_1X_2|11\rangle = 0` — On a product state the x averages multiply, and each qubit's x average is 0.
  4. `\langle X_1X_2\rangle_{\rm box} = \tfrac12\cdot0 + \tfrac12\cdot0 = 0` — The box averages the two cases with chance ½ each. **view** `tqR(BOX, {highlight:['xx']})` · *the box: $xx$ cell 0*
  5. `\langle X_1X_2\rangle_{\Phi^+} = 1` — $\Phi^+$ is one state, and X on both qubits maps it to itself (Unit 6.6). **view** `tq({bell:'Phi+'}, {highlight:['xx']})` · *$\Phi^+$: $xx$ cell +1*
  6. `\langle X_1X_2\rangle_{\rm box} = 0 \ne \langle X_1X_2\rangle_{\Phi^+} = 1` — Same z readings, different x readings: the box is not $\Phi^+$.
- Formal (2 views):
  1. `\langle XX\rangle_{\rm box} = \tfrac12\langle00|XX|00\rangle + \tfrac12\langle11|XX|11\rangle = 0` — The ensemble average (notes p. 35). **view** `tqR(BOX, {highlight:['xx']})`
  2. `\langle X_1X_2\rangle_{\rm box} = 0 \ne \langle X_1X_2\rangle_{\Phi^+} = 1` — $XX\Phi^+ = \Phi^+$, a stabilizer (Unit 6.6). **view** `tq({bell:'Phi+'}, {highlight:['xx']})`
- Check: `q8GhzPost`, `q8BoxXX`, `q8PhiXX`. Needs: two-qubit.

**D2 · `q8-pure-rho:b2` · result `\rho_{ij} = c_ic_j^*,\quad \rho_{ii} = |c_i|^2`** (notes p. 35)
- Ground (4 views):
  1. `|\psi\rangle = c_0|0\rangle + c_1|1\rangle` — Two amplitudes, each with a size and a phase. **view** `amp(N, {dials:true})` · *$c_0 = 0.866$; $c_1$ of size 0.5 at 45°*
  2. `\langle\psi| = c_0^*\langle0| + c_1^*\langle1|` — The bra uses the mirrors of the amplitudes (Chapter Q1).
  3. `\rho = |\psi\rangle\langle\psi| = \sum_{i,j}c_ic_j^*|i\rangle\langle j|` — Multiply out: one term for each ket–bra pair. **view** `mx(out(N), {values:'none'})` · *four cells, one per pair (i, j)*
  4. `\rho_{ij} = c_ic_j^*` — The term with $|i\rangle\langle j|$ fills row i, column j. **view** `mx(out(N))` · *the four entries*
  5. `\rho_{ii} = c_ic_i^* = |c_i|^2` — On the diagonal an amplitude meets its own mirror: a chance. **view** `mx(out(N), {highlight:[[0,0],[1,1]]})` · *diagonal: 0.75 and 0.25*
  6. `\rho_{ij} = c_ic_j^*,\quad \rho_{ii} = |c_i|^2` — So $\rho$ stores the chances, and off the diagonal the phases.
- Formal (2 views):
  1. `\rho_{ij} = \langle e_i|\psi\rangle\langle\psi|e_j\rangle = c_ic_j^*` — Components in an orthonormal basis (notes p. 35). **view** `mx(out(N))`
  2. `\rho_{ij} = c_ic_j^*,\quad \rho_{ii} = |c_i|^2` — The diagonal is the Born rule. **view** `amp(N, {mode:'probability'})` · *$|c_i|^2$: 0.75, 0.25*
- Check: `q8NAmps`, `q8RhoN`.

**D3 · `q8-pure-rho:b3` · result `\mathrm{Tr}\,\rho = 1,\quad \rho^2 = \rho`** (notes p. 35)
- Ground (3 views):
  1. `\mathrm{Tr}\,\rho = \rho_{00} + \rho_{11}` — The trace adds the diagonal. **view** `mx(out(N), {trace:true})` · *Tr: the diagonal sum*
  2. `= |c_0|^2 + |c_1|^2` — The diagonal entries are the chances. **view** `amp(N, {mode:'probability'})` · *the same two chances*
  3. `= 1` — Chances add to 1.
  4. `\rho^2 = |\psi\rangle\langle\psi|\psi\rangle\langle\psi|` — Square $\rho$: a bra meets a ket in the middle. **view** `mx(prod(out(N), out(N)))` · *$\rho\cdot\rho$: $\rho$ again*
  5. `\langle\psi|\psi\rangle = 1 \Rightarrow \rho^2 = \rho` — The middle is the squared length of the state, 1.
  6. `\mathrm{Tr}\,\rho = 1,\quad \rho^2 = \rho` — Both come from the state being normalized.
- Formal (2 views):
  1. `\mathrm{Tr}\,\rho = \langle\psi|\Big(\sum_i|e_i\rangle\langle e_i|\Big)|\psi\rangle = \langle\psi|\psi\rangle = 1` — Completeness (notes p. 35). **view** `mx(out(N), {trace:true})`
  2. `\mathrm{Tr}\,\rho = 1,\quad \rho^2 = \rho` — $\rho^2 = |\psi\rangle\langle\psi|\psi\rangle\langle\psi|$. **view** `mx(prod(out(N), out(N)))`
- Check: `q8RhoNTr`, `q8RhoNSqGap`. Needs: matrix-v2.

**D4 · `q8-trace-rule:b1` · result `\langle A\rangle = \mathrm{Tr}(A\rho)`** (notes p. 36)
- Ground (4 views):
  1. `\langle A\rangle = \langle\psi|A|\psi\rangle = \sum_{i,j}c_i^*A_{ij}c_j` — Unit 3.4's average, written with the amplitudes. **view** `mx(pa('X'))` · *A = X*
  2. `c_jc_i^* = \rho_{ji}` — Each amplitude times a mirrored one is an entry of $\rho$. **view** `mx(out(N))` · *$\rho$*
  3. `\sum_{i,j}A_{ij}\rho_{ji} = \sum_i(A\rho)_{ii}` — The sum over j is a matrix product; the sum over i runs down the diagonal. **view** `mx(prod(pa('X'), out(N)), {trace:true})` · *X$\rho$ and its trace*
  4. `\langle A\rangle = \mathrm{Tr}(A\rho)` — So an average is a trace.
  5. `\mathrm{Tr}(X\rho) = 0.612` — For our state it is the x part of the arrow. **view** `bl(bN)` · *the arrow: x part 0.612*
  6. `\langle A\rangle = \mathrm{Tr}(A\rho)` — The rule needs only $\rho$, no ket.
- Formal (2 views):
  1. `\langle\psi|A|\psi\rangle = \sum_{i,j}A_{ij}\rho_{ji}` — $\rho_{ji} = c_jc_i^*$. **view** `mx(out(N))`
  2. `\langle A\rangle = \mathrm{Tr}(A\rho)` — $= \mathrm{Tr}(\rho A)$ by cyclicity; 0.612 for $\sigma_x$. **view** `mx(prod(pa('X'), out(N)), {trace:true})`
- Check: `q8TrN`, `q8ExpXN`. Needs: matrix-v2.

**D5 · `q8-trace-rule:b2` · result `i\hbar\dot\rho = [\hat H, \rho]`** (notes p. 36)
- Ground (4 views):
  1. `i\hbar\tfrac{d}{dt}|\psi\rangle = \hat H|\psi\rangle` — The Schrödinger equation moves the ket. **view** `bl(bN)` · *the state's arrow*
  2. `-i\hbar\tfrac{d}{dt}\langle\psi| = \langle\psi|\hat H` — Mirror both sides: the bra moves too, with i mirrored.
  3. `\dot\rho = |\dot\psi\rangle\langle\psi| + |\psi\rangle\langle\dot\psi|` — $\rho$ is a product, so its rate of change has two terms. **view** `mx(out(N))` · *$\rho$: both halves move*
  4. `i\hbar\dot\rho = \hat H|\psi\rangle\langle\psi| - |\psi\rangle\langle\psi|\hat H` — Put in the two rates.
  5. `i\hbar\dot\rho = \hat H\rho - \rho\hat H = [\hat H, \rho]` — That is a commutator, from Chapter Q3. **view** `mx(lin([1, prod(Hs, out(N))], [-1, prod(out(N), Hs)]))` · *$[\hat H, \rho]$: zero diagonal*
  6. `i\hbar\dot\rho = [\hat H, \rho]` — For $\hat H = \tfrac{\hbar\omega}2Z$ the arrow circles the z axis. **view** `bl(bN, {rotate:{axis:'z', angleDeg:{from:0, to:90}}, trail:true})` · *a quarter turn about z*
- Formal (3 views):
  1. `i\hbar\dot\rho = i\hbar(|\dot\psi\rangle\langle\psi| + |\psi\rangle\langle\dot\psi|)` — Differentiate $\rho = |\psi\rangle\langle\psi|$. **view** `mx(out(N))`
  2. `= \hat H\rho - \rho\hat H` — $i\hbar|\dot\psi\rangle = \hat H|\psi\rangle$ and its adjoint. **view** `mx(lin([1, prod(Hs, out(N))], [-1, prod(out(N), Hs)]))`
  3. `i\hbar\dot\rho = [\hat H, \rho]` — Linear in $\rho$, so it holds for every mixture; the sign is opposite to Heisenberg's. **view** `bl(bN, {rotate:{axis:'z', angleDeg:{from:0, to:90}}, trail:true})`
- Check: `q8VNComm`, `q8VNCheck`, `q8NQuarterR`. Needs: matrix-v2.

**D6 · `q8-mixed:b5` · result `\langle S_z\rangle = \tfrac\hbar2\tanh(E_Z/2k_BT)`** (notes p. 36)
- Ground (3 views):
  1. `\rho = \begin{pmatrix}p_\uparrow & 0\\ 0 & p_\downarrow\end{pmatrix}` — Each atom is up or down with its chance, so there are no coherences. **view** `mx(TH)` · *diagonal only*
  2. `p_\uparrow/p_\downarrow = e^{E_Z/k_BT}` — The lower energy is favoured by this Boltzmann factor.
  3. `p_\uparrow = \frac{e^{x/2}}{e^{x/2} + e^{-x/2}},\quad x = E_Z/k_BT` — Scale the two chances so they add to 1. **view** `ball('oven')` · *x = 0: equal chances, the centre*
  4. `\langle S_z\rangle = \tfrac\hbar2(p_\uparrow - p_\downarrow)` — Up reads $+\tfrac\hbar2$, down reads $-\tfrac\hbar2$.
  5. `= \tfrac\hbar2\cdot\frac{e^{x/2} - e^{-x/2}}{e^{x/2} + e^{-x/2}} = \tfrac\hbar2\tanh\tfrac x2` — This ratio has a name: the hyperbolic tangent, tanh. **view** `ball(bTH)` · *x = 2: $r_z = 0.762$*
  6. `\langle S_z\rangle = \tfrac\hbar2\tanh(E_Z/2k_BT)` — A strong field or a cold oven pushes the point up; heat pulls it to the centre.
- Formal (2 views):
  1. `\rho = e^{-\hat H/k_BT}/\mathrm{Tr}\,e^{-\hat H/k_BT} = \mathrm{diag}(p_\uparrow, p_\downarrow)` — The Gibbs state, with $\hat H = \mathrm{diag}(E_\uparrow, E_\downarrow)$. **view** `mx(TH)`
  2. `\langle S_z\rangle = \tfrac\hbar2\tanh(E_Z/2k_BT)` — $\mathrm{Tr}(\rho S_z)$ (notes p. 36); at $E_Z/k_BT = 2$, $r_z = 0.762$. **view** `ball(bTH)`
- Check: `q8ThermP`, `q8ThermR`, `q8ThermSz`.

**D7 · `q8-mixed:b4` · result `\mathrm{Tr}\,\rho^2 = \tfrac34,\quad \langle S_z\rangle = \langle S_x\rangle = \tfrac\hbar4`** (notes pp. 36–37)
- Ground (4 views):
  1. `\rho = \tfrac12|0\rangle\langle0| + \tfrac12|+\rangle\langle+|` — Half of each member's matrix. **view** `ball(bZX, {recipe:true})` · *two members, two dots*
  2. `|+\rangle\langle+| = \tfrac12\begin{pmatrix}1 & 1\\ 1 & 1\end{pmatrix}` — Both amplitudes of $|+\rangle$ are $1/\sqrt2$, so every entry is ½.
  3. `\rho = \begin{pmatrix}3/4 & 1/4\\ 1/4 & 1/4\end{pmatrix}` — Add half of each. **view** `mx(ZX)` · *the notes' matrix*
  4. `\mathrm{Tr}\,\rho^2 = \tfrac9{16} + \tfrac1{16} + \tfrac1{16} + \tfrac1{16} = \tfrac34` — For a Hermitian matrix, $\mathrm{Tr}\,\rho^2$ adds the squared sizes of all entries. **view** `mx(prod(ZX, ZX), {trace:true})` · *purity 0.75*
  5. `\langle S_z\rangle = \tfrac\hbar2\big(\tfrac34 - \tfrac14\big) = \tfrac\hbar4` — $S_z$ reads the diagonal.
  6. `\langle S_x\rangle = \tfrac\hbar2\big(\tfrac14 + \tfrac14\big) = \tfrac\hbar4` — $S_x$ reads the two corners. **view** `ball(bZX)` · *the point (0.5, 0, 0.5)*
  7. `\mathrm{Tr}\,\rho^2 = \tfrac34,\quad \langle S_z\rangle = \langle S_x\rangle = \tfrac\hbar4` — The purity is below 1: the state is mixed.
- Formal (2 views):
  1. `\mathrm{Tr}\,\rho^2 = \sum_{ij}|\rho_{ij}|^2 = \tfrac34` — For $\rho = \rho^\dagger$ (notes p. 37). **view** `mx(ZX, {trace:true})`
  2. `\mathrm{Tr}\,\rho^2 = \tfrac34,\quad \langle S_z\rangle = \langle S_x\rangle = \tfrac\hbar4` — $\langle S_j\rangle = \tfrac\hbar2\mathrm{Tr}(\rho\sigma_j)$. **view** `ball(bZX)`
- Check: `q8ZX`, `q8ZXPur`, `q8ZXS`. Needs: matrix-v2.

**D8 · `q8-ball:b2` · result `\det\rho = \tfrac14(1 - |\mathbf r|^2) \ge 0 \Rightarrow |\mathbf r| \le 1`** (notes Eqs. 2.14–2.15, p. 37)
- Ground (4 views):
  1. `\rho = a_0I + \mathbf a\cdot\boldsymbol\sigma` — Unit 3.3: any Hermitian 2 × 2 matrix, four real numbers. **view** `ops(V.q8ZXA[0], [V.q8ZXA[1], V.q8ZXA[2], V.q8ZXA[3]])` · *$\rho$ as an operator*
  2. `\mathrm{Tr}\,\rho = 2a_0 = 1` — The Pauli matrices have trace 0, and I has trace 2.
  3. `\rho = \tfrac12(I + \mathbf r\cdot\boldsymbol\sigma),\quad \mathbf r = 2\mathbf a` — Call twice the arrow $\mathbf r$. **view** `ball(bZX)` · *$\mathbf r = (0.5, 0, 0.5)$*
  4. `\rho = \tfrac12\begin{pmatrix}1 + r_z & r_x - ir_y\\ r_x + ir_y & 1 - r_z\end{pmatrix}` — Write out the three Pauli matrices. **view** `mx(ZX)` · *our mixture's entries*
  5. `\det\rho = \tfrac14\big((1 + r_z)(1 - r_z) - (r_x^2 + r_y^2)\big) = \tfrac14(1 - |\mathbf r|^2)` — Diagonal product minus corner product.
  6. `\det\rho = \tfrac14(1 - |\mathbf r|^2) \ge 0 \Rightarrow |\mathbf r| \le 1` — The determinant is the product of two non-negative eigenvalues. **view** `ball(bZX, {compare:{thetaDeg:45, phiDeg:0}})` · *inside; the surface point beyond it has determinant 0*
- Formal (2 views):
  1. `\rho = \tfrac12(I + \mathbf r\cdot\boldsymbol\sigma),\ \mathbf r \in \mathbb R^3` — $\mathrm{Tr}\,\rho = 1$ and $\rho = \rho^\dagger$ (notes Eq. 2.14). **view** `ops(V.q8ZXA[0], [V.q8ZXA[1], V.q8ZXA[2], V.q8ZXA[3]])`
  2. `\det\rho = \tfrac14(1 - |\mathbf r|^2) \ge 0 \Rightarrow |\mathbf r| \le 1` — Eq. 2.15 and $\rho \ge 0$. **view** `ball(bZX, {compare:{thetaDeg:45, phiDeg:0}})`
- Check: `q8ZXA`, `q8ZXR`, `q8ZXDet`, `q8ZXRLen`.

**D9 · `q8-ball:b4` · result `r_j = \mathrm{Tr}(\rho\sigma_j)`** (notes Eq. 2.16, p. 37)
- Ground (3 views):
  1. `\rho\sigma_x = \tfrac12(\sigma_x + r_x\sigma_x^2 + r_y\sigma_y\sigma_x + r_z\sigma_z\sigma_x)` — Multiply $\rho$ by $\sigma_x$, term by term. **view** `mx(prod(ZX, pa('X')))` · *$\rho\sigma_x$ for our mixture*
  2. `\mathrm{Tr}\,\sigma_x = 0,\ \mathrm{Tr}\,\sigma_x^2 = 2,\ \mathrm{Tr}(\sigma_y\sigma_x) = \mathrm{Tr}(\sigma_z\sigma_x) = 0` — $\sigma_x^2 = I$, and each mixed product is $\pm i$ times a Pauli matrix, with trace 0.
  3. `\mathrm{Tr}(\rho\sigma_x) = \tfrac12\cdot2r_x = r_x` — Only one term survives. **view** `mx(prod(ZX, pa('X')), {trace:true})` · *trace 0.5*
  4. `r_j = \mathrm{Tr}(\rho\sigma_j)` — The same works for y and z. **view** `ball(bZX)` · *(0.5, 0, 0.5)*
- Formal (2 views):
  1. `\mathrm{Tr}(\sigma_j\sigma_k) = 2\delta_{jk}` — Pauli algebra (Unit 3.3). **view** `mx(prod(ZX, pa('X')), {trace:true})`
  2. `r_j = \mathrm{Tr}(\rho\sigma_j)` — Bergou Eq. 2.20: the coordinates are averages. **view** `ball(bZX)`
- Check: `q8TrSS`, `q8ZXR`. Needs: matrix-v2.

**D10 · `q8-recipes:b2` · result `\tfrac12(|0\rangle\langle0| + |{+x}\rangle\langle{+x}|) = \tfrac{2 + \sqrt2}4|u_+\rangle\langle u_+| + \tfrac{2 - \sqrt2}4|u_-\rangle\langle u_-|`** (notes Eqs. 2.18–2.20)
- Ground (4 views):
  1. `\tfrac12I = \tfrac12(|0\rangle\langle0| + |1\rangle\langle1|)` — First recipe for the centre: the z poles. **view** `ball({mix:[{of:'+z', w:1/2}, {of:'-z', w:1/2}]}, {recipe:true})` · *z poles*
  2. `\tfrac12I = \tfrac12(|{+x}\rangle\langle{+x}| + |{-x}\rangle\langle{-x}|)` — Second recipe, the x poles: the same centre. **view** `ball({mix:[{of:'+x', w:1/2}, {of:'-x', w:1/2}]}, {recipe:true})` · *x poles, same centre*
  3. `\rho = \tfrac12(|0\rangle\langle0| + |{+x}\rangle\langle{+x}|) = \begin{pmatrix}3/4 & 1/4\\ 1/4 & 1/4\end{pmatrix}` — Unit 8.4's mixture. **view** `ball(bZX, {recipe:true})` · *$|0\rangle$ and $|+\rangle$*
  4. `\lambda_\pm = \tfrac{2 \pm \sqrt2}4` — Its eigenvalues: they add to 1 and multiply to $\det\rho = \tfrac18$. **view** `mx(ZX, {spectrum:'bars'})` · *eigenvalues 0.854 and 0.146*
  5. `|u_\pm\rangle = \frac{(\sqrt2 \pm 1)|0\rangle \pm |1\rangle}{\sqrt{4 \pm 2\sqrt2}}` — Its eigenvectors, which are also the eigenstates of the H gate.
  6. `\rho = \tfrac{2 + \sqrt2}4|u_+\rangle\langle u_+| + \tfrac{2 - \sqrt2}4|u_-\rangle\langle u_-|` — A Hermitian matrix is the sum of its eigenvalues times its eigenvectors' projectors (Unit 3.5). **view** `ball(bU, {recipe:true})` · *the eigen-recipe: the same point*
- Formal (2 views):
  1. `\rho = \sum_k\lambda_k|k\rangle\langle k|,\quad \lambda_\pm = \tfrac{2 \pm \sqrt2}4` — The spectral recipe (Unit 3.5). **view** `mx(ZX, {spectrum:'bars'})`
  2. `\tfrac12(|0\rangle\langle0| + |{+x}\rangle\langle{+x}|) = \tfrac{2 + \sqrt2}4|u_+\rangle\langle u_+| + \tfrac{2 - \sqrt2}4|u_-\rangle\langle u_-|` — Notes Eq. 2.20; Bergou Eq. 2.24, bracket corrected. **view** `ball(bU, {recipe:true})`
- Check: `q8HalfGap`, `q8ZXEig`, `q8UPlus`, `q8UMinus`, `q8EigRecipeGap`. Needs: matrix-v2.

**D11 · `q8-recipes:b3` · result `t\rho_1 + (1 - t)\rho_2\ \text{is a density matrix; a pure state has one recipe}`** (notes Eq. 2.21; Bergou Eqs. 2.25–2.27)
- Ground (4 views):
  1. `\rho(t) = t\rho_1 + (1 - t)\rho_2,\quad 0 \le t \le 1` — Mix two boxes in the proportion t to $1 - t$. **view** `ball({mix:[{of:'+z', w:1/4}, {of:'+x', w:3/4}]}, {recipe:true})` · *t = 0.25*
  2. `\mathrm{Tr}\,\rho(t) = t + (1 - t) = 1` — Both traces are 1.
  3. `\langle\varphi|\rho(t)|\varphi\rangle = t\langle\varphi|\rho_1|\varphi\rangle + (1 - t)\langle\varphi|\rho_2|\varphi\rangle \ge 0` — Two non-negative terms, so the mix is still positive. **view** `mx(mix([1/4, {ket:'0'}], [3/4, {ket:'+'}]), {spectrum:'bars'})` · *both eigenvalues positive*
  4. `\mathbf r(t) = t\mathbf r_1 + (1 - t)\mathbf r_2` — The arrows mix the same way: the point slides along the chord. **view** `ball({mix:[{of:'+z', w:3/4}, {of:'+x', w:1/4}]}, {recipe:true})` · *t = 0.75*
  5. `|\psi\rangle\langle\psi| = t\rho_1 + (1 - t)\rho_2 \Rightarrow \rho_1 = \rho_2 = |\psi\rangle\langle\psi|` — Sandwich with $|\psi^\perp\rangle$, the state orthogonal to $|\psi\rangle$: the left gives 0, so both terms on the right are 0. **view** `ball('+z')` · *a surface point: one recipe only*
  6. `t\rho_1 + (1 - t)\rho_2\ \text{is a density matrix; a pure state has one recipe}` — The set is convex, and its surface points are its corners.
- Formal (2 views):
  1. `t\rho_1 + (1 - t)\rho_2 \ge 0,\quad \mathrm{Tr}\big(t\rho_1 + (1 - t)\rho_2\big) = 1` — Positivity and trace survive convex combinations (notes Eq. 2.21). **view** `mx(mix([1/4, {ket:'0'}], [3/4, {ket:'+'}]), {spectrum:'bars'})`
  2. `t\rho_1 + (1 - t)\rho_2\ \text{is a density matrix; a pure state has one recipe}` — Bergou Eqs. 2.26–2.27, with $|\psi^\perp\rangle$. **view** `ball('+z')`
- Check: `q8Conv`. Needs: matrix-v2.

**D12 · `q8-recipes:b4` · result `\sqrt{p_i}|\psi_i\rangle = \sum_jU_{ij}\sqrt{q_j}|\varphi_j\rangle \Rightarrow \sum_ip_i|\psi_i\rangle\langle\psi_i| = \sum_jq_j|\varphi_j\rangle\langle\varphi_j|`** (Bergou Eq. 2.28, the "if" half; notes p. 38)
- Ground (4 views):
  1. `|\tilde\psi_i\rangle = \sqrt{p_i}|\psi_i\rangle,\quad \rho = \sum_i|\tilde\psi_i\rangle\langle\tilde\psi_i|` — Fold each chance into its ket as a square root. **view** `ball(bZX, {recipe:true})` · *recipe 1: $|0\rangle$ and $|+\rangle$*
  2. `|\tilde\psi_1\rangle = \tfrac1{\sqrt2}(|\tilde\varphi_1\rangle + |\tilde\varphi_2\rangle),\quad |\tilde\psi_2\rangle = \tfrac1{\sqrt2}(|\tilde\varphi_1\rangle - |\tilde\varphi_2\rangle)` — For our mixture, with $|\tilde\varphi_{1,2}\rangle$ the weighted $|u_\pm\rangle$, each weighted ket is a sum or a difference. **view** `mx({gate:{name:'H'}})` · *the combination table: H*
  3. `\sum_i|\tilde\psi_i\rangle\langle\tilde\psi_i| = \sum_{j,k}\Big(\sum_iU_{ij}U_{ik}^*\Big)|\tilde\varphi_j\rangle\langle\tilde\varphi_k|` — Multiply out with a general table U.
  4. `\sum_iU_{ij}U_{ik}^* = (U^\dagger U)_{kj} = \delta_{jk}` — A unitary table has orthonormal columns.
  5. `= \sum_j|\tilde\varphi_j\rangle\langle\tilde\varphi_j|` — Only the matching terms survive: the same $\rho$. **view** `ball(bU, {recipe:true})` · *recipe 2: $|u_\pm\rangle$, the same point*
  6. `\sqrt{p_i}|\psi_i\rangle = \sum_jU_{ij}\sqrt{q_j}|\varphi_j\rangle \Rightarrow \sum_ip_i|\psi_i\rangle\langle\psi_i| = \sum_jq_j|\varphi_j\rangle\langle\varphi_j|` — Any unitary table gives a recipe for the same $\rho$.
- Formal (2 views):
  1. `\sum_i|\tilde\psi_i\rangle\langle\tilde\psi_i| = \sum_{j,k}(U^\dagger U)_{kj}|\tilde\varphi_j\rangle\langle\tilde\varphi_k| = \sum_j|\tilde\varphi_j\rangle\langle\tilde\varphi_j|` — Bergou Eq. 2.28; the converse uses the spectral argument of Bergou pp. 21–24 and padding. **view** `mx({gate:{name:'H'}})`
  2. `\sqrt{p_i}|\psi_i\rangle = \sum_jU_{ij}\sqrt{q_j}|\varphi_j\rangle \Rightarrow \sum_ip_i|\psi_i\rangle\langle\psi_i| = \sum_jq_j|\varphi_j\rangle\langle\varphi_j|` — Here U = H. **view** `ball(bU, {recipe:true})`
- Check: `q8UfreeZX`, `q8UfreePoles`, `q8EigRecipeGap`.

**D13 · `q8-mixed:b6` · result `\mathrm{Tr}\,\rho^2 = 1 - p + p^2`** (HW2 P4)
- Ground (4 views):
  1. `\rho = p|1\rangle\langle1| + (1 - p)|+\rangle\langle+|` — Chance p of $|1\rangle$ and $1 - p$ of $|+\rangle$. **view** `ball({mix:[{of:'-z', w:1/4}, {of:'+x', w:3/4}]}, {recipe:true})` · *p = 0.25*
  2. `\rho = \tfrac12\begin{pmatrix}1 - p & 1 - p\\ 1 - p & 1 + p\end{pmatrix}` — $|1\rangle\langle1|$ fills the lower corner, and $|+\rangle\langle+|$ is ½ everywhere. **view** `mx(mix([{from:0, to:1}, {ket:'1'}], [{from:1, to:0}, {ket:'+'}]))` · *p swept from 0 to 1*
  3. `\mathrm{Tr}\,\rho^2 = \tfrac14\big(3(1 - p)^2 + (1 + p)^2\big)` — Add the squared sizes of the four entries.
  4. `= \tfrac14(4 - 4p + 4p^2) = 1 - p + p^2` — Expand and collect.
  5. `1 - p + p^2 = 1 - p(1 - p) < 1\quad (0 < p < 1)` — Between the ends, $p(1 - p)$ is positive. **view** `ball({mix:[{of:'-z', w:1/2}, {of:'+x', w:1/2}]}, {recipe:true})` · *p = 0.5: the least pure, 0.75*
  6. `\mathrm{Tr}\,\rho^2 = 1 - p + p^2` — Pure only at p = 0 and p = 1.
- Formal (2 views):
  1. `\rho = \tfrac12\begin{pmatrix}1 - p & 1 - p\\ 1 - p & 1 + p\end{pmatrix},\quad \mathbf r = (1 - p, 0, -p)` — HW2 P4(a), (c). **view** `mx(mix([{from:0, to:1}, {ket:'1'}], [{from:1, to:0}, {ket:'+'}]))`
  2. `\mathrm{Tr}\,\rho^2 = 1 - p + p^2` — $\sum_{ij}|\rho_{ij}|^2$; below 1 for $0 < p < 1$ (HW2 P4(b)). **view** `ball({mix:[{of:'-z', w:1/2}, {of:'+x', w:1/2}]}, {recipe:true})`
- Check: `q8P4Pur`, `q8P4Rho25`, `q8P4Sig25`.

**D14 · `q8-ball:b5` · result `\mathrm{Tr}\,\rho^2 = \tfrac12(1 + |\mathbf r|^2) = 1 \Leftrightarrow |\mathbf r| = 1`** (HW2 P6(b))
- Ground (4 views):
  1. `\rho = \tfrac12(I + \mathbf r\cdot\boldsymbol\sigma)` — The form of Unit 8.5. **view** `ops(V.q8ZXA[0], [V.q8ZXA[1], V.q8ZXA[2], V.q8ZXA[3]])` · *$\rho$ as an operator*
  2. `(\mathbf r\cdot\boldsymbol\sigma)^2 = |\mathbf r|^2I` — Unit 3.3's rule: the cross terms cancel in pairs.
  3. `\rho^2 = \tfrac14\big((1 + |\mathbf r|^2)I + 2\mathbf r\cdot\boldsymbol\sigma\big)` — Square the bracket. **view** `mx(prod(ZX, ZX))` · *$\rho^2$ for our mixture*
  4. `\mathrm{Tr}\,\rho^2 = \tfrac14\cdot2(1 + |\mathbf r|^2) = \tfrac12(1 + |\mathbf r|^2)` — I has trace 2; the Pauli part has trace 0.
  5. `\tfrac12(1 + |\mathbf r|^2) = 1 \Leftrightarrow |\mathbf r| = 1` — Pure exactly on the surface. **view** `ball(bN)` · *a surface point: purity 1*
  6. `\mathrm{Tr}\,\rho^2 = \tfrac12(1 + |\mathbf r|^2) = 1 \Leftrightarrow |\mathbf r| = 1` — Inside, the purity is below 1.
- Formal (2 views):
  1. `\rho^2 = \tfrac14\big((1 + |\mathbf r|^2)I + 2\mathbf r\cdot\boldsymbol\sigma\big)` — From $\{\sigma_j, \sigma_k\} = 2\delta_{jk}I$ (HW2 P6(b)). **view** `mx(prod(ZX, ZX))`
  2. `\mathrm{Tr}\,\rho^2 = \tfrac12(1 + |\mathbf r|^2) = 1 \Leftrightarrow |\mathbf r| = 1` — With Bergou p. 18, pure ⇔ $|\mathbf r| = 1$. **view** `ball(bN)`
- Check: `q8PurR`. Needs: matrix-v2.

**View counts** (distinct views, Ground / Formal): D1 4/2 · D2 4/2 · D3 3/2 · D4 4/2 · D5 4/3 · D6 3/2 · D7 4/2 · D8 4/2 ·
D9 3/2 · D10 5/2 · D11 4/2 · D12 3/2 · D13 3/2 · D14 3/2. Ground steps ≥ Formal steps in every pair. Every view's kind is
on its unit's stage (lists above). Eight derivations need `matrix` v2 (D3, D4, D5, D7, D9, D10, D11, D14); D1 needs
`two-qubit`; D2, D6, D8, D12, D13 are v1-only.

## 3. Try-it widget per unit

No widget draws a mixed state yet (§9.3 W3, deferred). Each unit uses an existing widget with prop forms already used
in 709 (Q1's `sg-lab`, Q3's `bloch` and `operator-builder`, Q5's `phase-dial`).

| Unit | Widget spec | Why this one |
|---|---|---|
| `q8-why` | `{kind:'sg-lab', props:{source:'oven', axes:['x'], editable:true, predict:true, seed:709}}` | An unpolarized beam reads half and half along every axis: what one qubit of the box looks like alone. |
| `q8-pure-rho` | `{kind:'phase-dial', props:{theta:60, rotations:true}}` | The relative phase is the hue of the coherence; turning it leaves the chances alone. |
| `q8-trace-rule` | `{kind:'bloch', props:{theta:60, phi:45, editable:true, measure:'x'}}` | The x reading's average is $\mathrm{Tr}(X\rho)$, the arrow's x part. |
| `q8-mixed` | `{kind:'sg-lab', props:{source:'oven', axes:['z'], editable:true, predict:true, seed:709}}` | The oven is the most mixed box; any analyser splits it evenly. |
| `q8-ball` | `{kind:'bloch', props:{theta:45, phi:0, editable:true, landmarks:true}}` | The surface of the ball: pure states, where the purity is 1. |
| `q8-recipes` | `{kind:'operator-builder', props:{axis:'x'}}` | Building an operator from eigenstates and values is the eigen-recipe of ρ. |

**Try this:**
- `q8-why`: (1) Fire 100 along x: close to 50/50. (2) Turn the analyser to z: still 50/50.
- `q8-pure-rho`: (1) Turn the dial a full lap: the chances never change.
- `q8-trace-rule`: (1) Read x at θ = 60°, φ = 45°: the average is 0.612. (2) Set φ = 0°: it grows to 0.866.
- `q8-mixed`: (1) Predict, then fire 100 along z: half and half.
- `q8-ball`: (1) Drag the point anywhere on the surface: every surface point is pure.
- `q8-recipes`: (1) Give both eigenstates the value ½: the result is $\tfrac12I$, the centre.

## 4. Challenges per unit

Tolerance 0.005 unless stated. Hints climb nudge → key idea → setup. **Homework:** HW2 is submitted, so its items have
full walkthroughs (ruling 12); they are marked (HW2). No other sheet assigns anything here; Bergou's §2.8 problems are not
used as challenges (§12 Q6).

### `q8-why`
1. **warm-up · numeric · `q8-w-01`** — "In the box, what is the chance that qubits 1 and 2 read 01?"
   - Answer: **0** = `q8BoxP[1]`. Hints: (1) What can the box hold? (2) $|00\rangle$ or $|11\rangle$. (3) Neither has a 01 part. Walkthrough: after reading qubit 3 the pair is $|00\rangle$ or $|11\rangle$, so 01 never appears.
2. **core · numeric · `q8-w-xx`** — "What is $\langle X_1X_2\rangle$ for the box?"
   - Answer: **0** = `q8BoxXX`. Hints: (1) Average over the two cases. (2) Each case is a product. (3) $\langle0|X|0\rangle = 0$. Walkthrough: $\tfrac12\cdot0 + \tfrac12\cdot0 = 0$.
3. **core · numeric · `q8-w-yy`** — "What is $\langle Y_1Y_2\rangle$ for $\Phi^+$?"
   - Answer: **−1** = `q8PhiYY`. Hints: (1) Use $\Phi^+$'s grid from Chapter Q6. (2) Its diagonal is $(1, -1, 1)$. (3) The $yy$ cell. Walkthrough: $YY\Phi^+ = -\Phi^+$, so the average is −1.
4. **stretch · choice · `q8-w-which`** — "Which reading tells the box from $\Phi^+$?"
   - Options: **X on both qubits, multiplied** ✓ · Z on both qubits, multiplied · Z on qubit 1 alone · X on qubit 1 alone. Check: `q8BoxXX` 0 against `q8PhiXX` 1; `q8BoxZZ` = `q8PhiZZ` = 1; `q8BoxArrows` = `q8PhiArrows` = 0. Hints: (1) Single qubits look alike in both. (2) z products agree too. (3) Try x products. Walkthrough: only the $xx$ (or $yy$) cell differs: 0 against 1.

### `q8-pure-rho`
1. **warm-up · numeric · `q8-p-diag`** — "For $|\psi\rangle = (\sqrt3|0\rangle + |1\rangle)/2$, what is $\rho_{11}$?"
   - Answer: **0.25** = `q8RhoPsi1[1][1]`. Hints: (1) Diagonal entries are chances. (2) $|c_1|^2$. (3) $(1/2)^2$. Walkthrough: 0.25.
2. **core · numeric · `q8-p-coh`** — "For the same state, what is $\rho_{01}$?"
   - Answer: **0.4330** = `q8RhoPsi1[0][1]`. Hints: (1) $\rho_{01} = c_0c_1^*$. (2) Both amplitudes are real. (3) $\tfrac{\sqrt3}2\cdot\tfrac12$. Walkthrough: $\sqrt3/4 = 0.433$.
3. **core · numeric · `q8-p-minus`** — "$|+\rangle$ has $\rho_{01} = \tfrac12$. What is $\rho_{01}$ for $|-\rangle$?"
   - Answer: **−0.5** = `q8PlusMinusCoh[1]`. Hints: (1) Same chances. (2) The relative sign flips. (3) $\tfrac1{\sqrt2}\cdot(-\tfrac1{\sqrt2})$. Walkthrough: −0.5: only the coherence tells $|+\rangle$ from $|-\rangle$.
4. **stretch · numeric · `q8-p-phase`** — "Unit 3.2's state is turned to $\varphi$ = 135°, $\theta$ unchanged. What is the phase of $\rho_{01}$, in degrees?"
   - Answer: **−135** = `q8RhoQuarter01Deg` (tolerance 0.5). Hints: (1) $\rho_{01} = c_0c_1^*$. (2) $c_1$ carries $e^{i\varphi}$. (3) Its mirror carries $e^{-i\varphi}$. Walkthrough: $\rho_{01} = 0.433e^{-i135^\circ}$.

### `q8-trace-rule`
1. **warm-up · numeric · `q8-t-z`** — "For Unit 3.2's state, what is $\mathrm{Tr}(Z\rho)$?"
   - Answer: **0.5** = `q8TrN[2]`. Hints: (1) Z keeps the diagonal and flips one sign. (2) $\rho_{00} - \rho_{11}$. (3) $0.75 - 0.25$. Walkthrough: 0.5, the arrow's z part.
2. **core · numeric · `q8-t-y`** — "Same state: what is $\mathrm{Tr}(Y\rho)$?"
   - Answer: **0.6124** = `q8TrN[1]`. Hints: (1) Y reads the coherences. (2) $\mathrm{Tr}(Y\rho) = -2\,\mathrm{Im}\,\rho_{01}$. (3) $\rho_{01} = 0.306 - 0.306i$. Walkthrough: 0.612, the arrow's y part, $\sin60^\circ\sin45^\circ$.
3. **core · numeric · `q8-t-nonsel`** — "A z reading is made on this state and the record is lost. What is the new $\rho_{01}$?"
   - Answer: **0** = `q8NonSel[0][1]`. Hints: (1) $\sum_jP_j\rho P_j$. (2) Each $P_j$ keeps one row and one column. (3) The corners are dropped. Walkthrough: $\mathrm{diag}(0.75, 0.25)$, so 0.
4. **stretch · numeric · `q8-t-quarter`** — "Under $\hat H = \tfrac{\hbar\omega}2Z$, by how many degrees does the phase of $\rho_{01}$ turn in a quarter period?"
   - Answer: **90** = `q8QuarterTurnDeg` (tolerance 0.5). Hints: (1) $\rho_{01}(t) = \rho_{01}(0)e^{-i\omega t}$. (2) A full period is $\omega t = 360^\circ$. (3) A quarter of that. Walkthrough: 90°, from −45° to −135°; the arrow turns 90° about z with it.

### `q8-mixed`
1. **warm-up · numeric · `q8-m-box`** — "What is $\mathrm{Tr}\,\rho^2$ for the GHZ box?"
   - Answer: **0.5** = `q8BoxPur`. Hints: (1) $\rho$ is diagonal. (2) Square the two entries of ½. (3) Add. Walkthrough: $\tfrac14 + \tfrac14 = 0.5$.
2. **core · numeric · `q8-m-zx`** — "For $\tfrac12|0\rangle\langle0| + \tfrac12|+\rangle\langle+|$, what is $\rho_{01}$?"
   - Answer: **0.25** = `q8ZX[0][1]`. Hints: (1) $|0\rangle\langle0|$ has no corner. (2) $|+\rangle\langle+|$ has ½ in each corner. (3) Half of ½. Walkthrough: 0.25.
3. **core · numeric · `q8-m-p4` (HW2 P4(a)–(b))** — "$\rho = p|1\rangle\langle1| + (1 - p)|+\rangle\langle+|$ at $p = 0.25$. What is $\mathrm{Tr}\,\rho^2$?"
   - Answer: **0.8125** = `q8P4Pur[1]`. Hints: (1) Write the 2 × 2 matrix. (2) $\tfrac12\begin{pmatrix}1 - p & 1 - p\\ 1 - p & 1 + p\end{pmatrix}$. (3) Add the squared entries.
   - Walkthrough: (a) $|1\rangle\langle1| = \mathrm{diag}(0, 1)$ and $|+\rangle\langle+|$ has ½ everywhere, so $\rho = \tfrac12\begin{pmatrix}1 - p & 1 - p\\ 1 - p & 1 + p\end{pmatrix}$. (b) $\mathrm{Tr}\,\rho^2 = \tfrac14\big(3(1 - p)^2 + (1 + p)^2\big) = 1 - p + p^2 = 1 - p(1 - p)$, which is below 1 whenever $0 < p < 1$ (the sheet's "p ≠ 0 or p ≠ 1" means both). At $p = 0.25$ it is 0.8125.
4. **core · numeric · `q8-m-p4c` (HW2 P4(c))** — "Same $\rho$ at $p = 0.25$: what is $\langle\sigma_x\rangle$?"
   - Answer: **0.75** = `q8P4Sig25[0]`. Hints: (1) $\langle\sigma_x\rangle = \rho_{01} + \rho_{10}$. (2) Each corner is $(1 - p)/2$. (3) Add them.
   - Walkthrough: $\langle\sigma_x\rangle = 1 - p = 0.75$; $\langle\sigma_y\rangle = i(\rho_{01} - \rho_{10}) = 0$ because the corners are real; $\langle\sigma_z\rangle = \rho_{00} - \rho_{11} = -p = -0.25$. The arrow $(1 - p, 0, -p)$ runs along the chord from $|+\rangle$ to $|1\rangle$.
5. **stretch · numeric · `q8-m-thermal`** — "Spins in a field with $E_Z = 2k_BT$: what is the chance $p_\uparrow$?"
   - Answer: **0.8808** = `q8ThermP[0]`. Hints: (1) $p_\uparrow/p_\downarrow = e^{E_Z/k_BT}$. (2) $e^2$ to 1. (3) $e^2/(e^2 + 1)$. Walkthrough: 0.881; then $\langle S_z\rangle = \tfrac\hbar2(0.881 - 0.119) = 0.381\hbar$.

### `q8-ball`
1. **warm-up · numeric · `q8-b-det`** — "For $\mathbf r = (0.5, 0, 0.5)$, what is $\det\rho$?"
   - Answer: **0.125** = `q8ZXDet`. Hints: (1) $\det\rho = (1 - |\mathbf r|^2)/4$. (2) $|\mathbf r|^2 = 0.5$. (3) $0.5/4$. Walkthrough: 0.125.
2. **core · numeric · `q8-b-pur` (HW2 P6(a)–(b))** — "$\rho = \tfrac12(I + \mathbf r\cdot\boldsymbol\sigma)$ with $|\mathbf r| = 0.5$. What is $\mathrm{Tr}\,\rho^2$?"
   - Answer: **0.625** = `q8PurR[1]`. Hints: (1) Square $\tfrac12(I + \mathbf r\cdot\boldsymbol\sigma)$. (2) $(\mathbf r\cdot\boldsymbol\sigma)^2 = |\mathbf r|^2I$. (3) Take the trace.
   - Walkthrough: (a) Any 2 × 2 matrix is $a_0I + \mathbf a\cdot\boldsymbol\sigma$; Hermiticity makes the coefficients real and unit trace fixes $a_0 = \tfrac12$, so $\rho = \tfrac12(I + \mathbf r\cdot\boldsymbol\sigma)$ with $\mathbf r = 2\mathbf a$ real; $\det\rho = (1 - |\mathbf r|^2)/4 \ge 0$ gives $|\mathbf r| \le 1$. (b) $\mathrm{Tr}\,\rho^2 = \tfrac12(1 + |\mathbf r|^2)$ is 1 iff $|\mathbf r| = 1$: pure on the surface, mixed inside. Here $\tfrac12(1 + 0.25) = 0.625$.
3. **core · numeric · `q8-b-avg` (HW2 P6(c))** — "For $\rho = \begin{pmatrix}3/4 & 1/4\\ 1/4 & 1/4\end{pmatrix}$, what is $\langle\sigma_x\rangle$?"
   - Answer: **0.5** = `q8ZXR[0]`. Hints: (1) $\langle\sigma_\alpha\rangle = \mathrm{Tr}(\rho\sigma_\alpha)$. (2) For $\sigma_x$ this adds the two corners. (3) $\tfrac14 + \tfrac14$.
   - Walkthrough: $\mathrm{Tr}(\rho\sigma_\alpha) = \tfrac12\sum_kr_k\mathrm{Tr}(\sigma_k\sigma_\alpha) = r_\alpha$, since $\mathrm{Tr}(\sigma_j\sigma_k) = 2\delta_{jk}$. So $\langle\sigma_x\rangle = r_x = 0.5$.
4. **core · numeric · `q8-b-state` (HW2 P6(d))** — "The pure state with $\mathbf r$ at $\theta$ = 60°, $\varphi$ = 45°: what is the size of its $|1\rangle$ amplitude?"
   - Answer: **0.5** = `q8NAmp1Abs`. Hints: (1) Surface points are pure. (2) $\cos\tfrac\theta2|0\rangle + e^{i\varphi}\sin\tfrac\theta2|1\rangle$. (3) $\sin30^\circ$.
   - Walkthrough: for $|\mathbf r| = 1$, $\rho$ has eigenvalues 1 and 0, and $\rho = |\mathbf r\rangle\langle\mathbf r|$ with $|\mathbf r\rangle = \cos\tfrac\theta2|0\rangle + e^{i\varphi}\sin\tfrac\theta2|1\rangle$ (check: $\langle\boldsymbol\sigma\rangle = \mathbf r$, Unit 3.2). Here $\sin30^\circ = 0.5$, with phase 45°.
5. **stretch · choice · `q8-b-bad`** — "Which of these is not a density matrix?"
   - Options: **$\tfrac12I + \tfrac1{\sqrt2}\sigma_x$** ✓ · $\tfrac12I + \tfrac12\sigma_x$ · $\tfrac12I + \tfrac12\sigma_z$ · $\tfrac12I$. Check: `q8BadDet` → −0.25, `q8BadIsDensity` → false; the others have $|\mathbf r| = 1, 1, 0$. Hints: (1) Read off $\mathbf r = 2\mathbf a$. (2) Is $|\mathbf r| \le 1$? (3) $2\cdot\tfrac1{\sqrt2} = \sqrt2$. Walkthrough: $|\mathbf r| = \sqrt2 > 1$, eigenvalues 1.207 and −0.207.

### `q8-recipes`
1. **warm-up · choice · `q8-r-same`** — "Which mixture equals $\tfrac12I$?"
   - Options: **$\tfrac12|{+y}\rangle\langle{+y}| + \tfrac12|{-y}\rangle\langle{-y}|$** ✓ · $\tfrac12|0\rangle\langle0| + \tfrac12|+\rangle\langle+|$ · $|0\rangle\langle0|$ · $\tfrac34|0\rangle\langle0| + \tfrac14|1\rangle\langle1|$. Check: `q8HalfGap[2]` → 0. Hints: (1) Where is each recipe's point? (2) Opposite poles average to the centre. (3) The y poles. Walkthrough: $|{\pm y}\rangle$ are opposite points, so their even mix is the centre.
2. **core · numeric · `q8-r-eig`** — "What is the larger eigenvalue of $\begin{pmatrix}3/4 & 1/4\\ 1/4 & 1/4\end{pmatrix}$?"
   - Answer: **0.8536** = `q8ZXEig[0]`. Hints: (1) Trace 1, determinant $\tfrac18$. (2) $\lambda^2 - \lambda + \tfrac18 = 0$. (3) $\lambda = \tfrac12 \pm \tfrac{\sqrt2}4$. Walkthrough: $(2 + \sqrt2)/4 = 0.854$, the weight of $|u_+\rangle$.
3. **core · numeric · `q8-r-conv`** — "Mix $\tfrac14$ of $|0\rangle\langle0|$ with $\tfrac34$ of $|+\rangle\langle+|$. What is $r_x$?"
   - Answer: **0.75** = `q8Conv[0].r[0]`. Hints: (1) Arrows mix like the matrices. (2) $|0\rangle$ has $r_x = 0$, $|+\rangle$ has $r_x = 1$. (3) $\tfrac14\cdot0 + \tfrac34\cdot1$. Walkthrough: 0.75; the point lies on the chord.
4. **stretch · numeric · `q8-r-trine`** — "Three states 120° apart on the x–z circle, each with weight $\tfrac13$: how long is the mixture's arrow?"
   - Answer: **0** = `q8TrineRLen`. Hints: (1) Add three unit arrows at 120°. (2) They close a triangle. (3) The average is the centre. Walkthrough: 0, so the trine is a third recipe for $\tfrac12I$.

## 5. Glossary terms new in Q8

`introduces` marks the notation and space beats (W-709 #8). Inline math in the strings is TeX inside `$…$`.

| id | Term | introduces | Ground gloss | Formal definition | First use | bridge |
|---|---|---|---|---|---|---|
| `qc-pure-state` | pure state | — | A state that one ket describes completely. | $\rho = \|\psi\rangle\langle\psi\|$; equivalently $\rho^2 = \rho$, $\mathrm{Tr}\,\rho^2 = 1$. | `q8-why:b4` (F), `q8-pure-rho:b3` (G) | — |
| `qc-density-matrix` | density matrix | notation | A state written as a table: $\|\psi\rangle\langle\psi\|$ for one state, a chance-weighted sum for a mixture. | $\rho = \sum_np_n\|\psi_n\rangle\langle\psi_n\|$: $\rho \ge 0$, $\mathrm{Tr}\,\rho = 1$. | `q8-pure-rho:b1` | `qc-l6-mixture` |
| `qc-trace` | trace | notation | The sum of a square matrix's diagonal entries, written Tr. | $\mathrm{Tr}\,A = \sum_i\langle e_i\|A\|e_i\rangle$, the same in every orthonormal basis; $\mathrm{Tr}(AB) = \mathrm{Tr}(BA)$. | `q8-pure-rho:b3` | — |
| `qc-coherence` | coherence | notation | An off-diagonal entry of ρ: it carries a relative phase, and a coin mixture of basis states has none. | $\rho_{ij}$, $i \ne j$; $\rho_{ji} = \rho_{ij}^*$. | `q8-pure-rho:b4` | — |
| `qc-von-neumann-equation` | von Neumann equation | notation | The rule that moves ρ in time; the dot means a rate of change and $\hat H$ is the energy operator. | $i\hbar\dot\rho = [\hat H, \rho]$, from $i\hbar\|\dot\psi\rangle = \hat H\|\psi\rangle$; sign opposite to Heisenberg's. | `q8-trace-rule:b2` | — |
| `qc-ensemble` | ensemble | notation | A collection of states with chances; its ρ weights each state's matrix by its chance. | $\{p_n, \|\psi_n\rangle\} \mapsto \rho = \sum_np_n\|\psi_n\rangle\langle\psi_n\|$; many ensembles share one ρ. | `q8-mixed:b1` | `qc-l1-average` |
| `qc-purity` | purity | notation | $\mathrm{Tr}\,\rho^2$: 1 for a pure state and less for a mixture; at least ½ for a qubit. | $\mathrm{Tr}\,\rho^2 = \sum_k\lambda_k^2$; 1 iff pure; $\tfrac12(1 + \|\mathbf r\|^2)$ for a qubit. | `q8-mixed:b2` | — |
| `qc-mixed-state` | mixed state | — | A state that no single ket describes: a mixture, with purity below 1. | $\rho^2 \ne \rho$, $\mathrm{Tr}\,\rho^2 < 1$. | `q8-mixed:b2` | — |
| `qc-bloch-ball` | Bloch ball | space | The solid ball of one-qubit states: pure on the surface, mixed inside, $\tfrac12I$ at the centre. | $\rho = \tfrac12(I + \mathbf r\cdot\boldsymbol\sigma)$, $\|\mathbf r\| \le 1$, $r_j = \mathrm{Tr}(\rho\sigma_j)$ (the notes and Bergou write $\mathbf n$). | `q8-mixed:b3` | `qc-l6-bloch` |
| `qc-thermal-state` | thermal state | — | The mixture a warm source makes in a field: lower energies are more likely. | $\rho = e^{-\hat H/k_BT}/\mathrm{Tr}\,e^{-\hat H/k_BT}$; for a spin, $\langle S_z\rangle = \tfrac\hbar2\tanh(E_Z/2k_BT)$. | `q8-mixed:b5` | — |
| `qc-maximally-mixed` | maximally mixed state | — | The centre of the ball: every reading is a fair coin. | $\tfrac12I$ for a qubit, $I/d$ in dimension d. | `q8-mixed:b7` | — |
| `qc-positive-operator` | positive operator | notation | A Hermitian matrix with no negative eigenvalue; for ρ the eigenvalues act as chances. | $A \ge 0$ ⇔ $\langle\varphi\|A\|\varphi\rangle \ge 0$ for all φ ⇔ spectrum ≥ 0. | `q8-ball:b2` | — |
| `qc-convex-set` | convex set | space | A set that contains the straight segment between any two of its points, like the ball of states. | $t\rho_1 + (1 - t)\rho_2 \in \mathcal D$ for $0 \le t \le 1$; its extreme points are the pure states. | `q8-recipes:b3` | — |
| `qc-unitary-freedom` | unitary freedom | — | Two recipes give the same ρ exactly when their chance-weighted kets are linked by a unitary table. | $\sqrt{p_i}\|\psi_i\rangle = \sum_jU_{ij}\sqrt{q_j}\|\varphi_j\rangle$, padding the shorter list (Bergou p. 20; N&C Thm 2.6). | `q8-recipes:b4` | — |

(In the table `\|` is a Markdown escape; the strings carry a plain `|`.) Reused: `qc-mixture` (Q1; its Formal entry's
"Chapter Q6" becomes "Chapter Q8" in the R1 fix), `qc-outer-product`, `qc-kronecker-delta`, `qc-hadamard`, `qc-unitary`
(Q2), `qc-projector`, `qc-bloch-sphere`, `qc-pauli-matrices`, `qc-expectation`, `qc-eigenvalue`, `qc-commutator`,
`qc-anticommutator`, `qc-spectral-representation`, `qc-selective-measurement` (Q3), `qc-tensor-operator` (Q4),
`qc-pauli-string`, `qc-correlation-grid` (Q6), `qc-ghz` (Q7).

**Notation and space beats (one each, both tracks, with a view):**

| Gloss id | Kind | Beat | View |
|---|---|---|---|
| `qc-density-matrix` | notation | `q8-pure-rho:b1` | `amp(N, {dials:true})` over `mx(out(N))` |
| `qc-trace` | notation | `q8-pure-rho:b3` | `mx(out(N), {trace:true})` |
| `qc-coherence` | notation | `q8-pure-rho:b4` | `mx(out({dir:{thetaDeg:60, phiDeg:{from:45, to:225}}}), {highlight:[[0,1],[1,0]]})` |
| `qc-von-neumann-equation` | notation | `q8-trace-rule:b2` | `mx(lin([1, prod(Hs, out(N))], [-1, prod(out(N), Hs)]))` (needs: matrix-v2) |
| `qc-ensemble` | notation | `q8-mixed:b1` | `mx(BOX, {highlight:[[0,3],[3,0]]})` over `tqR(BOX)` (needs: two-qubit) |
| `qc-purity` | notation | `q8-mixed:b2` | `mx(prod(BOX, BOX), {trace:true})` (needs: matrix-v2) |
| `qc-bloch-ball` | space | `q8-mixed:b3` | `ball(bZX, {recipe:true})` over `mx(ZX)` |
| `qc-positive-operator` | notation | `q8-ball:b2` | `ball(bZX)` over `mx(ZX)` |
| `qc-convex-set` | space | `q8-recipes:b3` | `ball({mix:[{of:'+z', w:1/4}, {of:'+x', w:3/4}]}, {recipe:true})` over `mx(mix([1/4, {ket:'0'}], [3/4, {ket:'+'}]))` |

Not here, by ownership: the partial trace and $\rho_{AB}$ (Q9); the projector $P_\psi$ (Q3, which `qc-density-matrix`
links back to); operator space $a_0I + \mathbf a\cdot\boldsymbol\sigma$ (Q3).

## 6. Review card per unit (both tracks)

### `q8-why`
- **G points:** (1) Reading one GHZ qubit and losing the record leaves a coin's choice of $|00\rangle$ or $|11\rangle$. (2) In z the box looks like $\Phi^+$. (3) An x reading on both qubits tells them apart: 0 against +1. (4) The box holds no entanglement.
- **F points:** (1) No ket reproduces both the z and the x statistics: the pair is mixed. (2) $\langle XX\rangle_{\rm box} = 0$, $\langle XX\rangle_{\Phi^+} = 1$. (3) GHZ entanglement does not survive the loss of a qubit.
- **Equations:** $\langle X_1X_2\rangle_{\rm box} = \tfrac12\langle00|XX|00\rangle + \tfrac12\langle11|XX|11\rangle = 0$
- **Trap:** "same z chances means same state": a superposition and a mixture can share every z statistic.

### `q8-pure-rho`
- **G points:** (1) $\rho = |\psi\rangle\langle\psi|$. (2) The diagonal holds the chances. (3) The corners, the coherences, hold the relative phase. (4) $\mathrm{Tr}\,\rho = 1$, and a pure $\rho$ squares to itself.
- **F points:** (1) $\rho_{ij} = c_ic_j^*$. (2) $\rho$ is Hermitian with unit trace; $\rho^2 = \rho$ iff pure. (3) $\rho$ drops the global phase.
- **Equations:** $\rho = |\psi\rangle\langle\psi|,\quad \rho_{ij} = c_ic_j^*,\quad \mathrm{Tr}\,\rho = 1$
- **Trap:** reading a coherence as a chance: the corners can be complex and even negative.

### `q8-trace-rule`
- **G points:** (1) An average is a trace: $\langle A\rangle = \mathrm{Tr}(A\rho)$. (2) A reading with no record erases the corners. (3) $\rho$ moves by $i\hbar\dot\rho = [\hat H, \rho]$. (4) Under $\tfrac{\hbar\omega}2Z$ the corners turn and the diagonal stays.
- **F points:** (1) $\mathrm{Tr}(A\rho) = \mathrm{Tr}(\rho A)$ holds with no ket. (2) Postulates 4a–6a: $\mathrm{Tr}(P_j\rho)$, $P_j\rho P_j/p_j$, $\sum_jP_j\rho P_j$. (3) The von Neumann sign is opposite to Heisenberg's.
- **Equations:** $\langle A\rangle = \mathrm{Tr}(A\rho),\quad i\hbar\dot\rho = [\hat H, \rho]$
- **Trap:** using Heisenberg's sign for $\rho$: $i\hbar\dot\rho = [\rho, \hat H]$ runs time backwards.

### `q8-mixed`
- **G points:** (1) A mixture weights each member's $\rho$ by its chance. (2) Purity $\mathrm{Tr}\,\rho^2$ is 1 only for pure states. (3) A qubit mixture's arrow is the weighted average of its members' arrows, inside the sphere. (4) A thermal box has $\langle S_z\rangle = \tfrac\hbar2\tanh(E_Z/2k_BT)$.
- **F points:** (1) $\rho = \sum_np_n|\psi_n\rangle\langle\psi_n|$, $\langle A\rangle = \mathrm{Tr}(\rho A)$. (2) The notes' mixture: $\mathrm{Tr}\,\rho^2 = \tfrac34$, $\langle S_z\rangle = \langle S_x\rangle = \tfrac\hbar4$. (3) HW2 P4: $\mathrm{Tr}\,\rho^2 = 1 - p + p^2$.
- **Equations:** $\rho = \sum_np_n|\psi_n\rangle\langle\psi_n|,\quad \mathrm{Tr}\,\rho^2 \le 1$
- **Trap:** adding amplitudes instead of matrices: a mixture of $|0\rangle$ and $|+\rangle$ is not the ket $(|0\rangle + |+\rangle)/\text{norm}$.

### `q8-ball`
- **G points:** (1) $\rho = \tfrac12(I + \mathbf r\cdot\boldsymbol\sigma)$: one arrow per $\rho$. (2) Positivity means $|\mathbf r| \le 1$. (3) The surface is the pure states. (4) $r_j = \mathrm{Tr}(\rho\sigma_j)$: the coordinates are averages.
- **F points:** (1) $\det\rho = (1 - |\mathbf r|^2)/4$. (2) $\mathrm{Tr}\,\rho^2 = \tfrac12(1 + |\mathbf r|^2)$. (3) Unit trace and Hermiticity are not enough; positivity is the third condition.
- **Equations:** $\rho = \tfrac12(I + \mathbf r\cdot\boldsymbol\sigma),\quad r_j = \mathrm{Tr}(\rho\sigma_j)$
- **Trap:** a short arrow is not "partly up": it is a mixture whose every reading is less certain.

### `q8-recipes`
- **G points:** (1) One $\rho$ has many recipes; no experiment can tell them apart. (2) $\rho$'s eigenvalues and eigenvectors are one recipe. (3) Mixing keeps you inside the ball: the set is convex. (4) A pure state has exactly one recipe.
- **F points:** (1) Notes Eqs. 2.18–2.20. (2) Convexity and extreme points. (3) Unitary freedom with padding (Bergou p. 20; N&C Theorem 2.6).
- **Equations:** $\sqrt{p_i}|\psi_i\rangle = \sum_jU_{ij}\sqrt{q_j}|\varphi_j\rangle$
- **Trap:** "the ensemble is the state": the same $\rho$ hides every recipe equally well.

## 7. Symbol-before-use tables

Abbreviations: wh, pr, tr, mi, ba, re (the six units in order). Carried from Q1–Q7 and recapped at `q8-why:b1`:
$|0\rangle$, $|1\rangle$, $|\pm\rangle$, $|{\pm y}\rangle$, kets and bras, $|ab\rangle$, X, Y, Z, H, I, the Pauli matrices
$\sigma_j$ and S = σ/2, Pauli strings and $X_1X_2$ (Q6), $\Phi^+$ and the grid (Q6), GHZ (Q7), $\langle A\rangle$,
projectors $P$, eigenvalues, commutators and anticommutators, the Bloch arrow and its angles θ, φ (Q3), operator space
$a_0I + \mathbf a\cdot\boldsymbol\sigma$ (Q3), the 2 × 2 determinant (Q3), $\delta_{jk}$ and unitaries (Q2), ħ, e and the
mirror $z^*$ (F1).

### 7.1 Ground track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| qubit 3, $\|000\rangle$ | wh:b1 | Q7 | OK | — |
| $\Phi^+$, $\beta_{00}$ | wh:b3 | Q6 | OK | Rosetta in place (ruling 9). |
| $X_1X_2$, $Y_1Y_2$ | wh:b3, b5 | Q6 | OK | — |
| ρ, $\|\psi\rangle\langle\psi\|$ | pr:b1 | pr:b1 | OK | wh:b2's matrix is captioned as "the box's table", without ρ. |
| $c_0$, $c_1$, $\rho_{ij}$, $c^*$ | pr:b2 | pr:b2; F1 (mirror) | OK | — |
| Tr | pr:b3 | pr:b3 | OK | — |
| coherences | pr:b4 | pr:b4 | OK | — |
| γ | pr:b5 | pr:b5 | OK | Defined in the question. |
| $\mathrm{Tr}(A\rho)$, A | tr:b1 | tr:b1 | OK | A is any operator. |
| $\hat H$, $\tfrac{d}{dt}$, $\dot\rho$, $[\hat H, \rho]$ | tr:b2 | tr:b2; Q3 (commutator) | **FLAG** | $\hat H$ against the H gate, stated in place (§12 Q4). |
| ω | tr:b3 | tr:b3 | OK | "turn at rate ω", with Q1's precession. |
| $P_0$, $P_j$ | tr:b4 | Q3 | OK | — |
| $p_n$, $\|\psi_n\rangle$, Σ | mi:b1 | mi:b1 | OK | — |
| $\mathrm{Tr}\,\rho^2$ | mi:b2 | mi:b2 | OK | — |
| $\mathbf r$ | mi:b3 | mi:b3 | OK | Rosetta (n, a) in F only. |
| $\langle S_z\rangle$, $\langle S_x\rangle$ | mi:b4 | Q3 | OK | — |
| $E_Z$, $k_BT$, $p_\uparrow$, $p_\downarrow$ | mi:b5 | mi:b5 | OK | ↑ = $\|0\rangle$ said in place. |
| tanh | D6 | D6 step 5 | OK | Named in place. |
| p | mi:b6 | mi:b6 | OK | — |
| $\tfrac12I$ | mi:b7 | mi:b7 | OK | — |
| $a_0$, $\mathbf a\cdot\boldsymbol\sigma$ | ba:b1 | Q3 (Unit 3.3) | OK | — |
| $r_x, r_y, r_z$, $\det$, $\rho \ge 0$ | ba:b2 | ba:b2; Q3 (det) | OK | — |
| $\|u\rangle$ | ba:b3 | ba:b3 | OK | — |
| $\sigma_j$, $\mathrm{Tr}(\sigma_j\sigma_k)$ | ba:b4 | Q3 | OK | — |
| $\lambda_\pm$, $\|u_\pm\rangle$ | re:b2 (D10) | re:b2 | OK | — |
| t | re:b3 | re:b3 | OK | The notes' θ, renamed to avoid the polar angle (§8). |
| $\|\psi^\perp\rangle$ | D11 | D11 step 5 | OK | Defined in its `why`. |
| $\|\tilde\psi_i\rangle$, $U_{ij}$ | D12 | D12 step 1 | OK | — |

### 7.2 Formal track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $\|\mathrm{GHZ}\rangle$ | wh:b1 | Q7 | OK | — |
| $\Psi_+$ (Bergou) | wh:b3 | wh:b3 | OK | Rosetta. |
| W state | wh:b4 | Q7 (`q7-ghz:b1` F) | OK | — |
| $e_i$ | pr:b2 | Q2 | OK | — |
| $\|\dot\psi\rangle$, $\dot A$ | tr:b2 | tr:b2 | OK | Heisenberg's equation is quoted, not derived. |
| $\{p_n, \|\psi_n\rangle\}$, $\rho_{12}$ | mi:b1 | mi:b1 | OK | — |
| $\lambda_j$ | mi:b2 | Q3 (eigenvalues) | OK | — |
| $\mathbf n_n$ | mi:b3 | Q3 (unit Bloch vector) | OK | — |
| $E_\uparrow$, $E_\downarrow$ | mi:b5 | mi:b5 | OK | — |
| $e^{-\hat H/k_BT}$ | D6 | Q4 (functions of operators) | OK | — |
| $\mathbf a$ (operator space) against $\mathbf a$ (HW2 P6) | ba:b1, ba:b5 | ba:b1; ba:b5 | **FLAG** | HW2's a is our r; stated in ba:b5 F. |
| $\langle\varphi\|$, $\rho \ge 0$ | ba:b2 | ba:b2 | OK | — |
| $\sigma_\alpha$ | ba:b5 | ba:b5 | OK | HW2's index. |
| $\{\sigma_j, \sigma_k\}$ | D14 | Q3 | OK | — |
| $\|\psi^\perp\rangle$, $\rho_k$ | re:b3 | re:b3 | **FLAG** (minor) | ⊥ read as "orthogonal to"; Q2's word. |
| $\mathcal D$ (glossary only) | — | glossary | OK | Not used in a beat. |

**Counts:** Ground 1 FLAG, Formal 2 FLAGs, all resolved in place.

## 8. Errata

None in the mathematics of notes L7 pp. 34–38. Checked: the box's statistics and $\langle\sigma_{x1}\sigma_{x2}\rangle$
(0 against +1), $\mathrm{Tr}\,\rho_{12}^2 = \tfrac12$, $\rho_{ij} = c_ic_j^*$, $\mathrm{Tr}\,\rho = 1$, $\mathrm{Tr}(A\rho)$,
the von Neumann sign, the thermal tanh, the p. 37 matrix with $\mathrm{Tr}\,\rho^2 = \tfrac34$ and $\langle S_z\rangle = \langle S_x\rangle = \tfrac\hbar4$,
Eqs. 2.14–2.20 (the notes print Eq. 2.20's brackets correctly), convexity, and the
decomposition theorem.

**Carried from the map:** Bergou **B3**, p. 20, Eq. 2.24: the bracket is misplaced; it should read
$(\tfrac12 + \tfrac{\sqrt2}4)|u_+\rangle\langle u_+| + (\tfrac12 - \tfrac{\sqrt2}4)|u_-\rangle\langle u_-|$. Cited in
`q8-recipes:b2` F and D10 as "bracket corrected".

**Silent notes (no box).**
| Where | Point | Action |
|---|---|---|
| notes p. 34 against p. 35 | The box reads qubit 1, but is then named $\rho_{12} = \mathrm{Tr}_3$ | The plan reads qubit 3, so the two agree (by GHZ's symmetry nothing else changes) (§12 Q2) |
| notes p. 36 | H is the Hamiltonian; in 709, H is the Hadamard gate | $\hat H$ throughout (§12 Q4) |
| notes Eq. 2.21; Bergou Eq. 2.25 | The mixing weight is θ, the polar angle's letter | t, with a Rosetta in `q8-recipes:b3` F |
| notes Eqs. 2.14–2.16; Bergou Eqs. 2.18–2.20; HW2 P6 | The Bloch vector of ρ is n (notes, Bergou) or a (HW2) | r (ruling 10), Rosetta at `q8-mixed:b3` F and `q8-ball:b5` F |
| HW2 P4(b) | "for a mixed state (p ≠ 0 or p ≠ 1)": as written the condition always holds; it means 0 < p < 1 | The walkthrough says so in one clause |
| notes p. 38 | "BHS" is Bergou–Hillery–Saffman; "p. 20 in BHS" is printed p. 20 | Already in re-map §1.4 |

**Engine (not a source erratum):** `density.ensembleUnitary` is not unitary in the padding case (§9.1).

## 9. Engine gaps and stage-contract gaps

### 9.1 Engine
**No new functions.** Q8 uses, from the merged E1 and the existing `density` module: `densityOf`, `mixtureN`,
`purityN`, `reducedBloch`, `partialTrace` (one check), `spectrum`, `eigenEnsemble`, `ensembleUnitary`, `evolveRho`,
`thermalPolarization`, `isDensity`, `densityGap`; `cmat.detN`, `eigh`, `traceN`; `measure.marginal`, `postMeasure`,
`expectationN`, `probs`; `linalg.commutator`; `spin.ketFromBloch`.

**One bug, to fix before the Q8 build (an E1 fix, skill `11-engine-module`):**
- `ensembleUnitary(e₁, e₂)` returns a U with A·U = B but **U†U ≠ I** when the longer ensemble has more members n than
  the dimension d. Example: the trine (three states 120° apart, weights ⅓) against the z poles (padded): U's third column
  is zero, and U†U has a zero on its diagonal (`q8TrineUUnitary` = 1).
- Cause: `svd(A)` of the d × n matrix A returns a thin V (n × d), so `matmul(Va, D)` drops the completed rows of D. The
  docstring's "always unitary by construction" holds only for n ≤ d, which is what the existing tests cover.
- Fix: complete Va to an n × n unitary (orthonormal completion of its columns) before U = Va·D. Add a property test over
  ensembles with n > d (trine ↔ poles; 3- and 4-member qubit ensembles; a qutrit case): U†U = I and A·U = B. The numpy
  twin is a full-matrices SVD plus `lstsq` (`q89plan-numpy.py`, `ens_unitary`).
- If the fix slips, `q8-recipes:b4` F drops its trine sentence and `q8TrineUUnitary`; nothing else depends on it.

**Notes for `Q8.values.ts`.**
- `eigenEnsemble` returns eigenvectors with arbitrary phase. The values file fixes the phase (first non-zero component real
  and positive, as Eq. 2.19 writes $|u_\pm\rangle$), so `q8UMinus` = (0.383, −0.924) and U = H exactly. Without it, a column
  of U can flip sign.
- $\hat H$ for the precession is Z/2 in units of ħω (ħ = 1, ω = 1); `evolveRho(Ĥ, ρ, π/2)` is the quarter period.
- `thermalPolarization(x)` is tanh(x/2) with x = $E_Z/k_BT$, which is the notes' formula.

The claim ledger is §1.7. Every key is computed in `Q8.values.ts` from these calls; the numpy twin follows the route in
the ledger's last column.

### 9.2 Stage contract
**`two-qubit` (needs: two-qubit)**, the re-map's §6.1 fields only: `source:{ket}` (`{bell:'Phi+'}`), `source:{rho}` with a
two-qubit `mixture` (`BOX`), `arrows:'reduced'`, `grid:'T'`, `highlight` (`'xx'`, `'yy'`, `'zz'`), `labels:'q1-q2'`.
Beats: `q8-why:b2`, `b3`, `b4`, `b5` (reveal); `q8-mixed:b1`; derivation D1.

**`matrix` v2 (needs: matrix-v2).**
| Field | Used as | Beats and derivations |
|---|---|---|
| `{product:[…]}` | Xρ, ρσ_x, ρ², $\hat H\rho$ | tr:b1, tr:b2, mi:b2, ba:b4; D3, D4, D5, D7, D9, D14 |
| `{lin:[…]}`, c ∈ {1, −1, ½, 1/√2}, **nested** (a `lin` inside a `prod` inside a `lin`) | $[\hat H, \rho]$ with $\hat H$ = `lin([1/2, pa('Z')])`; $\tfrac12I + \tfrac1{\sqrt2}\sigma_x$ | tr:b2, ba:b6; D5 |
| `spectrum:'bars'` (negative bars flagged) | eigenvalues of ρ; the bad matrix's −0.207 | ba:b3, ba:b6, re:b2; D10, D11 |

The re-map's §6.2 lists `lin`'s sources as any `Src`; this plan needs that recursion explicitly (`Hs` inside `prod`
inside `lin`), and a test for it.

**v1 checks for the builder (no new fields):**
- (a) `{rho:{mixture}}` whose weights sweep, `{from:0, to:1}` against `{from:1, to:0}`, summing to 1 at every hold
  progress (D13).
- (b) An `outer` of a `dir` source whose `phiDeg` sweeps (`pr:b4`, `tr:b3`): the coherence hue must turn and the
  diagonal stay.
- (c) A 4 × 4 `mix` (`BOX`) with `highlight:[[0,3],[3,0]]` on zero cells.
- (d) `{gate:{name:'H'}}` beside a `bloch-ball` in a split (re:b4).

**GL kinds in 709 (no new fields).** `bloch-ball` has not appeared in a 709 chapter before. It must label its poles
$|0\rangle$ and $|1\rangle$ as Q3's `bloch` does in 709, and show the readout of `purity:true` (|r|, Tr ρ²). All its uses are
existing fields: `point` (`Dir`, `'oven'`, `{mix}`, `{r}`), `recipe`, `compare`, `purity`. A swept chord (weights that
move) is **not** needed: D11 and D13 use two static weights each. `operator-space` takes `{a0, a}` from the values file;
`bloch` uses `rotate` and `trail` only.

**Fallbacks if a kind slips past the Q8 build** (beat stages; derivations keep their v1 views and drop the others only if
the lint still sees ≥ 2 distinct views):
| Beat | Fallback |
|---|---|
| tr:b1, ba:b4 (`prod … trace`) | `mx(out(N))` or `mx(ZX)`, with the trace value in the caption |
| tr:b2 (`[\hat H, \rho]`) | `split( bl(bN, {rotate…}) / mx(out(Nt)) )` (tr:b3's stage) |
| mi:b2 (ρ², trace) | `mx(BOX)` and the caption |
| ba:b3, re:b2 (`spectrum`) | `mx(out(N))`, `mx(ZX)` with the eigenvalues in the caption |
| ba:b6 (`lin`) | the matrix in TeX only, stage `ball('oven')` |
| two-qubit beats | `amp({bell:'Phi+'}, {mode:'probability'})` and `mx(BOX)`, with the grid values in the caption |

### 9.3 Widget gaps
W3 `ball-mixer` (deferred under the cap): pick up to three members on the sphere and their weights; shows the point, the
recipe, ρ and the purity. The §3 fallbacks carry the units until then.

## 10. Media
- **Opener (Part III, Blender still; planned here per `P-Q7-story.md` §10):** "Two recipes, one point". Weighted dots of
  the z poles, the x poles and the y poles slide to one shared centre; then $|0\rangle$, $|+\rangle$ and $|u_\pm\rangle$ slide
  to one interior point. Data from the engine (`mixtureN`, `eigenEnsemble`), exported by `pipeline/blender/gen_opener_data.ts`;
  Blender draws only.
- **Film (deferred) `qc-q8-two-recipes`** "One matrix, many recipes": the dots of each recipe and their common point,
  with ρ's entries beside them. Manifest: `q8HalfGap`, `q8ZX`, `q8ZXEig`, `q8UThetaDeg`, `q8ZXR`.
- **Decor (Higgsfield, credits need the user):** fog inside a frosted glass sphere on a dark bench; no text, no numbers,
  no diagrams.

## 11. Hooks

### 11.1 Concept-map stations
| id | label | chapter · unit | needs | sameAs (448) |
|---|---|---|---|---|
| `qc-lost-record` | A lost record: mixture, not superposition | Q8 · `q8-why` | `qc-ghz`, `qc-bell-basis` | `mixtures` |
| `qc-density-matrix` | One state as a matrix | Q8 · `q8-pure-rho` | `qc-born-projector`, `qc-operator-matrix` | — |
| `qc-trace-rule` | Averages as traces; how ρ moves | Q8 · `q8-trace-rule` | `qc-density-matrix`, `qc-observables`, `qc-uncertainty` | `mean-matrix-form` |
| `qc-mixed-states` | Mixtures and purity | Q8 · `q8-mixed` | `qc-trace-rule` | `mixtures` |
| `qc-bloch-ball` | The Bloch ball | Q8 · `q8-ball` | `qc-mixed-states`, `qc-bloch-sphere`, `qc-spin-operators` | `bloch-sphere` |
| `qc-recipes` | One matrix, many recipes | Q8 · `q8-recipes` | `qc-bloch-ball`, `qc-spectral` | `mixtures` |

Bridge ids used, all existing: `qc-l6-mixture`, `qc-l6-bloch`, `qc-l1-average`, `qc-l3-postulates`, `qc-l4-projectors`.
The `sameAs` targets are 448 concept ids (`content/concepts.ts`); three stations share `mixtures`, which the concept test
allows (F1 shares `complex-numbers` four times).

**Future bridges (TODO; targets not built):** Q9 (the box as $\mathrm{Tr}_3$, HW2 P7(e); the ball's radius and entropy;
purification of Unit 8.4's mixture), Q10 (mixtures of products: separable states), Q13 (open-system maps move the ball),
Part XI (Lindblad decay, `q8-trace-rule:b2`).

### 11.2 Arcade (6 levels)
Label constant: `const Q8x = (unit, label) => ({ lecture: 'Q8', unit, label })`. All six are Spot the error.
1. **`q8-why` · `qc-z-only`** — "Same chances, same state?"
   - Steps: "The box reads 00 or 11, half the time each." · "$\Phi^+$ also reads 00 or 11, half the time each." · "So their $\langle Z_1Z_2\rangle$ agree: both are +1." · "So the box is in the state $\Phi^+$."
   - `wrong: 3`. Why: their $\langle X_1X_2\rangle$ differ, 0 against +1 (`q8BoxXX`, `q8PhiXX`).
2. **`q8-pure-rho` · `qc-coherence-chance`** — "A negative chance?"
   - Steps: "For $|-\rangle$, $\rho = \tfrac12\begin{pmatrix}1 & -1\\ -1 & 1\end{pmatrix}$." · "The diagonal holds the chances, ½ and ½." · "The corners are −½." · "So reading $|-\rangle$ has a negative chance somewhere."
   - `wrong: 3`. Why: corners are coherences, not chances; they carry the relative phase (`q8PlusMinusCoh`).
3. **`q8-trace-rule` · `qc-vn-sign`** — "Which sign?"
   - Steps: "The ket moves by $i\hbar|\dot\psi\rangle = \hat H|\psi\rangle$." · "The bra moves by $-i\hbar\langle\dot\psi| = \langle\psi|\hat H$." · "Together, $i\hbar\dot\rho = \hat H\rho - \rho\hat H$." · "So $i\hbar\dot\rho = [\rho, \hat H]$, as for an observable."
   - `wrong: 3`. Why: $\hat H\rho - \rho\hat H = [\hat H, \rho]$; the sign is opposite to Heisenberg's (`q8VNCheck`).
4. **`q8-mixed` · `qc-mix-amplitudes`** — "Mix the matrices"
   - Steps: "A box holds $|0\rangle$ and $|+\rangle$, half each." · "Its $\rho$ is half of each member's $\rho$." · "Its arrow is the average of the two arrows, inside the sphere." · "So the box is the ket $(|0\rangle + |+\rangle)/\text{norm}$."
   - `wrong: 3`. Why: that ket is pure, on the surface; the box has purity 0.75 (`q8ZXPur`).
5. **`q8-ball` · `qc-trace-enough`** — "Trace 1 is enough?"
   - Steps: "$\tfrac12I + \tfrac1{\sqrt2}\sigma_x$ has trace 1." · "It is Hermitian." · "Its entries all lie between 0 and 1." · "So it is a density matrix."
   - `wrong: 3`. Why: $|\mathbf r| = \sqrt2 > 1$, and one eigenvalue is −0.207 (`q8BadEig`).
6. **`q8-recipes` · `qc-recipe-unique`** — "Which recipe is real?"
   - Steps: "$\tfrac12(|0\rangle\langle0| + |1\rangle\langle1|) = \tfrac12I$." · "$\tfrac12(|{+x}\rangle\langle{+x}| + |{-x}\rangle\langle{-x}|) = \tfrac12I$ too." · "Every prediction is $\mathrm{Tr}(A\rho)$." · "So a z reading of many copies reveals which recipe was used."
   - `wrong: 3`. Why: both boxes have the same $\rho$, so no reading can tell them apart (`q8HalfGap`).

## 12. Questions for the judge

**Q1. The engine bug in `ensembleUnitary`.** It is not unitary when one recipe has more members than the dimension (§9.1).
*Recommend:* an E1 fix (one function, one property test, the numpy twin already written) before the Q8 build; Q8 keeps
the trine sentence only if the fix lands, and the plan's other U claims (2 × 2) pass today.

**Q2. Which GHZ qubit is read.** The notes read qubit 1 (p. 34) and then write the box as $\rho_{12} = \mathrm{Tr}_3$ (p. 35),
as HW2 P7(e) does. *Recommend:* read qubit 3 (q2), so the box is qubits 1 and 2 from the first beat and Q9's
$\mathrm{Tr}_3$ derivation lands on the same matrix; `q8-why:b1` F says the notes read qubit 1 and that symmetry makes it
the same.

**Q3. Where the Bloch ball is introduced.** The re-map's §5 puts the "Bloch ball, ρ = ½(I + r·σ)" space beat in
`q8-ball`. But Unit 8.4's first one-qubit mixture already sits inside the sphere. *Recommend:* the space beat moves to
`q8-mixed:b3` (r as the weighted average of the members' arrows); `q8-ball` derives the exact form and adds
`qc-positive-operator`. Nothing is used before its beat either way.

**Q4. Two H's.** The notes write H for the Hamiltonian (p. 36); 709 writes H for the Hadamard gate (Q2, Q4), and Unit 8.6
needs both. *Recommend:* $\hat H$ for the Hamiltonian in every track and chapter from Q8 on (Q13 and Part XI inherit it),
stated once in `q8-trace-rule:b2`.

**Q5. The Schrödinger equation.** 709 has not stated $i\hbar|\dot\psi\rangle = \hat H|\psi\rangle$ before Q8 (Q2 has the
generator $e^{-iJ_z\chi/\hbar}$, Q4 the rotation gates). The notes use it on p. 36 without comment. *Recommend:* state it in
the von Neumann notation beat, as above, with Q2's generator as the link-back; no separate unit.

**Q6. Bergou's §2.8 problems.** P2.1–P2.5 are ⚑ (no sheet assigns them), and HW3 is not ingested. *Recommend:* none is used
as a Q8 challenge; Q9 uses ⚑ P2.5's result only as a cited derivation (its §12), to be re-checked when HW3 arrives
(ruling 12).

**Q7. A swept chord.** The re-map's §4 asks for `bloch-ball{chord}` swept in the weight. `BallPoint.mix[].w` is a number,
not a sweep. *Recommend:* no new field; D11 and D13 use two static weights each (two distinct views). A sweepable weight
can join the ball's `ellipsoid`/`trajectory` batch for Q13.
