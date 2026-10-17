/**
 * The light registries must say exactly what the chapters say, per course:
 *   448  content/meta.generated.ts        (LECTURE_META: ids, titles, challenge ids; from content/index.ts)
 *        content/meta.detail.generated.ts (UNIT_DETAIL: each unit's question and board equations; lazy, in the 448 pack)
 *   709  content/qc709/meta.generated.ts  (QC_META, with the details, from the chapter files qc709/Q{n}.ts / F{n}.ts)
 *   Papers content/papers/meta.generated.ts (PAPERS_META and the shelf's PAPER_CARDS, from the specs papers/P{n}.paper.ts)
 *   709 notes content/qc709/notes/meta.generated.ts (NOTES_META: each lecture's sections, pages, topics and the chapter units each
 *        section feeds; NOTES_BY_UNIT: the reverse index chapter unit -> notes sections), from qc709/notes/N{k}.ts
 * Regenerate both after any change to chapter ids, titles, unit titles or questions, challenge ids or board equations:
 *
 *   UPDATE_META=1 npx vitest run src/content/meta.test.ts
 */
import { describe, expect, it } from 'vitest'
import { APP_DIR, env, fs, path } from '../security/node'
import { isNotesId, metaFor, notesMeta, registerCourseMeta, registerNotesMeta, type CourseId } from './courses'
import { unitDetail } from './meta'
import { UNIT_DETAIL } from './meta.detail.generated'
import { LECTURES } from './index'
import { LOADABLE, LOADABLE_709, LOADABLE_NOTES, LOADABLE_PAPERS, cachedLecture, loadLecture } from './load'
import { LECTURE_META, type LectureIndex, type LectureMeta, type UnitDetail, metaById } from './meta'
import { Q0 } from './qc709/__fixtures__/demoChapter'
import { QC_CHAPTERS, QC_FILES } from './qc709/index'
import { QC_META } from './qc709/meta.generated'
import { BRIDGES } from './qc709/bridges'
import { NOTES_CHAPTERS, NOTES_FILES } from './qc709/notes/index'
import { pageSpan, sectionBridges, specOfNotes } from './qc709/notes/kit'
import { NOTES_BY_UNIT, NOTES_META } from './qc709/notes/meta.generated'
import type { NotesFeed, NotesLectureMeta, UnitNoteRow } from './unitNotes'
import { OUTLINE_CHAPTERS } from './qc709/outline'
import type { Lecture } from './schema'
import type { PaperCard } from './papers/cards'
import { PAPER_CHAPTERS, PAPER_FILES, PAPER_SPECS } from './papers/index'
import { PAPER_CARDS, PAPERS_META } from './papers/meta.generated'
import type { PaperSpec } from '../papers/spec'

/** What the registry lists for a chapter (the pages that LIST chapters need no more). */
export const deriveMeta = (lectures: Lecture[]): LectureMeta[] =>
  lectures.map((l) => ({
    id: l.id,
    number: l.number,
    title: l.title,
    units: l.units.map((u) => ({
      id: u.id,
      title: u.title,
      question: u.question,
      challenges: u.play.map((c) => c.id),
      equations: u.lecture.equations ?? [],
    })),
  }))

/** What 448's main chunk keeps of a chapter: the listing (ids, titles, challenge ids), without the units' prose. */
export const lightMeta = (full: LectureMeta[]): LectureIndex[] =>
  full.map((l) => ({ id: l.id, number: l.number, title: l.title, units: l.units.map((u) => ({ id: u.id, title: u.title, challenges: u.challenges })) }))

/** What 448 moves to its lazy pack: each unit's question and board equations, by unit id. */
export const detailMeta = (full: LectureMeta[]): Record<string, UnitDetail> =>
  Object.fromEntries(full.flatMap((l) => l.units.map((u) => [u.id, { question: u.question, equations: u.equations }] as const)))

/** A paper's shelf card: what the light registry keeps of its spec (content/papers/cards.ts). */
export const cardOf = (s: PaperSpec): PaperCard => ({
  id: s.id,
  kind: s.kind,
  title: s.title,
  ...(s.paper
    ? { shortTitle: s.paper.shortTitle, authors: s.paper.authors, arxiv: s.paper.arxiv, date: s.paper.date, ...(s.paper.institution ? { institution: s.paper.institution } : {}), licence: s.paper.licence }
    : {}),
  references: s.references.length,
  prerequisites: s.prerequisites.length,
})

