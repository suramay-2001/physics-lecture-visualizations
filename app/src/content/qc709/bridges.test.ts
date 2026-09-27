/**
 * Bridges (W-709-platform §C "Tests"): every bridge id a 709 chapter (either track) or gloss uses exists; every target
 * resolves in its course (the lecture, the unit of that lecture, the beat of that unit); no entry is unused; ids carry
 * 709's `qc-` prefix. Runs on the real table (content/qc709/bridges.ts, empty until the first chapters land) and on the
 * DEV demo chapter's table, and the checker is shown to fail on each kind of mistake.
 */
import { describe, expect, it } from 'vitest'
import { bridgePlace, type BridgeTarget } from '../bridgeRegistry'
import { COURSES, courseOfId } from '../courses'
import { LECTURES } from '../index'
import type { GlossEntry, Lecture } from '../schema'
import { derivationSteps } from '../track'
import { bridgeRefs, inlineTokens, readingOrder } from '../walk'
import { DEMO_BRIDGES, DEMO_GLOSSARY, Q0 } from './__fixtures__/demoChapter'
import { BRIDGES } from './bridges'
import { QC_CHAPTERS } from './index'
import { QC_GLOSSARY } from './pack'

/** Every bridge id a set of chapters (in every track of their course) and glosses uses, with where. */
export function usedBridges(chapters: readonly Lecture[], glossary: readonly GlossEntry[]): { id: string; where: string }[] {
  const out: { id: string; where: string }[] = []
  for (const l of chapters)
    for (const t of COURSES[courseOfId(l.id)].tracks) {
      for (const s of readingOrder(l, t)) for (const id of bridgeRefs(s.text)) out.push({ id, where: `${s.where} (${t})` })
      for (const u of l.units)
        for (const b of u.story ?? []) for (const s of derivationSteps(b, t)) for (const id of bridgeRefs(s.why)) out.push({ id, where: `${b.id} derivation (${t})` })
    }
  for (const g of glossary) if (g.bridge) out.push({ id: g.bridge, where: `gloss ${g.id}` })
  return out
}

/** Where a target does not resolve in its course ([] = it lands on a real unit / beat). */
export function targetProblems(id: string, t: BridgeTarget, qcChapters: readonly Lecture[]): string[] {
  const bad: string[] = []
  const pool = t.course === 'sl448' ? LECTURES : qcChapters
  const l = pool.find((x) => x.id === t.lecture)
  if (courseOfId(t.lecture) !== t.course) bad.push(`${id}: ${t.lecture} is not a ${COURSES[t.course].code} chapter`)
  if (!l) return [...bad, `${id}: no chapter ${t.lecture} in ${COURSES[t.course].code}`]
  const u = l.units.find((x) => x.id === t.unit)
  if (!u) return [...bad, `${id}: no unit ${t.unit} in ${t.lecture}`]
  if (t.beat && !(u.story ?? []).some((b) => b.id === t.beat)) bad.push(`${id}: no beat ${t.beat} in ${t.unit}`)
  if (!t.label.trim() || t.label.length > 80) bad.push(`${id}: label must be 1–80 characters`)
  if (t.course === 'sl448' && !bridgePlace(t)) bad.push(`${id}: the light registry does not know ${t.unit}`)
  return bad
}

/** Every problem of a bridge table against the chapters and glosses that use it. */
export function bridgeProblems(chapters: readonly Lecture[], glossary: readonly GlossEntry[], table: Readonly<Record<string, BridgeTarget>>): string[] {
  const used = usedBridges(chapters, glossary)
  const bad: string[] = []
  for (const u of used) if (!Object.hasOwn(table, u.id)) bad.push(`${u.where}: unknown bridge ${u.id}`)
  for (const [id, t] of Object.entries(table)) {
    if (!/^qc-[a-z0-9-]+$/.test(id)) bad.push(`${id}: bridge ids start qc-`)
    bad.push(...targetProblems(id, t, chapters))
    if (!used.some((u) => u.id === id)) bad.push(`${id}: unused`)
  }
  return bad
}

