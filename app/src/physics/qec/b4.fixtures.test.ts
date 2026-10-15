/**
 * The magic-state and Pauli-based engine of the background chapter B4 (magic, pbc, inject, postselect, tcount, dense) against its independent numpy routes
 * (pipeline/b4_numpy.py → pipeline/make_b4_fixtures.py → __fixtures__/qec-b4.json): the Clifford orbit from the 2 x 2 unitary group, the 15-qubit code from bit masks and exact fractions,
 * the compiler from dense matrices, injection on dense vectors, a vectorised search over 2 x 2 unitaries, a 2-state linear system, a loop over all flip patterns. Plus properties of the engine alone.
 */
import { describe, expect, it, vi } from 'vitest'
import raw from '../__fixtures__/qec-b4.json?raw'
import { STABILIZER6, T_PLUS, T_TYPE, cliffordGroup1, depolarizedLength, distill15, distill15Rounds, fifteen, htPowers, insideOctahedron, inputsPerOutput, l1, lead35, octahedronEdge, orbit, scale3, syndrome15, threshold } from './magic'
import { PBC_PRESETS, absorb, absorbSweep, allCommute, changedByTurn, compile, compileAt, isToffoli, layersOf, pbcEquivalent, sameRotationSet, turnImages } from './pbc'
import { axes, axesCensus, injectGeneral, injectSweep, teleportSweep, teleportT } from './inject'
import { attempts, attemptsSeries, escapeDiscard, gapTable, meanTime } from './postselect'
import { GENERIC_TARGETS, bestErrors, meanLogSlope, rzTarget, setSizeLaw, sets, tcountLaw } from './tcount'

vi.setConfig({ testTimeout: 120_000 })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FX: any = JSON.parse(raw)
const near = (a: number, b: number, eps = 1e-12): void => expect(Math.abs(a - b)).toBeLessThan(eps)
const relNear = (a: number, b: number, rel = 1e-12): void => expect(Math.abs(a - b) / Math.abs(b)).toBeLessThan(rel)

describe('magic: the Bloch sphere', () => {
  it('24 Clifford rotations, orbits of 6, 12 and 8 points', () => {
    expect(cliffordGroup1()).toHaveLength(FX.magic.cliffordCount)
    expect(orbit([0, 0, 1])).toHaveLength(FX.magic.orbitStab)
    expect(orbit(T_PLUS)).toHaveLength(FX.magic.orbitH)
    expect(orbit(T_TYPE)).toHaveLength(FX.magic.orbitT)
    expect(orbit(STABILIZER6[0])).toHaveLength(6)
  })
  it('the 12 points of the orbit of T|+> are the numpy ones', () => {
    const mine = orbit(T_PLUS).map((p) => p.map((c) => Math.round(c * 1e6) / 1e6))
    const want = (FX.magic.orbitPoints as number[][]).map((p) => p.map((c) => Math.round(c * 1e6) / 1e6))
    const key = (p: number[]): string => p.join(',')
    expect(mine.map(key).sort()).toEqual(want.map(key).sort())
  })
  it('L1 norms and the octahedron edge', () => {
    near(l1(T_PLUS), FX.magic.l1Magic)
    near(l1(T_TYPE), FX.magic.l1TType)
    near(octahedronEdge(), FX.magic.octaEdge)
    for (const v of STABILIZER6) expect(l1(v)).toBe(1)
  })
  it('a shortened arrow along the T|+> axis touches the octahedron at the edge chance, not before', () => {
    expect(insideOctahedron(T_PLUS, octahedronEdge() + 1e-3)).toBe(true)
    expect(insideOctahedron(T_PLUS, octahedronEdge() - 1e-3)).toBe(false)
    near(depolarizedLength(0.15), 0.7)
    near(l1(scale3(T_PLUS, 0.7)), 0.7 * Math.SQRT2)
  })
})

