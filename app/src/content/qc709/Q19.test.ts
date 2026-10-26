/**
 * Chapter Q19's own invariants (rulings qc709-Q19.md R1-R12): the shape of the chapter (six units, 34 beats, six clues, five Go-deeper beats), the coin-walk beat that says it goes
 * beyond the book (R1), no Correction box (R6), one Rosetta line for N (R10), the numbers the builder had to word from the engine rather than from the plan (the arriving start
 * peaks at step 5; every `...Gap` is about 1e-15, never compared with 0), every decimal of a challenge read from `V`, and the book references. (The generic lints, symbols before use,
 * claims against numpy, derivation views, run in content.test.tsx, symbols.test.ts and claims.test.ts for every chapter.)
 */
import { describe, expect, it } from 'vitest'
import { Q19 } from './Q19'
import Q19Source from './Q19.ts?raw'
import Q19Story from './Q19.story.ts?raw'
import { GLOSSARY } from './Q19.glossary'
import { V, d } from './Q19.values'
import { starWalkMarkedSeries } from '../../physics/qc/walk'

const units = Q19.units
const beats = units.flatMap((u) => u.story ?? [])
const beat = (id: string) => beats.find((b) => b.id === id)!

describe('Q19 shape: six units, 34 beats, six clues, five Go-deeper beats, all books-phase', () => {
  it('has the planned units in order, with 5 + 5 + 6 + 6 + 6 + 6 beats', () => {
    expect(units.map((u) => u.id)).toEqual(['q19-random-walk', 'q19-scatter', 'q19-star-search', 'q19-extra-edge', 'q19-simulation', 'q19-qaoa'])
    expect(units.map((u) => (u.story ?? []).length)).toEqual([5, 5, 6, 6, 6, 6])
    expect(beats).toHaveLength(34)
  })
  it('the phases run books → clue → deeper; no lecture or core beat; each Go-deeper beat is the last of its unit and no unit opens with one', () => {
    expect(new Set(beats.map((b) => b.phase))).toEqual(new Set(['books', 'clue', 'deeper']))
    expect(beats.filter((b) => b.phase === 'clue').map((b) => b.id)).toEqual(['q19-random-walk:b4', 'q19-scatter:b5', 'q19-star-search:b5', 'q19-extra-edge:b5', 'q19-simulation:b5', 'q19-qaoa:b5'])
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['q19-random-walk:b5', 'q19-star-search:b6', 'q19-extra-edge:b6', 'q19-simulation:b6', 'q19-qaoa:b6'])
    for (const u of units) {
      const s = u.story ?? []
      expect(s[0].phase, `${u.id} opens with a books beat`).toBe('books')
      s.forEach((b, i) => b.phase === 'deeper' && expect(i, `${b.id} is the last beat`).toBe(s.length - 1))
    }
  })
  it('the two notation beats each introduce one entry, at or before its first use', () => {
    const intro = beats.filter((b) => b.introduces?.length).map((b) => [b.id, b.introduces!.join()])
    expect(intro).toEqual([
      ['q19-scatter:b1', 'qc-edge-state'],
      ['q19-qaoa:b2', 'qc-cost-hamiltonian'],
    ])
    expect(GLOSSARY.filter((g) => g.introduces).map((g) => g.id)).toEqual(['qc-edge-state', 'qc-cost-hamiltonian'])
    expect(GLOSSARY).toHaveLength(13)
  })
  it('five derivations, each with at least as many Ground-up steps as Formal ones', () => {
    const withDerivation = beats.filter((b) => b.derivation)
    expect(withDerivation.map((b) => b.id)).toEqual(['q19-scatter:b3', 'q19-star-search:b3', 'q19-star-search:b4', 'q19-simulation:b3', 'q19-qaoa:b2'])
    for (const b of withDerivation) expect(b.derivation!.ground.length).toBeGreaterThanOrEqual(b.derivation!.formal!.length)
  })
  it('eighteen challenges, three per unit, each with exactly three hints and a full walkthrough (no sheet assigns any of them)', () => {
    expect(units.map((u) => u.play.length)).toEqual([3, 3, 3, 3, 3, 3])
    for (const c of units.flatMap((u) => u.play)) {
      expect(c.hints, c.id).toHaveLength(3)
      expect((c.walkthrough ?? []).length, c.id).toBeGreaterThan(0)
      expect(c.assigned, c.id).toBeUndefined()
    }
  })
})

