/**
 * Film `qc-f1-euler-limit`, first pass (P-F1-story §10.2): the polygons (1 + iπ/n)^k, k = 0 … n, for
 * n = 1, 2, 4, 8, 16, 64, each drawn from 1 and ending at (1 + iπ/n)^n; the end points close in on e^{iπ} = −1.
 * Every coordinate comes from `f1-euler-limit.data.ts` (the engine). The film states no result: its captions
 * (course pack, later) carry the claims. Labels are minimal: the current n only.
 */
import { Circle, Line, Txt, makeScene2D } from '@motion-canvas/2d'
import { all, easeInOutCubic, easeOutCubic, usePlayback, waitFor } from '@motion-canvas/core'
import { record } from '../manifest'
import { COLORS, FILM_ID, FORMAT, LAYOUT, PHI, STAGES, TARGET, TIMING, UNIT_CIRCLE, fromPx, landingFrames, toPx } from './f1-euler-limit.data'

/** frames → seconds at the film's rate */
const sec = (frames: number) => frames / FORMAT.fps
/** a drawn position read back into engine units, as [re, im] */
const back = (x: number, y: number): [number, number] => {
  const z = fromPx(x, y)
  return [z.re, z.im]
}

// presentation only (px, opacity): not physics
const STYLE = {
  axisWidth: 2,
  circleWidth: 3,
  pathWidth: 5,
  pastWidth: 3,
  pastOpacity: 0.28,
  fadedOpacity: 0.14,
  tip: 18,
  pastTip: 10,
  target: 30,
  targetWidth: 3,
  targetLanded: 5,
  font: 56,
} as const

export default makeScene2D(function* (view) {
  const W = FORMAT.width
  const H = FORMAT.height
  const [ox, oy] = toPx({ re: 0, im: 0 })
  record('film', FILM_ID)
  record('phi', PHI)
  record('format', FORMAT)

  // structure: axes, unit circle, the hollow target e^{iφ}
  const realAxis = <Line points={[[-W / 2, oy], [W / 2, oy]]} stroke={COLORS.axis} lineWidth={STYLE.axisWidth} opacity={0.55} />
  const imagAxis = <Line points={[[ox, LAYOUT.labelY + STYLE.font], [ox, H / 2]]} stroke={COLORS.axis} lineWidth={STYLE.axisWidth} opacity={0.55} />
  const circle = (<Line points={UNIT_CIRCLE.map(toPx)} closed stroke={COLORS.circle} lineWidth={STYLE.circleWidth} />) as Line
  const [tx, ty] = toPx(TARGET)
  const target = (<Circle x={tx} y={ty} size={STYLE.target} stroke={COLORS.target} lineWidth={STYLE.targetWidth} />) as Circle
  const label = (
    <Txt
      x={LAYOUT.labelX}
      y={LAYOUT.labelY}
      offset={[-1, 0]}
      fill={COLORS.label}
      fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
      fontWeight={500}
      fontSize={STYLE.font}
      text=""
    />
  ) as Txt
  view.add([realAxis, imagAxis, circle, target, label])
  record('unitCircle', circle.parsedPoints().map((p) => back(p.x, p.y)))
  record('pxPerUnit', LAYOUT.scale)
  record('target', back(target.x(), target.y()))

  const drawn: { line: Line; tip: Circle }[] = []
  const stages: unknown[] = []
  // Motion Canvas runs a thread's time one frame ahead of the rendered frame once it has waited; a one-frame lead-in
  // puts stage k's start on frame k · stageFrames exactly (check_manifest compares the planned and the actual frame)
  const LEAD_IN = 1
  yield* waitFor(sec(LEAD_IN))
  for (const s of STAGES) {
    const line = new Line({
      points: s.path.map(toPx),
      stroke: COLORS.path,
      lineWidth: STYLE.pathWidth,
      lineJoin: 'round',
      lineCap: 'round',
      end: 0,
    })
    const tip = new Circle({ size: STYLE.tip, fill: COLORS.path, position: () => line.getPointAtPercentage(line.end()).position })
    view.add([line, tip])
    label.text(`n = ${s.n}`)
    const startFrame = usePlayback().frame

    const past = drawn.at(-1)
    yield* all(
      line.end(1, sec(TIMING.draw), easeInOutCubic),
      ...(past
        ? [past.line.opacity(STYLE.pastOpacity, sec(TIMING.draw)), past.line.lineWidth(STYLE.pastWidth, sec(TIMING.draw)), past.tip.size(STYLE.pastTip, sec(TIMING.draw)), past.tip.opacity(STYLE.pastOpacity, sec(TIMING.draw))]
        : []),
    )
    drawn.push({ line, tip })
    // what is on screen now: the polygon's corners and the end dot, read back from the nodes
    stages.push({
      n: s.n,
      label: label.text(),
      frames: { from: s.from, to: s.to, startedAt: startFrame },
      corners: line.parsedPoints().map((p) => back(p.x, p.y)),
      end: back(tip.position().x, tip.position().y),
    })
    record('stages', stages)
    yield* waitFor(sec(TIMING.hold))
  }

  // landing: the older polygons fade further; the n = 64 path and its end dot stay; the target ring (structure,
  // silver) thickens as the eye settles on it. Near-white stays the path's alone.
  const half = sec(landingFrames / 2)
  record('landing', { startedAt: usePlayback().frame, frames: landingFrames })
  yield* all(
    ...drawn.slice(0, -1).flatMap((d) => [d.line.opacity(STYLE.fadedOpacity, half), d.tip.opacity(STYLE.fadedOpacity, half)]),
    target.lineWidth(STYLE.targetLanded, half, easeOutCubic),
  )
  yield* waitFor(sec(landingFrames - LEAD_IN) - half)
  record('lastFrame', usePlayback().frame)
})
