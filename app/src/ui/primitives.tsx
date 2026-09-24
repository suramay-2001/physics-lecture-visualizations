import { useMemo, type ReactNode } from 'react'
import { type C, abs, arg, snap } from '../physics/complex'

/**
 * A complex amplitude drawn as a clock hand: length = |c|, angle = phase (counter-clockwise
 * from the right). Phase is geometry here, never color — amber/cobalt are reserved for outcomes.
 */
export function Phasor({ z, size = 64, label, tone }: { z: C; size?: number; label?: ReactNode; tone?: 'up' | 'down' }) {
  const r = size / 2 - 4
  const len = Math.min(1, abs(z)) * r
  const a = arg(z)
  const x = len * Math.cos(a)
  const y = -len * Math.sin(a)
  const color = tone === 'up' ? 'var(--up)' : tone === 'down' ? 'var(--down)' : 'var(--ink)'
  return (
    <figure className="phasor" style={{ width: size }}>
      <svg viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} width={size} height={size} role="img"
        aria-label={`amplitude with magnitude ${abs(z).toFixed(2)} and phase ${Math.round((a * 180) / Math.PI)} degrees`}>
        <circle r={r} fill="none" stroke="var(--rule)" />
        <line x1={-r} x2={r} y1={0} y2={0} stroke="var(--rule)" strokeDasharray="2 3" />
        {len > 0.5 && (
          <>
            <line x1={0} y1={0} x2={x} y2={y} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
            <circle cx={x} cy={y} r={3} fill={color} />
          </>
        )}
        <circle r={2} fill="var(--ink-2)" />
      </svg>
      {label && <figcaption>{label}</figcaption>}
    </figure>
  )
}

/** Deterministic pseudo-random in [0,1) from an integer, so deposits don't jump on re-render. */
function hash01(n: number): number {
  let x = (n + 0x9e3779b9) | 0
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b)
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35)
  x ^= x >>> 16
  return (x >>> 0) / 4294967296
}

/**
 * The glass plate: every measurement in the app lands here as a silver dot in one of two spots.
 * `plus` / `minus` are counts; only the first `maxDots` of each are drawn, the numbers are exact.
 */
export function Plate({
  plus,
  minus,
  labels = ['+', '−'],
  expected,
  height = 150,
  maxDots = 700,
}: {
  plus: number
  minus: number
  labels?: [ReactNode, ReactNode]
  expected?: number // theoretical P(+), draws the prediction marks
  height?: number
  maxDots?: number
}) {
  const W = 120
  const H = height
  const spots = [H * 0.3, H * 0.7]
  const dots = useMemo(() => {
    const spots = [H * 0.3, H * 0.7]
    const out: { x: number; y: number; s: 0 | 1 }[] = []
    const n = [Math.min(plus, maxDots), Math.min(minus, maxDots)]
    for (const s of [0, 1] as const) {
      for (let i = 0; i < n[s]; i++) {
        // Box–Muller for a beam-shaped spot
        const u = hash01(i * 2 + s * 100003) || 1e-9
        const v = hash01(i * 2 + 1 + s * 100003)
        const g1 = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
        const g2 = Math.sqrt(-2 * Math.log(u)) * Math.sin(2 * Math.PI * v)
        out.push({ x: W / 2 + g1 * 14, y: spots[s] + g2 * 7, s })
      }
    }
    return out
  }, [plus, minus, maxDots, H])
  const total = plus + minus
  return (
    <figure className="plate">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img"
        aria-label={`plate: ${plus} atoms in the plus spot, ${minus} in the minus spot`}>
        <rect x={1} y={1} width={W - 2} height={H - 2} rx={6} className="plate-glass" />
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={1.15} className={d.s === 0 ? 'dot up-dot' : 'dot down-dot'} />
        ))}
        <text x={8} y={spots[0] + 4} className="plate-label up">{labels[0]}</text>
        <text x={8} y={spots[1] + 4} className="plate-label down">{labels[1]}</text>
      </svg>
      <figcaption className="plate-counts mono">
        <span className="up">{plus}</span>
        <span className="sep">/</span>
        <span className="down">{minus}</span>
        {total > 0 && <span className="frac"> · {((plus / total) * 100).toFixed(1)}% +</span>}
        {expected !== undefined && <span className="theory"> · Born: {(expected * 100).toFixed(1)}%</span>}
      </figcaption>
    </figure>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: ReactNode }[]
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} role="radio" aria-checked={value === o.value}
          className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = (v) => String(v),
}: {
  label: ReactNode
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  return (
    <label className="slider">
      <span className="slider-label">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))} />
      <span className="slider-value mono">{format(value)}</span>
    </label>
  )
}

export const deg = (rad: number) => `${Math.round((rad * 180) / Math.PI)}°`
export const pct = (p: number) => `${(p * 100).toFixed(1)}%`
export const num = (x: number) => snap(x, 3)

/** Frame shared by all widgets: title bar, body, optional readout rail. */
export function WidgetFrame({ title, children, readout, wide }: { title: string; children: ReactNode; readout?: ReactNode; wide?: boolean }) {
  return (
    <section className={wide ? 'widget wide' : 'widget'} aria-label={title}>
      <header className="widget-bar">
        <span className="eyebrow">{title}</span>
      </header>
      <div className="widget-body">
        <div className="widget-stage">{children}</div>
        {readout && <aside className="widget-readout">{readout}</aside>}
      </div>
    </section>
  )
}
