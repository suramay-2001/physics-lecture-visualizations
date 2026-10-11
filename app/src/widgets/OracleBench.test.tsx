/**
 * Widget W16 `oracle-bench` (Chapters Q16, Q17; rulings qc709-deferred-features D1). The model (oracleBenchModel.ts) is checked against the engine it reads:
 *  - the steps: which buttons exist where, that one press moves the cursor by the circuit's own columns, that Measure locks the run;
 *  - the three stage states it builds pass the kinds' own validators and the circuit and the bars read the same circuit and cursor;
 *  - every reading equals an independent engine route: Deutsch–Jozsa's all-zeros amplitude is the closed form 2⁻ⁿ Σ(−1)^f, Bernstein–Vazirani returns (−1)^b|a⟩ for every pair,
 *    Grover's chance after k steps is sin²((2k+1)α) from the plane AND the inversion about the mean applied to the vector, Simon's chances sit on the strings with y·s = 0;
 *  - the widget renders (server-side markup) in every mode with labelled controls, a live region and no NaN.
 * The buttons themselves are exercised by the e2e spec (e2e/oracle-bench.spec.ts).
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { abs2 } from '../physics/complex'
import rawGrover from '../physics/__fixtures__/qc-grover.json?raw'
import { type Bit, dotMod2, isBalanced, isConstant } from '../physics/qc/bits'
import { runCircuit } from '../physics/qc/circuit'
import { groverAngle, groverOptimalK, groverPlane, groverStateVector, groverSuccess } from '../physics/qc/grover'
import { bvClassicalRun, bvTable, djDeterministicWorst, djFamilyTable, djOutputAmplitude, dotOddCount, hadamardColumn, onesCount, signMean, simonPerp, simonYDistribution } from '../physics/qc/oracles'
import { meanAmplitude } from '../physics/qc/state'
import { validateCircuitStage } from '../stage/svg/circuit'
import { circuitLayoutProblems } from '../stage/svg/circuit'
import { validateAmplitudes } from '../stage/svg/amplitudes'
import { resolveGroverPlaneStage, validateGroverPlaneStage } from '../stage/svg/groverPlane'
import { fix } from '../stage/svg/draw'
import OracleBench from './OracleBench'
import {
  BENCH_OPS,
  DJ_FAMILIES,
  GROVER_STEPS_MAX,
  N_RANGE,
  ORACLE_BENCH_MODES,
  START,
  applyOp,
  benchModel,
  legalCursors,
  normalizeSetup,
  opAt,
  snapCursor,
  stateAt,
  type BenchOp,
  type BenchSetup,
  type BenchState,
  type OracleBenchMode,
} from './oracleBenchModel'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FXG: any = JSON.parse(rawGrover)
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} ≈ ${b}`).toBeLessThan(eps)
const bits = (x: number, n: number) => x.toString(2).padStart(n, '0')
const setupOf = (mode: OracleBenchMode, patch: Partial<BenchSetup> = {}): BenchSetup => normalizeSetup({ mode, ...patch })
const reading = (m: ReturnType<typeof benchModel>, key: string): string => m.readings.find((r) => r.key === key)?.text ?? ''
/** Press the buttons in order from the start; throws when one is unavailable (so a test cannot pass by skipping a step). */
function runOps(mode: OracleBenchMode, ops: BenchOp[]): BenchState {
  let st = START
  for (const op of ops) {
    const nx = applyOp(mode, st, op)
    if (!nx) throw new Error(`${mode}: ${op} is not available at ${JSON.stringify(st)}`)
    st = nx
  }
  return st
}
const text = (html: string): string => html.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/<!--.*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

