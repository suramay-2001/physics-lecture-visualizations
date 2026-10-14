/**
 * The `code` scene: ONE component for the live stage, the reading version and the print figure. It draws the resolved code only (stage/svg/code.ts took every
 * check, syndrome, correction, residual, logical operator, code word and Tanner edge from physics/qec):
 *   layout  discs are data qubits, squares are checks (X-type and Z-type in the two fixed hues of the X and Z letters, as the matrix tableau colours them; a
 *           check with several kinds of letter is silver) and an edge joins a check to every qubit it acts on, in the colour of the letter it applies there.
 *           The rotated surface code gets its plaquettes (and half-discs on the boundary), Steane its three faces. The bicycle codes are an ℓ × m tile of
 *           small dots (L qubits filled, R qubits hollow, X and Z check squares) with the edges of the FOCUSED check(s) only: local ones as lines, long-range
 *           ones as labelled stubs that run off toward their target, whose cell is named; a SHIFT is an arrow field on the L qubits.
 *           Overlays: the error's letters on the hit discs; lit checks (a cobalt ring and "−1": the check reads −1); the correction as outlined letters;
 *           the residual as a dashed ring; a minimum-weight logical operator as white rings.
 *   checks  the generators as a table of coloured Pauli letters, then the listed errors with a cell per check (filled = the check reads −1).
 *   words   a code word's basis strings with a bar the length of each amplitude's size and its sign.
 *   torus / patch (B1) the toric, rotated and planar sources of stage/svg/code.surface.ts, drawn by CodeSurfaceScene.tsx; their Tanner-graph 'layout' is the layout above.
 * Colour is a code: the hue of a letter is its Pauli (stage/svg/MatrixScene.tsx), amber and cobalt are the +1 and −1 readings, orchid marks operations. A
 * position is a drawing choice (the passport says so). The text is plain Unicode (no TeX inside SVG), and every disc and square carries an accessible name.
 */
import type { ReactNode } from 'react'
import { phaseColor } from '../phaseHue'
import type { SvgMode, SvgSceneProps } from '../svgKinds'
import type { ResolvedCode, ResolvedCodeCheck, ResolvedCodeFocusEdge, ResolvedCodePlaquette, ResolvedCodeQubit } from '../types'
import { codeReadouts } from './code'
import { BBView, BPView } from './CodeBBScene'
import { OperatorRings, PatchView, QubitMark, TorusView, WRAP_MARGIN } from './CodeSurfaceScene'
import { Arrow, Label, fix, type Pt } from './draw'
import { LETTER_ANGLE } from './MatrixScene'

export interface CodeBox {
  x: number
  y: number
  w: number
  h: number
}

const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x))

/** The drawing area inside a box of width × height: room for the passport above and the caption below on the live stage, or for the figure's own text lines. */
export function codeArea(width: number, height: number, own: boolean, slot: string | null | undefined, readoutCount: number, lineCount: number): CodeBox {
  const padX = own ? 12 : 24
  const paneTop = slot === 'top'
  const paneBottom = slot === 'bottom'
  const top = own ? 6 + 13 * lineCount + (lineCount ? 6 : 0) : paneTop ? Math.max(60, 26 + 17 * readoutCount) : paneBottom ? 34 : Math.max(112, 26 + 17 * readoutCount)
  const bottom = own ? 6 : paneTop ? 14 : 92
  return { x: padX, y: top, w: Math.max(80, width - 2 * padX), h: Math.max(60, height - top - bottom) }
}

/** Pack short texts into lines of at most `max` characters, separated by " · " (a text longer than a line is wrapped). */
export function packLines(texts: readonly string[], max: number): string[] {
  const out: string[] = []
  let cur = ''
  for (const t of texts) {
    if (cur && (cur + ' · ' + t).length > max) {
      out.push(cur)
      cur = t
    } else cur = cur ? cur + ' · ' + t : t
  }
  if (cur) out.push(cur)
  return out.flatMap((l) => wrapLine(l, max))
}

/** Break a line of text at spaces into lines of at most `max` characters. */
export function wrapLine(text: string, max: number): string[] {
  const out: string[] = []
  let cur = ''
  for (const word of text.split(' ')) {
    if (cur && (cur + ' ' + word).length > max) {
      out.push(cur)
      cur = '    ' + word
    } else cur = cur ? cur + ' ' + word : word
  }
  if (cur) out.push(cur)
  return out
}

