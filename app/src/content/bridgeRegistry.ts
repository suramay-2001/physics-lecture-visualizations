/**
 * Bridges (W-709-platform §C): a Physics 709 chapter that needs something Spin Lab (448) teaches links to that 448
 * unit, and a return bar brings the reader back to the exact 709 place. The table itself (content/qc709/bridges.ts)
 * rides in the lazy 709 course pack and registers here when it loads, like the 709 glossary (glossRegistry.ts), so the
 * main chunk carries only this lookup. Prose names a bridge with `<<id|shown text>>` (content/walk.ts); a gloss entry
 * with `GlossEntry.bridge` offers it in its popover.
 * Main chunk, pure (no React).
 */
import { COURSES, type CourseId } from './courses'
import { LECTURE_META } from './meta.generated'

export interface BridgeTarget {
  /** The course of the target (448 for Spin Lab; 709 for a Foundations chapter). */
  course: CourseId
  /** Chapter id: 'L2', 'F3'. */
  lecture: string
  /** The unit the link lands on (its chapter card heading): 'l2-complex'. */
  unit: string
  /** A beat of that unit to put under the centre line, when the unit is long. */
  beat?: string
  /** What the reader finds there, in a few words (the footnote and the popover name it). */
  label: string
}

const bridges = new Map<string, BridgeTarget>()

export const lookupBridge = (id: string): BridgeTarget | undefined => bridges.get(id)

/** The course pack (and the DEV demo chapter) register their bridges; a clash with a different target throws. */
export function registerBridges(table: Readonly<Record<string, BridgeTarget>>): void {
  for (const [id, t] of Object.entries(table)) {
    const had = bridges.get(id)
    if (had && had !== t) throw new Error(`bridges: ${id} is already registered`)
    bridges.set(id, t)
  }
}

/**
 * Where a bridge lands, in the target course's words: "Spin Lab 2.3" (448: lecture.unit) and the unit's title from
 * the light registry, or "Chapter F2" for a 709 target. Null when the registry does not know the unit.
 */
export function bridgePlace(t: BridgeTarget): { short: string; title: string; lectureNumber: number; unitNumber: string } | null {
  if (t.course !== 'sl448') return { short: `${COURSES[t.course].noun.one} ${t.lecture}`, title: t.label, lectureNumber: 0, unitNumber: t.lecture }
  const l = LECTURE_META.find((m) => m.id === t.lecture)
  const k = l?.units.findIndex((u) => u.id === t.unit) ?? -1
  if (!l || k < 0) return null
  const unitNumber = `${l.number}.${k + 1}`
  return { short: `${COURSES.sl448.title} ${unitNumber}`, title: l.units[k].title, lectureNumber: l.number, unitNumber }
}

/**
 * The bridge's own words to print after the target's title, or '' when its label only repeats that title (case and
 * punctuation aside). Without this, "Spin Lab 1.5, States are vectors: states are vectors" (P-Q1-review item 20).
 */
export function bridgeGloss(t: BridgeTarget, title: string): string {
  const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}+−]+/gu, ' ').trim()
  return norm(t.label) === norm(title) ? '' : t.label
}