describe('the steps: one button at a time, in circuit order', () => {
  it('Deutsch–Jozsa and Bernstein–Vazirani: Prepare, Oracle, Final Hadamards, Measure, each only after the one before', () => {
    for (const mode of ['dj', 'bv'] as const) {
      let st = START
      const reached: number[] = []
      for (const op of ['prepare', 'oracle', 'final', 'measure'] as const) {
        const others = BENCH_OPS[mode].map((o) => o.id).filter((o) => o !== op)
        for (const o of others) expect(applyOp(mode, st, o), `${mode}: ${o} before ${op}`).toBeNull()
        st = applyOp(mode, st, op)!
        reached.push(st.cursor)
      }
      expect(reached).toEqual([1, 2, 3, 3])
      expect(st.read).toBe(true)
      for (const { id } of BENCH_OPS[mode]) expect(applyOp(mode, st, id), `${mode}: nothing after Measure`).toBeNull()
    }
  })
  it('Grover: U_f is one column, D three, Q four; D only after U_f, U_f and Q only between whole steps; at most five whole steps', () => {
    let st = runOps('grover', ['prepare'])
    expect(st.cursor).toBe(1)
    expect(applyOp('grover', st, 'diffuse')).toBeNull()
    st = applyOp('grover', st, 'oracle')!
    expect(st.cursor).toBe(2)
    expect(applyOp('grover', st, 'oracle')).toBeNull()
    expect(applyOp('grover', st, 'step')).toBeNull()
    st = applyOp('grover', st, 'diffuse')!
    expect(st.cursor).toBe(5)
    for (let k = 2; k <= GROVER_STEPS_MAX; k++) st = applyOp('grover', st, 'step')!
    expect(st.cursor).toBe(1 + 4 * GROVER_STEPS_MAX)
    expect(applyOp('grover', st, 'step')).toBeNull()
    expect(applyOp('grover', st, 'oracle')).toBeNull()
    expect(applyOp('grover', st, 'measure')?.read).toBe(true)
    // Measure is allowed at any column after Prepare, even half way through a step, and not before Prepare
    expect(applyOp('grover', START, 'measure')).toBeNull()
    expect(applyOp('grover', runOps('grover', ['prepare', 'oracle']), 'measure')?.read).toBe(true)
  })
  it('Hadamard signs: Hadamards, then Hadamards again, each only after the one before; there is no Measure', () => {
    expect(BENCH_OPS.hadamard.map((o) => o.id)).toEqual(['hadamard', 'again'])
    expect(applyOp('hadamard', START, 'again')).toBeNull()
    expect(applyOp('hadamard', START, 'measure')).toBeNull()
    const one = applyOp('hadamard', START, 'hadamard')!
    expect(one).toEqual({ cursor: 1, read: false, op: 'hadamard' })
    expect(applyOp('hadamard', one, 'hadamard')).toBeNull()
    const two = applyOp('hadamard', one, 'again')!
    expect(two).toEqual({ cursor: 2, read: false, op: 'again' })
    for (const { id } of BENCH_OPS.hadamard) expect(applyOp('hadamard', two, id), 'nothing after the second column').toBeNull()
    expect(legalCursors('hadamard')).toEqual([0, 1, 2])
    expect(stateAt('hadamard', 2)).toEqual(two)
  })
  it('Simon: Prepare, Query (both answer columns), Measure the answer, Final Hadamards, Measure y', () => {
    const cursors = ['prepare', 'oracle', 'answer', 'final', 'measure'].map((_, i, all) => runOps('simon', all.slice(0, i + 1) as BenchOp[]).cursor)
    expect(cursors).toEqual([1, 3, 4, 5, 5])
    expect(applyOp('simon', runOps('simon', ['prepare']), 'answer')).toBeNull()
  })
  it('the cursors a run can stand at, what a Try-it’s `step` snaps to, and the step that reaches each', () => {
    expect(legalCursors('dj')).toEqual([0, 1, 2, 3])
    expect(legalCursors('simon')).toEqual([0, 1, 3, 4, 5])
    expect(legalCursors('grover')).toEqual([0, 1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21])
    expect(snapCursor('grover', 4)).toBe(2)
    expect(snapCursor('grover', 99)).toBe(21)
    expect(snapCursor('simon', 2)).toBe(1)
    expect(snapCursor('dj', -3)).toBe(0)
    expect(stateAt('grover', 9)).toEqual({ cursor: 9, read: false, op: 'step' })
    expect(opAt('grover', 6)).toBe('oracle')
    expect(opAt('simon', 4)).toBe('answer')
    expect(opAt('bv', 0)).toBeNull()
    // every legal cursor of every mode is reached by pressing the buttons
    for (const mode of ORACLE_BENCH_MODES) for (const c of legalCursors(mode)) expect(opAt(mode, c) === null, `${mode} ${c}`).toBe(c === 0)
  })
})

