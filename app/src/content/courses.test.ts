/**
 * One id space, two courses (W-709-platform §A, "Costs" 2): glossary, fidelity, progress keys, game ids, claim keys
 * and concept ids all share one namespace, so every id must say which course it belongs to. This test checks each id
 * kind against its course's prefix rule, and that `courseOfId` sends it home. 448 kept its legacy ids (unprefixed
 * glossary / concept / game / fidelity ids); anything 709 ships carries `Q…` / `F…`, `q{n}-` / `f{n}-` or `qc-`.
 */
import { describe, expect, it } from 'vitest'
import { GAMES } from '../arcade/games'
import { DEV_BRIDGES_448 } from './__fixtures__/devBridge448'
import { BRIDGES_448 } from './bridges448'
import { COURSES, COURSE_IDS, type CourseId, chapterName, collectionOfId, courseOfId, isCollectionId, isCourseId, isNotesId, metaFor, notesMeta, registerCourseMeta, registerNotesMeta, sentenceCapOf, tracksOfChapter } from './courses'
import { CONCEPTS } from './concepts'
import { FIDELITY, FIDELITY_VARIANT } from './fidelity.sl448'
import { GLOSSARY } from './glossary'
import { LECTURES } from './index'
import { COURSE, LECTURE_META, metaById } from './meta'
import { DEMO_BRIDGES, DEMO_GLOSSARY, Q0 } from './qc709/__fixtures__/demoChapter'
import { BRIDGES } from './qc709/bridges'
import { QC_CONCEPTS } from './qc709/concepts'
import { QC_GAMES } from './qc709/games'
import { QC_CHAPTERS } from './qc709/index'
import { OUTLINE_CHAPTERS } from './qc709/outline'
import { QC_GLOSSARY } from './qc709/pack'
import { SVG_FIDELITY_IDS, SVG_FIDELITY_IDS_448 } from './fidelity.svg'
import { QC_FIDELITY_IDS } from './qc709/fidelity'
import { QC_VALUE_TABLES } from './qc709/values'
import type { Lecture } from './schema'
import { PAPER_BRIDGES } from './papers/bridges'
import { PAPERS_COMPILED } from './papers/index'
import { PAPER_GLOSSARY } from './papers/pack'

/** Values tables per lecture file, so a claim key can be checked against ITS lecture (content/values.ts merges them). */
const VALUES_448 = import.meta.glob<{ V: Record<string, number> }>('./L*.values.ts', { eager: true })

export interface IdSet {
  chapters: Lecture[]
  /** chapter id → its claim keys */
  claimKeys: Record<string, string[]>
  /** course-wide ids: glossary, fidelity, concept, game (progress keys are challenge + game ids) */
  shared: { kind: string; id: string }[]
  /** Chapters whose claim keys predate the prefix rule: they need only resolve to their course. */
  legacyClaimKeys?: string[]
}

/** Every namespace violation in `ids` for `course` (empty = clean). Pure, so it can be tested on bad samples too. */
export function namespaceProblems(course: CourseId, ids: IdSet): string[] {
  const c = COURSES[course]
  const bad: string[] = []
  const home = (kind: string, id: string) => {
    if (courseOfId(id) !== course) bad.push(`${kind} ${id} resolves to ${courseOfId(id)}`)
  }
  for (const l of ids.chapters) {
    if (!c.chapterId.test(l.id)) bad.push(`chapter ${l.id} is not a ${c.code} chapter id`)
    home('chapter', l.id)
    const pre = `${l.id.toLowerCase()}-`
    for (const u of l.units) {
      if (!u.id.startsWith(pre)) bad.push(`unit ${u.id} lacks ${pre}`)
      home('unit', u.id)
      for (const ch of u.play) {
        if (!ch.id.startsWith(pre)) bad.push(`challenge ${ch.id} lacks ${pre}`)
        home('challenge', ch.id)
      }
    }
  }
  for (const [chapter, keys] of Object.entries(ids.claimKeys)) {
    // l2PsiTAlpha: the chapter's lower-case id, then NOT another digit (l1 must not claim l12's keys)
    const re = new RegExp(`^${chapter.toLowerCase()}(?![0-9])[A-Za-z0-9]*$`)
    for (const k of keys) {
      if (!re.test(k) && !ids.legacyClaimKeys?.includes(chapter)) bad.push(`claim key ${k} of ${chapter} lacks its prefix`)
      home('claim key', k)
    }
  }
  for (const { kind, id } of ids.shared) {
    if (c.idPrefix && !id.startsWith(c.idPrefix)) bad.push(`${kind} ${id} lacks ${c.idPrefix}`)
    if (!c.idPrefix && /^qc-/.test(id)) bad.push(`${kind} ${id} uses 709's qc- prefix`)
    home(kind, id)
  }
  return bad
}

