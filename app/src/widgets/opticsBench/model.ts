/**
 * The pure state transitions of the `optics-bench` (no React): what a slider move does to the parameters, and the text of each readout.
 * `OpticsBench.tsx` calls these on every input event, and OpticsBench.test.tsx calls the same functions, so "moving a slider changes a
 * readout" is tested without a browser (the keyboard path itself is in e2e/notes.spec.ts).
 */
import { decimalsOf, fixed } from './plot'
import { defaultParams, type OpticsParams, type OpticsPreset } from './presets'

/** The new parameters after slider `key` is moved to `raw`: clamped to the slider's range and snapped to its step grid; an unknown key or a non-finite value changes nothing. */
export function setParam(preset: OpticsPreset, params: OpticsParams, key: string, raw: number): Record<string, number> {
  const s = preset.sliders.find((x) => x.key === key)
  if (!s || !Number.isFinite(raw)) return { ...params }
  const k = Math.round((Math.min(s.max, Math.max(s.min, raw)) - s.min) / s.step)
  const v = Math.min(s.max, s.min + k * s.step)
  return { ...params, [key]: Number(v.toFixed(decimalsOf(s.step) + 2)) }
}

/** Every slider back at its default. */
export const resetParams = defaultParams

/** A slider's value as shown beside it: fixed decimals of its step, then its unit. */
export function sliderText(preset: OpticsPreset, key: string, value: number): string {
  const s = preset.sliders.find((x) => x.key === key)
  return s ? `${fixed(value, decimalsOf(s.step))}${s.unit ? ` ${s.unit}` : ''}` : fixed(value, 2)
}

/** The readouts as the page prints them: label and `value unit` text. */
export const readoutRows = (preset: OpticsPreset, params: OpticsParams): { label: string; text: string }[] =>
  preset.readouts(params).map((r) => ({ label: r.label, text: `${fixed(r.value, r.digits)}${r.unit ? ` ${r.unit}` : ''}` }))
