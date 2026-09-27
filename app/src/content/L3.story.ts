/**
 * Lecture 3 scroll story (owner: P). Beats per docs/roles/proposals/P-L3-story.md §1, with the judge's rulings:
 * L3 keeps pp. 14–17 (units 3.5 and 3.6 say "taught at the start of Lecture 4"); every operator-space state uses
 * `labels: 'plain'` (no σ before Lecture 4); the stage additions G1 (`image`), G2 (`project` / `renormalize`) and
 * G3 (the `spread` readout) are used instead of the plan's fallbacks. The notes' |↑⟩, |↓⟩ are written |+z⟩, |−z⟩
 * (Rosetta in l3-operators:b2). Â is never called a measurement device (notes erratum E2).
 *
 * Rules kept here (as in L1/L2.story.ts):
 * - Stage states carry physics inputs only; the resolver computes every probability. Numbers in the prose come
 *   from L3.values.ts and are backed by keyed claims.
 * - Clue beats are click-to-reveal: `text` is the question, `reveal` the reasoning.
 * - Core text: ≤ 25 words per sentence, symbols defined before use (content/symbols.test.ts).
 */
import type { Beat, HilbertPlaneState, LabBench, LabDevice, LabState, OperatorState, PlaneOp, Ref, StageKind, StageLayout, StageState, TermTarget } from './schema'
import type { Anchor } from './stageVocab'
import { V, claim, close, d, pct, uf } from './L3.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const t = (kind: StageKind, anchor: Anchor): TermTarget => ({ kind, anchor })
const main = (source: LabBench['source'], devices: LabDevice[], showPrep = false): LabBench =>
  showPrep ? { id: 'main', source, devices, showPrep } : { id: 'main', source, devices }
const lab = (bench: LabBench, extra: Omit<LabState, 'kind' | 'benches'> = {}): LabState => ({ kind: 'lab-r3', benches: [bench], ...extra })
const plane = (s: Omit<HilbertPlaneState, 'kind'>): HilbertPlaneState => ({ kind: 'hilbert-plane', shot: 'H-FLAT', ...s })
/** Operator space before the Pauli matrices exist: always the plain passport (judge ruling). */
const op = (s: Omit<OperatorState, 'kind' | 'labels'>): OperatorState => ({ kind: 'operator-space', labels: 'plain', ...s })
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })
const m2 = (a: string, b: string, c: string, e: string): [[string, string], [string, string]] => [
  [a, b],
  [c, e],
]

const Z: LabDevice = { axis: 'z' }
const X: LabDevice = { axis: 'x' }
const Zkeep: LabDevice = { axis: 'z', keep: '+' }
const Xkeep: LabDevice = { axis: 'x', keep: '+' }
const sweep = (from: number, to: number) => ({ from, to })

const SWAP_IMG: PlaneOp & { label: string } = { matrix: m2('0', '1', '1', '0'), label: '$\\hat A|\\psi\\rangle$' }
const M_IMG: PlaneOp & { label: string } = { matrix: m2('2', '1', '1', '2'), label: '$\\hat M|\\psi\\rangle$' }
const R_IMG: PlaneOp & { label: string } = { matrix: m2('0', '-1', '1', '0'), label: '$\\hat R|\\psi\\rangle$' }
const SZ_IMG: PlaneOp & { label: string } = { named: 'Sz', label: '$\\hat S_z|\\psi\\rangle$' }
const H_OP = { matrix: m2('1', '-2i', '2i', '-1') }
const at60 = { planeDeg: 60 }

