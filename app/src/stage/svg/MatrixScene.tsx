/**
 * The `matrix` scene: ONE component for the live stage and the print figure, drawing either of the kind's two views
 * (stage/svg/matrix.ts `ResolvedMatrix`). The grid view: a cell's size is |entry| and its hue is the entry's phase,
 * on the same wheel as `amplitudes` and `complex-plane` (stage/phaseHue.ts); `blocks` overlays a tensor-structure
 * grid; `highlight`/`highlightRow`/`highlightCol` outline cells; `trace` marks the diagonal and reads out Tr;
 * `partialTrace` draws exact arrows from the matrix's contributing diagonal cells to a reduced matrix beside it;
 * `svd` draws the Schmidt-weight bars; `spectrum` draws signed eigenvalue bars (+ entropy); `ptranspose`'s moved
 * cells get a dashed outline. The tableau view: one coloured letter per qubit per row, an optional product row, and
 * per-row card/eigenvalue badges.
 */
import { phaseColor } from '../phaseHue'
import type { SvgMode, SvgSceneProps } from '../svgKinds'
import type { ResolvedMatrixGrid, ResolvedMatrixTableau, ResolvedMatrixTableauRow } from '../types'
import { Arrow, Label, PhaseWheel, fix } from './draw'
import { cellLabel, matrixReadouts } from './matrix'

const LINE_ORDER = ['trace', 'partial-trace', 'svd', 'spectrum', 'spectrum-flag', 'entropy', 'ptranspose', 'cell']
const ownLines = (r: ResolvedMatrixGrid | ResolvedMatrixTableau) => {
  const all = matrixReadouts(r)
  const first = all.filter((x) => LINE_ORDER.includes(x.name)).sort((a, b) => LINE_ORDER.indexOf(a.name) - LINE_ORDER.indexOf(b.name))
  return [...first, ...all.filter((x) => !LINE_ORDER.includes(x.name))].slice(0, 4).map((x) => x.text)
}

function maxMagOf(cells: readonly (readonly { re: number; im: number }[])[]): number {
  let m = 0
  for (const row of cells) for (const z of row) m = Math.max(m, Math.hypot(z.re, z.im))
  return Math.max(m, 1e-9)
}

/** A square grid of cells: colour = phase, size = |entry| (relative to the largest cell drawn), with an optional
 *  block overlay, highlights, a diagonal trace mark, a dashed outline on `ptranspose`'s moved cells, and row/column
 *  labels. Reused for the reduced matrix beside it (which draws none of the overlays). */
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
  moved,
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
  values: ResolvedMatrixGrid['values']
  blocks: number | null
  highlight: readonly (readonly [number, number])[]
  highlightRow: number | null
  highlightCol: number | null
  moved?: ReadonlySet<string>
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
          const movedCell = !!moved?.has(`${i}:${j}`)
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
              {movedCell && (
                <rect x={x + cell * j + 1} y={y + cell * i + 1} width={cell - 2} height={cell - 2} fill="none" className="fg-op" strokeWidth={1.3} strokeDasharray="3 2" data-anchor="moved" />
              )}
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

/** Signed eigenvalue bars (qc/cmat.ts `eigh`, unclamped): a negative value (e.g. after `ptranspose`, the Peres test)
 *  is drawn below the zero line in a flagging colour, never hidden or clamped away, with its wording ('negative'
 *  for a `lin` difference, 'not a state' when the source claims to be a density matrix) shown alongside it. */
function SpectrumBars({
  values,
  entropy,
  flag,
  x,
  y,
  w,
  h,
  focus,
}: {
  values: readonly number[]
  entropy: number | null
  flag?: 'negative' | 'not a state' | null
  x: number
  y: number
  w: number
  h: number
  focus?: string | null
}) {
  const maxAbs = Math.max(...values.map((v) => Math.abs(v)), 1e-9)
  const flagged = !!flag && values.some((v) => v < -1e-9)
  const zeroY = y + h * 0.6
  const barAreaUp = h * 0.6 - 14
  const barAreaDown = h * 0.4 - 4
  const barW = Math.max(5, Math.min(18, (w - 8) / values.length - 4))
  return (
    <g data-anchor="spectrum-bar" className={focus === 'spectrum-bar' ? 'svgk-focus' : undefined}>
      <Label at={{ x: x + w / 2, y: y - 4 }} anchor="middle" cls="fg-lbl">
        eigenvalues
      </Label>
      <line x1={x} y1={zeroY} x2={x + w} y2={zeroY} className="fg-sil3" strokeWidth={1} />
      {values.map((v, k) => {
        const cx = x + 6 + k * (barW + 4) + barW / 2
        const neg = v < 0
        const mag = Math.abs(v)
        const barH = Math.max(1, (mag / maxAbs) * (neg ? barAreaDown : barAreaUp))
        return (
          <g key={k}>
            <rect x={cx - barW / 2} y={neg ? zeroY : zeroY - barH} width={barW} height={barH} rx={2} className={neg ? 'fg-op' : 'fg-op-fill'} fill={neg ? 'none' : undefined} strokeWidth={neg ? 1.4 : undefined} />
            <Label at={{ x: cx, y: neg ? zeroY + barH + 11 : zeroY - barH - 3 }} anchor="middle" cls="fg-lbl">
              {fix(v, 2)}
            </Label>
          </g>
        )
      })}
      {entropy !== null && (
        <Label at={{ x: x + w / 2, y: y + h + 2 }} anchor="middle" cls="fg-txt">
          {`S = ${fix(entropy, 3)}`}
        </Label>
      )}
      {flagged && (
        <g data-anchor="spectrum-flag">
          <Label at={{ x: x + w / 2, y: y + h + (entropy !== null ? 15 : 2) }} anchor="middle" cls="fg-op">
            {flag}
          </Label>
        </g>
      )}
    </g>
  )
}

