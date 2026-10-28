/**
 * The 709 lecture notes (docs/roles/proposals/W-709-notes.md §6; rulings docs/roles/decisions/qc709-notes.md): invariants over
 * every written notes lecture (`NOTES_CHAPTERS`, the eager registry), on top of the shared lints that read them as ordinary lectures
 * (content.test.tsx, symbols.test.ts, claims.test.ts, bridges.test.ts, verbatim.test.ts).
 *   - the spec is valid (every `notesProblems` rule, with `validateLayout` on each figure) and each file exports the lecture it is named after;
 *   - pages never decrease; the word windows hold; the ids are in the 709 family;
 *   - W4: every section of every notes lecture links at least one built unit (the shown "Learn it in the chapter" row, and the "feeds");
 *   - W12 (one source of truth): a claim key is the lecture's own `n<k>…` (value in `N<k>.values.ts`, numpy twin in `pipeline/claims_notes/`) or a
 *     709 chapter's own `q…`/`f…` key (value in the chapter's values table, the chapter's existing twin); a notes values table owns only `n<k>…` keys;
 *   - the feeds and the reverse chapter index equal the generated registry and point at existing sections.
 */
import { describe, expect, it } from 'vitest'
import { validateLayout } from '../../../stage/resolve'
import '../../../stage/svg/kinds' // registers the SVG stage kinds, as a page whose lecture uses them does
import { courseOfId, isNotesId } from '../../courses'
import { LECTURES } from '../../index'
import type { Lecture } from '../../schema'
import { notesBridgeId, notesForUnit, registerUnitNotes, type UnitNoteRow } from '../../unitNotes'
import { bridgeRefs } from '../../walk'
import { BRIDGES } from '../bridges'
import { QC_CHAPTERS } from '../index'
import { QC_VALUE_TABLES, QC_VALUES } from '../values'
import { foreignClaimKeys, unlinkedSections } from './checks'
import { NOTES_CHAPTERS, NOTES_FILES } from './index'
import { PAGES_RE, SHORT_WORDS, FULL_WORDS, firstPage, notesProblems, proseWords, sectionBridges, specOfNotes } from './kit'
import { NOTES_BY_UNIT, NOTES_META } from './meta.generated'
import { NOTES_VALUE_TABLES } from './values'
import { NOTES_BRIDGES } from '../registry'

// the two cross-checks live in checks.ts (shared with the Optics Lab's tests); re-exported so this file's API is unchanged
export { foreignClaimKeys, unlinkedSections }

const builtChapters: Lecture[] = [...QC_CHAPTERS, ...LECTURES]

describe('the notes registry', () => {
  it('there is at least one notes lecture, and every file exports the lecture it is named after', () => {
    expect(NOTES_CHAPTERS.length).toBeGreaterThan(0)
    for (const f of NOTES_FILES) expect(f.exported, `${f.file} must export ${f.id}`).toBe(true)
    expect(NOTES_CHAPTERS.map((l) => l.id)).toEqual([...NOTES_CHAPTERS].sort((a, b) => a.number - b.number).map((l) => l.id))
  })
  it('ids are in the 709 family: N<k>, sections n<k>-…, beats n<k>-…:b<j>, and no section id collides with a chapter unit', () => {
    const chapterUnits = new Set([...QC_CHAPTERS, ...LECTURES].flatMap((l) => l.units.map((u) => u.id)))
    for (const l of NOTES_CHAPTERS) {
      expect(isNotesId(l.id), l.id).toBe(true)
      expect(l.id).toBe(`N${l.number}`)
      expect(courseOfId(l.id)).toBe('qc709')
      for (const u of l.units) {
        expect(u.id.startsWith(`n${l.number}-`), u.id).toBe(true)
        expect(courseOfId(u.id), u.id).toBe('qc709')
        expect(chapterUnits.has(u.id), u.id).toBe(false)
        for (const b of u.story ?? []) expect(b.id.startsWith(`${u.id}:b`), b.id).toBe(true)
      }
    }
  })
})

