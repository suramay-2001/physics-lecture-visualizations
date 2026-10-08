/**
 * 448 → 709 bridges (interface change W-448 #4; rulings 448-L8L11 P4), the mirror of content/qc709/bridges.test.ts: every
 * `sl-…` id a 448 chapter or gloss uses exists in content/bridges448.ts; every entry leads to a WRITTEN 709 chapter, unit
 * (and beat); no entry is unused; ids are `sl-` + the target unit and never collide with 709's `qc-…`; a lecture that
 * uses one imports the table (so it registers with the lecture's chunk, never the entry). Runs on the (still empty) real
 * table and on the DEV fixture chip, and the checker is shown to fail on each kind of mistake.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { BridgeLink, BridgeNotes } from '../components/BridgeLink'
import { DEMO_BRIDGES, Q0 } from './qc709/__fixtures__/demoChapter'
import { DEV_BRIDGES_448, DEV_CHIP_BEAT, DEV_CHIP_ID, DEV_CHIP_LECTURE, withDevChip } from './__fixtures__/devBridge448'
import { BRIDGE_ID_448, bridgeChipText, bridgePlace, leavesSpinLab, lookupBridge, registerBridges, type BridgeTarget } from './bridgeRegistry'
import { BRIDGES_448 } from './bridges448'
import { COURSES, courseOfId } from './courses'
import { GLOSSARY } from './glossary'
import { LECTURES } from './index'
import { BRIDGES } from './qc709/bridges'
import { QC_CHAPTERS } from './qc709/index'
import type { GlossEntry, Lecture } from './schema'
import { bridgeRefs, readingOrder } from './walk'

/** Every bridge id a set of 448 chapters (Ground-up, their one track) and glosses uses, with where. */
export function usedBridges448(chapters: readonly Lecture[], glossary: readonly GlossEntry[]): { id: string; where: string }[] {
  const out: { id: string; where: string }[] = []
  for (const l of chapters) for (const s of readingOrder(l, 'ground')) for (const id of bridgeRefs(s.text)) out.push({ id, where: s.where })
  for (const g of glossary) if (g.bridge) out.push({ id: g.bridge, where: `gloss ${g.id}` })
  return out
}

/** Where a 448-defined bridge does not land on a written 709 chapter / unit / beat ([] = it does). */
export function targetProblems448(id: string, t: BridgeTarget, qcChapters: readonly Lecture[]): string[] {
  const bad: string[] = []
  if (t.course !== 'qc709') return [`${id}: a 448 bridge leads into Physics 709 (course 'qc709'), not ${t.course}`]
  if (!COURSES.qc709.chapterId.test(t.lecture)) bad.push(`${id}: ${t.lecture} is not a Physics 709 chapter id`)
  const l = qcChapters.find((x) => x.id === t.lecture)
  if (!l) return [...bad, `${id}: no written chapter ${t.lecture} in Physics 709`]
  const u = l.units.find((x) => x.id === t.unit)
  if (!u) return [...bad, `${id}: no unit ${t.unit} in ${t.lecture}`]
  if (t.beat && !(u.story ?? []).some((b) => b.id === t.beat)) bad.push(`${id}: no beat ${t.beat} in ${t.unit}`)
  if (!t.label.trim() || t.label.length > 80) bad.push(`${id}: label must be 1–80 characters`)
  return bad
}

/** Every problem of a 448 bridge table against the chapters and glosses that use it. */
export function bridgeProblems448(
  chapters: readonly Lecture[],
  glossary: readonly GlossEntry[],
  table: Readonly<Record<string, BridgeTarget>>,
  qcChapters: readonly Lecture[],
): string[] {
  const used = usedBridges448(chapters, glossary)
  const bad: string[] = []
  for (const u of used) if (!Object.hasOwn(table, u.id)) bad.push(`${u.where}: unknown bridge ${u.id}`)
  for (const [id, t] of Object.entries(table)) {
    if (!BRIDGE_ID_448.test(id) || courseOfId(id) !== 'sl448') bad.push(`${id}: 448 bridge ids start sl-`)
    if (Object.hasOwn(BRIDGES, id)) bad.push(`${id}: already a 709 bridge id`)
    bad.push(...targetProblems448(id, t, qcChapters))
    if (!used.some((u) => u.id === id)) bad.push(`${id}: unused`)
  }
  return bad
}

/**
 * The lecture files (`L{n}.ts`, `.story`, `.review`, `.values`) that use a 448 bridge but whose `L{n}.ts` does not import
 * the table: the bridge would register nowhere and render as a plain word. `files` maps a file name to its source text.
 */
