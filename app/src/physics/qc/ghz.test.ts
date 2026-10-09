/**
 * Lecture 10's engine against numpy (qc.json block "lecture10", pipeline/make_qc_fixtures.py): superpose = a signed sum of np.kron
 * products of |0⟩, |1⟩; instructionSets = itertools.product over flat ±1 variables scored with np.prod; ghzQuantumWin = ⟨ψ|kron(P)|ψ⟩
 * with explicit Pauli matrices; ghzAnswerProbs = |⟨e₁⊗e₂⊗e₃|ψ⟩|² with eigh eigenvectors. Plus properties: Mermin's rows, run through
 * the general function, reproduce `merminInstructionSets` byte for byte (a legacy copy of the old nested loops sits in this file);
 * every GHZ table's four row products multiply to +1 while the targets multiply to −1; |G⟩ wins every input and a table never
 * beats ¾; a seeded run of the game is replayable and its win rates sit where the chances say.
 */
import { describe, expect, it } from 'vitest'
import { rng } from '../random'
import { MERMIN_TARGET, instructionSets, merminInstructionSets, type Sign } from './bits'
import {
  GHZ_ANSWER_TRIPLES,
  GHZ_ROWS,
  GHZ_TARGET,
  GHZ_TERMS,
  type GhzRow,
  type GhzTable,
  ghzAnswerProbs,
  ghzGame,
  ghzQuantumWin,
  ghzRound,
  ghzState,
  ghzTableResult,
} from './ghz'
import { pauliEigenvalue } from './gates'
import { bell, ghz, isNormalized, superpose } from './state'
import { FX, cv, vecGap } from './testkit'

const D = FX.lecture10
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('superpose = a signed np.kron sum', () => {
  it('matches numpy on eight contents, normalized, and covers bell and ghz as special cases', () => {
    expect(D.superpose.length).toBeGreaterThanOrEqual(8)
    for (const k of D.superpose) {
      const psi = superpose(k.content)
      expect(vecGap(psi, cv(k.psi)), k.content).toBeLessThan(1e-12)
      expect(isNormalized(psi)).toBe(true)
    }
    expect(vecGap(superpose('01-10'), bell('01-10'))).toBeLessThan(1e-15)
    expect(vecGap(superpose('000+111'), ghz(3))).toBeLessThan(1e-15)
  })

  it('rejects malformed contents', () => {
    for (const bad of ['', '012', '00+0', '00+00', '00 +11', '00++11', '00+', '+', '000-0', '01x10'])
      expect(() => superpose(bad), bad).toThrow()
    expect(() => superpose('0' + '1'.repeat(10) + '+' + '0'.repeat(11))).toThrow() // 11 qubits
  })

  it('the notes\' |G⟩ has four amplitudes ±½ and puts +½ on |000⟩', () => {
    const G = ghzState()
    expect(GHZ_TERMS).toBe('000-011-101-110')
    const amps = G.map((a) => a.re)
    expect(amps).toEqual([0.5, 0, 0, -0.5, 0, -0.5, -0.5, 0].map((x) => (x === 0 ? 0 : x)))
  })
})

describe('instructionSets = itertools.product over ±1 variables', () => {
  for (const s of D.sets) {
    it(`${s.name}: every assignment's matches, the histogram, the ceiling and the product facts agree with numpy`, () => {
      const g = instructionSets(s.rows, s.targets, s.letters)
      expect(g.assignments.map((a) => a.matches)).toEqual(s.matches)
      expect(g.assignments.map((a) => s.rows.map((r: string) => a.values[r]))).toEqual(s.values)
      expect(g.maxMatches).toBe(s.maxMatches)
      for (const [k, n] of Object.entries(s.histogram)) expect(g.histogram[Number(k)]).toBe(n)
      expect(Object.keys(g.histogram).length).toBe(Object.keys(s.histogram).length)
      expect(g.targetsProduct).toBe(s.targetsProduct)
      expect(g.rowsProduct).toBe(s.rowsProductAll.length === 1 ? s.rowsProductAll[0] : null)
    })
  }

  it('Mermin through the general function is the old function, byte for byte', () => {
    // the pre-Lecture-10 implementation, kept here verbatim as the reference
    const legacy = () => {
      const settings: { x: 1 | -1; y: 1 | -1 }[] = []
      for (const x of [1, -1] as const) for (const y of [1, -1] as const) settings.push({ x, y })
      const assignments: unknown[] = []
      for (const p1 of settings)
        for (const p2 of settings)
          for (const p3 of settings) {
            const values = {
              XXX: (p1.x * p2.x * p3.x) as 1 | -1,
              XYY: (p1.x * p2.y * p3.y) as 1 | -1,
              YXY: (p1.y * p2.x * p3.y) as 1 | -1,
              YYX: (p1.y * p2.y * p3.x) as 1 | -1,
            }
            const matches = (Object.keys(MERMIN_TARGET) as (keyof typeof MERMIN_TARGET)[]).filter((k) => values[k] === MERMIN_TARGET[k]).length
            assignments.push({ a: [p1, p2, p3], values, matches })
          }
      return { assignments, maxMatches: Math.max(...(assignments as { matches: number }[]).map((x) => x.matches)) }
    }
    expect(JSON.stringify(merminInstructionSets())).toBe(JSON.stringify(legacy()))
  })

  it('validates its inputs', () => {
    expect(() => instructionSets([], {})).toThrow()
    expect(() => instructionSets(['ZZ', 'XXX'], { ZZ: 1, XXX: 1 })).toThrow() // different lengths
    expect(() => instructionSets(['ZZ', 'ZZ'], { ZZ: 1 })).toThrow() // repeated row
    expect(() => instructionSets(['ZZ', 'XX'], { ZZ: 1 } as Record<string, Sign>)).toThrow() // missing target
    expect(() => instructionSets(['ZZ'], { ZZ: 1, XX: 1 } as Record<string, Sign>)).toThrow() // target for no row
    expect(() => instructionSets(['ZZZZ'], { ZZZZ: 1 })).toThrow() // four players
    expect(() => instructionSets(['ZX'], { ZX: 1 }, ['Z'])).toThrow() // a row uses a letter that is not a setting
  })
})