describe('the setup is normalised: every value lands inside what the circuit can draw', () => {
  it('n stays in the algorithm’s range, strings inside 0 … N − 1, s nonzero, balanced only for n ≥ 3, the family only for Deutsch–Jozsa', () => {
    for (const mode of ORACLE_BENCH_MODES) {
      expect(normalizeSetup({ mode, n: 9 }).n).toBe(N_RANGE[mode].max)
      expect(normalizeSetup({ mode, n: -2 }).n).toBe(N_RANGE[mode].min)
    }
    expect(normalizeSetup({ mode: 'simon', n: 4 }).n).toBe(3)
    expect(normalizeSetup({ mode: 'grover', n: 1 }).n).toBe(2)
    expect(normalizeSetup({ mode: 'dj', n: 3, a: 99, marked: 99 })).toMatchObject({ a: 7, marked: 7 })
    expect(normalizeSetup({ mode: 'simon', s: 0 }).s).toBe(1)
    expect(normalizeSetup({ mode: 'dj', n: 2, family: 'balanced' }).family).toBe('linear')
    expect(normalizeSetup({ mode: 'dj', n: 3, family: 'balanced' }).family).toBe('balanced')
    expect(normalizeSetup({ mode: 'bv', family: 'constant' }).family).toBe('linear')
    expect(normalizeSetup({ mode: 'qft' as OracleBenchMode }).mode).toBe('dj')
    expect(normalizeSetup({}).n).toBe(3)
    expect(normalizeSetup({ mode: 'dj', family: 'nope' as never }).family).toBe('linear')
    expect(normalizeSetup({ mode: 'hadamard', n: 3, x: 99 }).x).toBe(7)
    expect(normalizeSetup({ mode: 'hadamard', n: 2, x: 7 })).toMatchObject({ n: 2, x: 3 })
    expect(normalizeSetup({ mode: 'hadamard' })).toMatchObject({ n: 3, x: 1, family: 'linear' })
  })
})

/** Every setup the Try-its and the controls can reach, in a few cursors each, for the stage-state checks. */
function* setups(): Generator<BenchSetup> {
  for (let n = 1; n <= 4; n++) {
    for (const family of DJ_FAMILIES) yield setupOf('dj', { n, family, a: 2 ** n - 1, b: 1 })
    yield setupOf('bv', { n, a: 2 ** n - 1, b: 1 })
  }
  for (let n = 2; n <= 4; n++) for (const marked of [0, 2 ** n - 1]) yield setupOf('grover', { n, marked })
  for (const s of [1, 6, 7]) for (const answer of [0, 3]) yield setupOf('simon', { s, answer })
  for (let n = 1; n <= 4; n++) for (const x of [0, 2 ** n - 1, 5 % 2 ** n]) yield setupOf('hadamard', { n, x })
}

describe('the three stage states the model builds are valid and consistent', () => {
  it('circuit, bars and plane pass the kinds’ own validators at every cursor of every setup, and the circuit and the bars read the same circuit and cursor', () => {
    let seen = 0
    for (const setup of setups())
      for (const cursor of legalCursors(setup.mode)) {
        for (const read of [false, true]) {
          if (read && cursor === 0) continue
          const m = benchModel(setup, { cursor, read, op: opAt(setup.mode, cursor) })
          const where = `${setup.mode} n=${setup.n} cursor ${cursor}${read ? ' read' : ''}`
          expect(validateCircuitStage(m.circuitState), where).toEqual([])
          expect(validateAmplitudes(m.ampState), where).toEqual([])
          expect(circuitLayoutProblems([m.circuitState, m.ampState]), where).toEqual([])
          if (m.planeState) expect(validateGroverPlaneStage(m.planeState), where).toEqual([])
          expect(m.state.cursor, where).toBe(cursor)
          seen++
        }
      }
    expect(seen).toBeGreaterThan(300)
  })
  it('the bars are signed amplitudes until Measure and chances after it; Simon always shows the chances of the three input wires', () => {
    const dj = setupOf('dj', { n: 3, family: 'balanced' })
    expect(benchModel(dj, runOps('dj', ['prepare', 'oracle', 'final'])).ampState.mode).toBe('signed')
    expect(benchModel(dj, runOps('dj', ['prepare', 'oracle', 'final', 'measure'])).ampState.mode).toBe('probability')
    const simon = benchModel(setupOf('simon'), runOps('simon', ['prepare']))
    expect(simon.ampState).toMatchObject({ mode: 'probability', keep: 3 })
    expect(simon.circuit.qubits).toBe(5)
  })
  it('Grover’s circuit shows the steps started plus the next one, never more than five whole steps (21 columns)', () => {
    const g = setupOf('grover', { n: 3, marked: 5 })
    const cols = (ops: BenchOp[]) => benchModel(g, runOps('grover', ops)).circuit.columns.length
    expect(cols(['prepare'])).toBe(5)
    expect(cols(['prepare', 'oracle'])).toBe(5)
    expect(cols(['prepare', 'step'])).toBe(9)
    expect(cols(['prepare', 'step', 'step', 'step', 'step', 'step'])).toBe(21)
  })
})

