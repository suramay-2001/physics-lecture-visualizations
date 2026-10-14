/**
 * `code` (shared SVG kind; P-Q21-story §9.2 K1, P-Q22-story §9.2, decisions/qc709-Q21Q22.md R4): one error-correcting code from physics/qec, drawn as qubits (discs),
 * checks (squares) and the Tanner edges between them. Three views:
 *   layout  the registry's drawing of the code with optional overlays: an ERROR (letters on the hit discs), the SYNDROME (checks that read −1 light up and are
 *           read out in words), the CORRECTION (the lookup decoder's Pauli, or an authored one with the same syndrome, as outlined letters), the RESIDUAL
 *           (error × correction, named by the engine: identity, a check, logical X / Z / Y) and a minimum-weight LOGICAL operator's support. The rotated surface
 *           code is drawn on its grid with plaquettes; the bivariate bicycle codes as their ℓ × m torus tile (both data families L, R and both check families
 *           X, Z at the engine's Tanner positions), with the six edges of the FOCUSED check(s) only (local ones as lines, long-range ones as labelled stubs that
 *           wrap off the tile) and optionally a SHIFT automorphism as an arrow field.
 *   checks  the generators as a table of Pauli letters with n, k and the rank, and up to 8 error rows with their syndromes (n ≤ 9).
 *   words   |0̄⟩, |1̄⟩ or |+̄⟩ as basis strings with amplitude sizes (n ≤ 9, k = 1, at most 16 strings).
 * Content writes only INPUTS (a registry id, the view, an error as a Pauli string, an authored correction); every syndrome, correction, residual, logical
 * operator, code word, distance and Tanner edge comes from physics/qec (registry.ts, stabilizer.ts, codes.ts, bb.ts, codewords.ts). There is no continuous
 * parameter: a change of picture switches at the half-way point (stage/interp.ts). Lazy chunk (stage/svg/kinds.ts).
 */
import type { CodeFocus, CodeShow, CodeState, CodeWord } from '../../content/stage'
import { CODE_IDS, CODE_SHOW, CODE_VIEWS } from '../../content/stage'
import { codewords } from '../../physics/qec/codewords'
import { Pauli } from '../../physics/qec/pauli'
import { classifyResidual, decoderOf, distanceOf, isRegisteredCodeId, logicalWitnessOf, registeredCode, type RegisteredCode } from '../../physics/qec/registry'
import type { SvgReadout } from '../svgKinds'
import type {
  CodeInputs,
  CodeLetter,
  CodeResidualKind,
  ResolvedCode,
  ResolvedCodeCheck,
  ResolvedCodeEdge,
  ResolvedCodeErrorRow,
  ResolvedCodeFocus,
  ResolvedCodePlaquette,
  ResolvedCodeQubit,
  ResolvedCodeShift,
  ResolvedCodeTile,
} from '../types'
import { fix } from './draw'

/** Validation limits: small enough that every disc, square and letter stays readable on a phone-width stage. */
export const CODE_LIMITS = { layoutQubits: 25, layoutChecks: 24, tableQubits: 9, errorsMax: 8, wordsMax: 16, focusMax: 2, textMax: 600 } as const

const MINUS = '−'

/* ------------------------------------------------ Pauli text ------------------------------------------------ */

type Parsed = { ok: true; p: Pauli } | { ok: false; reason: string }

/**
 * A Pauli error as content writes it: one letter per qubit ("IXIIIII", n letters), or only the hit qubits counted from 1 ("X2", "X1Z4", "X1 Z4").
 * Never throws.
 */
