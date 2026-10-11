/**
 * The model behind widget `oracle-bench` (W16; docs/roles/decisions/qc709-deferred-features.md D1): a pure function from the bench's controls to the three
 * stage states it draws (`circuit`, `amplitudes`, and for Grover `grover-plane`), the readings under them and the sentence the live region speaks.
 * The widget (OracleBench.tsx) only draws what this returns, so a Try-it line can be checked against the model without a DOM.
 *
 * Every number comes from the engine, never from this file: the circuits are `djCircuit` / `bvCircuit` / `groverCircuit` / `simonCircuit`
 * (physics/qc/oracles.ts, grover.ts), the states are `runCircuit` columns, the chances `probs`, the sign average `signMean`, the classical costs
 * `djDeterministicWorst` and `bvClassicalRun`, k* and α `groverOptimalK` / `groverAngle`, Simon's chances `simonYFromCircuit`. This file indexes
 * those results, formats them with the SVG kinds' shared formatter (`fix`, `degs`) and counts columns; it adds no physics of its own.
 *
 * The steps are the circuit's own columns (q0 the top wire and the most significant bit):
 *   Hadamard signs (Chapter Q16, unit 1)   a string x · H on every wire (signs) · H on every wire again (the string back); no oracle, no function
 *   Deutsch–Jozsa and Bernstein–Vazirani   prepare (H on every wire) · oracle (the phase oracle O_f) · final Hadamards · measure
 *   Grover (N ≤ 16, one marked string)    prepare · U_f (the marking column) · D (H, −U₀, H: the diffusion) · Q (U_f then D: one whole step) · measure
 *   Simon (n = 3, five wires)             prepare · query U_f (both answer columns) · measure the answer wires · final Hadamards · measure the input wires
 * "Measure" does not change the state: it switches the bars to the chances a reading would show.
 */
import type { AmplitudesState, CircuitStageState, GroverPlaneState } from '../content/stage'
import { type Bit, type TruthTable } from '../physics/qc/bits'
import { type Circuit, runCircuit } from '../physics/qc/circuit'
import { groverAngle, groverCircuit, groverOptimalK, groverSuccess } from '../physics/qc/grover'
import { probs } from '../physics/qc/measure'
import {
  type DjFamily,
  DJ_FAMILIES,
  bvClassicalRun,
  bvTable,
  djCircuit,
  djDeterministicWorst,
  djFamilyTable,
  djVerdict,
  dotOddCount,
  hadamardRun,
  mostLikelyString,
  onesCount,
  signMean,
  simonCircuit,
  simonPerp,
  simonYFromCircuit,
} from '../physics/qc/oracles'
import { meanAmplitude } from '../physics/qc/state'
import { degs, fix } from '../stage/svg/draw'

export type OracleBenchMode = 'dj' | 'bv' | 'grover' | 'simon' | 'hadamard'
/** Every mode the widget can start in. */
export const ORACLE_BENCH_MODES: readonly OracleBenchMode[] = ['dj', 'bv', 'grover', 'simon', 'hadamard']
/** The four algorithms the "Algorithm" choice offers; 'hadamard' (the sign formula of Chapter Q16's first unit, before any algorithm is named) is the choice only of a bench that starts in it. */
export const ALGORITHM_MODES: readonly OracleBenchMode[] = ['dj', 'bv', 'grover', 'simon']
export { DJ_FAMILIES }
export type { DjFamily }

/** The number of input wires each mode allows: Hadamard signs, Deutsch–Jozsa and Bernstein–Vazirani 1–4, Grover 2–4 (N ≤ 16), Simon exactly 3 (five wires, as Chapter Q18 draws it). */
export const N_RANGE: Record<OracleBenchMode, { min: number; max: number }> = {
  dj: { min: 1, max: 4 },
  bv: { min: 1, max: 4 },
  grover: { min: 2, max: 4 },
  simon: { min: 3, max: 3 },
  hadamard: { min: 1, max: 4 },
}
/** Grover's circuit is drawn for at most this many whole steps (1 + 4 × 5 = 21 columns, under the stage's 24). */
export const GROVER_STEPS_MAX = 5

