/**
 * Widget `optics-bench` (the Optics Lab platform): the presets registry, its validation (an unknown preset or a malformed one is an error),
 * the pure model of a slider move (a slider changes a readout, tested without a browser), the plot helpers, the SSR render (axes, ticks, units,
 * curves, legend, markers, labelled sliders, readouts, no canvas) and two source lints: no result is typed in a preset, and motion is
 * confined to `prefers-reduced-motion: no-preference`. The keyboard path through the real browser is in e2e/notes.spec.ts.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { rabiFlipTime, rabiPeak } from '../physics/dynamics'
import { APP_DIR, fs, path } from '../security/node'
import OpticsBench from './OpticsBench'
import { readoutRows, resetParams, setParam, sliderText } from './opticsBench/model'
import { decimalsOf, fixed, niceDomain, niceStep, niceTicks, pathOf, sample, scale, yExtent } from './opticsBench/plot'
import presetsSource from './opticsBench/presets.ts?raw'
import { OPTICS_PRESETS, OPTICS_PRESET_IDS, defaultParams, hasPreset, type OpticsPreset } from './opticsBench/presets'
import { opticsPresetProblems, opticsPresetsProblems, opticsWidgetProblems } from './opticsBench/validate'

/** The widget's stylesheet as written (vitest does not hand a processed .css through `?raw`). */
const css = fs.readFileSync(path.join(APP_DIR, 'src/widgets/opticsBench.css'), 'utf8')
const clean = (html: string): string => html.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/<!--.*?-->/g, '')
const lorentzian = OPTICS_PRESETS.lorentzian

/** A small valid preset to mutate (the real one is the demo; a mutation of a copy shows each rule fails). */
const base = (): OpticsPreset => ({
  title: 'Probe',
  question: 'Does it work?',
  sliders: [{ key: 'a', label: 'Slope a', min: 0, max: 2, step: 0.5, default: 1, unit: 'u' }],
  x: { label: 'x', unit: 'm', from: 0, to: 4 },
  y: { label: 'y', unit: '' },
  curves: (p) => [{ label: 'line', f: (x) => p.a * x }],
  readouts: (p) => [{ label: 'slope', value: p.a, unit: 'u', digits: 2 }],
})
const withEdit = (edit: (p: OpticsPreset) => void) => {
  const p = base()
  edit(p)
  return opticsPresetProblems('probe', p)
}

describe('the presets registry', () => {
  it('has the demo preset, every id is kebab-case and an own key, and every preset in the table is valid', () => {
    expect(OPTICS_PRESET_IDS).toContain('lorentzian')
    for (const id of OPTICS_PRESET_IDS) expect(hasPreset(id), id).toBe(true)
    for (const id of ['toString', 'constructor', '__proto__', 'nope', '', 7, undefined, null]) expect(hasPreset(id), String(id)).toBe(false)
    expect(opticsPresetsProblems()).toEqual([])
  })
  it('the demo preset reads the engine: its curve is rabiPeak and its readouts are rabiPeak and rabiFlipTime', () => {
    const p = { w1: 1.5, w2: 2.5, delta: 0.75 }
    const [a, b] = lorentzian.curves(p)
    for (const x of [-3, 0, 0.4, 2.2]) {
      expect(a.f(x)).toBe(rabiPeak(x, 1.5))
      expect(b.f(x)).toBe(rabiPeak(x, 2.5))
    }
    expect(lorentzian.markers!(p)).toEqual([{ x: 0.75, label: 'δ' }])
    const r = lorentzian.readouts(p)
    expect(r[0].value).toBe(rabiPeak(0.75, 1.5))
    expect(r[1].value).toBe(rabiPeak(0.75, 2.5))
    expect(r[2].value).toBe(rabiPeak(0, 1.5))
    expect(r[3].value).toBe(rabiFlipTime(1.5))
    // a closed form I can do by hand, as a sanity check on the engine call: at δ = ω1 the height is (1/4)/(1 + 1/4)
    expect(rabiPeak(1, 1)).toBeCloseTo(0.2, 12)
  })
  it('the default parameters are the sliders’ defaults', () => {
    expect(defaultParams(lorentzian)).toEqual({ w1: 1, w2: 2, delta: 1 })
    expect(resetParams(lorentzian)).toEqual(defaultParams(lorentzian))
  })
})

