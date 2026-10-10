/**
 * Chapter Q15's own invariants (rulings qc709-Q15Q17.md): the unit order and sizes, the Go-deeper probe beat in its place, the four Spin Lab bridges used, the
 * two Corrections worded "our calculation finds" with a true engine check, Bergou's problems cited but not set, and every challenge answer recomputed through
 * the engine rather than read from the content file. (The generic lints, symbols before use, claims against numpy, derivation views, run in content.test.tsx,
 * symbols.test.ts and claims.test.ts for every chapter.)
 */
import { describe, expect, it } from 'vitest'
import { caesar, probeAttack, sharingCheat, shareThetaFor, b92Rates, xorBits } from '../../physics/qc/crypto'
import { chshFromAxes } from '../../physics/qc/entangle'
import { bell } from '../../physics/qc/state'
import { BRIDGES } from './bridges'
import { Q15 } from './Q15'
import { V } from './Q15.values'
import { QC_GLOSSARY } from './pack'

const beats = Q15.units.flatMap((u) => u.story ?? [])

describe('Q15 structure', () => {
  it('has Bergou’s five units in his order, with the planned beat counts', () => {
    expect(Q15.units.map((u) => u.id)).toEqual(['q15-otp', 'q15-b92', 'q15-bb84', 'q15-e91', 'q15-sharing'])
    expect(Q15.units.map((u) => (u.story ?? []).length)).toEqual([4, 5, 5, 4, 5])
    expect(beats.filter((b) => b.derivation)).toHaveLength(6)
    expect(Q15.units.flatMap((u) => u.play)).toHaveLength(16)
  })
  it('puts the probe attack in a single Go-deeper beat, last in its unit, with no reveal and no new notation', () => {
    const deeper = beats.filter((b) => b.phase === 'deeper')
    expect(deeper.map((b) => b.id)).toEqual(['q15-bb84:b5'])
    expect(deeper[0].reveal).toBeUndefined()
    expect(deeper[0].introduces).toBeUndefined()
    expect(Q15.units[2].story!.slice(-1)[0].id).toBe('q15-bb84:b5')
  })
  it('keeps the notes’ line independent of it: no challenge, review card or glossary entry uses the probe angle or the quarter turn', () => {
    const rest = JSON.stringify([Q15.units.map((u) => [u.play, u.review, u.insight, u.insightFormal, u.pitfalls]), QC_GLOSSARY.filter((g) => g.first.startsWith('q15-'))])
    for (const s of ['\\\\xi', 'quarter turn', 'half turn']) expect(rest.includes(s), s).toBe(false)
    // and the Go-deeper beat is the only story text that names the angle
    expect(beats.filter((b) => b.phase !== 'deeper').some((b) => JSON.stringify(b).includes('\\\\xi'))).toBe(false)
  })
  it('uses exactly one notation beat for each of the three notations', () => {
    const intro = beats.flatMap((b) => b.introduces ?? [])
    expect(intro.sort()).toEqual(['qc-device-independent', 'qc-logical-bit', 'qc-qber'])
    for (const g of QC_GLOSSARY.filter((x) => x.first.startsWith('q15-') && x.introduces)) expect(intro).toContain(g.id)
  })
  it('cites Bergou’s problems 6.1–6.4 in its unit lists, and sets none of them (no challenge is marked assigned)', () => {
    const where = Q15.units.map((u) => u.lecture.pages).join(' | ')
    for (const n of ['Problem 6.1', 'Problem 6.2', 'Problem 6.3', 'Problem 6.4']) expect(where, n).toContain(n)
    expect(Q15.units.flatMap((u) => u.play).filter((c) => c.assigned)).toEqual([])
  })
})

describe('Q15 bridges into Spin Lab Lecture 8', () => {
  it('registers the four 709 → 448 bridges, each to a Lecture 8 unit, and every one is used in the text or a glossary entry', () => {
    const ids = ['qc-l8-key', 'qc-l8-bb84', 'qc-l8-attack', 'qc-l8-test']
    expect(ids.map((i) => BRIDGES[i].unit)).toEqual(['l8-key', 'l8-bb84', 'l8-attack', 'l8-test'])
    const all = JSON.stringify(beats) + JSON.stringify(QC_GLOSSARY.filter((g) => g.first.startsWith('q15-')))
    for (const i of ids) expect(all.includes(`<<${i}|`) || all.includes(`"bridge":"${i}"`), i).toBe(true)
  })
  it('never re-derives BB84: the unit draws it with the shared bb84 stage kind and names Spin Lab for the working', () => {
    const bb = Q15.units[2].story!
    expect(bb.slice(0, 2).every((b) => JSON.stringify(b.stage).includes('"kind":"bb84"'))).toBe(true)
    expect(bb[0].text).toContain('<<qc-l8-bb84|')
    expect(bb[1].text).toContain('<<qc-l8-attack|')
  })
})

