/**
 * Test kit of the notation explainers: the whole course as the pre-processor sees it. Every TeX span of every written
 * chapter, in every track it has, with the place it sits (`l7-uncertainty:b2`, `q9-partial-trace:b1.derivation.ground[3]`),
 * and the marks the pre-processor puts on it, read back the way the card reads them (id and decoded context).
 * Only tests import this. Used by ui/notationMark.classes.test.ts and content/notation.numbers.test.ts.
 */
import { COURSES, courseOfId, type Track } from '../content/courses'
import { LECTURES } from '../content/index'
import { chapterVocab } from '../content/notationVocab'
import { QC_CHAPTERS } from '../content/qc709/index'
import { readingOrder, texSpans } from '../content/walk'
import type { NotationCtx } from './notationCodec'
import { decodePart } from './notationCodec'
import { markNotation, type NotationOpts } from './notationMark'

export interface Site {
  chapter: string
  track: Track
  /** the first place the span was found at */
  where: string
  tex: string
  display: boolean
}

let cache: Site[] | null = null
/** Every distinct TeX span per chapter and track, with the first place it was found. */
export function corpusSites(): Site[] {
  if (cache) return cache
  const out: Site[] = []
  for (const l of [...LECTURES, ...QC_CHAPTERS]) {
    for (const track of COURSES[courseOfId(l.id)].tracks) {
      const seen = new Set<string>()
      for (const s of readingOrder(l, track))
        for (const sp of texSpans(s.tex === 'display' ? `$$${s.text}$$` : s.text)) {
          const key = `${sp.display}|${sp.tex}`
          if (seen.has(key)) continue
          seen.add(key)
          out.push({ chapter: l.id, track, where: s.where, tex: sp.tex, display: sp.display })
        }
    }
  }
  cache = out
  return out
}

export interface FoundMark {
  id: string
  ctx: NotationCtx
}

const MARK_AT = /\\htmlData\{notation=([a-z][a-z0-9-]*)((?:,[a-z]+=[A-Za-z0-9.]*)*)\}/g

/** The marks of a TeX string in document order, with the context each carries (decoded). `vocab`: see `vocabOf`. */
export function marksOf(tex: string, gates: boolean, vocab?: Pick<NotationOpts, 'bits' | 'sets'>): FoundMark[] {
  const marked = markNotation(tex, { gates, ...vocab })
  if (marked === tex) return []
  const out: FoundMark[] = []
  for (const m of marked.matchAll(MARK_AT)) {
    const ctx: NotationCtx = {}
    for (const kv of m[2].split(',').filter(Boolean)) {
      const [k, v] = kv.split('=')
      ;(ctx as Record<string, string>)[k] = decodePart(v)
    }
    out.push({ id: m[1], ctx })
  }
  return out
}

export const gatesOf = (chapter: string) => courseOfId(chapter) === 'qc709'
/** What the chapter's own text says about the bit dot product and about sets (content/notationVocab.ts), as the lecture page reads it. */
export function vocabOf(chapter: string): Pick<NotationOpts, 'bits' | 'sets'> {
  const l = [...LECTURES, ...QC_CHAPTERS].find((c) => c.id === chapter)
  return l ? chapterVocab(l) : {}
}

/** Every (site, mark) pair of the course: `where` is the first place the span occurs. */
export function corpusMarks(): { site: Site; mark: FoundMark }[] {
  const out: { site: Site; mark: FoundMark }[] = []
  for (const site of corpusSites()) for (const mark of marksOf(site.tex, gatesOf(site.chapter), vocabOf(site.chapter))) out.push({ site, mark })
  return out
}
