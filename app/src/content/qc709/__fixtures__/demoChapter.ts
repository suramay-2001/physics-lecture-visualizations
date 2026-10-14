/**
 * DEV fixture: a demo Physics 709 chapter ("Q0") that exercises the platform before any real chapter is written:
 * per-course meta generation (content/meta.test.ts), the id namespaces (content/courses.test.ts), the 709 chapter
 * page at the DEV-only route `#/709/ch/Q0` (pages/Chapter709Page.tsx), and part B: both tracks on every beat and
 * reveal, one derivation, the per-track lints (symbols, claims, sentence caps), the track toggle
 * (e2e/bridge.spec.ts), print notes and figures (figures.test.tsx, e2e/print.spec.ts). The stage-kind batch adds two
 * units: q0-demo-kinds walks every SVG kind and field (complex-plane, amplitudes, circuit and their split, and
 * matrix: a gate's grid, a beat-to-beat transition of the same size, and ρ's Tr_B partial trace) in an SVG-only
 * unit, and q0-demo-fields walks Q1's fields on the shared WebGL kinds (sumOf, arcLabel, the 709 passports,
 * gradientScale, the 709 fidelity note); e2e/story.spec.ts checks every beat of both in both tracks.
 *
 * NEVER SHIPS: it lives under `__fixtures__/` (outside the chapter glob `qc709/[QF]*.ts`), and the only app imports
 * are behind `import.meta.env.DEV`; build/chunks.test.ts fails if any chunk of a production build holds it.
 * Wording is W's placeholder, not course content; every number comes from the engine (claims keyed `q0…`, their
 * analytic twins in content/claims.test.ts).
 */
import type { BridgeTarget } from '../../bridgeRegistry'
import { keyedClaim, pct, d } from '../../claimKit'
import { abs, add, c } from '../../../physics/complex'
import { norm, vadd, vec } from '../../../physics/linalg'
import { KET, prob } from '../../../physics/spin'
import { codewords } from '../../../physics/qec/codewords'
import { runCircuit } from '../../../physics/qc/circuit'
import { marginal } from '../../../physics/qc/measure'
import { registeredCode } from '../../../physics/qec/registry'
import type { GlossEntry, Lecture } from '../../schema'
import type { StageLayout } from '../../stage'
import type { Circuit } from '../../../physics/qc/circuit'

export const DEMO_CHAPTER_ID = 'Q0'

/**
 * The demo's bridges into Spin Lab (real chapters use content/qc709/bridges.ts): one to a unit, one to a beat.
 * Registered by pages/Chapter709Page.tsx in DEV only; content/qc709/bridges.test.ts resolves both targets.
 */
export const DEMO_BRIDGES: Readonly<Record<string, BridgeTarget>> = {
  'qc-demo-complex': { course: 'sl448', lecture: 'L2', unit: 'l2-complex', label: 'complex numbers as turns in the plane' },
  'qc-demo-equator': { course: 'sl448', lecture: 'L6', unit: 'l6-equator', beat: 'l6-equator:b2', label: 'the relative phase picks the point on the equator' },
}

/** The demo's glossary: one entry in both tracks, with a bridge in its popover, and the notation-beat example (W-709 #12). */
export const DEMO_GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-demo-amplitude',
    term: 'amplitude',
    gloss: 'One of the numbers in a state’s column; its size, squared, is the chance of that outcome.',
    formal: 'A coefficient of the state in a chosen orthonormal basis; by the Born rule its squared modulus is the probability of that outcome.',
    first: 'q0-demo-sphere:b3',
    bridge: 'qc-demo-complex',
    introduces: 'notation',
  },
]

/**
 * S4 (stage-code agent; P-Q21-story §9.2, P-Q22-story §9.2): the error-correction chapters' circuits, as the plans define them. `bfCircuit(e)` is C_BF: the bit-flip
 * code on q0–q2 with helpers q3, q4: Ry(θ) on q0 with cos(θ/2) = 0.6, two CNOTs, an error (none, X on q1, Rx(60°) on q1), the four parity CNOTs, the two readings and the
 * fix X on q0 / q1 / q2 conditioned on the helper bits 10 / 11 / 01 (10 columns). `pfCircuit(e)` is C_PF: the phase-flip version with H on the code wires around a Z error (11 columns).
 */
const THETA_A = 2 * Math.acos(0.6)
const parityColumns = (): Circuit['columns'] => [
  [{ op: 'gate', gate: 'X', controls: [0], targets: [3] }],
  [{ op: 'gate', gate: 'X', controls: [1], targets: [3] }],
  [{ op: 'gate', gate: 'X', controls: [1], targets: [4] }],
  [{ op: 'gate', gate: 'X', controls: [2], targets: [4] }],
]
const encodeColumns = (): Circuit['columns'] => [
  [{ op: 'gate', gate: 'Ry', targets: [0], params: [THETA_A] }],
  [{ op: 'gate', gate: 'X', controls: [0], targets: [1] }],
  [{ op: 'gate', gate: 'X', controls: [0], targets: [2] }],
]
const bfCircuit = (error: 'none' | 'X2' | 'rx60'): Circuit => ({
  version: 1,
  qubits: 5,
  clbits: 2,
  columns: [
    ...encodeColumns(),
    ...(error === 'none' ? [] : [[error === 'X2' ? { op: 'gate' as const, gate: 'X' as const, targets: [1] } : { op: 'gate' as const, gate: 'Rx' as const, targets: [1], params: [Math.PI / 3] }]]),
    ...parityColumns(),
    [{ op: 'measure', qubit: 3, bit: 0 }, { op: 'measure', qubit: 4, bit: 1 }],
    [
      { op: 'gate', gate: 'X', targets: [0], cond: { bits: [0, 1], equals: '10' } },
      { op: 'gate', gate: 'X', targets: [1], cond: { bits: [0, 1], equals: '11' } },
      { op: 'gate', gate: 'X', targets: [2], cond: { bits: [0, 1], equals: '01' } },
    ],
  ],
})
const hAll = (): Circuit['columns'][number] => [0, 1, 2].map((q) => ({ op: 'gate' as const, gate: 'H' as const, targets: [q] }))
const pfCircuit: Circuit = {
  version: 1,
  qubits: 5,
  clbits: 2,
  columns: [...encodeColumns(), hAll(), [{ op: 'gate', gate: 'Z', targets: [0] }], hAll(), ...parityColumns(), [{ op: 'measure', qubit: 3, bit: 0 }, { op: 'measure', qubit: 4, bit: 1 }]],
}
/** C_ENC3: the three encoding columns on three wires. */
const enc3: Circuit = { version: 1, qubits: 3, columns: encodeColumns() }
/** The fixture's engine values: P(0) on the equator, and the size of each amplitude of |+x⟩. */
export const V = {
  q0Half: prob(KET['+z'], KET['+x']),
  q0Amp: Math.sqrt(prob(KET['+z'], KET['+x'])),
  // the stage-kind unit: |z + w| and |w| for z = 3 + 4i, w = 1 − 2i (the triangle inequality's two sides)
  q0SumAbs: abs(add(c(3, 4), c(1, -2))),
  q0WAbs: abs(c(1, -2)),
  // the fields unit: the length of the sum of the plane's unit arrows at 15° and 60° (linalg vadd, norm)
  q0PlaneSum: norm(vadd(vec(Math.cos(Math.PI / 12), Math.sin(Math.PI / 12)), vec(Math.cos(Math.PI / 3), Math.sin(Math.PI / 3)))),
  // the code unit: the size of each of the eight strings of the Steane code's logical zero (qec/codewords.ts), 1/√8
  q0CodeAmp: codewords(registeredCode('steane7')).zero[0].amp.re,
  // the circuits unit: the chance both helper wires read 1 after the Rx(60°) error (the parity CNOTs are column 8), sin²30°
  q0RxFlip: marginal(runCircuit(bfCircuit('rx60'), { outcomes: '11' }).states[8], [3, 4])[3],
} as const
const claim = keyedClaim<keyof typeof V>()
const half = claim('q0Half', 'an equator state reads 0 half the time', () => Math.abs(V.q0Half - 0.5) < 1e-12)
const amp = claim('q0Amp', 'each amplitude of |+x⟩ has size 1/√2', () => Math.abs(V.q0Amp - Math.SQRT1_2) < 1e-12)
const sumAbs = claim('q0SumAbs', '|(3 + 4i) + (1 − 2i)| = |4 + 2i|', () => Math.abs(V.q0SumAbs - Math.hypot(4, 2)) < 1e-12)
const wAbs = claim('q0WAbs', '|1 − 2i| = √5', () => Math.abs(V.q0WAbs - Math.sqrt(5)) < 1e-12)
const codeAmp = claim('q0CodeAmp', 'each of the eight strings of the Steane code’s logical zero has size 1/√8', () => Math.abs(V.q0CodeAmp - 1 / Math.sqrt(8)) < 1e-12)
const rxFlip = claim('q0RxFlip', 'after Rx(60°) on the middle qubit both helpers read 1 with chance sin²30° = ¼', () => Math.abs(V.q0RxFlip - 0.25) < 1e-12)
const planeSum = claim('q0PlaneSum', 'two unit arrows 45° apart add to length 2 cos 22.5°', () => Math.abs(V.q0PlaneSum - 2 * Math.cos(Math.PI / 8)) < 1e-12)

