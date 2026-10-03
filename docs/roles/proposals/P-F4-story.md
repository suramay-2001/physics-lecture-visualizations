# P-F4-story — F4 "Special directions" (eigenvalues, Hermitian and unitary operators, the spectral theorem)

Proposal only. Nothing under `app/` is modified. Format: `P-F1-story.md` (Foundations two-track style) extended with
the two standing gates of `P-Q8-story.md`: every derivation list, in both tracks, steps the stage through ≥ 2 distinct
views (`DerivStep.view`, `viewCaption`; W-709 #7), and every new space or notation gets exactly one notation beat
(`Beat.introduces`, `GlossEntry.introduces`; W-709 #8). Map entry: `P-709-map.md` §F4; rulings:
`decisions/qc709-foundations.md` (standalone Foundations, reversing the fold). Planned together with F5 and F6.

**Design (`decisions/qc709-foundations.md`).** F4 is a ground-up math chapter reached by bridges and the **canonical
owner** of eigenvalues, Hermitian/unitary operators and the spectral theorem. Prerequisites **F2** (vectors, inner
products) and **F3** (matrices, linear maps, the adjoint `†`, change of basis) are built in parallel; F4 bridges to
them by unit id (`<<f2-dot|…>>`, `<<f3-change|…>>`) and assumes their units exist. It does **not** re-teach them. The
Q chapters (Q3 especially) already apply this math to spin inline; F4 does not duplicate Q3's wording — it treats a
Hermitian matrix as an abstract table on ℂⁿ, and a later wiring pass adds Q→F bridges. Ground-up ≤ 25 words/sentence;
Formal ≤ 40; both tracks, every beat.

**Sources read** (copyrighted; paraphrased and cited).
- 709 notes pp. 14–16 (eigenvectors, the spectral form $A = \sum a_i|a_i\rangle\langle a_i|$, $f(A)$, commuting
  operators) — the overlap Q3 drew from; F4 owns it as pure linear algebra.
- Axler 4e (**printed = PDF − 14**): 5A p. 133 (5.5–5.8 eigenvalues, eigenvectors, the characteristic idea), 5D p. 163
  (5.27 the characteristic polynomial of a 2×2 operator), 5E p. 175 (diagonalizability), 7A pp. 228–235 (7.1, 7.5
  adjoints; 7.10–7.14 self-adjoint, real eigenvalues), 7B pp. 243–247 (7.22 self-adjoint ⇒ real; **7.29, 7.31** the
  complex/real spectral theorems), 7C p. 251 (7.43 positive operators), 7D pp. 258–260 (7.44–7.52 the square root),
  7E p. 270 (7.51 isometries/unitaries), 7F p. 285 (7.58 polar; the singular-value decomposition), 8C p. 319
  (generalized eigenvectors — Formal aside only).
- N&C (**printed = PDF − 28**): §2.2 pp. 70–72 (the spectral decomposition framing, Box 2.2, diagonalizable operators,
  the outer-product/eigen form an observable takes).
- What the Q chapters own (not re-cut): Q3 `q3-spectral` (eigenvalues, real λ, spectral form, $f(A)$), `q3-uncertainty`
  (commutators, simultaneous eigenvectors), `q3-spin-operators` (Pauli matrices); Q8 `q8-ball`, `q8-recipes`
  (positive operators, the eigen-recipe). F4 is the ground-up owner; those beats keep their spin framing.

**Evidence.** Every number below was computed twice: by an independent numpy/scipy route
(`scratchpad/f456plan-numpy.py`, block "F4": `np.linalg.eig`/`eigh`, `np.poly` for the characteristic polynomial,
closed-form rotation matrices) and by the app engine route it names (`eigh`, `eigen2`, `charPoly2`, `fromEigen`,
`funcHermitian`, `expmHermitian`, `simultaneousEigenbasis`, `decomposeHermitian`, `unitaryAction`, `detN`, `traceN`,
`isHermitian`, `isUnitary`). They agree to 6 decimals. Keys are `f4.*` in `F4.values.ts`.

**Conventions.**
- Beat id `<unit>:b<n>`. Phase tags: **[L]** the chapter's core ramp (an F chapter has no lecture; the `lecture`
  phase holds the Axler/N&C line, as in F1), **[B]** a second source adds, **[C]** clue. Order L → B → C.
- Every beat has **G** (Ground, ≤ 25 words/sentence) and **F** (Formal, ≤ 40). Captions "cap G"/"cap F". Stage, terms,
  claims, bridges shared by both tracks. All inline math is TeX inside `$…$`; no plan ids (D1, §5, b3) in learner text
  — cross-references read "Unit F4.3", "Chapter F3".
- **Stage shorthand** (each expands to exactly one `StageState`; a derivation `view` is always one state):

| Shorthand | Expands to | Needs |
|---|---|---|
| `mx(src, f)` | `{kind:'matrix', source:src, labels:'kets', values:'exact', ...f}` ('exact' falls back to decimals off its table) | matrix-v2 |
| `ops(a0, a, f)` | `{kind:'operator-space', op:{a0, a}, eigen:true, labels:'plain', shot:'O-STD', ...f}` (the L3 "plain" variant: 2×2 Hermitian, arrow = half the eigenvalue gap, gauge = the midpoint) | — |
| `opsM(M, f)` | `{kind:'operator-space', op:{matrix:M}, eigen:true, labels:'plain', shot:'O-STD', ...f}` (a raw 2×2 matrix, as Q3's `q3-spectral` used) | — |
| `bl(D, f)` | `{kind:'bloch', state:D, shot:'B-STD', ...f}` | — |
| `cp(f)` | `{kind:'complex-plane', circle:true, ...f}` (eigenvalues of a unitary on the unit circle; F1's kind) | — |
| `split(A / B)` | `{layout:'split', top:A, bottom:B}` | — |

| Matrix source | Expands to | Needs |
|---|---|---|
| `pa('X')`, `pa('ZZ')` | `{pauli:'X'}`; two letters: `{kron:[{pauli:'Z'},{pauli:'Z'}]}` | matrix-v2 |
| `gate('H')`, `gate('S')` | `{gate:{name:'H'}}` (a unitary) | v1 |
| `out(K)` | `{outer:[K]}` = $\|K\rangle\langle K\|$ (K an `AmpSource`: a dir `'+x'`, a ket, …) | v1 |
| `lin([c, A], …)` | `{lin:[{c, src:A}, …]}`, each `c` a FIXED exact token (±1, ±½, ±i, ±1/√2) or `{trig:'cos'\|'sin', angleDeg}` | matrix-v2 |
| `prod(A, B, …)` | `{product:[A, B, …]}` = A·B·… | matrix-v2 |
| `adj(A)` | `{adjoint:A}` = A† | matrix-v2 |
| field `spectrum:'bars'` | eigenvalue bars beside the matrix, **unclamped** (`cmat.eigh`; a negative λ is flagged below the zero line) | matrix-v2 |
| field `basis:[K₁,K₂,…]` | the operator in a new basis, B†AB (K's are `AmpSource` kets; B's columns are those kets) | matrix-v2 |

- **Running examples** (all have Bloch-direction eigenvectors, so they live on the matrix grid, operator space AND the
  Bloch sphere): $\sigma_x = $ `pa('X')` (eigenvalues ±1, eigenvectors $|{\pm}x\rangle$); $\sigma_z = $ `pa('Z')`
  (diagonal, ±1); $\tfrac12(X + Z) = $ `lin([1/2, pa('X')], [1/2, pa('Z')])` (eigenvalues $\pm1/\sqrt2$, eigenvectors
  the $\pm45^\circ$ states in the $x$–$z$ plane); the projector $P_{+x} = |{+}x\rangle\langle{+}x| = $ `out('+x')`
  (eigenvalues 1, 0); the quarter-turn $R = $ `opsM([['0','-1'],['1','0']])` (non-Hermitian, eigenvalues $\pm i$); the
  shear $N = $ `opsM([['2','1'],['0','2']])` (defective, eigenvalue 2 twice, one eigenvector); $Z\otimes Z = $ `pa('ZZ')`
  (4×4, eigenvalues ±1 each doubly degenerate — the n-dimensional case); the unitaries $H = $ `gate('H')`,
  $S = $ `gate('S')` (eigenvalues 1, $i$) and the rotation $e^{-i\sigma_z t}$.
- **Rosetta** (stated once, in `f4-eigen:b1` cap F): Axler writes $T^*$ for our adjoint $T^\dagger$ and $\langle u, v\rangle$
  for our $\langle v|u\rangle$ (conjugate-linear first slot, 709's C9); "self-adjoint" is our Hermitian; a scalar $\lambda$
  is an eigenvalue. The engine's `eigh` returns real eigenvalues **ascending** with orthonormal eigenvectors (first
  non-negligible component real ≥ 0); the matrix stage's `spectrum` bars draw them UNCLAMPED (negatives below the line).

## 0. Chapter map

F4 answers the map's question: **"Which arrows does a machine only stretch, and why do they matter so much?"** It stands
alone — a reader who has met F2 (vectors, inner products) and F3 (matrices, the adjoint, change of basis) can start here
— and is the bridge target for every later chapter that diagonalizes an observable or exponentiates a Hamiltonian.

| # | id | Title (≤ 8 words) | Driving question | Sources | bridges offered |
|---|---|---|---|---|---|
| 1 | `f4-eigen` | The arrows a machine only stretches | Which directions does a matrix leave in place, only scaling them, and how do we find the scales? | Axler 5A p. 133, 5D p. 163; notes p. 14 | `<<l3-eigen>>`, `<<f3-linear>>` |
| 2 | `f4-hermitian` | Tables equal to their own mirror | Why does a Hermitian table have real eigenvalues and eigenvectors at right angles? | Axler 7A pp. 228–235, 7B p. 243; notes p. 15 | `<<f3-change>>` (the adjoint), `<<l4-eigen>>` |
| 3 | `f4-spectral` | Building and reading a matrix by its directions | How does a Hermitian table split into its directions, and how do functions act on it? | Axler 7B pp. 246–247 (7.29, 7.31); N&C §2.2 Box 2.2 p. 72; notes p. 15 | `<<l5-operators>>` |
| 4 | `f4-unitary` | Machines that keep every length | What does a table that keeps all lengths look like, and why are its eigenvalues on the unit circle? | Axler 7E p. 270; notes p. 16 | `<<l6-generator>>`, `<<f1-euler>>` |
| 5 | `f4-commuting` | When two machines share directions | When can two tables be diagonalized at once, and what does that mean? | Axler 5E p. 175; notes p. 16 | `<<l7-compatible>>` |
| 6 | `f4-positive` | Tables with no negative stretch; square roots | Which tables never flip an arrow backwards, and how do we take a square root of a matrix? | Axler 7C p. 251, 7D pp. 258–260, 7F p. 285 | `<<f3-outer>>` |

Forward F bridges: `f4-spectral` → F6 (functions of $A\otimes B$); `f4-unitary` → later circuits (gates are unitary).

**Outcomes** (`Lecture.outcomes`, Ground wording):
- Find the arrows a matrix only stretches, and the stretch factors, from the characteristic equation.
- Say why a table equal to its own mirror has real stretches and right-angle directions.
- Rebuild a Hermitian table from its directions, read it in its own frame, and apply a function to it.
- Recognise a table that keeps every length, and say why its stretches sit on the unit circle.
- Decide when two tables can be diagonalized together, and name their shared directions.
- Tell a table with no backward stretch, and take its square root.

**Prerequisites** (concept ids): F2 `qc-inner-product`, `qc-orthonormal`, `qc-gram-schmidt`; F3 `qc-matrix-element`,
`qc-adjoint`, `qc-change-of-basis`, `qc-determinant`, `qc-outer-product`; F1 `qc-euler` (for the unit circle in F4.4).

**Openers and films.** The Part F opener plays before `f4-eigen`. Film `qc-f4-stretch-ring` (the 2×2 machine acting on a
ring of arrows, §10.2) is the `Unit.opener` of `f4-eigen`.

## 1. Story beats per unit

Stage kinds used: `operator-space` (every unit; the 2×2 Hermitian "plain" variant, arrow = half the eigenvalue gap),
`matrix` (every unit: entries, `spectrum:'bars'`, `basis`, `lin`), `bloch` (F4.3–4.5, a unitary as a rotation),
`complex-plane` (F4.4, eigenvalues on the unit circle). Every derivation's view kind is one its unit's beats show.

### Unit `f4-eigen` — The arrows a machine only stretches

**`f4-eigen:b1` [L] · notation beat, `introduces: ['qc-eigenvalue', 'qc-eigenvector']`** (Av = λv)
- **G:** "Chapter F3 saw a matrix move arrows. For some arrows it does something simple: it only stretches them, never turning them. An [[qc-eigenvector|eigenvector]] of $A$ is an arrow $A$ only scales, $A|a\rangle = \lambda|a\rangle$, and the scale $\lambda$ is its [[qc-eigenvalue|eigenvalue]]. The zero arrow does not count."
- **F:** "A nonzero $|a\rangle$ with $A|a\rangle = \lambda|a\rangle$, $\lambda \in \mathbb C$, is an [[qc-eigenvector|eigenvector]] of $A$ with [[qc-eigenvalue|eigenvalue]] $\lambda$ (Axler 5.5, p. 133). On $\tfrac12(X + Z)$ the arrow $|{+}n\rangle$ at $\theta = 45^\circ$ is only stretched, by $1/\sqrt2 = 0.707$."
- **Cap:** G "the arrow $A$ only stretches, never turns" · F "Rosetta: Axler writes $T^*$ for our $T^\dagger$, $\langle u, v\rangle$ for $\langle v|u\rangle$; a scalar $\lambda$ is an eigenvalue"
- **Stage:** `opsM([['1/2','1/2'],['1/2','-1/2']])` (the arrow is half the eigenvalue gap; eigenvectors drawn).
- **Claims:** `f4XZvals` — `eigh([[½,½],[½,−½]]).values` → (−0.7071, 0.7071) · `f4XZvecPlus` — the $\lambda = +0.707$ eigenvector — `eigh(…).vectors[1]` → $|{+}n\rangle$ at $(\theta,\varphi) = (45^\circ, 0)$ = (0.9239, 0.3827).

**`f4-eigen:b2` [L] · notation beat, `introduces: ['qc-characteristic-equation']`** (det(A − λI) = 0; D1)
- **G:** "To find the eigenvalues, ask when $A - \lambda I$ squashes some arrow to zero. That happens exactly when its determinant (Chapter F3) is zero: the [[qc-characteristic-equation|characteristic equation]] $\det(A - \lambda I) = 0$. For a 2×2 table it is the quadratic $\lambda^2 - (\mathrm{tr}\,A)\lambda + \det A = 0$."
- **F:** "$\lambda$ is an eigenvalue iff $A - \lambda I$ is not invertible, i.e. $\det(A - \lambda I) = 0$, the [[qc-characteristic-equation|characteristic polynomial]] (Axler 5.27, p. 163). For 2×2, $\lambda^2 - (\mathrm{tr}\,A)\lambda + \det A = 0$. For $\tfrac12(X + Z)$: $\mathrm{tr} = 0$, $\det = -\tfrac12$, so $\lambda^2 = \tfrac12$."
- **Cap:** G "$\lambda^2 - 0\cdot\lambda - \tfrac12 = 0$, so $\lambda = \pm0.707$" · F "$\lambda^2 - (\mathrm{tr}\,A)\lambda + \det A = 0$"
- **Stage:** `mx(lin([1/2, pa('X')], [1/2, pa('Z')]), {spectrum:'bars'})` (eigenvalue bars: one up, one down).
- **Derivation:** D1 (§2).
- **Claims:** `f4XZtr` — `traceN(…)` → 0 · `f4XZdet` — `detN(…)` → −0.5 · `f4XZpoly` — `charPoly2(…)` → (1, 0, −0.5) · `f4XZvals` → (−0.7071, 0.7071).

**`f4-eigen:b3` [L]** (reading the two directions)
- **G:** "The two eigenvalues $\pm0.707$ are the two stretches. Each has its own eigenvector: the $+0.707$ arrow points at $45^\circ$ in the $x$–$z$ plane, the $-0.707$ arrow at right angles to it. On the operator-space picture the arrow's length is half the gap, $0.707$, and its midpoint sits at $0$."
- **F:** "$\tfrac12(X + Z) = \tfrac1{\sqrt2}\,\mathbf n\cdot\boldsymbol\sigma$ with $\mathbf n = (1, 0, 1)/\sqrt2$, so its eigenvectors are $|{\pm}n\rangle$ and its eigenvalues $\pm1/\sqrt2$. In operator space the arrow is $\mathbf a = \tfrac12\mathbf n\cdot\ldots$; its length is half the eigenvalue gap and its direction is the $+$ eigenvector (Axler 5A)."
- **Cap:** G "two stretches $\pm0.707$, two directions at right angles" · F "$\mathbf n = (1, 0, 1)/\sqrt2$; eigenvalues $\pm1/\sqrt2$"
- **Stage:** `split( opsM([['1/2','1/2'],['1/2','-1/2']]) / bl({thetaDeg:45, phiDeg:0}) )` (the arrow on the sphere is the $+$ eigenvector).
- **Claims:** `f4XZvals` → (−0.7071, 0.7071) · `f4XZvecPlus` → (0.9239, 0.3827) · `f4XZgap` — the gap — `eigh(…).values[1] − values[0]` → 1.4142.

**`f4-eigen:b4` [B] · notation beat, `introduces: ['qc-degenerate']`** (a repeated stretch; the defective case)
- **G:** "A stretch can repeat. The table $Z \otimes Z$ (Chapter F6's language) stretches by $+1$ in two directions and $-1$ in two more: a repeated eigenvalue is [[qc-degenerate|degenerate]]. A degenerate value still has a whole plane of eigenvectors. The shear $\begin{pmatrix}2 & 1\\ 0 & 2\end{pmatrix}$ is different: $2$ repeats, but only one arrow survives."
- **F:** "A $\lambda$ whose eigenspace has dimension $> 1$ is [[qc-degenerate|degenerate]] (Axler 5A). $Z \otimes Z$ has eigenvalues $+1, +1, -1, -1$, each a 2-dimensional eigenspace. A defective matrix, like the shear with the single eigenvalue $2$ and one eigenvector $(1, 0)$, is **not** diagonalizable — a case the next unit's Hermitian tables never show."
- **Cap:** G "$+1$ twice, $-1$ twice: a degenerate table" · F "$Z\otimes Z$: eigenvalues $+1, +1, -1, -1$; the shear is defective"
- **Stage:** `split( mx(pa('ZZ'), {spectrum:'bars'}) / opsM([['2','1'],['0','2']]) )`.
- **Refs:** Axler 5A, p. 133 (eigenspaces); 5.27, p. 163.
- **Claims:** `f4ZZvals` — `eigh(pa('ZZ')).values` → (−1, −1, 1, 1) · `f4ShearEig` — `eigen2([[2,1],[0,2]])` → values (2, 2), `defective` true, one vector (1, 0).

**`f4-eigen:b5` [C]** (can a stretch be imaginary?)
- **Q G:** "The quarter-turn $R = \begin{pmatrix}0 & -1\\ 1 & 0\end{pmatrix}$ turns every real arrow by $90^\circ$. So no real arrow is only stretched. Does $R$ have any eigenvectors at all?"
- **Q F:** "The rotation $R$ (by $90^\circ$) fixes no real direction. Does it have eigenvalues over $\mathbb C$?"
- **Reveal G:** "Yes, but the eigenvalues are imaginary: $\pm i$. The characteristic equation is $\lambda^2 + 1 = 0$, which has no real root but two complex ones. The eigenvectors are complex arrows, $(1, \mp i)/\sqrt2$. A real turn hides complex stretch directions."
- **Reveal F:** "$\det(R - \lambda I) = \lambda^2 + 1 = 0$, so $\lambda = \pm i$ with eigenvectors $(1, \mp i)/\sqrt2$ (Chapter F1 built $i$ for exactly this). Over $\mathbb C$ every square matrix has an eigenvalue (the fundamental theorem of algebra); the next unit asks which matrices keep them real."
- **Reveal cap:** G/F "$R$: eigenvalues $\pm i$, not real"
- **Stage:** question `opsM([['0','-1'],['1','0']])`; reveal `cp({ points:[{re:0, im:1}, {re:0, im:-1}] })` (the two eigenvalues on the unit circle).
- **Claims:** `f4Rpoly` — `charPoly2(R)` → (1, 0, 1) · `f4Rvals` — `eigen2(R).values` → (0 + 1i, 0 − 1i).

### Unit `f4-hermitian` — Tables equal to their own mirror

**`f4-hermitian:b1` [L]** (the Hermitian table)
- **G:** "A table is [[qc-hermitian-matrix|Hermitian]] when it equals its own mirror: flip it across the diagonal and conjugate every entry (Chapter F1's mirror), and nothing changes, $A = A^\dagger$. The diagonal entries must then be real. $\sigma_x = \begin{pmatrix}0 & 1\\ 1 & 0\end{pmatrix}$ is Hermitian; so is $\tfrac12(X + Z)$."
- **F:** "$A$ is [[qc-hermitian-matrix|Hermitian]] (Axler: self-adjoint) when $A = A^\dagger$, i.e. $A_{ij} = A_{ji}^*$ (Axler 7.10, p. 233; the adjoint is Chapter F3's $\dagger$). Diagonal entries are real. Hermitian matrices are the real-valued observables of physics; this unit proves the two facts that make them so."
- **Cap:** G "$A = A^\dagger$: the table is its own mirror" · F "$A_{ij} = A_{ji}^*$; $\sigma_x = \sigma_x^\dagger$"
- **Stage:** `split( mx(pa('X')) / mx(adj(pa('X'))) )` (the table and its mirror coincide).
- **Claims:** `f4XHerm` — `isHermitian(pa('X'))` → true · `f4XeqAdj` — `matEq(pa('X'), dagger(pa('X')))` → true.
- **Terms:** `qc-adjoint` (F3).

**`f4-hermitian:b2` [L]** (real eigenvalues — the 2×2 picture; D2)
- **G:** "A Hermitian table always stretches by real amounts. For a 2×2 Hermitian $\begin{pmatrix}a & b\\ b^* & d\end{pmatrix}$ the characteristic equation's discriminant is $(a - d)^2 + 4|b|^2$, a sum of squares. It is never negative, so the two eigenvalues are always real."
- **F:** "For $\begin{pmatrix}a & b\\ b^* & d\end{pmatrix}$ ($a, d \in \mathbb R$), $\lambda = \tfrac{a+d}2 \pm \tfrac12\sqrt{(a-d)^2 + 4|b|^2}$. The discriminant is $\ge 0$, so $\lambda \in \mathbb R$ (Axler 7.13, p. 234, the general statement; D2). Contrast $R$, not Hermitian, with eigenvalues $\pm i$."
- **Cap:** G "the discriminant $(a-d)^2 + 4|b|^2 \ge 0$: real stretches" · F "$\lambda = \tfrac{a+d}2 \pm \tfrac12\sqrt{(a-d)^2 + 4|b|^2}$"
- **Stage:** `mx(pa('X'), {spectrum:'bars'})` (both bars on the real line, $+1$ up and $-1$ down).
- **Derivation:** D2 (§2).
- **Claims:** `f4Xvals` — `eigh(pa('X')).values` → (−1, 1) · `f4Rvals` → (±i) (the non-Hermitian contrast).

**`f4-hermitian:b3` [L]** (the general real-eigenvalue proof; D3a)
- **G:** "Here is why it works in any dimension. Sandwich $A$ between an eigenvector's bra and ket two ways. Letting $A$ act on the ket gives $\lambda\langle a|a\rangle$; using $A = A^\dagger$ and letting it act on the bra gives $\lambda^*\langle a|a\rangle$. Since $\langle a|a\rangle > 0$, $\lambda = \lambda^*$: $\lambda$ is real."
- **F:** "$\lambda\langle a|a\rangle = \langle a|A|a\rangle = \langle a|A^\dagger|a\rangle = \langle Aa|a\rangle = \langle a|Aa\rangle^* = \lambda^*\langle a|a\rangle$, and $\langle a|a\rangle > 0$, so $\lambda = \lambda^* \in \mathbb R$ (Axler 7.13; notes p. 15; D3a). This is the abstract form of the 2×2 discriminant above."
- **Cap:** G "$\lambda\langle a|a\rangle = \lambda^*\langle a|a\rangle$, so $\lambda$ is real" · F "$\langle a|A|a\rangle$ read two ways"
- **Stage:** `opsM([['1/2','1/2'],['1/2','-1/2']])` (the operator's real eigenvalue readout) then `mx(lin([1/2, pa('X')], [1/2, pa('Z')]), {spectrum:'bars'})`.
- **Derivation:** D3a (§2).
- **Claims:** `f4XZvals` → (−0.7071, 0.7071).

**`f4-hermitian:b4` [L]** (orthogonal eigenvectors; D3b)
- **G:** "Eigenvectors with different eigenvalues point at right angles. If $A|a_1\rangle = \lambda_1|a_1\rangle$ and $A|a_2\rangle = \lambda_2|a_2\rangle$ with $\lambda_1 \ne \lambda_2$, then $(\lambda_1 - \lambda_2)\langle a_2|a_1\rangle = 0$, so the overlap is zero. The $\pm0.707$ directions of $\tfrac12(X + Z)$ are perpendicular."
- **F:** "$(\lambda_2 - \lambda_1)\langle a_2|a_1\rangle = \langle a_2|A|a_1\rangle - \langle Aa_2|a_1\rangle = 0$ (both eigenvalues real, by b3), so $\langle a_2|a_1\rangle = 0$; a degenerate eigenspace is made orthonormal by Gram–Schmidt (Chapter F2). Hence a Hermitian operator has an orthonormal eigenbasis (Axler 7.22; notes p. 15; D3b)."
- **Cap:** G "the two directions are at right angles: overlap 0" · F "$\langle a_2|a_1\rangle = 0$ for $\lambda_1 \ne \lambda_2$"
- **Stage:** `split( bl({thetaDeg:45, phiDeg:0}) / bl({thetaDeg:135, phiDeg:0}) )` (the two eigenvectors, antipodal → orthogonal) then `mx(lin([1/2, pa('X')], [1/2, pa('Z')]), {basis:['+x','-x']})`.
- **Derivation:** D3b (§2).
- **Claims:** `f4XZorth` — `inner(vecPlus, vecMinus)` → 0 · `f4XZvecMinus` — the $\lambda = -0.707$ eigenvector → (−0.3827, 0.9239).
- **Bridge (G):** "<<l4-eigen|Spin Lab 4 finds the directions a spin operator only stretches>>."

**`f4-hermitian:b5` [C]** (a repeated eigenvalue)
- **Q G:** "$Z \otimes Z$ has the eigenvalue $+1$ twice. Are its two $+1$ arrows forced to be at right angles?"
- **Q F:** "For the degenerate eigenvalue $+1$ of $Z \otimes Z$, must a chosen pair of eigenvectors be orthogonal?"
- **Reveal G:** "Not automatically — any arrow in the whole $+1$ plane works, and two of them can sit at any angle. But we can always pick a right-angle pair with Gram–Schmidt. So a Hermitian table still has an orthonormal set of directions, degeneracy and all."
- **Reveal F:** "Within one eigenspace any basis is eigenvectors, so orthogonality is a choice, secured by Gram–Schmidt (Chapter F2). The spectral theorem (next unit) needs this: even with repeats, an orthonormal eigenbasis exists (Axler 7.29)."
- **Reveal cap:** G/F "$+1$ eigenspace: a plane; pick a right-angle pair"
- **Stage:** question `mx(pa('ZZ'), {spectrum:'bars'})`; reveal `mx(pa('ZZ'), {blocks:2, highlight:[[0,0],[3,3]]})`.
- **Claims:** `f4ZZvals` → (−1, −1, 1, 1) · `f4ZZeigRank` — the $+1$ eigenspace dimension — `schmidt/eigh count` → 2.

### Unit `f4-spectral` — Building and reading a matrix by its directions

**`f4-spectral:b1` [L] · notation beat, `introduces: ['qc-spectral-representation']`** (A = Σ λᵢ|aᵢ⟩⟨aᵢ|)
- **G:** "Now run it backwards. Take each eigenvalue, multiply by the projector onto its eigenvector, and add: $A = \sum_i \lambda_i|a_i\rangle\langle a_i|$, the [[qc-spectral-representation|spectral decomposition]]. For $\sigma_x$ it is $(+1)|{+}x\rangle\langle{+}x| + (-1)|{-}x\rangle\langle{-}x|$. The projectors are Chapter F3's outer products."
- **F:** "Every Hermitian $A$ equals $\sum_i \lambda_i|a_i\rangle\langle a_i|$ over an orthonormal eigenbasis, the [[qc-spectral-representation|spectral decomposition]] (Axler 7.29, p. 246, the spectral theorem; N&C §2.2 Box 2.2, p. 72; notes p. 15). The eigenvalue times its projector; $\sigma_x = |{+}x\rangle\langle{+}x| - |{-}x\rangle\langle{-}x|$."
- **Cap:** G "$\sigma_x = (+1)P_{+x} + (-1)P_{-x}$" · F "$A = \sum_i \lambda_i|a_i\rangle\langle a_i|$"
- **Stage:** `split( mx(lin([1, out('+x')], [-1, out('-x')])) / mx(pa('X')) )` (the sum rebuilds $\sigma_x$).
- **Claims:** `f4XspectralGap` — `maxDiff(fromEigen([1,−1],[+x,−x]), pa('X'))` → 0 · `f4Xvals` → (−1, 1).
- **Terms:** `qc-outer-product`, `qc-projector` (F3, Q3).

**`f4-spectral:b2` [L]** (diagonal in its own frame; D4a)
- **G:** "Change to the basis of eigenvectors (Chapter F3's change of basis). In that frame the table is diagonal, its eigenvalues down the diagonal and zeros elsewhere: $B^\dagger A B = \mathrm{diag}(\lambda_1, \lambda_2)$, where $B$'s columns are the eigenvectors. For $\sigma_x$ in the $x$-basis: $\mathrm{diag}(1, -1)$."
- **F:** "With $B = [\,|a_1\rangle\ |a_2\rangle\ \cdots]$ (eigenvectors as columns, unitary by b4), $B^\dagger A B = D = \mathrm{diag}(\lambda_i)$: $A$ is [[qc-diagonalize|diagonalized]] (Axler 7.29; Chapter F3's $A' = UAU^\dagger$ with $U = B^\dagger$). $\tfrac12(X + Z)$ in its own basis is $\mathrm{diag}(1/\sqrt2, -1/\sqrt2)$."
- **Cap:** G "$\sigma_x$ in the $x$-basis: $\mathrm{diag}(1, -1)$" · F "$B^\dagger A B = \mathrm{diag}(\lambda_i)$"
- **Stage:** `split( mx(pa('X')) / mx(pa('X'), {basis:['+x','-x']}) )` (the grid becomes diagonal).
- **Derivation:** D4a (§2).
- **Claims:** `f4XdiagX` — `mx(pa('X'), basis:[+x,−x])` grid → diag(1, −1) · `f4XZdiag` — $\tfrac12(X+Z)$ in its basis → diag(0.7071, −0.7071).
- **Bridge (G):** "<<l5-operators|changing coordinates makes the operator diagonal>>."

**`f4-spectral:b3` [L] · notation beat, `introduces: ['qc-function-of-operator']`** (f(A) acts on the eigenvalues; D4b)
- **G:** "A function of a table acts on its eigenvalues alone: $f(A) = \sum_i f(\lambda_i)|a_i\rangle\langle a_i|$, the [[qc-function-of-operator|function of an operator]]. Square $\sigma_x$ and every eigenvalue squares: $(\pm1)^2 = 1$, so $\sigma_x^2 = I$. The square root of $\tfrac12(I + X)$ keeps the same directions."
- **F:** "For $A = \sum_i \lambda_i|a_i\rangle\langle a_i|$, $A^n = \sum_i \lambda_i^n|a_i\rangle\langle a_i|$ and $f(A) = \sum_i f(\lambda_i)|a_i\rangle\langle a_i|$, the [[qc-function-of-operator|functional calculus]] (N&C Box 2.2, p. 72; D4b). $\sigma_x^2 = I$; $\exp(-iAt)$ and $\sqrt A$ are read off the same way (engine `funcHermitian`)."
- **Cap:** G "$\sigma_x^2 = I$: each $\pm1$ squares to $1$" · F "$f(A) = \sum_i f(\lambda_i)|a_i\rangle\langle a_i|$"
- **Stage:** `split( mx(prod(pa('X'), pa('X'))) / mx(lin([1, out('+x')], [1, out('-x')])) )` ($\sigma_x^2$ equals $I$).
- **Derivation:** D4b (§2).
- **Claims:** `f4XsqIsI` — `maxDiff(funcHermitian(X, a→a²), I2)` → 0 · `f4XZsqrtVals` — `eigh(funcHermitian(½(I+X), √)).values` → (0, 1) with eigenvectors $|{\pm}x\rangle$.

**`f4-spectral:b4` [B]** (the n-dimensional spectral theorem)
- **G:** "This works in any size, not just 2×2. A 4×4 Hermitian table like $Z \otimes Z$ still splits into its directions: $Z \otimes Z = P_{+} - P_{-}$, where $P_+$ projects onto its whole $+1$ plane and $P_-$ onto the $-1$ plane. The spectral recipe adds one term per distinct eigenvalue."
- **F:** "In dimension $n$, $A = \sum_\lambda \lambda\, P_\lambda$ with $P_\lambda$ the orthogonal projector onto the $\lambda$-eigenspace, $\sum_\lambda P_\lambda = I$, $P_\lambda P_\mu = \delta_{\lambda\mu}P_\lambda$ (Axler 7.29; N&C §2.2). $Z\otimes Z = P_+ - P_-$, each $P_\pm$ of rank 2."
- **Cap:** G "$Z \otimes Z = P_+ - P_-$: one term per distinct stretch" · F "$A = \sum_\lambda \lambda P_\lambda$, $\sum_\lambda P_\lambda = I$"
- **Stage:** `mx(pa('ZZ'), {spectrum:'bars', blocks:2})`.
- **Refs:** Axler 7.29, p. 246; N&C §2.2, p. 72.
- **Claims:** `f4ZZvals` → (−1, −1, 1, 1) · `f4ZZproj` — `maxDiff(projectorOnto(+1 space) − projectorOnto(−1 space), pa('ZZ'))` → 0.

**`f4-spectral:b5` [C]** (does squaring forget the sign?)
- **Q G:** "$\sigma_x$ has eigenvalues $+1$ and $-1$. Squaring gives $\sigma_x^2 = I$, whose eigenvalues are both $+1$. If we only knew $\sigma_x^2$, could we get $\sigma_x$ back?"
- **Q F:** "From $A^2 = I$ alone, is $A$ determined? What does the functional calculus say about $\sqrt{\cdot}$?"
- **Reveal G:** "No. Squaring throws away the sign of each eigenvalue, so many tables share the same square. A square root must choose a sign for each direction. $I$ has square roots $\sigma_x$, $\sigma_z$, $I$ itself, and more."
- **Reveal F:** "$A \mapsto A^2$ is many-to-one: any $A = \sum_i (\pm1)|a_i\rangle\langle a_i|$ squares to $I$. A function is single-valued only once a branch is fixed per eigenvalue; the **positive** square root (every $\sqrt{\lambda_i} \ge 0$) needs $A \ge 0$ (Unit F4.6)."
- **Reveal cap:** G/F "$\sigma_x^2 = \sigma_z^2 = I$: the square forgets the sign"
- **Stage:** question `mx(prod(pa('X'), pa('X')))`; reveal `split( mx(pa('X'), {spectrum:'bars'}) / mx(pa('Z'), {spectrum:'bars'}) )`.
- **Claims:** `f4XsqIsI` → 0 · `f4ZsqIsI` — `maxDiff(funcHermitian(Z, a→a²), I2)` → 0.

### Unit `f4-unitary` — Machines that keep every length

**`f4-unitary:b1` [L] · notation beat, `introduces: ['qc-unitary']`** (U†U = I)
- **G:** "A [[qc-unitary|unitary]] table keeps every length: $|U v| = |v|$ for every arrow. In entries this means its columns are perpendicular unit arrows, $U^\dagger U = I$. The Hadamard table $H = \tfrac1{\sqrt2}\begin{pmatrix}1 & 1\\ 1 & -1\end{pmatrix}$ is unitary; so is the quarter-turn $R$."
- **F:** "$U$ is [[qc-unitary|unitary]] (Axler: an isometry) when $U^\dagger U = U U^\dagger = I$, equivalently $\langle Uv|Uw\rangle = \langle v|w\rangle$ for all $v, w$ (Axler 7.51, p. 270; Chapter F3's $\dagger$). Its columns are an orthonormal basis. Unitaries are the length- and angle-preserving maps — the quantum gates of later chapters."
- **Cap:** G "$U^\dagger U = I$: columns are perpendicular unit arrows" · F "$\langle Uv|Uw\rangle = \langle v|w\rangle$; $H^\dagger H = I$"
- **Stage:** `split( mx(gate('H')) / mx(prod(adj(gate('H')), gate('H'))) )` ($H^\dagger H = I$).
- **Claims:** `f4Hunitary` — `isUnitary(gate('H'))` → true · `f4HdH` — `maxDiff(matmul(dagger(H), H), I2)` → 0.

**`f4-unitary:b2` [L]** (lengths are kept; D5)
- **G:** "Why do lengths stay? Because $|Uv|^2 = \langle Uv|Uv\rangle = \langle v|U^\dagger U|v\rangle = \langle v|v\rangle = |v|^2$. The middle collapses because $U^\dagger U = I$. So a unitary turns and reflects the whole space but never stretches it: a rigid motion."
- **F:** "$\|Uv\|^2 = \langle v|U^\dagger U|v\rangle = \langle v|v\rangle = \|v\|^2$, so $U$ is an isometry (Axler 7.51). Conversely an isometry is unitary. $H$ sends $|0\rangle \to |{+}x\rangle$, $|1\rangle \to |{-}x\rangle$: an orthonormal basis to an orthonormal basis, each of length 1."
- **Cap:** G "$|Uv| = |v|$: no stretch, only turn" · F "$\|Uv\|^2 = \langle v|U^\dagger U|v\rangle = \|v\|^2$"
- **Stage:** `split( bl('0') / bl('+x') )` ($H$ carries $|0\rangle$ to $|{+}x\rangle$, same length) then `mx(gate('H'))`.
- **Derivation:** D5 (§2).
- **Claims:** `f4HonZero` — `apply(H, |0⟩)` → |+x⟩ = (0.7071, 0.7071) · `f4HpreservesNorm` — `norm(apply(H, (0.6, 0.8i)))` → 1.

**`f4-unitary:b3` [L] · notation beat, `introduces: ['qc-unitary-eigenvalue']`** (eigenvalues on the unit circle)
- **G:** "Since a unitary keeps lengths, every eigenvalue has size 1: $|U a| = |\lambda||a| = |a|$ forces $|\lambda| = 1$. So the eigenvalues sit on the unit circle (Chapter F1), as $e^{i\theta}$. The phase gate $S = \mathrm{diag}(1, i)$ has eigenvalues $1$ and $i$."
- **F:** "If $U|a\rangle = \lambda|a\rangle$ and $U$ is unitary, $\|a\| = \|Ua\| = |\lambda|\,\|a\|$, so $|\lambda| = 1$: the [[qc-unitary-eigenvalue|eigenvalues lie on the unit circle]], $\lambda = e^{i\theta}$ (Axler 7E). $S = \mathrm{diag}(1, i)$; $H$ has $\pm1$; $e^{-i\sigma_z t}$ has $e^{\mp it}$."
- **Cap:** G "every eigenvalue has size 1: on the unit circle" · F "$|\lambda| = 1$, $\lambda = e^{i\theta}$"
- **Stage:** `split( mx(gate('S')) / cp({ points:[{r:1, phiDeg:0}, {r:1, phiDeg:90}] }) )` (eigenvalues $1$ and $i$ on the circle).
- **Claims:** `f4Svals` — `eigen2(gate('S')).values` → (1, i) · `f4RzVals` — `eigenvalues of e^{−iσ_z·π/4}` → (0.7071 − 0.7071i, 0.7071 + 0.7071i), both of size 1.

**`f4-unitary:b4` [B]** (a unitary is a rotation; e^{−iHt})
- **G:** "A qubit unitary turns the Bloch sphere. Every $U = e^{-i\theta\,\mathbf n\cdot\boldsymbol\sigma/2}$ rotates the sphere by $\theta$ about the axis $\mathbf n$. Its eigenvectors are $|{\pm}n\rangle$, the poles of the turn, and its eigenvalues are $e^{\mp i\theta/2}$. Running a Hermitian $H$ as $e^{-iHt}$ makes time a rotation."
- **F:** "$e^{-iHt} = \sum_i e^{-i\lambda_i t}|a_i\rangle\langle a_i|$ (the functional calculus, F4.3): a unitary with the **same** eigenvectors as $H$ and eigenvalues $e^{-i\lambda_i t}$ on the unit circle. For $H = \tfrac12\mathbf n\cdot\boldsymbol\sigma$ it is the Bloch rotation about $\mathbf n$ by $t$ (Axler 7E; engine `expmHermitian`, `unitaryAction`)."
- **Cap:** G "$e^{-i\sigma_z t}$: a turn about the $z$ axis" · F "$e^{-iHt} = \sum_i e^{-i\lambda_i t}|a_i\rangle\langle a_i|$"
- **Stage:** `bl('+x', {rotate:{axis:'z', angleDeg:{from:0, to:90}}, trail:true})` (a unitary carries $|{+}x\rangle$ round $z$).
- **Refs:** Axler 7E, p. 270; notes p. 16.
- **Claims:** `f4RzAction` — `unitaryAction(½σ_z, π/2).angle` → 1.5708 (a $90^\circ$ turn about $z$) · `f4RzEig` → (e^{−iπ/4}, e^{iπ/4}).
- **Bridge (G):** "<<l6-generator|a spin generates its own rotation>>."

**`f4-unitary:b5` [C]** (Hermitian and unitary at once)
- **Q G:** "$\sigma_x$ is Hermitian ($A = A^\dagger$). It is also unitary ($A^\dagger A = I$). Which eigenvalues can a table with both properties have?"
- **Q F:** "If $A = A^\dagger$ and $A^\dagger A = I$, what are $A$'s eigenvalues?"
- **Reveal G:** "Only $+1$ and $-1$. Hermitian forces the eigenvalues real; unitary forces them size 1. The only real numbers of size 1 are $\pm1$. So $A^2 = I$, and $\sigma_x$, $\sigma_z$, the Pauli matrices are all of this kind."
- **Reveal F:** "Real (Hermitian) and on the unit circle (unitary) means $\lambda \in \{+1, -1\}$, so $A^2 = I$: $A$ is a reflection. The Pauli matrices are the Hermitian **and** unitary $2\times2$ tables (Axler 7A, 7E)."
- **Reveal cap:** G/F "Hermitian + unitary $\Rightarrow$ eigenvalues $\pm1$, $A^2 = I$"
- **Stage:** question `mx(pa('X'), {spectrum:'bars'})`; reveal `mx(prod(pa('X'), pa('X')))` ($\sigma_x^2 = I$).
- **Claims:** `f4XHermUnit` — `isHermitian(X)`, `isUnitary(X)` → true, true · `f4XsqIsI` → 0.

### Unit `f4-commuting` — When two machines share directions

**`f4-commuting:b1` [L] · notation beat, `introduces: ['qc-simultaneous-eigenbasis']`** (a shared eigenbasis)
- **G:** "Two Hermitian tables can sometimes be diagonalized at once: they share a set of eigenvectors, a [[qc-simultaneous-eigenbasis|simultaneous eigenbasis]]. Then each shared arrow is an eigenvector of both. $\sigma_z$ and the projector $P_{+z} = \mathrm{diag}(1, 0)$ share the $z$ directions."
- **F:** "$A$ and $B$ have a [[qc-simultaneous-eigenbasis|simultaneous eigenbasis]] — one orthonormal basis of common eigenvectors — iff they commute, $[A, B] = AB - BA = 0$ (Axler 5E, p. 175; notes p. 16). $\sigma_z$ and $P_{+z}$ are both diagonal in the $z$ basis."
- **Cap:** G "$\sigma_z$ and $P_{+z}$: the same two directions" · F "a common orthonormal eigenbasis"
- **Stage:** `split( mx(pa('Z'), {spectrum:'bars'}) / mx(out('0'), {spectrum:'bars'}) )` (both diagonal in the same basis).
- **Claims:** `f4ZPsimul` — `simultaneousEigenbasis(Z, out('0'))` returns a common basis ≠ null · `f4ZPvals` — its `(valuesA, valuesB)` → $(+1, 1), (-1, 0)$.
- **Terms:** `qc-commutator` (Q3).

**`f4-commuting:b2` [L]** (commuting is the test; D6)
- **G:** "The test is whether order matters. If $AB = BA$, the tables commute, and a shared eigenbasis exists. If $AB \ne BA$, no shared basis can exist. $\sigma_x$ and $\sigma_z$ fail: $\sigma_x\sigma_z \ne \sigma_z\sigma_x$, so they have no common directions."
- **F:** "If $[A, B] = 0$ and $A$'s eigenvalues are distinct, then $0 = \langle a_i|[A,B]|a_j\rangle = (\lambda_i - \lambda_j)\langle a_i|B|a_j\rangle$ forces $B$ diagonal in $A$'s eigenbasis (notes p. 16; D6). Diagonal tables commute, so the condition is exact (Axler 5E). $[\sigma_x, \sigma_z] = -2i\sigma_y \ne 0$."
- **Cap:** G "$\sigma_x\sigma_z \ne \sigma_z\sigma_x$: no shared directions" · F "$[A, B] = 0 \Leftrightarrow$ simultaneously diagonalizable"
- **Stage:** `split( mx(prod(pa('X'), pa('Z'))) / mx(prod(pa('Z'), pa('X'))) )` (the two products differ).
- **Derivation:** D6 (§2).
- **Claims:** `f4XZcomm` — `maxAbs(commutator(X, Z))` → 2 (non-zero) · `f4XZnoSimul` — `simultaneousEigenbasis(X, Z)` → null.
- **Bridge (G):** "<<l7-compatible|measurements that share a basis commute>>."

**`f4-commuting:b3` [C]** (the identity commutes with everything)
- **Q G:** "The identity $I$ commutes with every table. Does that mean $I$ shares a special set of directions with each one?"
- **Q F:** "$[I, A] = 0$ for all $A$. What is $I$'s eigenbasis, and why does it never conflict?"
- **Reveal G:** "$I$ stretches every arrow by $1$, so **every** arrow is its eigenvector. It has no directions of its own to insist on, so it fits any table's eigenbasis. A degenerate table, with one eigenvalue everywhere, is this flexible too."
- **Reveal F:** "$I = 1\cdot I$ has the single eigenvalue $1$ with the whole space as its eigenspace, so any orthonormal basis diagonalizes it. A fully degenerate operator (one eigenvalue) commutes with all; distinct eigenvalues are what pin a basis down (Axler 5E)."
- **Reveal cap:** G/F "$I$: every arrow is an eigenvector"
- **Stage:** question `mx(lin([1, out('+x')], [1, out('-x')]))` ($I$ as a sum of projectors) ; reveal `mx(lin([1, out('0')], [1, out('1')]))` ($I$ again, a different basis).
- **Claims:** `f4Icomm` — `maxAbs(commutator(I2, X))` → 0 · `f4Ibasis` — `maxDiff(fromEigen([1,1],[+x,−x]), I2)` → 0.

### Unit `f4-positive` — Tables with no negative stretch; square roots

**`f4-positive:b1` [L] · notation beat, `introduces: ['qc-positive-operator']`** (A ≥ 0)
- **G:** "A Hermitian table is [[qc-positive-operator|positive]] when it never stretches an arrow backwards: $\langle v|A|v\rangle \ge 0$ for every arrow. That happens exactly when no eigenvalue is negative. The projector $P_{+x}$, with eigenvalues $1$ and $0$, is positive; $\sigma_z$, with a $-1$, is not."
- **F:** "$A \ge 0$ (a [[qc-positive-operator|positive operator]]) iff $A = A^\dagger$ and $\langle v|A|v\rangle \ge 0$ for all $v$, iff its spectrum is $\ge 0$ (Axler 7.43, p. 251). $P_{+x} \ge 0$ (eigenvalues 1, 0); $\sigma_z$ has $-1$, so $\sigma_z \not\ge 0$. Every $A^\dagger A$ is positive."
- **Cap:** G "$P_{+x}$: eigenvalues $1$ and $0$, none negative" · F "$A \ge 0 \Leftrightarrow$ spectrum $\ge 0$"
- **Stage:** `split( mx(out('+x'), {spectrum:'bars'}) / mx(pa('Z'), {spectrum:'bars'}) )` (the projector's bars sit at $1, 0$; $\sigma_z$ shows a bar below the line).
- **Claims:** `f4ProjVals` — `eigh(out('+x')).values` → (0, 1) · `f4ZhasNeg` — `eigh(pa('Z')).values[0]` → −1.
- **Terms:** `qc-outer-product` (F3).

**`f4-positive:b2` [L]** (the square root; D4b reused)
- **G:** "A positive table has a positive square root. Take the positive square root of each eigenvalue, keep the same directions, and add: $\sqrt A = \sum_i \sqrt{\lambda_i}|a_i\rangle\langle a_i|$. Its square is $A$. The square root of $\tfrac12(I + X)$ has eigenvalues $1$ and $0$."
- **F:** "For $A \ge 0$, $\sqrt A = \sum_i \sqrt{\lambda_i}|a_i\rangle\langle a_i| \ge 0$ is the unique positive operator with $(\sqrt A)^2 = A$ (Axler 7.44–7.52, pp. 258–260; engine `sqrtPSD`/`funcHermitian`). It needs $\lambda_i \ge 0$, which is why the branch is fixed here and not in F4.3."
- **Cap:** G "$\sqrt A$: the square root of each stretch, same directions" · F "$\sqrt A = \sum_i \sqrt{\lambda_i}|a_i\rangle\langle a_i|$"
- **Stage:** `split( mx(lin([1/2, pa('I')], [1/2, pa('X')]), {spectrum:'bars'}) / mx(lin([1/2, pa('I')], [1/2, pa('X')])) )` (the projector $\tfrac12(I+X) = P_{+x}$ and its bars).
- **Derivation:** D4b (§2, the $f = \sqrt{\cdot}$ case).
- **Claims:** `f4HalfIXisProj` — `maxDiff(½(I+X), out('+x'))` → 0 · `f4SqrtProj` — `maxDiff(sqrtPSD(out('+x')), out('+x'))` → 0 (a projector is its own square root).

**`f4-positive:b3` [B]** (SVD and polar — any matrix as stretch then turn; Formal-forward)
- **G:** "Even a table that is not Hermitian can be split. Any matrix is a rotation times a positive stretch: $A = U P$ with $U$ unitary and $P = \sqrt{A^\dagger A} \ge 0$, the polar form. The stretch amounts are the singular values. The shear $\begin{pmatrix}2 & 1\\ 0 & 2\end{pmatrix}$ has singular values $2.56$ and $1.56$."
- **F:** "The singular-value decomposition $A = U\,\Sigma\,V^\dagger$ ($\Sigma \ge 0$ diagonal) and the polar form $A = U|A|$, $|A| = \sqrt{A^\dagger A}$, hold for every matrix (Axler 7.58, p. 285; engine `svd`, `polar`). The shear's singular values are $2.56, 1.56$ — its true stretch factors, unlike its repeated eigenvalue $2$."
- **Cap:** G "$A = U P$: a turn times a positive stretch" · F "$A = U\Sigma V^\dagger$; shear $\Sigma = (2.56, 1.56)$"
- **Stage:** `split( opsM([['2','1'],['0','2']]) / mx(adj(... )) )` — Formal aside; see §9.2 note (operator-space carries the shear, singular values in the caption).
- **Refs:** Axler 7.58, p. 285; 7.44–7.52.
- **Claims:** `f4ShearSVals` — `svd([[2,1],[0,2]]).s` → (2.5616, 1.5616) · `f4ShearEig` → (2, 2) (the contrast).

**`f4-positive:b4` [C]** (positive but not a projector)
- **Q G:** "A projector squares to itself, $P^2 = P$. The table $\tfrac12(I + X)$ is a projector. Is every positive table a projector?"
- **Q F:** "Is $A \ge 0$ enough to make $A^2 = A$?"
- **Reveal G:** "No. A projector's eigenvalues are only $0$ and $1$. A positive table can stretch by any amount $\ge 0$, like $3$ or $0.7$. $\tfrac12(X + Z) + I$ is positive (eigenvalues $1.71$ and $0.29$) but squares to something else."
- **Reveal F:** "$A^2 = A \Leftrightarrow$ eigenvalues in $\{0, 1\}$ — a projector. $A \ge 0$ only needs them $\ge 0$. $I + \tfrac12(X + Z)$ has eigenvalues $1 \pm 1/\sqrt2 = 1.707, 0.293 > 0$, so it is positive but not idempotent."
- **Reveal cap:** G/F "positive: eigenvalues $\ge 0$; projector: eigenvalues $0$ or $1$"
- **Stage:** question `mx(lin([1/2, pa('I')], [1/2, pa('X')]), {spectrum:'bars'})`; reveal `mx(lin([1, pa('I')], [1/2, pa('X')], [1/2, pa('Z')]), {spectrum:'bars'})` (bars at $1.71, 0.29$).
- **Claims:** `f4PosNotProj` — `eigh(I + ½(X+Z)).values` → (0.2929, 1.7071) · `f4ProjIdem` — `maxDiff(prod(out('+x'),out('+x')), out('+x'))` → 0.

**Beat count:** 5 + 5 + 5 + 5 + 3 + 4 = **27 beats**, 6 of them clues with reveals. Phase mix: 18 [L] · 3 [B] · 6 [C];
within every unit the order is L → B → C.

## 2. Derivations

Each step is `tex` — `why` — **view** (the shorthand above) — *viewCaption*. A step without a view inherits the previous
one in its list. Every list has ≥ 2 distinct views; every view's kind is one the unit's beats use. The last `tex` of each
list ends on the result.

**D1 · `f4-eigen:b2` · result `\lambda^2 - (\mathrm{tr}\,A)\lambda + \det A = 0`** (Axler 5.27, p. 163)
- Ground (3 views):
  1. `A|a\rangle = \lambda|a\rangle \Rightarrow (A - \lambda I)|a\rangle = 0` — An eigenvector is squashed to zero by $A - \lambda I$. **view** `opsM([['1/2','1/2'],['1/2','-1/2']])` · *the operator $\tfrac12(X+Z)$*
  2. `(A - \lambda I)\text{ squashes a nonzero arrow} \Leftrightarrow \det(A - \lambda I) = 0` — A table kills an arrow only when its determinant (Chapter F3) is zero.
  3. `\det\begin{pmatrix}a - \lambda & b\\ c & d - \lambda\end{pmatrix} = (a-\lambda)(d-\lambda) - bc` — Write out the 2×2 determinant.
  4. `= \lambda^2 - (a + d)\lambda + (ad - bc)` — Multiply out; $a + d = \mathrm{tr}\,A$, $ad - bc = \det A$. **view** `mx(lin([1/2, pa('X')], [1/2, pa('Z')]), {spectrum:'bars'})` · *the two roots as bars, $\pm0.707$*
  5. `\lambda^2 - (\mathrm{tr}\,A)\lambda + \det A = 0` — So the eigenvalues solve this quadratic.
- Formal (2 views):
  1. `\det(A - \lambda I) = 0` — $A - \lambda I$ singular (Axler 5.27). **view** `opsM([['1/2','1/2'],['1/2','-1/2']])`
  2. `\lambda^2 - (\mathrm{tr}\,A)\lambda + \det A = 0` — the $2\times2$ characteristic polynomial. **view** `mx(lin([1/2, pa('X')], [1/2, pa('Z')]), {spectrum:'bars'})`
- Check: `f4XZtr`, `f4XZdet`, `f4XZpoly`, `f4XZvals`.

**D2 · `f4-hermitian:b2` · result `\lambda = \tfrac{a+d}2 \pm \tfrac12\sqrt{(a-d)^2 + 4|b|^2} \in \mathbb R`** (the 2×2 Hermitian case; D1 specialised)
- Ground (2 views):
  1. `A = \begin{pmatrix}a & b\\ b^* & d\end{pmatrix},\ a, d \in \mathbb R` — A Hermitian 2×2: real diagonal, mirror corners. **view** `opsM([['0','1'],['1','0']])` · *$\sigma_x$: $a = d = 0$, $b = 1$*
  2. `\lambda = \tfrac{a+d}2 \pm \tfrac12\sqrt{(a-d)^2 + 4|b|^2}` — The quadratic formula on D1's polynomial ($\det A = ad - |b|^2$).
  3. `(a-d)^2 + 4|b|^2 \ge 0` — A sum of squares is never negative, so the root is real.
  4. `\lambda \in \mathbb R` — Both eigenvalues are real. **view** `mx(pa('X'), {spectrum:'bars'})` · *bars at $+1$ and $-1$, both real*
- Formal (2 views):
  1. `\lambda = \tfrac{a+d}2 \pm \tfrac12\sqrt{(a-d)^2 + 4|b|^2}`, discriminant $\ge 0$ — Hermiticity makes $b\,b^* = |b|^2 \ge 0$. **view** `opsM([['0','1'],['1','0']])`
  2. `\lambda \in \mathbb R` — real for every Hermitian 2×2. **view** `mx(pa('X'), {spectrum:'bars'})`
- Check: `f4Xvals`, `f4XZvals`; contrast `f4Rvals` (±i).

**D3a · `f4-hermitian:b3` · result `\lambda = \lambda^*`, a real eigenvalue (any dimension)** (Axler 7.13; notes p. 15)
- Ground (3 views):
  1. `A|a\rangle = \lambda|a\rangle,\quad A = A^\dagger` — An eigenvector of a Hermitian table. **view** `opsM([['1/2','1/2'],['1/2','-1/2']])` · *the operator*
  2. `\langle a|A|a\rangle = \lambda\langle a|a\rangle` — Let $A$ act on the ket; $\lambda$ comes out.
  3. `\langle a|A|a\rangle = \langle a|A^\dagger|a\rangle = \langle Aa|a\rangle` — $A = A^\dagger$, then the adjoint moves $A$ into the bra (Chapter F3).
  4. `\langle Aa|a\rangle = \langle a|Aa\rangle^* = \lambda^*\langle a|a\rangle` — Swapping the two sides conjugates (Chapter F2).
  5. `\lambda\langle a|a\rangle = \lambda^*\langle a|a\rangle \Rightarrow \lambda = \lambda^*` — $\langle a|a\rangle > 0$, so divide; $\lambda$ is real. **view** `mx(lin([1/2, pa('X')], [1/2, pa('Z')]), {spectrum:'bars'})` · *the real bars $\pm0.707$*
- Formal (2 views):
  1. `\lambda\langle a|a\rangle = \langle a|A^\dagger|a\rangle = \langle Aa|a\rangle = \lambda^*\langle a|a\rangle` — $A = A^\dagger$ and conjugate symmetry. **view** `opsM([['1/2','1/2'],['1/2','-1/2']])`
  2. `\lambda = \lambda^*` — $\langle a|a\rangle > 0$. **view** `mx(lin([1/2, pa('X')], [1/2, pa('Z')]), {spectrum:'bars'})`
- Check: `f4XZvals` (real); `f4Rvals` (non-Hermitian, ±i).

**D3b · `f4-hermitian:b4` · result `\langle a_2|a_1\rangle = 0` for `\lambda_1 \ne \lambda_2`** (Axler 7.22; notes p. 15)
- Ground (2 views):
  1. `A|a_1\rangle = \lambda_1|a_1\rangle,\ A|a_2\rangle = \lambda_2|a_2\rangle,\ \lambda_1 \ne \lambda_2` — Two eigenvectors, different stretches. **view** `bl({thetaDeg:45, phiDeg:0})` · *the $+0.707$ direction*
  2. `\langle a_2|A|a_1\rangle = \lambda_1\langle a_2|a_1\rangle` — $A$ on the ket.
  3. `\langle a_2|A|a_1\rangle = \langle Aa_2|a_1\rangle = \lambda_2^*\langle a_2|a_1\rangle = \lambda_2\langle a_2|a_1\rangle` — $A = A^\dagger$; $\lambda_2$ real (D3a).
  4. `(\lambda_1 - \lambda_2)\langle a_2|a_1\rangle = 0 \Rightarrow \langle a_2|a_1\rangle = 0` — The eigenvalues differ, so the overlap is zero. **view** `split( bl({thetaDeg:45, phiDeg:0}) / bl({thetaDeg:135, phiDeg:0}) )` · *antipodal arrows: orthogonal states*
- Formal (2 views):
  1. `(\lambda_1 - \lambda_2)\langle a_2|a_1\rangle = \langle a_2|A|a_1\rangle - \langle Aa_2|a_1\rangle = 0` — self-adjointness, $\lambda_2$ real. **view** `mx(lin([1/2, pa('X')], [1/2, pa('Z')]), {basis:['+x','-x']})`
  2. `\langle a_2|a_1\rangle = 0` — a degenerate space is made orthonormal by Gram–Schmidt (Chapter F2). **view** `split( bl({thetaDeg:45, phiDeg:0}) / bl({thetaDeg:135, phiDeg:0}) )`
- Check: `f4XZorth`.

**D4a · `f4-spectral:b2` · result `B^\dagger A B = \mathrm{diag}(\lambda_i)`** (Axler 7.29; Chapter F3's change of basis)
- Ground (3 views):
  1. `A = \sum_i \lambda_i|a_i\rangle\langle a_i|` — The spectral sum (b1). **view** `mx(lin([1, out('+x')], [-1, out('-x')]))` · *$\sigma_x$ rebuilt*
  2. `B = [\,|a_1\rangle\ |a_2\rangle\,]` — Put the eigenvectors in as columns; $B$ is unitary (orthonormal, b4).
  3. `(B^\dagger A B)_{ij} = \langle a_i|A|a_j\rangle = \lambda_j\delta_{ij}` — Each entry is $A$ between two eigenvectors.
  4. `B^\dagger A B = \mathrm{diag}(\lambda_1, \lambda_2)` — So the table is diagonal in its own basis. **view** `split( mx(pa('X')) / mx(pa('X'), {basis:['+x','-x']}) )` · *grid $\to$ $\mathrm{diag}(1, -1)$*
- Formal (2 views):
  1. `B^\dagger A B = D,\ D = \mathrm{diag}(\lambda_i)` — $B$ unitary, columns the eigenbasis (Axler 7.29). **view** `mx(pa('X'))`
  2. `B^\dagger A B = \mathrm{diag}(\lambda_i)` — Chapter F3's $A' = UAU^\dagger$ with $U = B^\dagger$. **view** `mx(pa('X'), {basis:['+x','-x']})`
- Check: `f4XdiagX`, `f4XZdiag`.

**D4b · `f4-spectral:b3` · result `f(A) = \sum_i f(\lambda_i)|a_i\rangle\langle a_i|`** (N&C Box 2.2; reused for $\sqrt{\cdot}$ in `f4-positive:b2`)
- Ground (3 views):
  1. `A = B D B^\dagger,\ D = \mathrm{diag}(\lambda_i)` — Diagonalize (D4a). **view** `mx(pa('X'), {basis:['+x','-x']})` · *the diagonal $D$*
  2. `A^2 = B D B^\dagger B D B^\dagger = B D^2 B^\dagger` — The middle $B^\dagger B = I$ cancels.
  3. `A^n = B D^n B^\dagger` — Repeat: powers act on the diagonal alone. **view** `mx(prod(pa('X'), pa('X')))` · *$\sigma_x^2$*
  4. `f(A) = B f(D) B^\dagger = \sum_i f(\lambda_i)|a_i\rangle\langle a_i|` — Any power series, so any function, acts on the eigenvalues. **view** `mx(lin([1, out('+x')], [1, out('-x')]))` · *$\sigma_x^2 = I = P_{+x} + P_{-x}$*
- Formal (2 views):
  1. `A^n = B D^n B^\dagger` — $B^\dagger B = I$ between factors. **view** `mx(pa('X'), {basis:['+x','-x']})`
  2. `f(A) = \sum_i f(\lambda_i)|a_i\rangle\langle a_i|` — functional calculus (N&C Box 2.2); $\sigma_x^2 = I$, $\sqrt{P} = P$. **view** `mx(prod(pa('X'), pa('X')))`
- Check: `f4XsqIsI`, `f4XZsqrtVals`, `f4SqrtProj`.

**D5 · `f4-unitary:b2` · result `\|Uv\| = \|v\|`** (Axler 7.51)
- Ground (2 views):
  1. `U^\dagger U = I` — The defining property of a unitary (b1). **view** `mx(prod(adj(gate('H')), gate('H')))` · *$H^\dagger H = I$*
  2. `\|Uv\|^2 = \langle Uv|Uv\rangle` — Length squared is the inner product of an arrow with itself (Chapter F2).
  3. `= \langle v|U^\dagger U|v\rangle = \langle v|v\rangle` — Move $U^\dagger$ across (Chapter F3), then $U^\dagger U = I$.
  4. `\|Uv\| = \|v\|` — A unitary keeps every length. **view** `split( bl('0') / bl('+x') )` · *$H$: $|0\rangle \to |{+}x\rangle$, same length*
- Formal (2 views):
  1. `\|Uv\|^2 = \langle v|U^\dagger U|v\rangle = \|v\|^2` — $U^\dagger U = I$ (Axler 7.51). **view** `mx(prod(adj(gate('H')), gate('H')))`
  2. `\|Uv\| = \|v\|` — $U$ is an isometry; conversely every isometry is unitary. **view** `split( bl('0') / bl('+x') )`
- Check: `f4HdH`, `f4HonZero`, `f4HpreservesNorm`.

**D6 · `f4-commuting:b2` · result `[A, B] = 0 \Rightarrow B` diagonal in `A`'s eigenbasis** (notes p. 16; Axler 5E)
- Ground (3 views):
  1. `[A, B] = 0,\quad A|a_i\rangle = \lambda_i|a_i\rangle` — $A$, $B$ commute; $A$ has distinct eigenvalues. **view** `split( mx(pa('Z')) / mx(out('0')) )` · *$\sigma_z$ and $P_{+z}$, both diagonal in $z$*
  2. `\langle a_i|[A, B]|a_j\rangle = 0` — The commutator is zero, so every entry is.
  3. `(\lambda_i - \lambda_j)\langle a_i|B|a_j\rangle = 0` — Expand $[A,B]$; let $A$ act left and right.
  4. `i \ne j \Rightarrow \langle a_i|B|a_j\rangle = 0` — Different eigenvalues force the off-diagonal $B$ entries to vanish: $B$ is diagonal in $A$'s basis. **view** `split( mx(pa('Z'), {spectrum:'bars'}) / mx(out('0'), {spectrum:'bars'}) )` · *a shared eigenbasis*
- Formal (2 views):
  1. `0 = \langle a_i|[A,B]|a_j\rangle = (\lambda_i - \lambda_j)\langle a_i|B|a_j\rangle` — $A$ Hermitian, distinct spectrum (notes p. 16). **view** `split( mx(prod(pa('X'), pa('Z'))) / mx(prod(pa('Z'), pa('X'))) )` · *$XZ \ne ZX$: the failing case*
  2. `[A, B] = 0 \Leftrightarrow` simultaneously diagonalizable — diagonal tables commute (Axler 5E). **view** `split( mx(pa('Z')) / mx(out('0')) )`
- Check: `f4ZPsimul`, `f4XZcomm`, `f4XZnoSimul`.

## 3. Try-it widget per unit

Widgets reuse the stage kinds' own engine calls; prop names are the real ones.

| Unit | Widget spec | Why this one |
|---|---|---|
| `f4-eigen` | `{kind:'operator-space', props:{mode:'eigen', matrix:[['1/2','1/2'],['1/2','-1/2']]}}` | Drag the operator arrow; the eigenvalue bars and the two eigendirections follow (b1–b3). |
| `f4-hermitian` | `{kind:'matrix', props:{mode:'edit-hermitian'}}` (type a 2×2 Hermitian; `spectrum:'bars'` updates) | Change an entry and watch the two bars stay on the real line (b2). |
| `f4-spectral` | `{kind:'matrix', props:{mode:'spectral-build', eigenAngleDeg:45}}` | Set the two eigenvalues and the eigenvector angle; the grid is rebuilt from $\sum \lambda_i\|a_i\rangle\langle a_i|$ (b1–b2). |
| `f4-unitary` | `{kind:'bloch', props:{mode:'rotate', axis:'z', angleDeg:0}}` · secondary `{kind:'complex-plane', props:{mode:'unit-eigenvalues'}}` | Turn the sphere and watch lengths stay fixed; the eigenvalues ride the unit circle (b2–b4). |
| `f4-commuting` | `{kind:'matrix', props:{mode:'commutator', a:'Z', b:'X'}}` | Pick two Paulis; see $[A,B]$ and whether a shared eigenbasis lights up (b1–b2). |
| `f4-positive` | `{kind:'matrix', props:{mode:'sqrt', spectrum:'bars'}}` | Edit a Hermitian; a red bar flags a negative eigenvalue (no square root), green when $A \ge 0$ (b1–b2). |

**Try this** (both tracks; F wording in brackets where it differs):
- `f4-eigen`: (1) Make the operator arrow point along $z$: what are the two eigenvalues? (2) Shrink it to zero. [When is the matrix $\lambda I$?] (3) Point it at $45^\circ$: read the $\pm0.707$ bars.
- `f4-hermitian`: (1) Set a complex corner $b = i$: are the bars still real? (2) Make the two diagonal entries equal. [Find the degenerate case.] (3) Break Hermiticity ($b_{10} \ne b_{01}^*$) and watch a bar leave the real line.
- `f4-spectral`: (1) Set both eigenvalues to $1$: the grid becomes $I$. (2) Set them $+1, -1$ at $45^\circ$: rebuild $\sigma_n$. (3) Square the eigenvalues. [Read off $f(A)$ for $f = (\cdot)^2$.]
- `f4-unitary`: (1) Rotate by $180^\circ$ about $z$: where does $|{+}x\rangle$ go? (2) Watch the eigenvalues meet at $-1$. (3) Rotate about $x$ instead. [Which axis fixes $|0\rangle$?]
- `f4-commuting`: (1) Pick $Z$ and $Z$: do they share a basis? (2) Pick $X$ and $Z$: read $[X, Z] \ne 0$. (3) Pick $Z$ and $I$. [Why does $I$ always commute?]
- `f4-positive`: (1) Edit $\tfrac12(I + X)$: both bars $\ge 0$. (2) Add $-Z$ until a bar dips below zero. (3) Take the square root of $I$. [How many square roots does $I$ have?]

## 4. Challenges per unit

Format: tier · kind · id. Numbers computed in `F4.values.ts` with the named engine call; tolerance 0.005 unless stated,
0 for exact integers. Hints climb nudge → key idea → setup. **Homework:** the map flags HW1 P4(a) and P5(c) (why
Gram–Schmidt lands on the $S_x$ eigenvector) as submitted in 709/448; the one F4 item that touches that proof is
hints-only (`f4-h-gs`, §12 Q3).

### `f4-eigen`
1. **warm-up · numeric · `f4-e-trace`** — "A 2×2 table has eigenvalues $3$ and $-1$. What is its trace?"
   - Answer: **2** = sum of eigenvalues (`traceN` of any such matrix).
   - Hints: (1) The trace is the sum of the eigenvalues. (2) $3 + (-1)$. (3) It is also $A_{00} + A_{11}$.
   - Walkthrough: $\mathrm{tr} = \lambda_1 + \lambda_2 = 2$; the determinant would be $-3$.
2. **core · numeric · `f4-e-eigenvalue`** — "What is the larger eigenvalue of $\tfrac12(X + Z)$?"
   - Answer: **0.7071** = `eigh([[½,½],[½,−½]]).values[1]`.
   - Hints: (1) $\mathrm{tr} = 0$, so the eigenvalues are $\pm\lambda$. (2) $\det = -\tfrac12$. (3) $\lambda^2 = \tfrac12$.
   - Walkthrough: $\lambda = \sqrt{1/2} = 0.707$; the smaller is $-0.707$.
3. **core · choice · `f4-e-complex`** — "Which matrix has non-real eigenvalues?"
   - Options: $\sigma_x$ · $\sigma_z$ · **the quarter-turn $\begin{pmatrix}0 & -1\\ 1 & 0\end{pmatrix}$** ✓ · $\tfrac12(X + Z)$.
   - Check: `eigen2([[0,−1],[1,0]]).values` → $\pm i$; the others are Hermitian (real).
   - Hints: (1) Real eigenvalues come from Hermitian tables. (2) Which one is not its own mirror? (3) A rotation fixes no real arrow.
   - Walkthrough: the quarter-turn's characteristic equation is $\lambda^2 + 1 = 0$, roots $\pm i$.
4. **stretch · numeric · `f4-e-defective`** — "The shear $\begin{pmatrix}2 & 1\\ 0 & 2\end{pmatrix}$ has one eigenvalue. How many independent eigenvectors?"
   - Answer: **1** = `eigen2([[2,1],[0,2]]).vectors.length` (defective).
   - Hints: (1) Solve $(A - 2I)v = 0$. (2) $\begin{pmatrix}0 & 1\\ 0 & 0\end{pmatrix}v = 0$. (3) Only $v = (1, 0)$ works.
   - Walkthrough: the eigenvalue $2$ is defective; its eigenspace is a single line, so the shear is not diagonalizable.

### `f4-hermitian`
1. **warm-up · choice · `f4-h-ishermitian`** — "Which table is Hermitian?"
   - Options: $\begin{pmatrix}1 & i\\ i & 1\end{pmatrix}$ · **$\begin{pmatrix}1 & i\\ -i & 1\end{pmatrix}$** ✓ · $\begin{pmatrix}0 & 1\\ 0 & 0\end{pmatrix}$ · $\begin{pmatrix}i & 0\\ 0 & 1\end{pmatrix}$.
   - Check: `isHermitian` → true only for the second ($A_{10} = A_{01}^*$, real diagonal).
   - Hints: (1) Flip across the diagonal and conjugate. (2) The corners must be mirrors. (3) The diagonal must be real.
   - Walkthrough: $\begin{pmatrix}1 & i\\ -i & 1\end{pmatrix}^\dagger$ equals itself; the first has $A_{10} = i \ne -i = A_{01}^*$.
2. **core · numeric · `f4-h-realeig`** — "The Hermitian $\begin{pmatrix}2 & i\\ -i & 2\end{pmatrix}$ has eigenvalues $2 \pm ?$. Give the larger eigenvalue."
   - Answer: **3** = `eigh([[2,i],[−i,2]]).values[1]`.
   - Hints: (1) Use $\tfrac{a+d}2 \pm \tfrac12\sqrt{(a-d)^2 + 4|b|^2}$. (2) $a = d = 2$, $|b| = 1$. (3) $2 \pm 1$.
   - Walkthrough: discriminant $0 + 4 = 4$, so $\lambda = 2 \pm 1 = 3, 1$; both real.
3. **core · numeric · `f4-h-orthogonal`** — "The eigenvectors of $\sigma_x$ for $+1$ and $-1$ are $|{\pm}x\rangle$. What is their overlap $|\langle{+}x|{-}x\rangle|$?"
   - Answer: **0** = `abs(inner(KET['+x'], KET['-x']))`.
   - Hints: (1) Different eigenvalues force orthogonality. (2) $|{\pm}x\rangle = (1, \pm1)/\sqrt2$. (3) $\tfrac12(1 - 1)$.
   - Walkthrough: $\langle{+}x|{-}x\rangle = \tfrac12(1\cdot1 + 1\cdot(-1)) = 0$: perpendicular directions.
4. **stretch · numeric · `f4-h-gs` · `assigned: 'HW1 P5(c)'`** (hints only; §12 Q3) — "Gram–Schmidt applied to a vector not along an $S_x$ eigenvector lands on which eigenvector? (Give its $\theta$ in degrees on the equator.)"
   - Answer: **90** = the $S_x$ eigenvector's polar angle (`hermitianAngle`/`eigh`).
   - Hints only: (1) Which operator's eigenbasis is the target? (2) The $x$ eigenvectors sit on the equator. (3) Project and renormalize (Chapter F2).
   - Walkthrough: withheld while HW1 P5(c) is assigned.

### `f4-spectral`
1. **warm-up · numeric · `f4-s-square`** — "$\sigma_x$ has eigenvalues $\pm1$. What are the eigenvalues of $\sigma_x^2$?"
   - Answer: **1, 1** = `eigh(funcHermitian(X, a→a²)).values` → (1, 1).
   - Hints: (1) A function acts on the eigenvalues. (2) Square each of $\pm1$. (3) $(\pm1)^2 = 1$.
   - Walkthrough: $\sigma_x^2 = I$, eigenvalues $1$ and $1$.
2. **core · numeric · `f4-s-rebuild`** — "Add the projectors with weights $+1$ and $-1$: $(+1)|{+}x\rangle\langle{+}x| + (-1)|{-}x\rangle\langle{-}x|$. What is the top-right entry?"
   - Answer: **1** = `fromEigen([1,−1],[KET['+x'],KET['-x']])[0][1].re`.
   - Hints: (1) This is a spectral decomposition. (2) It rebuilds a Pauli matrix. (3) Which one has eigenvectors $|{\pm}x\rangle$?
   - Walkthrough: the sum is $\sigma_x = \begin{pmatrix}0 & 1\\ 1 & 0\end{pmatrix}$; the top-right is $1$.
3. **core · numeric · `f4-s-diagonal`** — "Diagonalize $\tfrac12(X + Z)$ in its own basis. What is its top-left diagonal entry?"
   - Answer: **0.7071** = the larger eigenvalue (`eigh` → `basis` diag).
   - Hints: (1) In its own basis a Hermitian table is diagonal. (2) The diagonal holds the eigenvalues. (3) The larger is $+1/\sqrt2$.
   - Walkthrough: $B^\dagger A B = \mathrm{diag}(0.707, -0.707)$.
4. **stretch · numeric · `f4-s-exp`** — "For $H = \tfrac12\sigma_z$, the unitary $e^{-iH\cdot\pi}$ has which diagonal entries? Give the top-left (real part)."
   - Answer: **0** = `expmHermitian(½Z, π)[0][0].re` (it is $e^{-i\pi/2} = -i$).
   - Hints: (1) $f(A)$ acts on the eigenvalues $\pm\tfrac12$. (2) $e^{-i(\pm1/2)\pi} = e^{\mp i\pi/2}$. (3) $e^{-i\pi/2} = -i$.
   - Walkthrough: diagonal $e^{-i\pi/2} = -i$ and $e^{i\pi/2} = i$; the real part of each is $0$.

### `f4-unitary`
1. **warm-up · choice · `f4-u-isunitary`** — "Which table keeps every length?"
   - Options: $\tfrac12(X + Z)$ · **the Hadamard $\tfrac1{\sqrt2}\begin{pmatrix}1 & 1\\ 1 & -1\end{pmatrix}$** ✓ · $\begin{pmatrix}2 & 0\\ 0 & 1\end{pmatrix}$ · $|{+}x\rangle\langle{+}x|$.
   - Check: `isUnitary` → true only for $H$ ($H^\dagger H = I$).
   - Hints: (1) Columns must be perpendicular unit arrows. (2) A projector shortens arrows. (3) A stretch by $2$ changes a length.
   - Walkthrough: $H^\dagger H = I$; the others stretch or shorten some arrow.
2. **core · numeric · `f4-u-unitcircle`** — "The phase gate $S = \mathrm{diag}(1, i)$ is unitary. What is the size of each eigenvalue?"
   - Answer: **1** = `abs(eigen2(gate('S')).values[k])` for each $k$.
   - Hints: (1) A unitary keeps lengths. (2) So $|\lambda| = 1$. (3) $|1| = |i| = 1$.
   - Walkthrough: eigenvalues $1$ and $i$, both on the unit circle.
3. **core · numeric · `f4-u-rotation`** — "$e^{-i\sigma_z t}$ turns the Bloch sphere about $z$. By what angle, at $t = \pi/2$?"
   - Answer: **180** = `unitaryAction(σ_z, π/2).angle` × 180/π (the turn is $2t$ for $H = \sigma_z$).
   - Hints: (1) $e^{-i\theta\,\mathbf n\cdot\boldsymbol\sigma/2}$ turns by $\theta$. (2) Here $H = \sigma_z = 2\cdot\tfrac12\sigma_z$. (3) $\theta = 2t = \pi$.
   - Walkthrough: $\sigma_z = \mathbf n\cdot\boldsymbol\sigma$ with $|\mathbf n| = 1$, so the turn is $2t = \pi = 180^\circ$.
4. **stretch · choice · `f4-u-hermunit`** — "A table is both Hermitian and unitary. Its eigenvalues are:"
   - Options: any real numbers · any numbers of size 1 · **only $+1$ and $-1$** ✓ · only $+1$.
   - Check: real (Hermitian) ∩ size-1 (unitary) = $\{+1, -1\}$; `eigh`/`eigen2` on any Pauli.
   - Hints: (1) Hermitian makes them real. (2) Unitary makes them size 1. (3) Which reals have size 1?
   - Walkthrough: $\lambda \in \mathbb R$ and $|\lambda| = 1$ gives $\lambda = \pm1$, so $A^2 = I$.

### `f4-commuting`
1. **warm-up · choice · `f4-c-commute`** — "Which pair commutes?"
   - Options: $\sigma_x, \sigma_z$ · **$\sigma_z, \mathrm{diag}(1, 0)$** ✓ · $\sigma_x, \sigma_y$ · $\sigma_y, \sigma_z$.
   - Check: `maxAbs(commutator(·,·))` → 0 only for the second (both diagonal).
   - Hints: (1) Diagonal tables commute. (2) Which pair is diagonal in the same basis? (3) The Paulis $x, y, z$ do not commute.
   - Walkthrough: $\sigma_z$ and $\mathrm{diag}(1, 0)$ are both $z$-diagonal, so $[A, B] = 0$.
2. **core · numeric · `f4-c-commutator`** — "What is the largest entry size of $[\sigma_x, \sigma_z] = \sigma_x\sigma_z - \sigma_z\sigma_x$?"
   - Answer: **2** = `maxAbs(commutator(X, Z))`.
   - Hints: (1) $[\sigma_x, \sigma_z] = -2i\sigma_y$. (2) $\sigma_y$ has entries of size 1. (3) $|{-2i}| = 2$.
   - Walkthrough: $[\sigma_x, \sigma_z] = \begin{pmatrix}0 & -2\\ 2 & 0\end{pmatrix}$ (that is $-2i\sigma_y$); the largest entry is $2$.
3. **stretch · choice · `f4-c-simul`** — "Two Hermitian tables share a full eigenbasis exactly when:"
   - Options: they have the same trace · **they commute** ✓ · one is a multiple of the other · both are unitary.
   - Check: `simultaneousEigenbasis` ≠ null ⇔ commutator $= 0$.
   - Hints: (1) Think about diagonal tables. (2) Diagonal tables commute, and conversely. (3) The test is $AB = BA$.
   - Walkthrough: a shared eigenbasis ⇔ $[A, B] = 0$ (both diagonal there).

### `f4-positive`
1. **warm-up · choice · `f4-p-positive`** — "Which table is positive ($A \ge 0$)?"
   - Options: $\sigma_z$ · **$|{+}x\rangle\langle{+}x|$** ✓ · $\sigma_y$ · $\begin{pmatrix}1 & 0\\ 0 & -1\end{pmatrix}$.
   - Check: `eigh(·).values[0] ≥ 0` only for the projector (eigenvalues 1, 0).
   - Hints: (1) Positive means no negative eigenvalue. (2) A projector's eigenvalues are $0$ and $1$. (3) $\sigma_z$ has a $-1$.
   - Walkthrough: the projector is $\ge 0$; the others have a negative eigenvalue.
2. **core · numeric · `f4-p-sqrt`** — "The positive table $\mathrm{diag}(4, 9)$ has a positive square root. What is its larger diagonal entry?"
   - Answer: **3** = `sqrtPSD(diag(4,9))[1][1].re`.
   - Hints: (1) The square root acts on the eigenvalues. (2) $\sqrt4 = 2$, $\sqrt9 = 3$. (3) Same directions, rooted stretches.
   - Walkthrough: $\sqrt{\mathrm{diag}(4, 9)} = \mathrm{diag}(2, 3)$.
3. **stretch · numeric · `f4-p-svd`** — "The shear $\begin{pmatrix}2 & 1\\ 0 & 2\end{pmatrix}$ is not Hermitian. What is its largest singular value?"
   - Answer: **2.5616** = `svd([[2,1],[0,2]]).s[0]`.
   - Hints: (1) Singular values are $\sqrt{\text{eigenvalues of } A^\dagger A}$. (2) $A^\dagger A = \begin{pmatrix}4 & 2\\ 2 & 5\end{pmatrix}$. (3) Its larger eigenvalue is $6.56$.
   - Walkthrough: singular values $2.56, 1.56$ — the true stretch factors, unlike the repeated eigenvalue $2$.

## 5. Glossary terms new in F4

`introduces` marks the notation beats (W-709 #8). F4 is the canonical **owner** of this math
(`decisions/qc709-foundations.md`); the Q chapters that already show these terms keep their beats and gain Q→F bridges
in a later wiring pass, with no second full derivation. **Mechanism (see §12 Q1):** ids that Q2/Q3/Q8 already created
are REUSED (one shared `GlossEntry`); F4 sets the per-chapter introduces-beat, which the per-chapter lint allows. Ids
with no prior entry are NEW. Inline math is TeX inside `$…$`.

| id | Term | introduces | new/reuse | Ground gloss | Formal definition | First use |
|---|---|---|---|---|---|---|
| `qc-eigenvalue` | eigenvalue | notation | reuse (Q3) | The amount a matrix stretches one of its special arrows. | $\lambda$ with $A\|a\rangle = \lambda\|a\rangle$, $\|a\rangle \ne 0$. | `f4-eigen:b1` |
| `qc-eigenvector` | eigenvector | notation | reuse (Q3) | An arrow a matrix only stretches, never turns. | A nonzero $\|a\rangle$ with $A\|a\rangle = \lambda\|a\rangle$. | `f4-eigen:b1` |
| `qc-characteristic-equation` | characteristic equation | notation | reuse (Q3) | The equation whose roots are the eigenvalues: the determinant of $A - \lambda I$ is zero. | $\det(A - \lambda I) = 0$; for 2×2, $\lambda^2 - (\mathrm{tr}\,A)\lambda + \det A = 0$ (Axler 5.27). | `f4-eigen:b2` |
| `qc-degenerate` | degenerate | notation | reuse (Q3) | A stretch that repeats, with a whole plane of arrows sharing it. | An eigenvalue whose eigenspace has dimension $> 1$. | `f4-eigen:b4` |
| `qc-hermitian-matrix` | Hermitian | notation | reuse (Q3/L3) | A table equal to its own mirror: flip across the diagonal, conjugate, unchanged. | $A = A^\dagger$, i.e. $A_{ij} = A_{ji}^*$ (Axler: self-adjoint, 7.10). | `f4-hermitian:b1` |
| `qc-spectral-representation` | spectral decomposition | notation | reuse (Q3) | A Hermitian table rebuilt as a sum of its eigenvalues times the projectors onto its directions. | $A = \sum_i \lambda_i\|a_i\rangle\langle a_i|$ over an orthonormal eigenbasis (the spectral theorem, Axler 7.29). | `f4-spectral:b1` |
| `qc-diagonalize` | diagonalize | — | NEW | Change to the eigenbasis so the table is diagonal, its eigenvalues down the diagonal. | $B^\dagger A B = \mathrm{diag}(\lambda_i)$ with $B$'s columns the eigenvectors. | `f4-spectral:b2` |
| `qc-function-of-operator` | function of an operator | notation | NEW | Applying a function to a matrix by applying it to each eigenvalue, keeping the directions. | $f(A) = \sum_i f(\lambda_i)\|a_i\rangle\langle a_i|$ (functional calculus); e.g. $A^n$, $\sqrt A$, $e^{-iAt}$. | `f4-spectral:b3` |
| `qc-unitary` | unitary | notation | reuse (Q2) | A table that keeps every length: its columns are perpendicular unit arrows. | $U^\dagger U = UU^\dagger = I$; equivalently $\langle Uv\|Uw\rangle = \langle v\|w\rangle$ (an isometry, Axler 7.51). | `f4-unitary:b1` |
| `qc-unitary-eigenvalue` | eigenvalues on the unit circle | notation | NEW | A length-keeping table stretches by size 1, so its eigenvalues sit on the unit circle. | $U$ unitary $\Rightarrow$ every $\lambda = e^{i\theta}$, $\|\lambda\| = 1$. | `f4-unitary:b3` |
| `qc-simultaneous-eigenbasis` | simultaneous eigenbasis | notation | NEW | One set of arrows that are eigenvectors of two tables at once. | An orthonormal basis of common eigenvectors of $A$ and $B$; exists iff $[A, B] = 0$. | `f4-commuting:b1` |
| `qc-positive-operator` | positive operator | notation | reuse (Q8) | A Hermitian table that never stretches an arrow backwards: no negative eigenvalue. | $A \ge 0$: $A = A^\dagger$ and $\langle v\|A\|v\rangle \ge 0$ for all $v$, iff spectrum $\ge 0$ (Axler 7.43). | `f4-positive:b1` |
| `qc-operator-square-root` | square root of a matrix | — | NEW | The positive table whose square is a given positive table. | For $A \ge 0$, the unique $\sqrt A \ge 0$ with $(\sqrt A)^2 = A$ (Axler 7.44). | `f4-positive:b2` |
| `qc-svd` | singular-value decomposition | — | NEW (Formal) | Any table as a turn, a positive stretch, and a turn; the stretch amounts are the singular values. | $A = U\Sigma V^\dagger$, $\Sigma \ge 0$ diagonal (Axler 7.58). | `f4-positive:b3` |
| `qc-polar-decomposition` | polar form | — | NEW (Formal) | Any table as a rotation times a positive stretch. | $A = U\|A|$, $U$ unitary, $\|A| = \sqrt{A^\dagger A} \ge 0$ (Axler 7.58). | `f4-positive:b3` |
| `qc-normal-operator` | normal operator | — | NEW (Formal, glossary only) | A table that commutes with its own mirror; exactly the ones with an orthonormal eigenbasis. | $AA^\dagger = A^\dagger A$; the complex spectral theorem's hypothesis (Axler 7.24). | §5 (Formal aside, `f4-spectral:b4` F note) |

Reused but **not** introduced here (owned by F2/F3): `qc-inner-product`, `qc-orthonormal`, `qc-gram-schmidt` (F2);
`qc-adjoint`, `qc-matrix-element`, `qc-change-of-basis`, `qc-determinant`, `qc-outer-product`, `qc-projector` (F3). Also
reused: `qc-commutator` (Q3), `qc-pauli-matrices` (Q3), `qc-euler`/`qc-unit-circle` (F1).

**Notation beats (one each, both tracks, with a view):**

| Gloss id | Beat | View |
|---|---|---|
| `qc-eigenvalue`, `qc-eigenvector` | `f4-eigen:b1` | `opsM([['1/2','1/2'],['1/2','-1/2']])` |
| `qc-characteristic-equation` | `f4-eigen:b2` | `mx(lin([1/2, pa('X')], [1/2, pa('Z')]), {spectrum:'bars'})` |
| `qc-degenerate` | `f4-eigen:b4` | `mx(pa('ZZ'), {spectrum:'bars'})` over `opsM([['2','1'],['0','2']])` |
| `qc-hermitian-matrix` | `f4-hermitian:b1` | `mx(pa('X'))` over `mx(adj(pa('X')))` |
| `qc-spectral-representation` | `f4-spectral:b1` | `mx(lin([1, out('+x')], [-1, out('-x')]))` over `mx(pa('X'))` |
| `qc-function-of-operator` | `f4-spectral:b3` | `mx(prod(pa('X'), pa('X')))` over `mx(lin([1, out('+x')], [1, out('-x')]))` |
| `qc-unitary` | `f4-unitary:b1` | `mx(gate('H'))` over `mx(prod(adj(gate('H')), gate('H')))` |
| `qc-unitary-eigenvalue` | `f4-unitary:b3` | `mx(gate('S'))` over `cp({points:[{r:1,phiDeg:0},{r:1,phiDeg:90}]})` |
| `qc-simultaneous-eigenbasis` | `f4-commuting:b1` | `mx(pa('Z'), {spectrum:'bars'})` over `mx(out('0'), {spectrum:'bars'})` |
| `qc-positive-operator` | `f4-positive:b1` | `mx(out('+x'), {spectrum:'bars'})` over `mx(pa('Z'), {spectrum:'bars'})` |

## 6. Review card per unit (both tracks)

Every number is an F4 claim from §1 or §4.

### `f4-eigen`
- **G points:** (1) An eigenvector is an arrow a matrix only stretches; the stretch is its eigenvalue. (2) The eigenvalues solve $\det(A - \lambda I) = 0$. (3) For 2×2, $\lambda^2 - (\mathrm{tr}\,A)\lambda + \det A = 0$. (4) Eigenvalues can be complex ($\pm i$ for a turn); a stretch can repeat (degenerate), and a defective table runs short of eigenvectors.
- **F points:** (1) $A\|a\rangle = \lambda\|a\rangle$, $\|a\rangle \ne 0$ (Axler 5.5). (2) $\det(A - \lambda I)$ is the characteristic polynomial (Axler 5.27). (3) Over $\mathbb C$ every square matrix has an eigenvalue.
- **Equations:** $A\|a\rangle = \lambda\|a\rangle,\quad \lambda^2 - (\mathrm{tr}\,A)\lambda + \det A = 0$
- **Trap:** "a real matrix has real eigenvalues". The real quarter-turn has $\pm i$ (`f4Rvals`).

### `f4-hermitian`
- **G points:** (1) Hermitian means $A = A^\dagger$: the table is its own mirror. (2) A Hermitian table's eigenvalues are real. (3) Its eigenvectors with different eigenvalues are at right angles. (4) With repeats, Gram–Schmidt still gives a right-angle set.
- **F points:** (1) $A_{ij} = A_{ji}^*$, diagonal real. (2) $\lambda = \lambda^*$ from $\langle a|A|a\rangle$ read two ways (Axler 7.13). (3) Orthonormal eigenbasis exists (Axler 7.22).
- **Equations:** $A = A^\dagger,\quad \lambda \in \mathbb R,\quad \langle a_2|a_1\rangle = 0\ (\lambda_1 \ne \lambda_2)$
- **Trap:** real eigenvalues do not need real entries: $\begin{pmatrix}2 & i\\ -i & 2\end{pmatrix}$ has eigenvalues $1, 3$ (`f4-h-realeig`).

### `f4-spectral`
- **G points:** (1) $A = \sum_i \lambda_i\|a_i\rangle\langle a_i|$: eigenvalue times projector. (2) In its own basis a Hermitian table is diagonal, $B^\dagger A B = \mathrm{diag}(\lambda_i)$. (3) $f(A) = \sum_i f(\lambda_i)\|a_i\rangle\langle a_i|$: a function acts on the eigenvalues. (4) It works in any dimension.
- **F points:** (1) Spectral theorem (Axler 7.29). (2) $A^n = BD^nB^\dagger$. (3) Functional calculus (N&C Box 2.2).
- **Equations:** $A = \sum_i \lambda_i\|a_i\rangle\langle a_i|,\quad f(A) = \sum_i f(\lambda_i)\|a_i\rangle\langle a_i|$
- **Trap:** squaring forgets the sign: $\sigma_x^2 = \sigma_z^2 = I$, so $\sqrt{I}$ is not unique (`f4-s-square`).

### `f4-unitary`
- **G points:** (1) A unitary keeps every length, $U^\dagger U = I$. (2) $\|Uv\| = \|v\|$: a rigid turn. (3) Its eigenvalues have size 1, on the unit circle. (4) $e^{-iHt}$ turns the Bloch sphere.
- **F points:** (1) Isometry $\Leftrightarrow U^\dagger U = I$ (Axler 7.51). (2) $\|\lambda\| = 1$. (3) Hermitian and unitary $\Rightarrow \lambda = \pm1$, $A^2 = I$.
- **Equations:** $U^\dagger U = I,\quad \|\lambda\| = 1,\quad e^{-iHt} = \sum_i e^{-i\lambda_i t}\|a_i\rangle\langle a_i|$
- **Trap:** calling every length-keeping map a stretch. A unitary never stretches; its singular values are all 1.

### `f4-commuting`
- **G points:** (1) Two tables share a set of directions exactly when they commute, $AB = BA$. (2) Then each shared arrow is an eigenvector of both. (3) If $AB \ne BA$, no shared basis exists. (4) $I$ commutes with everything.
- **F points:** (1) $[A, B] = 0 \Leftrightarrow$ simultaneously diagonalizable (Axler 5E). (2) $(\lambda_i - \lambda_j)\langle a_i|B|a_j\rangle = 0$. (3) Degenerate operators are flexible.
- **Equations:** $[A, B] = AB - BA = 0 \Leftrightarrow$ a shared eigenbasis
- **Trap:** "same eigenvalues means they commute". $\sigma_x$ and $\sigma_z$ share the spectrum $\{\pm1\}$ but do not commute (`f4XZcomm`).

### `f4-positive`
- **G points:** (1) Positive means no negative eigenvalue, $\langle v|A|v\rangle \ge 0$. (2) A positive table has a positive square root. (3) Any table is a turn times a positive stretch (polar form). (4) Singular values are the true stretch factors.
- **F points:** (1) $A \ge 0 \Leftrightarrow$ spectrum $\ge 0$ (Axler 7.43). (2) $\sqrt A$ unique and positive (Axler 7.44). (3) $A = U\Sigma V^\dagger$, $A = U|A|$ (Axler 7.58).
- **Equations:** $A \ge 0 \Leftrightarrow \text{spectrum} \ge 0,\quad A = U|A|$
- **Trap:** a positive table need not be a projector: $I + \tfrac12(X+Z)$ has eigenvalues $1.71, 0.29$ (`f4-p...`, `f4PosNotProj`).

## 7. Symbol-before-use tables

Reading order: units in order; inside a unit, beats (L → B → C, reveals in place), then Try it, review, challenges.
Abbreviations ei, he, sp, un, co, po for the six units. Status: OK · **FLAG** (clash or early use) · gloss (fuller
meaning later). Carried from F2/F3: vectors $|v\rangle$, inner product $\langle\cdot|\cdot\rangle$, the matrix $A$ and
entries $A_{ij}$, the adjoint $A^\dagger$, the determinant $\det$, the trace $\mathrm{tr}$, change of basis
$U$/$A' = UAU^\dagger$, the outer product $|a\rangle\langle b|$, the identity $I$. From F1: $i$, $e^{i\theta}$, the
mirror $z^*$, the unit circle. From Q3 (used as examples, not re-derived): the Pauli matrices $\sigma_x, \sigma_y,
\sigma_z$ and the states $|{\pm}x\rangle$, $|{\pm}z\rangle$, $|{\pm}n\rangle$.

### 7.1 Ground track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $\lambda$ | ei:b1 | ei:b1 ("the scale") | OK | The eigenvalue; always "a stretch". |
| $\|a\rangle$, $A\|a\rangle = \lambda\|a\rangle$ | ei:b1 | ei:b1 | OK | Tag `qc-eigenvector`. |
| $\det(A - \lambda I)$ | ei:b2 | ei:b2 | OK | $\det$ and $I$ from F3. |
| $\mathrm{tr}\,A$ | ei:b2 | F3 (`f3-change`) | OK | Recapped as "$A_{00} + A_{11}$". |
| $Z\otimes Z$ | ei:b4 | ei:b4 ("Chapter F6's language") | **FLAG** (forward) | Named as a 4×4 example; $\otimes$ is F6. Kept: the beat treats it as a given table, no $\otimes$ algebra. |
| $R$ (quarter-turn) | ei:b5 | ei:b5 | OK | A named 2×2 example. |
| $A = A^\dagger$ | he:b1 | he:b1; F3 ($\dagger$) | OK | Tag `qc-hermitian-matrix`. |
| $a, b, d$ (matrix entries) | he:b2 | he:b2 | OK | Generic 2×2 Hermitian entries. |
| $P_\lambda$, $P_{+x}$ | sp:b1, sp:b4 | sp:b1 (projector, F3) | OK | Projector onto an eigenspace. |
| $f(A)$, $A^n$ | sp:b3 | sp:b3 | OK | Tag `qc-function-of-operator`. |
| $B$ (eigenvector columns) | sp:b2 | sp:b2 | **FLAG** (minor) | $B$ is the change-of-basis matrix here; F3 wrote $U$. Note in place: "$B$'s columns are the eigenvectors, $U = B^\dagger$". |
| $U$ (unitary) | un:b1 | un:b1 | OK | Tag `qc-unitary`. |
| $e^{-iHt}$, $\theta$, $\mathbf n$ | un:b4 | un:b4; F1 ($e^{i\theta}$) | OK | A rotation; $\mathbf n$ the axis. |
| $[A, B]$ | co:b2 | co:b2; Q3 (commutator) | OK | Order-matters test. |
| $A \ge 0$ | po:b1 | po:b1 | OK | Tag `qc-positive-operator`. |
| $\sqrt A$ | po:b2 | po:b2 | OK | Tag `qc-operator-square-root`. |

### 7.2 Formal track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $T^*$ (Axler) vs $A^\dagger$ | ei:b1 cap | ei:b1 Rosetta | OK | Only in the Rosetta caption. |
| $\mathbb C$, roots of the characteristic polynomial | ei:b5 | ei:b5; F1 | OK | Fundamental theorem of algebra, named. |
| $\langle a_i|a_j\rangle = \delta_{ij}$ | he:b4 | F2 (orthonormal) | OK | — |
| $\sum_\lambda \lambda P_\lambda$ | sp:b4 | sp:b4 | OK | The n-dimensional spectral theorem. |
| $B^\dagger A B = D$ | sp:b2 | sp:b2 | OK | $U = B^\dagger$ stated. |
| $\Sigma$, $U\Sigma V^\dagger$ | po:b3 | po:b3 | OK | Singular values; `qc-svd`. |
| $\|A| = \sqrt{A^\dagger A}$ | po:b3 | po:b3 | OK | Polar form; `qc-polar-decomposition`. |
| normal, $AA^\dagger = A^\dagger A$ | sp:b4 F note | §5 glossary | gloss | Formal aside only; the complex spectral theorem's hypothesis. |

**Counts:** 1 Ground FLAG forward ($Z\otimes Z$, carried by the beat as a given), 1 Ground FLAG minor ($B$ vs $U$,
stated in place); no Formal FLAG. No symbol is used before its defining beat within a unit.

## 8. Errata

**No `Correction` in the mathematics of Axler 5A/5D/5E, 7A–7F or N&C §2.2.** Every statement used — the characteristic
polynomial, the real-eigenvalue and orthogonality proofs, the spectral theorem, the isometry characterisation, the
positive square root, SVD/polar — was re-checked (§ Evidence) and holds. Items for the record:

| # | Where | Finding | Action |
|---|---|---|---|
| F4-E1 | Map F4 "Src" | "notes pp. 14–16": the eigen/spectral material the notes present is the same Q3 drew from (notes p. 15). F4 is the ground-up owner; it cites Axler/N&C for the general proofs and uses the notes only for the framing. | Cite as above. |
| F4-E2 | Notation | Axler's $T^*$ = our $T^\dagger$; Axler's $\langle u, v\rangle$ (linear in the first slot) = our $\langle v|u\rangle$ (conjugate-linear first slot, C9); "self-adjoint" = Hermitian. | Rosetta caption in `f4-eigen:b1`. |
| F4-E3 | `cmat.eigh` | `eigh` throws on a non-Hermitian input and returns real values only. F4's non-Hermitian examples ($R$, the shear) use `operators.eigen2` (2×2, any matrix); the matrix stage's `spectrum:'bars'` is rejected on a non-Hermitian grid (by design). | Use `eigen2` for the ±i / defective examples; `spectrum` only on Hermitian grids. §9.1. |
| F4-E4 | `matrix` `lin` coefficients | The `lin` source allows only the fixed exact tokens (±1, ±½, ±i, ±1/√2) or `{trig}`; a generic Hermitian with other entries (e.g. Q3's $\begin{pmatrix}1 & 2-i\\ 2+i & -3\end{pmatrix}$) cannot be a `matrix` source. | F4's grid examples are all expressible (Paulis, projectors, ½-combos, trig-combos); generic entries use `operator-space`'s raw `matrix` (as Q3 did). §9.2. |

## 9. Engine gaps and stage-contract gaps

### 9.1 Engine
**No new functions.** Every number comes from existing calls:
- `physics/qc/cmat.ts`: `eigh` (Hermitian eigenvalues ascending + orthonormal eigenvectors), `fromEigen` (the spectral
  sum $\sum \lambda_i|a_i\rangle\langle a_i|$), `funcHermitian` ($f(A)$), `expmHermitian` ($e^{-iHt}$),
  `simultaneousEigenbasis`, `sqrtPSD`, `svd`, `polar`, `detN`, `traceN`, `projectorOnto`, and the re-exports
  `isHermitian`, `isUnitary`, `matmul`, `dagger`, `inner`, `outer`, `identity`, `madd`, `msub`, `mscale`, `maxDiff`,
  `matEq`.
- `physics/operators.ts` (448): `eigen2` (ANY 2×2 matrix — the ±i quarter-turn, the defective shear — with its
  eigenvalues and eigenvectors and a `defective` flag), `decomposeHermitian` (a 2×2 Hermitian as $a_0 I + \mathbf a\cdot\boldsymbol\sigma$,
  for `operator-space`), `unitaryAction` (a unitary's Bloch axis and angle). `physics/linalg.ts`: `charPoly2`,
  `commutator`. Q3's own plan already used `charPoly2`, `eigen2` and `decomposeHermitian`, so they are proven.

**One real limit (not a gap — flag, §12 Q2).** `cmat.eigh` is Hermitian-only (it throws otherwise) and there is no
general n×n eigensolver. F4's non-Hermitian examples (the quarter-turn $R$, the shear) are all **2×2**, covered by
`eigen2`. The matrix stage's `spectrum:'bars'` is rejected on a non-Hermitian grid by design, so those examples use
`operator-space` (raw matrix) and `complex-plane` instead. numpy twin for every F4 number: `np.linalg.eigh`/`eig`,
`np.poly`, `scipy.linalg.sqrtm`/`expm`/`svd` (`scratchpad/f456plan-numpy.py`, block "F4").

| Claim group | Engine route | numpy route |
|---|---|---|
| eigenvalues/vectors (Hermitian) | `eigh(A)` | `np.linalg.eigh` |
| eigenvalues/vectors (2×2 any) | `eigen2(M)`, `charPoly2(M)` | `np.linalg.eig`, `np.poly` |
| spectral sum, $f(A)$, $\sqrt A$ | `fromEigen`, `funcHermitian`, `sqrtPSD`, `expmHermitian` | reconstruct from eig; `scipy.linalg.sqrtm`/`expm` |
| diagonalization $B^\dagger A B$ | matrix `basis` field (→ `changeU`) | `V.conj().T @ A @ V` |
| unitary checks, rotation | `isUnitary`, `unitaryAction` | `np.allclose(U.conj().T@U, I)`; axis/angle from `logm` |
| commuting / simultaneous | `commutator`, `simultaneousEigenbasis` | `A@B - B@A`; joint eigenbasis by sorting |
| SVD / polar | `svd`, `polar` | `np.linalg.svd`; `U = W @ Vh`, `P = Vh.conj().T @ diag(s) @ Vh` |

### 9.2 Stage contract
**`matrix` v2 (needs: matrix-v2)** — all existing fields:
| Field / source | Used as | Beats / derivations |
|---|---|---|
| `spectrum:'bars'` (UNCLAMPED; negatives below the line) | eigenvalue bars of a Hermitian; $\sigma_z$'s $-1$ below the line | ei:b2, he:b2/b3, sp:b4, un:b5, co:b1, po:b1; D1, D2, D3a, D6 |
| `basis:[K₁,K₂,…]` (AmpSource kets) | $B^\dagger A B$ diagonalization; eigenvectors are named directions ($|{\pm}x\rangle$, $|{\pm}n\rangle$) | sp:b2; D3b, D4a, D4b |
| `lin:[{c,src}]` (exact/trig coefficients) | the spectral sum $\sum\lambda_i\,$`out`$(a_i)$; $\tfrac12(X+Z)$; $\tfrac12(I+X)$ | ei:b2, sp:b1/b3, po:b2; D1, D3a, D4b |
| `product`, `adjoint` | $\sigma_x^2$, $A^\dagger A$, $XZ$ vs $ZX$ | sp:b3, he:b1, un:b1/b2, co:b2; D4b, D5, D6 |
| `pauli` (incl. 2-letter → kron), `gate`, `outer` | $\sigma_x$, $Z\otimes Z$, $H$, $S$, projectors | throughout |
| `blocks:2`, `highlight` | the $Z\otimes Z$ eigenspace blocks | ei:b4, he:b5, sp:b4 |

**`operator-space`** (the L3 `labels:'plain'` variant; no new fields): the raw 2×2 `op:{matrix}` carries any entries,
including the non-Hermitian $R$ and shear and a generic Hermitian (the `lin` vocabulary cannot build those — §8 F4-E4).
Arrow = half the eigenvalue gap, gauge = midpoint, from `decomposeHermitian`.

**`bloch`** (709 variant, no new fields): `rotate`/`trail` for a unitary as a turn (un:b4); `state` for an eigenvector
on the sphere (sp, he:b4).

**`complex-plane`** (F1's kind; no new field needed): the shorthand `cp({points:[…]})` is realized by the existing
**`spokes`** field — arrows from 0 to each eigenvalue, whose angle is the eigenvalue's argument and whose size is its
modulus (1 for a unitary). So $S$'s eigenvalues are `spokes:{phasesDeg:[0, 90], sizes:[1, 1]}` and $R$'s are
`spokes:{phasesDeg:[90, 270]}` on the unit circle. A small optional `points` convenience field would read more
directly (§12 Q4); not required.

### 9.3 Widget gaps (deferred under the cap; §3 specs are the target)
- `operator-space` modes `'eigen'`, `'spectral-build'` (set eigenvalues + eigenvector angle, rebuild the grid).
- `matrix` modes `'edit-hermitian'`, `'commutator'`, `'sqrt'` (live `spectrum:'bars'` with a red bar for a negative
  eigenvalue). All reuse the stage's own engine calls (`eigh`, `fromEigen`, `commutator`, `sqrtPSD`).

## 10. Media

### 10.1 Blender opener (Part F top flange, shared)
The Part F opener (planned in F1 §10) plays before `f4-eigen`; no F4-specific Blender asset.

### 10.2 Motion Canvas film (each drawn number named from the engine; the manifest lists them for `films.test.ts`)
**`qc-f4-stretch-ring` "Stretch directions: a 2×2 machine on a ring of arrows"** (opener of `f4-eigen`, ~22 s):
1. A ring of unit arrows; apply $\tfrac12(X + Z)$. Most arrows turn; two do not — the eigenvectors at $45^\circ$ and $135^\circ$ (`eigh(½(X+Z)).vectors`).
2. Those two are only stretched, by $+0.707$ and $-0.707$ (`f4XZvals`), the one at $135^\circ$ flipping through zero.
3. Overlay the operator-space arrow (length $0.707$ = half the gap) and the eigenvalue bars.
4. Replay with $\sigma_x$: the fixed directions are $|{\pm}x\rangle$, stretches $\pm1$ (`f4Xvals`).
Manifest: `f4XZvals`, `f4XZvecPlus`, `f4XZvecMinus`, `f4XZgap`, `f4Xvals`.

### 10.3 Higgsfield decor (atmosphere only; no text, numbers or diagrams; user approves credits)
A slow play of light stretching along two fixed directions of a brushed-metal plate on navy cloth — no grid, no ticks.

## 11. Hooks

### 11.1 Concept-map stations (`qc709/concepts.ts`, `QcConcept`)
| id | label | chapter · unit | needs | cross-course (448) |
|---|---|---|---|---|
| `qc-f4-eigen` | Eigenvalues: the directions a matrix only stretches | F4 · `f4-eigen` | F3 `qc-matrix-element`, `qc-determinant` | twin of `eigen-problem` |
| `qc-f4-hermitian` | Hermitian tables: real stretches, right-angle directions | F4 · `f4-hermitian` | `qc-f4-eigen`, F3 `qc-adjoint` | links `observables` |
| `qc-f4-spectral` | The spectral theorem and functions of a matrix | F4 · `f4-spectral` | `qc-f4-hermitian` | twin of `spectral` (Q3) |
| `qc-f4-unitary` | Unitaries: keeping every length; eigenvalues on the circle | F4 · `f4-unitary` | `qc-f4-eigen`, F1 `qc-euler` | links `l6-generator` |
| `qc-f4-commuting` | Commuting tables and a shared eigenbasis | F4 · `f4-commuting` | `qc-f4-spectral` | links `compatible` (Q3) |
| `qc-f4-positive` | Positive tables and matrix square roots | F4 · `f4-positive` | `qc-f4-spectral` | — |

Cross-course edges use the proposed `twins448?`/`links448?` fields (F1 §11.1); neither is a prerequisite, so F4 stays
standalone and `concepts.test.ts` keeps its no-later-chapter rule.

### 11.2 Arcade: one level per unit (`arcade/games.ts`; `wrong` is a 0-based step index)
Label constant: `const F4x = (unit, label) => ({ lecture: 'F4', unit, label })`. All six are Spot the error.
1. **`f4-eigen` · `qc-eig-real-matrix`** — "A real matrix, real eigenvalues?"
   - Steps: "The quarter-turn $\begin{pmatrix}0 & -1\\ 1 & 0\end{pmatrix}$ has only real entries." · "A real matrix must have real eigenvalues." · "Its characteristic equation is $\lambda^2 + 1 = 0$." · "So its eigenvalues are real."
   - `wrong: 1`. Why: $\lambda^2 + 1 = 0$ gives $\pm i$ — real entries, complex eigenvalues (`f4Rvals`).
2. **`f4-hermitian` · `qc-herm-needs-real-entries`** — "Hermitian means real entries?"
   - Steps: "$\begin{pmatrix}2 & i\\ -i & 2\end{pmatrix}$ has an $i$ in it." · "A Hermitian table needs real entries." · "So this table is not Hermitian." · "Its eigenvalues could be complex."
   - `wrong: 1`. Why: Hermitian needs $A_{ij} = A_{ji}^*$, not real entries; this one is Hermitian, eigenvalues $1, 3$ (`f4-h-realeig`).
3. **`f4-spectral` · `qc-sqrt-unique`** — "One square root"
   - Steps: "$\sigma_x^2 = I$." · "$\sigma_z^2 = I$ too." · "A matrix has one square root." · "So $\sigma_x = \sigma_z$."
   - `wrong: 2`. Why: squaring forgets each eigenvalue's sign, so $I$ has many square roots (`f4XsqIsI`, `f4ZsqIsI`).
4. **`f4-unitary` · `qc-unitary-real-eig`** — "Unitary eigenvalues"
   - Steps: "The phase gate $S = \mathrm{diag}(1, i)$ keeps lengths." · "A length-keeping table has eigenvalues of size 1." · "The only size-1 numbers are $+1$ and $-1$." · "So $S$'s eigenvalues are $\pm1$."
   - `wrong: 2`. Why: size-1 numbers fill the whole unit circle; $S$'s are $1$ and $i$ (`f4Svals`).
5. **`f4-commuting` · `qc-same-spectrum-commute`** — "Same stretches, shared directions?"
   - Steps: "$\sigma_x$ and $\sigma_z$ both have eigenvalues $+1, -1$." · "Same eigenvalues means the same directions." · "So they share an eigenbasis." · "So $\sigma_x\sigma_z = \sigma_z\sigma_x$."
   - `wrong: 1`. Why: equal spectra do not imply a shared basis; $[\sigma_x, \sigma_z] = -2i\sigma_y \ne 0$ (`f4XZcomm`).
6. **`f4-positive` · `qc-positive-is-projector`** — "Positive means projector?"
   - Steps: "$I + \tfrac12(X + Z)$ is Hermitian." · "Its eigenvalues $1.71$ and $0.29$ are both positive." · "A positive table is a projector." · "So it squares to itself."
   - `wrong: 2`. Why: a projector needs eigenvalues in $\{0, 1\}$; these are $1.71, 0.29$, so $A^2 \ne A$ (`f4PosNotProj`).

## 12. Questions for the judge

**Q1. Glossary ownership mechanism.** F4 is the canonical owner of eigenvalue/eigenvector/characteristic-equation/
Hermitian/spectral/unitary/degenerate, which Q2/Q3/Q8 already created as glossary ids. *Ask:* does F4 (a) REUSE the
existing ids and set only its own per-chapter `Beat.introduces` (the lint is per-chapter, so this is clean — my §5
assumes this), or (b) get fresh F4-namespaced entries with the Q entries bridging to them? *Recommend (a)*: reuse +
per-chapter introduces; the wiring pass adds Q→F bridges, no id duplication.

**Q2. No general eigensolver.** `cmat.eigh` is Hermitian-only; F4's non-Hermitian examples ($R = \pm i$, the defective
shear) are all 2×2 and use `operators.eigen2`. *Ask:* keep every non-Hermitian/defective example 2×2 (no new engine
function; my plan does this), or add a general/normal n×n eigensolver for richer examples? *Recommend:* keep 2×2; if a
later chapter needs normal-operator spectra, add it then with a `np.linalg.eig` twin.

**Q3. HW1 P5(c)/P4(a).** The map flags the Gram–Schmidt-onto-$S_x$-eigenvector proof as submitted homework. F4's one
touching item, `f4-h-gs`, is hints-only. *Ask:* keep it hints-only until the user says HW1 is past, then release the
walkthrough? *Recommend:* yes, as F1 handled its 448 homework item.

**Q4. Plotting eigenvalues on the complex plane.** F4.4 shows a unitary's eigenvalues on the unit circle. My plan uses
`complex-plane`'s existing `spokes` field (arrows to the eigenvalues); a tiny `points` convenience field would read more
directly as bare dots. *Ask:* accept `spokes` (no interface change), or add `points?: CNum[]` to `ComplexPlaneState`?
*Recommend:* `spokes` now; `points` only if F8 (roots of unity) also wants it.

**Q5. $Z\otimes Z$ before F6.** F4.1 b4 and F4.3 b4 use the 4×4 table $Z\otimes Z$ for degeneracy and the n-dimensional
spectral theorem, before F6 teaches $\otimes$. The beats treat it as a **given** 4×4 table (no $\otimes$ algebra), via
`pa('ZZ')`. *Ask:* accept this (a named example, as F1 forward-referenced $|{+}y\rangle$ via its bridge), or build the
n-dimensional example from a 3×3 `operator-space`/raw matrix instead (losing the clean block picture)? *Recommend:*
keep $Z\otimes Z$ as a given table; add a forward note "$\otimes$ is Chapter F6".
