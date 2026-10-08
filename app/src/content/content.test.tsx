/**
 * Content gate (W-L1 §6.1; owner W). Runs on every lecture in LECTURES plus the DEV demo story fixture, and on every
 * written 709 chapter plus the DEV demo chapter Q0 in each track of its course (W-709-platform §B: every beat and
 * reveal has Formal text, derivations end on their result in both tracks, Ground-up never has fewer steps, all TeX
 * renders in both tracks).
 * P's lints (symbols, claims.json) and S's (verbatim, security) build on the same walker (content/walk.ts).
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { classMarkText } from '../components/ClassMark'
import { UnitView } from '../components/UnitView'
import { PHASE_LABEL, StaticStory } from '../stage/StaticStory'
import { storyKinds } from '../stage/drive'
import { interpolate } from '../stage/interp'
import { firstNonFinite, resolve, validateLayout, validateStage, validateTransition } from '../stage/resolve'
import type { AnyResolved } from '../stage/types'
import { renderAuthoredTexStrict } from '../ui/tex'
import { TrackContext } from '../ui/trackPref'
import { DEMO_PLATFORM } from './__fixtures__/demoPlatform'
import { DEMO, DEMO_ISLAND } from './__fixtures__/demoStory'
import { COURSES, courseOfId, type Track } from './courses'
import { FIDELITY, FIDELITY_VARIANT, fidelityOf } from './fidelity'
import { GLOSSARY } from './glossary'
import { introducesLabel, lookupGloss } from './glossRegistry'
import { LECTURES } from './index'
import { DEMO_BRIDGES, DEMO_GLOSSARY, Q0 } from './qc709/__fixtures__/demoChapter'
import { QC_CHAPTERS } from './qc709/index'
import { OUTLINE_CHAPTERS } from './qc709/outline'
import './qc709/pack' // registers the 709 glossary, bridges and fidelity notes with their lookups, as a 709 page does
import '../stage/svg/kinds' // registers the SVG stage kinds, as a page whose chapter uses them does (LecturePage)
import { QC_FIDELITY } from './qc709/fidelity'
import { SVG_FIDELITY } from './fidelity.svg'
import { QC_GLOSSARY } from './qc709/pack'
import { registerBridges } from './bridgeRegistry'
import { registerGloss } from './glossRegistry'

// what the DEV demo chapter's page registers when it loads (pages/Chapter709Page.tsx)
registerGloss(DEMO_GLOSSARY)
registerBridges(DEMO_BRIDGES)
import { derivFigureGroups, derivSteps, derivViewAt, derivationSteps, endsOnResult, pickTrack } from './track'
import type { Beat, GlossEntry, Lecture, StageKind, StageLayout, Unit } from './schema'
import {
  ID_RE,
  PASSPORT,
  PASSPORT_VARIANT,
  STAGE_KINDS,
  STAGE_KINDS_448,
  STAGE_KINDS_709,
  beatLayout,
  checkBeatIds,
  layoutStates,
  passportOf,
  stateOfKind,
} from './stage'
import { ANCHORS } from './stageVocab'
import { glossRefs, inlineTokens, readingOrder, splitDisplay, termRefs, texSpans, type InlineToken } from './walk'

/**
 * Chapters awaiting their derivation-view / notation-beat retrofit (W-709 #11/#12): the views-per-derivation and
 * notation-beat lints below skip these. A new chapter is never added here — it must pass both lints as built.
 * F1 and Q1 retrofitted 2026-10-03 (brief-709-fix-F1Q1): removed from the allowlist.
 */
export const DERIV_VIEW_LEGACY: readonly string[] = []
/** Every 709 glossary entry, real chapters and the DEV demo (content/qc709/pack.ts, the demo's own registration). */
const ALL_QC_GLOSS: readonly GlossEntry[] = [...QC_GLOSSARY, ...DEMO_GLOSSARY]

/** 709's written chapters and the DEV demo chapter Q0 (both tracks, a derivation): the two-track checks below. */
const QC: Lecture[] = [...QC_CHAPTERS, Q0]
const ALL: Lecture[] = [...LECTURES, DEMO, DEMO_ISLAND, DEMO_PLATFORM, ...QC]
/** The tracks a chapter is read in (448 and the 448 demos: Ground-up; 709: both). */
const tracksOf = (l: Lecture): readonly Track[] => COURSES[courseOfId(l.id)].tracks
/** Every authored site of a chapter in every track it has (a site shared by both tracks appears twice). */
const allSites = (l: Lecture) => tracksOf(l).flatMap((t) => readingOrder(l, t))

/**
 * Beat phases per chapter kind (interface change W-709 #2): Physics 709's Foundations chapters (F1–F8) have no
 * lecture notes, so their first phase is 'core' ("The foundation") and never 'lecture'; every other chapter (448, the
 * 709 Q chapters) never uses 'core'.
 */
export function phaseProblems(l: Lecture): string[] {
  const foundations = courseOfId(l.id) === 'qc709' && /^F\d+$/.test(l.id)
  return l.units.flatMap((u) =>
    (u.story ?? []).flatMap((b) =>
      foundations && b.phase === 'lecture'
        ? [`${b.id}: 'lecture' in a Foundations chapter (use 'core')`]
        : !foundations && b.phase === 'core'
          ? [`${b.id}: 'core' outside a Foundations chapter`]
          : [],
    ),
  )
}
/**
 * Class markers (interface change W-448 #1; rulings 448-L8L11 P1). `Beat.classMark` says where a class of the notes
 * begins or resumes inside a chapter, so, for the chapters given in course order:
 *   - `class` is a whole number >= 1, and `from`, when present, is a short plain phrase (1-40 characters of letters,
 *     digits, spaces and . , : ; ' - only: it prints on the rule, so no TeX and no markup);
 *   - along one chapter's beats (reading order) the class numbers strictly increase: a class starts once per chapter;
 *   - along the chapters they never decrease: class 9 may be marked in the chapter that ends it and again in the one
 *     that resumes it (the notes' topics straddle a class), but class 9 never comes after class 10.
 */
