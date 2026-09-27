/**
 * Engine helpers for Lectures 4–7 against independent numpy routes (pipeline/make_fixtures.py "lectures4to7"):
 * np.poly, np.linalg.inv, matrix_power, eigen-decomposition exponentials, the SU(2) route for rotations
 * (rotate the state, then read its Bloch vector), vdot phases and path products.
 */
import { describe, expect, it } from 'vitest'
import fx from './__fixtures__/numpy.json'
import { type C, approxEq, c } from './complex'
import {
  type Mat, type Vec, anticommutator, apply, charPoly2, commutator, diag2, identity, inv2, isDiagonal, matEq, matmul, maxDiff, mpow, mscale,
} from './linalg'
import { expm2, expmSeries, generatorOf } from './operators'
import { axisVector, sequenceOutcomes } from './sg'
import {
  KET, SX, SY, SZ, Rz, basisChange, blochAngle, blochVector, cross, eigenvectorFor, jointProb, phaseShift, projector, rayAngle, relativeSign,
  rotateBloch, rotation, samePhysicalState, spread, spreadsFromBloch, uncertaintyCheck, type Vec3,
} from './spin'

const D = fx.lectures4to7
const M = (x: unknown) => x as Mat
const V = (x: unknown) => x as Vec
const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const matClose = (A: Mat, B: Mat, eps = 1e-9) => expect(maxDiff(A, B), 'max entry gap').toBeLessThan(eps)

describe('Lectures 4–5: characteristic polynomial, inverse, eigenvectors by back-substitution, basis changes', () => {
  it('charPoly2 = numpy.poly: [1, −tr M, det M]', () => {
    for (const p of D.polys) charPoly2(M(p.M)).forEach((z, i) => expect(approxEq(z, p.poly[i] as C, 1e-9), `coef ${i}`).toBe(true))
    // Lecture 4: S_x gives λ² − ¼
    expect(approxEq(charPoly2(SX)[2], c(-0.25))).toBe(true)
  })
  it('inv2 = numpy.linalg.inv; a singular matrix gives null; M·M⁻¹ = I', () => {
    for (const k of D.invs) {
      matClose(inv2(M(k.M))!, M(k.inv))
      matClose(matmul(M(k.M), inv2(M(k.M))!), identity(2))
    }
    expect(inv2([[c(1), c(2)], [c(2), c(4)]])).toBeNull()
  })
  it('eigenvectorFor (the lecture’s back-substitution) matches numpy.linalg.eigh up to phase', () => {
    for (const e of D.eigvecs)
      e.values.forEach((lam, k) => {
        const v = eigenvectorFor(M(e.M), lam)
        expect(samePhysicalState(v, V(e.vectors[k])), `λ = ${lam}`).toBe(true)
        // it satisfies the eigen equation itself
        apply(M(e.M), v).forEach((x, i) => expect(approxEq(x, c(lam * v[i].re, lam * v[i].im), 1e-9)).toBe(true))
      })
    // M = λI: every vector works; the helper returns |+z⟩
    expect(eigenvectorFor(mscale(identity(2), 2), 2)).toEqual([c(1), c(0)])
  })
  it('basisChange(from, to) = B_to† B_from for all nine ordered pairs, and B_{b←a} B_{a←b} = I', () => {
    for (const k of D.changes) matClose(basisChange(k.from as 'x', k.to as 'x'), M(k.B))
    for (const a of ['x', 'y', 'z'] as const) for (const b of ['x', 'y', 'z'] as const) matClose(matmul(basisChange(a, b), basisChange(b, a)), identity(2))
    // it moves coordinates: |+x⟩ in z-coordinates → (1, 0) in x-coordinates
    const v = apply(basisChange('z', 'x'), KET['+x'])
    expect(approxEq(v[0], c(1)) && approxEq(v[1], c(0))).toBe(true)
  })
  it('diag2 and isDiagonal', () => {
    expect(isDiagonal(diag2(0.5, -0.5))).toBe(true)
    expect(isDiagonal(SX)).toBe(false)
    expect(matEq(diag2(0.5, -0.5), SZ)).toBe(true)
  })
})

describe('Lecture 6: series, compounding and the generator', () => {
  it('expmSeries partial sums = numpy, and the error falls to e^M as K grows', () => {
    const Mphi = mscale(SZ, c(0, -Math.PI / 2))
    for (const k of D.series) {
      matClose(expmSeries(Mphi, k.K), M(k.sum))
      close(maxDiff(expmSeries(Mphi, k.K), expm2(Mphi)), k.err, 1e-9)
    }
    matClose(expm2(Mphi), Rz(Math.PI / 2))
  })
  it('mpow: (I − iφS_z/N)^N approaches R_z(φ) with the numpy gaps', () => {
    for (const k of D.compound) {
      const step = identity(2).map((row, i) => row.map((x, j) => c(x.re, -((Math.PI / 2) / k.N) * SZ[i][j].re)))
      close(maxDiff(mpow(step, k.N), Rz(Math.PI / 2)), k.gap, 1e-9)
    }
    expect(() => mpow(SX, 1.5)).toThrow()
  })
  it('generatorOf recovers S_z from R_z and S_x from rotations about x', () => {
    matClose(generatorOf(Rz), SZ, 1e-8)
    matClose(generatorOf((phi) => rotation([1, 0, 0], phi)), SX, 1e-8)
  })
  it('phaseShift(φ) = e^{iφ/2} R_z(φ): the same turn up to a global phase', () => {
    const phi = 0.8
    matClose(phaseShift(phi), mscale(Rz(phi), c(Math.cos(phi / 2), Math.sin(phi / 2))))
  })
  it('rotateBloch (Rodrigues) = the SU(2) route: rotate the state, then read its Bloch vector', () => {
    for (const k of D.rotations) rotateBloch(k.n as Vec3, k.phi, k.r as Vec3).forEach((x, i) => close(x, k.r_after[i]))
  })
})

