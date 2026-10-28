/**
 * The `optics-bench` right-hand axis (`OpticsPreset.y2`, `OpticsCurve.axis`): a picture of two quantities in different units against one x.
 * The right axis is drawn, with its own ticks and unit, only when a curve reads it; the legend says which axis each curve reads against; and
 * the validator refuses the shapes that would draw a wrong picture (a right curve with no y2, a y2 nobody reads, no curve on the left).
 * A synthetic preset is drawn through `PresetBench`, as the content builder's tests draw a new one; the registry holds only real presets.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PresetBench } from './OpticsBench'
import { opticsPresetProblems } from './opticsBench/validate'
import type { OpticsPreset } from './opticsBench/presets'

const clean = (html: string): string => html.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/<!--.*?-->/g, '')

/** A field falling along a path (left axis, gauss) and a speed rising along it (right axis, metres per second): different units, one x. */
const twoAxes = (edit?: (p: OpticsPreset) => void): OpticsPreset => {
  const p: OpticsPreset = {
    title: 'Field and speed along a path',
    question: 'How do a field and a speed change along the same path?',
    sliders: [{ key: 'k', label: 'Rate k', min: 1, max: 3, step: 1, default: 2, unit: '' }],
    x: { label: 'Position z', unit: 'm', from: 0, to: 2 },
    y: { label: 'Field', unit: 'G', from: 0, to: 4 },
    y2: { label: 'Speed', unit: 'm/s', from: 0, to: 400 },
    curves: (q) => [
      { label: 'field', f: (z) => 4 - q.k * z },
      { label: 'speed', f: (z) => 100 * q.k * z, axis: 'right' },
      { label: 'field squared', f: (z) => (4 - q.k * z) ** 2 / 4, axis: 'left' },
    ],
    readouts: (q) => [{ label: 'rate', value: q.k, unit: '', digits: 0 }],
  }
  edit?.(p)
  return p
}
const problems = (edit?: (p: OpticsPreset) => void) => opticsPresetProblems('two-axes', twoAxes(edit))