/** What the learner sets: it changes the circuit, so any change starts the run again. */
export interface BenchSetup {
  mode: OracleBenchMode
  /** Input wires. */
  n: number
  /** Deutsch–Jozsa only: which function. Bernstein–Vazirani is always linear. */
  family: DjFamily
  /** The hidden string a (an index 0 … 2ⁿ − 1; q0 is the most significant bit): Deutsch–Jozsa 'linear' and Bernstein–Vazirani. */
  a: number
  /** The hidden bit b (Bernstein–Vazirani, Deutsch–Jozsa 'linear') or the constant value of f (Deutsch–Jozsa 'constant'). */
  b: Bit
  /** Grover: the marked string (an index 0 … N − 1). */
  marked: number
  /** Simon: the secret string s (an index 1 … 7). */
  s: number
  /** Simon: the answer the two answer wires are read as when they are measured (an index 0 … 3). */
  answer: number
  /** Hadamard signs: the string the wires start in (an index 0 … 2ⁿ − 1). */
  x: number
}

/** Where the run is: `cursor` columns of the circuit are done; `read` once Measure was pressed; `op` is the step that got here (null at the start). */
export interface BenchState {
  cursor: number
  read: boolean
  op: BenchOp | null
}
export const START: BenchState = { cursor: 0, read: false, op: null }

export type BenchOp = 'prepare' | 'oracle' | 'diffuse' | 'step' | 'final' | 'answer' | 'measure' | 'hadamard' | 'again'

/** The buttons of each mode, in circuit order, with the label the button wears. */
export const BENCH_OPS: Record<OracleBenchMode, { id: BenchOp; label: string }[]> = {
  hadamard: [
    { id: 'hadamard', label: 'Hadamards' },
    { id: 'again', label: 'Hadamards again' },
  ],
  dj: [
    { id: 'prepare', label: 'Prepare' },
    { id: 'oracle', label: 'Oracle' },
    { id: 'final', label: 'Final Hadamards' },
    { id: 'measure', label: 'Measure' },
  ],
  bv: [
    { id: 'prepare', label: 'Prepare' },
    { id: 'oracle', label: 'Oracle' },
    { id: 'final', label: 'Final Hadamards' },
    { id: 'measure', label: 'Measure' },
  ],
  grover: [
    { id: 'prepare', label: 'Prepare' },
    { id: 'oracle', label: 'Mark (U_f)' },
    { id: 'diffuse', label: 'Diffuse (D)' },
    { id: 'step', label: 'Whole step (Q)' },
    { id: 'measure', label: 'Measure' },
  ],
  simon: [
    { id: 'prepare', label: 'Prepare' },
    { id: 'oracle', label: 'Query (U_f)' },
    { id: 'answer', label: 'Measure the answer' },
    { id: 'final', label: 'Final Hadamards' },
    { id: 'measure', label: 'Measure y' },
  ],
}

/** The last column of each mode's circuit (Grover's is drawn for GROVER_STEPS_MAX whole steps). */
export const lastColumn = (mode: OracleBenchMode): number => (mode === 'grover' ? 1 + 4 * GROVER_STEPS_MAX : mode === 'simon' ? 5 : mode === 'hadamard' ? 2 : 3)

/** The cursors the buttons can reach: where a run can stand (a Try-it's `step` prop is snapped to one of these). */
export function legalCursors(mode: OracleBenchMode): number[] {
  if (mode === 'simon') return [0, 1, 3, 4, 5]
  if (mode === 'hadamard') return [0, 1, 2]
  if (mode !== 'grover') return [0, 1, 2, 3]
  const out = [0, 1]
  for (let j = 0; j < GROVER_STEPS_MAX; j++) out.push(2 + 4 * j, 1 + 4 * (j + 1))
  return out
}
/** The furthest legal cursor not beyond c. */
export const snapCursor = (mode: OracleBenchMode, c: number): number => legalCursors(mode).filter((x) => x <= c).pop() ?? 0

/** The step whose press reaches a cursor (the live region speaks it for a run that starts there). */
export function opAt(mode: OracleBenchMode, cursor: number): BenchOp | null {
  if (cursor <= 0) return null
  if (mode === 'hadamard') return cursor === 1 ? 'hadamard' : 'again'
  if (cursor === 1) return 'prepare'
  if (mode === 'grover') return (cursor - 2) % 4 === 0 ? 'oracle' : 'step'
  if (mode === 'simon') return cursor === 3 ? 'oracle' : cursor === 4 ? 'answer' : 'final'
  return cursor === 2 ? 'oracle' : 'final'
}
/** A run standing at the legal cursor nearest below `cursor`, as if its buttons had been pressed to get there. */
export function stateAt(mode: OracleBenchMode, cursor: number): BenchState {
  const c = snapCursor(mode, cursor)
  return { cursor: c, read: false, op: opAt(mode, c) }
}

