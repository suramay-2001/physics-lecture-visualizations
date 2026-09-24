import { describe, expect, it } from 'vitest'
import { c } from '../physics/complex'
import { identity, madd, matmul, mscale, outer } from '../physics/linalg'
import { ketFromBloch, nDotSigma, type Vec3 } from '../physics/spin'
import { purity, rOfBeat, recipeWeights } from './ball'

const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b)).toBeLessThan(eps)

describe('Bloch ball readouts (gate)', () => {
  it('purity (1 + |r|²)/2 equals Tr ρ² computed with the engine, and the ±n̂ recipe reproduces ρ', () => {
    const th = 0.96
    const ph = 0.61
    const n: Vec3 = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)]
    for (const rmag of [1, 0.8, 0.37, 0.1, 0]) {
      const rho = mscale(madd(identity(2), nDotSigma([n[0] * rmag, n[1] * rmag, n[2] * rmag])), 0.5)
      const sq = matmul(rho, rho)
      close(sq[0][0].re + sq[1][1].re, purity(rmag))
      // recipe: w+ |+n><+n| + w- |-n><-n|
      const [wp, wm] = recipeWeights(rmag)
      const up = ketFromBloch(th, ph)
      const dn = ketFromBloch(Math.PI - th, ph + Math.PI)
      const mix = madd(mscale(outer(up, up), c(wp)), mscale(outer(dn, dn), c(wm)))
      for (let i = 0; i < 2; i++)
        for (let j = 0; j < 2; j++) {
          close(mix[i][j].re, rho[i][j].re, 1e-12)
          close(mix[i][j].im, rho[i][j].im, 1e-12)
        }
    }
  })

  it('story: |r| = 1 on beats 0–1, falls monotonically, and is exactly 0 (the oven beam) from beat 3.4 on', () => {
    close(rOfBeat(0), 1)
    close(rOfBeat(1.2), 1)
    close(rOfBeat(3.4), 0)
    close(rOfBeat(5), 0)
    let prev = 1
    for (let u = 0; u <= 5; u += 0.01) {
      expect(rOfBeat(u)).toBeLessThanOrEqual(prev + 1e-15)
      prev = rOfBeat(u)
    }
    close(purity(0), 0.5)
  })
})