describe('Deutsch–Jozsa readings against the closed form (Bergou Eqs. 7.6–7.7)', () => {
  it('after the final Hadamards the all-zeros amplitude is 2⁻ⁿ Σ(−1)^f(x), for every function the bench offers at every n', () => {
    let checked = 0
    for (let n = 1; n <= 4; n++)
      for (const family of DJ_FAMILIES)
        for (const [a, b] of family === 'linear' ? [[0, 0], [1, 1], [2 ** n - 1, 0], [2 ** n - 1, 1]] : [[0, 0], [0, 1]]) {
          const setup = setupOf('dj', { n, family, a, b: b as Bit })
          if (setup.family !== family) continue
          const table = djFamilyTable(setup.family, n, setup.a, setup.b)
          const m = benchModel(setup, runOps('dj', ['prepare', 'oracle', 'final']))
          const amp = djOutputAmplitude(table, 0)
          expect(reading(m, 'amp0'), `n=${n} ${family} a=${a} b=${b}`).toBe(`amplitude of |${'0'.repeat(n)}⟩: ${fix(amp)}`)
          expect(reading(m, 'p0')).toBe(`chance of all zeros: ${fix(amp * amp)}`)
          expect(reading(benchModel(setup, runOps('dj', ['prepare', 'oracle'])), 'mean')).toBe(`average of the signs (−1)^f(x): ${fix(signMean(table))}`)
          // the promise: all zeros has chance 1 exactly when f is constant, 0 when it is balanced, and the verdict says so
          const verdict = benchModel(setup, runOps('dj', ['prepare', 'oracle', 'final', 'measure']))
          if (isConstant(table)) expect(reading(verdict, 'verdict')).toContain('chance 1, so f is constant')
          else expect(isBalanced(table) && reading(verdict, 'verdict').includes('chance 0, so f is balanced')).toBe(true)
          checked++
        }
    expect(checked).toBeGreaterThan(20)
  })
  it('the plan’s examples: n = 3 balanced step lands on four strings of chance ¼ and never on 000; f ≡ 1 reads 000 with amplitude −1; the bars’ mean after the oracle is 2^{−n/2} times the sign average', () => {
    const baln = benchModel(setupOf('dj', { n: 3, family: 'balanced' }), runOps('dj', ['prepare', 'oracle', 'final']))
    expect(reading(baln, 'amp0')).toBe('amplitude of |000⟩: 0')
    expect(reading(baln, 'likely')).toBe('most likely reading: 4 strings tie at chance 0.25, the first is 100')
    const one = benchModel(setupOf('dj', { n: 3, family: 'constant', b: 1 }), runOps('dj', ['prepare', 'oracle', 'final']))
    expect(reading(one, 'amp0')).toBe('amplitude of |000⟩: −1')
    expect(reading(one, 'likely')).toBe('most likely reading: 000, chance 1')
    const after = benchModel(setupOf('dj', { n: 3, family: 'constant', b: 1 }), runOps('dj', ['prepare', 'oracle']))
    const psi = runCircuit(after.circuit).states[2]
    close(meanAmplitude(psi).re, signMean(after.table!) / Math.sqrt(8))
    // x·101 is linear: the reading lands on a = 101 with chance 1
    const lin = benchModel(setupOf('dj', { n: 3, family: 'linear', a: 5, b: 0 }), runOps('dj', ['prepare', 'oracle', 'final']))
    expect(reading(lin, 'likely')).toBe('most likely reading: 101, chance 1')
  })
  it('the cost line is the engine’s: 1 oracle call in the circuit, 2^{n−1} + 1 for a classical computer that must be sure (2, 3, 5, 9)', () => {
    for (const n of [1, 2, 3, 4]) {
      expect(reading(benchModel(setupOf('dj', { n }), START), 'cost'), `n=${n}`).toBe(`oracle calls: 1 in this circuit, ${djDeterministicWorst(n)} for a classical computer that must be sure`)
    }
    expect([1, 2, 3, 4].map((n) => djDeterministicWorst(n))).toEqual([2, 3, 5, 9])
  })
})