/** The Bell-pair circuit of the demo's split beats: H on q0, then CNOT q0 → q1 (qc/circuit.ts format). */
const BELL: Circuit = {
  version: 1,
  qubits: 2,
  columns: [[{ op: 'gate', gate: 'H', targets: [0] }], [{ op: 'gate', gate: 'X', controls: [0], targets: [1] }]],
}
/** The bit-flip code with two helper wires: H on q0, CNOTs to q1 and q2, a flip on q1, then q3 = q0 xor q1 and q4 = q1 xor q2 (the `amplitudes.keep` wire-list demo). */
const HELPERS: Circuit = {
  version: 1,
  qubits: 5,
  columns: [
    [{ op: 'gate', gate: 'H', targets: [0] }],
    [{ op: 'gate', gate: 'X', controls: [0], targets: [1] }],
    [{ op: 'gate', gate: 'X', controls: [0], targets: [2] }],
    [{ op: 'gate', gate: 'X', targets: [1] }],
    [{ op: 'gate', gate: 'X', controls: [0], targets: [3] }],
    [{ op: 'gate', gate: 'X', controls: [1], targets: [3] }],
    [{ op: 'gate', gate: 'X', controls: [1], targets: [4] }],
    [{ op: 'gate', gate: 'X', controls: [2], targets: [4] }],
  ],
}
/** Circuit on top, the state's bars below, both reading the same cursor (resolve.ts validateLayout checks it). */
const bellSplit = (upTo: number): StageLayout => ({
  layout: 'split',
  top: { kind: 'circuit', circuit: BELL, upTo, shot: 'Q-WIRES' },
  bottom: { kind: 'amplitudes', state: { circuit: BELL, upTo }, shot: 'A-BARS' },
})
/** A tour of the drawn operations: a phase gate, SWAP, Toffoli and terminal measurements. */
const TOUR: Circuit = {
  version: 1,
  qubits: 3,
  clbits: 3,
  init: '+00',
  columns: [
    [{ op: 'gate', gate: 'P', targets: [0], params: [Math.PI / 2] }, { op: 'gate', gate: 'X', targets: [2] }],
    [{ op: 'gate', gate: 'SWAP', targets: [0, 1] }],
    [{ op: 'gate', gate: 'X', controls: [1, 2], targets: [0] }],
    [{ op: 'gate', gate: 'H', targets: [1] }],
    [
      { op: 'measure', qubit: 0, bit: 0 },
      { op: 'measure', qubit: 1, bit: 1 },
      { op: 'measure', qubit: 2, bit: 2 },
    ],
  ],
}

