/**
 * Arcade v1 (Phase 4a item 5): three games whose every verdict comes from the engine (physics/sg.ts, spin.ts).
 * Each level names the chapter it trains, so a game links back into the story. Solutions live here for the tests
 * (games.test.ts proves each one reaches its target and each starting position does not) and are never shown.
 *
 * Lecture tags: a game trains the lecture whose unit ids it lists. Bloch golf trains rotations: the quarter turns
 * train Unit 6.3 (active rotations); the full-turn level stays with Lecture 7 §7.2 (the 360° sign), not built yet.
 */
import type { Axis, Bench, Sign } from '../physics/sg'
import type { NamedKet } from '../physics/spin'

export type GameKind = 'sg-puzzle' | 'spot-the-error' | 'bloch-golf'

/** A chapter a level trains: lecture id + unit id (the unit id is the chapter's anchor on the lecture page). */
export interface Trains {
  lecture: string
  unit: string
  label: string
}

// ── Route the beam (sg-puzzle) ─────────────────────────────────────────────────────────────────────────────
export interface SgLevel {
  id: string
  title: string
  source: Bench['source']
  /** the plate spot that counts, and the exact fraction of the source's atoms that must land there */
  target: { spot: 'plus' | 'minus'; fraction: number; label: string }
  maxDevices: number
  start: { axes: Axis[]; keep: Sign[] }
  hint: string
  why: string
  solution: { axes: Axis[]; keep: Sign[] }
  trains: Trains
}

const SEQ: Trains = { lecture: 'L1', unit: 'l1-sequential', label: '1.2 A new axis erases the old answer' }
const AVG: Trains = { lecture: 'L1', unit: 'l1-average', label: '1.3 Single atoms are random, averages are classical' }
const LOGIC: Trains = { lecture: 'L1', unit: 'l1-logic', label: '1.4 When "or" depends on the order' }
const VEC: Trains = { lecture: 'L1', unit: 'l1-vectors', label: '1.5 States are vectors' }
const QUANT: Trains = { lecture: 'L1', unit: 'l1-quantized', label: '1.1 Two spots, not a smear' }
const ROT: Trains = { lecture: 'L7', unit: 'rotations', label: 'Rotations (Lecture 7)' }
const L2x = (unit: string, label: string): Trains => ({ lecture: 'L2', unit, label })
const VS2 = L2x('l2-vector-space', '2.1 Kets add and scale like vectors')
const IP2 = L2x('l2-inner-product', '2.2 Overlap: the inner product gives coordinates')
const CX2 = L2x('l2-complex', '2.3 Numbers that turn')
const PY2 = L2x('l2-plus-y', '2.4 Real numbers cannot make +y')
const TB2 = L2x('l2-three-bases', '2.5 Three bases, each blind to the others')
const L3x = (unit: string, label: string): Trains => ({ lecture: 'L3', unit, label })
const OP3 = L3x('l3-operators', '3.1 Operators: machines that turn states into states')
const EIG3 = L3x('l3-eigen', '3.2 Directions an operator only stretches')
const PR3 = L3x('l3-projectors', '3.3 Projectors keep one part of a state')
const PO3 = L3x('l3-postulates', '3.4 Three rules for every measurement')
const EX3 = L3x('l3-spin-example', '3.5 One spin, measured from start to finish')
const SP3 = L3x('l3-spread', '3.6 Averages and spreads of many readings')
const L4x = (unit: string, label: string): Trains => ({ lecture: 'L4', unit, label })
const BA4 = L4x('l4-basis', '4.1 Four principles and a complete basis')
const PR4 = L4x('l4-projectors', '4.2 A projector asks a yes/no question')
const EX4 = L4x('l4-example', '4.3 One state, the whole prediction')
const AV4 = L4x('l4-average', '4.4 The average that no atom reads')
const MA4 = L4x('l4-matrices', '4.5 Spin matrices built from their outcomes')
const EI4 = L4x('l4-eigen', '4.6 From a matrix back to outcomes')
const L5x = (unit: string, label: string): Trains => ({ lecture: 'L5', unit, label })
const AV5 = L5x('l5-averages', '5.1 Three averages from one column')
const IN5 = L5x('l5-inverse', '5.2 Matrix in, outcomes and states out')
const CO5 = L5x('l5-coordinates', '5.3 Same state, new coordinates')
const OP5 = L5x('l5-operators', '5.4 Operators change coordinates too')
const IV5 = L5x('l5-invariance', '5.5 Predictions ignore the coordinates')
const L6x = (unit: string, label: string): Trains => ({ lecture: 'L6', unit, label })
const BL6 = L6x('l6-bloch', '6.1 Three averages make a point')
const EQ6 = L6x('l6-equator', '6.2 Relative phase sets the longitude')
const AC6 = L6x('l6-active', '6.3 Turn the state, keep the axes')
const GE6 = L6x('l6-generator', '6.4 Sz generates the turn')
const MX6 = L6x('l6-mixture', '6.5 Superposition or mixture?')

