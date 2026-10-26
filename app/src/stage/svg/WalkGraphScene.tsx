/**
 * The `walk-graph` scene: ONE component for the live stage, the reading version and the print figure. It draws the resolved graph only (stage/svg/walkGraph.ts took
 * every chance and cut from physics/qc/walk.ts and variational.ts):
 *   star  the centre 0 and N outer vertices on a circle (spoke 1 at the top, then clockwise). With a walker each spoke's width and shade follow the chance on its two edge
 *         states; the marked vertex is ringed (op hue); the extra edge is a chord whose width follows the chance on its two states. Without one the spokes are thin silver lines.
 *   ring  n vertices on a circle joined in a cycle; with a cut string a vertex is filled by its bit and a cut edge is thick, the others thin.
 * Structure is silver; the walker's chance and the cut use the state hue; the hidden thing (marked vertex, extra edge) the op hue; the amber / cobalt outcome hues are never
 * used. Where a vertex sits is a drawing choice (the passport says so); a width is the chance of finding the walker on that edge, never where a particle is.
 * Plain Unicode text; every vertex and edge carries an accessible name.
 */
import type { SvgSceneProps } from '../svgKinds'
import type { ResolvedWalkGraph } from '../types'
import { Label, type Pt, fix } from './draw'
import { walkGraphReadouts } from './walkGraph'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}
export interface WalkGraphLayout {
  padX: number
  /** Lines of text the figure carries itself (print and bare), at the top. */
  lines: string[]
  area: Rect
  /** The picture's centre and the radius of the circle the outer vertices sit on. */
  cx: number
  cy: number
  R: number
}

/** Where the picture goes in a drawing box (pure, so a test can check that nothing leaves the box or touches the text lines). */
export function walkGraphLayout(r: ResolvedWalkGraph, width: number, height: number, own: boolean, slot?: string | null): WalkGraphLayout {
  const readouts = walkGraphReadouts(r)
  const lines = own ? readouts.map((x) => x.text) : []
  const padX = own ? 12 : 24
  const paneTop = slot === 'top'
  const paneBottom = slot === 'bottom'
  const top = own ? 8 + 13 * lines.length + (lines.length ? 6 : 0) : paneTop ? Math.max(60, 26 + 17 * readouts.length) : paneBottom ? 34 : Math.max(112, 26 + 17 * readouts.length)
  const bottom = own ? 8 : paneTop ? 14 : 92
  const area: Rect = { x: padX, y: top, w: Math.max(80, width - 2 * padX), h: Math.max(60, height - top - bottom) }
  const margin = 28 // the outer vertex's ring and its label
  return { padX, lines, area, cx: area.x + area.w / 2, cy: area.y + area.h / 2, R: Math.max(24, Math.min(area.w, area.h) / 2 - margin) }
}

/** The centre of outer vertex j (1…N) of a star: spoke 1 at the top, then clockwise. */
export const starPoint = (j: number, N: number, cx: number, cy: number, R: number): Pt => {
  const a = -Math.PI / 2 + ((j - 1) * 2 * Math.PI) / N
  return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }
}
/** The centre of vertex j (0…n-1) of a ring: vertex 0 up and to the left, then clockwise (a square for n = 4). */
export const ringPoint = (j: number, n: number, cx: number, cy: number, R: number): Pt => {
  const a = -Math.PI / 2 - Math.PI / n + (j * 2 * Math.PI) / n
  return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }
}
/** A label position just outside a vertex on the circle (direction from the centre). */
const outside = (p: Pt, cx: number, cy: number, gap: number): { at: Pt; anchor: 'start' | 'middle' | 'end' } => {
  const dx = p.x - cx
  const dy = p.y - cy
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  return { at: { x: p.x + ux * gap, y: p.y + uy * gap + 4 }, anchor: ux > 0.3 ? 'start' : ux < -0.3 ? 'end' : 'middle' }
}

const pctText = (p: number): string => `${fix(100 * p, 1)} %`

