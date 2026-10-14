/**
 * `pauli-program` (Papers B3 / B4; SVG; P-B4-story §9.2 S-a): a program of Pauli operations on wires, read left to right. A column is one operation, drawn as the Pauli letters it puts on the wires it
 * touches (I is left out): a ROTATION by ±π/2 (`c+`, `c-`: Clifford, an outlined chip) or ±π/4 (`t+`, `t-`: T-like, a filled chip), a MEASUREMENT (a meter box, with its outcome sign when authored) or an
 * INJECTION of a magic state (a P⊗Z measurement and an X measurement on a magic lane below the wires; the lane is drawn for reading and is not a wire). Everything here is authored data: the
 * readouts are counts of the columns, no engine call is involved. Content writes the program; this module resolves, interpolates and validates it.
 *   program  built (B3): `{ wires, columns, labels? }` with `upTo` = how many columns are drawn plainly (later ones are dimmed);
 *   compile, branch  declared for chapter B4 (its Pauli-based compiler is not built yet): validation refuses them with a message naming the chapter.
 * Interpolation: the same program lerps `upTo` as whole steps; any other change switches at the half-way point. Lazy chunk (stage/svg/kinds.ts).
 */
import type { PauliProgramAngle, PauliProgramColumn, PauliProgramState } from '../../content/stage'
import { PAULI_PROGRAM_ANGLES } from '../../content/stage'
import type { SvgReadout } from '../svgKinds'
import type { PauliProgramInputs, ResolvedPauliProgram, ResolvedProgramColumn } from '../types'

/** Validation limits (P-B4-story §9.2 S-a): small enough that every letter stays readable at phone width. */
export const PAULI_PROGRAM_LIMITS = { wiresMax: 6, columnsMax: 24, labelMax: 3 } as const

/** The message a refused mode gives (chapter B4 builds the compiler; the types already carry the fields). */
export const programModeRefusal = (mode: 'compile' | 'branch'): string => `pauli-program ${mode} mode comes with chapter B4's compiler (not built yet)`

/** The drawn angle of a rotation code: plain Unicode. `c` = Clifford (±π/2), `t` = T-like (±π/4). */
export const TURN_LABEL: Readonly<Record<PauliProgramAngle, string>> = { 'c+': '+π/2', 'c-': '−π/2', 't+': '+π/4', 't-': '−π/4' }
/** The sign of an outcome bit: 0 → +, 1 → −. */
export const outcomeSign = (b: 0 | 1): string => (b === 0 ? '+' : '−')

const KEYS = ['kind', 'program', 'compile', 'branch', 'upTo', 'shot'] as const

/* ------------------------------------------------ resolve ------------------------------------------------ */

const lettersOf = (pauli: string): string[] => [...pauli]
const touchedOf = (letters: readonly string[]): number[] => letters.flatMap((ch, i) => (ch === 'I' ? [] : [i]))

function columnOf(c: PauliProgramColumn, index: number): ResolvedProgramColumn {
  if ('rot' in c) {
    const letters = lettersOf(c.rot.pauli)
    return { index, type: 'rot', letters, touched: touchedOf(letters), angle: c.rot.angle, turn: TURN_LABEL[c.rot.angle], tLike: c.rot.angle[0] === 't' }
  }
  if ('meas' in c) {
    const letters = lettersOf(c.meas.pauli)
    return { index, type: 'meas', letters, touched: touchedOf(letters), ...(c.meas.outcome !== undefined ? { outcome: c.meas.outcome } : {}) }
  }
  const letters = lettersOf(c.inject.pauli)
  return { index, type: 'inject', letters, touched: touchedOf(letters), ...(c.inject.s !== undefined ? { s: c.inject.s } : {}), ...(c.inject.t !== undefined ? { t: c.inject.t } : {}) }
}

/** Every derived field from the inputs (shared by resolve and interpolate). */
export function pauliProgramFrom(inp: PauliProgramInputs): ResolvedPauliProgram {
  const columns = inp.columns.map(columnOf)
  return {
    kind: 'pauli-program',
    mode: 'program',
    wires: inp.wires,
    labels: inp.labels,
    columns,
    upTo: inp.upTo,
    counts: {
      measurements: columns.filter((c) => c.type === 'meas').length,
      rotations: columns.filter((c) => c.type === 'rot').length,
      tCount: columns.filter((c) => c.type === 'rot' && c.tLike).length,
      injections: columns.filter((c) => c.type === 'inject').length,
    },
    hasLane: columns.some((c) => c.type === 'inject'),
    inputs: inp,
    shot: inp.shot,
  }
}

