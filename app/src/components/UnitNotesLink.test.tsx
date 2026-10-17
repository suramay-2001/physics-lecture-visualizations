/**
 * "From the lecture notes" under a chapter unit (components/UnitNotesLink.tsx; docs/roles/proposals/W-709-notes.md §4): a chip per notes
 * section that feeds the unit, nothing for a 448 unit or an unlinked one (SSR; a chip outside a router is the same markup without the way back).
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { notesBridgeId } from '../content/unitNotes'
import { NOTES_BY_UNIT } from '../content/qc709/notes/meta.generated'
import '../content/qc709/registry' // registers the reverse index and the generated bridges, as a 709 page's registry chunk does
import { QC_CHAPTERS } from '../content/qc709/index'
import { UnitNotesLink, unitNotesAside } from './UnitNotesLink'
import { UnitAsideContext, UnitView } from './UnitView'

describe('UnitNotesLink', () => {
  it('renders one chip per section that feeds the unit, in the notes’ words, with the bridge id', () => {
    for (const [unit, rows] of Object.entries(NOTES_BY_UNIT)) {
      const html = renderToString(<UnitNotesLink unitId={unit} />)
      expect(html, unit).toContain('From the lecture notes')
      expect(html).toContain(`data-unit-notes="${unit}"`)
      for (const r of rows) {
        expect(html, r.unit).toContain(`data-bridge="${notesBridgeId(r.unit)}"`)
        expect(html).toContain(r.where) // "§I.A, pp. 4–5"
        expect(r.label).toBe(`Lecture ${r.lecture.slice(1)} notes, ${r.where}`)
        expect(html).toContain(`Lecture ${r.lecture.slice(1)} notes`) // the chip’s place
      }
      expect(html.match(/data-bridge=/g)).toHaveLength(rows.length)
    }
  })

  it('the chapter card shows the chips only inside the slot the 709 chapter page provides (the entry carries the slot, not the chip)', () => {
    const unit = QC_CHAPTERS.find((l) => l.id === 'Q1')!.units.find((u) => u.id === 'q1-sequences')!
    const plain = renderToString(<UnitView unit={unit} index="1.2" />)
    expect(plain).not.toContain('From the lecture notes')
    const withSlot = renderToString(
      <UnitAsideContext.Provider value={unitNotesAside}>
        <UnitView unit={unit} index="1.2" />
      </UnitAsideContext.Provider>,
    )
    expect(withSlot).toContain('From the lecture notes')
    expect(withSlot).toContain(`data-bridge="${notesBridgeId(NOTES_BY_UNIT['q1-sequences'][0].unit)}"`)
    // it sits in the unit head, between the question and the step strip
    expect(withSlot.indexOf('unit-question')).toBeLessThan(withSlot.indexOf('unit-notes'))
    expect(withSlot.indexOf('unit-notes')).toBeLessThan(withSlot.indexOf('step-strip'))
    // a unit no note links shows none even inside the slot (picked from the data: the notes grow every week)
    const other = QC_CHAPTERS.flatMap((l) => l.units).find((u) => !(u.id in NOTES_BY_UNIT))!
    expect(renderToString(<UnitAsideContext.Provider value={unitNotesAside}><UnitView unit={other} index="1.1" /></UnitAsideContext.Provider>)).not.toContain('From the lecture notes')
  })

  it('renders nothing for a 448 unit, an unknown unit, and a unit no note links', () => {
    for (const id of ['l1-quantized', 'q99-nowhere', 'q2-qubit-state']) expect(renderToString(<UnitNotesLink unitId={id} />), id).toBe('')
  })
})
