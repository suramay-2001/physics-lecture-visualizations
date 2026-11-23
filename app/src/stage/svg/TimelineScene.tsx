/**
 * The `timeline` scene: ONE component for the live stage, the reading version and the print figure. It draws the resolved lanes only (stage/svg/timeline.ts derived each row's end and each
 * schedule's total): a linear time axis from 0 with nice ticks and the unit, one lane per row (its label above, its boxes on a line), each box a rectangle whose fill and one-letter label say
 * its kind (G gate, M move, A acquire, R reset, C classify, D denoise; the letter is drawn only where the box is wide enough), vertical marks, and a small legend of the kinds present. Box
 * edges are the engine's times on the axis; a lane's position and a kind's fill are drawing choices (the passport says so).
 */
import type { TimelineSegmentKind } from '../../content/stage'
import type { SvgSceneProps } from '../svgKinds'
import type { ResolvedTimeline } from '../types'
import { Label, fix } from './draw'
import { timelineReadouts } from './timeline'

export interface TimelineLayout {
  padX: number
  lines: string[]
  x0: number
  x1: number
  laneTop: number
  laneH: number
  axisY: number
}

/** A round step (1, 2, 2.5 or 5 times a power of ten) so that about `target` steps span `range`. */
export function niceStep(range: number, target = 6): number {
  if (!(range > 0) || !Number.isFinite(range)) return 1
  const raw = range / Math.max(1, target)
  const pow = 10 ** Math.floor(Math.log10(raw))
  const m = raw / pow
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * pow
}
export function timelineTicks(span: number, target = 6): number[] {
  const step = niceStep(span, target)
  const out: number[] = []
  for (let k = 0; k * step <= span * 1.0000001; k++) out.push(Number((k * step).toPrecision(12)))
  return out
}

/** Where the lanes go in a drawing box (pure, so a test can check nothing leaves the box or touches the text lines). */
export function timelineLayout(r: ResolvedTimeline, width: number, height: number, own: boolean, slot?: string | null): TimelineLayout {
  const readouts = timelineReadouts(r)
  const lines = own ? readouts.map((x) => x.text) : []
  const padX = own ? 12 : 24
  const paneTop = slot === 'top'
  const paneBottom = slot === 'bottom'
  const top = own ? 8 + 13 * lines.length + (lines.length ? 6 : 0) : paneTop ? Math.max(60, 26 + 17 * readouts.length) : paneBottom ? 34 : Math.max(112, 26 + 17 * readouts.length)
  const bottom = own ? 8 : paneTop ? 14 : 92
  const nKinds = new Set(r.rows.flatMap((row) => row.segments.map((x) => x.kind))).size
  const legendH = 16 * Math.max(1, Math.ceil(nKinds / Math.max(1, Math.floor((width - 2 * padX) / 66)))) + (r.marks.length ? 14 : 0)
  const axisH = 34
  const laneH = Math.max(26, Math.min(44, Math.floor((height - top - bottom - axisH - legendH) / r.rows.length)))
  return { padX, lines, x0: padX, x1: Math.max(padX + 60, width - padX), laneTop: top, laneH, axisY: top + laneH * r.rows.length + 6 }
}

const LETTER: Readonly<Record<TimelineSegmentKind, string>> = { gate: 'G', move: 'M', acquire: 'A', reset: 'R', classify: 'C', denoise: 'D' }
const FILL: Readonly<Record<TimelineSegmentKind, { cls: string; op: number }>> = {
  gate: { cls: 'fg-state-fill', op: 0.85 },
  move: { cls: 'fg-state-fill', op: 0.4 },
  acquire: { cls: 'fg-sil-fill', op: 0.85 },
  reset: { cls: 'fg-sil-fill', op: 0.4 },
  classify: { cls: 'fg-op-fill', op: 0.85 },
  denoise: { cls: 'fg-op-fill', op: 0.45 },
}

