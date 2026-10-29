/**
 * Chapter Q27's own invariants (rulings qc709-Q20-Q27.md Z1-Z7): the shape of the chapter (six units, 37 beats, six clues, two Go-deeper beats, all books-phase), the two notation
 * beats, the six derivations, the two proposed Corrections (Z3: "our calculation finds ...", shown at a revealing point, for the independent review to confirm), the Rosetta lines,
 * the experiment-free rule (Z2), every numeric answer of a challenge read from `V`, and the book references. (The generic lints, symbols before use, claims against numpy, derivation
 * views, run in content.test.tsx, symbols.test.ts and claims.test.ts for every chapter.)
 */
import { describe, expect, it } from 'vitest'
import { Q27 } from './Q27'
import { GLOSSARY } from './Q27.glossary'
import { C_CZD, V } from './Q27.values'
import { chargeH, twoLevelCut } from '../../physics/qc/solid'
import { circuitUnitary } from '../../physics/qc/circuit'

const units = Q27.units
const beats = units.flatMap((u) => u.story ?? [])
const beat = (id: string) => beats.find((b) => b.id === id)!
const strings = (): string[] => {
  const out: string[] = []
  for (const b of beats) {
    out.push(b.text, b.formal ?? '', b.caption ?? '', b.captionFormal ?? '')
    if (b.reveal) out.push(b.reveal.text, b.reveal.formal ?? '', b.reveal.caption ?? '', b.reveal.captionFormal ?? '')
    for (const s of [...(b.derivation?.ground ?? []), ...(b.derivation?.formal ?? [])]) out.push(s.why, s.tex)
  }
  for (const u of units) out.push(u.insight, u.insightFormal ?? '', ...(u.pitfalls ?? []), u.lecture.summary, ...(u.visual.tryThis ?? []))
  return out
}

describe('Q27 shape: six units, 37 beats, six clues, two Go-deeper beats, all books-phase', () => {
  it('has the planned units in order, with 6 + 4 + 5 + 9 + 5 + 8 beats', () => {
    expect(units.map((u) => u.id)).toEqual(['q27-lc', 'q27-superconductivity', 'q27-josephson', 'q27-transmon', 'q27-cqed', 'q27-dots'])
    expect(units.map((u) => (u.story ?? []).length)).toEqual([6, 4, 5, 9, 5, 8])
    expect(beats).toHaveLength(37)
  })
  it('the phases run books → clue → deeper; each Go-deeper beat is the last of its unit and no unit opens with one', () => {
    expect(new Set(beats.map((b) => b.phase))).toEqual(new Set(['books', 'clue', 'deeper']))
    expect(beats.filter((b) => b.phase === 'clue').map((b) => b.id)).toEqual(['q27-lc:b6', 'q27-superconductivity:b4', 'q27-josephson:b5', 'q27-transmon:b8', 'q27-cqed:b5', 'q27-dots:b7'])
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['q27-transmon:b9', 'q27-dots:b8'])
    for (const u of units) {
      const s = u.story ?? []
      expect(s[0].phase, `${u.id} opens with a books beat`).toBe('books')
      s.forEach((b, i) => b.phase === 'deeper' && expect(i, `${b.id} is the last beat`).toBe(s.length - 1))
    }
  })
  it('the two notation beats each introduce one entry, at or before its first use', () => {
    const intro = beats.filter((b) => b.introduces?.length).map((b) => [b.id, b.introduces!.join()])
    expect(intro).toEqual([
      ['q27-lc:b3', 'qc-flux-charge'],
      ['q27-transmon:b1', 'qc-charging-energy'],
    ])
    expect(GLOSSARY.filter((g) => g.introduces).map((g) => [g.id, g.introduces, g.first])).toEqual([
      ['qc-flux-charge', 'notation', 'q27-lc:b3'],
      ['qc-charging-energy', 'notation', 'q27-transmon:b1'],
    ])
    expect(GLOSSARY).toHaveLength(20)
  })
  it('six derivations (Ground 20 steps, Formal 13), each with at least as many Ground-up steps as Formal ones', () => {
    const ds = beats.filter((b) => b.derivation)
    expect(ds.map((b) => b.id)).toEqual(['q27-superconductivity:b3', 'q27-josephson:b1', 'q27-transmon:b2', 'q27-transmon:b5', 'q27-cqed:b3', 'q27-dots:b6'])
    for (const b of ds) expect(b.derivation!.ground.length, b.id).toBeGreaterThanOrEqual(b.derivation!.formal!.length)
    expect(ds.reduce((n, b) => n + b.derivation!.ground.length, 0)).toBe(20)
    expect(ds.reduce((n, b) => n + b.derivation!.formal!.length, 0)).toBe(13)
  })
  it('twenty challenges, each with exactly three hints and a full walkthrough (no sheet assigns any of them); two are choices', () => {
    expect(units.map((u) => u.play.length)).toEqual([3, 3, 3, 4, 3, 4])
    for (const u of units)
      for (const c of u.play) {
        expect(c.hints, c.id).toHaveLength(3)
        expect(c.walkthrough?.length ?? 0, c.id).toBeGreaterThan(0)
        expect(c.assigned, c.id).toBeFalsy()
      }
    expect(units.flatMap((u) => u.play).filter((c) => c.kind === 'choice').map((c) => c.id)).toEqual(['q27-s-charge', 'q27-t-ratio'])
    expect(units.flatMap((u) => u.play).filter((c) => c.kind === 'numeric')).toHaveLength(18)
  })
})

