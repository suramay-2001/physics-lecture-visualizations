# References used — *Tour de gross* (paper-tdg)

Need-driven crawl by role P, 2026-10-14 (rulings R5–R7, `docs/roles/decisions/papers.md`). The paper's bibliography has
139 entries. For every step of `digest.md` that leans on a citation we asked: does a reader of the paper lecture need
that reference's content to follow this step, or does the paper (or 448, 709, Q19/Q20, or a background chapter that
another reference already sources) already supply it? Only the first kind was followed (depth 1); from those, only what
was still missing was followed again (depth 2). Nothing was followed past depth 2.

All reading was online (arXiv abstract pages, arXiv HTML, or ar5iv for papers older than arXiv HTML). No file was saved.
Where the full text is not readable online, the entry says "abstract only" and `downloads.md` asks for the PDF.
Titles are shortened on purpose (R7: a full title of 12+ words trips the verbatim guard). "Home" names where the idea
is taught (node ids from `prereq-graph.json`; B1–B4 are the proposed background chapters of `chapters.md`).

Counts: **23 followed at depth 1, 1 at depth 2, 116 deliberately not followed.**

## Followed — depth 1

| Key | Authors | Short title · arXiv | Read | Part relied on | Why the step needs it | Home |
|---|---|---|---|---|---|---|
| Bra+24 | Bravyi, Cross, Gambetta, Maslov, Rall, Yoder | High-threshold low-overhead memory · 2308.07915 (Nature 627, 778, 2024) | arXiv HTML, all sections | §4 Eqs. 1–3 (shift matrices x, y; A, B; H_X = [A\|B], H_Z = [Bᵀ\|Aᵀ]; commutation from AB = BA); Lemma 1 (k = 2·dim(ker A ∩ ker B)); Table 3 (code list with polynomials); Lemma 2 (thickness 2) and Def. 1/Lemma 4 (toric layout); §5 Table 5 and Fig. 5 (depth-8 syndrome cycle); §6 (BP-OSD decoder; circuit-distance upper bounds); §8 (fit formula, surface-code comparison); §9.1–9.2 (logical operators, shift automorphisms as logical CNOTs, group of order ℓm) | §2.1, §2.2 and A.1–A.2 assume the BB definition, the syndrome schedule (Fig. 4b) and the automorphism idea | `bb-code`, `bb-k-formula`, `syndrome-cycle-bb`, `code-automorphism` (B2) |
| Cro+24 | Cross, He, Rall, Yoder | Improved QLDPC surgery · 2407.18393 | arXiv HTML, all sections | §2.2 (the earlier layered ancilla system, recapped); §3.1–3.3 (gauge-fixed ancilla, Thm 1, Def. 3 Cheeger constant, Thm 6, Thm 11: d rounds); §3.6 and §3.8 (bridge with \|B\| = min weight qubits, Lemmas 15–16; Thm 24: joining keeps fault distance when supports are minimum weight and R ≥ d); §3.7 (Y measurement by bridging X and Z systems, Thms 20–22); §4.1–4.3 (gross mono-layer system, 103 qubits; 8 measurements × 36 automorphisms; 95 native rotations generate the 11-qubit Clifford group) | §2.3–2.4, §3.2, A.3, A.8 build directly on its bridges, basis strategy, native measurements and Theorem 24 | `bridge-system`, `space-time-like-errors` (B3); `native-measurements` (paper) |
| WY24 | Williamson, Yoder | Gauging logical operators · 2410.02213 | arXiv HTML, Results + Methods | Algorithm 1 and Thm 1 (gauging measurement: edge qubits in \|0⟩, Gauss-law vertex checks, flux checks on cycles, outcome = product of vertex results, byproduct along paths); Thm 2 and Lemma 2 (graph desiderata, Cheeger constant ≥ 1 keeps distance); Thm 3 (O(W log³W) overhead, decongestion); Thm 4 (d rounds before/during/after); Fig. 1b (lattice surgery recovered on a ladder graph) | A.3–A.4 describe the LPU in exactly these terms and A.8 uses its space/time split | `gauging-measurement`, `graph-cycle-basis`, `expansion`, `space-time-like-errors` (B3) |
| SJY24 | Swaroop, Jochym-O'Connor, Yoder | Universal adapters · 2410.03628 | arXiv HTML, §I–§VI (first half) | §II.2 Defs. 1–2 and Lemma 3 (relative expansion); §II.3 Thm 5 and Eqs. 7–9 (port function, matching matrix); §IV Def. 8, Thm 11 (repetition-code adapter for joint measurements across codes); §VI.2 (joining any QLDPC code to a toric code) | §2.4 builds the code–factory adapter from this idea; A.3 uses relative expansion | `adapter`, `expansion` (B3) |
| Lit19a | Litinski | A game of surface codes · 1808.02892 (Quantum 3, 128, 2019) | ar5iv | §1 Figs. 4–6 (circuits as π/4 and π/8 Pauli product rotations; Cliffords commuted to the end); Fig. 5 (controlled-Pauli as three π/4 rotations); Fig. 7 / §3.3 Fig. 17 (π/8 rotation by a P⊗Z measurement with a magic state; auto-corrected form); rules list (free X/Z preparation and readout; a Pauli product measurement costs one step of ~d cycles); tile cost ~2d² qubits | §3 and A.9 compile through Pauli-based computation in this style; §1.2's free CSS prep/readout and §4's surface-code baseline come from it | `pbc`, `pauli-rotation`, `controlled-pauli` (B4); `pauli-product-measurement`, `rotated-surface-code` (B3/B1) |
| Lit19b | Litinski | Distillation not as costly · 1905.06903 (Quantum 3, 205, 2019) | arXiv HTML | Notation (15-to-1)_{dX,dZ,dm}; Table 1 rows (15-to-1)_{7,3,3} (p = 10⁻⁴: 4.4 × 10⁻⁸, 810 qubits, 18.1 cycles) and (15-to-1)⁴_{9,3,3} × (15-to-1)_{25,9,9} (6.3 × 10⁻²⁵, 18 600 qubits, 67.8 cycles); 35p³ leading error; Fig. 1 (π/8 rotation via P⊗Z then X, with π/4 and π/2 fix-ups) | Table 3's distillation factories and Eq. (23) come from here | `distillation-15-to-1`, `t-injection`, `t-factory` (B4) |
| Hor+12 | Horsman, Fowler, Devitt, Van Meter | Lattice surgery · 1111.4022 (New J. Phys. 14, 123011, 2012) | ar5iv, all sections | §2 and Fig. 3a (planar patch, rough/smooth boundaries); §3.1 Fig. 5 Eqs. 2–7 (merge: seam stabilizers multiply to X̄X̄ or Z̄Z̄; d rounds); §3.2 Fig. 6 (split); §4.1 Fig. 7 (CNOT from merge and split); §7.1 (rotated lattice, d² data qubits) | §2.3 calls QLDPC surgery a generalization of lattice surgery; the reader needs the surface-code original first | `lattice-surgery`, `logical-pauli-measurement` (B3); `rotated-surface-code` (B1) |
| Kit03 | Kitaev | Fault-tolerant computation by anyons · quant-ph/9707021 (Ann. Phys. 303, 2, 2003) | ar5iv §1 | §1 Eqs. 1–3: toric code on a k × k torus (qubits on edges, star X and plaquette Z checks of weight 4, commute because they share 0 or 2 edges; 2 logical qubits from the two independent relations; logicals as non-contractible loops and cuts; distance k) | §2.1 defines BB codes as the toric code plus long-range edges | `toric-code`, `homology-logicals` (B1) |
| Den+02 | Dennis, Kitaev, Landahl, Preskill | Topological quantum memory · quant-ph/0110143 (J. Math. Phys. 43, 4452, 2002) | ar5iv §III–§V | §III.2 Fig. 5 (planar code with rough and smooth edges); §III.3 and §IV.2–IV.4 Figs. 7–9 (faulty syndrome measurement; repeated rounds; 2+1-D spacetime picture with data errors on space links and measurement errors on time links); §IV.7–V.1 (minimum-weight chains via perfect matching); thresholds ≈ 10.9 % perfect measurement, rigorous ≥ 1.14 % with faulty measurement | §2.6's phenomenological noise and the C-round repetition rest on this picture | `phenomenological-noise`, `detector`, `matching-decoder`, `planar-surface-code` (B1) |
| Fow+12 | Fowler, Mariantoni, Martinis, Cleland | Surface codes · 1208.0928 (Phys. Rev. A 86, 032324, 2012) | **abstract only** (no HTML; ar5iv conversion missing) | Cited for the per-cycle logical error formula used in §2.6 and A.10 | The paper prints its own constants (0.1 and 0.03, exponent d/2), so the lecture can use the paper's form; the original derivation is requested for re-verification | `logical-error-scaling` (B1) — PDF requested |
| GSJ24 | Gidney, Shutty, Jones | Magic state cultivation · 2409.17595 | arXiv HTML, §1–§3, App. A, references | §2.1–2.4 Figs. 4–11 (stages: inject into a distance-3 colour code, double-checked Clifford checks, grow, escape into a surface code, idle); §2.5 (full post-selection early, gap cut-off at escape); §2.6 (errata on the H_XY sign); §3.1 (d₁ = fault distance); Fig. 2 (p = 10⁻³: d₁ = 3: 6 × 10⁻⁷ / 35 %, end-to-end 3 × 10⁻⁶ / 80 %; d₁ = 5: 6 × 10⁻¹⁰ / 85 %, 2 × 10⁻⁹ / 99 %); App. A (uniform depolarizing noise) | §2.5, Table 3 and A.6 use cultivation as the 10⁻³ factory; Table 5 reproduces its Fig. 2 | `cultivation`, `postselection` (B4) |
| BK05 | Bravyi, Kitaev | Clifford gates and noisy ancillas · quant-ph/0403025 (Phys. Rev. A 71, 022316, 2005) | ar5iv | §I Def. 1 (T-type and H-type magic states by Bloch vector; Clifford orbits of 8 and 12); Thm 1 (states inside the octahedron are classically simulable); §III (magic state + Clifford + measurement gives a non-Clifford gate); §VI Eqs. 35–38 (15-qubit code, ε_out ≈ 35ε³, threshold ≈ 0.141) | The T state, its injection and 15-to-1 distillation underlie §2.5 and Table 3 | `magic-state`, `distillation-15-to-1`, `clifford-not-universal` (B4) |
| BSS16 | Bravyi, Smith, Smolin | Trading classical and quantum resources · 1506.01396 (Phys. Rev. X 6, 021043, 2016) | abstract only (enough) | Definition of Pauli-based computation (magic-state inputs, non-destructive Pauli measurements) | §3 step 1 and A.9 name PBC; the compile itself is taught from Lit19a | `pbc` (B4) |
| Mül+25 | Müller, Alexander, Beverland, Bühler, Johnson, Maurer, Vandeth | Improved BP for real-time decoding · 2506.01779 | abstract only (enough) | Relay-BP = BP with disordered (including negative) memory strengths plus a relay of reruns; beats BP+OSD-CS on BB codes, matches matching on surface codes, FPGA/ASIC-friendly | §1.1 (iv) and every number of §2.6 depend on this decoder; the reader needs what it is, not its internals. The paper's entry has no arXiv id; we identified it by title and authors | `relay-bp` (B2) |
| Rof19 | Roffe | QEC: an introductory guide · 1907.11157 (Contemp. Phys. 60, 226, 2019) | ar5iv | §3–§3.2 (two- and three-qubit codes, ancilla syndrome extraction, Fig. 2–3); §4.2 (logical operators); §4.6 (Shor code); §5 (surface code from four-cycles, [[λ² + (λ−1)², 1, λ]]); §6.1–6.3 (decoding, threshold theorem, fault tolerance) | Teaching source for B1 where Bergou stops (fault tolerance, threshold, the planar surface code); the paper cites it as its QEC primer | `fault-tolerance`, `threshold` (B1) |
| Rof+20 | Roffe, White, Burton, Campbell | Decoding across the QLDPC landscape · 2005.07016 (Phys. Rev. Research 2, 043423, 2020) | arXiv HTML §II–§VI, App. C | §II Fig. 1 (factor graph); §V (BP; failure from degeneracy and split beliefs; OSD-0 on the most reliable basis; OSD-CS with λ = 60); App. C (min-sum BP) | A.1 and A.8 use BP+OSD to find low-weight logicals and bound circuit distance; Relay-BP is a BP variant | `bp-decoding` (B2) |
| Bev+22 | Beverland, Murali, Troyer, Svore, Hoefler, Kliuchnikov, Low, Soeken, Sundaram, Vaschillo | Requirements for practical quantum advantage · 2211.07629 | ar5iv §II–§III, App. B | App. B Eq. 1 and Table 5 (P(d) = 0.03(p/0.01)^((d+1)/2) per logical step; 2d² qubits per tile; one step per multi-qubit Pauli measurement); §III.1 Table 1 (100-spin 2-D TFIM with a fourth-order product formula) | §4 and A.10 copy this surface-code architecture as the baseline and its TFIM benchmark. Note: the paper uses exponent d/2, not (d+1)/2 (see `reported.md`) | `surface-code-architecture-model`, `tfim-workload` (paper) |
| RS16 | Ross, Selinger | Optimal ancilla-free z-rotations · 1403.2975 (QIC 16, 901, 2016) | abstract only (enough) | Typical T-count 3·log₂(1/ε) + O(log log(1/ε)); optimal with a factoring oracle | §3.3 Eq. (19) uses this synthesis; the lecture shows the T-count law | `rotation-synthesis` (B4) |
| He+25 | He, Cowtan, Williamson, Yoder | Extractors · 2503.10390 | abstract only (enough) | An extractor is an add-on ancilla system that measures any logical Pauli of a QLDPC block in O(d) rounds, size Õ(n), linked by bridges into a Pauli-based-computation architecture | §2 calls the bicycle architecture an instance of the extractor architecture and the LPU a partial extractor (footnote 4) | `lpu` (paper) |
| BPT10 | Bravyi, Poulin, Terhal | Tradeoffs in 2D systems · 0909.5200 (Phys. Rev. Lett. 104, 050503, 2010) | abstract only (enough) | kd² = O(n) for local commuting codes on a 2-D lattice | §1 and §5 justify long-range connectivity with this bound; §5's kd²/n comparison | `bpt-bound` (B2) |
| BE21 | Breuckmann, Eberhardt | Quantum LDPC codes · 2103.06309 (PRX Quantum 2, 040101, 2021) | arXiv HTML §I–§VI | §II.1.2 (LDPC = bounded check weight and qubit degree); §II.2.2 Fig. 2 (Tanner graph of a CSS code in three layers); §III.4 (BPT bound kd^{2/(D−1)} ≤ O(n)); §IV.1 (hypergraph product, constant rate, d ~ √n); §VI.3–VI.4 (BP trouble with short loops; hardware connectivity) | Teaching source for the QLDPC background chapter; §5 cites it for the wider code landscape | `qldpc-code`, `code-rate` (B2) |
| Gid+25 | Gidney, Newman, Brooks, Jones | Yoked surface codes · 2312.04522 (Nat. Commun. 16, 4498, 2025) | arXiv HTML §4 | §4 (complementary gap: decode twice with the logical forced each way; the weight difference measures confidence; credited to [Bom+22]) | A.6 discards cultivation runs on a complementary-gap cut-off; we followed it only to define that term (its main subject, yoking, is a §4 aside) | `postselection` (B4) |
| Bev+25 | Beverland, Carroll, Rall, Yoder (as cited, no arXiv id) | Rare events in QEC · identified as 2511.15177 ("Fail fast", Beverland, Carroll, Cross, Yoder, Nov. 2025) | arXiv HTML §1–§4 | §1 Eq. 1 and §2.2 (failure spectrum f(w); P(q) as a binomial sum with q = p/15); §3.2 Eq. 10 (the ansatz family: a[1 − exp(−(f₀/a)(w/w₀)^γ)], a = 1 − 2^{−K}); §4.3 (counting minimum-weight failures) | §2.6 and A.7 fit every logical error rate with this ansatz. Identification is by method, decoder and authors; title and one author differ from the citation, so treat it as probable | `failure-spectrum` (paper) |

