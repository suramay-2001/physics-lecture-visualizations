/**
 * The `complex-plane` scene: ONE component for the live stage ('stage') and the print figure ('print'). It draws the
 * resolved state only (stage/svg/complexPlane.ts computed every number with the engine): the axes Re and Im, the unit
 * circle, z and w and the marks shown, powers, the Euler polygon, phasor chains and spokes. An arrow's hue is its phase
 * (stage/phaseHue.ts, the passport's legend); structure is silver; text is ink with a halo of the ground.
 */
import type { SvgSceneProps } from '../svgKinds'
import { phaseColor } from '../phaseHue'
import type { CNumber, ResolvedComplexPlane } from '../types'
import { complexReadouts } from './complexPlane'
import { Arrow, Label, PhaseWheel, type Pt, arcPath, beyond, fix, sup } from './draw'

/** A figure's text lines: the results first (sum, product, …), then the inputs, at most four. */
const LINE_ORDER = ['sum', 'size-sum', 'zw', 'size-zw', 'arg-zw', 'conj', 'powers', 'euler', 'euler-end', 'euler-size', 'chain', 'chain-size', 'chain-size2', 'velocity', 'z', 'size-z', 'arg-z', 'w', 'size-w', 'arg-w', 're-z', 'im-z']
const ownLines = (r: ResolvedComplexPlane) =>
  complexReadouts(r)
    .sort((a, b) => LINE_ORDER.indexOf(a.name) - LINE_ORDER.indexOf(b.name))
    .slice(0, 4)
    .map((x) => x.text)

