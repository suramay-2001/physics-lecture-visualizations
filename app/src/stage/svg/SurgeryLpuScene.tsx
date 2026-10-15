/**
 * The `surgery-graph` kind's lpu source: the ancilla graph of a logical processing unit of the bicycle machine (paper-tdg App. A.3), drawn from the resolved state (stage/svg/surgeryGraph.ts took
 * every dot and link from physics/qec/tdg.ts `tdgLpuGraph`). ONE component for the live stage, the reading version and the print figure.
 *   'l' / 'r'   one half graph: a dot on each qubit of X-bar 1 (X-bar 7), numbered from 1 around a circle, a link for each Z check that meets the operator twice
 *   'full'      two half graphs side by side (left circle, right circle) sharing the one `v_Bell` dot between them, which is drawn double (it stands for two check qubits); the BRIDGE links join
 *               the i-th dot of the left circle to the i-th dot of the right one in a distinct (amber, heavier) stroke; the added links of the two-gross graph are dashed
 *   measure     the part that measures an operator is lit and the rest dims (left half for X-bar 1 and Z-bar 7, right half for X-bar 7 and Z-bar 1, the whole graph for the Y products); a caption
 *               row says which ("measures X̄1 with the left half")
 * Where a dot sits on its circle, and which dots a bridge joins, are a DRAWING's choice (the passport and the fidelity note say so); only the counts are the paper's. Plain Unicode text; every
 * dot and link carries an accessible name.
 */
import type { ReactNode } from 'react'
import type { SvgSceneProps } from '../svgKinds'
import type { ResolvedLpuGraph } from '../types'
import { packLines, wrapLine } from './CodeScene'
import { Label, type Pt } from './draw'
import { surgeryGraphReadouts } from './surgeryGraph'

const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x))
/** Parts that are not lit while a measurement lights another part. */
export const LPU_DIM = 0.25

export const lpuTitle = (r: ResolvedLpuGraph): string => `LPU graph · ${r.code} code · ${r.mode === 'full' ? 'both halves' : r.mode === 'l' ? 'left half graph' : 'right half graph'}`

/** Is a dot of this half lit by the measurement? (No measurement lights everything; the shared dot belongs to both halves.) */
export const dotLit = (r: ResolvedLpuGraph, half: 'l' | 'r' | 'bell'): boolean => r.litPart === null || r.litPart === 'full' || half === 'bell' || half === r.litPart
/** Is a link lit? A bridge belongs to neither half alone, so only the whole graph lights it. */
export const linkLit = (r: ResolvedLpuGraph, half: 'l' | 'r' | 'both'): boolean => r.litPart === null || r.litPart === 'full' || half === r.litPart

export interface LpuGeometry {
  area: { x: number; y: number; w: number; h: number }
  /** Where dot `id` is drawn, the dot's radius, and the circles' centres and radius. */
  at: (id: number) => Pt
  rad: number
  circles: { cx: number; cy: number; R: number; half: 'l' | 'r' }[]
  bell: Pt | null
  /** The text under the picture (the caption row), and the y of its first line and of the legend. */
  foot: string[]
  footY: number
  legendY: number
  /** The figure's own text lines above the drawing (print and bare). */
  lines: string[]
  /** The y of the "left half" / "right half" labels under the circles (full graph). */
  halfLabelY: number | null
}

export function footLines(r: ResolvedLpuGraph): string[] {
  return r.caption ? wrapLine(r.caption, 52) : []
}

function legendItems(r: ResolvedLpuGraph): { w: number; node: (x: number, y: number) => ReactNode }[] {
  const items: { w: number; node: (x: number, y: number) => ReactNode }[] = []
  items.push({ w: 108, node: (x, y) => <><circle cx={x + 5} cy={y - 4} r={4.8} fill="var(--fg-halo, transparent)" className="fg-sil" strokeWidth={1.5} /><text x={x + 15} y={y} className="fg-lbl">support qubit</text></> })
  items.push({ w: 62, node: (x, y) => <><line x1={x} y1={y - 4} x2={x + 12} y2={y - 4} className="fg-state" strokeWidth={1.6} strokeLinecap="round" /><text x={x + 17} y={y} className="fg-lbl">link</text></> })
  if (r.edges.some((e) => e.kind === 'extra')) items.push({ w: 94, node: (x, y) => <><line x1={x} y1={y - 4} x2={x + 12} y2={y - 4} className="fg-state" strokeWidth={1.6} strokeDasharray="3 2" /><text x={x + 17} y={y} className="fg-lbl">added link</text></> })
  if (r.edges.some((e) => e.kind === 'bridge')) items.push({ w: 102, node: (x, y) => <><line x1={x} y1={y - 4} x2={x + 12} y2={y - 4} className="fg-plus" strokeWidth={2.6} strokeLinecap="round" /><text x={x + 17} y={y} className="fg-lbl">bridge link</text></> })
  if (r.mode === 'full') items.push({ w: 136, node: (x, y) => <><circle cx={x + 6} cy={y - 4} r={6} fill="none" className="fg-sil" strokeWidth={1.2} /><circle cx={x + 6} cy={y - 4} r={3.4} fill="var(--fg-halo, transparent)" className="fg-sil" strokeWidth={1.4} /><text x={x + 17} y={y} className="fg-lbl">two check qubits</text></> })
  return items
}