const ids448: IdSet = {
  chapters: LECTURES,
  claimKeys: Object.fromEntries(
    Object.entries(VALUES_448).map(([file, m]) => [/\/(L\d+)\.values\.ts$/.exec(file)![1], Object.keys(m.V)]),
  ),
  shared: [
    ...[...GLOSSARY.keys()].map((id) => ({ kind: 'glossary', id })),
    ...[...Object.keys(FIDELITY), ...Object.keys(FIDELITY_VARIANT)].map((id) => ({ kind: 'fidelity', id })),
    ...CONCEPTS.map((c) => ({ kind: 'concept', id: c.id })),
    ...GAMES.map((g) => ({ kind: 'game', id: g.id })),
    // the shared SVG kinds a 448 lecture added (the BB84 ledger): their fidelity ids carry no `qc-` prefix (content/fidelity.svg.ts)
    ...SVG_FIDELITY_IDS_448.map((id) => ({ kind: 'fidelity', id })),
    // 448 → 709 bridges (W-448 #4): `sl-` + the target unit, which `courseOfId` sends to 448 (never `qc-`, never q/f + digit)
    ...Object.keys({ ...BRIDGES_448, ...DEV_BRIDGES_448 }).map((id) => ({ kind: 'bridge', id })),
  ],
  // L1 (built first) keys its values `p90`, `cos60`…; the `l{n}` prefix rule arrived with L2. They still resolve to
  // 448 (none starts q/f + digit or qc-), which is what keeps them out of 709's space.
  legacyClaimKeys: ['L1'],
}

/** Everything 709 ships (plus the DEV demo chapter, so the rules run on a real chapter before one is written). */
const ids709: IdSet = {
  chapters: [...QC_CHAPTERS, Q0],
  claimKeys: Object.fromEntries(Object.entries(QC_VALUE_TABLES).map(([id, t]) => [id, Object.keys(t)])),
  shared: [
    ...[...QC_GLOSSARY, ...DEMO_GLOSSARY].map((g) => ({ kind: 'glossary', id: g.id })),
    ...Object.keys({ ...BRIDGES, ...DEMO_BRIDGES }).map((id) => ({ kind: 'bridge', id })),
    ...QC_CONCEPTS.map((c) => ({ kind: 'concept', id: c.id })),
    ...QC_GAMES.map((g) => ({ kind: 'game', id: g.id })),
    ...QC_FIDELITY_IDS.map((id) => ({ kind: 'fidelity', id })),
    // the shared SVG kinds' notes were authored for 709 and keep their `qc-` ids (content/fidelity.svg.ts)
    ...SVG_FIDELITY_IDS.filter((id) => id.startsWith('qc-')).map((id) => ({ kind: 'fidelity', id })),
  ],
}

/** Everything the Papers section ships (docs/specs/papers-platform.md §1 "Ids"). */
const idsPapers: IdSet = {
  chapters: PAPERS_COMPILED.map((c) => c.lecture),
  claimKeys: Object.fromEntries(PAPERS_COMPILED.map((c) => [c.lecture.id, Object.keys(c.values)])),
  shared: [...PAPER_GLOSSARY.map((g) => ({ kind: 'glossary', id: g.id })), ...Object.keys(PAPER_BRIDGES).map((id) => ({ kind: 'bridge', id }))],
}

