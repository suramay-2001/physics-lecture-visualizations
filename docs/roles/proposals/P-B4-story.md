# P-B4-story — B4 "Magic states and Pauli-based computation" (role P, Papers background chapter)

Proposal only; nothing under `app/` is touched. Format and gates as `P-B3-story.md` (background chapter in the paper-spec format, ruling S2; section shape of `P-Q21-story.md`; phases `'books'` `[B]`, `'clue'` `[C]`, `'deeper'` `[D]`;
claims are recipe outputs with numpy twins `pipeline/claims_papers/b4.py`, keys `b4…`, a list value is one key per entry `b4X1…n`; reported numbers carry source and place; trail entries are `[ref §place: why]`).

**Sources read online** (WebFetch of arXiv HTML / ar5iv / abstracts; nothing saved; paraphrased): BK05 `bk05` (quant-ph/0403025: Def. 1, Thm 1, §III, §VI Eqs. 35–38); Lit19a `lit19a` (1808.02892: rules, Figs. 4–7, §3.3 Fig. 17); Lit19b `lit19b`
(1905.06903: notation, Table 1, §1 35p³, Fig. 1); GSJ24 `gsj24` (2409.17595: §2.1–2.6, Fig. 2); BSS16 `bss16` (1506.01396, abstract); RS16 `rs16` (1403.2975, abstract); Bom+22 `bom22` (2212.00813, abstract; depth 2 via `gsj24`); Gid+25 `gid25`
(2312.04522, §4). The paper's own §3 notation was checked against the local ingest `sources/paper-tdg` (p. 20: $P(\varphi)=e^{i\varphi P/2}$). Not read: N&C §10.6.2 (course-book support listed in the crawl), KBP23 (the identity of beat `pbc:b5` is re-derived), Matsumoto–Amano
(the T-count sets are enumerated, not quoted). **Ownership.** Q22 owns Clifford conjugation, Gottesman–Knill, the update rule; Q3/Q4 own the Bloch sphere and $T$; B1 owns the rotated patch and decoders; B3 owns Pauli product measurement (reused in `injection`); B4 owns magic states, Pauli
rotations as a program form, T injection, 15-to-1, post-selection and cultivation, and the T-count of a rotation. **Evidence.** `planB3B4-numpy.py` (numpy only, shared with B3): dense 2–15 qubit state vectors, exact rational enumeration of 2¹⁵ patterns, breadth-first
unitary sets, Monte Carlo; **157 asserted checks, 0 failed** across B3+B4; every number below is printed by it (`planB3B4-numpy.out`).
**Conventions (Rosetta).** Rotation $P(\varphi)=e^{i\varphi P/2}$ as the paper (§3, p. 20): $\varphi=\pi/2$ is a Clifford gate ($e^{i\pi P/4}$), $\varphi=\pi/4$ is $T$-like, $T=Z(-\pi/4)$ and $T^\dagger=Z(\pi/4)$ up to phase. **Litinski's** $P_\phi=e^{-i\phi P}$ (Lit19a/b): his "$\pi/4$ rotation" is Clifford,
our $P(-\pi/2)$; his "$\pi/8$ rotation" is $T$-like, our $P(-\pi/4)$. **BK05's naming:** $T$-type = Bloch vector along a cube diagonal (8-point orbit); $H$-type = along an edge midpoint (12-point orbit); **$T|{+}\rangle$ is $H$-type**. Magic state $|m\rangle=T|{+}\rangle=(|0\rangle+e^{i\pi/4}|1\rangle)/\sqrt2$. Outcome $s,t\in\{\pm1\}$;
$\Pi_P^{s}=(1+sP)/2$; error chance $\varepsilon$ is the chance an input is flipped to $|m^\perp\rangle$. Wires numbered 1…n from the left. **Stage shorthand** (recipes, §9.2): `co(state,marks)` `clifford-orbit` (`bloch` + marks) · `ht(n)` `ht-powers` (`plot`) · `pc(preset,upTo)` `pauli-compile` (`pauli-program`) ·
`mr(P,Q)` `measure-then-rotate` (`matrix` tableau) · `ti(psi,branch)` `t-injection` (`circuit` + `amplitudes`) · `ip(P|axes,outcomes)` `inject-program` (`pauli-program`) · `fc` `fifteen-code` (`bits` bitmap) · `d15(eps)` `distill-15` (`plot`) · `pt(…)` `postselect-time` (`plot`) · `gc(cut)` `gap-cutoff` (`plot`) · `tc(…)` `t-count-law` (`plot`).

## 0. Chapter map
**Driving question:** "A computer made only of stabilizer pieces is easy to fake. What is the one thing to add, how is it supplied, and what does it cost?" Prerequisites: Q22 (Clifford group, Gottesman–Knill, update rule), Q3/Q4 (`q3-bloch`, `q4-one-qubit-gates`, `q4-circuits`), B1 (patches), B3 (product measurement; needed by `injection` only).

| # | id | Title (≤ 8 words) | Question | Sources | Nodes | Link-backs |
|---|---|---|---|---|---|---|
| 1 | `b4-beyond-clifford` | Why Clifford gates are not enough | Which states and gates lie outside stabilizer computation? | `bk05` Def. 1, Thm 1; `rs16` | `clifford-not-universal`, `clifford-t-universal`, `t-count` | Q22, Q3, Q4 |
| 2 | `b4-pbc` | Programs as Pauli rotations and measurements | How does a circuit become a list of rotations? | `lit19a` Figs. 4–6; `bss16` | `pauli-rotation`, `controlled-pauli`, `measurement-clifford-identity`, `pbc` | Q22, Q4 |
| 3 | `b4-injection` | Teleporting a T gate | How does a magic state become a gate? | `lit19b` Fig. 1; `lit19a` Fig. 7 | `magic-state`, `t-injection`, `adaptive-feedforward` | B3, Q11 |
| 4 | `b4-distill` | Fifteen in, one out | How do noisy magic states make a cleaner one? | `bk05` §VI; `lit19b` §1, Table 1 | `distillation-15-to-1`, `t-factory` | Q22, F5 |
| 5 | `b4-cultivate` | Cultivation and post-selection | How does discarding bad runs pay for itself? | `gsj24` §2, Fig. 2; `gid25` §4; `bom22` | `postselection`, `expected-attempts`, `cultivation` | F5 |
| 6 | `b4-synthesis` | Any angle from T gates | How many T gates does one rotation cost? | `rs16` | `rotation-synthesis` | Q4 |

**Outcomes:** place a state inside or outside the stabilizer octahedron · convert a Clifford+T circuit into Pauli rotations and count its T-count and layers · explain a T gate by teleportation and its adaptive fix-ups · compute the exact output error of 15-to-1 and see why it is $35\varepsilon^3$ ·
use keep chances to get mean attempts and mean time · say why a rotation costs about $3\log_2(1/\varepsilon)$ T gates. **0.1 Spec data.** *References* (status `read` unless noted): `bk05` Bravyi–Kitaev 2005 · `lit19a` Litinski 2019 · `lit19b` Litinski 2019 (distillation) · `gsj24` Gidney–Shutty–Jones 2024 ·
`gid25` Gidney et al. 2025 (§4 only) · `bss16` Bravyi–Smith–Smolin 2016 (`read`, abstract) · `rs16` Ross–Selinger 2016 (abstract) · `bom22` Bombín et al. 2022 (depth 2 via `gsj24`, abstract) · `kbp23` (`cited`: the identity is re-derived). *Nodes used from elsewhere:* `gottesman-knill`, `clifford-group`, `stabilizer-measurement-update`, `css-stabilizer`, `steane-code` (Q22), `surface-code-patch`, `pauli-frame`, `decoder`, `detector` (B1), `pauli-product-measurement` (B3), `teleportation` (`q11-teleport-circuit`), `bloch-sphere` (`q3-bloch`), `one-qubit-gates` (`q4-one-qubit-gates`), `binomial` (`f5-spread`).

## 1. Story beats per unit (G ≤ 25 words/sentence, F ≤ 40; every beat has both captions)
Kinds: bloch, plot · pauli-program, matrix · circuit, amplitudes, pauli-program · bits, plot · plot · plot.

