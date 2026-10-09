/**
 * Widgets W2 `polarization-dial` and W3 `bb84-bench` (448 Lecture 8). The dial's picture and numbers come from the polarization
 * engine, the bench draws the `bb84` stage kind with its own resolver and scene. The Try-it lines of the lecture promise the
 * numbers checked here; the controls themselves (buttons, sliders) are exercised by the e2e spec.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { missProb } from '../physics/bb84'
import { analyzerProb } from '../physics/polarization'
import Bb84Bench, { benchModel } from './Bb84Bench'
import PolarizationDial, { dialModel } from './PolarizationDial'

const DEG = Math.PI / 180
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const text = (html: string) => html.replace(/<!-- -->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

describe('polarization-dial: the doubling is computed', () => {
  it('a photon turned 45° moves its sphere point 90°; an electron turned 45° moves it 45°', () => {
    const p = dialModel('photon', 0, 45, 0)
    close(p.sphereDeg, 90)
    close(p.r[0], 1) // |D⟩ on the +x axis
    close(p.r[2], 0, 1e-12)
    const e = dialModel('electron', 0, 45, 0)
    close(e.sphereDeg, 45)
    close(e.r[0], Math.sin(45 * DEG))
    close(e.r[2], Math.cos(45 * DEG))
  })
  it('chances: a photon at χ with an analyzer at χ_a gives cos²Δχ and sin²Δχ; an electron cos²(Δ/2)', () => {
    const p = dialModel('photon', 0, 30, 0)
    close(p.aligned, analyzerProb(30 * DEG, 0))
    close(p.aligned, 0.75)
    close(p.other, 0.25)
    const p60 = dialModel('photon', 0, 0, 60)
    close(p60.aligned, 0.25)
    const e = dialModel('electron', 0, 60, 0)
    close(e.aligned, Math.cos(30 * DEG) ** 2)
    close(e.aligned + e.other, 1)
  })
  it('turning light 180°: the sphere point goes once round (360°), every chance returns; turning 90° reaches |V⟩', () => {
    const start = dialModel('photon', 30, 0, 20)
    const flip = dialModel('photon', 30, 180, 20)
    close(flip.sphereDeg, 360)
    close(flip.aligned, start.aligned)
    close(flip.other, start.other)
    flip.r.forEach((x, i) => close(x, start.r[i]))
    const v = dialModel('photon', 0, 90, 0)
    close(v.aligned, 0)
    close(v.r[2], -1)
    close(v.sphereDeg, 180)
  })
  it('renders both panes, the readout and the doubling note, with no NaN; editable false draws no controls', () => {
    const html = renderToString(<PolarizationDial chi={0} analyzer={0} />)
    const t = text(html)
    expect(t).toContain('lab turn 0° → sphere turn 0°')
    expect(t).toContain('Turn 45°')
    expect(t).toContain('Turn 180°')
    expect(html).toContain('data-part="head"')
    expect(t).toContain('P = 100.0%')
    expect(t).toContain('sphere turns twice as far')
    expect(html).not.toMatch(/NaN|Infinity/)
    const fixed = text(renderToString(<PolarizationDial chi={30} analyzer={0} editable={false} />))
    expect(fixed).not.toContain('Turn 45°')
    expect(fixed).toContain('P = 75.0%')
    const e = text(renderToString(<PolarizationDial carrier="electron" />))
    expect(e).toContain('sphere turns exactly as far as the lab')
  })
})

describe('bb84-bench: the ledger the controls ask for', () => {
  it('before any photon is sent there is no ledger; the first render says so', () => {
    expect(benchModel({ sent: 0, seed: 84, eve: 'off', sift: false, m: 0 }).r).toBeNull()
    const t = text(renderToString(<Bb84Bench />))
    expect(t).toContain('No photons sent yet')
    expect(t).toContain('Send 1000')
    expect(t).toContain('New run')
    expect(t).toContain('keep matching rounds')
  })
  it('send 10 with Eve off: ten rows, no errors, nothing to compare yet', () => {
    const m = benchModel({ sent: 10, seed: 84, eve: 'off', sift: false, m: 0 })
    expect(m.r!.rows).toHaveLength(10)
    expect(m.r!.errors).toBe(0)
    expect(m.r!.sift).toBe(false)
    expect(m.lines[0]).toBe('10 photons sent')
    expect(m.mEff).toBe(0)
  })
  it('sift then test 20 with no Eve: kept about half, the test shows 0 errors, nothing to miss', () => {
    const m = benchModel({ sent: 100, seed: 84, eve: 'off', sift: true, m: 20 })
    expect(m.kept).toBeGreaterThan(20)
    expect(m.r!.test!.m).toBe(20)
    expect(m.r!.test!.nErr).toBe(0)
    expect(m.lines.join(' ')).not.toContain('no-error chance')
  })
  it('Eve on, 1000 photons: Q̂ near ¼, Eve knows near half; the test size is capped at the key so far', () => {
    const m = benchModel({ sent: 1000, seed: 84, eve: 'all', sift: true, m: 17 })
    const r = m.r!
    expect(Math.abs(r.qhat! - 0.25)).toBeLessThan(4 * r.sigma!)
    expect(Math.abs(r.eveKnows / r.kept - 0.5)).toBeLessThan(0.1)
    expect(m.mEff).toBe(17)
    close(r.test!.miss, missProb(0.25, 17))
    expect(m.lines).toContain('no-error chance 0.0075')
    const few = benchModel({ sent: 12, seed: 84, eve: 'all', sift: true, m: 50 })
    expect(few.mEff).toBe(few.kept)
    expect(few.mEff).toBeLessThan(50)
  })
  it('the smallest m with a miss chance of at most 1 % is 17: 16 still shows 0.0100', () => {
    const at = (m: number) => benchModel({ sent: 400, seed: 84, eve: 'all', sift: true, m })
    expect(at(16).lines).toContain('no-error chance 0.0100')
    expect(at(17).lines).toContain('no-error chance 0.0075')
  })
  it('the same seed gives the same photons with Eve on or off (only Bob’s and Eve’s readings differ)', () => {
    const a = benchModel({ sent: 12, seed: 84, eve: 'off', sift: false, m: 0 }).r!
    const b = benchModel({ sent: 12, seed: 84, eve: 'all', sift: false, m: 0 }).r!
    expect(a.rows.map((x) => [x.aBit, x.aBasis, x.bBasis])).toEqual(b.rows.map((x) => [x.aBit, x.aBasis, x.bBasis]))
  })
  it('editable false hides the controls but keeps Send; props start the bench in the asked setting', () => {
    const fixed = text(renderToString(<Bb84Bench eve="all" testSize={17} editable={false} />))
    expect(fixed).toContain('Send 100')
    expect(fixed).not.toContain('keep matching rounds')
    expect(fixed).not.toContain('Eavesdropper')
  })
})
