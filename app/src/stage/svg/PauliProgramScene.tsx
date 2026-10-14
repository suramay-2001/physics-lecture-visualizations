/**
 * The `pauli-program` scene: ONE component for the live stage, the reading version and the print figure. It draws the resolved program only (stage/svg/pauliProgram.ts took the columns and the counts).
 *   wires    horizontal lines left to right, each with its label (default 1 … n); time runs along them.
 *   column   one operation: the Pauli letters it puts on the wires it touches (I left out), in the tableau's fixed letter hues (X, Y, Z), joined by a vertical rule to its symbol above the wires.
 *            A rotation is a circle (outlined = Clifford ±π/2, filled = T-like ±π/4) with its angle written above; a measurement is a meter box (its outcome sign inside when authored);
 *            an injection is a dashed box (its outcomes above) whose rule runs on down to a diamond on the magic lane.
 *   lane     a dashed strip under the wires, labelled as drawn for reading and not a wire of the program.
 *   upTo     columns after the first `upTo` are dimmed, with a dashed cursor line between.
 * Where a column sits is a drawing choice (the passport says so). Text is plain Unicode; every column and wire carries an accessible name. Angle labels stagger over up to three rows when the columns are close.
 */
import type { SvgSceneProps } from '../svgKinds'
import type { ResolvedPauliProgram, ResolvedProgramColumn } from '../types'
import { packLines } from './CodeScene'
import { Label } from './draw'
import { Letter } from './MatrixScene'
import { columnName, outcomeSign, pauliProgramReadouts } from './pauliProgram'

const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x))
const f1 = (v: number): string => v.toFixed(1)

/** The short text written above a column's symbol: a rotation's angle, an injection's outcomes (a measurement shows its outcome inside its box instead). */
export function columnTag(c: ResolvedProgramColumn): string {
  if (c.type === 'rot') return c.turn ?? ''
  if (c.type === 'inject') return [c.s !== undefined ? `s${outcomeSign(c.s)}` : '', c.t !== undefined ? `t${outcomeSign(c.t)}` : ''].filter(Boolean).join(' ')
  return ''
}

export interface ProgramGeometry {
  /** The drawing area (inside the passport above and the caption below on the live stage). */
  area: { x: number; y: number; w: number; h: number }
  lines: string[]
  /** Where the wires start and end, and the centre of column k. */
  x0: number
  x1: number
  colX: (k: number) => number
  pitch: number
  /** The width of a symbol (circle, box), the letters' font size and the radius of a rotation chip. */
  cw: number
  fs: number
  chipR: number
  /** y of the symbols' centre, of wire i, and the top / bottom of the wires. */
  chipY: number
  wireY: (i: number) => number
  wiresTop: number
  wiresBottom: number
  rowH: number
  /** Rows of angle labels (0 when no column has one) and the baseline of row r. */
  headerRows: number
  headerBase: (k: number) => number
  /** The magic lane's strip, when an injection is drawn. */
  lane: { y: number; h: number } | null
  legendY: number
}

