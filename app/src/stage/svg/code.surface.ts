/**
 * `code` additions of the Papers background chapter B1 (P-B1-story §9.2 K-C): three more SOURCES besides a registry id, each built by the engine, never typed in:
 *   toric    Kitaev's toric code on an L × M torus (physics/qec/toric.ts): one qubit on each edge of a wrapped grid, an X check (star) at each vertex, a Z check (plaquette) at each face;
 *   rotated  the rotated surface-code patch of odd distance d (physics/qec/codes.ts rotatedSurfaceCode): data qubits on a grid, the checks as faces (weight 4) and half-discs (weight 2);
 *   planar   the unrotated planar code (physics/qec/planar.ts planarSurfaceCode): the hypergraph product of two open repetition codes, a staggered grid of qubits and checks.
 * Views: 'torus' (toric), 'patch' (rotated, planar) and the Tanner graph 'layout' (all three, within the layout's 25 qubits and 24 checks).
 * Overlays (all optional): a FAULT (a Pauli on listed qubits; with show: ['syndrome'] the checks that read −1 light up), an OPERATOR (and a second one) drawn as letters on its support
 * with its weight, the checks it lights, what it is (a stabilizer or a logical operator) and the overlap of the two, and for a rotated patch a SCHEDULE: the order in which each check's
 * circuit touches the corners of its face (spokes numbered by the engine's step), the neighbouring X / Z pairs read in clashing order outlined (physics/qec/schedule.ts).
 * This file builds the ResolvedCode of those sources; stage/svg/code.ts dispatches to it and stage/svg/CodeSurfaceScene.tsx draws it.
 */
import type { CodeOperatorName, CodeShow, CodeState } from '../../content/stage'
import { CODE_CORNERS, CODE_PATCH_OPERATORS, CODE_SHOW, CODE_TORIC_OPERATORS, CODE_VIEWS } from '../../content/stage'
import { CSSCode, rotatedSurfaceCode } from '../../physics/qec/codes'
import { planarSurfaceCode } from '../../physics/qec/planar'
import { checkSteps, patchChecks, scheduleCheck, type PatchCheck } from '../../physics/qec/schedule'
import { toricCode, toricInStabilizer, toricOperator } from '../../physics/qec/toric'
import type { SvgReadout } from '../svgKinds'
import type { CodeInputs, CodeLetter, ResolvedCode, ResolvedCodeCheck, ResolvedCodeEdge, ResolvedCodePlaquette, ResolvedCodeQubit, ResolvedSurface, ResolvedSurfaceOperator } from '../types'

/** Limits (P-B1-story §9.2): a torus up to 8 × 8 (128 qubits), a patch of at most 97 data qubits, one fault and one operator (+ operator2) at a time. */
export const SURFACE_LIMITS = { torusMax: 8, torusQubits: 128, rotatedMax: 9, planarMax: 7, patchQubits: 97, faultQubits: 24, layoutQubits: 25, layoutChecks: 24 } as const

const MINUS = '−'
export type SurfaceSource = 'toric' | 'rotated' | 'planar'

/** Which of the new sources a state names (null: none; several is a validation error). */
export function surfaceSources(st: Pick<CodeState, 'toric' | 'rotated' | 'planar'>): SurfaceSource[] {
  return (['toric', 'rotated', 'planar'] as const).filter((k) => st[k] !== undefined)
}

const isInt = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x)

/* ------------------------------------------------ the model ------------------------------------------------ */
interface Model {
  source: SurfaceSource
  id: string
  name: string
  L: number
  M: number
  d: number
  css: CSSCode
  n: number
  /** The checks in the order they are drawn and numbered: X first for toric / planar; the engine's own list for the rotated patch. */
  checks: { kind: 'X' | 'Z'; support: number[]; row: number; pos: [number, number]; label: string }[]
  qubitPos: [number, number][]
  /** The patch faces (rotated), and the engine's check list with corners (rotated). */
  faces: ResolvedCodePlaquette[]
  patch: PatchCheck[] | null
  /** The torus' tile and wrap arrows. */
  frame: [number, number, number, number] | null
  wraps: ResolvedSurface['wraps']
  operator(name: CodeOperatorName, at: number): { type: 'X' | 'Z'; qubits: number[] }
  inStabilizer(type: 'X' | 'Z', qubits: readonly number[]): boolean
}

const MODELS = new Map<string, Model>()

