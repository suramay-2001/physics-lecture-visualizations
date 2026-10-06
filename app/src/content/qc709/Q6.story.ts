/**
 * Chapter Q6 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q6-story.md §1, in both
 * tracks, with the rulings of docs/roles/decisions/qc709-remap.md and qc709-Q6Q7.md: ⟨A⊗B⟩ and the correlation grid
 * sit in `q6-tensor` (not `q6-many`); HW2 P1(e) (S_x^tot) sits in `q6-bell-basis` (needs the triplet and singlet);
 * Q6 owns no "⊗ on operators" notation beat (Q4 does; Q6 links back at `q6-many:b1`); β_xy gets its own notation beat
 * (`q6-bell-basis:b2`); HW2 beats are phase `'books'`, cited "HW2 P1(a)" etc.
 *
 * Standing rules kept here:
 * - Every derivation list (both tracks) carries `view`/`viewCaption` on at least two distinct `StageState`s drawn
 *   from kinds already shown elsewhere in the SAME unit (W-709 #7/#11; docs/patterns/derivation.md).
 * - Every new space or notation has exactly one notation beat (`Beat.introduces`), at or before its glossary
 *   entry's `first` use, with a caption in both tracks (W-709 #8/#12).
 * - No TeX command outside `$…$` in learner-visible text (ruling, qc709-remap.md).
 * - Every number comes from Q6.values.ts (an engine call), never a typed literal.
 * - HW2 is submitted (`homework-status.md`): HW2 beats carry full walkthroughs in the challenges file (Q6.ts).
 */
import type { Circuit } from '../../physics/qc/circuit'
import type {
  AmpSource,
  AmplitudesState,
  Beat,
  CircuitStageState,
  MatrixCoef,
  MatrixGateName,
  MatrixGridState,
  MatrixSource,
  MatrixTableauState,
  Scrub,
  StageLayout,
  StageState,
  TwoQubitState,
} from '../schema'
import { C_BM, C_CZPP, C_F7C, C_F7_0PLUS, C_PREP, C_PROD, C_U, C_XZ, V, claim, close, d, q6HeisIZString, q6HeisZIString } from './Q6.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan §0 "Stage shorthand"), as plain builder functions                          */
/* ---------------------------------------------------------------------------------------------- */
const amp = (state: AmpSource, extra: Partial<Omit<AmplitudesState, 'kind' | 'state'>> = {}): AmplitudesState => ({ kind: 'amplitudes', state, shot: 'A-BARS', ...extra })
const circ = (circuit: Circuit, upTo?: Scrub, extra: Partial<Omit<CircuitStageState, 'kind' | 'circuit' | 'upTo'>> = {}): CircuitStageState => ({
  kind: 'circuit',
  circuit,
  shot: 'Q-WIRES',
  ...(upTo !== undefined ? { upTo } : {}),
  ...extra,
})
const mx = (source: MatrixSource, extra: Partial<Omit<MatrixGridState, 'kind' | 'source' | 'labels'>> = {}): MatrixGridState => ({
  kind: 'matrix',
  source,
  labels: 'kets',
  values: 'exact',
  shot: 'M-GRID',
  ...extra,
})
const tableau = (tab: string[], extra: Partial<Omit<MatrixTableauState, 'kind' | 'tableau'>> = {}): MatrixTableauState => ({ kind: 'matrix', tableau: tab, shot: 'M-GRID', ...extra })
const tq = (ketSource: AmpSource, extra: Partial<Omit<TwoQubitState, 'kind' | 'source' | 'labels' | 'arrows' | 'grid'>> = {}): TwoQubitState => ({
  kind: 'two-qubit',
  source: { ket: ketSource },
  labels: 'q1-q2',
  arrows: 'reduced',
  grid: 'T',
  shot: 'TQ-PAIR',
  ...extra,
})
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })
const pa = (letters: string): MatrixSource => (letters.length === 1 ? { pauli: letters } : { kron: [...letters].map((ch) => ({ pauli: ch })) as [MatrixSource, MatrixSource] })
const G = (name: MatrixGateName): MatrixSource => ({ gate: { name } })
const H1src: MatrixSource = { gate: { name: 'H' }, qubits: 2, targets: [0] }
const I4src: MatrixSource = { gate: { name: 'I' }, qubits: 2, targets: [0] }
const prod = (...srcs: MatrixSource[]): MatrixSource => ({ product: srcs })
const adj = (src: MatrixSource): MatrixSource => ({ adjoint: src })
const lin = (...terms: [MatrixCoef, MatrixSource][]): MatrixSource => ({ lin: terms.map(([c, src]) => ({ c, src })) })
const BC: MatrixSource = prod(G('CNOT'), H1src)
const UB: MatrixSource = prod(H1src, G('CNOT'))
const M_HAT: MatrixSource = lin(['+1', I4src], ['-1', pa('XX')], ['+1/2', I4src], ['-1/2', pa('ZZ')])
const TS_KETS: AmpSource[] = [{ ket: '00' }, { bell: 'Psi+' }, { ket: '11' }, { bell: 'Psi-' }]
/**
 * The β₀₀, β₀₁, β₁₀, β₁₁ order (P-Q6-review.md blocking item 2): the engine's own `basis: 'bell'` uses
 * `BELL_BASIS`'s order Φ⁺, Φ⁻, Ψ⁺, Ψ⁻ (state.ts, matrix.ts), not this chapter's β_xy order, so a matrix captioned
 * "diag(0, 1, 2, 3)" over `basis: 'bell'` actually draws diag(0, 2, 1, 3). Use this explicit basis instead,
 * wherever the caption names β_xy in order, as `TS_KETS` above already does for the triplet-and-singlet basis.
 */
const BXY: AmpSource[] = [{ bell: 'Phi+' }, { bell: 'Psi+' }, { bell: 'Phi-' }, { bell: 'Psi-' }]

/* Reusable claims (the handful of amplitude sizes — 0.5, 0.25, 0.707, 0.866 — that recur across many beats). */
const cHalf = claim('q6Half', 'a Bell amplitude or product-test entry of size 0.5', () => close(V.q6Half, 0.5))
const cNegHalf = claim('q6NegHalf', 'a product-test value of −0.5', () => close(V.q6NegHalf, -0.5))
const cQuarter = claim('q6Quarter', 'a chance of 0.25', () => close(V.q6Quarter, 0.25))
const cR2 = claim('q6R2', 'an amplitude or singular value of size 0.707', () => close(V.q6R2, Math.SQRT1_2))
const cSqrt32 = claim('q6Sqrt32', 'an average of 0.866', () => close(V.q6Sqrt32, Math.sqrt(3) / 2))

/* ---------------------------------------------------------------------------------------------- */
/* q6-many — Two qubits: the numbers multiply                                                       */
/* ---------------------------------------------------------------------------------------------- */

