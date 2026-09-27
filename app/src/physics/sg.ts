/**
 * Sequential Stern–Gerlach benches (Lecture 1, Lecture 3 §6).
 *
 * A bench is a source followed by devices. Every device but the last lets ONE of its two output
 * beams continue (the other is blocked); the last device's two beams land on the plate.
 * Each device measures S along its axis, so the atom leaves in |±n⟩ — that is the state-update rule.
 */
import { type Vec } from './linalg'
import { KET, type NamedKet, type Vec3, ketAlong, prob, AXIS, tiltXZ, dot, unit } from './spin'

/** 'x' | 'y' | 'z', or a tilt in degrees in the x–z plane measured from +z toward +x. */
export type Axis = 'x' | 'y' | 'z' | number
export type Sign = '+' | '-'

export interface Bench {
  /** 'oven' = unpolarized silver atoms (50/50 at the first device, whatever its axis). */
  source: 'oven' | NamedKet
  axes: Axis[]
  /** keep[k] = which output of device k continues to device k+1. Length = axes.length − 1. */
  keep: Sign[]
}

export function axisVector(a: Axis): Vec3 {
  if (typeof a === 'number') return tiltXZ((a * Math.PI) / 180)
  return AXIS[a]
}

export function axisLabel(a: Axis): string {
  return typeof a === 'number' ? (a === 0 ? 'z' : a === 90 ? 'x' : `${a}°`) : a
}

const outState = (a: Axis, s: Sign): Vec => {
  const n = axisVector(a)
  return ketAlong(s === '+' ? n : [-n[0], -n[1], -n[2]])
}

export interface BenchTheory {
  plus: number // P(atom lands in the + spot of the last device)
  minus: number
  blocked: number[] // P(atom is stopped after device k)
}

/** Exact Born-rule probabilities for every fate of an atom. */
export function benchTheory(b: Bench): BenchTheory {
  let alive = 1
  let state: Vec | null = b.source === 'oven' ? null : KET[b.source]
  const blocked: number[] = []
  const pPlus = (a: Axis) => (state === null ? 0.5 : prob(outState(a, '+'), state))
  for (let k = 0; k < b.axes.length - 1; k++) {
    const p = pPlus(b.axes[k])
    const pass = b.keep[k] === '+' ? p : 1 - p
    blocked.push(alive * (1 - pass))
    alive *= pass
    state = outState(b.axes[k], b.keep[k])
  }
  const p = pPlus(b.axes[b.axes.length - 1])
  return { plus: alive * p, minus: alive * (1 - p), blocked }
}

export interface Fate {
  /** Index of the device where it was blocked, or 'plus' | 'minus' at the plate. */
  end: number | 'plus' | 'minus'
  /** The outcome sign at each device it passed through. */
  path: Sign[]
}

/** One atom through the bench, using uniform random numbers from `rand`. */
export function fireAtom(b: Bench, rand: () => number): Fate {
  let state: Vec | null = b.source === 'oven' ? null : KET[b.source]
  const path: Sign[] = []
  for (let k = 0; k < b.axes.length; k++) {
    const p = state === null ? 0.5 : prob(outState(b.axes[k], '+'), state)
    const s: Sign = rand() < p ? '+' : '-'
    path.push(s)
    state = outState(b.axes[k], s)
    if (k < b.axes.length - 1 && s !== b.keep[k]) return { end: k, path }
  }
  return { end: path[path.length - 1] === '+' ? 'plus' : 'minus', path }
}

export interface Tally {
  plus: number
  minus: number
  blocked: number[]
}

export function fireMany(b: Bench, n: number, rand: () => number, into?: Tally): Tally {
  const t: Tally = into
    ? { plus: into.plus, minus: into.minus, blocked: [...into.blocked] }
    : { plus: 0, minus: 0, blocked: Array(Math.max(0, b.axes.length - 1)).fill(0) }
  for (let i = 0; i < n; i++) {
    const f = fireAtom(b, rand)
    if (f.end === 'plus') t.plus++
    else if (f.end === 'minus') t.minus++
    else t.blocked[f.end]++
  }
  return t
}

/** Average deflection ⟨σ_n⟩ for a spin prepared along m: n·m (Lecture 1's "N·M"). */
export const averageDeflection = (n: Axis, m: Axis): number => dot(unit(axisVector(n)), unit(axisVector(m)))

/** Spread of single ±1 readings along n for atoms prepared along m (Lecture 3 §7): Δσ = √(1 − (n·m)²). */
export const spreadAlong = (n: Axis, m: Axis): number => Math.sqrt(Math.max(0, 1 - averageDeflection(n, m) ** 2))
