/**
 * The `bits` scene: ONE component for the live stage, the reading version, the print figure and the Try-it widget. It draws the resolved
 * state only (stage/svg/bits.ts took every output, sum, syndrome and reduced row from physics/qc/bits.ts):
 *   fn      a truth table (a filled cell is a 1, an empty cell a 0) or a map (inputs at the left, outputs at the right, one arrow per input;
 *           an output that several arrows reach is outlined and counted, and those arrows are drawn in the operation colour)
 *   rows    rows of cells; a computed last row (the XOR, or the AND whose parity is a·b); or each row's dot product with a word at its end
 *   reduce  a matrix after some moves of Gauss–Jordan elimination, the moved rows outlined, the pivots ringed once it is done
 *   bitmap  (B2) a bicycle code's check matrix as pixels: one drawn run for each run of 1s (an X block in the X hue, a Z block in the Z hue), a dashed
 *           separator between the L and R qubits and between the X and Z checks, optional outlined bands of rows or columns
 *   grid    (B2) a small labelled table of bits (the logical action of a qubit shift, or an authored table), drawn as cells like `rows`
 * Cells are white when 1 and outlined when 0, operations are orchid, structure silver; the amber / cobalt outcome hues are never used. The
 * text is plain Unicode (no TeX inside SVG).
 */
import type { SvgSceneProps } from '../svgKinds'
import type { ResolvedBits, ResolvedBitsMap } from '../types'
import { bitsReadouts } from './bits'
import { letterColor } from './CodeScene'
import { Arrow, Label, type Pt } from './draw'

export interface BitsBox {
  x: number
  y: number
  w: number
  h: number
}

/** The drawing area inside a box of width × height, for the live stage (room for the passport above and the caption below) or an own-text figure. */
export function bitsArea(width: number, height: number, own: boolean, slot: string | null | undefined, readoutCount: number, lineCount: number): BitsBox {
  const padX = own ? 14 : 24
  const paneTop = slot === 'top'
  const paneBottom = slot === 'bottom'
  const top = own ? 8 + 13 * lineCount + (lineCount ? 8 : 0) : paneTop ? Math.max(60, 26 + 17 * readoutCount) : paneBottom ? 34 : Math.max(112, 26 + 17 * readoutCount)
  const bottom = own ? 10 : paneTop ? 14 : 92
  return { x: padX, y: top, w: Math.max(80, width - 2 * padX), h: Math.max(60, height - top - bottom) }
}

const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x))
const TXT = (c: number): number => clamp(c * 0.5, 9, 22)

/** One cell: filled and dark-lettered for a 1, outlined for a 0. */
function Cell({ x, y, s, bit, ring, dim }: { x: number; y: number; s: number; bit: string | number; ring?: 'op' | 'state' | 'sil'; dim?: boolean }) {
  const one = String(bit) === '1'
  return (
    <g opacity={dim ? 0.5 : 1}>
      <rect x={x + 1} y={y + 1} width={s - 2} height={s - 2} rx={3} className={one ? 'fg-state-fill' : 'fg-sil2'} fill={one ? undefined : 'none'} strokeWidth={one ? 0 : 1.2} />
      <text x={x + s / 2} y={y + s / 2 + TXT(s) * 0.36} textAnchor="middle" style={{ fontSize: TXT(s), fontWeight: 600, fill: one ? 'var(--fg-halo)' : 'var(--fg-ink-2)' }}>
        {bit}
      </text>
      {ring && <rect x={x - 1} y={y - 1} width={s + 2} height={s + 2} rx={4} fill="none" className={`fg-${ring}`} strokeWidth={2.2} />}
    </g>
  )
}

/* ------------------------------------------------------------------ fn: tables and maps ------------------------------------------------------------------ */

export interface FnLayout {
  panels: BitsBox[]
  /** Truth table: the cell size; map: the row pitch. */
  c: number
}

/** The panels (one per source) inside the drawing area, side by side with a gap. */
export function fnPanels(area: BitsBox, count: number): BitsBox[] {
  const gap = 16
  const pw = (area.w - gap * (count - 1)) / count
  return Array.from({ length: count }, (_, i) => ({ x: area.x + i * (pw + gap), y: area.y, w: pw, h: area.h }))
}

