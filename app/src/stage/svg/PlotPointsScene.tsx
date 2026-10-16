/**
 * The scatter mode of the `plot` scene (Papers background chapter B2, P-B2-story §9.2 K-P′): points whose x and y the recipe took from the engine, on linear or base-10 log axes,
 * with up to four groups (a mark and a legend entry each), horizontal reference lines, and three kinds of dot: filled (computed by this page's engine), hollow (a reference's number, "as printed"),
 * hollow with a tick (an upper bound, written ≤). Structure is silver; the groups use the four state colours; the print figure uses the same classes (one ink family keeps them apart by shape).
 */
import type { SvgMode } from '../svgKinds'
import type { ResolvedPlot, ResolvedPlotPoints } from '../types'
import { wrapLine } from './CodeScene'
import { Label, fix, sup } from './draw'
import { plotReadouts, xText, yText } from './plot'

const GROUP_CLS = ['fg-state', 'fg-op', 'fg-plus', 'fg-minus'] as const
const GROUP_FILL = ['fg-state-fill', 'fg-op-fill', 'fg-plus-fill', 'fg-minus-fill'] as const

/** The print figure of a scatter: 320 wide; the readout lines above the axes and the legend below. */
export function pointsPrintSize(r: ResolvedPlot): { w: number; h: number } {
  const lines = plotReadouts(r).flatMap((x) => wrapLine(x.text, 50)).length
  return { w: 320, h: Math.max(240, 14 + 13 * lines + 150 + 40) }
}

const decadesOf = (lo: number, hi: number): number[] => {
  const d0 = Math.ceil(Math.log10(lo) - 1e-9)
  const d1 = Math.floor(Math.log10(hi) + 1e-9)
  const step = Math.max(1, Math.ceil((d1 - d0 + 1) / 5))
  const out: number[] = []
  for (let e = d0; e <= d1; e += step) out.push(e)
  return out
}

