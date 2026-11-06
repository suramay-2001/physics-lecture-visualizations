/**
 * The shared scene of the Physics 709 plot films (see kit.ts): guides, line series revealed stage by stage with a tip dot, bar / tick
 * series that glide between stages, and the stage's name. A film's scene file is one line, `export default filmScene(SPEC)`; its data
 * module owns every number (the engine's). The scene records into the manifest what the NODES drew, converted back to engine units
 * (`pipeline/films/checks/kit.ts` recomputes each one with the engine and fails on a mismatch).
 */
import { Circle, Line, Txt, makeScene2D } from '@motion-canvas/2d'
import { all, createSignal, easeInOutCubic, usePlayback, waitFor } from '@motion-canvas/core'
import type { BarSeries, FilmSpec, LineSeries, Pt, View } from './kit'
import { record } from './manifest'

const toCanvas = (v: View, [u, w]: Pt): [number, number] => [v.ox + v.sx * u, v.oy - v.sy * w]
const toEngine = (v: View, x: number, y: number): [number, number] => [(x - v.ox) / v.sx, (v.oy - y) / v.sy]

// presentation only (px, opacity): not physics
const STYLE = { guideWidth: 3, guideOpacity: 0.85, dash: [22, 14], guideDash: [4, 10], font: 56 } as const

