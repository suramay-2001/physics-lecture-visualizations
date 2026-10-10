/**
 * The complex-plane Try-it widget's 709 modes (P-F1-story §3 `euler`, §9.3 `phasor`) draw the `complex-plane` stage kind
 * itself, with its resolver's engine calls: the widget's numbers are the stage's numbers. The 448 modes are untouched.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { abs, expi } from '../physics/complex'
import { eulerLimit, phasorSum, rootsOfUnity } from '../physics/qc/complexExtra'
import { gcd } from '../physics/qc/numtheory'
import { resolveComplexPlane } from '../stage/svg/complexPlane'
import { fmtC } from '../stage/svg/draw'
import ComplexPlaneQc, { ROOTS_RANGE, rootsCorners, rootsState, rootsUse } from './ComplexPlaneQc'
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

describe('complex-plane widget: the roots mode (Chapter F8; the N arrows ω^{jk}, from the centre and tip to tail)', () => {
  const sum = (N: number, j: number) => resolveComplexPlane(rootsState(N, j), 1).chain!.sum
  it('j = 1 draws the regular N-gon of the roots of unity: the arrows are the engine’s rootsOfUnity and they close (sum 0)', () => {
    for (let N = ROOTS_RANGE.nMin; N <= ROOTS_RANGE.nMax; N++) {
      const r = resolveComplexPlane(rootsState(N, 1), 1)
      const roots = rootsOfUnity(N)
      r.spokes!.tips.forEach((t, k) => {
        expect(t.re, `N = ${N}, arrow ${k}`).toBeCloseTo(roots[k].re, 12)
        expect(t.im).toBeCloseTo(roots[k].im, 12)
      })
      expect(abs(sum(N, 1)), `N = ${N}`).toBeLessThan(1e-12)
    }
  })
  it('the sum is N when N divides j and 0 otherwise, for every N and j on the sliders (the story’s D4)', () => {
    for (let N = ROOTS_RANGE.nMin; N <= ROOTS_RANGE.nMax; N++)
      for (let j = ROOTS_RANGE.jMin; j <= ROOTS_RANGE.jMax; j++) expect(abs(sum(N, j)), `N = ${N}, j = ${j}`).toBeCloseTo(j % N === 0 ? N : 0, 11)
    // the worked cases of the Try-it lines
    expect(abs(sum(8, 3))).toBeLessThan(1e-12)
    expect(abs(sum(8, 8))).toBeCloseTo(8, 12)
  })
  it('the corners and the line "corners used" come from the engine: jk mod N, N/gcd(j, N) of them, each gcd(j, N) times', () => {
    expect(rootsCorners(12, 4)).toEqual([0, 4, 8, 0, 4, 8, 0, 4, 8, 0, 4, 8])
    expect(rootsCorners(12, 5)).toEqual([0, 5, 10, 3, 8, 1, 6, 11, 4, 9, 2, 7])
    expect(rootsUse(12, 4)).toEqual({ corners: 3, each: 4 })
    expect(rootsUse(12, 5)).toEqual({ corners: 12, each: 1 })
    expect(rootsUse(12, 0)).toEqual({ corners: 1, each: 12 })
    for (let N = 2; N <= 12; N++)
      for (let j = 0; j <= 12; j++) {
        const corners = new Set(rootsCorners(N, j))
        expect(corners.size, `N = ${N}, j = ${j}`).toBe(rootsUse(N, j).corners)
        expect(rootsUse(N, j).each).toBe(gcd(j, N))
        // every used corner is visited the same number of times
        const counts = new Set([...corners].map((c) => rootsCorners(N, j).filter((x) => x === c).length))
        expect([...counts]).toEqual([rootsUse(N, j).each])
      }
    const html = renderToString(<ComplexPlaneQc mode="roots" N={12} j={4} />)
    expect(html).toContain('corners used: 3 of 12, each 4 times')
    expect(renderToString(<ComplexPlaneQc mode="roots" N={12} j={5} />)).toContain('corners used: 12 of 12, each 1 time')
  })
  it('the stage state is the kind’s own: spokes and a chain of the same arrows, N of them (at most 12), the unit circle on', () => {
    const st = rootsState(5, 2)
    expect(st.chain!.phasesDeg).toEqual([0, 144, 288, 72, 216])
    expect(st.spokes!.phasesDeg).toEqual(st.chain!.phasesDeg)
    expect(st.circle).toBe(true)
    expect(st.clock).toBe(5)
    // each arrow is ω^{jk}: its angle is 360·jk/N degrees mod 360, so its size-1 arrow is the engine's e^{iθ}
    const eight = rootsState(8, 3).chain!.phasesDeg as number[]
    expect(eight).toEqual([0, 135, 270, 45, 180, 315, 90, 225])
    eight.forEach((deg, k) => expect(expi((deg * Math.PI) / 180).re).toBeCloseTo(expi((2 * Math.PI * 3 * k) / 8).re, 12))
  })
  it('renders in the widget with its sliders, the chain’s sum and size, the closed-chain label, and no NaN', () => {
    const closed = renderToString(<ComplexPlaneQc mode="roots" N={8} j={3} />)
    expect(closed).toContain('sum = 0')
    expect(closed).toContain('size 0')
    expect(closed).toContain('sum = 0')
    expect(closed).toContain('data-anchor="resultant"')
    expect(closed).toContain('N (equal turns)')
    expect(closed).toContain('step (corners per arrow)')
    expect(closed).not.toMatch(/NaN|Infinity/)
    const full = renderToString(<ComplexPlaneQc mode="roots" N={8} j={8} />)
    expect(full).toContain('sum = 8')
    expect(full).toContain('size 8')
    // out-of-range props are held to the sliders' range
    const clamped = renderToString(<ComplexPlaneQc mode="roots" N={99} j={99} />)
    expect(clamped).toContain('corners used')
    expect(clamped).not.toMatch(/NaN|Infinity/)
  })
  it('the lazy pane is reached through the widget: roots shows only itself (no 448 switch)', () => {
    const html = renderToString(<ComplexPlane mode="roots" N={5} j={1} />)
    expect(html).not.toContain('powers of i')
    expect(html).toContain('Complex plane: roots of unity')
  })
})
