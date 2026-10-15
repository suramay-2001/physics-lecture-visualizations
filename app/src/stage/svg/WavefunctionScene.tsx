/**
 * The `wavefunction` scene: ONE component for the live stage, the reading version and the print figure. It draws the resolved state only
 * (stage/svg/wavefunction.ts took every sample, scale, moment and chance from physics/wave.ts):
 *   position  ψ(x) over the window: Re ψ and Im ψ as thin lines about a zero line (ONE amplitude scale), |ψ|² filled from the baseline (its own
 *             scale), an optional phase band under the baseline (hue = arg ψ), a shaded interval, a bar chart of cells, and the dashed overlays
 *             (the unmoved state, x̂ψ, p̂ψ)
 *   momentum  φ(p) over its window, in the same colours (a packet), or a spike at each momentum of a plane wave
 * The panels stack in the box (position above momentum). Structure is silver; the amber / cobalt outcome hues are never used, and the phase hue is a
 * code for an angle.
 */
import type { SvgSceneProps } from '../svgKinds'
import { phaseColor } from '../phaseHue'
import type { ResolvedWavefunction, WaveCurve } from '../types'
import { wavefunctionReadouts } from './wavefunction'
import { Arrow, Label, fix } from './draw'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}
export interface WavefunctionLayout {
  padX: number
  lines: string[]
  area: Rect
  panels: Partial<Record<'position' | 'momentum', Rect>>
}