export function missingTableImports(files: Readonly<Record<string, string>>): string[] {
  const uses = (src: string) => /<<sl-[a-z0-9-]+\|/.test(src) || /bridge:\s*['"]sl-/.test(src)
  const lectures = new Set(Object.keys(files).flatMap((f) => /^\.\/(L\d+)(?:\.[a-z]+)?\.ts$/.exec(f)?.[1] ?? []))
  return [...lectures].filter((n) => {
    const own = Object.entries(files).filter(([f]) => new RegExp(`^\\./${n}(\\.[a-z]+)?\\.ts$`).test(f))
    return own.some(([, src]) => uses(src)) && !/import\s+['"]\.\/bridges448['"]/.test(files[`./${n}.ts`] ?? '')
  })
}

const L5 = LECTURES.find((l) => l.id === DEV_CHIP_LECTURE)!

describe('448 → 709 bridges', () => {
  it('the real table: every used id exists, every target is a written 709 unit, none is unused (empty until L8–L11)', () => {
    expect(bridgeProblems448(LECTURES, [...GLOSSARY.values()], BRIDGES_448, QC_CHAPTERS)).toEqual([])
  })

  it('the DEV fixture chip: appended to one real beat of Lecture 5, resolving in the demo chapter', () => {
    const chipped = withDevChip(L5)
    const beats = (l: Lecture) => l.units.flatMap((u) => u.story ?? [])
    const changed = beats(chipped).filter((b, i) => b !== beats(L5)[i])
    expect(changed.map((b) => b.id)).toEqual([DEV_CHIP_BEAT])
    expect(changed[0].text).toContain(`<<${DEV_CHIP_ID}|`)
    expect(withDevChip(LECTURES[0])).toBe(LECTURES[0]) // any other lecture is untouched
    expect(L5.units.flatMap((u) => u.story ?? []).some((b) => b.text.includes('<<sl-'))).toBe(false) // and the real one never changes
    expect(bridgeProblems448([chipped], [...GLOSSARY.values()], DEV_BRIDGES_448, [...QC_CHAPTERS, Q0])).toEqual([])
    expect(lookupBridge(DEV_CHIP_ID)).toBe(DEV_BRIDGES_448[DEV_CHIP_ID]) // withDevChip registered it
  })

  it('fails on an unknown id, an unused entry, a bad id, a 448 target, a wrong chapter / unit / beat, and a long label', () => {
    const t = DEV_BRIDGES_448[DEV_CHIP_ID]
    const qc = [...QC_CHAPTERS, Q0]
    const withText = (text: string): Lecture => ({ ...L5, units: [{ ...L5.units[0], story: [{ ...L5.units[0].story![0], text }] }] })
    const none = withText('Nothing here.')
    const uses = withText('See <<sl-x|this>>.')
    expect(bridgeProblems448([withText('See <<sl-nowhere|this>>.')], [], {}, qc)).toEqual([`${L5.units[0].story![0].id}: unknown bridge sl-nowhere`])
    expect(bridgeProblems448([none], [], { 'sl-spare': t }, qc)).toEqual(['sl-spare: unused'])
    expect(bridgeProblems448([withText('See <<qc-x|this>>.')], [], { 'qc-x': t }, qc)).toEqual(['qc-x: 448 bridge ids start sl-'])
    expect(bridgeProblems448([withText('See <<sl-q-x|this>>.')], [], { 'sl-q-x': { ...t, course: 'sl448', lecture: 'L2', unit: 'l2-complex' } }, qc)).toEqual([
      "sl-q-x: a 448 bridge leads into Physics 709 (course 'qc709'), not sl448",
    ])
    expect(bridgeProblems448([uses], [], { 'sl-x': { ...t, lecture: 'Q99' } }, qc)).toEqual(['sl-x: no written chapter Q99 in Physics 709'])
    expect(bridgeProblems448([uses], [], { 'sl-x': { ...t, lecture: 'L8' } }, qc)).toEqual(['sl-x: L8 is not a Physics 709 chapter id', 'sl-x: no written chapter L8 in Physics 709'])
    expect(bridgeProblems448([uses], [], { 'sl-x': { ...t, unit: 'q0-nowhere' } }, qc)).toEqual(['sl-x: no unit q0-nowhere in Q0'])
    expect(bridgeProblems448([uses], [], { 'sl-x': { ...t, beat: 'q0-demo-sphere:b99' } }, qc)).toEqual(['sl-x: no beat q0-demo-sphere:b99 in q0-demo-sphere'])
    expect(bridgeProblems448([uses], [], { 'sl-x': { ...t, label: 'x'.repeat(81) } }, qc)).toEqual(['sl-x: label must be 1–80 characters'])
    // a 709 bridge id is never reused, and a gloss that names a missing bridge is caught
    const taken = Object.keys(BRIDGES)[0]
    expect(bridgeProblems448([withText(`See <<${taken}|this>>.`)], [], { [taken]: t }, qc)).toContain(`${taken}: 448 bridge ids start sl-`)
    expect(bridgeProblems448([], [{ id: 'g', term: 'g', gloss: 'g.', first: 'l5-averages', bridge: 'sl-gone' }], {}, qc)).toEqual(['gloss g: unknown bridge sl-gone'])
  })

  it('ids: `sl-` + a unit id; 448-defined and 709-defined bridges never collide, and both tables register together', () => {
    expect(BRIDGE_ID_448.test(DEV_CHIP_ID)).toBe(true)
    for (const bad of ['qc-l2-complex', 'sl-', 'sl-Q14', 'sl_q14', 'q14-x', 'SL-x', 'sl-x y']) expect(BRIDGE_ID_448.test(bad), bad).toBe(false)
    for (const id of [...Object.keys(BRIDGES_448), ...Object.keys(DEV_BRIDGES_448)]) expect(courseOfId(id), id).toBe('sl448')
    expect(Object.keys(BRIDGES).filter((id) => BRIDGE_ID_448.test(id))).toEqual([])
    registerBridges(DEV_BRIDGES_448)
    registerBridges(DEV_BRIDGES_448) // the same table twice (two lectures import it) is fine
    registerBridges(DEMO_BRIDGES)
    expect(() => registerBridges({ [DEV_CHIP_ID]: { ...DEV_BRIDGES_448[DEV_CHIP_ID], label: 'another' } })).toThrow(/already registered/)
  })

  it('the chip names its target in the direction it goes: "Go further in 709 · Chapter Q0" down, "Spin Lab 2.3" up', () => {
    registerBridges(DEV_BRIDGES_448)
    registerBridges(DEMO_BRIDGES)
    const out = DEV_BRIDGES_448[DEV_CHIP_ID]
    const back = DEMO_BRIDGES['qc-demo-complex']
    expect(leavesSpinLab(DEV_CHIP_ID, out)).toBe(true)
    expect(leavesSpinLab('qc-demo-complex', back)).toBe(false)
    expect(leavesSpinLab('qc-f2-vectors', BRIDGES['qc-f2-vectors'])).toBe(false) // 709 → 709 keeps its words
    expect(bridgePlace(out)).toMatchObject({ short: 'Chapter Q0' })
    expect(bridgeChipText(DEV_CHIP_ID, out, 'inline')).toBe('Go further in 709 · Chapter Q0')
    expect(bridgeChipText(DEV_CHIP_ID, out, 'gloss')).toBe('Go further in 709 · Chapter Q0')
    expect(bridgeChipText('qc-demo-complex', back, 'inline')).toBe('Spin Lab 2.3')
    expect(bridgeChipText('qc-demo-complex', back, 'gloss')).toBe('Learn it in Spin Lab 2.3')
    expect(bridgeChipText('qc-f2-vectors', BRIDGES['qc-f2-vectors'], 'inline')).toBe('Chapter F2')
    const chip = renderToString(<BridgeLink id={DEV_CHIP_ID}>the demo</BridgeLink>)
    expect(chip).toContain('data-bridge="sl-dev-q0-sphere"')
    expect(chip).toContain('data-to="qc709"')
    expect(chip).toContain('data-from="sl448"')
    expect(chip).toContain('Go further in 709 · Chapter Q0')
    expect(chip).toContain('>↓<')
    const up = renderToString(<BridgeLink id="qc-demo-complex">numbers</BridgeLink>)
    expect(up).toContain('data-to="sl448"')
    expect(up).not.toContain('data-from')
    expect(up).toContain('>↑<')
    expect(renderToString(<BridgeNotes ids={[DEV_CHIP_ID]} />)).toContain('Physics 709, Chapter Q0: the demo chapter’s sphere.')
  })

  it('a lecture that uses a bridge must import the table (the scan fails on a forgotten import)', () => {
    const files = import.meta.glob('./L*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
    expect(Object.keys(files).length).toBeGreaterThan(20)
    expect(missingTableImports(files)).toEqual([])
    const uses = { './L8.ts': "import { x } from './y'", './L8.story.ts': "text: 'a <<sl-q2-photon|chip>>'", './L9.ts': "import './bridges448'", './L9.story.ts': "bridge: 'sl-f6-pairs'", './L10.story.ts': 'text: "no bridge"' }
    expect(missingTableImports(uses)).toEqual(['L8'])
    expect(missingTableImports({ ...uses, './L8.ts': "import './bridges448'\nimport { x } from './y'" })).toEqual([])
  })
})
