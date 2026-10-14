# Prerequisite graph — *Tour de gross* (paper-tdg)

Readable view of `prereq-graph.json` (the JSON is the source of truth; this file was generated from the same data).
146 concept nodes, 28 paper sections. Every node has exactly one home (`taught_in`); a dependency never
points to a later home (order: existing 448/709 units → Q19 → Q20 → B1 → B2 → B3 → B4 → paper). Existing unit ids were
checked against `app/src/content/L*.ts` and `app/src/content/qc709/*.ts` on 2026-10-14.

## Homes at a glance

| Home | Nodes |
|---|---|
| existing | 33 |
| Q19 | 11 |
| Q20 | 11 |
| B1 | 19 |
| B2 | 14 |
| B3 | 11 |
| B4 | 16 |
| paper | 31 |

## existing — an existing unit of Spin Lab 448 (content/L*.ts) or Physics 709 (content/qc709/*.ts); the id is the unit id

| Node | Name | Depends on | Taught in | Hint |
|---|---|---|---|---|
| `complex-phase` | Phases as turns — A complex number of size one is a turn e^{iθ}; multiplying two of them adds their angles. | — | f1-euler |  |
| `bloch-sphere` | The Bloch sphere — Every pure qubit state is a point on a sphere, fixed by two angles. | complex-phase | q3-bloch |  |
| `pauli-matrices` | Pauli matrices — X flips 0 and 1, Z flips the sign of 1, Y does both; each squares to the identity. | complex-phase | q3-spin-operators |  |
| `commutator` | Commutators and anticommutators — AB − BA and AB + BA measure whether order matters; two different Pauli matrices anticommute. | pauli-matrices | q3-uncertainty |  |
| `eigen` | Eigenvalues and eigenvectors — Directions a matrix only stretches, and the stretch factors. | — | f4-eigen |  |
| `unitary` | Unitary operators — Maps that keep every length; quantum gates and time evolution are unitary. | eigen | f4-unitary |  |
| `commuting-shared-basis` | Commuting observables share eigenvectors — If two Hermitian matrices commute they can be measured together: they have a common eigenbasis. | eigen | f4-commuting |  |
| `projective-measurement` | Projective measurement and the Born rule — Measuring an observable leaves the state in one eigenspace, with chance equal to the squared overlap. | eigen | q3-born |  |
| `qubit` | The qubit — A two-level quantum system: the unit of quantum information. | bloch-sphere | q4-qubit |  |
| `one-qubit-gates` | One-qubit gates — H, S, T and the rotations R_z(θ) turn the Bloch sphere; T is a π/4 turn about z up to a phase. | qubit, pauli-matrices, unitary | q4-one-qubit-gates |  |
| `register` | Registers — n qubits together need 2ⁿ amplitudes, the reason quantum states are hard to store classically. | qubit | q4-registers |  |
| `cnot` | CNOT — Flips the target qubit when the control is 1; the basic two-qubit gate. | register | q4-cnot |  |
| `circuit-diagram` | Circuit diagrams — Wires are qubits, time runs to the right, boxes are gates and meters. | cnot, one-qubit-gates | q4-circuits |  |
| `readout` | Reading a register — Measuring some or all qubits in the 0/1 basis, possibly in the middle of a circuit. | projective-measurement, register | q4-measure |  |
| `phase-kickback` | Phase kickback — A controlled gate whose control starts in |+⟩ writes the target's eigenvalue onto the control's phase. | cnot, one-qubit-gates | q5-oracle |  |
| `tensor-operators` | Operators on several qubits — A ⊗ B acts on a pair; a Pauli string such as X⊗Z⊗I acts letter by letter. | pauli-matrices | q6-tensor |  |
| `bell-states` | Bell states — The four maximally entangled two-qubit states, e.g. (|00⟩ + |11⟩)/√2. | tensor-operators, cnot | q6-bell-basis |  |
| `stabilizer-of-state` | Stabilizers of a state — An operator that leaves a state exactly unchanged; XX and ZZ both fix (|00⟩ + |11⟩)/√2. | bell-states, eigen | q6-parities |  |
| `ghz` | GHZ states — (|0…0⟩ + |1…1⟩)/√2: all qubits agree in Z, and the product of X on every qubit is +1. | bell-states | q7-ghz |  |
| `commuting-pauli-products` | Commuting Pauli products — Products of Pauli matrices that commute can all have definite values at once. | ghz, commutator | q7-observables |  |
| `teleportation` | Teleportation — A shared Bell pair, a Bell measurement and a Pauli fix-up chosen by the outcomes move a qubit state. | bell-states, readout | q11-teleport-circuit |  |
| `mixed-state` | Mixed states — A probabilistic mixture of states, described by a density matrix. | projective-measurement | q8-mixed |  |
| `channel` | Noise channels — The general way an open system changes a state, written with Kraus operators. | mixed-state | q13-from-unitary |  |
| `depolarizing` | Depolarizing noise — With probability p a qubit suffers a random Pauli error; the Bloch ball shrinks. | channel, pauli-matrices | q13-depolarizing |  |
| `no-cloning` | No cloning — No machine copies an unknown quantum state, so plain backup copies are impossible. | unitary | q13-no-cloning |  |
| `probability` | Probability — Chances over a list of outcomes that add to one. | — | f5-probability |  |
| `binomial` | The binomial distribution — The chance of exactly w successes in N independent tries of chance q is C(N,w) q^w (1 − q)^{N−w}. | probability | f5-spread |  |
| `xor` | XOR — Adding bits without carrying: 1 ⊕ 1 = 0. | — | f7-xor |  |
| `gf2-linear-algebra` | Linear algebra over bits — Row reduction, rank, kernel and check matrices with arithmetic mod 2; a check matrix turns an error into a syndrome. | xor | f7-gf2 |  |
| `cost-scaling` | Counting cost — Polynomial versus exponential growth of resources with problem size. | — | f7-cost |  |
| `clock-arithmetic` | Clock arithmetic — Counting mod ℓ: positions wrap around, as on a clock face or a torus. | — | f8-clock |  |
| `period-finding` | Period finding — The quantum step of factoring, the classic motivating application. | — | q18-order |  |
| `hamiltonian-evolution` | Hamiltonians generate evolution — Waiting a time t applies e^{−iHt}, built from the Hamiltonian H. | unitary | l11-generator |  |

