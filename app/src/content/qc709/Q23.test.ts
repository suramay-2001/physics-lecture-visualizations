/**
 * Chapter Q23's own invariants (plan P-Q23-story, rulings qc709-Q20-Q27.md Z1-Z7): the shape of the chapter (six units, 36 beats, six clues, three Go-deeper beats), the three notation beats, the
 * eight derivations, the 19 challenges (every answer the engine's), the three Corrections (each with an engine check that fails when the printed slip is absent), the order of the engine values the text
 * words ("never above", "a ceiling, not a promise"), the references to the book (pages and "Eq." citations), and the entry-closure rule for `physics/qc/infoq.ts`. (The generic lints, symbols before use,
 * claims against numpy, derivation views, the verbatim 8-gram test, run in content.test.tsx, symbols.test.ts, claims.test.ts and verbatim.test.ts for every chapter.)
 */
import { describe, expect, it } from 'vitest'
import { Q23 } from './Q23'
import Q23Source from './Q23.ts?raw'
import Q23Story from './Q23.story.ts?raw'
import { GLOSSARY } from './Q23.glossary'
import { V, d } from './Q23.values'
import { derivationSteps } from '../track'

const units = Q23.units
const beats = units.flatMap((u) => u.story ?? [])
const texts = (b: (typeof beats)[number]): string[] => [b.text, b.formal ?? '', b.caption ?? '', b.captionFormal ?? '', b.reveal?.text ?? '', b.reveal?.formal ?? '']

describe('Q23 shape: six units, 36 beats, six clues, three Go-deeper beats, all books-phase', () => {
  it('has the planned units in order, with 6 + 5 + 6 + 6 + 6 + 7 beats', () => {
    expect(units.map((u) => u.id)).toEqual(['q23-classical-compare', 'q23-quantum-compare', 'q23-entropy-props', 'q23-two-variables', 'q23-quantum-mutual', 'q23-holevo'])
    expect(units.map((u) => (u.story ?? []).length)).toEqual([6, 5, 6, 6, 6, 7])
    expect(beats).toHaveLength(36)
  })
  it('the phases run books → clue → deeper; no lecture or core beat; each Go-deeper beat is the last of its unit and no unit opens with one', () => {
    expect(new Set(beats.map((b) => b.phase))).toEqual(new Set(['books', 'clue', 'deeper']))
    expect(beats.filter((b) => b.phase === 'clue').map((b) => b.id)).toEqual(['q23-classical-compare:b6', 'q23-quantum-compare:b5', 'q23-entropy-props:b6', 'q23-two-variables:b5', 'q23-quantum-mutual:b5', 'q23-holevo:b6'])
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['q23-two-variables:b6', 'q23-quantum-mutual:b6', 'q23-holevo:b7'])
    for (const u of units) {
      const s = u.story ?? []
      expect(s[0].phase, `${u.id} opens with a books beat`).toBe('books')
      s.forEach((b, i) => b.phase === 'deeper' && expect(i, `${b.id} is the last beat`).toBe(s.length - 1))
    }
  })
  it('the three notation beats each introduce one entry, at or before its first use', () => {
    const intro = beats.filter((b) => b.introduces?.length).map((b) => [b.id, b.introduces!.join()])
    expect(intro).toEqual([
      ['q23-classical-compare:b4', 'qc-relative-entropy'],
      ['q23-two-variables:b2', 'qc-mutual-information'],
      ['q23-holevo:b1', 'qc-holevo-bound'],
    ])
    expect(GLOSSARY.filter((g) => g.introduces).map((g) => g.id)).toEqual(['qc-relative-entropy', 'qc-mutual-information', 'qc-holevo-bound'])
    expect(GLOSSARY).toHaveLength(14)
  })
  it('Ownership (Z4): Q23 does not redefine what Q5, Q8, Q9, Q11, Q12, Q14 or F5 own', () => {
    const owned = ['qc-shannon-entropy', 'qc-binary-entropy', 'qc-von-neumann-entropy', 'qc-trace-distance', 'qc-fidelity', 'qc-conditional-entropy', 'qc-maximally-mixed', 'qc-ensemble', 'qc-helstrom-bound', 'qc-unambiguous-discrimination', 'qc-dense-coding']
    expect(GLOSSARY.filter((g) => owned.includes(g.id))).toEqual([])
    expect(Q23.prerequisites).toEqual(expect.arrayContaining(owned))
  })
  it('eight derivations, each with at least as many Ground-up steps as Formal ones and two or more distinct views per track', () => {
    const withDerivation = beats.filter((b) => b.derivation)
    expect(withDerivation.map((b) => b.id)).toEqual(['q23-classical-compare:b3', 'q23-classical-compare:b5', 'q23-quantum-compare:b4', 'q23-entropy-props:b1', 'q23-two-variables:b1', 'q23-holevo:b2', 'q23-holevo:b4', 'q23-holevo:b5'])
    for (const b of withDerivation) {
      expect(b.derivation!.ground.length, b.id).toBeGreaterThanOrEqual(b.derivation!.formal!.length)
      for (const t of ['ground', 'formal'] as const) expect(new Set(derivationSteps(b, t).filter((s) => s.view).map((s) => JSON.stringify(s.view))).size, `${b.id} ${t} views`).toBeGreaterThanOrEqual(2)
    }
  })
  it('nineteen challenges (4 choice), three hints each and a full walkthrough (no sheet assigns any of them)', () => {
    expect(units.map((u) => u.play.length)).toEqual([3, 3, 3, 3, 3, 4])
    for (const c of units.flatMap((u) => u.play)) {
      expect(c.hints, c.id).toHaveLength(3)
      expect((c.walkthrough ?? []).length, c.id).toBeGreaterThan(0)
      expect(c.assigned, c.id).toBeUndefined()
    }
    const choices = units.flatMap((u) => u.play).filter((c) => c.kind === 'choice')
    expect(choices.map((c) => c.id)).toEqual(['q23-q-sym', 'q23-e-conc', 'q23-m-local', 'q23-h-bb84'])
    for (const c of choices) if (c.kind === 'choice') expect(c.options.filter((o) => o.correct), c.id).toHaveLength(1)
  })
})

