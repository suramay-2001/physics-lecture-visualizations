/**
 * Physics 709's lazy course pack (W-709-platform §A, "Costs" 7): what every 709 page may need but 448's first paint
 * must never carry. Loaded once with `loadQcPack()` (content/load.ts); a 709 chapter page waits for it.
 *   - glossary: each chapter's `Q{n}.glossary.ts` (exports `GLOSSARY: GlossEntry[]`), merged by file name and
 *     registered with Gloss (content/glossRegistry.ts) on load;
 *   - concepts: the 709 concept graph (concepts.ts);
 *   - bridges into Spin Lab (bridges.ts), registered with the bridge lookup (content/bridgeRegistry.ts) on load;
 *   - fidelity notes of the 709 stage kinds and 709's additions to shared kinds (fidelity.ts), registered on load;
 *   - film captions: added by the film work (films pipeline).
 */
import { registerBridges } from '../bridgeRegistry'
import { registerGloss } from '../glossRegistry'
import type { GlossEntry } from '../schema'
import { BRIDGES } from './bridges'
import { QC_CONCEPTS } from './concepts'
// 709's fidelity notes register with content/fidelity.ts (the drawers of its own stage kinds, and its additions)
import './fidelity'

const glossaries = import.meta.glob<{ GLOSSARY: GlossEntry[] }>('./[QF]*.glossary.ts', { eager: true })

export const QC_GLOSSARY: readonly GlossEntry[] = Object.values(glossaries).flatMap((m) => m.GLOSSARY)

registerGloss(QC_GLOSSARY)
registerBridges(BRIDGES)

export { BRIDGES, QC_CONCEPTS }

/** Marks the pack as loaded (the lazy chunk's one side effect is the gloss registration above). */
export const QC_PACK_READY = true
