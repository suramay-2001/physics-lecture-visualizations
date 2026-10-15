/**
 * `code` additions of the Papers background chapter B3 (P-B3 S-d, additive): two more things on the error-correcting-code kind.
 *   surgery  a SOURCE besides a registry id and the B1 surfaces: two distance-d rotated patches A and B and the seam between them, in the three steps of lattice surgery
 *            (physics/qec/surgery.ts `surgeryLayout`): 'separate' (two patches, the seam qubits not yet part of anything), 'merged' (one big patch: the d + 1 NEW checks of the measured type that
 *            touch the seam, the d − 1 old boundary checks of the other type that WIDENED to reach it, every other check KEPT) and 'split' (the seam qubits read out, the patches alone again).
 *            The product of the new checks is the logical product that is measured (X̄_A X̄_B for an XX merge, Z̄_A Z̄_B for ZZ). One seeded outcome is never drawn: the picture shows which checks
 *            exist, not a run. The view is the patch drawing (stage/svg/CodeSurgeryScene.tsx).
 *   measure  on the 'checks' view of a registry code: a Pauli string to be measured next, as an extra row, judged by the engine (StabilizerCode.inNormalizer / membership / k): it commutes with
 *            every check and is new (k drops by one), is already in the group (the outcome is fixed), or anticommutes with some checks (it would disturb them).
 * This file builds the pieces of the ResolvedCode; stage/svg/code.ts dispatches to it.
 */
import type { CodeState } from '../../content/stage'
import { CODE_SURGERY_SHOW, CODE_SURGERY_STEPS, CODE_VIEWS } from '../../content/stage'
import { GF2Matrix } from '../../physics/qec/gf2'
import { Pauli } from '../../physics/qec/pauli'
import type { RegisteredCode } from '../../physics/qec/registry'
import { StabilizerCode } from '../../physics/qec/stabilizer'
import { rotatedPatch, surgeryLayout, type SurgeryLayout } from '../../physics/qec/surgery'
import type { SvgReadout } from '../svgKinds'
import type { CodeInputs, ResolvedCode, ResolvedCodeMeasure, ResolvedCodeSurgery, ResolvedSurgeryCheck, ResolvedSurgeryQubit } from '../types'


/* ------------------------------------------------ measure ------------------------------------------------ */
/** A Pauli string to measure: exactly n letters from I X Y Z (no sign), not all I. Never throws. */
export function parseMeasure(text: unknown, n: number): { ok: true; p: Pauli } | { ok: false; reason: string } {
  if (typeof text !== 'string' || !/^[IXYZ]+$/.test(text)) return { ok: false, reason: 'a Pauli string of letters I, X, Y, Z (no sign)' }
  if (text.length !== n) return { ok: false, reason: `"${text.slice(0, 40)}" has ${text.length} letters, the code has ${n} qubits` }
  if (/^I+$/.test(text)) return { ok: false, reason: 'not all I (the identity measures nothing)' }
  return { ok: true, p: Pauli.fromLetters([...text] as ('I' | 'X' | 'Y' | 'Z')[]) }
}

const joinCommas = (xs: readonly string[]): string => xs.join(', ')

/** The engine's verdict on measuring `letters` next, for the table's extra row and the readout line. */
export function measureOf(entry: RegisteredCode, labels: readonly string[], letters: string): ResolvedCodeMeasure {
  const p = (parseMeasure(letters, entry.n) as { ok: true; p: Pauli }).p
  const syn = entry.stabilizer.syndrome(p)
  const anticommutes = labels.filter((_, i) => syn[i] === 1)
  const kBefore = entry.k
  if (anticommutes.length > 0) {
    return { letters, status: 'disturbs', anticommutes, kBefore, kAfter: kBefore, text: `anticommutes with check${anticommutes.length === 1 ? '' : 's'} ${joinCommas(anticommutes)}` }
  }
  if (entry.stabilizer.membership(p) !== 'outside') {
    return { letters, status: 'fixed', anticommutes: [], kBefore, kAfter: kBefore, text: `commutes with every check · in the group: outcome already fixed · k: ${kBefore} stays` }
  }
  const kAfter = new StabilizerCode([...entry.stabilizer.generators, p], 'measured').k
  return { letters, status: 'new', anticommutes: [], kBefore, kAfter, text: `commutes with every check · not in the group · k: ${kBefore} → ${kAfter}` }
}

