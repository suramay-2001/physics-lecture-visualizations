/**
 * Gloss lookup for both courses (W-709-platform §A, "Costs" 7). Neither glossary is in the main chunk: 448's terms ride
 * in the lazy 448 pack (content/pack448.ts) and 709's in the lazy course pack (content/qc709/pack.ts); each registers
 * its entries here when it loads. A lecture or chapter page loads its pack before it renders (content/load.ts: a 448
 * lecture's load includes the 448 pack, and 709's pack includes it too, since a 709 chapter may cite a Spin Lab term).
 * Ids are namespaced (709's start `qc-`), and a clash with an existing id throws.
 */
import type { GlossEntry } from './schema'

const entries = new Map<string, GlossEntry>()

export const lookupGloss = (id: string): GlossEntry | undefined => entries.get(id)

export function registerGloss(list: Iterable<GlossEntry>): void {
  for (const e of list) {
    const had = entries.get(e.id)
    if (had && had !== e) throw new Error(`glossary: ${e.id} is already registered`)
    entries.set(e.id, e)
  }
}

/**
 * "Notation beats" (W-709 #12): the eyebrow text for a beat's `introduces` list, from the first listed gloss id that
 * is registered and itself marked `introduces` ('space' → "New space", 'notation' → "New notation"); null otherwise
 * (an unlisted or plain id names nothing to show).
 */
export function introducesLabel(ids: readonly string[] | undefined): string | null {
  for (const id of ids ?? []) {
    const kind = lookupGloss(id)?.introduces
    if (kind === 'space') return 'New space'
    if (kind === 'notation') return 'New notation'
  }
  return null
}
