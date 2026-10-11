/**
 * Film `qc-q17-mean` (P-Q17-story §10): "Inversion about the mean, one step at a time". Eight amplitude bars and their dashed mean
 * line through two Grover steps: a mark (the marked bar flips below the axis, the mean line drops), an inversion about the mean
 * (each bar lands as far on the other side of the mean line as it was; the line does not move), again, and then the chance of
 * the marked string as a column on the right. Every height comes from `qc-q17-mean.data.ts` (the engine). The film states no
 * result: its captions (openers/openerCopy.ts) carry the claims. The only lettering is the stage's name (words, no number).
 */
import { Line, Txt, makeScene2D } from '@motion-canvas/2d'
import { all, createSignal, easeInOutCubic, usePlayback, waitFor } from '@motion-canvas/core'
import { record } from '../manifest'
import { COLORS, FILM_ID, FORMAT, LAYOUT, MARKED, STAGES, STRINGS, ampOf, barX, yOf } from './qc-q17-mean.data'

/** frames → seconds at the film's rate */
const sec = (frames: number) => frames / FORMAT.fps

// presentation only (px, opacity): not physics
const STYLE = { axisWidth: 3, guideWidth: 2, meanWidth: 5, linkWidth: 4, linkOpacity: 0.85, arrow: 14, tick: 40, font: 56, smallFont: 38 } as const

export default makeScene2D(function* (view) {
  const first = STAGES[0]
  const bars = Array.from({ length: STRINGS }, (_, i) => createSignal(first.bars[i]))
  const mean = createSignal(first.mean)
  const chance = createSignal(0)
  const linkFrom = Array.from({ length: STRINGS }, () => createSignal(0))
  const linkTo = Array.from({ length: STRINGS }, () => createSignal(0))
  const linkOpacity = createSignal(0)
  const chanceOpacity = createSignal(0)
  record('film', FILM_ID)
  record('format', FORMAT)

  // structure: the baseline (under the bars and the chance column), and the guides at amplitude ±1
  const baseline = <Line points={[[-LAYOUT.half, yOf(0)], [LAYOUT.chanceX + LAYOUT.chanceWidth, yOf(0)]]} stroke={COLORS.axis} lineWidth={STYLE.axisWidth} opacity={0.7} />
  const guides = [1, -1].map((a) => (
    <Line points={[[-LAYOUT.half, yOf(a)], [LAYOUT.half, yOf(a)]]} stroke={COLORS.guide} lineWidth={STYLE.guideWidth} lineDash={[4, 10]} opacity={0.9} />
  ))
  const chanceGuide = (
    <Line
      points={[[LAYOUT.chanceX - STYLE.tick, yOf(1)], [LAYOUT.chanceX + STYLE.tick, yOf(1)]]}
      stroke={COLORS.guide}
      lineWidth={STYLE.guideWidth}
      lineDash={[4, 10]}
      opacity={chanceOpacity}
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
  const chanceLine = (
    <Line points={() => [[LAYOUT.chanceX, yOf(0)], [LAYOUT.chanceX, yOf(chance())]]} stroke={COLORS.chance} lineWidth={LAYOUT.chanceWidth} lineCap="butt" opacity={chanceOpacity} />
  ) as Line
  // an inversion's links: from each bar's old top to its new top, right of the bar; the mean line crosses each at its middle
  const linkLines = linkFrom.map((from, i) => (
    <Line
      points={() => [[barX(i) + LAYOUT.linkOffset, yOf(from())], [barX(i) + LAYOUT.linkOffset, yOf(linkTo[i]())]]}
      stroke={COLORS.link}
      lineWidth={STYLE.linkWidth}
      endArrow
      arrowSize={STYLE.arrow}
      opacity={linkOpacity}
    />
  )) as Line[]
  const meanLine = (
    <Line points={() => [[-LAYOUT.half, yOf(mean())], [LAYOUT.half, yOf(mean())]]} stroke={COLORS.mean} lineWidth={STYLE.meanWidth} lineDash={[22, 14]} />
  ) as Line
  const label = (
    <Txt x={LAYOUT.labelX} y={LAYOUT.labelY} offset={[-1, 0]} fill={COLORS.label} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontWeight={500} fontSize={STYLE.font} text="" />
  ) as Txt
  const chanceLabel = (
    <Txt x={LAYOUT.chanceX} y={yOf(0) + 54} fill={COLORS.label} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontWeight={500} fontSize={STYLE.smallFont} text="chance" opacity={chanceOpacity} />
  )
  view.add([...guides, baseline, chanceGuide, ...barLines, chanceLine, ...linkLines, meanLine, label, chanceLabel])
  record('layout', { pxPerUnit: LAYOUT.scale, barX: barLines.map((l) => l.parsedPoints()[0].x), barWidth: barLines[0].lineWidth(), marked: MARKED })

  // what is on screen now, read back from the drawn nodes and converted to engine units
  const drawnBars = () => barLines.map((l) => ampOf(l.parsedPoints()[1].y))
  const drawnMean = () => ampOf(meanLine.parsedPoints()[0].y)
  const drawnChance = () => ampOf(chanceLine.parsedPoints()[1].y)
  const drawnLinks = () => linkLines.map((l) => ({ from: ampOf(l.parsedPoints()[0].y), to: ampOf(l.parsedPoints()[1].y) }))

  // one-frame lead-in: each stage's start lands on its planned frame (see qc-q16-cancel.tsx)
  const LEAD_IN = 1
  yield* waitFor(sec(LEAD_IN))
  const stages: unknown[] = []
  for (const s of STAGES) {
    const startedAt = usePlayback().frame
    label.text(s.label)
    if (s.links) {
      // placed while the links are invisible: they fade in as the bars start to move
      s.links.from.forEach((a, i) => linkFrom[i](a))
      s.links.to.forEach((a, i) => linkTo[i](a))
    }
    if (s.tween > 0) {
      const d = sec(s.tween)
      yield* all(
        ...bars.map((h, i) => h(s.bars[i], d, easeInOutCubic)),
        mean(s.mean, d, easeInOutCubic),
        chance(s.chance, d, easeInOutCubic),
        linkOpacity(s.links ? STYLE.linkOpacity : 0, d, easeInOutCubic),
        chanceOpacity(s.kind === 'chance' ? 1 : 0, d, easeInOutCubic),
      )
    }
    const settledAt = usePlayback().frame
    stages.push({
      id: s.id,
      label: label.text(),
      kind: s.kind,
      frames: { from: s.from, tween: s.tween, to: s.to, startedAt, settledAt },
      bars: drawnBars(),
      mean: drawnMean(),
      chance: drawnChance(),
      links: s.links ? drawnLinks() : null,
      linkOpacity: linkLines[0].opacity(),
      chanceOpacity: chanceLine.opacity(),
    })
    record('stages', stages)
    if (s.id === 'mark-1') record('q17MeanAfterOracle', drawnMean()) // the mean line after the first mark
    if (s.id === 'invert-1') {
      record('q17InvUnmarked', drawnBars()[0]) // string 000, an unmarked bar, after the first inversion
      record('q17InvMarked', drawnBars()[MARKED]) // the marked bar after the first inversion
    }
    if (s.id === 'chance') record('q17P2', drawnChance()) // the chance column after two steps
    const last = s.id === STAGES.at(-1)!.id
    yield* waitFor(sec(s.to - s.from + 1 - s.tween - (last ? LEAD_IN : 0)))
  }
  record('lastFrame', usePlayback().frame)
})