describe('the right-hand axis of the optics bench', () => {
  const html = clean(renderToString(<PresetBench id="two-axes" preset={twoAxes()} />))
  it('draws a right axis with its own ticks and unit, a right-hand title, and keeps the left axis', () => {
    expect(html).toContain('data-right-axis="true"')
    expect((html.match(/<g class="ob-right">/g) ?? []).length).toBe(5) // right ticks: 0, 100 … 400
    for (const t of ['0', '100', '200', '300', '400']) expect(html, t).toMatch(new RegExp(`class="ob-tick-label" x="[\\d.]+" y="[\\d.]+" text-anchor="start">${t}</text>`))
    expect(html).toContain('>Speed (m/s)<')
    expect(html).toContain('rotate(90)')
    expect(html).toContain('>Field (G)<') // the left axis title is still there
    expect(html).toMatch(/class="ob-tick-label" x="[\d.]+" y="[\d.]+" text-anchor="end">4<\/text>/) // left tick at the top of 0 to 4
  })
  it('each curve is plotted against its own scale: the right-axis curve spans the plot from the bottom to the top', () => {
    const paths = [...html.matchAll(/<path class="ob-curve ob-curve-(\d)" d="([^"]+)" fill="none" data-axis="(left|right)"/g)]
    expect(paths.map((m) => m[3])).toEqual(['left', 'right', 'left'])
    const ys = (d: string) => [...d.matchAll(/[ML][\d.]+ ([\d.]+)/g)].map((m) => Number(m[1]))
    const speed = ys(paths[1][2])
    const field = ys(paths[0][2])
    // speed runs 0 to 400 on a 0 to 400 axis: bottom (y = 304) to top (y = 18); field 4 to 0 on 0 to 4: top to bottom
    expect(speed[0]).toBeCloseTo(304, 1)
    expect(speed[speed.length - 1]).toBeLessThan(speed[0])
    expect(field[0]).toBeCloseTo(18, 1)
    expect(field[field.length - 1]).toBeGreaterThan(field[0])
  })
  it('the legend says which axis each curve reads against, and the description of the picture does too', () => {
    const items = [...html.matchAll(/<li data-axis="(left|right)">.*?<\/li>/g)].map((m) => m[0].replace(/<[^>]+>/g, ''))
    expect(items).toEqual(['field (left axis)', 'speed (right axis)', 'field squared (left axis)'])
    expect(html).toMatch(/<desc id="ob-d-[^"]+">Field \(left axis\) and Speed \(right axis\) against Position z: field, left axis; speed, right axis; field squared, left axis\.<\/desc>/)
  })
  it('without a curve on the right there is no right axis, no right ticks and no axis words in the legend', () => {
    const plain = clean(renderToString(<PresetBench id="plain" preset={twoAxes((p) => (p.curves = (q) => [{ label: 'field', f: (z) => 4 - q.k * z }]))} />))
    expect(plain).not.toContain('data-right-axis')
    expect(plain).not.toContain('class="ob-right"')
    expect(plain).not.toContain('ob-legend-axis')
    expect(plain).not.toContain('Speed')
    expect(plain).not.toContain('rotate(90)')
    // a curve that says right with no y2 is drawn on the left and gets no right axis (the validator refuses the preset before it ships)
    const orphan = clean(renderToString(<PresetBench id="orphan" preset={twoAxes((p) => { delete p.y2 })} />))
    expect(orphan).not.toContain('data-right-axis')
  })
  it('a right axis that follows its curves (no fixed range) is rounded to whole ticks', () => {
    const auto = clean(renderToString(<PresetBench id="auto" preset={twoAxes((p) => (p.y2 = { label: 'Speed', unit: 'm/s' }))} />))
    expect(auto).toContain('data-right-axis="true"')
    expect(auto).not.toMatch(/NaN|Infinity/)
    expect((auto.match(/<g class="ob-right">/g) ?? []).length).toBeGreaterThanOrEqual(3)
  })
})

describe('the right-hand axis: the validator', () => {
  it('the two-axis preset is valid', () => expect(problems()).toEqual([]))
  it('a curve on the right without y2, a y2 no curve reads, and no curve on the left are each one error', () => {
    expect(problems((p) => { delete p.y2 }).some((m) => m.includes('reads the right axis but the preset has no y2'))).toBe(true)
    expect(problems((p) => (p.curves = (q) => [{ label: 'field', f: (z) => 4 - q.k * z }])).some((m) => m.includes('declares y2 but no curve reads it'))).toBe(true)
    expect(problems((p) => (p.curves = () => [{ label: 'speed', f: (z) => z, axis: 'right' }])).some((m) => m.includes('every curve reads the right axis'))).toBe(true)
  })
  it('an axis that is neither left nor right, a half-given y2 range and a y2 without a plain label are caught', () => {
    expect(problems((p) => (p.curves = () => [{ label: 'a', f: (z) => z }, { label: 'b', f: (z) => z, axis: 'up' as never }])).some((m) => m.includes('axis "up"'))).toBe(true)
    expect(problems((p) => (p.y2 = { label: 'Speed', unit: 'm/s', from: 0 })).some((m) => m.includes('y2.from and y2.to'))).toBe(true)
    expect(problems((p) => (p.y2 = { label: 'Speed', unit: 'm/s', from: 5, to: 1 })).some((m) => m.includes('y2.from must be a finite number below y2.to'))).toBe(true)
    expect(problems((p) => (p.y2 = { label: ' ', unit: 'm/s' })).some((m) => m.includes('y2 needs a plain label'))).toBe(true)
  })
  it('a preset with no y2 and no right curve (every existing preset) is unaffected', () => {
    expect(problems((p) => { delete p.y2; p.curves = (q) => [{ label: 'field', f: (z) => 4 - q.k * z }] })).toEqual([])
  })
})
