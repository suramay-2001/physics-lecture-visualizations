# Design spec: stage kinds

Source of truth: `app/src/content/stage.ts` (`StageKind`, `KIND_RENDER`, `PASSPORT`, `PASSPORT_VARIANT`) and
`docs/roles/interface-changes.md` (rows W-709 #4–#8 for how the 709 kinds and their fields were added). To add a
new kind, follow `skills/10-stage-kind/SKILL.md`.

## Render path

`KIND_RENDER: {[K in StageKind]: 'gl' | 'svg'}`. **gl** = one scene on the shared WebGL canvas
(`stage/StageHost.tsx`, lazy three chunk). **svg** = DOM in the stage box's slot (`stage/svg/SvgStage.tsx`,
lazy), driven by the same resolve → interp → store pipeline as GL, so scrubs/transitions/reveals/passports/
readouts/captions behave identically and no WebGL is required. An SVG kind's one scene component also draws its
own print figure (`stage/figures/FigureFor.tsx`, `mode: 'print'`) — the print figure *is* the stage picture, in
print ink.

| Kind | Path | Course |
|---|---|---|
| `lab-r3` | gl | 448 |
| `hilbert-plane` | gl | 448 (709 variant `plane709`) |
| `bloch` | gl | 448 (709 variant `bloch709`) |
| `bloch-ball` | gl | 448 |
| `hopf` | gl | 448 |
| `operator-space` | gl | 448 (variant `labels: 'plain'` from L3) |
| `complex-plane` | svg | shared (built for 709) |
| `amplitudes` | svg | shared (built for 709) |
| `circuit` | svg | shared (built for 709) |
| `matrix` | svg | shared (built for 709) |
| `two-qubit` | svg | shared (built for 709) |
| `plot` | svg | shared (built for 709) |

