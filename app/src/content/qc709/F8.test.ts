/**
 * Chapter F8's own invariants (rulings qc709-F7F8.md R1–R8): the unit order and sizes, the running example N = 21, x = 2, r = 6 on a 32-input comb, Euler's count in words
 * once (no φ(N)), the Q18 material left to Q18, N&C Ex. 5.1 derived in full and starred, Bergou P3.3 cited only, the bridges out of F8 and into it from Q11 and Q16, and every
 * challenge answer recomputed by plain arithmetic instead of read from the content file. (The generic lints, symbols before use, claims against numpy, derivation views, run
 * in content.test.tsx, symbols.test.ts and claims.test.ts for every chapter.)
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FigureFor } from '../../stage/figures/FigureFor'
import { validateLayout, validateStage } from '../../stage/resolve'
import '../../stage/svg/kinds'
import type { ChoiceChallenge, NumericChallenge, StageLayout } from '../schema'
import { layoutStates } from '../stage'
import { derivationSteps } from '../track'
import { BRIDGES } from './bridges'
import { F8 } from './F8'
import { GLOSSARY } from './F8.glossary'
import { COMB32, LISTS, V } from './F8.values'
import { Q11 } from './Q11'
import { Q16 } from './Q16'
import { QC_GLOSSARY } from './pack'

const beats = F8.units.flatMap((u) => u.story ?? [])
const beat = (id: string) => beats.find((b) => b.id === id)!
const answer = (id: string): number => (F8.units.flatMap((u) => u.play).find((c) => c.id === id) as NumericChallenge).answer
/** Everything a learner reads in F8, bridge chips taken out. */
const learnerText = JSON.stringify(F8.units.map((u) => [u.story, u.play, u.review, u.insight, u.insightFormal, u.pitfalls, u.visual.tryThis]), (k, v) => (k === 'stage' || k === 'view' || k === 'claims' || k === 'viewCaption' ? undefined : v)).replace(/<<[^>]*>>/g, ' ')

/** Euclid's quotients by plain integer arithmetic (no engine). */
const quotients = (p: number, q: number): number[] => {
  const out: number[] = []
  while (q) {
    out.push(Math.floor(p / q))
    ;[p, q] = [q, p % q]
  }
  return out
}
const gcdPlain = (a: number, b: number): number => (b ? gcdPlain(b, a % b) : a)

describe('F8 structure', () => {
  it('has the six units in the ruled order, 28 beats, 8 derivations, 18 challenges and 6 clues', () => {
    expect(F8.units.map((u) => u.id)).toEqual(['f8-clock', 'f8-euclid', 'f8-roots', 'f8-dft', 'f8-geometric', 'f8-fractions'])
    expect(F8.units.map((u) => (u.story ?? []).length)).toEqual([4, 5, 4, 5, 5, 5])
    expect(beats.filter((b) => b.derivation).map((b) => b.id)).toEqual(['f8-euclid:b1', 'f8-roots:b1', 'f8-roots:b2', 'f8-roots:b3', 'f8-dft:b2', 'f8-dft:b3', 'f8-geometric:b3', 'f8-fractions:b2'])
    expect(F8.units.flatMap((u) => u.play)).toHaveLength(18)
    expect(beats.filter((b) => b.phase === 'clue').map((b) => b.id)).toEqual(['f8-clock:b4', 'f8-euclid:b5', 'f8-roots:b4', 'f8-dft:b5', 'f8-geometric:b5', 'f8-fractions:b5'])
  })
  it('runs core → books → clue in every unit, with no lecture and no go-deeper beat (a Foundations chapter)', () => {
    const rank = { core: 0, books: 1, clue: 2 } as Record<string, number>
    for (const u of F8.units) {
      const phases = (u.story ?? []).map((b) => b.phase)
      expect(phases.every((p) => p in rank), u.id).toBe(true)
      expect(phases, u.id).toEqual([...phases].sort((a, b) => rank[a] - rank[b]))
    }
    expect(beats.filter((b) => b.phase === 'books').map((b) => b.id)).toEqual(['f8-euclid:b4', 'f8-geometric:b4'])
  })
  it('has no sheet item: no challenge is marked assigned, so every one carries a walkthrough; there is no Corrections box', () => {
    const play = F8.units.flatMap((u) => u.play)
    expect(play.filter((c) => c.assigned)).toEqual([])
    for (const c of play) expect(c.walkthrough.length, c.id).toBeGreaterThan(0)
    expect(F8.corrections).toBeUndefined()
  })
  it('keeps every other chapter by name: no plan id and no bare "Unit F…" number in learner text', () => {
    expect(learnerText).not.toMatch(/P-F8|qc709-F7F8|\bUnit F\d\.\d|Unit 8\.\d/)
  })
  it('draws each unit in the kinds the plan names, and never repeats a kind in a split', () => {
    const kinds = (id: string) => [...new Set((F8.units.find((u) => u.id === id)!.story ?? []).flatMap((b) => JSON.stringify([b.stage, b.reveal?.stage]).match(/"kind":"([a-z-]+)"/g) ?? []))].map((s) => s.slice(8, -1)).sort()
    expect(kinds('f8-clock')).toEqual(['amplitudes', 'complex-plane'])
    expect(kinds('f8-euclid')).toEqual(['complex-plane'])
    expect(kinds('f8-roots')).toEqual(['complex-plane'])
    expect(kinds('f8-dft')).toEqual(['amplitudes', 'matrix'])
    expect(kinds('f8-geometric')).toEqual(['complex-plane', 'plot'])
    expect(kinds('f8-fractions')).toEqual(['amplitudes', 'complex-plane'])
  })
})

