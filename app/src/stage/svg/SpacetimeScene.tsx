/**
 * The `spacetime` scene: ONE component for the live stage, the reading version and the print figure. It draws the resolved history only (stage/svg/spacetime.ts took every lit
 * detector, matching arc, weight and count from physics/qec/spacetime.ts).
 *   history   a lattice: columns are the checks (a boundary column at each side, dashed), rows are the rounds going UP (the top row is the final, ideal round). A faint line is a place a fault can
 *             happen: horizontal = a data qubit flips (orchid when it did), vertical = a readout is wrong (amber when it was). A lit detector is a filled cobalt disc (that check's reading changed
 *             since the round before). The matching is dashed arcs pairing the lit detectors, or a lit detector with a boundary (the LEFT boundary is the one that flips the logical bit).
 *             Rows later than the cursor are dimmed. Data-qubit numbers sit under the bottom row, between the checks they touch.
 *   spectrum  no lattice: for each fault weight w three bars (all fault sets, the sets the decoder gets wrong, the ties); the length is the logarithm of the count, which is written at the bar's end.
 * A position is a drawing choice (the passport says so: one space dimension plus time). Text is plain Unicode, and every lit detector and fault carries an accessible name.
 */
import type { SvgSceneProps } from '../svgKinds'
import type { ResolvedSpacetime } from '../types'
import { packLines } from './CodeScene'
import { Label } from './draw'
import { spacetimeReadouts, verdictText } from './spacetime'

const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x))
const f1 = (v: number): string => v.toFixed(1)

/** How far the boundary lines run past the first and last row. */
export const EXT = 8

export interface SpacetimeGeometry {
  /** The drawing area (inside the passport above and the caption below on the live stage). */
  area: { x: number; y: number; w: number; h: number }
  /** x of lattice column k (0 = the left boundary, 1 … n − 1 the checks, n the right boundary) and y of round t (1 at the bottom). */
  colX: (k: number) => number
  rowY: (t: number) => number
  dx: number
  dy: number
  /** Radius of a lit detector. */
  disc: number
  lines: string[]
}

export { packLines }

/** Where the picture goes in a drawing box (pure, so a test can check that nothing leaves the box or touches the text lines). */
export function spacetimeGeometry(r: ResolvedSpacetime, width: number, height: number, own: boolean, slot?: string | null): SpacetimeGeometry {
  const readouts = spacetimeReadouts(r)
  const title = `repetition code · ${r.n} qubits · ${r.rounds} round${r.rounds === 1 ? '' : 's'}`
  const lines = own ? [title, ...packLines(readouts.map((x) => x.text), 50)] : []
  const padX = own ? 12 : 24
  const paneTop = slot === 'top'
  const paneBottom = slot === 'bottom'
  const top = own ? 6 + 13 * lines.length + 6 : paneTop ? Math.max(60, 26 + 17 * readouts.length) : paneBottom ? 34 : Math.max(112, 26 + 17 * readouts.length)
  const bottom = own ? 6 : paneTop ? 14 : 92
  const area = { x: padX, y: top, w: Math.max(80, width - 2 * padX), h: Math.max(60, height - top - bottom) }
  // left room for the round labels, a strip below for the qubit numbers and the legend, a strip above for the final-round label
  const labelW = r.spectrum ? 0 : 52
  const below = EXT + 15 + 36
  const above = EXT + 14
  const cols = r.n // the n + 1 columns span n steps
  const rowsSpan = Math.max(1, r.rounds) // rounds + 1 rows span `rounds` steps
  const dx = clamp((area.w - labelW - 8) / cols, 10, 64)
  const dy = clamp((area.h - below - above) / rowsSpan, 12, 64)
  const x0 = area.x + labelW + (area.w - labelW - dx * cols) / 2
  const yBottom = area.y + above + (area.h - above - below - dy * rowsSpan) / 2 + dy * rowsSpan
  return {
    area,
    colX: (k) => x0 + dx * k,
    rowY: (t) => yBottom - dy * (t - 1),
    dx,
    dy,
    disc: clamp(Math.min(dx, dy) * 0.24, 3.5, 7.5),
    lines,
  }
}

/* ---------------------------------------------------------------- the history ---------------------------------------------------------------- */
interface Ctx {
  r: ResolvedSpacetime
  g: SpacetimeGeometry
  focus: string | null | undefined
}
const fcls = (c: Ctx, a: string): string | undefined => (c.focus === a ? 'svgk-focus' : undefined)

