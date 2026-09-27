/**
 * Gloss lookup for both courses (W-709-platform §A, "Costs" 7). 448's glossary is eager (content/glossary.ts, main
 * chunk, as before). 709's terms never enter the main chunk: they ride in the lazy course pack
 * (content/qc709/pack.ts), which registers them here when it loads; a 709 chapter page loads the pack before it
 * renders. Ids are namespaced (709's start `qc-`), and a clash with an existing id throws.
 */
import { GLOSSARY } from './glossary'
import type { GlossEntry } from './schema'

const extra = new Map<string, GlossEntry>()

export const lookupGloss = (id: string): GlossEntry | undefined => GLOSSARY.get(id) ?? extra.get(id)

export function registerGloss(entries: Iterable<GlossEntry>): void {
  for (const e of entries) {
    const had = GLOSSARY.get(e.id) ?? extra.get(e.id)
    if (had && had !== e) throw new Error(`glossary: ${e.id} is already registered`)
    extra.set(e.id, e)
  }
}
