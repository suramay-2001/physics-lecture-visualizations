/**
 * The shared half of every plot film's manifest check (films/src/kit.ts, films/src/kitScene.tsx). A film's check module
 * (pipeline/films/checks/<film>.ts) imports ONLY the engine, builds a `Plan` from it (every sample of every curve, every stage's bar
 * heights, the stage frames and labels it pins by hand from the chapter plan), and hands it here with the manifest the scene wrote
 * from the DRAWN nodes. Nothing in this file knows a film's data module, so a wrong layout or a hand-typed number shows up as a mismatch.
 */
import type { CheckResult } from './types.ts'

export type Pt = readonly [number, number]
export interface PlanStage {
  id: string
  label: string
  kind: string
  from: number
  tween: number
  to: number
  upTo: Record<string, number>
  heights: Record<string, number[]>
}
export interface PlanKey {
  name: string
  stage: string
  value: number
  line?: string
  comp?: 0 | 1
  bars?: string
  index?: number
}
export interface Plan {
  film: string
  format: { width: number; height: number; frames: number; fps: number }
  stages: PlanStage[]
  /** the engine's samples of every line series */
  lines: Record<string, Pt[]>
  /** the line series that carry a tip dot */
  tips: string[]
  /** a pinned description of every guide: null when the drawn points fit it, else what is wrong */
  guides: Record<string, (pts: Pt[]) => string | null>
  keys: PlanKey[]
}

interface View {
  ox: number
  oy: number
  sx: number
  sy: number
}
interface StageM {
  id: string
  label: string
  kind: string
  frames: { from: number; tween: number; to: number; startedAt: number; settledAt: number }
  lines: Record<string, { count: number; last: Pt }>
  tips: Record<string, Pt>
  bars: Record<string, number[]>
}
interface Manifest {
  film: string
  format: Plan['format']
  views: Record<string, View>
  guides: { id: string; view: string; pts: Pt[] }[]
  stages: StageM[]
  lines: Record<string, Pt[]>
  lastFrame: number
  [key: string]: unknown
}

export const TOL = 1e-9
/** A guide that is one horizontal segment at height v from u0 to u1. */
export const segment =
  (v: number, u0: number, u1: number) =>
  (pts: Pt[]): string | null =>
    pts.length === 2 && pts.every((p) => Math.abs(p[1] - v) < TOL) && Math.abs(pts[0][0] - u0) < TOL && Math.abs(pts[1][0] - u1) < TOL ? null : `not the segment v = ${v}, u = ${u0}…${u1} (${JSON.stringify(pts)})`
const fx = (x: number) => (Math.abs(x) >= 1e-3 || x === 0 ? x.toFixed(4) : x.toExponential(2))
const near = (a: number, b: number) => Math.abs(a - b) < TOL
const nearPt = (a: Pt, b: Pt) => near(a[0], b[0]) && near(a[1], b[1])