describe('magic: the 15-qubit code and 15-to-1', () => {
  const F = fifteen()
  it('checks, distances and the weight enumerator', () => {
    expect([F.xChecks, F.xWeight, F.zChecks, F.dX, F.dZ, F.accepted]).toEqual([FX.fifteen.xChecks, FX.fifteen.xWeight, FX.fifteen.zChecks, FX.fifteen.dX, FX.fifteen.dZ, FX.fifteen.accepted])
    expect(F.weights).toEqual(FX.fifteen.weights)
    expect(F.HX).toHaveLength(4)
    expect(F.HZ).toHaveLength(10)
  })
  it('the columns of H_X count 1 … 15 in binary', () => {
    F.HX.forEach((row, b) => row.forEach((v, j) => expect(v).toBe(((j + 1) >> b) & 1)))
    expect(F.HX.map((r) => r.map(String).join(''))).toEqual((FX.fifteen.columns as number[][])[0].map((_, b) => (FX.fifteen.columns as number[][]).map((c) => c[b]).join('')))
  })
  it('H_X H_Z^T = 0 and every Z check has even weight', () => {
    for (const x of F.HX) for (const z of F.HZ) expect(x.reduce((a, v, i) => a + v * z[i], 0) % 2).toBe(0)
    for (const z of F.HZ) expect(z.reduce((a, v) => a + v, 0) % 2).toBe(0)
  })
  it('T on all fifteen qubits is a logical T† (|0> keeps its phase, |1> gains −45°)', () => {
    expect(F.phaseDeg.zero).toBe(FX.fifteen.phase0[0])
    expect(F.phaseDeg.one).toBe(FX.fifteen.phase1[0])
  })
  it('the verdict on single patterns: every one or two flips is flagged, weight three can slip through', () => {
    for (let a = 1; a <= 15; a++) {
      expect(syndrome15([a]).accepted).toBe(false)
      for (let b = a + 1; b <= 15; b++) expect(syndrome15([a, b]).accepted).toBe(false)
    }
    expect(syndrome15([1, 2, 3]).accepted).toBe(true)
    expect(syndrome15([1, 2, 3]).corrupts).toBe(true)
    expect(syndrome15([1, 2, 4, 7]).accepted).toBe(true) // 1 ⊕ 2 ⊕ 4 ⊕ 7 = 0 in binary: a Hamming word of even weight, harmless
    expect(syndrome15([1, 2, 4, 7]).corrupts).toBe(false)
  })
  it('acceptance and output error equal the exact-fraction sums', () => {
    for (const [tag, c] of Object.entries(FX.distill as Record<string, { eps: number; accept: number; out: number }>)) {
      if (typeof c !== 'object' || c.eps === undefined) continue
      const d = distill15(c.eps)
      relNear(d.accept, c.accept)
      relNear(d.out, c.out, 1e-11)
      void tag
    }
  })
  it('threshold, second round, inputs per output and the 35 ε³ estimate', () => {
    near(threshold(), FX.distill.threshold, 1e-12)
    relNear(distill15Rounds(1e-3, 2), FX.distill.level2, 1e-9)
    relNear(inputsPerOutput(1e-3), FX.distill.inputsPer1e3)
    relNear(distill15(1e-3).out / lead35(1e-3), FX.distill.lead35at1e3, 1e-9)
    expect(threshold()).toBeLessThan(octahedronEdge())
  })
  it('output error beats input error below the threshold and loses above it', () => {
    expect(distill15(0.05).out).toBeLessThan(0.05)
    expect(distill15(0.2).out).toBeGreaterThan(0.2)
  })
})

describe('magic: HT never returns', () => {
  const ht = htPowers(1000)
  it('angle, turns and the closest approach to the identity', () => {
    near(ht.angleDeg, FX.ht.angleDeg, 1e-9)
    near(ht.turns, FX.ht.turns, 1e-12)
    ;[10, 100, 1000].forEach((n, i) => near(ht.best(n), FX.ht.close[i], 1e-12))
  })
  it('the closest approach never increases and never reaches 0', () => {
    for (let i = 1; i < ht.trace.length; i++) expect(ht.trace[i]).toBeLessThanOrEqual(ht.trace[i - 1])
    expect(ht.trace[ht.trace.length - 1]).toBeGreaterThan(0)
  })
})

