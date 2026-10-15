/**
 * Paper spec → `Lecture` (docs/specs/papers-platform.md §1). A VALID spec (papers/validate.ts) compiles into an ordinary
 * two-track chapter, so the shared lecture page, the story stage, Read mode, print, the notation key and every content lint
 * treat it like any other: each recipe reference becomes the stage state its recipe returns, each computed claim a keyed
 * `Claim` (`key · text`) whose engine value joins the claim ledger, each numeric answer the recipe output it names, and
 * each trail entry carries its reference's short label. Pure and deterministic; lazy (rule (q)).
 */
import type { Challenge, Claim, Correction, Lecture, StageLayout, StageState, Unit } from '../content/schema'
import type { Beat, BeatReveal, DerivStep } from '../content/stage'
import { CORRECTION_CHECKS } from './corrections'
import { isRecipeRef, runRecipe, type RecipeOutput } from './recipes'
import type { BeatSpec, ChallengeSpec, ClaimSpec, DerivStepSpec, PaperSpec, StageSpec, StageSpecState, UnitSpec } from './spec'
import { checkedPaperSpec, PaperSpecError, type PaperContext } from './validate'

export interface CompiledPaper {
  spec: PaperSpec
  lecture: Lecture
  /** Every computed claim's engine value, by key (the claim ledger checks each against its numpy twin). */
  values: Readonly<Record<string, number>>
}

const cache = new WeakMap<object, CompiledPaper>()