### Unit `b4-beyond-clifford` — Why Clifford gates are not enough
**b1 [B]** (the octahedron) · Bridge `pp-q22-clifford`, `pp-q3-bloch`
- G: "On one qubit the Clifford gates turn the Bloch sphere onto itself in 24 ways. They shuffle six special states, the ends of the three axes. Apply $T$ to $|{+}\rangle$ and the point lands on the equator, off every axis."
- F: "The single-qubit Clifford group has 24 elements modulo phase (<<pp-q22-clifford|the Clifford group>>): the rotations of the octahedron with vertices $\pm x,\pm y,\pm z$, the six stabilizer states. $T|{+}\rangle$ has Bloch vector $(1,1,0)/\sqrt2$ with $L^1$ norm $\sqrt2>1$: outside the octahedron."
- Cap G "six stabilizer states at the octahedron's corners; the T state beyond its edge" · F "$|x|+|y|+|z|$: $1$ for stabilizer states, $\sqrt2$ for $T|{+}\rangle$" · Stage `co(t-plus,[stabilizer6],hull)` · Claims `b4CliffordCount` 24, `b4OrbitStab` 6, `b4L1Magic` 1.4142 · Trail `[bk05 §I Def. 1: magic states as Bloch vectors off the octahedron's corners]`.

**b2 [B] · notation beat, `introduces: ['pp-magic-state']`** (the orbit)
- G: "A state outside the octahedron is a [[pp-magic-state|magic state]]. The Cliffords carry $T|{+}\rangle$ to 12 such points. The 8 corners of the surrounding cube, $(\pm1,\pm1,\pm1)/\sqrt3$, form a second family."
- F: "The orbit of $T|{+}\rangle$ under the Cliffords has 12 points; BK05 Def. 1 calls them $H$-type (images of the Hadamard's eigenstates) and the 8 cube diagonals $T$-type. So $T|{+}\rangle$ is $H$-type: BK05's letter $T$ names a Clifford of order three, not the $\pi/8$ gate."
- Cap G/F "the 12-point orbit of the T state (and the 8 cube corners)" · Stage `co(t-plus,[orbit,stabilizer6])` · Claims `b4OrbitH` 12, `b4OrbitT` 8, `b4L1TType` 1.7321 · Trail `[bk05 §I Def. 1: the two families and their orbit sizes]`.

**b3 [B]** (noise pulls the point inside) · Trail `[bk05 §I Thm 1: inside the octahedron, classically simulable]`
- G: "Noise shrinks the arrow toward the centre. Inside the octahedron, stabilizer tricks can imitate the state, so it is useless for computing. For $T|{+}\rangle$ that happens at flip chance 0.146."
- F: "BK05 Thm 1: a state whose Bloch vector lies in the octahedron is imitated classically by Clifford gates, $|0\rangle$ preparation and $Z$ measurement. With flip chance $\varepsilon$ the length is $1-2\varepsilon$, so the $T|{+}\rangle$ axis meets a face at $\varepsilon=\tfrac12(1-1/\sqrt2)=0.1464$."
- Cap G/F "the arrow shortens with $\varepsilon$; at 0.1464 it touches a face" · Stage `co(t-plus,[],hull,eps)` · Claims `b4OctaEdge` 0.1464, `b4DepolInside` 0.9899 (length 0.7 on that axis: $L^1$ 0.99, inside).

**b4 [B]** (one more gate is enough in principle) · Trail `[rs16 abstract: Clifford+T approximates every z-rotation, with a T-count formula]`
- G: "One extra gate is enough in principle. The pair $H$, $T$ turns the sphere by 148.6 degrees, not a fraction of a full turn. No power returns to the start, but they creep ever closer."
- F: "$HT$ is a Bloch rotation by $148.60^\circ=0.4128$ turns, since $\cos(\theta/2)=\sin(\pi/8)/\sqrt2$. The best of its first $10^n$ powers misses the identity by $0.56,\ 0.045,\ 0.0029,\ 5.4\times10^{-5}$ for $n=1,\dots,4$ and never reaches it. That Clifford$+T$ words reach every single-qubit gate is cited (RS16)."
- Cap G/F "nearest return after 10, 100, 1000, 10 000 powers of HT" · Stage `ht(10000)` · Claims `b4HTAngleDeg` 148.6, `b4HTTurns` 0.4128, `b4HTClose1…4`.

**b5 [C]** (inside or outside?)
- Q G: "A $T$ state is depolarized until its arrow has length 0.7. Is it still magic?" · Q F: "For the $T|{+}\rangle$ axis, is the Bloch length-0.7 state inside the octahedron? And length 0.75?"
- Reveal G: "Length 0.7 is inside, since $0.7\times1.414=0.99$. Length 0.75 is outside, at 1.06. The edge sits at length 0.7071." · Reveal F: "$L^1$ norm $0.7\sqrt2=0.9899<1$ (inside), $0.75\sqrt2=1.0607>1$ (outside); the face is at length $1/\sqrt2$, flip chance $0.1464$."
- Cap G/F "two arrows against the octahedron's face" · Stage q `co(t-plus,[],hull,eps=0.15)`; reveal eps 0.125 · Claims `b4DepolInside` (reused), `b4L1Out` 1.0607.

### Unit `b4-pbc` — Programs as Pauli rotations and measurements
**b1 [B] · notation beat, `introduces: ['pp-pauli-rotation']`** (rotations and what Cliffords do to axes)
- G: "A Pauli rotation turns the state about a Pauli axis: $P(\varphi)=e^{i\varphi P/2}$. A turn $\varphi=\pi/2$ is a Clifford gate; $\varphi=\pi/4$ is $T$-like. A Clifford turn about $Z$ changes $X$ into $-Y$ and leaves $Z$ alone."
- F: "The paper's convention is $P(\varphi)=e^{i\varphi P/2}$ (arXiv:2506.03094, §3): $\varphi=\pi/2$ is Clifford, $\varphi=\pi/4$ is $T$-like. For anticommuting $P,Q$: $P(\tfrac\pi2)\,Q\,P(\tfrac\pi2)^\dagger=iPQ$, and a commuting $Q$ is unchanged. Litinski's $e^{-i\phi P}$ makes his $\pi/4$ our $P(-\pi/2)$ and his $\pi/8$ our $P(-\pi/4)$."
- Cap G/F "$Z(\pi/2)$ turns $X$ into $-Y$; $Z$ stays" · Stage `pc(z-then-x,1)` · Claims `b4ConjChanged` 2 (of $X,Y,Z$ on one qubit) · Trail `[lit19a §1 Figs. 4-6: circuits as Pauli rotations]`.

**b2 [B]** (compile the textbook Toffoli) · Derivation D1 · Terms `pp-pbc`
- G: "Slide every Clifford gate to the end. Each time it crosses a rotation it changes that rotation's axis. The textbook Toffoli has 15 gates, seven of them $T$. After sliding, seven rotations remain and nothing is left over."
- F: "Commuting a Clifford $C$ past $R_P(\varphi)$ replaces $P$ by $C^\dagger PC$. The 15-gate Toffoli (2 $H$, 6 CNOT, 7 $T^{(\dagger)}$) compiles to seven $\pi/4$ rotations about $ZII,IZI,IIX,ZZI,ZIX,IZX,ZZX$ with signs $-,-,-,+,+,+,-$, and a final Clifford equal to the identity."
- Cap G/F "from 15 gates to 7 rotations, step by step" · Stage `pc(toffoli-textbook,15)` · Claims `b4TextbookGates` 15, `b4ToffoliRots` 7, `b4FinalIdentity` 1 · Trail `[lit19a Figs. 4-6; bss16 abstract: Pauli-based computation]`.

**b3 [B]** (one layer; a second route)
- G: "All seven axes commute, so all seven rotations can run at once: one layer. The same seven come straight from the sign of the CCZ gate, $(-1)^{x_1x_2x_3}$, written with parities."
- F: "The axes commute pairwise, so the layer count is 1. Writing $x_1x_2x_3=\tfrac14[\sum x_i-\sum x_i\oplus x_j+x_1\oplus x_2\oplus x_3]$ and $x_S=(1-Z_S)/2$ gives CCZ as these seven rotations about $Z$-strings; the Hadamards on wire 3 turn the four axes that touch it into $X_3$ axes."
- Cap G/F "seven rotations, one layer, two routes to the same list" · Stage `pc(toffoli-phase,7)` · Claims `b4ToffoliDepth` 1, `b4ToffoliSame` 1, `b4HChanged` 4.

**b4 [B]** (a controlled Pauli is three turns)
- G: "A controlled Pauli is three Clifford turns: one about the product of the two Paulis, one about each alone. CNOT is the case control $Z$, target $X$."
- F: "In this convention $C(P_1,P_2)\propto(P_1P_2)(-\tfrac\pi2)\,P_2(\tfrac\pi2)\,P_1(\tfrac\pi2)$ (Lit19a Fig. 5, signs flipped by the convention); for $C(Z,X)$ this is CNOT. Checked on state vectors for three Pauli pairs; the signs $(-,+,+)$ or their inverse are the only ones that work."
- Cap G/F "CNOT as ZX, X on the target, Z on the control" · Stage `pc(cnot,3)` · Claims `b4CnotRotations` 3 · Trail `[lit19a Fig. 5: controlled-Pauli as three pi/4 rotations]`.