/** The cell size of a truth table that fits a panel: n + m columns (a gap of 0.6 between inputs and outputs), 2ⁿ rows, a title and a header line. */
export const tableCell = (panel: BitsBox, m: ResolvedBitsMap): number => Math.floor(clamp(Math.min(panel.w / (m.n + m.m + 0.6), (panel.h - 40) / 2 ** m.n), 14, 44))

function TableView({ map, panel, focus }: { map: ResolvedBitsMap; panel: BitsBox; focus: string | null | undefined }) {
  const c = tableCell(panel, map)
  const gap = c * 0.6
  const tw = c * (map.n + map.m) + gap
  const x0 = panel.x + (panel.w - tw) / 2
  const rows = 2 ** map.n
  // the title, the in/out header and the rows form one block, centred in the panel
  const top = panel.y + Math.max(0, (panel.h - (38 + rows * c)) / 2)
  const y0 = top + 38
  const f = (a: string) => (focus === a ? 'svgk-focus' : undefined)
  return (
    <g>
      <Label at={{ x: panel.x + panel.w / 2, y: top + 12 }} anchor="middle" cls="fg-txt fg-big">
        {map.label}
      </Label>
      <Label at={{ x: x0 + (c * map.n) / 2, y: top + 30 }} anchor="middle" cls="fg-lbl">
        in
      </Label>
      <Label at={{ x: x0 + c * map.n + gap + (c * map.m) / 2, y: top + 30 }} anchor="middle" cls="fg-lbl">
        out
      </Label>
      {Array.from({ length: rows }, (_, x) => {
        const y = y0 + x * c
        const marked = map.marked.includes(x)
        const dim = map.marked.length > 0 && !marked
        const outBits = map.outputs[map.out[x]]
        return (
          <g key={x} data-anchor="row" className={f('row')}>
            {marked && <rect x={x0 - 4} y={y - 2} width={tw + 8} height={c + 4} rx={5} fill="none" className="fg-op" strokeWidth={2.2} />}
            <g data-anchor="inputs" className={f('inputs')}>
              {[...map.inputs[x]].map((b, k) => (
                <Cell key={k} x={x0 + k * c} y={y} s={c} bit={b} dim={dim} />
              ))}
            </g>
            <g data-anchor="outputs" className={f('outputs')}>
              {[...outBits].map((b, k) => (
                <Cell key={k} x={x0 + c * map.n + gap + k * c} y={y} s={c} bit={b} dim={dim} />
              ))}
            </g>
          </g>
        )
      })}
    </g>
  )
}

/** Where each node of a map goes: the input and output boxes of one panel, spread over the same height. */
export interface MapGeometry {
  pitchIn: number
  pitchOut: number
  boxW: number
  boxH: number
  xIn: number
  xOut: number
  y0: number
  yIn: (i: number) => number
  yOut: (o: number) => number
}
export function mapGeometry(panel: BitsBox, map: ResolvedBitsMap): MapGeometry {
  const rows = Math.max(2 ** map.n, 2 ** map.m)
  const avail = panel.h - 34
  const pitch = clamp(avail / rows, 14, 44)
  const total = pitch * rows
  const boxH = Math.min(pitch - 4, 30)
  const boxW = Math.max(map.n, map.m) * 9.5 + 16
  const y0 = panel.y + 34 + Math.max(0, (avail - total) / 2)
  const pitchIn = total / 2 ** map.n
  const pitchOut = total / 2 ** map.m
  const xIn = panel.x + 2
  const xOut = panel.x + panel.w - boxW - 30
  return {
    pitchIn,
    pitchOut,
    boxW,
    boxH,
    xIn,
    xOut: Math.max(xOut, xIn + boxW + 40),
    y0,
    yIn: (i) => y0 + pitchIn * (i + 0.5),
    yOut: (o) => y0 + pitchOut * (o + 0.5),
  }
}