/** The state after pressing `op` from `st`, or null when that button is not available there (one button at a time, in circuit order; nothing after Measure). */
export function applyOp(mode: OracleBenchMode, st: BenchState, op: BenchOp): BenchState | null {
  if (st.read) return null
  const c = st.cursor
  const go = (cursor: number): BenchState => ({ cursor, read: false, op })
  if (mode === 'grover') {
    const L = lastColumn('grover')
    if (op === 'prepare') return c === 0 ? go(1) : null
    if (op === 'oracle') return c >= 1 && (c - 1) % 4 === 0 && c < L ? go(c + 1) : null
    if (op === 'diffuse') return c >= 2 && (c - 2) % 4 === 0 ? go(c + 3) : null
    if (op === 'step') return c >= 1 && (c - 1) % 4 === 0 && c < L ? go(c + 4) : null
    if (op === 'measure') return c >= 1 ? { cursor: c, read: true, op } : null
    return null
  }
  if (mode === 'hadamard') {
    if (op === 'hadamard') return c === 0 ? go(1) : null
    if (op === 'again') return c === 1 ? go(2) : null
    return null
  }
  if (mode === 'simon') {
    if (op === 'prepare') return c === 0 ? go(1) : null
    if (op === 'oracle') return c === 1 ? go(3) : null
    if (op === 'answer') return c === 3 ? go(4) : null
    if (op === 'final') return c === 4 ? go(5) : null
    if (op === 'measure') return c === 5 ? { cursor: c, read: true, op } : null
    return null
  }
  if (op === 'prepare') return c === 0 ? go(1) : null
  if (op === 'oracle') return c === 1 ? go(2) : null
  if (op === 'final') return c === 2 ? go(3) : null
  if (op === 'measure') return c === 3 ? { cursor: c, read: true, op } : null
  return null
}

const clampInt = (x: unknown, lo: number, hi: number, fallback: number): number => (typeof x === 'number' && Number.isFinite(x) ? Math.max(lo, Math.min(hi, Math.round(x))) : fallback)

/** A setup from possibly missing or out-of-range values: n inside the mode's range, strings (a, marked, x) inside 0 … N − 1 (s inside 1 … 7), 'balanced' only where it is not linear (n ≥ 3). */
export function normalizeSetup(p: Partial<BenchSetup>): BenchSetup {
  const mode: OracleBenchMode = ORACLE_BENCH_MODES.includes(p.mode as OracleBenchMode) ? (p.mode as OracleBenchMode) : 'dj'
  const r = N_RANGE[mode]
  const n = clampInt(p.n, r.min, r.max, 3)
  const N = 2 ** n
  let family: DjFamily = (DJ_FAMILIES as readonly string[]).includes(p.family as string) ? (p.family as DjFamily) : 'linear'
  if (mode !== 'dj') family = 'linear'
  if (family === 'balanced' && n < 3) family = 'linear'
  return {
    mode,
    n,
    family,
    a: clampInt(p.a, 0, N - 1, 1),
    b: p.b === 1 ? 1 : 0,
    marked: clampInt(p.marked, 0, N - 1, 0),
    s: clampInt(p.s, 1, 7, 6),
    answer: clampInt(p.answer, 0, 3, 0),
    x: clampInt(p.x, 0, N - 1, 1),
  }
}

const bitsOf = (x: number, n: number): string => x.toString(2).padStart(n, '0')
const ketOf = (x: number, n: number): string => `|${bitsOf(x, n)}⟩`

export interface Reading {
  key: string
  text: string
}

export interface BenchModel {
  setup: BenchSetup
  state: BenchState
  /** Number of strings the input register holds, N = 2ⁿ. */
  N: number
  circuit: Circuit
  /** The truth table of f (Deutsch–Jozsa, Bernstein–Vazirani); null for Grover and Simon. */
  table: TruthTable | null
  /** The measurement outcomes of Simon's answer wires ('' otherwise). */
  outcomes: string
  circuitState: CircuitStageState
  ampState: AmplitudesState
  /** Grover only: the plane beside the bars. */
  planeState: GroverPlaneState | null
  /** The plane shows the search state only once |w₀⟩ is prepared. */
  planeLive: boolean
  readings: Reading[]
  headline: string
  /** Which buttons can be pressed now. */
  can: Record<BenchOp, boolean>
}