describe('validation: each rule fails on a mutation', () => {
  it('the probe preset is valid', () => expect(withEdit(() => undefined)).toEqual([]))
  it('an id that is not kebab-case, an empty title or question', () => {
    expect(opticsPresetProblems('Bad_Id', base()).some((m) => m.includes('kebab-case'))).toBe(true)
    expect(withEdit((p) => (p.title = ' ')).some((m) => m.includes('title'))).toBe(true)
    expect(withEdit((p) => (p.question = '<b>x</b>')).some((m) => m.includes('question'))).toBe(true)
  })
  it('sliders: range, step, default on the grid, keys, count', () => {
    expect(withEdit((p) => (p.sliders[0].min = 3)).some((m) => m.includes('min must be below max'))).toBe(true)
    expect(withEdit((p) => (p.sliders[0].step = 0)).some((m) => m.includes('step'))).toBe(true)
    expect(withEdit((p) => (p.sliders[0].step = 5)).some((m) => m.includes('step'))).toBe(true)
    expect(withEdit((p) => (p.sliders[0].default = 3)).some((m) => m.includes('outside'))).toBe(true)
    expect(withEdit((p) => (p.sliders[0].default = 0.7)).some((m) => m.includes('step grid'))).toBe(true)
    expect(withEdit((p) => (p.sliders[0].key = '1a')).some((m) => m.includes('key'))).toBe(true)
    expect(withEdit((p) => p.sliders.push({ ...p.sliders[0] })).some((m) => m.includes('duplicate key'))).toBe(true)
    expect(withEdit((p) => (p.sliders[0].default = Number.NaN)).some((m) => m.includes('finite'))).toBe(true)
    expect(withEdit((p) => (p.sliders = Array.from({ length: 7 }, (_, i) => ({ ...base().sliders[0], key: `k${i}` })))).some((m) => m.includes('7 sliders'))).toBe(true)
  })
  it('axes: x range, a half-given y range', () => {
    expect(withEdit((p) => (p.x.from = 9)).some((m) => m.includes('x.from'))).toBe(true)
    expect(withEdit((p) => (p.y.from = 0)).some((m) => m.includes('together'))).toBe(true)
    expect(withEdit((p) => ((p.y.from = 1), (p.y.to = 0))).some((m) => m.includes('y.from'))).toBe(true)
    expect(withEdit((p) => ((p.y.from = 0), (p.y.to = 1)))).toEqual([])
  })
  it('curves: none, five, duplicate labels, infinite, mostly undefined', () => {
    expect(withEdit((p) => (p.curves = () => [])).some((m) => m.includes('0 curves'))).toBe(true)
    expect(withEdit((p) => (p.curves = () => Array.from({ length: 5 }, (_, i) => ({ label: `c${i}`, f: (x: number) => x })))).some((m) => m.includes('5 curves'))).toBe(true)
    expect(withEdit((p) => (p.curves = () => [{ label: 'a', f: (x: number) => x }, { label: 'a', f: (x: number) => -x }])).some((m) => m.includes('duplicate curve label'))).toBe(true)
    expect(withEdit((p) => (p.curves = () => [{ label: 'a', f: () => Infinity }])).some((m) => m.includes('infinite'))).toBe(true)
    expect(withEdit((p) => (p.curves = () => [{ label: 'a', f: () => Number.NaN }])).some((m) => m.includes('fewer than half'))).toBe(true)
    // a pole at one point leaves a gap but is fine when the curve is finite elsewhere... unless it is infinite AT a sample
    expect(withEdit((p) => (p.curves = () => [{ label: 'a', f: (x: number) => (x === 0 ? Infinity : x) }])).some((m) => m.includes('infinite'))).toBe(true)
  })
  it('readouts: none, not finite, no digits, and markers that are not finite; the extremes are evaluated too', () => {
    expect(withEdit((p) => (p.readouts = () => [])).some((m) => m.includes('no readouts'))).toBe(true)
    expect(withEdit((p) => (p.readouts = () => [{ label: 'r', value: Number.NaN, unit: '', digits: 2 }])).some((m) => m.includes('not finite'))).toBe(true)
    expect(withEdit((p) => (p.readouts = () => [{ label: 'r', value: 1, unit: '', digits: 2.5 }])).some((m) => m.includes('digits'))).toBe(true)
    expect(withEdit((p) => (p.markers = () => [{ x: Infinity, label: 'm' }])).some((m) => m.includes('marker'))).toBe(true)
    // a readout that only fails at the slider's maximum is found
    expect(withEdit((p) => (p.readouts = (q) => [{ label: 'r', value: q.a > 1.5 ? Number.NaN : 1, unit: '', digits: 1 }])).some((m) => m.includes('maximum'))).toBe(true)
  })
  it('opticsWidgetProblems: an unknown or inherited preset, a stray prop, a missing preset; another kind is not judged', () => {
    expect(opticsWidgetProblems({ kind: 'optics-bench', props: { preset: 'lorentzian' } })).toEqual([])
    expect(opticsWidgetProblems({ kind: 'optics-bench', props: { preset: 'nope' } })[0]).toContain('unknown optics-bench preset "nope" (known: lorentzian')
    expect(opticsWidgetProblems({ kind: 'optics-bench', props: { preset: 'toString' } })).toHaveLength(1)
    expect(opticsWidgetProblems({ kind: 'optics-bench' })[0]).toContain('unknown optics-bench preset undefined')
    expect(opticsWidgetProblems({ kind: 'optics-bench', props: { preset: 'lorentzian', width: 3 } })).toEqual(['optics-bench takes one prop, "preset", not "width"'])
    expect(opticsWidgetProblems({ kind: 'bloch' })).toEqual([])
  })
})

