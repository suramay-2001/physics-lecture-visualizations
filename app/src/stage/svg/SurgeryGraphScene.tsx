/**
 * The `surgery-graph` scene: ONE component for the live stage, the reading version and the print figure. It draws the resolved gauging graph only (stage/svg/surgeryGraph.ts took every count,
 * cycle, Cheeger set and distance from physics/qec/gauge.ts). The two sides of a joined graph are two columns (side A left, side B right, the rows going down); one host is one column; the seam's
 * own graph is one column of its four checks.
 *   dots     a support qubit each (filled with its label); a short tick leaves each dot toward the code it sits on, with that code qubit's number (`vertices`)
 *   links    a line between two dots = ONE NEW QUBIT (tagged with its number): path links solid, rungs dashed amber, the seam's qubits solid (`edges`)
 *   cycles   each independent loop of the engine's cycle basis is shaded and numbered B1, B2, ...; a loop left out (`drop`) is grey and dashed (`cycles`)
 *   checks   a summary under the picture: how many vertex checks A_v and cycle checks B_c are measured, the gauge qubits, the focused check (`checks`, `focus`)
 *   product  every link carries its multiplicity in the product of all vertex checks (2: it cancels) and the picture says which X letters remain
 *   subset   a set S of dots shaded, its boundary links dashed in orchid, and the ratio |boundary| / |S| written under the picture
 * Where a dot sits is a drawing choice (the passport says so). Plain Unicode text; every dot, link and cycle carries an accessible name.
 */
import type { ReactNode } from 'react'
import type { SvgSceneProps } from '../svgKinds'
import type { ResolvedSurgeryGraph } from '../types'
import { packLines, wrapLine } from './CodeScene'
import { Label, type Pt } from './draw'
import { checksText, subsetText, surgeryGraphReadouts } from './surgeryGraph'
import { SurgeryLpuScene } from './SurgeryLpuScene'

const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x))
const f1 = (v: number): string => v.toFixed(1)

const HOST_LABEL: Record<ResolvedSurgeryGraph['host'], string> = {
  'patch3-x': 'one patch, a column of X',
  'patches3-xx': 'two patches, X on each column',
  'patch3-steane': 'a patch and a Steane block',
  seam3: 'the surgery seam',
}

/** Which of the pieces are drawn: some options imply others (a focus, a product, a subset or the cycles all need the links). */
export function drawn(r: ResolvedSurgeryGraph): { stubs: boolean; links: boolean; cycles: boolean; checks: boolean } {
  const s = r.show
  const needsLinks = s.includes('edges') || s.includes('cycles') || r.focus !== null || r.product || r.subset !== null
  return { stubs: s.includes('vertices') || r.focus !== null, links: needsLinks, cycles: s.includes('cycles'), checks: s.includes('checks') }
}

export interface SurgeryGraphGeometry {
  /** The drawing area (inside the passport above and the caption below on the live stage). */
  area: { x: number; y: number; w: number; h: number }
  /** Where dot v is drawn, its radius, and the length of the attachment tick. */
  at: (v: number) => Pt
  rad: number
  stub: number
  /** The text lines under the picture (checks summary, product note, subset numbers) and the y of the first one and of the legend. */
  foot: string[]
  footY: number
  legendY: number
  /** The figure's own text lines above the drawing (print and bare). */
  lines: string[]
  /** Does the host draw two columns (joined graphs)? */
  twoCols: boolean
}

/** The text under the picture, from the resolved state. */
export function footLines(r: ResolvedSurgeryGraph): string[] {
  const d = drawn(r)
  const out: string[] = []
  if (d.checks) out.push(...checksText(r))
  if (r.product) out.push(`each link is in ${r.edges[0]?.mult ?? 2} vertex checks: ×2 cancels`, 'only X on the dots remains')
  const st = subsetText(r)
  if (st) out.push(st)
  return out.flatMap((t) => wrapLine(t, 52))
}

