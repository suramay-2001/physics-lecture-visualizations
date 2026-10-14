# Digest — *Tour de gross* (paper-tdg)

Yoder, Schoute, Rall, Pritchett, Gambetta, Cross, Carroll and Beverland (IBM Quantum), *Tour de gross*,
arXiv:2506.03094v1, June 2025, 68 pages. Source id `paper-tdg` (`pipeline/course.papers.json`); the PDF and its
extraction stay in the git-ignored `sources/paper-tdg/`.

Written by role P (research verifier), 2026-10-14, from the extracted text and, on every figure and table page, the page
image. Everything below is our own paraphrase; numbers are cited by table, figure, equation or page. Page numbers are the
paper's printed page numbers (they equal the PDF page numbers). Reference keys (`[Bra+24]` …) are the paper's own; what we
did with each one is in `references.md`. Concept ids in `code font` are nodes of `prereq-graph.json`.

How to read each entry: **Claim** (what the section establishes), **Construction** (how), **Reader needs** (what must
already be known, as graph nodes), **Rests on** (figures, tables, equations, pages), **Leans on** (citations the step
uses).

---

## Abstract and §1 Introduction (pp. 1–4)

- **Claim.** A modular fault-tolerant design, the *bicycle architecture*, built on two bivariate bicycle (BB) codes
  ([[144,12,12]] "gross" and [[288,12,18]] "two-gross"), runs logical circuits about ten times larger than a
  surface-code machine with the same number of physical qubits and the same physical error rate.
- **Construction.** Long-range couplers inside a module make a quantum LDPC code possible; long-range couplers between
  modules make the machine modular. Fig. 1b places each design on a plane of (logical qubits, logical T count) for
  q ∈ {5k, 50k, 500k} physical qubits and p ∈ {10⁻³, 10⁻⁴}; the headline example is a 10 × 10 transverse-field Ising
  model (TFIM) on about 8k physical qubits if p ≈ 7 × 10⁻⁴ (p. 3).
- **Reader needs.** `ft-motivation`, `surface-code-memory`, `qldpc-code`, `t-count`, `logical-qubit`.
- **Rests on.** Fig. 1a (schematic: modular long-range hardware vs monolithic 2-D), Fig. 1b (capability ellipses, from
  Fig. 10a); p. 4 remarks on modules under 1000 qubits and a 98.8 % remote state transfer over 0.6 m [Hey+25].
- **Leans on.** [Bra+24] (BB codes, the order-of-magnitude memory saving), [BPT10] (2-D local codes cannot be this
  efficient), [Sho96] (fault tolerance exists), [Mon+14; Bre+16; Bom+21] (modularity, context only).

## §1.1 Fault-tolerant architecture criteria (pp. 4–5)

- **Claim.** Six properties make an architecture a credible platform: fault-tolerant, addressable, universal,
  adaptive, modular, efficient. Surface-code designs meet the first five but are inefficient in physical-to-logical
  ratio; the bicycle architecture is argued to meet all six.
- **Construction.** Each criterion is matched to a mechanism: (i) BB codes with parallel syndrome circuits;
  (ii) generalized lattice surgery through an ancilla block per module, the *logical processing unit* (LPU);
  (iii) T states made in factory modules and teleported in; (iv) real-time decoding (Relay-BP [Mül+25]) on classical
  hardware; (v) surgery between codes in different modules; (vi) roughly 10× lower overhead [Bra+24].
- **Reader needs.** `ft-motivation`, `lattice-surgery`, `magic-state`, `decoder`, `bp-decoding`, `qldpc-code`.
- **Rests on.** Text only (pp. 4–5).
- **Leans on.** [Coh+22; Bra+24; Cro+24; WY24; SJY24] (logical measurement on LDPC codes), [GSJ24; BK05; Kni05]
  (T states), [Mül+25] (decoder), [Ter15] (adaptivity), [Lit19a] (surface-code baseline).

## §1.2 The bicycle architecture (pp. 5–7)

- **Claim.** The machine is a graph of modules — code modules (each a BB code c plus its LPU u), T-factory modules f,
  and adapters (code–code a, code–factory a′) — and it is programmed in a small instruction set whose costs are
  Table 2.
- **Construction.** Each code module stores 12 logical qubits labelled 1–12; qubit 1 is the *pivot*, kept as an ancilla
  for synthesis. The *bicycle instructions*: 12 shift automorphisms (six generators Ū₁…Ū₆ and inverses, each acting as
  Ū ⊗ Ū on qubits 1–6 and 7–12, a CNOT circuit; the generated group has 36 elements, each a product of at most two
  generators); 15 in-module measurements (the non-trivial elements of ⟨X̄₁, Z̄₁, X̄₇, Z̄₇⟩, read as the Hermitian
  products, footnote 1); 36 inter-module measurements (products from (⟨X̄₁, Z̄₇⟩ ∪ ⟨X̄₇, Z̄₁⟩)⊗2 across two connected
  modules); 6 T injections (make T|+⟩ in a factory, measure Z̄_T ⊗ P̄ with P̄ one of X̄, Ȳ, Z̄ on qubit 1 or 7, then
  measure X̄_T). CSS preparation of all 12 qubits in |0⟩ or |+⟩ and transversal X or Z readout are assumed free, as for
  the surface code [Lit19a].
