/**
 * `pauli-program` (Papers B3 / B4; SVG; P-B4-story §9.2 S-a): a program of Pauli operations on wires, read left to right. A column is one operation, drawn as the Pauli letters it puts on the wires it
 * touches (I is left out): a ROTATION by ±π/2 (`c+`, `c-`: Clifford, an outlined chip) or ±π/4 (`t+`, `t-`: T-like, a filled chip), a MEASUREMENT (a meter box, with its outcome sign when authored) or an
 * INJECTION of a magic state (a P⊗Z measurement and an X measurement on a magic lane below the wires; the lane is drawn for reading and is not a wire). Everything here is authored data: the
 * readouts are counts of the columns, no engine call is involved. Content writes the program; this module resolves, interpolates and validates it.
 *   program  built (B3): `{ wires, columns, labels? }` with `upTo` = how many columns are drawn plainly (later ones are dimmed);
 *   compile  (B4) a preset circuit with its first `upTo` gates slid to the end by physics/qec/pbc.ts: the rotations collected so far with their current axes, a divider, then the gates not yet
 *            passed (H, S, CNOT, T as small symbols on their wires); the readouts (rotations, T-count, layers, the pending / final Clifford) are the engine's.
 *   branch   (B4) planned axes against the axes the injections really run about given the readings (physics/qec/inject.ts `axes`): one injection column each, tagged "X→−Y" where they differ.
 * Interpolation: the same program lerps `upTo` as whole steps; any other change switches at the half-way point. Lazy chunk (stage/svg/kinds.ts).
 */
import type { PauliProgramAngle, PauliProgramColumn, PauliProgramState } from '../../content/stage'
import { PAULI_PROGRAM_ANGLES } from '../../content/stage'
import type { SvgReadout } from '../svgKinds'
import { PBC_PRESETS, compile, compileAt, isClifford, type PbcGate, type Rotation } from '../../physics/qec/pbc'
import { axes as injectAxes } from '../../physics/qec/inject'
import type { PauliProgramInputs, ResolvedPauliProgram, ResolvedProgramColumn } from '../types'

/** Validation limits (P-B4-story §9.2 S-a): small enough that every letter stays readable at phone width. */
export const PAULI_PROGRAM_LIMITS = { wiresMax: 6, columnsMax: 24, labelMax: 3 } as const

/** Limits of the B4 modes: how many injections a branch plans. */
export const BRANCH_LIMITS = { axesMax: 6 } as const

/** The drawn angle of a rotation code: plain Unicode. `c` = Clifford (±π/2), `t` = T-like (±π/4). */
export const TURN_LABEL: Readonly<Record<PauliProgramAngle, string>> = { 'c+': '+π/2', 'c-': '−π/2', 't+': '+π/4', 't-': '−π/4' }
/** The sign of an outcome bit: 0 → +, 1 → −. */
export const outcomeSign = (b: 0 | 1): string => (b === 0 ? '+' : '−')

const KEYS = ['kind', 'program', 'compile', 'branch', 'upTo', 'shot'] as const

/* ------------------------------------------------ resolve ------------------------------------------------ */

const lettersOf = (pauli: string): string[] => [...pauli]
const touchedOf = (letters: readonly string[]): number[] => letters.flatMap((ch, i) => (ch === 'I' ? [] : [i]))

const flipT = (a: 't+' | 't-'): 't+' | 't-' => (a === 't+' ? 't-' : 't+')

/** A collected rotation as a column: the axis letters (no sign), and the effective turn about them (the axis sign folded into the angle). */
function rotationColumn(r: Rotation, index: number): ResolvedProgramColumn {
  const letters = lettersOf(r.pauli)
  const angle = r.sign < 0 ? flipT(r.angle) : r.angle
  return { index, type: 'rot', letters, touched: touchedOf(letters), angle, turn: TURN_LABEL[angle], tLike: true }
}
const GATE_TEXT: Record<string, string> = { H: 'H', S: 'S', Sdg: 'S†', T: 'T', Tdg: 'T†', CNOT: 'CNOT' }
/** A gate not yet passed, as a column: T and T† are T-like rotations about Z; a Clifford rotation of the input is an outlined chip; H, S, CNOT are symbols on their wires. */
function remainingColumn(g: PbcGate, index: number, wires: number): ResolvedProgramColumn {
  if (g.g === 'T' || g.g === 'Tdg') {
    const letters = Array.from({ length: wires }, (_, i) => (i === g.q ? 'Z' : 'I'))
    const angle = g.g === 'T' ? 't-' : 't+'
    return { index, type: 'rot', letters, touched: [g.q], angle, turn: TURN_LABEL[angle], tLike: true }
  }
  if (g.g === 'R') {
    const letters = lettersOf(g.pauli)
    return { index, type: 'rot', letters, touched: touchedOf(letters), angle: g.angle, turn: TURN_LABEL[g.angle], tLike: g.angle[0] === 't' }
  }
  if (g.g === 'CNOT') return { index, type: 'gate', gate: 'CNOT', letters: Array.from({ length: wires }, (_, i) => (i === g.c ? '●' : i === g.t ? '⊕' : 'I')), touched: [g.c, g.t].sort((a, b) => a - b) }
  return { index, type: 'gate', gate: GATE_TEXT[g.g], letters: Array.from({ length: wires }, (_, i) => (i === g.q ? GATE_TEXT[g.g] : 'I')), touched: [g.q] }
}

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