/**
 * What the lecture-notes registry lists for a notes lecture: the 709 listing plus the page span, the topics, and per section its
 * printed pages, paragraph count and the chapter units it FEEDS. Feeds are derived from the section's prose bridges (the `<<qc-…>>`
 * links the reader sees; ruling W4 and W-709-notes §1): the targets that are units of a 709 chapter, in reading order, each once.
 */
export const deriveNotesMeta = (lectures: Lecture[]): NotesLectureMeta[] =>
  lectures.map((l) => ({
    id: l.id,
    number: l.number,
    title: l.title,
    date: l.date ?? '',
    pages: pageSpan(l.units.map((u) => u.lecture.pages)),
    topics: l.outcomes,
    units: l.units.map((u) => ({
      id: u.id,
      title: u.title,
      question: u.question,
      challenges: [],
      equations: [],
      pages: u.lecture.pages,
      paras: u.story?.length ?? 0,
      feeds: sectionBridges(u).flatMap((id): NotesFeed[] => {
        const t = BRIDGES[id]
        return t && t.course === 'qc709' && !isNotesId(t.lecture) ? [{ chapter: t.lecture, unit: t.unit }] : []
      }),
    })),
  }))

/** The reverse index: chapter unit id -> the notes sections that feed it, in lecture then section order, each once. */
export const deriveNotesByUnit = (lectures: Lecture[]): Record<string, UnitNoteRow[]> => {
  const out: Record<string, UnitNoteRow[]> = {}
  for (const m of deriveNotesMeta(lectures)) {
    const spec = specOfNotes(lectures.find((l) => l.id === m.id)!)!
    m.units.forEach((u, i) => {
      const row: UnitNoteRow = { lecture: m.id, unit: u.id, label: `Lecture ${m.number} notes, ${spec.sections[i].label}, ${u.pages}` }
      for (const f of new Set(u.feeds.map((x) => x.unit))) (out[f] ??= []).push(row)
    })
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => (a < b ? -1 : 1)))
}

const REGISTRIES: { course: CourseId; lectures: Lecture[]; current: LectureIndex[]; loadable: string[]; files: { file: string; text: (lectures: Lecture[]) => string; matches: (lectures: Lecture[]) => unknown; current: unknown }[] }[] = [
  {
    course: 'sl448',
    lectures: LECTURES,
    current: LECTURE_META,
    loadable: LOADABLE,
    files: [
      {
        file: 'src/content/meta.generated.ts',
        text: (ls) => `${HEADER}import type { LectureIndex } from './meta'\n\nexport const LECTURE_META: LectureIndex[] = ${JSON.stringify(lightMeta(deriveMeta(ls)), null, 2)}\n`,
        matches: (ls) => lightMeta(deriveMeta(ls)),
        current: LECTURE_META,
      },
      {
        file: 'src/content/meta.detail.generated.ts',
        text: (ls) => `${HEADER}import type { UnitDetail } from './meta'\n\nexport const UNIT_DETAIL: Record<string, UnitDetail> = ${JSON.stringify(detailMeta(deriveMeta(ls)), null, 2)}\n`,
        matches: (ls) => detailMeta(deriveMeta(ls)),
        current: UNIT_DETAIL,
      },
    ],
  },
  {
    course: 'qc709',
    lectures: QC_CHAPTERS,
    current: QC_META,
    loadable: LOADABLE_709,
    files: [
      {
        file: 'src/content/qc709/meta.generated.ts',
        text: (ls) => `${HEADER}import type { LectureMeta } from '../meta'\n\nexport const QC_META: LectureMeta[] = ${JSON.stringify(deriveMeta(ls), null, 2)}\n`,
        matches: (ls) => deriveMeta(ls),
        current: QC_META,
      },
    ],
  },
  {
    course: 'papers',
    lectures: PAPER_CHAPTERS,
    current: PAPERS_META,
    loadable: LOADABLE_PAPERS,
    files: [
      {
        file: 'src/content/papers/meta.generated.ts',
        text: (ls) =>
          `${HEADER}import type { LectureMeta } from '../meta'\nimport type { PaperCard } from './cards'\n\nexport const PAPERS_META: LectureMeta[] = ${JSON.stringify(deriveMeta(ls), null, 2)}\n\nexport const PAPER_CARDS: PaperCard[] = ${JSON.stringify(PAPER_SPECS.map(cardOf), null, 2)}\n`,
        matches: (ls) => ({ meta: deriveMeta(ls), cards: PAPER_SPECS.map(cardOf) }),
        current: { meta: PAPERS_META, cards: PAPER_CARDS },
      },
    ],
  },
]

