/**
 * The `code` scene's pieces for the toric / rotated / planar sources (P-B1-story §9.2 K-C): the 'torus' view and the 'patch' view, and the marks the three views share (the
 * fault's letters, an operator's and a second operator's, the qubits in both, the schedule's clashes). Drawn from the resolved code only (stage/svg/code.surface.ts took every
 * check, syndrome, operator, overlap and step from physics/qec). CodeScene.tsx dispatches here; the Tanner-graph 'layout' reuses its own LayoutScene with these marks.
 *   torus   edge qubits (discs) at the edge midpoints of a wrapped L × M grid; stars (X checks) as small squares at the vertices and plaquettes (Z checks) at the face centres,
 *           in the X and Z hues; arrows at the borders show where an edge wraps round; a lit check is a cobalt square with a ring (it reads −1)
 *   patch   data qubits on the engine's grid. Rotated: the checks are shaded faces (weight 4) and half-discs on the boundary (weight 2). Planar: the checks are squares on the
 *           staggered grid with a line to each qubit. With a schedule each check has numbered spokes (the engine's step order), and neighbouring X / Z pairs read in clashing
 *           order are outlined.
 * Colour is a code: a letter's hue is its Pauli (as the matrix tableau colours it), cobalt is a −1 reading, orchid marks the second operator and the flagged pairs.
 */
import type { ReactNode } from 'react'
import { phaseColor } from '../phaseHue'
import type { SvgMode } from '../svgKinds'
import type { ResolvedCode, ResolvedCodeCheck, ResolvedCodePlaquette, ResolvedCodeQubit } from '../types'
import type { CodeGeometry } from './CodeScene'
import { Arrow, type Pt } from './draw'
import { LETTER_ANGLE } from './MatrixScene'

const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x))
const f2 = (v: number): string => v.toFixed(1)

/** The fixed hue of a Pauli letter (the matrix tableau's). */
export function pauliColor(ch: string, mode: SvgMode): string {
  const a = LETTER_ANGLE[ch]
  return a === null || a === undefined ? 'var(--fg-sil)' : phaseColor(a, mode)
}

export interface SurfaceCtx {
  r: ResolvedCode
  g: CodeGeometry
  mode: SvgMode
  focus: string | null | undefined
}
const fcls = (c: SurfaceCtx, a: string): string | undefined => (c.focus === a ? 'svgk-focus' : undefined)

/** Dim a family of checks that a 'stars' / 'plaquettes' highlight leaves out. */
const dimmed = (c: SurfaceCtx, kind: 'X' | 'Z'): boolean => !!c.r.surface?.highlight && c.r.surface.highlight !== kind

/* ---------------------------------------------------------------- the marks the three views share ---------------------------------------------------------------- */

/**
 * The disc of a qubit with everything the overlays put on it: a fault fills the disc with its hue and writes the letter; an operator draws its letter in its hue with a ring; a second operator
 * a dashed orchid ring and (when it is alone) an orchid letter; qubits in both get a third ring; a schedule clash an amber ring. `index` writes the qubit's number when the disc has the room.
 */
export function QubitMark({ q, p, rad, mode, index, focus }: { q: ResolvedCodeQubit; p: Pt; rad: number; mode: SvgMode; index: boolean; focus?: string | null }) {
  const hit = q.error ? pauliColor(q.error, mode) : undefined
  const fs = clamp(rad * 1.15, 6.5, 15)
  const opLetter = q.operator ?? null
  const op2Letter = q.operator2 ?? null
  return (
    <g role="img" aria-label={q.aria} data-qubit={q.index} data-anchor={q.error ? 'fault' : undefined} className={q.error && focus === 'fault' ? 'svgk-focus' : undefined}>
      <title>{q.aria}</title>
      <circle cx={p.x} cy={p.y} r={rad} style={{ fill: hit ?? 'var(--fg-halo)' }} className={hit ? undefined : 'fg-sil'} strokeWidth={hit ? 0 : 1.4} />
      {hit ? (
        <text x={p.x} y={p.y + fs * 0.36} textAnchor="middle" style={{ fontSize: fs, fontWeight: 800, fill: 'var(--fg-halo)' }}>
          {q.error}
        </text>
      ) : opLetter ? (
        <text x={p.x} y={p.y + fs * 0.36} textAnchor="middle" style={{ fontSize: fs, fontWeight: 800, fill: pauliColor(opLetter, mode) }}>
          {opLetter}
        </text>
      ) : op2Letter ? (
        <text x={p.x} y={p.y + fs * 0.36} textAnchor="middle" className="fg-op-fill" style={{ fontSize: fs, fontWeight: 800 }}>
          {op2Letter}
        </text>
      ) : index ? (
        <text x={p.x} y={p.y + fs * 0.34} textAnchor="middle" className="fg-txt" style={{ fontSize: clamp(rad * 1.2, 6.5, 12), fontWeight: 600 }}>
          {q.label}
        </text>
      ) : null}
    </g>
  )
}

