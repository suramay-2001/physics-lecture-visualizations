/**
 * The `two-qubit` scene: ONE component for the live stage and the print figure. Two small oblique Bloch balls, A
 * (left) and B (right), each with its reduced Bloch arrow (`arrows`) and up to two dashed measurement axes; beside
 * them, when asked, a 3×3 grid of ⟨σᵢ⊗σⱼ⟩ (`grid`), one cell per axis pair, SIGNED size + colour (the amplitudes
 * kind's own convention for a real, signed quantity: amber/`fg-plus` for a positive cell, cobalt/`fg-minus` for a
 * negative one — not a phase, since these entries are always real).
 */
import type { SvgSceneProps } from '../svgKinds'
import type { ResolvedTwoQubit, V3 } from '../types'
import { Arrow, Label } from './draw'
import { twoQubitReadouts } from './twoQubit'

const LINE_ORDER = ['purity', 'rLength', 'entropy']
const ownLines = (r: ResolvedTwoQubit) => {
  const all = twoQubitReadouts(r)
  const first = all.filter((x) => LINE_ORDER.includes(x.name)).sort((a, b) => LINE_ORDER.indexOf(a.name) - LINE_ORDER.indexOf(b.name))
  return [...first, ...all.filter((x) => !LINE_ORDER.includes(x.name))].slice(0, 3).map((x) => x.text)
}

/** A fixed oblique axonometric view (x right, z up, y toward the reader): the same well-known technique
 *  `FigureFor.tsx` uses for its own physics-space figures, re-derived here for a plain (⟨σx⟩,⟨σy⟩,⟨σz⟩) triple. */
const AZ = (26 * Math.PI) / 180
const EL = (20 * Math.PI) / 180
const cosAZ = Math.cos(AZ)
const sinAZ = Math.sin(AZ)
const cosEL = Math.cos(EL)
const sinEL = Math.sin(EL)
function proj(v: V3, cx: number, cy: number, R: number): { x: number; y: number; front: boolean } {
  const [x, y, z] = v
  const u = x * cosAZ - y * sinAZ
  const depth = x * sinAZ + y * cosAZ
  const h = z * cosEL - depth * sinEL
  return { x: cx + R * u, y: cy - R * h, front: depth * cosEL + z * sinEL >= 0 }
}
const dirVec = (theta: number, phi: number): V3 => [Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta)]