describe('the GHZ game: 64 tables, a ¾ ceiling and the +1 versus −1 contradiction', () => {
  const game = ghzGame()

  it('has 64 tables, win histogram {1: 32, 3: 32}, no table above 3 of 4 and bound ¾', () => {
    expect(game.tables.length).toBe(64)
    expect(game.histogram[1]).toBe(32)
    expect(game.histogram[3]).toBe(32)
    expect(Object.keys(game.histogram).sort()).toEqual(['1', '3'])
    expect(game.maxWins).toBe(3)
    expect(game.classicalBound).toBe(0.75)
    // a uniformly random table is no better than the mean of wins/4 = ½
    close(game.tables.reduce((s, t) => s + t.result.wins / 4, 0) / 64, 0.5)
  })

  it('EVERY table\'s four row products multiply to +1 while the four targets multiply to −1, so no table wins all four', () => {
    expect(game.rowsProduct).toBe(1)
    expect(game.targetsProduct).toBe(-1)
    for (const { result } of game.tables) {
      expect(GHZ_ROWS.reduce((p, r) => p * result.values[r], 1)).toBe(1)
      expect(result.wins).toBeLessThan(4)
      expect(result.wins % 2).toBe(1) // an odd number of inputs fails: 1 or 3 of 4 win
    }
  })

  it('ghzTableResult scores the notes\' plans: "always −1" wins ZXX, XZX, XXZ and loses ZZZ; A_Z = +1, A_X = −1 with the rest −1 loses ZXX', () => {
    const minus: GhzTable = [{ Z: -1, X: -1 }, { Z: -1, X: -1 }, { Z: -1, X: -1 }]
    const r = ghzTableResult(minus)
    expect(r.values).toEqual({ ZZZ: -1, ZXX: -1, XZX: -1, XXZ: -1 })
    expect(r.win).toEqual({ ZZZ: false, ZXX: true, XZX: true, XXZ: true })
    expect(r.wins).toBe(3)
    const t1: GhzTable = [{ Z: 1, X: -1 }, { Z: -1, X: -1 }, { Z: -1, X: -1 }]
    expect(ghzTableResult(t1).win).toEqual({ ZZZ: true, ZXX: false, XZX: true, XXZ: true })
    // the table list contains these two
    const has = (tbl: GhzTable) => game.tables.some((x) => JSON.stringify(x.table) === JSON.stringify(tbl))
    expect(has(minus)).toBe(true)
    expect(has(t1)).toBe(true)
  })

  it('the ceiling holds for a single changed answer: flipping any one of the six answers changes the wins by exactly 2 (an odd count stays odd)', () => {
    for (const { table, result } of game.tables.slice(0, 16)) {
      for (let p = 0; p < 3; p++)
        for (const ch of ['Z', 'X'] as const) {
          const t = table.map((s) => ({ ...s })) as GhzTable
          t[p][ch] = (-t[p][ch]) as Sign
          const w = ghzTableResult(t).wins
          expect(w % 2).toBe(1)
          expect(Math.abs(w - result.wins) % 2).toBe(0)
        }
    }
  })
})