describe('Q19 rulings: R1 beyond the book, R6 no Correction, R10 N counts spokes', () => {
  it('the coin walk is the one Go-deeper beat of the first unit, and it says it goes beyond the book in both tracks', () => {
    const b = beat('q19-random-walk:b5')
    expect(b.phase).toBe('deeper')
    expect(b.introduces).toBeUndefined()
    expect(b.text).toMatch(/beyond the book/i)
    expect(b.formal).toMatch(/beyond the book/i)
  })
  it('there is no Correction box (R6): the exact angle and “the walk is Grover” are refinements worded “our calculation finds”', () => {
    expect(Q19.corrections ?? []).toEqual([])
    expect(beat('q19-star-search:b4').formal).toContain('Our calculation finds exactly')
    expect(beat('q19-star-search:b4').formal).toContain('Chapter Q17’s chance')
  })
  it('exactly one authored Formal string is the Rosetta line for N: Bergou’s N counts the outer vertices in Section 7.6 and the vertices of a graph in Section 7.8', () => {
    const rosetta = beats.filter((b) => (b.formal ?? '').includes('Bergou’s $N$ counts'))
    expect(rosetta.map((b) => b.id)).toEqual(['q19-scatter:b1'])
    expect(beat('q19-scatter:b1').formal).toContain('in this chapter $N$ is always the number of spokes')
  })
  it('the units use the walk-graph kind where the plan says: no walker without a marked spoke or an extra edge, the ring only with a cut', () => {
    const kinds = new Set(beats.flatMap((b) => JSON.stringify([b.stage, b.reveal?.stage]).match(/"kind":"([a-z-]+)"/g) ?? []))
    for (const k of ['walk-graph', 'plot', 'circuit', 'amplitudes', 'complex-plane']) expect(kinds.has(`"kind":"${k}"`), k).toBe(true)
  })
})

describe('Q19 numbers worded from the engine, not from the plan (the judge’s notes)', () => {
  it('the star search started on the arriving edges peaks at step 5, not 4; at step 4 the chance is 0.78125', () => {
    expect(V.q19InStartStep).toBe(5)
    expect(V.q19InStart8).toBeCloseTo(V.q19StarP4, 12)
    expect(V.q19InStart4).toBeCloseTo(V.q19StarP2, 12)
    const b = beat('q19-star-search:b6')
    expect(JSON.stringify(b.stage)).toContain('"step":5')
    expect(JSON.stringify(b.stage)).toContain('"start":"in"')
    expect(b.text).toContain('at step 5, not 4')
    expect(b.text).not.toContain('same best chance, $0.9453$, at step 4')
  })
  it('every `...Gap` value is about 1e-15, never exactly 0 in general: it prints as 0 through d(x, 0) and the chapter never compares one with === 0', () => {
    const gaps = Object.entries(V).filter(([k]) => /Gap$|Unit8$|IsInv8$|IsGrover$|Binomial$|Poly$|Routes$|Closed$|Identity$|CharPoly8$|ExtraUnit$|Unit$/.test(k))
    expect(gaps.length).toBeGreaterThanOrEqual(15)
    for (const [k, v] of gaps) {
      expect(Math.abs(v), k).toBeLessThan(1e-12)
      expect(d(v, 0), k).toBe('0')
    }
    expect(Q19Story).not.toMatch(/q19\w*(Gap|Unit8|IsInv8|IsGrover|Binomial|Poly|Routes|Closed|Identity|CharPoly8|ExtraUnit)\s*===\s*0/)
  })
  it('the first-order error halves as M doubles (2.00 from 4 to 8) and the second-order error falls by 4.00; the chapter says exactly that', () => {
    expect(d(V.q19TrotRatio1, 2)).toBe('2.00')
    expect(d(V.q19Trot2Ratio, 2)).toBe('4.00')
    expect(beat('q19-simulation:b3').claims!.some((c) => c.text.includes('q19TrotRatio1'))).toBe(true)
  })
  it('the quantum coin spreads linearly (sigma/n near 0.5412) and the fair coin as the square root; after three steps the two agree', () => {
    expect(d(V.q19CoinRatio100, 4)).toBe('0.5412')
    expect(V.q19CoinSigma100).toBeGreaterThan(5 * V.q19SigmaClass100)
    expect(V.q19Coin3Binomial).toBeLessThan(1e-12)
  })
  it('the extra-edge search needs the minus sign: within 40 steps the plus start never exceeds 0.083 on spokes 1, 2, against 0.70 with the minus sign', () => {
    expect(V.q19ExtraPlus64).toBeLessThan(0.083)
    expect(V.q19ExtraNear64).toBeGreaterThan(0.7)
    expect(V.q19ExtraPeak64).toBe(11)
    expect(V.q19ExtraPeak1024).toBe(44)
  })
  it('the QAOA square: best average cut 3 at (45°, 22.5°), optimal cut with chance 17/32, the pattern search makes 7 moves and 49 evaluations', () => {
    expect(V.q19FStar).toBeCloseTo(3, 12)
    expect([V.q19GammaStar, V.q19BetaStar]).toEqual([45, 22.5])
    expect(V.q19QaoaPOpt).toBeCloseTo(17 / 32, 12)
    expect([V.q19LoopMoves, V.q19LoopEvals]).toEqual([7, 49])
    expect([V.q19Shots90, V.q19Shots90Random]).toEqual([4, 18])
  })
})

