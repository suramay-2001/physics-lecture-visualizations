/**
 * Physics 448's lazy pack (the counterpart of 709's content/qc709/pack.ts): what a Spin Lab lecture page may need but
 * the first paint of the home page, the topbar and the route list must never carry, so the main chunk stops growing with
 * every lecture. Loaded once with `loadSlPack()` (content/load.ts); a lecture's load includes it, so a lecture is never
 * on the page before its glossary:
 *   - glossary: every `[[term]]` popover (content/glossary.ts), registered with Gloss (content/glossRegistry.ts) on load;
 *   - unit details: each unit's opening question and board equations (content/meta.detail.generated.ts), registered with
 *     the registry (content/meta.ts `unitDetail`) for the lecture fork's preview of the next lecture;
 *   - fidelity: the passport drawers of 448's stage kinds and their variants (content/fidelity.sl448.ts), registered with
 *     `fidelityOf` (content/fidelity.ts); 709 reads the same tables for the kinds it shares, through its own pack.
 * Nothing here is a lecture (rule (d)): the lectures themselves stay one chunk each.
 */
import { registerBaseFidelity } from './fidelity'
import { FIDELITY, FIDELITY_VARIANT } from './fidelity.sl448'
import { GLOSSARY } from './glossary'
import { registerGloss } from './glossRegistry'
import { registerUnitDetails } from './meta'
import { UNIT_DETAIL } from './meta.detail.generated'

registerGloss(GLOSSARY.values())
registerUnitDetails(UNIT_DETAIL)
registerBaseFidelity({ ...FIDELITY, optical: FIDELITY_VARIANT.optical, poincare: FIDELITY_VARIANT.poincare, 'plane-polarization': FIDELITY_VARIANT.planePolarization })

export { FIDELITY, FIDELITY_VARIANT, GLOSSARY, UNIT_DETAIL }

/** Marks the pack as loaded (the lazy chunk's one side effect is the registrations above). */
export const SL_PACK_READY = true