describe('the quantum strategy: |G⟩ is an eigenstate of all four products', () => {
  it('ghzQuantumWin, the four expectations and the answer chances match numpy for |G⟩, the textbook GHZ state, |000⟩ and a random state', () => {
    expect(D.quantum.length).toBe(4)
    for (const k of D.quantum) {
      const psi = cv(k.psi)
      const w = ghzQuantumWin(psi)
      close(w.mean, k.mean)
      k.perInput.forEach((p: { row: GhzRow; expectation: number; win: number }, i: number) => {
        expect(w.perInput[i].row).toBe(p.row)
        close(w.perInput[i].expectation, p.expectation)
        close(w.perInput[i].win, p.win)
      })
      for (const r of GHZ_ROWS) {
        const probs = ghzAnswerProbs(psi, r)
        probs.forEach((x, i) => close(x, k.answerProbs[r][i]))
        close(probs.reduce((s, x) => s + x, 0), 1)
      }
    }
  })

  it('|G⟩ wins every input with certainty; each product observable has the eigenvalue its target needs', () => {
    const G = ghzState()
    const w = ghzQuantumWin(G)
    close(w.mean, 1)
    for (const p of w.perInput) close(p.win, 1)
    for (const r of GHZ_ROWS) expect(pauliEigenvalue(G, r)).toBe(GHZ_TARGET[r])
    // and the textbook GHZ state is NOT the winning state here: it wins only half the time on average
    close(ghzQuantumWin(ghz(3)).mean, 0.5)
  })

  it('under every input the answer triples have an odd/even parity that always wins, and Alice\'s own answer is 50/50', () => {
    const G = ghzState()
    for (const r of GHZ_ROWS) {
      const p = ghzAnswerProbs(G, r)
      let win = 0
      let aliceUp = 0
      p.forEach((x, i) => {
        const [a, b, c] = GHZ_ANSWER_TRIPLES[i]
        if (a * b * c === GHZ_TARGET[r]) win += x
        if (a === 1) aliceUp += x
        // outcomes that would lose have chance exactly zero
        if (a * b * c !== GHZ_TARGET[r]) close(x, 0)
      })
      close(win, 1)
      close(aliceUp, 0.5)
      expect(p.filter((x) => x > 1e-9).length).toBe(4) // four equally likely triples
    }
  })

  it('the state is not changed by playing (ghzAnswerProbs and ghzQuantumWin copy)', () => {
    const G = ghzState()
    const before = JSON.stringify(G)
    ghzQuantumWin(G)
    for (const r of GHZ_ROWS) ghzAnswerProbs(G, r)
    expect(JSON.stringify(G)).toBe(before)
  })
})

describe('ghzRound: a seeded round is replayable and plays by the right rule', () => {
  const G = ghzState()
  const alwaysMinus: GhzTable = [{ Z: -1, X: -1 }, { Z: -1, X: -1 }, { Z: -1, X: -1 }]

  it('the same seed replays the same rounds; a table answers by lookup', () => {
    const play = (seed: number) => {
      const R = rng(seed)
      return Array.from({ length: 30 }, () => ghzRound({ state: G }, GHZ_ROWS[Math.floor(R() * 4)], R))
    }
    expect(JSON.stringify(play(7))).toBe(JSON.stringify(play(7)))
    expect(JSON.stringify(play(7))).not.toBe(JSON.stringify(play(8)))
    const r = ghzRound({ table: alwaysMinus }, 'ZZZ', () => 0.5)
    expect(r.answers).toEqual([-1, -1, -1])
    expect(r.product).toBe(-1)
    expect(r.win).toBe(false)
  })

  it('20 000 seeded rounds: |G⟩ wins every one, Alice answers −1 about half the time; the best table wins 3 of 4 inputs, ¾ on average', () => {
    const R = rng(1010)
    let qWins = 0
    let aliceMinus = 0
    let tWins = 0
    const N = 20000
    for (let k = 0; k < N; k++) {
      const row = GHZ_ROWS[Math.floor(R() * 4)]
      const q = ghzRound({ state: G }, row, R)
      if (q.win) qWins++
      if (q.answers[0] === -1) aliceMinus++
      if (ghzRound({ table: alwaysMinus }, row, R).win) tWins++
    }
    expect(qWins).toBe(N)
    expect(Math.abs(aliceMinus / N - 0.5)).toBeLessThan(0.02)
    expect(Math.abs(tWins / N - 0.75)).toBeLessThan(0.02)
  })

  it('a state that is not |G⟩ loses some rounds (|000⟩ always answers +1: it wins only ZZZ)', () => {
    const uuu = superpose('000')
    const R = rng(3)
    for (const row of GHZ_ROWS) {
      const wins = Array.from({ length: 200 }, () => ghzRound({ state: uuu }, row, R)).filter((x) => x.win).length
      if (row === 'ZZZ') expect(wins).toBe(200)
      else expect(wins / 200).toBeLessThan(0.7) // X on |0⟩ is 50/50, so the product wins about half the time
    }
  })
})