/* ------------------------------------------------------------------ colours ------------------------------------------------------------------ */
/** The fixed hue of a Pauli letter (the matrix tableau's), or undefined for I. */
export function letterColor(ch: string, mode: SvgMode): string | undefined {
  const a = LETTER_ANGLE[ch]
  return a === null || a === undefined ? undefined : phaseColor(a, mode)
}
const checkColor = (kind: ResolvedCodeCheck['kind'], mode: SvgMode): string => (kind === 'mixed' ? 'var(--fg-sil)' : letterColor(kind, mode)!)

/* ------------------------------------------------------------------ geometry ------------------------------------------------------------------ */
export interface CodeGeometry {
  /** Pixels per layout unit and where layout point (x, y) lands. */
  unit: number
  at: (x: number, y: number) => Pt
  /** Radius of a data disc, half the side of a check square. */
  disc: number
  sq: number
  area: CodeBox
  lines: string[]
}

/** Where the picture goes in a drawing box (pure, so a test can check that nothing leaves the box). */
export function codeGeometry(r: ResolvedCode, width: number, height: number, own: boolean, slot?: string | null): CodeGeometry {
  const readouts = codeReadouts(r)
  // the toric / rotated / planar sources have many short readouts: they are packed several to a line so the figure keeps room for the picture
  const lines = own ? [r.name, ...(r.surface || r.bbx || r.bpx ? packLines(readouts.map((x) => (x.name === 'syndrome' ? `syndrome: ${x.text}` : x.text)), 46) : readouts.flatMap((x) => wrapLine(x.name === 'syndrome' ? `syndrome: ${x.text}` : x.text, 50)))] : []
  const base = codeArea(width, height, own, slot, readouts.length, lines.length)
  // the live stage names the code in a strip above the drawing (the figure carries the name as its first line)
  const title = own ? 0 : 20
  const area = { ...base, y: base.y + title, h: Math.max(60, base.h - title) }
  const torus = r.family === 'torus'
  // B1: the toric torus view draws edge qubits at the midpoints of a wrapped grid, so its marks are small like the bicycle tile's; its margin holds the wrap arrows
  const surfaceTorus = !!r.surface && r.view === 'torus'
  // B2: the bicycle codes' cell blocks are small marks on a tile; the belief-propagation graphs are a few big ones
  const bbf = r.family === 'bb'
  const bpf = r.family === 'bp'
  const [x0, y0, x1, y1] = r.bounds
  // margin around the extreme centres, in layout units, for a disc's own size, a half-disc, the long-range labels; and a strip for the legend at the bottom
  const margin = surfaceTorus ? WRAP_MARGIN : torus || bbf ? (own ? 0.55 : 0.7) : own ? 0.6 : 0.8
  const legend = own ? 20 : 22
  const W = x1 - x0 + 2 * margin
  const H = y1 - y0 + 2 * margin
  const maxUnit = surfaceTorus ? 88 : bbf ? 44 : bpf ? 90 : torus ? 44 : 140
  const unit = Math.max(4, Math.min((area.w) / W, (area.h - legend) / H, maxUnit))
  const ox = area.x + (area.w - (x1 - x0) * unit) / 2
  const oy = area.y + (area.h - legend - (y1 - y0) * unit) / 2
  const disc = surfaceTorus ? clamp(unit * 0.17, 2.4, 11) : bbf ? clamp(unit * 0.3, 1.6, 6) : bpf ? clamp(unit * 0.17, 6, 14) : torus ? clamp(unit * 0.3, 2, 6) : r.surface ? clamp(unit * 0.2, 4.5, 18) : clamp(unit * 0.2, 7, 18)
  const sq = surfaceTorus ? clamp(unit * 0.1, 2.2, 8) : bbf ? clamp(unit * 0.26, 1.4, 5) : bpf ? clamp(unit * 0.1, 5, 8) : torus ? clamp(unit * 0.26, 1.8, 5.5) : r.surface ? clamp(unit * 0.115, 3.5, 11) : clamp(unit * 0.115, 5, 11)
  return { unit, at: (x, y) => ({ x: ox + (x - x0) * unit, y: oy + (y - y0) * unit }), disc, sq, area, lines }
}

const f2 = (v: number): string => v.toFixed(1)

