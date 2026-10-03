# P-F3-story â F3 "Matrices and linear maps" (role P, Physics 709 Foundations)

Proposal only. Nothing under `app/` is modified. Format: `P-F1-story.md` (an F chapter has no lecture; `[L]` holds the
chapter's own ground-up line, from Axler, the 709 notes and N&C), with the two standing gates of `P-Q8-story.md`: every
derivation list, in **both** tracks, steps the stage through â¥ 2 distinct views (`DerivStep.view`, `viewCaption`;
W-709 #7), and every new space or notation gets exactly one notation beat (`Beat.introduces`, `GlossEntry.introduces`;
W-709 #8). Design: `decisions/qc709-foundations.md` (F3 is the canonical owner of the matrix of a linear map, matrix
products, the adjoint and change of basis; it builds on F2's ââ¿, kets, inner products and bases, bridges back to them,
and does not re-teach them; the Q chapters keep their inline teaching and gain QâF bridges in a later wiring pass).
Rulings: `qc709-remap.md` (no raw TeX; engine-backed numbers with numpy twins), `qc709-nc.md` (N&C citing and names;
ruling 1: "Hermitian â real eigenvalues" is 448 homework, so F3 does **not** derive it). Planned together with
`P-F2-story.md` (the prerequisite) and feeding `P-F4-story.md` (eigenvalues, Hermitian/unitary operators, the spectral
theorem).

**Sources read.**
- Axler 4e Â§3A pp. 52â55 (linear maps $\mathcal L(V, W)$, 3.1â3.9); Â§3C pp. 69â74 (3.31 the matrix of a linear map
  $\mathcal M(T)$, 3.32 example, 3.41 matrix multiplication, 3.42 example); Â§3D pp. 90â92 (3.79 identity matrix, 3.80
  invertible/$A^{-1}$ and $(AC)^{-1} = C^{-1}A^{-1}$, 3.81 $\mathcal M(ST) = \mathcal M(S)\mathcal M(T)$, 3.82â3.83 the
  change-of-basis matrices are inverses); Â§7A pp. 231â232 (7.7 conjugate transpose $A^*$, 7.9 $\mathcal M(T^*) =
  \mathcal M(T)^*$ in an orthonormal basis, with the caution for non-orthonormal bases). Axler printed = PDF â 14,
  checked on p. 69 (PDF 83), p. 90 (PDF 104) and p. 231 (PDF 245).
- Nielsen & Chuang Â§2.1.2 pp. 63â64 (linear operators, identity and zero operators, composition, matrix
  representation) and Â§2.1.6 pp. 69â70 (the adjoint $A^\dagger$, eq. 2.32; $(AB)^\dagger = B^\dagger A^\dagger$;
  $A^\dagger = (A^*)^{\mathsf T}$, eq. 2.34; Hermitian $A^\dagger = A$; projectors; normal operators). N&C printed =
  PDF â 28.
- 709 notes `qc709-n2` pp. 8â10 (the change-of-basis matrix $U_{ij} = \langle\alpha'_i|\alpha_j\rangle$ and
  $\bar d = \hat U\bar c$; operators $\hat A' = \hat U\hat A\hat U^\dagger$; unitarity $\hat U\hat U^\dagger = \hat 1$ and
  $[\hat U^\dagger]_{ij} = U^*_{ji}$; completeness; the linear operator $\hat A$, the outer product $|\alpha\rangle\langle\beta|$,
  the matrix element $A_{ij} = \langle e_i|\hat A|e_j\rangle$ and $\bar f = \hat A\bar c$).
- What F2 already owns (bridge targets, not re-taught): `qc-ket`, `qc-bra`, `qc-inner-product`, `qc-norm`,
  `qc-orthonormal-basis`, `qc-projection`, and the completeness relation $\sum_i|e_i\rangle\langle e_i| = I$.

**Evidence.** Every number below was computed **twice**: by an independent numpy script
(`scratchpad/f23plan-verify.py`), each quantity along two routes (matrix products by `@` and by the explicit index sum;
change of basis by $UAU^\dagger$ and by $\sum_{ij}U_{ki}A_{ij}U^*_{lj}$; adjoints by conjugate-transpose and by the
defining relation), and by the app's own engine â the call each `F3.values.ts` entry will make. The two routes agree to
1e-9 on all 61 F2+F3 keys. **No new engine function is needed** (Â§9.1): `physics/linalg.ts` and `physics/qc/cmat.ts`
already carry `matmul`, `dagger` (the adjoint), `apply`, `outer`, `identity`, `isHermitian`, `isUnitary`, `invN`/`inv2`,
and `changeU` (whose docstring names "the notes' zâx U is H").

**Conventions** (F1's and F2's, plus these).
- Beat id `<unit>:b<n>`. Phase tags **[L]** core ramp (Axler + the notes), **[B]** a second source adds (N&C, or an
  Axler result beyond the ramp), **[C]** clue. Order L â B â C. Both tracks **G**/**F**; captions "cap G"/"cap F".
- Matrices are **row-major**, $M[i][j] = \langle i|M|j\rangle$ (the engine's convention). The adjoint $A^\dagger$ is the
  conjugate transpose, $\langle i|A^\dagger|j\rangle = \langle j|A|i\rangle^*$ (the engine's `dagger`).
- **Change of basis** (notes n2 Â§I.C.4): $U_{ij} = \langle\text{new}_i|\text{old}_j\rangle$, coordinates $d = Uc$,
  operators $A' = UAU^\dagger$. The engine's `changeU(new)` returns $U = B^\dagger$ with $B = \texttt{basisMatrix(new)}$
  (columns = the new basis kets in old coordinates); then $A' = UAU^\dagger = B^\dagger A B$, which is exactly the
  `matrix` kind's `basis` field. The notes' zâx change is $U = H$.
- **Rosetta** (stated once, in `f3-change-of-basis:b2` cap F): the notes write $\hat A' = \hat U\hat A\hat U^\dagger$ with
  $\hat U = B^\dagger$; the `matrix` stage draws the same thing as $B^\dagger A B$ (the new basis's columns are $B$).
  Axler writes the matrix of a map as $\mathcal M(T)$ and the conjugate transpose as $A^*$; N&C and this course write
  $A^\dagger$.
- **Hermitian â real eigenvalues is NOT proved here** (`qc709-nc.md` ruling 1: it is 448 L3 homework). F3 states what
  Hermitian and unitary *mean* and bridges the spectral facts forward to F4; `f3-adjoint:b3` cites "the notes prove the
  reality of a Hermitian operator's eigenvalues on p. 15" by page, with no derivation in the app.
- Claims: `key` â statement â `engine call` â value, in `F3.values.ts` with `d(V.key, n)`; the plan prints the value for
  review only. No literal float in any G/F/caption string. Matrix entries print as exact tokens (0, Â±Â½, Â±1/â2, Â±1 and
  their $i$-multiples) via `values:'exact'`, else decimals.
- Bridges `<<unit-id|shown>>`: F2 targets (`f2-inner-product`, `f2-orthonormal`, â¦), F1 targets, F4 forward
  (`f4-spectral`), 448 twins `l3-operators`/`l3-matrices` where a 448 unit teaches the same idea. QâF3 bridges are added
  by the later wiring pass.

**Stage shorthand.** Each form expands to exactly one `StageState` (a derivation `view` is always one state; `split` is
for beat stages only).

| Shorthand | Expands to | Needs |
|---|---|---|
| `mx(src, f)` | `{kind:'matrix', source:src, labels:'kets', values:'exact', â¦f}` | â |
| `gate(G)` | matrix source `{gate:{name:G}}` (a built-in one-qubit gate: X, Y, Z, H, S, I) | v1 |
| `pa('X')` | matrix source `{pauli:'X'}` (a single letter: the raw 2Ã2) | v1 |
| `out(K)` / `out(K1,K2)` | matrix source `{outer:[K1]}` = \|K1â©â¨K1\|, or `{outer:[K1,K2]}` = \|K1â©â¨K2\| | v1 |
| `prod(A,B,â¦)` | matrix source `{product:[A,B,â¦]}` (left to right, `matmul`) | matrix-v2 |
| `adj(A)` | matrix source `{adjoint:A}` (Aâ , `dagger`) | matrix-v2 |
| `lin([c,A],â¦)` | matrix source `{lin:[{c, src:A},â¦]}`, c from `MATRIX_COEF_EXACT` | matrix-v2 |
| field `basis:[{ket:'+'},{ket:'-'}]` | view the operator in the x basis, Bâ AB (`matrix` v2 `basis`) | matrix-v2 |
| field `spectrum:'bars'` / `trace:true` / `highlight` | eigenvalue bars / Tr readout / outlined cells | v2 / v1 |
| `hp{â¦}` | `{kind:'hilbert-plane', course:'qc709', â¦}` (F2's kind; `image` draws Ã\|Ïâ© for REAL A) | hilbert-plane |
| `amp(S,f)` | `{kind:'amplitudes', state:S, â¦f}` | â |
| `bl(D,f)` | `{kind:'bloch', state:D, shot:'B-STD', â¦f}` | â |
| `split(A / B)` | `{layout:'split', top:A, bottom:B}` | â |

In the `matrix` kind, a ket in `out`/`basis` reuses `amplitudes`' `AmpSource` vocabulary (`'0'`=|+zâ©, `'1'`=|âzâ©,
`'+'`=|+xâ©, `'-'`=|âxâ©), so `basis:[{ket:'+'},{ket:'-'}]` is the x basis and `B = H`.

## 0. Chapter map

F3 answers the map's question: **"If a quantum gate, a measurement or a rotation turns one state into another, how do we
write that machine as a table of numbers, chain two of them, mirror one, and see it from a different frame?"** It stands
on F2 (kets, inner products, orthonormal bases) and is the bridge target for every later chapter that writes an operator
as a matrix.

| # | id | Title (â¤ 8 words) | Driving question | Sources | Bridges offered |
|---|---|---|---|---|---|
| 1 | `f3-linear-maps` | Machines that respect addition | What is a linear map, and why does it turn sums into sums? | Axler Â§3A pp. 52â55; notes n2 p. 10; N&C Â§2.1.2 p. 63 | `f2-vectors`, `l3-operators` |
| 2 | `f3-matrix-of-map` | A map becomes a table: $A_{ij} = \langle i\|A\|j\rangle$ | How does a linear map become a grid of numbers, and what does each entry mean? | Axler Â§3C pp. 69â72 (3.31â3.32); notes n2 p. 10 | `f2-orthonormal`, `l3-matrices` |
| 3 | `f3-products` | One map then another: matrix products | Why is matrix multiplication defined the way it is, and why is order everything? | Axler Â§3C pp. 72â74 (3.41â3.42), Â§3D pp. 90â91 (3.79â3.81) | `l3-matrices` |
| 4 | `f3-adjoint` | The mirror of a map: $A^\dagger$ | What is the adjoint, when does a matrix equal its own mirror, and why does the frame matter? | Axler Â§7A pp. 231â232 (7.7, 7.9); notes n2 p. 9; N&C Â§2.1.6 pp. 69â70 | `f2-inner-product`, `f4-spectral` |
| 5 | `f3-change-of-basis` | The same map in a new frame: $UAU^\dagger$ | How does a map's table change when you choose a different frame, and what stays fixed? | Axler Â§3D pp. 91â92 (3.82â3.83); notes n2 pp. 8â9 | `f2-orthonormal`, `l3-change-basis` |

Forward F bridge: `f3-adjoint:b3` â `f4-spectral` (a Hermitian operator has real eigenvalues and an orthonormal
eigenbasis; the reality is the notes' p. 15 proof and 448 homework, so F4 states it and cites, Â§12 Q2).

**Outcomes** (Ground wording):
- Say what makes a map linear, and show a gate, a projection and a rotation are linear.
- Write a linear map as a matrix with entries $A_{ij} = \langle i|A|j\rangle$, and act on a state by matrix times column.
- Chain two maps by multiplying their matrices, and explain why $XZ$ and $ZX$ differ.
- Form the adjoint $A^\dagger$ by conjugate-transposing, and say when a matrix is Hermitian or unitary.
- Rewrite a map's matrix in a new orthonormal frame as $UAU^\dagger$, and see that $Z$ in the x frame is $X$.

**Prerequisites** (concept ids): F2 `qc-ket`, `qc-bra`, `qc-inner-product`, `qc-norm`, `qc-orthonormal-basis`,
`qc-projection`; F1 `qc-complex-number`, `qc-conjugate`. The Ground ramp assumes F2's inner product and orthonormal
frames, and F1's complex arithmetic.

**Openers and films.** The Part F Blender opener (F1 Â§10.1) stands for the Part. F3's own film `qc-f3-sandwich` (the
$HZH = X$ change of frame, Â§10.2) is the `Unit.opener` of `f3-change-of-basis`.

## 1. Story beats per unit

Kinds per unit (a derivation `view` may use only kinds the unit's beats show):
`f3-linear-maps` hilbert-plane, amplitudes Â· `f3-matrix-of-map` matrix, hilbert-plane Â· `f3-products` matrix Â·
`f3-adjoint` matrix Â· `f3-change-of-basis` matrix, bloch. Fidelity items used: the `matrix` items (`qc-matrix-entries`,
`qc-matrix-hue-is-phase`, `qc-matrix-not-a-space`, v2's `qc-matrix-basis-change`), the 709 `hilbert-plane` items
(`hilbert-plane`, `qc-plane-vectors-not-states`), `qc-amp-engine`, `bloch`/`bloch709`.

### Unit `f3-linear-maps` â Machines that respect addition

**`f3-linear-maps:b1` [L] Â· notation beat, `introduces: ['qc-linear-operator']`** (what makes a map linear)
- **G:** "A [[qc-linear-operator|linear map]] $A$ turns one state into another and respects addition and scaling. If you add two states first and then apply $A$, you get the same as applying $A$ to each and adding: $A(a|\psi_1\rangle + b|\psi_2\rangle) = aA|\psi_1\rangle + bA|\psi_2\rangle$. A quantum gate is such a map."
- **F:** "A linear operator $A: V \to W$ satisfies $A(a|\psi_1\rangle + b|\psi_2\rangle) = aA|\psi_1\rangle + bA|\psi_2\rangle$ (Axler Â§3A; N&C Â§2.1.2; notes n2 Â§I.D). On a qubit, $X$ (the NOT gate) sends $|0\rangle \to |1\rangle$ and $|1\rangle \to |0\rangle$: $X|\psi\rangle$ is a linear image, not a probability read-off."
- **Cap:** G "apply $A$ to a sum = sum of the images" Â· F "$A(a|\psi_1\rangle + b|\psi_2\rangle) = aA|\psi_1\rangle + bA|\psi_2\rangle$"
- **Stage:** `hp{ psi:'+z', image:{named:'sx', label:'$X|{+}z\rangle$'} }` â $X = \sigma_x$ sends $|{+}z\rangle = (1,0)$ to $|{-}z\rangle = (0,1)$, drawn at true length ($\sigma_x$ is real; `PlaneOp.named = 'sx'`).
- **Claims:** `f3Xplusz` â $X|{+}z\rangle$ â `apply(X, KET['+z'])` â $(0, 1)$.
- **Terms:** `qc-ket` (F2, link-back).

**`f3-linear-maps:b2` [L]** (a map is fixed by what it does to a frame)
- **G:** "Because $A$ respects sums, you only need to know where it sends each frame vector. Then $A$ on any state follows: write the state in the frame, apply $A$ to each piece, and add. Knowing $X|0\rangle$ and $X|1\rangle$ fixes $X$ everywhere."
- **F:** "By linearity, $A$ is determined by its action on a basis: $A|\psi\rangle = \sum_j c_j\,A|e_j\rangle$ for $|\psi\rangle = \sum_j c_j|e_j\rangle$ (Axler 3.5; N&C eq. 2.10). So $X|0\rangle = |1\rangle$, $X|1\rangle = |0\rangle$ fix $X$ on all of $\mathbb C^2$."
- **Cap:** G "know $A$ on the frame, know it everywhere" Â· F "$A|\psi\rangle = \sum_j c_j A|e_j\rangle$"
- **Stage:** `split( hp{ psi:'+z', image:{named:'sx'} } / hp{ psi:'-z', image:{named:'sx'} } )` â $X$ on each z frame vector.
- **Claims:** `f3Xplusz` (reused) Â· `f3Xminusz` â `apply(X, KET['-z'])` â $(1, 0)$.
- **Bridge:** `<<f2-orthonormal|F2.4 A frame at right angles>>`.

**`f3-linear-maps:b3` [L]** (three familiar linear maps)
- **G:** "Three maps you already know are linear. $Z$ flips the sign of the down part: $Z|1\rangle = -|1\rangle$. A projection keeps only the part along one frame vector. And a rotation turns every arrow by the same angle, keeping lengths."
- **F:** "$Z = \operatorname{diag}(1, -1)$ (a sign flip on $|1\rangle$); the projector $|0\rangle\langle 0|$ (F2's projection, keeping the $|0\rangle$ part); a plane rotation $R_\theta$ (orthogonal, length-preserving). All three are linear; a rotation and $Z$ are real, so the plane can draw their images."
- **Cap:** G "$Z$, a projection, a rotation: all linear" Â· F "$Z|1\rangle = -|1\rangle$; $P_0 = |0\rangle\langle 0|$"
- **Stage:** `split( hp{ psi:{planeDeg:30}, image:{named:'sz'} } / hp{ psi:{planeDeg:30}, project:1 } )`.
- **Claims:** `f3Zminusz` â `apply(Z, KET['-z'])` â $(0, -1)$ Â· `f3ProjZ` â `outer(KET['+z'], KET['+z'])` â $\operatorname{diag}(1, 0)$.
- **Terms:** `qc-projection` (F2, link-back).

**`f3-linear-maps:b4` [B]** (the do-nothing and the do-everything-to-zero maps; N&C)
- **G:** "Two plainest maps: the identity $I$, which leaves every state alone, and the zero map, which sends every state to the zero state. Doing one map then another is their composition, written side by side, read right to left."
- **F:** "The identity operator $I|\psi\rangle = |\psi\rangle$ and the zero operator $0|\psi\rangle = 0$ are linear (N&C Â§2.1.2). Composition $BA$ means $B(A|\psi\rangle)$, applied right to left; it is again linear. These set up the matrix product of the next unit."
- **Cap:** G/F "$I$ leaves a state alone; $BA$ means $A$ first, then $B$"
- **Stage:** `hp{ psi:{planeDeg:30}, image:{named:'I'} }` â the image coincides with the input.
- **Refs:** N&C Â§2.1.2 p. 63 (identity, zero operator, composition).
- **Claims:** `f3Identity` â `apply(identity(2), KET['+x'])` â $(0.7071, 0.7071)$.

**`f3-linear-maps:b5` [C]** (is "square the amplitudes" a linear map?)
- **Q G:** "Define a rule that squares each amplitude: $(a, b) \mapsto (a^2, b^2)$. Is this a linear map?"
- **Q F:** "Is $(a, b) \mapsto (a^2, b^2)$ linear on $\mathbb C^2$?"
- **Reveal G:** "No. Linear means doubling the input doubles the output. But squaring doubles the input and quadruples the output: from $(1, 0)$ you get $(1, 0)$, and from $(2, 0)$ you get $(4, 0)$, not $(2, 0)$. Only maps that respect sums get a matrix."
- **Reveal F:** "Not linear: $A(2|\psi\rangle) = 4A'|\psi\rangle \ne 2A(|\psi\rangle)$ where $A(a,b) = (a^2, b^2)$. Squaring fails homogeneity, so it has no matrix. (Measurement probabilities $|c_i|^2$ are also nonlinear â why they are read off a state, not applied to it; Chapter Q1.)"
- **Reveal cap:** G/F "squaring: $(2,0) \mapsto (4,0) \ne 2\cdot(1,0)$"
- **Stage:** question `hp{ psi:{planeDeg:0} }`; reveal `hp{ others:[{ket:{planeDeg:0}, role:'ghost', badge:'$(1,0)\\to(1,0)$'}, {ket:{planeDeg:0}, role:'ghost', badge:'$(2,0)\\to(4,0)$'}] }`.
- **Claims:** `f3SquareNonlinear` â $(2,0) \mapsto (4,0)$, but $2\cdot(1,0) = (2,0)$ â a worked contradiction (test only, no engine value needed).

### Unit `f3-matrix-of-map` â A map becomes a table: $A_{ij} = \langle i|A|j\rangle$

**`f3-matrix-of-map:b1` [L] Â· notation beat, `introduces: ['qc-matrix-of-map', 'qc-outer-product']`** (columns are images)
- **G:** "To write a map as a table, send each frame vector through it and stack the results as columns. The entry in row $i$, column $j$ is $A_{ij} = \langle i|A|j\rangle$, the [[qc-matrix-of-map|matrix element]]. The building block $|i\rangle\langle j|$, a ket times a bra, is an [[qc-outer-product|outer product]]."
- **F:** "In an orthonormal basis, the matrix of $A$ has columns $A|e_j\rangle$: $A_{ij} = \langle e_i|A|e_j\rangle$ (Axler 3.31 with $\mathcal M(T)$; notes n2 Â§I.D.1). The outer product $|e_i\rangle\langle e_j|$ is the rank-one map sending $|e_j\rangle \to |e_i\rangle$; the engine's `outer`. $X$ has columns $X|0\rangle = |1\rangle$, $X|1\rangle = |0\rangle$."
- **Cap:** G "column $j$ is $A$ applied to frame vector $j$" Â· F "$A_{ij} = \langle e_i|A|e_j\rangle$; $X = \begin{psmallmatrix}0&1\\1&0\end{psmallmatrix}$"
- **Stage:** `split( hp{ psi:'+z', image:{named:'sx'} } / mx(gate('X'), {highlightCol:0}) )` â the first column is $X|0\rangle$.
- **Claims:** `f3MatX` â the matrix of $X$ with $A_{ij} = \langle i|X|j\rangle$ â `[[inner(KET['+z'],apply(X,KET['+z'])), â¦], â¦]` â $[[0,1],[1,0]]$.
- **Terms:** `qc-bra` (F2, link-back).

**`f3-matrix-of-map:b2` [L]** (acting is matrix times column; D1)
- **G:** "Once you have the table, applying the map is matrix times column: the new $i$th number is $\sum_j A_{ij} c_j$. For $X$ this swaps the two numbers of a state. The table does the whole job, no need to go back to the map."
- **F:** "$f_i = \langle e_i|A\psi\rangle = \sum_j\langle e_i|A|e_j\rangle c_j = \sum_j A_{ij}c_j$, that is $\bar f = A\bar c$ (notes n2 Â§I.D.1). For $X$, $(c_0, c_1) \mapsto (c_1, c_0)$. Inserting completeness $\sum_j|e_j\rangle\langle e_j| = I$ between $A$ and $|\psi\rangle$ is the whole derivation."
- **Cap:** G "new number $i$ is $\sum_j A_{ij} c_j$" Â· F "$\bar f = A\bar c$"
- **Stage:** `split( mx(gate('H')) / amp({dir:{thetaDeg:106.26, phiDeg:0}}, {mode:'amplitude'}) )` â $H$ acting on $(0.6, 0.8)$.
- **Derivation:** D1 (Â§2).
- **Claims:** `f3ActionHc` â $H(0.6, 0.8)$ â `apply(H, vec(0.6, 0.8))` â $(0.9899, -0.1414)$.
- **Bridge:** `<<f2-orthonormal|F2.4 completeness>>` (the identity inserted is F2's).

**`f3-matrix-of-map:b3` [L]** (three tables: X, Z, H)
- **G:** "Three maps, three tables. $X$ swaps, so its table has 1s off the diagonal. $Z$ flips the down sign, so its table is $\operatorname{diag}(1, -1)$. $H$, the Hadamard, sends $|0\rangle$ to $|{+}x\rangle$ and $|1\rangle$ to $|{-}x\rangle$: every entry is $\pm1/\sqrt2$."
- **F:** "$X = \begin{psmallmatrix}0&1\\1&0\end{psmallmatrix}$, $Z = \begin{psmallmatrix}1&0\\0&-1\end{psmallmatrix}$, $H = \tfrac1{\sqrt2}\begin{psmallmatrix}1&1\\1&-1\end{psmallmatrix}$ (the notes' zâx map, F2's $|{\pm}x\rangle$ as columns). A cell's size is $|A_{ij}|$ and its hue is the entry's phase; these are all real, so no hue."
- **Cap:** G "the tables of $X$, $Z$, $H$" Â· F "$H = \tfrac1{\sqrt2}\begin{psmallmatrix}1&1\\1&-1\end{psmallmatrix}$"
- **Stage:** `split( mx(gate('X')) / mx(gate('H')) )`.
- **Claims:** `f3MatX` (reused) Â· `f3MatH` â the matrix of $H$ â `H` â $[[0.7071, 0.7071], [0.7071, -0.7071]]$.
- **Fidelity:** `qc-matrix-entries`.

**`f3-matrix-of-map:b4` [B]** (the map rebuilt from ket-bras)
- **G:** "A table is the same as a sum of ket-bras: add $A_{ij}|i\rangle\langle j|$ over every row and column. Each $|i\rangle\langle j|$ puts its number in one cell. This is how the notes write an operator, and why the outer product is the matrix's building block."
- **F:** "$A = \sum_{ij} A_{ij}|e_i\rangle\langle e_j|$ (notes n2 Â§I.D.1). For $X$: $|0\rangle\langle 1| + |1\rangle\langle 0|$. This is the inverse of reading off entries, and it rebuilds $A$ from the outer products, using F2's completeness."
- **Cap:** G/F "$X = |0\rangle\langle 1| + |1\rangle\langle 0|$"
- **Stage:** `split( mx(out('0','1')) / mx(lin([1, out('0','1')], [1, out('1','0')])) )` â $|0\rangle\langle 1|$ and the sum.
- **Refs:** notes n2 p. 10 ($\hat A = \sum_{ij} A_{ij}|e_i\rangle\langle e_j|$).
- **Claims:** `f3XouterSum` â `madd(outer(KET['+z'],KET['-z']), outer(KET['-z'],KET['+z']))` â $X$.

**`f3-matrix-of-map:b5` [C]** (read one entry)
- **Q G:** "In the table of $X$, what is the entry in row $|0\rangle$, column $|1\rangle$, that is $\langle 0|X|1\rangle$?"
- **Q F:** "Compute $\langle 0|X|1\rangle$ and $\langle 0|X|0\rangle$."
- **Reveal G:** "It is 1: $X$ sends $|1\rangle$ to $|0\rangle$, so the overlap with $\langle 0|$ is 1. The diagonal entry $\langle 0|X|0\rangle$ is 0, because $X|0\rangle = |1\rangle$ has no $|0\rangle$ part. A table entry is one map, read between two frame vectors."
- **Reveal F:** "$\langle 0|X|1\rangle = \langle 0|0\rangle = 1$ and $\langle 0|X|0\rangle = \langle 0|1\rangle = 0$. Every entry is such a sandwich; this is the definition $A_{ij} = \langle e_i|A|e_j\rangle$, read backwards."
- **Reveal cap:** G/F "$\langle 0|X|1\rangle = 1$, $\langle 0|X|0\rangle = 0$"
- **Stage:** question `mx(gate('X'), {values:'none'})`; reveal `mx(gate('X'), {highlight:[[0,1]]})`.
- **Claims:** `f3XelemZmz` â `inner(KET['+z'], apply(X, KET['-z']))` â $(1, 0)$.

### Unit `f3-products` â One map then another: matrix products

**`f3-products:b1` [L] Â· notation beat, `introduces: ['qc-matrix-product']`** (why the product is defined that way; D2)
- **G:** "Do map $T$ then map $S$. The table of the combined map is the [[qc-matrix-product|matrix product]] $ST$, with entry $(ST)_{jk} = \sum_r S_{jr}T_{rk}$: row $j$ of $S$ against column $k$ of $T$. The product is defined this exact way so that it matches doing one map after the other."
- **F:** "Matrix multiplication is chosen to make $\mathcal M(ST) = \mathcal M(S)\mathcal M(T)$ hold (Axler 3.41, 3.81): $(ST)_{jk} = \sum_r S_{jr}T_{rk}$ (the engine's `matmul`). The number of columns of $S$ must equal the rows of $T$."
- **Cap:** G "$(ST)_{jk} = \sum_r S_{jr}T_{rk}$" Â· F "$\mathcal M(ST) = \mathcal M(S)\mathcal M(T)$"
- **Stage:** `split( mx(prod(gate('H'), gate('X'))) / mx(gate('H')) )` â the product $HX$ beside $H$.
- **Derivation:** D2 (Â§2).
- **Claims:** `f3HX` â $HX$ â `matmul(H, X)` â $[[0.7071, 0.7071], [-0.7071, 0.7071]]$.

**`f3-products:b2` [L]** (a sandwich: HXH = Z; D2)
- **G:** "Sandwich $X$ between two Hadamards: $HXH$. Working the product out gives $Z$. So flipping x-up and x-down ($X$) looks, after the Hadamard change, exactly like flipping the sign of the down state ($Z$). The same move wears two faces."
- **F:** "$HXH = Z$ (and $HZH = X$, since $H^2 = I$): a direct product, $H\begin{psmallmatrix}0&1\\1&0\end{psmallmatrix}H = \begin{psmallmatrix}1&0\\0&-1\end{psmallmatrix}$. This previews change of basis (Unit F3.5): $H$ is the zâx map, so $X$ in the x frame is $Z$."
- **Cap:** G "$HXH = Z$" Â· F "$HXH = Z$, $HZH = X$"
- **Stage:** `mx(prod(gate('H'), gate('X'), gate('H')))` â the triple product resolves to $Z$.
- **Derivation:** D2 (Â§2) continued.
- **Claims:** `f3HXH` â `matmul(matmul(H, X), H)` â $[[1, 0], [0, -1]] = Z$ Â· `f3HZH` â `matmul(matmul(H, Z), H)` â $X$.

**`f3-products:b3` [L]** (order matters: XZ vs ZX)
- **G:** "Order matters. Do $Z$ then $X$ and you do not get the same table as $X$ then $Z$. In fact $XZ = -ZX$: swapping the order flips every sign. Two gates that do not commute cannot be measured together sharply, a fact Chapter Q3 builds on."
- **F:** "$XZ = \begin{psmallmatrix}0&-1\\1&0\end{psmallmatrix}$ and $ZX = \begin{psmallmatrix}0&1\\-1&0\end{psmallmatrix}$, so $XZ = -ZX$ (they anticommute; Axler: matrix multiplication is not commutative). The commutator $[X, Z] = XZ - ZX = -2ZX \ne 0$; Chapter Q3 owns commutators and uncertainty."
- **Cap:** G "$XZ$ and $ZX$ differ by a sign" Â· F "$XZ = -ZX$"
- **Stage:** `split( mx(prod(gate('X'), gate('Z'))) / mx(prod(gate('Z'), gate('X'))) )`.
- **Claims:** `f3XZ` â `matmul(X, Z)` â $[[0, -1], [1, 0]]$ Â· `f3ZX` â `matmul(Z, X)` â $[[0, 1], [-1, 0]]$ Â· `f3XZeqNegZX` â $XZ = -ZX$ (matEq) â true.

**`f3-products:b4` [B]** (identity and inverse)
- **G:** "The identity table $I$ has 1s on the diagonal and leaves any table alone: $AI = IA = A$. A map that can be undone has an inverse $A^{-1}$ with $AA^{-1} = I$. $X$ undoes itself, $X^2 = I$, and so does $H$: $H^2 = I$."
- **F:** "$I = \operatorname{diag}(1, 1)$ (Axler 3.79); $A$ is invertible if some $A^{-1}$ gives $AA^{-1} = A^{-1}A = I$ (Axler 3.80), and $(AC)^{-1} = C^{-1}A^{-1}$. Both $X$ and $H$ are involutions: $X^2 = H^2 = I$, so each is its own inverse (the engine's `invN`/`inv2`)."
- **Cap:** G "$X^2 = I$, $H^2 = I$: each undoes itself" Â· F "$AA^{-1} = I$; $(AC)^{-1} = C^{-1}A^{-1}$"
- **Stage:** `split( mx(prod(gate('X'), gate('X'))) / mx(prod(gate('H'), gate('H'))) )` â both resolve to $I$.
- **Refs:** Axler 3.79â3.80 pp. 90â91.
- **Claims:** `f3Xsq` â `matmul(X, X)` â $I$ Â· `f3Hsq` â `matmul(H, H)` â $I$.

**`f3-products:b5` [C]** (a product of three turns)
- **Q G:** "You apply $H$, then $Z$, then $H$ again. What single gate does the whole sequence equal?"
- **Q F:** "Simplify $HZH$."
- **Reveal G:** "It equals $X$, the NOT gate. Because $HXH = Z$ and $H$ undoes itself, the sandwich with $Z$ in the middle gives $X$. Three gates collapse to one: this is exactly the change of frame of the next unit."
- **Reveal F:** "$HZH = X$ (apply $H^2 = I$ to $HXH = Z$). So the Hadamard trades $X$ and $Z$: $Z$ seen in the x frame is $X$ (Unit F3.5)."
- **Reveal cap:** G/F "$HZH = X$"
- **Stage:** question `mx(gate('Z'))`; reveal `mx(prod(gate('H'), gate('Z'), gate('H')))`.
- **Claims:** `f3HZH` (reused).

### Unit `f3-adjoint` â The mirror of a map: $A^\dagger$

**`f3-adjoint:b1` [L] Â· notation beat, `introduces: ['qc-adjoint']`** (conjugate-transpose; D3)
- **G:** "Every map $A$ has a mirror, its [[qc-adjoint|adjoint]] $A^\dagger$. In a right-angled frame you get it by two moves: swap rows and columns, then conjugate every entry. It is the map that lets you move $A$ from the ket side to the bra side of an inner product."
- **F:** "The adjoint $A^\dagger$ is the unique operator with $\langle\varphi|A\psi\rangle = \langle A^\dagger\varphi|\psi\rangle$ for all $\varphi, \psi$ (N&C eq. 2.32). In an orthonormal basis its matrix is the conjugate transpose, $\langle i|A^\dagger|j\rangle = \langle j|A|i\rangle^*$ (Axler 7.7, 7.9; the engine's `dagger`): $A^\dagger = (A^*)^{\mathsf T}$."
- **Cap:** G "swap rows/columns, then conjugate" Â· F "$\langle\varphi|A\psi\rangle = \langle A^\dagger\varphi|\psi\rangle$; $A^\dagger = (A^*)^{\mathsf T}$"
- **Stage:** `split( mx(gate('S')) / mx(adj(gate('S'))) )` â $S = \operatorname{diag}(1, i)$ and $S^\dagger = \operatorname{diag}(1, -i)$, the corner hue flipped.
- **Derivation:** D3 (Â§2).
- **Claims:** `f3Sdag` â $S^\dagger$ â `dagger(S)` â $\operatorname{diag}(1, -i)$ Â· `f3SdagEntry` â $\langle 1|S^\dagger|1\rangle$ â `dagger(S)[1][1]` â $(0, -1)$.
- **Terms:** `qc-inner-product` (F2, link-back); `qc-conjugate` (F1).
- **Fidelity:** `qc-matrix-hue-is-phase`.

**`f3-adjoint:b2` [L]** (rules of the mirror)
- **G:** "The mirror obeys tidy rules. Mirroring twice returns the original: $(A^\dagger)^\dagger = A$. Mirroring a product reverses the order: $(AB)^\dagger = B^\dagger A^\dagger$. And a ket-bra flips: $(|w\rangle\langle v|)^\dagger = |v\rangle\langle w|$."
- **F:** "$(A^\dagger)^\dagger = A$; $(AB)^\dagger = B^\dagger A^\dagger$; $(|w\rangle\langle v|)^\dagger = |v\rangle\langle w|$; the adjoint is antilinear, $(\sum_i a_iA_i)^\dagger = \sum_i a_i^*A_i^\dagger$ (N&C Â§2.1.6, Ex. 2.13â2.15). Check: $(XZ)^\dagger = Z^\dagger X^\dagger = ZX$."
- **Cap:** G "mirror a product, reverse the order" Â· F "$(AB)^\dagger = B^\dagger A^\dagger$"
- **Stage:** `split( mx(adj(prod(gate('X'), gate('Z')))) / mx(prod(gate('Z'), gate('X'))) )` â $(XZ)^\dagger = ZX$.
- **Claims:** `f3ProdDag` â `dagger(matmul(X, Z))` equals `matmul(Z, X)` â true Â· `f3OuterDag` â `dagger(outer(KET['+z'], KET['-z']))` â `outer(KET['-z'], KET['+z'])`.

**`f3-adjoint:b3` [L] Â· notation beat, `introduces: ['qc-hermitian', 'qc-unitary']`** (self-mirror and length-keeping)
- **G:** "Two maps have special mirrors. A [[qc-hermitian|Hermitian]] map equals its own mirror, $A^\dagger = A$; the Pauli gates $X$, $Y$, $Z$ and $H$ are Hermitian. A [[qc-unitary|unitary]] map's mirror is its inverse, $U^\dagger = U^{-1}$; every quantum gate is unitary, which is why it keeps every length."
- **F:** "Hermitian (self-adjoint): $A^\dagger = A$ â $X$, $Y$, $Z$, $H$; these are the observables. Unitary: $U^\dagger U = I$, so $U^\dagger = U^{-1}$ â every gate, preserving $\langle\psi|\psi\rangle$ (N&C Â§2.1.6; notes n2 p. 9). A Hermitian operator has real eigenvalues and an orthonormal eigenbasis; the notes prove the reality on p. 15, and Chapter F4 states and uses it."
- **Cap:** G "Hermitian: $A^\dagger = A$; unitary: $U^\dagger = U^{-1}$" Â· F "$X^\dagger = X$; $U^\dagger U = I$"
- **Stage:** `split( mx(adj(gate('H'))) / mx(prod(adj(gate('H')), gate('H'))) )` â $H^\dagger = H$ and $H^\dagger H = I$.
- **Claims:** `f3Hdag` â `dagger(H)` equals `H` â true Â· `f3Xdag` â `dagger(X)` equals `X` â true Â· `f3SdagS` â `matmul(dagger(S), S)` â $I$.
- **Bridge:** `<<f4-spectral|F4 Hermitian operators have real eigenvalues>>`.
- **Guard (448 L3 HW):** "Hermitian â real eigenvalues" is 448 homework (`qc709-nc.md` ruling 1). F3 states the fact and cites the notes' p. 15 proof; it does **not** derive it. No F3 challenge asks for that proof.

**`f3-adjoint:b4` [B]** (the frame matters: the caution)
- **G:** "The swap-and-conjugate recipe for the mirror only works in a right-angled frame. In a skewed frame the mirror is not the conjugate transpose of the table, and a unitary's mirror is not its table inverse. This is why the course always works in orthonormal frames."
- **F:** "Axler 7.9's caution: with respect to a non-orthonormal basis, the matrix of $A^\dagger$ is **not** the conjugate transpose of the matrix of $A$. The adjoint is basis-free (it is fixed by the inner product); only the conjugate-transpose *recipe* needs orthonormality (the engine's `inv2` note: a skewed basis's dagger is not its inverse)."
- **Cap:** G/F "the conjugate-transpose recipe needs an orthonormal frame"
- **Stage:** `mx(adj(gate('H')))` with a caption naming the orthonormal-frame assumption.
- **Refs:** Axler 7.9 p. 232 (the caution).
- **Claims:** none (a statement beat; the warning carries no new number).

**`f3-adjoint:b5` [C]** (is the phase gate Hermitian?)
- **Q G:** "The phase gate $S$ has table $\operatorname{diag}(1, i)$. Is it Hermitian? Is it unitary?"
- **Q F:** "For $S = \operatorname{diag}(1, i)$, is $S^\dagger = S$? Is $S^\dagger S = I$?"
- **Reveal G:** "Not Hermitian: its mirror is $\operatorname{diag}(1, -i)$, with the corner conjugated, not the same as $S$. But it is unitary: mirror times itself is the identity, so $S$ keeps every length. Unitary does not mean self-mirror."
- **Reveal F:** "$S^\dagger = \operatorname{diag}(1, -i) \ne S$, so $S$ is not Hermitian; but $S^\dagger S = \operatorname{diag}(1, -i)\operatorname{diag}(1, i) = I$, so $S$ is unitary. Its eigenvalues $1, i$ lie on the unit circle, as a unitary's must."
- **Reveal cap:** G/F "$S^\dagger \ne S$, but $S^\dagger S = I$"
- **Stage:** question `mx(gate('S'))`; reveal `split( mx(adj(gate('S'))) / mx(prod(adj(gate('S')), gate('S'))) )`.
- **Claims:** `f3Sdag` (reused) Â· `f3SdagS` (reused) Â· `f3SHermGap` â `matEq(dagger(S), S)` â false.

### Unit `f3-change-of-basis` â The same map in a new frame: $UAU^\dagger$

**`f3-change-of-basis:b1` [L] Â· notation beat, `introduces: ['qc-change-of-basis']`** (coordinates in a new frame; D4)
- **G:** "Switch to a new orthonormal frame and a state's coordinates change by one table, the [[qc-change-of-basis|change-of-basis matrix]] $U$. Its entry $U_{ij} = \langle\text{new}_i|\text{old}_j\rangle$ is the overlap of a new frame vector with an old one, and the new coordinates are $d = Uc$."
- **F:** "For orthonormal frames, $U_{ij} = \langle\alpha'_i|\alpha_j\rangle$ gives the new coordinates $d = Uc$ (notes n2 Â§I.C.4; the engine's `changeU`). The zâx change is $U = H$: $|{+}z\rangle$ has new coordinates $U(1, 0) = (1/\sqrt2, 1/\sqrt2)$, that is $|{+}z\rangle = (|{+}x\rangle + |{-}x\rangle)/\sqrt2$."
- **Cap:** G "new coordinates $d = Uc$, $U_{ij} = \langle\text{new}_i|\text{old}_j\rangle$" Â· F "zâx: $U = H$, $U(1,0) = (1/\sqrt2, 1/\sqrt2)$"
- **Stage:** `split( mx(gate('H')) / amp({ket:'0'}, {labels:'bits'}) )` â $U = H$, and $|0\rangle$'s new coordinates.
- **Derivation:** D4 (Â§2), coordinate part.
- **Claims:** `f3Ux` â $U$ for zâx â `changeU([KET['+x'], KET['-x']])` â $H$ Â· `f3PluszInX` â `apply(changeU([KET['+x'],KET['-x']]), KET['+z'])` â $(0.7071, 0.7071)$.
- **Terms:** `qc-orthonormal-basis` (F2, link-back).

**`f3-change-of-basis:b2` [L]** (a map's table in the new frame; D4)
- **G:** "A map's table changes too: the new table is $U A U^\dagger$. You undo the frame, apply the map, redo the frame. The map itself is unchanged; only its description in numbers moves. Lengths, the determinant and the trace all stay the same."
- **F:** "An operator transforms as $A' = UAU^\dagger$ (notes n2 Â§I.C.4; derived by inserting completeness twice, $A'_{kl} = \sum_{ij}\langle k'|i\rangle A_{ij}\langle j|l'\rangle = \sum_{ij}U_{ki}A_{ij}U^*_{lj}$). The `matrix` stage draws this as $B^\dagger A B$ with $B$ the new frame's columns, so $U = B^\dagger$."
- **Cap:** G "the new table is $UAU^\dagger$" Â· F "Rosetta: notes' $\hat U\hat A\hat U^\dagger$ = the stage's $B^\dagger A B$, $U = B^\dagger$"
- **Stage:** `mx(gate('Z'), {basis:[{ket:'+'},{ket:'-'}]})` â $Z$ redrawn in the x frame, $B^\dagger Z B$.
- **Derivation:** D4 (Â§2), operator part.
- **Claims:** `f3ZinX` â $Z$ in the x basis â `changeU([KET['+x'],KET['-x']])` then $UZU^\dagger$ â â $X = [[0,1],[1,0]]$.
- **Fidelity:** `qc-matrix-basis-change`.

**`f3-change-of-basis:b3` [L]** (Z in the x frame is X)
- **G:** "Here is the punchline. The sign-flip $Z$, written in the x frame, is exactly the swap $X$. Measuring spin along z, seen by someone using the x frame, looks like a spin along x. The machine is one machine; the frame decides which table you see."
- **F:** "$UZU^\dagger = HZH = X$: $Z$ in the x basis is $X$ (consistent with $HXH = Z$, Unit F3.3). This is why $S_z$ and $S_x$ are the 'same' observable seen in rotated frames; Chapter Q2 owns the physics of photon-frame rotations $|x'\rangle = \cos\varphi|x\rangle + \sin\varphi|y\rangle$."
- **Cap:** G "$Z$ in the x frame is $X$" Â· F "$UZU^\dagger = HZH = X$"
- **Stage:** `split( mx(gate('Z')) / mx(gate('Z'), {basis:[{ket:'+'},{ket:'-'}]}) )` â $Z$ and its x-frame table $X$.
- **Claims:** `f3ZinX` (reused) Â· `f3HZH` (reused, from F3.3: $HZH = X$).
- **Bridge:** `<<f4-spectral|F4 same observable, rotated frame>>`.

**`f3-change-of-basis:b4` [B]** (the change-of-basis matrix is unitary)
- **G:** "The change-of-basis table is always unitary: its mirror is its inverse, $U^\dagger U = I$. This is because both frames are right-angled; the proof uses F2's completeness. So changing frames never stretches a state, and changing back with $U^\dagger$ returns it."
- **F:** "$U^\dagger U = I$ (notes n2 p. 9): $[U^\dagger U]_{ij} = \sum_k\langle\alpha'_i|\alpha_k\rangle\langle\alpha_k|\alpha'_j\rangle = \langle\alpha'_i|\alpha'_j\rangle = \delta_{ij}$, using completeness $\sum_k|\alpha_k\rangle\langle\alpha_k| = I$. The two change-of-basis matrices (oldânew and newâold) are inverses (Axler 3.82)."
- **Cap:** G/F "$U^\dagger U = I$: changing frames keeps lengths"
- **Stage:** `mx(prod(adj(gate('H')), gate('H')))` â $H^\dagger H = I$.
- **Refs:** notes n2 p. 9 (unitarity and completeness); Axler 3.82 p. 92.
- **Claims:** `f3Uunitary` â `matmul(dagger(changeU([KET['+x'],KET['-x']])), changeU([KET['+x'],KET['-x']]))` â $I$.

**`f3-change-of-basis:b5` [C]** (X in the x frame)
- **Q G:** "You just saw $Z$ in the x frame is $X$. What does $X$ itself look like in the x frame?"
- **Q F:** "Compute $UXU^\dagger = HXH$."
- **Reveal G:** "It is $Z$. In the x frame, the swap $X$ becomes the sign-flip $Z$: the two trade places. A frame where $X$ is diagonal is the x frame, and there $X$ just flips the sign of x-down. The pair $X, Z$ are mirror images under the Hadamard."
- **Reveal F:** "$UXU^\dagger = HXH = Z$ (Unit F3.3). In its own eigenframe, $X = \operatorname{diag}(1, -1)$: its eigenvalues $\pm1$ on the diagonal, $|{\pm}x\rangle$ as the frame. This diagonalization is Chapter F4's spectral theorem."
- **Reveal cap:** G/F "$X$ in the x frame is $Z$"
- **Stage:** question `mx(gate('X'))`; reveal `mx(gate('X'), {basis:[{ket:'+'},{ket:'-'}]})` (resolves to $Z$).
- **Claims:** `f3HXH` (reused) Â· `f3XinX` â $X$ in the x basis via $UXU^\dagger$ â $Z$.
- **Bridge:** `<<f4-spectral|F4 a Hermitian operator is diagonal in its eigenframe>>`.

**Beat count:** 5 + 5 + 5 + 5 + 5 = **25 beats**, 4 of them clues with reveals. Phase mix: 17 [L] Â· 4 [B] Â· 4 [C].

## 2. Derivations

Each step is `tex` â `why` â **view** â *viewCaption*. A step without a view inherits the latest earlier view in its own
track's list. Every list has â¥ 2 distinct views whose kinds appear on the unit's stage; Ground has at least as many steps
as Formal; the last `tex` ends on the result.

**D1 Â· `f3-matrix-of-map:b2` Â· result `f_i = \sum_j A_{ij}c_j,\ \ A_{ij} = \langle e_i|A|e_j\rangle`** (the matrix acts; notes n2 Â§I.D.1)
- Ground (4 views):
  1. `|\psi\rangle = \sum_j c_j|e_j\rangle` â Write the state in the frame, coordinates $c_j$ (F2). **view** `amp({dir:{thetaDeg:106.26, phiDeg:0}}, {mode:'amplitude'})` Â· *the state's two coordinates*
  2. `A|\psi\rangle = \sum_j c_j\,A|e_j\rangle` â Apply $A$; linearity pulls it through the sum. **view** `hp{ psi:{planeDeg:53.13}, image:{matrix:[['1/√2','1/√2'],['1/√2','-1/√2']]} }` Â· *$A$ applied to the state (real $A$)*
  3. `f_i = \langle e_i|A|\psi\rangle = \sum_j\langle e_i|A|e_j\rangle c_j` â Read off coordinate $i$ by taking $\langle e_i|\cdot\rangle$. **view** `mx(gate('H'), {highlightRow:0})` Â· *row $i$ of the table*
  4. `A_{ij} = \langle e_i|A|e_j\rangle` â Name that overlap the matrix element. **view** `mx(gate('H'))` Â· *the full table*
  5. `f_i = \sum_j A_{ij}c_j` â So the new coordinates are the table times the old, $\bar f = A\bar c$.
- Formal (2 views):
  1. `f_i = \langle e_i|A\psi\rangle = \sum_j\langle e_i|A|e_j\rangle c_j` â Insert completeness $\sum_j|e_j\rangle\langle e_j| = I$ (F2). **view** `mx(gate('H'))`
  2. `\bar f = A\bar c,\ \ A_{ij} = \langle e_i|A|e_j\rangle` â The matrix is the operator in coordinates. **view** `amp({dir:{thetaDeg:106.26, phiDeg:0}}, {mode:'amplitude'})`
- Check: `f3MatH`, `f3ActionHc`. Kinds: matrix, hilbert-plane, amplitudes.

**D2 Â· `f3-products:b1`â`b2` Â· result `(ST)_{jk} = \sum_r S_{jr}T_{rk}`, and `HXH = Z`** (Axler 3.41, 3.81)
- Ground (4 views):
  1. `(ST)|e_k\rangle = S\big(T|e_k\rangle\big)` â Doing $T$ then $S$ means feed $T$'s output into $S$. **view** `mx(gate('X'))` Â· *the inner map $T = X$*
  2. `T|e_k\rangle = \sum_r T_{rk}|e_r\rangle` â Column $k$ of $T$ (F2's components). **view** `mx(gate('X'), {highlightCol:0})` Â· *column $k$ of $T$*
  3. `S\big(\sum_r T_{rk}|e_r\rangle\big) = \sum_{j,r} S_{jr}T_{rk}|e_j\rangle` â Apply $S$ to each and collect by output vector. **view** `mx(prod(gate('H'), gate('X')))` Â· *the product $HX$*
  4. `(ST)_{jk} = \sum_r S_{jr}T_{rk}` â Row $j$ of $S$ dotted with column $k$ of $T$.
  5. `HXH = Z` â Multiply the three tables in this way. **view** `mx(prod(gate('H'), gate('X'), gate('H')))` Â· *the sandwich resolves to $Z$*
- Formal (2 views):
  1. `(ST)_{jk} = \sum_r S_{jr}T_{rk}` â Chosen so $\mathcal M(ST) = \mathcal M(S)\mathcal M(T)$ (Axler 3.41). **view** `mx(prod(gate('H'), gate('X')))`
  2. `HXH = Z` â A direct product; $H^2 = I$ then gives $HZH = X$. **view** `mx(prod(gate('H'), gate('X'), gate('H')))`
- Check: `f3HX`, `f3HXH`, `f3HZH`. Kinds: matrix. Needs: matrix-v2 (`product`).

**D3 Â· `f3-adjoint:b1` Â· result `\langle i|A^\dagger|j\rangle = \langle j|A|i\rangle^*,\ \ A^\dagger = (A^*)^{\mathsf T}`** (Axler 7.9; N&C eq. 2.32)
- Ground (3 views):
  1. `\langle\varphi|A\psi\rangle = \langle A^\dagger\varphi|\psi\rangle` â The adjoint is the map that moves $A$ to the bra side. **view** `mx(gate('S'))` Â· *the map $A = S$*
  2. `\langle e_i|A^\dagger|e_j\rangle = \langle Ae_i|e_j\rangle = \langle e_j|Ae_i\rangle^*` â Put frame vectors in and use conjugate symmetry (F2). **view** `mx(gate('S'), {highlight:[[1,1]]})` Â· *the entry $\langle 1|A|1\rangle = i$*
  3. `\langle e_i|A^\dagger|e_j\rangle = A_{ji}^*` â So the $(i, j)$ entry of $A^\dagger$ is the conjugate of the $(j, i)$ entry of $A$. **view** `mx(adj(gate('S')), {highlight:[[1,1]]})` Â· *the mirrored entry $-i$*
  4. `A^\dagger = (A^*)^{\mathsf T}` â Swap rows and columns, then conjugate: the conjugate transpose.
- Formal (2 views):
  1. `\langle i|A^\dagger|j\rangle = \langle j|A|i\rangle^*` â From $\langle\varphi|A\psi\rangle = \langle A^\dagger\varphi|\psi\rangle$ in an orthonormal basis (Axler 7.9). **view** `mx(gate('S'))`
  2. `A^\dagger = (A^*)^{\mathsf T}` â The conjugate transpose (N&C eq. 2.34); needs orthonormality (Axler 7.9 caution). **view** `mx(adj(gate('S')))`
- Check: `f3Sdag`, `f3SdagEntry`. Kinds: matrix. Needs: matrix-v2 (`adjoint`).

**D4 Â· `f3-change-of-basis:b1`â`b2` Â· result `d = Uc,\ \ A' = UAU^\dagger,\ \ U_{ij} = \langle\alpha'_i|\alpha_j\rangle`** (notes n2 Â§I.C.4)
- Ground (4 views):
  1. `d_i = \langle\alpha'_i|\psi\rangle` â The new coordinate is the overlap with a new frame vector (F2). **view** `mx(gate('H'))` Â· *$U = H$ for zâx*
  2. `d_i = \sum_j\langle\alpha'_i|\alpha_j\rangle c_j = \sum_j U_{ij}c_j` â Expand $|\psi\rangle$ in the old frame; $U_{ij} = \langle\alpha'_i|\alpha_j\rangle$. **view** `amp({ket:'0'}, {labels:'bits'})` Â· *$|0\rangle$'s new coordinates $U(1,0)$*
  3. `A'_{kl} = \langle\alpha'_k|A|\alpha'_l\rangle = \sum_{ij}\langle\alpha'_k|\alpha_i\rangle A_{ij}\langle\alpha_j|\alpha'_l\rangle` â Insert completeness twice, once on each side of $A$. **view** `mx(gate('Z'))` Â· *the old table $A = Z$*
  4. `A'_{kl} = \sum_{ij} U_{ki}A_{ij}U^*_{lj}` â The overlaps are $U$ and $U^*$: so $A' = UAU^\dagger$. **view** `mx(gate('Z'), {basis:[{ket:'+'},{ket:'-'}]})` Â· *$Z$ redrawn in the x frame = $X$*
  5. `d = Uc,\ \ A' = UAU^\dagger` â Coordinates by $U$, operators sandwiched by $U$ and $U^\dagger$.
- Formal (2 views):
  1. `d = Uc,\ \ U_{ij} = \langle\alpha'_i|\alpha_j\rangle` â Overlaps of the two orthonormal frames (notes n2). **view** `mx(gate('H'))`
  2. `A' = UAU^\dagger` â Completeness inserted twice; drawn as $B^\dagger A B$, $U = B^\dagger$. **view** `mx(gate('Z'), {basis:[{ket:'+'},{ket:'-'}]})`
- Check: `f3Ux`, `f3PluszInX`, `f3ZinX`. Kinds: matrix, amplitudes. Needs: matrix-v2 (`basis`).

**View counts** (distinct views, Ground / Formal): D1 4/2 Â· D2 4/2 Â· D3 3/2 Â· D4 4/2. Ground steps â¥ Formal steps in
every pair. Every view's kind is on its unit's stage. Four derivations need `matrix` v2 (`product` D2, `adjoint` D3,
`basis` D4; D1 is grid-only). No new engine function is needed.

## 3. Try-it widget per unit

Existing widgets (`app/src/widgets/`; prop names are the real ones, reused from 448 L3 and F2).

| Unit | Widget spec | Why this one |
|---|---|---|
| `f3-linear-maps` | `{kind:'hilbert-plane', props:{mode:'image', op:'X'}}` | Drag $|\psi\rangle$; watch $A|\psi\rangle$ follow linearly (b1âb3). |
| `f3-matrix-of-map` | `{kind:'matrix-builder', props:{op:'H'}}` | Each column is $A$ on a frame vector; read $A_{ij} = \langle i|A|j\rangle$ (b1, b5). |
| `f3-products` | `{kind:'matrix-builder', props:{op:'X', compose:'Z'}}` | Multiply two tables; swap the order and watch the sign flip (b1, b3). |
| `f3-adjoint` | `{kind:'matrix-builder', props:{op:'S', showDagger:true}}` | Toggle the dagger: rowsâcolumns, conjugate; see $S^\dagger \ne S$ but $S^\dagger S = I$ (b1, b5). |
| `f3-change-of-basis` | `{kind:'matrix-builder', props:{op:'Z', basis:'x'}}` | Switch to the x frame: $Z$'s table becomes $X$ (b2âb3). |

**Try this** (both tracks share the steps; F wording in brackets where it differs):
- `f3-linear-maps`: (1) Apply $X$ to $|0\rangle$: where does it land? (2) Apply $Z$ to a tilted state. (3) Try "square the amplitudes": is the image linear? [Check homogeneity.]
- `f3-matrix-of-map`: (1) Read column 0 of $X$. (2) Build $H$ column by column. (3) Read $\langle 0|X|1\rangle$ off the grid.
- `f3-products`: (1) Multiply $H\cdot X$. (2) Sandwich $HXH$: name it. (3) Compare $XZ$ and $ZX$.
- `f3-adjoint`: (1) Dagger $X$: unchanged. (2) Dagger $S$: the corner conjugates. (3) Check $S^\dagger S = I$.
- `f3-change-of-basis`: (1) Draw $Z$ in the z frame. (2) Switch to the x frame: read the new table. (3) Do the same for $X$. [Confirm $HXH = Z$.]

## 4. Challenges per unit

Tolerance 0.005 unless stated, 0 for exact integers. Hints climb nudge â key idea â setup. **Homework:** 709 HW1 P5
(the spin-1 change-of-basis matrix $U_{ij} = \langle\alpha'_i|\alpha_j\rangle$ with $U^\dagger U = I$, parts dâe) overlaps
`f3-change-of-basis`; its status is Â§12 Q1 (shared with P-F2). While unresolved, no F3 challenge reproduces the spin-1
construction; the change-of-basis challenge `f3-cb-unitary` uses the spin-Â½ zâx $U = H$ instead, with a full walkthrough.
No challenge asks for "Hermitian â real eigenvalues" (448 homework, `qc709-nc.md` ruling 1).

### `f3-linear-maps`
1. **warm-up Â· numeric Â· `f3-l-act`** â "What is the second entry of $X|{+}z\rangle$?"
   - Answer: **1** = `apply(X, KET['+z'])[1].re`.
   - Hints: (1) $X$ swaps the two numbers. (2) $(1, 0) \mapsto (0, 1)$. (3) The second entry is 1.
   - Walkthrough: $X|{+}z\rangle = |{-}z\rangle = (0, 1)$.
2. **core Â· choice Â· `f3-l-linear`** â "Which rule is a linear map on $\mathbb C^2$?"
   - Options: $(a, b) \mapsto (a^2, b^2)$ Â· $(a, b) \mapsto (a + 1, b)$ Â· **$(a, b) \mapsto (b, a)$** â Â· $(a, b) \mapsto (|a|, |b|)$.
   - Hints: (1) Linear means $A(2\psi) = 2A\psi$ and $A(\psi + \phi) = A\psi + A\phi$. (2) Squaring and adding 1 fail. (3) Swapping passes.
   - Walkthrough: $(a, b) \mapsto (b, a)$ is $X$, linear. Squaring quadruples on doubling; adding 1 moves the origin.
3. **core Â· numeric Â· `f3-l-proj`** â "The projector $|0\rangle\langle 0|$ acts on $(0.6, 0.8)$. What is the second entry of the result?"
   - Answer: **0** = `apply(outer(KET['+z'],KET['+z']), vec(0.6,0.8))[1].re`.
   - Hints: (1) $|0\rangle\langle 0|$ keeps the $|0\rangle$ part. (2) It is $\operatorname{diag}(1, 0)$. (3) The second entry is dropped.
   - Walkthrough: $(0.6, 0)$: the projector keeps only the up part.

### `f3-matrix-of-map`
1. **warm-up Â· numeric Â· `f3-m-entry`** â "What is $\langle 0|X|1\rangle$?"
   - Answer: **1** = `inner(KET['+z'], apply(X, KET['-z'])).re`.
   - Hints: (1) $X|1\rangle = |0\rangle$. (2) $\langle 0|0\rangle$. (3) 1.
   - Walkthrough: $\langle 0|X|1\rangle = 1$, the off-diagonal entry of $X$.
2. **core Â· numeric Â· `f3-m-hadamard`** â "What is $\langle 1|H|1\rangle$?"
   - Answer: **â0.7071** = `H[1][1].re`.
   - Hints: (1) $H|1\rangle = |{-}x\rangle = (1/\sqrt2, -1/\sqrt2)$. (2) Overlap with $\langle 1|$. (3) $-1/\sqrt2$.
   - Walkthrough: $\langle 1|H|1\rangle = -0.7071$, the one negative entry of $H$.
3. **core Â· numeric Â· `f3-m-act`** â "$H$ acts on $(0.6, 0.8)$. What is the first entry of the result?"
   - Answer: **0.9899** = `apply(H, vec(0.6, 0.8))[0].re`.
   - Hints: (1) $\bar f = H\bar c$. (2) First row of $H$ is $(1/\sqrt2, 1/\sqrt2)$. (3) $(0.6 + 0.8)/\sqrt2$.
   - Walkthrough: $0.9899$ (the same x coordinate as F2's `f2-o-xframe`: applying $H$ is changing to the x frame).

### `f3-products`
1. **warm-up Â· numeric Â· `f3-p-hxh`** â "What is the entry $\langle 1|HXH|1\rangle$?"
   - Answer: **â1** = `matmul(matmul(H,X),H)[1][1].re`.
   - Hints: (1) $HXH = Z$. (2) $Z = \operatorname{diag}(1, -1)$. (3) The lower entry is $-1$.
   - Walkthrough: $HXH = Z$, so $\langle 1|HXH|1\rangle = -1$.
2. **core Â· choice Â· `f3-p-order`** â "Which is true for $X$ and $Z$?"
   - Options: $XZ = ZX$ Â· **$XZ = -ZX$** â Â· $XZ = I$ Â· $XZ = Z$. Check: `matEq(matmul(X,Z), mscale(matmul(Z,X), -1))` â true.
   - Hints: (1) Compute both. (2) $XZ = \begin{psmallmatrix}0&-1\\1&0\end{psmallmatrix}$, $ZX = \begin{psmallmatrix}0&1\\-1&0\end{psmallmatrix}$. (3) Compare signs.
   - Walkthrough: $XZ = -ZX$: they anticommute, so order flips every sign.
3. **core Â· numeric Â· `f3-p-inverse`** â "What is $X^2$? Give the $\langle 0|X^2|0\rangle$ entry."
   - Answer: **1** = `matmul(X, X)[0][0].re`.
   - Hints: (1) $X$ undoes itself. (2) $X^2 = I$. (3) The $(0, 0)$ entry of $I$ is 1.
   - Walkthrough: $X^2 = I$, so $\langle 0|X^2|0\rangle = 1$: $X$ is its own inverse.

### `f3-adjoint`
1. **warm-up Â· numeric Â· `f3-a-sdag`** â "For $S = \operatorname{diag}(1, i)$, what is the $(1,1)$ entry of $S^\dagger$?"
   - Answer: **âi** (imaginary part **â1**) = `dagger(S)[1][1].im`.
   - Hints: (1) Conjugate the diagonal. (2) $i$ becomes $-i$. (3) Imaginary part $-1$.
   - Walkthrough: $S^\dagger = \operatorname{diag}(1, -i)$.
2. **core Â· choice Â· `f3-a-hermitian`** â "Which of these is Hermitian ($A^\dagger = A$)?"
   - Options: $S = \operatorname{diag}(1, i)$ Â· **$Y = \begin{psmallmatrix}0&-i\\i&0\end{psmallmatrix}$** â Â· $|0\rangle\langle 1|$ Â· $\operatorname{diag}(1, 2i)$. Check: `isHermitian(Y)` â true; `isHermitian(S)` â false.
   - Hints: (1) Conjugate-transpose each. (2) $Y^\dagger = Y$. (3) $S^\dagger \ne S$.
   - Walkthrough: $Y$ is Hermitian; $S$ and $\operatorname{diag}(1, 2i)$ are not (complex diagonal); $|0\rangle\langle 1|$ is not symmetric.
3. **core Â· numeric Â· `f3-a-unitary`** â "Is $S$ unitary? Give the $(0,0)$ entry of $S^\dagger S$."
   - Answer: **1** = `matmul(dagger(S), S)[0][0].re`.
   - Hints: (1) $S^\dagger S$. (2) $\operatorname{diag}(1, -i)\operatorname{diag}(1, i)$. (3) $\operatorname{diag}(1, 1) = I$.
   - Walkthrough: $S^\dagger S = I$, so $S$ is unitary though not Hermitian.
4. **stretch Â· choice Â· `f3-a-product`** â "What is $(XZ)^\dagger$?"
   - Options: $XZ$ Â· $X^\dagger Z^\dagger$ Â· **$ZX$** â Â· $-XZ$. Check: `matEq(dagger(matmul(X,Z)), matmul(Z,X))` â true.
   - Hints: (1) $(AB)^\dagger = B^\dagger A^\dagger$. (2) $X^\dagger = X$, $Z^\dagger = Z$. (3) Reverse the order.
   - Walkthrough: $(XZ)^\dagger = Z^\dagger X^\dagger = ZX$.

### `f3-change-of-basis`
1. **warm-up Â· numeric Â· `f3-cb-coord`** â "$|0\rangle$ in the x frame: what is its first new coordinate $\langle{+}x|0\rangle$?"
   - Answer: **0.7071** = `inner(KET['+x'], KET['+z']).re`.
   - Hints: (1) $U = H$ for zâx. (2) First row of $H$ times $(1, 0)$. (3) $1/\sqrt2$.
   - Walkthrough: $|0\rangle = (|{+}x\rangle + |{-}x\rangle)/\sqrt2$, so the first coordinate is $0.7071$.
2. **core Â· numeric Â· `f3-cb-zinx`** â "What is the $(0,1)$ entry of $Z$ written in the x frame, $UZU^\dagger$?"
   - Answer: **1** = $(UZU^\dagger)_{01}$ with $U = $ `changeU([KET['+x'],KET['-x']])`.
   - Hints: (1) $UZU^\dagger = HZH$. (2) $HZH = X$. (3) The off-diagonal of $X$ is 1.
   - Walkthrough: $Z$ in the x frame is $X$, whose $(0, 1)$ entry is 1.
3. **core Â· numeric Â· `f3-cb-unitary`** â "For the zâx change $U = H$, what is the $(0,0)$ entry of $U^\dagger U$?"
   - Answer: **1** = `matmul(dagger(H), H)[0][0].re`.
   - Hints: (1) A change-of-basis matrix is unitary. (2) $H^\dagger H = I$. (3) The $(0,0)$ entry of $I$ is 1.
   - Walkthrough: $U^\dagger U = I$: changing frames keeps every length. (This is the spin-Â½ analogue of HW1 P5(d)'s $\hat U^\dagger\hat U = \hat 1$; the spin-1 version stays in the homework, Â§12 Q1.)
4. **stretch Â· numeric Â· `f3-cb-xinx`** â "What does $X$ become in the x frame? Give the $(0,0)$ entry of $UXU^\dagger$."
   - Answer: **1** = $(HXH)_{00}$ = `matmul(matmul(H,X),H)[0][0].re`.
   - Hints: (1) $UXU^\dagger = HXH$. (2) $HXH = Z$. (3) The $(0,0)$ entry of $Z$ is 1.
   - Walkthrough: $X$ in its own frame is $Z = \operatorname{diag}(1, -1)$; the $(0, 0)$ entry is 1.

## 5. Glossary terms new in F3

Ids start `qc-` (709 namespace). `introduces` marks the notation beats (W-709 #8). Inline math is TeX inside `$â¦$`.
Ground gloss â¤ 25 words. `bridge` = a 448, F1 or F2 unit whose glossary teaches the same idea.

| id | Term | introduces | Ground gloss | Formal definition | First use | bridge |
|---|---|---|---|---|---|---|
| `qc-linear-operator` | linear map (operator) | notation | A map between states that respects adding and scaling. | $A: V \to W$ with $A(a\|\psi_1\rangle + b\|\psi_2\rangle) = aA\|\psi_1\rangle + bA\|\psi_2\rangle$ (Axler Â§3A). | `f3-linear-maps:b1` | `l3-operators` |
| `qc-matrix-of-map` | matrix element $A_{ij}$ | notation | The grid of a map: entry $A_{ij} = \langle i\|A\|j\rangle$, column $j$ is $A$ on frame vector $j$. | $A_{ij} = \langle e_i\|A\|e_j\rangle$ in an orthonormal basis (Axler 3.31; notes n2). | `f3-matrix-of-map:b1` | `l3-matrices` |
| `qc-outer-product` | outer product $\|i\rangle\langle j\|$ | notation | A ket times a bra: the rank-one map sending $\|j\rangle$ to $\|i\rangle$. | $\|w\rangle\langle v\|$, with $(\|w\rangle\langle v\|)\|\psi\rangle = \langle v\|\psi\rangle\,\|w\rangle$ (engine `outer`; notes n2). | `f3-matrix-of-map:b1` | `l4-projectors` |
| `qc-matrix-product` | matrix product | notation | The table of two maps done in turn: row of the first against column of the second. | $(ST)_{jk} = \sum_r S_{jr}T_{rk}$, so $\mathcal M(ST) = \mathcal M(S)\mathcal M(T)$ (Axler 3.41). | `f3-products:b1` | `l3-matrices` |
| `qc-adjoint` | adjoint $A^\dagger$ | notation | A map's mirror: swap rows and columns, then conjugate every entry. | $\langle\varphi\|A\psi\rangle = \langle A^\dagger\varphi\|\psi\rangle$; in an orthonormal basis $A^\dagger = (A^*)^{\mathsf T}$ (Axler 7.7, 7.9; N&C 2.32). | `f3-adjoint:b1` | `f2-inner-product` |
| `qc-hermitian` | Hermitian (self-adjoint) | â | A map that equals its own mirror. | $A^\dagger = A$; $X, Y, Z, H$ are Hermitian (N&C Â§2.1.6). | `f3-adjoint:b3` | `l4-hermitian` |
| `qc-unitary` | unitary | â | A map whose mirror is its inverse; it keeps every length. | $U^\dagger U = I$, so $U^\dagger = U^{-1}$; every gate is unitary (notes n2 p. 9). | `f3-adjoint:b3` | `l5-unitary` |
| `qc-change-of-basis` | change-of-basis matrix $U$ | notation | The table that rewrites coordinates and maps in a new frame. | $U_{ij} = \langle\alpha'_i\|\alpha_j\rangle$; $d = Uc$, $A' = UAU^\dagger$ (notes n2 Â§I.C.4). | `f3-change-of-basis:b1` | `l5-change-basis` |

Reused (link-back, not re-introduced): F2 `qc-ket`, `qc-bra`, `qc-inner-product`, `qc-norm`, `qc-orthonormal-basis`,
`qc-projection`, `qc-dimension`; F1 `qc-complex-number`, `qc-conjugate`. `qc-identity-operator` and `qc-inverse-operator`
are named inside `f3-products:b4` but kept as plain terms (not glossed), since Axler 3.79â3.80 define them in place and
no later chapter needs a separate gloss (Â§12 Q3). Closure: every technical word has an entry here, in F1/F2, or is
9th-grade.

**Notation beats (one each, both tracks, with a view):**

| Gloss id | Kind | Beat | View |
|---|---|---|---|
| `qc-linear-operator` | notation | `f3-linear-maps:b1` | `hp{ psi:'+z', image:{named:'sx'} }` |
| `qc-matrix-of-map` | notation | `f3-matrix-of-map:b1` | `split( hp{ psi:'+z', image:{named:'sx'} } / mx(gate('X'), {highlightCol:0}) )` |
| `qc-outer-product` | notation | `f3-matrix-of-map:b1` | same beat (`Beat.introduces: ['qc-matrix-of-map', 'qc-outer-product']`) |
| `qc-matrix-product` | notation | `f3-products:b1` | `split( mx(prod(gate('H'), gate('X'))) / mx(gate('H')) )` |
| `qc-adjoint` | notation | `f3-adjoint:b1` | `split( mx(gate('S')) / mx(adj(gate('S'))) )` |
| `qc-change-of-basis` | notation | `f3-change-of-basis:b1` | `split( mx(gate('H')) / amp({ket:'0'}, {labels:'bits'}) )` |

`qc-hermitian` and `qc-unitary` are introduced together in `f3-adjoint:b3` (`Beat.introduces: ['qc-hermitian',
'qc-unitary']`) but carry no `GlossEntry.introduces` eyebrow (they name a *property*, not a new space or symbol â their
`introduces` column is "â"), so the W-709 #8 lint (exactly one beat per *space/notation* gloss) is satisfied: only the
seven notation entries above carry an eyebrow. `f3-matrix-of-map:b1` introduces two notation ids (see Â§12 Q3).

## 6. Review card per unit (both tracks)

Every number is an F3 claim from Â§1 or Â§4.

### `f3-linear-maps`
- **G points:** (1) A linear map respects sums and scaling. (2) It is fixed by its action on a frame. (3) Gates, projections and rotations are linear. (4) Squaring the amplitudes is not linear.
- **F points:** (1) $A(a\psi_1 + b\psi_2) = aA\psi_1 + bA\psi_2$. (2) $A|\psi\rangle = \sum_j c_j A|e_j\rangle$. (3) $I$ and the zero map; composition $BA$.
- **Equations:** $A(a|\psi_1\rangle + b|\psi_2\rangle) = aA|\psi_1\rangle + bA|\psi_2\rangle$
- **Trap:** calling the Born rule $|c_i|^2$ a linear map. Squaring fails homogeneity; probabilities are read off, not applied.

### `f3-matrix-of-map`
- **G points:** (1) Column $j$ is $A$ on frame vector $j$. (2) $A_{ij} = \langle i|A|j\rangle$. (3) Acting is $\bar f = A\bar c$. (4) A table is a sum of ket-bras.
- **F points:** (1) $A_{ij} = \langle e_i|A|e_j\rangle$ in an orthonormal basis. (2) $A = \sum_{ij} A_{ij}|e_i\rangle\langle e_j|$. (3) $X = |0\rangle\langle 1| + |1\rangle\langle 0|$.
- **Equations:** $A_{ij} = \langle e_i|A|e_j\rangle,\quad \bar f = A\bar c$
- **Trap:** reading rows as images. The $k$th *column*, not row, is $A|e_k\rangle$.

### `f3-products`
- **G points:** (1) $ST$ is "do $T$, then $S$". (2) $(ST)_{jk} = \sum_r S_{jr}T_{rk}$. (3) Order matters: $XZ = -ZX$. (4) $X^2 = H^2 = I$.
- **F points:** (1) Multiplication is defined to give $\mathcal M(ST) = \mathcal M(S)\mathcal M(T)$. (2) $HXH = Z$. (3) $(AC)^{-1} = C^{-1}A^{-1}$.
- **Equations:** $(ST)_{jk} = \sum_r S_{jr}T_{rk},\quad HXH = Z$
- **Trap:** assuming $AB = BA$. For $X, Z$ they differ by a sign.

### `f3-adjoint`
- **G points:** (1) $A^\dagger$ = swap rows/columns, then conjugate. (2) $(AB)^\dagger = B^\dagger A^\dagger$, $(A^\dagger)^\dagger = A$. (3) Hermitian: $A^\dagger = A$. (4) Unitary: $U^\dagger = U^{-1}$, keeps lengths.
- **F points:** (1) $\langle\varphi|A\psi\rangle = \langle A^\dagger\varphi|\psi\rangle$; $A^\dagger = (A^*)^{\mathsf T}$. (2) $X, Y, Z, H$ Hermitian; every gate unitary. (3) In a non-orthonormal frame the conjugate-transpose recipe fails.
- **Equations:** $A^\dagger = (A^*)^{\mathsf T},\quad A^\dagger = A\ (\text{Hermitian}),\quad U^\dagger U = I\ (\text{unitary})$
- **Trap:** thinking unitary means self-mirror. $S$ is unitary but $S^\dagger \ne S$.

### `f3-change-of-basis`
- **G points:** (1) New coordinates $d = Uc$, $U_{ij} = \langle\text{new}_i|\text{old}_j\rangle$. (2) A map's table becomes $UAU^\dagger$. (3) $Z$ in the x frame is $X$. (4) $U$ is unitary, so lengths are kept.
- **F points:** (1) $A' = UAU^\dagger$, drawn as $B^\dagger A B$. (2) $UZU^\dagger = HZH = X$. (3) $U^\dagger U = I$; the two change-of-basis matrices are inverses (Axler 3.82).
- **Equations:** $d = Uc,\quad A' = UAU^\dagger,\quad U^\dagger U = I$
- **Trap:** thinking the map changed. Only its table changed; the map, its lengths, its trace and its determinant are the same.

## 7. Symbol-before-use tables

Reading order: units in order; inside a unit, beats (L â B â C, reveals in place), then Try it, review, challenges.
Abbreviations lm, mm, pr, ad, cb for the five units. Status: OK Â· **FLAG** Â· gloss.

### 7.1 Ground track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $A$, $A\|\psi\rangle$ | lm:b1 | lm:b1 | OK | Tag `qc-linear-operator`. |
| $X$, $Z$ | lm:b1, b3 | lm:b1, b3 | OK | NOT gate; sign flip. |
| $\|i\rangle\langle j\|$ | mm:b1 | mm:b1 | OK | Tag `qc-outer-product`; F2 named it at `f2-orthonormal:b5`. |
| $A_{ij}$ | mm:b1 | mm:b1 | OK | Tag `qc-matrix-of-map`. |
| $H$ | mm:b3 | mm:b3 | OK | Hadamard; the zâx map. |
| $ST$, $(ST)_{jk}$ | pr:b1 | pr:b1 | OK | Tag `qc-matrix-product`. |
| $I$ | pr:b4 | pr:b4 | OK | Identity table (F2 named it at `f2-orthonormal:b5`). |
| $A^{-1}$ | pr:b4 | pr:b4 | OK | Inverse. |
| $A^\dagger$ | ad:b1 | ad:b1 | OK | Tag `qc-adjoint`. |
| $S$ | ad:b1 | ad:b1 | OK | Phase gate $\operatorname{diag}(1, i)$, defined in place. |
| $Y$ | ad challenge | ad `f3-a-hermitian` | OK | $\begin{psmallmatrix}0&-i\\i&0\end{psmallmatrix}$, given in the option. |
| $U$ | cb:b1 | cb:b1 | OK | Tag `qc-change-of-basis`. |

### 7.2 Formal track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $\mathcal L(V, W)$, $\mathcal M(T)$ | lm:b1, mm:b1 | lm:b1; mm:b1 Rosetta | OK | Axler's names; our $A$ and its matrix. |
| $A^* = (A^*)^{\mathsf T}$ (Axler) | ad:b1 | ad:b1 Rosetta | OK | Axler's conjugate transpose $A^*$ = our $A^\dagger$. |
| $\delta_{ij}$ | cb:b4 | F2 (`f2-orthonormal:b2`) | OK | Carried from F2. |
| $\sum_k\|\alpha_k\rangle\langle\alpha_k\| = I$ | cb:b4 | F2 (`f2-orthonormal:b5`) | OK | Completeness, carried from F2. |
| $U_{ij} = \langle\alpha'_i\|\alpha_j\rangle$ | cb:b1 | cb:b1 | OK | â |
| $B$, $B^\dagger A B$ | cb:b2 | cb:b2 Rosetta | OK | The stage's basis matrix; $U = B^\dagger$. |
| $[X, Z]$ | pr:b3 F | pr:b3 (named); Q3 owns | gloss | Commutator; full treatment Chapter Q3. |

**Counts:** 0 Ground FLAGs, 0 Formal FLAGs. Axler's $\mathcal M(T)$ / $A^*$ and the stage's $B^\dagger A B$ are
reconciled in the `f3-matrix-of-map:b1` and `f3-change-of-basis:b2` Rosetta captions before first use.

## 8. Errata

**No `Correction` in F3.** Every statement from Axler Â§3A, Â§3C, Â§3D, Â§7A, N&C Â§2.1.2/Â§2.1.6, and notes n2 pp. 8â10 was
re-checked (Â§ Evidence) and holds. Items for the record:

| # | Where | Finding | Action |
|---|---|---|---|
| F3-E1 | Adjoint notation | Axler writes the conjugate transpose $A^*$ (7.7); N&C and this course write $A^\dagger$ (N&C 2.34). | Rosetta in `f3-adjoint:b1`; the engine's `dagger` is $A^\dagger$. |
| F3-E2 | Change-of-basis form | Notes write $\hat A' = \hat U\hat A\hat U^\dagger$, $U_{ij} = \langle\alpha'_i\|\alpha_j\rangle$; the `matrix` stage draws $B^\dagger A B$ with $B$ = new columns, so $U = B^\dagger$. | Rosetta in `f3-change-of-basis:b2`; `changeU` returns $B^\dagger$. |
| F3-E3 | Axler 7.9 caution | In a NON-orthonormal basis, the matrix of $A^\dagger$ is not the conjugate transpose of the matrix of $A$. | `f3-adjoint:b4` states it; all F3 frames are orthonormal. |
| F3-E4 | Hermitian â real eigenvalues | 448 L3 homework (`qc709-nc.md` ruling 1); the notes prove it on p. 15. | `f3-adjoint:b3` states and cites; no derivation, no challenge (Â§12 Q2). |

## 9. Engine gaps and stage-contract gaps

### 9.1 Engine â **no new functions**
Every F3 number comes from existing functions; the numpy twin route for each is `scratchpad/f23plan-verify.py` (and the
repo's `pipeline/make_qc_fixtures.py` block "cmat").

| Operation | Function (module) | Used by | numpy twin |
|---|---|---|---|
| $A\|\psi\rangle$ | `apply` (linalg) | lm, mm:b2 | $A @ \psi$ |
| $A_{ij} = \langle i\|A\|j\rangle$ | `inner`, `apply` (linalg) | mm:b1, b5, D1 | $\bar e_i\,(A e_j)$ |
| $\|w\rangle\langle v\|$ | `outer` (linalg) | mm:b1, b4, D1 | `np.outer(w, conj(v))` |
| $ST$ | `matmul` (linalg) | pr, cb, D2/D4 | `A @ B` and the explicit $\sum_r$ |
| $A^\dagger$ | `dagger` (linalg) | ad, cb:b4, D3 | `A.conj().T` and the relation $\langle\varphi\|A\psi\rangle = \langle A^\dagger\varphi\|\psi\rangle$ |
| Hermitian / unitary test | `isHermitian`, `isUnitary` (linalg) | ad:b3, b5 | `allclose(A, A.conj().T)` / `A^\dagger A = I` |
| $I$, $A^{-1}$ | `identity`, `invN`/`inv2` (cmat/linalg) | pr:b4 | `eye`, `inv` |
| $U_{ij} = \langle\text{new}_i\|\text{old}_j\rangle$, $UAU^\dagger$ | `changeU`, `matmul`, `dagger` (cmat/linalg) | cb, D4 | $B^\dagger$; $UAU^\dagger$ and $\sum_{ij}U_{ki}A_{ij}U^*_{lj}$ |

### 9.2 Stage contract â existing `matrix` v2 fields suffice
F3 uses the **merged** `matrix` v2 (the re-map's Â§6.2 and `stage-kinds.md`): sources `{gate}`, `{pauli}`, `{outer}`,
`{product}`, `{adjoint}`, `{lin}`; display `labels:'kets'`, `values:'exact'`, `highlight`/`highlightRow`/`highlightCol`,
`trace`; and the v2 `basis` field (Bâ AB) used by `f3-change-of-basis:b2`â`b3`, `f3-change-of-basis:b5`, D4. `hilbert-plane`
`image` (real $A$ only: $X$, $Z$, $H$, a rotation) is used in `f3-linear-maps` and D1; `amplitudes` and `bloch` (709) as
in F2.

| # | Field | Used as | Beats / derivations |
|---|---|---|---|
| (a) | `{product:[â¦]}` | $HX$, $HXH$, $XZ$, $ZX$, $X^2$, $H^2$, $H^\dagger H$ | pr:b1âb4, ad:b3, b5, cb:b4; D2 |
| (b) | `{adjoint:src}` | $S^\dagger$, $(XZ)^\dagger$, $H^\dagger$ | ad:b1âb3, b5; D3 |
| (c) | `basis:[{ket:'+'},{ket:'-'}]` | $Z$, $X$ in the x frame (Bâ AB) | cb:b2, b3, b5; D4 |
| (d) | `image` (real matrix) on `hilbert-plane` | $X|{+}z\rangle$, $Z|\psi\rangle$, $H|\psi\rangle$ | lm:b1âb4, mm:b1; D1 |

No new `matrix` field is needed. One check for the builder: a `product` of three sources (`prod(gate('H'), gate('X'),
gate('H'))`) resolving left to right, used at pr:b2, pr:b5 and D2 â the spec allows any-length `product`, and this
exercises three factors.

### 9.3 Widget gaps
- `matrix-builder` widget modes `compose` (two tables multiplied), `showDagger` (toggle the conjugate transpose) and
  `basis` (redraw in the x frame) â Â§3. If any slips, the stage beats carry the units; the widget reuses the stage's
  engine calls (`matmul`, `dagger`, `changeU`).

## 10. Media

### 10.1 Blender opener
None new for F3; the Part F opener (F1 Â§10.1) stands for the Part.

### 10.2 Motion Canvas film (each drawn number named from the engine; the manifest lists them for `films.test.ts`)
**`qc-f3-sandwich` "The same map in a new frame: $HZH = X$"** (opener of `f3-change-of-basis`, ~22 s)
1. The table of $Z = \operatorname{diag}(1, -1)$ in the z frame (`Z`).
2. The frame tilts $45Â°$ to the x frame ($U = H$, `changeU`); the grid lines rotate with it.
3. The entries flow to $UZU^\dagger = HZH = X$: the diagonal empties, the off-diagonal fills with 1s (`matmul`).
4. Overlay: a spin that reads "down along z" now reads "down along x" â one machine, two tables.
Manifest: `f3MatZ` (= $\operatorname{diag}(1,-1)$), `f3Ux`, `f3ZinX`, `f3HZH`.

### 10.3 Higgsfield decor (atmosphere only; no text, no numbers, no diagram; user approves credits)
- F3 moment (behind the chapter card): slow light over a brass gimbal or nested frames turning smoothly about one
  another â a wordless echo of one object seen from rotating frames. No ticks, no grid, no labels.

## 11. Hooks

### 11.1 Concept-map stations (`qc709/concepts.ts`, `QcConcept`)
| id | label | chapter Â· unit | needs | cross-course (448) |
|---|---|---|---|---|
| `qc-linear-operator` | Linear maps on states | F3 Â· `f3-linear-maps` | F2 `qc-ket` | twin of `l3-operators` |
| `qc-matrix-of-map` | A map as a table $A_{ij}$ | F3 Â· `f3-matrix-of-map` | `qc-linear-operator`, F2 `qc-orthonormal-basis` | twin of `l3-matrices` |
| `qc-matrix-product` | Composing maps; order matters | F3 Â· `f3-products` | `qc-matrix-of-map` | links `l3-matrices` |
| `qc-adjoint` | The adjoint; Hermitian and unitary | F3 Â· `f3-adjoint` | `qc-matrix-of-map`, F2 `qc-inner-product` | links `l4-hermitian`, `l5-unitary` |
| `qc-change-of-basis` | The same map in a new frame | F3 Â· `f3-change-of-basis` | `qc-adjoint`, F2 `qc-orthonormal-basis` | twin of `l5-change-basis` |

Cross-course edges use the `twins448?`/`links448?` fields (F1 Â§11.1). Forward edge `qc-adjoint` â F4 `qc-spectral`.

### 11.2 Arcade: one level per unit (formats of `arcade/games.ts`; `wrong` is a 0-based step index)
Label constant: `const F3x = (unit, label) => ({ lecture: 'F3', unit, label })`.
1. **`f3-linear-maps` Â· Spot the error Â· `qc-square-is-linear`** â "A linear rule?"
   - Steps: "Define $A(a, b) = (a^2, b^2)$." Â· "Check: $A$ sends sums to sums, so it is linear." Â· "Give it a matrix." Â· "Apply the matrix to any state."
   - `wrong: 1`. Why: doubling the input quadruples $A$; squaring fails homogeneity, so there is no matrix. `trains: F3x('f3-linear-maps', 'F3.1 Machines that respect addition')`.
2. **`f3-matrix-of-map` Â· Spot the error Â· `qc-rows-are-images`** â "Reading the table"
   - Steps: "The matrix of $X$ is $\begin{psmallmatrix}0&1\\1&0\end{psmallmatrix}$." Â· "Row 0 is $X|0\rangle$." Â· "So $X|0\rangle = (0, 1)$ from row 0." Â· "Read images off the rows."
   - `wrong: 1`. Why: the $k$th *column*, not row, is $A|e_k\rangle$ ($X|0\rangle = (0,1)$ is column 0); `f3MatX`.
3. **`f3-products` Â· Spot the error Â· `qc-order-free`** â "Order-free products"
   - Steps: "$X$ and $Z$ are both gates." Â· "So $XZ = ZX$." Â· "Multiplying gates is order-free." Â· "You can reorder a circuit freely."
   - `wrong: 1`. Why: $XZ = -ZX$ (`matmul`); matrix multiplication is not commutative.
4. **`f3-adjoint` Â· Spot the error Â· `qc-unitary-is-hermitian`** â "Mirror or inverse?"
   - Steps: "$S = \operatorname{diag}(1, i)$ is a gate, so it is unitary." Â· "Unitary means it equals its own mirror." Â· "So $S^\dagger = S$." Â· "Thus $S$ is Hermitian."
   - `wrong: 1`. Why: unitary means $S^\dagger = S^{-1}$, not $S^\dagger = S$; here $S^\dagger = \operatorname{diag}(1, -i) \ne S$ (`dagger`, `isHermitian`).
5. **`f3-change-of-basis` Â· Spot the error Â· `qc-map-changed`** â "Did the map change?"
   - Steps: "$Z = \operatorname{diag}(1, -1)$ in the z frame." Â· "In the x frame its table is $X$." Â· "So the map itself became a different map." Â· "Changing frames changes the physics."
   - `wrong: 2`. Why: only the table changed; $UZU^\dagger = X$ is the same operator seen differently â lengths, trace and determinant are unchanged (`changeU`).

## 12. Questions for the judge

**Q1. Change of basis is 709 HW1 P5 (shared with P-F2 Q1).** 709 Homework 1 Problem 5(dâe) builds the spin-1
change-of-basis matrix $U_{ij} = \langle\alpha'_i|\alpha_j\rangle$ and checks $U^\dagger U = I$. F3's
`f3-change-of-basis` owns this math. This plan uses only the spin-Â½ zâx change ($U = H$) in the app, never the spin-1
construction, and challenge `f3-cb-unitary` shows $U^\dagger U = I$ on $H$ (generic), with a full walkthrough.
*Ask:* is HW1 submitted (so full walkthroughs are allowed, as `qc709-remap.md` ruling 12 grants HW2)? *Recommendation:*
treat HW1 as submitted (first sheet, 2026-09-08; course at L7; HW2 submitted). If not, keep `f3-cb-unitary` hints-only.
Either way the spin-1 $S_x$ construction stays in the homework, and F3's ramp uses $H$.

**Q2. Hermitian â real eigenvalues stays out of F3.** `qc709-nc.md` ruling 1 makes "Hermitian â real eigenvalues" 448
L3 homework; the map plans the proof in F4 and Q3. F3's `f3-adjoint:b3` therefore only *states* that a Hermitian
operator has real eigenvalues and an orthonormal eigenbasis, cites the notes' p. 15 proof by page, and bridges forward to
F4; no derivation, no challenge. *Ask:* confirm F3 states-and-cites (no proof), as this plan does, and that F4 carries
the proof (with the 448-homework gate the ruling sets).

**Q3. Beats introducing two notation ids.** `f3-matrix-of-map:b1` introduces both `qc-matrix-of-map` and
`qc-outer-product` (you build the matrix of a map out of outer products in the same move). As in P-F2 Q3, `content.test.tsx`
checks one *beat* per gloss id, so `Beat.introduces: ['a','b']` is allowed. Separately, `qc-hermitian`/`qc-unitary`
(introduced in `f3-adjoint:b3`) carry **no** `GlossEntry.introduces` eyebrow, since they name a property, not a new space
or symbol. *Ask:* accept the paired notation beat and the property-terms-without-eyebrow treatment, or require a separate
beat per id / an eyebrow for Hermitian and unitary?

**Q4. `qc-identity-operator` / `qc-inverse-operator` as plain terms.** `f3-products:b4` names the identity and the
inverse but does not gloss them (Axler 3.79â3.80 define them in place; no later chapter needs a standalone gloss).
*Ask:* accept leaving them unglossed, or add two glossary entries? *Recommendation:* leave them as plain terms; a
gloss would duplicate the beat.

**Q5. 448 twin unit ids.** Â§0 and the glossary offer 448 twins (`l3-operators`, `l3-matrices`, `l4-hermitian`,
`l5-unitary`, `l5-change-basis`). I have not re-read 448's 709-side unit ids. *Ask:* confirm these are the right twin
ids, or supply the correct ones; the QâF3 bridges are added by the later wiring pass.