describe('F8 pictures: every stage validates and prints', () => {
  /** Every distinct stage a reader meets: the beat's own, a clue's reveal, and each track's derivation views. */
  const layouts: { id: string; layout: StageLayout }[] = beats.flatMap((bt) => [
    { id: bt.id, layout: bt.stage },
    ...(bt.reveal?.stage ? [{ id: `${bt.id} reveal`, layout: bt.reveal.stage }] : []),
    ...(['ground', 'formal'] as const).flatMap((t) => derivationSteps(bt, t).flatMap((st, i) => (st.view ? [{ id: `${bt.id} ${t}[${i}]`, layout: st.view }] : []))),
  ])
  it('has a stage for every beat and reveal and a view for every derivation step that names one (sixty-odd pictures)', () => {
    expect(layouts.length).toBeGreaterThan(60)
  })
  it('every stage passes the kind’s own validation (and a split its layout check), so nothing is drawn that the kind would refuse', () => {
    for (const { id, layout } of layouts) {
      if ('layout' in layout) {
        expect(validateLayout(layout), id).toEqual([])
        for (const pane of layoutStates(layout)) expect(validateStage(pane), id).toEqual([])
      } else expect(validateStage(layout), id).toEqual([])
    }
  })
  it('every stage prints as a figure with its passport title and no NaN, Infinity or undefined', () => {
    for (const { id, layout } of layouts) {
      const html = renderToString(createElement(FigureFor, { layout, number: 'F8.1', course: 'qc709' }))
      expect(html, id).toContain('print-figure')
      expect(html, id).not.toMatch(/NaN|Infinity|undefined/)
    }
  })
  it('the clock pictures print their marks (clock units) and the roots pictures print their arrows', () => {
    const html = renderToString(createElement(FigureFor, { layout: beat('f8-clock:b2').stage, number: 'F8.2', course: 'qc709' }))
    for (const mark of ['>1<', '>2<', '>4<', '>8<', '>16<', '>11<']) expect(html, mark).toContain(mark)
    const star = renderToString(createElement(FigureFor, { layout: beat('f8-roots:b3').stage, number: 'F8.3', course: 'qc709' }))
    expect(star).toContain('data-kinds="complex-plane"')
  })
})