describe('Q23 rulings: Z3 Corrections, the words and the order of the engine values', () => {
  it('there are exactly three Corrections, all from the book, each worded "Our calculation finds" with an engine check that holds', () => {
    expect(Q23.corrections).toHaveLength(3)
    for (const c of Q23.corrections ?? []) {
      expect(c.source).toBe('book')
      expect(c.shouldSay.startsWith('Our calculation finds')).toBe(true)
      expect(c.check()).toBe(true)
    }
    expect(Q23.corrections!.map((c) => c.where)).toEqual(['Bergou p. 191, after Eq. 11.4', 'Bergou p. 195, the ancilla argument after Eq. 11.19', 'Bergou p. 48, before Eq. 3.45'])
  })
  it('each check fails when the discrepancy is absent (mutation): the printed slip and the right form give different numbers', () => {
    // N1: the classical formula on equal eigenvalue tables says 0, the quantum quantity does not
    expect(V.q23HeigSame).toBeLessThan(1e-12)
    expect(V.q23SrelSameEig).toBeGreaterThan(1)
    // N2: S(rho_AB) of a Bell pair is 0 but S(rho_B) is 1, so the printed equality is false; with a pure helper S(rho_BC) = S(rho_B)
    expect(V.q23SlipSB - V.q23SlipSAB).toBeGreaterThan(0.99)
    expect(Math.abs(V.q23SlipSBC - V.q23SlipSB)).toBeLessThan(1e-9)
    // N3: with the printed denominator the chord lies ABOVE log (the concavity inequality fails); with x2 - x1 it holds
    expect(V.q23LhsPrinted - V.q23RhsPrinted).toBeGreaterThan(0.6)
    expect(V.q23RhsTrue - V.q23LhsTrue).toBeGreaterThan(0.2)
  })
  it('the engine values are ordered as the text words them', () => {
    // a measurement never separates two states by more than D, the Helstrom axis reaches it, and the 3601-axis grid agrees
    expect(Math.max(V.q23DmeasZ, V.q23DmeasX)).toBeLessThan(V.q23DquantumZP)
    expect(V.q23DmeasBest).toBeCloseTo(V.q23DquantumZP, 12)
    expect(V.q23DmeasGridMax).toBeCloseTo(V.q23DquantumZP, 9)
    // Klein's chain S >= H >= 0
    expect(V.q23SrelNC).toBeGreaterThan(V.q23KleinH)
    expect(V.q23KleinH).toBeGreaterThan(0)
    // entropy rules: below log d, subadditivity, concavity, strong subadditivity (both gaps positive)
    expect(V.q23S4Level).toBeLessThan(2)
    expect(V.q23SubaddGap).toBeCloseTo(2, 12)
    expect(V.q23SConcaveMix).toBeGreaterThan(V.q23SConcaveAvg)
    expect(V.q23SsaGap1).toBeGreaterThan(0)
    expect(V.q23SsaGap2).toBeGreaterThan(0)
    expect(V.q23SsaLhs1).toBeLessThan(V.q23SsaRhs1)
    expect(V.q23SsaLhs2).toBeLessThan(V.q23SsaRhs2)
    // mutual information: two routes agree; the vote sits far below the capacity, which is 1 - h(0.1)
    expect(V.q23Imutual).toBeCloseTo(V.q23ImutualAsRel, 12)
    expect(V.q23Rep3Rate).toBeLessThan(V.q23BscCap)
    // quantum mutual information: noise only lowers it, the GHZ qubits share less than one qubit with two
    expect(V.q23IDeph01).toBeLessThan(V.q23IBell)
    expect(V.q23IDeph05).toBeCloseTo(V.q23ImutualCorr, 12)
    expect(V.q23IGhzAB).toBeLessThan(V.q23IGhzABC)
    expect(V.q23ILocalU).toBeCloseTo(V.q23IBell, 12)
    // Holevo: a reading is a floor under the ceiling; a z reading is below the best axis; the proof chain
    expect(V.q23IZPz).toBeLessThan(V.q23IBestZP)
    expect(V.q23IBestZP).toBeLessThan(V.q23ChiZP)
    expect(V.q23IBestZP).toBeCloseTo(V.q23IHelstromClosed, 9)
    expect(V.q23ProofEnd).toBeLessThan(V.q23ProofStart)
    expect(V.q23IBB84Best).toBeLessThan(V.q23ChiBB84)
    expect(V.q23UsdBound05).toBeLessThan(V.q23UsdPfExact05)
    expect(V.q23UsdInfo05).toBeLessThan(V.q23ChiS05)
    expect(V.q23ChiBellAliceOnly).toBeLessThan(1e-9)
  })
  it('the p. 48 slip is reported with the denominator the page prints: (x1 - x2), and the box says so in the Formal beat, the Correction and the plan’s numbers', () => {
    const slip = Q23.corrections![2]
    expect(slip.says).toContain('x_1 - x_2')
    expect(slip.shouldSay).toContain('x_2 - x_1')
    expect(slip.shouldSay).toContain(d(V.q23LhsPrinted, 4))
    expect(beats.find((b) => b.id === 'q23-quantum-compare:b4')!.formal).toContain('Corrections box')
  })
})