/** The rings around a qubit that is in an operator, in a second operator, in both, or where two checks clash (drawn over the discs). */
export function OperatorRings({ q, p, rad }: { q: ResolvedCodeQubit; p: Pt; rad: number }) {
  if (!q.operator && !q.operator2 && !q.clash) return null
  const both = !!(q.operator && q.operator2)
  return (
    <g data-anchor={q.clash && !q.operator && !q.operator2 ? 'schedule' : 'operator'}>
      {q.operator && <circle cx={p.x} cy={p.y} r={rad + 2.6} fill="none" className="fg-state" strokeWidth={2.2} />}
      {q.operator2 && <circle cx={p.x} cy={p.y} r={rad + (q.operator ? 5.4 : 2.6)} fill="none" className="fg-op" strokeWidth={2} strokeDasharray="4 2.5" />}
      {both && <circle cx={p.x} cy={p.y} r={rad + 8.2} fill="none" className="fg-plus" strokeWidth={2} />}
      {q.clash && <circle cx={p.x} cy={p.y} r={rad + 3.4} fill="none" className="fg-plus" strokeWidth={2.4} />}
    </g>
  )
}

/** A check's square: the check's hue as its outline, filled cobalt with a ring when it reads −1. */
function CheckBox({ ch, p, s, c, small }: { ch: ResolvedCodeCheck; p: Pt; s: number; c: SurfaceCtx; small: boolean }) {
  const hue = pauliColor(ch.kind, c.mode)
  const lit = ch.flipped === 1
  const showWeight = !!c.r.surface?.weights
  return (
    <g role="img" aria-label={ch.aria} data-check={ch.label} data-lit={ch.flipped ?? undefined} opacity={dimmed(c, ch.kind as 'X' | 'Z') ? 0.22 : 1}>
      <title>{ch.aria}</title>
      {lit && <rect x={p.x - s - 3} y={p.y - s - 3} width={2 * s + 6} height={2 * s + 6} rx={2} fill="none" className="fg-minus" strokeWidth={small ? 1.6 : 2.6} />}
      <rect x={p.x - s} y={p.y - s} width={2 * s} height={2 * s} rx={small ? 0.8 : 2} style={{ fill: lit ? 'var(--fg-minus)' : 'var(--fg-halo)', stroke: hue }} strokeWidth={small ? 1.2 : 2} />
      {showWeight && (
        <text x={p.x + s + 2} y={p.y + s + 8} className="fg-lbl" style={{ fontSize: 9 }}>
          {ch.support.length}
        </text>
      )}
    </g>
  )
}

/* ---------------------------------------------------------------- the torus ---------------------------------------------------------------- */
const DIR: Record<'E' | 'W' | 'N' | 'S', [number, number]> = { E: [1, 0], W: [-1, 0], N: [0, -1], S: [0, 1] }

/** The margin around a torus tile, in layout units: room for the wrap arrows that leave its border. */
export const WRAP_MARGIN = 0.62
/** The length of a wrap arrow in pixels: about a third of a grid step, never so long that it leaves the margin. */
export const wrapLength = (unit: number, disc: number): number => Math.max(3, Math.min(clamp(unit * 0.34, 6, 24), WRAP_MARGIN * unit - disc - 3))

