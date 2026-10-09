/**
 * Drawing helpers shared by the SVG kinds' scenes (stage/svg/): arrows, arcs, labels and number formats. Pure SVG,
 * no engine: every number drawn is already in the resolved state (stage/svgKinds.ts). Colours: the print figure's
 * classes (`fg-*`, styles/print.css) mapped to the stage ink in stage mode (svg.css), plus the phase hue wheel
 * (stage/phaseHue.ts) given inline.
 */
import type { ReactNode } from 'react'
import { wheelWedges } from '../phaseHue'

/* ---------------------------------------- number formats ---------------------------------------- */
const MINUS = '−'
/** A real number rounded to `d` decimals, trailing zeros dropped, −0 printed as 0, a typographic minus. */
export function fix(x: number, d = 3): string {
  if (!Number.isFinite(x)) return '?'
  const r = Math.abs(x) < 0.5 * 10 ** -d ? 0 : x
  const raw = r.toFixed(d)
  // trailing zeros only after a decimal point (fix(90, 0) is "90")
  const s = raw.includes('.') ? raw.replace(/\.?0+$/, '') : raw
  return s.replace('-', MINUS)
}
/** A complex number a + bi, each part rounded to `d` decimals: "4 + 2i", "−0.12 − 0.16i", "0.707i", "−i", "16". */
export function fmtC(z: { re: number; im: number }, d = 3): string {
  const re = fix(z.re, d)
  const imAbs = fix(Math.abs(z.im), d)
  const imNeg = z.im < 0 && imAbs !== '0'
  const iPart = imAbs === '1' ? 'i' : `${imAbs}i`
  if (imAbs === '0') return re
  if (re === '0') return imNeg ? `${MINUS}${iPart}` : iPart
  return `${re} ${imNeg ? MINUS : '+'} ${iPart}`
}
/** A positive number in scientific form with a real power of ten: sci(3.17e-13, 1) is "3.2 × 10⁻¹³"; 0 is "0". */
export function sci(x: number, d = 1): string {
  if (!Number.isFinite(x)) return '?'
  if (x === 0) return '0'
  let e = Math.floor(Math.log10(Math.abs(x)))
  let m = x / 10 ** e
  // rounding the mantissa can reach 10 (9.96 at one decimal): carry into the power
  if (Math.abs(Number(m.toFixed(d))) >= 10) {
    m /= 10
    e += 1
  }
  return `${fix(m, d)} × 10${sup(e)}`
}
/** An angle in radians as degrees, e.g. "53.13°". */
export const degs = (phi: number, d = 2): string => `${fix((phi * 180) / Math.PI, d)}°`
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }
/** A whole number as superscript digits: sup(8) = "⁸". */
export const sup = (n: number): string => String(n).split('').map((ch) => SUP[ch] ?? ch).join('')

/* ---------------------------------------- shapes ---------------------------------------- */
export interface Pt {
  x: number
  y: number
}

/** An arrow from `a` to `b` with a filled head; colour by class (`fg-…`) or inline. */
export function Arrow({ a, b, color, cls, width = 2, head = 9, dashed, anchor, focus }: { a: Pt; b: Pt; color?: string; cls?: string; width?: number; head?: number; dashed?: boolean; anchor?: string; focus?: boolean }) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy)
  const g = focus ? 'svgk-focus' : undefined
  if (len < 1.5) return <circle cx={b.x} cy={b.y} r={3} className={cls ? `${cls}-fill` : undefined} style={color ? { fill: color } : undefined} data-anchor={anchor} />
  const ux = dx / len
  const uy = dy / len
  const h = Math.min(head, len * 0.6)
  const hx = b.x - ux * h
  const hy = b.y - uy * h
  return (
    <g data-anchor={anchor} className={g}>
      <line x1={a.x} y1={a.y} x2={hx} y2={hy} className={cls} strokeWidth={width} strokeDasharray={dashed ? '5 4' : undefined} style={color ? { stroke: color } : undefined} strokeLinecap="round" />
      <polygon points={`${b.x},${b.y} ${hx - uy * h * 0.5},${hy + ux * h * 0.5} ${hx + uy * h * 0.5},${hy - ux * h * 0.5}`} className={cls ? `${cls}-fill` : undefined} style={color ? { fill: color } : undefined} />
    </g>
  )
}