describe('course registry', () => {
  it('three courses, 448 canonical at the root, 709 under #/709, the Papers section under #/papers', () => {
    expect(COURSE_IDS).toEqual(['sl448', 'qc709', 'papers'])
    expect(COURSES.sl448.slug).toBe('')
    expect(COURSES.qc709.slug).toBe('709')
    expect(COURSES.papers.slug).toBe('papers')
    for (const id of COURSE_IDS) expect(COURSES[id].id).toBe(id)
    expect(isCourseId('qc709') && isCourseId('sl448') && isCourseId('papers') && !isCourseId('709') && !isCourseId('__proto__')).toBe(true)
  })
  it('the Papers section is two-track like 709 (rulings papers.md R1)', () => {
    expect(COURSES.papers.tracks).toEqual(['ground', 'formal'])
    expect(COURSES.papers.sentenceCaps).toEqual({ ground: 25, formal: 40 })
    expect(chapterName('P1')).toBe('Chapter P1')
    expect(chapterName('B2')).toBe('Chapter B2')
  })
  it('448 keeps its registry entry byte-identical (meta.ts COURSE)', () => {
    expect({ code: COURSES.sl448.code, title: COURSES.sl448.title, tagline: COURSES.sl448.tagline }).toEqual(COURSE)
  })
  it('tracks and sentence caps: 448 Ground-up only (25 words); 709 both (25 / 40)', () => {
    expect(COURSES.sl448.tracks).toEqual(['ground'])
    expect(COURSES.sl448.sentenceCaps).toEqual({ ground: 25 })
    expect(COURSES.qc709.tracks).toEqual(['ground', 'formal'])
    expect(COURSES.qc709.sentenceCaps).toEqual({ ground: 25, formal: 40 })
  })
  it('chapter names follow the course: Lecture 3 / Chapter Q3 / Chapter F2', () => {
    expect(chapterName('L3')).toBe('Lecture 3')
    expect(chapterName('Q3')).toBe('Chapter Q3')
    expect(chapterName('f2')).toBe('Chapter F2')
  })
  it('metaFor: 448 is the generated registry; 709 is empty until its chunk registers, and metaById then finds it', () => {
    expect(metaFor('sl448')).toBe(LECTURE_META)
    expect(metaById('q99')).toBeUndefined()
    const fake = [{ id: 'Q99', number: 99, title: 'probe', units: [] }]
    registerCourseMeta('qc709', fake)
    expect(metaFor('qc709')).toBe(fake)
    expect(metaById('q99')?.title).toBe('probe')
    expect(metaById('l3')?.id).toBe('L3') // 448 still resolves through the same helper
    registerCourseMeta('sl448', fake) // 448's list cannot be replaced
    expect(metaFor('sl448')).toBe(LECTURE_META)
    registerCourseMeta('qc709', [])
  })
})

describe('709 lecture notes: ids, tracks, caps, registry', () => {
  it('isNotesId accepts N1…N99 only; 448’s L-ids and 709’s Q/F ids are not notes ids', () => {
    for (const id of ['N1', 'N8', 'N11', 'N99']) expect(isNotesId(id), id).toBe(true)
    for (const id of ['N0', 'N08', 'n8', 'L8', 'Q8', 'F2', 'N', 'N8x', 'n8-bell', '']) expect(isNotesId(id), id).toBe(false)
    expect(COURSES.qc709.chapterId.test('N8') && !COURSES.qc709.chapterId.test('N0') && !COURSES.qc709.chapterId.test('n8')).toBe(true)
    // no 448 chapter pattern or unit id collides
    expect(COURSES.sl448.chapterId.test('N8')).toBe(false)
    expect(courseOfId('N0')).toBe('sl448')
  })
  it('a notes lecture is one voice: tracksOfChapter is Ground-up only, the cap 40; every other chapter keeps its course’s', () => {
    expect(tracksOfChapter('N8')).toEqual(['ground'])
    expect(sentenceCapOf('N8', 'ground')).toBe(40)
    expect(tracksOfChapter('Q3')).toEqual(['ground', 'formal'])
    expect(sentenceCapOf('Q3', 'formal')).toBe(40)
    expect(sentenceCapOf('Q3', 'ground')).toBe(25)
    expect(tracksOfChapter('L3')).toEqual(['ground'])
    expect(sentenceCapOf('L3', 'ground')).toBe(25)
    expect(tracksOfChapter('P1')).toEqual(['ground', 'formal'])
  })
  it('chapterName reads "Lecture 8 notes"; metaById finds a registered notes lecture (and no other id of the family)', () => {
    expect(chapterName('N8')).toBe('Lecture 8 notes')
    expect(chapterName('N11')).toBe('Lecture 11 notes')
    expect(notesMeta()).toEqual([])
    expect(metaById('N8')).toBeUndefined()
    const fake = [{ id: 'N8', number: 8, title: 'probe notes', units: [] }]
    registerNotesMeta(fake)
    expect(notesMeta()).toBe(fake)
    expect(metaById('N8')?.title).toBe('probe notes')
    expect(metaById('n8')?.title).toBe('probe notes')
    expect(metaById('N9')).toBeUndefined()
    expect(metaFor('qc709').some((l) => l.id === 'N8')).toBe(false) // never in the course's chapter list
    registerNotesMeta([])
  })
})

