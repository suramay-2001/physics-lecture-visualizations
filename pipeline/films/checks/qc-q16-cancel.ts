/**
 * The manifest check for the film `qc-q16-cancel` (P-Q16-story §10, "Balanced functions cancel the all-zeros bar"): recompute every
 * number the film drew with the engine. Imports only the engine (physics/qc: `djCircuit`, `runCircuit`, `meanAmplitude`, and the closed
 * form `djOutputAmplitude`), never the film's own data module, so a wrong layout or a hand-typed number shows up here. The plan's inputs
 * (n = 3, F_BALN, the order of the switches, the stage frames) are pinned below. Loaded by pipeline/films/check_manifest.ts after it
 * registered the engine's import hook.
 */
import { runCircuit } from '../../../app/src/physics/qc/circuit.ts'
import { djCircuit, djOutputAmplitude, signMean } from '../../../app/src/physics/qc/oracles.ts'
import { meanAmplitude } from '../../../app/src/physics/qc/state.ts'
import type { CheckResult } from './types.ts'

type Bit = 0 | 1
const TOL = 1e-9

/** The storyboard (P-Q16-story §10 and running example R1), pinned so the film cannot drift from the plan. */
const N = 8
const F_BALN: Bit[] = [0, 1, 1, 1, 1, 0, 0, 0]
const ones = (strings: number[]): Bit[] => Array.from({ length: N }, (_, x) => (strings.includes(x) ? 1 : 0))
const PLAN: { id: string; label: string; kind: 'query' | 'output'; table: Bit[]; from: number; tween: number; to: number }[] = [
  { id: 'f-zero', label: 'the query', kind: 'query', table: ones([]), from: 0, tween: 0, to: 3 },
  { id: 'switch-1', label: 'the query', kind: 'query', table: ones([1]), from: 4, tween: 6, to: 11 },
  { id: 'switch-2', label: 'the query', kind: 'query', table: ones([1, 2]), from: 12, tween: 6, to: 19 },
  { id: 'switch-3', label: 'the query', kind: 'query', table: ones([1, 2, 3]), from: 20, tween: 6, to: 27 },
  { id: 'switch-4', label: 'the query', kind: 'query', table: F_BALN, from: 28, tween: 6, to: 39 },
  { id: 'last-balanced', label: 'the last Hadamards', kind: 'output', table: F_BALN, from: 40, tween: 16, to: 79 },
  { id: 'f-one', label: 'the query', kind: 'query', table: ones([0, 1, 2, 3, 4, 5, 6, 7]), from: 80, tween: 16, to: 99 },
  { id: 'last-constant', label: 'the last Hadamards', kind: 'output', table: ones([0, 1, 2, 3, 4, 5, 6, 7]), from: 100, tween: 12, to: 119 },
]
const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 }

interface Stage {
  id: string
  label: string
  kind: 'query' | 'output'
  table: Bit[]
  frames: { from: number; tween: number; to: number; startedAt: number; settledAt: number }
  bars: number[]
  mean: number
  meanOpacity: number
  columnOpacity: number
}
interface Manifest {
  film: string
  format: typeof FORMAT
  layout: { pxPerUnit: number; barX: number[]; barWidth: number }
  stages: Stage[]
  q16DjMean: number
  q16DjBalnZero: number
  q16DjConstAmp: number
  lastFrame: number
}

/** The engine's two states for a table: after the query (column 2) and after the last Hadamards (column 3), as real parts. */
const sim = (table: Bit[]) => {
  const states = runCircuit(djCircuit(table, 'phase')).states
  return { query: states[2].map((z) => z.re), output: states[3].map((z) => z.re), mean: meanAmplitude(states[2]).re, outputZero: states[3][0] }
}
const fx = (x: number) => (Math.abs(x) < 5e-5 ? '0.0000' : x.toFixed(4))

