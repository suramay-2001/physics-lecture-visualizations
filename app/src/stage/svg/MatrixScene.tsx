/**
 * The `matrix` scene: ONE component for the live stage and the print figure. A grid of cells, row i top to bottom,
 * column j left to right, from the resolved state only (stage/svg/matrix.ts): a cell's size is |entry| and its hue
 * is the entry's phase, on the same wheel as `amplitudes` and `complex-plane` (stage/phaseHue.ts). `blocks` overlays
 * a tensor-structure grid; `highlight`/`highlightRow`/`highlightCol` outline cells; `trace` marks the diagonal and
 * reads out Tr; `partialTrace` draws arrows from the matrix's blocks to a reduced matrix beside it; `svd` draws the
 * Schmidt-weight bars beside a `coef` matrix.
 */
import { phaseColor } from '../phaseHue'
import type { SvgSceneProps } from '../svgKinds'
import type { ResolvedMatrix } from '../types'
import { Arrow, Label, PhaseWheel, fix } from './draw'
import { cellLabel, matrixReadouts } from './matrix'

const LINE_ORDER = ['trace', 'partial-trace', 'svd', 'cell']
const ownLines = (r: ResolvedMatrix) => {
  const all = matrixReadouts(r)
  const first = all.filter((x) => LINE_ORDER.includes(x.name)).sort((a, b) => LINE_ORDER.indexOf(a.name) - LINE_ORDER.indexOf(b.name))
  return [...first, ...all.filter((x) => !LINE_ORDER.includes(x.name))].slice(0, 3).map((x) => x.text)
}

function maxMagOf(cells: readonly (readonly { re: number; im: number }[])[]): number {
  let m = 0
  for (const row of cells) for (const z of row) m = Math.max(m, Math.hypot(z.re, z.im))
  return Math.max(m, 1e-9)
}

/** A square grid of cells: colour = phase, size = |entry| (relative to the largest cell drawn), with an optional
 *  block overlay, highlights, a diagonal trace mark, and row/column labels. Reused for the reduced matrix beside it. */
function Grid({
  cells,
  n,
  rowLabels,
  colLabels,
  values,
  blocks,
  highlight,
  highlightRow,
  highlightCol,
  trace,
  x,
  y,
  size,
  hue,
  focus,
}: {
  cells: readonly (readonly { re: number; im: number }[])[]
  n: number
  rowLabels: readonly string[]
  colLabels: readonly string[]
  values: ResolvedMatrix['values']
  blocks: number | null
  highlight: readonly (readonly [number, number])[]
  highlightRow: number | null
  highlightCol: number | null
  trace: boolean
  x: number
  y: number
  size: number
  hue: (phi: number) => string
  focus?: string | null
}) {
  const cell = size / n
  const maxMag = maxMagOf(cells)
  const showValues = values !== 'none' && n <= 4 // the stage's cap on per-cell numbers (stage/svg/matrix.ts MATRIX_LIMITS.valuesMaxN)
  const hiSet = new Set(highlight.map(([i, j]) => `${i}:${j}`))
  return (
    <g data-anchor="cells">
      {cells.map((row, i) =>
        row.map((z, j) => {
          const mag = Math.hypot(z.re, z.im)
          const cx = x + cell * (j + 0.5)
          const cy = y + cell * (i + 0.5)
          const s = mag < 1e-9 ? 0 : Math.max(2, cell * 0.84 * Math.sqrt(mag / maxMag))
          const hiCell = hiSet.has(`${i}:${j}`) || highlightRow === i || highlightCol === j
          const cellFocus = focus === 'cell' || focus === `cell-${i}-${j}`
          return (
            <g key={`${i}-${j}`} data-anchor={`cell-${i}-${j}`} className={cellFocus ? 'svgk-focus' : undefined}>
              <rect x={x + cell * j} y={y + cell * i} width={cell} height={cell} className="fg-sil3" fill="none" strokeWidth={0.6} />
              {trace && i === j && (
                <line
                  x1={x + cell * j + 3}
                  y1={y + cell * i + cell - 3}
                  x2={x + cell * j + cell - 3}
                  y2={y + cell * i + 3}
                  className="fg-sil2"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                />
              )}
              {mag > 1e-9 && <rect x={cx - s / 2} y={cy - s / 2} width={s} height={s} rx={Math.min(3, s / 5)} style={{ fill: hue(Math.atan2(z.im, z.re)) }} />}
              {hiCell && <rect x={x + cell * j + 1} y={y + cell * i + 1} width={cell - 2} height={cell - 2} fill="none" className="fg-state" strokeWidth={1.6} />}
              {showValues && (
                <text x={cx} y={cy + Math.min(4, cell * 0.12)} textAnchor="middle" dominantBaseline="middle" className="fg-txt" style={{ fontSize: Math.max(7, Math.min(10, cell * 0.22)) }}>
                  {cellLabel(z, values)}
                </text>
              )}
            </g>
          )
        }),
      )}
      {blocks &&
        blocks > 1 &&
        Array.from({ length: blocks - 1 }, (_, k) => k + 1).map((k) => {
          const off = (size * k) / blocks
          return (
            <g key={`b${k}`} data-anchor="block">
              <line x1={x + off} y1={y} x2={x + off} y2={y + size} className="fg-sil2" strokeWidth={1.6} />
              <line x1={x} y1={y + off} x2={x + size} y2={y + off} className="fg-sil2" strokeWidth={1.6} />
            </g>
          )
        })}
      <rect x={x} y={y} width={size} height={size} fill="none" className="fg-sil2" strokeWidth={1.2} />
      {rowLabels.map(
        (t, i) =>
          t && (
            <Label key={`r${i}`} at={{ x: x - 6, y: y + cell * (i + 0.5) + 4 }} anchor="end" cls="fg-lbl">
              {t}
            </Label>
          ),
      )}
      {colLabels.map(
        (t, j) =>
          t && (
            <Label key={`c${j}`} at={{ x: x + cell * (j + 0.5), y: y - 6 }} anchor="middle" cls="fg-lbl">
              {t}
            </Label>
          ),
      )}
    </g>
  )
}

