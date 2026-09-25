/**
 * Content gate (W-L1 §6.1; owner W). Runs on every lecture in LECTURES plus the DEV demo story fixture.
 * P's lints (symbols, claims.json) and S's (verbatim, security) build on the same walker (content/walk.ts).
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { UnitView } from '../components/UnitView'
import { StaticStory } from '../stage/StaticStory'
import { interpolate } from '../stage/interp'
import { firstNonFinite, resolve, validateLayout, validateTransition } from '../stage/resolve'
import type { AnyResolved } from '../stage/types'
import { renderAuthoredTexStrict } from '../ui/tex'
import { DEMO, DEMO_ISLAND } from './__fixtures__/demoStory'
import { FIDELITY, FIDELITY_VARIANT, fidelityOf } from './fidelity'
import { GLOSSARY } from './glossary'
import { LECTURES } from './index'
import type { Beat, Lecture, StageKind, StageLayout, Unit } from './schema'
import {
  ID_RE,
  PASSPORT,
  PASSPORT_VARIANT,
  STAGE_KINDS,
  beatLayout,
  checkBeatIds,
  layoutStates,
  passportOf,
  stateOfKind,
} from './stage'
import { ANCHORS } from './stageVocab'
import { glossRefs, readingOrder, termRefs, texSpans } from './walk'

const ALL: Lecture[] = [...LECTURES, DEMO, DEMO_ISLAND]
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
    const rank = { lecture: 0, books: 1, clue: 2 } as const
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
        const usedQ = [b.text, b.caption ?? ''].flatMap(termRefs)
        const usedR = [b.reveal?.text ?? '', b.reveal?.caption ?? ''].flatMap(termRefs)
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

  it('glosses: every [[id]] in any authored string exists in GLOSSARY', () => {
    for (const site of readingOrder(lecture))
      for (const id of glossRefs(site.text)) expect(GLOSSARY.has(id), `${site.where}.${site.field}: gloss "${id}"`).toBe(true)
  })

  it('fidelity: flagged items exist for the beat kinds; variants in use are filled in', () => {
    for (const [, beats] of stories(lecture))
      for (const b of beats) {
        const keys = pictures(b).flatMap((l) => layoutStates(l).map((s) => passportOf(s).fidelityKey))
        for (const key of keys) {
          const f = fidelityOf(key)
          for (const list of [f.exact, f.schematic, f.misleading]) expect(list.length, `${b.id}: fidelity "${key}" has an empty list`).toBeGreaterThan(0)
        }
        const ids = new Set(keys.flatMap((k) => Object.values(fidelityOf(k)).flatMap((list) => list.map((i: { id: string }) => i.id))))
        for (const id of [...(b.fidelity ?? []), ...(b.reveal?.fidelity ?? [])]) expect(ids.has(id), `${b.id}: fidelity id "${id}"`).toBe(true)
      }
  })

  it('KaTeX: every TeX span of every authored string renders with 0 ParseErrors', () => {
    for (const site of readingOrder(lecture)) {
      const spans = site.tex === 'display' ? [{ tex: site.text, display: true }] : texSpans(site.text)
      for (const s of spans) expect(() => renderAuthoredTexStrict(s.tex, s.display), `${site.where}.${site.field}: ${s.tex}`).not.toThrow()
    }
  })

  it('claims hold and corrections check', () => {
    for (const u of units(lecture)) {
      for (const c of u.claims ?? []) expect(c.holds(), `${u.id}: ${c.text}`).toBe(true)
      for (const c of u.review?.claims ?? []) expect(c.holds(), `${u.id} review: ${c.text}`).toBe(true)
      for (const b of u.story ?? []) for (const c of [...(b.claims ?? []), ...(b.reveal?.claims ?? [])]) expect(c.holds(), `${b.id}: ${c.text}`).toBe(true)
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
    const all = [...Object.values(FIDELITY), ...Object.values(FIDELITY_VARIANT)].flatMap((f) => [...f.exact, ...f.schematic, ...f.misleading])
    const ids = all.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(ID_RE.test(id), id).toBe(true)
    for (const k of STAGE_KINDS) for (const list of Object.values(FIDELITY[k])) expect(list.length, k).toBeGreaterThan(0)
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
