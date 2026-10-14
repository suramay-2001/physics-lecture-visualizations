/**
 * `code` additions of the Papers background chapter B2 (P-B2-story §9.2 K-C′): two more SOURCES besides a registry id, each built by the engine, never typed in:
 *   bb  a bivariate bicycle code, by a preset of physics/qec/bbfamily.ts (or by ℓ, m, A, B), drawn on its ℓ × m torus of 2 × 2 cell blocks (R top-left, X top-right, Z bottom-left,
 *       L bottom-right, as paper-tdg Fig. 3b) in three views: 'cells' (with optional overlays: the six edges of one `check` with its long edges labelled, the cells of a `pattern`
 *       polynomial, a `shift` arrow field), 'layers' (one X and one Z check with their edges coloured by the thickness-2 layer) and 'cycle' (the edges the depth-8 syndrome cycle of
 *       Bravyi et al. Table 5 uses in one round, with the clash and bad-pair counts of the schedule check);
 *   bp  min-sum belief propagation (and OSD-0) on the Tanner graph of the 7-bit repetition code or the 3 × 3 toric code (physics/qec/bp.ts): bits coloured by their belief, the hard decision,
 *       the lit checks, the round, and the OSD-0 answer.
 * This file builds the ResolvedCode of those sources; stage/svg/code.ts dispatches to it and stage/svg/CodeBBScene.tsx draws it.
 */
import type { CodeState } from '../../content/stage'
import { BB_PRESET_IDS, BP_CODES, CODE_VIEWS } from '../../content/stage'
import { validateBBSpec, type BBCode, type BBSpec } from '../../physics/qec/bb'
import {
  bbClashQubits,
  bbCodeOf,
  bbCodeOfSpec,
  bbDistanceRecord,
  bbLayers,
  bbPreset,
  bbRoundEdges,
  bbScheduleCheck,
  edgeTerm,
  type BBPresetName,
  type DistanceRecord,
} from '../../physics/qec/bbfamily'
import { channelLlr, differByStabilizer, minSumBP, osd0 } from '../../physics/qec/bp'
import { cssDistance } from '../../physics/qec/codes'
import { GF2Matrix } from '../../physics/qec/gf2'
import { toricCode } from '../../physics/qec/toric'
import type { SvgReadout } from '../svgKinds'
import type { CodeInputs, ResolvedBB, ResolvedBBEdge, ResolvedBP, ResolvedCode, ResolvedCodeCheck, ResolvedCodeQubit } from '../types'

export const BB_LIMITS_STAGE = { cells: 400, cycleCells: 144, errorBits: 6, iterMax: 18, patternCells: 12 } as const
const BB_VIEWS = ['cells', 'layers', 'cycle'] as const

const isInt = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x)
const wrap = (v: number, mod: number): number => ((v % mod) + mod) % mod
const wrapSym = (v: number, mod: number): number => {
  const w = wrap(v, mod)
  return w > mod / 2 ? w - mod : w
}
const MINUS = '−'

/** The default view of a state that names one of the B2 sources. */
export const defaultBBView = (st: Pick<CodeState, 'bb' | 'bp'>): 'cells' | 'beliefs' => (st.bp ? 'beliefs' : 'cells')

/** Does a state name a B2 source? */
export const isBBState = (st: Pick<CodeState, 'bb' | 'bp'>): boolean => st.bb !== undefined || st.bp !== undefined

/* ------------------------------------------------ the bb source ------------------------------------------------ */

interface Model {
  code: BBCode
  spec: BBSpec
  form: 'toric' | 'bravyi' | 'own'
  preset: BBPresetName | null
  distance: DistanceRecord | null
}

const MODELS = new Map<string, Model>()