## Q19 — 709 chapter planned from Bergou Ch. 9 (QEC conditions, CSS codes; decoherence-free subspaces not needed here)

| Node | Name | Depends on | Taught in | Hint |
|---|---|---|---|---|
| `qec-why` | Why protecting qubits is hard — Errors are continuous, copies are forbidden and looking disturbs the state, yet redundancy is still possible through entanglement. | no-cloning, channel | Q19 | Bergou §9.1 |
| `repetition-code` | Bit-flip and phase-flip codes — Spread one qubit over three; the parities Z₁Z₂ and Z₂Z₃ locate a flip without reading the data. | qec-why, stabilizer-of-state, xor | Q19 | Bergou §9.1, Problem 9.1 |
| `logical-qubit` | Logical qubits — A qubit stored in a protected subspace of many physical qubits. | repetition-code | Q19 | Bergou §9.1 |
| `syndrome` | Syndromes — The pattern of check outcomes an error causes; it names the error without revealing the data. | repetition-code, gf2-linear-algebra | Q19 | Bergou §9.1–9.2 |
| `error-discretization` | Discrete errors suffice — Correcting X, Z (and so Y) on a qubit corrects every error on it. | repetition-code, pauli-matrices, depolarizing | Q19 | Bergou §9.1 |
| `shor-code` | The Shor code — Nine qubits protecting one against any single-qubit error: a phase-flip code of bit-flip codes. | repetition-code, error-discretization | Q19 | Bergou §9.1 |
| `qec-conditions` | Error-correction conditions — A code corrects a set of errors exactly when those errors cannot tell code states apart (Knill–Laflamme). | error-discretization | Q19 | Bergou §9.1 |
| `classical-linear-code` | Classical linear codes — Codewords form the kernel of a check matrix; distance is the lightest non-zero codeword; every code has a dual. | gf2-linear-algebra | Q19 | Bergou §9.2 |
| `nkd` | [[n, k, d]] notation — n physical qubits, k logical qubits, distance d; such a code corrects any ⌊(d − 1)/2⌋ errors. | shor-code, classical-linear-code | Q19 | Bergou §9.2 |
| `css-code` | CSS codes — X-type checks from one classical code and Z-type checks from another; they commute when the two check matrices are orthogonal. | classical-linear-code, shor-code | Q19 | Bergou §9.2 |
| `steane-code` | The Steane code — The [[7,1,3]] CSS code built from the Hamming code. | css-code | Q19 | Bergou §9.2 |

## Q20 — 709 chapter planned from Bergou Ch. 10 (stabilizer formalism, Gottesman–Knill)

