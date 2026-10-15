/**
 * Chapter Q22's seven Arcade "Spot the error" rounds (P-Q22-story §11.2): each wrong step is recomputed through the engine here, so the correction a round states is
 * the engine's number and the flagged step really is false (the generic checks of games.test.ts cover the shape and the chapter links).
 */
import { describe, expect, it } from 'vitest'
import { c } from '../../physics/complex'
import { matmul } from '../../physics/linalg'
import { pauliString } from '../../physics/qc/gates'
import { correctionOutcome, lookupDecoder } from '../../physics/qec/codes'
import { GF2Matrix } from '../../physics/qec/gf2'
import { Pauli } from '../../physics/qec/pauli'
import { CLIFFORD_GATES, cliffordConjugate, linearCodeFromChecks } from '../../physics/qec/q22'
import { failuresByWeight } from '../../physics/qec/rates'
import { StabilizerCode } from '../../physics/qec/stabilizer'
import { QC_ERROR_ROUNDS } from './games'
import { Q22 } from './Q22'
import { M_62, M_7, STEANE, SHOR, V } from './Q22.values'

const round = (id: string) => QC_ERROR_ROUNDS.find((r) => r.id === id)!
const at = (n: number, l: string, ...places: number[]) => Pauli.parse(Array.from({ length: n }, (_, i) => (places.includes(i + 1) ? l : 'I')).join(''))
const weight = (p: Pauli): number => p.letters().filter((x) => x !== 'I').length
const rows = (words: readonly string[]): number[][] => words.map((w) => [...w].map(Number))

