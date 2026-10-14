# Visualization recipes — *Tour de gross* and its background chapters

Role P, 2026-10-14. Ruling R4: a lecture's visuals are data — each names a registered recipe (an engine computation with
typed, validated inputs) and a stage kind with its props; nothing generated is evaluated as code. This file lists every
visual the background chapters B1–B4 and the paper lecture need, as such recipes.

**Number classes** (R3): **C** = computed by the engine (numpy twin required); **R** = reported by the paper (listed in
`reported.md` with its location; rendered in the reported style); **C←R** = computed by the engine from inputs that are
the paper's (or a cited paper's) printed numbers — allowed only when the visual says so, and the twin recomputes from the
same printed inputs.

Function names below are proposals under `physics/qec/` (generic) and `physics/qec/tdg.ts` (this paper); align them with
the QEC engine's actual exports when it lands. Stage-kind props are sketches for the stage-kind briefs, not final types.

## 1. Engine inventory

Provided by the QEC engine now being built (per the brief): GF(2) linear algebra; stabilizer and CSS codes; small codes
(repetition, Shor, Steane, 5-qubit, rotated surface code); BB codes (gross, two-gross); Tanner graphs; shift
automorphisms; syndromes; small decoders; qubit-count arithmetic.

**Also needed** (not in that list — each needs a numpy twin):

| # | Function (proposal) | Inputs → outputs | Used by |
|---|---|---|---|
| E1 | `poly.fromTerms / mul / add / transpose / weight` | terms `[i, j][]`, ℓ, m → polynomial in F₂[x, y]/(x^ℓ − 1, y^m − 1) | R-B2-2, R-P-3 |
| E2 | `code.bbToric({l, m, a: [a→, a↑], b: [b→, b↑]})` and `code.isomorphic(c1, c2, hint)` | the paper's toric parametrization (Eq. 27); isomorphism by y ↦ y^u and monomial multiples → map or null | R-B2-5, R-B2-6, R-P-3 |
| E3 | `tdg.basis(code, {p, q, r, s, mu, nu, alpha, beta})` + validators | the paper's Eqs. 31–36 as authored polynomial data → 12 X̄ and 12 Z̄ supports; checks: logical (Eqs. 29–30), canonical commutation, properties 1–4, weights | R-P-3, R-P-4 |
| E4 | `bb.logicalAction(code, basis, delta)`, `groupClosure`, `wordLength` | shift monomial → 24 × 24 symplectic matrix (6 × 6 blocks); group order; ≤ 2-generator check | R-B2-8, R-P-5 |
| E5 | `tdg.nativeSets(code, basis)` | → native measurements (540) and native rotations under both readings of Eq. 15 (510 / 245) | R-P-5 |
| E6 | `symplectic.conjugateByRotation(P, R)`, `pbc.compile(ops, n)` | Clifford+T circuit (n ≤ 6) → Pauli rotations, measurements, leftover Clifford | R-B4-3, R-P-13 |
| E7 | `stab.simulate(program)` | stabilizer-tableau simulator, n ≤ 64, seeded outcomes, Pauli measurement update | R-B3-1, R-B3-4 |
| E8 | `gauge.build(code, logical, graph)`, `gauge.bridge(G1, G2, pairs)` | → graph, cycle basis, deformed checks, k before/after, small-code deformed distance, "product of vertex checks = logical" | R-B3-2, R-B3-5, R-P-6 |
| E9 | `graph.cycleRank / cycleBasis / cheeger / relativeExpansion / edgeColourBipartite` | graphs (V ≤ 16 for brute-force expansion) | R-B3-2, R-B3-3, R-P-6, R-P-8 |
| E10 | `sim.repetitionHistory`, `sim.measurementHistory`, `decode.matchSmall` | seeded space-time histories; exact min-weight matching for ≤ 14 events | R-B1-5, R-B3-4 |
| E11 | `decode.bp` (min-sum), `decode.osd0` | H, syndrome, priors, iterations → beliefs per iteration, decision | R-B2-9 |
| E12 | `noise.circuitFaults(circuit, model)` | the paper's §2.6 model → fault list, N, q = p/15 splitting | R-B1-7 |
| E13 | `tdg.ansatz`, `tdg.pIid` | Eq. 83 and Eq. 82 with stable `lgamma`, `expm1`, `log1p` | R-P-11, R-P-12, R-P-18, R-P-22 |
| E14 | `tdg.qubits`, `tdg.maxModules`, `tdg.failure`, `tdg.surfaceModel`, `tdg.powerLawCrossing`, `tdg.yield`, `tdg.tfimRotations` | Eqs. 25, 26, 89, 90, 96; A.10 interpolation; §5 junction model; A.10 product-formula count | R-P-1, R-P-16 – R-P-20 |
| E15 | `magic.cliffordOrbit`, `magic.distill15(eps)`, `magic.meanTime(...)` | 24 one-qubit Cliffords; exact 2¹⁵ enumeration; Eqs. 73–80 | R-B4-1, R-B4-4, R-B4-5, R-P-21 |
| E16 | `curves.*` for `plot` | `repetitionLogical`, `surfaceFit` (presets: paper §2.6, paper A.10, [Bev+22]), `rsTcount`, `distill15Out`, `kd2n`, `yieldCurve`, `tdgPofP` | many |
| E17 | `code.distanceSmall(code)` | brute force for n ≤ 32 (exact); for large codes only "≤ weight of an exhibited logical" | R-B1-2, R-B3-2 |