export function filmScene(spec: FilmSpec) {
  const V = (id: string): View => spec.views[id]
  const sec = (frames: number) => frames / spec.format.fps
  const lineSeries = spec.series.filter((s): s is LineSeries => s.kind === 'line')
  const barSeries = spec.series.filter((s): s is BarSeries => s.kind !== 'line')

  return makeScene2D(function* (view) {
    const first = spec.stages[0]
    record('film', spec.id)
    record('format', spec.format)
    record('views', spec.views)

    // a line series is drawn up to a (fractional while it glides) sample index; a bar is a height
    const progress = Object.fromEntries(lineSeries.map((s) => [s.id, createSignal(first.upTo[s.id])]))
    const heights = Object.fromEntries(barSeries.map((s) => [s.id, s.xs.map((_, i) => createSignal(first.heights[s.id][i]))]))
    const prefix = (s: LineSeries, p: number): [number, number][] => {
      const i = Math.min(Math.floor(p), s.pts.length - 1)
      const out = s.pts.slice(0, i + 1)
      const f = p - i
      if (f > 0 && i + 1 < s.pts.length) out.push([s.pts[i][0] + f * (s.pts[i + 1][0] - s.pts[i][0]), s.pts[i][1] + f * (s.pts[i + 1][1] - s.pts[i][1])])
      return out.map((pt) => toCanvas(V(s.view), pt))
    }

    const guideNodes = spec.guides.map((g) => (
      <Line
        points={g.pts.map((p) => toCanvas(V(g.view), p))}
        stroke={spec.colors[g.color]}
        lineWidth={g.width ?? STYLE.guideWidth}
        lineDash={g.dash ? [...STYLE.guideDash] : []}
        opacity={STYLE.guideOpacity}
      />
    )) as Line[]

    const barNodes: Record<string, Line[]> = {}
    for (const s of barSeries) {
      const v = V(s.view)
      barNodes[s.id] = s.xs.map((u, i) => {
        const h = heights[s.id][i]
        const col = () => (h() < 0 && s.negColor ? s.negColor : s.color)
        return s.kind === 'bars' ? (
          <Line points={() => [toCanvas(v, [u, 0]), toCanvas(v, [u, h()])]} stroke={() => spec.colors[col()]} lineWidth={s.width} lineCap="butt" opacity={s.opacity ?? 1} />
        ) : (
          <Line
            points={() => [[toCanvas(v, [u, h()])[0] - (s.length ?? 0) / 2, toCanvas(v, [u, h()])[1]], [toCanvas(v, [u, h()])[0] + (s.length ?? 0) / 2, toCanvas(v, [u, h()])[1]]]}
            stroke={() => spec.colors[col()]}
            lineWidth={s.width}
            lineCap="butt"
            opacity={s.opacity ?? 1}
          />
        )
      }) as Line[]
    }

    const lineNodes: Record<string, Line> = {}
    const tipNodes: Record<string, Circle> = {}
    for (const s of lineSeries) {
      lineNodes[s.id] = (
        <Line points={() => prefix(s, progress[s.id]())} stroke={spec.colors[s.color]} lineWidth={s.width} lineDash={s.dash ? [...STYLE.dash] : []} lineJoin="round" />
      ) as Line
      if (s.tip) tipNodes[s.id] = (<Circle size={2 * s.tip} fill={spec.colors[s.color]} position={() => prefix(s, progress[s.id]()).at(-1)!} />) as Circle
    }
    const label = (
      <Txt x={spec.labelAt.x} y={spec.labelAt.y} offset={[-1, 0]} fill={spec.colors.label} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontWeight={500} fontSize={STYLE.font} text="" />
    ) as Txt
    view.add([...guideNodes, ...Object.values(barNodes).flat(), ...Object.values(lineNodes), ...Object.values(tipNodes), label])

    // what is on screen now, read back from the drawn nodes and converted to engine units
    const lineOf = (s: LineSeries) => lineNodes[s.id].parsedPoints().map((p) => toEngine(V(s.view), p.x, p.y))
    const tipOf = (s: LineSeries) => {
      const p = tipNodes[s.id].position()
      return toEngine(V(s.view), p.x, p.y)
    }
    const barsOf = (s: BarSeries) => barNodes[s.id].map((l) => toEngine(V(s.view), 0, l.parsedPoints()[s.kind === 'bars' ? 1 : 0].y)[1])
    record(
      'guides',
      spec.guides.map((g, i) => ({ id: g.id, view: g.view, pts: guideNodes[i].parsedPoints().map((p) => toEngine(V(g.view), p.x, p.y)) })),
    )

    // one-frame lead-in: each stage's start lands on its planned frame (see qc-q16-cancel.tsx)
    const LEAD_IN = 1
    yield* waitFor(sec(LEAD_IN))
    const stages: unknown[] = []
    for (const s of spec.stages) {
      const startedAt = usePlayback().frame
      label.text(s.label)
      if (s.tween > 0) {
        const d = sec(s.tween)
        yield* all(
          ...lineSeries.map((l) => progress[l.id](s.upTo[l.id], d, easeInOutCubic)),
          ...barSeries.flatMap((b) => heights[b.id].map((h, i) => h(s.heights[b.id][i], d, easeInOutCubic))),
        )
      }
      const settledAt = usePlayback().frame
      stages.push({
        id: s.id,
        label: label.text(),
        kind: s.kind,
        frames: { from: s.from, tween: s.tween, to: s.to, startedAt, settledAt },
        lines: Object.fromEntries(lineSeries.map((l) => [l.id, { count: lineNodes[l.id].parsedPoints().length, last: lineOf(l).at(-1) }])),
        tips: Object.fromEntries(lineSeries.filter((l) => l.tip).map((l) => [l.id, tipOf(l)])),
        bars: Object.fromEntries(barSeries.map((b) => [b.id, barsOf(b)])),
      })
      record('stages', stages)
      for (const k of spec.keys.filter((key) => key.stage === s.id)) {
        if (k.line) record(k.name, tipOf(lineSeries.find((l) => l.id === k.line)!)[k.comp ?? 1])
        else if (k.bars) record(k.name, barsOf(barSeries.find((b) => b.id === k.bars)!)[k.index ?? 0])
      }
      if (s.id === spec.stages.at(-1)!.id) record('lines', Object.fromEntries(lineSeries.map((l) => [l.id, lineOf(l)])))
      const last = s.id === spec.stages.at(-1)!.id
      yield* waitFor(sec(s.to - s.from + 1 - s.tween - (last ? LEAD_IN : 0)))
    }
    record('lastFrame', usePlayback().frame)
  })
}
