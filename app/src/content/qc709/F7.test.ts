/**
 * Chapter F7's own invariants (rulings qc709-F7F8.md): the unit order and sizes, ⊕ introduced by the half-adder beat, the two `introduces` on ids Q4 and Q16 own,
 * the check matrix called M with its one Rosetta line, the mixing-gate clue with its bridge chip, N&C Ex. 3.8 and Bergou P1.3–P1.4 cited and not set, the bridges
 * into and out of F7, and every challenge answer recomputed by plain arithmetic instead of read from the content file. (The generic lints, symbols before use,
 * claims against numpy, derivation views, run in content.test.tsx, symbols.test.ts and claims.test.ts for every chapter.)
 */
import { describe, expect, it } from 'vitest'
import type { ChoiceChallenge, NumericChallenge } from '../schema'
import { BRIDGES } from './bridges'
import { F7 } from './F7'
import { GLOSSARY } from './F7.glossary'
import { Q15 } from './Q15'
import { Q16 } from './Q16'
import { Q17 } from './Q17'
import { Q4 } from './Q4'
import { Q5 } from './Q5'
import { QC_GLOSSARY } from './pack'

const beats = F7.units.flatMap((u) => u.story ?? [])
const beat = (id: string) => beats.find((b) => b.id === id)!
const choose = (a: number, b: number): number => (b === 0 ? 1 : (choose(a - 1, b - 1) * a) / b)

describe('F7 structure', () => {
  it('has the five units in the ruled order, 27 beats, 7 derivations, 16 challenges and 5 clues', () => {
    expect(F7.units.map((u) => u.id)).toEqual(['f7-boolean', 'f7-reversible', 'f7-xor', 'f7-gf2', 'f7-cost'])
    expect(F7.units.map((u) => (u.story ?? []).length)).toEqual([5, 6, 6, 5, 5])
    expect(beats.filter((b) => b.derivation).map((b) => b.id)).toEqual(['f7-boolean:b2', 'f7-reversible:b1', 'f7-reversible:b3', 'f7-xor:b3', 'f7-xor:b5', 'f7-gf2:b4', 'f7-cost:b2'])
    expect(F7.units.flatMap((u) => u.play)).toHaveLength(16)
    expect(beats.filter((b) => b.phase === 'clue').map((b) => b.id)).toEqual(['f7-boolean:b5', 'f7-reversible:b6', 'f7-xor:b6', 'f7-gf2:b5', 'f7-cost:b5'])
  })
  it('runs core → books → clue in every unit, with no lecture and no go-deeper beat (a Foundations chapter)', () => {
    const rank = { core: 0, books: 1, clue: 2 } as Record<string, number>
    for (const u of F7.units) {
      const phases = (u.story ?? []).map((b) => b.phase)
      expect(phases.every((p) => p in rank), u.id).toBe(true)
      expect(phases, u.id).toEqual([...phases].sort((a, b) => rank[a] - rank[b]))
    }
  })
  it('has no sheet item: no challenge is marked assigned, so every one carries a walkthrough', () => {
    const play = F7.units.flatMap((u) => u.play)
    expect(play.filter((c) => c.assigned)).toEqual([])
    for (const c of play) expect(c.walkthrough.length, c.id).toBeGreaterThan(0)
  })
  it('keeps a bridge-only reference to every other chapter by name: no plan id and no bare "Unit F…" number in learner text', () => {
    // a bridge chip's shown text may read "Unit F6.1"; nothing else may
    const all = JSON.stringify([F7.units.map((u) => [u.story, u.play, u.review, u.insight, u.insightFormal])]).replace(/<<[^>]*>>/g, ' ')
    expect(all).not.toMatch(/P-F7|qc709-F7|\bUnit F\d\.\d/)
  })
})

