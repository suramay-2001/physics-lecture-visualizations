/**
 * The `plot` scene: ONE component for the live stage ('stage') and the print figure ('print'). It draws the resolved
 * curve only (stage/svg/plot.ts computed every point with the engine): axes, an optional shaded band, reference
 * lines, the curve itself and its markers. Structure is silver; the curve and its markers are the state colour.
 */
import type { SvgSceneProps } from '../svgKinds'
import { wrapLine } from './CodeScene'
import { Label, type Pt, fix, sup } from './draw'
import { plotReadouts, xText } from './plot'
import { PointsPlot, pointsPrintSize } from './PlotPointsScene'

/** Six looks for six series: a colour class and a dash, so the print figure (one ink family) keeps them apart too. */
export const SERIES_STYLE: readonly { cls: string; dash?: string }[] = [
  { cls: 'fg-state' },
  { cls: 'fg-op', dash: '6 4' },
  { cls: 'fg-plus' },
  { cls: 'fg-minus', dash: '6 4' },
  { cls: 'fg-sil', dash: '2 3' },
  { cls: 'fg-op', dash: '2 3' },
]
/** The legend's rows (two columns) and their height. */
export const legendRows = (r: { series?: { label: string }[] | null; reportedMarks?: unknown[] }, availW: number): number => Math.ceil(((r.series?.length ?? 0) + (r.reportedMarks?.length ? 1 : 0)) / legendCols(r, availW))
/** One column of legend entries when the labels are too long for two side by side in the plot's width. */
export const legendCols = (r: { series?: { label: string }[] | null }, availW: number): 1 | 2 => ((Math.max(0, ...(r.series ?? []).map((s) => s.label.length)) * 6.3 + 30) * 2 > availW ? 1 : 2)

/** An end label of the linear y axis: the older curves keep three decimals; the cost curves (compact = true) show a rounded number that fits the margin. */
function axisText(y: number, compact: boolean): string {
  if (!compact) return fix(y)
  return fix(y, Math.abs(y) >= 100 ? 0 : Math.abs(y) >= 10 ? 1 : 2)
}

/** Does a log x axis hold a whole power of ten (so it is labelled by decades, a row lower than the plain ends)? */
const hasDecades = (r: { xScale?: 'linear' | 'log'; range: { from: number; to: number } }): boolean => r.xScale === 'log' && Math.ceil(Math.log10(r.range.from) - 1e-9) <= Math.floor(Math.log10(r.range.to) + 1e-9)

/** The print figure of a plot: 320 × 220 for a named curve; a series figure is taller, for its value table above the axes and its legend under them (the plot keeps at least 130 px). */
export function plotPrintSize(r: Parameters<typeof plotReadouts>[0]): { w: number; h: number } {
  if (r.pointSet) return pointsPrintSize(r)
  if (!r.series) return { w: 320, h: 220 }
  const lines = plotReadouts(r).flatMap((x) => wrapLine(x.text, 50)).length
  const availW = 320 - 14 - 52
  const top = 14 + 13 * lines
  const bottom = 28 + 15 * legendRows(r, availW) + 8 + (hasDecades(r) ? 14 : 0)
  return { w: 320, h: Math.max(220, top + 130 + bottom) }
}

