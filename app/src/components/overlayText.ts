/**
 * Pure helpers of the stage overlay (components/StageOverlay.tsx), kept out of the component module so fast
 * refresh stays component-only. THREE-free.
 */
import { fidelityOf } from '../content/fidelity'
import type { FidelityKey } from '../content/stage'
import { isOutcomeText } from '../stage/readoutGuard'
import type { StageLabel } from '../stage/store'

/** Symbols that make a word a math token (ℂ², ℝ³, S³, a₀ …); U+20D7 is the vector arrow of a⃗. */
const MATH_CHAR = /[ℂℝℤℕℚ⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉σ]/
const isMathWord = (w: string) => MATH_CHAR.test(w) || w.includes('\u20d7')

/**
 * Keep math tokens with their words in passport text (Round 3 #9): the space before a word carrying a math
 * symbol becomes a no-break space, and a formula segment ("A = a₀I + a⃗·σ⃗") never breaks inside. Segments are
 * separated by " · ", which may still wrap.
 */
export function keepMathTogether(text: string): string {
  return text
    .split(' · ')
    .map((seg) => (seg.includes('=') ? seg.replace(/ /g, '\u00a0') : seg.replace(/ (\S+)/g, (m, word: string) => (isMathWord(word) ? '\u00a0' + word : m))))
    .join(' · ')
}

/**
 * The anchored labels a view shows: one slot per passport axis, overridden or extended by what the scene
 * published (readouts excluded). A view that claims no outcomes (Round 3 #5) drops every quantum-outcome label.
 */
export function anchoredLabels(axes: readonly string[], published: Readonly<Record<string, StageLabel>>, outcomes = true): [string, StageLabel][] {
  const all: [string, StageLabel][] = axes.map((text, i) => [`axis-${i}`, { text, tier: 'axis' }])
  for (const [name, l] of Object.entries(published)) {
    if (l.tier === 'readout') continue
    const at = all.findIndex(([n]) => n === name)
    if (at >= 0) all[at] = [name, l]
    else all.push([name, l])
  }
  return outcomes ? all : all.filter(([, l]) => !isOutcomeText(l.text))
}

/** Does the beat flag one of this passport's fidelity items ("relevant now", D §2.4 dot)? */
export function passportRelevant(key: FidelityKey, highlight: readonly string[]): boolean {
  if (!highlight.length) return false
  const f = fidelityOf(key)
  return [...f.exact, ...f.schematic, ...f.misleading].some((i) => highlight.includes(i.id))
}