function modelOf(inp: CodeInputs): Model {
  const src = inp.bb!
  const key = JSON.stringify([src.preset ?? null, src.spec ?? null, src.form ?? 'toric'])
  const hit = MODELS.get(key)
  if (hit) return hit
  let model: Model
  if (src.preset !== undefined) {
    const form = src.form ?? 'toric'
    const spec = bbPreset(src.preset, form)
    const preset = (form === 'bravyi' && src.preset === 'gross' ? 'b144' : form === 'bravyi' && src.preset === 'two-gross' ? 'b288' : src.preset) as BBPresetName
    const shownForm: Model['form'] = src.preset === 'gross' || src.preset === 'two-gross' ? form : src.preset === 'toy-24' || src.preset === 'toric-3x3' ? 'own' : 'bravyi'
    model = { code: bbCodeOf(src.preset, form), spec, form: shownForm, preset, distance: bbDistanceRecord(preset) }
  } else {
    const spec = { name: 'custom', ...src.spec! } as BBSpec
    const code = bbCodeOfSpec(spec)
    model = { code, spec, form: 'own', preset: null, distance: code.n <= 32 ? tryDistance(code) : null }
  }
  if (MODELS.size > 24) MODELS.delete(MODELS.keys().next().value as string)
  MODELS.set(key, model)
  return model
}

function tryDistance(code: BBCode): DistanceRecord | null {
  if (code.k === 0) return null
  const r = cssDistance(code.css, { maxWeight: 6 })
  return r.exact ? { value: r.lower, kind: 'exact', source: `exhaustive search over all patterns of weight ≤ ${r.lower} (this page's engine)` } : null
}

const pos = (code: BBCode, kind: 'L' | 'R' | 'X' | 'Z', cell: [number, number]): [number, number] => {
  const [x, y] = code.position(kind, cell)
  return [x, -y]
}

function edgesToResolved(code: BBCode, list: { kind: 'X' | 'Z'; cell: number; qubit: number }[], extra: (e: ResolvedBBEdge) => void): ResolvedBBEdge[] {
  const byCheck = new Map<string, ReturnType<BBCode['tanner']>['edges']>()
  for (const e of code.tanner().edges) {
    const key = `${e.checkKind}${e.check}`
    const arr = byCheck.get(key)
    if (arr) arr.push(e)
    else byCheck.set(key, [e])
  }
  const out: ResolvedBBEdge[] = []
  for (const w of list) {
    const e = (byCheck.get(`${w.kind}${w.cell}`) ?? []).find((t) => t.qubit === w.qubit)
    if (!e) continue
    const r: ResolvedBBEdge = {
      kind: e.checkKind,
      cell: code.ring.cellOf(e.check),
      qubit: e.qubit,
      qubitKind: e.qubitKind,
      term: edgeTerm(e),
      long: e.kind === 'long',
      delta: e.delta,
      from: [e.from[0], -e.from[1]],
      to: [e.to[0], -e.to[1]],
    }
    extra(r)
    out.push(r)
  }
  return out
}

function checkEdges(code: BBCode, kind: 'X' | 'Z', cell: [number, number]): { kind: 'X' | 'Z'; cell: number; qubit: number }[] {
  const c = code.ring.index(cell[0], cell[1])
  return code.tanner().edges.filter((e) => e.checkKind === kind && e.check === c).map((e) => ({ kind, cell: c, qubit: e.qubit }))
}

const monoName = (a: number, b: number): string => {
  const part = (v: string, e: number): string => (e === 0 ? '' : e === 1 ? v : `${v}^${e}`)
  const s = [part('x', a), part('y', b)].filter(Boolean).join(' ')
  return s || '1'
}