- **Reader needs.** `module-components`, `bicycle-instructions`, `pivot-qubit`, `pauli-group`, `css-code`,
  `logical-operators`, `t-injection`, `pauli-product-measurement`.
- **Rests on.** Fig. 2a/b (linear and triangular module layouts), Fig. 2c (an example bicycle circuit with durations
  τ_M, τ_C, τ_T, τ_U), Table 1 (component qubit counts, p. 6), Table 2 (durations and logical error rates, p. 7).
- **Leans on.** [Lit19a] (free CSS prep/readout assumption).

## §2 introduction (p. 8)

- **Claim.** The section gives explicit circuits for every instruction on both codes; it is a concrete instance of the
  general *extractor* architecture of [He+25], with a smaller gross-code LPU than [Cro+24] and a new one for the
  two-gross code; modules talk through Bell pairs, as in the network model of [JGS25].
- **Reader needs.** `lattice-surgery`, `gauging-measurement`, `bridge-system`.
- **Leans on.** [Cro+24; WY24; Ide+24; SJY24; He+25].

## §2.1 Review of bivariate bicycle codes (pp. 8–9)

- **Claim.** BB codes generalize the toric code: on an ℓ × m torus of unit cells, each check gets two extra long-range
  edges, which raises rate and distance at the cost of non-planar wiring.
- **Construction.** A unit cell holds an L qubit, an R qubit, an X check and a Z check (Fig. 3a). Short edges reproduce
  the toric code (each check acts on four nearby qubits). Long edges: each X check also touches the L qubit at offset
  (a→, a↑) and the R qubit at (b→, b↑); each Z check touches the L qubit at −(b→, b↑) and the R qubit at −(a→, a↑), which
  keeps X and Z checks commuting. Both codes use (a→, a↑, b→, b↑) = (3, −1, −1, −3); ℓ × m = 12 × 6 (gross, 144 data
  qubits) or 12 × 12 (two-gross, 288). The toric-layout description covers only part of the BB family (footnote 2).
- **Reader needs.** `toric-code`, `css-code`, `tanner-graph`, `clock-arithmetic`, `bb-code`, `bb-torus-layout`.
- **Rests on.** Fig. 3 (unit cell; gross code on the torus with four sample long edges and the supports of X̄₁, X̄₇,
  Z̄₁, Z̄₇, p. 9), Fig. 11 (two-gross code, p. 44).
- **Leans on.** [KP13; PK21; Bra+24] (BB codes), [Kit03; Den+02] (toric code).

## §2.2 Idles and shift automorphisms (pp. 9–11)

- **Claim.** One syndrome cycle (the *idle* instruction) costs 8 timesteps on c = 4ℓm qubits; a *shift automorphism*
  (translating every qubit across the torus) is a logical CNOT circuit that costs 14 timesteps using only the idle's
  wiring.
- **Construction.** One check qubit per check; a check is measured by coupling it to its data qubits and reading it out
  (Fig. 4a). The schedule of [Bra+24] (Fig. 4b) interleaves X and Z checks so that C cycles take 8C + 1 timesteps. A
  *Bell check* splits a check over two check qubits sharing a Bell pair, lowering degree and depth (Fig. 4c). A shift
  moves every data qubit into an adjacent check qubit and on into another data position of the same type; the first
  hop can go along 6 edge directions and the second in 2 ways, giving 12 shift instructions. Swaps with |0⟩ ancillas
  cost 2 CNOTs each and the ancillas are measured for error detection: 4 CNOT layers + 2 measurements = 6, plus an
  8-step syndrome cycle = 14 timesteps. The automorphism group of BB codes is larger [ES24]; only shifts are used.
- **Reader needs.** `syndrome-extraction-circuit`, `syndrome-cycle`, `bell-check`, `code-automorphism`,
  `shift-automorphism`, `cnot`, `bell-states`.
- **Rests on.** Fig. 4 (p. 10), Table 2 rows I and U (p. 7).
- **Leans on.** [Bra+24] (depth-8 schedule, Fig. 4b), [GR13; ES24] (automorphisms as logical gates).

## §2.3 In-module measurements (pp. 11–12)

- **Claim.** An ancilla system of u = 90 (gross) or 158 (two-gross) qubits, the LPU, measures any Pauli in
  ⟨X̄₁, X̄₇, Z̄₁, Z̄₇⟩ fault-tolerantly; with the shifts this reaches the Clifford group on 11 of the 12 qubits.
- **Construction.** QLDPC surgery: deform the code for C syndrome cycles so that the target logical becomes a product of
  stabilizers, then return to the original code (C = 10 gross, 18 two-gross; the cost is roughly C deformed cycles plus
  one original cycle). The LPU has two halves: sets V_l, E_l, U_l (vertex checks, edge qubits, cycle checks) serve
  ⟨X̄₁, Z̄₇⟩ and V_r, E_r, U_r serve ⟨X̄₇, Z̄₁⟩; they share the Bell check v_Bell and are joined by bridge qubits B and
  bridge checks U_B, which are needed for operators such as Ȳ₁ that use both halves. Maximum connectivity degree 7.