describe('Bernstein–Vazirani readings (Eqs. 7.8–7.12): all 2·2ⁿ pairs for n = 1 … 4', () => {
  it('the read-off string is a with chance 1, the amplitude on |a⟩ is (−1)^b, the minus signs are f’s ones, and the classical run needs n + 1 queries', () => {
    let pairs = 0
    for (let n = 1; n <= 4; n++)
      for (let a = 0; a < 2 ** n; a++)
        for (const b of [0, 1] as const) {
          const m = benchModel(setupOf('bv', { n, a, b }), runOps('bv', ['prepare', 'oracle', 'final']))
          expect(reading(m, 'readoff'), `n=${n} a=${a} b=${b}`).toBe(`read-off a = ${bits(a, n)}, chance 1`)
          expect(reading(m, 'amp')).toBe(`amplitude of |${bits(a, n)}⟩: ${b ? '−1' : '1'}`)
          expect(reading(m, 'signs')).toBe(`bars below the axis: ${onesCount(bvTable(a, b, n))} of ${2 ** n}`)
          expect(reading(m, 'cost')).toBe(`oracle calls: 1 in this circuit, ${bvClassicalRun(bvTable(a, b, n), n).asked.length} classical`)
          expect(bvClassicalRun(bvTable(a, b, n), n).asked.length).toBe(n + 1)
          pairs++
        }
    expect(pairs).toBe(2 * (2 + 4 + 8 + 16))
  })
  it('after the oracle (before any Hadamard) the bars are the signs of H⊗ⁿ|a⟩ for b = 0: half of them minus for a ≠ 0 (the plan’s q16MinusCount = 4 at n = 3, a = 101)', () => {
    const m = benchModel(setupOf('bv', { n: 3, a: 5, b: 0 }), runOps('bv', ['prepare', 'oracle']))
    expect(reading(m, 'signs')).toBe('bars below the axis: 4 of 8')
    const psi = runCircuit(m.circuit).states[2]
    psi.forEach((z, x) => close(z.re, (dotMod2(5, x) ? -1 : 1) / Math.sqrt(8)))
  })
})

describe('Hadamard signs against the closed form (Bergou Eqs. 7.1–7.2, 7.10–7.11)', () => {
  it('after one column the bars are 2^{−n/2}(−1)^{x·z}, dot-odd many of them below the axis; after two the whole weight is back on |x⟩, for every x at every n', () => {
    let checked = 0
    for (let n = 1; n <= 4; n++)
      for (let x = 0; x < 2 ** n; x++) {
        const setup = setupOf('hadamard', { n, x })
        const N = 2 ** n
        const one = benchModel(setup, runOps('hadamard', ['hadamard']))
        const psi = runCircuit(one.circuit).states[1]
        hadamardColumn(x, n).forEach((v, z) => close(psi[z].re, v))
        expect(psi.filter((z) => z.re < 0), `n=${n} x=${x}`).toHaveLength(dotOddCount(x, n))
        expect(reading(one, 'signs')).toBe(`bars below the axis: ${dotOddCount(x, n)} of ${N}`)
        expect(reading(one, 'size')).toBe(`size of each bar after one column: ${fix(1 / Math.sqrt(N))}`)
        expect(one.headline).toBe(`One column of Hadamards: ${N} bars of size ${fix(1 / Math.sqrt(N))}, ${N - dotOddCount(x, n)} pointing up and ${dotOddCount(x, n)} pointing down.`)
        expect(one.N).toBe(N)
        const two = benchModel(setup, runOps('hadamard', ['hadamard', 'again']))
        const back = runCircuit(two.circuit).states[2]
        back.forEach((z, k) => close(z.re, k === x ? 1 : 0))
        expect(reading(two, 'amp')).toBe(`amplitude of |${bits(x, n)}⟩: 1`)
        expect(reading(two, 'chance')).toBe(`chance of ${bits(x, n)}: 1`)
        checked++
      }
    expect(checked).toBe(2 + 4 + 8 + 16)
  })
  it('it names no function, no cost line and no algorithm: only the string and the signs', () => {
    const m = benchModel(setupOf('hadamard', { n: 3, x: 5 }), START)
    expect(m.readings.map((r) => r.key)).toEqual(['x'])
    expect(m.table).toBeNull()
    expect(m.circuit.columns).toHaveLength(2)
    expect(m.circuit.init).toBe('101')
    expect(m.headline).toBe('Start: the wires hold the string |101⟩. Press Hadamards.')
    expect(m.ampState).toMatchObject({ mode: 'signed' })
    for (const st of [START, ...['hadamard', 'again'].map((_, i) => runOps('hadamard', ['hadamard', 'again'].slice(0, i + 1) as BenchOp[]))]) {
      const t = benchModel(setupOf('hadamard', { n: 3, x: 5 }), st)
      expect(t.readings.some((r) => r.key === 'f' || r.key === 'cost')).toBe(false)
      expect([t.headline, ...t.readings.map((r) => r.text)].join(' ')).not.toMatch(/oracle|a·x|⊕|Bernstein|classical/i)
    }
  })
})

