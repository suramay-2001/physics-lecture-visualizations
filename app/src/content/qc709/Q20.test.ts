/**
 * Chapter Q20's own invariants (rulings qc709-Q20-Q27.md Z1-Z7): the shape of the chapter (six units, 37 beats, six clues, four Go-deeper beats, all books-phase), the two notation
 * beats, the seven derivations, the two proposed Corrections (Z3: "our calculation finds ...", shown at a revealing point, for the independent review to confirm), the Rosetta lines,
 * the numbers the builder worded from the engine, every decimal of a challenge read from `V`, and the book references. (The generic lints, symbols before use, claims against numpy,
 * derivation views, run in content.test.tsx, symbols.test.ts and claims.test.ts for every chapter.)
 */
import { describe, expect, it } from 'vitest'
import { Q20 } from './Q20'
import Q20Source from './Q20.ts?raw'
import Q20Story from './Q20.story.ts?raw'
import { GLOSSARY } from './Q20.glossary'
import { C_RUS, SIGNED, V, d } from './Q20.values'
import { circuitUnitary } from '../../physics/qc/circuit'
import { discGridBest, programmableUsdBest, pairAtOverlap, rusRounds } from '../../physics/qc/machines'

const units = Q20.units
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

describe('Q20 shape: six units, 37 beats, six clues, four Go-deeper beats, all books-phase', () => {
  it('has the planned units in order, with 7 + 6 + 6 + 6 + 6 + 6 beats', () => {
    expect(units.map((u) => u.id)).toEqual(['q20-cloner', 'q20-unot', 'q20-no-go', 'q20-probabilistic', 'q20-bell-programs', 'q20-discriminator'])
    expect(units.map((u) => (u.story ?? []).length)).toEqual([7, 6, 6, 6, 6, 6])
    expect(beats).toHaveLength(37)
  })
  it('the phases run books → clue → deeper; each Go-deeper beat is the last of its unit and no unit opens with one; only the cloner’s ends in a cited-only problem', () => {
    expect(new Set(beats.map((b) => b.phase))).toEqual(new Set(['books', 'clue', 'deeper']))
    expect(beats.filter((b) => b.phase === 'clue').map((b) => b.id)).toEqual(['q20-cloner:b6', 'q20-unot:b6', 'q20-no-go:b5', 'q20-probabilistic:b5', 'q20-bell-programs:b5', 'q20-discriminator:b6'])
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['q20-cloner:b7', 'q20-no-go:b6', 'q20-probabilistic:b6', 'q20-bell-programs:b6'])
    for (const u of units) {
      const s = u.story ?? []
      expect(s[0].phase, `${u.id} opens with a books beat`).toBe('books')
      s.forEach((b, i) => b.phase === 'deeper' && expect(i, `${b.id} is the last beat`).toBe(s.length - 1))
    }
    expect(beat('q20-cloner:b7').formal).toContain('⚑')
  })
  it('the two notation beats each introduce one entry, at or before its first use', () => {
    const intro = beats.filter((b) => b.introduces?.length).map((b) => [b.id, b.introduces!.join()])
    expect(intro).toEqual([
      ['q20-cloner:b1', 'qc-copy-fidelity'],
      ['q20-no-go:b1', 'qc-programmable-processor'],
    ])
    expect(GLOSSARY.filter((g) => g.introduces).map((g) => [g.id, g.introduces, g.first])).toEqual([
      ['qc-copy-fidelity', 'notation', 'q20-cloner:b1'],
      ['qc-programmable-processor', 'space', 'q20-no-go:b1'],
    ])
    expect(GLOSSARY).toHaveLength(13)
  })
  it('seven derivations (Ground 23 steps, Formal 16), each with at least as many Ground-up steps as Formal ones', () => {
    const ds = beats.filter((b) => b.derivation)
    expect(ds.map((b) => b.id)).toEqual(['q20-cloner:b3', 'q20-cloner:b4', 'q20-unot:b4', 'q20-no-go:b3', 'q20-probabilistic:b3', 'q20-bell-programs:b3', 'q20-discriminator:b4'])
    for (const b of ds) expect(b.derivation!.ground.length, b.id).toBeGreaterThanOrEqual(b.derivation!.formal!.length)
    expect(ds.reduce((n, b) => n + b.derivation!.ground.length, 0)).toBe(23)
    expect(ds.reduce((n, b) => n + b.derivation!.formal!.length, 0)).toBe(16)
  })
  it('eighteen challenges, three per unit, each with exactly three hints and a full walkthrough (no sheet assigns any of them); four are choices', () => {
    for (const u of units) {
      expect(u.play, u.id).toHaveLength(3)
      for (const c of u.play) {
        expect(c.hints, c.id).toHaveLength(3)
        expect(c.walkthrough?.length ?? 0, c.id).toBeGreaterThan(0)
        expect(c.assigned, c.id).toBeFalsy()
      }
    }
    expect(units.flatMap((u) => u.play).filter((c) => c.kind === 'choice').map((c) => c.id)).toEqual(['q20-c-keep', 'q20-u-mp', 'q20-n-phase', 'q20-b-which'])
  })
})