describe('a slider changes a readout (the pure model the component calls)', () => {
  const start = defaultParams(lorentzian)
  it('moving the drive strength changes the flip time and the height at the marked detuning; the comparison readout stays', () => {
    const before = readoutRows(lorentzian, start)
    const after = readoutRows(lorentzian, setParam(lorentzian, start, 'w1', 2))
    expect(after[3].text).not.toBe(before[3].text) // First full flip on resonance
    expect(after[0].text).not.toBe(before[0].text) // Height at δ, drive ω₁
    expect(after[1].text).toBe(before[1].text) // the comparison drive did not move
    expect(after[2].text).toBe(before[2].text) // resonance height is 1 for any drive
    expect(before[3].text).toBe(`${fixed(rabiFlipTime(1), 2)} τ`)
    expect(after[3].text).toBe(`${fixed(rabiFlipTime(2), 2)} τ`)
  })
  it('clamps to the range, snaps to the step grid, ignores unknown keys and non-finite values, and does not mutate the input', () => {
    expect(setParam(lorentzian, start, 'w1', 99).w1).toBe(4)
    expect(setParam(lorentzian, start, 'w1', -5).w1).toBe(0.25)
    expect(setParam(lorentzian, start, 'w1', 1.26).w1).toBe(1.25)
    expect(setParam(lorentzian, start, 'delta', 0.02).delta).toBe(0)
    expect(setParam(lorentzian, start, 'nope', 3)).toEqual(start)
    expect(setParam(lorentzian, start, 'w1', Number.NaN)).toEqual(start)
    const frozen = Object.freeze({ ...start })
    expect(setParam(lorentzian, frozen, 'w1', 3)).not.toBe(frozen)
    expect(frozen.w1).toBe(1)
  })
  it('a slider’s value is printed with its step’s decimals and its unit', () => {
    expect(sliderText(lorentzian, 'w1', 1)).toBe('1.00 1/τ')
    expect(sliderText(lorentzian, 'delta', -0.5)).toBe('-0.50 1/τ')
    expect(sliderText(base(), 'a', 1.5)).toBe('1.5 u')
    expect(sliderText(base(), 'zzz', 1)).toBe('1.00')
  })
})

describe('the plot helpers', () => {
  it('round steps and ticks', () => {
    expect(niceStep(12, 6)).toBe(2)
    expect(niceStep(1, 5)).toBe(0.2)
    expect(niceStep(0, 5)).toBe(1)
    expect(niceTicks(-6, 6, 6)).toEqual([-6, -4, -2, 0, 2, 4, 6])
    expect(niceTicks(0, 1, 5)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1])
    expect(niceDomain(0, 0.93, 5)).toEqual([0, 1])
    expect(niceDomain(2, 2)).toEqual([1, 3])
    expect(decimalsOf(0.25)).toBe(2)
    expect(decimalsOf(5)).toBe(0)
    expect(decimalsOf(0.05)).toBe(2)
  })
  it('numbers print without -0, NaN or Infinity', () => {
    expect(fixed(-0.001, 2)).toBe('0.00')
    expect(fixed(Number.NaN, 2)).toBe('–')
    expect(fixed(Infinity, 2)).toBe('–')
    expect(fixed(1.005, 1)).toBe('1.0')
  })
  it('samples, extent and paths: gaps break the line, finite points only', () => {
    const pts = sample((x) => (x === 1 ? 1 / 0 : x * x), 0, 2, 4)
    expect(pts.map((p) => p.x)).toEqual([0, 0.5, 1, 1.5, 2])
    expect(Number.isNaN(pts[2].y)).toBe(true)
    expect(yExtent([pts])).toEqual([0, 4])
    expect(yExtent([[{ x: 0, y: Number.NaN }]])).toBeNull()
    const d = pathOf(pts, scale(0, 2, 0, 100), scale(0, 4, 100, 0))
    expect(d).toBe('M0.00 100.00L25.00 93.75M75.00 43.75L100.00 0.00')
    expect(d).not.toMatch(/NaN|Infinity/)
  })
})

