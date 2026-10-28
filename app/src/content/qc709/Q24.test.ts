/**
 * Chapter Q24's own invariants (rulings qc709-Q20-Q27.md Z1-Z7): the shape of the chapter (six units, 28 beats, five clues, no Go-deeper beat, all books-phase), the four notation entries
 * on two notation beats, the seven derivations, the two proposed Corrections (Z3: "our calculation finds ...", shown at a revealing point, for the independent review to confirm),
 * the Rosetta line, the numbers the builder worded from the engine, every decimal of a challenge read from `V`, and the book references. (The generic lints, symbols before use, claims
 * against numpy, derivation views, run in content.test.tsx, symbols.test.ts and claims.test.ts for every chapter.)
 */
import { describe, expect, it } from 'vitest'
import { Q24 } from './Q24'
import Q24Source from './Q24.ts?raw'
import Q24Story from './Q24.story.ts?raw'
import { GLOSSARY } from './Q24.glossary'
import { V, d } from './Q24.values'
import { positivityMin } from '../../physics/qc/blocheq'
import { echoCoherence, ouCoherence, t2star } from '../../physics/qc/pulses'

const units = Q24.units
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

describe('Q24 shape: six units, 28 beats, five clues, no Go-deeper beat, all books-phase', () => {
  it('has the planned units in order, with 3 + 6 + 5 + 6 + 5 + 3 beats', () => {
    expect(units.map((u) => u.id)).toEqual(['q24-divincenzo', 'q24-lindblad', 'q24-bloch-eq', 'q24-rabi', 'q24-ramsey', 'q24-decoupling'])
    expect(units.map((u) => (u.story ?? []).length)).toEqual([3, 6, 5, 6, 5, 3])
    expect(beats).toHaveLength(28)
  })
  it('the phases run books → clue; each clue closes its unit’s teaching beats (the dephasing beat moved before the clue: the lint wants books before clues) and no unit opens with one', () => {
    expect(new Set(beats.map((b) => b.phase))).toEqual(new Set(['books', 'clue']))
    expect(beats.filter((b) => b.phase === 'clue').map((b) => b.id)).toEqual(['q24-divincenzo:b3', 'q24-lindblad:b6', 'q24-bloch-eq:b5', 'q24-rabi:b6', 'q24-ramsey:b5'])
    for (const u of units) expect((u.story ?? [])[0].phase, `${u.id} opens with a books beat`).toBe('books')
    expect(beat('q24-lindblad:b5').text).toContain('dephasing')
  })
  it('the notation beats each introduce their entries, at or before first use: the Lindblad operator, then the Rabi frequency, detuning and inversion', () => {
    const intro = beats.filter((b) => b.introduces?.length).map((b) => [b.id, b.introduces!.join()])
    expect(intro).toEqual([
      ['q24-lindblad:b1', 'qc-lindblad-operator'],
      ['q24-bloch-eq:b2', 'qc-rabi-frequency,qc-detuning,qc-population-inversion'],
    ])
    expect(GLOSSARY.filter((g) => g.introduces).map((g) => [g.id, g.introduces, g.first])).toEqual([
      ['qc-lindblad-operator', 'notation', 'q24-lindblad:b1'],
      ['qc-rabi-frequency', 'notation', 'q24-bloch-eq:b2'],
      ['qc-detuning', 'notation', 'q24-bloch-eq:b2'],
      ['qc-population-inversion', 'notation', 'q24-bloch-eq:b2'],
    ])
    expect(GLOSSARY).toHaveLength(15)
  })
  it('seven derivations (Ground 24 steps, Formal 17), each with at least as many Ground-up steps as Formal ones', () => {
    const ds = beats.filter((b) => b.derivation)
    expect(ds.map((b) => b.id)).toEqual(['q24-lindblad:b2', 'q24-lindblad:b4', 'q24-rabi:b1', 'q24-rabi:b5', 'q24-ramsey:b1', 'q24-ramsey:b3', 'q24-decoupling:b1'])
    for (const b of ds) expect(b.derivation!.ground.length, b.id).toBeGreaterThanOrEqual(b.derivation!.formal!.length)
    expect(ds.reduce((n, b) => n + b.derivation!.ground.length, 0)).toBe(24)
    expect(ds.reduce((n, b) => n + b.derivation!.formal!.length, 0)).toBe(17)
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
    expect(units.flatMap((u) => u.play).filter((c) => c.kind === 'choice').map((c) => c.id)).toEqual(['q24-d-fly', 'q24-b-inv', 'q24-r-sign', 'q24-e-alt'])
  })
})