describe('F8 notation beats and glossary', () => {
  it('uses one notation beat per new notation, in the beats the plan names', () => {
    const intro = beats.filter((b) => b.introduces).map((b) => [b.id, b.introduces] as const)
    expect(intro).toEqual([
      ['f8-clock:b1', ['qc-congruence']],
      ['f8-clock:b2', ['qc-period']],
      ['f8-euclid:b1', ['qc-gcd']],
      ['f8-euclid:b2', ['qc-modular-inverse']],
      ['f8-euclid:b3', ['qc-multiplicative-order']],
      ['f8-roots:b1', ['qc-root-of-unity']],
      ['f8-dft:b1', ['qc-dft']],
      ['f8-fractions:b1', ['qc-binary-fraction']],
      ['f8-fractions:b3', ['qc-continued-fraction']],
    ])
  })
  it('defines eleven new glossary ids, each first used in a beat of this chapter, and none repeats a term of another chapter', () => {
    expect(GLOSSARY).toHaveLength(11)
    const ids = new Set(beats.map((b) => b.id))
    for (const g of GLOSSARY) expect(ids.has(g.first), g.id).toBe(true)
    const others = QC_GLOSSARY.filter((g) => !g.first.startsWith('f8-'))
    for (const g of GLOSSARY) {
      expect(others.some((o) => o.id === g.id), `${g.id} id`).toBe(false)
      expect(others.some((o) => o.term.toLowerCase() === g.term.toLowerCase()), `${g.id} term`).toBe(false)
    }
    // the nine `introduces` of the beats are exactly the glossary entries that say so
    expect(GLOSSARY.filter((g) => g.introduces).map((g) => g.id).sort()).toEqual(beats.flatMap((b) => b.introduces ?? []).sort())
  })
  it('the binary fraction is never written 0.101 (the number reader would take it for a decimal): it is 0{.}101_2 or a decimal value', () => {
    expect(learnerText).not.toMatch(/(?<![\d.])0\.1[01]{2,}(?![\d])/)
    expect(learnerText).toContain('0{.}101_2')
  })
})

