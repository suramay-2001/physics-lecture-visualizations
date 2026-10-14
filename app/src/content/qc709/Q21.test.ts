/**
 * Chapter Q21's own invariants (rulings qc709-Q21Q22.md): the three Corrections each checked at a revealing point, every decimal in a challenge read from `V`, the shape of
 * the chapter (units, beats, phases, notation beats), the engine facts the pictures rely on (which checks light, which syndromes coincide) and the book references.
 * (The generic lints, symbols before use, claims against numpy, derivation views, run in content.test.tsx, symbols.test.ts and claims.test.ts for every chapter.)
 */
import { describe, expect, it } from 'vitest'
import { codeSyndrome, pauliName } from '../../physics/qec/errors'
import { Pauli } from '../../physics/qec/pauli'
import { registeredCode } from '../../physics/qec/registry'
import { Q21 } from './Q21'
import Q21Source from './Q21.ts?raw'
import StorySource from './Q21.story.ts?raw'
import { GLOSSARY } from './Q21.glossary'
import { V } from './Q21.values'

const units = Q21.units
const beats = units.flatMap((u) => u.story ?? [])
const corr = (where: string) => Q21.corrections!.find((c) => c.where === where)!
const p = (n: number, letter: string, j: number) => Pauli.parse(Array.from({ length: n }, (_, i) => (i === j - 1 ? letter : 'I')).join(''))

