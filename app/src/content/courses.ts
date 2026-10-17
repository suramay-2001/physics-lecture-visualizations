/**
 * The course registry (W-709-platform §A): one app, three courses. Physics 448 "Spin Lab" stays canonical at the
 * root of the hash routes; Physics 709 "Intro to quantum computing" lives under `#/709`; the Papers section (research
 * papers explained, docs/specs/papers-platform.md) under `#/papers`.
 *
 * Main chunk, and deliberately tiny: it must never import 709 content (chunk contract (h)). The 709 chapter list
 * (`content/qc709/meta.generated.ts`) arrives with the 709 pages' lazy chunk and registers itself here
 * (`registerCourseMeta`), so `metaFor('qc709')` is empty until a 709 page has loaded.
 *
 * Ids (a course is always inferable from an id; content/courses.test.ts checks every kind):
 *   448 chapters L1…, units / challenges `l{n}-…`, claim keys `l{n}…`; other ids (glossary, fidelity, concepts,
 *       games) are unprefixed, as before the second course.
 *   709 chapters Q1…Q25 and F1…F8, units / challenges `q{n}-…` / `f{n}-…`, claim keys `q{n}…` / `f{n}…`;
 *       glossary, fidelity, concept and game ids start `qc-`.
 */
import type { LectureIndex } from './meta'
import { LECTURE_META } from './meta.generated'

export type CourseId = 'sl448' | 'qc709' | 'papers'
export const COURSE_IDS: readonly CourseId[] = ['sl448', 'qc709', 'papers']

/** The two reading tracks (part B wires the toggle): Ground-up (from 9th-grade maths) and Formal (full notation). */
export type Track = 'ground' | 'formal'

export interface CourseDef {
  id: CourseId
  /** "Physics 448" */
  code: string
  /** Short name for the switcher and the wordmark line. */
  title: string
  /** The course's full name (eyebrows, the footer). */
  fullTitle: string
  tagline: string
  /** URL prefix under the hash: '' = the canonical root (448), '709' = `#/709/…`, 'papers' = `#/papers/…`. */
  slug: '' | '709' | 'papers'
  /** What a chapter is called: "Lecture 3" / "Chapter Q3". */
  noun: { one: string; many: string }
  /** A chapter id of this course. */
  chapterId: RegExp
  /** Prefix of the course's shared ids (glossary, fidelity, concept, game, bridge): 448 kept its unprefixed ids. */
  idPrefix: '' | 'qc-' | 'pp-'
  tracks: readonly Track[]
  /** Word caps per sentence, per track (the prose lints in part B). */
  sentenceCaps: { readonly [K in Track]?: number }
  /** Page identity: 448's glass plate (also the Papers section's ground), 709's cryostat (styles/theme-cryostat.css). */
  theme: 'glass' | 'cryostat'
  /** One line under every page. */
  footer: string
}

export const COURSES: { readonly [K in CourseId]: CourseDef } = {
  sl448: {
    id: 'sl448',
    code: 'Physics 448',
    title: 'Spin Lab',
    fullTitle: 'Spin Lab',
    tagline: 'Quantum mechanics, one silver atom at a time.',
    slug: '',
    noun: { one: 'Lecture', many: 'Lectures' },
    chapterId: /^L[1-9]\d*$/,
    idPrefix: '',
    tracks: ['ground'],
    sentenceCaps: { ground: 25 },
    theme: 'glass',
    footer:
      'Interactive companion to Physics 448 lecture notes. Explanations are paraphrased; book references point to sections, so read the originals. Your progress is saved only in this browser.',
  },
  qc709: {
    id: 'qc709',
    code: 'Physics 709',
    title: 'Quantum computing',
    fullTitle: 'Intro to quantum computing',
    tagline: 'Ten millikelvin, one plate at a time.',
    slug: '709',
    noun: { one: 'Chapter', many: 'Chapters' },
    chapterId: /^(?:[QF]\d+|N[1-9]\d*)$/,
    idPrefix: 'qc-',
    tracks: ['ground', 'formal'],
    sentenceCaps: { ground: 25, formal: 40 },
    theme: 'cryostat',
    footer:
      'Interactive companion to Physics 709 lecture notes and its textbooks. Explanations are paraphrased; book references point to sections and printed pages, so read the originals. Your progress is saved only in this browser.',
  },
  // The Papers section (rulings papers.md; docs/specs/papers-platform.md): research papers explained one at a time, in the 709
  // two-track model. P1, P2 … are paper lectures; B1, B2 … the background chapters several papers share (R2).
  papers: {
    id: 'papers',
    code: 'Papers',
    title: 'Research papers',
    fullTitle: 'Papers — research papers explained',
    tagline: 'One paper at a time, every prerequisite built and linked.',
    slug: 'papers',
    noun: { one: 'Chapter', many: 'Chapters' },
    chapterId: /^[PB][1-9]\d*$/,
    idPrefix: 'pp-',
    tracks: ['ground', 'formal'],
    sentenceCaps: { ground: 25, formal: 40 },
    theme: 'glass',
    footer:
      'Companion to research papers, each read from its own arXiv version. Explanations are paraphrased; every step names the section, page or reference it relies on, so read the originals. The paper’s own numbers are marked as reported. Your progress is saved only in this browser.',
  },
}

