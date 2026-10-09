/**
 * The Projector widget's light mode (Lecture 8, `labels: 'polarization'`): H/V and D/A names, an analyzer-angle slider, a
 * polarization-angle slider, and a footnote that says the plane angle is the polarizer angle. The spin mode is unchanged.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Projector } from './Projector'

const text = (html: string) => html.replace(/<!-- -->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

describe('Projector labels', () => {
  it('spin (the default): +z/−z names, the measurement-basis slider, and the half-angle note', () => {
    const html = renderToString(<Projector state={30} />)
    expect(html).toContain('measurement basis')
    expect(text(html)).toContain('⟨+z|ψ⟩')
    expect(text(html)).toContain('State-space angles are half the Bloch-sphere angles')
    expect(html).not.toContain('analyzer angle')
  })
  it('polarization at the H/V frame: ⟨H|ψ⟩ and ⟨V|ψ⟩ with the chances cos² and sin² of 30° (75%, 25%)', () => {
    const html = renderToString(<Projector state={30} basis={0} labels="polarization" />)
    const t = text(html)
    expect(t).toContain('⟨H|ψ⟩')
    expect(t).toContain('⟨V|ψ⟩')
    expect(t).toContain('P = 75')
    expect(t).toContain('P = 25')
    expect(html).toContain('analyzer angle')
    expect(html).toContain('polarization χ')
    expect(t).toContain('0° (H/V)')
    expect(t).toContain('the plane angle is the polarizer angle')
    expect(t).not.toContain('half the Bloch-sphere angles')
  })
  it('polarization with the analyzer at 45°: D/A names; H at 0° gives ½ each', () => {
    const t = text(renderToString(<Projector state={0} basis={45} labels="polarization" />))
    expect(t).toContain('⟨D|ψ⟩')
    expect(t).toContain('⟨A|ψ⟩')
    expect(t).toContain('P = 50')
    expect(t).toContain('45° (D/A)')
  })
  it('another analyzer angle is named by its own angle, and the second port is 90° on', () => {
    const t = text(renderToString(<Projector state={60} basis={60} labels="polarization" />))
    expect(t).toContain('⟨60°|ψ⟩')
    expect(t).toContain('⟨150°|ψ⟩')
    expect(t).toContain('P = 100')
  })
})

/** The overlap cell printed in the readout row whose header is `⟨name|ψ⟩` (the `num` string: "1/√2", "-1/√2", "0", "1", "0.866"). */
const overlap = (html: string, name: string): string => {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = text(html).match(new RegExp(`⟨${esc}\\|ψ⟩ (-?[0-9./√]+)`))
  if (!m) throw new Error(`no overlap row for ${name}`)
  return m[1]
}

describe('Projector overlap signs (P-L8 item 5): every labelled overlap has the course’s ket convention', () => {
  // |D⟩ = (|H⟩ + |V⟩)/√2, |A⟩ = (|H⟩ − |V⟩)/√2, so ⟨A|H⟩ = +1/√2 and ⟨A|V⟩ = −1/√2; the same for |±x⟩ = (|+z⟩ ± |−z⟩)/√2
  it('H and V photons in the D/A frame: ⟨D|H⟩ = ⟨A|H⟩ = +1/√2, ⟨D|V⟩ = +1/√2, ⟨A|V⟩ = −1/√2', () => {
    const h = renderToString(<Projector state={0} basis={45} labels="polarization" />)
    expect(overlap(h, 'D')).toBe('1/√2')
    expect(overlap(h, 'A')).toBe('1/√2')
    const v = renderToString(<Projector state={90} basis={45} labels="polarization" />)
    expect(overlap(v, 'D')).toBe('1/√2')
    expect(overlap(v, 'A')).toBe('-1/√2')
  })
  it('D and A photons in their own frame read ⟨D|D⟩ = 1, ⟨A|D⟩ = 0, ⟨D|A⟩ = 0, ⟨A|A⟩ = 1', () => {
    // |D⟩ is at 45° in the plane, |A⟩ at −45° (that is, 315°)
    const d = renderToString(<Projector state={45} basis={45} labels="polarization" />)
    expect(overlap(d, 'D')).toBe('1')
    expect(overlap(d, 'A')).toBe('0')
    const a = renderToString(<Projector state={315} basis={45} labels="polarization" />)
    expect(overlap(a, 'D')).toBe('0')
    expect(overlap(a, 'A')).toBe('1')
  })
  it('the H/V frame keeps ⟨V|ψ⟩ = +sin χ for a photon turned toward V, and ⟨V|V⟩ = 1', () => {
    const t = renderToString(<Projector state={30} basis={0} labels="polarization" />)
    expect(overlap(t, 'H')).toBe('√3/2')
    expect(overlap(t, 'V')).toBe('1/2')
    expect(overlap(renderToString(<Projector state={90} basis={0} labels="polarization" />), 'V')).toBe('1')
  })
  it('spin labels share the convention: ⟨−x|+z⟩ = +1/√2, ⟨−x|−z⟩ = −1/√2, ⟨+x|±z⟩ = +1/√2', () => {
    const up = renderToString(<Projector state={0} basis={45} />)
    expect(overlap(up, '+x')).toBe('1/√2')
    expect(overlap(up, '-x')).toBe('1/√2')
    const down = renderToString(<Projector state={90} basis={45} />)
    expect(overlap(down, '+x')).toBe('1/√2')
    expect(overlap(down, '-x')).toBe('-1/√2')
  })
  it('the generic analyzer angles keep the turned second axis: ⟨150°|H⟩ = −sin 60°', () => {
    const t = renderToString(<Projector state={60} basis={60} labels="polarization" />)
    expect(overlap(t, '60°')).toBe('1')
    expect(overlap(t, '150°')).toBe('0')
    expect(overlap(renderToString(<Projector state={0} basis={60} labels="polarization" />), '150°')).toBe('-√3/2')
  })
})
