/**
 * Validation of the `optics-bench` presets and of the widget specs that name them (the widget-spec gate, widgets/visualSpecs.test.tsx, and
 * the notes kit's `widget` check, content/qc709/optics/optics.test.ts, both call it). Pure: no React, no DOM. It lives beside the presets
 * so a preset that is added is checked by the same code a reader's page runs: an unknown preset, a slider whose default is off its
 * grid, a curve that is not finite across the axis, a readout with no digits: each is one message.
 */
import type { WidgetSpec } from '../../content/schema'
import { OPTICS_PRESETS, OPTICS_PRESET_IDS, defaultParams, hasPreset, type OpticsParams, type OpticsPreset } from './presets'

export const MAX_CURVES = 4
export const MAX_SLIDERS = 6
/** Samples a preset's curves are checked at (the widget draws more). */
const CHECK_SAMPLES = 60

const PRESET_ID_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/
const SLIDER_KEY_RE = /^[A-Za-z][A-Za-z0-9]*$/

const plainText = (s: unknown): s is string => typeof s === 'string' && s.trim().length > 0 && !/[<>`]/.test(s)

/** Every problem of one preset at once (empty = valid). Evaluates it at the defaults, with every slider at its minimum, and at its maximum. */
export function opticsPresetProblems(id: string, p: OpticsPreset): string[] {
  const out: string[] = []
  const bad = (msg: string) => out.push(`optics-bench preset "${id}": ${msg}`)
  if (!PRESET_ID_RE.test(id)) bad('the id must be kebab-case (lower case letters, digits, hyphens)')
  if (!plainText(p.title)) bad('title must be plain text')
  if (!plainText(p.question)) bad('question must be plain text')
  if (p.sliders.length > MAX_SLIDERS) bad(`has ${p.sliders.length} sliders (at most ${MAX_SLIDERS})`)
  const keys = new Set<string>()
  for (const s of p.sliders) {
    const at = `slider "${s.key}"`
    if (!SLIDER_KEY_RE.test(s.key)) bad(`${at}: the key must be letters and digits, starting with a letter`)
    if (keys.has(s.key)) bad(`${at}: duplicate key`)
    keys.add(s.key)
    if (!plainText(s.label)) bad(`${at}: label must be plain text`)
    if (typeof s.unit !== 'string') bad(`${at}: unit must be a string ('' for none)`)
    if (![s.min, s.max, s.step, s.default].every(Number.isFinite)) bad(`${at}: min, max, step and default must be finite numbers`)
    else {
      if (!(s.min < s.max)) bad(`${at}: min must be below max`)
      if (!(s.step > 0) || s.step > s.max - s.min) bad(`${at}: step must be positive and no larger than the range`)
      if (s.default < s.min || s.default > s.max) bad(`${at}: default ${s.default} is outside ${s.min} to ${s.max}`)
      const k = (s.default - s.min) / s.step
      if (Math.abs(k - Math.round(k)) > 1e-6) bad(`${at}: default ${s.default} is not on the step grid from ${s.min} by ${s.step}`)
    }
  }
  if (!plainText(p.x.label) || typeof p.x.unit !== 'string') bad('x needs a plain label and a unit string')
  if (!plainText(p.y.label) || typeof p.y.unit !== 'string') bad('y needs a plain label and a unit string')
  if (![p.x.from, p.x.to].every(Number.isFinite) || !(p.x.from < p.x.to)) bad('x.from must be a finite number below x.to')
  if ((p.y.from === undefined) !== (p.y.to === undefined)) bad('y.from and y.to are given together or not at all')
  else if (p.y.from !== undefined && p.y.to !== undefined && !(Number.isFinite(p.y.from) && Number.isFinite(p.y.to) && p.y.from < p.y.to)) bad('y.from must be a finite number below y.to')
  if (p.y2) {
    if (!plainText(p.y2.label) || typeof p.y2.unit !== 'string') bad('y2 needs a plain label and a unit string')
    if ((p.y2.from === undefined) !== (p.y2.to === undefined)) bad('y2.from and y2.to are given together or not at all')
    else if (p.y2.from !== undefined && p.y2.to !== undefined && !(Number.isFinite(p.y2.from) && Number.isFinite(p.y2.to) && p.y2.from < p.y2.to)) bad('y2.from must be a finite number below y2.to')
  }
  if (out.length) return out // the evaluation below needs a sound shape

  const at = (label: string, params: OpticsParams) => {
    const curves = p.curves(params)
    if (curves.length < 1 || curves.length > MAX_CURVES) bad(`${label}: ${curves.length} curves (one to ${MAX_CURVES})`)
    const names = new Set<string>()
    // the vertical axes: a curve names `left` (default) or `right`; `right` needs the preset's y2, y2 needs a curve on it, and the left axis needs one too
    for (const c of curves) if (c.axis !== undefined && c.axis !== 'left' && c.axis !== 'right') bad(`${label}: curve "${c.label}" has axis ${JSON.stringify(c.axis)} (left or right)`)
    const right = curves.filter((c) => c.axis === 'right')
    if (right.length > 0 && !p.y2) bad(`${label}: curve "${right[0].label}" reads the right axis but the preset has no y2`)
    if (p.y2 && right.length === 0) bad(`${label}: the preset declares y2 but no curve reads it (axis: 'right')`)
    if (curves.length > 0 && right.length === curves.length) bad(`${label}: every curve reads the right axis (at least one reads the left)`)
    for (const c of curves) {
      if (!plainText(c.label)) bad(`${label}: a curve label must be plain text`)
      if (names.has(c.label)) bad(`${label}: duplicate curve label "${c.label}"`)
      names.add(c.label)
      // read the raw values (`sample` turns a non-finite value into a gap, which is right for drawing but hides an infinity from this check)
      const raw = Array.from({ length: CHECK_SAMPLES + 1 }, (_, i) => c.f(p.x.from + ((p.x.to - p.x.from) * i) / CHECK_SAMPLES))
      if (raw.some((v) => v === Infinity || v === -Infinity)) bad(`${label}: curve "${c.label}" is infinite somewhere`)
      if (raw.filter(Number.isFinite).length < raw.length / 2) bad(`${label}: curve "${c.label}" is finite at fewer than half the sample points`)
    }
    for (const m of p.markers?.(params) ?? []) {
      if (!Number.isFinite(m.x)) bad(`${label}: a marker position is not finite`)
      if (!plainText(m.label)) bad(`${label}: a marker label must be plain text`)
    }
    const readouts = p.readouts(params)
    if (readouts.length < 1) bad(`${label}: no readouts`)
    for (const r of readouts) {
      if (!plainText(r.label) || typeof r.unit !== 'string') bad(`${label}: a readout needs a plain label and a unit string`)
      if (!Number.isFinite(r.value)) bad(`${label}: readout "${r.label}" is not finite`)
      if (!Number.isInteger(r.digits) || r.digits < 0 || r.digits > 8) bad(`${label}: readout "${r.label}" needs digits from 0 to 8`)
    }
  }
  const defaults = defaultParams(p)
  at('at the defaults', defaults)
  at('with every slider at its minimum', Object.fromEntries(p.sliders.map((s) => [s.key, s.min])))
  at('with every slider at its maximum', Object.fromEntries(p.sliders.map((s) => [s.key, s.max])))
  return out
}

/** Every preset in the table. */
export const opticsPresetsProblems = (table: Readonly<Record<string, OpticsPreset>> = OPTICS_PRESETS): string[] => Object.entries(table).flatMap(([id, p]) => opticsPresetProblems(id, p))

/**
 * The problems of one widget spec, for the notes kit (`NotesCheckOptions.widget`) and the widget-spec gate: only `optics-bench` specs are
 * judged here (another kind answers []): exactly one prop, `preset`, naming a registered preset, and that preset valid.
 */
export function opticsWidgetProblems(spec: WidgetSpec): string[] {
  if (spec.kind !== 'optics-bench') return []
  const props = (spec.props ?? {}) as Record<string, unknown>
  const out: string[] = []
  for (const k of Object.keys(props)) if (k !== 'preset') out.push(`optics-bench takes one prop, "preset", not "${k}"`)
  const id = props.preset
  if (!hasPreset(id)) out.push(`unknown optics-bench preset ${JSON.stringify(id)} (known: ${OPTICS_PRESET_IDS.join(', ')})`)
  else out.push(...opticsPresetProblems(id, OPTICS_PRESETS[id]))
  return out
}
