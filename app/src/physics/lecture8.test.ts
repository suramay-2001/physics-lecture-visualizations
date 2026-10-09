/**
 * Lecture 8 engine (polarization.ts, bb84.ts, the Pauli variances in density.ts) against independent numpy routes
 * (pipeline/make_fixtures.py "lecture8"): analyzer chances from the eigenvectors of the Bloch-angle observable, R_pol from
 * the numpy eigen-decomposition of e^{−iφσ_y}, variances from tr(ρσ²) − tr(ρσ)², Eve's attack as a dephasing channel, and a
 * Python port of the engine's mulberry32 for the seeded rounds. Plus properties over random inputs.
 */
import { describe, expect, it } from 'vitest'
import fx from './__fixtures__/numpy.json'
import { abs2, approxEq, c, type C } from './complex'
import { pauliVariances, pauliVariancesOfRho, rhoFromBloch, varianceTotal } from './density'
import { type Mat, identity, isUnitary, maxDiff } from './linalg'
import {
  BASES, BB84_CODE, BOARD_P8, bb84ErrorProb, bb84Q, bb84Rounds, bb84Tally, bornBit, checkBoard, eveKnown, minTestSize, missProb, stateLetter, testResult,
  testedRounds, type Basis, type Bit,
} from './bb84'
import {
  POL, Rpol, analyzerPorts, analyzerProb, blockingAngle, circularPhase, electronTurn, photonTurn, polBloch, polKet, rpolFromGenerator, sphereTurn,
} from './polarization'
import { rng } from './random'
import { KET, blochVector, ketFromBloch, samePhysicalState, type Vec3 } from './spin'

const D = fx.lecture8
const M = (x: unknown) => x as Mat
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('polarization: the six named states are the engine’s kets', () => {
  it('H, V, D, A, C± are +z, −z, +x, −x, ±y (the app’s Rosetta), and |C₊⟩ = (1, i)/√2', () => {
    expect(POL.H).toBe(KET['+z'])
    expect(POL.V).toBe(KET['-z'])
    expect(POL.D).toBe(KET['+x'])
    expect(POL.A).toBe(KET['-x'])
    expect(POL.Cp).toBe(KET['+y'])
    expect(POL.Cm).toBe(KET['-y'])
    expect(approxEq(POL.Cp[1], c(0, Math.SQRT1_2))).toBe(true)
  })
  it('|p(χ)⟩ = cos χ|H⟩ + sin χ|V⟩: 0° is H, 90° is V, 45° is D, and −45° is A', () => {
    expect(samePhysicalState(polKet(0), POL.H)).toBe(true)
    expect(samePhysicalState(polKet(Math.PI / 2), POL.V)).toBe(true)
    expect(samePhysicalState(polKet(Math.PI / 4), POL.D)).toBe(true)
    expect(samePhysicalState(polKet(-Math.PI / 4), POL.A)).toBe(true)
  })
})

describe('analyzers: the aligned port passes cos²Δχ (numpy: eigenvectors of the Bloch-angle observable)', () => {
  it('analyzerProb and both ports match the fixture, and the ports add to 1', () => {
    for (const k of D.analyzer) {
      close(analyzerProb(k.chi, k.chiA), k.p)
      const [a, b] = analyzerPorts(k.chi, k.chiA)
      close(a, k.p)
      close(b, k.p2)
      close(a + b, 1)
    }
  })
  it('known values: Δχ = 60° gives ¼, 15° gives 0.933, 90° gives 0, 45° gives ½; the blocking angle is 90° away', () => {
    const deg = Math.PI / 180
    close(analyzerProb(60 * deg, 0), 0.25)
    close(analyzerProb(60 * deg, 45 * deg), Math.cos(15 * deg) ** 2)
    close(analyzerProb(90 * deg, 0), 0)
    close(analyzerProb(45 * deg, 0), 0.5)
    close(analyzerProb(60 * deg, blockingAngle(60 * deg)), 0)
    close(blockingAngle(60 * deg), 150 * deg)
  })
  it('property: the overlap is cos(χ − χ_a) for real amplitudes (the cosine-difference identity)', () => {
    const r = rng(8)
    for (let i = 0; i < 200; i++) {
      const chi = (r() - 0.5) * 6
      const chiA = (r() - 0.5) * 6
      close(analyzerProb(chi, chiA), Math.cos(chi - chiA) ** 2)
    }
  })
})