describe.each(NOTES_CHAPTERS.map((l) => [l.id, l] as const))('notes lecture %s', (_, lecture) => {
  const spec = specOfNotes(lecture)

  it('was built by notesLecture, and its spec passes every notesProblems rule (figures validated too)', () => {
    expect(spec, `${lecture.id} must be built with notesLecture()`).toBeDefined()
    expect(notesProblems(spec!, { layout: validateLayout })).toEqual([])
  })

  it('printed pages never decrease through the lecture, and the lecture’s span covers its sections', () => {
    let page = 0
    for (const u of lecture.units) {
      expect(PAGES_RE.test(u.lecture.pages), `${u.id}: ${u.lecture.pages}`).toBe(true)
      const first = firstPage(u.lecture.pages)!
      expect(first, u.id).toBeGreaterThanOrEqual(page)
      page = first
    }
    const meta = NOTES_META.find((m) => m.id === lecture.id)!
    expect(meta.pages).toMatch(PAGES_RE)
    expect(meta.units.map((u) => u.pages)).toEqual(lecture.units.map((u) => u.lecture.pages))
  })

  it('the word window holds (prose outside $…$, captions not counted): short 150 to 300, full 900 to 1,500; each paragraph <= 120', () => {
    const words = lecture.units.flatMap((u) => u.story ?? []).map((b) => proseWords(b.text))
    const total = words.reduce((a, w) => a + w, 0)
    const win = spec!.length === 'short' ? SHORT_WORDS : FULL_WORDS
    expect(total).toBeGreaterThanOrEqual(win.min)
    expect(total).toBeLessThanOrEqual(win.max)
    for (const w of words) expect(w).toBeLessThanOrEqual(120)
  })

  it('W4: every section links at least one built unit', () => {
    expect(unlinkedSections(lecture, BRIDGES, builtChapters)).toEqual([])
  })

  it('W12: every claim key is the lecture’s own (in N<k>.values.ts) or a 709 chapter’s existing key; the values table owns only n<k>… keys', () => {
    const own = NOTES_VALUE_TABLES[lecture.id] ?? {}
    expect(foreignClaimKeys(lecture, own, QC_VALUES)).toEqual([])
    for (const key of Object.keys(own)) expect(new RegExp(`^n${lecture.number}[A-Z][A-Za-z0-9]*$`).test(key), `${lecture.id}.values.ts key ${key}`).toBe(true)
    // no value is copied from a chapter: a notes key is never also a chapter key
    for (const key of Object.keys(own)) for (const t of Object.values(QC_VALUE_TABLES)) expect(key in t, key).toBe(false)
  })

  it('the feeds in the registry are the chapter units its prose bridges target, and every one is a built chapter unit', () => {
    const meta = NOTES_META.find((m) => m.id === lecture.id)!
    lecture.units.forEach((u, i) => {
      const fromProse = sectionBridges(u).flatMap((id) => {
        const t = BRIDGES[id]
        return t && t.course === 'qc709' && !isNotesId(t.lecture) ? [t.unit] : []
      })
      expect(meta.units[i].feeds.map((f) => f.unit), u.id).toEqual(fromProse)
      for (const f of meta.units[i].feeds) {
        const ch = QC_CHAPTERS.find((c) => c.id === f.chapter)
        expect(ch?.units.some((x) => x.id === f.unit), `${u.id} feeds ${f.unit}`).toBe(true)
      }
    })
  })
})