describe('Q24 rulings: Z2 no hardware digits, Z3 two Corrections for the review to confirm, a Rosetta line', () => {
  it('there is no experimental number: no `reported` claim and no measured hardware figure (model inputs are named as such)', () => {
    expect(beats.every((b) => !b.reported)).toBe(true)
    expect(Q24Story).not.toMatch(/\b\d+(\.\d+)?\s*(kHz|MHz|GHz|THz|ns|µs|μs|mK)\b/)
    expect(beat('q24-divincenzo:b3').formal).toContain('model values')
  })
  it('exactly two Corrections, both worded “our calculation finds” with an engine check, both from the book', () => {
    expect(Q24.corrections).toHaveLength(2)
    for (const c of Q24.corrections ?? []) {
      expect(c.shouldSay).toMatch(/^Our calculation finds/)
      expect(c.source).toBe('book')
      expect(c.check()).toBe(true)
    }
    expect((Q24.corrections ?? []).map((c) => c.where)).toEqual(['Bergou p. 209, §12.4.1, the R_x line', 'Bergou p. 206, Eq. 12.5b'])
  })
  it('the Corrections are shown where they apply: the R_x sign at the X and Y gates, the sign of Eq. 12.5b at the steady state', () => {
    const c1 = beat('q24-rabi:b4')
    expect(c1.formal).toContain('Correction')
    expect(c1.text).toContain('Our calculation finds')
    expect(c1.claims!.map((c) => c.text.split(' · ')[0])).toEqual(expect.arrayContaining(['q24SignRxPlus', 'q24SignRxMinus', 'q24RyGap', 'q24RxNegGap']))
    const c2 = beat('q24-bloch-eq:b3')
    expect(c2.formal).toContain('Correction')
    expect(c2.claims!.map((c) => c.text.split(' · ')[0])).toEqual(expect.arrayContaining(['q24RtRe', 'q24RtReSign', 'q24FullGapDerived', 'q24FullGapPrinted']))
    expect(V.q24SignRxMinus).toBeLessThan(1e-12)
    expect(V.q24SignRxPlus).toBeCloseTo(Math.SQRT2, 12)
    expect(V.q24RtReSign).toBe(-1)
    expect(V.q24RtPrintedReSign).toBe(1)
  })
  it('the Rosetta line (Townsend’s ω₁ = 2Ω against Bergou’s Ω) is in the Rabi unit’s first beat, in both tracks, and Problems 2, 5 and 7 are cited and never worked', () => {
    expect(beat('q24-rabi:b1').formal).toContain('Rosetta')
    expect(beat('q24-rabi:b1').formal).toContain('\\omega_1$ is $2\\Omega')
    expect(beat('q24-rabi:b1').text).toContain('\\omega_1 = 2\\Omega')
    const prompts = units.flatMap((u) => u.play).map((c) => c.prompt.toLowerCase())
    expect(prompts.every((p) => !p.includes('problem'))).toBe(true)
    expect(beats.filter((b) => (b.formal ?? '').includes('Problem')).map((b) => b.id)).toEqual(['q24-lindblad:b5', 'q24-rabi:b5', 'q24-decoupling:b3'])
  })
})

