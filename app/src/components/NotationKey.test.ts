/**
 * "Notation in this chapter" (review #26): the key lists what the page shows. It walks **bold**, *italic* and the shown text of
 * gloss and term links as ui/Rich.tsx renders them, and leaves out text that starts hidden (hints and walkthrough steps).
 */
import { describe, expect, it } from 'vitest'
import { COURSES, courseOfId } from '../content/courses'
import { LECTURES } from '../content/index'
import { QC_CHAPTERS } from '../content/qc709/index'
import { readingOrder, texSpans } from '../content/walk'
import { notationIds } from '../ui/notationMark'
import { allTexSpans, notationUsedIn } from './NotationKey'

const HIDDEN = /\.(?:hints|walkthrough)\[/

describe('the notation key', () => {
  const rows = [...LECTURES, ...QC_CHAPTERS].flatMap((l) =>
    COURSES[courseOfId(l.id)].tracks.map((track) => {
      const gates = courseOfId(l.id) === 'qc709'
      const shallow = new Set<string>() // what the old walk saw, hidden text included
      const visibleShallow = new Set<string>()
      const hiddenOnly = new Set<string>()
      for (const s of readingOrder(l, track))
        for (const sp of texSpans(s.tex === 'display' ? `$$${s.text}$$` : s.text))
          for (const id of notationIds(sp.tex, { gates })) {
            shallow.add(id)
            if (!HIDDEN.test(s.where)) visibleShallow.add(id)
          }
      for (const id of shallow) if (!visibleShallow.has(id)) hiddenOnly.add(id)
      return { chapter: l.id, track, key: new Set(notationUsedIn(l, track, gates)), visibleShallow, hiddenOnly }
    }),
  )

  it('finds a formula inside **bold**, *italic*, a gloss and a term link, as well as plain ones and display maths', () => {
    expect(allTexSpans('plain $a$, **bold $b$**, *italic $c$*, [[ket|the $d$ ket]], {{t|term $e$}} and\n\n$$f$$ end')).toEqual([
      { tex: 'a', display: false },
      { tex: 'b', display: false },
      { tex: 'c', display: false },
      { tex: 'd', display: false },
      { tex: 'e', display: false },
      { tex: 'f', display: true },
    ])
    // the shallow walk of content/walk.ts misses everything inside the bold, the italic and the links
    expect(texSpans('plain $a$, **bold $b$**, *italic $c$*').map((s) => s.tex)).toEqual(['a'])
  })

  it('lists everything the visible text used before', () => {
    for (const r of rows) for (const id of r.visibleShallow) expect(r.key.has(id), `${r.chapter} ${r.track}: ${id}`).toBe(true)
  })

  it('leaves out notation that only a hidden hint or walkthrough step uses', () => {
    let hidden = 0
    for (const r of rows)
      for (const id of r.hiddenOnly) {
        hidden++
        expect(r.key.has(id), `${r.chapter} ${r.track}: ${id} is only in a hint or walkthrough step`).toBe(false)
      }
    expect(hidden, 'the course has notation used only in hidden hints').toBeGreaterThan(0)
  })
})
