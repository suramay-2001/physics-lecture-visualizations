# P-Q17-story — Q17 "Searching an unsorted list: Grover" (role P, Physics 709)

Proposal only; nothing under `app/` is touched. Format: `P-Q14-story.md`'s 13 sections, one line per field. Standing
gates: ≥ 2 distinct derivation views per track (W-709 #7); one notation beat per new notation or space (W-709 #8). Map
row: `P-709-map.md` §8 (drafted as "Q15"; `outline.ts` now numbers it Q17, Part VII). **Phase `'books'`:** ramp `[B]`,
clues `[C]`; within a unit every `[B]` precedes the `[C]`.

**Sources read** (paraphrased). Bergou §7.3 (printed = PDF − 10): pp. 120–121 the search problem, Fig. 7.2, Eqs.
7.13–7.15; pp. 121–123 the plane, Eq. 7.16, Theorem 1 and Figs. 7.3–7.5, Eqs. 7.17–7.18 and $\bar n$; pp. 124–125 optimality,
Eqs. 7.19–7.29. Page renders checked: pp. 121, 122, 123, 124. N&C (printed = PDF − 28): §6.1 pp. 248–254 (the oracle,
Eqs. 6.8–6.17, Fig. 6.3, $R = \mathrm{CI}(\cdot)$ rounding halves down); §6.6 pp. 269–271 (optimality). No end-of-chapter
problem of Ch. 7 concerns Grover.

**Ownership.** Q5 owns the phase oracle; Q16 owns $H^{\otimes n}$'s signs and the Walsh sum (reused for $|w_0\rangle$). F3
owns "a map is a table" (`qc-f3-matrix-of-map`); 448 L7 owns "sphere angles are twice state angles" (`qc-l7-two-angles`,
used *as a contrast*). Phase estimation of $Q$ (Bergou §7.5, Eq. 7.44) is Q18's. **Q17 owns:** the search problem and
marking oracle, $U_0, U_H, |w_0\rangle, Q$, the invariant real plane, two reflections = one rotation, the iterate and $k^*$,
inversion about the mean, overshoot, $M$ marked items (Formal), and the BBBV bound.

**Evidence.** `plan709q-q17.py` (scratchpad): route A the full $2^n$ state vector, column by column (Bergou's
$Q = -U_HU_0U_HU_f$ and the circuit form agree on every state), brute-force $D_k$ sums; route B the plane closed forms
$\sin^2((2k+1)\alpha)$. 66 checks (28 circuit-vs-plane over $N = 4$–32, $k = 0$–6), **0 mismatches**.

**Conventions.** $N = 2^n$, running $N = 8$ ($n = 3$), $x_0 = 101$. $\alpha = \arcsin\sqrt{M/N}$ (Bergou's $\alpha$; N&C write
$\theta/2$ and call the two plane axes $|\alpha\rangle, |\beta\rangle$: one Rosetta line at plane:b1). Plane axes: $|x_0^\perp\rangle$
horizontal, $|x_0\rangle$ vertical. $D = 2|w_0\rangle\langle w_0| - I = -U_{w_0}$. Cross-references "Unit 17.2", "Chapter Q16".
Claim keys `q17…`; twins `pipeline/claims_qc709/q17.py`.

**Stage shorthand.** `circ(C,k)`, `amp(C,k,m)` as in Q16 · `gp(k, f)` = `{kind:'grover-plane', search:{n:3}, k, ...f}`
(**new kind, §9.2**; `gp10(k,f)` uses `{n:10}`) · `mx(src)` = `{kind:'matrix', source:src, labels:'none', values:'decimal'}`
· `R0` = `{pauli:'Z'}` (mirror $|x_0^\perp\rangle$) · `RW` = `{lin:[{c:{trig:'cos', angleDeg:TWO_A}, src:{pauli:'Z'}}, {c:{trig:'sin',
angleDeg:TWO_A}, src:{pauli:'X'}}]}` (mirror $|w_0\rangle$; `TWO_A` = $2\alpha$ in degrees, computed in code from `groverAngle`) ·
`split(a / b)`. Matrix rows/columns are $(|x_0^\perp\rangle, |x_0\rangle)$, stated in every caption.

**Circuits.** `C_G(k)` 3 wires, init `000`: [H×3], then $k$ × ([oracle phase, `T_MARK` = 1 only at 101, label $U_f$], [H×3],
[oracle phase, `T_NZ` = 1 except at 000, label $-U_0$], [H×3]); $1 + 4k$ columns (≤ 24, so $k \le 5$). After iteration $j$ the
cursor is $1 + 4j$; right after its oracle, $2 + 4(j-1)$. `C_D(k)`: the same without the $U_f$ columns ($1 + 3k$). `C_G4` 2 wires,
marked 11, one iteration (5 columns). `C_G16M4` 4 wires, marked {0001, 0110, 1011, 1100}, one iteration.

## 0. Chapter map
**Driving question:** "How can you find the one marked item among N without checking them one by one?"

| # | id | Title (≤ 8 words) | Question | Sources | Link-backs |
|---|---|---|---|---|---|
| 1 | `q17-oracle` | A black box that marks one item | How does a quantum computer ask "is this it?" | Bergou pp. 120–121 (7.13–7.14, Fig. 7.2); N&C pp. 248–249 | Q5 `qc-phase-oracle`, Q16 |
| 2 | `q17-plane` | The whole search in one flat plane | Why can N dimensions be drawn on a page? | Bergou pp. 121–123 (7.15, 7.17) | `qc-l7-two-angles` (contrast) |
| 3 | `q17-two-reflections` | Two mirrors make a turn | What does one Grover step do? | Bergou pp. 121–123 (7.16, Theorem 1, Figs. 7.3–7.5); N&C p. 252 | `qc-f3-matrix-of-map` |
| 4 | `q17-iterate` | Turn until you reach the target | How many steps, and what if you overshoot? | Bergou p. 123 (7.18, $\bar n$); N&C pp. 252–254 (6.12–6.17) | — |
| 5 | `q17-optimal` | No algorithm can do better | Could a cleverer algorithm beat $\sqrt N$? | Bergou pp. 124–125 (7.19–7.29); N&C pp. 269–271 | — |

**Outcomes:** write the oracle as $I - 2|x_0\rangle\langle x_0|$ and one Grover step as a circuit · show the state stays in a
real plane and find $\sin\alpha = 1/\sqrt N$ · prove two reflections make a rotation by twice their angle · predict the chance
$\sin^2((2k+1)\alpha)$, pick $k^*$ and recognise overshoot · state why no algorithm needs fewer than order $\sqrt N$ queries.
**Prerequisites:** `qc-deutsch-jozsa`, `qc-hadamard-signs` (Q16), `qc-oracle-kickback`, `qc-registers`, `qc-f4-unitary`.
**Openers:** Part VII's Blender opener (map §8: the arrow stepping by $2\alpha$ beside $N$ bars, from `groverPlane` JSON)
before Unit 17.2 (Q16 R6); deferred.

## 1. Story beats per unit
Kinds: oracle circuit, amplitudes · plane amplitudes, grover-plane · two-reflections grover-plane, matrix · iterate
grover-plane, amplitudes, circuit · optimal circuit, amplitudes, grover-plane.

### Unit `q17-oracle` — A black box that marks one item
**b1 [B]** (the search) · Terms `qc-search-problem`, `qc-oracle` (Q5)
- G: "A black box, the oracle, answers 1 for one secret string $x_0$ and 0 for every other. This is the search problem. Checking strings one at a time takes about half the list on average. Grover needs about $\sqrt N$ questions."
- F: "Find the unique $x_0$ with $f(x_0) = 1$ among $N = 2^n$ strings (Eq. 7.13, Fig. 7.2). Classically $O(N)$ queries are needed; Grover's algorithm uses $O(\sqrt N)$ (Bergou p. 121, after Jozsa)."
- Cap: G/F "eight items on three wires, before any step" · Stage `circ(C_G(1),0)`.

**b2 [B]** (marking with a sign) · Terms `qc-phase-oracle` (Q5), `qc-marked-item`
- G: "The box does not shout the answer. It flips the sign of the marked string only. After an even mix of all eight, $101$ alone points down."
- F: "$U_f|x\rangle = (-1)^{f(x)}|x\rangle = (I - 2|x_0\rangle\langle x_0|)|x\rangle$ (Eq. 7.14): Chapter Q5's phase oracle with one marked row. On the uniform state: seven bars $0.3536$, one $-0.3536$, mean $0.2652$."
- Cap: G/F "after the oracle: one bar flipped; the mean line drops to $0.2652$" · Stage `split(circ(C_G(1),2) / amp(C_G(1),2,'signed'))` · Claims `q17Bar` (0.3536), `q17MeanAfterOracle` (0.2652).

**b3 [B] · notation beat, `introduces: ['qc-grover-iterate']`** (the Grover step) · Terms `qc-grover-iterate`
- G: "Name the parts. $|w_0\rangle$ is the even mix, $U_H$ puts an H on every wire, $U_0$ flips the sign of $000$. One Grover step $Q$ is: mark, Hadamards, flip all but $000$, Hadamards."
- F: "$U_0 = I - 2|0\rangle\langle0|$, $U_H = H^{\otimes n}$, $|w_0\rangle = U_H|0\rangle$, and $Q = -U_HU_0U_HU_f$ (Bergou p. 121). The circuit's third column flips every string but $000$: that is $-U_0$, carrying $Q$'s minus sign."
- Cap: G/F "one Grover step: $U_f$, H's, $-U_0$, H's" · Stage `circ(C_G(1),5)` · Claims `q17QIsCircuit` (max |circuitUnitary − Q| = 0).

**b4 [C]** (does marking help yet?)
- Q G: "Read the register right after the first mark. Is $x_0$ more likely than a blind guess?" · Q F: "What is $P(x_0)$ after $U_f$ alone acts on $|w_0\rangle$?"
- Reveal G: "No: still $0.125$ for every string. A sign changes no chance. The rest of the step must turn signs into chances." · Reveal F: "$|\langle x|U_f|w_0\rangle|^2 = 1/N = 0.125$ for all $x$: a phase oracle is invisible to one reading; the second half of $Q$ converts the sign into amplitude."
- Cap: G/F "every chance still $0.125$" · Stage q `amp(C_G(1),1,'probability')`; reveal `split(circ(C_G(1),2) / amp(C_G(1),2,'probability'))` · Claims `q17Blind` (0.125).

### Unit `q17-plane` — The whole search in one flat plane
**b1 [B] · notation beat, `introduces: ['qc-grover-plane']`** (the axes; D2) · Terms `qc-grover-plane`
- G: "Draw the [[qc-grover-plane|Grover plane]]: $|x_0\rangle$ up, and $|x_0^\perp\rangle$, the even mix of the seven others, across. The start $|w_0\rangle$ sits at angle $\alpha$ above the horizontal. Here $\sin\alpha = 0.3536$, so $\alpha = 20.70°$."
- F: "Basis $|x_0\rangle$, $|x_0^\perp\rangle = (|w_0\rangle - \langle x_0|w_0\rangle|x_0\rangle)/\sqrt{1 - 1/N}$; then $|w_0\rangle = \sin\alpha|x_0\rangle + \cos\alpha|x_0^\perp\rangle$ (Eq. 7.17), $\sin\alpha = 1/\sqrt N$, $\cos\alpha = 0.9354$. N&C write $\theta/2$ for $\alpha$."
- Cap: G/F "the plane: $|w_0\rangle$ at $\alpha = 20.70°$; its vertical shadow squared is $0.125$" · Stage `gp(0,{arcs:['alpha'], readouts:['angle','success']})` · Claims `q17SinA` (0.3536), `q17AlphaDeg` (20.70), `q17CosA` (0.9354) · Derivation D2.

**b2 [B]** (the plane is closed; D1)
- G: "The mark turns $|w_0\rangle$ into $|w_0\rangle$ minus $0.7071$ of $|x_0\rangle$. The rest of the step mixes only these two again. The state never leaves the Grover plane."
- F: "$U_f|w_0\rangle = |w_0\rangle - \tfrac{2}{\sqrt N}|x_0\rangle$, and with $U_{w_0} = U_HU_0U_H = I - 2|w_0\rangle\langle w_0|$, $-U_{w_0}|x_0\rangle = \tfrac2{\sqrt N}|w_0\rangle - |x_0\rangle$, so $Q$ maps $S = \mathrm{span}\{|w_0\rangle, |x_0\rangle\}$ into itself, real to real (Eq. 7.15, corrected: errata box)."
- Cap: G/F "the marked step as eight bars and as one arrow reflected below the axis" · Stage `split(gp(0,{half:'oracle'}) / amp(C_G(1),2,'signed'))` · Claims `q17TwoOverRootN` (0.7071), `q17PlaneClosed` (off-plane residual 0) · Derivation D1.

**b3 [B]** (not the Bloch sphere) · Bridge `qc-l7-two-angles`
- G: "This is not the Bloch sphere. On the sphere, angles are doubled (<<qc-l7-two-angles|Spin Lab 7.3>>). Here a right angle means two states that never share an answer."
- F: "The plane is a real 2-D slice of $\mathbb{C}^N$, not $S^2$: angles are state angles, so $|x_0^\perp\rangle \perp |x_0\rangle$ sit $90°$ apart (on the sphere orthogonal states sit $180°$ apart; <<qc-l7-two-angles|Spin Lab 7.3>>)."
- Cap: G/F "the same start state: one arrow, or eight equal bars" · Stage `split(gp(0) / amp(C_G(1),1,'signed'))`.

**b4 [C]** (why flat?)
- Q G: "The register has eight dimensions. Why does one flat picture hold the whole search?" · Q F: "Why does a two-dimensional real picture capture $Q^k|w_0\rangle$ exactly?"
- Reveal G: "Both halves of a step only mix $|w_0\rangle$ and $|x_0\rangle$, with real numbers. The seven unmarked strings always share one amplitude, so they act as one direction." · Reveal F: "$U_f$ and $U_{w_0}$ preserve $S$ and real coefficients (Eq. 7.15); the unmarked amplitudes stay equal at every step (engine check), so the state is always in $S'$."
- Cap: G/F "two full steps: seven equal bars and one tall one; the arrow at $103.5°$" · Stage q `amp(C_G(2),9,'signed')`; reveal `split(gp(2) / amp(C_G(2),9,'signed'))` · Claims `q17UnmarkedEqual` (spread 0), `q17Angle2` (103.52).

### Unit `q17-two-reflections` — Two mirrors make a turn
**b1 [B]** (the mark is a mirror) · Terms `qc-reflection`
- G: "In the plane, the mark keeps the horizontal part and flips the vertical part. That is a mirror along the horizontal axis. Its table is $1, 0; 0, -1$."
- F: "Restricted to $S'$, $U_f = |x_0^\perp\rangle\langle x_0^\perp| - |x_0\rangle\langle x_0|$: the reflection about the line through $|x_0^\perp\rangle$ (Bergou p. 121), $\mathrm{diag}(1, -1)$ in the basis $(|x_0^\perp\rangle, |x_0\rangle)$."
- Cap: G/F "the arrow mirrored in the horizontal line; the mirror's table (rows $|x_0^\perp\rangle, |x_0\rangle$)" · Stage `split(gp(0,{half:'oracle', mirrors:['x0perp']}) / mx(R0))` · Claims `q17R0` (entries 1, 0, 0, −1 from the resolver).

**b2 [B]** (the second mirror)
- G: "The other half of the step is a mirror too, through $|w_0\rangle$'s own line. Its table is $0.75, 0.6614; 0.6614, -0.75$ for $N = 8$."
- F: "On $S'$, $D = -U_{w_0} = I - 2|w_0^\perp\rangle\langle w_0^\perp|$, the reflection about the line through $|w_0\rangle$ (Bergou prints '$-U_f$' here: errata box), so $Q = (\text{reflect in } w_0)(\text{reflect in } x_0^\perp)$ (Eq. 7.16)."
- Cap: G/F "both mirrors drawn; the second one's table, entries $\cos2\alpha, \sin2\alpha$" · Stage `split(gp(1,{mirrors:['x0perp','w0']}) / mx(RW))` · Claims `q17Cos2a` (0.75), `q17Sin2a` (0.6614).

**b3 [B]** (Theorem 1; D3) · Terms `qc-two-reflections`
- G: "Two mirrors that meet at angle $\alpha$ together turn everything by $2\alpha$. A vector on the first mirror stays, then swings $2\alpha$ across the second. One Grover step turns $41.41°$."
- F: "Theorem 1 (Bergou p. 122): reflections in lines $M_1$ then $M_2$ at angle $\alpha$ compose to a rotation by $2\alpha$ (Figs. 7.4–7.5). In matrices $R_{w_0}R_{x_0^\perp}$ is the rotation by $2\alpha = 41.41°$ for $N = 8$."
- Cap: G/F "a vector on the first mirror: kept, then swung $2\alpha$; the product table is a turn" · Stage `split(gp(0,{proof:'v1'}) / mx({product:[RW, R0]}))` · Claims `q17TwoAlphaDeg` (41.41), `q17ProductIsRot` (max gap 0) · Derivation D3.

**b4 [C]** (order matters)
- Q G: "Use the mirrors the other way round: $|w_0\rangle$'s line first, then the horizontal. Which way does the arrow turn?" · Q F: "What is $R_{x_0^\perp}R_{w_0}$?"
- Reveal G: "The other way, by $41.41°$ clockwise. Mirrors do not commute. Grover's order turns the arrow toward $|x_0\rangle$." · Reveal F: "$R_{x_0^\perp}R_{w_0}$ is the rotation by $-2\alpha$: the inverse of $Q$ on $S'$. Reflections do not commute; the order in Eq. 7.16 is what climbs toward $|x_0\rangle$."
- Cap: G/F "the reversed product: a turn the other way" · Stage q `mx({product:[RW, R0]})`; reveal `mx({product:[R0, RW]})` · Claims `q17ReverseTurn` (gap to $R(-2\alpha)$ = 0).

### Unit `q17-iterate` — Turn until you reach the target
**b1 [B]** (k steps; D4)
- G: "Each step adds $41.41°$. After $k$ steps the arrow sits at $(2k+1)\alpha$. The chance of $x_0$ is its vertical shadow squared: $0.7813$ after one step, $0.9453$ after two."
- F: "$Q^k|w_0\rangle = \sin((2k+1)\alpha)|x_0\rangle + \cos((2k+1)\alpha)|x_0^\perp\rangle$ (Eq. 7.18), so $P_k = \sin^2((2k+1)\alpha)$: $0.7813$, $0.9453$ for $k = 1, 2$, $N = 8$."
- Cap: G/F "two steps: the arrow at $103.5°$, chance $0.9453$; the bars agree" · Stage `split(gp(2,{trail:true, readouts:['angle','success']}) / amp(C_G(2),9,'probability'))` · Claims `q17P1` (0.7813), `q17P2` (0.9453), `q17Angle2` (103.52) · Derivation D4.

**b2 [B]** (inversion about the mean) · Terms `qc-inversion-about-mean`
- G: "In bars, the second half of a step reflects every bar about the average. After the mark the average is $0.2652$. The seven bars drop to $0.1768$; the marked one jumps to $0.8839$."
- F: "$D = 2|w_0\rangle\langle w_0| - I$ sends each amplitude $a_x$ to $2\bar a - a_x$ (inversion about the mean): from $0.3536$ to $0.1768$, and from $-0.3536$ to $0.8839 = \sin3\alpha$."
- Cap: G/F "one full step: seven bars at $0.1768$, the marked bar at $0.8839$" · Stage `split(circ(C_G(1),5) / amp(C_G(1),5,'signed'))` · Claims `q17InvUnmarked` (0.1768), `q17InvMarked` (0.8839), `q17MeanAfterOracle` (reused).

**b3 [B]** (when to stop; D5)
- G: "Stop when the arrow is nearest vertical: $k^* = 2$ for $N = 8$. For $N = 1024$ it is 25 steps, with chance $0.9995$, against hundreds of checks by hand. The miss chance is at most $1/N$."
- F: "$k^* = \mathrm{round}(\pi/(4\alpha) - \tfrac12)$ (Bergou's $\bar n$, ≈ $\tfrac\pi4\sqrt N - \tfrac12$): 2 for $N = 8$, 25 for $N = 1024$ ($P = 0.9995$). Then $P_\text{fail} \le \sin^2\alpha = 1/N$ ($0.0547 \le 0.125$ here), $O(1/N)$ (errata box)."
- Cap: G/F "the best whole number of steps, and its chance" · Stage `gp(2,{readouts:['kopt','success']})` · Claims `q17Kopt8` (2), `q17Kopt1024` (25), `q17P1024` (0.9995), `q17Fail8` (0.0547) · Derivation D5.

**b4 [B]** (exact cases; many marked) · Terms `qc-amplitude-amplification`
- G: "For $N = 4$, $\alpha = 30°$, so one step lands exactly on $x_0$: chance 1. With several marked items, the same picture holds with a bigger $\alpha$: amplitude amplification."
- F: "$N = 4$: $3\alpha = 90°$, $P_1 = 1$. With $M$ marked items $\sin\alpha = \sqrt{M/N}$ and $|x_0\rangle$ becomes their even mix (amplitude amplification; N&C Eq. 6.12): $N = 16$, $M = 4$ is again $\alpha = 30°$, one exact step."
- Cap: G/F "$N = 4$: one step, all the chance on $|11\rangle$" · Stage `split(circ(C_G4,5) / amp(C_G4,5,'probability'))` · Claims `q17N4P` (1), `q17N4Alpha` (30), `q17M4P` (1).

**b5 [C]** (overshoot) · Terms `qc-overshoot`
- Q G: "Take one more step than $k^*$ for $N = 8$. Does the chance rise further?" · Q F: "What is $P_3$ for $N = 8$, and why?"
- Reveal G: "No, it falls to $0.3301$. The arrow overshoots $|x_0\rangle$ and keeps turning. Grover is a rotation, so stopping on time matters." · Reveal F: "$P_3 = \sin^2(7\alpha) = 0.3301$: $Q$ is a rotation, so $P_k$ is periodic in $k$; more iterations past $k^*$ lower the chance."
- Cap: G/F "three steps: the arrow past vertical, chance $0.3301$" · Stage q `gp(2)`; reveal `split(gp(3,{trail:true, readouts:['success']}) / amp(C_G(3),13,'probability'))` · Claims `q17P3` (0.3301).

### Unit `q17-optimal` — No algorithm can do better
**b1 [B]** (the setup) · Terms `qc-bbbv-bound`
- G: "Any search algorithm mixes oracle calls with its own fixed steps. Compare each run with the oracle to the same steps with no oracle at all. Without an oracle, Grover's state never moves."
- F: "Write any algorithm as $|\psi_k^x\rangle = U_kU_x\cdots U_1U_x|\psi_\text{in}\rangle$, $U_x = I - 2|x\rangle\langle x|$ (Eqs. 7.19–7.20), and compare with $|\psi_k\rangle = U_k\cdots U_1|\psi_\text{in}\rangle$ through $D_k = \sum_x\lVert\psi_k^x - \psi_k\rVert^2$."
- Cap: G/F "two steps with no oracle: still eight equal bars" · Stage `split(circ(C_D(2),7) / amp(C_D(2),7,'signed'))` · Claims `q17DiffOnlyStill` (gap to $|w_0\rangle$ = 0).

**b2 [B]** (each query moves things a little)
- G: "One query can add only a little to the total difference. Adding up, after $k$ queries it is at most $4k^2$. Grover's own run gives 4, 14, 25 for $k = 1, 2, 3$."
- F: "$D_{k+1} \le D_k + 4\sqrt{D_k} + 4$, so $D_k \le 4k^2$ by induction (Eqs. 7.21–7.25; the middle line of 7.22 needs $4|\langle x|\psi_k\rangle|^2$: errata box). For $N = 8$: $D_1, D_2, D_3 = 4, 14, 25$."
- Cap: G/F "Grover's run after two queries, the one compared with the still state" · Stage `split(circ(C_G(2),9) / amp(C_G(2),9,'signed'))` · Claims `q17D1` (4), `q17D2` (14), `q17D3` (25).

**b3 [B]** (but success needs a big difference; D6)
- G: "To find every $x$ with chance over a half, the difference must grow like $N$. So $4k^2$ must grow like $N$, and $k$ like $\sqrt N$. For $N = 1024$, at least 12 queries."
- F: "$|\langle x|\psi_k^x\rangle|^2 > \tfrac12$ for all $x$ forces $D_k \ge N(2-\sqrt2) - 2\sqrt N$ (Eqs. 7.26–7.27), hence $k \ge \tfrac{\sqrt{2-\sqrt2}}{2}\sqrt N\,(1 - \tfrac{2}{(2-\sqrt2)\sqrt N})^{1/2}$ (Eq. 7.29): $11.57$ for $N = 1024$."
- Cap: G/F "$N = 1024$: Grover's 25 steps reach $0.9995$" · Stage `gp10(25,{readouts:['angle','success']})` · Claims `q17Bbbv1024` (11.57), `q17Kopt1024`, `q17P1024` (reused) · Derivation D6.

**b4 [C]** (is Grover optimal?)
- Q G: "The bound says 12 queries for $N = 1024$; Grover uses 25. Is Grover the best possible?" · Q F: "Reconcile $k^* = 25$ with the lower bound $11.57$."
- Reveal G: "Yes, in how it grows: both scale as $\sqrt N$. The bound only asks for a chance above one half, and Grover after 12 steps sits at $0.4960$, right at that line." · Reveal F: "Both are $\Theta(\sqrt N)$; the constants differ because Eq. 7.29 targets success $> \tfrac12$. Grover's $P_{12} = 0.4960$ for $N = 1024$ shows the bound is nearly tight at that target."
- Cap: G/F "$N = 1024$ after 12 steps: chance $0.4960$" · Stage q `gp10(25)`; reveal `gp10(12,{readouts:['success']})` · Claims `q17P12of1024` (0.4960).

### 1.6 Claim ledger (key — engine call — value; numpy routes A/B in `plan709q-q17.py`)
- oracle: `q17Bar`, `q17MeanAfterOracle` `run(C_G(1))` column 2: 0.3536, `meanAmplitude` 0.2652 · `q17QIsCircuit` `maxDiff(columnUnitary product, −U_HU_0U_HU_f)` 0 · `q17Blind` `probs(run(C_G(1)), 1)[5]` 0.125.
- plane: `q17TwoOverRootN` 2/√8 from `groverAngle` 0.7071 · `q17PlaneClosed` off-plane norm of `Q(c₁w₀ + c₂x₀)` 0 · `q17SinA`, `q17AlphaDeg`, `q17CosA` `groverAngle(8)` 0.3536, 20.70, 0.9354 · `q17UnmarkedEqual` spread of the 7 unmarked amps over `run(C_G(3))` 0 · `q17Angle1`, `q17Angle2`, `q17Angle3` `groverPlane(8,1,k)` 62.11°, 103.52°, 144.93° (the last two also read in the Try-its) · `q17BookPerpOverlap` ⟨x₀| of the plus-sign vector 0.756.
- two-reflections: `q17R0` resolver entries of `{pauli:'Z'}` diag(1, −1) · `q17Cos2a`, `q17Sin2a` `reflect2D(α)` 0.75, 0.6614 · `q17TwoAlphaDeg` 41.41 · `q17ProductIsRot`, `q17ReverseTurn` `maxDiff(reflect2D(α)·reflect2D(0), R(±2α))` 0, 0.
- iterate: `q17P1`, `q17P2`, `q17P3` `groverSuccess(8,1,k)` 0.7813, 0.9453, 0.3301 (= `probs(run(C_G(k)))[5]`) · `q17InvUnmarked`, `q17InvMarked` `run(C_G(1))` column 5: 0.1768, 0.8839 · `q17Kopt8`, `q17Kopt1024` `groverOptimalK` 2, 25 · `q17P1024` 0.9995 · `q17Fail8` 0.0547 · `q17N4P`, `q17N4Alpha` `run(C_G4)`, `groverAngle(4)` 1, 30° · `q17M4P` `run(C_G16M4)` 1.
- optimal: `q17DiffOnlyStill` `maxDiff(run(C_D(2)), |w₀⟩)` 0 · `q17D1`, `q17D2`, `q17D3` `bbbvD(3,k)` 4, 14, 25 · `q17Bbbv1024` `bbbvLowerBound(1024)` 11.57 · `q17P12of1024` `groverSuccess(1024,1,12)` 0.4960.

## 2. Derivations (step `tex` — why — **view**; Ground ≥ Formal; ≥ 2 views each)
A step with no bold view keeps the previous step's view (W-709 #11 inheritance), so every step has a picture.
**D1 · plane:b2 · result `Q(c_1|w_0\rangle + c_2|x_0\rangle) = c_1|w_0\rangle + (\tfrac{2c_1}{\sqrt N} + c_2)(|x_0\rangle - \tfrac2{\sqrt N}|w_0\rangle)`** (Eq. 7.15 corrected) — Ground (4): (1) `\langle x_0|w_0\rangle = 1/\sqrt N` · **amp(C_G(1),1,'signed')** · (2) `U_f|w_0\rangle = |w_0\rangle - \tfrac2{\sqrt N}|x_0\rangle` · **amp(C_G(1),2,'signed')** · (3) `-U_{w_0}` keeps $|w_0\rangle$, sends $|x_0\rangle \to \tfrac2{\sqrt N}|w_0\rangle - |x_0\rangle$ · **gp(0,{half:'oracle'})** · (4) result · **gp(1)**. Formal (3): (1) $U_f|w_0\rangle$ · **amp(C_G(1),2,'signed')** · (2) $-U_{w_0}$ on $S$ · **gp(0,{half:'oracle'})** · (3) result · **gp(1)**.

**D2 · plane:b1 · result `\sin\alpha = 1/\sqrt N,\ \cos\alpha = \sqrt{1 - 1/N}`** — Ground (3): (1) each string has chance $1/N$ in $|w_0\rangle$ · **amp(C_G(1),1,'probability')** · (2) subtract the $|x_0\rangle$ part, then rescale: $|x_0^\perp\rangle$ · **gp(0)** · (3) $\cos\alpha = \langle x_0^\perp|w_0\rangle = 0.9354$ · **gp(0,{arcs:['alpha']})**. Formal (2): (1) Gram–Schmidt with a **minus** sign (errata box) · **gp(0)** · (2) result · **amp(C_G(1),1,'probability')**.

**D3 · two-reflections:b3 · result `R_{w_0}R_{x_0^\perp} = R(2\alpha)`** (Theorem 1) — Ground (4): (1) $v_1$ on $M_1$: the first mirror keeps it · **gp(0,{proof:'v1'})** · (2) the second mirror swings it $2\alpha$ round · **gp(1,{arcs:['step']})** · (3) $v_2$ on $M_2$: first swung $2\alpha$ back, then to $2\alpha$ past its start · **gp(0,{proof:'v2'})** · (4) both basis vectors turn by $2\alpha$, so every vector does · **mx({product:[RW, R0]})**. Formal (3): (1) $R_\theta = \cos2\theta\,Z + \sin2\theta\,X$ · **mx(RW)** · (2) $R_\alpha R_0 = R(2\alpha)$ · **mx({product:[RW,R0]})** · (3) result · **gp(1,{arcs:['step']})**.

**D4 · iterate:b1 · result `Q^k|w_0\rangle = \sin((2k+1)\alpha)|x_0\rangle + \cos((2k+1)\alpha)|x_0^\perp\rangle`** — Ground (3): (1) start at $\alpha$ · **gp(0)** · (2) each step adds $2\alpha$ · **gp(1,{trail:true})** · (3) after $k$: $(2k+1)\alpha$, chance $\sin^2$ · **amp(C_G(2),9,'probability')**. Formal (2): (1) Eq. 7.17 + $Q = R(2\alpha)$ · **gp(0)** · (2) result · **amp(C_G(2),9,'probability')**.

**D5 · iterate:b3 · result `k^* = \mathrm{round}(\tfrac{\pi}{4\alpha} - \tfrac12),\ P_\text{fail} \le \sin^2\alpha = 1/N`** — Ground (3): (1) want $(2k+1)\alpha \approx 90°$ · **gp(2,{readouts:['kopt']})** · (2) $N = 8$: $2.17 - 0.5 \to 2$ · **gp(2)** · (3) the nearest whole $k$ misses $90°$ by at most $\alpha$ · **gp(3)**. Formal (2): (1) solve, round (N&C CI) · **gp(2,{readouts:['kopt']})** · (2) $\cos^2((2k^*+1)\alpha) \le \sin^2\alpha$; per wrong item $O(1/N^2)$ · **gp(3)**.

**D6 · optimal:b3 · result `k \ge \tfrac{\sqrt{2-\sqrt2}}{2}\sqrt N\,(1 - \tfrac{2}{(2-\sqrt2)\sqrt N})^{1/2}`** (Eqs. 7.21–7.29) — Ground (4): (1) $D_k \le 4k^2$ · **amp(C_G(2),9,'signed')** · (2) success $> \tfrac12$ makes each term at least $2 - 2|\langle x|\psi_k\rangle| - \sqrt2$ · **amp(C_D(2),7,'signed')** · (3) summing: $D_k \ge N(2-\sqrt2) - 2\sqrt N$ · **gp10(12)** · (4) combine: $11.57$ for $N = 1024$ · **gp10(25)**. Formal (3): (1) upper bound, Eq. 7.25 · **amp(C_G(2),9)** · (2) lower bound, Eq. 7.27 · **amp(C_D(2),7)** · (3) Eq. 7.29 · **gp10(25)**.

## 3. Try-it widgets (props read from source; one-qubit stand-ins until W16)
| Unit | Spec | Try this |
|---|---|---|
| oracle | `bloch` `{theta:90, phi:0, editable:false, measure:'z', rotations:true, rotationAngles:[180]}` | $|+\rangle$ is the even mix of $N = 2$ items. Press 180°: it turns to $|-\rangle$, the mark on $x_0 = 1$ (up to an overall phase). The z bars stay at one half: marking alone changes no chance. |
| plane | `projector` `{state:α°, basis:0, editableBasis:false}` | A qubit's real plane has the same flat geometry: read $|{+z}\rangle$ as $|x_0^\perp\rangle$ and $|{-z}\rangle$ as $|x_0\rangle$. At $20.7°$ the arrow is $|w_0\rangle$ for $N = 8$: the $|{-z}\rangle$ row reads 12.5%. (The note compares with a Bloch sphere; Grover's plane has none.) |
| two-reflections | `operator-action` `{a:cos2α, b:sin2α, d:−cos2α}` | This is the mirror through $|w_0\rangle$ for $N = 8$. Tick "show eigen-directions": the stretch-1 line is the mirror, the stretch $-1$ line is at right angles. Press σz: now the mirror is the horizontal, $U_f$. |
| iterate | `projector` `{state:3α°, basis:0, editableBasis:false}` | One step for $N = 8$ puts the arrow at $62.1°$: the $|{-z}\rangle$ row reads 78.1%. Drag to about $103.5°$ (two steps): about 94.5%. On to about $145°$ (three): about 33%. |
| optimal | `projector` `{state:5α°, basis:0, editableBasis:false}` | Two steps for $N = 8$: 94.5%. Drag to $90°$: 100%. Grover's whole job is this quarter turn, in steps of $2\alpha = 41.4°$. |
(Props `α°`, `3α°`, `5α°`, `cos2α`, `sin2α` come from `V` in code, never typed.)

