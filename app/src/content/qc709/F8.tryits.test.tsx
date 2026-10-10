/**
 * Chapter F8's Try-it lines against the REAL widget (`complex-plane`, widgets/ComplexPlane.tsx and its lazy pane ComplexPlaneQc.tsx). Each unit's `visual` names the widget
 * and the props it passes; each `tryThis` line quotes what the widget draws and what it says after the reader acts. Three checks keep a line true:
 *  1. every prop is one the widget declares (read from the source; the mode decides which), the values lie in the sliders' ranges, and every control a line tells the reader to
 *     use is in the widget's code (the N and step sliders, the phase sliders of the phasor mode, "drag w" of the multiply mode);
 *  2. every readout a line quotes is what the widget really renders at the start (rendered to markup, text compared), and
 *  3. every number a line promises AFTER the reader acts (a step moved, a phase set) is recomputed here through the engine functions the widget calls (rootsUse, rootsState,
 *     phasorSum) or by plain arithmetic, and tied to the chapter's own values.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { abs, arg, c, mul } from '../../physics/complex'
import { phasorSum } from '../../physics/qc/complexExtra'
import { comb, dft } from '../../physics/qc/fourier'
import { gcd } from '../../physics/qc/numtheory'
import { ComplexPlane } from '../../widgets/ComplexPlane'
import complexPlaneSrc from '../../widgets/ComplexPlane.tsx?raw'
import ComplexPlaneQc, { ROOTS_RANGE, rootsCorners, rootsUse } from '../../widgets/ComplexPlaneQc'
import complexPlaneQcSrc from '../../widgets/ComplexPlaneQc.tsx?raw'
import { complexReadouts, resolveComplexPlane } from '../../stage/svg/complexPlane'
import type { Unit } from '../schema'
import { F8 } from './F8'
import { V } from './F8.values'

const unit = (id: string): Unit => F8.units.find((u) => u.id === id)!
const tries = (id: string): string => unit(id).visual.tryThis.join(' ')
const props = (id: string) => unit(id).visual.props as Record<string, unknown>
const clean = (html: string): string => html.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/<!--.*?-->/g, '')
const text = (html: string): string => clean(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
/** The accessible description of the widget's drawing: its readout lines. */
const aria = (html: string): string => /<svg[^>]*aria-label="([^"]*)"/.exec(clean(html))?.[1] ?? ''
const declared = (src: string, iface: string): string[] => {
  const body = new RegExp(`export interface ${iface}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(src)?.[1] ?? ''
  return [...body.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1])
}
const roots = (id: string) => renderToString(<ComplexPlaneQc mode="roots" {...(props(id) as { N: number; j: number })} />)

describe('F8 Try-its: every prop reaches the widget', () => {
  it('every spec is a complex-plane spec in a mode the widget has, and passes only props that mode reads', () => {
    const qc = declared(complexPlaneQcSrc, 'ComplexPlaneQcProps')
    const all = declared(complexPlaneSrc, 'ComplexPlaneProps')
    expect(qc).toEqual(['mode', 'phi', 'n', 'phases', 'N', 'j'])
    const allowed: Record<string, string[]> = { roots: ['mode', 'N', 'j'], phasor: ['mode', 'phases'], multiply: ['mode', 'z', 'w'] }
    for (const u of F8.units) {
      expect(u.visual.kind, u.id).toBe('complex-plane')
      const p = u.visual.props as Record<string, unknown>
      expect(Object.keys(allowed), u.id).toContain(p.mode)
      expect(Object.keys(p).filter((k) => !allowed[p.mode as string].includes(k) || !all.includes(k)), u.id).toEqual([])
    }
  })
  it('the roots values lie in the sliders’ ranges (N from 2 to 12, the step from 0 to 12) and the controls the lines name are in the code', () => {
    expect(ROOTS_RANGE).toEqual({ nMin: 2, nMax: 12, jMin: 0, jMax: 12 })
    for (const id of ['f8-clock', 'f8-euclid', 'f8-roots', 'f8-dft']) {
      const p = props(id) as { N: number; j: number }
      expect(p.N).toBeGreaterThanOrEqual(ROOTS_RANGE.nMin)
      expect(p.N).toBeLessThanOrEqual(ROOTS_RANGE.nMax)
      expect(p.j).toBeGreaterThanOrEqual(ROOTS_RANGE.jMin)
      expect(p.j).toBeLessThanOrEqual(ROOTS_RANGE.jMax)
    }
    expect(complexPlaneQcSrc).toContain('label="N (equal turns)"')
    expect(complexPlaneQcSrc).toContain('label="step (corners per arrow)"')
    expect(complexPlaneQcSrc).toContain('min={ROOTS_RANGE.jMin} max={ROOTS_RANGE.jMax} step={1}')
    expect(complexPlaneQcSrc).toContain('`phase of arrow ${k + 1}`')
    expect(complexPlaneQcSrc).toContain('min={0} max={360} step={5}')
    // the multiply mode: a "drag w" switch and a plane that takes a press at a point
    expect(complexPlaneSrc).toContain("{ value: 'w', label: 'drag w' }")
    expect(complexPlaneSrc).toContain('const snapTo = (v: number) => Math.round(v * 20) / 20')
  })
})

describe('F8 Try-it: the clock unit (twelve arrows, step 4, then step 5)', () => {
  it('starts with the line “corners used: 3 of 12, each 4 times”, and the picture is the stage kind’s own', () => {
    const html = roots('f8-clock')
    expect(text(html)).toContain('corners used: 3 of 12, each 4 times')
    expect(html).toContain('data-kind="complex-plane"')
    expect(props('f8-clock')).toEqual({ mode: 'roots', N: 12, j: 4 })
  })
  it('each arrow turns 4 of 12 corners, 120°; step 5 uses all twelve corners, each once', () => {
    expect(rootsCorners(12, 4)).toEqual([0, 4, 8, 0, 4, 8, 0, 4, 8, 0, 4, 8])
    expect((360 * 4) / 12).toBe(120)
    expect(rootsUse(12, 4)).toEqual({ corners: 3, each: 4 })
    expect(rootsUse(12, 5)).toEqual({ corners: 12, each: 1 })
    expect(text(renderToString(<ComplexPlaneQc mode="roots" N={12} j={5} />))).toContain('corners used: 12 of 12, each 1 time')
  })
  it('the lines say exactly that', () => {
    const t = tries('f8-clock')
    for (const s of ['4 corners of 12', '120°', 'three corners', '“corners used: 3 of 12, each 4 times”', 'Set the step to 5', 'all twelve corners', '“corners used: 12 of 12, each 1 time”']) expect(t, s).toContain(s)
  })
})

describe('F8 Try-it: the euclid unit (step 5, then 8, then 7 on twelve corners)', () => {
  it('step 5 uses all twelve and 5 × 5 ≡ 1 (mod 12); step 8 uses three corners four times and gcd(8, 12) = 4; step 7 uses all twelve and 7 × 7 ≡ 1', () => {
    expect(text(roots('f8-euclid'))).toContain('corners used: 12 of 12, each 1 time')
    expect((5 * 5) % 12).toBe(1)
    expect(rootsUse(12, 8)).toEqual({ corners: 3, each: 4 })
    expect(gcd(8, 12)).toBe(4)
    expect([...Array(12).keys()].filter((b) => (8 * b) % 12 === 1)).toEqual([])
    expect(rootsUse(12, 7)).toEqual({ corners: 12, each: 1 })
    expect((7 * 7) % 12).toBe(1)
    expect(text(renderToString(<ComplexPlaneQc mode="roots" N={12} j={8} />))).toContain('corners used: 3 of 12, each 4 times')
  })
  it('a step reaches every corner exactly when it has an inverse mod 12, for every step the slider allows', () => {
    for (let j = 1; j <= 12; j++) {
      const inverse = [...Array(12).keys()].some((b) => (j * b) % 12 === 1)
      expect(rootsUse(12, j).corners === 12, `j = ${j}`).toBe(inverse)
    }
  })
  it('the lines say exactly that', () => {
    const t = tries('f8-euclid')
    for (const s of ['“corners used: 12 of 12, each 1 time”', '$5 \\times 5 = 25 \\equiv 1$', 'Set the step to 8', 'only three corners', '$\\gcd(8, 12) = 4$', 'Set the step to 7', '$7 \\times 7 = 49 \\equiv 1$']) expect(t, s).toContain(s)
  })
})

describe('F8 Try-it: the roots unit (eight arrows, step 3, then 8, then 4)', () => {
  it('starts closed: the readouts say “sum = 0” and “size 0”, and the picture is labelled “sum = 0”', () => {
    const html = roots('f8-roots')
    expect(aria(html)).toContain('sum = 0')
    expect(aria(html)).toContain('size 0;')
    expect(html).toContain('>sum = 0<')
    const lines = complexReadouts(resolveComplexPlane({ kind: 'complex-plane', chain: { phasesDeg: Array.from({ length: 8 }, (_, k) => (360 * ((3 * k) % 8)) / 8) } }, 1)).map((x) => x.text)
    expect(lines).toEqual(['sum = 0', 'size 0', 'size² 0'])
  })
  it('step 8 reads “sum = 8” and “size 8”; step 4 reads “sum = 0” again (8 does not divide 4) and uses two corners', () => {
    const full = renderToString(<ComplexPlaneQc mode="roots" N={8} j={8} />)
    expect(aria(full)).toContain('sum = 8')
    expect(aria(full)).toContain('size 8;')
    const four = renderToString(<ComplexPlaneQc mode="roots" N={8} j={4} />)
    expect(aria(four)).toContain('sum = 0')
    expect(text(four)).toContain('corners used: 2 of 8, each 4 times')
    expect(4 % 8).not.toBe(0) // 8 does not divide the step 4
    // the sums are the chapter's values
    expect(V.f8PowSum8j3).toBeCloseTo(0, 12)
    expect(V.f8PowSum8j8).toBeCloseTo(8, 12)
  })
  it('the lines say exactly that', () => {
    const t = tries('f8-roots')
    for (const s of ['3 corners of 8', '135°', 'sum = 0', '“size 0”', 'Set the step to 8', '“sum = 8”', '“size 8”', 'Set the step to 4', 'only two corners', '8 does not divide 4']) expect(t, s).toContain(s)
  })
})

describe('F8 Try-it: the dft unit (eight arrows, step 0 is entry 0 of the flat list)', () => {
  it('step 0 reads “sum = 8”: entry 0 of the flat list of eight values 1/√8 is 8/8 = 1; steps 1 … 7 read “sum = 0”: the other entries are 0', () => {
    expect(aria(roots('f8-dft'))).toContain('sum = 8')
    // the flat list: eight equal values 1/√8 (the comb of step 1); the engine's transform has 1 at place 0 and 0 elsewhere
    const out = dft(comb(8, 1))
    for (let k = 0; k < 8; k++) {
      // the length of the sum the widget draws for step k, divided by 8, is the engine's entry ĉ_k
      const drawn = abs(phasorSum(Array.from({ length: 8 }, (_, j) => (2 * Math.PI * ((j * k) % 8)) / 8)))
      expect(drawn / 8, `step ${k}`).toBeCloseTo(abs(out[k]), 12)
      expect(abs(out[k]), `entry ${k}`).toBeCloseTo(k === 0 ? 1 : 0, 12)
    }
    expect(text(renderToString(<ComplexPlaneQc mode="roots" N={8} j={5} />))).toContain('corners used: 8 of 8, each 1 time')
    expect(aria(renderToString(<ComplexPlaneQc mode="roots" N={8} j={5} />))).toContain('sum = 0')
  })
  it('the lines say exactly that', () => {
    const t = tries('f8-dft')
    for (const s of ['step 0', '“sum = 8”', '$\\hat c_0 = 8/8 = 1$', '1, 2, …, 7', '“sum = 0”', '$\\hat c_k = 0$ for $k = 1, \\ldots, 7$']) expect(t, s).toContain(s)
  })
})

describe('F8 Try-it: the geometric unit (the phasor mode: three arrows 20° apart)', () => {
  it('starts at 0°, 20°, 40°: size 2.879; 0°, 60°, 120° gives size 2; 0°, 120°, 240° closes, size 0', () => {
    const html = renderToString(<ComplexPlane {...(props('f8-geometric') as object)} />)
    expect(props('f8-geometric')).toEqual({ mode: 'phasor', phases: [0, 20, 40] })
    const sizes = (deg: number[]) => abs(phasorSum(deg.map((d) => (d * Math.PI) / 180)))
    expect(sizes([0, 20, 40])).toBeCloseTo(2.879, 3)
    expect(sizes([0, 60, 120])).toBeCloseTo(2, 12)
    expect(sizes([0, 120, 240])).toBeCloseTo(0, 12)
    const qc = renderToString(<ComplexPlaneQc mode="phasor" phases={[0, 20, 40]} />)
    expect(aria(qc)).toContain('size 2.879;')
    expect(aria(renderToString(<ComplexPlaneQc mode="phasor" phases={[0, 60, 120]} />))).toContain('size 2;')
    expect(aria(renderToString(<ComplexPlaneQc mode="phasor" phases={[0, 120, 240]} />))).toContain('size 0;')
    expect(text(html)).toContain('Loading')
    // the three sliders step by 5° and run 0° to 360°, so 20°, 40°, 60°, 120° and 240° are reachable; and the size shrinks as the neighbours turn further apart
    expect(sizes([0, 20, 40])).toBeGreaterThan(sizes([0, 60, 120]))
    expect(sizes([0, 60, 120])).toBeGreaterThan(sizes([0, 120, 240]))
  })
  it('the lines say exactly that', () => {
    const t = tries('f8-geometric')
    for (const s of ['“size 2.879”', 'out of a straight 3', '0°, 60° and 120°', 'the size is 2', '0°, 120° and 240°', '“size 0”']) expect(t, s).toContain(s)
  })
})

describe('F8 Try-it: the fractions unit (the multiply mode: z = w at −135°)', () => {
  const html = renderToString(<ComplexPlane {...(props('f8-fractions') as object)} />)
  it('the z and w rows read φ=-135°, the zw row reads φ=90°', () => {
    expect(text(html)).toContain('φ=-135°')
    expect(text(html)).toContain('φ=90°')
    expect(text(html)).toMatch(/zw .*φ=90°/)
    const z = c(-0.7071, -0.7071)
    expect((arg(z) * 180) / Math.PI).toBeCloseTo(-135, 2)
    expect((arg(mul(z, z)) * 180) / Math.PI).toBeCloseTo(90, 2)
    // −135° is 225°, the turn 0.101 in binary, and doubling it gives 90°: the chapter's own values
    expect(V.f8Angle101).toBeCloseTo(225, 9)
    expect(V.f8Angle101x2).toBeCloseTo(90, 9)
  })
  it('a w at −i (−90°) makes the zw row read φ=135°, since the angles add', () => {
    const z = c(-0.7071, -0.7071)
    const w = c(0, -1)
    expect((arg(w) * 180) / Math.PI).toBeCloseTo(-90, 12)
    expect((arg(mul(z, w)) * 180) / Math.PI).toBeCloseTo(135, 2)
    expect(-135 - 90).toBe(-225)
    expect(((-225 % 360) + 360) % 360).toBe(135)
  })
  it('the lines say exactly that', () => {
    const t = tries('f8-fractions')
    for (const s of ['both rows read φ=-135°', '225°', '$0{.}101_2$', 'φ=90°', '$1{.}01_2$', '“drag w”', '$-i$', 'φ=-90°', 'φ=135°', '−135° − 90° = −225°']) expect(t, s).toContain(s)
  })
})
