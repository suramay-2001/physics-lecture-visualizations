/**
 * "Learn it in …" goes to a unit that really teaches the notation (review #12, #21): the unit's own text WRITES the symbol
 * (the pre-processor marks the id somewhere in the unit, in the track the course reads), or, for the few notations no chapter
 * writes in TeX, defines the idea in words (the phrase is checked). A link to a unit that merely uses the symbol, or never
 * shows it, fails here.
 */
import { describe, expect, it } from 'vitest'
import { corpusSites, gatesOf, marksOf, vocabOf } from '../ui/notationCorpus.testkit'
import { COURSES, courseOfId, type CourseId } from './courses'
import { LECTURES } from './index'
import { NOTATION } from './notation'
import { QC_CHAPTERS } from './qc709/index'
import { readingOrder } from './walk'

/**
 * Notation no unit writes as a mark of its own: the taught unit defines the idea in words, or writes the symbol only inside a
 * larger piece (`\vec\sigma` inside n̂·σ⃗). `phrase` (lower case) must occur in that unit's text, either track.
 */
const IN_WORDS: Record<string, { unit: string; phrase: string }> = {
  'floor:qc709': { unit: 'f8-fractions', phrase: 'integer part' }, // no chapter writes ⌊ ⌋ in TeX but Q18's swap count
  're:sl448': { unit: 'l2-complex', phrase: 'real part' }, // Re and Im are written later (L5, L6); L2 defines the parts
  'im:sl448': { unit: 'l2-complex', phrase: 'imaginary part' },
  'congruent:qc709': { unit: 'f1-phase', phrase: 'global phase' }, // 709 never writes ≅; F1 teaches "the same up to a global phase"
  'sigma-vec:sl448': { unit: 'l5-inverse', phrase: '\\vec\\sigma' }, // σ⃗ is introduced inside n̂·σ⃗
  'sigma-vec:qc709': { unit: 'q3-spin-operators', phrase: '\\vec\\sigma' },
}

const unitOfWhere = (where: string) => /^([a-z0-9]+-[a-z0-9-]+?)(?:[:.]|$)/.exec(where)?.[1] ?? where

/** id → the units whose TeX carries a mark of it, per course. */
function writtenIn(): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>()
  for (const s of corpusSites())
    for (const m of marksOf(s.tex, gatesOf(s.chapter), vocabOf(s.chapter))) {
      const key = `${m.id}:${courseOfId(s.chapter)}`
      if (!out.has(key)) out.set(key, new Set())
      out.get(key)!.add(unitOfWhere(s.where))
    }
  return out
}

const unitText = (course: CourseId, unit: string): string => {
  const chapters = course === 'sl448' ? LECTURES : QC_CHAPTERS
  const l = chapters.find((c) => c.units.some((u) => u.id === unit))!
  return COURSES[course].tracks
    .flatMap((track) => readingOrder(l, track))
    .filter((s) => unitOfWhere(s.where) === unit)
    .map((s) => s.text)
    .join(' ')
    .toLowerCase()
}

describe('every "learn it" unit writes or defines the notation', () => {
  const written = writtenIn()
  it.each(NOTATION.flatMap((e) => (['sl448', 'qc709'] as const).filter((c) => e.taught[c]).map((c) => [e.id, c, e.taught[c]!] as const)))('%s (%s) -> %s', (id, course, unit) => {
    const words = IN_WORDS[`${id}:${course}`]
    if (words) {
      expect(unit, `${id}: the words-only unit`).toBe(words.unit)
      expect(unitText(course, unit), `${unit} says "${words.phrase}"`).toContain(words.phrase)
      expect(written.get(`${id}:${course}`)?.has(unit) ?? false, `${id} is written nowhere in ${unit}, which is why it is on the words list`).toBe(false)
    } else expect(written.get(`${id}:${course}`)?.has(unit), `${unit} never writes ${id}; it writes it in: ${[...(written.get(`${id}:${course}`) ?? [])].slice(0, 6).join(', ')}`).toBe(true)
  })

  it('the three links the review named point at the units that define the notation', () => {
    const taught = (id: string) => NOTATION.find((e) => e.id === id)!.taught
    expect(taught('commutator').sl448).toBe('l7-compatible')
    expect(taught('dagger').sl448).toBe('l3-eigen')
    expect(taught('sigma-dot').sl448).toBe('l5-inverse')
    expect(taught('conjugate').sl448).toBe('l2-complex')
  })
})
