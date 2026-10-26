/**
 * The 709 "Lecture notes" kit (docs/roles/proposals/W-709-notes.md §1; rulings docs/roles/decisions/qc709-notes.md).
 *
 * A notes lecture is authored as a small typed `NotesSpec` (`qc709/notes/N8.ts`) and turned, at module load, into an ordinary
 * `Lecture` by the pure function `notesLecture(spec)`, so every shared lint (symbols, claims, glossary, verbatim, KaTeX, TeX
 * outside `$…$`) reads it like any other chapter. One section = one `Unit`, one paragraph = one `Beat` (`phase: 'lecture'`,
 * `text` only: ONE voice, the Formal register of the owner's notes, sentences <= 40 words). There is no compiler chunk:
 * nothing here is evaluated from data (no recipes), the kit is plain functions over literals.
 *
 * The one file with logic in `qc709/notes/`. It imports no React, no stage code and no physics (the figure kinds are listed
 * below and `kit.test.ts` pins them to the print-figure registry), so a lecture chunk stays small.
 *
 * Derived, not authored: which chapter units a section feeds are the targets of the `<<qc-…|…>>` bridges in its prose
 * (`feedsOf`), so the index's "feeds Q6, Q7" and the reverse chapter links have ONE source: the text the reader sees.
 */
import type { Claim, Lecture, StageLayout, Unit } from '../../schema'
import type { Beat } from '../../stage'
import { layoutStates } from '../../stage'
import { claimKey } from '../../claimKit'
import { bridgeRefs, inlineTokens, splitDisplay } from '../../walk'

/** ONE static state drawn after a paragraph (at the end of its hold, s = 1), with a one-sentence caption. */
export interface NotesFigure {
  stage: StageLayout
  /** One sentence, plain rich text. Any number in it needs a claim of the paragraph. */
  caption: string
  /** Registered fidelity ids to flag with the picture (the shared fidelity lint checks them). */
  fidelity?: string[]
}

export interface NotesPara {
  /** Full sentences, <= 40 words each, <= 120 words a paragraph: `$tex$`, `[[gloss|words]]`, `<<qc-bridge|Unit 6.2>>`, `**bold**`; no TeX outside `$…$`. */
  text: string
  /** Drawn right after the paragraph. */
  figure?: NotesFigure
  /**
   * `claim = keyedClaim<ValueKey>()` from `N8.values.ts`; one per number shown in the text or the caption. ONE SOURCE OF TRUTH (ruling
   * W12): a number a 709 CHAPTER already owns is cited by that chapter's own claim key (`q8ThermR`, `f2…`; its value is imported from
   * the chapter's `Q8.values.ts` and checked by the chapter's existing numpy twin: no copy of the value, no second twin). Only a number
   * no chapter owns gets an `n8…` key in `N8.values.ts` with a twin in `pipeline/claims_notes/`.
   */
  claims?: Claim[]
}

export interface NotesSection {
  /** `n8-bell-basis`: unique; becomes the Unit id and the page anchor. */
  id: string
  /** The notes' own marker, verbatim: `§C`, `§F.2` (1 to 12 characters, no space). */
  label: string
  /** Plain text, no TeX. */
  title: string
  /** Printed pages of the new edition: `p. 12` or `pp. 12–14`; the first page never decreases through the lecture. */
  pages: string
  /** ONE plain sentence <= 40 words (no TeX, no tags): the index's topic line, `Unit.question` and `Unit.insight`. */
  summary: string
  /** Short lectures 1 to 3 paragraphs a section, full lectures 2 to 12. */
  body: NotesPara[]
}