export function MatrixScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'matrix'>) {
  const print = mode === 'print'
  const own = print || !!bare
  const lines = own ? ownLines(r) : []
  const hue = (phi: number) => phaseColor(phi, mode)
  const readoutCount = own ? 0 : matrixReadouts(r).length
  const padTop = own ? 14 + 13 * lines.length : Math.max(60, 26 + 17 * readoutCount)
  const padBottom = own ? 26 : slot === 'top' ? 18 : 40
  const padX = own ? 14 : 24
  const hasSide = !!r.partialTrace || !!r.svd
  const sideW = hasSide ? Math.min(0.36 * (width - 2 * padX), 150) : 0
  const rowLabelW = r.labels === 'none' ? 0 : 40
  const colLabelH = r.labels === 'none' ? 0 : 18
  const gridAvailW = width - 2 * padX - (hasSide ? sideW + 18 : 0) - rowLabelW
  const gridAvailH = height - padTop - padBottom - colLabelH
  const size = Math.max(20, Math.min(gridAvailW, gridAvailH))
  const gx = padX + rowLabelW
  const gy = padTop + colLabelH
  const sideX = gx + size + 18

  return (
    <g className="svgk-scene" data-kind="matrix">
      <Grid
        cells={r.cells}
        n={r.n}
        rowLabels={r.rowLabels}
        colLabels={r.colLabels}
        values={r.values}
        blocks={r.blocks}
        highlight={r.highlight}
        highlightRow={r.highlightRow}
        highlightCol={r.highlightCol}
        trace={!!r.trace}
        x={gx}
        y={gy}
        size={size}
        hue={hue}
        focus={focus}
      />
      {r.partialTrace &&
        (() => {
          const reduced = r.partialTrace!
          const rSize = Math.max(16, Math.min(sideW - 8, size) * (r.svd ? 0.52 : 0.68))
          const rx = sideX + (sideW - rSize) / 2
          const ry = gy + (r.svd ? 4 : (size - rSize) / 2)
          const blockSize = size / reduced.n
          const cellSize = rSize / reduced.n
          return (
            <g data-anchor="reduced" className={focus === 'reduced' ? 'svgk-focus' : undefined}>
              {Array.from({ length: reduced.n }, (_, k) => (
                <Arrow
                  key={k}
                  a={{ x: gx + blockSize * (k + 0.5), y: gy + blockSize * (k + 0.5) }}
                  b={{ x: rx + cellSize * (k + 0.5), y: ry + cellSize * (k + 0.5) }}
                  cls="fg-sil2"
                  width={1.1}
                  head={6}
                />
              ))}
              <Grid
                cells={reduced.cells}
                n={reduced.n}
                rowLabels={[]}
                colLabels={[]}
                values={r.values}
                blocks={null}
                highlight={[]}
                highlightRow={null}
                highlightCol={null}
                trace={false}
                x={rx}
                y={ry}
                size={rSize}
                hue={hue}
              />
              <Label at={{ x: sideX + sideW / 2, y: ry + rSize + 14 }} anchor="middle" cls="fg-lbl">
                {`Tr${reduced.which} → ${reduced.n}×${reduced.n}`}
              </Label>
            </g>
          )
        })()}
      {r.svd &&
        (() => {
          const bars = r.svd!
          const maxV = Math.max(...bars, 1e-9)
          const top = r.partialTrace ? gy + size * 0.58 : gy
          const barAreaH = (r.partialTrace ? size * 0.4 : size) - 20
          const baseY = top + barAreaH + 14
          const barW = Math.max(6, Math.min(22, (sideW - 12) / bars.length - 6))
          return (
            <g data-anchor="svd-bar" className={focus === 'svd-bar' ? 'svgk-focus' : undefined}>
              <Label at={{ x: sideX + sideW / 2, y: top - 4 }} anchor="middle" cls="fg-lbl">
                Schmidt weights
              </Label>
              {bars.map((v, k) => {
                const h = Math.max(1, (v / maxV) * barAreaH)
                const cx = sideX + 10 + k * (barW + 6) + barW / 2
                return (
                  <g key={k}>
                    <rect x={cx - barW / 2} y={baseY - 14 - h} width={barW} height={h} rx={2} className="fg-op-fill" />
                    <Label at={{ x: cx, y: baseY }} anchor="middle" cls="fg-lbl">
                      {fix(v, 3)}
                    </Label>
                  </g>
                )
              })}
            </g>
          )
        })()}
      {own && <PhaseWheel x={width - 12} y={height - 10} mode={mode} />}
      {lines.map((t, k) => (
        <Label key={`rl${k}`} at={{ x: 8, y: 14 + 13 * k }} cls="fg-txt">
          {t}
        </Label>
      ))}
    </g>
  )
}