describe('N is the model’s: the strings the circuit’s bars show, read off the circuit', () => {
  it('2^(wires of the circuit) for every mode but Simon, whose bars are its three input wires (8 of the five-wire register)', () => {
    for (const setup of setups()) {
      const m = benchModel(setup, START)
      expect(m.N, `${setup.mode} n=${setup.n}`).toBe(setup.mode === 'simon' ? 8 : 2 ** m.circuit.qubits)
    }
  })
})

describe('Grover readings against the plane and against inversion about the mean', () => {
  it('after k whole steps the chance of the marked string is sin²((2k+1)α), for N = 4, 8, 16 and k = 1 … 5, whichever string is marked; the plane arrow is the same state', () => {
    for (let n = 2; n <= 4; n++)
      for (const marked of [0, 2 ** n - 1, 5 % 2 ** n]) {
        const setup = setupOf('grover', { n, marked })
        const N = 2 ** n
        let st = runOps('grover', ['prepare'])
        for (let k = 1; k <= GROVER_STEPS_MAX; k++) {
          st = applyOp('grover', st, 'step')!
          const m = benchModel(setup, st)
          expect(reading(m, 'chance'), `N=${N} marked=${marked} k=${k}`).toBe(`chance of ${bits(marked, n)}: ${fix(groverSuccess(N, 1, k))}`)
          expect(reading(m, 'steps')).toBe(`whole steps done: ${k}`)
          const rp = resolveGroverPlaneStage(m.planeState!, 1)
          const psi = runCircuit(m.circuit).states[st.cursor]
          close(rp.success, abs2(psi[marked]))
          close(rp.arrow[1], psi[marked].re)
          close(rp.arrow[0], psi[(marked + 1) % N].re * Math.sqrt(N - 1))
        }
      }
  })
  it('the half steps: U_f flips the marked bar and leaves the chance (sin²((2k+1)α)); D then reflects every bar about the mean, to the next whole step — the textbook inversion, applied to the closed-form vector', () => {
    for (let n = 2; n <= 4; n++) {
      const N = 2 ** n
      const marked = N - 2
      const setup = setupOf('grover', { n, marked })
      for (let k = 0; k < GROVER_STEPS_MAX; k++) {
        // k whole steps by the closed form
        const before = groverStateVector(n, [marked], k)
        const flipped = before.map((z, x) => (x === marked ? { re: -z.re, im: 0 } : z))
        const mean = flipped.reduce((s, z) => s + z.re, 0) / N
        const after = flipped.map((z) => ({ re: 2 * mean - z.re, im: 0 }))
        const ops: BenchOp[] = ['prepare', ...Array<BenchOp>(k).fill('step'), 'oracle']
        const half = benchModel(setup, runOps('grover', ops))
        const psi = runCircuit(half.circuit).states[half.state.cursor]
        flipped.forEach((z, x) => close(psi[x].re, z.re))
        close(abs2(psi[marked]), groverPlane(N, 1, k)[1] ** 2)
        expect(reading(half, 'chance')).toBe(`chance of ${bits(marked, n)}: ${fix(groverSuccess(N, 1, k))}`)
        expect(reading(half, 'mean')).toBe(`mean amplitude: ${fix(mean)}`)
        expect(reading(half, 'steps')).toBe(`whole steps done: ${k} (the next one is half done)`)
        expect(half.planeState).toMatchObject({ half: 'oracle', k, mirrors: ['x0perp', 'w0'] })
        const done = benchModel(setup, runOps('grover', [...ops, 'diffuse']))
        const psi2 = runCircuit(done.circuit).states[done.state.cursor]
        after.forEach((z, x) => close(psi2[x].re, z.re))
        expect(reading(done, 'chance')).toBe(`chance of ${bits(marked, n)}: ${fix(groverSuccess(N, 1, k + 1))}`)
        expect(done.planeState).toMatchObject({ k: k + 1 })
        expect(done.planeState).not.toHaveProperty('half')
      }
    }
  })
  it('the plan’s numbers for N = 8, x₀ = 101: chance 0.125 after the mark, 0.781, 0.945, 0.33 after one, two, three steps, mean 0.265 after the mark, α = 20.7°, k* = 2', () => {
    const g = setupOf('grover', { n: 3, marked: 5 })
    expect(reading(benchModel(g, runOps('grover', ['prepare', 'oracle'])), 'chance')).toBe('chance of 101: 0.125')
    expect(reading(benchModel(g, runOps('grover', ['prepare', 'oracle'])), 'mean')).toBe('mean amplitude: 0.265')
    const chances = [1, 2, 3].map((k) => reading(benchModel(g, runOps('grover', ['prepare', ...Array<BenchOp>(k).fill('step')])), 'chance'))
    expect(chances).toEqual(['chance of 101: 0.781', 'chance of 101: 0.945', 'chance of 101: 0.33'])
    expect(reading(benchModel(g, START), 'kopt')).toBe('α = 20.7°; best number of steps k* = 2, chance 0.945')
  })
  it('k* and its chance are the engine’s (and equal the numpy scan in the fixture) for N = 4, 8, 16', () => {
    for (let n = 2; n <= 4; n++) {
      const N = 2 ** n
      const k = groverOptimalK(N)
      expect(k).toBe(FXG.kopt.find((r: { N: number; M?: number }) => r.N === N && r.M === undefined).kopt)
      expect(reading(benchModel(setupOf('grover', { n }), START), 'kopt')).toBe(`α = ${fix((groverAngle(N) * 180) / Math.PI, 1)}°; best number of steps k* = ${k}, chance ${fix(groverSuccess(N, 1, k))}`)
    }
    expect([4, 8, 16].map((N) => groverOptimalK(N))).toEqual([1, 2, 3])
  })
  it('before Prepare the plane is not live (|0…0⟩ is outside it) and the chance reading is not shown', () => {
    const m = benchModel(setupOf('grover', { n: 3, marked: 5 }), START)
    expect(m.planeLive).toBe(false)
    expect(m.readings.some((r) => r.key === 'chance')).toBe(false)
    expect(benchModel(setupOf('grover', { n: 3, marked: 5 }), runOps('grover', ['prepare'])).planeLive).toBe(true)
  })
})