const many: Beat[] = [
  {
    id: 'q6-many:b1',
    phase: 'lecture',
    introduces: ['qc-composite-space'],
    text:
      'A coin is one bit, and two coins are a list of two bits. Quantum parts combine differently. [[qubit|Qubit]] 1 has the basis states $|0\\rangle$ and $|1\\rangle$, and so does qubit 2. The pair has one basis state for every pairing: $|00\\rangle$, $|01\\rangle$, $|10\\rangle$ and $|11\\rangle$. That is $2\\times2 = 4$, not $2 + 2$. In general, parts with $d_1$ and $d_2$ states make a [[qc-composite-space|joint space]] with $d_1d_2$ states.',
    formal:
      'If particle 1 lives in $V^{(1)}$ of dimension $d_1$ and particle 2 in $V^{(2)}$ of dimension $d_2$, the pair lives in the [[qc-composite-space|joint space]] $V^{(1)}\\otimes V^{(2)}$, spanned by the $d_1d_2$ products $|i_1\\rangle_1\\otimes|i_2\\rangle_2$ (notes p. 21). A state $|\\Psi\\rangle = \\sum c_{i_1i_2}|i_1\\rangle_1\\otimes|i_2\\rangle_2$ carries a $d_1\\times d_2$ array of amplitudes: composition multiplies. For two [[qubit|qubits]] this is Unit 4.3’s $\\mathbb C^2\\otimes\\mathbb C^2$.',
    caption: 'two qubits: four bars, or a 2 × 2 grid',
    captionFormal: '$c_{i_1i_2}$ as a $2\\times2$ array',
    stage: split(amp({ ket: '++' }), mx({ coef: { ket: '++' } })),
    derivation: {
      result: '\\dim\\big(V^{(1)}\\otimes V^{(2)}\\big) = d_1d_2',
      ground: [
        { tex: '\\{|0\\rangle, |1\\rangle\\}', why: 'One qubit has two basis states.', view: amp({ ket: '+' }), viewCaption: 'one qubit: 2 bars' },
        { tex: '|0\\rangle|0\\rangle,\\ |0\\rangle|1\\rangle,\\ |1\\rangle|0\\rangle,\\ |1\\rangle|1\\rangle', why: 'A basis state of the pair picks one state for each qubit.', view: amp({ ket: '++' }), viewCaption: 'two qubits: 4 bars' },
        { tex: '2\\times2 = 4', why: 'Qubit 1’s two choices are the rows of a grid and qubit 2’s are its columns.', view: mx({ coef: { ket: '++' } }), viewCaption: 'the four amplitudes as a 2 × 2 grid' },
        { tex: '2\\times2\\times2 = 8', why: 'A third qubit splits every one of these in two again.', view: amp({ ket: '+++' }), viewCaption: 'three qubits: 8 bars' },
        { tex: 'd_1\\times d_2', why: 'Parts with $d_1$ and $d_2$ states give a grid of $d_1$ rows and $d_2$ columns.', view: mx({ coef: { ket: '++' } }), viewCaption: 'rows: qubit 1; columns: qubit 2' },
        { tex: '\\dim\\big(V^{(1)}\\otimes V^{(2)}\\big) = d_1d_2', why: 'So the joint space has $d_1d_2$ dimensions: composition multiplies.' },
      ],
      formal: [
        { tex: 'V^{(1)}\\otimes V^{(2)} = \\mathrm{span}\\{|i_1\\rangle_1\\otimes|i_2\\rangle_2\\}', why: 'The products of basis vectors span the joint space (notes p. 21).', view: amp({ ket: '++' }), viewCaption: 'the four products' },
        { tex: '\\dim\\big(V^{(1)}\\otimes V^{(2)}\\big) = d_1d_2', why: 'They are independent, so the $c_{i_1i_2}$ form a free $d_1\\times d_2$ array.', view: mx({ coef: { ket: '++' } }), viewCaption: '$c_{i_1i_2}$' },
      ],
    },
  },
  {
    id: 'q6-many:b2',
    phase: 'lecture',
    text:
      'Add a third qubit and every basis state splits in two again: 8 of them. With N qubits there are $2^N$ basis strings, the same strings N coins could show. A row of coins shows one string. A quantum state carries one amplitude for every string. Thirty qubits need $2^{30}$, about 1.07 billion amplitudes: 16 GiB of memory at 16 bytes each.',
    formal:
      `For N particles, $|i_1, \\ldots, i_N\\rangle = |i_1\\rangle_1\\otimes\\cdots\\otimes|i_N\\rangle_N$ and the state carries one complex amplitude per string: $2^N$ for qubits (notes p. 21). Classically one string is the state; here every string carries an amplitude. At N = 30 that is $2^{30}$, about $${d(V.q6Amp30B, 2)} \\times 10^9$ amplitudes, 16 GiB at 16 bytes per amplitude (two doubles).`,
    caption: 'three qubits: 8 bars, one per string',
    captionFormal: 'three qubits: 8 bars, one per string (our estimate: 16 bytes per amplitude)',
    stage: amp({ ket: '+++' }),
    claims: [claim('q6Amp30B', '2^30 is about 1.07 billion', () => close(V.q6Amp30B, 2 ** 30 / 1e9)), claim('q6Gib30', '30 qubits need 16 GiB at 16 bytes each', () => V.q6Gib30 === 16)],
  },
  {
    id: 'q6-many:b3',
    phase: 'lecture',
    text:
      'Prepare qubit 1 in $|0\\rangle$ in one lab and qubit 2 in $|+\\rangle$ in another. The pair is $|0\\rangle\\otimes|+\\rangle$, the tensor product of Unit 4.3. Each qubit still has a state of its own. Such a pair is a [[qc-product-state|product state]]. Its grid of amplitudes has one row empty.',
    formal:
      'Independently prepared parts give $|\\Psi\\rangle = |\\psi_1\\rangle\\otimes|\\psi_2\\rangle$, a [[qc-product-state|product state]] (notes p. 22). Each part keeps a state of its own, and the amplitude array is an outer product, $c_{i_1i_2} = a_{i_1}b_{i_2}$. Rosetta: the notes also call this separable; Chapter Q10 widens that word to [[mixture|mixtures]].',
    caption: `$|0\\rangle|+\\rangle$: bars of ${d(V.q6R2, 3)} at 00 and 01`,
    captionFormal: '$c = ab^{\\mathsf T}$',
    stage: split(amp({ ket: '0+' }), mx({ coef: { ket: '0+' } })),
    claims: [claim('q6R2', 'the amplitude of $|0\\rangle|+\\rangle$ at 00 and 01 has size 0.707', () => close(V.q6R2, Math.SQRT1_2))],
  },
  {
    id: 'q6-many:b4',
    phase: 'clue',
    text: 'Ten coins show one string of 10 bits. How many amplitudes does a state of 10 qubits carry?',
    formal: 'How many complex amplitudes specify a general state of 10 qubits, against the 10 bits of a classical register?',
    stage: amp({ ket: '+++' }),
    reveal: {
      text: '1024, one for every string of 10 bits. Each extra qubit doubles the count, while the coins need just 10 bits.',
      formal: '$2^{10} = 1024$ amplitudes against 10 bits: the classical description grows like N, the quantum one like $2^N$.',
      caption: 'three qubits shown, 8 bars; ten would need 1024',
      stage: amp({ ket: '+++' }, { mode: 'probability' }),
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q6-tensor — Operators on pairs: the tensor product                                               */
/* ---------------------------------------------------------------------------------------------- */

const tensor: Beat[] = [
  {
    id: 'q6-tensor:b1',
    phase: 'lecture',
    text:
      'An operator that acts on qubit 1 alone must leave qubit 2 untouched. So on the pair it is $A\\otimes I$: A in the first slot and “do nothing” in the second. As a matrix it is a 2 × 2 array of blocks, each block an entry of A times I. Ground-up writes it $A_1$.',
    formal:
      'An operator on particle 1 obeys $A_1|\\psi_1, \\psi_2\\rangle = (A_1|\\psi_1\\rangle)\\otimes|\\psi_2\\rangle$, so on $V^{(1)}\\otimes V^{(2)}$ it is $A_1 \\to A\\otimes I_2$, the [[qc-tensor-operator|tensor product of operators]] (notes p. 23; Unit 4.3). Rosetta: the notes write $\\hat\\sigma_{1x}$ on p. 23 and $\\hat\\sigma_{x1}$ from p. 27, both for $\\sigma_x\\otimes I$.',
    caption: '$X\\otimes I$: X’s pattern, each 1 grown into an identity block',
    captionFormal: '$X\\otimes I = [X_{ij}I]$',
    stage: mx(pa('XI'), { blocks: 2 }),
  },
  {
    id: 'q6-tensor:b2',
    phase: 'lecture',
    text:
      'The same rule builds any pair of operators. To make $X\\otimes Z$, take X’s 2 × 2 pattern and replace each entry by that entry times the whole of Z. X has zeros on its diagonal and 1s off it. So Z appears in the two off-diagonal blocks, and zeros fill the rest.',
    formal:
      'For $n\\times n$ A and $m\\times m$ B, $A\\otimes B$ is the $nm\\times nm$ block matrix $[A_{ij}B]$ (notes eq. 2.1; N&C §2.1.7). So $\\sigma_x\\otimes\\sigma_z$ has blocks $0, \\sigma_z; \\sigma_z, 0$: diagonal in neither one-qubit basis, yet a product of one-qubit operators. A sum of products, like CNOT $= |0\\rangle\\langle0|\\otimes I + |1\\rangle\\langle1|\\otimes X$, is generally no single $A\\otimes B$, which is why CNOT can entangle (notes p. 24).',
    caption: '$X\\otimes Z$: Z in the off-diagonal blocks',
    captionFormal: '$\\sigma_x\\otimes\\sigma_z$, eq. 2.1',
    stage: mx(pa('XZ'), { blocks: 2, highlight: [[0, 2], [1, 3], [2, 0], [3, 1]] }),
    derivation: {
      result: '\\sigma_x\\otimes\\sigma_z = \\begin{pmatrix}0 & \\sigma_z\\\\ \\sigma_z & 0\\end{pmatrix}',
      ground: [
        { tex: 'X = \\begin{pmatrix}0 & 1\\\\ 1 & 0\\end{pmatrix}', why: 'X’s pattern: zeros on the diagonal, 1s off it.', view: mx(pa('X')), viewCaption: 'X' },
        { tex: 'A\\otimes B = \\begin{pmatrix}A_{11}B & A_{12}B\\\\ A_{21}B & A_{22}B\\end{pmatrix}', why: 'Each entry of the first matrix multiplies a whole copy of the second.', view: mx(pa('XZ'), { blocks: 2, values: 'none' }), viewCaption: 'four blocks, each a multiple of Z' },
        { tex: 'X\\otimes Z = \\begin{pmatrix}0\\cdot Z & 1\\cdot Z\\\\ 1\\cdot Z & 0\\cdot Z\\end{pmatrix}', why: 'Put X’s four entries in.' },
        { tex: '(X\\otimes Z)|01\\rangle = X|0\\rangle\\otimes Z|1\\rangle = -|11\\rangle', why: 'A check on one state: X flips qubit 1, and Z gives qubit 2’s $|1\\rangle$ a minus sign.', view: circ(C_XZ, 1), viewCaption: '$|01\\rangle \\to -|11\\rangle$' },
        { tex: '\\sigma_x\\otimes\\sigma_z = \\begin{pmatrix}0 & \\sigma_z\\\\ \\sigma_z & 0\\end{pmatrix}', why: 'Z fills the two off-diagonal blocks.', view: mx(pa('XZ'), { blocks: 2, highlight: [[0, 2], [1, 3], [2, 0], [3, 1]] }), viewCaption: 'entries 0, ±1' },
      ],
      formal: [
        { tex: '(A\\otimes B)_{(i,k),(j,l)} = A_{ij}B_{kl}', why: 'eq. 2.1, an $nm\\times nm$ matrix.', view: mx(pa('XZ'), { blocks: 2, values: 'none' }) },
        { tex: '\\sigma_x\\otimes\\sigma_z = \\begin{pmatrix}0 & \\sigma_z\\\\ \\sigma_z & 0\\end{pmatrix}', why: 'Diagonal in neither one-qubit basis, yet a product operator (notes p. 23).', view: mx(pa('XZ'), { blocks: 2, highlight: [[0, 2], [1, 3], [2, 0], [3, 1]] }) },
      ],
    },
  },
  {
    id: 'q6-tensor:b3',
    phase: 'lecture',
    introduces: ['qc-pauli-string'],
    text:
      'Pauli operators on a pair get short names: one letter per qubit, left to right. $XZ$ means X on qubit 1 and Z on qubit 2, the 4 × 4 matrix $X\\otimes Z$. It is not the 2 × 2 product $X\\cdot Z$ of Unit 4.2. $ZZ = Z\\otimes Z$ gives +1 when the two bits agree and −1 when they differ: their [[qc-parity|parity]].',
    formal:
      'A [[qc-pauli-string|Pauli string]] $P_1P_2\\cdots P_n$, $P_k \\in \\{I, X, Y, Z\\}$, means $P_1\\otimes P_2\\otimes\\cdots\\otimes P_n$; the notes write $\\hat\\sigma_{x1}\\hat\\sigma_{x2}$ for $XX$. A one-qubit product is always written with a dot, $X\\cdot Z$. On $|ab\\rangle$, $ZZ$ returns $(-1)^{a\\oplus b}$, the [[qc-parity|parity]] of the two bits.',
    caption: '$ZZ$: +1 on 00 and 11, −1 on 01 and 10',
    captionFormal: '$Z\\otimes Z = \\mathrm{diag}(1, -1, -1, 1)$',
    stage: mx(pa('ZZ'), { blocks: 2 }),
  },
  {
    id: 'q6-tensor:b4',
    phase: 'lecture',
    text:
      'Take the product state $\\psi_1\\otimes|+\\rangle$, with $\\psi_1 = 0.866|0\\rangle + 0.5|1\\rangle$. Read Z on qubit 1 and X on qubit 2, and multiply the two readings. On average the product is $\\langle Z_1\\rangle\\langle X_2\\rangle = 0.5\\times1 = 0.5$. The two qubits behave like two separate coins.',
    formal:
      'For $|\\Psi\\rangle = |\\psi_1\\rangle\\otimes|\\psi_2\\rangle$ and A, B acting on one particle each, $\\langle\\Psi|A\\otimes B|\\Psi\\rangle = \\langle\\psi_1|A|\\psi_1\\rangle\\langle\\psi_2|B|\\psi_2\\rangle$ (notes p. 22): the readings are statistically independent. Here $\\langle ZX\\rangle = 0.5$ and $\\langle XX\\rangle = 0.866$.',
    caption: '$\\langle Z_1X_2\\rangle = 0.5\\times1$',
    captionFormal: '$\\langle ZX\\rangle = \\langle Z\\rangle\\langle X\\rangle = 0.5$',
    stage: split(circ(C_PROD, 1), amp({ circuit: C_PROD, upTo: 1 })),
    claims: [claim('q6Half', '$\\langle Z_1X_2\\rangle = 0.5$', () => close(V.q6Half, 0.5)), claim('q6Sqrt32', '$\\langle X_1X_2\\rangle = 0.866$', () => close(V.q6Sqrt32, Math.sqrt(3) / 2))],
    derivation: {
      result: '\\langle\\Psi|A\\otimes B|\\Psi\\rangle = \\langle A\\rangle\\langle B\\rangle',
      ground: [
        { tex: '|\\Psi\\rangle = |\\psi_1\\rangle\\otimes|\\psi_2\\rangle', why: 'A product state: each qubit was prepared on its own.', view: amp({ circuit: C_PROD, upTo: 1 }), viewCaption: '$\\psi_1\\otimes|+\\rangle$' },
        { tex: '(A\\otimes B)\\big(|\\psi_1\\rangle\\otimes|\\psi_2\\rangle\\big) = A|\\psi_1\\rangle\\otimes B|\\psi_2\\rangle', why: 'Each operator acts on its own qubit only.', view: mx(pa('ZX'), { blocks: 2 }), viewCaption: '$Z\\otimes X$: blocks $Z_{ij}X$' },
        { tex: '\\langle\\Psi| = \\langle\\psi_1|\\otimes\\langle\\psi_2|', why: 'The bra of a product is the product of the bras.' },
        { tex: '\\langle\\Psi|A\\otimes B|\\Psi\\rangle = \\langle\\psi_1|A|\\psi_1\\rangle\\,\\langle\\psi_2|B|\\psi_2\\rangle', why: 'An [[inner-product|inner product]] of products multiplies slot by slot.' },
        { tex: '\\langle Z\\otimes X\\rangle = 0.5\\times1 = 0.5', why: 'For our state, $\\langle Z\\rangle$ of $\\psi_1$ is 0.5 and $\\langle X\\rangle$ of $|+\\rangle$ is 1.', view: tq({ circuit: C_PROD, upTo: 1 }, { highlight: ['zx'] }), viewCaption: 'the $zx$ cell: 0.5 × 1' },
        { tex: '\\langle\\Psi|A\\otimes B|\\Psi\\rangle = \\langle A\\rangle\\langle B\\rangle', why: 'In general the average of a product reading is the product of the averages.' },
      ],
      formal: [
        {
          tex: '\\langle\\psi_1\\otimes\\psi_2|A\\otimes B|\\psi_1\\otimes\\psi_2\\rangle = \\langle\\psi_1|A\\psi_1\\rangle\\langle\\psi_2|B\\psi_2\\rangle',
          why: '$(A\\otimes B)(u\\otimes v) = Au\\otimes Bv$ and $\\langle u\\otimes v|u\'\\otimes v\'\\rangle = \\langle u|u\'\\rangle\\langle v|v\'\\rangle$.',
          view: mx(pa('ZX'), { blocks: 2 }),
        },
        { tex: '= \\langle A\\rangle\\langle B\\rangle', why: 'Independent readings (notes p. 22): here $\\langle ZX\\rangle = 0.5$ and $T = r_Ar_B^{\\mathsf T}$.', view: tq({ circuit: C_PROD, upTo: 1 }, { highlight: ['zx'] }), viewCaption: '$T_{zx} = r_{A,z}r_{B,x}$' },
      ],
    },
  },
  {
    id: 'q6-tensor:b5',
    phase: 'lecture',
    introduces: ['qc-correlation-grid'],
    text:
      'A pair gets its own picture. Each ball shows one qubit’s arrow of averages, as in Chapter Q3. The 3 × 3 grid shows nine averages: a reading on qubit 1 times a reading on qubit 2. For a product state each cell is the first arrow’s part times the second arrow’s part.',
    formal:
      'The two-qubit picture: reduced Bloch vectors $r_{A,i} = \\langle\\sigma_i\\otimes I\\rangle$, $r_{B,j} = \\langle I\\otimes\\sigma_j\\rangle$, and the [[qc-correlation-grid|correlation grid]] $T_{ij} = \\langle\\sigma_i\\otimes\\sigma_j\\rangle$. For a product state $T = r_Ar_B^{\\mathsf T}$: here $r_A = (0.866, 0, 0.5)$ and $r_B = (1, 0, 0)$, so only $T_{xx}$ and $T_{zx}$ are non-zero.',
    caption: 'two arrows, nine cells; each cell a product of arrow parts',
    captionFormal: '$T = r_Ar_B^{\\mathsf T}$',
    stage: tq({ circuit: C_PROD, upTo: 1 }),
    claims: [
      claim('q6Sqrt32', 'the $x$ part of qubit 1’s arrow is 0.866', () => close(V.q6Sqrt32, Math.sqrt(3) / 2)),
      claim('q6Half', 'the $z$ part of qubit 1’s arrow is 0.5', () => close(V.q6Half, 0.5)),
    ],
    fidelity: ['qc-tq-local-arrows', 'qc-tq-not-two-places'],
  },
  {
    id: 'q6-tensor:b6',
    phase: 'clue',
    text: 'For the pair $\\psi_1\\otimes|+\\rangle$, what is the average of $Z_1Z_2$?',
    formal: 'Compute $\\langle ZZ\\rangle$ for $\\psi_1\\otimes|+\\rangle$.',
    stage: amp({ circuit: C_PROD, upTo: 1 }, { mode: 'probability' }),
    reveal: {
      text: 'Zero. The average multiplies: $\\langle Z_1\\rangle\\langle Z_2\\rangle = 0.5\\times0$. Qubit 2 in $|+\\rangle$ gives Z readings of +1 and −1 equally often.',
      formal: '$\\langle ZZ\\rangle = \\langle Z\\rangle_{\\psi_1}\\langle Z\\rangle_+ = 0.5\\cdot0 = 0$: the grid’s $zz$ cell is empty.',
      caption: '$T_{zz} = 0.5\\times0 = 0$',
      stage: tq({ circuit: C_PROD, upTo: 1 }, { highlight: ['zz'] }),
      claims: [claim('q6Half', 'the $Z_1$ average is 0.5', () => close(V.q6Half, 0.5))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q6-entangled — States that will not factor                                                       */
/* ---------------------------------------------------------------------------------------------- */

const entangled: Beat[] = [
  {
    id: 'q6-entangled:b1',
    phase: 'lecture',
    text:
      'Count the dials. Two qubits have four complex amplitudes, which is eight real numbers. The chances must add to 1, and an overall phase changes nothing, so six numbers remain. A product state needs only two angles per qubit: four in all.',
    formal:
      'A general two-qubit state has 4 complex amplitudes, 8 real parameters; normalization and the [[global-phase|global phase]] leave 6. A product state is a point on each of two [[bloch-sphere|Bloch spheres]], $2 + 2 = 4$ (notes p. 22). Products sit on a four-parameter slice of the full six-parameter space.',
    caption: '8 − 2 = 6 against 2 + 2 = 4',
    captionFormal: '6 against 4',
    stage: split(amp({ ket: '++' }, { dials: true }), tq({ ket: '++' })),
    derivation: {
      result: 'n_{general} = 2\\cdot2^N - 2,\\quad n_{product} = 2N',
      ground: [
        { tex: '4\\ \\text{amplitudes} = 8\\ \\text{real numbers}', why: 'Each complex amplitude is two real numbers, a size and a phase.', view: amp({ ket: '++' }, { dials: true }), viewCaption: 'four dials: a size and a phase each' },
        { tex: '8 - 1 - 1 = 6', why: 'The chances must add to 1, and an overall phase changes no reading.' },
        { tex: '2 + 2 = 4', why: 'A product needs one point on each qubit’s sphere, two angles each.', view: tq({ ket: '++' }), viewCaption: 'a product: two arrows, two angles each' },
        { tex: '2^N\\ \\text{amplitudes} \\to 2\\cdot2^N - 2', why: 'With N qubits the same count gives this many numbers.', view: amp({ ket: '+++' }, { dials: true }), viewCaption: 'three qubits: 8 dials, 14 numbers' },
        { tex: 'n_{general} = 2\\cdot2^N - 2,\\quad n_{product} = 2N', why: 'A product still needs only two angles per qubit.' },
      ],
      formal: [
        { tex: '\\dim_{\\mathbb R}\\mathbb C^{2^N} = 2\\cdot2^N \\to 2\\cdot2^N - 2', why: 'Remove the norm and the global phase (notes p. 22).', view: amp({ ket: '++' }, { dials: true }) },
        { tex: 'n_{general} = 2\\cdot2^N - 2,\\quad n_{product} = 2N', why: 'Products are $(S^2)^N$; the ratio $2N/(2^{N+1} - 2)$ falls exponentially.', view: tq({ ket: '++' }) },
      ],
    },
  },
  {
    id: 'q6-entangled:b2',
    phase: 'lecture',
    introduces: ['qc-entangled'],
    text:
      'With N qubits the gap explodes. A general state needs $2\\cdot2^N - 2$ numbers, while a product needs $2N$. At N = 3 that is 14 against 6. At N = 10 it is 2046 against 20, about 1 in 100. States that are not products are called [[qc-entangled|entangled]], and they are the usual case.',
    formal:
      'In general $2\\cdot2^N - 2$ real parameters against $2N$, a fraction $2N/(2^{N+1} - 2)$ that falls exponentially: it is only ' +
      `${d(V.q6Param10Frac * 100, 2)} % at N = 10 (notes p. 22). States that cannot be written as $|\\psi_1\\rangle\\otimes|\\psi_2\\rangle$ are [[qc-entangled|entangled]]; they are generic.`,
    caption: 'three qubits: 14 numbers; a product uses 6',
    captionFormal: `$2N/(2^{N+1} - 2) = $ ${d(V.q6Param10Frac * 100, 2)} % at N = 10`,
    stage: amp({ ket: '+++' }, { dials: true }),
    claims: [claim('q6Param10Frac', 'at N = 10 a product uses about 0.98 % of the general count', () => close(V.q6Param10Frac, (2 * 10) / (2 * 2 ** 10 - 2)))],
  },
  {
    id: 'q6-entangled:b3',
    phase: 'lecture',
    text:
      'Try to write Unit 4.5’s Bell state $\\Phi^+ = (|00\\rangle + |11\\rangle)/\\sqrt2$ as a product. A product $(a|0\\rangle + b|1\\rangle)(c|0\\rangle + d|1\\rangle)$ has amplitudes $ac$, $ad$, $bc$ and $bd$. $\\Phi^+$ needs $ad = 0$ and $bc = 0$, but also $ac$ and $bd$ non-zero. No four numbers do both. Neither qubit has a state of its own, yet the pair’s state is exact.',
    formal:
      'Suppose $\\Phi^+ = (a|0\\rangle + b|1\\rangle)\\otimes(c|0\\rangle + d|1\\rangle) = ac|00\\rangle + ad|01\\rangle + bc|10\\rangle + bd|11\\rangle$. Then $ad = bc = 0$, while $ac = bd = 1/\\sqrt2$ forces $a, b, c, d \\ne 0$: a contradiction (notes p. 22). Neither qubit of $\\Phi^+$ has a state of its own, even though the whole pair is in one exact, definite state.',
    caption: '$\\Phi^+$: the 01 and 10 bars are empty, 00 and 11 are not',
    captionFormal: '$C = \\tfrac1{\\sqrt2}I$: two equal singular values',
    stage: split(amp({ bell: 'Phi+' }), mx({ coef: { bell: 'Phi+' } }, { svd: true })),
    claims: [claim('q6DetPhi', '$\\Phi^+$’s product test gives 0.5, not 0', () => close(V.q6DetPhi, 0.5)), claim('q6R2', 'each singular value is 0.707', () => close(V.q6R2, Math.SQRT1_2))],
    derivation: {
      result: '\\Phi^+ \\ne (a|0\\rangle + b|1\\rangle)\\otimes(c|0\\rangle + d|1\\rangle)',
      ground: [
        { tex: '(a|0\\rangle + b|1\\rangle)(c|0\\rangle + d|1\\rangle)', why: 'A general product of two one-qubit states.', view: amp({ ket: '++' }), viewCaption: 'a product with all four bars filled' },
        { tex: '= ac|00\\rangle + ad|01\\rangle + bc|10\\rangle + bd|11\\rangle', why: 'Multiply out: one term for each pairing.', view: mx({ coef: { ket: '++' } }, { svd: true }), viewCaption: 'a product’s grid: one bar' },
        { tex: '\\Phi^+ = \\tfrac1{\\sqrt2}|00\\rangle + \\tfrac1{\\sqrt2}|11\\rangle', why: '$\\Phi^+$ has no $|01\\rangle$ or $|10\\rangle$ part.', view: amp({ bell: 'Phi+' }), viewCaption: '$\\Phi^+$: the 01 and 10 bars are empty' },
        { tex: 'ad = 0,\\quad bc = 0', why: 'So the 01 and 10 amplitudes of the product must vanish.' },
        { tex: 'ac = bd = \\tfrac1{\\sqrt2} \\ne 0 \\Rightarrow a, b, c, d \\ne 0', why: 'But the 00 and 11 amplitudes need all four numbers non-zero.' },
        { tex: '\\Phi^+ \\ne (a|0\\rangle + b|1\\rangle)\\otimes(c|0\\rangle + d|1\\rangle)', why: 'The two demands clash, so no product equals $\\Phi^+$.', view: mx({ coef: { bell: 'Phi+' } }, { svd: true }), viewCaption: '$\\Phi^+$’s grid: two equal bars' },
      ],
      formal: [
        { tex: 'C_{\\Phi^+} = \\tfrac1{\\sqrt2}I,\\quad \\det C_{\\Phi^+} = \\tfrac12', why: 'A product has $C = ab^{\\mathsf T}$, rank 1 and $\\det C = 0$.', view: mx({ coef: { bell: 'Phi+' } }, { svd: true }) },
        { tex: '\\Phi^+ \\ne (a|0\\rangle + b|1\\rangle)\\otimes(c|0\\rangle + d|1\\rangle)', why: '$\\det C \\ne 0$ (notes p. 22).', view: amp({ bell: 'Phi+' }) },
      ],
    },
  },
  {
    id: 'q6-entangled:b4',
    phase: 'lecture',
    introduces: ['qc-factoring-test'],
    text:
      'Here is a quick test. Call the amplitudes $c_{00}$, $c_{01}$, $c_{10}$ and $c_{11}$. Put them in a 2 × 2 grid, with rows for qubit 1 and columns for qubit 2. A product’s grid is $ac, ad$ over $bc, bd$, so its cross products agree. The state is a product exactly when $c_{00}c_{11} - c_{01}c_{10} = 0$.',
    formal:
      'Arrange $c_{i_1i_2}$ as a matrix C. A product has $C = ab^{\\mathsf T}$, of rank 1, so $|\\Psi\\rangle$ is a product iff $\\det C = c_{00}c_{11} - c_{01}c_{10} = 0$: the [[qc-factoring-test|product test]]. Equivalently C has one non-zero singular value; Chapter Q9 calls their number the Schmidt rank.',
    caption: 'product: test 0, one bar; $\\Phi^+$: test 0.5, two equal bars',
    captionFormal: '$\\det C$: 0 against 0.5; singular values (1, 0) against (0.707, 0.707)',
    stage: split(amp({ circuit: C_PROD, upTo: 1 }), mx({ coef: { circuit: C_PROD, upTo: 1 } }, { svd: true })),
    claims: [cHalf, cR2],
  },
  {
    id: 'q6-entangled:b5',
    phase: 'clue',
    text: 'Two states: $(|00\\rangle + |01\\rangle + |10\\rangle + |11\\rangle)/2$ and $(|00\\rangle + |01\\rangle + |10\\rangle - |11\\rangle)/2$. One of them is a product. Which?',
    formal: 'Which of $\\tfrac12(|00\\rangle + |01\\rangle + |10\\rangle \\pm |11\\rangle)$ is a product state?',
    stage: amp({ ket: '++' }),
    claims: [cHalf, cQuarter],
    reveal: {
      text: 'The one with +. Its test gives $\\tfrac14 - \\tfrac14 = 0$: it is $|+\\rangle|+\\rangle$. The minus sign gives $-\\tfrac14 - \\tfrac14 = -0.5$, so that state is entangled. A CZ acting on $|+\\rangle|+\\rangle$ makes it.',
      formal: '$\\det C = 0$ for the + sign, $|{+}{+}\\rangle$, and $-0.5$ for the − sign, which is $\\mathrm{CZ}|{+}{+}\\rangle$ (Unit 4.4): one sign entangles.',
      caption: 'test: 0 against −0.5',
      stage: split(amp({ circuit: C_CZPP, upTo: 1 }), mx({ coef: { circuit: C_CZPP, upTo: 1 } }, { svd: true })),
      claims: [claim('q6DetCZpp', '$\\mathrm{CZ}|{+}{+}\\rangle$’s test is −0.5', () => close(V.q6DetCZpp, -0.5))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q6-bell-basis — The Bell basis: four entangled states                                            */
/* ---------------------------------------------------------------------------------------------- */

const bellBasis: Beat[] = [
  {
    id: 'q6-bell-basis:b1',
    phase: 'lecture',
    introduces: ['qc-bell-basis'],
    text:
      'The basis $|00\\rangle$, $|01\\rangle$, $|10\\rangle$, $|11\\rangle$ is made of products. A basis can also be made of four entangled states: $\\Phi^\\pm = (|00\\rangle \\pm |11\\rangle)/\\sqrt2$ and $\\Psi^\\pm = (|01\\rangle \\pm |10\\rangle)/\\sqrt2$. This is the [[qc-bell-basis|Bell basis]]. Any two-qubit state can be written in it. Unit 4.5’s $\\Phi^+$ is one of the four (notes, N&C: $\\beta_{00}$; Bergou: $\\Psi_+$).',
    formal:
      'The computational basis is a product basis. The [[qc-bell-basis|Bell basis]] $\\Phi^\\pm = (|00\\rangle \\pm |11\\rangle)/\\sqrt2$, $\\Psi^\\pm = (|01\\rangle \\pm |10\\rangle)/\\sqrt2$ is an [[qc-orthonormal-basis|orthonormal]] basis of $\\mathbb C^2\\otimes\\mathbb C^2$ whose every member is maximally entangled (notes eq. 2.3; N&C eqs. 1.23–1.26). Rosetta: Bergou’s eq. 3.4 swaps the letters, calling $\\Phi^+$ $\\Psi_+$.',
    caption: 'the four Bell states are the four columns',
    captionFormal: 'columns of $\\mathrm{CNOT}(H\\otimes I)$: $\\Phi^+, \\Psi^+, \\Phi^-, \\Psi^-$',
    stage: split(amp({ bell: 'Phi+' }), mx(BC, { highlightCol: 0 })),
  },
  {
    id: 'q6-bell-basis:b2',
    phase: 'lecture',
    introduces: ['qc-beta-xy'],
    text:
      'The notes and Nielsen and Chuang give each Bell state a two-bit name, $\\beta_{xy}$. The bit y says whether the qubits agree (0) or differ (1). The bit x says whether the two terms add (0) or subtract (1). So $\\Phi^+ = \\beta_{00}$, $\\Psi^+ = \\beta_{01}$, $\\Phi^- = \\beta_{10}$ and $\\Psi^- = \\beta_{11}$.',
    formal:
      '$|\\beta_{xy}\\rangle = (|0, y\\rangle + (-1)^x|1, 1\\oplus y\\rangle)/\\sqrt2$, $x, y \\in \\{0, 1\\}$ (notes eq. 2.4; N&C eq. 1.27): x fixes the [[relative-phase|relative sign]], y whether the qubits agree. Hence $\\Phi^+ = \\beta_{00}$, $\\Psi^+ = \\beta_{01}$, $\\Phi^- = \\beta_{10}$, $\\Psi^- = \\beta_{11}$. Unit 6.5 reads x and y off two detectors.',
    caption: '$\\beta_{10} = \\Phi^-$: the bits agree (y = 0), the sign flips (x = 1)',
    captionFormal: 'column $xy = 10$ of $\\mathrm{CNOT}(H\\otimes I)$',
    stage: split(amp({ bell: 'Phi-' }), mx(BC, { highlightCol: 2 })),
  },
  {
    id: 'q6-bell-basis:b3',
    phase: 'lecture',
    text:
      'The four are [[qc-orthonormal-basis|orthonormal]]. Two of them share no basis strings, like $\\Phi^+$ and $\\Psi^+$. Or they share both strings with opposite [[relative-phase|relative signs]], like $\\Phi^+$ and $\\Phi^-$. Either way their overlap is 0. Each has length 1.',
    formal:
      '$\\langle\\beta_{xy}|\\beta_{x\'y\'}\\rangle = \\delta_{xx\'}\\delta_{yy\'}$ (notes p. 25): two Bell states use disjoint pairs of strings, or the same pair with opposite relative signs. So every two-qubit state expands as $|\\Psi\\rangle = \\sum_{xy}\\langle\\beta_{xy}|\\Psi\\rangle\\,|\\beta_{xy}\\rangle$.',
    caption: '$\\Phi^+$ against $\\Phi^-$: the same bars, one sign flipped; overlap 0',
    captionFormal: '$\\Phi^+$ against $\\Phi^-$: the same bars, one sign flipped; overlap 0',
    stage: split(amp({ bell: 'Psi+' }), mx(prod(adj(BC), BC))),
    claims: [cHalf],
    derivation: {
      result: '\\langle\\beta_{xy}|\\beta_{x\'y\'}\\rangle = \\delta_{xx\'}\\delta_{yy\'}',
      ground: [
        { tex: '\\langle\\Phi^+|\\Psi^+\\rangle = 0', why: '$\\Phi^+$ uses 00 and 11 and $\\Psi^+$ uses 01 and 10: no string in common.', view: amp({ bell: 'Psi+' }), viewCaption: '$\\Psi^+$: bars at 01 and 10' },
        { tex: '\\langle\\Phi^+|\\Phi^-\\rangle = \\tfrac12 - \\tfrac12 = 0', why: 'The same strings with opposite relative signs: the two products cancel.', view: amp({ bell: 'Phi-' }), viewCaption: '$\\Phi^-$: the 11 bar’s hue flipped' },
        { tex: '\\langle\\Phi^+|\\Phi^+\\rangle = \\tfrac12 + \\tfrac12 = 1', why: 'Each state has length 1.', view: amp({ bell: 'Phi+' }) },
        { tex: '\\langle\\beta_{xy}|\\beta_{x\'y\'}\\rangle = \\delta_{xx\'}\\delta_{yy\'}', why: 'Every pair of Bell states falls into one of these cases.', view: mx(prod(adj(BC), BC)), viewCaption: '$B^\\dagger B = I$' },
      ],
      formal: [
        { tex: 'B = \\big(\\beta_{00}\\ \\beta_{01}\\ \\beta_{10}\\ \\beta_{11}\\big) = \\mathrm{CNOT}(H\\otimes I)', why: 'The columns of this product are the Bell states.', view: mx(BC), viewCaption: '$B$' },
        { tex: '\\langle\\beta_{xy}|\\beta_{x\'y\'}\\rangle = \\delta_{xx\'}\\delta_{yy\'}', why: 'B is a product of unitaries, so $B^\\dagger B = I$.', view: mx(prod(adj(BC), BC)) },
      ],
    },
  },
  {
    id: 'q6-bell-basis:b4',
    phase: 'lecture',
    text:
      'Read both qubits of $\\Phi^+$ in the 0,1 basis. You get 00 or 11, each half the time, and never 01 or 10. Qubit 1 alone is a fair coin, yet qubit 2 always agrees with it. In the picture both arrows have length zero, while the grid’s diagonal is full.',
    formal:
      'None of the four is a product: $\\det C = \\pm\\tfrac12$. For $\\Phi^+$, $P(00) = P(11) = \\tfrac12$ and $P(01) = P(10) = 0$: each single reading is random while the pair is perfectly correlated (notes p. 25). Both reduced vectors vanish and $T = \\mathrm{diag}(1, -1, 1)$; Chapter Q9 makes “maximally entangled” precise.',
    caption: '$\\Phi^+$: arrows of length 0; grid $xx = +1$, $yy = -1$, $zz = +1$',
    captionFormal: '$r_A = r_B = 0$, $T = \\mathrm{diag}(1, -1, 1)$',
    stage: split(amp({ bell: 'Phi+' }, { mode: 'probability' }), tq({ bell: 'Phi+' })),
    claims: [claim('q6Half', 'each single reading of $\\Phi^+$ gives 0.5', () => close(V.q6Half, 0.5))],
    fidelity: ['qc-tq-local-arrows'],
  },
  {
    id: 'q6-bell-basis:b5',
    phase: 'lecture',
    text:
      'Two Bell states are old friends from spin. Write $|0\\rangle$ as $\\uparrow$ and $|1\\rangle$ as $\\downarrow$. Then $\\Psi^+ = (\\uparrow\\downarrow + \\downarrow\\uparrow)/\\sqrt2$ is the middle [[qc-triplet|triplet]] state, and $\\Psi^-$ is the [[qc-singlet|singlet]]. $\\Phi^+$ and $\\Phi^-$ mix the other two triplet states, $\\uparrow\\uparrow$ and $\\downarrow\\downarrow$.',
    formal:
      'With $|0\\rangle = |{+z}\\rangle$, $\\Psi^+ = |1, 0\\rangle$ is a [[qc-triplet|triplet]] state and $\\Psi^- = |0, 0\\rangle$ the [[qc-singlet|singlet]], while $\\Phi^\\pm = (|1, 1\\rangle \\pm |1, -1\\rangle)/\\sqrt2$ (notes p. 26; HW2 P1). The triplet is symmetric under exchange of the particles, the singlet antisymmetric.',
    caption: '$\\Psi^-$: +0.707 on 01, −0.707 on 10; every grid cell −1 on the diagonal',
    captionFormal: '$\\Psi^-$: +0.707 on 01, −0.707 on 10; every grid cell −1 on the diagonal',
    stage: split(amp({ bell: 'Psi-' }), tq({ bell: 'Psi-' })),
    claims: [claim('q6R2', 'the singlet’s two amplitudes have size 0.707', () => close(V.q6R2, Math.SQRT1_2))],
  },
  {
    id: 'q6-bell-basis:b6',
    phase: 'books',
    refs: [{ source: 'lecture', where: 'HW2 P1(a)–(c)', adds: 'the triplet and singlet components of $|{\\pm x}\\rangle\\otimes|{\\pm x}\\rangle$ and $|{+x}\\rangle\\otimes|{-x}\\rangle$' }],
    text:
      'Take two spins along +x, $|{+x}\\rangle\\otimes|{+x}\\rangle$. Its triplet parts are $\\tfrac12$, 0.707 and $\\tfrac12$, with nothing in the singlet. That is the spin-1 state $|{+1_x}\\rangle$ of Homework 1, Problem 5. But $|{+x}\\rangle\\otimes|{-x}\\rangle$ has a singlet part of −0.707, so it is not a spin-1 state.',
    formal:
      'In the basis $|1,1\\rangle, |1,0\\rangle, |1,-1\\rangle, |0,0\\rangle$: $|{+x},{+x}\\rangle = (\\tfrac12, \\tfrac1{\\sqrt2}, \\tfrac12, 0) = |{+1_x}\\rangle$ and $|{-x},{-x}\\rangle = (\\tfrac12, -\\tfrac1{\\sqrt2}, \\tfrac12, 0) = |{-1_x}\\rangle$ (HW2 P1(a)–(b)). $|{+x}\\rangle\\otimes|{-x}\\rangle$ has singlet part $-1/\\sqrt2$, and its symmetrized partner $(|{+x}\\rangle\\otimes|{-x}\\rangle + |{-x}\\rangle\\otimes|{+x}\\rangle)/\\sqrt2$ is exactly $(|1,1\\rangle - |1,-1\\rangle)/\\sqrt2 = \\Phi^-$ (HW2 P1(c)).',
    caption: `$|{+x}\\rangle|{-x}\\rangle$ in the Bell basis: ${d(V.q6R2, 3)} on $\\Phi^-$, ${d(V.q6NegR2, 3)} on the singlet`,
    captionFormal: 'triplet and singlet components',
    stage: split(amp({ ket: '+-' }), tq({ ket: '+-' })),
    claims: [
      claim('q6R2', 'the $|1,0\\rangle$ component of $|{+x},{+x}\\rangle$ is 0.707', () => close(V.q6P1aMid, Math.SQRT1_2)),
      claim('q6NegR2', 'the singlet part of $|{+x}\\rangle\\otimes|{-x}\\rangle$ is −0.707', () => close(V.q6P1cS, -Math.SQRT1_2)),
      cHalf,
    ],
  },
  {
    id: 'q6-bell-basis:b7',
    phase: 'books',
    refs: [{ source: 'lecture', where: 'HW2 P1(e)', adds: 'the total spin operator $S_x^{\\mathrm{tot}}$ in the triplet-and-singlet basis' }],
    text:
      'Total spin along x adds the two spins: $S_x\\otimes I + I\\otimes S_x$. Written in the triplet-and-singlet basis, its singlet row and column are all zeros. On the three triplet states it is exactly Homework 1’s spin-1 matrix $S_x$, with entries 0.707ħ beside the diagonal.',
    formal:
      '$S^{\\mathrm{tot}}_x = S_x\\otimes I + I\\otimes S_x$ with $S_x = \\tfrac\\hbar2\\sigma_x$ (HW2 P1(e)). In the basis $|1,1\\rangle, |1,0\\rangle, |1,-1\\rangle, |0,0\\rangle$ it is block-diagonal, 3 + 1: the triplet block is the spin-1 matrix $S^{(1)}_x = \\tfrac\\hbar{\\sqrt2}$ times 1s beside the diagonal, and the singlet block is 0. $S^{\\mathrm{tot}}_x$ commutes with the exchange of the particles, so it cannot connect symmetric to antisymmetric states.',
    caption: 'the singlet’s row and column: all 0',
    captionFormal: '$S^{\\mathrm{tot}}_x$ in the triplet-and-singlet basis (units of ħ)',
    stage: mx(lin(['+1/2', pa('XI')], ['+1/2', pa('IX')]), { basis: TS_KETS, highlightRow: 3, highlightCol: 3 }),
    claims: [claim('q6R2', 'the triplet block carries 0.707ħ beside the diagonal', () => close(V.q6StotEntry, Math.SQRT1_2))],
    derivation: {
      result: 'S^{\\mathrm{tot}}_x = \\begin{pmatrix}S^{(1)}_x & 0\\\\ 0 & 0\\end{pmatrix},\\ S^{(1)}_x = \\tfrac\\hbar{\\sqrt2}\\begin{pmatrix}0&1&0\\\\1&0&1\\\\0&1&0\\end{pmatrix}',
      ground: [
        { tex: 'S^{\\mathrm{tot}}_x = S_x\\otimes I + I\\otimes S_x', why: 'Total spin adds the two spins, each acting on its own qubit.', view: mx(pa('XI'), { blocks: 2 }), viewCaption: '$X\\otimes I$' },
        { tex: '= \\tfrac\\hbar2\\,(X\\otimes I + I\\otimes X)', why: 'Each $S_x$ is $\\tfrac\\hbar2X$.', view: mx(pa('IX'), { blocks: 2 }), viewCaption: '$I\\otimes X$' },
        {
          tex: '\\tfrac\\hbar2\\begin{pmatrix}0&1&1&0\\\\1&0&0&1\\\\1&0&0&1\\\\0&1&1&0\\end{pmatrix}',
          why: 'Add the two matrices.',
          view: mx(lin(['+1/2', pa('XI')], ['+1/2', pa('IX')])),
          viewCaption: 'their sum (units of ħ)',
        },
        { tex: 'S^{\\mathrm{tot}}_x\\,|0,0\\rangle = 0', why: 'The singlet’s two terms are sent to the same state with opposite signs, so they cancel.' },
        {
          tex: 'S^{\\mathrm{tot}}_x = \\begin{pmatrix}S^{(1)}_x & 0\\\\ 0 & 0\\end{pmatrix},\\ S^{(1)}_x = \\tfrac\\hbar{\\sqrt2}\\begin{pmatrix}0&1&0\\\\1&0&1\\\\0&1&0\\end{pmatrix}',
          why: 'In the triplet-and-singlet basis the matrix splits into a 3 × 3 block and a zero; the block is Homework 1’s spin-1 $S_x$.',
          view: mx(lin(['+1/2', pa('XI')], ['+1/2', pa('IX')]), { basis: TS_KETS, highlightRow: 3, highlightCol: 3 }),
          viewCaption: 'triplet block and an empty singlet row',
        },
      ],
      formal: [
        { tex: 'S^{\\mathrm{tot}}_x = \\tfrac\\hbar2\\,(X\\otimes I + I\\otimes X)', why: 'HW2 P1(e).', view: mx(lin(['+1/2', pa('XI')], ['+1/2', pa('IX')])) },
        {
          tex: 'S^{\\mathrm{tot}}_x = \\begin{pmatrix}S^{(1)}_x & 0\\\\ 0 & 0\\end{pmatrix},\\ S^{(1)}_x = \\tfrac\\hbar{\\sqrt2}\\begin{pmatrix}0&1&0\\\\1&0&1\\\\0&1&0\\end{pmatrix}',
          why: 'It commutes with the exchange of the particles, so it keeps symmetric and antisymmetric states apart.',
          view: mx(lin(['+1/2', pa('XI')], ['+1/2', pa('IX')]), { basis: TS_KETS, highlightRow: 3, highlightCol: 3 }),
        },
      ],
    },
  },
  {
    id: 'q6-bell-basis:b8',
    phase: 'clue',
    refs: [{ source: 'lecture', where: 'HW2 P1(d)', adds: 'why $m_x = 0$ is not a product of single-spin x states' }],
    text: 'For spin 1 along x, $m_x = \\pm1$ are simple products of two x-spins. Why can’t $m_x = 0$ be one?',
    formal: 'Why are $|{\\pm1_x}\\rangle$ products of single-spin x states while $|0_x\\rangle$ is not (HW2 P1(d))?',
    stage: amp({ ket: '++' }),
    reveal: {
      text: '$m_x = +1$ needs both spins along +x: one way only, a product. $m_x = 0$ needs one spin up and one down along x, and both orders must be added. That sum is $\\Phi^-$, and its test gives −0.5, not 0: it is entangled.',
      formal: '$m_x = \\pm1$ is reached one way, $|{\\pm x}\\rangle\\otimes|{\\pm x}\\rangle$. $m_x = 0$ needs the symmetric sum of $|{+x}\\rangle\\otimes|{-x}\\rangle$ and $|{-x}\\rangle\\otimes|{+x}\\rangle$, which is $\\Phi^-$ with $\\det C = -\\tfrac12$: no product of definite x states.',
      caption: '$\\Phi^-$: test −0.5, two equal singular values',
      stage: split(amp({ bell: 'Phi-' }), mx({ coef: { bell: 'Phi-' } }, { svd: true })),
      claims: [claim('q6NegHalf', '$\\Phi^-$’s product test is −0.5', () => close(V.q6NegHalf, -0.5)), cHalf],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q6-bell-circuit — Reading and writing Bell states                                                */
/* ---------------------------------------------------------------------------------------------- */

const bellCircuit: Beat[] = [
  {
    id: 'q6-bell-circuit:b1',
    phase: 'lecture',
    text:
      'Detectors read one qubit at a time, in the 0,1 basis. To learn which Bell state arrived, first turn the Bell basis into the 0,1 basis. A CNOT, then an H on qubit 1, does exactly that. Two ordinary readings then give two bits, x and y: a [[qc-bell-measurement|Bell measurement]].',
    formal:
      'To measure in the Bell basis, rotate it onto the computational basis and read each qubit (notes p. 26, Fig. 7): $U = (H\\otimes I)\\,\\mathrm{CNOT}$ with qubit 1 as control, then Z on each line. This is a [[qc-bell-measurement|Bell measurement]]; N&C’s Fig. 1.12 is the same circuit run backwards.',
    caption: 'columns 1–2 make $\\beta_{10}$ from $|10\\rangle$; columns 3–4 read it',
    captionFormal: 'preparation, then Fig. 7',
    stage: split(circ(C_BM('10'), 2), amp({ circuit: C_BM('10'), upTo: 2 })),
    claims: [claim('q6R2', 'a prepared Bell state has amplitudes of size 0.707', () => close(V.q6R2, Math.SQRT1_2))],
  },
  {
    id: 'q6-bell-circuit:b2',
    phase: 'lecture',
    text:
      'Follow $\\beta_{xy}$ through. The CNOT flips qubit 2 in the term that starts with 1, so both terms end in the same $|y\\rangle$. Qubit 1 is left in $|+\\rangle$ or $|-\\rangle$, set by x. The H turns that into $|0\\rangle$ or $|1\\rangle$. Out comes $|xy\\rangle$, with certainty.',
    formal:
      '$\\mathrm{CNOT}|\\beta_{xy}\\rangle = \\tfrac1{\\sqrt2}(|0\\rangle + (-1)^x|1\\rangle)|y\\rangle$, and H maps the first factor to $|x\\rangle$ (notes p. 26). So $(H\\otimes I)\\,\\mathrm{CNOT}|\\beta_{xy}\\rangle = |xy\\rangle$: the two recorded bits name the Bell state that entered.',
    caption: '$\\beta_{10}$: two bars, then $|{-}\\rangle|0\\rangle$, then one bar at 10',
    captionFormal: '$U\\beta_{xy} = |xy\\rangle$',
    stage: split(circ(C_BM('10'), 4), amp({ circuit: C_BM('10'), upTo: 4 })),
    claims: [cHalf],
    derivation: {
      result: '(H\\otimes I)\\,\\mathrm{CNOT}\\,|\\beta_{xy}\\rangle = |xy\\rangle',
      ground: [
        { tex: '|\\beta_{xy}\\rangle = \\tfrac1{\\sqrt2}\\big(|0, y\\rangle + (-1)^x|1, 1\\oplus y\\rangle\\big)', why: 'The Bell state in its two-bit form.', view: amp({ circuit: C_BM('10'), upTo: 2 }), viewCaption: '$\\beta_{10} = (|00\\rangle - |11\\rangle)/\\sqrt2$' },
        { tex: '\\mathrm{CNOT}:\\ |1, 1\\oplus y\\rangle \\to |1, y\\rangle', why: 'The CNOT flips qubit 2 only in the term where qubit 1 is 1.', view: circ(C_BM('10'), 3), viewCaption: 'the cursor after the CNOT' },
        { tex: '\\tfrac1{\\sqrt2}\\big(|0\\rangle + (-1)^x|1\\rangle\\big)|y\\rangle', why: 'Now both terms end in $|y\\rangle$, which factors out.', view: amp({ circuit: C_BM('10'), upTo: 3 }), viewCaption: '$|{-}\\rangle|0\\rangle$: bars at 00 and 10' },
        { tex: 'H\\,\\tfrac1{\\sqrt2}\\big(|0\\rangle + (-1)^x|1\\rangle\\big) = |x\\rangle', why: 'H turns $|+\\rangle$ into $|0\\rangle$ and $|-\\rangle$ into $|1\\rangle$.', view: circ(C_BM('10'), 4), viewCaption: 'the cursor after the H' },
        { tex: '(H\\otimes I)\\,\\mathrm{CNOT}\\,|\\beta_{xy}\\rangle = |xy\\rangle', why: 'One basis string is left, so reading it gives x and y with certainty.', view: amp({ circuit: C_BM('10'), upTo: 4 }), viewCaption: 'one bar at 10' },
      ],
      formal: [
        { tex: '\\mathrm{CNOT}|\\beta_{xy}\\rangle = \\tfrac1{\\sqrt2}\\big(|0\\rangle + (-1)^x|1\\rangle\\big)|y\\rangle', why: 'CNOT maps $|1, 1\\oplus y\\rangle \\to |1, y\\rangle$.', view: amp({ circuit: C_BM('10'), upTo: 3 }) },
        {
          tex: '(H\\otimes I)\\,\\mathrm{CNOT}\\,|\\beta_{xy}\\rangle = \\tfrac12\\big[(1 + (-1)^x)|0, y\\rangle + (1 - (-1)^x)|1, y\\rangle\\big] = |xy\\rangle',
          why: 'One coefficient vanishes for each x (notes p. 26).',
          view: mx(prod(UB, BC)),
          viewCaption: 'U applied to the Bell columns: the identity',
        },
      ],
    },
  },
  {
    id: 'q6-bell-circuit:b3',
    phase: 'lecture',
    text:
      'Every gate can be undone, so the circuit run backwards makes Bell states. Start in $|xy\\rangle$, apply H to qubit 1, then a CNOT. From $|00\\rangle$ this is Unit 4.5’s recipe: first $(|00\\rangle + |10\\rangle)/\\sqrt2$, then $\\Phi^+$.',
    formal:
      'H and CNOT are Hermitian, so $U^\\dagger = \\mathrm{CNOT}(H\\otimes I)$ and $|\\beta_{xy}\\rangle = U^\\dagger|xy\\rangle$ (notes p. 27). Both directions return in dense coding, teleportation and the Bell tests of Chapters Q10 and Q11.',
    caption: '$|00\\rangle \\to (|00\\rangle + |10\\rangle)/\\sqrt2 \\to \\Phi^+$',
    captionFormal: '$|00\\rangle \\to (|00\\rangle + |10\\rangle)/\\sqrt2 \\to \\Phi^+$',
    stage: split(circ(C_PREP('00'), 2), amp({ circuit: C_PREP('00'), upTo: 2 })),
    derivation: {
      result: '|\\beta_{xy}\\rangle = \\mathrm{CNOT}\\,(H\\otimes I)\\,|xy\\rangle',
      ground: [
        { tex: 'U = (H\\otimes I)\\,\\mathrm{CNOT}', why: 'The measuring circuit: the CNOT first, then the H.', view: circ(C_U, 2), viewCaption: 'Fig. 7’s two gates' },
        { tex: 'U^\\dagger = \\mathrm{CNOT}^\\dagger\\,(H\\otimes I)^\\dagger', why: 'Undoing a sequence of gates reverses their order.' },
        { tex: 'H^\\dagger = H,\\quad \\mathrm{CNOT}^\\dagger = \\mathrm{CNOT}', why: 'Each of the two gates is its own inverse (Unit 4.2 and Unit 4.4).' },
        { tex: '|00\\rangle \\to \\tfrac1{\\sqrt2}(|0\\rangle + |1\\rangle)|0\\rangle', why: 'Run the reversed circuit on $|00\\rangle$: the H acts first.', view: amp({ circuit: C_PREP('00'), upTo: 1 }), viewCaption: '$(|00\\rangle + |10\\rangle)/\\sqrt2$' },
        { tex: '\\to \\tfrac1{\\sqrt2}(|00\\rangle + |11\\rangle) = \\Phi^+', why: 'Then the CNOT copies qubit 1’s bit onto qubit 2.', view: amp({ circuit: C_PREP('00'), upTo: 2 }), viewCaption: '$\\Phi^+$' },
        { tex: '|\\beta_{xy}\\rangle = \\mathrm{CNOT}\\,(H\\otimes I)\\,|xy\\rangle', why: 'The same holds for every $|xy\\rangle$.', view: circ(C_PREP('00'), 2), viewCaption: 'H, then CNOT' },
      ],
      formal: [
        { tex: 'U^\\dagger = \\mathrm{CNOT}\\,(H\\otimes I)', why: 'Both factors are Hermitian and unitary (notes p. 27).', view: circ(C_PREP('00'), 2) },
        { tex: '|\\beta_{xy}\\rangle = U^\\dagger U|\\beta_{xy}\\rangle = \\mathrm{CNOT}\\,(H\\otimes I)\\,|xy\\rangle', why: 'Apply $U^\\dagger$ to $U|\\beta_{xy}\\rangle = |xy\\rangle$.', view: mx(BC), viewCaption: 'its columns are the $\\beta_{xy}$' },
      ],
    },
  },
  {
    id: 'q6-bell-circuit:b4',
    phase: 'lecture',
    introduces: ['qc-bell-projector'],
    text:
      'Like any measurement, this one has one projector per outcome. $\\Pi_{xy} = |\\beta_{xy}\\rangle\\langle\\beta_{xy}|$ keeps the $\\beta_{xy}$ part of a state. The four add up to the identity. The chance of outcome xy is $\\langle\\Psi|\\Pi_{xy}|\\Psi\\rangle$, as in Chapter Q3.',
    formal:
      'The Bell measurement is the complete [[orthogonal|orthogonal]] set [[qc-bell-projector|$\\Pi_{xy}$]] $= |\\beta_{xy}\\rangle\\langle\\beta_{xy}|$, with $\\Pi_{xy}\\Pi_{x\'y\'} = \\delta_{xx\'}\\delta_{yy\'}\\Pi_{xy}$ and $\\sum_{xy}\\Pi_{xy} = I_4$; outcome xy has $p_{xy} = \\langle\\Psi|\\Pi_{xy}|\\Psi\\rangle$ (notes eq. 2.5; 448’s <<qc-l4-projectors|yes/no projectors>>).',
    caption: '$\\Pi_{10}$: $\\tfrac12$ in two corners of the diagonal, $-\\tfrac12$ in the other two corners',
    captionFormal: '$\\Pi_{10}$ in the computational basis',
    stage: mx({ outer: [{ bell: 'Phi-' }] }, { blocks: 2 }),
    claims: [cHalf, cNegHalf],
  },
  {
    id: 'q6-bell-circuit:b5',
    phase: 'books',
    refs: [{ source: 'lecture', where: '709 HW2, Problem 2(a)', adds: 'a product state’s Bell amplitudes' }],
    text:
      'Feed in a product state, $|0\\rangle|+\\rangle$. Its four Bell amplitudes are all $\\tfrac12$, so each outcome comes up a quarter of the time. For this state a Bell measurement gives two random bits and says nothing about it.',
    formal:
      '$|\\Psi_1\\rangle = |0\\rangle\\otimes|+\\rangle = \\tfrac12\\sum_{xy}|\\beta_{xy}\\rangle$ (HW2 P2(a)): $p_{xy} = \\tfrac14$ for all four outcomes, two bits of pure noise, so the measurement extracts no information about $\\Psi_1$.',
    caption: `$|0\\rangle|+\\rangle$: four outcomes, ${d(V.q6Quarter, 2)} each`,
    captionFormal: `$|0\\rangle|+\\rangle$: four outcomes, ${d(V.q6Quarter, 2)} each`,
    stage: split(circ(C_F7_0PLUS, 2), amp({ circuit: C_F7_0PLUS, upTo: 2 }, { mode: 'probability' })),
    claims: [claim('q6Quarter', 'each of the four outcomes of $|0\\rangle|+\\rangle$ has chance 0.25', () => close(V.q6Quarter, 0.25)), cHalf],
  },
  {
    id: 'q6-bell-circuit:b6',
    phase: 'books',
    refs: [{ source: 'lecture', where: '709 HW2, Problem 2(c)', adds: 'the Bell-measurement outcome chances for an entangled input' }],
    text:
      'Now feed in $\\Psi_2 = (\\sqrt3|00\\rangle + |11\\rangle)/2$. Only $\\beta_{00}$ and $\\beta_{10}$ use its strings 00 and 11. Their amplitudes are 0.966 and 0.259. So the circuit reads 00 with chance 0.933 and 10 with chance 0.067, and never 01 or 11.',
    formal:
      '$|\\Psi_2\\rangle = \\tfrac{\\sqrt3+1}{2\\sqrt2}|\\beta_{00}\\rangle + \\tfrac{\\sqrt3-1}{2\\sqrt2}|\\beta_{10}\\rangle$, so $p_{00} = \\tfrac{2+\\sqrt3}4 = 0.933$, $p_{10} = \\tfrac{2-\\sqrt3}4 = 0.067$ and $p_{01} = p_{11} = 0$ (HW2 P2(c)).',
    caption: '$\\Psi_2$: 0.933 at 00, 0.067 at 10',
    captionFormal: '$\\Psi_2$: 0.933 at 00, 0.067 at 10',
    stage: split(circ(C_F7C, 4), amp({ circuit: C_F7C, upTo: 4 }, { mode: 'probability' })),
    claims: [
      claim('q6P2c00', 'the Bell measurement reads 00 on $\\Psi_2$ with chance 0.933', () => close(V.q6P2c00, (2 + Math.sqrt(3)) / 4, 1e-3)),
      claim('q6P2c10', 'the Bell measurement reads 10 on $\\Psi_2$ with chance 0.067', () => close(V.q6P2c10, (2 - Math.sqrt(3)) / 4, 1e-3)),
      claim('q6P2cAmp00', '$\\Psi_2$’s $\\beta_{00}$ amplitude is 0.966', () => close(V.q6P2cAmp00, (Math.sqrt(3) + 1) / (2 * Math.SQRT2), 1e-3)),
      claim('q6P2cAmp10', '$\\Psi_2$’s $\\beta_{10}$ amplitude is 0.259', () => close(V.q6P2cAmp10, (Math.sqrt(3) - 1) / (2 * Math.SQRT2), 1e-3)),
      cHalf,
      cSqrt32,
    ],
    derivation: {
      result: 'p_{00} = \\tfrac{2+\\sqrt3}4,\\quad p_{10} = \\tfrac{2-\\sqrt3}4',
      ground: [
        { tex: '\\Psi_2 = \\tfrac{\\sqrt3}2|00\\rangle + \\tfrac12|11\\rangle', why: 'The input uses only the strings 00 and 11.', view: amp({ circuit: C_F7C, upTo: 2 }), viewCaption: '$\\Psi_2$: 0.866 and 0.5' },
        { tex: '\\beta_{00} = \\tfrac1{\\sqrt2}(|00\\rangle + |11\\rangle),\\quad \\beta_{10} = \\tfrac1{\\sqrt2}(|00\\rangle - |11\\rangle)', why: 'Only these two Bell states use 00 and 11.' },
        { tex: '\\langle\\beta_{00}|\\Psi_2\\rangle = \\tfrac1{\\sqrt2}\\big(\\tfrac{\\sqrt3}2 + \\tfrac12\\big) = \\tfrac{\\sqrt3 + 1}{2\\sqrt2}', why: 'Multiply matching amplitudes and add.', view: mx({ coef: { circuit: C_F7C, upTo: 2 } }, { svd: true }), viewCaption: 'the coefficient matrix of $\\Psi_2$: entries 0.866 and 0.5' },
        { tex: '\\langle\\beta_{10}|\\Psi_2\\rangle = \\tfrac{\\sqrt3 - 1}{2\\sqrt2}', why: 'The minus sign of $\\beta_{10}$ subtracts instead.' },
        { tex: 'p_{00} = \\tfrac{(\\sqrt3 + 1)^2}8 = \\tfrac{2+\\sqrt3}4,\\quad p_{10} = \\tfrac{2-\\sqrt3}4', why: 'Square: $(\\sqrt3 \\pm 1)^2 = 4 \\pm 2\\sqrt3$.', view: amp({ circuit: C_F7C, upTo: 4 }, { mode: 'probability' }), viewCaption: 'after the circuit: 0.933 at 00, 0.067 at 10' },
      ],
      formal: [
        { tex: '|\\Psi_2\\rangle = \\tfrac{\\sqrt3+1}{2\\sqrt2}|\\beta_{00}\\rangle + \\tfrac{\\sqrt3-1}{2\\sqrt2}|\\beta_{10}\\rangle', why: 'Expand in the Bell basis (HW2 P2(c)).', view: mx({ coef: { circuit: C_F7C, upTo: 2 } }, { svd: true }) },
        { tex: 'p_{00} = \\tfrac{2+\\sqrt3}4,\\quad p_{10} = \\tfrac{2-\\sqrt3}4', why: '$p_{01} = p_{11} = 0$, and the circuit’s output bars agree.', view: amp({ circuit: C_F7C, upTo: 4 }, { mode: 'probability' }) },
      ],
    },
  },
  {
    id: 'q6-bell-circuit:b7',
    phase: 'clue',
    text: 'Send the singlet $\\Psi^-$ into the measuring circuit. Which two bits come out?',
    formal: 'What does the Fig. 7 circuit record for $\\Psi^- = \\beta_{11}$?',
    stage: split(circ(C_BM('11'), 2), amp({ circuit: C_BM('11'), upTo: 2 })),
    reveal: {
      text: '11, every time. The circuit turns each Bell state into one basis string, and $\\Psi^-$ is $\\beta_{11}$.',
      formal: '$U|\\beta_{11}\\rangle = |11\\rangle$ with probability 1: x = 1 (the minus sign) and y = 1 (the bits differ).',
      caption: 'one bar at 11',
      stage: split(circ(C_BM('11'), 4), amp({ circuit: C_BM('11'), upTo: 4 })),
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q6-parities — Two parities: what the detectors really ask                                        */
/* ---------------------------------------------------------------------------------------------- */

const parities: Beat[] = [
  {
    id: 'q6-parities:b1',
    phase: 'lecture',
    text:
      'Is a Bell measurement just two one-qubit readings? The detectors read Z on each line, but only after the CNOT and the H. Reading $Z_1$ after the gates is the same as reading something else before them. That something is $X_1X_2$, and $Z_2$ becomes $Z_1Z_2$.',
    formal:
      'Measuring $\\hat O$ after U is measuring $U^\\dagger\\hat OU$ before it (notes p. 27). With $U = (H\\otimes I)\\,\\mathrm{CNOT}$, $H\\cdot Z\\cdot H = X$ and the CNOT rules $X_1 \\to X_1X_2$, $Z_2 \\to Z_1Z_2$ give $U^\\dagger(Z\\otimes I)U = X\\otimes X$ and $U^\\dagger(I\\otimes Z)U = Z\\otimes Z$ (notes eq. 2.6).',
    caption: '$Z_1$ at the meters is $X_1X_2$ at the input',
    captionFormal: 'eq. 2.6',
    stage: circ(C_U, 2, { observable: { pauli: 'XX', at: 0 } }),
    claims: [
      claim('q6HeisZISign', 'reading $Z_1$ after the gates reads $X_1X_2$ before them', () => V.q6HeisZISign === 1 && q6HeisZIString === 'XX'),
      claim('q6HeisIZSign', 'reading $Z_2$ after the gates reads $Z_1Z_2$ before them', () => V.q6HeisIZSign === 1 && q6HeisIZString === 'ZZ'),
    ],
    fidelity: ['qc-circuit-observable-engine'],
    derivation: {
      result: 'U^\\dagger(Z\\otimes I)U = X\\otimes X,\\quad U^\\dagger(I\\otimes Z)U = Z\\otimes Z',
      ground: [
        { tex: '\\text{read } Z_1 \\text{ after } U \\;=\\; \\text{read } U^\\dagger Z_1U \\text{ before}', why: 'Measuring after a gate is measuring a moved question before it.', view: circ(C_U, 2, { observable: { pauli: 'ZI', at: 2 } }), viewCaption: '$Z_1$ at the meters' },
        { tex: 'H\\cdot Z\\cdot H = X', why: 'Moved back through the H on qubit 1, Z turns into X.', view: mx(prod(G('H'), pa('Z'), G('H'))), viewCaption: '$H\\cdot Z\\cdot H = X$' },
        { tex: '\\mathrm{CNOT}\\,(X\\otimes I)\\,\\mathrm{CNOT} = X\\otimes X', why: 'Moved back through the CNOT, an X on the control spreads to the target.', view: circ(C_U, 2, { observable: { pauli: 'XX', at: 0 } }), viewCaption: 'at the input: $X_1X_2$' },
        { tex: 'U^\\dagger(Z\\otimes I)U = X\\otimes X', why: 'So reading $Z_1$ at the end reads $X_1X_2$ at the input.' },
        { tex: 'U^\\dagger(Z\\otimes I)U = X\\otimes X,\\quad U^\\dagger(I\\otimes Z)U = Z\\otimes Z', why: 'For $Z_2$: the H skips qubit 2, and the CNOT spreads a Z on the target back to the control.', view: circ(C_U, 2, { observable: { pauli: 'ZZ', at: 0 } }), viewCaption: '$Z_2$ at the meters is $Z_1Z_2$ at the input' },
      ],
      formal: [
        { tex: 'U^\\dagger(Z\\otimes I)U = \\mathrm{CNOT}\\,(H\\cdot Z\\cdot H\\otimes I)\\,\\mathrm{CNOT} = \\mathrm{CNOT}\\,(X\\otimes I)\\,\\mathrm{CNOT}', why: 'Conjugate one factor at a time.', view: mx(prod(adj(UB), pa('ZI'), UB)), viewCaption: '$= X\\otimes X$' },
        { tex: 'U^\\dagger(Z\\otimes I)U = X\\otimes X,\\quad U^\\dagger(I\\otimes Z)U = Z\\otimes Z', why: 'CNOT conjugation sends $X_1 \\to X_1X_2$ and $Z_2 \\to Z_1Z_2$ (eq. 2.6).', view: circ(C_U, 2, { observable: { pauli: 'ZZ', at: 0 } }) },
      ],
    },
  },
  {
    id: 'q6-parities:b2',
    phase: 'lecture',
    text:
      '$X_1X_2$ asks whether the qubits agree in the ± basis; $Z_1Z_2$ asks the same in the 0,1 basis. On one qubit, X and Z anticommute: $X\\cdot Z = -Z\\cdot X$. In $X_1X_2$ times $Z_1Z_2$ that minus sign appears twice and cancels. So the two commute, and both can be read at once.',
    formal:
      '$[XX, ZZ] = 0$: X and Z anticommute on each qubit and the two sign changes cancel (notes p. 28), so the parities are [[qc-compatible|compatible]] (Chapter Q3; 448’s <<qc-l7-compatible|compatible measurements>>). Indeed $XX\\cdot ZZ = ZZ\\cdot XX = -YY$.',
    caption: 'two minus signs cancel',
    captionFormal: '$XX\\cdot ZZ = (-iY)\\otimes(-iY) = -YY$',
    stage: tableau(['XX', 'ZZ'], { product: true }),
    claims: [claim('q6AntiXZ', 'X and Z anticommute exactly', () => close(V.q6AntiXZ, 0)), claim('q6Comm', '$X_1X_2$ and $Z_1Z_2$ commute exactly', () => close(V.q6Comm, 0))],
    derivation: {
      result: '[XX, ZZ] = 0',
      ground: [
        { tex: 'X\\cdot Z = -Z\\cdot X', why: 'On one qubit X and Z anticommute (Chapter Q3).', view: mx(prod(pa('X'), pa('Z'))), viewCaption: '$X\\cdot Z$' },
        { tex: '(X\\otimes X)(Z\\otimes Z) = (X\\cdot Z)\\otimes(X\\cdot Z)', why: 'Tensor products multiply slot by slot.', view: tableau(['XX', 'ZZ'], { product: true }), viewCaption: 'one column per qubit' },
        { tex: '= (-Z\\cdot X)\\otimes(-Z\\cdot X)', why: 'Swap the order in each slot, paying one minus sign each time.' },
        { tex: '= (Z\\otimes Z)(X\\otimes X)', why: 'The two minus signs cancel.' },
        { tex: '[XX, ZZ] = 0', why: 'So the two parities commute, and both can be measured together.', view: mx(prod(pa('XX'), pa('ZZ'))), viewCaption: '$XX\\cdot ZZ = -YY$, the same in either order' },
      ],
      formal: [
        { tex: 'XX\\cdot ZZ = (X\\cdot Z)\\otimes(X\\cdot Z) = (-iY)\\otimes(-iY) = -YY', why: 'Slot by slot.', view: tableau(['XX', 'ZZ'], { product: true }) },
        { tex: '[XX, ZZ] = 0', why: '$ZZ\\cdot XX = (iY)\\otimes(iY) = -YY$ as well.', view: mx(prod(pa('XX'), pa('ZZ'))) },
      ],
    },
  },
  {
    id: 'q6-parities:b3',
    phase: 'lecture',
    text:
      'Each Bell state gives a sure answer to both questions: $X_1X_2\\beta_{xy} = (-1)^x\\beta_{xy}$ and $Z_1Z_2\\beta_{xy} = (-1)^y\\beta_{xy}$. So the two recorded bits are the two parities. One parity alone leaves two states tied, since each answer belongs to two Bell states.',
    formal:
      'The Bell states are the [[qc-simultaneous-eigenvector|simultaneous eigenvectors]] $XX|\\beta_{xy}\\rangle = (-1)^x|\\beta_{xy}\\rangle$, $ZZ|\\beta_{xy}\\rangle = (-1)^y|\\beta_{xy}\\rangle$ (notes eq. 2.7). Each operator alone has eigenvalues ±1, each twofold [[qc-degenerate|degenerate]], so it takes both to separate the four. The projectors factorize: $\\Pi_{xy} = \\tfrac12(I + (-1)^xXX)\\cdot\\tfrac12(I + (-1)^yZZ)$.',
    caption: '$\\beta_{10}$: $xx = -1$, $zz = +1$',
    captionFormal: '$(XX, ZZ) = ((-1)^x, (-1)^y)$',
    stage: tq({ bell: 'Phi-' }, { highlight: ['xx', 'zz'] }),
    claims: [claim('q6EigXXBeta10', '$\\beta_{10}$’s $XX$ eigenvalue is −1', () => V.q6EigXXBeta10 === -1), cHalf],
    derivation: {
      result: '\\Pi_{xy} = \\tfrac12\\big(I + (-1)^xXX\\big)\\cdot\\tfrac12\\big(I + (-1)^yZZ\\big)',
      ground: [
        { tex: 'ZZ\\,|0, y\\rangle = (-1)^y|0, y\\rangle,\\quad ZZ\\,|1, 1\\oplus y\\rangle = (-1)^y|1, 1\\oplus y\\rangle', why: 'ZZ is +1 when the bits agree, and both terms of $\\beta_{xy}$ agree (y = 0) or both differ (y = 1).', view: mx(pa('ZZ')), viewCaption: '$ZZ$ on the diagonal' },
        { tex: 'XX\\,|\\beta_{xy}\\rangle = (-1)^x|\\beta_{xy}\\rangle', why: 'XX flips both bits, which swaps the two terms; that swap costs the relative sign $(-1)^x$.', view: tq({ bell: 'Phi-' }, { highlight: ['xx', 'zz'] }), viewCaption: '$\\beta_{10}$: $xx = -1$, $zz = +1$' },
        { tex: '\\beta_{00}: (+,+),\\ \\beta_{01}: (+,-),\\ \\beta_{10}: (-,+),\\ \\beta_{11}: (-,-)', why: 'The four sign pairs all differ, so the two parities name the state.', view: tq({ bell: 'Psi-' }, { highlight: ['xx', 'zz'] }), viewCaption: '$\\beta_{11}$: both −1' },
        { tex: '\\tfrac12\\big(I + (-1)^xXX\\big)', why: 'This keeps the part with XX-value $(-1)^x$ and removes the rest.', view: mx(lin(['+1/2', I4src], ['-1/2', pa('XX')]), { basis: BXY }), viewCaption: '$\\tfrac12(I - XX)$: 1 on $\\beta_{10}$ and $\\beta_{11}$' },
        { tex: '\\Pi_{xy} = \\tfrac12\\big(I + (-1)^xXX\\big)\\cdot\\tfrac12\\big(I + (-1)^yZZ\\big)', why: 'Keeping both values leaves exactly one Bell state.', view: mx({ outer: [{ bell: 'Phi-' }] }, { basis: BXY }), viewCaption: '$\\Pi_{10}$: a single 1' },
      ],
      formal: [
        { tex: 'XX|\\beta_{xy}\\rangle = (-1)^x|\\beta_{xy}\\rangle,\\quad ZZ|\\beta_{xy}\\rangle = (-1)^y|\\beta_{xy}\\rangle', why: 'eq. 2.7.', view: tq({ bell: 'Phi-' }, { highlight: ['xx', 'zz'] }) },
        { tex: '\\Pi_{xy} = \\tfrac12\\big(I + (-1)^xXX\\big)\\cdot\\tfrac12\\big(I + (-1)^yZZ\\big)', why: 'Each factor is one parity’s spectral projector; their product has rank 1 (notes p. 28).', view: mx({ outer: [{ bell: 'Phi-' }] }, { basis: BXY }) },
      ],
    },
  },
  {
    id: 'q6-parities:b4',
    phase: 'lecture',
    introduces: ['qc-stabilizer'],
    text:
      '$X_1X_2$ and $Z_1Z_2$ both leave $\\Phi^+$ exactly as it is. An operator that leaves a state unchanged is a [[qc-stabilizer|stabilizer]] of that state. The pair $X_1X_2$, $Z_1Z_2$ pins $\\Phi^+$ down completely. The error-correcting codes of Part IX are built on this idea.',
    formal:
      'g [[qc-stabilizer|stabilizes]] $|\\psi\\rangle$ if $g|\\psi\\rangle = +|\\psi\\rangle$. XX and ZZ generate the stabilizer of $\\Phi^+$ (notes p. 29; N&C §10.5.1 p. 454): the group $\\{II, XX, -YY, ZZ\\}$ fixes $\\Phi^+$ and no other state. Measuring ZZ alone is a parity measurement; both ideas return in Part IX’s codes.',
    caption: '$\\Phi^+$: $xx = +1$ and $zz = +1$, so $yy = -1$',
    captionFormal: '$XX$, $ZZ$ and $XX\\cdot ZZ = -YY$',
    stage: split(tableau(['XX', 'ZZ']), tq({ bell: 'Phi+' }, { highlight: ['xx', 'yy', 'zz'] })),
    claims: [
      claim('q6EigXXBeta00', '$\\Phi^+$’s $XX$ eigenvalue is +1', () => V.q6EigXXBeta00 === 1),
      claim('q6EigZZBeta00', '$\\Phi^+$’s $ZZ$ eigenvalue is +1', () => V.q6EigZZBeta00 === 1),
      claim('q6EigYYBeta00', '$\\Phi^+$’s $YY$ eigenvalue is −1', () => V.q6EigYYBeta00 === -1),
    ],
  },
  {
    id: 'q6-parities:b5',
    phase: 'lecture',
    introduces: ['qc-number-operator'],
    text:
      'Both answers can be packed into one operator whose value is $2x + y$: 0, 1, 2 or 3. Pushed through the circuit it becomes $2n_1 + n_2$, where the [[qc-number-operator|bit operator]] $n_i$ reads qubit i’s bit. The weights 2 and 1 are just place value. Before the gates it asks about correlations; after them, about two separate bits.',
    formal:
      '$\\hat M = (I - XX) + \\tfrac12(I - ZZ) = \\sum_{xy}(2x + y)\\Pi_{xy}$ has eigenvalues 0, 1, 2, 3 on $\\beta_{xy}$. Then $U\\hat MU^\\dagger = 2\\hat n_1 + \\hat n_2$ with the [[qc-number-operator|bit operator]] $\\hat n_i = |1\\rangle\\langle1|_i = (I - Z_i)/2$ (notes eq. 2.8). The nonlocal part has shifted off the observable and onto U itself; the other conjugation order, $U^\\dagger\\hat MU$, carries no such reading.',
    caption: 'the same values 0–3: on Bell states before, on 00…11 after',
    captionFormal: '$U\\hat MU^\\dagger = \\mathrm{diag}(0, 1, 2, 3)$',
    stage: mx(prod(UB, M_HAT, adj(UB))),
    claims: [claim('q6MEigBeta10', '$\\hat M$ reads 2 on $\\beta_{10}$', () => close(V.q6MEigBeta10, 2)), cHalf],
    derivation: {
      result: 'U\\hat MU^\\dagger = 2\\hat n_1 + \\hat n_2',
      ground: [
        { tex: '\\hat M = (I - XX) + \\tfrac12(I - ZZ)', why: 'Build one operator out of the two parities.', view: mx(M_HAT), viewCaption: '$\\hat M$ in the 0,1 basis' },
        { tex: '\\hat M|\\beta_{xy}\\rangle = (2x + y)|\\beta_{xy}\\rangle', why: 'On a Bell state each parity is a number: $1 - (-1)^x = 2x$ and $\\tfrac12(1 - (-1)^y) = y$.', view: mx(M_HAT, { basis: BXY }), viewCaption: 'in the Bell basis: diag(0, 1, 2, 3)' },
        { tex: 'U\\,(XX)\\,U^\\dagger = Z\\otimes I,\\quad U\\,(ZZ)\\,U^\\dagger = I\\otimes Z', why: 'The moves of Unit 6.6’s first beat, run the other way.', view: mx(prod(UB, pa('XX'), adj(UB))), viewCaption: '$XX$ pushed through: $Z\\otimes I$' },
        { tex: '\\hat n_i = |1\\rangle\\langle1|_i = \\tfrac12(I - Z_i)', why: '$\\hat n_i$ reads qubit i’s bit: 0 on $|0\\rangle$, 1 on $|1\\rangle$.', view: mx(lin(['+1/2', I4src], ['-1/2', pa('ZI')])), viewCaption: '$\\hat n_1 = \\mathrm{diag}(0, 0, 1, 1)$' },
        { tex: 'U\\hat MU^\\dagger = (I - Z_1) + \\tfrac12(I - Z_2) = 2\\hat n_1 + \\hat n_2', why: 'The same values, now on 00, 01, 10, 11.', view: mx(prod(UB, M_HAT, adj(UB))), viewCaption: 'diag(0, 1, 2, 3) in the 0,1 basis' },
      ],
      formal: [
        { tex: '\\hat M = \\sum_{xy}(2x + y)\\,\\Pi_{xy}', why: 'Eigenvalues 0–3 on the $\\beta_{xy}$.', view: mx(M_HAT, { basis: BXY }) },
        { tex: 'U\\hat MU^\\dagger = 2\\hat n_1 + \\hat n_2', why: 'Invert eq. 2.6; the result is diagonal in the computational basis (notes eq. 2.8).', view: mx(prod(UB, M_HAT, adj(UB))) },
      ],
    },
  },
  {
    id: 'q6-parities:b6',
    phase: 'books',
    refs: [{ source: 'lecture', where: '709 HW2, Problem 2(b)', adds: 'the two parities of a product state' }],
    text:
      'Back to $|0\\rangle|+\\rangle$. For a product the averages multiply: $\\langle X_1X_2\\rangle = 0\\times1 = 0$ and $\\langle Z_1Z_2\\rangle = 1\\times0 = 0$. The Bell outcomes agree: x is 0 or 1 equally often. So the average of $(-1)^x$ is 0, and likewise for y.',
    formal:
      'For $\\Psi_1 = |0\\rangle|+\\rangle$, $\\langle XX\\rangle = \\langle X\\rangle_0\\langle X\\rangle_+ = 0$ and $\\langle ZZ\\rangle = \\langle Z\\rangle_0\\langle Z\\rangle_+ = 0$, matching $\\sum_{xy}(-1)^xp_{xy} = \\sum_{xy}(-1)^yp_{xy} = 0$ from the uniform $p_{xy}$ (HW2 P2(b)). For $\\Psi_2$ the same sums give $\\langle XX\\rangle = 0.866$ and $\\langle ZZ\\rangle = 1$.',
    caption: '$|0\\rangle|+\\rangle$: arrows along z and x; the $xx$ and $zz$ cells are 0',
    captionFormal: '$\\langle XX\\rangle = \\langle ZZ\\rangle = 0$; for $\\Psi_2$: 0.866 and 1',
    stage: tq({ ket: '0+' }, { highlight: ['xx', 'zz'] }),
    claims: [claim('q6Sqrt32', '$\\Psi_2$’s $\\langle XX\\rangle$ is 0.866', () => close(V.q6Psi2ExpXX, Math.sqrt(3) / 2))],
  },
  {
    id: 'q6-parities:b7',
    phase: 'clue',
    text: 'Read $\\Phi^+$ and $\\Phi^-$ qubit by qubit in the 0,1 basis. Can the readings tell them apart?',
    formal: 'Can separate $Z_1$ and $Z_2$ readings distinguish $\\Phi^+$ from $\\Phi^-$?',
    stage: amp({ bell: 'Phi-' }, { mode: 'probability' }),
    reveal: {
      text: 'No. Both give 00 or 11, half the time each. They differ only in $X_1X_2$: +1 for $\\Phi^+$ and −1 for $\\Phi^-$. Only a two-qubit question sees the difference, which is why the circuit needs the CNOT.',
      formal: 'No: $P(00) = P(11) = \\tfrac12$ for both. They differ only in the eigenvalue of XX, a correlation no single-qubit reading measures; the CNOT converts it into a local bit (notes p. 28).',
      caption: '$\\Phi^-$: $xx = -1$, where $\\Phi^+$ has +1',
      stage: tq({ bell: 'Phi-' }, { highlight: ['xx'] }),
      claims: [claim('q6Half', 'each of $\\Phi^+$ and $\\Phi^-$ reads 00 or 11 half the time', () => close(V.q6Half, 0.5))],
    },
  },
]

export const Q6_STORY: Record<string, Beat[]> = {
  'q6-many': many,
  'q6-tensor': tensor,
  'q6-entangled': entangled,
  'q6-bell-basis': bellBasis,
  'q6-bell-circuit': bellCircuit,
  'q6-parities': parities,
}
