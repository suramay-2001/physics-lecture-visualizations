/**
 * The paper spec (docs/specs/papers-platform.md §2; rulings papers.md R1–R5): a paper lecture (or a background chapter of
 * the Papers section) as DATA. The offline pipeline writes one today and a later smart tool writes the same thing: one
 * object literal per file (`content/papers/P1.paper.ts`: `export const P1: PaperSpec = <JSON>`), no functions, no computed
 * values. papers/validate.ts checks it, papers/compile.ts turns it into an ordinary `Lecture`.
 *
 * It is the data subset of the two-track content model (content/schema.ts, content/stage.ts) with three changes:
 *   1. wherever a stage state may appear, a `RecipeRef` may stand instead (papers/recipes.ts, an allow-listed registry);
 *   2. claims are data: a computed claim names a recipe's output, a numeric challenge's answer likewise;
 *   3. beats carry the reference trail (`trail`) and the paper's own numbers (`reported`), never mixed with claims.
 * Types only: no runtime code, so a spec file imports nothing but types.
 */
import type { CourseId } from '../content/courses'
import type { BeatPhase, GlossEntry, Hint, ReportedClaim, StageState, TermId, TermTarget, TrailEntry, WidgetSpec } from '../content/schema'
import type { RecipeRef } from './recipes'

export type { RecipeRef }
export type { GlossEntry }

export const PAPER_SPEC_VERSION = 1

/** Where an idea is taught: a written unit of a course, or (no `unit`) a chapter that is planned but not written yet. */
export interface TeachRef {
  course: CourseId
  /** 'L2' (448) · 'Q6' (709) · 'B1' / 'P1' (Papers) */
  chapter: string
  /** A unit of that chapter; absent while the chapter is planned (drawn "in preparation"). */
  unit?: string
}

/** Who wrote the paper and where to find it (kind 'paper' only). */
export interface PaperMeta {
  /** The short title the section uses ('Tour de gross'); a full title of 12+ words trips the verbatim guard (R7). */
  shortTitle: string
  /** Family names, in the paper's order. */
  authors: string[]
  /** arXiv identifier and version: '2506.03094', 1 → arXiv:2506.03094v1. */
  arxiv: { id: string; version: number }
  /** The version's date, 'YYYY-MM'. */
  date: string
  institution?: string
  /** The ingest source id (pipeline/course.papers.json): 'paper-tdg'. Every reported claim of a paper cites it. */
  source: string
  /** The licence note shown under the paper card. */
  licence: string
}

/** A reference the lecture used (R5: "References used"). */
export interface ReferenceSpec {
  /** Paper-local id, /^[a-z0-9-]+$/; the References page anchors it as `ref-<id>`. */
  id: string
  /** Short: 'Bravyi et al. 2024' (author and year; never a 12+ word title). */
  label: string
  arxiv?: { id: string; version?: number }
  doi?: string
  /** 1: the paper cites it · 2: a depth-1 reference cites it (`via` names which). */
  depth: 1 | 2
  via?: string
  /** read: the part relied on was read (online, R6) · cited: only cited so far. */
  status: 'read' | 'cited'
  /** The section / page relied on (read references only): '§3, pp. 4–6'. */
  reliedOn?: string
  /** One sentence: what the paper needs from it. */
  why: string
  /** Where its idea is taught (448, 709, a background chapter or this lecture). */
  taughtIn?: TeachRef
}

/** One node of the prerequisite graph (R2): an idea, the one unit that teaches it, and what it builds on. */
export interface PrereqNode {
  /** Paper-local id, /^[a-z0-9-]+$/. */
  id: string
  label: string
  teach: TeachRef
  /** Ids of the nodes it builds on (the graph is acyclic). */
  needs: string[]
  /** The reference the idea comes from, if any. */
  ref?: string
}

/** A stage slot: a hand-written stage state (the kind's own validator checks it) or a recipe reference. */
export type StageSpecState = StageState | RecipeRef
export type StageSpec =
  | StageSpecState
  | { layout: 'split'; top: StageSpecState; bottom: StageSpecState }
  | { layout: 'inset'; main: StageSpecState; inset: StageSpecState }

