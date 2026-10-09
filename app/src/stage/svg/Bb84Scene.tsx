/**
 * The `bb84` scene: ONE component for the live stage, the reading version, the print figure and the `bb84-bench` widget.
 * It draws the resolved ledger only (stage/svg/bb84.ts computed every bit, basis, outcome and tally with the engine):
 *   one row per photon (the last 12 rounds), left to right: the round number · ALICE (basis chip, her bit, the polarization
 *   she prepared as a short line at its angle) · EVE (her basis, her reading, the state she resent; a dash when she let the
 *   photon through) · BOB (basis chip, his bit) · a mark column: a check for a kept round, a boxed cross for a kept round whose
 *   bits differ, "T" for a round in the public test sample.
 * After sifting the rounds with different bases dim. Below the rows, with the `qber` readout, a gauge from 0 to ½: the exact Q as a
 * tick, Q̂ as a dot with its ±1σ band. Structure is silver; the state colour marks what is kept and what went wrong, and the
 * amber / cobalt outcome hues are never used (a bit is a code, not a ± outcome).
 */
import type { SvgSceneProps } from '../svgKinds'
import type { Bb84Row, ResolvedBb84 } from '../types'
import { bb84Readouts } from './bb84'
import { Label, fix } from './draw'

/** The polarization angle of a prepared state (degrees counter-clockwise from horizontal). */
const ANGLE: Record<'H' | 'V' | 'D' | 'A', number> = { H: 0, V: 90, D: 45, A: 135 }

export interface Bb84Layout {
  padX: number
  top: number
  /** Header baseline y. */
  headY: number
  rowH: number
  /** y of the first row's top. */
  rowsY: number
  /** Column x ranges, in order n, alice, eve, bob, mark (a hidden party has none). */
  cols: { n: [number, number]; alice: [number, number] | null; eve: [number, number] | null; bob: [number, number] | null; mark: [number, number] }
  gauge: { y: number; x0: number; x1: number } | null
  /** Lines of text the figure carries itself (print and bare), at the top. */
  lines: string[]
  bottom: number
}

/** Where everything goes, for a drawing box and a resolved ledger (pure, so a test can check it never leaves the box). */
export function bb84Layout(r: ResolvedBb84, width: number, height: number, own: boolean, slot?: string | null): Bb84Layout {
  const lines = own ? bb84Readouts(r).map((x) => x.text) : []
  const padX = own ? 12 : 26
  const gaugeOn = r.readouts.includes('qber') && r.kept > 0
  const nReadouts = bb84Readouts(r).length
  // the live stage keeps room for the passport (its note wraps to four lines) and the readout column above the table
  const top = own ? 8 + 13 * lines.length : Math.max(116, 26 + 19 * nReadouts)
  const bottom = own ? 8 : slot === 'top' ? 14 : 92
  const gaugeH = gaugeOn ? 62 : 0
  const head = 20
  const avail = height - top - bottom - head - gaugeH - 4
  const rows = Math.max(1, r.rows.length)
  const rowH = Math.max(own ? 13 : 16, Math.min(own ? 20 : 30, avail / rows))
  const tableW = width - 2 * padX
  const w = { n: 1, alice: r.show.alice ? 4 : 0, eve: r.show.eve ? 4 : 0, bob: r.show.bob ? 3 : 0, mark: 2 }
  const total = w.n + w.alice + w.eve + w.bob + w.mark
  let x = padX
  const take = (k: keyof typeof w): [number, number] | null => {
    if (w[k] === 0) return null
    const a = x
    x += (tableW * w[k]) / total
    return [a, x]
  }
  const cols = { n: take('n')!, alice: take('alice'), eve: take('eve'), bob: take('bob'), mark: take('mark')! }
  const rowsY = top + head
  return {
    padX,
    top,
    headY: top + 13,
    rowH,
    rowsY,
    cols,
    gauge: gaugeOn ? { y: rowsY + rows * rowH + 40, x0: padX + 8, x1: width - padX - 8 } : null,
    lines,
    bottom,
  }
}

/** A short line at the angle of a polarization (undirected: it has no arrow), centred on (cx, cy). */
function Glyph({ cx, cy, letter, len, cls = 'fg-state' }: { cx: number; cy: number; letter: 'H' | 'V' | 'D' | 'A'; len: number; cls?: string }) {
  const a = (ANGLE[letter] * Math.PI) / 180
  const dx = Math.cos(a) * len
  const dy = -Math.sin(a) * len
  return (
    <g data-glyph={letter}>
      <line x1={cx - dx} y1={cy - dy} x2={cx + dx} y2={cy + dy} className={cls} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  )
}