/* ------------------------------------------------------------------ layout pieces ------------------------------------------------------------------ */
interface Ctx {
  r: ResolvedCode
  g: CodeGeometry
  mode: SvgMode
  focus: string | null | undefined
  own: boolean
}
const fcls = (c: Ctx, a: string): string | undefined => (c.focus === a ? 'svgk-focus' : undefined)

function Plaquette({ p, c }: { p: ResolvedCodePlaquette; c: Ctx }) {
  const { g, r, mode } = c
  const pts = p.points.map(([x, y]) => g.at(x, y))
  const lit = p.checks.some((i) => r.checks[i].flipped === 1)
  const hue = p.kind === 'XZ' ? 'var(--fg-sil)' : checkColor(p.kind, mode)
  let d: string
  if (p.apex && pts.length === 2) {
    const [a, b] = pts
    const apex = g.at(p.apex[0], p.apex[1])
    const rad = Math.hypot(b.x - a.x, b.y - a.y) / 2
    const cross = (b.x - a.x) * (apex.y - a.y) - (b.y - a.y) * (apex.x - a.x)
    d = `M${f2(a.x)},${f2(a.y)} A${f2(rad)},${f2(rad)} 0 0 ${cross > 0 ? 0 : 1} ${f2(b.x)},${f2(b.y)} Z`
  } else d = `M${pts.map((q) => `${f2(q.x)},${f2(q.y)}`).join(' L')} Z`
  return (
    <g data-anchor="check">
      <path d={d} style={{ fill: hue }} opacity={p.kind === 'XZ' ? 0.1 : 0.17} stroke="none" />
      {lit && <path d={d} className="fg-minus-fill" opacity={0.3} stroke="none" />}
      <path d={d} fill="none" style={{ stroke: hue }} opacity={0.55} strokeWidth={1} />
    </g>
  )
}

function Edges({ c }: { c: Ctx }) {
  const { r, g, mode } = c
  const thin = r.family === 'surface' || !!r.surface
  return (
    <g data-anchor="edge" className={fcls(c, 'edge')}>
      {r.edges.map((e, i) => {
        const a = g.at(r.checks[e.check].x, r.checks[e.check].y)
        const b = g.at(r.qubits[e.qubit].x, r.qubits[e.qubit].y)
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} style={{ stroke: letterColor(e.letter, mode) }} strokeWidth={thin ? 1 : 1.6} opacity={thin ? 0.5 : 0.85} />
      })}
    </g>
  )
}

function CheckSquare({ ch, c }: { ch: ResolvedCodeCheck; c: Ctx }) {
  const { g, mode, r } = c
  const p = g.at(ch.x, ch.y)
  const s = g.sq
  const hue = checkColor(ch.kind, mode)
  const lit = ch.flipped === 1
  const showSign = r.show.includes('syndrome') && ch.flipped !== null
  const small = r.family === 'torus'
  return (
    <g role="img" aria-label={ch.aria} data-check={ch.label} data-lit={ch.flipped ?? undefined}>
      <title>{ch.aria}</title>
      {showSign && lit && <rect x={p.x - s - 3.5} y={p.y - s - 3.5} width={2 * s + 7} height={2 * s + 7} rx={3} fill="none" className="fg-minus" strokeWidth={small ? 1.8 : 3} />}
      <rect x={p.x - s} y={p.y - s} width={2 * s} height={2 * s} rx={small ? 0.8 : 2} style={{ fill: 'var(--fg-halo)', stroke: hue }} strokeWidth={small ? 1 : 2} />
      {!small && <rect x={p.x - s + 2.2} y={p.y - s + 2.2} width={2 * s - 4.4} height={2 * s - 4.4} rx={1} style={{ fill: hue }} opacity={0.55} />}
      {!small && (showSign && lit ? (
        <text x={p.x + s + 4} y={p.y - s - 2} className="fg-minus-t" style={{ fontSize: 11, fontWeight: 700 }}>
          {g.unit >= 50 || r.checks.length <= 8 ? `${ch.label} −1` : '−1'}
        </text>
      ) : r.checks.length <= 12 && g.unit >= 80 ? (
        <text x={p.x + s + 4} y={p.y - s - 2} className="fg-lbl" style={{ fontSize: 10 }} opacity={0.85}>
          {ch.label}
        </text>
      ) : null)}
    </g>
  )
}