describe('Q15 corrections', () => {
  it('there are exactly two, both from the book, each phrased "Our calculation finds" and each with a check that holds', () => {
    expect(Q15.corrections).toHaveLength(2)
    for (const c of Q15.corrections ?? []) {
      expect(c.source).toBe('book')
      expect(c.shouldSay.startsWith('Our calculation finds')).toBe(true)
      expect(c.check()).toBe(true)
    }
    expect(Q15.corrections!.map((c) => c.where)).toEqual(['Bergou p. 111, Eq. 6.6', 'Bergou p. 113'])
  })
  it('a check fails when the discrepancy is not there (mutation: the printed line would be the corrected one)', () => {
    expect(V.q15Eq66PrintedGap).toBeGreaterThan(0.4)
    expect(V.q15Eq66PrintedSum).toBeGreaterThan(1.5)
    expect(V.q15CheatErr).toBe(0)
    expect(V.q15CheatKnows).toBeGreaterThan(0.999999)
  })
})

describe('Q15 challenge answers, recomputed through the engine', () => {
  const challenge = (id: string) => Q15.units.flatMap((u) => u.play).find((c) => c.id === id)!
  const correct = (id: string): string => {
    const c = challenge(id)
    if (c.kind !== 'choice') throw new Error(`${id} is not a choice`)
    return c.options.find((o) => o.correct)!.text
  }
  const answer = (id: string): number => {
    const c = challenge(id)
    if (c.kind !== 'numeric') throw new Error(`${id} is not numeric`)
    return c.answer
  }
  it('exactly one correct option in every choice challenge', () => {
    for (const c of Q15.units.flatMap((u) => u.play)) if (c.kind === 'choice') expect(c.options.filter((o) => o.correct), c.id).toHaveLength(1)
  })
  it('Caesar: the correct word is the engine’s three-place shift, the others are not', () => {
    expect(correct('q15-ot-caesar')).toBe(caesar('secret', 3))
    expect(caesar('secret', 3)).toBe('vhfuhw')
    const wrong = (challenge('q15-ot-caesar') as { options: { text: string; correct: boolean }[] }).options.filter((o) => !o.correct).map((o) => o.text)
    expect(wrong).not.toContain('vhfuhw')
  })
  it('XOR: the correct cipher is 10110 ⊕ 01101 = 11011, and the decoy answers are OR, AND and the carried sum', () => {
    expect(correct('q15-ot-xor')).toBe(`$${xorBits('10110', '01101')}$`)
    const wrong = (challenge('q15-ot-xor') as { options: { text: string; correct: boolean }[] }).options.filter((o) => !o.correct).map((o) => o.text)
    expect(wrong).toEqual(['$11111$', '$00100$', '$00011$'])
    expect(parseInt('10110', 2) | parseInt('01101', 2)).toBe(0b11111)
    expect(parseInt('10110', 2) & parseInt('01101', 2)).toBe(0b00100)
    expect((parseInt('10110', 2) + parseInt('01101', 2)) & 0b11111).toBe(0b00011)
  })
  it('the B92 numbers: kept 0.293, Q under the two Eves 0.354 and 0.146, and the quieter Eve is the minimum-error one', () => {
    expect(answer('q15-b9-kept')).toBeCloseTo(b92Rates('none').kept, 12)
    expect(answer('q15-b9-usd')).toBeCloseTo(b92Rates('usd').qber, 12)
    expect(answer('q15-b9-min')).toBeCloseTo(b92Rates('minerr').qber, 12)
    expect(b92Rates('minerr').qber).toBeLessThan(b92Rates('usd').qber)
    expect(correct('q15-b9-worse')).toContain('minimum-error')
  })
  it('BB84: the probe that causes no error guesses a z bit with chance one half', () => {
    expect(answer('q15-bb-guess')).toBeCloseTo(probeAttack(0).eveGuess, 12)
    expect(answer('q15-bb-guess')).toBeCloseTo(0.5, 12)
  })
  it('E91: same-basis agreement 0, mixed-basis agreement 0.5, and a fixed product cannot pass 2', () => {
    expect(answer('q15-e9-same')).toBe(0)
    expect(answer('q15-e9-diff')).toBeCloseTo(0.5, 12)
    expect(chshFromAxes(bell('Psi-'), [[1, 0, 0], [0, 0, 1]], [[-Math.SQRT1_2, 0, -Math.SQRT1_2], [-Math.SQRT1_2, 0, Math.SQRT1_2]])).toBeCloseTo(2 * Math.SQRT2, 9)
    expect(V.q15ChshProduct).toBeLessThanOrEqual(2)
    expect(V.q15ChshProductMax).toBeCloseTo(2, 9)
  })
  it('sharing: Charlie’s success 0.293 at 22.5°, the decode 1 ⊕ 0 = 1, and 30° for success one half', () => {
    expect(answer('q15-sh-usd')).toBeCloseTo(1 - Math.cos(Math.PI / 4), 12)
    expect(1 ^ 0).toBe(1)
    expect(correct('q15-sh-decode')).toBe('$1$')
    expect(answer('q15-sh-theta')).toBeCloseTo(shareThetaFor(0.5), 9)
    expect(answer('q15-sh-theta')).toBeCloseTo(30, 6)
  })
  it('the σ_z defence leaves a cheating Charlie’s record untouched for every θ (property over the code angle)', () => {
    for (const deg of [10, 20, 22.5, 35, 44]) {
      const c = sharingCheat('cheat-first', (deg * Math.PI) / 180)
      expect(c.recordGap).toBeLessThan(1e-12)
      expect(c.charlieGuess).toBeGreaterThan(1 - 1e-12)
    }
  })
})