- **Reader needs.** `logical-pauli-measurement`, `code-deformation`, `gauging-measurement`, `bridge-system`,
  `lpu`, `bell-check`, `clifford-group`.
- **Rests on.** Fig. 5 (LPU connectivity; degree census for gross and two-gross whose totals give u, p. 12).
- **Leans on.** [Coh+22; Cro+24; WY24; Ide+24; SJY24] (surgery), [Hor+12] (the surface-code ancestor), [He+25] (review;
  the LPU is a *partial extractor*, footnote 4).

## §2.4 Inter-module measurements (pp. 12–14)

- **Claim.** Bridges of neighbouring LPUs, joined by inter-module Bell pairs, measure any of 36 two-module Pauli
  products; a second kind of adapter lets a code module measure ⟨X̄₁, X̄₇, Z̄₁, Z̄₇⟩ ⊗ Z̄_T with a factory.
- **Construction.** A *Bell-coupler* makes (|00⟩ + |11⟩)/√2 across modules in under one syndrome cycle; bundles of O(d)
  couplers connect adjacent modules. The code–code adapter turns bridge qubits and bridge checks into Bell checks
  (a = 2|B| = 2(d − 1) = 22 or 34 qubits). The deformed distance falls to d − 1, but since d is even both still need the
  same minimum number of phenomenological faults to fool an optimal decoder (6 gross, 9 two-gross). The code–factory
  adapter instead couples the LPU's vertex checks, edge qubits and bridge to the support of Z̄_T in a surface-code
  factory and its neighbouring X checks (a′ = 2d_factory − 1 qubits). Degree stays ≤ 7.
- **Reader needs.** `bell-states`, `bell-coupler`, `bridge-system`, `adapter`, `inter-module-measurement`,
  `code-factory-adapter`, `phenomenological-noise`, `surface-code-patch`.
- **Rests on.** Fig. 6 (p. 13), Fig. 13 (adapter examples, p. 52), Fig. 14 (code–factory adapter, p. 53), Table 1
  columns a and a′.
- **Leans on.** [SJY24] (universal adapters), [Cro+24] (bridges), [JGS25] (Bell-pair network model).

## §2.5 T injections (pp. 14–15)

- **Claim.** A T state made in a surface-code factory is teleported into the pivot qubit by one inter-module measurement
  and one factory readout; P_T = P_factory + P_C and τ_T = τ̄_factory + τ_C + 1.
- **Construction.** Four factories (Table 3): cultivation [GSJ24] at p = 10⁻³ for both codes (output in a distance-15
  surface code), and 15-to-1 distillation [BK05] at p = 10⁻⁴, taken from two lines of [Lit19b, Table 1] (output in a
  distance-7 or distance-25 surface code; cycles × 6 timesteps per surface-code cycle). Cultivation checks a magic
  state with fault-tolerant Clifford measurements, grows it, and post-selects [CC19; Sho96]; it is cheap at small
  distance but does not scale.
- **Reader needs.** `magic-state`, `t-injection`, `distillation-15-to-1`, `cultivation`, `postselection`,
  `surface-code-patch`, `t-factory`.
- **Rests on.** Table 3 (p. 14), Table 5 and Eqs. (73)–(80) (App. A.6).
- **Leans on.** [GSJ24], [Lit19b], [BK05], [CC19].

## §2.6 Benchmarking bicycle instructions (pp. 15–17)

- **Claim.** Every instruction is a concrete circuit simulated under circuit noise; its logical error rate P_i
  (Table 2) comes from a two-parameter failure-spectrum fit that extrapolates Monte Carlo data to low p.
- **Construction.** Noise: preparations and measurements fail with probability p; idles suffer X, Y or Z with p/3 each;
  CNOTs one of 15 two-qubit Paulis with p/15 each. Decoder: Relay-BP [Mül+25]. *Circuit distance* d_circ = the fewest
  faults with trivial syndrome and non-trivial logical effect (decoder independent); *phenomenological distance*
  d_phenom counts only data and measurement errors, so d_phenom ≥ d_circ (Table 4). The failure spectrum f(w) (fraction
  of weight-w fault sets that fail) turns into P(q) by a binomial sum with q = p/15 (faults with weight 3p/15 are split
  into three independent q-faults); the ansatz f_ansatz vanishes below ⌈d_circ/2⌉ (from [Bev+25]). Fits use d_circ = 10
  (gross) and 18 (two-gross); C equals that bound. Remark: at p = 10⁻³ the two-gross idle extrapolates to about 10⁻²⁰
  against about 10⁻¹⁰ for a rotated d = 17 surface code (formula 0.1·(p/0.01)^(d/2)), plausibly because the two-gross
  code has far fewer minimum-weight logicals (336 weight-18 X logicals vs 875 178 in the d = 18 rotated toric code).
- **Reader needs.** `circuit-noise`, `phenomenological-noise`, `circuit-distance`, `decoder`, `bp-decoding`,
  `failure-spectrum`, `binomial`, `logical-error-scaling`, `entropy-of-logicals`.