function QubitDisc({ q, c }: { q: ResolvedCodeQubit; c: Ctx }) {
  const { g, mode, r } = c
  const p = g.at(q.x, q.y)
  const rad = g.disc
  const torus = r.family === 'torus'
  const hit = q.error ? letterColor(q.error, mode) : undefined
  if (torus) {
    return (
      <g role="img" aria-label={q.aria} data-qubit={q.index}>
        <title>{q.aria}</title>
        {q.family === 'R' ? (
          <circle cx={p.x} cy={p.y} r={rad} fill="var(--fg-halo)" className="fg-state" strokeWidth={1.2} />
        ) : (
          <circle cx={p.x} cy={p.y} r={rad} className="fg-sil2-fill" style={{ fill: 'var(--fg-sil)' }} />
        )}
        {hit && <circle cx={p.x} cy={p.y} r={rad + 1.6} style={{ fill: hit }} stroke="var(--fg-halo)" strokeWidth={0.8} />}
      </g>
    )
  }
  const size = clamp(rad * 1.05, 9, 15)
  return (
    <g role="img" aria-label={q.aria} data-qubit={q.index}>
      <title>{q.aria}</title>
      <circle cx={p.x} cy={p.y} r={rad} style={{ fill: hit ?? 'var(--fg-halo)' }} className={hit ? undefined : 'fg-sil'} strokeWidth={hit ? 0 : 1.6} />
      {hit ? (
        <>
          <text x={p.x} y={p.y + size * 0.36} textAnchor="middle" style={{ fontSize: size * 1.1, fontWeight: 800, fill: 'var(--fg-halo)' }}>
            {q.error}
          </text>
          <text x={p.x - rad - 2} y={p.y - rad - 1} textAnchor="end" className="fg-lbl" style={{ fontSize: 10 }}>
            {q.label}
          </text>
        </>
      ) : (
        <text x={p.x} y={p.y + size * 0.36} textAnchor="middle" className="fg-txt" style={{ fontSize: size, fontWeight: 600 }}>
          {q.label}
        </text>
      )}
    </g>
  )
}

/** The correction (outlined letters, lower right), the residual (dashed ring) and the logical operator (white rings, upper-left letters). */
function Marks({ q, c }: { q: ResolvedCodeQubit; c: Ctx }) {
  const { g, mode, r } = c
  const p = g.at(q.x, q.y)
  const rad = g.disc
  const torus = r.family === 'torus'
  return (
    <g>
      {q.correction && (
        <g data-anchor="correction" className={fcls(c, 'correction')}>
          <circle cx={p.x} cy={p.y} r={rad + (torus ? 3 : 4)} fill="none" style={{ stroke: letterColor(q.correction, mode) }} strokeWidth={torus ? 1.2 : 1.8} strokeDasharray="3 2" />
          {!torus && (
            <text
              x={p.x}
              y={p.y + rad + 17}
              textAnchor="middle"
              fill="none"
              style={{ stroke: letterColor(q.correction, mode), fontSize: clamp(rad * 1.3, 13, 20), fontWeight: 800, paintOrder: 'normal' }}
              strokeWidth={1.3}
            >
              {q.correction}
            </text>
          )}
        </g>
      )}
      {q.residual && (
        <circle data-anchor="residual" className={`fg-op ${fcls(c, 'residual') ?? ''}`} cx={p.x} cy={p.y} r={rad + (torus ? 5.5 : 8)} fill="none" strokeWidth={torus ? 1.4 : 2.2} strokeDasharray={torus ? '2 1.5' : '5 3'} />
      )}
      {q.logical && (
        <g data-anchor="logical" className={fcls(c, 'logical')}>
          <circle className="fg-state" cx={p.x} cy={p.y} r={rad + (torus ? 2.6 : 3.4)} fill="none" strokeWidth={torus ? 1.5 : 2.6} />
          {!torus && (
            <text x={p.x + rad + 3} y={p.y - rad} className="fg-lbl" style={{ fontSize: 11, fontWeight: 700 }}>
              {q.logical}
            </text>
          )}
        </g>
      )}
    </g>
  )
}