| Node | Name | Depends on | Taught in | Hint |
|---|---|---|---|---|
| `pauli-group` | The Pauli group — Strings of I, X, Y, Z on n qubits with phases ±1, ±i; any two strings either commute or anticommute. | tensor-operators, commutator | Q20 | Bergou §10.1 |
| `symplectic-pauli` | Paulis as bit vectors — Up to phase a Pauli string is a pair of bit vectors (x|z); two strings anticommute when the symplectic product is 1. | pauli-group, gf2-linear-algebra | Q20 | Bergou §10.1 (check matrix) |
| `stabilizer-group` | Stabilizer groups and codes — A commuting group of Pauli strings without −I; the code is the space all of them fix. | pauli-group, stabilizer-of-state, commuting-shared-basis | Q20 | Bergou §10.1 |
| `check-matrix` | Generators and the check matrix — Independent generators are rows of a binary matrix; n qubits and r independent generators leave k = n − r logical qubits. | stabilizer-group, symplectic-pauli | Q20 | Bergou §10.1, Theorems 1–2 |
| `logical-operators` | Logical operators — Pauli strings that commute with every stabilizer but are not stabilizers; they act on the stored qubits. | stabilizer-group | Q20 | Bergou §10.1–10.2; N&C §10.5.5 |
| `code-distance` | Code distance — The weight of the lightest logical operator: the fewest qubit errors that can change the stored data unseen. | logical-operators, nkd | Q20 | N&C §10.5.5 |
| `css-stabilizer` | CSS codes as stabilizer codes — A CSS code has X-type and Z-type generators; all logical qubits can be prepared in |0⟩ or |+⟩ and read out qubit by qubit. | css-code, stabilizer-group | Q20 | Bergou §10.1; N&C §10.5.6 |
| `clifford-group` | The Clifford group — Unitaries that map Pauli strings to Pauli strings under conjugation; generated by H, S and CNOT. | pauli-group, one-qubit-gates, cnot | Q20 | Bergou §10.2 (normalizer) |
| `stabilizer-measurement-update` | Measuring a Pauli on a stabilizer state — A commuting Pauli gives a fixed outcome; an anticommuting one gives a coin flip and replaces one generator. | stabilizer-group, projective-measurement | Q20 | Bergou §10.2 |
| `gottesman-knill` | Gottesman–Knill — Circuits of Clifford gates and Pauli measurements on stabilizer states can be simulated efficiently by a classical computer. | clifford-group, stabilizer-measurement-update, register | Q20 | Bergou §10.3–10.4 |
| `syndrome-extraction-circuit` | Measuring a check with an ancilla — Prepare one ancilla in |+⟩, apply controlled-Paulis to the check's qubits, read the ancilla in X. | phase-kickback, stabilizer-group, syndrome | Q20 | Bergou §10.2; N&C §10.5.8 |

## B1 — Papers background chapter: the surface code as a fault-tolerant memory

| Node | Name | Depends on | Taught in | Hint |
|---|---|---|---|---|
| `ft-motivation` | Why fault tolerance — Useful algorithms need billions of operations, so logical errors must be pushed far below what any physical part achieves. | qec-why, cost-scaling | B1 | b1-why |
| `tanner-graph` | Tanner graphs — A two-coloured graph with one node per qubit and per check, joined when the check acts on the qubit. | check-matrix | B1 | b1-toric |
| `toric-code` | The toric code — Qubits on the edges of a grid on a torus, X checks on vertices and Z checks on faces, each of weight 4. | css-stabilizer, tanner-graph, clock-arithmetic | B1 | b1-toric |
| `homology-logicals` | Logicals as loops — On the torus the logical operators are strings that wrap around; two independent directions give two logical qubits. | toric-code, logical-operators | B1 | b1-toric |
| `planar-surface-code` | The planar surface code — Cutting the torus open with two kinds of boundary leaves one logical qubit, whose operators run boundary to boundary. | toric-code, homology-logicals | B1 | b1-planar |
| `rotated-surface-code` | The rotated surface code — The compact layout with d² data and d² − 1 check qubits, about 2d² in all, for distance d. | planar-surface-code, code-distance | B1 | b1-planar |
| `surface-code-patch` | Surface-code patches — One logical qubit stored as a rotated surface-code tile; the unit of surface-code architectures and magic-state factories. | rotated-surface-code | B1 | b1-planar |
| `syndrome-cycle` | Syndrome cycles — One round that measures every check through its check qubit, with the gates ordered so that checks do not disturb each other. | syndrome-extraction-circuit, tanner-graph | B1 | b1-cycle |
| `circuit-noise` | Circuit-level noise — Every preparation, gate, idle and measurement can fail with probability of order p. | depolarizing, syndrome-cycle | B1 | b1-cycle |
| `phenomenological-noise` | Phenomenological noise — A simpler model with only data-qubit errors and flipped check outcomes between perfect rounds. | syndrome-cycle | B1 | b1-cycle |
| `detector` | Detectors in space-time — The parity of a check in two consecutive rounds; a change marks an error event at a point in space and time. | phenomenological-noise, syndrome | B1 | b1-spacetime |
| `decoder` | Decoders — An algorithm that turns detector events into a correction; it fails when error and correction together form a logical operator. | detector, logical-operators | B1 | b1-spacetime |
| `matching-decoder` | Matching decoders — For surface codes, pair up detection events by the lightest connecting chains (minimum-weight perfect matching). | decoder, toric-code | B1 | b1-spacetime |
| `pauli-frame` | Pauli frames — Corrections and measurement fix-ups are Paulis, so they can be tracked in software instead of applied. | decoder, teleportation | B1 | b1-spacetime |
| `circuit-distance` | Circuit distance — The fewest circuit faults that leave no trace in the detectors yet change the logical result; at most the code distance. | circuit-noise, code-distance, detector | B1 | b1-threshold |
| `fault-tolerance` | Fault tolerance — Gadgets built so that a few faults cause only a few correctable errors; the threshold theorem follows. | circuit-noise, code-distance | B1 | b1-threshold (alt: Q19/Q20 if N&C §10.6 is pulled in) |
| `threshold` | Thresholds — Below a critical physical error rate, making the code larger suppresses logical errors exponentially. | fault-tolerance, decoder | B1 | b1-threshold (alt: Q19/Q20 if N&C §10.6.4 is pulled in) |
| `logical-error-scaling` | Logical error rate vs distance — Per cycle, the logical error rate falls like (p/p_th) raised to about d/2. | threshold, circuit-distance | B1 | b1-threshold |
| `surface-code-memory` | Surface-code memory — Repeating syndrome cycles and decoding keeps a logical qubit alive; its cost is about 2d² qubits per logical qubit. | syndrome-cycle, decoder, surface-code-patch | B1 | b1-threshold |

