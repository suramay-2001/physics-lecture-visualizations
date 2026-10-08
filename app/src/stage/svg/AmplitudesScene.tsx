/**
 * The `amplitudes` scene: ONE component for the live stage and the print figure. One bar per basis state, drawn from the
 * resolved state only (stage/svg/amplitudes.ts): its length is |a| (or the chance |a|² in 'probability' mode, or the
 * signed real amplitude in 'signed' mode, with the dashed mean) and its hue is the phase, on the same wheel as the number
 * plane (stage/phaseHue.ts). Dials show each phase as a turned hand; `sum` draws two amplitudes tip to tail and their
 * resultant in a small plane. One-qubit chances keep the shared outcome colours (amber |0⟩ ≡ |+z⟩, cobalt |1⟩).
 */
import { phaseColor } from '../phaseHue'
import type { SvgSceneProps } from '../svgKinds'
import type { ResolvedAmplitudes } from '../types'
import { ampName, ampReadouts, barLabel } from './amplitudes'
import { Arrow, Label, PhaseWheel, type Pt, fix, fmtC } from './draw'

const LINE_ORDER = ['after', 'sum', 'sum-size2', 'mean']
const ownLines = (r: ResolvedAmplitudes) => {
  const all = ampReadouts(r)
  const first = all.filter((x) => LINE_ORDER.includes(x.name)).sort((a, b) => LINE_ORDER.indexOf(a.name) - LINE_ORDER.indexOf(b.name))
  return [...first, ...all.filter((x) => !LINE_ORDER.includes(x.name))].slice(0, 3).map((x) => x.text)
}

export function AmplitudesScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'amplitudes'>) {
  const print = mode === 'print'
  const own = print || !!bare
  const lines = own ? ownLines(r) : []
  const f = (a: string) => (focus === a ? 'svgk-focus' : undefined)
  const hue = (phi: number) => phaseColor(phi, mode)
  const N = r.amps.length
  // room: the passport and readout column above (stage), the caption below; the figure's text lines (print)
  const padTop = own ? 14 + 13 * lines.length : Math.max(92, 26 + 17 * ampReadouts(r).length)
  // the print figure's phase legend sits in its own strip under the bar labels (it covered the last label)
  const legend = own && r.mode !== 'probability'
  const padBottom = own ? (legend ? 26 : 12) : slot === 'top' ? 18 : 92
  const padX = own ? 14 : 28
  const sumW = r.sum ? Math.min(0.42 * (width - 2 * padX), 220) : 0
  // 'signed' keeps a margin on the right for the mean's label
  const barsW = width - 2 * padX - (r.sum ? sumW + 16 : 0) - (r.mode === 'signed' ? 36 : 0)
  const rotate = N > 8
  const labelH = rotate ? 34 : r.labels === 'spin' ? 30 : 18
  const dialR = r.dials ? Math.max(8, Math.min(20, barsW / N / 2 - 4)) : 0
  const valueH = N <= 8 ? 16 : 0
  const top = padTop + (r.dials ? 2 * dialR + 12 : 0) + valueH
  const bottom = height - padBottom - labelH
  const plotH = Math.max(20, bottom - top)
  const pitch = barsW / N
  const bw = Math.max(3, Math.min(56, pitch * 0.66))
  const x0 = padX
  const signed = r.mode === 'signed'
  const base = signed ? top + plotH / 2 : bottom
  const scale = signed ? plotH / 2 : plotH
  const len = (k: number) => (r.mode === 'probability' ? r.probs[k] : r.sizes[k])
  const fillOf = (k: number) => {
    if (r.mode === 'probability') return r.n === 1 ? (k === 0 ? 'var(--fg-plus)' : 'var(--fg-minus)') : 'var(--fg-sil)'
    return hue(r.phases[k])
  }
  const cx = (k: number) => x0 + pitch * (k + 0.5)
  return (
    <g className="svgk-scene" data-kind="amplitudes">
      {/* the axis and its scale (1, or 100 % as chances) */}
      <g data-anchor="axis" className={f('axis')}>
        <line x1={x0} y1={base} x2={x0 + barsW} y2={base} className="fg-sil2" strokeWidth={1.4} />
        {(signed ? [1, -1, 0.5, -0.5] : [1, 0.5]).map((v) => (
          <g key={v}>
            <line x1={x0} y1={base - v * scale} x2={x0 + barsW} y2={base - v * scale} className="fg-sil3" strokeWidth={0.8} strokeDasharray={Math.abs(v) === 1 ? undefined : '2 4'} />
            <Label at={{ x: x0 - 4, y: base - v * scale + 4 }} anchor="end" cls="fg-lbl">
              {r.mode === 'probability' ? `${fix(v * 100)}%` : fix(v)}
            </Label>
          </g>
        ))}
      </g>
      {/* the bars */}
      <g data-anchor="bars" className={f('bars')}>
        {r.amps.map((a, k) => {
          const L = len(k)
          const h = signed ? a.re * scale : L * scale
          const y = signed ? (h >= 0 ? base - h : base) : base - h
          const zero = L < 1e-9
          return (
            <g key={k} data-anchor={`bar-${k}`} className={focus === `bar-${k}` ? 'svgk-focus' : undefined}>
              {zero ? (
                <line x1={cx(k) - bw / 2} y1={base} x2={cx(k) + bw / 2} y2={base} className="fg-sil" strokeWidth={2} />
              ) : (
                <rect x={cx(k) - bw / 2} y={y} width={bw} height={Math.max(1, Math.abs(h))} rx={2} style={{ fill: fillOf(k) }} />
              )}
              {valueH > 0 && !zero && (
                <Label at={{ x: cx(k), y: (signed && h < 0 ? base + Math.abs(h) + 14 : y - 5) }} anchor="middle" cls="fg-txt">
                  {r.mode === 'probability' ? `${fix(r.probs[k] * 100, 1)}%` : fmtC(a, 2)}
                </Label>
              )}
              {rotate ? (
                <text x={cx(k)} y={bottom + 8} className="fg-lbl" textAnchor="end" transform={`rotate(-60 ${cx(k)} ${bottom + 8})`} style={{ fontSize: N > 16 ? 8 : 10 }}>
                  {barLabel(k, r.n, r.labels, r.basis)}
                </text>
              ) : (
                <Label at={{ x: cx(k), y: bottom + 15 }} anchor="middle" cls="fg-lbl">
                  {barLabel(k, r.n, r.labels, r.basis)}
                </Label>
              )}
              {/* the dial: the hand turns to the phase; its length is |a| */}
              {r.dials && (
                <g data-anchor="dials" className={f('dials')}>
                  <circle cx={cx(k)} cy={padTop + dialR} r={dialR} fill="none" className="fg-sil2" strokeWidth={1.1} />
                  {!zero && (
                    <line
                      x1={cx(k)}
                      y1={padTop + dialR}
                      x2={cx(k) + dialR * r.sizes[k] * Math.cos(r.phases[k])}
                      y2={padTop + dialR - dialR * r.sizes[k] * Math.sin(r.phases[k])}
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      style={{ stroke: hue(r.phases[k]) }}
                    />
                  )}
                </g>
              )}
            </g>
          )
        })}
      </g>
      {/* 'signed': the mean amplitude (Grover's inversion about the mean reflects each bar through it) */}
      {signed && (
        <g data-anchor="mean" className={f('mean')}>
          <line x1={x0} y1={base - r.mean.re * scale} x2={x0 + barsW} y2={base - r.mean.re * scale} className="fg-state" strokeWidth={1.4} strokeDasharray="6 4" />
          <Label at={{ x: x0 + barsW + 4, y: base - r.mean.re * scale + 4 }} cls="fg-txt">
            mean
          </Label>
        </g>
      )}
      {/* 'sum': two amplitudes tip to tail in a small plane (radius 1 = the unit circle), and their resultant */}
      {r.sum && <SumPlane r={r} x={width - padX - sumW} y={top} w={sumW} h={bottom - top} hue={hue} focus={focus} />}
      {legend && <PhaseWheel x={width - 12} y={height - 10} mode={mode} />}
      {lines.map((t, k) => (
        <Label key={`rl${k}`} at={{ x: 8, y: 14 + 13 * k }} cls="fg-txt">
          {t}
        </Label>
      ))}
    </g>
  )
}

