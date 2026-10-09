/**
 * Photon polarization as a second qubit (Lecture 8, notes §§8.2–8.3; Townsend 2e §2.7). The app's names for the light
 * states: |H⟩ and |V⟩ are the engine's spin kets +z and −z, |D⟩ and |A⟩ are +x and −x, and |C₊⟩, |C₋⟩ are +y and −y
 * (|C₊⟩ = (1, i)/√2, the same vector as `KET['+y']`). Nothing here knows about spin: the point of the lecture is that the
 * same two-dimensional arithmetic describes both, with one difference in the geometry (a physical turn of light by φ moves
 * its Bloch point by 2φ; a spin's turn moves it by φ).
 *
 * Rosetta (rulings 448-L8L11, L8 R3): the notes' ϑ (the angle of a linear polarization from H) is χ here; the added
 * physical turn is φ. ħ = 1 is irrelevant in this module (no operators with dimensions).
 */
import { abs2, arg, c } from './complex'
import { type Mat, type Vec, apply, identity, inner, madd, mat, mscale, vec } from './linalg'
import { KET, SIGMA_Y, blochAngle, blochVector, rotation, sandwich, type Vec3 } from './spin'

/** The six named polarizations, written in the H/V basis (the engine's z basis). */
export const POL = {
  H: KET['+z'],
  V: KET['-z'],
  D: KET['+x'],
  A: KET['-x'],
  Cp: KET['+y'],
  Cm: KET['-y'],
} as const
export type PolName = keyof typeof POL

/** |p(χ)⟩ = cos χ |H⟩ + sin χ |V⟩: linear polarization at angle χ from horizontal (real amplitudes). */
export const polKet = (chi: number): Vec => vec(Math.cos(chi), Math.sin(chi))

/**
 * The physical turn of a polarization by φ about the beam, in the H/V basis: R_pol(φ) = [[cos φ, −sin φ], [sin φ, cos φ]]
 * (notes §8.3: the amplitudes turn like the transverse electric field; positive φ carries H toward V).
 */
export const Rpol = (phi: number): Mat => mat([[Math.cos(phi), -Math.sin(phi)], [Math.sin(phi), Math.cos(phi)]])

/** The chance that an analyzer set at χ_a passes a photon of polarization χ: |⟨p(χ_a)|p(χ)⟩|² (= cos²(χ − χ_a)). */
export const analyzerProb = (chi: number, chiA: number): number => abs2(inner(polKet(chiA), polKet(chi)))

/** Both ports of an analyzer: [aligned, perpendicular] chances. They always add to 1 (the ports are orthogonal polarizations). */
export function analyzerPorts(chi: number, chiA: number): [number, number] {
  return [analyzerProb(chi, chiA), analyzerProb(chi, chiA + Math.PI / 2)]
}

/** Which analyzer angle blocks a photon of polarization χ completely: the perpendicular, χ + 90° (mod 180°, in [0, π)). */
export const blockingAngle = (chi: number): number => (((chi + Math.PI / 2) % Math.PI) + Math.PI) % Math.PI

/**
 * The same physical turn written as a spin rotation on the Bloch sphere: R_pol(φ) = e^{−iφσ_y} is `rotation(ŷ, 2φ)`
 * (spin.ts `rotation(n, θ)` carries e^{−iθ n·σ/2}), so the photon's Bloch point turns about y by TWICE the lab angle.
 */
export const photonTurn = (phi: number): Mat => rotation([0, 1, 0], 2 * phi)
/** An electron turned by φ: the spin rotation e^{−iφσ_y/2}, whose Bloch point turns by φ itself (the 1× contrast, notes §8.3). */
export const electronTurn = (phi: number): Mat => rotation([0, 1, 0], phi)

/** The Bloch vector of |p(χ)⟩ with H and V at the poles: (sin 2χ, 0, cos 2χ). The doubling is computed from the ket. */
export const polBloch = (chi: number): Vec3 => blochVector(polKet(chi))

/** How far a turn of the carrier by φ moves its Bloch point away from where |H⟩ sits (radians): 2φ for light, φ for a spin. */
export function sphereTurn(carrier: 'photon' | 'electron', phi: number): number {
  const U = carrier === 'photon' ? photonTurn(phi) : electronTurn(phi)
  return blochAngle(POL.H, apply(U, POL.H))
}

/** The phase R_pol(φ) puts on a circular state: arg ⟨C_s|R_pol(φ)|C_s⟩ with s = +1 for |C₊⟩ and −1 for |C₋⟩ (= −sφ). */
export function circularPhase(s: 1 | -1, phi: number): number {
  const ket = s === 1 ? POL.Cp : POL.Cm
  return arg(sandwich(Rpol(phi), ket))
}

/** R_pol(φ) assembled as cos φ I − i sin φ σ_y (notes §8.3: the generator is σ_y); equals `Rpol(φ)` entry for entry. */
export const rpolFromGenerator = (phi: number): Mat =>
  madd(mscale(identity(2), Math.cos(phi)), mscale(SIGMA_Y, c(0, -Math.sin(phi))))
