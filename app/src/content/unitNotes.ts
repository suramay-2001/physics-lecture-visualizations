/**
 * The 709 lecture notes' links INTO the chapters (docs/roles/proposals/W-709-notes.md §4), main chunk and pure: the reverse
 * index "chapter unit -> the notes sections that feed it" (`notesForUnit`) and the shapes of the generated notes registry
 * (qc709/notes/meta.generated.ts). 709's registry chunk fills the index on load (qc709/registry.ts), so a chapter page can
 * show "From the lecture notes" under a unit (components/UnitNotesLink.tsx) and nothing else on the main chunk grows with a lecture.
 *
 * Feeds are DERIVED from the notes' prose bridges (one source of truth, ruling W4): a section feeds the chapter unit each
 * `<<qc-…|…>>` link in it targets. The generated `qc-n8-<slug>` bridge ids lead back from the chapter unit to the section.
 *
 * Two collections share this machinery (the Optics Lab platform): `notes` (N8, "From the lecture notes") and `optics` (O3, "From the optics
 * lab"). Each has its own reverse index, so the notes behaviour is exactly as before; a unit may be fed by both.
 */
import type { NotesCollection } from './courses'
import type { LectureMeta, UnitMeta } from './meta'

/** A chapter unit a notes section feeds (the target of a bridge in the section's prose). */
export interface NotesFeed {
  chapter: string
  unit: string
}

/** A notes section as the index and the registry see it (`UnitMeta` has no challenges and no equations here). */
export interface NotesUnitMeta extends UnitMeta {
  /** Printed pages of the new edition: `p. 12` or `pp. 12–14`. */
  pages: string
  /** How many paragraphs (beats) the page has. */
  paras: number
  feeds: NotesFeed[]
}

/** A notes lecture (or an optics page) as the index sees it. */
export interface NotesLectureMeta extends LectureMeta {
  /** Class date `YYYY-MM-DD` (a notes lecture; an optics page has none). */
  date?: string
  /** The book chapter an optics page follows (optics pages only). */
  book?: string
  /** The span of printed pages of the whole lecture. */
  pages: string
  topics: string[]
  units: NotesUnitMeta[]
}

/** One notes section that feeds a chapter unit: where it is and how to name it ("Lecture 8 notes, §C, pp. 25–26"). */
export interface UnitNoteRow {
  /** `N8` (or `O3` for an optics page). */
  lecture: string
  /** The section id `n8-bell-basis` (also the page anchor). */
  unit: string
  /** The bridge label: `Lecture 8 notes, §C, pp. 25–26` (`Optics Lab O3, §2, pp. 12–14`). */
  label: string
  /** The chip's shown words: the label without the lecture name, `§C, pp. 25–26`. */
  where: string
}

const byUnit: Record<NotesCollection, Map<string, readonly UnitNoteRow[]>> = { notes: new Map(), optics: new Map() }

/** The bridge id that leads from a chapter unit to a notes section: `qc-` + the section id (`qc-n8-bell-basis`). */
export const notesBridgeId = (sectionId: string): string => `qc-${sectionId}`

/** 709's registry chunk registers a collection's reverse index when it loads; a second call for the same collection replaces the first. */
export function registerUnitNotes(rows: Readonly<Record<string, readonly UnitNoteRow[]>>, collection: NotesCollection = 'notes'): void {
  const m = byUnit[collection]
  m.clear()
  for (const [unit, list] of Object.entries(rows)) m.set(unit, list)
}

/** The sections of a collection that feed a chapter unit, in page order; none for a 448 unit, or for a unit no page links. */
export const notesForUnit = (unitId: string, collection: NotesCollection = 'notes'): readonly UnitNoteRow[] => byUnit[collection].get(unitId) ?? []