export const SG_LEVELS: SgLevel[] = [
  {
    id: 'quarter',
    title: 'A quarter of the oven',
    source: 'oven',
    target: { spot: 'plus', fraction: 1 / 4, label: '¼' },
    maxDevices: 2,
    start: { axes: ['z'], keep: [] },
    hint: 'One magnet halves the oven beam. What does a second magnet, along a different axis, do to what is left?',
    why: 'A magnet at 90° to the previous one splits its input 50/50, so ½ × ½ = ¼ of the oven reaches the + spot.',
    solution: { axes: ['z', 'x'], keep: ['+'] },
    trains: SEQ,
  },
  {
    id: 'erased',
    title: 'Make up atoms land down',
    source: '+z',
    target: { spot: 'minus', fraction: 1 / 4, label: '¼' },
    maxDevices: 3,
    start: { axes: ['z'], keep: [] },
    hint: 'A z magnet alone never sends a |+z⟩ atom down. Put something between the source and it.',
    why: 'The x magnet leaves the kept atoms in |+x⟩, which carries no memory of z: half of that half lands down.',
    solution: { axes: ['x', 'z'], keep: ['+'] },
    trains: SEQ,
  },
  {
    id: 'eighth',
    title: 'An eighth',
    source: 'oven',
    target: { spot: 'plus', fraction: 1 / 8, label: '⅛' },
    maxDevices: 3,
    start: { axes: ['z'], keep: [] },
    hint: 'Each change of axis halves the beam again.',
    why: 'z, then x, then z: three independent 50/50 splits, ½ × ½ × ½ = ⅛.',
    solution: { axes: ['z', 'x', 'z'], keep: ['+', '+'] },
    trains: SEQ,
  },
  {
    id: 'none',
    title: 'Nothing on the plus spot',
    source: 'oven',
    target: { spot: 'plus', fraction: 0, label: '0' },
    maxDevices: 2,
    start: { axes: ['z'], keep: [] },
    hint: 'Which output of the first magnet would a second magnet along the same axis never send up?',
    why: 'Keep the − beam of a z magnet and measure z again: a repeated measurement repeats its answer, so none go +.',
    solution: { axes: ['z', 'z'], keep: ['-'] },
    trains: QUANT,
  },
  {
    id: 'three-quarters',
    title: 'Three quarters',
    source: '+z',
    target: { spot: 'plus', fraction: 3 / 4, label: '¾' },
    maxDevices: 2,
    start: { axes: ['z'], keep: [] },
    hint: 'Tilt the magnet. A |+z⟩ atom goes + with probability cos²(θ/2), where θ is the tilt.',
    why: 'cos²(60°/2) = cos² 30° = ¾. (At 45° it would be cos² 22.5° ≈ 0.854: the lecture notes’ 45° slip, see the errata.)',
    solution: { axes: [60], keep: [] },
    trains: AVG,
  },
  {
    id: 'sideways',
    title: 'Sideways',
    source: '+x',
    target: { spot: 'plus', fraction: 1 / 4, label: '¼' },
    maxDevices: 2,
    start: { axes: ['x'], keep: [] },
    hint: 'The beam starts along x. Which axis is at 90° to x, other than z?',
    why: 'y is at 90° to x too: |+x⟩ splits 50/50 along y, and the kept |+y⟩ splits 50/50 along x again.',
    solution: { axes: ['y', 'x'], keep: ['+'] },
    trains: SEQ,
  },
  {
    id: 'three-eighths-y',
    title: 'Three eighths of a +y beam',
    source: '+y',
    target: { spot: 'plus', fraction: 3 / 8, label: '⅜' },
    maxDevices: 2,
    start: { axes: ['z'], keep: [] },
    hint: 'Every magnet in the x–z plane splits a +y beam 50/50. What can a second magnet do with what the first one keeps?',
    why: 'The $y$ axis is at right angles to every x–z axis, so the first magnet passes ½. A 30° magnet leaves atoms that an $x$ magnet passes with $(1 + \\sin 30^\\circ)/2 = \\tfrac34$, and ½ × ¾ = ⅜.',
    solution: { axes: [30, 'x'], keep: ['+'] },
    trains: TB2,
  },
  {
    id: 'repeat-fail',
    title: 'Make the repeat fail',
    source: '+x',
    target: { spot: 'minus', fraction: 1 / 8, label: '⅛' },
    maxDevices: 3,
    start: { axes: ['z', 'z'], keep: ['+'] },
    hint: 'Two $z$ magnets in a row always agree. What could go between them?',
    why: 'An $x$ magnet leaves $|{\\pm x}\\rangle$, which splits 50/50 on the last $z$ magnet: ½ × ½ × ½ = ⅛.',
    solution: { axes: ['z', 'x', 'z'], keep: ['+', '+'] },
    trains: EX3,
  },
  {
    id: 'second-filter-free',
    title: 'The second filter is free',
    source: '+x',
    target: { spot: 'plus', fraction: 1 / 2, label: '½' },
    maxDevices: 3,
    start: { axes: ['z', 'x', 'z'], keep: ['+', '+'] },
    hint: 'A projector applied twice is the same projector. Which middle filter would lose no atoms?',
    why: 'Once an atom passes the “up along $z$?” filter, the same filter passes it again: $\\hat P_{+z}^2 = \\hat P_{+z}$. Only the first filter costs anything, ½ of the atoms.',
    solution: { axes: ['z', 'z', 'z'], keep: ['+', '+'] },
    trains: PR4,
  },
  {
    id: 'one-eighth-down',
    title: 'One eighth down',
    source: 'oven',
    target: { spot: 'minus', fraction: 1 / 8, label: '⅛' },
    maxDevices: 2,
    start: { axes: ['z'], keep: [] },
    hint: 'First make a state whose $z$ odds are 3 : 1. A tilted magnet can.',
    why: 'The + beam of a magnet tilted 60° from $z$ toward $x$ is $\\tfrac{\\sqrt3}{2}|{+z}\\rangle + \\tfrac12|{-z}\\rangle$. Half the oven passes it, and ¼ of those read −: ½ × ¼ = ⅛.',
    solution: { axes: [60, 'z'], keep: ['+'] },
    trains: EX4,
  },
  {
    id: 'purify-then-tilt',
    title: 'Purify, then tilt',
    source: 'oven',
    target: { spot: 'plus', fraction: 3 / 8, label: '⅜' },
    maxDevices: 2,
    start: { axes: ['z'], keep: [] },
    hint: 'One magnet alone gives ½ from the oven at any angle, because the oven sits at the centre of the Bloch ball. Filter first.',
    why: 'Keeping + makes a pure $|{+z}\\rangle$ beam of ½ of the atoms. A magnet tilted 60° passes $\\cos^2 30^\\circ = \\tfrac34$ of it: ½ × ¾ = ⅜ (Unit 6.5).',
    solution: { axes: ['z', 60], keep: ['+'] },
    trains: MX6,
  },
]

