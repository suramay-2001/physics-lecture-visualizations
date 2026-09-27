/**
 * The two reading tracks (W-709-platform §B): one chapter, one stage, two texts. Ground-up (the plain fields) starts
 * from 9th-grade maths and shows every step; Formal (the `…Formal` / `formal` fields) uses the full notation. These
 * pickers are the ONLY place that chooses between the pairs, so the page, the static reading version, the print notes
 * and the lints all read the same text for a track. A field the track lacks falls back to Ground-up (448 has no Formal
 * track; a 709 chapter must fill every beat and reveal, content.test.tsx).
 * Pure: no React, no DOM.
 */
import type { Track } from './courses'
import type { Beat, DerivStep, GlossEntry, ReviewCard, Unit } from './schema'

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

/** A derivation's lines in the track ([] without a derivation). */
export const derivationSteps = (beat: Beat, track: Track): DerivStep[] => beat.derivation?.[track] ?? []

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
