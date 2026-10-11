/**
 * Chapter Q18's own invariants (rulings qc709-Q18.md): the five Corrections each checked at a revealing point, every decimal in a challenge read from `V`, one meaning per letter
 * (φ the angle, τ the fraction of a turn, with exactly ONE Rosetta line), the shape of the chapter (units, beats, phases), and the book references. (The generic lints, symbols
 * before use, claims against numpy, derivation views, run in content.test.tsx, symbols.test.ts and claims.test.ts for every chapter.)
 */
import { describe, expect, it } from 'vitest'
import { simonPrintedNorm2 } from '../../physics/qc/oracles'
import { countingPrintedReading, expandPrinted, qftPrintedNorm2 } from '../../physics/qc/qft'
import { Q18 } from './Q18'
import Q18Source from './Q18.ts?raw'
import { GLOSSARY } from './Q18.glossary'
import { V } from './Q18.values'

const units = Q18.units
const beats = units.flatMap((u) => u.story ?? [])
const beat = (id: string) => beats.find((b) => b.id === id)!
const corr = (where: string) => Q18.corrections!.find((c) => c.where === where)!

describe('Q18 shape: six units, thirty beats, six clues, one Go-deeper beat, all books-phase', () => {
  it('has the planned units in order, with 6 + 5 + 4 + 5 + 5 + 5 beats', () => {
    expect(units.map((u) => u.id)).toEqual(['q18-simon', 'q18-qft', 'q18-kickback', 'q18-phase-est', 'q18-counting', 'q18-order'])
    expect(units.map((u) => (u.story ?? []).length)).toEqual([6, 5, 4, 5, 5, 5])
    expect(beats).toHaveLength(30)
  })
  it('the phases run books → clue → deeper; no lecture or core beat; the only Go-deeper beat is the last of Simon’s unit', () => {
    expect(new Set(beats.map((b) => b.phase))).toEqual(new Set(['books', 'clue', 'deeper']))
    expect(beats.filter((b) => b.phase === 'clue')).toHaveLength(6)
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['q18-simon:b6'])
    for (const u of units) expect((u.story ?? [])[0].phase, `${u.id} opens with a books beat`).toBe('books')
  })
  it('the five notation beats each introduce one entry; order finding is a books unit (ruling R3), not a Go-deeper one', () => {
    const intro = beats.filter((b) => b.introduces?.length).map((b) => [b.id, b.introduces!.join()])
    expect(intro).toEqual([
      ['q18-simon:b3', 'qc-s-perp'],
      ['q18-qft:b1', 'qc-qft'],
      ['q18-qft:b4', 'qc-controlled-rk'],
      ['q18-kickback:b1', 'qc-eigenphase'],
      ['q18-order:b1', 'qc-order-finding'],
    ])
    expect(GLOSSARY.filter((g) => g.introduces).map((g) => g.id)).toEqual(['qc-s-perp', 'qc-qft', 'qc-controlled-rk', 'qc-eigenphase', 'qc-order-finding'])
    expect((units[5].story ?? []).every((b) => b.phase !== 'deeper')).toBe(true)
  })
})