/** The circuit a setup draws; for Grover it holds the steps started so far plus the next one (at most GROVER_STEPS_MAX). */
export function benchCircuit(s: BenchSetup, cursor: number): { circuit: Circuit; table: TruthTable | null } {
  if (s.mode === 'grover') {
    const shown = Math.max(1, Math.min(GROVER_STEPS_MAX, Math.floor((cursor - 1) / 4) + 1))
    return { circuit: groverCircuit(s.n, [s.marked], shown), table: null }
  }
  if (s.mode === 'simon') return { circuit: simonCircuit(s.s, s.n), table: null }
  if (s.mode === 'hadamard') return { circuit: hadamardRun(s.x, s.n, true), table: null }
  const table = s.mode === 'bv' ? bvTable(s.a, s.b, s.n) : djFamilyTable(s.family, s.n, s.a, s.b)
  return { circuit: djCircuit(table, 'phase'), table }
}

/** The number of oracle columns in a circuit: how many times it calls the black box. */
export const oracleCalls = (c: Circuit): number => c.columns.flat().filter((o) => o.op === 'oracle').length

function describeF(s: BenchSetup, table: TruthTable): string {
  const verdict = djVerdict(table)
  if (s.mode === 'bv') return `f(x) = a·x ⊕ b with a = ${bitsOf(s.a, s.n)}, b = ${s.b}`
  if (s.family === 'constant') return `f(x) = ${s.b} for every x (${verdict})`
  if (s.family === 'balanced') return `f(x) = 1 for x = 1 … ${onesCount(table)}, else 0 (${verdict})`
  return `f(x) = a·x ⊕ b with a = ${bitsOf(s.a, s.n)}, b = ${s.b} (${verdict})`
}

/** Whole Grover steps done at a cursor, and whether the run stands half way through one (U_f done, D to come). */
const groverProgress = (cursor: number): { done: number; half: boolean } => ({ done: cursor < 1 ? 0 : Math.floor((cursor - 1) / 4), half: cursor >= 2 && (cursor - 2) % 4 === 0 })

type Parts = { readings: Reading[]; headline: string }
type Psi = ReturnType<typeof runCircuit>['states'][number]

/** Deutsch–Jozsa and Bernstein–Vazirani: the function, the cost, then what the cursor has reached. */
function partsDjBv(s: BenchSetup, t: TruthTable, circuit: Circuit, st: BenchState, psi: Psi): Parts {
  const { n, mode } = s
  const N = 2 ** n
  const p = probs(psi)
  const mean = meanAmplitude(psi).re
  const cursor = st.cursor
  const m = mostLikelyString(psi)
  const readings: Reading[] = [
    { key: 'f', text: describeF(s, t) },
    {
      key: 'cost',
      text: mode === 'dj' ? `oracle calls: ${oracleCalls(circuit)} in this circuit, ${djDeterministicWorst(n)} for a classical computer that must be sure` : `oracle calls: ${oracleCalls(circuit)} in this circuit, ${bvClassicalRun(t, n).asked.length} classical`,
    },
  ]
  if (cursor >= 2 && mode === 'dj') readings.push({ key: 'mean', text: `average of the signs (−1)^f(x): ${fix(signMean(t))}` })
  if (cursor >= 2 && mode === 'bv') readings.push({ key: 'signs', text: `bars below the axis: ${onesCount(t)} of ${N}` })
  if (cursor === 3 && mode === 'dj') {
    readings.push({ key: 'amp0', text: `amplitude of ${ketOf(0, n)}: ${fix(psi[0].re)}` })
    readings.push({ key: 'p0', text: `chance of all zeros: ${fix(p[0])}` })
    readings.push({ key: 'likely', text: m.ties === 1 ? `most likely reading: ${m.bits}, chance ${fix(m.p)}` : `most likely reading: ${m.ties} strings tie at chance ${fix(m.p)}, the first is ${m.bits}` })
  }
  if (cursor === 3 && mode === 'bv') {
    readings.push({ key: 'readoff', text: `read-off a = ${m.bits}, chance ${fix(m.p)}` })
    readings.push({ key: 'amp', text: `amplitude of ${ketOf(m.index, n)}: ${fix(psi[m.index].re)}` })
    readings.push({ key: 'b', text: 'the bit b is only the sign of that amplitude' })
  }
  if (st.read && mode === 'dj') readings.push({ key: 'verdict', text: `reading: all zeros has chance ${fix(p[0])}, so f is ${djVerdict(t)}` })
  let headline = `Start: every wire is |0⟩. Press ${BENCH_OPS[mode][0].label}.`
  if (st.op === 'prepare') headline = `Prepared: ${N} equal bars of height ${fix(psi[0].re)}.`
  if (st.op === 'oracle') headline = `Oracle applied: ${onesCount(t)} of ${N} bars point down. The mean of the bars is ${fix(mean)}.`
  if (st.op === 'final') headline = mode === 'dj' ? `Final Hadamards: the amplitude of ${ketOf(0, n)} is ${fix(psi[0].re)}, so the chance of all zeros is ${fix(p[0])}.` : `Final Hadamards: the string ${m.bits} has chance ${fix(m.p)}.`
  if (st.op === 'measure') headline = mode === 'dj' ? `Reading: all zeros has chance ${fix(p[0])}, so f is ${djVerdict(t)}.` : `Reading: ${m.bits} with chance ${fix(m.p)}. That is a.`
  return { readings, headline }
}