## Followed — depth 2

| Key | Authors | Short title · arXiv | Reached from | Read | Part relied on | Why still missing |
|---|---|---|---|---|---|---|
| Bom+22 | Bombín, Pant, Roberts, Seetharam | Fault-tolerant post-selection · 2212.00813 (PRX Quantum 5, 010302, 2024) | GSJ24 §2.5 and Gid+25 §4 (both credit it for the gap) | abstract only (enough) | The "logical gap": roughly the weight difference between the best corrections in inequivalent logical classes, used to rank and discard magic-state preparations | Neither depth-1 source defines why a gap measures reliability; B4's post-selection unit needs one sentence of origin |

Depth-2 candidates considered and **stopped** (the idea is already taught elsewhere):
- The 2-D colour code (GSJ24 cites Jones–Brooks–Harrington; Bombín 1311.0879): the distance-3 colour code is the Steane
  code (Q19), and GSJ24 §2.2–2.3 explains the rest of cultivation's use of it.
- Cohen–Kim–Bartlett–Brown's layered ancilla system (via Cro+24): Cro+24 §2.2 recaps it.
- Vuillot et al. on gauge fixing (via WY24): WY24's space/time split covers the A.8 argument.
- Panteleev–Kalachev BP+OSD (via Rof+20): Rof+20 §V describes OSD fully.
- Edmonds matching (via Den+02), Freedman–Hastings decongestion (via WY24; not needed, the gross LPU needs no
  decongestion), Chamberland–Noh flag preparation (via GSJ24), Bravyi–König (via BE21), hypergraph product originals
  (via BE21; the paper's [TZ14]).

## Not followed — depth 1 (116, one line each)

Experiments and demonstrations (context for "small surface codes exist"; no step uses their content):
- Ach+22 — surface-code scaling experiment; context only (§1.1).
- Ach+24 — below-threshold surface code; context only.
- Tak+16 — weight-four parity measurements; context only.
- Mar+21 — error-detecting surface-code logic; context only.
- Kri+22 — repeated distance-3 surface code; context only.
- Zha+22 — surface code on superconducting qubits; context only.
- Che+22 — calibrated decoders in experiment; context only.
- Sun+23 — subsystem QEC experiment; context only.
- Blu+23 — neutral-atom logical processor; context only.
- Ber+24 — 4-D surface code experiment; context only.
- Har+25 — failure mechanisms of logical gates; context only.

Applications and algorithms (motivation and Fig. 1b regions):
- Sho97 — period finding; taught in 709 (`q18-order`).
- Bau+20 — chemistry algorithms review; motivation only.
- Mot+24 — subspace methods for chemistry; motivation only.
- KEA23 — pre-fault-tolerant utility experiment; motivation only.
- Shi+24 — time-crystal simulation; motivation only.
- Ber+19 — qubitized chemistry; cited for resource estimation, not used.
- GE21 — factoring estimate; cited for resource estimation, not used.
- Roe+17 — elliptic-curve estimate; not used.
- Lee+21 — tensor hypercontraction; not used.
- Bur+21 — catalysis estimate; not used.
- Sch+24 — benefits/risks survey; its scatter plot only sets Fig. 1 regions (reported, A.10).
- BG16 — Clifford-dominated simulation; only the "40 qubits, 50 T" data point (reported).
- Bra+19 — low-rank stabilizer simulation; only the "50 qubits, 60 T" data point (reported).

Hardware, couplers and modularity (feasibility claims, shown as reported or context):
- Bra+22 — superconducting roadmap; context for long couplers.
- Wan+25 — low-overhead code demonstration; context only.
- Poo+24 — Rydberg qLDPC layout; context only.
- Cam+18 — remote entanglement; context only.
- Cho+18 — gate teleportation between logical qubits; context only.
- Kur+18 — microwave state transfer; context only.
- Leu+19 — bidirectional remote entanglement; context only.
- Mag+20 — cryogenic microwave link; context only.
- Zho+21 — multi-qubit network entanglement; context only.
- Sto+23 — loophole-free Bell test; context only.
- Niu+23 — low-loss interconnects; context only.
- Hey+25 — remote CNOT benchmark; its 98.8 % figure is shown as reported (p. 4).
- Mon+14 — modular trapped-ion architecture; context only.
- Bre+16 — multilayer microwave circuits; context only.
- Bom+21 — interleaving photonic architecture; context only.
- NLB13 — noisy-network topological computing; context only.
- LB16 — hierarchical surface code; context only.
- Ram+24 — connecting codes over noisy links; context only.
- JGS25 — network requirements; the Bell-pair model is stated in the paper itself.
- CWC24 — non-identical infidelities; future direction only.

QEC reviews and origins already covered:
- Sho96 — fault tolerance; B1 teaches it from Rof19 §6.3.
- Got22 — fault-tolerance opportunities; Rof19 suffices.
- Cam24 — news review; not needed.
- Ter15 — memories review; Rof19 and Den+02 suffice.
- Got97 — stabilizer thesis; the update rule is taught in Q20 (Bergou §10.2).
- WFH11 — surface code above 1 %; the paper prints the constant it uses.
- KP13 — origin of bicycle-type codes; Bra+24 suffices.
- PK21 — quasi-cyclic codes and BP+OSD; Rof+20 covers BP+OSD, Bra+24 the codes.
- TZ14 — hypergraph product; outlook only (BE21 §IV.1 summarizes).
- Got14 — constant-overhead fault tolerance; outlook only.
- PK22 — good LDPC codes; outlook only.
- Lia+25 — twisted-torus toric codes; the §5 family is stated in the paper.
- Ber+25 — adaptive syndrome extraction; outlook only.
- PKP23 — hierarchical memories; context only.
- GB25 — constant-rate computer on a line; context only.

QLDPC surgery variants (the followed WY24, Cro+24, SJY24 already cover the constructions used):
- Coh+22 — original LDPC surgery; recapped in Cro+24 §2.2.
- Ide+24 — homological measurement; parallel to WY24, which we teach.
- Cow24 — automated surgery software; not needed.
- ZL25 — time-efficient LDPC operations; not used.
- Cow+25 — parallel logical measurements; future direction only.

Automorphisms and dualities (the paper is self-contained for shifts and ZX-duality):
- GR13 — automorphisms as gates; the idea is taught from Bra+24 §9.2.
- ES24 — BB logical operators and fold-transversal gates; only shifts are used.
- Say+24 — Clifford gates from automorphisms; not used.
- BB24 — fold-transversal gates; ZX-duality derived in A.1 itself.

Decoding, simulation and tools:
- Rof22 — LDPC Python package; software only.
- OHB25 — decision-tree decoders; its count of weight-12 logicals is reported agreement only.
- IP15 — hardness of decoding; one-line fact, stated in A.7.
- Gid21 — stim simulator; tool only.
- IBM22 — CPLEX solver; tool only.
- Tan25 — GNU parallel; tool only (listed in the bibliography, not cited in the text).
- Bev+19 — role of entropy; its 875 178 count is shown as reported (§2.6).
- KBP23 — stabilizer circuit verification; Prop. 2.2 (Eq. 10) is checked by our engine instead.
- CDP08 — quantum combs; the term only.
- DBT21 — measurement-circuit bounds; A.5 states the colouring method itself.
- Vit+24 — flag-proxy scheduling ILP; A.5 restates its constraints.
- Kőn16 — bipartite edge colouring; a graph-theory fact taught in the paper lecture.
- MBG23 — time-dynamics circuits; future direction only.
- ST25 — morphing circuits; future direction only.
- Vui+19 — gauge fixing; WY24 covers the space/time argument (see depth-2 note).

Magic states and synthesis beyond what B4 needs:
- Kni05 — noisy-device computing; BK05 is the source we use.
- CC19 — flag-qubit magic states; GSJ24 suffices.
- GJS24 — cultivation data set; Table 5 is used as printed (reported).
- GF19 — catalysed CCZ factories; future direction only.
- Bev+20 — non-Clifford lower bounds; the TFIM product formula is stated in A.10.
- Kli+23 — shorter single-qubit approximations; future direction only.
- KMM13 — exact Clifford+T synthesis; future direction only.
- YY24 — pygridsynth software; tool only.
- Zha+25 — magic injection into qLDPC codes; outlook only.
- Zhu+23 — non-Clifford gates on homological codes; outlook only.
- GL24 — transversal non-Clifford qLDPC codes; outlook only.
- Zhu25 — magic state fountain; outlook only.
- Dav+25 — 2-D universal fault tolerance; outlook only.
- BF25 — planar colour-code non-Clifford circuits; outlook only.
- HC25 — non-Abelian magic states; outlook only.
- Zhu+25 — magic patches (patent); outlook only.

Compilation and resource-estimation frameworks:
- CC22 — twist-free lattice surgery; future direction only.
- BKS22 — edge-disjoint-path compilation; future direction only.
- BM21 — Hadamard-free Clifford circuits; future direction only.
- PVT21 — Clifford decomposition; future direction only.
- LN22 — active volume architecture; context only.
- Mic22 — resource-estimation notebooks; TFIM parameters are restated in A.10 (footnote 18).
- Mic23 — Azure documentation; tool only.
- Goo24 — Qualtran; tool only.
- Har+24 — Qualtran paper; tool only.
- Gid25 — RSA with under a million qubits; not compared.
- Zho+24 — algorithmic fault tolerance; not compared.
- Zho+25 — transversal atom-array architectures; not compared.

Fabrication and defects (§5 context):
- SBD09 — thresholds with loss; context only.
- Aug+17 — surface code with fabrication errors; context only.
- Lin+24 — chiplets with defects; context only.
- Deb+24 — surface code with dropouts; context only.
- Ler+24 — adapting the surface code to defects; context only.

## Where each followed reference is taught

| Home | References |
|---|---|
| B1 Surface code memory | Kit03, Den+02, Hor+12 §7.1, Rof19, Fow+12 (pending PDF), Bev+22 App. B (formula only) |
| B2 QLDPC and bivariate bicycle codes | BE21, BPT10, Bra+24, Rof+20, Mül+25 |
| B3 Logical measurement: lattice surgery to gauging | Hor+12 §3–4, Lit19a (Pauli product measurement), WY24, Cro+24, SJY24 |
| B4 Magic states and Pauli-based computation | BK05, Lit19a, BSS16, Lit19b, GSJ24, Gid+25 §4, Bom+22, RS16 |
| Paper lecture | Bev+25, Bev+22 (baseline, TFIM), He+25 (framing), Cro+24 §4.3 (native set) |
