/**
 * `timeline` (SVG; GANDALF platform G2, P-P2-story §9.2 and P-B6-story §9.2): ordered boxes on a time axis, one lane per row. Content (or a recipe, from physics/qec/timing.ts and the pages'
 * own segment builders) writes the boxes' kinds and times; this resolver only derives what the picture states: each row's end, each schedule's total (rows sharing a `group`: the largest
 * end), the axis span and the saving of the first schedule over the second. No physics is computed here, and none is typed by a story: the times are inputs from the engine. Lazy chunk
 * (stage/svg/kinds.ts); fidelity `timeline-*`.
 */
import { TIMELINE_READOUTS, TIMELINE_SEGMENT_KINDS, TIMELINE_UNITS, type TimelineState } from '../../content/stage'
import type { SvgReadout } from '../svgKinds'
import type { ResolvedTimeline, TimelineInputs } from '../types'
import { fix } from './draw'

export const TIMELINE_LIMITS = { rows: 8, perRow: 64, total: 200, marks: 4, label: 24, boxLabel: 12 } as const
const FIELDS = ['kind', 'rows', 'unit', 'marks', 'readouts', 'shot'] as const
const EPS = 1e-9

const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)

export function timelineInputs(st: TimelineState): TimelineInputs {
  return {
    rows: st.rows.map((r) => ({ label: r.label, group: r.group ?? r.label, segments: r.segments.map((s) => ({ kind: s.kind, from: s.from, to: s.to, label: s.label ?? null })) })),
    unit: st.unit ?? 'ms',
    marks: (st.marks ?? []).map((m) => ({ at: m.at, label: m.label })),
    readouts: st.readouts ? [...st.readouts] : ['total'],
    shot: st.shot,
  }
}

/** Every derived field from the inputs (shared by resolve and interpolate). */
export function timelineFrom(inp: TimelineInputs): ResolvedTimeline {
  const rows = inp.rows.map((r) => ({ ...r, end: r.segments.reduce((m, s) => Math.max(m, s.to), 0) }))
  const schedules: { name: string; end: number }[] = []
  for (const r of rows) {
    const s = schedules.find((x) => x.name === r.group)
    if (s) s.end = Math.max(s.end, r.end)
    else schedules.push({ name: r.group, end: r.end })
  }
  const span = Math.max(1e-9, ...rows.map((r) => r.end), ...inp.marks.map((m) => m.at))
  return { kind: 'timeline', rows, unit: inp.unit, marks: inp.marks, schedules, span, readouts: inp.readouts, inputs: inp, shot: inp.shot }
}

export const resolveTimelineStage = (st: TimelineState): ResolvedTimeline => timelineFrom(timelineInputs(st))

/** Boxes are authored times, not a continuum: a change of schedule switches at the half-way point, and the same shape with other times cross-fades the box edges. */
export function interpTimelineStage(a: ResolvedTimeline, b: ResolvedTimeline, t: number): ResolvedTimeline {
  if (t <= 0) return a
  if (t >= 1) return b
  const same = a.rows.length === b.rows.length && a.rows.every((r, i) => r.label === b.rows[i].label && r.group === b.rows[i].group && r.segments.length === b.rows[i].segments.length && r.segments.every((s, j) => s.kind === b.rows[i].segments[j].kind)) && a.marks.length === b.marks.length && a.unit === b.unit
  if (!same) return t < 0.5 ? a : b
  const mix = (x: number, y: number): number => x + (y - x) * t
  const pick = t < 0.5 ? a : b
  return timelineFrom({
    ...pick.inputs,
    rows: a.rows.map((r, i) => ({ label: r.label, group: r.group, segments: r.segments.map((s, j) => ({ kind: s.kind, from: mix(s.from, b.rows[i].segments[j].from), to: mix(s.to, b.rows[i].segments[j].to), label: pick.rows[i].segments[j].label })) })),
    marks: a.marks.map((m, i) => ({ at: mix(m.at, b.marks[i].at), label: pick.marks[i].label })),
  })
}

