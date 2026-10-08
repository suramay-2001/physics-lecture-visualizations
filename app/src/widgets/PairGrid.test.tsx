/**
 * Widget W4 `pair-grid` (448 Lecture 9): the Try-it draws the `matrix` stage kind's pair view with that kind's own resolver and scene,
 * so each number on the widget is the stage's number (engine-computed). These tests render each table through the real component
 * (renderToString, no Suspense) and read the numbers the Try-it lines of Lecture 9 promise.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import PairGrid from './PairGrid'

const html = (props: Parameters<typeof PairGrid>[0]) => renderToString(<PairGrid {...props} />)
const boxes = (h: string) => (h.match(/data-anchor="cell-\d+-\d+"/g) ?? []).length

describe('pair-grid widget', () => {
  it('photon ⊗ die: 2 × 6 = 12 boxes with their kets; switching to two spins is a control, not a prop', () => {
    const h = html({ frame: 'coin-die' })
    expect(boxes(h)).toBe(12)
    expect(h).toContain('dimension = 2 × 6 = 12 basis states')
    expect(h).toContain('|V3⟩')
    expect(h).toContain('role="radiogroup"')
    expect(h).toContain('two spins')
    expect(h).not.toMatch(/NaN|Infinity/)
  })

  it('two spins, separate: Alice 60°, Bob 90° reads 0.612, 0.612, 0.354, 0.354, Bob’s column totals 0.5 and the chances add to 1', () => {
    const h = html({ frame: 'spin', alice: [60, 0], bob: [90, 0] })
    expect(boxes(h)).toBe(4)
    for (const n of ['0.612', '0.354']) expect(h).toContain(n)
    expect(h).toContain('chances add to 1')
    expect(h).toContain('Bob: u 0.5, d 0.5')
    expect(h).toContain('data-anchor="factor-a"')
    expect(h).not.toContain('not a product')
    expect(h).not.toMatch(/NaN|Infinity/)
  })

  it('|u⟩|d⟩ lights exactly one box; flipping both spins lights the other', () => {
    const ud = html({ alice: [0, 0], bob: [180, 0] })
    expect(ud).toContain('Alice: u 1, d 0 · Bob: u 0, d 1')
    const du = html({ alice: [180, 0], bob: [0, 0] })
    expect(du).toContain('Alice: u 0, d 1 · Bob: u 1, d 0')
  })

  it('the ud–du family: t = 0 is a product, t = 45° the singlet; the factoring test is off unless asked for', () => {
    const quiet = html({ preset: 'family', t: 45 })
    expect(quiet).not.toContain('ψ_uuψ_dd')
    expect(quiet).not.toContain('product')
    const deep = html({ preset: 'family', t: 45, showDet: true })
    expect(deep).toContain('ψ_uuψ_dd − ψ_udψ_du = 0.5')
    expect(deep).toContain('not a product')
    const zero = html({ preset: 'family', t: 0, showDet: true })
    expect(zero).toContain('ψ_uuψ_dd − ψ_udψ_du = 0')
    expect(zero).toMatch(/>product</)
    // two separate spins never leave the product surface
    const prod = html({ preset: 'product', showDet: true, alice: [60, 45], bob: [120, 200] })
    expect(prod).toMatch(/>product</)
  })

  it('classical: the dealer’s coins give ⟨a⟩ = ⟨b⟩ = 0, ⟨ab⟩ = −1; two separate dealers 0.7 and 0.4 give ⟨ab⟩ = −0.08 and correlation 0', () => {
    const dealer = html({ mode: 'classical', coins: 'dealer' })
    expect(boxes(dealer)).toBe(4)
    expect(dealer).toContain('⟨a⟩ = 0, ⟨b⟩ = 0')
    expect(dealer).toContain('⟨ab⟩ = −1, correlation ⟨ab⟩ − ⟨a⟩⟨b⟩ = −1')
    const sep = html({ mode: 'classical', coins: 'independent', pA: 0.7, pB: 0.4 })
    expect(sep).toContain('⟨a⟩ = 0.4, ⟨b⟩ = −0.2')
    expect(sep).toContain('⟨ab⟩ = −0.08, correlation ⟨ab⟩ − ⟨a⟩⟨b⟩ = 0')
    expect(sep).not.toMatch(/NaN|Infinity/)
  })

  it('draws the matrix stage kind’s own pair scene (the same component as the story)', () => {
    const h = html({})
    expect(h).toContain('data-view="pair"')
    expect(h).toContain('data-kind="matrix"')
  })
})
