/**
 * Physics 448's lazy pack (the counterpart of 709's content/qc709/pack.ts): what a Spin Lab lecture page may need but
 * the first paint of the home page, the topbar and the route list must never carry, so the main chunk stops growing with
 * every lecture. Loaded once with `loadSlPack()` (content/load.ts); a lecture's load includes it, so a lecture is never
 * on the page before its glossary:
 *   - glossary: every `[[term]]` popover (content/glossary.ts), registered with Gloss (content/glossRegistry.ts) on load;
 *   - unit details: each unit's opening question and board equations (content/meta.detail.generated.ts), registered with
 *     the registry (content/meta.ts `unitDetail`) for the lecture fork's preview of the next lecture.
 * Nothing here is a lecture (rule (d)): the lectures themselves stay one chunk each.
 */
import { GLOSSARY } from './glossary'
import { registerGloss } from './glossRegistry'
import { registerUnitDetails } from './meta'
import { UNIT_DETAIL } from './meta.detail.generated'

registerGloss(GLOSSARY.values())
registerUnitDetails(UNIT_DETAIL)

export { GLOSSARY, UNIT_DETAIL }

/** Marks the pack as loaded (the lazy chunk's one side effect is the registrations above). */
export const SL_PACK_READY = true