- **Rests on.** Fig. 7 (P(p) and f(w) with fits, p. 16), Table 4 (p. 17), Table 2 (p. 7); App. A.7 Table 6 (fit
  parameters), Fig. 15 (p. 60).
- **Leans on.** [Mül+25], [Bev+25] (ansatz), [Fow+12; WFH11] (surface-code formula), [Bev+19] (rotated toric code
  count), [Vui+19; Cro+24; WY24] (distance of surgery), [IBM22] (CPLEX).

## §2.7 Future directions (pp. 17–19)

- **Claim.** A list of improvements: larger or parallel LPUs [Cow+25; He+25], lower connectivity [MBG23; ST25],
  syndrome schedules that reach the code distance, non-uniform noise, better inter-module instructions (their
  weight-11/17 logicals and the weight-2 checks that confuse BP), and checks of the low-error extrapolation; two stated
  assumptions (back-to-back logical measurements; initialization by the first measurement).
- **Reader needs.** `lpu`, `bp-decoding`, `circuit-distance`.
- **Rests on.** Text; Fig. 13b/c.

## §3 introduction (pp. 20–21)

- **Claim.** Any circuit of Clifford gates and Pauli rotations P(φ) = exp(iφP/2) can be compiled into bicycle
  instructions on a line of modules.
- **Construction.** Four steps (Fig. 8): (1) rewrite as Pauli-based computation [BSS16; Lit19a] (App. A.9); (2) spread
  rotations and measurements over modules (§3.1); (3) synthesize any in-module Pauli measurement (§3.2); (4) synthesize
  small-angle rotations on the pivot from T injections (§3.3). A diagram language (Eq. 1) marks unitaries, π/4 Pauli
  Clifford rotations, projective measurements and *measurement projections* (a measurement whose Pauli fix-up is
  applied implicitly by any Pauli that anticommutes with the measured one and stabilizes the prior state).
- **Reader needs.** `pauli-rotation`, `pbc`, `clifford-group`, `projective-measurement`, `pauli-frame`.
- **Rests on.** Fig. 8 (p. 20), Eq. (1) (p. 21).
- **Leans on.** [BSS16; Lit19a].

## §3.1 Distributing operations across data modules (pp. 21–23)

- **Claim.** An n-qubit Pauli measurement or rotation reduces to inter-module ZZ measurements of pivots plus one
  in-module operation per module, using M = ⌈n/11⌉ modules (11 data qubits each).
- **Construction.** Measure P with an ancilla and a controlled-P (Eq. 2); rotate by P(φ) with an ancilla, controlled-P
  and X(φ) (Eq. 3). Factor P = P₁ ⊗ … ⊗ P_M and spread the control over the pivots as a GHZ state (Eq. 4); prepare the
  GHZ state by ZZ measurements of neighbouring pivots (Eq. 5), leaving one local circuit per module (Eq. 6). Each
  controlled-P_i is three π/4 rotations about Z ⊗ P_i, Z and P_i (Eq. 7, from [Lit19a]); a π/4 rotation following a
  measurement of an anticommuting Pauli becomes a measurement (Eq. 10, [KBP23, Prop. 2.2]); so each module needs one
  Y ⊗ P_i measurement plus Clifford corrections that are pushed to the end (Eqs. 8–12). Footnote 8 trims modules on
  which P acts trivially.
- **Reader needs.** `phase-kickback`, `ghz`, `stabilizer-measurement-update`, `pauli-rotation`, `pauli-frame`,
  `controlled-pauli`, `measurement-clifford-identity`.
- **Rests on.** Eqs. (2)–(12), pp. 21–23 (diagram pages 22–23).
- **Leans on.** [Lit19a] (Eq. 7), [KBP23] (Eq. 10).

## §3.2 In-module Pauli measurement synthesis (pp. 23–25)

- **Claim.** Any Q ⊗ P_i (Q on the pivot) is measured by conjugating a *native* measurement with a sequence of *native*
  π/4 rotations; it costs on average about 18.5 bicycle measurements.
- **Construction.** Native measurements N = shifts of the 15 LPU measurements (Eq. 14): 540 of them for each code;
  native rotations = π/4 rotations about R whenever Q ⊗ R is native (Eq. 15), realized by three single-qubit pivot
  measurements around one native measurement (Eq. 16): 510 of them. Every X_i and Z_i is native and the native
  rotations generate the 11-qubit Clifford group [Cro+24], so any Q ⊗ P_i equals a native Q ⊗ R conjugated by
  R₁ … R_k (Eq. 17, a *quantum comb* [CDP08]). β counts bicycle measurements; the pivot basis Q is chosen to minimize it
  (Eq. 13). Fig. 9: β takes values 1, 7, 13, 19, 25; means 18.55/18.67 for a fixed Q and 18.48/18.58 after minimizing
  (gross/two-gross).
- **Reader needs.** `native-measurements`, `clifford-group`, `pauli-rotation`, `shift-automorphism`,
  `measurement-clifford-identity`.
- **Rests on.** Eqs. (13)–(18), Fig. 9 (p. 25).
- **Leans on.** [Cro+24] (native-measurement idea, Clifford generation), [CDP08].

## §3.3 Small-angle rotations (pp. 25–26)