export function pauliProgramInputs(st: PauliProgramState): PauliProgramInputs {
  const p = st.program
  if (!p) throw new Error(st.compile ? programModeRefusal('compile') : st.branch ? programModeRefusal('branch') : 'pauli-program: needs a program')
  return {
    wires: p.wires,
    columns: p.columns,
    labels: p.labels ? [...p.labels] : Array.from({ length: p.wires }, (_, i) => String(i + 1)),
    upTo: st.upTo ?? p.columns.length,
    shot: st.shot,
  }
}

export function resolvePauliProgramStage(st: PauliProgramState, _s: number): ResolvedPauliProgram {
  void _s
  return pauliProgramFrom(pauliProgramInputs(st))
}

/* ------------------------------------------------ interpolation ------------------------------------------------ */

/** The same program (columns, wires, labels): `upTo` moves in whole steps; anything else switches at the half-way point. */
export function interpPauliProgramStage(a: ResolvedPauliProgram, b: ResolvedPauliProgram, t: number): ResolvedPauliProgram {
  if (t <= 0) return a
  if (t >= 1) return b
  const strip = (r: ResolvedPauliProgram) => JSON.stringify({ ...r.inputs, upTo: 0 })
  if (strip(a) === strip(b)) return pauliProgramFrom({ ...a.inputs, upTo: Math.round(a.upTo + (b.upTo - a.upTo) * t) })
  return t < 0.5 ? a : b
}

/* ------------------------------------------------ validation ------------------------------------------------ */

const isInt = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x)
const isBit = (x: unknown): x is 0 | 1 => x === 0 || x === 1

function pauliProblems(pauli: unknown, wires: number, where: string): string[] {
  if (typeof pauli !== 'string') return [`${where}.pauli: a string of ${wires} letters (I, X, Y, Z), one per wire`]
  if (pauli.length !== wires) return [`${where}.pauli: "${pauli}" must have exactly ${wires} letters, one per wire (I = untouched)`]
  if (!/^[IXYZ]+$/.test(pauli)) return [`${where}.pauli: "${pauli}" must use only the letters I, X, Y, Z`]
  if (/^I+$/.test(pauli)) return [`${where}.pauli: "${pauli}" touches no wire (at least one letter must not be I)`]
  return []
}

function columnProblems(c: unknown, wires: number, where: string): string[] {
  if (!c || typeof c !== 'object' || Array.isArray(c)) return [`${where}: a column is { rot }, { meas } or { inject }`]
  const keys = Object.keys(c)
  if (keys.length !== 1 || !['rot', 'meas', 'inject'].includes(keys[0])) return [`${where}: exactly one of rot, meas, inject (got ${keys.length ? keys.join(', ') : 'nothing'})`]
  const key = keys[0] as 'rot' | 'meas' | 'inject'
  const body = (c as Record<string, unknown>)[key]
  if (!body || typeof body !== 'object' || Array.isArray(body)) return [`${where}.${key}: an object with a pauli string`]
  const allowed: Record<typeof key, string[]> = { rot: ['pauli', 'angle'], meas: ['pauli', 'outcome'], inject: ['pauli', 's', 't'] }
  const errs: string[] = []
  for (const k of Object.keys(body)) if (!allowed[key].includes(k)) errs.push(`${where}.${key}.${k}: unknown field (allowed: ${allowed[key].join(', ')})`)
  const b = body as Record<string, unknown>
  errs.push(...pauliProblems(b.pauli, wires, `${where}.${key}`))
  if (key === 'rot' && !(PAULI_PROGRAM_ANGLES as readonly unknown[]).includes(b.angle)) errs.push(`${where}.rot.angle: ${PAULI_PROGRAM_ANGLES.map((a) => `'${a}'`).join(', ')} (c = Clifford ±π/2, t = T-like ±π/4)`)
  if (key === 'meas' && b.outcome !== undefined && !isBit(b.outcome)) errs.push(`${where}.meas.outcome: 0 (+) or 1 (−)`)
  if (key === 'inject') {
    if (b.s !== undefined && !isBit(b.s)) errs.push(`${where}.inject.s: 0 (+) or 1 (−)`)
    if (b.t !== undefined && !isBit(b.t)) errs.push(`${where}.inject.t: 0 (+) or 1 (−)`)
  }
  return errs
}