export const isCourseId = (x: unknown): x is CourseId => x === 'sl448' || x === 'qc709' || x === 'papers'

/** Is this a 709 lecture-notes id (`N8`)? Notes lectures are NOT chapters of the 709 outline (W-709-notes §1). */
export const isNotesId = (id: string): boolean => /^N[1-9]\d*$/.test(id)

/**
 * The course an id belongs to, for every id kind: chapters (L3 / Q3 / F2), units, challenges and claim keys
 * (`l3-…`, `q3-…`, `f2-…`, `l3Foo`), and the course-wide ids (`qc-…` is 709; anything else is 448's legacy space).
 */
export function courseOfId(id: string): CourseId {
  if (/^qc-/.test(id)) return 'qc709'
  // 709 chapters (Q3, q3-…, F2) and lecture notes: chapters N1…, sections `n8-…`, claim keys `n8Name` (no 448 id starts with n + digit)
  if (/^[QqFf]\d|^N[1-9]\d*$|^n[1-9]\d*[-A-Z]/.test(id)) return 'qc709'
  // Papers: chapters P1 / B1 (upper case), units and challenges p1-… / b1-…, claim keys p1Name / b1Name (a capital after the
  // digits), shared ids pp-…. Stricter than 709's rule because Lecture 1's legacy claim keys p45, p60, p90 are 448's.
  if (/^pp-/.test(id)) return 'papers'
  if (/^[PB][1-9]\d*$/.test(id) || /^[pb][1-9]\d*(?:-|[A-Z])/.test(id)) return 'papers'
  return 'sl448'
}

/** "Lecture 3" / "Chapter Q3" / "Chapter P1": a chapter's name in its course's words. */
export const chapterName = (id: string): string => {
  if (isNotesId(id)) return `Lecture ${id.slice(1)} notes`
  const c = COURSES[courseOfId(id)]
  return c.id === 'sl448' ? `${c.noun.one} ${id.replace(/^L/i, '')}` : `${c.noun.one} ${id.toUpperCase()}`
}

/**
 * The reading tracks of a chapter id: 709's lecture notes are one voice (a single Formal-register text, no second track), every
 * other chapter has its course's tracks. The prose lints (content/symbols.test.ts, content.test.tsx, claims.test.ts) read this.
 */
export const tracksOfChapter = (id: string): readonly Track[] => (isNotesId(id) ? ['ground'] : COURSES[courseOfId(id)].tracks)

/** The sentence cap (words) of a chapter's track: 40 for a notes lecture (ruling W2/W8), else the course's. */
export const sentenceCapOf = (id: string, track: Track): number | undefined => (isNotesId(id) ? 40 : COURSES[courseOfId(id)].sentenceCaps[track])

const registered: { [K in CourseId]?: LectureIndex[] } = {}
let notesRegistered: LectureIndex[] = []

/** 709's registry chunk registers the built notes lectures here (content/qc709/registry.ts); `metaById('N8')` then finds them. */
export function registerNotesMeta(list: LectureIndex[]): void {
  notesRegistered = list
}

/** The built notes lectures (empty until a 709 page has loaded the registry). */
export const notesMeta = (): LectureIndex[] => notesRegistered

/** The 709 and Papers light registries call this when their (lazy) chunk loads; 448's list is always there. */
export function registerCourseMeta(course: CourseId, list: LectureIndex[]): void {
  if (course === 'sl448') return
  registered[course] = list
}

/** Has the course's chapter list arrived (448: always; 709 / Papers: once one of its pages or the switcher loaded its registry)? */
export const isRegistered = (course: CourseId): boolean => course === 'sl448' || registered[course] !== undefined

/** The chapters a course lists today (448: the generated registry; 709 / Papers: once its registry chunk has loaded). */
export const metaFor = (course: CourseId): LectureIndex[] => (course === 'sl448' ? LECTURE_META : (registered[course] ?? []))
