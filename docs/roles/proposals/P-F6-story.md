# P-F6-story — F6 "Many at once" (tensor and Kronecker products)

Proposal only. Nothing under `app/` is modified. Format: `P-F1-story.md` (Foundations two-track style) with the two
standing gates of `P-Q8-story.md`: every derivation list, both tracks, steps the stage through ≥ 2 distinct views
(`DerivStep.view`, `viewCaption`; W-709 #7), and every new space or notation gets exactly one notation beat
(`Beat.introduces`, `GlossEntry.introduces`; W-709 #8). Map entry: `P-709-map.md` §F6; rulings:
`decisions/qc709-foundations.md`. Planned with F4 and F5.

**Design (`decisions/qc709-foundations.md`; brief).** F6 is the ground-up owner of the tensor (Kronecker) product: the
joint space $\mathbb C^m \otimes \mathbb C^n$, $\otimes$ on vectors and on operators, and the product-versus-entangled
test. It is **shorter than F4** — five units. Prerequisites **F2** (vectors, inner products, bases) and **F3**
(matrices) are built in parallel; F6 bridges to them and assumes them. The Q chapters own the physics of entanglement:
Q4 owns $\otimes$ on operators applied to gates (`qc-tensor-operator`), Q6 owns Bell states and the correlation grid,
Q8 the density matrix. F6 does **not** re-teach those — it builds the algebra of $\otimes$ abstractly, and a later
wiring pass adds Q→F bridges. Ground ≤ 25 words/sentence; Formal ≤ 40; both tracks, every beat.

**Sources read** (copyrighted; paraphrased and cited).
- Axler 4e (**printed = PDF − 14**): 9D pp. 370–380 — 9.72, 9.73 (the tensor product $V \otimes W$, its basis
  $e_j \otimes f_k$ and $\dim = \dim V \cdot \dim W$); p. 376 (inner products on $V \otimes W$); p. 378 (many factors).
- Bergou 2e (**printed = PDF − 15**): Eqs. (1.3)–(1.4) p. 2 (a two-qubit state as $\otimes$), §2.1 p. 16
  ($X_A \otimes I_B$, a local operator), §3.1 p. 31 (the joint register).
- N&C (**printed = PDF − 28**): §2.1.7 pp. 71–74 (the tensor product, the Kronecker product of matrices, the
  big-endian basis order, $|ab\rangle$ conventions).
- What the Q chapters own (not re-cut): Q4 `qc-tensor-operator` ($\otimes$ on gates), Q6 Bell states + the grid, Q8 ρ.

**Evidence.** Every number was computed twice: by an independent numpy route (`scratchpad/f456plan-numpy.py`, block
"F6": `np.kron`, `reshape` + `np.linalg.det`/`matrix_rank` for the product test, byte counts) and by the app engine
(`state.kron`, `cmat.kronM`, `state.coefMatrix`, `state.isProduct`, `state.schmidtRank`, `cmat.detN`,
`state.paramCount`, `state.indexOfBits`/`bitsOfIndex`). They agree to 6 decimals. Keys are `f6.*` in `F6.values.ts`.

**Conventions.**
- Beat id `<unit>:b<n>`. Phase tags **[L]** core ramp (`lecture` phase holds the Axler/N&C/Bergou line), **[B]** a
  second source, **[C]** clue. Order L → B → C. Every beat has **G** (≤ 25 w/sentence) and **F** (≤ 40). All inline
  math is TeX inside `$…$`; no plan ids in learner text — cross-references read "Unit F6.3", "Chapter F2".
- **Qubit order** (engine C2; `state.ts`): the leftmost factor is qubit 0 = the most significant bit, so the index of
  $|b_0 b_1 \ldots b_{n-1}\rangle$ is $\sum_k b_k 2^{n-1-k}$ (**big-endian**); bit strings print left to right. $|0\rangle = |{+}z\rangle$.
- **Stage shorthand** (each expands to one `StageState`):

| Shorthand | Expands to | Needs |
|---|---|---|
| `mx(src, f)` | `{kind:'matrix', source:src, labels:'kets', values:'exact', ...f}` | matrix-v2 |
| `amp(S, f)` | `{kind:'amplitudes', state:S, ...f}` | — |
| `tq(S, f)` | `{kind:'two-qubit', source:{ket:S}, labels:'q1-q2', arrows:'reduced', ...f}` | two-qubit |
| `split(A / B)` | `{layout:'split', top:A, bottom:B}` | — |

| Matrix source | Expands to | Needs |
|---|---|---|
| `kron(A, B)` | `{kron:[A, B]}` = $A \otimes B$ (`cmat.kronM`) | matrix-v2 |
| `pa('XI')` | two letters → `{kron:[{pauli:'X'},{pauli:'I'}]}` = $X \otimes I$ | matrix-v2 |
| `coef(K)` | `{coef: K}` = the 2×2 coefficient matrix of a two-qubit ket $K$ (`state.coefMatrix`) | v1 |
| `out(K)` | `{outer:[K]}` | v1 |

- **Running examples:** the product state $|{+}\rangle \otimes |0\rangle$ (`ket('+0')`); $|{+}\rangle \otimes |{-}\rangle$
  (`ket('+-')`); the fully product $|{+}{+}\rangle$ (`ket('++')`); the entangled Bell state
  $(|00\rangle + |11\rangle)/\sqrt2$ (`bell('00+11')`, Q6's $\Phi^+$); the local operator $X \otimes I$; the register
  sizes $n = 1, 2, 10, 30, 50$.
- **Rosetta** (stated once, `f6-kron:b1` cap F): $\otimes$ is the tensor product; its coordinate form (every amplitude
  times every amplitude) is the Kronecker product. Axler writes $V \otimes W$ and $e_j \otimes f_k$; N&C writes
  $|ab\rangle = |a\rangle|b\rangle = |a\rangle \otimes |b\rangle$. Q4's $\otimes$ on gates is this same product.

## 0. Chapter map

F6 answers the map's question: **"How do you describe two coins, or two atoms, at the same time?"** It stands alone
(a reader who has met F2's bases and F3's matrices can start) and is the bridge target for every chapter that joins two
systems.

| # | id | Title (≤ 8 words) | Driving question | Sources | bridges offered |
|---|---|---|---|---|---|
| 1 | `f6-pairs` | Two systems, one joint space | How big is the space of two systems together, and what are its basis states? | Axler 9.73 p. 374; N&C §2.1.7 p. 71; Bergou §3.1 p. 31 | `<<f2-space>>` |
| 2 | `f6-kron` | Every amplitude times every amplitude | How do we combine two state lists into one, and in what order? | Axler 9.72 p. 372; N&C §2.1.7 pp. 71–72; Bergou Eq. 1.3 p. 2 | `<<f2-lists>>` |
| 3 | `f6-operator` | Machines acting on one part | How does a matrix on one system act on the pair, and what is $A \otimes B$ as a table? | Axler 9D p. 378; N&C §2.1.7 p. 73; Bergou §2.1 p. 16 | `<<f3-product>>`, `<<l4-matrices>>` |
| 4 | `f6-product-or-not` | When a joint state splits, and when it does not | How can we tell if two systems are independent, or tangled together? | N&C §2.1.7 p. 73; Axler 9D | `<<l7-order>>` |
| 5 | `f6-growth` | Inner products factor; the memory wall | Why do dimensions multiply, and why does that make big quantum systems hard to store? | Axler 9D p. 376; N&C §2.1.7 | — |

Forward F bridge: `f6-operator` → F4 (functions of $A \otimes B$); `f6-product-or-not` → Q6 (Bell states),
Q8 (the density matrix of a part) — added by the wiring pass.

**Outcomes** (Ground wording):
- Say how big the joint space of two systems is, and name its basis states $|ab\rangle$.
- Combine two state lists with $\otimes$: every amplitude times every amplitude, in big-endian order.
- Build $A \otimes B$ as a block table, and act with a machine on just one part ($X \otimes I$).
- Tell a product (independent) state from an entangled one with the factoring test.
- Explain why dimensions multiply, and why $n$ qubits need $2^n$ numbers to store.

**Prerequisites** (concept ids): F2 `qc-vector-space`, `qc-basis`, `qc-inner-product`; F3 `qc-matrix-element`,
`qc-matrix-product`. The Ground ramp assumes multiplication grids, the outcomes of two dice, and binary counting.

**Openers and films.** The Part F opener plays before `f6-pairs`. Film `qc-f6-distributive` (the distributive law
builds the four bars, §10.2) is the `Unit.opener` of `f6-kron`.

## 1. Story beats per unit

Stage kinds: `matrix` (every unit: `kron`, `blocks`, `coef`, `svd`), `amplitudes` ($2^n$ bars, product vs entangled),
`two-qubit` (the joint state's reduced arrows and grid). Every derivation view uses a kind its unit's beats show.

### Unit `f6-pairs` — Two systems, one joint space

**`f6-pairs:b1` [L] · space beat, `introduces: ['qc-joint-space']`** (how big is the pair's space?)
- **G:** "Put two systems together. If the first has $m$ states and the second has $n$, the pair has $m \times n$ joint states — every first state paired with every second. That pairing lives in the [[qc-joint-space|joint space]] $\mathbb C^m \otimes \mathbb C^n$. Two qubits give $2 \times 2 = 4$ states."
- **F:** "The [[qc-joint-space|joint space]] of systems with spaces $V$ ($\dim m$) and $W$ ($\dim n$) is $V \otimes W$, of dimension $mn$ (Axler 9.73, p. 374; N&C §2.1.7). Two qubits: $\mathbb C^2 \otimes \mathbb C^2 = \mathbb C^4$. $n$ qubits: $\mathbb C^{2^n}$."
- **Cap:** G "two qubits: $2 \times 2 = 4$ joint states" · F "$\dim(V \otimes W) = \dim V \cdot \dim W$"
- **Stage:** `amp({ket:'00'}, {})` (one of the 4 basis bars lit, the others shown empty).
- **Claims:** `f6TwoQDim` — `2 ** nQubits(ket('00'))` → 4 · `f6DimRule` — `2 * 2` → 4.

**`f6-pairs:b2` [L]** (the basis states, big-endian; D1)
- **G:** "Name the joint basis states by both labels at once: $|00\rangle$, $|01\rangle$, $|10\rangle$, $|11\rangle$. Read left to right, the first symbol is the first qubit. As a number, $|10\rangle$ is index 2. In general $n$ bits give $2^n$ strings."
- **F:** "The joint basis is $\{|a\rangle \otimes |b\rangle\} = \{|ab\rangle\}$; the index of $|b_0\ldots b_{n-1}\rangle$ is $\sum_k b_k 2^{n-1-k}$ (big-endian, engine C2; N&C §2.1.7). $n$ bits give $2^n$ strings (D1). $|10\rangle \mapsto 2$, $|11\rangle \mapsto 3$."
- **Cap:** G "$|00\rangle, |01\rangle, |10\rangle, |11\rangle$: the four labels" · F "$|10\rangle$ is index 2 (big-endian)"
- **Stage:** `amp({ket:'10'}, {})` (the index-2 bar lit).
- **Derivation:** D1 (§2).
- **Claims:** `f6Idx10` — `indexOfBits('10')` → 2 · `f6Bits3` — `bitsOfIndex(3, 2)` → '11' · `f6Strings` — `2 ** 3` → 8.

**`f6-pairs:b3` [B]** (two atoms, one register)
- **G:** "Two spin-½ atoms form one four-state system. The register's state is a list of four amplitudes, one per joint basis state. Even before anything is entangled, you need all four numbers to describe the pair."
- **F:** "A two-qubit register is a unit vector in $\mathbb C^4$, $\sum_{a,b} c_{ab}|ab\rangle$ (Bergou §3.1, p. 31). The four amplitudes $c_{00}, c_{01}, c_{10}, c_{11}$ are the register's full description; later units ask which of them factor."
- **Cap:** G/F "a two-qubit register: four amplitudes $c_{ab}$"
- **Stage:** `amp({bell:'00+11'}, {})` (a four-bar register).
- **Refs:** Bergou §3.1, p. 31.
- **Claims:** `f6RegLen` — `ghz(2).length` → 4.

**`f6-pairs:b4` [C]** (add or multiply?)
- **Q G:** "One qubit needs 2 numbers. Ten qubits — do they need $2 + 2 + \cdots = 20$ numbers, or something else?"
- **Q F:** "Does the dimension of a joint space add or multiply over the parts?"
- **Reveal G:** "It multiplies. Ten qubits need $2^{10} = 1024$ amplitudes, not $20$. Each qubit doubles the count, because every new choice pairs with all the old ones. Multiplying, not adding, is what makes quantum systems large."
- **Reveal F:** "$\dim$ multiplies: $\dim(V_1 \otimes \cdots \otimes V_n) = \prod_i \dim V_i$ (Axler 9D p. 378). Ten qubits: $2^{10} = 1024$. Adding would give $20$ — the difference is the whole story of Unit F6.5."
- **Reveal cap:** G/F "ten qubits: $2^{10} = 1024$, not $20$"
- **Stage:** question `amp({ket:'0'}, {})` (one qubit, 2 bars); reveal `amp({ket:'0000000000'}, {})` (10 qubits — bars capped at the $n \le 5$ stage limit, the count $1024$ in the caption; §9.2).
- **Claims:** `f6TenDim` — `2 ** 10` → 1024 · `f6AddWrong` — `2 * 10` → 20.

### Unit `f6-kron` — Every amplitude times every amplitude

**`f6-kron:b1` [L] · notation beat, `introduces: ['qc-tensor-product']`** (⊗ on vectors; D2)
- **G:** "To build the joint state of two independent systems, take the [[qc-tensor-product|tensor product]] $\otimes$: multiply every amplitude of the first by every amplitude of the second. For $(a_0, a_1) \otimes (b_0, b_1)$ the result is $(a_0 b_0, a_0 b_1, a_1 b_0, a_1 b_1)$."
- **F:** "The [[qc-tensor-product|tensor product]] $|\psi\rangle \otimes |\varphi\rangle$ has amplitudes $(\psi \otimes \varphi)_{ab} = \psi_a \varphi_b$ (Axler 9.72, p. 372; N&C §2.1.7). For $(a_0|0\rangle + a_1|1\rangle) \otimes (b_0|0\rangle + b_1|1\rangle)$ the distributive law gives $a_0 b_0|00\rangle + a_0 b_1|01\rangle + a_1 b_0|10\rangle + a_1 b_1|11\rangle$ (D2)."
- **Cap:** G "$(a_0, a_1) \otimes (b_0, b_1) = (a_0 b_0, a_0 b_1, a_1 b_0, a_1 b_1)$" · F "Rosetta: $\otimes$ is the tensor product; $|ab\rangle = |a\rangle \otimes |b\rangle$"
- **Stage:** `split( amp({ket:'+'}, {}) / amp({ket:'+0'}, {}) )` (two bars $\to$ four, each a product).
- **Derivation:** D2 (§2).
- **Claims:** `f6PlusZero` — `kron(KET['+x'], KET['+z'])` → (0.7071, 0, 0.7071, 0).

**`f6-kron:b2` [L]** (a worked product)
- **G:** "Take $|+\rangle \otimes |0\rangle$. The first list is $(0.707, 0.707)$, the second $(1, 0)$. Multiply every pair: $(0.707, 0, 0.707, 0)$. So $|+0\rangle = (|00\rangle + |10\rangle)/\sqrt2$: the first qubit is split, the second is $0$."
- **F:** "$|+\rangle \otimes |0\rangle = \tfrac1{\sqrt2}(|0\rangle + |1\rangle) \otimes |0\rangle = \tfrac1{\sqrt2}(|00\rangle + |10\rangle)$, amplitudes $(0.707, 0, 0.707, 0)$. The second factor $|0\rangle$ zeroes every $b = 1$ amplitude."
- **Cap:** G/F "$|+0\rangle = (|00\rangle + |10\rangle)/\sqrt2$"
- **Stage:** `amp({ket:'+0'}, {})`.
- **Claims:** `f6PlusZero` → (0.7071, 0, 0.7071, 0).

**`f6-kron:b3` [B]** (the amplitudes are products)
- **G:** "Each joint amplitude is a product of two single amplitudes. For $|+\rangle \otimes |-\rangle$ the four are $\tfrac12, -\tfrac12, \tfrac12, -\tfrac12$: each is $\pm\tfrac12$ because $0.707 \times 0.707 = 0.5$. A sign comes only from the $|-\rangle$ factor's minus."
- **F:** "$|+\rangle \otimes |-\rangle$ has $c_{ab} = (\pm1/\sqrt2)(\pm1/\sqrt2)$, giving $(0.5, -0.5, 0.5, -0.5)$ (Bergou Eq. 1.3, p. 2). The sign structure factors: the $b = 1$ column inherits $|-\rangle$'s minus, so the pair is still a product."
- **Cap:** G/F "$|+{-}\rangle = (0.5, -0.5, 0.5, -0.5)$"
- **Stage:** `amp({ket:'+-'}, {})`.
- **Refs:** Bergou Eq. 1.3, p. 2.
- **Claims:** `f6PlusMinus` — `kron(KET['+x'], KET['-x'])` → (0.5, −0.5, 0.5, −0.5).

**`f6-kron:b4` [C]** (does the order matter?)
- **Q G:** "Is $|0\rangle \otimes |1\rangle$ the same joint state as $|1\rangle \otimes |0\rangle$?"
- **Q F:** "Does $|0\rangle \otimes |1\rangle = |1\rangle \otimes |0\rangle$?"
- **Reveal G:** "No. $|0\rangle \otimes |1\rangle = |01\rangle$ is index 1; $|1\rangle \otimes |0\rangle = |10\rangle$ is index 2. They are different basis states — qubit 1 up, qubit 2 down, versus the reverse. The order names which qubit is which."
- **Reveal F:** "No: $|01\rangle \ne |10\rangle$ — different basis vectors ($\otimes$ is not commutative on labelled factors). The order fixes which system each factor describes; swapping is the SWAP gate, a real operation (Chapter Q6)."
- **Reveal cap:** G/F "$|01\rangle$ (index 1) $\ne$ $|10\rangle$ (index 2)"
- **Stage:** question `amp({ket:'01'}, {})`; reveal `amp({ket:'10'}, {})`.
- **Claims:** `f6Idx01` — `indexOfBits('01')` → 1 · `f6Idx10` → 2.

### Unit `f6-operator` — Machines acting on one part

**`f6-operator:b1` [L] · notation beat, `introduces: ['qc-kronecker-product']`** (A ⊗ B as a block table)
- **G:** "Two machines, one on each system, combine the same way: the [[qc-kronecker-product|Kronecker product]] $A \otimes B$. As a table it is $B$ copied into each slot of $A$, scaled by that slot's entry — a block table. For two qubits $A \otimes B$ is $4 \times 4$."
- **F:** "The [[qc-kronecker-product|Kronecker product]] $(A \otimes B)_{(a a'),(b b')} = A_{ab} B_{a'b'}$ (N&C §2.1.7, p. 73): an $m\times m$ by $n\times n$ pair makes an $mn \times mn$ block matrix, block $(a, b)$ equal to $A_{ab} B$. $X \otimes I$ is $4 \times 4$."
- **Cap:** G "$A \otimes B$: $B$ in each slot of $A$" · F "$(A \otimes B)_{(aa'),(bb')} = A_{ab}B_{a'b'}$"
- **Stage:** `mx(pa('XI'), {blocks:2})` (the $4\times4$ block table of $X \otimes I$).
- **Claims:** `f6XI` — `kronM(X, I2)` → [[0,0,1,0],[0,0,0,1],[1,0,0,0],[0,1,0,0]] · `f6XIdim` → 4.

**`f6-operator:b2` [L]** (acting factor by factor; D4)
- **G:** "A combined machine acts factor by factor: $(A \otimes B)(u \otimes v) = Au \otimes Bv$. Each machine works on its own system, then the results are tensored. So $X \otimes I$ on $|0\rangle \otimes |1\rangle$ gives $X|0\rangle \otimes I|1\rangle = |1\rangle \otimes |1\rangle = |11\rangle$."
- **F:** "$(A \otimes B)(|u\rangle \otimes |v\rangle) = A|u\rangle \otimes B|v\rangle$ (Axler 9D p. 378; D4). Linearity extends it to sums. $(X \otimes I)|01\rangle = |11\rangle$: $X$ flips the first qubit, $I$ leaves the second."
- **Cap:** G/F "$(X \otimes I)|01\rangle = |11\rangle$"
- **Stage:** `split( mx(pa('XI'), {blocks:2}) / amp({ket:'11'}, {}) )` (the operator and its result on $|01\rangle$).
- **Derivation:** D4 (§2).
- **Claims:** `f6XIon01` — `apply(kronM(X, I2), ket('01'))` → |11⟩ = index 3.

**`f6-operator:b3` [B]** (a local operator touches one part)
- **G:** "$X \otimes I$ is a [[qc-local-operator|local operator]]: it changes only the first system and leaves the second alone. Local machines are how we describe acting on one atom of a pair. The $I$ factor is the promise to do nothing to the other."
- **F:** "A [[qc-local-operator|local operator]] $A \otimes I$ acts on system A alone (Bergou §2.1, p. 16, $X_A \otimes I_B$). $\langle ab|(A \otimes I)|a'b'\rangle = A_{aa'}\delta_{bb'}$: the second index is untouched. Products of local operators, $A \otimes B = (A \otimes I)(I \otimes B)$, commute across the two systems."
- **Cap:** G "$X \otimes I$: flip qubit 1, leave qubit 2" · F "$A \otimes I$ acts on system A alone"
- **Stage:** `mx(pa('XI'), {blocks:2, highlight:[[0,2],[1,3],[2,0],[3,1]]})` (the nonzero entries, each $I$'s identity).
- **Refs:** Bergou §2.1, p. 16.
- **Claims:** `f6XI` → the block matrix · `f6LocalCommute` — `maxDiff(matmul(kronM(X,I2), kronM(I2,Z)), kronM(I2,Z)·kronM(X,I2))` → 0.

**`f6-operator:b4` [C]** (is A ⊗ B the same as B ⊗ A?)
- **Q G:** "Is $X \otimes I$ the same table as $I \otimes X$?"
- **Q F:** "Does $X \otimes I = I \otimes X$?"
- **Reveal G:** "No. $X \otimes I$ flips the first qubit; $I \otimes X$ flips the second. Their tables differ: $X \otimes I$ flips the first label of each pair, $I \otimes X$ the second. Which system a machine touches depends on its place in the product."
- **Reveal F:** "No: $X \otimes I \ne I \otimes X$ as $4 \times 4$ tables ($\otimes$ is not commutative on operators). $(X \otimes I)|01\rangle = |11\rangle$ but $(I \otimes X)|01\rangle = |00\rangle$. They do commute as operators, but they are not equal."
- **Reveal cap:** G/F "$X \otimes I \ne I \otimes X$"
- **Stage:** question `mx(pa('XI'), {blocks:2})`; reveal `mx(pa('IX'), {blocks:2})`.
- **Claims:** `f6XIneIX` — `matEq(kronM(X,I2), kronM(I2,X))` → false · `f6IXon01` — `apply(kronM(I2,X), ket('01'))` → |00⟩ = index 0.

### Unit `f6-product-or-not` — When a joint state splits, and when it does not

**`f6-product-or-not:b1` [L] · notation beat, `introduces: ['qc-product-state', 'qc-entangled']`** (the factoring test; D3)
- **G:** "Some joint states split back into two single ones, $|\psi\rangle \otimes |\varphi\rangle$: a [[qc-product-state|product state]]. Others cannot be split: they are [[qc-entangled|entangled]]. The test for two qubits: write the four amplitudes as a $2 \times 2$ table $C$; the state is a product exactly when $\det C = c_{00}c_{11} - c_{01}c_{10} = 0$."
- **F:** "A two-qubit $\sum c_{ab}|ab\rangle$ is a [[qc-product-state|product]] iff its coefficient matrix $C = [c_{ab}]$ has rank 1, i.e. $\det C = c_{00}c_{11} - c_{01}c_{10} = 0$; otherwise it is [[qc-entangled|entangled]] (N&C §2.1.7; D3, both directions). The Schmidt rank is $\mathrm{rank}\,C$."
- **Cap:** G "product $\Leftrightarrow \det C = 0$" · F "$C = [c_{ab}]$; product $\Leftrightarrow \mathrm{rank}\,C = 1$"
- **Stage:** `split( mx(coef('++'), {svd:true}) / mx(coef('00+11'), {svd:true}) )` (one Schmidt bar vs two).
- **Derivation:** D3 (§2).
- **Claims:** `f6ProdDet` — `detN(coefMatrix(ket('++')))` → 0 · `f6BellDet` — `detN(coefMatrix(bell('00+11')))` → 0.5.

**`f6-product-or-not:b2` [L]** (a product, by the numbers)
- **G:** "Take $|+{+}\rangle = (1, 1, 1, 1)/2$. Its table $C$ is all $\tfrac12$, so $\det C = \tfrac14 - \tfrac14 = 0$: a product. Indeed $|+{+}\rangle = |+\rangle \otimes |+\rangle$. Its two qubits are independent — each is a sharp $|+\rangle$."
- **F:** "$|{+}{+}\rangle$ has $C = \tfrac12\begin{pmatrix}1 & 1\\ 1 & 1\end{pmatrix}$, $\det C = 0$, rank 1: a product, $|+\rangle \otimes |+\rangle$. Each qubit's reduced state is pure ($|+\rangle$), so the reduced Bloch arrows have length 1 (Chapter Q8's language)."
- **Cap:** G/F "$|+{+}\rangle$: $\det C = 0$, a product"
- **Stage:** `tq('++', {arrows:'reduced'})` (both reduced arrows full length 1).
- **Claims:** `f6ProdDet` → 0 · `f6ProdIsProduct` — `isProduct(ket('++'))` → true.

**`f6-product-or-not:b3` [B]** (an entangled state: the Bell state)
- **G:** "Now $(|00\rangle + |11\rangle)/\sqrt2$. Its table is $\tfrac1{\sqrt2}\begin{pmatrix}1 & 0\\ 0 & 1\end{pmatrix}$, with $\det C = \tfrac12 \ne 0$: entangled. No two single states multiply to it. Each qubit alone looks like a coin — its reduced arrow has shrunk to zero length."
- **F:** "$\Phi^+ = (|00\rangle + |11\rangle)/\sqrt2$ (Q6's Bell state) has $C = \tfrac1{\sqrt2}I$, $\det C = \tfrac12$, rank 2: entangled. Its reduced states are maximally mixed ($\tfrac12 I$), so $|\mathbf r_A| = |\mathbf r_B| = 0$ (Chapter Q8). Entanglement is exactly a non-factoring joint state."
- **Cap:** G "Bell state: $\det C = \tfrac12$, entangled; reduced arrows vanish" · F "$\Phi^+$: $\mathrm{rank}\,C = 2$, $|\mathbf r| = 0$"
- **Stage:** `split( mx(coef('00+11'), {svd:true}) / tq('00+11', {arrows:'reduced'}) )` (two Schmidt bars; both arrows at the centre).
- **Refs:** N&C §2.1.7; Chapter Q6 (Bell states), Q8 (reduced states).
- **Claims:** `f6BellDet` → 0.5 · `f6BellSchmidt` — `schmidtRank(bell('00+11'))` → 2 · `f6BellEntangled` — `isProduct(bell('00+11'))` → false.

**`f6-product-or-not:b4` [C]** (can a basis change hide entanglement?)
- **Q G:** "The Bell state looks entangled in the $|0\rangle/|1\rangle$ basis. Could choosing a different basis for each qubit make it a product?"
- **Q F:** "Is entanglement a property of the chosen basis, or of the state?"
- **Reveal G:** "No. No choice of single-qubit bases turns the Bell state into a product. The Schmidt rank — the number of terms you truly need — is $2$ in every basis. Entanglement belongs to the state, not to how you label it."
- **Reveal F:** "No: the Schmidt rank $\mathrm{rank}\,C$ is invariant under local basis changes $C \to U C V^\top$ (both unitary), which cannot change a rank. The Bell state has rank 2 in every local basis — genuinely entangled (N&C §2.1.7)."
- **Reveal cap:** G/F "Schmidt rank 2 in every local basis"
- **Stage:** question `mx(coef('00+11'), {svd:true})`; reveal `mx(coef('00+11'), {svd:true, basis:['+x','-x']})` (two bars still).
- **Claims:** `f6BellSchmidt` → 2 · `f6BellSchmidtX` — `schmidtRank` of the Bell state read in the $x$ basis → 2.

### Unit `f6-growth` — Inner products factor; the memory wall

**`f6-growth:b1` [L]** (inner products factor; D5)
- **G:** "Overlaps of product states factor too: $\langle a \otimes b | c \otimes d\rangle = \langle a|c\rangle\langle b|d\rangle$. So a product of two unit-length states is itself unit length. The joint inner product is just the two separate overlaps multiplied."
- **F:** "On $V \otimes W$ the inner product is $\langle a \otimes b | c \otimes d\rangle = \langle a|c\rangle\langle b|d\rangle$, extended bilinearly (Axler 9D p. 376; D5). Hence $\||a\rangle \otimes |b\rangle\| = \||a\rangle\|\,\||b\rangle\|$: a product of normalized states is normalized."
- **Cap:** G "$\langle a{\otimes}b|c{\otimes}d\rangle = \langle a|c\rangle\langle b|d\rangle$" · F "$\||a\rangle \otimes |b\rangle\| = \||a\rangle\|\,\||b\rangle\|$"
- **Stage:** `split( amp({ket:'+'}, {}) / amp({ket:'+0'}, {}) )` (both states unit length).
- **Derivation:** D5 (§2).
- **Claims:** `f6ProdNorm` — `norm(kron(KET['+x'], KET['-x']))` → 1 · `f6InnerFactor` — `inner(kron(a,b), kron(c,d))` vs `inner(a,c)*inner(b,d)` → equal.

**`f6-growth:b2` [L]** (dimensions multiply)
- **G:** "Because each joint basis state pairs one from each system, the dimensions multiply: $\dim(V \otimes W) = \dim V \cdot \dim W$. A basis of the pair is every first basis vector tensored with every second. Two qubits: $2 \times 2 = 4$ basis states."
- **F:** "$\{e_j \otimes f_k\}$ is a basis of $V \otimes W$, so $\dim(V \otimes W) = \dim V \cdot \dim W$ (Axler 9.73, p. 374). For $n$ qubits, $\dim = 2^n$: the register's amplitude count."
- **Cap:** G "two qubits: $2 \times 2 = 4$ basis states" · F "$\{e_j \otimes f_k\}$, $\dim = mn$"
- **Stage:** `mx(kron(out('0'), out('0')), {blocks:2})` (a $4\times4$ built from $2\times2$ blocks).
- **Claims:** `f6DimRule` → 4 · `f6BasisCount` — `2 ** 3` → 8.

**`f6-growth:b3` [B] · notation beat, `introduces: ['qc-register']`** (the exponential memory wall)
- **G:** "A [[qc-register|register]] of $n$ qubits needs $2^n$ amplitudes. That grows fast: at $16$ bytes each, $30$ qubits need $16$ gigabytes, and $50$ qubits need $16$ petabytes — more than any computer holds. This wall is why quantum systems are hard to simulate."
- **F:** "An $n$-qubit [[qc-register|register]] is a unit vector in $\mathbb C^{2^n}$; storing it is $2^n \times 16$ bytes. $n = 30 \Rightarrow 16$ GiB; $n = 50 \Rightarrow 16$ PiB (Bergou §3.1, the exponential growth). A general state needs $2 \cdot 2^n - 2$ real parameters, against $2n$ for a product (engine `paramCount`)."
- **Cap:** G "$30$ qubits: $16$ GiB; $50$ qubits: $16$ PiB" · F "general $2\cdot2^n - 2$ vs product $2n$ parameters"
- **Stage:** `amp({ket:'00000'}, {})` (five qubits, 32 bars — the stage cap; the $2^n$ growth annotated).
- **Refs:** Bergou §3.1, p. 31.
- **Claims:** `f6Mem30` — `2 ** 30 * 16 / 2 ** 30` → 16 (GiB) · `f6Mem50` — `2 ** 50 * 16 / 2 ** 50` → 16 (PiB) · `f6Params10` — `paramCount(10)` → general 2046, product 20.

**`f6-growth:b4` [C]** (how rare are product states?)
- **Q G:** "At ten qubits, a general state needs about $2000$ numbers, a product only $20$. Are most states products?"
- **Q F:** "What fraction of the parameter count of an $n$-qubit state does a product state use?"
- **Reveal G:** "No — almost none are. A product uses $20$ parameters out of $2046$: about $1\%$. Nearly every state of ten qubits is entangled. Product states are a vanishing sliver of the whole space, which is where quantum power lives."
- **Reveal F:** "A product uses $2n$ real parameters, a general state $2\cdot2^n - 2$ (engine `paramCount`); the ratio $2n/(2\cdot2^n - 2) \to 0$. At $n = 10$: $20/2046 \approx 1\%$. Entanglement is generic, not exceptional."
- **Reveal cap:** G/F "$n = 10$: product $20$ of $2046$ parameters ($\approx 1\%$)"
- **Stage:** question `tq('++', {arrows:'reduced'})` (a product, full arrows); reveal `tq('00+11', {arrows:'reduced'})` (entangled, vanished arrows).
- **Claims:** `f6Params10` → general 2046, product 20 · `f6ProdFrac` — `20 / 2046` → 0.0098.

**Beat count:** 4 + 4 + 4 + 4 + 4 = **20 beats**, 5 of them clues with reveals. Phase mix: 11 [L] · 4 [B] · 5 [C];
within every unit the order is L → B → C.

## 2. Derivations

Each step is `tex` — `why` — **view** (the shorthand above) — *viewCaption*. A step without a view inherits the previous
one in its list. Every list has ≥ 2 distinct views; every view's kind is one the unit's beats use. The last `tex` of each
list ends on the result.

**D1 · `f6-pairs:b2` · result `n` bits give `2^n` strings** (N&C §2.1.7)
- Ground (2 views):
  1. `1 \text{ bit} \to 2 \text{ strings: } 0, 1` — One bit has two values. **view** `amp({ket:'0'}, {})` · *one qubit: 2 bars*
  2. `\text{add a bit} \to \text{each string gains a } 0 \text{ or a } 1` — A new bit doubles the list.
  3. `2 \text{ bits} \to 4,\quad n \text{ bits} \to 2^n` — Doubling $n$ times. **view** `amp({ket:'00'}, {})` · *two qubits: 4 bars*
- Formal (2 views):
  1. `|\{0, 1\}^n| = 2^n` — the strings are the functions $\{0,\ldots,n-1\} \to \{0, 1\}$ (N&C §2.1.7). **view** `amp({ket:'0'}, {})`
  2. `n \text{ bits} \to 2^n \text{ basis states}` — one amplitude per string. **view** `amp({ket:'00'}, {})`
- Check: `f6Strings`, `f6TwoQDim`.

**D2 · `f6-kron:b1` · result `(a_0|0\rangle + a_1|1\rangle) \otimes (b_0|0\rangle + b_1|1\rangle) = \sum_{ab} a_a b_b|ab\rangle`** (Axler 9.72)
- Ground (3 views):
  1. `(a_0|0\rangle + a_1|1\rangle) \otimes (b_0|0\rangle + b_1|1\rangle)` — Two single-qubit lists to combine. **view** `split( amp({ket:'+'}, {}) / amp({ket:'0'}, {}) )` · *the two factors*
  2. `= a_0|0\rangle \otimes (b_0|0\rangle + b_1|1\rangle) + a_1|1\rangle \otimes (\ldots)` — Distribute the first bracket over the second.
  3. `= a_0 b_0|00\rangle + a_0 b_1|01\rangle + a_1 b_0|10\rangle + a_1 b_1|11\rangle` — $\otimes$ is bilinear: pull scalars out, $|a\rangle \otimes |b\rangle = |ab\rangle$.
  4. `(\psi \otimes \varphi)_{ab} = a_a b_b` — Every amplitude is a product. **view** `amp({ket:'+0'}, {})` · *$|+0\rangle$: four product amplitudes*
- Formal (2 views):
  1. `(\psi \otimes \varphi)_{ab} = \psi_a \varphi_b` — bilinearity of $\otimes$ (Axler 9.72). **view** `split( amp({ket:'+'}, {}) / amp({ket:'0'}, {}) )`
  2. `|+\rangle \otimes |0\rangle = \tfrac1{\sqrt2}(|00\rangle + |10\rangle)` — the worked case. **view** `amp({ket:'+0'}, {})`
- Check: `f6PlusZero`, `f6PlusMinus`.

**D3 · `f6-product-or-not:b1` · result product `\Leftrightarrow \det C = c_{00}c_{11} - c_{01}c_{10} = 0`** (N&C §2.1.7; ⚑ close to Bergou P3.6)
- Ground (3 views):
  1. `\text{product} \Rightarrow c_{ab} = \psi_a \varphi_b` — If $|\psi\rangle \otimes |\varphi\rangle$, each amplitude factors (D2). **view** `mx(coef('++'), {svd:true})` · *a product: one Schmidt bar*
  2. `\det C = \psi_0\varphi_0 \cdot \psi_1\varphi_1 - \psi_0\varphi_1 \cdot \psi_1\varphi_0 = 0` — Write out the determinant; the two terms are equal.
  3. `\det C = 0 \Rightarrow \text{product}` — Conversely, if $\det C = 0$ the rows are proportional, so $c_{ab} = \psi_a\varphi_b$ for some $\psi, \varphi$.
  4. `\text{product} \Leftrightarrow \det C = 0` — Both directions; otherwise the state is entangled. **view** `mx(coef('00+11'), {svd:true})` · *entangled: two bars, $\det C \ne 0$*
- Formal (2 views):
  1. `C = [c_{ab}];\ \text{rank-1} \Leftrightarrow C = \psi\varphi^\top \Leftrightarrow \det C = 0` — a $2\times2$ matrix is rank 1 iff its determinant vanishes (N&C §2.1.7). **view** `mx(coef('++'), {svd:true})`
  2. `\text{product} \Leftrightarrow \mathrm{rank}\,C = 1` — the Schmidt rank; rank 2 is entangled. **view** `mx(coef('00+11'), {svd:true})`
- Check: `f6ProdDet`, `f6BellDet`, `f6BellSchmidt`.

**D4 · `f6-operator:b2` · result `(A \otimes B)(|u\rangle \otimes |v\rangle) = A|u\rangle \otimes B|v\rangle`** (Axler 9D p. 378)
- Ground (3 views):
  1. `(A \otimes B)_{(aa'),(bb')} = A_{ab}B_{a'b'}` — The Kronecker entries (b1). **view** `mx(pa('XI'), {blocks:2})` · *$X \otimes I$ as blocks*
  2. `[(A \otimes B)(u \otimes v)]_{aa'} = \sum_{bb'} A_{ab}B_{a'b'}\,u_b v_{b'}` — Apply the big matrix to the product vector.
  3. `= \big(\sum_b A_{ab}u_b\big)\big(\sum_{b'} B_{a'b'}v_{b'}\big) = (Au)_a (Bv)_{a'}` — The double sum splits into two single sums.
  4. `(A \otimes B)(u \otimes v) = Au \otimes Bv` — So each machine acts on its own factor. **view** `amp({ket:'11'}, {})` · *$(X \otimes I)|01\rangle = |11\rangle$*
- Formal (2 views):
  1. `[(A \otimes B)(u \otimes v)]_{aa'} = (Au)_a(Bv)_{a'}` — the sum factors (Axler 9D p. 378). **view** `mx(pa('XI'), {blocks:2})`
  2. `(A \otimes B)(u \otimes v) = Au \otimes Bv` — extended bilinearly to all states. **view** `amp({ket:'11'}, {})`
- Check: `f6XI`, `f6XIon01`.

**D5 · `f6-growth:b1` · result `\langle a \otimes b | c \otimes d\rangle = \langle a|c\rangle\langle b|d\rangle`** (Axler 9D p. 376)
- Ground (2 views):
  1. `\langle a \otimes b | c \otimes d\rangle = \sum_{jk}(a_j b_k)^*(c_j d_k)` — Write the joint overlap over the product basis. **view** `amp({ket:'+0'}, {})` · *the product state's amplitudes*
  2. `= \big(\sum_j a_j^* c_j\big)\big(\sum_k b_k^* d_k\big) = \langle a|c\rangle\langle b|d\rangle` — The double sum factors into the two separate overlaps.
  3. `\|a \otimes b\|^2 = \langle a|a\rangle\langle b|b\rangle = 1` — With $c = a$, $d = b$: a product of unit states is unit length. **view** `split( amp({ket:'+'}, {}) / amp({ket:'+0'}, {}) )` · *both normalized*
- Formal (2 views):
  1. `\langle a \otimes b | c \otimes d\rangle = \langle a|c\rangle\langle b|d\rangle` — the inner product on $V \otimes W$ (Axler 9D p. 376). **view** `amp({ket:'+0'}, {})`
  2. `\|a \otimes b\| = \|a\|\,\|b\|` — a product of normalized states is normalized. **view** `split( amp({ket:'+'}, {}) / amp({ket:'+0'}, {}) )`
- Check: `f6ProdNorm`, `f6InnerFactor`.

## 3. Try-it widget per unit

Widgets reuse the stage kinds' own engine calls.

| Unit | Widget spec | Why this one |
|---|---|---|
| `f6-pairs` | `{kind:'amplitudes', props:{mode:'register', qubits:2}}` | Add/remove a qubit; watch the bar count double (b1, b4). |
| `f6-kron` | `{kind:'amplitudes', props:{mode:'kron', a:'+', b:'0'}}` | Pick two single-qubit states; see the four product amplitudes build (b1–b3). |
| `f6-operator` | `{kind:'matrix', props:{mode:'kron', a:'X', b:'I'}}` | Pick two gates; watch the block table $A \otimes B$ assemble and act (b1–b3). |
| `f6-product-or-not` | `{kind:'two-qubit', props:{mode:'family', family:'cos-sin', thetaDeg:0}}` | Slide $\theta$ from $0^\circ$ (product) to $45^\circ$ (max entangled); the reduced arrows shrink (b1–b3). |
| `f6-growth` | `{kind:'amplitudes', props:{mode:'growth', qubits:1}}` | Raise $n$; the amplitude count $2^n$ and the memory estimate climb (b2–b3). |

**Try this** (both tracks; F wording in brackets):
- `f6-pairs`: (1) Two qubits: count 4 bars. (2) Add a third: now 8. (3) Label the index-2 bar. [Big-endian: $|10\rangle$.]
- `f6-kron`: (1) $|+\rangle \otimes |0\rangle$: read $(0.707, 0, 0.707, 0)$. (2) Swap to $|0\rangle \otimes |+\rangle$. (3) $|+\rangle \otimes |-\rangle$: find the signs. [Each $\pm\tfrac12$.]
- `f6-operator`: (1) $X \otimes I$ on $|01\rangle$: lands on $|11\rangle$. (2) $I \otimes X$ instead. (3) $Z \otimes Z$. [A diagonal block table.]
- `f6-product-or-not`: (1) $\theta = 0^\circ$: a product, full arrows. (2) $\theta = 45^\circ$: Bell, arrows gone. (3) Find $\det C$ at each. [$0$ then $\tfrac12$.]
- `f6-growth`: (1) $n = 2$: 4 numbers. (2) $n = 10$: 1024. (3) $n = 30$: 16 GiB. [The wall.]

## 4. Challenges per unit

Format: tier · kind · id. Numbers computed in `F6.values.ts` with the named engine call; tolerance 0.005 unless stated,
0 for exact integers. **Homework:** the map assigns none of F6, so every walkthrough is full.

### `f6-pairs`
1. **warm-up · numeric · `f6-pa-dim`** — "How many basis states does a three-qubit register have?"
   - Answer: **8** = `2 ** 3`.
   - Hints: (1) Each qubit doubles the count. (2) $2 \times 2 \times 2$. (3) $2^3$.
   - Walkthrough: $2^3 = 8$ basis states, $|000\rangle$ to $|111\rangle$.
2. **core · numeric · `f6-pa-index`** — "In the big-endian order, what index is $|110\rangle$?"
   - Answer: **6** = `indexOfBits('110')`.
   - Hints: (1) Read the bits as a binary number, first qubit most significant. (2) $1\cdot4 + 1\cdot2 + 0\cdot1$. (3) $4 + 2$.
   - Walkthrough: $|110\rangle \mapsto 6$.
3. **stretch · numeric · `f6-pa-ten`** — "How many amplitudes describe a ten-qubit register?"
   - Answer: **1024** = `2 ** 10`.
   - Hints: (1) Dimensions multiply. (2) $2^{10}$. (3) Not $2 \times 10 = 20$.
   - Walkthrough: $2^{10} = 1024$, far more than the $20$ that adding would give.

### `f6-kron`
1. **warm-up · numeric · `f6-k-first`** — "What is the first amplitude of $|+\rangle \otimes |0\rangle$ (to 3 d.p.)?"
   - Answer: **0.707** = `kron(KET['+x'], KET['+z'])[0].re`.
   - Hints: (1) Multiply the two first amplitudes. (2) $0.707 \times 1$. (3) $1/\sqrt2$.
   - Walkthrough: $c_{00} = 0.707 \times 1 = 0.707$.
2. **core · choice · `f6-k-which`** — "Which state is $|+\rangle \otimes |-\rangle$?"
   - Options: $(0.5, 0.5, 0.5, 0.5)$ · **$(0.5, -0.5, 0.5, -0.5)$** ✓ · $(0.707, 0, 0, 0.707)$ · $(0.5, 0.5, -0.5, -0.5)$.
   - Check: `kron(KET['+x'], KET['-x'])` → (0.5, −0.5, 0.5, −0.5).
   - Hints: (1) Every amplitude is a product. (2) $|-\rangle = (0.707, -0.707)$. (3) The minus rides on the second factor.
   - Walkthrough: $(0.707)(\pm0.707) = \pm0.5$; the $b = 1$ slots get the minus.
3. **stretch · numeric · `f6-k-order`** — "What index does $|0\rangle \otimes |1\rangle$ occupy?"
   - Answer: **1** = `indexOfBits('01')`.
   - Hints: (1) $|0\rangle \otimes |1\rangle = |01\rangle$. (2) First qubit 0, second 1. (3) $0\cdot2 + 1$.
   - Walkthrough: $|01\rangle \mapsto 1$ (not $|10\rangle \mapsto 2$: order matters).

### `f6-operator`
1. **warm-up · numeric · `f6-o-dim`** — "$A$ and $B$ are both $2 \times 2$. How big is $A \otimes B$?"
   - Answer: **4** = the side `2 * 2` (`kronM(A,B).length`).
   - Hints: (1) Sizes multiply. (2) $2 \times 2$. (3) A $4 \times 4$ table.
   - Walkthrough: $A \otimes B$ is $4 \times 4$.
2. **core · numeric · `f6-o-act`** — "$(X \otimes I)|01\rangle$ lands on which index?"
   - Answer: **3** = `indexOfBits('11')` (the result $|11\rangle$).
   - Hints: (1) $X$ flips the first qubit, $I$ leaves the second. (2) $|01\rangle \to |11\rangle$. (3) $|11\rangle$ is index 3.
   - Walkthrough: $X|0\rangle \otimes I|1\rangle = |1\rangle \otimes |1\rangle = |11\rangle$, index 3.
3. **core · choice · `f6-o-local`** — "Which operator changes only the second qubit?"
   - Options: $X \otimes I$ · **$I \otimes X$** ✓ · $X \otimes X$ · $Z \otimes I$.
   - Check: `kronM(I2, X)` acts as identity on qubit 1.
   - Hints: (1) The $I$ factor does nothing. (2) Which factor sits in the second slot? (3) $I \otimes (\cdot)$ touches qubit 2.
   - Walkthrough: $I \otimes X$ leaves qubit 1 and flips qubit 2.

### `f6-product-or-not`
1. **warm-up · numeric · `f6-pr-det-prod`** — "For $|+{+}\rangle$, what is $\det C$ of its coefficient matrix?"
   - Answer: **0** = `detN(coefMatrix(ket('++')))`.
   - Hints: (1) All four amplitudes are $\tfrac12$. (2) $\tfrac14 - \tfrac14$. (3) Zero means a product.
   - Walkthrough: $\det C = 0$, so $|+{+}\rangle$ is a product.
2. **core · numeric · `f6-pr-det-bell`** — "For the Bell state $(|00\rangle + |11\rangle)/\sqrt2$, what is $\det C$?"
   - Answer: **0.5** = `detN(coefMatrix(bell('00+11')))`.
   - Hints: (1) $C = \tfrac1{\sqrt2}\begin{pmatrix}1 & 0\\ 0 & 1\end{pmatrix}$. (2) $\det = \tfrac12 \cdot \tfrac12 \cdot ... $ no — $\tfrac1{\sqrt2}\cdot\tfrac1{\sqrt2}$. (3) $\tfrac12 - 0$.
   - Walkthrough: $\det C = \tfrac12 \ne 0$: entangled.
3. **core · choice · `f6-pr-which`** — "Which two-qubit state is entangled?"
   - Options: $|00\rangle$ · $|+{+}\rangle$ · **$(|01\rangle + |10\rangle)/\sqrt2$** ✓ · $|0\rangle \otimes |-\rangle$.
   - Check: `isProduct(bell('01+10'))` → false; the others are products.
   - Hints: (1) Can it be written as one $\otimes$ one? (2) Compute $\det C$. (3) For $(|01\rangle + |10\rangle)/\sqrt2$, $C = \tfrac1{\sqrt2}\begin{pmatrix}0 & 1\\ 1 & 0\end{pmatrix}$.
   - Walkthrough: $\det C = -\tfrac12 \ne 0$: entangled (the $\Psi^+$ Bell state).

### `f6-growth`
1. **warm-up · numeric · `f6-g-norm`** — "What is the length of $|+\rangle \otimes |-\rangle$?"
   - Answer: **1** = `norm(kron(KET['+x'], KET['-x']))`.
   - Hints: (1) Lengths multiply. (2) $1 \times 1$. (3) A product of unit states is unit length.
   - Walkthrough: $\|a \otimes b\| = \|a\|\,\|b\| = 1$.
2. **core · numeric · `f6-g-mem`** — "How many gigabytes to store a 30-qubit register (16 bytes per amplitude)?"
   - Answer: **16** = `2 ** 30 * 16 / 2 ** 30`.
   - Hints: (1) $2^{30}$ amplitudes. (2) $\times 16$ bytes. (3) $2^{30}$ bytes is a GiB.
   - Walkthrough: $2^{30} \times 16 = 16$ GiB.
3. **stretch · numeric · `f6-g-params`** — "A ten-qubit product state uses how many real parameters?"
   - Answer: **20** = `paramCount(10).product`.
   - Hints: (1) Each qubit is a point on a Bloch sphere. (2) 2 parameters each. (3) $2 \times 10$.
   - Walkthrough: $2n = 20$, against $2\cdot2^{10} - 2 = 2046$ for a general state.

## 4. Challenges per unit
<!-- PENDING -->

## 5. Glossary terms new in F6
<!-- PENDING -->

## 6. Review card per unit (both tracks)
<!-- PENDING -->

## 7. Symbol-before-use tables
<!-- PENDING -->

## 8. Errata
<!-- PENDING -->

## 9. Engine gaps and stage-contract gaps
<!-- PENDING -->

## 10. Media
<!-- PENDING -->

## 11. Hooks
<!-- PENDING -->

## 12. Questions for the judge
<!-- PENDING -->