describe('Q24 numbers worded from the engine, not from the plan (the builder’s notes)', () => {
  it('the steady-state picture is nearly full length with r = (−0.0995, 0.0003, 0.9950), not the “short arrow” of the plan', () => {
    expect(V.q24WssFig).toBeCloseTo(0.995, 3)
    expect(beat('q24-bloch-eq:b4').caption).not.toMatch(/short/)
  })
  it('positivity: T2 = 2 T1 never gives a negative eigenvalue and T2 = 3 T1 does, by 0.0096 near 3.17 T1 (bounded search)', () => {
    expect(positivityMin(1, 2).min).toBeGreaterThan(-1e-12)
    expect(V.q24MinEig3).toBeCloseTo(0.0096, 4)
    expect(V.q24MinEigAt).toBe(3.17)
    expect(V.q24MinEig3Sign).toBe(-1)
  })
  it('the steady inversion never reaches one half, the width law is 2√(1+s), and a stronger drive widens the curve', () => {
    expect(V.q24ReeRes100).toBeLessThan(0.5)
    expect(V.q24FWHM3 / V.q24FWHM0).toBe(2)
    expect(V.q24FWHM8).toBe(6)
    expect(Number.isInteger(V.q24FWHM8)).toBe(true)
  })
  it('fast noise has the longer T2*: tau_c = 0.1 gives 10.1 against 1.448 for 10, between the limits 10 and √2; the middle case σ = τc = 1 lies beyond the slow limit', () => {
    expect(V.q24T2starFast).toBeGreaterThan(V.q24T2starSlow)
    expect(V.q24T2starFast).toBeCloseTo(10.1, 9)
    expect(V.q24T2starMid).toBeGreaterThan(V.q24T2starStatic)
    expect(V.q24T2starMid).toBeGreaterThan(1)
    expect(t2star(1, 1)).toBeCloseTo(1.8414056604, 9)
  })
  it('the echo wins for slow noise (0.940 against 0.154) and is a wash for fast noise (0.844 against 0.827)', () => {
    expect(echoCoherence(1, 1, 10)).toBeGreaterThan(5 * ouCoherence(2, 1, 10))
    expect(Math.abs(V.q24EchoCoh01 - V.q24RamseyCoh01)).toBeLessThan(0.02)
  })
  it('the composite pulse squares the error: the ratio at ε = 0.01 is 63.7 and at ε = 0.1 the two errors are 0.157 and 0.0245', () => {
    expect(V.q24RatioEps01).toBeCloseTo(63.665, 3)
    expect(V.q24ErrPlain10 / V.q24ErrComp10).toBeCloseTo(6.4, 1)
  })
  it('every `...Gap` value is about 1e-15, never exactly 0 in general: it prints as 0 through d(x, 0) and the chapter never compares one with === 0', () => {
    for (const [k, x] of Object.entries(V)) if (k.endsWith('Gap')) expect(Math.abs(x), k).toBeLessThan(1e-12)
    expect(Q24Story).not.toMatch(/Gap\s*===\s*0/)
    expect(d(V.q24U127Gap, 0)).toBe('0')
  })
  it('the rounded keys (numerical integrals and searches) hold exactly the digits the text shows', () => {
    expect(V.q24RwaRelErr).toBe(0.0087)
    expect(V.q24FullGapDerived).toBe(0.00055)
    expect(V.q24FullGapPrinted).toBe(0.696)
    expect(V.q24ReeAvgEarly).toBe(0.0047)
    expect(V.q24ReeAvgLate).toBe(0.002488)
    expect(V.q24KrausGapRatio).toBe(4)
  })
})