describe('the reverse index (chapter unit -> notes sections)', () => {
  it('every row points at an existing section whose prose links that unit, and every feed has its row, in lecture order', () => {
    const sections = new Map(NOTES_CHAPTERS.flatMap((l) => l.units.map((u) => [u.id, { l, u }] as const)))
    for (const [unit, rows] of Object.entries(NOTES_BY_UNIT)) {
      expect(QC_CHAPTERS.some((c) => c.units.some((u) => u.id === unit)), `${unit} is a written chapter unit`).toBe(true)
      expect(rows.map((r) => r.lecture), unit).toEqual([...rows.map((r) => r.lecture)].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))))
      for (const r of rows) {
        const hit = sections.get(r.unit)
        expect(hit, `${unit} <- ${r.unit}`).toBeDefined()
        expect(hit!.l.id).toBe(r.lecture)
        expect(r.label.length).toBeGreaterThan(0)
        expect(r.label.length).toBeLessThanOrEqual(80)
        expect(sectionBridges(hit!.u).some((id) => BRIDGES[id]?.unit === unit), `${r.unit} links ${unit}`).toBe(true)
      }
    }
    const feeds = NOTES_META.flatMap((m) => m.units.flatMap((u) => u.feeds.map((f) => `${f.unit}<-${u.id}`)))
    const rows = Object.entries(NOTES_BY_UNIT).flatMap(([unit, rs]) => rs.map((r) => `${unit}<-${r.unit}`))
    expect([...rows].sort()).toEqual([...new Set(feeds)].sort())
  })

  it('the generated bridges lead from a chapter unit to a notes section: qc-<section id>, resolving, labelled in the notes’ words', () => {
    const rows: UnitNoteRow[] = Object.values(NOTES_BY_UNIT).flat()
    expect(Object.keys(NOTES_BRIDGES).sort()).toEqual([...new Set(rows.map((r) => notesBridgeId(r.unit)))].sort())
    for (const [id, t] of Object.entries(NOTES_BRIDGES)) {
      expect(id).toBe(`qc-${t.unit}`)
      expect(courseOfId(id)).toBe('qc709')
      expect(t.course).toBe('qc709')
      const l = NOTES_CHAPTERS.find((x) => x.id === t.lecture)
      expect(l?.units.some((u) => u.id === t.unit), id).toBe(true)
      expect(t.label).toMatch(/^Lecture \d+ notes, .+, pp?\. \d/)
      // never in the hand-authored table (the generator owns them)
      expect(id in BRIDGES, id).toBe(false)
    }
  })

  it('notesForUnit answers from the registry; a Spin Lab unit and an unlinked chapter unit have none', () => {
    registerUnitNotes(NOTES_BY_UNIT)
    const [unit, rows] = Object.entries(NOTES_BY_UNIT)[0]
    expect(notesForUnit(unit)).toEqual(rows)
    expect(notesForUnit('l1-quantized')).toEqual([])
    expect(notesForUnit('q99-nowhere')).toEqual([])
  })
})

describe('the lints show they fail (mutations of the real seed lecture)', () => {
  const l = NOTES_CHAPTERS[0]
  it('W4: a section with no link is caught', () => {
    const stripped: Lecture = {
      ...l,
      units: l.units.map((u, i) => (i ? u : { ...u, story: u.story!.map((b) => ({ ...b, text: b.text.replace(/<<[^>]+>>/g, 'a unit') })) })),
    }
    expect(unlinkedSections(stripped, BRIDGES, builtChapters)).toEqual([`${l.units[0].id}: links no built unit (ruling W4: every notes section links at least one)`])
    expect(unlinkedSections(l, BRIDGES, builtChapters)).toEqual([])
    // a bridge to a unit that is not built does not count
    const ghost: Lecture = { ...l, units: l.units.map((u) => ({ ...u, story: u.story!.map((b) => ({ ...b, text: b.text.replace(/<<[^>|]+\|/g, '<<qc-ghost|') })) })) }
    expect(unlinkedSections(ghost, BRIDGES, builtChapters).length).toBe(l.units.length)
    expect(bridgeRefs('<<qc-ghost|x>>')).toEqual(['qc-ghost'])
  })

  it('W12: a foreign key, a key missing from its table and a chapter key that does not exist are caught', () => {
    const withKey = (key: string): Lecture => ({
      ...l,
      units: [{ ...l.units[0], story: [{ ...l.units[0].story![0], claims: [{ text: `${key} · x`, holds: () => true }] }] }],
    })
    const own = NOTES_VALUE_TABLES[l.id]
    expect(foreignClaimKeys(withKey(`n${l.number}UpAfterX`), own, QC_VALUES)).toEqual([])
    expect(foreignClaimKeys(withKey('q1ZthenX'), own, QC_VALUES)).toEqual([]) // a chapter-owned key is cited, not copied
    expect(foreignClaimKeys(withKey(`n${l.number}Missing`), own, QC_VALUES)).toHaveLength(1)
    expect(foreignClaimKeys(withKey('q1NoSuchKey'), own, QC_VALUES)).toHaveLength(1)
    expect(foreignClaimKeys(withKey('l3Anything'), own, QC_VALUES)).toHaveLength(1)
    expect(foreignClaimKeys(withKey('n9Other'), own, QC_VALUES)).toHaveLength(1)
  })
})
