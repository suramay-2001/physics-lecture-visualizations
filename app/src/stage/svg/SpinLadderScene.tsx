/**
 * The `spin-ladder` scene: ONE component for the live stage, the reading version and the print figure. It draws the resolved ladder only
 * (stage/svg/spinLadder.ts took every level, chance, coefficient, entry and length from physics/angmom.ts):
 *   ladder  2j + 1 level lines from m = +j down to -j, each labelled; a state's bars (the chance an SGz finds each level, Townsend Fig. 3.10);
 *           the J+ / J- arrow from a level to its neighbour with the engine's square-root weight, or a stop with 0 on the end level
 *   matrix  the (2j+1) x (2j+1) grid of an operator in the z basis, rows and columns labelled by m, entries in exact form
 *   cone    Townsend Fig. 3.4: an arrow of length |J| and its z part j, dashed (a picture of two lengths, never a direction)
 * Panels pack by the box: the ladder on the left, the matrix or the cone picture on the right when asked for. Structure is silver; the
 * bars use the state hue; the amber / cobalt outcome hues are never used.
 */
import type { SvgSceneProps } from '../svgKinds'
import type { ResolvedSpinLadder } from '../types'
import { Arrow, Label, type Pt, arcPath, fix } from './draw'
import { entryText, mText, spinLadderReadouts } from './spinLadder'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface SpinLadderLayout {
  padX: number
  /** Lines of text the figure carries itself (print and bare), at the top. */
  lines: string[]
  area: Rect
  ladder: Rect
  side: Rect | null
}

/** Where the panels go, for a drawing box and a resolved state (pure, so a test can check nothing leaves the box). */
export function spinLadderLayout(r: ResolvedSpinLadder, width: number, height: number, own: boolean, slot?: string | null): SpinLadderLayout {
  const lines = own ? spinLadderReadouts(r).map((x) => x.text) : []
  const padX = own ? 12 : 26
  const nReadouts = spinLadderReadouts(r).length
  const top = own ? 8 + 13 * lines.length + (lines.length ? 6 : 0) : Math.max(118, 30 + 17 * nReadouts)
  const bottom = own ? 8 : slot === 'top' ? 14 : 92
  const area: Rect = { x: padX, y: top, w: Math.max(60, width - 2 * padX), h: Math.max(60, height - top - bottom) }
  const wantSide = r.matrix !== null || r.readouts.includes('cone')
  if (!wantSide) return { padX, lines, area, ladder: area, side: null }
  const wide = area.w >= 1.15 * area.h
  const frac = r.matrix ? (wide ? 0.4 : 0.42) : 0.5
  return wide
    ? { padX, lines, area, ladder: { x: area.x, y: area.y, w: area.w * frac, h: area.h }, side: { x: area.x + area.w * frac, y: area.y, w: area.w * (1 - frac), h: area.h } }
    : { padX, lines, area, ladder: { x: area.x, y: area.y, w: area.w, h: area.h * frac }, side: { x: area.x, y: area.y + area.h * frac, w: area.w, h: area.h * (1 - frac) } }
}

const DEG = Math.PI / 180