/** Where the picture goes in a drawing box (pure, so a test can check that nothing leaves the box or touches the text lines). */
export function surgeryGraphGeometry(r: ResolvedSurgeryGraph, width: number, height: number, own: boolean, slot?: string | null): SurgeryGraphGeometry {
  const readouts = surgeryGraphReadouts(r)
  const title = `gauging graph · ${HOST_LABEL[r.host]}`
  const lines = own ? [title, ...packLines(readouts.map((x) => x.text), 50)] : []
  const padX = own ? 12 : 24
  const paneTop = slot === 'top'
  const paneBottom = slot === 'bottom'
  const top = own ? 6 + 13 * lines.length + 6 : paneTop ? Math.max(60, 26 + 17 * readouts.length) : paneBottom ? 34 : Math.max(112, 26 + 17 * readouts.length)
  const bottom = own ? 6 : paneTop ? 14 : 92
  const area = { x: padX, y: top, w: Math.max(80, width - 2 * padX), h: Math.max(60, height - top - bottom) }
  const foot = footLines(r)
  const legendRows = legendRowCount(r, area.w)
  const legendH = 7 + 13 * legendRows
  const footH = foot.length ? 13 * foot.length + 6 : 0
  const picTop = area.y + 10
  const picBottom = area.y + area.h - legendH - footH - 6
  const rows = Math.max(...r.vertices.map((v) => v.row)) + 1
  // the dots (radius at most 11) keep a margin to the picture's edges
  const m = 12
  const usable = picBottom - picTop - 2 * m
  const dy = rows > 1 ? clamp(usable / (rows - 1), 22, 72) : 40
  const y0 = picTop + m + Math.max(0, (usable - dy * (rows - 1)) / 2)
  const twoCols = r.vertices.some((v) => v.side === 'B')
  const rad = clamp(dy * 0.24, 8.5, 11)
  const stub = 14
  const side = stub + 22 + rad
  let xA: number
  let xB: number
  if (twoCols) {
    const gap = clamp(area.w - 2 * side, 110, 210)
    xA = area.x + (area.w - gap) / 2
    xB = xA + gap
  } else {
    xA = area.x + area.w / 2 - 14
    xB = xA
  }
  return {
    area,
    at: (v) => {
      const vx = r.vertices[v]
      return { x: vx.side === 'B' ? xB : xA, y: y0 + dy * vx.row }
    },
    rad,
    stub,
    foot,
    footY: picBottom + 12,
    legendY: area.y + area.h - 4 - 13 * (legendRows - 1),
    lines,
    twoCols,
  }
}

interface Ctx {
  r: ResolvedSurgeryGraph
  g: SurgeryGraphGeometry
  focus: string | null | undefined
}
const fcls = (c: Ctx, a: string): string | undefined => (c.focus === a ? 'svgk-focus' : undefined)
const HUES = ['fg-op-fill', 'fg-plus-fill', 'fg-minus-fill', 'fg-sil-fill'] as const

/** The point and text anchor where the tag of a link goes: beside a vertical link; a little way along a rung (off the loops' centres and off the other rungs' tags). */
function tagSpot(c: Ctx, e: ResolvedSurgeryGraph['edges'][number]): { p: Pt; anchor: 'start' | 'middle' | 'end' } {
  const a = c.g.at(e.u)
  const b = c.g.at(e.v)
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  if (Math.abs(a.x - b.x) >= 1) {
    // staggered by the row the rung starts on, so two rungs that cross never put their tags on top of each other
    const t = 0.28 + 0.15 * c.r.vertices[e.u].row
    return { p: { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t - 6 }, anchor: 'middle' }
  }
  if (Math.abs(a.x - b.x) < 1) {
    const onB = c.r.vertices[e.u].side === 'B'
    return onB ? { p: { x: mid.x - 7, y: mid.y + 4 }, anchor: 'end' } : { p: { x: mid.x + 7, y: mid.y + 4 }, anchor: 'start' }
  }
  return { p: { x: mid.x, y: mid.y - 6 }, anchor: 'middle' }
}