describe('Q23 challenges read their numbers from V', () => {
  const challenges = units.flatMap((u) => u.play)
  it('every numeric answer is a value of V (an integer one through Math.round), with tolerance 0 for an integer and 0.005 for a decimal', () => {
    const answers = challenges.filter((c) => c.kind === 'numeric').map((c) => (c.kind === 'numeric' ? [c.id, c.answer, c.tolerance] : []))
    expect(answers).toEqual([
      ['q23-c-d', V.q23ChDpq, 0.005],
      ['q23-c-f', V.q23ChF, 0.005],
      ['q23-c-h', V.q23ChH, 0.005],
      ['q23-q-dmeas', V.q23ChDmeasZminus, 0.005],
      ['q23-q-srel', V.q23ChSrelDiag, 0.005],
      ['q23-e-max', 3, 0],
      ['q23-e-block', V.q23ChBlock, 0.005],
      ['q23-t-joint', V.q23ChJoint, 0.005],
      ['q23-t-i', V.q23ChI, 0.005],
      ['q23-t-cap', V.q23BscCap25, 0.005],
      ['q23-m-bell', V.q23IBell, 0.005],
      ['q23-m-deph', V.q23ChDeph25, 0.005],
      ['q23-h-chi', V.q23ChiOrth, 0.005],
      ['q23-h-s', V.q23ChChiS06, 0.005],
      ['q23-h-usd', V.q23ChUsdS08, 0.005],
    ])
    expect(d(V.q23ChDpq, 1)).toBe('0.4')
    expect(d(V.q23ChF, 3)).toBe('0.707')
    expect(d(V.q23ChH, 3)).toBe('0.208')
    expect(d(V.q23ChSrelDiag, 3)).toBe('0.531')
    expect(d(V.q23ChBlock, 3)).toBe('1.561')
    expect(d(V.q23ChJoint, 3)).toBe('1.722')
    expect(d(V.q23ChI, 3)).toBe('0.278')
    expect(d(V.q23BscCap25, 3)).toBe('0.189')
    expect(d(V.q23ChDeph25, 3)).toBe('1.189')
    expect(d(V.q23ChChiS06, 3)).toBe('0.722')
    expect(d(V.q23ChUsdS08, 3)).toBe('0.531')
  })
  it('in the source of Q23.ts every challenge answer is written as V.q23…, never a typed decimal', () => {
    const answers = [...Q23Source.matchAll(/answer: ([^,\n]+),/g)].map((m) => m[1])
    expect(answers.length).toBe(15)
    for (const a of answers) expect(a, a).toMatch(/^(V\.q23[A-Za-z0-9]+|Math\.round\(V\.q23S3Qubits\))$/)
  })
  it('the choice answers are the engine’s: 0.189 against 0.208; 0.601 against 0; 0.5 bit of at most 1', () => {
    const c = (id: string) => challenges.find((x) => x.id === id)!
    for (const id of ['q23-q-sym', 'q23-e-conc', 'q23-m-local', 'q23-h-bb84']) {
      const ch = c(id)
      expect(ch.kind).toBe('choice')
    }
    expect(d(V.q23SrelA, 3)).toBe('0.189')
    expect(d(V.q23SrelAreverse, 3)).toBe('0.208')
    expect(d(V.q23SConcaveMix, 3)).toBe('0.601')
    expect(d(V.q23IBB84z, 1)).toBe('0.5')
  })
})