/** Where the picture goes in a drawing box (pure, so a test can check that nothing leaves the box or touches the text lines). */
export function pauliProgramGeometry(r: ResolvedPauliProgram, width: number, height: number, own: boolean, slot?: string | null): ProgramGeometry {
  const readouts = pauliProgramReadouts(r)
  const m = r.columns.length
  const title = `${r.wires} wire${r.wires === 1 ? '' : 's'} · ${m} column${m === 1 ? '' : 's'} · time →`
  const lines = own ? [title, ...packLines(readouts.map((x) => x.text), 50)] : []
  const padX = own ? 12 : 24
  const paneTop = slot === 'top'
  const paneBottom = slot === 'bottom'
  const top = own ? 6 + 13 * lines.length + 6 : paneTop ? Math.max(60, 26 + 17 * readouts.length) : paneBottom ? 34 : Math.max(112, 26 + 17 * readouts.length)
  const bottom = own ? 6 : paneTop ? 14 : 92
  const area = { x: padX, y: top, w: Math.max(80, width - 2 * padX), h: Math.max(60, height - top - bottom) }
  // columns: the wire labels take a strip at the left; the rest is shared by the columns
  const maxLabel = Math.max(1, ...r.labels.map((l) => [...l].length))
  const labelW = Math.max(14, 6.4 * maxLabel + 8)
  const x0 = area.x + labelW
  const x1 = area.x + area.w
  const span = Math.max(40, x1 - x0 - 6)
  const pitch = clamp(span / Math.max(1, m), 8, 56)
  const cw = clamp(pitch - 3, 7, 30)
  const fs = clamp(cw * 0.95, 8, 15)
  const left = x0 + 3 + (span - pitch * m) / 2
  // the angle labels over the symbols: staggered over rows when the columns are close (about 4.6 px a character at 9 px)
  const tagChars = Math.max(0, ...r.columns.map((c) => columnTag(c).length))
  const headerRows = tagChars ? clamp(Math.ceil((tagChars * 4.6 + 2) / pitch), 1, 3) : 0
  const headerH = headerRows ? 11 * headerRows + 2 : 0
  const chipR = clamp(cw * 0.42, 4, 9)
  const chipH = 2 * chipR + 6
  const laneH = r.hasLane ? 42 : 0
  const legendH = 18
  const free = area.h - headerH - chipH - laneH - legendH - 4
  const rowH = clamp(free / r.wires, 14, 40)
  const extra = Math.max(0, free - rowH * r.wires)
  const y0 = area.y + extra / 2
  const wiresTop = y0 + headerH + chipH
  const wiresBottom = wiresTop + rowH * r.wires
  return {
    area,
    lines,
    x0,
    x1,
    colX: (k) => left + pitch * (k + 0.5),
    pitch,
    cw,
    fs,
    chipR,
    chipY: y0 + headerH + 3 + chipR,
    wireY: (i) => wiresTop + rowH * (i + 0.5),
    wiresTop,
    wiresBottom,
    rowH,
    headerRows,
    headerBase: (k) => y0 + 9 + 11 * (headerRows > 1 ? k % headerRows : 0),
    lane: r.hasLane ? { y: wiresBottom + 8, h: 34 } : null,
    legendY: area.y + area.h - 4,
  }
}

interface Ctx {
  r: ResolvedPauliProgram
  g: ProgramGeometry
  mode: 'stage' | 'print'
  focus: string | null | undefined
}
const fcls = (c: Ctx, a: string): string | undefined => (c.focus === a ? 'svgk-focus' : undefined)

/** The symbol above a column's wires: a circle for a rotation, a meter box for a measurement, a dashed box for an injection. */
function Symbol({ c, col, cx }: { c: Ctx; col: ResolvedProgramColumn; cx: number }) {
  const { g } = c
  const R = g.chipR
  const y = g.chipY
  if (col.type === 'rot')
    return (
      <g data-anchor="rotation" data-kind-of="rotation" data-t-like={col.tLike ? '1' : '0'} className={fcls(c, 'rotation')}>
        <circle cx={cx} cy={y} r={R} className={col.tLike ? 'fg-op-fill fg-op' : 'fg-op'} fill={col.tLike ? undefined : 'none'} strokeWidth={1.6} />
      </g>
    )
  const sign = col.type === 'meas' ? col.outcome : undefined
  return (
    <g data-anchor="meter" className={fcls(c, 'meter')}>
      <rect x={cx - R} y={y - R} width={2 * R} height={2 * R} rx={2} fill="none" className="fg-sil" strokeWidth={1.4} strokeDasharray={col.type === 'inject' ? '2.5 2' : undefined} />
      {sign !== undefined ? (
        <text x={cx} y={y + R * 0.42} textAnchor="middle" className={sign === 0 ? 'fg-plus-t' : 'fg-minus-t'} style={{ fontSize: clamp(R * 1.5, 8, 13), fontWeight: 700 }}>
          {outcomeSign(sign)}
        </text>
      ) : col.type === 'meas' ? (
        <g className="fg-sil" fill="none" strokeWidth={1}>
          <path d={`M${f1(cx - R * 0.6)},${f1(y + R * 0.35)} A${f1(R * 0.75)},${f1(R * 0.75)} 0 0 1 ${f1(cx + R * 0.6)},${f1(y + R * 0.35)}`} />
          <line x1={cx} y1={y + R * 0.35} x2={cx + R * 0.3} y2={y - R * 0.45} />
        </g>
      ) : null}
    </g>
  )
}