- **Claim.** A rotation X(φ), Y(φ) or Z(φ) on the pivot is approximated by a sequence of T injections whose bases are
  chosen adaptively, with all Clifford corrections absorbed into the next measurement; φ = π/4 is exact.
- **Construction.** Ross–Selinger synthesis gives Z(φ) ≈ H_k T … H₁ T C₀ (Eq. 19) [RS16]; commuting the H and π/2
  Cliffords through (Eqs. 20–21) leaves a product of gates from {T, X(π/4), Y(π/4)} and a final Clifford (Eq. 22). Each
  such gate is one T injection: a P(π/4) rotation by measuring P ⊗ Z with T|+⟩ then X (Eq. 23, [Lit19b]); the
  half-the-time P(π/2) fix-up is commuted forward by choosing later bases adaptively; Eq. (24) is the φ = π/4 case.
- **Reader needs.** `rotation-synthesis`, `t-injection`, `clifford-t-universal`, `pauli-frame`, `adaptive-feedforward`.
- **Rests on.** Eqs. (19)–(24) (pp. 25–26).
- **Leans on.** [RS16], [Lit19b].

## §3.4 Future directions (pp. 26–27)

- **Claim.** The only entanglement consumed between modules is a GHZ state, preparable along any spanning tree (two
  rounds on a Hamiltonian path); open problems: parallelism, time overhead of synthesis, Toffoli/CCZ states
  [GF19; Bev+20], cheaper probabilistic small-angle synthesis [Kli+23] (about 5.4× fewer T on average than [RS16; YY24]).
- **Reader needs.** `ghz`, `pbc`.

## §4 End-to-end resource estimates (pp. 28–30)

- **Claim.** For random circuits and for a 10 × 10 TFIM, the bicycle architecture holds about ten times more logical
  data qubits than a surface-code architecture at the same T count and physical budget, but it runs slower per T.
- **Construction.** Line of M code modules plus one factory: q = M(c + u + a) − a + a′ + f (Eq. 25), n = 11M. Compile,
  delete repeated in-module measurements, attach durations from Table 2, and add failures to first order:
  P = Σ_j N_j P_j over instruction types, with idles inserted while a module waits (Eq. 26). Random circuits:
  π/4 rotations about random Paulis; the longest sequence with failure ≤ 1/3 (8 trials, up to 10⁵ rotations, then a
  linear extrapolation, Fig. 17) gives N_T in Fig. 10a; the closest surface-code design is found from Eq. (89).
  TFIM: 1.8 × 10⁵ small-angle rotations; gross codes with a 10⁻⁴ factory need q = 4817 but p ≤ 2.1 × 10⁻⁵; two-gross
  codes with a 10⁻³ factory need q = 8138 and p ≤ 7.3 × 10⁻⁴ (surface code: d = 17 at 58 263 qubits or d = 19 at
  72 663). Concurrent surface-code advances (yoked codes [Gid+25; Gid25], transversal neutral-atom designs
  [Zho+24; Zho+25]) are noted as not compared.
- **Reader needs.** `resource-model`, `capability-estimate`, `surface-code-architecture-model`, `tfim-workload`,
  `product-formula`, `logical-error-scaling`, `t-factory`.
- **Rests on.** Fig. 10a (table, p. 29), Fig. 10b (TFIM lines, p. 29), Fig. 17 (p. 66), Tables 9–10 (pp. 67–68).
- **Leans on.** [Bev+22] (surface-code baseline and TFIM benchmark), [Lit19a; BKS22] (compilation).

## §5 Conclusions and opportunities (pp. 31–33)

- **Claim.** The architecture meets all six criteria and is easier to manufacture: modules of a few hundred qubits
  yield far more often than monolithic chips.
- **Construction.** With 99.98 % junction yield and the larger junction counts per qubit and coupler, a gross module
  (code + LPU) yields about 2 times in 5 and a two-gross module about 1 in 5, while a perfect 5000-qubit surface-code
  chip yields about once in 3000 and a d = 17, 12-logical surface-code module once in 66 000. Opportunities: shorter run
  time (more pivots, cheaper synthesis), real-time decoding of the larger instructions, larger codes — a conjectured BB
  family with ℓ = 6(r + b), m = 6r, n = 72r(r + b), k = 12, d = 6(2r + b − 1) using the same A, B, whose kd²/n tends to
  24 (12 for gross, 13.5 for two-gross; 1 for the surface code; bounded by [BPT10]) — richer instruction sets, and
  factories that use long-range connectivity.
- **Reader needs.** `fabrication-yield`, `bb-family-scaling`, `bpt-bound`, `code-rate`.
- **Rests on.** Text pp. 31–33; Figs. 1, 10.
- **Leans on.** [Bra+22; Wan+25] (connectivity feasible), [BPT10], [Lia+25], [BE21].

---

## App. A.1 Logical code bases (pp. 43–46)

- **Claim.** Explicit logical bases for both codes built from four operators X̄₁, X̄₇, Z̄₁, Z̄₇ and their shifts, with
  properties that halve the LPU and keep degrees low.