describe('Q23 references: the pages and equations the books list are the ones the text cites', () => {
  it('each unit cites its Bergou pages (48–51, 190–199) and the N&C pages the plan uses', () => {
    const where = (id: string) => units.find((u) => u.id === id)!.books.map((b) => `${b.source}:${b.where}`).join(' | ')
    expect(where('q23-classical-compare')).toContain('pp. 190–191')
    expect(where('q23-classical-compare')).toContain('nc:p. 400')
    expect(where('q23-quantum-compare')).toContain('pp. 191–193')
    expect(where('q23-quantum-compare')).toContain('nc:p. 511')
    expect(where('q23-entropy-props')).toContain('pp. 48–51')
    expect(where('q23-entropy-props')).toContain('nc:p. 521')
    expect(where('q23-two-variables')).toContain('pp. 193–194')
    expect(where('q23-quantum-mutual')).toContain('p. 195')
    expect(where('q23-quantum-mutual')).toContain('nc:p. 514')
    expect(where('q23-holevo')).toContain('pp. 196–199')
    expect(where('q23-holevo')).toContain('nc:pp. 528–531')
  })
  it('equations are cited as “Eq. 11.4” or “Eqs. 11.13–11.16”, never as a bare (11.4) the number reader would take for a decimal', () => {
    const everything = beats.flatMap(texts).join(' ')
    expect(everything).not.toMatch(/(?<![A-Za-z\\\]})])\(\d{1,2}\.\d{1,2}(?:[–-]\d{1,2}\.\d{1,2})?\)/)
    expect(everything).toMatch(/Eq\. 11\.4/)
    expect(everything).toMatch(/Eqs\. 11\.13–11\.16/)
  })
  it('Bergou’s Problems 1 to 4 are cited only: Problems 2, 3 and 4 are named a few times, none is worked, and the trine of Problem 1 never appears', () => {
    const everything = beats.flatMap(texts).join(' ')
    expect(everything).toMatch(/Problem 2/)
    expect(everything).toMatch(/Problem 3/)
    expect(everything).toMatch(/Problem 4/)
    expect(everything).not.toMatch(/trine/i)
    for (const p of ['Problem 2', 'Problem 3', 'Problem 4']) expect(everything.match(new RegExp(p, 'g'))!.length, p).toBeLessThanOrEqual(4)
    expect(units.flatMap((u) => u.play).map((c) => c.assigned)).toEqual(Array(19).fill(undefined))
  })
  it('the hardware-free rule (Z2): no experiment, device or measured result appears, and the beats that go beyond the book say so', () => {
    expect(Q23Story).not.toMatch(/experiment(?:ally)?|measured value|laboratory/i)
    const dense = beats.find((b) => b.id === 'q23-holevo:b7')!
    expect(dense.text).toContain('beyond the book')
    expect(dense.formal).toContain('Beyond Bergou')
    expect(beats.find((b) => b.id === 'q23-two-variables:b6')!.text).toContain('do not prove it')
    expect(beats.find((b) => b.id === 'q23-quantum-mutual:b6')!.text).toContain('cite the problem without working it')
  })
  it('the accessible-information searches by an optimiser are our evidence in words, never a claim (R7): no claim key names them', () => {
    const keys = Object.keys(V)
    expect(keys.filter((k) => /opt|search|povm/i.test(k))).toEqual([])
    const reveal = beats.find((b) => b.id === 'q23-holevo:b3')!
    expect(reveal.formal).toContain('not a claim')
  })
})

describe('Q23 entry rule (chunk contract (l)): physics/qc/infoq.ts is imported only by this chapter’s values file, the lazy plot kind and tests', () => {
  const SRC = import.meta.glob<string>(['../../**/*.ts', '../../**/*.tsx'], { query: '?raw', import: 'default' })
  it('no other source file imports it', async () => {
    const importers: string[] = []
    for (const [path, load] of Object.entries(SRC)) {
      if (/\.test\.tsx?$/.test(path) || /\/testkit\.ts$/.test(path)) continue
      if (path.endsWith('/physics/qc/infoq.ts')) continue
      const src = await load()
      if (/from '[^']*\/infoq'/.test(src)) importers.push(path.replace(/^.*\//, ''))
    }
    expect(importers.sort()).toEqual(['Q23.values.ts', 'plot.ts'])
  }, 120_000)
})
