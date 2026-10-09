/**
 * Words and numbers the pure-state Bloch sphere shows (pure, tested). Every value comes from the resolved state
 * (engine): P(+) = (1 + n̂·r)/2, the rotation, the global phase, and the ket itself — including the sign a
 * rotation picks up (R(2π) = −I), which the arrow cannot show.
 */
import { snap, type C } from '../../../physics/complex'
import type { Vec } from '../../../physics/linalg'
import { photonLabAngle } from '../../../physics/polarization'
import type { V3 } from '../../types'

/**
 * Pole labels at the + and − ends of each axis: the six spin kets, or (light, the 'poincare' variant, W-448 L8-A) the six
 * polarizations H/V on ±z, D/A on ±x and C₊/C₋ on ±y, the engine's `POL` kets (physics/polarization.ts).
 */
export const POLE_LABELS = {
  spin: {
    '+x': '$|{+x}\\rangle$',
    '-x': '$|{-x}\\rangle$',
    '+y': '$|{+y}\\rangle$',
    '-y': '$|{-y}\\rangle$',
    '+z': '$|{+z}\\rangle$',
    '-z': '$|{-z}\\rangle$',
  },
  poincare: {
    '+x': '$|D\\rangle$',
    '-x': '$|A\\rangle$',
    '+y': '$|C_+\\rangle$',
    '-y': '$|C_-\\rangle$',
    '+z': '$|H\\rangle$',
    '-z': '$|V\\rangle$',
  },
  // Physics 709 (P-Q1-story §9.2 S3; ruling C1 |0⟩ ≡ |+z⟩): the poles also carry the qubit names
  spin709: {
    '+x': '$|{+x}\\rangle$',
    '-x': '$|{-x}\\rangle$',
    '+y': '$|{+y}\\rangle$',
    '-y': '$|{-y}\\rangle$',
    '+z': '$|0\\rangle = |{+z}\\rangle$',
    '-z': '$|1\\rangle = |{-z}\\rangle$',
  },
} as const
export type Pole = keyof (typeof POLE_LABELS)['spin']

/** The pole labels of a course's sphere (709 names the computational basis at the poles; 448 unchanged). */
export const poleLabelsFor = (course: 'sl448' | 'qc709'): Readonly<Record<Pole, string>> => (course === 'qc709' ? POLE_LABELS.spin709 : POLE_LABELS.spin)

const deg = (rad: number) => Math.round((rad * 180) / Math.PI)

/** 'x' | 'y' | 'z' when v is (±) a coordinate axis, else null. */
export function axisName(v: V3): 'x' | 'y' | 'z' | null {
  const i = v.findIndex((c) => Math.abs(Math.abs(c) - 1) < 1e-9)
  return i < 0 ? null : (['x', 'y', 'z'] as const)[i]
}

/** The top readout: what the current beat is about (measurement, rotation, phase, or just the state). */
export function blochReadout(s: { pPlus: number | null; rot: { axis: V3; angle: number } | null; globalPhase: number; photon?: boolean }): string {
  if (s.pPlus !== null) return `P(+) along n̂ = ${s.pPlus.toFixed(3)}`
  // W-448 L8-A: a turn of the light names BOTH angles, the lab's and the sphere's (the engine's photonLabAngle inverts the doubling)
  if (s.rot && s.photon) return `lab ${deg(photonLabAngle(s.rot.angle))}° → sphere ${deg(s.rot.angle)}°`
  if (s.rot) return `rotation R${axisName(s.rot.axis) ?? 'n'}(${deg(s.rot.angle)}°)`
  if (Math.abs(s.globalPhase) > 1e-9) return `phase ${deg(s.globalPhase)}° · same point`
  return 'pure state'
}

/** Imaginary part with i placed where it cannot be misread: i, −i, i/√2, i√3/2, 0.25i. */
function imag(p: string): string {
  const neg = p.startsWith('-')
  const m = neg ? p.slice(1) : p
  const body = m === '1' ? 'i' : m.startsWith('1/') ? `i${m.slice(1)}` : /[/√]/.test(m) ? `i${m}` : `${m}i`
  return (neg ? '-' : '') + body
}

/** One amplitude in exact form where the engine's `snap` finds one (1/√2, √3/2, …), else 2 decimals (the
 *  readout column is narrow; the exact forms carry the teaching values). Also used by the /lab readouts. */
export function amp(z: C): string {
  // a part that rounds to 0 at 2 decimals is 0 (no "− 0.00i" from a float residue)
  const r = snap(Math.abs(z.re) < 0.005 ? 0 : z.re, 2)
  const i = snap(Math.abs(z.im) < 0.005 ? 0 : z.im, 2)
  if (i === '0') return r
  if (r === '0') return imag(i)
  return i.startsWith('-') ? `${r} − ${imag(i.slice(1))}` : `${r} + ${imag(i)}`
}

/** The ket in the z basis, one short line per amplitude (the readout column is ~160 px): "ψ₁ = 1/√2",
 *  "ψ₂ = i/√2". A sign flip shows here although the point does not move. */
export const ketLines = (ket: Vec): [string, string] => [`ψ₁ = ${amp(ket[0])}`.replace(/-/g, '−'), `ψ₂ = ${amp(ket[1])}`.replace(/-/g, '−')]

/** A statistic in 2 decimals for the narrow readout column: trailing zeros dropped, a real minus, no −0 ("0.5", "−0.35", "0"). */
export const short2 = (x: number): string => {
  if (Math.abs(x) < 0.005) return '0'
  return x.toFixed(2).replace(/\.?0+$/, '').replace('-', '−')
}
