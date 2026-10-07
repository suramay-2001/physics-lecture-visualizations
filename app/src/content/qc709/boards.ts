/**
 * The 709 formula boards: what each chapter leaves on the board, per unit and per track, with the place each line
 * comes from. Pure (no React, no DOM), and read from the chapter data the story already carries, so a board can never
 * disagree with its chapter:
 *   - every derivation's `result` (`Beat.derivation`), linked to its beat, with the number of lines in the track;
 *   - the unit's review card equations (`ReviewCard.equations`, the Formal card's when the track has one).
 * Used by pages/Pages709.tsx (lazy chunk); never imported by the entry.
 */
import type { Track } from '../courses'
import type { Lecture } from '../schema'
import { derivationSteps, pickReview } from '../track'

export interface BoardLine {
  /** Display TeX. */
  tex: string
  /** `derived`: the result of a derivation in the story; `review`: the unit's review card line. */
  kind: 'derived' | 'review'
  /** The beat the derivation sits in (`unit:b3`): the way back to it (`?at=`). Derived lines only. */
  beat?: string
  /** How many lines the derivation has in this track. Derived lines only. */
  steps?: number
}

export interface BoardUnit {
  id: string
  title: string
  lines: BoardLine[]
}

const squash = (tex: string) => tex.replace(/\s+/g, '')

/** A chapter's board in a track: its units in order, those with nothing on the board left out. */
export function boardFor(lecture: Lecture, track: Track): BoardUnit[] {
  const units: BoardUnit[] = []
  for (const u of lecture.units) {
    const lines: BoardLine[] = []
    const seen = new Set<string>()
    for (const b of u.story ?? []) {
      if (!b.derivation || seen.has(squash(b.derivation.result))) continue
      seen.add(squash(b.derivation.result))
      lines.push({ tex: b.derivation.result, kind: 'derived', beat: b.id, steps: derivationSteps(b, track).length })
    }
    if (u.review) lines.push({ tex: pickReview(u.review, track).equations, kind: 'review' })
    if (lines.length) units.push({ id: u.id, title: u.title, lines })
  }
  return units
}