**The SVG kinds and `physics/qc/` are shared (W-448 #5, rulings `448-L8L11.md` P6).** A 448 lecture may draw any SVG kind
(named by data in its story, like every kind) and its claims may call the multi-qubit engine. Only course CONTENT stays
separated: `content/L*` and `content/qc709/` never share a chunk, and neither is in the entry. The kinds load as one lazy
chunk (`stage/svg/kinds.ts`) that a lecture chunk never imports statically; `physics/qc/` stays out of the entry closure
(`build/chunks.test.ts` rules (h), (i), (m)). The list `STAGE_KINDS_709` in `content/stage.ts` is the SVG kinds, named for
the course that built them: a new SVG kind, whichever course needs it, joins it. The kinds' fidelity notes are shared
(`content/fidelity.svg.ts`): a 448 passport's drawer for one of them is never empty.

## Per-kind reference

### `lab-r3` — physical space
- **State shape summary:** `LabState` — magnet tilts, a beam path, benches (each with `fires?: boolean`,
  default true), `beamTo?: 'gap' | 'plate'`, readouts (`sigmaBand?`, `tallies?`, `centroid?`), `gradientScale?`
  (709; schematic split-distance multiplier, capped).
- **Passport:** "PHYSICAL SPACE ℝ³ · metres"; note "schematic · not to scale"; axes x, y·beam, z·field gradient.
- **Fidelity key:** `lab-r3` (448) — exact: Born fractions, real tilt angle, beam along y; schematic: deflection
  size exaggerated (D §4.0), spread-vs-band distinction.
- **Validation:** `gradientScale ∈ (0, 1.25]` (709; the plate is ±1.15 u, spots sit at ±0.9 u — ×2 would put spots
  off the plate).

### `hilbert-plane` — real slice of ℂ²
- **State shape summary:** `HilbertPlaneState` — one or two `PlaneKet`s, `image` (Â|ψ⟩ at true length, real
  matrices only), `project`/`renormalize`, `sumOf: [PlaneKet, PlaneKet]` (709: tip-to-tail sum, dashed sides,
  true-length resultant), `arcLabel` (709: names an arc, needs `arc`).
- **Passport:** "STATE SPACE · real slice of ℂ²"; note "not a place · angles are half of lab angles"; axes
  `\|↑⟩ = \|+z⟩`, `\|↓⟩ = \|−z⟩`. 709 variant `plane709` via `passportOf(state, 'qc709')` labels the computational
  basis on the same axes.
- **Fidelity key:** `hilbert-plane` (448) + `qc-plane-vectors-not-states` (709, additive).
- **Validation:** `image` only for real matrices (true length); `project`/`renormalize` implement Rule 3 as a
  picture, resolver-computed only.

### `bloch` — pure states
- **State shape summary:** `BlochState` — `thetaDeg`/`phiDeg` (or `{thetaDeg, phiDeg}` axis), `rotate.axis`,
  `dropLines`, `readouts: ('averages'|'spreads'|'bound')[]` (`'bound'` needs `'spreads'`), shots B-STD/B-EQUATOR/
  B-POLE, variant `labels: 'poincare'` (optics).
- **Passport:** "STATE SPACE · Bloch sphere"; note "not a place · opposite points = orthogonal states"; axes
  ⟨σx⟩, ⟨σy⟩, ⟨σz⟩. 709 variant `bloch709` labels the poles `\|0⟩ = \|+z⟩` / `\|1⟩ = \|−z⟩`.
- **Fidelity key:** `bloch` (448) + `bloch-equator-unit-circle` (B-POLE shot, exact only for unit-size numbers).
- **Validation:** transitions must never jump between antipodal points (a standing content pitfall, not a
  runtime check — plan and review both watch for it).

### `bloch-ball` — pure + mixed states
- **State shape summary:** `BlochBallState` — draws `measure` (dashed axis, amber/cobalt ±n̂ dots, "P(+) along
  n̂"), `recipe` (ingredient dots + dashed chord, incl. `compareRecipe`), a pure comparison (filled silver dot,
  "pure state"), shot B-SECTION (x–z plane face on).
- **Passport:** "STATE SPACE · Bloch ball"; note "not a place · surface = pure · inside = mixed"; axes ⟨σx⟩,
  ⟨σy⟩, ⟨σz⟩.
- **Fidelity key:** `bloch-ball`.
- **Validation:** camera backs off on narrow stages (FIT 1.55); split-stage readout columns are per-slot
  (`data-slot`), never shared — a shared column makes the lower view's state look like the upper view's.

### `hopf` — S³ by stereographic projection
- **State shape summary:** `HopfState` — reveal levels 1–5, mini Bloch sphere inset.
- **Passport:** "STATE SPACE S³ · stereographic view"; note "not a place · circles kept · distances distorted";
  axes p₁, p₂, p₃.
- **Fidelity key:** `hopf`.
- **Validation:** print mode still ships only a labelled placeholder figure (open item — `hopf` has no real 2D
  print figure yet).

### `operator-space` — A = a₀I + a·σ
- **State shape summary:** `OperatorSpaceState` — `labels: 'plain'` variant (no σ, "OPERATOR SPACE · 2×2
  Hermitian", arrow read as half the eigenvalue gap, gauge as the midpoint) for L3 before L4 introduces the σ
  passport.
- **Passport:** "OPERATOR SPACE · A = a₀I + a·σ"; note "not a place · a in 3D · a₀ on the gauge (4th axis)"; axes
  a_x, a_y, a_z, a_0.
- **Fidelity key:** `operator-space`.

### `complex-plane` — shared SVG kind (built for 709)
- **State shape summary:** `ComplexPlaneState` (`CNum`, `ComplexMark`) — `z`, `w`, marks (`sum`, `product`,
  `conj`, `parts`, `modulus`, `arg`, `arc`, `velocity`), `powers`, `euler`, `chain`, `spokes`, `circle`, `line`,
  `trail`; content writes inputs only, the resolver computes every mark with `physics/complex.ts` +
  `physics/qc/complexExtra.ts`.
- **Passport:** "NUMBER PLANE ℂ"; note "not a place · a picture of numbers"; axes Re, Im; **legend: phase** (hue
  wheel, `stage/phaseHue.ts`).
- **Fidelity keys:** `qc-cplane-arithmetic`, `qc-cplane-not-space`, `qc-cplane-hue-is-angle`,
  `qc-cplane-arrows-not-forces`.
- **Validation limits:** n whole 1–1000; ≤ 12 arrows; `powers` ≤ 64; the number line is real values only.

### `amplitudes` — shared SVG kind (built for 709)
- **State shape summary:** `AmplitudesState` (`AmpSource`) — one bar per basis state (1 to 2ⁿ bars, n ≤ 5 on
  stage); bar length = |amplitude|, hue = phase (same wheel/legend); modes `'amplitude'` / `'probability'`
  (chances; one qubit keeps amber/cobalt) / `'signed'` (real, above/below axis, for Grover); source is exactly
  one of `{dir}` (a 448 direction incl. sweeps), `{ket}`, `{bell}`, `{circuit, upTo, outcomes?}` — content never
  writes a computed amplitude; F1 fields `dials`, `sum: [i, j]` (engine resultant), `labels: 'bits' | 'spin'`
  (`'spin'`: `\|0⟩ = \|+z⟩`, `\|1⟩ = \|−z⟩`, one qubit only); `inBasis: 'bell'` (two qubits: the bars are the
  overlaps ⟨Bell\|ψ⟩ with Φ+, Φ−, Ψ+, Ψ− in `BELL_BASIS` order, labelled `\|Φ+⟩` …; a transition between two different
  bases switches at ½ instead of lerping unlike lists).
- **Passport:** "STATE · amplitudes"; note "not a place · length = size"; axes "basis states"; **legend: phase**.
  Variants `PASSPORT_VARIANT.ampProbability` / `.ampSigned` relabel what the length means; `.ampBell` /
  `.ampBellProbability` ("STATE · Bell-basis amplitudes" / "chances", axes "Bell states") are used with `inBasis`.
- **Fidelity keys:** `qc-amp-engine`, `qc-amp-hue-is-phase`, `qc-amp-zero-is-up`, `qc-amp-bars-not-places`; the Bell
  reading has its own drawer (`fidelityKey` `amplitudes-bell`): `qc-amp-bell-engine`, `qc-amp-bell-hue-is-phase`,
  `qc-amp-bell-same-state`.
- **Validation limits:** n ≤ 5; `dials` ≤ 8 bars; `labels: 'spin'` only for one qubit; `signed` mode only for
  real amplitudes; circuit sources validated via `validateCircuit` + stage caps; `inBasis: 'bell'` only for a
  two-qubit state and not with `signed` or `sum`.

### `circuit` — shared SVG kind (built for 709)
- **State shape summary:** `CircuitStageState` — a `physics/qc/circuit.ts` `Circuit` (q0 top wire; gate boxes,
  control dots, ⊕, SWAP, meters, classical conditions) drawn by columns, with a scrubbable cursor `upTo`; the
  columns after the cursor are dimmed. v2 (W-709 #15): `observable?: {pauli, at}` — the Pauli string measured
  after column `at`, drawn as a bracket across the wires plus its label (`data-anchor="observable"`); it is not
  part of the circuit's own identity (`key`), so it carries unchanged through a same-circuit interpolation.
- **Passport:** "CIRCUIT · time runs →"; note "not a place · a wire is a qubit"; axes "time →".
- **Fidelity keys:** `qc-circuit-engine-state`, `qc-circuit-layout`, `qc-circuit-wires-are-time`,
  `qc-circuit-observable-engine` (v2).
- **Validation limits:** ≤ 5 qubits, ≤ 24 columns, a whole-number cursor, a run `runCircuit` can actually produce
  (a mid-circuit measurement needs `outcomes`). In a `split` layout with `amplitudes`, `validateLayout` requires
  both halves to read the identical circuit, cursor and outcomes. `observable.pauli` must be one letter (I/X/Y/Z)
  per wire; `observable.at` a whole column 0…(column count).

### `matrix` — shared SVG kind (built for 709)

Two separate views share the kind (`MatrixState = MatrixGridState | MatrixTableauState`, read by `'tableau' in st`):
the grid (a labelled complex matrix) and, since v2 (W-709 #15), a Pauli-string tableau. Both have their own
resolver, validator and readouts in `stage/svg/matrix.ts`; the one `MatrixScene` component branches on
`state.view` ('grid' | 'tableau').

#### Grid view (`MatrixGridState`)
- **State shape summary:** `MatrixSource` — content writes a source only: `{gate}` (a built-in one-qubit gate or
  multi-qubit shorthand, `physics/qc/gates.ts`; with `qubits` it is embedded on `targets`/`controls`,
  `physics/qc/state.ts embed`), `{outer: [ket, ket?]}` (|ψ⟩⟨φ|, φ defaults to ψ), `{rho: {ket} | {mixture}}` (a pure
  state's density matrix or Σ w_k|ψ_k⟩⟨ψ_k|, `physics/qc/density.ts densityOf`/`mixtureN`; mixture weights must sum
  to 1, validated at s = 0, 0.5, 1), `{kron: [source, source]}` (A ⊗ B, `physics/qc/cmat.ts kronM`), `{coef: ket}`
  (a two-qubit state's 2×2 coefficient matrix, `physics/qc/state.ts coefMatrix`), `{pauli}` (v2: a Pauli STRING of
  1–3 letters, I/X/Y/Z, q0 first — `physics/qc/gates.ts pauliString`; a single letter is the raw 2×2 matrix, as in
  v1). v2 adds `{product: [source, …]}` (the ordinary matrix product, left to right, `physics/linalg.ts matmul`),
  `{adjoint: source}` (A†, `dagger`), and `{lin: [{c, src}, …]}` (Σ c_k·A_k; each `c` is a `MatrixCoef` — one of the
  FIXED exact tokens `MATRIX_COEF_EXACT` (±1, ±½, ±i, ±1/√2) or `{trig: 'cos'|'sin', angleDeg}` for cos/sin of a
  named angle, never a literal decimal). Kets reuse `amplitudes`' own `AmpSource` vocabulary (`ket`, `bell`, a 448
  `dir`, or a circuit's state at `upTo`) via its `sourceAt` helper, so a bell/dir/circuit ket means exactly what it
  means on that kind.
- **Display:** `labels: 'kets' | 'indices' | 'none'` (row = bra ⟨i|, column = ket |j⟩; with `basis` set, 'kets'/
  'indices' both show the basis's own ket names instead); `values: 'none' | 'exact' | 'decimal'` (exact comes from
  a fixed table of known values — 0, ±½, ±1/√2, ±1 and their i‑multiples — falling back to a decimal when a cell
  isn't in the table; per-cell numbers draw only up to a 4×4 grid); `blocks: 2 | 4` (gridlines dividing the matrix
  into an equal block arrangement); `highlight` (individual cells), `highlightRow`/`highlightCol` (a whole row/
  column outline); `trace: true` (the diagonal sum, read out as "Tr = …"); `partialTrace: 'A' | 'B' | {keep:
  number[]}` (`physics/qc/density.ts partialTrace`: 'A' traces out the register's first half, keeping B; 'B'
  traces out the second half, keeping A — the common Tr_B case; v2's `{keep}` keeps exactly the listed qubits,
  tracing out every other one — the engine already takes any qubit set, e.g. Tr₃ of a GHZ state. Draws arrows from
  every contributing diagonal cell of the big matrix to the reduced matrix beside it: exact for any `keep` subset,
  via the same `subsetOffsets` index math `partialTrace` itself uses — v1 drew a schematic set for the 'A' case
  specifically because its contributing cells are a strided set, not a contiguous block; v2 computes that set
  exactly, so 'A' and 'B' are both exact now); `svd: true` (Schmidt-weight bars beside a `coef` matrix,
  `physics/qc/cmat.ts svd`). v2 additions: `basis?: 'bell' | AmpSource[]` (views the operator in another basis,
  B†AB — 'bell' is the standard Bell basis, a side of 4 only; a custom basis is a list of kets matching the
  matrix's side, read off in order; applied before `ptranspose`/`trace`/`partialTrace`/`svd`, which then read the
  new grid); `spectrum?: 'bars' | 'entropy'` (eigenvalue bars, `physics/qc/cmat.ts eigh`, UNCLAMPED — a negative
  eigenvalue, e.g. after `ptranspose` for the Peres test, is flagged below the zero line, never hidden; 'entropy'
  adds the von Neumann S, `physics/qc/density.ts vonNeumann`, and an S readout; only valid on a Hermitian matrix,
  checked by resolving it); `ptranspose?: 'B'` (ρ^{T_B} on the register's second half, `physics/qc/density.ts
  ptranspose`, with the moved cells — where the row and column disagree on the transposed qubits' bits — outlined
  dashed). A cell's fill size is |entry| and its hue is the entry's phase, on the same wheel as `amplitudes`/
  `complex-plane` (`stage/phaseHue.ts`); a beat-to-beat transition of the same side lerps every entry (the final
  grid, after `basis`/`ptranspose`) and recomputes the trace, reduced matrix, Schmidt weights and spectrum from the
  lerped grid (the same rule as `circuit`/`amplitudes`; `ptranspose`'s moved cells and `basis`'s labels depend only
  on structure, so they carry over unchanged); a different side crossfades. The spectrum is recomputed only while
  the lerped grid is Hermitian (`eigh` throws otherwise): a blend with a non-Hermitian end (a gate such as S) snaps the
  spectrum panel with the nearer end — that end's own eigenvalues, or no panel — never a number from the blend.
- **Passport:** "MATRIX · ⟨i|A|j⟩"; note "not a place · a table of numbers"; axes "row i", "column j"; **legend:
  phase**.
- **Fidelity keys:** `qc-matrix-entries`, `qc-matrix-trace-engine`, `qc-matrix-hue-is-phase`,
  `qc-matrix-reduced-arrows`, `qc-matrix-not-a-space`, and v2's `qc-matrix-basis-change`, `qc-matrix-spectrum-engine`,
  `qc-matrix-spectrum-negative`, `qc-matrix-ptranspose-not-physical`.
- **Validation limits:** a side of 2–8 (1–3 qubits, `stage/svg/matrix.ts MATRIX_LIMITS.maxN`); a `gate`'s `qubits`
  is 1–3; a `pauli` string is 1–3 letters; `product`/`lin` entries must all resolve to the same side; `coef` needs
  exactly a two-qubit ket; `partialTrace` needs a side of 4 or more for 'A'/'B', or (for `{keep}`) a non-empty,
  duplicate-free, proper subset of the qubits; `svd` only beside a `coef` source; `basis: 'bell'` needs a side of
  4; a custom `basis` must match the matrix's side and every ket's dimension; `spectrum` is rejected (with the
  engine's own reason) when the final grid is not Hermitian; `ptranspose` needs at least two qubits;
  `highlight`/`highlightRow`/`highlightCol` and `blocks` are bounds-checked against the matrix's own side.

#### Pair view (v3, W-448 L9-A; rulings `448-L8L11.md` L9 R1, which rejected a separate `pair-grid` kind)
Two systems as a table of boxes, one per pair of labels (Susskind's table of the pair's basis). It is still a grid state of
the one `matrix` kind: it is selected by a `table` source, or by a `coef` source that asks for `labels: 'ud'`, `cells`,
`factors` or `readouts` (`isPairState`, `content/stage.ts`); every earlier state resolves unchanged.
- **Sources:** `coef` takes `PairSource` = any `amplitudes` source, or `{pair: [Dir, Dir]}` (Alice's 448 direction ⊗ Bob's, each
  may sweep), `{family: 'ud-du', tDeg}` (cos t|ud⟩ − sin t|du⟩, `physics/qc/state.ts udFamily`; 45° is the singlet),
  `{named: 'uniform' | 'flip'}` (`namedPair`). `{table: PairTable}`: `{frame: 'spins' | 'photon-die'}` (the labelled boxes of
  H_A ⊗ H_B, 2 × 2 or 2 × 6, labels only) or `{classical: 'dealer'}` / `{classical: 'independent', pA, pB}` (the joint CHANCES
  of two ±1 coins, `physics/qc/info.ts classicalPair`).
- **Fields:** `labels: 'ud'` (|u⟩, |d⟩ for Alice's rows and Bob's columns; a table has its own labels; `'none'` hides them),
  `cells: 'amplitudes' | 'chances' | 'labels'` (size |ψ_ab| with hue = phase, size from the Born chance with no hue, or empty
  boxes naming their ket), `factors: true` (only beside `{pair}`: α_u, α_d down the left and β_u, β_d across the top, so a
  product's grid reads as a column times a row), `readouts` (`dims`, `norm`, `params`, `marginals`, `means`, `det`, `product`;
  each computed at resolve time by the engine: `pairDet`, `isProduct`, `measure.marginal`, `info.ts`). `highlight` is the usual
  [row, col] list.
- **Scene:** `PairScene` in `stage/svg/MatrixScene.tsx` (print and bare mode print the readouts as text lines). A non-square
  table (2 × 6) sets `ResolvedMatrixGrid.cols`; a transition blends the boxes and the two factors and snaps every statistic with
  the nearer endpoint, so no readout is ever computed from a half-way blend.
- **Passports:** `matrixPair` ("STATE SPACE · two spins", phase legend), `matrixPairChances` ("CHANCES · two spins"),
  `matrixLabels` ("BASIS LABELS · H_A ⊗ H_B"), `matrixChances` ("CHANCES · two coins"); titles and readout lines are kept
  short because the overlay's readout column (about 220 px) sits beside the passport on a 530 px stage. Fidelity keys `matrix-pair`, `matrix-chances`
  (`content/fidelity.svg.ts`, ids `qc-pair-*`, `qc-chances-*`). Anchors added: `factor-a`, `factor-b`.
- **Validation:** none of `trace`, `partialTrace`, `svd`, `basis`, `spectrum`, `ptranspose`, `blocks` (it is not an operator);
  a frame table is `cells: 'labels'`, a classical table `'chances'`; `factors` only beside `{pair}`; `det`/`product`/`params` need a
  `coef` source, `means` a classical table, `norm`/`marginals` not a frame; the independent coins' chances must stay in 0…1 along
  a sweep; highlights stay inside the table.
- **Widget:** W4 `pair-grid` (`widgets/PairGrid.tsx`, lazy) builds one of these states from its controls and draws it with the
  same resolver and scene; its Go-deeper factoring test (determinant and verdict) is a checkbox, off unless the learner opts in.

#### Tableau view (`MatrixTableauState`, v2, W-709 #15)
- **State shape summary:** `tableau: string[]` — Pauli strings (I/X/Y/Z, q0 first), one row per string, all the
  same length (1–3 qubits); `product?: true` (an extra row: the sequential product of every row, left to right,
  `physics/qc/gates.ts pauliMul`, with its phase); `values?: Record<string, 1 | -1>` (a "card" of assigned ±1
  outcomes keyed by the exact row string — e.g. Mermin's four instruction settings XXX/XYY/YXY/YYX); `state?:
  AmpSource` (a ket whose actual eigenvalue per row, `physics/qc/gates.ts pauliEigenvalue`, is shown and checked
  against `values`' card for that row — "the card matches"). A letter's colour is a FIXED per-letter code (I
  neutral, X/Y/Z their own hue 120° apart), not the continuous phase wheel the grid view uses.
- **Passport:** the dedicated variant "PAULI TABLE" (`PASSPORT_VARIANT.matrixTableau`); note "not a place · a
  table of operators"; axes "row", "qubit"; no phase legend.
- **Fidelity keys:** `qc-matrix-tableau-engine`, `qc-matrix-tableau-letters` (both shared with the grid's drawer,
  `fidelityKey: 'matrix'`).
- **Validation limits:** at least one row, all equal length 1–3, letters I/X/Y/Z only; every `values` key must be
  one of the tableau's own rows; `state`'s qubit count must match the tableau's. A tableau-to-tableau transition
  is a hard switch (the cards and eigenvalues are discrete, with no meaningful midpoint), as is a transition
  between the two views.

### `two-qubit` — shared SVG kind (built for 709)

- **State shape summary:** `TwoQubitState` (`TwoQubitSource`) — two reduced Bloch balls A, B and an optional 3×3
  ⟨σᵢ⊗σⱼ⟩ correlation grid. Content writes a source only: `{ket}` (any two-qubit ket `amplitudes` accepts, reused via
  its own `AmpSource`/`sourceAt`: `ket`, `bell`, a circuit's state at `upTo`), `{family: 'cos-sin', thetaDeg}` (cos
  θ|00⟩ + sin θ|11⟩, sweepable: a product state at θ = 0° opening into the maximally entangled state at θ = 45°),
  `{rho: {ket} | {mixture}}` (the `matrix` kind's own ρ sources, `physics/qc/density.ts densityOf`/`mixtureN`),
  `{reduce: {ket, keep}}` (a THREE-qubit ket with one qubit traced out, keeping the two named `keep`; the kept
  qubits' arrows and grid are read straight off the original ket via `reducedBloch`/`expectationN`, exactly, even
  though the pair's own state is generally mixed). `local` (one-qubit gates with no angle — I, X, Y, Z, H, S, Sdg, T,
  Tdg — applied to A or B before anything else is read off); `condition` (A's or B's own arrow becomes the
  ±`basis` eigenstate of `outcome`, and the OTHER ball's arrow becomes its exact post-measurement reduced state,
  `physics/qc/measure.ts measureInBasis` + `reducedBloch`; only on a `ket` source); `arrows: 'reduced' | 'none'`
  (default `'reduced'`: r_A, r_B, `physics/qc/density.ts reducedBloch` — an arrow shorter than 1 reads visibly as
  mixed); `grid: 'none' | 'T' | 'T-minus-rr'` (default `'none'`: T = ⟨σᵢ⊗σⱼ⟩, or the connected correlation T −
  r_A r_Bᵀ); `highlight` (individually outlined cells, e.g. `['xx', 'zz']`, the Bell state's stabilizers); `axes`
  (≤ 2 measurement directions drawn on each ball, CHSH settings); `readouts` (`'purity' | 'rLength' | 'entropy'`;
  `'concurrence'`: Wootters' C of the pair, `physics/qc/entangle.ts concurrence`/`concurrencePure`; `'chsh'`: the
  ceiling `max S = 2√(t₁ + t₂)` over all settings, `chshMaxHorodecki` — 2 for a product state, 2√2 for a Bell state —
  and, when both balls carry exactly two `axes`, the score `S` at those settings, `chshFromAxes`; neither is
  computed unless asked for); `labels: 'A-B' | 'q1-q2'`.
- **Display:** a cell's fill size is |T_ij| and its colour is SIGNED — amber (`fg-plus`) for a positive correlation,
  cobalt (`fg-minus`) for a negative one, the `amplitudes` kind's own convention for a real quantity, never the
  phase wheel (there is no `legend` on this passport). A beat-to-beat transition of the SAME `family: 'cos-sin'`
  source lerps θ and rebuilds everything at the new angle (as `amplitudes` turns a swept direction); any other
  change (a different source, or the same shape with a different mixture weight) lerps the derived numbers
  directly (as `matrix` lerps its cells) or hard crossfades when the identity key itself differs.
- **Passport:** "STATE · two qubits"; note "not a place · arrows are local averages · cells are correlations"; axes
  ⟨σx⟩, ⟨σy⟩, ⟨σz⟩.
- **Fidelity keys:** `qc-tq-engine`, `qc-tq-entangle-engine`, `qc-tq-grid-signed`, `qc-tq-chsh-ceiling` (max S is a
  ceiling, the drawn settings may score less), `qc-tq-local-arrows` (a short arrow is a mixed part, not a
  weaker spin), `qc-tq-not-two-places`.
- **Validation limits:** a `ket`/`rho.ket`/`rho.mixture[].ket` source must resolve to exactly two qubits; `reduce`
  needs a three-qubit ket and two distinct kept qubits 0–2; `condition` only on a `ket` source, and only at an
  outcome with non-zero probability; `axes.a`/`axes.b` ≤ 2 directions each; `local` gates are the param-less
  one-qubit set only (no `params` field to carry an angle); `readouts` names must be one of the five above.

### `plot` — shared SVG kind (built for 709; E2)

- **State shape summary:** `PlotState` — a labelled 2-D curve for a derivation that sweeps a parameter (first used
  by Q10's CHSH phase dial). Content writes `curve: { fn, x?, samples? }` only, never a point: `fn` is a NAMED
  engine curve (`PlotCurveName`; `stage/svg/plot.ts` owns the registry mapping each name to a function built on
  `physics/qc/entangle.ts` — `chshVsPhase` samples `chshCurve` at Bergou §3.2's phase-dial settings, a = X, Y;
  b = X, Y, the closed form 2cos δ + 2sin δ; `chshClassicalBound` samples `lhvChsh().maxS`, the local-hidden-variable
  ceiling, so even the "flat line at 2" is an engine value, never a typed literal); `x?: {from, to}` the swept
  range (default the named curve's own); `samples?` the point count (default 64). `markers?: {x, label?}[]` (≤ 8;
  y computed from x by the same curve, never authored); `bands?: {yFrom, yTo, label?}[]` (≤ 4; a shaded y-region,
  e.g. the classical |S| ≤ 2 band); `yLines?: {y, label?}[]` (≤ 4; horizontal reference lines, e.g. 2, 2√2, 4).
- **Display:** the curve is a polyline through the sampled points; markers are small circles on it; bands are
  translucent silver rectangles; yLines are dashed silver lines, each with its label at the right edge. No phase
  wheel (a real-valued curve, not a complex one): both the curve and its markers draw in the state ink. A
  beat-to-beat transition lerps the range, and the markers/bands/yLines by position, when both sides draw the SAME
  curve at the same sample count (recomputing the curve at the lerped range from the engine, never interpolating
  y-values directly); a different curve or sample count hard-switches (as a different Euler rate does on
  `complex-plane`).
- **Passport:** "CURVE · engine-sampled"; note "not a place · the curve and its markers are computed, not drawn";
  axes "x", "y" (generic: the same passport serves every named curve, so curve-specific axis units stay in the
  beat's own prose/caption, not in the frozen passport).
- **Fidelity keys:** `qc-plot-engine-curve` (exact), `qc-plot-sampled` (schematic), `qc-plot-not-a-measurement`
  (misleading).
- **Validation limits:** `fn` must be a registered curve name (the validator rejects an unknown one, so a beat
  cannot ship a curve whose engine function has not landed); `x.from < x.to`; `samples` a whole number 2–256;
  every marker's `x` must fall inside the drawn range; ≤ 8 markers, ≤ 4 bands, ≤ 4 yLines.

## Passport and fidelity are course-aware, not kind-aware

`passportOf(state, course = 'sl448')` and `fidelityOf(key, course = 'sl448')` both take a course: 448's own six
labels and drawers never change, and a second course's fidelity registers through the lazy course pack
(`registerCourseFidelity`), never edits 448's `content/fidelity.ts` directly. The SVG kinds' drawers are the exception
by design: they are shared (`registerSharedFidelity`, from `content/fidelity.svg.ts`, loaded with the kinds' chunk), so
`fidelityOf` reads the course's own `kinds`, then the shared notes, else nothing. A kind a 448 lecture adds later puts its
notes in `content/fidelity.svg.ts`. What stays in the 709 pack is only 709's own: the `plane-photon` variant of a WebGL
kind and the `additions` it makes to a WebGL kind's drawer.
