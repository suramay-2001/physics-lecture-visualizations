# P-P1-story — P1 "Tour de gross: a computer built from code modules" (role P, Papers)

Proposal only; nothing under `app/` is touched. Format: `P-Q21-story.md` sections 0–12 (skill 03). Kind `'paper'`, one data-only spec
`content/papers/P1.paper.ts` that replaces the placeholder unit `p1-checks` (its gloss `pp-check` and bridges `pp-l3-eigen`, `pp-q6-bell-basis` are
reused). Phases: `[L]` 'lecture' ("The paper says"), `[B]` 'books' ("A reference adds": a background chapter or a cited paper), `[C]` clue, `[D]`
Go-deeper. Standing gates: ≥ 2 distinct derivation views per track; one notation beat per new notation; R3 (computed vs reported); R5 (trail).

**Sources read** (paraphrased; printed page = PDF page): `sources/paper-tdg/text.md` §1–§5 (pp. 1–33), A.1–A.10 (pp. 43–68). **Page images checked**
(2026-10-14): pp. 5–7, 9, 10, 12–14, 16, 20, 22–25, 29, 30, 44, 46, 47, 53, 61, 62, 67, 68 (every table and figure used; Figs. 15–17 not redrawn). Online:
[Lit19b] Table 1 (arXiv HTML, for E2); other trail entries use the parts logged as read in `docs/papers/tdg/references.md`. No file saved (R6, R7).

**Ownership** (link, never re-teach): F5 binomial, F8 clocks, Q6 Bell states, Q7 GHZ, Q21 codes, Q22 stabilizers/logicals/distance/CSS/Clifford/update
rule, 448 L11 evolution; **B1** surface code, noise models, detectors, decoders, circuit distance; **B2** BB codes, polynomials, k, torus, depth-8 cycle,
shifts, BP; **B3** surgery, gauging, cycle bases, expansion, bridges, adapters; **B4** magic states, injection, PBC, Eq. 10, distillation, cultivation,
synthesis. **P1 owns** the 31 "paper" nodes of `prereq-graph.md`, each on the unit its `tdg-*` hint names (`tdg-x` → `p1-x`; §11.1).