function Cycles({ c }: { c: Ctx }) {
  const { r, g } = c
  return (
    <g data-anchor="cycle" className={fcls(c, 'cycle')}>
      {r.cycles.map((cy) => {
        const pts = cy.vertices.map((v) => g.at(v))
        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length
        const cyy = pts.reduce((s, p) => s + p.y, 0) / pts.length
        const hue = cy.dropped ? 'fg-sil-fill' : HUES[cy.index % 3]
        const name = `cycle B${cy.index + 1}${cy.dropped ? ' (left out: a gauge qubit)' : ''}: links ${cy.edges.map((e) => `q${r.edges[e].qubit}`).join(', ')}`
        return (
          <g key={cy.index} role="img" aria-label={name} data-cycle={cy.index} data-dropped={cy.dropped ? 1 : undefined}>
            <title>{name}</title>
            <path d={`M${pts.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' L')} Z`} className={hue} fillOpacity={cy.dropped ? 0.1 : 0.24} stroke="none" />
            <text x={cx} y={cyy + 4} textAnchor="middle" className="fg-txt" style={{ fontWeight: 700, fontSize: 12 }}>
              {`B${cy.index + 1}${cy.dropped ? '·gauge' : ''}`}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function Links({ c }: { c: Ctx }) {
  const { r, g } = c
  const inFocus = (id: number): boolean => r.focus !== null && r.vertices[r.focus].links.includes(id)
  const onBoundary = (id: number): boolean => !!r.subset && r.subset.boundary.includes(id)
  return (
    <>
      <g data-anchor="edge" className={fcls(c, 'edge')}>
        {r.edges.map((e) => {
          const a = g.at(e.u)
          const b = g.at(e.v)
          const rung = e.kind === 'rung'
          const bold = inFocus(e.id)
          return (
            <g key={e.id} role="img" aria-label={e.aria} data-edge={e.id} data-kind={e.kind}>
              <title>{e.aria}</title>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={rung ? 'fg-plus' : 'fg-state'} strokeWidth={bold ? 4 : 2.2} strokeDasharray={rung ? '6 4' : undefined} strokeLinecap="round" />
              {onBoundary(e.id) && <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="fg-op" strokeWidth={5.5} strokeDasharray="3 5" strokeLinecap="round" opacity={0.9} data-boundary="1" />}
            </g>
          )
        })}
      </g>
      <g data-anchor="link" className={fcls(c, 'link')}>
        {r.edges.map((e) => {
          const spot = tagSpot(c, e)
          const text = r.product ? `×${e.mult}` : r.host === 'seam3' ? `seam ${e.id + 1}` : `q${e.qubit}`
          return (
            <text key={e.id} x={spot.p.x} y={spot.p.y} textAnchor={spot.anchor} className={r.product ? 'fg-txt' : 'fg-lbl'} style={{ fontSize: 11, fontWeight: r.product ? 700 : 500 }} data-link={e.id}>
              {text}
            </text>
          )
        })}
      </g>
    </>
  )
}

function Dots({ c }: { c: Ctx }) {
  const { r, g } = c
  const d = drawn(r)
  const inS = new Set(r.subset?.vertices ?? [])
  return (
    <g data-anchor="vertex" className={fcls(c, 'vertex')}>
      {r.vertices.map((v) => {
        const p = g.at(v.id)
        const out = v.side === 'B' ? 1 : -1
        const hasStub = d.stubs && v.qubit >= 0 && r.host !== 'seam3'
        const shaded = inS.has(v.id)
        const focused = r.focus === v.id
        return (
          <g key={v.id} role="img" aria-label={v.aria} data-vertex={v.id} data-shaded={shaded ? 1 : undefined}>
            <title>{v.aria}</title>
            {hasStub && (
              <>
                <line x1={p.x + out * g.rad} y1={p.y} x2={p.x + out * (g.rad + g.stub)} y2={p.y} className="fg-sil" strokeWidth={1.6} />
                <line x1={p.x + out * (g.rad + g.stub)} y1={p.y - 3.5} x2={p.x + out * (g.rad + g.stub)} y2={p.y + 3.5} className="fg-sil" strokeWidth={1.6} />
                {v.label !== `q${v.qubit}` && (
                  <text x={p.x + out * (g.rad + g.stub + 5)} y={p.y + 4} textAnchor={out > 0 ? 'start' : 'end'} className="fg-lbl" style={{ fontSize: 10 }}>
                    {`q${v.qubit}`}
                  </text>
                )}
              </>
            )}
            {shaded && <circle cx={p.x} cy={p.y} r={g.rad + 5} className="fg-minus-fill" fillOpacity={0.3} stroke="none" data-anchor="subset" />}
            {focused && <circle cx={p.x} cy={p.y} r={g.rad + 4.5} fill="none" className="fg-state" strokeWidth={2.4} strokeDasharray="4 3" data-focus="1" />}
            <circle cx={p.x} cy={p.y} r={g.rad} fill="var(--fg-halo, transparent)" className={shaded ? 'fg-minus' : 'fg-sil'} strokeWidth={shaded ? 2.4 : 1.8} />
            <text x={p.x} y={p.y + 3.4} textAnchor="middle" className="fg-txt" style={{ fontSize: 9.5, fontWeight: 700 }}>
              {v.label}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function Foot({ c }: { c: Ctx }) {
  const { r, g } = c
  const st = subsetText(r)
  return (
    <g data-anchor="check" className={fcls(c, 'check')}>
      {g.foot.map((t, i) => (
        <text key={i} x={g.area.x} y={g.footY + 13 * i} className={st && t.startsWith('|S|') ? 'fg-txt' : 'fg-lbl'} style={{ fontSize: 11, fontWeight: st && t.startsWith('|S|') ? 700 : 500 }} data-line={i}>
          {t}
        </text>
      ))}
    </g>
  )
}

/** The legend's items with their widths (a swatch, its words and a gap); drawn at absolute positions (no group transform), so a label is where it is drawn. */
function legendItems(r: ResolvedSurgeryGraph): { w: number; node: (x: number, y: number) => ReactNode }[] {
  const d = drawn(r)
  const items: { w: number; node: (x: number, y: number) => ReactNode }[] = []
  items.push({ w: 96, node: (x, y) => <><circle cx={x + 5} cy={y - 4} r={4.8} fill="var(--fg-halo, transparent)" className="fg-sil" strokeWidth={1.5} /><text x={x + 15} y={y} className="fg-lbl">support qubit</text></> })
  if (d.links) items.push({ w: 112, node: (x, y) => <><line x1={x} y1={y - 4} x2={x + 12} y2={y - 4} className="fg-state" strokeWidth={2.2} strokeLinecap="round" /><text x={x + 17} y={y} className="fg-lbl">link = new qubit</text></> })
  if (d.links && r.edges.some((e) => e.kind === 'rung')) items.push({ w: 56, node: (x, y) => <><line x1={x} y1={y - 4} x2={x + 12} y2={y - 4} className="fg-plus" strokeWidth={2.2} strokeDasharray="4 2" /><text x={x + 17} y={y} className="fg-lbl">rung</text></> })
  if (d.cycles && r.cycles.length) items.push({ w: 60, node: (x, y) => <><rect x={x} y={y - 9} width={11} height={10} className="fg-op-fill" fillOpacity={0.4} /><text x={x + 16} y={y} className="fg-lbl">cycle</text></> })
  if (r.subset) items.push({ w: 60, node: (x, y) => <><circle cx={x + 5} cy={y - 4} r={5} className="fg-minus-fill" fillOpacity={0.4} /><text x={x + 15} y={y} className="fg-lbl">set S</text></> })
  return items
}

/** How many rows the legend needs in a drawing area of this width (items wrap to a second row rather than leave the box). */
export function legendRowCount(r: ResolvedSurgeryGraph, areaW: number): number {
  let rows = 1
  let x = 0
  for (const it of legendItems(r)) {
    if (x > 0 && x + it.w - 10 > areaW) {
      rows++
      x = 0
    }
    x += it.w
  }
  return rows
}

function Legend({ c }: { c: Ctx }) {
  const { r, g } = c
  let x = 0
  let row = 0
  return (
    <g data-legend="surgery-graph">
      {legendItems(r).map((it, i) => {
        if (x > 0 && x + it.w - 10 > g.area.w) {
          row++
          x = 0
        }
        const at = g.area.x + x
        x += it.w
        return <g key={i}>{it.node(at, g.legendY + 13 * row)}</g>
      })}
    </g>
  )
}

/** The kind's one scene: a gauge source is drawn below, an lpu source (P1) by stage/svg/SurgeryLpuScene.tsx. */
export function SurgeryGraphScene(props: SvgSceneProps<'surgery-graph'>) {
  const r = props.state
  if (r.source === 'lpu') return <SurgeryLpuScene {...props} state={r} />
  return <GaugeGraphScene {...props} state={r} />
}

function GaugeGraphScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'surgery-graph'> & { state: ResolvedSurgeryGraph }) {
  const own = mode === 'print' || !!bare
  const g = surgeryGraphGeometry(r, width, height, own, slot)
  const c: Ctx = { r, g, focus }
  const d = drawn(r)
  return (
    <g className="svgk-scene" data-kind="surgery-graph" data-host={r.host}>
      {g.lines.map((t, i) => (
        <Label key={i} at={{ x: 12, y: 15 + 13 * i }} cls="fg-lbl">
          {t}
        </Label>
      ))}
      {!own && (
        <text x={g.area.x} y={g.area.y - 4} className="fg-txt fg-big" style={{ fontSize: 14 }}>
          {HOST_LABEL[r.host]}
        </text>
      )}
      {d.cycles && <Cycles c={c} />}
      {d.links && <Links c={c} />}
      <Dots c={c} />
      <Foot c={c} />
      <Legend c={c} />
    </g>
  )
}