Presentation warning: [Bra+24] writes the gross code as A = x³ + y + y², B = y³ + x + x²; the paper's toric form is
A = 1 + y + x³y⁻¹, B = 1 + x + x⁻¹y⁻³ (same code: multiply by y and x; the two-gross code also needs y ↦ y⁷). All of the
paper's logical-basis polynomials (Eqs. 32–36) are written in the toric form, so the paper lecture must build its codes
with E2, and B2 should show both forms and the isomorphism.

## 2. New stage kinds (one paragraph each) and extensions

**`code-lattice` (SVG).** Draws a stabilizer code's qubits and checks from an engine code reference (content never writes
coordinates). Views: `tanner` (layered bipartite layout for codes up to ~40 nodes), `torus` (ℓ × m unit cells of L/R
qubits and X/Z checks with wrap-around arrows, short edges always and long edges for chosen cells, up to 12 × 12 cells),
`planar` (rotated or planar surface patches up to d = 7, including two patches and a seam). Overlays, all resolved by the
engine: `operator` (a Pauli string or a named logical drawn as letters on its support, with Y where X and Z meet),
`error` with `syndrome: true` (lit checks), `schedule` (edge time labels from an authored schedule that the engine
validates), `shift` (arrows and a ghost of the shifted support), `pattern` (the cells of a polynomial from one anchor
cell), `beliefs` (BP marginals at an iteration), `merge` (seam checks of a lattice-surgery step). Passport "CODE · qubits
and checks"; fidelity notes: positions are a drawing, not chip layout; long edges shown for sample cells only. Limits as
above; operator length must equal n.

**`spacetime` (SVG).** A detector history: columns are checks of a repetition code or a small 2-D code (flattened), rows
are rounds; data errors sit on space edges, measurement errors on time edges, lit detectors as dots, the matching as arcs
(including to the boundary), and a verdict (logical flip or not). Source `{history: {code, rounds, faults | {p, q, seed}}}`;
every mark from E10. Passport "SPACE-TIME · detector history"; ≤ 12 rounds, ≤ 16 checks.

**`surgery-graph` (SVG).** The auxiliary graph of a gauging or LPU measurement beside the support of the measured logical:
vertices (vertex checks), edges (new qubits), chosen cycles (cycle checks), bridge edges, an identified or Bell vertex, and
attachment ticks to the original code's qubits and checks. `mode` highlights the active subgraph (half-LPU l, r, full,
joined modules); `subset` shades a vertex set and counts its boundary edges (Cheeger ratio). Source `{gauge: {code,
logical, graph}}` or `{lpu: 'gross' | 'twoGross', mode}`; readouts V, E, E − V + 1, kept cycles, h(G), k before/after. A
two-row layout reproduces the paper's bridge diagrams (Eqs. 39, 63). ≤ 50 vertices, ≤ 100 edges.

