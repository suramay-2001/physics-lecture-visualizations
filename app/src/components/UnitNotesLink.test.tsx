/**
 * "From the lecture notes" under a chapter unit (components/UnitNotesLink.tsx; docs/roles/proposals/W-709-notes.md §4): a chip per notes
 * section that feeds the unit, nothing for a 448 unit or an unlinked one (SSR; a chip outside a router is the same markup without the way back).
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { notesBridgeId } from '../content/unitNotes'
import { NOTES_BY_UNIT } from '../content/qc709/notes/meta.generated'
import '../content/qc709/registry' // registers the reverse index and the generated bridges, as a 709 page's registry chunk does
import { UnitNotesLink } from './UnitNotesLink'

describe('UnitNotesLink', () => {
  it('renders one chip per section that feeds the unit, in the notes’ words, with the bridge id', () => {
    for (const [unit, rows] of Object.entries(NOTES_BY_UNIT)) {
      const html = renderToString(<UnitNotesLink unitId={unit} />)
      expect(html, unit).toContain('From the lecture notes')
      expect(html).toContain(`data-unit-notes="${unit}"`)
      for (const r of rows) {
        expect(html, r.unit).toContain(`data-bridge="${notesBridgeId(r.unit)}"`)
        expect(html).toContain(r.label.replace(/^Lecture \d+ notes, /, '')) // "§I.A, pp. 4–5"
        expect(html).toContain(`Lecture ${r.lecture.slice(1)} notes`) // the chip’s place
      }
      expect(html.match(/data-bridge=/g)).toHaveLength(rows.length)
    }
  })

  it('renders nothing for a 448 unit, an unknown unit, and a unit no note links', () => {
    for (const id of ['l1-quantized', 'q99-nowhere', 'q2-qubit-state']) expect(renderToString(<UnitNotesLink unitId={id} />), id).toBe('')
  })
})
