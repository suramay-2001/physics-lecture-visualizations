/**
 * The drawing of the `code` kind's B2 sources (stage/svg/code.bb.ts built every fact from physics/qec; this file only draws it):
 *   bb  'cells'   the ℓ × m torus of 2 × 2 cell blocks (R top-left, X top-right, Z bottom-left, L bottom-right; paper-tdg Fig. 3b): L qubits filled, R qubits hollow, X and Z checks as small
 *                 squares in the two letter hues. Overlays: the six edges of one `check` (near ones as lines, long ones as labelled stubs that end at a ringed qubit), the cells of a
 *                 `pattern` polynomial as ringed blocks, a `shift` as arrows.
 *       'layers'  one X and one Z check from the middle of the torus with their edges coloured by thickness-2 layer.
 *       'cycle'   the edges the depth-8 syndrome cycle uses in one round, as stubs from each check, with the clashing qubits ringed.
 *   bp  'beliefs' the Tanner graph of the 7-bit repetition code or the 3 × 3 toric code: bits filled when their belief says "flipped", ringed when the hard decision flips them, the error as
 *                 letters, the lit checks, the OSD-0 information set and answer.
 * Colour is a code (the hue of a letter is its Pauli; cobalt marks a −1 reading and a flagged bit; orchid marks operations). Positions are a drawing choice (fidelity `qc-code-layout`).
 */
import type { ReactNode } from 'react'
import type { SvgMode } from '../svgKinds'
import type { ResolvedBBEdge, ResolvedCode } from '../types'
import { letterColor, type CodeGeometry } from './CodeScene'
import { Arrow, Label, fix } from './draw'

export interface BBCtx {
  r: ResolvedCode
  g: CodeGeometry
  mode: SvgMode
  focus: string | null | undefined
  own: boolean
}
const fcls = (c: BBCtx, a: string): string | undefined => (c.focus === a ? 'svgk-focus' : undefined)
const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x))
const LAYER_CLS = ['fg-state', 'fg-op'] as const

/** A short text for an offset: "+3, −1". */
const delta = (d: readonly [number, number]): string => `${d[0] >= 0 ? '+' : '−'}${Math.abs(d[0])}, ${d[1] >= 0 ? '+' : '−'}${Math.abs(d[1])}`

/* ---------------------------------------------------------------- bb ---------------------------------------------------------------- */

function Blocks({ c }: { c: BBCtx }) {
  const { r, g, mode } = c
  const rad = g.disc
  const sq = g.sq
  const dim = r.view === 'cycle' || r.view === 'layers'
  return (
    <g data-anchor="cells" className={fcls(c, 'cells')} opacity={dim ? 0.85 : 1}>
      {r.checks.map((ch) => {
        const p = g.at(ch.x, ch.y)
        return <rect key={`c${ch.index}`} x={p.x - sq} y={p.y - sq} width={2 * sq} height={2 * sq} rx={0.8} style={{ fill: 'var(--fg-halo)', stroke: letterColor(ch.kind, mode) }} strokeWidth={1} />
      })}
      {r.qubits.map((q) => {
        const p = g.at(q.x, q.y)
        return q.family === 'L' ? <circle key={`q${q.index}`} cx={p.x} cy={p.y} r={rad} style={{ fill: 'var(--fg-sil)' }} /> : <circle key={`q${q.index}`} cx={p.x} cy={p.y} r={rad} fill="var(--fg-halo)" className="fg-state" strokeWidth={1.2} />
      })}
    </g>
  )
}

/** The edge from a check to its qubit: a line when the qubit is a near neighbour (or `full`), else a stub of fixed length toward the qubit, labelled with the offset when `label`. */
function EdgeMark({ e, c, cls, hue, full, label, stubLen }: { e: ResolvedBBEdge; c: BBCtx; cls?: string; hue?: string; full: boolean; label: boolean; stubLen: number }) {
  const { g, r } = c
  const a = g.at(e.from[0], e.from[1])
  const b = g.at(e.to[0], e.to[1])
  const dist = Math.hypot(b.x - a.x, b.y - a.y)
  const target = r.qubits[e.qubit]
  const tp = g.at(target.x, target.y)
  const sty = hue ? { stroke: hue } : undefined
  if (full || !e.long) return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={cls} style={sty} strokeWidth={e.long ? 1.4 : 1.8} />
  const len = Math.min(dist, stubLen)
  const ux = (b.x - a.x) / (dist || 1)
  const uy = (b.y - a.y) / (dist || 1)
  const end = { x: a.x + ux * len, y: a.y + uy * len }
  return (
    <g>
      <line x1={a.x} y1={a.y} x2={end.x} y2={end.y} className={cls} style={sty} strokeWidth={1.8} strokeDasharray="3 2" />
      <circle cx={tp.x} cy={tp.y} r={g.disc + 2.6} fill="none" className={cls} style={sty} strokeWidth={1.4} strokeDasharray="2 2" />
      {label && (
        <Label at={{ x: end.x + (ux >= 0 ? 3 : -3), y: end.y + (uy >= 0 ? 10 : -4) }} anchor={ux >= 0 ? 'start' : 'end'} cls="fg-lbl">
          {delta(e.delta)}
        </Label>
      )}
    </g>
  )
}