describe('Simon readings (n = 3, five wires, Bergou Eq. 7.33 corrected)', () => {
  it('after the last Hadamards every y with y·s = 0 has chance 1/4 and the reading lists exactly those strings, for every s and every answer', () => {
    for (let s = 1; s < 8; s++)
      for (let answer = 0; answer < 4; answer++) {
        const m = benchModel(setupOf('simon', { s, answer }), runOps('simon', ['prepare', 'oracle', 'answer', 'final']))
        const perp = simonPerp(s, 3)
        expect(perp.every((y) => dotMod2(y, s) === 0) && perp.length === 4).toBe(true)
        expect(reading(m, 'perp'), `s=${s} answer=${answer}`).toBe(`strings y with y·s = 0: ${perp.map((y) => bits(y, 3)).join(', ')}`)
        expect(reading(m, 'chance')).toBe(`chance of each of those 4: ${fix(simonYDistribution(s, 3)[perp[0]])}`)
        expect(reading(m, 'chance')).toContain('0.25')
        expect(reading(m, 'answer')).toBe(`answer wires read: ${bits(answer, 2)}`)
      }
  })
  it('the circuit has five wires and five columns, and the answer wires are read as the outcome the learner chose', () => {
    const m = benchModel(setupOf('simon', { s: 6 }), runOps('simon', ['prepare', 'oracle']))
    expect(m.circuit.qubits).toBe(5)
    expect(m.circuit.columns).toHaveLength(5)
    expect(m.circuitState.outcomes).toBe('00')
  })
})

