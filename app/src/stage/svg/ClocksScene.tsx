/**
 * The `clocks` scene: ONE component for the live stage, the reading version, the print figure and the `two-clocks` widget.
 * It draws the resolved clocks only (stage/svg/clocks.ts computed every angle, length, gap and chance with physics/dynamics.ts):
 *   levels  the energy ladder: E₊ and E₋ as lines at their heights (to scale, from the zero of energy), Ē dashed between them and
 *           a double arrow for the splitting ħω
 *   clocks  one dial per level: the hand of the |+z⟩ amplitude and the hand of the |−z⟩ amplitude, each turning clockwise at E/ħ;
 *           a hand's length is the amplitude's size and its hue is its own phase (stage/phaseHue.ts: a code for an angle)
 *   gap     the angle between the two hands as a dial: the lower hand's angle seen from the upper one, which is the relative phase
 *   top     the equator seen from +z: the arrow at the state's azimuth φ = ωt (x to the right, y up, as the Bloch sphere's top view)
 * The panels pack into whatever the box allows (a portrait stage stacks two rows, a wide widget uses columns); a panel that is
 * not asked for is not drawn. Structure is silver; the amber / cobalt outcome hues are never used.
 */
import type { SvgSceneProps } from '../svgKinds'
import { phaseColor } from '../phaseHue'
import type { ResolvedClocks } from '../types'
import { clocksReadouts } from './clocks'
import { Arrow, Label, type Pt, arcPath, fix } from './draw'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface ClocksLayout {
  padX: number
  /** Lines of text the figure carries itself (print and bare), at the top. */
  lines: string[]
  area: Rect
  panels: Partial<Record<'levels' | 'clocks' | 'gap' | 'top', Rect>>
}

const split = (r: Rect, frac: number, wide: boolean): [Rect, Rect] =>
  wide
    ? [
        { x: r.x, y: r.y, w: r.w * frac, h: r.h },
        { x: r.x + r.w * frac, y: r.y, w: r.w * (1 - frac), h: r.h },
      ]
    : [
        { x: r.x, y: r.y, w: r.w, h: r.h * frac },
        { x: r.x, y: r.y + r.h * frac, w: r.w, h: r.h * (1 - frac) },
      ]

/** Where every panel goes, for a drawing box and a resolved state (pure, so a test can check nothing leaves the box). */
export function clocksLayout(r: ResolvedClocks, width: number, height: number, own: boolean, slot?: string | null): ClocksLayout {
  const lines = own ? clocksReadouts(r).map((x) => x.text) : []
  const padX = own ? 12 : 26
  const nReadouts = clocksReadouts(r).length
  // the live stage keeps room for the passport (its note wraps to four lines, with the hue legend) and the readout column
  const top = own ? 8 + 13 * lines.length + (lines.length ? 6 : 0) : Math.max(118, 30 + 17 * nReadouts)
  const bottom = own ? 8 : slot === 'top' ? 14 : 92
  const area: Rect = { x: padX, y: top, w: Math.max(40, width - 2 * padX), h: Math.max(40, height - top - bottom) }
  const has = (p: ResolvedClocks['show'][number]) => r.show.includes(p)
  const g1 = has('levels') || has('clocks')
  const g2 = has('gap') || has('top')
  const wideArea = area.w >= 1.25 * area.h
  let cell1: Rect | null = null
  let cell2: Rect | null = null
  if (g1 && g2) [cell1, cell2] = wideArea ? split(area, 0.6, true) : split(area, 0.54, false)
  else if (g1) cell1 = area
  else cell2 = area
  const panels: ClocksLayout['panels'] = {}
  if (cell1) {
    if (has('levels') && has('clocks')) {
      const [a, b] = split(cell1, 0.44, true)
      panels.levels = a
      panels.clocks = b
    } else if (has('levels')) panels.levels = cell1
    else panels.clocks = cell1
  }
  if (cell2) {
    if (has('gap') && has('top')) {
      const [a, b] = split(cell2, 0.5, cell2.w >= 1.3 * cell2.h)
      panels.gap = a
      panels.top = b
    } else if (has('gap')) panels.gap = cell2
    else panels.top = cell2
  }
  return { padX, lines, area, panels }
}