/* ---------------------------------------------------------------- the bicycle tile ---------------------------------------------------------------- */
function Stub({ e, from, c, label }: { e: ResolvedCodeFocusEdge; from: Pt; c: Ctx; label: string }) {
  const { g, mode } = c
  const hue = letterColor(e.letter, mode)
  const tip = g.at(e.unrolled[0], e.unrolled[1])
  const dx = tip.x - from.x
  const dy = tip.y - from.y
  const len = Math.hypot(dx, dy) || 1
  const L = Math.min(len, clamp(g.unit * 3.2, 26, 80))
  const end: Pt = { x: from.x + (dx / len) * L, y: from.y + (dy / len) * L }
  // keep the label inside the box: put it at the stub's end, pulled inward at the box's edges
  const w = label.length * 5.6
  const lx = clamp(end.x + (dx >= 0 ? 4 : -4), 6 + (dx >= 0 ? 0 : w), (c.g.area.x * 2 + c.g.area.w) - 6 - (dx >= 0 ? w : 0))
  return (
    <g data-anchor="stub" className={fcls(c, 'stub')}>
      <Arrow a={from} b={end} color={hue} width={2.2} head={7} dashed />
      <text x={lx} y={end.y + (dy >= 0 ? 12 : -5)} textAnchor={dx >= 0 ? 'start' : 'end'} className="fg-lbl" style={{ fontSize: 10.5, fontWeight: 600 }}>
        {label}
      </text>
    </g>
  )
}

function TileLayer({ c }: { c: Ctx }) {
  const { r, g, mode } = c
  const t = r.tile!
  const a = g.at(t.rect[0], t.rect[1])
  const b = g.at(t.rect[2], t.rect[3])
  return (
    <g>
      <rect x={a.x} y={a.y} width={b.x - a.x} height={b.y - a.y} rx={3} fill="none" className="fg-sil3" strokeWidth={1} strokeDasharray="4 3" />
      {t.focus.map((f) => {
        const ch = r.checks[f.check]
        const from = g.at(ch.x, ch.y)
        const hue = checkColor(ch.kind, mode)
        return (
          <g key={f.check} data-focus={f.label}>
            {f.edges.map((e, i) => {
              const to = g.at(e.at[0], e.at[1])
              const color = letterColor(e.letter, mode)
              const stub = e.kind === 'long' || e.wraps
              return (
                <g key={i}>
                  {!stub && <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} style={{ stroke: color }} strokeWidth={2.2} data-anchor="edge" />}
                  <circle cx={to.x} cy={to.y} r={g.disc + 3.2} fill="none" style={{ stroke: color }} strokeWidth={2.2} />
                  {stub && <Stub e={e} from={from} c={c} label={`→ ${e.target}`} />}
                </g>
              )
            })}
            <rect x={from.x - g.sq * 1.7} y={from.y - g.sq * 1.7} width={g.sq * 3.4} height={g.sq * 3.4} rx={2} fill="none" style={{ stroke: hue }} strokeWidth={2.2} />
          </g>
        )
      })}
      {t.shift && <ShiftField c={c} />}
    </g>
  )
}

function ShiftField({ c }: { c: Ctx }) {
  const { r, g } = c
  const s = r.tile!.shift!
  const [dx, dy] = s.delta
  // the direction on screen (x east, y south = down): a step north is up
  const ux = dx === 0 && dy === 0 ? 0 : (2 * dx) / Math.hypot(2 * dx, 2 * dy)
  const uy = dx === 0 && dy === 0 ? 0 : (-2 * dy) / Math.hypot(2 * dx, 2 * dy)
  const len = clamp(g.unit * 1.3, 6, 22)
  const from = g.at(r.qubits[s.sample.from].x, r.qubits[s.sample.from].y)
  const to = g.at(r.qubits[s.sample.to].x, r.qubits[s.sample.to].y)
  return (
    <g data-anchor="shift" className={fcls(c, 'shift')}>
      {r.qubits
        .filter((q) => q.family === 'L')
        .map((q) => {
          const p = g.at(q.x, q.y)
          return <Arrow key={q.index} a={p} b={{ x: p.x + ux * len, y: p.y + uy * len }} cls="fg-op" width={1} head={4} />
        })}
      <circle cx={from.x} cy={from.y} r={g.disc + 3} fill="none" className="fg-op" strokeWidth={1.8} />
      <circle cx={to.x} cy={to.y} r={g.disc + 3} fill="none" className="fg-op" strokeWidth={1.8} strokeDasharray="2.5 2" />
    </g>
  )
}