describe('bridges', () => {
  it('the course table: every used id exists, every target resolves, none is unused', () => {
    expect(bridgeProblems(QC_CHAPTERS, QC_GLOSSARY, BRIDGES)).toEqual([])
  })

  it('the DEV demo chapter: two prose bridges in both tracks and one gloss bridge, all resolving', () => {
    expect(bridgeProblems([Q0], DEMO_GLOSSARY, DEMO_BRIDGES)).toEqual([])
    const used = usedBridges([Q0], DEMO_GLOSSARY)
    expect(new Set(used.map((u) => u.id))).toEqual(new Set(['qc-demo-complex', 'qc-demo-equator']))
    expect(used.filter((u) => u.where.endsWith('(formal)')).length).toBeGreaterThanOrEqual(2)
    expect(used.some((u) => u.where.startsWith('gloss '))).toBe(true)
  })

  it('names the landing place in the target course’s words', () => {
    expect(bridgePlace(DEMO_BRIDGES['qc-demo-complex'])).toMatchObject({ short: 'Spin Lab 2.3', title: 'Numbers that turn', unitNumber: '2.3' })
    expect(bridgePlace(DEMO_BRIDGES['qc-demo-equator'])?.short).toBe('Spin Lab 6.2')
  })

  it('fails on an unknown id, an unused entry, a wrong unit, a wrong beat, a foreign lecture and a bad id', () => {
    const t = DEMO_BRIDGES['qc-demo-complex']
    const withText = (text: string): Lecture => ({ ...Q0, units: [{ ...Q0.units[0], story: [{ ...Q0.units[0].story![0], text }] }] })
    // (b1's Formal text is untouched, so only the Ground-up track uses the unknown id)
    expect(bridgeProblems([withText('See <<qc-nowhere|this>>.')], [], {})).toEqual(['q0-demo-sphere:b1 (ground): unknown bridge qc-nowhere'])
    expect(bridgeProblems([withText('Nothing here.')], [], { 'qc-spare': t })).toEqual(['qc-spare: unused'])
    const used = withText('See <<qc-x|this>>.')
    expect(bridgeProblems([used], [], { 'qc-x': { ...t, unit: 'l2-nowhere' } })).toEqual(['qc-x: no unit l2-nowhere in L2'])
    expect(bridgeProblems([used], [], { 'qc-x': { ...t, beat: 'l2-complex:b99' } })).toEqual(['qc-x: no beat l2-complex:b99 in l2-complex'])
    expect(bridgeProblems([used], [], { 'qc-x': { ...t, lecture: 'Q3', unit: 'q3-x' } })).toEqual(['qc-x: Q3 is not a Physics 448 chapter', 'qc-x: no chapter Q3 in Physics 448'])
    const badId = withText('See <<spare|this>>.')
    expect(bridgeProblems([badId], [], { spare: t })).toEqual(['spare: bridge ids start qc-'])
    // a gloss that names a missing bridge
    expect(bridgeProblems([], [{ ...DEMO_GLOSSARY[0], bridge: 'qc-gone' }], {})).toEqual(['gloss qc-demo-amplitude: unknown bridge qc-gone'])
  })

  it('the syntax: <<id|shown>> is one token with plain shown text; ids outside [a-z0-9-] are invalid', () => {
    expect(inlineTokens('go <<qc-a|to Spin Lab>> now')).toEqual([
      { t: 'text', v: 'go ' },
      { t: 'bridge', id: 'qc-a', shown: 'to Spin Lab', valid: true },
      { t: 'text', v: ' now' },
    ])
    expect(inlineTokens('<<Bad Id|x>>')[0]).toMatchObject({ t: 'bridge', valid: false })
    expect(bridgeRefs('**see <<qc-a|a>>** and $<<not|tex>>$ and <<qc-b|b>>')).toEqual(['qc-a', 'qc-b'])
    // a comparison in TeX is TeX, never a bridge
    expect(bridgeRefs('$a << b$ and $x|y>>$')).toEqual([])
  })
})