// ── Spot the error ─────────────────────────────────────────────────────────────────────────────────────────
export interface ErrorRound {
  id: string
  title: string
  /** the argument, one step per line (TeX allowed); exactly one step is wrong */
  steps: string[]
  wrong: number
  why: string
  trains: Trains
}

export const ERROR_ROUNDS: ErrorRound[] = [
  {
    id: 'tilt-45',
    title: 'A magnet tilted by 45°',
    steps: [
      'The first magnet keeps the + beam, so every atom leaving it is in $|{+z}\\rangle$.',
      'The second magnet is tilted by $\\theta = 45^\\circ$ from $z$.',
      'For spin, $P(+) = \\cos^2\\theta$, the same rule as for a polarizer.',
      'So half of the atoms, $\\cos^2 45^\\circ = \\tfrac12$, land in the + spot.',
    ],
    wrong: 2,
    why: 'Spin uses the half angle: $P(+) = \\cos^2\\tfrac{\\theta}{2} = \\cos^2 22.5^\\circ \\approx 0.854$. The polarizer rule $\\cos^2\\theta$ belongs to photons (Lecture 1, clue on photons).',
    trains: AVG,
  },
  {
    id: 'memory',
    title: 'Does the beam remember z?',
    steps: [
      'A $z$ magnet keeps its + beam: the atoms are in $|{+z}\\rangle$.',
      'An $x$ magnet keeps its + beam: half of those atoms pass.',
      'The passing atoms still remember they were $+z$, so a final $z$ magnet sends all of them up.',
      'So the plate shows a single spot.',
    ],
    wrong: 2,
    why: 'The $x$ measurement leaves the atoms in $|{+x}\\rangle$, which splits 50/50 along $z$: the plate shows two spots of equal size.',
    trains: SEQ,
  },
  {
    id: 'average-zero',
    title: 'An average of zero',
    steps: [
      'For $|{+z}\\rangle$ and a magnet along $\\hat n$ at angle $\\theta$, the average reading is $\\langle\\sigma_n\\rangle = \\cos\\theta$.',
      'At $\\theta = 90^\\circ$ the average reading is $0$.',
      'So every atom lands in the middle of the plate, at reading $0$.',
    ],
    wrong: 2,
    why: 'Each atom still reads $+1$ or $-1$, each half the time; only the average is $0$. Nothing ever lands in the middle.',
    trains: AVG,
  },
  {
    id: 'amplitude-not-probability',
    title: 'Reading off a probability',
    steps: [
      '$|{+x}\\rangle = \\tfrac{1}{\\sqrt2}\\,(|{+z}\\rangle + |{-z}\\rangle)$.',
      'The coefficient of $|{+z}\\rangle$ is $\\tfrac{1}{\\sqrt2}$.',
      'So a $z$ magnet sends a fraction $\\tfrac{1}{\\sqrt2} \\approx 0.71$ of the atoms to +.',
      'The rest, about $0.29$, go to −.',
    ],
    wrong: 2,
    why: 'Probabilities are squared magnitudes: $|\\tfrac{1}{\\sqrt2}|^2 = \\tfrac12$. The two fractions must add to 1, and $0.71 + 0.71$ does not.',
    trains: VEC,
  },
  {
    id: 'order',
    title: '"Up or right", in either order',
    steps: [
      'Prepare $|{+z}\\rangle$ and measure $z$ first: the answer is always up.',
      'Then measure $x$: right or left, half the time each.',
      '"Up or right" is true whenever up is, so with $z$ first it is never false.',
      'The order of the two measurements cannot matter, so with $x$ first it is never false either.',
    ],
    wrong: 3,
    why: 'With $x$ first, half the atoms read left and then half of those read down: "up or right" is false $\\tfrac12 \\times \\tfrac12 = \\tfrac14$ of the time.',
    trains: LOGIC,
  },
  {
    id: 'minus-is-down',
    title: 'Minus up is down?',
    steps: [
      '$-|{+z}\\rangle$ is a ket: rule 6 with $\\lambda = -1$.',
      'It has length 1.',
      'It points opposite to $|{+z}\\rangle$, so it is the state $|{-z}\\rangle$.',
      'So $-|{+z}\\rangle$ is orthogonal to $|{+z}\\rangle$.',
    ],
    wrong: 2,
    why: '$-|{+z}\\rangle$ is the **same** state as $|{+z}\\rangle$: every probability is unchanged, and its overlap with $|{+z}\\rangle$ is $-1$, not 0.',
    trains: VS2,
  },
  {
    id: 'x-probs-add',
    title: 'Probabilities in the new basis',
    steps: [
      'Take $\\alpha = 0.866$ and $\\beta = 0.5$ in the $z$ basis.',
      'The $x$ coordinate is $\\delta = (\\alpha+\\beta)/\\sqrt2 = 0.966$.',
      'The other is $\\varepsilon = (\\alpha-\\beta)/\\sqrt2 = 0.259$.',
      'So the $x$-basis probabilities add to $0.966 + 0.259 = 1.225$.',
    ],
    wrong: 3,
    why: 'Probabilities are squared sizes: $0.933 + 0.067 = 1$. A total above 1 is the giveaway.',
    trains: IP2,
  },
  {
    id: 'modulus-square',
    title: 'The size of 1 + i',
    steps: [
      'Take $z = 1 + i$.',
      'Its size squared is $|z|^2 = z^2$.',
      '$z^2 = 1 + 2i + i^2 = 2i$.',
      'So $|z| = \\sqrt{2i}$.',
    ],
    wrong: 1,
    why: 'The size squared is $z^*z = (1-i)(1+i) = 2$, so $|z| = \\sqrt2$. A size is always a real number.',
    trains: CX2,
  },
  {
    id: 'forgot-conjugate',
    title: 'A state of length zero?',
    steps: [
      'In the $z$ basis, $|{+y}\\rangle = (1, i)/\\sqrt2$.',
      'Its bra is the row $(1, i)/\\sqrt2$.',
      'So $\\langle{+y}|{+y}\\rangle = (1 + i^2)/2 = 0$.',
      'A state of length 0 is impossible, so this $|{+y}\\rangle$ is wrong.',
    ],
    wrong: 1,
    why: 'The bra conjugates each entry, so it is $(1, -i)/\\sqrt2$ and the length is $(1 - i^2)/2 = 1$.',
    trains: PY2,
  },
  {
    id: 'rows-or-columns',
    title: 'Rows or columns?',
    steps: [
      '$\\hat B|{+z}\\rangle = |{+z}\\rangle + 2|{-z}\\rangle$.',
      '$\\hat B|{-z}\\rangle = 3|{-z}\\rangle$.',
      'So the first **row** of the matrix $B$ is $(1, 2)$.',
      'So $B_{12} = \\langle{+z}|\\hat B|{-z}\\rangle = 2$.',
    ],
    wrong: 2,
    why: 'The images are the **columns**: column 1 is $(1, 2)$. So $B_{12} = \\langle{+z}|\\hat B|{-z}\\rangle = 0$, while $B_{21} = 2$.',
    trains: OP3,
  },
  {
    id: 'completeness-any-two',
    title: 'Completeness with any two states?',
    steps: [
      '$\\hat P_{+z}$ keeps the $|{+z}\\rangle$ part of a state.',
      '$\\hat P_{+x}$ keeps the $|{+x}\\rangle$ part.',
      'Together they cover every state, so $\\hat P_{+z} + \\hat P_{+x} = \\hat 1$.',
      'So the probabilities of $+z$ and of $+x$ add to 1 for every state.',
    ],
    wrong: 2,
    why: 'Completeness needs an orthonormal basis, and $|{+z}\\rangle$ and $|{+x}\\rangle$ overlap. For $|{+z}\\rangle$ itself the “sum” is $1 + \\tfrac12 = 1.5$.',
    trains: PR3,
  },
  {
    id: 'magnet-applies-operator',
    title: 'Does the magnet apply the operator?',
    steps: [
      '$|{+x}\\rangle$ enters an SG$_z$ magnet, and we keep the + beam.',
      'The magnet measures $S_z$, so the atom leaves in the state $\\hat S_z|{+x}\\rangle$.',
      '$\\hat S_z|{+x}\\rangle = \\tfrac{\\hbar}{2}|{-x}\\rangle$, which points along $|{-x}\\rangle$.',
      'So a following SG$_x$ magnet sends every atom to −.',
    ],
    wrong: 1,
    why: 'Measuring is not applying $\\hat S_z$. The kept atoms leave in $|{+z}\\rangle$, which splits 50/50 on the next $x$ magnet: ¼ of the source in each spot.',
    trains: PO3,
  },
  {
    id: 'three-quarters-of-what',
    title: 'Three quarters of what? (a textbook slip)',
    steps: [
      '$|\\psi\\rangle = \\tfrac12|{+z}\\rangle + \\tfrac{i\\sqrt3}{2}|{-z}\\rangle$.',
      '$\\langle S_z\\rangle = \\tfrac14\\cdot\\tfrac{\\hbar}{2} + \\tfrac34\\cdot(-\\tfrac{\\hbar}{2}) = -\\tfrac{\\hbar}{4}$.',
      '$\\Delta S_z = \\tfrac{\\sqrt3}{4}\\hbar \\approx 0.43\\hbar$.',
      'So $+\\tfrac{\\hbar}{2}$ comes up 75 % of the time.',
    ],
    wrong: 3,
    why: 'The chance of $+\\tfrac{\\hbar}{2}$ is $|\\tfrac12|^2 = \\tfrac14$, or 25 %; the 75 % belongs to $-\\tfrac{\\hbar}{2}$. The slip is in a textbook: Townsend §1.4, Example 1.2, p. 17 (see the Lecture 3 errata).',
    trains: SP3,
  },
  {
    id: 'eigenbasis-for-free',
    title: 'An eigenbasis for free',
    steps: [
      'Every vector obeys $I|v\\rangle = |v\\rangle$, so $\\binom10$ and $\\tfrac{1}{\\sqrt2}\\binom11$ are eigenvectors of $I$.',
      'Both have length 1.',
      'Eigenvectors of a Hermitian operator are always orthogonal, so these two form an orthonormal eigenbasis.',
      'So any state can be expanded in them, with coefficients $\\langle v_i|\\psi\\rangle$.',
    ],
    wrong: 2,
    why: 'Only eigenvectors with **different** eigenvalues must be orthogonal. Here the eigenvalue 1 repeats, and the two overlap by $1/\\sqrt2 \\approx 0.707$. Gram–Schmidt repairs it (Unit 4.1).',
    trains: BA4,
  },
  {
    id: 'mean-is-zero',
    title: 'The mean is zero? (a slip in the notes)',
    steps: [
      '$\\tfrac{\\sqrt3}{2}|{+z}\\rangle + \\tfrac12|{-z}\\rangle$ gives $+\\tfrac{\\hbar}{2}$ with probability ¾ and $-\\tfrac{\\hbar}{2}$ with probability ¼.',
      'The expectation value is $\\sum_i a_i P(a_i)$.',
      'The two readings sit symmetrically about zero, so the mean is 0.',
      'A finite run of atoms scatters around this mean.',
    ],
    wrong: 2,
    why: 'Symmetric readings are not enough: the weights differ. The mean is $\\tfrac{\\hbar}{2}\\cdot\\tfrac34 - \\tfrac{\\hbar}{2}\\cdot\\tfrac14 = \\tfrac{\\hbar}{4}$. The notes’ p. 10 carries this slip over from the $|{+x}\\rangle$ example (see the Lecture 4 errata).',
    trains: AV4,
  },
  {
    id: 'forgotten-conjugate',
    title: 'The forgotten conjugate',
    steps: [
      '$|{+y}\\rangle$ is the column $\\tfrac{1}{\\sqrt2}\\binom1i$.',
      'So its bra is the row $\\tfrac{1}{\\sqrt2}(1\\;\\;i)$.',
      'Then $P_{+y} = \\tfrac12\\begin{pmatrix}1&i\\\\i&-1\\end{pmatrix}$.',
      'Finally $S_y = \\tfrac{\\hbar}{2}(P_{+y} - P_{-y})$.',
    ],
    wrong: 1,
    why: 'The bra conjugates each entry: it is $\\tfrac{1}{\\sqrt2}(1\\;\\;-i)$. Without that, the “projector” is not Hermitian and squares to zero instead of to itself.',
    trains: MA4,
  },
  {
    id: 'half-not-normal',
    title: 'Half is not normal',
    steps: [
      '$\\det(S_x - \\lambda I) = \\lambda^2 - \\tfrac{\\hbar^2}{4}$, so $\\lambda = \\pm\\tfrac{\\hbar}{2}$.',
      'For $+\\tfrac{\\hbar}{2}$, both rows give $c_2 = c_1$.',
      'Normalizing, $c_1 = c_2 = \\tfrac12$.',
      'So $|{+x}\\rangle$ is the column $\\tfrac12\\binom11$.',
    ],
    wrong: 2,
    why: 'Normalized means $|c_1|^2 + |c_2|^2 = 1$, so $c_1 = c_2 = 1/\\sqrt2$. With ½ and ½ the probabilities would add to only ½.',
    trains: EI4,
  },
  {
    id: 'l5-eigen-sign',
    title: 'The second eigenvector',
    steps: [
      '$M = \\begin{pmatrix}1&2\\\\2&1\\end{pmatrix}$ gives $\\det(M - \\lambda I) = (1-\\lambda)^2 - 4$.',
      'So the readings are $\\lambda = 3$ and $\\lambda = -1$.',
      'For $\\lambda = 3$ the top row reads $-2c_1 + 2c_2 = 0$, so $c_2 = c_1$.',
      'For $\\lambda = -1$ the top row reads $2c_1 + 2c_2 = 0$, so again $c_2 = c_1$.',
    ],
    wrong: 3,
    why: '$2c_1 + 2c_2 = 0$ means $c_2 = -c_1$: the eigenvector is $\\tfrac{1}{\\sqrt2}(1, -1)$, orthogonal to $\\tfrac{1}{\\sqrt2}(1, 1)$, as a Hermitian matrix requires (Unit 5.2).',
    trains: IN5,
  },
  {
    id: 'l5-arrow',
    title: 'Which way does B go?',
    steps: [
      '$B_{z\\leftarrow y} = \\tfrac{1}{\\sqrt2}\\begin{pmatrix}1&1\\\\ i&-i\\end{pmatrix}$ has $|{\\pm y}\\rangle$ as its columns.',
      'To get $y$ coordinates, multiply the $z$ column by $B_{z\\leftarrow y}$.',
      'For $|{+y}\\rangle$ this gives $c_y = \\tfrac12(1+i,\\ 1+i)$.',
      'So $|{+y}\\rangle$ reads + along $y$ only half the time.',
    ],
    wrong: 1,
    why: '$B_{z\\leftarrow y}$ turns $y$ coordinates into $z$ coordinates. The way back is $B_{y\\leftarrow z} = B_{z\\leftarrow y}^\\dagger$, which gives $c_y = (1, 0)$. The $x$ basis would hide this slip, since there both arrows have the same entries (Unit 5.3).',
    trains: CO5,
  },
  {
    id: 'l5-label',
    title: 'Same numbers, same spin?',
    steps: [
      'In $x$ coordinates, $S_z^{(x)} = \\tfrac{\\hbar}{2}\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$.',
      'Those are exactly the numbers of $S_x$ in $z$ coordinates.',
      'So in the $x$ basis, $S_z$ has turned into the $x$ spin.',
      'Hence $|{+z}\\rangle$ has $\\langle S_x\\rangle = \\tfrac{\\hbar}{2}$.',
    ],
    wrong: 2,
    why: 'The subscript names the magnet and never changes; only the numbers do. For $|{+z}\\rangle$, $\\langle S_x\\rangle = 0$ in every basis (Unit 5.4).',
    trains: OP5,
  },
  {
    id: 'l5-mixed-bases',
    title: 'Half a translation',
    steps: [
      '$|{+z}\\rangle$ in $x$ coordinates is $c_x = \\tfrac{1}{\\sqrt2}(1, 1)$.',
      '$S_z$ in $z$ coordinates is $\\tfrac{\\hbar}{2}\\,\\mathrm{diag}(1, -1)$.',
      'So $\\langle S_z\\rangle = c_x^\\dagger\\,\\tfrac{\\hbar}{2}\\mathrm{diag}(1, -1)\\,c_x = 0$.',
      'So a $z$ magnet sends these atoms up and down equally often.',
    ],
    wrong: 2,
    why: 'The column and the matrix must use the same basis: $c_x^\\dagger S_z^{(x)}c_x = \\tfrac{\\hbar}{2}$, so every atom goes up. Step 4 only repeats the mixed-up result (Unit 5.5).',
    trains: IV5,
  },
  {
    id: 'opposite-is-minus',
    title: 'Opposite means minus?',
    steps: [
      '$|{+z}\\rangle$ sits at the north pole, $(0, 0, 1)$.',
      '$|{-z}\\rangle$ sits at the south pole, $(0, 0, -1)$.',
      'Opposite points are negatives of each other, so $|{-z}\\rangle = -|{+z}\\rangle$.',
      'Then $\\langle{+z}|{-z}\\rangle = -1$.',
    ],
    wrong: 2,
    why: 'Opposite points are orthogonal states: $\\langle{+z}|{-z}\\rangle = 0$. The vector $-|{+z}\\rangle$ is the same state as $|{+z}\\rangle$ and sits on the north pole with it (Unit 6.1).',
    trains: BL6,
  },
  {
    id: 'phase-in-disguise',
    title: 'A phase that does not count',
    steps: [
      '$|{+y}\\rangle = \\tfrac{1}{\\sqrt2}(|{+z}\\rangle + i|{-z}\\rangle)$.',
      'Multiply the whole state by $i$: $\\tfrac{1}{\\sqrt2}(i|{+z}\\rangle - |{-z}\\rangle)$.',
      'Its $|{-z}\\rangle$ amplitude is now $-\\tfrac{1}{\\sqrt2}$, just as in $|{-x}\\rangle$.',
      'So multiplying by $i$ turned $|{+y}\\rangle$ into $|{-x}\\rangle$.',
    ],
    wrong: 3,
    why: 'Only the ratio $\\beta/\\alpha$ matters, and $(-1)/i = i$: the state is still $|{+y}\\rangle$. An overall factor moves no point on the sphere (Unit 6.2).',
    trains: EQ6,
  },
  {
    id: 'small-turn-sign',
    title: 'A sign slip in the small turn',
    steps: [
      '$R_z(\\varphi) = e^{-i\\varphi S_z/\\hbar}$.',
      'Keep two terms: $R_z(d\\varphi) \\approx I + \\tfrac{i}{\\hbar}S_z\\,d\\varphi$.',
      'Apply it to $|{+x}\\rangle$ with $d\\varphi = 0.001$.',
      'So the point moves toward $-y$: $R_z$ turns clockwise.',
    ],
    wrong: 1,
    why: '$e^{-iM} \\approx I - iM$. Step 4 only follows the slip; with the correct sign the point moves toward $+y$ (Unit 6.4).',
    trains: GE6,
  },
]