function SumPlane({ r, x, y, w, h, hue, focus }: { r: ResolvedAmplitudes; x: number; y: number; w: number; h: number; hue: (phi: number) => string; focus?: string | null }) {
  const s = r.sum!
  const R = Math.max(20, Math.min(w, h) / 2 - 16)
  // the plane's scale: the unit circle, or the resultant when it is longer
  const unit = R / Math.max(1, s.size * 1.1)
  const O: Pt = { x: x + w / 2, y: y + h / 2 }
  const P = (re: number, im: number): Pt => ({ x: O.x + unit * re, y: O.y - unit * im })
  const a = r.amps[s.i]
  const b = r.amps[s.j]
  const tip = P(a.re, a.im)
  const end = P(a.re + b.re, a.im + b.im)
  return (
    <g data-anchor="sum" className={focus === 'sum' ? 'svgk-focus' : undefined}>
      <line x1={O.x - R} y1={O.y} x2={O.x + R} y2={O.y} className="fg-sil3" strokeWidth={1} />
      <line x1={O.x} y1={O.y - R} x2={O.x} y2={O.y + R} className="fg-sil3" strokeWidth={1} />
      <circle cx={O.x} cy={O.y} r={unit} fill="none" className="fg-sil2" strokeDasharray="3 4" strokeWidth={1} />
      <Arrow a={O} b={tip} color={hue(r.phases[s.i])} width={2.4} />
      <Arrow a={tip} b={end} color={hue(r.phases[s.j])} width={2.4} />
      {s.size > 1e-9 ? <Arrow a={O} b={end} color={hue(Math.atan2(s.total.im, s.total.re))} width={3.4} anchor="resultant" focus={focus === 'resultant'} /> : <circle cx={O.x} cy={O.y} r={4.5} className="fg-state-fill" data-anchor="resultant" />}
      <Label at={{ x: O.x, y: y + h - 2 }} anchor="middle" cls="fg-lbl">
        {`${ampName(s.i)} + ${ampName(s.j)}, tip to tail`}
      </Label>
    </g>
  )
}