const HEADER = '/** GENERATED by content/meta.test.ts (UPDATE_META=1): do not edit by hand. */\n'

/** The lecture-notes registry file (a fourth registry: `NOTES_META` and the reverse index `NOTES_BY_UNIT`). */
const NOTES_FILE = 'src/content/qc709/notes/meta.generated.ts'
const notesText = (ls: Lecture[]) =>
  `${HEADER}import type { NotesLectureMeta, UnitNoteRow } from '../../unitNotes'\n\nexport const NOTES_META: NotesLectureMeta[] = ${JSON.stringify(deriveNotesMeta(ls), null, 2)}\n\nexport const NOTES_BY_UNIT: Record<string, UnitNoteRow[]> = ${JSON.stringify(deriveNotesByUnit(ls), null, 2)}\n`

if (env.UPDATE_META) {
  for (const r of REGISTRIES) for (const f of r.files) fs.writeFileSync(path.join(APP_DIR, f.file), f.text(r.lectures))
  fs.writeFileSync(path.join(APP_DIR, NOTES_FILE), notesText(NOTES_CHAPTERS))
}

describe.each(REGISTRIES)('chapter registry of $course', (r) => {
  it.each(r.files)('$file matches the chapters (else regenerate with UPDATE_META=1)', (f) => {
    expect(f.current).toEqual(f.matches(r.lectures))
    // byte-identical, so a regeneration never churns the file
    expect(fs.readFileSync(path.join(APP_DIR, f.file), 'utf8')).toBe(f.text(r.lectures))
  })
  it('every registered chapter has a loader, and only those', () => {
    expect([...r.loadable].sort()).toEqual(r.current.map((l) => l.id).sort())
  })
  it('loads each chapter as the same object the eager registry holds, then serves it from the cache', async () => {
    registerCourseMeta('qc709', QC_META) // what the 709 pages' registry chunk does on load
    registerCourseMeta('papers', PAPERS_META) // and the papers pages' registry chunk
    for (const l of r.lectures) {
      expect(await loadLecture(l.id)).toBe(l)
      expect(cachedLecture(l.id.toLowerCase())).toBe(l)
    }
    expect(metaFor(r.course)).toBe(r.current)
  })
})

describe('lecture registry (448)', () => {
  it('the main chunk keeps no question or board equation: those ride in the lazy 448 pack (UNIT_DETAIL)', () => {
    for (const l of LECTURE_META) for (const u of l.units) expect(Object.keys(u).sort(), u.id).toEqual(['challenges', 'id', 'title'])
    // every unit of every lecture has its detail, and a light unit reads it through unitDetail once the pack registered it
    for (const l of LECTURES) for (const u of l.units) expect(UNIT_DETAIL[u.id], u.id).toEqual({ question: u.question, equations: u.lecture.equations ?? [] })
  })
  it('unitDetail: a unit that carries its own detail (709) answers itself; a light unit answers from the registered pack', async () => {
    await import('./pack448')
    const light = LECTURE_META[0].units[0]
    expect(unitDetail(light)).toEqual(UNIT_DETAIL[light.id])
    const own = { id: 'q-x', title: 'x', challenges: [], question: 'why?', equations: ['a'] }
    expect(unitDetail(own)).toEqual({ question: 'why?', equations: ['a'] })
    expect(unitDetail({ id: 'nope', title: 'x', challenges: [] })).toBeUndefined()
  })
  it('unknown ids load nothing; lookups are case-insensitive', async () => {
    expect(await loadLecture('L99')).toBeUndefined()
    expect(await loadLecture('Q99')).toBeUndefined()
    expect(metaById('l3')?.id).toBe('L3')
  })
})