/** Where a detector sits. */
const detAt = (c: Ctx, index: number): { x: number; y: number } => {
  const d = c.r.detectors[index]
  return { x: c.g.colX(d.check + 1), y: c.g.rowY(d.t) }
}
const sideX = (c: Ctx, side: 'left' | 'right'): number => c.g.colX(side === 'left' ? 0 : c.r.n)
/** The opacity of a row: rounds later than the cursor are dimmed. */
const rowOpacity = (c: Ctx, t: number): number => (t <= c.r.cursor + 1e-9 ? 1 : 0.3)

/** The end points of an edge of the graph: a data edge joins the lattice columns q and q + 1 on its round's row; a readout edge joins the same check on two rows. */
function edgeEnds(c: Ctx, e: ResolvedSpacetime['edges'][number]): { a: { x: number; y: number }; b: { x: number; y: number } } {
  const { g } = c
  if (e.kind === 'data') return { a: { x: g.colX(e.at), y: g.rowY(e.t) }, b: { x: g.colX(e.at + 1), y: g.rowY(e.t) } }
  return { a: { x: g.colX(e.at + 1), y: g.rowY(e.t) }, b: { x: g.colX(e.at + 1), y: g.rowY(e.t + 1) } }
}

function Lattice({ c }: { c: Ctx }) {
  const { r, g } = c
  const showFaults = r.show.includes('faults')
  return (
    <g>
      {/* the two boundary columns */}
      <g data-anchor="boundary" className={fcls(c, 'boundary')}>
        {(['left', 'right'] as const).map((side) => (
          <g key={side} role="img" aria-label={side === 'left' ? 'left boundary: a path of faults that ends here flips the logical qubit' : 'right boundary: a path of faults that ends here leaves the logical qubit alone'}>
            <line x1={sideX(c, side)} y1={g.rowY(r.rounds + 1) - EXT} x2={sideX(c, side)} y2={g.rowY(1) + EXT} className="fg-sil" strokeWidth={1.6} strokeDasharray="5 4" />
            <Label at={{ x: sideX(c, side), y: g.rowY(r.rounds + 1) - EXT - 4 }} anchor={side === 'left' ? 'middle' : 'end'} cls="fg-lbl">
              {`${side} boundary`}
            </Label>
          </g>
        ))}
      </g>
      {/* every place a fault can happen, faint; a fault is a thick edge */}
      <g data-anchor="edge" className={fcls(c, 'edge')}>
        {r.edges.map((e, i) => {
          const { a, b } = edgeEnds(c, e)
          const t = e.kind === 'data' ? e.t : e.t + 1
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="fg-sil3" strokeWidth={1} opacity={rowOpacity(c, t)} />
        })}
      </g>
      {showFaults && (
        <g data-anchor="fault" className={fcls(c, 'fault')}>
          {r.edges.map((e, i) => {
            if (!e.fault) return null
            const { a, b } = edgeEnds(c, e)
            const t = e.kind === 'data' ? e.t : e.t + 1
            const name = e.kind === 'data' ? `data fault: qubit ${e.at}, round ${e.t}${e.obs ? ' (flips the logical bit)' : ''}` : `readout fault: check ${e.at}, round ${e.t}`
            return (
              <g key={i} role="img" aria-label={name} data-fault={e.kind} opacity={rowOpacity(c, t)}>
                <title>{name}</title>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={e.kind === 'data' ? 'fg-op' : 'fg-plus'} strokeWidth={3.6} strokeLinecap="round" />
              </g>
            )
          })}
        </g>
      )}
      {/* the matching, under the detectors */}
      {r.show.includes('matching') && r.arcs.length > 0 && (
        <g data-anchor="matching" className={fcls(c, 'matching')}>
          {r.arcs.map((a, i) => {
            const p = detAt(c, a.from)
            const q = typeof a.to === 'number' ? detAt(c, a.to) : { x: sideX(c, a.to), y: p.y }
            const mx = (p.x + q.x) / 2
            const my = (p.y + q.y) / 2
            const dxv = q.x - p.x
            const dyv = q.y - p.y
            const len = Math.hypot(dxv, dyv) || 1
            // bow the arc sideways by a fraction of its length so it does not lie on a fault edge or another arc
            const bow = clamp(len * 0.28, 7, 24)
            const cx = mx - (dyv / len) * bow
            const cy = my + (dxv / len) * bow
            const t = Math.max(c.r.detectors[a.from].t, typeof a.to === 'number' ? c.r.detectors[a.to].t : 0)
            return (
              <path
                key={i}
                d={`M${f1(p.x)},${f1(p.y)} Q${f1(cx)},${f1(cy)} ${f1(q.x)},${f1(q.y)}`}
                fill="none"
                className="fg-state"
                strokeWidth={2.3}
                strokeDasharray="5 3"
                strokeLinecap="round"
                opacity={rowOpacity(c, t)}
                data-arc={typeof a.to === 'number' ? 'pair' : a.to}
                data-weight={a.weight}
              />
            )
          })}
        </g>
      )}
      {/* the detectors: a small hollow node everywhere, a filled disc where lit */}
      <g data-anchor="detector" className={fcls(c, 'detector')}>
        {r.detectors.map((d) => {
          const p = detAt(c, d.index)
          const lit = d.lit && r.show.includes('detectors')
          return lit ? (
            <g key={d.index} role="img" aria-label={`lit detector: check ${d.check}, round ${d.t}`} data-lit="1" opacity={rowOpacity(c, d.t)}>
              <title>{`lit detector: check ${d.check}, round ${d.t}`}</title>
              <circle cx={p.x} cy={p.y} r={g.disc} className="fg-minus-fill" stroke="var(--fg-halo, transparent)" strokeWidth={1.4} />
            </g>
          ) : (
            <circle key={d.index} cx={p.x} cy={p.y} r={2.6} fill="var(--fg-halo, transparent)" className="fg-sil2" strokeWidth={1.2} opacity={rowOpacity(c, d.t)} aria-hidden="true" />
          )
        })}
      </g>
      {/* the axes: round labels at the left, qubit numbers under the bottom row */}
      <g>
        {Array.from({ length: r.rounds + 1 }, (_, i) => i + 1).map((t) => (
          <Label key={t} at={{ x: g.colX(0) - 10, y: g.rowY(t) + 4 }} anchor="end" cls="fg-lbl">
            {t === r.rounds + 1 ? `final ${t}` : `round ${t}`}
          </Label>
        ))}
        {Array.from({ length: r.n }, (_, q) => (
          <Label key={q} at={{ x: (g.colX(q) + g.colX(q + 1)) / 2, y: g.rowY(1) + EXT + 12 }} anchor="middle" cls="fg-lbl">
            {`q${q}`}
          </Label>
        ))}
      </g>
      {r.cursor < r.rounds + 1 && (
        <line x1={g.colX(0) - 4} y1={(g.rowY(Math.max(1, r.cursor)) + g.rowY(Math.max(1, r.cursor) + 1)) / 2 + (r.cursor < 1 ? g.dy : 0)} x2={g.colX(r.n) + 4} y2={(g.rowY(Math.max(1, r.cursor)) + g.rowY(Math.max(1, r.cursor) + 1)) / 2 + (r.cursor < 1 ? g.dy : 0)} className="fg-state" strokeWidth={1} strokeDasharray="2 3" opacity={0.7} />
      )}
    </g>
  )
}

