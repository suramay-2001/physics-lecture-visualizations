/**
 * Chapter F3 scroll story, both tracks over one stage (plan: docs/roles/proposals/P-F3-story.md §1–§2; rulings
 * docs/roles/decisions/qc709-foundations.md, qc709-foundations-rulings.md).
 *
 * Rules kept here:
 * - An F chapter has no lecture notes: its own line is phase 'core' ("The foundation"), then 'books', then the clue.
 * - `text` is the Ground-up track (9th-grade start, ≤ 25 words per sentence), `formal` the Formal track (≤ 40).
 * - Matrices are row-major, $M[i][j] = \langle i|M|j\rangle$ (the engine's convention, `physics/linalg.ts`).
 * - Every number in the prose comes from F3.values.ts through a keyed claim.
 * - Ruling (qc709-nc.md #1): "Hermitian ⇒ real eigenvalues" is 448 L3 homework; F3 states the fact and cites the
 *   notes' page, with no derivation and no challenge (`f3-adjoint:b3`).
 *
 * Glossary reuse, not redefinition (build note): `qc-linear-operator`, `qc-outer-product` and `qc-unitary` are
 * already registered by Chapter Q2, and `qc-adjoint` by Chapter Q3 — `registerGloss` throws on a duplicate id. This
 * chapter's prose reuses those entries with `[[id|shown text]]` and does not mark them `Beat.introduces` (they are
 * not new to the course here). Likewise `qc-ket`, `qc-bra`, `qc-inner-product`, `qc-norm`, `qc-projection`,
 * `qc-orthonormal-basis` already exist (Q1/Q2) and are used the same way as plain link-backs.
 *
 * F2 and F4 bridges (brief-709-widgets-wiring Job 2, 2026-10-06): the two `f2-orthonormal` recaps and three
 * `f4-spectral` recaps below (written in words only, since F2 and F4 were being built in parallel and not yet on
 * this branch) are now real `<<id|…>>` bridges, registered in content/qc709/bridges.ts.
 */
import type { AmpSource, AmplitudesState, Beat, HilbertPlaneState, MatrixCoef, MatrixGateName, MatrixGridState, MatrixSource, Ref, StageLayout, StageState } from '../schema'
import { V, claim, close } from './F3.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan §0 "Stage shorthand"), as plain builder functions                          */
/* ---------------------------------------------------------------------------------------------- */

const mx = (source: MatrixSource, extra: Partial<Omit<MatrixGridState, 'kind' | 'source' | 'labels'>> = {}): MatrixGridState => ({
  kind: 'matrix',
  source,
  labels: 'kets',
  values: 'exact',
  shot: 'M-GRID',
  ...extra,
})
const gate = (name: MatrixGateName): MatrixSource => ({ gate: { name } })
const K = (label: string): AmpSource => ({ ket: label })
const out = (a: string, b?: string): MatrixSource => ({ outer: b === undefined ? [K(a)] : [K(a), K(b)] })
const prod = (...srcs: MatrixSource[]): MatrixSource => ({ product: srcs })
const adj = (src: MatrixSource): MatrixSource => ({ adjoint: src })
const lin = (...terms: [MatrixCoef, MatrixSource][]): MatrixSource => ({ lin: terms.map(([c, src]) => ({ c, src })) })
const hp = (s: Omit<HilbertPlaneState, 'kind' | 'shot'>): HilbertPlaneState => ({ kind: 'hilbert-plane', shot: 'H-FLAT', ...s })
const amp = (state: AmpSource, extra: Partial<Omit<AmplitudesState, 'kind' | 'state'>> = {}): AmplitudesState => ({ kind: 'amplitudes', state, shot: 'A-BARS', ...extra })
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

/** The x basis `{|+x⟩, |−x⟩}`, written as the `amplitudes`/`matrix` kinds' own ket vocabulary. */
const X_BASIS: AmpSource[] = [K('+'), K('-')]