describe('Q27 numbers: every numeric answer is a value of the engine, never typed', () => {
  const answers: Record<string, number[]> = {
    'q27-l-f': [V.q27LcFreqGHz],
    'q27-l-p0': [V.q27P01K],
    'q27-l-t99': [Math.round(V.q27T99mK)],
    'q27-s-phi0': [V.q27Phi0],
    'q27-s-loop': [V.q27FluxLoop],
    'q27-j-freq': [Math.round(V.q27JosephsonMHzPerUV)],
    'q27-j-f60': [V.q27F60Ratio],
    'q27-j-squid': [V.q27SquidHalfFlux],
    'q27-t-spread': [V.q27F01spread1],
    'q27-t-anh': [-V.q27Anh10],
    'q27-t-fac': [Math.round(V.q27DispRatio1020)],
    'q27-c-coop': [V.q27Coop],
    'q27-c-iswap': [Math.round(V.q27IswapNs)],
    'q27-c-ratio': [Math.round(V.q27ReadoutRatio)],
    'q27-d-f': [V.q27Zeeman01GHz],
    'q27-d-pi': [Math.round(V.q27PiTimeNs)],
    'q27-d-half': [V.q27HalfSwapP],
    'q27-d-b5': [V.q27ZeemanB5GHz],
  }
  it('each numeric challenge answers with its engine value, whole numbers at tolerance 0 and decimals at 0.005', () => {
    for (const c of units.flatMap((u) => u.play).filter((x) => x.kind === 'numeric')) {
      if (c.kind !== 'numeric') continue
      expect(answers[c.id], c.id).toBeDefined()
      expect(c.answer, c.id).toBe(answers[c.id][0])
      expect(c.tolerance, c.id).toBe(Number.isInteger(c.answer) ? 0 : 0.005)
    }
  })
  it('the integer answers are 55, 484, 967, 250, 2000 and 50', () => {
    expect([55, 484, 967, 250, 2000, 50]).toEqual([
      Math.round(V.q27T99mK),
      Math.round(V.q27JosephsonMHzPerUV),
      Math.round(V.q27DispRatio1020),
      Math.round(V.q27IswapNs),
      Math.round(V.q27ReadoutRatio),
      Math.round(V.q27PiTimeNs),
    ])
  })
})

