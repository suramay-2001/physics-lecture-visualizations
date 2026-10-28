/**
 * "From the lecture notes" (docs/roles/proposals/W-709-notes.md §4, ruling W6): under a chapter unit's question, one bridge chip
 * per notes section that feeds the unit ("§C, pp. 25–26 · Lecture 8 notes"). The chip is an ordinary bridge (`qc-n8-<slug>`, generated
 * from the notes' own prose links and registered with 709's registry chunk), so it carries the usual way back: following it opens
 * the section and the return bar leads back to this unit. It renders nothing for a 448 unit and for a unit no note links, so every
 * page that shows no notes is exactly as it was. Per unit, not per beat (a per-beat link can follow without a schema change).
 *
 * The Optics Lab (the second collection) reuses all of it: a unit an optics section feeds shows a second line, "From the optics lab",
 * with the same kind of chip (`qc-o3-<slug>`). A unit fed by both shows both lines, notes first.
 */
import type { NotesCollection } from '../content/courses'
import { notesBridgeId, notesForUnit } from '../content/unitNotes'
import { BridgeLink } from './BridgeLink'

/** The filler of `UnitAsideContext` (components/UnitView.tsx): the 709 chapter page provides it. */
export const unitNotesAside = (unitId: string) => <UnitNotesLink unitId={unitId} />

/** The words before the chips, and the data attribute a test or an e2e spec reads, per collection. */
const LINES: Record<NotesCollection, { lead: string; attr: 'data-unit-notes' | 'data-unit-optics' }> = {
  notes: { lead: 'From the lecture notes:', attr: 'data-unit-notes' },
  optics: { lead: 'From the optics lab:', attr: 'data-unit-optics' },
}

function Line({ unitId, collection }: { unitId: string; collection: NotesCollection }) {
  const rows = notesForUnit(unitId, collection)
  if (rows.length === 0) return null
  const { lead, attr } = LINES[collection]
  return (
    <p className="unit-notes" {...{ [attr]: unitId }}>
      {lead}
      {rows.map((r) => (
        <BridgeLink key={r.unit} id={notesBridgeId(r.unit)}>
          {r.where}
        </BridgeLink>
      ))}
    </p>
  )
}

export function UnitNotesLink({ unitId }: { unitId: string }) {
  return (
    <>
      <Line unitId={unitId} collection="notes" />
      <Line unitId={unitId} collection="optics" />
    </>
  )
}