const susskind = (where: string, adds: string): Ref => ({ source: 'susskind', where, adds })
const townsend = (where: string, adds: string): Ref => ({ source: 'townsend', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* l3-operators — Operators: machines that turn states into states                                */
/* ---------------------------------------------------------------------------------------------- */

const operators: Beat[] = [
  {
    id: 'l3-operators:b1',
    phase: 'lecture',
    text: 'A state like $|{+x}\\rangle$ is a [[superposition]] of up and down, yet each atom gives {{one|one definite reading}}. Measuring also changes the state. Our question: for a state $|\\psi\\rangle$, what does the theory say a measurement will show?',
    caption: `$|{+x}\\rangle$ atoms meet an SG$_z$ magnet: each lands in one spot, and over many atoms ${uf(V.l3XonZPlus)} land in each`,
    stage: lab(main('+x', [Z], true), { flow: 'single', deposit: 'build', shot: 'L-WIDE' }),
    terms: { one: t('lab-r3', 'tracked-atom') },
    claims: [
      claim('l3XonZPlus', '|+x⟩ along z: ½ in the + spot', () => close(V.l3XonZPlus, 0.5)),
      claim('l3XonZMinus', '|+x⟩ along z: ½ in the − spot', () => close(V.l3XonZMinus, 0.5)),
    ],
  },
  {
    id: 'l3-operators:b2',
    phase: 'lecture',
    text: 'Last lecture a state became a vector, $|\\psi\\rangle = c_+|{+z}\\rangle + c_-|{-z}\\rangle$, with amplitudes $c_\\pm$; the notes write $|{\\uparrow}\\rangle, |{\\downarrow}\\rangle$ and $c_\\uparrow, c_\\downarrow$. A [[linear-operator|linear operator]] $\\hat A$ turns every state vector into another: $\\hat A\\htmlClass{term-psi}{|\\psi\\rangle} = \\htmlClass{term-img}{|\\phi\\rangle}$. [[linearity|Linear]] means sums and multiples pass straight through, for any numbers $c_1, c_2$: $\\hat A(c_1|\\psi_1\\rangle + c_2|\\psi_2\\rangle) = c_1\\hat A|\\psi_1\\rangle + c_2\\hat A|\\psi_2\\rangle$.',
    caption: 'the swap operator: each image is its arrow reflected across the 45° line',
    stage: plane({ psi: { planeDeg: sweep(10, 80) }, image: SWAP_IMG, basis: 'z' }),
    terms: { psi: t('hilbert-plane', 'psi'), img: t('hilbert-plane', 'image') },
    claims: [
      claim('l3SwapMirror', 'the swap sends the arrow at t to the arrow at 90° − t (t = 10°, 20°, 45°, 80°)', () => close(V.l3SwapMirror, 1)),
      claim('l3SwapIsSigmaX', 'the swap is the matrix Lecture 4 names σx', () => V.l3SwapIsSigmaX === 1),
    ],
  },
  {
    id: 'l3-operators:b3',
    phase: 'lecture',
    text: 'So an operator is fixed by what it does to the two basis states. If $\\hat A|{+z}\\rangle = \\htmlClass{term-img}{|\\phi_+\\rangle}$ and $\\hat A|{-z}\\rangle = |\\phi_-\\rangle$, then $\\hat A|\\psi\\rangle = c_+|\\phi_+\\rangle + c_-|\\phi_-\\rangle$ for every state. The swap sends $|{+z}\\rangle$ to $|{-z}\\rangle$ and back, so it just trades $\\htmlClass{term-cp}{c_+}$ and $\\htmlClass{term-cm}{c_-}$.',
    caption: 'the swap trades the two {{sh|shadows}}: the image has the same two parts, in the other order',
    stage: plane({ psi: { planeDeg: 25 }, image: SWAP_IMG, basis: 'z', shadows: true }),
    terms: { img: t('hilbert-plane', 'image'), cp: t('hilbert-plane', 'shadow-1'), cm: t('hilbert-plane', 'shadow-2'), sh: t('hilbert-plane', 'shadow-1') },
    claims: [claim('l3SwapUpDown', 'the swap sends |+z⟩ to |−z⟩ and |−z⟩ to |+z⟩', () => V.l3SwapUpDown === 1)],
  },
  {
    id: 'l3-operators:b4',
    phase: 'lecture',
    text: 'In the $z$ basis a state is a column $\\begin{pmatrix}c_+\\\\c_-\\end{pmatrix}$, and an operator is a 2×2 [[matrix-representation|matrix]] $A$, written without the hat. Then $\\hat A|\\psi\\rangle$ is matrix times column, and each entry is a [[matrix-element|matrix element]] $A_{ij} = \\langle i|\\hat A|j\\rangle$, for basis states $\\htmlClass{term-bi}{|i\\rangle}$ and $\\htmlClass{term-bj}{|j\\rangle}$. Column $j$ lists the parts of $\\hat A|j\\rangle$: for the swap, column 1 is $\\begin{pmatrix}0\\\\1\\end{pmatrix}$.',
    caption: '$A = \\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$: column 1 is where $|{+z}\\rangle$ lands, on the $|{-z}\\rangle$ axis',
    stage: plane({ psi: '+z', image: { ...SWAP_IMG, label: '$\\hat A|{+z}\\rangle$' }, basis: 'z', rightAngle: true }),
    terms: { bi: t('hilbert-plane', 'basis-1'), bj: t('hilbert-plane', 'basis-2') },
    claims: [
      claim('l3SwapA11', 'A₁₁ = ⟨+z|Â|+z⟩ = 0 for the swap', () => close(V.l3SwapA11, 0)),
      claim('l3SwapA21', 'A₂₁ = ⟨−z|Â|+z⟩ = 1 for the swap', () => close(V.l3SwapA21, 1)),
    ],
  },
  {
    id: 'l3-operators:b5',
    phase: 'books',
    text: 'Susskind (§3.1.1) pictures an operator as a machine, after Wheeler: a state goes in, another comes out, and three rules make it linear. Townsend (§2.2, pp. 34–35) gives a machine with physical meaning: turning a spin 90° about $y$ sends $\\htmlClass{term-before}{|{+z}\\rangle}$ to $|{+x}\\rangle$. That turn is something done to the atom; it is not a measurement.',
    caption: 'a 90° turn in the lab is a {{arc|45° turn}} in [[state-space|state space]]',
    stage: plane({ psi: '+x', others: [{ ket: '+z', role: 'ghost', badge: 'before the turn' }], arc: true }),
    terms: { before: t('hilbert-plane', 'ghost'), arc: t('hilbert-plane', 'angle-arc') },
    fidelity: ['plane-half-angles'],
    refs: [
      susskind('§3.1.1', 'The machine picture and its three rules. Every input gives one output; a multiple of the input gives the same multiple of the output; a sum gives the sum.'),
      townsend('§2.2, pp. 34–35 (Fig. 2.1)', 'A rotation operator as an example of an operator that changes the physical state. Operators act on kets, not on the numbers in front of them.'),
    ],
    claims: [
      claim('l3TurnYIsX', 'a 90° turn about y sends |+z⟩ to |+x⟩ exactly', () => V.l3TurnYIsX === 1),
      claim('l3TurnYUp', 'its |+z⟩ part is 1/√2 = 0.707', () => close(V.l3TurnYUp, Math.SQRT1_2)),
    ],
  },
  {
    id: 'l3-operators:b6',
    phase: 'clue',
    text: 'Is $|{+x}\\rangle$ *the* column $\\tfrac{1}{\\sqrt2}\\begin{pmatrix}1\\\\1\\end{pmatrix}$?',
    stage: plane({ psi: '+x', basis: 'z', shadows: true, ticks: true }),
    reveal: {
      text: 'Only in the $z$ basis. Against the $x$ basis the same arrow has parts 1 and 0, so there its column is $\\begin{pmatrix}1\\\\0\\end{pmatrix}$. The state and the operator stay fixed; only their columns and matrices depend on the basis (Lecture 5 changes bases in full).',
      caption: 'same arrow, new frame: {{s1|shadows}} 1 and 0',
      stage: plane({ psi: '+x', basis: 'x', shadows: true }),
      terms: { s1: t('hilbert-plane', 'shadow-1') },
      claims: [
        claim('l3XinX1', '|+x⟩ in the x basis: first part 1', () => close(V.l3XinX1, 1)),
        claim('l3XinX2', '|+x⟩ in the x basis: second part 0', () => close(V.l3XinX2, 0)),
        claim('l3ZXOverlap', 'in the z basis: ⟨+z|+x⟩ = 0.707', () => close(V.l3ZXOverlap, Math.SQRT1_2)),
        claim('l3MZXOverlap', 'in the z basis: ⟨−z|+x⟩ = 0.707', () => close(V.l3MZXOverlap, Math.SQRT1_2)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l3-eigen — Directions an operator only stretches                                               */
/* ---------------------------------------------------------------------------------------------- */

const eigen: Beat[] = [
  {
    id: 'l3-eigen:b1',
    phase: 'lecture',
    text: 'Most arrows come out of $\\hat A$ pointing somewhere new. An [[eigenvector]] $\\htmlClass{term-a}{|a\\rangle}$ stays on its own line, $\\hat A|a\\rangle = \\htmlClass{term-aa}{a|a\\rangle}$: it is only stretched, shrunk or flipped by the number $a$, its [[eigenvalue]]. For $M = \\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$, $|{+x}\\rangle$ is tripled, $|{-x}\\rangle$ is left as it is, and $|{+z}\\rangle$ is turned.',
    caption: 'the {{img|image}} lines up with the arrow only at 45° (stretched ×3) and at 135° (×1)',
    stage: plane({ psi: { planeDeg: sweep(0, 180) }, image: M_IMG }),
    terms: { a: t('hilbert-plane', 'psi'), aa: t('hilbert-plane', 'image'), img: t('hilbert-plane', 'image') },
    claims: [
      claim('l3MStretchPlus', 'M|+x⟩ = 3|+x⟩', () => close(V.l3MStretchPlus, 3) && V.l3MXEigen === 1),
      claim('l3MStretchMinus', 'M|−x⟩ = |−x⟩', () => close(V.l3MStretchMinus, 1) && V.l3ChMMinusX === 1),
      claim('l3MXEigen', '|±x⟩ are eigenvectors of M', () => V.l3MXEigen === 1),
      claim('l3MTurnsUp', 'M turns |+z⟩ off its line: M|+z⟩ = (2, 1)', () => V.l3MTurnsUp === 1 && close(V.l3MUpImage, 2) && close(V.l3MUpImage2, 1)),
      claim('l3MEigTop', 'the eigenvalues of M are 3 …', () => close(V.l3MEigTop, 3)),
      claim('l3MEigLow', '… and 1', () => close(V.l3MEigLow, 1)),
    ],
  },
  {
    id: 'l3-eigen:b2',
    phase: 'lecture',
    text: 'Spin along $z$ has the matrix $S_z = \\tfrac{\\hbar}{2}\\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix}$, and $\\hat S_z$ is its operator. Multiplying out gives $\\hat S_z|{+z}\\rangle = \\htmlClass{term-ep}{+\\tfrac{\\hbar}{2}}|{+z}\\rangle$ and $\\hat S_z|{-z}\\rangle = \\htmlClass{term-em}{-\\tfrac{\\hbar}{2}}|{-z}\\rangle$. So $|{\\pm z}\\rangle$ are its eigenvectors, with eigenvalues $\\pm\\tfrac{\\hbar}{2}$.',
    caption: 'operator space: the {{arrow|arrow}}’s length is half the gap between the eigenvalues, and the {{gauge|gauge}} shows their midpoint (here 0)',
    stage: op({ op: { named: 'Sz' }, eigen: true, gauge: true, shot: 'O-STD' }),
    terms: { ep: t('operator-space', 'eigen-plus'), em: t('operator-space', 'eigen-minus'), arrow: t('operator-space', 'arrow-a'), gauge: t('operator-space', 'gauge-a0') },
    fidelity: ['op-sigma-later'],
    claims: [
      claim('l3SzEigUp', 'the eigenvalues of Ŝz are +ħ/2 …', () => close(V.l3SzEigUp, 0.5)),
      claim('l3SzEigDown', '… and −ħ/2', () => close(V.l3SzEigDown, -0.5)),
      claim('l3SzUp', 'Ŝz|+z⟩ = +ħ/2 |+z⟩', () => close(V.l3SzUp, 0.5)),
      claim('l3SzDown', 'Ŝz|−z⟩ = −ħ/2 |−z⟩', () => close(V.l3SzDown, -0.5)),
      claim('l3SzArrow', 'the arrow is ħ/2 long: half the gap between ±ħ/2', () => close(V.l3SzArrow, (V.l3SzEigUp - V.l3SzEigDown) / 2)),
      claim('l3SzGauge', 'the gauge reads 0, the midpoint', () => close(V.l3SzGauge, (V.l3SzEigUp + V.l3SzEigDown) / 2)),
    ],
  },
  {
    id: 'l3-eigen:b3',
    phase: 'lecture',
    text: 'The [[hermitian-conjugate|Hermitian conjugate]] $A^\\dagger$ is the matrix with every entry [[complex-conjugate|complex-conjugated]], then rows and columns swapped (the [[transpose]]). An operator with $\\hat A^\\dagger = \\hat A$ is [[hermitian|Hermitian]]. Three facts, taken without proof: its eigenvalues are real, eigenvectors with different eigenvalues are [[orthogonal]], and they can form a complete [[orthonormal-basis|orthonormal basis]].',
    caption: `$H = \\begin{pmatrix}1&-2i\\\\2i&-1\\end{pmatrix}$ has complex entries, yet $H^\\dagger = H$; its eigenvalues are $\\pm\\sqrt5 \\approx \\pm${d(V.l3HEigPlus)}$. Its two eigen-points sit opposite on the {{gs|ghost sphere}}, as orthogonal states do.`,
    stage: op({ op: H_OP, eigen: true, gauge: true }),
    terms: { gs: t('operator-space', 'ghost-sphere') },
    fidelity: ['op-ghost-sphere'],
    claims: [
      claim('l3HHerm', 'H† = H', () => V.l3HHerm === 1),
      claim('l3HEigPlus', 'the eigenvalues of H are +√5 = 2.236 …', () => close(V.l3HEigPlus, Math.sqrt(5))),
      claim('l3HEigMinus', '… and −√5', () => close(V.l3HEigMinus, -Math.sqrt(5))),
      claim('l3HArrowY', 'H = 2·(y part) + 1·(z part), gauge 0: arrow length √5', () => close(V.l3HArrowY, 2) && close(V.l3HArrowZ, 1) && close(V.l3HGauge, 0)),
      claim('l3HEigOrth', 'the two eigenvectors of H are orthogonal', () => close(V.l3HEigOrth, 0)),
    ],
  },
  {
    id: 'l3-eigen:b4',
    phase: 'lecture',
    text: 'Back to the magnet. The two eigenvectors of $\\hat S_z$ are the states of the two beams leaving an SG$_z$ magnet, and its eigenvalues $\\pm\\tfrac{\\hbar}{2}$ are the two readings. The algebra and the experiment line up exactly.',
    caption: `two {{sp|spots}} ↔ two {{ep|eigenvalues}}, with ${uf(V.l3OvenZPlus)} of the oven’s atoms in each; two beams ↔ two eigenvectors`,
    stage: split(lab(main('oven', [Z]), { shot: 'L-PLATE' }), op({ op: { named: 'Sz' }, eigen: true })),
    terms: { sp: t('lab-r3', 'spot-plus'), ep: t('operator-space', 'eigen-plus') },
    claims: [
      claim('l3OvenZPlus', 'the oven beam splits ½ / ½ along z', () => close(V.l3OvenZPlus, 0.5)),
      claim('l3SzVectors', 'the eigenvectors of Ŝz are |+z⟩ and |−z⟩', () => V.l3SzVectors === 1),
    ],
  },
  {
    id: 'l3-eigen:b5',
    phase: 'lecture',
    text: 'Send any state $|\\psi\\rangle = c_+|{+z}\\rangle + c_-|{-z}\\rangle$, with $|c_+|^2 + |c_-|^2 = 1$, into SG$_z$. A theory of measurement must say which results can appear, how likely each is, and what state is left. Experiment already answers: $\\pm\\tfrac{\\hbar}{2}$; $\\htmlClass{term-b1}{|c_+|^2}$ and $\\htmlClass{term-b2}{|c_-|^2}$; and $|{+z}\\rangle$ or $|{-z}\\rangle$.',
    caption: `three questions: outcomes, odds, and the state afterward. For the arrow at 60° the odds are ${uf(V.l3P60Up)} and ${uf(V.l3P60Down)}.`,
    stage: plane({ psi: { planeDeg: sweep(0, 90) }, basis: 'z', shadows: true }),
    terms: { b1: t('hilbert-plane', 'bar-1'), b2: t('hilbert-plane', 'bar-2') },
    claims: [
      claim('l3BornSum', 'the two z probabilities add to 1 at every angle', () => close(V.l3BornSum, 1)),
      claim('l3P60Up', 'at 60°: P(+) = ¼', () => close(V.l3P60Up, 0.25)),
      claim('l3P60Down', 'at 60°: P(−) = ¾', () => close(V.l3P60Down, 0.75)),
    ],
  },
  {
    id: 'l3-eigen:b6',
    phase: 'books',
    text: 'Susskind proves in a few lines that the eigenvalues are real (§3.1.4), and he makes the orthonormal basis of eigenvectors a fundamental theorem (§3.1.5). Townsend (§2.4, p. 50) shows why the matrix test works: $(A^\\dagger)_{ij} = A_{ji}^*$. So a Hermitian matrix has real diagonal entries, and entries mirrored across the diagonal are conjugates.',
    caption: '$H_{12} = -2i$ and $H_{21} = +2i$: mirror images, conjugated',
    stage: op({ op: H_OP, eigen: true, gauge: true }),
    fidelity: ['op-hermitian-only'],
    refs: [
      susskind('§3.1.3–3.1.5', 'The Hermitian conjugate, a short proof that Hermitian eigenvalues are real, and the orthonormal eigenbasis. His principles make observables Hermitian as a result; the notes build it into the rule, and the rules agree.'),
      townsend('§2.4, p. 50 (eq. 2.80); §2.2, p. 36', 'The adjoint as the transpose conjugate, entry by entry, and why the operator that generates rotations must be Hermitian.'),
    ],
    claims: [
      claim('l3HUpDownIm', 'H₁₂ = ⟨+z|Ĥ|−z⟩ = −2i', () => close(V.l3HUpDownIm, -2)),
      claim('l3HDownUpIm', 'H₂₁ = ⟨−z|Ĥ|+z⟩ = +2i, the conjugate', () => close(V.l3HDownUpIm, -V.l3HUpDownIm)),
      claim('l3HDiagReal', 'the diagonal entries of H are real', () => V.l3HDiagReal === 1 && V.l3HHerm === 1),
      claim('l3HHerm', 'H† = H', () => V.l3HHerm === 1),
    ],
  },
  {
    id: 'l3-eigen:b7',
    phase: 'clue',
    text: 'Every operator has a matrix. Could $\\hat R$, with $R = \\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}$, stand for something we measure?',
    stage: plane({ psi: { planeDeg: sweep(0, 180) }, image: R_IMG }),
    reveal: {
      text: 'No. $\\hat R$ turns every real arrow a quarter turn, so no real direction stays on its line. Its eigenvectors are $|{\\pm y}\\rangle$, with eigenvalues $\\mp i$: not real numbers, so no meter can show them, and indeed $R^\\dagger \\neq R$. Townsend (§2.2) meets this $\\hat R$ as a 180° turn of a spin about $y$.',
      caption: 'every {{img|image}} is a quarter turn ahead of its arrow',
      terms: { img: t('hilbert-plane', 'image') },
      fidelity: ['plane-image-not-state', 'plane-sign-twice'],
      claims: [
        claim('l3RHerm', 'R is not Hermitian', () => V.l3RHerm === 0),
        claim('l3RIsTurn', 'R is the 180° turn about y', () => V.l3RIsTurn === 1),
        claim('l3RYPlusIm', '⟨+y|R̂|+y⟩ = −i', () => close(V.l3RYPlusIm, -1)),
        claim('l3RYMinusIm', '⟨−y|R̂|−y⟩ = +i', () => close(V.l3RYMinusIm, 1)),
        claim('l3RYSame', 'R̂|+y⟩ is the same state as |+y⟩', () => V.l3RYSame === 1),
        claim('l3REigIm', 'the eigenvalues of R are ±i', () => close(V.l3REigIm, 1) && close(V.l3REigRe, 0)),
        claim('l3RNoRealEigen', 'no sampled real arrow stays on its line under R', () => V.l3RNoRealEigen === 1),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l3-projectors — Projectors keep one part of a state                                            */
/* ---------------------------------------------------------------------------------------------- */

const projectors: Beat[] = [
  {
    id: 'l3-projectors:b1',
    phase: 'lecture',
    text: 'To isolate one piece of a state, define the [[projector]] $\\hat P_{+z} = |{+z}\\rangle\\langle{+z}|$ (the notes’ $P_\\uparrow$). On any state it keeps the $|{+z}\\rangle$ part and drops the rest: $\\htmlClass{term-pr}{\\hat P_{+z}|\\psi\\rangle} = |{+z}\\rangle\\langle{+z}|\\psi\\rangle = c_+|{+z}\\rangle$. The kept amplitude is the overlap $c_+ = \\langle{+z}|\\psi\\rangle$.',
    caption: 'for $|\\psi_{60}\\rangle = \\tfrac12|{+z}\\rangle + \\tfrac{\\sqrt3}{2}|{-z}\\rangle$: $\\hat P_{+z}|\\psi_{60}\\rangle = \\tfrac12|{+z}\\rangle$, the {{sh|shadow}} drawn as a {{pv|vector}}',
    stage: plane({ psi: at60, basis: 'z', shadows: true, project: 1 }),
    terms: { pr: t('hilbert-plane', 'projection'), sh: t('hilbert-plane', 'shadow-1'), pv: t('hilbert-plane', 'projection') },
    claims: [
      claim('l3PuP60', 'P̂₊|ψ₆₀⟩ = ½|+z⟩', () => close(V.l3PuP60, 0.5) && close(V.l3PuP60Rest, 0)),
      claim('l3PuP60Rest', 'and nothing along |−z⟩', () => close(V.l3PuP60Rest, 0)),
      claim('l3C60Up', 'c₊ = ⟨+z|ψ₆₀⟩ = ½', () => close(V.l3C60Up, 0.5)),
    ],
  },
  {
    id: 'l3-projectors:b2',
    phase: 'lecture',
    text: 'Project a second time and nothing changes: the shadow of a shadow is itself. In symbols, $\\hat P_{+z}^2 = \\hat P_{+z}$; the projector is [[idempotent]]. A projector is a filter, not a turn.',
    caption: '$\\hat P_{+z}\\hat P_{+z}|\\psi_{60}\\rangle = \\tfrac12|{+z}\\rangle$ again: the {{pv|projected vector}} stays put',
    stage: plane({ psi: at60, basis: 'z', project: 1 }),
    terms: { pv: t('hilbert-plane', 'projection') },
    claims: [
      claim('l3PuIdem', 'P̂₊² = P̂₊', () => V.l3PuIdem === 1),
      claim('l3PuTwice', 'P̂₊P̂₊|ψ₆₀⟩ = ½|+z⟩', () => close(V.l3PuTwice, 0.5)),
    ],
  },
  {
    id: 'l3-projectors:b3',
    phase: 'lecture',
    text: 'The two projectors rebuild any state: $(\\hat P_{+z} + \\hat P_{-z})|\\psi\\rangle = |\\psi\\rangle$, so $\\hat P_{+z} + \\hat P_{-z} = \\hat 1$, the [[identity-operator|identity]]. This [[completeness-relation|completeness relation]] holds in every complete orthonormal basis $\\{|a_i\\rangle\\}$: $\\sum_i |a_i\\rangle\\langle a_i| = \\hat 1$. Inserting $\\hat 1$ gives $|\\psi\\rangle = \\sum_i \\htmlClass{term-ci}{c_i}|a_i\\rangle$ with $c_i = \\langle a_i|\\psi\\rangle$.',
    caption: `in the $x$ basis: $\\htmlClass{term-s1}{c_{+x}} \\approx ${d(V.l3CxPlus)}$ and $\\htmlClass{term-s2}{c_{-x}} \\approx -${d(V.l3CxMinusSize)}$; the two shadows still add up to $|\\psi_{60}\\rangle$`,
    stage: plane({ psi: at60, basis: 'x', shadows: true }),
    terms: { ci: t('hilbert-plane', 'shadow-1'), s1: t('hilbert-plane', 'shadow-1'), s2: t('hilbert-plane', 'shadow-2') },
    claims: [
      claim('l3ComplZ', 'P̂₊z + P̂₋z = 1̂', () => V.l3ComplZ === 1),
      claim('l3ComplX', 'P̂₊x + P̂₋x = 1̂', () => V.l3ComplX === 1),
      claim('l3CxPlus', 'c₊x = ⟨+x|ψ₆₀⟩ = 0.966', () => close(V.l3CxPlus, (0.5 + Math.sqrt(3) / 2) / Math.SQRT2)),
      claim('l3CxMinus', 'c₋x = ⟨−x|ψ₆₀⟩ is negative …', () => V.l3CxMinus < 0 && close(-V.l3CxMinus, V.l3CxMinusSize)),
      claim('l3CxMinusSize', '… of size 0.259', () => close(V.l3CxMinusSize, (Math.sqrt(3) / 2 - 0.5) / Math.SQRT2)),
      claim('l3Rebuild', 'c₊x|+x⟩ + c₋x|−x⟩ rebuilds |ψ₆₀⟩', () => close(V.l3Rebuild, 0, 1e-12)),
    ],
  },
  {
    id: 'l3-projectors:b4',
    phase: 'lecture',
    text: 'Weight each projector by its reading: $\\hat S_z = \\tfrac{\\hbar}{2}\\hat P_{+z} - \\tfrac{\\hbar}{2}\\hat P_{-z}$. In general $\\hat A = \\sum_i a_i|a_i\\rangle\\langle a_i|$, its [[spectral-decomposition|spectral decomposition]], and $\\hat A|a_j\\rangle = a_j|a_j\\rangle$ because $\\langle a_i|a_j\\rangle$ is 1 for $i = j$ and 0 otherwise. An [[observable]] bundles two lists: the {{st|states}} a device tells apart, and the {{num|number}} it reports for each.',
    caption: '$\\tfrac{\\hbar}{2}\\hat P_{+z}$ plus $-\\tfrac{\\hbar}{2}\\hat P_{-z}$: the {{arrow|arrows}} add up to $\\hat S_z$, and the {{gauge|gauges}} cancel to 0',
    stage: op({ op: { a0: V.l3HalfPuA0, a: [0, 0, V.l3HalfPuAz] }, add: { a0: V.l3HalfPdA0, a: [0, 0, V.l3HalfPdAz] }, eigen: true, gauge: true, shot: 'O-GAUGE' }),
    terms: { st: t('operator-space', 'eigen-plus'), num: t('operator-space', 'eigen-plus'), arrow: t('operator-space', 'arrow-a'), gauge: t('operator-space', 'gauge-a0') },
    fidelity: ['op-sum', 'op-projector-point'],
    claims: [
      claim('l3HalfPuA0', '(ħ/2)P̂₊z: gauge ħ/4 …', () => close(V.l3HalfPuA0, 0.25)),
      claim('l3HalfPuAz', '… and an arrow ħ/4 up', () => close(V.l3HalfPuAz, 0.25)),
      claim('l3HalfPdA0', '−(ħ/2)P̂₋z: gauge −ħ/4 …', () => close(V.l3HalfPdA0, -0.25)),
      claim('l3HalfPdAz', '… and an arrow ħ/4 up: the arrows add to ħ/2, the gauges cancel', () => close(V.l3HalfPdAz, 0.25) && close(V.l3HalfPuA0 + V.l3HalfPdA0, 0)),
      claim('l3SpecSz', '(ħ/2)P̂₊z − (ħ/2)P̂₋z = Ŝz', () => V.l3SpecSz === 1),
      claim('l3PuA0', 'a projector sits at gauge ½ …', () => close(V.l3PuA0, 0.5)),
      claim('l3PuAz', '… with an arrow of length ½', () => close(V.l3PuAz, 0.5)),
    ],
  },
  {
    id: 'l3-projectors:b5',
    phase: 'books',
    text: 'Townsend (§2.3, pp. 41–43) builds these from hardware. A magnet whose two beams are merged again, with nothing recorded, acts as $\\hat 1$. {{blk|Block}} one path and it acts as a projector: $|{+z}\\rangle$ passes (eigenvalue 1) and $|{-z}\\rangle$ is stopped (eigenvalue 0).',
    caption: `block the − path: ${uf(V.l3BlockBlocked)} of the $|{+x}\\rangle$ atoms stop, and every survivor reads + again (the merged-beam device is not drawn)`,
    stage: lab(main('+x', [Zkeep, Z], true), { readouts: ['blocked'], shot: 'L-3Q' }),
    terms: { blk: t('lab-r3', 'beam-stop') },
    fidelity: ['lab-block-projects', 'lab-merge-not-drawn'],
    refs: [
      townsend('§2.3, pp. 41–43 (Fig. 2.4); §2.4, p. 48', 'The identity and the projection operators, built as Stern–Gerlach devices with merged or blocked beams. The matrix of a projector, and completeness as a matrix identity.'),
    ],
    claims: [
      claim('l3BlockBlocked', '½ of the |+x⟩ atoms are stopped', () => close(V.l3BlockBlocked, 0.5)),
      claim('l3BlockPlus', 'the other ½ land in the + spot', () => close(V.l3BlockPlus, 0.5)),
      claim('l3BlockMinus', 'none land in the − spot', () => close(V.l3BlockMinus, 0)),
      claim('l3PuEigTop', 'P̂₊z has eigenvalues 1 …', () => close(V.l3PuEigTop, 1)),
      claim('l3PuEigLow', '… and 0', () => close(V.l3PuEigLow, 0)),
      claim('l3PuKillsDown', 'P̂₊z|−z⟩ = 0', () => close(V.l3PuKillsDown, 0)),
    ],
  },
  {
    id: 'l3-projectors:b6',
    phase: 'clue',
    text: '$\\hat P_{+z}|\\psi_{60}\\rangle = \\tfrac12|{+z}\\rangle$. Is that a state an atom could be in?',
    stage: plane({ psi: at60, basis: 'z', project: 1 }),
    reveal: {
      text: 'Not yet: its length is $\\tfrac12$, and a state must have length 1. Rescaled to length 1 it is $|{+z}\\rangle$, which is what the surviving atoms carry. The squared length, $\\tfrac14$, is the share that survives; the next unit turns this into rules.',
      caption: 'the {{pv|projected vector}} grows back to length 1: the state of the atoms that pass',
      stage: plane({ psi: at60, basis: 'z', project: 1, renormalize: true }),
      terms: { pv: t('hilbert-plane', 'projection') },
      fidelity: ['plane-update-bookkeeping'],
      claims: [
        claim('l3PuP60Len', '|P̂₊z ψ₆₀| = ½', () => close(V.l3PuP60Len, 0.5)),
        claim('l3PuP60Renorm', 'rescaled, it is |+z⟩', () => V.l3PuP60Renorm === 1),
        claim('l3PuP60Exp', 'its squared length is ¼ = ⟨ψ₆₀|P̂₊z|ψ₆₀⟩', () => close(V.l3PuP60Exp, 0.25) && close(V.l3PuP60Exp, V.l3PuP60Len ** 2)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l3-postulates — Three rules for every measurement                                              */
/* ---------------------------------------------------------------------------------------------- */

const postulates: Beat[] = [
  {
    id: 'l3-postulates:b1',
    phase: 'lecture',
    text: 'Let $\\hat A|a_i\\rangle = a_i|a_i\\rangle$, and expand the state in that eigenbasis: $|\\psi\\rangle = \\sum_i c_i|a_i\\rangle$ with $c_i = \\langle a_i|\\psi\\rangle$. **Rule 1:** an [[projective-measurement|ideal measurement]] of $A$ returns one of the eigenvalues $\\htmlClass{term-ai}{a_i}$. The state may be a superposition, but the record is always a single $a_i$.',
    caption: 'one atom, one {{sp|spot}}: $+\\tfrac{\\hbar}{2}$ or $-\\tfrac{\\hbar}{2}$, never in between',
    stage: lab(main('+x', [Z], true), { flow: 'single', shot: 'L-PLATE' }),
    terms: { ai: t('lab-r3', 'spot-plus'), sp: t('lab-r3', 'spot-plus') },
    claims: [
      claim('l3SzEigUp', 'the eigenvalues of Ŝz are +ħ/2 …', () => close(V.l3SzEigUp, 0.5)),
      claim('l3SzEigDown', '… and −ħ/2', () => close(V.l3SzEigDown, -0.5)),
      claim('l3XonZPlus', '|+x⟩ atoms land ½ in each spot', () => close(V.l3XonZPlus, 0.5)),
    ],
  },
  {
    id: 'l3-postulates:b2',
    phase: 'lecture',
    text: '**Rule 2**, the [[born-rule|Born rule]]: $P(a_i) = |\\langle a_i|\\psi\\rangle|^2 = \\htmlClass{term-bar}{|c_i|^2}$. Since $|c_i|^2 = \\langle\\psi|a_i\\rangle\\langle a_i|\\psi\\rangle$, this is a projector [[sandwich]], $P(a_i) = \\langle\\psi|\\hat P_i|\\psi\\rangle$ with $\\hat P_i = |a_i\\rangle\\langle a_i|$. For $|\\psi_{60}\\rangle$ along $z$: $P(+\\tfrac{\\hbar}{2}) = \\tfrac14$ and $P(-\\tfrac{\\hbar}{2}) = \\tfrac34$.',
    caption: `shadow ${uf(V.l3C60Up)} → probability ${uf(V.l3P60Up)}; shadow $\\tfrac{\\sqrt3}{2}$ → probability ${uf(V.l3P60Down)} (a hat marks an operator, parentheses a probability)`,
    stage: plane({ psi: at60, basis: 'z', shadows: true }),
    terms: { bar: t('hilbert-plane', 'bar-1') },
    claims: [
      claim('l3P60Up', 'P(+) = |⟨+z|ψ₆₀⟩|² = ¼', () => close(V.l3P60Up, 0.25)),
      claim('l3PuP60Exp', 'the sandwich ⟨ψ₆₀|P̂₊z|ψ₆₀⟩ gives the same ¼', () => close(V.l3PuP60Exp, V.l3P60Up)),
      claim('l3P60Down', 'P(−) = ¾', () => close(V.l3P60Down, 0.75)),
      claim('l3C60Up', 'the + shadow is ½', () => close(V.l3C60Up, 0.5)),
    ],
  },
  {
    id: 'l3-postulates:b3',
    phase: 'lecture',
    text: 'Add the probabilities of every outcome: $\\sum_i\\langle\\psi|\\hat P_i|\\psi\\rangle = \\langle\\psi|\\hat 1|\\psi\\rangle = 1$. Because the state has length 1, [[completeness-relation|completeness]] makes the odds of all the possible results add to exactly one.',
    caption: `turn the state any way: the two {{bars|bars}} always fill exactly 1 (at 60°: ${d(V.l3P60PlusX)} + ${d(V.l3P60MinusX)})`,
    stage: plane({ psi: { planeDeg: sweep(0, 180) }, basis: 'x', shadows: true }),
    terms: { bars: t('hilbert-plane', 'bar-1') },
    claims: [
      claim('l3XBarsSum', 'the two x probabilities add to 1 at every angle', () => close(V.l3XBarsSum, 1)),
      claim('l3P60PlusX', 'at 60°: P(+x) = 0.933 …', () => close(V.l3P60PlusX, (2 + Math.sqrt(3)) / 4)),
      claim('l3P60MinusX', '… and P(−x) = 0.067', () => close(V.l3P60MinusX, (2 - Math.sqrt(3)) / 4)),
    ],
  },
  {
    id: 'l3-postulates:b4',
    phase: 'lecture',
    text: '**Rule 3:** if $a_i$ is found, the state becomes the [[normalized]] projection $\\htmlClass{term-pi}{\\hat P_i|\\psi\\rangle}/\\sqrt{\\langle\\psi|\\hat P_i|\\psi\\rangle}$, the [[state-update|state update]]. For a [[nondegenerate]] eigenvalue that is just $\\htmlClass{term-ai}{|a_i\\rangle}$, up to an [[global-phase|overall phase]] that changes no prediction. Example: $|{+y}\\rangle$ giving $-\\tfrac{\\hbar}{2}$ becomes $i|{-z}\\rangle$, the same state as $|{-z}\\rangle$.',
    caption: 'result $-\\tfrac{\\hbar}{2}$: the $|{-z}\\rangle$ {{sh|shadow}}, $\\tfrac{\\sqrt3}{2}$ long, is rescaled to length 1',
    stage: plane({ psi: at60, basis: 'z', project: 2, renormalize: true }),
    terms: { pi: t('hilbert-plane', 'projection'), ai: t('hilbert-plane', 'basis-2'), sh: t('hilbert-plane', 'shadow-2') },
    fidelity: ['plane-update-bookkeeping'],
    claims: [
      claim('l3CollapseDown', 'result −: ψ₆₀ becomes |−z⟩', () => V.l3CollapseDown === 1),
      claim('l3P60DownAmp', 'the − shadow is √3/2 = 0.866 long', () => close(V.l3P60DownAmp, Math.sqrt(3) / 2)),
      claim('l3YDownPostIm', '|+y⟩ giving − becomes i|−z⟩', () => close(V.l3YDownPostIm, 1)),
      claim('l3YDownSame', 'i|−z⟩ is the same state as |−z⟩', () => V.l3YDownSame === 1),
    ],
  },
  {
    id: 'l3-postulates:b5',
    phase: 'lecture',
    text: 'Measuring $A$ is **not** the map $|\\psi\\rangle \\to \\hat A|\\psi\\rangle$. Applying $\\hat A$ to $c_1|a_1\\rangle + c_2|a_2\\rangle$ gives $a_1c_1|a_1\\rangle + a_2c_2|a_2\\rangle$, generally still a superposition. A measurement instead ends in $|a_1\\rangle$ with probability $|c_1|^2$, or in $|a_2\\rangle$ with probability $|c_2|^2$, and hands back a number with a matching state.',
    caption: `$\\htmlClass{term-img}{\\hat S_z|{+x}\\rangle} = \\tfrac{\\hbar}{2}|{-x}\\rangle$, yet the {{trk|magnet}} leaves $|{+z}\\rangle$ or $|{-z}\\rangle$, each with probability ${uf(V.l3MeasureXProb)}, and never $|{-x}\\rangle$`,
    stage: split(lab(main('+x', [Z], true), { flow: 'single', shot: 'L-PLATE' }), plane({ psi: '+x', image: SZ_IMG, basis: 'z', shadows: true })),
    terms: { img: t('hilbert-plane', 'image'), trk: t('lab-r3', 'tracked-atom') },
    fidelity: ['lab-both-paths', 'plane-image-not-state'],
    claims: [
      claim('l3SzOnXIsMinusX', 'Ŝz|+x⟩ = (ħ/2)|−x⟩', () => V.l3SzOnXIsMinusX === 1 && close(V.l3SzOnX, Math.SQRT1_2 / 2)),
      claim('l3SzOnXLen', 'its length is ħ/2', () => close(V.l3SzOnXLen, 0.5)),
      claim('l3SzOnX', 'its |+z⟩ part is 0.354', () => close(V.l3SzOnX, 0.3535533905932738)),
      claim('l3MinusXNotZ', '|−x⟩ is neither |+z⟩ nor |−z⟩', () => V.l3MinusXNotZ === 1),
      claim('l3MeasureXPost', 'a z measurement leaves |+z⟩ or |−z⟩', () => V.l3MeasureXPost === 1),
      claim('l3MeasureXProb', 'each with probability ½', () => close(V.l3MeasureXProb, 0.5)),
    ],
  },
  {
    id: 'l3-postulates:b6',
    phase: 'books',
    text: 'Susskind (§3.5) warns of a common misconception, and his example is ours: $\\hat\\sigma_z = 2\\hat S_z/\\hbar$ turns $|r\\rangle = |{+x}\\rangle$ into $\\htmlClass{term-img}{|l\\rangle} = |{-x}\\rangle$. Yet no measurement of $\\sigma_z$ ever leaves $|l\\rangle$. In §4.7 he shows what $\\hat A|\\psi\\rangle$ is good for: it is the ket half of the average $\\langle\\psi|\\hat A|\\psi\\rangle$.',
    caption: '$\\langle{+x}|\\hat\\sigma_z|{+x}\\rangle = \\langle{+x}|{-x}\\rangle = 0$: a {{ra|right angle}}, so the average is 0',
    stage: plane({ psi: '+x', image: { named: 'sz', label: '$\\hat\\sigma_z|\\psi\\rangle$' }, basis: 'x', rightAngle: true }),
    terms: { img: t('hilbert-plane', 'image'), ra: t('hilbert-plane', 'right-angle') },
    refs: [
      susskind('§3.5; §4.7; §3.2', 'Warns that applying an operator is not measuring it, with this very example. Later he shows the operator acting on the state as one half of the average. His §3.2 states the rules as four principles: the frame of Lecture 4.'),
    ],
    claims: [
      claim('l3SigZOnX', 'σ̂z|+x⟩ = |−x⟩', () => V.l3SigZOnX === 1),
      claim('l3XMinusXOverlap', '⟨+x|−x⟩ = 0', () => close(V.l3XMinusXOverlap, 0)),
      claim('l3SigZMeanX', '⟨+x|σ̂z|+x⟩ = 0', () => close(V.l3SigZMeanX, 0)),
    ],
  },
  {
    id: 'l3-postulates:b7',
    phase: 'clue',
    text: 'For $|{-z}\\rangle$, applying $\\hat S_z$ gives $-\\tfrac{\\hbar}{2}|{-z}\\rangle$, and measuring $S_z$ leaves $|{-z}\\rangle$. So do the two agree after all?',
    stage: plane({ psi: '-z', basis: 'z', shadows: true }),
    reveal: {
      text: 'Only for eigenstates. $-\\tfrac{\\hbar}{2}|{-z}\\rangle$ is $|{-z}\\rangle$ times a nonzero number, so it is the same physical state, and the reading is certain. For $|{+x}\\rangle$ the image points along $|{-x}\\rangle$, a state an SG$_z$ magnet never leaves behind.',
      caption: 'for $|{+x}\\rangle$ the {{img|image}} lies along $|{-x}\\rangle$, which is itself 50/50 along $z$: neither output',
      stage: plane({ psi: '+x', image: SZ_IMG, basis: 'z', shadows: true }),
      terms: { img: t('hilbert-plane', 'image') },
      claims: [
        claim('l3SzDownSame', 'Ŝz|−z⟩ is the same state as |−z⟩', () => V.l3SzDownSame === 1),
        claim('l3DownDown', 'measuring z on |−z⟩ gives − with probability 1', () => close(V.l3DownDown, 1)),
        claim('l3SzOnXIsMinusX', 'Ŝz|+x⟩ points along |−x⟩', () => V.l3SzOnXIsMinusX === 1),
        claim('l3MinusXOnZ', '|−x⟩ is 50/50 along z', () => close(V.l3MinusXOnZ, 0.5)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l3-spin-example — One spin, measured from start to finish (taught at the start of Lecture 4)   */
/* ---------------------------------------------------------------------------------------------- */

const zxzBench = lab(main('+x', [Zkeep, Xkeep, Z], true), { readouts: ['fractions'], shot: 'L-WIDE' })

const spinExample: Beat[] = [
  {
    id: 'l3-spin-example:b1',
    phase: 'lecture',
    text: 'This example was taught at the start of Lecture 4. Prepare $|{+x}\\rangle = \\tfrac{1}{\\sqrt2}(|{+z}\\rangle + |{-z}\\rangle)$ and measure $S_z$. Rule 1 gives $\\pm\\tfrac{\\hbar}{2}$, and Rule 2 gives $P(+\\tfrac{\\hbar}{2}) = |\\langle{+z}|{+x}\\rangle|^2 = \\tfrac12$, and $P(-\\tfrac{\\hbar}{2}) = \\tfrac12$ too.',
    caption: 'two equal {{sp|spots}}; two equal squared {{bar|shadows}}',
    stage: split(lab(main('+x', [Z], true), { shot: 'L-PLATE' }), plane({ psi: '+x', basis: 'z', shadows: true, ticks: true })),
    terms: { sp: t('lab-r3', 'spot-plus'), bar: t('hilbert-plane', 'bar-1') },
    claims: [
      claim('l3XonZPlus', 'the bench: ½ in the + spot', () => close(V.l3XonZPlus, 0.5)),
      claim('l3ProbZX', '|⟨+z|+x⟩|² = ½', () => close(V.l3ProbZX, 0.5)),
    ],
  },
  {
    id: 'l3-spin-example:b2',
    phase: 'lecture',
    text: 'Suppose the result is $+\\tfrac{\\hbar}{2}$. Rule 3 sets the state to $\\htmlClass{term-chip}{|{+z}\\rangle}$, so a second $S_z$ right away gives $+\\tfrac{\\hbar}{2}$ with probability $|\\langle{+z}|{+z}\\rangle|^2 = 1$. Measure the same thing twice in a row and the answer repeats.',
    caption: `${uf(V.l3BlockBlocked)} of the atoms stop at the block; every survivor lands + again`,
    stage: lab(main('+x', [Zkeep, Z], true), { readouts: ['blocked'], shot: 'L-3Q' }),
    terms: { chip: t('lab-r3', 'chip-1') },
    claims: [
      claim('l3BlockBlocked', '½ of the source is stopped', () => close(V.l3BlockBlocked, 0.5)),
      claim('l3BlockPlus', '½ lands +', () => close(V.l3BlockPlus, 0.5)),
      claim('l3BlockMinus', 'none lands −', () => close(V.l3BlockMinus, 0)),
      claim('l3RepeatCertain', '|⟨+z|+z⟩|² = 1', () => close(V.l3RepeatCertain, 1)),
    ],
  },
  {
    id: 'l3-spin-example:b3',
    phase: 'lecture',
    text: 'Now put an SG$_x$ magnet in between; it measures $S_x$, the spin along $x$. Since $|{+z}\\rangle = \\tfrac{1}{\\sqrt2}(|{+x}\\rangle + |{-x}\\rangle)$, it reads $\\pm\\tfrac{\\hbar}{2}$ with probability $\\tfrac12$ each. After a + result the state is $\\htmlClass{term-chip}{|{+x}\\rangle}$, and a final $S_z$ is 50/50 again.',
    caption: `share of the source atoms: 1 → ${uf(V.l3ZxzAlive1)} → ${uf(V.l3ZxzAlive2)} → ${uf(V.l3ZxzPlus)} + ${uf(V.l3ZxzMinus)}`,
    stage: zxzBench,
    terms: { chip: t('lab-r3', 'chip-2') },
    claims: [
      claim('l3ZxzAlive1', '½ passes the first magnet', () => close(V.l3ZxzAlive1, 0.5)),
      claim('l3ZxzAlive2', '¼ passes the x magnet', () => close(V.l3ZxzAlive2, 0.25)),
      claim('l3ZxzPlus', '⅛ lands +', () => close(V.l3ZxzPlus, 0.125)),
      claim('l3ZxzMinus', '⅛ lands −', () => close(V.l3ZxzMinus, 0.125)),
      claim('l3ProbXZ', '|⟨+x|+z⟩|² = ½', () => close(V.l3ProbXZ, 0.5)),
    ],
  },
  {
    id: 'l3-spin-example:b4',
    phase: 'lecture',
    text: 'This is Lecture 1’s sequential experiment, now derived from the rules. Measuring leaves the atom in one of that measurement’s own eigenstates. Measuring along another axis usually disturbs it, so the first answer need not come back.',
    caption: `$|{+z}\\rangle$ seen from the $x$ basis: two equal {{sh|shadows}}, each squaring to ${uf(V.l3ProbXZ)}`,
    stage: split(zxzBench, plane({ psi: '+z', basis: 'x', shadows: true })),
    terms: { sh: t('hilbert-plane', 'shadow-1') },
    claims: [
      claim('l3ProbXZ', 'P(+x | +z) = ½', () => close(V.l3ProbXZ, 0.5)),
      claim('l3ProbMXZ', 'P(−x | +z) = ½', () => close(V.l3ProbMXZ, 0.5)),
    ],
  },
  {
    id: 'l3-spin-example:b5',
    phase: 'books',
    text: 'Townsend (§1.2, pp. 8–9) reruns this bench with one change: the $x$ device merges its two beams again, and nothing records the path. Then the last $z$ magnet sends every atom up. What disturbs the state is obtaining an $x$ result, not the $x$ magnet’s field alone.',
    caption: 'merged and unrecorded, the $x$ stage would change nothing. On this plain repeat, every atom reaching the last magnet lands +. (Our lab cannot draw the merged device.)',
    stage: lab(main('+x', [Zkeep, Z], true), { shot: 'L-WIDE' }),
    fidelity: ['lab-both-paths', 'lab-merge-not-drawn'],
    refs: [
      townsend('§1.2, pp. 8–9 (Experiment 4, Fig. 1.6); §1.4, pp. 14–15', 'A modified device that recombines its two beams without recording the path leaves a $+z$ beam unchanged. Later, the amplitudes of $|{+x}\\rangle$ in the $z$ basis.'),
    ],
    claims: [claim('l3BlockMinus', 'after a kept +z, a z magnet sends none to −', () => close(V.l3BlockMinus, 0))],
  },
  {
    id: 'l3-spin-example:b6',
    phase: 'clue',
    text: 'The repeat $S_z$ left $|{+z}\\rangle$ alone. Why doesn’t the $S_x$ magnet leave it alone too?',
    stage: lab(main('+x', [Zkeep, Xkeep, Z], true), { flow: 'single', shot: 'L-TRACK' }),
    reveal: {
      text: 'A measurement leaves a state untouched only when the state is one of its eigenvectors. $|{+z}\\rangle$ is an eigenvector of $\\hat S_z$ but not of $\\hat S_x$. It has two nonzero $x$ amplitudes, so the $x$ magnet must pick one.',
      caption: `two nonzero $x$ {{sh|shadows}}, each $\\tfrac{1}{\\sqrt2} \\approx ${d(V.l3MXZOverlap)}$`,
      stage: plane({ psi: '+z', basis: 'x', shadows: true }),
      terms: { sh: t('hilbert-plane', 'shadow-1') },
      claims: [
        claim('l3ZXOverlap', '⟨+x|+z⟩ = 0.707', () => close(V.l3ZXOverlap, Math.SQRT1_2)),
        claim('l3MXZOverlap', '⟨−x|+z⟩ = 0.707', () => close(V.l3MXZOverlap, Math.SQRT1_2)),
        claim('l3SxMovesZ', '|+z⟩ is not an eigenvector of Ŝx', () => V.l3SxMovesZ === 1),
        claim('l3SzKeepsZ', '|+z⟩ is an eigenvector of Ŝz', () => V.l3SzKeepsZ === 1),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l3-spread — Averages and spreads of many readings (taught at the start of Lecture 4)           */
/* ---------------------------------------------------------------------------------------------- */

const spread: Beat[] = [
  {
    id: 'l3-spread:b1',
    phase: 'lecture',
    text: 'This unit was taught at the start of Lecture 4. Only now, with the whole list of odds, can we define the average. For outcomes $a_i$ with probabilities $P(a_i)$, the [[expectation|expectation value]] is $\\htmlClass{term-avg}{\\langle A\\rangle} = \\sum_i a_i P(a_i)$. The Born rule and $\\hat A = \\sum_i a_i|a_i\\rangle\\langle a_i|$ fold this into one sandwich: $\\langle A\\rangle = \\langle\\psi|\\hat A|\\psi\\rangle$.',
    caption: '$|{+x}\\rangle$ along $z$: the average {{tick|tick}} sits at 0',
    stage: lab(main('+x', [Z], true), { readouts: ['centroid'], shot: 'L-PLATE' }),
    terms: { avg: t('lab-r3', 'centroid'), tick: t('lab-r3', 'centroid') },
    claims: [
      claim('l3MeanSzX', '⟨+x|Ŝz|+x⟩ = 0', () => close(V.l3MeanSzX, 0)),
      claim('l3MeanSzXSum', 'Σ aᵢP(aᵢ) = 0 for |+x⟩ too', () => close(V.l3MeanSzXSum, V.l3MeanSzX)),
      claim('l3MeanSzP60', 'for ψ₆₀: ⟨Sz⟩ = −ħ/4 …', () => close(V.l3MeanSzP60, -0.25)),
      claim('l3MeanSzP60Sum', '… = (ħ/2)(¼) − (ħ/2)(¾), both ways', () => close(V.l3MeanSzP60Sum, V.l3MeanSzP60)),
    ],
  },
  {
    id: 'l3-spread:b2',
    phase: 'lecture',
    text: 'So for $|{+x}\\rangle$, $\\langle S_z\\rangle = (+\\tfrac{\\hbar}{2})\\tfrac12 + (-\\tfrac{\\hbar}{2})\\tfrac12 = 0$. Yet no atom ever reads 0. An average describes many atoms prepared and measured the same way, not any one of them.',
    caption: 'the {{tick|tick}} sits in the empty middle: {{sp|every atom}} lands on one side or the other',
    stage: lab(main('+x', [Z], true), { readouts: ['centroid'], deposit: 'build', shot: 'L-PLATE-C' }),
    terms: { tick: t('lab-r3', 'centroid'), sp: t('lab-r3', 'spot-plus') },
    claims: [
      claim('l3XonZPlus', '½ read +ħ/2 …', () => close(V.l3XonZPlus, 0.5)),
      claim('l3XonZMinus', '… and ½ read −ħ/2', () => close(V.l3XonZMinus, 0.5)),
      claim('l3MeanSzX', 'so the average is 0', () => close(V.l3MeanSzX, 0)),
    ],
  },
  {
    id: 'l3-spread:b3',
    phase: 'lecture',
    text: 'The scatter is measured by the [[variance]] $(\\Delta A)^2 = \\langle A^2\\rangle - \\langle A\\rangle^2$ and its square root, the [[uncertainty|spread]] $\\htmlClass{term-spr}{\\Delta A}$. For a spin ½, $\\hat S_z^2 = \\tfrac{\\hbar^2}{4}\\hat 1$, so $\\langle S_z^2\\rangle = \\tfrac{\\hbar^2}{4}$ in every state. For $|{+x}\\rangle$ this gives $\\Delta S_z = \\tfrac{\\hbar}{2}$.',
    caption: 'the {{br|bracket}}: $\\Delta S_z = \\tfrac{\\hbar}{2}$, and every reading sits one spread from the average',
    stage: lab(main('+x', [Z], true), { readouts: ['centroid', 'spread'], shot: 'L-PLATE' }),
    terms: { spr: t('lab-r3', 'spread'), br: t('lab-r3', 'spread') },
    fidelity: ['lab-spread-vs-band'],
    claims: [
      claim('l3SzSquaredId', 'Ŝz² = (ħ²/4)1̂', () => V.l3SzSquaredId === 1),
      claim('l3SzSqP60', '⟨Sz²⟩ = ħ²/4 (checked on ψ₆₀)', () => close(V.l3SzSqP60, 0.25)),
      claim('l3SpreadX', 'ΔSz = ħ/2 for |+x⟩', () => close(V.l3SpreadX, 0.5)),
      claim('l3SigmaSpreadX', 'the bracket is ±1 in units of ħ/2', () => close(V.l3SigmaSpreadX, 2 * V.l3SpreadX)),
    ],
  },
  {
    id: 'l3-spread:b4',
    phase: 'lecture',
    text: 'Compare $|{+z}\\rangle$: $\\langle S_z\\rangle = \\tfrac{\\hbar}{2}$ and $\\langle S_z^2\\rangle = \\tfrac{\\hbar^2}{4}$, so $\\Delta S_z = 0$. In an eigenstate every freshly prepared atom gives the same reading, so the spread is zero. If the state mixes eigenstates with different eigenvalues, the readings scatter.',
    caption: 'every atom in the + {{sp|spot}}: average $+\\tfrac{\\hbar}{2}$, {{spr|spread}} 0',
    stage: lab(main('+z', [Z], true), { readouts: ['centroid', 'spread'], shot: 'L-PLATE' }),
    terms: { sp: t('lab-r3', 'spot-plus'), spr: t('lab-r3', 'spread') },
    claims: [
      claim('l3MeanSzUp', '⟨Sz⟩ = ħ/2 for |+z⟩', () => close(V.l3MeanSzUp, 0.5)),
      claim('l3VarSzUp', '(ΔSz)² = 0 for |+z⟩', () => close(V.l3VarSzUp, 0)),
      claim('l3UpOnZ', 'every |+z⟩ atom lands +', () => close(V.l3UpOnZ, 1)),
    ],
  },
  {
    id: 'l3-spread:b5',
    phase: 'books',
    text: `Townsend (§1.4, pp. 16–17) calls $\\Delta S_z$ an uncertainty rather than a standard deviation, since one atom in $|{+x}\\rangle$ has no definite $S_z$. His worked example on p. 17 has $z$ odds ¼ and ¾, so $\\langle S_z\\rangle = -\\tfrac{\\hbar}{4}$ and $\\Delta S_z = \\tfrac{\\sqrt3}{4}\\hbar \\approx ${d(V.l3TownsendSpread, 2)}\\hbar$. His closing sentence puts the ${pct(V.l3TownsendDown)} on $+\\tfrac{\\hbar}{2}$; it belongs to $-\\tfrac{\\hbar}{2}$ (see the [[errata]]).`,
    caption: `the same odds on our bench: ${uf(V.l3TiltPlus)} in +, ${uf(V.l3TiltMinus)} in −, with the magnet tilted 120°; average $-\\tfrac{\\hbar}{4}$, {{spr|spread}} $${d(V.l3SpreadP60, 2)}\\hbar$`,
    stage: lab(main('+z', [{ axis: { tiltDeg: 120 } }], true), { readouts: ['centroid', 'spread'], shot: 'L-PLATE' }),
    terms: { spr: t('lab-r3', 'spread') },
    fidelity: ['lab-tilt-real'],
    refs: [
      townsend('§1.4, pp. 15–17 (eqs. 1.20–1.22); §1.6, p. 24 (eqs. 1.47–1.49)', 'The average and the spread of many $S_z$ readings, and why the spread is called an uncertainty. A worked example with odds ¼ and ¾, and run-to-run fluctuations of order √N.'),
      susskind('§4.7', 'The average defined two ways, as a probability-weighted sum and as the mean of many trials; they agree when the trials are many.'),
    ],
    claims: [
      claim('l3TownsendUp', 'Townsend’s state: P(+ħ/2) = ¼ …', () => close(V.l3TownsendUp, 0.25)),
      claim('l3TownsendDown', '… and P(−ħ/2) = ¾ = 75 %', () => close(V.l3TownsendDown, 0.75)),
      claim('l3TownsendMean', '⟨Sz⟩ = −ħ/4', () => close(V.l3TownsendMean, -0.25)),
      claim('l3TownsendSpread', 'ΔSz = (√3/4)ħ = 0.433ħ', () => close(V.l3TownsendSpread, Math.sqrt(3) / 4)),
      claim('l3TiltPlus', 'the 120° magnet: ¼ in + …', () => close(V.l3TiltPlus, 0.25)),
      claim('l3TiltMinus', '… and ¾ in −', () => close(V.l3TiltMinus, 0.75)),
      claim('l3SpreadP60', 'ψ₆₀ has the same spread, 0.433ħ', () => close(V.l3SpreadP60, V.l3TownsendSpread)),
      claim('l3MeanSzP60', 'and the same average, −ħ/4', () => close(V.l3MeanSzP60, V.l3TownsendMean)),
      claim('l3SigmaSpreadTilt', 'the bracket on the tilted bench is √3/2 in units of ħ/2', () => close(V.l3SigmaSpreadTilt, 2 * V.l3TownsendSpread)),
    ],
  },
  {
    id: 'l3-spread:b6',
    phase: 'clue',
    text: '$|{+z}\\rangle$ has zero spread in $S_z$. Does it also have zero spread in $S_x$?',
    stage: lab(main('+z', [Z], true), { readouts: ['centroid'], shot: 'L-PLATE' }),
    reveal: {
      text: 'No. Along $x$ it splits 50/50, so $\\langle S_x\\rangle = 0$ and $\\Delta S_x = \\tfrac{\\hbar}{2}$, the largest spread any spin component can have. Can a state be sharp in two quantities at once? The notes point there next: compatible observables and commutators (Lecture 7).',
      caption: 'along $x$ the {{spr|bracket}} opens to its full width',
      stage: lab(main('+z', [X], true), { readouts: ['centroid', 'spread'], shot: 'L-PLATE' }),
      terms: { spr: t('lab-r3', 'spread') },
      fidelity: ['lab-spread-vs-band'],
      claims: [
        claim('l3ZonXPlus', '|+z⟩ along x: 50/50', () => close(V.l3ZonXPlus, 0.5)),
        claim('l3MeanSxUp', '⟨Sx⟩ = 0', () => close(V.l3MeanSxUp, 0)),
        claim('l3SpreadSxUp', 'ΔSx = ħ/2', () => close(V.l3SpreadSxUp, 0.5)),
        claim('l3SpreadMax', 'no sampled spin component on any sampled state spreads more than ħ/2', () => close(V.l3SpreadMax, 0.25) && V.l3SpreadSxUp ** 2 <= V.l3SpreadMax + 1e-12),
      ],
    },
  },
]

export const L3_STORY: Record<string, Beat[]> = {
  'l3-operators': operators,
  'l3-eigen': eigen,
  'l3-projectors': projectors,
  'l3-postulates': postulates,
  'l3-spin-example': spinExample,
  'l3-spread': spread,
}