/** P1: the support of the paper's logical operators on the cells: X-type in the X hue, Z-type in the Z hue, a qubit in both (a Y there) the X hue with a Z-hue ring. */
function PaperOpsMarks({ c }: { c: BBCtx }) {
  const { r, g, mode } = c
  const P = r.bbx!.paperOps!
  const hueX = letterColor('X', mode)
  const hueZ = letterColor('Z', mode)
  const dot = g.disc * 1.4 + 0.7
  const name = (type: string, qs: readonly number[]): string => `${type}: ${qs.length} qubit${qs.length === 1 ? '' : 's'}`
  const xs = P.ops.filter((o) => o.type === 'X').map((o) => o.label)
  const zs = P.ops.filter((o) => o.type === 'Z').map((o) => o.label)
  const at = (q: number) => g.at(r.qubits[q].x, r.qubits[q].y)
  return (
    <g data-anchor="logical" className={fcls(c, 'logical')} data-paper-ops={P.ops.map((o) => o.name).join(' ')}>
      <g role="img" aria-label={name(`support of ${xs.join(' and ')} only`, P.xOnly)} data-set="x">
        {P.xOnly.map((q) => (
          <circle key={q} cx={at(q).x} cy={at(q).y} r={dot} style={{ fill: hueX }} data-qubit={q} />
        ))}
      </g>
      <g role="img" aria-label={name(`support of ${zs.join(' and ')} only`, P.zOnly)} data-set="z">
        {P.zOnly.map((q) => (
          <circle key={q} cx={at(q).x} cy={at(q).y} r={dot} style={{ fill: hueZ }} data-qubit={q} />
        ))}
      </g>
      <g role="img" aria-label={name('in both (a Y there)', P.both)} data-set="both">
        {P.both.map((q) => (
          <g key={q} data-qubit={q}>
            <circle cx={at(q).x} cy={at(q).y} r={dot} style={{ fill: hueX }} />
            <circle cx={at(q).x} cy={at(q).y} r={dot + 2.4} fill="none" style={{ stroke: hueZ }} strokeWidth={1.6} />
          </g>
        ))}
      </g>
    </g>
  )
}

function CellsOverlay({ c }: { c: BBCtx }) {
  const { r, g } = c
  const b = r.bbx!
  const rings = b.pattern?.cells ?? []
  const half = 0.5
  return (
    <>
      {b.paperOps && <PaperOpsMarks c={c} />}
      {b.pattern && (
        <g data-anchor="pattern" className={fcls(c, 'pattern')}>
          {rings.map(([i, j], k) => {
            const a = g.at(2 * i - half, -(2 * j + 1 + half))
            const z = g.at(2 * i + 1 + half, -(2 * j - half))
            return <rect key={k} x={a.x} y={a.y} width={z.x - a.x} height={z.y - a.y} rx={2} fill="none" className="fg-op" strokeWidth={1.8} />
          })}
          {(() => {
            const [i, j] = b.pattern.anchor
            const a = g.at(2 * i - half, -(2 * j + 1 + half))
            const z = g.at(2 * i + 1 + half, -(2 * j - half))
            return <rect x={a.x - 2} y={a.y - 2} width={z.x - a.x + 4} height={z.y - a.y + 4} rx={3} fill="none" className="fg-sil" strokeWidth={1.2} strokeDasharray="3 2" />
          })()}
        </g>
      )}
      {b.focus && (
        <g data-anchor="check-edges" className={fcls(c, 'check-edges')}>
          {r.bbx!.edges.map((e, k) => (
            <EdgeMark key={k} e={e} c={c} cls={e.long && b.focus!.longLabels ? 'fg-op' : undefined} hue={e.long && b.focus!.longLabels ? undefined : letterColor(e.kind, c.mode)} full={false} label={b.focus!.longLabels} stubLen={Math.max(14, g.unit * 1.6)} />
          ))}
          {(() => {
            const first = r.bbx!.edges[0]
            if (!first) return null
            const p = g.at(first.from[0], first.from[1])
            return <circle cx={p.x} cy={p.y} r={g.sq + 3} fill="none" className="fg-txt" strokeWidth={1.4} />
          })()}
        </g>
      )}
      {b.shift && (
        <g data-anchor="shift" className={fcls(c, 'shift')}>
          {b.shift.samples.map((s, k) => (
            <Arrow key={k} a={g.at(s.from[0], s.from[1])} b={g.at(s.to[0], s.to[1])} cls="fg-op" width={1.5} head={6} />
          ))}
        </g>
      )}
    </>
  )
}

