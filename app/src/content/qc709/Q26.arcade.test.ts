/**
 * Chapter Q26's four Arcade "Spot the error" rounds (P-Q26-story §11.2): each wrong step is recomputed through the engine here (physics/qc/photons.ts), so the
 * correction a round states is the engine's number and the flagged step really is false (the generic checks of games.test.ts cover the shape and the chapter links).
 */
import { describe, expect, it } from 'vitest'
import { abs2 } from '../../physics/complex'
import {
  bsReal,
  catFock,
  catNorm,
  coherentOverlap,
  coherentOverlapSeries,
  czSuccess,
  distinguishable,
  nsAmplitudes,
  nsRatios,
  nsSolve,
  twoPhoton,
} from '../../physics/qc/photons'
import { QC_ERROR_ROUNDS } from './games'
import { Q26 } from './Q26'
import { V } from './Q26.values'

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps)
const round = (id: string) => QC_ERROR_ROUNDS.find((r) => r.id === id)!
const sentences = (s: string) => s.split(/(?<=[.?!])\s+(?=[A-Z$])/)
const words = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length

describe('Q26 Spot the error rounds', () => {
  const IDS = ['qc-hom-add-chances', 'qc-ns-average', 'qc-klm-repeat', 'qc-cat-orthogonal']
  it('there are four, each four steps long, each training a real unit of Q26, the flagged step inside the argument', () => {
    const mine = QC_ERROR_ROUNDS.filter((r) => r.trains.lecture === 'Q26')
    expect(mine.map((r) => r.id)).toEqual(IDS)
    for (const r of mine) {
      expect(r.steps).toHaveLength(4)
      expect(Q26.units.map((u) => u.id)).toContain(r.trains.unit)
      expect(r.wrong).toBeGreaterThanOrEqual(1)
      expect(r.wrong).toBeLessThan(4)
      expect(r.id.startsWith('qc-')).toBe(true)
    }
  })
  it('every sentence of a round is at most 25 words', () => {
    for (const r of QC_ERROR_ROUNDS.filter((x) => x.trains.lecture === 'Q26'))
      for (const s of [...r.steps, r.why].flatMap(sentences)) expect(words(s), `${r.id}: ${s}`).toBeLessThanOrEqual(25)
  })
  it('qc-hom-add-chances: distinguishable photons leave one by each exit with chance 1/2, identical photons at 50:50 with chance 0, and bunch 1/2 each', () => {
    const S = bsReal(0.5)
    close(distinguishable(S), 0.5, 1e-12)
    const h = twoPhoton(S)
    expect(abs2(h.a11)).toBeLessThan(1e-12)
    close(abs2(h.a20), 0.5)
    close(abs2(h.a02), 0.5)
    close(abs2(twoPhoton(bsReal(0.25)).a11), 0.25)
    expect(V.q26HomP11R50).toBeLessThan(1e-12)
    expect(round('qc-hom-add-chances').why).toContain('the chance is $0$')
  })
  it('qc-ns-average: after the gate the amplitudes for 0, 1, 2 photons are 1, 1, -1 times A0, so the chance A0^2 = (3 - √2)/7 = 0.2265 is the same for every input of at most two photons', () => {
    const ns = nsSolve()
    close(ns.success, (3 - Math.SQRT2) / 7, 1e-9)
    close(ns.success, 0.2265409, 1e-6)
    const A = nsAmplitudes(ns.thetaDeg, ns.phiDeg, 3)
    const ratios = nsRatios(ns.thetaDeg, ns.phiDeg, 3)
    close(ratios[0], 1)
    close(ratios[1], 1, 1e-9)
    close(ratios[2], -1, 1e-9)
    close(Math.abs(A[1]), Math.abs(A[0]), 1e-9)
    close(Math.abs(A[2]), Math.abs(A[0]), 1e-9)
    // a mixture c0|0> + c1|1> + c2|2>: the chance is A0^2 (|c0|^2 + |c1|^2 + |c2|^2) = A0^2, whatever the c's
    for (const c of [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0.6, 0.64, 0.48]]) close(c.reduce((s, ck, k) => s + ck * ck * A[k] * A[k], 0), A[0] * A[0], 1e-9)
    expect(Math.abs(ratios[3])).toBeLessThan(0.7) // three photons are not corrected
    close(V.q26NsSuccess, ns.success)
    expect(round('qc-ns-average').steps[1]).toContain('0.2265')
  })
  it('qc-klm-repeat: two NS gates give 0.0513 per CZ, three CZ gates in one run 1.35e-4, one run in 7398', () => {
    const p = czSuccess()
    close(p, 0.05132079, 1e-7)
    close(p ** 3, 0.0001351699, 1e-9)
    expect(Math.round(1 / p ** 3)).toBe(7398)
    expect(p ** 3).toBeLessThan(0.001)
    close(V.q26Cz3Chain, p ** 3)
    expect(round('qc-klm-repeat').why).toContain('$7400$')
  })
  it('qc-cat-orthogonal: |<-α|α>|^2 = e^{-4α²}, 0.0183 at α = 1 and 1.1e-7 at α = 2, never 0; the even and odd cat states are exactly orthogonal', () => {
    close(coherentOverlap(1, -1), Math.exp(-4), 1e-12)
    close(coherentOverlap(1, -1), 0.01831564, 1e-7)
    close(coherentOverlap(2, -2), 1.125352e-7, 1e-12)
    expect(coherentOverlap(3, -3)).toBeGreaterThan(0)
    close(coherentOverlapSeries(1, -1), coherentOverlap(1, -1), 1e-9)
    const even = catFock(2, 1, 60)
    const odd = catFock(2, -1, 60)
    close(even.reduce((s, a, n) => s + a * odd[n], 0), 0, 1e-12)
    close(even.filter((_, n) => n % 2 === 1).reduce((s, a) => s + a * a, 0), 0, 1e-12)
    close(catNorm(2, 1), 0.7069882, 1e-6)
    close(V.q26Overlap1, Math.exp(-4), 1e-12)
    expect(round('qc-cat-orthogonal').why).toContain('$0.0183$')
  })
})