export function ComplexPlaneScene({ state: r, mode, width, height, focus, bare, slot }: SvgSceneProps<'complex-plane'>) {
  const print = mode === 'print'
  // print and bare pictures carry their readouts as text lines; the live stage shows them in the overlay's column
  const own = print || !!bare
  const lines = own ? ownLines(r) : []
  // the plane's square: clear of the passport (top-left), the readout column (top-right) and the caption (bottom); in
  // print (or bare), clear of the figure's text lines
  // on stage, the overlay's readout column (one line per readout, ~17 px each) stays clear of the plane too
  const padTop = own ? 12 + 13 * lines.length : Math.max(70, 26 + 17 * complexReadouts(r).length)
  const padBottom = own ? 12 : slot === 'top' ? 18 : 86
  const padX = own ? 12 : 28
  const availW = Math.max(40, width - 2 * padX)
  const availH = Math.max(40, height - padTop - padBottom)
  const R = Math.min(availW, r.line ? availW : availH) / 2
  const s = R / r.extent
  const cx = padX + availW / 2
  const cy = r.line ? padTop + availH * 0.55 : padTop + availH / 2
  const P = (re: number, im: number): Pt => ({ x: cx + s * re, y: cy - s * im })
  const O = P(0, 0)
  const at = (n: { re: number; im: number }) => P(n.re, n.im)
  const hue = (phi: number) => phaseColor(phi, mode)
  const has = (m: ResolvedComplexPlane['show'][number]) => r.show.includes(m)
  const f = (a: string) => focus === a

  // integer grid and tick labels while they stay readable
  const step = r.extent > 12 ? 5 : r.extent > 6 ? 2 : 1
  const ticks: number[] = []
  for (let k = step; k < r.extent; k += step) ticks.push(k, -k)
  const labelFor = (n: CNumber | null, name: string, color: string) => {
    if (!n) return null
    const tip = at(n)
    const { at: p, anchor: ta } = beyond(tip, { x: tip.x - O.x, y: tip.y - O.y })
    return (
      <Label key={`l-${name}`} at={p} anchor={ta} cls="fg-txt fg-big" color={print ? undefined : color}>
        {name}
      </Label>
    )
  }
  const arrowOf = (n: CNumber | null, name: string, anchor: string, width = 2.4, from: Pt = O, dashed = false) =>
    n ? <Arrow key={`a-${name}`} a={from} b={from === O ? at(n) : { x: from.x + s * n.re, y: from.y - s * n.im }} color={hue(n.phi)} width={width} anchor={anchor} focus={f(anchor)} dashed={dashed} /> : null

  return (
    <g className="svgk-scene" data-kind="complex-plane">
      {/* grid */}
      {!r.line &&
        ticks.map((k) => (
          <g key={`g${k}`}>
            <line x1={P(k, -r.extent).x} y1={P(k, -r.extent).y} x2={P(k, r.extent).x} y2={P(k, r.extent).y} className="fg-sil3" strokeWidth={0.8} />
            <line x1={P(-r.extent, k).x} y1={P(-r.extent, k).y} x2={P(r.extent, k).x} y2={P(r.extent, k).y} className="fg-sil3" strokeWidth={0.8} />
          </g>
        ))}
      {/* axes */}
      <g data-anchor="real-axis" className={f('real-axis') ? 'svgk-focus' : undefined}>
        <line x1={P(-r.extent, 0).x} y1={cy} x2={P(r.extent, 0).x} y2={cy} className="fg-sil2" strokeWidth={1.4} />
        <Label at={{ x: P(r.extent, 0).x - 2, y: cy - 8 }} anchor="end" cls="fg-lbl">
          Re
        </Label>
      </g>
      {!r.line && (
        <g data-anchor="imag-axis" className={f('imag-axis') ? 'svgk-focus' : undefined}>
          <line x1={cx} y1={P(0, -r.extent).y} x2={cx} y2={P(0, r.extent).y} className="fg-sil2" strokeWidth={1.4} />
          <Label at={{ x: cx + 8, y: P(0, r.extent).y + 12 }} cls="fg-lbl">
            Im
          </Label>
        </g>
      )}
      {ticks
        .filter((k) => Math.abs(k) <= 5 * step)
        .map((k) => (
          <g key={`t${k}`}>
            <line x1={P(k, 0).x} y1={cy - 4} x2={P(k, 0).x} y2={cy + 4} className="fg-sil2" strokeWidth={1} />
            <Label at={{ x: P(k, 0).x, y: cy + 17 }} anchor="middle" cls="fg-lbl">
              {fix(k)}
            </Label>
            {!r.line && (
              <Label at={{ x: cx - 7, y: P(0, k).y + 4 }} anchor="end" cls="fg-lbl">
                {k === 1 ? 'i' : k === -1 ? '−i' : `${fix(k)}i`}
              </Label>
            )}
          </g>
        ))}
      <circle cx={cx} cy={cy} r={2.5} className="fg-sil-fill" />
      {/* the unit circle */}
      {r.circle && !r.line && <circle cx={cx} cy={cy} r={s} className={`fg-sil2${f('unit-circle') ? ' svgk-focus' : ''}`} fill="none" strokeWidth={1.2} strokeDasharray="4 4" data-anchor="unit-circle" />}

      {/* the swept path of z */}
      {r.trail && r.trail.length > 1 && <path d={r.trail.map((p, k) => `${k ? 'L' : 'M'}${at(p).x.toFixed(2)},${at(p).y.toFixed(2)}`).join('')} className="fg-sil" fill="none" strokeWidth={1.4} strokeDasharray="2 4" />}

      {/* Euler: the polygon (1 + iφ/n)^k (or the points on the line) closing on its limit */}
      {r.euler && (
        <g data-anchor="polygon" className={f('polygon') ? 'svgk-focus' : undefined}>
          {r.euler.rate === 'imag' && <path d={r.euler.points.map((p, k) => `${k ? 'L' : 'M'}${at(p).x.toFixed(2)},${at(p).y.toFixed(2)}`).join('')} className="fg-sil" fill="none" strokeWidth={1.6} />}
          {r.euler.n <= 64 && r.euler.points.map((p, k) => <circle key={k} cx={at(p).x} cy={at(p).y} r={r.euler!.n <= 16 ? 2.6 : 1.6} className="fg-sil-fill" />)}
          <circle cx={at(r.euler.limit).x} cy={at(r.euler.limit).y} r={6} fill="none" className="fg-sil" strokeWidth={1.4} />
          <Label at={{ x: at(r.euler.limit).x + 8, y: at(r.euler.limit).y + (r.euler.rate === 'imag' ? 18 : -10) }} cls="fg-lbl">
            {r.euler.rate === 'imag' ? 'e^(iφ)' : r.euler.param === 1 ? 'e' : `e^${fix(r.euler.param)}`}
          </Label>
          <circle cx={at(r.euler.end).x} cy={at(r.euler.end).y} r={4.5} style={{ fill: hue(r.euler.end.phi) }} />
        </g>
      )}

      {/* powers 1, z, z², … */}
      {r.powers && (
        <g>
          <path d={r.powers.points.map((p, k) => `${k ? 'L' : 'M'}${at(p).x.toFixed(2)},${at(p).y.toFixed(2)}`).join('')} className="fg-sil" fill="none" strokeWidth={1.2} strokeDasharray="3 3" />
          {r.powers.points.map((p, k) => (
            <g key={k}>
              <circle cx={at(p).x} cy={at(p).y} r={3.6} style={{ fill: hue(p.phi) }} />
              {r.powers!.upTo <= 12 && (
                <Label at={{ x: at(p).x + 6, y: at(p).y - 6 }} cls="fg-lbl">
                  {k === 0 ? '1' : k === 1 ? 'z' : `z${sup(k)}`}
                </Label>
              )}
            </g>
          ))}
        </g>
      )}

      {/* spokes from 0; a chain tip to tail with its resultant */}
      {r.spokes?.tips.map((t, k) => <Arrow key={`sp${k}`} a={O} b={at(t)} color={hue(t.phi)} width={2.2} anchor="chain" focus={f('chain')} />)}
      {r.chain && (
        <g>
          {r.chain.path.slice(1).map((p, k) => (
            <Arrow key={`ch${k}`} a={at(r.chain!.path[k])} b={at(p)} color={hue(r.chain!.phases[k])} width={2.2} anchor="chain" focus={f('chain')} />
          ))}
          {r.chain.sum.r > 1e-9 ? (
            <Arrow a={O} b={at(r.chain.sum)} color={hue(r.chain.sum.phi)} width={3.4} anchor="resultant" focus={f('resultant')} />
          ) : (
            <circle cx={cx} cy={cy} r={5} className="fg-state-fill" data-anchor="resultant" />
          )}
          <Label at={{ x: at(r.chain.sum).x + 8, y: at(r.chain.sum).y + 16 }} cls="fg-txt">
            {r.chain.sum.r > 1e-9 ? 'sum' : 'sum = 0'}
          </Label>
        </g>
      )}

      {/* the marks of z and w */}
      {r.z && has('parts') && (
        <g>
          <line x1={at(r.z).x} y1={at(r.z).y} x2={at(r.z).x} y2={cy} className="fg-sil" strokeDasharray="4 3" strokeWidth={1.2} />
          <line x1={at(r.z).x} y1={at(r.z).y} x2={cx} y2={at(r.z).y} className="fg-sil" strokeDasharray="4 3" strokeWidth={1.2} />
          <Label at={{ x: at(r.z).x, y: cy + (r.z.im >= 0 ? 32 : -24) }} anchor="middle" cls="fg-txt">{`Re z = ${fix(r.z.re)}`}</Label>
          <Label at={{ x: cx + (r.z.re >= 0 ? -10 : 10), y: at(r.z).y - 8 }} anchor={r.z.re >= 0 ? 'end' : 'start'} cls="fg-txt">{`Im z = ${fix(r.z.im)}`}</Label>
        </g>
      )}
      {r.z && has('arg') && r.z.r > 1e-9 && (
        <g data-anchor="arg-z" className={f('arg-z') ? 'svgk-focus' : undefined}>
          <path d={arcPath(O, Math.min(34, s * r.z.r * 0.5), 0, r.z.phi)} fill="none" style={{ stroke: hue(r.z.phi) }} strokeWidth={1.6} />
        </g>
      )}
      {r.z && has('arc') && r.z.r > 1e-9 && (
        <path
          d={r.product && r.w ? arcPath(O, s * r.z.r, r.z.phi, r.z.phi + r.w.phi) : arcPath(O, s * r.z.r, 0, r.z.phi)}
          fill="none"
          className="fg-sil"
          strokeWidth={1.4}
          data-anchor="arg-product"
        />
      )}
      {r.conj && r.z && (
        <g data-anchor="conj" className={f('conj') ? 'svgk-focus' : undefined}>
          <line x1={at(r.z).x} y1={at(r.z).y} x2={at(r.conj).x} y2={at(r.conj).y} className="fg-sil3" strokeDasharray="3 3" strokeWidth={1.2} />
          {arrowOf(r.conj, 'z*', 'conj', 2.2)}
          {labelFor(r.conj, 'z*', hue(r.conj.phi))}
        </g>
      )}
      {r.product && r.z && r.w && (
        <g data-anchor="product" className={f('product') ? 'svgk-focus' : undefined}>
          <path d={arcPath(O, 22, 0, r.z.phi)} fill="none" style={{ stroke: hue(r.z.phi) }} strokeWidth={1.4} data-anchor="arg-z" />
          <path d={arcPath(O, 30, r.z.phi, r.z.phi + r.w.phi)} fill="none" style={{ stroke: hue(r.w.phi) }} strokeWidth={1.4} data-anchor="arg-w" />
          {arrowOf(r.product, 'zw', 'product', 3)}
          {labelFor(r.product, 'zw', hue(r.product.phi))}
        </g>
      )}
      {arrowOf(r.w, 'w', 'w', 2.2, r.sum && r.z ? at(r.z) : O, !!r.sum)}
      {r.sum && r.w && r.z && (
        <>
          {arrowOf(r.w, 'w0', 'w', 1.4, O, true)}
          {arrowOf(r.sum, 'z + w', 'sum', 3)}
          {labelFor(r.sum, 'z + w', hue(r.sum.phi))}
        </>
      )}
      {r.w && !r.sum && labelFor(r.w, 'w', hue(r.w.phi))}
      {r.w && r.sum && r.z && (
        <Label at={{ x: at(r.z).x + (s * r.w.re) / 2 + 8, y: at(r.z).y - (s * r.w.im) / 2 }} cls="fg-txt fg-big" color={print ? undefined : hue(r.w.phi)}>
          w
        </Label>
      )}
      {arrowOf(r.z, 'z', 'z', 2.8)}
      {labelFor(r.z, 'z', r.z ? hue(r.z.phi) : '')}
      {r.z && has('modulus') && r.z.r > 1e-9 && (
        <Label at={{ x: (O.x + at(r.z).x) / 2 - 10 * Math.sin(-r.z.phi), y: (O.y + at(r.z).y) / 2 - 10 * Math.cos(r.z.phi) }} anchor="middle" cls="fg-txt">
          {`|z| = ${fix(r.z.r)}`}
        </Label>
      )}
      {r.velocity && r.z && (
        <g data-anchor="velocity" className={f('velocity') ? 'svgk-focus' : undefined}>
          <Arrow a={at(r.z)} b={{ x: at(r.z).x + s * r.velocity.re, y: at(r.z).y - s * r.velocity.im }} cls="fg-sil" width={2} />
          <Label at={{ x: at(r.z).x + s * r.velocity.re + 6, y: at(r.z).y - s * r.velocity.im - 6 }} cls="fg-txt">
            velocity iz
          </Label>
        </g>
      )}

      {/* print: the hue wheel's legend (on stage the passport carries it) */}
      {own && (r.z || r.w || r.chain || r.spokes || r.powers || r.euler) && <PhaseWheel x={width - 12} y={height - 16} mode={mode} />}
      {/* print: the readouts as the figure's text lines (the stage shows them in the overlay's readout column) */}
      {lines.map((t, k) => (
        <Label key={`rl${k}`} at={{ x: 8, y: 14 + 13 * k }} cls="fg-txt">
          {t}
        </Label>
      ))}
    </g>
  )
}