const ringOf = (points: [number, number][]): [number, number][] => {
  const cx = points.reduce((s, p) => s + p[0], 0) / points.length
  const cy = points.reduce((s, p) => s + p[1], 0) / points.length
  return [...points].sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx))
}

const numbered = (kind: 'X' | 'Z', k: number): string => `${kind}${k + 1}`

function buildToric(L: number, M: number, view: 'layout' | 'torus'): Model {
  const t = toricCode(L, M)
  const cells = L * M
  const checks: Model['checks'] = []
  const torus = view === 'torus'
  // layout (the Tanner graph): four columns, stars | h edges | v edges | plaquettes, one row for each cell, the v edges half a row lower so no edge passes through a disc
  const qubitPos: [number, number][] = t.edges.map((e) => {
    const c = e.j * L + e.i
    if (torus) return e.dir === 'h' ? [e.i + 0.5, -e.j] : [e.i, -(e.j + 0.5)]
    return e.dir === 'h' ? [2.5, c] : [5, c + 0.5]
  })
  t.stars.forEach((s, c) => checks.push({ kind: 'X', support: [...s].sort((a, b) => a - b), row: c, pos: torus ? [c % L, -Math.floor(c / L)] : [0, c], label: numbered('X', c) }))
  t.plaquettes.forEach((p, c) => checks.push({ kind: 'Z', support: [...p].sort((a, b) => a - b), row: c, pos: torus ? [(c % L) + 0.5, -(Math.floor(c / L) + 0.5)] : [7.5, c], label: numbered('Z', c) }))
  const wraps: Model['wraps'] = []
  for (let j = 0; j < M; j++) {
    const q = t.hEdge(L - 1, j)
    wraps.push({ x: L - 0.5, y: -j, dir: 'E', qubit: q, end: 'out' }, { x: -0.5, y: -j, dir: 'E', qubit: q, end: 'in' })
  }
  for (let i = 0; i < L; i++) {
    const q = t.vEdge(i, M - 1)
    wraps.push({ x: i, y: -(M - 0.5), dir: 'N', qubit: q, end: 'out' }, { x: i, y: 0.5, dir: 'N', qubit: q, end: 'in' })
  }
  void cells
  return {
    source: 'toric',
    id: `toric-${L}x${M}`,
    name: `toric code ${L} × ${M}`,
    L,
    M,
    d: Math.min(L, M),
    css: t.code,
    n: t.n,
    checks,
    qubitPos,
    faces: [],
    patch: null,
    frame: torus ? [-0.5, -(M - 0.5), L - 0.5, 0.5] : null,
    wraps: torus ? wraps : [],
    operator: (name, at) => toricOperator(t, name as Parameters<typeof toricOperator>[1], at),
    inStabilizer: (type, qubits) => toricInStabilizer(t, type, qubits),
  }
}

function buildRotated(d: number): Model {
  const r = rotatedSurfaceCode(d)
  const patch = patchChecks(d)
  const count = { X: 0, Z: 0 }
  const qubitPos = r.data.map((p) => [p[0], p[1]] as [number, number])
  const checks: Model['checks'] = r.checks.map((c) => {
    const row = count[c.type]++
    return { kind: c.type, support: [...c.qubits], row, pos: [c.center[0], c.center[1]], label: numbered(c.type, row) }
  })
  const faces: ResolvedCodePlaquette[] = r.checks.map((c, i) => {
    const pts = c.qubits.map((q) => qubitPos[q])
    return { checks: [i], kind: c.type, points: ringOf(pts), apex: pts.length === 2 ? [c.center[0], c.center[1]] : null }
  })
  return {
    source: 'rotated',
    id: `rotated-${d}`,
    name: `rotated surface code d = ${d}`,
    L: 0,
    M: 0,
    d,
    css: r.code,
    n: d * d,
    checks,
    qubitPos,
    faces,
    patch,
    frame: null,
    wraps: [],
    operator: (name) => (name === 'xbar' ? { type: 'X', qubits: [...r.logicalX] } : { type: 'Z', qubits: [...r.logicalZ] }),
    inStabilizer: (type, qubits) => bitsIn(r.code, type, qubits),
  }
}

/** Is a pure-X (pure-Z) operator a product of the code's X (Z) checks? */
function bitsIn(code: CSSCode, type: 'X' | 'Z', qubits: readonly number[]): boolean {
  const bits = new Array<number>(code.n).fill(0)
  for (const q of qubits) bits[q] ^= 1
  return (type === 'X' ? code.HX : code.HZ).rowspaceContains(bits)
}