## 4. Challenges (tol 0.005 unless stated; full walkthroughs: no sheet assigns Ch. 7)
- **oracle** 1 warm-up numeric `q17-or-blind` chance of $x_0$ from $|w_0\rangle$, $N = 8$ → **0.125** (`q17Blind`). 2 core numeric `q17-or-mean` mean amplitude after the first mark → **0.265** (`q17MeanAfterOracle`). 3 core choice `q17-or-sign` "After $U_f$ alone, $P(x_0)$?" → **0.125, unchanged** ✓.
- **plane** 1 warm-up numeric `q17-pl-sin` $\sin\alpha$ for $N = 16$ → **0.25**. 2 core numeric `q17-pl-alpha` $\alpha$ in degrees, $N = 8$ → **20.70** (tol 0.05; `q17AlphaDeg`). 3 core choice `q17-pl-perp` "Is the book's $(|w_0\rangle + \langle x_0|w_0\rangle|x_0\rangle)/\sqrt{1-1/N}$ orthogonal to $|x_0\rangle$?" → **No: its overlap is 0.756; the sign must be minus** ✓ (`q17BookPerpOverlap`).
- **two-reflections** 1 warm-up numeric `q17-tr-step` turn per step in degrees, $N = 8$ → **41.41** (tol 0.05). 2 core numeric `q17-tr-thirty` two mirrors $30°$ apart: the turn in degrees → **60** (`reflect2D`). 3 core choice `q17-tr-order` reversed order → **turns by $-2\alpha$** ✓ (`q17ReverseTurn`).
- **iterate** 1 warm-up numeric `q17-it-one` chance after one step, $N = 8$ → **0.781**. 2 core numeric `q17-it-kopt` $k^*$ for $N = 1024$ → **25** (tol 0). 3 stretch numeric `q17-it-over` chance after three steps, $N = 8$ → **0.330**.
- **optimal** 1 core numeric `q17-op-bound` Eq. 7.29 for $N = 1024$ → **11.57** (tol 0.01). 2 core choice `q17-op-tight` "Is Grover optimal?" → **yes, in its $\sqrt N$ growth** ✓.

