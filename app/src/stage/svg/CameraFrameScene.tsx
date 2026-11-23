/**
 * The `camera-frame` scene: ONE component for the live stage, the reading version and the print figure. It draws the resolved frame only (stage/svg/cameraFrame.ts took every grey level
 * from physics/optics/imaging.ts): one to three panels side by side, each a rows × cols grid of squares whose grey level (the ink at a fraction of its strength) is the pixel's value on
 * that panel's scale, with a title above, the ROI outlined (op hue), the atoms ringed (op hue) on every panel but the occupancy one, and a colour-scale legend under it (eight steps from
 * the scale's low to its high end, the two numbers and the unit). Grey is ink at an opacity, so the same code reads on the dark stage (brighter = more) and on paper (darker = more).
 * A grey level is photons or counts in that pixel, never where an atom "is"; the passport says the frame is simulated.
 */
import type { SvgSceneProps } from '../svgKinds'
import type { CameraFramePanel, ResolvedCameraFrame } from '../types'
import { Label, fix } from './draw'
import { cameraFrameReadouts } from './cameraFrame'

export interface CameraFrameLayout {
  padX: number
  /** Lines of text the figure carries itself (print and bare), at the top. */
  lines: string[]
  cell: number
  gap: number
  /** The left edge of panel i, the grid's top and the title's baseline. */
  x0: (i: number) => number
  gridTop: number
  titleY: number
  legendY: number
}

/** Where the panels go in a drawing box (pure, so a test can check that nothing leaves the box or touches the text lines). */
export function cameraFrameLayout(r: ResolvedCameraFrame, width: number, height: number, own: boolean, slot?: string | null): CameraFrameLayout {
  const readouts = cameraFrameReadouts(r)
  const lines = own ? readouts.map((x) => x.text) : []
  const padX = own ? 12 : 24
  const paneTop = slot === 'top'
  const paneBottom = slot === 'bottom'
  const top = own ? 8 + 13 * lines.length + (lines.length ? 6 : 0) : paneTop ? Math.max(60, 26 + 17 * readouts.length) : paneBottom ? 34 : Math.max(112, 26 + 17 * readouts.length)
  const bottom = own ? 8 : paneTop ? 14 : 92
  const P = r.panels.length
  const gap = P > 1 ? 14 : 0
  const titleH = 16
  const legendH = 34
  const availW = Math.max(60, width - 2 * padX)
  const availH = Math.max(40, height - top - bottom - titleH - legendH)
  const cell = Math.max(3, Math.min(40, Math.floor((availW - (P - 1) * gap) / (P * r.cols)), Math.floor(availH / r.rows)))
  const panelW = cell * r.cols
  const total = P * panelW + (P - 1) * gap
  const left = padX + Math.max(0, (availW - total) / 2)
  const gridTop = top + titleH
  return { padX, lines, cell, gap, x0: (i) => left + i * (panelW + gap), gridTop, titleY: top + 11, legendY: gridTop + cell * r.rows + 10 }
}

const level = (p: CameraFramePanel, v: number): number => (p.hi > p.lo ? Math.max(0, Math.min(1, (v - p.lo) / (p.hi - p.lo))) : 0)
const STEPS = 8

export function CameraFrameScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'camera-frame'>) {
  const print = mode === 'print'
  const own = print || !!bare
  const L = cameraFrameLayout(r, width, height, own, slot)
  const f = (a: string) => (focus === a ? 'svgk-focus' : undefined)
  const panelW = L.cell * r.cols
  return (
    <g className="svgk-scene" data-kind="camera-frame">
      {L.lines.map((t, i) => (
        <Label key={i} at={{ x: L.padX, y: 16 + 13 * i }} cls="fg-lbl">
          {t}
        </Label>
      ))}
      {r.panels.map((p, k) => {
        const x0 = L.x0(k)
        const barW = Math.min(panelW, 96)
        return (
          <g key={k} data-panel={p.show} role="img" aria-label={`${p.title}: ${r.rows} by ${r.cols} pixels, ${p.unit}, from ${fix(p.lo, 2)} to ${fix(p.hi, 2)}`}>
            <Label at={{ x: x0, y: L.titleY }} cls="fg-lbl">
              {p.title}
            </Label>
            <g data-anchor={p.show === 'weights' ? 'weights' : 'cell'} className={f(p.show === 'weights' ? 'weights' : 'cell')}>
              {p.values.map((v, i) => {
                const rr = Math.floor(i / r.cols)
                const cc = i % r.cols
                return (
                  <rect key={i} x={x0 + cc * L.cell} y={L.gridTop + rr * L.cell} width={L.cell} height={L.cell} fill="var(--fg-ink)" fillOpacity={level(p, v)} stroke="var(--fg-sil3)" strokeWidth={0.5}>
                    <title>{`row ${rr}, column ${cc}: ${fix(v, 2)} ${p.unit}`}</title>
                  </rect>
                )
              })}
            </g>
            {p.show !== 'occupancy' &&
              r.sites.map((s, i) => (
                <circle key={`a${i}`} data-anchor="atom" className={`fg-op ${f('atom') ?? ''}`} cx={x0 + (s.c + 0.5) * L.cell} cy={L.gridTop + (s.r + 0.5) * L.cell} r={Math.max(2, L.cell * 0.42)} fill="none" strokeWidth={1} strokeOpacity={0.8} />
              ))}
            {r.roi && (
              <rect data-anchor="roi" className={`fg-op ${f('roi') ?? ''}`} x={x0 + r.roi.c0 * L.cell} y={L.gridTop + r.roi.r0 * L.cell} width={r.roi.size * L.cell} height={r.roi.size * L.cell} fill="none" strokeWidth={1.8} />
            )}
            {Array.from({ length: STEPS }, (_, s) => (
              <rect key={`g${s}`} x={x0 + (s * barW) / STEPS} y={L.legendY} width={barW / STEPS + 0.4} height={7} fill="var(--fg-ink)" fillOpacity={(s + 0.5) / STEPS} />
            ))}
            <rect x={x0} y={L.legendY} width={barW} height={7} fill="none" className="fg-sil3" strokeWidth={0.6} />
            <Label at={{ x: x0, y: L.legendY + 20 }} cls="fg-lbl">
              {`${fix(p.lo, 2)} to ${fix(p.hi, 2)} ${p.unit}`}
            </Label>
          </g>
        )
      })}
    </g>
  )
}
