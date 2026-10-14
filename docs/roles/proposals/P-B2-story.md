# P-B2-story — B2 "Quantum LDPC codes and bivariate bicycle codes" (role P, Papers background chapter)

Proposal only; nothing under `app/` is touched. Shape, gates, phase tags, claim-key and stage-shorthand conventions as `P-B1-story.md` (read it first: §9.2 there defines `spacetime`, the shared `code` additions, the `circuit` and `plot` additions; this file adds only the BB-specific fields). Every picture is a recipe reference `RC{recipe, params}`; every number a claim whose key cites a recipe output. Shorthand: `QF`=`qldpc-family`, `BC`=`bb-code`, `BP`=`bb-presentations`, `BS`=`bb-schedule`, `BH`=`bb-shift`, `BD`=`bp-decode`.

**Sources read online only** (paraphrased; sections, arXiv HTML has no pages): Bravyi et al. 2308.07915 §4 (Eqs. 1–3, Lemma 1, Table 3, Lemma 2, Def. 1, Lemma 4), §5 (Table 5, Fig. 5), §9.1–9.2; Breuckmann–Eberhardt 2103.06309 §II.1.2, §II.2.2, §III.4, §IV.1, §VI.3–VI.4; Bravyi–Poulin–Terhal 0909.5200 (abstract); Roffe et al. 2005.07016 §V (Eqs. 6–7, OSD-0, OSD-CS; **Appendix C was not readable online**); Müller et al. 2506.01779 (abstract only); the paper (`paper-tdg`, user's copy) §2.1–2.2, A.1–A.2, Fig. 4b (pp. 8–10, 43–47) as the cross-check of every convention. Units bridged: built `f7-gf2`, `f8-clock`, `f5-probability`; planned `q22-css`, `q22-check-matrix` (P-Q22), `b1-toric`, `b1-planar`, `b1-cycle`, `b1-spacetime`, `b1-threshold` (P-B1).

**Evidence.** Scratchpad `planB1B2-numpy.py` (numpy/networkx; BB matrices from circulants, shifts as permutations, logical actions by GF(2) solves, min-sum BP and OSD-0 written from the definitions) plus the tableau run `planB1B2-tableau-bb.py` (Table 5 on a 144- and a 288-qubit tableau); 52 asserted checks, 0 failed (shared with B1). The existing engine (`bbCode`, `cssDistance`) was re-run through vitest and agrees on $n, k$ of all seven Table 3 rows and on the toy code's exact distance. Becomes `pipeline/claims_papers/b2.py`.

**Conventions.** Cell $(i,j)$ = monomial $x^iy^j$ (index $i\cdot m + j$, $x$ the slow index; $x$ east, $y$ north). The paper's toric form of the gross code: $\ell = 12$, $m = 6$, $A = 1 + y + x^3y^{-1}$, $B = 1 + x + x^{-1}y^{-3}$; Bravyi et al.'s form: $A = x^3 + y + y^2$, $B = y^3 + x + x^2$ (`form:'toric'|'bravyi'` in recipes). $H_X = [A|B]$, $H_Z = [B^T|A^T]$; qubits $L$ first then $R$. Claim keys `b2…`; a slash in a key list (`b2K72/90`) abbreviates separate keys, and a monomial written `(dx,dy)` in stage shorthand stands for the typed `{dx, dy}`.

## 0. Chapter map
**Driving question:** "How can one code store a dozen logical qubits when every check stays small?"

| # | id | Title (≤ 8 words) | Question | Sources | Link-backs |
|---|---|---|---|---|---|
| 1 | `b2-ldpc` | Sparse checks and the rate problem | What does sparse mean, and why does the surface code waste qubits? | BE21 §II.1.2, §IV.1; Bra+24 Table 3 | `b1-toric`, `b1-planar`, Q22 |
| 2 | `b2-bpt` | Why the plane is not enough | What does a flat layout forbid? | BPT10; BE21 §III.4; Bra+24 Lemma 2 | `b1-planar` |
| 3 | `b2-polynomials` | Codes from polynomials on a torus | How do two polynomials make checks that commute? | Bra+24 §4 (Eqs. 1–3, Lemma 1, Table 3) | `f8-clock`, `f7-gf2`, Q22, `b1-toric` |
| 4 | `b2-gross` | The gross code family | What is the gross code, and how is it measured? | Bra+24 §4, §5 (Table 5); paper §2.1–2.2, A.1 | `b1-toric`, `b1-cycle` |
| 5 | `b2-automorphisms` | Shifts as logical gates | What do symmetries of the code do to the data? | Bra+24 §9.2; paper A.2 | Q22 |
| 6 | `b2-decoding` | Decoding sparse codes: BP, OSD, Relay-BP | How does a decoder find the flips, and when does it stall? | Rof+20 §V; BE21 §VI.3; Mül+25 | `b1-spacetime` |

**Outcomes:** tell a sparse code from a dense one and compute rates and $kd^2/n$ · build a BB code from $(\ell, m, A, B)$, check $H_XH_Z^T = 0$, and count $k$ two ways · read the gross code as a toric code with long edges and prove two presentations are one code · judge the depth-8 cycle for clashes and sequential equivalence · compute what a shift does to the logical qubits (matrix, order, group) · watch belief propagation converge, stall on a degenerate error, and be rescued by OSD-0. **Prerequisites:** B1 (`b1-toric`, `b1-planar`, `b1-cycle`, `b1-spacetime`), Q22 ($H_XH_Z^T = 0$, logical operators, distance), `f7-gf2`, `f8-clock`.

## 1. Story beats per unit (G ≤ 25 words/sentence, F ≤ 40; every beat has both captions)
Kinds: `plot`, `code`, `bits` (bitmap, grid; new), all through recipes. Trail entries `T: ref §, why`.

### Unit `b2-ldpc` — Sparse checks and the rate problem
**b1 [B] · notation beat, `introduces: ['pp-qldpc-code']`** (sparse means bounded) · Bridge `pp-b1-toric`
- G: "A code is sparse when every check touches only a few qubits, and every qubit sits in only a few checks, at any size. The toric code is sparse."
- F: "A family of [[pp-qldpc-code|quantum LDPC codes]] has bounded check weight and qubit degree as $n \to \infty$ (BE21 §II.1.2). The toric code stays at weight 4 for $n = 18..128$. The CSS codes of Hamming codes have rate near 1 but check weight 4, 8, 16, 32 at $n = 7, 15, 31, 63$: not sparse."
- Cap G/F "check weight against code size: flat for the toric code, climbing for the Hamming family" · Stage `QF{view:'check-weight', hammingR:[3,4,5,6], toricL:[3,4,5,6,8]}` · Claims `b2ToricWeight` 4, `b2HammingW7` 4, `b2HammingW15` 8, `b2HammingW31` 16, `b2HammingW63` 32 · T: `be21` §II.1.2, the definition by bounded weight and degree.

**b2 [B] · notation beat, `introduces: ['pp-code-rate']`** (the rate problem)
- G: "The rate $k/n$ is the share of qubits that carry data. A surface patch of distance $d$ has rate $1/d^2$, so distance 17 costs 289 data qubits for each logical qubit."
- F: "The [[pp-code-rate|rate]] $k/n$: rotated patch $1/d^2$ ($1/9$ at $d = 3$, $1/289$ at $d = 17$), toric code $2/(2L^2) = 1/L^2$ (Chapter B1); with check qubits $1/(2d^2-1)$. A 'good' family keeps rate and $d/n$ both bounded away from zero; BE21 §II.1.2 called a sparse one open (since answered; the paper cites Panteleev–Kalachev only as outlook)."
- Cap G/F "rate against distance for the surface code: $1/d^2$" · Stage `QF{view:'rate', d:[3,5,7,9,11,13,15,17]}` · Claims `b2SurfaceRate3` 0.1111, `b2SurfaceRate17` 0.00346, `b2SurfaceData17` 289 · T: `be21` §II.1.2, constant rate and linear distance as the aim.

**b3 [B]** (what we want)
- G: "The gross code stores 12 logical qubits with distance 12 in 144 data qubits. Twelve surface patches of distance 13 would need $12\times169 = 2028$, fourteen times more."
- F: "$[[144, 12, 12]]$ (Bra+24 Table 3; $d$ reported, $n, k$ computed below). A distance-13 patch (the engine builds odd $d$; 13 is the nearest at or above 12) has $d^2 = 169$ data qubits and one logical qubit, so twelve take 2028 against 144: a ratio of 14.1. In $kd^2/n$ terms, 12 for the gross code against 1 for a patch."
- Cap G/F "144 data qubits for 12 logical qubits, against 2028 for patches" · Stage `QF{view:'kd2n', codes:['gross','surface-d13']}` · Claims `b2K144` 12, `b2N144` 144, `b2SurfaceData13` 169, `b2SurfaceDataFor12` 2028, `b2SurfaceRatio13` 14.08 · Reported `bra24-d144` · T: `bra24` Table 3, the code list.

**b4 [C]** (a dense code)
- Q G: "A quantum Hamming-style code on 63 qubits stores 51 qubits. How big are its checks?" · Q F: "For $r = 6$, $H_X = H_Z$ = the Hamming matrix of length 63: $k$ and the check weight?"
- Reveal G: "Thirty-two qubits per check. High rate, but each check touches half the code, so no chip could wire it." · Reveal F: "$k = 51$ (rate $0.81$), check weight $2^{r-1} = 32$, qubit degree 12: dense, not LDPC."
- Stage `QF{view:'check-weight', hammingR:[6]}` · Claims `b2HammingK63` 51, `b2HammingW63` 32, `b2HammingRate63` 0.8095.

### Unit `b2-bpt` — Why the plane is not enough
**b1 [B] · notation beat, `introduces: ['pp-bpt-bound']`** (what flat checks forbid) · Bridge `pp-b1-planar`
- G: "If checks are short and the qubits lie in a plane, you cannot have many logical qubits and a large distance together. The product $kd^2$ stays below a constant times $n$."
- F: "The [[pp-bpt-bound|Bravyi–Poulin–Terhal bound]]: commuting checks that are local on a 2D lattice obey $kd^2 = O(n)$ (BPT10, abstract); in $D$ dimensions $kd^{2/(D-1)} \le O(n)$ (BE21 §III.4). The constant depends on the reach of the checks. Toric and rotated codes sit at $kd^2/n = 1$."
- Cap G/F "$kd^2/n$ for the toric code and the surface patch: both 1" · Stage `QF{view:'kd2n', codes:['surface-d3','surface-d5','surface-d7','toric-L4']}` · Claims `b2Kd2nSurface` 1, `b2Kd2nToric` 1 · Reported `bpt10-bound` (the statement) · T: `bpt10` abstract; `be21` §III.4.

**b2 [B]** (what long reach buys)
- G: "Our codes sit far above 1: from 6 to 13.5. That does not break the theorem, whose constant depends on how far a check reaches. It shows what long reach buys."
- F: "$kd^2/n$ with the printed distances: $6, 8.89, 7.41, 12, 13.5$ for $n = 72, 90, 108, 144, 288$ (we compute $n, k$; $d$ is proved for $n = 72$ below and reported for the rest). Their checks are not local in the plane, so the theorem's hypothesis fails; the theorem is silent about them."
- Cap G/F "$kd^2/n$ for five BB codes against the planar line at 1" · Stage `QF{view:'kd2n', codes:['b72','b90','b108','gross','two-gross'], logX:true}` · Claims `b2Kd2n72` 6, `b2Kd2n90` 8.889, `b2Kd2n108` 7.407, `b2Kd2n144` 12, `b2Kd2n288` 13.5 · Reported `bra24-d90`, `bra24-d108`, `bra24-d144`, `bra24-d288` · T: `bra24` Table 3.

**b3 [B]** (two flat layers)
- G: "The long edges are not wild. The BB graph splits into two layers, each flat, each with three links at every node. Two layers of couplers are enough."
- F: "Bra+24 Lemma 2: the Tanner graph has thickness 2. Splitting edges by term, $\{A_2, A_3, B_3\}$ and $\{A_1, B_1, B_2\}$ (the transposed terms on Z checks), gives two layers of 432 edges with maximum degree 3 (computed). That each layer is planar is the lemma's claim, confirmed offline by a planarity routine (12 pieces of 24 nodes and 6 of 48), not recomputed here."
- Cap G/F "the two layers drawn in two colours on the gross code" · Stage `BC{preset:'gross', form:'bravyi', view:'layers'}` · Claims `b2LayerDegree` 3, `b2LayerEdges` 864 · Reported `bra24-lemma2` · T: `bra24` §4 Lemma 2, the wheel-graph construction.

**b4 [C]** (qubit degree)
- Q G: "In a BB code, in how many checks does each qubit sit?" · Q F: "Count the ones in a column of $H_X$ and $H_Z$ together."
- Reveal G: "Six: three X checks and three Z checks, matching the six qubits in each check." · Reveal F: "Column weight 3 in each of $H_X$, $H_Z$: qubit degree 6, check weight 6."
- Stage `BC{preset:'gross', form:'toric', view:'torus'}` · Claims `b2QubitDegree` 6, `b2CheckWeight` 6.

### Unit `b2-polynomials` — Codes from polynomials on a torus
**b1 [B] · notation beat, `introduces: ['pp-torus-polynomial']`** (a pattern on a wrapped grid) · Bridge `pp-f8-clock`
- G: "Take a 12-by-6 grid wrapped into a torus. A monomial $x^iy^j$ is the cell $i$ steps east and $j$ steps north; twelve steps east is home again (<<pp-f8-clock|Chapter F8>>). A sum is a set of cells."
- F: "In $\mathbb F_2[x,y]/(x^\ell - 1, y^m - 1)$ a [[pp-torus-polynomial|polynomial]] is a 0/1 pattern on $\ell m$ cells. Multiplying by $x^ay^b$ shifts it; the transpose $x^ay^b \mapsto x^{-a}y^{-b}$ reverses it. $A = 1 + y + x^3y^{-1}$ from $(0,0)$ is the cells $(0,0), (0,1), (3,5)$; the product $AB$ has 9 terms and equals $BA$."
- Cap G/F "the cells of $A$ and of $B$ from the cell $(0,0)$ on the 12-by-6 torus" · Stage `BC{preset:'gross', form:'toric', view:'torus', pattern:{poly:'A', anchor:[0,0]}}` · Claims `b2AWeight` 3, `b2ABweight` 9, `b2ABcommute` 1 · T: `bra24` §4 Eqs. 1–3 (shift matrices, the commuting ring); paper A.1 Eq. 27–28, p. 43.

**b2 [B] · notation beat, `introduces: ['pp-bb-code']`** (the matrices; why they commute) · Bridge `pp-q22-css`
- G: "A [[pp-bb-code|BB code]] sets the stripes of $A$ and $B$ side by side for the X checks, and their transposes, swapped, for the Z checks. Because $AB = BA$, X and Z checks overlap evenly."
- F: "$H_X = [A|B]$, $H_Z = [B^T|A^T]$ (Bra+24 Eqs. 1–2), $n = 2\ell m$, row weight 6; $H_XH_Z^T = AB + BA = 0$ over GF(2), the condition of <<pp-q22-css|Chapter Q22>>. Gross code: ranks $66, 66$; an X check meets 9 Z checks in exactly 2 qubits and 63 in none."
- Cap G/F "$H_X$ and $H_Z$ of the gross code as 72-by-144 pictures of stripes" · Stage `BC{preset:'gross', form:'toric', view:'matrix', which:'both'}` · Claims `b2CheckWeight` 6, `b2GrossRankX` 66, `b2OverlapChecks` 9, `b2ZeroOverlapChecks` 63 · T: `bra24` §4 Eqs. 1–2, the matrices and their commutation.

**b3 [B]** (counting logical qubits; D1)
- G: "Count: $k = 144 - 66 - 66 = 12$. A shortcut: $k$ is twice the number of patterns that both $A$ and $B$ send to zero. For the gross code that number is 6."
- F: "Lemma 1 (Bra+24): $k = 2\dim(\ker A \cap \ker B)$. Gross: $\dim = 6$, $k = 12$. The toric code ($A = 1+x$, $B = 1+y$): $\dim = 1$ (the constant pattern), $k = 2$ as in Chapter B1. Computed for all seven rows of Table 3, each time equal to $n - \mathrm{rank}\,H_X - \mathrm{rank}\,H_Z$."
- Cap G/F "dimension of the common kernel, gross code: 6" · Stage `BC{preset:'gross', form:'toric', view:'matrix', show:['ranks']}` · Claims `b2GrossKer` 6, `b2ToricKer` 1, `b2K144` 12 · T: `bra24` §4 Lemma 1 · Derivation D1.

**b4 [B]** (the family)
- G: "Seven codes, all with checks of size six, from 72 to 756 qubits and 8 to 16 logical qubits. Only for 72 qubits can we prove the distance here: it is 6."
- F: "Table 3 of Bra+24: $[[72,12,6]]$, $[[90,8,10]]$, $[[108,8,10]]$, $[[144,12,12]]$, $[[288,12,18]]$, $[[360,12,\le24]]$, $[[756,16,\le34]]$. We compute every $n$ and $k$. For $n = 72$ a meet-in-the-middle search finds no non-trivial logical operator of weight $\le5$, X-type or Z-type, and weight-6 ones (an offline fixture); the other $d$ are reported."
- Cap G/F "$k$ against $n$ for the seven codes; distances printed or proved" · Stage `QF{view:'table3'}` · Claims `b2N72/90/108/144/288/360/756` 72, 90, 108, 144, 288, 360, 756 · `b2K72/90/108/144/288/360/756` 12, 8, 8, 12, 12, 12, 16 · `b2D72` 6, `b2D72Z` 6 · Reported `bra24-d90`, `bra24-d108`, `bra24-d288`, `bra24-d360` (≤ 24), `bra24-d756` (≤ 34) · T: `bra24` Table 3.

**b5 [B]** (a toy code)
- G: "A tiny BB code on a 2-by-6 torus has 24 qubits, 4 logical qubits and distance 4. A toric code of the same size has 2 logical qubits and distance 3."
- F: "$A = 1 + y + y^2$, $B = 1 + y + xy^2$ on $2\times6$: $[[24, 4, 4]]$ by exhaustive search (12950 patterns); toric $3\times4$: $[[24, 2, 3]]$. $kd^2/n$ is $8/3$ against $3/4$; the price is check weight 6 for 4. Our own example, found by a search; not from a paper."
- Cap G/F "the toy code's checks on the 2-by-6 torus" · Stage `BC{spec:{l:2, m:6, A:[(0,0),(0,1),(0,2)], B:[(0,0),(0,1),(1,2)]}, view:'torus', distance:true}` · Claims `b2ToyN` 24, `b2ToyK` 4, `b2ToyD` 4, `b2ToricSameK` 2, `b2ToricSameD` 3, `b2ToyKd2n` 2.667, `b2ToricSameKd2n` 0.75.

**b6 [C]** (rate with check qubits)
- Q G: "The gross code has 12 logical qubits in 288 physical qubits, check qubits included. What is the rate?" · Q F: "Compute $k/(2n)$ for $[[144,12,12]]$."
- Reveal G: "One in twenty-four, about 0.042." · Reveal F: "$12/288 = 1/24 = 0.0417$, the 'rate' column of Bra+24 Table 3."
- Stage `BC{preset:'gross'}` · Claims `b2Rate144` 0.04167.

### Unit `b2-gross` — The gross code family
**b1 [B]** (a toric code with long edges)
- G: "Give each cell two qubits and two checks. With $A = 1 + x$ and $B = 1 + y$ this is exactly the toric code of Chapter B1: four short edges per check. The gross code adds two long edges per check."
- F: "Cell $(i,j)$ holds the qubits $L$ and $R$, an X check and a Z check (paper Fig. 3a). $A = 1+x$, $B = 1+y$ is Kitaev's lattice under $L(i,j) = h(i,j)$, $R(i,j) = v(i+1, j-1)$ (computed). The gross code's $A$, $B$ give each check 4 local and 2 long edges: 576 local, 288 long, 864 in all."
- Cap G/F "one X check of the gross code: four short edges and two long ones that wrap" · Stage `BC{preset:'gross', form:'toric', view:'torus', check:{kind:'X', cell:[0,0]}, longEdges:true}` · Claims `b2ToricIsBB` 1, `b2LocalEdges` 4, `b2LongEdges` 2, `b2LongTotal` 288, `b2EdgeTotal` 864 · T: paper §2.1 Fig. 3 pp. 8–9 (the unit cell and the long edges); `bra24` Def. 1 and Lemma 4 (toric layout).

**b2 [B] · notation beat, `introduces: ['pp-gross-code']`** (the gross code)
- G: "On a 12-by-6 torus: 144 qubits and 144 checks, so 288 in all, storing 12 logical qubits with distance 12. The two-gross code is 12-by-12, with 288 data qubits and distance 18."
- F: "The [[pp-gross-code|gross code]] $\ell = 12$, $m = 6$, $[[144, 12, 12]]$; the two-gross code $\ell = m = 12$, $[[288, 12, 18]]$ (Bra+24 Table 3; $d$ reported, $n, k$ computed: 144, 12 and 288, 12). Each check has 6 edges, each qubit sits in 6 checks."
- Cap G/F "the gross code on its torus: 72 cells" · Stage `BC{preset:'gross', form:'toric', view:'torus'}` · Claims `b2N144` 144, `b2K144` 12, `b2N288` 288, `b2K288` 12 · Reported `bra24-d144`, `bra24-d288` · T: paper §2.1 p. 9 and A.1 p. 43, where the gross and two-gross parameters are stated.

**b3 [B]** (two descriptions, one code; D2)
- G: "Bravyi et al. write $A = x^3 + y + y^2$. The torus picture writes $A = 1 + y + x^3y^{-1}$. Shift every left qubit up one step and every right qubit east one step, and the two are the same code."
- F: "$(A', B') = (yA, xB)$, since $y^3 = y^{-3}$ on $m = 6$. The relabelling shifts $L$ qubits by $y$, $R$ qubits by $x$ and Z checks by $(xy)^{-1}$; the rows of $H_X$ and $H_Z$ match as sets (computed). Two-gross also needs $y \mapsto y^7$, a relabelling of the rows of the torus. Without the shifts the two forms are different matrices."
- Cap G/F "the gross code in both forms, matched by the shifts" · Stage `BP{code:'gross'}` · Claims `b2IsoGross` 1, `b2IsoGrossNoShift` 0, `b2IsoTwoGross` 1, `b2IsoTwoGrossNoMap` 0 · T: paper A.1 p. 43 ("these $A$, $B$ differ from [Bra+24]'s by a relabelling"); `bra24` Table 3 for the polynomials · Derivation D2.

**b4 [B]** (the depth-8 cycle)
- G: "One cycle measures every check in 8 rounds. Every qubit takes part once per round, and neighbouring checks agree on their order. $C$ cycles take $8C+1$ steps."
- F: "Bra+24 §5, Table 5: X acts on $L$ via $A_2, A_1, A_3$ in rounds 2, 6, 7 and on $R$ via $B_2, B_1, B_3$ in rounds 3–5. Z reads $R$ via $A_1^T, A_3^T, A_2^T$ in rounds 1, 2, 6 and $L$ via $B_1^T, B_2^T, B_3^T$ in rounds 3–5; Z is read in round 7, X in round 8. Gross code: 0 clashes, 0 bad pairs of 5184, overlaps of at most 2 qubits; two cycles on a tableau give all-zero detectors."
- Cap G/F "round 3 of the cycle on the gross code: the active edges" · Stage `BS{preset:'gross', variant:'printed', round:3}` · Claims `b2T5Conflict` 0, `b2T5BadPairs` 0, `b2T5Pairs` 5184, `b2T5MaxOverlap` 2, `b2T5TableauClean` 1, `b2Cycles1` 9, `b2Cycles10` 81 · T: `bra24` §5 Table 5 and Fig. 5 (an authored input, cited); paper Fig. 4b p. 10 ("8C+1 timesteps").

**b5 [C]** (a swapped schedule)
- Q G: "Let the Z checks read their qubits of types $A_1^T$ and $A_2^T$ in each other's rounds. Is the cycle still correct?" · Q F: "Swap the rounds of $A_1^T$ and $A_2^T$ for the Z reads. Count clashing X/Z pairs, and run two cycles on a tableau."
- Reveal G: "No. 432 of the 5184 pairs now read in clashing order, and a simulation fires detectors that should stay silent." · Reveal F: "432 bad pairs of 5184; two cycles on the 288-qubit tableau give non-zero detectors (104 of 216 for one seed). Sequential equivalence is a property of the schedule, not of the code."
- Stage q `BS{preset:'gross', variant:'printed'}`; reveal `BS{preset:'gross', variant:'swap-z-reads'}` · Claims `b2T5SwapBad` 432, `b2T5SwapTableauBad` 1.

**b6 [C]** (steps for many cycles)
- Q G: "How many steps do 12 cycles take?" · Q F: "Evaluate $8C+1$ at $C = 12$."
- Reveal G: "97." · Reveal F: "$8\cdot12 + 1 = 97$; the extra 1 is the first cycle's initialisation."
- Stage `BS{preset:'gross', cycles:12}` · Claims `b2Cycles12` 97.

### Unit `b2-automorphisms` — Shifts as logical gates
**b1 [B] · notation beat, `introduces: ['pp-code-automorphism']`** (symmetries)
- G: "A symmetry of a code reshuffles the qubits so that every check lands on a check of its kind. Slide every qubit of the gross code east or north: all 72 slides are symmetries. Swapping two qubits is not."
- F: "A permutation of qubits is a [[pp-code-automorphism|code automorphism]] if it permutes the rows of $H_X$ and those of $H_Z$. All 72 shifts $x^ay^b$ of the gross code are (computed); a transposition of two qubits is not. Bra+24 §9.2: these form a group isomorphic to the ring's monomials, of order $\ell m = 72$."
- Cap G/F "a shift of the gross code: every check lands on a check" · Stage `BH{preset:'gross', shift:{a:1,b:0}, view:'torus'}` · Claims `b2ShiftsPreserve` 72, `b2SwapPreserves` 0 · T: `bra24` §9.2; paper A.2 p. 46.

**b2 [B]** (what a shift does to the logical qubits)
- G: "A shift moves the X-logicals among themselves. A 12-by-12 table of 0s and 1s says which. The table is invertible, and a circuit of CNOTs on the logical qubits does exactly this."
- F: "A check-preserving permutation acts on the 12 logical $X$ classes as an invertible $M \in GL_{12}(\mathbb F_2)$, and on the logical qubits as the CNOT circuit $|v\rangle \mapsto |Mv\rangle$ up to a Pauli (Bra+24 §9.2). In a fixed basis $M_x$ has 32 ones; $M_x$ and $M_y$ both have order 6."
- Cap G/F "the shift $x$ and its $12\times12$ table" · Stage `BH{preset:'gross', shift:{a:1,b:0}, matrix:true}` (split: torus above, grid below) · Claims `b2OrderMx` 6, `b2OrderMy` 6, `b2MxOnes` 32 (basis-dependent, said on the stage) · T: `bra24` §9.2, automorphisms as logical CNOT circuits.

**b3 [B]** (the group; D3)
- G: "There are 72 shifts but only 36 different effects: the shift $x^6$ does nothing to the logical qubits. The group $x$ and $y$ generate has 36 elements."
- F: "Distinct logical actions among the 72 shifts: 36; the identity is reached by $1$ and $x^6$. The group $\langle M_x, M_y\rangle$ has order 36, whatever the basis. The paper's A.2 (shifts by $\langle x^6, y^6\rangle$ act trivially, 35 non-trivial) is the same count."
- Cap G/F "the 72 shifts fall into 36 classes" · Stage `BH{preset:'gross', group:true}` · Claims `b2DistinctShifts` 36, `b2TrivialShifts` 2, `b2GroupOrder` 36 · T: `bra24` §9.2 (group $\cong M$); paper A.2 p. 46 · Derivation D3.

**b4 [C]** (a trivial shift)
- Q G: "Does shifting the gross code by $x^6$ change the logical qubits?" · Q F: "Is $M_{x^6}$ the identity?"
- Reveal G: "No. $x^6$ slides every qubit half way round the 12-cell direction and the logical qubits do not notice." · Reveal F: "$M_{x^6} = I$ (computed): one of the two trivial shifts."
- Stage `BH{preset:'gross', shift:{a:6,b:0}, matrix:true}` · Claims `b2TrivialShifts` (reused).

### Unit `b2-decoding` — Decoding sparse codes: BP, OSD, Relay-BP
**b1 [B] · notation beat, `introduces: ['pp-bp-decoding']`** (belief propagation) · Bridge `pp-b1-spacetime`
- G: "Every check tells its qubits what it believes about them, and every qubit tells its checks. After a few rounds each qubit says 'flipped' or 'fine'. On a repetition code with one flip it takes one round."
- F: "[[pp-bp-decoding|Belief propagation]] on the Tanner graph (Rof+20 §V, Eqs. 6–7): start from the channel log-ratio $\lambda = \ln\frac{1-p}{p} = 2.944$ at $p = 0.05$ (4.595 at 0.01). Pass min-sum messages (sign product, minimum magnitude), decide 1 when the marginal $P_1 \ge \frac12$, and stop when the syndrome matches or after $n$ rounds. Seven bits, a flip at bit 3: converged after 1 round, marginal $-2.944$ at bit 3. Plain min-sum: the scaling of Rof+20's App. C is not readable online."
- Cap G/F "BP on a repetition code: round 1 already names bit 3" · Stage `BD{code:'rep7', error:[3], p:0.05, iter:1}` · Claims `b2Llr` 2.944, `b2Llr001` 4.595, `b2BpRepIters` 1 · T: `rof20` §V Eqs. 6–7 (marginals, hard decision, stopping); `be21` §VI.3.

**b2 [B]** (degeneracy splits the beliefs; D4)
- G: "Two flips at one corner of the toric code, east and north, have a twin, west and south, with the same lit checks. BP cannot choose. It says 'flipped' for all four, and four flips light nothing."
- F: "On the $3\times3$ torus, X on $h(0,0)$ and $v(0,0)$ lights Z checks $\{2, 6\}$; the opposite two edges of the star do the same at weight 2, and the two errors differ by the star, a stabilizer. Min-sum at $p = 0.05$: all four star edges reach $-2.944$, the estimate has weight 4 and syndrome 0, the hard weight runs $0, 4, 6, 0, 0, 4, 6, 0$ and 18 rounds never converge. $H_Z$ has no four-cycles: degeneracy is the cause (Rof+20 §V)."
- Cap G/F "round 2: all four edges of the star flagged" · Stage `BD{code:'toric3', error:[h0,0, v0,0], p:0.05, iter:2, show:['beliefs']}` · Claims `b2BpToricConverged` 0, `b2BpToricHardWeight` 4, `b2BpStarLlr` −2.944, `b2AltWeight` 2, `b2FourCycles` 0 · T: `rof20` §V, split beliefs from degenerate errors · Derivation D4.

**b3 [B] · notation beat, `introduces: ['pp-osd']`** (ordered-statistics decoding)
- G: "Sort the qubits by how much BP suspects them. Take the most suspected ones that are independent as far as the checks go, and solve exactly for them, assuming the rest are fine. The answer always has the right syndrome."
- F: "[[pp-osd|OSD-0]] (Rof+20 §V): order bits by marginal, take the first $\mathrm{rank}\,H_Z = 8$ independent columns $S$, solve $H_Se_S = s$, set the rest to 0. Here: weight 2, syndrome met, and the answer differs from the true error by nothing (ties broken low) or by the whole star (ties broken high), a stabilizer either way. OSD-CS ($\lambda = 60$) searches further (reported)."
- Cap G/F "OSD-0 after BP: two edges, the right checks lit" · Stage `BD{code:'toric3', error:[…], p:0.05, iter:18, osd:true}` · Claims `b2OsdWeight` 2, `b2OsdValid` 1, `b2OsdHighStab` 1 · Reported `rof20-osdcs` · T: `rof20` §V, OSD-0 and OSD-CS.

**b4 [B]** (Relay-BP; reported only)
- G: "The paper uses a newer decoder, Relay-BP. It reruns BP in a relay with different memory strengths, some negative. It is as light as BP, so chips can host it."
- F: "Reported (Müller et al. 2506.01779, abstract only): BP with disordered, including negative, memory strengths, run as a relay of reruns; reported to beat BP+OSD-CS-10 on BB codes and match minimum-weight matching on surface codes; light enough for FPGA or ASIC. No internals or numbers here."
- Cap G/F "the stall of plain BP that a relay is meant to escape" · Stage `BD{code:'toric3', error:[…], iter:3, show:['beliefs']}` · Reported `mul25-relay` · T: `mul25` abstract, why the paper's every error rate rests on this decoder.

**b5 [C]** (a single flip)
- Q G: "Does BP also stall on a single flipped edge of the same torus?" · Q F: "Run min-sum for one edge error on the $3\times3$ torus."
- Reveal G: "No. It converges in one round and names the edge. A lone flip has no twin." · Reveal F: "Converged after 1 round, estimate = the flipped edge; the stall needs degeneracy."
- Stage q `BD{code:'toric3', error:[h1,1], iter:1}` · Claims `b2BpSingleIters` 1.

**Count:** 4+4+6+6+4+5 = **29 beats** (7 clues, 0 deeper).

### 1.7 Claim ledger (key — recipe output — value; every value printed by `planB1B2-numpy.py`)
- ldpc: `b2ToricWeight` 4 · `b2HammingW7/W15/W31/W63` 4, 8, 16, 32 · `b2HammingK63` 51 · `b2HammingRate63` 0.8095 · `b2SurfaceRate3/17` 0.1111, 0.003460 · `b2SurfaceData17` 289, `b2SurfaceData13` 169, `b2SurfaceDataFor12` 2028 (= 12 × 169), `b2SurfaceRatio13` 14.08.
- bpt: `b2Kd2nSurface` 1, `b2Kd2nToric` 1 · `b2Kd2n72/90/108/144/288` 6, 8.889, 7.407, 12, 13.5 · `b2LayerDegree` 3, `b2LayerEdges` 864 · `b2QubitDegree` 6, `b2CheckWeight` 6.
- polynomials: `b2AWeight` 3, `b2ABweight` 9, `b2ABcommute` 1 · `b2GrossRankX` 66, `b2OverlapChecks` 9, `b2ZeroOverlapChecks` 63 · `b2GrossKer` 6, `b2ToricKer` 1 · `b2N…`, `b2K…` as in `b4` above (each $k$ equals $n - \mathrm{rank}\,H_X - \mathrm{rank}\,H_Z$ and $2\dim(\ker A\cap\ker B)$) · `b2D72`, `b2D72Z` 6 (route B: meet-in-the-middle on syndromes, weights ≤ 6, 1200 zero-syndrome vectors of weight 6, 840 non-trivial) · `b2ToyN/K/D` 24, 4, 4 · `b2ToricSameK/D` 2, 3 · `b2ToyKd2n` 2.667 · `b2ToricSameKd2n` 0.75 · `b2Rate144` 0.04167.
- gross: `b2ToricIsBB` 1 · `b2LocalEdges` 4, `b2LongEdges` 2, `b2LongTotal` 288, `b2EdgeTotal` 864 · `b2IsoGross` 1, `b2IsoGrossNoShift` 0, `b2IsoTwoGross` 1, `b2IsoTwoGrossNoMap` 0 · `b2T5Conflict` 0, `b2T5BadPairs` 0, `b2T5Pairs` 5184, `b2T5MaxOverlap` 2, `b2T5TableauClean` 1, `b2T5SwapBad` 432, `b2T5SwapTableauBad` 1 (route B: stabilizer tableau, 2 cycles, random outcomes) · `b2Cycles1/10/12` 9, 81, 97.
- automorphisms: `b2ShiftsPreserve` 72, `b2SwapPreserves` 0 · `b2OrderMx/My` 6, 6, `b2MxOnes` 32 · `b2DistinctShifts` 36, `b2TrivialShifts` 2, `b2GroupOrder` 36.
- decoding: `b2Llr` 2.944, `b2Llr001` 4.595 · `b2BpRepIters` 1, `b2BpSingleIters` 1 · `b2BpToricConverged` 0, `b2BpToricHardWeight` 4, `b2BpStarLlr` −2.944, `b2AltWeight` 2, `b2FourCycles` 0 · `b2OsdWeight` 2, `b2OsdValid` 1, `b2OsdHighStab` 1.
- **Reported** (R3; `at` pages unknown for arXiv HTML — Question 2): `bra24-d90` 10, `bra24-d108` 10, `bra24-d144` 12, `bra24-d288` 18, `bra24-d360` ≤ 24, `bra24-d756` ≤ 34 (Bra+24 Table 3); `bra24-lemma2` "thickness at most 2" (Lemma 2); `bpt10-bound` "$kd^2 = O(n)$" (BPT10 abstract); `rof20-osdcs` "OSD-CS, $\lambda = 60$" (Rof+20 §V); `mul25-relay` the abstract's two comparisons (no numbers).

## 2. Derivations (step — why — **view**; Ground ≥ Formal; ≥ 2 views each)
**D1 · polynomials:b3 · $k = 2\dim(\ker A\cap\ker B)$** — G (4): (1) $k = n$ minus the two ranks · **BC{gross, matrix}** · (2) the two ranks are equal, by the transpose · **BC{gross, matrix, ranks}** · (3) rank of $[A|B]$ is $\ell m$ minus the common kernel · **BC{toric-3x3, matrix}** · (4) so $k = 2\ell m - 2(\ell m - \dim) = 2\dim$ · **BC{gross, torus}**. F (3): (1) $k = n - \mathrm{rk}H_X - \mathrm{rk}H_Z$ · **BC gross matrix** · (2) $\mathrm{rk}[A|B] = \ell m - \dim(\ker A^T\cap\ker B^T)$, and transposing is a ring automorphism · **BC toric-3x3** · (3) result, 6 for gross · **BC gross ranks**.
**D2 · gross:b3 · two forms, one code** — G (3): (1) the Bravyi form · **BP{gross, form 1}** · (2) shift L by $y$, R by $x$ · **BP{gross, form 2}** · (3) the rows match as sets · **BP{gross, matched}**. F (2): (1) $(yA, xB)$ with $y^3 = y^{-3}$ · **BP form 2** · (2) Z checks relabelled by $(xy)^{-1}$ · **BP matched**.
**D3 · automorphisms:b3 · 36 classes** — G (3): (1) 72 shifts · **BH{shift:[1,0]}** · (2) $x^6$ acts as the identity · **BH{shift:[6,0], matrix}** · (3) 72 over 2 trivial shifts = 36 distinct · **BH{group}**. F (2): (1) $M_{x^6} = I$ · **BH x^6** · (2) $|\langle M_x, M_y\rangle| = 36$ · **BH group**.
**D4 · decoding:b2 · BP's flags cycle between 0, 4 and 6** — G (3): (1) round 1: nothing flagged · **BD{iter:1}** · (2) round 2: the four star edges · **BD{iter:2}** · (3) round 3: six edges, round 4 back to none · **BD{iter:3}**. F (2): (1) messages from the lit checks to the star edges are equal by symmetry · **BD iter 2** · (2) the hard weight cycles with period 4 · **BD iter 3**.
**viewCaptions:** D1 "the stripes of $H_X$, $H_Z$" / "equal ranks" / "a small torus: kernel of dimension 1" / "the gross torus" · D2 "Bravyi's $A$, $B$" / "after the shifts" / "rows matched" · D3 "one shift" / "half way round: nothing happens" / "36 classes" · D4 "round 1" / "round 2" / "round 3".

## 3. Try-it widgets
| Unit | Spec | Try this |
|---|---|---|
| ldpc | `bit-table {mode:'strings', a:'0001111', b:'0110011', combine:'dot'}` (existing) | Two Hamming checks of weight 4 share 2 qubits: "a·b = 0". Now think of weight 32 checks at length 63: why no chip wires them. |
| bpt | `code-lab {mode:'torus-cells', code:{bb:'toy-24'}}` (new, §9.3) | Click a check: its six edges light. In the toric code only four do. |
| polynomials | `code-lab {mode:'poly', l:6, m:6}` | Set $A$, $B$ to $1+x$, $1+y$: $k = 2$. Add a term: $H_XH_Z^T = 0$ still holds, $k$ changes. |
| gross | `code-lab {mode:'schedule-bb'}` | Swap two rounds of the Z reads: the bad-pair counter jumps from 0 to 432. |
| automorphisms | `code-lab {mode:'shift', preset:'gross'}` | Slide by $x$, then by $x^6$: the $12\times12$ table becomes the identity at $x^6$. |
| decoding | `code-lab {mode:'bp', code:'toric3'}` | Click the east and north edges of a corner and step BP: the flags blink 0, 4, 6, 0. Click one edge: it settles in one step. |
Fallback if `code-lab` is declined: `bit-table {mode:'strings'}` on 7-bit rows (ldpc, gross) and `bit-table {mode:'reduce'}` on the 6 bits of a small kernel computation.

## 4. Challenges (tol 0.005 unless stated; integers tol 0; walkthroughs full: no reference problem is assigned)
- **ldpc** 1 warm-up numeric `b2-l-w` check weight of the Hamming CSS code of length 127 → **64**. 2 core numeric `b2-l-rate` $k/n$ of $[[63,51]]$ → **0.8095**. 3 core numeric `b2-l-kd2n` $kd^2/n$ of $[[90,8,10]]$ (reported $d$) → **8.889**.
- **bpt** 1 warm-up numeric `b2-b-surface` $kd^2/n$ of the rotated patch, $d = 9$ → **1**. 2 core numeric `b2-b-degree` qubit degree of a BB code → **6**. 3 core numeric `b2-b-layers` edges per layer of the gross code → **432**.
- **polynomials** 1 warm-up numeric `b2-p-k` $k$ of $A = 1+x$, $B = 1+y$ on any torus → **2**. 2 core numeric `b2-p-ker` $\dim(\ker A\cap\ker B)$ of the gross code → **6**. 3 core choice `b2-p-comm` "Why do X and Z checks commute?" → **$AB = BA$** ✓.
- **gross** 1 warm-up numeric `b2-g-edges` edges of one check → **6**. 2 core numeric `b2-g-steps` steps for 10 cycles → **81**. 3 core choice `b2-g-form` "Do $x^3+y+y^2$ and $1+y+x^3y^{-1}$ give the same matrices?" → **no, they differ by a relabelling** ✓.
- **automorphisms** 1 warm-up numeric `b2-a-count` shifts of the gross code → **72**. 2 core numeric `b2-a-order` order of $M_x$ → **6**. 3 core numeric `b2-a-group` order of the group → **36**.
- **decoding** 1 warm-up numeric `b2-d-llr` $\lambda$ at $p = 0.01$ → **4.595**. 2 core choice `b2-d-split` "Why does BP stall on the star pair?" → **two equal-weight errors share a syndrome** ✓. 3 core numeric `b2-d-osd` weight of OSD-0's answer → **2**.

## 5. Glossary (new; ids `pp-…`)
| id | term | introduces | Ground | Formal | first |
|---|---|---|---|---|---|
| `pp-qldpc-code` | quantum LDPC code | notation | Checks touch few qubits, qubits sit in few checks, at any size. | Bounded check weight and qubit degree (BE21 §II.1.2). | ldpc:b1 |
| `pp-code-rate` | rate | notation | The share of qubits that carry data. | $k/n$ (or $k/2n$ with check qubits). | ldpc:b2 |
| `pp-bpt-bound` | Bravyi–Poulin–Terhal bound | notation | A flat layout with short checks cannot beat $kd^2 \sim n$. | $kd^2 = O(n)$ for 2D local commuting checks (BPT10). | bpt:b1 |
| `pp-torus-polynomial` | torus polynomial | notation | A sum of monomials: a set of cells on a wrapped grid. | Element of $\mathbb F_2[x,y]/(x^\ell-1, y^m-1)$. | polynomials:b1 |
| `pp-bb-code` | bivariate bicycle code | notation | Two polynomials make the X checks; their transposes swapped make the Z checks. | $H_X = [A|B]$, $H_Z = [B^T|A^T]$. | polynomials:b2 |
| `pp-gross-code` | gross code | — | The 12-by-6 code with 12 logical qubits and distance 12. | $[[144,12,12]]$; $\ell=12$, $m=6$. | gross:b2 |
| `pp-code-automorphism` | code automorphism | notation | A reshuffling of qubits that maps checks onto checks. | A permutation preserving the row sets of $H_X$, $H_Z$. | automorphisms:b1 |
| `pp-bp-decoding` | belief propagation | notation | Checks and qubits pass beliefs until each qubit decides. | Min-sum on the Tanner graph; LLR $\lambda = \ln\frac{1-p}{p}$. | decoding:b1 |
| `pp-osd` | ordered-statistics decoding | — | Solve exactly on the most suspected independent qubits. | Information set from BP marginals; OSD-0 and OSD-CS. | decoding:b3 |

## 6. Review cards
- **ldpc** G: sparse = bounded weight and degree; surface rate falls as $1/d^2$. F: BE21 §II.1.2. Eq $k/n = 1/d^2$. Trap: "high rate means good".
- **bpt** G: flat short checks cap $kd^2/n$; long reach lifts it; two flat layers suffice. F: BPT10, Lemma 2. Eq $kd^2 = O(n)$. Trap: "$kd^2/n > 1$ breaks the theorem".
- **polynomials** G: cells, shifts, stripes; $AB = BA$ makes checks commute. F: Eqs. 1–3, Lemma 1. Eq $k = 2\dim(\ker A\cap\ker B)$. Trap: "weight 6 means local".
- **gross** G: a toric code with two long edges per check; one cycle is 8 rounds. F: Table 5, $8C+1$. Eq $(A',B') = (yA, xB)$. Trap: "the two polynomial forms are two codes".
- **automorphisms** G: shifts are logical CNOT circuits; 36 effects. F: $M_x$, order 6. Eq $|\langle M_x, M_y\rangle| = 36$. Trap: "swap two qubits for a gate".
- **decoding** G: BP; stalls on twins; OSD-0 repairs. F: Eqs. 6–7. Eq $\lambda = \ln\frac{1-p}{p}$. Trap: "BP failed because of short loops".

## 7. Symbol-before-use
**7.1 Ground:** $k, n, d$ (B1, Q22) ldpc:b2 · $x, y$, cells polynomials:b1 · $A, B$ polynomials:b1 · $H_X, H_Z$ (Q22) polynomials:b2 · $\ell, m$ polynomials:b1 (as "12 and 6") · $C$ gross:b4 · $M$ automorphisms:b2 · $p$ decoding:b1. **7.2 Formal:** adds $\mathbb F_2[x,y]/(\cdot)$, $x^T$ polynomials:b1 · $\ker$ polynomials:b3 · $L, R$ (qubit types) gross:b1, with check types named only in words ("X check", "Z check") so $X$, $Z$ stay Paulis · $A_i, B_j$, $A_i^T$ gross:b4 · $GL_{12}$ automorphisms:b2 · $\lambda$ decoding:b1 · $\mathrm{rank}\,H$, $S$, $e_S$ decoding:b3. Counts: 0 used before definition in either track.

## 8. Errata
None confirmed (no Correction box). Checked and **not** errors: Bra+24 Table 3 rows (all seven $n, k$ recomputed ✓; the printed rates are $k/2n$ rounded: $1/23$ for $2/45$, $1/95$ for $2/189$); Lemma 1 (✓ on all seven rows); Table 5 (consistent: 0 bad pairs, deterministic detectors on a tableau; a transposition of two rounds is caught); the claim that the paper's polynomials "differ by a relabelling" (✓ gross; two-gross needs $y \mapsto y^7$, which the digest states and we confirm). **Not verified:** Rof+20 App. C (min-sum scaling) and Table 3 thresholds; both need the PDF (`downloads.md` #18).

## 9. Engine gaps and stage contracts
**9.1 Engine** (extends `physics/qec/bb.ts`; numpy twins in `pipeline/claims_papers/b2.py`; parameters typed as listed).
- `bb.ts` additions: `BB_PRESETS` (the seven Table 3 rows in Bravyi form, the paper's gross/two-gross in toric form, `toy-24`, `toric-3x3`); `bbIsomorphism(codeA, codeB, hint)` (shift $L$ by $\alpha$, $R$ by $\beta$, rows of the torus by $y \mapsto y^u$, Z checks by $(\alpha\beta)^{-1}$; returns the maps or null); `bbLayers(code, split)` (edges by term, degree, components); `bbCycleSchedule('table5', variant)` and `scheduleCheck(code, schedule)` → clashes, bad pairs (the parity rule of B1), max overlap, rounds; `bbShiftAction(code, shift)` using the existing `makeLogicalSolver` / `logicalXAction` with a basis from `css.logicals()`, plus `matrixOrder`, `matrixGroupOrder` (closure) and `distinctActions`; `quantumHamming(r)` (CSS from the Hamming matrix); `bbDistanceRecord(name)` → `{value, kind:'exact-offline'|'reported'|'bound', source}` where only `b72` is `exact-offline` (fixture from the meet-in-the-middle search; the build also checks a weight-6 witness live).
- `bp.ts`: `minSumBP(H, syndrome, p, iters)` returns marginals and the hard decision per iteration, `converged`, `iterations`; `osd0(H, syndrome, marginals, tie)`; both exact to the numpy twin (flooding schedule, no scaling factor; open item Question 4).
- Recipes `qldpc-family` [`view` 'check-weight'|'rate'|'kd2n'|'table3', `hammingR?` list 3–6, `toricL?` list 2–8, `d?` odd list ≤ 8, `codes?` names, `logX?`] → `plot`; outputs `hammingW7…W63 hammingK63 toricW surfaceRate3 surfaceRate17 surfaceData17 surfaceData13 surfaceDataFor12 surfaceRatio13 kd2n72…`. `bb-code` [`preset?` or `spec?` {l, m 2–24, A, B lists of {dx, dy}, ≤ 4 terms, l·m ≤ 400}, `form?` 'toric'|'bravyi', `view` 'torus'|'matrix'|'layers', `check?` {kind, cell}, `longEdges?`, `pattern?` {poly 'A'|'B'|'At'|'Bt', anchor}, `which?` 'HX'|'HZ'|'both', `show?` ('ranks','bands'), `distance?` (n ≤ 32 exact)] → `code`, `bits`; outputs `n k cw qd rankX rankZ ker abWeight overlap2 overlap0 localEdges longEdges layerDegree layerEdges d`. `bb-presentations` [`code` 'gross'|'two-gross', `step?` 1–3] → `code`; outputs `iso isoNoShift`. `bb-schedule` [`preset`, `variant` 'printed'|'swap-z-reads', `round?` 1–8, `cycles?` 1–20, `tableau?`] → `code`; outputs `conflict badPairs pairs maxOverlap depth tableauClean`. `bb-shift` [`preset`, `shift` {a, b}, `view?`, `matrix?`, `group?`] → split `code`/`bits`; outputs `preserves swapPreserves orderMx orderMy ones distinct trivial groupOrder`. `bp-decode` [`code` 'rep7'|'toric3', `error` list of bit/edge ids, `p`, `iter` 1–18, `osd?`, `tie?`, `show?` ('beliefs')] → `code`; outputs `llr converged iterations hardWeight starLlr altWeight osdWeight osdValid osdDiffStabilizer fourCycles`.
**Limits:** `distance` only for $n \le 32$ in the page; `tableau` for the gross code runs two cycles on 288 qubits (≈ 1 s) and defaults off; BP ≤ 18 rounds, ≤ 72 bits.
**9.2 Stage contracts** (additions to those of P-B1 §9.2; `spacetime`, the toric/planar views, `circuit` faults and the `plot` series are defined there).
- **K-C′ `code` BB fields.** Source `{bb:{preset|spec}, form?}`; view `'torus'`: $\ell\times m$ cells ($\le 12\times12$ drawn; larger specs elided with counts), each cell a 2×2 block R top-left, X top-right, Z bottom-left, L bottom-right (paper Fig. 3b), local edges straight, long edges as curved stubs labelled by their offset; `'layers'`: edges coloured by layer; `'tanner'`: for registered `rep7`, `toric3`. Overlays: `check:{kind,cell}` (the 6 edges of one check, 4 local + 2 long), `longEdges`, `pattern:{poly,anchor}` (rings the cells of $\alpha A$, $\alpha B$, $\alpha A^T$, $\alpha B^T$), `shift:{a,b}` (ghost arrows of a sample operator and its image), `schedule:{variant,round}` (edges by round, the active round bold, clash pairs outlined), `beliefs:{iter, hard?}` (disc fill by marginal log-ratio, outline by hard decision, an iteration readout "hard weight 4, syndrome unmet"), `osd:true` (the chosen information set ringed, the answer as letters). Passport as K1; limits ≤ 144 data qubits drawn with beliefs; print 320 × 300.
- **K-B `bits` additions.** Pictures (a state draws exactly one): `bitmap` `{matrix:{bb|preset, which}, bands?:[{rows,cols}]}` up to 288 × 576 cells as pixels with block separators between the $L|R$ halves and the X|Z checks, readouts "rows × columns, ones, row weight 6, $H_XH_Z^T = 0$"; `grid` `{shiftAction:{preset,shift}}` or `{rows:string[]}` up to 12 × 12 with row/column labels (the logical table). Fidelity `qc-bits-bitmap` (exact), `qc-bits-basis-dependent` (misleading if read as basis-free).
- **K-P′ `plot` points.** `points?: {x, y, label, status:'computed'|'reported'|'bound'}[]` (≤ 24; `reported` hollow with an "as printed" legend, `bound` drawn with ≤); `xScale:'log'`; `yLines` for the planar line at 1. Positions come from the recipe's outputs, never authored.
**9.3 Widgets:** `code-lab` modes added by B2: `torus-cells`, `poly`, `schedule-bb`, `shift`, `bp` (step BP, show beliefs); same fallback as P-B1 §3.

## 10. Media (deferred, per BUILD-LOG)
Blender opener (map): the gross torus with its 144 long edges rising as arches over a flat toric tile; engine JSON only. No film. Decor: wire-like filaments over a field of tiles; atmosphere only.

## 11. Hooks
**11.1 Concept stations:** one per unit (`pp-b2-ldpc-station` … `pp-b2-decoding-station`); every node of the paper's graph taught here links to exactly one unit: `qldpc-code`, `code-rate` → `b2-ldpc`; `bpt-bound`, `long-range-connectivity` → `b2-bpt`; `polynomial-ring`, `bb-code`, `bb-k-formula` → `b2-polynomials`; `bb-torus-layout`, `gross-code`, `syndrome-cycle-bb` → `b2-gross`; `code-automorphism`, `shift-automorphism` → `b2-automorphisms`; `bp-decoding`, `relay-bp` → `b2-decoding`.
**11.2 Arcade (Spot the error):** "any high-rate code is good" (`b2HammingW63`) · "swap two qubits for a gate" (`b2SwapPreserves`) · "the two polynomial forms are two codes" (`b2IsoGross`) · "BP stalls because of short loops" (`b2FourCycles`) · "a swapped schedule is harmless" (`b2T5SwapBad`).
**11.3 Bridges.** Out: `pp-b1-toric` → `b1-toric`; `pp-b1-planar` → `b1-planar`; `pp-b1-spacetime` → `b1-spacetime`; `pp-q22-css` → `q22-css`; `pp-f8-clock` → `f8-clock`. In: B1 `b1-toric:b6` forward-points here; the paper lecture's `tdg-gross` and `tdg-idle-shift` bridge into `b2-gross` and `b2-automorphisms`.

## 12. Questions for the judge
1. **Distances.** Only $[[72,12,6]]$ is proved here (offline search kept as a fixture, `kind:'exact-offline'`); the other distances are reported from Table 3. Approve the fixture route, or show 72 as reported too.
2. **Reported locations.** arXiv HTML has no pages; Table 3 entries carry `at:{kind:'table', label:'Table 3'}` without a page until PDF #4 of `downloads.md` is approved.
3. **Thickness 2.** Planarity of the layers is shown as reported (Lemma 2) with our offline confirmation noted; an in-page planarity test is not planned.
4. **BP details.** Plain min-sum, flooding, no scaling; Rof+20 App. C could not be read online. Approve with this stated on the stage, or wait for PDF #18.
5. **The toy code** `[[24,4,4]]` is our own search result, labelled as such; keep it, or drop it to avoid the look of a published code.
6. **Tableau check in the page** (`tableau:true`, two cycles of the gross code, about 1 s): default off; approve as an on-demand button, or keep the fixture only.
7. **Claim keys** repeat across beats of one chapter (`b2K144`) but are never shared between chapters: a fact both chapters show gets one key in each (`b2ToricIsBB` here; B1 only tests it in the engine). Confirm.