**b5 [B]** (a measurement swallows a turn) · Terms `pp-measurement-absorb` · Trail `[kbp23 Prop. 2.2 as cited by the paper; re-derived here]`
- G: "Measure $P$, then turn by a quarter about a clashing Pauli $Q$. The result equals a second measurement, of $W=\pm iQP$. A turn becomes a measurement, and measurements need only Pauli fixes."
- F: "For anticommuting $P,Q$ and $W=isQP$: $e^{i\pi Q/4}\,\Pi_P^{s}=\sqrt2\,\Pi_W^{+}\Pi_P^{s}$. Checked on 240 random cases of 1–3 qubits and both outcomes; the paper cites KBP23 Prop. 2.2 for this identity and we re-derived it, so no Correction is needed."
- Cap G/F "after measuring XX and turning about ZI, the state is stabilized by $W$" · Stage `mr(XX,ZI)` · Claims `b4AbsorbDev` 0.

**b6 [C]** (which axes change)
- Q G: "In the seven rotations of CCZ, the Hadamards on wire 3 are pushed through. How many axes change?" · Q F: "How many of the seven $Z$-string axes of CCZ contain wire 3, and so become $X_3$ axes?"
- Reveal G: "Four: $Z_3$, $Z_1Z_3$, $Z_2Z_3$ and $Z_1Z_2Z_3$. The three that skip wire 3 stay as they are." · Reveal F: "Four axes touch wire 3: $IIZ, ZIZ, IZZ, ZZZ$ become $IIX, ZIX, IZX, ZZX$; $ZII, IZI, ZZI$ are unchanged."
- Cap G/F "the four axes through wire 3" · Stage q `pc(toffoli-phase,0)`; reveal `pc(toffoli-phase,7)` · Claims `b4HChanged` (reused).

### Unit `b4-injection` — Teleporting a T gate
**b1 [B]** (CNOT, read, done) · Derivation D2 · Bridge `pp-q11-teleport-circuit`
- G: "A $T$ gate on an unknown qubit can use a magic state made elsewhere. CNOT the data onto the magic qubit and read the magic qubit. Reading 0 leaves the data with $T$ applied."
- F: "With data $a|0\rangle+b|1\rangle$ and magic $|m\rangle$, a CNOT (data → magic) and a $Z$ readout of the magic qubit leave $a|0\rangle+be^{i\pi/4}|1\rangle=T|\psi\rangle$ for outcome 0 and $T^\dagger|\psi\rangle$ for outcome 1, each with chance $\tfrac12$ (Lit19b Fig. 1 is the $P\otimes Z$ form)."
- Cap G/F "data 0.6, 0.8 in; read 0: the 1-bar turns by 45°" · Stage `ti(real,0)` · Claims `b4InjectProb` 0.5, `b4InjectPhase` 45 · Trail `[lit19b Fig. 1 and Sec. 2.1: pi/8 rotation by a P(x)Z measurement and an X readout]`.

**b2 [B]** (the half-time fix)
- G: "Reading 1 leaves $T^\dagger$, and one $S$ gate turns it into $T$, since $S\,T^\dagger=T$. This happens with chance exactly a half, whatever the data are."
- F: "$ST^\dagger=T$ because $T^2=S$. The odd branch has chance $\tfrac12$ for every input, and after the fix both branches have fidelity 1 with $T|\psi\rangle$ on 200 random states. The fix is a Clifford, so it can be tracked instead of applied (<<pp-b1-spacetime|Pauli frames>>)."
- Cap G/F "outcome 1, then $S$: the same bars as outcome 0" · Stage `ti(real,1,fix)` · Claims `b4InjectFid` 1 · Trail `[lit19b Sec. 2.1: the pi/4 correction is needed about half the time]`.

**b3 [B] · notation beat, `introduces: ['pp-t-injection']`** (any Pauli axis)
- G: "For a rotation about any Pauli $P$: measure the product of $P$ with the magic qubit, then read the magic qubit in $X$. The first outcome sets the sign of the turn. The second may need a Pauli fix."
- F: "Measuring $P\otimes Z_m$ (outcome $s$), then $X_m$ (outcome $t$), leaves $P^{[t=-1]}\,P(-s\pi/4)|\psi\rangle$; for $s=-1$ the turn is $P(\tfrac\pi4)=P(-\tfrac\pi4)\,P(\tfrac\pi2)$, a $T$-like turn times a Clifford. All four $(s,t)$ have chance $\tfrac14$; checked for six Paulis on 1–2 qubits."
- Cap G/F "measure $P\otimes Z$, then $X$ on the magic lane" · Stage `ip(ZX,s=+,t=+)` · Claims `b4InjectProbs` 0.25 · Trail `[lit19a Fig. 7 and Sec. 3.3 Fig. 17; lit19b Fig. 1]`.

**b4 [B]** (later axes depend on earlier readings) · Terms `pp-feed-forward` · Bridge `pp-b1-spacetime`
- G: "A Clifford fix from one injection changes the axis of the next. Plan $Z$, then $X$. If the first reading is odd, the second turn must be about $-Y$. Later steps depend on earlier readings."
- F: "A pending Clifford $F=P(\tfrac\pi2)$ forces the next planned axis $B$ to be executed about $FBF^\dagger$; for $F=Z(\tfrac\pi2)$, $B=X$ this is $-Y$. For planned axes $Z,X,Z,X$ the 16 outcome histories give 8 different executed sequences, so decoding must keep up with the machine."
- Cap G/F "planned $ZXZX$: after an odd first reading the second axis is $-Y$" · Stage `ip(ZXZX,0100)` · Claims `b4AxisSwap` 1, `b4AxisHistories` 8 · Trail `[lit19a §1.1 Fig. 7: the correction is commuted forward and changes the axes of later rotations]`.

**b5 [C]** (when nothing changes)
- Q G: "Three injections, all about $Z$. How many different axis sequences can the outcomes produce?" · Q F: "For planned axes $Z,Z,Z$, how many executed axis sequences occur over the 8 outcome histories?"
- Reveal G: "One. A Clifford turn about $Z$ commutes with later $Z$ turns, so no fix ever changes the axis." · Reveal F: "$P(\tfrac\pi2)$ about $Z$ commutes with $Z(\varphi)$: every history executes $Z,Z,Z$."
- Cap G/F "three Z injections: one sequence" · Stage `ip(ZZZ,000)` · Claims `b4AxisSame` 1.

### Unit `b4-distill` — Fifteen in, one out
**b1 [B]** (a noisy state)
- G: "Real magic states are slightly wrong. Model it as a chance $\varepsilon$ that the state is flipped to its opposite, so the arrow shrinks to length $1-2\varepsilon$. At $\varepsilon=0.01$ that is 0.98."
- F: "Twirling by Cliffords that fix the magic axis leaves $\rho=(1-\varepsilon)|m\rangle\langle m|+\varepsilon|m^\perp\rangle\langle m^\perp|$, Bloch length $1-2\varepsilon$. In the code frame below, the error is a $Z$ flip on each input with probability $\varepsilon$, independently (BK05 §VI; Lit19b §1)."
- Cap G/F "the T state at $\varepsilon=0.01$: arrow length 0.98" · Stage `co(t-plus,[],hull,eps=0.01)` · Claims `b4BlochLen` 0.98 · Trail `[bk05 §VI: the noise model of the 15-qubit protocol]`.

**b2 [B]** (the 15-qubit code) · Terms `pp-fifteen-code`
- G: "Take the 15-qubit code. Its four $X$ checks each touch eight qubits; its distance against flips of one kind is 3. Applying $T$ to all 15 qubits at once applies $T^\dagger$ to the one stored qubit."
- F: "The $[[15,1,3]]$ Reed–Muller code has $H_X$ the $4\times15$ matrix whose columns are $1,\dots,15$ in binary, ten $Z$ checks spanning the even-weight subcode of the Hamming code, $d_Z=3$ and $d_X=7$. $T^{\otimes15}$ maps $|\bar0\rangle\to|\bar0\rangle$, $|\bar1\rangle\to e^{-i\pi/4}|\bar1\rangle$: a logical $T^\dagger$ (BK05 §VI)."
- Cap G/F "the 4 × 15 check matrix: columns count 1 to 15 in binary" · Stage `fc` · Claims `b4XChecks` 4, `b4XWeight` 8, `b4ZChecks` 10, `b4D15X` 7, `b4D15Z` 3, `b4TransPhase` −45 (degrees) · Trail `[bk05 §VI Eqs. 35-38: the 15-qubit code]`.