const DEG = Math.PI / 180

/** A point at angle `a` (radians, counter-clockwise from +x, y up) and distance `d` from `c`. */
const polar = (c: Pt, a: number, d: number): Pt => ({ x: c.x + d * Math.cos(a), y: c.y - d * Math.sin(a) })

/** A dial's face: the circle, the four quarter ticks and the reference at 0° (3 o'clock). */
function Face({ c, R }: { c: Pt; R: number }) {
  return (
    <g>
      <circle cx={c.x} cy={c.y} r={R} fill="none" className="fg-sil2" strokeWidth={1.3} />
      {[0, 90, 180, 270].map((d) => {
        const a = polar(c, d * DEG, R)
        const b = polar(c, d * DEG, R - 5)
        return <line key={d} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="fg-sil2" strokeWidth={1.2} />
      })}
      <circle cx={c.x} cy={c.y} r={2} className="fg-sil-fill" />
    </g>
  )
}

/** The unit text for an energy: "3ε", "0.5ε". */
const eps = (E: number): string => (E === 1 ? 'ε' : E === 0 ? '0' : `${fix(E, 2)}ε`)

export function ClocksScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'clocks'>) {
  const print = mode === 'print'
  const own = print || !!bare
  const L = clocksLayout(r, width, height, own, slot)
  const f = (a: string) => (focus === a ? 'svgk-focus' : undefined)
  const hue = (phi: number) => phaseColor(phi, mode)
  const { upper, lower } = r.levels

  /* ---------------------------------------- panel: the energy ladder ---------------------------------------- */
  const ladder = (p: Rect) => {
    const yTop = p.y + 26
    const yBase = p.y + p.h - 10
    const Emax = Math.max(upper * 1.18, upper + 1)
    const yOf = (E: number) => yBase - (E / Emax) * (yBase - yTop)
    const x0 = p.x + 8
    const xa = x0 + 10
    const Lw = Math.max(48, Math.min(p.w - 74, 150))
    const xb = xa + Lw
    const yU = yOf(upper)
    const yL = yOf(lower)
    const yM = yOf(r.mean)
    const pxGap = yL - yU
    const roomy = pxGap >= 30
    const xArrow = xa + Math.min(Lw * 0.3, 34)
    return (
      <g data-panel="levels">
        <Label at={{ x: p.x + 4, y: p.y + 12 }} cls="fg-lbl">
          energy levels
        </Label>
        {/* the axis from the zero of energy */}
        <Arrow a={{ x: x0, y: yBase }} b={{ x: x0, y: yTop - 6 }} cls="fg-sil2" width={1.2} head={6} />
        <line x1={x0 - 3} y1={yBase} x2={x0 + 3} y2={yBase} className="fg-sil2" strokeWidth={1.2} />
        <Label at={{ x: x0 + 7, y: yBase - 3 }} cls="fg-lbl">
          0
        </Label>
        {/* Ē: dashed, between the two levels */}
        <g data-anchor="mean" className={f('mean')}>
          <line x1={xa} y1={yM} x2={xb} y2={yM} className="fg-sil" strokeWidth={1.4} strokeDasharray="5 4" />
          {roomy && (
            <Label at={{ x: xb + 5, y: yM + 4 }} cls="fg-lbl">
              {`Ē = ${eps(r.mean)}`}
            </Label>
          )}
        </g>
        <g data-anchor="level-upper" className={f('level-upper')}>
          <line x1={xa} y1={yU} x2={xb} y2={yU} className="fg-state" strokeWidth={3.2} strokeLinecap="round" />
          <Label at={{ x: xb + 5, y: yU + (roomy ? 4 : -4) }} cls="fg-txt">
            {`E₊ = ${eps(upper)}`}
          </Label>
        </g>
        <g data-anchor="level-lower" className={f('level-lower')}>
          <line x1={xa} y1={yL} x2={xb} y2={yL} className="fg-state" strokeWidth={3.2} strokeLinecap="round" />
          <Label at={{ x: xb + 5, y: yL + (roomy ? 4 : 14) }} cls="fg-txt">
            {`E₋ = ${eps(lower)}`}
          </Label>
        </g>
        {/* the splitting ħω */}
        <g data-anchor="gap-arrow" className={f('gap-arrow')}>
          <Arrow a={{ x: xArrow, y: yM }} b={{ x: xArrow, y: yU + 2 }} cls="fg-sil" width={1.6} head={7} />
          <Arrow a={{ x: xArrow, y: yM }} b={{ x: xArrow, y: yL - 2 }} cls="fg-sil" width={1.6} head={7} />
          {roomy && (
            <Label at={{ x: xArrow + 7, y: yM - 6 }} cls="fg-lbl">
              {`ħω = ${eps(r.hbarOmega)}`}
            </Label>
          )}
        </g>
      </g>
    )
  }

  /* ---------------------------------------- panel: one dial per level ---------------------------------------- */
  const dial = (b: Rect, k: 0 | 1) => {
    const len = r.hands.length[k]
    const turned = r.hands.turned[k]
    const start = r.startAngle[k]
    const titleY = b.y + 12
    const Rr = Math.max(14, Math.min((b.w - 16) / 2, (b.h - 18 - 18) / 2, 64))
    const c: Pt = { x: b.x + b.w / 2, y: b.y + 18 + Rr }
    const tip = polar(c, turned, Rr * len)
    const swept = turned - start
    const name = k === 0 ? 'clock-upper' : 'clock-lower'
    return (
      <g key={name} data-anchor={name} className={f(name)}>
        <Label at={{ x: b.x + b.w / 2, y: titleY }} anchor="middle" cls="fg-lbl">
          {k === 0 ? `|+z⟩ · E₊ = ${eps(upper)}` : `|−z⟩ · E₋ = ${eps(lower)}`}
        </Label>
        <Face c={c} R={Rr} />
        {len > 1e-9 && (
          <>
            {/* where the hand started, and the angle it has turned through since */}
            <line x1={c.x} y1={c.y} x2={polar(c, start, Rr * len).x} y2={polar(c, start, Rr * len).y} className="fg-sil" strokeWidth={1.1} strokeDasharray="3 3" opacity={0.7} />
            {Math.abs(swept) > 0.02 && <path d={arcPath(c, Rr * 0.3, start, turned)} fill="none" style={{ stroke: hue(turned) }} strokeWidth={1.6} opacity={0.55} />}
            <Arrow a={c} b={tip} color={hue(turned)} width={2.8} head={Math.min(9, Rr * 0.35)} />
          </>
        )}
        <Label at={{ x: b.x + b.w / 2, y: c.y + Rr + 14 }} anchor="middle" cls="fg-txt">
          {len > 1e-9 ? `${fix(r.hands.angleDeg[k], 0)}°` : 'no amplitude'}
        </Label>
      </g>
    )
  }
  const clocks = (p: Rect) => {
    const side = p.h < 0.9 * p.w
    const [a, b] = split(p, 0.5, side)
    return (
      <g data-panel="clocks">
        {dial(a, 0)}
        {dial(b, 1)}
      </g>
    )
  }

  /* ---------------------------------------- panel: the gap as a dial ---------------------------------------- */
  const gap = (p: Rect) => {
    const Rr = Math.max(14, Math.min((p.w - 16) / 2, (p.h - 18 - 18) / 2, 64))
    const c: Pt = { x: p.x + p.w / 2, y: p.y + 18 + Rr }
    const g = r.gapDeg
    return (
      <g data-panel="gap" data-anchor="gap-dial" className={f('gap-dial')}>
        <Label at={{ x: p.x + p.w / 2, y: p.y + 12 }} anchor="middle" cls="fg-lbl">
          gap: lower hand vs upper
        </Label>
        <Face c={c} R={Rr} />
        {g === null ? (
          <Label at={{ x: c.x, y: c.y + Rr + 14 }} anchor="middle" cls="fg-txt">
            one clock only
          </Label>
        ) : (
          <>
            <line x1={c.x} y1={c.y} x2={c.x + Rr * 0.92} y2={c.y} className="fg-sil" strokeWidth={1.3} strokeDasharray="4 3" />
            <path d={arcPath(c, Rr * 0.42, 0, g * DEG)} fill="none" style={{ stroke: hue(g * DEG) }} strokeWidth={2.2} />
            <Arrow a={c} b={polar(c, g * DEG, Rr * 0.92)} color={hue(g * DEG)} width={2.8} head={Math.min(9, Rr * 0.35)} />
            <Label at={{ x: c.x, y: c.y + Rr + 14 }} anchor="middle" cls="fg-txt">
              {`${Math.round(g) % 360}°`}
            </Label>
          </>
        )}
      </g>
    )
  }

  /* ---------------------------------------- panel: the equator seen from +z ---------------------------------------- */
  const topView = (p: Rect) => {
    const Rr = Math.max(14, Math.min((p.w - 28) / 2, (p.h - 18 - 18) / 2, 64))
    const c: Pt = { x: p.x + p.w / 2, y: p.y + 18 + Rr }
    const [bx, by] = r.bloch
    const reach = Math.hypot(bx, by)
    const az = Math.atan2(by, bx)
    const atPole = reach < 1e-6
    return (
      <g data-panel="top" data-anchor="top-arrow" className={f('top-arrow')}>
        <Label at={{ x: p.x + p.w / 2, y: p.y + 12 }} anchor="middle" cls="fg-lbl">
          equator from +z
        </Label>
        <circle cx={c.x} cy={c.y} r={Rr} fill="none" className="fg-sil2" strokeWidth={1.3} />
        <line x1={c.x - Rr} y1={c.y} x2={c.x + Rr} y2={c.y} className="fg-sil3" strokeWidth={1} />
        <line x1={c.x} y1={c.y - Rr} x2={c.x} y2={c.y + Rr} className="fg-sil3" strokeWidth={1} />
        <Label at={{ x: c.x + Rr + 4, y: c.y + 4 }} cls="fg-lbl">
          +x
        </Label>
        <Label at={{ x: c.x, y: c.y - Rr - 4 }} anchor="middle" cls="fg-lbl">
          +y
        </Label>
        {atPole ? (
          <>
            <circle cx={c.x} cy={c.y} r={4} className="fg-state-fill" />
            <Label at={{ x: c.x, y: c.y + Rr + 14 }} anchor="middle" cls="fg-txt">
              a pole: no azimuth
            </Label>
          </>
        ) : (
          <>
            {az !== 0 && Math.abs(az) > 0.02 && <path d={arcPath(c, Rr * 0.3, 0, az)} fill="none" className="fg-sil" strokeWidth={1.4} />}
            <Arrow a={c} b={{ x: c.x + Rr * bx, y: c.y - Rr * by }} cls="fg-state" width={2.8} head={Math.min(9, Rr * 0.35)} />
            <Label at={{ x: c.x, y: c.y + Rr + 14 }} anchor="middle" cls="fg-txt">
              {`φ = ${Math.round(((az / DEG) % 360 + 360) % 360) % 360}°`}
            </Label>
          </>
        )}
      </g>
    )
  }

  return (
    <g className="svgk-scene" data-kind="clocks">
      {L.lines.map((t, i) => (
        <Label key={i} at={{ x: L.padX, y: 16 + 13 * i }} cls="fg-lbl">
          {t}
        </Label>
      ))}
      {L.panels.levels && ladder(L.panels.levels)}
      {L.panels.clocks && clocks(L.panels.clocks)}
      {L.panels.gap && gap(L.panels.gap)}
      {L.panels.top && topView(L.panels.top)}
    </g>
  )
}