function buildPlanar(d: number): Model {
  const p = planarSurfaceCode(d)
  const first = d * d
  // data qubit (a, b) of the first block is number a·d + b at (a, b); (r, c) of the second block is number d² + r·(d − 1) + c at (r + ½, c + ½)
  const qubitPos: [number, number][] = Array.from({ length: p.n }, (_, q) => (q < first ? [Math.floor(q / d), q % d] : [Math.floor((q - first) / (d - 1)) + 0.5, ((q - first) % (d - 1)) + 0.5]))
  const checks: Model['checks'] = []
  for (let i = 0; i < p.code.HX.rows; i++) checks.push({ kind: 'X', support: p.code.HX.rowSupport(i), row: i, pos: [Math.floor(i / d) + 0.5, i % d], label: numbered('X', i) })
  for (let i = 0; i < p.code.HZ.rows; i++) checks.push({ kind: 'Z', support: p.code.HZ.rowSupport(i), row: i, pos: [Math.floor(i / (d - 1)), (i % (d - 1)) + 0.5], label: numbered('Z', i) })
  return {
    source: 'planar',
    id: `planar-${d}`,
    name: `planar surface code d = ${d}`,
    L: 0,
    M: 0,
    d,
    css: p.code,
    n: p.n,
    checks,
    qubitPos,
    faces: [],
    patch: null,
    frame: null,
    wraps: [],
    // X on the first block's column a = 0 (it commutes with every Z check and anticommutes with Z̄ at one qubit); Z on its row b = 0
    operator: (name) => (name === 'xbar' ? { type: 'X', qubits: Array.from({ length: d }, (_, b) => b) } : { type: 'Z', qubits: Array.from({ length: d }, (_, a) => a * d) }),
    inStabilizer: (type, qubits) => bitsIn(p.code, type, qubits),
  }
}

/** The engine's model of the source a state names, for a view (the toric positions depend on it). Memoized. */
export function modelFor(inp: CodeInputs): Model {
  const view = inp.view
  const key = JSON.stringify([inp.toric, inp.rotated, inp.planar, view === 'torus' ? 'torus' : 'layout'])
  const hit = MODELS.get(key)
  if (hit) return hit
  let m: Model
  if (inp.toric) m = buildToric(inp.toric.L, inp.toric.M ?? inp.toric.L, view === 'torus' ? 'torus' : 'layout')
  else if (inp.rotated) m = buildRotated(inp.rotated.d)
  else m = buildPlanar((inp.planar as { d: number }).d)
  if (MODELS.size > 16) MODELS.delete(MODELS.keys().next().value as string)
  MODELS.set(key, m)
  return m
}

/** The view a state with no `view` gets: the picture natural to its source. */
export const defaultViewOf = (st: Pick<CodeState, 'toric' | 'rotated' | 'planar'> & { surgery?: unknown }): 'torus' | 'patch' | 'layout' => (st.toric ? 'torus' : st.rotated || st.planar || st.surgery ? 'patch' : 'layout')

/* ------------------------------------------------ resolve ------------------------------------------------ */
const letterOf = (type: 'X' | 'Y' | 'Z'): CodeLetter => type

/** The checks (indices into the model's list) that read −1 on a pure-X, pure-Z or Y fault: a Z part lights the X checks, an X part the Z checks. */
function litBy(m: Model, type: 'X' | 'Y' | 'Z', qubits: readonly number[]): number[] {
  const bits = new Array<number>(m.n).fill(0)
  for (const q of qubits) bits[q] ^= 1
  const xPart = type !== 'Z'
  const zPart = type !== 'X'
  const hx = zPart ? m.css.HX.mulVec(bits) : []
  const hz = xPart ? m.css.HZ.mulVec(bits) : []
  return m.checks.flatMap((c, i) => ((c.kind === 'X' ? hx[c.row] : hz[c.row]) ? [i] : []))
}

function operatorOf(m: Model, name: CodeOperatorName, at: number): ResolvedSurfaceOperator {
  const op = m.operator(name, at)
  const qubits = [...op.qubits].sort((a, b) => a - b)
  const lit = litBy(m, op.type, qubits)
  return { name, type: op.type, qubits, weight: qubits.length, lit, classification: lit.length ? 'detected' : m.inStabilizer(op.type, qubits) ? 'stabilizer' : 'logical operator' }
}

