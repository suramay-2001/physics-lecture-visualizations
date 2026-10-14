# P-B3-story — B3 "Measuring logical operators: from lattice surgery to gauging" (role P, Papers background chapter)

Proposal only; nothing under `app/` is touched. Format: a **background chapter** in the paper-spec format (`docs/specs/papers-platform.md`; ruling S2: kind `background`, data only, every
picture a stage state or a recipe reference), in the section shape of `P-Q21-story.md`. Phase `'books'` for the ramp `[B]`, `'clue'` `[C]`, `'deeper'` `[D]`; the phase `'lecture'` is not used
(a background chapter has no paper). Standing gates: ≥ 2 distinct derivation views per track; one notation beat per new notation; claims are recipe outputs with numpy twins
(`pipeline/claims_papers/b3.py`, keys `b3…`); reported numbers carry source and place. Trail entries are written `[ref §place: why]` below.

**Sources read online** (WebFetch of arXiv HTML / ar5iv / abstract pages; nothing saved; paraphrased): Hor+12 `hor12` (1111.4022: §3.1 merge, §3.2 split, §4.1 CNOT, Figs. 5–7); WY24 `wy24`
(2410.02213: Algorithm 1, Thm 1, Thm 2 / Lemmas 1–2, Thm 4, Fig. 1b, gross-code graph example); Cro+24 `cro24` (2407.18393: §2.2, §3.1–3.8 incl. Def. 3, Thms 6, 11, 24, Lemmas 15–16, §4 gross
system); SJY24 `sjy24` (2410.03628, first half: Defs. 1–2, Lemma 3, Thm 5, Eqs. 7–9, Def. 8, Thm 11); Lit19a `lit19a` (1808.02892: rules of the game, Figs. 4–7). Not read: SJY24 Appendix B
(overlapping supports), Hor+12 Fig. 7 qubit count (53), Cro+24 proofs; none is relied on. **Ownership.** Q22 owns Pauli strings, stabilizer groups, logical operators, distance, Clifford
conjugation and the measurement update rule (`q22-clifford`); F7 owns GF(2) rank and null spaces; B1 owns the rotated patch, detectors and Pauli frames; B3 owns Pauli product
measurement, merge/split, gauging, graph expansion, bridges and adapters (nodes `logical-pauli-measurement` … `adapter`, `prereq-graph.md`). B4 reuses `pauli-product-measurement` for T injection.
**Evidence.** `planB3B4-numpy.py` in the scratchpad (numpy only; shared with B4): dense 21-qubit merge and split, an independent GF(2) builder for merged and gauged codes, brute-force CSS
distances (null-space enumeration), exact Cheeger constants, Monte Carlo; **157 asserted checks, 0 failed** (B3 and B4 together); every number below is printed by it (`planB3B4-numpy.out`).
**Conventions.** Rotated patches as `physics/qec` (`rotatedSurfaceCode`): qubit `(r, c)`, $\bar X$ = X on column 0, $\bar Z$ = Z on row 0. Patches A (left) and B (right) sit side by side with a
**seam** column between them; merging along it measures $\bar X_A\bar X_B$ (Hor+12's "rough merge"; the plan names merges by the Pauli they measure, never rough/smooth). A check or measurement
reads $\pm1$; an outcome bit $m = 1$ means $-1$. $\Pi_P^{s} = (1 + sP)/2$. Graph: $G = (V, E)$, $V$ vertices (dots on the support of $L$), $E$ edges (new qubits), cycle rank $E - V + 1$.
**Stage shorthand** (recipes, §9.2): `pm(prod,mode[,m])` = `product-measure` (circuit + amplitudes split) · `su(gens,P)` = `stab-update` (matrix tableau, before → after) · `cm(code,P)` =
`code-measure-logical` (`code` kind, `checks` view with the measured row) · `sg(d,step[,show])` = `surgery-merge-split` (`code` kind, `planar` view, `surgery` overlay) · `cn(upTo)` =
`cnot-by-measurement` (`pauli-program`, program mode, split with `amplitudes`) · `gg(host,rungs[,show])` = `gauge-graph` (`surgery-graph`) · `pr(checks,R,q)` = `product-repeat`
(`spacetime` readout + `plot`) · `bj(w[,host])` = `bridge-join` (`surgery-graph`).

## 0. Chapter map
**Driving question:** "How does a computer built from code blocks learn a joint fact about stored qubits without opening the box?" Prerequisites: Q22 (update rule, logical operators,
distance), B1 (`b1-planar`, `b1-spacetime`), F7 (`f7-gf2`), Q6 (`q6-parities`), Q7 (`q7-observables`). B2 is needed only for the paper (BB-code Tanner graphs), not here.

| # | id | Title (≤ 8 words) | Question | Sources | Nodes (`prereq-graph`) | Link-backs |
|---|---|---|---|---|---|---|
| 1 | `b3-logical-measure` | Measuring a product, not its factors | How is one joint fact read without reading the qubits? | `lit19a` Intro; `hor12` §3 | `logical-pauli-measurement`, `pauli-product-measurement` | Q6, Q7, Q22 |
| 2 | `b3-surgery` | Lattice surgery: merge, then split | How do two patches measure a joint logical by joining? | `hor12` §3.1–3.2, §4.1 | `code-deformation`, `lattice-surgery` | B1, Q22 |
| 3 | `b3-gauging` | Gauging: any logical, on a graph | Which extra qubits and checks measure a chosen logical in any code? | `wy24` Alg. 1, Thm 1, Fig. 1b; `cro24` §3.1 | `graph-cycle-basis`, `gauging-measurement` | F7, Q22 |
| 4 | `b3-distance` | Keeping the distance while measuring | What must graph and rounds satisfy so measuring does not weaken the code? | `wy24` Thm 2, Lemma 2, Thm 4; `cro24` Def. 3, Thms 6, 11 | `expansion`, `subsystem-code`, `space-time-like-errors` | B1, F5 |
| 5 | `b3-bridges` | Bridges and adapters between blocks | How do two codes measure a product of their logicals? | `cro24` §3.6–3.8, §4; `sjy24` Defs. 1–2, Thm 5, Def. 8, Thm 11 | `bridge-system`, `adapter` | — |

**Outcomes:** apply the update rule to a stabilizer state and a code · say why a product measurement keeps what two single measurements destroy · list the new checks of a merge and why only their
product is data · compute the Pauli fix-ups of a CNOT built from three measurements · build the gauging graph of a logical (vertex checks, cycle checks, edge qubits) and count $E - V + 1$ ·
compute a graph's Cheeger constant and see it fix the deformed distance in a small family · say why about $d$ rounds guard the readout · join two measurement graphs with a bridge or an adapter.
**Openers/films:** deferred (§10).

**0.1 Spec data (R5, R2).** *References* (all depth 1, status `read` online, `taughtIn` this chapter): `hor12` Horsman et al. 2012 (§3.1–3.2, §4.1) · `lit19a` Litinski 2019 (Introduction, Figs. 4–7) · `wy24`
Williamson–Yoder 2024 (Results: Algorithm 1, Thms 1, 2, 4, Lemma 2, Fig. 1b) · `cro24` Cross et al. 2024 (§2.2, §3.1–3.8, §4) · `sjy24` Swaroop et al. 2024 (§II.2–II.3, §IV, first half). Reached from nothing deeper (no depth 2).
*Prerequisite nodes* owned here: the 11 B3 nodes; used from elsewhere (one teaching place each): `stabilizer-measurement-update`, `logical-operators`, `code-distance`, `css-stabilizer` (Q22, planned), `surface-code-patch`, `detector`, `pauli-frame`, `circuit-distance` (B1, planned), `gf2-linear-algebra` (`f7-gf2`), `stabilizer-of-state` (`q6-parities`), `commuting-pauli-products` (`q7-observables`), `cnot` (`q4-cnot`), `binomial` (`f5-spread`).

## 1. Story beats per unit (G ≤ 25 words/sentence, F ≤ 40; every beat has both captions; a list value in a claim is one key per entry, `b3DistTable` → `b3DistTable1…3`)
Kinds: circuit, amplitudes, matrix, code · code, pauli-program, amplitudes · surgery-graph, code · surgery-graph, spacetime, plot · surgery-graph.

### Unit `b3-logical-measure` — Measuring a product, not its factors
**b1 [B]** (a parity through a helper) · Bridge `pp-q6-parities`
- G: "Two qubits start as $|{+}{+}\rangle$, each 0 or 1 at random. Ask only whether they agree. A helper qubit gathers that parity, and only the helper is read."
- F: "Two CNOTs from the data onto a helper, then a $Z$ readout of the helper, measure $Z_1Z_2$ (<<pp-q6-parities|parity checks>>) without reading either data qubit. On $|{+}{+}\rangle$ the outcome $+1$ has chance $\tfrac12$ and leaves $(|00\rangle + |11\rangle)/\sqrt2$."
- Cap G "the helper reads the agreement; the data keep a superposition" · F "$Z_1Z_2 = +1$: chance $\tfrac12$, post-state $(|00\rangle+|11\rangle)/\sqrt2$" · Stage `pm(ZZ,product,0)` · Claims `b3EvenProb` 0.5, `b3BellAmp` 0.7071 · Trail `[lit19a Introduction: Pauli product measurement is the basic move of the surface-code game]`.

**b2 [B]** (the product against its factors)
- G: "Reading qubit 1, then qubit 2, also tells you whether they agree. But it leaves one definite string, each with chance a quarter. The parity measurement keeps the entanglement."
- F: "Measuring $Z_1$ then $Z_2$ projects onto one basis string, chance $\tfrac14$ each, a product state. Measuring the product $Z_1Z_2$ projects only onto its $\pm1$ eigenspace, so the post-state is maximally entangled and the superposition inside the eigenspace survives."
- Cap G "four strings at a quarter each, against two kept at a half" · F "$Z_1$ then $Z_2$: four outcomes $\tfrac14$; $Z_1Z_2$: two outcomes $\tfrac12$" · Stage `pm(ZZ,separate)` · Claims `b3SepProb` 0.25, `b3Concurrence` 1.

**b3 [B] · notation beat, `introduces: ['pp-stabilizer-update']`** (the update rule) · Bridge `pp-q22-clifford`
- G: "A rule for stabilizer states. Measure a Pauli $P$. If $P$ is already a check, the answer is fixed. Otherwise the answer is a coin flip, and $P$ joins the checks, pushing out any check it clashes with."
- F: "Measuring $P$ on a stabilizer group $S$ (<<pp-q22-clifford|the update rule>>): if $\pm P \in S$ the outcome is fixed. Otherwise it is a fair coin and $P$ joins $S$, replacing one generator that anticommutes with it; the other anticommuting generators are multiplied by that one."
- Cap G "ZZ clashes with both checks of $|{+}{+}\rangle$; one goes, their product XX stays" · F "$\langle XI, IX\rangle \to \langle \pm ZZ, XX\rangle$" · Stage `su([XI,IX],ZZ)` · Claims `b3KeptXX` 1, `b3BellFixed` 3 (of 15 non-identity Paulis have a fixed outcome on a Bell state), `b3BellRandom` 12 · Trail `[hor12 §3.1: the merge is this rule applied to the seam checks]`.

**b4 [B]** (a logical operator is such a Pauli) · Bridge `pp-q22-check-matrix` · Terms `pp-logical-measurement`
- G: "A logical operator commutes with every check but is not one. It acts on the stored qubits. In the four-qubit code with two stored qubits, the product $\bar Z_1\bar Z_2$ is just $IZZI$. Measuring it learns the pair's agreement and nothing else."
- F: "A logical Pauli $L \in N(S)\setminus S$ (<<pp-q22-check-matrix|logical operators>>) commutes with every generator, so measuring it is the second case of the rule: $\pm L$ joins $S$ and $k$ drops by one. In the $[[4,2,2]]$ code with $\bar Z_1=ZIZI$, $\bar Z_2=ZZII$, the product $\bar Z_1\bar Z_2 = IZZI$ takes $k$ from 2 to 1."
- Cap G "the checks of the 4-qubit code, and the string IZZI beside them" · F "$XXXX$, $ZZZZ$ and the measured row $IZZI$: commutes with both, not in the group, $k$: $2 \to 1$" · Stage `cm(c422,IZZI)` · Claims `b3LogicalK` [2, 1], `b3ProductWeight` 2.

**b5 [C]** (which products can be read together)
- Q G: "In the four-qubit code, can $\bar Z_1\bar Z_2 = IZZI$ be measured together with $\bar X_1\bar X_2 = IXXI$? And with $\bar X_1 = XXII$?" · Q F: "Which of $\bar X_1\bar X_2$ and $\bar X_1$ commutes with $\bar Z_1\bar Z_2$? Count the qubits on which each pair clashes."
- Reveal G: "The first pair clashes on two qubits; the two clashes cancel, so both can be read. The second clashes on one qubit, so reading one erases the other. Two products can be read together exactly when they commute." · Reveal F: "$IZZI$ and $IXXI$ anticommute at qubits 2 and 3, hence commute; $IZZI$ and $XXII$ anticommute at qubit 2 only, hence anticommute. Commuting products are compatible: the pair $\{\bar Z_1\bar Z_2, \bar X_1\bar X_2\}$ is a logical Bell measurement."
- Cap G/F "IZZI against IXXI: two clashes; against XXII: one" · Stage q `su([IZZI,IXXI],IZZI)`; reveal `su([IZZI,XXII],IZZI)` · Claims `b3Clash12` 2, `b3Clash1` 1.

### Unit `b3-surgery` — Lattice surgery: merge, then split
**b1 [B]** (add a seam; the new checks) · Terms `pp-lattice-surgery` · Bridge `pp-q22-clifford`
- G: "Put two patches side by side with three fresh qubits between them, each in $|0\rangle$. Measure the checks of one big patch. Four are new. Two old edge checks simply grow to reach the seam."
- F: "Two distance-3 rotated patches and a column of $d = 3$ seam qubits in $|0\rangle$ form a $3\times7$ rotated patch, $n = 21$, $k = 1$. Against the old checks, $d + 1 = 4$ $X$ checks are new and $d - 1 = 2$ boundary $Z$ checks widen into the seam (Hor+12 §3.1)."
- Cap G "two patches, the seam between them, the four new checks lit" · F "$n = 21$: new $X$ checks (lit), widened $Z$ checks (outlined)" · Stage `sg(3,merged,[new,widened,seam])` · Claims `b3SeamQubits` 3, `b3MergedN` 21, `b3NewXChecks` 4, `b3WidenZ` 2 · Trail `[hor12 §3.1: the seam qubits start in |0> for a merge that measures the product of X logicals]`.

**b2 [B]** (only the product is data) · Try-it
- G: "Each new check, read alone, is a coin flip. Multiply all four and every seam qubit cancels. What is left is the product of the two patches' logical $X$ strings: the answer."
- F: "On $|\bar0\bar0\rangle$ the four new $X$ checks give each of the 16 outcome patterns with chance $\tfrac1{16}$. Their product, seam qubits cancelling, equals $\bar X_A\bar X_B$ times old checks. The product of the four outcomes is the measured value, $+1$ with chance $\tfrac12$ (Hor+12 §3.1, Eqs. 2–7)."
- Cap G "four coin flips; their product is the joint $X$" · F "pattern chance $\tfrac1{16}$; $\prod m_i = \bar X_A\bar X_B$" · Stage `sg(3,merged,[new,product])` · Claims `b3PatternProb` 0.0625, `b3MeasProb` 0.5, `b3PlusPlusProb` 1 (on $|\bar+\bar+\rangle$ the product is certain) · Trail `[hor12 §3.1 Eqs. 2-7: the product of the seam stabilizers is the joint logical operator]`.

**b3 [B]** (split; the sign is tracked, not applied)
- G: "To split, read each seam qubit in $Z$ and set it aside. The patches stand alone again. The measured product stays fixed. One sign depends on the seam readings, and software tracks it."
- F: "Measuring the seam qubits in $Z$ returns the two patches. Starting from $|\bar0\bar0\rangle$, afterwards $\langle\bar X_A\bar X_B\rangle$ equals the merge outcome and $\langle\bar Z_A\bar Z_B\rangle = (-1)^{z}$ with $z$ the readout of the top seam qubit, while each patch alone is random: a logical Bell pair up to a tracked sign (Hor+12 §3.2)."
- Cap G "after the split: the pair agrees in $X$ and each patch alone is a coin flip" · F "$\langle\bar X_A\bar X_B\rangle = m$, $\langle\bar Z_A\bar Z_B\rangle = (-1)^z$, $\langle\bar Z_A\rangle = 0$" · Stage `sg(3,split,[seam])` · Claims `b3SplitProb` 0.125 (each of the 8 seam outcomes), `b3FrameSign` 4 (of the 8 flip the $\bar Z\bar Z$ sign) · Trail `[hor12 §3.2: a split measures out the seam; the random outcomes are tracked as a frame]` · Bridge: Pauli frame is B1's `pauli-frame`.

**b4 [B]** (a CNOT from three measurements) · Derivation D1
- G: "A CNOT needs no gate. Add a helper in $|{+}\rangle$. Measure $Z_cZ_a$, then $X_aX_t$, then $Z_a$. Each outcome triple has chance an eighth, and two Pauli fixes, chosen from the outcomes, finish the job."
- F: "Measure $Z_cZ_a$ ($m_1$), $X_aX_t$ ($m_2$), $Z_a$ ($m_3$) on control, helper and target. The result is CNOT up to $Z_c^{[m_2=-1]}X_t^{[m_1m_3=-1]}$, and every triple occurs with chance $\tfrac18$ for every input (Hor+12 §4.1, Fig. 7)."
- Cap G "three measurements on three wires" · F "$\Pi_{Z_a}^{m_3}\Pi_{X_aX_t}^{m_2}\Pi_{Z_cZ_a}^{m_1}|{+}\rangle_a \propto Z_c^{[m_2]}X_t^{[m_1m_3]}\mathrm{CNOT}$" · Stage `cn(3)` · Claims `b3CnotProb` 0.125, `b3CnotNoFix` 2 (triples needing no fix), `b3CnotZFix` 4, `b3CnotXFix` 4 · Trail `[hor12 §4.1 Fig. 7: CNOT from a merge, a split and a merge; here the same idea as three Pauli measurements, with a final helper readout]`.

**b5 [C]** (a bigger patch)
- Q G: "Merge two distance-5 patches the same way. How many qubits does the big patch have, and how many checks are new?" · Q F: "For $d = 5$, what are $n$ of the merged rotated patch, the number of new $X$ checks, and the number of widened $Z$ checks?"
- Reveal G: "Five rows and eleven columns: 55 qubits. Six new $X$ checks and four widened $Z$ checks. Their product is still the joint $X$." · Reveal F: "$n = d(2d+1) = 55$, $d + 1 = 6$ new $X$ checks, $d - 1 = 4$ widened $Z$ checks, $k = 1$; the product relation holds for $d = 3, 5, 7$ ($n = 21, 55, 105$)."
- Cap G/F "the $5\times11$ patch, new checks lit" · Stage q `sg(5,separate)`; reveal `sg(5,merged,[new,widened])` · Claims `b3MergeN5` 55, `b3NewX5` 6, `b3WidenZ5` 4.

### Unit `b3-gauging` — Gauging: any logical, on a graph
**b1 [B]** (a graph on the support) · Terms `pp-gauging`, `pp-aux-graph`
- G: "Take the qubits where the logical acts. They become the dots of a graph, and each link will be a new qubit. For the $\bar X$ column of one patch the graph is a path of three dots."
- F: "Gauging (WY24 Algorithm 1) measures $L = \bar X$ through a connected graph $G = (V, E)$ whose vertices are the qubits of its support; each edge is a new qubit in $|0\rangle$. A $Z$ check meeting the support in two qubits forces an edge or path between them: here $(0,3)$ and $(3,6)$ of the $d = 3$ patch."
- Cap G "three dots, two links, on the patch's $\bar X$ column" · F "$V = 3$, $E = 2$, no cycle" · Stage `gg(patch3-x,0)` · Claims `b3GaugeV` 3, `b3GaugeE` 2 · Trail `[wy24 Algorithm 1: the graph, the edge qubits in |0>]`.

**b2 [B]** (two kinds of check; their product) · Derivation D2 · Terms `pp-vertex-check`, `pp-cycle-check`
- G: "Add a check for each dot: $X$ on the dot and on its links. Add a check for each loop of links: $Z$ on the loop. Multiply the dot checks and every link cancels, leaving the logical."
- F: "Vertex checks $A_v = X_v\prod_{e\ni v}X_e$ and cycle checks $B_c = \prod_{e\in c}Z_e$ for a cycle basis; each original $Z$ check on the support is deformed by $Z$ along its path. Every edge lies in two $A_v$, so $\prod_vA_v = L$ (WY24 Thm 1)."
- Cap G "the dot check on the middle dot; all dot checks multiplied: only the dots' X remain" · F "$A_v$ on $v = 3$; $\prod_vA_v = X_0X_3X_6$" · Stage `gg(patch3-x,0,[vertices,edges])` · Claims `b3ProdGauss` 1 (the product equals $L$; engine returns the support) · Trail `[wy24 Thm 1: the product of the vertex outcomes is the measured value]`.

**b3 [B] · notation beat, `introduces: ['pp-cycle-basis']`** (two patches: a ladder with loops) · Bridge `pp-f7-gf2` · Try-it
- G: "For both patches, join their two paths with three rungs. The graph is a ladder with seven links and two square loops. A graph with $V$ dots and $E$ links has $E - V + 1$ independent loops."
- F: "A connected graph has cycle rank $E - V + 1$, the size of a cycle basis (<<pp-f7-gf2|null space over GF(2)>>). For $\bar X_A\bar X_B$ on two $d=3$ patches the ladder has $V = 6$, $E = 7$, so 2 cycle checks; the deformed code has $n = 18 + 7 = 25$ and $k = 2 \to 1$ (WY24 Fig. 1b)."
- Cap G "the ladder on the six dots next to the seam" · F "$V=6$, $E=7$, cycle rank $2$; $n=25$, $k: 2\to1$" · Stage `gg(patches3-xx,3,[vertices,edges,cycles])` · Claims `b3CycleRank` 2, `b3GaugedN` 25, `b3GaugedK` 1 · Trail `[wy24 Fig. 1b: gauging on a ladder graph recovers lattice surgery]`.

**b4 [B]** (reading out; the byproduct)
- G: "Measure all dot and loop checks for several rounds. The logical's value is the product of the dot readings. Then read every link in $Z$. A path rule says which $X$ correction to track, never apply."
- F: "Measure all checks for $R$ rounds; $\sigma = \prod_vA_v$ is the outcome. Then measure $Z_e$ on every edge: the sign of $\prod Z_e$ along a path from a root to $v$ fixes a byproduct $X_v$, tracked as a frame (WY24 Algorithm 1, steps 2–4)."
- Cap G/F "round after round: the vertex readings multiply to $\sigma$; then the links are read out" · Stage `gg(patches3-xx,3,[checks])` · Trail `[wy24 Algorithm 1 steps 2-4]`.

**b5 [C]** (surgery against gauging)
- Q G: "The seam used 3 new qubits; the ladder uses 7. Do they measure the same thing? Do they keep the same distance?" · Q F: "Compare the lattice-surgery seam with the ladder gauging graph for $\bar X_A\bar X_B$: new qubits, deformed $X$- and $Z$-distances."
- Reveal G: "Same operator, same distances, 3 and 7. The surgery seam is one thrifty choice; gauging is the general recipe, and its graph may have loops." · Reveal F: "Both leave deformed distances $(d_X, d_Z) = (3, 7)$ and measure $\bar X_A\bar X_B$; the seam qubits are the edges of a 4-vertex path whose vertices are the four new checks, the ladder keeps one vertex per support qubit."
- Cap G/F "seam: 21 qubits; ladder: 25 qubits; distances 3 and 7 for both" · Stage q `sg(3,merged)`; reveal split `sg(3,merged)` / `gg(patches3-xx,3)` · Claims `b3EdgeQubits` [3, 7], `b3MergedDist` [3, 7], `b3LadderDist` [3, 7].

### Unit `b3-distance` — Keeping the distance while measuring
**b1 [B]** (a thin graph weakens the code) · Trail `[wy24 Thm 2: the graph conditions that keep the distance]`
- G: "Use one rung instead of three. The graph is still connected and measures the same logical. But the deformed code now has distance 1: a single error can slip through."
- F: "With the forced path edges and one bridge edge the graph is a tree, $k' = 1$, yet the deformed $X$-distance is 1; two rungs give 2 and three give 3, with $Z$-distance 7 throughout. Connectivity alone does not protect the distance."
- Cap G/F "one rung, two rungs, three rungs: the distance climbs 1, 2, 3" · Stage `gg(patches3-xx,1,[distance])` · Claims `b3DistTable` [1, 2, 3], `b3Cycles` [0, 1, 2].

**b2 [B] · notation beat, `introduces: ['pp-cheeger']`** (the bottleneck number)
- G: "Measure a graph's bottleneck. For a set of dots, count the links leaving it and divide by the set's size. The smallest such ratio is the Cheeger constant $h$. One rung gives $\tfrac13$; the ladder gives 1."
- F: "$h(G) = \min_{0<|S|\le|V|/2}|\partial S|/|S|$, $\partial S$ the edges leaving $S$. WY24 Lemma 2 bounds the deformed distance below by $\min(h,1)\,d$; here $h = \tfrac13, \tfrac23, 1$ and the distance is exactly $d\,h = 1, 2, 3$, so the bound is tight on this family."
- Cap G/F "the worst set of dots (shaded) and the links leaving it" · Stage `gg(patches3-xx,1,[subset])` · Claims `b3Cheeger` [0.3333, 0.6667, 1] · Trail `[wy24 Lemma 2: distance at least min(h,1) d; cro24 Def. 3 and Thm 6: the same idea for layered systems]`.

**b3 [B]** (not every loop needs a check) · Terms `pp-gauge-qubit`
- G: "Drop a loop check and the code gains a spare qubit that nothing constrains: a gauge qubit. It carries no data. Dropping both loop checks of the ladder leaves two spare qubits."
- F: "Omitting a cycle check enlarges the unfixed gauge group of this subsystem code: the ladder with 2, 1, 0 cycle checks has $k_{\rm total} = 1, 2, 3$; the extras are gauge qubits and the data count stays one. Which cycles to keep is a design choice that trades check weight against protection (*Tour de gross*, arXiv:2506.03094, keeps only some)."
- Cap G/F "cycle checks kept: 2, 1, 0; spare qubits: 0, 1, 2" · Stage `gg(patches3-xx,3,[cycles],drop:1)` · Claims `b3GaugeQubits` [0, 1, 2] · Trail `[cro24 §3.1: gauge degrees of freedom made stabilizers by added checks]`.

**b4 [B]** (the readout is repeated: time-like failures) · Derivation D3 · Terms `pp-time-like`
- G: "A reading can lie. If a seam check misreads, the product flips. With four checks each misreading 2% of the time, the product lies 7.5% of the time. Read it again and again, and vote."
- F: "With $m = 4$ checks, each reading flipped independently with $q = 0.02$, the product reading flips with chance $(1-(1-2q)^m)/2 = 0.0753$. The vote over $R$ rounds fails when more than half are wrong: $\sum_{j>R/2}\binom Rj p^j(1-p)^{R-j}$, a toy for the time-like half of the argument (WY24 Thm 4)."
- Cap G "seven rounds of readings; flipped ones marked; the vote" · F "$p = 0.0753$; $R = 1,3,5,7,9,11$: failure $7.5\times10^{-2}$ down to $6\times10^{-5}$" · Stage `pr(4,7,0.02)` · Claims `b3ProdFlip` 0.0753, `b3RoundsFail` [0.0753, 0.0162, 0.00381, 0.000936, 0.000236, 0.0000605] · Trail `[wy24 Thm 4: d rounds before, during and after the measurement; the vote is our toy model, not the theorem]`.

**b5 [C]** (how many rounds)
- Q G: "With the same 2% misreads, how many rounds (odd) make the vote fail less than once in a thousand?" · Q F: "Find the least odd $R$ with vote failure below $10^{-3}$ for $p = 0.0753$."
- Reveal G: "Seven rounds: failure 0.00094. Five rounds give 0.0038. The real theorem asks about $d$ rounds so that time-like and space-like failures both need $d$ faults." · Reveal F: "$R = 7$: $9.4\times10^{-4}$; $R = 5$: $3.8\times10^{-3}$. Each two extra rounds multiply failure by about $4p(1-p) = 0.28$ asymptotically. The theorem's $d$ rounds make time-like and space-like faults equally costly."
- Cap G/F "failure against rounds, with the 1-in-1000 line" · Stage q `pr(4,7,0.02)`; reveal plot with `yLines` · Claims `b3RoundsFor1e3` 7.

### Unit `b3-bridges` — Bridges and adapters between blocks
**b1 [B]** (joining two measurement graphs) · Terms `pp-bridge`
- G: "To measure a product across two blocks, join their two graphs with extra links, the bridge. Each extra link beyond the first adds one loop: $w$ links add $w - 1$."
- F: "Joining graphs $G_A$, $G_B$ by $w$ bridge edges gives a connected graph of cycle rank $(E_A - V_A + 1) + (E_B - V_B + 1) + w - 1$; a bridge of $|B|$ qubits needs $|B| - 1$ new cycle checks and the joined code has $k - 1$ logical qubits (Cro+24 §3.6, Lemmas 15–16)."
- Cap G/F "two paths, one to three bridge links: loops 0, 1, 2" · Stage `bj(2)` · Claims `b3BridgeCycles` [0, 1, 2], `b3BridgeChecks` 2 (at $w = 3$) · Trail `[cro24 §3.6 Lemmas 15-16: the bridge and its checks]`.

**b2 [B]** (what the bridge buys) · Try-it
- G: "Two patches joined by three bridge links form the ladder. With one link the distance drops to 1, with two to 2, with three it is 3. The bridge must be at least as wide as the code is protected."
- F: "For the ladder of Unit 3 the deformed distance is $w$ for $w = 1,2,3$ and then saturates at $d = 3$. Cro+24 Thm 24 is the general statement: joining two systems whose supports are minimum-weight representatives keeps the fault distance at $d$ when the merged code is measured for at least $d$ rounds."
- Cap G/F "bridge width 1, 2, 3; distance 1, 2, 3" · Stage `bj(3,patches3-xx)` · Claims `b3BridgeDist` [1, 2, 3] · Trail `[cro24 §3.8 Thm 24: joining keeps fault distance when supports are minimum weight and the rounds are at least d]`.

**b3 [B]** (an adapter between different codes) · Terms `pp-adapter`
- G: "The two blocks need not be the same code. Take a surface-code patch and a seven-qubit Steane block. Each has its own path of three dots. Match the dots one to one: that matching is an adapter."
- F: "An adapter (SJY24 Def. 8) is a one-to-one matching between equal-size vertex subsets of two graphs. For $\bar X$ of a $d=3$ patch and the weight-3 $\bar X$ of the Steane code (<<pp-q22-css|CSS code>>, qubits 1,2,3) the joined graph is again a ladder: $n' = 16 + 7 = 23$, $k: 2 \to 1$, $h = 1$, distance 3."
- Cap G "a patch's path and Steane's path, three matching links" · F "$k:2\to1$, $n'=23$, 2 cycles, $h=1$, $d'=3$" · Stage `bj(3,patch3-steane)` · Claims `b3AdapterN` 23, `b3AdapterK` 1, `b3AdapterCycles` 2, `b3AdapterDist` 3 · Trail `[sjy24 Def. 8 and Thm 11: an adapter joins graphs of different codes and keeps distance d]`.

**b4 [B]** (adapter width; order does not matter at three)
- G: "Keep only two matching links: distance 2. Keep one: distance 1. The same rule as the bridge. With three dots, every order of the three links works equally well."
- F: "Adapter size $w = 1,2,3$ gives $h = \tfrac13,\tfrac23,1$ and deformed distance $1,2,3$, exactly as for a bridge. All $3! = 6$ orders of the matching give $h = 1$ and distance 3, so a mismatch of order is harmless at this size (relative expansion, SJY24 Def. 2, is the general tool)."
- Cap G/F "adapter links 1, 2, 3 and the six orderings" · Stage `bj(2,patch3-steane)` · Claims `b3AdapterSize` [1, 2, 3], `b3AdapterOrders` 6 · Trail `[sjy24 Def. 2 and Lemma 3: relative expansion is the general tool]`.

**b5 [D]** (a real system) · Reported
- G: "Real numbers come from real papers. The authors of the bridge paper built the ancilla system for the gross code. It adds 103 qubits and measures eight different logical Paulis."
- F: "Cro+24 §4 reports an ancilla system for the gross code with 103 extra qubits, 54 data and 49 check qubits. It has eight measurable logical Paulis, and 8 × 36 = 288 logical measurements with the shift automorphisms. The sum and product are ours; the numbers are the authors' (Reported)."
- Stage `gg(patches3-xx,3)` (as a reminder; no engine claim) · Reported `cro24-gross-system` "103" (§4.1; 54 + 49), `cro24-measurements` "8 × 36 = 288" · Claims `b3Sum103` 103 (54 + 49), `b3Prod288` 288 · Trail `[cro24 §4: the gross-code ancilla system]`.

### 1.7 Claim ledger (key — recipe output / engine call — value; numpy route in `planB3B4-numpy.py`)
- logical-measure: `b3EvenProb` `product-measure` pEven 0.5, `b3BellAmp` ampSame 0.7071, `b3SepProb` 0.25, `b3Concurrence` 1 (dense 3 qubits) · `b3KeptXX` 1, `b3BellFixed` 3, `b3BellRandom` 12 `stab-update` / `stab.census` (symplectic + dense; also 3, 12, 48 on the 3-qubit bit-flip code) · `b3LogicalK` 2 → 1, `b3ProductWeight` 2 `code-measure-logical` · `b3Clash12` 2, `b3Clash1` 1 `pauli.clashes`.
- surgery: `b3SeamQubits` 3, `b3MergedN` 21, `b3NewXChecks` 4, `b3WidenZ` 2, `b3MergeN5` 55, `b3NewX5` 6, `b3WidenZ5` 4 `surgery.merged` (GF(2); $d=7$: 105, 8, 6 also checked) · `b3PatternProb` 0.0625, `b3MeasProb` 0.5, `b3PlusPlusProb` 1, `b3SplitProb` 0.125, `b3FrameSign` 4 `surgery.run` (dense 21 qubits) · `b3CnotProb` 0.125, `b3CnotNoFix` 2, `b3CnotZFix` 4, `b3CnotXFix` 4 `cnot.byMeasurement`.
- gauging: `b3GaugeV` 3, `b3GaugeE` 2, `b3ProdGauss` 1, `b3CycleRank` 2, `b3GaugedN` 25, `b3GaugedK` 1 `gauge.build` · `b3EdgeQubits1…2` 3, 7 · `b3MergedDist1…2` and `b3LadderDist1…2` 3, 7 `gauge.deformedDistance` (the $X$ and $Z$ distances).
- distance: `b3DistTable1…3` 1, 2, 3, `b3Cycles1…3` 0, 1, 2, `b3Cheeger1…3` 0.3333, 0.6667, 1, `b3GaugeQubits1…3` 0, 1, 2 `gauge-graph` · `b3ProdFlip` 0.0753, `b3RoundsFail1…6` 0.0753, 0.0162, 0.00381, 0.000936, 0.000236, 0.0000605, `b3RoundsFor1e3` 7 `timelike.*` (16-pattern sum; Monte Carlo agrees at $R=3,7$ within 5σ).
- bridges: `b3BridgeCycles1…3` 0, 1, 2, `b3BridgeChecks` 2, `b3BridgeDist1…3` 1, 2, 3 `bridge-join` · `b3AdapterN` 23, `b3AdapterK` 1, `b3AdapterCycles` 2, `b3AdapterDist` 3, `b3AdapterSize1…3` (distances 1, 2, 3), `b3AdapterOrders` 6 · `b3Sum103` 103, `b3Prod288` 288 (arithmetic on the reported inputs, **C←R**, `uses: [cro24-gross-system, cro24-measurements]`).
- Reported (R3): `cro24-gross-system` "103 qubits (54 data, 49 check)", §4.1 · `cro24-measurements` "8 measurements, 36 automorphisms", §4.1 (page: from the PDF batch; Q1).

## 2. Derivations (step `tex` — why — **view**; Ground ≥ Formal; ≥ 2 distinct views per track)
**D1 · surgery:b4 · three measurements make a CNOT** — G (4): (1) $Z_cZ_a$: helper copies the control's $Z$ · **cn(1)** · (2) $X_aX_t$: target's $X$ tied to the helper · **cn(2)** · (3) $Z_a$: read the helper out · **cn(3)** · (4) check the output against CNOT for an input, any outcome triple · **amplitudes after fix**. F (3): (1) $M_{m} = \langle m_3|_a\Pi_{Z_a}^{m_3}\Pi_{X_aX_t}^{m_2}\Pi_{Z_cZ_a}^{m_1}|{+}\rangle_a$ · **cn(3)** · (2) $M^\dagger M = \tfrac18 I$ for every triple · **amplitudes** · (3) $M_m = \tfrac1{2\sqrt2}Z_c^{[m_2]}X_t^{[m_1m_3]}\mathrm{CNOT}$ up to a phase · **cn(3)**.
**D2 · gauging:b2 · $\prod_vA_v = L$** — G (4): (1) one dot check lights a dot and its links · **gg(patch3-x,0,focus v=1)** · (2) every link touches two dots · **gg(…, product)** · (3) in the product each link appears twice and cancels · **gg(…, product)** · (4) the dots' $X$ remain: that is $L$ · **gg(…, vertices)**. F (3): (1) $A_v$ · **focus** · (2) $\prod_v A_v = \prod_vX_v\prod_e X_e^{2}$ · **product** · (3) $=L$ · **vertices**.
**D3 · distance:b4 · vote failure** — G (3): (1) four checks, each misreads 2%: product flips with chance $p$ · **pr readings** · (2) the vote fails when more than half of $R$ readings flip · **pr vote** · (3) add the binomial terms: falls ×0.28 per two rounds · **pr plot**. F (3): (1) $p = (1-(1-2q)^m)/2$ from the 16 patterns · **readings** · (2) $\sum_{j>R/2}\binom Rj p^j(1-p)^{R-j}$ · **vote** · (3) ratio $\to 4p(1-p)$ · **plot**.
**viewCaptions:** D1 "after $Z_cZ_a$" / "after $X_aX_t$" / "helper read out" / "output equals CNOT" · D2 "one dot check" / "every link twice" / "links cancel" / "the dots remain" · D3 "readings, flips marked" / "the vote" / "failure against rounds".

## 3. Try-it widgets (`bit-table`; props read from `BitTable.tsx`: strings ≤ 8 bits, reduce ≤ 4 rows × ≤ 8 bits)
| Unit | Spec | Try this |
|---|---|---|
| logical-measure | `bit-table {mode:'strings', a:'00000110', b:'00001100', combine:'dot'}` | Write a Pauli as its $x$ bits then $z$ bits; for the second row swap the halves, so the dot is the clash count. a = $IZZI$, b = $XXII$ swapped: "a·b = 1", they clash once. Set b to 00000110 ($IXXI$ swapped): "a·b = 0", they commute. |
| surgery | `bit-table {mode:'reduce', rows:['100','110','011','001']}` | These are the four new checks restricted to the three seam qubits. Step to the end: "rank 3" for four rows, so one combination (their product) leaves nothing on the seam. |
| gauging | `bit-table {mode:'reduce', rows:['1001','1100','0110','0011']}` | Vertices of a square graph against its four links. "Rank 3" is $V - 1$; the null space "0000, 1111" is the one loop, $E - V + 1 = 1$. |
| distance | `bit-table {mode:'strings', a:'0100100', b:'0000000', combine:'xor'}` | Seven rounds of the product reading, a 1 where a misread flipped it: "differ in 2 places". The vote is wrong only if 4 or more flip; set 4 bits and see. |
| bridges | `bit-table {mode:'reduce', rows:['1010','1001','0110','0101']}` | Two single-link graphs joined by two bridge links. "Rank 3", null space "0000, 1111": $w - 1 = 1$ loop. |

## 4. Challenges (tol 0.005 unless stated; integers tol 0; no sheet of either course assigns these, so full walkthroughs)
- **logical-measure** 1 warm-up numeric `b3-m-even` chance $Z_1Z_2 = +1$ on $|{+}{+}\rangle$ → **0.5**. 2 core choice `b3-m-pair` "Which pair can be read together in the 4-qubit code?" → **$\bar Z_1\bar Z_2$ and $\bar X_1\bar X_2$** ✓. 3 core numeric `b3-m-logical` Paulis (of 63) on a 3-qubit bit-flip code that commute with both checks yet change the data → **12**.
- **surgery** 1 warm-up numeric `b3-s-seam` seam qubits for $d = 5$ → **5**. 2 core numeric `b3-s-n` qubits of the merged $d=5$ patch → **55**. 3 stretch numeric `b3-s-all` chance that the four seam checks of the $d=3$ merge all read $+1$ → **0.0625**.
- **gauging** 1 warm-up numeric `b3-g-rank` cycle rank of a graph with 12 vertices and 18 edges → **7**. 2 core numeric `b3-g-ladder` cycle rank of a $2\times4$ ladder (8 vertices, 10 edges) → **3**. 3 core choice `b3-g-k` "Gauging $\bar X_A\bar X_B$ of two patches changes $k$ from 2 to…" → **1** ✓.
- **distance** 1 warm-up numeric `b3-d-h` Cheeger constant of the three-rung ladder → **1**. 2 core numeric `b3-d-two` deformed $X$-distance with two rungs → **2**. 3 core numeric `b3-d-rounds` least odd $R$ with vote failure $< 10^{-3}$ at $p = 0.0753$ → **7**.
- **bridges** 1 warm-up numeric `b3-b-cyc` loops added by a 3-link bridge → **2**. 2 core numeric `b3-b-n` qubits of the patch + Steane joint-measurement code → **23**. 3 core choice `b3-b-two` "An adapter with only two matching links gives deformed distance…" → **2** ✓.

## 5. Glossary (new in Papers; ids `pp-…`, to be checked against the shared Papers pack and the 709 ids)
| id | term | introduces | Ground | Formal | first |
|---|---|---|---|---|---|
| `pp-logical-measurement` | logical Pauli measurement | — | Reading one number about the stored qubits, not the physical ones. | Measuring $L\in N(S)\setminus S$: $\pm L$ joins $S$, $k\to k-1$. | logical-measure:b4 |
| `pp-product-measurement` | Pauli product measurement | — | Reading whether several stored qubits agree, in one go. | Measuring a product of logicals, e.g. $\bar Z_1\bar Z_2$, without measuring either factor. | logical-measure:b2 |
| `pp-stabilizer-update` | update rule | notation | What happens to the checks when a Pauli is measured. | $\pm P\in S$: fixed; else coin flip and $P$ replaces a clashing generator. | logical-measure:b3 |
| `pp-lattice-surgery` | lattice surgery | — | Joining two patches for a while to measure a product, then separating them. | Merge (seam in $|0\rangle$, new $X$ checks, $d$ rounds), then split ($Z$ readout of the seam). | surgery:b1 |
| `pp-code-deformation` | code deformation | — | Changing the checks for a while; the data survive if the distance stays. | A sequence of codes sharing the logical qubits, distance kept throughout. | surgery:b1 |
| `pp-gauging` | gauging measurement | — | Measuring a logical by attaching a graph of new qubits. | WY24 Algorithm 1: edge qubits in $|0\rangle$, $A_v$ and $B_c$ checks, $\sigma=\prod_vA_v$. | gauging:b1 |
| `pp-aux-graph` | auxiliary graph | — | Dots on the logical's support, links as new qubits. | Connected $G=(V,E)$, $V\leftrightarrow\operatorname{supp}L$, $E\leftrightarrow$ new qubits. | gauging:b1 |
| `pp-vertex-check` | vertex check $A_v$ | notation | An $X$ check on a dot and its links. | $A_v=X_v\prod_{e\ni v}X_e$. | gauging:b2 |
| `pp-cycle-check` | cycle check $B_c$ | notation | A $Z$ check on the links of a loop. | $B_c=\prod_{e\in c}Z_e$. | gauging:b2 |
| `pp-cycle-basis` | cycle basis | notation | A list of independent loops that builds every loop. | $E-V+1$ cycles generating the null space of the incidence matrix over GF(2). | gauging:b3 |
| `pp-cheeger` | Cheeger constant $h(G)$ | notation | The worst bottleneck of a graph. | $\min_{\lvert S\rvert\le\lvert V\rvert/2}\lvert\partial S\rvert/\lvert S\rvert$. | distance:b2 |
| `pp-gauge-qubit` | gauge qubit | — | A spare qubit no check constrains; it carries no data. | An unfixed degree of freedom of a subsystem code. | distance:b3 |
| `pp-time-like` | time-like failure | — | A measurement that lies, as opposed to a qubit that errs. | A flipped check outcome; guarded by repeating the measurement. | distance:b4 |
| `pp-bridge` | bridge | — | Extra links joining two measurement graphs. | $w$ edges between $G_A$ and $G_B$, adding $w-1$ cycles. | bridges:b1 |
| `pp-adapter` | adapter | — | A one-to-one matching that joins graphs of different codes. | SJY24 Def. 8: a matching of equal-size vertex subsets. | bridges:b3 |
Reused, not redefined: `pp-pauli-frame` (B1), `pp-stabilizer-group`, `pp-logical-operator`, `pp-css-code`, `pp-gf2-null-space` (Q22, F7).

## 6. Review cards
- **logical-measure** G: a product is read through a helper and keeps the superposition its factors would destroy; the update rule says which check goes. F: $\Pi^{s}_P$, the three cases of the rule. Eq $\langle XI,IX\rangle\to\langle\pm ZZ,XX\rangle$. Trap: "measuring the product measures each qubit".
- **surgery** G: seam of $|0\rangle$, four new coin-flip checks, only their product is data; split tracks a sign. F: Hor+12 §3.1–3.2. Eq $\prod_i m_i=\bar X_A\bar X_B$. Trap: "each new check is a measurement of the logical".
- **gauging** G: dots, links, dot checks multiply to $L$, loop checks keep it consistent. F: Alg. 1, $\prod A_v=L$. Eq $A_v=X_v\prod_{e\ni v}X_e$. Trap: "the graph can be any tree".
- **distance** G: bottlenecks let errors through; rounds guard the readout. F: $d'\ge\min(h,1)d$; $R$ rounds. Eq $h=\min|\partial S|/|S|$. Trap: "connected is enough".
- **bridges** G: $w$ links add $w-1$ loops; the bridge must be $d$ wide. F: Cro+24 Lemmas 15–16, SJY24 Def. 8. Eq $(E_A-V_A+1)+(E_B-V_B+1)+w-1$. Trap: "an adapter needs the same code on both sides".

## 7. Symbol-before-use
**7.1 Ground:** $|{+}{+}\rangle$, $Z_1Z_2$ (Q6) logical-measure:b1 · $P$ logical-measure:b3 · $\bar X,\bar Z$ (Q22) logical-measure:b4 · $d$ (B1), $m_i$ surgery:b1–b2 · $G$, dots, links gauging:b1 · $E-V+1$ gauging:b3 · $h$ distance:b2 · $q$, $R$ distance:b4 · $w$ bridges:b1. **FLAG:** $k$ (stored qubits) is used from logical-measure:b4 and was defined in Q21/Q22; $A$, $B$ label patches (surgery) and $A_v$, $B_c$ checks (gauging): the gauging unit writes $A_v$, $B_c$ only with subscripts, and patches as "patch A, patch B" in words.
**7.2 Formal:** adds $\Pi_P^s$, $N(S)$, $S$ logical-measure:b3–b4 · $n,k$ surgery:b1 · $\sigma$, $A_v$, $B_c$, $\partial S$, $V,E$ gauging/distance · $p$ distance:b4 · $\binom Rj$ distance:b4 · $G_A,G_B,|B|$ bridges:b1. Counts: 0 used before definition in either track.

## 8. Errata, source checks and Correction candidates
- **No Correction box in B3.** Everything below was checked and agrees with the sources as read: Hor+12 §3.1 (seam in $|0\rangle$ measures the product of $X$ logicals; our $\bar Z\bar Z$ sign follows the seam readout: their "tracked in software" statement); WY24 Algorithm 1 and Lemma 2 (the bound is tight on the 1–2–3 rung family; the WY24 gross example arithmetic 22 − 12 + 1 = 11 cycles and the paper's 18 − 12 + 1 = 7 are $E-V+1$); Cro+24 §4 numbers (54 + 49 = 103, 8 × 36 = 288) as printed in the summary read.
- **Not verified / not used:** Hor+12's "53 qubits" for a distance-3 CNOT (layout from Fig. 7 not read); SJY24's overlapping-support case; the proofs of Cro+24 Thm 24 (stated as cited). The time-like vote is our toy (independent flips, majority vote), labelled as such in the fidelity note.
- **Naming trap (for the glossary):** Hor+12 call the $X\!X$ merge "rough" and the $Z\!Z$ merge "smooth"; Lit19a and the paper draw them as dashed/solid edges. The chapter names a merge by the Pauli it measures.

## 9. Engine gaps and stage contracts
**9.1 Engine** (beyond `physics/qec`; numpy twins in block "b3" of `make_fixtures.py`, claims `pipeline/claims_papers/b3.py`; routes = the sections of `planB3B4-numpy.py`):
`Tableau.measurePauli(P, choice)` and `stab.updateRule(code|group, P)` → {fixed, outcome, newGenerators, kAfter} (route: GF(2) symplectic + dense projectors, 3 qubits) ·
`surgery.merged(d, product)` (the $d\times(2d+1)$ rotated code, classification of checks kept / new / widened) and `surgery.run(d, product, prep, seed)` on the tableau (n ≤ 55): outcomes, product, frame sign (route: dense 21-qubit simulation for $d=3$, GF(2) membership proofs for $d=5,7$) ·
`gauge.build(host, L, edges)` (Gauss, flux and deformed checks; $k'$, product relation, CSS test) and `gauge.deformedDistance` (null-space enumeration, n ≤ 40) (route: the independent builder) ·
`graph.cycleRank / cycleBasis / cheeger (V ≤ 16) / incidence` ·
`gauge.bridge(G1, G2, pairs)` and hosts `patch3-x`, `patches3-xx`, `patch3-steane` ·
`timelike.productFlip(q, m)`, `timelike.voteFail(R, p)`, `timelike.history(m, R, q, seed)` (route: 16-pattern sum, Monte Carlo) ·
`cnot.byMeasurement(outcomes, input)` (Kraus operators, fixes) (route: dense 3-qubit branches).
Cross-checks to build into the tests: merged $Z$ checks all $+1$ after preparation; every outcome pattern's product equals $\langle\bar X_A\bar X_B\rangle$ in the post-merge state; $M^\dagger M=\tfrac18I$ for the CNOT Kraus operators.
**9.2 Stage contracts** (kinds shared with B1, B4, P1: the fields B3 needs are marked ◆; the judge merges with `P-B1-story.md` / `P-B4-story.md`; one stage-kind agent builds all three kinds).
**S-a `surgery-graph` (new SVG kind, S4).** State `{kind:'surgery-graph', gauge:{host, rungs?, w?, drop?}, show?, focus?, product?, subset?, readouts?, shot?}`. ◆`host` is a registry id, never coordinates:
`patch3-x` (a $d=3$ patch, $L=\bar X$ column, path of 3), `patches3-xx` (two patches, $L=\bar X_A\bar X_B$: the path edges forced by the $Z$ checks plus `rungs` 0–3 bridge edges between the facing columns), `patch3-steane` (patch ⊗ Steane, weight 3 + 3, `w` 1–3 matching pairs), `seam3` (the surgery's own path: four new checks as vertices, three seam qubits as edges); `lpu-gross` is added in P1. ◆`show` ⊂ {`vertices`,`edges`,`cycles`,`checks`}; ◆`focus:{vertex:i}` outlines one vertex check (the dot and its links); ◆`product:true` prints each link's multiplicity in the product of all vertex checks (2 cancels); ◆`subset:'worst'|number[]` shades $S$ and counts $|\partial S|$ (the Cheeger set); ◆`drop` removes that many cycle checks; ◆`readouts` ⊂ {`V`,`E`,`cycles`,`cheeger`,`n`,`k`,`distance`}. Everything is computed by the resolver from `gauge`/`graph`: positions come from the host (rows for a ladder), attachment ticks join the dots to the code's own qubits. Passport "GAUGING GRAPH · new qubits on links"; note "not a place · dots are support qubits, links are new qubits; layout is a drawing". Fidelity: counts, $h$, $k'$, distances exact (distance found by search over the code's null space, ≤ 2²⁴ words); layout schematic; "the drawn graph is one choice of many" (misleading otherwise). Limits: ≤ 16 vertices for `subset`/`cheeger`; ≤ 40 qubits for `distance`; ≤ 3 rungs; print figure 320 × 300; transitions: same host lerps `rungs`/`w` as steps (hard switch), others half-way.
**S-b `spacetime`, readout mode.** State `{kind:'spacetime', history:{mode:'readout', checks:m, rounds:R, q?, seed?, faults?}, show?}`. ◆m 1–8, ◆R odd 1–11; columns are seam checks, rows are rounds; ◆a flipped reading is a dot on the time link; ◆`show` ⊂ {`readings`,`product`,`vote`}: the right column is each round's product reading (odd number of flips), the bottom row the majority vote and the verdict "right/wrong". `faults` is an authored list of (round, check); else `{q, seed}` draws them from the engine's seeded generator. Passport "SPACE-TIME · repeated readout"; fidelity: toy model (independent flips, majority vote) is stated on the stage. B1's `detectors` mode is a separate mode of the same kind.
**S-c `pauli-program`, program mode only (full contract in `P-B4-story.md`).** ◆Columns `{meas:{pauli:'ZZI', outcome?}}`, ◆wires ≤ 6, ◆cursor `upTo`; reads "3 measurements"; `cnot-by-measurement` returns the program and the amplitudes check (split with `amplitudes`).
**S-d `code` (K1) extensions.** ◆Registry id `c422` (the $[[4,2,2]]$ code; square layout). ◆`checks` view takes `measure:'IZZI'`: an extra row in the measured colour and a readout "commutes with every check · not in the group · $k$: 2 → 1" from `StabilizerCode.membership/inNormalizer`. ◆`planar` view takes `surgery:{d, product:'XX'|'ZZ', step:'separate'|'merged'|'split', show?}`, $d\in\{3,5\}$: two patches and the seam column; checks classed kept (grey), new (lit), widened (outlined); `product` outlines the new checks and writes "product = $\bar X_A\bar X_B$"; `split` marks the seam qubits as measured. Readouts $n$, $k$, seam size, new, widened. Fidelity: one seeded run is shown (misleading if read as the only outcome).
**S-e `matrix` tableau width (T1)**: strings up to 4 letters (the 4-qubit code rows `IZZI`, `IXXI`, `XXII`); `su(...)` draws before and after as two tableaux in a split. **S-f `plot`**: engine point series with integer $x$ (`xs:[1,3,…,11]`), `yScale:'log'`, `yLines` (exists), curve `voteFail(q,m)`.
**S-g recipes** (registry additions; params typed and ranged; `recipes.ts` is untouched until the build; no existing recipe is used, `circuit-gates` is too plain for a measured ancilla). 8 recipes: the crawl listed 6 (R-B3-1…6 = `surgery-merge-split`, `gauge-graph` ×2, `product-repeat`, `bridge-join`, `product-measure`); `stab-update`, `code-measure-logical`, `cnot-by-measurement` are new.

| recipe | kind(s) | params | engine call | named outputs |
|---|---|---|---|---|
| `product-measure` | circuit + amplitudes | `product` ZZ\|XX · `mode` product\|separate · `outcome` 0\|1 · `upTo` 0–6 | `runCircuit` (two CNOTs onto a helper, Z readout) | `pEven`, `ampSame`, `pSep`, `concurrence` |
| `stab-update` | matrix tableau (split) | `generators` ≤ 4 strings ≤ 4 letters · `measure` · `outcome?` | `stab.updateRule` | `fixed`, `kept`, `replaced`, `kAfter`, `censusFixed`, `censusRandom` |
| `code-measure-logical` | code (`checks`) | `code` c422\|steane7 · `measure` | `StabilizerCode.membership`, `inNormalizer`, `k` | `kBefore`, `kAfter`, `weight`, `commutes`, `inGroup` |
| `surgery-merge-split` | code (`planar`) | `d` 3\|5 · `product` XX\|ZZ · `step` · `show` · `prep` zero\|plus | `surgery.merged`, `surgery.run` | `n`, `k`, `seam`, `newChecks`, `widened`, `pPattern`, `pProduct`, `pSplit`, `frameSigns` |
| `cnot-by-measurement` | pauli-program + amplitudes | `upTo` 0–3 · `outcomes?` (three signs) | `cnot.byMeasurement` | `pTriple`, `noFix`, `zFix`, `xFix` |
| `gauge-graph` | surgery-graph | `host` · `rungs` 0–3 · `w` 1–3 · `drop` 0–2 · `show` · `focus` · `product` · `subset` · `readouts` | `gauge.build`, `graph.*`, `gauge.deformedDistance` | `V`, `E`, `cycles`, `n`, `k`, `h`, `dX`, `dZ`, `kTotal` |
| `product-repeat` | spacetime + plot | `checks` 1–8 · `rounds` odd 1–11 · `q` 0.001–0.2 · `seed?` · `faults?` | `timelike.productFlip`, `voteFail`, `history` | `pProd`, `fail1…6`, `roundsFor1e3` |
| `bridge-join` | surgery-graph | `w` 1–3 · `host` patches3-xx\|patch3-steane | `gauge.bridge`, `graph.cycleRank` | `cycles`, `checks`, `dist`, `n`, `k`, `orders` |

**9.3 Widgets:** none required (every Try-it above is true on `bit-table`). Optional, shared with Q22/B4: a `pauli-lab` (type Paulis, see clash grid, product and update rule).

## 10. Media (deferred)
No Blender opener (background chapters carry none). Film candidate `b3-merge-split` "Two patches become one, then two": manifest keys `b3NewXChecks`, `b3PatternProb`, `b3FrameSign`. Decor: none.

## 11. Hooks
**11.1 Stations:** the chapter's 11 nodes on the prerequisite map (`#/papers/prereq/B3`); no 448/709 concept-map entries. **11.2 Arcade** (when the Papers course gets one): "each new check is the logical" (`b3PatternProb`), "connected is enough" (`b3DistTable`), "an adapter needs equal codes" (`b3AdapterDist`). **11.3 Bridges** (ids = `pp-` + unit id): existing `pp-q6-parities`, `pp-q7-observables`, `pp-f7-gf2`, `pp-q4-cnot`, `pp-f5-spread`; planned, valid once Q22 is built (S8): `pp-q22-clifford`, `pp-q22-check-matrix`, `pp-q22-css`, `pp-q22-stabilizer`; B1: `b1-planar`, `b1-spacetime`, `b1-cycle` (Papers-internal links).

## 12. Questions for the judge
1. **Reported claims from references.** `ReportedClaim.source` is an ingest source id and `at.page` a printed page; this chapter reports Cro+24 §4 numbers read online (no PDF, no page). Allow `source` = a reference id of the spec and `page` optional (or filled when the PDF batch is approved)?
2. **Three new recipes** beyond the crawl's six (`stab-update`, `code-measure-logical`, `cnot-by-measurement`) and the CNOT-by-measurement derivation (it uses `pauli-program`): approve, or cut D1 and keep Hor+12 §4.1 as a cited remark?
3. **`spacetime` readout mode** and the toy majority-vote model: approve as a mode of B1's kind, or draw the vote with `bits` rows (fallback)?
4. **`c422` and the `surgery` overlay on the `code` kind** (K1) rather than a second kind: approve.
5. The chapter says "the surgery seam is the gauging graph with grouped vertices" only as the incidence-matrix fact (seam parts of the four new checks = incidence matrix of a 4-vertex path); it does not claim more than WY24 Fig. 1b. Keep as written?
6. **Planned Q22 bridges** (`pp-q22-*`): written now, resolved when Q22 lands; B3 must not be built before Q22.
7. **Papers-internal bridges** (`pp-b1-planar`, `pp-b1-spacetime`, B4 `pp-b4-injection`): `BridgeTarget.course` allows `papers`; confirm the return bar and `courses.test.ts` accept a Papers → Papers link, else the chapter names B1/B4 in words.
