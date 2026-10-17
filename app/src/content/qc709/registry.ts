/**
 * Physics 709's light registry: the outline (Parts, plates, every planned chapter) and the list of written chapters,
 * without the chapters themselves. Every 709 page imports it, so it arrives with the first 709 page's lazy chunk and
 * registers the chapter list with the app (`metaFor('qc709')`, `metaById('Q4')`, content/courses.ts). It must never
 * be imported by 448 code (chunk contract (h), build/chunks.test.ts).
 *
 * It also registers the 709 LECTURE NOTES' light side (docs/roles/proposals/W-709-notes.md §4): the built notes lectures
 * (`metaById('N8')`, the return bar), the reverse index "chapter unit -> the notes sections that feed it"
 * (content/unitNotes.ts, for the "From the lecture notes" chips) and the generated bridges `qc-n8-<slug>` that lead from a
 * chapter unit to a notes section, and the notes lectures' loaders (content/qc709/notes/loaders.ts). No notes lecture is imported here
 * (build/chunks.test.ts rule (r)): only the generated listing.
 */
import { registerBridges, type BridgeTarget } from '../bridgeRegistry'
import { registerCourseMeta, registerNotesMeta } from '../courses'
import { registerLoaders } from '../load'
import { notesBridgeId, registerUnitNotes } from '../unitNotes'
import { QC_META } from './meta.generated'
import { NOTES_LOADERS } from './notes/loaders'
import { NOTES_BY_UNIT, NOTES_META } from './notes/meta.generated'

registerCourseMeta('qc709', QC_META)
registerNotesMeta(NOTES_META)
registerLoaders(NOTES_LOADERS)
registerUnitNotes(NOTES_BY_UNIT)

/** One bridge per notes section that feeds a chapter unit: `qc-` + the section id, landing on the section (and its page anchor). */
export const NOTES_BRIDGES: Readonly<Record<string, BridgeTarget>> = Object.fromEntries(
  Object.values(NOTES_BY_UNIT)
    .flat()
    .map((r): [string, BridgeTarget] => [notesBridgeId(r.unit), { course: 'qc709', lecture: r.lecture, unit: r.unit, label: r.label }]),
)
registerBridges(NOTES_BRIDGES)

export { QC_META, NOTES_META }
export * from './outline'