describe('Q19 challenges read their numbers from V (the Q17 lint, for this chapter)', () => {
  /** Every value a challenge may quote: V itself, V squared, the powers of 1 − p, and the plain constants some hints quote. */
  const known: number[] = [...Object.values(V), ...Object.values(V).map((x) => x * x), ...[2, 3, 4].map((k) => (1 - V.q19QaoaPOpt) ** k), 1 - V.q19QaoaPOpt, 5 * V.q19Alpha8, -V.q19Vertex5MinusR]
  const decimals = (text: string): string[] =>
    [...text.replace(/(Eqs?\.|§|Problem|Unit|Theorem)\s*[\d.]+/g, ' ').matchAll(/(?<![\d.{])(\d+\.\d{2,})(?![\d])/g)].map((m) => m[1])
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
          for (const shown of decimals(t)) {
            const x = Number(shown)
            const places = shown.split('.')[1].length
            if (!known.some((v) => Math.abs(v - x) <= 0.5 * 10 ** -places + 1e-12)) bad.push(`${c.id}: ${shown}`)
          }
    expect(bad).toEqual([])
  })
  it('and none is typed: in the source of every challenge, a decimal of two or more places appears only inside a ${…} read of V', () => {
    const blocks = [...Q19Source.matchAll(/play: \[([\s\S]*?)\n      \],/g)].map((m) => m[1])
    expect(blocks).toHaveLength(units.length)
    const typed = blocks.flatMap((blk) =>
      [...blk
        .replace(/\$\{[^}]*\}/g, ' ')
        .replace(/tolerance: [\d.]+/g, ' ')
        .replace(/(Eqs?\.|§|Problem|Unit|Theorem)\s*[\d.]+/g, ' ')
        .matchAll(/(?<![\d.{])(\d+\.\d{2,})(?![\d])/g)].map((m) => m[1]),
    )
    expect(typed).toEqual([])
  })
  it('the lint sees the numbers (guard against a vacuous pass): the chapter’s challenges carry many decimals', () => {
    expect(units.flatMap((u) => u.play).flatMap((c) => texts(c)).flatMap(decimals).length).toBeGreaterThan(8)
  })
  it('the answers are the engine’s: 0.375, 10, 432, 0.4, −0.6, 14.478, 0.945, 12, 0.144, 0.667, 1048576, 3.142, 2, 0.531, 4', () => {
    const ans = Object.fromEntries(units.flatMap((u) => u.play).filter((c) => c.kind === 'numeric').map((c) => [c.id, (c as { answer: number }).answer]))
    expect(ans['q19-w-p4']).toBeCloseTo(0.375, 12)
    expect(ans['q19-w-sigma']).toBeCloseTo(10, 9)
    expect(ans['q19-w-conn']).toBe(432)
    expect(ans['q19-v-t']).toBeCloseTo(0.4, 12)
    expect(ans['q19-v-r']).toBeCloseTo(-0.6, 12)
    expect(ans['q19-s-alpha']).toBeCloseTo(14.4775, 4)
    expect(ans['q19-s-p4']).toBeCloseTo(0.9453, 4)
    expect(ans['q19-s-n64']).toBe(12)
    expect(ans['q19-e-delta']).toBeCloseTo(0.1443, 4)
    expect(ans['q19-e-near']).toBeCloseTo(2 / 3, 12)
    expect(ans['q19-m-amps']).toBe(1048576)
    expect(ans['q19-m-swap']).toBeCloseTo(Math.PI, 12)
    expect(ans['q19-q-cut']).toBe(2)
    expect(ans['q19-q-pstar']).toBeCloseTo(0.53125, 12)
    expect(ans['q19-q-shots']).toBe(4)
  })
  it('an integer answer carries tolerance 0 and a decimal one 0.005; the three choice challenges have exactly one correct option', () => {
    for (const c of units.flatMap((u) => u.play)) {
      if (c.kind === 'numeric') expect([0, 0.005], c.id).toContain(c.tolerance)
      if (c.kind === 'numeric' && Number.isInteger(c.answer)) expect(c.tolerance === 0 || c.id === 'q19-w-sigma', c.id).toBe(true)
      if (c.kind === 'choice') expect(c.options.filter((o) => o.correct), c.id).toHaveLength(1)
    }
    expect(units.flatMap((u) => u.play).filter((c) => c.kind === 'choice').map((c) => c.id)).toEqual(['q19-v-two', 'q19-e-sign', 'q19-m-ratio'])
  })
})

