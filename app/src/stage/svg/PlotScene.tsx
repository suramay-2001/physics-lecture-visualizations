/**
 * The `plot` scene: ONE component for the live stage ('stage') and the print figure ('print'). It draws the resolved
 * curve only (stage/svg/plot.ts computed every point with the engine): axes, an optional shaded band, reference
 * lines, the curve itself and its markers. Structure is silver; the curve and its markers are the state colour.
 */
import type { SvgSceneProps } from '../svgKinds'
import { Label, type Pt, fix, sup } from './draw'

export function PlotScene({ state: r, mode, width, height, focus, bare }: SvgSceneProps<'plot'>) {
  const print = mode === 'print'
  const own = print || !!bare
  const padTop = own ? 14 : 70
  const padBottom = own ? 28 : 34
  const padL = 34
  const padR = 14
  const x0 = padL
  const x1 = Math.max(x0 + 40, width - padR)
  const y0 = padTop
  const y1 = Math.max(y0 + 40, height - padBottom)
  const { range, yMin, yMax } = r
  const sx = (x: number): number => x0 + ((x - range.from) / (range.to - range.from || 1)) * (x1 - x0)
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
      <Label at={{ x: x0, y: y1 + 16 }} cls="fg-lbl">
        {fix(range.from, 0)}
      </Label>
      <Label at={{ x: x1, y: y1 + 16 }} anchor="end" cls="fg-lbl">
        {fix(range.to, 0)}
      </Label>
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
            {fix(yMax)}
          </Label>
          <Label at={{ x: x0 - 6, y: sy(yMin) + 4 }} anchor="end" cls="fg-lbl">
            {fix(yMin)}
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

      {/* the curve */}
      <path d={path} fill="none" className="fg-state" strokeWidth={2.2} data-anchor="curve" />

      {/* markers on the curve */}
      {r.markers.map((m, i) => {
        const p = at(m)
        return (
          <g key={`m${i}`} data-anchor="marker" className={f('marker') ? 'svgk-focus' : undefined}>
            <circle cx={p.x} cy={p.y} r={4} className="fg-state-fill" />
            {m.label && (
              <Label at={{ x: p.x + 6, y: p.y - 6 }} cls="fg-txt">
                {m.label}
              </Label>
            )}
          </g>
        )
      })}
    </g>
  )
}