## 5. Glossary (new in 709; no duplicate `qc-` id)
| id | term | introduces | Ground | Formal | first | bridge |
|---|---|---|---|---|---|---|
| `qc-search-problem` | unstructured search | — | Finding the one string a black box marks, with no order to exploit. | Given $f$ with a unique $x_0$, $f(x_0) = 1$, find $x_0$ (Eq. 7.13). | oracle:b1 | — |
| `qc-marked-item` | marked item $x_0$ | — | The one string the box answers 1 for. | The solution $x_0$; $U_f = I - 2|x_0\rangle\langle x_0|$. | oracle:b2 | — |
| `qc-grover-iterate` | Grover step $Q$ | notation | Mark, Hadamards, flip all but $000$, Hadamards: one step of the search. | $Q = -U_HU_0U_HU_f$, $U_0 = I - 2|0\rangle\langle0|$, $|w_0\rangle = U_H|0\rangle$. | oracle:b3 | — |
| `qc-grover-plane` | Grover plane | space | The flat picture spanned by the marked string and the even mix of the rest. | $S' = \{c_1|w_0\rangle + c_2|x_0\rangle : c_i \in \mathbb{R}\}$, basis $|x_0^\perp\rangle, |x_0\rangle$. | plane:b1 | `qc-l7-two-angles` |
| `qc-reflection` | reflection | — | A mirror map: keeps one line, flips the direction at right angles. | $R = I - 2|u\rangle\langle u|$ on the plane; $\det R = -1$. | two-reflections:b1 | `qc-f3-matrix-of-map` |
| `qc-two-reflections` | two reflections make a rotation | — | Mirrors meeting at angle $\alpha$, used one after the other, turn everything by $2\alpha$. | $R_{M_2}R_{M_1} = R(2\angle(M_1, M_2))$ (Theorem 1). | two-reflections:b3 | — |
| `qc-amplitude-amplification` | amplitude amplification | — | Growing the marked part of a state, step by step, by repeated turns. | $Q^k|w_0\rangle$ with $\sin\alpha = \sqrt{M/N}$; $P_k = \sin^2((2k+1)\alpha)$. | iterate:b4 | — |
| `qc-inversion-about-mean` | inversion about the mean | — | Reflecting every bar about the average bar. | $D = 2|w_0\rangle\langle w_0| - I$: $a_x \mapsto 2\bar a - a_x$. | iterate:b2 | — |
| `qc-overshoot` | overshoot | — | Turning past the target, so the chance falls again. | $P_k$ periodic in $k$; $k > k^*$ lowers it. | iterate:b5 | — |
| `qc-bbbv-bound` | the $\sqrt N$ lower bound | — | No algorithm finds a marked item with fewer than order $\sqrt N$ queries. | Bennett–Bernstein–Brassard–Vazirani: $k = \Omega(\sqrt N)$ (Eqs. 7.19–7.29). | optimal:b1 | — |