function MapView({ map, panel, focus }: { map: ResolvedBitsMap; panel: BitsBox; focus: string | null | undefined }) {
  const g = mapGeometry(panel, map)
  const f = (a: string) => (focus === a ? 'svgk-focus' : undefined)
  const anyMarked = map.marked.length > 0
  const mono = { fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: clamp(g.boxH * 0.55, 12, 16) }
  return (
    <g>
      <Label at={{ x: panel.x + panel.w / 2, y: g.y0 - 14 }} anchor="middle" cls="fg-txt fg-big">
        {map.label}
      </Label>
      {/* the arrows go first, under the boxes */}
      <g data-anchor="row" className={f('row')}>
        {map.inputs.map((_, i) => {
          const o = map.out[i]
          const merging = map.preimages[o] > 1
          const marked = map.marked.includes(i)
          const a: Pt = { x: g.xIn + g.boxW, y: g.yIn(i) }
          const b: Pt = { x: g.xOut, y: g.yOut(o) }
          return <Arrow key={i} a={a} b={b} cls={merging ? 'fg-op' : 'fg-state'} width={marked ? 3 : 1.6} head={8} anchor={merging ? 'merge' : undefined} focus={merging && focus === 'merge'} />
        })}
      </g>
      <g data-anchor="inputs" className={f('inputs')} opacity={1}>
        {map.inputs.map((s, i) => {
          const marked = map.marked.includes(i)
          return (
            <g key={i} opacity={anyMarked && !marked ? 0.55 : 1}>
              <rect x={g.xIn} y={g.yIn(i) - g.boxH / 2} width={g.boxW} height={g.boxH} rx={4} fill="var(--fg-halo)" className={marked ? 'fg-state' : 'fg-sil2'} strokeWidth={marked ? 2.4 : 1.2} />
              <text x={g.xIn + g.boxW / 2} y={g.yIn(i) + 4.4} textAnchor="middle" className="fg-txt" style={mono}>
                {s}
              </text>
            </g>
          )
        })}
      </g>
      <g data-anchor="outputs" className={f('outputs')}>
        {map.outputs.map((s, o) => {
          const k = map.preimages[o]
          const merging = k > 1
          return (
            <g key={o} opacity={k === 0 ? 0.45 : 1}>
              <rect x={g.xOut} y={g.yOut(o) - g.boxH / 2} width={g.boxW} height={g.boxH} rx={4} fill="var(--fg-halo)" className={merging ? 'fg-op' : 'fg-sil2'} strokeWidth={merging ? 2.4 : 1.2} />
              <text x={g.xOut + g.boxW / 2} y={g.yOut(o) + 4.4} textAnchor="middle" className="fg-txt" style={mono}>
                {s}
              </text>
              {merging && (
                <text x={g.xOut + g.boxW + 6} y={g.yOut(o) + 4.4} className="fg-lbl" style={{ fill: 'var(--fg-op)', fontWeight: 600 }}>
                  {`×${k}`}
                </text>
              )}
            </g>
          )
        })}
      </g>
    </g>
  )
}

function FnScene({ r, area, focus }: { r: ResolvedBits; area: BitsBox; focus: string | null | undefined }) {
  const fn = r.fn!
  const panels = fnPanels(area, fn.maps.length)
  return (
    <g>
      {fn.maps.map((m, i) => (fn.view === 'table' ? <TableView key={i} map={m} panel={panels[i]} focus={focus} /> : <MapView key={i} map={m} panel={panels[i]} focus={focus} />))}
    </g>
  )
}

/* ------------------------------------------------------------------ rows and reduce ------------------------------------------------------------------ */

export interface GridLayout {
  cell: number
  /** Left edge of the first cell, top edge of the first row. */
  x0: number
  y0: number
  /** Label column width. */
  labelW: number
  /** Width of the result column on the right (the check bits or the dot product). */
  extraW: number
}
/** The cell size and origin of a rows-by-columns grid with a label column and a result column, centred in the area. */
export function gridLayout(area: BitsBox, cols: number, rowCount: number, labelChars: number, extraW: number, extraRows = 0): GridLayout {
  const labelW = Math.max(14, labelChars * 7.4) + 10
  const cell = Math.floor(clamp(Math.min((area.w - labelW - extraW) / (cols + 0.2), (area.h - 8 - extraRows * 12) / (rowCount + 0.3)), 14, 48))
  const tw = labelW + cell * cols + extraW
  const x0 = area.x + Math.max(0, (area.w - tw) / 2) + labelW
  const th = cell * rowCount + extraRows * 12
  const y0 = area.y + Math.max(0, (area.h - th) / 2)
  return { cell, x0, y0, labelW, extraW }
}