describe('chapter registry (Papers)', () => {
  it('every spec file exports the chapter it is named after, with that id', () => {
    for (const f of PAPER_FILES) {
      expect(f.spec, `${f.file} must export ${f.id}`).toBeDefined()
      expect((f.spec as { id?: unknown }).id, f.file).toBe(f.id)
    }
    expect(PAPER_FILES.length).toBeGreaterThan(0)
  })
})

describe('chapter registry (709)', () => {
  it('every chapter file exports the chapter it is named after, with that id', () => {
    for (const f of QC_FILES) expect(f.exported, `${f.file} must export ${f.id}`).toBe(true)
    for (const l of QC_CHAPTERS) expect(QC_FILES.some((f) => f.id === l.id), l.id).toBe(true)
  })
  it('only chapters of the semester outline can be registered, and the outline knows which are built', () => {
    const outline = new Set(OUTLINE_CHAPTERS.map((c) => c.id))
    for (const m of QC_META) expect(outline.has(m.id), m.id).toBe(true)
    for (const c of OUTLINE_CHAPTERS) expect(c.status === 'built', c.id).toBe(QC_META.some((m) => m.id === c.id))
  })
  it('generation works for 709 ids (the DEV demo chapter Q0): units, challenges and boards carry through', () => {
    const [m] = deriveMeta([Q0])
    expect(m.id).toBe('Q0')
    expect(m.units.map((u) => u.id)).toEqual(['q0-demo-sphere', 'q0-demo-plain', 'q0-demo-kinds', 'q0-demo-code', 'q0-demo-ec', 'q0-demo-fields'])
    expect(m.units[1].challenges).toEqual(['q0-demo-plain-c1'])
    expect(QC_META.some((x) => x.id === 'Q0')).toBe(false) // the fixture is never registered
  })
})

describe('lecture-notes registry (709 notes)', () => {
  it('every notes file exports the lecture it is named after, with that id', () => {
    for (const f of NOTES_FILES) expect(f.exported, `${f.file} must export ${f.id}`).toBe(true)
    for (const l of NOTES_CHAPTERS) expect(NOTES_FILES.some((f) => f.id === l.id), l.id).toBe(true)
    expect(NOTES_CHAPTERS.length).toBeGreaterThan(0)
  })
  it(`${NOTES_FILE} matches the lectures (else regenerate with UPDATE_META=1, twice)`, () => {
    expect(NOTES_META).toEqual(deriveNotesMeta(NOTES_CHAPTERS))
    expect(NOTES_BY_UNIT).toEqual(deriveNotesByUnit(NOTES_CHAPTERS))
    // byte-identical, so a regeneration never churns the file
    expect(fs.readFileSync(path.join(APP_DIR, NOTES_FILE), 'utf8')).toBe(notesText(NOTES_CHAPTERS))
  })
  it('every registered lecture has a loader, and only those', () => {
    expect([...LOADABLE_NOTES].sort()).toEqual(NOTES_META.map((l) => l.id).sort())
  })
  it('the notes ids are not 709 chapters: metaFor("qc709") never lists them, metaById finds them once the notes registry has loaded', () => {
    registerCourseMeta('qc709', QC_META)
    registerNotesMeta([])
    expect(metaById('N1')).toBeUndefined()
    registerNotesMeta(NOTES_META)
    expect(notesMeta()).toBe(NOTES_META)
    for (const m of NOTES_META) {
      expect(metaById(m.id)?.id).toBe(m.id)
      expect(metaById(m.id.toLowerCase())?.id).toBe(m.id)
      expect(metaFor('qc709').some((x) => x.id === m.id)).toBe(false)
    }
  })
  it('loads each lecture as the same object the eager registry holds, then serves it from the cache', async () => {
    registerNotesMeta(NOTES_META) // what the 709 registry chunk does on load
    for (const l of NOTES_CHAPTERS) {
      expect(await loadLecture(l.id)).toBe(l)
      expect(cachedLecture(l.id.toLowerCase())).toBe(l)
    }
    expect(await loadLecture('N99')).toBeUndefined()
  })
  it('the listing is light: ids, titles and the index facts (date, pages, topics, per section pages, paragraph counts)', () => {
    for (const m of NOTES_META) {
      expect(m.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(m.topics.length).toBeGreaterThanOrEqual(3)
      for (const u of m.units) {
        expect(u.paras, u.id).toBeGreaterThan(0)
        expect(u.challenges, u.id).toEqual([])
      }
    }
  })
})