export function SpinLadderScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'spin-ladder'>) {
  const print = mode === 'print'
  const own = print || !!bare
  const L = spinLadderLayout(r, width, height, own, slot)
  const f = (a: string) => (focus === a ? 'svgk-focus' : undefined)
  const n = r.levels.length

  /* ---------------------------------------- panel: the ladder ---------------------------------------- */
  const ladder = (p: Rect) => {
    const gap = Math.min(54, (p.h - 30) / Math.max(1, n - 1))
    const span = gap * (n - 1)
    const y0 = p.y + 18 + Math.max(0, (p.h - 30 - span) / 2)
    const yOf = (m: number) => y0 + (r.levels[0] - m) * (span / Math.max(1e-9, r.levels[0] - r.levels[n - 1]))
    const xLab = p.x + 34
    const xa = p.x + 40
    const lineW = Math.min(46, p.w * 0.3)
    const xBar = xa + lineW + 6
    const barMax = Math.max(24, p.w - (xBar - p.x) - 44)
    const chances = r.ket?.chances ?? []
    return (
      <g data-panel="ladder">
        <Label at={{ x: p.x + 4, y: p.y + 10 }} cls="fg-lbl">
          m
        </Label>
        {r.levels.map((m, k) => (
          <g key={m} data-anchor="level" className={f('level')}>
            <Label at={{ x: xLab, y: yOf(m) + 4 }} anchor="end" cls="fg-txt">
              {mText(m)}
            </Label>
            <line x1={xa} y1={yOf(m)} x2={xa + lineW} y2={yOf(m)} className={r.ket && Math.abs(r.ket.m - m) < 1e-9 && r.ket.axis === 'z' ? 'fg-state' : 'fg-sil'} strokeWidth={3} strokeLinecap="round" />
            {r.ket && r.ket.axis !== 'z' && (
              <g data-anchor="bar" className={f('bar')}>
                <rect x={xBar} y={yOf(m) - 7} width={Math.max(0, chances[k] * barMax)} height={14} className="fg-state-fill" opacity={0.85} />
                <Label at={{ x: xBar + chances[k] * barMax + 5, y: yOf(m) + 4 }} cls="fg-txt">
                  {fix(chances[k], 3)}
                </Label>
              </g>
            )}
          </g>
        ))}
        {r.apply && (
          <g data-anchor="arrow" className={f('arrow')}>
            {r.apply.to !== null ? (
              <>
                <Arrow a={{ x: xa + lineW + 14, y: yOf(r.apply.from) }} b={{ x: xa + lineW + 14, y: yOf(r.apply.to) + (r.apply.dir === '+' ? 3 : -3) }} cls="fg-sil" width={2.2} head={8} />
                <Label at={{ x: xa + lineW + 22, y: (yOf(r.apply.from) + yOf(r.apply.to)) / 2 + 4 }} cls="fg-txt">
                  {`× ${fix(r.apply.coeff, 4)}`}
                </Label>
              </>
            ) : (
              <>
                <line x1={xa + lineW + 14} y1={yOf(r.apply.from)} x2={xa + lineW + 14} y2={yOf(r.apply.from) + (r.apply.dir === '+' ? -16 : 16)} className="fg-sil" strokeWidth={2.2} />
                <line x1={xa + lineW + 8} y1={yOf(r.apply.from) + (r.apply.dir === '+' ? -16 : 16)} x2={xa + lineW + 20} y2={yOf(r.apply.from) + (r.apply.dir === '+' ? -16 : 16)} className="fg-sil" strokeWidth={2.2} />
                <Label at={{ x: xa + lineW + 26, y: yOf(r.apply.from) + (r.apply.dir === '+' ? -10 : 22) }} cls="fg-txt">
                  0
                </Label>
              </>
            )}
          </g>
        )}
      </g>
    )
  }

  /* ---------------------------------------- panel: the matrix ---------------------------------------- */
  const matrix = (p: Rect) => {
    const M = r.matrix!
    const cell = Math.max(18, Math.min(46, (p.w - 34) / (n + 0.6), (p.h - 40) / (n + 0.6)))
    const gx = p.x + Math.max(26, (p.w - cell * n) / 2)
    const gy = p.y + 34
    return (
      <g data-panel="matrix" data-anchor="matrix" className={f('matrix')}>
        <Label at={{ x: p.x + p.w / 2, y: p.y + 12 }} anchor="middle" cls="fg-lbl">
          {`${M.name === 'J+' ? 'J₊' : M.name === 'J-' ? 'J₋' : M.name === 'J2' ? 'J²' : `J${M.name.slice(1)}`} in ħ, z basis`}
        </Label>
        {r.levels.map((m, k) => (
          <g key={`h${m}`}>
            <Label at={{ x: gx + cell * k + cell / 2, y: gy - 5 }} anchor="middle" cls="fg-lbl">
              {mText(m)}
            </Label>
            <Label at={{ x: gx - 5, y: gy + cell * k + cell / 2 + 3 }} anchor="end" cls="fg-lbl">
              {mText(m)}
            </Label>
          </g>
        ))}
        {M.entries.map((row, i) =>
          row.map((z, k) => {
            const zero = z.re === 0 && z.im === 0
            return (
              <g key={`${i}-${k}`}>
                <rect x={gx + cell * k} y={gy + cell * i} width={cell} height={cell} fill="none" className="fg-sil3" strokeWidth={1} />
                <Label at={{ x: gx + cell * k + cell / 2, y: gy + cell * i + cell / 2 + 3 }} anchor="middle" cls={zero ? 'fg-lbl' : 'fg-txt'}>
                  {entryText(z)}
                </Label>
              </g>
            )
          }),
        )}
      </g>
    )
  }

  /* ---------------------------------------- panel: |J| against the top projection ---------------------------------------- */
  const cone = (p: Rect) => {
    const R = Math.max(30, Math.min(p.w / 2 - 14, (p.h - 36) / 2, 90))
    const unit = R / Math.max(r.length, r.levels[0])
    const c: Pt = { x: p.x + p.w / 2, y: p.y + p.h / 2 + 8 }
    const th = r.coneDeg[0] * DEG
    const tip: Pt = { x: c.x + r.length * unit * Math.sin(th), y: c.y - r.length * unit * Math.cos(th) }
    const foot: Pt = { x: c.x, y: c.y - r.levels[0] * unit }
    return (
      <g data-panel="cone" data-anchor="cone" className={f('cone')}>
        <Label at={{ x: p.x + p.w / 2, y: p.y + 12 }} anchor="middle" cls="fg-lbl">
          length |J| and its z part
        </Label>
        <line x1={c.x} y1={c.y + r.levels[0] * unit * 1.05} x2={c.x} y2={c.y - R - 6} className="fg-sil2" strokeWidth={1.2} />
        {r.levels.map((m) => (
          <line key={m} x1={c.x - 3} y1={c.y - m * unit} x2={c.x + 3} y2={c.y - m * unit} className="fg-sil2" strokeWidth={1.2} />
        ))}
        <path d={arcPath(c, r.length * unit, Math.PI / 2 - th, Math.PI / 2)} fill="none" className="fg-sil3" strokeWidth={1} strokeDasharray="3 3" />
        <line x1={tip.x} y1={tip.y} x2={foot.x} y2={foot.y} className="fg-sil" strokeWidth={1.2} strokeDasharray="4 3" />
        <Arrow a={c} b={tip} cls="fg-state" width={2.6} head={8} />
        <Label at={{ x: tip.x + 6, y: tip.y + 4 }} cls="fg-txt">
          {`|J| = ${fix(r.length, 3)}`}
        </Label>
        <Label at={{ x: c.x - 6, y: foot.y + 4 }} anchor="end" cls="fg-txt">
          {`j = ${fix(r.levels[0], 1)}`}
        </Label>
        <Label at={{ x: c.x, y: c.y + r.levels[0] * unit * 1.05 + 14 }} anchor="middle" cls="fg-lbl">
          {`${fix(r.coneDeg[0], 2)}° from z`}
        </Label>
      </g>
    )
  }

  return (
    <g className="svgk-scene" data-kind="spin-ladder">
      {L.lines.map((t, i) => (
        <Label key={i} at={{ x: L.padX, y: 16 + 13 * i }} cls="fg-lbl">
          {t}
        </Label>
      ))}
      {ladder(L.ladder)}
      {L.side && (r.matrix ? matrix(L.side) : cone(L.side))}
    </g>
  )
}