**`pauli-program` (SVG).** A time-ordered program of Pauli operations on up to 24 logical wires, grouped into modules of
12 with the pivot marked: each column is a Pauli string with a type (π/4 Clifford rotation, π/8 rotation, rotation by a
named angle, measurement with its outcome symbol, T injection with a factory lane). A cursor scrubs; a compile mode shows
Clifford rotations being pushed to the end (E6, recomputed at every step); a bicycle mode colours columns by instruction
class (shift, in-module, inter-module, T) and sums durations (durations from Table 2 are C←R). Source `{program}` or
`{compile: {circuit, upTo}}`; ≤ 24 wires, ≤ 32 columns. Passport "PROGRAM · Pauli operations, time →".

**`module-map` (SVG).** A schematic of a bicycle machine: code modules (code c and LPU u), adapters a and a′, one factory
f, Bell-coupler bundles, in a linear or triangular layout; block areas scale with the engine's qubit counts (E14); a
`highlight` shows the parts an instruction uses (in-module, an inter-module pair, a T-injection path). Readouts q (Eq. 25)
and n = 11M. Source `{machine: {code, p, M, layout}}`; M ≤ 12 drawn, larger M elided with counts. Passport
"ARCHITECTURE · modules (schematic, not to scale)".

**Extensions of existing kinds.** `plot`: `xScale: 'log'`; engine point series; a `reported` series `{source, where,
points}` drawn hollow with an "as printed" legend; `mode: 'bars'`. `bits`: a `bitmap` view for binary matrices up to
288 × 576 (block separators, highlighted bands), and grid views up to 12 × 12 for action and commutation tables.
`matrix` tableau: strings up to 9 letters for Shor/Steane stabilizer tables (or route these through `bits`; decide in the
kind brief). `bloch`: a `marks` list of points (Clifford orbits, the stabilizer octahedron).

## 3. Recipes

Format: **id — title** · used in · computation · picture · numbers.

### B1 — surface code memory

- **R-B1-1 — Tanner graph of a small code** · `b1-toric` (also Q19/Q20) · `code.small(name)` → code; `tanner(code)` →
  nodes/edges; optional `syndromeOf(code, error)` · `code-lattice` view `tanner`, overlays `error`, `syndrome` · n, k,
  check weights, syndrome bits: **C**.
- **R-B1-2 — Toric code on a torus** · `b1-toric` · `code.toric(L ≤ 8)`, `syndromeOf`, `isLogical`, `distanceSmall`
  (exact for L ≤ 4) · `code-lattice` `torus`, an error chain, its end-point checks, two non-contractible loops · k = 2
  (rank), d = L: **C**.
- **R-B1-3 — The rotated patch** · `b1-planar` · `code.rotatedSurface(d ∈ {3, 5, 7})` with layout · `code-lattice`
  `planar`, logical X̄ column and Z̄ row · d² data + d² − 1 checks, k = 1: **C**.
