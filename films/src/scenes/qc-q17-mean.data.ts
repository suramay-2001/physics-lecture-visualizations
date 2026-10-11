/**
 * What the film `qc-q17-mean` draws, computed by the app's engine (P-Q17-story §10: "Inversion about the mean, one step at a
 * time"): eight amplitude bars and their dashed mean line through two Grover steps, each a mark (the marked bar flips below the
 * axis) and an inversion about the mean (every bar lands as far on the other side of the mean line as it was), ending with the
 * chance of the marked string. The scene only lays these values out; it types no physics number of its own.
 *
 * The film's INPUTS are the plan's running example: N = 8 (three wires), the marked string 101, two steps (the best number for
 * N = 8). Every bar height is a real part of a state `runCircuit` returns for `groverCircuit` (physics/qc/grover.ts, circuit.ts):
 * column 1 is |w₀⟩, column 2 + 4(j − 1) is right after step j's mark, column 1 + 4j is the end of step j. Every mean line is
 * `meanAmplitude` of the state it sits beside; the chance is `groverSuccess`'s own number, read here as the squared marked bar.
 * Colours: `stage/tokens.ts` and the amplitudes kind's phase wheel (`stage/phaseHue.ts`).
 *
 * Pure TS: no Motion Canvas import.
 */
import { phaseColor } from '../../../app/src/stage/phaseHue.ts'
import { INK, STAGE_THEME } from '../../../app/src/stage/tokens.ts'
import { runCircuit } from '../../../app/src/physics/qc/circuit.ts'
import { groverCircuit } from '../../../app/src/physics/qc/grover.ts'
import { meanAmplitude } from '../../../app/src/physics/qc/state.ts'

export const FILM_ID = 'qc-q17-mean'

/** The openers' format (see qc-q16-cancel.data.ts). */
export const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 } as const

/** The plan's inputs: the check pins them. */
export const N_BITS = 3
export const STRINGS = 2 ** N_BITS
export const MARKED_LABEL = '101'
export const MARKED = parseInt(MARKED_LABEL, 2)
export const STEPS = 2

const states = runCircuit(groverCircuit(N_BITS, [MARKED_LABEL], STEPS)).states
/** engine column of the state after step j's mark (j ≥ 1) and after step j (j ≥ 0; j = 0 is the even mix |w₀⟩) */
export const markColumn = (j: number): number => 2 + 4 * (j - 1)
export const stepColumn = (j: number): number => 1 + 4 * j
const barsAt = (col: number): number[] => states[col].map((z) => z.re)
const meanAt = (col: number): number => meanAmplitude(states[col]).re
/** the chance of the marked string: the squared marked bar of the last state (what `groverSuccess(8, 1, 2)` also returns) */
export const CHANCE = states[stepColumn(STEPS)][MARKED].re ** 2

export type StageKind = 'start' | 'mark' | 'invert' | 'chance'

export interface MeanStage {
  id: string
  /** the one label on screen while the stage is current (words only: no number is lettered) */
  label: string
  kind: StageKind
  /** the engine column (circuit cursor) this stage ends on */
  column: number
  /** the eight bar heights the stage ends on (engine amplitudes) */
  bars: number[]
  /** the dashed mean line: the engine's mean of the bars the stage ends on */
  mean: number
  /** an inversion stage draws, beside each bar, a link from the bar's old top to its new top (the previous stage's bars → this stage's) */
  links: { from: number[]; to: number[] } | null
  /** the chance column's height at the end of the stage (0 before the chance stage) */
  chance: number
  from: number
  tween: number
  to: number
}

function stage(id: string, label: string, kind: StageKind, column: number, prev: MeanStage | null, from: number, tween: number, to: number): MeanStage {
  const bars = barsAt(column)
  return {
    id,
    label,
    kind,
    column,
    bars,
    mean: meanAt(column),
    links: kind === 'invert' && prev ? { from: prev.bars, to: bars } : null,
    chance: kind === 'chance' ? CHANCE : 0,
    from,
    tween,
    to,
  }
}

/**
 * Beat 1 (0–31): the even mix, then the first mark. Beat 2 (32–71): the first inversion about the mean. Beat 3 (72–119): the second
 * mark, the second inversion, and the chance of the marked string. Each beat of the captions (openers/openerCopy.ts) starts on one stage.
 */
const MARK = 'the mark'
const INVERT = 'inversion about the mean'
const s0 = stage('even-mix', 'the even mix', 'start', stepColumn(0), null, 0, 0, 5)
const s1 = stage('mark-1', MARK, 'mark', markColumn(1), s0, 6, 12, 31)
const s2 = stage('invert-1', INVERT, 'invert', stepColumn(1), s1, 32, 24, 71)
const s3 = stage('mark-2', MARK, 'mark', markColumn(2), s2, 72, 12, 87)
const s4 = stage('invert-2', INVERT, 'invert', stepColumn(2), s3, 88, 20, 109)
const s5: MeanStage = { ...stage('chance', 'the chance', 'chance', stepColumn(2), s4, 110, 8, 119), links: null }
export const STAGES: MeanStage[] = [s0, s1, s2, s3, s4, s5]

/** The 709 stage ground and the reserved stage inks (never gold/copper on a stage: tokens.ts). */
export const COLORS = {
  ground: STAGE_THEME.qc709.bg.amplitudes,
  positive: phaseColor(0),
  negative: phaseColor(Math.PI),
  mean: INK.state,
  axis: INK.silver,
  guide: INK.silver3,
  link: INK.silver2, // the old-top → new-top links of an inversion
  chance: INK.silver, // probability bars are silver in the amplitudes kind
  label: INK.text,
} as const

/** Layout (px): the baseline of the eight bars, the scale of one unit of amplitude (and of chance), the bar pitch, the chance column on the right. */
export const LAYOUT = {
  baseY: 40,
  scale: 480,
  pitch: 92,
  barWidth: 64,
  /** half the width of the mean line and the guides: they span the bars only */
  half: 380,
  linkOffset: 44, // a link sits right of its bar: barX + linkOffset
  chanceX: 430,
  chanceWidth: 52,
  labelX: -FORMAT.width / 2 + 90,
  labelY: -FORMAT.height / 2 + 95,
} as const

/** x of the bar of string i: string 000 on the left, 111 on the right. */
export const barX = (i: number): number => (i - (STRINGS - 1) / 2) * LAYOUT.pitch
/** amplitude → canvas y (y flips: positive amplitudes go up) */
export const yOf = (a: number): number => LAYOUT.baseY - LAYOUT.scale * a
/** canvas y → amplitude (used to record what was actually drawn) */
export const ampOf = (y: number): number => (LAYOUT.baseY - y) / LAYOUT.scale
