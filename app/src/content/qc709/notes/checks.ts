/**
 * The two cross-checks every notes-collection page must pass (the lecture notes AND the Optics Lab), as pure functions so the
 * per-collection tests (notes/notes.test.ts, optics/optics.test.ts) share them and can show each one failing on a mutation. Test-side only:
 * nothing in the app imports this file.
 */
import type { BridgeTarget } from '../../bridgeRegistry'
import { claimKey } from '../../claimKit'
import type { Lecture } from '../../schema'
import { CHAPTER_KEY_RE, sectionBridges } from './kit'

/**
 * W4: the sections of a page that link no built unit. A "built unit" is the target of a bridge in the section's prose or caption
 * that resolves in a written chapter (709 or Spin Lab). Pure, so it can be shown to fail on a section with no link.
 */
export function unlinkedSections(lecture: Lecture, table: Readonly<Record<string, BridgeTarget>>, chapters: readonly Lecture[]): string[] {
  return lecture.units
    .filter((u) => {
      const built = sectionBridges(u).filter((id) => {
        const t = table[id]
        return !!t && chapters.some((c) => c.id === t.lecture && c.units.some((x) => x.id === t.unit))
      })
      return built.length === 0
    })
    .map((u) => `${u.id}: links no built unit (ruling W4: every notes section links at least one)`)
}

/**
 * W12: the claim keys of a page that are neither its own (`n<k>…` for a notes lecture, `o<k>…` for an optics page; in its values table)
 * nor a 709 chapter's key (in the merged chapter values).
 */
export function foreignClaimKeys(lecture: Lecture, own: Readonly<Record<string, number>>, chapterValues: Readonly<Record<string, number>>): string[] {
  const ownKey = new RegExp(`^${lecture.id[0].toLowerCase()}${lecture.number}[A-Z]`)
  const bad: string[] = []
  for (const u of lecture.units)
    for (const b of u.story ?? [])
      for (const c of b.claims ?? []) {
        const key = claimKey(c)
        if (key === null) bad.push(`${b.id}: claim without a key`)
        else if (ownKey.test(key)) {
          if (!(key in own)) bad.push(`${b.id}: ${key} is not in ${lecture.id}.values.ts`)
        } else if (CHAPTER_KEY_RE.test(key)) {
          if (!(key in chapterValues)) bad.push(`${b.id}: ${key} is not a key of the 709 chapters' merged values`)
        } else bad.push(`${b.id}: ${key} is neither ${lecture.id}'s own key nor a 709 chapter's`)
      }
  return bad
}
