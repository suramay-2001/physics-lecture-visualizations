/**
 * The recipe registry (docs/specs/papers-platform.md §3): every recipe validates its parameters and returns a stage the
 * kind's own validator accepts, with engine numbers; anything else (an unknown id, a wrong type, an out-of-range value, a
 * broken rule between parameters, a stale version) is refused with a message that names the path. Never throws.
 */
import { describe, expect, it } from 'vitest'
import { validateLayout } from '../stage/resolve'
import '../stage/svg/kinds' // registers the SVG kinds' validators, as a page that draws them does
import { bell } from '../physics/qc/state'
import { groverOptimalK, groverSuccess } from '../physics/qc/grover'
import { int, list, oneOf, optional, shape } from './params'
import { RECIPES, RECIPE_IDS, isRecipeId, runRecipe, type RecipeRef } from './recipes'

const problems = (ref: unknown) => {
  const r = runRecipe(ref, 'here')
  return r.ok ? [] : r.problems
}

describe('params: the closed vocabulary', () => {
  const s = shape({ n: int(1, 10), mode: optional(oneOf(['a', 'b'] as const)), xs: optional(list(int(0, 3), 1, 2)) })
  it('accepts the shape and leaves an optional field out', () => {
    expect(s.check({ n: 3 }, 'p')).toEqual({ ok: true, value: { n: 3 } })
    expect(s.check({ n: 3, mode: 'b', xs: [0, 3] }, 'p')).toEqual({ ok: true, value: { n: 3, mode: 'b', xs: [0, 3] } })
  })
  it('reports every problem at once, each with its path', () => {
    const r = s.check({ n: 2.5, mode: 'c', xs: [0, 9, 1], extra: 1 }, 'p')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.problems).toEqual([
      'p.extra: unknown parameter (allowed: n, mode, xs)',
      'p.n: expected a whole number from 1 to 10, got 2.5',
      "p.mode: expected one of 'a', 'b', got \"c\"",
      'p.xs: expected 1 to 2 items, got 3',
    ])
  })
  it('a missing field, a non-object, an array, a class instance and __proto__ are all refused', () => {
    expect(s.check({}, 'p')).toEqual({ ok: false, problems: ['p.n: missing (expected a whole number from 1 to 10)'] })
    for (const bad of [null, 3, 'n', [1], new Date(0)]) expect(s.check(bad, 'p').ok, String(bad)).toBe(false)
    const proto = JSON.parse('{"n": 1, "__proto__": {"polluted": true}}')
    expect(s.check(proto, 'p')).toEqual({ ok: false, problems: ['p.__proto__: unknown parameter (allowed: n, mode, xs)'] })
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  })
  it('NaN, Infinity and numeric strings are not numbers', () => {
    for (const bad of [Number.NaN, Infinity, '3']) expect(int(1, 10).check(bad, 'n').ok).toBe(false)
  })
})

describe('the registry is an allow-list', () => {
  it('names exactly the demo recipes and the B1 surface-code recipes (recipes.qec.test.ts runs those)', () => {
    expect(RECIPE_IDS).toEqual([
      'bell-amplitudes',
      'grover-plane',
      'circuit-gates',
      'toric-code',
      'rotated-patch',
      'qec-small-code',
      'check-schedule',
      'check-circuit',
      'repetition-history',
      'logical-error-curves',
      'pauli-frame',
      'qldpc-family',
      'bb-code',
      'bb-presentations',
      'bb-schedule',
      'bb-shift',
      'bp-decode',
    ])
    for (const id of RECIPE_IDS) expect(RECIPES[id].id).toBe(id)
  })
  it.each(['nope', '__proto__', 'constructor', 'toString', 'hasOwnProperty', '', 42, null])('unknown recipe %s is refused', (id) => {
    expect(isRecipeId(id)).toBe(false)
    expect(problems({ recipe: id, params: {} })[0]).toMatch(/^here\.recipe: unknown recipe .* \(registered: bell-amplitudes, grover-plane, circuit-gates, toric-code, rotated-patch, qec-small-code, check-schedule, check-circuit, repetition-history, logical-error-curves, pauli-frame, qldpc-family, bb-code, bb-presentations, bb-schedule, bb-shift, bp-decode\)$/)
  })
  it('a ref is an object with recipe, v, params and uses only', () => {
    expect(problems('bell-amplitudes')).toEqual(['here: expected a recipe reference {recipe, params}, got "bell-amplitudes"'])
    expect(problems({ recipe: 'bell-amplitudes', params: { state: 'Phi+' }, code: 'alert(1)' })).toEqual(['here.code: unknown field (a recipe reference has recipe, v, params, uses)'])
  })
  it('a pinned version must match the registry (an old spec never silently draws a changed picture)', () => {
    expect(problems({ recipe: 'grover-plane', v: 1, params: { n: 3 } })).toEqual([])
    expect(problems({ recipe: 'grover-plane', v: 2, params: { n: 3 } })).toEqual(['here.v: the spec asks for grover-plane version 2; the registry has version 1 (re-emit the spec)'])
  })
})

