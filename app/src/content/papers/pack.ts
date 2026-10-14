/**
 * The Papers section's lazy pack (docs/specs/papers-platform.md §6): what every papers chapter page may need but no other
 * page's first paint may carry. Loaded once with `loadPapersPack()` (content/load.ts); a papers chapter page waits for it.
 *   - Spin Lab's glossary (content/pack448.ts: a paper may cite a Spin Lab term);
 *   - glossary: each chapter's `<ID>.glossary.ts` (exports `GLOSSARY: GlossEntry[]`), merged by file name and registered
 *     with Gloss (content/glossRegistry.ts) on load, so a background chapter's terms serve every paper;
 *   - bridges into 448 and 709 (bridges.ts), registered with the bridge lookup (content/bridgeRegistry.ts) on load.
 * It holds no paper spec (build/chunks.test.ts rule (q)).
 */
import { registerBridges } from '../bridgeRegistry'
import { registerGloss } from '../glossRegistry'
// a paper may cite a Spin Lab term ([[qubit]]): the pack always brings Physics 448's glossary (content/pack448.ts)
import '../pack448'
import type { GlossEntry } from '../schema'
import { PAPER_BRIDGES } from './bridges'

const glossaries = import.meta.glob<{ GLOSSARY: GlossEntry[] }>('./[PB]*.glossary.ts', { eager: true })

export const PAPER_GLOSSARY: readonly GlossEntry[] = Object.values(glossaries).flatMap((m) => m.GLOSSARY)

registerGloss(PAPER_GLOSSARY)
registerBridges(PAPER_BRIDGES)

export { PAPER_BRIDGES }

/** Marks the pack as loaded (the chunk's side effects are the registrations above). */
export const PAPERS_PACK_READY = true