describe('Q20 rulings: Z2 no hardware digits, Z3 two Corrections for the review to confirm, a Rosetta line for each clash', () => {
  it('there is no experimental number: the chapter is theory (no `reported` claim and no hardware word)', () => {
    expect(beats.every((b) => !b.reported)).toBe(true)
    expect(Q20Story).not.toMatch(/\b(coherence time|T1|T2|trapped|superconducting)\b/)
  })
  it('exactly two Corrections, both worded “our calculation finds” with an engine check, both from the book', () => {
    expect(Q20.corrections).toHaveLength(2)
    for (const c of Q20.corrections ?? []) {
      expect(c.shouldSay).toMatch(/^Our calculation finds/)
      expect(c.source).toBe('book')
      expect(c.check()).toBe(true)
    }
    expect((Q20.corrections ?? []).map((c) => c.where)).toEqual(['Bergou p. 148, end of §8.2', 'Bergou pp. 156–157, Eqs. 8.42–8.43'])
  })
  it('the Corrections are shown where they apply: the pair overlap at the measure-and-prepare clue, the constant at the programmable discriminator’s optimum', () => {
    const c1 = beat('q20-unot:b6').reveal!
    expect(c1.formal).toContain('Correction')
    expect(c1.claims!.map((c) => c.text.split(' · ')[0])).toEqual(expect.arrayContaining(['q20MpCloneSingle', 'q20MpCloneBoth', 'q20CloneBoth']))
    const c2 = beat('q20-discriminator:b4')
    expect(c2.formal).toContain('Correction')
    expect(c2.claims!.map((c) => c.text.split(' · ')[0])).toEqual(expect.arrayContaining(['q20ConstTrue', 'q20ConstPrinted', 'q20DiscPrintedAbs', 'q20BlockEigHi']))
    // the true determinant is zero at c = 2/3 while the printed constant gives two thirds and a negative discriminant
    expect(V.q20ConstTrue).toBeCloseTo(0, 12)
    expect(V.q20ConstPrinted).toBeCloseTo(2 / 3, 12)
    expect(V.q20DiscPrintedAbs).toBeCloseTo(20 / 9, 12)
    expect(SIGNED.discPrinted).toBeCloseTo(-20 / 9, 12)
  })
  it('the harmless sign slip after Eq. 8.6 is a Rosetta line in unot:b3, not a box; the fidelity Rosetta is in cloner:b1 and the U(α) Rosetta in probabilistic:b1', () => {
    expect(beat('q20-unot:b3').formal).toMatch(/Rosetta: here \$U_0\|0\\rangle = \+\|1\\rangle\$/)
    expect(beat('q20-cloner:b1').formal).toContain('Rosetta')
    expect(beat('q20-cloner:b1').formal).toContain('F^2')
    expect(beat('q20-probabilistic:b1').formal).toContain('Rosetta')
    expect(beat('q20-probabilistic:b1').formal).toContain('R_z(-2\\alpha)')
    expect(beat('q20-bell-programs:b1').formal).toContain('Bergou\'s $\\Psi_\\pm')
  })
  it('the state to flip is χ (Bergou’s φ, kept for an angle) and Bergou’s name is given once, in bell-programs:b2', () => {
    expect(beat('q20-bell-programs:b2').formal).toContain("Bergou's $|\\phi\\rangle$")
    expect(beats.filter((b) => (b.formal ?? '').includes('|\\phi\\rangle')).map((b) => b.id)).toEqual(['q20-bell-programs:b2'])
  })
})

