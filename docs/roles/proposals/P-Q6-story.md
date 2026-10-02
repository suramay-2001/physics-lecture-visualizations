# P-Q6-story — Q6 "Two qubits: products, entanglement and the Bell basis" (role P, Physics 709)

Proposal only. Nothing under `app/` is modified. Format: `P-Q5-story.md` (two tracks; the 13 sections of
`skills/03-chapter-plan`), plus the two standing rules of 2026-10-02: every derivation list, in both tracks, steps the
stage through ≥ 2 distinct views (`DerivStep.view`, `viewCaption`), and every new space or notation gets exactly one
notation beat (`Beat.introduces`, `GlossEntry.introduces`). Map entry: `P-709-remap-L1L7.md` §2 Q6, §4 rows Q6 D1–D13
and HW2, §5, §6. Rulings: `qc709-remap.md` (#1, #6, #8, #9, #12), `qc709-Q4Q5.md`, `homework-status.md`. Planned
together with `P-Q7-story.md`, which uses this chapter's Pauli strings and parities.

**Sources read.**
- Notes L5 pp. 21–26 and L6 pp. 27–29 (text; Fig. 7 from its caption and the worked lines under it).
- HW2 P1(a)–(e) and P2(a)–(c). P2(d) (Tr₂ of each Bell state) is Q9's.
- Cited as the re-map gives them (headings and equations checked, not re-read): Bergou Eqs. 1.3–1.4 p. 2; §3.1 Eq. 3.4,
  pp. 31–32 (Bell names, Φ and Ψ swapped); §3.4 p. 37 (dense coding reads out in the Bell basis; Q11 owns it). N&C
  §1.3.6 p. 25 (Fig. 1.12, the β_xy table); §2.1.7 pp. 71–74 (tensor products); §10.5.1 p. 454 (XX and ZZ stabilize the
  EPR pair). Axler 9D p. 370 (a Formal aside only).
- Ownership (re-map §2.2): Q4 owns ⊗ on kets, ℂ²⊗ℂ², registers, CNOT, CZ and `qc-bell-state`. Q3 owns projectors,
  commutators and compatible observables. Q6 owns operator ⊗, d₁d₂, product and entangled states, the parameter count,
  the factoring test, the Bell basis, the Bell measurement, Π_xy, parities and the stabilizer notation.
- Homework: HW2 is submitted (`homework-status.md`, 2026-10-02). P1 and P2(a)–(c) are worked in full here (ruling 12).

**Evidence.** Every number was computed twice, for both chapters at once.
- The app's engine on main (`q67plan-engine.ts`, scratchpad, bundled with rolldown). E1 is in build, so each E1 call is
  stood in for by the primitive it will wrap: `bellAmplitudes` as ⟨β_xy|ψ⟩, `pauliEigenvalue` as Pψ = ±ψ, `pauliMul` from
  the matrix product, `heisenberg` as `cliffordConj(U†, s)`, `localBasisProbs` by rotating each qubit with H or HS†, and
  `weightStats` by counting.
- An independent numpy route (`q67plan-numpy.py`): Bell states from the notes' formula (2.4); CNOT as the projector sum
  |0⟩⟨0|⊗1 + |1⟩⟨1|⊗X; the block rule (2.1) by hand; ⟨A⊗B⟩ from single-qubit factors; outcome chances by enumerating
  product bras; Pauli strings identified by trace inner products; Mermin's cards by `itertools`.
- Result (`q67plan-compare.py`): 729 numbers under 149 keys agree to 6 decimals (worst difference 0), plus two numpy-only
  checks (UM̂U† = 2n̂₁ + n̂₂ exactly; (1 + s)/4 for all 64 GHZ runs). The numpy file runs byte-identically twice.

**Conventions** (Q4's and Q5's, plus these).
- **Qubits.** Engine q0 = the notes' qubit 1 = the top wire = the left tensor factor. Circuits carry `wires:['1','2']`.
  An operator on one qubit: Ground $X_1$, Formal $\hat\sigma_{x1} = X\otimes I$ (the notes' symbol).
- **Pauli strings.** Until `q6-tensor:b3` both tracks write $X_1X_2$; that beat fixes "$XZ$ means $X\otimes Z$, one
  letter per qubit, left to right", and both forms are used after it. A product of two one-qubit matrices is always
  written with a dot or named as a product ($X\cdot Z$), never as bare juxtaposition (§12 Q5).
- **Bell names (ruling 9).** Φ±, Ψ± are primary. First use: "$\Phi^+$ (notes, N&C: $\beta_{00}$; Bergou: $\Psi_+$)".
  β_xy appears from its notation beat `q6-bell-basis:b2`, and is used in the Bell-measurement unit and the HW2 P2 beats
  only. Map: Φ⁺ = β₀₀, Ψ⁺ = β₀₁, Φ⁻ = β₁₀, Ψ⁻ = β₁₁. Engine sources keep content names (`{bell:'Phi+'}`).
- **Units.** ħ = 1 in the engine and S = σ/2; the UI appends ħ (the S_x^tot entries).
- **Phases.** [L] notes; [B] a second source (Bergou, N&C, or the HW2 sheet, cited "HW2 P1(a)"); [C] clue.
- **Numbers.** Every number in a G, F or caption string below is rendered from its listed claim with `d(V.key, n)`; the
  plan prints the value for review only. Every answer key is `V.key`, never a literal. Amplitudes print as signed
  decimals (0.707) and chances as decimals or fractions (0.25); an amplitude is never a percentage. The chapter's only
  percent is the parameter fraction 0.98 %, a ratio of counts.
- **Text.** All inline math is TeX inside `$…$`; no TeX command outside `$…$` (ruling, Q2–Q5 reviews). No plan ids
  (D1, §5, b3) in learner text: cross-references read "Unit 6.4", "Chapter Q7". Units: 6.1 `q6-many`, 6.2 `q6-tensor`,
  6.3 `q6-entangled`, 6.4 `q6-bell-basis`, 6.5 `q6-bell-circuit`, 6.6 `q6-parities`.
- **Claim keys** `q6…` in `Q6.values.ts`, as `Q5.values.ts`.

**Stage shorthand.** Each form expands to exactly one `StageState` (a derivation `view` is always one state; `split` is
for beat stages only).

| Shorthand | Expands to | Needs |
|---|---|---|
| `amp(S, f)` | `{kind:'amplitudes', state:S, ...f}`; S is `{ket:'0+'}`, `{bell:'Phi+'}` or `{circuit:C, upTo:k}` | — (`inBasis` v2) |
| `circ(C, k, f)` | `{kind:'circuit', circuit:C, upTo:k, ...f}` | — (`observable` v2) |
| `mx(src, f)` | `{kind:'matrix', source:src, labels:'kets', values:'exact', ...f}` | v1 (sources below) |
| `tq(S, f)` | `{kind:'two-qubit', source:{ket:S}, labels:'q1-q2', arrows:'reduced', grid:'T', ...f}` | two-qubit |
| `split(A / B)` | `{layout:'split', top:A, bottom:B}` | — |

| Matrix source | Expands to | Needs |
|---|---|---|
| `pa('X')`, `pa('XZ')` | `{pauli:'X'}`; two letters: `{kron:[{pauli:'X'},{pauli:'Z'}]}` | v1 |
| `G('CNOT')` | `{gate:{name:'CNOT'}}` (also `'CZ'`, `'H'`) | v1 |
| `H1` | `{gate:{name:'H'}, qubits:2, targets:[0]}` = H⊗I | v1 |
| `prod(A, B, …)` | `{product:[A, B, …]}` = A·B·… as written (the rightmost acts first) | matrix-v2 |
| `adj(A)` | `{adjoint:A}` | matrix-v2 |
| `lin([c, A], …)` | `{lin:[{c, src:A}, …]}`, c ∈ {'1', '-1', '1/2', '-1/2'} | matrix-v2 |
| `BC` | `prod(G('CNOT'), H1)` = CNOT(H⊗I): its columns are β₀₀, β₀₁, β₁₀, β₁₁ | matrix-v2 |
| `UB` | `prod(H1, G('CNOT'))` = (H⊗I)CNOT, the U of Fig. 7 | matrix-v2 |
| fields | `basis:'bell'` (shows B†MB, rows β_xy), `tableau:[…]` | matrix-v2 |

"needs: matrix-v2" means the re-map's §6.2 batch (matrix v2 plus the `amplitudes` and `circuit` fields), one agent.

**Circuits** (gate shorthand as Q5: `g(H,0)`, `cx(0,1)` = X on wire 1 with `controls:[0]`, `m(q,b)`).

| Name | qubits · init | columns | state after column k |
|---|---|---|---|
| `C_PROD` (Q4) | 2 · `'00'` | `[g(Ry,0,π/3), g(H,1)]` | k = 1: ψ₁⊗\|+⟩ with ψ₁ = 0.866\|0⟩ + 0.5\|1⟩ |
| `C_COPY` (Q4) | 2 · `'00'` | `[g(Ry,0,π/3)] [cx(0,1)]` | k = 2: (√3\|00⟩ + \|11⟩)/2, HW2's Ψ₂ |
| `C_BELL` (Q4) | 2 · `'00'` | `[g(H,0)] [cx(0,1)]` | k = 1: (\|00⟩ + \|10⟩)/√2; k = 2: Φ⁺ |
| `C_XZ` | 2 · `'01'` | `[g(X,0), g(Z,1)]` | k = 1: −\|11⟩ |
| `C_CZPP` | 2 · `'++'` | `[CZ: g(Z,1) controls [0]]` | k = 1: (\|00⟩ + \|01⟩ + \|10⟩ − \|11⟩)/2 |
| `C_PREP(xy)` | 2 · xy | `[g(H,0)] [cx(0,1)]` | k = 2: β_xy (Fig. 7 run backwards, p. 27) |
| `C_BM(xy)` | 2 · xy, clbits 2 | `C_PREP(xy)` then `[cx(0,1)] [g(H,0)] [m(0,0), m(1,1)]` | k = 2: β_xy; k = 3: (\|0⟩ + (−1)^x\|1⟩)\|y⟩/√2; k = 4: \|xy⟩ |
| `C_F7('0+')` | 2 · `'0+'`, clbits 2 | `[cx(0,1)] [g(H,0)] [m(0,0), m(1,1)]` | Fig. 7 on HW2's Ψ₁ = \|0⟩\|+⟩ |
| `C_F7C` | 2 · `'00'`, clbits 2 | `C_COPY` then `[cx(0,1)] [g(H,0)] [m(0,0), m(1,1)]` | k = 2: Ψ₂; k = 4: its Bell amplitudes |
| `C_U` | 2 · `'00'` | `[cx(0,1)] [g(H,0)]` | Fig. 7 without meters (carries the `observable`) |

All circuits carry `wires:['1','2']`. Every view below stops at k ≤ 4, before a meter, so no view needs `outcomes`.

## 0. Chapter map

Q6 answers the map's question: **"Two qubits hold four amplitudes, not two pairs: what fits in the extra room, and how do
we read it?"** It closes Part II.

| # | id | Title (≤ 8 words) | Driving question | Sources | 448 bridges | Link-backs |
|---|---|---|---|---|---|---|
| 1 | `q6-many` | Two qubits: the numbers multiply | Why does a second qubit double the amplitudes instead of adding two? | notes L5 pp. 21–22; Bergou Eqs. 1.3–1.4 p. 2; N&C §2.1.7 p. 71 | — | Q4 `q4-registers` (⊗ on kets, ℂ²⊗ℂ²) |
| 2 | `q6-tensor` | Operators on pairs: the tensor product | How does an operator on one qubit act on a pair, and what do a product state's averages do? | notes L5 pp. 22–23, Eq. 2.1; N&C §2.1.7 pp. 72–74; Axler 9D p. 370 (F aside) | — | Q3 Pauli matrices; Q4 `q4-cnot` (CNOT is no A⊗B) |
| 3 | `q6-entangled` | States that will not factor | Most two-qubit states are not products: how many are, and how do we test one? | notes L5 p. 22 | — | Q4 `q4-registers` |
| 4 | `q6-bell-basis` | The Bell basis: four entangled states | Can a whole basis be entangled, and what do its four states share? | notes L5 pp. 25–26, Eqs. 2.3–2.4; Bergou §3.1 Eq. 3.4; N&C §1.3.6 p. 25; HW2 P1 | `l2-three-bases` | Q4 `q4-circuits` (Φ⁺); Q2 spin-1 (HW1 P5) |
| 5 | `q6-bell-circuit` | Reading and writing Bell states | How do two ordinary detectors read a Bell state, and how is one made? | notes L5 p. 26, Fig. 7; L6 p. 27, Eq. 2.5; N&C Fig. 1.12 p. 25; Bergou §3.4 p. 37; HW2 P2(a), (c) | `l4-projectors` | Q3 projectors; Q4 `q4-circuits` |
| 6 | `q6-parities` | Two parities: what the detectors really ask | Which two-qubit quantities does a Bell measurement measure, and why do they fit together? | notes L6 pp. 27–29, Eqs. 2.6–2.8; N&C §10.5.1 p. 454; HW2 P2(b) | `l7-compatible` | Q3 `q3-uncertainty` (compatible); Q4 H, CNOT |

**Two moves against the map** (§12 Q1): ⟨A⊗B⟩ = ⟨A⟩⟨B⟩ and the correlation grid move from `q6-many` to `q6-tensor`, so
A⊗B is defined before it is used; HW2 P1(e) (S_x^tot) moves from `q6-tensor` to `q6-bell-basis`, because its basis needs
the triplet and the singlet.

**Outcomes** (Ground wording):
- Say why two qubits carry four amplitudes and N qubits carry 2^N, against N bits for N coins.
- Build A⊗B as a block matrix, and use A⊗I for an operator that acts on one qubit.
- Show that a product state's averages multiply, and read a pair's two arrows and its grid.
- Count parameters (6 against 4), and test a two-qubit state for a product with its coefficient grid.
- Write the four Bell states, check that they are orthonormal, and name the triplet and the singlet.
- Run the Bell-measurement circuit forwards to read a Bell state, and backwards to make one.
- Explain why the circuit measures the two commuting parities XX and ZZ, and what a stabilizer is.

**Prerequisites** (concepts): Q4 `qc-registers`, `qc-cnot`, `qc-circuits`, `qc-readout`, `qc-one-qubit-gates`; Q3
`qc-born-projector`, `qc-spin-operators`, `qc-observables`, `qc-uncertainty` (compatible observables, notes L4 pp. 18–19);
Q2 `qc-x-states`. Reused glossary: `qc-tensor-product`, `qc-register`, `qc-computational-basis`, `qc-cnot`,
`qc-controlled-gate`, `qc-bell-state`, `qc-circuit`, `qc-xor` (Q4); `qc-projector`, `qc-pauli-matrices`,
`qc-expectation`, `qc-commutator`, `qc-anticommutator`, `qc-compatible`, `qc-simultaneous-eigenvector`, `qc-degenerate`,
`qc-dispersion` (Q3). 448 twins: `l7-compatible`, `l4-projectors`, `l2-three-bases`.

**Openers and films.** The Part II opener is Q4's. One Motion Canvas film is planned and deferred (§10).

## 1. Story beats per unit

Kinds per unit (a derivation `view` may use only kinds that the unit's beat stages show; checked per unit below):
`q6-many` amplitudes, matrix · `q6-tensor` matrix, circuit, amplitudes, two-qubit · `q6-entangled` amplitudes, matrix,
two-qubit · `q6-bell-basis` amplitudes, matrix, two-qubit · `q6-bell-circuit` circuit, amplitudes, matrix ·
`q6-parities` circuit, matrix, two-qubit, amplitudes. Fidelity items used: `qc-amp-engine`, `qc-amp-hue-is-phase`,
`qc-circuit-engine-state`, `qc-circuit-wires-are-time`, the `matrix` kind's items, and the `two-qubit` keys
`qc-tq-local-arrows`, `qc-tq-grid-signed`, `qc-tq-not-two-places` (re-map §6.1).

### Unit `q6-many` — Two qubits: the numbers multiply

**`q6-many:b1` [L] · notation beat, `introduces: ['qc-composite-space']`** (composition multiplies; D1)
- **G:** "A coin is one bit, and two coins are a list of two bits. Quantum parts combine differently. Qubit 1 has the basis states $|0\rangle$ and $|1\rangle$, and so does qubit 2. The pair has one basis state for every pairing: $|00\rangle$, $|01\rangle$, $|10\rangle$ and $|11\rangle$. That is $2\times2 = 4$, not $2 + 2$. In general, parts with $d_1$ and $d_2$ states make a [[qc-composite-space|joint space]] with $d_1d_2$ states."
- **F:** "If particle 1 lives in $V^{(1)}$ of dimension $d_1$ and particle 2 in $V^{(2)}$ of dimension $d_2$, the pair lives in the [[qc-composite-space|joint space]] $V^{(1)}\otimes V^{(2)}$, spanned by the $d_1d_2$ products $|i_1\rangle_1\otimes|i_2\rangle_2$ (notes p. 21). A state $|\Psi\rangle = \sum c_{i_1i_2}|i_1\rangle_1\otimes|i_2\rangle_2$ carries a $d_1\times d_2$ array of amplitudes: composition multiplies. For two qubits this is Unit 4.3's $\mathbb C^2\otimes\mathbb C^2$."
- **Cap:** G "two qubits: four bars, or a 2 × 2 grid" · F "$c_{i_1i_2}$ as a $2\times2$ array"
- **Stage:** `split( amp({ket:'++'}) / mx({coef:{ket:'++'}}) )`.
- **Claims:** `q6AmpCount` → 2, 4, 8, 1024 (n = 1, 2, 3, 10) · `q6DimSpin1` → 6.
- **Terms:** `qc-tensor-product` (Q4, link-back).

**`q6-many:b2` [L]** (N bits against 2^N amplitudes)
- **G:** "Add a third qubit and every basis state splits in two again: 8 of them. With N qubits there are $2^N$ basis strings, the same strings N coins could show. A row of coins shows one string. A quantum state carries one amplitude for every string. Thirty qubits need $2^{30}$, about 1.07 billion amplitudes: 16 GiB of memory at 16 bytes each."
- **F:** "For N particles, $|i_1, \ldots, i_N\rangle = |i_1\rangle_1\otimes\cdots\otimes|i_N\rangle_N$ and the state carries one complex amplitude per string: $2^N$ for qubits (notes p. 21). Classically one string is the state; here every string carries an amplitude. At 16 bytes per amplitude (two doubles), 30 qubits fill 16 GiB."
- **Cap:** G/F "three qubits: 8 bars, one per string" (the 16-byte figure is labelled "our estimate")
- **Stage:** `amp({ket:'+++'})`.
- **Claims:** `q6AmpCount` → 8, 1024 · `q6Amp30` → 1.07 × 10⁹ · `q6Gib30` → 16.

**`q6-many:b3` [L]** (two labs make a product state)
- **G:** "Prepare qubit 1 in $|0\rangle$ in one lab and qubit 2 in $|+\rangle$ in another. The pair is $|0\rangle\otimes|+\rangle$, the tensor product of Unit 4.3. Each qubit still has a state of its own. Such a pair is a [[qc-product-state|product state]]. Its grid of amplitudes has one row empty."
- **F:** "Independently prepared parts give $|\Psi\rangle = |\psi_1\rangle\otimes|\psi_2\rangle$, a [[qc-product-state|product state]] (notes p. 22). Each part keeps a state of its own, and the amplitude array is an outer product, $c_{i_1i_2} = a_{i_1}b_{i_2}$. Rosetta: the notes also call this separable; Chapter Q10 widens that word to mixtures."
- **Cap:** G "$|0\rangle|+\rangle$: bars of 0.707 at 00 and 01" · F "$c = ab^{\mathsf T}$"
- **Stage:** `split( amp({ket:'0+'}) / mx({coef:{ket:'0+'}}) )`.
- **Claims:** `q6ProdZX` → (0.707, 0.707, 0, 0).

**`q6-many:b4` [C]** (how much room?)
- **Q G:** "Ten coins show one string of 10 bits. How many amplitudes does a state of 10 qubits carry?"
- **Q F:** "How many complex amplitudes specify a general state of 10 qubits, against the 10 bits of a classical register?"
- **Reveal G:** "1024, one for every string of 10 bits. Each extra qubit doubles the count, while the coins need just 10 bits."
- **Reveal F:** "$2^{10} = 1024$ amplitudes against 10 bits: the classical description grows like N, the quantum one like $2^N$."
- **Reveal cap:** G/F "three qubits shown, 8 bars; ten would need 1024"
- **Stage:** question `amp({ket:'+++'})`; reveal `amp({ket:'+++'}, {mode:'probability'})`.
- **Claims:** `q6AmpCount` → 1024.

### Unit `q6-tensor` — Operators on pairs: the tensor product

**`q6-tensor:b1` [L] · notation beat, `introduces: ['qc-operator-tensor']`** (an operator on one qubit is A⊗I)
- **G:** "An operator that acts on qubit 1 alone must leave qubit 2 untouched. So on the pair it is $A\otimes I$: A in the first slot and 'do nothing' in the second. As a matrix it is a 2 × 2 array of blocks, each block an entry of A times I. Ground-up writes it $A_1$."
- **F:** "An operator on particle 1 obeys $A_1|\psi_1, \psi_2\rangle = (A_1|\psi_1\rangle)\otimes|\psi_2\rangle$, so on $V^{(1)}\otimes V^{(2)}$ it is $A_1 \to A\otimes I_2$, the [[qc-operator-tensor|tensor product of operators]] (notes p. 23). Rosetta: the notes write $\hat\sigma_{1x}$ on p. 23 and $\hat\sigma_{x1}$ from p. 27, both for $\sigma_x\otimes I$."
- **Cap:** G "$X\otimes I$: X's pattern, each 1 grown into an identity block" · F "$X\otimes I = [X_{ij}I]$"
- **Stage:** `mx(pa('XI'), {blocks:2})`.
- **Claims:** `q6XI` → rows (0,0,1,0), (0,0,0,1), (1,0,0,0), (0,1,0,0).

**`q6-tensor:b2` [L]** (the block rule; σ_x⊗σ_z; D5)
- **G:** "The same rule builds any pair of operators. To make $X\otimes Z$, take X's 2 × 2 pattern and replace each entry by that entry times the whole of Z. X has zeros on its diagonal and 1s off it. So Z appears in the two off-diagonal blocks, and zeros fill the rest."
- **F:** "For $n\times n$ A and $m\times m$ B, $A\otimes B$ is the $nm\times nm$ block matrix $[A_{ij}B]$ (notes Eq. 2.1; N&C §2.1.7). So $\sigma_x\otimes\sigma_z$ has blocks $0, \sigma_z; \sigma_z, 0$: diagonal in neither one-qubit basis, yet a product of one-qubit operators. A sum of products, like CNOT $= |0\rangle\langle0|\otimes I + |1\rangle\langle1|\otimes X$, is generally no single $A\otimes B$, which is why CNOT can entangle (notes p. 24)."
- **Cap:** G "$X\otimes Z$: Z in the off-diagonal blocks" · F "$\sigma_x\otimes\sigma_z$, Eq. 2.1"
- **Stage:** `mx(pa('XZ'), {blocks:2, highlight:[[0,2],[1,3],[2,0],[3,1]]})`.
- **Claims:** `q6XZ` → rows (0,0,1,0), (0,0,0,−1), (1,0,0,0), (0,−1,0,0) · `q6XZket` → (0, 0, 0, −1).

**`q6-tensor:b3` [L] · notation beat, `introduces: ['qc-pauli-string']`** (one letter per qubit)
- **G:** "Pauli operators on a pair get short names: one letter per qubit, left to right. $XZ$ means X on qubit 1 and Z on qubit 2, the 4 × 4 matrix $X\otimes Z$. It is not the 2 × 2 product $X\cdot Z$ of Unit 4.2. $ZZ = Z\otimes Z$ gives +1 when the two bits agree and −1 when they differ: their [[qc-parity|parity]]."
- **F:** "A [[qc-pauli-string|Pauli string]] $P_1P_2\cdots P_n$, $P_k \in \{I, X, Y, Z\}$, means $P_1\otimes P_2\otimes\cdots\otimes P_n$; the notes write $\hat\sigma_{x1}\hat\sigma_{x2}$ for $XX$. A one-qubit product is always written with a dot, $X\cdot Z$. On $|ab\rangle$, $ZZ$ returns $(-1)^{a\oplus b}$, the [[qc-parity|parity]] of the two bits."
- **Cap:** G "$ZZ$: +1 on 00 and 11, −1 on 01 and 10" · F "$Z\otimes Z = \mathrm{diag}(1, -1, -1, 1)$"
- **Stage:** `mx(pa('ZZ'), {blocks:2})`.
- **Claims:** `q6ZZ` → diagonal (1, −1, −1, 1).

**`q6-tensor:b4` [L]** (a product state's averages multiply; D2)
- **G:** "Take the product state $\psi_1\otimes|+\rangle$, with $\psi_1 = 0.866|0\rangle + 0.5|1\rangle$. Read Z on qubit 1 and X on qubit 2, and multiply the two readings. On average the product is $\langle Z_1\rangle\langle X_2\rangle = 0.5\times1 = 0.5$. The two qubits behave like two separate coins."
- **F:** "For $|\Psi\rangle = |\psi_1\rangle\otimes|\psi_2\rangle$ and A, B acting on one particle each, $\langle\Psi|A\otimes B|\Psi\rangle = \langle\psi_1|A|\psi_1\rangle\langle\psi_2|B|\psi_2\rangle$ (notes p. 22): the readings are statistically independent. Here $\langle ZX\rangle = 0.5$ and $\langle XX\rangle = 0.866$."
- **Cap:** G "$\langle Z_1X_2\rangle = 0.5\times1$" · F "$\langle ZX\rangle = \langle Z\rangle\langle X\rangle = 0.5$"
- **Stage:** `split( circ(C_PROD, 1) / amp({circuit:C_PROD, upTo:1}) )`.
- **Claims:** `q6Psi1` → (0.866, 0.5) · `q6ExpZ1` → 0.5 · `q6ExpX2` → 1 · `q6ExpZX` → 0.5 · `q6ExpX1` → 0.866 · `q6ExpXX` → 0.866.

**`q6-tensor:b5` [L] · notation beat, `introduces: ['qc-correlation-grid']`** (two arrows and a grid)
- **G:** "A pair gets its own picture. Each ball shows one qubit's arrow of averages, as in Chapter Q3. The 3 × 3 grid shows nine averages: a reading on qubit 1 times a reading on qubit 2. For a product state each cell is the first arrow's part times the second arrow's part."
- **F:** "The two-qubit picture: reduced Bloch vectors $r_{A,i} = \langle\sigma_i\otimes I\rangle$, $r_{B,j} = \langle I\otimes\sigma_j\rangle$, and the [[qc-correlation-grid|correlation grid]] $T_{ij} = \langle\sigma_i\otimes\sigma_j\rangle$. For a product state $T = r_Ar_B^{\mathsf T}$: here $r_A = (0.866, 0, 0.5)$ and $r_B = (1, 0, 0)$, so only $T_{xx}$ and $T_{zx}$ are non-zero."
- **Cap:** G "two arrows, nine cells; each cell a product of arrow parts" · F "$T = r_Ar_B^{\mathsf T}$"
- **Stage:** `tq({circuit:C_PROD, upTo:1})` — needs: two-qubit.
- **Claims:** `q6RProd` → (0.866, 0, 0.5), (1, 0, 0) · `q6GridProd` → $T_{xx}$ = 0.866, $T_{zx}$ = 0.5, others 0.
- **Fidelity:** `qc-tq-local-arrows`, `qc-tq-not-two-places`.

**`q6-tensor:b6` [C]** (a certain factor, an empty cell)
- **Q G:** "For the pair $\psi_1\otimes|+\rangle$, what is the average of $Z_1Z_2$?"
- **Q F:** "Compute $\langle ZZ\rangle$ for $\psi_1\otimes|+\rangle$."
- **Reveal G:** "Zero. The average multiplies: $\langle Z_1\rangle\langle Z_2\rangle = 0.5\times0$. Qubit 2 in $|+\rangle$ gives Z readings of +1 and −1 equally often."
- **Reveal F:** "$\langle ZZ\rangle = \langle Z\rangle_{\psi_1}\langle Z\rangle_+ = 0.5\cdot0 = 0$: the grid's $zz$ cell is empty."
- **Reveal cap:** G/F "$T_{zz} = 0.5\times0 = 0$"
- **Stage:** question `amp({circuit:C_PROD, upTo:1}, {mode:'probability'})`; reveal `tq({circuit:C_PROD, upTo:1}, {highlight:['zz']})` — needs: two-qubit.
- **Claims:** `q6ExpZ1` → 0.5 · `q6ExpZ2` → 0 · `q6ExpZZ` → 0.

### Unit `q6-entangled` — States that will not factor

**`q6-entangled:b1` [L]** (six against four; D3)
- **G:** "Count the dials. Two qubits have four complex amplitudes, which is eight real numbers. The chances must add to 1, and an overall phase changes nothing, so six numbers remain. A product state needs only two angles per qubit: four in all."
- **F:** "A general two-qubit state has 4 complex amplitudes, 8 real parameters; normalization and the global phase leave 6. A product state is a point on each of two Bloch spheres, $2 + 2 = 4$ (notes p. 22). Products form a four-parameter family inside a six-parameter space."
- **Cap:** G "8 − 2 = 6 against 2 + 2 = 4" · F "6 against 4"
- **Stage:** `split( amp({ket:'++'}, {dials:true}) / tq({ket:'++'}) )` — needs: two-qubit.
- **Claims:** `q6Param` (N = 2) → 6, 4.

**`q6-entangled:b2` [L]** (the fraction collapses)
- **G:** "With N qubits the gap explodes. A general state needs $2\cdot2^N - 2$ numbers, while a product needs $2N$. At N = 3 that is 14 against 6. At N = 10 it is 2046 against 20, about 1 in 100. States that are not products are called [[qc-entangled|entangled]], and they are the usual case."
- **F:** "In general $2\cdot2^N - 2$ real parameters against $2N$, a fraction $2N/(2^{N+1} - 2)$ that falls exponentially: $0.98\,\%$ at $N = 10$ (notes p. 22). States that cannot be written as $|\psi_1\rangle\otimes|\psi_2\rangle$ are [[qc-entangled|entangled]]; they are generic."
- **Cap:** G "three qubits: 14 numbers; a product uses 6" · F "$2N/(2^{N+1} - 2) = 0.98\,\%$ at N = 10"
- **Stage:** `amp({ket:'+++'}, {dials:true})`.
- **Claims:** `q6Param` → (14, 6, 0.4286), (2046, 20, 0.009775).

**`q6-entangled:b3` [L]** ($\Phi^+$ cannot factor; D4)
- **G:** "Try to write Unit 4.5's Bell state $\Phi^+ = (|00\rangle + |11\rangle)/\sqrt2$ as a product. A product $(a|0\rangle + b|1\rangle)(c|0\rangle + d|1\rangle)$ has amplitudes $ac$, $ad$, $bc$ and $bd$. $\Phi^+$ needs $ad = 0$ and $bc = 0$, but also $ac$ and $bd$ non-zero. No four numbers do both. Neither qubit has a state of its own, yet the pair's state is exact."
- **F:** "Suppose $\Phi^+ = (a|0\rangle + b|1\rangle)\otimes(c|0\rangle + d|1\rangle) = ac|00\rangle + ad|01\rangle + bc|10\rangle + bd|11\rangle$. Then $ad = bc = 0$, while $ac = bd = 1/\sqrt2$ forces $a, b, c, d \ne 0$: a contradiction (notes p. 22). Neither qubit of $\Phi^+$ has a state of its own, though the pair is in a definite pure state."
- **Cap:** G "$\Phi^+$: the 01 and 10 bars are empty, 00 and 11 are not" · F "$C = \tfrac1{\sqrt2}I$: two equal singular values"
- **Stage:** `split( amp({bell:'Phi+'}) / mx({coef:{bell:'Phi+'}}, {svd:true}) )`.
- **Claims:** `q6BellAmps` (Φ⁺) → (0.707, 0, 0, 0.707) · `q6SvdPhi` → 0.707, 0.707 · `q6RankPhi` → 2.

**`q6-entangled:b4` [L]** (a quick test)
- **G:** "Here is a quick test. Call the amplitudes $c_{00}$, $c_{01}$, $c_{10}$ and $c_{11}$. Put them in a 2 × 2 grid, with rows for qubit 1 and columns for qubit 2. A product's grid is $ac, ad$ over $bc, bd$, so its cross products agree. The state is a product exactly when $c_{00}c_{11} - c_{01}c_{10} = 0$."
- **F:** "Arrange $c_{i_1i_2}$ as a matrix C. A product has $C = ab^{\mathsf T}$, of rank 1, so $|\Psi\rangle$ is a product iff $\det C = c_{00}c_{11} - c_{01}c_{10} = 0$: the [[qc-factoring-test|product test]]. Equivalently C has one non-zero singular value; Chapter Q9 calls their number the Schmidt rank."
- **Cap:** G "product: test 0, one bar; $\Phi^+$: test 0.5, two equal bars" · F "$\det C$: 0 against 0.5; singular values (1, 0) against (0.707, 0.707)"
- **Stage:** `split( amp({circuit:C_PROD, upTo:1}) / mx({coef:{circuit:C_PROD, upTo:1}}, {svd:true}) )`.
- **Claims:** `q6DetProd` → 0 · `q6DetPhi` → 0.5 · `q6SvdProd` → 1, 0 · `q6SvdPhi` → 0.707, 0.707.

**`q6-entangled:b5` [C]** (one sign entangles)
- **Q G:** "Two states: $(|00\rangle + |01\rangle + |10\rangle + |11\rangle)/2$ and $(|00\rangle + |01\rangle + |10\rangle - |11\rangle)/2$. One of them is a product. Which?"
- **Q F:** "Which of $\tfrac12(|00\rangle + |01\rangle + |10\rangle \pm |11\rangle)$ is a product state?"
- **Reveal G:** "The one with +. Its test gives $\tfrac14 - \tfrac14 = 0$: it is $|+\rangle|+\rangle$. The minus sign gives $-\tfrac14 - \tfrac14 = -0.5$, so that state is entangled. A CZ acting on $|+\rangle|+\rangle$ makes it."
- **Reveal F:** "$\det C = 0$ for the + sign, $|{+}{+}\rangle$, and $-0.5$ for the − sign, which is $\mathrm{CZ}|{+}{+}\rangle$ (Unit 4.4): one sign entangles."
- **Reveal cap:** G/F "test: 0 against −0.5"
- **Stage:** question `amp({ket:'++'})`; reveal `split( amp({circuit:C_CZPP, upTo:1}) / mx({coef:{circuit:C_CZPP, upTo:1}}, {svd:true}) )`.
- **Claims:** `q6DetPP` → 0 · `q6DetCZpp` → −0.5 · `q6CZpp` → (0.5, 0.5, 0.5, −0.5).

### Unit `q6-bell-basis` — The Bell basis: four entangled states

**`q6-bell-basis:b1` [L] · notation beat, `introduces: ['qc-bell-basis']`** (a basis of entangled states)
- **G:** "The basis $|00\rangle$, $|01\rangle$, $|10\rangle$, $|11\rangle$ is made of products. A basis can also be made of four entangled states: $\Phi^\pm = (|00\rangle \pm |11\rangle)/\sqrt2$ and $\Psi^\pm = (|01\rangle \pm |10\rangle)/\sqrt2$. This is the [[qc-bell-basis|Bell basis]]. Any two-qubit state can be written in it."
- **F:** "The computational basis is a product basis. The [[qc-bell-basis|Bell basis]] $\Phi^\pm = (|00\rangle \pm |11\rangle)/\sqrt2$, $\Psi^\pm = (|01\rangle \pm |10\rangle)/\sqrt2$ is an orthonormal basis of $\mathbb C^2\otimes\mathbb C^2$ whose every member is maximally entangled (notes Eq. 2.3; N&C Eqs. 1.23–1.26). Rosetta: Bergou's Eq. 3.4 swaps the letters, calling $\Phi^+$ $\Psi_+$."
- **Cap:** G "the four Bell states are the four columns" · F "columns of $\mathrm{CNOT}(H\otimes I)$: $\Phi^+, \Psi^+, \Phi^-, \Psi^-$"
- **Stage:** `split( amp({bell:'Phi+'}) / mx(BC, {highlightCol:0}) )` — needs: matrix-v2 (fallback §9.2).
- **Claims:** `q6BellAmps` → the four columns.

**`q6-bell-basis:b2` [L] · notation beat, `introduces: ['qc-beta-xy']`** (two bits name a Bell state)
- **G:** "The notes and Nielsen and Chuang give each Bell state a two-bit name, $\beta_{xy}$. The bit y says whether the qubits agree (0) or differ (1). The bit x says whether the two terms add (0) or subtract (1). So $\Phi^+ = \beta_{00}$, $\Psi^+ = \beta_{01}$, $\Phi^- = \beta_{10}$ and $\Psi^- = \beta_{11}$."
- **F:** "$|\beta_{xy}\rangle = (|0, y\rangle + (-1)^x|1, 1\oplus y\rangle)/\sqrt2$, $x, y \in \{0, 1\}$ (notes Eq. 2.4; N&C Eq. 1.27): x fixes the relative sign, y whether the qubits agree. Hence $\Phi^+ = \beta_{00}$, $\Psi^+ = \beta_{01}$, $\Phi^- = \beta_{10}$, $\Psi^- = \beta_{11}$. Unit 6.5 reads x and y off two detectors."
- **Cap:** G "$\beta_{10} = \Phi^-$: the bits agree (y = 0), the sign flips (x = 1)" · F "column $xy = 10$ of $\mathrm{CNOT}(H\otimes I)$"
- **Stage:** `split( amp({bell:'Phi-'}) / mx(BC, {highlightCol:2}) )` — needs: matrix-v2.
- **Claims:** `q6BellAmps` (β₁₀) → (0.707, 0, 0, −0.707).

**`q6-bell-basis:b3` [L]** (orthonormal; D7)
- **G:** "The four are orthonormal. Two of them share no basis strings, like $\Phi^+$ and $\Psi^+$. Or they share both strings with opposite relative signs, like $\Phi^+$ and $\Phi^-$. Either way their overlap is 0. Each has length 1."
- **F:** "$\langle\beta_{xy}|\beta_{x'y'}\rangle = \delta_{xx'}\delta_{yy'}$ (notes p. 25): two Bell states use disjoint pairs of strings, or the same pair with opposite relative signs. So every two-qubit state expands as $|\Psi\rangle = \sum_{xy}\langle\beta_{xy}|\Psi\rangle\,|\beta_{xy}\rangle$."
- **Cap:** G/F "$\Phi^+$ against $\Phi^-$: the same bars, one sign flipped; overlap 0"
- **Stage:** `split( amp({bell:'Psi+'}) / mx(prod(adj(BC), BC)) )` — needs: matrix-v2.
- **Claims:** `q6BellGram` → 0 (largest entry of $B^\dagger B - I$) · `q6OvPhiPM` → 0.

**`q6-bell-basis:b4` [L]** (random singles, perfect pairs)
- **G:** "Read both qubits of $\Phi^+$ in the 0/1 basis. You get 00 or 11, each half the time, and never 01 or 10. Qubit 1 alone is a fair coin, yet qubit 2 always agrees with it. In the picture both arrows have length zero, while the grid's diagonal is full."
- **F:** "None of the four is a product: $\det C = \pm\tfrac12$. For $\Phi^+$, $P(00) = P(11) = \tfrac12$ and $P(01) = P(10) = 0$: each single reading is random while the pair is perfectly correlated (notes p. 25). Both reduced vectors vanish and $T = \mathrm{diag}(1, -1, 1)$; Chapter Q9 makes 'maximally entangled' precise."
- **Cap:** G "$\Phi^+$: arrows of length 0; grid $xx = +1$, $yy = -1$, $zz = +1$" · F "$r_A = r_B = 0$, $T = \mathrm{diag}(1, -1, 1)$"
- **Stage:** `split( amp({bell:'Phi+'}, {mode:'probability'}) / tq({bell:'Phi+'}) )` — needs: two-qubit.
- **Claims:** `q6PhiP` → 0.5, 0, 0, 0.5 · `q6PhiMarg` → 0.5, 0.5 · `q6DetBell` → 0.5, −0.5, −0.5, 0.5 · `q6GridBell` (Φ⁺) → 1, −1, 1 · `q6RBell` (Φ⁺) → all 0.
- **Fidelity:** `qc-tq-local-arrows`.

**`q6-bell-basis:b5` [L]** (triplet and singlet)
- **G:** "Two Bell states are old friends from spin. Write $|0\rangle$ as $\uparrow$ and $|1\rangle$ as $\downarrow$. Then $\Psi^+ = (\uparrow\downarrow + \downarrow\uparrow)/\sqrt2$ is the middle [[qc-triplet|triplet]] state, and $\Psi^-$ is the [[qc-singlet|singlet]]. $\Phi^+$ and $\Phi^-$ mix the other two triplet states, $\uparrow\uparrow$ and $\downarrow\downarrow$."
- **F:** "With $|0\rangle = |{+z}\rangle$, $\Psi^+ = |1, 0\rangle$ is a [[qc-triplet|triplet]] state and $\Psi^- = |0, 0\rangle$ the [[qc-singlet|singlet]], while $\Phi^\pm = (|1, 1\rangle \pm |1, -1\rangle)/\sqrt2$ (notes p. 26; HW2 P1). The triplet is symmetric under exchange of the particles, the singlet antisymmetric."
- **Cap:** G/F "$\Psi^-$: +0.707 on 01, −0.707 on 10; every grid cell −1 on the diagonal"
- **Stage:** `split( amp({bell:'Psi-'}) / tq({bell:'Psi-'}) )` — needs: two-qubit.
- **Claims:** `q6BellAmps` (Ψ⁻) → (0, 0.707, −0.707, 0) · `q6GridBell` (Ψ⁻) → −1, −1, −1.

**`q6-bell-basis:b6` [B]** (spin 1 out of two spin-½: HW2 P1(a)–(c))
- **G:** "Take two spins along +x, $|{+x}\rangle\otimes|{+x}\rangle$. Its triplet parts are $\tfrac12$, 0.707 and $\tfrac12$, with nothing in the singlet. That is the spin-1 state $|{+1_x}\rangle$ of Homework 1, Problem 5. But $|{+x}\rangle\otimes|{-x}\rangle$ has a singlet part of −0.707, so it is not a spin-1 state."
- **F:** "In the basis $|1,1\rangle, |1,0\rangle, |1,-1\rangle, |0,0\rangle$: $|{+x},{+x}\rangle = (\tfrac12, \tfrac1{\sqrt2}, \tfrac12, 0) = |{+1_x}\rangle$ and $|{-x},{-x}\rangle = (\tfrac12, -\tfrac1{\sqrt2}, \tfrac12, 0) = |{-1_x}\rangle$ (HW2 P1(a)–(b)). $|{+x},{-x}\rangle$ has singlet part $-1/\sqrt2$; its symmetrized partner is $(|1,1\rangle - |1,-1\rangle)/\sqrt2 = \Phi^-$, HW1's $|0_x\rangle$ up to an overall sign (HW2 P1(c))."
- **Cap:** G "$|{+x}\rangle|{-x}\rangle$ in the Bell basis: 0.707 on $\Phi^-$, −0.707 on the singlet" · F "triplet and singlet components"
- **Stage:** `split( amp({ket:'+-'}, {inBasis:'bell'}) / tq({ket:'+-'}) )` — needs: matrix-v2 (`inBasis`), two-qubit.
- **Claims:** `q6P1a` → (0.5, 0.707, 0.5, 0) · `q6P1b` → (0.5, −0.707, 0.5, 0) · `q6P1c` → (0.5, 0, −0.5, −0.707) · `q6P1cSym` → (0.707, 0, −0.707, 0) · `q6P1cSymIsPhiMinus` → 1 · `q6BellOfPM` → (0, 0, 0.707, −0.707) in the order β₀₀, β₀₁, β₁₀, β₁₁.

**`q6-bell-basis:b7` [B]** (total S_x never mixes triplet and singlet: HW2 P1(e); D6)
- **G:** "Total spin along x adds the two spins: $S_x\otimes I + I\otimes S_x$. Written in the triplet-and-singlet basis, its singlet row and column are all zeros. On the three triplet states it is exactly Homework 1's spin-1 matrix $S_x$, with entries $0.707\hbar$ beside the diagonal."
- **F:** "$S^{\rm tot}_x = S_x\otimes I + I\otimes S_x$ with $S_x = \tfrac\hbar2\sigma_x$ (HW2 P1(e)). In the basis $|1,1\rangle, |1,0\rangle, |1,-1\rangle, |0,0\rangle$ it is block-diagonal, 3 + 1: the triplet block is the spin-1 matrix $S^{(1)}_x = \tfrac\hbar{\sqrt2}$ times 1s beside the diagonal, and the singlet block is 0. $S^{\rm tot}_x$ commutes with the exchange of the particles, so it cannot connect symmetric to antisymmetric states."
- **Cap:** G "the singlet's row and column: all 0" · F "$S^{\rm tot}_x$ in the triplet-and-singlet basis (units of ħ)"
- **Stage:** `mx(lin(['1/2', pa('XI')], ['1/2', pa('IX')]), {basis:[{ket:'00'},{bell:'Psi+'},{ket:'11'},{bell:'Psi-'}], highlightRow:3, highlightCol:3})` — needs: matrix-v2.
- **Claims:** `q6Stot` → ½ × rows (0,1,1,0), (1,0,0,1), (1,0,0,1), (0,1,1,0) · `q6StotTS` → triplet block 0.707 beside the diagonal, singlet row and column 0.

**`q6-bell-basis:b8` [C]** (why $m_x = 0$ is no product: HW2 P1(d))
- **Q G:** "For spin 1 along x, $m_x = \pm1$ are simple products of two x-spins. Why can't $m_x = 0$ be one?"
- **Q F:** "Why are $|{\pm1_x}\rangle$ products of single-spin x states while $|0_x\rangle$ is not (HW2 P1(d))?"
- **Reveal G:** "$m_x = +1$ needs both spins along +x: one way only, a product. $m_x = 0$ needs one spin up and one down along x, and both orders must be added. That sum is $\Phi^-$, and its test gives −0.5, not 0: it is entangled."
- **Reveal F:** "$m_x = \pm1$ is reached one way, $|{\pm x},{\pm x}\rangle$. $m_x = 0$ needs the symmetric sum of $|{+x},{-x}\rangle$ and $|{-x},{+x}\rangle$, which is $\Phi^-$ with $\det C = -\tfrac12$: no product of definite x states."
- **Reveal cap:** G/F "$\Phi^-$: test −0.5, two equal singular values"
- **Stage:** question `amp({ket:'++'})`; reveal `split( amp({bell:'Phi-'}) / mx({coef:{bell:'Phi-'}}, {svd:true}) )`.
- **Claims:** `q6DetBell` (Φ⁻) → −0.5 · `q6P1cSymIsPhiMinus` → 1.

### Unit `q6-bell-circuit` — Reading and writing Bell states

**`q6-bell-circuit:b1` [L]** (rotate, then read)
- **G:** "Detectors read one qubit at a time, in the 0/1 basis. To learn which Bell state arrived, first turn the Bell basis into the 0/1 basis. A CNOT, then an H on qubit 1, does exactly that. Two ordinary readings then give two bits, x and y: a [[qc-bell-measurement|Bell measurement]]."
- **F:** "To measure in the Bell basis, rotate it onto the computational basis and read each qubit (notes p. 26, Fig. 7): $U = (H\otimes I)\,\mathrm{CNOT}$ with qubit 1 as control, then Z on each line. This is a [[qc-bell-measurement|Bell measurement]]; N&C's Fig. 1.12 is the same circuit run backwards."
- **Cap:** G "columns 1–2 make $\beta_{10}$ from $|10\rangle$; columns 3–4 read it" · F "preparation, then Fig. 7"
- **Stage:** `split( circ(C_BM('10'), 2) / amp({circuit:C_BM('10'), upTo:2}) )`.
- **Claims:** `q6BMPrep` (10) → (0.707, 0, 0, −0.707).

**`q6-bell-circuit:b2` [L]** ($\beta_{xy}$ goes to $|xy\rangle$; D8)
- **G:** "Follow $\beta_{xy}$ through. The CNOT flips qubit 2 in the term that starts with 1, so both terms end in the same $|y\rangle$. Qubit 1 is left in $|+\rangle$ or $|-\rangle$, set by x. The H turns that into $|0\rangle$ or $|1\rangle$. Out comes $|xy\rangle$, with certainty."
- **F:** "$\mathrm{CNOT}|\beta_{xy}\rangle = \tfrac1{\sqrt2}(|0\rangle + (-1)^x|1\rangle)|y\rangle$, and H maps the first factor to $|x\rangle$ (notes p. 26). So $(H\otimes I)\,\mathrm{CNOT}|\beta_{xy}\rangle = |xy\rangle$: the two recorded bits name the Bell state that entered."
- **Cap:** G "$\beta_{10}$: two bars, then $|{-}\rangle|0\rangle$, then one bar at 10" · F "$U\beta_{xy} = |xy\rangle$"
- **Stage:** `split( circ(C_BM('10'), 4) / amp({circuit:C_BM('10'), upTo:4}) )`.
- **Claims:** `q6BMMid` (10) → (0.707, 0, −0.707, 0) · `q6BMOut` → 1 at $|xy\rangle$ for all four · `q6UBeta` → the identity's columns.

**`q6-bell-circuit:b3` [L]** (run it backwards; D9)
- **G:** "Every gate can be undone, so the circuit run backwards makes Bell states. Start in $|xy\rangle$, apply H to qubit 1, then a CNOT. From $|00\rangle$ this is Unit 4.5's recipe: first $(|00\rangle + |10\rangle)/\sqrt2$, then $\Phi^+$."
- **F:** "H and CNOT are Hermitian, so $U^\dagger = \mathrm{CNOT}(H\otimes I)$ and $|\beta_{xy}\rangle = U^\dagger|xy\rangle$ (notes p. 27). Both directions return in dense coding, teleportation and the Bell tests of Chapters Q10 and Q11."
- **Cap:** G/F "$|00\rangle \to (|00\rangle + |10\rangle)/\sqrt2 \to \Phi^+$"
- **Stage:** `split( circ(C_PREP('00'), 2) / amp({circuit:C_PREP('00'), upTo:2}) )`.
- **Claims:** `q6PrepMid` → (0.707, 0, 0.707, 0) · `q6BMPrep` → the four Bell states · `q6BMPrepIsBeta` → 1 × 4.

**`q6-bell-circuit:b4` [L] · notation beat, `introduces: ['qc-bell-projector']`** (one projector per outcome)
- **G:** "Like any measurement, this one has one projector per outcome. $\Pi_{xy} = |\beta_{xy}\rangle\langle\beta_{xy}|$ keeps the $\beta_{xy}$ part of a state. The four add up to the identity. The chance of outcome xy is $\langle\Psi|\Pi_{xy}|\Psi\rangle$, as in Chapter Q3."
- **F:** "The Bell measurement is the complete orthogonal set [[qc-bell-projector|$\Pi_{xy}$]] $= |\beta_{xy}\rangle\langle\beta_{xy}|$, with $\Pi_{xy}\Pi_{x'y'} = \delta_{xx'}\delta_{yy'}\Pi_{xy}$ and $\sum_{xy}\Pi_{xy} = I_4$; outcome xy has $p_{xy} = \langle\Psi|\Pi_{xy}|\Psi\rangle$ (notes Eq. 2.5; 448's <<qc-l4-projectors|yes/no projectors>>)."
- **Cap:** G "$\Pi_{10}$: $\tfrac12$ in two corners of the diagonal, $-\tfrac12$ in the other two corners" · F "$\Pi_{10}$ in the computational basis"
- **Stage:** `mx({outer:[{bell:'Phi-'}]}, {blocks:2})`.
- **Claims:** `q6Pi10` → ±0.5 at (0,0), (3,3), (0,3), (3,0) · `q6PiSum` → 0 · `q6PiOrth` → 0.

**`q6-bell-circuit:b5` [B]** (a product state in the Bell basis: HW2 P2(a))
- **G:** "Feed in a product state, $|0\rangle|+\rangle$. Its four Bell amplitudes are all $\tfrac12$, so each outcome comes up a quarter of the time. For this state a Bell measurement gives two random bits and says nothing about it."
- **F:** "$|\Psi_1\rangle = |0\rangle\otimes|+\rangle = \tfrac12\sum_{xy}|\beta_{xy}\rangle$ (HW2 P2(a)): $p_{xy} = \tfrac14$ for all four outcomes, two bits of pure noise, so the measurement extracts no information about $\Psi_1$."
- **Cap:** G/F "$|0\rangle|+\rangle$: four outcomes, 0.25 each"
- **Stage:** `split( circ(C_F7('0+'), 2) / amp({circuit:C_F7('0+'), upTo:2}, {mode:'probability'}) )`.
- **Claims:** `q6P2aAmp` → 0.5 × 4 · `q6P2a` → 0.25 × 4 · `q6P2aViaCircuit` → 0.25 × 4.

**`q6-bell-circuit:b6` [B]** (an entangled input: HW2 P2(c); D14)
- **G:** "Now feed in $\Psi_2 = (\sqrt3|00\rangle + |11\rangle)/2$. Only $\beta_{00}$ and $\beta_{10}$ use its strings 00 and 11. Their amplitudes are 0.966 and 0.259. So the circuit reads 00 with chance 0.933 and 10 with chance 0.067, and never 01 or 11."
- **F:** "$|\Psi_2\rangle = \tfrac{\sqrt3+1}{2\sqrt2}|\beta_{00}\rangle + \tfrac{\sqrt3-1}{2\sqrt2}|\beta_{10}\rangle$, so $p_{00} = \tfrac{2+\sqrt3}4 = 0.933$, $p_{10} = \tfrac{2-\sqrt3}4 = 0.067$ and $p_{01} = p_{11} = 0$ (HW2 P2(c))."
- **Cap:** G/F "$\Psi_2$: 0.933 at 00, 0.067 at 10"
- **Stage:** `split( circ(C_F7C, 4) / amp({circuit:C_F7C, upTo:4}, {mode:'probability'}) )`.
- **Claims:** `q6Psi2` → (0.866, 0, 0, 0.5) · `q6P2cAmp` → (0.966, 0, 0.259, 0) · `q6P2c` → (0.933, 0, 0.067, 0) · `q6P2cViaCircuit` → the same.

**`q6-bell-circuit:b7` [C]** (the singlet's two bits)
- **Q G:** "Send the singlet $\Psi^-$ into the measuring circuit. Which two bits come out?"
- **Q F:** "What does the Fig. 7 circuit record for $\Psi^- = \beta_{11}$?"
- **Reveal G:** "11, every time. The circuit turns each Bell state into one basis string, and $\Psi^-$ is $\beta_{11}$."
- **Reveal F:** "$U|\beta_{11}\rangle = |11\rangle$ with probability 1: x = 1 (the minus sign) and y = 1 (the bits differ)."
- **Reveal cap:** G/F "one bar at 11"
- **Stage:** question `split( circ(C_BM('11'), 2) / amp({circuit:C_BM('11'), upTo:2}) )`; reveal the same at `upTo` 4.
- **Claims:** `q6BMOut` (11) → 1 at 11.

### Unit `q6-parities` — Two parities: what the detectors really ask

**`q6-parities:b1` [L]** (a reading after a gate is a different reading before it; D10)
- **G:** "Is a Bell measurement just two one-qubit readings? The detectors read Z on each line, but only after the CNOT and the H. Reading $Z_1$ after the gates is the same as reading something else before them. That something is $X_1X_2$, and $Z_2$ becomes $Z_1Z_2$."
- **F:** "Measuring $\hat O$ after U is measuring $U^\dagger\hat OU$ before it (notes p. 27). With $U = (H\otimes I)\,\mathrm{CNOT}$, $H\cdot Z\cdot H = X$ and the CNOT rules $X_1 \to X_1X_2$, $Z_2 \to Z_1Z_2$ give $U^\dagger(Z\otimes I)U = X\otimes X$ and $U^\dagger(I\otimes Z)U = Z\otimes Z$ (notes Eq. 2.6)."
- **Cap:** G "$Z_1$ at the meters is $X_1X_2$ at the input" · F "Eq. 2.6"
- **Stage:** `circ(C_U, 2, {observable:{pauli:'ZI', at:0}})` — needs: matrix-v2 (circuit `observable`).
- **Claims:** `q6HeisZI` → +XX · `q6HeisIZ` → +ZZ · `q6HZH` → 0 (largest entry of $H\cdot Z\cdot H - X$) · `q6CnotXI` → +XX · `q6CnotIZ` → +ZZ.

**`q6-parities:b2` [L]** (the two parities commute; D11)
- **G:** "$X_1X_2$ asks whether the qubits agree in the ± basis; $Z_1Z_2$ asks the same in the 0/1 basis. On one qubit, X and Z anticommute: $X\cdot Z = -Z\cdot X$. In $X_1X_2$ times $Z_1Z_2$ that minus sign appears twice and cancels. So the two commute, and both can be read at once."
- **F:** "$[XX, ZZ] = 0$: X and Z anticommute on each qubit and the two sign changes cancel (notes p. 28), so the parities are [[qc-compatible|compatible]] (Chapter Q3; 448's <<qc-l7-compatible|compatible measurements>>). Indeed $XX\cdot ZZ = ZZ\cdot XX = -YY$."
- **Cap:** G "two minus signs cancel" · F "$XX\cdot ZZ = (-iY)\otimes(-iY) = -YY$"
- **Stage:** `mx({tableau:['XX','ZZ'], product:true})` — needs: matrix-v2.
- **Claims:** `q6AntiXZ` → 0 · `q6Comm` → 0 · `q6XXZZ` → phase −1, string YY.

**`q6-parities:b3` [L]** (the Bell states answer both; D12)
- **G:** "Each Bell state gives a sure answer to both questions: $X_1X_2\beta_{xy} = (-1)^x\beta_{xy}$ and $Z_1Z_2\beta_{xy} = (-1)^y\beta_{xy}$. So the two recorded bits are the two parities. One parity alone leaves two states tied, since each answer belongs to two Bell states."
- **F:** "The Bell states are the [[qc-simultaneous-eigenvector|simultaneous eigenvectors]] $XX|\beta_{xy}\rangle = (-1)^x|\beta_{xy}\rangle$, $ZZ|\beta_{xy}\rangle = (-1)^y|\beta_{xy}\rangle$ (notes Eq. 2.7). Each operator alone has eigenvalues ±1, each twofold [[qc-degenerate|degenerate]], so it takes both to separate the four. The projectors factorize: $\Pi_{xy} = \tfrac12(I + (-1)^xXX)\cdot\tfrac12(I + (-1)^yZZ)$."
- **Cap:** G "$\beta_{10}$: $xx = -1$, $zz = +1$" · F "$(XX, ZZ) = ((-1)^x, (-1)^y)$"
- **Stage:** `tq({bell:'Phi-'}, {highlight:['xx','zz']})` — needs: two-qubit.
- **Claims:** `q6EigXX` → 1, 1, −1, −1 · `q6EigZZ` → 1, −1, 1, −1 · `q6PiFactor` → 0 · `q6GridBell` (β₁₀) → −1, 1, 1.

**`q6-parities:b4` [L] · notation beat, `introduces: ['qc-stabilizer']`** (stabilizers)
- **G:** "$X_1X_2$ and $Z_1Z_2$ both leave $\Phi^+$ exactly as it is. An operator that leaves a state unchanged is a [[qc-stabilizer|stabilizer]] of that state. The pair $X_1X_2$, $Z_1Z_2$ pins $\Phi^+$ down completely. The error-correcting codes of Part IX are built on this idea."
- **F:** "g [[qc-stabilizer|stabilizes]] $|\psi\rangle$ if $g|\psi\rangle = +|\psi\rangle$. XX and ZZ generate the stabilizer of $\Phi^+$ (notes p. 29; N&C §10.5.1 p. 454): the group $\{II, XX, -YY, ZZ\}$ fixes $\Phi^+$ and no other state. Measuring ZZ alone is a parity measurement; both ideas return in Part IX's codes."
- **Cap:** G "$\Phi^+$: $xx = +1$ and $zz = +1$, so $yy = -1$" · F "$XX$, $ZZ$ and $XX\cdot ZZ = -YY$"
- **Stage:** `split( mx({tableau:['XX','ZZ']}) / tq({bell:'Phi+'}, {highlight:['xx','yy','zz']}) )` — needs: matrix-v2, two-qubit.
- **Claims:** `q6EigXX` (β₀₀) → +1 · `q6EigZZ` (β₀₀) → +1 · `q6EigYY` (β₀₀) → −1 · `q6XXZZ` → −YY.

**`q6-parities:b5` [L] · notation beat, `introduces: ['qc-number-operator']`** (one operator, two faces; D13)
- **G:** "Both answers can be packed into one operator whose value is $2x + y$: 0, 1, 2 or 3. Pushed through the circuit it becomes $2n_1 + n_2$, where the [[qc-number-operator|bit operator]] $n_i$ reads qubit i's bit. The weights 2 and 1 are just place value. Before the gates it asks about correlations; after them, about two separate bits."
- **F:** "$\hat M = (I - XX) + \tfrac12(I - ZZ) = \sum_{xy}(2x + y)\Pi_{xy}$ has eigenvalues 0, 1, 2, 3 on $\beta_{xy}$. Then $U\hat MU^\dagger = 2\hat n_1 + \hat n_2$ with the [[qc-number-operator|bit operator]] $\hat n_i = |1\rangle\langle1|_i = (I - Z_i)/2$ (notes Eq. 2.8). The nonlocality has moved out of the observable and into U; the reverse conjugation $U^\dagger\hat MU$ has no such meaning."
- **Cap:** G "the same values 0–3: on Bell states before, on 00…11 after" · F "$U\hat MU^\dagger = \mathrm{diag}(0, 1, 2, 3)$"
- **Stage:** `mx(prod(UB, M, adj(UB)))` with `M = lin(['1', I4], ['-1', pa('XX')], ['1/2', I4], ['-1/2', pa('ZZ')])`, `I4 = {gate:{name:'I'}, qubits:2, targets:[0]}` — needs: matrix-v2.
- **Claims:** `q6MEig` → 0, 1, 2, 3 · `q6MDiag` → diag(0, 1, 2, 3) · `q6N1` → diag(0, 0, 1, 1).

**`q6-parities:b6` [B]** (parities of a product: HW2 P2(b))
- **G:** "Back to $|0\rangle|+\rangle$. For a product the averages multiply: $\langle X_1X_2\rangle = 0\times1 = 0$ and $\langle Z_1Z_2\rangle = 1\times0 = 0$. The Bell outcomes agree: x is 0 or 1 equally often. So the average of $(-1)^x$ is 0, and likewise for y."
- **F:** "For $\Psi_1 = |0\rangle|+\rangle$, $\langle XX\rangle = \langle X\rangle_0\langle X\rangle_+ = 0$ and $\langle ZZ\rangle = \langle Z\rangle_0\langle Z\rangle_+ = 0$, matching $\sum_{xy}(-1)^xp_{xy} = \sum_{xy}(-1)^yp_{xy} = 0$ from the uniform $p_{xy}$ (HW2 P2(b)). For $\Psi_2$ the same sums give $\langle XX\rangle = 0.866$ and $\langle ZZ\rangle = 1$."
- **Cap:** G "$|0\rangle|+\rangle$: arrows along z and x; the $xx$ and $zz$ cells are 0" · F "$\langle XX\rangle = \langle ZZ\rangle = 0$; for $\Psi_2$: 0.866 and 1"
- **Stage:** `tq({ket:'0+'}, {highlight:['xx','zz']})` — needs: two-qubit.
- **Claims:** `q6P2b` → ⟨XX⟩ 0, ⟨ZZ⟩ 0, ⟨X⟩₁ 0, ⟨X⟩₂ 1, ⟨Z⟩₁ 1, ⟨Z⟩₂ 0 · `q6Psi2Par` → 0.866, 1.

**`q6-parities:b7` [C]** (local readings cannot tell)
- **Q G:** "Read $\Phi^+$ and $\Phi^-$ qubit by qubit in the 0/1 basis. Can the readings tell them apart?"
- **Q F:** "Can separate $Z_1$ and $Z_2$ readings distinguish $\Phi^+$ from $\Phi^-$?"
- **Reveal G:** "No. Both give 00 or 11, half the time each. They differ only in $X_1X_2$: +1 for $\Phi^+$ and −1 for $\Phi^-$. Only a two-qubit question sees the difference, which is why the circuit needs the CNOT."
- **Reveal F:** "No: $P(00) = P(11) = \tfrac12$ for both. They differ only in the eigenvalue of XX, a correlation no single-qubit reading measures; the CNOT converts it into a local bit (notes p. 28)."
- **Reveal cap:** G/F "$\Phi^-$: $xx = -1$, where $\Phi^+$ has +1"
- **Stage:** question `amp({bell:'Phi-'}, {mode:'probability'})`; reveal `tq({bell:'Phi-'}, {highlight:['xx']})` — needs: two-qubit.
- **Claims:** `q6PhiP` → 0.5, 0, 0, 0.5 · `q6PhiMinusP` → 0.5, 0, 0, 0.5 · `q6EigXX` (β₀₀, β₁₀) → +1, −1.

### 1.7 Claim ledger (engine call → value; numpy route)

| Key | Engine call (Q6.values.ts) | Value | numpy route |
|---|---|---|---|
| `q6AmpCount`, `q6DimSpin1` | `ket('0'.repeat(n)).length`; `kronM(I2, identity(3)).length` | 2, 4, 8, 1024; 6 | `2**n`; `2*3` |
| `q6Amp30`, `q6Gib30` | `2 ** 30`; `2 ** 30 * 16 / 2 ** 30` (arithmetic in the values file) | 1.07 × 10⁹; 16 | the same formulas |
| `q6ProdZX`, `q6ProdPsi`, `q6Psi1` | `kron(ket('0'), ket('+'))`; `runCircuit(C_PROD)`; `apply(Ry(π/3), ket('0'))` | see beats | `np.kron` of explicit kets |
| `q6XI`, `q6XZ`, `q6ZZ`, `q6XZket` | `kronM`, `pauliString`, `runCircuit(C_XZ)` | see beats | block rule (2.1) by hand |
| `q6Exp*`, `q6GridProd`, `q6RProd` | `expectationN(ψ, pauliString(s))` | 0.5, 0.866, 1, 0 | product of one-qubit averages |
| `q6Param` | E1 `paramCount(N)`; fraction = product/general | (6, 4), (14, 6, 0.4286), (2046, 20, 0.009775) | the formula |
| `q6Det*`, `q6Svd*`, `q6Rank*`, `q6CZpp` | `coefMatrix` + 2×2 det; `svd(coefMatrix(ψ)).s`; `schmidtRank` | 0, ±0.5; (1, 0), (0.707, 0.707) | `v[0]v[3] − v[1]v[2]`; `np.linalg.svd` |
| `q6BellAmps`, `q6BellGram`, `q6OvPhiPM`, `q6PhiP`, `q6PhiMarg`, `q6PhiMinusP` | `bell(name)`, inner products, `probs`, `marginal` | see beats | Bell states from Eq. 2.4 |
| `q6P1a`–`q6P1cSym`, `q6BellOfPP`, `q6BellOfPM` | inner products with the triplet/singlet kets; E1 `bellAmplitudes` | see beats | explicit ↑↓ kets |
| `q6Stot`, `q6StotTS` | `kronM` sum; ⟨a\|S\|b⟩ in the triplet/singlet basis | ½, 0.707 | `np.kron` |
| `q6BMPrep`, `q6BMMid`, `q6BMOut`, `q6PrepMid`, `q6UBeta` | `runCircuit(C_BM(xy)).states[k]`, `runCircuit(C_PREP)` | see beats | projector-sum CNOT matrices |
| `q6Pi10`, `q6PiSum`, `q6PiOrth`, `q6PiFactor` | outer products; `matmul` | ±0.5; 0, 0, 0 | numpy outer and `@` |
| `q6P2a*`, `q6P2c*`, `q6Psi2` | E1 `bellAmplitudes`; `runCircuit(C_F7('0+'))`, `runCircuit(C_F7C)` | 0.25 × 4; 0.933, 0.067 | Eq. 2.4 inner products; U @ ψ |
| `q6HeisZI`, `q6HeisIZ`, `q6CnotXI`, `q6CnotIZ`, `q6HZH` | E1 `heisenberg(U, s)` (= `cliffordConj(U†, s)`) | +XX, +ZZ | trace inner products with all strings |
| `q6Comm`, `q6AntiXZ`, `q6XXZZ` | `matmul`; E1 `paulisCommute`, `pauliMul('XX','ZZ')` | 0, 0, −YY | numpy products |
| `q6EigXX`, `q6EigZZ`, `q6EigYY` | E1 `pauliEigenvalue(β_xy, s)` | (1,1,−1,−1), (1,−1,1,−1), (−1,1,1,−1) | `np.allclose(Pψ, ±ψ)` |
| `q6MEig`, `q6MDiag`, `q6N1` | ⟨β\|M̂\|β⟩; `U·M̂·U†` | 0–3; diag(0,1,2,3) | `2*n1 + n2` directly |
| `q6P2b`, `q6Psi2Par`, `q6GridBell`, `q6RBell`, `q6GridPsi2` | `expectationN` | see beats | numpy `vdot` |

## 2. Derivations

Each step is `tex` — `why` — **view** (the exact `StageState`, in the shorthand above) — *viewCaption*. A step without a
view inherits the previous one in its own list. Every list has ≥ 2 distinct views, and every view uses a kind its unit's
beats show. The last `tex` of each list ends on the result.

**D1 · `q6-many:b1` · result `\dim\big(V^{(1)}\otimes V^{(2)}\big) = d_1d_2`** (notes p. 21)
- Ground (4 views):
  1. `\{|0\rangle, |1\rangle\}` — One qubit has two basis states. **view** `amp({ket:'+'})` · *one qubit: 2 bars*
  2. `|0\rangle|0\rangle,\ |0\rangle|1\rangle,\ |1\rangle|0\rangle,\ |1\rangle|1\rangle` — A basis state of the pair picks one state for each qubit. **view** `amp({ket:'++'})` · *two qubits: 4 bars*
  3. `2\times2 = 4` — Qubit 1's two choices are the rows of a grid and qubit 2's are its columns. **view** `mx({coef:{ket:'++'}})` · *the four amplitudes as a 2 × 2 grid*
  4. `2\times2\times2 = 8` — A third qubit splits every one of these in two again. **view** `amp({ket:'+++'})` · *three qubits: 8 bars*
  5. `d_1\times d_2` — Parts with $d_1$ and $d_2$ states give a grid of $d_1$ rows and $d_2$ columns. **view** `mx({coef:{ket:'++'}})` · *rows: qubit 1; columns: qubit 2*
  6. `\dim\big(V^{(1)}\otimes V^{(2)}\big) = d_1d_2` — So the joint space has $d_1d_2$ dimensions: composition multiplies.
- Formal (2 views):
  1. `V^{(1)}\otimes V^{(2)} = \mathrm{span}\{|i_1\rangle_1\otimes|i_2\rangle_2\}` — The products of basis vectors span the joint space (notes p. 21). **view** `amp({ket:'++'})` · *the four products*
  2. `\dim\big(V^{(1)}\otimes V^{(2)}\big) = d_1d_2` — They are independent, so the $c_{i_1i_2}$ form a free $d_1\times d_2$ array. **view** `mx({coef:{ket:'++'}})` · *$c_{i_1i_2}$*
- Check: `q6AmpCount`, `q6DimSpin1`.

**D2 · `q6-tensor:b4` · result `\langle\Psi|A\otimes B|\Psi\rangle = \langle A\rangle\langle B\rangle`** (notes p. 22)
- Ground (3 views):
  1. `|\Psi\rangle = |\psi_1\rangle\otimes|\psi_2\rangle` — A product state: each qubit was prepared on its own. **view** `amp({circuit:C_PROD, upTo:1})` · *$\psi_1\otimes|+\rangle$*
  2. `(A\otimes B)\big(|\psi_1\rangle\otimes|\psi_2\rangle\big) = A|\psi_1\rangle\otimes B|\psi_2\rangle` — Each operator acts on its own qubit only. **view** `mx(pa('ZX'), {blocks:2})` · *$Z\otimes X$: blocks $Z_{ij}X$*
  3. `\langle\Psi| = \langle\psi_1|\otimes\langle\psi_2|` — The bra of a product is the product of the bras.
  4. `\langle\Psi|A\otimes B|\Psi\rangle = \langle\psi_1|A|\psi_1\rangle\,\langle\psi_2|B|\psi_2\rangle` — An inner product of products multiplies slot by slot.
  5. `\langle Z\otimes X\rangle = 0.5\times1 = 0.5` — For our state, $\langle Z\rangle$ of $\psi_1$ is 0.5 and $\langle X\rangle$ of $|+\rangle$ is 1. **view** `tq({circuit:C_PROD, upTo:1}, {highlight:['zx']})` · *the $zx$ cell: 0.5 × 1*
  6. `\langle\Psi|A\otimes B|\Psi\rangle = \langle A\rangle\langle B\rangle` — In general the average of a product reading is the product of the averages.
- Formal (2 views):
  1. `\langle\psi_1\otimes\psi_2|A\otimes B|\psi_1\otimes\psi_2\rangle = \langle\psi_1|A\psi_1\rangle\langle\psi_2|B\psi_2\rangle` — $(A\otimes B)(u\otimes v) = Au\otimes Bv$ and $\langle u\otimes v|u'\otimes v'\rangle = \langle u|u'\rangle\langle v|v'\rangle$. **view** `mx(pa('ZX'), {blocks:2})`
  2. `= \langle A\rangle\langle B\rangle` — Independent readings (notes p. 22): here $\langle ZX\rangle = 0.5$ and $T = r_Ar_B^{\mathsf T}$. **view** `tq({circuit:C_PROD, upTo:1}, {highlight:['zx']})` · *$T_{zx} = r_{A,z}r_{B,x}$*
- Check: `q6ExpZ1`, `q6ExpX2`, `q6ExpZX`, `q6GridProd`. Needs: two-qubit.

**D3 · `q6-entangled:b1` · result `n_{\rm general} = 2\cdot2^N - 2,\quad n_{\rm product} = 2N`** (notes p. 22)
- Ground (3 views):
  1. `4\ \text{amplitudes} = 8\ \text{real numbers}` — Each complex amplitude is two real numbers, a size and a phase. **view** `amp({ket:'++'}, {dials:true})` · *four dials: a size and a phase each*
  2. `8 - 1 - 1 = 6` — The chances must add to 1, and an overall phase changes no reading.
  3. `2 + 2 = 4` — A product needs one point on each qubit's sphere, two angles each. **view** `tq({ket:'++'})` · *a product: two arrows, two angles each*
  4. `2^N\ \text{amplitudes} \to 2\cdot2^N - 2` — With N qubits the same count gives this many numbers. **view** `amp({ket:'+++'}, {dials:true})` · *three qubits: 8 dials, 14 numbers*
  5. `n_{\rm general} = 2\cdot2^N - 2,\quad n_{\rm product} = 2N` — A product still needs only two angles per qubit.
- Formal (2 views):
  1. `\dim_{\mathbb R}\mathbb C^{2^N} = 2\cdot2^N \to 2\cdot2^N - 2` — Remove the norm and the global phase (notes p. 22). **view** `amp({ket:'++'}, {dials:true})`
  2. `n_{\rm general} = 2\cdot2^N - 2,\quad n_{\rm product} = 2N` — Products are $(S^2)^N$; the ratio $2N/(2^{N+1} - 2)$ is $0.98\,\%$ at N = 10. **view** `tq({ket:'++'})`
- Check: `q6Param`. Needs: two-qubit.

**D4 · `q6-entangled:b3` · result `\Phi^+ \ne (a|0\rangle + b|1\rangle)\otimes(c|0\rangle + d|1\rangle)`** (notes p. 22)
- Ground (4 views):
  1. `(a|0\rangle + b|1\rangle)(c|0\rangle + d|1\rangle)` — A general product of two one-qubit states. **view** `amp({ket:'++'})` · *a product with all four bars filled*
  2. `= ac|00\rangle + ad|01\rangle + bc|10\rangle + bd|11\rangle` — Multiply out: one term for each pairing. **view** `mx({coef:{ket:'++'}}, {svd:true})` · *a product's grid: one bar*
  3. `\Phi^+ = \tfrac1{\sqrt2}|00\rangle + \tfrac1{\sqrt2}|11\rangle` — $\Phi^+$ has no $|01\rangle$ or $|10\rangle$ part. **view** `amp({bell:'Phi+'})` · *$\Phi^+$: the 01 and 10 bars are empty*
  4. `ad = 0,\quad bc = 0` — So the 01 and 10 amplitudes of the product must vanish.
  5. `ac = bd = \tfrac1{\sqrt2} \ne 0 \Rightarrow a, b, c, d \ne 0` — But the 00 and 11 amplitudes need all four numbers non-zero.
  6. `\Phi^+ \ne (a|0\rangle + b|1\rangle)\otimes(c|0\rangle + d|1\rangle)` — The two demands clash, so no product equals $\Phi^+$. **view** `mx({coef:{bell:'Phi+'}}, {svd:true})` · *$\Phi^+$'s grid: two equal bars*
- Formal (2 views):
  1. `C_{\Phi^+} = \tfrac1{\sqrt2}I,\quad \det C_{\Phi^+} = \tfrac12` — A product has $C = ab^{\mathsf T}$, rank 1 and $\det C = 0$. **view** `mx({coef:{bell:'Phi+'}}, {svd:true})`
  2. `\Phi^+ \ne (a|0\rangle + b|1\rangle)\otimes(c|0\rangle + d|1\rangle)` — $\det C \ne 0$ (notes p. 22). **view** `amp({bell:'Phi+'})`
- Check: `q6DetPhi`, `q6SvdPhi`, `q6RankPhi`, `q6SvdProd`.

**D5 · `q6-tensor:b2` · result `\sigma_x\otimes\sigma_z = \begin{pmatrix}0 & \sigma_z\\ \sigma_z & 0\end{pmatrix}`** (notes Eq. 2.1, p. 23)
- Ground (4 views):
  1. `X = \begin{pmatrix}0 & 1\\ 1 & 0\end{pmatrix}` — X's pattern: zeros on the diagonal, 1s off it. **view** `mx(pa('X'))` · *X*
  2. `A\otimes B = \begin{pmatrix}A_{11}B & A_{12}B\\ A_{21}B & A_{22}B\end{pmatrix}` — Each entry of the first matrix multiplies a whole copy of the second. **view** `mx(pa('XZ'), {blocks:2, values:'none'})` · *four blocks, each a multiple of Z*
  3. `X\otimes Z = \begin{pmatrix}0\cdot Z & 1\cdot Z\\ 1\cdot Z & 0\cdot Z\end{pmatrix}` — Put X's four entries in.
  4. `(X\otimes Z)|01\rangle = X|0\rangle\otimes Z|1\rangle = -|11\rangle` — A check on one state: X flips qubit 1, and Z gives qubit 2's $|1\rangle$ a minus sign. **view** `amp({circuit:C_XZ, upTo:1})` · *$|01\rangle \to -|11\rangle$*
  5. `\sigma_x\otimes\sigma_z = \begin{pmatrix}0 & \sigma_z\\ \sigma_z & 0\end{pmatrix}` — Z fills the two off-diagonal blocks. **view** `mx(pa('XZ'), {blocks:2, highlight:[[0,2],[1,3],[2,0],[3,1]]})` · *entries 0, ±1*
- Formal (2 views):
  1. `(A\otimes B)_{(i,k),(j,l)} = A_{ij}B_{kl}` — Eq. 2.1, an $nm\times nm$ matrix. **view** `mx(pa('XZ'), {blocks:2, values:'none'})`
  2. `\sigma_x\otimes\sigma_z = \begin{pmatrix}0 & \sigma_z\\ \sigma_z & 0\end{pmatrix}` — Diagonal in neither one-qubit basis, yet a product operator (notes p. 23). **view** `mx(pa('XZ'), {blocks:2, highlight:[[0,2],[1,3],[2,0],[3,1]]})`
- Check: `q6XZ`, `q6XZket`.

**D6 · `q6-bell-basis:b7` · result `S^{\rm tot}_x = \begin{pmatrix}S^{(1)}_x & 0\\ 0 & 0\end{pmatrix},\ S^{(1)}_x = \tfrac\hbar{\sqrt2}\begin{pmatrix}0&1&0\\1&0&1\\0&1&0\end{pmatrix}`** (HW2 P1(e))
- Ground (4 views):
  1. `S^{\rm tot}_x = S_x\otimes I + I\otimes S_x` — Total spin adds the two spins, each acting on its own qubit. **view** `mx(pa('XI'), {blocks:2})` · *$X\otimes I$*
  2. `= \tfrac\hbar2\,(X\otimes I + I\otimes X)` — Each $S_x$ is $\tfrac\hbar2X$. **view** `mx(pa('IX'), {blocks:2})` · *$I\otimes X$*
  3. `\tfrac\hbar2\begin{pmatrix}0&1&1&0\\1&0&0&1\\1&0&0&1\\0&1&1&0\end{pmatrix}` — Add the two matrices. **view** `mx(lin(['1/2', pa('XI')], ['1/2', pa('IX')]))` · *their sum (units of ħ)*
  4. `S^{\rm tot}_x\,|0,0\rangle = 0` — The singlet's two terms are sent to the same state with opposite signs, so they cancel.
  5. `S^{\rm tot}_x = \begin{pmatrix}S^{(1)}_x & 0\\ 0 & 0\end{pmatrix},\ S^{(1)}_x = \tfrac\hbar{\sqrt2}\begin{pmatrix}0&1&0\\1&0&1\\0&1&0\end{pmatrix}` — In the triplet-and-singlet basis the matrix splits into a 3 × 3 block and a zero; the block is Homework 1's spin-1 $S_x$. **view** `mx(lin(['1/2', pa('XI')], ['1/2', pa('IX')]), {basis:[{ket:'00'},{bell:'Psi+'},{ket:'11'},{bell:'Psi-'}], highlightRow:3, highlightCol:3})` · *triplet block and an empty singlet row*
- Formal (2 views):
  1. `S^{\rm tot}_x = \tfrac\hbar2\,(X\otimes I + I\otimes X)` — HW2 P1(e). **view** `mx(lin(['1/2', pa('XI')], ['1/2', pa('IX')]))`
  2. `S^{\rm tot}_x = \begin{pmatrix}S^{(1)}_x & 0\\ 0 & 0\end{pmatrix},\ S^{(1)}_x = \tfrac\hbar{\sqrt2}\begin{pmatrix}0&1&0\\1&0&1\\0&1&0\end{pmatrix}` — $S^{\rm tot}_x$ commutes with the exchange of the particles, so it keeps symmetric and antisymmetric states apart. **view** the `basis` view of Ground step 5
- Check: `q6Stot`, `q6StotTS`. Needs: matrix-v2. (Direct sums are written as block matrices: ⊕ already means XOR.)

**D7 · `q6-bell-basis:b3` · result `\langle\beta_{xy}|\beta_{x'y'}\rangle = \delta_{xx'}\delta_{yy'}`** (notes p. 25)
- Ground (4 views):
  1. `\langle\Phi^+|\Psi^+\rangle = 0` — $\Phi^+$ uses 00 and 11 and $\Psi^+$ uses 01 and 10: no string in common. **view** `amp({bell:'Psi+'})` · *$\Psi^+$: bars at 01 and 10*
  2. `\langle\Phi^+|\Phi^-\rangle = \tfrac12 - \tfrac12 = 0` — The same strings with opposite relative signs: the two products cancel. **view** `amp({bell:'Phi-'})` · *$\Phi^-$: the 11 bar's hue flipped*
  3. `\langle\Phi^+|\Phi^+\rangle = \tfrac12 + \tfrac12 = 1` — Each state has length 1. **view** `amp({bell:'Phi+'})`
  4. `\langle\beta_{xy}|\beta_{x'y'}\rangle = \delta_{xx'}\delta_{yy'}` — Every pair of Bell states falls into one of these cases. **view** `mx(prod(adj(BC), BC))` · *$B^\dagger B = I$*
- Formal (2 views):
  1. `B = \big(\beta_{00}\ \beta_{01}\ \beta_{10}\ \beta_{11}\big) = \mathrm{CNOT}(H\otimes I)` — The columns of this product are the Bell states. **view** `mx(BC)` · *$B$*
  2. `\langle\beta_{xy}|\beta_{x'y'}\rangle = \delta_{xx'}\delta_{yy'}` — B is a product of unitaries, so $B^\dagger B = I$. **view** `mx(prod(adj(BC), BC))`
- Check: `q6BellGram`, `q6OvPhiPM`. Needs: matrix-v2.

**D8 · `q6-bell-circuit:b2` · result `(H\otimes I)\,\mathrm{CNOT}\,|\beta_{xy}\rangle = |xy\rangle`** (notes p. 26)
- Ground (4 views):
  1. `|\beta_{xy}\rangle = \tfrac1{\sqrt2}\big(|0, y\rangle + (-1)^x|1, 1\oplus y\rangle\big)` — The Bell state in its two-bit form. **view** `amp({circuit:C_BM('10'), upTo:2})` · *$\beta_{10} = (|00\rangle - |11\rangle)/\sqrt2$*
  2. `\mathrm{CNOT}:\ |1, 1\oplus y\rangle \to |1, y\rangle` — The CNOT flips qubit 2 only in the term where qubit 1 is 1. **view** `circ(C_BM('10'), 3)` · *the cursor after the CNOT*
  3. `\tfrac1{\sqrt2}\big(|0\rangle + (-1)^x|1\rangle\big)|y\rangle` — Now both terms end in $|y\rangle$, which factors out. **view** `amp({circuit:C_BM('10'), upTo:3})` · *$|{-}\rangle|0\rangle$: bars at 00 and 10*
  4. `H\,\tfrac1{\sqrt2}\big(|0\rangle + (-1)^x|1\rangle\big) = |x\rangle` — H turns $|+\rangle$ into $|0\rangle$ and $|-\rangle$ into $|1\rangle$. **view** `circ(C_BM('10'), 4)` · *the cursor after the H*
  5. `(H\otimes I)\,\mathrm{CNOT}\,|\beta_{xy}\rangle = |xy\rangle` — One basis string is left, so reading it gives x and y with certainty. **view** `amp({circuit:C_BM('10'), upTo:4})` · *one bar at 10*
- Formal (2 views):
  1. `\mathrm{CNOT}|\beta_{xy}\rangle = \tfrac1{\sqrt2}\big(|0\rangle + (-1)^x|1\rangle\big)|y\rangle` — CNOT maps $|1, 1\oplus y\rangle \to |1, y\rangle$. **view** `amp({circuit:C_BM('10'), upTo:3})`
  2. `(H\otimes I)\,\mathrm{CNOT}\,|\beta_{xy}\rangle = \tfrac12\big[(1 + (-1)^x)|0, y\rangle + (1 - (-1)^x)|1, y\rangle\big] = |xy\rangle` — One coefficient vanishes for each x (notes p. 26). **view** `mx(prod(UB, BC))` · *U applied to the Bell columns: the identity*
- Check: `q6BMMid`, `q6UBeta`, `q6BMOut`. Needs: matrix-v2 (Formal step 2 only).

**D9 · `q6-bell-circuit:b3` · result `|\beta_{xy}\rangle = \mathrm{CNOT}\,(H\otimes I)\,|xy\rangle`** (notes p. 27)
- Ground (4 views):
  1. `U = (H\otimes I)\,\mathrm{CNOT}` — The measuring circuit: the CNOT first, then the H. **view** `circ(C_U, 2)` · *Fig. 7's two gates*
  2. `U^\dagger = \mathrm{CNOT}^\dagger\,(H\otimes I)^\dagger` — Undoing a sequence of gates reverses their order.
  3. `H^\dagger = H,\quad \mathrm{CNOT}^\dagger = \mathrm{CNOT}` — Each of the two gates is its own inverse (Units 4.2 and 4.4).
  4. `|00\rangle \to \tfrac1{\sqrt2}(|0\rangle + |1\rangle)|0\rangle` — Run the reversed circuit on $|00\rangle$: the H acts first. **view** `amp({circuit:C_PREP('00'), upTo:1})` · *$(|00\rangle + |10\rangle)/\sqrt2$*
  5. `\to \tfrac1{\sqrt2}(|00\rangle + |11\rangle) = \Phi^+` — Then the CNOT copies qubit 1's bit onto qubit 2. **view** `amp({circuit:C_PREP('00'), upTo:2})` · *$\Phi^+$*
  6. `|\beta_{xy}\rangle = \mathrm{CNOT}\,(H\otimes I)\,|xy\rangle` — The same holds for every $|xy\rangle$. **view** `circ(C_PREP('00'), 2)` · *H, then CNOT*
- Formal (2 views):
  1. `U^\dagger = \mathrm{CNOT}\,(H\otimes I)` — Both factors are Hermitian and unitary (notes p. 27). **view** `circ(C_PREP('00'), 2)`
  2. `|\beta_{xy}\rangle = U^\dagger U|\beta_{xy}\rangle = \mathrm{CNOT}\,(H\otimes I)\,|xy\rangle` — Apply $U^\dagger$ to $U|\beta_{xy}\rangle = |xy\rangle$. **view** `mx(BC)` · *its columns are the $\beta_{xy}$*
- Check: `q6PrepMid`, `q6BMPrep`, `q6BMPrepIsBeta`. Needs: matrix-v2 (Formal step 2 only).

**D10 · `q6-parities:b1` · result `U^\dagger(Z\otimes I)U = X\otimes X,\quad U^\dagger(I\otimes Z)U = Z\otimes Z`** (notes Eq. 2.6, p. 27)
- Ground (4 views):
  1. `\text{read } Z_1 \text{ after } U \;=\; \text{read } U^\dagger Z_1U \text{ before}` — Measuring after a gate is measuring a moved question before it. **view** `circ(C_U, 2, {observable:{pauli:'ZI', at:2}})` · *$Z_1$ at the meters*
  2. `H\cdot Z\cdot H = X` — Moved back through the H on qubit 1, Z turns into X. **view** `mx(prod(G('H'), pa('Z'), G('H')))` · *$H\cdot Z\cdot H = X$*
  3. `\mathrm{CNOT}\,(X\otimes I)\,\mathrm{CNOT} = X\otimes X` — Moved back through the CNOT, an X on the control spreads to the target. **view** `circ(C_U, 2, {observable:{pauli:'ZI', at:0}})` · *at the input: $X_1X_2$*
  4. `U^\dagger(Z\otimes I)U = X\otimes X` — So reading $Z_1$ at the end reads $X_1X_2$ at the input.
  5. `U^\dagger(Z\otimes I)U = X\otimes X,\quad U^\dagger(I\otimes Z)U = Z\otimes Z` — For $Z_2$: the H skips qubit 2, and the CNOT spreads a Z on the target back to the control. **view** `circ(C_U, 2, {observable:{pauli:'IZ', at:0}})` · *$Z_2$ at the meters is $Z_1Z_2$ at the input*
- Formal (2 views):
  1. `U^\dagger(Z\otimes I)U = \mathrm{CNOT}\,(H\cdot Z\cdot H\otimes I)\,\mathrm{CNOT} = \mathrm{CNOT}\,(X\otimes I)\,\mathrm{CNOT}` — Conjugate one factor at a time. **view** `mx(prod(adj(UB), pa('ZI'), UB))` · *$= X\otimes X$*
  2. `U^\dagger(Z\otimes I)U = X\otimes X,\quad U^\dagger(I\otimes Z)U = Z\otimes Z` — CNOT conjugation sends $X_1 \to X_1X_2$ and $Z_2 \to Z_1Z_2$ (Eq. 2.6). **view** `circ(C_U, 2, {observable:{pauli:'IZ', at:0}})`
- Check: `q6HZH`, `q6CnotXI`, `q6CnotIZ`, `q6HeisZI`, `q6HeisIZ`. Needs: matrix-v2.

**D11 · `q6-parities:b2` · result `[XX, ZZ] = 0`** (notes p. 28)
- Ground (3 views):
  1. `X\cdot Z = -Z\cdot X` — On one qubit X and Z anticommute (Chapter Q3). **view** `mx(prod(pa('X'), pa('Z')))` · *$X\cdot Z$*
  2. `(X\otimes X)(Z\otimes Z) = (X\cdot Z)\otimes(X\cdot Z)` — Tensor products multiply slot by slot. **view** `mx({tableau:['XX','ZZ'], product:true})` · *one column per qubit*
  3. `= (-Z\cdot X)\otimes(-Z\cdot X)` — Swap the order in each slot, paying one minus sign each time.
  4. `= (Z\otimes Z)(X\otimes X)` — The two minus signs cancel.
  5. `[XX, ZZ] = 0` — So the two parities commute, and both can be measured together. **view** `mx(prod(pa('XX'), pa('ZZ')))` · *$XX\cdot ZZ = -YY$, the same in either order*
- Formal (2 views):
  1. `XX\cdot ZZ = (X\cdot Z)\otimes(X\cdot Z) = (-iY)\otimes(-iY) = -YY` — Slot by slot. **view** `mx({tableau:['XX','ZZ'], product:true})`
  2. `[XX, ZZ] = 0` — $ZZ\cdot XX = (iY)\otimes(iY) = -YY$ as well. **view** `mx(prod(pa('XX'), pa('ZZ')))`
- Check: `q6AntiXZ`, `q6XXZZ`, `q6Comm`. Needs: matrix-v2.

**D12 · `q6-parities:b3` · result `\Pi_{xy} = \tfrac12\big(I + (-1)^xXX\big)\cdot\tfrac12\big(I + (-1)^yZZ\big)`** (notes Eq. 2.7, p. 28)
- Ground (4 views):
  1. `ZZ\,|0, y\rangle = (-1)^y|0, y\rangle,\quad ZZ\,|1, 1\oplus y\rangle = (-1)^y|1, 1\oplus y\rangle` — ZZ is +1 when the bits agree, and both terms of $\beta_{xy}$ agree (y = 0) or both differ (y = 1). **view** `mx(pa('ZZ'))` · *$ZZ$ on the diagonal*
  2. `XX\,|\beta_{xy}\rangle = (-1)^x|\beta_{xy}\rangle` — XX flips both bits, which swaps the two terms; that swap costs the relative sign $(-1)^x$. **view** `tq({bell:'Phi-'}, {highlight:['xx','zz']})` · *$\beta_{10}$: $xx = -1$, $zz = +1$*
  3. `\beta_{00}: (+,+),\ \beta_{01}: (+,-),\ \beta_{10}: (-,+),\ \beta_{11}: (-,-)` — The four sign pairs all differ, so the two parities name the state. **view** `tq({bell:'Psi-'}, {highlight:['xx','zz']})` · *$\beta_{11}$: both −1*
  4. `\tfrac12\big(I + (-1)^xXX\big)` — This keeps the part with XX-value $(-1)^x$ and removes the rest. **view** `mx(lin(['1/2', I4], ['-1/2', pa('XX')]), {basis:'bell'})` · *$\tfrac12(I - XX)$: 1 on $\beta_{10}$ and $\beta_{11}$*
  5. `\Pi_{xy} = \tfrac12\big(I + (-1)^xXX\big)\cdot\tfrac12\big(I + (-1)^yZZ\big)` — Keeping both values leaves exactly one Bell state. **view** `mx({outer:[{bell:'Phi-'}]}, {basis:'bell'})` · *$\Pi_{10}$: a single 1*
- Formal (2 views):
  1. `XX|\beta_{xy}\rangle = (-1)^x|\beta_{xy}\rangle,\quad ZZ|\beta_{xy}\rangle = (-1)^y|\beta_{xy}\rangle` — Eq. 2.7. **view** `tq({bell:'Phi-'}, {highlight:['xx','zz']})`
  2. `\Pi_{xy} = \tfrac12\big(I + (-1)^xXX\big)\cdot\tfrac12\big(I + (-1)^yZZ\big)` — Each factor is one parity's spectral projector; their product has rank 1 (notes p. 28). **view** `mx({outer:[{bell:'Phi-'}]}, {basis:'bell'})`
- Check: `q6EigXX`, `q6EigZZ`, `q6MinusXXhalf`, `q6PiFactor`. Needs: two-qubit, matrix-v2.

**D13 · `q6-parities:b5` · result `U\hat MU^\dagger = 2\hat n_1 + \hat n_2`** (notes Eq. 2.8, p. 28)
- Ground (4 views):
  1. `\hat M = (I - XX) + \tfrac12(I - ZZ)` — Build one operator out of the two parities. **view** `mx(M)` · *$\hat M$ in the 0/1 basis*
  2. `\hat M|\beta_{xy}\rangle = (2x + y)|\beta_{xy}\rangle` — On a Bell state each parity is a number: $1 - (-1)^x = 2x$ and $\tfrac12(1 - (-1)^y) = y$. **view** `mx(M, {basis:'bell'})` · *in the Bell basis: diag(0, 1, 2, 3)*
  3. `U\,(XX)\,U^\dagger = Z\otimes I,\quad U\,(ZZ)\,U^\dagger = I\otimes Z` — The moves of Unit 6.6's first beat, run the other way. **view** `mx(prod(UB, pa('XX'), adj(UB)))` · *$XX$ pushed through: $Z\otimes I$*
  4. `\hat n_i = |1\rangle\langle1|_i = \tfrac12(I - Z_i)` — $\hat n_i$ reads qubit i's bit: 0 on $|0\rangle$, 1 on $|1\rangle$. **view** `mx(lin(['1/2', I4], ['-1/2', pa('ZI')]))` · *$\hat n_1 = \mathrm{diag}(0, 0, 1, 1)$*
  5. `U\hat MU^\dagger = (I - Z_1) + \tfrac12(I - Z_2) = 2\hat n_1 + \hat n_2` — The same values, now on 00, 01, 10, 11. **view** `mx(prod(UB, M, adj(UB)))` · *diag(0, 1, 2, 3) in the 0/1 basis*
- Formal (2 views):
  1. `\hat M = \sum_{xy}(2x + y)\,\Pi_{xy}` — Eigenvalues 0–3 on the $\beta_{xy}$. **view** `mx(M, {basis:'bell'})`
  2. `U\hat MU^\dagger = 2\hat n_1 + \hat n_2` — Invert Eq. 2.6; the result is diagonal in the computational basis (notes Eq. 2.8). **view** `mx(prod(UB, M, adj(UB)))`
- Check: `q6MEig`, `q6MDiag`, `q6InvXX`, `q6InvZZ`, `q6N1`. Needs: matrix-v2.

**D14 · `q6-bell-circuit:b6` · result `p_{00} = \tfrac{2+\sqrt3}4,\quad p_{10} = \tfrac{2-\sqrt3}4`** (HW2 P2(c))
- Ground (3 views):
  1. `\Psi_2 = \tfrac{\sqrt3}2|00\rangle + \tfrac12|11\rangle` — The input uses only the strings 00 and 11. **view** `amp({circuit:C_F7C, upTo:2})` · *$\Psi_2$: 0.866 and 0.5*
  2. `\beta_{00} = \tfrac1{\sqrt2}(|00\rangle + |11\rangle),\quad \beta_{10} = \tfrac1{\sqrt2}(|00\rangle - |11\rangle)` — Only these two Bell states use 00 and 11.
  3. `\langle\beta_{00}|\Psi_2\rangle = \tfrac1{\sqrt2}\big(\tfrac{\sqrt3}2 + \tfrac12\big) = \tfrac{\sqrt3 + 1}{2\sqrt2}` — Multiply matching amplitudes and add. **view** `amp({circuit:C_F7C, upTo:2}, {inBasis:'bell'})` · *in the Bell basis: 0.966 and 0.259*
  4. `\langle\beta_{10}|\Psi_2\rangle = \tfrac{\sqrt3 - 1}{2\sqrt2}` — The minus sign of $\beta_{10}$ subtracts instead.
  5. `p_{00} = \tfrac{(\sqrt3 + 1)^2}8 = \tfrac{2+\sqrt3}4,\quad p_{10} = \tfrac{2-\sqrt3}4` — Square: $(\sqrt3 \pm 1)^2 = 4 \pm 2\sqrt3$. **view** `amp({circuit:C_F7C, upTo:4}, {mode:'probability'})` · *after the circuit: 0.933 at 00, 0.067 at 10*
- Formal (2 views):
  1. `|\Psi_2\rangle = \tfrac{\sqrt3+1}{2\sqrt2}|\beta_{00}\rangle + \tfrac{\sqrt3-1}{2\sqrt2}|\beta_{10}\rangle` — Expand in the Bell basis (HW2 P2(c)). **view** `amp({circuit:C_F7C, upTo:2}, {inBasis:'bell'})`
  2. `p_{00} = \tfrac{2+\sqrt3}4,\quad p_{10} = \tfrac{2-\sqrt3}4` — $p_{01} = p_{11} = 0$, and the circuit's output bars agree. **view** `amp({circuit:C_F7C, upTo:4}, {mode:'probability'})`
- Check: `q6P2cAmp`, `q6P2c`, `q6P2cViaCircuit`. Needs: matrix-v2 (`inBasis`).

**Count.** 14 derivations; Ground has 3–4 distinct views each and Formal 2 each. D1, D4, D5 and D8–D9's Ground lists build on
`matrix` v1, `amplitudes` and `circuit` alone.

## 3. Try-it widget per unit

No widget handles two qubits yet (§9.3 W2, deferred). Each unit uses the one-qubit picture of its key step, with the
prop forms Q5 already uses.

| Unit | Widget spec | Why this one |
|---|---|---|
| `q6-many` | `{kind:'deposit-stats', props:{state:'+x', axis:'z', seed:709}}` | One qubit gives two outcomes; the pair's grid has 2 × 2 cells (weak fit). |
| `q6-tensor` | `{kind:'bloch', props:{theta:60, phi:0, editable:true, measure:'z'}}` | ψ₁ at θ = 60°: its z-part 0.5 and x-part 0.866 are the numbers that multiply in the grid. |
| `q6-entangled` | `{kind:'bloch', props:{theta:90, phi:0, editable:true, landmarks:true}}` | A product state is two such points: two angles each, four in all. |
| `q6-bell-basis` | `{kind:'deposit-stats', props:{state:'+x', axis:'z', seed:709}}` | Each qubit of a Bell pair alone reads like a fair coin. |
| `q6-bell-circuit` | `{kind:'bloch', props:{theta:90, phi:180, editable:false, measure:'x'}}` | After the CNOT qubit 1 is $|+\rangle$ or $|-\rangle$; the H turns that into a sure 0 or 1. |
| `q6-parities` | `{kind:'bloch', props:{theta:0, phi:0, editable:true, measure:'x'}}` | $H\cdot Z\cdot H = X$: a z reading after H is an x reading before it. |

**Try this:**
- `q6-many`: (1) Fire 20: about half each way. · `q6-tensor`: (1) Set θ = 60°: read 0.5 along z. (2) Measure x: 0.866.
- `q6-entangled`: (1) Drag the point: two angles fix it. · `q6-bell-basis`: (1) Fire 100: close to 50/50.
- `q6-bell-circuit`: (1) φ = 180° is $|-\rangle$: every x reading is −. · `q6-parities`: (1) θ = 90°: x readings are sure; z readings are not.

## 4. Challenges per unit

Tolerance 0.005 unless stated. Hints climb nudge → key idea → setup. **Homework:** HW2 is submitted, so its items have
full walkthroughs (ruling 12); they are marked (HW2). No other sheet assigns anything here.

### `q6-many`
1. **warm-up · numeric · `q6-m-count`** — "How many amplitudes does a general state of 3 qubits carry?"
   - Answer: **8** = `q6AmpCount[2]`. Hints: (1) Each qubit doubles the count. (2) 2 × 2 × 2. (3) One per bit string. Walkthrough: the strings 000 … 111, eight of them.
2. **core · numeric · `q6-m-dim`** — "A qubit and a spin-1 particle (3 basis states) form a pair. What is the dimension of its state space?"
   - Answer: **6** = `q6DimSpin1`. Hints: (1) Dimensions multiply. (2) 2 × 3. (3) One basis state per pairing. Walkthrough: $d_1d_2 = 6$.
3. **core · numeric · `q6-m-amp`** — "Qubit 1 is $|0\rangle$ and qubit 2 is $|+\rangle$. What is the $|01\rangle$ amplitude of the pair?"
   - Answer: **0.7071** = `q6ProdZX[1]`. Hints: (1) A product's amplitude is a product of amplitudes. (2) Qubit 1's $|0\rangle$ part times qubit 2's $|1\rangle$ part. (3) $1\times1/\sqrt2$. Walkthrough: 0.707.
4. **stretch · numeric · `q6-m-mem`** — "At 16 bytes per amplitude, how many GiB ($2^{30}$ bytes) hold the state of 30 qubits?"
   - Answer: **16** = `q6Gib30`. Hints: (1) $2^{30}$ amplitudes. (2) Times 16 bytes. (3) Divide by $2^{30}$. Walkthrough: 16 GiB; each extra qubit doubles it.

### `q6-tensor`
1. **warm-up · choice · `q6-t-xi`** — "Which matrix is X acting on qubit 1 of a pair?"
   - Options: **$X\otimes I$** ✓ · $I\otimes X$ · $X\cdot I$ · $X\otimes X$. Check: `q6XI`. Hints: (1) Qubit 1 is the first slot. (2) Qubit 2 must be left alone. (3) "Leave alone" is I. Walkthrough: $X_1 = X\otimes I$.
2. **core · numeric · `q6-t-entry`** — "What is the entry of $\sigma_x\otimes\sigma_z$ in row 2, column 4 (numbering 1–4)?"
   - Answer: **−1** = `q6XZ[1][3]`. Hints: (1) Row 2, column 4 lies in the top-right block. (2) That block is $X_{12}Z = Z$. (3) Z's lower-right entry. Walkthrough: −1.
3. **core · numeric · `q6-t-avg`** — "For $\psi_1\otimes|+\rangle$ with $\psi_1 = 0.866|0\rangle + 0.5|1\rangle$, what is $\langle X\otimes X\rangle$?"
   - Answer: **0.8660** = `q6ExpXX`. Hints: (1) A product's averages multiply. (2) $\langle X\rangle$ of $\psi_1$ is $2(0.866)(0.5)$. (3) $\langle X\rangle$ of $|+\rangle$ is 1. Walkthrough: 0.866 × 1 = 0.866.
4. **stretch · numeric · `q6-t-zz`** — "Same state: what is $\langle Z\otimes Z\rangle$?"
   - Answer: **0** = `q6ExpZZ`. Hints: (1) Multiply again. (2) $\langle Z\rangle$ of $|+\rangle$? (3) Zero. Walkthrough: 0.5 × 0 = 0.

### `q6-entangled`
1. **warm-up · numeric · `q6-e-params`** — "How many real parameters specify a general pure state of 3 qubits?"
   - Answer: **14** = `q6Param[2][0]`. Hints: (1) 8 complex amplitudes. (2) 16 real numbers. (3) Remove the norm and the phase. Walkthrough: $2\cdot2^3 - 2 = 14$.
2. **core · numeric · `q6-e-frac`** — "For N = 3, what fraction of a general state's parameters does a product state use?"
   - Answer: **0.4286** = `q6Param[2][2]`. Hints: (1) A product needs 2 per qubit. (2) 6 of 14. (3) Divide. Walkthrough: 6/14 = 0.429.
3. **core · numeric · `q6-e-det`** — "Compute $c_{00}c_{11} - c_{01}c_{10}$ for $(|00\rangle + |01\rangle + |10\rangle - |11\rangle)/2$."
   - Answer: **−0.5** = `q6DetCZpp`. Hints: (1) All four have size ½. (2) $c_{11} = -\tfrac12$. (3) $(\tfrac12)(-\tfrac12) - (\tfrac12)(\tfrac12)$. Walkthrough: −0.5: entangled.
4. **stretch · choice · `q6-e-which`** — "Which of these is a product state?"
   - Options: **$(|00\rangle + |01\rangle + |10\rangle + |11\rangle)/2$** ✓ · $(|00\rangle + |11\rangle)/\sqrt2$ · $(|01\rangle - |10\rangle)/\sqrt2$ · $(|00\rangle + |01\rangle + |10\rangle - |11\rangle)/2$. Check: `q6DetPP` → 0; `q6DetBell` → ±0.5; `q6DetCZpp` → −0.5. Hints: (1) Use the test. (2) Only one gives 0. (3) $\tfrac14 - \tfrac14$. Walkthrough: $|+\rangle|+\rangle$.

### `q6-bell-basis`
1. **warm-up · choice · `q6-b-name`** — "Which Bell state is $\beta_{11}$?"
   - Options: **$(|01\rangle - |10\rangle)/\sqrt2$** ✓ · $(|00\rangle + |11\rangle)/\sqrt2$ · $(|01\rangle + |10\rangle)/\sqrt2$ · $(|00\rangle - |11\rangle)/\sqrt2$. Check: `q6BellAmps[3]`. Hints: (1) y = 1: the bits differ. (2) x = 1: the terms subtract. (3) $\Psi^-$. Walkthrough: the singlet.
2. **core · numeric · `q6-b-overlap`** — "What is $\langle\Phi^+|\Phi^-\rangle$?"
   - Answer: **0** = `q6OvPhiPM`. Hints: (1) Same strings. (2) Opposite relative signs. (3) $\tfrac12 - \tfrac12$. Walkthrough: 0.
3. **core · numeric · `q6-b-p1a` (HW2 P1(a))** — "Write $|{+x}\rangle\otimes|{+x}\rangle$ in the triplet basis. What is its $|1, 0\rangle$ component?"
   - Answer: **0.7071** = `q6P1a[1]`. Hints: (1) $|{+x},{+x}\rangle = \tfrac12(|00\rangle + |01\rangle + |10\rangle + |11\rangle)$. (2) $|1,0\rangle = (|01\rangle + |10\rangle)/\sqrt2$. (3) Overlap: $\tfrac1{\sqrt2}(\tfrac12 + \tfrac12)$.
   - Walkthrough: the components on $|1,1\rangle$ and $|1,-1\rangle$ are ½ each, on $|1,0\rangle$ it is $1/\sqrt2$, and the singlet part is 0. So the state is $(\tfrac12, \tfrac1{\sqrt2}, \tfrac12)$, HW1's $|{+1_x}\rangle$. Part (b) flips the middle sign: $|{-1_x}\rangle$.
4. **core · numeric · `q6-b-p1c` (HW2 P1(c))** — "What is the singlet component of $|{+x}\rangle\otimes|{-x}\rangle$?"
   - Answer: **−0.7071** = `q6P1c[3]`. Hints: (1) $|{+x},{-x}\rangle = \tfrac12(|00\rangle - |01\rangle + |10\rangle - |11\rangle)$. (2) $\langle0,0| = (\langle01| - \langle10|)/\sqrt2$. (3) $\tfrac1{\sqrt2}(-\tfrac12 - \tfrac12)$.
   - Walkthrough: $-1/\sqrt2$, so the state is not spin 1. The symmetrized sum $(|{+x},{-x}\rangle + |{-x},{+x}\rangle)/\sqrt2 = (|1,1\rangle - |1,-1\rangle)/\sqrt2 = \Phi^-$ (`q6P1cSym`), HW1's $|0_x\rangle$ up to an overall sign.
5. **stretch · numeric · `q6-b-stot` (HW2 P1(e))** — "In the basis $|1,1\rangle, |1,0\rangle, |1,-1\rangle, |0,0\rangle$, what is the $(|1,1\rangle, |1,0\rangle)$ entry of $S^{\rm tot}_x$, in units of ħ?"
   - Answer: **0.7071** = `q6StotTS[0][1]`. Hints: (1) $S^{\rm tot}_x = \tfrac12(X\otimes I + I\otimes X)$ in units of ħ. (2) Apply it to $|1,0\rangle$. (3) Read the $|00\rangle$ part.
   - Walkthrough: $S^{\rm tot}_x|1,0\rangle = \tfrac1{\sqrt2}(|00\rangle + |11\rangle)$, so the entry is $1/\sqrt2$. The singlet row and column are 0, and the triplet block is the spin-1 $S_x$.

### `q6-bell-circuit`
1. **warm-up · choice · `q6-c-out`** — "The measuring circuit receives $\Phi^-$. What does it record?"
   - Options: **10** ✓ · 01 · 00 · 11. Check: `q6BMOut[2]`. Hints: (1) $\Phi^- = \beta_{10}$. (2) The circuit sends $\beta_{xy}$ to $|xy\rangle$. (3) x = 1, y = 0. Walkthrough: 10.
2. **core · numeric · `q6-c-mid`** — "After the CNOT, $\beta_{11}$ becomes $(|0\rangle - |1\rangle)|1\rangle/\sqrt2$. What is its $|11\rangle$ amplitude?"
   - Answer: **−0.7071** = `q6BMMid[3][3]`. Hints: (1) Expand. (2) The $|1\rangle|1\rangle$ term carries the minus. (3) $-1/\sqrt2$. Walkthrough: −0.707.
3. **core · numeric · `q6-c-p2a` (HW2 P2(a))** — "Expand $|0\rangle\otimes|{+x}\rangle$ in the Bell basis. What is the probability of outcome 11?"
   - Answer: **0.25** = `q6P2a[3]`. Hints: (1) $|0\rangle|+\rangle = (|00\rangle + |01\rangle)/\sqrt2$. (2) $\langle\beta_{11}| = (\langle01| - \langle10|)/\sqrt2$. (3) Square the overlap.
   - Walkthrough: every overlap is ½, so $|0\rangle|+\rangle = \tfrac12\sum_{xy}|\beta_{xy}\rangle$ and each outcome has ¼. The Bell measurement returns two random bits and tells nothing about this state.
4. **stretch · numeric · `q6-c-p2c` (HW2 P2(c))** — "For $(\sqrt3|00\rangle + |11\rangle)/2$, what is the probability of outcome 00?"
   - Answer: **0.9330** = `q6P2c[0]`. Hints: (1) Only $\beta_{00}$ and $\beta_{10}$ share its strings. (2) $\langle\beta_{00}|\Psi_2\rangle = (\sqrt3 + 1)/(2\sqrt2)$. (3) Square it.
   - Walkthrough: $p_{00} = (2 + \sqrt3)/4 = 0.933$, $p_{10} = (2 - \sqrt3)/4 = 0.067$, $p_{01} = p_{11} = 0$.

### `q6-parities`
1. **warm-up · choice · `q6-p-heis`** — "Reading Z on qubit 2 after the measuring circuit's gates measures which operator on the incoming pair?"
   - Options: **$Z\otimes Z$** ✓ · $X\otimes X$ · $I\otimes Z$ · $Z\otimes I$. Check: `q6HeisIZ`. Hints: (1) Move $Z_2$ back through the gates. (2) The H misses qubit 2. (3) The CNOT spreads a target Z to the control. Walkthrough: $Z_1Z_2$.
2. **core · numeric · `q6-p-eig`** — "What is the eigenvalue of $X\otimes X$ on $\Psi^-$?"
   - Answer: **−1** = `q6EigXX[3]`. Hints: (1) $\Psi^- = \beta_{11}$. (2) $XX\beta_{xy} = (-1)^x\beta_{xy}$. (3) x = 1. Walkthrough: −1.
3. **core · numeric · `q6-p-p2b` (HW2 P2(b))** — "For $|0\rangle\otimes|{+x}\rangle$, what is $\langle\sigma_{x1}\sigma_{x2}\rangle$?"
   - Answer: **0** = `q6P2b[0]`. Hints: (1) A product's averages multiply. (2) $\langle X\rangle$ of $|0\rangle$ is 0. (3) $0\times1$.
   - Walkthrough: $\langle XX\rangle = 0\times1 = 0$ and $\langle ZZ\rangle = 1\times0 = 0$. From part (a), $\sum_{xy}(-1)^xp_{xy} = \tfrac14 + \tfrac14 - \tfrac14 - \tfrac14 = 0$, and likewise for y: they agree.
4. **stretch · numeric · `q6-p-m`** — "$\hat M = (I - XX) + \tfrac12(I - ZZ)$. What is its value on $\beta_{10}$?"
   - Answer: **2** = `q6MEig[2]`. Hints: (1) On $\beta_{10}$, XX = −1 and ZZ = +1. (2) $(1 + 1) + \tfrac12(1 - 1)$. (3) $2x + y$. Walkthrough: 2.

## 5. Glossary terms new in Q6

`introduces` marks the notation beats (W-709 #8). Inline math in the strings is TeX inside `$…$`.

| id | Term | introduces | Ground gloss | Formal definition | First use | bridge |
|---|---|---|---|---|---|---|
| `qc-composite-space` | joint space | space | The space of two systems together. Its dimension is the product of theirs, and its amplitudes fill a grid. | $V^{(1)}\otimes V^{(2)}$, spanned by $\|i_1\rangle\otimes\|i_2\rangle$; $\dim = d_1d_2$. | `q6-many:b1` | — |
| `qc-product-state` | product state | — | A state of a pair in which each part has a state of its own. | $\|\Psi\rangle = \|\psi_1\rangle\otimes\|\psi_2\rangle$ (the notes: separable, pure case). | `q6-many:b3` | — |
| `qc-operator-tensor` | tensor product of operators | notation | One operator per part, each acting on its own part only. | $(A\otimes B)(u\otimes v) = Au\otimes Bv$; matrix $[A_{ij}B]$ (Eq. 2.1); $A_1 \equiv A\otimes I$. | `q6-tensor:b1` | — |
| `qc-parity` | parity | — | Whether two bits agree (+1) or differ (−1). | $Z\otimes Z\|ab\rangle = (-1)^{a\oplus b}\|ab\rangle$; $X\otimes X$ likewise in the x basis. | `q6-tensor:b3` | — |
| `qc-pauli-string` | Pauli string | notation | One Pauli letter per qubit, left to right: $XZ$ is X on qubit 1 and Z on qubit 2. | $P_1\cdots P_n \equiv P_1\otimes\cdots\otimes P_n$, $P_k \in \{I, X, Y, Z\}$. | `q6-tensor:b3` | — |
| `qc-correlation-grid` | correlation grid | notation | The 3 × 3 table of averages of a reading on qubit 1 times a reading on qubit 2. | $T_{ij} = \langle\sigma_i\otimes\sigma_j\rangle$, beside $r_A$, $r_B$; $T = r_Ar_B^{\mathsf T}$ for a product. | `q6-tensor:b5` | — |
| `qc-entangled` | entangled state | — | A state of a pair that is not a product: neither part has a state of its own. | $\|\Psi\rangle \ne \|\psi_1\rangle\otimes\|\psi_2\rangle$ for all $\psi_1, \psi_2$ (pure case; mixed states: Chapter Q10). | `q6-entangled:b2` | — |
| `qc-factoring-test` | product test | — | Two qubits are in a product state exactly when the cross products of their amplitude grid agree. | $\det C = c_{00}c_{11} - c_{01}c_{10} = 0$ ⇔ rank C = 1. | `q6-entangled:b4` | — |
| `qc-bell-basis` | Bell basis | space | Four entangled two-qubit states that together form a basis. | $\{\Phi^\pm, \Psi^\pm\}$, orthonormal in $\mathbb C^2\otimes\mathbb C^2$ (Eq. 2.3). | `q6-bell-basis:b1` | `qc-l2-three-bases` |
| `qc-beta-xy` | $\beta_{xy}$ | notation | A Bell state's two-bit name: y says whether the qubits differ, x whether the terms subtract. | $\|\beta_{xy}\rangle = (\|0,y\rangle + (-1)^x\|1,1\oplus y\rangle)/\sqrt2$ (Eq. 2.4). | `q6-bell-basis:b2` | — |
| `qc-triplet` | triplet | — | The three two-spin states that stay the same when the spins swap: total spin 1. | $\|1,1\rangle = \|{\uparrow\uparrow}\rangle$, $\|1,0\rangle = \Psi^+$, $\|1,-1\rangle = \|{\downarrow\downarrow}\rangle$. | `q6-bell-basis:b5` | — |
| `qc-singlet` | singlet | — | The two-spin state that changes sign when the spins swap: total spin 0. | $\|0,0\rangle = \Psi^- = (\|{\uparrow\downarrow}\rangle - \|{\downarrow\uparrow}\rangle)/\sqrt2$. | `q6-bell-basis:b5` | — |
| `qc-bell-measurement` | Bell measurement | — | A reading that tells which Bell state a pair is in: a CNOT, an H, then two ordinary readings. | The projective measurement $\{\Pi_{xy}\}$, realised by $U = (H\otimes I)\mathrm{CNOT}$ and Z on each line. | `q6-bell-circuit:b1` | — |
| `qc-bell-projector` | $\Pi_{xy}$ | notation | The projector that keeps the $\beta_{xy}$ part of a pair's state. | $\Pi_{xy} = \|\beta_{xy}\rangle\langle\beta_{xy}\|$, $\sum_{xy}\Pi_{xy} = I$ (Eq. 2.5). | `q6-bell-circuit:b4` | `qc-l4-projectors` |
| `qc-stabilizer` | stabilizer | notation | An operator that leaves a state exactly unchanged. | $g\|\psi\rangle = +\|\psi\rangle$; $\Phi^+$ has the generators XX and ZZ. | `q6-parities:b4` | — |
| `qc-number-operator` | bit operator $\hat n$ | notation | The operator that reads one qubit's bit: 0 on $\|0\rangle$, 1 on $\|1\rangle$. | $\hat n_i = \|1\rangle\langle1\|_i = (I - Z_i)/2$. | `q6-parities:b5` | — |

(In the table `\|` is a Markdown escape; the strings carry a plain `|`.) Reused: `qc-tensor-product`, `qc-register`,
`qc-cnot`, `qc-controlled-gate`, `qc-bell-state`, `qc-xor` (Q4); `qc-projector`, `qc-pauli-matrices`, `qc-expectation`,
`qc-anticommutator`, `qc-compatible`, `qc-simultaneous-eigenvector`, `qc-degenerate` (Q3).

**Notation and space beats (one each, both tracks, with a view):**

| Gloss id | Kind | Beat | View |
|---|---|---|---|
| `qc-composite-space` | space | `q6-many:b1` | `amp({ket:'++'})` over `mx({coef:{ket:'++'}})` |
| `qc-operator-tensor` | notation | `q6-tensor:b1` | `mx(pa('XI'), {blocks:2})` |
| `qc-pauli-string` | notation | `q6-tensor:b3` | `mx(pa('ZZ'), {blocks:2})` |
| `qc-correlation-grid` | notation | `q6-tensor:b5` | `tq({circuit:C_PROD, upTo:1})` (needs: two-qubit) |
| `qc-bell-basis` | space | `q6-bell-basis:b1` | `amp({bell:'Phi+'})` over `mx(BC)` (needs: matrix-v2) |
| `qc-beta-xy` | notation | `q6-bell-basis:b2` | `amp({bell:'Phi-'})` over `mx(BC, {highlightCol:2})` (needs: matrix-v2) |
| `qc-bell-projector` | notation | `q6-bell-circuit:b4` | `mx({outer:[{bell:'Phi-'}]}, {blocks:2})` |
| `qc-stabilizer` | notation | `q6-parities:b4` | `mx({tableau:['XX','ZZ']})` over `tq({bell:'Phi+'})` (needs: both) |
| `qc-number-operator` | notation | `q6-parities:b5` | `mx(prod(UB, M, adj(UB)))` (needs: matrix-v2) |

Not here, by ownership: ℂ²⊗ℂ² and ⊗ on kets (Q4 `q4-registers`, tagged by the R3 retrofit; Q6 links back at
`q6-many:b1` and `b3`).

## 6. Review card per unit (both tracks)

### `q6-many`
- **G points:** (1) Two qubits have 2 × 2 = 4 basis states, not 2 + 2. (2) N qubits carry $2^N$ amplitudes against N bits for N coins. (3) Two independently prepared qubits form a product state.
- **F points:** (1) $\dim(V^{(1)}\otimes V^{(2)}) = d_1d_2$. (2) $2^N$ amplitudes: the memory wall. (3) $|\psi_1\rangle\otimes|\psi_2\rangle$ has an outer-product amplitude array.
- **Equations:** $|\Psi\rangle = \sum_{i_1, i_2}c_{i_1i_2}|i_1\rangle_1\otimes|i_2\rangle_2$
- **Trap:** adding dimensions (2 + 2) instead of multiplying them.

### `q6-tensor`
- **G points:** (1) An operator on qubit 1 alone is $A\otimes I$. (2) $A\otimes B$: each entry of A times a copy of B. (3) $XZ$ names $X\otimes Z$, one letter per qubit. (4) A product state's averages multiply.
- **F points:** (1) Eq. 2.1. (2) $\langle A\otimes B\rangle = \langle A\rangle\langle B\rangle$ for products. (3) $T = r_Ar_B^{\mathsf T}$ for products.
- **Equations:** $A\otimes B = [A_{ij}B],\quad \langle\psi_1\psi_2|A\otimes B|\psi_1\psi_2\rangle = \langle A\rangle\langle B\rangle$
- **Trap:** reading $XZ$ as the 2 × 2 product $X\cdot Z$; and thinking a product operator must be diagonal somewhere.

### `q6-entangled`
- **G points:** (1) Two qubits: 6 numbers; products use 4. (2) The share of products collapses as N grows. (3) $\Phi^+$ is not a product. (4) Test: $c_{00}c_{11} - c_{01}c_{10} = 0$ for products only.
- **F points:** (1) $2\cdot2^N - 2$ against $2N$. (2) Rank-1 coefficient matrix ⇔ product. (3) Singular values: one for a product, two for an entangled pair.
- **Equations:** $\det C = c_{00}c_{11} - c_{01}c_{10}$
- **Trap:** "all four amplitudes non-zero means entangled": $|+\rangle|+\rangle$ has four and is a product.

### `q6-bell-basis`
- **G points:** (1) Four entangled states, $\Phi^\pm$ and $\Psi^\pm$, form a basis. (2) $\beta_{xy}$: y says agree or differ, x says plus or minus. (3) Single readings are random; pairs are perfectly correlated. (4) $\Psi^+$ is a triplet state and $\Psi^-$ the singlet.
- **F points:** (1) Eqs. 2.3–2.4, orthonormality. (2) $r_A = r_B = 0$, $T$ diagonal with entries ±1. (3) HW2 P1: $|{\pm x},{\pm x}\rangle = |{\pm1_x}\rangle$; $S^{\rm tot}_x$ is block-diagonal.
- **Equations:** $|\beta_{xy}\rangle = \tfrac1{\sqrt2}\big(|0, y\rangle + (-1)^x|1, 1\oplus y\rangle\big)$
- **Trap:** mixing the name systems: the notes' $\beta_{10}$ is $\Phi^-$, and Bergou's $\Psi_\pm$ are our $\Phi^\pm$.

### `q6-bell-circuit`
- **G points:** (1) Rotate the Bell basis to the 0/1 basis, then read two bits. (2) CNOT, then H on qubit 1: $\beta_{xy} \to |xy\rangle$. (3) Run backwards, the circuit makes Bell states. (4) Outcome chances are $\langle\Psi|\Pi_{xy}|\Psi\rangle$.
- **F points:** (1) $U = (H\otimes I)\mathrm{CNOT}$, $U^\dagger = \mathrm{CNOT}(H\otimes I)$. (2) Eq. 2.5. (3) HW2 P2(a), (c).
- **Equations:** $(H\otimes I)\,\mathrm{CNOT}\,|\beta_{xy}\rangle = |xy\rangle$
- **Trap:** reversing the order: the measuring circuit is CNOT first, then H.

### `q6-parities`
- **G points:** (1) Reading Z after the gates reads a two-qubit parity before them. (2) $X_1X_2$ and $Z_1Z_2$ commute. (3) The two bits are the two parities. (4) $X_1X_2$, $Z_1Z_2$ stabilize $\Phi^+$.
- **F points:** (1) Eq. 2.6. (2) Eq. 2.7 and the factorized $\Pi_{xy}$. (3) Eq. 2.8: $U\hat MU^\dagger = 2\hat n_1 + \hat n_2$.
- **Equations:** $U^\dagger(Z\otimes I)U = X\otimes X,\quad U^\dagger(I\otimes Z)U = Z\otimes Z$
- **Trap:** conjugating the wrong way: $U^\dagger\hat MU$ has no meaning here; the observable moves as $U\hat MU^\dagger$.

## 7. Symbol-before-use tables

Abbreviations: ma, te, en, bb, bc, pa (the six units in order). Carried from Q2–Q4 and recapped at `q6-many:b1`:
$|0\rangle$, $|1\rangle$, $|\pm\rangle$, $|\psi\rangle$, ⊗ on kets and $|ab\rangle$ (Unit 4.3), X, Y, Z, H, I, CNOT, CZ,
⊕, $(-1)^{f}$ (Q5), $\langle A\rangle$, projectors, eigenvalues, commuting and anticommuting, the Bloch arrow, ħ.

### 7.1 Ground track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $d_1$, $d_2$ | ma:b1 | ma:b1 | OK | — |
| $N$, $2^N$ | ma:b2 | ma:b2 | OK | — |
| $A\otimes I$, $A_1$ | te:b1 | te:b1 | OK | A is any one-qubit operator. |
| $X\otimes Z$, blocks | te:b2 | te:b2 | OK | — |
| $XZ$ (string), $ZZ$, $X\cdot Z$ | te:b3 | te:b3 | **FLAG** | String against one-qubit product, stated in place (§12 Q5). |
| $\psi_1$ | te:b4 | te:b4 | OK | Written out in the beat. |
| $Z_1$, $X_2$, $Z_1Z_2$ | te:b4 | te:b1 | OK | Subscript = qubit. |
| arrows, grid | te:b5 | te:b5 | OK | — |
| $\Phi^+$ | en:b3 | Unit 4.5 | OK | Link-back; Rosetta at bb:b2 (§12 Q3). |
| $a, b, c, d$ | en:b3 | en:b3 | OK | — |
| $c_{00}, \ldots, c_{11}$ | en:b4 | en:b4 | **FLAG** | Formal meets $c_{i_1i_2}$ at ma:b1; Ground first here. |
| $\Phi^\pm$, $\Psi^\pm$ | bb:b1 | bb:b1 | OK | — |
| $\beta_{xy}$, x, y | bb:b2 | bb:b2 | OK | — |
| $\uparrow$, $\downarrow$ | bb:b5 | bb:b5 | OK | — |
| $\|{\pm x}\rangle$, $\|{\pm1_x}\rangle$, $\|1, m\rangle$ | bb:b6 | Q2; HW1 P5 | **FLAG** | HW1's spin-1 names, used as HW2 does. |
| $S_x$, $S_x\otimes I + I\otimes S_x$ | bb:b7 | Q3 (S = σ/2) | OK | — |
| $m_x$ | bb:b8 | bb:b8 | OK | Defined in the question ("the spin-1 value along x"). |
| U | bc:b3 (D9) | D9 step 1 | OK | — |
| $\Pi_{xy}$ | bc:b4 | bc:b4 | OK | — |
| $\Psi_1$, $\Psi_2$ | bc:b5, b6 | in place | OK | — |
| stabilizer | pa:b4 | pa:b4 | OK | — |
| $2x + y$, $n_i$ | pa:b5 | pa:b5 | OK | — |

### 7.2 Formal track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $V^{(1)}$, $\|i_1\rangle_1$, $c_{i_1i_2}$ | ma:b1 | ma:b1 | OK | — |
| $\hat\sigma_{1x}$, $\hat\sigma_{x1}$ | te:b1 | te:b1 | OK | Rosetta: the notes use both orders. |
| $[A_{ij}B]$, $nm$ | te:b2 | te:b2 | OK | — |
| $P_1\cdots P_n$ | te:b3 | te:b3 | OK | — |
| $r_A$, $r_B$, $T_{ij}$ | te:b5 | te:b5 | OK | Bloch vector from Q3. |
| $\det C$, rank, singular values | en:b4 | en:b4 | **FLAG** (minor) | "Schmidt rank" is named and deferred to Q9. |
| $(S^2)^N$ | D3 | Q3 (Bloch sphere) | OK | — |
| $\delta_{xx'}$ | bb:b3 | Q2 (orthonormal bases) | OK | — |
| $S^{(1)}_x$ | bb:b7 | bb:b7 | OK | — |
| $I_4$, $p_{xy}$ | bc:b4 | bc:b4 | OK | — |
| $\hat O$, $U^\dagger\hat OU$ | pa:b1 | pa:b1 | OK | U from bc:b1. |
| $\hat M$, $\hat n_i$ | pa:b5 | pa:b5 | OK | — |

**Counts:** Ground 3 FLAGs, Formal 1 FLAG, all resolved in place.

## 8. Errata

None in the mathematics of notes L5 pp. 21–26, L6 pp. 27–29, or HW2 P1–P2(c). Checked: every equation (2.1)–(2.8),
the σ_x⊗σ_z matrix, the CNOT and CZ matrices and projector sums, CNOT = (I⊗H)CZ(I⊗H), the Bell-measurement lines on
p. 26, the 2N/(2^{N+1} − 2) fraction (0.98 % at N = 10), the factorized Π_xy, M̂'s eigenvalues and Eq. 2.8.

**Silent notes (no box).**
| Where | Point | Action |
|---|---|---|
| notes p. 23 against p. 27 | $\hat\sigma_{1x}$ (particle, then component) becomes $\hat\sigma_{x1}$ | Rosetta in `q6-tensor:b1` F; the plan writes $\hat\sigma_{x1}$ |
| notes p. 22 | "separable" for a pure product | Rosetta in `q6-many:b3` F; Q10 gives the mixed definition |
| notes p. 25 | β_xy names (as N&C); Bergou Eq. 3.4 swaps Φ and Ψ | Rosetta in `q6-bell-basis:b1`–`b2` (ruling 9) |
| notes p. 26, Fig. 7 caption | "Read right to left, the same circuit prepares" β_xy | taught in `q6-bell-circuit:b3` with the gate order spelled out |
| HW2 P1(c) | "$\|0_x\rangle$ you constructed by Gram–Schmidt": its overall sign is HW1's choice | "up to an overall sign" (§12 Q7) |

## 9. Engine gaps and stage-contract gaps

### 9.1 Engine
**No new functions beyond E1** (in build). Q6 uses, from E1: `paramCount`, `bellAmplitudes`, `pauliMul`,
`paulisCommute`, `pauliEigenvalue`, `heisenberg`. Existing and sufficient: `qc/state` (`ket`, `kron`, `bell`,
`coefMatrix`, `isProduct`, `schmidtRank`), `qc/gates` (`pauliString`, `cliffordConj`, `cnot`, `cz`, `H`, `X`, `Y`, `Z`,
`Ry`), `qc/cmat` (`kronM`, `svd`), `qc/measure` (`expectationN`, `probs`, `marginal`), `qc/circuit` (`runCircuit`).

**Two notes for the E1 build.**
- `bellAmplitudes(ψ)` must return the notes' order β₀₀, β₀₁, β₁₀, β₁₁ (= Φ⁺, Ψ⁺, Φ⁻, Ψ⁻). The engine's `BELL_BASIS` is
  ordered Φ⁺, Φ⁻, Ψ⁺, Ψ⁻, so a function that loops over `BELL_BASIS` returns the wrong order for `inBasis:'bell'` and for
  every `q6P2*` key. Its test should pin `bellAmplitudes(ket('0+'))` and `bellAmplitudes` of (√3|00⟩ + |11⟩)/2 =
  (0.966, 0, 0.259, 0).
- `heisenberg(U, s)` = U†PU. Fig. 7's U is (H⊗I)CNOT, so `heisenberg(UB, 'ZI')` = +XX and `heisenberg(UB, 'IZ')` = +ZZ.
  `cliffordConj(U, s)` computes UPU† (the other way); the inverse moves `q6InvXX`, `q6InvZZ` use it directly.

The claim ledger is §1.7. Every key is computed in `Q6.values.ts` from these calls; the numpy twin follows the route in
the ledger's last column.

### 9.2 Stage contract
**`two-qubit` (needs: two-qubit)**, the re-map's §6.1 fields only: `source:{ket: AmpSource}` (including a circuit's
state at `upTo`), `arrows:'reduced'`, `grid:'T'`, `highlight` (`'xx'`, `'yy'`, `'zz'`, `'zx'`), `labels:'q1-q2'`.
Beats: `q6-tensor:b5`, `b6` (reveal); `q6-entangled:b1`; `q6-bell-basis:b4`, `b5`, `b6`; `q6-parities:b3`, `b4`, `b6`,
`b7` (reveal); derivations D2, D3, D12.

**`matrix` v2 and the §6.2 fields (needs: matrix-v2).**
| Field | Used as | Beats and derivations |
|---|---|---|
| `{product:[…]}` (left to right as written; the rightmost acts first), `{adjoint}`, `{lin}` with c ∈ {1, −1, ½, −½} | `BC`, `UB`, B†B, U·M̂·U†, $H\cdot Z\cdot H$, $XX\cdot ZZ$, S_x^tot | bb:b1, b2, b3, b7; pa:b5; D6–D13 |
| `basis:'bell'` and `basis: AmpSource[]` (shows B†MB; row and column labels from the kets) | M̂, ½(I − XX), Π₁₀; the triplet-and-singlet basis | bb:b7; D6, D12, D13 |
| `{tableau: string[], product?: true}` | XX over ZZ, with column products and the phase from `pauliMul` | pa:b2, b4; D11 |
| `amplitudes.inBasis:'bell'` | bars in the order β₀₀, β₀₁, β₁₀, β₁₁, labelled "β₀₀ (Φ⁺)" … | bb:b6; D14 |
| `circuit.observable: {pauli, at}` | the Pauli string read at the meters, drawn moved back to column boundary `at` by `heisenberg` of the columns after `at` (at = K: at the meters; at = 0: at the input) | pa:b1; D10 |

The re-map wrote `observable?: {pauli, col}` without fixing its meaning; this plan needs the definition above (§12 Q6).

**v1 only (builds as soon as `matrix` v1 merges):** all of `q6-many`; `q6-tensor:b1`–`b4`; `q6-entangled:b2`–`b5`;
`q6-bell-basis:b8`; all beat stages of `q6-bell-circuit`; derivations D1, D4, D5. Checks for the builder: (a) `coef` with
`svd:true` beside a `bell` and a `circuit` source; (b) `outer:[{bell:'Phi-'}]` with `blocks:2`; (c) a 2-letter `pa`
(a `kron` of two `pauli`s) with `highlight`; (d) `C_BM(xy)` passes `validateLayout` in a split at `upTo` 2 and 4 with no
`outcomes` (the meters are in column 5).

**Fallbacks if a kind slips past the Q6 build** (beat stages; derivations keep their v1 views and drop the others only
if the lint still sees ≥ 2 distinct views):
| Beat | Fallback |
|---|---|
| bb:b1, b2 (`BC`) | `mx({outer:[{bell:'Phi+'}]})`, `mx({outer:[{bell:'Phi-'}]})` |
| bb:b3 (B†B) | `mx({coef:{bell:'Psi+'}}, {svd:true})` |
| bb:b7, pa:b5 | `mx(pa('XI'))` and the caption; `mx(pa('ZZ'))` |
| pa:b1 (`observable`) | `split( circ(C_U, 2) / mx(pa('XX')) )` |
| pa:b2, b4 (tableau) | `mx(pa('XX'))`, `mx(pa('ZZ'))` |
| two-qubit beats | `amp(…, {mode:'probability'})` of the same state, with the grid values in the caption |

### 9.3 Widget gaps
W2 `two-qubit-lab` (deferred under the cap): pick two Bloch points for a product, or a Bell state; shows the two arrows,
the grid, and a Fig. 7 readout. The §3 fallbacks carry the units until then.

## 10. Media
- **Opener:** none new; the Part II opener is Q4's.
- **Film (deferred) `qc-q6-bell-readout`** "Two detectors read a Bell state": each $\beta_{xy}$ passes the CNOT and the H, and its
  two bars fold into one. Manifest: `q6BMPrep`, `q6BMMid`, `q6BMOut`.
- **Decor (Higgsfield, credits need the user):** two small glass spheres on a dark optical table, joined by a faint thread
  of light; no text, no numbers, no diagrams.

## 11. Hooks

### 11.1 Concept-map stations
| id | label | chapter · unit | needs | sameAs (448) |
|---|---|---|---|---|
| `qc-composite` | Two qubits: dimensions multiply | Q6 · `q6-many` | `qc-registers` | — |
| `qc-operator-tensor` | Operators on pairs | Q6 · `q6-tensor` | `qc-composite`, `qc-spin-operators` | — |
| `qc-entanglement` | Product and entangled states | Q6 · `q6-entangled` | `qc-operator-tensor` | — |
| `qc-bell-basis` | The Bell basis | Q6 · `q6-bell-basis` | `qc-entanglement`, `qc-circuits` | — |
| `qc-bell-measurement` | Reading and making Bell states | Q6 · `q6-bell-circuit` | `qc-bell-basis`, `qc-born-projector` | — |
| `qc-parities` | Parities and stabilizers | Q6 · `q6-parities` | `qc-bell-measurement`, `qc-uncertainty` | — |

Bridge ids used, all existing: `qc-l2-three-bases`, `qc-l4-projectors`, `qc-l7-compatible`. 448 has no two-qubit twin, so
no `sameAs`.

**Future bridges (TODO; targets not built):** Q7 GHZ and Mermin (Pauli strings; built in parallel, named in words until
both merge), Q8 the GHZ box, Q9 Schmidt rank and Tr₂ of the Bell states (`q6-entangled:b4`, HW2 P2(d)), Q10 separable
mixtures and CHSH (`q6-many:b3`), Q11 dense coding and teleportation (`q6-bell-circuit:b3`), Part IX stabilizer codes
(`q6-parities:b4`).

### 11.2 Arcade (6 levels)
Label constant: `const Q6x = (unit, label) => ({ lecture: 'Q6', unit, label })`. All six are Spot the error.
1. **`q6-many` · `qc-dims-add`** — "Counting two qubits"
   - Steps: "Each qubit has the basis states $|0\rangle$ and $|1\rangle$." · "A basis state of a pair picks one for each qubit." · "So two qubits have $2\times2 = 4$ basis states." · "By the same count, three qubits have $2 + 2 + 2 = 6$."
   - `wrong: 3`. Why: the count multiplies again, $2\times2\times2 = 8$ (`q6AmpCount`).
2. **`q6-tensor` · `qc-xz-block`** — "Which XZ?"
   - Steps: "$XZ$ names the Pauli string $X\otimes Z$." · "It acts as X on qubit 1 and Z on qubit 2." · "So it is a $4\times4$ matrix." · "Its top-left $2\times2$ block is the product $X\cdot Z$."
   - `wrong: 3`. Why: the top-left block is $X_{11}Z = 0$ (`q6XZ`).
3. **`q6-entangled` · `qc-four-filled`** — "All four filled"
   - Steps: "A product state has amplitudes $ac$, $ad$, $bc$, $bd$." · "$\Phi^+$ fails the test: $c_{00}c_{11} - c_{01}c_{10} = \tfrac12$." · "$|+\rangle|+\rangle$ has all four amplitudes non-zero." · "So $|+\rangle|+\rangle$ is entangled."
   - `wrong: 3`. Why: its test gives $\tfrac14 - \tfrac14 = 0$; it is a product (`q6DetPP`).
4. **`q6-bell-basis` · `qc-beta-names`** — "Two-bit names"
   - Steps: "$\beta_{xy} = (|0, y\rangle + (-1)^x|1, 1\oplus y\rangle)/\sqrt2$." · "For $\beta_{10}$, x = 1 and y = 0." · "So $\beta_{10} = (|00\rangle - |11\rangle)/\sqrt2$." · "That is the singlet $\Psi^-$."
   - `wrong: 3`. Why: $(|00\rangle - |11\rangle)/\sqrt2$ is $\Phi^-$; the singlet is $\beta_{11}$ (`q6BellAmps`).
5. **`q6-bell-circuit` · `qc-bell-order`** — "Which gate first?"
   - Steps: "To read a Bell state, rotate the Bell basis onto the 0/1 basis." · "The rotation is $U = (H\otimes I)\,\mathrm{CNOT}$." · "So the H acts first, then the CNOT." · "Then both qubits are read in the 0/1 basis."
   - `wrong: 2`. Why: in a product of gates the right-hand factor acts first: CNOT, then H (`q6UBeta`).
6. **`q6-parities` · `qc-parity-local`** — "Two local readings?"
   - Steps: "The detectors read $Z_1$ and $Z_2$ after the gates." · "Reading $Z_1$ after U is reading $U^\dagger Z_1U = X_1X_2$ before it." · "Likewise $Z_2$ after U is $Z_1Z_2$ before it." · "So a Bell measurement reads $Z_1$ and $Z_2$ of the incoming pair."
   - `wrong: 3`. Why: it reads the two parities $X_1X_2$ and $Z_1Z_2$, not single-qubit values (`q6HeisZI`, `q6HeisIZ`).


## 12. Questions for the judge

**Q1. Two moves against the re-map.** (a) ⟨A⊗B⟩ = ⟨A⟩⟨B⟩ and the correlation grid move from `q6-many` to `q6-tensor`,
because A⊗B is defined there. (b) HW2 P1(e) (S_x^tot) moves from `q6-tensor` to `q6-bell-basis`, because its basis needs
the triplet and the singlet. *Recommend:* accept both; nothing else changes order.

**Q2. Ownership of operator ⊗ and of the product test.** `P-Q4-review.md` proposes a new `q4-registers:b3a` for ⊗ on
operators and lists the coefficient matrix and det test as Q4 notation beats; the re-map (§2.2, §5) gives both to Q6
and makes `q4-registers:b5` a forward pointer. *Recommend:* Q6 owns `qc-operator-tensor` and `qc-factoring-test`; the R3
brief drops `b3a` and tags no notation at `q4-registers:b5`. ℂ²⊗ℂ² and ⊗ on kets stay Q4's (R3 tags them).

**Q3. Where the β Rosetta tag sits.** Ruling 9 puts "(notes, N&C: β₀₀; Bergou: Ψ₊)" on a chapter's first Bell name.
In Q6 that is `q6-entangled:b3`, two units before β_xy's notation beat. *Recommend:* `q6-entangled:b3` names Φ⁺ as
"Unit 4.5's Bell state"; Bergou's name rides on `q6-bell-basis:b1` and the β names on the β_xy notation beat `b2`, so no
symbol is used before its beat. Q4's `qc-bell-state` Formal gloss already prints β_xy; R3 should cite Q6 there.

**Q4. Build order.** 10 beat stages and 3 derivations need `two-qubit`; 9 beats and 9 derivations need the §6.2 batch.
*Recommend:* E1 → `two-qubit` and `matrix` v2 → Q6 build, as re-map §7 batches 2–3 plan. If either kind slips, build
with the §9.2 fallbacks and retrofit the views later; do not drop below 2 distinct views per derivation list.

**Q5. "XZ" means two things.** Q4 (built) writes $XZ$ for the one-qubit product (`q4-one-qubit-gates`, and the
`matrix{gate:'XZ'}` view in `P-Q4-review.md`). From `q6-tensor:b3` on, $XZ$ is the string $X\otimes Z$. *Recommend:* the
R3 retrofit writes $X\cdot Z$ in Q4, and the content lint gains no new rule (the notation beat states the convention).

**Q6. The meaning of `circuit.observable`.** The re-map wrote `{pauli, col}` without semantics. *Recommend:*
`{pauli, at}` as defined in §9.2 (the meters' string drawn moved back to boundary `at` by `heisenberg`).

**Q7. The sign of HW1's |0_x⟩.** HW1 P5 was not re-read under the cap, so `q6-bell-basis:b6` and `q6-b-p1c` say
"up to an overall sign". *Recommend:* the build agent reads HW1 P5 and drops the hedge if the sign matches $\Phi^-$.

**Q8. The memory figure is ours.** The notes say only that 30 spins exceed what a classical computer "can comfortably
store". *Recommend:* keep the 16 GiB example, labelled "our estimate" (16 bytes per complex amplitude).

**Q9. Phase tag for the HW2 beats.** `q6-bell-basis:b6`, `b7`, `q6-bell-circuit:b5`, `b6`, `q6-parities:b6` come from the
course's own sheet, not a book. *Recommend:* `phase:'books'` (the "a second source adds" slot) with refs "HW2 P1(a)" etc.,
unless the judge prefers `'lecture'` for course sheets.