**b3 [B]** (which flip patterns slip through) · Derivation D3
- G: "Flip each of the 15 inputs with chance $\varepsilon$. The four checks flag most patterns, and those runs are discarded. One or two flips are always flagged. Exactly 35 patterns of three flips slip through and corrupt the output."
- F: "A flip pattern $e$ is accepted iff $H_Xe=0$, i.e. $e$ is a Hamming word, and corrupts the output iff its weight is odd. The $[15,11,3]$ Hamming code has 35 words of weight 3 and 105 of weight 4, so $\varepsilon_{\rm out}\approx35\varepsilon^3$ (BK05 Eq. 38; Lit19b §1)."
- Cap G/F "weight-3 patterns that pass all four checks" · Stage `d15(0.01,pattern)` · Claims `b4Weight3` 35, `b4Weight4` 105, `b4Lead35` 1.003 (ratio at $\varepsilon=10^{-3}$) · Trail `[lit19b Sec. 1: 35 combinations of three faults that flip no X check]`.

**b4 [B]** (the curve, the threshold, two rounds)
- G: "Plot output error against input error. Below about 0.14 the output is better than the input. From $10^{-3}$, one round gives $3.5\times10^{-8}$ and a second round about $1.5\times10^{-21}$."
- F: "Summing the 2048 accepted patterns gives acceptance $0.8601$ and output error $3.609\times10^{-5}$ at $\varepsilon=0.01$. The fixed point $\varepsilon_{\rm out}=\varepsilon$ is $0.1415$ (BK05 Eq. 37 prints 0.141), just below the octahedron edge $0.1464$. From $10^{-3}$: $3.51\times10^{-8}$, then $1.51\times10^{-21}$; on average 15.2 inputs per output."
- Cap G/F "output against input error; the line $y=x$ and the crossing" · Stage `d15(0.001,curve,rounds=2)` · Claims `b4Accept1e2` 0.8601, `b4Out1e2` 3.609e-5, `b4Out1e3` 3.511e-8, `b4Threshold` 0.1415, `b4Level2` 1.514e-21, `b4InputsPer` 15.23 · Reported `bk05-threshold` "≈ 0.141" (Eq. 37) · Trail `[bk05 Eqs. 35-37: closed forms for acceptance, output error and threshold]` · Fidelity: the exact sum equals BK05's closed forms as rational numbers; the printed numerator cancels in floating point below $\varepsilon\approx10^{-3}$ (engine note).

**b5 [D]** (a whole factory) · Reported
- G: "A real factory has more to it than its inputs. Litinski's compact one at $10^{-4}$ reports output error $4.4\times10^{-8}$ from 810 qubits in 18.1 code cycles. The input-only term would be $3.5\times10^{-11}$."
- F: "Lit19b Table 1 (reported) lists $(15\text{-to-}1)_{7,3,3}$ at $p=10^{-4}$: $4.4\times10^{-8}$, 810 qubits, 18.1 cycles; and a two-level factory: $6.3\times10^{-25}$, 18 600 qubits, 67.8 cycles. The idealized $35p^3$ with $p=10^{-4}$ is $3.5\times10^{-11}$: the two numbers answer different questions (an input-error model against a full circuit-level estimate)."
- Cap G/F "reported factory rows beside the idealized $35p^3$" · Stage `d15(0.0001,curve)` · Reported `lit19b-row1` "4.4×10⁻⁸, 810, 18.1", `lit19b-row2` "6.3×10⁻²⁵, 18 600, 67.8" (Table 1, page from the PDF batch) · Claims `b4Lead35p4` 3.5e-11 · Trail `[lit19b Table 1; Sec. 1]`.

**b6 [C]** (inputs per output)
- Q G: "At input error $10^{-3}$, how many noisy states go in for each clean one out?" · Q F: "Mean number of inputs per accepted output at $\varepsilon=10^{-3}$: $15/p_s$."
- Reveal G: "About 15.2: the acceptance chance is 0.985, so almost every round is kept. Cheap when inputs are good." · Reveal F: "$p_s=0.9851$, so $15/p_s=15.23$ inputs per output; the rejected 1.5% of rounds cost only a retry."
- Cap G/F "acceptance against input error" · Stage `d15(0.001,accept)` · Claims `b4InputsPer` (reused), `b4Accept1e3` 0.9851.

### Unit `b4-cultivate` — Cultivation and post-selection
**b1 [B]** (the stages) · Terms `pp-cultivation` · Trail `[gsj24 §2.1-2.5: injection, cultivation, escape; full post-selection early]`
- G: "Cultivation grows a magic state in three stages. Inject it into a tiny code. Check it again and again with Clifford measurements. Then grow it into a big surface code. Any alarm discards the run."
- F: "GSJ24 §2: injection into a distance-3 colour code, cultivation (repeated check, grow, stabilize) raising the fault distance, then escape by grafting onto a surface code. Early stages use full post-selection; the last keep/discard uses a decoder gap cut-off (§2.5)."
- Cap G/F "inject → cultivate → escape, with discards at each stage" · Stage `pt(stages)` · No claims (descriptive; numbers in b4).

**b2 [B]** (expected attempts)
- G: "If each try is kept with chance $s$, you need $1/s$ tries on average. Keep one in five and you need five."
- F: "Tries until the first success are geometric with mean $\sum_{k\ge1}k\,s(1-s)^{k-1}=1/s$ (series checked to 2000 terms): $5$ at $s=0.2$, $2.857$ at $s=0.35$."
- Cap G/F "mean tries against keep chance" · Stage `pt(keep=0.2)` · Claims `b4Mean5` 5, `b4Mean035` 2.857.

**b3 [B]** (stop early and save time)
- G: "A run with two stages may be dropped after the first. Then a dropped run wastes only stage one. With stage times 10 and 4 and keep chances 0.65 and 0.31, a kept state costs 63 on average, against 70 without early dropping."
- F: "Mean time per kept state is $(t_1+s_1t_2)/(s_1s_2)$, against $(t_1+t_2)/(s_1s_2)$ without early abort: $63$ against $70$ for $t=(10,4)$, $s=(0.65,0.3077)$. A Monte Carlo of $4\times10^5$ runs gives 63.0. The durations are illustrative; the keep chances split the $d_1=3$ end-to-end 20% of GSJ24 Fig. 2."
- Cap G/F "two stages: time spent before each discard" · Stage `pt(stages,t=[10,4],s=[0.65,0.3077])` · Claims `b4StagedTime` 63, `b4StagedNoAbort` 70 (**C←R**, `uses: [gsj24-d3-e2e, gsj24-d3-cult]`).

**b4 [B]** (the reported figure, and what follows from it) · Reported
- G: "At physical error $10^{-3}$ the cultivation paper reports, for its smaller code, 35% discarded before growth and 80% by the end. For the larger code the figures are 85% and 99%. Keeping 20% needs 5 tries; keeping 1% needs 100."
- F: "GSJ24 Fig. 2 (reported): $d_1=3$: error $6\times10^{-7}$ at 35% discard, end-to-end $3\times10^{-6}$ at 80%; $d_1=5$: $6\times10^{-10}$ at 85%, $2\times10^{-9}$ at 99%. The escape-stage discard is $(P'_{\rm e2e}-P'_{\rm cult})/(1-P'_{\rm cult})=0.6923,\ 0.9333$; mean tries $1/0.20=5$ and $1/0.01=100$."
- Cap G/F "the four reported points; the keep chances they imply" · Stage `pt(keep=[0.2,0.01])` · Reported `gsj24-d3-cult` "6×10⁻⁷, 35 %", `gsj24-d3-e2e` "3×10⁻⁶, 80 %", `gsj24-d5-cult` "6×10⁻¹⁰, 85 %", `gsj24-d5-e2e` "2×10⁻⁹, 99 %" (Fig. 2) · Claims **C←R** `b4Esc3` 0.6923, `b4Esc5` 0.9333, `b4Keep3` 0.20, `b4Keep5` 0.01, `b4AttemptRatio` 20 · Trail `[gsj24 Fig. 2 and Sec. 2.5; the paper's Appendix A.6 uses the same arithmetic]`.