export function checkFilm(raw: unknown, plan: Plan): CheckResult {
  const m = raw as Manifest
  const failures: string[] = []
  const rows: string[] = []
  let count = 0
  const expect = (ok: boolean, what: string) => {
    count++
    if (!ok) failures.push(what)
  }
  expect(m.film === plan.film, `film id ${m.film}`)
  expect(JSON.stringify(m.format) === JSON.stringify(plan.format), `format ${JSON.stringify(m.format)}`)
  expect(m.lastFrame === plan.format.frames - 1, `last frame ${m.lastFrame}, want ${plan.format.frames - 1}`)
  const viewIds = new Set<string>(Object.keys(m.views ?? {}))
  viewIds.forEach((id) => expect(m.views[id].sx > 0 && m.views[id].sy > 0, `view ${id} has no scale`))
  expect(m.stages.length === plan.stages.length, `${m.stages.length} stages, plan has ${plan.stages.length}`)

  m.stages.forEach((s, k) => {
    const p = plan.stages[k]
    if (!p) return
    const what = `stage ${s.id}`
    expect(s.id === p.id, `stage ${k}: id ${s.id}, plan ${p.id}`)
    expect(s.label === p.label, `${what}: label "${s.label}", plan "${p.label}"`)
    expect(s.kind === p.kind, `${what}: kind ${s.kind}, plan ${p.kind}`)
    const f = s.frames
    expect(f.from === p.from && f.tween === p.tween && f.to === p.to, `${what}: frames ${JSON.stringify(f)}, plan ${p.from}–${p.to} (tween ${p.tween})`)
    expect(f.startedAt === p.from, `${what}: started at frame ${f.startedAt}, planned ${p.from}`)
    expect(f.settledAt >= p.from + p.tween && f.settledAt <= Math.min(p.to, p.from + p.tween + 1), `${what}: settled at frame ${f.settledAt}, tween planned for ${p.from + p.tween}`)
    expect(k === 0 ? f.from === 0 : f.from === plan.stages[k - 1].to + 1, `${what}: does not follow the stage before it`)
    let worst = 0
    for (const [id, pts] of Object.entries(plan.lines)) {
      const upTo = p.upTo[id]
      const d = s.lines[id]
      expect(d !== undefined && d.count === upTo + 1, `${what}: line ${id} has ${d?.count} points drawn, plan ${upTo + 1}`)
      if (!d) continue
      const want = pts[upTo]
      expect(nearPt(d.last, want), `${what}: line ${id} ends at (${d.last}), engine (${want})`)
      worst = Math.max(worst, Math.abs(d.last[0] - want[0]), Math.abs(d.last[1] - want[1]))
      if (plan.tips.includes(id)) expect(s.tips[id] !== undefined && nearPt(s.tips[id], want), `${what}: tip of ${id} at (${s.tips[id]}), engine (${want})`)
    }
    for (const [id, hs] of Object.entries(p.heights)) {
      const d = s.bars[id] ?? []
      expect(d.length === hs.length, `${what}: ${d.length} ${id} drawn, plan ${hs.length}`)
      hs.forEach((h, i) => {
        worst = Math.max(worst, Math.abs((d[i] ?? NaN) - h))
        expect(near(d[i], h), `${what}: ${id} ${i} drawn at ${d[i]}, engine ${h}`)
      })
    }
    const tips = Object.entries(plan.lines).map(([id]) => `${id} ${fx(s.lines[id]?.last[1] ?? NaN)}`)
    const bars = Object.entries(p.heights).map(([id, hs]) => `${id} ${(s.bars[id] ?? []).map(fx).join(' ') || hs.length}`)
    rows.push(`${s.id.padEnd(12)} ${[...tips, ...bars].join('  ')}  max error ${worst.toExponential(1)}`)
  })

  // every sample of every curve, as drawn at the end
  for (const [id, pts] of Object.entries(plan.lines)) {
    const d = m.lines?.[id] ?? []
    expect(d.length === pts.length, `line ${id}: ${d.length} points drawn, engine ${pts.length}`)
    pts.forEach((w, i) => expect(d[i] !== undefined && nearPt(d[i], w), `line ${id} point ${i}: drawn (${d[i]}), engine (${w})`))
  }
  // the guides, against their pinned description
  for (const [id, fit] of Object.entries(plan.guides)) {
    const g = m.guides.find((x) => x.id === id)
    expect(g !== undefined, `no guide ${id}`)
    if (g) {
      const bad = fit(g.pts)
      expect(bad === null, `guide ${id}: ${bad}`)
    }
  }
  // the drawn marks lie inside the frame (a wrong scale would push a curve off it)
  const inside = (view: string, u: number, v: number) => {
    const w = m.views[view]
    const x = w.ox + w.sx * u
    const y = w.oy - w.sy * v
    return Math.abs(x) <= plan.format.width / 2 && Math.abs(y) <= plan.format.height / 2
  }
  m.guides.forEach((g) => expect(g.pts.every((p) => inside(g.view, p[0], p[1])), `guide ${g.id} leaves the frame`))
  // the named numbers, each from the drawn stage and the engine
  for (const key of plan.keys) {
    const drawn = m[key.name] as number
    const stage = m.stages.find((s) => s.id === key.stage)
    const fromStage = key.line ? stage?.tips[key.line]?.[key.comp ?? 1] : stage?.bars[key.bars ?? '']?.[key.index ?? 0]
    expect(typeof drawn === 'number' && near(drawn, key.value), `${key.name} ${drawn}, engine ${key.value}`)
    expect(fromStage === drawn, `${key.name}: the stage ${key.stage} drew ${fromStage}, the key says ${drawn}`)
  }
  rows.push(plan.keys.map((k) => `${k.name} ${fx(m[k.name] as number)}`).join('  '))
  return { failures, rows, count }
}

/** The tampered copies of the manifest that must FAIL (otherwise the check itself might be a no-op). */
export function kitSelfTests(raw: unknown, plan: Plan): [string, unknown][] {
  const base = raw as Manifest
  const lineId = Object.keys(plan.lines)[0]
  const out: [string, unknown][] = []
  const clone = () => structuredClone(base)
  if (lineId) {
    const a = clone()
    a.lines[lineId][Math.floor(a.lines[lineId].length / 2)][1] += 1e-6
    out.push([`a ${lineId} sample moved 1e-6`, a])
    const b = clone()
    b.stages[b.stages.length - 1].lines[lineId].last = [b.stages[b.stages.length - 1].lines[lineId].last[0], b.stages[b.stages.length - 1].lines[lineId].last[1] + 1e-6]
    out.push([`the last ${lineId} end moved 1e-6`, b])
    const c = clone()
    c.stages[1].lines[lineId].count += 1
    out.push([`one point too many drawn at stage 1`, c])
  }
  const barId = plan.stages.map((s) => Object.keys(s.heights)[0]).find((x) => x !== undefined)
  if (barId) {
    const d = clone()
    d.stages[1].bars[barId][0] += 1e-6
    out.push([`a ${barId} height moved 1e-6`, d])
  }
  const e = clone()
  e.stages[1].label = 'a result nobody planned'
  out.push(['a relabelled stage', e])
  const f = clone()
  f.stages[f.stages.length - 1].frames.startedAt += 1
  out.push(['the last stage started a frame late', f])
  if (plan.keys.length) {
    const g = clone()
    g[plan.keys[0].name] = (g[plan.keys[0].name] as number) + 0.01
    out.push([`${plan.keys[0].name} off by 0.01`, g])
  }
  const h = clone()
  h.guides[0].pts[0] = [h.guides[0].pts[0][0], h.guides[0].pts[0][1] + 0.01]
  out.push([`guide ${h.guides[0].id} moved 0.01`, h])
  return out
}