/** Grover: the search, α and k*, then the chance of the marked string, the whole steps done and the mean. */
function partsGrover(s: BenchSetup, st: BenchState, psi: Psi): Parts {
  const { n, marked } = s
  const N = 2 ** n
  const p = probs(psi)
  const mean = meanAmplitude(psi).re
  const { done, half } = groverProgress(st.cursor)
  const kStar = groverOptimalK(N)
  const mk = ketOf(marked, n)
  const readings: Reading[] = [
    { key: 'search', text: `${N} strings, marked item ${bitsOf(marked, n)}` },
    { key: 'kopt', text: `α = ${degs(groverAngle(N), 1)}; best number of steps k* = ${kStar}, chance ${fix(groverSuccess(N, 1, kStar))}` },
  ]
  if (st.cursor >= 1) {
    readings.push({ key: 'steps', text: half ? `whole steps done: ${done} (the next one is half done)` : `whole steps done: ${done}` })
    readings.push({ key: 'chance', text: `chance of ${bitsOf(marked, n)}: ${fix(p[marked])}` })
    readings.push({ key: 'mean', text: `mean amplitude: ${fix(mean)}` })
  }
  let headline = `Start: every wire is |0⟩. Press ${BENCH_OPS.grover[0].label}.`
  if (st.op === 'prepare') headline = `Prepared: ${N} equal bars of height ${fix(psi[0].re)}. The chance of ${bitsOf(marked, n)} is ${fix(p[marked])}.`
  if (st.op === 'oracle') headline = `U_f applied: the bar of ${mk} flips to ${fix(psi[marked].re)}. Its chance is still ${fix(p[marked])}.`
  if (st.op === 'diffuse') headline = `D applied: every bar reflected about the mean. Whole steps done: ${done}. The chance of ${mk} is ${fix(p[marked])}.`
  if (st.op === 'step') headline = `Q applied: whole steps done: ${done}. The chance of ${mk} is ${fix(p[marked])}.`
  if (st.op === 'measure') headline = `Reading ${bitsOf(marked, n)} has chance ${fix(p[marked])}.`
  return { readings, headline }
}

/** Simon: the secret, the answer read, then the strings y a reading can give. */
function partsSimon(s: BenchSetup, st: BenchState, psi: Psi, outcomes: string): Parts {
  const { n } = s
  const N = 2 ** n
  const perp = simonPerp(s.s, n)
  const y = st.cursor >= 5 ? simonYFromCircuit(s.s, n, outcomes) : null
  const readings: Reading[] = [{ key: 's', text: `secret string s = ${bitsOf(s.s, n)}, so f(x) = f(x ⊕ s)` }]
  if (st.cursor >= 4) readings.push({ key: 'answer', text: `answer wires read: ${outcomes}` })
  if (y) {
    readings.push({ key: 'perp', text: `strings y with y·s = 0: ${perp.map((v) => bitsOf(v, n)).join(', ')}` })
    readings.push({ key: 'chance', text: `chance of each of those ${perp.length}: ${fix(y[perp[0]])}` })
  }
  let headline = `Start: every wire is |0⟩. Press ${BENCH_OPS.simon[0].label}.`
  if (st.op === 'prepare') headline = `Prepared: the ${N} input strings share the amplitude ${fix(psi[0].re)}.`
  if (st.op === 'oracle') headline = 'Query done: the answer wires now hold f(x) beside each input string x.'
  if (st.op === 'answer') headline = `Answer wires read as ${outcomes}: the input wires are left in an equal mix of two strings, x and x ⊕ s.`
  if (st.op === 'final') headline = 'Final Hadamards: only strings y with y·s = 0 have any chance.'
  if (st.op === 'measure') headline = `Reading y: each of the ${perp.length} strings with y·s = 0 has chance ${fix(y ? y[perp[0]] : 0)}.`
  return { readings, headline }
}