describe('the widget renders (server-side markup)', () => {
  const html = (props: object) => renderToString(<OracleBench {...props} />)
  it('every mode: labelled controls, one button per step in circuit order, Back and Reset, a live region, three svgs where the mode draws them, no NaN', () => {
    for (const mode of ORACLE_BENCH_MODES) {
      const h = html({ mode })
      const t = text(h)
      expect(t, mode).not.toMatch(/NaN|Infinity|undefined/)
      for (const { label } of BENCH_OPS[mode]) expect(t, `${mode}: ${label}`).toContain(label)
      // the Algorithm choice offers the four algorithms, and Hadamard signs only on a bench that starts there (where it offers nothing else)
      expect(t.includes('Hadamard signs'), mode).toBe(mode === 'hadamard')
      expect(t.includes('Bernstein–Vazirani'), mode).toBe(mode !== 'hadamard')
      expect(/>Hadamards( again)?<\/button>/.test(h), `${mode}: the Hadamard-signs steps`).toBe(mode === 'hadamard')
      expect(t).toContain('Back')
      expect(t).toContain('Reset')
      expect(h).toContain('role="status"')
      expect(h).toContain('aria-label="Algorithm"')
      expect(h).toContain('aria-label="Circuit steps"')
      expect(h.match(/<svg/g)?.length).toBe(mode === 'grover' ? 3 : 2)
      expect(h).toContain('class="svgk svgk-stage ob-circuit"')
      expect(h).toContain('class="svgk svgk-stage ob-bars"')
      expect(h.includes('ob-plane')).toBe(mode === 'grover')
    }
  })
  it('the controls carry their names: the wires slider, the function choice, the bit buttons with a position and a value, and the answer choice for Simon', () => {
    const dj = html({ mode: 'dj', n: 3, family: 'linear', a: 5 })
    expect(dj).toContain('aria-label="Function f"')
    expect(dj).toContain('aria-label="Hidden string a, bit 1 of 3: 1"')
    expect(dj).toContain('aria-label="Hidden string a, bit 2 of 3: 0"')
    expect(text(dj)).toContain('wires n')
    expect(text(dj)).toContain('3 (N = 8)')
    expect(html({ mode: 'dj', n: 1 })).toContain('aria-disabled="true" disabled="" title="for n = 1 and 2 every balanced function is linear"')
    expect(html({ mode: 'dj', n: 3 })).not.toContain('aria-disabled')
    expect(html({ mode: 'grover', n: 3, marked: 5 })).toContain('aria-label="Marked item, bit 1 of 3: 1"')
    const simon = html({ mode: 'simon', s: 6 })
    expect(simon).toContain('aria-label="Answer wires read as"')
    expect(simon).toContain('aria-label="Secret string s, bit 3 of 3: 0"')
    expect(simon).not.toContain('wires n')
  })
  it('the buttons: only Prepare is enabled at the start; `step` starts the run further on and the live region says where it is', () => {
    const start = html({ mode: 'dj' })
    expect(start).toContain('<button type="button" class="btn">Prepare</button>')
    expect(start).toContain('<button type="button" class="btn" disabled="">Oracle</button>')
    expect(start).toContain('<button type="button" class="btn ghost" disabled="">Back</button>')
    const mid = text(html({ mode: 'grover', n: 3, marked: 5, step: 5 }))
    expect(mid).toContain('Q applied: whole steps done: 1. The chance of |101⟩ is 0.781.')
    expect(mid).toContain('chance of 101: 0.781')
  })
  it('editable: false hides the settings and keeps the steps', () => {
    const h = html({ mode: 'bv', n: 3, a: 5, editable: false })
    expect(h).not.toContain('aria-label="Algorithm"')
    expect(h).not.toContain('Hidden string a')
    expect(text(h)).toContain('f(x) = a·x ⊕ b with a = 101, b = 0')
    expect(text(h)).toContain('Prepare')
  })
  it('the svgs describe themselves: the circuit names its columns and cursor, the bars their readouts, the plane its angle and chance', () => {
    const h = html({ mode: 'grover', n: 3, marked: 5, step: 5 })
    expect(h).toMatch(/aria-label="Circuit on 3 wires, 9 columns: after column 5 of 9"/)
    expect(h).toMatch(/aria-label="Bars: after column 5; /)
    expect(h).toContain('mean = 0.265')
    expect(h).toMatch(/aria-label="Grover plane: 8 strings; α = 20\.7°; k = 1; \(2k\+1\)α = 62\.1°; chance = 0\.7813/)
  })
})