export function check(raw: unknown): CheckResult {
  const m = raw as Manifest
  const failures: string[] = []
  const rows: string[] = []
  let count = 0
  const expect = (ok: boolean, what: string) => {
    count++
    if (!ok) failures.push(what)
  }
  expect(m.film === 'qc-q16-cancel', `film id ${m.film}`)
  expect(JSON.stringify(m.format) === JSON.stringify(FORMAT), `format ${JSON.stringify(m.format)}`)
  expect(m.lastFrame === FORMAT.frames - 1, `last frame ${m.lastFrame}, want ${FORMAT.frames - 1}`)
  expect(m.layout.barX.length === N, `${m.layout.barX.length} bar positions, want ${N}`)
  const pitch = m.layout.barX[1] - m.layout.barX[0]
  m.layout.barX.forEach((x, i) => expect(pitch > 0 && Math.abs(x - m.layout.barX[0] - i * pitch) < 1e-9, `bar ${i} is not on an even pitch, left to right (string 000 first)`))
  expect(m.layout.pxPerUnit > 0, 'no scale')
  expect(m.stages.length === PLAN.length, `${m.stages.length} stages, plan has ${PLAN.length}`)

  m.stages.forEach((s, k) => {
    const p = PLAN[k]
    if (!p) return
    const what = `stage ${s.id}`
    expect(s.id === p.id, `stage ${k}: id ${s.id}, plan ${p.id}`)
    expect(s.label === p.label, `${what}: label "${s.label}", plan "${p.label}"`)
    expect(s.kind === p.kind, `${what}: kind ${s.kind}`)
    expect(JSON.stringify(s.table) === JSON.stringify(p.table), `${what}: f is ${s.table.join('')}, plan ${p.table.join('')}`)
    // the frames: it starts on its planned frame, its tween ends within the stage, and the stages tile the film
    const f = s.frames
    expect(f.from === p.from && f.tween === p.tween && f.to === p.to, `${what}: frames ${JSON.stringify(f)}, plan ${p.from}–${p.to} (tween ${p.tween})`)
    expect(f.startedAt === p.from, `${what}: started at frame ${f.startedAt}, planned ${p.from}`)
    expect(f.settledAt >= p.from + p.tween && f.settledAt <= Math.min(p.to, p.from + p.tween + 1), `${what}: settled at frame ${f.settledAt}, tween planned for ${p.from + p.tween}`)
    expect(k === 0 ? f.from === 0 : f.from === PLAN[k - 1].to + 1, `${what}: does not follow the stage before it`)
    // the bars: the engine's state after the query, or after the last Hadamards
    const e = sim(p.table)
    const want = p.kind === 'query' ? e.query : e.output
    expect(s.bars.length === N, `${what}: ${s.bars.length} bars`)
    let worst = 0
    s.bars.forEach((a, i) => {
      worst = Math.max(worst, Math.abs(a - want[i]))
      expect(Math.abs(a - want[i]) < TOL, `${what}: bar ${i} drawn at ${a}, engine ${want[i]}`)
    })
    if (p.kind === 'query') {
      // the dashed mean line: the engine's mean amplitude, and (Eq. 7.7's route) √8 times it is the mean of the signs (−1)^f(x)
      expect(Math.abs(s.mean - e.mean) < TOL, `${what}: mean line drawn at ${s.mean}, engine ${e.mean}`)
      expect(Math.abs(s.mean * Math.sqrt(N) - signMean(p.table)) < TOL, `${what}: mean line is not 2^(−n/2) times the mean of the signs`)
      expect(s.meanOpacity === 1 && s.columnOpacity === 0, `${what}: mean line opacity ${s.meanOpacity}, column ${s.columnOpacity}`)
    } else {
      // the last Hadamards: the closed form of Bergou's Eq. 7.6 for every string, and the mean line gone, the all-zeros column framed
      want.forEach((_, z) => expect(Math.abs(s.bars[z] - djOutputAmplitude(p.table, z)) < TOL, `${what}: bar ${z} against the closed form Σ(−1)^(f(x)+x·z)/2^n`))
      expect(s.meanOpacity === 0 && s.columnOpacity === 1, `${what}: mean line opacity ${s.meanOpacity}, column ${s.columnOpacity}`)
    }
    rows.push(`${s.id.padEnd(14)} ${p.kind === 'query' ? `mean ${fx(s.mean)}  ` : '                '}bars ${s.bars.map(fx).join(' ')}  max bar error ${worst.toExponential(1)}`)
  })

  // the named keys, each from the drawn stage and the engine
  const baln = sim(F_BALN)
  const one = sim(ones([0, 1, 2, 3, 4, 5, 6, 7]))
  const at = (id: string) => m.stages.find((s) => s.id === id)
  expect(Math.abs(m.q16DjMean - baln.mean) < TOL && at('switch-4') !== undefined && at('switch-4')!.mean === m.q16DjMean, `q16DjMean ${m.q16DjMean}, engine ${baln.mean}`)
  const pBaln = baln.outputZero.re ** 2 + baln.outputZero.im ** 2
  expect(Math.abs(m.q16DjBalnZero - pBaln) < TOL && at('last-balanced') !== undefined && Math.abs(at('last-balanced')!.bars[0] ** 2 - m.q16DjBalnZero) < 1e-15, `q16DjBalnZero ${m.q16DjBalnZero}, engine ${pBaln}`)
  expect(Math.abs(m.q16DjConstAmp - one.outputZero.re) < TOL && at('last-constant') !== undefined && at('last-constant')!.bars[0] === m.q16DjConstAmp, `q16DjConstAmp ${m.q16DjConstAmp}, engine ${one.outputZero.re}`)
  rows.push(`q16DjMean ${fx(m.q16DjMean)}  q16DjBalnZero ${fx(m.q16DjBalnZero)}  q16DjConstAmp ${fx(m.q16DjConstAmp)}`)
  return { failures, rows, count }
}

export function selfTests(raw: unknown): [string, unknown][] {
  const base = raw as Manifest
  const moved = structuredClone(base)
  moved.stages[2].bars[3] += 1e-6
  const meanOff = structuredClone(base)
  meanOff.stages[4].mean += 1e-6
  const relabelled = structuredClone(base)
  relabelled.stages[5].label = 'the first Hadamards'
  const late = structuredClone(base)
  late.stages[3].frames.startedAt += 1
  const notCancelled = structuredClone(base)
  notCancelled.stages[5].bars[0] = 1e-6
  const constTampered = structuredClone(base)
  constTampered.q16DjConstAmp = -0.99
  const wrongF = structuredClone(base)
  wrongF.stages[2].table = [0, 1, 0, 1, 0, 1, 0, 1]
  return [
    ['a bar moved 1e-6', moved],
    ['the mean line moved 1e-6', meanOff],
    ['label "the first Hadamards"', relabelled],
    ['a stage started a frame late', late],
    ['the balanced all-zeros bar not cancelled (1e-6)', notCancelled],
    ['q16DjConstAmp = −0.99', constTampered],
    ['a different f in a switch stage', wrongF],
  ]
}