/** The basis as a small chip: H/V or D/A. */
function Chip({ x, cy, basis, w, dim }: { x: number; cy: number; basis: 'HV' | 'DA'; w: number; dim?: boolean }) {
  return (
    <g opacity={dim ? 0.7 : 1}>
      <rect x={x} y={cy - 7} width={w} height={14} rx={3} fill="none" className="fg-sil" strokeWidth={1} />
      <text x={x + w / 2} y={cy + 4} textAnchor="middle" className="fg-lbl" style={{ fontSize: 10 }}>
        {basis === 'HV' ? 'H/V' : 'D/A'}
      </text>
    </g>
  )
}

function Check({ x, cy }: { x: number; cy: number }) {
  return <path d={`M${x - 5},${cy} l3.5,4 l7,-8`} fill="none" className="fg-state" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
}
function Cross({ x, cy }: { x: number; cy: number }) {
  return <path d={`M${x - 4},${cy - 4} l8,8 m0,-8 l-8,8`} fill="none" className="fg-state" strokeWidth={2.2} strokeLinecap="round" />
}

export function Bb84Scene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'bb84'>) {
  const print = mode === 'print'
  const own = print || !!bare
  const L = bb84Layout(r, width, height, own, slot)
  const f = (a: string) => (focus === a ? 'svgk-focus' : undefined)
  const chipW = Math.max(26, Math.min(34, L.rowH + 8))
  const glyphLen = Math.max(4, Math.min(8, L.rowH / 2 - 3))
  const sift = r.sift
  const cell = (c: [number, number] | null) => (c ? c[0] + 6 : 0)

  const rowEls = r.rows.map((row: Bb84Row, i) => {
    const y = L.rowsY + i * L.rowH
    const cy = y + L.rowH / 2
    const dim = sift && !row.kept
    const stripe = i % 2 === 0
    return (
      <g key={row.n} data-row={row.n} data-anchor="row" opacity={dim ? 0.38 : 1} className={f('row')}>
        {stripe && <rect x={L.padX - 4} y={y} width={width - 2 * L.padX + 8} height={L.rowH} rx={3} className="fg-sil-fill" fillOpacity={0.07} />}
        {row.highlighted && <rect x={L.padX - 4} y={y} width={width - 2 * L.padX + 8} height={L.rowH} rx={3} fill="none" className="fg-state" strokeWidth={1.4} />}
        <text x={L.cols.n[0] + 2} y={cy + 4} className="fg-lbl" style={{ fontSize: own ? 10 : 11 }}>
          {row.n}
        </text>
        {L.cols.alice && (
          <g data-anchor="alice" className={f('alice')}>
            <Chip x={cell(L.cols.alice)} cy={cy} basis={row.aBasis} w={chipW} />
            <text x={cell(L.cols.alice) + chipW + 10} y={cy + 5} className="fg-txt fg-big" textAnchor="middle">
              {row.aBit}
            </text>
            <Glyph cx={cell(L.cols.alice) + chipW + 30} cy={cy} letter={row.aState} len={glyphLen} />
          </g>
        )}
        {L.cols.eve && (
          <g data-anchor="eve" className={f('eve')}>
            {row.eIntercept && row.eBit !== null && row.eState ? (
              <>
                <Chip x={cell(L.cols.eve)} cy={cy} basis={row.eBasis} w={chipW} />
                <text x={cell(L.cols.eve) + chipW + 10} y={cy + 5} className="fg-txt fg-big" textAnchor="middle">
                  {row.eBit}
                </text>
                <Glyph cx={cell(L.cols.eve) + chipW + 30} cy={cy} letter={row.eState} len={glyphLen} cls="fg-sil" />
              </>
            ) : (
              <text x={cell(L.cols.eve) + chipW / 2} y={cy + 4} className="fg-lbl" textAnchor="middle">
                –
              </text>
            )}
          </g>
        )}
        {L.cols.bob && (
          <g data-anchor="bob" className={f('bob')}>
            <Chip x={cell(L.cols.bob)} cy={cy} basis={row.bBasis} w={chipW} />
            <text x={cell(L.cols.bob) + chipW + 10} y={cy + 5} className="fg-txt fg-big" textAnchor="middle">
              {row.bBit}
            </text>
          </g>
        )}
        <g data-anchor="sift" className={f('sift')}>
          {sift && row.kept && !row.error && !row.tested && <Check x={(L.cols.mark[0] + L.cols.mark[1]) / 2 - 4} cy={cy} />}
          {sift && row.kept && row.error && (
            <g data-mark="error">
              <rect x={(L.cols.mark[0] + L.cols.mark[1]) / 2 - 11} y={cy - 8} width={22} height={16} rx={3} fill="none" className="fg-state" strokeWidth={1.4} />
              <Cross x={(L.cols.mark[0] + L.cols.mark[1]) / 2} cy={cy} />
            </g>
          )}
          {row.luck && !sift && (
            <text x={(L.cols.mark[0] + L.cols.mark[1]) / 2} y={cy + 4} className="fg-lbl" textAnchor="middle">
              =
            </text>
          )}
        </g>
        {row.tested && (
          <g data-anchor="test" className={f('test')} data-mark="test">
            <rect x={L.cols.mark[1] - 24} y={cy - 7} width={20} height={14} rx={3} fill="none" className="fg-state" strokeWidth={1.2} strokeDasharray="3 2" />
            <text x={L.cols.mark[1] - 14} y={cy + 4} className="fg-lbl" textAnchor="middle" style={{ fontSize: 10 }}>
              {row.error ? '✗' : '='}
            </text>
          </g>
        )}
      </g>
    )
  })

  return (
    <g className="svgk-scene" data-kind="bb84">
      {/* the figure's own text lines (print and the reading version; the live stage has the readout column) */}
      {L.lines.map((t, i) => (
        <Label key={i} at={{ x: L.padX, y: 16 + 13 * i }} cls="fg-lbl">
          {t}
        </Label>
      ))}
      {/* column heads */}
      <g data-head>
        <Label at={{ x: L.cols.n[0] + 2, y: L.headY }} cls="fg-lbl">
          #
        </Label>
        {L.cols.alice && (
          <Label at={{ x: cell(L.cols.alice), y: L.headY }} cls="fg-lbl">
            Alice
          </Label>
        )}
        {L.cols.eve && (
          <Label at={{ x: cell(L.cols.eve), y: L.headY }} cls="fg-lbl">
            Eve
          </Label>
        )}
        {L.cols.bob && (
          <Label at={{ x: cell(L.cols.bob), y: L.headY }} cls="fg-lbl">
            Bob
          </Label>
        )}
        {sift && (
          <Label at={{ x: (L.cols.mark[0] + L.cols.mark[1]) / 2, y: L.headY }} anchor="middle" cls="fg-lbl">
            kept
          </Label>
        )}
        <line x1={L.padX - 4} y1={L.rowsY - 3} x2={width - L.padX + 4} y2={L.rowsY - 3} className="fg-sil2" strokeWidth={1} />
      </g>
      {rowEls}
      {r.count > r.rows.length && (
        <Label at={{ x: width - L.padX, y: L.rowsY + r.rows.length * L.rowH + 13 }} anchor="end" cls="fg-lbl">
          {`last ${r.rows.length} of ${r.count} rounds`}
        </Label>
      )}

      {/* the Q̂ gauge: the exact Q as a tick, Q̂ as a dot with its ±1σ band, on a 0 … ½ scale */}
      {L.gauge && r.qhat !== null && (
        <g data-anchor="qber" className={f('qber')}>
          {(() => {
            const g = L.gauge!
            const sx = (q: number) => g.x0 + (Math.min(0.5, Math.max(0, q)) / 0.5) * (g.x1 - g.x0)
            return (
              <>
                <line x1={g.x0} y1={g.y} x2={g.x1} y2={g.y} className="fg-sil2" strokeWidth={1.2} />
                {[0, 0.25, 0.5].map((q) => (
                  <g key={q}>
                    <line x1={sx(q)} y1={g.y - 3} x2={sx(q)} y2={g.y + 3} className="fg-sil2" strokeWidth={1} />
                    <Label at={{ x: sx(q), y: g.y + 16 }} anchor="middle" cls="fg-lbl">
                      {fix(q, 2)}
                    </Label>
                  </g>
                ))}
                {r.exactQ > 0 && (
                  <g>
                    <line x1={sx(r.exactQ)} y1={g.y - 10} x2={sx(r.exactQ)} y2={g.y + 10} className="fg-sil" strokeWidth={2} strokeDasharray="3 2" />
                    <Label at={{ x: sx(r.exactQ), y: g.y - 14 }} anchor="middle" cls="fg-lbl">
                      {`exact ${fix(r.exactQ, 3)}`}
                    </Label>
                  </g>
                )}
                {r.sigma !== null && <line x1={sx(r.qhat - r.sigma)} y1={g.y} x2={sx(r.qhat + r.sigma)} y2={g.y} className="fg-state" strokeWidth={4} strokeLinecap="round" opacity={0.55} />}
                <circle cx={sx(r.qhat)} cy={g.y} r={4.5} className="fg-state-fill" />
              </>
            )
          })()}
        </g>
      )}
    </g>
  )
}
