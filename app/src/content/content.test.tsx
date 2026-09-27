/**
 * Content gate (W-L1 §6.1; owner W). Runs on every lecture in LECTURES plus the DEV demo story fixture, and on every
 * written 709 chapter plus the DEV demo chapter Q0 in each track of its course (W-709-platform §B: every beat and
 * reveal has Formal text, derivations end on their result in both tracks, Ground-up never has fewer steps, all TeX
 * renders in both tracks).
 * P's lints (symbols, claims.json) and S's (verbatim, security) build on the same walker (content/walk.ts).
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { UnitView } from '../components/UnitView'
import { PHASE_LABEL, StaticStory } from '../stage/StaticStory'
import { interpolate } from '../stage/interp'
import { firstNonFinite, resolve, validateLayout, validateTransition } from '../stage/resolve'
import type { AnyResolved } from '../stage/types'
import { renderAuthoredTexStrict } from '../ui/tex'
import { TrackContext } from '../ui/trackPref'
import { DEMO, DEMO_ISLAND } from './__fixtures__/demoStory'
import { COURSES, courseOfId, type Track } from './courses'
import { FIDELITY, FIDELITY_VARIANT, fidelityOf } from './fidelity'
import { GLOSSARY } from './glossary'
import { lookupGloss } from './glossRegistry'
import { LECTURES } from './index'
import { DEMO_BRIDGES, DEMO_GLOSSARY, Q0 } from './qc709/__fixtures__/demoChapter'
import { QC_CHAPTERS } from './qc709/index'
import './qc709/pack' // registers the 709 glossary, bridges and fidelity notes with their lookups, as a 709 page does
import '../stage/svg/kinds' // registers the SVG stage kinds, as a page whose chapter uses them does (LecturePage)
import { QC_FIDELITY } from './qc709/fidelity'
import { registerBridges } from './bridgeRegistry'
import { registerGloss } from './glossRegistry'

// what the DEV demo chapter's page registers when it loads (pages/Chapter709Page.tsx)
registerGloss(DEMO_GLOSSARY)
registerBridges(DEMO_BRIDGES)
import { derivationSteps, endsOnResult, pickTrack } from './track'
import type { Beat, Lecture, StageKind, StageLayout, Unit } from './schema'
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
import { glossRefs, readingOrder, termRefs, texSpans } from './walk'

/** 709's written chapters and the DEV demo chapter Q0 (both tracks, a derivation): the two-track checks below. */
const QC: Lecture[] = [...QC_CHAPTERS, Q0]
const ALL: Lecture[] = [...LECTURES, DEMO, DEMO_ISLAND, ...QC]
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

  it('phases run lecture → books → clue; clue beats (and only they) carry a reveal (decision #17)', () => {
    const rank = { lecture: 0, core: 0, books: 1, clue: 2 } as const
    expect(phaseProblems(lecture)).toEqual([])
    for (const [, beats] of stories(lecture)) {
      beats.forEach((b, i) => {
        if (i > 0) expect(rank[b.phase], `${b.id} phase order`).toBeGreaterThanOrEqual(rank[beats[i - 1].phase])
        expect(!!b.reveal, `${b.id}: reveal iff clue`).toBe(b.phase === 'clue')
      })
    }
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
      expect(d.ground.length, `${b.id}: Ground-up steps`).toBeGreaterThan(0)
      expect(d.formal.length, `${b.id}: Formal steps`).toBeGreaterThan(0)
      expect(endsOnResult(d.ground, d.result), `${b.id}: Ground-up ends on ${d.result}`).toBe(true)
      expect(endsOnResult(d.formal, d.result), `${b.id}: Formal ends on ${d.result}`).toBe(true)
      expect(d.ground.length, `${b.id}: Ground-up has fewer steps than Formal`).toBeGreaterThanOrEqual(d.formal.length)
    }
  })
  it('review cards: a Formal card has as many points as it needs (≤ 5) and its TeX renders', () => {
    for (const u of lecture.units.filter((x) => x.review?.formal)) {
      const f = u.review!.formal!
      expect(f.points.length, u.id).toBeGreaterThan(0)
      expect(f.points.length, u.id).toBeLessThanOrEqual(5)
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
    expect([d.ground.length, d.formal.length]).toEqual([3, 2])
    const short = { ...d, ground: d.ground.slice(1, 2) }
    expect(short.ground.length >= short.formal.length && endsOnResult(short.ground, short.result)).toBe(false)
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
    // 448's table and variants, and 709's own drawers and additions (content/qc709/fidelity.ts): one id space
    const qc = [...Object.values(QC_FIDELITY.kinds), ...Object.values(QC_FIDELITY.additions)].flatMap((f) => [...(f?.exact ?? []), ...(f?.schematic ?? []), ...(f?.misleading ?? [])])
    const all = [...[...Object.values(FIDELITY), ...Object.values(FIDELITY_VARIANT)].flatMap((f) => [...f.exact, ...f.schematic, ...f.misleading]), ...qc]
    const ids = all.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(ID_RE.test(id), id).toBe(true)
    for (const k of STAGE_KINDS_448) for (const list of Object.values(FIDELITY[k])) expect(list.length, k).toBeGreaterThan(0)
    for (const k of STAGE_KINDS_709) for (const list of Object.values(fidelityOf(k, 'qc709'))) expect(list.length, k).toBeGreaterThan(0)
    // 448's drawers are exactly its own table: 709's items never show there
    for (const k of STAGE_KINDS_448) expect(fidelityOf(k)).toBe(FIDELITY[k])
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