describe('Q18 Corrections (ruling R2): five boxes, each an engine computation at a point where the slip shows, worded "our calculation finds …"', () => {
  it('there are five, all the book’s, in the order of the pages', () => {
    expect(Q18.corrections!.map((c) => c.where)).toEqual(['Bergou p. 126, last paragraph', 'Bergou p. 126, Eq. 7.33', 'Bergou p. 127, Eqs. 7.34–7.35', 'Bergou p. 127', 'Bergou p. 130'])
    for (const c of Q18.corrections!) {
      expect(c.source).toBe('book')
      expect(c.shouldSay.startsWith('Our calculation finds')).toBe(true)
      expect(c.check()).toBe(true)
    }
  })
  it('E1 (n − 1 equations): the strings of s⊥ have rank 2 for three wires, three independent checks leave one string (000)', () => {
    expect(V.q18PerpRank).toBe(2)
    expect(V.q18ThreeForceZero).toBe(1)
    expect(corr('Bergou p. 126, last paragraph').shouldSay).toContain('rank 2')
  })
  it('E2 (Eq. 7.33): the printed prefactor 2^{-(n+1)/2} gives squared length 0.25 at every n and s, the right one 1', () => {
    for (const [n, s] of [[2, 3], [2, 1], [3, 6], [3, 5], [3, 7]] as const) expect(simonPrintedNorm2(n, s)).toBeCloseTo(0.25, 12)
    expect(corr('Bergou p. 126, Eq. 7.33').shouldSay).toContain('0.25')
  })
  it('E3 (Eqs. 7.34–7.35): the printed 1/2^m gives squared length 2^{-m} (0.125 at m = 3), the right 2^{-m/2} gives 1 — tested at a ≠ 0', () => {
    for (const m of [1, 2, 3, 4, 5]) expect(qftPrintedNorm2(m, 5 % 2 ** m)).toBeCloseTo(2 ** -m, 12)
    expect(V.q18QftPrintedNorm2).toBeCloseTo(0.125, 12)
    expect(corr('Bergou p. 127, Eqs. 7.34–7.35').shouldSay).toContain('0.125')
  })
  it('E4 (p. 127): the printed expansion reads 110 as 8; exactly the strings with a second digit 1 are misread (4 of 8)', () => {
    expect(expandPrinted('110')).toBe(8)
    const wrong = Array.from({ length: 8 }, (_, a) => a.toString(2).padStart(3, '0')).filter((b) => expandPrinted(b) !== parseInt(b, 2))
    expect(wrong.every((b) => b[1] === '1')).toBe(true)
    expect(wrong).toHaveLength(4)
    expect(corr('Bergou p. 127').shouldSay).toContain('reads as 8')
  })
  it('E5 (p. 130): at N = 4, M = 2 the printed readings 001 and 111 have chance 0 in the simulated circuit, while 010 and 110 have 0.5 each', () => {
    const r = countingPrintedReading(2, [1, 2], 3)
    expect([r.aPlus, r.aMinus]).toEqual([1, 7])
    expect(r.chance).toBeLessThan(1e-12)
    expect(V.q18Cnt2).toBeCloseTo(0.5, 12)
    expect(corr('Bergou p. 130').shouldSay).toContain('010 and 110 each have 0.5')
  })
  it('the tail bound and “≈ 0.4” are NOT Corrections (they hold; the text says “at least”): no box mentions them', () => {
    const all = Q18.corrections!.map((c) => c.where + c.says + c.shouldSay).join(' ')
    expect(all).not.toContain('4/π')
    expect(all).not.toContain('2k')
  })
})

describe('Q18 letters (ruling R1): φ is an angle, τ the fraction of a turn, one Rosetta line', () => {
  const authored = (): string[] => [
    ...beats.flatMap((b) => [b.text, b.formal ?? '', b.caption ?? '', b.captionFormal ?? '', b.reveal?.text ?? '', b.reveal?.formal ?? '']),
    ...units.flatMap((u) => [...(u.review ? [...u.review.points, u.review.trap, ...(u.review.formal?.points ?? []), u.review.formal?.trap ?? ''] : []), u.insight, u.insightFormal ?? '']),
    ...GLOSSARY.flatMap((g) => [g.gloss, g.formal ?? '']),
  ]
  it('exactly one authored string is a Rosetta line, in Formal at q18-kickback:b1: the books’ e^{2πiφ}, here φ the angle and τ the fraction of a turn', () => {
    const hits = authored().filter((s) => /Rosetta/.test(s))
    expect(hits).toHaveLength(1)
    expect(beat('q18-kickback:b1').formal).toContain('Rosetta: the books write $e^{2\\pi i\\varphi}$')
    expect(beat('q18-kickback:b1').formal).toContain('$\\varphi$ stays the angle and $\\tau$ is the fraction of a turn')
  })
  it('the books’ form e^{2πiφ} (φ as a fraction of a turn) appears nowhere else in the chapter’s learner text', () => {
    const bad = authored().filter((s) => /e\^\{2\\pi i\\varphi\}/.test(s) && !/Rosetta/.test(s))
    expect(bad).toEqual([])
  })
  it('τ is first met at q18-kickback:b1 and never means anything else; φ is never written as a fraction below 1 of a turn (no “φ = 0.” anywhere)', () => {
    expect(Q18.symbols!['\\tau']).toBe('q18-kickback:b1')
    expect(Q18.symbols!['\\varphi']).toBe('q18-kickback:b1')
    expect(authored().filter((s) => /\\varphi\s*=\s*0\./.test(s))).toEqual([])
  })
  it('the running eigenphase is τ = 0.101₂ = 0.625 of a turn = 225°, in both tracks of the introducing beat', () => {
    expect(V.q18Tau).toBe(0.625)
    expect(V.q18TauDeg).toBe(225)
    expect(beat('q18-kickback:b1').text).toContain('0{.}101_2')
    expect(beat('q18-kickback:b1').text).toContain('0.625')
    expect(beat('q18-kickback:b1').text).toContain('225°')
  })
})