function RowsScene({ r, area, focus }: { r: ResolvedBits; area: BitsBox; focus: string | null | undefined }) {
  const w = r.rows!
  const f = (a: string) => (focus === a ? 'svgk-focus' : undefined)
  const extra = w.against ? 1 : 0
  const drawn = w.strings.length + (w.computed !== null ? 1 : 0) + extra
  const labelChars = Math.max(...w.names.map((s) => s.length), w.computed !== null ? (w.combine === 'xor' ? 1 : 3) : 0, extra ? 4 : 0)
  const extraW = w.against ? 56 : w.combine === 'dot' ? 96 : 0
  const L = gridLayout(area, w.width, drawn, labelChars, extraW, w.computed !== null || extra ? 1 : 0)
  const c = L.cell
  const rowY = (i: number): number => L.y0 + i * c + (i >= w.strings.length ? 12 : 0)
  return (
    <g>
      {w.strings.map((s, i) => (
        <g key={i} data-anchor="row" className={f('row')}>
          <Label at={{ x: L.x0 - 8, y: rowY(i) + c / 2 + 4.5 }} anchor="end" cls="fg-lbl">
            {w.names[i]}
          </Label>
          {[...s].map((b, k) => (
            <Cell key={k} x={L.x0 + k * c} y={rowY(i)} s={c} bit={b} />
          ))}
          {w.against && (
            <g data-anchor="checks" className={f('checks')}>
              <Label at={{ x: L.x0 + w.width * c + 8, y: rowY(i) + c / 2 + 4.5 }} cls="fg-lbl">
                →
              </Label>
              <Cell x={L.x0 + w.width * c + 26} y={rowY(i)} s={c} bit={w.against.dots[i]} ring="op" />
            </g>
          )}
        </g>
      ))}
      {w.computed !== null && (
        <g data-anchor="computed" className={f('computed')}>
          <line x1={L.x0 - 6} y1={rowY(w.strings.length) - 6} x2={L.x0 + w.width * c + 4} y2={rowY(w.strings.length) - 6} className="fg-sil2" strokeWidth={1.4} />
          <Label at={{ x: L.x0 - 8, y: rowY(w.strings.length) + c / 2 + 4.5 }} anchor="end" cls="fg-lbl">
            {w.combine === 'xor' ? '⊕' : 'AND'}
          </Label>
          {[...w.computed].map((b, k) => (
            <Cell key={k} x={L.x0 + k * c} y={rowY(w.strings.length)} s={c} bit={b} ring="op" />
          ))}
          {w.combine === 'dot' && (
            <Label at={{ x: L.x0 + w.width * c + 10, y: rowY(w.strings.length) + c / 2 + 4.5 }} cls="fg-lbl">
              {`${w.names[0]}·${w.names[1]} = ${w.dot}`}
            </Label>
          )}
        </g>
      )}
      {w.against && (
        <g data-anchor="computed" className={f('computed')}>
          <line x1={L.x0 - 6} y1={rowY(w.strings.length) - 6} x2={L.x0 + w.width * c + 4} y2={rowY(w.strings.length) - 6} className="fg-sil2" strokeWidth={1.4} />
          <Label at={{ x: L.x0 - 8, y: rowY(w.strings.length) + c / 2 + 4.5 }} anchor="end" cls="fg-lbl">
            word
          </Label>
          {[...w.against.word].map((b, k) => (
            <Cell key={k} x={L.x0 + k * c} y={rowY(w.strings.length)} s={c} bit={b} ring="op" />
          ))}
        </g>
      )}
    </g>
  )
}

function ReduceScene({ r, area, focus }: { r: ResolvedBits; area: BitsBox; focus: string | null | undefined }) {
  const d = r.reduce!
  const f = (a: string) => (focus === a ? 'svgk-focus' : undefined)
  const cols = d.matrix[0].length
  const L = gridLayout(area, cols, d.matrix.length, 5, 0)
  const c = L.cell
  const mv = d.move
  return (
    <g>
      {d.matrix.map((s, i) => {
        const y = L.y0 + i * c
        const moved = mv && (i === mv.b || (mv.op === 'swap' && i === mv.a))
        const source = mv && mv.op === 'xor' && i === mv.a
        return (
          <g key={i} data-anchor="row" className={f('row')}>
            <Label at={{ x: L.x0 - 8, y: y + c / 2 + 4.5 }} anchor="end" cls="fg-lbl">
              {`row ${i + 1}`}
            </Label>
            {(moved || source) && <rect x={L.x0 - 4} y={y - 2} width={cols * c + 8} height={c + 4} rx={5} fill="none" className={moved ? 'fg-state' : 'fg-sil'} strokeWidth={moved ? 2.2 : 1.6} strokeDasharray={moved ? undefined : '4 3'} />}
            {[...s].map((b, k) => (
              <Cell key={k} x={L.x0 + k * c} y={y} s={c} bit={b} />
            ))}
          </g>
        )
      })}
      {d.done && (
        <g data-anchor="pivots" className={f('pivots')}>
          {d.pivots.map((col, i) => (
            <rect key={i} x={L.x0 + col * c - 2} y={L.y0 + i * c - 2} width={c + 4} height={c + 4} rx={5} fill="none" className="fg-op" strokeWidth={2.6} />
          ))}
        </g>
      )}
    </g>
  )
}

