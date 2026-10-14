/**
 * The Papers section's shared tables (docs/specs/papers-platform.md §6): every bridge a paper (either track) or a papers
 * gloss uses exists, carries the `pp-` prefix, lands on a real unit (and beat) of 448 or 709, and is used; every glossary
 * entry is `pp-` and first used where it says; the pack registers both with the app's lookups.
 */
import { describe, expect, it } from 'vitest'
import { bridgePlace, lookupBridge } from '../content/bridgeRegistry'
import { COURSES, courseOfId } from '../content/courses'
import { lookupGloss } from '../content/glossRegistry'
import { LECTURES } from '../content/index'
import { PAPER_BRIDGES } from '../content/papers/bridges'
import { PAPER_CHAPTERS } from '../content/papers/index'
import { PAPER_GLOSSARY } from '../content/papers/pack'
import { QC_CHAPTERS } from '../content/qc709/index'
import { derivationSteps } from '../content/track'
import { bridgeRefs, glossRefs, readingOrder } from '../content/walk'

/** Every bridge id a paper uses, in every track, with where. */
function usedBridges(): { id: string; where: string }[] {
  const out: { id: string; where: string }[] = []
  for (const l of PAPER_CHAPTERS)
    for (const t of COURSES.papers.tracks) {
      for (const s of readingOrder(l, t)) for (const id of bridgeRefs(s.text)) out.push({ id, where: `${s.where} (${t})` })
      for (const u of l.units) for (const b of u.story ?? []) for (const s of derivationSteps(b, t)) for (const id of bridgeRefs(s.why)) out.push({ id, where: `${b.id} derivation (${t})` })
    }
  for (const g of PAPER_GLOSSARY) if (g.bridge) out.push({ id: g.bridge, where: `gloss ${g.id}` })
  return out
}

describe('papers bridges', () => {
  const used = usedBridges()
  it('the paper uses bridges into both courses (so the checks below measured something)', () => {
    expect(new Set(used.map((u) => PAPER_BRIDGES[u.id]?.course))).toEqual(new Set(['sl448', 'qc709', 'papers']))
  })
  it('every used id is in the table; every id is pp-, used, and lands on a real unit of its course', () => {
    const bad: string[] = []
    for (const u of used) if (!Object.hasOwn(PAPER_BRIDGES, u.id)) bad.push(`${u.where}: unknown bridge ${u.id}`)
    for (const [id, t] of Object.entries(PAPER_BRIDGES)) {
      if (!/^pp-[a-z0-9-]+$/.test(id) || courseOfId(id) !== 'papers') bad.push(`${id}: bridge ids start pp-`)
      if (!used.some((u) => u.id === id)) bad.push(`${id}: unused`)
      // ruling papers-B3B4 R5: a background chapter may bridge to another Papers chapter (B3 to B1); the target must be a written unit of an EARLIER chapter than the one using it
      const pool = t.course === 'sl448' ? LECTURES : t.course === 'papers' ? PAPER_CHAPTERS : QC_CHAPTERS
      const l = pool.find((x) => x.id === t.lecture)
      const unit = l?.units.find((x) => x.id === t.unit)
      if (!unit) bad.push(`${id}: no unit ${t.unit} in ${t.lecture}`)
      else if (t.beat && !(unit.story ?? []).some((b) => b.id === t.beat)) bad.push(`${id}: no beat ${t.beat}`)
      if (!t.label.trim() || t.label.length > 80) bad.push(`${id}: label must be 1–80 characters`)
      if (t.course === 'sl448' && !bridgePlace(t)) bad.push(`${id}: the light registry does not know ${t.unit}`)
    }
    expect(bad).toEqual([])
  })
  it('the pack registers them with the lookup the chips read', () => {
    for (const id of Object.keys(PAPER_BRIDGES)) expect(lookupBridge(id), id).toBe(PAPER_BRIDGES[id])
  })
})

describe('papers glossary', () => {
  it('every entry is pp-, two-track, first used in its own chapter where it says, and registered', () => {
    for (const g of PAPER_GLOSSARY) {
      expect(courseOfId(g.id), g.id).toBe('papers')
      expect(g.formal?.trim(), `${g.id}: Formal sentence`).toBeTruthy()
      const unit = g.first.split(':')[0]
      const chapter = PAPER_CHAPTERS.find((l) => l.units.some((u) => u.id === unit))
      expect(chapter, `${g.id}: first use ${g.first}`).toBeDefined()
      const beat = chapter!.units.flatMap((u) => u.story ?? []).find((b) => b.id === g.first)
      for (const t of COURSES.papers.tracks) {
        const text = t === 'formal' ? (beat?.formal ?? '') : (beat?.text ?? '')
        expect(glossRefs(text), `${g.id} at ${g.first} (${t})`).toContain(g.id)
      }
      expect(lookupGloss(g.id), g.id).toBe(g)
    }
  })
})