## B2 — Papers background chapter: quantum LDPC codes and bivariate bicycle codes

| Node | Name | Depends on | Taught in | Hint |
|---|---|---|---|---|
| `qldpc-code` | Quantum LDPC codes — Every check touches a few qubits and every qubit a few checks, however large the code. | tanner-graph, css-stabilizer | B2 | b2-ldpc |
| `code-rate` | Code rate — k/n, the fraction of qubits that carry data; the surface code's rate falls like 1/(2d²). | nkd, rotated-surface-code | B2 | b2-ldpc |
| `bpt-bound` | The Bravyi–Poulin–Terhal bound — Codes with local checks in a plane obey kd² ≤ const·n, so high rate and distance need longer connections. | code-rate, qldpc-code | B2 | b2-bpt |
| `long-range-connectivity` | Long-range connectivity — Couplers that reach beyond nearest neighbours, e.g. two planar layers, allow codes beyond the bound. | bpt-bound | B2 | b2-bpt |
| `polynomial-ring` | Polynomials on a torus — Sums of monomials xⁱyʲ with 0/1 coefficients and x^ℓ = y^m = 1: shift patterns on an ℓ × m torus; the transpose inverts exponents. | clock-arithmetic, gf2-linear-algebra | B2 | b2-polynomials |
| `bb-code` | Bivariate bicycle codes — Two polynomials A and B give X checks [A|B] and Z checks [Bᵀ|Aᵀ], which commute because AB = BA. | polynomial-ring, css-stabilizer, qldpc-code | B2 | b2-polynomials |
| `bb-k-formula` | Counting logical qubits of a BB code — k = n − rank H_X − rank H_Z, which equals twice the dimension shared by the kernels of A and B. | bb-code, check-matrix | B2 | b2-polynomials |
| `bb-torus-layout` | BB codes as a toric code with long edges — Unit cells of two qubits and two checks on a torus: short edges give the toric code, two long edges per check give the rest. | bb-code, toric-code | B2 | b2-gross |
| `gross-code` | The gross and two-gross codes — The [[144,12,12]] and [[288,12,18]] BB codes: 12 logical qubits in 288 or 576 physical qubits including check qubits. | bb-k-formula, bb-torus-layout, code-distance | B2 | b2-gross |
| `syndrome-cycle-bb` | The BB syndrome cycle — A depth-8 cycle measures every check of a BB code; C cycles take 8C + 1 steps. | syndrome-cycle, bb-code | B2 | b2-gross |
| `code-automorphism` | Automorphisms as logical gates — A permutation of qubits that maps the checks onto the checks performs a logical gate; for CSS codes it is a CNOT circuit. | logical-operators, cnot, stabilizer-group | B2 | b2-automorphisms |
| `shift-automorphism` | Shift automorphisms — Translating every qubit of a BB code across the torus maps the code to itself. | code-automorphism, bb-torus-layout | B2 | b2-automorphisms |
| `bp-decoding` | Belief propagation and OSD — Messages on the Tanner graph estimate which qubits erred; degeneracy can stall them, and ordered-statistics post-processing finishes the job. | decoder, tanner-graph, probability | B2 | b2-decoding |
| `relay-bp` | Relay-BP — BP with disordered memory terms and a relay of reruns: accurate enough for BB codes and small enough for real-time hardware. | bp-decoding | B2 | b2-decoding |

## B3 — Papers background chapter: measuring logical operators, from lattice surgery to gauging