const flipWords = (labels: readonly string[]): string => {
  if (labels.length === 0) return 'all checks read +1'
  if (labels.length > 4) return `${labels.length} checks read ${MINUS}1`
  return `${labels.join(labels.length === 4 ? ',' : ', ')} read${labels.length === 1 ? 's' : ''} ${MINUS}1`
}

/** Every derived field from the inputs of a toric / rotated / planar source. */
export function buildSurface(inp: CodeInputs): ResolvedCode {
  const m = modelFor(inp)
  const view = inp.view
  const n = m.n
  const showSyn = inp.show.includes('syndrome')
  const fault = inp.fault ?? null
  const litSet = new Set(fault ? litBy(m, fault.type, fault.qubits) : [])
  const op1 = inp.operator ? operatorOf(m, inp.operator, inp.at ?? 0) : null
  const op2 = inp.operator2 ? operatorOf(m, inp.operator2, inp.at ?? 0) : null
  const in1 = new Set(op1?.qubits ?? [])
  const in2 = new Set(op2?.qubits ?? [])
  const overlap = [...in1].filter((q) => in2.has(q)).sort((a, b) => a - b)
  const faultSet = new Set(fault?.qubits ?? [])

  // the schedule of a rotated patch: the engine's steps, clashes and flagged pairs
  const sched = inp.schedule && m.patch ? inp.schedule : null
  const schedResult = sched ? scheduleCheck(m.d, sched.xOrder, sched.zOrder) : null
  const stepsOf = (i: number) => (sched && m.patch ? checkSteps(m.patch[i], sched.xOrder, sched.zOrder) : null)
  const flagged = new Set<number>()
  for (const v of schedResult?.violations ?? []) {
    flagged.add(v.x)
    flagged.add(v.z)
  }
  const clashQubits = new Set((schedResult?.clashes ?? []).map((c) => c.qubit))

  const qubitNames = (q: number): string => {
    if (m.source === 'toric') {
      const e = q < m.L * m.M ? `h(${q % m.L}, ${Math.floor(q / m.L)})` : `v(${(q - m.L * m.M) % m.L}, ${Math.floor((q - m.L * m.M) / m.L)})`
      return `edge qubit ${q}, ${e}`
    }
    return `data qubit ${q}`
  }
  const qubits: ResolvedCodeQubit[] = m.qubitPos.map(([x, y], q) => {
    const hit = faultSet.has(q) ? letterOf(fault!.type) : null
    const o1 = in1.has(q) && op1 ? letterOf(op1.type) : null
    const o2 = in2.has(q) && op2 ? letterOf(op2.type) : null
    const notes = [hit && `fault ${hit}`, o1 && `in the operator as ${o1}`, o2 && `in the second operator as ${o2}`, o1 && o2 && 'in both', clashQubits.has(q) && 'two checks reach it in one step'].filter(Boolean)
    const name = qubitNames(q)
    return {
      index: q,
      x,
      y,
      label: String(q),
      family: null,
      cell: null,
      error: hit,
      correction: null,
      residual: null,
      logical: null,
      operator: o1,
      operator2: o2,
      overlap: !!(o1 && o2),
      clash: clashQubits.has(q),
      aria: notes.length ? `${name}: ${notes.join(', ')}` : name,
    }
  })
  const checks: ResolvedCodeCheck[] = m.checks.map((c, i) => {
    const flipped = fault && showSyn ? ((litSet.has(i) ? 1 : 0) as 0 | 1) : null
    const kindName = m.source === 'toric' ? (c.kind === 'X' ? 'star' : 'plaquette') : `${c.kind} check`
    const what = `${kindName} ${c.label} on ${c.support.length} qubits`
    const steps = stepsOf(i)
    return {
      index: i,
      x: c.pos[0],
      y: c.pos[1],
      kind: c.kind,
      label: c.label,
      letters: '',
      support: c.support,
      flipped,
      ...(steps ? { steps, flagged: flagged.has(i) } : {}),
      aria: flipped === null ? what : `${what}, reads ${flipped ? `${MINUS}1` : '+1'}`,
    }
  })
  const edges: ResolvedCodeEdge[] = view === 'layout' ? checks.flatMap((c) => c.support.map((q) => ({ check: c.index, qubit: q, letter: c.kind as CodeLetter }))) : []

  // everything drawn lies inside these bounds
  const xs = [...m.qubitPos, ...checks.map((c) => [c.x, c.y] as [number, number])].map((p) => p[0])
  const ys = [...m.qubitPos, ...checks.map((c) => [c.x, c.y] as [number, number])].map((p) => p[1])
  if (m.frame) {
    xs.push(m.frame[0], m.frame[2])
    ys.push(m.frame[1], m.frame[3])
  }
  const bounds: [number, number, number, number] = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]

  const weights: Record<string, number> = {}
  for (const c of m.checks) weights[c.support.length] = (weights[c.support.length] ?? 0) + 1
  const surface: ResolvedSurface = {
    source: m.source,
    L: m.L,
    M: m.M,
    d: m.d,
    frame: m.frame,
    wraps: m.wraps,
    fault: fault ? { type: fault.type, qubits: [...fault.qubits], lit: [...litSet].sort((a, b) => a - b) } : null,
    operator: op1,
    operator2: op2,
    overlap,
    weights: inp.show.includes('weights'),
    highlight: inp.show.includes('stars') ? 'X' : inp.show.includes('plaquettes') ? 'Z' : null,
    schedule:
      sched && schedResult
        ? { xOrder: [...sched.xOrder], zOrder: [...sched.zOrder], conflictFree: schedResult.conflictFree, valid: schedResult.valid, violations: schedResult.violations.map((v) => ({ ...v, shared: [...v.shared] })), clashes: schedResult.clashes.map((c) => ({ ...c })) }
        : null,
    counts: { x: m.checks.filter((c) => c.kind === 'X').length, z: m.checks.filter((c) => c.kind === 'Z').length, weights },
  }
  const syndrome = fault && showSyn ? checks.map((c) => c.flipped).join('') : null
  return {
    kind: 'code',
    id: m.id,
    name: m.name,
    family: m.source,
    view,
    n,
    k: m.css.k,
    rank: n - m.css.k,
    distance: { d: null, reported: null, exact: false },
    qubits,
    checks,
    edges,
    plaquettes: view === 'patch' ? m.faces : [],
    bounds,
    error: null,
    correction: null,
    residual: null,
    show: inp.show,
    correctionSource: null,
    residualKind: null,
    syndrome,
    logical: null,
    tile: null,
    table: null,
    words: null,
    surface,
    inputs: inp,
    shot: inp.shot,
  }
}