function Ball({
  cx,
  cy,
  R,
  r,
  axes,
  label,
  anchorName,
  focus,
}: {
  cx: number
  cy: number
  R: number
  r: V3 | null
  axes: readonly { theta: number; phi: number }[]
  label: string
  anchorName: string
  focus?: string | null
}) {
  const eq = Array.from({ length: 48 }, (_, i) => (i / 48) * 2 * Math.PI).map((t) => proj([Math.cos(t), Math.sin(t), 0], cx, cy, R))
  const seg = (front: boolean) =>
    eq
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p.front === front)
      .map(({ p }, k) => `${k ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ')
  const north = proj([0, 0, 1], cx, cy, R)
  const south = proj([0, 0, -1], cx, cy, R)
  const center = proj([0, 0, 0], cx, cy, R)
  const tip = r ? proj(r, cx, cy, R) : null
  const focused = focus === anchorName
  return (
    <g data-anchor={anchorName} className={focused ? 'svgk-focus' : undefined}>
      <circle cx={cx} cy={cy} r={R} className="fg-sil3" fill="none" strokeWidth={1} />
      <path d={seg(false)} className="fg-sil3" fill="none" strokeDasharray="2 3" strokeWidth={0.8} />
      <path d={seg(true)} className="fg-sil2" fill="none" strokeWidth={0.9} />
      <circle cx={north.x} cy={north.y} r={2.4} className="fg-sil-fill" />
      <circle cx={south.x} cy={south.y} r={2.4} className="fg-sil-fill" />
      {axes.slice(0, 2).map((a, k) => {
        const d = dirVec(a.theta, a.phi)
        const p1 = proj(d, cx, cy, R)
        const p2 = proj([-d[0], -d[1], -d[2]], cx, cy, R)
        return <line key={k} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="fg-sil" strokeDasharray="4 3" strokeWidth={1} />
      })}
      {tip && <Arrow a={center} b={tip} cls="fg-state" width={2} anchor={`${anchorName}-arrow`} />}
      <Label at={{ x: cx, y: cy + R + 16 }} anchor="middle" cls="fg-lbl">
        {label}
      </Label>
    </g>
  )
}

const AXIS_LABELS = ['x', 'y', 'z'] as const

function Grid3({ x, y, size, cells, highlight, focus }: { x: number; y: number; size: number; cells: readonly (readonly number[])[]; highlight: readonly string[]; focus?: string | null }) {
  const n = 3
  const cell = size / n
  const maxMag = Math.max(...cells.flat().map((v) => Math.abs(v)), 1e-9)
  const hiSet = new Set(highlight)
  const focused = focus === 'cell'
  return (
    <g data-anchor="cell" className={focused ? 'svgk-focus' : undefined}>
      {cells.map((row, i) =>
        row.map((v, j) => {
          const cxx = x + cell * (j + 0.5)
          const cyy = y + cell * (i + 0.5)
          const mag = Math.abs(v)
          const s = mag < 1e-9 ? 0 : Math.max(2, cell * 0.8 * Math.sqrt(mag / maxMag))
          const hi = hiSet.has(`${AXIS_LABELS[i]}${AXIS_LABELS[j]}`)
          return (
            <g key={`${i}-${j}`}>
              <rect x={x + cell * j} y={y + cell * i} width={cell} height={cell} className="fg-sil3" fill="none" strokeWidth={0.6} />
              {mag > 1e-9 && <rect x={cxx - s / 2} y={cyy - s / 2} width={s} height={s} rx={Math.min(3, s / 5)} className={v >= 0 ? 'fg-plus-fill' : 'fg-minus-fill'} />}
              {hi && <rect x={x + cell * j + 1} y={y + cell * i + 1} width={cell - 2} height={cell - 2} fill="none" className="fg-state" strokeWidth={1.4} />}
            </g>
          )
        }),
      )}
      <rect x={x} y={y} width={size} height={size} fill="none" className="fg-sil2" strokeWidth={1.2} />
      {AXIS_LABELS.map((t, i) => (
        <Label key={`r${i}`} at={{ x: x - 6, y: y + cell * (i + 0.5) + 4 }} anchor="end" cls="fg-lbl">
          {t}
        </Label>
      ))}
      {AXIS_LABELS.map((t, j) => (
        <Label key={`c${j}`} at={{ x: x + cell * (j + 0.5), y: y - 6 }} anchor="middle" cls="fg-lbl">
          {t}
        </Label>
      ))}
    </g>
  )
}

export function TwoQubitScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'two-qubit'>) {
  const print = mode === 'print'
  const own = print || !!bare
  const lines = own ? ownLines(r) : []
  const readoutCount = own ? 0 : twoQubitReadouts(r).length
  const padTop = own ? 14 + 13 * lines.length : Math.max(56, 26 + 17 * readoutCount)
  const padBottom = own ? 28 : slot === 'top' ? 18 : 36
  const padX = own ? 14 : 20
  const hasGrid = r.grid !== 'none' && r.T
  // Two layouts, whichever draws the pair larger (W-448 L10): side by side (balls, then the grid) on a wide stage, stacked (balls over the
  // grid, centred) on a tall narrow one, where the old side-by-side layout ran the third grid column off the stage. A ball needs 2R of width
  // and the pair 4.9R; the grid sits 0.3R + 18 beyond ball B.
  const availW = width - 2 * padX
  const availH = height - padTop - padBottom
  const gridSide = hasGrid ? Math.max(40, Math.min(0.3 * availW, 130, availH)) : 0
  const Rside = Math.max(14, Math.min((availW - (hasGrid ? gridSide + 18 : 0)) / (hasGrid ? 5.2 : 4.9), availH / 2 / 1.2))
  const gridStack = hasGrid ? Math.max(40, Math.min(0.62 * availW, 190, 0.45 * availH)) : 0
  const Rstack = Math.max(14, Math.min(availW / 4.9, (availH - gridStack - 48) / 2.4))
  const stack = hasGrid && Rstack + gridStack / 4 > Rside + gridSide / 4
  const R = stack ? Rstack : Rside
  const gridSize = stack ? gridStack : gridSide
  let cxA: number, cxB: number, cy: number, gx: number, gy: number
  if (stack) {
    const total = 2.4 * R + 22 + 18 + gridSize
    const y0 = padTop + Math.max(0, (availH - total) / 2)
    cxA = width / 2 - 1.45 * R
    cxB = width / 2 + 1.45 * R
    cy = y0 + 1.2 * R
    gx = (width - gridSize) / 2
    gy = y0 + 2.4 * R + 22 + 18
  } else {
    const block = hasGrid ? 5.2 * R + 18 + gridSize : 4.9 * R
    const x0 = padX + Math.max(0, (availW - block) / 2)
    cxA = x0 + R
    cxB = cxA + 2.9 * R
    cy = padTop + availH / 2
    gx = cxB + 1.3 * R + 18
    gy = cy - gridSize / 2
  }
  const labelA = r.labels === 'A-B' ? 'A' : 'q1'
  const labelB = r.labels === 'A-B' ? 'B' : 'q2'

  return (
    <g className="svgk-scene" data-kind="two-qubit">
      <Ball cx={cxA} cy={cy} R={R} r={r.arrows === 'none' ? null : r.rA} axes={r.axesA} label={labelA} anchorName="ball-a" focus={focus} />
      <Ball cx={cxB} cy={cy} R={R} r={r.arrows === 'none' ? null : r.rB} axes={r.axesB} label={labelB} anchorName="ball-b" focus={focus} />
      {hasGrid && <Grid3 x={gx} y={gy} size={gridSize} cells={r.T!} highlight={r.highlight} focus={focus} />}
      {lines.map((t, k) => (
        <Label key={`rl${k}`} at={{ x: 8, y: 14 + 13 * k }} cls="fg-txt">
          {t}
        </Label>
      ))}
    </g>
  )
}
