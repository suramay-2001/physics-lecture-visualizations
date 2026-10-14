/**
 * The `code` scene for a SURGERY source (B3, P-B3 S-d): two distance-d rotated patches A and B with the seam between them, drawn like the rotated patch of CodeSurfaceScene (checks as shaded faces and
 * half-discs, data qubits as discs) from the resolved surgery only (stage/svg/code.surgery.ts took every check, class and count from physics/qec/surgery.ts).
 *   separate  the two patches side by side (XX) or stacked (ZZ), the seam qubits faint and dashed between them, each labelled with what they are prepared in (0 for an XX merge, + for ZZ)
 *   merged    one big patch: the seam qubits solid. Checks are plain (their X / Z hue); with `new` the d + 1 new checks are lit (cobalt), with `widened` the old boundary checks that grew are outlined
 *             (dashed amber) and the others go grey; `product` outlines the new checks and writes that the product of the new checks is the logical product that is measured (letters on its support)
 *   split     the seam qubits struck through (read out), the two patches alone again
 * `seam` rings the seam qubits in every step. One seeded outcome is NEVER drawn: the picture shows which checks exist, not a run (the fidelity note says so).
 */
import type { ReactNode } from 'react'
import type { SvgMode, SvgSceneProps } from '../svgKinds'
import type { ResolvedCode, ResolvedCodeSurgery, ResolvedSurgeryCheck } from '../types'
import { packLines, wrapLine } from './CodeScene'
import { pauliColor } from './CodeSurfaceScene'
import { Label, scripted, type Pt } from './draw'
import { surgeryReadouts } from './code.surgery'

const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x))
const f1 = (v: number): string => v.toFixed(1)

export interface SurgerySceneGeometry {
  area: { x: number; y: number; w: number; h: number }
  /** Pixels per grid step and where grid point (column, row) lands. */
  unit: number
  at: (x: number, y: number) => Pt
  /** Radius of a data disc. */
  disc: number
  foot: string[]
  footY: number
  legendY: number
  legendRows: number
  lines: string[]
}

/** The text under the picture: what the product of the new checks is (when asked for) and where the seam is. */
export function surgeryFoot(s: ResolvedCodeSurgery): string[] {
  const out: string[] = []
  if (s.show.includes('product')) out.push(`product of the new checks = ${s.measured.name}`)
  return out.flatMap((t) => wrapLine(t, 52))
}

function legendItems(s: ResolvedCodeSurgery, mode: SvgMode): { w: number; node: (x: number, y: number) => ReactNode }[] {
  const items: { w: number; node: (x: number, y: number) => ReactNode }[] = []
  const swatch = (kind: 'X' | 'Z', t: string, w: number) => ({ w, node: (x: number, y: number) => (<><rect x={x} y={y - 9} width={10} height={9} style={{ fill: 'var(--fg-halo)', stroke: pauliColor(kind, mode) }} strokeWidth={1.8} /><text x={x + 15} y={y} className="fg-lbl">{t}</text></>) })
  items.push({ w: 70, node: (x, y) => (<><circle cx={x + 5} cy={y - 4} r={4.6} fill="var(--fg-halo)" className="fg-sil" strokeWidth={1.4} /><text x={x + 15} y={y} className="fg-lbl">qubit</text></>) })
  items.push(swatch('X', 'X check', 76), swatch('Z', 'Z check', 76))
  if (s.show.includes('new')) items.push({ w: 90, node: (x, y) => (<><rect x={x} y={y - 9} width={10} height={9} className="fg-minus-fill" fillOpacity={0.5} /><text x={x + 15} y={y} className="fg-lbl">new check</text></>) })
  if (s.show.includes('widened')) items.push({ w: 100, node: (x, y) => (<><rect x={x} y={y - 9} width={10} height={9} fill="none" className="fg-plus" strokeWidth={1.8} strokeDasharray="3 2" /><text x={x + 15} y={y} className="fg-lbl">widened</text></>) })
  return items
}

function legendRowCount(s: ResolvedCodeSurgery, areaW: number, mode: SvgMode): number {
  let rows = 1
  let x = 0
  for (const it of legendItems(s, mode)) {
    if (x > 0 && x + it.w - 10 > areaW) {
      rows++
      x = 0
    }
    x += it.w
  }
  return rows
}