function Legend({ c }: { c: Ctx }) {
  const { r, g } = c
  const y = g.area.y + g.area.h - 4
  const items: { w: number; node: React.ReactNode }[] = []
  if (r.show.includes('faults'))
    items.push({ w: 64, node: <><line x1={0} y1={y - 4} x2={11} y2={y - 4} className="fg-op" strokeWidth={3.4} strokeLinecap="round" /><text x={15} y={y} className="fg-lbl">data</text></> })
  if (r.show.includes('faults'))
    items.push({ w: 70, node: <><line x1={0} y1={y - 4} x2={11} y2={y - 4} className="fg-plus" strokeWidth={3.4} strokeLinecap="round" /><text x={15} y={y} className="fg-lbl">readout</text></> })
  if (r.show.includes('detectors')) items.push({ w: 74, node: <><circle cx={5} cy={y - 4} r={4.5} className="fg-minus-fill" /><text x={15} y={y} className="fg-lbl">lit event</text></> })
  if (r.show.includes('matching') && r.arcs.length) items.push({ w: 70, node: <><path d={`M0,${y - 4} Q5.5,${y - 10} 11,${y - 4}`} fill="none" className="fg-state" strokeWidth={2} strokeDasharray="4 2" /><text x={15} y={y} className="fg-lbl">matching</text></> })
  let x = g.area.x
  const verdict = r.show.includes('verdict') && r.verdict ? verdictText(r) : null
  return (
    <g data-legend="spacetime">
      {items.map((it, i) => {
        const at = x
        x += it.w
        return <g key={i} transform={`translate(${at},0)`}>{it.node}</g>
      })}
      {verdict && (
        <text x={g.area.x + g.area.w} y={y - 20} textAnchor="end" className="fg-txt" style={{ fontWeight: 700 }} data-anchor="verdict">
          {`${verdict.qubit} · ${verdict.decoder}`}
        </text>
      )}
    </g>
  )
}

/* ---------------------------------------------------------------- the spectrum ---------------------------------------------------------------- */
export interface SpectrumGeometry {
  /** x where the bars start and the longest bar's length; the height of one bar and of one group. */
  barX: number
  barW: number
  bh: number
  group: number
  y0: number
}