describe('Q20 numbers worded from the engine, not from the plan (the builder’s notes)', () => {
  it('the retry circuit keeps the first reading coherent: the Toffoli form of two rounds and Eq. 8.30’s larger program are one circuit (five columns), so b3 and b4 of the probabilistic unit share it', () => {
    expect(C_RUS.columns).toHaveLength(5)
    expect(beat('q20-probabilistic:b3').formal).toContain('keeps the first reading coherent')
    expect(beat('q20-probabilistic:b4').text).toContain('same circuit')
    // a unitary part of 3 wires: the first four columns
    expect(circuitUnitary({ ...C_RUS, columns: C_RUS.columns.slice(0, 4) }).length).toBe(8)
  })
  it('the U-NOT limit is 1/3 (bisection on the smallest Choi eigenvalue), the clone is 2/3 as long, wire 3 is 1/3 as long and the product c0 c1 peaks at 1/3', () => {
    expect(V.q20UnotPStar).toBeCloseTo(1 / 3, 12)
    expect(V.q20ShrinkClone).toBeCloseTo(2 / 3, 12)
    expect(V.q20Rho3Len).toBeCloseTo(1 / 3, 12)
    expect(V.q20MaxC0C1).toBeCloseTo(1 / 3, 12)
    expect(V.q20ChoiNegP05).toBeCloseTo(0.125, 12)
  })
  it('the discriminator optimum is c = 2/3 and P = (1 - s^2)/3 by bisection on Pi0 >= 0; no grid point beats the symmetric optimum', () => {
    const [a, b] = pairAtOverlap(0.5)
    expect(programmableUsdBest(a, b).c).toBeCloseTo(2 / 3, 12)
    expect(discGridBest(30).sum).toBeLessThanOrEqual(2 * V.q20OptC + 1e-9)
    expect(V.q20DiscP05).toBeCloseTo(0.25, 12)
    expect(V.q20DiscRatio0707).toBeCloseTo((1 + Math.SQRT1_2) / 3, 12)
  })
  it('the retry law needs seven rounds for 0.99 and ten for 0.999, and the larger program gives three quarters', () => {
    expect(rusRounds(0.99)).toBe(7)
    expect(rusRounds(0.999)).toBe(10)
    expect(V.q20ToffoliSuccess).toBeCloseTo(0.75, 12)
    expect(V.q20Rus9).toBeCloseTo(1 - 2 ** -9, 12)
  })
  it('every `...Gap` value is about 1e-15, never exactly 0 in general: it prints as 0 through d(x, 0) and the chapter never compares one with === 0', () => {
    for (const [k, x] of Object.entries(V)) if (k.endsWith('Gap')) expect(Math.abs(x), k).toBeLessThan(1e-12)
    expect(Q20Story).not.toMatch(/Gap\s*===\s*0/)
    expect(d(V.q20Rho1Gap, 0)).toBe('0')
  })
  it('measure-and-prepare cloning matches its single copy to 2/3 and its pair to 1/2, against 2/3 for the circuit’s pair (the Correction’s numbers)', () => {
    expect(V.q20MpCloneSingle).toBeCloseTo(2 / 3, 12)
    expect(V.q20MpCloneBoth).toBeCloseTo(1 / 2, 12)
    expect(V.q20CloneBoth).toBeCloseTo(2 / 3, 12)
  })
})