export interface NotesSpec {
  /** 8 -> `N8`. */
  number: number
  /** "Lecture 8 notes" reads in the page eyebrow; the title is the topic. */
  title: string
  /** Class date `YYYY-MM-DD`. */
  date: string
  /** 3 to 8 plain phrases for the index (they become `Lecture.outcomes`). */
  topics: string[]
  /** `short` = 150 to 300 words of prose, `full` = 900 to 1,500 (counted outside `$…$` and without the captions). */
  length: 'short' | 'full'
  /** TeX symbol -> a section id or a generated beat id (`n8-bell:b2`, 1-based); a gloss tag whose entry lists the symbol also defines it. */
  symbols: Record<string, string>
  sections: NotesSection[]
}

export class NotesSpecError extends Error {
  readonly problems: string[]
  constructor(problems: string[]) {
    super(`notes spec: ${problems.length} problem${problems.length === 1 ? '' : 's'}\n${problems.join('\n')}`)
    this.name = 'NotesSpecError'
    this.problems = problems
  }
}

/**
 * The stage kinds a notes figure may use: every kind with a print figure (`stage/figures/FigureFor.tsx` FIGURE_KINDS) except the
 * `hopf` placeholder (pinned to that list in kit.test.ts). SVG kinds draw with `SvgStill`; the flat GL kinds with `FigureFor`.
 */
export const NOTES_FIGURE_KINDS: readonly string[] = [
  'hilbert-plane', 'bloch', 'bloch-ball', 'operator-space', 'lab-r3', 'complex-plane', 'amplitudes', 'circuit', 'matrix', 'two-qubit', 'plot', 'bb84', 'clocks', 'grover-plane',
  'bits', 'code', 'spacetime', 'pauli-program', 'surgery-graph', 'module-map', 'wavefunction', 'spin-ladder', 'walk-graph',
]

/**
 * What `Unit.visual` holds for a section: the Papers precedent (a widget kind the unit never shows). The notes page renders no
 * Try-it, so `tryThis` stays empty; it exists only because `Unit.visual` is required.
 */
export const NOTES_VISUAL: Unit['visual'] = { kind: 'bit-table', props: {}, tryThis: [] }

/**
 * The stage of a beat that has no figure and follows none: the smallest valid state (the number 1 on the plane). It is never
 * drawn (the page draws a figure exactly where a beat has a `caption`); a beat needs a stage to be a beat.
 */
export const NOTES_NO_FIGURE: StageLayout = { kind: 'complex-plane', z: { re: 1, im: 0 } }

/** The page range a notes section prints: `p. 12` or `pp. 12–14` (an en dash). */
export const PAGES_RE = /^(?:p\. ([1-9]\d{0,3})|pp\. ([1-9]\d{0,3})–([1-9]\d{0,3}))$/
/** First printed page of a `pages` string, or null when it is not one. */
export function firstPage(pages: string): number | null {
  const m = PAGES_RE.exec(pages)
  return m ? Number(m[1] ?? m[2]) : null
}

/** [first, last] printed page of a `pages` string, or null. */
export function pageRange(pages: string): [number, number] | null {
  const m = PAGES_RE.exec(pages)
  return m ? [Number(m[1] ?? m[2]), Number(m[1] ?? m[3])] : null
}

/** The page span of several sections' `pages`, in the same format: `pp. 4–7`, or `p. 4` when it is one page. */
export function pageSpan(list: readonly string[]): string {
  const rs = list.map(pageRange).filter((r): r is [number, number] => r !== null)
  const lo = Math.min(...rs.map((r) => r[0]))
  const hi = Math.max(...rs.map((r) => r[1]))
  return lo === hi ? `p. ${lo}` : `pp. ${lo}–${hi}`
}

const SECTION_ID_RE = (n: number) => new RegExp(`^n${n}-[a-z0-9]+(?:-[a-z0-9]+)*$`)
/** A notes lecture's own claim key (`n8Name`) ... */
const CLAIM_KEY_RE = (n: number) => new RegExp(`^n${n}[A-Z][A-Za-z0-9]*$`)
/** ... or a key a 709 chapter owns (`q8ThermR`, `f2Name`): the SHAPE only; notes.test.ts checks it is a key of the merged 709 values (ruling W12). */
export const CHAPTER_KEY_RE = /^[qf][1-9]\d*[A-Z][A-Za-z0-9]*$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const ABBREV = /\b(pp?|Fig|figs?|eqs?|Exps?|Def|vs|e\.g|i\.e|No)\./g

