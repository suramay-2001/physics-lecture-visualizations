/**
 * Chapter Q20's six Arcade "Spot the error" rounds (P-Q20-story §11.2): each wrong step is recomputed through the engine here (physics/qc/machines.ts), so the
 * correction a round states is the engine's number and the flagged step really is false (the generic checks of games.test.ts cover the shape and the chapter links).
 */
import { describe, expect, it } from 'vitest'
import { abs2 } from '../../physics/complex'
import { apply, inner } from '../../physics/linalg'
import { Y } from '../../physics/qc/gates'
import {
  PSI_RUN,
  blochKet,
  blochVector,
  clonerFidelities,
  clonerOutputs,
  clonerPairOverlap,
  maxOperations,
  measurePrepareClone,
  rusSuccess,
  unotTurned,
  usdKnown,
  usdProgrammableAt,
} from '../../physics/qc/machines'
import { QC_ERROR_ROUNDS } from './games'
import { Q20 } from './Q20'
import { V } from './Q20.values'

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps)
const round = (id: string) => QC_ERROR_ROUNDS.find((r) => r.id === id)!
const sentences = (s: string) => s.split(/(?<=[.?!])\s+(?=[A-Z$])/)
const words = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length
const overlap = (a: ReturnType<typeof blochKet>, b: ReturnType<typeof blochKet>) => abs2(inner(a, b))

describe('Q20 Spot the error rounds', () => {
  const IDS = ['qc-clone-perfect', 'qc-unot-gate', 'qc-clone-both', 'qc-proc-universal', 'qc-rus-sure', 'qc-disc-orth']
  it('there are six, each four steps long, each training a real unit of Q20, the flagged step inside the argument', () => {
    const mine = QC_ERROR_ROUNDS.filter((r) => r.trains.lecture === 'Q20')
    expect(mine.map((r) => r.id)).toEqual(IDS)
    for (const r of mine) {
      expect(r.steps).toHaveLength(4)
      expect(Q20.units.map((u) => u.id)).toContain(r.trains.unit)
      expect(r.wrong).toBeGreaterThanOrEqual(1)
      expect(r.wrong).toBeLessThan(4)
      expect(r.id.startsWith('qc-')).toBe(true)
    }
  })
  it('every sentence of a round is at most 25 words', () => {
    for (const r of QC_ERROR_ROUNDS.filter((x) => x.trains.lecture === 'Q20'))
      for (const s of [...r.steps, r.why].flatMap(sentences)) expect(words(s), `${r.id}: ${s}`).toBeLessThanOrEqual(25)
  })
  it('qc-clone-perfect: wire 1 is perfect at u = 0 and wire 2 at u = 60°, but the best both wires get together is 5/6 at u = 30°', () => {
    close(clonerFidelities(0).f1, 1)
    close(clonerFidelities(60).f2, 1)
    let bestBoth = 0
    for (let u = 0; u <= 60; u += 0.5) {
      const f = clonerFidelities(u)
      bestBoth = Math.max(bestBoth, Math.min(f.f1, f.f2))
    }
    close(bestBoth, 5 / 6, 1e-9)
    close(clonerFidelities(30).f1, 5 / 6)
    close(clonerFidelities(30).f2, 5 / 6)
    expect(bestBoth).toBeLessThan(1)
    close(V.q20F56, 5 / 6)
    expect(round('qc-clone-perfect').why).toContain('0.833')
  })
  it('qc-unot-gate: σ_y flips +z and +x but leaves +y fixed; the best machine sends r to -r/3', () => {
    const phase = (psi: ReturnType<typeof blochKet>) => apply(Y, psi)
    close(overlap(phase(blochKet(0, 0)), blochKet(180, 0)), 1)
    close(overlap(phase(blochKet(90, 0)), blochKet(90, 180)), 1)
    close(overlap(phase(blochKet(90, 90)), blochKet(90, 90)), 1)
    close(overlap(phase(blochKet(90, 90)), blochKet(90, 270)), 0)
    const r = blochVector(unotTurned(clonerOutputs({ uDeg: 30 })[2]))
    const rin = [0, Math.sqrt(3) / 2, 0.5]
    close(Math.hypot(...r), 1 / 3, 1e-9)
    r.forEach((v, k) => close(v, -rin[k] / 3, 1e-9))
    close(V.q20UnotShrink, 1 / 3)
    expect(round('qc-unot-gate').why).toContain('one third as long')
  })
  it('qc-clone-both: measure-and-prepare gives 2/3 per copy but 1/2 for the pair; the cloner circuit gives 5/6 per copy and 2/3 for the pair', () => {
    const mp = measurePrepareClone(PSI_RUN)
    close(mp.single, 2 / 3, 1e-6)
    close(mp.both, 1 / 2, 1e-6)
    close(clonerPairOverlap(30, PSI_RUN), 2 / 3, 1e-9)
    close(clonerFidelities(30).f1, 5 / 6)
    expect(mp.both).toBeLessThan(clonerPairOverlap(30, PSI_RUN))
    close(V.q20MpCloneBoth, 1 / 2, 1e-6)
    close(V.q20CloneBoth, 2 / 3, 1e-9)
    expect(round('qc-clone-both').why).toContain('$1/2$')
  })
  it('qc-proc-universal: n program wires hold 2^n orthogonal programs: 4 for two, 1024 for ten', () => {
    expect(maxOperations(2)).toBe(4)
    expect(maxOperations(10)).toBe(1024)
    expect(V.q20MaxOps10).toBe(1024)
    expect(round('qc-proc-universal').why).toContain('$1024$')
  })
  it('qc-rus-sure: after k rounds the chance is 1 - 2^-k, 0.9922 at k = 7, never exactly 1; 7 rounds pass 0.99 and 10 pass 0.999', () => {
    for (const k of [1, 2, 5, 7, 9]) close(rusSuccess(k), 1 - 2 ** -k, 1e-12)
    expect(rusSuccess(7)).toBeLessThan(1)
    close(rusSuccess(7), 0.9921875, 1e-12)
    expect(rusSuccess(6)).toBeLessThan(0.99)
    expect(rusSuccess(7)).toBeGreaterThanOrEqual(0.99)
    expect(rusSuccess(9)).toBeLessThan(0.999)
    expect(rusSuccess(10)).toBeGreaterThanOrEqual(0.999)
    expect(V.q20RusRounds99).toBe(7)
    expect(V.q20RusRounds999).toBe(10)
    expect(round('qc-rus-sure').why).toContain('$0.992$')
  })
  it('qc-disc-orth: at overlap 0 the programmable machine succeeds with chance 1/3, a machine told the states with 1', () => {
    close(usdProgrammableAt(0), 1 / 3, 1e-9)
    close(usdKnown(0), 1)
    close(V.q20DiscP0, 1 / 3, 1e-9)
    expect(usdProgrammableAt(0)).toBeLessThan(usdKnown(0))
    expect(round('qc-disc-orth').why).toContain('$1/3$')
  })
})