export function TimelineScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'timeline'>) {
  const print = mode === 'print'
  const own = print || !!bare
  const L = timelineLayout(r, width, height, own, slot)
  const f = (a: string) => (focus === a ? 'svgk-focus' : undefined)
  const sx = (t: number): number => L.x0 + (Math.max(0, t) / r.span) * (L.x1 - L.x0)
  const ticks = timelineTicks(r.span)
  const kinds = [...new Set(r.rows.flatMap((row) => row.segments.map((s) => s.kind)))]
  const per = Math.max(1, Math.floor((L.x1 - L.x0) / 66))
  const barY = (i: number): number => L.laneTop + i * L.laneH + 14
  const barH = Math.min(22, L.laneH - 18)
  return (
    <g className="svgk-scene" data-kind="timeline">
      {L.lines.map((t, i) => (
        <Label key={i} at={{ x: L.padX, y: 16 + 13 * i }} cls="fg-lbl">
          {t}
        </Label>
      ))}
      {r.marks.map((m, i) => (
        <g key={`m${i}`} data-anchor="mark" className={f('mark')}>
          <title>{`${m.label}: ${fix(m.at, 2)} ${r.unit}`}</title>
          <line x1={sx(m.at)} y1={L.laneTop} x2={sx(m.at)} y2={L.axisY} className="fg-sil" strokeWidth={1} strokeDasharray="3 3" />
          <Label at={{ x: Math.min(sx(m.at) + 3, L.x1 - 4), y: L.axisY + 24 }} anchor={sx(m.at) > L.x1 - 60 ? 'end' : 'start'} cls="fg-lbl">
            {m.label}
          </Label>
        </g>
      ))}
      {r.rows.map((row, i) => (
        <g key={`r${i}`} data-anchor="lane" className={f('lane')} role="img" aria-label={`${row.label}: ${row.segments.length} boxes, ending at ${fix(row.end, 2)} ${r.unit}`}>
          <Label at={{ x: L.x0, y: L.laneTop + i * L.laneH + 10 }} cls="fg-lbl">
            {row.label}
          </Label>
          <line x1={L.x0} y1={barY(i) + barH + 2} x2={L.x1} y2={barY(i) + barH + 2} className="fg-sil3" strokeWidth={0.6} />
          {row.segments.map((s, j) => {
            const x = sx(s.from)
            const w = Math.max(0.8, sx(s.to) - x)
            const fl = FILL[s.kind]
            return (
              <g key={j} data-anchor="box" className={f('box')}>
                <title>{`${s.label ?? s.kind}: ${fix(s.from, 3)} to ${fix(s.to, 3)} ${r.unit}`}</title>
                <rect x={x} y={barY(i)} width={w} height={barH} className={fl.cls} fillOpacity={fl.op} stroke="var(--fg-halo, transparent)" strokeWidth={0.5} />
                {w >= 12 && (
                  <Label at={{ x: x + w / 2, y: barY(i) + barH / 2 + 4 }} anchor="middle" cls="fg-lbl">
                    {s.label ?? LETTER[s.kind]}
                  </Label>
                )}
              </g>
            )
          })}
        </g>
      ))}
      <g data-anchor="total" className={f('total')}>
        <line x1={L.x0} y1={L.axisY} x2={L.x1} y2={L.axisY} className="fg-sil" strokeWidth={1} />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={sx(t)} y1={L.axisY} x2={sx(t)} y2={L.axisY + 4} className="fg-sil" strokeWidth={1} />
            <Label at={{ x: sx(t), y: L.axisY + 15 }} anchor="middle" cls="fg-lbl">
              {fix(t, 3)}
            </Label>
          </g>
        ))}
        <Label at={{ x: L.x1, y: L.axisY + 15 + 12 }} anchor="end" cls="fg-lbl">
          {r.unit}
        </Label>
        {r.schedules.map((s) => (
          <line key={s.name} x1={sx(s.end)} y1={L.laneTop} x2={sx(s.end)} y2={L.axisY} className="fg-op" strokeWidth={1} strokeOpacity={0.6} strokeDasharray="1 3">
            <title>{`${s.name}: ${fix(s.end, 2)} ${r.unit}`}</title>
          </line>
        ))}
      </g>
      <g aria-hidden="true">
        {kinds.map((k, i) => (
          <g key={k} transform={`translate(${L.x0 + (i % per) * 66}, ${L.axisY + 26 + (r.marks.length ? 14 : 0) + 16 * Math.floor(i / per)})`}>
            <rect width={10} height={10} className={FILL[k].cls} fillOpacity={FILL[k].op} />
            <Label at={{ x: 14, y: 9 }} cls="fg-lbl">
              {`${LETTER[k]} ${k}`}
            </Label>
          </g>
        ))}
      </g>
    </g>
  )
}
