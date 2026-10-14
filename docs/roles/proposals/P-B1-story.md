# P-B1-story — B1 "The surface code: a memory you can keep" (role P, Papers background chapter)

Proposal only; nothing under `app/` is touched. Shape: `P-Q21-story.md` §0–12, written for the data-only paper spec (`docs/specs/papers-platform.md`, `decisions/papers-tdg-scope.md` S2): every picture is a **recipe reference** `RC{recipe, params}` (existing: `circuit-gates`; the rest new, §9.1), every number is a claim whose key cites a recipe output. Gates: ≥ 2 distinct derivation views per track (W-709 #11); one notation beat per new notation (#12). Phases: `[B]` ramp ("A reference adds"), `[C]` clue, `[D]` deeper; `'lecture'` unused in a background chapter (Question 1).

**Sources read online only** (paraphrased; sections, since arXiv HTML has no pages): Kitaev quant-ph/9707021 §1 (Eqs. 1–4); Dennis et al. quant-ph/0110143 §III.2–III.3, §IV.2–IV.7, §V.3; Horsman et al. 1111.4022 §1, §2, §7.1 (Figs. 3, 13–15); Litinski 1808.02892 intro, §1.1, §4.3; Roffe 1907.11157 §3, §5, §6.1–6.3; Beverland et al. 2211.07629 App. B (Eq. 1, Table 5); Fowler et al. 1208.0928 (abstract only: no HTML); the paper (`paper-tdg`, user's copy) §2.6 p. 15–17, A.10 p. 65, Fig. 4 p. 10. Course units bridged (ids verified): built `f5-spread`, `f7-gf2`, `f8-clock`, `q13-depolarizing`, `q11-teleport-circuit`, `q6-parities`; planned in `P-Q21-story.md` / `P-Q22-story.md` (not yet built): `q21-classical`, `q21-bit-flip`, `q21-phase-flip`, `q21-shor`, `q22-stabilizer`, `q22-check-matrix`, `q22-css`, `q22-decode`, `q22-clifford`, `q22-gottesman-knill`.

**Evidence.** Scratchpad `planB1B2-numpy.py` (numpy/networkx only; Kitaev's torus built from edges, BB matrices from circulants, a Pauli-propagation fault enumerator) plus two tableau runs `planB1B2-tableau-patch.py`, `-bb.py`; 52 asserted checks, 0 failed. The existing engine (`bbCode`, `rotatedSurfaceCode`, `cssDistance`) was re-run through vitest and agrees on every shared value. Every number below is printed by the script. Becomes `pipeline/claims_papers/b1.py`.

**Conventions.** Qubit/check numbering as the engine: rotated patch qubit $r\cdot d + c$, row $r$ down, $\bar X$ = X on column 0, $\bar Z$ = Z on row 0; toric edge $h(i,j)$ east of vertex $(i,j)$, $v(i,j)$ north of it, star = X on the 4 edges at a vertex, plaquette = Z on the 4 edges of the face with corner $(i,j)$. Claim keys `b1…` (camel case, no underscores: recipe outputs are `[A-Za-z][A-Za-z0-9]*`; a slash in a key list, `b1RepD3/D5`, abbreviates separate keys). Bridges `<<pp-…|words>>` (§11.3). Stage shorthand: `QS`=`qec-small-code`, `TC`=`toric-code`, `RP`=`rotated-patch`, `SC`=`check-schedule`, `CC`=`check-circuit`, `RH`=`repetition-history`, `LE`=`logical-error-curves`, `PF`=`pauli-frame`; the parameters named are the typed ones of §9.1.

## 0. Chapter map
**Driving question:** "How can a grid of small, local checks keep a qubit alive for as long as we like?"

| # | id | Title (≤ 8 words) | Question | Sources | Link-backs |
|---|---|---|---|---|---|
| 1 | `b1-why` | Why fault tolerance | Why must a memory beat every part it is built from? | Rof19 §6.3; Bev+22 App. B | `f5-spread`, `q13-depolarizing`, Q21, Q22 |
| 2 | `b1-toric` | Checks on a torus | How do local checks on a grid store qubits as loops? | Kit03 §1; BE21 §II.2.2 | `f7-gf2`, `f8-clock`, Q22 |
| 3 | `b1-planar` | Boundaries and the rotated patch | How does a flat patch store one qubit cheaply? | Den+02 §III.2; Hor+12 §2, §7.1; Lit19a §4.3 | Q22 |
| 4 | `b1-cycle` | One round of checks, and what goes wrong | How do we read the checks, and when does reading hurt? | Rof19 §3; paper Fig. 4a, §2.6 | Q21, Q22 |
| 5 | `b1-spacetime` | Errors in space and time; matching | What does a decoder see when readouts can lie? | Den+02 §III.3, §IV; Rof19 §6.1; Lit19a §1.1 | `q11-teleport-circuit`, Q22 |
| 6 | `b1-threshold` | Distance, threshold, logical error rate | How fast does a bigger patch get safer, and at what price? | Den+02 §IV.6, §V.3; Rof19 §6.2–6.3; Bev+22; paper A.10 | `f5-spread` |

**Outcomes:** compute the chance of a clean run and the per-step budget of a long computation · build the toric code, count its checks, relations and $k = 2$, and tell logical loops from stabilizer loops · size the rotated patch ($d^2$ data, $d^2-1$ checks, $2d^2-1$ in all) and compare it with the unrotated one · judge a check schedule (clashes, sequential equivalence, hooks) and count the fault places of a check circuit · read a space-time history: detectors, matching, a logical failure · compare three published surface-code formulas and find the distance and qubit count a budget needs. **Prerequisites:** Q21 (repetition code, Shor code, Hamming-style syndromes), Q22 ($H_X H_Z^T = 0$, logical operators, distance, lookup decoding, Clifford conjugation, tableau), `f5-spread`, `f7-gf2`, `f8-clock`.

## 1. Story beats per unit (G ≤ 25 words/sentence, F ≤ 40; every beat has both captions)
Kinds: `plot`, `code`, `circuit`, `spacetime` (new). Every beat that leans on a reference has a trail entry `T: ref §, why`.

### Unit `b1-why` — Why fault tolerance
**b1 [B]** (a run is only as clean as its worst step) · Bridge `pp-q13-depolarizing`
- G: "A useful run takes billions of steps. If every step fails with chance one in a thousand, a run of a thousand steps ends clean only 37 times in a hundred."
- F: "With independent faults of probability $p$ per operation (<<pp-q13-depolarizing|Chapter Q13>>), $N$ operations are fault-free with probability $(1-p)^N$: $0.368$ for $N = 10^3$ and $4.5\times10^{-5}$ for $N = 10^4$ at $p = 10^{-3}$."
- Cap G/F "the chance of a clean run against the number of steps, at $p = 0.001$" · Stage `LE{family:'clean-run', p:0.001, markers:[1e3,1e4]}` · Claims `b1CleanRun1000` 0.3677, `b1CleanRun10000` 4.517e-5 · T: `rof19` §6.3, errors can strike anywhere in a circuit, so one step's chance is what counts.

**b2 [B]** (the budget)
- G: "To finish a billion steps with a two-in-three chance of a clean run, each step may fail with chance at most $4.05\times10^{-10}$. Real parts are millions of times worse."
- F: "Requiring $(1-p_L)^N \ge 2/3$ gives $p_L \le 1-(2/3)^{1/N} \approx \ln(3/2)/N = 4.05\times10^{-10}$ for $N = 10^9$, where $p = 10^{-3}$ expects $10^6$ faults. This target is our choice, used through the chapter, not a figure of any paper."
- Cap G/F "the target line at $4\times10^{-10}$" · Stage `LE{family:'clean-run', target:{N:1e9, success:0.6667}}` · Claims `b1Budget` 4.0547e-10, `b1ExpFaults` 1e6.

**b3 [B]** (copies buy exponents) · Bridge `pp-q21-classical`
- G: "Copies and a vote make errors rarer fast. At flip chance 0.01, three copies fail with chance $3\times10^{-4}$, seven with $3.4\times10^{-7}$. Thirteen copies reach the target."
- F: "The vote of $d$ copies (<<pp-q21-classical|Chapter Q21>>) fails when more than half flip: $P(d) = \sum_{w>d/2}\binom dw p^w(1-p)^{d-w}$ (<<pp-f5-spread|Chapter F5>>). At $p = 0.01$: $2.98\times10^{-4}$, $9.85\times10^{-6}$, $3.42\times10^{-7}$ for $d = 3, 5, 7$; $d = 13$ is the first odd $d$ under $4.05\times10^{-10}$."
- Cap G/F "the vote's failure chance against $d$ at $p = 0.01$, with the target line" · Stage `LE{family:'repetition', p:0.01, x:'d', d:[3,5,7,9,11,13], target:{N:1e9, success:0.6667}}` · Claims `b1RepD3` 2.98e-4, `b1RepD5` 9.8506e-6, `b1RepD7` 3.4167e-7, `b1RepD13` 1.6279e-11, `b1RepDneeded` 13.

**b4 [B]** (two kinds of check, and small ones)
- G: "A qubit suffers bit flips and sign flips, so a memory needs both kinds of check (Chapter Q21). Shor's checks touch six qubits. We want four, and close together."
- F: "A CSS memory needs X and Z checks with $H_X H_Z^T = 0$ (<<pp-q22-css|Chapter Q22>>). Shor's code has check weight 6; Steane's has a qubit in 6 checks; the surface code keeps both at 4. Few, small checks are cheap to measure and cannot spread an error far."
- Cap G "the smallest surface-code patch: checks of size four or two" · F "$d = 3$: check weight $\le 4$, qubit degree $\le 4$" · Stage `RP{d:3}` · Claims `b1ShorCheckWeight` 6, `b1SteaneQubitDegree` 6, `b1PatchCheckWeight` 4, `b1PatchQubitDegree` 4 (from `QS`, `RP`) · T: `be21` §II.1.2, "bounded check weight and qubit degree" is what sparse means.

**b5 [C]** (closer to one half)
- Q G: "If a copy flips with chance 0.1, how many copies reach the same target?" · Q F: "Find the least odd $d$ with $P(d) \le 4.05\times10^{-10}$ at $p = 0.1$, against 13 at $p = 0.01$."
- Reveal G: "37 copies, almost three times as many. The nearer the flip chance is to one half, the more every extra copy costs." · Reveal F: "$d = 37$. Each extra pair of copies buys a smaller factor as $p$ grows and none at $p = 1/2$, the repetition code's threshold (Chapter Q21), so the cost of a target diverges there."
- Stage `LE{family:'repetition', p:0.1, x:'d', d:[13,25,37], target:…}` · Claims `b1RepDneeded01` 37.

### Unit `b1-toric` — Checks on a torus
**b1 [B] · notation beat, `introduces: ['pp-tanner-graph']`** (qubits and checks as a graph) · Bridge `pp-f7-gf2`
- G: "Draw each qubit as a disc and each check as a square, joined when the check acts on the qubit. Steane's code has 7 discs, 6 squares and 24 joins."
- F: "The [[pp-tanner-graph|Tanner graph]] of a CSS code $(H_X, H_Z)$ is bipartite: qubit $j$ joins check $c$ when the matrix entry is 1 (BE21 §II.2.2, Fig. 2). Steane's code (<<pp-q22-css|Chapter Q22>>): 7 + 6 nodes, 24 edges, check weight 4, qubit degree up to 6."
- Cap G/F "Steane's Tanner graph: the last qubit sits in all six checks" · Stage `QS{code:'steane7', view:'tanner'}` · Claims `b1TannerNodes` 13, `b1TannerEdges` 24 · T: `be21` §II.2.2, the layered picture of a CSS code.

**b2 [B]** (the toric code)
- G: "Put a qubit on every edge of an $L$-by-$L$ grid wrapped into a torus. Each corner gets an X check on its four edges. Each tile gets a Z check on its four edges."
- F: "Kitaev's [[pp-toric-code|toric code]] (Kit03 §1, Eq. 1): $n = 2L^2$ edge qubits, star $A_s = \prod X$ over the 4 edges at vertex $s$, plaquette $B_f = \prod Z$ over the 4 edges of face $f$. For $L = 3$: 18 qubits, 9 stars, 9 plaquettes."
- Cap G/F "the 3-by-3 torus: one star lit, with its four edges" · Stage `TC{L:3, view:'torus', show:[]}` · Claims `b1ToricN3` 18, `b1ToricStars3` 9 · T: `kit03` §1 Eq. 1, the definitions of star and plaquette.

**b3 [B]** (why they commute, and how many qubits; D1)
- G: "A corner and a tile share 0 or 2 edges, never 1, so the checks commute. Every edge lies in two corners, so the 9 X checks multiply to the identity. Only 8 are independent."
- F: "$|\mathrm{star}(s)\cap\partial p| \in \{0, 2\}$ gives $H_X H_Z^T = 0$. Each edge lies in two stars and two plaquettes, so the rows of each matrix sum to 0: $\mathrm{rank}\,H_X = \mathrm{rank}\,H_Z = L^2-1$ and $k = 2L^2 - 2(L^2-1) = 2$ (Kit03 §1, Eqs. 1–2)."
- Cap G/F "ranks 8 and 8 on 18 qubits leave 2" · Stage `TC{L:3, view:'tanner'}` · Claims `b1ToricMaxOverlap` 2, `b1ToricRank3` 8, `b1ToricK3` 2, `b1ToricN6` 72, `b1ToricRank6` 35, `b1ToricK6` 2 · T: `kit03` §1 Eq. 2, two relations, two logical qubits · Derivation D1.

**b4 [B]** (errors make pairs of lit checks)
- G: "A flipped qubit lights the two checks beside it. A chain of flips lights only its two ends, however long it is. Three flips in a row still light two checks."
- F: "A Z chain on an open path anticommutes only with the stars at its endpoints (every interior vertex meets it in 2 edges). A path of 3 edges lights 2 stars; decoding pairs up lit checks (Chapter Q22's syndromes, on a lattice)."
- Cap G/F "a chain of three Z flips: the two end stars light" · Stage `TC{L:4, view:'torus', error:{type:'Z', edges:[h0,0 h1,0 h2,0]}, show:['syndrome']}` · Claims `b1ChainLit` 2 · T: `kit03` §1, strings of $\sigma^z$ create excitations only at their ends.

**b5 [B] · notation beat, `introduces: ['pp-logical-loop']`** (logicals are loops)
- G: "A chain with no ends lights nothing. A small loop is just a check. A loop that wraps once round the torus lights nothing and is no check: it changes the stored qubits. It costs $L$ flips."
- F: "A closed Z chain commutes with every star. A contractible loop is a product of plaquettes, a stabilizer; two parallel winding loops differ by plaquettes, so they are one class. Two directions $\times$ (Z loop, X cut) give two logical qubits; a loop meets a cut in one edge. $d = L$: exact 3 and 4 for $L = 3, 4$."
- Cap G/F "a Z loop round the torus and an X cut across it: they share one edge" · Stage `TC{L:4, operator:'z-loop-h', operator2:'x-cut-v', at:0, show:['logical']}` · Claims `b1LoopLit` 0, `b1PlaqStabilizer` 1, `b1LoopClassSame` 1, `b1CutOverlap` 1, `b1ToricD3` 3, `b1ToricD4` 4 · T: `kit03` §1, logical operators are non-contractible loops and cuts; distance $L$.

**b6 [C]** (cost per logical qubit)
- Q G: "On a torus of distance 5, how many data qubits does each logical qubit cost?" · Q F: "$n/k$ for the toric code with $L = 5$; compare the rotated patch of distance 5."
- Reveal G: "50 qubits for 2 logical qubits: 25 each. A flat patch of distance 5 also costs 25 data qubits for its one. Wrapping round does not save anything." · Reveal F: "$n/k = 50/2 = 25 = d^2$; the rotated patch has $d^2 = 25$ data qubits and $k = 1$. Both have rate $1/d^2$: Chapter B2 asks how to beat it."
- Stage `TC{L:5}` / `RP{d:5}` · Claims `b1ToricPerLogical5` 25, `b1RotPerLogical5` 25.

### Unit `b1-planar` — Boundaries and the rotated patch
**b1 [B] · notation beat, `introduces: ['pp-rotated-surface-code']`** (a flat patch with two kinds of edge)
- G: "A flat patch has an edge, and checks at the edge are smaller. Give the patch two kinds of edge: X checks of size two along top and bottom, Z checks of size two along left and right."
- F: "The planar code trades the torus's wrap-around for two boundary types (Den+02 §III.2, Fig. 5). In the rotated layout ([[pp-rotated-surface-code|rotated surface code]], Hor+12 §7.1) $d = 3$ has 4 checks of weight 4 and 4 of weight 2; in general $(d-1)^2$ and $2(d-1)$."
- Cap G/F "the $d = 3$ patch: nine qubits, eight checks, size-two checks at the edge" · Stage `RP{d:3, show:['weights']}` · Claims `b1Rot3Data` 9, `b1Rot3Checks` 8, `b1Rot3W4` 4, `b1Rot3W2` 4 · T: `den02` §III.2 Fig. 5, rough and smooth edges; `hor12` §7.1, the rotated lattice.

**b2 [B]** (one logical qubit; D2)
- G: "Nine qubits and eight independent checks leave $9 - 8 = 1$ stored qubit. For any odd $d$ the patch has $d^2$ qubits and $d^2-1$ checks, so it stores exactly one."
- F: "$k = n - \mathrm{rank}\,H_X - \mathrm{rank}\,H_Z = d^2 - 2\cdot\tfrac{d^2-1}{2} = 1$ (<<pp-q22-check-matrix|Chapter Q22>>). Checks per patch: $d=3$: 8, $d=5$: 24, $d=7$: 48; with data qubits, $2d^2-1 = 17, 49, 97$."
- Cap G/F "three sizes: 17, 49 and 97 qubits in all" · Stage `RP{d:5}` · Claims `b1Rot3K` 1, `b1Rot5Checks` 24, `b1Rot7Checks` 48, `b1Rot3Total` 17, `b1Rot5Total` 49, `b1Rot7Total` 97 · T: `hor12` §7.1, the rotated $d = 3$ patch has 9 data and 8 check qubits · Derivation D2.

**b3 [B]** (logicals run edge to edge)
- G: "A line of X flips from top to bottom lights nothing: it ends where no Z check waits. A line of Z flips from left to right is the other logical. They cross in one qubit."
- F: "$\bar X$ = X on a column, $\bar Z$ = Z on a row; both commute with every check, are not stabilizers, have weight $d$, and meet in one qubit, so they anticommute. Exact distance by search: 3 and 5 for $d = 3, 5$. A single X error lights one Z check at the edge and two inside: 6 and 3 qubits of 9."
- Cap G/F "the logical column and row of $d = 5$; they share one qubit" · Stage `RP{d:5, operator:'xbar', show:['logical']}` · Claims `b1RotD3` 3, `b1RotD5` 5, `b1RotOverlap` 1, `b1Rot3Lit1` 6, `b1Rot3Lit2` 3, `b1Rot5Lit1` 10, `b1Rot5Lit2` 15 · T: `den02` §III.2, logical chains run between like edges.

**b4 [B] · notation beat, `introduces: ['pp-surface-code-patch']`** (why rotate; the patch as a unit)
- G: "The first patch design needs 25 qubits at $d = 3$: 13 data and 12 checks. Turned by 45 degrees it needs 17. The saving tends to a factor of two."
- F: "Unrotated planar code (Rof19 §5): $d^2 + (d-1)^2$ data qubits, $[[d^2+(d-1)^2, 1, d]]$; totals 25, 81, 169 at $d = 3, 5, 7$ against 17, 49, 97, ratio $1.47 \to 1.89$ at $d = 17$. A [[pp-surface-code-patch|patch]] is one such tile, about $2d^2$ qubits (Lit19a §4.3). Note: '13 qubits' in the literature counts the 13 data qubits of the unrotated code (or 9 + 4 reused check qubits)."
- Cap G/F "the unrotated $d = 3$ patch: 13 data qubits and 12 checks" · Stage `RP{d:3, layout:'planar'}` · Claims `b1Unrot3Data` 13, `b1Unrot3Total` 25, `b1Unrot5Total` 81, `b1Unrot7Total` 169, `b1UnrotD3` 3, `b1TotalRatio3` 1.4706, `b1TotalRatio17` 1.8873 · Reported `hor12-13` · T: `rof19` §5 the count $\lambda^2+(\lambda-1)^2$; `hor12` §7.1, rotation saves qubits; `lit19a` §4.3, tile cost.

**b5 [C]** (counting edge checks)
- Q G: "How many size-two checks does a distance-7 patch have?" · Q F: "Count the weight-2 checks of the $d = 7$ rotated patch."
- Reveal G: "Twelve: three on each of the four sides, $2(d-1)$ in all. The other 36 have size four." · Reveal F: "$2(d-1) = 12$ boundary checks and $(d-1)^2 = 36$ bulk checks, 48 in all, matching $d^2-1$."
- Stage `RP{d:7, show:['weights']}` · Claims `b1Rot7W2` 12, `b1Rot7W4` 36.

### Unit `b1-cycle` — One round of checks, and what goes wrong
**b1 [B]** (measuring a check with one extra qubit) · Bridge `pp-q21-bit-flip`
- G: "To read an X check, bring in a fresh check qubit in $|+\rangle$. Let it control an X on each of four data qubits, then read it in the X basis. A Z check swaps the roles."
- F: "X check: prepare $|+\rangle$, CNOT(check $\to d_i$) for four data qubits, measure X; the outcome is the eigenvalue of $X^{\otimes4}$ and the data are untouched (Chapter Q21's helpers, with control and target swapped). Z check: prepare $|0\rangle$, CNOT($d_i\to$ check), measure Z."
- Cap G/F "the X-check circuit: $|+\rangle$, four CNOTs, an X readout" · Stage `CC{type:'X'}` · Claims — · T: `rof19` §3, ancilla syndrome extraction (Figs. 2–3); paper Fig. 4a p. 10, the same circuit for a general check.

**b2 [B]** (order matters; D3 uses its numbers)
- G: "Neighbouring X and Z checks share two qubits. If they touch those in clashing orders, the readout is wrong. Of 576 pairs of orders, 96 avoid clashes and only 16 also read correctly."
- F: "Overlapping checks act as if measured one after another exactly when the shared qubits where the X check goes first are even in number. This is the condition of the paper's Eq. 67 (A.5), as a parity rule, confirmed by tableau simulation for all 96 clash-free pairs. On the $d = 3$ patch: 576 pairs, 96 clash-free, 16 valid."
- Cap G/F "a pair of orders flagged: 8 neighbouring X/Z pairs read in clashing order" · Stage `SC{d:3, xOrder:[TL,TR,BL,BR], zOrder:[BR,TR,BL,TL]}` · Claims `b1SchedPairs` 576, `b1SchedConflictFree` 96, `b1SchedValid` 16, `b1SchedBadPairs` 8 · T: tdg A.5 Eq. 67, the overlapping-checks rule.

**b3 [B]** (a fault on the check qubit spreads; D3)
- G: "A fault on the check qubit midway spreads to the data qubits still to come. After two of four steps it lands on the last two: a hook."
- F: "An X fault on an X-check qubit after $k$ CNOTs becomes X on the remaining $4-k$ data qubits: weights 4, 3, 2, 1 for $k = 0..3$. Modulo the check itself the effective weights are 0, 1, 2, 1. Only $k = 2$, the hook, can matter."
- Cap G/F "a check-qubit fault after two CNOTs reaches two data qubits" · Stage `CC{type:'X', show:['hook'], hookAfter:2}` · Claims `b1HookAfter2` 2, `b1HookEffMax` 2 · Derivation D3 · T: paper Fig. 4a, one circuit measures one check.

**b4 [B] · notation beat, `introduces: ['pp-circuit-noise']`** (counting what can go wrong)
- G: "Every step can fail: preparing, each CNOT, waiting, reading. One check circuit has fourteen such places. With chance $p$ each, we expect $14p$ faults per run."
- F: "[[pp-circuit-noise|Circuit noise]] (paper §2.6, p. 15): preparation and measurement fail with probability $p$, an idle as $X$, $Y$ or $Z$ with $p/3$ each, a CNOT as one of 15 two-qubit Paulis with $p/15$ each. One weight-4 check has $1 + 1 + 4 + 8 = 14$ places; with $q = p/15$ it has $N = 14\times15 = 210$ faults and $Nq = 14p$. A simpler [[pp-phenomenological-noise|phenomenological model]] keeps only data errors and flipped readouts (Den+02 §III.3)."
- Cap G/F "the check circuit with its 14 fault places marked" · Stage `CC{type:'X', show:['faults']}` · Claims `b1CheckLocations` 14, `b1CheckN` 210, `b1CheckExpected` 14, `b1CheckEvents` 86 · T: paper §2.6 p. 15, the noise model; `den02` §III.3, errors in the syndrome circuit itself.

**b5 [C]** (does a valid schedule keep the distance?)
- Q G: "Two schedules both read correctly. Does the order change how many faults make a logical error?" · Q F: "Compute $d_{\rm circ}$ of the $d = 3$ patch (Z-memory, 3 rounds) for X order $(TL,TR,BL,BR)$, Z order $(TL,BL,TR,BR)$ and for the pair with the X order $(TL,BL,TR,BR)$, Z order $(TL,TR,BL,BR)$."
- Reveal G: "Yes. The first needs 3 faults, as the code does. In the second the hook lies along the logical line, so a hook and one more fault are enough: 2." · Reveal F: "$d_{\rm circ} = 3$ and $2$ (1470 single-fault events, 221 and 197 distinct signatures); both pass the sign rule and have no clashes. The schedule must put the hook across the logical operator."
- Stage q `SC{d:3, … good, distance:true}`; reveal `SC{d:3, … bad, distance:true}` · Claims `b1DcircGood` 3, `b1DcircBad` 2, `b1FaultEvents` 1470, `b1SigGood` 221, `b1SigBad` 197.

### Unit `b1-spacetime` — Errors in space and time; matching
**b1 [B] · notation beat, `introduces: ['pp-detector']`** (readouts can lie)
- G: "A flipped readout looks like a flipped qubit for one round. So compare each check with its own earlier reading: a change is a detector. It marks an event at a place and a time."
- F: "Under phenomenological noise (previous unit; Den+02 §III.3, §IV.2) data errors have probability $p$ between rounds and readout flips probability $q$. A [[pp-detector|detector]] $D(i,t)$ is the XOR of check $i$'s outcomes in rounds $t-1$ and $t$ (the picture of Den+02 Figs. 7–9). A data error lights two detectors in one round, a readout flip two in consecutive rounds."
- Cap G/F "five-qubit repetition code, four rounds: a data flip lights two detectors side by side" · Stage `RH{n:5, rounds:4, faults:[{kind:'data', at:2, t:2}]}` · Claims `b1StLitData` 2, `b1StLitMeas` 2, `b1StLitEdge` 1 (from `RH` with a readout flip and an edge-qubit flip) · T: `den02` §III.3 and §IV.2 Figs. 7–9, the space-time picture with errors on space links and readout errors on time links.

**b2 [B]** (matching)
- G: "Lit detectors come in pairs joined by the faults that made them. The decoder pairs them up using the fewest faults in all, letting an unpaired one end at the edge."
- F: "A [[pp-matching-decoder|matching decoder]] returns the lightest fault set with the observed detectors: a minimum-weight perfect matching of lit detectors, with edges to a boundary (Den+02 §IV.7; Rof19 §6.1). Here exact for at most 14 events by a subset search."
- Cap G/F "a data flip and a readout flip far apart: two local pairs, matching weight 2" · Stage `RH{n:5, rounds:4, faults:[data q2 t2, meas c0 t3], decode:true}` · Claims `b1StMatchWeight` 2 · T: `den02` §IV.7, matching of defects; `rof19` §6.1, matching is the standard surface-code decoder.

**b3 [B]** (when matching fails)
- G: "With three qubits, two flips in one round look like one flip on the third. The decoder fixes the third, and the three together flip the logical qubit. With five qubits the same two flips are fixed."
- F: "$n = 3$: X on qubits 0, 1 in round 2 lights one detector; the lighter explanation is X on qubit 2, and error $\times$ correction $= X^{\otimes3}$, a logical flip. $n = 5$: the same pair is decoded correctly (Chapter Q22's lookup decoder, now in time)."
- Cap G/F "$n = 3$: the decoder picks qubit 2 and the logical qubit flips" · Stage `RH{n:3, rounds:3, faults:[data q0 t2, data q1 t2], decode:true}` / reveal `n:5` · Claims `b1StFail3` 1, `b1StFail5` 0 · T: `den02` §IV.7, a decoder fails when error and correction together form a logical operator.

**b4 [B]** (counting failures)
- G: "Count every set of faults a distance-3 memory can meet over three rounds. There are 15 places. Of 105 pairs, 9 surely fail and 28 are ties the decoder cannot break. Distance 5 never fails below three faults."
- F: "$n = 3$, $R = 3$: 15 places; weight 1: 0 bad of 15; weight 2: 9 fail and 28 tie of 105; so $P_L \approx 23\,p^2$ with ties split ($2.2\times10^{-3}$ at $p = 0.01$). $n = 5$, $R = 5$: 45 places; weights 1–2: 0 bad of 45 and 990; weight 3: 50 fail, 400 tie of 14190."
- Cap G/F "failures by number of faults, $n = 3$ and $n = 5$" · Stage `RH{n:5, rounds:5, spectrum:true, maxW:3}` · Claims `b1Rep3Edges` 15, `b1Rep3W1Bad` 0, `b1Rep3W2Total` 105, `b1Rep3W2Fail` 9, `b1Rep3W2Tie` 28, `b1Rep3PL` 2.2075e-3, `b1Rep5Edges` 45, `b1Rep5W2Bad` 0, `b1Rep5W3Total` 14190, `b1Rep5W3Fail` 50, `b1Rep5W3Tie` 400 · T: `den02` §IV, chains of errors and the minimum-weight rule.

**b5 [B] · notation beat, `introduces: ['pp-pauli-frame']`** (do not apply the fix; remember it) · Bridge `pp-q11-teleport`
- G: "We need not apply the fix. Write it in a list, the frame, and flip the readout afterwards. The frame must follow the gates: through a CNOT, an X on the control becomes an X on both."
- F: "A [[pp-pauli-frame|Pauli frame]] stores the correction $P$ classically; a later Clifford $U$ acts by conjugation $P \mapsto UPU^\dagger$ (<<pp-q22-clifford|Chapter Q22>>): CNOT sends $X_1$ to $X_1X_2$ and $Z_2$ to $Z_1Z_2$; H swaps X and Z. A readout is flipped when the frame carries the matching Pauli, as teleportation's fix-ups (<<pp-q11-teleport|Chapter Q11>>)."
- Cap G/F "a frame $X$ on qubit 1 through a CNOT: weight 2" · Stage `PF{qubits:2, gates:[CNOT 0→1], frame:'XI', upTo:1}` · Claims `b1FrameWeightX` 2, `b1FrameWeightZ` 2 · T: `lit19a` §1.1, corrections are pushed to the end of the circuit instead of applied.

### Unit `b1-threshold` — Distance, threshold and the logical error rate
**b1 [B] · notation beat, `introduces: ['pp-threshold']`** (the scaling law)
- G: "Below a certain error rate, each step up in distance buys a fixed factor. At $p = 0.001$ each +2 in $d$ makes the error per round ten times smaller; at $p = 0.005$ only two times."
- F: "Published fits take $P(d) = a\,(p/p^*)^{e(d)}$ with $p^* = 0.01$ (a reference rate, the point where all curves meet; the [[pp-threshold|threshold]] proper is Den+02's). Going from $d$ to $d+2$ multiplies $P$ by $p/p^*$: 0.1 at $p = 10^{-3}$, 0.5 at $5\times10^{-3}$."
- Cap G/F "error per round against $p$ for $d = 7, 9, 11, 17$: the lines meet at $p^*$" · Stage `LE{family:'surface', preset:'tdg-A10', x:'p', d:[7,9,11,17]}` · Claims `b1Lambda` 10, `b1LambdaP5e3` 2, `b1FitA10D7` 9.487e-6, `b1FitA10D11` 9.487e-8 (C←R, constants as printed) · Reported `tdg-fit-a10` · T: paper A.10 p. 65.

**b2 [B]** (three formulas)
- G: "Three papers use three slightly different formulas. At $d = 17$ they differ by a factor of three. Always say which one a number comes from."
- F: "At $p = 10^{-3}$, $d = 17$: paper §2.6 ($0.1\,(p/0.01)^{d/2}$) $3.16\times10^{-10}$; paper A.10 ($0.03\,(p/0.01)^{d/2}$) $9.49\times10^{-11}$; Bev+22 Table 5 ($0.03\,(p/0.01)^{(d+1)/2}$) $3.00\times10^{-11}$; the last two differ by $\sqrt{10}$. The cited origin, Fowler et al. 1208.0928, is not readable online (PDF requested)."
- Cap G/F "three fits at $d = 17$ against $p$" · Stage `LE{family:'surface', preset:'all', x:'p', d:[17]}` · Claims `b1Fit26D17` 3.162e-10, `b1FitA10D17` 9.487e-11, `b1FitBev22D17` 3.000e-11, `b1FitRatio` 3.1623 (C←R) · Reported `tdg-fit-26` (p. 17), `bev22-fit` (App. B, Table 5) · T: `bev22` App. B Eq. 1 and Table 5; `fow12` abstract only.

**b3 [B]** (thresholds, as reported)
- G: "Above a threshold a bigger code does worse; below it, better. With perfect readout the threshold is near 11 in 100. With faulty readout, the proven bound is 1 in 100."
- F: "Reported: Den+02 §IV.6 quotes $p_c \approx 0.1094 \pm 0.0002$ for perfect measurement (numerics for the random-bond Ising model); §V.3, Eq. 64 proves $p, q < 0.0114$ for equal data and readout error. The repetition code against bit flips has threshold exactly 1/2 (all vote curves meet there)."
- Cap G/F "vote curves for $d = 3, 5, 7$ cross at $p = 0.5$; printed thresholds marked" · Stage `LE{family:'repetition', x:'p', d:[3,5,7], reportedMarks:[den02-pc, den02-bound]}` · Reported `den02-pc`, `den02-bound` · T: `den02` §IV.6, §V.3; `rof19` §6.2, the threshold theorem.

**b4 [B] · notation beat, `introduces: ['pp-circuit-distance']`** (fault tolerance)
- G: "Circuit distance counts faults anywhere in the circuit. A fault-tolerant circuit keeps it equal to the code distance. Our good schedule has 3; the hook schedule only 2."
- F: "$d_{\rm circ}$ is the fewest circuit faults with trivial detectors and a logical flip (paper §2.6 p. 15; decoder independent), at most the code distance. A gadget is fault tolerant when it keeps $d_{\rm circ}$ at $d$, so fewer than $d/2$ faults are correctable (Rof19 §6.3)."
- Cap G/F "the two schedules: $d_{\rm circ} = 3$ and $2$" · Stage `SC{d:3, … good, distance:true}` · Claims `b1DcircGood`, `b1DcircBad` (reused) · T: paper §2.6 p. 15, circuit distance; `rof19` §6.3.

**b5 [B]** (the memory's price; D4)
- G: "A patch costs about $2d^2$ qubits. A billion steps at $p = 0.001$ needs $d = 17$ with the paper's formulas (577 qubits), $d = 15$ with Bev+22's (449)."
- F: "Least odd $d$ with $P(d) \le 4.05\times10^{-10}$ at $p = 10^{-3}$: 17 (paper forms) or 15 (Bev+22); a patch costs $2d^2-1$ qubits, 577 or 449 (Bev+22 Table 5 takes $2d^2$; one multi-qubit Pauli measurement takes about $d$ rounds, Lit19a)."
- Cap G/F "distance and qubits for the budget under each formula" · Stage `LE{family:'surface', preset:'all', x:'d', p:0.001, target:…}` · Claims `b1DneedA10` 17, `b1Dneed26` 17, `b1DneedBev22` 15, `b1QubitsD17` 577, `b1QubitsD15` 449 · T: `lit19a` §4.3, `bev22` App. B.

**b6 [C]** (how many steps of +2?)
- Q G: "How many steps of +2 in $d$ buy a factor of 1000, at $p = 0.001$ and at $p = 0.005$?" · Q F: "Find $\lceil\ln1000/\ln\Lambda\rceil$ with $\Lambda = 10$ and $2$."
- Reveal G: "Three steps at 0.001 (+6 in $d$), ten at 0.005 (+20). Near the threshold, safety is expensive." · Reveal F: "3 and 10 steps; with $\Lambda = p^*/p$ the cost in $d$ is $2\ln1000/\ln\Lambda$."
- Stage `LE{family:'surface', preset:'tdg-A10', x:'d', p:0.005}` · Claims `b1Steps1000P1e3` 3, `b1Steps1000P5e3` 10.

**Count:** 5+6+5+5+5+6 = **32 beats** (5 clues, 0 deeper).

### 1.7 Claim ledger (key — recipe output — value; every value printed by `planB1B2-numpy.py`)
- why: `b1CleanRun1000/10000` 0.3677, 4.517e-5 · `b1Budget` 4.0547e-10, `b1ExpFaults` 1e6 · `b1RepD3/D5/D7/D13` 2.98e-4, 9.8506e-6, 3.4167e-7, 1.6279e-11 · `b1RepDneeded` 13, `b1RepDneeded01` 37 · `b1ShorCheckWeight` 6, `b1SteaneQubitDegree` 6, `b1PatchCheckWeight` 4, `b1PatchQubitDegree` 4.
- toric: `b1TannerNodes` 13, `b1TannerEdges` 24 · `b1ToricN3` 18, `b1ToricStars3` 9, `b1ToricMaxOverlap` 2, `b1ToricRank3` 8, `b1ToricK3` 2, `b1ToricN6` 72, `b1ToricRank6` 35, `b1ToricK6` 2 · `b1ChainLit` 2, `b1LoopLit` 0, `b1PlaqStabilizer` 1, `b1LoopClassSame` 1, `b1CutOverlap` 1, `b1ToricD3` 3, `b1ToricD4` 4 · `b1ToricPerLogical5` 25, `b1RotPerLogical5` 25.
- planar: `b1Rot{3,5,7}Data` 9, 25, 49 · `Checks` 8, 24, 48 · `Total` 17, 49, 97 · `W4` 4, 16, 36 · `W2` 4, 8, 12 · `K` 1 · `b1RotD3/D5` 3, 5 · `b1RotOverlap` 1 · `b1Rot3Lit1/Lit2` 6, 3; `b1Rot5Lit1/Lit2` 10, 15 · `b1Unrot{3,5,7}Data` 13, 41, 85 · `Total` 25, 81, 169 · `b1UnrotD3/D5` 3, 5 · `b1TotalRatio3/17` 1.4706, 1.8873.
- cycle: `b1SchedPairs` 576, `b1SchedConflictFree` 96, `b1SchedValid` 16, `b1SchedBadPairs` 8 (route B: tableau run, 96 of 96 pairs agree) · `b1HookAfter2` 2, `b1HookEffMax` 2 · `b1CheckLocations` 14, `b1CheckN` 210, `b1CheckExpected` 14, `b1CheckEvents` 86 · `b1DcircGood` 3, `b1DcircBad` 2, `b1FaultEvents` 1470, `b1SigGood` 221, `b1SigBad` 197.
- spacetime: `b1StLitData` 2, `b1StLitMeas` 2, `b1StLitEdge` 1, `b1StMatchWeight` 2, `b1StFail3` 1, `b1StFail5` 0 · `b1Rep3Edges` 15, `b1Rep3W1Bad` 0, `b1Rep3W2Total` 105, `Fail` 9, `Tie` 28, `b1Rep3PL` 2.2075e-3 · `b1Rep5Edges` 45, `b1Rep5W2Bad` 0, `b1Rep5W3Total` 14190, `Fail` 50, `Tie` 400 (route B: all subsets by lookup, not matching) · `b1FrameWeightX/Z` 2, 2.
- threshold: `b1FitA10D7/D11/D17` 9.487e-6, 9.487e-8, 9.487e-11 · `b1Fit26D17` 3.162e-10, `b1FitBev22D17` 3.000e-11, `b1FitRatio` 3.1623 · `b1Lambda` 10, `b1LambdaP5e3` 2 · `b1DneedA10` 17, `b1Dneed26` 17, `b1DneedBev22` 15, `b1QubitsD15/17/25` 449, 577, 1249 · `b1Steps1000P1e3/P5e3` 3, 10.
- **Reported** (R3; value as read online, `at` page unknown for arXiv HTML — Question 2): `tdg-fit-26` "$0.1\cdot(p/0.01)^{d/2}$" (paper §2.6, p. 17); `tdg-fit-a10` "$0.03\,(p/0.01)^{d/2}$" (paper A.10, p. 65); `bev22-fit` "$0.03\,(p/0.01)^{(d+1)/2}$, $2d^2$ qubits" (Bev+22 App. B, Table 5); `den02-pc` "0.1094 ± 0.0002" (Den+02 §IV.6); `den02-bound` "$p, q < 0.0114$" (Den+02 §V.3, Eq. 64); `hor12-13` "a distance-3 patch with 9 data and 8 syndrome qubits; 13 with the four central ones reused" (Hor+12 §7.1, Fig. 14).

## 2. Derivations (step — why — **view**; Ground ≥ Formal; ≥ 2 views each)
**D1 · toric:b3 · $k = 2$** — G (4): (1) each edge is in two corners, so the corners multiply to nothing · **TC{L:3, torus, show:stars}** · (2) the same for tiles · **TC{L:3, torus, show:plaquettes}** · (3) 9 − 1 = 8 independent X checks and 8 Z checks · **TC{L:3, tanner}** · (4) $18 - 16 = 2$, and for any $L$: $2L^2 - 2(L^2-1)$ · **TC{L:6, tanner}**. F (3): (1) row sums vanish · **TC L=3 torus** · (2) ranks $L^2-1$ · **TC L=3 tanner** · (3) $k = 2$ for $L = 6$ (72 qubits, ranks 35) · **TC L=6 tanner**.
**D2 · planar:b2 · $k = d^2 - (d^2-1) = 1$** — G (4): (1) bulk checks, 4 qubits each · **RP{d:5, weights}** · (2) edge checks, 2 qubits each · **RP{d:3, weights}** · (3) half X, half Z: $d^2-1$ in all · **RP{d:7}** · (4) $d^2 - (d^2-1) = 1$ · **RP{d:3}**. F (3): (1) $(d-1)^2 + 2(d-1) = d^2-1$ · **RP d=5** · (2) ranks $(d^2-1)/2$ each · **RP d=7** · (3) $k = 1$ · **RP d=3**.
**D3 · cycle:b3 · hook weights 4, 3, 2, 1** — G (4): (1) fault before any CNOT: all four qubits, the check itself · **CC{hookAfter:0}** · (2) after one: three qubits, one qubit's worth · **CC{hookAfter:1}** · (3) after two: two qubits, a hook · **CC{hookAfter:2}** · (4) after three: one qubit · **CC{hookAfter:3}**. F (3): (1) $4-k$ qubits · **CC hookAfter 1** · (2) modulo the check, $\min(w, 4-w)$ · **CC hookAfter 2** · (3) worst case 2 · **CC hookAfter 3**.
**D4 · threshold:b5 · distance for a budget** — G (3): (1) pick the formula · **LE{preset:'tdg-A10'}** · (2) find the first odd $d$ below the target · **LE{x:'d'}** · (3) multiply: $2d^2-1$ · **LE{preset:'bev22'}**. F (2): (1) $0.03\,(p/0.01)^{d/2} \le 4.05\times10^{-10}$ · **LE A10, x:d** · (2) $d = 17$ and $2d^2-1 = 577$ · **LE bev22, x:d**.
**viewCaptions:** D1 "stars: each edge twice" / "plaquettes: each edge twice" / "ranks 8 and 8" / "ranks 35 and 35 at $L = 6$" · D2 "bulk: weight four" / "edge: weight two" / "$d = 7$: 48 checks" / "one stored qubit" · D3 "fault before the first CNOT" / "after one" / "after two: the hook" / "after three" · D4 "the formula" / "first odd $d$ below the line" / "Bev+22's exponent".

## 3. Try-it widgets
| Unit | Spec | Try this |
|---|---|---|
| why | `curve-explorer {family:'repetition', p:0.01, d:7}` (new, §9.3) | Drag $p$ to 0.1: $P(7)$ rises to $0.0027$; to 0.5 all curves meet. Drag $d$ to 13 at $p = 0.01$: $P$ falls under the target line. |
| toric | `code-lab {mode:'flip', code:{toric:{L:3}}}` (new) | Click three edges in a row: two stars light. Click a whole row of 3: nothing lights, and the readout says "logical operator". |
| planar | `code-lab {mode:'flip', code:{rotated:{d:3}}}` | Click the left column: no check lights, "logical X". Click one edge qubit: one check lights; an inner one lights two. |
| cycle | `code-lab {mode:'schedule', d:3}` | Set both orders to TL, TR, BL, BR: valid. Set Z to BR, TR, BL, TL: 8 flagged pairs. |
| spacetime | `code-lab {mode:'history', n:3, rounds:3}` | Click two data cells in one round: the decoder flips the logical qubit. Click a data cell and a readout cell: corrected. |
| threshold | `curve-explorer {family:'surface', preset:'tdg-A10', p:0.001}` | Change preset: the $d = 17$ line moves by $\sqrt{10}$. Move $p$ to 0.005 and read $\Lambda = 2$. |
Fallback if the two widgets are declined: `bit-table {mode:'strings'}` on Steane's 7-bit rows (toric/planar/cycle) and `bit-table {mode:'cost'}` (why, threshold), losing the lattice interaction.

## 4. Challenges (tol 0.005 unless stated; integers tol 0; walkthroughs full: no reference problem is assigned)
- **why** 1 warm-up numeric `b1-c-clean` $(1-p)^N$ at $p = 0.002$, $N = 500$ → **0.3675**. 2 core numeric `b1-c-budget` $p_L$ for $N = 10^6$, success 1/2 → **6.93e-7** (tol 1e-9). 3 core choice `b1-c-more` "Why do more copies not help at $p = 0.6$?" → **a majority is now more likely wrong** ✓.
- **toric** 1 warm-up numeric `b1-t-n` qubits of $L = 7$ → **98**. 2 core numeric `b1-t-rank` rank of the X checks at $L = 5$ → **24**. 3 core choice `b1-t-loop` "Which Z chain is a logical operator?" → **a loop round the torus** ✓.
- **planar** 1 warm-up numeric `b1-p-total` qubits of $d = 9$ → **161**. 2 core numeric `b1-p-unrot` unrotated data qubits, $d = 7$ → **85**. 3 core numeric `b1-p-w2` size-two checks, $d = 9$ → **16**.
- **cycle** 1 warm-up numeric `b1-c2-places` fault places of a weight-4 check circuit → **14**. 2 core numeric `b1-c2-n` $N$ for that circuit → **210**. 3 core choice `b1-c2-hook` "Which fault after how many CNOTs makes a hook?" → **after two of four** ✓.
- **spacetime** 1 warm-up numeric `b1-s-lit` detectors lit by one readout flip → **2**. 2 core numeric `b1-s-w2` weight-2 sets that fail for $n = 3$, $R = 3$ (fail + tie) → **37**. 3 core choice `b1-s-frame` "Frame $Z$ on the target through CNOT becomes?" → **$Z$ on both** ✓.
- **threshold** 1 warm-up numeric `b1-h-d17` $P(17)$ at $p = 10^{-3}$, A.10 form → **9.49e-11** (tol 1e-12). 2 core numeric `b1-h-lambda` suppression per +2 at $p = 2\times10^{-3}$ → **5**. 3 core numeric `b1-h-qubits` qubits of $d = 15$ → **449**.

## 5. Glossary (new in Papers; ids `pp-…`; none clashes with 709's `qc-…`)
| id | term | introduces | Ground | Formal | first |
|---|---|---|---|---|---|
| `pp-tanner-graph` | Tanner graph | notation | Qubits and checks as discs and squares, joined when a check acts on a qubit. | Bipartite graph of $H_X$, $H_Z$ (BE21 §II.2.2). | toric:b1 |
| `pp-toric-code` | toric code | — | Qubits on grid edges, a check at every corner and tile. | $n = 2L^2$, stars and plaquettes, $k = 2$, $d = L$ (Kit03 §1). | toric:b2 |
| `pp-logical-loop` | logical loop, cut | notation | A loop round the torus: no check, but a change of the stored qubits. | Non-contractible Z chain or X cut; $d = L$. | toric:b5 |
| `pp-rotated-surface-code` | rotated surface code | notation | The compact patch: $d^2$ data qubits, $d^2-1$ checks. | Hor+12 §7.1; weight-2 boundary checks. | planar:b1 |
| `pp-surface-code-patch` | patch | notation | One logical qubit stored in a tile of about $2d^2$ qubits. | A tile of the Litinski model; $2d^2-1$ with checks. | planar:b4 |
| `pp-circuit-noise` | circuit noise | notation | Every preparation, gate, wait and readout can fail. | Faults with $p$, $p/3$, $p/15$ (paper §2.6). | cycle:b4 |
| `pp-phenomenological-noise` | phenomenological noise | — | A simpler model: only qubits and readouts fail, the circuits are perfect. | Data errors $p$, readout flips $q$ (Den+02 §III.3). | cycle:b4 |
| `pp-detector` | detector | notation | A change in a check's reading between two rounds. | $D(i,t) = m_{i,t}\oplus m_{i,t-1}$. | spacetime:b1 |
| `pp-matching-decoder` | matching decoder | — | Pairs lit detectors with the fewest faults in all. | Minimum-weight perfect matching with boundary. | spacetime:b2 |
| `pp-pauli-frame` | Pauli frame | notation | A classical list of fixes not yet applied. | $P$ updated by $P \mapsto UPU^\dagger$. | spacetime:b5 |
| `pp-threshold` | threshold | notation | The error rate below which bigger codes win. | $p_c$ of Den+02; the fits' $p^*$ is a reference rate. | threshold:b1 |
| `pp-fault-tolerance` | fault tolerance | — | A design that keeps circuit distance equal to the code distance. | A gadget with $d_{\rm circ} = d$ (Rof19 §6.3). | threshold:b4 |
| `pp-circuit-distance` | circuit distance | notation | The fewest faults in a circuit that flip the logical qubit unseen. | $d_{\rm circ}$ (paper §2.6). | threshold:b4 |

## 6. Review cards
- **why** G: long runs need tiny per-step error; copies buy exponents. F: $(1-p)^N$, the $4\times10^{-10}$ target. Eq $p_L \le 1-(2/3)^{1/N}$. Trap: "a good qubit is enough".
- **toric** G: edge qubits, corner and tile checks; loops are logical. F: Eqs. 1–2, $k = 2$. Eq $k = 2L^2-2(L^2-1)$. Trap: "a small loop is dangerous".
- **planar** G: two edge types; $d^2$ data, $d^2-1$ checks. F: $2d^2-1$ in all. Eq $k = 1$. Trap: "13 qubits is the patch size".
- **cycle** G: one check qubit per check; order matters; hooks. F: sign rule, $d_{\rm circ}$. Eq $N = 14\times15$. Trap: "any valid order is as good".
- **spacetime** G: compare rounds; pair the lit ones. F: detectors, matching, frame. Eq $D(i,t)$. Trap: "a readout flip is a qubit flip".
- **threshold** G: each +2 in $d$ buys a factor; formulas differ. F: three presets. Eq $P(d) = a(p/p^*)^{e(d)}$. Trap: "$p^*$ in the fit is the threshold".

## 7. Symbol-before-use
**7.1 Ground:** $p$, $N$ why:b1 · $d$, copies why:b3 · $L$ toric:b2 · $k$ toric:b3 · $\bar X, \bar Z$ planar:b3 · $q$ cycle:b4 (named "readout flip") · $n$, $R$ spacetime:b3. **7.2 Formal:** adds $H_X, H_Z$ (Q22) why:b4 · $s$, $f$, $A_s$, $B_f$ toric:b2 (face $f$, not $p$, which stays the error rate) · $a, p^*, e(d)$ threshold:b1 · $\Lambda$ threshold:b6 · $d_{\rm circ}$ cycle:b5 · $D(i,t)$, $m_{i,t}$ spacetime:b1. Counts: 0 used before definition in either track.

## 8. Errata
No book error is confirmed (R3 Correction boxes: none). Checked and **not** errors: Kit03 Eq. 2's two relations (rank $L^2-1$ ✓); Rof19's $[[\lambda^2+(\lambda-1)^2, 1, \lambda]]$ (13, 41, 85 data qubits, $k = 1$, $d = \lambda$ ✓ by exact search at $\lambda = 3, 5$); Hor+12's "13 qubits" (counts 9 + 4 reused check qubits; 17 without reuse, a wording clash handled in planar:b4). **Source differences shown, not boxed:** the surface-code fit has three printed forms (paper §2.6, A.10, Bev+22 Table 5: reported note N12); Bev+22 Table 5 verified online to print $0.03\,(p/0.01)^{(d+1)/2}$ and $2d^2$ qubits.

## 9. Engine gaps and stage contracts
**9.1 Engine** (new files under `physics/qec/`, each with a numpy twin in `pipeline/claims_papers/b1.py`; typed recipe parameters in brackets; recipes in `papers/recipes.ts`).
- `toric.ts`: `toricCode(L, M?)` → `{code (built as the BB code $A=1+x$, $B=1+y$; a test checks it equals Kitaev's edge lattice under $L(i,j)=h(i,j)$, $R(i,j)=v(i+1,j-1)$, shown to the learner in Chapter B2 as `b2ToricIsBB`), edges: {id, dir:'h'|'v', i, j}[], stars, plaquettes, loop(dir, at), cut(dir, at)}`. Recipe `toric-code` [`L` 2–8, `M?`, `view` 'torus'|'tanner', `error?` {type 'X'|'Z', edges ≤ 24 of {dir,i,j}}, `operator?`, `operator2?` ('z-loop-h','z-loop-v','x-cut-h','x-cut-v'), `at?`, `show?` ('syndrome','logical'), `distance?` bool (L ≤ 4)] → `code`; outputs `n stars rankX rankZ k checkWeight maxOverlap lit operatorLit operatorWeight operatorStabilizer overlap d perLogical`.
- `planar.ts`: `planarSurfaceCode(d)` (hypergraph product of two open repetition codes: $d^2+(d-1)^2$ data), `surfaceSizes(d)`. Recipe `rotated-patch` [`d` 3|5|7, `layout` 'rotated'|'planar' (planar d ≤ 5), `operator?` 'xbar'|'zbar', `error?`, `show?` ('syndrome','logical','weights'), `distance?`, `compare?`] → `code`; outputs `data checks total w4 w2 k lit d overlap unrotData unrotTotal ratio`.
- `qec-small-code` [`code` 'rep3'|'rep5'|'shor9'|'steane7', `view` 'tanner'|'checks', `error?`, `show?`] → `code` via existing `codes.ts`; outputs `n checks edges checkWeight qubitDegree k lit`.
- `schedule.ts`: `rotatedSchedule(d, xOrder, zOrder)`, `scheduleValid` → `{conflictFree, valid, violations}`; `scheduleCount(d=3)` (24 × 24). `faults.ts`: `memoryCircuit(patch, schedule, rounds)` (R rounds of prepare, 4 CNOT layers, measure; final ideal readout; detectors as in `b1-cycle`), `elementaryFaults` (prep, measure, 15 CNOT Paulis, idle XYZ), `faultSignature` (detector bits + logical flip by Pauli propagation, linear over GF(2)), `circuitDistance(circuit, kmax=3)` by meet-in-the-middle on signatures, `checkCircuit(type, weight)`, `hookWeights`. Recipes `check-schedule` [`d` 3|5|7, `xOrder`/`zOrder` lists of the 4 corners, distinct, `rounds?` 1–4, `distance?` (d = 3 only)] → `code`; outputs `conflictFree valid badPairs steps dCirc faultEvents signatures`; `check-circuit` [`type` 'X'|'Z', `weight?` 2|4, `show?` ('faults','hook'), `hookAfter?` 0–3] → `circuit`; outputs `locations n expected events hookData0…3 hookEff0…3`.
- `spacetime.ts`: `repetitionGraph(n, R)` (detectors $D(i,t)$, $t \le R+1$; data edges at rounds 1..R, readout edges), `historyOf(faults)`, `sampleHistory(p, q, seed)` (existing `random.ts`), `matchSmall(events)` (exact minimum-weight perfect matching with a boundary, dynamic programming over subsets, ≤ 14 events), `decodeHistory`, `failureSpectrum(graph, maxW)` (all subsets by weight through a lookup of lightest fault sets; weight ≤ 3 on ≤ 45 edges, ≤ 4 on ≤ 15). Recipe `repetition-history` [`n` 3–9, `rounds` 1–6, `faults?` ≤ 12 of {kind 'data'|'meas', at, t}, `sample?` {p, q, seed}, `decode?`, `spectrum?`, `maxW?` 1–4] → `spacetime`; outputs `detectors lit matchWeight trueFlip decodedFlip failed edges w1Bad w2Total w2Fail w2Tie w3Total w3Fail w3Tie`.
- `curves.ts`: `cleanRun(N,p)`, `logicalBudget(N, success)`, `repetitionLogical(d,p)`, `surfaceFit(d,p,preset)` with presets `tdg-2.6` (0.1, 0.01, d/2), `tdg-A10` (0.03, 0.01, d/2), `bev22` (0.03, 0.01, (d+1)/2), `dNeeded(fn, target)`. Recipe `logical-error-curves` [`family` 'clean-run'|'repetition'|'surface'|'budget', `preset?` incl. 'all', `x` 'p'|'d'|'N', `p?`, `d?` odd list ≤ 6, `target?` {N, success}, `reportedMarks?` ids] → `plot`; outputs `budget p<name>`-style `pLd7…`, `dNeeded qubits lambda`.
- `frame.ts` (thin): `pauli-frame` [`qubits` 1–3, `gates` ≤ 8 of {gate 'H'|'S'|'CNOT', target, control?}, `frame` Pauli string, `upTo?`] → `circuit` with `observable` bracket at `upTo`; outputs `weight0…`; uses the existing `Pauli.conjugate`.
**Limits:** the memory-circuit distance runs only for $d = 3$ (1470 events, under 1 s); bigger $d$ shows validity only.
**9.2 Stage contracts** (one stage-kind agent; B2's §9.2 adds only the BB-specific fields).
- **K-ST `spacetime` (new SVG).** State `{kind:'spacetime', history:{code:'rep', n:3–9, rounds:1–6, faults?:[{kind:'data'|'meas', at, t}], sample?:{p,q,seed}}, show?:('faults'|'detectors'|'matching'|'verdict')[], cursor?:0–rounds+1, spectrum?:{maxW}}`. Drawing: columns = checks $0..n-2$ with data-qubit ticks between them, rows = rounds $1..R+1$ upward; space edges (data) horizontal, time edges (readout) vertical, a boundary column each side; faults as thick edges (data one hue, readout another), lit detectors as filled discs, the matching as arcs between lit discs and to the boundary, a verdict line "logical qubit: flipped / not flipped; decoder: …" and readouts (events, matching weight). `cursor` dims later rounds. With `spectrum` it draws no history but a bar per weight $w$ (total, fail, tie) from the engine. Passport "SPACE-TIME · detector history"; note "not a place · the repetition code; a surface code has two space dimensions"; fidelity `qc-spacetime-engine` (exact), `qc-spacetime-layout` (schematic), `qc-spacetime-repetition-only` (misleading). Limits: ≤ 14 lit events to match; ≤ 12 authored faults. Print 320 × 300. Source union left open (`code:'rep'` now) for B3's time-like failures.
- **K-C `code` additions** (on K1, `P-Q21-story.md` §9.2; shared with B2). Views: `'torus'` source `{toric:{L, M?}}` (edge qubits on a wrapped $L\times M$ grid ≤ 8, wrap arrows; stars/plaquettes as small squares at vertices/faces), `'planar'` source `{rotated:{d}}` (d = 3, 5, 7; K1 had 3, 5) or `{planar:{d}}` (unrotated, d = 3, 5), `'tanner'` for registered codes. Overlays: `error:{type, edges|qubits}`; `operator` (a named loop/cut or `'xbar'`/`'zbar'`, drawn as letters on the support; `operator2` drawn in a second hue; overlap qubits ringed); `show` adds `'syndrome'` (lit checks), `'logical'`, `'weights'` (check weight written in each square), `'stars'`/`'plaquettes'` (one family highlighted); `schedule:{xOrder, zOrder}` (patch only): on each check four spokes numbered 1–4 by the engine's step, flagged pairs of neighbouring checks outlined, readout "clash-free / valid / 8 flagged". Passport "CODE · qubits and checks"; limits ≤ 8 × 8 torus, ≤ 97 data qubits, one operator and one error at a time.
- **K-F `circuit` addition (additive):** `faults?: {col:number, wires:number[], label?:string}[]` (≤ 24) draws a marker on each listed fault place (preparation, gate, wait, readout); `hook?: {after:0–3}` highlights the check-qubit fault and the data wires it reaches. Fidelity `qc-circuit-fault-markers` (schematic).
- **K-P `plot` additions:** `xScale?:'log'|'linear'` (log needs a positive range); `series?: {fn, params?, label?}[]` (≤ 6, replaces `curve`; named functions `cleanRun` (x = N), `repLogicalVsD`, `repLogicalVsP`, `surfaceVsP`, `surfaceVsD` with `params:{d|p, preset}`), `yLines` reused for the target; `reportedMarks?: {x, label, source}[]` drawn hollow with an "as printed" legend, only from reported claims. Fidelity: fits are `exact` arithmetic on printed constants, `qc-plot-printed-constants` (misleading if read as a measurement).
**9.3 Widgets (new, shared with B2–B4, P1):** `code-lab` (modes `flip`, `schedule`, `history`; B2 adds `bp`, `shift`): click qubits/edges, read lit checks, a classification ("stabilizer", "logical operator", "detected"), the matching decoder's verdict for small cases; reads the `code`/`spacetime` states. `curve-explorer`: sliders for $p$, $d$, preset reading `plot` series and a numeric table. Both optional (fallback in §3).

## 10. Media (deferred, per BUILD-LOG)
Blender opener (map): a rotated $d = 7$ patch whose check lamps light along a growing error chain; engine JSON only. No film. Decor (Higgsfield): a field of small crystal tiles; atmosphere only, no text or numbers.

## 11. Hooks
**11.1 Concept stations:** `pp-b1-why-station`, `pp-b1-toric-station` (needs Q22 CSS), `pp-b1-planar-station`, `pp-b1-cycle-station`, `pp-b1-spacetime-station`, `pp-b1-threshold-station`. Each graph node taught here has exactly one unit, as in `prereq-graph.json`: `ft-motivation` → `b1-why`; `tanner-graph`, `toric-code`, `homology-logicals` → `b1-toric`; `planar-surface-code`, `rotated-surface-code`, `surface-code-patch` → `b1-planar`; `syndrome-cycle`, `circuit-noise`, `phenomenological-noise` → `b1-cycle` (the last is defined at cycle:b4 and used in the next unit); `detector`, `decoder`, `matching-decoder`, `pauli-frame` → `b1-spacetime`; `circuit-distance`, `fault-tolerance`, `threshold`, `logical-error-scaling`, `surface-code-memory` → `b1-threshold`.
**11.2 Arcade (Spot the error):** "a small loop is a logical error" (`b1LoopClassSame`) · "13 qubits is the patch" (`b1Rot3Total`) · "any valid order is as good" (`b1DcircBad`) · "the fit's $p^*$ is the threshold" (`b1Fit…`).
**11.3 Bridges.** Out (new rows in `content/papers/bridges.ts`): `pp-q13-depolarizing` → `q13-depolarizing`; `pp-q21-classical` → `q21-classical`; `pp-q21-bit-flip` → `q21-bit-flip`; `pp-q22-css` → `q22-css`; `pp-q22-check-matrix` → `q22-check-matrix`; `pp-q22-clifford` → `q22-clifford`; `pp-f5-spread` → `f5-spread`; `pp-f7-gf2` → `f7-gf2`; `pp-q11-teleport` → `q11-teleport-circuit`. In: the Q21/Q22 forward hooks (R8) name this chapter once built.

## 12. Questions for the judge
1. **Phases in a background chapter** (`'lecture'` reads "The paper says"): this plan uses `[B]` throughout; alternative: `[L]` for beats resting on the lecture paper's own text (noise model, $d_{\rm circ}$). Rule.
2. **`reported` claims from online references:** the spec's `source` is an ingest source id; arXiv HTML has no pages. Allow `source:'ref:den02'` with `at:{kind:'section', label:'§V.3, Eq. 64'}` and no page? Approved values to be re-read on the page images once the PDFs (`downloads.md` #15–16) are approved.
3. **Teaching the ancilla circuit** (`b1-cycle:b1`): the graph gives `syndrome-extraction-circuit` to Q22, but P-Q22 covers measuring a Pauli by the update rule and Q21 the Z-type helpers, not an X-check circuit with controls reversed; keep this beat, or add it to Q22.
4. **Recipe count and scope:** 8 recipes (7 of the crawl's R-B1-1…7 merged by code family, plus `pauli-frame`, which the crawl missed). Approve, and the circuit-distance enumerator (d = 3 only, in the browser).
5. **Engine duties:** `planarSurfaceCode` (unrotated) and the exact $d_{\rm circ}$ search are not in S5's list (it names the simulator, matching decoder and fault counting); approve as part of "circuit fault counting".
6. **Tie handling:** `b1Rep3PL` splits ties evenly (stated on the stage); alternative: show only definite failures.
7. **Widgets:** approve `code-lab` and `curve-explorer`, or take the `bit-table` fallback.
