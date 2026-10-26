# P-Q19-story — Q19 "Walks, simulation and hybrid algorithms" (role P, Physics 709)

Proposal only; nothing under `app/` is touched. Format: `P-Q18-story.md`'s sections. Standing gates: ≥ 2 distinct derivation views per track; one notation beat per new
notation. Map row: `P-709-map.md` §8 (drafted as "Q17"; `outline.ts` numbers it Q19, last chapter of Part VII). **Phase `'books'`:** no 709 notes cover
Ch. 7, so the "lecture" phase is Bergou alone; ramp `[B]`, clues `[C]`, Go-deeper `[D]` last in its unit (never first, introduces nothing).

**Sources read** (paraphrased; printed pages; Bergou Ch. 7 printed = PDF − 10). Bergou §7.6 pp. 130–139 (Eqs. 7.45–7.79, Figs. 7.7–7.8), §7.7 pp. 140–141
(7.80–7.82), §7.8 pp. 141–142 (7.83–7.86), problems P7.1–P7.3 p. 142 (⚑ cited only: P7.1 star graph with a loop; P7.2 and P7.3 belong to Q18 and Q16).
N&C (printed = PDF − 28) only for Trotter: §4.7 pp. 206–208 (Thm 4.3 Eq. 4.98 p. 207; Eqs. 4.103–4.104 p. 208). **Page images checked** (PDF pp. 142–152 = printed
132–142): every equation 7.46–7.86 re-derived or re-run below; pp. 130–131 are prose. No 709 homework covers §7.6–7.8 (homework-status.md: HW1–HW3 submitted,
no Ch. 7 sheet), so every walkthrough is full. VQE is in neither book: named in one sentence only (R8).

**Ownership.** F5 owns probability and binomial spread; F4 the unitary matrix and eigenvalues; 448 L11 the generator $e^{-iHt}$ (`qc-l11-generator`,
`qc-l11-schrodinger`, NEW rows); Q4 SWAP, $P(\chi)$, $R_x$; Q16 the uniform state $H^{\otimes n}$; **Q17 owns** the oracle, "inversion about the mean", the angle $\alpha$ and
$\sin^2((2k+1)\alpha)$; Q18 owns phase estimation (its controlled powers need $U = e^{-iHt}$ from gates: named in words at simulation:b1); no open-system map appears, so no Q13 bridge. **Q19 owns:** random walk on a graph, the scattering walk and its edge states, the invariant-subspace
solution of the star search and extra-edge search, quantum simulation by Trotter product formulas, MaxCut/QAOA and the hybrid loop.

**Evidence.** Scratchpad `planQ19-numpy.py` (numpy only, own code, independent of the repo engine): route A builds the walk operator vertex by vertex from
Eqs. 7.45–7.48, route B builds it as a circuit ($X_{\rm dir}$ times controlled oracle and diffusion), route C the reduced $4\times4$ and $5\times5$ tables
(7.53, 7.68); Trotter by `eigh` exponentials against the closed bond gate; QAOA by dense exponentials against CNOT-phase-CNOT circuits and a closed form; coin walk by
simulation against a Fourier-space integral. **29 asserted checks, 0 failed**; `planQ19-extra.py`, `planQ19-extra2.py` add peaks, windows and the walk = Grover test
(max gap $2\times10^{-15}$, $N = 4, 8, 16$, $n \le 30$). Every number below comes from these scripts.

**Conventions.** Bergou's $N$ = outer vertices of the star (§7.6) but = vertices of the graph (§7.8): here $N$ is always the star's spokes, $n$ a vertex's degree
or a ring's size (Rosetta, scatter:b1 and qaoa:b1). Spokes $1 \ldots N$, marked spoke 1. Edge state $|v_1, v_2\rangle$; centre vertex 0. Wire code for the 16 edge states
of the $N = 8$ star: first wire = direction (0 = leaving the centre, state $|0,j\rangle$; 1 = arriving, $|j,0\rangle$), the other three = spoke number minus 1. $\hbar = 1$,
$\mathbf S = \boldsymbol\sigma/2$, $|0\rangle = |+z\rangle$, $q_0$ = top wire = MSB. $\Delta$ is Bergou's $\sqrt{t/2}$ (star search) or $(2t/3)^{1/2}$ (extra edge); our exact angle is $\alpha$
($\sin\alpha = 1/\sqrt N$). Claim keys `q19…`; twins `pipeline/claims_qc709/q19.py`. Cross-references "Unit 19.2", "Chapter Q17".

**Stage shorthand.** `circ(C,k)` = `{kind:'circuit', circuit:C, upTo:k}` · `amp(C,k,mode)` (`probability | amplitude | signed`) · `cp(f)` = `complex-plane` · `wg(g,f)` = **S1** `walk-graph` ·
`PW8` = `plot` curve `starWalkMarked8`, x 0…14 (15 samples), marker 4 · `PX64` = curve `extraWalk64` (vs `extraWalk64Plus`), x 0…40 · `TE1` = curve `trotterErr1` alone and `TE` = `trotterErr1` vs `trotterErr2`, x 1…32, both
axes log · `split(a / b)`. Circuits (matrices from the engine, never typed): `C_COINS2` 2 wires init `00`: [H q0 q1] · `C_V` 3 wires init `000`: [$U_v$ on q0–q2, label $U_v$] · `C_W` 4 wires init `0000`: [H q1 q2 q3], then $k$ ×
[unitary on q0–q3, label $W$] · `C_G8` = `groverCircuit(3, [0], 1)` · `C_BOND` 2 wires init `10`: [bond gate, label $U_n$] · `C_TR(M,o)` 3 wires init `100`: $M$ × ([$U_1(t/M)$ on q0–q1], [$U_2(t/M)$ on q1–q2]),
order 2 = [$U_1$ half], [$U_2$], [$U_1$ half] · `C_Q(γ,β)` 4 wires init `0000`: [H×4], [$U_{01}$ (q0,q1) and $U_{23}$], [$U_{12}$ and $U_{30}$], [$R_x(2\beta)$ ×4]; every edge box = `diag(1, e^{-iγ}, e^{-iγ}, 1)`.

## 0. Chapter map
**Driving question:** "Can a quantum particle wandering on a network find things faster, and can a quantum computer imitate nature?"

| # | id | Title (≤ 8 words) | Question | Sources | Link-backs |
|---|---|---|---|---|---|
| 1 | `q19-random-walk` | A walker that flips a coin | How far does a coin-flipping walker get? | Bergou pp. 130–131 | `qc-f5-probability` |
| 2 | `q19-scatter` | A particle that lives on the edges | What must happen at a vertex for a walk to be quantum? | Bergou pp. 131–132 (7.45–7.48), Fig. 7.7 | `qc-f4-unitary`, Q17 |
| 3 | `q19-star-search` | Finding the marked spoke | How many steps find the one odd vertex? | Bergou pp. 132–135 (7.49–7.63) | Q17 |
| 4 | `q19-extra-edge` | Finding an extra edge | Can a walk find a hidden edge, not a vertex? | Bergou pp. 135–139 (7.64–7.79), Fig. 7.8, P7.1 | `q19-star-search` |
| 5 | `q19-simulation` | Imitating a spin chain with gates | Why can few qubits imitate what bytes cannot hold? | Bergou pp. 140–141 (7.80–7.82); N&C pp. 206–208 | `qc-l11-schrodinger`, `qc-l11-generator`, Q4 |
| 6 | `q19-qaoa` | Quantum circuit, classical tuner | How do quantum and classical computers share a task? | Bergou pp. 141–142 (7.83–7.86) | Q16, Q4 |