function Column({ c, k }: { c: Ctx; k: number }) {
  const { r, g, mode } = c
  const col = r.columns[k]
  const cx = g.colX(k)
  const dim = k >= r.upTo
  const name = columnName(r, col)
  const last = col.touched[col.touched.length - 1]
  const tag = columnTag(col)
  const ruleTop = g.chipY + g.chipR
  const laneY = g.lane ? g.lane.y + 12 : null
  const d = clamp(g.cw * 0.4, 4, 7)
  return (
    <g role="img" aria-label={name} data-anchor="column" data-col={k} data-type={col.type} data-dim={dim ? '1' : '0'} opacity={dim ? 0.3 : 1} className={fcls(c, 'column')}>
      <title>{name}</title>
      {tag && (
        <>
          <text x={cx} y={g.headerBase(k)} textAnchor="middle" className="fg-lbl" style={{ fontSize: 9, fontWeight: 600 }}>
            {tag}
          </text>
          {g.headerRows > 1 && <line x1={cx} y1={g.headerBase(k) + 2} x2={cx} y2={g.chipY - g.chipR - 1} className="fg-sil3" strokeWidth={0.7} />}
        </>
      )}
      <line x1={cx} y1={ruleTop} x2={cx} y2={g.wireY(last)} className={col.type === 'rot' ? 'fg-op' : 'fg-sil'} strokeWidth={1.2} />
      {col.type === 'inject' && laneY !== null && <line x1={cx} y1={g.wireY(last)} x2={cx} y2={laneY - d} className="fg-sil" strokeWidth={1.1} strokeDasharray="2.5 2" />}
      <Symbol c={c} col={col} cx={cx} />
      {col.touched.map((w) => (
        <g key={w} data-letter={col.letters[w]} data-wire={w}>
          <rect x={cx - g.fs * 0.55} y={g.wireY(w) - g.fs * 0.62} width={g.fs * 1.1} height={g.fs * 1.24} rx={2} style={{ fill: 'var(--fg-halo, transparent)' }} />
          <Letter ch={col.letters[w]} x={cx} y={g.wireY(w) + g.fs * 0.35} mode={mode} size={g.fs} />
        </g>
      ))}
      {col.type === 'inject' && g.lane && laneY !== null && (
        <g data-anchor="lane" data-lane-item={k} className={fcls(c, 'lane')}>
          <polygon points={`${f1(cx)},${f1(laneY - d)} ${f1(cx + d)},${f1(laneY)} ${f1(cx)},${f1(laneY + d)} ${f1(cx - d)},${f1(laneY)}`} className="fg-state fg-state-fill" strokeWidth={1} />
        </g>
      )}
    </g>
  )
}