export function TorusView({ c }: { c: SurfaceCtx }) {
  const { r, g, mode } = c
  const s = r.surface!
  const [x0, y0, x1, y1] = s.frame!
  const A = g.at(x0, y0)
  const B = g.at(x1, y1)
  const rad = g.disc
  const sq = g.sq
  const hasLabel = rad >= 5.2
  const len = wrapLength(g.unit, rad)
  return (
    <g>
      <rect x={A.x} y={A.y} width={B.x - A.x} height={B.y - A.y} rx={3} fill="none" className="fg-sil3" strokeWidth={1} strokeDasharray="4 3" />
      {/* the lattice: a faint line along every row and column of the grid */}
      <g>
        {Array.from({ length: s.M }, (_, j) => {
          const a = g.at(x0, -j)
          const b = g.at(x1, -j)
          return <line key={`h${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="fg-sil3" strokeWidth={1} />
        })}
        {Array.from({ length: s.L }, (_, i) => {
          const a = g.at(i, y0)
          const b = g.at(i, y1)
          return <line key={`v${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="fg-sil3" strokeWidth={1} />
        })}
      </g>
      {/* where an edge wraps round the torus */}
      <g data-anchor="wrap" className={fcls(c, 'wrap')}>
        {s.wraps.map((w, k) => {
          const p = g.at(w.x, w.y)
          const [dx, dy] = DIR[w.dir]
          const a = w.end === 'out' ? { x: p.x + dx * (rad + 2), y: p.y + dy * (rad + 2) } : { x: p.x - dx * len, y: p.y - dy * len }
          const b = w.end === 'out' ? { x: p.x + dx * (rad + 2 + len), y: p.y + dy * (rad + 2 + len) } : p
          return (
            <g key={k}>
              <title>{w.end === 'out' ? `edge qubit ${w.qubit}: this edge runs on past the border and wraps round` : `edge qubit ${w.qubit}: the edge comes in from the opposite border`}</title>
              <Arrow a={a} b={b} cls="fg-sil" width={1.2} head={5} dashed />
            </g>
          )
        })}
      </g>
      <g data-anchor="check" className={fcls(c, 'check')}>
        {r.checks.map((ch) => (
          <CheckBox key={ch.index} ch={ch} p={g.at(ch.x, ch.y)} s={sq} c={c} small />
        ))}
      </g>
      <g data-anchor="qubit" className={fcls(c, 'qubit')}>
        {r.qubits.map((q) => (
          <QubitMark key={q.index} q={q} p={g.at(q.x, q.y)} rad={rad} mode={mode} index={hasLabel && r.n <= 40} focus={c.focus} />
        ))}
      </g>
      <g data-anchor="operator" className={fcls(c, 'operator')}>
        {r.qubits.map((q) => (
          <OperatorRings key={q.index} q={q} p={g.at(q.x, q.y)} rad={rad} />
        ))}
      </g>
      <Legend c={c} />
    </g>
  )
}

/** The width a legend item takes: its swatch, its words and a gap. */
const lw = (t: string): number => 24 + Math.round(t.length * 6.3)

function legendItems(c: SurfaceCtx): { w: number; node: (x: number, y: number) => ReactNode }[] {
  const { r, mode } = c
  const s = r.surface!
  const items: { w: number; node: (x: number, y: number) => ReactNode }[] = []
  const square = (kind: 'X' | 'Z', t: string) => ({ w: lw(t), node: (x: number, y: number) => (<><rect x={x} y={y - 9} width={9} height={9} style={{ fill: 'var(--fg-halo)', stroke: pauliColor(kind, mode) }} strokeWidth={1.8} /><text x={x + 14} y={y} className="fg-lbl">{t}</text></>) })
  const qubitText = s.source === 'toric' ? 'edge qubit' : 'qubit'
  items.push({ w: lw(qubitText), node: (x, y) => (<><circle cx={x + 5} cy={y - 4} r={4.5} fill="var(--fg-halo)" className="fg-sil" strokeWidth={1.4} /><text x={x + 14} y={y} className="fg-lbl">{qubitText}</text></>) })
  if (s.source === 'toric') {
    items.push(square('X', 'star X'), square('Z', 'plaquette Z'))
    items.push({ w: lw('wraps'), node: (x, y) => (<><line x1={x} y1={y - 4} x2={x + 12} y2={y - 4} className="fg-sil" strokeWidth={1.2} strokeDasharray="3 2" /><text x={x + 16} y={y} className="fg-lbl">wraps</text></>) })
  } else {
    if (r.checks.some((k) => k.kind === 'X')) items.push(square('X', 'X check'))
    if (r.checks.some((k) => k.kind === 'Z')) items.push(square('Z', 'Z check'))
  }
  if (s.schedule) {
    items.push({ w: lw('step'), node: (x, y) => (<><circle cx={x + 5} cy={y - 4} r={5.5} fill="var(--fg-halo)" className="fg-sil" strokeWidth={1.2} /><text x={x + 16} y={y} className="fg-lbl">step</text></>) })
    if (s.schedule.violations.length) items.push({ w: lw('clash'), node: (x, y) => (<><rect x={x} y={y - 9} width={10} height={9} fill="none" className="fg-op" strokeWidth={1.8} strokeDasharray="3 2" /><text x={x + 15} y={y} className="fg-lbl">clash</text></>) })
  }
  return items
}

function Legend({ c }: { c: SurfaceCtx }) {
  const { g } = c
  const y = g.area.y + g.area.h - 6
  let x = g.area.x
  return (
    <g data-legend="code">
      {legendItems(c).map((it, i) => {
        const at = x
        x += it.w
        return <g key={i}>{it.node(at, y)}</g>
      })}
    </g>
  )
}

/* ---------------------------------------------------------------- the patch ---------------------------------------------------------------- */
function Face({ p, c }: { p: ResolvedCodePlaquette; c: SurfaceCtx }) {
  const { g, r, mode } = c
  const ch = r.checks[p.checks[0]]
  const pts = p.points.map(([x, y]) => g.at(x, y))
  const lit = ch.flipped === 1
  const hue = pauliColor(p.kind === 'XZ' ? 'I' : p.kind, mode)
  const flagged = !!ch.flagged
  let d: string
  if (p.apex && pts.length === 2) {
    const [a, b] = pts
    const apex = g.at(p.apex[0], p.apex[1])
    const rad = Math.hypot(b.x - a.x, b.y - a.y) / 2
    const cross = (b.x - a.x) * (apex.y - a.y) - (b.y - a.y) * (apex.x - a.x)
    d = `M${f2(a.x)},${f2(a.y)} A${f2(rad)},${f2(rad)} 0 0 ${cross > 0 ? 0 : 1} ${f2(b.x)},${f2(b.y)} Z`
  } else d = `M${pts.map((q) => `${f2(q.x)},${f2(q.y)}`).join(' L')} Z`
  const centre = g.at(ch.x, ch.y)
  const inner = p.apex ? { x: (pts[0].x + pts[1].x) / 2 + (centre.x - (pts[0].x + pts[1].x) / 2) * 0.45, y: (pts[0].y + pts[1].y) / 2 + (centre.y - (pts[0].y + pts[1].y) / 2) * 0.45 } : centre
  return (
    <g role="img" aria-label={ch.aria} data-check={ch.label} data-lit={ch.flipped ?? undefined} data-flagged={flagged ? 1 : undefined} opacity={dimmed(c, ch.kind as 'X' | 'Z') ? 0.22 : 1}>
      <title>{ch.aria}</title>
      <path d={d} style={{ fill: hue }} opacity={0.2} stroke="none" />
      {lit && <path d={d} className="fg-minus-fill" opacity={0.42} stroke="none" />}
      <path d={d} fill="none" style={{ stroke: lit ? 'var(--fg-minus)' : hue }} opacity={lit ? 1 : 0.7} strokeWidth={lit ? 2.2 : 1} />
      {flagged && <path d={d} fill="none" className="fg-op" strokeWidth={2.6} strokeDasharray="5 3" data-anchor="flagged" />}
      {c.r.surface?.weights && (
        <text x={inner.x} y={inner.y + 4} textAnchor="middle" className="fg-lbl" style={{ fontSize: clamp(g.unit * 0.3, 9, 14), fontWeight: 700 }}>
          {ch.support.length}
        </text>
      )}
    </g>
  )
}

/** The spokes of the schedule: from each face's centre toward the corner it touches, numbered by the engine's step. */
function Spokes({ c }: { c: SurfaceCtx }) {
  const { r, g } = c
  const badge = clamp(g.unit * 0.17, 5, 9)
  return (
    <g data-anchor="schedule" className={fcls(c, 'schedule')}>
      {r.checks.map((ch) => {
        if (!ch.steps) return null
        const from = g.at(ch.x, ch.y)
        return (
          <g key={ch.index} data-check-steps={ch.label}>
            {ch.steps.map((st) => {
              const q = r.qubits[st.qubit]
              const to = g.at(q.x, q.y)
              const dx = to.x - from.x
              const dy = to.y - from.y
              const L = Math.hypot(dx, dy) || 1
              // the number sits 38 % of the way out from the centre, the line runs to the disc's edge
              const nx = from.x + dx * 0.4
              const ny = from.y + dy * 0.4
              const ex = to.x - (dx / L) * g.disc
              const ey = to.y - (dy / L) * g.disc
              return (
                <g key={st.step}>
                  <line x1={from.x} y1={from.y} x2={ex} y2={ey} className="fg-sil" strokeWidth={1} opacity={0.8} />
                  <circle cx={nx} cy={ny} r={badge} fill="var(--fg-halo)" className="fg-sil" strokeWidth={1.1} />
                  <text x={nx} y={ny + badge * 0.4} textAnchor="middle" className="fg-txt" style={{ fontSize: badge * 1.35, fontWeight: 700 }}>
                    {st.step}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}
    </g>
  )
}

export function PatchView({ c }: { c: SurfaceCtx }) {
  const { r, g, mode } = c
  const s = r.surface!
  const rad = g.disc
  const rotated = s.source === 'rotated'
  const hasLabel = rad >= 5.5 && r.n <= 49
  return (
    <g>
      {rotated ? (
        <g data-anchor="check" className={fcls(c, 'check')}>
          {r.plaquettes.map((p, i) => (
            <Face key={i} p={p} c={c} />
          ))}
        </g>
      ) : (
        <>
          {/* the staggered grid: a thin line from each check square to every qubit it touches */}
          <g data-anchor="edge" className={fcls(c, 'edge')}>
            {r.checks.flatMap((ch) =>
              ch.support.map((q) => {
                const a = g.at(ch.x, ch.y)
                const b = g.at(r.qubits[q].x, r.qubits[q].y)
                return <line key={`${ch.index}-${q}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} style={{ stroke: pauliColor(ch.kind, mode) }} strokeWidth={1} opacity={dimmed(c, ch.kind as 'X' | 'Z') ? 0.12 : 0.55} />
              }),
            )}
          </g>
          <g data-anchor="check" className={fcls(c, 'check')}>
            {r.checks.map((ch) => (
              <CheckBox key={ch.index} ch={ch} p={g.at(ch.x, ch.y)} s={g.sq} c={c} small={false} />
            ))}
          </g>
        </>
      )}
      <g data-anchor="qubit" className={fcls(c, 'qubit')}>
        {r.qubits.map((q) => (
          <QubitMark key={q.index} q={q} p={g.at(q.x, q.y)} rad={rad} mode={mode} index={hasLabel} focus={c.focus} />
        ))}
      </g>
      {s.schedule && <Spokes c={c} />}
      <g data-anchor="operator" className={fcls(c, 'operator')}>
        {r.qubits.map((q) => (
          <OperatorRings key={q.index} q={q} p={g.at(q.x, q.y)} rad={rad} />
        ))}
      </g>
      <Legend c={c} />
    </g>
  )
}