describe('Q24 challenges read their numbers from V (the Q17 lint, for this chapter)', () => {
  /** Every value a challenge may quote: V itself and V squared. */
  const known: number[] = [...Object.values(V), ...Object.values(V).map((x) => x * x)]
  const decimals = (text: string): string[] =>
    [...text.replace(/(Eqs?\.|§|Problem|Unit|Theorem)\s*[\d.]+/g, ' ').matchAll(/(?<![\d.{])(\d+\.\d{2,})(?![\d])/g)].map((m) => m[1])
  const texts = (c: (typeof units)[number]['play'][number]): string[] => [
    c.prompt,
    ...c.hints.map((h) => h.text),
    ...(c.walkthrough ?? []).map((w) => w.text),
    ...(c.kind === 'choice' ? c.options.flatMap((o) => [o.text, o.why]) : []),
  ]
  it('every decimal with two or more places in a prompt, hint, walkthrough or option matches a value of V to its shown precision', () => {
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
    const blocks = [...Q24Source.matchAll(/play: \[([\s\S]*?)\n      \],/g)].map((m) => m[1])
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
  it('the answers are the engine’s: 500, 0.9048, 10, 0.0677, 1.714, 0.375, 6, 0.785, 0.5, 0.25, 36.87, 0.3247, 27, 0.6311', () => {
    const ans = Object.fromEntries(units.flatMap((u) => u.play).filter((c) => c.kind === 'numeric').map((c) => [c.id, (c as { answer: number }).answer]))
    expect(ans['q24-d-n']).toBe(500)
    expect(ans['q24-d-keep']).toBeCloseTo(Math.exp(-0.1), 12)
    expect(ans['q24-l-t2']).toBe(10)
    expect(ans['q24-l-ee']).toBeCloseTo(Math.exp(-2) / 2, 12)
    expect(ans['q24-l-tphi']).toBeCloseTo(12 / 7, 12)
    expect(ans['q24-b-res']).toBeCloseTo(0.375, 12)
    expect(ans['q24-b-width']).toBe(6)
    expect(ans['q24-r-tpi']).toBeCloseTo(Math.PI / 4, 12)
    expect(ans['q24-r-ceil']).toBeCloseTo(0.5, 12)
    expect(ans['q24-m-p1']).toBeCloseTo(0.25, 12)
    expect(ans['q24-m-tilt']).toBeCloseTo((Math.atan2(1.5, 2) * 180) / Math.PI, 9)
    expect(ans['q24-m-gauss']).toBeCloseTo(Math.exp(-9 / 8), 12)
    expect(ans['q24-e-err']).toBe(27)
    expect(ans['q24-e-coh']).toBeCloseTo(0.631096417, 8)
  })
  it('an integer answer carries tolerance 0 and a decimal one 0.005; each choice challenge has exactly one correct option', () => {
    for (const c of units.flatMap((u) => u.play)) {
      if (c.kind === 'numeric') expect([0, 0.005], c.id).toContain(c.tolerance)
      if (c.kind === 'numeric' && c.tolerance === 0) expect(Number.isInteger(c.answer), c.id).toBe(true)
      if (c.kind === 'choice') expect(c.options.filter((o) => o.correct), c.id).toHaveLength(1)
    }
  })
})

describe('Q24 references: the pages and equations the book lists are the ones the text cites', () => {
  it('each unit cites its Bergou pages (201–218), and no N&C page is used', () => {
    expect(units.map((u) => u.lecture.pages)).toEqual([
      'Bergou §12.1, pp. 201–202 (no lecture-notes source)',
      'Bergou §12.2–12.3, pp. 202–205, Eqs. 12.1–12.2; Problem 2 cited (no lecture-notes source)',
      'Bergou §12.3–12.4, pp. 205–206 and 208, Eqs. 12.3–12.5, Fig. 12.3 (no lecture-notes source)',
      'Bergou §12.4–12.4.2, pp. 206–210, Eqs. 12.6–12.8, Fig. 12.2; Problem 5 cited (no lecture-notes source)',
      'Bergou §12.5, pp. 210–215, Eqs. 12.9–12.12, Figs. 12.4–12.5 (no lecture-notes source)',
      'Bergou §12.5.1, pp. 215–216; Problem 7 cited (no lecture-notes source)',
    ])
    expect(units.flatMap((u) => u.books.map((b) => b.source))).toEqual(Array(6).fill('bergou'))
  })
  it('equations are cited as “Eq. 12.5” or “Eqs. 12.9–12.11”, never as a bare (12.5) the number reader would take for a decimal', () => {
    for (const s of strings()) expect(s, s.slice(0, 60)).not.toMatch(/\(12\.\d+[a-c]?\)/)
  })
  it('the glossary reuses Q13’s kraus operators and amplitude damping, Q8’s Bloch ball and the Spin Lab rotating-wave step without redefining them', () => {
    const ids = GLOSSARY.map((g) => g.id)
    for (const reused of ['qc-kraus-operator', 'qc-amplitude-damping', 'qc-bloch-ball', 'qc-quantum-channel', 'qc-von-neumann-equation', 'qc-rotation-operator', 'qc-precession', 'qc-collective-dephasing', 'rotating-wave'])
      expect(ids).not.toContain(reused)
  })
  it('the sign Correction names the page and the line it changes, and every Correction text is plain (no TeX)', () => {
    for (const c of Q24.corrections ?? []) {
      expect(c.says).not.toContain('$')
      expect(c.shouldSay).not.toContain('$')
    }
  })
})