**b5 [B]** (confidence, and a cut-off) · Terms `pp-logical-gap` · Trail `[gid25 §4: complementary gap by decoding twice; bom22 abstract: the logical gap]`
- G: "Decode twice: once as the decoder would, once forcing the opposite logical answer. The difference in cost is a confidence. Drop low-confidence runs and the survivors are much cleaner."
- F: "For the 7-qubit repetition code at $p=0.1$ the two candidate corrections weigh $w$ and $7-w$; the gap is $|7-2w|$ (confidence = gap $\times\ln\frac{1-p}{p}$). Gap $\ge3$ keeps 97.45% of runs and lowers the logical error from $2.73\times10^{-3}$ to $1.81\times10^{-4}$; gap $\ge5$ keeps 85.0% at $7.5\times10^{-6}$. A toy of the logical gap of Bom+22 and Gid+25 §4."
- Cap G/F "logical error among kept runs against the cut-off" · Stage `gc(7,0.1,3)` · Claims `b4GapNoCut` 0.002728, `b4GapKeep3` 0.9745, `b4GapErr3` 1.811e-4, `b4GapKeep5` 0.8503, `b4GapErr5` 7.527e-6.

**b6 [C]** (the strictest cut-off)
- Q G: "Raise the cut-off to the maximum gap, 7. What fraction survives, and how clean are they?" · Q F: "For gap $\ge7$ on the 7-qubit repetition code at $p=0.1$, find the kept fraction and the error among kept."
- Reveal G: "Only the runs with no flipped bit or all flipped survive: 47.8% of them, with error $2\times10^{-7}$. Purity costs throughput." · Reveal F: "Gap 7 means $w\in\{0,7\}$: kept $0.4783$, error $2.09\times10^{-7}$ (only $w=7$ fails)."
- Cap G/F "cut-off 7: fewer runs, almost none wrong" · Stage q `gc(7,0.1,5)`; reveal `gc(7,0.1,7)` · Claims `b4GapKeep7` 0.4783, `b4GapErr7` 2.091e-7.

### Unit `b4-synthesis` — Any angle from T gates
**b1 [B]** (how many gates have at most $k$ T gates)
- G: "How many different one-qubit gates use at most $k$ T gates, plus any Clifford gates? The count roughly doubles with each T: 24, 96, 240, 528, 1104."
- F: "Counting unitaries modulo phase with T-count at most $k$ gives $24(3\cdot2^k-2)$: 24, 96, 240, 528, 1104, 2256, 4560 for $k=0,\dots,6$. A breadth-first search over 'a Clifford, a $T$, then anything with fewer $T$' reproduces them without using any normal-form theorem."
- Cap G/F "gates available against T-count" · Stage `tc(counts)` · Claims `b4TCountSets0…6` · Trail `[rs16 abstract: T-count as the cost measure]`.

**b2 [B]** (why the number is three)
- G: "Those gates sit in a 3-dimensional set of turns. With $N$ of them, the gap between neighbours shrinks like $N^{-1/3}$. Each T gate doubles $N$, so it buys a factor $2^{1/3}$ in accuracy: about $3\log_2(1/\varepsilon)$ T gates."
- F: "Heuristic: $N\approx3\cdot2^k$ points in the 3-dimensional group $SU(2)$ leave a covering radius $\varepsilon\sim N^{-1/3}\sim2^{-k/3}$, i.e. $k\approx3\log_2(1/\varepsilon)$. A brute-force best approximation of $R_z(1\,\mathrm{rad})$ for $k\le13$ gives a fitted slope $0.347$ of $\log_2(1/\varepsilon)$ against $k$ (the law: $0.333$)."
- Cap G/F "best error against T-count, and a $2^{-k/3}$ guide" · Stage `tc(error,phi=1.0)` · Claims `b4TCountSlope` 0.347 (fit over $k=5,7,9,11,13$ for one angle) · Trail `[rs16 abstract: typical T-count 3 log2(1/eps) plus a lower-order term]`.

**b3 [B]** (the published law) · Reported
- G: "The best known method reaches that count: about $3\log_2(1/\varepsilon)$ T gates, plus a small correction. For accuracy $10^{-3}$ that is about 30; for $10^{-10}$ about 100. Each extra digit costs about 10 more."
- F: "RS16 (reported): typical T-count $3\log_2(1/\varepsilon)+O(\log\log(1/\varepsilon))$ for an $\varepsilon$-approximation of a $z$-rotation, optimal with a factoring oracle. The leading term gives 29.9 at $10^{-3}$, 99.7 at $10^{-10}$, and $3\log_210=9.97$ more per factor of 10."
- Cap G/F "T gates against accuracy on a log axis" · Stage `tc(law)` · Reported `rs16-law` "3 log2(1/eps) + O(log log(1/eps))" (abstract) · Claims **C←R** `b4LawEps3` 29.9, `b4LawEps10` 99.7, `b4LawDecade` 9.97.

**b4 [B]** (some angles are free; every T is an injection)
- G: "Some angles are free: the T angle needs one T gate and is exact. Others, like half of it, never become exact, and the cost grows with the accuracy you ask for. Each T gate is one magic-state injection."
- F: "With $k\le3$, $R_z(\pi/4)$ is exact at T-count 1, while the best $k\le3$ approximation of $R_z(\pi/8)$ still misses by 0.196. Each $T$-like rotation consumes one magic state (<<pp-b4-injection|Unit 3>>), so an $\varepsilon$-accurate rotation costs about $3\log_2(1/\varepsilon)$ injections, each from a factory (Units 4 and 5)."
- Cap G/F "exact at one T; not exact for half the angle" · Stage `tc(error,phi=pi/8)` · Claims `b4TExact` 0, `b4Pi8Err` 0.196.

**b5 [C]** (the cost of one more digit)
- Q G: "A rotation to $10^{-3}$ takes about 30 T gates. About how many more for $10^{-6}$? And for $10^{-10}$ in total?" · Q F: "Using $3\log_2(1/\varepsilon)$, find the increase from $10^{-3}$ to $10^{-6}$ and the value at $10^{-10}$."
- Reveal G: "Thirty more, about 60 in all; and about 100 for $10^{-10}$. Three digits cost thirty gates, three times ten." · Reveal F: "$3\log_2(10^3)=29.9$ more (59.8 total) and $3\log_2(10^{10})=99.7$."
- Cap G/F "T gates against accuracy" · Stage q `tc(law)`; reveal law with markers · Claims `b4LawEps6` 59.8, `b4LawEps10` (reused).

### 1.7 Claim ledger (key — recipe output / engine call — value; numpy route in `planB3B4-numpy.py`)
- beyond-clifford: `b4CliffordCount` 24, `b4OrbitStab` 6, `b4OrbitH` 12, `b4OrbitT` 8, `b4L1Magic` 1.4142, `b4L1TType` 1.7321, `b4L1Out` 1.0607, `b4DepolInside` 0.9899, `b4OctaEdge` 0.1464 `clifford-orbit` (Bloch rotations of H, S closed; orbits rounded to 6 places) · `b4HTAngleDeg` 148.6, `b4HTTurns` 0.4128, `b4HTClose1…4` 0.564, 0.0449, 0.00293, 5.44e-5 `ht-powers` (10⁴ matrix powers).
- pbc: `b4ConjChanged` 2, `b4TextbookGates` 15, `b4ToffoliRots` 7, `b4FinalIdentity` 1, `b4ToffoliDepth` 1, `b4ToffoliSame` 1, `b4HChanged` 4, `b4CnotRotations` 3, `b4AbsorbDev` 0 `pauli-compile` / `measure-then-rotate` (dense 8×8 products up to phase; 240 random absorb cases).
- injection: `b4InjectProb` 0.5, `b4InjectPhase` 45, `b4InjectFid` 1 (200 states, both branches after the fix), `b4InjectProbs` 0.25 (six Paulis), `b4AxisSwap` 1, `b4AxisHistories` 8, `b4AxisSame` 1 `t-injection` / `inject-program`.
- distill: `b4BlochLen` 0.98, `b4XChecks` 4, `b4XWeight` 8, `b4ZChecks` 10, `b4D15X` 7, `b4D15Z` 3, `b4TransPhase` −45, `b4Weight3` 35, `b4Weight4` 105, `b4Accept1e2` 0.8601, `b4Accept1e3` 0.9851, `b4Out1e2` 3.609e-5, `b4Out1e3` 3.511e-8, `b4Lead35` 1.003, `b4Threshold` 0.1415, `b4Level2` 1.514e-21, `b4InputsPer` 15.23, `b4Lead35p4` 3.5e-11 `fifteen-code` / `distill-15` (enumeration over the 2¹⁵ patterns; exact rational check against BK05 Eqs. 35–36 at 7 values).
- cultivate: `b4Mean5` 5, `b4Mean035` 2.857, `b4StagedTime` 63, `b4StagedNoAbort` 70 (Monte Carlo 63.0), `b4Esc3` 0.6923, `b4Esc5` 0.9333, `b4Keep3` 0.20, `b4Keep5` 0.01, `b4AttemptRatio` 20, `b4GapNoCut` 0.002728, `b4GapKeep3` 0.9745, `b4GapErr3` 1.811e-4, `b4GapKeep5` 0.8503, `b4GapErr5` 7.527e-6, `b4GapKeep7` 0.4783, `b4GapErr7` 2.091e-7 `postselect-time` / `gap-cutoff`.
- synthesis: `b4TCountSets0…6` 24, 96, 240, 528, 1104, 2256, 4560 (BFS) · `b4TCountSlope` 0.347, `b4TExact` 0, `b4Pi8Err` 0.196 `t-count-law` · `b4LawEps3` 29.9, `b4LawEps6` 59.8, `b4LawEps10` 99.7, `b4LawDecade` 9.97 (**C←R**, `uses: [rs16-law]`).
- Reported (R3): `bk05-threshold` ≈ 0.141 (Eq. 37) · `lit19b-row1`, `lit19b-row2` (Table 1) · `gsj24-d3-cult`, `gsj24-d3-e2e`, `gsj24-d5-cult`, `gsj24-d5-e2e` (Fig. 2) · `rs16-law` (abstract). Pages come with the PDF batch (Q1 in B3 plan).

