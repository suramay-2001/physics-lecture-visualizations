/**
 * A lecture as a beamline of chapters (Phase 4a, D-nav-story §3.2). Pure: which steps a unit has, their anchor
 * ids, the "02 / 05" counter, and where the reader is (unit + step) given section and anchor positions.
 *
 * The steps are the unit's EXISTING order made visible (UnitView decides the order; this only names it):
 *   with a story:  Story · Try it · Intuition · Pitfalls · Takeaway · Play   (pitfalls/takeaway/play if present)
 *   classic:       The lecture · The books · See it · Clues · Play
 */
import type { Unit } from '../content/schema'

export type StepKey = 'story' | 'try' | 'intuition' | 'pitfalls' | 'takeaway' | 'play' | 'lecture' | 'books' | 'see' | 'clues'
export interface ChapterStep {
  key: StepKey
  label: string
}

export function chapterSteps(u: Unit): ChapterStep[] {
  if (u.story?.length) {
    const s: ChapterStep[] = [
      { key: 'story', label: 'Story' },
      { key: 'try', label: 'Try it' },
      { key: 'intuition', label: 'Intuition' },
    ]
    if (u.pitfalls?.length) s.push({ key: 'pitfalls', label: 'Pitfalls' })
    if (u.review) s.push({ key: 'takeaway', label: 'Takeaway' })
    if (u.play.length) s.push({ key: 'play', label: 'Play' })
    return s
  }
  return [
    { key: 'lecture', label: 'The lecture' },
    { key: 'books', label: 'The books' },
    { key: 'see', label: 'See it' },
    { key: 'clues', label: 'Clues' },
    { key: 'play', label: 'Play' },
  ]
}

/** Anchor id of a step inside a unit (the unit's own id is its section id). */
export const stepId = (unitId: string, key: StepKey): string => `${unitId}--${key}`

const pad2 = (n: number) => String(n).padStart(2, '0')
/** "02 / 05": the chapter counter (k is 0-based). */
export const chapterCount = (k: number, n: number): string => `${pad2(k + 1)} / ${pad2(n)}`

export interface Where {
  /** unit index under the line (−1 before the first unit) */
  unit: number
  /** 0…1 progress through that unit (1 past the last one) */
  frac: number
  /** step index within that unit (−1 before its first anchor) */
  step: number
  /** 0…1 progress through that step's own stretch (step −1: from the unit top to its first step) */
  stepFrac: number
}

/**
 * Where the reader is: the unit whose section contains the line (document y), how far through it, and the last
 * step anchor of that unit at or above the line. `units` = section tops/bottoms; `steps[u]` = anchor tops.
 */
export function whereAt(line: number, units: readonly { top: number; bottom: number }[], steps: readonly (readonly number[])[]): Where {
  const n = units.length
  if (!n || line < units[0].top) return { unit: -1, frac: 0, step: -1, stepFrac: 0 }
  let u = n - 1
  for (let k = 0; k < n; k++) {
    const next = k + 1 < n ? units[k + 1].top : units[k].bottom
    if (line < next) {
      u = k
      break
    }
  }
  const top = units[u].top
  const end = u + 1 < n ? units[u + 1].top : units[u].bottom
  const frac = Math.min(1, Math.max(0, (line - top) / Math.max(1, end - top)))
  const st = steps[u] ?? []
  let step = -1
  for (let i = 0; i < st.length; i++) if (st[i] <= line) step = i
  const from = step < 0 ? top : st[step]
  const to = step + 1 < st.length ? st[step + 1] : end
  const stepFrac = Math.min(1, Math.max(0, (line - from) / Math.max(1, to - from)))
  return { unit: u, frac, step, stepFrac }
}