function LayersOverlay({ c }: { c: BBCtx }) {
  const { r } = c
  return (
    <g data-anchor="layers" className={fcls(c, 'layers')}>
      {r.bbx!.edges.map((e, k) => (
        <g key={k} opacity={e.kind === 'X' ? 1 : 0.9}>
          <EdgeMark e={e} c={c} cls={LAYER_CLS[e.layer ?? 0]} full label={false} stubLen={0} />
        </g>
      ))}
    </g>
  )
}

function CycleOverlay({ c }: { c: BBCtx }) {
  const { r, g, mode } = c
  const b = r.bbx!
  const clash = new Set(b.cycle!.clashQubits)
  return (
    <g data-anchor="cycle" className={fcls(c, 'cycle')}>
      {b.edges.map((e, k) => {
        const a = g.at(e.from[0], e.from[1])
        const t = g.at(e.to[0], e.to[1])
        const d = Math.hypot(t.x - a.x, t.y - a.y) || 1
        const len = Math.min(d, Math.max(5, g.unit * 0.95))
        return <line key={k} x1={a.x} y1={a.y} x2={a.x + ((t.x - a.x) / d) * len} y2={a.y + ((t.y - a.y) / d) * len} style={{ stroke: letterColor(e.kind, mode) }} strokeWidth={1.5} opacity={0.9} />
      })}
      {[...clash].map((q) => {
        const p = g.at(r.qubits[q].x, r.qubits[q].y)
        return <circle key={`cl${q}`} cx={p.x} cy={p.y} r={g.disc + 2.6} fill="none" className="fg-minus" strokeWidth={1.6} />
      })}
    </g>
  )
}