describe('pbc: the compiler', () => {
  const tb = compile(PBC_PRESETS['toffoli-textbook'])
  const ph = compile(PBC_PRESETS['toffoli-phase'])
  const key = (x: { pauli: string; sign: number; angle: string }): string => `${x.pauli}/${x.sign}/${x.angle}`
  it('the textbook Toffoli compiles to the numpy rotations (as a set), final Clifford identity, one layer', () => {
    expect(PBC_PRESETS['toffoli-textbook'].gates).toHaveLength(FX.pbc.textbookGates)
    expect(tb.rotations).toHaveLength(FX.pbc.textbookRots)
    expect(tb.rotations.map(key).sort()).toEqual((FX.pbc.textbookAxes as [string, number, string][]).map((a) => a.join('/')).sort())
    expect(tb.pendingIdentity).toBe(FX.pbc.textbookFinalIdentity)
    expect(tb.layers).toBe(FX.pbc.textbookLayers)
    expect(tb.rotations.map(key)).toEqual((FX.pbc.textbookOrder as [string, number, string][]).map((a) => a.join('/')))
  })
  it('the phase form compiles to the same seven rotations; four axes change', () => {
    expect(ph.rotations.map(key)).toEqual((FX.pbc.phaseOrder as [string, number, string][]).map((a) => a.join('/')))
    expect(ph.changed).toBe(FX.pbc.phaseChanged)
    expect(sameRotationSet(tb.rotations, ph.rotations)).toBe(FX.pbc.sameSet === 1)
    expect(ph.pendingIdentity).toBe(true)
  })
  it('both circuits are the Toffoli, and the dense product of the pieces equals each circuit', () => {
    expect(isToffoli(PBC_PRESETS['toffoli-textbook'])).toBe(FX.pbc.textbookIsToffoli)
    expect(isToffoli(PBC_PRESETS['toffoli-phase'])).toBe(FX.pbc.phaseIsToffoli)
    expect(pbcEquivalent(PBC_PRESETS['toffoli-textbook'])).toBe(true)
    expect(pbcEquivalent(PBC_PRESETS['toffoli-phase'])).toBe(true)
    expect(pbcEquivalent(PBC_PRESETS['z-then-x'])).toBe(true)
    expect(pbcEquivalent(PBC_PRESETS.cnot)).toBe(true)
  })
  it('every prefix of both circuits agrees with the dense route', () => {
    for (const name of ['textbook', 'phase'] as const) {
      const prog = PBC_PRESETS[name === 'textbook' ? 'toffoli-textbook' : 'toffoli-phase']
      for (const row of FX.pbc.prefix[name] as { k: number; rots: [string, number, string][]; identity: boolean }[]) {
        const r = compileAt(prog, row.k)
        expect(r.rotations.map(key)).toEqual(row.rots.map((a) => a.join('/')))
        expect(r.pendingIdentity).toBe(row.identity)
      }
    }
  })
  it('the rotations commute (one layer), and a noncommuting pair needs two', () => {
    expect(allCommute(tb.rotations)).toBe(true)
    expect(layersOf([{ pauli: 'ZI' }, { pauli: 'XI' }, { pauli: 'IZ' }])).toEqual([0, 1, 0])
  })
  it('a Clifford turn about Z: X → −Y, Y → X, Z fixed; two of three change; Z(−π/2) then X(−π/4) ends on Y', () => {
    expect(turnImages('Z', 'c+').map((x) => x.image)).toEqual(['−Y', 'X', 'Z'])
    expect(changedByTurn('Z')).toBe(FX.pbc.changedByZturn)
    expect(FX.pbc.zTurn['Xc+']).toBe('-Y')
    const zx = compile(PBC_PRESETS['z-then-x'])
    expect(zx.rotations.map(key)).toEqual((FX.pbc.zThenX as [string, number, string][]).map((a) => a.join('/')))
  })
  it('CNOT is three Clifford turns', () => {
    expect(PBC_PRESETS.cnot.gates).toHaveLength(FX.pbc.cnotRotations)
    expect(compile(PBC_PRESETS.cnot).pendingName).toBe('CNOT')
    expect(FX.pbc.cnotMatches).toBe(true)
  })
  it('a measurement swallows a quarter turn: 240 anticommuting cases, none off by more than 1e-9', () => {
    const sw = absorbSweep()
    expect([sw.cases, sw.bad]).toEqual([FX.absorb.cases, FX.absorb.bad])
    expect(absorb('XX', 'ZI', 0)).toBeLessThan(1e-12)
    expect(absorb('XX', 'ZI', 1)).toBeLessThan(1e-12)
  })
})