function buildBB(inp: CodeInputs): ResolvedCode {
  const M = modelOf(inp)
  const { code } = M
  const { l, m } = code
  const view = inp.view
  const cellsAll: [number, number][] = Array.from({ length: code.cells }, (_, c) => code.ring.cellOf(c))
  const qubits: ResolvedCodeQubit[] = []
  const checks: ResolvedCodeCheck[] = []
  for (const kind of ['L', 'R'] as const)
    cellsAll.forEach((cell, c) => {
      const [x, y] = pos(code, kind, cell)
      qubits.push({ index: (kind === 'L' ? 0 : code.cells) + c, x, y, label: '', family: kind, cell, error: null, correction: null, residual: null, logical: null, aria: `${kind} qubit of cell (${cell[0]}, ${cell[1]})` })
    })
  for (const kind of ['X', 'Z'] as const)
    cellsAll.forEach((cell, c) => {
      const [x, y] = pos(code, kind, cell)
      checks.push({ index: (kind === 'X' ? 0 : code.cells) + c, x, y, kind, label: `${kind}${c}`, letters: '', support: [], flipped: null, aria: `${kind} check of cell (${cell[0]}, ${cell[1]})` })
    })
  let edges: ResolvedBBEdge[] = []
  let focus: ResolvedBB['focus'] = null
  let pattern: ResolvedBB['pattern'] = null
  let shift: ResolvedBB['shift'] = null
  let layers: ResolvedBB['layers'] = null
  let cycle: ResolvedBB['cycle'] = null

  if (view === 'cells') {
    if (inp.check) {
      const list = checkEdges(code, inp.check.kind, inp.check.cell)
      edges = edgesToResolved(code, list, () => {})
      const long = edges.filter((e) => e.long).length
      focus = { kind: inp.check.kind, cell: inp.check.cell, near: edges.length - long, long, longLabels: !!inp.longEdges }
    }
    if (inp.pattern) {
      const a = inp.pattern.anchor
      const base = inp.pattern.poly === 'A' || inp.pattern.poly === 'At' ? code.spec.A : code.spec.B
      const neg = inp.pattern.poly === 'At' || inp.pattern.poly === 'Bt'
      const poly = code.ring.fromTerms(base.map(([i, j]) => (neg ? [-i + a[0], -j + a[1]] : [i + a[0], j + a[1]]) as [number, number]))
      pattern = { poly: inp.pattern.poly, anchor: a, cells: code.ring.terms(poly) }
    }
    if (inp.shift) {
      const [a, b] = inp.shift
      const dx = wrapSym(a, l)
      const dy = wrapSym(b, m)
      const picks: [number, number][] = [[0, 0], [Math.floor(l / 2), Math.floor(m / 2)], [Math.floor(l / 4), m - 1], [l - 1, Math.floor(m / 3)]]
      shift = {
        a,
        b,
        name: monoName(a, b),
        preserves: code.shiftPreservesCode(a, b),
        samples: picks.map((cell) => {
          const f = pos(code, 'L', cell)
          return { from: f, to: [f[0] + 2 * dx, f[1] - 2 * dy] as [number, number] }
        }),
      }
    }
  } else if (view === 'layers') {
    const { layers: L, layerOf } = bbLayers(code)
    // one X and one Z check from the middle of the torus, so the nearest copy of every qubit they touch lies on the tile
    const mid: [number, number] = [Math.floor(l / 2), Math.floor(m / 2)]
    edges = edgesToResolved(code, [...checkEdges(code, 'X', mid), ...checkEdges(code, 'Z', mid)], () => {})
    const tanner = code.tanner().edges
    edges.forEach((e) => {
      const t = tanner.find((x) => x.checkKind === e.kind && x.check === code.ring.index(e.cell[0], e.cell[1]) && x.qubit === e.qubit)!
      e.layer = layerOf(t)
    })
    layers = {
      edges: [L[0].edges, L[1].edges],
      maxDegree: [L[0].maxDegree, L[1].maxDegree],
      layer1: ['A2', 'A3', 'B3'],
      pieces: [L[0].components.reduce((s, c) => s + c.count, 0), L[1].components.reduce((s, c) => s + c.count, 0)],
    }
  } else if (view === 'cycle') {
    const { variant, round } = inp.cycle!
    const active = bbRoundEdges(code, variant, round)
    edges = edgesToResolved(code, active.map((e) => ({ kind: e.check, cell: e.cell, qubit: e.qubit })), (r) => {
      r.round = round
    })
    const rep = bbScheduleCheck(code, variant)
    cycle = { variant, round, active: active.length, clashQubits: bbClashQubits(code, variant), clashes: rep.clashes, badPairs: rep.badPairs, pairs: rep.pairs, maxOverlap: rep.maxOverlap, conflictFree: rep.conflictFree, valid: rep.valid }
  }

  const rec = M.distance
  const bbx: ResolvedBB = {
    name: code.spec.name,
    form: M.form,
    l,
    m,
    cells: code.cells,
    checkWeight: code.checkWeight,
    qubitDegree: code.css.degrees().qubitDegree,
    distance: rec,
    edges,
    pattern,
    shift,
    layers,
    cycle,
    focus,
  }
  const reportedKinds = rec && (rec.kind === 'reported' || rec.kind === 'bound')
  return {
    kind: 'code',
    id: `bb-${code.spec.name}`,
    name: `${code.spec.name === 'custom' ? 'bicycle code' : code.spec.name === 'gross' || code.spec.name === 'two-gross' ? code.spec.name + ' code' : code.spec.name} [[${code.n}, ${code.k}]]`,
    family: 'bb',
    view,
    n: code.n,
    k: code.k,
    rank: code.HX.rank() + code.HZ.rank(),
    distance: { d: rec && !reportedKinds ? rec.value : null, reported: rec && reportedKinds ? rec.value : null, exact: rec?.kind === 'exact' },
    qubits,
    checks,
    edges: [],
    plaquettes: [],
    bounds: [-0.6, -(2 * m - 0.4), 2 * l - 0.4, 0.6],
    error: null,
    correction: null,
    residual: null,
    show: [],
    correctionSource: null,
    residualKind: null,
    syndrome: null,
    logical: null,
    tile: null,
    table: null,
    words: null,
    bbx,
    inputs: inp,
    shot: inp.shot,
  }
}

