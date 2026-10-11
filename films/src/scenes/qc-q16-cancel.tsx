/**
 * Film `qc-q16-cancel` (P-Q16-story §10): "Balanced functions cancel the all-zeros bar". Eight signed bars and their dashed mean
 * line as f changes (from 0 everywhere to a balanced f, one string at a time), then the last Hadamards; then the constant f = 1 for
 * contrast. Every height comes from `qc-q16-cancel.data.ts` (the engine). The film states no result: its captions (openers/openerCopy.ts)
 * carry the claims. The only lettering is the stage's name (words, no number).
 */
import { Line, Txt, makeScene2D } from '@motion-canvas/2d'
import { all, createSignal, easeInOutCubic, usePlayback, waitFor } from '@motion-canvas/core'
import { record } from '../manifest'
import { COLORS, FILM_ID, FORMAT, LAYOUT, STAGES, STRINGS, ampOf, barX, yOf } from './qc-q16-cancel.data'

/** frames → seconds at the film's rate */
const sec = (frames: number) => frames / FORMAT.fps

// presentation only (px): not physics
const STYLE = { axisWidth: 3, guideWidth: 2, meanWidth: 5, columnWidth: 3, columnPad: 18, font: 56 } as const

export default makeScene2D(function* (view) {
  const first = STAGES[0]
  const bars = Array.from({ length: STRINGS }, (_, i) => createSignal(first.bars[i]))
  const mean = createSignal(first.mean as number)
  const meanOpacity = createSignal(1)
  const columnOpacity = createSignal(0)
  record('film', FILM_ID)
  record('format', FORMAT)

  // structure: the baseline, the guides at amplitude ±1, and the frame round the all-zeros column (shown with the last Hadamards)
  const baseline = <Line points={[[-LAYOUT.half, yOf(0)], [LAYOUT.half, yOf(0)]]} stroke={COLORS.axis} lineWidth={STYLE.axisWidth} opacity={0.7} />
  const guides = [1, -1].map((a) => (
    <Line points={[[-LAYOUT.half, yOf(a)], [LAYOUT.half, yOf(a)]]} stroke={COLORS.guide} lineWidth={STYLE.guideWidth} lineDash={[4, 10]} opacity={0.9} />
  ))
  const columnHalf = LAYOUT.pitch / 2
  const column = (
    <Line
      points={[
        [barX(0) - columnHalf, yOf(1) - STYLE.columnPad],
        [barX(0) + columnHalf, yOf(1) - STYLE.columnPad],
        [barX(0) + columnHalf, yOf(-1) + STYLE.columnPad],
        [barX(0) - columnHalf, yOf(-1) + STYLE.columnPad],
      ]}
      closed
      stroke={COLORS.column}
      lineWidth={STYLE.columnWidth}
      opacity={columnOpacity}
    />
  )
  const barLines = bars.map((h, i) => (
    <Line
      points={() => [[barX(i), yOf(0)], [barX(i), yOf(h())]]}
      stroke={() => (h() >= 0 ? COLORS.positive : COLORS.negative)}
      lineWidth={LAYOUT.barWidth}
      lineCap="butt"
    />
  )) as Line[]
  const meanLine = (
    <Line points={() => [[-LAYOUT.half, yOf(mean())], [LAYOUT.half, yOf(mean())]]} stroke={COLORS.mean} lineWidth={STYLE.meanWidth} lineDash={[22, 14]} opacity={meanOpacity} />
  ) as Line
  const label = (
    <Txt x={LAYOUT.labelX} y={LAYOUT.labelY} offset={[-1, 0]} fill={COLORS.label} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontWeight={500} fontSize={STYLE.font} text="" />
  ) as Txt
  view.add([...guides, baseline, column, ...barLines, meanLine, label])
  record('layout', { pxPerUnit: LAYOUT.scale, barX: barLines.map((l) => l.parsedPoints()[0].x), barWidth: barLines[0].lineWidth() })

  // what is on screen now, read back from the drawn nodes and converted to engine units
  const drawnBars = () => barLines.map((l) => ampOf(l.parsedPoints()[1].y))
  const drawnMean = () => ampOf(meanLine.parsedPoints()[0].y)

  // Motion Canvas runs a thread's time one frame ahead of the rendered frame once it has waited; a one-frame lead-in
  // puts each stage's start on its planned frame exactly (check_manifest compares the planned and the actual frame)
  const LEAD_IN = 1
  yield* waitFor(sec(LEAD_IN))
  const stages: unknown[] = []
  for (const [k, s] of STAGES.entries()) {
    const startedAt = usePlayback().frame
    label.text(s.label)
    // a query stage shows its own mean: the line slides there with the bars when it is already on screen, and is placed while hidden otherwise
    const slides = s.mean !== null && s.tween > 0 && STAGES[k - 1]?.kind === 'query'
    if (s.mean !== null && !slides) mean(s.mean)
    if (s.tween > 0) {
      const d = sec(s.tween)
      yield* all(
        ...bars.map((h, i) => h(s.bars[i], d, easeInOutCubic)),
        ...(slides ? [mean(s.mean as number, d, easeInOutCubic)] : []),
        meanOpacity(s.kind === 'query' ? 1 : 0, d, easeInOutCubic),
        columnOpacity(s.kind === 'output' ? 1 : 0, d, easeInOutCubic),
      )
    }
    const settledAt = usePlayback().frame
    stages.push({
      id: s.id,
      label: label.text(),
      kind: s.kind,
      table: s.table,
      frames: { from: s.from, tween: s.tween, to: s.to, startedAt, settledAt },
      bars: drawnBars(),
      mean: drawnMean(),
      meanOpacity: meanLine.opacity(),
      columnOpacity: column.opacity(),
    })
    record('stages', stages)
    if (s.id === 'switch-4') record('q16DjMean', drawnMean()) // the balanced f: the dashed line has dropped onto the axis
    if (s.id === 'last-balanced') record('q16DjBalnZero', drawnBars()[0] ** 2) // the all-zeros bar, squared: its chance
    if (s.id === 'last-constant') record('q16DjConstAmp', drawnBars()[0]) // the all-zeros bar of f = 1
    const last = s.id === STAGES.at(-1)!.id
    yield* waitFor(sec(s.to - s.from + 1 - s.tween - (last ? LEAD_IN : 0)))
  }
  record('lastFrame', usePlayback().frame)
})