/** A circular arc about `c` of radius `rad` from angle a0 to a1 (radians, counter-clockwise positive, y up); any span. */
export function arcPath(c: Pt, rad: number, a0: number, a1: number): string {
  const n = Math.max(2, Math.ceil((Math.abs(a1 - a0) / (2 * Math.PI)) * 96))
  let d = ''
  for (let k = 0; k <= n; k++) {
    const a = a0 + ((a1 - a0) * k) / n
    d += `${k ? 'L' : 'M'}${(c.x + rad * Math.cos(a)).toFixed(2)},${(c.y - rad * Math.sin(a)).toFixed(2)}`
  }
  return d
}

/** A text label (plain Unicode; no TeX inside SVG). */
export function Label({ at, children, cls = 'fg-txt', anchor = 'start', dy = 0, color }: { at: Pt; children: ReactNode; cls?: string; anchor?: 'start' | 'middle' | 'end'; dy?: number; color?: string }) {
  return (
    <text x={at.x} y={at.y + dy} className={cls} textAnchor={anchor} style={color ? { fill: color } : undefined}>
      {children}
    </text>
  )
}

/** How far a subscript drops below its letter, in SVG user units (the text itself is 11-14 px). */
const SUB_DROP = 3
/**
 * SVG text with real subscripts (P-L9 item 6): every `_x` in `text` becomes a smaller tspan dropped by `dy`, and the text after it climbs
 * back (`dy` is relative, so each drop is undone before the next plain run). `baseline-shift` is avoided because engines differ on it.
 * The data layer may keep the source form "α_u", "σ_A"; the learner never sees an underscore. Its `textContent` is "αu", "σA".
 */
export function scripted(text: string): ReactNode {
  const out: ReactNode[] = []
  let last = 0
  let dropped = false
  for (const m of text.matchAll(/_([A-Za-z0-9]+)/g)) {
    const i = m.index ?? 0
    const before = text.slice(last, i)
    if (before) out.push(dropped ? <tspan key={`b${i}`} dy={-SUB_DROP}>{before}</tspan> : before)
    else if (dropped) out.push(<tspan key={`u${i}`} dy={-SUB_DROP} />)
    out.push(<tspan key={`s${i}`} dy={SUB_DROP} fontSize="75%">{m[1]}</tspan>)
    dropped = true
    last = i + m[0].length
  }
  const rest = text.slice(last)
  if (rest) out.push(dropped ? <tspan key="rest" dy={-SUB_DROP}>{rest}</tspan> : rest)
  return <>{out}</>
}

/** Where to put a label just beyond the tip of a vector pointing along (ux, uy) (screen units), and its text anchor. */
export function beyond(tip: Pt, dir: Pt, gap = 12): { at: Pt; anchor: 'start' | 'middle' | 'end' } {
  const len = Math.hypot(dir.x, dir.y) || 1
  const ux = dir.x / len
  const uy = dir.y / len
  const at = { x: tip.x + ux * gap, y: tip.y + uy * gap + 4 }
  return { at, anchor: ux > 0.35 ? 'start' : ux < -0.35 ? 'end' : 'middle' }
}

/** The phase hue wheel with its label (the print figure's legend; on stage the passport carries it). */
export function PhaseWheel({ x, y, mode }: { x: number; y: number; mode: 'stage' | 'print' }) {
  return (
    <g transform={`translate(${x - 8},${y - 8})`} data-legend="phase">
      {wheelWedges(24, 7, 3.5, 8, 8, mode).map((w, k) => (
        <path key={k} d={w.d} style={{ fill: w.fill }} />
      ))}
      <text x={-4} y={12} className="fg-lbl" textAnchor="end">
        hue = phase
      </text>
    </g>
  )
}