| Node | Name | Depends on | Taught in | Hint |
|---|---|---|---|---|
| `logical-pauli-measurement` | Measuring a logical operator — Learn the ±1 value of one logical Pauli while disturbing nothing else stored. | logical-operators, stabilizer-measurement-update | B3 | b3-logical-measure |
| `pauli-product-measurement` | Pauli product measurements — Measure a product such as X̄⊗X̄ of two logical qubits without measuring either factor. | logical-pauli-measurement, commuting-pauli-products | B3 | b3-logical-measure |
| `code-deformation` | Code deformation — Change the checks for a while; the stored data survive if the distance stays large throughout. | logical-pauli-measurement, code-distance | B3 | b3-surgery |
| `lattice-surgery` | Lattice surgery — Merge two surface-code patches along a seam for d rounds: the product of the new seam checks is the joint logical parity; then split. | code-deformation, surface-code-patch, pauli-product-measurement | B3 | b3-surgery |
| `graph-cycle-basis` | Cycles of a graph — A connected graph with V vertices and E edges has E − V + 1 independent cycles; a cycle basis lists them. | gf2-linear-algebra, tanner-graph | B3 | b3-gauging |
| `gauging-measurement` | Gauging measurement — Attach a graph whose vertices sit on the logical's support: new edge qubits start in |0⟩, vertex checks multiply to the logical, cycle checks keep the code consistent. | lattice-surgery, graph-cycle-basis, code-deformation, pauli-frame | B3 | b3-gauging |
| `expansion` | Expansion keeps the distance — If every set of vertices has enough edges leaving it (Cheeger constant ≥ 1, or relative expansion), the deformed code keeps distance d. | gauging-measurement | B3 | b3-distance |
| `subsystem-code` | Subsystem codes — Codes with gauge operators that need not be fixed; the stabilizers are the gauge elements that commute with all others. | stabilizer-group, logical-operators | B3 | b3-distance |
| `space-time-like-errors` | Space-like and time-like failures — A measurement fails by corrupting the stored data or by flipping its own outcome; enough rounds (about d) guard the second. | gauging-measurement, detector, circuit-distance, subsystem-code | B3 | b3-distance |
| `bridge-system` | Bridges — Extra qubits and checks that join two measurement graphs so that a product of logicals is measured as one operation. | gauging-measurement, pauli-product-measurement | B3 | b3-bridges |
| `adapter` | Adapters between codes — A bridge built to join measurement graphs of different codes, keeping distance through relative expansion. | bridge-system, expansion | B3 | b3-bridges |

## B4 — Papers background chapter: magic states and Pauli-based computation

| Node | Name | Depends on | Taught in | Hint |
|---|---|---|---|---|
| `clifford-not-universal` | Clifford gates are not enough — Because Clifford circuits are classically simulable, a quantum computer needs at least one more gate. | gottesman-knill | B4 | b4-beyond-clifford |
| `clifford-t-universal` | Clifford + T is universal — Adding the T gate lets circuits approximate any unitary as closely as wanted. | clifford-not-universal, one-qubit-gates | B4 | b4-beyond-clifford |
| `t-count` | T count — The number of T gates in a circuit, the main cost of a fault-tolerant computation. | clifford-t-universal, cost-scaling | B4 | b4-beyond-clifford |
| `pauli-rotation` | Pauli rotations — P(φ) = exp(iφP/2) for a Pauli string P; a quarter turn is a Clifford gate, an eighth turn is T-like. | pauli-group, clifford-group | B4 | b4-pbc |
| `controlled-pauli` | Controlled Paulis from rotations — A Pauli controlled by another Pauli is three quarter-turn Pauli rotations. | pauli-rotation, cnot | B4 | b4-pbc |
| `measurement-clifford-identity` | Measurements absorb Clifford rotations — After measuring R, a quarter-turn rotation about an anticommuting Q acts like a measurement, and vice versa. | pauli-rotation, stabilizer-measurement-update | B4 | b4-pbc |
| `pbc` | Pauli-based computation — Push every Clifford gate to the end, leaving only Pauli rotations and Pauli measurements; the final Clifford just relabels outcomes. | pauli-rotation, clifford-group, pauli-product-measurement | B4 | b4-pbc |
| `magic-state` | Magic states — T|+⟩ and its Clifford images: states that, consumed by Clifford operations, give a non-Clifford gate. | one-qubit-gates, bloch-sphere, clifford-group | B4 | b4-injection |
| `t-injection` | T by state injection — Measure P⊗Z between data and a magic state, then X on the magic state: a T-like rotation about P, up to a Clifford fix-up half the time. | magic-state, pauli-product-measurement, teleportation, pauli-frame | B4 | b4-injection (alt: Q20 if N&C §10.6.2 is pulled in) |
| `adaptive-feedforward` | Real-time feed-forward — Later operations depend on earlier outcomes, so decoding and corrections must keep up with the machine. | t-injection, decoder | B4 | b4-injection |
| `distillation-15-to-1` | 15-to-1 distillation — Fifteen noisy magic states, checked with a 15-qubit code, give one with error about 35ε³. | magic-state, css-stabilizer, binomial | B4 | b4-distill |
| `postselection` | Post-selection — Discard a run whenever a check fires or the decoder is not confident (a small logical gap). | decoder, detector | B4 | b4-cultivate |
| `expected-attempts` | Expected attempts — If each try is kept with chance s, the mean number of tries is 1/s. | probability | B4 | b4-cultivate |
| `cultivation` | Magic-state cultivation — Inject a T state into a small colour code, check it repeatedly with Clifford measurements, grow it and move it into a surface code, discarding failures. | magic-state, steane-code, surface-code-patch, postselection | B4 | b4-cultivate |
| `t-factory` | T factories — A dedicated block that outputs T states at a given rate, error rate and qubit cost. | distillation-15-to-1, cultivation, expected-attempts | B4 | b4-distill |
| `rotation-synthesis` | Rotation synthesis — Any z-rotation is approximated to accuracy ε by Clifford and about 3·log₂(1/ε) T gates. | clifford-t-universal, t-count | B4 | b4-synthesis |