export function validatePauliProgramStage(st: PauliProgramState): string[] {
  const errs: string[] = []
  for (const k of Object.keys(st)) if (!(KEYS as readonly string[]).includes(k)) errs.push(`pauli-program ${k}: unknown field (allowed: ${KEYS.filter((x) => x !== 'kind').join(', ')})`)
  const modes = (['program', 'compile', 'branch'] as const).filter((m) => st[m] !== undefined)
  if (modes.length !== 1) return [...errs, `pauli-program: exactly one of program, compile, branch (got ${modes.length ? modes.join(' and ') : 'none'})`]
  if (modes[0] === 'compile' || modes[0] === 'branch') return [...errs, programModeRefusal(modes[0])]
  const p = st.program
  if (!p || typeof p !== 'object') return [...errs, 'pauli-program program: { wires, columns, labels? }']
  for (const k of Object.keys(p)) if (!['wires', 'columns', 'labels'].includes(k)) errs.push(`pauli-program program.${k}: unknown field (allowed: wires, columns, labels)`)
  if (!isInt(p.wires) || p.wires < 1 || p.wires > PAULI_PROGRAM_LIMITS.wiresMax) errs.push(`pauli-program program.wires: a whole number 1–${PAULI_PROGRAM_LIMITS.wiresMax}`)
  if (!Array.isArray(p.columns) || p.columns.length < 1 || p.columns.length > PAULI_PROGRAM_LIMITS.columnsMax) errs.push(`pauli-program program.columns: a list of 1–${PAULI_PROGRAM_LIMITS.columnsMax} columns`)
  if (errs.length) return errs
  p.columns.forEach((c, i) => errs.push(...columnProblems(c, p.wires, `pauli-program program.columns[${i}]`)))
  if (p.labels !== undefined) {
    if (!Array.isArray(p.labels) || p.labels.length !== p.wires) errs.push(`pauli-program program.labels: one label per wire (${p.wires})`)
    else
      p.labels.forEach((l, i) => {
        if (typeof l !== 'string' || [...l].length < 1 || [...l].length > PAULI_PROGRAM_LIMITS.labelMax || /\s/.test(l)) errs.push(`pauli-program program.labels[${i}]: 1–${PAULI_PROGRAM_LIMITS.labelMax} characters, no spaces`)
      })
  }
  if (st.upTo !== undefined && (!isInt(st.upTo) || st.upTo < 0 || st.upTo > p.columns.length)) errs.push(`pauli-program upTo: a whole number 0–${p.columns.length} (columns drawn plainly)`)
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`

/**
 * Counts of the authored columns (engine-free): "3 measurements" always (the first entry), then "7 rotations", "T-count 7" and "2 injections", each only when it is not zero.
 */
export function pauliProgramReadouts(r: ResolvedPauliProgram): SvgReadout[] {
  const c = r.counts
  const out: SvgReadout[] = [{ name: 'measurements', text: plural(c.measurements, 'measurement', 'measurements'), tone: 'state' }]
  if (c.rotations > 0) out.push({ name: 'rotations', text: plural(c.rotations, 'rotation', 'rotations'), tone: 'op' })
  if (c.tCount > 0) out.push({ name: 'tcount', text: `T-count ${c.tCount}`, tone: 'op' })
  if (c.injections > 0) out.push({ name: 'injections', text: plural(c.injections, 'injection', 'injections'), tone: 'silver' })
  return out
}

/** What one column is, in words (its accessible name). */
export function columnName(r: ResolvedPauliProgram, c: ResolvedProgramColumn): string {
  const on = c.touched.map((w) => `${c.letters[w]} on ${r.labels[w]}`).join(', ')
  const n = `column ${c.index + 1}`
  if (c.type === 'rot') return `${n}: ${c.tLike ? 'T-like' : 'Clifford'} rotation by ${c.turn} (${on})`
  if (c.type === 'meas') return `${n}: measurement of ${on}${c.outcome !== undefined ? `, outcome ${outcomeSign(c.outcome)}` : ''}`
  const s = c.s !== undefined ? `, P⊗Z outcome ${outcomeSign(c.s)}` : ''
  const t = c.t !== undefined ? `, X outcome ${outcomeSign(c.t)}` : ''
  return `${n}: magic-state injection through ${on}${s}${t}`
}

/** The accessible text of a picture: its readouts joined. */
export const pauliProgramSummary = (r: ResolvedPauliProgram): string => `Pauli program, ${r.wires} wire${r.wires === 1 ? '' : 's'}, ${r.columns.length} column${r.columns.length === 1 ? '' : 's'}; ${pauliProgramReadouts(r).map((x) => x.text).join('; ')}`
