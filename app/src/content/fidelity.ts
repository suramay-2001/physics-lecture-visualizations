/**
 * Fidelity contracts: what each stage picture gets right, simplifies, or distorts on purpose (owner: P after the
 * l1-freeze tag). The passport's ⓘ opens `fidelityOf(passportOf(state).fidelityKey, course)`.
 *
 * This file is the registry (main chunk) and stays small. Physics 448's own tables (`FIDELITY`, `FIDELITY_VARIANT`,
 * content/fidelity.sl448.ts) ride in the lazy 448 pack and register here on load (`registerBaseFidelity`); 709's notes
 * register through its course pack (`registerCourseFidelity`) and the SVG kinds' through `registerSharedFidelity`. A page
 * that opens a drawer is inside a loaded lecture, so the notes are there before anyone can ask for them.
 *
 * Seeded by W from P2-L1-story §2, pasted as data. Ids are /^[a-z0-9-]+$/ and globally unique (content test); a beat
 * flags an item as "relevant now" with `Beat.fidelity: [id]`. Every item is ≤ 25 words per sentence
 * (content/symbols.test.ts).
 */
import type { CourseId } from './courses'
import type { Fidelity, FidelityKey } from './stage'

/**
 * Physics 448's own drawers, by key (its six WebGL kinds, and the variants that change what the space is: optical,
 * poincare, plane-polarization). Registered by the lazy 448 pack; 709 reads the same base for the kinds it shares.
 */
const base: Partial<Record<FidelityKey, Fidelity>> = {}
export function registerBaseFidelity(table: Partial<Record<FidelityKey, Fidelity>>): void {
  Object.assign(base, table)
}

/**
 * A course's own fidelity notes (W-709-platform §E: Physics 709's live in content/qc709/fidelity.ts, registered by the
 * lazy course pack, so 448's first paint never carries them): the whole drawer of a kind only that course uses, and
 * additions to a shared kind's drawer shown only in that course (448's drawers never change).
 */
export interface CourseFidelity {
  kinds: Partial<Record<FidelityKey, Fidelity>>
  additions: Partial<Record<FidelityKey, Partial<Fidelity>>>
}
const byCourse = new Map<CourseId, CourseFidelity>()
export function registerCourseFidelity(course: CourseId, f: CourseFidelity): void {
  byCourse.set(course, f)
}

/**
 * The drawers of the SVG stage kinds, which BOTH courses use (interface change W-448 #5, rulings 448-L8L11 P6: the SVG
 * kinds are shared stage code, so a 448 lecture may draw one). content/fidelity.svg.ts registers them when the kinds'
 * lazy chunk loads (stage/svg/kinds.ts); a course's own `kinds` entry for the same key wins.
 */
const shared: Partial<Record<FidelityKey, Fidelity>> = {}
export function registerSharedFidelity(kinds: Partial<Record<FidelityKey, Fidelity>>): void {
  Object.assign(shared, kinds)
}

const EMPTY: Fidelity = { exact: [], schematic: [], misleading: [] }

/**
 * The drawer contents for a passport's fidelity key, in a course (448 by default). 448's own six kinds are exactly its
 * table; a key it does not have reads the course's own pack, then the shared SVG-kind notes, else is empty.
 */
export function fidelityOf(key: FidelityKey, course: CourseId = 'sl448'): Fidelity {
  const own = byCourse.get(course)
  const table: Fidelity = base[key] ?? own?.kinds[key] ?? shared[key] ?? EMPTY
  const add = course === 'sl448' ? undefined : own?.additions[key]
  if (!add) return table
  return { exact: [...table.exact, ...(add.exact ?? [])], schematic: [...table.schematic, ...(add.schematic ?? [])], misleading: [...table.misleading, ...(add.misleading ?? [])] }
}