export function parsePauliText(text: unknown, n: number): Parsed {
  if (typeof text !== 'string') return { ok: false, reason: 'a Pauli string' }
  const t = text.trim()
  if (t.length === 0 || t.length > CODE_LIMITS.textMax) return { ok: false, reason: `a Pauli string of at most ${CODE_LIMITS.textMax} characters` }
  if (/^[IXYZ]+$/.test(t)) {
    if (t.length !== n) return { ok: false, reason: `"${t.slice(0, 40)}" has ${t.length} letters, the code has ${n} qubits (write one letter per qubit, or the hit qubits like "X2")` }
    return { ok: true, p: Pauli.fromLetters([...t] as ('I' | 'X' | 'Y' | 'Z')[]) }
  }
  if (/^\s*(?:[XYZ]\s*\d+\s*)+$/.test(t)) {
    const letters = new Array<'I' | 'X' | 'Y' | 'Z'>(n).fill('I')
    for (const m of t.matchAll(/([XYZ])\s*(\d+)/g)) {
      const q = Number(m[2])
      if (!Number.isInteger(q) || q < 1 || q > n) return { ok: false, reason: `qubit ${m[2].slice(0, 6)} is outside 1 … ${n} (qubits are counted from 1)` }
      if (letters[q - 1] !== 'I') return { ok: false, reason: `qubit ${q} is named twice` }
      letters[q - 1] = m[1] as 'X' | 'Y' | 'Z'
    }
    return { ok: true, p: Pauli.fromLetters(letters) }
  }
  return { ok: false, reason: `cannot read "${t.slice(0, 40)}" (one letter per qubit from I, X, Y, Z, or the hit qubits like "X2" or "X1Z4")` }
}

const letterOrNull = (l: string): CodeLetter | null => (l === 'I' ? null : (l as CodeLetter))

const joinAnd = (xs: readonly (string | number)[]): string => (xs.length <= 1 ? xs.join('') : xs.length === 2 ? `${xs[0]} and ${xs[1]}` : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`)

/** "X on qubit 2" · "X on qubits 1 and 2, Z on qubit 4" · "no error" (qubits counted from 1; the bicycle codes' 144 are counted the same way). */
export function describePauli(p: Pauli): string {
  if (p.weight() === 0) return 'the identity'
  const L = p.letters()
  const parts: string[] = []
  for (const l of ['X', 'Y', 'Z'] as const) {
    const qs = L.flatMap((x, j) => (x === l ? [j + 1] : []))
    if (qs.length === 0) continue
    parts.push(qs.length > 6 ? `${l} on ${qs.length} qubits (${qs.slice(0, 5).join(', ')}, …)` : `${l} on qubit${qs.length > 1 ? 's' : ''} ${joinAnd(qs)}`)
  }
  return parts.join(', ')
}

/** The same in few characters for the narrow readout column: "X on 5" · "X on 1, 2" · "X on 1, Z on 4" · "weight 7". */
export function tersePauli(p: Pauli): string {
  if (p.weight() === 0) return 'identity'
  if (p.weight() > 5) return `weight ${p.weight()}`
  const L = p.letters()
  return (['X', 'Y', 'Z'] as const)
    .flatMap((l) => {
      const qs = L.flatMap((x, j) => (x === l ? [j + 1] : []))
      return qs.length ? [`${l} on ${qs.join(', ')}`] : []
    })
    .join(', ')
}

/* ------------------------------------------------ resolve ------------------------------------------------ */

const wrapSym = (v: number, mod: number): number => {
  const w = ((v % mod) + mod) % mod
  return w > mod / 2 ? w - mod : w
}

/** The index of a focused check in the list of checks (X first, then Z), or an error text. */
function focusIndex(entry: RegisteredCode, f: CodeFocus): number | string {
  const cells = entry.bb!.cells
  if (typeof f === 'number') return Number.isInteger(f) && f >= 0 && f < 2 * cells ? f : `focus ${f}: a check index from 0 to ${2 * cells - 1} (the ${cells} X checks, then the ${cells} Z checks)`
  const m = /^([XZ])(\d{1,4})$/.exec(typeof f === 'string' ? f : '')
  if (!m) return `focus "${String(f).slice(0, 12)}": a check index or a name like "X12" / "Z5" (the cell's index)`
  const c = Number(m[2])
  if (c >= cells) return `focus "${f}": ${m[1]} checks run X0 … X${cells - 1}`
  return m[1] === 'X' ? c : cells + c
}

function tileOf(entry: RegisteredCode, inp: CodeInputs): ResolvedCodeTile {
  const bb = entry.bb!
  const { l, m, cells } = bb
  const tanner = bb.tanner()
  const focusList = inp.focus === undefined ? [] : Array.isArray(inp.focus) ? inp.focus : [inp.focus]
  const focus: ResolvedCodeFocus[] = focusList.map((f) => {
    const g = focusIndex(entry, f) as number
    const kind = g < cells ? 'X' : 'Z'
    const c = g < cells ? g : g - cells
    const edges = tanner.edges.filter((e) => e.checkKind === kind && e.check === c)
    return {
      check: g,
      label: `${kind}${c}`,
      edges: edges.map((e) => {
        const at = entry.qubitPos[e.qubit]
        const unrolled: [number, number] = [e.to[0], -e.to[1]]
        const q = bb.qubitCell(e.qubit)
        return {
          qubit: e.qubit,
          letter: e.pauli,
          term: e.term as 0 | 1 | 2,
          kind: e.kind,
          target: `${q.kind}(${q.cell[0]}, ${q.cell[1]})`,
          delta: e.delta,
          wraps: Math.abs(unrolled[0] - at[0]) > 1e-9 || Math.abs(unrolled[1] - at[1]) > 1e-9,
          at: [at[0], at[1]],
          unrolled,
        }
      }),
    }
  })
  let shift: ResolvedCodeShift | null = null
  if (inp.shift) {
    const [a, b] = inp.shift
    const perm = bb.shiftPermutation(a, b)
    const to = bb.qubitCell(perm[0]).cell
    const from = bb.qubitCell(0).cell
    shift = {
      a,
      b,
      name: `x^${a} y^${b}`,
      delta: [wrapSym(to[0] - from[0], l), wrapSym(to[1] - from[1], m)],
      preserves: bb.shiftPreservesCode(a, b),
      sample: { from: 0, to: perm[0] },
    }
  }
  return { l, m, rect: [-0.5, -(2 * m - 0.5), 2 * l - 0.5, 0.5], focus, shift }
}

/** The corners of a plaquette in drawing order (sorted by angle about their centroid). */
function ring(points: [number, number][]): [number, number][] {
  const cx = points.reduce((s, p) => s + p[0], 0) / points.length
  const cy = points.reduce((s, p) => s + p[1], 0) / points.length
  return [...points].sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx))
}