export function PlotScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'plot'>) {
  const print = mode === 'print'
  const own = print || !!bare
  if (r.pointSet) return <PointsPlot r={r} width={width} height={height} own={own} slot={slot} mode={mode} focus={focus} />
  const series = r.series ?? null
  // series mode (B1): the figure writes its value table as text lines; the legend takes rows under the axis
  const lines = series && own ? plotReadouts(r).flatMap((x) => wrapLine(x.text, 50)) : []
  const padL0 = series ? 52 : 0
  const availW = Math.max(40, width - 14 - padL0)
  const legendH = series ? 15 * legendRows(r, availW) + 8 + (hasDecades(r) ? 14 : 0) : 0
  const cols = series ? legendCols(r, availW) : 2
  // the cost curves of Chapter F7 (those with an x-axis name) keep the room the live stage's readout column and caption take, so no axis
  // tick, curve end or marker hides behind them; the older curves keep their layout
  const padTop = own ? (series ? 14 + 13 * lines.length : 14) : r.xLabel ? Math.max(70, 40 + 20 * plotReadouts(r).length) : 70
  const padBottom = (own ? 28 : slot === 'top' ? 34 : r.xLabel ? 104 : 34) + legendH
  const padL = series ? 52 : r.xLabel ? 46 : 34
  const padR = 14
  const x0 = padL
  const x1 = Math.max(x0 + 40, width - padR)
  const y0 = padTop
  const y1 = Math.max(y0 + 40, height - padBottom)
  const { range, yMin, yMax } = r
  const xd = r.xDigits ?? 0
  const logX = r.xScale === 'log'
  const lx = (x: number): number => (logX ? Math.log10(Math.max(x, 1e-300)) : x)
  const sx = (x: number): number => x0 + ((lx(x) - lx(range.from)) / (lx(range.to) - lx(range.from) || 1)) * (x1 - x0)
  const xLabelText = (x: number): string => (series ? xText(x) : fix(x, xd))
  // a log x axis is labelled by decades
  const xDecades: number[] = []
  if (logX) {
    const d0 = Math.ceil(lx(range.from) - 1e-9)
    const d1 = Math.floor(lx(range.to) + 1e-9)
    const step = Math.max(1, Math.ceil((d1 - d0 + 1) / 5))
    for (let e = d0; e <= d1; e += step) xDecades.push(e)
  }
  const log = r.yScale === 'log'
  const lg = (y: number): number => (log ? Math.log10(Math.max(y, 1e-300)) : y)
  const sy = (y: number): number => y1 - ((lg(y) - lg(yMin)) / (lg(yMax) - lg(yMin) || 1)) * (y1 - y0)
  // a log axis is labelled by decades (every `step` of them, so at most about five labels)
  const decades: number[] = []
  if (log) {
    const d0 = Math.ceil(lg(yMin) - 1e-9)
    const d1 = Math.floor(lg(yMax) + 1e-9)
    const step = Math.max(1, Math.ceil((d1 - d0 + 1) / 5))
    for (let e = d1; e >= d0; e -= step) decades.push(e)
  }
  const at = (p: { x: number; y: number }): Pt => ({ x: sx(p.x), y: sy(p.y) })
  const f = (a: string) => focus === a

  const path = r.points.map((p, k) => `${k ? 'L' : 'M'}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`).join(' ')

  return (
    <g className="svgk-scene" data-kind="plot">
      {/* a shaded y-region, e.g. the classical bound */}
      {r.bands.map((b, i) => {
        const yTop = sy(Math.max(b.yFrom, b.yTo))
        const yBottom = sy(Math.min(b.yFrom, b.yTo))
        return (
          <g key={`b${i}`} data-anchor="band" className={f('band') ? 'svgk-focus' : undefined}>
            <rect x={x0} y={yTop} width={x1 - x0} height={Math.max(0, yBottom - yTop)} className="fg-sil-fill" fillOpacity={0.18} />
            {b.label && (
              <Label at={{ x: x1 - 4, y: yTop - 4 }} anchor="end" cls="fg-lbl">
                {b.label}
              </Label>
            )}
          </g>
        )
      })}

      {/* axes box */}
      <line x1={x0} y1={y0} x2={x0} y2={y1} className="fg-sil2" strokeWidth={1.2} />
      <line x1={x0} y1={y1} x2={x1} y2={y1} className="fg-sil2" strokeWidth={1.2} />
      {logX && xDecades.length > 0 ? (
        xDecades.map((e) => (
          <g key={`xd${e}`}>
            <line x1={sx(10 ** e)} y1={y1} x2={sx(10 ** e)} y2={y1 + 3} className="fg-sil2" strokeWidth={1} />
            <Label at={{ x: sx(10 ** e), y: y1 + 16 }} anchor="middle" cls="fg-lbl">
              {e === 0 ? '1' : `10${sup(e)}`}
            </Label>
          </g>
        ))
      ) : (
        <>
          <Label at={{ x: x0, y: y1 + 16 }} cls="fg-lbl">
            {xLabelText(range.from)}
          </Label>
          <Label at={{ x: x1, y: y1 + 16 }} anchor="end" cls="fg-lbl">
            {xLabelText(range.to)}
          </Label>
        </>
      )}
      {r.xLabel && (
        <Label at={{ x: (x0 + x1) / 2, y: y1 + (logX && xDecades.length > 0 ? 30 : 16) }} anchor="middle" cls="fg-lbl">
          {r.xLabel}
        </Label>
      )}
      {log ? (
        decades.map((e) => (
          <g key={`dec${e}`}>
            <line x1={x0 - 3} y1={sy(10 ** e)} x2={x0} y2={sy(10 ** e)} className="fg-sil2" strokeWidth={1} />
            <Label at={{ x: x0 - 6, y: sy(10 ** e) + 4 }} anchor="end" cls="fg-lbl">
              {e === 0 ? '1' : `10${sup(e)}`}
            </Label>
          </g>
        ))
      ) : (
        <>
          <Label at={{ x: x0 - 6, y: sy(yMax) + 4 }} anchor="end" cls="fg-lbl">
            {axisText(yMax, !!r.xLabel)}
          </Label>
          <Label at={{ x: x0 - 6, y: sy(yMin) + 4 }} anchor="end" cls="fg-lbl">
            {axisText(yMin, !!r.xLabel)}
          </Label>
        </>
      )}

      {/* reference lines, e.g. the classical bound, Tsirelson's bound */}
      {r.yLines.map((l, i) => (
        <g key={`y${i}`} data-anchor="y-line" className={f('y-line') ? 'svgk-focus' : undefined}>
          <line x1={x0} y1={sy(l.y)} x2={x1} y2={sy(l.y)} className="fg-sil" strokeDasharray="4 4" strokeWidth={1.2} />
          {l.label && (
            <Label at={{ x: x1 - 4, y: sy(l.y) - 4 }} anchor="end" cls="fg-lbl">
              {l.label}
            </Label>
          )}
        </g>
      ))}

      {/* the curve, and the second curve beside it when there is one (dashed, in the operation colour), each named at its right end */}
      {!series && <path d={path} fill="none" className="fg-state" strokeWidth={2.2} data-anchor="curve" />}
      {series &&
        series.map((sr, i) => {
          const st = SERIES_STYLE[i % SERIES_STYLE.length]
          const d = sr.points.map((p, k) => `${k ? 'L' : 'M'}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`).join(' ')
          return (
            <g key={`s${i}`} data-anchor="series" data-series={i} role="img" aria-label={`${sr.label}: ${sr.points.length} points from ${xText(sr.points[0].x)} to ${xText(sr.points[sr.points.length - 1].x)}`} className={f('series') ? 'svgk-focus' : undefined}>
              <title>{sr.label}</title>
              <path d={d} fill="none" className={st.cls} strokeWidth={2.2} strokeDasharray={st.dash} strokeLinejoin="round" />
              {sr.discrete && sr.points.map((p, k) => <circle key={k} cx={sx(p.x)} cy={sy(p.y)} r={3} className={`${st.cls}-fill`} />)}
            </g>
          )
        })}
      {/* B1: vertical marks printed in a paper: hollow, because they are as printed, not computed here */}
      {(r.reportedMarks ?? []).map((m, i) => {
        const px = sx(m.x)
        const right = px + 8 + m.label.length * 6.4 > width - 4
        return (
          <g key={`rm${i}`} data-anchor="reported" role="img" aria-label={`as printed: ${m.label} at ${xText(m.x)} (${m.source})`} className={f('reported') ? 'svgk-focus' : undefined}>
            <title>{`as printed: ${m.label} (${m.source})`}</title>
            <line x1={px} y1={y0} x2={px} y2={y1} className="fg-sil" strokeWidth={1} strokeDasharray="2 3" />
            <circle cx={px} cy={y0 + 5} r={4.5} fill="var(--fg-halo, transparent)" className="fg-state" strokeWidth={1.8} />
            <Label at={{ x: px + (right ? -8 : 8), y: y0 + 9 + 12 * (i % 2) }} anchor={right ? 'end' : 'start'} cls="fg-lbl">
              {m.label}
            </Label>
          </g>
        )
      })}
      {r.vs && r.names && (
        <g data-anchor="curve-vs">
          <path d={r.vs.points.map((p, k) => `${k ? 'L' : 'M'}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`).join(' ')} fill="none" className="fg-op" strokeWidth={2.2} strokeDasharray="6 4" />
          <Label at={{ x: x1 - 4, y: sy(r.vs.points[r.vs.points.length - 1].y) - 6 }} anchor="end" cls="fg-lbl" color="var(--fg-op)">
            {r.names.vs}
          </Label>
          <Label at={{ x: x1 - 4, y: sy(r.points[r.points.length - 1].y) - 6 }} anchor="end" cls="fg-lbl">
            {r.names.fn}
          </Label>
        </g>
      )}

      {/* markers on the curve */}
      {r.markers.map((m, i) => {
        const p = at(m)
        // a label that would sit on the previous marker's label goes below its marker instead
        const near = i > 0 && Math.abs(p.x - at(r.markers[i - 1]).x) < 52
        return (
          <g key={`m${i}`} data-anchor="marker" className={f('marker') ? 'svgk-focus' : undefined}>
            <circle cx={p.x} cy={p.y} r={4} className="fg-state-fill" />
            {m.yVs !== null && <circle cx={p.x} cy={sy(m.yVs)} r={4} className="fg-op-fill" />}
            {m.label && (
              // a label that would run off the right edge goes to the left of its marker
              <Label at={{ x: p.x + (p.x + 6 + m.label.length * 7.4 > width - 4 ? -6 : 6), y: near ? p.y + 16 : p.y - 6 }} anchor={p.x + 6 + m.label.length * 7.4 > width - 4 ? 'end' : 'start'} cls="fg-txt">
                {m.label}
              </Label>
            )}
          </g>
        )
      })}
      {lines.map((t, i) => (
        <Label key={`rl${i}`} at={{ x: 8, y: 14 + 13 * i }} cls="fg-txt">
          {t}
        </Label>
      ))}
      {series && (
        <g data-legend="plot">
          {series.map((sr, i) => {
            const st = SERIES_STYLE[i % SERIES_STYLE.length]
            const col = i % cols
            const row = Math.floor(i / cols)
            const lx0 = x0 + col * ((x1 - x0) / 2)
            const ly = y1 + (logX && xDecades.length > 0 ? 44 : 30) + 15 * row
            return (
              <g key={i}>
                <line x1={lx0} y1={ly - 4} x2={lx0 + 18} y2={ly - 4} className={st.cls} strokeWidth={2.2} strokeDasharray={st.dash} />
                <Label at={{ x: lx0 + 23, y: ly }} cls="fg-lbl">
                  {sr.label}
                </Label>
              </g>
            )
          })}
          {(r.reportedMarks?.length ?? 0) > 0 &&
            (() => {
              const i = series.length
              const col = i % cols
              const row = Math.floor(i / cols)
              const lx0 = x0 + col * ((x1 - x0) / 2)
              const ly = y1 + (logX && xDecades.length > 0 ? 44 : 30) + 15 * row
              return (
                <g>
                  <circle cx={lx0 + 9} cy={ly - 4} r={4.2} fill="var(--fg-halo, transparent)" className="fg-state" strokeWidth={1.6} />
                  <Label at={{ x: lx0 + 23, y: ly }} cls="fg-lbl">
                    as printed
                  </Label>
                </g>
              )
            })()}
        </g>
      )}
    </g>
  )
}
