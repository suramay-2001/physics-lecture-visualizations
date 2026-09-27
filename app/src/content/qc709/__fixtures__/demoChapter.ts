/**
 * DEV fixture: a demo Physics 709 chapter ("Q0") that exercises the platform before any real chapter is written:
 * per-course meta generation (content/meta.test.ts), the id namespaces (content/courses.test.ts), the 709 chapter
 * page at the DEV-only route `#/709/ch/Q0` (pages/Chapter709Page.tsx), and part B: both tracks on every beat and
 * reveal, one derivation, the per-track lints (symbols, claims, sentence caps), the track toggle
 * (e2e/bridge.spec.ts), print notes and figures (figures.test.tsx, e2e/print.spec.ts).
 *
 * NEVER SHIPS: it lives under `__fixtures__/` (outside the chapter glob `qc709/[QF]*.ts`), and the only app imports
 * are behind `import.meta.env.DEV`; build/chunks.test.ts fails if any chunk of a production build holds it.
 * Wording is W's placeholder, not course content; every number comes from the engine (claims keyed `q0…`, their
 * analytic twins in content/claims.test.ts).
 */
import type { BridgeTarget } from '../../bridgeRegistry'
import { keyedClaim, pct, d } from '../../claimKit'
import { abs, add, c } from '../../../physics/complex'
import { KET, prob } from '../../../physics/spin'
import type { GlossEntry, Lecture } from '../../schema'

export const DEMO_CHAPTER_ID = 'Q0'

/**
 * The demo's bridges into Spin Lab (real chapters use content/qc709/bridges.ts): one to a unit, one to a beat.
 * Registered by pages/Chapter709Page.tsx in DEV only; content/qc709/bridges.test.ts resolves both targets.
 */
export const DEMO_BRIDGES: Readonly<Record<string, BridgeTarget>> = {
  'qc-demo-complex': { course: 'sl448', lecture: 'L2', unit: 'l2-complex', label: 'complex numbers as turns in the plane' },
  'qc-demo-equator': { course: 'sl448', lecture: 'L6', unit: 'l6-equator', beat: 'l6-equator:b2', label: 'the relative phase picks the point on the equator' },
}

/** The demo's glossary: one entry in both tracks, with a bridge in its popover. */
export const DEMO_GLOSSARY: GlossEntry[] = [
  {
    id: 'qc-demo-amplitude',
    term: 'amplitude',
    gloss: 'One of the numbers in a state’s column; its size, squared, is the chance of that outcome.',
    formal: 'A coefficient of the state in a chosen orthonormal basis; by the Born rule its squared modulus is the probability of that outcome.',
    first: 'q0-demo-sphere:b3',
    bridge: 'qc-demo-complex',
  },
]

/** The fixture's engine values: P(0) on the equator, and the size of each amplitude of |+x⟩. */
export const V = {
  q0Half: prob(KET['+z'], KET['+x']),
  q0Amp: Math.sqrt(prob(KET['+z'], KET['+x'])),
  // the stage-kind unit: |z + w| and |w| for z = 3 + 4i, w = 1 − 2i (the triangle inequality's two sides)
  q0SumAbs: abs(add(c(3, 4), c(1, -2))),
  q0WAbs: abs(c(1, -2)),
} as const
const claim = keyedClaim<keyof typeof V>()
const half = claim('q0Half', 'an equator state reads 0 half the time', () => Math.abs(V.q0Half - 0.5) < 1e-12)
const amp = claim('q0Amp', 'each amplitude of |+x⟩ has size 1/√2', () => Math.abs(V.q0Amp - Math.SQRT1_2) < 1e-12)
const sumAbs = claim('q0SumAbs', '|(3 + 4i) + (1 − 2i)| = |4 + 2i|', () => Math.abs(V.q0SumAbs - Math.hypot(4, 2)) < 1e-12)
const wAbs = claim('q0WAbs', '|1 − 2i| = √5', () => Math.abs(V.q0WAbs - Math.sqrt(5)) < 1e-12)

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
          derivation: {
            result: `P(0) = ${'\\tfrac12'}`,
            ground: [
              { why: 'Write the equator state as a column of two numbers. The top slot counts 0 and the bottom slot counts 1.', tex: '|{+x}\\rangle = \\begin{pmatrix} 1/\\sqrt2 \\\\ 1/\\sqrt2 \\end{pmatrix}' },
              { why: 'The chance of reading 0 is the top number, squared.', tex: 'P(0) = \\left(\\tfrac{1}{\\sqrt2}\\right)^2' },
              { why: 'A square root times itself gives back what was under it, so this is one over two.', tex: 'P(0) = \\tfrac{1}{\\sqrt2}\\cdot\\tfrac{1}{\\sqrt2} = \\tfrac12', claims: [half] },
            ],
            formal: [
              { why: 'The Born rule in the computational basis.', tex: 'P(0) = |\\langle 0|{+x}\\rangle|^2 = \\left|\\tfrac{1}{\\sqrt2}\\right|^2' },
              { why: 'Evaluate the modulus squared.', tex: 'P(0) = \\tfrac12', claims: [half] },
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
  ],
}