describe('Q27 rulings: Z2 no hardware digits, Z3 two Corrections for the review to confirm, a Rosetta line for each clash', () => {
  it('there is no reported (experimental) number: no `reported` or `trail` field on any beat', () => {
    for (const b of beats) {
      expect((b as { reported?: unknown }).reported, b.id).toBeUndefined()
      expect((b as { trail?: unknown }).trail, b.id).toBeUndefined()
    }
  })
  it('experimental figures appear in words only: the words are there and no digit sits next to them', () => {
    const all = strings().join(' ')
    expect(all).not.toMatch(/coherence times? of [\d$]/i)
    expect(all).not.toMatch(/fidelit(?:y|ies) (?:of|above|near) \d/i)
    expect(beat('q27-cqed:b2').formal).toContain('Atoms in cavities have reached a far smaller value (words only)')
    expect(beat('q27-dots:b2').formal).toContain('described there and not repeated as numbers')
    expect(beat('q27-dots:b8').formal).toContain('are in the book in words, and we do not repeat them')
    expect(beat('q27-transmon:b9').formal).toContain('We reproduce and compute no number from those pages')
  })
  it('model inputs are labelled as ours, the book’s illustration or round numbers, not measurements', () => {
    expect(beat('q27-lc:b2').formal).toContain('Model (ours, the book')
    expect(beat('q27-cqed:b2').formal).toContain('not measurements')
    expect(beat('q27-cqed:b1').formal).toContain('(model, ours)')
    expect(beat('q27-dots:b8').text).toContain('(model, ours)')
  })
  it('two Corrections, worded “our calculation finds”, and each check holds on the engine', () => {
    expect(Q27.corrections).toHaveLength(2)
    expect(Q27.corrections!.map((c) => c.where)).toEqual(['Bergou p. 281, Eq. 15.9', 'Bergou p. 284, the charge dispersion'])
    for (const c of Q27.corrections!) {
      expect(c.shouldSay.startsWith('Our calculation finds'), c.where).toBe(true)
      expect(c.check(), c.where).toBe(true)
      expect(c.source).toBe('book')
    }
  })
  it('K1: the sigma_z coefficient of the 2 × 2 block of Eq. 15.8 is +0.2, the printed form −0.2 (the block is read off the matrix, not typed)', () => {
    const H = chargeH(1, 0.2, 0.3, 1)
    expect((H[2][2].re - H[1][1].re) / 2).toBeCloseTo(0.2, 12)
    expect(twoLevelCut(1, 0.2, 0.3).zco).toBeCloseTo(0.2, 12)
    expect(V.q27ZcoTrue).toBe(0.2)
    expect(V.q27ZcoPrinted).toBe(-0.2)
    expect(H[2][2].re).toBeGreaterThan(H[1][1].re)
  })
  it('K2: the printed exponent is off by five orders of magnitude at ratio 10; the √(32 r) exponent is within 5 % and 4 %', () => {
    expect(V.q27DispPrintedLog10).toBeGreaterThan(5)
    expect(V.q27KochErr10).toBeGreaterThan(0.04)
    expect(V.q27KochErr10).toBeLessThan(0.06)
    expect(V.q27KochErr20).toBeGreaterThan(0.03)
    expect(V.q27KochErr20).toBeLessThan(0.05)
  })
  it('Eq. 15.14 has no box: it holds exactly with the book’s own phase', () => {
    expect(V.q27Cz1514Gap).toBeLessThan(1e-12)
    expect(V.q27CzCircuitGap).toBeLessThan(1e-12)
    expect(beat('q27-dots:b6').formal).toContain('is CZ (Eq. 15.14, checked on the page image)')
    expect(Q27.corrections!.some((c) => c.where.includes('15.14'))).toBe(false)
    const U = circuitUnitary(C_CZD)
    expect(U.length).toBe(4)
  })
  it('Rosetta lines: the book’s E_C is four times the common one (transmon:b1), the spin |0⟩ is the upper level (dots:b1), the sign convention of Eq. 15.13 (dots:b5), the sign of Δ (review card)', () => {
    expect(beat('q27-transmon:b1').formal).toContain('Rosetta: the common charging energy')
    expect(beat('q27-transmon:b1').text).toContain('Here $E_C$ counts pairs')
    expect(beat('q27-dots:b1').formal).toContain('Here $|0\\rangle$ is the upper level')
    expect(beat('q27-dots:b5').formal).toContain('the page\'s first expression has the opposite sign convention')
  })
})

describe('Q27 references: every unit cites Bergou Chapter 15 by section and printed page, and no source text is pasted', () => {
  it('each unit has one Bergou reference in §15 and a pages line with printed pages', () => {
    for (const u of units) {
      expect(u.books, u.id).toHaveLength(1)
      expect(u.books[0].source).toBe('bergou')
      expect(u.books[0].where, u.id).toMatch(/^§15\.\d/)
      expect(u.lecture.pages, u.id).toMatch(/Bergou §15\.\d.*pp\. 2[6-9]\d/)
    }
  })
  it('problems P15.1–P15.4 are cited only, never worked', () => {
    expect(strings().join(' ')).not.toMatch(/P15\.[1-4]/)
  })
})