describe('F8 rulings', () => {
  it('R3: the running example is N = 21, x = 2, r = 6 on a 32-input comb, and the Formal honesty note says real runs take 2^m ≥ N²', () => {
    expect(V.f8Order2mod21).toBe(6)
    expect(2 ** 6 % 21).toBe(1)
    expect(LISTS.PLACES32).toEqual([0, 6, 12, 18, 24, 30])
    expect(COMB32.split('+').map((t) => parseInt(t, 2))).toEqual([0, 6, 12, 18, 24, 30])
    expect(COMB32.split('+').every((t) => t.length === 5)).toBe(true)
    const note = beat('f8-fractions:b4').formal!
    expect(note).toContain('$2^m \\ge N^2$')
    expect(note).toContain('at least 441')
    expect(441).toBe(21 * 21)
    expect(beat('f8-fractions:b5').reveal!.formal).toContain('$2^m \\ge N^2$')
  })
  it('R4: Euler’s count of units appears once, in words (the 12 residues that have an inverse mod 21), with no φ(N) and no Fermat', () => {
    expect(learnerText).not.toMatch(/\\varphi\s*\(\s*N|\\phi\s*\(\s*N|φ\(N\)|Fermat/)
    expect(beat('f8-euclid:b3').formal).toContain('the count of residues that have an inverse, which is 12 for $N = 21$')
    expect([...Array(21).keys()].slice(1).filter((a) => gcdPlain(a, 21) === 1)).toHaveLength(12)
    expect(F8.units[1].books.map((r) => r.adds).join(' ')).toContain('keep the letter φ for phases')
  })
  it('R5: the QFT product form and phase estimation stay in Chapter Q18: named in words, no equation of N&C §5.2 and no phase-estimation derivation', () => {
    expect(learnerText).not.toMatch(/Eq\. 5\.[2-9]|product form of the quantum Fourier/)
    expect(beat('f8-fractions:b2').formal).toContain('Chapter Q18’s phase estimation uses this digit by digit')
    // the stage stops at "doubling drops a digit": the derivation of fractions:b2 has no step about a circuit
    expect(JSON.stringify(beat('f8-fractions:b2').derivation)).not.toMatch(/Hadamard|circuit|controlled/)
  })
  it('R6: the two slips of Bergou p. 127 are not shown as equations here (they go to the Q18 plan); the binary expansion F8 writes is the correct one', () => {
    expect(learnerText).not.toMatch(/Eqs?\. 7\.3[45]\b.*(1\/2\^m|2\^\{m-1\})/)
    expect(beat('f8-dft:b1').formal).toContain('Eq. 7.34')
    expect(beat('f8-fractions:b1').formal).toContain('$0{.}d_1d_2\\ldots d_m = \\sum_{l=1}^m d_l2^{-l}$')
  })
  it('R7: the roots mode exists and four units use it for their Try-it; the geometric unit keeps the phasor mode and the fractions unit the multiply mode', () => {
    expect(F8.units.map((u) => u.visual.kind)).toEqual(Array(6).fill('complex-plane'))
    expect(F8.units.map((u) => (u.visual.props as { mode: string }).mode)).toEqual(['roots', 'roots', 'roots', 'roots', 'phasor', 'multiply'])
    expect(F8.units.map((u) => u.visual.props)).toEqual([
      { mode: 'roots', N: 12, j: 4 },
      { mode: 'roots', N: 12, j: 5 },
      { mode: 'roots', N: 8, j: 3 },
      { mode: 'roots', N: 8, j: 0 },
      { mode: 'phasor', phases: [0, 20, 40] },
      { mode: 'multiply', z: [-0.7071, -0.7071], w: [-0.7071, -0.7071] },
    ])
  })
  it('R8: N&C Ex. 5.1 is starred and derived in full (two views per track); Bergou P3.3 is cited and starred, never worked', () => {
    const b = beat('f8-dft:b2')
    expect(b.formal).toContain('N&C ⚑ Ex. 5.1')
    expect(b.formal).toContain('derived in full')
    expect(b.derivation!.ground.length).toBeGreaterThanOrEqual(3)
    expect(b.derivation!.formal!.length).toBeGreaterThanOrEqual(2)
    const books = F8.units.flatMap((u) => u.books.map((r) => `${r.where} ${r.adds}`)).join(' | ')
    for (const s of ['Ex. 5.1', 'Problem 3.3', 'No course sheet assigns']) expect(books, s).toContain(s)
    expect(JSON.stringify(F8.units.flatMap((u) => u.play))).not.toMatch(/mod-N Bell|Problem 3\.3/)
  })
  it('the sources are cited by printed page: N&C Appendix 4 pages, §5.1 p. 217–218, Bergou pp. 127–129, Axler pp. 123 and 125', () => {
    const books = F8.units.flatMap((u) => u.books.map((r) => `${r.source} ${r.where}`)).join(' | ')
    for (const s of ['p. 626', 'pp. 627–628', 'pp. 630–631', 'pp. 633–635', 'pp. 635–638', 'p. 217', 'p. 218', 'pp. 226–229', 'pp. 128–129', 'p. 127', 'p. 123']) expect(books, s).toContain(s)
  })
})

describe('F8 bridges', () => {
  it('out of F8: into F7 (XOR, GF(2)), F1 (e^{iφ}, phases, multiplying), F2 (the overlap) and F4 (unitaries), each resolving and each used in the beat the plan names', () => {
    const where: Record<string, string[]> = {
      'qc-f7-xor': ['f8-clock:b1', 'f8-roots:b3'],
      'qc-f7-gf2': ['f8-euclid:b2'],
      'qc-f1-euler': ['f8-roots:b1'],
      'qc-f1-phase': ['f8-roots:b2'],
      'qc-f2-inner-product': ['f8-dft:b2'],
      'qc-f4-unitary': ['f8-dft:b2'],
      'qc-f1-multiply': ['f8-fractions:b2'],
    }
    for (const [id, ids] of Object.entries(where)) {
      expect(BRIDGES[id], id).toBeDefined()
      for (const b of ids) expect(JSON.stringify([beat(b).text, beat(b).formal]).includes(`<<${id}|`), `${id} in ${b}`).toBe(true)
    }
    expect(BRIDGES['qc-f7-gf2']).toMatchObject({ lecture: 'F7', unit: 'f7-gf2' })
    expect(BRIDGES['qc-f1-euler']).toMatchObject({ lecture: 'F1', unit: 'f1-euler' })
    expect(BRIDGES['qc-f1-multiply']).toMatchObject({ lecture: 'F1', unit: 'f1-multiply' })
  })
  it('into F8: Q11’s qudit beat links the clock and the roots (Formal), and Q16’s Hadamard-sum beat links the roots (Formal)', () => {
    expect(BRIDGES['qc-f8-clock']).toMatchObject({ course: 'qc709', lecture: 'F8', unit: 'f8-clock' })
    expect(BRIDGES['qc-f8-roots']).toMatchObject({ course: 'qc709', lecture: 'F8', unit: 'f8-roots' })
    const q11 = Q11.units.find((u) => u.id === 'q11-qudit')!.story!.find((b) => b.id === 'q11-qudit:b1')!
    expect(q11.formal).toContain('<<qc-f8-clock|')
    expect(q11.formal).toContain('<<qc-f8-roots|')
    const q16 = Q16.units.find((u) => u.id === 'q16-hadamard-n')!.story!.find((b) => b.id === 'q16-hadamard-n:b3')!
    expect(q16.formal).toContain('<<qc-f8-roots|')
    expect(F8.units.map((u) => u.id)).toContain('f8-clock')
  })
})

describe('F8 challenge answers, recomputed by plain arithmetic', () => {
  it('clock: 17 mod 12 = 5, the doubling list repeats after 6, 2^100 = 2^(100 mod 6) = 2^4 = 16 mod 21', () => {
    expect(answer('f8-c-mod')).toBe(17 - 12)
    // the period: the first r > 0 with 2^(x + r) ≡ 2^x for the first 40 places
    let p = 0
    for (let r = 1; r < 20 && !p; r++) if (Array.from({ length: 40 }, (_, x) => x).every((x) => 2 ** x % 21 === 2 ** (x + r) % 21)) p = r
    expect(answer('f8-c-period')).toBe(p)
    expect(p).toBe(6)
    expect(answer('f8-c-big')).toBe(2 ** (100 % 6) % 21)
    expect(2 ** (100 % 6) % 21).toBe(16)
  })
  it('euclid: gcd(91, 35) = 7, 5 × 17 ≡ 1 (mod 21), gcd(2² − 1, 15) = 3 for the order 4', () => {
    expect(answer('f8-e-gcd')).toBe(gcdPlain(91, 35))
    expect(gcdPlain(91, 35)).toBe(7)
    expect((5 * answer('f8-e-inv')) % 21).toBe(1)
    expect([...Array(20).keys()].map((b) => b + 1).filter((b) => (5 * b) % 21 === 1)).toEqual([answer('f8-e-inv')])
    expect(2 ** 4 % 15).toBe(1)
    expect(2 ** 2 % 15).not.toBe(1)
    expect(answer('f8-e-factor')).toBe(gcdPlain(2 ** 2 - 1, 15))
    expect(gcdPlain(2 ** 2 + 1, 15) * gcdPlain(2 ** 2 - 1, 15)).toBe(15)
  })
  it('roots: 360/12 = 30; for N = 9, j = 3 the nine arrows add to 0; for N = 6, j = 12 they add to 6', () => {
    expect(answer('f8-r-angle')).toBe(360 / 12)
    const sum = (N: number, j: number) => {
      let re = 0
      let im = 0
      for (let k = 0; k < N; k++) {
        re += Math.cos((2 * Math.PI * j * k) / N)
        im += Math.sin((2 * Math.PI * j * k) / N)
      }
      return Math.hypot(re, im)
    }
    expect(answer('f8-r-star')).toBeCloseTo(sum(9, 3), 12)
    expect(answer('f8-r-full')).toBeCloseTo(sum(6, 12), 12)
  })
  it('dft: (F_4)₁₂ = ω²/2 = −0.5; the step-8 comb on 32 places has spikes 1/√8; the comb at 1 and 5 has ĉ₄ = −0.5', () => {
    expect(answer('f8-d-entry')).toBeCloseTo(Math.cos((2 * Math.PI * 2) / 4) / 2, 12)
    expect(answer('f8-d-spike')).toBeCloseTo(1 / Math.sqrt(8), 12)
    // ĉ₄ of the values 1/√2 at places 1 and 5 on 8 places, by the defining sum
    let re = 0
    for (const j of [1, 5]) re += (1 / Math.sqrt(2)) * Math.cos((2 * Math.PI * j * 4) / 8)
    expect(answer('f8-d-shift')).toBeCloseTo(re / Math.sqrt(8), 12)
    expect(re / Math.sqrt(8)).toBeCloseTo(-0.5, 12)
  })
  it('geometric: 1 + 1/3 + 1/9 + 1/27 = 40/27, the chord at 120° is √3, D₄ at 1/8 is 1/(4 sin(π/8))', () => {
    expect(answer('f8-g-sum')).toBeCloseTo(1 + 1 / 3 + 1 / 9 + 1 / 27, 12)
    expect(answer('f8-g-sum')).toBeCloseTo(40 / 27, 12)
    expect(answer('f8-g-chord')).toBeCloseTo(Math.sqrt(3), 12)
    // the length of the sum of 4 arrows each turned 1/8 of a turn, divided by 4, added up directly
    let re = 0
    let im = 0
    for (let t = 0; t < 4; t++) {
      re += Math.cos((2 * Math.PI * t) / 8)
      im += Math.sin((2 * Math.PI * t) / 8)
    }
    expect(answer('f8-g-worst')).toBeCloseTo(Math.hypot(re, im) / 4, 12)
    expect(answer('f8-g-worst')).toBeGreaterThan(2 / Math.PI)
  })
  it('fractions: 0.1101 in binary is 13/16; 13/64 = [0; 4, 1, 12] and its first convergent after 0/1 is 1/4; the convergent of 21/32 before the last is 2/3', () => {
    expect(answer('f8-f-bin')).toBe(13 / 16)
    expect(quotients(13, 64)).toEqual([0, 4, 1, 12])
    expect(answer('f8-f-cf')).toBe(4)
    expect(quotients(21, 32)).toEqual([0, 1, 1, 1, 10])
    // the convergents by the recurrence on the plain quotients
    const conv = (cf: number[]) => {
      const out: [number, number][] = []
      let [pp, p, qq, q] = [0, 1, 1, 0]
      for (const a of cf) {
        ;[pp, p] = [p, a * p + pp]
        ;[qq, q] = [q, a * q + qq]
        out.push([p, q])
      }
      return out
    }
    const c = conv(quotients(21, 32))
    expect(c).toEqual([[0, 1], [1, 1], [1, 2], [2, 3], [21, 32]])
    expect(answer('f8-f-21')).toBe(c[c.length - 2][1])
  })
  it('the story’s own examples hold by plain arithmetic: 84 = 2·36 + 12, 8² − 1 = 63 = 3 × 21, 2^13 ≡ 2 (mod 21), 5/32 = [0; 6, 2, 2], |5/32 − 1/6| ≤ 1/72', () => {
    expect([84 - 2 * 36, 36 - 3 * 12]).toEqual([12, 0])
    expect(8 * 8 - 1).toBe(3 * 21)
    expect(2 ** 13 % 21).toBe(2)
    expect(quotients(5, 32)).toEqual([0, 6, 2, 2])
    expect(Math.abs(5 / 32 - 1 / 6)).toBeLessThanOrEqual(1 / 72)
    expect(F8.units.flatMap((u) => u.play).filter((c) => (c as ChoiceChallenge).kind === 'choice')).toHaveLength(0)
  })
})