describe('Q19 references: the pages and equations the books list are the ones the text cites', () => {
  const where = (unit: string, source: 'bergou' | 'nc') => units.find((u) => u.id === unit)!.books.find((b) => b.source === source)!.where
  it('each unit cites its Bergou pages (130–142) and the Trotter unit its N&C pages (206–208)', () => {
    expect(where('q19-random-walk', 'bergou')).toBe('§7.6, pp. 130–131')
    expect(where('q19-scatter', 'bergou')).toBe('§7.6, pp. 131–132, Eqs. 7.45–7.48, Fig. 7.7')
    expect(where('q19-star-search', 'bergou')).toBe('§7.6, pp. 132–135, Eqs. 7.49–7.63')
    expect(where('q19-extra-edge', 'bergou')).toContain('pp. 135–139, Eqs. 7.64–7.79, Fig. 7.8')
    expect(where('q19-simulation', 'bergou')).toBe('§7.7, pp. 140–141, Eqs. 7.80–7.82')
    expect(where('q19-simulation', 'nc')).toBe('§4.7, pp. 206–208, Eqs. 4.103–4.104')
    expect(where('q19-qaoa', 'bergou')).toBe('§7.8, pp. 141–142, Eqs. 7.83–7.86')
    expect(units.filter((u) => u.books.some((b) => b.source === 'nc')).map((u) => u.id)).toEqual(['q19-simulation'])
  })
  it('Bergou’s Problem 1 of §7.9 (P7.1 in the plan) is cited only: no challenge is built on it, and the cited text names it once, in the Go-deeper beat', () => {
    const ids = units.flatMap((u) => u.play.map((c) => c.id)).join(' ')
    expect(ids).not.toMatch(/p71|7-1/)
    expect(beat('q19-extra-edge:b6').formal).toContain('Problem 1 of §7.9')
    expect(beat('q19-extra-edge:b6').formal).toContain('cited, not worked')
  })
  it('equations are cited as “Eq. 7.49” or “Eqs. 7.50–7.53”, never as a bare (7.49) the number reader would take for a decimal', () => {
    expect(Q19Story).not.toMatch(/\(\s*7\.\d\d\s*\)/)
    expect(Q19Source).not.toMatch(/\(\s*7\.\d\d\s*\)/)
  })
  it('VQE is only named, in one sentence of the last Go-deeper beat (R7); the variational eigensolver is not worked', () => {
    const named = beats.filter((b) => /variational eigensolver/i.test(`${b.text} ${b.formal ?? ''}`)).map((b) => b.id)
    expect(named).toEqual(['q19-qaoa:b6'])
  })
})