/* ------------------------------------------------ the bp source ------------------------------------------------ */

const repCheck = (n: number): GF2Matrix => GF2Matrix.fromSupports(Array.from({ length: n - 1 }, (_, i) => [i, i + 1]), n)

function buildBP(inp: CodeInputs): ResolvedCode {
  const src = inp.bp!
  const toric = src.code === 'toric3'
  const t = toric ? toricCode(3) : null
  const H = toric ? t!.code.HZ : repCheck(7)
  const HX = toric ? t!.code.HX : null
  const n = H.cols
  const e = new Array<number>(n).fill(0)
  for (const q of src.error) e[q] = 1
  const syndrome = H.mulVec(e)
  const res = minSumBP(H, syndrome, src.p, Math.min(src.iter, BB_LIMITS_STAGE.iterMax))
  const step = res.history[res.history.length - 1]
  const shown = res.history[Math.min(src.iter, res.history.length) - 1]
  // positions: the 3 x 3 torus is drawn shifted so vertex (0, 0) sits in the middle of the tile (a drawing choice); the repetition code sits on a line
  const g = (i: number): number => (i + 1) % 3
  const bits: ResolvedBP['bits'] = []
  const segments: ResolvedBP['segments'] = []
  const checks: ResolvedBP['checks'] = []
  const osd = src.osd ? osd0(H, syndrome, shown.marginals, src.tie ?? 'low') : null
  for (let j = 0; j < n; j++) {
    let x = j
    let y = 0
    if (toric) {
      const isV = j >= 9
      const k = isV ? j - 9 : j
      const i = k % 3
      const jj = Math.floor(k / 3)
      x = isV ? g(i) : g(i) + 0.5
      y = -(isV ? g(jj) + 0.5 : g(jj))
      segments.push({ bit: j, a: [g(i), -g(jj)], b: isV ? [g(i), -(g(jj) + 1)] : [g(i) + 1, -g(jj)] })
    }
    bits.push({ index: j, x, y, error: e[j] === 1, marginal: shown.marginals[j], hard: shown.hard[j] === 1, osd: !!osd && osd.estimate[j] === 1, infoSet: !!osd && osd.infoSet.includes(j) })
  }
  for (let c = 0; c < H.rows; c++) {
    const bs = H.rowSupport(c)
    const x = toric ? g(c % 3) + 0.5 : c + 0.5
    const y = toric ? -(g(Math.floor(c / 3)) + 0.5) : -0.9
    checks.push({ index: c, x, y, lit: syndrome[c] === 1, bits: bs })
  }
  const bpx: ResolvedBP = {
    code: src.code,
    bits,
    checks,
    segments,
    p: src.p,
    llr: channelLlr(src.p),
    iter: shown.iter,
    iterRequested: src.iter,
    converged: res.converged && res.iterations <= src.iter,
    hardWeight: shown.hardWeight,
    syndromeMet: shown.syndromeMet,
    errorWeight: src.error.length,
    litChecks: syndrome.reduce((s, b) => s + b, 0),
    osd: osd ? { weight: osd.weight, valid: osd.valid, infoSet: osd.infoSet, tie: src.tie ?? 'low', differsByStabilizer: HX ? differByStabilizer(HX, osd.estimate, e) : null } : null,
    bounds: toric ? [-0.5, -3.5, 3.5, 0.5] : [-0.6, -1.4, 6.6, 0.6],
  }
  void step
  const qubits: ResolvedCodeQubit[] = bits.map((b) => ({ index: b.index, x: b.x, y: b.y, label: `${b.index}`, family: null, cell: null, error: null, correction: null, residual: null, logical: null, aria: `bit ${b.index}` }))
  const chk: ResolvedCodeCheck[] = checks.map((c) => ({ index: c.index, x: c.x, y: c.y, kind: 'Z', label: `${c.index}`, letters: '', support: c.bits, flipped: c.lit ? 1 : 0, aria: `check ${c.index}` }))
  return {
    kind: 'code',
    id: `bp-${src.code}`,
    name: toric ? 'belief propagation on the 3 × 3 toric code' : 'belief propagation on the 7-bit repetition code',
    family: 'bp',
    view: 'beliefs',
    n,
    k: toric ? 2 : 1,
    rank: H.rank(),
    distance: { d: null, reported: null, exact: false },
    qubits,
    checks: chk,
    edges: [],
    plaquettes: [],
    bounds: bpx.bounds,
    error: null,
    correction: null,
    residual: null,
    show: [],
    correctionSource: null,
    residualKind: null,
    syndrome: syndrome.join(''),
    logical: null,
    tile: null,
    table: null,
    words: null,
    bpx,
    inputs: inp,
    shot: inp.shot,
  }
}