/* ------------------------------------------------ validation ------------------------------------------------ */
export function validateTimelineStage(st: TimelineState): string[] {
  const errs: string[] = []
  const o = st as unknown as Record<string, unknown>
  for (const k of Object.keys(o)) if (!(FIELDS as readonly string[]).includes(k)) errs.push(`timeline: unknown field "${k.slice(0, 40)}"`)
  const L = TIMELINE_LIMITS
  if (o.unit !== undefined && !(TIMELINE_UNITS as readonly unknown[]).includes(o.unit)) errs.push(`timeline unit: ${TIMELINE_UNITS.map((u) => `'${u}'`).join(', ')}`)
  const rows = o.rows
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > L.rows) errs.push(`timeline rows: one to ${L.rows} rows { label, group?, segments }`)
  else {
    let total = 0
    const names = new Set<string>()
    rows.forEach((r: unknown, i) => {
      const w = `timeline rows[${i}]`
      if (!isObj(r)) return void errs.push(`${w}: { label, group?, segments }`)
      for (const k of Object.keys(r)) if (k !== 'label' && k !== 'group' && k !== 'segments') errs.push(`${w}: unknown field "${k.slice(0, 40)}"`)
      if (typeof r.label !== 'string' || r.label.length < 1 || r.label.length > L.label) errs.push(`${w}.label: 1–${L.label} characters`)
      else if (names.has(r.label)) errs.push(`${w}.label: each row has its own label`)
      else names.add(r.label)
      if (r.group !== undefined && (typeof r.group !== 'string' || r.group.length < 1 || r.group.length > L.label)) errs.push(`${w}.group: 1–${L.label} characters`)
      const segs = r.segments
      if (!Array.isArray(segs) || segs.length < 1 || segs.length > L.perRow) return void errs.push(`${w}.segments: one to ${L.perRow} boxes`)
      total += segs.length
      let prev = 0
      segs.forEach((s: unknown, j) => {
        const sw = `${w}.segments[${j}]`
        if (!isObj(s)) return void errs.push(`${sw}: { kind, from, to, label? }`)
        for (const k of Object.keys(s)) if (!['kind', 'from', 'to', 'label'].includes(k)) errs.push(`${sw}: unknown field "${k.slice(0, 40)}"`)
        if (!(TIMELINE_SEGMENT_KINDS as readonly unknown[]).includes(s.kind)) errs.push(`${sw}.kind: ${TIMELINE_SEGMENT_KINDS.map((u) => `'${u}'`).join(', ')}`)
        if (!isNum(s.from) || !isNum(s.to) || s.from < 0 || !(s.to > s.from)) errs.push(`${sw}: 0 <= from < to, both finite`)
        else {
          if (s.from < prev - EPS) errs.push(`${sw}: boxes in a row are in order and do not overlap (from ${s.from} is before the previous box ends at ${prev})`)
          prev = s.to
        }
        if (s.label !== undefined && (typeof s.label !== 'string' || s.label.length < 1 || s.label.length > L.boxLabel)) errs.push(`${sw}.label: 1–${L.boxLabel} characters`)
      })
    })
    if (total > L.total) errs.push(`timeline: at most ${L.total} boxes in all`)
  }
  if (o.marks !== undefined) {
    if (!Array.isArray(o.marks) || o.marks.length > L.marks) errs.push(`timeline marks: at most ${L.marks} { at, label }`)
    else
      o.marks.forEach((m: unknown, i) => {
        if (!isObj(m)) return void errs.push(`timeline marks[${i}]: { at, label }`)
        for (const k of Object.keys(m)) if (k !== 'at' && k !== 'label') errs.push(`timeline marks[${i}]: unknown field "${k.slice(0, 40)}"`)
        if (!isNum(m.at) || m.at < 0) errs.push(`timeline marks[${i}].at: a time >= 0`)
        if (typeof m.label !== 'string' || m.label.length < 1 || m.label.length > L.label) errs.push(`timeline marks[${i}].label: 1–${L.label} characters`)
      })
  }
  if (o.readouts !== undefined) {
    const ro = o.readouts
    if (!Array.isArray(ro)) errs.push('timeline readouts: a list')
    else {
      for (const r of ro) if (!(TIMELINE_READOUTS as readonly unknown[]).includes(r)) errs.push(`timeline readouts: unknown "${String(r)}"`)
      if (new Set(ro).size !== ro.length) errs.push('timeline readouts: each once')
      if (ro.includes('saving') && Array.isArray(rows)) {
        const g = new Set(rows.map((r: unknown) => (isObj(r) ? String(r.group ?? r.label) : '')))
        if (g.size < 2) errs.push("timeline readouts: 'saving' needs two schedules (rows with two different groups)")
      }
    }
  }
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
export function timelineReadouts(r: ResolvedTimeline): SvgReadout[] {
  const out: SvgReadout[] = []
  for (const name of r.readouts) {
    if (name === 'total') for (const s of r.schedules) out.push({ name: `total-${s.name}`, text: `${s.name}: ${fix(s.end, 2)} ${r.unit}` })
    else if (name === 'saving' && r.schedules.length >= 2) {
      const [a, b] = r.schedules
      const d = a.end - b.end
      out.push({ name, text: `${a.name} − ${b.name}: ${fix(d, 2)} ${r.unit}${a.end > 0 ? ` (${fix((100 * d) / a.end, 1)} %)` : ''}`, tone: 'op' })
    }
  }
  return out
}