function GridScene({ state: r, mode, width, height, focus, bare, slot }: { state: ResolvedMatrixGrid; mode: SvgMode; width: number; height: number; focus?: string | null; bare?: boolean; slot?: string | null }) {
  const print = mode === 'print'
  const own = print || !!bare
  const lines = own ? ownLines(r) : []
  const hue = (phi: number) => phaseColor(phi, mode)
  const readoutCount = own ? 0 : matrixReadouts(r).length
  const padTop = own ? 14 + 13 * lines.length : Math.max(60, 26 + 17 * readoutCount)
  const padBottom = own ? 26 : slot === 'top' ? 18 : 40
  const padX = own ? 14 : 24
  const panels: ('reduced' | 'svd' | 'spectrum')[] = []
  if (r.partialTrace) panels.push('reduced')
  if (r.svd) panels.push('svd')
  if (r.spectrum) panels.push('spectrum')
  const hasSide = panels.length > 0
  const sideW = hasSide ? Math.min(0.36 * (width - 2 * padX), 150) : 0
  const rowLabelW = r.labels === 'none' ? 0 : 40
  const colLabelH = r.labels === 'none' ? 0 : 18
  const gridAvailW = width - 2 * padX - (hasSide ? sideW + 18 : 0) - rowLabelW
  const gridAvailH = height - padTop - padBottom - colLabelH
  const size = Math.max(20, Math.min(gridAvailW, gridAvailH))
  const gx = padX + rowLabelW
  const gy = padTop + colLabelH
  const sideX = gx + size + 18
  const movedSet = r.ptranspose ? new Set(r.ptranspose.moved.map(([i, j]) => `${i}:${j}`)) : undefined

  // stack the side panels top to bottom: the reduced matrix (if any) keeps most of the height, the bar panels share
  // what is left equally (close to v1's fixed 0.58/0.4 split when 'reduced' and 'svd' are the only two present)
  const others = panels.filter((p) => p !== 'reduced').length
  const reducedH = panels.includes('reduced') ? (others ? size * 0.55 : size) : 0
  const otherH = others ? (size - reducedH) / others : 0
  let panelY = gy

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
        moved={movedSet}
        trace={!!r.trace}
        x={gx}
        y={gy}
        size={size}
        hue={hue}
        focus={focus}
      />
      {panels.map((kind) => {
        const panelH = kind === 'reduced' ? reducedH : otherH
        const y0 = panelY
        panelY += panelH
        if (kind === 'reduced' && r.partialTrace) {
          const reduced = r.partialTrace
          const rSize = Math.max(16, Math.min(sideW - 8, panelH - 20))
          const rx = sideX + (sideW - rSize) / 2
          const ry = y0 + (panelH - rSize) / 2
          const cellSize = rSize / reduced.n
          const bigCell = size / r.n
          return (
            <g key="reduced" data-anchor="reduced" className={focus === 'reduced' ? 'svgk-focus' : undefined}>
              {reduced.arrows.map(({ from, to }, k) => (
                // `from` is a diagonal index of the BIG matrix (row === col === from): one point, not a row/col pair
                <Arrow key={k} a={{ x: gx + bigCell * (from + 0.5), y: gy + bigCell * (from + 0.5) }} b={{ x: rx + cellSize * (to + 0.5), y: ry + cellSize * (to + 0.5) }} cls="fg-sil2" width={1} head={5} />
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
                {reduced.which === 'keep' ? `keep q${reduced.keep.join(', q')} → ${reduced.n}×${reduced.n}` : `Tr${reduced.which} → ${reduced.n}×${reduced.n}`}
              </Label>
            </g>
          )
        }
        if (kind === 'svd' && r.svd) {
          const bars = r.svd
          const maxV = Math.max(...bars, 1e-9)
          const barAreaH = panelH - 20
          const baseY = y0 + barAreaH + 14
          const barW = Math.max(6, Math.min(22, (sideW - 12) / bars.length - 6))
          return (
            <g key="svd" data-anchor="svd-bar" className={focus === 'svd-bar' ? 'svgk-focus' : undefined}>
              <Label at={{ x: sideX + sideW / 2, y: y0 }} anchor="middle" cls="fg-lbl">
                Schmidt coefficients
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
        }
        if (kind === 'spectrum' && r.spectrum)
          return <SpectrumBars key="spectrum" values={r.spectrum.values} entropy={r.spectrum.entropy} flag={r.spectrum.flag} x={sideX} y={y0 + 14} w={sideW} h={panelH - 14} focus={focus} />
        return null
      })}
      {own && <PhaseWheel x={width - 12} y={height - 10} mode={mode} />}
      {lines.map((t, k) => (
        <Label key={`rl${k}`} at={{ x: 8, y: 14 + 13 * k }} cls="fg-txt">
          {t}
        </Label>
      ))}
    </g>
  )
}

const LETTER_ANGLE: Record<string, number | null> = { I: null, X: 0, Y: (2 * Math.PI) / 3, Z: (4 * Math.PI) / 3 }

/** One Pauli letter, coloured by a fixed per-letter hue on the same wheel (I is neutral: it contributes nothing). */
function Letter({ ch, x, y, mode }: { ch: string; x: number; y: number; mode: SvgMode }) {
  const angle = LETTER_ANGLE[ch] ?? null
  return angle === null ? (
    <text x={x} y={y} textAnchor="middle" className="fg-sil2" style={{ fontWeight: 600 }}>
      {ch}
    </text>
  ) : (
    <text x={x} y={y} textAnchor="middle" style={{ fill: phaseColor(angle, mode), fontWeight: 600 }}>
      {ch}
    </text>
  )
}

function badgeText(row: ResolvedMatrixTableauRow): string {
  const parts: string[] = []
  if (row.card !== null) parts.push(`card ${row.card > 0 ? '+1' : '−1'}`)
  if (row.eigen !== null) parts.push(`eigen ${row.eigen > 0 ? '+1' : '−1'}`)
  if (row.matches !== null) parts.push(row.matches ? '✓' : '✗')
  return parts.join(' · ')
}

function TableauScene({ state: r, mode, width, height, bare }: { state: ResolvedMatrixTableau; mode: SvgMode; width: number; height: number; bare?: boolean }) {
  const own = mode === 'print' || !!bare
  const lines = own ? ownLines(r) : []
  const padTop = own ? 14 + 13 * lines.length : 20
  const padBottom = own ? 20 : 20
  const padX = own ? 14 : 24
  const rows = r.rows
  const hasBadges = rows.some((row) => row.card !== null || row.eigen !== null)
  const badgeW = hasBadges ? 110 : 0
  const availH = Math.max(40, height - padTop - padBottom)
  const extraRows = r.product ? 1.4 : 0
  const rowH = Math.min(26, availH / (rows.length + extraRows || 1))
  const colW = Math.min(26, (width - 2 * padX - badgeW) / Math.max(1, r.qubits))
  const x0 = padX
  const y0 = padTop
  return (
    <g className="svgk-scene" data-kind="matrix">
      {rows.map((row, i) => {
        const cy = y0 + rowH * (i + 0.5) + 4
        return (
          <g key={i} data-anchor={`tableau-row-${i}`}>
            {row.letters.map((ch, j) => (
              <Letter key={j} ch={ch} x={x0 + colW * (j + 0.5)} y={cy} mode={mode} />
            ))}
            {hasBadges && (
              <Label at={{ x: x0 + colW * r.qubits + 10, y: cy }} cls="fg-lbl">
                {badgeText(row)}
              </Label>
            )}
          </g>
        )
      })}
      {r.product && (
        <g data-anchor="tableau-product">
          <line x1={x0} y1={y0 + rowH * rows.length + 2} x2={x0 + colW * r.qubits} y2={y0 + rowH * rows.length + 2} className="fg-sil3" strokeWidth={1} />
          {[...r.product.pauli].map((ch, j) => (
            <Letter key={j} ch={ch} x={x0 + colW * (j + 0.5)} y={y0 + rowH * (rows.length + 0.8) + 4} mode={mode} />
          ))}
          <Label at={{ x: x0 + colW * r.qubits + 10, y: y0 + rowH * (rows.length + 0.8) + 4 }} cls="fg-lbl">
            {`phase ${r.product.phase.re === 1 && r.product.phase.im === 0 ? '+1' : r.product.phase.re === -1 && r.product.phase.im === 0 ? '−1' : r.product.phase.im === 1 ? '+i' : r.product.phase.im === -1 ? '−i' : fix(r.product.phase.re)}`}
          </Label>
        </g>
      )}
      {lines.map((t, k) => (
        <Label key={`rl${k}`} at={{ x: 8, y: 14 + 13 * k }} cls="fg-txt">
          {t}
        </Label>
      ))}
    </g>
  )
}

export function MatrixScene(props: SvgSceneProps<'matrix'>) {
  const { state } = props
  return state.view === 'tableau' ? <TableauScene state={state} mode={props.mode} width={props.width} height={props.height} bare={props.bare} /> : <GridScene {...props} state={state} />
}
