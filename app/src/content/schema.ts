/**
 * The learning-unit schema. Every lecture file must export a `Lecture` built from these types,
 * and the reusable course skill emits exactly this shape.
 *
 * Text fields are "rich strings": `$…$` inline TeX, `$$…$$` display TeX, `**bold**`, `*italic*`,
 * blank line = new paragraph. Keep prose paraphrased — never paste source text.
 *
 * The process every unit follows (the user's requested flow):
 *   lecture  → what the lecture claims (the basis), with page refs
 *   books    → what each book adds, with § / page refs
 *   visual   → an interactive widget plus guided things to try
 *   clues    → Socratic questions that lead to the intuition, each with a reveal
 *   play     → tiered challenges, each with a hint ladder and a full walkthrough
 */

import type { Beat, BeyondLecture, ReviewCard } from './stage'

// Stage contracts (story beats, stage states, passports, fidelity, review, glossary) live in ./stage.
export * from './stage'

export type SourceId =
  | 'lecture' // this course's notes; `where` = "L3 p.11"
  | 'susskind'
  | 'axler'
  | 'bergou'
  | 'sets'
  | 'reif'
  | 'mit805' // public video lectures
  | '3b1b'
  | 'tm-video'
  | 'townsend' // Townsend, A Modern Approach to Quantum Mechanics (2e); printed page = PDF page − 16

export interface Ref {
  source: SourceId
  /** Section / page / timestamp, e.g. "§3.1, pp. 36–40" or "Lecture 4, 12:30". */
  where: string
  /** What this source adds that the lecture does not — one or two sentences. */
  adds: string
  url?: string
}

/** A widget is referenced by kind + serializable props so content never imports React. */
export interface WidgetSpec {
  kind: WidgetKind
  props?: Record<string, unknown>
  caption?: string
}

export type WidgetKind =
  | 'sg-lab' // Stern–Gerlach bench: chain devices, fire atoms, deposit on plates
  | 'complex-plane' // multiply/rotate complex numbers, polar ↔ cartesian
  | 'real-vs-complex' // try to build |+y⟩ with a real c, then a complex c
  | 'amplitude-bars' // amplitudes as phasors + |c|² probabilities in any basis
  | 'projector' // project a state onto a measurement basis; shadow length² = probability
  | 'operator-action' // apply a 2×2 matrix to a unit circle of real vectors; eigen-directions stand still
  | 'operator-builder' // assemble A = Σ a_i |a_i⟩⟨a_i| from eigenstates and values
  | 'basis-translator' // same state, two coordinate grids; B_{z←x}, B_{x←z}
  | 'bloch' // Bloch sphere with state, axes, measurement axis, rotations
  | 'phase-dial' // relative phase ↔ azimuth on the equator
  | 'deposit-stats' // finite-sample counts vs Born prediction, ±σ band
  | 'logic-order' // "up OR right" depends on measurement order

export interface Clue {
  /** A question that nudges the learner toward the insight. */
  ask: string
  /** Revealed on request: the step of reasoning, never just "the answer is X". */
  reveal: string
  /** Optional widget state that makes the reveal visible. */
  show?: WidgetSpec
}

export interface Hint {
  /** nudge → key idea → setup. Exactly three rungs, each more specific. */
  text: string
}

export interface WalkStep {
  text: string
  show?: WidgetSpec
}

interface ChallengeBase {
  id: string
  tier: 'warm-up' | 'core' | 'stretch'
  title: string
  prompt: string
  hints: [Hint, Hint, Hint]
  walkthrough: WalkStep[]
  /** Optional widget shown beside the prompt. */
  widget?: WidgetSpec
  refs?: Ref[]
  /**
   * Set when the course assigns this as homework (e.g. "L2 p.7"). The app then shows hints only
   * and withholds the walkthrough, so a shared app doesn't hand classmates graded work.
   */
  assigned?: string
}

export interface ChoiceChallenge extends ChallengeBase {
  kind: 'choice'
  options: { text: string; correct: boolean; why: string }[]
}

export interface NumericChallenge extends ChallengeBase {
  kind: 'numeric'
  /** Computed with the physics engine inside the content file, so prose and answer can't drift. */
  answer: number
  tolerance: number
  /** Shown after the input, e.g. "ħ" or "probability". */
  unit?: string
}

export interface OrderChallenge extends ChallengeBase {
  kind: 'order'
  /** Steps in the correct order; the UI shuffles them deterministically. */
  steps: string[]
}

export type Challenge = ChoiceChallenge | NumericChallenge | OrderChallenge

/**
 * A quantitative sentence from the prose, paired with a check the test-suite runs.
 * Any number a learner reads in a unit should appear in a claim.
 */
export interface Claim {
  text: string
  holds: () => boolean
}

export interface Unit {
  id: string
  title: string
  /** One sentence: the question this unit answers. */
  question: string
  lecture: { summary: string; pages: string; equations?: string[] }
  books: Ref[]
  visual: WidgetSpec & { tryThis: string[] }
  clues: Clue[]
  /** The one-sentence takeaway, written after the clues land. */
  insight: string
  play: Challenge[]
  claims?: Claim[]
  /** Common confusions called out in the notes — become trap options and walkthrough warnings. */
  pitfalls?: string[]
  /**
   * Scroll story (W-L1 §1.3). With a story the unit reads: story beats (lecture → books → clue, clues are
   * click-to-reveal inside the story) → Try it (`visual`) → intuition (`insight`) → pitfalls → review →
   * challenges (decision #17). The separate "lecture says", "books add" and clues blocks are not shown.
   * Units without a story are unchanged.
   */
  story?: Beat[]
  /** Exam layer: the unit's review card. */
  review?: ReviewCard
  /** Set when the whole unit goes beyond the lecture (badge, decision L1 #6). */
  beyondLecture?: BeyondLecture
}

export interface Correction {
  where: string
  says: string
  shouldSay: string
  check: () => boolean
}

export interface Lecture {
  id: string // "L1"
  number: number
  title: string
  date?: string
  /** What you can do after this lecture, in the learner's words. */
  outcomes: string[]
  /** Concept ids this lecture assumes (for the concept map). */
  prerequisites: string[]
  units: Unit[]
  /** Errors found in the source notes by the audit, shown respectfully in an "Errata" box. */
  corrections?: Correction[]
  watch?: Ref[]
  /** TeX symbol → where it is defined (unit or beat id): seeds the symbol-before-use lint (P). */
  symbols?: Record<string, string>
}

/** Arcade games: level data here, win logic in the game component. */
export interface GameSpec {
  id: string
  title: string
  lecture: string
  blurb: string
  kind: 'sg-puzzle' | 'bloch-golf' | 'spot-the-error' | 'basis-sprint'
  levels: Record<string, unknown>[]
}