describe('Q20 challenges read their numbers from V (the Q17 lint, for this chapter)', () => {
  /** Every value a challenge may quote: V itself, V squared, 1 − the targets, and the products the first walkthrough shows. */
  const known: number[] = [
    ...Object.values(V),
    ...Object.values(V).map((x) => x * x),
    1 - V.q20Target999,
    1 - V.q20Target99,
    V.q20C0u15 * V.q20C1u15,
    V.q20C0u15 ** 2 / 2,
  ]
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
    const blocks = [...Q20Source.matchAll(/play: \[([\s\S]*?)\n      \],/g)].map((m) => m[1])
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
  it('the answers are the engine’s: 0.667, 0.913, 0.333, −0.125, 256, −0.5, 0.875, −40, 10, 0.333, 0.5, 0.25, 0.569, 0.667', () => {
    const ans = Object.fromEntries(units.flatMap((u) => u.play).filter((c) => c.kind === 'numeric').map((c) => [c.id, (c as { answer: number }).answer]))
    expect(ans['q20-c-f2']).toBeCloseTo(2 / 3, 12)
    expect(ans['q20-c-root']).toBeCloseTo(Math.sqrt(5 / 6), 12)
    expect(ans['q20-u-len']).toBeCloseTo(1 / 3, 12)
    expect(ans['q20-u-choi']).toBeCloseTo(-0.125, 12)
    expect(ans['q20-n-ops']).toBe(256)
    expect(ans['q20-n-expz']).toBeCloseTo(-0.5, 12)
    expect(ans['q20-p-three']).toBeCloseTo(0.875, 12)
    expect(ans['q20-p-azimuth']).toBeCloseTo(-40, 9)
    expect(ans['q20-p-rounds']).toBe(10)
    expect(ans['q20-b-prob']).toBeCloseTo(1 / 3, 12)
    expect(ans['q20-b-coef']).toBeCloseTo(0.5, 12)
    expect(ans['q20-d-p']).toBeCloseTo(0.25, 12)
    expect(ans['q20-d-ratio']).toBeCloseTo((1 + Math.SQRT1_2) / 3, 12)
    expect(ans['q20-d-eig']).toBeCloseTo(2 / 3, 9)
  })
  it('an integer answer carries tolerance 0 and a decimal one 0.005; each choice challenge has exactly one correct option', () => {
    for (const c of units.flatMap((u) => u.play)) {
      if (c.kind === 'numeric') expect([0, 0.005], c.id).toContain(c.tolerance)
      if (c.kind === 'numeric' && c.tolerance === 0) expect(Number.isInteger(c.answer), c.id).toBe(true)
      if (c.kind === 'choice') expect(c.options.filter((o) => o.correct), c.id).toHaveLength(1)
    }
  })
})

describe('Q20 references: the pages and equations the book lists are the ones the text cites', () => {
  it('each unit cites its Bergou pages (145–157), and no N&C page is used (the no-go is Bergou’s own proof)', () => {
    expect(units.map((u) => u.lecture.pages)).toEqual([
      'Bergou §8.1–8.2, pp. 145–148 (no lecture-notes source)',
      'Bergou §8.2, pp. 146–148, Eqs. 8.6–8.12 (no lecture-notes source)',
      'Bergou §8.3, pp. 149–151, Eqs. 8.13–8.19 (no lecture-notes source)',
      'Bergou §8.4, pp. 151–154, Eqs. 8.20–8.21 and 8.29–8.30 (no lecture-notes source)',
      'Bergou §8.4, pp. 152–153, Eqs. 8.22–8.28; Problem 3 cited (no lecture-notes source)',
      'Bergou §8.5, pp. 154–157, Eqs. 8.31–8.47 (no lecture-notes source)',
    ])
    expect(units.flatMap((u) => u.books.map((b) => b.source))).toEqual(Array(6).fill('bergou'))
  })
  it('Bergou’s Problems 1 to 3 (P8.1-P8.3) are cited only: no challenge is built on them, and Problem 1 is named once, in the Go-deeper beat', () => {
    const prompts = units.flatMap((u) => u.play).map((c) => c.prompt.toLowerCase())
    expect(prompts.every((p) => !p.includes('problem'))).toBe(true)
    expect(beats.filter((b) => (b.formal ?? '').includes('Problem 1')).map((b) => b.id)).toEqual(['q20-cloner:b5', 'q20-cloner:b7'])
    expect(beat('q20-cloner:b6').reveal!.formal).toContain('Problem 2')
  })
  it('equations are cited as “Eq. 8.5” or “Eqs. 8.24–8.25”, never as a bare (8.5) the number reader would take for a decimal', () => {
    for (const s of strings()) expect(s, s.slice(0, 60)).not.toMatch(/\(8\.\d+\)/)
  })
  it('the 25-word Ground and 40-word Formal sentence caps hold for every Try-it line too', () => {
    for (const u of units)
      for (const line of u.visual.tryThis ?? []) for (const s of line.split(/(?<=[.!?])\s+/)) expect(s.split(/\s+/).length, `${u.id}: ${s}`).toBeLessThanOrEqual(25)
  })
  it('the glossary reuses Q13’s no-cloning, Q9’s fidelity and Q14’s POVM and unambiguous discrimination without redefining them', () => {
    const ids = GLOSSARY.map((g) => g.id)
    for (const reused of ['qc-no-cloning', 'qc-fidelity', 'qc-choi-matrix', 'qc-complete-positivity', 'qc-depolarizing', 'qc-povm', 'qc-unambiguous-discrimination', 'qc-toffoli', 'qc-cnot', 'qc-bell-state', 'qc-mixed-state'])
      expect(ids).not.toContain(reused)
  })
})