/** The readouts of a measured row: three short pieces (the column is narrow); the print figure packs them on one line. */
export function measureReadouts(m: ResolvedCodeMeasure): SvgReadout[] {
  if (m.status === 'disturbs') return [{ name: 'measure', text: m.text, tone: 'plus' }]
  if (m.status === 'fixed') return [{ name: 'measure', text: 'commutes with all checks', tone: 'plus' }, { name: 'measure-group', text: 'in the group: outcome fixed', tone: 'silver' }, { name: 'measure-k', text: `k: ${m.kBefore} stays`, tone: 'state' }]
  return [{ name: 'measure', text: 'commutes with all checks', tone: 'plus' }, { name: 'measure-group', text: 'not in the group', tone: 'silver' }, { name: 'measure-k', text: `k: ${m.kBefore} → ${m.kAfter}`, tone: 'state' }]
}

/* ------------------------------------------------ surgery: resolve ------------------------------------------------ */
const MEMO = new Map<string, ResolvedCodeSurgery>()

/** The checks of the two SEPARATE patches in the merged grid's coordinates (a patch's own faces, A at the origin, B shifted by the layout's offset). */
function separateChecks(L: SurgeryLayout): ResolvedSurgeryCheck[] {
  const small = rotatedPatch(L.d, L.d)
  const out: ResolvedSurgeryCheck[] = []
  for (const [side, map, shift] of [['A', L.A, [0, 0]], ['B', L.B, [L.offsetB[1], L.offsetB[0]]]] as const)
    for (const k of small.checks) {
      const qubits = k.qubits.map((i) => map[i])
      out.push({ index: out.length, kind: k.type, qubits, boundary: k.boundary, center: [k.center[0] + shift[0], k.center[1] + shift[1]], cls: 'kept', aria: `${k.type} check of patch ${side} on ${qubits.length} qubits` })
    }
  return out
}

function stepName(step: string): string {
  return step === 'separate' ? 'two separate patches' : step === 'merged' ? 'merged into one patch' : 'split again'
}

export function surgeryOf(inp: CodeInputs): ResolvedCodeSurgery {
  const sg = inp.surgery!
  const key = JSON.stringify([sg.d, sg.product, sg.step, [...(sg.show ?? [])]])
  const hit = MEMO.get(key)
  if (hit) return hit
  const L = surgeryLayout(sg.d, sg.product)
  const merged = sg.step === 'merged'
  const checks: ResolvedSurgeryCheck[] = merged
    ? L.checks.map((k, i) => ({ index: i, kind: k.type, qubits: [...k.qubits], boundary: k.boundary, center: [k.center[0], k.center[1]] as [number, number], cls: k.cls, aria: `${k.type} check on ${k.qubits.length} qubits${k.cls === 'new' ? ' (new: it touches the seam)' : k.cls === 'widened' ? ' (widened to reach the seam)' : ''}` }))
    : separateChecks(L)
  const role = (q: number): 'A' | 'B' | 'seam' => (L.A.includes(q) ? 'A' : L.B.includes(q) ? 'B' : 'seam')
  const prep = sg.product === 'XX' ? '0' : '+'
  const qubits: ResolvedSurgeryQubit[] = Array.from({ length: L.n }, (_, q) => {
    const r = role(q)
    const local = r === 'A' ? L.A.indexOf(q) : r === 'B' ? L.B.indexOf(q) : L.seam.indexOf(q)
    const base = r === 'seam' ? `seam qubit ${local + 1}` : `data qubit ${local + 1} of patch ${r}`
    const aria = r !== 'seam' ? base : sg.step === 'separate' ? `${base}, prepared in |${prep}⟩, not yet part of a patch` : sg.step === 'merged' ? `${base}, part of the merged patch` : `${base}, read out`
    return { index: q, role: r, x: q % L.cols, y: Math.floor(q / L.cols), aria }
  })
  // stored qubits at this step: the merged code's, or the two patches' (their own ranks over the 2d² qubits that carry checks)
  let n = L.n
  let k = L.k
  if (!merged) {
    n = 2 * sg.d * sg.d
    const xs = checks.filter((c) => c.kind === 'X').map((c) => c.qubits)
    const zs = checks.filter((c) => c.kind === 'Z').map((c) => c.qubits)
    k = n - GF2Matrix.fromSupports(xs, L.n).rank() - GF2Matrix.fromSupports(zs, L.n).rank()
  }
  const out: ResolvedCodeSurgery = {
    d: sg.d,
    product: sg.product,
    step: sg.step,
    show: [...(sg.show ?? [])],
    rows: L.rows,
    cols: L.cols,
    qubits,
    checks,
    n,
    k,
    seam: L.seam.length,
    newChecks: L.newChecks,
    widened: L.widened,
    measured: { type: L.measured.type, qubits: [...L.measured.qubits], name: `${L.measured.type}̄_A ${L.measured.type}̄_B` },
    seamPrep: prep,
  }
  if (MEMO.size > 16) MEMO.delete(MEMO.keys().next().value as string)
  MEMO.set(key, out)
  return out
}