const plural0 = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`

/** Compile mode: the engine slides the first `upTo` gates of the preset to the end. */
function compileResolved(inp: PauliProgramInputs): ResolvedPauliProgram {
  const prog = PBC_PRESETS[inp.compile!.preset]
  const res = compileAt(prog, inp.compile!.upTo)
  const full = compile(prog)
  const placed = res.rotations.map((r, i) => rotationColumn(r, i))
  const rest = res.remaining.map((g, i) => remainingColumn(g, placed.length + i, prog.wires))
  const columns = [...placed, ...rest]
  const done = res.upTo === prog.gates.length
  const cliffordGates = prog.gates.filter(isClifford).length
  const info: NonNullable<ResolvedPauliProgram['info']> = []
  if (full.tCount === 0) {
    info.push({ name: 'rotations', text: plural0(cliffordGates, 'Clifford turn', 'Clifford turns'), tone: 'op' })
    info.push({ name: 'tcount', text: 'T-count 0', tone: 'op' })
  } else {
    info.push({ name: 'rotations', text: done ? plural0(full.tCount, 'rotation', 'rotations') : `${placed.length} of ${full.tCount} rotations placed`, tone: 'op' })
    info.push({ name: 'tcount', text: `T-count ${full.tCount}`, tone: 'op' })
    info.push({ name: 'layers', text: done ? `layers ${res.layers}` : `layers so far ${res.layers}`, tone: 'state' })
  }
  info.push({
    name: 'final',
    text: done ? (res.pendingIdentity ? 'final Clifford: identity' : `final Clifford: ${res.pendingName}`) : `pending Clifford: ${res.pendingIdentity ? 'so far identity' : plural0(res.passed, 'gate', 'gates')}`,
    tone: done && res.pendingIdentity ? 'plus' : 'silver',
  })
  if (res.changed > 0) info.push({ name: 'changed', text: `${plural0(res.changed, 'axis', 'axes')} changed`, tone: 'silver' })
  return {
    kind: 'pauli-program',
    mode: 'compile',
    wires: prog.wires,
    labels: prog.labels,
    columns,
    upTo: columns.length,
    counts: { measurements: 0, rotations: columns.filter((c) => c.type === 'rot').length, tCount: full.tCount, injections: 0 },
    hasLane: false,
    divider: placed.length > 0 && rest.length > 0 ? placed.length : null,
    info,
    inputs: inp,
    shot: inp.shot,
  }
}

/** Branch mode: one injection column each, on one wire, about the executed axis. */
function branchResolved(inp: PauliProgramInputs): ResolvedPauliProgram {
  const b = inp.branch!
  const r = injectAxes(b.axes, b.outcomes)
  const columns: ResolvedProgramColumn[] = r.executed.map((e, i) => ({
    index: i,
    type: 'inject',
    letters: [e.letter],
    touched: [0],
    s: b.outcomes[i],
    planned: b.axes[i],
    executed: e.text,
  }))
  const differ = columns.filter((c) => c.planned !== c.executed).length
  const info: NonNullable<ResolvedPauliProgram['info']> = [
    { name: 'injections', text: plural0(columns.length, 'injection', 'injections'), tone: 'silver' },
    { name: 'executed', text: `run about ${r.executed.map((e) => e.text).join(' ')}`, tone: 'op' },
    { name: 'changed', text: differ === 0 ? 'no axis changed' : `${plural0(differ, 'axis', 'axes')} changed`, tone: differ ? 'minus' : 'plus' },
    { name: 'pending', text: r.pending.length ? `pending Clifford: ${r.pending.map((p) => `${p.text}(π/2)`).join(' · ')}` : 'no pending Clifford', tone: 'silver' },
  ]
  return {
    kind: 'pauli-program',
    mode: 'branch',
    wires: 1,
    labels: ['1'],
    columns,
    upTo: columns.length,
    counts: { measurements: 0, rotations: 0, tCount: 0, injections: columns.length },
    hasLane: true,
    divider: null,
    info,
    inputs: inp,
    shot: inp.shot,
  }
}

/** Every derived field from the inputs (shared by resolve and interpolate). */
export function pauliProgramFrom(inp: PauliProgramInputs): ResolvedPauliProgram {
  if (inp.compile) return compileResolved(inp)
  if (inp.branch) return branchResolved(inp)
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
    divider: null,
    info: null,
    inputs: inp,
    shot: inp.shot,
  }
}

export function pauliProgramInputs(st: PauliProgramState): PauliProgramInputs {
  if (st.compile) return { wires: PBC_PRESETS[st.compile.preset].wires, columns: [], labels: [...PBC_PRESETS[st.compile.preset].labels], upTo: 0, compile: { preset: st.compile.preset, upTo: st.compile.upTo }, shot: st.shot }
  if (st.branch) return { wires: 1, columns: [], labels: ['1'], upTo: 0, branch: { axes: [...st.branch.axes], outcomes: [...st.branch.outcomes] }, shot: st.shot }
  const p = st.program
  if (!p) throw new Error('pauli-program: needs a program')
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
  const strip = (r: ResolvedPauliProgram) => JSON.stringify({ ...r.inputs, upTo: 0, ...(r.inputs.compile ? { compile: { ...r.inputs.compile, upTo: 0 } } : {}) })
  if (strip(a) === strip(b)) {
    if (a.inputs.compile && b.inputs.compile) return pauliProgramFrom({ ...a.inputs, compile: { ...a.inputs.compile, upTo: Math.round(a.inputs.compile.upTo + (b.inputs.compile.upTo - a.inputs.compile.upTo) * t) } })
    return pauliProgramFrom({ ...a.inputs, upTo: Math.round(a.upTo + (b.upTo - a.upTo) * t) })
  }
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
  if (modes[0] === 'compile') {
    const c = st.compile as NonNullable<PauliProgramState['compile']>
    if (!c || typeof c !== 'object') return [...errs, 'pauli-program compile: { preset, upTo }']
    for (const k of Object.keys(c)) if (!['preset', 'upTo'].includes(k)) errs.push(`pauli-program compile.${k}: unknown field (allowed: preset, upTo)`)
    if (!Object.hasOwn(PBC_PRESETS, c.preset)) return [...errs, `pauli-program compile.preset: ${Object.keys(PBC_PRESETS).map((x) => `'${x}'`).join(', ')}`]
    const n = PBC_PRESETS[c.preset].gates.length
    if (!isInt(c.upTo) || c.upTo < 0 || c.upTo > n) errs.push(`pauli-program compile.upTo: a whole number 0–${n} (gates slid to the end; ${c.preset} has ${n})`)
    if (st.upTo !== undefined) errs.push('pauli-program upTo: only the program mode has it (the compile mode says compile.upTo)')
    return errs
  }
  if (modes[0] === 'branch') {
    const b = st.branch as NonNullable<PauliProgramState['branch']>
    if (!b || typeof b !== 'object') return [...errs, 'pauli-program branch: { axes, outcomes }']
    for (const k of Object.keys(b)) if (!['axes', 'outcomes'].includes(k)) errs.push(`pauli-program branch.${k}: unknown field (allowed: axes, outcomes)`)
    if (!Array.isArray(b.axes) || b.axes.length < 1 || b.axes.length > BRANCH_LIMITS.axesMax || !b.axes.every((x) => x === 'X' || x === 'Y' || x === 'Z')) errs.push(`pauli-program branch.axes: 1–${BRANCH_LIMITS.axesMax} letters, each X, Y or Z`)
    else if (!Array.isArray(b.outcomes) || b.outcomes.length !== b.axes.length || !b.outcomes.every(isBit)) errs.push(`pauli-program branch.outcomes: one reading (0 even, 1 odd) per axis (${b.axes.length})`)
    if (st.upTo !== undefined) errs.push('pauli-program upTo: only the program mode has it')
    return errs
  }
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
  if (r.info) return r.info.map((x) => ({ name: x.name, text: x.text, tone: x.tone ?? 'state' }))
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
  if (c.type === 'gate') return `${n}: ${c.gate} gate, not yet passed (wires ${c.touched.map((w) => r.labels[w]).join(', ')})`
  if (c.type === 'inject' && c.planned !== undefined) return `${n}: injection planned about ${c.planned}, run about ${c.executed}${c.s !== undefined ? `, reading ${c.s === 0 ? 'even' : 'odd'}` : ''}`
  if (c.type === 'rot') return `${n}: ${c.tLike ? 'T-like' : 'Clifford'} rotation by ${c.turn} (${on})`
  if (c.type === 'meas') return `${n}: measurement of ${on}${c.outcome !== undefined ? `, outcome ${outcomeSign(c.outcome)}` : ''}`
  const s = c.s !== undefined ? `, P⊗Z outcome ${outcomeSign(c.s)}` : ''
  const t = c.t !== undefined ? `, X outcome ${outcomeSign(c.t)}` : ''
  return `${n}: magic-state injection through ${on}${s}${t}`
}

/** The accessible text of a picture: its readouts joined. */
export const pauliProgramSummary = (r: ResolvedPauliProgram): string => `Pauli program, ${r.wires} wire${r.wires === 1 ? '' : 's'}, ${r.columns.length} column${r.columns.length === 1 ? '' : 's'}; ${pauliProgramReadouts(r).map((x) => x.text).join('; ')}`
