/**
 * Chapter Q15's own invariants (rulings qc709-Q15Q17.md): the unit order and sizes, the Go-deeper probe beat in its place, the four Spin Lab bridges used, the
 * two Corrections worded "our calculation finds" with a true engine check, Bergou's problems cited but not set, and every challenge answer recomputed through
 * the engine rather than read from the content file. (The generic lints, symbols before use, claims against numpy, derivation views, run in content.test.tsx,
 * symbols.test.ts and claims.test.ts for every chapter.)
 */
import { describe, expect, it } from 'vitest'
import { b92Rates, b92Rounds, b92Tally, caesar, eq66Check, probeAttack, sharingCheat, shareThetaFor, xorBits } from '../../physics/qc/crypto'
import { chshFromAxes } from '../../physics/qc/entangle'
import { bell } from '../../physics/qc/state'
import { BB84_LIMITS, resolveBb84Stage } from '../../stage/svg/bb84'
import { layoutStates } from '../stage'
import { pickTrack } from '../track'
import { texSpans } from '../walk'
import { BRIDGES } from './bridges'
import { Q15 } from './Q15'
import { B92_LEDGER, V } from './Q15.values'
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

describe('Q15 review fixes (P-Q15-review)', () => {
  const beat = (id: string) => beats.find((b) => b.id === id)!
  it('item 1: m is the message bit only; the test-sample size is N_test and Charlie’s reading is β′ (m appears elsewhere only in the Rosetta to Spin Lab)', () => {
    const where: string[] = []
    for (const b of beats) {
      if (b.id.startsWith('q15-otp:')) continue
      for (const t of [b.text, b.formal ?? '', b.reveal?.text ?? '', b.reveal?.formal ?? '']) for (const sp of texSpans(t)) if (/(^|[^A-Za-z\\])m([^A-Za-z]|$)/.test(sp.tex)) where.push(b.id)
    }
    expect([...new Set(where)]).toEqual(['q15-bb84:b2'])
    expect(beat('q15-bb84:b2').formal).toContain('N_{\\text{test}}')
    expect(beat('q15-sharing:b5').reveal!.formal).toContain("\\beta'")
    expect(Q15.symbols!['N_test']).toBe('q15-bb84:b2')
  })
  it('item 2: the Ground text of the minimum-error beat names P_E and Γ before the derivation uses them', () => {
    const b = beat('q15-b92:b4')
    expect(b.text).toContain('$P_E$')
    expect(b.text).toContain('\\Gamma')
  })
  it('items 5–6: the bb84 captions say what the stage draws (the last BB84_LIMITS.rows rounds; the Eve-knows readout)', () => {
    expect(BB84_LIMITS.rows).toBe(12)
    const b1 = beat('q15-bb84:b1')
    expect(b1.caption).toContain(`the last ${BB84_LIMITS.rows} drawn`)
    expect(b1.captionFormal).toContain(`the last ${BB84_LIMITS.rows} drawn`)
    const b2 = beat('q15-bb84:b2')
    expect(b2.caption).toContain('Eve knows')
    expect(b2.captionFormal).toContain('Eve knows')
    expect(JSON.stringify(b2.stage)).toContain('eve-knows')
  })
  it('F7 bridge: the pad beat links the XOR chapter in both tracks', () => {
    expect(beat('q15-otp:b2').text).toContain('<<qc-f7-xor|')
    expect(beat('q15-otp:b2').formal).toContain('<<qc-f7-xor|')
  })
})

describe('Q15 seeded B92 ledger (rulings qc709-deferred-features D2)', () => {
  const b3 = beats.find((b) => b.id === 'q15-b92:b3')!
  const ledgerOf = () => layoutStates(b3.stage!).find((s) => s.kind === 'bb84')
  it('beat q15-b92:b3 shows the ledger in a split with the exact-rate sphere (two different kinds); no other beat of the chapter uses protocol b92', () => {
    expect(b3.stage).toMatchObject({ layout: 'split', top: { kind: 'bb84', protocol: 'b92', eve: 'usd' }, bottom: { kind: 'bloch-ball' } })
    expect(layoutStates(b3.stage!).map((s) => s.kind)).toEqual(['bb84', 'bloch-ball'])
    expect(beats.filter((b) => JSON.stringify([b.stage, b.reveal?.stage]).includes('"protocol":"b92"')).map((b) => b.id)).toEqual(['q15-b92:b3'])
    // the BB84 unit's own two ledgers are still BB84 (no protocol)
    expect(JSON.stringify(Q15.units[2].story!.slice(0, 2).map((b) => b.stage))).not.toContain('protocol')
  })
  it('both tracks say what the rows show, and quote the seeded run the stage draws (its counts are claims with numpy twins)', () => {
    const st = ledgerOf()!
    const r = resolveBb84Stage(st as never, 1)
    const t = b92Tally(b92Rounds(B92_LEDGER.count, B92_LEDGER.seed, 'usd'))
    expect([r.count, r.kept, r.errors]).toEqual([B92_LEDGER.count, t.kept, t.errors])
    expect([V.q15B92LedgerKept, V.q15B92LedgerWrong]).toEqual([t.kept, t.errors])
    expect(r.b92!.rows).toHaveLength(B92_LEDGER.last)
    for (const track of ['ground', 'formal'] as const) {
      const c = pickTrack(b3, track).caption!
      expect(c, track).toContain(`${B92_LEDGER.count} qubits`)
      expect(c, track).toContain(`the last ${B92_LEDGER.last} rows drawn`)
      expect(c, track).toContain(String(t.kept))
      expect(c, track).toContain(String(t.errors))
    }
    expect(pickTrack(b3, 'ground').caption).toContain('“unsure” rows are her guesses')
    expect(b3.claims!.map((c) => c.text.split(' ')[0])).toEqual(expect.arrayContaining(['q15B92LedgerKept', 'q15B92LedgerWrong']))
  })
  it('the drawn rows tell the story of the text: a wrong kept bit sits in a row where Eve was unsure, and the run is near the exact rates', () => {
    const rounds = b92Rounds(B92_LEDGER.count, B92_LEDGER.seed, 'usd')
    for (const r of rounds) if (r.error) expect(r.eRead).toBe('unsure')
    const shown = rounds.slice(-B92_LEDGER.last)
    expect(shown.some((r) => r.kept && r.error)).toBe(true) // the picture shows at least one wrong kept bit
    expect(shown.some((r) => r.kept && r.eRead === 'click')).toBe(true) // and a kept bit after a sure reading, which is right
    expect(shown.some((r) => !r.kept)).toBe(true) // and a round Bob could not answer
    expect(V.q15B92LedgerWrong / V.q15B92LedgerKept).toBeCloseTo(V.q15QUsdEve, 1)
    expect(V.q15B92LedgerKept / B92_LEDGER.count).toBeCloseTo(V.q15B92Kept, 1)
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
    // the printed row adds up to more than the exact row of the engine's table, which is a distribution (sum 1)
    const E = eq66Check()
    expect(E.table[0][0].reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12)
    expect(V.q15Eq66PrintedSum).toBeGreaterThan(E.table[0][0].reduce((a, b) => a + b, 0) + 0.5)
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
  it('XOR: the correct cipher is 10110 ⊕ 01101 = 11011, and the decoy answers are OR, AND and the sum with its top carry dropped', () => {
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