/** Where the picture goes in a drawing box (pure, so a test can check that nothing leaves the box or touches the text lines). */
export function surgeryGeometry(r: ResolvedCode, width: number, height: number, own: boolean, slot?: string | null, mode: SvgMode = 'stage'): SurgerySceneGeometry {
  const s = r.surgery!
  const readouts = surgeryReadouts(r)
  const lines = own ? [r.name, ...packLines([`step: ${s.step}`, ...readouts.map((x) => x.text)], 50)] : []
  const padX = own ? 12 : 24
  const paneTop = slot === 'top'
  const paneBottom = slot === 'bottom'
  const top = own ? 6 + 13 * lines.length + 6 : paneTop ? Math.max(60, 26 + 17 * readouts.length) : paneBottom ? 34 : Math.max(112, 26 + 17 * readouts.length)
  const bottom = own ? 6 : paneTop ? 14 : 92
  const area = { x: padX, y: top + (own ? 0 : 20), w: Math.max(80, width - 2 * padX), h: Math.max(60, height - top - bottom - (own ? 0 : 20)) }
  const foot = surgeryFoot(s)
  const legendRows = legendRowCount(s, area.w, mode)
  const legendH = 7 + 13 * legendRows
  const footH = foot.length ? 13 * foot.length + 6 : 0
  // room (in pixels) for a half-disc beyond the grid, the seam's label above (XX) or beside (ZZ) the grid
  const zz = s.product === 'ZZ'
  const margin = 0.62
  const sideRoom = zz ? 54 : 0
  const topRoom = zz ? 0 : 16
  const W = s.cols - 1 + 2 * margin
  const H = s.rows - 1 + 2 * margin
  const availW = area.w - sideRoom
  const availH = area.h - legendH - footH - 6 - topRoom
  const unit = clamp(Math.min(availW / W, availH / H), 4, 62)
  const ox = area.x + (availW - (s.cols - 1) * unit) / 2
  const oy = area.y + topRoom + (availH - (s.rows - 1) * unit) / 2
  return {
    area,
    unit,
    at: (x, y) => ({ x: ox + x * unit, y: oy + y * unit }),
    disc: clamp(unit * 0.2, 3, 10),
    foot,
    footY: area.y + area.h - legendH - footH + 11,
    legendY: area.y + area.h - 4 - 13 * (legendRows - 1),
    legendRows,
    lines,
  }
}

interface Ctx {
  r: ResolvedCode
  s: ResolvedCodeSurgery
  g: SurgerySceneGeometry
  mode: SvgMode
  focus: string | null | undefined
}
const fcls = (c: Ctx, a: string): string | undefined => (c.focus === a ? 'svgk-focus' : undefined)

/** The corners of a face in drawing order (sorted by angle about their centroid). */
function ringOf(points: Pt[]): Pt[] {
  const cx = points.reduce((a, p) => a + p.x, 0) / points.length
  const cy = points.reduce((a, p) => a + p.y, 0) / points.length
  return [...points].sort((p, q) => Math.atan2(p.y - cy, p.x - cx) - Math.atan2(q.y - cy, q.x - cx))
}

function Face({ ch, c }: { ch: ResolvedSurgeryCheck; c: Ctx }) {
  const { s, g, mode } = c
  const pts = ch.qubits.map((q) => g.at(s.qubits[q].x, s.qubits[q].y))
  let d: string
  if (pts.length === 2) {
    const [a, b] = pts
    const apex = g.at(ch.center[0], ch.center[1])
    const rad = Math.hypot(b.x - a.x, b.y - a.y) / 2
    const cross = (b.x - a.x) * (apex.y - a.y) - (b.y - a.y) * (apex.x - a.x)
    d = `M${f1(a.x)},${f1(a.y)} A${f1(rad)},${f1(rad)} 0 0 ${cross > 0 ? 0 : 1} ${f1(b.x)},${f1(b.y)} Z`
  } else d = `M${ringOf(pts).map((q) => `${f1(q.x)},${f1(q.y)}`).join(' L')} Z`
  const hue = pauliColor(ch.kind, mode)
  const showNew = s.show.includes('new')
  const showWidened = s.show.includes('widened')
  const classed = showNew || showWidened
  const isNew = ch.cls === 'new'
  const isWide = ch.cls === 'widened'
  const grey = classed && !(isNew && showNew) && !(isWide && showWidened)
  const outlined = s.show.includes('product') && isNew
  return (
    <g role="img" aria-label={ch.aria} data-check={ch.index} data-class={ch.cls} data-kind={ch.kind}>
      <title>{ch.aria}</title>
      <path d={d} style={{ fill: grey ? 'var(--fg-sil)' : hue }} opacity={grey ? 0.1 : 0.2} stroke="none" />
      {isNew && showNew && <path d={d} className="fg-minus-fill" opacity={0.45} stroke="none" />}
      <path d={d} fill="none" style={{ stroke: isNew && showNew ? 'var(--fg-minus)' : grey ? 'var(--fg-sil)' : hue }} opacity={grey ? 0.5 : isNew && showNew ? 1 : 0.7} strokeWidth={isNew && showNew ? 2.2 : 1} />
      {isWide && showWidened && <path d={d} fill="none" className="fg-plus" strokeWidth={2.6} strokeDasharray="5 3" data-widened="1" />}
      {outlined && <path d={d} fill="none" className="fg-state" strokeWidth={3} data-product="1" />}
    </g>
  )
}