## 6. Review cards
- **oracle** G: the box flips one sign; a sign changes no chance; one step is mark, H's, flip-all-but-000, H's. F: $U_f = I - 2|x_0\rangle\langle x_0|$, $Q = -U_HU_0U_HU_f$. Eq $Q = -U_HU_0U_HU_f$. Trap: expecting the mark alone to raise $P(x_0)$.
- **plane** G: the state stays in one flat real plane; $\sin\alpha = 1/\sqrt N$; angles are not doubled. F: Eq. 7.15 (corrected), 7.17. Eq $|w_0\rangle = \sin\alpha|x_0\rangle + \cos\alpha|x_0^\perp\rangle$. Trap: drawing this plane as a Bloch sphere.
- **two-reflections** G: mark = mirror in the horizontal; the rest = mirror in $|w_0\rangle$'s line; together a $2\alpha$ turn; order matters. F: Eq. 7.16, Theorem 1. Eq $R_{w_0}R_{x_0^\perp} = R(2\alpha)$. Trap: a turn of $\alpha$, not $2\alpha$.
- **iterate** G: chance $\sin^2((2k+1)\alpha)$; stop at $k^*$; overshoot lowers it; bars invert about the mean. F: Eq. 7.18, $k^*$, $P_\text{fail} \le 1/N$, $M$ marked. Eq $k^* = \mathrm{round}(\pi/(4\alpha) - \tfrac12)$. Trap: "more steps, more chance".
- **optimal** G: compare runs with and without the oracle; each query moves little; finding needs a lot; so $\sqrt N$. F: $D_k \le 4k^2$, $D_k \ge N(2-\sqrt2) - 2\sqrt N$. Eq Eq. 7.29. Trap: reading 12 vs 25 as "Grover is not optimal".

