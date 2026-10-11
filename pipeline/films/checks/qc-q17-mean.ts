/**
 * The manifest check for the film `qc-q17-mean` (P-Q17-story §10, "Inversion about the mean, one step at a time"): recompute every number
 * the film drew with the engine. Imports only the engine (physics/qc: `groverCircuit`, `runCircuit`, `meanAmplitude`, and the closed form
 * `groverSuccess`), never the film's own data module, so a wrong layout or a hand-typed number shows up here. The plan's inputs (N = 8,
 * the marked string 101, two steps, the stage frames) are pinned below. Loaded by pipeline/films/check_manifest.ts after it registered the
 * engine's import hook.
 */
import { runCircuit } from '../../../app/src/physics/qc/circuit.ts'
import { groverCircuit, groverSuccess } from '../../../app/src/physics/qc/grover.ts'
import { meanAmplitude } from '../../../app/src/physics/qc/state.ts'
import type { CheckResult } from './types.ts'

const TOL = 1e-9

/** The storyboard, pinned so the film cannot drift from the plan. Engine columns: 1 = |w₀⟩, 2 + 4(j−1) after step j's mark, 1 + 4j after step j. */
const N = 8
const MARKED = 5 // the string 101
const STEPS = 2
const PLAN: { id: string; label: string; kind: 'start' | 'mark' | 'invert' | 'chance'; column: number; from: number; tween: number; to: number }[] = [
  { id: 'even-mix', label: 'the even mix', kind: 'start', column: 1, from: 0, tween: 0, to: 5 },
  { id: 'mark-1', label: 'the mark', kind: 'mark', column: 2, from: 6, tween: 12, to: 31 },
  { id: 'invert-1', label: 'inversion about the mean', kind: 'invert', column: 5, from: 32, tween: 24, to: 71 },
  { id: 'mark-2', label: 'the mark', kind: 'mark', column: 6, from: 72, tween: 12, to: 87 },
  { id: 'invert-2', label: 'inversion about the mean', kind: 'invert', column: 9, from: 88, tween: 20, to: 109 },
  { id: 'chance', label: 'the chance', kind: 'chance', column: 9, from: 110, tween: 8, to: 119 },
]
const FORMAT = { width: 1080, height: 1350, frames: 120, fps: 32 }

interface Stage {
  id: string
  label: string
  kind: 'start' | 'mark' | 'invert' | 'chance'
  frames: { from: number; tween: number; to: number; startedAt: number; settledAt: number }
  bars: number[]
  mean: number
  chance: number
  links: { from: number; to: number }[] | null
  linkOpacity: number
  chanceOpacity: number
}
interface Manifest {
  film: string
  format: typeof FORMAT
  layout: { pxPerUnit: number; barX: number[]; barWidth: number; marked: number }
  stages: Stage[]
  q17MeanAfterOracle: number
  q17InvUnmarked: number
  q17InvMarked: number
  q17P2: number
  lastFrame: number
}

const states = runCircuit(groverCircuit(3, ['101'], STEPS)).states
const barsAt = (col: number) => states[col].map((z) => z.re)
const meanAt = (col: number) => meanAmplitude(states[col]).re
const fx = (x: number) => x.toFixed(4)

