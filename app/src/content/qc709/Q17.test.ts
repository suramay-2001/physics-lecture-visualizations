/**
 * Chapter Q17's own invariants, added with the review fixes (docs/roles/audits/P-Q17-review.md): the B18 box tested at a point where its claim can fail, every
 * decimal in a challenge read from `V` (the file header's rule, now a lint), one meaning per letter, and the book references. (The generic lints, symbols
 * before use, claims against numpy, derivation views, run in content.test.tsx, symbols.test.ts and claims.test.ts for every chapter.)
 */
import { describe, expect, it } from 'vitest'
import { eq715Gaps, perpOverlap } from '../../physics/qc/grover'
import { Q17 } from './Q17'
import Q17Source from './Q17.ts?raw'
import { E1_MIX, V } from './Q17.values'

const beats = Q17.units.flatMap((u) => u.story ?? [])
const beat = (id: string) => beats.find((b) => b.id === id)!
const corr = (where: string) => Q17.corrections!.find((c) => c.where === where)!

describe('Q17 Correction B18 (Eq. 7.15), review item 1', () => {
  it('is tested at a mix with c₁ ≠ 1, where the factor that lacks c₁ shows: printed 0.356, ket-only 0.283, corrected 0', () => {
    expect(E1_MIX.c1).not.toBe(1)
    expect(V.q17E1Printed).toBeGreaterThan(0.3)
    expect(V.q17E1FactorOnly).toBeGreaterThan(0.2)
    expect(V.q17E1Corrected).toBeLessThan(1e-9)
    expect(corr('Bergou p. 121, Eq. 7.15').check()).toBe(true)
  })
  it('the old test point c₁ = 1, c₂ = 0 cannot see the factor: mending the ket alone is already exact there (sanity case), while the printed form misses', () => {
    const g = eq715Gaps(3, 5, 1, 0)
    expect(g.printed).toBeGreaterThan(0.5)
    expect(g.ketOnly).toBeLessThan(1e-12)
    expect(g.corrected).toBeLessThan(1e-12)
  })
  it('the box quotes both gaps and the mix, all read from the engine values', () => {
    const say = corr('Bergou p. 121, Eq. 7.15').shouldSay
    expect(say).toContain(`${E1_MIX.c1}|w₀⟩ − ${Math.abs(E1_MIX.c2)}|x₀⟩`)
    expect(say).toContain(V.q17E1Printed.toFixed(3))
    expect(say).toContain(V.q17E1FactorOnly.toFixed(3))
  })
})

describe('Q17 Corrections B19 and B20, review items 3 and 7', () => {
  it('B19: the printed |w₀⊥⟩ is checked against |w₀⟩ too (same 0.756), and its minus sign makes it orthogonal', () => {
    expect(V.q17BookPerpOverlapW0).toBeCloseTo(perpOverlap(3, 5, 1, 'w0'), 12)
    expect(V.q17BookPerpOverlapW0).toBeCloseTo(V.q17BookPerpOverlap, 12)
    expect(V.q17PerpTrueOverlapW0).toBeLessThan(1e-9)
    expect(corr('Bergou pp. 121–122').shouldSay).not.toContain('by symmetry')
  })
  it('B20: the box quotes the overlap measured on the engine’s vectors, and the check compares it with cos α', () => {
    expect(V.q17CosMeasured).toBeCloseTo(V.q17CosA, 12)
    expect(corr('Bergou p. 123').shouldSay).toContain(V.q17CosMeasured.toFixed(4))
    expect(corr('Bergou p. 123').check()).toBe(true)
  })
})

describe('Q17 challenges read their numbers from V (review item 2)', () => {
  /** Every value a challenge may quote: V itself, V squared, and the answers' own multiples used in the walkthroughs. */
  const known: number[] = [...Object.values(V), ...Object.values(V).map((x) => x * x)]
  /** Equation numbers (Eq. 7.29) and section numbers are references, not results. */
  const decimals = (text: string): number[] =>
    [...text.replace(/(Eqs?\.|§|Problem|Unit|Theorem)\s*[\d.]+/g, ' ').matchAll(/(?<![\d.])(\d+\.\d{2,})(?![\d])/g)].map((m) => Number(m[1]))
  const texts = (c: (typeof Q17.units)[number]['play'][number]): string[] => [
    c.prompt,
    ...c.hints.map((h) => h.text),
    ...(c.walkthrough ?? []).map((w) => w.text),
    ...(c.kind === 'choice' ? c.options.flatMap((o) => [o.text, o.why]) : []),
  ]
  it('every decimal with two or more places in a prompt, hint, walkthrough or option matches a value of V to its shown precision', () => {
    const bad: string[] = []
    for (const u of Q17.units)
      for (const c of u.play)
        for (const t of texts(c))
          for (const x of decimals(t)) {
            const places = String(x).split('.')[1].length
            if (!known.some((v) => Math.abs(v - x) <= 0.5 * 10 ** -places + 1e-12)) bad.push(`${c.id}: ${x}`)
          }
    expect(bad).toEqual([])
  })
  it('and none is typed: in the source of every challenge, a decimal appears only inside a ${…} read of V (review item 2)', () => {
    const src = Q17Source
    const blocks = [...src.matchAll(/play: \[([\s\S]*?)\n      \],/g)].map((m) => m[1])
    expect(blocks).toHaveLength(Q17.units.length)
    const typed = blocks.flatMap((blk) =>
      [...blk
        .replace(/\$\{[^}]*\}/g, ' ')
        .replace(/tolerance: [\d.]+/g, ' ')
        .replace(/(Eqs?\.|§|Problem|Unit|Theorem)\s*[\d.]+/g, ' ')
        .matchAll(/(?<![\d.])(\d+\.\d+)(?![\d])/g)].map((m) => m[1]),
    )
    expect(typed).toEqual([])
  })
  it('the lint sees the numbers (guard against a vacuous pass): the chapter’s challenges carry many decimals', () => {
    const n = Q17.units.flatMap((u) => u.play).flatMap((c) => texts(c)).flatMap(decimals).length
    expect(n).toBeGreaterThan(25)
  })
})

describe('Q17 letters and references, review items 4–6', () => {
  it('θ means N&C’s angle only (θ/2 = α): the mirror-line angle of Theorem 1 is β, registered as a symbol', () => {
    const formal = JSON.stringify(beat('q17-two-reflections:b3').derivation!.formal)
    expect(formal).toContain('R_\\\\beta')
    expect(formal).not.toContain('\\\\theta')
    expect(Q17.symbols!['R_\\beta']).toBe('q17-two-reflections:b3')
    expect(Q17.symbols!['\\beta']).toBe('q17-two-reflections:b3')
    expect(Q17.symbols!['R_\\theta']).toBeUndefined()
  })
  it('the iterate unit cites N&C Eq. 6.7 on its own page and section: §6.1.2–6.1.4, pp. 251–254', () => {
    const nc = Q17.units.find((u) => u.id === 'q17-iterate')!.books.find((b) => b.source === 'nc')!
    expect(nc.where).toBe('§6.1.2–6.1.4, pp. 251–254, Eqs. 6.7, 6.12–6.17')
  })
  it('the lower-bound prompt states the bound’s condition: success above one half for every marked string', () => {
    const c = Q17.units.flatMap((u) => u.play).find((x) => x.id === 'q17-op-bound')!
    expect(c.prompt).toContain('chance above one half for every $x_0$')
  })
})