/* ------------------------------------------------------------------ bitmap: a check matrix as pixels ------------------------------------------------------------------ */
export interface BitmapLayout {
  /** Pixels per matrix cell (a square cell; below 1 px when the matrix is bigger than the box, which is fine: runs of 1s are drawn as rectangles). */
  cell: number
  x0: number
  y0: number
  w: number
  h: number
}

/** Where the matrix goes in a drawing area: a strip above for the L | R labels, one at the left for the X / Z labels, and a strip below for the bands' labels. */
export function bitmapLayout(r: ResolvedBits, area: BitsBox): BitmapLayout {
  const m = r.bitmap!
  const head = 22
  const left = 22
  const foot = 6
  const cell = Math.max(0.5, Math.min((area.w - left) / m.cols, (area.h - head - foot) / m.rows))
  const w = cell * m.cols
  const h = cell * m.rows
  return { cell, x0: area.x + left + (area.w - left - w) / 2, y0: area.y + head + Math.max(0, (area.h - head - foot - h) / 2), w, h }
}

/** The path of a block of runs: one rectangle for each run of 1s, all in one element. */
export function runsPath(runs: readonly [number, number, number][], L: BitmapLayout, rowFrom: number, rowTo: number): string {
  const f = (v: number): string => v.toFixed(2)
  return runs
    .filter(([row]) => row >= rowFrom && row < rowTo)
    .map(([row, col, len]) => `M${f(L.x0 + col * L.cell)},${f(L.y0 + row * L.cell)}h${f(len * L.cell)}v${f(L.cell)}h${f(-len * L.cell)}z`)
    .join('')
}

function BitmapScene({ r, area, mode, focus }: { r: ResolvedBits; area: BitsBox; mode: SvgSceneProps<'bits'>['mode']; focus: string | null | undefined }) {
  const m = r.bitmap!
  const L = bitmapLayout(r, area)
  const f = (a: string) => (focus === a ? 'svgk-focus' : undefined)
  const blocks: { name: string; from: number; to: number; letter: 'X' | 'Z' }[] = m.xRows !== null ? [{ name: 'H_X', from: 0, to: m.xRows, letter: 'X' }, { name: 'H_Z', from: m.xRows, to: m.rows, letter: 'Z' }] : [{ name: m.which === 'HX' ? 'H_X' : 'H_Z', from: 0, to: m.rows, letter: m.which === 'HX' ? 'X' : 'Z' }]
  const sx = L.x0 + m.split * L.cell
  return (
    <g data-anchor="bitmap" className={f('bitmap')} role="img" aria-label={`${m.name} check matrix${m.which === 'both' ? 'es H_X over H_Z' : ` ${m.which === 'HX' ? 'H_X' : 'H_Z'}`}: ${m.rows} rows, ${m.cols} columns, ${m.ones} ones`}>
      <title>{`${m.name}: ${m.rows} × ${m.cols}, ${m.ones} ones`}</title>
      <rect x={L.x0} y={L.y0} width={L.w} height={L.h} fill="none" className="fg-sil3" strokeWidth={0.8} />
      {blocks.map((b) => (
        <path key={b.name} d={runsPath(m.runs, L, b.from, b.to)} style={{ fill: letterColor(b.letter, mode) }} shapeRendering="crispEdges" data-block={b.name} />
      ))}
      <line x1={sx} y1={L.y0 - 4} x2={sx} y2={L.y0 + L.h + 4} className="fg-sil" strokeWidth={1.2} strokeDasharray="4 3" />
      {m.xRows !== null && <line x1={L.x0 - 4} y1={L.y0 + m.xRows * L.cell} x2={L.x0 + L.w + 4} y2={L.y0 + m.xRows * L.cell} className="fg-sil" strokeWidth={1.2} strokeDasharray="4 3" />}
      <Label at={{ x: (L.x0 + sx) / 2, y: L.y0 - 8 }} anchor="middle" cls="fg-lbl">
        L qubits
      </Label>
      <Label at={{ x: (sx + L.x0 + L.w) / 2, y: L.y0 - 8 }} anchor="middle" cls="fg-lbl">
        R qubits
      </Label>
      {blocks.map((b) => {
        const cy = L.y0 + ((b.from + b.to) / 2) * L.cell
        return (
          <text key={b.name} transform={`translate(${L.x0 - 8},${cy}) rotate(-90)`} textAnchor="middle" className="fg-lbl">
            {b.letter === 'X' ? 'X checks' : 'Z checks'}
          </text>
        )
      })}
      {m.bands.map((b, i) => (
        <g key={i} data-anchor="band" className={f('band')}>
          <rect
            x={L.x0 + (b.cols ? b.cols[0] * L.cell : 0) - 1}
            y={L.y0 + (b.rows ? b.rows[0] * L.cell : 0) - 1}
            width={(b.cols ? (b.cols[1] - b.cols[0] + 1) * L.cell : L.w) + 2}
            height={(b.rows ? (b.rows[1] - b.rows[0] + 1) * L.cell : L.h) + 2}
            fill="none"
            className="fg-op"
            strokeWidth={1.8}
          />
        </g>
      ))}
    </g>
  )
}