- **Construction.** Polynomial picture: cell (i, j) ↔ monomial xⁱyʲ with x^ℓ = y^m = 1; A = 1 + y + x^{a→}y^{a↑},
  B = 1 + x + x^{b→}y^{b↑} (Eq. 27); an X check at α acts on L qubits αA and R qubits αB, a Z check on L qubits αBᵀ and
  R qubits αAᵀ (transpose = inverting exponents, Eq. 28); every check has weight 6. X(p, q) is logical iff
  pB + qA = 0 (Eq. 29); Z(r, s) iff rAᵀ + sBᵀ = 0 (Eq. 30); X(p, q) logical ⇔ Z(qᵀ, pᵀ) logical (ZX-duality). Basis
  form Eq. (31) with μ = ν = xy; four requirements (anticommuting pairs; shifts generate the logical Pauli group;
  commuting operators disjoint, anticommuting ones meet in one qubit; disjoint adjacent check sets). Polynomials p, q,
  r, s for gross (Eq. 32, weight 12) and two-gross (Eq. 33, weight 20 — no weight-18 choice meets requirement 2); the
  shift monomials α, β for all 12 qubits (Eqs. 34–36). These A, B differ from [Bra+24]'s by a relabelling.
- **Reader needs.** `polynomial-ring`, `bb-code`, `logical-operators`, `zx-duality`, `bb-logical-basis`.
- **Rests on.** Fig. 11 (p. 44), Fig. 12 (logical-operator enumeration with BP+OSD: 1884 weight-12 and 19 728 weight-14
  X logicals for gross; 336 weight-18 and 1728 weight-20 for two-gross, p. 46).
- **Leans on.** [PK21; Bra+24] (polynomial formalism), [BB24; ES24] (ZX-duality), [Cro+24] (basis strategy), [OHB25]
  (independent count), [Rof+20; Rof22] (BP+OSD).

## App. A.2 Shift automorphisms (pp. 46–47)

- **Claim.** Shifts by ⟨x⁶, y⁶⟩ act trivially, leaving 35 non-trivial logical shifts; 6 hardware circuits and their
  inverses generate all of them with at most two factors; each acts as A ⊗ A (A a 6 × 6 binary matrix) in the chosen
  basis.
- **Construction.** Moving L data through X check qubits along one term of A and back along another realizes the shift
  A_i A_jᵀ (i ≠ j); routing L through Z checks gives B_i B_jᵀ. Basic shifts {x, y, x³y⁻¹, xy³, x³y⁻², x²y³}.
  A permutation of physical qubits in a CSS code is a logical CNOT circuit |x⟩ ↦ |Mx⟩; the block structure of the basis
  makes M = A ⊗ A. Eqs. (37)–(38) give A_x and A_y for both codes (order 6).
- **Reader needs.** `shift-automorphism`, `gf2-linear-algebra`, `cnot`, `bb-logical-basis`.
- **Rests on.** Eqs. (37)–(38) (p. 47).
- **Leans on.** [ES24; Say+24] (larger automorphism groups, not used).

## App. A.3 Logical processing units (pp. 48–51)

- **Claim.** The LPU is an auxiliary graph G with a cycle basis — 90 ancilla qubits for gross with phenomenological
  fault distance 12, 158 for two-gross with distance 18.
- **Construction.** Gauging picture [WY24]: edges of G are new qubits, vertices are X-type checks, chosen cycles are
  Z-type checks. G_l has one vertex per qubit of X̄₁ (each also wired to the ZX-dual qubit of Z̄₇) and one edge per Z
  check meeting X̄₁ in two qubits (gross: 12 vertices, 18 edges, so 7 independent cycles, of which 5 are kept; G_r keeps
  3). G_l and G_r are merged at the one qubit where X̄₁ meets Z̄₁ (that vertex check would have weight 8, so it becomes
  the Bell check v_Bell), and 11 bridge edges add 10 squares and one triangle. Two-gross: 20-vertex graphs with 30 + 2
  edges (two random extra edges for expansion), 11 and 9 kept cycles, 17 bridge edges; whole graph 39 vertices,
  81 edges, 37 cycles. A full graph with all cycles encodes nothing (footnote 11).
- **Reader needs.** `gauging-measurement`, `graph-cycle-basis`, `expansion`, `bridge-system`, `bell-check`, `lpu`.
- **Rests on.** Fig. 5 (p. 12), cycle lists and bridge diagrams Eqs. (39)–(64) (pp. 49–51).
- **Leans on.** [WY24; Ide+24] (gauging, expansion), [SJY24] (relative expansion), [Cro+24] (bridges, vertex
  identification).

## App. A.4 Logical measurement protocols (pp. 51–54)

- **Claim.** One fixed LPU measures 15 different logicals by switching on suitable subgraphs; joined LPUs and the
  factory adapter measure products across modules.