## paper — the paper lecture itself (units tdg-*)

| Node | Name | Depends on | Taught in | Hint |
|---|---|---|---|---|
| `ft-architecture-criteria` | Six criteria for an architecture — Fault-tolerant, addressable, universal, adaptive, modular and efficient. | fault-tolerance, adaptive-feedforward, t-factory, logical-pauli-measurement | paper | tdg-criteria |
| `fabrication-yield` | Fabrication yield — The chance a chip has no bad junction falls exponentially with its size, which favours small modules. | probability | paper | tdg-criteria |
| `module-components` | Modules and components — Code modules (code c plus LPU u), T-factory modules f, code–code adapters a and code–factory adapters a′. | gross-code, t-factory, adapter | paper | tdg-modules |
| `pivot-qubit` | The pivot qubit — Logical qubit 1 of each module, kept free as the ancilla through which everything else is done. | module-components | paper | tdg-modules |
| `zx-duality` | ZX-duality of BB codes — X(p, q) is logical exactly when Z(qᵀ, pᵀ) is, so X and Z logicals come in matched pairs. | bb-code, logical-operators | paper | tdg-gross |
| `bb-logical-basis` | The logical basis X̄₁, X̄₇, Z̄₁, Z̄₇ — Four weight-12 (gross) or weight-20 (two-gross) operators whose shifts give all 12 logical qubits, chosen to keep the LPU small. | gross-code, logical-operators, zx-duality, shift-automorphism | paper | tdg-gross |
| `bell-check` | Bell checks — A check split over two check qubits that share a Bell pair; its value is the parity of their two X readouts. | syndrome-extraction-circuit, bell-states | paper | tdg-idle-shift |
| `shift-instructions` | Shift instructions — Twelve hardware circuits move data through check qubits to shift the torus in 14 steps; together they reach all 36 logical shifts. | shift-automorphism, bb-logical-basis, syndrome-cycle-bb | paper | tdg-idle-shift |
| `lpu` | The logical processing unit — A fixed ancilla graph (90 or 158 qubits) attached to a module that measures any Pauli in ⟨X̄₁, Z̄₁, X̄₇, Z̄₇⟩. | gauging-measurement, bridge-system, expansion, bb-logical-basis, bell-check | paper | tdg-lpu |
| `lpu-modes` | LPU measurement modes — Half the LPU measures ⟨X̄₁, Z̄₇⟩ or ⟨X̄₇, Z̄₁⟩; the whole LPU, through its bridge, measures the other nine. | lpu | paper | tdg-lpu |
| `edge-colouring` | Scheduling by edge colouring — Colour the edges of a bipartite graph so no two at a node share a colour; each colour is one time step of gates. | tanner-graph | paper | tdg-lpu |
| `deformed-schedule` | Scheduling the deformed code — Ordering constraints keep parallel check measurement equivalent to sequential; colouring gives 12 steps per cycle, an integer program 9. | edge-colouring, syndrome-cycle-bb, lpu | paper | tdg-lpu |
| `bell-coupler` | Bell couplers — Hardware that makes a Bell pair between two modules in less than one syndrome cycle. | bell-states | paper | tdg-between |
| `inter-module-measurement` | Inter-module measurements — Bridges of neighbouring LPUs joined by Bell checks measure 36 two-module Pauli products. | lpu, bell-coupler, bridge-system, adapter | paper | tdg-between |
| `code-factory-adapter` | Code–factory adapter — Couplers wire a path of LPU vertex checks to the Z̄ of a surface-code factory, so any ⟨X̄₁, Z̄₁, X̄₇, Z̄₇⟩ ⊗ Z̄_T can be measured. | adapter, lpu, surface-code-patch, bell-coupler | paper | tdg-between |
| `t-injection-instruction` | The T-injection instruction — Make T|+⟩ in a factory, measure Z̄_T ⊗ P̄ with the pivot, read the factory in X; error and time add up. | t-injection, code-factory-adapter, t-factory | paper | tdg-between |
| `bicycle-instructions` | Bicycle instructions — The instruction set: 12 shifts, 15 in-module and 36 inter-module measurements, 6 T injections, plus the idle. | shift-instructions, lpu-modes, inter-module-measurement, t-injection-instruction | paper | tdg-modules |
| `failure-spectrum` | Failure spectrum — The fraction f(w) of w-fault sets that defeat the decoder; a binomial sum turns it into a logical error rate at any p. | binomial, circuit-noise, circuit-distance | paper | tdg-benchmark |
| `entropy-of-logicals` | Counting low-weight logicals — Two codes of equal distance differ in error rate by how many lightest logical operators they have. | failure-spectrum, code-distance | paper | tdg-benchmark |
| `instruction-benchmarks` | Benchmarking instructions — Each instruction gets a duration in time steps and a logical error rate per use under circuit noise. | failure-spectrum, bicycle-instructions, relay-bp, space-time-like-errors | paper | tdg-benchmark |
| `diagram-calculus` | Measurement-projection diagrams — A circuit notation in which Pauli fix-ups after measurements are implied rather than drawn. | pauli-frame, pauli-rotation, circuit-diagram | paper | tdg-compile |
| `distribute-across-modules` | Spreading a Pauli over modules — A GHZ state of pivots, made by ZZ measurements of neighbours, lets each module apply its own factor of a long Pauli. | phase-kickback, ghz, controlled-pauli, measurement-clifford-identity, pivot-qubit, diagram-calculus, stabilizer-measurement-update | paper | tdg-compile |
| `native-measurements` | Native measurements and rotations — Shifts of the 15 LPU measurements give 540 cheap measurements; quarter turns built from them generate the 11-qubit Clifford group. | shift-instructions, lpu-modes, clifford-group, pauli-rotation | paper | tdg-compile |
| `measurement-synthesis` | Synthesizing any in-module measurement — Conjugate a native measurement by a few native rotations; it costs about 18.5 bicycle measurements on average. | native-measurements, measurement-clifford-identity | paper | tdg-compile |
| `small-angle-compile` | Small angles on the pivot — A Ross–Selinger word becomes a chain of T injections whose bases adapt to earlier outcomes. | rotation-synthesis, t-injection-instruction, adaptive-feedforward, diagram-calculus | paper | tdg-compile |
| `resource-model` | The resource model — q = M(c + u + a) − a + a′ + f physical qubits for n = 11M data qubits; failure ≈ Σ (count × error rate) over instructions. | module-components, instruction-benchmarks | paper | tdg-bill |
| `capability-estimate` | Logical capability — The longest random π/4-rotation circuit that still succeeds with chance ≥ 2/3 on a given machine. | resource-model, pbc, t-count | paper | tdg-bill |
| `surface-code-architecture-model` | The surface-code baseline — Patches of 2d² qubits, half for routing, per-cycle error 0.03(p/0.01)^{d/2}, each rotation d cycles plus a factory wait. | logical-error-scaling, surface-code-patch, lattice-surgery, t-factory | paper | tdg-bill |
| `product-formula` | Product formulas — Split e^{−iHt} into short alternating steps of the Hamiltonian's commuting parts; fourth order keeps errors small. | hamiltonian-evolution, pauli-rotation | paper | tdg-bill |
| `tfim-workload` | The TFIM benchmark — A 10 × 10 transverse-field Ising evolution compiled to 184 000 small Pauli rotations. | product-formula, rotation-synthesis | paper | tdg-bill |
| `bb-family-scaling` | Larger BB codes — A conjectured family with the same A and B on bigger tori, whose kd²/n approaches 24 against 1 for the surface code. | gross-code, bpt-bound | paper | tdg-bill |