describe('SSR render of the demo preset', () => {
  const html = clean(renderToString(<OpticsBench preset="lorentzian" />))
  it('an SVG plot with a title, a description, axes with ticks and units, two curves, a legend and one marker; no canvas', () => {
    expect(html).toContain('<svg class="ob-plot"')
    expect(html).toContain('role="img"')
    expect(html).toMatch(/<title id="ob-t-[^"]+">Resonance line of a driven two-level atom<\/title>/)
    expect(html).toMatch(/<desc id="ob-d-[^"]+">Largest flip chance against Detuning δ = ω₀ − ω: drive ω₁; comparison drive ω₁′\.<\/desc>/)
    expect(html).toContain('Detuning δ = ω₀ − ω (1/τ)')
    expect(html).toContain('>Largest flip chance<')
    expect((html.match(/class="ob-tick-label"/g) ?? []).length).toBe(7 + 6) // x: -6 … 6 by 2; y: 0 … 1 by 0.2
    for (const t of ['-6', '-2', '0', '6', '0.2', '0.8', '1.0']) expect(html, t).toContain(`>${t}</text>`)
    expect((html.match(/class="ob-curve ob-curve-\d" d="M[\d.]+ [\d.]+L/g) ?? []).length).toBe(2) // two curves in the plot (the legend's swatches are two more paths)
    expect((html.match(/<li><svg class="ob-swatch"/g) ?? []).length).toBe(2)
    expect((html.match(/class="ob-marker"/g) ?? []).length).toBe(1)
    expect(html).toContain('aria-label="Curves"')
    expect(html).not.toContain('<canvas')
    expect(html).not.toMatch(/NaN|Infinity/)
  })
  it('three labelled range sliders with their values and units, and readouts from the engine', () => {
    expect((html.match(/type="range"/g) ?? []).length).toBe(3)
    for (const label of ['Drive strength ω₁', 'Comparison drive ω₁′', 'Marked detuning δ']) expect(html).toContain(`<span class="slider-label">${label}</span>`)
    expect(html).toContain('>1.00 1/τ<')
    expect(html).toContain('>2.00 1/τ<')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('data-readout="0"')
    expect(html).toContain(`>${fixed(rabiPeak(1, 1), 3)}<`)
    expect(html).toContain(`>${fixed(rabiFlipTime(1), 2)} τ<`)
    expect(html).toContain('data-optics-preset="lorentzian"')
    expect(html).toContain('How wide is the resonance line')
  })
  it('an unknown preset shows a plain message, never a crash', () => {
    const bad = clean(renderToString(<OpticsBench preset="no-such" />))
    expect(bad).toContain('role="alert"')
    expect(bad).toContain('no preset called “no-such”')
    expect(bad).toContain('lorentzian')
    expect(clean(renderToString(<OpticsBench preset="toString" />))).toContain('role="alert"')
  })
})

describe('source lints', () => {
  /** The text of each preset from its `curves:` entry to the end of the object, strings and comments removed. */
  const checked = [...presetsSource.matchAll(/\n {2}curves: \(p\) =>[\s\S]*?\n\}/g)].map((m) =>
    m[0]
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/'(?:[^'\\]|\\.)*'/g, "''")
      .replace(/`(?:[^`\\]|\\.)*`/g, '``')
      .replace(/\bdigits: \d+/g, 'digits: N'), // the decimals a readout prints are formatting, not a result
  )
  it('every preset is read (a vacuous pass is not a pass)', () => {
    expect(checked.length).toBe(OPTICS_PRESET_IDS.length)
  })
  it('no result is typed in a preset: curves, markers and readouts hold no decimal and no integer above 1 (limits and axes are above them)', () => {
    for (const body of checked) {
      const literals = body.match(/(?<![\w.])\d+(?:\.\d+)?(?![\w])/g) ?? []
      expect(literals.filter((l) => l.includes('.') || Number(l) > 1), body.slice(0, 80)).toEqual([])
    }
    // the lint can fail: a typed result is found
    expect(`readouts: (p) => [{ value: 0.5 }]`.match(/(?<![\w.])\d+(?:\.\d+)?(?![\w])/g)).toEqual(['0.5'])
  })
  it('the stylesheet moves things only under prefers-reduced-motion: no-preference (every animation or transition is inside that block)', () => {
    const i = css.indexOf('@media (prefers-reduced-motion: no-preference)')
    expect(i).toBeGreaterThan(0)
    const open = css.indexOf('{', i)
    let depth = 0
    let end = open
    for (let k = open; k < css.length; k++) {
      if (css[k] === '{') depth++
      if (css[k] === '}' && --depth === 0) {
        end = k
        break
      }
    }
    const outside = css.slice(0, i) + css.slice(end + 1)
    expect(outside).not.toMatch(/\banimation(?:-\w+)?\s*:|\btransition(?:-\w+)?\s*:/)
    expect(css.slice(i, end)).toMatch(/animation:/)
  })
})
