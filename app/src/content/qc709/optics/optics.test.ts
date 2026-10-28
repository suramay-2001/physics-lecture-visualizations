/**
 * The 709 Optics Lab (the second notes collection; docs/context/cards/notes-platform.md): invariants over every written optics page
 * (`OPTICS_CHAPTERS`, the eager registry), on top of the shared lints that read them as ordinary lectures (content.test.tsx, symbols.test.ts,
 * claims.test.ts, bridges.test.ts, verbatim.test.ts). The same rules as notes/notes.test.ts with the optics ids:
 *   - the spec is valid (every `notesProblems` rule, figures and paragraph widgets validated too) and each file exports the page it is named after;
 *   - pages never decrease; the word windows hold; the ids are in the 709 family (`O<k>`, `o<k>-…`), clear of every chapter unit and notes section;
 *   - W4: every section of every page links at least one built unit (the shown "Learn it in the chapter" row, and the "feeds");
 *   - W12 (one source of truth): a claim key is the page's own `o<k>…` (value in `O<k>.values.ts`, numpy twin in `pipeline/claims_optics/`) or a
 *     709 chapter's own `q…`/`f…` key; an optics values table owns only `o<k>…` keys;
 *   - the feeds and the reverse chapter index equal the generated registry and point at existing sections; the generated bridges are `qc-o<k>-…`.
 */
import { describe, expect, it } from 'vitest'
import { validateLayout } from '../../../stage/resolve'
import '../../../stage/svg/kinds' // registers the SVG stage kinds, as a page whose lecture uses them does
import { opticsWidgetProblems } from '../../../widgets/opticsBench/validate'
import { collectionOfId, courseOfId } from '../../courses'
import { LECTURES } from '../../index'
import type { Lecture } from '../../schema'
import { notesBridgeId, notesForUnit, registerUnitNotes } from '../../unitNotes'
import { BRIDGES } from '../bridges'
import { foreignClaimKeys, unlinkedSections } from '../notes/checks'
import { NOTES_CHAPTERS } from '../notes/index'
import { PAGES_RE, SHORT_WORDS, FULL_WORDS, firstPage, notesProblems, proseWords, sectionBridges, specOfNotes } from '../notes/kit'
import { QC_CHAPTERS } from '../index'
import { QC_VALUE_TABLES, QC_VALUES } from '../values'
import { OPTICS_BRIDGES } from '../registry'
import { OPTICS_CHAPTERS, OPTICS_FILES } from './index'
import { OPTICS_BY_UNIT, OPTICS_META } from './meta.generated'
import { OPTICS_VALUE_TABLES } from './values'

const builtChapters: Lecture[] = [...QC_CHAPTERS, ...LECTURES]

describe('the optics registry', () => {
  it('there is at least one optics page, and every file exports the page it is named after, in page order', () => {
    expect(OPTICS_CHAPTERS.length).toBeGreaterThan(0)
    for (const f of OPTICS_FILES) expect(f.exported, `${f.file} must export ${f.id}`).toBe(true)
    expect(OPTICS_CHAPTERS.map((l) => l.id)).toEqual([...OPTICS_CHAPTERS].sort((a, b) => a.number - b.number).map((l) => l.id))
  })
  it('ids are in the 709 family: O<k>, sections o<k>-…, beats o<k>-…:b<j>, and no section id collides with a chapter unit or a notes section', () => {
    const taken = new Set([...QC_CHAPTERS, ...LECTURES, ...NOTES_CHAPTERS].flatMap((l) => l.units.map((u) => u.id)))
    for (const l of OPTICS_CHAPTERS) {
      expect(collectionOfId(l.id), l.id).toBe('optics')
      expect(l.id).toBe(`O${l.number}`)
      expect(courseOfId(l.id)).toBe('qc709')
      for (const u of l.units) {
        expect(u.id.startsWith(`o${l.number}-`), u.id).toBe(true)
        expect(courseOfId(u.id), u.id).toBe('qc709')
        expect(taken.has(u.id), u.id).toBe(false)
        for (const b of u.story ?? []) expect(b.id.startsWith(`${u.id}:b`), b.id).toBe(true)
      }
    }
  })
})