export const Q0: Lecture = {
  id: 'Q0',
  number: 0,
  title: 'Demo chapter (DEV fixture)',
  outcomes: ['See a 709 chapter render through the shared lecture page, in both tracks.'],
  prerequisites: [],
  symbols: {
    '|\\cdot\\rangle': 'q0-demo-sphere:b1',
    '|0\\rangle': 'q0-demo-sphere:b1',
    '|+z\\rangle': 'q0-demo-sphere:b1',
    '|+x\\rangle': 'q0-demo-sphere:b2',
    P: 'q0-demo-sphere:b3',
    '|1\\rangle': 'q0-demo-sphere:b4',
    // Ground-up meets a bracket only on the review card; Formal has it from the Born-rule gloss at b3
    '\\langle\\cdot|\\cdot\\rangle': 'q0-demo-sphere.review',
  },
  // the Formal track names the rotation (Ground-up says "a quarter turn")
  symbolsFormal: { R_y: 'q0-demo-sphere:b2', '\\pi': 'q0-demo-sphere:b2' },
  units: [
    {
      id: 'q0-demo-sphere',
      title: 'A state on the sphere',
      question: 'Does a 709 chapter drive the same stage as a 448 lecture, in either track?',
      lecture: { summary: 'Demo unit: the story replaces this block.', pages: 'demo' },
      books: [],
      visual: { kind: 'bloch', props: { theta: 90, phi: 0, measure: 'z', editable: true }, tryThis: ['Drag the state to a pole.'] },
      clues: [],
      insight: 'The state $|0\\rangle$ is the north pole, the same point as $|{+z}\\rangle$ in Spin Lab.',
      insightFormal: 'Under $|0\\rangle \\equiv |{+z}\\rangle$ the computational basis sits at the poles, and every equator state gives each outcome with equal probability.',
      play: [],
      claims: [half, amp],
      review: {
        points: ['The north pole is $|0\\rangle$ and the south pole is $|1\\rangle$.', `An equator state reads 0 or 1 with ${pct(V.q0Half)} each.`],
        equations: `P(0) = |\\langle 0|{+x}\\rangle|^2 = ${'\\tfrac12'}`,
        trap: 'Opposite points on the sphere are opposite states, not a right angle apart.',
        formal: {
          points: ['Antipodal points of the Bloch sphere are orthogonal states: $\\langle 0|1\\rangle = 0$.', `Every equator state has $P(0) = P(1) = ${'\\tfrac12'}$.`],
          trap: 'A half turn on the sphere is a right angle between the kets, so antipodal points never overlap.',
        },
      },
      story: [
        {
          id: 'q0-demo-sphere:b1',
          phase: 'lecture',
          text: 'The state $|0\\rangle$ sits at the north pole of the sphere.',
          formal:
            'The computational basis state $|0\\rangle$ is the north pole of the [[bloch-sphere|Bloch sphere]], the same point as Spin Lab’s $|{+z}\\rangle$, so both courses colour it amber.',
          stage: { kind: 'bloch', state: '+z', shot: 'B-STD' },
        },
        {
          id: 'q0-demo-sphere:b2',
          phase: 'lecture',
          text: 'A quarter turn about the $y$ axis carries it down to the equator, where it becomes $|{+x}\\rangle$. Spin Lab shows <<qc-demo-equator|what picks the point on the equator>>.',
          formal:
            'The rotation $R_y(\\pi/2)$ maps $|0\\rangle$ to $|{+x}\\rangle$, the point where the equator meets the $x$ axis; <<qc-demo-equator|the phase between the two amplitudes>> selects the longitude.',
          stage: { kind: 'bloch', state: '+z', rotate: { axis: 'y', angleDeg: { from: 0, to: 90 } }, trail: true, shot: 'B-STD' },
        },
        {
          id: 'q0-demo-sphere:b3',
          phase: 'books',
          text: `On the equator the two outcomes are equally likely: ${pct(V.q0Half)} each. Each [[qc-demo-amplitude|amplitude]] may be one of the <<qc-demo-complex|complex numbers>>.`,
          formal: `By the [[born-rule|Born rule]], $P(0) = |\\langle 0|{+x}\\rangle|^2 = ${'\\tfrac12'}$, and the same holds for every state on the equator. Each [[qc-demo-amplitude|amplitude]] is one of the <<qc-demo-complex|complex numbers>>.`,
          caption: `Amplitudes ${d(V.q0Amp)} and ${d(V.q0Amp)}: the chance of 0 is ${pct(V.q0Half)}.`,
          captionFormal: `Amplitudes ${d(V.q0Amp)} and ${d(V.q0Amp)}; $P(0) = ${'\\tfrac12'}$.`,
          // the "New notation" example (W-709 #12): this beat is where qc-demo-amplitude is first used and introduced
          introduces: ['qc-demo-amplitude'],
          // the "derivations drive the stage" example (W-709 #11): the state before any basis is chosen, then the
          // z-measurement added — two distinct views in each track, the last matching this beat's own resting stage
          derivation: {
            result: `P(0) = ${'\\tfrac12'}`,
            ground: [
              {
                why: 'Write the equator state as a column of two numbers. The top slot counts 0 and the bottom slot counts 1.',
                tex: '|{+x}\\rangle = \\begin{pmatrix} 1/\\sqrt2 \\\\ 1/\\sqrt2 \\end{pmatrix}',
                view: { kind: 'bloch', state: '+x', shot: 'B-STD' },
                viewCaption: 'The state, before any measurement axis is drawn.',
              },
              {
                why: 'The chance of reading 0 is the top number, squared.',
                tex: 'P(0) = \\left(\\tfrac{1}{\\sqrt2}\\right)^2',
                view: { kind: 'bloch', state: '+x', measure: 'z', shot: 'B-STD' },
                viewCaption: 'Measuring along z picks out the top number.',
              },
              { why: 'A square root times itself gives back what was under it, so this is one over two.', tex: 'P(0) = \\tfrac{1}{\\sqrt2}\\cdot\\tfrac{1}{\\sqrt2} = \\tfrac12', claims: [half] },
            ],
            formal: [
              {
                why: 'The Born rule in the computational basis.',
                tex: 'P(0) = |\\langle 0|{+x}\\rangle|^2 = \\left|\\tfrac{1}{\\sqrt2}\\right|^2',
                view: { kind: 'bloch', state: '+x', shot: 'B-STD' },
                viewCaption: 'The state $|{+x}\\rangle$, no basis chosen yet.',
              },
              {
                why: 'Evaluate the modulus squared.',
                tex: 'P(0) = \\tfrac12',
                claims: [half],
                view: { kind: 'bloch', state: '+x', measure: 'z', shot: 'B-STD' },
                viewCaption: 'The computational-basis measurement; its top outcome is 0.',
              },
            ],
          },
          stage: { kind: 'bloch', state: '+x', measure: 'z', shot: 'B-STD' },
        },
        {
          id: 'q0-demo-sphere:b4',
          phase: 'clue',
          text: 'Where on the sphere is $|1\\rangle$?',
          formal: 'Which point of the sphere represents $|1\\rangle$?',
          stage: { kind: 'bloch', state: '+z', shot: 'B-STD' },
          reveal: {
            text: 'At the south pole, opposite $|0\\rangle$. Opposite points are states that never give the same reading.',
            formal: 'The south pole: antipodal points are [[orthogonal|orthogonal]] states, $\\langle 0|1\\rangle = 0$.',
            stage: { kind: 'bloch', state: '-z', path: { about: 'y' }, shot: 'B-STD' },
          },
        },
      ],
    },
    {
      id: 'q0-demo-plain',
      title: 'A plain unit',
      question: 'Does a unit without a story still render?',
      lecture: { summary: 'A unit with no story shows the lecture, books and clue blocks.', pages: 'demo' },
      books: [],
      visual: { kind: 'bloch', props: { theta: 0, phi: 0 }, tryThis: ['Turn the state.'] },
      clues: [{ ask: 'Where is $|1\\rangle$?', reveal: 'At the south pole, opposite $|0\\rangle$.' }],
      insight: 'Every unit of a 709 chapter uses the same parts as a 448 unit.',
      play: [
        {
          id: 'q0-demo-plain-c1',
          kind: 'numeric',
          tier: 'warm-up',
          title: 'Even odds',
          prompt: 'A state on the equator is measured in the computational basis. What is the probability of 0?',
          answer: V.q0Half,
          tolerance: 0.001,
          unit: 'probability',
          hints: [{ text: 'Where is the equator relative to the poles?' }, { text: 'Halfway between $|0\\rangle$ and $|1\\rangle$.' }, { text: 'So neither outcome is favoured.' }],
          walkthrough: [{ text: 'The equator is equidistant from both poles, so the two outcomes share the probability equally.' }],
        },
      ],
    },
    {
      // the stage-kind batch (W-709-platform §E): every SVG kind and field, in an SVG-only unit (it runs live without
      // WebGL, and the SVG layer owns its reveal and clock); the Formal texts name what the Ground-up texts describe
      id: 'q0-demo-kinds',
      title: 'Numbers, amplitudes and circuits',
      question: 'Do the SVG stage kinds scrub, change beat, reveal and print like the WebGL ones?',
      lecture: { summary: 'Demo unit: the story replaces this block.', pages: 'demo' },
      books: [],
      visual: { kind: 'complex-plane', props: { mode: 'euler', phi: 180, n: 4 }, tryThis: ['Raise n and watch the end point close in on the circle.'] },
      clues: [],
      insight: 'A number is a point and an arrow; adding is tip to tail, and multiplying turns.',
      insightFormal: 'Complex addition is vector addition in the plane, and multiplication by a number of size 1 is a rotation.',
      play: [],
      story: [
        {
          id: 'q0-demo-kinds:b1',
          phase: 'lecture',
          text: 'On the number line, −2 sits two steps left of zero and 3 sits three steps right.',
          formal: 'The real numbers lie on the horizontal axis of the complex plane: here the points −2 and 3.',
          stage: { kind: 'complex-plane', line: true, z: { re: -2, im: 0 }, w: { re: 3, im: 0 }, shot: 'C-FLAT' },
        },
        {
          id: 'q0-demo-kinds:b2',
          phase: 'lecture',
          text: 'The number 3 + 4i sits 3 across and 4 up. {{qc-demo-z|Its arrow}} has size 5, and its mirror is 3 − 4i.',
          formal: 'For z = 3 + 4i the real part is 3, the imaginary part 4, {{qc-demo-z|the modulus}} 5, and the conjugate is 3 − 4i.',
          caption: 'the right triangle 3, 4, 5',
          stage: { kind: 'complex-plane', z: { re: 3, im: 4 }, show: ['parts', 'modulus', 'conj'], shot: 'C-FLAT' },
          terms: { 'qc-demo-z': { kind: 'complex-plane', anchor: 'z' } },
        },
        {
          id: 'q0-demo-kinds:b3',
          phase: 'lecture',
          text: 'Add two numbers by putting the second arrow’s tail on the first arrow’s tip.',
          formal: 'Addition is componentwise, so the sum is the diagonal of the parallelogram, drawn tip to tail.',
          caption: `the sum is ${d(V.q0SumAbs, 3)} long, shorter than 5 + ${d(V.q0WAbs, 3)}`,
          claims: [sumAbs, wAbs],
          stage: { kind: 'complex-plane', z: { re: 3, im: 4 }, w: { re: 1, im: -2 }, show: ['sum', 'modulus'], shot: 'C-FLAT' },
        },
        {
          id: 'q0-demo-kinds:b4',
          phase: 'lecture',
          text: 'Multiplying 2 + i by 1 + 3i multiplies the two sizes and adds the two angles.',
          formal: 'In polar form the moduli multiply and the arguments add, so the product sits at the sum of the two angles.',
          stage: { kind: 'complex-plane', z: { re: 2, im: 1 }, w: { re: 1, im: 3 }, show: ['product', 'arg'], shot: 'C-FLAT' },
        },
        {
          id: 'q0-demo-kinds:b5',
          phase: 'lecture',
          text: 'Multiplying by i twice turns the arrow to 1 half a turn, to −1. At every moment it moves sideways to itself.',
          formal: 'The path of e to the power iφ is the unit circle; its velocity is i times its position, always at right angles to it.',
          stage: { kind: 'complex-plane', z: { r: 1, phiDeg: { from: 0, to: 180 } }, trail: true, show: ['arc', 'velocity'], shot: 'C-FLAT' },
        },
        {
          id: 'q0-demo-kinds:b6',
          phase: 'books',
          text: 'The powers of 1 + i spiral outward: each step turns by 45 degrees and stretches.',
          formal: 'By de Moivre the powers of 1 + i turn by 45° per step while their modulus grows geometrically.',
          stage: { kind: 'complex-plane', powers: { of: { re: 1, im: 1 }, upTo: { from: 0, to: 8 } }, shot: 'C-FLAT' },
        },
        {
          id: 'q0-demo-kinds:b7',
          phase: 'books',
          text: 'Many small turns close in on the circle: the end point creeps toward −1.',
          formal: 'The polygon of the compound turns closes on the unit circle as the number of steps grows.',
          stage: { kind: 'complex-plane', euler: { rate: 'imag', phiDeg: 180, n: { from: 1, to: 64 } }, shot: 'C-FLAT' },
        },
        {
          id: 'q0-demo-kinds:b8',
          phase: 'books',
          text: 'Two arrows of size 1, tip to tail: turning the second one shrinks their sum to zero.',
          formal: 'The sum of two unit phasors has modulus squared equal to 2 plus twice the cosine of their phase difference.',
          stage: { kind: 'complex-plane', chain: { phasesDeg: [0, { from: 0, to: 180 }] }, shot: 'C-FLAT' },
        },
        {
          id: 'q0-demo-kinds:b9',
          phase: 'books',
          text: 'The state along +y has two amplitudes of the same size. The second one is turned a quarter turn.',
          formal: 'The state along +y has amplitudes of equal modulus; the second carries the [[relative-phase|relative phase]] i, a quarter turn.',
          stage: { kind: 'amplitudes', state: { dir: '+y' }, labels: 'spin', dials: true, shot: 'A-BARS' },
        },
        {
          id: 'q0-demo-kinds:b10',
          phase: 'books',
          text: 'Turn the second amplitude: the two chances stay equal, but the two arrows added tip to tail shrink.',
          formal: 'A relative phase leaves both probabilities unchanged but changes the modulus of the sum of the amplitudes.',
          stage: { kind: 'amplitudes', state: { dir: { thetaDeg: 90, phiDeg: { from: 0, to: 180 } } }, dials: true, sum: [0, 1], shot: 'A-BARS' },
        },
        {
          id: 'q0-demo-kinds:b11',
          phase: 'books',
          text: 'Two [[qubit|qubits]] in a Bell state: the chances of 00 and 11 are equal, and 01 and 10 never happen.',
          formal: 'The Bell state with content 00 + 11 assigns equal probability to 00 and 11 and none to the other two outcomes.',
          stage: { kind: 'amplitudes', state: { bell: '00+11' }, mode: 'probability', shot: 'A-BARS' },
        },
        {
          id: 'q0-demo-kinds:b12',
          phase: 'books',
          text: 'Five qubits have 32 amplitudes. This product state spreads over 8 of them, with signs.',
          formal: 'A register of five [[qubit|qubits]] has 32 basis states; this product state has 8 nonzero amplitudes of equal modulus.',
          stage: { kind: 'amplitudes', state: { ket: '+0-1+' }, shot: 'A-BARS' },
        },
        {
          id: 'q0-demo-kinds:b13',
          phase: 'books',
          text: 'An oracle flips the sign of one amplitude out of eight. The dashed line is the mean amplitude.',
          formal: 'A phase oracle negates the marked amplitude; the mean then drops below the uniform value, ready for inversion about the mean.',
          stage: {
            kind: 'amplitudes',
            state: {
              circuit: {
                version: 1,
                qubits: 3,
                columns: [
                  [
                    { op: 'gate', gate: 'H', targets: [0] },
                    { op: 'gate', gate: 'H', targets: [1] },
                    { op: 'gate', gate: 'H', targets: [2] },
                  ],
                  [{ op: 'oracle', mode: 'phase', table: [0, 0, 0, 0, 0, 1, 0, 0], inputs: [0, 1, 2] }],
                ],
              },
              upTo: { from: 1, to: 2 },
            },
            mode: 'signed',
            shot: 'A-BARS',
          },
        },
        {
          id: 'q0-demo-kinds:b14',
          phase: 'books',
          text: 'A circuit reads left to right. Before any gate, both wires start at 0, so the state is 00.',
          formal: 'Time runs left to right along the wires; before the first column the register is in the product state 00.',
          stage: bellSplit(0),
        },
        {
          id: 'q0-demo-kinds:b15',
          phase: 'books',
          text: 'The first gate puts the top wire half at 0 and half at 1. Two bars now share the state.',
          formal: 'The Hadamard on the first qubit creates an equal [[superposition|superposition]] on that wire; the second is still 0.',
          stage: bellSplit(1),
        },
        {
          id: 'q0-demo-kinds:b16',
          phase: 'books',
          text: 'The controlled gate copies the top wire’s bit onto the bottom one: the two wires now always agree.',
          formal: 'The controlled NOT entangles the pair: the Bell state with content 00 + 11.',
          stage: bellSplit(2),
        },
        {
          id: 'q0-demo-kinds:b17',
          phase: 'books',
          text: 'Other gates: a phase turn, a swap of two wires, a gate with two controls, and meters that read each wire at the end.',
          formal: 'A phase gate, a SWAP, a doubly controlled NOT and terminal measurements, applied as the cursor moves along.',
          stage: { kind: 'circuit', circuit: TOUR, upTo: { from: 0, to: 5 }, shot: 'Q-WIRES' },
        },
        {
          // the matrix stage kind (10-stage-kind): an operator as a grid of numbers, read off a built-in gate
          id: 'q0-demo-kinds:b18',
          phase: 'books',
          text: 'An operator is a grid of numbers. The Hadamard gate’s grid shows how it remixes $|0\\rangle$ and $|1\\rangle$.',
          formal: 'An operator is its own matrix in the computational basis; Hadamard’s entries read directly off the grid.',
          caption: 'every entry has the same size; hue carries the sign',
          stage: { kind: 'matrix', source: { gate: { name: 'H' } }, labels: 'kets', values: 'decimal', shot: 'M-GRID' },
        },
        {
          // a beat-to-beat transition between two matrices of the same size: the entries lerp, never jumping through
          // an undrawable in-between grid (stage/svg/matrix.ts interpMatrixStage)
          id: 'q0-demo-kinds:b19',
          phase: 'books',
          text: 'The NOT gate’s grid swaps the two kets outright: nothing stays on the diagonal.',
          formal: 'Pauli X is the permutation matrix of the swap of $|0\\rangle$ and $|1\\rangle$: an empty diagonal, a size everywhere else.',
          caption: 'watch the diagonal empty out as H turns into this',
          stage: { kind: 'matrix', source: { pauli: 'X' }, labels: 'kets', values: 'decimal', shot: 'M-GRID' },
        },
        {
          // ρ, Tr ρ and Tr_B: the partial trace of a Bell pair's density matrix is the maximally mixed one-qubit state
          id: 'q0-demo-kinds:b20',
          phase: 'books',
          text: 'A two-qubit pair’s density matrix has a full diagonal. Tracing out the second qubit leaves the first a featureless mix.',
          formal: 'For a Bell pair’s ρ the trace is one; tracing out the second qubit leaves the first a maximally mixed reduced matrix beside it.',
          caption: 'the small grid beside it has nothing off its own diagonal',
          stage: { kind: 'matrix', source: { rho: { ket: { bell: '00+11' } } }, trace: true, partialTrace: 'B', labels: 'kets', shot: 'M-GRID' },
        },
        {
          // the two-qubit stage kind (P-709-remap §6.1): a Bell pair's two reduced Bloch balls plus the signed grid
          id: 'q0-demo-kinds:b21',
          phase: 'books',
          text: 'A Bell pair’s two qubits are, on their own, a featureless mix: both arrows vanish. The grid beside them is not empty.',
          formal: 'For a Bell pair, either qubit’s reduced state is maximally mixed, so both arrows vanish. The correlation tensor ⟨σᵢ⊗σⱼ⟩ is nonetheless diag(1, −1, 1).',
          caption: 'zero arrows, a full diagonal grid',
          stage: {
            kind: 'two-qubit',
            source: { rho: { ket: { bell: '00+11' } } },
            arrows: 'reduced',
            grid: 'T',
            readouts: ['purity', 'rLength', 'entropy'],
            labels: 'A-B',
            shot: 'TQ-PAIR',
          },
        },
        {
          // a cos-sin sweep transition: the arrows shrink from a product state toward the maximally entangled one
          id: 'q0-demo-kinds:b22',
          phase: 'books',
          text: 'Tip the balance from a plain pair toward a Bell pair: both arrows shrink as the xx cell grows in.',
          formal: 'As θ sweeps from 0° to 45°, cos θ|00⟩ + sin θ|11⟩ opens from a product state into the maximally entangled one. Each reduced arrow then has length cos 2θ.',
          caption: 'the arrows shrink to nothing at the maximally entangled state',
          stage: { kind: 'two-qubit', source: { family: 'cos-sin', thetaDeg: { from: 0, to: 45 } }, arrows: 'reduced', grid: 'T', shot: 'TQ-PAIR' },
        },
        {
          // the matrix v2 tableau view (W-709 #15): coloured Pauli letters, a product row and a state's eigenvalues
          id: 'q0-demo-kinds:b23',
          phase: 'books',
          text: 'Two qubits in a Bell state agree on X⊗X and on Z⊗Z: both read +1. Their letters are coloured by which Pauli they are.',
          formal: 'The Bell state Φ+ is a simultaneous +1 eigenstate of X⊗X and Z⊗Z; their product is −(Y⊗Y), the stabilizer formalism’s own arithmetic.',
          caption: 'XX and ZZ both give +1 on this state',
          stage: { kind: 'matrix', tableau: ['XX', 'ZZ'], product: true, values: { XX: 1, ZZ: 1 }, state: { bell: '00+11' }, shot: 'M-GRID' },
        },
        {
          // the matrix v2 spectrum view, mode 'entropy' (W-709 #15): signed eigenvalue bars plus a von Neumann S readout
          id: 'q0-demo-kinds:b24',
          phase: 'books',
          text: 'An equal mix of 0 and 1 has two equal eigenvalue bars. Its entropy is a full bit: nothing is known about it.',
          formal: 'The maximally mixed one-qubit state has two equal eigenvalues; its von Neumann entropy is the maximum one qubit can hold.',
          caption: 'entropy 1 bit: the most a single qubit can hide',
          stage: { kind: 'matrix', source: { rho: { mixture: [{ w: 0.5, ket: { ket: '0' } }, { w: 0.5, ket: { ket: '1' } }] } }, spectrum: 'entropy', labels: 'kets', shot: 'M-GRID' },
        },
        {
          // the matrix v2 basis view (W-709 #15): B†AB in the Bell basis, with the basis's own ket names as labels
          id: 'q0-demo-kinds:b25',
          phase: 'books',
          text: 'Viewed in the Bell basis, Z⊗Z turns into a diagonal grid: +1 for the two Φ states, −1 for the two Ψ states.',
          formal: 'B†(Z⊗Z)B is diagonal in the Bell basis, reading off the eigenvalues +1 (Φ±) and −1 (Ψ±) directly from the grid.',
          caption: 'the same operator, diagonal in a new basis',
          stage: { kind: 'matrix', source: { kron: [{ pauli: 'Z' }, { pauli: 'Z' }] }, basis: 'bell', labels: 'kets', values: 'exact', shot: 'M-GRID' },
        },
        {
          // the plot stage kind (10-stage-kind; P-Q10-story §9.2): a 2-D curve sampled from a named engine
          // function (physics/qc/entangle.ts chshCurve), with markers and a reference line
          id: 'q0-demo-kinds:b26',
          phase: 'books',
          text: 'As a shared pair’s phase turns, its CHSH score climbs: flat at the bound 2 near 0°, past it, toward Tsirelson’s 2√2 near 45°.',
          formal: 'The curve S(δ) traces 2cos δ + 2sin δ for the CHSH settings of Bergou §3.2: it starts at the classical bound 2 and peaks at 2√2 near δ = 45°.',
          caption: 'a classical line at 2, a quantum curve bulging past it',
          stage: {
            kind: 'plot',
            curve: { fn: 'chshVsPhase', x: { from: 0, to: 90 } },
            markers: [{ x: 45, label: '2√2' }],
            yLines: [{ y: 2, label: 'classical' }],
            shot: 'P-CURVE',
          },
        },
        {
          // the plot kind's remaining fields: curve.samples and bands (W-709-platform; 10-stage-kind step 9)
          id: 'q0-demo-kinds:b27',
          phase: 'books',
          text: 'The classical bound itself is just a flat line, however many points sample it. Shading below it marks every score a classical story could ever reach.',
          formal: 'Sampled at only a few points, the local-hidden-variable ceiling is still exactly flat; the shaded band below it is every CHSH value such a model can reach.',
          caption: 'few samples, one flat line, the classical region shaded below it',
          stage: {
            kind: 'plot',
            curve: { fn: 'chshClassicalBound', x: { from: 0, to: 90 }, samples: 8 },
            bands: [{ yFrom: -2, yTo: 2, label: 'classical' }],
            shot: 'P-CURVE',
          },
        },
        {
          id: 'q0-demo-kinds:b28',
          phase: 'clue',
          text: 'Three arrows of size 1 point at 0°, 120° and 240°. What is their sum?',
          formal: 'Evaluate the sum of the three cube roots of unity.',
          stage: { kind: 'complex-plane', spokes: { phasesDeg: [0, 120, 240] }, shot: 'C-FLAT' },
          reveal: {
            text: 'Zero. Tip to tail, the three arrows close a triangle and come back to the start.',
            formal: 'Zero: multiplying the sum by a cube root other than 1 leaves it unchanged, so it must vanish.',
            stage: { kind: 'complex-plane', chain: { phasesDeg: [0, 120, 240] }, shot: 'C-FLAT' },
          },
        },
      ],
    },
    {
      // the `code` stage kind (stage-kind agent; P-Q21-story §9.2 K1): every view, overlay and code of the registry, in an SVG-only unit
      id: 'q0-demo-code',
      title: 'Qubits and checks',
      question: 'Do the code stage’s views and overlays draw, change beat and print like the other SVG kinds?',
      lecture: { summary: 'Demo unit: the story replaces this block.', pages: 'demo' },
      books: [],
      visual: { kind: 'complex-plane', props: { mode: 'euler', phi: 180, n: 4 }, tryThis: ['Raise n and watch the end point close in on the circle.'] },
      clues: [],
      insight: 'A check asks one question about several qubits at once and never reads any one of them.',
      insightFormal: 'A stabilizer generator measures a joint parity of several qubits; its outcome is the syndrome bit and reveals no single qubit.',
      play: [],
      story: [
        {
          id: 'q0-demo-code:b1',
          phase: 'books',
          text: 'Seven qubits and six checks. Each square touches four discs, and each disc sits in three squares.',
          formal: 'The Steane code has seven data qubits and six weight-four checks: three of X type and three of Z type on the same four-qubit faces.',
          caption: 'discs are qubits, squares are checks',
          stage: { kind: 'code', code: 'steane7', shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b2',
          phase: 'books',
          text: 'A flip on qubit 5 lights the checks that touch it. The lit pattern is the syndrome.',
          formal: 'An X error on qubit 5 anticommutes with the Z checks that act on it; those read minus one.',
          stage: { kind: 'code', code: 'steane7', error: 'X5', show: ['syndrome'], shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b3',
          phase: 'books',
          text: 'The table maps this pattern back to the flip, and undoing it leaves nothing behind.',
          formal: 'The lookup decoder returns the lightest error with this syndrome; the residual is the identity.',
          stage: { kind: 'code', code: 'steane7', error: 'X5', show: ['syndrome', 'correction', 'residual'], shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b4',
          phase: 'books',
          text: 'Two flips fool the table. It undoes a different flip, and what is left changes the stored qubit.',
          formal: 'A weight-two error shares its syndrome with a weight-one error; the correction then leaves a logical X as the residual.',
          stage: { kind: 'code', code: 'steane7', error: 'X1X2', show: ['syndrome', 'correction', 'residual'], shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b5',
          phase: 'books',
          text: 'Nine qubits in three rows. A phase flip anywhere in a row lights the same two checks.',
          formal: 'In the Shor code a Z error on any qubit of a block gives the same syndrome on the two X checks, so the code is degenerate.',
          stage: { kind: 'code', code: 'shor9', error: 'Z4', show: ['syndrome', 'correction', 'residual'], shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b6',
          phase: 'books',
          text: 'The rings mark the fewest qubits that can change the stored one without lighting any check.',
          formal: 'A minimum-weight logical operator of the Shor code: it commutes with every check and is not a product of them.',
          stage: { kind: 'code', code: 'shor9', show: ['logical'], shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b7',
          phase: 'books',
          text: 'The surface code on a grid. Shaded faces are checks, and the half discs on the edge touch two qubits.',
          formal: 'The rotated surface code of distance three: nine data qubits, four X faces and four Z faces, with two-qubit checks on the boundary.',
          stage: { kind: 'code', code: 'surface3', error: 'Y5', show: ['syndrome', 'correction', 'residual'], shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b8',
          phase: 'books',
          text: 'A larger grid corrects two flips at once.',
          formal: 'The distance-five surface code corrects every error of weight two; the decoder here lists all of them.',
          stage: { kind: 'code', code: 'surface5', error: 'X7Z19', show: ['syndrome', 'correction', 'residual'], shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b9',
          phase: 'books',
          text: 'Not every code splits into X checks and Z checks. These four checks mix both letters.',
          formal: 'The five-qubit code is not a CSS code: each generator carries both X and Z letters, so its squares and edges are drawn by letter.',
          stage: { kind: 'code', code: 'five5', error: 'Z3', show: ['syndrome', 'correction'], shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b10',
          phase: 'books',
          text: 'Three copies of one bit. Two checks compare neighbours, and a flip lights one or both of them.',
          formal: 'The bit-flip repetition code has two Z checks, Z1Z2 and Z2Z3; an X error on the middle qubit lights both.',
          stage: { kind: 'code', code: 'rep3', error: 'IXI', show: ['syndrome', 'correction'], shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b11',
          phase: 'books',
          text: 'The same code as a table of letters, with three errors and what the checks read for each.',
          formal: 'The generators of the Shor code as rows of Pauli letters, with three errors listed beside the syndromes they produce.',
          stage: { kind: 'code', code: 'shor9', view: 'checks', errors: ['X1', 'Z4', 'X7X8'], shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b12',
          phase: 'books',
          text: 'Steane as a table: three X rows and three Z rows with the same support.',
          formal: 'The generator table of the Steane code: H_X and H_Z are the same Hamming check matrix, one acting with X and one with Z.',
          stage: { kind: 'code', code: 'steane7', view: 'checks', errors: ['IIIIXII', 'ZIIIIII', 'YIIIIII'], shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b13',
          phase: 'books',
          text: 'The stored zero is an equal mix of eight seven-bit strings.',
          formal: 'The logical zero of the Steane code is the equal superposition of the even-weight words of the Hamming code.',
          caption: `each string has size ${d(V.q0CodeAmp, 3)}`,
          claims: [codeAmp],
          stage: { kind: 'code', code: 'steane7', view: 'words', word: 0, shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b14',
          phase: 'books',
          text: 'Zero plus one: all sixteen words of the Hamming code, each with the same size.',
          formal: 'The logical plus state is the equal superposition of all sixteen words of the Hamming code.',
          stage: { kind: 'code', code: 'steane7', view: 'words', word: 'plus', shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b15',
          phase: 'books',
          text: 'Shor’s stored one flips the sign of every block that reads 111.',
          formal: 'The logical one of the Shor code is the product of three blocks, each of 000 minus 111.',
          stage: { kind: 'code', code: 'shor9', view: 'words', word: 1, shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b16',
          phase: 'books',
          text: 'A bigger code on a torus. Dots are qubits of two kinds, squares are checks of two kinds, and the edges wrap around.',
          formal: 'The gross code of Tour de gross drawn as its twelve by six tile: 144 data qubits in two families and 144 checks in two families.',
          stage: { kind: 'code', code: 'gross', shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b17',
          phase: 'books',
          text: 'One check touches six qubits. Four are near it, and two are far away across the torus.',
          formal: 'Each check of the gross code acts on six qubits; four lie within one cell and two are long-range, drawn as labelled stubs.',
          stage: { kind: 'code', code: 'gross', focus: 'X20', shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b18',
          phase: 'books',
          text: 'Slide every qubit three cells east and one down: the code looks the same.',
          formal: 'The shift by x cubed y inverse permutes the qubits and maps each check family onto itself, so it preserves the code.',
          stage: { kind: 'code', code: 'gross', focus: ['X20', 'Z5'], shift: [3, -1], shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b19',
          phase: 'books',
          text: 'A single flip on this torus lights the checks that touch it, and a rung of white rings shows a light logical operator.',
          formal: 'An X error on one qubit of the gross code lights its Z checks; the rings mark a weight-twelve logical operator, an upper bound on the distance.',
          stage: { kind: 'code', code: 'gross', error: 'X40', show: ['syndrome', 'logical'], shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b20',
          phase: 'books',
          text: 'Twice the torus, twice the qubits.',
          formal: 'The two-gross code drawn as its twelve by twelve tile: 288 data qubits and 288 checks.',
          stage: { kind: 'code', code: 'two-gross', focus: 'Z70', shot: 'CD-CODE' },
        },
        {
          id: 'q0-demo-code:b21',
          phase: 'books',
          text: 'A vote of three copies fails less often than one bit alone, until the flips are as likely as not.',
          formal: 'The chance that a majority of three copies is wrong, p squared times three minus two p, lies below p exactly for p below one half.',
          caption: 'the curve and the line meet at one half',
          stage: { kind: 'plot', curve: { fn: 'repFail3', vs: 'identityP' }, markers: [{ x: 0.1 }, { x: 0.5 }], shot: 'P-CURVE' },
        },
        {
          id: 'q0-demo-code:b22',
          phase: 'books',
          text: 'The Steane code fails less often than one bare qubit only when flips are rare enough.',
          formal: 'The exact logical failure chance of the Steane code against independent X flips, counted over all 128 patterns, crosses the bare qubit at a small p.',
          stage: { kind: 'plot', curve: { fn: 'steaneFailX', vs: 'identityP' }, markers: [{ x: 0.01 }, { x: 0.0646 }], shot: 'P-CURVE' },
        },
        {
          id: 'q0-demo-code:b23',
          phase: 'books',
          text: 'Rooms needed against rooms available: the two meet at five qubits.',
          formal: 'The quantum Hamming bound for one qubit and one error needs 2 times 1 plus 3n states and has 2 to the n; the line meets the curve at n of five.',
          stage: { kind: 'plot', curve: { fn: 'qhbNeed1', vs: 'twoToN', x: { from: 1, to: 10 } }, markers: [{ x: 5 }], shot: 'P-CURVE' },
        },
        {
          id: 'q0-demo-code:b24',
          phase: 'books',
          text: 'Two helper wires below the data read the checks; their bars alone say which qubit flipped.',
          formal: 'The chances of the two helper wires, summed over the data wires: the bar 11 carries all the weight, the syndrome of a flip on the middle qubit.',
          stage: {
            layout: 'split',
            top: { kind: 'circuit', circuit: HELPERS, upTo: 8, shot: 'Q-WIRES' },
            bottom: { kind: 'amplitudes', state: { circuit: HELPERS, upTo: 8 }, mode: 'probability', keep: [3, 4], shot: 'A-BARS' },
          },
        },
        {
          id: 'q0-demo-code:b25',
          phase: 'clue',
          text: 'The checks read Z1Z2 and Z2Z3 on three copies of a bit. A flip lights only the second check. Which qubit flipped?',
          formal: 'For the bit-flip code a lit second check and a dark first check identify the qubit uniquely. Which one?',
          stage: { kind: 'code', code: 'rep3', shot: 'CD-CODE' },
          reveal: {
            text: 'The third. It touches only the second check.',
            formal: 'The third: it is the only qubit that Z2Z3 acts on and Z1Z2 does not.',
            stage: { kind: 'code', code: 'rep3', error: 'IIX', show: ['syndrome', 'correction'], shot: 'CD-CODE' },
          },
        },
      ],
    },
    {
      // S4 (stage-code agent): the circuit and tableau pictures the error-correction chapters need, drawn by the existing kinds with no new field. Screenshot checks
      // (e2e/code-kind.spec.ts): classically conditioned X columns, the Rx error label, 5 wires × 11 columns, a tableau whose `state` is a 3-qubit circuit, a CNOT
      // product grid and the tableau split.
      id: 'q0-demo-ec',
      title: 'Circuits and tableaux for codes',
      question: 'Do the existing circuit, matrix and amplitude pictures carry the error-correction chapters’ circuits?',
      lecture: { summary: 'Demo unit: the story replaces this block.', pages: 'demo' },
      books: [],
      visual: { kind: 'complex-plane', props: { mode: 'euler', phi: 180, n: 4 }, tryThis: ['Raise n and watch the end point close in on the circle.'] },
      clues: [],
      insight: 'The same few pictures carry every code: circuits for the process, grids and tables for the checks.',
      insightFormal: 'The circuit, matrix and amplitude kinds already draw the encoder, the syndrome readout and the conditioned fix without a new field.',
      play: [],
      story: [
        {
          id: 'q0-demo-ec:b1',
          phase: 'books',
          text: 'The whole bit-flip circuit: encode, flip qubit 2, read the helpers, and fix the qubit the helpers name.',
          formal: 'Five wires and ten columns: encoder, an X error on the middle qubit, four parity CNOTs, two measurements and three classically conditioned X gates.',
          stage: { kind: 'circuit', circuit: bfCircuit('X2'), upTo: 10, outcomes: '11', shot: 'Q-WIRES' },
        },
        {
          id: 'q0-demo-ec:b2',
          phase: 'books',
          text: 'After the fix the three code wires hold the stored state again, and the helper wires hold the syndrome.',
          formal: 'The state after the conditioned X: the code qubits are back in the encoded state and the helper wires read the syndrome 11.',
          stage: {
            layout: 'split',
            top: { kind: 'circuit', circuit: bfCircuit('X2'), upTo: 10, outcomes: '11', shot: 'Q-WIRES' },
            bottom: { kind: 'amplitudes', state: { circuit: bfCircuit('X2'), upTo: 10, outcomes: '11' }, mode: 'amplitude', shot: 'A-BARS' },
          },
        },
        {
          id: 'q0-demo-ec:b3',
          phase: 'books',
          text: 'A small nudge instead of a whole flip: a turn of the middle qubit about x.',
          formal: 'The error column is the rotation about x by a small angle on the middle qubit; the circuit labels the gate with its angle.',
          caption: `both helpers read 1 with chance ${d(V.q0RxFlip, 2)}`,
          claims: [rxFlip],
          stage: { kind: 'circuit', circuit: bfCircuit('rx60'), upTo: 4, outcomes: '11', shot: 'Q-WIRES' },
        },
        {
          id: 'q0-demo-ec:b4',
          phase: 'books',
          text: 'The phase-flip circuit is longer: Hadamards around the error, and eleven columns on five wires.',
          formal: 'The phase-flip code conjugates the bit-flip code by Hadamards on the code wires: five wires, eleven columns, a Z error on the first qubit.',
          stage: { kind: 'circuit', circuit: pfCircuit, upTo: 11, outcomes: '10', shot: 'Q-WIRES' },
        },
        {
          id: 'q0-demo-ec:b5',
          phase: 'books',
          text: 'The encoded state passes the two parity checks and fails the all-X test.',
          formal: 'The state after the encoder, read through three Pauli strings: it is an eigenstate of ZZI and IZZ and not of XXX.',
          stage: { kind: 'matrix', tableau: ['ZZI', 'IZZ', 'XXX'], state: { circuit: enc3, upTo: 3 }, shot: 'M-GRID' },
        },
        {
          id: 'q0-demo-ec:b6',
          phase: 'books',
          text: 'A CNOT on both sides of X on the first qubit leaves X on both qubits.',
          formal: 'The conjugation of X on the control by a CNOT, as a product of three matrices: the grid is X tensor X.',
          stage: { kind: 'matrix', source: { product: [{ gate: { name: 'CNOT' } }, { pauli: 'XI' }, { gate: { name: 'CNOT' } }] }, labels: 'kets', values: 'exact', shot: 'M-GRID' },
        },
        {
          id: 'q0-demo-ec:b7',
          phase: 'books',
          text: 'The encoder above and its checks below, read from the same three wires.',
          formal: 'A split: the three-wire encoder on top, and below it the Pauli table read on the state the encoder makes.',
          stage: {
            layout: 'split',
            top: { kind: 'circuit', circuit: enc3, upTo: 3, shot: 'Q-WIRES' },
            bottom: { kind: 'matrix', tableau: ['ZZI', 'IZZ', 'XXX'], state: { circuit: enc3, upTo: 3 }, shot: 'M-GRID' },
          },
        },
      ],
    },
    {
      // Q1's changes to the shared WebGL kinds (P-Q1-story §9.2 S1–S4, S6), in the 709 passports
      id: 'q0-demo-fields',
      title: 'New marks on the shared stages',
      question: 'Do the plane, the sphere and the bench carry Q1’s new fields and the course’s names?',
      lecture: { summary: 'Demo unit: the story replaces this block.', pages: 'demo' },
      books: [],
      visual: { kind: 'projector', props: { state: 30, basis: 0 }, tryThis: ['Turn the arrow and watch its two shadows.'] },
      clues: [],
      insight: 'Two arrows add tip to tail; their sum is a longer arrow, not a state.',
      insightFormal: 'The sum of two unit vectors is a vector of the space whose length is generally not 1, so it is not itself a state.',
      play: [],
      story: [
        {
          id: 'q0-demo-fields:b1',
          phase: 'lecture',
          text: 'Two arrows of the plane and their sum, drawn tip to tail. The sum is longer than either arrow.',
          formal: 'Two unit vectors and their sum, the diagonal of the parallelogram, drawn at its true length.',
          caption: `the sum is ${d(V.q0PlaneSum, 3)} long`,
          claims: [planeSum],
          stage: { kind: 'hilbert-plane', psi: { planeDeg: 15 }, others: [{ ket: { planeDeg: 60 }, role: 'second' }], sumOf: [{ planeDeg: 15 }, { planeDeg: 60 }], shot: 'H-FLAT' },
          fidelity: ['qc-plane-vectors-not-states'],
        },
        {
          id: 'q0-demo-fields:b2',
          phase: 'lecture',
          text: 'The arc marks the angle between the two arrows, here named with its own letter.',
          formal: 'The arc now carries its own label, the angle between the arrows rather than the Bloch half-angle.',
          stage: { kind: 'hilbert-plane', psi: '+x', basis: 'z', shadows: true, arc: true, arcLabel: '$\\theta$', shot: 'H-FLAT' },
        },
        {
          id: 'q0-demo-fields:b3',
          phase: 'books',
          text: 'On the sphere of this course, the north pole is named 0 as well as up along z.',
          formal: 'In this course the north pole carries both names: the computational basis state 0 and the spin state up along z.',
          stage: { kind: 'bloch', state: '+x', shot: 'B-STD' },
        },
        {
          id: 'q0-demo-fields:b4',
          phase: 'clue',
          text: 'Make the field twice as lopsided. What happens to the two spots?',
          formal: 'Double the field gradient. What happens to the splitting, and to the number of spots?',
          stage: { kind: 'lab-r3', benches: [{ id: 'main', source: 'oven', devices: [{ axis: 'z' }] }], readouts: ['fractions'], gradientScale: 0.5, shot: 'L-PLATE' },
          reveal: {
            text: 'They move twice as far apart, and there are still two. The field sets the push, not the number of spots.',
            formal: 'The splitting doubles while the number of lines stays two: it counts the values the moment can take.',
            stage: { kind: 'lab-r3', benches: [{ id: 'main', source: 'oven', devices: [{ axis: 'z' }] }], readouts: ['fractions'], gradientScale: 1, shot: 'L-PLATE' },
          },
        },
      ],
    },
  ],
}