describe('courseOfId', () => {
  it.each([
    ['L1', 'sl448'],
    ['l3-projectors', 'sl448'],
    ['l2PsiTAlpha', 'sl448'],
    ['magnetic-moment', 'sl448'],
    ['bloch-golf', 'sl448'],
    ['Q1', 'qc709'],
    ['F8', 'qc709'],
    ['q12-povm', 'qc709'],
    ['f5-entropy-c2', 'qc709'],
    ['q3BornPlus', 'qc709'],
    ['qc-bell-state', 'qc709'],
    ['qc-chsh-game', 'qc709'],
    ['P1', 'papers'],
    ['B12', 'papers'],
    ['p1-checks', 'papers'],
    ['p1-checks:b2', 'papers'],
    ['b3-surface', 'papers'],
    ['p1BellAmp', 'papers'],
    ['pp-check', 'papers'],
    ['pp-q6-bell-basis', 'papers'],
    // 709 lecture notes (W-709-notes §1): chapters N1…, sections n8-…, claim keys n8Name
    ['N1', 'qc709'],
    ['N11', 'qc709'],
    ['n8-bell-basis', 'qc709'],
    ['n8-bell-basis:b2', 'qc709'],
    ['n8BellAmp', 'qc709'],
    // Lecture 1's legacy claim keys are 448's (they predate the prefix rule): no capital after the digits
    ['p45', 'sl448'],
    ['p90', 'sl448'],
    ['bloch', 'sl448'],
  ] as const)('%s → %s', (id, course) => expect(courseOfId(id)).toBe(course))
})

describe('namespaces: every id kind carries its course prefix', () => {
  it('448: lectures L{n}, units / challenges l{n}-, claim keys l{n}, shared ids unprefixed (never qc-)', () => {
    expect(ids448.chapters.length).toBeGreaterThanOrEqual(7)
    expect(Object.keys(ids448.claimKeys).sort()).toEqual(LECTURES.map((l) => l.id).sort())
    expect(ids448.shared.length).toBeGreaterThan(50) // the lists above really measured something
    expect(namespaceProblems('sl448', ids448)).toEqual([])
  })

  it('709: chapters Q/F, units / challenges q{n}- / f{n}-, claim keys q{n} / f{n}, shared ids qc- (+ the outline)', () => {
    expect(namespaceProblems('qc709', ids709)).toEqual([])
    for (const c of OUTLINE_CHAPTERS) {
      expect(COURSES.qc709.chapterId.test(c.id), c.id).toBe(true)
      expect(courseOfId(c.id), c.id).toBe('qc709')
    }
    // no 448 id resolves into 709's space, and no 709 chapter id is a 448 one
    expect(OUTLINE_CHAPTERS.filter((c) => COURSES.sl448.chapterId.test(c.id))).toEqual([])
  })

  it('Papers: chapters P/B, units / challenges p{n}- / b{n}-, claim keys p{n}Name / b{n}Name, shared ids pp-', () => {
    expect(idsPapers.chapters.length).toBeGreaterThan(0)
    expect(idsPapers.shared.length).toBeGreaterThan(1)
    expect(namespaceProblems('papers', idsPapers)).toEqual([])
    // and nothing of 448's or 709's space resolves into the Papers section
    expect([...ids448.chapters, ...ids709.chapters].filter((l) => courseOfId(l.id) === 'papers')).toEqual([])
    expect([...ids448.shared, ...ids709.shared].filter((s) => courseOfId(s.id) === 'papers')).toEqual([])
    expect(Object.values({ ...ids448.claimKeys, ...ids709.claimKeys }).flat().filter((k) => courseOfId(k) === 'papers')).toEqual([])
  })

  it('the checker catches every kind of slip (so a clean result means something)', () => {
    const unit = (id: string, challenge: string) => ({ id, play: [{ id: challenge }] })
    const chapter = (id: string, units: ReturnType<typeof unit>[]) => ({ id, units }) as unknown as Lecture
    const bad: IdSet = {
      chapters: [chapter('Q4', [unit('q4-gates', 'q4-gates-c1'), unit('gates', 'l4-c1')]), chapter('L9', [])],
      claimKeys: { Q4: ['q4Ok', 'q40Wrong', 'l4Stolen'] },
      shared: [
        { kind: 'glossary', id: 'qc-qubit' },
        { kind: 'glossary', id: 'qubit' },
        { kind: 'game', id: 'chsh-game' },
      ],
    }
    const found = namespaceProblems('qc709', bad)
    for (const needle of ['unit gates lacks q4-', 'challenge l4-c1 lacks q4-', 'chapter L9 is not a Physics 709 chapter id', 'claim key q40Wrong', 'claim key l4Stolen', 'glossary qubit lacks qc-', 'game chsh-game lacks qc-'])
      expect(found.some((f) => f.includes(needle)), needle).toBe(true)
    expect(found.some((f) => f.includes('qc-qubit'))).toBe(false)
    // a 448 bridge id is `sl-…`; a `qc-` one is 709's, and an id starting like a 709 chapter would resolve there
    expect(namespaceProblems('sl448', { chapters: [], claimKeys: {}, shared: [{ kind: 'bridge', id: 'sl-q14-min-error' }] })).toEqual([])
    expect(namespaceProblems('sl448', { chapters: [], claimKeys: {}, shared: [{ kind: 'bridge', id: 'qc-l2-complex' }] })).toHaveLength(2)
    expect(namespaceProblems('sl448', { chapters: [], claimKeys: {}, shared: [{ kind: 'bridge', id: 'q14-min-error' }] })).toHaveLength(1)
    // and in 448's space, a qc- id is a leak from 709
    expect(namespaceProblems('sl448', { chapters: [], claimKeys: {}, shared: [{ kind: 'concept', id: 'qc-bell' }] })).toHaveLength(2)
  })
})

