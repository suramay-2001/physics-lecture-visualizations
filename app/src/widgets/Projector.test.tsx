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