/** Prose of a rich string with TeX replaced by one placeholder word, markup dropped (gloss, term and bridge keep their shown words). */
function plain(text: string): string {
  const flat = splitDisplay(text)
    .map((p, j) => (j % 2 === 1 ? ' X ' : p))
    .join(' ')
  return flat
    .replace(/\$[^$]+\$/g, ' X ')
    .replace(/\*\*|\*/g, '')
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, id: string, shown?: string) => shown ?? id)
    .replace(/\{\{[^}|]+\|([^}]+)\}\}/g, '$1')
    .replace(/<<[^>|]+\|([^>]+)>>/g, '$1')
    .replace(ABBREV, '$1')
}

const words = (s: string): number => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length

/** Sentences of a rich string (a TeX span counts as one word). */
export function sentencesOf(text: string): string[] {
  return plain(text)
    .split(/(?<=[.!?])["”’)]*\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Words of prose of a rich string, outside `$…$` (a formula is not counted). */
export function proseWords(text: string): number {
  const t = splitDisplay(text)
    .filter((_, j) => j % 2 === 0)
    .flatMap((p) => inlineTokens(p))
    .map((tok) => (tok.t === 'tex' ? ' ' : tok.t === 'gloss' || tok.t === 'term' || tok.t === 'bridge' ? tok.shown : tok.v))
    .join('')
  return words(t.replace(/\*\*|\*/g, ''))
}

/** Is this plain text (no TeX, no markup)? */
const isPlain = (s: string): boolean => !/[$\\]|\[\[|<<|\{\{|\*\*/.test(s)

/** TeX command outside `$…$` in a rich string (a backslash in the prose). */
const rawTex = (text: string): boolean =>
  splitDisplay(text)
    .filter((_, j) => j % 2 === 0)
    .flatMap((p) => inlineTokens(p))
    .some((tok) => tok.t === 'text' && tok.v.includes('\\'))

export const SHORT_WORDS = { min: 150, max: 300 } as const
export const FULL_WORDS = { min: 900, max: 1500 } as const
export const PARA_WORDS_MAX = 120
export const SENTENCE_WORDS_MAX = 40

export interface NotesCheckOptions {
  /** Extra check of each figure's layout (tests pass `validateLayout`; the kit itself imports no stage code). */
  layout?: (l: StageLayout) => string[]
}

/** Every problem of a spec at once, each starting `N8 n8-bell:b2 …` (the lecture, then the place). Empty = valid. */
export function notesProblems(spec: NotesSpec, opts: NotesCheckOptions = {}): string[] {
  const out: string[] = []
  const n = spec.number
  const id = Number.isInteger(n) && n >= 1 && n <= 99 ? `N${n}` : `N?${String(n)}`
  const bad = (where: string, msg: string) => out.push(`${id} ${where} ${msg}`)
  if (id.startsWith('N?')) {
    bad('number', `must be a whole number from 1 to 99, not ${String(n)}`)
    return out
  }
  if (!spec.title || !isPlain(spec.title)) bad('title', 'must be plain text')
  if (!DATE_RE.test(spec.date) || Number.isNaN(Date.parse(`${spec.date}T00:00:00Z`)) || new Date(`${spec.date}T00:00:00Z`).toISOString().slice(0, 10) !== spec.date)
    bad('date', `must be a real date YYYY-MM-DD, not "${spec.date}"`)
  if (spec.topics.length < 3 || spec.topics.length > 8) bad('topics', `must list 3 to 8 phrases, not ${spec.topics.length}`)
  spec.topics.forEach((t, i) => {
    if (!t.trim() || !isPlain(t)) bad(`topics[${i}]`, 'must be a plain phrase')
  })
  if (spec.length !== 'short' && spec.length !== 'full') bad('length', `must be 'short' or 'full'`)
  if (spec.sections.length === 0) bad('sections', 'must hold at least one section')

  const slug = SECTION_ID_RE(n)
  const claimRe = CLAIM_KEY_RE(n)
  const seen = new Set<string>()
  const paras = new Map<string, number>()
  let page = 0
  let totalWords = 0
  for (const s of spec.sections) {
    const where = s.id
    if (!slug.test(s.id)) bad(where, `section id must look like n${n}-bell-basis (lower case, digits, hyphens)`)
    if (seen.has(s.id)) bad(where, 'is a duplicate section id')
    seen.add(s.id)
    paras.set(s.id, s.body.length)
    // (no space inside a marker: the page splits the unit title `§C Bell basis` at its first space)
    if (!/^\S{1,12}$/.test(s.label) || !isPlain(s.label)) bad(`${where}.label`, `must be 1 to 12 plain characters with no space ("${s.label}")`)
    if (!s.title.trim() || !isPlain(s.title)) bad(`${where}.title`, 'must be plain text')
    const first = firstPage(s.pages)
    if (first === null) bad(`${where}.pages`, `must read "p. 12" or "pp. 12–14", not "${s.pages}"`)
    else {
      const m = PAGES_RE.exec(s.pages)!
      if (m[3] !== undefined && Number(m[3]) <= Number(m[2])) bad(`${where}.pages`, `range "${s.pages}" must end after it starts`)
      if (first < page) bad(`${where}.pages`, `starts on page ${first}, before the previous section's page ${page}`)
      page = Math.max(page, first)
    }
    const sum = sentencesOf(s.summary)
    if (sum.length !== 1) bad(`${where}.summary`, `must be ONE sentence, not ${sum.length}`)
    if (words(plain(s.summary)) > SENTENCE_WORDS_MAX) bad(`${where}.summary`, `has more than ${SENTENCE_WORDS_MAX} words`)
    // the summary is also the unit's question and insight, read before the paragraphs: no symbol could be defined yet
    if (!isPlain(s.summary)) bad(`${where}.summary`, 'must be plain text (no TeX, no tags: it is read before the paragraphs)')
    const lo = spec.length === 'short' ? 1 : 2
    const hi = spec.length === 'short' ? 3 : 12
    if (s.body.length < lo || s.body.length > hi) bad(`${where}.body`, `a ${spec.length} lecture needs ${lo} to ${hi} paragraphs a section, not ${s.body.length}`)
    s.body.forEach((p, k) => {
      const at = `${where}:b${k + 1}`
      const w = proseWords(p.text)
      totalWords += w
      if (w === 0) bad(at, 'is empty')
      if (w > PARA_WORDS_MAX) bad(at, `has ${w} words (at most ${PARA_WORDS_MAX})`)
      for (const sen of sentencesOf(p.text)) if (words(sen) > SENTENCE_WORDS_MAX) bad(at, `has a sentence of ${words(sen)} words (at most ${SENTENCE_WORDS_MAX}): "${sen.slice(0, 48)}…"`)
      if (rawTex(p.text)) bad(at, 'has a TeX command outside $…$')
      const keys = new Set<string>()
      for (const c of p.claims ?? []) {
        const key = claimKey(c)
        if (!key || !(claimRe.test(key) || CHAPTER_KEY_RE.test(key))) bad(at, `claim "${c.text.slice(0, 30)}" needs a key like n${n}Name (^n${n}[A-Z][A-Za-z0-9]*$) or a 709 chapter's own key like q8Name`)
        else if (keys.has(key)) bad(at, `claim key ${key} is listed twice in this paragraph`)
        else keys.add(key)
      }
      const f = p.figure
      if (f) {
        const states = layoutStates(f.stage)
        for (const st of states) if (!NOTES_FIGURE_KINDS.includes(st.kind)) bad(`${at}.figure`, `kind "${st.kind}" has no print figure (hopf is a placeholder); use one of ${NOTES_FIGURE_KINDS.length} figure kinds`)
        if (opts.layout) for (const e of opts.layout(f.stage)) bad(`${at}.figure`, e)
        const cs = sentencesOf(f.caption)
        if (cs.length !== 1) bad(`${at}.figure.caption`, `must be ONE sentence, not ${cs.length}`)
        else if (words(cs[0]) > SENTENCE_WORDS_MAX) bad(`${at}.figure.caption`, `has more than ${SENTENCE_WORDS_MAX} words`)
        if (rawTex(f.caption)) bad(`${at}.figure.caption`, 'has a TeX command outside $…$')
      }
    })
  }
  const win = spec.length === 'short' ? SHORT_WORDS : FULL_WORDS
  if (totalWords < win.min || totalWords > win.max) bad('prose', `a ${spec.length} lecture holds ${win.min} to ${win.max} words outside $…$, not ${totalWords}`)

  for (const [sym, site] of Object.entries(spec.symbols)) {
    const m = /^([a-z0-9-]+)(?::b([1-9]\d*))?$/.exec(site)
    const count = m ? paras.get(m[1]) : undefined
    if (!m || count === undefined) bad(`symbols[${sym}]`, `site "${site}" is not a section of this lecture`)
    else if (m[2] !== undefined && Number(m[2]) > count) bad(`symbols[${sym}]`, `site "${site}" has no paragraph ${m[2]} (the section has ${count})`)
  }
  return out
}

const specs = new WeakMap<Lecture, NotesSpec>()
const cache = new WeakMap<NotesSpec, Lecture>()

/** The spec a notes `Lecture` was compiled from (tests and the context generator read paragraph counts from it). */
export const specOfNotes = (l: Lecture): NotesSpec | undefined => specs.get(l)

/** Spec -> an ordinary `Lecture`. Throws a `NotesSpecError` listing every problem of an invalid spec. Pure; once per spec object. */
export function notesLecture(spec: NotesSpec, opts: NotesCheckOptions = {}): Lecture {
  const hit = cache.get(spec)
  if (hit) return hit
  const problems = notesProblems(spec, opts)
  if (problems.length) throw new NotesSpecError(problems)
  const units: Unit[] = spec.sections.map((s) => {
    let stage: StageLayout = NOTES_NO_FIGURE
    const story: Beat[] = s.body.map((p, k) => {
      if (p.figure) stage = p.figure.stage
      const beat: Beat = { id: `${s.id}:b${k + 1}`, phase: 'lecture', text: p.text, stage }
      // a beat has a caption exactly when its paragraph has a figure: the page draws a figure where `caption` is set
      if (p.figure) {
        beat.caption = p.figure.caption
        if (p.figure.fidelity?.length) beat.fidelity = p.figure.fidelity
      }
      if (p.claims?.length) beat.claims = p.claims
      return beat
    })
    return {
      id: s.id,
      title: `${s.label} ${s.title}`,
      question: s.summary,
      lecture: { summary: s.summary, pages: s.pages },
      books: [],
      visual: NOTES_VISUAL,
      clues: [],
      insight: s.summary,
      play: [],
      story,
      claims: story.flatMap((b) => b.claims ?? []),
    }
  })
  const lecture: Lecture = {
    id: `N${spec.number}`,
    number: spec.number,
    title: spec.title,
    date: spec.date,
    outcomes: spec.topics,
    prerequisites: [],
    units,
    symbols: spec.symbols,
  }
  cache.set(spec, lecture)
  specs.set(lecture, spec)
  return lecture
}

/** Bridge ids used in a section's prose and figure captions, in reading order, each once (the generated "feeds" come from these). */
export function sectionBridges(unit: Unit): string[] {
  const ids: string[] = []
  for (const b of unit.story ?? []) for (const t of [b.text, b.caption ?? '']) for (const id of bridgeRefs(t)) if (!ids.includes(id)) ids.push(id)
  return ids
}
