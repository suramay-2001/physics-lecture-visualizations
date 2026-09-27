/**
 * Physics 709's lazy course pack (W-709-platform §A, "Costs" 7): what every 709 page may need but 448's first paint
 * must never carry. Loaded once with `loadQcPack()` (content/load.ts); a 709 chapter page waits for it.
 *   - glossary: each chapter's `Q{n}.glossary.ts` (exports `GLOSSARY: GlossEntry[]`), merged by file name and
 *     registered with Gloss (content/glossRegistry.ts) on load;
 *   - concepts: the 709 concept graph (concepts.ts);
 *   - bridges and film captions: added by the bridge and film work (part B, films pipeline).
 */
import { registerGloss } from '../glossRegistry'
import type { GlossEntry } from '../schema'
import { QC_CONCEPTS } from './concepts'

const glossaries = import.meta.glob<{ GLOSSARY: GlossEntry[] }>('./[QF]*.glossary.ts', { eager: true })

export const QC_GLOSSARY: readonly GlossEntry[] = Object.values(glossaries).flatMap((m) => m.GLOSSARY)

registerGloss(QC_GLOSSARY)

export { QC_CONCEPTS }

/** Marks the pack as loaded (the lazy chunk's one side effect is the gloss registration above). */
export const QC_PACK_READY = true