export function legendRowCount(r: ResolvedLpuGraph, areaW: number): number {
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

/** Where the picture goes in a drawing box (pure, so a test can check that nothing leaves the box or touches the text lines). */
export function lpuGeometry(r: ResolvedLpuGraph, width: number, height: number, own: boolean, slot?: string | null): LpuGeometry {
  const readouts = surgeryGraphReadouts(r)
  const lines = own ? [lpuTitle(r), ...packLines(readouts.map((x) => x.text), 50)] : []
  const padX = own ? 12 : 24
  const paneTop = slot === 'top'
  const paneBottom = slot === 'bottom'
  const top = own ? 6 + 13 * lines.length + 6 : paneTop ? Math.max(60, 26 + 17 * readouts.length) : paneBottom ? 34 : Math.max(112, 26 + 17 * readouts.length)
  const bottom = own ? 6 : paneTop ? 14 : 92
  const area = { x: padX, y: top, w: Math.max(80, width - 2 * padX), h: Math.max(60, height - top - bottom) }
  const foot = footLines(r)
  const legendH = 7 + 13 * legendRowCount(r, area.w)
  const footH = foot.length ? 13 * foot.length + 6 : 0
  const full = r.mode === 'full'
  const labelH = full ? 18 : 0
  const picTop = area.y + 8
  const picBottom = area.y + area.h - legendH - footH - 6
  const picH = Math.max(40, picBottom - picTop - labelH)
  const plainL = r.vertices.filter((v) => v.half === 'l')
  const plainR = r.vertices.filter((v) => v.half === 'r')
  const nMax = Math.max(plainL.length, plainR.length, 3)
  // the dots: a radius from the room round a circle, then the circle from the room the dots leave, then the radius again from that circle (so neighbours on it never touch)
  const gapW = full ? clamp(area.w * 0.2, 54, 96) : 0
  const fitR = (d: number): number => (full ? Math.max(14, Math.min((area.w - gapW - 2 * (d + 3)) / 4, picH / 2 - d - 3)) : Math.max(14, Math.min(area.w / 2 - d - 3, picH / 2 - d - 3)))
  const est = full ? Math.min((area.w - 70) / 4, picH / 2) : Math.min(area.w / 2, picH / 2)
  let rad = clamp(est * Math.sin(Math.PI / nMax) * 0.82, 4.5, 11)
  let R = fitR(rad)
  for (let k = 0; k < 3; k++) {
    rad = clamp(Math.min(rad, R * Math.sin(Math.PI / nMax) * 0.86), 4.5, 11)
    R = fitR(rad)
  }
  const cy = picTop + picH / 2
  const mid = area.x + area.w / 2
  const circles: LpuGeometry['circles'] = full
    ? [
        { cx: mid - R - gapW / 2, cy, R, half: 'l' },
        { cx: mid + R + gapW / 2, cy, R, half: 'r' },
      ]
    : [{ cx: mid, cy, R, half: r.mode === 'l' ? 'l' : 'r' }]
  const pos = new Map<number, Pt>()
  const place = (ids: number[], c: { cx: number; cy: number; R: number }, sign: 1 | -1): void => {
    ids.forEach((id, i) => {
      const a = -Math.PI / 2 + (sign * 2 * Math.PI * i) / ids.length
      pos.set(id, { x: c.cx + c.R * Math.cos(a), y: c.cy + c.R * Math.sin(a) })
    })
  }
  const bellV = r.vertices.find((v) => v.half === 'bell')
  if (full) {
    // the right circle is the mirror image of the left, so the i-th dots face each other and a bridge between them is level
    place(plainL.map((v) => v.id), circles[0], 1)
    place(plainR.map((v) => v.id), circles[1], -1)
    if (bellV) pos.set(bellV.id, { x: mid, y: cy })
  } else {
    place(r.vertices.map((v) => v.id), circles[0], 1)
  }
  return {
    area,
    at: (id) => pos.get(id) ?? { x: mid, y: cy },
    rad,
    circles,
    bell: bellV ? (pos.get(bellV.id) ?? null) : null,
    foot,
    footY: picBottom + 12,
    legendY: area.y + area.h - 4 - 13 * (legendRowCount(r, area.w) - 1),
    lines,
    halfLabelY: full ? cy + R + rad + 14 : null,
  }
}

interface Ctx {
  r: ResolvedLpuGraph
  g: LpuGeometry
  focus: string | null | undefined
}
const fcls = (c: Ctx, a: string): string | undefined => (c.focus === a ? 'svgk-focus' : undefined)

function Links({ c }: { c: Ctx }) {
  const { r, g } = c
  // bridges first (under), then the half graphs' links
  const order = [...r.edges].sort((a, b) => Number(b.kind === 'bridge') - Number(a.kind === 'bridge'))
  return (
    <g data-anchor="edge" className={fcls(c, 'edge')}>
      {order.map((e) => {
        const a = g.at(e.a)
        const b = g.at(e.b)
        const bridge = e.kind === 'bridge'
        const lit = linkLit(r, e.half)
        return (
          <g key={e.id} role="img" aria-label={e.aria} data-edge={e.id} data-kind={e.kind} data-lit={lit ? 1 : 0} opacity={lit ? 1 : LPU_DIM}>
            <title>{e.aria}</title>
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className={bridge ? 'fg-plus' : 'fg-state'}
              strokeWidth={bridge ? 2.4 : 1.3}
              strokeDasharray={e.kind === 'extra' ? '4 3' : undefined}
              strokeLinecap="round"
              opacity={bridge ? 0.85 : 0.75}
            />
          </g>
        )
      })}
    </g>
  )
}

function Dots({ c }: { c: Ctx }) {
  const { r, g } = c
  return (
    <g data-anchor="vertex" className={fcls(c, 'vertex')}>
      {r.vertices.map((v) => {
        const p = g.at(v.id)
        const bell = v.half === 'bell'
        const lit = dotLit(r, v.half)
        return (
          <g key={v.id} role="img" aria-label={v.aria} data-vertex={v.id} data-half={v.half} data-lit={lit ? 1 : 0} opacity={lit ? 1 : LPU_DIM}>
            <title>{v.aria}</title>
            {bell && <circle cx={p.x} cy={p.y} r={g.rad * 1.5} fill="var(--fg-halo, transparent)" className="fg-state" strokeWidth={1.6} data-bell="1" />}
            <circle cx={p.x} cy={p.y} r={bell ? g.rad : g.rad} fill="var(--fg-halo, transparent)" className={bell ? 'fg-state' : lit && r.litPart ? 'fg-state' : 'fg-sil'} strokeWidth={bell ? 1.8 : lit && r.litPart ? 2.2 : 1.6} />
            {!bell && (
              <text x={p.x} y={p.y + 3.2} textAnchor="middle" className="fg-txt" style={{ fontSize: g.rad >= 7 ? 9 : 8, fontWeight: 700 }}>
                {v.label}
              </text>
            )}
            {bell && (
              <text x={p.x} y={p.y + g.rad * 1.5 + 13} textAnchor="middle" className="fg-txt" style={{ fontSize: 10, fontWeight: 700 }}>
                v_Bell
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

function Guides({ c }: { c: Ctx }) {
  const { r, g } = c
  return (
    <g data-guides="1">
      {g.circles.map((ci) => (
        <circle key={ci.half} cx={ci.cx} cy={ci.cy} r={ci.R} fill="none" className="fg-sil3" strokeWidth={1} strokeDasharray="2 4" opacity={dotLit(r, ci.half) ? 1 : LPU_DIM} />
      ))}
      {g.halfLabelY !== null &&
        g.circles.map((ci) => (
          <text key={`h${ci.half}`} x={ci.cx} y={g.halfLabelY!} textAnchor="middle" className="fg-lbl" style={{ fontSize: 11, opacity: dotLit(r, ci.half) ? 1 : 0.55 }}>
            {ci.half === 'l' ? 'left half graph' : 'right half graph'}
          </text>
        ))}
    </g>
  )
}

function Foot({ c }: { c: Ctx }) {
  const { g } = c
  return (
    <g data-anchor="check" className={fcls(c, 'check')}>
      {g.foot.map((t, i) => (
        <text key={i} x={g.area.x} y={g.footY + 13 * i} className="fg-txt" style={{ fontSize: 11, fontWeight: 700 }} data-line={i}>
          {t}
        </text>
      ))}
    </g>
  )
}

function Legend({ c }: { c: Ctx }) {
  const { r, g } = c
  let x = 0
  let row = 0
  return (
    <g data-legend="surgery-lpu">
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

export function SurgeryLpuScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'surgery-graph'> & { state: ResolvedLpuGraph }) {
  const own = mode === 'print' || !!bare
  const g = lpuGeometry(r, width, height, own, slot)
  const c: Ctx = { r, g, focus }
  return (
    <g className="svgk-scene" data-kind="surgery-graph" data-source="lpu" data-code={r.code} data-mode={r.mode} data-measure={r.measure ?? undefined}>
      {g.lines.map((t, i) => (
        <Label key={i} at={{ x: 12, y: 15 + 13 * i }} cls="fg-lbl">
          {t}
        </Label>
      ))}
      {!own && (
        <text x={g.area.x} y={g.area.y - 4} className="fg-txt fg-big" style={{ fontSize: 14 }}>
          {lpuTitle(r)}
        </text>
      )}
      <Guides c={c} />
      <Links c={c} />
      <Dots c={c} />
      <Foot c={c} />
      <Legend c={c} />
    </g>
  )
}