function plaquettesOf(entry: RegisteredCode): ResolvedCodePlaquette[] {
  const gens = entry.stabilizer.generators
  if (entry.family === 'surface')
    return gens.map((g, i) => {
      const pts = g.support().map((q) => entry.qubitPos[q])
      return { checks: [i], kind: entry.checkKind[i] as 'X' | 'Z', points: ring(pts), apex: pts.length === 2 ? entry.checkPos[i] : null }
    })
  return entry.faces.map((f) => ({ checks: f.checks, kind: 'XZ' as const, points: ring(f.qubits.map((q) => entry.qubitPos[q])), apex: null }))
}

function checkLabels(entry: RegisteredCode): string[] {
  const count: Record<string, number> = { X: 0, Z: 0 }
  return entry.checkKind.map((k, i) => {
    if (entry.family === 'torus') return `${k}${k === 'X' ? i : i - entry.bb!.cells}`
    if (k === 'mixed') return `g${i + 1}`
    count[k]++
    return `${k}${count[k]}`
  })
}

const flippedWords = (labels: readonly string[], flipped: readonly (0 | 1)[]): string => {
  const lit = labels.filter((_, i) => flipped[i] === 1)
  if (lit.length === 0) return 'all checks read +1'
  if (lit.length > 4) return `${lit.length} checks read ${MINUS}1`
  return `${lit.join(', ')} read${lit.length === 1 ? 's' : ''} ${MINUS}1`
}

const MEMO = new Map<string, ResolvedCode>()

/** Every derived field from the inputs (shared by resolve and interpolate); memoized by the inputs, since a scroll re-resolves the same state every frame. */
export function codeFrom(inp: CodeInputs): ResolvedCode {
  const key = JSON.stringify(inp)
  const hit = MEMO.get(key)
  if (hit) return hit
  const out = build(inp)
  if (MEMO.size > 48) MEMO.delete(MEMO.keys().next().value as string)
  MEMO.set(key, out)
  return out
}