/* ---------------------------------------------------------------- legend ---------------------------------------------------------------- */
function Legend({ c }: { c: Ctx }) {
  const { r, g, mode } = c
  const y = g.area.y + g.area.h - 6
  const x0 = g.area.x
  const items: ReactNode[] = []
  let x = x0
  const add = (w: number, node: ReactNode) => {
    items.push(<g key={items.length}>{node}</g>)
    x += w
  }
  const torus = r.family === 'torus'
  add(torus ? 76 : 70, (
    <>
      <circle cx={x + 5} cy={y - 4} r={4.5} style={{ fill: torus ? 'var(--fg-sil)' : 'var(--fg-halo)' }} className={torus ? undefined : 'fg-sil'} strokeWidth={1.4} />
      <text x={x + 14} y={y} className="fg-lbl">
        {torus ? 'L qubit' : 'qubit'}
      </text>
    </>
  ))
  if (torus)
    add(76, (
      <>
        <circle cx={x + 5} cy={y - 4} r={4.2} fill="var(--fg-halo)" className="fg-state" strokeWidth={1.3} />
        <text x={x + 14} y={y} className="fg-lbl">
          R qubit
        </text>
      </>
    ))
  if (r.checks.some((k) => k.kind === 'X'))
    add(80, (
      <>
        <rect x={x} y={y - 9} width={9} height={9} style={{ fill: 'var(--fg-halo)', stroke: letterColor('X', mode) }} strokeWidth={1.8} />
        <text x={x + 14} y={y} className="fg-lbl">
          X check
        </text>
      </>
    ))
  if (r.checks.some((k) => k.kind === 'Z'))
    add(80, (
      <>
        <rect x={x} y={y - 9} width={9} height={9} style={{ fill: 'var(--fg-halo)', stroke: letterColor('Z', mode) }} strokeWidth={1.8} />
        <text x={x + 14} y={y} className="fg-lbl">
          Z check
        </text>
      </>
    ))
  if (r.checks.some((k) => k.kind === 'mixed'))
    add(150, (
      <>
        <rect x={x} y={y - 9} width={9} height={9} style={{ fill: 'var(--fg-halo)' }} className="fg-sil" strokeWidth={1.8} />
        <text x={x + 14} y={y} className="fg-lbl">
          check (edge colour = letter)
        </text>
      </>
    ))
  return <g data-legend="code">{items}</g>
}

function LayoutScene({ c }: { c: Ctx }) {
  const { r, g } = c
  return (
    <g>
      {r.plaquettes.map((p, i) => (
        <Plaquette key={i} p={p} c={c} />
      ))}
      {r.tile && <TileLayer c={c} />}
      {r.edges.length > 0 && <Edges c={c} />}
      <g data-anchor="check" className={fcls(c, 'check')}>
        {r.checks.map((ch) => (
          <CheckSquare key={ch.index} ch={ch} c={c} />
        ))}
      </g>
      <g data-anchor="qubit" className={fcls(c, 'qubit')}>
        {r.qubits.map((q) => (r.surface ? <QubitMark key={q.index} q={q} p={g.at(q.x, q.y)} rad={g.disc} mode={c.mode} index={g.disc >= 5} focus={c.focus} /> : <QubitDisc key={q.index} q={q} c={c} />))}
      </g>
      <g data-anchor="error" className={fcls(c, 'error')}>
        {r.qubits.map((q) => (q.correction || q.residual || q.logical ? <Marks key={q.index} q={q} c={c} /> : null))}
      </g>
      {r.surface && (
        <g data-anchor="operator" className={fcls(c, 'operator')}>
          {r.qubits.map((q) => (
            <OperatorRings key={q.index} q={q} p={g.at(q.x, q.y)} rad={g.disc} />
          ))}
        </g>
      )}
      <Legend c={c} />
      {g.lines.length === 0 ? null : null}
    </g>
  )
}

/* ---------------------------------------------------------------- the checks view ---------------------------------------------------------------- */
function PauliLetter({ ch, x, y, size, mode }: { ch: string; x: number; y: number; size: number; mode: SvgMode }) {
  const col = letterColor(ch, mode)
  return col ? (
    <text x={x} y={y} textAnchor="middle" style={{ fill: col, fontWeight: 700, fontSize: size }}>
      {ch}
    </text>
  ) : (
    <text x={x} y={y} textAnchor="middle" className="fg-sil2-fill" style={{ fill: 'var(--fg-sil2)', fontWeight: 500, fontSize: size }}>
      {ch}
    </text>
  )
}