/** The ResolvedCode of a surgery source: the generic fields hold the counts, the picture is `surgery`. */
export function buildSurgery(inp: CodeInputs): ResolvedCode {
  const s = surgeryOf(inp)
  return {
    kind: 'code',
    id: `surgery-d${s.d}-${s.product}-${s.step}`,
    name: `lattice surgery · d = ${s.d} · ${s.product}`,
    family: 'surgery',
    view: inp.view,
    n: s.n,
    k: s.k,
    rank: s.n - s.k,
    distance: { d: null, reported: null, exact: false },
    qubits: [],
    checks: [],
    edges: [],
    plaquettes: [],
    bounds: [-0.6, -0.6, s.cols - 1 + 0.6, s.rows - 1 + 0.6],
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
    surface: null,
    surgery: s,
    inputs: inp,
    shot: inp.shot,
  }
}

/** The text under the picture and in the accessible name: where the surgery is. */
export const surgeryStepText = (s: ResolvedCodeSurgery): string => `${s.product} surgery, d = ${s.d}: ${stepName(s.step)}`

/** Readouts (short): the counts of the layout. */
export function surgeryReadouts(r: ResolvedCode): SvgReadout[] {
  const s = r.surgery!
  return [
    { name: 'n', text: `n = ${s.n}`, tone: 'text' },
    { name: 'k', text: `k = ${s.k}`, tone: 'state' },
    { name: 'seam', text: `seam: ${s.seam} qubits`, tone: 'plus' },
    { name: 'new', text: `new checks: ${s.newChecks}`, tone: 'minus' },
    { name: 'widened', text: `widened checks: ${s.widened}`, tone: 'silver' },
  ]
}

/* ------------------------------------------------ validation ------------------------------------------------ */
const list = (xs: readonly string[]): string => xs.map((v) => `'${v}'`).join(', ')

/** Problems with a state that names a `surgery` source ([] = valid). */
export function validateSurgerySource(st: CodeState): string[] {
  const errs: string[] = []
  const where = (f: string): string => `code ${f}`
  const others = (['code', 'toric', 'rotated', 'planar'] as const).filter((k) => st[k] !== undefined)
  if (others.length) return [`code: exactly one of code, toric, rotated, planar, surgery (this state names ${[...others, 'surgery'].join(' and ')})`]
  const s = st.surgery
  if (!s || typeof s !== 'object') return [where('surgery: { d: 3 | 5, product: "XX" | "ZZ", step, show? }')]
  if (s.d !== 3 && s.d !== 5) errs.push(where('surgery.d: 3 or 5 (each patch has this distance)'))
  if (s.product !== 'XX' && s.product !== 'ZZ') errs.push(where(`surgery.product: 'XX' or 'ZZ'`))
  if (!(CODE_SURGERY_STEPS as readonly string[]).includes(s.step)) errs.push(where(`surgery.step: one of ${list(CODE_SURGERY_STEPS)}`))
  for (const key of Object.keys(s)) if (!['d', 'product', 'step', 'show'].includes(key)) errs.push(where(`surgery.${key}: unknown (d, product, step, show)`))
  if (s.show !== undefined) {
    if (!Array.isArray(s.show) || !s.show.every((x) => (CODE_SURGERY_SHOW as readonly string[]).includes(x))) errs.push(where(`surgery.show: a list of ${list(CODE_SURGERY_SHOW)}`))
    else if (new Set(s.show).size !== s.show.length) errs.push(where('surgery.show: each name once'))
    else if (s.step !== undefined && s.step !== 'merged')
      for (const name of ['new', 'widened', 'product'] as const) if (s.show.includes(name)) errs.push(where(`surgery.show: '${name}' marks checks that exist only in the merged patch; use step 'merged'`))
  }
  const view = st.view ?? 'patch'
  if (!(CODE_VIEWS as readonly string[]).includes(view)) errs.push(`code view: ${CODE_VIEWS.map((v) => `'${v}'`).join(', ')}`)
  else if (view !== 'patch') errs.push(where(`view: a surgery source is drawn as 'patch', not '${view}'`))
  for (const [f, v] of [['error', st.error], ['correction', st.correction], ['errors', st.errors], ['word', st.word], ['focus', st.focus], ['shift', st.shift], ['fault', st.fault], ['operator', st.operator], ['operator2', st.operator2], ['at', st.at], ['schedule', st.schedule], ['show', st.show], ['measure', st.measure], ['paperOps', st.paperOps]] as const)
    if (v !== undefined) errs.push(where(`${f}: a surgery source takes only \`surgery\` (the names to mark go in surgery.show)`))
  return errs
}
