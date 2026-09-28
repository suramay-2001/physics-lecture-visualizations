/**
 * One id space, two courses (W-709-platform §A, "Costs" 2): glossary, fidelity, progress keys, game ids, claim keys
 * and concept ids all share one namespace, so every id must say which course it belongs to. This test checks each id
 * kind against its course's prefix rule, and that `courseOfId` sends it home. 448 kept its legacy ids (unprefixed
 * glossary / concept / game / fidelity ids); anything 709 ships carries `Q…` / `F…`, `q{n}-` / `f{n}-` or `qc-`.
 */
import { describe, expect, it } from 'vitest'
import { GAMES } from '../arcade/games'
import { COURSES, COURSE_IDS, type CourseId, chapterName, courseOfId, isCourseId, metaFor, registerCourseMeta } from './courses'
import { CONCEPTS } from './concepts'
import { FIDELITY, FIDELITY_VARIANT } from './fidelity'
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
import { QC_FIDELITY_IDS } from './qc709/fidelity'
import { QC_VALUE_TABLES } from './qc709/values'
import type { Lecture } from './schema'

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
  ],
}

describe('course registry', () => {
  it('two courses, 448 canonical at the root, 709 under #/709', () => {
    expect(COURSE_IDS).toEqual(['sl448', 'qc709'])
    expect(COURSES.sl448.slug).toBe('')
    expect(COURSES.qc709.slug).toBe('709')
    for (const id of COURSE_IDS) expect(COURSES[id].id).toBe(id)
    expect(isCourseId('qc709') && isCourseId('sl448') && !isCourseId('709') && !isCourseId('__proto__')).toBe(true)
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
    // and in 448's space, a qc- id is a leak from 709
    expect(namespaceProblems('sl448', { chapters: [], claimKeys: {}, shared: [{ kind: 'concept', id: 'qc-bell' }] })).toHaveLength(2)
  })
})