- **R-B1-4 — A valid check schedule** · `b1-cycle` · `scheduleValid(code, schedule)` (overlapping X/Z checks must touch
  their shared qubits in an order equivalent to sequential measurement; the paper's Eq. 67 condition) → valid, depth,
  violations · `code-lattice` with `schedule` labels; a bad order flagged · depth and validity: **C** (schedule authored).
- **R-B1-5 — Errors in space and time** · `b1-spacetime` · `sim.repetitionHistory({n, rounds, faults | p, q, seed})`,
  `decode.matchSmall` → detectors, matching, verdict · `spacetime` · every mark: **C** (seeded).
- **R-B1-6 — Logical error vs distance** · `b1-why`, `b1-threshold` · `curves.repetitionLogical(d, p)` (exact binomial
  tail) and `curves.surfaceFit(d, p, preset)` with presets: paper §2.6 (0.1, 0.01, exponent d/2), paper A.10 (0.03, 0.01,
  d/2), [Bev+22] App. B (0.03, 0.01, (d + 1)/2) · `plot`, log–log, curves for several d · repetition curves **C**; surface
  fits **C←R** (constants as printed, preset named on the stage).
- **R-B1-7 — Counting fault locations** · `b1-cycle` · `noise.circuitFaults(circuit, 'tdg-2.6')` → faults with weights
  p, p/3, p/15; N and q = p/15 after splitting · `circuit` (one check measured with an ancilla, ≤ 5 qubits) with fault
  markers; readouts N, q · **C**.

### B2 — QLDPC and BB codes

- **R-B2-1 — Rate and the plane's limit** · `b2-ldpc`, `b2-bpt` · `curves.surfaceRate`, `curves.kd2n` for the surface code
  (= 1), [[72,12,6]], gross (12), two-gross (13.5), and the §5 family · `plot` points vs n (log x) · n, k **C**; distances
  of gross and two-gross **R** ([Bra+24] Table 3); family distances **R** (conjectured, §5); ratios **C←R**.
- **R-B2-2 — Polynomials as patterns** · `b2-polynomials` · E1 → cells of αA, αB, αBᵀ, αAᵀ from one anchor cell ·
  `code-lattice` `torus` with `pattern` · **C**.
- **R-B2-3 — The check matrix as a picture** · `b2-polynomials` · `code.bb(...)` → H_X, H_Z; ranks; H_X H_Zᵀ · `bits`
  `bitmap` (A and B blocks of circulant stripes) · weights 6, H_X H_Zᵀ = 0, rank H_X = rank H_Z, k = 12: **C**.
- **R-B2-4 — Counting logical qubits across the family** · `b2-polynomials` · `code.bb` for presets ([[72,12,6]],
  [[90,8,10]], [[108,8,10]], gross, two-gross, §5 members) → n, k with a distance record `{value, kind: 'reported' |
  'conjectured' | 'exact-offline', source}` · `plot` points or a widget readout · n, k **C**; d **R** (or **C** offline for
  n = 72 if the fixture brute-forces it).
- **R-B2-5 — The gross code on its torus** · `b2-gross` · E2 with (ℓ, m) = (12, 6), (a, b) = ((3, −1), (−1, −3)) ·
  `code-lattice` `torus`, long edges of one chosen cell (Fig. 3b redrawn from data) · **C**.
- **R-B2-6 — Two descriptions, one code** · `b2-gross` · `code.isomorphic(bbToric, bbBravyi, hint)` · readout on the torus
  stage · **C**.
- **R-B2-7 — The depth-8 cycle** · `b2-gross`, `tdg-idle-shift` · authored schedule of one X and one Z check from
  [Bra+24] Table 5 / the paper's Fig. 4b, validated by `scheduleValid`; `cycles(C) = 8C + 1` · `code-lattice` `tanner`
  subgraph with edge timesteps · validity, 8 per cycle: **C** (schedule is an authored, cited input).
- **R-B2-8 — Shifts as logical CNOT circuits** · `b2-automorphisms` · `bb.shiftPermutation`, E4 (with a simple basis in
  B2; the paper's basis in `tdg-idle-shift`) · `code-lattice` `torus` with `shift` + `bits` grid of the 6 × 6 block ·
  group order, matrix, order 6: **C**.
- **R-B2-9 — Belief propagation and its failure** · `b2-decoding` · E11 on a repetition code (converges) and a small toric
  code with a degenerate weight-2 error (split beliefs; OSD-0 recovers) · `code-lattice` `tanner` with `beliefs`,
  iteration scrub · **C**. Relay-BP's performance claims: **R** ([Mül+25] abstract; text only, no stage).

### B3 — logical measurement

- **R-B3-1 — Merge and split** · `b3-surgery` · E7 running two d = 3 patches through merge (seam qubits prepared, new seam
  checks measured), d rounds, split; asserts: product of seam outcomes = measured X̄X̄ (or Z̄Z̄), k goes 2 → 1 → 2 ·
  `code-lattice` `planar` with `merge`, three steps · **C** (seeded outcomes).
- **R-B3-2 — Gauging on a graph** · `b3-gauging` · E8 on X̄ of a d = 3 rotated patch and of a small toric code ·
  `surgery-graph` · V, E, cycle rank E − V + 1, k before/after, "product of vertex checks = logical", deformed distance
  (brute force): **C**.
- **R-B3-3 — Expansion** · `b3-distance` · `graph.cheeger` (brute force, V ≤ 16) on a good and a bad graph; deformed
  distance for each · `surgery-graph` with `subset` · h(G), distances: **C**.
- **R-B3-4 — Time-like failures** · `b3-distance` · E7/E10: a product measured C times with measurement errors; inferred
  outcome; exact failure chance vs C as a binomial tail · `spacetime` + `plot` · **C**.
- **R-B3-5 — Bridges** · `b3-bridges` · `gauge.bridge(G1, G2, pairs)` → joined graph; asserts w bridge edges add w − 1
  cycles; product measured · `surgery-graph` (two subgraphs + bridge) · **C**.
- **R-B3-6 — A product, not its factors** · `b3-logical-measure` · state vector (existing `physics/qc/circuit.ts`, ≤ 3
  qubits): measuring Z₁Z₂ through an ancilla keeps the superposition inside the parity sector, measuring Z₁ then Z₂ does
  not · `circuit` + `amplitudes` · **C**.

### B4 — magic states and Pauli-based computation

- **R-B4-1 — The T state among stabilizer states** · `b4-beyond-clifford`, `b4-injection` · E15 `cliffordOrbit(T|+⟩)` →
  12 points; the 6 stabilizer states · `bloch` with `marks` · orbit size 12, Bloch vector (1, 1, 0)/√2: **C**.
- **R-B4-2 — T by injection** · `b4-injection` · 3-qubit state vector: P⊗Z measured through an ancilla, then X on the magic
  qubit, conditional S fix-up; both branches equal T|ψ⟩ (asserted) · `circuit` + `amplitudes` (split) · **C**.
- **R-B4-3 — Pushing Cliffords to the end** · `b4-pbc` · E6 on a 3–4 qubit Clifford+T circuit; state-vector equivalence
  check · `pauli-program` (compile mode) · **C**.
- **R-B4-4 — Fifteen to one** · `b4-distill` · E15 `distill15(ε)`: exact over 2¹⁵ patterns of independent Z errors on the
  15 inputs → acceptance and output error; leading term 35ε³ · `plot` (`distill15Out` vs ε, log–log) with the crossing
  marked · **C** (the error model is stated on the stage).
- **R-B4-5 — Mean time with discards** · `b4-cultivate` · E15 `meanTime` (Eqs. 73–80) · `plot` of mean attempts 1/s vs
  keep chance s with readouts · **C←R** (discard rates from [GSJ24] Fig. 2 as copied in Table 5).
- **R-B4-6 — T count of a rotation** · `b4-synthesis` · `curves.rsTcount(ε)` = 3 log₂(1/ε) · `plot`, log x · **C←R**
  (the law and its "typical" status from [RS16]).
- **R-B4-7 — A measurement absorbs a Clifford rotation** · `b4-pbc` · 2-qubit state vector: after measuring R, a
  measurement projection of an anticommuting Q equals a (QR)(π/4) rotation, for both outcomes (the paper's Eq. 10) ·
  `circuit` + `amplitudes` · **C**.

### Paper lecture

- **R-P-1 — Capability plane (Fig. 1b redrawn)** · `tdg-criteria` · n by Eq. 25 (E14), surface points by Eq. 89 ·
  `plot` log–log scatter: bicycle points as a `reported` series (N_T from Fig. 10a), surface points computed, the
  75-qubit / 75-T classical lines; application hulls omitted (they come from another paper's scatter, no engine meaning) ·
  n **C←R**; bicycle N_T **R**; surface N_T **C←R** (see recompute note N7 in `reported.md`).
- **R-P-2 — Module components** · `tdg-modules` · `tdg.components({code, p})`: c = 4ℓm **C**; u = sum of the LPU census
  **C** (from R-P-6's graph) or **C←R** (Fig. 5 census); a = 2(d − 1) **C**; a′ = 2d_factory − 1 **C←R** (d_factory from
  Table 3); f **R** · `module-map`.
- **R-P-3 — The logical basis on the torus (Figs. 3b, 11)** · `tdg-gross` · E2 + E3 with Eqs. 32–36 as authored data ·
  `code-lattice` `torus` with `operator` X̄₁, X̄₇, Z̄₁, Z̄₇ and their Y overlaps · logicality, weights 12/20, overlaps,
  property 4: **C**. Logical-operator counts of Fig. 12 (1884, 19 728, 336, 1728) **R**.
- **R-P-4 — A canonical basis** · `tdg-gross` · E3 → 12 × 12 table of anticommutation between X̄_i and Z̄_j · `bits` grid
  12 × 12 · identity table: **C**.
- **R-P-5 — The shift group and the native sets** · `tdg-idle-shift`, `tdg-compile` · E4, E5 → A_x, A_y (Eqs. 37–38), group
  order 36, products of ≤ 2 basic shifts, 540 native measurements, native rotations 510 or 245 · `bits` grid 6 × 6 +
  readouts · **C** (open items O1, O2 in `reported.md` decide how the matrices and the 510 are worded).
- **R-P-6 — The LPU graph (Fig. 5)** · `tdg-lpu` · E8/E9: G_l and G_r from the code (gross 12 vertices / 18 edges, two-gross
  20 / 30 + 2), cycle ranks, the kept cycles and bridge edges of Eqs. 39–64 as authored data validated as cycles of G,
  identified vertex, census totals 90 / 158 · `surgery-graph` (`lpu`) · graph sizes and totals **C**; which cycles are
  kept is the paper's choice (authored input, validated).
- **R-P-7 — Which part of the LPU measures what** · `tdg-lpu` · `tdg.lpu.modeOf(pauli)` → half-l (3), half-r (3), full (9)
  · `surgery-graph` `mode` · **C**.
- **R-P-8 — Scheduling by colours** · `tdg-lpu` · E9 `edgeColourBipartite` on a small bipartite graph and on an LPU
  subgraph; constraint checker for Eqs. 65–68 including Bell checks · `surgery-graph` or `code-lattice` `tanner` with
  colours as steps · colour count = max degree **C**; 9C + b (ILP) and 12 per cycle (colouring) **R**.
- **R-P-9 — Joining modules** · `tdg-between` · `gauge.bridge` on two LPU bridges via Bell checks; a = 2(d − 1); added
  cycles w − 1; deformed distance d − 1 and the "same minimum number of faults" arithmetic (⌈(d − 1)/2⌉ = d/2 for even d)
  · `module-map` zoom / `surgery-graph` · **C**.
- **R-P-10 — A Bell check (Fig. 4c)** · `tdg-idle-shift` · 4-qubit state vector: a weight-2 check measured by two check
  qubits sharing a Bell pair equals the single-ancilla measurement (parity of two X readouts) · `circuit` + `amplitudes` ·
  **C**.
- **R-P-11 — Failure spectrum to error rate (Fig. 7)** · `tdg-benchmark` · E13 with Table 6's parameters → f(w), P(p)
  curves; reproduces the measured entries of Table 2 and the rates of Table 10 · `plot` log–log; Table 2 values as a
  `reported` series at p = 10⁻³, 10⁻⁴ · curves **C←R**; Monte Carlo points of Fig. 7 not redrawn (no tabulated data).
- **R-P-12 — The instruction table (Table 2)** · `tdg-benchmark` · τ_I = 8, τ_U = 6 + 8, τ_M = τ_C = 12C with C = 10 / 18,
  τ_T = τ̄_factory + τ_C (+1 by §2.5; Table 2 omits it, note N10); P_i from R-P-11 · claims table (no stage) · durations
  **C←R**; P_i **C←R**; bracketed (assumed) entries **R**.
- **R-P-13 — Compiling one long rotation (Fig. 8)** · `tdg-modules`, `tdg-compile` · `tdg.compile.distribute({pauli,
  angle})` for n = 22 (M = 2) or 33 (M = 3): factors P_i, pivot GHZ by ZZ measurements, Y⊗P_i measurements, pivot rotation;
  instruction counts · `pauli-program` (bicycle mode) · **C**.
- **R-P-14 — Cost of an in-module measurement (Fig. 9)** · `tdg-compile` · reported histogram and means; optional offline
  numpy BFS over the 2²⁴ symplectic vectors with the 510 transvections (heavy; fixture only) · `plot` `bars` with a
  `reported` series · **R** (or **C** offline if the fixture is built).
- **R-P-15 — Rotations on the pivot (Eqs. 23–24)** · `tdg-compile` · 2-qubit state vector: φ = π/4 exactly; a chain of
  three injections with outcome-dependent bases · `circuit` with classical conditions + `amplitudes` · **C**.
- **R-P-16 — The qubit budget (Eq. 25)** · `tdg-bill` · `tdg.qubits`, `tdg.maxModules` → M, n = 11M, q; reproduces
  n = 121, 704, 110, 1342, 440, 6886 and q = 8138 · `module-map` readouts or `plot` · **C←R** (f and a′ from Tables 1, 3;
  note N4 on q = 4817).
- **R-P-17 — Capability table (Fig. 10a)** · `tdg-bill` · surface rows by Eq. 89 and τ̄ + 6d; bicycle n by Eq. 25 ·
  claims table + `plot` · surface **C←R** (note N7 on the d = 5 row); bicycle N_T and timesteps per T **R**.
- **R-P-18 — TFIM requirements (Fig. 10b)** · `tdg-bill` · `tdg.tfimRotations({side: 10, steps: 80, order: 4})`
  = 80 × 5 × (2·180 + 100) = 184 000 (open boundary, 180 bonds) **C**; Table 9 counts **R**; P_i at five p by E13
  **C←R**; failure Σ N_i P_i **C←R**; power-law crossing (2.09 × 10⁻⁵, 7.32 × 10⁻⁴) **C←R**; surface curves by Eq. 96 and
  q = 2d²·100 + f **C←R** (note N6) · `plot` log–log with the 10⁻³ target line.
- **R-P-19 — Yield** · `tdg-criteria` · `tdg.yield({qubits, couplers, jq: 2, jc: 3, y: 0.9998})`; monolithic surface chips
  with ≈ 2 couplers per qubit reproduce "about 1 in 3000" (5000 qubits) and "1 in 66 000" (d = 17, 12 patches) · `plot`
  yield vs qubits · surface **C** under a stated assumption; BB modules (2 in 5, 1 in 5) **R** (LPU coupler count not
  given).
- **R-P-20 — Larger BB codes (§5)** · `tdg-bill` · E2 with ℓ = 6(r + b), m = 6r → n, k (C for r ≤ 3); kd²/n with the
  conjectured d; limit 24 · `plot` points vs r, lines at 24 and 1 · n, k **C**; d **R** (conjecture); ratios **C←R**.
- **R-P-21 — Cultivation time (Table 5)** · `tdg-between` · E15 `meanTime` with the printed rounded coefficients → 351 and
  2167; exact inputs give 352.5 and 2243 (sensitivity) · readouts · **C←R**.
- **R-P-22 — Two-gross vs surface code (§2.6 remark)** · `tdg-benchmark` · E13 two-gross idle at 10⁻³ (≈ 8 × 10⁻²¹);
  `surfaceFit` preset §2.6 at d = 17 (≈ 3.2 × 10⁻¹⁰) · `plot` vs p · **C←R**; counts 336 and 875 178 **R**.

## 4. Coverage

Every unit in `chapters.md` has at least one recipe. Every **R** and **C←R** input above is listed in `reported.md` with
its page location. Visuals that would only restate a reported figure without engine meaning (the application hulls of
Fig. 1b and Fig. 16, the Monte Carlo scatter of Figs. 7, 15, 17) are not redrawn; their numbers appear as reported claims.