**Evidence.** Scratchpad `planP1-numpy.py` (numpy only, from the printed inputs; route B: logical coefficients by pairing with the dual basis, counts by
enumeration): **158 asserted checks, 0 failed**; `planP1-fig9.py`, `planP1-fig9b.py`: BFS over all 4¹¹ Paulis (E3). Every number below is printed there.
Classes: **C** computed; **C←R** computed from printed inputs (the recipe's `uses`); **R** reported.

**Conventions.** Qubits 1–12, pivot = 1; shifts δ = xᵃyᵇ; a CNOT circuit acts |x⟩ → |Mx⟩, column j = image of X̄_j (A.2's, and the engine's). p physical
error rate, q = p/15, a timestep = one physical operation. Keys `p1…`, twins `pipeline/claims_papers/p1.py`; reported ids = `reported.md` ids lower-cased
(`t1-u`, `t2-i-g`, `f10a-4`, `x-p30b`), new ones named where used; unit ids `p1-<slug>` (spec rule).

**Stage shorthand.** `mm(code,f,M,{hl,ro})` = `module-map` via **tdg-machine** · `cb(code,{ops,shift})` = `code` torus via **tdg-basis** · `bg(…)` = `bits`
grid via **tdg-pairing** / **tdg-shift-action** · `sg(code,mode)` = `surgery-graph` via **tdg-lpu** · `pp(…)` = `pauli-program` via **tdg-distribute** /
**tdg-native** · `pl(recipe,{…})` = `plot` · `cg(…)` = the existing **circuit-gates** · `B2:bb-torus` etc. = a background chapter's recipe (§9.1).

## 0. Chapter map
**Driving question:** "How can a working quantum computer be built from small code modules, and what would it cost?"

| # | id | Title (≤ 8 words) | Question | Paper | Link-backs |
|---|---|---|---|---|---|
| 1 | `p1-criteria` | What a full quantum computer needs | What must an architecture provide, and why leave the surface code? | §1–§1.1 pp. 3–5; §5 p. 31 | B1 `b1-why`, B2 `b2-bpt` |
| 2 | `p1-modules` | Modules, a pivot and five instructions | What are the machine's parts and what can a program ask of them? | §1.2 pp. 5–7, Fig. 2, Tables 1–2 | Q22, `pp-q6-bell-basis` |
| 3 | `p1-gross` | The gross code and its logical qubits | Where do the twelve logical qubits live on the torus? | §2.1 pp. 8–9; A.1 pp. 43–46; Figs. 3, 11, 12 | B2 `b2-polynomials`, `b2-gross` |
| 4 | `p1-idle-shift` | Idling, Bell checks and shifts | How does a module keep its data and move it for free? | §2.2 pp. 9–11; A.2 pp. 46–47; Fig. 4 | B2 `b2-automorphisms` |
| 5 | `p1-lpu` | One ancilla graph measures fifteen Paulis | How can one fixed add-on measure 15 different logicals? | §2.3 pp. 11–12; A.3–A.5 pp. 48–57; Fig. 5 | B3 `b3-gauging`, `b3-bridges` |
| 6 | `p1-between` | Joining modules and injecting T | How do two modules, or a module and a factory, measure jointly? | §2.4–2.5 pp. 12–15; A.6 pp. 57–58; Tables 3, 5 | B3 `b3-bridges`, B4 `b4-injection` |
| 7 | `p1-benchmark` | Error rates no simulation can sample | How is a 10⁻²⁰ error rate estimated at all? | §2.6 pp. 15–17; A.7–A.8 pp. 58–63; Fig. 7 | B1 `b1-cycle`, `pp-f5-spread` |
| 8 | `p1-compile` | From gates to bicycle instructions | How does a circuit become shifts, measurements and injections? | §3 pp. 20–27; A.9 p. 64; Figs. 8–9 | B4 `b4-pbc`, `b4-synthesis`, `pp-q7-ghz` |
| 9 | `p1-bill` | The bill: qubits, time and errors | What does a computation cost, against a surface-code machine? | §4 pp. 28–30; §5 pp. 31–32; A.10 pp. 65–68 | B1 `b1-threshold`, `pp-l11-generator` |

**Outcomes:** name the six criteria and the five parts with their qubits · read BB checks and logicals as polynomials on a torus · explain Bell checks,
shift instructions and why a shift is a CNOT circuit · count the LPU from its graph · trace joint and T-injection measurements through adapters · turn a
failure spectrum into Table 2 · compile a long rotation and price an in-module measurement · compute q and check the paper's TFIM and capability numbers,
including five places where our calculation differs. **Prerequisites:** Q21, Q22, B1–B4 (built first, S8). **Opener:** none (§10).

## 1. Story beats per unit (G ≤ 25 words/sentence, F ≤ 40; every beat has both captions)
Kinds: criteria module-map, plot · modules module-map, pauli-program, surgery-graph · gross code, bits · idle-shift code, circuit, amplitudes, bits · lpu
surgery-graph · between module-map, surgery-graph, circuit, amplitudes, plot · benchmark circuit, plot · compile pauli-program, plot, module-map · bill module-map, plot.

### Unit `p1-criteria` — What a full quantum computer needs
**b1 [L]** (six criteria) · Terms `pp-bicycle-architecture` · Trail `lit19a` "§2 rules list" — the surface-code baseline the criteria are judged against
- G: "The paper asks what a full quantum computer needs. Errors must stay rare, and every stored qubit must be reachable. It needs a universal gate set and must react to its own measurements. It should come in replaceable modules and not waste qubits."
- F: "Section 1.1 sets six criteria: fault-tolerant, addressable, universal, adaptive (real-time decoding with feed-forward), modular and efficient (pp. 4–5). Surface-code designs meet the first five; the [[pp-bicycle-architecture|bicycle architecture]] aims at all six. Why fault tolerance at all is Chapter B1's first unit."
- Cap G "a bicycle machine: modules in a line, adapters between them, one T factory" · F "Fig. 2a redrawn from Table 1: three gross modules (c + u), adapters a, factory f, adapter a′" · Stage `mm(gross,1e-3,3)` · Claims `p1N3` 33.
**b2 [L]** (an order of magnitude) · Trail `bra24` "§8, surface-code comparison" — the ten-fold memory saving the paper builds on
- G: "Count qubits. One gross module stores 12 logical qubits in 288 qubits, plus 90 helpers. Twelve surface-code patches of distance 13 need 4044. That is 10.7 times more."
- F: "A gross module holds k = 12 logical qubits in c = 288 data and check qubits with a u = 90-qubit LPU (Table 1). Twelve rotated patches at d = 13, the least odd d ≥ 12, need 12(2d² − 1) = 4044 (Chapter B1): a factor 10.7, the paper's 'order of magnitude' (p. 3)."
- Cap G "one module with its helpers: 378 qubits for 12 logical qubits" · F "c + u = 378 for k = 12: 31.5 physical qubits per logical qubit" · Stage `mm(gross,1e-3,1,{hl:'in-module',ro:['perLogical']})` · Claims `p1C` 288, `p1PerLogical` 31.5, `p1Surf13x12` 4044, `p1Ratio13` 10.7 (uses `t1-u`) · Reported `t1-u` 90 (Table 1, p. 6), `x-p3-order` "about an order of magnitude" (§1, p. 3) · Fidelity "d = 13 is our stand-in for comparable protection; the paper compares by capability (Unit 9)".
**b3 [L]** (fabrication yield; D1)
- G: "A chip works only if every junction works. With 99.98 % good junctions and two couplers per qubit, a 5000-qubit chip works about once in 2983 tries. Small modules win."
- F: "Yield is y^J with y = 99.98 % and J = 2·qubits + 3·couplers (§5, p. 31). Assuming two couplers per qubit, a 5000-qubit surface chip yields 1 in 2983 (the paper: about 1 in 3000); the paper reports 2 in 5 for a gross module and 1 in 5 for two-gross."
- Cap G "chance of a perfect chip against its size: it falls off a cliff" · F "y^J on a log scale, J = 8 per qubit; marker at 5000 qubits" · Stage `pl(tdg-yield,{marker:5000})` · Claims `p1Yield5000` 2983 (uses `x-p31`) · Reported `x-p31` · Derivation D1 · Fidelity "two couplers per qubit is our assumption; module yields stay reported (no LPU coupler count)".
**b4 [C]** (a modular surface code)
- Q G: "A surface-code module of 12 patches at distance 17 has 6936 qubits. Under the same assumption, how often is one perfect?" · Q F: "With y = 0.9998, 2 junctions per qubit, 3 per coupler and 2 couplers per qubit, what is the yield of 12 patches of 2d² qubits at d = 17?"
- Reveal G: "About once in 66 086 tries, the paper's 'one in 66 000'. A gross module with its helpers has 378 qubits, so it yields far more often." · Reveal F: "J = 2·6936 + 3·13 872 = 55 488 and y^J = 1/66 086, the printed 1 in 66 000 (p. 31). Yield falls exponentially with size, so the practical unit is a module of a few hundred qubits."
- Cap G/F "the same curve, marker moved from 378 to 6936 qubits" · Stage q `pl(tdg-yield,{marker:378})`; reveal `pl(tdg-yield,{marker:6936})` · Claims `p1Q17x12` 6936, `p1YieldMod17` 66086.

### Unit `p1-modules` — Modules, a pivot and five instructions
**b1 [L]** (five parts; Table 1) · Terms `pp-code-module`, `pp-lpu`
- G: "Every qubit of the machine belongs to exactly one part. A [[pp-code-module|code module]] stores data, and its [[pp-lpu|LPU]] measures it. Adapters join neighbours, and a factory makes T states."
- F: "Each physical qubit sits in one component (Fig. 2, Table 1): code c, [[pp-lpu|LPU]] u, code–code adapter a, code–factory adapter a′, factory f. For gross, c = 288 (one check qubit per check) and a = 2(d − 1) = 22 with the reported d = 12, a′ = 2·15 − 1 = 29; u and f are the paper's estimates."
- Cap G/F "the parts of a gross machine, areas proportional to qubits" · Stage `mm(gross,1e-3,3,{ro:['parts']})` · Claims `p1C`, `p1A` 22 (uses `gross-d`), `p1APrime` 29 (uses `t3-g3`) · Reported `t1-u`, `t1-f`, `gross-d` 12 (p. 9).
**b2 [L] · notation beat, `introduces: ['pp-pivot']`** (twelve wires, one pivot)
- G: "A module's 12 logical qubits are numbered 1 to 12. Qubit 1, the [[pp-pivot|pivot]], is kept free as a helper. So each module carries 11 data qubits, and three modules carry 33."
- F: "Logical qubits are labelled 1–12 in a fixed basis (p. 5); qubit 1, the [[pp-pivot|pivot]], is an ancilla for synthesis (§3), so M modules give n = 11M data qubits (§4). In-module instructions touch qubits 1 and 7 only."
- Cap G/F "three modules, pivots marked, qubit 7 ringed" · Stage `mm(gross,1e-3,3,{hl:'pivot'})` · Claims `p1N3`.
**b3 [L]** (the instruction set) · Terms `pp-bicycle-instruction` · Bridge Q22 (Pauli group)
- G: "A program may use five kinds of step: idle, shift, measure inside a module, measure across two modules, and inject a T state. There are 12 shifts, 15 inside, 36 across and 6 injections."
- F: "[[pp-bicycle-instruction|Bicycle instructions]] (pp. 5–6): 12 shift automorphisms, the 2⁴ − 1 = 15 non-trivial elements of ⟨X̄₁, Z̄₁, X̄₇, Z̄₇⟩ (Hermitian forms), the 36 products (⟨X̄₁, Z̄₇⟩ ∪ ⟨X̄₇, Z̄₁⟩)^{⊗2}, 6 T injections, and the idle. CSS preparation and readout of all 12 qubits are free."
- Cap G "a short program on three modules, one column per step" · F "a bicycle program (our example, not Fig. 2c): shift, in-module, inter-module and T columns" · Stage `pp({program:EX3})` (authored, kind-validated) · Claims `p1NShift` 12, `p1NIn` 15, `p1NInter` 36, `p1NT` 6.
**b4 [L]** (prices in timesteps; Table 2)
- G: "Each step has a price in timesteps, one per gate. On gross an idle costs 8, a shift 14 and a measurement 120. Each step's error rate comes from simulations, so it is the paper's number."
- F: "Durations (Table 2, p. 7): τ_I = 8, τ_U = 4 + 2 + 8 = 14, τ_M = τ_C = 12C = 120 (gross, C = 10) and 216 (two-gross, C = 18), τ_T = τ̄_factory + τ_C. The rates P_i are simulation results, shown as reported; Unit 7 rebuilds the measured ones from the fits."
- Cap G/F "the same program with each column's duration summed under it" · Stage `pp({program:EX3, durations:'table2'})` · Claims `p1TauI` 8, `p1TauU` 14, `p1TauM` 120, `p1TauM2g` 216 (uses `c-cycles`) · Reported `t2-*` (all rows, p. 7), `c-cycles` C = 10, 18 (§2.3, p. 11).
**b5 [C]** (why 36, not 225)
- Q G: "Inside a module the LPU reaches 15 Paulis. Across two modules, why only 36 of the 15 × 15 pairs?" · Q F: "Why are joint measurements limited to (⟨X̄₁, Z̄₇⟩ ∪ ⟨X̄₇, Z̄₁⟩)^{⊗2}, 36 of the 225 products of in-module Paulis?"
- Reveal G: "Only the bridge is wired between modules, and each half of the LPU reaches 3 Paulis. So each side offers 6, and 6 × 6 = 36. Other products still come from several steps." · Reveal F: "The code–code adapter reuses B and U_B (§2.4, p. 13): each half-LPU measures one 3-element group, so 6 per module and 36 products; universality is untouched (p. 13)."
- Cap G/F "two LPUs joined at their bridges" · Stage q `mm(gross,1e-3,2,{hl:'inter-module'})`; reveal `sg(gross,'bridge-pair')` · Claims `p1NInter`, `p1PerSide` 6, `p1Pairs225` 225.

### Unit `p1-gross` — The gross code and its logical qubits
**b1 [B]** (BB codes recalled) · Bridge B2 `b2-gross` · Trail `bra24` "§4, Eqs. 1–3" — H_X = [A|B], H_Z = [Bᵀ|Aᵀ] and why they commute; `kit03` "§1" — the toric code the layout extends
- G: "Recall Chapter B2. Unit cells sit on a torus, each with two qubits, an X check and a Z check. Short edges make a toric code; two long edges per check do the rest."
- F: "On an ℓ × m torus of cells (L, R, X, Z; Fig. 3a) local edges give the toric code and each check gains two long edges (§2.1). Gross: 12 × 6, (a→, a↑, b→, b↑) = (3, −1, −1, −3): n = 144, k = 12 from GF(2) ranks, every check weight 6."
- Cap G "the gross torus: 72 cells, one check's six edges drawn" · F "Fig. 3b redrawn from the engine: local edges and the two long edges of one X check" · Stage `B2:bb-torus(gross)` · Claims `p1GrossN` 144, `p1GrossK` 12, `p1Wt` 6 · Reported `gross-params` [[144, 12, 12]] (Fig. 3b, p. 9).
**b2 [L] · notation beat, `introduces: ['pp-xpq']`** (polynomials name qubits) · Trail `bra24` "§9.1" — logical operators written as polynomials
- G: "Name a cell by xⁱyʲ, where x¹² = 1 and y⁶ = 1. A sum of such terms names a set of cells. [[pp-xpq|X(p, q)]] puts X on the L qubits listed by p and the R qubits listed by q."
- F: "Cells ↔ monomials with x^ℓ = y^m = 1; A = 1 + y + x³y⁻¹, B = 1 + x + x⁻¹y⁻³ (Eq. 27). [[pp-xpq|X(p, q)]] commutes with every Z check iff pB + qA = 0 (Eq. 29); Z(r, s) with every X check iff rAᵀ + sBᵀ = 0 (Eq. 30). X̄₁ = X(p, q) of Eq. 32 passes: it meets each of the 72 Z checks in 0 or 2 qubits."
- Cap G/F "X̄₁ on the torus: 12 marked qubits" · Stage `cb(gross,{ops:['X1']})` · Claims `p1X1Wt` 12, `p1X1Meets` [0, 2].
**b3 [L]** (four operators, two mirrors) · Terms `pp-zx-duality`
- G: "The paper picks four operators: X̄₁, X̄₇, Z̄₁ and Z̄₇. Each Z̄ is an X̄ seen in a mirror, so they come in pairs. X̄₁ and Z̄₁ share one qubit; the other pairs share none."
- F: "X(p, q) is logical iff Z(qᵀ, pᵀ) is ([[pp-zx-duality|ZX-duality]], p. 44). Eq. 31: X̄₁ = X(p, q), X̄₇ = X(r, s), Z̄₁ = Z(νsᵀ, νrᵀ), Z̄₇ = Z(μqᵀ, μpᵀ), μ = ν = xy. All four weigh 12; X̄₁·Z̄₁ and X̄₇·Z̄₇ overlap in one qubit (Y₁, Y₇), all other pairs in none (property 3), so mirror twins like X̄₁, Z̄₇ can share one LPU half."
- Cap G/F "the four operators, Y where X̄ and Z̄ meet" · Stage `cb(gross,{ops:['X1','X7','Z1','Z7']})` · Claims `p1BasisWt` [12,12,12,12], `p1Overlaps` [1,1,0,0,0,0].
**b4 [L]** (slides give all twelve) · Terms `pp-logical-basis`
- G: "Slide X̄₁ across the torus by six chosen steps to get X̄₁ to X̄₆. Slide X̄₇ the same way for X̄₇ to X̄₁₂. Each X̄ fails to commute with exactly one Z̄: its own."
- F: "Eqs. 34–35: X̄_i = α_iX̄₁, X̄_{i+6} = β_iᵀX̄₇, Z̄_i = β_iZ̄₁, Z̄_{i+6} = α_iᵀZ̄₇. Our check: all 24 are logical, the X̄ add rank 12 to the stabilizers, and the 12 × 12 anticommutation table is the identity: a canonical [[pp-logical-basis|logical basis]]."
- Cap G/F "the table 'X̄_i anticommutes with Z̄_j': ones on the diagonal only" · Stage `bg(tdg-pairing,gross)` · Claims `p1PairDiag` 12, `p1PairOff` 0.
**b5 [C]** (the two-gross code) · Trail `rof20` "§V" — the BP+OSD search behind Fig. 12
- Q G: "Same polynomials, but a 12 × 12 torus. How many qubits, how many logical qubits, and how heavy are the four basis operators?" · Q F: "For ℓ = m = 12 with the same A, B, give n, k from the ranks and the weight of the Eq. 33 basis operators."
- Reveal G: "288 qubits, still 12 logical, and weight 20: two above the distance 18, since no weight-18 choice slides into all twelve. A search found 336 lightest X̄ operators." · Reveal F: "n = 288, k = 12, basis weight 20 (Eq. 33; no weight-18 choice meets property 2, p. 45). BP+OSD (Fig. 12, p. 46) reports 1884 weight-12 and 19 728 weight-14 X̄ for gross, 336 weight-18 and 1728 weight-20 for two-gross."
- Cap G/F "the two-gross torus with its four operators" · Stage q `B2:bb-torus(two-gross)`; reveal `cb(two-gross,{ops:['X1','X7','Z1','Z7']})` · Claims `p1TwoN` 288, `p1TwoK` 12, `p1TwoWt` 20 · Reported `two-gross-params` [[288, 12, 18]] (p. 9), `f12` · Fidelity "a search, not a proof; 1884 is not 30 × 72 (orbits differ in size)".

### Unit `p1-idle-shift` — Idling, Bell checks and shifts
**b1 [B]** (one cycle is the idle) · Bridge B2 `b2-gross` · Trail `bra24` "§5, Table 5, Fig. 5" — the depth-8 schedule of Fig. 4b
- G: "To keep its data, a module measures all 144 checks over and over. Chapter B2 showed one round takes 8 timesteps. So C rounds take 8C + 1, and an idle costs 8."
- F: "The idle is one syndrome cycle on c = 4ℓm qubits, one check qubit per check (Fig. 4a). The depth-8 schedule (Fig. 4b; Chapter B2) gives 8C + 1 timesteps for C cycles, 81 for C = 10, so τ_I = 8 per cycle (p. 10)."
- Cap G/F "one X and one Z check with their gate times 1–8" · Stage `B2:bb-schedule(gross)` · Claims `p1GrossChecks` 144, `p1Cycle10` 81, `p1TauI`.
**b2 [L] · notation beat, `introduces: ['pp-bell-check']`** (a check in two halves)
- G: "A [[pp-bell-check|Bell check]] measures one check with two helpers that share a Bell pair. Each helper touches half the data. Their two X readings, combined, give the check's answer."
- F: "A [[pp-bell-check|Bell check]] (Fig. 4c): prepare |Φ⁺⟩ on two check qubits (<<pp-q6-bell-basis|Bell states>>), couple each to half the support, read both in X; the parity is the check value, at lower degree and depth. Our 4-qubit run (a ZZ check, data in |{+}{+}⟩): readout parity never differs from Z₁Z₂; eight strings at 0.125."
- Cap G/F "helpers q2, q3 share a Bell pair; their parity always matches the data's" · Stage `split(cg(4q,BELLCHECK,'circuit') / cg(4q,BELLCHECK,'amplitudes'))` · Claims `p1BellP` 0.125 (`p0000`), `p1BellMiss` 0 (`p0001`) · Fidelity "a weight-2 check stands in for the weight-8 v_Bell".
**b3 [L]** (moving the whole torus) · Terms `pp-shift-instruction`
- G: "A shift slides every data qubit across the torus. Each hops into a neighbouring check qubit, then into a new data place. Two swaps and one check round take 14 timesteps."
- F: "A [[pp-shift-instruction|shift instruction]] swaps each data qubit into an adjacent check qubit and on to a data site of its type (pp. 10–11): 6 first directions × 2 second = 12. Two swap rounds (4 CNOTs, 2 measurements) plus a cycle: τ_U = 6 + 8 = 14. The paths realize A_iA_jᵀ and B_iB_jᵀ: exactly the six basic shifts and inverses (p. 47)."
- Cap G/F "every qubit slides one cell east; the ghost marks where X̄₁ was" · Stage `B2:bb-shift(gross,[1,0])` · Claims `p1TauU`, `p1BasicShifts` 12.
**b4 [L]** (a shift is a CNOT circuit; Eq. 37) · Bridge B2 `b2-automorphisms`
- G: "Sliding keeps every check a check, so the data survive but get mixed. Slide x turns X̄₁ into X̄₄X̄₆. A 6 × 6 table of zeros and ones records all the mixing."
- F: "A permutation preserving both check spaces is a logical CNOT circuit |x⟩ → |Mx⟩ (A.2; Chapter B2). Our calculation: M never mixes 1–6 with 7–12, and on 1–6 x and y act by exactly A_x, A_y of Eq. 37 (x: X̄₁ → X̄₄X̄₆). A_x has order 6; the 72 shifts give 36 logical classes, each a product of ≤ 2 basic shifts."
- Cap G/F "A_x: column j is where X̄_j goes" · Stage `bg(tdg-shift-action,gross,[1,0],'1-6')` · Claims `p1ImgX1` [4, 6], `p1AxGap` 0, `p1Order` 6, `p1Classes` 36, `p1MaxFactors` 2.
**b5 [L]** (the second half; Correction box E1; D2)
- G: "The paper says qubits 7 to 12 are mixed by the same table. Our calculation finds the flipped table, rows turned into columns. So the two halves run different circuits."
- F: "Page 47 (and Fig. 2's caption, p. 5) state M = A ⊗ A, one six-qubit circuit on both halves. Our calculation finds M = A ⊕ Aᵀ in the basis of Eqs. 34–36: block 7–12 is A_xᵀ, which differs from A_x in 16 places (Correction box). No other number of the paper depends on it."
- Cap G/F "both blocks of M for slide x: the lower one is the upper one transposed" · Stage `bg(tdg-shift-action,gross,[1,0],'both')` · Claims `p1AxLowerT` 0, `p1AxLowerDiff` 16 · Derivation D2.
**b6 [C]** (six steps home)
- Q G: "Apply slide x six times. What happens to the stored data?" · Q F: "What is the logical action of x⁶ on the gross code, and how many distinct actions do the 72 shifts have?"
- Reveal G: "Nothing at all: the table applied six times is the identity. That is why 72 slides give only 36 different mixings." · Reveal F: "A_x⁶ = I and x⁶, y⁶ act as the logical identity (p. 47); ⟨x⁶, y⁶⟩ has order 2 on the 12 × 6 torus, folding 72 shifts into 36 classes, 35 non-trivial."
- Cap G/F "M for x⁶: the identity" · Stage q `bg(tdg-shift-action,gross,[1,0],'both')`; reveal `bg(tdg-shift-action,gross,[6,0],'both')` · Claims `p1Order`, `p1Classes`.

### Unit `p1-lpu` — One ancilla graph measures fifteen Paulis
**b1 [B]** (gauging X̄₁) · Bridge B3 `b3-gauging` · Trail `wy24` "Algorithm 1, Thm 1" — the gauging measurement the LPU is built on
- G: "Chapter B3 measured a logical by gauging. Put one helper check on each qubit of X̄₁: 12 vertices. Join two when a Z check touches both: 18 edges. The vertex checks multiply to X̄₁."
- F: "Gauging (Chapter B3): G_l has a vertex per qubit of X̄₁ and an edge qubit per Z check meeting X̄₁ (A.3, p. 48). Our calculation: every Z check meets X̄₁ in 0 or 2 qubits, so 12 vertices, 18 edges, cycle rank 18 − 12 + 1 = 7; C rounds of vertex checks read X̄₁ as their product."
- Cap G/F "G_l: 12 vertices on X̄₁'s qubits, 18 edges from Z checks" · Stage `sg(gross,'l')` · Claims `p1GlV` 12, `p1GlE` 18, `p1GlRank` 7.
**b2 [L]** (two halves, one Bell vertex)
- G: "By the mirror rule, the same graph also measures Z̄₇. A second graph serves X̄₇ and Z̄₁. They share the vertex where X̄₁ meets Z̄₁, and that check becomes a Bell check."
- F: "ZX-duality lets G_l serve ⟨X̄₁, Z̄₇⟩ and G_r (12 vertices, 18 edges) serve ⟨X̄₇, Z̄₁⟩ (§2.3, A.3). The vertices on the one shared qubit are identified; that check would weigh 8, so it is the Bell check v_Bell, keeping degree ≤ 7. The paper keeps 5 of G_l's 7 basis cycles and 3 of G_r's."
- Cap G/F "the two halves meeting at v_Bell" · Stage `sg(gross,'r')` · Claims `p1GrV` 12, `p1GrE` 18 · Reported `a3-kept` "5 of 7; 3; 11 bridge edges" (A.3, pp. 48–49).
**b3 [L]** (bridge and census; D3) · Trail `cro24` "§3.6" — bridges that let one system measure products across halves
- G: "Eleven bridge edges tie the halves, so mixed operators like Ȳ₁ can be measured. Now count every helper: 24 vertex qubits, 47 edge qubits, 19 cycle checks. That makes 90."
- F: "|B| = d − 1 = 11 bridge edges add 10 squares and a triangle (Eqs. 39–40). Census: 23 vertex checks (v_Bell uses two qubits), E = 18 + 18 + 11 = 47 edges, U = 5 + 3 + 11 = 19 cycles kept of rank 25. So u = 24 + 47 + 19 = 90 (Table 1)."
- Cap G/F "the full LPU graph with its census" · Stage `sg(gross,'full')` · Claims `p1LpuV` 23, `p1LpuVq` 24, `p1LpuE` 47, `p1LpuRank` 25, `p1LpuKept` 19, `p1U` 90 (uses `a3-kept`, `gross-d`) · Reported `t1-u`, `f5-census` · Derivation D3.
**b4 [L]** (three modes, fifteen measurements)
- G: "Switching on part of the LPU chooses what is measured. The left half measures 3 Paulis, the right half 3, the whole LPU the other 9. That covers all 15."
- F: "Half-LPU l measures ⟨X̄₁, Z̄₇⟩, half r ⟨X̄₇, Z̄₁⟩, and the full LPU with the bridge the other 9 (A.4): 3 + 3 + 9 = 15. Each runs C = 10 or 18 deformed cycles; edge-colouring gives 12 timesteps per cycle (A.5), so τ_M = 120, 216; an integer program reaches 9C + b, b ∈ {1, 2}."
- Cap G/F "the full LPU lit for Ȳ₁" · Stage `sg(gross,'full',{measure:'Y1'})` · Claims `p1Modes` [3,3,9], `p1TauM` · Reported `x-p56`, `x-p57`, `t8` (d*_s = d*_t = 12, 18; Table 8, p. 62) · Fidelity "§2.3 words the cost as C deformed cycles plus one original cycle; Table 2's 120 is 12C".
**b5 [C]** (the two-gross LPU)
- Q G: "Two-gross: each half graph has 20 vertices and 32 edges. They keep 11 and 9 cycles and add 17 bridge edges. How many helper qubits?" · Q F: "For two-gross, G_l and G_r have 20 vertices and 30 + 2 edges, keep 11 and 9 cycles, and are joined by 17 bridge edges and one identified vertex. Compute u."
- Reveal G: "39 vertices, counted as 40 with the Bell check, 81 edges and 37 kept cycles. Total 158, Table 1's u for two-gross." · Reveal F: "V = 39 (+1 for v_Bell), E = 32 + 32 + 17 = 81, U = 11 + 9 + 17 = 37 of rank 43, so u = 158 (Table 1). The 2 + 2 added edges secure distance 18 (A.3, p. 50)."
- Cap G/F "the two-gross LPU" · Stage q `sg(two-gross,'l')`; reveal `sg(two-gross,'full')` · Claims `p1Gl2gV` 20, `p1Gl2gE` 30, `p1Lpu2gV` 39, `p1Lpu2gVq` 40, `p1Lpu2gE` 81, `p1Lpu2gKept` 37, `p1Lpu2gRank` 43, `p1U2g` 158 (uses `a3-2g`) · Reported `a3-2g` "2 + 2 added edges; 11 and 9 kept; 17 bridge edges" (A.3, pp. 50–51).

### Unit `p1-between` — Joining modules and injecting T
**b1 [L]** (Bell couplers, the code–code adapter) · Terms `pp-bell-coupler`, `pp-adapter-cc` · Bridge B3 `b3-bridges` · Trail `cro24` "§3.8, Thm 24" — joined systems keep fault distance; `sjy24` "§IV, Def. 8" — the adapter idea
- G: "Modules talk through [[pp-bell-coupler|Bell couplers]], links that share a Bell pair. The two bridges are joined by Bell checks, at 22 qubits for gross. Protection drops to d − 1, yet 6 faults are still needed."
- F: "A Bell-coupler makes (|00⟩ + |11⟩)/√2 across modules within a cycle (§2.4). The [[pp-adapter-cc|code–code adapter]] turns bridges into Bell checks: a = 2(d − 1) = 22 or 34; joining by w = 11 edges adds 10 cycles. Distance falls to d − 1, but for even d, ⌈(d − 1)/2⌉ = d/2: 6 and 9 faults."
- Cap G/F "two modules, their LPUs joined through the adapter" · Stage `mm(gross,1e-3,2,{hl:'inter-module'})` · Claims `p1A`, `p1A2g` 34, `p1JoinCycles` 10, `p1HalfD` [6, 9] · Reported `t4-phenom` (≤ 11, ≤ 17; Table 4, p. 17).
**b2 [L]** (the code–factory adapter) · Terms `pp-adapter-cf` · Trail `sjy24` "§VI.2" — joining a QLDPC code to a surface-type code
- G: "A factory holds its T state in a surface-code patch. A path of d LPU vertices is wired to that patch's Z̄ line. Vertices and the edges between them each need a qubit: 2d − 1."
- F: "The [[pp-adapter-cf|code–factory adapter]] wires a path of d_factory vertices to the support of Z̄_T and its d_factory − 1 edges to adjacent X checks (Fig. 14): a′ = 2d_factory − 1 = 29, 13, 49 for d_factory = 15, 7, 25 (Table 3). Any element of ⟨X̄₁, X̄₇, Z̄₁, Z̄₇⟩ ⊗ Z̄_T becomes measurable."
- Cap G/F "the factory at the end of the line, adapter lit" · Stage `mm(gross,1e-3,2,{hl:'t-injection'})` · Claims `p1APrimes` [29, 13, 49] (uses `t3-*`).
**b3 [B]** (teleporting T in) · Bridge B4 `b4-injection` · Trail `lit19b` "Fig. 1" — the P ⊗ Z then X injection gadget
- G: "Chapter B4 teleported a T gate using a T state. Measure Z̄_T ⊗ P̄ with the pivot, then read the factory in X. Half the time a quarter-turn fix follows, tracked in software."
- F: "T injection (§2.5; Chapter B4): measure Z̄_T ⊗ P̄, P̄ ∈ {X̄₁, Ȳ₁, Z̄₁, X̄₇, Ȳ₇, Z̄₇}, then X̄_T; with an outcome-dependent P(π/2) this applies P(π/4) = e^{iπP/8} (Eq. 23). To first order P_T = P_factory + P_C and τ_T = τ̄_factory + τ_C + 1 (p. 15)."
- Cap G/F "both outcomes end on the same rotated state" · Stage `B4:t-injection` (split circuit / amplitudes) · Claims `p1InjGap` 0 (B4's two-branch check).
**b4 [L]** (four factories; cultivation's mean time) · Trail `gsj24` "Fig. 2" — the error and discard rates Table 5 copies
- G: "At physical error rate p = 10⁻³ the factory uses cultivation: grow and check one T state, throwing failures away. A kept state costs 351 timesteps on average. At 10⁻⁴ the paper uses distillation."
- F: "Cultivation at p = 10⁻³: with 35 % and 69 % discarded at its two checkpoints, the mean time is t_c/(1 − P′_cult) + t_e/(1 − P′_esc) = 1.54·39 + 3.23·90 = 351 (Eqs. 73–80); unrounded inputs give 352.5, a rounding. At 10⁻⁴: 15-to-1 distillation from Litinski's Table 1, cycles × 6."
- Cap G/F "mean time against the chance of keeping a run" · Stage `pl(B4:cultivation-time,{factory:'1e-3-gross'})` · Claims `p1Esc3` 0.69, `p1Cult3` 351, `p1Cult3Exact` 352.5 (uses `t5-d3`, `t5-t`) · Reported `t3-*` (Table 3, p. 14), `t5-d3`.
**b5 [L]** (Correction box E2: the 73-timestep factory)
- G: "The paper times the 10⁻⁴ gross factory at 73 timesteps. Its own rule, cycles times 6, gives 6 × 18.1 = 108.6. The same rule does give the other factory's 407."
- F: "Table 3 prints τ̄ = 73 for the 10⁻⁴ gross factory, Litinski's (15-to-1)_{7,3,3} with 18.1 code cycles; the stated rule gives 108.6, while 6 × 67.8 = 406.8 matches the two-gross 407 (Correction box). The text also calls the first protocol two-round; only the second is."
- Cap G/F "the 10⁻⁴ factory at the end of a gross line" · Stage `mm(gross,1e-4,2,{hl:'t-injection'})` · Claims `p1Dist4g` 108.6, `p1Dist4tg` 406.8 (uses `lit19b-t1`) · Reported `t3-g4` 73, `t3-2g4` 407, `lit19b-t1` 18.1 and 67.8 cycles (a reference's number: §12 Q4).
**b6 [C]** (which error dominates)
- Q G: "A T injection's error is the factory's plus one joint measurement's. At p = 10⁻³ on gross, which is bigger?" · Q F: "With P_T = P_factory + P_C (p. 15), which term dominates for the 10⁻³ gross factory?"
- Reveal G: "The joint measurement: about 2.0 × 10⁻³, against 3 × 10⁻⁶ for the factory. A better factory would not help until joint measurements improve." · Reveal F: "P_C = 2.0 × 10⁻³ (Eq. 82 with Table 6, Unit 7) against P_factory = 3 × 10⁻⁶: P_T ≈ 2.02 × 10⁻³. Section 2.7 names inter-module measurements as the limiting instruction."
- Cap G/F "the inter-module curve, marker at p = 10⁻³" · Stage q `mm(gross,1e-3,2,{hl:'t-injection'})`; reveal `pl(tdg-failure,{series:['g-xx'],marker:1e-3})` · Claims `p1PC3` 2.01e-3, `p1PT3` 2.02e-3 (uses `t6-6`, `t3-g3`).

### Unit `p1-benchmark` — Error rates no simulation can sample
**b1 [B]** (one size of fault; circuit distance) · Bridge B1 `b1-cycle`
- G: "Every gate, wait, preparation and reading can fail. The paper splits each failure into equal faults of chance q = p/15, 15 per spot. At most 10 faults can do harm unseen on gross."
- F: "Circuit noise (§2.6; Chapter B1): preparation and measurement fail with p, idles X, Y, Z at p/3, CNOTs one of 15 Paulis at p/15. Splitting gives 15 faults of q = p/15 per location (A.7), N = 210 960 for the gross idle. With d_circ ≤ 10, 18 (Table 4), f(w) = 0 below w₀ = ⌈d/2⌉ = 5, 9."
- Cap G "one check's circuit with its fault sites" · F "the fault sites of Fig. 4a's circuit under the §2.6 model" · Stage `B1:fault-count` · Claims `p1QFaults` [15,15,15], `p1W0` [5, 9] · Reported `t6-1` (N, Table 6, p. 61), `t4-circ`, `f7-dcirc`.
**b2 [L] · notation beat, `introduces: ['pp-failure-spectrum']`** (D4) · Trail `bev25` "§2.2 Eq. 1; §3.2 Eq. 10" — the binomial sum and the ansatz
- G: "Sort failures by how many faults caused them. The [[pp-failure-spectrum|failure spectrum]] f(w) is the share of w-fault sets that defeat the decoder. Weigh each by its binomial chance and add."
- F: "With f(w) the failing fraction at weight w, P(q) = Σ_{w≥w₀} f(w) C(N, w) q^w (1 − q)^{N−w} (Eq. 82; <<pp-f5-spread|the binomial>>). The ansatz f = a[1 − e^{−(f₀/a)(w/w₀)^γ}], a = 1 − 2^{−K} (Eq. 83), fitted where Monte Carlo reaches, carries P to low p: slope 4.99 ≈ w₀ near p = 10⁻⁶."
- Cap G/F "P against p on log axes for the gross idle: the line steepens to slope 5" · Stage `pl(tdg-failure,{series:['g-idle'],view:'pp'})` · Claims `p1Slope` 4.99 (uses `t6-1`) · Derivation D4.
**b3 [L]** (Table 2 rebuilt)
- G: "Feed the paper's fitted numbers into that sum. It returns every measured rate of Table 2. For the gross idle at p = 10⁻³ it gives 10 to the power −8.79."
- F: "Eq. 82 with Table 6's (f₀, γ, w₀, K, N) and q = p/15 reproduces every measured P of Table 2 to the printed digit: idle, shift, Ȳ₁ (in-module) and X̄₁ ⊗ X̄₁ (inter-module), both codes, both p. The match needs no division by C, although A.7 calls idle and shift rates per repetition (§12 Q3)."
- Cap G/F "the fitted curves through Table 2's points" · Stage `pl(tdg-failure,{series:'gross-all',overlay:'table2'})` · Claims `p1LogP3` {I −8.79, U −6.40, M −4.96, C −2.70; two-gross I −20.09, U −14.49} (uses `t6-*`) · Reported `t2-*`.
**b4 [L]** (fewer light logicals) · Trail `bev25` "§4.3" — counting minimum-weight failures
- G: "At p = 10⁻³ the two-gross idle fails with chance about 8.1 × 10⁻²¹. A distance-17 surface code fails with about 3.2 × 10⁻¹⁰ by the paper's rule of thumb. Fewer lightest logicals is the paper's explanation."
- F: "Eq. 82 gives 8.1 × 10⁻²¹ for the two-gross idle at 10⁻³; §2.6's 0.1(p/0.01)^{d/2} gives 3.2 × 10⁻¹⁰ at d = 17. The paper credits entropy: 336 weight-18 X̄ against 875 178 in the d = 18 rotated toric code, cautioning against over-reading the extrapolation."
- Cap G/F "two-gross idle and the d = 17 surface formula against p" · Stage `pl(tdg-failure,{series:['2g-idle'],compare:'surface-2.6',d:17})` · Claims `p1P2gIdle3` 8.1e-21, `p1Surf17` 3.16e-10 · Reported `x-p17a`, `x-p17b`.
**b5 [C]** (how many before one fails)
- Q G: "At p = 10⁻⁴ a gross joint measurement fails with chance 10 to the power −7.3. About how many can run before one fails?" · Q F: "Using P_C(10⁻⁴) from Eq. 82, estimate the expected number of inter-module measurements per failure."
- Reveal G: "About 21 million. A long program needs millions of them, and every T injection includes one, so this step sets the machine's limit." · Reveal F: "1/P_C = 2.08 × 10⁷. The TFIM program (Unit 9) has 9.4680 × 10⁵ of them plus 1.5542 × 10⁷ T injections, each also carrying P_C, so these dominate Eq. 26."
- Cap G/F "the inter-module curve, marker at 10⁻⁴" · Stage q/reveal `pl(tdg-failure,{series:['g-xx'],marker:1e-4})` · Claims `p1PerFail4` 2.08e7 · Reported `t9-g`.

### Unit `p1-compile` — From gates to bicycle instructions
**b1 [B]** (Pauli-based computation) · Bridge B4 `b4-pbc` · Trail `lit19a` "§1, Figs. 4–6" — pushing Cliffords past rotations; `bss16` "abstract" — the name and idea
- G: "Chapter B4 rewrote any circuit as Pauli turns and Pauli measurements. Clifford gates are pushed to the end, where they only relabel the final readings. The paper starts from that form."
- F: "Step 1 (A.9; Chapter B4): commute Cliffords forward with C†e^{iφP}C = e^{iφC†PC} (Eq. 86), leaving rotations P′_j(φ_j) and measurements; the final Clifford relabels the readout and is never run (Eqs. 87–88). The diagrams (Eq. 1) leave Pauli fix-ups implied ([[pp-measurement-projection|measurement projections]])."
- Cap G/F "a small circuit before and after the Cliffords move out" · Stage `pp(B4:pbc-compile)` · Claims `p1PbcGap` 0.
**b2 [L]** (a long Pauli across modules) · Bridge `pp-q7-ghz` · Trail `lit19a` "Fig. 5" — a controlled Pauli as three π/4 rotations (Eq. 7)
- G: "A long Pauli is cut into pieces, one per module. First the pivots are tied into a GHZ state by measuring neighbours in pairs. Then each module makes one measurement of its own."
- F: "Factor P = P₁ ⊗ ⋯ ⊗ P_M over M = ⌈n/11⌉ modules (§3.1). Controlled-P becomes a GHZ state of pivots from M − 1 ZZ measurements (Eq. 5) plus one Y ⊗ P_i measurement per module (Eqs. 7–12, via Eq. 10 of Chapter B4). For n = 33: M = 3, 2 ZZ, 3 in-module."
- Cap G/F "a 33-qubit Pauli as bicycle columns: ZZ links, then one Y ⊗ P_i per module" · Stage `pp(tdg-distribute,{n:33})` · Claims `p1M33` 3, `p1ZZ33` 2.
**b3 [L]** (native measurements; Correction box E3) · Terms `pp-native-measurement` · Trail `cro24` "§4.3" — native measurements and Clifford generation
- G: "Slides move the LPU's 15 measurements around: 540 cheap ones, called native. A native one that uses the pivot gives a quarter turn on the rest. The paper counts 510 such turns; we find 245."
- F: "[[pp-native-measurement|Native measurements]] N (Eq. 14): 540 per code, and every X̄_i, Z̄_i is native (agreed). Eqs. 15–16 turn Q ⊗ R ∈ N with Q ∈ {X, Y, Z} into R(π/2): our calculation finds 245 such R. The printed 510 also counts R from the 284 native measurements with I on the pivot, which Eq. 16 cannot use (Correction box)."
- Cap G/F "a native rotation as Eq. 16: X on the pivot, Y ⊗ R, Z on the pivot" · Stage `pp(tdg-native,{code:'gross',example:0})` · Claims `p1Native` 540, `p1NatRot` 245, `p1NatRotAll` 510, `p1PivotI` 284 · Reported `x-p24` "540 native measurements; 510 native rotations" (§3.2, p. 24).
**b4 [L]** (pricing any in-module measurement; D5)
- G: "Any Pauli on a module is a native one turned by a few native quarter turns, before and after. Each turn costs six measurements over both sides. So prices are 1, 7, 13, 19 or 25."
- F: "Q ⊗ P_i = U(Q ⊗ R)U†, U = R₁⋯R_k (Eq. 17); each native rotation is three measurements, used before and after: β = 1 + 6k. Fig. 9 reports β ∈ {1, 7, 13, 19, 25}, means 18.48 (gross) and 18.58 (two-gross) after choosing the pivot basis."
- Cap G "how many measurements a random Pauli costs: mostly 19" · F "Fig. 9 (right) as printed, reported style" · Stage `pl(bars,{reported:'f9'})` · Claims `p1Beta` [1,7,13,19,25] · Reported `f9` · Derivation D5.
**b5 [L]** (small angles from T injections) · Bridge B4 `b4-synthesis` · Trail `rs16` "abstract" — about 3 log₂(1/ε) T gates per rotation
- G: "A small turn is approximated by a string of T gates, about 3 log₂(1/ε) of them. Each T is one injection into the pivot. A π/4 turn needs just one and is exact."
- F: "Ross–Selinger gives Z(φ) ≈ H_kT⋯H₁TC₀ (Eq. 19); commuting H and π/2 rotations through (Eqs. 20–22) leaves gates in {T, X(π/4), Y(π/4)}, each one injection whose basis depends on earlier outcomes (Eqs. 23–24). At ε = 5 × 10⁻⁹: 3 log₂(1/ε) = 82.7, against 84.5 T per rotation in Table 9."
- Cap G/F "T count against accuracy, marker at 5 × 10⁻⁹" · Stage `pl(B4:rs-tcount,{marker:5e-9})` · Claims `p1RsT` 82.7, `p1TPerRot` 84.5 (uses `t9-g`, `x-p67`).
**b6 [C]** (a Pauli on 100 qubits)
- Q G: "A Pauli acts on all 100 data qubits of a machine. How many modules take part, and how many ZZ measurements tie their pivots?" · Q F: "For a full-support P on n = 100 logical qubits, give M and the number of ZZ measurements in the GHZ preparation (Eq. 5)."
- Reveal G: "Ten modules, so nine ZZ measurements along the line, then ten in-module ones. The GHZ state is the only entanglement used between modules." · Reveal F: "M = ⌈100/11⌉ = 10 and 9 ZZ measurements (two rounds on a Hamiltonian path, §3.4), then 10 Y ⊗ P_i; footnote 8 trims modules with P_i = I."
- Cap G/F "ten modules, all pivots lit" · Stage q `pp(tdg-distribute,{n:33})`; reveal `mm(gross,1e-3,10,{hl:'ghz'})` · Claims `p1M100` 10, `p1ZZ100` 9.

### Unit `p1-bill` — The bill: qubits, time and errors
**b1 [L]** (Eq. 25; D6) · Terms `pp-timestep`
- G: "Total qubits: each module brings its code, its LPU and one adapter. Add the factory and its adapter, and drop the unused last adapter. Ten gross modules with the 10⁻⁴ factory: 4801."
- F: "q = M(c + u + a) − a + a′ + f, n = 11M (Eq. 25). With Table 1 this reproduces all six bicycle rows of Fig. 10a (n = 121, 704, 110, 1342, 440, 6886) and the two-gross TFIM machine's 8138; ten gross modules with the 10⁻⁴ factory (a′ = 13, f = 810) give 4801."
- Cap G/F "ten gross modules and a distillation factory: q = 4801" · Stage `mm(gross,1e-4,10,{ro:['q','n']})` · Claims `p1Fig10aN` [121,704,110,1342,440,6886], `p1Q8138` 8138, `p1Q4801` 4801 (uses `t1-*`, `t3-*`) · Derivation D6.
**b2 [L]** (logical capability; Figs. 10a, 1b) · Terms `pp-capability` · Trail `bev22` "App. B, Eq. 1" — the surface-code baseline
- G: "Capability is the longest random program of π/4 turns that still succeeds two times in three. With equal qubits and p, the bicycle machine holds 2.7 to 16.8 times more logical qubits."
- F: "[[pp-capability|Capability]]: random π/4 rotations with failure ≤ 1/3 (§4); the bicycle N_T is reported (Fig. 10a). The surface model of A.10 (2d² per patch, half routing, P₁ = 0.03(p/0.01)^{d/2}, Eq. 89) reproduces five surface rows and their times τ̄ + 6d; the n ratios are 2.7, 16.8, 5.2, 5.4, 16.3, 16.6."
- Cap G/F "logical qubits against T count on log axes: bicycle (reported) beside surface (computed)" · Stage `pl(tdg-capability,{all:true})` · Claims `p1SurfNT` [2.46e6, 3.78e5, 3.17e4, 1.21e15, 7.86e13], `p1NRatio` [2.7,16.8,5.2,5.4,16.3,16.6] (uses `t3-*`, `f10a-*`) · Reported `f10a-*`, `f1b` · Fidelity "the d = 5 row is §12 Q2".
**b3 [L]** (the TFIM workload) · Bridge `pp-l11-generator` · Terms `pp-product-formula` · Trail `bev22` "§III.1, Table 1" — the TFIM benchmark copied
- G: "The test problem is a 10 × 10 grid of spins evolving in time. It compiles to 184 000 small rotations. Gross codes need p ≤ 2.09 × 10⁻⁵; two-gross codes need only p ≤ 7.32 × 10⁻⁴."
- F: "A fourth-order [[pp-product-formula|product formula]] on n_L = 100 sites, 80 steps (A.10): 80 × 5 × (2·180 + 100) = 184 000 rotations. Eq. 26 with Table 9 counts and Eq. 82 rates reproduces Table 10; a power law through two points meets 10⁻³ at p = 2.09 × 10⁻⁵ (gross) and 7.32 × 10⁻⁴ (two-gross)."
- Cap G/F "TFIM failure against p for both codes; dashed target 10⁻³" · Stage `pl(tdg-tfim,{codes:'both'})` · Claims `p1NR` 184000, `p1Fail4` 0.798, `p1Cross` [2.09e-5, 7.32e-4] (uses `t9-*`, `t6-*`, `t2-m-2g`, `t2-c-2g`) · Reported `t9-*`, `t10-*` · Fidelity "3.33 × 10⁴ at p = 10⁻³ is a first-order sum, not a probability".
**b4 [L]** (Correction box E4: 4817)
- G: "The paper's gross design for this problem lists 4817 qubits. Its own formula and Table 1 give 4801. The gap, 16, is the adapter of a different factory."
- F: "Fig. 10b and p. 30 print q = 4817 for ten gross modules with the 10⁻⁴ gross factory (f = 810). Eq. 25 with Table 1 (a′ = 13) gives 4801; 4817 is the same sum with a′ = 29, the cultivation factory's adapter (Correction box). The two-gross 8138 reproduces exactly."
- Cap G/F "the gross TFIM machine with its parts: 4801" · Stage `mm(gross,1e-4,10,{ro:['q','parts']})` · Claims `p1Q4801`, `p1Q4817a29` 4817, `p1QGap` 16 · Reported `x-p30b`.
**b5 [C]** (two T counts; Correction box E5)
- Q G: "The surface rival's error budget uses the program's T count. Table 9 gives 1.5542 × 10⁷, the text 1.9 × 10⁷. Which one made the printed surface thresholds?" · Q F: "Solve Eq. 96 for p at d = 17 with Table 9's N_T and with the text's 1.9 × 10⁷. Which gives the printed 5.89 × 10⁻⁴?"
- Reveal G: "The text's count rebuilds all four printed thresholds. Table 9's gives slightly looser ones, like 5.94 × 10⁻⁴ at distance 17. No conclusion changes." · Reveal F: "Eq. 96 gives 5.89 × 10⁻⁴ only with 1.9 × 10⁷; Table 9's 1.5542 × 10⁷ gives 1.35 × 10⁻⁵, 5.56 × 10⁻⁵, 5.94 × 10⁻⁴, 7.90 × 10⁻⁴ for d = 7, 9, 17, 19 (Correction box). Table 9's 84.5 T per rotation fits 3 log₂(1/ε) + O(log log)."
- Cap G/F "the d = 17 surface curve drawn with each T count" · Stage q/reveal `pl(tdg-tfim,{surface:17,nT:['table9','text']})` · Claims `p1SurfTh` [1.354e-5,5.556e-5,5.937e-4,7.899e-4], `p1SurfThText` [1.329e-5,5.477e-5,5.892e-4,7.846e-4] · Reported `t9-g`, `x-p30d`, `x-p68`.
**b6 [D]** (bigger codes, open problems) · Bridge B2 `b2-bpt` · Trail `bpt10` "abstract" — kd² = O(n) in a plane
- G: "The same two polynomials work on bigger tori: 72r(r + b) qubits, always 12 logical. If the guessed distances hold, the gain nears 24 times the surface code's. Then the paper lists what to fix."
- F: "ℓ = 6(r + b), m = 6r gives n = 72r(r + b) and k = 12 (our ranks, r ≤ 3), with conjectured d = 6(2r + b − 1) (§5). Then kd²/n = 12 (gross), 13.5 (two-gross), → 24, against 1 for the surface code, within kd² = O(n). Open: time overhead, real-time decoding, larger LPUs, factories using long links."
- Cap G/F "kd²/n against code size: 6, 12, 13.5, 16, 16.67 toward 24" · Stage `pl(tdg-family,{rMax:3})` · Claims `p1FamN` [72,144,288,432,648], `p1FamK` 12, `p1FamRatio` [6,12,13.5,16,16.67], `p1Limit` 24 (uses `x-p32`) · Reported `x-p32` (conjectured d).

**Count:** 4 + 5 + 5 + 6 + 5 + 6 + 5 + 6 + 6 = **48 beats**, 9 clues, 1 Go-deeper, 5 Correction beats.

### 1.10 Claim ledger (key — engine call — value; class; numpy section of `planP1-numpy.py`)
- criteria: `p1N3` `tdgQubits(gross,M=3).n` 33 C · `p1C` `bbModuleQubits(12,6).total` 288 C · `p1PerLogical` 31.5 C←R · `p1Surf13x12` `surfaceQubitsForLogical(12,13)` 4044 C · `p1Ratio13` `surfaceToModuleRatio(12,378,13)` 10.7 C←R · `p1Yield5000` `tdgYield(5000,2)` 2983 C←R · `p1Q17x12` 6936 C · `p1YieldMod17` 66086 C←R (§9). modules: `p1A` `adapterQubits(12)` 22 · `p1APrime` `codeFactoryAdapterQubits(15)` 29 · `p1NShift/NIn/NInter/NT` `instructionCounts(12,6)` 12, 15, 36, 6 · `p1PerSide` 6, `p1Pairs225` 225 · `p1TauI/U/M/M2g` `tdgDurations` 8, 14, 120, 216 C←R (§5).
- gross: `p1GrossN/K/Wt` `bbCode(GROSS_SPEC)` 144, 12, 6 · `p1X1Wt` 12, `p1X1Meets` [0, 2] · `p1BasisWt`, `p1Overlaps` `paperLogicalBasis` · `p1PairDiag/Off` `pairingMatrix` 12, 0 · `p1TwoN/K/Wt` 288, 12, 20 (§1). idle-shift: `p1GrossChecks` 144, `p1Cycle10` 81 · `p1BellP` 0.125, `p1BellMiss` 0 `circuit-gates` · `p1BasicShifts` 12 · `p1ImgX1` [4, 6] · `p1AxGap` 0, `p1AxLowerT` 0, `p1AxLowerDiff` 16, `p1Order` 6, `p1Classes` 36, `p1MaxFactors` 2 `logicalXAction` (§2, §10–11).
- lpu: `p1GlV/E/Rank` 12, 18, 7 · `p1GrV/E` 12, 18 · `p1LpuV/Vq/E/Rank/Kept` 23, 24, 47, 25, 19 · `p1U` 90, `p1U2g` 158 C←R · `p1Gl2gV` 20, `p1Lpu2gV/Vq/Kept` 39, 40, 37 · `p1Modes` [3,3,9] · `p1Gl2gE` 30, `p1Lpu2gE` 81, `p1Lpu2gRank` 43 `tdgLpuGraph` (§4). between: `p1A2g` 34 · `p1JoinCycles` 10 · `p1HalfD` [6, 9] · `p1APrimes` [29,13,49] · `p1InjGap` 0 (B4) · `p1Esc3` 0.69, `p1Cult3` 351, `p1Cult3Exact` 352.5 · `p1Dist4g` 108.6, `p1Dist4tg` 406.8 · `p1PC3` 2.01e-3, `p1PT3` 2.02e-3 (§5–7).
- benchmark: `p1QFaults` · `p1W0` [5, 9] · `p1Slope` 4.99 · `p1LogP3` (6 values) · `p1P2gIdle3` 8.1e-21 · `p1Surf17` 3.16e-10 · `p1PerFail4` 2.08e7 `tdgPiid` (Eqs. 82–83, lgamma/log1p/expm1) (§7, §12). compile: `p1PbcGap` 0 (B4) · `p1M33` 3, `p1ZZ33` 2, `p1M100` 10, `p1ZZ100` 9 · `p1Native` 540, `p1NatRot` 245, `p1NatRotAll` 510, `p1PivotI` 284 `tdgNativeSets` · `p1Beta` · `p1RsT` 82.7 · `p1TPerRot` 84.5 (§3, §8, §11).
- bill: `p1Fig10aN`, `p1Q8138`, `p1Q4801`, `p1Q4817a29`, `p1QGap` 16 `tdgQubits/tdgMaxModules` · `p1SurfNT`, `p1NRatio` `tdgSurfaceRows` (Eq. 89) · `p1NR` 184000 · `p1Fail4` 0.798 · `p1Cross` · `p1SurfTh`, `p1SurfThText` (Eq. 96) · `p1FamN/K/Ratio`, `p1Limit` (§8–9).

## 2. Derivations (step `tex` — why — **view**; Ground ≥ Formal; ≥ 2 views each)
**D1 · criteria:b3 · yield = y^J ≈ 1/2983** — G (4): (1) each junction works with y = 0.9998 · **pl yield, marker 378** · (2) all J must work: y^J · (3) J = 2·5000 + 3·10 000 = 40 000 · (4) y^J = e^{J ln y} ≈ 1/2983 · **pl yield, marker 5000**. F (3): (1) independence → y^J · **pl 378** · (2) J from junction counts · (3) e^{J ln y} · **pl 5000**.
**D2 · idle-shift:b5 · block 7–12 = Aᵀ** — G (4): (1) the mirror X(p, q) ↦ Z(qᵀ, pᵀ) sends X̄_{i+6} to Z̄_i, slid by one fixed ν⁻¹ · **cb ops X7, Z1** · (2) the mirror reverses slides: x becomes x⁻¹ · **cb ops X7, Z1, shift x** · (3) Z labels move by the inverse transpose of the X move, so x⁻¹ moves Z̄₁…₆ by Aᵀ · **bg block 1–6** · (4) mirror back: x moves X̄₇…₁₂ by Aᵀ · **bg both**. F (3): (1) D(δO) = δ⁻¹D(O), D(X̄_{i+6}) = ν⁻¹Z̄_i · **cb** · (2) a CNOT circuit M maps Z(b) → Z(M⁻ᵀb): δ⁻¹ acts on Z̄₁…₆ by (A⁻¹)⁻ᵀ = Aᵀ · **bg 1–6** · (3) block 7–12 = Aᵀ ≠ A since A_x ≠ A_xᵀ · **bg both**.
**D3 · lpu:b3 · u = 90** — G (4): (1) vertices 12 + 12 − 1 = 23, v_Bell as two qubits: 24 · **sg l** · (2) edges 18 + 18 + 11 = 47 · **sg full** · (3) cycles kept 5 + 3 + 11 = 19 of rank 47 − 23 + 1 = 25 · (4) 24 + 47 + 19 = 90 · **sg full, census**. F (3) same, rank via E − V + 1 · **sg l** / **sg full**.
**D4 · benchmark:b2 · P ∝ q^{w₀} at small q** — G (3): (1) w faults among N sites: C(N, w)q^w(1 − q)^{N−w} · **pl fw** · (2) at small q the smallest w that fails dominates · (3) so log P has slope w₀ = 5 against log p · **pl pp**. F (3): (1) Eq. 82 · **pl fw** · (2) leading term f(w₀)C(N, w₀)q^{w₀} · (3) slope 4.99 between 10⁻⁶ and 10⁻⁵ · **pl pp**.
**D5 · compile:b4 · β = 1 + 6k** — G (3): (1) a native rotation is three measurements (Eq. 16) · **pp tdg-native** · (2) k rotations before and k after: 6k · **pp tdg-distribute** · (3) plus the native measurement itself: 1 + 6k · **pl bars**. F (2): (1) Eq. 16 · **pp native** · (2) Eq. 17 · **pl bars**.
**D6 · bill:b1 · Eq. 25** — G (4): (1) one module c + u + a = 400 · **mm M=1** · (2) M modules use M − 1 adapters: M·400 − 22 · **mm M=3** · (3) add a′ + f · **mm M=3 factory** · (4) the largest M under 5000 at 10⁻³ is 11, n = 121 · **mm M=11**. F (3): (1)+(2) · **mm M=3** · (3) · (4) max M · **mm M=11**.
**viewCaptions:** D1 "a 378-qubit module" / "a 5000-qubit chip" · D2 "the mirror pair" / "slid by x" / "the upper block" / "both blocks" · D3 "one half" / "the whole graph" · D4 "failures by fault count" / "slope 5 at low p" · D5 "one native rotation" / "conjugation" / "the prices" · D6 "one module" / "three modules" / "with the factory" / "eleven modules".

## 3. Try-it widgets (props read from `BitTable.tsx`, `BlochSphere.tsx`, `DepositStats.tsx`, `GhzGame.tsx`; W1 is new, §9.3)
| Unit | Spec | Try this |
|---|---|---|
| criteria | W1 `machine-dial {code:'gross', factory:'1e-3', budget:5000, readouts:['yield']}` | Raise the budget from 5000 to 50 000: one chip that size becomes far rarer (y^J falls), while each module's reported 2 in 5 stays the same. |
| modules | W1 `machine-dial {code:'gross', factory:'1e-3', M:3}` | Read the five parts. Switch to two-gross: c doubles to 576 and a grows to 34; the data qubits stay 33. |
| gross | `bit-table {mode:'strings', a:'111111', b:'100100', combine:'dot'}` | a is a Z check's six qubits, b where X̄₁ touches it: a·b = 0, they commute. Set b to 100000: a·b = 1, so it is no logical. |
| idle-shift | `bit-table {mode:'reduce', rows:['0101','0100','0011','1101']}` | Rows are A_x's first four rows cut to four columns. Step to the end: rank 4. The whole 6 × 6 A_x has rank 6, since a shift can be undone (A_x⁶ = I). |
| lpu | `bit-table {mode:'reduce', rows:['11000','10110','01101','00011']}` | Rows are 4 vertices, columns 5 edges of a small graph. Step to the end: rank 3, so the null space has 5 − 3 = 2 cycles, E − V + 1. |
| between | `bloch-sphere {theta:90, phi:45, landmarks:true}` | T\|+⟩ sits on the equator at 45°, halfway between \|+x⟩ and \|+y⟩: no named stabilizer state is there, which is why factories must make it. |
| benchmark | `deposit-stats {state:'+z', axis:60, seed:7}` | Run 100 then 1000 tries: the count scatters around Np by about √(Np(1 − p)). Eq. 82 weighs exactly such binomial counts of faults. |
| compile | `ghz-game {mode:'quantum'}` | The three players share a GHZ state, like three pivots. Play: the product of their X answers is always +1, the link Eq. 5 builds. |
| bill | W1 `machine-dial {code:'gross', factory:'1e-4', budget:4801}` | At 4801 qubits the dial gives M = 10, n = 110. Lower the budget by 1: M drops to 9. Set two-gross, 10⁻³, 8138: M = 10 again. |

## 4. Challenges (tol 0.005 unless stated; integers tol 0; papers have no homework, so full walkthroughs)
- **criteria** 1 warm-up numeric `p1-c-ratio` 12 patches at d = 11 against 378 → **7.65** (tol 0.01). 2 core numeric `p1-c-yield` 1000-qubit chip, 2 couplers/qubit → **0.202**. 3 core choice `p1-c-which` the criterion surface codes fail → **efficient** ✓.
- **modules** 1 warm-up numeric `p1-m-n` data qubits in 7 modules → **77**. 2 core numeric `p1-m-c` c for two-gross → **576**. 3 stretch numeric `p1-m-tau` τ_M two-gross → **216**.
- **gross** 1 warm-up numeric `p1-g-k` k of gross → **12**. 2 core numeric `p1-g-wt` weight of two-gross X̄₇ → **20**. 3 core choice `p1-g-test` X(p, q) is logical iff → **pB + qA = 0** ✓.
- **idle-shift** 1 warm-up numeric `p1-s-tau` τ_U → **14**. 2 core numeric `p1-s-classes` logical shift classes → **36**. 3 stretch numeric `p1-s-diff` places where A_x and A_xᵀ differ → **16**.
- **lpu** 1 warm-up numeric `p1-l-rank` cycle rank of G_l → **7**. 2 core numeric `p1-l-u` u for gross → **90**. 3 core numeric `p1-l-full` measurements needing the full LPU → **9**.
- **between** 1 warm-up numeric `p1-b-ap` a′ for d_factory = 9 → **17**. 2 core numeric `p1-b-cult` d₁ = 5 mean time from the printed coefficients → **2167**. 3 stretch numeric `p1-b-dist` 6 × 18.1 → **108.6** (tol 0.1).
- **benchmark** 1 warm-up numeric `p1-e-w0` w₀ for two-gross → **9**. 2 core numeric `p1-e-pc` log₁₀ P_C (gross, 10⁻⁴) → **−7.32** (tol 0.05). 3 core numeric `p1-e-q` q-faults per CNOT → **15**.
- **compile** 1 warm-up numeric `p1-p-m` M for n = 50 → **5**. 2 core numeric `p1-p-native` native measurements → **540**. 3 stretch numeric `p1-p-beta` β for k = 2 → **13**.
- **bill** 1 warm-up numeric `p1-x-q` q for 3 gross modules + 10⁻³ factory → **1661**. 2 core numeric `p1-x-n` n at 50k, two-gross, 10⁻³ → **704**. 3 stretch numeric `p1-x-ratio` kd²/n for r = 2, b = 1 → **16**.

## 5. Glossary (new `pp-` ids; only `pp-check` exists)
| id | term | introduces | Ground | Formal | first |
|---|---|---|---|---|---|
| `pp-bicycle-architecture` | bicycle architecture | — | A quantum computer built from BB-code modules linked by Bell pairs. | Modules (c, u), adapters (a, a′), factories f; programmed in bicycle instructions. | criteria:b1 |
| `pp-code-module` | code module | — | One BB code storing 12 logical qubits, with its helpers. | A gross or two-gross code (c = 4ℓm qubits) plus its LPU. | modules:b1 |
| `pp-lpu` | logical processing unit (LPU) | — | A fixed helper graph that measures logicals on qubits 1 and 7. | Gauging system measuring ⟨X̄₁, Z̄₁, X̄₇, Z̄₇⟩; u = 90, 158. | modules:b1 |
| `pp-pivot` | pivot qubit | notation | Logical qubit 1, kept free as every module's helper. | Ancilla qubit 1; n = 11M data qubits. | modules:b2 |
| `pp-bicycle-instruction` | bicycle instruction | — | One allowed step: idle, shift, measure, joint measure or T injection. | 12 + 15 + 36 + 6 instructions plus the idle (Table 2). | modules:b3 |
| `pp-xpq` | X(p, q), Z(r, s) | notation | X on the L qubits in p and the R qubits in q. | Operators from polynomials in F₂[x, y]/(x^ℓ − 1, y^m − 1). | gross:b2 |
| `pp-zx-duality` | ZX-duality | — | Every X-type logical has a mirrored Z-type twin. | X(p, q) logical ⇔ Z(qᵀ, pᵀ) logical. | gross:b3 |
| `pp-logical-basis` | logical basis | — | Twelve X̄ and twelve Z̄ that pair off one to one. | Canonical: X̄_i, Z̄_j anticommute iff i = j. | gross:b4 |
| `pp-bell-check` | Bell check | notation | A check split over two helpers sharing a Bell pair. | Parity of two X readouts after \|Φ⁺⟩-assisted coupling (Fig. 4c). | idle-shift:b2 |
| `pp-shift-instruction` | shift instruction | — | A hardware move sliding every qubit one step on the torus. | Two swap rounds through check qubits plus a cycle; τ_U = 14. | idle-shift:b3 |
| `pp-bell-coupler` | Bell coupler | — | A link making a Bell pair between two modules. | Prepares (\|00⟩ + \|11⟩)/√2 across modules within a cycle. | between:b1 |
| `pp-adapter-cc` | code–code adapter | — | Qubits joining two modules' bridges. | a = 2(d − 1) Bell-check qubits. | between:b1 |
| `pp-adapter-cf` | code–factory adapter | — | Qubits joining a module to a T factory. | a′ = 2d_factory − 1. | between:b2 |
| `pp-failure-spectrum` | failure spectrum f(w) | notation | The share of w-fault sets the decoder gets wrong. | P(q) = Σ f(w)C(N, w)q^w(1 − q)^{N−w} (Eq. 82). | benchmark:b2 |
| `pp-measurement-projection` | measurement projection | — | A measurement whose fix-up is assumed done. | Projection with an implied anticommuting Pauli correction (Eq. 1). | compile:b1 |
| `pp-native-measurement` | native measurement | — | A cheap measurement: a slid copy of an LPU one. | N = {(U ⊗ U)P(U ⊗ U)†} (Eq. 14), 540 elements. | compile:b3 |
| `pp-timestep` | timestep | — | The time of one physical gate, the unit of every price. | One preparation, gate or measurement layer. | bill:b1 |
| `pp-capability` | logical capability | — | How big a random program a machine can run reliably. | Max N_T of random π/4 rotations at failure ≤ 1/3. | bill:b2 |
| `pp-product-formula` | product formula | — | Split a time step into short alternating pieces. | Fourth-order U₄(Δ) (Eqs. 92–94). | bill:b3 |

## 6. Review cards
- **criteria** G: six criteria; a module + LPU is ~10× leaner than surface patches; yield favours modules. F: §1.1, k(2d² − 1)/(c + u), y^J. Eq y^J. Trap: "efficiency is about speed" (it is qubits per logical).
- **modules** G: five parts, a pivot, five kinds of step with prices. F: Table 1, Eq. instruction counts, Table 2. Eq n = 11M. Trap: "all 12 qubits hold data".
- **gross** G: polynomials name operators; four operators and their slides give twelve qubits. F: Eqs. 27–36. Eq pB + qA = 0. Trap: "basis operators always have weight d".
- **idle-shift** G: idle = one cycle; Bell checks split a check; a slide is a CNOT circuit. F: Fig. 4, Eq. 37, A ⊕ Aᵀ. Eq τ_U = 6 + 8. Trap: "both halves get the same circuit" (E1).
- **lpu** G: gauging graphs, two halves, a bridge; 90 helpers. F: A.3 census. Eq u = (V + 1) + E + U. Trap: "every graph cycle gets a check".
- **between** G: Bell couplers, two adapters, T by injection, factories. F: a = 2(d − 1), a′ = 2d_f − 1, Eqs. 73–80. Eq P_T = P_factory + P_C. Trap: "73 timesteps" (E2).
- **benchmark** G: equal-size faults, failure spectrum, Table 2 rebuilt. F: Eqs. 82–83. Eq P(q). Trap: "a rate is per cycle" (Q3).
- **compile** G: PBC, GHZ of pivots, native sets, β, small angles. F: Eqs. 5, 10, 14–17, 23. Eq β = 1 + 6k. Trap: "510 native rotations" (E3).
- **bill** G: Eq. 25, capability, TFIM, family. F: Eqs. 25, 26, 89, 96. Eq q = M(c + u + a) − a + a′ + f. Trap: "4817" (E4), "one T count" (E5).

## 7. Symbol-before-use
**7.1 Ground:** xⁱyʲ, X(p, q) with p, q polynomials gross:b2 · X̄ᵢ, Z̄ᵢ gross:b3 · C idle-shift:b1 · Ȳ₁ lpu:b3 · d (Chapter B1) between:b1 · Z̄_T, P̄, ⊗ between:b3 ·
p (error rate) between:b4 · q, w, f(w) benchmark:b1–b2 · ε compile:b5 · r, b bill:b6. **FLAG:** p names a polynomial (gross:b2) and later the error rate
(between:b4): the paper's own reuse; between:b4 says "the physical error rate p" once.
**7.2 Formal:** k, d criteria:b2 · y, J criteria:b3 · c, u, a, a′, f modules:b1 · n, M modules:b2 · τ_i, C modules:b4 · ℓ, m, (a→, a↑, b→, b↑) gross:b1 · A, B, μ, ν
gross:b2–b3 · α_i, β_i gross:b4 · M (matrix), ⊕ idle-shift:b4–b5 · B, U_B, v_Bell lpu:b2–b3 · P_T, P_C between:b3 · q = p/15, N, w₀ benchmark:b1 · γ, K, f₀
benchmark:b2 · R(π/2), U, β compile:b3–b4 · P₁, N_T, N_R bill:b2–b5. **FLAG:** q is qubits in Eq. 25 but p/15 in Unit 7, M a module count and a matrix,
p a polynomial and an error rate (all the paper's); each beat names its meaning. Counts otherwise: 0 used before definition.

## 8. Errata (Correction boxes, `source: 'paper'`, engine `check`, "our calculation finds …"; page images checked 2026-10-14)
- **E1 holds** (p. 47; Fig. 2 caption and text p. 5: "M = A ⊗ A", "U_i ⊗ U_i"): A_x, A_y on qubits 1–6 (= Eq. 37/38), their transposes on 7–12, both codes;
  A_x ≠ A_xᵀ in 16 places (gross). Forced by the basis (D2); nothing downstream moves (540/245/510 and the Fig. 9 BFS are identical under A ⊕ A). Check
  `p1AxLowerT` = 0, `p1AxLowerDiff` = 16. (p. 47's last line "u_y ⊗ u_i" is a typo for u_y ⊗ u_y: no box.)
- **E2 holds** (Table 3 p. 14 → Table 2 p. 7): τ̄ = 73 for the 10⁻⁴ gross factory; the stated rule gives 6 × 18.1 = 108.6 ([Lit19b] Table 1 line 1: 4.4 × 10⁻⁸,
  810 qubits, 18.1 cycles); line 5 reproduces 407. p. 14's "the former using two distillation rounds" should be the latter. Knock-on: "73 + 120" and
  the surface d = 7 rows' 115 (= 73 + 42) become 109 + 120 and 151. Check `p1Dist4g`, `p1Dist4tg`.
- **E3 holds** (p. 24, "510 native rotations"): Eq. 15 as printed gives 245 (256 native measurements with pivot letter X/Y/Z, 3 of them R = I); 510 counts
  R over all 540, adding 284 with I on the pivot that Eq. 16 cannot use (overlap 19). Fig. 9 BFS: 245 rotations give means 18.53 (gross), 18.48 (two-gross)
  and the printed histogram shape; 510 give 16.48, 16.46, far from the printed 18.48, 18.58. Check `p1NatRot` = 245, `p1NatRotAll` = 510.
- **E4 holds** (Fig. 10b p. 29, p. 30: "q = 4817"): Eq. 25 with Table 1 (a′ = 13, f = 810, M = 10) gives 4801; 4817 needs a′ = 29. Check `p1Q4801`.
- **E5 holds as an inconsistency** (p. 30 "N_T = 1.9 × 10⁷" vs Table 9 p. 67 "1.5542 × 10⁷"): Eq. 96 reproduces p. 68's thresholds only with 1.9 × 10⁷;
  Table 9 gives 1.35, 5.56 × 10⁻⁵, 5.94, 7.90 × 10⁻⁴. The box says which count was used, not which is true (Table 9's 84.5 T per rotation fits
  Ross–Selinger at ε = 5 × 10⁻⁹; 103 would not). Check `p1SurfTh` vs `p1SurfThText`.
- **Found while planning (§12 Q2–Q3):** E6 Fig. 10a (10⁻³, 5k, d = 5): n = 45 printed, but N_T = 7.0 needs n = 50 (q not reduced by f); Eq. 89 with 45
  gives 7.8. O4: A.7 calls idle/shift rates circuit failure ÷ C, yet Tables 2 and 10 equal Eq. 82 undivided (10×, 18× per cycle); conservative.
- **Checked, no box:** τ_T's "+ 1" (p. 15) missing in Table 2 (one timestep); τ_M = 12C vs §2.3's "C deformed + 1 original" (wording; A.5 gives 12C);
  351/2167 from rounded coefficients (352.5, 2243 unrounded); p. 30's 5.4/5.8/7.8 truncate 5.48/5.89/7.85; Eq. 15's "for any" = "for some"; 1884 ≠ 30 × 72
  (unequal orbits); surface TFIM qubits 2d²·100 + f differ from Eq. 89's model (a stated choice).

## 9. Engine gaps, recipes and stage contracts
**9.1 Engine** (`physics/qec/tdg.ts`, twin `pipeline/claims_papers/p1.py`; exists: `bbCode`, `paperLogicalBasis`, `logicalXAction`, `pairingMatrix`,
`instructionCounts`, overhead helpers): `tdgQubits`, `tdgMaxModules` (Eq. 25) · `tdgLpuGraph` (vertices, edges, overlaps, rank; bridge pairs of Eqs. 39/51
as authored data validated as edges; kept-cycle counts via `uses`) · `tdgNativeSets` (both readings, pivot split) · `tdgPiid` (Eqs. 82–83; lgamma, log1p,
expm1) · `tdgPowerLaw` · `tdgSurfaceRows` (Eq. 89) · `tdgSurfaceTfim` (Eq. 96) · `tdgTfimRotations` · `tdgYield` · `tdgCultivationTime` · `tdgFamily` ·
`tdgBlockCheck`. Fig. 9's BFS stays an offline fixture (4¹¹ states).
**Recipes, new in P1 (14):** `tdg-machine` (R-P-2/16, module-map; {code, factory, M | budget 500–10⁶, layout, highlight, focus, readouts}; uses t1-u, t1-f,
t3-*; out c, u, a, aPrime, f, M, n, q) · `tdg-basis` (R-P-3, code; {code, ops ⊂ X1…Z12, shift}) · `tdg-pairing` (R-P-4, bits) · `tdg-shift-action` (R-P-5,
bits; {code, shift, block}) · `tdg-native` (R-P-5, pauli-program; {code, reading, example}) · `tdg-lpu` (R-P-6/7/9, surgery-graph; {code, mode, measure}) ·
`tdg-distribute` (R-P-13, pauli-program; {n 12–66, seed}) · `tdg-failure` (R-P-11/12/22, plot; {series, view, overlay, compare, marker}) · `tdg-tfim` (R-P-18)
· `tdg-capability` (R-P-1/17) · `tdg-family` (R-P-20) · `tdg-yield` (R-P-19) · `tdg-factory` (R-P-21, E2) · `tdg-durations` (R-P-12). **Reused:**
`circuit-gates` (exists); B1 `fault-count`; B2 `bb-torus`, `bb-schedule`, `bb-shift`; B4 `t-injection`, `pbc-compile`, `cultivation-time`, `rs-tcount` (ids
per the B plans). R-P-8 and R-P-14's BFS are not drawn (reported instead). Engine per recipe: machine `tdgQubits`/`tdgMaxModules` + overhead · basis,
pairing `paperLogicalBasis`/`pairingMatrix` · shift-action `logicalXAction`/`tdgBlockCheck` · native `tdgNativeSets` · lpu `tdgLpuGraph` · distribute `tdgDistribute`
(new: M, ZZ links, Y ⊗ P_i columns) · failure `tdgPiid` · tfim `tdgPiid`/`tdgPowerLaw`/`tdgSurfaceTfim`/`tdgTfimRotations` · capability `tdgSurfaceRows` · family
`bbCode` ranks · yield `tdgYield` · factory `tdgCultivationTime` · durations `tdgDurations` (new: 8, 6 + 8, 12C, τ̄ + τ_C).
**9.2 `module-map`** (new SVG kind, P1 build, S4). `{kind:'module-map', machine:{code:'gross'|'two-gross', factory:'1e-3'|'1e-4'|'none', M:1–1000,
layout:'linear'|'triangular'}, highlight?:'none'|'code'|'lpu'|'pivot'|'in-module'|'inter-module'|'t-injection'|'ghz', focus?, readouts?:('q'|'n'|'parts'|
'perLogical'|'yield')[], shot?}`. Counts from the engine (c, a, a′ computed; u, f the REPORTED Table 1 values, badged on their blocks; q by Eq. 25, labelled
"uses Table 1's u and f"). A module = code block c + LPU block u, areas ∝ √count, 12 wire dots (pivot filled, qubit 7 ringed); adapters as bars between
neighbours; a′ + f at the line's end, or beside module 1 with a second adapter column (triangular, M ≤ 6, Fig. 2b); M > 12 shows modules 1–3, "… k
more …", the last 2. Highlights light what an instruction uses ('inter-module': u of focus, focus + 1 and their adapter; 't-injection': f, a′, the adjacent
LPU, pivot; 'ghz': all pivots and adapters); cross-fade on highlight, re-layout on M. Passport "ARCHITECTURE · modules (schematic)"; fidelity "areas follow
qubit counts, positions are a drawing; u and f are the paper's estimates". Print 320 × 220; a11y lists parts and q. Rules: 'q' needs a factory; focus ≤ M − 1.
**Other kinds:** `code` gains an `operator` overlay of engine operators (`{basis:'paper', ops, shift}`, never authored strings); `surgery-graph` source
`{lpu:{code, mode, measure}}` with readouts V, E, rank, kept, u; `pauli-program` bicycle mode with `durations:'table2'` (C←R); `plot` with `xScale:'log'`,
point and `reported` series (hollow, "as printed"), `bars`, curves `tdgYield/Fw/P/Tfim/Capability/Family`; `bits` grids to 12 × 12.
**Spec/platform gaps:** (a) `PaperSpec.corrections?: {where, says, shouldSay, source:'paper', check:{from: RecipeRef, value, equals | notEquals, tol}}[]`
(today `Correction.check` is a function); (b) a reported value from a reference (Lit19b's cycles); (c) bridges into B-chapter units; (d) a Papers Arcade.
**9.3 Widgets.** W1 `machine-dial` (new, P1 build): a small module-map with sliders (code, factory, M or budget), readouts q, n, M, yield; data props only.

## 10. Media
None required. Optional film `pp-p1-shift` "A slide is a CNOT circuit" (manifest `p1ImgX1`, `p1Classes`, `p1AxLowerDiff`); no decor.

## 11. Hooks
**11.1 Concept stations:** the 31 paper nodes of `prereq-graph.md` on the units of their `tdg-*` hints (e.g. `lpu`, `lpu-modes`, `edge-colouring`,
`deformed-schedule` on `p1-lpu`); stations link back to B1–B4 and Q21/Q22 per the graph's `needs`.
**11.2 Arcade (Spot the error, `P1x`, if the Papers Arcade exists):** `pp-same-block` (E1) · `pp-73` (E2) · `pp-510` (E3) · `pp-4817` (E4) · `pp-tcount` (E5) ·
`pp-per-cycle` (O4) · `pp-ten-x` ("10× fewer qubits per logical at any size": the ratios run 2.7–16.8).
**11.3 Bridges and references.** New bridges `pp-f5-spread`, `pp-q7-ghz`, `pp-l11-generator`; reused `pp-q6-bell-basis`. References used (ids): `bra24`, `kit03`,
`cro24`, `wy24`, `sjy24`, `lit19a`, `lit19b`, `gsj24`, `bev25` (identified as arXiv:2511.15177, probable), `bev22`, `rs16`, `bss16`, `bpt10`, `rof20`; all depth 1.

## 12. Questions for the judge
1. **Corrections:** approve E1–E5 (all hold on the page images and in numpy); E5 worded as "which count the thresholds used". **E6**: a sixth box
   (recommended: the row is internally inconsistent) or a fidelity note? **O4**: fidelity note on benchmark:b3 (recommended) or a box?
2. **A reference's number** in E2's check (Lit19b's 18.1 and 67.8 cycles, read online): allow `ReportedClaim.source = 'ref:lit19b'` (recommended; the review
   re-reads it online), or keep it in the Correction text only?
3. **Platform:** data-form Corrections (9.2 a), bridges into B-chapters (c), W1 `machine-dial`, `module-map` as in 9.2.
4. **Fig. 9** stays reported; the BFS means support E3 only inside the Correction text (an offline fixture, not a displayed claim). Agree?
5. **Assumptions shown as ours:** two couplers per qubit (yield), d = 13 as the comparison distance (criteria:b2), a weight-2 Bell-check demo.
6. Unit ids `p1-*` (spec rule) instead of the crawl's `tdg-*`; 48 beats over 9 units, at the ~400-line cap.
