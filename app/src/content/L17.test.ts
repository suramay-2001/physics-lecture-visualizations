/**
 * Lecture 17's own rulings as lints (docs/roles/decisions/448-L14L18.md M1–M7; the Townsend pass T1–T11), on top of the platform lints every chapter passes:
 *   M2  the first two beats of the old books-only unit l13-flow (the current and the step with E above V₀) and its practice question moved here from Lecture 13 (keys renamed `l17…`);
 *   M3  the new `potential` field of `wavefunction` is the only stage addition; M6  the widget `wave-lab` stays deferred, so L17 is drawn by SVG kinds only;
 *   T1  three practice questions with full walkthroughs (two modelled on Townsend problems, one on a homework type) whose numbers are not the lecture's own (review P-L16L18 S3, S4).
 * Also: the unit order and beat counts, every text balances its dollar signs, the practice numbers agree with their closed forms, and a practice question does not repeat a challenge or a beat.
 * (Added by the P-L16L18 fix pass: Lectures 14, 15, 16 and 18 each pin their shape; Lecture 17 had no test of its own.)
 */
import { describe, expect, it } from 'vitest'
import { L17 } from './L17'
import { layoutStates } from './stage'
import type { Beat } from './stage'
import { rampBlockKinetic, stepAmplitudes } from '../physics/scatter'
import { V } from './L17.values'

const beats = L17.units.flatMap((u) => u.story ?? [])
const statesOf = (b: Beat) =>
  [b.stage, ...(b.reveal?.stage ? [b.reveal.stage] : [])]
    .flatMap((l) => layoutStates(l))
    .concat((b.derivation?.ground ?? []).flatMap((s) => (s.view ? [s.view] : [])))
const leaves = (x: unknown): string[] => (typeof x === 'string' ? [x] : Array.isArray(x) ? x.flatMap(leaves) : x && typeof x === 'object' ? Object.values(x).flatMap(leaves) : [])
const textsOf = (b: Beat) => [b.text, b.caption ?? '', b.reveal?.text ?? '', b.reveal?.caption ?? '', ...(b.derivation?.ground ?? []).flatMap((s) => [s.tex, s.why, s.viewCaption ?? '']), b.derivation?.result ?? '']
const unitTexts = () => L17.units.flatMap((u) => [u.title, u.question, u.lecture.summary, ...(u.lecture.equations ?? []), u.insight, ...(u.pitfalls ?? []), ...u.visual.tryThis, ...leaves(u.review), ...leaves(u.play)])
const play = (id: string) => L17.units.flatMap((u) => u.play).find((q) => q.id === id)!
const beat = (id: string) => beats.find((b) => b.id === id)!

describe('Lecture 17: shape', () => {
  it('has the three units in order with the planned beats (24), three clues, three books beats, two Go-deeper beats and six derivations', () => {
    expect(L17.units.map((u) => u.id)).toEqual(['l17-mean-force', 'l17-step', 'l17-current'])
    expect(L17.units.map((u) => (u.story ?? []).length)).toEqual([7, 8, 9])
    expect(beats).toHaveLength(24)
    expect(beats.filter((b) => b.phase === 'deeper').map((b) => b.id)).toEqual(['l17-mean-force:b7', 'l17-step:b8'])
    expect(beats.filter((b) => b.phase === 'clue').map((b) => b.id)).toEqual(['l17-mean-force:b6', 'l17-step:b7', 'l17-current:b9'])
    expect(beats.filter((b) => b.phase === 'books').map((b) => b.id)).toEqual(['l17-mean-force:b5', 'l17-step:b6', 'l17-current:b8'])
    expect(beats.filter((b) => b.derivation).map((b) => b.id)).toEqual(['l17-mean-force:b2', 'l17-mean-force:b4', 'l17-step:b3', 'l17-current:b2', 'l17-current:b4', 'l17-current:b5'])
    expect(L17.units.reduce((n, u) => n + u.play.length, 0)).toBe(17) // fourteen challenges and the three practice questions
    expect(L17.corrections ?? []).toHaveLength(0)
  })
  it('every text balances its dollar signs (a stray one would typeset the rest of the sentence as TeX)', () => {
    for (const t of [...beats.flatMap(textsOf), ...unitTexts()]) {
      const flat = t.replace(/\\\$/g, '').replace(/\$\$/g, '')
      expect((flat.match(/\$/g) ?? []).length % 2, t.slice(0, 80)).toBe(0)
    }
  })
  it('every picture is a wavefunction, a plot or a complex-plane state (ruling M6: SVG kinds only)', () => {
    for (const b of beats) for (const s of statesOf(b)) expect(['wavefunction', 'plot', 'complex-plane'], `${b.id} ${s.kind}`).toContain(s.kind)
  })
})