function SeamQubit({ q, p, c }: { q: ResolvedCodeSurgery['qubits'][number]; p: Pt; c: Ctx }) {
  const { s, g } = c
  const rad = g.disc
  const fs = clamp(rad * 1.05, 5, 10)
  const step = s.step
  return (
    <g role="img" aria-label={q.aria} data-qubit={q.index} data-role="seam" data-step={step}>
      <title>{q.aria}</title>
      {s.show.includes('seam') && <circle cx={p.x} cy={p.y} r={rad + 3.4} fill="none" className="fg-plus" strokeWidth={1.8} strokeDasharray="3 2" data-seam="1" />}
      <circle cx={p.x} cy={p.y} r={rad} fill="var(--fg-halo)" className="fg-sil" strokeWidth={step === 'merged' ? 1.6 : 1.2} strokeDasharray={step === 'merged' ? undefined : '2.5 2'} opacity={step === 'merged' ? 1 : 0.7} />
      {step === 'separate' && (
        <text x={p.x} y={p.y + fs * 0.36} textAnchor="middle" className="fg-lbl" style={{ fontSize: fs, fontWeight: 700 }}>
          {s.seamPrep}
        </text>
      )}
      {step === 'split' && (
        <g data-readout="1">
          <line x1={p.x - rad * 0.8} y1={p.y - rad * 0.8} x2={p.x + rad * 0.8} y2={p.y + rad * 0.8} className="fg-plus" strokeWidth={1.8} />
          <line x1={p.x - rad * 0.8} y1={p.y + rad * 0.8} x2={p.x + rad * 0.8} y2={p.y - rad * 0.8} className="fg-plus" strokeWidth={1.8} />
        </g>
      )}
    </g>
  )
}

export function CodeSurgeryScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'code'>) {
  const s = r.surgery!
  const own = mode === 'print' || !!bare
  const g = surgeryGeometry(r, width, height, own, slot, mode)
  const c: Ctx = { r, s, g, mode, focus }
  const measured = new Set(s.show.includes('product') ? s.measured.qubits : [])
  const letterHue = pauliColor(s.measured.type, mode)
  const zz = s.product === 'ZZ'
  // the seam's label: above the seam column (XX) or beside the seam row (ZZ)
  const seamQ = s.qubits.filter((q) => q.role === 'seam')
  const seamLabel = s.step === 'split' ? 'read out' : 'seam'
  const firstSeam = g.at(seamQ[0].x, seamQ[0].y)
  const lastSeam = g.at(seamQ[seamQ.length - 1].x, seamQ[seamQ.length - 1].y)
  return (
    <g className="svgk-scene" data-kind="code" data-view="patch" data-code={r.id} data-source="surgery" data-step={s.step}>
      {g.lines.map((t, i) => (
        <Label key={i} at={{ x: 12, y: 15 + 13 * i }} cls="fg-lbl">
          {t}
        </Label>
      ))}
      {!own && (
        <text x={g.area.x} y={g.area.y - 6} className="fg-txt fg-big" style={{ fontSize: 14 }}>
          {r.name}
        </text>
      )}
      <g data-anchor="check" className={fcls(c, 'check')}>
        {s.checks.map((ch) => (
          <Face key={ch.index} ch={ch} c={c} />
        ))}
      </g>
      <g data-anchor="qubit" className={fcls(c, 'qubit')}>
        {s.qubits.map((q) => {
          const p = g.at(q.x, q.y)
          if (q.role === 'seam') return <SeamQubit key={q.index} q={q} p={p} c={c} />
          const letter = measured.has(q.index)
          return (
            <g key={q.index} role="img" aria-label={q.aria} data-qubit={q.index} data-role={q.role}>
              <title>{q.aria}</title>
              <circle cx={p.x} cy={p.y} r={g.disc} fill="var(--fg-halo)" className="fg-sil" strokeWidth={1.4} />
              {letter && (
                <text x={p.x} y={p.y + clamp(g.disc * 1.05, 5, 10) * 0.36} textAnchor="middle" style={{ fontSize: clamp(g.disc * 1.1, 5, 11), fontWeight: 800, fill: letterHue }}>
                  {s.measured.type}
                </text>
              )}
            </g>
          )
        })}
      </g>
      {s.step !== 'merged' || s.show.includes('seam') ? (
        <text x={zz ? lastSeam.x + g.unit * 0.62 + 6 : firstSeam.x} y={zz ? firstSeam.y + 4 : firstSeam.y - g.unit * 0.62 - 4} textAnchor={zz ? 'start' : 'middle'} className="fg-lbl" style={{ fontSize: 11 }} data-label="seam">
          {seamLabel}
        </text>
      ) : null}
      <g data-anchor="check">
        {g.foot.map((t, i) => (
          <text key={i} x={g.area.x} y={g.footY + 13 * i} className="fg-txt" style={{ fontSize: 11, fontWeight: 600 }} data-line={i}>
            {scripted(t)}
          </text>
        ))}
      </g>
      <g data-legend="code">
        {(() => {
          let x = 0
          let row = 0
          return legendItems(s, mode).map((it, i) => {
            if (x > 0 && x + it.w - 10 > g.area.w) {
              row++
              x = 0
            }
            const at = g.area.x + x
            x += it.w
            return <g key={i}>{it.node(at, g.legendY + 13 * row)}</g>
          })
        })()}
      </g>
    </g>
  )
}