export function buildBBSource(inp: CodeInputs): ResolvedCode {
  return inp.bp ? buildBP(inp) : buildBB(inp)
}

/* ------------------------------------------------ validation ------------------------------------------------ */

const dup = (xs: readonly unknown[]): boolean => new Set(xs).size !== xs.length

export function validateBBStage(st: CodeState): string[] {
  const errs: string[] = []
  const where = (f: string) => `code ${f}`
  const named = [st.code, st.toric, st.rotated, st.planar, st.bb, st.bp].filter((x) => x !== undefined).length
  if (named !== 1) return [`code: exactly one of code, toric, rotated, planar, bb, bp (this state names ${named})`]
  for (const [f, v] of [['error', st.error], ['correction', st.correction], ['errors', st.errors], ['word', st.word], ['focus', st.focus], ['fault', st.fault], ['operator', st.operator], ['operator2', st.operator2], ['at', st.at], ['schedule', st.schedule]] as const)
    if (v !== undefined) errs.push(`${where(f)}: not for a ${st.bb ? 'bb' : 'bp'} source`)
  if (st.show !== undefined && (!Array.isArray(st.show) || st.show.length > 0)) errs.push(`${where('show')}: a ${st.bb ? 'bb' : 'bp'} source takes no \`show\``)
  const view = st.view ?? defaultBBView(st)
  if (!(CODE_VIEWS as readonly string[]).includes(view)) return [...errs, `code view: ${CODE_VIEWS.map((v) => `'${v}'`).join(', ')}`]
  if (st.bp !== undefined) {
    const b = st.bp
    if (view !== 'beliefs') errs.push(`${where('view')}: a bp source is drawn as 'beliefs'`)
    for (const [f, v] of [['bb', st.bb], ['check', st.check], ['longEdges', st.longEdges], ['pattern', st.pattern], ['shift', st.shift], ['cycle', st.cycle]] as const) if (v !== undefined) errs.push(`${where(f)}: not for a bp source`)
    if (!b || !(BP_CODES as readonly string[]).includes(b.code)) return [...errs, `${where('bp.code')}: ${BP_CODES.map((c) => `'${c}'`).join(' or ')}`]
    const n = b.code === 'toric3' ? 18 : 7
    if (!Array.isArray(b.error) || b.error.length < 1 || b.error.length > BB_LIMITS_STAGE.errorBits) errs.push(`${where('bp.error')}: one to ${BB_LIMITS_STAGE.errorBits} flipped bits`)
    else if (!b.error.every((q) => isInt(q) && q >= 0 && q < n) || dup(b.error)) errs.push(`${where('bp.error')}: distinct bit numbers from 0 to ${n - 1}`)
    if (typeof b.p !== 'number' || !(b.p >= 0.001 && b.p <= 0.4)) errs.push(`${where('bp.p')}: a chance from 0.001 to 0.4`)
    if (!isInt(b.iter) || b.iter < 1 || b.iter > BB_LIMITS_STAGE.iterMax) errs.push(`${where('bp.iter')}: a whole number from 1 to ${BB_LIMITS_STAGE.iterMax}`)
    if (b.tie !== undefined && b.tie !== 'low' && b.tie !== 'high') errs.push(`${where('bp.tie')}: 'low' or 'high'`)
    if (b.tie !== undefined && !b.osd) errs.push(`${where('bp.tie')}: only with \`osd\``)
    return errs
  }
  const b = st.bb!
  if (!(BB_VIEWS as readonly string[]).includes(view)) errs.push(`${where('view')}: a bb source is drawn as ${BB_VIEWS.map((v) => `'${v}'`).join(', ')}`)
  const hasPreset = b?.preset !== undefined
  const hasSpec = b?.spec !== undefined
  if (hasPreset === hasSpec) return [...errs, `${where('bb')}: exactly one of preset, spec`]
  if (b.form !== undefined && b.form !== 'toric' && b.form !== 'bravyi') errs.push(`${where('bb.form')}: 'toric' or 'bravyi'`)
  let l = 0
  let m = 0
  let threeTerms = false
  if (hasPreset) {
    if (!(BB_PRESET_IDS as readonly string[]).includes(b.preset as string)) return [...errs, `${where('bb.preset')}: one of ${BB_PRESET_IDS.join(', ')}`]
    const spec = bbPreset(b.preset as BBPresetName, b.form ?? 'toric')
    ;({ l, m } = spec)
    threeTerms = spec.A.length === 3 && spec.B.length === 3
  } else {
    const v = validateBBSpec({ ...(b.spec as object) })
    if (!v.ok) return [...errs, `${where('bb.spec')}: ${v.reason}`]
    ;({ l, m } = v.spec)
    threeTerms = v.spec.A.length === 3 && v.spec.B.length === 3
  }
  if (l * m > BB_LIMITS_STAGE.cells) errs.push(`${where('bb')}: ${l * m} cells; at most ${BB_LIMITS_STAGE.cells}`)
  const cell = (c: unknown): boolean => Array.isArray(c) && c.length === 2 && isInt(c[0]) && isInt(c[1]) && c[0] >= 0 && c[0] < l && c[1] >= 0 && c[1] < m
  for (const f of ['check', 'longEdges', 'pattern', 'shift'] as const) if (st[f] !== undefined && view !== 'cells') errs.push(`${where(f)}: only the 'cells' view draws it (this state is the '${view}' view)`)
  if (st.cycle !== undefined && view !== 'cycle') errs.push(`${where('cycle')}: only the 'cycle' view draws it`)
  if (st.check !== undefined) {
    if (!st.check || (st.check.kind !== 'X' && st.check.kind !== 'Z') || !cell(st.check.cell)) errs.push(`${where('check')}: { kind: 'X' | 'Z', cell: [i, j] } with 0 ≤ i < ${l}, 0 ≤ j < ${m}`)
  }
  if (st.longEdges !== undefined && st.check === undefined) errs.push(`${where('longEdges')}: needs \`check\``)
  if (st.pattern !== undefined) {
    if (!st.pattern || !['A', 'B', 'At', 'Bt'].includes(st.pattern.poly) || !cell(st.pattern.anchor)) errs.push(`${where('pattern')}: { poly: 'A' | 'B' | 'At' | 'Bt', anchor: [i, j] } with the anchor inside the ${l} × ${m} torus`)
  }
  if (st.shift !== undefined) {
    if (!Array.isArray(st.shift) || st.shift.length !== 2 || !st.shift.every((v) => isInt(v)) || Math.abs(st.shift[0]) > l || Math.abs(st.shift[1]) > m) errs.push(`${where('shift')}: [a, b] whole numbers with |a| ≤ ${l}, |b| ≤ ${m}`)
  }
  if (view === 'layers' && !threeTerms) errs.push(`${where('view')}: the layers view needs three monomials in A and in B`)
  if (view === 'cycle') {
    if (!threeTerms) errs.push(`${where('view')}: the cycle view needs three monomials in A and in B`)
    if (l * m > BB_LIMITS_STAGE.cycleCells) errs.push(`${where('view')}: the cycle view draws at most ${BB_LIMITS_STAGE.cycleCells} cells`)
    if (hasPreset && (b.preset === 'gross' || b.preset === 'two-gross') && b.form !== 'bravyi') errs.push(`${where('bb.form')}: the cycle of Bravyi et al. Table 5 is written for their polynomials; add form: 'bravyi'`)
    const c = st.cycle
    if (!c || !['printed', 'swap-z-reads'].includes(c.variant) || !isInt(c.round) || c.round < 1 || c.round > 8) errs.push(`${where('cycle')}: { variant: 'printed' | 'swap-z-reads', round: 1 … 8 }`)
  }
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
const plural = (k: number, w: string): string => `${k} ${w}${k === 1 ? '' : 's'}`
const cellText = (c: readonly [number, number]): string => `(${c[0]}, ${c[1]})`

export function bbReadouts(r: ResolvedCode): SvgReadout[] {
  const out: SvgReadout[] = []
  if (r.bpx) {
    const b = r.bpx
    out.push({ name: 'channel', text: `p = ${b.p} · λ = ${b.llr.toFixed(3)}` })
    out.push({ name: 'round', text: `round ${b.iter}: hard weight ${b.hardWeight}`, tone: 'op' })
    out.push({ name: 'syndrome', text: b.syndromeMet ? 'syndrome met' : 'syndrome unmet', tone: b.syndromeMet ? 'plus' : 'minus' })
    out.push({ name: 'error', text: `error weight ${b.errorWeight} · ${plural(b.litChecks, 'check')} lit`, tone: 'silver' })
    if (b.osd) out.push({ name: 'osd', text: `OSD-0: weight ${b.osd.weight}, syndrome ${b.osd.valid ? 'met' : 'unmet'}`, tone: 'plus' })
    return out
  }
  const b = r.bbx!
  out.push({ name: 'code', text: `n = ${r.n} · k = ${r.k}` })
  if (b.distance) {
    const d = b.distance
    out.push({ name: 'distance', text: d.kind === 'exact' ? `d = ${d.value}` : d.kind === 'exact-offline' ? `d = ${d.value} (offline search)` : d.kind === 'bound' ? `d ≤ ${d.value} (printed)` : `d = ${d.value} (printed)` })
  }
  out.push({ name: 'torus', text: `${b.l} × ${b.m} cells · check weight ${b.checkWeight}` })
  if (b.focus) out.push({ name: 'focus', text: `${b.focus.kind}${cellText(b.focus.cell)}: ${b.focus.near} near, ${b.focus.long} long`, tone: 'silver' })
  if (b.pattern) out.push({ name: 'pattern', text: `${b.pattern.poly === 'At' ? 'Aᵀ' : b.pattern.poly === 'Bt' ? 'Bᵀ' : b.pattern.poly} at ${cellText(b.pattern.anchor)}: ${b.pattern.cells.map(cellText).join(' ')}`, tone: 'op' })
  if (b.shift) {
    out.push({ name: 'shift', text: `shift ${b.shift.name}`, tone: 'op' })
    out.push({ name: 'shift-checks', text: b.shift.preserves ? 'keeps the checks' : 'breaks the checks', tone: 'op' })
  }
  if (b.layers) {
    const L = b.layers
    out.push({ name: 'layer-1', text: `layer 1: ${L.edges[0]} edges, degree ${L.maxDegree[0]}` })
    out.push({ name: 'layer-2', text: `layer 2: ${L.edges[1]} edges, degree ${L.maxDegree[1]}`, tone: 'op' })
  }
  if (b.cycle) {
    const c = b.cycle
    out.push({ name: 'round', text: `round ${c.round} of 8 · ${c.active} edges`, tone: 'op' })
    out.push({ name: 'clash', text: c.conflictFree ? 'no qubit used twice' : `${plural(c.clashes, 'place')} used twice`, tone: c.conflictFree ? 'plus' : 'minus' })
    out.push({ name: 'pairs', text: `${c.badPairs} of ${c.pairs} X/Z pairs ${MINUS} out of order`, tone: c.badPairs ? 'minus' : 'plus' })
  }
  return out
}
