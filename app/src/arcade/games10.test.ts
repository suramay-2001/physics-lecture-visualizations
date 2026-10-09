/**
 * Arcade truth for Lecture 10 (P): the four Spot-the-error rounds name a slip whose correction states the engine's number (physics/qc), and the
 * GHZ game's four levels are decided by the engine (physics/qc/ghz.ts) alone: the data says only what each option claims.
 */
import { describe, expect, it } from 'vitest'
import { LECTURES } from '../content'
import { abs } from '../physics/complex'
import { inner } from '../physics/linalg'
import { rng } from '../physics/random'
import { correlator } from '../physics/qc/entangle'
import { pauliEigenvalue } from '../physics/qc/gates'
import { purityN, reducedBloch, reducedDensity } from '../physics/qc/density'
import { ghzAnswerProbs, ghzGame, ghzState, ghzTableResult, GHZ_ROWS } from '../physics/qc/ghz'
import { bell, ket } from '../physics/qc/state'
import { SIGMA_X, SIGMA_Z } from '../physics/spin'
import { ERROR_ROUNDS, GHZ_LEVELS, GAMES } from './games'
import { ghzVerdict, lostInput, planOf, shareRun } from './ghz'

const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b)).toBeLessThan(eps)
const L10_ROUNDS = ERROR_ROUNDS.filter((r) => r.trains.lecture === 'L10')
const sing = bell('01-10')

describe('Spot the error: Lecture 10', () => {
  it('has a round for four of the lecture’s units, each training a real unit with the wrong step third', () => {
    const units = LECTURES.find((l) => l.id === 'L10')!.units.map((u) => u.id)
    expect(L10_ROUNDS.map((r) => r.id)).toEqual(['z-on-bobs-label', 'centre-is-a-hidden-state', 'matched-axes-only', 'alice-signals-bob'])
    expect(L10_ROUNDS.map((r) => r.trains.unit)).toEqual(['l10-local', 'l10-empty-centre', 'l10-correlations', 'l10-what-ghz-proves'])
    for (const r of L10_ROUNDS) {
      expect(units).toContain(r.trains.unit)
      expect(r.steps).toHaveLength(4)
      expect(r.wrong).toBe(2)
    }
  })
  it('z-on-bobs-label: Z_A|du⟩ = −|du⟩, since Alice’s letter is the first, d', () => {
    expect(pauliEigenvalue(ket('10'), 'ZI')).toBe(-1)
    expect(pauliEigenvalue(ket('10'), 'IZ')).toBe(1) // the slip: Bob’s letter would give +1
  })
  it('centre-is-a-hidden-state: Alice’s arrow has length 0 and her reduced state has purity ½, so she has no pure state of her own', () => {
    close(Math.hypot(...reducedBloch(sing, 0)), 0)
    close(purityN(reducedDensity(sing, [0])), 0.5)
  })
  it('matched-axes-only: ⟨Z_AX_B⟩ = 0 on the singlet, so Bob’s x is a fair coin after Alice reads +1 along z', () => {
    close(correlator(sing, SIGMA_Z, SIGMA_X), 0)
    // and the matched axis is certain: ⟨Z_AZ_B⟩ = −1
    close(correlator(sing, SIGMA_Z, SIGMA_Z), -1)
  })
  it('alice-signals-bob: Bob’s own chance of +1 is ½ whichever input names his letter', () => {
    const G = ghzState()
    for (const row of GHZ_ROWS) {
      const p = ghzAnswerProbs(G, row)
      const bobPlus = p.reduce((s, x, i) => s + (((i >> 1) & 1) === 0 ? x : 0), 0)
      close(bobPlus, 0.5)
    }
    close(abs(inner(G, G)), 1)
  })
})

describe('The GHZ game (Arcade)', () => {
  it('is listed once, with four levels that each train a unit of Lecture 10', () => {
    expect(GAMES.filter((g) => g.kind === 'ghz-game').map((g) => g.id)).toEqual(['ghz-game'])
    expect(GAMES.find((g) => g.id === 'ghz-game')!.levels).toBe(4)
    expect(GHZ_LEVELS.map((l) => l.kind)).toEqual(['plan', 'reason', 'share', 'call'])
    const units = LECTURES.find((l) => l.id === 'L10')!.units.map((u) => u.id)
    for (const l of GHZ_LEVELS) expect(units).toContain(l.trains.unit)
  })

  it('Three of four: exactly the 32 plans that win three inputs are accepted; the 32 that win one, and the starting plan, are not', () => {
    const l = GHZ_LEVELS[0]
    const game = ghzGame()
    for (const { table, result } of game.tables) expect(ghzVerdict(l, { table }), JSON.stringify(table)).toBe(result.wins === 3)
    expect(game.tables.filter((t) => ghzVerdict(l, { table: t.table }))).toHaveLength(32)
    expect(ghzVerdict(l, { table: planOf([1, 1, 1, 1, 1, 1]) })).toBe(false) // “all +1” wins only ZZZ
    expect(ghzVerdict(l, { option: { label: 'x' } })).toBe(false)
  })

  it('Four of four?: the engine accepts exactly the option that says the row products multiply to +1 and the needs to −1', () => {
    const l = GHZ_LEVELS[1]
    const right = l.options!.filter((o) => ghzVerdict(l, { option: o }))
    expect(right).toHaveLength(1)
    expect(right[0].reason).toEqual({ rows: 1, needs: -1 })
    expect(ghzGame().rowsProduct).toBe(1)
    expect(ghzGame().targetsProduct).toBe(-1)
    expect(new Set(l.options!.map((o) => `${o.reason!.rows}${o.reason!.needs}`)).size).toBe(4) // the four combinations, once each
  })

  it('Share |G⟩: the seeded run of 20 wins all 20, Alice answers −1 between 30% and 70% of the time, and only 20 is accepted', () => {
    const l = GHZ_LEVELS[2]
    const run = shareRun(l)
    expect(run.rounds).toBe(20)
    expect(run.wins).toBe(20)
    expect(run.aliceMinus / run.rounds).toBeGreaterThanOrEqual(0.3)
    expect(run.aliceMinus / run.rounds).toBeLessThanOrEqual(0.7)
    expect(l.options!.filter((o) => ghzVerdict(l, { option: o })).map((o) => o.wins)).toEqual([20])
    // the same run, replayed
    expect(shareRun(l)).toEqual(run)
    expect(rng(7)()).toBe(rng(7)())
  })

  it('Call the loss: the plan on show loses XXZ only, exactly that option is accepted, and the level text names it', () => {
    const l = GHZ_LEVELS[3]
    const plan = planOf(l.plan!)
    expect(ghzTableResult(plan).wins).toBe(3)
    expect(lostInput(plan)).toBe('XXZ')
    expect(l.options!.filter((o) => ghzVerdict(l, { option: o })).map((o) => o.input)).toEqual(['XXZ'])
    expect(l.why).toContain('$XXZ$')
    expect(l.why).toMatch(/wins \$ZZZ\$, \$ZXX\$ and \$XZX\$/)
  })

  it('every level has a goal, a hint and a reason, and the `plan` level asks for 3 (the most any plan wins)', () => {
    for (const l of GHZ_LEVELS) {
      expect(l.goal.length).toBeGreaterThan(20)
      expect(l.hint.length).toBeGreaterThan(20)
      expect(l.why.length).toBeGreaterThan(20)
    }
    expect(GHZ_LEVELS[0].wins).toBe(ghzGame().maxWins)
  })
})