describe('Q18 challenges read their numbers from V (the Q17 lint, for this chapter)', () => {
  /** Every value a challenge may quote: V itself, V squared, and the plain constants some hints quote (π, π², log₂7, 3π/8 and its sine). */
  const known: number[] = [...Object.values(V), ...Object.values(V).map((x) => x * x), Math.PI, Math.PI ** 2, Math.log2(7), (3 * 180) / 8, Math.sin((3 * Math.PI) / 8)]
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
  it('and none is typed: in the source of every challenge, a decimal appears only inside a ${…} read of V', () => {
    const blocks = [...Q18Source.matchAll(/play: \[([\s\S]*?)\n      \],/g)].map((m) => m[1])
    expect(blocks).toHaveLength(units.length)
    const typed = blocks.flatMap((blk) =>
      [...blk
        .replace(/\$\{[^}]*\}/g, ' ')
        .replace(/tolerance: [\d.]+/g, ' ')
        .replace(/(Eqs?\.|§|Problem|Unit|Theorem)\s*[\d.]+/g, ' ')
        .matchAll(/(?<![\d.{])(\d+\.\d+)(?![\d])/g)].map((m) => m[1]),
    )
    expect(typed).toEqual([])
  })
  it('the lint sees the numbers (guard against a vacuous pass): the chapter’s challenges carry many decimals', () => {
    expect(units.flatMap((u) => u.play).flatMap((c) => texts(c)).flatMap(decimals).length).toBeGreaterThan(8)
  })
  it('the answers are the engine’s: 4, 0.375, 225, 270, 0.405, 0.688, 6, 30, 3.414, 0.047, 6, 6, 7', () => {
    const ans = Object.fromEntries(units.flatMap((u) => u.play).filter((c) => c.kind === 'numeric').map((c) => [c.id, (c as { answer: number }).answer]))
    expect(ans['q18-s-perp']).toBe(4)
    expect(ans['q18-s-two']).toBeCloseTo(0.375, 12)
    expect(ans['q18-k-deg']).toBeCloseTo(225, 9)
    expect(ans['q18-k-u2']).toBeCloseTo(270, 9)
    expect(ans['q18-p-bound']).toBeCloseTo(0.4053, 4)
    expect(ans['q18-p-third']).toBeCloseTo(0.6878, 4)
    expect(ans['q18-p-wires']).toBe(6)
    expect(ans['q18-c-alpha']).toBeCloseTo(30, 9)
    expect(ans['q18-c-est']).toBeCloseTo(3.4142, 4)
    expect(ans['q18-c-empty']).toBeCloseTo(0.0469, 4)
    expect([ans['q18-o-eig'], ans['q18-o-27'], ans['q18-o-factor']]).toEqual([6, 6, 7])
    expect(ans['q18-q-wire']).toBeCloseTo(270, 9)
    expect(ans['q18-q-gates']).toBe(15)
    expect(ans['q18-q-bar']).toBeCloseTo(0.3536, 4)
  })
})

describe('Q18 references: the pages and equations the books list are the ones the text cites', () => {
  const where = (unit: string, source: 'bergou' | 'nc') => units.find((u) => u.id === unit)!.books.find((b) => b.source === source)!.where
  it('each unit cites its Bergou pages (126–130) and N&C sections', () => {
    expect(where('q18-simon', 'bergou')).toBe('§7.4, p. 126, Eqs. 7.30–7.33')
    expect(where('q18-qft', 'bergou')).toBe('§7.5, p. 127, Eqs. 7.34–7.35')
    expect(where('q18-qft', 'nc')).toBe('§5.1, pp. 217–221, Eqs. 5.1–5.11, Fig. 5.1, Box 5.1, Ex. 5.2 and Ex. 5.5')
    expect(where('q18-kickback', 'bergou')).toBe('§7.5, pp. 127–128, Fig. 7.6, Eqs. 7.36–7.37')
    expect(where('q18-phase-est', 'bergou')).toBe('§7.5, pp. 128–129, Eqs. 7.38–7.43')
    expect(where('q18-phase-est', 'nc')).toBe('§5.2, pp. 222–225, Eqs. 5.20–5.35, Ex. 5.8')
    expect(where('q18-counting', 'bergou')).toBe('§7.5, pp. 129–130, Eq. 7.44; Problem 7.2 (p. 142) cited only')
    expect(where('q18-counting', 'nc')).toBe('§6.3, pp. 261–263, Eq. 6.33')
    expect(where('q18-order', 'nc')).toContain('§5.3.1, pp. 226–230, Eqs. 5.36–5.44, Box 5.2')
  })
  it('N&C Ex. 5.8 and Bergou Problem 7.2 are cited only: no challenge is built on either', () => {
    const ids = units.flatMap((u) => u.play.map((c) => c.id)).join(' ')
    expect(ids).not.toMatch(/5-8|p72|7-2/)
    expect(beat('q18-kickback:b4').reveal!.formal).toContain('Ex. 5.8 cited only')
  })
  it('the book pages: the Correction boxes name page 126 (Eq. 7.33 and the last paragraph), page 127 (twice) and page 130', () => {
    expect(Q18.corrections!.map((c) => /p\. (\d+)/.exec(c.where)![1])).toEqual(['126', '126', '127', '127', '130'])
  })
})