/** Where every panel goes, for a drawing box and a resolved state (pure, so a test can check nothing leaves the box). */
export function wavefunctionLayout(r: ResolvedWavefunction, width: number, height: number, own: boolean, slot?: string | null): WavefunctionLayout {
  const lines = own ? wavefunctionReadouts(r).map((x) => x.text) : []
  const padX = own ? 12 : 22
  const nReadouts = wavefunctionReadouts(r).length
  // the live stage keeps room for the passport (a two-line title, a two-line note and the hue legend) and the readout column
  const top = own ? 8 + 13 * lines.length + (lines.length ? 6 : 0) : Math.max(134, 30 + 17 * nReadouts)
  const bottom = own ? 8 : slot === 'top' ? 12 : 92
  const area: Rect = { x: padX, y: top, w: Math.max(60, width - 2 * padX), h: Math.max(60, height - top - bottom) }
  const both = r.panels.includes('position') && r.panels.includes('momentum')
  const panels: WavefunctionLayout['panels'] = {}
  if (both) {
    const hp = area.h * 0.56
    panels.position = { x: area.x, y: area.y, w: area.w, h: hp }
    panels.momentum = { x: area.x, y: area.y + hp, w: area.w, h: area.h - hp }
  } else if (r.panels.includes('position')) panels.position = area
  else panels.momentum = area
  return { padX, lines, area, panels }
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

export function WavefunctionScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'wavefunction'>) {
  const print = mode === 'print'
  const own = print || !!bare
  const L = wavefunctionLayout(r, width, height, own, slot)
  const f = (a: string) => (focus === a ? 'svgk-focus' : undefined)
  const hue = (phi: number) => phaseColor(phi, mode)
  const show = (k: ResolvedWavefunction['show'][number]) => r.show.includes(k)

  /* ---------------------------------------------- one panel ---------------------------------------------- */
  const panel = (rect: Rect, which: 'position' | 'momentum') => {
    const isPos = which === 'position'
    const curve: WaveCurve | null = isPos ? r.position : r.momentum
    const [lo, hi] = isPos ? r.window.x : r.window.p
    const ampMax = (isPos ? r.scale.amp : r.scale.ampP) * 1.12
    const densMax = (isPos ? r.scale.dens : r.scale.densP) * 1.12
    const left = rect.x + 6
    const right = rect.x + rect.w - 6
    const top = rect.y + 20
    const hasBand = show('phase')
    const bottom = rect.y + rect.h - 16 - (hasBand ? 9 : 0)
    const hasLines = show('re') || show('im') || (isPos && (r.overlay.includes('xpsi') || r.overlay.includes('ppsi')))
    const px = (x: number) => left + ((x - lo) / (hi - lo)) * (right - left)
    const yMid = (top + bottom) / 2
    const halfH = (bottom - top) / 2
    const yAmp = (v: number) => clamp(yMid - (v / ampMax) * halfH, top, bottom)
    const yDens = (v: number) => clamp(bottom - (v / densMax) * (bottom - top), top, bottom)
    const poly = (xs: number[], ys: number[]) => xs.map((x, j) => `${j ? 'L' : 'M'}${px(x).toFixed(1)},${ys[j].toFixed(1)}`).join('')
    const area = (xs: number[], ys: number[]) => `${poly(xs, ys)}L${px(xs[xs.length - 1]).toFixed(1)},${bottom.toFixed(1)}L${px(xs[0]).toFixed(1)},${bottom.toFixed(1)}Z`
    const xTicks = [lo, ...(lo < 0 && hi > 0 ? [0] : []), hi]

    const swatches: { key: string; text: string; cls: string; dash?: string }[] = []
    if (show('re')) swatches.push({ key: 're', text: isPos ? 'Re ψ' : 'Re φ', cls: 'fg-state' })
    if (show('im')) swatches.push({ key: 'im', text: isPos ? 'Im ψ' : 'Im φ', cls: 'fg-op' })
    if (show('density')) swatches.push({ key: 'd', text: isPos ? '|ψ|²' : '|φ|²', cls: 'fg-sil' })
    if (isPos && r.overlay.includes('original')) swatches.push({ key: 'o', text: 'original', cls: 'fg-sil3', dash: '5 4' })
    if (isPos && r.overlay.includes('xpsi')) swatches.push({ key: 'x', text: 'x̂ψ', cls: 'fg-sil', dash: '6 3' })
    if (isPos && r.overlay.includes('ppsi')) swatches.push({ key: 'p', text: 'p̂ψ', cls: 'fg-sil', dash: '2 3' })

    return (
      <g key={which} data-panel={which} data-anchor={isPos ? undefined : 'momentum-panel'} className={isPos ? undefined : f('momentum-panel')}>
        <Label at={{ x: rect.x + 6, y: rect.y + 12 }} cls="fg-lbl">
          {isPos ? 'ψ(x) · position' : 'φ(p) · momentum'}
        </Label>
        {swatches.map((s, i) => {
          const x0 = rect.x + rect.w - 6 - (swatches.length - i) * 52
          return (
            <g key={s.key}>
              <line x1={x0} y1={rect.y + 9} x2={x0 + 11} y2={rect.y + 9} className={s.cls} strokeWidth={2} strokeDasharray={s.dash} />
              <Label at={{ x: x0 + 14, y: rect.y + 12 }} cls="fg-lbl">
                {s.text}
              </Label>
            </g>
          )
        })}
        <line x1={left} y1={bottom} x2={right} y2={bottom} className="fg-sil2" strokeWidth={1.2} />
        {hasLines && <line x1={left} y1={yMid} x2={right} y2={yMid} className="fg-sil3" strokeWidth={1} />}
        {xTicks.map((t) => (
          <g key={t}>
            <line x1={px(t)} y1={bottom} x2={px(t)} y2={bottom + 3} className="fg-sil2" strokeWidth={1.1} />
            <Label at={{ x: px(t), y: bottom + (hasBand ? 22 : 13) }} anchor="middle" cls="fg-lbl">
              {fix(t, 0)}
            </Label>
          </g>
        ))}
        <Label at={{ x: right, y: rect.y + rect.h - 2 }} anchor="end" cls="fg-lbl">
          {isPos ? 'x (ℓ)' : 'p (ħ/ℓ)'}
        </Label>

        {/* cells: one bar per cell, its height the chance ÷ the cell width, so the bar tops follow the density */}
        {isPos && r.cells && (
          <g data-anchor="cell-bar" className={f('cell-bar')} opacity={r.cells.alpha}>
            {r.cells.chances.map((c, i) => {
              const w = (hi - lo) / r.cells!.n
              const x0 = px(lo + i * w)
              const x1 = px(lo + (i + 1) * w)
              const y = yDens(c / w)
              return <rect key={i} x={x0} y={y} width={Math.max(0.4, x1 - x0 - (r.cells!.n <= 16 ? 1.5 : 0))} height={Math.max(0, bottom - y)} className="fg-sil-fill" opacity={0.5} />
            })}
          </g>
        )}
        {/* a shaded stretch under the density */}
        {isPos && r.interval && curve && (
          <g data-anchor="interval" className={f('interval')}>
            {(() => {
              const [a, b] = r.interval!
              const idx = curve.x.map((x, j) => ({ x, j })).filter((o) => o.x >= a && o.x <= b)
              if (idx.length < 2) return null
              const xs = [a, ...idx.map((o) => o.x), b]
              const ys = [yDens(curve.density[idx[0].j]), ...idx.map((o) => yDens(curve.density[o.j])), yDens(curve.density[idx[idx.length - 1].j])]
              return <path d={area(xs, ys)} className="fg-sil-fill" opacity={0.34} />
            })()}
            <line x1={px(r.interval[0])} y1={top} x2={px(r.interval[0])} y2={bottom} className="fg-sil" strokeWidth={1} strokeDasharray="3 3" />
            <line x1={px(r.interval[1])} y1={top} x2={px(r.interval[1])} y2={bottom} className="fg-sil" strokeWidth={1} strokeDasharray="3 3" />
          </g>
        )}
        {/* the unmoved state */}
        {isPos && r.original && (
          <g data-anchor="original" className={f('original')}>
            {show('density') ? (
              <path d={poly(r.original.x, r.original.density.map(yDens))} fill="none" className="fg-sil3" strokeWidth={1.4} strokeDasharray="5 4" />
            ) : (
              <path d={poly(r.original.x, r.original.re.map(yAmp))} fill="none" className="fg-sil3" strokeWidth={1.4} strokeDasharray="5 4" />
            )}
          </g>
        )}
        {curve && show('density') && (
          <g data-anchor="density" className={f('density')}>
            <path d={area(curve.x, curve.density.map(yDens))} className="fg-sil-fill" opacity={0.16} />
            <path d={poly(curve.x, curve.density.map(yDens))} fill="none" className="fg-sil" strokeWidth={1.3} />
          </g>
        )}
        {curve && show('im') && (
          <g data-anchor="psi-im" className={f('psi-im')}>
            <path d={poly(curve.x, curve.im.map(yAmp))} fill="none" className="fg-op" strokeWidth={1.5} />
          </g>
        )}
        {curve && show('re') && (
          <g data-anchor="psi-re" className={f('psi-re')}>
            <path d={poly(curve.x, curve.re.map(yAmp))} fill="none" className="fg-state" strokeWidth={1.7} />
          </g>
        )}
        {isPos && r.xpsi && curve && (
          <g data-anchor="xpsi" className={f('xpsi')}>
            <path d={poly(curve.x, r.xpsi.re.map(yAmp))} fill="none" className="fg-sil" strokeWidth={1.3} strokeDasharray="6 3" />
            <path d={poly(curve.x, r.xpsi.im.map(yAmp))} fill="none" className="fg-sil" strokeWidth={1.1} strokeDasharray="6 3" opacity={0.6} />
          </g>
        )}
        {isPos && r.ppsi && curve && (
          <g data-anchor="ppsi" className={f('ppsi')}>
            <path d={poly(curve.x, r.ppsi.re.map(yAmp))} fill="none" className="fg-sil" strokeWidth={1.4} strokeDasharray="2 3" />
            <path d={poly(curve.x, r.ppsi.im.map(yAmp))} fill="none" className="fg-sil" strokeWidth={1.2} strokeDasharray="2 3" opacity={0.6} />
          </g>
        )}
        {/* the phase band: the hue of arg ψ along the line, brighter where there is more density */}
        {curve && hasBand && (
          <g data-anchor="phase-band" className={f('phase-band')}>
            {curve.x.slice(0, -1).map((x, j) => {
              const w = Math.max(0.5, px(curve.x[j + 1]) - px(x) + 0.4)
              const a = Math.sqrt(curve.density[j] / (isPos ? r.scale.dens : r.scale.densP))
              return <rect key={j} x={px(x)} y={bottom + 5} width={w} height={7} style={{ fill: hue(curve.phase[j]) }} opacity={clamp(a, 0.06, 1)} />
            })}
          </g>
        )}
        {/* a plane wave in momentum space: one spike per momentum */}
        {!isPos && r.momentumSpikes && (
          <g data-anchor="momentum-panel">
            {r.momentumSpikes.map((p, i) => (
              <g key={i}>
                <Arrow a={{ x: px(p), y: bottom }} b={{ x: px(p), y: top + 4 }} cls="fg-state" width={2} head={8} />
                <Label at={{ x: px(p) + 5, y: top + 12 }} cls="fg-lbl">
                  {`p = ${fix(p, 2)}`}
                </Label>
              </g>
            ))}
          </g>
        )}
      </g>
    )
  }

  return (
    <g className="svgk-scene" data-kind="wavefunction">
      {L.lines.map((t, i) => (
        <Label key={i} at={{ x: L.padX, y: 16 + 13 * i }} cls="fg-lbl">
          {t}
        </Label>
      ))}
      {L.panels.position && panel(L.panels.position, 'position')}
      {L.panels.momentum && panel(L.panels.momentum, 'momentum')}
    </g>
  )
}

/** The print figure's size: 320 x 300, two panels 320 x 420 (a readout line adds 13). */
export function wavefunctionPrintSize(r: ResolvedWavefunction): { w: number; h: number } {
  const both = r.panels.includes('position') && r.panels.includes('momentum')
  const lines = wavefunctionReadouts(r).length
  return { w: 320, h: (both ? 420 : 300) + Math.max(0, lines - 3) * 13 }
}