describe('Q19 review fixes: results are worded for the window they hold in (S1 to S5)', () => {
  it('S1: the plus-start bound is “within 40 steps” in the text and the captions say “at most”, never “below” (the maximum 0.0829 is above 0.08)', () => {
    const b = beat('q19-extra-edge:b4')
    expect(b.text).toContain('Within 40 steps at $N = 64$')
    expect(b.caption).toContain('at most')
    expect(b.caption).not.toMatch(/below/)
    expect(b.captionFormal).toContain('stays at most')
    expect(b.captionFormal).not.toMatch(/below/)
    expect(V.q19ExtraPlus64).toBeGreaterThan(0.08)
  })
  it('S2: no extra-edge sentence calls the N = 1024 peak “the first peak”: it is the highest peak of the first swing', () => {
    const b = beat('q19-extra-edge:b5')
    const all = [b.formal, b.reveal!.text, b.reveal!.formal, b.reveal!.caption, b.reveal!.captionFormal].join(' ')
    expect(all).toContain('highest peak of the first swing')
    expect(all).not.toMatch(/\bfirst peak\b/)
    expect(b.reveal!.claims!.map((c) => c.text).join(' ')).toContain('highest peak of the first swing')
  })
  it('S3: the star-search plot is drawn only as far as its highest value is the 0.945 peak the caption names (to step 10, not the 0.9998 return at 12 and 13)', () => {
    const series = starWalkMarkedSeries(8, 14)
    expect(Math.max(...series.slice(0, 11))).toBeCloseTo(V.q19StarP4, 12)
    expect(Math.max(...series.slice(11))).toBeGreaterThan(V.q19StarP4)
    const plots = beats.filter((b) => JSON.stringify(b).includes('starWalkMarked8'))
    expect(plots.map((b) => b.id)).toEqual(['q19-star-search:b4'])
    expect(Q19Story).toContain("fn: 'starWalkMarked8', x: { from: 0, to: 10 }")
    expect(beat('q19-star-search:b4').caption).toContain('first peak')
  })
  it('S4: the walk is never sold as a further speed-up than Grover’s; the extra-edge count sets steps against list entries', () => {
    expect(beat('q19-star-search:b5').reveal!.text).toContain('same speed-up as Grover’s search, not a further one')
    expect(beat('q19-star-search:b5').reveal!.formal).toContain('Grover’s search, not a further one')
    expect(beat('q19-extra-edge:b5').reveal!.formal).toContain('steps are set against list entries')
  })
  it('S5: the 4-against-18 run count says it leaves out the tuning, in both tracks', () => {
    const b = beat('q19-qaoa:b6')
    expect(b.text).toContain('leaves out the tuning')
    expect(b.text).toContain('no saving')
    expect(b.formal).toContain('leave out the')
    expect(b.formal).toContain('tuning evaluations')
    expect(b.formal).toContain('open question')
  })
})

describe('Q19 review fixes: the Trotter citations (S8) and the Bergou problem and page labels (nits 3 and 6)', () => {
  it('S8: the O(Δt²) form is cited as N&C Eq. 4.103 on p. 208, never as p. 207 alone, and the explicit bound is labelled our derivation (Eq. 7.82 states the order)', () => {
    const b = beat('q19-simulation:b3')
    expect(b.formal).toContain('N&C Eq. 4.103, p. 208')
    expect(b.formal).not.toContain('N&C p. 207')
    expect(b.formal).toContain('our derivation')
    expect(b.formal).toContain('Eq. 7.82 gives the one-piece order')
    expect(b.derivation!.formal!.map((s) => s.why).join(' ')).toContain('our own derivation')
    expect(b.derivation!.formal!.map((s) => s.why).join(' ')).not.toContain('gives the bound of Eq. 7.82')
    const u = units.find((x) => x.id === 'q19-simulation')!
    expect(u.insightFormal).toContain('our bound')
    expect(GLOSSARY.find((g) => g.id === 'qc-trotter-formula')!.formal).toContain('N&C eq. 4.103, p. 208')
    expect(Q19Source + Q19Story).not.toMatch(/N&C p\. 207/)
  })
  it('nit 3: the hybrid-algorithm gloss cites pp. 141 to 142 (the idea opens §7.8 on p. 141)', () => {
    expect(GLOSSARY.find((g) => g.id === 'qc-hybrid-algorithm')!.formal).toContain('Bergou pp. 141–142')
  })
  it('nit 6: Bergou’s problem is “Problem 1 of §7.9” wherever it is cited (the page shows 1, not 7.1)', () => {
    expect(Q19Source + Q19Story).not.toMatch(/Problem 7\.1/)
    expect(units.find((u) => u.id === 'q19-extra-edge')!.books.find((b) => b.source === 'bergou')!.where).toContain('Problem 1 of §7.9 (p. 142) cited only')
  })
})
