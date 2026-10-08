/**
 * The two reading tracks (W-709-platform §B): one chapter, one stage, two texts. Ground-up (the plain fields) starts
 * from 9th-grade maths and shows every step; Formal (the `…Formal` / `formal` fields) uses the full notation. These
 * pickers are the ONLY place that chooses between the pairs, so the page, the static reading version, the print notes
 * and the lints all read the same text for a track. A field the track lacks falls back to Ground-up (448 has no Formal
 * track; a 709 chapter must fill every beat and reveal, content.test.tsx).
 * Pure: no React, no DOM.
 */
import type { Track } from './courses'
import type { Beat, DerivStep, Derivation, GlossEntry, ReviewCard, StageState, Unit } from './schema'

export type { Track }
export const TRACKS: readonly Track[] = ['ground', 'formal']
export const isTrack = (x: unknown): x is Track => x === 'ground' || x === 'formal'

/**
 * The beat as the track reads it: `text`, `caption` and the reveal's `text` / `caption` replaced by the track's, the
 * rest (id, stage, terms, claims, derivation) untouched. The same object comes back for Ground-up.
 */
export function pickTrack(beat: Beat, track: Track): Beat {
  if (track === 'ground') return beat
  const reveal = beat.reveal && { ...beat.reveal, text: beat.reveal.formal ?? beat.reveal.text, caption: beat.reveal.captionFormal ?? beat.reveal.caption }
  return { ...beat, text: beat.formal ?? beat.text, caption: beat.captionFormal ?? beat.caption, ...(reveal ? { reveal } : {}) }
}

/**
 * A derivation's lines in the track: the track's own list, else Ground-up's (a one-track course writes only
 * Ground-up; content.test.tsx requires the Formal list in 709), else [] without a derivation.
 */
export const derivSteps = (d: Derivation, track: Track): DerivStep[] => d[track] ?? d.ground
export const derivationSteps = (beat: Beat, track: Track): DerivStep[] => (beat.derivation ? derivSteps(beat.derivation, track) : [])

export const pickInsight = (u: Unit, track: Track): string => (track === 'formal' ? (u.insightFormal ?? u.insight) : u.insight)

/** The review card as the track reads it (the claims stay the card's). */
export function pickReview(card: ReviewCard, track: Track): ReviewCard {
  if (track === 'ground' || !card.formal) return card
  return { ...card, points: card.formal.points, trap: card.formal.trap, equations: card.formal.equations ?? card.equations }
}

export const pickGloss = (g: GlossEntry, track: Track): string => (track === 'formal' ? (g.formal ?? g.gloss) : g.gloss)

const normTex = (s: string) => s.replace(/\s+/g, '').replace(/[{}]/g, '')

/**
 * A derivation list "ends on the result" when its last line's TeX ends with the result's right-hand side (the part
 * after its last `=` or `\equiv`; the whole result when it has neither), ignoring spaces and braces:
 * result `P(0) = \tfrac12` accepts a last line `P(0) = \tfrac{1}{\sqrt2}\cdot\tfrac{1}{\sqrt2} = \tfrac12`.
 */
export function endsOnResult(steps: readonly DerivStep[], result: string): boolean {
  const last = steps.at(-1)
  if (!last) return false
  const rhs = normTex(result.split(/=|\\equiv/).at(-1) ?? result)
  return rhs.length > 0 && normTex(last.tex).endsWith(rhs)
}

/**
 * "Derivations drive the stage" (W-709 #11). The step the reader is on (0-based) inherits the latest earlier step's
 * `view` in the SAME list; null before any step of the list carries one (the beat's own stage applies then).
 */
export function derivViewAt(steps: readonly DerivStep[], i: number): DerivStep | null {
  for (let k = Math.min(i, steps.length - 1); k >= 0; k--) if (steps[k]?.view) return steps[k]
  return null
}

/** One distinct view of a derivation list: the lines it covers (1-based, inclusive), in order of first appearance. */
export interface DerivFigureGroup {
  view: StageState
  /** First line this view covers (1-based). */
  from: number
  /** Last line this view covers (1-based); equals `from` for a single line. */
  to: number
}

/**
 * The derivation's distinct views, each with the (contiguous) line range it governs: a view holds from the step that
 * sets it through every later step that inherits it, until the next step with its own `view`. Lines before any view
 * are not included (the beat's own stage applies there, not a figure of the derivation). Read mode and print draw one
 * `FigureFor` per group (stage/StaticStory.tsx); the content lint requires ≥ 2 groups per track (non-legacy chapters).
 */
export function derivFigureGroups(steps: readonly DerivStep[]): DerivFigureGroup[] {
  const groups: DerivFigureGroup[] = []
  steps.forEach((_, i) => {
    const hit = derivViewAt(steps, i)
    if (!hit?.view) return
    const last = groups.at(-1)
    if (last && last.view === hit.view) last.to = i + 1
    else groups.push({ view: hit.view, from: i + 1, to: i + 1 })
  })
  return groups
}
