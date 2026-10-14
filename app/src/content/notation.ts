/**
 * The notation dictionary (notation explainers, decisions/notation-explainers.md; role P): every entry of
 * content/notation.entries.ts by id, and the bridge behind an entry's "learn it" link. LAZY, like the entries and the
 * kit: it loads when a card or a chapter's notation key is first wanted and never joins the entry chunk
 * (build/chunks.test.ts rule (o)).
 */
import type { BridgeTarget } from './bridgeRegistry'
import { COURSES, type CourseId, courseOfId } from './courses'
import { ENTRIES } from './notation.entries'
import type { NotationCtx } from '../ui/notationCodec'
import { type NotationEntry, taughtUnit } from './notationKit'

export { cx, meaningOf, physicsOf, tx, type Example, type NotationEntry, type Seg } from './notationKit'

export const NOTATION: readonly NotationEntry[] = ENTRIES
export const NOTATION_BY_ID: ReadonlyMap<string, NotationEntry> = new Map(ENTRIES.map((e) => [e.id, e]))

const targets = new Map<string, BridgeTarget>()
/**
 * The bridge (content/bridgeRegistry.ts) behind an entry's link, for a reader of `course`: its id is `nt-<entry>`, with
 * the prefix `qc-` for 709 readers and `pp-` for Papers readers (the course's `idPrefix`), so the chip words ("Spin Lab 2.3", "Chapter F2", "Go further in 709") follow the
 * reader's side. The target object is made once per id (the registry refuses a second, different one).
 */
export function taughtBridge(e: NotationEntry, course: CourseId, ctx?: Readonly<NotationCtx>): { id: string; target: BridgeTarget } | null {
  // a use of the symbol with a unit of its own (the bit dot product): its own bridge, named for that unit
  const here = ctx ? e.taughtHere?.(ctx) : undefined
  if (here) {
    const hid = `${COURSES[course].idPrefix}nt-${e.id}-${here.unit}`
    let ht = targets.get(hid)
    if (!ht) {
      ht = { course: courseOfId(here.unit), lecture: here.unit.split('-')[0].toUpperCase(), unit: here.unit, label: here.label }
      targets.set(hid, ht)
    }
    return { id: hid, target: ht }
  }
  const unit = taughtUnit(e, course)
  if (!unit) return null
  const id = `${COURSES[course].idPrefix}nt-${e.id}`
  let target = targets.get(id)
  if (!target) {
    target = { course: courseOfId(unit), lecture: unit.split('-')[0].toUpperCase(), unit, label: e.name }
    targets.set(id, target)
  }
  return { id, target }
}