/* ------------------------------------------------ validation ------------------------------------------------ */
const dup = (xs: readonly unknown[]): boolean => new Set(xs).size !== xs.length

/** Problems with a state that names a toric, rotated or planar source (or several sources, or none). [] = valid. */
export function validateSurfaceStage(st: CodeState): string[] {
  const errs: string[] = []
  const where = (f: string) => `code ${f}`
  const named = surfaceSources(st)
  const count = named.length + (st.code !== undefined ? 1 : 0)
  if (count !== 1) return [`code: exactly one of code, toric, rotated, planar${count === 0 ? ' (name a registry id or one of the three sources)' : ''}`]
  if (named.length === 0) return []
  const source = named[0]
  let n = 0
  let checkCount = 0
  if (source === 'toric') {
    const t = st.toric
    const M = t?.M ?? t?.L
    if (!t || !isInt(t.L) || t.L < 2 || t.L > SURFACE_LIMITS.torusMax || !isInt(M) || M < 2 || M > SURFACE_LIMITS.torusMax) return [`${where('toric')}: { L, M? } whole numbers from 2 to ${SURFACE_LIMITS.torusMax}`]
    n = 2 * t.L * M
    checkCount = 2 * t.L * M
  } else if (source === 'rotated') {
    const d = st.rotated?.d
    if (!isInt(d) || d < 3 || d > SURFACE_LIMITS.rotatedMax || d % 2 === 0) return [`${where('rotated')}: { d } an odd whole number from 3 to ${SURFACE_LIMITS.rotatedMax}`]
    n = d * d
    checkCount = d * d - 1
  } else {
    const d = st.planar?.d
    if (!isInt(d) || d < 3 || d > SURFACE_LIMITS.planarMax || d % 2 === 0) return [`${where('planar')}: { d } an odd whole number from 3 to ${SURFACE_LIMITS.planarMax}`]
    n = d * d + (d - 1) * (d - 1)
    checkCount = 2 * d * (d - 1)
  }
  if (n > SURFACE_LIMITS.torusQubits) errs.push(`${where(source)}: ${n} qubits; at most ${SURFACE_LIMITS.torusQubits}`)
  const view = st.view ?? defaultViewOf(st)
  if (!(CODE_VIEWS as readonly string[]).includes(view)) return [...errs, `code view: ${CODE_VIEWS.map((v) => `'${v}'`).join(', ')}`]
  const allowed = source === 'toric' ? ['layout', 'torus'] : ['layout', 'patch']
  if (!allowed.includes(view)) errs.push(`${where('view')}: a ${source} source is drawn as ${allowed.map((v) => `'${v}'`).join(' or ')}, not '${view}'`)
  else if (view === 'layout' && (n > SURFACE_LIMITS.layoutQubits || checkCount > SURFACE_LIMITS.layoutChecks))
    errs.push(`${where('view')}: this ${source} source has ${n} qubits and ${checkCount} checks; the layout draws at most ${SURFACE_LIMITS.layoutQubits} qubits and ${SURFACE_LIMITS.layoutChecks} checks (use the '${allowed[1]}' view)`)
  for (const [f, v] of [['bb', st.bb], ['bp', st.bp], ['check', st.check], ['longEdges', st.longEdges], ['pattern', st.pattern], ['cycle', st.cycle]] as const) if (v !== undefined) errs.push(`${where(f)}: only a bb or bp source takes it`)
  // fields that belong to the registered codes
  for (const [f, v] of [['error', st.error], ['correction', st.correction], ['errors', st.errors], ['word', st.word], ['focus', st.focus], ['shift', st.shift], ['measure', st.measure]] as const)
    if (v !== undefined) errs.push(`${where(f)}: only a registry code takes it (a ${source} source takes \`fault\` and \`operator\`)`)
  // show
  const show = st.show ?? []
  if (!Array.isArray(show) || !show.every((x) => (CODE_SHOW as readonly string[]).includes(x))) errs.push(`${where('show')}: a list of ${CODE_SHOW.map((v) => `'${v}'`).join(', ')}`)
  else {
    if (dup(show)) errs.push(`${where('show')}: each name once`)
    for (const name of ['correction', 'residual'] as CodeShow[]) if (show.includes(name)) errs.push(`${where('show')}: '${name}' is for a registry code; a ${source} source shows a \`fault\``)
    if (show.includes('syndrome') && st.fault === undefined) errs.push(`${where('show')}: 'syndrome' needs a \`fault\``)
    if (show.includes('logical') && st.operator === undefined) errs.push(`${where('show')}: 'logical' draws the \`operator\`; give one`)
    if ((show.includes('stars') || show.includes('plaquettes')) && source !== 'toric') errs.push(`${where('show')}: 'stars' and 'plaquettes' highlight a toric code's checks`)
    if (show.includes('stars') && show.includes('plaquettes')) errs.push(`${where('show')}: 'stars' or 'plaquettes', not both`)
  }
  // the fault
  if (st.fault !== undefined) {
    const f = st.fault
    if (!f || !['X', 'Y', 'Z'].includes(f.type)) errs.push(`${where('fault.type')}: 'X', 'Y' or 'Z'`)
    if (!f || !Array.isArray(f.qubits) || f.qubits.length < 1 || f.qubits.length > SURFACE_LIMITS.faultQubits) errs.push(`${where('fault.qubits')}: one to ${SURFACE_LIMITS.faultQubits} qubit numbers`)
    else if (!f.qubits.every((q) => isInt(q) && q >= 0 && q < n)) errs.push(`${where('fault.qubits')}: qubit numbers from 0 to ${n - 1} (the engine's, counted from 0)`)
    else if (dup(f.qubits)) errs.push(`${where('fault.qubits')}: each qubit once`)
  }
  // the operators
  const names: readonly string[] = source === 'toric' ? CODE_TORIC_OPERATORS : CODE_PATCH_OPERATORS
  for (const [f, v] of [['operator', st.operator], ['operator2', st.operator2]] as const) {
    if (v === undefined) continue
    if (!names.includes(v)) errs.push(`${where(f)}: a ${source} source draws ${names.map((x) => `'${x}'`).join(', ')}`)
  }
  if (st.operator2 !== undefined && st.operator === undefined) errs.push(`${where('operator2')}: needs \`operator\``)
  if (st.at !== undefined) {
    if (source !== 'toric') errs.push(`${where('at')}: only a toric operator takes \`at\` (the row, column or plaquette)`)
    else if (st.operator === undefined) errs.push(`${where('at')}: needs an \`operator\``)
    else {
      const t = st.toric as { L: number; M?: number }
      const M = t.M ?? t.L
      const limits: Record<string, number> = { 'z-loop-h': M, 'z-loop-v': t.L, 'x-cut-v': t.L, 'x-cut-h': M, plaquette: Math.min(t.L, M) }
      for (const f of [st.operator, st.operator2]) if (f !== undefined && names.includes(f) && !(isInt(st.at) && st.at >= 0 && st.at < limits[f])) errs.push(`${where('at')}: a whole number from 0 to ${limits[f] - 1} for '${f}'`)
    }
  }
  // the schedule
  if (st.schedule !== undefined) {
    const s = st.schedule
    if (source !== 'rotated') errs.push(`${where('schedule')}: only a rotated patch has check circuits to order`)
    else if (view !== 'patch') errs.push(`${where('schedule')}: drawn in the 'patch' view`)
    const okOrder = (o: unknown): boolean => Array.isArray(o) && o.length === 4 && new Set(o).size === 4 && o.every((c) => (CODE_CORNERS as readonly string[]).includes(c))
    if (!s || !okOrder(s.xOrder)) errs.push(`${where('schedule.xOrder')}: the four corners ${CODE_CORNERS.join(', ')} once each`)
    if (!s || !okOrder(s.zOrder)) errs.push(`${where('schedule.zOrder')}: the four corners ${CODE_CORNERS.join(', ')} once each`)
  }
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
const plural = (k: number, w: string): string => `${k} ${w}${k === 1 ? '' : 's'}`

/** Short lines, as code.ts: the overlay's readout column is about 22 characters wide. */
export function surfaceReadouts(r: ResolvedCode): SvgReadout[] {
  const s = r.surface as ResolvedSurface
  const out: SvgReadout[] = []
  const patch = s.source !== 'toric'
  out.push({ name: 'code', text: patch ? `n = ${r.n} · k = ${r.k} · d = ${s.d}` : `n = ${r.n} · k = ${r.k}` })
  if (patch) {
    const parts = Object.entries(s.counts.weights)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map(([w, c]) => `${c}×${w}`)
    out.push({ name: 'checks', text: `${r.checks.length} checks: ${parts.join(', ')}` })
  } else out.push({ name: 'checks', text: `${plural(s.counts.x, 'star')} · ${plural(s.counts.z, 'plaquette')}` })
  if (s.fault) {
    out.push({ name: 'fault', text: `fault: ${s.fault.type} on ${s.fault.qubits.length} qubit${s.fault.qubits.length === 1 ? '' : 's'}`, tone: 'op' })
    if (r.show.includes('syndrome')) out.push({ name: 'syndrome', text: flipWords(s.fault.lit.map((i) => r.checks[i].label)), tone: 'minus' })
  }
  const opLines = (key: string, o: ResolvedSurfaceOperator, tone: 'state' | 'op'): void => {
    out.push({ name: key, text: `${o.type} operator · weight ${o.weight}`, tone })
    out.push({ name: `${key}-lit`, text: o.lit.length ? `lights ${plural(o.lit.length, 'check')}` : 'lights no check', tone: o.lit.length ? 'minus' : 'silver' })
    out.push({ name: `${key}-class`, text: o.classification, tone })
  }
  if (s.operator) opLines('operator', s.operator, 'state')
  if (s.operator2) {
    opLines('operator2', s.operator2, 'op')
    const odd = s.overlap.length % 2 === 1
    out.push({ name: 'overlap', text: s.operator && s.operator.type !== s.operator2.type ? `overlap ${s.overlap.length}: ${odd ? 'anticommute' : 'commute'}` : `overlap ${s.overlap.length}` })
  }
  if (s.schedule) {
    const sc = s.schedule
    out.push({ name: 'schedule', text: sc.conflictFree ? (sc.valid ? 'clash-free · valid' : 'clash-free') : `clash: ${plural(sc.clashes.length, 'place')}`, tone: sc.valid ? 'plus' : 'minus' })
    if (!sc.valid && sc.conflictFree) out.push({ name: 'pairs', text: `${sc.violations.length} flagged pairs`, tone: 'minus' })
  }
  return out
}

export const surfaceSummary = (r: ResolvedCode): string => [r.name, ...surfaceReadouts(r).map((x) => x.text)].join('; ')