export const CLASS_FROM_RE = /^[\p{L}\p{N}][\p{L}\p{N} .,:;'\u2019-]{0,39}$/u
export function classMarkProblems(chapters: readonly Lecture[]): string[] {
  const bad: string[] = []
  let before = 0
  for (const l of chapters) {
    let inChapter = 0
    for (const b of l.units.flatMap((u) => u.story ?? [])) {
      const m = b.classMark
      if (!m) continue
      if (m.from !== undefined && !CLASS_FROM_RE.test(m.from)) bad.push(`${b.id}: classMark.from "${m.from}" is not a short plain phrase`)
      if (!Number.isInteger(m.class) || m.class < 1) {
        bad.push(`${b.id}: class ${m.class} is not a whole number >= 1`)
        continue
      }
      if (m.class <= inChapter) bad.push(`${b.id}: class ${m.class} does not follow class ${inChapter} in ${l.id}`)
      if (m.class < before) bad.push(`${b.id}: class ${m.class} comes after class ${before} of an earlier chapter`)
      inChapter = Math.max(inChapter, m.class)
    }
    before = Math.max(before, inChapter)
  }
  return bad
}
/**
 * Go-deeper beats (interface change W-448 #2; rulings 448-L8L11 P2). A `'deeper'` beat is optional material BEYOND the
 * notes: a derivation they skip, a live demonstration of something they only state. THE NOTES' OWN LINE is every beat
 * of any other phase (lecture / core / books / clue), read in order, plus the unit's Try-it, intuition, review card and
 * challenges. The rule that keeps the two apart: a reader who skips every Go-deeper beat must lose nothing the notes'
 * line relies on. Concretely, for each chapter:
 *   (1) order: in a unit, deeper beats come last (after every clue; the phase-order lint) and a unit never begins with
 *       one, so the notes' line is a complete story on its own;
 *   (2) nothing is introduced there: a deeper beat has no `introduces` (new spaces and notation belong to the notes'
 *       line) and no class marker (the class timeline is the notes');
 *   (3) no term depends on one: a glossary entry whose `first` is a deeper beat is used only inside deeper beats of
 *       the chapter (any `[[gloss]]` of it in a text that is not a deeper beat's own, including the review card, the
 *       insight and the challenges, is a problem).
 * (A deeper beat may of course USE anything the notes' line introduced, and may be a click-to-reveal only in the sense
 * the phase-order lint allows: a reveal belongs to 'clue'.)
 */
export function deeperProblems(l: Lecture, glossary: readonly GlossEntry[]): string[] {
  const bad: string[] = []
  const deeper = new Set<string>()
  for (const u of l.units) {
    const story = u.story ?? []
    if (story[0]?.phase === 'deeper') bad.push(`${u.id}: a unit cannot begin with a Go-deeper beat`)
    for (const b of story) {
      if (b.phase !== 'deeper') continue
      deeper.add(b.id)
      if (b.introduces?.length) bad.push(`${b.id}: a Go-deeper beat introduces no space or notation (the notes' line does)`)
      if (b.classMark) bad.push(`${b.id}: a Go-deeper beat cannot carry a class marker`)
    }
  }
  if (!deeper.size) return bad
  const metHere = new Set(glossary.filter((g) => deeper.has(g.first)).map((g) => g.id))
  for (const s of readingOrder(l, 'ground')) {
    if (deeper.has(s.where.split('.')[0])) continue
    for (const id of glossRefs(s.text)) if (metHere.has(id)) bad.push(`${s.where}: uses "${id}", which is first met in a Go-deeper beat`)
  }
  return bad
}
/**
 * Derivation shape, for every chapter, in the tracks ITS course has (interface change W-448 #3; rulings 448-L8L11 P3):
 *   - each track's list is present, non-empty and ends on the result (`endsOnResult`);
 *   - a TWO-track course (709): Ground-up has at least as many steps as Formal, never fewer;
 *   - a ONE-track course (448) has NO `formal` list: it would never be shown, a copy of `ground` would only drift, and
 *     the reading order walks Ground-up alone, so a stray list would also escape every text lint.
 * The 709 lints (both lists, Ground-up >= Formal, the Formal text of every beat) are unchanged.
 */
export function derivationProblems(l: Lecture): string[] {
  const tracks = tracksOf(l)
  const bad: string[] = []
  for (const b of l.units.flatMap((u) => u.story ?? [])) {
    const d = b.derivation
    if (!d) continue
    for (const t of tracks) {
      const steps = d[t]
      if (!steps?.length) bad.push(`${b.id}: no ${t} steps`)
      else if (!endsOnResult(steps, d.result)) bad.push(`${b.id}: the ${t} steps do not end on ${d.result}`)
    }
    if (tracks.length === 1 && d.formal) bad.push(`${b.id}: ${l.id} has one track, so its derivation has no Formal list`)
    if (tracks.length > 1 && d.formal && d.ground.length < d.formal.length) bad.push(`${b.id}: Ground-up has fewer steps than Formal`)
  }
  return bad
}

/**
 * Derivation views (W-709 #11, brief item 7), in every track the chapter's course has: each track's list shows >= 2
 * distinct views, every view validates, and each is of a kind the unit's own stage already shows. A one-track (448)
 * chapter is held to it for its one track. `DERIV_VIEW_LEGACY` chapters are exempt until retrofitted.
 */
export function derivationViewProblems(l: Lecture): string[] {
  if ((DERIV_VIEW_LEGACY as readonly string[]).includes(l.id)) return []
  const bad: string[] = []
  for (const u of l.units) {
    const allowed = new Set(storyKinds(u.story ?? []))
    for (const b of u.story ?? []) {
      if (!b.derivation) continue
      for (const t of tracksOf(l)) {
        const views = derivationSteps(b, t)
          .map((s) => s.view)
          .filter((v): v is NonNullable<typeof v> => !!v)
        if (new Set(views).size < 2) bad.push(`${b.id} ${t}: fewer than 2 distinct views (DERIV_VIEW_LEGACY until retrofitted)`)
        for (const v of views) {
          const errs = validateStage(v)
          if (errs.length) bad.push(`${b.id} ${t}: view ${v.kind}: ${errs.join('; ')}`)
          if (!allowed.has(v.kind)) bad.push(`${b.id} ${t}: view kind "${v.kind}" is not used elsewhere in ${u.id}'s own stage`)
        }
      }
    }
  }
  return bad
}

/**
 * Titles are plain text (P review of 709 F1, item 1): a lecture or unit title prints as it is written in the rail, the
 * Lectures panel, the 709 home card and the return bar, so it may hold no `$` and no TeX (a command, braces, a TeX
 * super- or subscript). Write Unicode instead ("x² = −1", "eⁱᵠ"). Unit questions may keep TeX: UnitView and the fork
 * typeset them.
 */
const TEX_IN_TITLE = /\$|\\[A-Za-z]+|\\[{}]|[\^_]\{|\^\w/
export function titleProblems(l: Pick<Lecture, 'id' | 'title' | 'units'>): string[] {
  const titles: [string, string][] = [[l.id, l.title], ...l.units.map((u): [string, string] => [u.id, u.title])]
  return titles.filter(([, t]) => TEX_IN_TITLE.test(t)).map(([id, t]) => `${id}: title "${t}" is not plain text`)
}

/**
 * NEW LINT (709 F1/Q1 fix, 2026-10-03; ruling `qc709-remap.md` "From the Q2–Q5 reviews"): no TeX command outside
 * `$…$` in learner-visible text, 709 chapters only. A raw `\command` leaking past KaTeX prints as source text on the
 * page (the same class of bug as `titleProblems` above, extended from titles to every rich string). TeX is allowed
 * inside `$…$` / `$$…$$` (checked by the KaTeX-renders lint instead), in `equations` / `tex` fields (display TeX by
 * design, already excluded by `TextSite.tex === 'display'`), and in a derivation step's `tex` (same reason).
 */
const RAW_TEX_RE = /\\[A-Za-z]+/
/**
 * Every plain (non-TeX) run of a rich string a learner reads: prose outside `$…$` / `$$…$$`, recursed into bold,
 * italic, `[[gloss]]` and `{{term}}` shown text (`ui/Rich.tsx` `inline()` re-parses all four for nested `$…$`), plus
 * the shown text of a `<<bridge>>` link (Rich renders it as a plain literal — no nested markup, per `walk.ts`).
 */
function plainTextRuns(text: string): string[] {
  const out: string[] = []
  const walk = (toks: InlineToken[]) => {
    for (const t of toks) {
      if (t.t === 'text') out.push(t.v)
      else if (t.t === 'bold' || t.t === 'italic') walk(inlineTokens(t.v))
      else if (t.t === 'gloss' || t.t === 'term') walk(inlineTokens(t.shown))
      else if (t.t === 'bridge') out.push(t.shown)
    }
  }
  splitDisplay(text).forEach((part, j) => {
    if (j % 2 === 0) walk(inlineTokens(part)) // odd j = a $$…$$ display block, already pure TeX
  })
  return out
}
/** `rawTexProblems` over a list of (where, field, text) sites, e.g. `readingOrder`'s or a glossary entry's fields. */
function rawTexProblems(sites: readonly { where: string; field: string; text: string; tex?: 'display' }[]): string[] {
  const errs: string[] = []
  for (const s of sites) {
    if (s.tex === 'display') continue
    for (const run of plainTextRuns(s.text)) {
      const m = run.match(RAW_TEX_RE)
      if (m) errs.push(`${s.where}.${s.field}: raw TeX "${m[0]}" outside $…$ ("${run.trim().slice(0, 60)}")`)
    }
  }
  return errs
}

const S_STEPS = [0, 0.25, 0.5, 0.75, 1]
const T_STEPS = Array.from({ length: 11 }, (_, i) => i / 10)
const EPS = 1e-9

/** Physics invariants every resolved (or interpolated) state must satisfy. Returns problems. */
function invariants(r: AnyResolved): string[] {
  const errs: string[] = []
  const bad = firstNonFinite(r)
  if (bad) errs.push(`non-finite ${bad}`)
  const inUnit = (p: number, what: string) => {
    if (!(p >= -EPS && p <= 1 + EPS)) errs.push(`${what} = ${p} ∉ [0, 1]`)
  }
  const norm = (v: readonly number[]) => Math.hypot(...v)
  switch (r.kind) {
    case 'lab-r3':
      for (const b of r.benches) {
        const { plus, minus, blocked } = b.theory
        ;[plus, minus, ...blocked].forEach((p, i) => inUnit(p, `bench ${b.id} fate ${i}`))
        const sum = plus + minus + blocked.reduce((a, x) => a + x, 0)
        if (Math.abs(sum - 1) > EPS) errs.push(`bench ${b.id}: plus + minus + Σblocked = ${sum}`)
        b.axes.forEach((a, i) => Math.abs(norm(a) - 1) > EPS && errs.push(`bench ${b.id} axis ${i} not unit`))
      }
      break
    case 'hilbert-plane':
      if (r.probs) {
        r.probs.forEach((p, i) => inUnit(p, `P${i + 1}`))
        if (Math.abs(r.probs[0] + r.probs[1] - 1) > EPS) errs.push('plane probabilities do not sum to 1')
      }
      break
    case 'bloch':
      if (Math.abs(norm(r.r) - 1) > EPS) errs.push(`pure Bloch |r| = ${norm(r.r)}`)
      if (r.pPlus !== null) inUnit(r.pPlus, 'P(+)')
      break
    case 'bloch-ball':
      if (norm(r.r) > 1 + EPS) errs.push(`ball |r| = ${norm(r.r)} > 1`)
      if (r.pPlus !== null) inUnit(r.pPlus, 'P(+)')
      if (r.purity < 0.5 - EPS || r.purity > 1 + EPS) errs.push(`purity ${r.purity}`)
      break
    case 'hopf':
      if (r.marked && Math.abs(norm(r.marked.r) - 1) > EPS) errs.push('hopf base point off S²')
      break
    case 'operator-space':
      if (r.valid && !r.cls.hermitian) errs.push('operator not Hermitian')
      if (r.eig[0] < r.eig[1] - EPS) errs.push('eigenvalues out of order')
      break
    case 'complex-plane': {
      // every drawn size is the modulus of its parts; a sum adds parts; a product multiplies sizes
      const nums = [r.z, r.w, r.sum, r.product, r.conj, r.velocity].filter((n): n is NonNullable<typeof n> => !!n)
      for (const n of nums) if (Math.abs(n.r - Math.hypot(n.re, n.im)) > 1e-9 * Math.max(1, n.r)) errs.push(`|z| ≠ hypot(parts) for ${n.re}, ${n.im}`)
      if (r.sum && r.z && r.w && Math.hypot(r.sum.re - r.z.re - r.w.re, r.sum.im - r.z.im - r.w.im) > 1e-9) errs.push('z + w is not the sum of the parts')
      if (r.product && r.z && r.w && Math.abs(r.product.r - r.z.r * r.w.r) > 1e-9 * Math.max(1, r.product.r)) errs.push('|zw| ≠ |z||w|')
      if (r.extent < 1.25 - EPS) errs.push(`extent ${r.extent} < 1.25`)
      break
    }
    case 'amplitudes': {
      // a state: the chances are in [0, 1] and add to 1; each size is the root of its chance
      r.probs.forEach((p, i) => inUnit(p, `P(bar ${i})`))
      const total = r.probs.reduce((a, p) => a + p, 0)
      if (Math.abs(total - 1) > 1e-9) errs.push(`amplitudes: chances add to ${total}`)
      r.sizes.forEach((x, i) => Math.abs(x * x - r.probs[i]) > 1e-9 && errs.push(`bar ${i}: |a|² ≠ P`))
      if (r.amps.length !== 2 ** r.n) errs.push(`amplitudes: ${r.amps.length} bars for ${r.n} qubits`)
      break
    }
  }
  return errs
}

const units = (l: Lecture) => l.units
const stories = (l: Lecture): [Unit, Beat[]][] => l.units.filter((u) => u.story?.length).map((u) => [u, u.story!])
/** Every picture a beat can show: the question/plain layout and, for clues, the revealed one. */
const pictures = (b: Beat): StageLayout[] => (b.reveal?.stage ? [b.stage, b.reveal.stage] : [b.stage])

describe.each(ALL.map((l) => [l.id, l] as const))('content %s', (_, lecture) => {
  it('ids: units, challenges and beats are unique; beat ids follow `<unit>:b<n>[a-z]?` numbered from 1', () => {
    const unitIds = units(lecture).map((u) => u.id)
    expect(new Set(unitIds).size).toBe(unitIds.length)
    const challengeIds = units(lecture).flatMap((u) => u.play.map((c) => c.id))
    expect(new Set(challengeIds).size).toBe(challengeIds.length)
    const beatIds = units(lecture).flatMap((u) => (u.story ?? []).map((b) => b.id))
    expect(new Set(beatIds).size).toBe(beatIds.length)
    for (const [u, beats] of stories(lecture)) expect(checkBeatIds(u.id, beats.map((b) => b.id))).toEqual([])
    for (const u of units(lecture)) for (const c of u.play) expect(c.hints.length).toBe(3)
  })

  it('titles: the lecture title and every unit title are plain text (no $, no TeX), both courses', () => {
    expect(titleProblems(lecture)).toEqual([])
  })

  it('phases run lecture → books → clue → deeper; clue beats (and only they) carry a reveal (decision #17)', () => {
    const rank = { lecture: 0, core: 0, books: 1, clue: 2, deeper: 3 } as const
    expect(phaseProblems(lecture)).toEqual([])
    for (const [, beats] of stories(lecture)) {
      beats.forEach((b, i) => {
        if (i > 0) expect(rank[b.phase], `${b.id} phase order`).toBeGreaterThanOrEqual(rank[beats[i - 1].phase])
        expect(!!b.reveal, `${b.id}: reveal iff clue`).toBe(b.phase === 'clue')
      })
    }
  })

  it('derivations (W-448 #3): each track the course has ends on the result; a one-track course writes no Formal list', () => {
    expect(derivationProblems(lecture)).toEqual([])
  })

  it('derivation views (W-709 #11): each track shows ≥ 2 distinct views that validate, in kinds the unit already shows', () => {
    expect(derivationViewProblems(lecture)).toEqual([])
  })

  it('Go-deeper beats stay out of the notes’ own line (W-448 #2; deeperProblems)', () => {
    expect(deeperProblems(lecture, courseOfId(lecture.id) === 'qc709' ? ALL_QC_GLOSS : [...GLOSSARY.values()])).toEqual([])
  })

  it('every stage state validates, never repeats a kind in a layout, and round-trips through JSON', () => {
    for (const [, beats] of stories(lecture))
      for (const b of beats)
        for (const l of pictures(b)) {
          expect(validateLayout(l), b.id).toEqual([])
          expect(JSON.parse(JSON.stringify(l)), b.id).toEqual(l)
        }
  })

  it('resolve at s ∈ {0, ¼, ½, ¾, 1} keeps every physics invariant', () => {
    for (const [, beats] of stories(lecture))
      for (const b of beats)
        for (const l of pictures(b))
          for (const st of layoutStates(l))
            for (const s of S_STEPS) expect(invariants(resolve(st, s) as AnyResolved), `${b.id} ${st.kind} s=${s}`).toEqual([])
  })

  it('transitions validate and in-between frames keep the invariants (11 t-steps per consecutive pair)', () => {
    for (const [, beats] of stories(lecture)) {
      const pairs: [string, StageLayout, StageLayout][] = []
      beats.forEach((b, i) => {
        if (b.reveal?.stage) pairs.push([`${b.id} reveal`, b.stage, b.reveal.stage])
        const next = beats[i + 1]
        if (next) for (const from of pictures(b)) pairs.push([`${b.id} → ${next.id}`, from, next.stage])
      })
      for (const [name, A, B] of pairs) {
        for (const kind of STAGE_KINDS) {
          const a = stateOfKind(A, kind)
          const bb = stateOfKind(B, kind)
          if (!a || !bb) continue
          expect(validateTransition(a, bb), name).toEqual([])
          const ra = resolve(a, 1) as AnyResolved
          const rb = resolve(bb, 0) as AnyResolved
          for (const t of T_STEPS) expect(invariants(interpolate(ra, rb, t)), `${name} ${kind} t=${t}`).toEqual([])
        }
      }
    }
  })

  it('terms: every used term is listed, every listed term is used, anchors exist, kinds are on stage', () => {
    for (const [, beats] of stories(lecture))
      for (const b of beats) {
        const kindsQ = new Set(layoutStates(b.stage).map((s) => s.kind))
        const kindsR = new Set(layoutStates(beatLayout(b, true)).map((s) => s.kind))
        // both tracks share one terms list: a term either track (or a derivation line) uses must be listed
        const derivWhys = (['ground', 'formal'] as const).flatMap((t) => derivationSteps(b, t).map((s) => s.why))
        const usedQ = [b.text, b.caption ?? '', b.formal ?? '', b.captionFormal ?? '', ...derivWhys].flatMap(termRefs)
        const usedR = [b.reveal?.text ?? '', b.reveal?.caption ?? '', b.reveal?.formal ?? '', b.reveal?.captionFormal ?? ''].flatMap(termRefs)
        const listedQ = b.terms ?? {}
        const listedR = { ...listedQ, ...(b.reveal?.terms ?? {}) }
        for (const id of usedQ) expect(listedQ[id], `${b.id}: term "${id}" used but not in terms`).toBeDefined()
        for (const id of usedR) expect(listedR[id], `${b.id} reveal: term "${id}" used but not listed`).toBeDefined()
        for (const id of Object.keys(listedQ)) expect(usedQ.includes(id) || usedR.includes(id), `${b.id}: term "${id}" listed but unused`).toBe(true)
        for (const id of Object.keys(b.reveal?.terms ?? {})) expect(usedR.includes(id), `${b.id} reveal: term "${id}" unused`).toBe(true)
        for (const [id, target] of Object.entries(listedQ)) {
          expect(ID_RE.test(id), `${b.id}: term id "${id}"`).toBe(true)
          expect((ANCHORS[target.kind] as readonly string[]).includes(target.anchor), `${b.id}: anchor ${target.kind}:${target.anchor}`).toBe(true)
          expect(kindsQ.has(target.kind) || kindsR.has(target.kind), `${b.id}: term "${id}" targets ${target.kind}, not on stage`).toBe(true)
        }
        for (const [id, target] of Object.entries(b.reveal?.terms ?? {})) {
          expect((ANCHORS[target.kind] as readonly string[]).includes(target.anchor), `${b.id}: anchor ${target.kind}:${target.anchor}`).toBe(true)
          expect(kindsR.has(target.kind), `${b.id} reveal: term "${id}" targets ${target.kind}, not on the revealed stage`).toBe(true)
        }
      }
  })

  it('glosses: every [[id]] in any authored string (either track) exists in GLOSSARY or the 709 pack', () => {
    for (const site of allSites(lecture))
      for (const id of glossRefs(site.text)) expect(lookupGloss(id), `${site.where}.${site.field}: gloss "${id}"`).toBeDefined()
  })

  it('fidelity: flagged items exist for the beat kinds; variants in use are filled in', () => {
    for (const [, beats] of stories(lecture))
      for (const b of beats) {
        const course = courseOfId(lecture.id)
        const keys = pictures(b).flatMap((l) => layoutStates(l).map((s) => passportOf(s, course).fidelityKey))
        for (const key of keys) {
          const f = fidelityOf(key, course)
          for (const list of [f.exact, f.schematic, f.misleading]) expect(list.length, `${b.id}: fidelity "${key}" has an empty list`).toBeGreaterThan(0)
        }
        const ids = new Set(keys.flatMap((k) => Object.values(fidelityOf(k, course)).flatMap((list) => list.map((i: { id: string }) => i.id))))
        for (const id of [...(b.fidelity ?? []), ...(b.reveal?.fidelity ?? [])]) expect(ids.has(id), `${b.id}: fidelity id "${id}"`).toBe(true)
      }
  })

  it('KaTeX: every TeX span of every authored string (both tracks, derivation lines) renders with 0 ParseErrors', () => {
    for (const site of allSites(lecture)) {
      const spans = site.tex === 'display' ? [{ tex: site.text, display: true }] : texSpans(site.text)
      for (const s of spans) expect(() => renderAuthoredTexStrict(s.tex, s.display), `${site.where}.${site.field}: ${s.tex}`).not.toThrow()
    }
  })

  it('assigned homework ships hints only: no walkthrough steps in the bundle, exactly three hints', () => {
    for (const u of units(lecture))
      for (const c of u.play.filter((x) => x.assigned)) {
        expect(c.walkthrough, `${c.id}: an assigned item must not carry a walkthrough`).toEqual([])
        expect(c.hints, c.id).toHaveLength(3)
      }
  })

  it('claims hold and corrections check', () => {
    for (const u of units(lecture)) {
      for (const c of u.claims ?? []) expect(c.holds(), `${u.id}: ${c.text}`).toBe(true)
      for (const c of u.review?.claims ?? []) expect(c.holds(), `${u.id} review: ${c.text}`).toBe(true)
      for (const b of u.story ?? []) for (const c of [...(b.claims ?? []), ...(b.reveal?.claims ?? [])]) expect(c.holds(), `${b.id}: ${c.text}`).toBe(true)
      for (const b of u.story ?? [])
        for (const t of ['ground', 'formal'] as const) for (const s of derivationSteps(b, t)) for (const c of s.claims ?? []) expect(c.holds(), `${b.id} ${t}: ${c.text}`).toBe(true)
    }
    for (const c of lecture.corrections ?? []) expect(c.check(), c.where).toBe(true)
  })

  it('static render: every unit renders through UnitView (SSR ⇒ StaticStory) with no throw and 0 katex-error', () => {
    for (const u of units(lecture)) {
      const html = renderToString(<UnitView unit={u} index="1" />)
      expect(html.length, u.id).toBeGreaterThan(100)
      expect(html.includes('katex-error'), `${u.id}: katex-error`).toBe(false)
      expect(html.includes('tex-user-error'), `${u.id}: tex error`).toBe(false)
      if (!u.story?.length) continue
      // decision #17: story → Try it → intuition (+ pitfalls) → review card → challenges; no separate
      // "lecture says" / "books add" / clues blocks (their content lives in the beats)
      expect(html, u.id).toContain('class="static-story"')
      for (const b of u.story) expect(html, `${u.id}: beat ${b.id}`).toContain(`data-beat="${b.id}"`)
      for (const gone of ['stage-lecture', 'stage-books', 'stage-clues']) expect(html.includes(gone), `${u.id}: ${gone}`).toBe(false)
      const order = ['class="static-story"', 'stage-visual', 'stage-intuition', ...(u.review ? ['review-card'] : []), ...(u.play.length ? ['stage-play'] : [])]
      const at = order.map((m) => html.indexOf(m))
      expect(at.every((x) => x >= 0), `${u.id}: ${order.join(' → ')} all present`).toBe(true)
      expect([...at].sort((a, b) => a - b), `${u.id}: order ${order.join(' → ')}`).toEqual(at)
      // the static version must agree with the live one: StaticStory on its own renders the same beats
      expect(renderToString(<StaticStory unit={u} />)).toContain(`data-beat="${u.story[0].id}"`)
    }
  })

  it('static render in every track of the course: same beats, 0 katex-error, the track’s own text', () => {
    for (const track of tracksOf(lecture))
      for (const u of units(lecture)) {
        const html = renderToString(
          <TrackContext.Provider value={track}>
            <UnitView unit={u} index="1" />
          </TrackContext.Provider>,
        )
        expect(html.includes('katex-error'), `${u.id} ${track}: katex-error`).toBe(false)
        for (const b of u.story ?? []) {
          expect(html, `${u.id} ${track}: beat ${b.id}`).toContain(`data-beat="${b.id}"`)
          if (b.derivation) expect(html, `${b.id} ${track}: derivation`).toContain('class="deriv"')
        }
      }
  })
})

describe.each(QC.map((l) => [l.id, l] as const))('709 two tracks: %s', (_, lecture) => {
  const beats = lecture.units.flatMap((u) => u.story ?? [])
  it('every beat and every reveal has its Formal text', () => {
    expect(beats.filter((b) => !b.formal?.trim()).map((b) => b.id)).toEqual([])
    expect(beats.filter((b) => b.reveal && !b.reveal.formal?.trim()).map((b) => b.id)).toEqual([])
  })
  it('derivations: both lists end on the result, and Ground-up has at least as many steps as Formal', () => {
    for (const b of beats.filter((x) => x.derivation)) {
      const d = b.derivation!
      const formal = d.formal ?? [] // optional in the type since W-448 #3; a two-track course still gives it
      expect(d.ground.length, `${b.id}: Ground-up steps`).toBeGreaterThan(0)
      expect(formal.length, `${b.id}: Formal steps`).toBeGreaterThan(0)
      expect(endsOnResult(d.ground, d.result), `${b.id}: Ground-up ends on ${d.result}`).toBe(true)
      expect(endsOnResult(formal, d.result), `${b.id}: Formal ends on ${d.result}`).toBe(true)
      expect(d.ground.length, `${b.id}: Ground-up has fewer steps than Formal`).toBeGreaterThanOrEqual(formal.length)
    }
  })
  it('review cards: a Formal card has as many points as it needs (≤ 5) and its TeX renders', () => {
    for (const u of lecture.units.filter((x) => x.review?.formal)) {
      const f = u.review!.formal!
      expect(f.points.length, u.id).toBeGreaterThan(0)
      expect(f.points.length, u.id).toBeLessThanOrEqual(5)
    }
  })

  it('NEW LINT: no TeX command outside $…$ in learner-visible text (both tracks, plus this chapter’s glossary)', () => {
    for (const track of ['ground', 'formal'] as const) expect(rawTexProblems(readingOrder(lecture, track))).toEqual([])
    const unitIds = lecture.units.map((u) => u.id)
    const here = ALL_QC_GLOSS.filter((g) => unitIds.includes(g.first.split(':')[0]))
    const glossSites = here.flatMap((g) => [
      { where: g.id, field: 'term', text: g.term },
      { where: g.id, field: 'gloss', text: g.gloss },
      ...(g.formal ? [{ where: g.id, field: 'formal', text: g.formal }] : []),
    ])
    expect(rawTexProblems(glossSites)).toEqual([])
  })

  it('notation beats (W-709 #12): every introduces gloss here is introduced by exactly one beat, at/before first use', () => {
    if ((DERIV_VIEW_LEGACY as readonly string[]).includes(lecture.id)) return
    const unitIds = lecture.units.map((u) => u.id)
    const here = ALL_QC_GLOSS.filter((g) => g.introduces && unitIds.includes(g.first.split(':')[0]))
    for (const g of here) {
      const hits: { unitIdx: number; beatIdx: number; beat: Beat }[] = []
      lecture.units.forEach((u, unitIdx) => (u.story ?? []).forEach((b, beatIdx) => b.introduces?.includes(g.id) && hits.push({ unitIdx, beatIdx, beat: b })))
      expect(hits.length, `${g.id}: introduced by exactly one beat in ${lecture.id}`).toBe(1)
      const { unitIdx, beatIdx, beat } = hits[0]
      expect(beat.caption?.trim(), `${beat.id}: introducing beat needs a Ground-up caption`).toBeTruthy()
      expect(beat.captionFormal?.trim(), `${beat.id}: introducing beat needs a Formal caption`).toBeTruthy()
      const firstUnit = g.first.split(':')[0]
      const firstUnitIdx = unitIds.indexOf(firstUnit)
      const firstBeatIdx = g.first.includes(':') ? (lecture.units[firstUnitIdx]?.story ?? []).findIndex((x) => x.id === g.first) : Infinity
      const ok = unitIdx < firstUnitIdx || (unitIdx === firstUnitIdx && beatIdx <= firstBeatIdx)
      expect(ok, `${g.id}: introducing beat ${beat.id} must be at or before its first use (${g.first})`).toBe(true)
    }
  })
})

describe('class markers (W-448 #1; rulings 448-L8L11 P1)', () => {
  const withMark = (l: Lecture, beatId: string, classMark: Beat['classMark']): Lecture => ({
    ...l,
    units: l.units.map((u) => ({ ...u, story: u.story?.map((b) => (b.id === beatId ? { ...b, classMark } : b)) })),
  })
  const marks = (l: Lecture) => l.units.flatMap((u) => u.story ?? []).filter((b) => b.classMark)

  it('the real lectures and the platform demo pass', () => {
    expect(classMarkProblems(LECTURES)).toEqual([])
    expect(classMarkProblems([DEMO_PLATFORM])).toEqual([])
  })

  it('the checker fails on each kind of mistake', () => {
    const [m2, m3] = marks(DEMO_PLATFORM)
    expect([m2.classMark, m3.classMark]).toEqual([{ class: 2 }, { class: 3, from: 'minute 23' }])
    expect(classMarkProblems([withMark(DEMO_PLATFORM, m2.id, { class: 0 })])).toEqual([`${m2.id}: class 0 is not a whole number >= 1`])
    expect(classMarkProblems([withMark(DEMO_PLATFORM, m2.id, { class: 2.5 })])).toEqual([`${m2.id}: class 2.5 is not a whole number >= 1`])
    for (const from of ['', '$x$', 'minute \\23', '<<id|x>>', '**bold**', 'a'.repeat(41)])
      expect(classMarkProblems([withMark(DEMO_PLATFORM, m2.id, { class: 2, from })]), from).toEqual([`${m2.id}: classMark.from "${from}" is not a short plain phrase`])
    // one chapter: the classes must increase along its beats
    expect(classMarkProblems([withMark(DEMO_PLATFORM, m2.id, { class: 3 })])).toEqual([`${m3.id}: class 3 does not follow class 3 in demo-platform`])
    expect(classMarkProblems([withMark(DEMO_PLATFORM, m3.id, { class: 1 })])).toEqual([`${m3.id}: class 1 does not follow class 2 in demo-platform`])
    // along the course: never backwards, but the same class may close one chapter and resume in the next
    const later = { ...DEMO_PLATFORM, id: 'demo-platform-2' }
    const resumes = withMark(later, m2.id, undefined) // keeps only the class-3 mark
    expect(classMarkProblems([DEMO_PLATFORM, resumes])).toEqual([])
    const backwards = withMark(withMark(later, m3.id, undefined), m2.id, { class: 1 })
    expect(classMarkProblems([DEMO_PLATFORM, backwards])).toEqual([`${m2.id}: class 1 comes after class 3 of an earlier chapter`])
  })

  it('Read mode and print draw the rule above the beat: "Class N starts here", or "from" when the chapter resumes a class', () => {
    const [m2, m3] = marks(DEMO_PLATFORM)
    const html = DEMO_PLATFORM.units.map((u) => renderToString(<StaticStory unit={u} />)).join('')
    expect(html).toContain('<p class="class-mark" data-class-mark="2"><span class="class-mark-text">Class 2 starts here</span></p>')
    expect(html).toContain('<span class="class-mark-text">Class 3 · from minute 23</span>')
    expect((html.match(/class-mark"/g) ?? []).length).toBe(2)
    // the rule sits inside its own beat, before the eyebrow
    for (const b of [m2, m3]) {
      const at = html.indexOf(`data-beat="${b.id}"`)
      expect(html.indexOf('class-mark', at), b.id).toBeGreaterThan(at)
      expect(html.indexOf('class-mark', at), b.id).toBeLessThan(html.indexOf('class="eyebrow"', at))
    }
    expect(classMarkText({ class: 9 })).toBe('Class 9 starts here')
    expect(classMarkText({ class: 9, from: 'minute 23' })).toBe('Class 9 · from minute 23')
  })
})

describe('Go deeper (W-448 #2; rulings 448-L8L11 P2)', () => {
  const unit = DEMO_PLATFORM.units[0]
  const deeperBeat = unit.story!.find((b) => b.phase === 'deeper')!
  const withStory = (story: Beat[]): Lecture => ({ ...DEMO_PLATFORM, units: [{ ...unit, story }, ...DEMO_PLATFORM.units.slice(1)] })
  const gloss = (first: string): GlossEntry[] => [{ id: 'demo-term', term: 'term', gloss: 'A term.', first }]

  it('the platform demo has one Go-deeper beat, after the clue, and passes', () => {
    expect(deeperBeat.id).toBe('demo-platform:b5')
    expect(unit.story!.map((b) => b.phase)).toEqual(['lecture', 'lecture', 'books', 'clue', 'deeper'])
    expect(deeperProblems(DEMO_PLATFORM, [])).toEqual([])
  })

  it('the checker fails on each kind of mistake', () => {
    const story = unit.story!
    // (1) a unit that begins with one
    expect(deeperProblems(withStory([{ ...story[0], phase: 'deeper' }, ...story.slice(1)]), [])).toEqual([`${unit.id}: a unit cannot begin with a Go-deeper beat`])
    // (2) it introduces nothing and starts no class
    const intro = story.map((b) => (b === deeperBeat ? { ...b, introduces: ['demo-term'], classMark: { class: 4 } } : b))
    expect(deeperProblems(withStory(intro), [])).toEqual([
      `${deeperBeat.id}: a Go-deeper beat introduces no space or notation (the notes' line does)`,
      `${deeperBeat.id}: a Go-deeper beat cannot carry a class marker`,
    ])
    // (3) a term first met in a Go-deeper beat is not used by the notes' line, but may be used inside Go-deeper beats
    const useIn = (id: string) => story.map((b) => (b.id === id ? { ...b, text: `${b.text} See [[demo-term]].` } : b))
    expect(deeperProblems(withStory(useIn('demo-platform:b2')), gloss(deeperBeat.id))).toEqual([`demo-platform:b2: uses "demo-term", which is first met in a Go-deeper beat`])
    expect(deeperProblems(withStory(useIn(deeperBeat.id)), gloss(deeperBeat.id))).toEqual([])
    expect(deeperProblems(withStory(useIn('demo-platform:b2')), gloss('demo-platform:b1'))).toEqual([]) // first met in the notes' line
    // the unit-level texts (insight, review card) are the notes' line too
    const insight = { ...DEMO_PLATFORM, units: [{ ...unit, insight: 'The [[demo-term]] again.' }, ...DEMO_PLATFORM.units.slice(1)] }
    expect(deeperProblems(insight, gloss(deeperBeat.id))).toEqual([`${unit.id}: uses "demo-term", which is first met in a Go-deeper beat`])
  })

  it('the phase order puts it last: a clue after a Go-deeper beat is out of order', () => {
    const rank = { lecture: 0, core: 0, books: 1, clue: 2, deeper: 3 } as const
    const inOrder = (ps: readonly (keyof typeof rank)[]) => ps.every((p, i) => i === 0 || rank[p] >= rank[ps[i - 1]])
    expect(inOrder(unit.story!.map((b) => b.phase))).toBe(true)
    expect(inOrder(['lecture', 'books', 'deeper', 'clue'])).toBe(false)
  })

  it('Read mode and print: the beat wears "Go deeper · beyond the notes" in its own frame, without a second "beyond the lecture" badge', () => {
    expect(PHASE_LABEL.deeper).toBe('Go deeper · beyond the notes')
    const html = renderToString(<StaticStory unit={unit} />)
    const at = html.indexOf(`data-beat="${deeperBeat.id}"`)
    expect(html.lastIndexOf('class="static-beat phase-deeper"', at + 1)).toBeGreaterThan(-1)
    expect(html.slice(at)).toContain('Go deeper · beyond the notes')
    const flagged = withStory(unit.story!.map((b) => (b === deeperBeat ? { ...b, beyondLecture: true as const } : b))).units[0]
    expect(renderToString(<StaticStory unit={flagged} />).includes('beyond the lecture')).toBe(false)
    // the other phases keep their words
    expect([PHASE_LABEL.lecture, PHASE_LABEL.books, PHASE_LABEL.clue]).toEqual(['The lecture says', 'The books add', 'Clue'])
    // and a non-deeper beat that is beyond the lecture still wears the badge
    const lecture = withStory(unit.story!.map((b) => (b.id === 'demo-platform:b1' ? { ...b, beyondLecture: true as const } : b))).units[0]
    expect(renderToString(<StaticStory unit={lecture} />)).toContain('beyond the lecture')
  })
})

describe('one-track derivations (W-448 #3; rulings 448-L8L11 P3)', () => {
  const unit = DEMO_PLATFORM.units[0]
  const b3 = unit.story!.find((b) => b.id === 'demo-platform:b3')!
  const withDeriv = (l: Lecture, beatId: string, derivation: Beat['derivation']): Lecture => ({
    ...l,
    units: l.units.map((u) => ({ ...u, story: u.story?.map((b) => (b.id === beatId ? { ...b, derivation } : b)) })),
  })
  const d = b3.derivation!

  it('a 448 derivation is {result, ground}: no Formal list, two distinct views in its one track', () => {
    expect(tracksOf(DEMO_PLATFORM)).toEqual(['ground'])
    expect(d.formal).toBeUndefined()
    expect(derivFigureGroups(d.ground).length).toBeGreaterThanOrEqual(2)
    expect(derivationProblems(DEMO_PLATFORM)).toEqual([])
    expect(derivationViewProblems(DEMO_PLATFORM)).toEqual([])
  })

  it('the checkers fail on each kind of mistake', () => {
    // a one-track course writes no Formal list (a stray copy would never show and would escape the text lints)
    expect(derivationProblems(withDeriv(DEMO_PLATFORM, b3.id, { ...d, formal: d.ground }))).toEqual([`${b3.id}: demo-platform has one track, so its derivation has no Formal list`])
    // the Ground-up list must be there and end on the result
    expect(derivationProblems(withDeriv(DEMO_PLATFORM, b3.id, { ...d, ground: [] }))).toEqual([`${b3.id}: no ground steps`])
    expect(derivationProblems(withDeriv(DEMO_PLATFORM, b3.id, { ...d, result: 'P(+x) = \\tfrac13' }))).toEqual([`${b3.id}: the ground steps do not end on P(+x) = \\tfrac13`])
    // the view lint holds the one track to >= 2 distinct views, each valid and in a kind the unit shows
    const oneView = { ...d, ground: d.ground.map((s, i) => (i === 0 ? s : { ...s, view: undefined })) }
    expect(derivationViewProblems(withDeriv(DEMO_PLATFORM, b3.id, oneView))).toEqual([`${b3.id} ground: fewer than 2 distinct views (DERIV_VIEW_LEGACY until retrofitted)`])
    const foreign = { ...d, ground: d.ground.map((s, i) => (i === 1 ? { ...s, view: { kind: 'hopf', fibers: 'pair', shot: 'HF-PAIR' } as const } : s)) }
    expect(derivationViewProblems(withDeriv(DEMO_PLATFORM, b3.id, foreign))).toEqual([`${b3.id} ground: view kind "hopf" is not used elsewhere in demo-platform's own stage`])
  })

  it('709 is unchanged: both lists required, Ground-up at least as long as Formal', () => {
    const q = Q0.units[0].story!.find((b) => b.derivation)!
    const qd = q.derivation!
    expect(derivationProblems(Q0)).toEqual([])
    expect(derivationProblems(withDeriv(Q0, q.id, { ...qd, formal: undefined }))).toEqual([`${q.id}: no formal steps`])
    expect(derivationProblems(withDeriv(Q0, q.id, { ...qd, ground: qd.ground.slice(-1), formal: qd.ground }))).toEqual([`${q.id}: Ground-up has fewer steps than Formal`])
  })

  it('a track without its own list reads Ground-up’s, like every other field (derivSteps, derivationSteps)', () => {
    expect(derivSteps(d, 'formal')).toBe(d.ground)
    expect(derivationSteps(b3, 'formal')).toBe(d.ground)
    expect(derivationSteps(b3, 'ground')).toBe(d.ground)
    expect(derivationSteps({ ...b3, derivation: undefined }, 'ground')).toEqual([])
    const q = Q0.units[0].story!.find((b) => b.derivation)!
    expect(derivationSteps(q, 'formal')).toBe(q.derivation!.formal) // 709 reads its own Formal list
  })

  it('the reading version draws it, even if the reader’s track were Formal', () => {
    for (const track of ['ground', 'formal'] as const) {
      const html = renderToString(
        <TrackContext.Provider value={track}>
          <StaticStory unit={unit} />
        </TrackContext.Provider>,
      )
      expect(html, track).toContain('class="deriv"')
      expect(html, track).toContain('Write the state as a column of two numbers.')
      expect(html.includes('katex-error'), track).toBe(false)
    }
  })
})

describe('two-track helpers', () => {
  const b3 = Q0.units[0].story![2]
  it('endsOnResult: the last line must end with the result’s right-hand side', () => {
    expect(endsOnResult([{ tex: 'P(0) = \\tfrac{1}{\\sqrt2}\\cdot\\tfrac{1}{\\sqrt2} = \\tfrac12', why: '' }], 'P(0) = \\tfrac12')).toBe(true)
    expect(endsOnResult([{ tex: 'P(0)=\\tfrac12', why: '' }], 'P(0) = \\tfrac12')).toBe(true)
    expect(endsOnResult([{ tex: 'P(0) = \\tfrac12 + 0', why: '' }], 'P(0) = \\tfrac12')).toBe(false)
    expect(endsOnResult([], 'P(0) = \\tfrac12')).toBe(false)
  })
  it('the demo chapter has a derivation whose tracks differ, and a mutation that drops a Ground-up step is caught', () => {
    const d = b3.derivation!
    expect([d.ground.length, d.formal!.length]).toEqual([3, 2])
    const short = { ...d, ground: d.ground.slice(1, 2) }
    expect(short.ground.length >= short.formal!.length && endsOnResult(short.ground, short.result)).toBe(false)
  })
  it('derivFigureGroups: consecutive lines sharing a view are one group; a view-less prefix is not grouped', () => {
    const v1 = { kind: 'bloch', state: '+z' } as const
    const v2 = { kind: 'bloch', state: '-z' } as const
    const steps = [{ tex: 'a', why: '' }, { tex: 'b', why: '', view: v1 }, { tex: 'c', why: '' }, { tex: 'd', why: '', view: v2 }, { tex: 'e', why: '' }]
    expect(derivFigureGroups(steps)).toEqual([
      { view: v1, from: 2, to: 3 },
      { view: v2, from: 4, to: 5 },
    ])
    expect(derivFigureGroups([{ tex: 'a', why: '' }])).toEqual([])
  })
  it('derivViewAt: inherits the latest earlier view; null before any', () => {
    const v1 = { kind: 'bloch', state: '+z' } as const
    const steps = [{ tex: 'a', why: '' }, { tex: 'b', why: '', view: v1 }, { tex: 'c', why: '' }]
    expect(derivViewAt(steps, 0)).toBeNull()
    expect(derivViewAt(steps, 1)?.view).toBe(v1)
    expect(derivViewAt(steps, 2)?.view).toBe(v1)
  })
  it('the demo chapter exercises both new W-709 features: a derivation view and a notation beat', () => {
    const d = b3.derivation!
    expect(derivFigureGroups(d.ground).length, 'ground distinct views').toBeGreaterThanOrEqual(2)
    expect(derivFigureGroups(d.formal!).length, 'formal distinct views').toBeGreaterThanOrEqual(2)
    expect(b3.introduces).toEqual(['qc-demo-amplitude'])
    expect(DEMO_GLOSSARY.find((g) => g.id === 'qc-demo-amplitude')?.introduces).toBe('notation')
    expect(introducesLabel(b3.introduces)).toBe('New notation')
  })
  it('introducesLabel: "space" / "notation" / unmarked or unknown ids name nothing', () => {
    expect(introducesLabel(['qc-demo-amplitude'])).toBe('New notation')
    expect(introducesLabel(['born-rule'])).toBeNull() // a registered gloss entry, but not marked `introduces`
    expect(introducesLabel(['not-a-real-id'])).toBeNull()
    expect(introducesLabel(undefined)).toBeNull()
    expect(introducesLabel([])).toBeNull()
  })
  it('pickTrack swaps the texts and keeps the stage, id and claims; Ground-up returns the same object', () => {
    const f = pickTrack(b3, 'formal')
    expect(f.text).toBe(b3.formal)
    expect(f.caption).toBe(b3.captionFormal)
    expect(f.stage).toBe(b3.stage)
    expect(f.id).toBe(b3.id)
    expect(pickTrack(b3, 'ground')).toBe(b3)
    const b4 = Q0.units[0].story![3]
    expect(pickTrack(b4, 'formal').reveal!.text).toBe(b4.reveal!.formal)
    // a 448 beat has no Formal text: the Formal track falls back to it
    const l1 = LECTURES[0].units[0].story![0]
    expect(pickTrack(l1, 'formal').text).toBe(l1.text)
  })
  it('titleProblems: TeX or $ in a lecture or unit title is caught; Unicode passes; every course is covered', () => {
    const u = Q0.units[0]
    const withTitles = (t: string, ut: string) => ({ ...Q0, title: t, units: [{ ...u, title: ut }] })
    expect(titleProblems(withTitles('Numbers that turn', 'eⁱᵠ: walking round the unit circle'))).toEqual([])
    expect(titleProblems(withTitles('The gap that x² = −1 leaves', 'Phases you can and cannot see'))).toEqual([])
    for (const bad of ['$e^{i\\varphi}$: walking', 'The gap that $x^2 = -1$ leaves', 'e^{i\\varphi} walks', '\\varphi turns', 'x^2 = -1', 'e_{n}'])
      expect(titleProblems(withTitles('Plain', bad)), bad).toEqual([`${u.id}: title "${bad}" is not plain text`])
    expect(titleProblems(withTitles('$e$ grows', 'Plain'))).toEqual([`${Q0.id}: title "$e$ grows" is not plain text`])
    // the per-lecture lint above runs on both courses: 448's lectures and 709's written chapters
    expect(new Set(ALL.map((l) => courseOfId(l.id)))).toEqual(new Set(['sl448', 'qc709']))
    // 709's outline names every chapter, built or planned, on the home page's cards: plain text as well
    expect(OUTLINE_CHAPTERS.filter((c) => TEX_IN_TITLE.test(c.title)).map((c) => c.id)).toEqual([])
  })
  it('phases: core only in Foundations chapters, lecture never there', () => {
    const asF = { ...Q0, id: 'F1' }
    const lectureBeats = Q0.units.flatMap((u) => (u.story ?? []).filter((b) => b.phase === 'lecture').map((b) => b.id))
    expect(lectureBeats.slice(0, 2)).toEqual(['q0-demo-sphere:b1', 'q0-demo-sphere:b2'])
    expect(phaseProblems(asF)).toEqual(lectureBeats.map((id) => `${id}: 'lecture' in a Foundations chapter (use 'core')`))
    const withCore = (l: Lecture): Lecture => ({ ...l, units: l.units.map((u) => ({ ...u, story: u.story?.map((b) => (b.phase === 'lecture' ? { ...b, phase: 'core' as const } : b)) })) })
    expect(phaseProblems(withCore(asF))).toEqual([])
    expect(phaseProblems(withCore(Q0))).toEqual(lectureBeats.map((id) => `${id}: 'core' outside a Foundations chapter`))
    expect(phaseProblems(withCore(LECTURES[0])).length).toBeGreaterThan(0)
    expect(PHASE_LABEL.core).toBe('The foundation')
  })
})

describe('shared content tables', () => {
  it('passports: every kind has one; notes start with the honesty claim; KaTeX in titles/axes renders', () => {
    for (const p of [...Object.values(PASSPORT), ...Object.values(PASSPORT_VARIANT)]) {
      expect(p.note).toMatch(/^(schematic|not a place)/)
      for (const s of [p.title, ...p.axes].flatMap(texSpans)) expect(() => renderAuthoredTexStrict(s.tex)).not.toThrow()
    }
    expect(Object.keys(PASSPORT).sort()).toEqual([...STAGE_KINDS].sort())
  })

  it('fidelity ids are unique, well-formed, every kind has ≥ 1 item per list, and the text typesets', () => {
    // 448's table and variants, the SVG kinds' shared drawers (content/fidelity.svg.ts), and 709's own drawers and
    // additions (content/qc709/fidelity.ts): one id space
    const qc = [...Object.values(SVG_FIDELITY), ...Object.values(QC_FIDELITY.kinds), ...Object.values(QC_FIDELITY.additions)].flatMap((f) => [...(f?.exact ?? []), ...(f?.schematic ?? []), ...(f?.misleading ?? [])])
    const all = [...[...Object.values(FIDELITY), ...Object.values(FIDELITY_VARIANT)].flatMap((f) => [...f.exact, ...f.schematic, ...f.misleading]), ...qc]
    const ids = all.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(ID_RE.test(id), id).toBe(true)
    for (const k of STAGE_KINDS_448) for (const list of Object.values(FIDELITY[k])) expect(list.length, k).toBeGreaterThan(0)
    for (const k of STAGE_KINDS_709) for (const list of Object.values(fidelityOf(k, 'qc709'))) expect(list.length, k).toBeGreaterThan(0)
    // the SVG kinds are shared stage code (W-448 #5): a 448 lecture that draws one finds the SAME drawer, never an empty one
    for (const k of STAGE_KINDS_709) {
      expect(fidelityOf(k), k).toBe(fidelityOf(k, 'qc709'))
      for (const list of Object.values(fidelityOf(k))) expect(list.length, `448 ${k}`).toBeGreaterThan(0)
    }
    expect(Object.keys(SVG_FIDELITY).sort()).toEqual([...STAGE_KINDS_709, 'amplitudes-bell'].sort())
    // 448's own six kinds are exactly its table: 709's additions and variants never show there
    for (const k of STAGE_KINDS_448) expect(fidelityOf(k)).toBe(FIDELITY[k])
    expect(fidelityOf('plane-photon')).toEqual({ exact: [], schematic: [], misleading: [] }) // a 709-only variant
    for (const i of all) for (const s of texSpans(i.text)) expect(() => renderAuthoredTexStrict(s.tex), i.id).not.toThrow()
  })

  it('glossary: ids well-formed and keyed, `uses` closed, `first` names a unit or beat, TeX renders', () => {
    const known = new Set([...LECTURES, DEMO].flatMap((l) => l.units.flatMap((u) => [u.id, ...(u.story ?? []).map((b) => b.id)])))
    // `first` may name a beat that P has not written yet (L1 has no story until P lands): unit ids must exist
    for (const [key, g] of GLOSSARY) {
      expect(key).toBe(g.id)
      expect(ID_RE.test(g.id), g.id).toBe(true)
      for (const u of g.uses ?? []) expect(GLOSSARY.has(u), `${g.id} uses ${u}`).toBe(true)
      const unit = g.first.split(':')[0]
      expect(known.has(unit), `${g.id}: first "${g.first}"`).toBe(true)
      for (const s of [...texSpans(g.term), ...texSpans(g.gloss)]) expect(() => renderAuthoredTexStrict(s.tex), g.id).not.toThrow()
    }
  })

  it('the demo story covers every W0 seam: split layout, sweep, clue with reveal picture, prose + TeX terms, gloss', () => {
    const beats = DEMO.units[0].story!
    expect(beats.some((b) => 'layout' in b.stage && b.stage.layout === 'split')).toBe(true)
    expect(beats.some((b) => b.reveal?.stage)).toBe(true)
    expect(beats.flatMap((b) => [b.text, b.reveal?.text ?? '']).some((t) => t.includes('\\htmlClass{term-'))).toBe(true)
    expect(beats.flatMap((b) => [b.text]).some((t) => t.includes('{{'))).toBe(true)
    expect(beats.some((b) => glossRefs(b.text).length > 0)).toBe(true)
    const kinds = new Set<StageKind>(beats.flatMap((b) => pictures(b).flatMap((l) => layoutStates(l).map((s) => s.kind))))
    expect([...kinds].sort()).toEqual(['hilbert-plane', 'lab-r3'])
  })
})
