/**
 * The shape of a notation dictionary entry and the small helpers its text is built with (notation explainers,
 * decisions/notation-explainers.md; role P). The entries themselves are content/notation.entries.ts; content/notation.ts
 * puts them together. All of it is LAZY: it loads the first time a card or a key is wanted and is never part of the
 * entry chunk (build/chunks.test.ts rule (o)).
 *
 * One entry per piece of notation the pre-processor can mark (ui/notationMark.ts), read by the card
 * (components/NotationCard.tsx) and the chapter's notation key (components/NotationKey.tsx).
 *
 * An entry says, in plain English:
 *   - what the symbol is called, and how to read it aloud (`name`, `say`);
 *   - what it means, in two voices (`ground`: sentences ≤ 25 words, for Spin Lab and Ground-up; `formal`: ≤ 40, for the
 *     Physics 709 Formal track; a missing `formal` falls back to `ground`) and what it means in physics (`physics`);
 *   - a tiny worked example whose numbers COME FROM THE ENGINE (`example()` computes them; content/notation.test.ts
 *     checks each against its hand value), so a card never shows a number nothing computed;
 *   - `here(ctx, track)`: sentences about THIS use, built from the text the pre-processor captured (the limits of a sum,
 *     the pieces of a bra-ket, the shape of a matrix), rendered as TeX in the card;
 *   - `taught`: the unit that teaches it, in Spin Lab (448) and/or Physics 709, for the "learn it" link with its return
 *     bar. A notation no built chapter teaches yet has none (its card simply has no link).
 * Text is plain prose with `$…$` TeX, paraphrased and in the course's own words (nothing is copied from a source).
 */
import type { NotationCtx } from '../ui/notationCodec'
import type { CourseId, Track } from './courses'

/** A piece of card text: plain words, or TeX (`user`: captured from the page, so rendered with the student-TeX renderer). */
export type Seg = string | { tex: string; user?: true }
export const tx = (tex: string): Seg => ({ tex })
/** Captured TeX from the page (never the dictionary's own). */
export const cx = (tex: string | undefined): Seg => ({ tex: tex ?? '', user: true })

export interface Example {
  /** The worked example as TeX. */
  tex: string
  /** What it shows, in a sentence or two. */
  says: string
  /** The numbers the example is built from, as computed (checked against hand values in the test). */
  values: Readonly<Record<string, number | string>>
}

export interface NotationEntry {
  id: string
  /** The symbol alone, as TeX. */
  tex: string
  /** "Ket", "Sum sign (capital sigma)". */
  name: string
  /** How to read it aloud: "ket psi". */
  say: string
  ground: string
  formal?: string
  /** What it means for the physics, one or two sentences. */
  physics: string
  physicsFormal?: string
  example: () => Example
  here?: (c: Readonly<NotationCtx>, track: Track) => readonly Seg[] | null
  /** The unit (id) that teaches it, per course. */
  taught: { sl448?: string; qc709?: string }
}

/** The entry's plain meaning in a track's voice (448 and Ground-up read `ground`). */
export const meaningOf = (e: NotationEntry, track: Track): string => (track === 'formal' ? (e.formal ?? e.ground) : e.ground)
export const physicsOf = (e: NotationEntry, track: Track): string => (track === 'formal' ? (e.physicsFormal ?? e.physics) : e.physics)

/** The limits of a sum or product: `i=1` and `n` → counter i, from 1, to n. */
export interface Limits {
  v: string
  from?: string
  to?: string
  /** a condition on the counter instead of a range: `z_j=1` for `j:\,z_j=1` */
  cond?: string
  /** the set the counter runs through: `S` for `x\in S` */
  set?: string
}
export function parseLimits(lo?: string, hi?: string): Limits | null {
  if (!lo) return hi ? { v: '', to: hi } : null
  const inSet = /^(.+?)\s*\\in\s+(.+)$/.exec(lo)
  if (inSet) return { v: inSet[1].trim(), set: inSet[2].trim() }
  const colon = /^([^:]+?)\s*:\s*(?:\\[,;!\s])*\s*(.+)$/.exec(lo)
  if (colon) return { v: colon[1].trim(), cond: colon[2].trim() }
  const eq = lo.indexOf('=')
  if (eq > 0 && !/\\le|\\ge|[<>]/.test(lo)) return { v: lo.slice(0, eq).trim(), from: lo.slice(eq + 1).trim(), to: hi }
  if (/\\le|\\ge|[<>]/.test(lo)) return { v: '', cond: lo }
  return { v: lo.trim(), to: hi }
}

/** Where the "learn it" link goes for a reader of `course`: their own course's unit if there is one, else the other's. */
export function taughtUnit(e: NotationEntry, course: CourseId): string | undefined {
  return e.taught[course] ?? e.taught[course === 'sl448' ? 'qc709' : 'sl448']
}