function build(inp: CodeInputs): ResolvedCode {
  const entry = registeredCode(inp.code)
  const n = entry.n
  const gens = entry.stabilizer.generators
  const dist = distanceOf(entry)
  const labels = checkLabels(entry)
  const layout = inp.view === 'layout'
  const torus = entry.family === 'torus'

  // the overlays (layout only)
  const error = layout && inp.error !== undefined ? (parsePauliText(inp.error, n) as { ok: true; p: Pauli }).p : null
  const syndromeBits = error ? entry.stabilizer.syndrome(error) : null
  // the picture lights the checks only when asked (the decoder below uses the syndrome either way)
  const showSyn = inp.show.includes('syndrome')
  let correction: Pauli | null = null
  let correctionSource: ResolvedCode['correctionSource'] = null
  if (error && (inp.show.includes('correction') || inp.show.includes('residual'))) {
    if (inp.correction !== undefined) {
      correction = (parsePauliText(inp.correction, n) as { ok: true; p: Pauli }).p
      correctionSource = 'authored'
    } else {
      const dec = decoderOf(entry)
      correction = dec ? dec.decode(syndromeBits!) : null
      correctionSource = correction ? 'decoder' : 'none'
    }
  }
  const residual = error && correction && inp.show.includes('residual') ? correction.mul(error) : null
  const residualKind: CodeResidualKind | null = residual ? classifyResidual(entry, residual) : null
  const logicalP = layout && inp.show.includes('logical') ? logicalWitnessOf(entry) : null

  const letterAt = (p: Pauli | null, j: number): CodeLetter | null => (p ? letterOrNull(p.letters()[j]) : null)
  const qubits: ResolvedCodeQubit[] = entry.qubitPos.map(([x, y], j) => {
    const q = torus ? entry.bb!.qubitCell(j) : null
    const e = letterAt(error, j)
    const c = letterAt(correction, j)
    const r = letterAt(residual, j)
    const lg = letterAt(logicalP, j)
    const notes = [e && `error ${e}`, c && `correction ${c}`, r && `residual ${r}`, lg && `in the logical operator as ${lg}`].filter(Boolean)
    const name = q ? `${q.kind} data qubit of cell (${q.cell[0]}, ${q.cell[1]}), number ${j + 1}` : `data qubit ${j + 1}`
    return {
      index: j,
      x,
      y,
      label: torus ? '' : String(j + 1),
      family: q ? q.kind : null,
      cell: q ? q.cell : null,
      error: e,
      correction: c,
      residual: r,
      logical: lg,
      aria: notes.length ? `${name}: ${notes.join(', ')}` : name,
    }
  })
  const checks: ResolvedCodeCheck[] = gens.map((g, i) => {
    const flipped = syndromeBits && showSyn ? (syndromeBits[i] as 0 | 1) : null
    const sup = g.support()
    const [x, y] = entry.checkPos[i]
    const what = `${entry.checkKind[i] === 'mixed' ? '' : `${entry.checkKind[i]} `}check ${labels[i]} on ${sup.length} qubits: ${g.letters().join('')}`
    return { index: i, x, y, kind: entry.checkKind[i], label: labels[i], letters: g.letters().join(''), support: sup, flipped, aria: flipped === null ? what : `${what}, reads ${flipped ? `${MINUS}1` : '+1'}` }
  })
  const edges: ResolvedCodeEdge[] = torus ? [] : gens.flatMap((g, i) => g.support().map((q) => ({ check: i, qubit: q, letter: g.letters()[q] as CodeLetter })))
  const plaq = layout && !torus ? plaquettesOf(entry) : []

  // the bounds of everything drawn
  const xs = [...entry.qubitPos, ...entry.checkPos].map((p) => p[0])
  const ys = [...entry.qubitPos, ...entry.checkPos].map((p) => p[1])
  const tile = layout && torus ? tileOf(entry, inp) : null
  if (tile) {
    xs.push(tile.rect[0], tile.rect[2])
    ys.push(tile.rect[1], tile.rect[3])
  }
  const bounds: [number, number, number, number] = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]

  // the checks view
  let table: ResolvedCode['table'] = null
  if (inp.view === 'checks') {
    const rows = gens.map((g, i) => ({ label: labels[i], letters: g.letters().join(''), kind: entry.checkKind[i] }))
    const errorRows: ResolvedCodeErrorRow[] = (inp.errors ?? []).map((t) => {
      const p = (parsePauliText(t, n) as { ok: true; p: Pauli }).p
      return { letters: p.letters().join(''), text: describePauli(p), syndrome: entry.stabilizer.syndrome(p) as (0 | 1)[] }
    })
    table = { rows, errors: errorRows }
  }
  // the words view
  let words: ResolvedCode['words'] = null
  if (inp.view === 'words') {
    const cw = codewords(entry)
    const list = inp.word === 0 ? cw.zero : inp.word === 1 ? cw.one : cw.plus
    words = { word: inp.word, name: inp.word === 0 ? 'logical |0⟩' : inp.word === 1 ? 'logical |1⟩' : 'logical |+⟩', terms: list.map((t) => ({ bits: t.bits, re: t.amp.re, im: t.amp.im, size: Math.hypot(t.amp.re, t.amp.im) })) }
  }

  const syndrome = syndromeBits && showSyn ? syndromeBits.join('') : null
  const logical = logicalP
    ? {
        letters: logicalP.letters().join(''),
        weight: logicalP.weight(),
        text: torus ? `logical operator, weight ${logicalP.weight()} (an upper bound on d)` : `logical operator: ${describePauli(logicalP)}`,
      }
    : null

  return {
    kind: 'code',
    id: inp.code,
    name: entry.name,
    family: entry.family,
    view: inp.view,
    n,
    k: entry.k,
    rank: entry.rank,
    distance: dist,
    qubits,
    checks,
    edges,
    plaquettes: plaq,
    bounds,
    error: error ? error.letters().join('') : null,
    correction: correction ? correction.letters().join('') : null,
    residual: residual ? residual.letters().join('') : null,
    show: inp.show,
    correctionSource,
    residualKind,
    syndrome,
    logical,
    tile,
    table,
    words,
    inputs: inp,
    shot: inp.shot,
  }
}