describe('Q22 Spot the error rounds', () => {
  it('there are seven, each four steps long, each training a real unit of Q22', () => {
    const mine = QC_ERROR_ROUNDS.filter((r) => r.trains.lecture === 'Q22')
    expect(mine.map((r) => r.id)).toEqual(['qc-dual-distance', 'qc-stab-dependent', 'qc-shor-z1z2-logical', 'qc-css-any-two', 'qc-decode-two', 'qc-s-table', 'qc-gk-entangled'])
    for (const r of mine) {
      expect(r.steps).toHaveLength(4)
      expect(Q22.units.map((u) => u.id)).toContain(r.trains.unit)
      expect(r.wrong).toBe(2)
      expect(r.id.startsWith('qc-')).toBe(true)
    }
  })
  it('qc-dual-distance: the Hamming code has 16 words and distance 3; its dual has 8 words, all seven nonzero ones of weight 4', () => {
    const ham = linearCodeFromChecks(M_7)
    const dual = ham.dual()
    expect(ham.words()).toHaveLength(16)
    expect(ham.distance()).toBe(3)
    expect(dual.words()).toHaveLength(8)
    expect(dual.words().filter((w) => w.includes('1')).map((w) => [...w].filter((b) => b === '1').length)).toEqual([4, 4, 4, 4, 4, 4, 4])
    expect(V.q22DualD).toBe(4)
    expect(V.q22HamD).toBe(3)
    expect(round('qc-dual-distance').steps[2]).toContain('distance 3')
    expect(round('qc-dual-distance').why).toContain('weigh 4')
  })
  it('qc-stab-dependent: Z1Z3 is the product of Z1Z2 and Z2Z3, the rank is 2 and one qubit is still stored', () => {
    const [a, b, d] = [at(3, 'Z', 1, 2), at(3, 'Z', 2, 3), at(3, 'Z', 1, 3)]
    expect(a.mul(b).letters().join('')).toBe(d.letters().join(''))
    const three = new StabilizerCode([a, b, d])
    expect(three.rank).toBe(2)
    expect(three.k).toBe(1)
    expect(V.q22RankDep).toBe(2)
    expect(round('qc-stab-dependent').steps[2]).toContain('$3 - 3 = 0$')
    expect(round('qc-stab-dependent').why).toContain('$3 - 2 = 1$')
  })
  it('qc-shor-z1z2-logical: Z1Z2 is in the stabilizer group of Shor’s code, so it is not logical; the lightest logical operator weighs 3', () => {
    const code = SHOR.stabilizer()
    const z12 = at(9, 'Z', 1, 2)
    expect(code.inNormalizer(z12)).toBe(true)
    expect(code.inStabilizer(z12)).toBe(true)
    expect(code.isLogical(z12)).toBe(false)
    expect(V.q22DShor).toBe(3)
    expect(round('qc-shor-z1z2-logical').why).toContain('touches 3 qubits')
  })
  it('qc-css-any-two: H_X = H_Z = M62 gives a nonzero H_X H_Z^T (rows 1 and 2 share one place), so X1X2 anticommutes with Z1Z3', () => {
    const M = GF2Matrix.fromRows(rows(M_62), 6)
    const P = M.mul(M.transpose())
    expect(P.get(0, 1)).toBe(1)
    expect(V.q22Css62Fails).toBe(1)
    expect(M_62[0]).toBe('110000')
    expect(M_62[1]).toBe('101000')
    expect(at(6, 'X', 1, 2).commutesWith(at(6, 'Z', 1, 3))).toBe(false)
    expect(round('qc-css-any-two').steps[2]).toContain('each row passes the checks')
  })
  it('qc-decode-two: flips on qubits 1 and 2 leave 011, the syndrome of qubit 3; the table applies X3 and leaves the logical X1X2X3; all 21 pairs fail', () => {
    const code = STEANE.stabilizer()
    const dec = lookupDecoder(code, 1)
    const e = at(7, 'X', 1, 2)
    const out = correctionOutcome(code, dec, e)
    expect(V.q22TwoFlipSyn).toBe(0b011)
    expect(out.outcome).toBe('logical-error')
    expect(out.correction!.letters().join('')).toBe(at(7, 'X', 3).letters().join(''))
    expect(out.residual!.letters().join('')).toBe(at(7, 'X', 1, 2, 3).letters().join(''))
    expect(code.isLogical(out.residual!)).toBe(true)
    expect(failuresByWeight(STEANE, 'X')[2]).toBe(21)
    expect(round('qc-decode-two').steps[1]).toContain('011')
  })
  it('qc-s-table: S sends X to Y, Z to Z and Y to −X (not Z)', () => {
    const img = (p: string) => cliffordConjugate(CLIFFORD_GATES.S, p)
    expect(img('X')).toMatchObject({ clifford: true, sign: 1, pauli: 'Y' })
    expect(img('Z')).toMatchObject({ clifford: true, sign: 1, pauli: 'Z' })
    expect(img('Y')).toMatchObject({ clifford: true, sign: -1, pauli: 'X' })
    // the arithmetic of the wrong step: i·Y·Z = −X, by dense matrices
    const YZ = matmul(pauliString('Y'), pauliString('Z'))
    const iYZ = YZ.map((r) => r.map((z) => c(-z.im, z.re)))
    const X = pauliString('X')
    iYZ.forEach((r, i) => r.forEach((z, j) => expect(Math.hypot(z.re + X[i][j].re, z.im + X[i][j].im)).toBeLessThan(1e-12)))
    expect(V.q22SYSminusX).toBeLessThan(1e-12)
    expect(V.q22SYSZ).toBeLessThan(1e-12)
    expect(round('qc-s-table').steps[2]).toContain('= Z$')
  })
  it('qc-gk-entangled: the Steane code word |0bar> is named by 7 checks, none of weight under 3 (any two qubits are maximally mixed, so it is entangled across all seven)', () => {
    const named = new StabilizerCode([...STEANE.stabilizer().generators, Pauli.parse('ZZZZZZZ')])
    expect(named.rank).toBe(7)
    expect(V.q22SteaneGens).toBe(7)
    const light = named.elements(7).filter((p) => weight(p) > 0)
    expect(Math.min(...light.map(weight))).toBe(3)
    expect(round('qc-gk-entangled').steps[2]).toContain('$2^7$')
  })
})
