import { describe, expect, it } from 'vitest'
import { basisKets, ketAt } from '../HilbertPlaneScene'

const deg = (d: number) => (d * Math.PI) / 180

// Round 3 #16: standalone plane labels use |±z⟩, |±x⟩, never arrow kets.
describe('hilbert-plane ket labels', () => {
  it('names the six landmark angles in app notation', () => {
    expect([0, 90, 45, 315, 180, 225].map((d) => ketAt(deg(d)))).toEqual([
      '$|{+z}\\rangle$',
      '$|{-z}\\rangle$',
      '$|{+x}\\rangle$',
      '$|{-x}\\rangle$',
      '$-|{+z}\\rangle$',
      '$-|{+x}\\rangle$',
    ])
  })
  it('never emits an arrow ket', () => {
    for (let d = 0; d < 360; d += 0.25) {
      const k = ketAt(deg(d))
      if (k) expect(k).not.toMatch(/uparrow|downarrow|\\to|leftarrow|rightarrow|[↑↓→←]/)
    }
  })
  it('leaves other angles unlabelled', () => {
    expect(ketAt(deg(30))).toBeNull()
  })
})

// Round 3 #17: bars and readouts name their basis; α/β (z-basis coefficients) are never used for x-basis bars.
describe('measurement-frame names', () => {
  it('z frame, x frame, and any other frame', () => {
    expect(basisKets(0)).toEqual(['+z', '−z'])
    expect(basisKets(Math.PI)).toEqual(['+z', '−z'])
    expect(basisKets(deg(45))).toEqual(['+x', '−x'])
    expect(basisKets(deg(30))).toEqual(['e₁', 'e₂'])
  })
})