export const axler = (where: string, adds: string): Ref => ({ source: 'axler', where, adds })
export const nc = (where: string, adds: string): Ref => ({ source: 'nc', where, adds })
export const notes = (where: string, adds: string): Ref => ({ source: 'lecture', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* Claims (keyed to F3.values.ts; see that file for the engine call behind each key)                */
/* ---------------------------------------------------------------------------------------------- */

export const C = {
  xPlusZ: claim('f3Xplusz', '$X|{+}z\\rangle = |{-}z\\rangle$: second entry 1', () => close(V.f3Xplusz, 1)),
  xMinusZ: claim('f3Xminusz', '$X|{-}z\\rangle = |{+}z\\rangle$: first entry 1', () => close(V.f3Xminusz, 1)),
  zMinusZ: claim('f3Zminusz', '$Z|{-}z\\rangle = -|{-}z\\rangle$', () => close(V.f3Zminusz, -1)),
  projZ: claim('f3ProjZ', '$|0\\rangle\\langle 0|$ applied to $(0.6, 0.8)$ drops the second part', () => close(V.f3ProjZ, 0)),
  identity: claim('f3Identity', '$I|{+}x\\rangle = |{+}x\\rangle$, first entry 0.7071', () => close(V.f3Identity, Math.SQRT1_2)),
  squareNonlinear: claim('f3SquareNonlinear', 'squaring $(2,0)\\to(4,0)$ quadruples, doubling $(1,0)\\to(2,0)$ only doubles: a gap of 2', () => close(V.f3SquareNonlinear, 2)),
  matX: claim('f3MatX', 'the (1,0) entry of $X$’s table is 1', () => close(V.f3MatX, 1)),
  actionHc: claim('f3ActionHc', '$H(0.6, 0.8)$, first entry 0.9899', () => close(V.f3ActionHc, 0.98994949366)),
  matH: claim('f3MatH', 'the one negative entry of $H$ is $-0.7071$', () => close(V.f3MatH, -Math.SQRT1_2)),
  xOuterSum: claim('f3XouterSum', '$|0\\rangle\\langle 1| + |1\\rangle\\langle 0|$ rebuilds $X$’s (0,1) entry, 1', () => close(V.f3XouterSum, 1)),
  xElemZmz: claim('f3XelemZmz', '$\\langle 0|X|1\\rangle = 1$', () => close(V.f3XelemZmz, 1)),
  hx: claim('f3HX', '$HX$’s (0,0) entry is 0.7071', () => close(V.f3HX, Math.SQRT1_2)),
  hxh: claim('f3HXH', '$HXH = Z$, so its (1,1) entry is $-1$', () => close(V.f3HXH, -1)),
  hzh: claim('f3HZH', '$HZH = X$, so its (0,1) entry is 1', () => close(V.f3HZH, 1)),
  xz: claim('f3XZ', '$XZ$’s (0,1) entry is $-1$', () => close(V.f3XZ, -1)),
  zx: claim('f3ZX', '$ZX$’s (0,1) entry is 1', () => close(V.f3ZX, 1)),
  xzEqNegZx: claim('f3XZeqNegZX', '$XZ = -ZX$', () => V.f3XZeqNegZX === 1),
  xsq: claim('f3Xsq', '$X^2 = I$, so its (0,0) entry is 1', () => close(V.f3Xsq, 1)),
  hsq: claim('f3Hsq', '$H^2 = I$, so its (0,0) entry is 1', () => close(V.f3Hsq, 1)),
  sdag: claim('f3Sdag', '$S^\\dagger = \\operatorname{diag}(1, -i)$', () => close(V.f3Sdag, -1)),
  sdagEntry: claim('f3SdagEntry', '$\\langle 1|S^\\dagger|1\\rangle = -i$', () => close(V.f3SdagEntry, -1)),
  prodDag: claim('f3ProdDag', '$(XZ)^\\dagger = ZX$', () => V.f3ProdDag === 1),
  outerDag: claim('f3OuterDag', '$(|0\\rangle\\langle 1|)^\\dagger = |1\\rangle\\langle 0|$', () => V.f3OuterDag === 1),
  hdag: claim('f3Hdag', '$H^\\dagger = H$', () => V.f3Hdag === 1),
  xdag: claim('f3Xdag', '$X^\\dagger = X$', () => V.f3Xdag === 1),
  sdagS: claim('f3SdagS', '$S^\\dagger S = I$, (0,0) entry 1', () => close(V.f3SdagS, 1)),
  sHermGap: claim('f3SHermGap', '$S^\\dagger \\ne S$', () => V.f3SHermGap === 0),
  yHerm: claim('f3YHerm', '$Y$ is Hermitian', () => V.f3YHerm === 1),
  ux: claim('f3Ux', '$U$ for z→x is $H$, (0,0) entry 0.7071', () => close(V.f3Ux, Math.SQRT1_2)),
  pluszInX: claim('f3PluszInX', '$|{+}z\\rangle$’s new coordinates start at 0.7071', () => close(V.f3PluszInX, Math.SQRT1_2)),
  innerPlusXZ: claim('f3InnerPlusXZ', '$\\langle{+}x|{+}z\\rangle = 0.7071$', () => close(V.f3InnerPlusXZ, Math.SQRT1_2)),
  zInX: claim('f3ZinX', '$Z$ in the x frame is $X$: (0,1) entry 1', () => close(V.f3ZinX, 1)),
  uUnitary: claim('f3Uunitary', '$U^\\dagger U = I$, (0,0) entry 1', () => close(V.f3Uunitary, 1)),
  xInX: claim('f3XinX', '$X$ in the x frame is $Z$: (0,0) entry 1', () => close(V.f3XinX, 1)),
}

/* ---------------------------------------------------------------------------------------------- */
/* f3-linear-maps — Machines that respect addition                                                  */
/* ---------------------------------------------------------------------------------------------- */

const linearMaps: Beat[] = [
  {
    id: 'f3-linear-maps:b1',
    phase: 'core',
    text:
      'A [[qc-linear-operator|linear map]] $A$ turns one state into another and respects addition and scaling. Add two states first, then apply $A$: you get the same as applying $A$ to each and adding. $A(a|\\psi_1\\rangle + b|\\psi_2\\rangle) = aA|\\psi_1\\rangle + bA|\\psi_2\\rangle$. A quantum gate is such a map.',
    formal:
      'A linear operator $A: V \\to W$ satisfies $A(a|\\psi_1\\rangle + b|\\psi_2\\rangle) = aA|\\psi_1\\rangle + bA|\\psi_2\\rangle$ (Axler §3A; N&C §2.1.2; notes n2 §I.D). On a [[qubit|qubit]], $X$ (the NOT gate) sends $|0\\rangle \\to |1\\rangle$ and $|1\\rangle \\to |0\\rangle$: $X|\\psi\\rangle$ is a linear image, not a probability read-off.',
    caption: 'apply $A$ to a sum = sum of the images',
    captionFormal: '$A(a|\\psi_1\\rangle + b|\\psi_2\\rangle) = aA|\\psi_1\\rangle + bA|\\psi_2\\rangle$',
    stage: hp({ psi: '+z', image: { named: 'sx', label: '$X|{+}z\\rangle$' } }),
    claims: [C.xPlusZ],
  },
  {
    id: 'f3-linear-maps:b2',
    phase: 'core',
    text:
      'Because $A$ respects sums, you only need to know where it sends each frame vector. Then $A$ on any state follows: write the state in the frame, apply $A$ to each piece, and add. Knowing $X|0\\rangle$ and $X|1\\rangle$ fixes $X$ everywhere, the same right-angled frame as always.',
    formal:
      'By linearity, $A$ is determined by its action on a basis: $A|\\psi\\rangle = \\sum_j c_j\\,A|e_j\\rangle$ for $|\\psi\\rangle = \\sum_j c_j|e_j\\rangle$ (Axler Eq. 3.5; N&C eq. 2.10). So $X|0\\rangle = |1\\rangle$ and $X|1\\rangle = |0\\rangle$ fix $X$ on all of ℂ², in the same [[qc-orthonormal-basis|orthonormal]] frame <<qc-f2-orthonormal|the vector chapter built>>.',
    caption: 'know $A$ on the frame, know it everywhere',
    captionFormal: '$A|\\psi\\rangle = \\sum_j c_j A|e_j\\rangle$',
    stage: split(hp({ psi: '+z', image: { named: 'sx' } }), amp(K('1'), { labels: 'bits' })),
    claims: [C.xPlusZ, C.xMinusZ],
  },
  {
    id: 'f3-linear-maps:b3',
    phase: 'core',
    text:
      'Three maps you already know are linear. $Z$ flips the sign of the down part: $Z|1\\rangle = -|1\\rangle$. A [[qc-projection|projection]] keeps only the part along one frame vector. And a rotation turns every arrow by the same angle, keeping lengths.',
    formal:
      '$Z = \\operatorname{diag}(1, -1)$ (a sign flip on $|1\\rangle$); the projector $|0\\rangle\\langle 0|$ keeps the $|0\\rangle$ part; a plane rotation $R_\\theta$ is [[orthogonal|orthogonal]] and length-preserving. All three are linear; a rotation and $Z$ are real, so the plane can draw their images.',
    caption: '$Z$, a projection, a rotation: all linear',
    captionFormal: '$Z|1\\rangle = -|1\\rangle$; $P_0 = |0\\rangle\\langle 0|$',
    stage: split(hp({ psi: { planeDeg: 30 }, image: { named: 'sz' } }), mx(out('0'))),
    claims: [C.zMinusZ, C.projZ],
  },
  {
    id: 'f3-linear-maps:b4',
    phase: 'books',
    text:
      'Two plainest maps: the identity $I$, which leaves every state alone, and the zero map, which sends every state to the zero state. Doing one map then another is their composition, written side by side, read right to left.',
    formal:
      'The identity operator $I|\\psi\\rangle = |\\psi\\rangle$ and the zero operator $0|\\psi\\rangle = 0$ are linear (N&C §2.1.2). Composition $BA$ means $B(A|\\psi\\rangle)$, applied right to left; it is again linear, and sets up the matrix product of the next unit.',
    caption: '$I|{+}x\\rangle = (0.7071, 0.7071)$: unchanged',
    stage: hp({ psi: { planeDeg: 30 }, image: { named: 'I' } }),
    refs: [nc('§2.1.2, p. 63', 'The identity and zero operators, and composition of linear operators.')],
    claims: [C.identity],
  },
  {
    id: 'f3-linear-maps:b5',
    phase: 'clue',
    text: 'Define a rule that squares each amplitude: $(a, b) \\mapsto (a^2, b^2)$. Is this a linear map?',
    formal: 'Is $(a, b) \\mapsto (a^2, b^2)$ linear on ℂ²?',
    stage: hp({ psi: { planeDeg: 0 } }),
    reveal: {
      text:
        'No. Linear means doubling the input doubles the output. But squaring doubles the input and quadruples the output: from $(1, 0)$ you get $(1, 0)$, and from $(2, 0)$ you get $(4, 0)$, not $(2, 0)$. Only maps that respect sums get a matrix.',
      formal:
        'Not linear: $A(2|\\psi\\rangle) = 4A|\\psi\\rangle \\ne 2A(|\\psi\\rangle)$ where $A(a,b) = (a^2, b^2)$. Squaring fails homogeneity, so it has no matrix (measurement chances $|c_i|^2$ are also nonlinear — read off a state, not applied to it, Chapter Q1).',
      caption: 'squaring: $(2,0) \\mapsto (4,0) \\ne 2\\cdot(1,0)$',
      stage: hp({
        others: [
          { ket: { planeDeg: 0 }, role: 'ghost', badge: '$(1,0)\\to(1,0)$' },
          { ket: { planeDeg: 0 }, role: 'ghost', badge: '$(2,0)\\to(4,0)$' },
        ],
      }),
      claims: [C.squareNonlinear],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f3-matrix-of-map — A map becomes a table: A_ij = ⟨i|A|j⟩                                         */
/* ---------------------------------------------------------------------------------------------- */

const matrixOfMap: Beat[] = [
  {
    id: 'f3-matrix-of-map:b1',
    phase: 'core',
    introduces: ['qc-matrix-of-map'],
    text:
      'To write a map as a table, send each frame vector through it and stack the results as columns. The entry in row $i$, column $j$ is $A_{ij} = \\langle i|A|j\\rangle$, the [[qc-matrix-of-map|matrix element]]. The building block $|i\\rangle\\langle j|$, a ket times a [[qc-bra|bra]], is an [[qc-outer-product|outer product]].',
    formal:
      'In an orthonormal basis, the matrix of $A$ has columns $A|e_j\\rangle$: $A_{ij} = \\langle e_i|A|e_j\\rangle$ (Axler Eq. 3.31; notes n2 §I.D.1). The outer product $|e_i\\rangle\\langle e_j|$ is the rank-one map sending $|e_j\\rangle \\to |e_i\\rangle$ (the engine’s `outer`); $X$ has columns $X|0\\rangle = |1\\rangle$, $X|1\\rangle = |0\\rangle$.',
    caption: 'column $j$ is $A$ applied to frame vector $j$',
    captionFormal: '$A_{ij} = \\langle e_i|A|e_j\\rangle$; $X = \\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$',
    stage: split(hp({ psi: '+z', image: { named: 'sx' } }), mx(gate('X'), { highlightCol: 0 })),
    claims: [C.matX],
  },
  {
    id: 'f3-matrix-of-map:b2',
    phase: 'core',
    text:
      'Once you have the table, applying the map is matrix times column: the new $i$th number is $\\sum_j A_{ij}c_j$. For $X$ this swaps the two numbers of a state. The table does the whole job; no need to go back to the map.',
    formal:
      '$f_i = \\langle e_i|A\\psi\\rangle = \\sum_j\\langle e_i|A|e_j\\rangle c_j = \\sum_j A_{ij}c_j$, that is $\\bar f = A\\bar c$ (notes n2 §I.D.1). For $X$, $(c_0, c_1) \\mapsto (c_1, c_0)$. Inserting completeness $\\sum_j|e_j\\rangle\\langle e_j| = I$ (<<qc-f2-orthonormal|the same completeness that fixes a vector’s own coordinates>>) between $A$ and $|\\psi\\rangle$ is the whole derivation.',
    caption: 'new number $i$ is $\\sum_j A_{ij} c_j$',
    captionFormal: '$\\bar f = A\\bar c$',
    stage: split(mx(gate('H')), amp({ dir: { thetaDeg: 106.26, phiDeg: 0 } }, { mode: 'amplitude' })),
    derivation: {
      result: 'f_i = \\sum_j A_{ij}c_j,\\ \\ A_{ij} = \\langle e_i|A|e_j\\rangle',
      ground: [
        {
          tex: '|\\psi\\rangle = \\sum_j c_j|e_j\\rangle',
          why: 'Write the state in the frame, its coordinates $c_j$.',
          view: amp({ dir: { thetaDeg: 106.26, phiDeg: 0 } }, { mode: 'amplitude' }),
          viewCaption: 'the state’s two coordinates',
        },
        {
          tex: 'A|\\psi\\rangle = \\sum_j c_j\\,A|e_j\\rangle',
          why: 'Apply $A$; linearity pulls it through the sum.',
          view: hp({ psi: { planeDeg: 53.13 }, image: { matrix: [['1/√2', '1/√2'], ['1/√2', '-1/√2']] } }),
          viewCaption: '$A$ applied to the state (a real $A$)',
        },
        {
          tex: 'f_i = \\langle e_i|A|\\psi\\rangle = \\sum_j\\langle e_i|A|e_j\\rangle c_j',
          why: 'Read off coordinate $i$ by taking $\\langle e_i|\\cdot\\rangle$.',
          view: mx(gate('H'), { highlightRow: 0 }),
          viewCaption: 'row $i$ of the table',
        },
        {
          tex: 'A_{ij} = \\langle e_i|A|e_j\\rangle',
          why: 'Name that overlap the matrix element.',
          view: mx(gate('H')),
          viewCaption: 'the full table',
        },
        {
          tex: 'f_i = \\sum_j A_{ij}c_j,\\ \\ A_{ij} = \\langle e_i|A|e_j\\rangle',
          why: 'The new coordinates are the table times the old, $\\bar f = A\\bar c$, with that same matrix element.',
        },
      ],
      formal: [
        {
          tex: 'f_i = \\langle e_i|A\\psi\\rangle = \\sum_j\\langle e_i|A|e_j\\rangle c_j',
          why: 'Insert completeness $\\sum_j|e_j\\rangle\\langle e_j| = I$.',
          view: mx(gate('H')),
        },
        { tex: '\\bar f = A\\bar c,\\ \\ A_{ij} = \\langle e_i|A|e_j\\rangle', why: 'The matrix is the operator written in coordinates.', view: amp({ dir: { thetaDeg: 106.26, phiDeg: 0 } }, { mode: 'amplitude' }) },
      ],
    },
    claims: [C.actionHc],
  },
  {
    id: 'f3-matrix-of-map:b3',
    phase: 'core',
    text:
      'Three maps, three tables. $X$ swaps, so its table has 1s off the diagonal. $Z$ flips the down sign, so its table is $\\operatorname{diag}(1, -1)$. $H$, the Hadamard, sends $|0\\rangle$ to $|{+}x\\rangle$ and $|1\\rangle$ to $|{-}x\\rangle$: every entry is $\\pm1/\\sqrt2$.',
    formal:
      '$X = \\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$, $Z = \\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix}$, $H = \\tfrac1{\\sqrt2}\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}$ (the notes’ z→x map). A cell’s size is $|A_{ij}|$ and its hue the entry’s phase; these are all real, so no hue shows.',
    caption: 'the tables of $X$, $Z$, $H$',
    captionFormal: '$H = \\tfrac1{\\sqrt2}\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}$',
    stage: mx(gate('H')),
    claims: [C.matX, C.matH],
    fidelity: ['qc-matrix-entries'],
  },
  {
    id: 'f3-matrix-of-map:b4',
    phase: 'books',
    text:
      'A table is the same as a sum of ket-bras: add $A_{ij}|i\\rangle\\langle j|$ over every row and column. Each $|i\\rangle\\langle j|$ puts its number in one cell. This is how the notes write an operator, and why the outer product is the matrix’s building block.',
    formal:
      '$A = \\sum_{ij} A_{ij}|e_i\\rangle\\langle e_j|$ (notes n2 §I.D.1). For $X$: $|0\\rangle\\langle 1| + |1\\rangle\\langle 0|$. This is the inverse of reading off entries, and rebuilds $A$ from the outer products, using the completeness relation.',
    caption: '$X = |0\\rangle\\langle 1| + |1\\rangle\\langle 0|$',
    stage: mx(lin(['+1', out('0', '1')], ['+1', out('1', '0')])),
    refs: [notes('709 notes n2, p. 10', 'An operator written as a sum $\\hat A = \\sum_{ij} A_{ij}|e_i\\rangle\\langle e_j|$.')],
    claims: [C.xOuterSum],
  },
  {
    id: 'f3-matrix-of-map:b5',
    phase: 'clue',
    text: 'In the table of $X$, what is the entry in row $|0\\rangle$, column $|1\\rangle$, that is $\\langle 0|X|1\\rangle$?',
    formal: 'Compute $\\langle 0|X|1\\rangle$ and $\\langle 0|X|0\\rangle$.',
    stage: mx(gate('X'), { values: 'none' }),
    reveal: {
      text:
        'It is 1: $X$ sends $|1\\rangle$ to $|0\\rangle$, so the overlap with $\\langle 0|$ is 1. The diagonal entry $\\langle 0|X|0\\rangle$ is 0, because $X|0\\rangle = |1\\rangle$ has no $|0\\rangle$ part. A table entry is one map, read between two frame vectors.',
      formal: '$\\langle 0|X|1\\rangle = \\langle 0|0\\rangle = 1$ and $\\langle 0|X|0\\rangle = \\langle 0|1\\rangle = 0$. Every entry is such a sandwich; this is the definition $A_{ij} = \\langle e_i|A|e_j\\rangle$, read backwards.',
      caption: '$\\langle 0|X|1\\rangle = 1$, $\\langle 0|X|0\\rangle = 0$',
      stage: mx(gate('X'), { highlight: [[0, 1]] }),
      claims: [C.xElemZmz],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f3-products — One map then another: matrix products                                              */
/* ---------------------------------------------------------------------------------------------- */

const products: Beat[] = [
  {
    id: 'f3-products:b1',
    phase: 'core',
    introduces: ['qc-matrix-product'],
    text:
      'Do map $T$ then map $S$. The table of the combined map is the [[qc-matrix-product|matrix product]] $ST$, with entry $(ST)_{jk} = \\sum_r S_{jr}T_{rk}$: row $j$ of $S$ against column $k$ of $T$. The product is defined this exact way so it matches doing one map after the other.',
    formal:
      'Matrix multiplication is chosen to make $\\mathcal M(ST) = \\mathcal M(S)\\mathcal M(T)$ hold (Axler Eq. 3.41 and Eq. 3.81): $(ST)_{jk} = \\sum_r S_{jr}T_{rk}$ (the engine’s `matmul`). The number of columns of $S$ must equal the rows of $T$.',
    caption: '$(ST)_{jk} = \\sum_r S_{jr}T_{rk}$',
    captionFormal: '$\\mathcal M(ST) = \\mathcal M(S)\\mathcal M(T)$',
    stage: mx(prod(gate('H'), gate('X'))),
    derivation: {
      result: '(ST)_{jk} = \\sum_r S_{jr}T_{rk},\\ \\ HXH = Z',
      ground: [
        { tex: '(ST)|e_k\\rangle = S\\big(T|e_k\\rangle\\big)', why: 'Doing $T$ then $S$ means feed $T$’s output into $S$.', view: mx(gate('X')), viewCaption: 'the inner map $T = X$' },
        { tex: 'T|e_k\\rangle = \\sum_r T_{rk}|e_r\\rangle', why: 'Column $k$ of $T$ is its list of components.', view: mx(gate('X'), { highlightCol: 0 }), viewCaption: 'column $k$ of $T$' },
        {
          tex: 'S\\big(\\sum_r T_{rk}|e_r\\rangle\\big) = \\sum_{j,r} S_{jr}T_{rk}|e_j\\rangle',
          why: 'Apply $S$ to each term and collect by the output vector.',
          view: mx(prod(gate('H'), gate('X'))),
          viewCaption: 'the product $HX$',
        },
        { tex: '(ST)_{jk} = \\sum_r S_{jr}T_{rk}', why: 'Row $j$ of $S$ dotted with column $k$ of $T$ gives the new entry.' },
        {
          tex: 'HXH = Z',
          why: 'Multiply the three tables this way; working it out collapses to $Z$.',
          view: mx(prod(gate('H'), gate('X'), gate('H'))),
          viewCaption: 'the sandwich resolves to $Z$',
        },
      ],
      formal: [
        { tex: '(ST)_{jk} = \\sum_r S_{jr}T_{rk}', why: 'Chosen so $\\mathcal M(ST) = \\mathcal M(S)\\mathcal M(T)$ (Axler Eq. 3.41).', view: mx(prod(gate('H'), gate('X'))) },
        { tex: 'HXH = Z', why: 'A direct product; since $H^2 = I$, this also gives $HZH = X$.', view: mx(prod(gate('H'), gate('X'), gate('H'))) },
      ],
    },
    claims: [C.hx, C.hxh],
  },
  {
    id: 'f3-products:b2',
    phase: 'core',
    text:
      'Sandwich $X$ between two Hadamards: $HXH$. Working the product out gives $Z$. So flipping x-up and x-down (that is $X$) looks, after the Hadamard change, exactly like flipping the sign of the down state ($Z$). The same move wears two faces.',
    formal:
      '$HXH = Z$ (and $HZH = X$, since $H^2 = I$): a direct product, $H\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}H = \\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix}$. This previews change of basis, the chapter’s next idea: $H$ is the z→x map, so $X$ in the x frame is $Z$.',
    caption: '$HXH = Z$',
    captionFormal: '$HXH = Z$, $HZH = X$',
    stage: mx(prod(gate('H'), gate('X'), gate('H'))),
    claims: [C.hxh, C.hzh],
  },
  {
    id: 'f3-products:b3',
    phase: 'core',
    text:
      'Order matters. Do $Z$ then $X$ and you do not get the same table as $X$ then $Z$. In fact $XZ = -ZX$: swapping the order flips every sign. Two gates that do not commute cannot be measured together sharply, a fact Chapter Q3 builds on.',
    formal:
      '$XZ = \\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}$ and $ZX = \\begin{pmatrix}0&1\\\\-1&0\\end{pmatrix}$, so $XZ = -ZX$ (they anticommute; matrix multiplication is not commutative). The commutator $[X, Z] = XZ - ZX = -2ZX \\ne 0$; Chapter Q3 owns commutators and uncertainty.',
    caption: '$XZ$ and $ZX$ differ by a sign',
    captionFormal: '$XZ = -ZX$',
    stage: mx(prod(gate('X'), gate('Z'))),
    claims: [C.xz, C.zx, C.xzEqNegZx],
  },
  {
    id: 'f3-products:b4',
    phase: 'books',
    text:
      'The identity table $I$ has 1s on the diagonal and leaves any table alone: $AI = IA = A$. A map that can be undone has an inverse $A^{-1}$ with $AA^{-1} = I$. $X$ undoes itself, $X^2 = I$, and so does $H$: $H^2 = I$.',
    formal:
      '$I = \\operatorname{diag}(1, 1)$ (Axler Eq. 3.79); $A$ is invertible if some $A^{-1}$ gives $AA^{-1} = A^{-1}A = I$ (Axler Eq. 3.80), and $(AC)^{-1} = C^{-1}A^{-1}$. Both $X$ and $H$ are involutions: $X^2 = H^2 = I$, so each is its own inverse.',
    caption: '$X^2 = I$, $H^2 = I$: each undoes itself',
    captionFormal: '$AA^{-1} = I$; $(AC)^{-1} = C^{-1}A^{-1}$',
    stage: mx(prod(gate('H'), gate('H'))),
    refs: [axler('3.79–3.80, pp. 90–91', 'The identity matrix and the inverse of an invertible linear map.')],
    claims: [C.xsq, C.hsq],
  },
  {
    id: 'f3-products:b5',
    phase: 'clue',
    text: 'You apply $H$, then $Z$, then $H$ again. What single gate does the whole sequence equal?',
    formal: 'Simplify $HZH$.',
    stage: mx(gate('Z')),
    reveal: {
      text:
        'It equals $X$, the NOT gate. Because $HXH = Z$ and $H$ undoes itself, the sandwich with $Z$ in the middle gives $X$. Three gates collapse to one: this is exactly the change of frame of the next unit.',
      formal: '$HZH = X$ (apply $H^2 = I$ to $HXH = Z$). So the Hadamard trades $X$ and $Z$: $Z$ seen in the x frame is $X$, the chapter’s next unit.',
      caption: '$HZH = X$',
      stage: mx(prod(gate('H'), gate('Z'), gate('H'))),
      claims: [C.hzh],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f3-adjoint — The mirror of a map: A†                                                              */
/* ---------------------------------------------------------------------------------------------- */

const adjoint: Beat[] = [
  {
    id: 'f3-adjoint:b1',
    phase: 'core',
    text:
      'Every map $A$ has a mirror, its [[qc-adjoint|adjoint]] $A^\\dagger$. In a right-angled frame you get it by two moves: swap rows and columns, then conjugate every entry. It is the map that lets you move $A$ from the ket side to the [[qc-bra|bra]] side of an [[qc-inner-product|inner product]].',
    formal:
      'The adjoint $A^\\dagger$ is the unique operator with $\\langle\\varphi|A\\psi\\rangle = \\langle A^\\dagger\\varphi|\\psi\\rangle$ for all $\\varphi, \\psi$ (N&C eq. 2.32). In an orthonormal basis its matrix is the conjugate transpose, $\\langle i|A^\\dagger|j\\rangle = \\langle j|A|i\\rangle^*$ (Axler Eq. 7.7 and Eq. 7.9; the engine’s `dagger`): $A^\\dagger = (A^*)^{\\mathrm{T}}$.',
    caption: 'swap rows/columns, then conjugate',
    captionFormal: '$\\langle\\varphi|A\\psi\\rangle = \\langle A^\\dagger\\varphi|\\psi\\rangle$; $A^\\dagger = (A^*)^{\\mathrm{T}}$',
    stage: mx(gate('S')),
    derivation: {
      result: '\\langle i|A^\\dagger|j\\rangle = \\langle j|A|i\\rangle^*,\\ \\ A^\\dagger = (A^*)^{\\mathrm{T}}',
      ground: [
        { tex: '\\langle\\varphi|A\\psi\\rangle = \\langle A^\\dagger\\varphi|\\psi\\rangle', why: 'The adjoint is the map that moves $A$ to the bra side.', view: mx(gate('S')), viewCaption: 'the map $A = S$' },
        {
          tex: '\\langle e_i|A^\\dagger|e_j\\rangle = \\langle Ae_i|e_j\\rangle = \\langle e_j|Ae_i\\rangle^*',
          why: 'Put frame vectors in and conjugate-flip the inner product.',
          view: mx(gate('S'), { highlight: [[1, 1]] }),
          viewCaption: 'the entry $\\langle 1|A|1\\rangle = i$',
        },
        {
          tex: '\\langle e_i|A^\\dagger|e_j\\rangle = A_{ji}^*',
          why: 'So the $(i, j)$ entry of $A^\\dagger$ is the conjugate of the $(j, i)$ entry of $A$.',
          view: mx(adj(gate('S')), { highlight: [[1, 1]] }),
          viewCaption: 'the mirrored entry $-i$',
        },
        { tex: 'A^\\dagger = (A^*)^{\\mathrm{T}}', why: 'Swap rows and columns, then conjugate: the conjugate transpose.' },
      ],
      formal: [
        { tex: '\\langle i|A^\\dagger|j\\rangle = \\langle j|A|i\\rangle^*', why: 'Follows from $\\langle\\varphi|A\\psi\\rangle = \\langle A^\\dagger\\varphi|\\psi\\rangle$ in an orthonormal basis (Axler Eq. 7.9).', view: mx(gate('S')) },
        { tex: 'A^\\dagger = (A^*)^{\\mathrm{T}}', why: 'The conjugate transpose (N&C eq. 2.34); the recipe needs orthonormality.', view: mx(adj(gate('S'))) },
      ],
    },
    claims: [C.sdag, C.sdagEntry],
    fidelity: ['qc-matrix-hue-is-phase'],
  },
  {
    id: 'f3-adjoint:b2',
    phase: 'core',
    text:
      'The mirror obeys tidy rules. Mirroring twice returns the original: $(A^\\dagger)^\\dagger = A$. Mirroring a product reverses the order: $(AB)^\\dagger = B^\\dagger A^\\dagger$. And a ket-bra flips: $(|w\\rangle\\langle v|)^\\dagger = |v\\rangle\\langle w|$.',
    formal:
      '$(A^\\dagger)^\\dagger = A$; $(AB)^\\dagger = B^\\dagger A^\\dagger$; $(|w\\rangle\\langle v|)^\\dagger = |v\\rangle\\langle w|$; the adjoint is antilinear, $(\\sum_i a_iA_i)^\\dagger = \\sum_i a_i^*A_i^\\dagger$ (N&C §2.1.6, Eq. 2.13–2.15). Check: $(XZ)^\\dagger = Z^\\dagger X^\\dagger = ZX$.',
    caption: 'mirror a product, reverse the order',
    captionFormal: '$(AB)^\\dagger = B^\\dagger A^\\dagger$',
    stage: mx(adj(prod(gate('X'), gate('Z')))),
    claims: [C.prodDag, C.outerDag],
  },
  {
    id: 'f3-adjoint:b3',
    phase: 'core',
    text:
      'Two maps have special mirrors. A [[qc-hermitian|Hermitian]] map equals its own mirror, $A^\\dagger = A$; the Pauli gates $X$, $Y$, $Z$ and $H$ are Hermitian. A [[qc-unitary|unitary]] map’s mirror is its inverse, $U^\\dagger = U^{-1}$; every quantum gate is unitary, which is why it keeps every length.',
    formal:
      'Hermitian (self-adjoint): $A^\\dagger = A$ — $X$, $Y$, $Z$, $H$; these are the observables. Unitary: $U^\\dagger U = I$, so $U^\\dagger = U^{-1}$ — every gate, preserving $\\langle\\psi|\\psi\\rangle$ (N&C §2.1.6; notes n2 p. 9). A Hermitian operator has real eigenvalues and an orthonormal eigenbasis; the notes prove the reality on p. 15, and <<qc-f4-spectral|Chapter F4 states and uses it>>.',
    caption: 'Hermitian: $A^\\dagger = A$; unitary: $U^\\dagger = U^{-1}$',
    captionFormal: '$X^\\dagger = X$; $U^\\dagger U = I$',
    stage: mx(adj(gate('H'))),
    claims: [C.hdag, C.xdag, C.sdagS],
  },
  {
    id: 'f3-adjoint:b4',
    phase: 'books',
    text:
      'The swap-and-conjugate recipe for the mirror only works in a right-angled frame. In a skewed frame the mirror is not the conjugate transpose of the table, and a unitary’s mirror is not its table inverse. This is why the course always works in [[qc-orthonormal-basis|orthonormal]] frames.',
    formal:
      "Axler's caution (Eq. 7.9): with respect to a non-orthonormal basis, the matrix of $A^\\dagger$ is **not** the conjugate transpose of the matrix of $A$. The adjoint is basis-free (fixed by the [[qc-inner-product|inner product]]); only the conjugate-transpose *recipe* needs orthonormality.",
    caption: 'the conjugate-transpose recipe needs an orthonormal frame',
    stage: mx(adj(gate('H'))),
    refs: [axler('7.9, p. 232', 'A caution: in a non-orthonormal basis, the matrix of the adjoint is not the conjugate transpose of the original matrix.')],
  },
  {
    id: 'f3-adjoint:b5',
    phase: 'clue',
    text: 'The phase gate $S$ has table $\\operatorname{diag}(1, i)$. Is it Hermitian? Is it unitary?',
    formal: 'For $S = \\operatorname{diag}(1, i)$, is $S^\\dagger = S$? Is $S^\\dagger S = I$?',
    stage: mx(gate('S')),
    reveal: {
      text: 'Not Hermitian: its mirror is $\\operatorname{diag}(1, -i)$, with the corner conjugated, not the same as $S$. But it is unitary: mirror times itself is the identity, so $S$ keeps every length. Unitary does not mean self-mirror.',
      formal: '$S^\\dagger = \\operatorname{diag}(1, -i) \\ne S$, so $S$ is not Hermitian; but $S^\\dagger S = \\operatorname{diag}(1, -i)\\operatorname{diag}(1, i) = I$, so $S$ is unitary. Its eigenvalues $1, i$ lie on the unit circle, as a unitary’s must.',
      caption: '$S^\\dagger \\ne S$, but $S^\\dagger S = I$',
      stage: mx(adj(gate('S'))),
      claims: [C.sdag, C.sdagS, C.sHermGap],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f3-change-of-basis — The same map in a new frame: UAU†                                          */
/* ---------------------------------------------------------------------------------------------- */

const changeOfBasis: Beat[] = [
  {
    id: 'f3-change-of-basis:b1',
    phase: 'core',
    introduces: ['qc-change-of-basis'],
    text:
      'Switch to a new [[qc-orthonormal-basis|orthonormal]] frame and a state’s coordinates change by one table, the [[qc-change-of-basis|change-of-basis matrix]] $U$. Its entry $U_{ij} = \\langle\\alpha\'_i|\\alpha_j\\rangle$ is the overlap of a new frame vector $\\alpha\'_i$ with an old one $\\alpha_j$, and the new coordinates are $d = Uc$.',
    formal:
      'For orthonormal frames, $U_{ij} = \\langle\\alpha\'_i|\\alpha_j\\rangle$ gives the new coordinates $d = Uc$ (notes n2 §I.C.4; the engine’s `changeU`). The z→x change is $U = H$: $|{+}z\\rangle$ has new coordinates $U(1, 0) = (1/\\sqrt2, 1/\\sqrt2)$, that is $|{+}z\\rangle = (|{+}x\\rangle + |{-}x\\rangle)/\\sqrt2$.',
    caption: 'new coordinates $d = Uc$, $U_{ij} = \\langle\\alpha\'_i|\\alpha_j\\rangle$',
    captionFormal: 'z→x: $U = H$, $U(1,0) = (1/\\sqrt2, 1/\\sqrt2)$',
    stage: split(mx(gate('H')), amp(K('0'), { labels: 'bits' })),
    derivation: {
      result: 'U_{ij} = \\langle\\alpha\'_i|\\alpha_j\\rangle,\\ \\ d = Uc,\\ \\ A\' = UAU^\\dagger',
      ground: [
        { tex: 'd_i = \\langle\\alpha\'_i|\\psi\\rangle', why: 'The new coordinate is the overlap with a new frame vector.', view: mx(gate('H')), viewCaption: '$U = H$ for z→x' },
        {
          tex: 'd_i = \\sum_j\\langle\\alpha\'_i|\\alpha_j\\rangle c_j = \\sum_j U_{ij}c_j',
          why: 'Expand the state in the old frame; name the overlaps $U_{ij}$.',
          view: amp(K('0'), { labels: 'bits' }),
          viewCaption: '$|0\\rangle$’s new coordinates $U(1,0)$',
        },
        {
          tex: 'A\'_{kl} = \\langle\\alpha\'_k|A|\\alpha\'_l\\rangle = \\sum_{ij}\\langle\\alpha\'_k|\\alpha_i\\rangle A_{ij}\\langle\\alpha_j|\\alpha\'_l\\rangle',
          why: 'Insert completeness once on each side of $A$.',
          view: mx(gate('Z')),
          viewCaption: 'the old table $A = Z$',
        },
        {
          tex: 'A\'_{kl} = \\sum_{ij} U_{ki}A_{ij}U^*_{lj}',
          why: 'The overlaps are $U$ and its conjugate, so $A\' = UAU^\\dagger$.',
          view: mx(gate('Z'), { basis: X_BASIS }),
          viewCaption: '$Z$ redrawn in the x frame = $X$',
        },
        { tex: 'd = Uc,\\ \\ A\' = UAU^\\dagger', why: 'Coordinates move by $U$; operators are sandwiched by $U$ and $U^\\dagger$.' },
      ],
      formal: [
        { tex: 'd = Uc,\\ \\ U_{ij} = \\langle\\alpha\'_i|\\alpha_j\\rangle', why: 'The overlaps of the two orthonormal frames (notes n2).', view: mx(gate('H')) },
        { tex: 'A\' = UAU^\\dagger', why: 'Completeness inserted twice; drawn as $B^\\dagger A B$, with $U = B^\\dagger$.', view: mx(gate('Z'), { basis: X_BASIS }) },
      ],
    },
    claims: [C.ux, C.pluszInX],
  },
  {
    id: 'f3-change-of-basis:b2',
    phase: 'core',
    text:
      'A map’s table changes too: the new table is $UAU^\\dagger$. You undo the frame, apply the map, redo the frame. The map itself is unchanged; only its description in numbers moves. Lengths, the determinant and the trace all stay the same.',
    formal:
      'An operator transforms as $A\' = UAU^\\dagger$ (notes n2 §I.C.4; derived by inserting completeness twice, $A\'_{kl} = \\sum_{ij}\\langle k\'|i\\rangle A_{ij}\\langle j|l\'\\rangle = \\sum_{ij}U_{ki}A_{ij}U^*_{lj}$). The `matrix` stage draws this as $B^\\dagger A B$ with $B$ the new frame’s columns, so $U = B^\\dagger$ — the notes’ $\\hat U\\hat A\\hat U^\\dagger$ and the stage’s $B^\\dagger A B$ are the same object, written two ways.',
    caption: 'the new table is $UAU^\\dagger$',
    captionFormal: 'Rosetta: notes’ $\\hat U\\hat A\\hat U^\\dagger$ = the stage’s $B^\\dagger A B$, $U = B^\\dagger$',
    stage: mx(gate('Z'), { basis: X_BASIS }),
    claims: [C.zInX],
    fidelity: ['qc-matrix-basis-change'],
  },
  {
    id: 'f3-change-of-basis:b3',
    phase: 'core',
    text:
      'Here is the punchline. The sign-flip $Z$, written in the x frame, is exactly the swap $X$. Measuring spin along z, seen by someone using the x frame, looks like a spin along x. The machine is one machine; the frame decides which table you see.',
    formal:
      '$UZU^\\dagger = HZH = X$: $Z$ in the x basis is $X$ (consistent with $HXH = Z$, the products unit). This is why the "same" observable can look different in rotated frames, <<qc-f4-spectral|a fact Chapter F4 carries forward to the spectral theorem>>.',
    caption: '$Z$ in the x frame is $X$',
    captionFormal: '$UZU^\\dagger = HZH = X$',
    stage: mx(gate('Z'), { basis: X_BASIS }),
    claims: [C.zInX, C.hzh],
  },
  {
    id: 'f3-change-of-basis:b4',
    phase: 'books',
    text:
      'The change-of-basis table is always [[qc-unitary|unitary]]: its mirror is its inverse, $U^\\dagger U = I$. This is because both frames are right-angled; the proof uses completeness. So changing frames never stretches a state, and changing back with $U^\\dagger$ returns it.',
    formal:
      '$U^\\dagger U = I$ (notes n2 p. 9): $[U^\\dagger U]_{ij} = \\sum_k\\langle\\alpha\'_i|\\alpha_k\\rangle\\langle\\alpha_k|\\alpha\'_j\\rangle = \\langle\\alpha\'_i|\\alpha\'_j\\rangle = \\delta_{ij}$, using completeness $\\sum_k|\\alpha_k\\rangle\\langle\\alpha_k| = I$. The two change-of-basis matrices (old→new and new→old) are inverses (Axler Eq. 3.82).',
    caption: '$U^\\dagger U = I$: changing frames keeps lengths',
    stage: mx(prod(adj(gate('H')), gate('H'))),
    refs: [notes('709 notes n2, p. 9', 'The change-of-basis matrix is unitary.'), axler('3.82, p. 92', 'The two change-of-basis matrices between a pair of bases are inverses.')],
    claims: [C.uUnitary],
  },
  {
    id: 'f3-change-of-basis:b5',
    phase: 'clue',
    text: 'You just saw $Z$ in the x frame is $X$. What does $X$ itself look like in the x frame?',
    formal: 'Compute $UXU^\\dagger = HXH$.',
    stage: mx(gate('X')),
    reveal: {
      text:
        'It is $Z$. In the x frame, the swap $X$ becomes the sign-flip $Z$: the two trade places. A frame where $X$ is diagonal is the x frame, and there $X$ just flips the sign of x-down. The pair $X, Z$ are mirror images under the Hadamard.',
      formal:
        '$UXU^\\dagger = HXH = Z$ (the products unit). In its own eigenframe, $X = \\operatorname{diag}(1, -1)$: its eigenvalues $\\pm1$ on the diagonal, $|{\\pm}x\\rangle$ as the frame. This diagonalization is <<qc-f4-spectral|Chapter F4’s spectral theorem>>.',
      caption: '$X$ in the x frame is $Z$',
      stage: mx(gate('X'), { basis: X_BASIS }),
      claims: [C.hxh, C.xInX],
    },
  },
]

export const F3_STORY: Record<string, Beat[]> = {
  'f3-linear-maps': linearMaps,
  'f3-matrix-of-map': matrixOfMap,
  'f3-products': products,
  'f3-adjoint': adjoint,
  'f3-change-of-basis': changeOfBasis,
}