## 7. Symbol-before-use
**7.1 Ground:** $x_0$, $N$, $f$ oracle:b1 · $\sqrt N$ (F1) · $|w_0\rangle$, $U_H$, $U_0$, $Q$ oracle:b3 (notation beat) · $|x_0^\perp\rangle$, $\alpha$ plane:b1 · $k$, $k^*$ iterate:b1/b3 · $D_k$ — **not written in Ground** ("the total difference"). **FLAG**: $\alpha$ here vs N&C's $|\alpha\rangle$; Rosetta line in F only, Ground never shows N&C's letters.
**7.2 Formal:** adds $U_f$ (Q5) oracle:b2 · $S'$ plane:b1 (gloss) · $S$, $U_{w_0} = U_HU_0U_H$ plane:b2 · $D = -U_{w_0}$ two-reflections:b2 · $R_\theta$, $R(2\alpha)$, $M_1, M_2$ two-reflections · $P_k$, $M$ iterate · $|\psi_k^x\rangle$, $|\psi_k\rangle$, $U_x$, $D_k$ optimal:b1. **FLAG**: $D$ (diffusion) vs $D_k$ (difference sum): distinct letters stated at optimal:b1; $M$ (marked count) vs $M_1, M_2$ (mirrors). Counts: Ground 1, Formal 2.