/* ------------------------------------------------------------------ grid: a labelled table of bits ------------------------------------------------------------------ */
export function gridTableLayout(r: ResolvedBits, area: BitsBox): { cell: number; x0: number; y0: number; labelW: number; head: number } {
  const g = r.grid!
  const labelW = Math.max(14, Math.max(...g.rowLabels.map((s) => s.length)) * 7.2) + 8
  const head = 18
  const cell = Math.floor(clamp(Math.min((area.w - labelW) / g.cols, (area.h - head - 4) / g.rows), 12, 36))
  return { cell, labelW, head, x0: area.x + Math.max(0, (area.w - labelW - cell * g.cols) / 2) + labelW, y0: area.y + head + Math.max(0, (area.h - head - cell * g.rows) / 2) }
}

function GridScene({ r, area, focus }: { r: ResolvedBits; area: BitsBox; focus: string | null | undefined }) {
  const g = r.grid!
  const L = gridTableLayout(r, area)
  const c = L.cell
  const f = (a: string) => (focus === a ? 'svgk-focus' : undefined)
  const fs = clamp(c * 0.42, 8, 11)
  return (
    <g data-anchor="grid" className={f('grid')} role="img" aria-label={g.shift ? `logical action of the shift ${g.shift.name}: ${g.rows} by ${g.cols} table of bits, ${g.ones} ones` : `${g.rows} by ${g.cols} table of bits, ${g.ones} ones`}>
      {g.colLabels.map((t, j) => (
        <text key={`c${j}`} x={L.x0 + (j + 0.5) * c} y={L.y0 - 5} textAnchor="middle" className="fg-lbl" style={{ fontSize: fs }}>
          {t}
        </text>
      ))}
      {g.cells.map((row, i) => (
        <g key={i} data-anchor="row">
          <text x={L.x0 - 6} y={L.y0 + i * c + c / 2 + fs * 0.36} textAnchor="end" className="fg-lbl" style={{ fontSize: fs }}>
            {g.rowLabels[i]}
          </text>
          {row.map((b, j) => (
            <Cell key={j} x={L.x0 + j * c} y={L.y0 + i * c} s={c} bit={b} />
          ))}
        </g>
      ))}
    </g>
  )
}

/* ------------------------------------------------------------------ the scene ------------------------------------------------------------------ */

export function BitsScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'bits'>) {
  const print = mode === 'print'
  const own = print || !!bare
  const readouts = bitsReadouts(r)
  const lines = own ? readouts.map((x) => x.text) : []
  const area = bitsArea(width, height, own, slot, readouts.length, lines.length)
  return (
    <g className="svgk-scene" data-kind="bits">
      {lines.map((t, i) => (
        <Label key={i} at={{ x: 14, y: 16 + 13 * i }} cls="fg-lbl">
          {t}
        </Label>
      ))}
      {r.fn && <FnScene r={r} area={area} focus={focus} />}
      {r.rows && <RowsScene r={r} area={area} focus={focus} />}
      {r.reduce && <ReduceScene r={r} area={area} focus={focus} />}
      {r.bitmap && <BitmapScene r={r} area={area} mode={mode} focus={focus} />}
      {r.grid && <GridScene r={r} area={area} focus={focus} />}
    </g>
  )
}
