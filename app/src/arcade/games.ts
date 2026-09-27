/**
 * Arcade v1 (Phase 4a item 5): three games whose every verdict comes from the engine (physics/sg.ts, spin.ts).
 * Each level names the chapter it trains, so a game links back into the story. Solutions live here for the tests
 * (games.test.ts proves each one reaches its target and each starting position does not) and are never shown.
 *
 * Lecture tags: a game trains the lecture whose unit ids it lists. Bloch golf trains rotations, taught in
 * Lecture 6 (Rz) and Lecture 7 §7.2 (the 360° sign); it is playable now and labelled as ahead of the course.
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
const ROT: Trains = { lecture: 'L7', unit: 'rotations', label: 'Rotations (Lectures 6–7)' }

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
    trains: ROT,
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
    trains: ROT,
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
    trains: ROT,
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
    trains: ROT,
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
    blurb: 'Each argument has one wrong step, the kind real notes and real students make. Find it.',
    levels: ERROR_ROUNDS.length,
    trains: uniq(ERROR_ROUNDS.map((r) => r.trains)),
  },
  {
    id: 'bloch-golf',
    kind: 'bloch-golf',
    title: 'Bloch golf',
    blurb: 'Steer a spin state to a target with as few quarter-turns as you can.',
    levels: GOLF_LEVELS.length,
    trains: [ROT],
  },
]
