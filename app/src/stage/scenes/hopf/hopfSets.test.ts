import { describe, expect, it } from 'vitest'
import { fiberSpan, hopfMap, inverseStereo, fiberPolyline, blochPoint } from '../../../physics/hopf'
import { hopfReadout, ringFibers, setAlpha, tubeRadius } from './hopfSets'

describe('live Hopf stage sets', () => {
  it('64 fibers on the §3.5 rings (6/10/14/16/18); 128 doubles them', () => {
    const f = ringFibers(64)
    expect(f).toHaveLength(64)
    expect(f.filter((x) => x.thetaDeg === 80)).toHaveLength(14)
    expect(ringFibers(128)).toHaveLength(128)
  })
  it('every ring fiber is a whole circle inside the clamp (none clipped) and lies over its Bloch point', () => {
    for (const x of ringFibers(64)) {
      expect(fiberSpan(x.theta, x.phi, 6).closed).toBe(true)
      const b = blochPoint(x.theta, x.phi)
      for (const p of fiberPolyline(x.theta, x.phi, 6, 24)) hopfMap(inverseStereo(p)).forEach((v, i) => expect(Math.abs(v - b[i])).toBeLessThan(1e-9))
    }
  })
  it('reveals one set per level with a one-level fade', () => {
    expect(setAlpha(3, 2)).toBe(0)
    expect(setAlpha(3, 2.5)).toBe(0.5)
    expect(setAlpha(3, 5)).toBe(1)
  })
  it('keeps tubes thin near the centre and bounded far out', () => {
    expect(tubeRadius(0, 1)).toBeCloseTo(0.006, 6)
    expect(tubeRadius(100, 1)).toBeCloseTo(0.04, 6)
  })
  it('says where the bead is: phase χ with a fixed Bloch point, or what a rotation did (φ → χ − φ/2)', () => {
    expect(hopfReadout({ chi: Math.PI / 2, rotAngle: 0 }, 3)[0]).toBe('χ = 90° · point fixed')
    expect(hopfReadout({ chi: -Math.PI, rotAngle: 2 * Math.PI }, 3)[0]).toBe('Rz(360°): χ −180°')
  })
})