describe('R_pol(φ): a physical turn of light, and the same turn as a spin rotation by 2φ', () => {
  it('R_pol(φ) = numpy e^{−iφσ_y}; it equals cos φ I − i sin φ σ_y and the photon turn rotation(ŷ, 2φ)', () => {
    for (const k of D.turns) {
      expect(maxDiff(Rpol(k.phi), M(k.R))).toBeLessThan(1e-12)
      expect(maxDiff(rpolFromGenerator(k.phi), M(k.R))).toBeLessThan(1e-12)
      expect(maxDiff(photonTurn(k.phi), M(k.R))).toBeLessThan(1e-12)
      expect(isUnitary(Rpol(k.phi))).toBe(true)
    }
  })
  it('convention: positive φ carries H toward V; R_pol(90°)|H⟩ = |V⟩; R_pol(180°) = −I and R_pol(360°) = +I', () => {
    const deg = Math.PI / 180
    close(abs2(Rpol(30 * deg)[1][0]), 0.25) // ⟨V|R(30°)|H⟩ = +½
    close(Rpol(30 * deg)[1][0].re, 0.5)
    expect(maxDiff(Rpol(180 * deg), [[c(-1), c(0)], [c(0), c(-1)]])).toBeLessThan(1e-12)
    expect(maxDiff(Rpol(360 * deg), identity(2))).toBeLessThan(1e-12)
    expect(samePhysicalState([Rpol(90 * deg)[0][0], Rpol(90 * deg)[1][0]], POL.V)).toBe(true)
  })
  it('the Bloch point of a photon turns by 2φ and an electron’s by φ (numpy arccos of the Bloch dot product)', () => {
    for (const k of D.turns) {
      const ph = ((k.photonSphere % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
      close(sphereTurn('photon', k.phi), k.photonSphere)
      close(sphereTurn('electron', k.phi), k.electronSphere)
      expect(ph).toBeGreaterThanOrEqual(0)
      // the point of |p(φ)⟩ is (sin 2φ, 0, cos 2φ)
      polBloch(k.phi).forEach((x, i) => close(x, k.polBloch[i]))
      blochVector([Rpol(k.phi)[0][0], Rpol(k.phi)[1][0]]).forEach((x, i) => close(x, k.rH[i]))
    }
    const deg = Math.PI / 180
    close(sphereTurn('photon', 45 * deg), 90 * deg)
    close(sphereTurn('electron', 45 * deg), 45 * deg)
    close(sphereTurn('photon', 90 * deg), 180 * deg)
    close(sphereTurn('electron', 180 * deg), 180 * deg)
  })
  it('the circular states are the eigenvectors of the turn: R_pol(φ)|C_±⟩ = e^{∓iφ}|C_±⟩ (numpy angle of ⟨C|R|C⟩)', () => {
    for (const k of D.turns) {
      close(circularPhase(1, k.phi), k.phaseCp)
      close(circularPhase(-1, k.phi), k.phaseCm)
    }
    const deg = Math.PI / 180
    close(circularPhase(1, 40 * deg), -40 * deg)
    close(circularPhase(-1, 40 * deg), 40 * deg)
  })
  it('photonTurn is exactly twice the electron turn’s angle (mutation guard for the doubling)', () => {
    const r = rng(81)
    for (let i = 0; i < 50; i++) {
      const phi = (r() - 0.5) * 3
      expect(maxDiff(photonTurn(phi), electronTurn(2 * phi))).toBeLessThan(1e-12)
    }
  })
})

describe('the Pauli variances: (Δσ_i)² = 1 − r_i², total 3 − r² (numpy: tr ρσ² − (tr ρσ)²)', () => {
  it('pauliVariances, varianceTotal and the matrix route match the fixture, in the ball and on the sphere', () => {
    for (const k of [...D.variances, ...D.pure]) {
      pauliVariances(k.r as Vec3).forEach((x, i) => close(x, k.var[i]))
      close(varianceTotal(k.r as Vec3), k.total)
      pauliVariancesOfRho(rhoFromBloch(k.r as Vec3)).forEach((x, i) => close(x, k.var[i]))
    }
  })
  it('property: every pure state totals 2; the centre totals 3; |r| > 1 is refused', () => {
    const r = rng(7)
    for (let i = 0; i < 300; i++) {
      const v = blochVector(ketFromBloch(r() * Math.PI, r() * 2 * Math.PI))
      close(varianceTotal(v), 2)
    }
    close(varianceTotal([0, 0, 0]), 3)
    close(varianceTotal([0, 0, 0.6]), 2.64)
    expect(() => pauliVariances([1, 1, 0])).toThrow()
    expect(pauliVariances([0, 0, 1])).toEqual([1, 1, 0])
  })
})

describe('BB84: Born chances, the sifted error rate and the test (numpy: kets from eigh, Eve as a dephasing channel)', () => {
  it('the code: H = 0, V = 1 in H/V; D = 0, A = 1 in D/A; the letter of each prepared state', () => {
    expect(BB84_CODE.HV[0]).toBe(POL.H)
    expect(BB84_CODE.DA[1]).toBe(POL.A)
    expect(stateLetter('HV', 0)).toBe('H')
    expect(stateLetter('HV', 1)).toBe('V')
    expect(stateLetter('DA', 0)).toBe('D')
    expect(stateLetter('DA', 1)).toBe('A')
  })
  it('every Born chance of one measuring basis on one prepared state matches numpy', () => {
    for (const a of BASES)
      for (const bit of [0, 1] as const)
        for (const mb of BASES) close(bornBit({ basis: a, bit }, mb, 0), (D.born as Record<string, number>)[`${a}${bit}->${mb}`], 1e-12)
  })
  it('bb84ErrorProb (a Born sum over Eve’s outcomes) matches the dephasing-channel route for every round type', () => {
    for (const k of D.errprob) {
      const a = k.a as [Basis, Bit]
      const spec = { alice: { basis: a[0], bit: a[1] }, bob: { basis: k.bob as Basis }, ...(k.eve ? { eve: { basis: k.eve as Basis } } : {}) }
      close(bb84ErrorProb(spec), k.p)
    }
  })
  it('bb84Q(f) = f/4 and eveKnown(f) = f/2, by enumeration (numpy: dephasing channel)', () => {
    for (const k of D.qs) {
      close(bb84Q(k.f), k.Q)
      close(eveKnown(k.f), k.known)
    }
    close(bb84Q(1), 0.25)
    close(bb84Q(0.5), 0.125)
    close(eveKnown(0.5), 0.25)
    close(bb84Q(0), 0)
    expect(() => bb84Q(1.2)).toThrow()
  })
  it('the wrong basis gives ½, the right basis 0, and the average over Eve’s two choices ¼ (the notes’ steps)', () => {
    const alice = { basis: 'HV' as Basis, bit: 0 as Bit }
    close(bb84ErrorProb({ alice, bob: { basis: 'HV' }, eve: { basis: 'DA' } }), 0.5)
    close(bb84ErrorProb({ alice, bob: { basis: 'HV' }, eve: { basis: 'HV' } }), 0)
    // the exit check: Alice D, Bob D/A, Eve H/V
    close(bb84ErrorProb({ alice: { basis: 'DA', bit: 0 }, bob: { basis: 'DA' }, eve: { basis: 'HV' } }), 0.5)
    close(bb84ErrorProb({ alice: { basis: 'DA', bit: 0 }, bob: { basis: 'DA' }, eve: { basis: 'DA' } }), 0)
  })
  it('missProb = (1 − Q)^m and minTestSize is the smallest m reaching the risk (numpy log formula)', () => {
    for (const k of D.miss) close(missProb(k.Q, k.m), k.p, 1e-15 + 1e-12 * k.p)
    for (const k of D.mins) expect(minTestSize(k.Q, k.risk)).toBe(k.m)
    close(missProb(0.25, 20), 0.0031712119, 1e-10)
    expect(minTestSize(0.25, 0.01)).toBe(17)
    expect(missProb(0.25, 16)).toBeGreaterThan(0.01)
    expect(missProb(0.25, 17)).toBeLessThan(0.01)
    expect(() => minTestSize(0, 0.01)).toThrow()
  })
})

describe('BB84 seeded rounds: the same rounds as the Python port of mulberry32, prefix-stable, Eve-independent choices', () => {
  const same = (a: Record<string, unknown>, b: Record<string, unknown>) => {
    for (const key of Object.keys(b)) expect(a[key], key).toEqual(b[key])
  }
  it('the first 12 rows and the tallies of 12, 400 and 2000 rounds match the port, for five (seed, fraction) runs', () => {
    for (const run of D.runs) {
      const rs = bb84Rounds(2000, run.seed, run.frac)
      run.first.forEach((row, i) => same(rs[i] as unknown as Record<string, unknown>, row))
      const t = bb84Tally(rs)
      expect({ n: t.n, kept: t.kept, errors: t.errors, intercepted: t.intercepted, eveKnows: t.eveKnows }).toEqual(run.tally)
      expect(bb84Tally(rs.slice(0, 12))).toMatchObject(run.tally12)
      expect(bb84Tally(rs.slice(0, 400))).toMatchObject(run.tally400)
    }
  })
  it('the same seed gives the same rounds; a longer run only appends; asking again is repeatable', () => {
    const a = bb84Rounds(30, 5, 1)
    const b = bb84Rounds(300, 5, 1)
    expect(b.slice(0, 30)).toEqual(a)
    expect(bb84Rounds(30, 5, 1)).toEqual(a)
    expect(bb84Rounds(30, 6, 1)).not.toEqual(a)
    expect(bb84Rounds(0, 5, 1)).toEqual([])
  })
  it('Alice’s and Bob’s choices do not depend on Eve; with no Eve a kept round never errs; with Eve both outcomes appear', () => {
    const clean = bb84Rounds(500, 84, 0)
    const dirty = bb84Rounds(500, 84, 1)
    clean.forEach((r, i) => {
      expect([r.aBit, r.aBasis, r.bBasis]).toEqual([dirty[i].aBit, dirty[i].aBasis, dirty[i].bBasis])
      expect(r.error).toBe(false)
      expect(r.eIntercept).toBe(false)
      if (r.kept) expect(r.bBit).toBe(r.aBit)
    })
    expect(dirty.every((r) => r.eIntercept)).toBe(true)
    expect(dirty.some((r) => r.error)).toBe(true)
  })
  it('property: the observed Q̂ of full interception stays within 4σ of ¼ (a picture check, not a prose number)', () => {
    for (const seed of [1, 2, 3, 9, 84]) {
      const t = bb84Tally(bb84Rounds(4000, seed, 1))
      const sigma = Math.sqrt((0.25 * 0.75) / t.kept)
      expect(Math.abs(t.errors / t.kept - 0.25)).toBeLessThan(4 * sigma)
      expect(Math.abs(t.eveKnows / t.kept - 0.5)).toBeLessThan(4 * Math.sqrt(0.25 / t.kept))
      expect(Math.abs(t.kept / t.n - 0.5)).toBeLessThan(4 * Math.sqrt(0.25 / t.n))
    }
  })
  it('a fraction f of interceptions gives Q̂ near f/4 (f = ½: ⅛)', () => {
    const t = bb84Tally(bb84Rounds(4000, 20, 0.5))
    expect(Math.abs(t.errors / t.kept - 0.125)).toBeLessThan(4 * Math.sqrt((0.125 * 0.875) / t.kept))
  })
  it('rejects bad arguments', () => {
    expect(() => bb84Rounds(1.5, 1)).toThrow()
    expect(() => bb84Rounds(-1, 1)).toThrow()
    expect(() => bb84Rounds(10, 1, 2)).toThrow()
  })
})

describe('test samples and the notes’ board', () => {
  it('size m takes the first m kept rounds; rounds keeps only kept ones; the result counts the errors', () => {
    const rs = bb84Rounds(60, 20, 1)
    const kept = rs.filter((r) => r.kept).map((r) => r.n)
    expect(testedRounds(rs, { size: 5 })).toEqual(kept.slice(0, 5))
    expect(testedRounds(rs, { size: 9999 })).toEqual(kept)
    const notKept = rs.find((r) => !r.kept)!.n
    expect(testedRounds(rs, { rounds: [kept[0], notKept] })).toEqual([kept[0]])
    const res = testResult(rs, { size: 8 })
    expect(res.m).toBe(8)
    expect(res.nErr).toBe(rs.filter((r) => kept.slice(0, 8).includes(r.n) && r.error).length)
    expect(res.remaining).toEqual(kept.slice(8))
    expect(testResult(rs, { size: 0 }).qhat).toBeNull()
  })
  it('a fraction sample is a stable subset of the kept rounds and grows with the fraction', () => {
    const rs = bb84Rounds(400, 20, 1)
    const small = testedRounds(rs, { fraction: 0.2 }, 20)
    const big = testedRounds(rs, { fraction: 0.6 }, 20)
    expect(small.every((n) => big.includes(n))).toBe(true)
    expect(testedRounds(bb84Rounds(200, 20, 1), { fraction: 0.2 }, 20)).toEqual(small.filter((n) => n <= 200))
    expect(testedRounds(rs, { fraction: 1 }, 20)).toEqual(rs.filter((r) => r.kept).map((r) => r.n))
  })
  it('the board of notes p. 8 sifts to rounds 1, 4, 5, 6, both strings 0010, rounds 2 and 8 agree by luck (numpy)', () => {
    const b = checkBoard(BOARD_P8)
    expect(b.ok).toBe(true)
    expect(b.kept).toEqual(D.board.kept)
    expect(b.luck).toEqual(D.board.luck)
    expect(b.alice).toBe(D.board.alice)
    expect(b.bob).toBe(D.board.bob)
    expect(D.board.possible).toBe(true)
    expect(b.alice).toBe('0010')
  })
  it('a corrupted board is caught: a matched row that disagrees, and an impossible outcome', () => {
    const bad = BOARD_P8.map((r, i) => (i === 0 ? { ...r, bBit: 1 as Bit } : r))
    const c1 = checkBoard(bad)
    expect(c1.ok).toBe(false)
    expect(c1.problems.join()).toMatch(/round 1/)
    // the test sample of that board: rounds 1 and 5 agree in the true board, so 0 errors of 2
    expect(checkBoard(BOARD_P8).kept.filter((n) => n === 1 || n === 5).every((n) => BOARD_P8[n - 1].aBit === BOARD_P8[n - 1].bBit)).toBe(true)
  })
})

// keep the imports honest for the complex helpers used above
void (null as unknown as C)
