/**
 * The 709 outline (the Cryostat descent): the judged semester map's 33 chapters, in course order, on six plates with
 * two Parts each (D-709-identity §6, approved: Foundations and the QM review share 300 K).
 */
import { describe, expect, it } from 'vitest'
import { COURSES, courseOfId } from '../courses'
import { QC_META } from './meta.generated'
import { OUTLINE_CHAPTERS, PARTS, PLATES, partsOn, placeOf } from './outline'

const Q = Array.from({ length: 25 }, (_, i) => `Q${i + 1}`)
const F = Array.from({ length: 8 }, (_, i) => `F${i + 1}`)

describe('709 outline', () => {
  it('Parts F and I–XI, in course order', () => {
    expect(PARTS.map((p) => p.id)).toEqual(['F', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'])
    for (const p of PARTS) expect(p.label).toBe(`Part ${p.id}`)
    expect(PARTS.map((p) => p.title)).toEqual([
      'Foundations',
      'QM review',
      'Qubits and circuits',
      'The density matrix',
      'Entanglement',
      'Dynamics and measurement',
      'Cryptography',
      'Algorithms',
      'Machines',
      'Error correction',
      'Information',
      'Hardware',
    ])
  })

  it('six plates, colder going down, two Parts each; Foundations and Part I share 300 K', () => {
    expect(PLATES.map((p) => p.temp)).toEqual(['300 K', '50 K', '4 K', '800 mK', '100 mK', '10 mK'])
    const kelvin = PLATES.map((p) => parseFloat(p.temp) * (p.temp.endsWith('mK') ? 1e-3 : 1))
    for (let i = 1; i < kelvin.length; i++) expect(kelvin[i]).toBeLessThan(kelvin[i - 1])
    for (const plate of PLATES) {
      expect(plate.parts).toHaveLength(2)
      expect(partsOn(plate.id).map((p) => p.id)).toEqual([...plate.parts])
    }
    expect(PLATES[0].parts).toEqual(['F', 'I'])
    // Parts descend in order: each Part's plate is never warmer than the previous Part's
    const idx = (id: string) => PLATES.findIndex((p) => p.id === id)
    for (let i = 1; i < PARTS.length; i++) expect(idx(PARTS[i].plate)).toBeGreaterThanOrEqual(idx(PARTS[i - 1].plate))
  })

  it('every chapter of the map exactly once, Foundations first, then Q1…Q25 in order', () => {
    expect(OUTLINE_CHAPTERS.map((c) => c.id)).toEqual([...F, ...Q])
    for (const c of OUTLINE_CHAPTERS) {
      expect(COURSES.qc709.chapterId.test(c.id), c.id).toBe(true)
      expect(courseOfId(c.id)).toBe('qc709')
      expect(c.title.length, c.id).toBeGreaterThan(5)
    }
    // the fork's "end of the course" (components/LectureFork.tsx LAST_709) is the last chapter
    expect(OUTLINE_CHAPTERS.at(-1)!.id).toBe('Q25')
  })

  it('status is derived from the registry: a written chapter is built, every other one planned', () => {
    const written = new Set(QC_META.map((m) => m.id))
    // the pilots F1 and Q1 are written (2026-09-28)
    expect(written.has('F1') && written.has('Q1')).toBe(true)
    for (const c of OUTLINE_CHAPTERS) expect(c.status, c.id).toBe(written.has(c.id) ? 'built' : 'planned')
    expect(OUTLINE_CHAPTERS.filter((c) => c.status === 'built').length).toBe(written.size)
  })

  it('placeOf finds a chapter’s Part and plate (case-insensitive); unknown ids give nothing', () => {
    expect(placeOf('q8')?.part.id).toBe('IV')
    expect(placeOf('Q8')?.plate.temp).toBe('4 K')
    expect(placeOf('F3')?.plate.id).toBe('300K')
    expect(placeOf('Q25')?.plate.name).toBe('Mixing chamber')
    expect(placeOf('Q0')).toBeUndefined()
    expect(placeOf('L3')).toBeUndefined()
  })
})