/** Hadamard signs (Chapter Q16, unit 1): the string, the signs one column of Hadamards writes (x·z odd: the bar points down), and the string back after the second column. No function, no oracle. */
function partsHadamard(s: BenchSetup, st: BenchState, states: Psi[]): Parts {
  const { n, x } = s
  const N = 2 ** n
  const psi = states[st.cursor]
  const p = probs(psi)
  const ket = ketOf(x, n)
  const down = dotOddCount(x, n)
  const readings: Reading[] = [{ key: 'x', text: `starting string x = ${bitsOf(x, n)}` }]
  if (st.cursor >= 1) {
    readings.push({ key: 'size', text: `size of each bar after one column: ${fix(Math.abs(states[1][0].re))}` })
    readings.push({ key: 'signs', text: `bars below the axis: ${down} of ${N}` })
  }
  if (st.cursor === 2) {
    readings.push({ key: 'amp', text: `amplitude of ${ket}: ${fix(psi[x].re)}` })
    readings.push({ key: 'chance', text: `chance of ${bitsOf(x, n)}: ${fix(p[x])}` })
  }
  let headline = `Start: the wires hold the string ${ket}. Press ${BENCH_OPS.hadamard[0].label}.`
  if (st.op === 'hadamard') headline = `One column of Hadamards: ${N} bars of size ${fix(Math.abs(psi[0].re))}, ${N - down} pointing up and ${down} pointing down.`
  if (st.op === 'again') headline = `Hadamards again: all the weight is back on ${ket}, with amplitude ${fix(psi[x].re)}.`
  return { readings, headline }
}

const ALL_OPS: readonly BenchOp[] = ['prepare', 'oracle', 'diffuse', 'step', 'final', 'answer', 'measure', 'hadamard', 'again']

/** Everything the bench draws and says for a setup and a run state. */
export function benchModel(setup: BenchSetup, state: BenchState): BenchModel {
  const s = normalizeSetup(setup)
  const { n, mode } = s
  const cursor = snapCursor(mode, state.cursor)
  const st: BenchState = { cursor, read: state.read && cursor > 0, op: state.op }
  const { circuit, table } = benchCircuit(s, cursor)
  const outcomes = mode === 'simon' ? bitsOf(s.answer, n - 1) : ''
  const run = runCircuit(circuit, outcomes ? { outcomes } : {})
  const psi = run.states[cursor]

  const circuitState: CircuitStageState = { kind: 'circuit', circuit, upTo: cursor, ...(outcomes ? { outcomes } : {}), shot: 'Q-WIRES' }
  // Simon's bars are the chances of the input wires (the answer wires summed over): five wires of signed bars would hide the picture
  const ampState: AmplitudesState =
    mode === 'simon'
      ? { kind: 'amplitudes', state: { circuit, upTo: cursor, outcomes }, mode: 'probability', keep: n, shot: 'A-BARS' }
      : { kind: 'amplitudes', state: { circuit, upTo: cursor }, mode: st.read ? 'probability' : 'signed', shot: 'A-BARS' }

  const parts =
    mode === 'grover'
      ? partsGrover(s, st, psi)
      : mode === 'simon'
        ? partsSimon(s, st, psi, outcomes)
        : mode === 'hadamard'
          ? partsHadamard(s, st, run.states)
          : partsDjBv(s, table!, circuit, st, psi)
  const can = Object.fromEntries(ALL_OPS.map((op) => [op, applyOp(mode, st, op) !== null])) as Record<BenchOp, boolean>

  let planeState: GroverPlaneState | null = null
  if (mode === 'grover') {
    const { done, half } = groverProgress(cursor)
    planeState = {
      kind: 'grover-plane',
      search: { n },
      k: done,
      ...(half ? { half: 'oracle' as const, mirrors: ['x0perp' as const, 'w0' as const] } : {}),
      arcs: done >= 1 ? ['alpha', 'step'] : ['alpha'],
      readouts: ['angle', 'success', 'kopt'],
      shot: 'G-PLANE',
    }
  }

  return { setup: s, state: st, N: 2 ** n, circuit, table, outcomes, circuitState, ampState, planeState, planeLive: mode === 'grover' && cursor >= 1, readings: parts.readings, headline: parts.headline, can }
}
