/**
 * The reverse index of the 709 lecture notes (content/unitNotes.ts; docs/roles/proposals/W-709-notes.md §4): the registry registers
 * "chapter unit -> notes sections", and the generated `qc-n<k>-<slug>` bridges resolve and read "Lecture 1 notes". A 448 unit and a unit
 * no note links have none. The shape checks over the real lectures are in qc709/notes/notes.test.ts.
 */
import { describe, expect, it } from 'vitest'
import { bridgeChipText, bridgeGloss, bridgePlace, lookupBridge } from './bridgeRegistry'
import { courseOfId } from './courses'
import { NOTES_BRIDGES } from './qc709/registry'
import { NOTES_BY_UNIT } from './qc709/notes/meta.generated'
import { notesBridgeId, notesForUnit, registerUnitNotes } from './unitNotes'

describe('unitNotes', () => {
  it('the 709 registry registers the reverse index: a chapter unit lists the notes sections that feed it', () => {
    const entries = Object.entries(NOTES_BY_UNIT)
    expect(entries.length).toBeGreaterThan(0)
    for (const [unit, rows] of entries) {
      expect(notesForUnit(unit)).toEqual(rows)
      expect(courseOfId(unit)).toBe('qc709')
    }
  })

  it('a 448 unit, an unknown unit and a notes section itself have none', () => {
    expect(notesForUnit('l1-quantized')).toEqual([])
    expect(notesForUnit('q99-nowhere')).toEqual([])
    expect(notesForUnit('n1-stern-gerlach')).toEqual([])
  })

  it('the generated bridges are registered and resolve: qc-<section id> -> the section, "Lecture 1 notes", the notes’ own label', () => {
    const [unit, rows] = Object.entries(NOTES_BY_UNIT)[0]
    expect(unit).toBeTruthy()
    for (const r of rows) {
      const id = notesBridgeId(r.unit)
      expect(id).toBe(`qc-${r.unit}`)
      const t = lookupBridge(id)
      expect(t, id).toBe(NOTES_BRIDGES[id])
      expect(t).toMatchObject({ course: 'qc709', lecture: r.lecture, unit: r.unit, label: r.label })
      const place = bridgePlace(t!)
      expect(place?.short).toBe(`Lecture ${r.lecture.slice(1)} notes`)
      expect(place?.title).toBe(r.label)
      // a 709 -> 709 bridge reads its place alone (no "Go further in 709", no "Spin Lab")
      expect(bridgeChipText(id, t!, 'inline')).toBe(place!.short)
      expect(bridgeChipText(id, t!, 'gloss')).toBe(`Learn it in ${place!.short}`)
      // the label begins with the lecture name, so the chip does not print it twice
      expect(bridgeGloss(t!, place!.title)).toBe('')
    }
  })

  it('a second registration replaces the first (the registry loads once; tests may swap)', () => {
    const before = Object.fromEntries(Object.entries(NOTES_BY_UNIT))
    registerUnitNotes({ 'q1-sequences': [{ lecture: 'N9', unit: 'n9-x', label: 'Lecture 9 notes, §A, p. 1' }] })
    expect(notesForUnit('q1-sequences')).toHaveLength(1)
    expect(notesForUnit('q1-superposition')).toEqual([])
    registerUnitNotes(before)
    expect(notesForUnit('q1-sequences')).toEqual(NOTES_BY_UNIT['q1-sequences'])
  })
})