export function spectrumGeometry(r: ResolvedSpacetime, g: SpacetimeGeometry): SpectrumGeometry {
  const sp = r.spectrum!
  const labelW = 44
  const numW = 56
  const barX = g.area.x + labelW
  const barW = Math.max(30, g.area.w - labelW - numW)
  const head = 22
  const legend = 24
  const group = clamp((g.area.h - head - legend) / sp.rows.length, 24, 52)
  const bh = clamp((group - 8) / 3, 6, 13)
  return { barX, barW, bh, group, y0: g.area.y + head + Math.max(0, (g.area.h - head - legend - group * sp.rows.length) / 2) }
}

/** The length of a bar: the logarithm of the count over the logarithm of the biggest count (a bar for zero has no length). */
export const barLength = (count: number, biggest: number, barW: number): number => (count <= 0 ? 0 : (Math.log10(1 + count) / Math.log10(1 + Math.max(1, biggest))) * barW)

function SpectrumScene({ c }: { c: Ctx }) {
  const { r, g } = c
  const sp = r.spectrum!
  const G = spectrumGeometry(r, g)
  const biggest = Math.max(...sp.rows.map((x) => x.total))
  const kinds = [
    { key: 'total', text: 'all sets', cls: 'fg-sil-fill', pick: (x: (typeof sp.rows)[number]) => x.total },
    { key: 'fail', text: 'decoder wrong', cls: 'fg-minus-fill', pick: (x: (typeof sp.rows)[number]) => x.fail },
    { key: 'tie', text: 'tie', cls: 'fg-op-fill', pick: (x: (typeof sp.rows)[number]) => x.tie },
  ] as const
  return (
    <g data-anchor="bar" className={fcls(c, 'bar')}>
      <text x={g.area.x} y={g.area.y + 10} className="fg-lbl" style={{ fontSize: 11 }}>
        {`fault sets by weight w · bar length ~ log(count)`}
      </text>
      {sp.rows.map((row, i) => {
        const y = G.y0 + i * G.group
        return (
          <g key={row.w} data-weight={row.w}>
            <text x={g.area.x} y={y + G.bh * 1.6 + 2} className="fg-txt" style={{ fontWeight: 700 }}>{`w = ${row.w}`}</text>
            {kinds.map((k, j) => {
              const v = k.pick(row)
              const len = barLength(v, biggest, G.barW)
              const by = y + j * (G.bh + 1.5)
              return (
                <g key={k.key} role="img" aria-label={`weight ${row.w}: ${k.text} ${v} of ${row.total}`} data-bar={k.key}>
                  <title>{`weight ${row.w}: ${k.text} ${v} of ${row.total}`}</title>
                  <rect x={G.barX} y={by} width={Math.max(v > 0 ? 2 : 0, len)} height={G.bh} rx={1.5} className={k.cls} />
                  {v === 0 && <line x1={G.barX} y1={by} x2={G.barX} y2={by + G.bh} className="fg-sil2" strokeWidth={1.5} />}
                  <text x={G.barX + Math.max(2, len) + 5} y={by + G.bh - 1} className="fg-lbl" style={{ fontSize: Math.min(11, G.bh + 2) }}>
                    {v}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}
      <g data-legend="spacetime">
        {kinds.map((k, i) => (
          <g key={k.key} transform={`translate(${g.area.x + [0, 74, 192][i]},${g.area.y + g.area.h - 4})`}>
            <rect x={0} y={-9} width={10} height={9} className={k.cls} />
            <text x={14} y={0} className="fg-lbl">
              {k.text}
            </text>
          </g>
        ))}
      </g>
    </g>
  )
}

/* ---------------------------------------------------------------- the scene ---------------------------------------------------------------- */
export function SpacetimeScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'spacetime'>) {
  const own = mode === 'print' || !!bare
  const g = spacetimeGeometry(r, width, height, own, slot)
  const c: Ctx = { r, g, focus }
  return (
    <g className="svgk-scene" data-kind="spacetime" data-view={r.spectrum ? 'spectrum' : 'history'}>
      {g.lines.map((t, i) => (
        <Label key={i} at={{ x: 12, y: 15 + 13 * i }} cls="fg-lbl">
          {t}
        </Label>
      ))}
      {!own && (
        <text x={g.area.x} y={g.area.y - 4} className="fg-txt fg-big" style={{ fontSize: 14 }}>
          {/* short enough to sit left of the readout tags (they stack down the right of the box) */}
          {r.spectrum ? 'sets that fool it' : `${r.n} qubits · ${r.rounds} round${r.rounds === 1 ? '' : 's'}`}
        </text>
      )}
      {r.spectrum ? (
        <SpectrumScene c={c} />
      ) : (
        <>
          <Lattice c={c} />
          <Legend c={c} />
        </>
      )}
    </g>
  )
}
