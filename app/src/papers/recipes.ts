/**
 * The recipe registry (docs/specs/papers-platform.md §3; rulings papers.md R4): the ONLY door from a paper spec (data a
 * tool wrote) into the engine. A recipe is an engine computation with typed, validated parameters that returns props for
 * an EXISTING stage kind, plus the named numbers it computed (a computed claim cites one by name).
 *
 *   - Allow-listed: `RECIPES` is a literal object; `runRecipe` looks an id up with Object.hasOwn, so `__proto__`,
 *     `constructor` and every other name outside the list are unknown. Nothing is imported, required or evaluated from
 *     data (security/noEval.security.test.ts covers this file like every other).
 *   - Typed: every parameter goes through papers/params.ts; unknown keys, wrong types, non-integers, out-of-range values
 *     and the rules between parameters are rejected with a message that names the path.
 *   - Pure: `run` calls physics/ functions only and returns plain data (same params → same stage and values).
 *   - Versioned: a spec ref may pin `v`; a mismatch is refused, so an old spec never silently draws a changed picture.
 *
 * Demo recipes on today's engine; the QEC recipes (a bivariate bicycle code on an l × m torus, …) join this table later.
 * Lazy: only the papers pages and the paper loaders import it (build/chunks.test.ts rule (q)).
 */
import { abs } from '../physics/complex'
import { runCircuit, validateCircuit, type Circuit, type GateOp } from '../physics/qc/circuit'
import { groverAngle, groverOptimalK, groverSuccess } from '../physics/qc/grover'
import { bell, bitsOfIndex } from '../physics/qc/state'
import { GROVER_ARCS, GROVER_MIRRORS, GROVER_READOUTS, type StageKind, type StageLayout, type StageState } from '../content/stage'
import { bits, bool, either, int, isPlainObject, list, oneOf, optional, shape, shown, type Param } from './params'

/** The registry's own version: bumped when a recipe is removed or the ref format changes (a recipe's own `version` covers the rest). */
export const RECIPE_REGISTRY_VERSION = 1

export interface RecipeOutput {
  stage: StageLayout
  /** Named engine numbers (keys /^[A-Za-z][A-Za-z0-9]*$/), the only numbers a computed claim may cite. */
  values: Readonly<Record<string, number>>
}

export interface RecipeDef<P> {
  id: string
  /** Bumped whenever a parameter or an output changes meaning. */
  version: number
  /** What it draws, for docs and errors. */
  title: string
  /** The stage kinds it may return (checked on every run). */
  kinds: readonly StageKind[]
  params: Param<P>
  /** Rules between parameters; each problem starts with `params.<name>`. */
  rules?: (p: P) => string[]
  run: (p: P) => RecipeOutput
}

const def = <P>(d: RecipeDef<P>): RecipeDef<P> => d

/* ---------------------------------------------------------------------------------------------- */
/* bell-amplitudes: one of the four Bell states as bars                                            */
/* ---------------------------------------------------------------------------------------------- */

export const BELL_STATES = ['Phi+', 'Phi-', 'Psi+', 'Psi-'] as const