## Paper sections → the nodes they need

| Section | Pages | Needs |
|---|---|---|
| Abstract, §1 Introduction (`tdg-s1`) | pp. 1–4 | ft-motivation, surface-code-memory, qldpc-code, t-count, logical-qubit, bpt-bound, period-finding, long-range-connectivity |
| §1.1 Fault-tolerant architecture criteria (`tdg-s1-1`) | pp. 4–5 | ft-architecture-criteria, lattice-surgery, magic-state, decoder, relay-bp, qldpc-code, fabrication-yield |
| §1.2 The bicycle architecture (`tdg-s1-2`) | pp. 5–7 | module-components, bicycle-instructions, pivot-qubit, pauli-group, css-stabilizer, logical-operators, t-injection, pauli-product-measurement, shift-automorphism |
| §2 introduction (`tdg-s2`) | p. 8 | lattice-surgery, gauging-measurement, bridge-system, adapter |
| §2.1 Review of bivariate bicycle codes (`tdg-s2-1`) | pp. 8–9 | toric-code, css-stabilizer, tanner-graph, clock-arithmetic, bb-code, bb-torus-layout, gross-code, nkd |
| §2.2 Idles and shift automorphisms (`tdg-s2-2`) | pp. 9–11 | syndrome-extraction-circuit, syndrome-cycle-bb, bell-check, code-automorphism, shift-instructions, cnot, bell-states |
| §2.3 In-module measurements (`tdg-s2-3`) | pp. 11–12 | logical-pauli-measurement, code-deformation, gauging-measurement, bridge-system, lpu, lpu-modes, bell-check, clifford-group |
| §2.4 Inter-module measurements (`tdg-s2-4`) | pp. 12–14 | bell-coupler, bridge-system, adapter, inter-module-measurement, code-factory-adapter, phenomenological-noise, surface-code-patch |
| §2.5 T injections (`tdg-s2-5`) | pp. 14–15 | magic-state, t-injection, distillation-15-to-1, cultivation, postselection, surface-code-patch, t-factory, t-injection-instruction |
| §2.6 Benchmarking bicycle instructions (`tdg-s2-6`) | pp. 15–17 | circuit-noise, phenomenological-noise, circuit-distance, decoder, relay-bp, failure-spectrum, binomial, logical-error-scaling, entropy-of-logicals, instruction-benchmarks, space-time-like-errors |
| §2.7 Future directions (`tdg-s2-7`) | pp. 17–19 | lpu, bp-decoding, circuit-distance, long-range-connectivity |
| §3 Compiling to the bicycle architecture (`tdg-s3`) | pp. 20–21 | pauli-rotation, pbc, clifford-group, projective-measurement, pauli-frame, diagram-calculus |
| §3.1 Distributing operations across modules (`tdg-s3-1`) | pp. 21–23 | phase-kickback, ghz, stabilizer-measurement-update, controlled-pauli, measurement-clifford-identity, distribute-across-modules, pivot-qubit |
| §3.2 In-module Pauli measurement synthesis (`tdg-s3-2`) | pp. 23–25 | native-measurements, measurement-synthesis, clifford-group, shift-instructions, measurement-clifford-identity |
| §3.3 Small-angle rotations (`tdg-s3-3`) | pp. 25–26 | rotation-synthesis, t-injection, clifford-t-universal, adaptive-feedforward, small-angle-compile |
| §3.4 Future directions (`tdg-s3-4`) | pp. 26–27 | ghz, pbc, t-count |
| §4 End-to-end resource estimates (`tdg-s4`) | pp. 28–30 | resource-model, capability-estimate, surface-code-architecture-model, tfim-workload, product-formula, logical-error-scaling, t-factory |
| §5 Conclusions and opportunities (`tdg-s5`) | pp. 31–33 | fabrication-yield, bb-family-scaling, bpt-bound, code-rate, ft-architecture-criteria |
| App. A.1 Logical code bases (`tdg-a1`) | pp. 43–46 | polynomial-ring, bb-code, logical-operators, zx-duality, bb-logical-basis, bp-decoding |
| App. A.2 Shift automorphisms (`tdg-a2`) | pp. 46–47 | shift-automorphism, shift-instructions, gf2-linear-algebra, cnot, bb-logical-basis |
| App. A.3 Logical processing units (`tdg-a3`) | pp. 48–51 | gauging-measurement, graph-cycle-basis, expansion, bridge-system, bell-check, lpu |
| App. A.4 Logical measurement protocols (`tdg-a4`) | pp. 51–54 | gauging-measurement, stabilizer-measurement-update, pauli-frame, lpu-modes, inter-module-measurement, code-factory-adapter |
| App. A.5 Circuit scheduling (`tdg-a5`) | pp. 54–57 | syndrome-cycle-bb, tanner-graph, edge-colouring, deformed-schedule |
| App. A.6 Cultivation cost estimates (`tdg-a6`) | pp. 57–58 | cultivation, postselection, expected-attempts, t-factory |
| App. A.7 Simulation of bicycle instructions (`tdg-a7`) | pp. 58–60 | failure-spectrum, binomial, detector, decoder, relay-bp, instruction-benchmarks |
| App. A.8 Distance validation (`tdg-a8`) | pp. 60–63 | code-distance, space-time-like-errors, subsystem-code, symplectic-pauli, circuit-distance, bp-decoding |
| App. A.9 Pauli-based computation (`tdg-a9`) | p. 64 | pbc, clifford-group, pauli-rotation |
| App. A.10 Logical capability comparison (`tdg-a10`) | pp. 65–68 | surface-code-architecture-model, logical-error-scaling, tfim-workload, product-formula, hamiltonian-evolution, resource-model, capability-estimate |

## Leaf goals

Nodes no other node or section depends on (taught for completeness of their unit): qec-conditions, matching-decoder.
