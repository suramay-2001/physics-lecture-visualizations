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
| `code` | svg | shared (built for 709 Q21/Q22 and the Papers chapters) |

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

### `bb84` — shared SVG kind (built for 448 Lecture 8)

- **State shape summary:** `Bb84State` — the protocol ledger of Lecture 8, one row per photon. `rounds` is
  `{ board: 'notes-p8' }` (the eight-photon example worked on the board in the notes, `BOARD_P8`, no Eve) or
  `{ seed, count }` (the first `count` rounds, a whole number 1–4000 that may sweep, of the seeded run `bb84Rounds`). `eve?` is
  `'off'` (default), `'all'` (the notes' intercept–resend on every photon) or `{ fraction }` (a sweepable 0–1).
  `show?` picks the columns (`'alice' | 'eve' | 'bob'`; default Alice and Bob, Eve's with an eavesdropper). `sift?` keeps the
  matched-basis rounds (a check, the rest dim); `test?` is the public sample taken from the kept rounds — `{ rounds: number[] }`,
  `{ size: m }` (the first m kept rounds) or `{ fraction }` (seeded) — whose rows are marked and leave the key; `highlight?` outlines
  round numbers; `readouts?` picks `'kept'`, `'qber'` (Q̂ ± 1σ against the exact Q from `bb84Q`) and `'eve-knows'`.
- **Engine:** every bit, basis, outcome and tally is `physics/bb84.ts` (Born chances of the `physics/polarization.ts` kets, drawn
  from `physics/random.ts` `rng`, seven uniform numbers a round, ALWAYS seven, so Alice's and Bob's choices never depend on Eve and a
  longer run only appends rounds). The `bb84-bench` widget and the `catch-eve` Arcade game call the same functions, and the widget
  draws the kind's own scene, so a Try-it and a story cannot disagree.
- **Display:** a table of the last 12 rounds (the tallies cover them all): `#` · Alice (basis chip H/V or D/A, her bit, the state as a
  short line at its polarization angle) · Eve (her basis, her reading, the state she resent; a dash if she let the photon through) ·
  Bob (basis chip, his bit) · the mark column (a check for a kept round, a boxed cross for a kept error, a dashed "T" box for a tested
  round). With `qber` a gauge from 0 to ½: the exact Q as a dashed tick, Q̂ as a dot with its ±1σ band. Amber and cobalt are not used
  (a bit is a code, not a ± outcome). One scene component draws the stage, the reading version, the print figure (320 × 340) and the
  bench.
- **Transitions:** the same seed lerps `count` and Eve's fraction (rows are recomputed, a longer run only appends); anything else
  (the board, another seed, `sift`, `test`) switches at the half-way point.
- **Passport:** "PROTOCOL LEDGER · BB84"; note "not a place · each row is one photon; outcomes drawn from the Born rule (seeded)";
  axes Alice, Eve, Bob. Anchors `row, alice, eve, bob, sift, test, qber, tally`. Shot `K-LEDGER`.
- **Fidelity keys:** `bb84-born-engine`, `bb84-tally-engine` (exact), `bb84-last-rows`, `bb84-ideal-channel` (schematic),
  `bb84-scatter`, `bb84-q-this-attack` (misleading) — in `content/fidelity.svg.ts`, with 448's own (unprefixed) ids.
- **Validation limits:** `count` 1–4000 (whole when not a sweep); `seed` a whole number below 2³²; `eve.fraction` 0–1; `board` has no
  Eve; `show` a non-empty list without repeats and Eve's column only with an eavesdropper; `eve-knows` only with an eavesdropper;
  `kept` and `qber` need Bob's column; `test` needs `sift`, its named rounds must be kept rounds and `size` at most the kept rounds;
  `highlight` must name drawn rows.

`plot` also gained `yScale: 'log'` and the curve `bb84Miss` (the chance (¾)^m that a test of m sifted bits shows no error; default
range 0–40): a log axis is labelled by decades, needs every curve value, line and band positive, and the readout column prints
tiny values as "3.2 × 10⁻¹³".

### Additions for 448 Lecture 10 (interface change W-448 L10-A; no new kind)

- **`two-qubit` `family: 'cos-sin'` takes `pair: '00+11' | '01-10'`.** `'01-10'` is cos t|ud⟩ − sin t|du⟩: |ud⟩ at t = 0, the singlet at
  45°, both arrows of length cos 2t (so the "empty centre" is reached at 45° while the grid fills in to −1 on its diagonal). It sweeps
  like the default family and has its own interpolation key (the two families never blend). A zero-length arrow is drawn as a dot at the
  centre of its ball (fidelity `tq-centre-dot`).
- **`AmpSource` gains `{terms: string}`**, the engine's `superpose('000-011-101-110')`: an equal-weight signed sum of distinct basis
  strings of one length (≤ 5 qubits on the stage), valid wherever an `AmpSource` is (amplitudes, a tableau's `state`, a matrix's `coef`,
  a two-qubit `ket`).
- **`matrix` tableau gains `targets` and `players`.** `targets: {row: ±1}` adds a "needs" column; with a card (`values`) each row gets
  a ✓ or ✗ (the card's product meets the need), with a `state` it gets a ✓ when the state's own eigenvalue does, and the header line reads
  "wins k of n" (fidelity `tableau-verdict-engine`). `players: [...]` names the columns (one plain name per qubit). The tableau is drawn
  as large centred columns (letters, product, "the state gives", needs, verdict) in the live stage and the reading version, and in print
  when `players` is set; without it print keeps the compact text badges. A tableau with `players` keeps its readouts short ("wins 3 of
  4", "every row matches") so they clear the passport.
- **Layout fixes** found by the visual QA of that lecture: `two-qubit` stacks the grid under the balls on a tall narrow stage (side by
  side ran the third grid column off a 528 px stage) and centres the pair; the `amplitudes` chances axis keeps a wider left margin so
  its "100%" label is not clipped.

### `clocks` — shared SVG kind (built for 448 Lecture 11)

- **State shape summary:** `ClocksState` — the two phase clocks of a two-level system. `levels` is `{ upper, lower }`, the two
  energies in units of ε (0 ≤ lower < upper ≤ 12, a gap of at least ¼; Ē and ħω are derived, never authored). `start?` is a 448
  `Dir` (default `'+x'`): its |+z⟩ and |−z⟩ amplitudes set the hand lengths and starting angles. `timeDeg` is the elapsed time as
  εt/ħ in degrees (may sweep, at most ±3600). `show?` picks the panels: `'levels'` (the energy ladder: E₊, E₋, Ē dashed, a ħω
  arrow), `'clocks'` (one dial per level), `'gap'` (the angle between the hands as a dial) and `'top'` (the equator seen from +z);
  default all four. `readouts?` picks `'phases'`, `'gap'` and `'px'` (P(+x; t)).
- **Engine:** every angle, length, gap and chance is `physics/dynamics.ts` (`clockHands`: the unwrapped phase arg(start) − E t of
  each component, its length, and the gap φ₀ + (E₊ − E₋)t wrapped to [0°, 360°); `precession`: P(+x; t), ⟨S_x⟩ and the Bloch vector of
  the evolved ket, whose x–y part is the arrow on the equator). The `two-clocks` widget calls the same resolver and draws the same
  scene, so a Try-it and a story cannot disagree. The numpy twins are `pipeline/make_fixtures.py` `lecture11_cases` (the evolved
  ket's `np.angle`, not the closed form).
- **Display:** the ladder (levels to scale from the zero of energy, Ē dashed, a ħω double arrow) and the two dials, one per level:
  each hand is the amplitude's phase (its length |a|, its hue the hand's own phase on the 709 hue wheel, a dashed ghost where it
  started, an arc for the angle it has turned through); the gap dial shows the lower hand's angle seen from the upper one; the
  equator panel shows +x to the right and +y up with the arrow at the azimuth. The panels pack by the box's shape (two rows when
  portrait, columns when wide). One scene component draws the stage, the reading version, the print figure (320 × 380) and the widget.
- **Transitions:** the levels, the time and the start state lerp (a hand that turns 540° turns 540°: the drawn angle is not wrapped);
  `show` and `readouts` switch at the half-way point; every output is recomputed from the interpolated inputs.
- **Passport:** "PHASE CLOCKS · two energy levels", with the phase-hue legend; note "schematic layout · hand angles, hand lengths and
  the gap are exact"; axes energy, phase. Anchors `level-upper, level-lower, mean, gap-arrow, clock-upper, clock-lower, gap-dial,
  top-arrow`. Shot `K-STD`.
- **Fidelity keys:** `clocks-hands-exact`, `clocks-gap-azimuth` (exact), `clocks-ladder-zero`, `clocks-dial-not-space` (schematic),
  `clocks-both-turn`, `clocks-hue-code` (misleading) — in `content/fidelity.svg.ts`, with 448's own (unprefixed) ids.
- **Validation limits:** finite levels with 0 ≤ lower, upper ≤ 12, upper − lower ≥ ¼; `timeDeg` finite and within ±3600°; `start` a
  named ket or angles with θ in 0°–180°; `show` a non-empty list without repeats; `readouts` known names, each once. A start at a pole
  has one hand and no gap (the gap dial says "one clock only", the equator panel "a pole: no azimuth").

### `grover-plane` — shared SVG kind (built for 709 Chapter Q17)

- **State shape summary:** `GroverPlaneState` — the real plane Grover's search lives in: |x₀⊥⟩ (the unmarked strings, evenly) across and
  |x₀⟩ (the marked strings, evenly) up. `search: { n, marked? }` is the register (n qubits, 1 ≤ n ≤ 10, so N = 2ⁿ) and how many strings the
  oracle marks (M, 1 ≤ M < N, default 1); α = arcsin √(M/N) is derived, never authored. `k` is the number of Grover steps (a whole number
  0–64 at its ends; a sweep turns the arrow continuously by 2α per step). `half?: 'oracle'` adds the marking image of the arrow as a dashed
  ghost. `mirrors?` is `'x0perp'` (the horizontal axis, the marking oracle) and/or `'w0'` (the line through |w₀⟩ at α, the diffusion).
  `trail?` draws the earlier arrows (k ≤ 24). `arcs?` is `'alpha'` (|x₀⊥⟩ to |w₀⟩) and/or `'step'` (the last step, 2α; needs k ≥ 1).
  `proof?: 'v1' | 'v2'` is Theorem 1's picture proof (needs k = 0 and no `half`). `readouts?` picks `'angle'` ((2k+1)α), `'success'`
  (its sine squared) and `'kopt'` (k* and its chance, drawn as a ring on the circle).
- **Engine:** every angle and chance is `physics/qc/grover.ts` (`groverAngle`, `groverPlane`, `groverSuccess`, `groverOptimalK`). At a whole k the
  arrow IS `groverPlane`; `grover.test.ts` pins it to a full simulation of the circuit (`groverCircuit` through `runCircuit`, n ≤ 5, k ≤ 6),
  and the numpy twin (`pipeline/make_grover_fixtures.py`) multiplies the 2ⁿ × 2ⁿ matrices out.
- **Display:** the unit circle, the two axes (|x₀⊥⟩ "the rest", |x₀⟩ "marked"), the state arrow (white) with its vertical shadow (a dashed line
  to the vertical axis and a thick bar on it, labelled with its height), the mirrors and the ghost in orchid, arcs and the proof's images
  labelled with their angles. One scene component draws the stage, the reading version and the print figure (320 × 300). The live stage
  keeps the passport and the readout column clear; a split pane keeps a title strip.
- **Layout:** `validateLayout` cross-checks a `circuit` or an `amplitudes` view that reads Grover's circuit beside the plane: the same
  number of wires, the marking column marks M strings, and the cursor is at column 1 + 4k (2 + 4k with `half: 'oracle'`).
- **Transitions:** the same search lerps k; a different search, and every list and flag, switch at the half-way point; every output is
  recomputed from the interpolated inputs.
- **Passport:** "THE GROVER PLANE · a real 2-D slice of ℂᴺ"; note "not a place · angles are state angles, not doubled; only this plane is
  drawn". Anchors `marked-axis, rest-axis, arrow, shadow, circle, mirror-x0perp, mirror-w0, arc-alpha, arc-step, trail, ghost, proof`. Shot `G-PLANE`.
- **Fidelity keys:** `qc-gp-engine`, `qc-gp-slice`, `qc-gp-shadow` (exact), `qc-gp-not-bloch` (schematic), `qc-gp-real` (misleading) — in
  `content/fidelity.svg.ts`, with 709's `qc-` ids.
- **Validation limits:** n whole in 1…10; marked whole with 1 ≤ M < N; k whole 0…64 at its ends; `half` only `'oracle'`; lists of known
  names, each once; a trail only up to k = 24; `proof` needs k = 0 and no `half`.

### `bits` — shared SVG kind (built for 709 Chapter F7)

- **State shape summary:** `BitsState` — classical bits, no amplitudes. A state draws exactly ONE of three pictures (a layout never repeats a kind,
  so one `bits` state holds one picture). `fn: { source, view, versus?, mark? }`: a `source` is a named gate (`NOT AND OR XOR NAND CNOT SWAP
  Toffoli Fredkin`) or an authored `{ table, n, m }` (2ⁿ rows of m-bit outputs as numbers, n and m each 1…3); `view` is `'table'` (every input
  with its output, filled cell = 1) or `'map'` (inputs at the left, outputs at the right, one arrow per input; an output several arrows reach
  is outlined, counted "×3" and its arrows drawn in the operation colour); `versus` draws a second source beside the first in the same view;
  `mark` outlines inputs (strings of the first source's width) and their arrows. `rows: { strings, combine?, against?, names? }`: one to four
  rows of equal width (1…8 bits); `combine: 'xor'` adds a computed last row (the places where the two rows differ) and `'dot'` the AND row
  whose parity is a·b (both need exactly two rows); `against` is a word as wide as the rows, whose dot product with each row is written at the
  row's end (the syndrome of a check matrix) and which is drawn as a last row; `names` relabels the rows. `reduce: { strings, upTo }`:
  Gauss–Jordan elimination over GF(2) after `upTo` moves (a row swap or a row XOR, in the order `gf2RowReduceSteps` makes them; whole at its
  ends, may sweep); the moved rows are outlined, and once it is done the pivots are ringed and the readouts give the rank and the whole null space.
- **Engine:** every output is `physics/qc/bits.ts` (`gateTable`, `checkTable`, `preimageCount`, `maxPreimages`, `isBijection`, `isConstant` /
  `isBalanced`, `dotMod2`, `syndromeOf`, `gf2RowReduceSteps`, `gf2Nullspace`, `gf2Span`); the numpy twin is `pipeline/make_bits_fixtures.py`
  (Python lambdas for the gates, integer-bitmask elimination, every null space found by trying all vectors).
- **Display:** a truth table is cells (white and dark-lettered for 1, outlined for 0) under "in" and "out" headers with the gate's name above; a
  map is two columns of string boxes with arrows between; rows and a reduction are grids with a label column. One scene component draws the
  stage, the reading version, the print figure (320 × 300) and the `bit-table` widget. The live stage keeps the passport (112 px) and the
  caption (92 px) clear; a split pane keeps a title strip.
- **Readouts** (short, so they never run under the passport): a table: "4 rows", "1s: k of 2ⁿ" and constant / balanced / "not constant or
  balanced" (one output bit only); a map: "3 inputs → one output" or "reversible" (each prefixed with the gate's name when two sources are drawn);
  rows: "a ⊕ b = 1101" and "differ in 3 places", the AND row and "a·b = 1", the weights, or "checks read 110" and "110 is 6 in binary"; a
  reduction: "move k of K", the move in words, and once done "rank r" and "null space: …".
- **Transitions:** the same matrix reduced to another number of moves slides through the snapshots; every other change is a different picture
  and switches at the half-way point.
- **Passport:** "BITS · 0 and 1 only"; note "not a place · filled = 1, empty = 0". Anchors
  `inputs, outputs, row, merge, computed, checks, pivots`. Shot `B-BITS`.
- **Fidelity keys:** `qc-bits-engine`, `qc-bits-arrows` (exact), `qc-bits-cells`, `qc-bits-moves` (schematic), `qc-bits-classical` (misleading) — in
  `content/fidelity.svg.ts`, with 709's `qc-` ids.
- **Validation limits:** exactly one of `fn`, `rows`, `reduce`; tables n and m in 1…3; rows 1…4 of 1…8 bits, equal widths; `combine` needs two
  rows and excludes `against`; names 1…6 characters, one per row; `upTo` whole at rest and inside 0 … the number of moves.

### `code` — shared SVG kind (built for 709 Chapters Q21/Q22 and the Papers chapters; rulings `decisions/qc709-Q21Q22.md` R4)

- **State shape summary:** `CodeState` — one error-correcting code, drawn from `physics/qec`. `code` is a REGISTRY id (`physics/qec/registry.ts`; never coordinates): `rep3`, `rep3x`
  (the bit- and phase-flip repetition codes), `shor9`, `steane7`, `five5`, `surface3`, `surface5` (the rotated surface code, d = 3 and 5) and the bivariate bicycle codes `gross`
  ([[144, 12]]) and `two-gross` ([[288, 12]]). `view` is `'layout'` (default), `'checks'` or `'words'`. On the layout: `error` is a Pauli error, one letter per qubit ("IXIIIII") or
  just the hit qubits counted from 1 ("X2", "X1Z4"); `show` lists what to draw over it: `'syndrome'` (the checks that read −1 light up; read out in words), `'correction'` (the lookup
  decoder's Pauli, or the authored `correction`, which must have the error's syndrome, as outlined letters and a dashed ring), `'residual'` (error × correction, named by the engine:
  the identity, a product of checks, logical X / Z / Y) and `'logical'` (a minimum-weight logical operator's support); syndrome, correction and residual need an `error`, residual
  needs correction. The bicycle codes also take `focus` (one or two checks, by index into the list of checks, X first, or by name "X12" / "Z5" = the cell's index) and `shift`
  (`[a, b]`, the shift automorphism x^a y^b). `'checks'`: `errors` lists up to 8 Pauli errors beside the generator table. `'words'`: `word` is `0`, `1` or `'plus'`.
- **Engine:** every picture is `physics/qec`: `registry.ts` builds the `StabilizerCode` (X checks first, then Z checks) and the drawing positions (the small codes' are a drawing
  choice: a row, a 3 × 3 grid with groups as rows, the corner / edge / centre points of a triangle, a pentagon; the surface code's and the bicycle codes' are the engine's own),
  `stabilizer.ts` the syndromes, membership and logical operators, `codes.ts` the lookup decoder, the exact distances and the surface layout, `bb.ts` the Tanner graph with its
  local / long-range edges and the shift automorphisms, `codewords.ts` the dense |0̄⟩, |1̄⟩, |+̄⟩ (n ≤ 12). The numpy twin is `pipeline/qec_numpy.py`; the tests check every drawn
  syndrome against the fixture's, against `CSSCode.syndrome` and against the Tanner rows.
- **Display:** discs are data qubits (numbered from 1; the hit ones carry the error letter), squares are checks in the hues of the X and Z letters (the matrix tableau's), a check
  with several letters is silver, and an edge joins a check to every qubit it acts on, in the colour of its letter. A lit check has a cobalt ring and "label −1". The surface code gets
  shaded plaquettes (half-discs on the boundary), Steane three shaded faces. The bicycle tile is 2ℓm + 2ℓm small marks (L qubits filled, R qubits hollow, X and Z squares) inside the
  tile's dashed rectangle, with only the focused check's edges: local ones as lines, long-range (and wrapping) ones as labelled stubs "→ L(6, 1)" with a ring on the target; a shift is
  an arrow on every L qubit and two rings (an example and where it lands). The checks view is a table of coloured letters, then the errors with one cell per check (filled = reads −1).
  The words view is a bar per basis string (length = the amplitude's size; white +, orchid −). One scene component draws the stage, the reading version and the print figure
  (320 × 360); the live stage names the code above the drawing, the figure as its first text line.
- **Readouts** (short, about 21 characters, so they stay clear of the passport): `n = 7 · k = 1 · d = 3` (bicycle codes: `n = 144 · k = 12` and `d = 12 (paper)`), `error: X on 5`,
  `Z1, Z3 read −1` (the figure writes "syndrome: " in front), `pattern: + + + − + −`, `correction: X on 5` (`given:` for an authored one), `residual: logical X`, `logical: X on 1, 2, 3`
  (`logical op, weight 12` for the bicycle codes), `X20: 4 near, 2 long`, `shift x^3 y^-1`, `moves 3 east, 1 south`, `keeps the checks`; the checks view: `8 checks · 1 logical`;
  the words view: `8 terms, each 0.354`.
- **Limits:** the layout draws at most 25 qubits and 24 checks (a bicycle code is a tile: 144 + 144 or 288 + 288 marks, edges only for the focus); the checks and words views draw
  at most 9 qubits, the words view one logical qubit and at most 16 strings (|+̄⟩ of the d = 3 surface code has 32: refused); 1 to 8 `errors`; at most 2 focused checks; shifts
  with |a| ≤ ℓ, |b| ≤ m. The distance: exact for n ≤ 25; the bicycle codes' d is the paper's number, REPORTED, and the operator drawn is the paper's weight-12 / weight-20
  basis operator, an upper bound.
- **Layout:** no cross-kind rule (a split with `circuit` or `amplitudes` need not read the same data).
- **Transitions:** no continuous parameter; every change of picture switches at the half-way point. The resolver memoizes by its inputs.
- **Passport:** "CODE · qubits and checks"; note "not a place · discs are qubits, squares are checks; positions are a drawing choice". Anchors
  `qubit, check, edge, error, syndrome, correction, residual, logical, table, word, stub, shift`. Shot `CD-CODE`.
- **Fidelity keys:** `qc-code-engine`, `qc-code-edges` (exact), `qc-code-layout`, `qc-code-distance` (schematic), `qc-code-lit` (misleading: a lit check is a −1 reading, not a broken qubit).
- **Validation (clear messages):** unknown code id (the registry is listed); an overlay on the wrong view names the field and the view; n over the limit of the view; a Pauli string
  of the wrong length or naming a qubit the code lacks; a correction whose syndrome is not the error's; `focus` / `shift` on a code that is not a bicycle code.
- **Chunk:** `stage/svg/kinds.ts` (lazy); `physics/qec` is imported only from that chunk, never from the entry.

### Additions for the error-correction chapters (stage-code agent; interface-changes rows SC-1 … SC-5; no other new kind)

- **S2 `amplitudes.keep`** also accepts a LIST of wires, counted from 0 at the top as the circuit format counts (`[3, 4]` = the two helper wires under three data wires): the marginal
  over exactly those wires (`physics/qc/measure.ts` `marginal`, the first listed the most significant bit of the bar labels). A list is 1 … n − 1 distinct wires; `keep: [0, 1]` is
  `keep: 2`; the same companions as the count (mode `'probability'` only, not with `dft`, `inBasis`, `sum`, `dials`, labels `'spin'` / `'index'`). `ResolvedAmplitudes.keepWires`
  is carried only for a list. Readout "wires 3, 4 (from 0)"; passport `PASSPORT_VARIANT.ampKeepWires` ("STATE · chances of chosen wires"), drawer `amplitudes` plus `qc-amp-keep-sum`.
  A list, a count and the whole register are different lists: a transition between them switches at the half-way point.
- **S3 `plot` curves** from `physics/qec/rates.ts`: `repFail3`, `repFail5` (a majority vote over 3 / 5 copies of a bit is wrong when each copy flips with chance p: p²(3 − 2p),
  p³(10 − 15p + 6p²); p from 0 to 1), `identityP` (y = p: a lone bit), `qhbNeed1` (the quantum Hamming bound's need 2(1 + 3n), n from 1 to 10, beside `twoToN`; at whole n it is
  `qhbNeed(n, 1, 1)`), `steaneFailX` (the exact logical failure chance of the Steane code against independent X flips under its lookup decoder, counted over all 128 patterns, p from 0
  to 0.2; 0.0020040749 at 0.01, 0.1306432 at 0.1, equal to p at 0.0646). The chance curves' x must lie in [0, 1]; their y axis is never padded past 0 or 1; names "vote of 3",
  "vote of 5", "lone bit", "rooms needed", "Steane"; the p axis prints four decimals.
- **S4 circuit / tableau pictures (no new field)**, found by screenshot (`q0-demo-ec`, `e2e/code-kind.spec.ts`): a gate label wider than its box (`Ry(106°)`) is written on two lines
  (name over angle) instead of running over the wire's ket; the classical condition of the last column hangs left of the gate's edge (inside the figure, clear of the cursor line) and
  reads `c0c1=10` in a narrow column; a meter's bit name sits beside it when the rows are too close for a line between wires (print, five wires); the print figure's circuit starts 12 px
  lower so the cursor's label clears the figure's text lines; the tableau's "the state gives" column shows "—" for a row the state is not an eigenstate of.

### `plot` additions for Chapter F7 (W-709 F7-A)

New named curves `nSquared`, `twoToN`, `sqrtTwoToN` (n², 2ⁿ, 2^(n/2); default range 1…50) and `bigORatio` ((3n² + 5n + 7)/n²; default 1…20), from
`physics/qc/bits.ts`. `curve.vs` draws a second named curve on the same axes (dashed, operation colour); each curve is named at its right end,
markers sit on both curves, the readouts name each value, and a log axis needs both curves above 0. The cost curves carry the x-axis name "n": in
the live stage they keep room for the readout column above and the caption below, label the linear y axis with a rounded number, and start that axis
at 0; a marker label that would run off the right edge goes to the left of its marker, and a label beside the previous marker's goes below it.

### Additions for Chapter F8 (W-709 F8-A; no new kind)

- **`amplitudes.dft: true`** draws the discrete Fourier transform of the state instead of the state: `physics/qc/fourier.ts` `dft` (ĉ_k =
  (1/√N) Σ_j c_j ω^{jk}, ω = e^{2πi/N}, N = 2ⁿ bars, the sign of N&C Eq. 5.1; numpy's `fft` has the opposite sign) applied to ANY source after
  `globalPhaseDeg`. Not with `inBasis`, `sum`, mode `'signed'` or `labels: 'spin'`. The passport reads "LIST · Fourier view" (or "Fourier
  chances" in mode `'probability'`) with its own drawer (`amplitudes-fourier`: `qc-amp-fourier-engine`, `qc-amp-fourier-hue-is-phase`,
  `qc-amp-fourier-not-sound`). The readouts open with "Fourier view" and name the FOUR TALLEST bars (sizes compared to 10⁻⁹, ties to the lower
  place), then "k smaller bars". A list and its transform are different lists: a transition between them switches at the half-way point.
- **`amplitudes.labels: 'index'`** numbers each bar by its place, 0 … 2ⁿ − 1, instead of a ket; the readouts call the entries c_j (ĉ_k in the Fourier
  view) and a chance P(k). Chapter F8's lists are numbers, not registers.
- **`matrix` source `{dft: N}`** is the Fourier matrix (F_N)_{kj} = ω^{jk}/√N (`dftMatrix`), a whole N from 2 to 16 at the source; the grid itself
  draws sides 2, 4 and 8 (a power of two up to 8), usable inside `product` and `adjoint` (F†F is the identity grid).
- **`plot` curve `dirichlet8`**: D₈(δ) = |sin 8πδ| / (8 |sin πδ|), the fraction of its straight length a chain of 8 unit arrows keeps when each is
  δ of a turn further than the last (`dirichlet`); default x from −0.5 to 0.5 (turns, not degrees); the axis is named "δ" and x values print with up
  to four decimals (`ResolvedPlot.xDigits`; other curves print as before); a value below 10⁻¹² is drawn and read as 0.
- **`amplitudes.keep`** (W-709 Q18-B, a whole number from 1 to n − 1; only mode `'probability'`; not with `dft`, `inBasis`, `sum`, `dials` or labels `'spin'` / `'index'`)
  draws only the chances of the FIRST `keep` wires, the others summed over (`physics/qc/measure.ts` `marginal`): 2^keep bars labelled by the kept wires' bits,
  the readout "first k wires", `ResolvedAmplitudes.n` = `keep`. It is how a phase-estimation circuit's counting wires are read without its target wire.
  Passport `PASSPORT_VARIANT.ampKeep` ("STATE · chances of the first wires"), drawer `amplitudes` plus the line `qc-amp-keep-sum`. A reading and the whole register
  are different lists: a transition between them switches at the half-way point. `AMP_LIMITS.dialQubits` is 4 since Q18-B (dials on 16 bars).
- **`plot` curve `peBest3`** (W-709 Q18-A): the chance of phase estimation's best reading on three wires, max_x P(x), for an eigenphase τ (a fraction of a turn)
  from 0 to 1 (`physics/qc/qft.ts` `peBest(τ, 3)`); default x from 0 to 1, the axis named "τ" with up to four decimals, y never padded past 0 or 1; 1 at each
  eighth, 0.4105 midway, never below 4/π²; a beat sets `samples: 256` (the curve has a cusp every 1/16).
- **`complex-plane.clock`** (a whole number N from 2 to 60) draws the face of a clock of N marks: N ticks on the unit circle, 360°/N apart, mark 0 at the
  arrow 1. With N ≤ 12 the marks are numbered 0 … N − 1; on a bigger clock the number of a mark sits at the tip of every `spokes` arrow of size 1 that points
  exactly at it, so "arrows at the marks 1, 2, 4, 8, 16, 11 of 21" read as those numbers. It draws no readout of its own; not with `line`, and `circle` stays on.
  `ResolvedComplexPlane.clock` is carried only when set; a change of N switches at the half-way point. Fidelity note `qc-cplane-clock` (schematic).
- **`complex-plane` widget mode `'roots'`** (not a stage field): `ComplexPlaneQc` draws the N arrows ω^{jk} from the centre AND tip to tail with their
  sum, on a clock face of N numbered marks (`rootsState`), with sliders N (2-12, the kind's 12-arrow cap) and the step j (0-12) and the line "corners used: N/gcd(j, N) of N, each gcd(j, N) times".

### `spacetime` — shared SVG kind (built for the Papers background chapter B1; plan `P-B1-story.md` §9.2 K-ST; interface-changes row SB1-1)

- **State shape summary:** `SpacetimeState` — the detector history of the repetition code under noise. `history: {code: 'rep', n, rounds, faults?, sample?}` (`n` 3-9 data qubits, `rounds`
  1-6 noisy rounds and one ideal round after them; `faults`: at most 12 of `{kind: 'data' | 'meas', at, t}` (a bit flip of qubit `at` between rounds t − 1 and t, or a wrong reading of check
  `at` in round t), each place once; `sample: {p, q, seed}` a seeded random history, never with `faults`). `show` (default `['faults', 'detectors']`): `'faults'`, `'detectors'`, `'matching'`,
  `'verdict'`. `cursor` (whole, 0 … rounds + 1): rounds later than it are dimmed. `spectrum: {maxW}` (1-4) draws no history at all, but a bar for each fault weight w.
- **Engine:** `physics/qec/spacetime.ts`: `repetitionGraph` (detectors D(i, t) and the data / readout edges), `historyOf` (the lit detectors and the logical flip), `sampleHistory`, `decodeHistory`
  (the exact minimum-weight matching with a boundary, dynamic programming over at most 14 lit detectors, which also tracks both values of the logical flip so a tie is reported, not hidden),
  `failureSpectrum` (every fault set of weight w: the lightest explanation wrong = "fail", both kinds = "tie"). The numpy twin is `pipeline/qec_numpy.py`. The scene only draws; `matchingArcs`
  (stage/svg/spacetime.ts) turns the engine's pairs into lines (a pair that goes round through the boundary becomes two arcs; a detector paired with the boundary goes to the LEFT boundary, the
  side that flips the logical bit, or the right one), and the tests check that the arcs add up to the engine's weight and that their left-boundary parity is the decoder's answer.
- **Display:** columns are the n − 1 checks with a dashed boundary column at each side, rows are the rounds going UP (the top row, "final", is the ideal round); a faint line is a place a fault
  can happen; a fault is a thick edge (data: orchid, horizontal; readout: amber, vertical); a lit detector is a filled cobalt disc; the matching is dashed white arcs; data-qubit numbers sit
  under the bottom row between the checks they touch. The verdict line reads "logical qubit: flipped | not flipped · decoder: right | wrong | tie" (tie: the lightest explanations disagree).
  The spectrum is three bars for each weight (all sets: silver, decoder wrong: cobalt, tie: orchid), their length the logarithm of the count, the count written at the end.
  One scene draws the stage, the reading version and the print figure (320 × 300).
- **Readouts:** `lit events: 4`, `2 faults (1 data)` (`seed 9: 3 faults` for a sample), `matching weight: 3`, `logical qubit: flipped`, `decoder: right`; the spectrum: `14 fault places`,
  `w = 2: 3 fail, 0 tie`, `first bad weight: 2` (`none bad up to w = 3`).
- **Limits:** n 3-9, rounds 1-6, at most 12 authored faults, fault indices in range, at most 14 lit detectors when `matching` or `verdict` is shown, `spectrum` weight 3 on at most 45 fault places
  (`rounds · (2n − 1)`) and weight 4 on at most 15, no `faults`, `sample`, `show` or `cursor` with a `spectrum`.
- **Transitions:** the cursor lerps when the two sides are the same history; any other change switches at the half-way point. The resolver memoizes by its inputs (and the spectrum by n, rounds, maxW).
- **Passport:** "SPACE-TIME · detector history"; note "not a place · the repetition code; a surface code has two space dimensions". Anchors `detector, fault, edge, matching, boundary, verdict,
  bar`. Shot `ST-HISTORY`.
- **Fidelity keys:** `qc-spacetime-engine` (exact), `qc-spacetime-layout` (schematic), `qc-spacetime-repetition-only` (misleading if read as a surface code).
- **Validation (clear messages that name the field):** n, rounds, `history.code`; faults (count, kind, `at` and `t` in range, a place twice, faults together with sample); sample chances and seed; show
  names; cursor; the 14-event limit; every spectrum limit.
- **Chunk:** `stage/svg/kinds.ts` (lazy).

### Additions for the Papers background chapters (B1 stage-kind agent; interface-changes rows SB1-2 … SB1-6; no other new kind)

- **`code` sources `toric`, `rotated`, `planar` (K-C).** A state names exactly one of `code` (a registry id), `toric: {L, M?}` (Kitaev's toric code, L × M with 2-8, one qubit on each edge of a wrapped
  grid, at most 128 qubits; `physics/qec/toric.ts`), `rotated: {d}` (the rotated surface-code patch, odd 3-9; `codes.ts rotatedSurfaceCode`) or `planar: {d}` (the unrotated planar code, odd 3-7, the
  hypergraph product of two open repetition codes, d² + (d − 1)² qubits; `planar.ts`). Qubit numbers are the engine's, counted from 0; checks are numbered X1, X2 … then Z1, Z2 … in the engine's order.
  New views: `'torus'` (a toric source: edge qubits at the edge midpoints of the grid, stars as small squares at the vertices and plaquettes at the face centres in the X and Z hues, dashed arrows at
  the borders where an edge wraps round) and `'patch'` (a rotated source: the engine's own grid with weight-4 faces and weight-2 half-discs; a planar source: the staggered grid of qubits and check
  squares with a line to each qubit, boundary checks of weight 3). The Tanner graph `'layout'` also works for the new sources within the layout's 25 qubits and 24 checks (a 3 × 3 torus is drawn in four
  columns, stars | horizontal edges | vertical edges | plaquettes; a rotated d = 3 or 5 or a planar d = 3 on its patch geometry). With no `view` a toric source is `'torus'` and a patch `'patch'`.
  New overlays, all optional: `fault: {type: 'X' | 'Y' | 'Z', qubits}` (at most 24 distinct qubits; letters on the hit qubits, and with `show: ['syndrome']` the checks that read −1 light up: a Z part
  lights the stars / X checks, an X part the plaquettes / Z checks); `operator` (toric: `'z-loop-h'`, `'z-loop-v'`, `'x-cut-h'`, `'x-cut-v'`, `'plaquette'`, with `at`, the row / column / plaquette,
  whole from 0; patch: `'xbar'`, `'zbar'`) drawn as letters on its support with its weight, the checks it lights, and what the engine says it is ("stabilizer", "logical operator"; "detected" if a check
  reads −1); `operator2` (the same names) in a second hue, the qubits in both ringed, the overlap counted ("overlap 1: anticommute" when an X-type and a Z-type operator share an odd number);
  `show` gains `'weights'` (the weight written in each check), `'stars'` / `'plaquettes'` (torus: highlight one family, the other dims) and `'logical'` (needs an `operator`; the operator is drawn
  whenever it is given); `schedule: {xOrder, zOrder}` (a rotated patch in the `'patch'` view; each a permutation of `'TL' 'TR' 'BL' 'BR'`): each check gets spokes numbered 1-4 by the engine's step
  order (`schedule.ts checkSteps`; a boundary check has two), qubits where two checks arrive in one step are ringed, and neighbouring X / Z pairs read in clashing order (`scheduleCheck(...).violations`)
  are outlined; readouts `clash-free · valid`, `clash-free` + `N flagged pairs`, or `clash: n places`. The registry codes resolve exactly as before and refuse the new fields. Readouts for the new
  sources: `n = 18 · k = 2`, `9 stars · 9 plaquettes` (patch: `n = 25 · k = 1 · d = 5`, `24 checks: 16×4, 8×2`), `fault: Z on 2 qubits`, `X1, X2 read −1`, `Z operator · weight 3`, `lights no
  check`, `logical operator`. Limits: a torus up to 8 × 8 (128 qubits), at most 97 data qubits in a patch (d = 9: 81), one fault and one operator (+ `operator2`) at a time. Fidelity: reuses `qc-code-lit`,
  adds `qc-code-schedule-order` (schematic: the order drawn is the engine's, the positions are a drawing choice). Passport unchanged ("CODE · qubits and checks"). Code: `stage/svg/code.surface.ts`
  (model, resolver, validation, readouts), `CodeSurfaceScene.tsx` (the torus and patch views and the shared marks), dispatched from `code.ts` and `CodeScene.tsx`.
- **`circuit.faults` and `circuit.hook` (K-F).** `faults: {col, wires, label?}[]` (at most 24): a diamond marker on each listed wire in the slot just BEFORE column `col` (`col` = the number of columns:
  after the last), joined by a thin line when several wires, with an optional label of at most 6 characters; dimmed with the columns ahead of the cursor; a place a fault can happen, not a computed
  fault (`qc-circuit-fault-markers`, schematic). `hook: {after: 0 | 1 | 2 | 3}`: the leading CNOT columns (from the first column that holds a CNOT, every column made only of CNOTs) must share one wire,
  the CHECK wire (the control of an X check's CNOTs, the target of a Z check's); a fault on it after `after` of those columns (fewer than there are) rides along it and spills through every CNOT still
  to come: a dashed line along the check wire and down to each reached wire, ringed. Readouts `N fault places`, `hook after 2: reaches d3, d4`. The print figure is taller (320 × 226 and up) when either
  field is used (`circuitPrintSize`; the optional `SvgKindDef.printSize` lets a state ask for another figure size). Validation: columns 0 … K, wires in range and distinct, a place once, label length,
  `after` below the number of leading CNOT columns, a shared check wire.
- **`plot` series mode, `xScale`, `reportedMarks` (K-P).** `series: {fn, params?, label?}[]` (1-6, instead of `curve`; `PlotSeriesState`, a second member of the `plot` union so every older state types
  as before) with the engine's `physics/qec/curves.ts`: `cleanRun` (x = the steps N, params `p`; optional `vote`: every step protected by a majority vote of that many copies), `repLogicalVsD`
  (x = d, `p`), `repLogicalVsP` (x = p, `d`), `surfaceVsP` (x = p, `d`, `preset`), `surfaceVsD` (x = d, `p`, `preset`), the presets being the three published fits `tdg-2.6`, `tdg-A10`, `bev22`.
  All series share one x (N, d or p). `xRange` (default N 1-1000, d 3-25, p 10⁻⁴-10⁻²) and `samples` apply; a function of d is drawn at the odd whole numbers of the range, as points joined by a line.
  `xScale: 'log'` (also for a named curve) puts the x axis in decades, `yLines` and `yScale` work as before, `markers` sit on the first series (label optional), `reportedMarks: {x, label, source}[]`
  (at most 6) draw hollow vertical marks "as printed" (the source is in the mark's title). Six looks (colour class + dash) keep the series apart in print; the legend runs in two columns, or one
  when the labels are long. Readouts: `d from 3 to 21`, one line per series `label: first → last`, the markers, `as printed: label`. The series figure is taller (`plotPrintSize`) to hold the value
  table above and the legend below. Fidelity `qc-plot-printed-constants` (misleading if read as a measurement: the fits are arithmetic on constants the papers print). Anchors `series`, `reported`.
  Validation names `plot series[i].params.x`, `xRange`, `samples`, `xScale`, `reportedMarks`.
- **`bits.bitmap` and `bits.grid` (B2's K-B).** A state draws exactly one of `fn`, `rows`, `reduce`, `bitmap`, `grid`. `bitmap: {matrix: {bb: 'gross' | 'two-gross', which: 'HX' | 'HZ' | 'both'},
  bands?}`: the code's check matrix (`physics/qec/bb.ts bbCode`) as pixels, 144 × 144 for the gross code with both (one H is 72 × 144; for two-gross 144 × 288 and 288 × 288, within the limit of
  288 × 576), the L and R qubits separated by a dashed line, the X and Z checks (X hue, Z hue) by another; a band is an outlined `rows` and / or `cols` range `[from, to]` (up to 4). A run of adjacent
  1s is ONE rectangle and a block is one `<path>`, never an element for each cell. Readouts `144 × 144 cells`, `864 ones`, `row weight 6`, `H_X H_Zᵀ = 0` (the engine checked the whole code).
  `grid: {shiftAction: {code, shift: [a, b]}}` (|a| ≤ ℓ, |b| ≤ m): the 12 × 12 matrix over GF(2) of the logical action of the shift x^a y^b on the paper's X logical basis
  (`logicalXAction`; row i, column j is 1 when the image of X̄ⱼ contains X̄ᵢ; the group law and the identity at the torus' period are tested), or `{rows: string[]}` (up to 12 × 12 of 0s and 1s, labelled
  from 1). Fidelity `qc-bits-bitmap` (exact), `qc-bits-basis-dependent` (misleading if read as basis-free: another numbering or another choice of logical operators gives another table). Anchors
  `bitmap`, `grid`, `band`.

### Kinds and additions for the Papers background chapter B3 (stage-kind work inside the B3 build; interface-changes rows SB3-1 … SB3-8)

- **`pauli-program` — new SVG kind (program mode built; contract `P-B4-story.md` §9.2 S-a).** `program: {wires 1-6, columns <= 24, labels?}` with columns `{rot: {pauli, angle: 'c+' | 'c-' | 't+' | 't-'}}`, `{meas: {pauli, outcome?}}`, `{inject: {pauli, s?, t?}}`; `upTo` dims later columns.
  Wires are horizontal lines, a column draws its Pauli letters on the wires it touches, a rotation is a chip (filled for T-like, outlined for Clifford), a measurement a meter box, an injection also a "magic lane" below the wires
  (drawn for reading, not a wire). Readouts are counts of authored columns. `compile` and `branch` are declared in the types for chapter B4 and refused by validation until B4's compiler exists. Fidelity `qc-program-letters`, `-layout`, `-magic-lane`.
- **`surgery-graph` — new SVG kind.** `gauge: {host, rungs?, w?, drop?, order?}` with hosts `patch3-x`, `patches3-xx`, `patch3-steane`, `seam3`; `show` (`vertices edges cycles checks`), `focus: {vertex}`, `product`, `subset: 'worst' | number[]`, `readouts`.
  Everything (dots, links, cycles, Cheeger set, n, k, both distances) comes from `physics/qec/gauge.ts` `gaugeSystem`; the layout is a drawing. Fidelity `qc-graph-counts` (exact), `qc-graph-layout`, `qc-graph-one-choice` (misleading if read as THE graph).
- **`spacetime` readout mode.** `history: {mode: 'readout', checks 1-8, rounds odd 1-11, q?, seed?, faults?}` with `show` `readings | product | vote`: the repeated product readout of `physics/qec/timelike.ts` (toy model: independent flips, majority vote; fidelity `qc-spacetime-toy`).
- **`matrix` tableau `update`.** `update: {generators <= 4 (signs allowed), measure, outcome?}` with `tableau: []` draws the generators before, the measured Pauli, a clash mark on every generator that anticommutes with it, and the generators after, from `physics/qec/update.ts` `updateRule` (case replaced / fixed / added, stored qubits before and after); plain tableau rows now allow 4 letters.
- **`code` additions.** Registry id `c422` (the [[4,2,2]] code); `measure` on the `checks` view; a `surgery` source (`{d: 3 | 5, product: 'XX' | 'ZZ', step: 'separate' | 'merged' | 'split', show?}`) drawn from `physics/qec/surgery.ts` `surgeryLayout`: kept, new and widened checks, the seam qubits.
- **`plot` additions.** Series function `voteFail` (params `{q, m}`) with an authored integer `xs` list; log y axis and `yLines` as before.
- **`bloch` marks.** `marks: {points: {x, y, z}[1-24 unit vectors], index?}` draws engine-supplied points as small spheres (ruling papers-B3B4 R4); positions are never computed in content.

## Passport and fidelity are course-aware, not kind-aware

`passportOf(state, course = 'sl448')` and `fidelityOf(key, course = 'sl448')` both take a course: 448's own six
labels and drawers never change, and a second course's fidelity registers through the lazy course pack
(`registerCourseFidelity`), never edits 448's `content/fidelity.ts` directly. The SVG kinds' drawers are the exception
by design: they are shared (`registerSharedFidelity`, from `content/fidelity.svg.ts`, loaded with the kinds' chunk), so
`fidelityOf` reads the course's own `kinds`, then the shared notes, else nothing. A kind a 448 lecture adds later puts its
notes in `content/fidelity.svg.ts`. What stays in the 709 pack is only 709's own: the `plane-photon` variant of a WebGL
kind and the `additions` it makes to a WebGL kind's drawer.