export function codeInputs(st: CodeState): CodeInputs {
  const { kind: _kind, view, show, word, ...rest } = st
  void _kind
  return { ...rest, view: view ?? 'layout', show: show ?? [], word: word ?? 0 }
}

export function resolveCodeStage(st: CodeState, _s: number): ResolvedCode {
  void _s
  return codeFrom(codeInputs(st))
}

/* ------------------------------------------------ interpolation ------------------------------------------------ */
/** There is no continuous parameter: a change of code, view or overlay is a different picture and switches at the half-way point. */
export function interpCodeStage(a: ResolvedCode, b: ResolvedCode, t: number): ResolvedCode {
  if (t <= 0) return a
  if (t >= 1) return b
  return t < 0.5 ? a : b
}

/* ------------------------------------------------ validation ------------------------------------------------ */
const dup = (xs: readonly unknown[]): boolean => new Set(xs).size !== xs.length

export function validateCodeStage(st: CodeState): string[] {
  const errs: string[] = []
  if (!isRegisteredCodeId(st.code)) return [`code: unknown code "${String(st.code).slice(0, 24)}" (the registry has ${CODE_IDS.join(', ')})`]
  const entry = registeredCode(st.code)
  const view = st.view ?? 'layout'
  if (!(CODE_VIEWS as readonly string[]).includes(view)) return [`code view: ${CODE_VIEWS.map((v) => `'${v}'`).join(', ')}`]
  const n = entry.n
  const torus = entry.family === 'torus'
  const where = (f: string) => `code ${f}`

  // fields on the wrong view
  const layoutOnly: [string, unknown][] = [['error', st.error], ['correction', st.correction], ['show', st.show], ['focus', st.focus], ['shift', st.shift]]
  if (view !== 'layout') for (const [f, v] of layoutOnly) if (v !== undefined) errs.push(`${where(f)}: only the 'layout' view draws it (this state is the '${view}' view)`)
  if (view !== 'checks' && st.errors !== undefined) errs.push(`${where('errors')}: only the 'checks' view lists errors (use \`error\` on the layout)`)
  if (view !== 'words' && st.word !== undefined) errs.push(`${where('word')}: only the 'words' view draws a code word`)

  // size limits per view
  if (view === 'layout') {
    if (!torus && (n > CODE_LIMITS.layoutQubits || entry.stabilizer.generators.length > CODE_LIMITS.layoutChecks))
      errs.push(`code: ${st.code} has ${n} qubits and ${entry.stabilizer.generators.length} checks; the layout draws at most ${CODE_LIMITS.layoutQubits} qubits and ${CODE_LIMITS.layoutChecks} checks`)
  } else if (n > CODE_LIMITS.tableQubits) errs.push(`code: the '${view}' view draws codes of at most ${CODE_LIMITS.tableQubits} qubits (${st.code} has ${n}); use the layout`)

  if (view === 'layout') {
    let error: Pauli | null = null
    if (st.error !== undefined) {
      const p = parsePauliText(st.error, n)
      if (!p.ok) errs.push(`${where('error')}: ${p.reason}`)
      else error = p.p
    }
    const show = st.show ?? []
    if (!Array.isArray(show) || !show.every((x) => (CODE_SHOW as readonly string[]).includes(x))) errs.push(`${where('show')}: a list of ${CODE_SHOW.map((v) => `'${v}'`).join(', ')}`)
    else {
      if (dup(show)) errs.push(`${where('show')}: each name once`)
      for (const name of ['syndrome', 'correction', 'residual'] as CodeShow[]) if (show.includes(name) && st.error === undefined) errs.push(`${where('show')}: '${name}' needs an \`error\``)
      if (show.includes('residual') && !show.includes('correction')) errs.push(`${where('show')}: 'residual' is error × correction; add 'correction'`)
    }
    if (st.correction !== undefined) {
      const p = parsePauliText(st.correction, n)
      if (!p.ok) errs.push(`${where('correction')}: ${p.reason}`)
      else if (!show.includes('correction') && !show.includes('residual')) errs.push(`${where('correction')}: drawn only with show: ['correction']`)
      else if (error) {
        const a = entry.stabilizer.syndrome(error).join('')
        const b = entry.stabilizer.syndrome(p.p).join('')
        if (a !== b) errs.push(`${where('correction')}: its syndrome ${b} is not the error's ${a}; a correction must light the same checks`)
      }
    } else if (error && show.includes('correction') && !decoderOf(entry)) errs.push(`${where('correction')}: ${st.code} has no lookup decoder; write the \`correction\``)
    if (show.includes('logical') && !logicalWitnessOf(entry)) errs.push(`${where('show')}: ${st.code} has no logical operator to show`)
    // the bicycle tile
    if (st.focus !== undefined || st.shift !== undefined) {
      if (!torus) errs.push(`${where(st.focus !== undefined ? 'focus' : 'shift')}: only the bicycle codes (gross, two-gross) are drawn as a torus tile`)
      else {
        if (st.focus !== undefined) {
          const list = Array.isArray(st.focus) ? st.focus : [st.focus]
          if (list.length < 1 || list.length > CODE_LIMITS.focusMax) errs.push(`${where('focus')}: one or two checks`)
          else {
            const idx = list.map((f) => focusIndex(entry, f))
            for (const x of idx) if (typeof x === 'string') errs.push(`code ${x}`)
            if (!idx.some((x) => typeof x === 'string') && dup(idx)) errs.push(`${where('focus')}: each check once`)
          }
        }
        if (st.shift !== undefined) {
          const bb = entry.bb!
          const sh = st.shift
          if (!Array.isArray(sh) || sh.length !== 2 || !sh.every((v) => Number.isInteger(v))) errs.push(`${where('shift')}: [a, b], two whole numbers (the monomial x^a y^b)`)
          else if (Math.abs(sh[0]) > bb.l || Math.abs(sh[1]) > bb.m) errs.push(`${where('shift')}: |a| ≤ ${bb.l} and |b| ≤ ${bb.m} on this torus`)
        }
      }
    }
  }

  if (view === 'checks') {
    if (st.errors !== undefined) {
      if (!Array.isArray(st.errors) || st.errors.length < 1 || st.errors.length > CODE_LIMITS.errorsMax) errs.push(`${where('errors')}: one to ${CODE_LIMITS.errorsMax} Pauli strings`)
      else
        st.errors.forEach((t, i) => {
          const p = parsePauliText(t, n)
          if (!p.ok) errs.push(`${where(`errors[${i}]`)}: ${p.reason}`)
        })
    }
  }

  if (view === 'words') {
    if (st.word !== undefined && ![0, 1, 'plus'].includes(st.word as CodeWord)) errs.push(`${where('word')}: 0, 1 or 'plus'`)
    else if (!entry.logical) errs.push(`code: ${st.code} encodes ${entry.k} qubits; the words view needs exactly one (|0̄⟩ and |1̄⟩)`)
    else if (n <= CODE_LIMITS.tableQubits) {
      const cw = codewords(entry)
      const list = (st.word ?? 0) === 0 ? cw.zero : st.word === 1 ? cw.one : cw.plus
      if (list.length > CODE_LIMITS.wordsMax) errs.push(`${where('word')}: ${list.length} strings; the words view draws at most ${CODE_LIMITS.wordsMax}`)
    }
  }
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
/* Short lines: the overlay's readout column is about 21 characters wide beside the passport, and the figure's own lines are as short. */

const RESIDUAL_WORDS: Record<CodeResidualKind, string> = {
  identity: 'identity',
  check: 'a check',
  'logical-X': 'logical X',
  'logical-Z': 'logical Z',
  'logical-Y': 'logical Y',
  logical: 'a logical operator',
  detectable: 'still detectable',
}

const pauliOf = (letters: string): Pauli => Pauli.fromLetters([...letters] as ('I' | 'X' | 'Y' | 'Z')[])
/** `prefix: body`, or `short: body` when the longer form would not fit the column. */
const fit = (prefix: string, short: string, body: string): string => (prefix.length + body.length + 2 <= 22 ? `${prefix}: ${body}` : `${short}: ${body}`)

export function codeReadouts(r: ResolvedCode): SvgReadout[] {
  const out: SvgReadout[] = []
  if (r.family === 'torus') {
    out.push({ name: 'code', text: `n = ${r.n} · k = ${r.k}` })
    out.push({ name: 'distance', text: r.distance.d !== null ? `d = ${r.distance.d}` : `d = ${r.distance.reported} (paper)` })
  } else out.push({ name: 'code', text: `n = ${r.n} · k = ${r.k} · ${r.distance.d !== null ? `d = ${r.distance.d}` : 'd unknown'}` })
  if (r.view === 'checks' && r.table) {
    out.push({ name: 'rank', text: `${r.rank} checks · ${r.k} logical` })
  }
  if (r.view === 'words' && r.words) {
    const w = r.words
    const sizes = [...new Set(w.terms.map((t) => fix(t.size, 3)))]
    out.push({ name: 'terms', text: `${w.terms.length} term${w.terms.length === 1 ? '' : 's'}${sizes.length === 1 ? `, each ${sizes[0]}` : ''}` })
  }
  if (r.view === 'layout') {
    if (r.error) out.push({ name: 'error', text: `error: ${tersePauli(pauliOf(r.error))}`, tone: 'op' })
    if (r.syndrome !== null && r.show.includes('syndrome')) {
      const flipped = [...r.syndrome].map((b) => (b === '1' ? 1 : 0)) as (0 | 1)[]
      out.push({ name: 'syndrome', text: flippedWords(r.checks.map((c) => c.label), flipped), tone: 'minus' })
      if (r.checks.length <= 12) out.push({ name: 'pattern', text: `pattern: ${flipped.map((b) => (b ? MINUS : '+')).join(' ')}`, tone: 'silver' })
    }
    if (r.show.includes('correction') && r.error) {
      const body = r.correction !== null ? tersePauli(pauliOf(r.correction)) : 'none'
      out.push({ name: 'correction', text: fit(r.correctionSource === 'authored' ? 'given' : 'correction', 'fix', body), tone: 'plus' })
    }
    if (r.show.includes('residual') && r.error) out.push({ name: 'residual', text: r.residualKind ? `residual: ${RESIDUAL_WORDS[r.residualKind]}` : 'residual: none', tone: 'op' })
    if (r.logical) out.push({ name: 'logical', text: torusLogical(r), tone: 'state' })
    if (r.tile) {
      for (const f of r.tile.focus) {
        const long = f.edges.filter((e) => e.kind === 'long').length
        out.push({ name: `focus-${f.check}`, text: `${f.label}: ${f.edges.length - long} near, ${long} long`, tone: 'silver' })
      }
      if (r.tile.shift) {
        const s = r.tile.shift
        const [dx, dy] = s.delta
        const dir = [dx !== 0 ? `${Math.abs(dx)} ${dx > 0 ? 'east' : 'west'}` : '', dy !== 0 ? `${Math.abs(dy)} ${dy > 0 ? 'north' : 'south'}` : ''].filter(Boolean).join(', ')
        out.push({ name: 'shift', text: `shift ${s.name}`, tone: 'op' })
        out.push({ name: 'shift-move', text: `moves ${dir || 'nowhere'}`, tone: 'op' })
        out.push({ name: 'shift-checks', text: s.preserves ? 'keeps the checks' : 'breaks the checks', tone: 'op' })
      }
    }
  }
  return out
}

function torusLogical(r: ResolvedCode): string {
  const l = r.logical!
  return r.family === 'torus' ? `logical op, weight ${l.weight}` : `logical: ${tersePauli(pauliOf(l.letters))}`
}

/** The accessible text of a picture: its name and readouts joined. */
export const codeSummary = (r: ResolvedCode): string => [r.name, ...codeReadouts(r).map((x) => x.text)].join('; ')