export function checksGeometry(r: ResolvedCode, area: CodeBox): { cell: number; labelW: number; x0: number; y0: number; rows: number } {
  const t = r.table!
  const hasErr = t.errors.length > 0
  const rows = t.rows.length + 1 + (hasErr ? t.errors.length + 3 : 0)
  const cols = r.n + (hasErr ? 1 + t.rows.length : 0)
  const labelW = 34
  const cell = Math.floor(clamp(Math.min((area.w - labelW) / Math.max(r.n + (hasErr ? 1 + t.rows.length : 0), 1), (area.h - 8) / rows), 14, 34))
  void cols
  const tw = labelW + cell * (r.n + (hasErr ? 1 + t.rows.length : 0))
  return { cell, labelW, x0: area.x + Math.max(0, (area.w - tw) / 2) + labelW, y0: area.y + Math.max(0, (area.h - cell * rows) / 2), rows }
}

function ChecksScene({ c }: { c: Ctx }) {
  const { r, g, mode } = c
  const t = r.table!
  const G = checksGeometry(r, g.area)
  const cell = G.cell
  const fs = clamp(cell * 0.62, 10, 18)
  const hasErr = t.errors.length > 0
  const errTop = G.y0 + (t.rows.length + 1) * cell + cell * 2.1
  return (
    <g>
      <g data-anchor="table" className={fcls(c, 'table')}>
        {Array.from({ length: r.n }, (_, j) => (
          <text key={j} x={G.x0 + (j + 0.5) * cell} y={G.y0 + cell * 0.7} textAnchor="middle" className="fg-lbl" style={{ fontSize: clamp(cell * 0.45, 9, 12) }}>
            {j + 1}
          </text>
        ))}
        <text x={G.x0 - 8} y={G.y0 + cell * 0.7} textAnchor="end" className="fg-lbl" style={{ fontSize: 10 }}>
          qubit
        </text>
        {t.rows.map((row, i) => {
          const y = G.y0 + (i + 1) * cell
          return (
            <g key={i} role="img" aria-label={`check ${row.label}: ${row.letters}`}>
              <title>{`check ${row.label}: ${row.letters}`}</title>
              <text x={G.x0 - 8} y={y + cell * 0.68} textAnchor="end" className="fg-txt" style={{ fontSize: clamp(cell * 0.5, 10, 13), fontWeight: 600 }}>
                {row.label}
              </text>
              {[...row.letters].map((ch, j) => (
                <PauliLetter key={j} ch={ch} x={G.x0 + (j + 0.5) * cell} y={y + cell * 0.7} size={fs} mode={mode} />
              ))}
            </g>
          )
        })}
      </g>
      {hasErr && (
        <g data-anchor="syndrome" className={fcls(c, 'syndrome')}>
          <text x={G.x0} y={errTop - cell * 1.05} className="fg-lbl" style={{ fontSize: 11 }}>
            errors
          </text>
          <text x={G.x0 + (r.n + 1) * cell} y={errTop - cell * 1.05} className="fg-lbl" style={{ fontSize: 11 }}>
            what each check reads
          </text>
          {t.rows.map((row, k) => (
            <text key={k} x={G.x0 + (r.n + 1 + k + 0.5) * cell} y={errTop - cell * 0.18} textAnchor="middle" className="fg-lbl" style={{ fontSize: clamp(cell * 0.4, 8, 10.5) }}>
              {row.label}
            </text>
          ))}
          {t.errors.map((e, i) => {
            const y = errTop + i * cell
            const lit = e.syndrome.flatMap((b, k) => (b ? [t.rows[k].label] : []))
            return (
              <g key={i} role="img" aria-label={`${e.text}: ${lit.length ? `checks ${lit.join(', ')} read minus one` : 'every check reads plus one'}`}>
                <title>{e.text}</title>
                <text x={G.x0 - 8} y={y + cell * 0.68} textAnchor="end" className="fg-lbl" style={{ fontSize: 10 }}>
                  {`e${i + 1}`}
                </text>
                {[...e.letters].map((ch, j) => (
                  <PauliLetter key={j} ch={ch} x={G.x0 + (j + 0.5) * cell} y={y + cell * 0.7} size={fs} mode={mode} />
                ))}
                {e.syndrome.map((b, k) => {
                  const x = G.x0 + (r.n + 1 + k) * cell
                  return <rect key={k} x={x + 2} y={y + 2} width={cell - 4} height={cell - 4} rx={3} className={b ? 'fg-minus-fill' : 'fg-sil2'} fill={b ? undefined : 'none'} strokeWidth={b ? 0 : 1} />
                })}
              </g>
            )
          })}
          <text x={G.x0 + (r.n + 1) * cell} y={errTop + t.errors.length * cell + 13} className="fg-lbl" style={{ fontSize: 10 }}>
            filled = the check reads −1
          </text>
        </g>
      )}
    </g>
  )
}