/**
 * A computed claim (R3 "computed"): the number comes from the engine through a recipe's named output; its key has a numpy
 * twin (pipeline/claims_papers/<id>.py). The text is what the number says, in words.
 */
export interface ClaimSpec {
  /** `<chapter lower-case><Name>`: 'p1BellAmp'. Unique across every course. */
  key: string
  text: string
  from: RecipeRef
  /** The recipe output the claim cites ('a00'). */
  value: string
}

export interface DerivStepSpec {
  tex: string
  why: string
  claims?: ClaimSpec[]
  view?: StageSpecState
  viewCaption?: string
}
/** Both tracks are required (R1: a paper lecture is two-track). */
export interface DerivationSpec {
  result: string
  ground: DerivStepSpec[]
  formal: DerivStepSpec[]
}

export interface RevealSpec {
  text: string
  formal: string
  caption?: string
  captionFormal?: string
  stage?: StageSpec
  terms?: Record<TermId, TermTarget>
  fidelity?: string[]
  claims?: ClaimSpec[]
}

export interface BeatSpec {
  /** `<unit>:b<k>`, in order. */
  id: string
  phase: BeatPhase
  /** Ground-up text (sentences ≤ 25 words). */
  text: string
  /** Formal text (sentences ≤ 40 words). */
  formal: string
  caption?: string
  captionFormal?: string
  derivation?: DerivationSpec
  stage: StageSpec
  reveal?: RevealSpec
  terms?: Record<TermId, TermTarget>
  fidelity?: string[]
  claims?: ClaimSpec[]
  introduces?: string[]
  /** The references this step relies on (R5). */
  trail?: TrailEntry[]
  /** The paper's own numbers this step shows (R3 "reported"). */
  reported?: ReportedClaim[]
}

export interface ReviewSpec {
  points: string[]
  equations: string
  trap: string
  claims?: ClaimSpec[]
  formal: { points: string[]; equations?: string; trap: string }
}

interface ChallengeSpecBase {
  /** `<chapter lower-case>-…` */
  id: string
  tier: 'warm-up' | 'core' | 'stretch'
  title: string
  prompt: string
  hints: [Hint, Hint, Hint]
  walkthrough: { text: string; show?: WidgetSpec }[]
  widget?: WidgetSpec
}
export type ChallengeSpec =
  | (ChallengeSpecBase & { kind: 'choice'; options: { text: string; correct: boolean; why: string }[] })
  | (ChallengeSpecBase & { kind: 'order'; steps: string[] })
  | (ChallengeSpecBase & { kind: 'numeric'; answerFrom: { from: RecipeRef; value: string }; tolerance: number; unit?: string })

export interface UnitSpec {
  /** `<chapter lower-case>-<slug>`: 'p1-why-codes'. */
  id: string
  title: string
  /** One sentence: the question this unit answers. */
  question: string
  /** What the paper (or, in a background chapter, its main reference) says here, and where: '§2.1, p. 9'. */
  source: { summary: string; where: string; equations?: string[] }
  /** The Try-it: a widget kind and its data props, with guided things to try. */
  tryIt: WidgetSpec & { tryThis: string[] }
  insight: string
  insightFormal: string
  story: BeatSpec[]
  review?: ReviewSpec
  play?: ChallengeSpec[]
  claims?: ClaimSpec[]
  pitfalls?: string[]
}

export interface PaperSpec {
  specVersion: typeof PAPER_SPEC_VERSION
  /** 'P1' (a paper lecture) or 'B1' (a background chapter, R2). */
  id: string
  kind: 'paper' | 'background'
  /** The lecture's title (a paraphrase, never the paper's full title). */
  title: string
  /** Required for kind 'paper'. */
  paper?: PaperMeta
  outcomes: string[]
  references: ReferenceSpec[]
  prerequisites: PrereqNode[]
  /** TeX symbol → where it is defined (unit or beat id), as `Lecture.symbols`. */
  symbols?: Record<string, string>
  symbolsFormal?: Record<string, string>
  units: UnitSpec[]
}