## 2. Derivations (step `tex` — why — **view**; Ground ≥ Formal; ≥ 2 distinct views per track)
**D1 · pbc:b2 · the Toffoli as seven rotations** — G (4): (1) the 15 gates as given · **pc(toffoli-textbook,0)** · (2) the first Hadamard crosses a CNOT and a $T$: the $T$'s axis changes · **pc(…,5)** · (3) every Clifford has passed · **pc(…,15)** · (4) seven rotations, nothing left · **pc(…,15) readouts**. F (3): (1) $R_P(\varphi)C=C\,R_{C^\dagger PC}(\varphi)$ · **pc(…,0)** · (2) accumulate axes $C_i^\dagger Z_wC_i$ · **pc(…,9)** · (3) $U=\prod_iR_{P_i}(\pm\tfrac\pi4)$, $C_{\rm final}=I$ · **pc(…,15)**.
**D2 · injection:b1 · $T$ by teleportation** — G (4): (1) data and magic, unentangled · **ti(real,0) cursor 0** · (2) after the CNOT · **cursor 1** · (3) read 0: data is $T|\psi\rangle$ · **amplitudes outcome 0** · (4) read 1: $T^\dagger|\psi\rangle$, then $S$ · **amplitudes outcome 1 + fix**. F (3): (1) CNOT: $a|0\rangle|m\rangle+b|1\rangle X|m\rangle$ · **cursor 1** · (2) reading 0 keeps $a|0\rangle+b\,\omega|1\rangle$, reading 1 keeps $\omega a|0\rangle+b|1\rangle\propto a|0\rangle+b\bar\omega|1\rangle$, with $\omega=e^{i\pi/4}$ · **outcomes 0, 1** · (3) these are $T|\psi\rangle$ and $T^\dagger|\psi\rangle$, and $ST^\dagger=T$ · **outcome 1 + fix**.
**D3 · distill:b3 · $\varepsilon_{\rm out}\approx35\varepsilon^3$** — G (4): (1) a flip pattern lights some checks (its syndrome) · **fc + syndrome** · (2) accepted patterns: syndrome zero, the Hamming words · **fc + pass list** · (3) the lightest passing pattern with a wrong output has three flips · **fc + weight 3** · (4) 35 such patterns, each $\varepsilon^3$ · **d15 curve slope 3**. F (3): (1) $H_Xe=0$ · **fc** · (2) odd weight ⇒ logical error; $A_3=35$ · **fc + weight 3** · (3) $\varepsilon_{\rm out}=\sum_{w\ \rm odd}A_w\varepsilon^w(1-\varepsilon)^{15-w}/p_s$ · **d15**.
**viewCaptions:** D1 "the circuit as given" / "a Hadamard crosses" / "all Cliffords passed" / "seven rotations" · D2 "before" / "after the CNOT" / "read 0: $T$" / "read 1: $T^\dagger$, fixed by $S$" · D3 "a syndrome" / "patterns that pass" / "three flips" / "slope three on a log plot".

## 3. Try-it widgets (props read from `BitTable.tsx`, `BlochSphere.tsx`, `PhaseDial.tsx`)
| Unit | Spec | Try this |
|---|---|---|
| beyond-clifford | `bloch {theta:90, phi:45, landmarks:true}` | The point sits on the equator halfway between the $+x$ and $+y$ landmarks, not at any of the six. That is $T|{+}\rangle$; slide $\varphi$ to 0 and it lands on $+x$, a stabilizer state again. |
| pbc | `bit-table {mode:'strings', a:'000100', b:'000100', combine:'dot'}` | $ZII$ is the bits 000 100 ($x$ then $z$). The second row is $XII$ with halves swapped, 000 100: "a·b = 1", they clash, so a quarter turn about one changes the other. Set b to 000001 ($IIX$ swapped): "a·b = 0", it is untouched. |
| injection | `phase-dial {theta:45}` | The relative phase reads 45°: what $T$ adds to $|1\rangle$. Turn it to 90° ($S$) and to 315° ($T^\dagger$): $S\,T^\dagger$ returns to 45°. |
| distill | `bit-table {mode:'cost', n:15}` | The marker line reads 2ⁿ = 32 768 at n = 15: exactly the flip patterns the exact calculation sums. Slide to 10 for 1 024. |
| cultivate | `bit-table {mode:'strings', a:'0000100', b:'1010101', combine:'dot'}` | Row a is a flip pattern on 7 qubits, row b a check. "a·b = 1": the check fires, so this run would be discarded. Move the 1 to place 2: "a·b = 0", it passes unseen. |
| synthesis | `bit-table {mode:'cost', n:12}` | The marker line reads 2ⁿ = 4 096 at n = 12: the number of words of 12 blocks 'H T' or 'S H T' that the search tries. |

## 4. Challenges (tol 0.005 unless stated; integers tol 0)
- **beyond-clifford** 1 warm-up numeric `b4-b-24` elements of the single-qubit Clifford group (mod phase) → **24**. 2 core numeric `b4-b-l1` $L^1$ norm of the $T|{+}\rangle$ Bloch vector → **1.414**. 3 core choice `b4-b-in` "Which is inside the octahedron: the $T|{+}\rangle$ axis at Bloch length 0.7, or at 0.75?" → **0.7** ✓.
- **pbc** 1 warm-up numeric `b4-p-rots` rotations in the compiled Toffoli → **7**. 2 core numeric `b4-p-layers` layers needed → **1**. 3 core choice `b4-p-conj` "A Clifford turn about $Z$ maps $X$ to…" → **$-Y$** ✓.
- **injection** 1 warm-up numeric `b4-i-half` chance that the $S$ fix is needed → **0.5**. 2 core numeric `b4-i-hist` executed axis sequences for planned $Z,X,Z,X$ → **8**. 3 core choice `b4-i-axis` "After an odd first injection about $Z$, a planned $X$ rotation is executed about…" → **$-Y$** ✓.
- **distill** 1 warm-up numeric `b4-d-35` flip patterns of weight 3 that pass all four checks → **35**. 2 core numeric `b4-d-out` output error at $\varepsilon=0.01$ → **3.609e-5** (tol 1e-7). 3 stretch numeric `b4-d-inputs` inputs per output at $\varepsilon=10^{-3}$ → **15.23** (tol 0.01).
- **cultivate** 1 warm-up numeric `b4-c-mean` mean tries at keep chance 0.2 → **5**. 2 core numeric `b4-c-esc` escape-stage discard for $d_1=3$ (35%, 80%) → **0.6923** (C←R). 3 core numeric `b4-c-gap` fraction kept with gap $\ge3$ → **0.9745** (tol 0.001).
- **synthesis** 1 warm-up numeric `b4-s-law` $3\log_2(1/\varepsilon)$ at $\varepsilon=10^{-3}$ → **29.9** (tol 0.1; C←R). 2 core numeric `b4-s-count` unitaries with T-count $\le3$ → **528**. 3 core numeric `b4-s-decade` extra T gates per factor 10 in accuracy → **9.97** (tol 0.01; C←R).

