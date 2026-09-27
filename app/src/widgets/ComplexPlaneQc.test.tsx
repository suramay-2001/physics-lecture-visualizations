/**
 * The complex-plane Try-it widget's 709 modes (P-F1-story §3 `euler`, §9.3 `phasor`) draw the `complex-plane` stage kind
 * itself, with its resolver's engine calls: the widget's numbers are the stage's numbers. The 448 modes are untouched.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { eulerLimit, phasorSum } from '../physics/qc/complexExtra'
import { fmtC } from '../stage/svg/draw'
import ComplexPlaneQc from './ComplexPlaneQc'
import { ComplexPlane } from './ComplexPlane'

describe('complex-plane widget: 709 modes', () => {
  it('euler: the polygon (1 + iφ/n)^n of the stage kind, with its end point from eulerLimit', () => {
    const html = renderToString(<ComplexPlaneQc mode="euler" phi={180} n={4} />)
    expect(html).toContain(`end ${fmtC(eulerLimit(Math.PI, 4))}`)
    expect(html).toContain('data-anchor="polygon"')
    expect(html).not.toMatch(/NaN|Infinity/)
  })
  it('phasor: two arrows tip to tail and their resultant, from phasorSum', () => {
    const html = renderToString(<ComplexPlaneQc mode="phasor" phases={[0, 60]} />)
    expect(html).toContain(`sum = ${fmtC(phasorSum([0, Math.PI / 3]))}`)
    expect(html).toContain('data-anchor="resultant"')
    expect(html).not.toMatch(/NaN|Infinity/)
  })
  it('a 448 mode keeps its three-way switch; a 709 mode shows itself only (in a lazy pane)', () => {
    const l2 = renderToString(<ComplexPlane mode="multiply" />)
    expect(l2).toContain('powers of i')
    const f1 = renderToString(<ComplexPlane mode="euler" />)
    expect(f1).not.toContain('powers of i')
    expect(f1).toContain('(1 + iφ/n)ⁿ')
  })
})