## 8. Errata (Correction boxes, `source: 'book'`; every `check` an engine computation)
- **E1 (map B18)** p. 121, Eq. 7.15: second line should read $c_1|w_0\rangle + (2c_1/\sqrt N + c_2)(|x_0\rangle - (2/\sqrt N)|w_0\rangle)$ (printed: factor $2/\sqrt N + c_2$, last ket $|x_0\rangle$; as printed it misses by 0.381 at $N = 16$). Check `q17PlaneClosed`.
- **E2 (map B19)** pp. 121–122: $|x_0^\perp\rangle$ and $|w_0^\perp\rangle$ need a minus sign (as printed, $\langle x_0|x_0^\perp\rangle = 0.756$ at $N = 8$); "$-U_f = -(I - 2|w_0\rangle\langle w_0|)$" should read $-U_{w_0}$.
- **E3 (map B20)** p. 123: $\cos\alpha = (1 - 1/N)^{1/2}$, not $(1 - 1/\sqrt N)^{1/2}$; the total failure is $\cos^2\alpha_{\bar n} \le 1/N$, $O(1/N)$; $O(1/N^2)$ is each wrong item's share ($0.0078 = 1/128$ at $N = 8$).
- **E4 (new, page image p. 124)** Eq. 7.22, middle line: the last term is $4|\langle x|\psi_k\rangle|^2$, not $|\langle x|\psi_k\rangle|^2$ (the next line's "+4" needs it).
- Silent: p. 124 says $|\langle x|\psi_k^x\rangle| > \tfrac12$, p. 125 uses $|\langle x|\psi_k^x\rangle|^2 > \tfrac12$ (the latter is the one used); $k^*$: Bergou's rounding and N&C's CI agree for $N = 4$–1024 and differ only at $N = 2$, where every $k$ gives $\tfrac12$.

## 9. Engine gaps and stage contracts
**9.1 Engine** (new `physics/qc/grover.ts`; numpy block "grover"): `groverAngle(N, M = 1)` · `groverPlane(N, M, k)` → $[\cos, \sin]$
of $(2k+1)\alpha$ · `groverSuccess(N, M, k)` · `groverOptimalK(N, M)` (N&C CI) · `groverCircuit(n, marked[], k)` and
`diffusionCircuit(n, k)` (the `T_NZ` table) · `reflect2D(deg)` · `bbbvLowerBound(N)` (Eq. 7.29) · `bbbvD(n, k)` ($D_k$ of Grover's own
run, full simulation) · `groverEigenphase(N, M)` ($\pm2\alpha$, for Q18). Cross-check test: `runCircuit(groverCircuit)` equals
`groverPlane` in $S'$ for $n \le 5$, $k \le 6$ (the 28 numpy cases).
**9.2 Stage — new SVG kind `grover-plane` (skill 10):**
```ts
export interface GroverPlaneState {
  kind: 'grover-plane'
  /** n = 1–10 (N = 2ⁿ), marked M = 1 ≤ M < N (default 1); α = asin √(M/N) is the RESOLVER's (grover.ts), never authored. */
  search: { n: number; marked?: number }
  /** Grover steps applied to |w₀⟩: a whole number 0–64 (may sweep; drawn at whole steps; interp turns the arrow by 2α per step). */
  k: Scrub
  /** 'oracle': also draw the next step's U_f image (the arrow mirrored in the horizontal) as a ghost. */
  half?: 'oracle'
  /** Mirror lines: 'x0perp' (horizontal, U_f) and 'w0' (through |w₀⟩ at α, the diffusion). */
  mirrors?: ('x0perp' | 'w0')[]
  /** Faint arrows of steps 0 … k−1. */
  trail?: boolean
  /** 'alpha': arc |x₀⊥⟩→|w₀⟩ labelled α; 'step': arc of the last step labelled 2α. */
  arcs?: ('alpha' | 'step')[]
  /** Theorem 1's picture proof with M₁ = the horizontal, M₂ = |w₀⟩'s line: 'v1' or 'v2' and its two reflections (needs k = 0). */
  proof?: 'v1' | 'v2'
  /** DOM readouts: 'angle' ((2k+1)α in degrees), 'success' (sin² of it), 'kopt' (k* and its chance). */
  readouts?: ('angle' | 'success' | 'kopt')[]
  shot?: 'G-PLANE'
}
```
Axes: horizontal "$|x_0^\perp\rangle$ (the rest, evenly)", vertical "$|x_0\rangle$ (marked)"; the unit circle; the state arrow and its
vertical shadow. Passport: "THE GROVER PLANE · a real 2-D slice of ℂᴺ · angles exact, not doubled". Fidelity (`qc709/fidelity.ts`):
`qc-gp-engine` (arrow from `groverPlane`, equal to the full simulation), `qc-gp-slice` (only $S'$; every other direction has
amplitude 0), `qc-gp-not-bloch` (state angles, not Bloch angles), `qc-gp-shadow` (vertical shadow² = $P(x_0)$), `qc-gp-real`
(misleading if read as general: real only because start and steps are real). Validation: $n$, $M$, $k$ integers in range at
$s = 0, \tfrac12, 1$; `proof` needs $k = 0$ and no `half`; `trail` only for $k \le 24$. Print: the same SVG scene, mode `'print'`.
**Fallback (if R1 declines):** every `gp` view becomes `{kind:'amplitudes', state:{dir:{thetaDeg: 2(2k+1)α, phiDeg:0}}, mode:'signed'}`
(two signed bars equal to the plane coordinates; captions name bar 0 $|x_0^\perp\rangle$, bar 1 $|x_0\rangle$) beside the exact
`mx(R0/RW/product)` tables; every derivation keeps ≥ 2 distinct views; the angle input is computed in code from `groverAngle`.
Other kinds: `circuit` (phase oracles with labels, ≤ 24 columns), `amplitudes` `'signed'` (mean line) and `'probability'`,
`matrix` `lin` with `{trig}` coefficients and `product` (merged, W-709 #15).
**9.3 Widgets:** W16 `oracle-bench` (P-Q16 §9.3) adds a Grover mode: mark one of $N \le 16$, step $U_f$ / $D$ / $Q$, with the
`grover-plane` and `amplitudes` kinds side by side. Until then the stand-ins above (true, with stated axis readings).

## 10. Media
Opener (Blender, deferred): Part VII's Grover rotation before this unit 17.2 (engine `groverPlane` JSON; no numbers). Film
(deferred) `qc-q17-mean`: "Inversion about the mean, one step at a time" (manifest keys `q17MeanAfterOracle`, `q17InvUnmarked`,
`q17InvMarked`, `q17P2`). Decor (user credits): one needle of frost in a haystack of ice; atmosphere only.

## 11. Hooks
**11.1 Concept stations:** `qc-search-oracle` (oracle; needs `qc-oracle-kickback`, `qc-hadamard-signs`) · `qc-grover-plane-station`
(plane; needs `qc-search-oracle`) · `qc-two-reflections` (two-reflections; needs `qc-grover-plane-station`) · `qc-grover-iterate`
(iterate; needs `qc-two-reflections`) · `qc-grover-optimal` (optimal; needs `qc-grover-iterate`). No 448 twin.
**11.2 Arcade (Spot the error; `Q17x` labels):** `qc-mark-reads` ("after one mark $x_0$ is likelier"; why `q17Blind`) ·
`qc-cos-alpha` ("so $\cos\alpha = \sqrt{1 - 1/\sqrt N}$", Bergou's slip; why `q17CosA`) · `qc-mirror-alpha` ("mirrors $\alpha$ apart turn
by $\alpha$"; why `q17TwoAlphaDeg`) · `qc-more-steps` ("more steps always help"; why `q17P3`) · `qc-fail-n2` ("the miss chance at
$k^*$ is $O(1/N^2)$"; why `q17Fail8` vs $1/64$).

## Rulings requested
- R1 Build the `grover-plane` SVG kind (§9.2) before Q17, or ship the fallback (two-bar `amplitudes` + `matrix` tables)?
- R2 Running $N = 8$, $x_0 = 101$; side cases $N = 4$, $N = 16$ with $M = 4$, $N = 1024$ — confirm.
- R3 Circuit form of $Q$: the third column is the phase oracle "flip all but 000", labelled $-U_0$ — accept?
- R4 Four Correction boxes (B18, B19, B20, new Eq. 7.22) — confirm all.
- R5 The optimality unit in both tracks (Ground: "each query moves the state a little"), not a Formal-only or deeper unit.
- R6 $k^*$ by N&C's CI rule in the engine (equal to Bergou's for $N \ge 4$).
- R7 Try-its: one-qubit stand-ins now, W16 `oracle-bench` later (shared with Q16).
- R8 New `grover.ts` engine module (§9.1) as one engine task, with the circuit-vs-plane cross-check.