describe.each(OPTICS_CHAPTERS.map((l) => [l.id, l] as const))('optics page %s', (_, lecture) => {
  const spec = specOfNotes(lecture)

  it('was built by notesLecture as an optics page, and its spec passes every notesProblems rule (figures and widgets validated too)', () => {
    expect(spec, `${lecture.id} must be built with notesLecture()`).toBeDefined()
    expect(spec!.collection).toBe('optics')
    expect(notesProblems(spec!, { layout: validateLayout, widget: opticsWidgetProblems })).toEqual([])
  })

  it('printed pages never decrease through the page, and its span covers its sections', () => {
    let page = 0
    for (const u of lecture.units) {
      expect(PAGES_RE.test(u.lecture.pages), `${u.id}: ${u.lecture.pages}`).toBe(true)
      const first = firstPage(u.lecture.pages)!
      expect(first, u.id).toBeGreaterThanOrEqual(page)
      page = first
    }
    const meta = OPTICS_META.find((m) => m.id === lecture.id)!
    expect(meta.pages).toMatch(PAGES_RE)
    expect(meta.units.map((u) => u.pages)).toEqual(lecture.units.map((u) => u.lecture.pages))
    expect(meta.book).toBe(spec!.book)
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

  it('W12: every claim key is the page’s own (in O<k>.values.ts) or a 709 chapter’s existing key; the values table owns only o<k>… keys', () => {
    const own = OPTICS_VALUE_TABLES[lecture.id] ?? {}
    expect(foreignClaimKeys(lecture, own, QC_VALUES)).toEqual([])
    for (const key of Object.keys(own)) expect(new RegExp(`^o${lecture.number}[A-Z][A-Za-z0-9]*$`).test(key), `${lecture.id}.values.ts key ${key}`).toBe(true)
    // no value is copied from a chapter: an optics key is never also a chapter key
    for (const key of Object.keys(own)) for (const t of Object.values(QC_VALUE_TABLES)) expect(key in t, key).toBe(false)
  })

  it('the feeds in the registry are the chapter units its prose bridges target, and every one is a built chapter unit', () => {
    const meta = OPTICS_META.find((m) => m.id === lecture.id)!
    lecture.units.forEach((u, i) => {
      const fromProse = sectionBridges(u).flatMap((id) => {
        const t = BRIDGES[id]
        return t && t.course === 'qc709' && !collectionOfId(t.lecture) ? [t.unit] : []
      })
      expect(meta.units[i].feeds.map((f) => f.unit), u.id).toEqual(fromProse)
      for (const f of meta.units[i].feeds) {
        const ch = QC_CHAPTERS.find((c) => c.id === f.chapter)
        expect(ch?.units.some((x) => x.id === f.unit), `${u.id} feeds ${f.unit}`).toBe(true)
      }
    })
  })
})

describe('the optics reverse index (chapter unit -> optics sections)', () => {
  it('every row points at an existing section whose prose links that unit, and every feed has its row, in page order', () => {
    const sections = new Map(OPTICS_CHAPTERS.flatMap((l) => l.units.map((u) => [u.id, { l, u }] as const)))
    for (const [unit, rows] of Object.entries(OPTICS_BY_UNIT)) {
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
    const feeds = OPTICS_META.flatMap((m) => m.units.flatMap((u) => u.feeds.map((f) => `${f.unit}<-${u.id}`)))
    const rows = Object.entries(OPTICS_BY_UNIT).flatMap(([unit, rs]) => rs.map((r) => `${unit}<-${r.unit}`))
    expect([...rows].sort()).toEqual([...new Set(feeds)].sort())
  })

  it('the generated bridges lead from a chapter unit to an optics section: qc-<section id>, resolving, labelled in the lab’s words, never hand-authored', () => {
    const rows = Object.values(OPTICS_BY_UNIT).flat()
    expect(Object.keys(OPTICS_BRIDGES).sort()).toEqual([...new Set(rows.map((r) => notesBridgeId(r.unit)))].sort())
    for (const [id, t] of Object.entries(OPTICS_BRIDGES)) {
      expect(id).toBe(`qc-${t.unit}`)
      expect(id.startsWith('qc-o')).toBe(true)
      expect(courseOfId(id)).toBe('qc709')
      expect(t.course).toBe('qc709')
      const l = OPTICS_CHAPTERS.find((x) => x.id === t.lecture)
      expect(l?.units.some((u) => u.id === t.unit), id).toBe(true)
      expect(t.label).toMatch(/^Optics Lab O\d+, .+, pp?\. \d/)
      expect(id in BRIDGES, id).toBe(false)
    }
  })

  it('notesForUnit answers per collection: the optics rows are not the notes rows, and a Spin Lab unit has none', () => {
    registerUnitNotes(OPTICS_BY_UNIT, 'optics')
    const [unit, rows] = Object.entries(OPTICS_BY_UNIT)[0]
    expect(notesForUnit(unit, 'optics')).toEqual(rows)
    expect(notesForUnit(unit)).not.toEqual(rows)
    expect(notesForUnit('l1-quantized', 'optics')).toEqual([])
    expect(notesForUnit('q99-nowhere', 'optics')).toEqual([])
  })
})

describe('the optics lints show they fail (mutations of the real seed page)', () => {
  const l = OPTICS_CHAPTERS[0]
  it('W4: a section with no link is caught', () => {
    const stripped: Lecture = {
      ...l,
      units: l.units.map((u, i) => (i ? u : { ...u, story: u.story!.map((b) => ({ ...b, text: b.text.replace(/<<[^>]+>>/g, 'a unit') })) })),
    }
    expect(unlinkedSections(stripped, BRIDGES, builtChapters)).toEqual([`${l.units[0].id}: links no built unit (ruling W4: every notes section links at least one)`])
    expect(unlinkedSections(l, BRIDGES, builtChapters)).toEqual([])
  })
  it('W12: a notes key, a key missing from the table and a chapter key that does not exist are caught under an optics id', () => {
    const withKey = (key: string): Lecture => ({
      ...l,
      units: [{ ...l.units[0], story: [{ ...l.units[0].story![0], claims: [{ text: `${key} · x`, holds: () => true }] }] }],
    })
    const own = OPTICS_VALUE_TABLES[l.id]
    expect(foreignClaimKeys(withKey(`o${l.number}Peak`), { ...own, [`o${l.number}Peak`]: 1 }, QC_VALUES)).toEqual([])
    expect(foreignClaimKeys(withKey('q1ZthenX'), own, QC_VALUES)).toEqual([])
    expect(foreignClaimKeys(withKey(`o${l.number}Missing`), own, QC_VALUES)).toHaveLength(1)
    expect(foreignClaimKeys(withKey('n1UpAfterX'), own, QC_VALUES)).toHaveLength(1) // a notes lecture's key is not an optics page's
    expect(foreignClaimKeys(withKey('o9Other'), own, QC_VALUES)).toHaveLength(1)
  })
})