// ── Bloch golf ─────────────────────────────────────────────────────────────────────────────────────────────
export interface Move {
  axis: 'x' | 'y' | 'z'
  /** +1: a quarter turn by +90° (right-hand rule); −1: by −90° */
  sign: 1 | -1
}

export interface GolfLevel {
  id: string
  title: string
  start: NamedKet
  target: NamedKet
  par: number
  /** the level only counts once at least this many moves were made (the full-turn level) */
  minMoves?: number
  hint: string
  why: string
  solution: Move[]
  trains: Trains
}

export const GOLF_LEVELS: GolfLevel[] = [
  {
    id: 'z-to-x',
    title: 'Up to right',
    start: '+z',
    target: '+x',
    par: 1,
    hint: 'Turn about the axis that is perpendicular to both z and x.',
    why: 'A quarter turn about +y (right-hand rule) carries +z onto +x.',
    solution: [{ axis: 'y', sign: 1 }],
    trains: AC6,
  },
  {
    id: 'x-to-y',
    title: 'Around the equator',
    start: '+x',
    target: '+y',
    par: 1,
    hint: 'Both states lie on the equator. Which axis is the equator turned about?',
    why: 'R_z(90°) turns +x into +y; it only changes the relative phase of the z amplitudes.',
    solution: [{ axis: 'z', sign: 1 }],
    trains: AC6,
  },
  {
    id: 'z-to-minus-y',
    title: 'Up to −y',
    start: '+z',
    target: '-y',
    par: 1,
    hint: 'Curl the fingers of your right hand from z toward −y. Where does your thumb point?',
    why: 'About +x by +90°: x × z = −y, so +z goes to −y.',
    solution: [{ axis: 'x', sign: 1 }],
    trains: AC6,
  },
  {
    id: 'flip',
    title: 'Upside down',
    start: '+z',
    target: '-z',
    par: 2,
    hint: 'Two quarter turns about the same axis make a half turn.',
    why: 'Two quarter turns about x (or y) are a 180° turn: +z goes to −z, an orthogonal state.',
    solution: [
      { axis: 'x', sign: 1 },
      { axis: 'x', sign: 1 },
    ],
    trains: AC6,
  },
  {
    id: 'full-turn',
    title: 'All the way round',
    start: '+z',
    target: '+z',
    par: 4,
    minMoves: 4,
    hint: 'Make four quarter turns about one axis and come back to where you started.',
    why: 'Four quarter turns are 360°: the arrow is back, but the ket is −|+z⟩. Same physical state, opposite sign: the 720° story of Lecture 7 §7.2.',
    solution: [
      { axis: 'x', sign: 1 },
      { axis: 'x', sign: 1 },
      { axis: 'x', sign: 1 },
      { axis: 'x', sign: 1 },
    ],
    trains: ROT,
  },
  {
    id: 'c-times-minus-i',
    title: 'From +x to −y in one move',
    start: '+x',
    target: '-y',
    par: 1,
    hint: 'Multiplying $c$ in $(|{+z}\\rangle + c|{-z}\\rangle)/\\sqrt2$ by $-i$ is a quarter turn clockwise, seen from $+z$.',
    why: 'A −90° turn about $z$ carries $+x$ to $-y$, just as $c = 1$ times $-i$ gives $c = -i$ (Lecture 2, Unit 2.5).',
    solution: [{ axis: 'z', sign: -1 }],
    trains: AC6,
  },
  {
    id: 'y-eigen',
    title: 'Turning about y does nothing here',
    start: '+y',
    target: '-y',
    par: 2,
    hint: 'Try a quarter turn about $y$ first. Why does nothing move?',
    why: '$|{\\pm y}\\rangle$ are eigenvectors of every turn about $y$: the turn only multiplies them by a phase. You must turn about another axis, twice.',
    solution: [
      { axis: 'z', sign: 1 },
      { axis: 'z', sign: 1 },
    ],
    trains: EIG3,
  },
  {
    id: 'l5-aim-by-averages',
    title: 'Aim by averages',
    start: '+x',
    target: '-z',
    par: 1,
    hint: 'The target is named only by its averages, $(\\langle S_x\\rangle, \\langle S_y\\rangle, \\langle S_z\\rangle) = (0, 0, -\\tfrac{\\hbar}{2})$. Which named state is that?',
    why: 'Only the $z$ average is nonzero, and it is negative: that is $|{-z}\\rangle$. A quarter turn about $y$ carries $+x$ to $-z$ (Unit 5.1).',
    solution: [{ axis: 'y', sign: 1 }],
    trains: AV5,
  },
  {
    id: 'y-back-to-x',
    title: 'The other way round',
    start: '+y',
    target: '+x',
    par: 1,
    hint: 'A positive turn about $z$ carries $+x$ to $+y$. How do you undo it?',
    why: '$R_z(-90^\\circ) = R_z(90^\\circ)^\\dagger$ turns clockwise, seen from $+z$, and undoes the quarter turn (Unit 6.3).',
    solution: [{ axis: 'z', sign: -1 }],
    trains: AC6,
  },
]