export function check(raw: unknown): CheckResult {
  const m = raw as Manifest
  const failures: string[] = []
  const rows: string[] = []
  let count = 0
  const expect = (ok: boolean, what: string) => {
    count++
    if (!ok) failures.push(what)
  }
  expect(m.film === 'qc-q17-mean', `film id ${m.film}`)
  expect(JSON.stringify(m.format) === JSON.stringify(FORMAT), `format ${JSON.stringify(m.format)}`)
  expect(m.lastFrame === FORMAT.frames - 1, `last frame ${m.lastFrame}, want ${FORMAT.frames - 1}`)
  expect(m.layout.marked === MARKED, `marked string ${m.layout.marked}, plan ${MARKED} (101)`)
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
    const f = s.frames
    expect(f.from === p.from && f.tween === p.tween && f.to === p.to, `${what}: frames ${JSON.stringify(f)}, plan ${p.from}–${p.to} (tween ${p.tween})`)
    expect(f.startedAt === p.from, `${what}: started at frame ${f.startedAt}, planned ${p.from}`)
    expect(f.settledAt >= p.from + p.tween && f.settledAt <= Math.min(p.to, p.from + p.tween + 1), `${what}: settled at frame ${f.settledAt}, tween planned for ${p.from + p.tween}`)
    expect(k === 0 ? f.from === 0 : f.from === PLAN[k - 1].to + 1, `${what}: does not follow the stage before it`)
    // the bars and the mean line: the engine's state at this stage's column and its mean amplitude
    const want = barsAt(p.column)
    expect(s.bars.length === N, `${what}: ${s.bars.length} bars`)
    let worst = 0
    s.bars.forEach((a, i) => {
      worst = Math.max(worst, Math.abs(a - want[i]))
      expect(Math.abs(a - want[i]) < TOL, `${what}: bar ${i} drawn at ${a}, engine ${want[i]}`)
    })
    expect(Math.abs(s.mean - meanAt(p.column)) < TOL, `${what}: mean line drawn at ${s.mean}, engine ${meanAt(p.column)}`)
    // a mark flips the marked bar and changes no other; an inversion keeps the mean (the engine's own states say so)
    if (p.kind === 'mark') {
      const before = PLAN[k - 1] ? barsAt(PLAN[k - 1].column) : []
      s.bars.forEach((a, i) => expect(Math.abs(a - (i === MARKED ? -before[i] : before[i])) < TOL, `${what}: bar ${i} is not the previous bar ${i === MARKED ? 'flipped' : 'unchanged'}`))
    }
    if (p.kind === 'invert') {
      const before = barsAt(PLAN[k - 1].column)
      expect(Math.abs(s.mean - meanAt(PLAN[k - 1].column)) < TOL, `${what}: the mean line moved across the inversion`)
      // each bar lands as far on the other side of the mean line as it was: new = 2·mean − old (checked on the drawn links, ends against the engine's two states)
      expect(s.links !== null && s.links.length === N, `${what}: ${s.links?.length ?? 0} links`)
      s.links?.forEach((l, i) => {
        expect(Math.abs(l.from - before[i]) < TOL && Math.abs(l.to - want[i]) < TOL, `${what}: link ${i} runs ${l.from} → ${l.to}, engine ${before[i]} → ${want[i]}`)
        expect(Math.abs((l.from + l.to) / 2 - meanAt(p.column)) < TOL, `${what}: link ${i} is not centred on the mean line`)
      })
      expect(s.linkOpacity > 0, `${what}: links hidden`)
    } else {
      expect(s.links === null && s.linkOpacity === 0, `${what}: links shown (opacity ${s.linkOpacity})`)
    }
    // the chance column: only the last stage, the squared marked bar (and the closed form sin²((2k+1)α))
    if (p.kind === 'chance') {
      expect(Math.abs(s.chance - states[p.column][MARKED].re ** 2) < TOL, `${what}: chance drawn at ${s.chance}, engine ${states[p.column][MARKED].re ** 2}`)
      expect(Math.abs(s.chance - groverSuccess(N, 1, STEPS)) < TOL, `${what}: chance drawn at ${s.chance}, closed form ${groverSuccess(N, 1, STEPS)}`)
      expect(s.chanceOpacity === 1, `${what}: chance column opacity ${s.chanceOpacity}`)
    } else {
      expect(Math.abs(s.chance) < TOL && s.chanceOpacity === 0, `${what}: chance column not empty (${s.chance}, opacity ${s.chanceOpacity})`)
    }
    rows.push(`${s.id.padEnd(10)} mean ${fx(s.mean)}  bars ${s.bars.map(fx).join(' ')}  chance ${fx(s.chance)}  max bar error ${worst.toExponential(1)}`)
  })

  // the named keys, each from the drawn stage and the engine
  const at = (id: string) => m.stages.find((s) => s.id === id)
  const e = { mean: meanAt(2), unmarked: states[5][0].re, marked: states[5][MARKED].re, p2: groverSuccess(N, 1, 2) }
  expect(Math.abs(m.q17MeanAfterOracle - e.mean) < TOL && at('mark-1')?.mean === m.q17MeanAfterOracle, `q17MeanAfterOracle ${m.q17MeanAfterOracle}, engine ${e.mean}`)
  expect(Math.abs(m.q17InvUnmarked - e.unmarked) < TOL && at('invert-1')?.bars[0] === m.q17InvUnmarked, `q17InvUnmarked ${m.q17InvUnmarked}, engine ${e.unmarked}`)
  expect(Math.abs(m.q17InvMarked - e.marked) < TOL && at('invert-1')?.bars[MARKED] === m.q17InvMarked, `q17InvMarked ${m.q17InvMarked}, engine ${e.marked}`)
  expect(Math.abs(m.q17P2 - e.p2) < TOL && at('chance')?.chance === m.q17P2, `q17P2 ${m.q17P2}, engine ${e.p2}`)
  rows.push(`q17MeanAfterOracle ${fx(m.q17MeanAfterOracle)}  q17InvUnmarked ${fx(m.q17InvUnmarked)}  q17InvMarked ${fx(m.q17InvMarked)}  q17P2 ${fx(m.q17P2)}`)
  return { failures, rows, count }
}

export function selfTests(raw: unknown): [string, unknown][] {
  const base = raw as Manifest
  const moved = structuredClone(base)
  moved.stages[2].bars[5] += 1e-6
  const meanOff = structuredClone(base)
  meanOff.stages[1].mean += 1e-6
  const linkOff = structuredClone(base)
  linkOff.stages[2].links![0].to += 1e-6
  const chanceOff = structuredClone(base)
  chanceOff.stages[5].chance = 0.9
  const relabelled = structuredClone(base)
  relabelled.stages[2].label = 'reflection about zero'
  const late = structuredClone(base)
  late.stages[4].frames.startedAt += 1
  const keyOff = structuredClone(base)
  keyOff.q17InvMarked = 0.88
  const notFlipped = structuredClone(base)
  notFlipped.stages[1].bars[MARKED] = base.stages[0].bars[MARKED]
  return [
    ['a bar moved 1e-6', moved],
    ['the mean line moved 1e-6', meanOff],
    ['a link end moved 1e-6', linkOff],
    ['the chance column at 0.9 instead of 0.9453', chanceOff],
    ['label "reflection about zero"', relabelled],
    ['a stage started a frame late', late],
    ['q17InvMarked = 0.88', keyOff],
    ['the mark leaves the marked bar unflipped', notFlipped],
  ]
}