/** Validate, then compile (once per spec object). Throws a PaperSpecError listing every problem of an invalid spec. */
export function compilePaper(x: unknown, ctx?: PaperContext): CompiledPaper {
  if (typeof x === 'object' && x !== null) {
    const hit = cache.get(x)
    if (hit) return hit
  }
  const spec = checkedPaperSpec(x, ctx)
  const runs = new Map<string, RecipeOutput>()
  const run = (ref: unknown, where: string): RecipeOutput => {
    const k = JSON.stringify(ref)
    let out = runs.get(k)
    if (!out) {
      const r = runRecipe(ref, `${spec.id} ${where}`)
      if (!r.ok) throw new PaperSpecError(r.problems) // unreachable for a validated spec; kept so a compile never draws a guess
      out = { stage: r.stage, values: r.values }
      runs.set(k, out)
    }
    return out
  }
  const values: Record<string, number> = {}

  const state = (s: StageSpecState, where: string): StageState => {
    if (!isRecipeRef(s)) return s as StageState
    const out = run(s, where).stage
    if ('layout' in out) throw new PaperSpecError([`${spec.id} ${where}: this slot holds one stage state, but the recipe returns a ${out.layout} layout`])
    return out
  }
  const layout = (s: StageSpec, where: string): StageLayout => {
    if ('layout' in s && s.layout === 'split') return { layout: 'split', top: state(s.top, `${where}.top`), bottom: state(s.bottom, `${where}.bottom`) }
    if ('layout' in s && s.layout === 'inset') return { layout: 'inset', main: state(s.main, `${where}.main`), inset: state(s.inset, `${where}.inset`) }
    // a recipe at the top of a beat's stage may return a whole layout (circuit-gates show 'both')
    return isRecipeRef(s) ? run(s, where).stage : (s as StageState)
  }
  const claim = (c: ClaimSpec, where: string): Claim => {
    const value = run(c.from, `${where}.from`).values[c.value]
    values[c.key] = value
    return { text: `${c.key} · ${c.text}`, holds: () => Number.isFinite(value) }
  }
  const claims = (list: readonly ClaimSpec[] | undefined, where: string): Claim[] | undefined => list?.map((c, i) => claim(c, `${where}[${i}]`))
  const labels = new Map(spec.references.map((r) => [r.id, r.label]))

  const step = (s: DerivStepSpec, where: string): DerivStep => ({
    tex: s.tex,
    why: s.why,
    ...(s.claims ? { claims: claims(s.claims, `${where}.claims`) } : {}),
    ...(s.view ? { view: state(s.view, `${where}.view`) } : {}),
    ...(s.viewCaption ? { viewCaption: s.viewCaption } : {}),
  })
  const beat = (b: BeatSpec): Beat => {
    const out: Beat = { id: b.id, phase: b.phase, text: b.text, formal: b.formal, stage: layout(b.stage, `${b.id}.stage`) }
    if (b.caption !== undefined) out.caption = b.caption
    if (b.captionFormal !== undefined) out.captionFormal = b.captionFormal
    if (b.derivation)
      out.derivation = {
        result: b.derivation.result,
        ground: b.derivation.ground.map((s, i) => step(s, `${b.id}.derivation.ground[${i}]`)),
        formal: b.derivation.formal.map((s, i) => step(s, `${b.id}.derivation.formal[${i}]`)),
      }
    if (b.reveal) {
      const r = b.reveal
      const rev: BeatReveal = { text: r.text, formal: r.formal }
      if (r.caption !== undefined) rev.caption = r.caption
      if (r.captionFormal !== undefined) rev.captionFormal = r.captionFormal
      if (r.stage) rev.stage = layout(r.stage, `${b.id}.reveal.stage`)
      if (r.terms) rev.terms = r.terms
      if (r.fidelity) rev.fidelity = r.fidelity
      if (r.claims) rev.claims = claims(r.claims, `${b.id}.reveal.claims`)
      out.reveal = rev
    }
    if (b.terms) out.terms = b.terms
    if (b.fidelity) out.fidelity = b.fidelity
    if (b.claims) out.claims = claims(b.claims, `${b.id}.claims`)
    if (b.introduces) out.introduces = b.introduces
    if (b.trail) out.trail = b.trail.map((t) => ({ ...t, label: labels.get(t.ref) }))
    if (b.reported) out.reported = b.reported.map((r) => (labels.has(r.source) ? { ...r, sourceLabel: labels.get(r.source) } : r))
    return out
  }
  const challenge = (c: ChallengeSpec): Challenge => {
    if (c.kind === 'numeric') {
      const { answerFrom, ...rest } = c
      return { ...rest, answer: run(answerFrom.from, `${c.id}.answerFrom`).values[answerFrom.value] }
    }
    return c
  }
  const unit = (u: UnitSpec): Unit => {
    const { tryThis, ...widget } = u.tryIt
    const out: Unit = {
      id: u.id,
      title: u.title,
      question: u.question,
      lecture: { summary: u.source.summary, pages: u.source.where, ...(u.source.equations ? { equations: u.source.equations } : {}) },
      books: [],
      visual: { ...widget, tryThis },
      clues: [],
      insight: u.insight,
      insightFormal: u.insightFormal,
      play: (u.play ?? []).map(challenge),
      story: u.story.map(beat),
    }
    if (u.claims) out.claims = claims(u.claims, `${u.id}.claims`)
    if (u.pitfalls) out.pitfalls = u.pitfalls
    if (u.review) out.review = { ...u.review, claims: claims(u.review.claims, `${u.id}.review.claims`) }
    return out
  }

  // corrections as data: the check is found by the claim key in papers/corrections.ts and given the engine values and the printed number
  const corrections: Correction[] = (spec.corrections ?? []).map((c) => ({
    where: `${c.location.label ? `${c.location.kind === 'table' ? 'Table' : c.location.kind === 'figure' ? 'Fig.' : c.location.kind === 'equation' ? 'Eq.' : 'Section'} ${c.location.label}` : 'The text'}, p. ${c.location.page}`,
    says: c.says,
    shouldSay: c.shouldSay,
    source: 'paper',
    check: () => CORRECTION_CHECKS[c.claim]?.(values, c.printed) === true,
  }))
  const lecture: Lecture = {
    id: spec.id,
    number: Number(spec.id.slice(1)),
    title: spec.title,
    outcomes: spec.outcomes,
    prerequisites: [],
    units: spec.units.map(unit),
    ...(corrections.length ? { corrections } : {}),
    ...(spec.symbols ? { symbols: spec.symbols } : {}),
    ...(spec.symbolsFormal ? { symbolsFormal: spec.symbolsFormal } : {}),
  }
  const compiled: CompiledPaper = { spec, lecture, values }
  cache.set(spec, compiled)
  return compiled
}

/** The chapter id of a paper-spec module path ('./P1.paper.ts' → 'P1'), or ''. */
export const paperIdOfFile = (file: string): string => /\/([PB][1-9]\d*)\.paper\.ts$/.exec(file)?.[1] ?? ''