function BBLegend({ c }: { c: BBCtx }) {
  const { r, g, mode } = c
  const b = r.bbx!
  const y = g.area.y + g.area.h - 6
  const items: { w: number; node: (x: number) => ReactNode }[] = [
    { w: 74, node: (x) => (<><circle cx={x + 5} cy={y - 4} r={4.2} style={{ fill: 'var(--fg-sil)' }} /><text x={x + 14} y={y} className="fg-lbl">L qubit</text></>) },
    { w: 74, node: (x) => (<><circle cx={x + 5} cy={y - 4} r={4.2} fill="var(--fg-halo)" className="fg-state" strokeWidth={1.3} /><text x={x + 14} y={y} className="fg-lbl">R qubit</text></>) },
    { w: 70, node: (x) => (<><rect x={x} y={y - 9} width={9} height={9} style={{ fill: 'var(--fg-halo)', stroke: letterColor('X', mode) }} strokeWidth={1.8} /><text x={x + 14} y={y} className="fg-lbl">X check</text></>) },
    { w: 70, node: (x) => (<><rect x={x} y={y - 9} width={9} height={9} style={{ fill: 'var(--fg-halo)', stroke: letterColor('Z', mode) }} strokeWidth={1.8} /><text x={x + 14} y={y} className="fg-lbl">Z check</text></>) },
  ]
  if (b.layers)
    items.push({ w: 100, node: (x) => (<><line x1={x} y1={y - 4} x2={x + 12} y2={y - 4} className="fg-state" strokeWidth={2} /><text x={x + 16} y={y} className="fg-lbl">layer 1</text></>) }, { w: 70, node: (x) => (<><line x1={x} y1={y - 4} x2={x + 12} y2={y - 4} className="fg-op" strokeWidth={2} /><text x={x + 16} y={y} className="fg-lbl">layer 2</text></>) })
  if (b.focus?.longLabels) items.push({ w: 90, node: (x) => (<><line x1={x} y1={y - 4} x2={x + 12} y2={y - 4} className="fg-op" strokeWidth={2} strokeDasharray="3 2" /><text x={x + 16} y={y} className="fg-lbl">long edge</text></>) })
  if (b.cycle && b.cycle.clashQubits.length) items.push({ w: 90, node: (x) => (<><circle cx={x + 5} cy={y - 4} r={5} fill="none" className="fg-minus" strokeWidth={1.6} /><text x={x + 14} y={y} className="fg-lbl">used twice</text></>) })
  let x = g.area.x
  // P1: the marks of the paper's operators get a second legend row above the first
  const P = b.paperOps
  const ops: { w: number; node: (x: number) => ReactNode }[] = []
  if (P) {
    const yy = y - 14
    const xs = P.ops.filter((o) => o.type === 'X').map((o) => o.label)
    const zs = P.ops.filter((o) => o.type === 'Z').map((o) => o.label)
    if (xs.length) ops.push({ w: 24 + 7 * xs.join(' ').length, node: (x) => (<><circle cx={x + 5} cy={yy - 4} r={4.6} style={{ fill: letterColor('X', mode) }} /><text x={x + 14} y={yy} className="fg-lbl">{xs.join(' ')}</text></>) })
    if (zs.length) ops.push({ w: 24 + 7 * zs.join(' ').length, node: (x) => (<><circle cx={x + 5} cy={yy - 4} r={4.6} style={{ fill: letterColor('Z', mode) }} /><text x={x + 14} y={yy} className="fg-lbl">{zs.join(' ')}</text></>) })
    if (P.both.length) ops.push({ w: 110, node: (x) => (<><circle cx={x + 6} cy={yy - 4} r={4.6} style={{ fill: letterColor('X', mode) }} /><circle cx={x + 6} cy={yy - 4} r={7} fill="none" style={{ stroke: letterColor('Z', mode) }} strokeWidth={1.5} /><text x={x + 18} y={yy} className="fg-lbl">in both: a Y</text></>) })
  }
  let x2 = g.area.x
  return (
    <g data-legend="code">
      {items.map((it, i) => {
        const node = it.node(x)
        x += it.w
        return <g key={i}>{node}</g>
      })}
      {ops.map((it, i) => {
        const node = it.node(x2)
        x2 += it.w
        return <g key={`o${i}`}>{node}</g>
      })}
    </g>
  )
}

export function BBView({ c }: { c: BBCtx }) {
  const { r } = c
  return (
    <g>
      <Blocks c={c} />
      {r.view === 'cells' && <CellsOverlay c={c} />}
      {r.view === 'layers' && <LayersOverlay c={c} />}
      {r.view === 'cycle' && <CycleOverlay c={c} />}
      <BBLegend c={c} />
    </g>
  )
}

/* ---------------------------------------------------------------- bp ---------------------------------------------------------------- */