describe('Q21 shape: seven units, thirty-three beats, seven clues, one Go-deeper beat, all books-phase', () => {
  it('has the planned units in order, with 5 + 5 + 4 + 5 + 4 + 5 + 5 beats', () => {
    expect(units.map((u) => u.id)).toEqual(['q21-classical', 'q21-bit-flip', 'q21-phase-flip', 'q21-shor', 'q21-digitize', 'q21-kl', 'q21-dfs'])
    expect(units.map((u) => (u.story ?? []).length)).toEqual([5, 5, 4, 5, 4, 5, 5])
    expect(beats).toHaveLength(33)
  })
  it('the phases run books → clue → deeper; no lecture or core beat; the only Go-deeper beat is the last of the dephasing unit', () => {
    expect(new Set(beats.map((b) => b.phase))).toEqual(new Set(['books', 'clue', 'deeper']))
    expect(beats.filter((b) => b.phase === 'clue')).toHaveLength(7)
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['q21-dfs:b5'])
    for (const u of units) expect((u.story ?? [])[0].phase, `${u.id} opens with a books beat`).toBe('books')
    for (const u of units.slice(0, 6)) expect((u.story ?? []).at(-1)!.phase, `${u.id} ends with its clue`).toBe('clue')
  })
  it('the four notation beats each introduce one entry, and every Go-deeper beat introduces none', () => {
    const intro = beats.filter((b) => b.introduces?.length).map((b) => [b.id, b.introduces!.join()])
    expect(intro).toEqual([
      ['q21-classical:b3', 'qc-syndrome'],
      ['q21-bit-flip:b1', 'qc-codeword'],
      ['q21-kl:b2', 'qc-kl-condition'],
      ['q21-kl:b4', 'qc-code-nk'],
    ])
    expect(GLOSSARY.filter((g) => g.introduces).map((g) => g.id)).toEqual(['qc-syndrome', 'qc-codeword', 'qc-kl-condition', 'qc-code-nk'])
    expect(beats.filter((b) => b.phase === 'deeper').every((b) => !b.introduces)).toBe(true)
  })
  it('no double square bracket opens a glossary tag by accident: the code symbol is written [\\![n, k]\\!]', () => {
    expect(Q21Source).not.toMatch(/\$\[\[/)
    const opens = [...StorySource.matchAll(/\[\[/g)].length
    const tags = [...StorySource.matchAll(/\[\[[a-z0-9-]+\|/g)].length
    expect(opens).toBeGreaterThan(10)
    expect(tags).toBe(opens)
  })
})

describe('Q21 Corrections (ruling R6): three boxes, each an engine computation at a point where the slip shows, worded "our calculation finds …"', () => {
  it('there are three, all the book’s, in the order of the pages', () => {
    expect(Q21.corrections!.map((c) => /pp?\. (\d+)/.exec(c.where)![1])).toEqual(['163', '164', '176'])
    for (const c of Q21.corrections!) {
      expect(c.source).toBe('book')
      expect(c.shouldSay.startsWith('Our calculation finds')).toBe(true)
      expect(c.check()).toBe(true)
    }
  })
  it('E1 (p. 163): a flip of qubit 2 makes both checks read −1 (the helpers read 11 with chance 1), and no flip reads +1, +1', () => {
    const rep = registeredCode('rep3')
    expect(codeSyndrome(rep, p(3, 'X', 2))).toEqual([-1, -1])
    expect(codeSyndrome(rep, Pauli.identity(3))).toEqual([1, 1])
    expect(V.q21BfSynX2).toBeCloseTo(1, 12)
    expect(corr('Bergou p. 163, the step that applies the fix for a flip of qubit 2').shouldSay).toContain('both checks read −1')
  })
  it('E2 (p. 164): the two big checks read (−1, +1), (−1, −1), (+1, −1) for a sign flip in groups 1, 2, 3', () => {
    const shor = registeredCode('shor9')
    const big = (j: number) => codeSyndrome(shor, p(9, 'Z', j)).slice(0, 2)
    expect([big(1), big(2), big(3)]).toEqual([[-1, 1], [-1, 1], [-1, 1]])
    expect([big(4), big(5), big(6)]).toEqual([[-1, -1], [-1, -1], [-1, -1]])
    expect([big(7), big(8), big(9)]).toEqual([[1, -1], [1, -1], [1, -1]])
    expect(corr('Bergou p. 164, the Shor code readings for the first group').shouldSay).toContain('(−1, +1) for a sign flip in group 1')
  })
  it('E3 (p. 176): moving the last term of Eq. 9.56 onto |0⟩⟨0| would give trace 1.24 at a = 0.6, b = 0.8, z = 0.5; the true trace is 1', () => {
    expect(V.q21PrintedTrace).toBeCloseTo(1 + V.q21A * V.q21B * V.q21Z60, 12)
    expect(V.q21PrintedTrace).toBeCloseTo(1.24, 12)
    expect(V.q21TrueTrace).toBeCloseTo(1, 12)
    expect(corr('Bergou p. 176, Eq. 9.56').shouldSay).toContain('1.24')
  })
})

describe('Q21 engine facts the pictures and captions rely on', () => {
  const shor = registeredCode('shor9')
  const lit = (e: Pauli) => shor.stabilizer.generators.filter((_, i) => codeSyndrome(shor, e)[i] === -1).map(pauliName)
  it('a bit flip on qubit 5 lights exactly Z4Z5 and Z5Z6', () => {
    expect(lit(p(9, 'X', 5)).sort()).toEqual(['Z4Z5', 'Z5Z6'])
  })
  it('Z1 and Z2 light the same checks (the degenerate pair); Y1 lights the checks of both X1 and Z1', () => {
    expect(lit(p(9, 'Z', 1))).toEqual(lit(p(9, 'Z', 2)))
    expect([...lit(p(9, 'Y', 1))].sort()).toEqual([...lit(p(9, 'X', 1)), ...lit(p(9, 'Z', 1))].sort())
  })
  it('the bit-flip code’s Y1 and X1 share a syndrome, which is why a decay K = (X + iY)/2 leaves a sign flip behind', () => {
    const rep = registeredCode('rep3')
    expect(codeSyndrome(rep, p(3, 'Y', 1))).toEqual(codeSyndrome(rep, p(3, 'X', 1)))
    expect(V.q21DampCoef).toBeCloseTo(Math.sqrt(0.36) / 2, 12)
  })
  it('the sizes and counts: 8 strings of 0.3536, 8 checks, 28 errors with 22 syndromes, 27 of 36 pairs corrected', () => {
    expect([V.q21ShorTerms, V.q21ShorChecks, V.q21ShorWt1, V.q21ShorDistinct, V.q21ShorW2Fixed, V.q21ShorW2]).toEqual([8, 8, 28, 22, 27, 36])
    expect(V.q21ShorBar).toBeCloseTo(1 / Math.sqrt(8), 12)
  })
  it('the quantum Hamming bound: 5 is the least n, 2·16 = 32 = 2⁵ exactly, Shor 56 ≤ 512, n = 4 needs 26 > 16', () => {
    expect([V.q21QhbMinN, V.q21Qhb5, V.q21Qhb5Rooms, V.q21QhbShorNeed, V.q21QhbShorHave, V.q21Qhb4Need, V.q21Qhb4Have]).toEqual([5, 32, 16, 56, 512, 26, 16])
  })
})

describe('Q21 challenges read their numbers from V', () => {
  /** Every value a challenge may quote: V itself, V squared, and the plain constants some hints quote. */
  const known: number[] = [...Object.values(V), ...Object.values(V).map((x) => x * x), 0.2, 0.04, 0.48, 0.6, 0.8, Math.sin(Math.PI / 4) ** 2, Math.cos(Math.PI / 6) ** 2]
  const decimals = (text: string): number[] =>
    [...text.replace(/(Eqs?\.|§|Problem|Unit|Theorem)\s*[\d.]+/g, ' ').matchAll(/(?<![\d.{])(\d+\.\d{2,})(?![\d])/g)].map((m) => Number(m[1]))
  const texts = (c: (typeof units)[number]['play'][number]): string[] => [
    c.prompt,
    ...c.hints.map((h) => h.text),
    ...(c.walkthrough ?? []).map((w) => w.text),
    ...(c.kind === 'choice' ? c.options.flatMap((o) => [o.text, o.why]) : []),
  ]
  it('every decimal with two or more places in a prompt, hint, walkthrough or option matches a value of V (or a named constant) to its shown precision', () => {
    const bad: string[] = []
    for (const u of units)
      for (const c of u.play)
        for (const t of texts(c))
          for (const x of decimals(t)) {
            const places = String(x).split('.')[1].length
            if (!known.some((v) => Math.abs(v - x) <= 0.5 * 10 ** -places + 1e-12)) bad.push(`${c.id}: ${x}`)
          }
    expect(bad).toEqual([])
  })
  it('three challenges per unit, 21 in all, each with exactly three hints and a full walkthrough', () => {
    expect(units.map((u) => u.play.length)).toEqual([3, 3, 3, 3, 3, 3, 3])
    for (const u of units) for (const c of u.play) {
      expect(c.hints, c.id).toHaveLength(3)
      expect(c.walkthrough?.length, c.id).toBeGreaterThan(0)
      expect(c.id.startsWith('q21-'), c.id).toBe(true)
    }
  })
  it('the answers are the engine’s: 0.104, 0.5, 0.05792, 0.5, 0.28, 8, 27, 0.7071, 16, 90, 5, 2, 0, 0.4157, 0.36', () => {
    const ans = Object.fromEntries(units.flatMap((u) => u.play).filter((c) => c.kind === 'numeric').map((c) => [c.id, (c as { answer: number }).answer]))
    expect(ans['q21-c-fail']).toBeCloseTo(0.104, 12)
    expect(ans['q21-c-even']).toBeCloseTo(0.5, 12)
    expect(ans['q21-c-five']).toBeCloseTo(0.05792, 12)
    expect(ans['q21-b-small']).toBeCloseTo(0.5, 12)
    expect(ans['q21-p-overlap']).toBeCloseTo(0.28, 12)
    expect(ans['q21-s-terms']).toBe(8)
    expect(ans['q21-s-pairs']).toBe(27)
    expect(ans['q21-d-ci']).toBeCloseTo(Math.SQRT1_2, 12)
    expect(ans['q21-d-count']).toBe(16)
    expect(ans['q21-d-w2']).toBe(90)
    expect(ans['q21-k-min']).toBe(5)
    expect(ans['q21-k-eig']).toBeCloseTo(2, 12)
    expect(Math.abs(ans['q21-f-z'])).toBeLessThan(1e-12)
    expect(ans['q21-f-off']).toBeCloseTo(0.48 * Math.cos(Math.PI / 6), 12)
    expect(ans['q21-f-ind']).toBeCloseTo(0.36, 12)
  })
})

describe('Q21 references: the pages and equations the books list are the ones the text cites', () => {
  const where = (unit: string, source: 'bergou' | 'nc') => units.find((u) => u.id === unit)!.books.find((b) => b.source === source)?.where
  it('each unit cites its Bergou pages (161–169, 175–177) and N&C sections', () => {
    expect(where('q21-classical', 'bergou')).toBe('§9.1, p. 161')
    expect(where('q21-bit-flip', 'bergou')).toBe('§9.1, pp. 162–163, Eqs. 9.1–9.2')
    expect(where('q21-phase-flip', 'bergou')).toBe('§9.1, p. 163')
    expect(where('q21-shor', 'bergou')).toBe('§9.1, pp. 163–164, Eq. 9.3')
    expect(where('q21-digitize', 'bergou')).toBe('§9.1, pp. 164–165, Eqs. 9.4–9.9')
    expect(where('q21-kl', 'bergou')).toBe('§9.1, pp. 165–169, Eqs. 9.8–9.34')
    expect(where('q21-dfs', 'bergou')).toBe('§9.3, pp. 175–177, Eqs. 9.55–9.59')
    expect(where('q21-dfs', 'nc')).toBeUndefined()
    expect(where('q21-kl', 'nc')).toBe('§10.3, p. 436 and §10.3.4, pp. 444–445')
  })
  it('Bergou’s end-of-chapter problems for Chapter 9 are cited only: no challenge id mentions them', () => {
    const ids = units.flatMap((u) => u.play.map((c) => c.id)).join(' ')
    expect(ids).not.toMatch(/p9|9-1|9-2|9-3|9-4/)
    expect(JSON.stringify(beats)).not.toMatch(/P9\.\d/)
  })
})