describe('Lecture 7: commutators, spreads and the uncertainty bound', () => {
  it('[S_x, S_y] = iS_z (cyclic), {S_x, S_y} = 0, {S_x, S_x} = ½I', () => {
    matClose(commutator(SX, SY), mscale(SZ, c(0, 1)))
    matClose(commutator(SY, SZ), mscale(SX, c(0, 1)))
    matClose(commutator(SZ, SX), mscale(SY, c(0, 1)))
    matClose(anticommutator(SX, SY), [[c(0), c(0)], [c(0), c(0)]])
    matClose(anticommutator(SX, SX), mscale(identity(2), 0.5))
  })
  it('[S_n, S_m] = i(n × m)·S for random axes (numpy cross products)', () => {
    for (const k of D.crosses) {
      cross(k.n as Vec3, k.m as Vec3).forEach((x, i) => close(x, k.cross[i]))
      const Sn = (n: Vec3) => [[c(n[2] / 2), c(n[0] / 2, -n[1] / 2)], [c(n[0] / 2, n[1] / 2), c(-n[2] / 2)]] as Mat
      matClose(commutator(Sn(k.n as Vec3), Sn(k.m as Vec3)), M(k.comm))
      matClose(M(k.comm), M(k.rhs))
    }
  })
  it('spread, spreadsFromBloch and uncertaintyCheck agree with numpy; the bound always holds', () => {
    const pair: Record<string, [Mat, Mat]> = {
      'Sx,Sy': [SX, SY],
      'Sx,S45': [SX, mscale(matAdd(SX, SZ), Math.SQRT1_2)],
      'Sz,S60': [SZ, matAdd(mscale(SX, Math.sin(Math.PI / 3)), mscale(SZ, Math.cos(Math.PI / 3)))],
    }
    for (const k of D.uncert) {
      const psi = V(k.psi)
      ;[SX, SY, SZ].forEach((A, i) => close(spread(A, psi), k.spreads[i]))
      spreadsFromBloch(k.r as Vec3).forEach((x, i) => close(x, k.spreads[i]))
      const u = uncertaintyCheck(...pair[k.pair], psi)
      close(u.product, k.product)
      close(u.bound, k.bound)
      expect(u.slack).toBeGreaterThan(-1e-12)
    }
    // met exactly on |+z⟩ for S_x, S_y: ΔS_x ΔS_y = ¼ = ½|⟨S_z⟩|
    const z = uncertaintyCheck(SX, SY, KET['+z'])
    close(z.product, 0.25)
    expect(z.saturated).toBe(true)
  })
  it('ray angle = half the Bloch angle (numpy arccos |⟨a|b⟩| and arccos r_a·r_b)', () => {
    for (const k of D.angles) {
      close(rayAngle(V(k.a), V(k.b)), k.ray)
      close(blochAngle(V(k.a), V(k.b)), k.bloch)
      close(rayAngle(V(k.a), V(k.b)), blochAngle(V(k.a), V(k.b)) / 2)
    }
    close(rayAngle(KET['+x'], KET['+y']), Math.PI / 4)
  })
  it('relativeSign: R_z(2π) flips the sign, R_z(4π) restores it; different states throw', () => {
    expect(approxEq(relativeSign(KET['+x'], apply(Rz(2 * Math.PI), KET['+x'])), D.signs.full as C)).toBe(true)
    expect(approxEq(relativeSign(KET['+x'], apply(Rz(4 * Math.PI), KET['+x'])), D.signs.double as C)).toBe(true)
    expect(() => relativeSign(KET['+x'], KET['+z'])).toThrow()
  })
  it('jointProb: filters in array order (numpy ‖P₂P₁ψ‖²)', () => {
    const P = (k: string) => projector(KET[(k[1] + k[0]) as keyof typeof KET])
    for (const j of D.joint) close(jointProb(j.path.map(P), KET[(j.psi[1] + j.psi[0]) as keyof typeof KET]), j.p)
  })
  it('sequenceOutcomes: every sign path through unblocked magnets (numpy path products)', () => {
    for (const s of D.sequences) {
      const got = sequenceOutcomes({ source: s.source as 'oven', axes: s.axes as ('x' | 'z' | number)[] })
      expect(Object.keys(got).sort()).toEqual(Object.keys(s.paths).sort())
      for (const [path, p] of Object.entries(s.paths)) close(got[path], p as number)
      close(Object.values(got).reduce((a, b) => a + b, 0), 1)
    }
    expect(axisVector(60)[0]).toBeCloseTo(Math.sin(Math.PI / 3), 12)
  })
  it('Bloch vectors used above come from the engine', () => {
    expect(blochVector(KET['+x'])).toEqual([1, 0, 0].map((x) => expect.closeTo(x, 12)) as never)
  })
})

function matAdd(A: Mat, B: Mat): Mat {
  return A.map((row, i) => row.map((x, j) => c(x.re + B[i][j].re, x.im + B[i][j].im)))
}