- **Construction.** Gauging measurement in four steps [WY24]: edge qubits start in |0⟩; measure all LPU checks and the
  deformed code for C rounds, the outcome being the product of vertex-check results; return by measuring the original
  checks and the edge qubits in Z; fix the code with a Pauli determined by edge outcomes along paths from a reference
  vertex (tracked, never applied). Half-LPU l measures ⟨X̄₁, Z̄₇⟩, half-LPU r ⟨X̄₇, Z̄₁⟩, the full LPU the other 9.
  Inter-module: half-LPUs of both modules + both bridges + Bell checks (weight-3 bridge checks unused, footnote 14:
  joining two graphs with w edges adds w − 1 cycles). Factory: a path of d vertices in the LPU is wired to the qubits
  of Z̄_T (Fig. 14); degree 7 is kept by doing this for at most one factory per module.
- **Reader needs.** `gauging-measurement`, `stabilizer-measurement-update`, `pauli-frame`, `bridge-system`,
  `code-factory-adapter`.
- **Rests on.** Fig. 13 (p. 52), Fig. 14 (p. 53).
- **Leans on.** [WY24], [Got97] (stabilizer update rule), [SJY24].

## App. A.5 Circuit scheduling for logical measurements (pp. 54–57)

- **Claim.** Syndrome circuits for the deformed codes can be scheduled by edge-colouring (12 timesteps per cycle) or by
  an integer program (9C + b timesteps for gross, b ∈ {1, 2}, optimal because the maximum degree is 7).
- **Construction.** Variables t_{γ,δ} for each check–data gate; constraints: one gate per qubit per step (Eq. 65), Bell
  pairs prepared first (Eq. 66), overlapping checks ordered so the parallel circuit equals sequential measurement (the
  anticommuting-overlap sign rule, Eq. 67), a time cap (Eq. 68); BB-code gates keep the Fig. 4b schedule. Colouring
  bipartite graphs is polynomial [Kőn16]. ILP minimizes the slowest qubit "lifetime" (Eqs. 69–72), then trims each
  check's lifetime one at a time.
- **Reader needs.** `syndrome-cycle`, `tanner-graph`, `edge-colouring`.
- **Rests on.** Eqs. (65)–(72).
- **Leans on.** [DBT21; Vit+24] (scheduling), [IBM22].

## App. A.6 Cost estimates for T-state cultivation (pp. 57–58)

- **Claim.** The two cultivation factories cost 454 and 463 qubits and on average 351 and 2167 timesteps per kept T
  state, with error 3 × 10⁻⁶ and 2 × 10⁻⁹.
- **Construction.** Table 5 copies [GSJ24, Fig. 2] (d₁ = 3 and 5 at p = 10⁻³) and derives the escape-stage discard
  rate P′_escape = (P′_e2e − P′_cult)/(1 − P′_cult) (Eqs. 73–74); stage durations read from the published circuits
  (Eqs. 75–78); mean time = each stage's duration divided by its keep probability (Eqs. 79–80).
- **Reader needs.** `cultivation`, `postselection`, `expected-attempts`.
- **Rests on.** Table 5 (p. 57).
- **Leans on.** [GSJ24; GJS24].

## App. A.7 Simulation of bicycle instructions (pp. 58–60)

- **Claim.** The logical error rates in Table 2 come from stim circuits decoded with Relay-BP, Monte Carlo sampling and
  the failure-spectrum ansatz with the parameters of Table 6.
- **Construction.** Decoding matrices: H (detectors × faults) and A (logical actions × faults); success iff
  A·D(He) = A·e. Logical Bell pairs make one experiment sensitive to X and Z errors (as in [Cro+24]). Idle and shift
  rates are per repetition (circuit of C = d*_circ repetitions, divided by C). Eq. (82): P(q) = Σ_{w ≥ w₀} f(w) C(N, w)
  q^w (1 − q)^{N−w}; Eq. (83): f_ansatz(w) = a[1 − exp(−(f₀/a)(w/w₀)^γ)] with a = 1 − 2^{−K}; w₀ = 5 (gross), 9
  (two-gross); bootstrap error bars. Relay-BP parameters in Table 7.
- **Reader needs.** `failure-spectrum`, `binomial`, `detector`, `decoder`, `bp-decoding`.
- **Rests on.** Fig. 15 (p. 60), Tables 6–7 (p. 61).
- **Leans on.** [Gid21] (stim), [Mül+25], [Bev+25], [IP15] (optimal decoding is hard).

## App. A.8 Distance validation (pp. 60–63)

- **Claim.** For all in-module measurements, both the space-like and time-like phenomenological distances equal the code
  distance (Table 8); inter-module cases are checked directly (X̄₁ ⊗ X̄₁ for gross) or via a joining theorem; circuit
  distances are only upper-bounded.
- **Construction.** Space-like distance = distance of the deformed code (capped by d); time-like distance = min(C, d*_t)
  where d*_t is the lightest operator commuting with the deformed checks other than vertex checks yet anticommuting
  with the measured logical — a subsystem-code view [Vui+19; Cro+24; WY24]. Both reduce to one integer program
  (Eq. 84, symplectic form, a linearized weight). [Cro+24, Thm 24] carries distance through a join when supports are
  minimum weight in their class (true for the weight-20 two-gross basis, checked against the weight-18 list). Circuit
  distance upper bounds come from decoding random logical constraints with BP+OSD [Bra+24; PK21].
- **Reader needs.** `code-distance`, `space-time-like-errors`, `subsystem-code`, `symplectic-pauli`,
  `circuit-distance`.