describe('F7 notation beats and glossary', () => {
  it('introduces ⊕ at the half-adder (boolean:b4) and the bit dot product at xor:b4, on ids Q4 and Q16 own (no duplicate ids)', () => {
    expect(beat('f7-boolean:b4').introduces).toEqual(['qc-xor'])
    expect(beat('f7-xor:b4').introduces).toEqual(['qc-bit-dot'])
    const mine = new Set(GLOSSARY.map((g) => g.id))
    expect(mine.has('qc-xor') || mine.has('qc-bit-dot')).toBe(false)
    expect(QC_GLOSSARY.find((g) => g.id === 'qc-xor')!.first).toBe('q4-cnot:b2')
    expect(QC_GLOSSARY.find((g) => g.id === 'qc-bit-dot')!.first).toBe('q16-hadamard-n:b2')
    // ⊕ is not used in a beat before the half-adder, in either track
    const before = beats.slice(0, beats.findIndex((b) => b.id === 'f7-boolean:b4'))
    for (const b of before) expect(JSON.stringify([b.text, b.formal, b.caption, b.captionFormal, b.derivation]), b.id).not.toContain('\\\\oplus')
  })
  it('defines twelve new glossary ids, each first used in a beat of this chapter, and none repeats a term of another chapter', () => {
    expect(GLOSSARY).toHaveLength(12)
    const ids = new Set(beats.map((b) => b.id))
    for (const g of GLOSSARY) expect(ids.has(g.first), g.id).toBe(true)
    const others = QC_GLOSSARY.filter((g) => !g.first.startsWith('f7-'))
    for (const g of GLOSSARY) {
      expect(others.some((o) => o.id === g.id), `${g.id} id`).toBe(false)
      expect(others.some((o) => o.term.toLowerCase() === g.term.toLowerCase()), `${g.id} term`).toBe(false)
    }
  })
  it('uses one notation beat per new notation or space', () => {
    const intro = beats.flatMap((b) => b.introduces ?? []).sort()
    expect(intro).toEqual(['qc-big-o', 'qc-bit-dot', 'qc-boolean-function', 'qc-gf2', 'qc-hamming-weight', 'qc-parity-check', 'qc-permutation-matrix', 'qc-reversible-gate', 'qc-truth-table', 'qc-xor'])
  })
})

describe('F7 rulings', () => {
  it('R5: the check matrix is M, with one Rosetta line naming Bergou’s H and saying it is not the Hadamard (gf2:b3 Formal only)', () => {
    const b = beat('f7-gf2:b3')
    expect(b.formal).toContain('A check matrix $M$ (Bergou’s $H$, not the Hadamard)')
    expect(b.text).not.toContain('Bergou')
    const rosetta = beats.filter((x) => /Bergou’s \$H\$/.test(`${x.text} ${x.formal}`))
    expect(rosetta.map((x) => x.id)).toEqual(['f7-gf2:b3'])
  })
  it('R6: the mixing-gate clue names its H gates in words in both tracks, with a bridge chip to Chapter Q4’s Hadamard unit', () => {
    const b = beat('f7-reversible:b6')
    expect(b.text).toContain('two mixing gates, labelled H')
    expect(b.formal).toContain('two mixing gates $H$')
    for (const t of [b.text, b.formal!]) expect(t).toContain('<<qc-q4-one-qubit-gates|')
    expect(BRIDGES['qc-q4-one-qubit-gates']).toMatchObject({ lecture: 'Q4', unit: 'q4-one-qubit-gates' })
    expect(Q4.units.map((u) => u.id)).toContain('q4-one-qubit-gates')
  })
  it('R2: the map’s binary-strings unit is folded into boolean:b1 with a bridge to F6', () => {
    expect(beat('f7-boolean:b1').text).toContain('<<qc-f6-pairs|')
    expect(BRIDGES['qc-f6-pairs'].lecture).toBe('F6')
  })
  it('R8: N&C Ex. 3.8 and Bergou P1.3–P1.4 are cited and starred, never worked (no challenge builds on them)', () => {
    const books = F7.units.flatMap((u) => u.books.map((r) => `${r.where} ${r.adds}`)).join(' | ')
    for (const s of ['Ex. 3.8', 'Problem 1.3', 'Problem 1.4']) expect(books, s).toContain(s)
    expect(books).toContain('No course sheet assigns it')
    expect(beat('f7-boolean:b4').formal).toContain('N&C ⚑ Ex. 3.8')
  })
  it('the bridges into F7 from Q4, Q16 and Q17 exist, resolve to F7 units, and are each used by a beat there', () => {
    const into = { 'qc-f7-boolean': 'f7-boolean', 'qc-f7-reversible': 'f7-reversible', 'qc-f7-xor': 'f7-xor', 'qc-f7-cost': 'f7-cost' } as const
    const where = JSON.stringify([Q4.units.map((u) => u.story), Q16.units.map((u) => u.story), Q17.units.map((u) => u.story)])
    for (const [id, unit] of Object.entries(into)) {
      expect(BRIDGES[id], id).toMatchObject({ course: 'qc709', lecture: 'F7', unit })
      expect(F7.units.map((u) => u.id)).toContain(unit)
      expect(where.includes(`<<${id}|`), id).toBe(true)
    }
    // the two beats the rulings name for Q4 and Q17, and the dot-product pairing of Q16
    expect(JSON.stringify(Q4.units.find((u) => u.id === 'q4-cnot')!.story!.find((b) => b.id === 'q4-cnot:b2'))).toContain('<<qc-f7-xor|')
    expect(JSON.stringify(Q16.units.find((u) => u.id === 'q16-hadamard-n')!.story!.find((b) => b.id === 'q16-hadamard-n:b3'))).toContain('<<qc-f7-xor|')
    expect(JSON.stringify(Q17.units.find((u) => u.id === 'q17-oracle')!.story!.find((b) => b.id === 'q17-oracle:b1'))).toContain('<<qc-f7-cost|')
  })
  it('the bridges into F7 from Q5 (boolean, reversible) and Q15 (XOR) sit on the beats the F7 plan names, in both tracks where it says so', () => {
    const find = (L: typeof Q5, id: string) => L.units.flatMap((u) => u.story ?? []).find((b) => b.id === id)!
    for (const [L, id, bridge, tracks] of [
      [Q5, 'q5-problem:b1', 'qc-f7-boolean', ['text', 'formal']],
      [Q5, 'q5-oracle:b1', 'qc-f7-reversible', ['text']],
      [Q5, 'q5-oracle:b5', 'qc-f7-reversible', ['text', 'formal']],
      [Q15, 'q15-otp:b2', 'qc-f7-xor', ['text', 'formal']],
    ] as const)
      for (const t of tracks) expect(find(L, id)[t], `${id} ${t}`).toContain(`<<${bridge}|`)
  })
})

