/**
 * The 709 concept graph: prefixed ids, needs that exist and come no later in the course, no cycle, a real chapter and
 * unit, and a `sameAs` that names a real Spin Lab concept (the cross-course edge on the map).
 */
import { describe, expect, it } from 'vitest'
import { CONCEPTS } from '../concepts'
import { QC_CONCEPTS, conceptProblems, type QcConcept } from './concepts'
import { QC_CHAPTERS } from './index'
import { OUTLINE_CHAPTERS } from './outline'

const ctx = {
  chapters: OUTLINE_CHAPTERS.map((c) => c.id),
  units: Object.fromEntries(QC_CHAPTERS.map((l) => [l.id, l.units.map((u) => u.id)])),
  concepts448: CONCEPTS.map((c) => c.id),
}

describe('709 concept graph', () => {
  it('is sound', () => {
    expect(conceptProblems(QC_CONCEPTS, ctx)).toEqual([])
  })

  it('catches every kind of fault (a planted bad list)', () => {
    const twin = CONCEPTS[0].id
    const bad: QcConcept[] = [
      { id: 'qc-a', label: 'A', chapter: 'F1', needs: ['qc-b'], sameAs: twin },
      { id: 'qc-b', label: 'B', chapter: 'Q4', needs: ['qc-a'] },
      { id: 'qc-a', label: 'A again', chapter: 'F1', needs: [] },
      { id: 'x-c', label: 'C', chapter: 'Z9', unit: 'z9-nowhere', needs: ['qc-missing'], sameAs: 'no-such-concept' },
    ]
    const found = conceptProblems(bad, ctx).join('\n')
    for (const want of [
      'qc-a: duplicate id',
      'qc-a: needs qc-b, taught in a LATER chapter',
      'x-c: id must start qc-',
      'x-c: chapter Z9 is not in the outline',
      'x-c: unit z9-nowhere is not a unit of Z9',
      'x-c: sameAs no-such-concept is not a Spin Lab concept',
      'x-c: needs unknown qc-missing',
      'cycle:',
    ])
      expect(found).toContain(want)
    expect(found).not.toContain(`sameAs ${twin}`)
  })
})