describe('inject', () => {
  it('teleporting T: chance one half, the right data, the fix S makes both branches T|ψ>', () => {
    const [b0, b1] = teleportT([0.6, 0, 0.8, 0])
    const want = FX.teleport.real
    near(b0.prob, want[0].prob)
    near(b1.prob, want[1].prob)
    b0.data.forEach((v, i) => near(v, want[0].data.flat()[i]))
    b1.data.forEach((v, i) => near(v, want[1].data.flat()[i]))
    near(b0.fidelity, 1)
    near(b1.fidelity, 1)
  })
  it('200 random states: the fixed branches have fidelity 1 and the readings stay at one half', () => {
    const sw = teleportSweep(200)
    expect(sw.fidelityMin).toBeGreaterThan(1 - 1e-12)
    expect(sw.probSpread).toBeLessThan(1e-12)
    expect(FX.teleport.fidelityMin).toBeGreaterThan(1 - 1e-12)
  })
  it('the general injection leaves P^[t] P(−sπ/4)|ψ> with chance 1/4 each, for 11 Paulis on 1–3 wires', () => {
    const sw = injectSweep(['X', 'Z', 'Y', 'XX', 'ZZ', 'XZ', 'ZX', 'YZ', 'XY', 'ZYX', 'XIZ'])
    expect(sw.dev).toBeLessThan(1e-12)
    near(sw.probMin, 0.25)
    near(sw.probMax, 0.25)
    expect(FX.inject.worst).toBeLessThan(1e-12)
    near(injectGeneral('XZ').probs[2], 0.25)
  })
  it('executed axes: planned Z, X with an odd first reading runs X about −Y; ZZZ never changes; ZXZX has 8 histories', () => {
    expect(axes(['Z', 'X'], [1, 0]).executed.map((e) => e.text)).toEqual(['Z', '−Y'])
    expect(axes(['Z', 'X'], [1, 0]).executed.map((e) => e.text.replace('−', '-'))).toEqual(FX.axes.ZX_10.map((t: string) => t.replace('+', '')))
    expect(axes(['Z', 'X', 'Z', 'X'], [0, 1, 0, 0]).executed.map((e) => e.text.replace('−', '-'))).toEqual(FX.axes.ZXZX_0100.map((t: string) => t.replace('+', '')))
    expect(axesCensus(['Z', 'X', 'Z', 'X'])).toEqual({ histories: FX.axes.ZXZX.histories, distinct: FX.axes.ZXZX.distinct })
    expect(axesCensus(['Z', 'Z', 'Z'])).toEqual({ histories: 8, distinct: FX.axes.ZZZ.distinct })
    expect(axesCensus(['Z', 'X'])).toEqual({ histories: 4, distinct: FX.axes.ZX.distinct })
  })
})

describe('postselect', () => {
  it('tries until the first success: 1/s, and the series agrees', () => {
    near(attempts(0.2), FX.post.mean5, 1e-9)
    near(attempts(0.35), FX.post.mean035, 1e-9)
    near(attemptsSeries(0.2, 3000), FX.post.mean5, 1e-9)
    expect(() => attempts(0)).toThrow()
  })
  it('two stages with early drop: 60 against 70', () => {
    const s1 = 0.5
    const stages = [{ t: 10, s: s1 }, { t: 4, s: 0.2 / s1 }]
    near(meanTime(stages, true), FX.post.time, 1e-9)
    near(meanTime(stages, false), FX.post.noAbort, 1e-9)
    expect(meanTime(stages, true)).toBeLessThan(meanTime(stages, false))
    near(Math.abs(FX.post.mc - FX.post.time) / FX.post.time, 0, 0.02)
  })
  it('the escape-stage discard from the reported pairs', () => {
    near(escapeDiscard(0.35, 0.8), FX.post.esc3)
    near(escapeDiscard(0.85, 0.99), FX.post.esc5)
  })
  it('the gap table equals the loop over all patterns', () => {
    const t = gapTable(7, 0.1)
    near(t.noCut, FX.gap.noCut)
    for (const r of t.rows) {
      near(r.keep, FX.gap[`keep${r.cut}`])
      relNear(r.err, FX.gap[`err${r.cut}`], 1e-9)
    }
    expect(t.rows[0].keep).toBeCloseTo(1, 12)
  })
})

describe('tcount', () => {
  it('24 (3·2^k − 2) gates with at most k T gates', () => {
    expect(sets(6)).toEqual(FX.tcount.counts)
    expect(sets(6)).toEqual([0, 1, 2, 3, 4, 5, 6].map(setSizeLaw))
  })
  it('best errors of Rz(1), Rz(π/8) and Rz(π/4) agree with numpy', () => {
    const E = bestErrors([rzTarget(1), rzTarget(Math.PI / 8), rzTarget(Math.PI / 4)], 11)
    E[0].forEach((e, k) => near(e, FX.tcount.err_phi1[k], 1e-9))
    E[1].slice(0, 4).forEach((e, k) => near(e, FX.tcount.pi8[k], 1e-9))
    expect(E[2][1]).toBeLessThan(1e-6)
    near(E[2][0], FX.tcount.exactT[0], 1e-9)
    for (const row of E) for (let k = 1; k < row.length; k++) expect(row[k]).toBeLessThanOrEqual(row[k - 1] + 1e-15)
  })
  it('the slope of the mean of log2(1/ε) over 27 generic rotations equals the numpy fit', () => {
    const errs = bestErrors(GENERIC_TARGETS, 11)
    const { meanLog, slope } = meanLogSlope(errs, 4, 11)
    meanLog.forEach((m, k) => near(m, FX.tcount.meanLog[k], 1e-9))
    near(slope, FX.tcount.slope, 1e-9)
  })
  it('the published law: 3 log2(1/ε), ten times more accuracy costs about ten more T gates', () => {
    near(tcountLaw(1e-3), 3 * Math.log2(1e3))
    near(tcountLaw(1e-10) - tcountLaw(1e-9), 3 * Math.log2(10), 1e-12)
  })
})
