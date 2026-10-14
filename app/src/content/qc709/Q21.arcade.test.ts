/**
 * Chapter Q21's seven Arcade "Spot the error" rounds (P-Q21-story §11.2): each wrong step is recomputed through the engine here, so the correction a round states is
 * the engine's number and the flagged step really is false (the generic checks of games.test.ts cover the shape and the chapter links).
 */
import { describe, expect, it } from 'vitest'
import { codeSyndrome, klMatrix } from '../../physics/qec/errors'
import { Pauli } from '../../physics/qec/pauli'
import { repetitionFail } from '../../physics/qec/rates'
import { registeredCode } from '../../physics/qec/registry'
import { QC_ERROR_ROUNDS } from './games'
import { Q21 } from './Q21'
import { V } from './Q21.values'

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps)
const round = (id: string) => QC_ERROR_ROUNDS.find((r) => r.id === id)!
const at = (n: number, l: string, j: number) => Pauli.parse(Array.from({ length: n }, (_, i) => (i === j - 1 ? l : 'I')).join(''))

describe('Q21 Spot the error rounds', () => {
  it('there are seven, each four steps long, each training a real unit of Q21', () => {
    const mine = QC_ERROR_ROUNDS.filter((r) => r.trains.lecture === 'Q21')
    expect(mine.map((r) => r.id)).toEqual(['qc-vote-always', 'qc-bf-both-one', 'qc-bf-sees-z', 'qc-shor-group1', 'qc-small-fix', 'qc-kl-identity', 'qc-dfs-independent'])
    for (const r of mine) {
      expect(r.steps).toHaveLength(4)
      expect(Q21.units.map((u) => u.id)).toContain(r.trains.unit)
      expect(r.wrong).toBe(2)
      expect(r.id.startsWith('qc-')).toBe(true)
    }
  })
  it('qc-vote-always: three copies beat one bit below p = 0.5 and lose above it', () => {
    close(V.q21RepFail01, 0.028)
    for (const p of [0.05, 0.1, 0.3, 0.45]) expect(repetitionFail(p, 3)).toBeLessThan(p)
    for (const p of [0.55, 0.7, 0.9]) expect(repetitionFail(p, 3)).toBeGreaterThan(p)
    close(V.q21BreakEven, 0.5)
    expect(round('qc-vote-always').steps[2]).toContain('every $p$')
  })
  it('qc-bf-both-one: a flip of qubit 2 reads (−1, −1); (+1, +1) is no flip', () => {
    const rep = registeredCode('rep3')
    expect(codeSyndrome(rep, at(3, 'X', 2))).toEqual([-1, -1])
    expect(codeSyndrome(rep, Pauli.identity(3))).toEqual([1, 1])
    expect(round('qc-bf-both-one').steps[2]).toContain('read $+1$')
  })
  it('qc-bf-sees-z: Z1 commutes with both checks of the bit-flip code (syndrome +1, +1) and moves the state by overlap −0.28', () => {
    expect(codeSyndrome(registeredCode('rep3'), at(3, 'Z', 1))).toEqual([1, 1])
    close(V.q21Z1Overlap, -0.28)
    expect(round('qc-bf-sees-z').steps[2]).toContain('catches this')
  })
  it('qc-shor-group1: Z1 reads (−1, +1) on the big checks; (+1, −1) is group 3', () => {
    const shor = registeredCode('shor9')
    expect(codeSyndrome(shor, at(9, 'Z', 1)).slice(0, 2)).toEqual([-1, 1])
    expect(codeSyndrome(shor, at(9, 'Z', 7)).slice(0, 2)).toEqual([1, -1])
    expect(round('qc-shor-group1').steps[2]).toContain('$(+1, -1)$ for group 1')
  })
  it('qc-small-fix: the helpers read 00 with chance 0.75 or 11 with chance 0.25, never anything between', () => {
    close(V.q21SmallP00, 0.75)
    close(V.q21SmallP11, 0.25)
    close(V.q21SmallP00 + V.q21SmallP11, 1, 1e-12)
    expect(round('qc-small-fix').why).toContain('$0.75$')
  })
  it('qc-kl-identity: the table of {I, Z1, Z2} on the Shor code is not the identity, passes the test, and has eigenvalues 0, 1, 2', () => {
    const r = klMatrix(registeredCode('shor9'), [Pauli.identity(9), at(9, 'Z', 1), at(9, 'Z', 2)])
    expect(r.gap).toBeLessThan(1e-12)
    expect(r.C[1][2].re).toBeCloseTo(1, 12)
    expect(r.eigenvalues.map((x) => Math.round(x))).toEqual([0, 1, 2])
  })
  it('qc-dfs-independent: independent ±60° phases cut the pair’s coherence from 0.48 to 0.12', () => {
    close(V.q21DfsOff, 0.48)
    close(V.q21IndOff, 0.12)
    expect(round('qc-dfs-independent').why).toContain('$0.12$')
  })
})