function Legend({ c }: { c: Ctx }) {
  const { r, g } = c
  const y = g.legendY
  const has = (f: (x: ResolvedProgramColumn) => boolean) => r.columns.some(f)
  const items: { w: number; node: React.ReactNode }[] = []
  if (has((x) => x.type === 'rot' && !x.tLike)) items.push({ w: 70, node: <><circle cx={5} cy={y - 4} r={4.2} fill="none" className="fg-op" strokeWidth={1.5} /><text x={15} y={y} className="fg-lbl">Clifford</text></> })
  if (has((x) => x.type === 'rot' && !!x.tLike)) items.push({ w: 62, node: <><circle cx={5} cy={y - 4} r={4.2} className="fg-op-fill fg-op" strokeWidth={1.5} /><text x={15} y={y} className="fg-lbl">T-like</text></> })
  if (has((x) => x.type === 'meas')) items.push({ w: 76, node: <><rect x={1} y={y - 8} width={8} height={8} rx={1.5} fill="none" className="fg-sil" strokeWidth={1.3} /><text x={15} y={y} className="fg-lbl">measure</text></> })
  if (has((x) => x.type === 'inject')) items.push({ w: 62, node: <><rect x={1} y={y - 8} width={8} height={8} rx={1.5} fill="none" className="fg-sil" strokeWidth={1.3} strokeDasharray="2 1.6" /><text x={15} y={y} className="fg-lbl">inject</text></> })
  let x = g.area.x
  return (
    <g data-legend="pauli-program">
      {items.map((it, i) => {
        const at = x
        x += it.w
        return <g key={i} transform={`translate(${at},0)`}>{it.node}</g>
      })}
    </g>
  )
}

export function PauliProgramScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'pauli-program'>) {
  const own = mode === 'print' || !!bare
  const g = pauliProgramGeometry(r, width, height, own, slot)
  const c: Ctx = { r, g, mode, focus }
  const m = r.columns.length
  const cursorX = r.upTo >= m ? null : r.upTo <= 0 ? g.colX(0) - g.pitch / 2 : (g.colX(r.upTo - 1) + g.colX(r.upTo)) / 2
  return (
    <g className="svgk-scene" data-kind="pauli-program" data-view="program">
      {g.lines.map((t, i) => (
        <Label key={i} at={{ x: 12, y: 15 + 13 * i }} cls="fg-lbl">
          {t}
        </Label>
      ))}
      {!own && (
        <text x={g.area.x} y={g.area.y - 4} className="fg-txt fg-big" style={{ fontSize: 14 }}>
          {`${r.wires} wire${r.wires === 1 ? '' : 's'} · ${m} column${m === 1 ? '' : 's'}`}
        </text>
      )}
      <g data-anchor="wire" className={fcls(c, 'wire')}>
        {Array.from({ length: r.wires }, (_, i) => (
          <g key={i} role="img" aria-label={`wire ${r.labels[i]}`} data-wire={i}>
            <title>{`wire ${r.labels[i]}`}</title>
            <line x1={g.x0 - 2} y1={g.wireY(i)} x2={g.x1} y2={g.wireY(i)} className="fg-sil2" strokeWidth={1.3} />
            <Label at={{ x: g.x0 - 7, y: g.wireY(i) + 4 }} anchor="end" cls="fg-lbl">
              {r.labels[i]}
            </Label>
          </g>
        ))}
      </g>
      {g.lane && (
        <g data-anchor="lane" role="img" aria-label="magic lane: drawn for reading, not a wire of the program" className={fcls(c, 'lane')}>
          <rect x={g.x0 - 2} y={g.lane.y} width={Math.max(10, g.x1 - g.x0 + 2)} height={g.lane.h} rx={4} fill="none" className="fg-sil3" strokeWidth={1.2} strokeDasharray="3 3" />
          <Label at={{ x: g.x0 + 3, y: g.lane.y + g.lane.h - 4 }} cls="fg-lbl">
            magic lane (drawn for reading, not a wire)
          </Label>
        </g>
      )}
      {cursorX !== null && <line x1={cursorX} y1={g.chipY - g.chipR - 2} x2={cursorX} y2={g.wiresBottom + 2} className="fg-state" strokeWidth={1} strokeDasharray="2 3" opacity={0.7} data-cursor={r.upTo} />}
      {r.columns.map((_, k) => (
        <Column key={k} c={c} k={k} />
      ))}
      <Legend c={c} />
    </g>
  )
}
