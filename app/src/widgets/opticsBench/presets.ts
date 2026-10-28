/**
 * The `optics-bench` presets registry (a lazy module: it rides in the widget's own chunk, never the entry). A preset id maps to everything
 * the generic parameter-sweep bench needs: the sliders, the plot's axes, up to four curves, optional markers and the live readouts.
 *
 * THE RULE for a preset (checked by `opticsBench/validate.ts` and by the source lint in OpticsBench.test.tsx): no result is typed here.
 * Every curve value, marker position and readout comes from a call into the engine (physics/…, tested against numpy there); the slider
 * limits and the axis ranges are setup, not results. Keep `sliders`, `x` and `y` first in a preset: the lint reads from `curves:` on.
 *
 * Adding a preset = one entry here, one line of content (`widget: { kind: 'optics-bench', props: { preset: 'my-preset' } }` in a notes or
 * optics paragraph). No other file changes: the widget-spec gate (widgets/visualSpecs.test.tsx) reads this table, so an unknown id fails there.
 */
import { rabiFlipTime, rabiPeak } from '../../physics/dynamics'

export interface OpticsSlider {
  /** The key the preset's functions read from `p`: letters and digits, starting with a letter. */
  key: string
  /** Plain text, shown beside the slider. */
  label: string
  min: number
  max: number
  step: number
  default: number
  /** Shown after the value ('' for a pure number). */
  unit: string
}

export interface OpticsCurve {
  /** Plain text, in the legend. */
  label: string
  /** The curve's value at x (a non-finite value leaves a gap). */
  f: (x: number) => number
}

export interface OpticsMarker {
  x: number
  label: string
}

export interface OpticsReadout {
  label: string
  value: number
  unit: string
  /** Decimals shown (0 to 8). */
  digits: number
}

/** The slider values by key. */
export type OpticsParams = Readonly<Record<string, number>>

export interface OpticsPreset {
  /** The widget's title bar. */
  title: string
  /** The one question the bench lets a reader answer by moving the sliders. */
  question: string
  sliders: OpticsSlider[]
  x: { label: string; unit: string; from: number; to: number }
  /** `from` and `to` fix the vertical range (a probability); without them the range follows the curves. */
  y: { label: string; unit: string; from?: number; to?: number }
  /** One to four curves, drawn in this order. */
  curves: (p: OpticsParams) => OpticsCurve[]
  markers?: (p: OpticsParams) => OpticsMarker[]
  readouts: (p: OpticsParams) => OpticsReadout[]
}

/**
 * The demo preset: the Lorentzian resonance line of a driven two-level atom (Townsend §4.4, Fig. 4.6). Two drive strengths are drawn
 * together and a marker sits at a detuning the reader chooses; the readouts are the engine's `rabiPeak` (the curve's height) and
 * `rabiFlipTime` (the time of the first complete flip on resonance), in the engine's units of ħ = 1.
 */
const lorentzian: OpticsPreset = {
  title: 'Resonance line of a driven two-level atom',
  question: 'How wide is the resonance line, and what sets its width?',
  sliders: [
    { key: 'w1', label: 'Drive strength ω₁', min: 0.25, max: 4, step: 0.05, default: 1, unit: '1/τ' },
    { key: 'w2', label: 'Comparison drive ω₁′', min: 0.25, max: 4, step: 0.05, default: 2, unit: '1/τ' },
    { key: 'delta', label: 'Marked detuning δ', min: -6, max: 6, step: 0.05, default: 1, unit: '1/τ' },
  ],
  x: { label: 'Detuning δ = ω₀ − ω', unit: '1/τ', from: -6, to: 6 },
  y: { label: 'Largest flip chance', unit: '', from: 0, to: 1 },
  curves: (p) => [
    { label: 'drive ω₁', f: (x) => rabiPeak(x, p.w1) },
    { label: 'comparison drive ω₁′', f: (x) => rabiPeak(x, p.w2) },
  ],
  markers: (p) => [{ x: p.delta, label: 'δ' }],
  readouts: (p) => [
    { label: 'Height at δ, drive ω₁', value: rabiPeak(p.delta, p.w1), unit: '', digits: 3 },
    { label: 'Height at δ, drive ω₁′', value: rabiPeak(p.delta, p.w2), unit: '', digits: 3 },
    { label: 'Height on resonance', value: rabiPeak(0, p.w1), unit: '', digits: 3 },
    { label: 'First full flip on resonance', value: rabiFlipTime(p.w1), unit: 'τ', digits: 2 },
  ],
}

/** Every preset by id (kebab-case). The widget-spec gate and `OpticsBench` read this table. */
export const OPTICS_PRESETS: Readonly<Record<string, OpticsPreset>> = { lorentzian }

export const OPTICS_PRESET_IDS: readonly string[] = Object.keys(OPTICS_PRESETS)

/** Is this a registered preset id? (an own key: `toString` and friends are not presets) */
export const hasPreset = (id: unknown): id is string => typeof id === 'string' && Object.prototype.hasOwnProperty.call(OPTICS_PRESETS, id)

/** The slider values a preset opens with. */
export const defaultParams = (preset: OpticsPreset): Record<string, number> => Object.fromEntries(preset.sliders.map((s) => [s.key, s.default]))