describe('F7 challenge answers, recomputed by plain arithmetic', () => {
  const answer = (id: string): number => (F7.units.flatMap((u) => u.play).find((c) => c.id === id) as NumericChallenge).answer
  it('counts: the rows of AND with a 1, 2^(2^3) functions, C(8,4) balanced, 4! reversible two-bit maps', () => {
    expect(answer('f7-b-and')).toBe([0, 1, 2, 3].filter((x) => (x >> 1) & x & 1).length)
    expect(answer('f7-b-count')).toBe(2 ** (2 ** 3))
    expect(answer('f7-b-bal')).toBe(choose(8, 4))
    expect(answer('f7-r-perm')).toBe(4 * 3 * 2 * 1)
    expect(answer('f7-r-and0')).toBe([0b00, 0b01, 0b10, 0b11].filter((x) => ((x >> 1) & x & 1) === 0).length)
  })
  it('the garbage chance (3/4)² + (1/4)², the dot product 110·011, the signs of 110·x, the distance of 1011 and 0110, the syndrome 110 read in binary', () => {
    expect(answer('f7-r-garbage')).toBeCloseTo(0.75 ** 2 + 0.25 ** 2, 12)
    expect(answer('f7-x-dot')).toBe((1 * 0 + 1 * 1 + 0 * 1) % 2)
    expect(answer('f7-x-sum')).toBe(Array.from({ length: 8 }, (_, x) => ((((x >> 2) & 1) + ((x >> 1) & 1)) % 2 ? -1 : 1)).reduce((s, v) => s + v, 0))
    expect(answer('f7-g-dist')).toBe([...'1011'].filter((c, i) => c !== '0110'[i]).length)
    expect(answer('f7-g-syn')).toBe(parseInt('110', 2))
  })
  it('cost: n(n−1)/2 at 10, the least n with n² − 5n − 7 ≥ 0 from then on, Grover’s nearest integer to (π/4)√N − ½ at N = 2²⁰', () => {
    expect(answer('f7-c-sort')).toBe((10 * 9) / 2)
    let n0 = 1
    for (let n = 1; n < 1000; n++) if (n * n - 5 * n - 7 < 0) n0 = n + 1
    expect(answer('f7-c-n0')).toBe(n0)
    expect(answer('f7-c-grover')).toBe(Math.round((Math.PI / 4) * 1024 - 0.5))
  })
  it('the choice challenges mark exactly one right option: Toffoli on 110 → 111, 1011 ⊕ 0110 → 1101, the null vector 110', () => {
    const pick = (id: string) => (F7.units.flatMap((u) => u.play).find((c) => c.id === id) as ChoiceChallenge).options
    for (const [id, text] of [['f7-r-tof', '$111$'], ['f7-x-xor', '$1101$'], ['f7-g-null', '$110$']] as const) {
      const right = pick(id).filter((o) => o.correct)
      expect(right.map((o) => o.text), id).toEqual([text])
    }
    // the XOR is 1101 place by place; the null vector satisfies both checks and no other option does
    expect([...'1011'].map((c, i) => Number(c) ^ Number('0110'[i])).join('')).toBe('1101')
    const dot = (a: string, b: string) => [...a].reduce((s, c, i) => s + Number(c) * Number(b[i]), 0) % 2
    const ok = (s: string) => dot('001', s) === 0 && dot('111', s) === 0
    expect(['110', '001', '111', '101'].filter(ok)).toEqual(['110'])
  })
})
