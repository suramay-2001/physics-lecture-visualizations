import { describe, expect, it } from 'vitest'
import { DEMO } from './__fixtures__/demoStory'
import { L1 } from './L1'
import { glossRefs, inlineTokens, readingOrder, termRefs, texSpans, texSymbols } from './walk'

describe('content walker', () => {
  it('readingOrder lists story beats before the unit blocks, and covers challenges', () => {
    const sites = readingOrder(DEMO)
    const i = sites.findIndex((s) => s.where === 'demo-story:b1')
    const j = sites.findIndex((s) => s.where === 'demo-story.lecture')
    expect(i).toBeGreaterThan(-1)
    expect(i).toBeLessThan(j)
    expect(sites.some((s) => s.field === 'reveal.text')).toBe(true)
    const l1 = readingOrder(L1)
    expect(l1.some((s) => s.field === 'hint')).toBe(true)
    expect(l1.some((s) => s.field === 'walkthrough' || s.field === 'step')).toBe(true)
  })

  it('texSpans finds inline and display TeX; gloss and term refs skip TeX', () => {
    const t = 'A [[oven|hot oven]] and {{plus-spot|two spots}}: $x^2$ and $$\\htmlClass{term-psi}{\\psi}$$ **[[plate]]**'
    expect(texSpans(t)).toEqual([
      { tex: 'x^2', display: false },
      { tex: '\\htmlClass{term-psi}{\\psi}', display: true },
    ])
    expect(glossRefs(t)).toEqual(['oven', 'plate'])
    expect(termRefs(t)).toEqual(['plus-spot', 'psi'])
    expect(glossRefs('$[[not-a-gloss]]$')).toEqual([])
  })

  it('inlineTokens flags ids outside /^[a-z0-9-]+$/ as invalid (rendered as plain text)', () => {
    const toks = inlineTokens('[[Bad Id|x]] {{ok-1|y}}')
    expect(toks.filter((t) => t.t === 'gloss' || t.t === 'term').map((t) => ('valid' in t ? t.valid : null))).toEqual([false, true])
  })

  it('texSymbols: accents, subscripts, kets, bras; layout commands ignored', () => {
    expect(texSymbols('\\vec\\mu\\cdot\\vec B')).toEqual(['\\vec\\mu', '\\vec B'])
    expect(texSymbols('S_z = \\pm\\tfrac{\\hbar}{2}')).toEqual(['S_z', '\\hbar'])
    expect(texSymbols('|{+z}\\rangle')).toEqual(['|+z\\rangle'])
    expect(texSymbols('\\langle a|\\psi\\rangle')).toEqual(['\\langle a|\\psi\\rangle'])
    expect(texSymbols('\\sigma_x + \\hat n\\cdot\\text{beam}')).toEqual(['\\sigma_x', '\\hat n'])
  })
})