/** Every demo recipe with a few good parameter sets: each must run and draw a stage its kind accepts. */
const GOOD: RecipeRef[] = [
  { recipe: 'bell-amplitudes', params: { state: 'Phi+' } },
  { recipe: 'bell-amplitudes', params: { state: 'Psi-', show: 'probability' } },
  { recipe: 'bell-amplitudes', params: { state: 'Phi-', basis: 'bell' } },
  { recipe: 'grover-plane', params: { n: 2 } },
  { recipe: 'grover-plane', params: { n: 6, marked: 3, steps: 2, mirrors: ['x0perp', 'w0'], arcs: ['alpha', 'step'], readouts: ['angle', 'success', 'kopt'] } },
  { recipe: 'grover-plane', params: { n: 10, steps: 'best', readouts: ['kopt'] } },
  { recipe: 'circuit-gates', params: { qubits: 2, gates: [{ gate: 'H', target: 0 }, { gate: 'CNOT', control: 0, target: 1 }] } },
  { recipe: 'circuit-gates', params: { qubits: 2, gates: [{ gate: 'H', target: 0 }, { gate: 'CNOT', control: 0, target: 1 }], upTo: 1, show: 'both' } },
  { recipe: 'circuit-gates', params: { qubits: 3, init: '001', gates: [{ gate: 'SWAP', target: 0, other: 2 }, { gate: 'CZ', control: 1, target: 2 }, { gate: 'T', target: 0 }], show: 'amplitudes' } },
]

it('sanity: the kind validator the recipes are held to does refuse a bad state', () => {
  expect(validateLayout({ kind: 'grover-plane', search: { n: 2 }, k: 100 })).not.toEqual([])
  expect(validateLayout({ kind: 'amplitudes', state: { bell: '00+00' } })).not.toEqual([])
})

describe.each(GOOD.map((r) => [`${r.recipe} ${JSON.stringify(r.params)}`, r] as const))('recipe %s', (_, ref) => {
  const r = runRecipe(ref)
  it('runs, returns only its declared kinds, and the stage passes the kind’s own validator', () => {
    expect(r.ok ? [] : r.problems).toEqual([])
    if (!r.ok) return
    expect(validateLayout(r.stage)).toEqual([])
    for (const v of Object.values(r.values)) expect(Number.isFinite(v)).toBe(true)
  })
  it('is pure: the same params give the same stage and values', () => {
    const again = runRecipe(JSON.parse(JSON.stringify(ref)))
    expect(again).toEqual(r)
  })
})

