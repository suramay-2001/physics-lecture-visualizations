/**
 * The manifest check for the film `f1-euler-limit` (P-F1-story §10.2): recompute every number the film drew with the engine.
 * This module imports only the engine (app/src/physics), never the film's own data module, so a wrong layout or a hand-typed
 * number shows up here. `selfTests` gives tampered copies that must FAIL (a corner moved 1e-6, a wrong n label, a circle corner
 * pulled in, a stage a frame late). Loaded by pipeline/films/check_manifest.ts, after it registered the engine's import hook.
 */
import type { CheckResult } from './types.ts'

type C = { re: number; im: number }
type P = [number, number]
/** The storyboard's inputs (P-F1-story §10.2, first pass): the check pins them so the film cannot drift from the plan. */
const STORYBOARD = { phi: Math.PI, ns: [1, 2, 4, 8, 16, 64] }
const TOL = 1e-9

interface Stage {
  n: number
  label: string
  frames: { from: number; to: number; startedAt: number }
  corners: P[]
  end: P
}
interface Manifest {
  film: string
  phi: number
  format: { width: number; height: number; frames: number; fps: number }
  unitCircle: P[]
  pxPerUnit: number
  target: P
  stages: Stage[]
  landing: { startedAt: number; frames: number }
  lastFrame: number
}

const { eulerLimit, eulerPath } = (await import('../../../app/src/physics/qc/complexExtra.ts')) as {
  eulerLimit: (phi: number, n: number) => C
  eulerPath: (phi: number, n: number) => C[]
}
const { abs, expi } = (await import('../../../app/src/physics/complex.ts')) as { abs: (z: C) => number; expi: (t: number) => C }

const dist = (p: P, z: C) => Math.hypot(p[0] - z.re, p[1] - z.im)

export function check(raw: unknown): CheckResult {
  const m = raw as Manifest
  const failures: string[] = []
  const rows: string[] = []
  let count = 0
  const expect = (ok: boolean, what: string) => {
    count++
    if (!ok) failures.push(what)
  }
  expect(m.film === 'f1-euler-limit', `film id ${m.film}`)
  expect(m.phi === STORYBOARD.phi, `phi ${m.phi} is not the storyboard's π`)
  expect(JSON.stringify(m.stages.map((s) => s.n)) === JSON.stringify(STORYBOARD.ns), `n list ${m.stages.map((s) => s.n)}`)
  const target = expi(m.phi)
  expect(dist(m.target, target) < TOL, `target ${m.target} vs e^{iφ} ${target.re},${target.im}`)
  // the unit circle: the engine's e^{iθ} at N evenly spaced θ, and each on |z| = |e^{iφ}|
  const N = m.unitCircle.length
  expect(N >= 64, `unit circle has only ${N} corners`)
  m.unitCircle.forEach((p, k) => {
    expect(dist(p, expi((2 * Math.PI * k) / N)) < TOL, `unit circle corner ${k} is not e^{2πi·${k}/${N}}`)
    expect(Math.abs(Math.hypot(p[0], p[1]) - abs(target)) < TOL, `unit circle corner ${k} off the circle`)
  })
  // the chord's sag at this scale, in px: the polygon must read as the circle
  const sagPx = m.pxPerUnit * abs(target) * (1 - Math.cos(Math.PI / N))
  expect(sagPx < 0.05, `unit circle polygon sags ${sagPx.toFixed(3)} px`)
  let lastGap = Infinity
  for (const s of m.stages) {
    const path = eulerPath(m.phi, s.n)
    const end = eulerLimit(m.phi, s.n)
    expect(s.label === `n = ${s.n}`, `n = ${s.n}: label "${s.label}"`)
    expect(s.corners.length === path.length, `n = ${s.n}: ${s.corners.length} corners, engine has ${path.length}`)
    let worst = 0
    s.corners.forEach((p, k) => {
      const d = dist(p, path[k])
      worst = Math.max(worst, d)
      expect(d < TOL, `n = ${s.n}: corner ${k} off by ${d.toExponential(2)}`)
    })
    const dEnd = dist(s.end, end)
    expect(dEnd < TOL, `n = ${s.n}: drawn end point off by ${dEnd.toExponential(2)}`)
    expect(s.frames.startedAt === s.frames.from, `n = ${s.n}: started at frame ${s.frames.startedAt}, planned ${s.frames.from}`)
    const gap = dist(s.end, target)
    expect(gap < lastGap, `n = ${s.n}: end point does not close in on e^{iφ} (${gap} ≥ ${lastGap})`)
    lastGap = gap
    rows.push(
      `n = ${String(s.n).padStart(2)}  |end| = ${abs(end).toFixed(3)}  end = ${end.re.toFixed(3)} ${end.im < 0 ? '−' : '+'} ${Math.abs(end.im).toFixed(3)}i  ` +
        `|end − e^{iφ}| = ${gap.toFixed(3)}  max corner error ${worst.toExponential(1)}  end error ${dEnd.toExponential(1)}`,
    )
  }
  const lastStage = m.stages.at(-1)!
  expect(m.landing.startedAt === lastStage.frames.to + 1, `landing started at frame ${m.landing.startedAt}, want ${lastStage.frames.to + 1}`)
  expect(m.lastFrame === m.format.frames - 1, `last frame ${m.lastFrame}, want ${m.format.frames - 1}`)
  return { failures, rows, count }
}


export function selfTests(raw: unknown): [string, unknown][] {
  const manifest = raw as Manifest
  const moved = structuredClone(manifest)
  moved.stages[3].corners[2][0] += 1e-6
  const relabelled = structuredClone(manifest)
  relabelled.stages[5].label = 'n = 65'
  const shrunk = structuredClone(manifest)
  shrunk.unitCircle[40] = [shrunk.unitCircle[40][0] * 0.9999, shrunk.unitCircle[40][1] * 0.9999]
  const late = structuredClone(manifest)
  late.stages[2].frames.startedAt += 1
  return [
    ['corner moved 1e-6', moved],
    ['label n = 65', relabelled],
    ['circle corner pulled in 0.01 %', shrunk],
    ['stage started a frame late', late],
  ]
}
