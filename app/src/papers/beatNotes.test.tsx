/**
 * The two Papers beat lines (components/BeatPaperNotes.tsx; rulings papers.md R3, R5), server-rendered as Read mode and print
 * draw them: a reported number in its own list with its badge, its value as printed, its exact location and the screen-reader
 * sentence "Reported by the paper, Figure 3b, page 9:"; the trail line linking the reference's entry on References used. A beat
 * without either renders nothing, so every other chapter's markup is unchanged.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { BeatPaperNotes } from '../components/BeatPaperNotes'
import { PAPER_CHAPTERS } from '../content/papers/index'
import { LECTURES } from '../content/index'
import { StaticStory } from '../stage/StaticStory'

const P1 = PAPER_CHAPTERS.find((l) => l.id === 'P1')!
const [b1, b2] = P1.units[0].story!

describe('BeatPaperNotes', () => {
  it('a reported number: its own list, the badge, the value as printed, the location, and the spoken sentence', () => {
    const html = renderToString(<BeatPaperNotes beat={b1} />)
    expect(html).toContain('aria-label="Numbers reported by the paper"')
    expect(html).toContain('<span class="reported-badge" aria-hidden="true">Reported</span>')
    expect(html).toContain('<span class="visually-hidden">Reported by the paper, Figure 3b, page 9: </span>')
    expect(html).toContain('<span class="reported-value">[[144, 12, 12]]</span>')
    expect(html).toContain('Figure 3b, p. 9')
    expect(html).not.toContain('trail-line')
  })
  it('the trail: "This step relies on" the reference, linked to its entry, with the part relied on and why', () => {
    const html = renderToString(<BeatPaperNotes beat={b2} />)
    expect(html).toContain('This step relies on')
    expect(html).toContain('href="#/papers/refs/P1#ref-bra24"')
    expect(html).toContain('>Bravyi et al. 2024</a>, the codes it found, cited in §2.1 (p. 9)')
    expect(html).not.toContain('reported-badge')
  })
  it('a beat without either renders nothing (every 448 and 709 beat)', () => {
    expect(renderToString(<BeatPaperNotes beat={LECTURES[0].units[0].story![0]} />)).toBe('')
  })
  it('the reading version draws both, under the paper’s own phase names', () => {
    const html = renderToString(<StaticStory unit={P1.units[0]} />)
    expect(html).toContain('The paper says')
    expect(html).toContain('A reference adds')
    expect(html.match(/class="reported"/g)).toHaveLength(1)
    expect(html.match(/class="trail-line"/g)).toHaveLength(1)
  })
})