export function PointsPlot({ r, width, height, own, slot, mode, focus }: { r: ResolvedPlot; width: number; height: number; own: boolean; slot?: string | null; mode: SvgMode; focus?: string | null }) {
  void mode
  const P = r.pointSet as ResolvedPlotPoints
  const readouts = plotReadouts(r)
  const lines = own ? readouts.flatMap((x) => wrapLine(x.text, 50)) : []
  const legendRows = Math.max(1, P.groups.filter(Boolean).length + (P.points.some((p) => p.status !== 'computed') ? 1 : 0))
  const padL = 52
  const padR = 14
  const padTop = own ? 14 + 13 * lines.length + 6 : Math.max(70, 40 + 20 * readouts.length)
  // live, whole stage: the legend (15 px a row, from 44 px under the axis) must end above the caption box (about 70 px from the bottom edge), so the plot gives it room
  const padBottom = own ? 30 + 15 * legendRows : slot === 'top' ? 36 : slot === 'bottom' ? 104 : 106 + 15 * legendRows
  const x0 = padL
  const x1 = Math.max(x0 + 40, width - padR)
  const y0 = padTop
  const y1 = Math.max(y0 + 40, height - padBottom)
  const logX = P.xScale === 'log'
  const logY = P.yScale === 'log'
  const tx = (x: number): number => (logX ? Math.log10(Math.max(x, 1e-300)) : x)
  const ty = (y: number): number => (logY ? Math.log10(Math.max(y, 1e-300)) : y)
  const sx = (x: number): number => x0 + ((tx(x) - tx(P.xMin)) / (tx(P.xMax) - tx(P.xMin) || 1)) * (x1 - x0)
  const sy = (y: number): number => y1 - ((ty(y) - ty(P.yMin)) / (ty(P.yMax) - ty(P.yMin) || 1)) * (y1 - y0)
  const xTicks = logX ? decadesOf(P.xMin, P.xMax).map((e) => ({ v: 10 ** e, text: e === 0 ? '1' : `10${sup(e)}` })) : [{ v: P.xMin, text: xText(P.xMin) }, { v: P.xMax, text: xText(P.xMax) }]
  const yTicks = logY ? decadesOf(P.yMin, P.yMax).map((e) => ({ v: 10 ** e, text: e === 0 ? '1' : `10${sup(e)}` })) : [{ v: P.yMin, text: yText(P.yMin) }, { v: P.yMax, text: yText(P.yMax) }]
  const groupIndex = (g: string): number => Math.max(0, P.groups.indexOf(g)) % GROUP_CLS.length
  const labelSide = (i: number, px: number): { dx: number; anchor: 'start' | 'end' } => (px + 8 + (P.points[i].label?.length ?? 0) * 6.4 > width - 4 ? { dx: -8, anchor: 'end' } : { dx: 8, anchor: 'start' })
  return (
    <g className="svgk-scene" data-kind="plot" data-mode="points">
      <line x1={x0} y1={y0} x2={x0} y2={y1} className="fg-sil2" strokeWidth={1.2} />
      <line x1={x0} y1={y1} x2={x1} y2={y1} className="fg-sil2" strokeWidth={1.2} />
      {xTicks.map((t, i) => (
        <g key={`xt${i}`}>
          <line x1={sx(t.v)} y1={y1} x2={sx(t.v)} y2={y1 + 3} className="fg-sil2" strokeWidth={1} />
          <Label at={{ x: sx(t.v), y: y1 + 15 }} anchor="middle" cls="fg-lbl">
            {t.text}
          </Label>
        </g>
      ))}
      {yTicks.map((t, i) => (
        <g key={`yt${i}`}>
          <line x1={x0 - 3} y1={sy(t.v)} x2={x0} y2={sy(t.v)} className="fg-sil2" strokeWidth={1} />
          <Label at={{ x: x0 - 6, y: sy(t.v) + 4 }} anchor="end" cls="fg-lbl">
            {t.text}
          </Label>
        </g>
      ))}
      {P.xLabel && (
        <Label at={{ x: (x0 + x1) / 2, y: y1 + 30 }} anchor="middle" cls="fg-lbl">
          {P.xLabel}
        </Label>
      )}
      {P.yLabel && (
        <Label at={{ x: x0 + 4, y: y0 - 4 }} cls="fg-lbl">
          {P.yLabel}
        </Label>
      )}
      <g data-anchor="reference">
        {P.yLines.map((l, i) => (
          <g key={`yl${i}`}>
            <line x1={x0} y1={sy(l.y)} x2={x1} y2={sy(l.y)} className="fg-sil" strokeWidth={1} strokeDasharray="5 4" />
            {l.label && (
              <Label at={{ x: x1 - 4, y: sy(l.y) - 4 }} anchor="end" cls="fg-lbl">
                {l.label}
              </Label>
            )}
          </g>
        ))}
      </g>
      <g data-anchor="points" className={focus === 'points' ? 'svgk-focus' : undefined}>
        {P.points.map((p, i) => {
          const gx = groupIndex(p.group)
          const px = sx(p.x)
          const py = sy(p.y)
          const side = labelSide(i, px)
          const hollow = p.status !== 'computed'
          return (
            <g key={i} role="img" aria-label={`${p.label ?? 'point'}: ${xText(p.x)}, ${yText(p.y)}${p.status === 'reported' ? ', as printed' : p.status === 'bound' ? ', an upper bound' : ''}`} data-status={p.status}>
              <title>{`${p.label ?? 'point'}: x = ${xText(p.x)}, y = ${yText(p.y)}${p.status === 'reported' ? ' (as printed)' : p.status === 'bound' ? ' (upper bound)' : ''}`}</title>
              {hollow ? <circle cx={px} cy={py} r={4.6} fill="var(--fg-halo, transparent)" className={GROUP_CLS[gx]} strokeWidth={1.8} /> : <circle cx={px} cy={py} r={4.4} className={GROUP_FILL[gx]} />}
              {p.status === 'bound' && <path d={`M${fix(px, 1)},${fix(py - 7, 1)} l-3,4 m3,-4 l3,4`} fill="none" className={GROUP_CLS[gx]} strokeWidth={1.4} />}
              {p.label && (
                <Label at={{ x: px + side.dx, y: py + (i % 2 ? 14 : -7) }} anchor={side.anchor} cls="fg-lbl">
                  {p.label}
                </Label>
              )}
            </g>
          )
        })}
      </g>
      {lines.map((t, i) => (
        <Label key={`rl${i}`} at={{ x: 8, y: 14 + 13 * i }} cls="fg-txt">
          {t}
        </Label>
      ))}
      <g data-legend="plot">
        {P.groups.filter(Boolean).map((g, i) => {
          const ly = y1 + 44 + 15 * i
          return (
            <g key={g}>
              <circle cx={x0 + 6} cy={ly - 4} r={4.2} className={GROUP_FILL[i % GROUP_FILL.length]} />
              <Label at={{ x: x0 + 18, y: ly }} cls="fg-lbl">
                {g}
              </Label>
            </g>
          )
        })}
        {P.points.some((p) => p.status !== 'computed') && (
          <g>
            <circle cx={x0 + 6} cy={y1 + 44 + 15 * P.groups.filter(Boolean).length - 4} r={4.2} fill="var(--fg-halo, transparent)" className="fg-state" strokeWidth={1.6} />
            <Label at={{ x: x0 + 18, y: y1 + 44 + 15 * P.groups.filter(Boolean).length }} cls="fg-lbl">
              as printed in the reference
            </Label>
          </g>
        )}
      </g>
    </g>
  )
}