describe('the outputs are the engine’s numbers', () => {
  it('bell-amplitudes: sizes and chances from physics/qc/state.ts bell', () => {
    const r = runRecipe({ recipe: 'bell-amplitudes', params: { state: 'Psi-' } })
    if (!r.ok) throw new Error(r.problems.join('\n'))
    const psi = bell('Psi-')
    expect(r.values.a01).toBeCloseTo(Math.hypot(psi[1].re, psi[1].im), 15)
    expect(r.values.a00).toBe(0)
    expect(r.values.p01 + r.values.p10).toBeCloseTo(1, 15)
    expect(r.stage).toEqual({ kind: 'amplitudes', state: { bell: 'Psi-' }, mode: 'amplitude' })
  })
  it('grover-plane: the best number of steps and its chance from physics/qc/grover.ts', () => {
    const r = runRecipe({ recipe: 'grover-plane', params: { n: 4 } })
    if (!r.ok) throw new Error(r.problems.join('\n'))
    expect(r.values.kBest).toBe(groverOptimalK(16, 1))
    expect(r.values.steps).toBe(3)
    expect(r.values.pSuccess).toBeCloseTo(groverSuccess(16, 1, 3), 15)
    expect(r.stage).toEqual({ kind: 'grover-plane', search: { n: 4, marked: 1 }, k: 3 })
  })
  it('circuit-gates: H then CNOT makes the Bell pair (chances ½, 0, 0, ½), and the cursor reads earlier columns', () => {
    const gates = [{ gate: 'H' as const, target: 0 }, { gate: 'CNOT' as const, control: 0, target: 1 }]
    const end = runRecipe({ recipe: 'circuit-gates', params: { qubits: 2, gates } })
    const mid = runRecipe({ recipe: 'circuit-gates', params: { qubits: 2, gates, upTo: 1 } })
    if (!end.ok || !mid.ok) throw new Error('did not run')
    expect([end.values.p00, end.values.p01, end.values.p10, end.values.p11].map((x) => Math.round(x * 1e12) / 1e12)).toEqual([0.5, 0, 0, 0.5])
    expect([mid.values.p00, mid.values.p10].map((x) => Math.round(x * 1e12) / 1e12)).toEqual([0.5, 0.5])
  })
})

describe('bad parameters are refused, with the path and the reason', () => {
  it.each<[string, unknown, string[]]>([
    ['a wrong type', { recipe: 'grover-plane', params: { n: '4' } }, ['here grover-plane params.n: expected a whole number from 1 to 10, got "4"']],
    ['out of range', { recipe: 'grover-plane', params: { n: 12 } }, ['here grover-plane params.n: expected a whole number from 1 to 10, got 12']],
    ['not a whole number', { recipe: 'grover-plane', params: { n: 3, steps: 1.5 } }, ["here grover-plane params.steps: expected a whole number from 0 to 64, or one of 'best', got 1.5"]],
    ['a rule between parameters', { recipe: 'grover-plane', params: { n: 2, marked: 4 } }, ['here grover-plane params.marked: expected a whole number from 1 to 3 (N = 2^2 = 4), got 4']],
    ['an unknown Bell state', { recipe: 'bell-amplitudes', params: { state: 'Chi+' } }, ["here bell-amplitudes params.state: expected one of 'Phi+', 'Phi-', 'Psi+', 'Psi-', got \"Chi+\""]],
    ['a missing parameter', { recipe: 'bell-amplitudes', params: {} }, ["here bell-amplitudes params.state: missing (expected one of 'Phi+', 'Phi-', 'Psi+', 'Psi-')"]],
    ['an unknown parameter', { recipe: 'bell-amplitudes', params: { state: 'Phi+', eval: 'x' } }, ['here bell-amplitudes params.eval: unknown parameter (allowed: state, show, basis)']],
    [
      'a wire outside the register',
      { recipe: 'circuit-gates', params: { qubits: 2, gates: [{ gate: 'X', target: 3 }] } },
      ['here circuit-gates params.gates[0].target: wire 3 is outside the register (qubits 0 to 1)'],
    ],
    [
      'a controlled gate without its control, and a control on its own target',
      { recipe: 'circuit-gates', params: { qubits: 2, gates: [{ gate: 'CNOT', target: 1 }, { gate: 'CZ', control: 0, target: 0 }] } },
      ['here circuit-gates params.gates[0].control: CNOT needs a control wire', 'here circuit-gates params.gates[1].control: the control must differ from the target (0)'],
    ],
    [
      'a cursor past the last gate',
      { recipe: 'circuit-gates', params: { qubits: 1, gates: [{ gate: 'H', target: 0 }], upTo: 2 } },
      ['here circuit-gates params.upTo: expected a whole number from 0 to 1 (the number of gates), got 2'],
    ],
    ['too many gates', { recipe: 'circuit-gates', params: { qubits: 1, gates: Array.from({ length: 25 }, () => ({ gate: 'H', target: 0 })) } }, ['here circuit-gates params.gates: expected 1 to 24 items, got 25']],
  ])('%s', (_, ref, want) => {
    expect(problems(ref)).toEqual(want)
  })
})
