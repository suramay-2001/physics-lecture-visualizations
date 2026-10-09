/**
 * Two spins measured one after the other or together (448 Lecture 10: Alice's and Bob's operators act on their own factor and
 * commute). The state is one of the three the lecture opens with: the singlet, the product |ud⟩, or the path cos t|ud⟩ − sin t|du⟩
 * between them. Each spin is measured along x, y or z and reports ±1. The joint chances come from the Born rule on both outcomes at
 * once (`localBasisProbs`); a sampled pair measures one spin first, collapses the state, then measures the other, in whichever order
 * is asked for. Because the two operators commute, both orders have the same joint chances.
 */
import { type Vec } from '../linalg'
import type { Sign } from './bits'
import { localBasisProbs, measureInBasis } from './measure'
import { bell, ket, udFamily } from './state'

export type Axis = 'x' | 'y' | 'z'
export type TwoSpinKind = 'singlet' | 'ud' | 'path'

/** The pair state: 'singlet' = (|ud⟩ − |du⟩)/√2, 'ud' = |ud⟩ (Alice up, Bob down), 'path' = cos t|ud⟩ − sin t|du⟩ with t in degrees. */
export function twoSpinState(kind: TwoSpinKind, tDeg = 0): Vec {
  if (kind === 'singlet') return bell('01-10')
  if (kind === 'ud') return ket('01')
  if (kind === 'path') return udFamily((tDeg * Math.PI) / 180)
  throw new Error(`twoSpinState: unknown state "${String(kind)}"`)
}

/** The four joint chances of (Alice, Bob) = (+1,+1), (+1,−1), (−1,+1), (−1,−1) when Alice measures `a` and Bob measures `b`. */
export const twoSpinJoint = (psi: Vec, a: Axis, b: Axis): [number, number, number, number] => localBasisProbs(psi, [a, b]) as [number, number, number, number]

/** The chance Alice reads +1 (marginal), the chance Bob reads +1, and the average ⟨a·b⟩ of the product, from the joint chances. */
export function twoSpinSummary(joint: readonly number[]): { alicePlus: number; bobPlus: number; productMinus: number; correlator: number } {
  const [pp, pm, mp, mm] = joint
  return { alicePlus: pp + pm, bobPlus: pp + mp, productMinus: pm + mp, correlator: pp - pm - mp + mm }
}

/**
 * One pair: the two answers when `first` measures first (its answer is drawn from its own chances, the pair collapses, then the other
 * spin answers from what is left). `rand` is a seeded generator. Both orders give the joint chances of `twoSpinJoint`.
 */
export function twoSpinRound(psi: Vec, a: Axis, b: Axis, first: 'A' | 'B', rand: () => number): { a: Sign; b: Sign } {
  const q1 = first === 'A' ? 0 : 1
  const q2 = 1 - q1
  const axes: [Axis, Axis] = [a, b]
  const m1 = measureInBasis(psi, q1, axes[q1])
  let k1: 0 | 1 = rand() < m1.p[0] ? 0 : 1
  if (m1.post[k1] === null) k1 = k1 === 0 ? 1 : 0
  const m2 = measureInBasis(m1.post[k1] as Vec, q2, axes[q2])
  let k2: 0 | 1 = rand() < m2.p[0] ? 0 : 1
  if (m2.post[k2] === null) k2 = k2 === 0 ? 1 : 0
  const sign = (k: 0 | 1): Sign => (k === 0 ? 1 : -1)
  return first === 'A' ? { a: sign(k1), b: sign(k2) } : { a: sign(k2), b: sign(k1) }
}

/** Counts of the four joint outcomes over `n` sampled pairs, in the order (+,+), (+,−), (−,+), (−,−). */
export function twoSpinTally(psi: Vec, a: Axis, b: Axis, first: 'A' | 'B', n: number, rand: () => number): [number, number, number, number] {
  const counts: [number, number, number, number] = [0, 0, 0, 0]
  for (let k = 0; k < n; k++) {
    const r = twoSpinRound(psi, a, b, first, rand)
    counts[(r.a === 1 ? 0 : 2) + (r.b === 1 ? 0 : 1)]++
  }
  return counts
}