describe('Lecture 17: the practice questions and their numbers', () => {
  it('the three practice questions are tagged, name their source, carry full walkthroughs and are not assigned (T1)', () => {
    const qs = L17.units.flatMap((u) => u.play).filter((q) => q.practice)
    expect(qs.map((q) => `${q.id}:${q.practice}`)).toEqual(['l17-pr-mean:townsend', 'l17-pr-step:townsend', 'l17-pr-edge:homework'])
    for (const q of qs) {
      expect(q.walkthrough.length, q.id).toBeGreaterThan(1)
      expect(q.hints, q.id).toHaveLength(3)
      expect(q.assigned, q.id).toBeFalsy()
      expect(JSON.stringify(q), q.id).not.toMatch(/\bH\d-\d/)
      if (q.practice === 'townsend') expect(q.refs?.[0].where, q.id).toMatch(/^Problem 6\.\d+/)
    }
    const tol = Object.fromEntries(qs.map((q) => [q.id, q.kind === 'numeric' ? q.tolerance : -1]))
    expect(tol).toEqual({ 'l17-pr-mean': 0.005, 'l17-pr-step': 0.005, 'l17-pr-edge': 0.005 })
  })
  it('l17-pr-mean: a packet at 2 with σ = ½ in F = −κx² has a mean force 1 + σ²/μ² = 1.0625 times the force at the mean (review S4: not the challenge l17-mf-var, which sits at 3)', () => {
    expect(V.l17PrMeanFactor).toBeCloseTo(1 + 0.25 / 4, 9)
    expect(V.l17PrMeanFactor).not.toBeCloseTo(V.l17ChVar / 9, 3)
    const q = play('l17-pr-mean')
    expect(q.kind === 'numeric' && q.answer).toBe(V.l17PrMeanFactor)
    expect(q.prompt).toContain('\\mu = 2')
    expect(JSON.stringify(q.walkthrough)).not.toContain('9.25')
    expect(q.title).toBe('A restoring force that grows with distance')
  })
  it('l17-pr-edge: plateau 8 with ramps 2 then 1 gives (1/1)/(8 + 2/3) over (1/2)/(8 + 4/3) = 2.1538, not the Go-deeper beat’s plateau 10 and ramps 1 and ½ (review S3)', () => {
    expect(V.l17PrEdgeRatio).toBeCloseTo(1 / (8 + 2 / 3) / (0.5 / (8 + 4 / 3)), 9)
    expect(V.l17PrEdgeRatio).toBeCloseTo(28 / 13, 9)
    expect(V.l17PrEdgeRatio).toBeCloseTo(rampBlockKinetic(8, 1) / rampBlockKinetic(8, 2), 12)
    expect(Math.abs(V.l17PrEdgeRatio - V.l17TrapRatio)).toBeGreaterThan(0.05) // 2.154 against 2.065
    const q = play('l17-pr-edge')
    expect(q.kind === 'numeric' && q.answer).toBe(V.l17PrEdgeRatio)
    expect(q.prompt).toContain('plateau length 8')
    expect(JSON.stringify(q.hints)).toContain('L = 8')
    expect(beat('l17-step:b8').text).toContain('plateau length 10') // the beat keeps its own numbers
  })
  it('l17-pr-step: E = 1.5 V₀ gives T = 4kk₀/(k + k₀)² = 0.9282 and R = 0.0718, which add to 1', () => {
    const { R, T } = stepAmplitudes(1.5, 1)
    expect(V.l17PrStepT).toBeCloseTo(T, 12)
    expect(V.l17PrStepR).toBeCloseTo(R, 12)
    expect(V.l17PrStepT + V.l17PrStepR).toBeCloseTo(1, 12)
  })
})
