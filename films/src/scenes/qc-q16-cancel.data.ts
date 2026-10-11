/**
 * What the film `qc-q16-cancel` draws, computed by the app's engine (P-Q16-story §10: "Balanced functions cancel the
 * all-zeros bar": eight signed bars and their mean line as f changes, then the last Hadamards). The scene only lays these
 * values out; it types no physics number of its own.
 *
 * The film's INPUTS are the plan's running example (R1): Deutsch–Jozsa on n = 3 wires, f going from "0 everywhere" to the
 * balanced `F_BALN` (1 on the strings 001, 010, 011, 100) by switching one string at a time, then the constant f = 1. Every bar
 * height is a real part of a state `runCircuit` returns for `djCircuit(f, 'phase')` (physics/qc/oracles.ts, circuit.ts): the
 * state after the query (column 2) and after the last Hadamards (column 3); every mean line is `meanAmplitude` of the first.
 * Colours come from `stage/tokens.ts` and the amplitudes kind's phase wheel (`stage/phaseHue.ts`): a bar's colour is the phase
 * of its amplitude (0 or π), the same code the `amplitudes` stage uses.
 *
 * Pure TS: no Motion Canvas import, so the plan can be reasoned about (and checked) without a browser.
 */
import { phaseColor } from '../../../app/src/stage/phaseHue.ts'
import { INK, STAGE_THEME } from '../../../app/src/stage/tokens.ts'
import { type Bit } from '../../../app/src/physics/qc/bits.ts'
import { runCircuit } from '../../../app/src/physics/qc/circuit.ts'
import { djCircuit } from '../../../app/src/physics/qc/oracles.ts'
import { meanAmplitude } from '../../../app/src/physics/qc/state.ts'

export const FILM_ID = 'qc-q16-cancel'

/** The openers' format (OpenerScrub draws 1080 × 1350 frames, 120 of them); a power-of-two rate keeps every beat on its planned frame (see f1-euler-limit.data.ts). */
export const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 } as const

export const N_BITS = 3
export const STRINGS = 2 ** N_BITS

/** The plan's inputs (P-Q16-story "Conventions": F_BALN is 1 on {1, 2, 3, 4}); the check pins them so the film cannot drift from the plan. */
export const F_BALN: readonly Bit[] = [0, 1, 1, 1, 1, 0, 0, 0]
const ones = (strings: readonly number[]): Bit[] => Array.from({ length: STRINGS }, (_, x) => (strings.includes(x) ? 1 : 0))
export const F_ZERO: readonly Bit[] = ones([])
export const F_ONE: readonly Bit[] = ones(Array.from({ length: STRINGS }, (_, x) => x))
/** The strings f is switched to 1 on, in the order the film switches them: F_BALN's own support. */
export const SWITCH_ORDER: readonly number[] = F_BALN.flatMap((v, x) => (v ? [x] : []))

/** One simulation of Deutsch–Jozsa in its phase form: states[2] after the query, states[3] after the last Hadamards. */
const run = (table: readonly Bit[]) => runCircuit(djCircuit(table, 'phase')).states
const queryBars = (table: readonly Bit[]): number[] => run(table)[2].map((z) => z.re)
const outputBars = (table: readonly Bit[]): number[] => run(table)[3].map((z) => z.re)
const queryMean = (table: readonly Bit[]): number => meanAmplitude(run(table)[2]).re

export type StageKind = 'query' | 'output'

export interface CancelStage {
  id: string
  /** the one label on screen while the stage is current (words only: no number is lettered) */
  label: string
  kind: StageKind
  /** f as a truth table, x read q0-first */
  table: Bit[]
  /** the eight bar heights the stage ends on (engine amplitudes) */
  bars: number[]
  /** the dashed mean line, for a query stage (the engine's mean of the bars); null while the last Hadamards are shown */
  mean: number | null
  /** frames: the stage occupies from … to (inclusive); its tween takes the first `tween` of them, then it holds */
  from: number
  tween: number
  to: number
}

const QUERY = 'the query'
const LAST = 'the last Hadamards'

function stage(id: string, kind: StageKind, table: readonly Bit[], from: number, tween: number, to: number): CancelStage {
  const t = [...table] as Bit[]
  return {
    id,
    label: kind === 'query' ? QUERY : LAST,
    kind,
    table: t,
    bars: kind === 'query' ? queryBars(t) : outputBars(t),
    mean: kind === 'query' ? queryMean(t) : null,
    from,
    tween,
    to,
  }
}

/**
 * Beat 1 (0–39): f = 0 everywhere, then f is switched to 1 on four strings, one at a time (the in-between functions are neither constant
 * nor balanced; they only show the mean line move). Beat 2 (40–79): the last Hadamards on the balanced f. Beat 3 (80–119): the constant
 * f = 1, then its last Hadamards. Each beat of the captions (openers/openerCopy.ts) starts on one of these stages.
 */
export const STAGES: CancelStage[] = [
  stage('f-zero', 'query', F_ZERO, 0, 0, 3),
  ...SWITCH_ORDER.map((_, j) => stage(`switch-${j + 1}`, 'query', ones(SWITCH_ORDER.slice(0, j + 1)), 4 + 8 * j, 6, j === SWITCH_ORDER.length - 1 ? 39 : 11 + 8 * j)),
  stage('last-balanced', 'output', F_BALN, 40, 16, 79),
  stage('f-one', 'query', F_ONE, 80, 16, 99),
  stage('last-constant', 'output', F_ONE, 100, 12, 119),
]

/** The 709 stage ground and the reserved stage inks (never gold/copper on a stage: tokens.ts). */
export const COLORS = {
  ground: STAGE_THEME.qc709.bg.amplitudes,
  positive: phaseColor(0), // the amplitudes kind's wheel: phase 0 (a positive real amplitude) ...
  negative: phaseColor(Math.PI), // ... and phase π (a negative one)
  mean: INK.state, // the dashed mean line, near-white as in the amplitudes kind
  axis: INK.silver,
  guide: INK.silver3,
  column: INK.silver2, // the frame round the all-zeros column
  label: INK.text,
} as const

/** Layout (px): the baseline of the eight bars, the scale of one unit of amplitude (the longest bar, amplitude 1, fits), the bar pitch. */
export const LAYOUT = {
  baseY: 40,
  scale: 480,
  pitch: 118,
  barWidth: 90,
  half: 500,
  labelX: -FORMAT.width / 2 + 90,
  labelY: -FORMAT.height / 2 + 95,
} as const

/** x of the bar of string i, in Motion Canvas's frame (origin at the canvas centre): string 000 on the left, 111 on the right. */
export const barX = (i: number): number => (i - (STRINGS - 1) / 2) * LAYOUT.pitch
/** amplitude → canvas y (y flips: positive amplitudes go up) */
export const yOf = (a: number): number => LAYOUT.baseY - LAYOUT.scale * a
/** canvas y → amplitude (used to record what was actually drawn) */
export const ampOf = (y: number): number => (LAYOUT.baseY - y) / LAYOUT.scale