describe('709 Optics Lab: the second notes collection (ids O1…, sections o3-…, claim keys o3…)', () => {
  it('collectionOfId names the collection of N- and O-ids only; isNotesId stays notes-only, isCollectionId takes both', () => {
    expect(collectionOfId('N8')).toBe('notes')
    expect(collectionOfId('O3')).toBe('optics')
    for (const id of ['N0', 'O0', 'O03', 'o3', 'n8', 'Q8', 'L8', 'F2', 'P1', 'O', 'O3x', 'o3-cooling', '']) expect(collectionOfId(id), id).toBeNull()
    expect(isNotesId('O3')).toBe(false)
    expect(isCollectionId('N8') && isCollectionId('O3') && !isCollectionId('Q8')).toBe(true)
  })
  it('an optics id, its sections and its claim keys belong to 709 (no 448 or Papers pattern takes them); N-ids are unchanged', () => {
    for (const id of ['O1', 'O9', 'O12', 'o3-cooling', 'o3-doppler-limit', 'o3Linewidth', 'o12Name']) expect(courseOfId(id), id).toBe('qc709')
    for (const id of ['N8', 'n8-bell', 'n8Name']) expect(courseOfId(id), id).toBe('qc709')
    for (const id of ['O0', 'o', 'o3x', 'o0-x']) expect(courseOfId(id), id).toBe('sl448')
    expect(COURSES.qc709.chapterId.test('O3') && !COURSES.qc709.chapterId.test('O0') && !COURSES.qc709.chapterId.test('o3')).toBe(true)
    expect(COURSES.sl448.chapterId.test('O3') || COURSES.papers.chapterId.test('O3')).toBe(false)
  })
  it('an optics page is one voice like a notes lecture (Ground-up only, cap 40) and is named "Optics Lab O3"', () => {
    expect(tracksOfChapter('O3')).toEqual(['ground'])
    expect(sentenceCapOf('O3', 'ground')).toBe(40)
    expect(chapterName('O3')).toBe('Optics Lab O3')
    expect(chapterName('N8')).toBe('Lecture 8 notes')
  })
  it('the two light registries are separate: metaById answers each only for its own collection, never the course list', () => {
    const fakeN = [{ id: 'N8', number: 8, title: 'probe notes', units: [] }]
    const fakeO = [{ id: 'O3', number: 3, title: 'probe optics', units: [] }]
    registerNotesMeta(fakeN)
    registerNotesMeta(fakeO, 'optics')
    expect(notesMeta()).toBe(fakeN)
    expect(notesMeta('optics')).toBe(fakeO)
    expect(metaById('O3')?.title).toBe('probe optics')
    expect(metaById('o3')?.title).toBe('probe optics')
    expect(metaById('N8')?.title).toBe('probe notes')
    expect(metaById('O8')).toBeUndefined()
    expect(metaFor('qc709').some((l) => l.id === 'O3')).toBe(false)
    registerNotesMeta([])
    registerNotesMeta([], 'optics')
    expect(metaById('O3')).toBeUndefined()
  })
})
