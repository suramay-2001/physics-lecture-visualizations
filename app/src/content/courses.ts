/**
 * The course registry (W-709-platform §A): one app, two courses. Physics 448 "Spin Lab" stays canonical at the
 * root of the hash routes; Physics 709 "Intro to quantum computing" lives under `#/709`.
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
import type { LectureMeta } from './meta'
import { LECTURE_META } from './meta.generated'

export type CourseId = 'sl448' | 'qc709'
export const COURSE_IDS: readonly CourseId[] = ['sl448', 'qc709']

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
  /** URL prefix under the hash: '' = the canonical root (448), '709' = `#/709/…`. */
  slug: '' | '709'
  /** What a chapter is called: "Lecture 3" / "Chapter Q3". */
  noun: { one: string; many: string }
  /** A chapter id of this course. */
  chapterId: RegExp
  /** Prefix of the course's shared ids (glossary, fidelity, concept, game): 448 kept its unprefixed ids. */
  idPrefix: '' | 'qc-'
  tracks: readonly Track[]
  /** Word caps per sentence, per track (the prose lints in part B). */
  sentenceCaps: { readonly [K in Track]?: number }
  /** Page identity: 448's glass plate, 709's cryostat (styles/theme-cryostat.css). */
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
    chapterId: /^[QF]\d+$/,
    idPrefix: 'qc-',
    tracks: ['ground', 'formal'],
    sentenceCaps: { ground: 25, formal: 40 },
    theme: 'cryostat',
    footer:
      'Interactive companion to Physics 709 lecture notes and its textbooks. Explanations are paraphrased; book references point to sections and printed pages, so read the originals. Your progress is saved only in this browser.',
  },
}

export const isCourseId = (x: unknown): x is CourseId => x === 'sl448' || x === 'qc709'

/**
 * The course an id belongs to, for every id kind: chapters (L3 / Q3 / F2), units, challenges and claim keys
 * (`l3-…`, `q3-…`, `f2-…`, `l3Foo`), and the course-wide ids (`qc-…` is 709; anything else is 448's legacy space).
 */
export function courseOfId(id: string): CourseId {
  if (/^qc-/.test(id)) return 'qc709'
  if (/^[QqFf]\d/.test(id)) return 'qc709'
  return 'sl448'
}

/** "Lecture 3" / "Chapter Q3": a chapter's name in its course's words. */
export const chapterName = (id: string): string => {
  const c = COURSES[courseOfId(id)]
  return c.id === 'sl448' ? `${c.noun.one} ${id.replace(/^L/i, '')}` : `${c.noun.one} ${id.toUpperCase()}`
}

const registered: { [K in CourseId]?: LectureMeta[] } = {}

/** The 709 light registry calls this when its (lazy) chunk loads; 448's list is always there. */
export function registerCourseMeta(course: CourseId, list: LectureMeta[]): void {
  if (course === 'sl448') return
  registered[course] = list
}

/** Has the course's chapter list arrived (448: always; 709: once a 709 page or the switcher loaded its registry)? */
export const isRegistered = (course: CourseId): boolean => course === 'sl448' || registered[course] !== undefined

/** The chapters a course lists today (448: the generated registry; 709: once its registry chunk has loaded). */
export const metaFor = (course: CourseId): LectureMeta[] => (course === 'sl448' ? LECTURE_META : (registered[course] ?? []))