**Outcomes:** state a coin-flip walk's chances and spread · write the scattering rule and derive $r = (n-2)/n$, $t = 2/n$ from unitarity · solve the star search in its
4-dimensional subspace and explain why it equals Grover · find an extra edge with the 5-dimensional solution and say why the starting sign matters · build a bond gate for
$-J\mathbf S\cdot\mathbf S$, run a Trotter circuit and read its $1/M$ error · build QAOA for MaxCut on a 4-cycle and run the classical tuning loop. **Prerequisites:**
`qc-f5-probability`, `qc-f4-unitary`, `qc-inversion-about-mean` (Q17), `qc-grover-iterate` (Q17), `qc-swap-gate` (Q4), `qc-commutator` (Q3), `hamiltonian` (448), Q16's uniform state.
**Openers:** none (Part VII's sits before Unit 17.2).

## 1. Story beats per unit (G ≤ 25 words/sentence, F ≤ 40; every beat has both captions)
Kinds: random-walk plot, amplitudes, walk-graph · scatter walk-graph, amplitudes, circuit · star-search walk-graph, circuit, amplitudes, plot, complex-plane · extra-edge walk-graph, plot, complex-plane ·
simulation plot, circuit, amplitudes · qaoa walk-graph, circuit, amplitudes, plot.

### Unit `q19-random-walk` — A walker that flips a coin
**b1 [B]** (line, p. 130) · Terms `qc-random-walk` · Bridge `qc-f5-probability`
- G: "A walker stands at 0 and flips a fair coin. Heads: one step right. Tails: one step left. After two steps the chances are $0.25$ at −2, $0.5$ at 0 and $0.25$ at 2 (<<qc-f5-probability|Unit F5.1>>)."
- F: "A [[qc-random-walk|random walk]] on the integers (Bergou §7.6, p. 130): $p(x;n) = \binom{n}{(n+x)/2}2^{-n}$ is the chance of position $x$ after $n$ unbiased steps. For $n = 2$: $p(\pm2;2) = 1/4$, $p(0;2) = 1/2$."
- Cap G "two coins: four equal chances, at positions −2, 0, 0 and 2" · F "$H^{\otimes2}$ then reading: chance $1/4$ per string, position $2k - 2$ for $k$ ones" · Stage `amp(C_COINS2,1,'probability')` (H on two wires) · Claims `q19P2Left` 0.25, `q19P2Mid` 0.5.

**b2 [B]** (spread)
- G: "After ten steps the walker is back at 0 with chance $0.2461$. After a hundred steps its typical distance is $10$, the square root of the steps. The walker wanders slowly."
- F: "$p(0;10) = 252/1024 = 0.2461$. The spread is $\sigma(n) = \sqrt n$ (variance of $n$ independent $\pm1$ steps); the engine sums the exact $p(x;100)$ and finds $10$."
- Cap G/F "typical distance against steps: the square-root curve, 10 at 100 steps" · Stage `plot(randomWalkSigma, x 0…100, marker 100)` · Claims `q19P10Zero` 0.2461, `q19SigmaClass100` 10.

**b3 [B]** (graphs and the path test, pp. 130–131) · Terms `qc-graph`
- G: "A [[qc-graph|graph]] is dots (vertices) joined by lines (edges). To ask whether a path joins $u$ to $v$, walk randomly from $u$ for $2N^3$ steps. Miss $v$ and a path is less than half likely; $m$ runs err below $2^{-m}$."
- F: "A [[qc-graph|graph]] $G = (V, E)$ on $N$ vertices; each step moves to a uniformly chosen neighbour. If a path joins $u$ and $v$, $2N^3$ steps miss $v$ with probability below $1/2$ (Bergou p. 131), so $m$ runs err below $2^{-m}$: for $N = 10$, $2000$ steps and $2^{-5} = 0.031$."
- Cap G/F "a star graph: a centre with eight spokes" · Stage `wg({star:{N:8}})` (no walker) · Claims `q19ConnSteps10` 2000, `q19ConnFail5` 0.031.

**b4 [C]** (is $2N^3$ tight?)
- Q G: "On a path of ten dots, the walker starts at one end. About how many steps to reach the other end?" · Q F: "On a path of $N = 10$ vertices (reflecting at the start), what is the mean number of steps to reach the far end? Compare with $2N^3$."
- Reveal G: "On average $81$ steps, the square of nine. The bound $2000$ is generous because it must hold for every graph." · Reveal F: "$E_k = 1 + (E_{k-1} + E_{k+1})/2$ with $E_0 = 1 + E_1$ gives $E_0 = (N-1)^2 = 81$, far below $2N^3 = 2000$ (our calculation; the book states the bound only)."
- Cap G/F "$n^2$ against the steps: 81 at the nine gaps of the path" · Stage q `wg({star:{N:8}})`; reveal `plot(nSquared, x 0…12, marker 9)` · Claims `q19PathHit10` 81.

**b5 [D]** (a quantum coin; beyond the book: not in Bergou or N&C)
- G: "Give the walker a quantum coin: a Hadamard on the coin, then a step by its state. Paths now interfere. After 100 steps the typical distance is $54.1$, not $10$. After three steps nothing yet differs."
- F: "Coined walk, symmetric start $(|0\rangle + i|1\rangle)/\sqrt2$: $\sigma(10) = 5.47$ against $\sqrt{10} = 3.16$; $\sigma(100) = 54.12$ against $10$; $\sigma(n)/n \to 0.5412$ (linear spread, 'ballistic'). After three steps the chances equal the classical $1/8, 3/8, 3/8, 1/8$ (engine gap $0$). Two routes: simulation and a Fourier-space integral."
- Cap G/F "quantum spread against the square-root curve" · Stage `plot(coinWalkSigma vs randomWalkSigma, x 0…100, marker 100)` · Claims `q19CoinSigma10` 5.473, `q19CoinSigma100` 54.12, `q19CoinRatio100` 0.5412, `q19Coin3Binomial` 0.

### Unit `q19-scatter` — A particle that lives on the edges
**b1 [B] · notation beat, `introduces: ['qc-edge-state']`** · Terms `qc-edge-state`, `qc-scattering-walk`, `qc-star-graph`
- G: "A quantum walker has no single position. Its state says which edge it is on and which way it moves. For the star with 8 spokes there are 16 such states, 8 leaving the centre and 8 arriving."
- F: "In the [[qc-scattering-walk|scattering walk]] (Bergou p. 131) each edge $\{v_1,v_2\}$ carries two orthogonal states, [[qc-edge-state|$|v_1, v_2\rangle$]] (moving from $v_1$ to $v_2$) and $|v_2, v_1\rangle$. Together they form an orthonormal basis, so $E$ edges give dimension $2E$: $16$ for the [[qc-star-graph|star graph]] with $N = 8$ (Fig. 7.7). Bergou's $N$ counts outer vertices here, graph vertices in §7.8 (Rosetta)."
- Cap G "16 bars, one per edge state: first bit 0 = leaving the centre, 1 = arriving; last three bits = spoke number minus 1" · F "the start $N^{-1/2}\sum_j|0,j\rangle$ (7.49) on the 16 edge states" · Stage `split(wg({star:{N:8,marked:1}},{walker:{step:0}}) / amp(C_W,1,'probability'))` · Claims `q19EdgeStates8` 16.

**b2 [B]** (vertex rule, Eq. 7.45)
- G: "At a vertex, arriving edge states turn into leaving ones, and every edge is treated alike. A walker arriving along edge $j$ goes back with amplitude $-r$ or onto any other edge with amplitude $t$."
- F: "A local unitary $U_v$ maps the arriving states to the leaving ones (the same for every edge at $v$, $n$ edges): $U_v|j,v\rangle = -r|v,j\rangle + t\sum_{k\neq j}|v,k\rangle$ (7.45). The walk step $U$ is the combined action of all $U_v$. $r$ and $t$ are fixed by unitarity (next beat; <<qc-f4-unitary|Unit F4.4>>)."
- Cap G/F "a vertex: one arrival, a bounce $-r$ and transmissions $t$" · Stage `wg({star:{N:8}})` · Claims none (numbers follow in b3).

**b3 [B]** (unitarity fixes $r$, $t$; D1) · Bridge `qc-f4-unitary`
- G: "Total chance stays 1: $r^2 + (n-1)t^2 = 1$. Two different arrivals must leave differently: $-2rt + (n-2)t^2 = 0$. Together they give $r = (n-2)/n$ and $t = 2/n$. For $n = 8$: $r = 0.75$, $t = 0.25$."
- F: "(7.46) $|r|^2 + (n-1)|t|^2 = 1$ and (7.47) $-r^*t - rt^* + (n-2)|t|^2 = 0$; for real $r, t$ the second gives $r = (n-2)t/2$, the first $\tfrac{n^2}{4}t^2 = 1$, so $r = (n-2)/n$, $t = 2/n$ (7.48), $r + t = 1$. At $n = 8$ the engine finds $0.75$, $0.25$ and a unitarity gap $0$."
- Cap G/F "the centre acting on arrival 1: amplitude −0.75 on the same spoke, 0.25 on each of the other seven" · Stage `split(wg({star:{N:8}}) / amp(C_V,1,'signed'))` · Claims `q19Vertex8R` 0.75, `q19Vertex8T` 0.25, `q19VertexUnit8` 0 · Derivation D1.

**b4 [B]** (the centre is Grover's mirror)
- G: "As a table, $U_v$ has $-r$ on the diagonal and $t$ elsewhere. That is 'reflect about the mean' from Chapter Q17: each amplitude becomes twice the average minus itself. The marked outer vertex flips the sign."
- F: "For $n = 8$, $U_v = 2|s\rangle\langle s| - I$ with $|s\rangle$ the uniform state (engine gap $0$): the [[qc-inversion-about-mean|inversion about the mean]] of Chapter Q17. An outer vertex reflects ($n = 1$ gives $-r = +1$), the marked one reflects with a $-1$: a phase oracle."
- Cap G/F "one oracle and one mirror about the mean: the marked bar ends at size 0.884, the seven others at 0.177 (the overall sign is a global phase)" · Stage `split(circ(C_G8,5) / amp(C_G8,5,'signed'))` · Claims `q19VertexIsInv8` 0, `q19Grover8Marked` 0.8839, `q19Grover8Other` 0.1768.

**b5 [C]** (walls and wires)
- Q G: "What does the rule do at a vertex with only one edge? And at a vertex with exactly two?" · Q F: "Evaluate $-r$ and $t$ for $n = 1$ and $n = 2$ and interpret."
- Reveal G: "One edge: $-r = +1$, the walker is turned back, as at a wall. Two edges: $r = 0$ and $t = 1$, it passes straight through, like a wire." · Reveal F: "$n = 1$: $-r = +1$ (total reflection, no transmission term). $n = 2$: $r = 0$, $t = 1$ (perfect transmission). The rule interpolates between a wall and a wire."
- Cap G/F "a dead end and a straight line" · Stage `wg({star:{N:8}})` · Claims `q19Vertex1` 1, `q19Vertex2R` 0, `q19Vertex2T` 1.

### Unit `q19-star-search` — Finding the marked spoke
**b1 [B]** (the walk step as a circuit, pp. 131–132)
- G: "Start the walker on all 8 outgoing edges equally. One step does two things at once. Walkers heading out reach an outer vertex and turn back; the marked one flips sign. Walkers heading in meet the centre and scatter."
- F: "(7.49) $|\psi_{\rm init}\rangle = N^{-1/2}\sum_j|0,j\rangle$; $U|0,j\rangle = |j,0\rangle$ for $j \ge 2$, $U|0,1\rangle = -|1,0\rangle$, and $U_v$ at the centre. On four wires $U = X_{\rm dir}\,(|0\rangle\langle0|\otimes O + |1\rangle\langle1|\otimes D)$ with $O$ the sign flip of spoke 1 and $D = U_v$: a $16\times16$ matrix; built vertex by vertex and as a circuit the engine finds gap $0$."
- Cap G "the start (Hadamards on the three spoke wires) and four steps $W$" · F "$W = U$ on four wires; bars are chances of the 16 edge states" · Stage `split(circ(C_W,5) / amp(C_W,5,'probability'))` · Claims `q19WalkUnit8` 0, `q19WalkCircuitGap` 0.

**b2 [B]** (a 4-dimensional invariant subspace, 7.50–7.53) · Terms `qc-invariant-subspace`
- G: "By symmetry the walker only ever sits in four combined states. Two are the marked edge, leaving or arriving. Two are the seven other spokes, each as an equal mix. One step is a $4\times4$ table."
- F: "$|\psi_1\rangle = |0,1\rangle$, $|\psi_2\rangle = |1,0\rangle$, $|\psi_3\rangle$, $|\psi_4\rangle$ the uniform sums over $j \ge 2$ (7.50). Their span is an [[qc-invariant-subspace|invariant subspace]] of $U$ (7.51) with matrix $M$ (7.53), $M_{jk} = \langle\psi_j|U|\psi_k\rangle$, and $|\psi_{\rm init}\rangle = N^{-1/2}|\psi_1\rangle + \sqrt{(N-1)/N}\,|\psi_3\rangle$ (7.52). At $N = 8$: $r = 0.75$, $t\sqrt{N-1} = 0.6614$; engine gap to the full matrix $0$."
- Cap G/F "after one step: one tall bar and a flat seven; the four combined states stay closed" · Stage `amp(C_W,2,'probability')` · Claims `q19MGap` 0, `q19MR` 0.75, `q19MT` 0.6614.

**b3 [B]** (eigenvalues; D2)
- G: "Its special numbers solve $\lambda^4 - 2r\lambda^2 + 1 = 0$. The four roots are arrows on the unit circle at $\pm\alpha$ and $180° \pm \alpha$, where $\sin\alpha = 1/\sqrt N$. For $N = 8$, $\alpha = 20.7°$: Grover's angle."
- F: "(7.54) $\lambda^2 = e^{\pm i\theta}$ with $\cos\theta = r = 1 - 2/N$, so $\lambda = \pm e^{\pm i\alpha}$ with $\sin^2\alpha = 1/N$ exactly (Chapter Q17's $\alpha$). Bergou's large-$N$ expansion (7.55–7.58) gives $1 \pm i\Delta$, $\Delta = \sqrt{t/2} = 1/\sqrt N$: $20.26°$ against our exact $20.70°$ at $N = 8$."
- Cap G/F "four eigen-arrows at ±20.7° and 180° ± 20.7°" · Stage `cp({spokes:{phasesDeg:[α,−α,180−α,180+α]}})` (angles from the engine) · Claims `q19Alpha8` 20.705, `q19Delta8Deg` 20.257, `q19CharPoly8` 0 · Derivation D2.

**b4 [B]** (the chance after $n$ steps; the walk is Grover; D3)
- G: "The marked spoke's chance follows a sine and peaks near $n\Delta = \pi/2$, here $n = 4.4$. At $n = 4$ it is $0.9453$, as in two Grover steps. At $n = 2$ it is $0.781$."
- F: "(7.62–7.63): $U^n|\psi_{\rm init}\rangle$ has weight $\sin^2(n\Delta)$ on spoke 1, as $|0,1\rangle$ for $n$ even or $-|1,0\rangle$ for $n$ odd (amplitudes $\pm0.9723$ at $n = 4, 5$). Our calculation finds exactly $P_{\rm walk}(n) = \sin^2((2\lfloor n/2\rfloor + 1)\alpha)$, Chapter Q17's chance after $\lfloor n/2\rfloor$ steps (gap $< 10^{-14}$, $N = 4, 8, 16$, $n \le 30$)."
- Cap G/F "chance of the marked spoke against steps, N = 8: pairs of equal values, peak 0.945 at 4 and 5" · Stage `split(plot(PW8) / wg({star:{N:8,marked:1}},{walker:{step:4}}))` · Claims `q19StarP2` 0.781, `q19StarP4` 0.9453, `q19StarAmp4` 0.9723, `q19StarAmp5` −0.9723, `q19StarPeak8` 4, `q19Bergou8` 4.44, `q19WalkIsGrover` 0.

**b5 [C]** (a thousand spokes)
- Q G: "A star has 1024 spokes. About how many steps find the marked one? Classically you check about 512." · Q F: "Estimate $n$ from $n\Delta \approx \pi/2$ at $N = 1024$, then locate the first peak with the reduced walk; compare with $(N+1)/2$ classical checks."
- Reveal G: "About 50 steps: $(\pi/2) \times 32 = 50.3$. The chance is then $0.9995$. A classical search averages $512.5$ checks, so the walk gives a square-root speed-up." · Reveal F: "$n \approx (\pi/2)\sqrt N = 50.27$; the reduced $4\times4$ walk (equal to the full walk for $N \le 16$, engine) peaks first at $n = 50$ with $0.9995$, against $(N+1)/2 = 512.5$ checks (Bergou p. 135). At $N = 16$: first peak at $n = 6$, chance $0.9613$."
- Cap G/F "N = 16 for scale: first peak at 6 steps" · Stage `wg({star:{N:16,marked:1}},{walker:{step:6}})` · Claims `q19StarN1024` 50, `q19StarP1024` 0.9995, `q19Bergou1024` 50.27, `q19ClassAvg1024` 512.5, `q19StarPeak16` 6, `q19StarP16` 0.9613.

**b6 [D]** (Bergou p. 137 remark)
- G: "Start instead with the walker on all eight arriving edges. The search still works: the best chance is again $0.9453$. In Unit 19.4 this choice will matter."
- F: "A superposition of all ingoing states works as well as the outgoing start here (Bergou p. 137, remark before the extra-edge search); at $N = 8$ the engine finds the same maximum $0.9453$."
- Cap G/F "the arriving start: a different first picture, the same peak" · Stage `wg({star:{N:8,marked:1}},{walker:{step:4,start:'in'}})` · Claims `q19InStart8` 0.9453.

### Unit `q19-extra-edge` — Finding an extra edge
**b1 [B]** (a different hidden thing, pp. 135–136, 7.64–7.65)
- G: "Now no vertex is marked. Instead two outer vertices, 1 and 2, share an extra edge, and we must find it. Those two vertices pass the walker on. With 8 spokes there are 18 edge states."
- F: "Fig. 7.8: the star plus the edge $\{1,2\}$ with extra states $|1,2\rangle$, $|2,1\rangle$ ($2N + 2 = 18$ at $N = 8$). $U|0,1\rangle = |1,2\rangle$, $U|0,2\rangle = |2,1\rangle$, $U|1,2\rangle = |2,0\rangle$, $U|2,1\rangle = |1,0\rangle$ (7.64); other spokes reflect and the centre scatters as before. The engine's $U$ is orthogonal (gap $0$)."
- Cap G/F "the star with an extra edge between spokes 1 and 2: 18 edge states" · Stage `wg({star:{N:8,extra:[1,2]}},{walker:{step:0}})` · Claims `q19Extra8Dim` 18, `q19ExtraUnit` 0.

**b2 [B]** (a 5-dimensional subspace and its roots, 7.65–7.73)
- G: "Symmetry again keeps the walker in a small space, now five combined states. The start has a minus sign between leaving and arriving edges. Roots near $-1$ split by $\pm i\Delta$, with $\Delta = 2/\sqrt{3N}$."
- F: "$S = {\rm span}\{\psi_1 \ldots \psi_5\}$ (7.65), $U|_S = M$ (7.66, 7.68), $\lambda^5 - (r-t)\lambda^3 + (r-t)\lambda^2 - 1 = 0$ (7.69) with root $\lambda = 1$ and the quartic $\lambda^4 + \lambda^3 + 2t\lambda^2 + \lambda + 1 = 0$ (7.70). As $t \to 0$ the roots are $-1$ twice and $e^{\pm i\pi/3}$ (7.71); the double root splits as $-1 \pm i\Delta$, $\Delta = \sqrt{2t/3} = 2/\sqrt{3N}$ (7.72–7.73): $0.1443$ at $N = 64$. Engine gaps to $M$ and to (7.69): $0$."
- Cap G/F "zero-order roots: −1 and the two arrows at ±60° from it ($e^{\pm i\pi/3}$)" · Stage `cp({spokes:{phasesDeg:[60,180,300]}})` · Claims `q19M5Gap` 0, `q19ExtraPoly` 0, `q19ExtraDelta64` 0.1443.

**b3 [B]** (the walker at the peak: 2/3, 1/3; 7.74–7.79)
- G: "At $n\Delta \approx \pi/2$ the weight splits evenly over three combined states: two beside the extra edge and the extra edge itself. We read spokes only, so we find spoke 1 or 2 with chance $2/3$. For $N = 64$ the exact peak is $0.70$ at step 11."
- F: "(7.79): $U^n|\psi_{\rm init}\rangle = (-1)^n3^{-1/2}(\sin n\Delta, \sin n\Delta, \sqrt{3/2}\cos n\Delta, -\sqrt{3/2}\cos n\Delta, -\sin n\Delta)$; at $n\Delta = \pi/2$ the weights on $\psi_1, \psi_2, \psi_5$ are $1/3$ each, so a spoke reading finds $\{1,2\}$ with chance $2/3$. Engine, $N = 64$: $0.7002$ at $n = 11$ ($\pi/2\Delta = 10.88$), $0.2928$ on the extra edge; $N = 8$: $0.625$ at $n = 3$."
- Cap G/F "chance of spokes 1 and 2 against steps for N = 64, and the N = 8 picture at its peak (step 3)" · Stage `split(plot(PX64) / wg({star:{N:8,extra:[1,2]}},{walker:{step:3}}))` · Claims `q19ExtraAsym` 0.6667, `q19ExtraPeak64` 11, `q19ExtraNear64` 0.7002, `q19ExtraEdge64` 0.2928, `q19ExtraBergou64` 10.88, `q19Extra8Near` 0.625.

**b4 [B]** (the minus sign, p. 137)
- G: "Replace the minus sign by plus and the search fails. At $N = 64$ the walker is never on spokes 1 or 2 with more than $0.083$, against $0.70$. The relative sign decides whether the pieces add up."
- F: "With $+$ in (7.67) the book says the search fails; the engine at $N = 64$ ($n \le 40$): best chance on spokes 1, 2 is $0.0829$ and on the extra edge $0.0587$, against $0.7002$ with the minus sign."
- Cap G/F "the two starts, minus (dashed ceiling 0.70) and plus (flat near 0.08)" · Stage `plot(PX64 with vs, markers 11)` · Claims `q19ExtraPlus64` 0.0829, `q19ExtraPlusEdge64` 0.0587.

**b5 [C]** (a thousand spokes)
- Q G: "A star has 1024 spokes. How many steps to find the extra edge? A list of the graph has about 1024 entries to read." · Q F: "Estimate $n \approx \pi/(2\Delta)$ at $N = 1024$ and compare with the engine's first peak."
- Reveal G: "About 44 steps ($43.5$ from the formula), against reading about 1024 entries. Again a square-root speed-up." · Reveal F: "$\pi/(2\Delta) = (\pi/4)\sqrt{3N} = 43.53$; the engine's first peak is at $n = 44$; a classical adjacency-list search is $O(N)$ (Bergou p. 139)."
- Cap G/F "the N = 64 curve for scale; for N = 1024 the peak moves out to 44" · Stage `plot(PX64)` · Claims `q19ExtraPeak1024` 44, `q19ExtraBergou1024` 43.53.

**b6 [D]** (variations; P7.1 ⚑ cited only)
- G: "A loop on one spoke traps the walker in $O(\sqrt N)$ steps. A simple maze can be solved with a speed-up. Element distinctness uses a kind of walk. We cite these and do not work them."
- F: "Bergou's P7.1 (p. 142, ⚑, a loop on spoke 1, start (7.67)) and p. 139's maze and element-distinctness remarks are cited, not worked. The extra-edge search of this unit stays at $N = 8$, $18$ edge states."
- Cap G/F "the star with its extra edge, as a reminder of what is searched" · Stage `wg({star:{N:8,extra:[1,2]}},{walker:{step:0}})` · Claims none (unit numbers above).

### Unit `q19-simulation` — Imitating a spin chain with gates
**b1 [B]** (the $2^N$ wall, p. 140) · Terms `qc-quantum-simulation`, `qc-heisenberg-chain` · Bridge `qc-l11-schrodinger`
- G: "Take a chain of $N$ spins. A classical computer must store $2^N$ numbers. For $N = 50$ that is $1.1 \times 10^{15}$ numbers, about 18 petabytes at 16 bytes each. A quantum computer needs 50 qubits (<<qc-l11-schrodinger|Unit 11.4>>)."
- F: "[[qc-quantum-simulation|Quantum simulation]] (Bergou §7.7, p. 140): to apply $U(t) = e^{-itH}$ for the [[qc-heisenberg-chain|Heisenberg chain]] $H = -J\sum_{n=1}^{N-1}\mathbf S_n\cdot\mathbf S_{n+1}$ (7.80; $\hbar = 1$, $\mathbf S = \boldsymbol\sigma/2$) a classical computer holds $2^N$ amplitudes: $2^{50} = 1.126 \times 10^{15}$, 18.0 PB at 16 bytes each. $N$ qubits suffice, and $N - 1$ terms each touch two spins."
- Cap G/F "$2^n$ against the number of spins: 1.1 × 10^15 at 50" · Stage `plot(twoToN, x 1…50, yScale log, marker 50)` · Claims `q19Amps50` 1.126e15, `q19Bytes50` 18.0, `q19Terms50` 49.

**b2 [B]** (one bond is a two-qubit gate) · Bridges `qc-l11-generator`; Q4's SWAP in words
- G: "Each term acts on two neighbours. For two spins, $\mathbf S_1\cdot\mathbf S_2 = \tfrac12\,{\rm SWAP} - \tfrac14$. So its gate is part 'do nothing', $\cos(Jt/2)$, and part 'swap', $i\sin(Jt/2)$. At $Jt = \pi$ it is a pure swap."
- F: "$XX + YY + ZZ = 2\,{\rm SWAP} - I$, so $H_n = -J\mathbf S_n\cdot\mathbf S_{n+1} = -\tfrac J2{\rm SWAP} + \tfrac J4$ and $U_n(t) = e^{-iJt/4}[\cos(Jt/2)\,I + i\sin(Jt/2)\,{\rm SWAP}]$; at $Jt = \pi$ it is $e^{-i\pi/4}\,i\,{\rm SWAP}$, Chapter Q4's gate (<<qc-l11-generator|Unit 11.3>>: $H$ generates the turn). Engine: gap $0$ to a matrix exponential of $H_n$; $|10\rangle \to |01\rangle$ with chance $1$."
- Cap G/F "one bond at Jt = π: the flipped spin moves from wire 0 to wire 1" · Stage `split(circ(C_BOND,1) / amp(C_BOND,1,'probability'))` · Claims `q19SwapIdentity` 0, `q19BondClosed` 0, `q19BondSwapChance` 1.

**b3 [B]** (they do not commute; Trotter, 7.81–7.82; D4)
- G: "With three spins there are two bonds sharing the middle spin. They do not commute, so $e^{-it(H_1+H_2)}$ is not $e^{-itH_1}e^{-itH_2}$. Cut the time into $M$ pieces and alternate the bonds. The error shrinks as $M$ grows."
- F: "$[H_1,H_2] \neq 0$, operator norm $\sqrt3/4 = 0.4330$ ($J = 1$). [[qc-trotter-formula|Trotter's formula]] $e^{i(A+B)\Delta t} = e^{iA\Delta t}e^{iB\Delta t} + O((\Delta t)^2)$ (7.81; N&C Thm 4.3, p. 207) gives $U(t) = [U_1(t/M)U_2(t/M)]^M + O(t^2/M)$ (7.82). At $t = 2$ the error is $0.7327$ ($M = 1$), $0.0911$ ($M = 8$), under the bound $t^2\|[H_1,H_2]\|/2M = 0.1083$."
- Cap G/F "error against pieces M on log scales: a straight line of slope −1; beside it the circuit for M = 1" · Stage `split(plot(TE1) / circ(C_TR(1,1),2))` · Claims `q19Comm` 0.4330, `q19TrotErr1` 0.7327, `q19TrotErr8` 0.0911, `q19TrotBound8` 0.1083, `q19TrotRatio1` 2.000 · Derivation D4.

**b4 [B]** (the worked circuit: a flipped spin on three sites)
- G: "Flip the first of three spins: $|100\rangle$. The flip wanders along the chain. At $t = 2$ ($J = 1$) the exact chances for spin 1, 2, 3 are $0.390$, $0.442$, $0.168$. One piece gives $0.501$ on spin 3; eight give $0.203$."
- F: "Circuit: from $|100\rangle$, $M$ repeats of $U_1(t/M)$ on wires 0–1 then $U_2(t/M)$ on wires 1–2. Exact chances at $t = 2$: $(0.3896, 0.4422, 0.1681)$ (matrix exponential; a $3\times3$ hopping matrix agrees to $10^{-12}$). On spin 3 the circuit gives $0.5014$ ($M = 1$), $0.2394$ ($M = 4$), $0.2027$ ($M = 8$): the error halves as $M$ doubles."
- Cap G/F "the circuit for M = 4 and the chances of the eight strings (the flip on wire 0, 1 or 2)" · Stage `split(circ(C_TR(4,1),8) / amp(C_TR(4,1),8,'probability'))` · Claims `q19MagnonExact1` 0.3896, `q19MagnonExact2` 0.4422, `q19MagnonExact3` 0.1681, `q19MagnonTrotM1` 0.5014, `q19MagnonTrotM4` 0.2394, `q19MagnonTrotM8` 0.2027, `q19MagnonRoutes` 0.

**b5 [C]** (how many pieces?)
- Q G: "We want the operator error below $0.05$ at $t = 2$. How many pieces does the simple formula need?" · Q F: "Find the least $M$ with $\|U(t) - [U_1U_2]^M\| < 0.05$ at $t = 2$, $J = 1$; use the $1/M$ scaling to estimate first."
- Reveal G: "$M = 15$ gives $0.0486$; $M = 14$ misses with $0.0521$. One more digit of accuracy costs ten times as many pieces." · Reveal F: "$M = 15$ (errors $0.0521$ at 14, $0.0486$ at 15): first order scales as $1/M$, so a decimal digit costs ten times the gates."
- Cap G/F "the error line crosses 0.05 between 14 and 15 pieces" · Stage q `plot(TE1)`; reveal `plot(TE1, marker 15)` · Claims `q19TrotMFor05` 15, `q19TrotErr14` 0.0521, `q19TrotErr15` 0.0486.

**b6 [D]** (a symmetric split, N&C p. 208)
- G: "Put half of $U_1$ before and half after: $U_1(\Delta t/2)\,U_2(\Delta t)\,U_1(\Delta t/2)$. The error per piece is cubed, so the total falls as $1/M^2$. Three pieces already give $0.0246$."
- F: "$e^{i(A+B)\Delta t} = e^{iA\Delta t/2}e^{iB\Delta t}e^{iA\Delta t/2} + O((\Delta t)^3)$ (N&C Eq. 4.104): total error $\propto 1/M^2$, a ratio of $4.00$ per doubling; error $0.0138$ at $M = 4$, and $M = 3$ is the least giving $< 0.05$."
- Cap G/F "second-order line of slope −2 under the first-order line" · Stage `plot(TE, markers 3, 4)` · Claims `q19Trot2Ratio` 4.00, `q19Trot2Err4` 0.0138, `q19Trot2Err3` 0.0246, `q19Trot2MFor05` 3.

### Unit `q19-qaoa` — Quantum circuit, classical tuner
**b1 [B]** (MaxCut on a square, p. 141) · Terms `qc-maxcut`
- G: "Split the four corners of a square into two teams, 0 and 1. A side is 'cut' when its ends are on different teams. Of the 16 ways, two cut all four sides: 0101 and 1010. The average is only 2."
- F: "[[qc-maxcut|MaxCut]] on the 4-cycle with edges $E = \{01, 12, 23, 30\}$ (Bergou p. 141; there $N$ is the number of vertices, here $n = 4$): for $x \in \{0,1\}^4$, ${\rm cut}(x)$ counts edges with differing ends. Over the 16 strings: cut 0 twice, cut 2 twelve times, cut 4 twice (0101, 1010); mean $2$. The aim is a good cut, not the optimum."
- Cap G/F "the square with the cut 0101: every side cut" · Stage `wg({ring:{n:4}},{cut:'0101'})` · Claims `q19Assign4` 16, `q19MaxCut` 4, `q19CutCount4` 2, `q19CutMean` 2.

**b2 [B] · notation beat, `introduces: ['qc-cost-hamiltonian']`** (the cost and the phase step; D5)
- G: "Write each team as a qubit. The cost $H_C$ gives each string its cut number. Then $e^{-i\gamma H_C}$ turns each string's arrow by $\gamma$ times its cut number. Only phases change. Each side is one small two-qubit gate."
- F: "[[qc-cost-hamiltonian|$H_C = \sum_{jk\in E}\tfrac12(1 - \sigma^z_j\sigma^z_k)$]] (7.83) is diagonal, $H_C|x\rangle = {\rm cut}(x)|x\rangle$. $U_C(\gamma) = e^{-i\gamma H_C}$ multiplies $|x\rangle$ by $e^{-i\gamma\,{\rm cut}(x)}$ and splits into ${\rm diag}(1, e^{-i\gamma}, e^{-i\gamma}, 1)$ per edge. Engine: $H_C$ from $\sigma^z$ equals the cut table (gap $0$)."
- Cap G "after the Hadamards and the phase step: sixteen equal bars, different phase colours" · F "$U_C|\psi_{\rm in}\rangle$: equal sizes $1/4$, phase $-\gamma\,{\rm cut}(x)$" · Stage `split(circ(C_Q(0.7,0.3),3) / amp(C_Q(0.7,0.3),3,'amplitude'))` · Claims `q19HcGap` 0 · Derivation D5.

**b3 [B]** (the mixer, 7.84–7.86)
- G: "Start with all 16 strings equal, apply the phase step, then the mixer: turn every qubit by $2\beta$ about $x$. Phases alone change no chances; the mixer turns phase differences into chances. With $\gamma = 0$ or $\beta = 0$ the average cut stays 2."
- F: "$|\psi_{\rm in}\rangle = 4^{-1}\sum_x|x\rangle$ (7.84); $U_B(\beta) = e^{-i\beta H_B}$, $H_B = \sum_j\sigma^x_j$ (7.85), is $R_x(2\beta)$ on every wire; $|\gamma,\beta\rangle = U_BU_C|\psi_{\rm in}\rangle$ the [[qc-qaoa|QAOA]] state; $F(\gamma,\beta) = \langle\gamma,\beta|H_C|\gamma,\beta\rangle$ (7.86). Engine: $F = 2$ at $\gamma = 0$ or $\beta = 0$; the circuit equals the dense exponentials (gap $0$)."
- Cap G/F "the whole circuit and the sixteen chances after the mixer, γ = 0.7, β = 0.3" · Stage `split(circ(C_Q(0.7,0.3),4) / amp(C_Q(0.7,0.3),4,'probability'))` · Claims `q19F0Gamma` 2, `q19F0Beta` 2, `q19QaoaCircuitGap` 0.

**b4 [B]** (the landscape)
- G: "Scan $\gamma$ and $\beta$. On the square the average cut is $F = 2 + \sin4\beta\,\sin2\gamma$. Its best is $3$ at $\gamma = 45°$, $\beta = 22.5°$: three quarters of the best cut. The best cut itself appears with chance $0.531$, against $0.125$ for a guess."
- F: "Our calculation finds $F(\gamma,\beta) = 2 + \sin4\beta\sin2\gamma$ for this ring (checked at three points against the circuit); $F^* = 3$ at $(\pi/4, \pi/8)$, ratio $F^*/{\rm cut}_{\max} = 0.75$. There $P({\rm cut}\,4) = 17/32 = 0.531$ ($0.2656$ each for 0101, 1010), $P(2) = 0.4375$, $P(0) = 0.031$."
- Cap G/F "left: F against angle, γ-slice at β = 22.5° and β-slice at γ = 45°; right: the sixteen chances at the best angles" · Stage `split(plot(qaoaGammaSlice vs qaoaBetaSlice, x 0…180°, markers 22.5 and 45) / amp(C_Q(π/4,π/8),4,'probability'))` · Claims `q19FStar` 3, `q19GammaStar` 45, `q19BetaStar` 22.5, `q19QaoaRatio` 0.75, `q19QaoaPOpt` 0.531, `q19QaoaP0101` 0.2656, `q19QaoaP2` 0.4375, `q19RingFormulaGap` 0, `q19CutRandomP` 0.125.

**b5 [C]** (the classical loop, p. 142)
- Q G: "A classical computer picks $\gamma$ and $\beta$. Start at $\gamma = 0.3$, $\beta = 0.2$ (radians). Each round try four small moves and keep the best; if none helps, halve the step. How good does it get?" · Q F: "Pattern search from $(0.3, 0.2)$, step $0.2$, neighbours $\pm\gamma, \pm\beta$ (first best wins), stop below step $0.01$: number of accepted moves, evaluations of $F$, final $F$?"
- Reveal G: "7 moves and 49 evaluations raise the average cut from $2.405$ to $2.9998$, at $\gamma = 45.1°$, $\beta = 22.2°$. Each evaluation is many runs of the quantum circuit." · Reveal F: "$7$ accepted moves, $49$ evaluations: $F$ from $2.4050$ to $2.9998$ at $(0.7875, 0.3875)$ rad $= (45.1°, 22.2°)$. On hardware each $F$ is estimated from repeated runs and the optimiser is classical: the [[qc-hybrid-algorithm|hybrid]] loop (Bergou p. 142)."
- Cap G/F "the circuit at the start (0.3, 0.2) and at the end of the loop" · Stage q `circ(C_Q(0.3,0.2),4)`; reveal `circ(C_Q(0.7875,0.3875),4)` · Claims `q19LoopMoves` 7, `q19LoopEvals` 49, `q19LoopStart` 2.4050, `q19LoopEnd` 2.9998.

**b6 [D]** (what this does not promise, pp. 141–142)
- G: "One layer on a ring gets three quarters of the best cut. Whether such hybrids beat classical methods is open. They aim at noisy machines of about a hundred qubits. Here a good cut shows up in 4 runs, not 18."
- F: "Bergou calls the advantage 'a subject of active investigation' (p. 142) and places the method in the NISQ era of roughly 100 noisy qubits (p. 141). To see an optimal cut with confidence $0.9$ takes $\lceil\ln0.1/\ln(1-p)\rceil = 4$ runs at $p = 0.531$, against $18$ at $p = 1/8$. Other variational algorithms share the loop; the variational eigensolver is only named."
- Cap G/F "the square again, cut 0101, with the two best strings" · Stage `wg({ring:{n:4}},{cut:'0101'})` · Claims `q19Shots90` 4, `q19Shots90Random` 18.

### 1.7 Claim ledger (key — engine call — value; numpy in `planQ19-numpy.py`; every `…Gap` key is an engine max-abs difference, value 0)
- random-walk: `q19P2Left/Mid` `walkChance(2, x)` 0.25, 0.5 · `q19P10Zero` 0.2461 · `q19SigmaClass100` `walkSigmaClassical(100)` 10 · `q19ConnSteps10/Fail5` `connectSteps(10)`, `connectFail(5)` 2000, 0.03125 · `q19PathHit10` `pathHitting(10)` (linear solve) 81 · `q19CoinSigma10/100` `coinWalkSigma` 5.473, 54.12 (route B Fourier integral agrees to 5e-3 at n = 30) · `q19CoinRatio100` 0.5412 · `q19Coin3Binomial` gap vs $1/8,3/8,3/8,1/8$.
- scatter: `q19EdgeStates8` `starStates(8).length` 16 · `q19Vertex8R/T` `scatterRT(8)` 0.75, 0.25 · `q19VertexUnit8` $\|U_vU_v^T - I\|$ and (7.47) · `q19VertexIsInv8` $\|U_v - (2ss^T - I)\|$ · `q19Grover8Marked/Other` `runCircuit(groverCircuit(3,[0],1))` 0.8839, 0.1768 · `q19Vertex1` +1, `q19Vertex2R/T` 0, 1 (and $n = 3$: $-0.3333$, $0.6667$ in challenges).
- star-search: `q19WalkUnit8` $\|UU^T - I\|$ and `q19WalkCircuitGap` `circuitUnitary` vs `starWalkU(8)` · `q19MGap`, `q19MR`, `q19MT` `starReducedM(8)` (0, 0.75, 0.6614) · `q19Alpha8` 20.705° · `q19Delta8Deg` 20.257° · `q19CharPoly8` · `q19StarP2/P4` 0.781, 0.9453 · `q19StarAmp4/5` ±0.9723 · `q19StarPeak8` `starWalkFirstPeak(8)` = 2·`groverOptimalK` 4 · `q19Bergou8` $\pi/(2\sqrt{t/2})$ 4.443 · `q19WalkIsGrover` `max |starWalkMarked(N,n) − groverSuccess(N,1,⌊n/2⌋)|` over $N = 4, 8, 16$, $n \le 30$ · `q19StarN1024/P1024` 50, 0.9995 · `q19Bergou1024` 50.27 · `q19ClassAvg1024` 512.5 · `q19StarPeak16/P16` 6, 0.9613 · `q19InStart8` 0.9453.
- extra-edge: `q19Extra8Dim` 18 · `q19ExtraUnit`, `q19M5Gap`, `q19ExtraPoly` 0 · `q19ExtraDelta64` 0.1443 · `q19ExtraAsym` weights of (7.79) at $n\Delta = \pi/2$: 0.6667 (and 0.3333) · `q19ExtraPeak64` `extraWalkPeak(64)` (argmax over $n \le \lceil\pi/\Delta\rceil$) 11 · `q19ExtraNear64/Edge64` 0.7002, 0.2928 · `q19ExtraBergou64` 10.88 · `q19Extra8Near` 0.625 (n = 3) · `q19ExtraPlus64/PlusEdge64` 0.0829, 0.0587 · `q19ExtraPeak1024/Bergou1024` 44, 43.53.
- simulation: `q19Amps50` `2^50` 1.126e15 · `q19Bytes50` 18.0 · `q19Terms50` 49 · `q19SwapIdentity`, `q19BondClosed` 0 · `q19BondSwapChance` 1 · `q19Comm` `‖[H₁,H₂]‖` 0.4330 · `q19TrotErr1/Err8/Err14/Err15` `trotterError(3,1,2,M,1)` 0.7327, 0.0911, 0.0521, 0.0486 · `q19TrotBound8` 0.1083 · `q19TrotRatio1` 2.000 · `q19Trot2Err3/Err4/Ratio` 0.0246, 0.0138, 4.00 · `q19TrotMFor05`, `q19Trot2MFor05` 15, 3 · `q19MagnonExact1/2/3` 0.3896, 0.4422, 0.1681 · `q19MagnonTrotM1/M4/M8` 0.5014, 0.2394, 0.2027 · `q19MagnonRoutes` 0.
- qaoa: `q19Assign4` 16 · `q19MaxCut` 4 · `q19CutCount4` 2 · `q19CutMean` 2 · `q19HcGap` 0 · `q19F0Gamma/F0Beta` 2 · `q19QaoaCircuitGap` 0 · `q19RingFormulaGap` (3 test points) 0 · `q19FStar` 3 · `q19GammaStar/BetaStar` 45°, 22.5° · `q19QaoaRatio` 0.75 · `q19QaoaPOpt/P0101/P2` 0.531, 0.2656, 0.4375 · `q19CutRandomP` 0.125 · `q19LoopMoves/Evals/Start/End` `qaoaPatternSearch` 7, 49, 2.4050, 2.9998 · `q19Shots90/Random` `shotsFor` 4, 18.

## 2. Derivations (step `tex` — why — **view**; a step without a view keeps the last; Ground ≥ Formal; ≥ 2 views each)
**D1 · scatter:b3 · `r = \tfrac{n-2}{n},\ t = \tfrac2n`** — G (3): (1) $r^2 + (n-1)t^2 = 1$: arrival 1 keeps its total chance · **wg(star N8)** · (2) $-2rt + (n-2)t^2 = 0$, so $r = \tfrac{n-2}{2}t$: two arrivals must leave apart · **amp(C_V,1,'signed')** · (3) $\tfrac{n^2}{4}t^2 = 1$, so $t = \tfrac2n$ and $r = \tfrac{n-2}{n}$ · same. F (2): (1) 7.46 and 7.47 · **wg** · (2) result · **amp(C_V)**.
**D2 · star-search:b3 · `\lambda = \pm e^{\pm i\alpha},\ \sin^2\alpha = \tfrac1N`** — G (3): (1) $\mu = \lambda^2$ solves $\mu^2 - 2r\mu + 1 = 0$ · **cp(spokes ±41.4°)** · (2) $\mu = r \pm i\sqrt{1-r^2} = e^{\pm i\theta}$, $\cos\theta = r$ · (3) $\sin^2\tfrac\theta2 = \tfrac{1-r}{2} = \tfrac1N$, so $\tfrac\theta2 = \alpha$ · **cp(four arrows)**. F (2): (1) $\lambda^2 = e^{\pm i\theta}$ · **cp(±41.4°)** · (2) result · **cp(four arrows)**.
**D3 · star-search:b4 · `n \approx \tfrac\pi2\sqrt N`** — G (3): (1) marked weight $= \sin^2(n\Delta)$ (7.63) · **PW8** · (2) largest at $n\Delta = \tfrac\pi2$ · **wg(step 4)** · (3) $\Delta = 1/\sqrt N$, so $n = \tfrac\pi2\sqrt N$. F (2): (1) 7.62–7.63 · **PW8** · (2) result · **wg(step 4)**.
**D4 · simulation:b3 · `\bigl\|U(t) - (U_1U_2)^M\bigr\| \le \tfrac{t^2}{2M}\bigl\|[H_1,H_2]\bigr\|`** — G (4): (1) expand each exponential to second order · **circ(C_TR(1,1),2)** · (2) the product has $-\tfrac12A^2 - \tfrac12B^2 - AB$ at second order, the exact one $-\tfrac12(A+B)^2$ · **TE1** · (3) they differ by $\tfrac12[A,B]\Delta t^2$ · **circ** · (4) $M$ pieces add: $M\cdot\tfrac12(t/M)^2\|[A,B]\| = \tfrac{t^2}{2M}\|[A,B]\|$ · **TE1**. F (3): (1) expansion · **circ** · (2) difference $\tfrac12[A,B]\Delta t^2$ · **TE1** · (3) result.
**D5 · qaoa:b2 · `H_C|x\rangle = \sum_{jk\in E}[x_j \ne x_k]\,|x\rangle = {\rm cut}(x)\,|x\rangle`** — G (4): (1) bit 0 is $z = +1$, bit 1 is $z = -1$ · **wg(ring, cut 0000)** · (2) same ends: $z_jz_k = 1$, $\tfrac12(1-1) = 0$ · (3) different ends: $z_jz_k = -1$, $\tfrac12(1+1) = 1$ · **wg(ring, cut 0101)** · (4) sum over sides counts the cut ones · **amp(C_Q,3,'amplitude')**. F (3): (1) $\sigma^z|x\rangle = (-1)^x|x\rangle$ · **wg(ring, cut 0000)** · (2) each term is 0 or 1 · **wg(ring, cut 0011)** · (3) result · **amp(C_Q,3)**.
**viewCaptions** (Read-mode strip): D1 "the star: one arrival, seven exits" / "the centre's output: −0.75 and seven times 0.25" · D2 "the squares of the roots, ±41.4°" / "the four roots, ±20.7° and 180° ± 20.7°" · D3 "chance of the marked spoke against steps" / "the walker on the marked edge at step 4" · D4 "one piece of each bond" / "error against pieces" · D5 "no side cut: all teams equal" / "every side cut: 0101" / "the strings' phases after the step".

## 3. Try-it widgets (props read from `DepositStats.tsx`, `oracleBenchModel.ts`, `ComplexPlaneQc.tsx`, `BitTable.tsx`; the builder re-reads each readout wording in `Q19.tryits.test.tsx`)
| Unit | Spec | Try this |
|---|---|---|
| random-walk | `deposit-stats {state:'+z', axis:90}` | A fair coin ($P = 0.5$). Press +100 atoms: the table reads "expected 50.0 ± 5.0". Each atom is a step (up = right): the position is $2k - 100$, so its spread is $2 \times 5.0 = 10 = \sqrt{100}$. Press +10000: the note says ten times more atoms makes the fraction about three times tighter. |
| scatter | `oracle-bench {mode:'grover', n:3, marked:0}` | Press Prepare, then Mark (U_f): the headline says "U_f applied", the marked bar flips sign. Press Diffuse (D): "every bar reflected about the mean", whole steps done 1, chance 0.781. The marked outer vertex and the centre's mirror, as Bergou's walk uses them. |
| star-search | same, press Whole step (Q) twice | After two whole steps the chance reads 0.945, the line "α = 20.7°; best number of steps k* = 2, chance 0.945" matches the walk's chance after 4 steps (2 walk steps = 1 Grover step). |
| extra-edge | `complex-plane {mode:'roots', N:6, j:1}` | Six arrows 60° apart: "corners used: 6 of 6" and "sum = 0". The zero-order roots of Eq. 7.71 are the arrows at 60°, 180°, 300°. Step 3: "2 of 6, each 3 times": $\lambda^3$ takes only $\pm1$. |
| simulation | `bit-table {mode:'cost', n:50}` | Slide n to 50: the $2^n$ readout is about $1.1 \times 10^{15}$ while $n^2$ reads 2 500; the quantum register needs 50 wires. |
| qaoa | `bit-table {mode:'strings', a:'0101', b:'1010', combine:'xor'}` | The XOR row is 1111: the second string is the first moved one place round the ring, so each 1 is a cut side: cut 4. Flip to 0011 and 0110: XOR 0101, two ones, cut 2. |

## 4. Challenges (tol 0.005 unless stated; integers tol 0; full walkthroughs: no sheet assigns any of these)
- **random-walk** 1 warm-up numeric `q19-w-p4` $p(0;4)$ → **0.375**. 2 core numeric `q19-w-sigma` spread after 100 steps → **10** (int). 3 core numeric `q19-w-conn` $2N^3$ for $N = 6$ → **432** (int).
- **scatter** 1 warm-up numeric `q19-v-t` $t$ at a vertex with 5 edges → **0.4**. 2 core numeric `q19-v-r` amplitude of bouncing back, $n = 5$ → **−0.6**. 3 core choice `q19-v-two` "a vertex with two edges" → **passes straight through: $r = 0$, $t = 1$** ✓ (`q19Vertex2T`).
- **star-search** 1 warm-up numeric `q19-s-alpha` $\alpha$ for $N = 16$, degrees → **14.478**. 2 core numeric `q19-s-p4` chance of the marked spoke after 4 steps, $N = 8$ → **0.945**. 3 core numeric `q19-s-n64` first-peak step at $N = 64$ → **12** (int).
- **extra-edge** 1 warm-up numeric `q19-e-delta` $\Delta = 2/\sqrt{3N}$ at $N = 64$ → **0.144**. 2 core numeric `q19-e-near` the large-$N$ chance of finding spoke 1 or 2 → **0.667**. 3 core choice `q19-e-sign` "start with + instead of −" → **the walker never concentrates; the search fails** ✓ (`q19ExtraPlus64`).
- **simulation** 1 warm-up numeric `q19-m-amps` amplitudes for 20 spins → **1048576** (int). 2 core numeric `q19-m-swap` $Jt$ at which a bond is exactly a swap → **3.142**. 3 core choice `q19-m-ratio` "the symmetric split's error when $M$ doubles" → **divides by 4** ✓ (`q19Trot2Ratio`).
- **qaoa** 1 warm-up numeric `q19-q-cut` cut value of 0011 on the square → **2** (int). 2 core numeric `q19-q-pstar` chance of an optimal cut at the best angles → **0.531**. 3 stretch numeric `q19-q-shots` runs to see an optimal cut with confidence 0.9 → **4** (int).

## 5. Glossary (new in 709; checked against `ids.json`: no duplicate id or term; Spin Lab's `hamiltonian`, Q17's `qc-inversion-about-mean`, Q4's `qc-swap-gate` and Q3's `qc-commutator` are reused, not redefined)
| id | term | introduces | Ground | Formal | first | bridge |
|---|---|---|---|---|---|---|
| `qc-random-walk` | random walk | — | A walker that flips a coin and steps left or right each time. | Position after $n$ independent $\pm1$ steps; spread $\sqrt n$ (Bergou p. 130). | random-walk:b1 | `qc-f5-probability` |
| `qc-graph` | graph | — | Dots (vertices) joined by lines (edges). | A vertex set $V$ and a set $E$ of unordered vertex pairs, the edges. | random-walk:b3 | — |
| `qc-edge-state` | edge state $\lvert v_1, v_2\rangle$ | notation | The state of a walker on an edge, moving from one end to the other. | $\lvert v_1,v_2\rangle$: on edge $\{v_1,v_2\}$, moving from $v_1$ to $v_2$; the $2E$ of them are orthonormal. | scatter:b1 | — |
| `qc-scattering-walk` | scattering walk | — | A quantum walk whose walker lives on edges and bounces or passes at every vertex. | A walk on edge states advanced by $U = \prod_vU_v$, each $U_v$ a local unitary (Bergou p. 131). | scatter:b1 | — |
| `qc-star-graph` | star graph | — | A centre joined to $N$ outer dots by $N$ lines. | A centre vertex 0 joined to outer vertices $1\ldots N$ by $N$ edges (Fig. 7.7). | scatter:b1 | — |
| `qc-invariant-subspace` | invariant subspace | — | A set of states that the walk step never leaves. | A subspace $S$ with $US \subseteq S$: four-dimensional for the star search, five for the extra edge. | star-search:b2 | `qc-f4-unitary` |
| `qc-quantum-simulation` | quantum simulation | — | Using a quantum computer to imitate how another quantum system changes in time. | Implementing $U(t) = e^{-itH}$ for a many-body $H$ with a circuit of few-qubit gates (Bergou §7.7). | simulation:b1 | `qc-l11-schrodinger` |
| `qc-heisenberg-chain` | Heisenberg chain | — | A row of spins, each coupled to its neighbours by $-J\,\mathbf S\cdot\mathbf S$. | $H = -J\sum_n\mathbf S_n\cdot\mathbf S_{n+1}$ (7.80); $J > 0$ is ferromagnetic. | simulation:b1 | — |
| `qc-trotter-formula` | Trotter formula | — | Alternate short pieces of each term to imitate the whole evolution. | $e^{i(A+B)\Delta t} = e^{iA\Delta t}e^{iB\Delta t} + O(\Delta t^2)$ (7.81; N&C Thm 4.3); the symmetric split is $O(\Delta t^3)$. | simulation:b3 | — |
| `qc-maxcut` | MaxCut | — | Split a graph's dots into two teams so that as many lines as possible join different teams. | Choose $x \in \{0,1\}^V$ maximising the number of edges with $x_j \ne x_k$. | qaoa:b1 | — |
| `qc-cost-hamiltonian` | cost Hamiltonian $H_C$ | notation | A diagonal operator that gives each string its score. | $H_C = \sum_{jk\in E}\tfrac12(1 - \sigma^z_j\sigma^z_k)$, $H_C\lvert x\rangle = {\rm cut}(x)\lvert x\rangle$ (7.83). | qaoa:b2 | — |
| `qc-qaoa` | QAOA | — | A circuit with two knobs, $\gamma$ and $\beta$, tuned by a classical computer to give a good cut. | $\lvert\gamma,\beta\rangle = e^{-i\beta H_B}e^{-i\gamma H_C}\lvert\psi_{\rm in}\rangle$, tuned to maximise $\langle H_C\rangle$ (7.84–7.86). | qaoa:b3 | — |
| `qc-hybrid-algorithm` | hybrid algorithm | — | A method where a quantum computer runs a circuit and a classical one tunes it. | A quantum–classical loop: a classical optimiser sets the circuit's parameters from its readings (Bergou p. 141). | qaoa:b5 | — |

## 6. Review cards
- **random-walk** G: a coin-flip walker spreads like $\sqrt n$; a graph walk can test for a path. F: $p(x;n)$, $\sigma = \sqrt n$, $2N^3$ steps, error $2^{-m}$. Eq $p(x;n) = \binom{n}{(n+x)/2}2^{-n}$. Trap: "a quantum walker spreads like $\sqrt n$ too" (it is linear).
- **scatter** G: the walker lives on edges; at a vertex it bounces ($-r$) or passes ($t$); unitarity fixes both; the centre is Grover's mirror. F: Eqs. 7.45–7.48. Eq $r = (n-2)/n,\ t = 2/n$. Trap: equal amplitudes $1/n$ to every edge.
- **star-search** G: four combined states, eigen-angle $\alpha$, the marked spoke after about $\tfrac\pi2\sqrt N$ steps. F: 7.49–7.63. Eq $\lambda = \pm e^{\pm i\alpha}$, $\sin\alpha = 1/\sqrt N$. Trap: "a walk needs about $N$ steps".
- **extra-edge** G: five combined states; start with a minus sign; $2/3$ detect. F: 7.64–7.79. Eq $\Delta = (2t/3)^{1/2}$. Trap: the sign does not matter.
- **simulation** G: a bond is a two-qubit gate; unequal bonds do not commute; more pieces, smaller error. F: 7.80–7.82, N&C Eqs. 4.103–4.104. Eq $\|U - (U_1U_2)^M\| \le t^2\|[H_1,H_2]\|/2M$. Trap: "each bond gate is exact, so the product is exact".
- **qaoa** G: phases carry the scores, the mixer turns them into chances, a classical loop tunes two knobs. F: 7.83–7.86. Eq $F = 2 + \sin4\beta\sin2\gamma$ (ring). Trap: "one layer finds the best cut for sure".

## 7. Symbol-before-use
**7.1 Ground:** $x$, $p(x;n)$ random-walk:b1 · $N$, $u$, $v$, $m$ b3 · $|v_1,v_2\rangle$, $E$ scatter:b1 · $r$, $t$, $n$ (a vertex's edges) b2 · $U_v$ b2, $s$ (uniform) b4 · $W$, $U$ star-search:b1 · $\alpha$ b3 · $\Delta$ b4 · $J$, $H$, $\mathbf S$, SWAP simulation:b1–b2 · $M$, $\Delta t$ b3 · $H_C$, $\gamma$, $\beta$, $F$ qaoa:b2–b3. **FLAGS:** $N$ = spokes (§7.6) vs Bergou's vertices (§7.8; here $n = 4$ in qaoa:b1); $\Delta$ is Bergou's approximate rate, $\alpha$ our exact one; $\gamma$, $\beta$ are QAOA angles, not Grover's $\alpha$.
**7.2 Formal:** adds $\binom{n}{k}$, $\sigma$ random-walk:b1–b2 · $G = (V,E)$ b3 · $\psi_1\ldots\psi_5$, $M$ (the table), $S$ star-search:b2, extra-edge:b2 · $\theta$ star-search:b3 · $\lfloor\cdot\rfloor$ b4 · $\|\cdot\|$ (operator norm), $[A,B]$ simulation:b3 · $\sigma^z_j$, $R_x$, $|\psi_{\rm in}\rangle$ qaoa:b2–b3. Counts: 0 used before definition in either track (to confirm by the symbols test).

## 8. Errata (Correction boxes: none confirmed; all of §7.6–7.8 re-derived and re-run, equations on the page images PDF pp. 142–152)
- **Checked, no box (each re-verified by engine or numpy):** (7.46)–(7.48) unitarity and orthogonality, gap 0 · (7.51), (7.53) the 4-dim table, gap 0 · (7.54)–(7.58) characteristic equation and perturbative roots · (7.59)–(7.63) eigenvectors (correct to lowest order; residual $O(\Delta)$ as expected) and the state after $n$ steps; the parity statement ($|0,1\rangle$ even, $-|1,0\rangle$ odd) matches the engine's amplitudes $\pm0.9723$ · (7.64)–(7.68) the 5-dim table, gap 0 · (7.69)–(7.73) polynomial, factorisation, double-root splitting $\pm i\sqrt{2t/3}$ · (7.74)–(7.79) eigenvectors, decomposition and the state after $n$ steps; $2/3$ and $1/3$ hold at large $N$ · (7.81)–(7.82) first-order error; "$M(\Delta t)^2 = t\Delta t$" is an upper-bound estimate, consistent with our bound · (7.83)–(7.86) cost, mixer, expectation.
- **Refinements, not errors (shown as "our calculation finds …" inside beats, not Errata boxes):** the star walk's eigenphases are exactly $\pm\alpha$, $\pi \pm \alpha$ with $\sin\alpha = 1/\sqrt N$ (Bergou's $\Delta = 1/\sqrt N$ is the large-$N$ value); $P_{\rm walk}(n) = P_{\rm Grover}(\lfloor n/2\rfloor)$ exactly ("you might suspect it mimics Grover", p. 133).
- Map B-list has no Ch. 7 §7.6–7.8 item; Q18 owns B21–B23. If the independent review finds a slip I missed, a Correction needs an engine `check()` at a revealing point.

## 9. Engine gaps and stage contracts
**9.1 Engine** (new `physics/qc/walk.ts`, `trotter.ts`, `variational.ts`; numpy block "q19" in `make_qc_fixtures.py`, twins `pipeline/claims_qc709/q19.py`; tests beside each):
`walk.ts` — `walkChance(n,x)`, `walkSigmaClassical(n)`, `connectSteps(N)`, `connectFail(m)`, `pathHitting(N)`, `coinWalk(n)`/`coinWalkSigma(n)` · `scatterRT(n)`, `scatterVertex(n)` ·
`starStates(N,{extra?})`, `starWalkU(N,{marked}|{extra})` (vertex by vertex), `starWalkCircuit(N,marked,steps)` (4 wires for $N = 8$; `unitary` ops) · `starWalkState(N,spec,step,{start?,sign?})`, `starSpokeChances(...)` (what S1 draws),
`starWalkMarked(N,n)`, `starWalkFirstPeak(N)`, `starReducedM(N)`, `starReducedChance(N,n)` (equal to the full walk for $N \le 32$, cross-check), `starEigenAngles(N)` · `extraReducedM(N)`, `extraWalkChances(N,n,sign)` → {near, edge}, `extraWalkPeak(N)`.
`trotter.ts` — `heisenbergBond(Jt)` (closed form) and `heisenbergBondExpm(Jt)`, `chainH(N,J)`, `chainU`, `trotterU(N,J,t,M,order)`, `trotterError` (operator 2-norm via `svd`), `commutatorNorm`, `trotterBound`, `trotterMFor(order,eps)`, `trotterCircuit(M,order,t,J)`, `magnonChances`, `amplitudeCount(N)`.
`variational.ts` — `ringEdges(n)`, `cutValue`, `cutHistogram`, `maxCut`, `qaoaState`, `qaoaF`, `qaoaCircuit(n,edges,γ,β)` (two-qubit phase `unitary` ops), `qaoaRingClosed`, `qaoaPatternSearch(f,start,step,tol)` (neighbour order +γ, −γ, +β, −β; first best wins), `cutDistribution`, `shotsFor(p,conf)`.
Reused: `groverAngle`, `groverSuccess`, `groverOptimalK`, `groverCircuit`, `circuitUnitary`, `runCircuit`, `probs`, `expmHermitian`, `svd`, `eigh`, `kronM`, `P`, `Rx`, `SWAP2`.
Cross-checks: `circuitUnitary(starWalkCircuit)` = `starWalkU(8)`; `starReducedChance` = full walk; `qaoaCircuit` = dense exponentials; `qaoaF` = `qaoaRingClosed` at three points; `trotterU(…M=1,order=1)` = $U_2U_1$.
**9.2 Stage.** **S1 — new SVG kind `walk-graph`** (skill 10; the defining picture, serves star walk, extra edge and MaxCut): `{kind:'walk-graph', graph: {star:{N: 3–16, marked?: 1…N, extra?: [a,b]}} | {ring:{n: 3–8}}, walker?: {step: 0–40, start?: 'out'|'in', sign?: 1|-1}, cut?: string, show?: ('chances'|'labels')[], readouts?: ('step'|'marked'|'near'|'edge'|'cut')[] (≤ 3), shot?}`.
Rules: exactly one graph; `marked` and `extra` not together; `walker` needs a star with `marked` or `extra`; `start` only with `marked`, `sign` only with `extra` (default −1: Eq. 7.67; +1 shows the failing start); `cut` only with a ring, $n$ bits. Draws the centre 0 and outer vertices on a circle,
each spoke's width and shade ∝ the engine's chance on its two edge states (`starSpokeChances`), the marked vertex ringed, the extra edge a chord (width ∝ its two states); a ring: vertices filled by their bit, cut edges thick. Readouts: `step 4`, `marked spoke 94.5 %`, `spokes 1, 2: 62.5 %`, `extra edge 12.5 %`, `cut 4 of 4`.
Passport "WALK GRAPH · edge chances"; shot `WG-STAR` / `WG-RING`; anchors `vertex spoke extra cut`; print 320 × 300; interp: a change of step cross-fades the widths, a change of graph switches at the half-way point. Fidelity `qc-walk-graph-chances` (exact), `qc-walk-graph-layout` (schematic), `qc-walk-graph-width` (misleading if read as where a classical particle sits).
**S2 — nine additive `plot` curves** (names in `PlotCurveName`; one registry row each, scene unchanged; values from the engine): `randomWalkSigma` ($\sqrt n$, x 0–100), `coinWalkSigma` (x 0–100), `starWalkMarked8` (x 0–14, **whole x only**: `samples` = 15), `extraWalk64` and `extraWalk64Plus` (chance on spokes 1, 2, $N = 64$, x 0–40, whole x), `trotterErr1`, `trotterErr2` (x 1–32, log both axes, whole x), `qaoaGammaSlice` ($F(\gamma, \beta{=}22.5°)$, x in degrees 0–180), `qaoaBetaSlice` ($F(\gamma{=}45°,\beta)$, same x). Existing curves reused: `nSquared`, `twoToN`.
**S3 (no field):** first uses needing a screenshot check: `unitary` boxes on 4 wires ($W$), two-qubit boxes on non-adjacent wires ($U_{30}$), 14-box circuits; the 16-bar probability view with a direction bit.
**Fallbacks:** S1 declined → `amplitudes` of the 16 (or 18-state) edge states from `C_W` with captions naming spokes, and `bits` rows for the ring (XOR of 0101 and 1010 = 1111); S2 declined → one table in the caption per curve (numbers still engine-made) and `plot(nSquared, twoToN)` for the wall.
**9.3 Widgets:** none required; every Try-it is true on today's code. Optional W18 `walk-bench` (N slider, step buttons, S1 picture) deferred.

## 10. Media (deferred, per BUILD-LOG)
Film: `qc-q19-walker` "A walker finds the marked spoke" ($N = 8$, steps 0–5; manifest keys `q19StarP2`, `q19StarP4`, `q19StarAmp4`, `q19StarAmp5`, `q19Alpha8`) and `qc-q19-trotter` "Error halves as the pieces double" (keys `q19TrotErr1`, `q19TrotErr8`, `q19Trot2Err4`). Blender: none (Part VII's opener sits before Unit 17.2). Decor: a lantern wandering a lattice of fog (atmosphere only).

## 11. Hooks
**11.1 Concept stations** (`concepts.ts` rows; ids checked by `concepts.test.ts`; `sameAs` for 448's $e^{-iHt}$ concept if one exists): `qc-random-walk-station` (random-walk; needs `qc-f5-probability`) · `qc-scattering-station` (scatter; needs `qc-random-walk-station`, `qc-f4-unitary`) · `qc-walk-search-station` (star-search; needs `qc-scattering-station`, `qc-grover-iterate`) · `qc-extra-edge-station` (extra-edge; needs `qc-walk-search-station`) · `qc-simulation-station` (simulation; needs `qc-f4-unitary`, `qc-circuits`) · `qc-qaoa-station` (qaoa; needs `qc-simulation-station`, `qc-one-qubit-gates`).
**11.2 Arcade (Spot the error; `Q19x` labels):** `qc-walk-spread` ("a quantum walker's spread is $\sqrt n$"; why `q19CoinSigma100`) · `qc-vertex-equal` ("a vertex sends amplitude $1/n$ to each edge"; why `q19Vertex8R`) · `qc-walk-slow` ("the star walk needs about $N$ steps"; why `q19StarN1024`) · `qc-extra-plus` ("start with plus: the search still works"; why `q19ExtraPlus64`) · `qc-trotter-exact` ("the bond gates multiply to exactly $e^{-iHt}$"; why `q19TrotErr1`) · `qc-qaoa-sure` ("one layer always finds the best cut"; why `q19QaoaPOpt`).
**11.3 Bridges.** Out: `qc-f5-probability` (random-walk:b1), `qc-f4-unitary` (scatter:b3, star-search:b2 gloss), NEW rows `qc-l11-schrodinger` → 448 `l11-schrodinger` (simulation:b1) and `qc-l11-generator` → `l11-generator` (simulation:b2), labels as 448's titles. Chapters Q3, Q4, Q16, Q17 named in words. In (wiring pass after merge): none planned; Q17's closing beat may name "Chapter Q19".

## Rulings requested
- R1 Follow Bergou's **scattering walk** (edge states, star graph), not a coin-and-shift walk; the Hadamard coin walk on a line is a single `'deeper'` beat flagged "beyond the book" (random-walk:b5). **Recommend keep** (it answers the ballistic-versus-diffusive question); cutting it removes 2 of the 9 S2 curves.
- R2 Six units, 34 beats; the extra-edge search is its own unit (Bergou gives it four pages). Approve.
- R3 Approve S1 `walk-graph` (one new SVG kind, built inside the Q19 build) with the fallbacks above. **Recommend approve**: it is the defining picture and carries the MaxCut square.
- R4 Approve S2 (nine curves). Smallest cut: drop `extraWalk64Plus` (use caption numbers), `qaoaBetaSlice` (keep one slice) and the coin-walk pair: leaves 5.
- R5 Running examples: star $N = 8$ (Fig. 7.7, 4 wires, 16 edge states); extra edge $N = 8$ for the picture, $N = 64$ and $1024$ for numbers; 3-spin Heisenberg chain, $J = 1$, $t = 2$; the 4-cycle for QAOA. Approve.
- R6 No Correction boxes: nothing in §7.6–7.8 is wrong; the exact-angle and walk = Grover results are "our calculation finds" refinements. Approve (the independent review re-verifies).
- R7 VQE omitted (in neither book); named in one sentence at qaoa:b6. **Recommend omit.**
- R8 N&C used only for Trotter (Thm 4.3, Eqs. 4.103–4.104); P7.1 cited in extra-edge:b6, P7.2 and P7.3 left to Q18 and Q16. Approve.
- R9 New bridge rows `qc-l11-generator`, `qc-l11-schrodinger`. Approve.
- R10 Keep $N$ = spokes throughout (Rosetta twice) and $\hbar = 1$, $\mathbf S = \boldsymbol\sigma/2$.

**Cost estimate (builder steps):** engine + numpy twin + tests ≈ 40 · S1 `walk-graph` (skill 10) ≈ 30 and S2 curves ≈ 10 (one agent, merges first) · content (6 units × story, values, review, glossary, challenges, tests) ≈ 60 · lints, e2e lists, visual QA, fixes ≈ 20: **about 160 steps in two agents**; dropping the coin walk and the plot extras saves about 15.