## 5. Glossary (new in Papers; ids `pp-…`)
| id | term | introduces | Ground | Formal | first |
|---|---|---|---|---|---|
| `pp-magic-state` | magic state | notation | A state outside the octahedron of stabilizer states; consumed, it gives a non-Clifford gate. | $T|{+}\rangle=(|0\rangle+e^{i\pi/4}|1\rangle)/\sqrt2$ and its Clifford orbit (12 points, BK05 $H$-type). | beyond:b2 |
| `pp-pauli-rotation` | Pauli rotation $P(\varphi)$ | notation | A turn about a Pauli axis. | $P(\varphi)=e^{i\varphi P/2}$; $\varphi=\pi/2$ Clifford, $\pi/4$ $T$-like. | pbc:b1 |
| `pp-pbc` | Pauli-based computation | — | A program that is only Pauli rotations and Pauli measurements. | Cliffords commuted to the end; the final Clifford relabels outcomes (BSS16, Lit19a). | pbc:b2 |
| `pp-measurement-absorb` | a measurement absorbs a turn | — | A quarter turn after a measurement is another measurement. | $e^{i\pi Q/4}\Pi_P^s=\sqrt2\,\Pi_W^+\Pi_P^s$, $W=isQP$. | pbc:b5 |
| `pp-t-injection` | T injection | notation | Making a $T$-like turn by measuring with a magic state. | $P\otimes Z_m$ then $X_m$: $P^{[t=-1]}P(-s\pi/4)$. | injection:b3 |
| `pp-feed-forward` | feed-forward | — | Later steps depend on earlier readings. | Pending Cliffords change later axes: $B\to FBF^\dagger$. | injection:b4 |
| `pp-fifteen-code` | 15-qubit code | — | The code whose transversal $T$ is one logical $T^\dagger$. | $[[15,1,3]]$ Reed–Muller, $d_X=7$, $d_Z=3$. | distill:b2 |
| `pp-distillation` | 15-to-1 distillation | — | Fifteen noisy magic states in, one better one out. | Accept iff $H_Xe=0$; $\varepsilon_{\rm out}\approx35\varepsilon^3$. | distill:b3 |
| `pp-cultivation` | magic-state cultivation | — | Growing and checking a magic state, discarding bad runs. | Injection, repeated checks, escape (GSJ24). | cultivate:b1 |
| `pp-postselection` | post-selection | — | Throwing away runs whose checks fired. | Discard on detector events or a small gap. | cultivate:b1 |
| `pp-logical-gap` | logical gap | — | How much more likely the decoder's answer is than its rival. | Weight difference of the best corrections in the two logical classes (Bom+22, Gid+25 §4). | cultivate:b5 |
| `pp-t-count` | T-count | — | The number of $T$ gates in a circuit. | Number of $T^{(\dagger)}$ gates; cost of $\varepsilon$-synthesis $\approx3\log_2(1/\varepsilon)$ (RS16). | synthesis:b1 |
Reused: `pp-pauli-frame` (B1), `pp-clifford-group`, `pp-gottesman-knill` (Q22), `pp-pauli-product-measurement` (B3).

## 6. Review cards
- **beyond-clifford** G: Cliffords permute six states; the T state is outside; noise brings it back in at 0.146. F: Bloch $L^1$ norm, orbits 12 and 8. Eq $|x|+|y|+|z|\le1$. Trap: "BK05's $T$-type is the $T$ state".
- **pbc** G: slide Cliffords to the end; axes change; Toffoli is seven commuting rotations. F: $C^\dagger PC$, $\Pi$ identity. Eq $R_P(\varphi)C=C\,R_{C^\dagger PC}(\varphi)$. Trap: "Litinski's $\pi/4$ is $T$-like".
- **injection** G: CNOT and read gives $T$ or $T^\dagger$ (then $S$); the fix changes later axes. F: $P\otimes Z$ then $X$. Eq $P^{[t]}P(-s\pi/4)$. Trap: "the fix is a gate on the data".
- **distill** G: 15 in, patterns that pass are Hamming words, 35 weight-3 slip through. F: exact sum, threshold 0.1415. Eq $\varepsilon_{\rm out}\approx35\varepsilon^3$. Trap: "the factory's output error is $35p^3$ of the physical rate".
- **cultivate** G: keep chance $s$ costs $1/s$ tries; dropping early saves time; low gap means low confidence. F: $(t_1+s_1t_2)/(s_1s_2)$. Eq mean tries $=1/s$. Trap: "discarding wastes the whole run".
- **synthesis** G: gates double per T; 3 dimensions; $3\log_2(1/\varepsilon)$. F: $24(3\cdot2^k-2)$. Eq $T\approx3\log_2(1/\varepsilon)$. Trap: "every angle costs the same".

## 7. Symbol-before-use
**7.1 Ground:** $T$, $|{+}\rangle$ (Q4) beyond:b1 · $x,y,z$ axes (Q3) beyond:b1 · $\varepsilon$ beyond:b3 · $P(\varphi)$, $\varphi$ pbc:b1 · $W$ pbc:b5 · $s,t$ (outcomes) injection:b3 · $H_X$ distill:b2 · $s$ (keep chance, also outcome $s$ in injection) cultivate:b2 · $k$ (T-count bound) synthesis:b1. **FLAG:** $s$ is an outcome sign (injection) and a keep chance (cultivate); cultivate writes "keep chance $s$" each time. $T$ the gate vs BK05's "$T$-type": the latter is always written "T-type" in words.
**7.2 Formal:** adds $\Pi_P^s$, $N(S)$ (Q22) pbc:b5 · $C^\dagger PC$ pbc:b2 · $F$ injection:b4 · $A_w$, $p_s$ distill:b3–b4 · $t_1,t_2,s_1,s_2$ cultivate:b3 · $N$, $SU(2)$ synthesis:b2. Counts: 0 used before definition in either track.

## 8. Errata, source checks and Correction candidates
- **No Correction box.** Checked and agreeing: BK05 Eqs. 35, 36 as rational numbers at 7 values of $\varepsilon$; Eq. 37 (0.1415 against the printed 0.141); Eq. 38 (ratio 1.003 at $10^{-3}$); Lit19a Fig. 5 (three rotations; signs flip with the convention); Lit19b Fig. 1 / §2.1 (half-time Clifford fix; 35 weight-3 patterns); the paper's Eq. 23 form ($P\otimes Z$ then $X$, checked for six Paulis).
- **Notation clashes to carry into P1 (Rosetta in the glossary):** (a) Litinski's $\pi/4$ and $\pi/8$ rotations are our $P(-\pi/2)$ and $P(-\pi/4)$; the paper uses $P(\varphi)=e^{i\varphi P/2}$ and calls $e^{i\pi P/4}$ the Clifford rotation; (b) BK05's $T$-type states are the 8 cube diagonals, and $T|{+}\rangle$ is their $H$-type; (c) BK05's printed numerator of Eq. 36 is numerically unstable below $\varepsilon\approx10^{-3}$ (engine note).
- **Not verified / not used:** Lit19b Table 1 and GSJ24 Fig. 2 values (reported only; read in HTML; pages with the PDF batch); the paper's own Table 5 (P1); N&C §10.6.2; KBP23. GSJ24 §2.6's $H_{XY}$ sign erratum is noted for the cultivation fidelity line; it does not touch the numbers used.

