import { describe, expect, it } from 'vitest'
import { LECTURES } from '.'
import { COURSE_LECTURES, CONCEPTS, conceptById, leadsTo } from './concepts'

const lectureNo = (id: string) => COURSE_LECTURES.find((l) => l.id === id)!.number

describe('concept graph (Concept map)', () => {
  it('every need names a concept; ids are unique', () => {
    expect(new Set(CONCEPTS.map((c) => c.id)).size).toBe(CONCEPTS.length)
    for (const c of CONCEPTS) for (const n of c.needs) expect(conceptById(n), `${c.id} needs ${n}`).toBeDefined()
  })
  it('nothing builds on a later lecture', () => {
    for (const c of CONCEPTS) for (const n of c.needs) expect(lectureNo(conceptById(n)!.lecture), `${c.id} ← ${n}`).toBeLessThanOrEqual(lectureNo(c.lecture))
  })
  it('has no cycle', () => {
    const state = new Map<string, 'open' | 'done'>()
    const visit = (id: string): void => {
      expect(state.get(id), `cycle through ${id}`).not.toBe('open')
      if (state.get(id) === 'done') return
      state.set(id, 'open')
      conceptById(id)!.needs.forEach(visit)
      state.set(id, 'done')
    }
    CONCEPTS.forEach((c) => visit(c.id))
  })
  it('built concepts link to real chapters; every built lecture unit appears on the map', () => {
    for (const l of LECTURES) {
      const units = l.units.map((u) => u.id)
      const onMap = CONCEPTS.filter((c) => c.lecture === l.id)
      for (const c of onMap) expect(units, c.id).toContain(c.unit)
      for (const u of units) expect(onMap.map((c) => c.unit), u).toContain(u)
    }
  })
  it('every course lecture has concepts; only built lectures carry unit links', () => {
    const built = new Set(LECTURES.map((l) => l.id))
    for (const l of COURSE_LECTURES) expect(CONCEPTS.some((c) => c.lecture === l.id), l.id).toBe(true)
    for (const c of CONCEPTS) expect(!!c.unit).toBe(built.has(c.lecture))
    expect(leadsTo('prepares').map((c) => c.id).sort()).toEqual(['order', 'probability'])
  })
})
