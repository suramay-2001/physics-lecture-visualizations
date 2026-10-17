/**
 * "From the lecture notes" (docs/roles/proposals/W-709-notes.md §4, ruling W6): under a chapter unit's question, one bridge chip
 * per notes section that feeds the unit ("§C, pp. 25–26 · Lecture 8 notes"). The chip is an ordinary bridge (`qc-n8-<slug>`, generated
 * from the notes' own prose links and registered with 709's registry chunk), so it carries the usual way back: following it opens
 * the section and the return bar leads back to this unit. It renders nothing for a 448 unit and for a unit no note links, so every
 * page that shows no notes is exactly as it was. Per unit, not per beat (a per-beat link can follow without a schema change).
 */
import { notesBridgeId, notesForUnit } from '../content/unitNotes'
import { BridgeLink } from './BridgeLink'

/** The filler of `UnitAsideContext` (components/UnitView.tsx): the 709 chapter page provides it. */
export const unitNotesAside = (unitId: string) => <UnitNotesLink unitId={unitId} />

export function UnitNotesLink({ unitId }: { unitId: string }) {
  const rows = notesForUnit(unitId)
  if (rows.length === 0) return null
  return (
    <p className="unit-notes" data-unit-notes={unitId}>
      From the lecture notes:
      {rows.map((r) => (
        <BridgeLink key={r.unit} id={notesBridgeId(r.unit)}>
          {r.where}
        </BridgeLink>
      ))}
    </p>
  )
}