- **Rests on.** Table 8 (p. 62), Table 4 (p. 17).
- **Leans on.** [WY24], [Cro+24], [Vui+19], [PK21], [IBM22].

## App. A.9 Pauli-based computation (p. 64)

- **Claim.** Any circuit can be rewritten with no Clifford gates: only Pauli rotations and Pauli measurements.
- **Construction.** Push each Clifford to the end with C† e^{iφP} C = e^{iφ C†PC} (Eq. 86), turning the rotations into
  P′_j (Eqs. 87–88); the leftover global Clifford only relabels the final measurements and is never run.
- **Reader needs.** `pbc`, `clifford-group`, `pauli-rotation`.
- **Leans on.** [BSS16; BK05; Kni05; Lit19a; CC22; Bev+22].

## App. A.10 Logical capability comparison details (pp. 65–68)

- **Claim.** How the application regions of Fig. 1, the surface-code comparison rows of Fig. 10a and the TFIM numbers
  were obtained.
- **Construction.** Regions: convex hulls of [Sch+24, Fig. 2], extended outward; "classically simulable" below 75
  qubits or 75 T gates (Fig. 16). Surface-code model: 2d² qubits per patch, P₁ = 0.03(p/0.01)^{d/2} per cycle, any Pauli
  measurement in d cycles with half the patches for routing; n = ⌊(q − f)/(4d²)⌋; failure ≈ 2N_T n P₁ d, so
  N_T ≤ (1/3)/(2nP₁d) (Eq. 89); d chosen to match the bicycle N_T on a log scale (Eq. 90); time per rotation
  τ̄_factory + 6d. TFIM: H = −J Σ ZZ + g Σ X on a √n_L × √n_L grid (Eq. 91), fourth-order product formula (Eqs. 92–94)
  with n_L = 100, t = 20, Δ = 0.25 (80 steps), J = g = 1, giving N_R = 184 000 rotations; synthesis error 5 × 10⁻⁹;
  Table 9 counts, Table 10 rates and failure probabilities; a power law a·p^b through two points meets 10⁻³ at
  p = 2.09 × 10⁻⁵ (gross) and 7.32 × 10⁻⁴ (two-gross); surface code from Eq. (96).
- **Reader needs.** `surface-code-architecture-model`, `logical-error-scaling`, `tfim-workload`, `product-formula`,
  `hamiltonian-evolution`, `resource-model`.
- **Rests on.** Fig. 16 (p. 65), Fig. 17 (p. 66), Tables 9–10 (pp. 67–68).
- **Leans on.** [Bev+22], [Sch+24], [Bev+20; Mic22] (TFIM parameters; footnote 18 notes 20 vs 80 steps), [BG16; Bra+19]
  (classical simulation limits), [Fow+12; WFH11].

---

## Verifier's cross-checks (scratch numpy, not shipped)

Run 2026-10-14 to make sure the transcriptions the recipes depend on are right; each becomes an engine claim with a numpy
twin in the build (see `recipes.md`).

1. Both toric presentations (A = 1 + y + x³y⁻¹, B = 1 + x + x⁻¹y⁻³) give n = 144 / 288, k = 12, weight-6 checks,
   degree-6 qubits, H_X H_Zᵀ = 0. They are [Bra+24]'s codes relabelled: gross via A ↦ yA, B ↦ xB; two-gross also needs
   y ↦ y⁷ (then A ↦ yA, B ↦ xB). [Bra+24]'s [[72,12,6]] code is the r = 1, b = 0 member of the §5 family (k = 12).
2. Eqs. (32)–(36) transcribed correctly: all four operators are logical, weights 12 (gross) and 20 (two-gross), the 12 X̄
   and 12 Z̄ form a canonical basis (X̄_i anticommutes with Z̄_j iff i = j), overlaps obey requirement 3.
3. Eqs. (37)–(38) reproduced for qubits 1–6 (as the transpose of the X-operator decomposition matrix), order 6. On qubits
   7–12 our check finds the transpose matrix, so "A ⊗ A" holds only up to that convention — open item O1 in
   `reported.md`.
4. Logical shift group: 36 elements; x⁶ trivial; every element is a product of at most two basic shifts. Native
   measurements: 540 (matches). Native rotations: 510 distinct non-trivial R appear if the pivot letter may be I; only
   245 if it must be X, Y or Z as Eq. (15) reads — open item O2.
5. G_l sizes: gross 12 vertices / 18 edges (cycle rank 7); two-gross 20 / 30 (+2 added). Every Z check meets X̄₁ in 0 or 2
   qubits.
6. Table 6 → Table 2 and Table 10: the binomial sum of Eq. (82) with the Table 6 ansatz reproduces every measured entry
   of Table 2 and every P_I, P_U, P_M, P_C of Table 10 to the printed digits (needs `expm1` for the two-gross rows).
7. Eq. (26) with Table 9 × Table 10 reproduces the TFIM failure probabilities within the rounding of the printed P_i;
   the two-point power law reproduces 2.09 × 10⁻⁵ and 7.32 × 10⁻⁴.

Discrepancies found while recomputing are listed with the reported numbers (`reported.md`, "Recompute notes").
