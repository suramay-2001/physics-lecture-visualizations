/**
 * What a chapter's own text says about three pieces of notation that mean different things in different chapters
 * (notation explainers, ui/notationMark.ts `bits` and `sets`). Read from the chapter's text, never from its id:
 *  - `bits`: the chapter links the glossary entry `qc-bit-dot`, so a `·` between bit strings or bit variables in it is the bit
 *    dot product (add the matching products, keep only whether the sum is odd), not a plain product. F7 and Q16 introduce it,
 *    Q18 uses it. A chapter that never links it keeps the plain `·` (F1's `a·a`, F8's `z·z`).
 *  - `sets`: the capital letters the chapter writes as sets or groups (`G = \{0,1\}^n`, `h \in K`), so `|K|` counts elements.
 *    A bare `|S|` in Q10 is the size of the CHSH number, because Q10 never writes S as a set.
 *  - `spin`: the chapter writes `S_x`, `S_y` or `S_z`, so its S is the spin and `S_i`, `S_n`, `S_{\hat n}` are spin components
 *    too. Q10's CHSH `S_\chi` is not, because Q10 never writes S_x, S_y or S_z.
 * Pure; a deep scan of the chapter's strings, memoised per chapter. Used by the lecture page and the notation tests.
 */
import type { Lecture } from './schema'

export interface ChapterVocab {
  bits: boolean
  sets: ReadonlySet<string>
  spin: boolean
}

const BIT_DOT = /\[\[qc-bit-dot[|\]]/
const SPIN_S = /(?<![A-Za-z\\])S_\{?[xyz]\}?/
const SET_DEFS = [/(?<![A-Za-z\\])([A-Z])\s*=\s*\\\{/g, /\\(?:in|subset|subseteq)\s+([A-Z])(?![A-Za-z0-9_{\\])/g]

const cache = new WeakMap<Lecture, ChapterVocab>()

function strings(v: unknown, out: string[], seen: WeakSet<object>): void {
  if (typeof v === 'string') out.push(v)
  else if (v && typeof v === 'object') {
    if (seen.has(v)) return
    seen.add(v)
    for (const x of Array.isArray(v) ? v : Object.values(v)) strings(x, out, seen)
  }
}

/** The vocabulary of a chapter, from every string it carries (both tracks, challenges, reviews). */
export function chapterVocab(l: Lecture): ChapterVocab {
  const hit = cache.get(l)
  if (hit) return hit
  const text: string[] = []
  strings(l, text, new WeakSet())
  const sets = new Set<string>()
  let bits = false
  let spin = false
  for (const s of text) {
    if (!bits && BIT_DOT.test(s)) bits = true
    if (!spin && SPIN_S.test(s)) spin = true
    for (const re of SET_DEFS) for (const m of s.matchAll(re)) sets.add(m[1])
  }
  const v = { bits, sets, spin }
  cache.set(l, v)
  return v
}