export function WalkGraphScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'walk-graph'>) {
  const print = mode === 'print'
  const own = print || !!bare
  const L = walkGraphLayout(r, width, height, own, slot)
  const f = (a: string) => (focus === a ? 'svgk-focus' : undefined)
  const labels = r.show.includes('labels')
  const chances = r.show.includes('chances') && r.spokes.length > 0

  const star = () => {
    const c: Pt = { x: L.cx, y: L.cy }
    const P = (j: number) => starPoint(j, r.N, L.cx, L.cy, L.R)
    const w = (p: number) => 1.6 + 10 * p
    const shade = (p: number) => 0.3 + 0.7 * p
    // the centre's label sits in the gap between the two spokes nearest the bottom (opposite spoke 1, where the marked spoke is thick)
    const bisect = -Math.PI / 2 + ((Math.ceil(r.N / 2) - 0.5) * 2 * Math.PI) / r.N
    return (
      <g data-panel="star">
        {Array.from({ length: r.N }, (_, k) => {
          const j = k + 1
          const p = chances ? r.spokes[k] : 0
          return (
            <g key={`s${j}`} data-anchor="spoke" className={f('spoke')}>
              <title>{chances ? `spoke ${j}: ${pctText(p)}` : `spoke ${j}`}</title>
              <line x1={c.x} y1={c.y} x2={P(j).x} y2={P(j).y} className={chances ? 'fg-state' : 'fg-sil2'} strokeWidth={chances ? w(p) : 1.6} strokeOpacity={chances ? shade(p) : 1} strokeLinecap="round" />
            </g>
          )
        })}
        {r.extra && (
          <g data-anchor="extra" className={f('extra')}>
            <title>{r.extraChance !== null && chances ? `extra edge ${r.extra[0]}-${r.extra[1]}: ${pctText(r.extraChance)}` : `extra edge ${r.extra[0]}-${r.extra[1]}`}</title>
            <line
              x1={P(r.extra[0]).x}
              y1={P(r.extra[0]).y}
              x2={P(r.extra[1]).x}
              y2={P(r.extra[1]).y}
              className="fg-op"
              strokeWidth={chances && r.extraChance !== null ? w(r.extraChance) : 1.8}
              strokeOpacity={chances && r.extraChance !== null ? shade(r.extraChance) : 0.9}
              strokeDasharray={chances ? undefined : '5 3'}
              strokeLinecap="round"
            />
          </g>
        )}
        <g data-anchor="vertex" className={f('vertex')}>
          <title>centre 0</title>
          <circle cx={c.x} cy={c.y} r={7} className="fg-sil-fill" />
        </g>
        {labels && (
          <Label at={{ x: c.x + 17 * Math.cos(bisect) - 3, y: c.y + 17 * Math.sin(bisect) + 4 }} cls="fg-lbl">
            0
          </Label>
        )}
        {Array.from({ length: r.N }, (_, k) => {
          const j = k + 1
          const p = P(j)
          const o = outside(p, L.cx, L.cy, 19)
          return (
            <g key={`v${j}`} data-anchor="vertex" className={f('vertex')}>
              <title>{`vertex ${j}${r.marked === j ? ' (marked)' : ''}`}</title>
              <circle cx={p.x} cy={p.y} r={6} className="fg-sil-fill" />
              {r.marked === j && <circle cx={p.x} cy={p.y} r={11} fill="none" className="fg-op" strokeWidth={2.2} />}
              {labels && (
                <Label at={o.at} anchor={o.anchor} cls="fg-lbl">
                  {String(j)}
                </Label>
              )}
            </g>
          )
        })}
      </g>
    )
  }

  const ring = () => {
    const rg = r.ring!
    const P = (j: number) => ringPoint(j, r.N, L.cx, L.cy, L.R)
    return (
      <g data-panel="ring">
        {rg.edges.map(([j, k], i) => (
          <g key={`e${i}`} data-anchor="cut" className={f('cut')}>
            <title>{rg.bits === null ? `side ${j}-${k}` : `side ${j}-${k}: ${rg.cutEdges[i] ? 'cut' : 'not cut'}`}</title>
            <line x1={P(j).x} y1={P(j).y} x2={P(k).x} y2={P(k).y} className={rg.cutEdges[i] ? 'fg-state' : 'fg-sil2'} strokeWidth={rg.cutEdges[i] ? 5 : 1.8} strokeLinecap="round" />
          </g>
        ))}
        {Array.from({ length: r.N }, (_, j) => {
          const p = P(j)
          const bit = rg.bits === null ? null : rg.bits[j]
          const o = outside(p, L.cx, L.cy, 21)
          return (
            <g key={`v${j}`} data-anchor="vertex" className={f('vertex')}>
              <title>{bit === null ? `vertex ${j}` : `vertex ${j}: team ${bit}`}</title>
              <circle cx={p.x} cy={p.y} r={10} className={bit === '1' ? 'fg-state-fill' : 'fg-sil-fill'} fillOpacity={bit === '1' ? 1 : bit === '0' ? 0.35 : 1} stroke="none" />
              {bit === '0' && <circle cx={p.x} cy={p.y} r={10} fill="none" className="fg-sil" strokeWidth={1.5} />}
              {labels && (
                <Label at={o.at} anchor={o.anchor} cls="fg-lbl">
                  {bit === null ? String(j) : bit}
                </Label>
              )}
            </g>
          )
        })}
      </g>
    )
  }

  return (
    <g className="svgk-scene" data-kind="walk-graph">
      {L.lines.map((t, i) => (
        <Label key={i} at={{ x: L.padX, y: 16 + 13 * i }} cls="fg-lbl">
          {t}
        </Label>
      ))}
      {r.topology === 'star' ? star() : ring()}
    </g>
  )
}