/* ---------------------------------------------------------------- the words view ---------------------------------------------------------------- */
export function wordsGeometry(r: ResolvedCode, area: CodeBox): { rh: number; strW: number; barX: number; barW: number; y0: number } {
  const w = r.words!
  const rh = Math.floor(clamp((area.h - 24) / w.terms.length, 14, 28))
  const strW = r.n * 8.6 + 12
  const barX = area.x + strW + 8
  const barW = Math.max(40, area.x + area.w - barX - 62)
  return { rh, strW, barX, barW, y0: area.y + Math.max(0, (area.h - rh * w.terms.length - 24) / 2) + 16 }
}

function WordsScene({ c }: { c: Ctx }) {
  const { r, g } = c
  const w = r.words!
  const G = wordsGeometry(r, g.area)
  return (
    <g data-anchor="word" className={fcls(c, 'word')}>
      {/* the proportional face: the monospace face of `fg-txt` has no ⟩ and draws a bracket there */}
      <text x={g.area.x} y={G.y0 - 8} className="fg-lbl" style={{ fontSize: 14, fontWeight: 700, fill: 'var(--fg-ink)' }}>
        {w.name}
      </text>
      <text x={G.barX + G.barW} y={G.y0 - 8} textAnchor="end" className="fg-lbl" style={{ fontSize: 10.5 }}>
        bar length = size
      </text>
      {w.terms.map((t, i) => {
        const y = G.y0 + i * G.rh
        const negative = Math.abs(t.im) < 1e-9 && t.re < 0
        const real = Math.abs(t.im) < 1e-9
        const label = real ? `${t.re < 0 ? '−' : '+'}${fix(Math.abs(t.re), 3)}` : `${fix(t.re, 3)} ${t.im < 0 ? '−' : '+'} ${fix(Math.abs(t.im), 3)}i`
        return (
          <g key={i} role="img" aria-label={`basis string ${t.bits}, amplitude ${label}`}>
            <title>{`${t.bits}: ${label}`}</title>
            <text x={g.area.x} y={y + G.rh * 0.68} className="fg-txt" style={{ fontSize: clamp(G.rh * 0.62, 11, 15), fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontWeight: 600 }}>
              {t.bits}
            </text>
            <rect x={G.barX} y={y + 2} width={G.barW} height={G.rh - 4} rx={2} fill="none" className="fg-sil3" strokeWidth={0.8} />
            <rect x={G.barX} y={y + 2} width={Math.max(1.5, G.barW * t.size)} height={G.rh - 4} rx={2} className={negative ? 'fg-op-fill' : 'fg-state-fill'} />
            <text x={G.barX + G.barW + 6} y={y + G.rh * 0.68} className="fg-lbl" style={{ fontSize: 11 }}>
              {label}
            </text>
          </g>
        )
      })}
      <text x={g.area.x} y={g.area.y + g.area.h - 4} className="fg-lbl" style={{ fontSize: 10.5 }}>
        white bar: + sign · orchid bar: − sign
      </text>
    </g>
  )
}

/* ---------------------------------------------------------------- the scene ---------------------------------------------------------------- */
export function CodeScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'code'>) {
  const own = mode === 'print' || !!bare
  const g = codeGeometry(r, width, height, own, slot)
  const c: Ctx = { r, g, mode, focus, own }
  return (
    <g className="svgk-scene" data-kind="code" data-view={r.view} data-code={r.id}>
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
      {r.view === 'layout' && <LayoutScene c={c} />}
      {r.view === 'checks' && <ChecksScene c={c} />}
      {r.view === 'words' && <WordsScene c={c} />}
      {r.view === 'torus' && <TorusView c={c} />}
      {r.view === 'patch' && <PatchView c={c} />}
      {r.bbx && <BBView c={c} />}
      {r.bpx && <BPView c={c} />}
    </g>
  )
}