## 9. Engine gaps and stage contracts
**9.1 Engine** (numpy twins in block "b4" of `make_fixtures.py`; routes = sections of `planB3B4-numpy.py`): `magic.cliffordGroup1()` (24 Bloch rotations), `magic.orbit(v)`, `magic.l1`, `magic.octahedronEdge()` · `pbc.conjugate(P, rotation)` (signed Pauli), `pbc.compile(circuit)` → rotations, final Clifford (identity test), layers (greedy commuting groups), state-vector equivalence ≤ 4 qubits (route: dense products, `dbg_compile`) · `pbc.absorb(P, Q, s)` identity deviation · `inject.teleportT(psi)`, `inject.general(P, psi)` (≤ 3 qubits), `inject.axes(planned, outcomes)` (2×2 Clifford frame tracking) · `magic.fifteen()` ($H_X$, even-weight subcode, distances by null-space enumeration, weight enumerator), `magic.distill15(eps)` by summing accepted-pattern weights (never the cancelling closed form), `magic.threshold()`, rational cross-check · `postselect.attempts(s)`, `postselect.meanTime(stages)`, `postselect.gapTable(n, p)`, `curves.rsTcount(eps)` · `tcount.sets(k)` (BFS), `tcount.bestError(phi, kmax ≤ 13)`, `ht.powers(nmax)`.
**9.2 Stage contracts.**
**S-a `pauli-program` (new SVG kind, S4; full contract; B3 uses the program mode, P1 adds modules and the pivot).** State `{kind:'pauli-program', program:{wires:n, columns:[…]}, upTo?}` or `{…, compile:{preset, upTo}}` or `{…, branch:{axes, outcomes}}`, `shot?`. Columns: `{rot:{pauli:'ZZX', angle:'c+'|'c-'|'t+'|'t-'}}` ($\pm\pi/2$ Clifford, $\pm\pi/4$ $T$-like, the paper's convention), `{meas:{pauli, outcome?:0|1}}`, `{inject:{pauli, s?, t?}}` (a $P\otimes Z$ and an $X$ measurement on a magic lane drawn below the wires). Wires ≤ 6, columns ≤ 24. Wires are horizontal lines, a column draws its Pauli letters on the wires it touches (I omitted; letters in the tableau's fixed colours), a rotation as a chip (filled for $T$-like, outlined for Clifford) joined by a vertical rule, a measurement as a meter box with its outcome symbol. **Compile mode:** `preset` ∈ {`toffoli-textbook` (15 gates), `toffoli-phase` (7 rotations), `cnot`, `z-then-x`}; `upTo` = how many Clifford gates have been pushed to the end (0 … gate count): the picture shows the gates not yet passed, the rotations collected with their current axes, and the pending Clifford; all from `pbc.compile` at each step. **Branch mode:** planned `axes` (≤ 6 letters) and the `outcomes` history: planned against executed axes with signs and the pending Clifford. Readouts: "7 rotations", "T-count 7", "layers 1", "final Clifford: identity" / "not identity"; all engine values. Passport "PROGRAM · Pauli operations, time →"; note "not a place · letters are Paulis on wires; spacing is a drawing". Fidelity: Paulis, signs, counts and layers exact (engine); column spacing schematic; "the magic lane is drawn for reading, it is not a wire of the program" (misleading otherwise). Transitions: same preset/program lerps `upTo` as steps (hard switch); others half-way. Print figure 320 × 300.
**S-b `bloch` marks.** `marks?: ('stabilizer6'|'orbit')[]` (points computed by the engine from the displayed state, ≤ 12), `hull?: true` (octahedron wireframe and the readout "$|x|+|y|+|z|$ = 1.414 · outside"), `eps?: 0–0.5` (shortens the arrow to $1-2\varepsilon$). GL scene work in the 448 `bloch` kind; fidelity key `bloch-marks-engine` (marks exact; wireframe schematic). Fallback if declined: `complex-plane` with the four equatorial members of the orbit and prose (weaker).
**S-c `plot` additions.** Engine point series with an integer $x$ list and `xScale:'log'`/`yScale:'log'`; named curves `distill15Out`, `distill15Accept`, `identityP` (exists), `meanTries` (1/s), `gapKept`, `tCountError`, `tCountLaw`, `htClosest` (points at $n=10^1…10^4$); `markers` and `yLines` as today. **S-d `bits`** bitmap view (B2's extension) for the $4\times15$ matrix with a row/column highlight and a readout "weight 8". **S-e `circuit-gates`** v2 adds `Sdg`, `Tdg`. **S-f recipes** (registry additions; `recipes.ts` untouched until the build; no existing recipe is used, `circuit-gates` v2 with `Sdg`/`Tdg` is an alternative only for beats that need gates alone). 11 recipes: the crawl listed 7 (R-B4-1…7 = `clifford-orbit`, `t-injection`, `pauli-compile`, `distill-15`, `postselect-time`, `t-count-law`, `measure-then-rotate`); `ht-powers`, `inject-program`, `fifteen-code`, `gap-cutoff` are new.

| recipe | kind(s) | params | engine call | named outputs |
|---|---|---|---|---|
| `clifford-orbit` | bloch | `state` t-plus\|t-type\|zero · `marks` · `hull` · `eps` 0–0.5 | `magic.cliffordGroup1`, `orbit`, `l1`, `octahedronEdge` | `count`, `l1`, `edge`, `inside` |
| `ht-powers` | plot | `nmax` 10…10000 | `ht.powers` | `angleDeg`, `turns`, `close1…4` |
| `pauli-compile` | pauli-program | `preset` toffoli-textbook\|toffoli-phase\|cnot\|z-then-x · `upTo` 0–15 | `pbc.compile`, `conjugate` | `gates`, `rotations`, `layers`, `finalIdentity`, `changed` |
| `measure-then-rotate` | matrix tableau (split) | `start` bits ≤ 3 · `p` · `q` · `outcome` | `pbc.absorb` | `dev` (max deviation of the identity) |
| `t-injection` | circuit + amplitudes | `psi` real\|plus · `branch` 0\|1 · `fix` | `inject.teleportT` | `prob`, `phase`, `fidelity` |
| `inject-program` | pauli-program | `pauli` ≤ 3 letters · `s`, `t` · or `axes` ≤ 6 · `outcomes` | `inject.general`, `inject.axes` | `probs`, `swap`, `histories` |
| `fifteen-code` | bits (bitmap) | `show` | `magic.fifteen` | `xChecks`, `xWeight`, `zChecks`, `dX`, `dZ`, `a3`, `a4`, `phase` |
| `distill-15` | plot | `eps` 1e-5–0.2 · `rounds` 1–2 · `show` curve\|accept\|pattern | `magic.distill15`, `threshold` | `accept`, `out`, `lead`, `threshold`, `level2`, `inputsPer` |
| `postselect-time` | plot | `keep` · `stages` · `t` · `s` | `postselect.attempts`, `meanTime` | `mean`, `time`, `timeNoAbort`, `esc`, `ratio` |
| `gap-cutoff` | plot | `n` odd 3–9 · `p` · `cut` | `postselect.gapTable` | `noCut`, `keep`, `err` |
| `t-count-law` | plot (log x) | `show` counts\|error\|law · `phi` · `kmax` ≤ 13 | `tcount.sets`, `bestError`, `curves.rsTcount` | `sets0…6`, `slope`, `law3`, `law6`, `law10`, `decade`, `err` |

**9.3 Widgets:** none required. Optional, shared with Q22/B3: `pauli-lab`.

## 10. Media (deferred)
No opener. Film candidate `b4-toffoli` "A Toffoli becomes seven turns": manifest keys `b4TextbookGates`, `b4ToffoliRots`, `b4FinalIdentity`, `b4ToffoliDepth`. Decor: none.

## 11. Hooks
**11.1 Stations:** the 16 B4 nodes on the prerequisite map (`#/papers/prereq/B4`). **11.2 Arcade** (when Papers gets one): "T-type is the T state" (`b4OrbitH`), "Litinski's π/4 is T-like" (`b4ConjChanged`), "the factory output is 35p³" (`b4Lead35p4`). **11.3 Bridges** (ids `pp-` + unit): existing `pp-q3-bloch`, `pp-q4-one-qubit-gates`, `pp-q11-teleport-circuit`, `pp-f5-spread`; planned: `pp-q22-clifford`, `pp-q22-gottesman-knill`, `pp-q22-css`; Papers-internal: B1 `b1-spacetime`, B3 `b3-surgery`.

## 12. Questions for the judge
1. **Rotation convention.** The chapter adopts the paper's $P(\varphi)=e^{i\varphi P/2}$ with a Rosetta against Litinski, so P1 reads straight through. Approve (the alternative, Litinski's, would make every "π/4" in P1 a clash).
2. **Reported claims from references** (BK05 Eq. 37, Lit19b Table 1, GSJ24 Fig. 2, RS16): same schema question as B3 Q1; pages from the PDF batch (BK05, Lit19b, GSJ24 are in the recommended list).
3. **`pauli-program` contract** as written (three modes) instead of two kinds; and `bloch` marks as a GL extension (heaviest item) — approve, or fall back to prose plus `complex-plane`?
4. **Eleven recipes** (four beyond the crawl). In particular `gap-cutoff` and the staged-time toy (`postselect-time`, illustrative durations flagged) are our own teaching models, not the papers' numbers: keep as `[B]`, or mark Go-deeper?
5. **Order.** `injection` needs B3's product measurement only in words; `pbc` needs only Q22. B4 units 1–2 can build before B3; units 3–6 after (as `chapters.md` (d)).
6. The paper's §3.3 small-angle compile (Eqs. 19–24) and A.6 (Eqs. 73–80) stay in P1; B4 supplies the notation, the injection rule, the keep-chance arithmetic and the T-count law only.
7. **Papers-internal bridges** (`pp-b1-spacetime`, `pp-b4-injection`): as B3 Q7 — confirm Papers → Papers links are accepted by the bridge registry and return bar.
