# Chapter scopes — what must exist before the *Tour de gross* lecture

Role P, 2026-10-14. Scoped by `prereq-graph.json`: every concept node has one home, and this file says what each home
must deliver. Node ids are in `code font`; recipe ids (`R-…`) point into `recipes.md`; reference keys into
`references.md`. Rulings R1–R9 (`docs/roles/decisions/papers.md`) apply throughout.

> **Numbering clash to settle (judge).** The brief and ruling R2 call the two error-correction chapters Q19 (Bergou Ch. 9)
> and Q20 (Bergou Ch. 10). `app/src/content/qc709/outline.ts` already uses Q19 for "Walks, simulation and hybrid
> algorithms" (Bergou §7.6–7.8) and Q20 for "Quantum machines" (Ch. 8), and puts error correction in Part IX as Q21
> ("Protecting qubits from noise", §9.1 + §9.3) and Q22 ("Stabilizers, CSS codes and Gottesman–Knill", §9.2 + Ch. 10).
> This file follows the brief's labels. Every Q19/Q20 node in the graph carries its book section as `hint`, so a renumber
> (or the outline's different split, which moves CSS codes to the stabilizer chapter) is a mechanical relabel of
> `taught_in`, not a re-plan.

## (a) Requirements on Q19 and Q20

These are requirements only: the Q19/Q20 planner works from Bergou and owns the units. "Must" items are needed by a
background chapter or the paper lecture; "nice" items help but nothing depends on them.

### Q19 — codes (Bergou Ch. 9)

| Node | Must deliver | Book |
|---|---|---|
| `qec-why` | Why protection is hard (continuous errors, no cloning, measurement disturbs) and why redundancy still works | §9.1 |
| `repetition-code` | Three-qubit bit-flip and phase-flip codes; the parities Z₁Z₂, Z₂Z₃ (and X-type for phase flips) found without reading the data | §9.1, Problem 9.1 |
| `logical-qubit` | A logical qubit as a protected subspace; encoded \|0̄⟩, \|1̄⟩ | §9.1 |
| `syndrome` | Syndrome = check outcomes; a syndrome table for single errors (reuse F7's Hamming syndrome, `f7-gf2`) | §9.1–9.2 |
| `error-discretization` | Fixing X and Z fixes every single-qubit error (link to `q13-depolarizing`) | §9.1 |
| `shor-code` | The [[9,1,3]] code and its 8 checks | §9.1 |
| `qec-conditions` | Knill–Laflamme conditions (nice for this paper; must for the course) | §9.1 |
| `classical-linear-code` | Generator and check matrices, weight, distance, dual code, the Hamming [7,4,3] code | §9.2 |
| `nkd` | [[n, k, d]] and "corrects ⌊(d − 1)/2⌋" | §9.2 |
| `css-code` | X checks from one classical code and Z checks from another; they commute iff H_X H_Zᵀ = 0 over GF(2) — **this exact condition is what B2 reuses for BB codes (AB + BA = 0)** | §9.2 |
| `steane-code` | [[7,1,3]] from the Hamming code; B4 reuses it as the smallest colour code | §9.2 |

Not needed by this paper: decoherence-free subspaces (§9.3), the quantum Hamming bound (Problem 9.2).
Engine: the parallel QEC engine's repetition, Shor and Steane codes, `syndromeOf`, GF(2) ranks; stage kinds `bits`
(check matrices, syndromes — already shipped) and the proposed `code-lattice` Tanner view (R-B1-1) if Q19 wants it.

### Q20 — stabilizers (Bergou Ch. 10)

| Node | Must deliver | Book |
|---|---|---|
| `pauli-group` | n-qubit Pauli strings with phases; any two commute or anticommute; weight of a string | §10.1 |
| `symplectic-pauli` | Pauli strings as bit vectors (x\|z); anticommutation = symplectic product 1 — **the representation every later chapter computes with** | §10.1 (check matrix) |
| `stabilizer-group` | Abelian Pauli group without −I; the code space it fixes | §10.1 |
| `check-matrix` | Generators as rows; independence = row rank; k = n − r (Theorems 1–2) | §10.1 |
| `logical-operators` | Operators commuting with all checks but not checks; logical X̄, Z̄ pairs | §10.1–10.2 (confirm; else N&C §10.5.5) |
| `code-distance` | Distance = weight of the lightest logical operator (the definition B1–B3 and the paper use, not only the classical one) | N&C §10.5.5 if Bergou lacks it |
| `css-stabilizer` | A CSS code as a stabilizer code; transversal preparation of \|0̄⟩^⊗k / \|+̄⟩^⊗k and qubit-wise readout | §10.1; N&C §10.5.6 |
| `clifford-group` | Clifford unitaries map Paulis to Paulis; H, S, CNOT tables; generated group | §10.2 (normalizer) |
| `stabilizer-measurement-update` | The update rule for measuring a Pauli on a stabilizer state (random outcome and generator replacement when it anticommutes) — **used by every surgery and compilation step** | §10.2 |
| `gottesman-knill` | Clifford circuits are classically simulable | §10.3–10.4 |
| `syndrome-extraction-circuit` | Measuring one check with an ancilla in \|+⟩, controlled Paulis and an X readout (the paper's Fig. 4a) | §10.2 or N&C §10.5.8 |

Nice: the 5-qubit code (engine has it); a Pauli-frame remark (tracked corrections; B1 owns `pauli-frame`).
If the planner pulls N&C §10.6 (fault tolerance, threshold, the fault-tolerant π/8 gate by state injection) into 709,
the nodes `fault-tolerance`, `threshold` and `t-injection` move from B1/B4 to Q19/Q20 (`alt_home` in the graph).
Engine: QEC engine stabilizer codes, symplectic products, ranks; stage kinds `matrix` tableau (≤ 3 qubits today — see the
`bits`/tableau width extension in `recipes.md`) and `circuit` (≤ 5 qubits) for the ancilla check circuit.

## (b) Background chapters (Papers section, reusable by later papers)

Four chapters, each built in the 709 content model (two tracks, derivations, claims with numpy twins, challenges,
glossary, bridges with the return bar). Unit ids are proposals.

### B1 — The surface code: a memory you can keep

Prereqs: Q19, Q20. Sources: [Kit03] §1; [Den+02] §III–§V; [Hor+12] §2, §7.1; [Lit19a] tile rules; [Rof19] §3–§6;
[Bev+22] App. B (formula only); [Fow+12] (abstract only until the PDF is approved).

| Unit | Title | Nodes | Visuals (recipes) |
|---|---|---|---|
| `b1-why` | Why fault tolerance | `ft-motivation` | R-B1-6 (logical error budget plot) |
| `b1-toric` | Checks on a torus | `tanner-graph`, `toric-code`, `homology-logicals` | R-B1-1, R-B1-2 |
| `b1-planar` | Boundaries and the rotated patch | `planar-surface-code`, `rotated-surface-code`, `surface-code-patch` | R-B1-3 |
| `b1-cycle` | One round of checks, and what can go wrong | `syndrome-cycle`, `circuit-noise`, `phenomenological-noise` | R-B1-4, R-B1-7 |
| `b1-spacetime` | Errors in space and time; matching | `detector`, `decoder`, `matching-decoder`, `pauli-frame` | R-B1-5 |
| `b1-threshold` | Distance, threshold and the logical error rate | `circuit-distance`, `fault-tolerance`, `threshold`, `logical-error-scaling`, `surface-code-memory` | R-B1-6 |

Engine/visual needs: toric and rotated surface codes (QEC engine), a seeded space-time simulator for the repetition and
small surface codes with detectors and an exact small matching decoder (new), circuit fault counting (new); new kinds
`code-lattice` (torus, planar, Tanner views) and `spacetime`; `plot` with log–log axes.

### B2 — Quantum LDPC codes and bivariate bicycle codes

Prereqs: B1 (toric code, Tanner graphs, decoders), Q19/Q20. Sources: [BE21] §II.1.2, §II.2.2, §III.4, §IV.1, §VI.3–VI.4;
[BPT10]; [Bra+24] §4 (Eqs. 1–3, Lemma 1, Table 3, Lemma 2, Def. 1/Lemma 4), §5 (Table 5, Fig. 5), §9.1–9.2;
[Rof+20] §V, App. C; [Mül+25] (abstract).

| Unit | Title | Nodes | Visuals (recipes) |
|---|---|---|---|
| `b2-ldpc` | Sparse checks and the rate problem | `qldpc-code`, `code-rate` | R-B2-1 |
| `b2-bpt` | Why the plane is not enough | `bpt-bound`, `long-range-connectivity` | R-B2-1 |
| `b2-polynomials` | Codes from polynomials on a torus | `polynomial-ring`, `bb-code`, `bb-k-formula` | R-B2-2, R-B2-3, R-B2-4 |
| `b2-gross` | The gross code family | `bb-torus-layout`, `gross-code`, `syndrome-cycle-bb` | R-B2-5, R-B2-6, R-B2-7 |
| `b2-automorphisms` | Shifts as logical gates | `code-automorphism`, `shift-automorphism` | R-B2-8 |
| `b2-decoding` | Decoding sparse codes: BP, OSD, Relay-BP | `bp-decoding`, `relay-bp` | R-B2-9 |

Engine/visual needs: polynomial ring F₂[x, y]/(x^ℓ − 1, y^m − 1) and BB codes from (ℓ, m, A, B) (QEC engine), the paper's
(a→, a↑, b→, b↑) parametrization and a presentation-isomorphism check (new), min-sum BP + OSD-0 on small codes (new if the
engine's "small decoders" do not include BP); `code-lattice` torus view with long edges and polynomial patterns; `bits`
bitmap view for 72 × 144 and 144 × 288 check matrices.

### B3 — Measuring logical operators: from lattice surgery to gauging

Prereqs: B1, B2 (Tanner graphs of BB codes), Q20 (update rule). Sources: [Hor+12] §3–§4 (Figs. 5–7); [Lit19a] (Pauli
product measurement rules); [WY24] Algorithm 1, Thms 1–4, Fig. 1b; [Cro+24] §2.2, §3.1–3.3, §3.6–3.8 (Thm 24);
[SJY24] §II.2–II.3, §IV.

| Unit | Title | Nodes | Visuals (recipes) |
|---|---|---|---|
| `b3-logical-measure` | Measuring a logical without reading the data | `logical-pauli-measurement`, `pauli-product-measurement` | R-B3-6 |
| `b3-surgery` | Lattice surgery: merge and split | `code-deformation`, `lattice-surgery` | R-B3-1 |
| `b3-gauging` | Gauging a logical on a graph | `graph-cycle-basis`, `gauging-measurement` | R-B3-2 |
| `b3-distance` | Keeping the distance: expansion and time-like errors | `expansion`, `subsystem-code`, `space-time-like-errors` | R-B3-3, R-B3-4 |
| `b3-bridges` | Bridges and adapters | `bridge-system`, `adapter` | R-B3-5 |

Engine/visual needs: a stabilizer-tableau simulator able to run a merge/split on two distance-3 patches (~40 qubits) and
report the measured product (new unless the QEC engine has one), a gauging builder (graph from a logical's support,
deformed checks, k and small-code distance of the deformed code), graph tools (cycle rank, cycle basis, Cheeger constant
by brute force for V ≤ 16); new kind `surgery-graph`; `spacetime` reused.

### B4 — Magic states and Pauli-based computation

Prereqs: Q20 (Clifford group, Gottesman–Knill, update rule), B1 (patches), B3 (Pauli product measurement).
Sources: [BK05] §I (Def. 1, Thm 1), §III, §VI (Eqs. 35–38); [Lit19a] §1 (Figs. 4–7), §3.3 (Fig. 17); [BSS16] (abstract);
[Lit19b] notation, Table 1, Fig. 1; [GSJ24] §2.1–2.6, §3.1, Fig. 2; [Gid+25] §4 and [Bom+22] (the gap); [RS16] (abstract).
Course-book support: N&C §10.6.2 (fault-tolerant π/8 gate).

| Unit | Title | Nodes | Visuals (recipes) |
|---|---|---|---|
| `b4-beyond-clifford` | Why Clifford is not enough | `clifford-not-universal`, `clifford-t-universal`, `t-count` | R-B4-1 |
| `b4-pbc` | Programs as Pauli rotations and measurements | `pauli-rotation`, `controlled-pauli`, `measurement-clifford-identity`, `pbc` | R-B4-3, R-B4-7 |
| `b4-injection` | Teleporting a T gate | `magic-state`, `t-injection`, `adaptive-feedforward` | R-B4-1, R-B4-2 |
| `b4-distill` | Distillation: fifteen in, one out | `distillation-15-to-1`, `t-factory` | R-B4-4 |
| `b4-cultivate` | Cultivation and post-selection | `postselection`, `expected-attempts`, `cultivation` | R-B4-5 |
| `b4-synthesis` | Any angle from T gates | `rotation-synthesis` | R-B4-6 |

Engine/visual needs: single-qubit Clifford orbit of T\|+⟩ (24 Cliffords), state-vector checks of injection and Eq. (10)
on ≤ 3 qubits (existing `physics/qc/circuit.ts`), a symplectic PBC compiler (commute Cliffords through Pauli rotations;
new), exact 15-to-1 output error by enumerating 2¹⁵ patterns (new), A.6 attempt arithmetic; new kind `pauli-program`;
existing `bloch`, `circuit`, `amplitudes`, `plot`.

## (c) The paper lecture — units mapped to paper sections

Nine units, both tracks; every displayed number is either computed (engine + numpy twin) or a `reported` claim (R3)
listed in `reported.md`.

| Unit | Title | Paper sections | Nodes taught | Visuals (recipes) | Key reported items |
|---|---|---|---|---|---|
| `tdg-criteria` | Why a new architecture | Abstract, §1, §1.1, §5 (yield) | `ft-architecture-criteria`, `fabrication-yield` | R-P-1, R-P-19 | Fig. 1b points; yield 2 in 5 and 1 in 5 |
| `tdg-modules` | Modules and the instruction set | §1.2, Fig. 2, Table 1 | `module-components`, `pivot-qubit`, `bicycle-instructions` | R-P-2, R-P-13 (Fig. 2c style program) | f in Table 1 |
| `tdg-gross` | The gross code on a torus | §2.1, App. A.1, Figs. 3, 11, 12 | `zx-duality`, `bb-logical-basis` | R-P-3, R-P-4 | logical counts of Fig. 12 |
| `tdg-idle-shift` | Idling and shifting | §2.2, App. A.2, Fig. 4, Eqs. 37–38 | `bell-check`, `shift-instructions` | R-B2-7, R-P-5, R-P-10 | — (all computed) |
| `tdg-lpu` | The logical processing unit | §2.3, App. A.3–A.5, Fig. 5 | `lpu`, `lpu-modes`, `edge-colouring`, `deformed-schedule` | R-P-6, R-P-7, R-P-8 | kept-cycle choices; 9C + b |
| `tdg-between` | Between modules, and T injection | §2.4, §2.5, App. A.6, Figs. 6, 13, 14, Tables 3, 5 | `bell-coupler`, `inter-module-measurement`, `code-factory-adapter`, `t-injection-instruction` | R-P-9, R-P-21 | Table 3, Table 5 |
| `tdg-benchmark` | How well it works | §2.6, §2.7, App. A.7, A.8, Fig. 7, 15, Tables 2, 4, 6, 8 | `failure-spectrum`, `entropy-of-logicals`, `instruction-benchmarks` | R-P-11, R-P-12, R-P-22 | Table 6 fits, Tables 4, 8, MC points |
| `tdg-compile` | Compiling to bicycle instructions | §3.0–3.4, App. A.9, Fig. 8, 9, Eqs. 1–24 | `diagram-calculus`, `distribute-across-modules`, `native-measurements`, `measurement-synthesis`, `small-angle-compile` | R-P-13, R-P-14, R-P-15, R-P-5 | Fig. 9 histogram and means |
| `tdg-bill` | The bill: what it costs end to end | §4, §5, App. A.10, Figs. 10, 16, 17, Tables 9, 10 | `resource-model`, `capability-estimate`, `surface-code-architecture-model`, `product-formula`, `tfim-workload`, `bb-family-scaling` | R-P-16, R-P-17, R-P-18, R-P-20 | bicycle N_T, Table 9 counts |

Each unit's beats carry R5 trail entries for the references in its rows of `references.md` (e.g. `tdg-lpu` → [WY24]
Algorithm 1, [Cro+24] §3.6/Thm 24, [SJY24] Def. 1–2).

## (d) Dependency and build order

```
existing 448 / 709 units
        │
   Q19 ─┴─► Q20 ─► B1 ─┬─► B2 ─► B3 ─┐
                       │             ├─► paper lecture (tdg-*)
                       └──► B4 ◄─────┘   (B4 needs B3 only in b4-injection; plan B4 with B2, build after B3)
```

1. **Now (R9, in parallel):** QEC engine; Papers platform (spec, recipe registry, `reported` claim type); Q19/Q20 plan;
   specs for the five new stage kinds below (one `10-stage-kind` brief each, or one combined brief).
2. **Q19, then Q20** (709 builds; their engine needs are already in the QEC engine).
3. **B1** (needs `code-lattice`, `spacetime`, log–log `plot`).
4. **B2** and **B4 units 1–2** may run in parallel after B1 (B2 needs `bits` bitmap; B4 needs `pauli-program`).
5. **B3** after B2 (needs `surgery-graph`); then **B4 units 3–6** (injection uses B3's product measurement).
6. **Paper lecture** last (needs `module-map` and every kind above); one truth review per batch (B1–B2, B3–B4, paper),
   each review re-reading every `reported` value against the page image (R3).

New stage kinds (specs in `recipes.md`): `code-lattice`, `spacetime`, `surgery-graph`, `pauli-program`, `module-map`.
Extensions: `plot` (log x axis, point and reported-overlay series, bars), `bits` (bitmap view; up to 12 rows/columns in
the grid views), `matrix` tableau (strings up to 9 letters for small-code stabilizer tables), `bloch` (a set of marked
points for Clifford orbits, if not already possible).