const bellAmplitudes = def({
  id: 'bell-amplitudes',
  version: 1,
  title: 'A Bell state’s amplitudes (or chances), in the computational or the Bell basis',
  kinds: ['amplitudes'],
  params: shape({
    state: oneOf(BELL_STATES),
    show: optional(oneOf(['amplitude', 'probability'] as const)),
    basis: optional(oneOf(['computational', 'bell'] as const)),
  }),
  run: (p) => {
    const psi = bell(p.state)
    const values: Record<string, number> = {}
    psi.forEach((a, i) => {
      const b = bitsOfIndex(i, 2)
      values[`a${b}`] = abs(a)
      values[`p${b}`] = abs(a) ** 2
    })
    const stage: StageState = {
      kind: 'amplitudes',
      state: { bell: p.state },
      mode: p.show ?? 'amplitude',
      ...(p.basis === 'bell' ? { inBasis: 'bell' as const } : {}),
    }
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* grover-plane: Grover's search in its one real plane, at N = 2ⁿ                                  */
/* ---------------------------------------------------------------------------------------------- */

const noRepeats = <T>(xs: readonly T[] | undefined, at: string): string[] =>
  xs && new Set(xs).size !== xs.length ? [`${at}: lists an entry twice (${shown(xs)})`] : []

const groverPlane = def({
  id: 'grover-plane',
  version: 1,
  title: 'Grover’s search in its real plane: n qubits (N = 2ⁿ strings), M marked, after k steps (default: the best k)',
  kinds: ['grover-plane'],
  params: shape({
    n: int(1, 10),
    marked: optional(int(1, 1023)),
    steps: optional(either(int(0, 64), oneOf(['best'] as const))),
    mirrors: optional(list(oneOf(GROVER_MIRRORS), 1, GROVER_MIRRORS.length)),
    arcs: optional(list(oneOf(GROVER_ARCS), 1, GROVER_ARCS.length)),
    readouts: optional(list(oneOf(GROVER_READOUTS), 1, GROVER_READOUTS.length)),
  }),
  rules: (p) => {
    const N = 2 ** p.n
    const bad: string[] = []
    if (p.marked !== undefined && p.marked >= N) bad.push(`params.marked: expected a whole number from 1 to ${N - 1} (N = 2^${p.n} = ${N}), got ${p.marked}`)
    if (p.arcs?.includes('step') && p.steps === 0) bad.push(`params.arcs: 'step' needs at least one step (params.steps is 0)`)
    bad.push(...noRepeats(p.mirrors, 'params.mirrors'), ...noRepeats(p.arcs, 'params.arcs'), ...noRepeats(p.readouts, 'params.readouts'))
    return bad
  },
  run: (p) => {
    const N = 2 ** p.n
    const M = p.marked ?? 1
    const kBest = groverOptimalK(N, M)
    const k = p.steps === undefined || p.steps === 'best' ? kBest : p.steps
    const stage: StageState = {
      kind: 'grover-plane',
      search: { n: p.n, marked: M },
      k,
      ...(p.mirrors ? { mirrors: p.mirrors } : {}),
      ...(p.arcs ? { arcs: p.arcs } : {}),
      ...(p.readouts ? { readouts: p.readouts } : {}),
    }
    return { stage, values: { N, M, alphaDeg: (groverAngle(N, M) * 180) / Math.PI, kBest, steps: k, pSuccess: groverSuccess(N, M, k) } }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* circuit-gates: a circuit from a list of named gates, one per column                             */
/* ---------------------------------------------------------------------------------------------- */

export const RECIPE_GATES = ['H', 'X', 'Y', 'Z', 'S', 'T', 'CNOT', 'CZ', 'SWAP'] as const
type RecipeGate = (typeof RECIPE_GATES)[number]
const CONTROLLED: readonly RecipeGate[] = ['CNOT', 'CZ']

const gateSpec = shape({ gate: oneOf(RECIPE_GATES), target: int(0, 4), control: optional(int(0, 4)), other: optional(int(0, 4)) })

function opOf(g: { gate: RecipeGate; target: number; control?: number; other?: number }): GateOp {
  if (g.gate === 'CNOT') return { op: 'gate', gate: 'X', targets: [g.target], controls: [g.control!] }
  if (g.gate === 'CZ') return { op: 'gate', gate: 'Z', targets: [g.target], controls: [g.control!] }
  if (g.gate === 'SWAP') return { op: 'gate', gate: 'SWAP', targets: [g.target, g.other!] }
  return { op: 'gate', gate: g.gate, targets: [g.target] }
}

const circuitGates = def({
  id: 'circuit-gates',
  version: 1,
  title: 'A circuit built from a list of named gates (one per column), drawn as wires, as the state’s bars, or both',
  kinds: ['circuit', 'amplitudes'],
  params: shape({
    qubits: int(1, 5),
    gates: list(gateSpec, 1, 24),
    upTo: optional(int(0, 24)),
    init: optional(bits(1, 5)),
    show: optional(oneOf(['circuit', 'amplitudes', 'both'] as const)),
    /** Draw the bars' "after column k" line (only with show 'amplitudes'; default false there: the wires are not drawn). */
    column: optional(bool()),
  }),
  rules: (p) => {
    const bad: string[] = []
    const wire = (w: number | undefined, at: string) => {
      if (w !== undefined && w >= p.qubits) bad.push(`${at}: wire ${w} is outside the register (qubits 0 to ${p.qubits - 1})`)
    }
    p.gates.forEach((g, i) => {
      const at = `params.gates[${i}]`
      wire(g.target, `${at}.target`)
      wire(g.control, `${at}.control`)
      wire(g.other, `${at}.other`)
      if (CONTROLLED.includes(g.gate)) {
        if (g.control === undefined) bad.push(`${at}.control: ${g.gate} needs a control wire`)
        else if (g.control === g.target) bad.push(`${at}.control: the control must differ from the target (${g.target})`)
      } else if (g.control !== undefined) bad.push(`${at}.control: ${g.gate} takes no control (use CNOT or CZ)`)
      if (g.gate === 'SWAP') {
        if (g.other === undefined) bad.push(`${at}.other: SWAP needs a second wire`)
        else if (g.other === g.target) bad.push(`${at}.other: SWAP needs two different wires`)
      } else if (g.other !== undefined) bad.push(`${at}.other: only SWAP takes a second wire`)
    })
    if (p.upTo !== undefined && p.upTo > p.gates.length) bad.push(`params.upTo: expected a whole number from 0 to ${p.gates.length} (the number of gates), got ${p.upTo}`)
    if (p.init !== undefined && p.init.length !== p.qubits) bad.push(`params.init: expected ${p.qubits} bits (one per qubit), got ${p.init.length}`)
    if (p.column !== undefined && p.show !== 'amplitudes') bad.push(`params.column: only with show 'amplitudes'`)
    return bad
  },
  run: (p) => {
    const circuit: Circuit = { version: 1, qubits: p.qubits, ...(p.init ? { init: p.init } : {}), columns: p.gates.map((g) => [opOf(g)]) }
    const v = validateCircuit(circuit)
    if (!v.ok) throw new Error(v.reason)
    const upTo = p.upTo ?? p.gates.length
    const psi = runCircuit(circuit).states[upTo]
    const values: Record<string, number> = {}
    psi.forEach((a, i) => (values[`p${bitsOfIndex(i, p.qubits)}`] = abs(a) ** 2))
    const wires: StageState = { kind: 'circuit', circuit, upTo }
    const bars: StageState = { kind: 'amplitudes', state: { circuit, upTo }, ...(p.show === 'amplitudes' && !p.column ? { showColumn: false } : {}) }
    const stage: StageLayout = p.show === 'amplitudes' ? bars : p.show === 'both' ? { layout: 'split', top: wires, bottom: bars } : wires
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* The registry                                                                                    */
/* ---------------------------------------------------------------------------------------------- */

export const RECIPES = {
  'bell-amplitudes': bellAmplitudes,
  'grover-plane': groverPlane,
  'circuit-gates': circuitGates,
} as const

export type RecipeId = keyof typeof RECIPES
export type RecipeParams<K extends RecipeId> = (typeof RECIPES)[K] extends RecipeDef<infer P> ? P : never
/**
 * A spec's reference to a recipe: what a beat's stage (or a split half, a reveal's stage, a derivation view) and a computed
 * claim's `from` may hold instead of a hand-written stage state. `uses` names the reported claims (papers.md R3) whose
 * printed values the params repeat, so a computation that uses the paper's number says so.
 */
export type RecipeRef = { [K in RecipeId]: { recipe: K; v?: number; params: RecipeParams<K>; uses?: string[] } }[RecipeId]

export const RECIPE_IDS = Object.keys(RECIPES) as RecipeId[]
export const isRecipeId = (x: unknown): x is RecipeId => typeof x === 'string' && Object.hasOwn(RECIPES, x)
/** Does a stage slot hold a recipe reference (rather than a hand-written stage state)? */
export const isRecipeRef = (x: unknown): x is { recipe: unknown } => isPlainObject(x) && Object.hasOwn(x, 'recipe')

const REF_KEYS = ['recipe', 'v', 'params', 'uses']
const VALUE_KEY = /^[A-Za-z][A-Za-z0-9]*$/

export type RecipeRun = ({ ok: true; recipe: RecipeId } & RecipeOutput) | { ok: false; problems: string[] }

/**
 * Check a recipe reference from untrusted data and run it. Every problem is reported at once, each prefixed with `at`
 * ("P1 p1-why-codes:b2 stage"). The engine's own refusal (a throw) becomes a problem too: a run never throws.
 */
export function runRecipe(ref: unknown, at = 'recipe'): RecipeRun {
  if (!isPlainObject(ref)) return { ok: false, problems: [`${at}: expected a recipe reference {recipe, params}, got ${shown(ref)}`] }
  const problems: string[] = []
  for (const k of Object.keys(ref)) if (!REF_KEYS.includes(k)) problems.push(`${at}.${k}: unknown field (a recipe reference has ${REF_KEYS.join(', ')})`)
  const id = ref.recipe
  if (!isRecipeId(id)) return { ok: false, problems: [...problems, `${at}.recipe: unknown recipe ${shown(id)} (registered: ${RECIPE_IDS.join(', ')})`] }
  const d = RECIPES[id] as RecipeDef<unknown>
  if (ref.v !== undefined && ref.v !== d.version) problems.push(`${at}.v: the spec asks for ${id} version ${shown(ref.v)}; the registry has version ${d.version} (re-emit the spec)`)
  if (ref.uses !== undefined && !(Array.isArray(ref.uses) && ref.uses.every((u) => typeof u === 'string' && /^[a-z0-9-]+$/.test(u))))
    problems.push(`${at}.uses: expected a list of reported-claim ids, got ${shown(ref.uses)}`)
  const params = d.params.check(ref.params === undefined ? {} : ref.params, `${at} ${id} params`)
  if (!params.ok) return { ok: false, problems: [...problems, ...params.problems] }
  problems.push(...(d.rules?.(params.value) ?? []).map((p) => `${at} ${id} ${p}`))
  if (problems.length) return { ok: false, problems }
  let out: RecipeOutput
  try {
    out = d.run(params.value)
  } catch (e) {
    return { ok: false, problems: [`${at} ${id}: the engine refused these parameters (${e instanceof Error ? e.message : shown(e)})`] }
  }
  const kinds = 'layout' in out.stage ? (out.stage.layout === 'split' ? [out.stage.top.kind, out.stage.bottom.kind] : [out.stage.main.kind, out.stage.inset.kind]) : [out.stage.kind]
  for (const k of kinds) if (!d.kinds.includes(k)) problems.push(`${at} ${id}: returned the kind '${k}', which it does not declare (${d.kinds.join(', ')})`)
  for (const [k, v] of Object.entries(out.values)) if (!VALUE_KEY.test(k) || !Number.isFinite(v)) problems.push(`${at} ${id}: output ${k} = ${v} is not a named finite number`)
  return problems.length ? { ok: false, problems } : { ok: true, recipe: id, ...out }
}
