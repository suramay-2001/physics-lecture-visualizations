/**
 * The order in which the check circuits of a rotated surface-code patch touch their qubits (P-B1-story §9.1, b1-cycle:b2; the paper's appendix A.5,
 * Eq. 67). Every check has a check qubit that is coupled, in four steps, to the data qubits at the corners TL, TR, BL, BR of its face (a boundary check
 * has only two corners). All X checks use one corner order and all Z checks another. Two conditions are tested:
 *   conflict-free: no data qubit is asked to take part in two CNOTs in the same step;
 *   valid (sequentially equivalent): for every neighbouring X and Z check the shared qubits at which the X check goes first are EVEN in number, so the
 *   two checks act as if one were measured completely after the other (otherwise the readouts are wrong).
 * Numpy twin: pipeline/qec_numpy.py `schedule_ok` (plus a tableau run over all 96 clash-free pairs, make_qec_fixtures.py).
 */
import { rotatedSurfaceCode } from './codes'

export const CORNERS = ['TL', 'TR', 'BL', 'BR'] as const
export type Corner = (typeof CORNERS)[number]

export interface PatchCheck {
  /** index in the patch's check list (the same order as rotatedSurfaceCode().checks) */
  index: number
  type: 'X' | 'Z'
  /** the data qubit at each corner of the face that exists (4 in the bulk, 2 on a boundary) */
  corners: Partial<Record<Corner, number>>
  /** where the face sits, in data-qubit units (x = column, y = row) */
  center: [number, number]
}

/** The checks of the rotated patch of distance d with their corners named. */
export function patchChecks(d: number): PatchCheck[] {
  const r = rotatedSurfaceCode(d)
  return r.checks.map((c, index) => {
    const row = Math.round(c.center[1] - 0.5)
    const col = Math.round(c.center[0] - 0.5)
    const at: [Corner, number, number][] = [
      ['TL', row, col],
      ['TR', row, col + 1],
      ['BL', row + 1, col],
      ['BR', row + 1, col + 1],
    ]
    const corners: Partial<Record<Corner, number>> = {}
    for (const [name, rr, cc] of at) if (rr >= 0 && rr < d && cc >= 0 && cc < d) corners[name] = rr * d + cc
    return { index, type: c.type, corners, center: c.center }
  })
}

export interface ScheduleViolation {
  /** index of the X check and of the Z check */
  x: number
  z: number
  /** the data qubits both touch */
  shared: number[]
  /** how many of them the X check reaches first (odd = a violation) */
  xFirst: number
}

export interface ScheduleResult {
  conflictFree: boolean
  valid: boolean
  /** neighbouring X/Z pairs that are read in clashing order (odd number of shared qubits where X goes first) */
  violations: ScheduleViolation[]
  /** (qubit, step) places used by two checks at once */
  clashes: { qubit: number; step: number }[]
}

function stepsOf(order: readonly Corner[]): Record<Corner, number> {
  if (order.length !== 4 || new Set(order).size !== 4 || !order.every((c) => (CORNERS as readonly string[]).includes(c))) throw new Error('a check order lists the four corners TL, TR, BL, BR once each')
  const out = {} as Record<Corner, number>
  order.forEach((c, i) => (out[c] = i + 1))
  return out
}

/** Step (1–4) at which check `c` touches the qubit at each of its corners. */
export function checkSteps(c: PatchCheck, xOrder: readonly Corner[], zOrder: readonly Corner[]): { corner: Corner; qubit: number; step: number }[] {
  const s = stepsOf(c.type === 'X' ? xOrder : zOrder)
  return CORNERS.filter((k) => c.corners[k] !== undefined)
    .map((k) => ({ corner: k, qubit: c.corners[k] as number, step: s[k] }))
    .sort((a, b) => a.step - b.step)
}

export function scheduleCheck(d: number, xOrder: readonly Corner[], zOrder: readonly Corner[]): ScheduleResult {
  const checks = patchChecks(d)
  const time = new Map<string, number>() // `${check}:${qubit}` -> step
  const use = new Map<string, number>() // `${qubit}:${step}` -> how many checks
  for (const c of checks)
    for (const { qubit, step } of checkSteps(c, xOrder, zOrder)) {
      time.set(`${c.index}:${qubit}`, step)
      use.set(`${qubit}:${step}`, (use.get(`${qubit}:${step}`) ?? 0) + 1)
    }
  const clashes = [...use.entries()].filter(([, k]) => k > 1).map(([key]) => ({ qubit: Number(key.split(':')[0]), step: Number(key.split(':')[1]) }))
  const violations: ScheduleViolation[] = []
  for (const a of checks.filter((c) => c.type === 'X'))
    for (const b of checks.filter((c) => c.type === 'Z')) {
      const shared = (Object.values(a.corners) as number[]).filter((q) => time.has(`${b.index}:${q}`))
      if (!shared.length) continue
      const xFirst = shared.filter((q) => (time.get(`${a.index}:${q}`) as number) < (time.get(`${b.index}:${q}`) as number)).length
      if (xFirst % 2) violations.push({ x: a.index, z: b.index, shared, xFirst })
    }
  return { conflictFree: clashes.length === 0, valid: clashes.length === 0 && violations.length === 0, violations, clashes }
}

function permutations<T>(xs: readonly T[]): T[][] {
  if (xs.length <= 1) return [xs.slice()]
  return xs.flatMap((x, i) => permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]))
}

/** All 24 × 24 ordered (X order, Z order) pairs on a patch of distance d (d = 3 in the chapter): how many are clash-free and how many are also valid. */
export function scheduleCount(d = 3): { total: number; conflictFree: number; valid: number } {
  let total = 0
  let conflictFree = 0
  let valid = 0
  const perms = permutations(CORNERS)
  for (const x of perms)
    for (const z of perms) {
      total++
      const r = scheduleCheck(d, x, z)
      if (r.conflictFree) conflictFree++
      if (r.conflictFree && r.valid) valid++
    }
  return { total, conflictFree, valid }
}