export interface GameEntry {
  id: string
  kind: GameKind
  title: string
  blurb: string
  levels: number
  trains: Trains[]
}

const uniq = (t: Trains[]) => t.filter((x, i) => t.findIndex((y) => y.unit === x.unit) === i)

export const GAMES: GameEntry[] = [
  {
    id: 'route-the-beam',
    kind: 'sg-puzzle',
    title: 'Route the beam',
    blurb: 'Build a chain of magnets that lands exactly the asked-for fraction of atoms on one spot.',
    levels: SG_LEVELS.length,
    trains: uniq(SG_LEVELS.map((l) => l.trains)),
  },
  {
    id: 'spot-the-error',
    kind: 'spot-the-error',
    title: 'Spot the error',
    blurb: 'Each argument goes wrong at one step, the kind of slip real notes and real students make. Find where it first goes wrong.',
    levels: ERROR_ROUNDS.length,
    trains: uniq(ERROR_ROUNDS.map((r) => r.trains)),
  },
  {
    id: 'bloch-golf',
    kind: 'bloch-golf',
    title: 'Bloch golf',
    blurb: 'Steer a spin state to a target with as few quarter-turns as you can.',
    levels: GOLF_LEVELS.length,
    trains: uniq(GOLF_LEVELS.map((l) => l.trains)),
  },
]