export function BPView({ c }: { c: BBCtx }) {
  const { r, g, mode } = c
  const b = r.bpx!
  const rad = g.disc
  const sq = Math.max(5, g.sq)
  const showNums = b.code === 'rep7' && g.unit >= 36
  const fs = clamp(rad * 1.1, 8, 14)
  return (
    <g>
      {b.segments.length > 0 && (
        <g data-anchor="lattice">
          {b.segments.map((s) => {
            const a = g.at(s.a[0], s.a[1])
            const z = g.at(s.b[0], s.b[1])
            return <line key={s.bit} x1={a.x} y1={a.y} x2={z.x} y2={z.y} className="fg-sil3" strokeWidth={1.2} />
          })}
        </g>
      )}
      <g data-anchor="check" className={fcls(c, 'check')}>
        {b.code === 'rep7' &&
          b.checks.map((ch) =>
            ch.bits.map((bit) => {
              const p = g.at(ch.x, ch.y)
              const q = g.at(b.bits[bit].x, b.bits[bit].y)
              return <line key={`${ch.index}-${bit}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} style={{ stroke: letterColor('Z', mode) }} strokeWidth={1.3} opacity={0.7} />
            }),
          )}
        {b.checks.map((ch) => {
          const p = g.at(ch.x, ch.y)
          return (
            <g key={ch.index} role="img" aria-label={`check ${ch.index}${ch.lit ? ' reads −1' : ''}`} data-lit={ch.lit ? 1 : 0}>
              {ch.lit && <rect x={p.x - sq - 3} y={p.y - sq - 3} width={2 * sq + 6} height={2 * sq + 6} rx={3} fill="none" className="fg-minus" strokeWidth={1.8} />}
              <rect x={p.x - sq} y={p.y - sq} width={2 * sq} height={2 * sq} rx={1.5} style={{ fill: 'var(--fg-halo)', stroke: letterColor('Z', mode) }} strokeWidth={1.6} />
              {ch.lit && (
                <text x={p.x} y={p.y + 3.5} textAnchor="middle" className="fg-minus-t" style={{ fontSize: 9, fontWeight: 700 }}>
                  {'−1'}
                </text>
              )}
            </g>
          )
        })}
      </g>
      <g data-anchor="bits" className={fcls(c, 'bits')}>
        {b.bits.map((bit) => {
          const p = g.at(bit.x, bit.y)
          const flagged = bit.marginal <= 0
          return (
            <g key={bit.index} role="img" aria-label={`bit ${bit.index}: belief ${fix(bit.marginal, 2)}${bit.hard ? ', flagged' : ''}${bit.error ? ', truly flipped' : ''}`} data-flagged={bit.hard ? 1 : 0}>
              {bit.infoSet && <rect x={p.x - rad - 4} y={p.y - rad - 4} width={2 * rad + 8} height={2 * rad + 8} rx={3} fill="none" className="fg-sil" strokeWidth={1.2} strokeDasharray="3 2" />}
              <circle cx={p.x} cy={p.y} r={rad} fill={flagged ? undefined : 'var(--fg-halo)'} className={flagged ? 'fg-minus-fill' : 'fg-sil'} strokeWidth={flagged ? 0 : 1.4} />
              {bit.hard && <circle cx={p.x} cy={p.y} r={rad + 3} fill="none" className="fg-txt" strokeWidth={1.8} />}
              {bit.error && (
                <text x={p.x} y={p.y + fs * 0.36} textAnchor="middle" style={{ fontSize: fs, fontWeight: 800, fill: flagged ? 'var(--fg-halo)' : letterColor('X', mode) }}>
                  X
                </text>
              )}
              {bit.osd && (
                <text x={p.x} y={p.y - rad - 6} textAnchor="middle" className="fg-op-fill" style={{ fontSize: Math.max(9, fs - 1), fontWeight: 800 }}>
                  X
                </text>
              )}
              {showNums && (
                <text x={p.x} y={p.y + rad + 15} textAnchor="middle" className="fg-lbl" style={{ fontSize: 10 }}>
                  {fix(bit.marginal, 2).replace('-', '−')}
                </text>
              )}
            </g>
          )
        })}
      </g>
      <BPLegend c={c} />
    </g>
  )
}

function BPLegend({ c }: { c: BBCtx }) {
  const { r, g, mode } = c
  const b = r.bpx!
  const y = g.area.y + g.area.h - 6
  const items: { w: number; node: (x: number) => ReactNode }[] = [
    { w: 100, node: (x) => (<><circle cx={x + 5} cy={y - 4} r={4.4} className="fg-minus-fill" /><text x={x + 14} y={y} className="fg-lbl">belief: flipped</text></>) },
    { w: 70, node: (x) => (<><circle cx={x + 5} cy={y - 4} r={4.4} fill="var(--fg-halo)" className="fg-sil" strokeWidth={1.4} /><text x={x + 14} y={y} className="fg-lbl">fine</text></>) },
    { w: 110, node: (x) => (<><circle cx={x + 5} cy={y - 4} r={6} fill="none" className="fg-txt" strokeWidth={1.8} /><text x={x + 16} y={y} className="fg-lbl">hard: flipped</text></>) },
    { w: 90, node: (x) => (<><text x={x} y={y} style={{ fill: letterColor('X', mode), fontWeight: 800, fontSize: 12 }}>X</text><text x={x + 12} y={y} className="fg-lbl">true flip</text></>) },
  ]
  if (b.osd) items.push({ w: 90, node: (x) => (<><text x={x} y={y} className="fg-op-fill" style={{ fontWeight: 800, fontSize: 12 }}>X</text><text x={x + 12} y={y} className="fg-lbl">OSD-0</text></>) })
  let x = g.area.x
  return (
    <g data-legend="code">
      {items.map((it, i) => {
        const node = it.node(x)
        x += it.w
        return <g key={i}>{node}</g>
      })}
    </g>
  )
}
