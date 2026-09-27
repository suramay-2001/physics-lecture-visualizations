/**
 * Frame check: the measuring bench of the lab foundation (pure; every number from app/src/physics).
 * One control, the turn φ about z applied to |+x⟩: ψ = R_z(φ)|+x⟩ with R_z(φ) = diag(e^{−iφ/2}, e^{iφ/2})
 * (Lecture 6). The bead sits at the engine's Bloch vector r(ψ); the readouts print φ, r and the ket.
 * Its job is the handedness check of ruling #1: R_z(+90°) must carry the bead from |+x⟩ onto the |+y⟩ label.
 */
import { apply, type Vec } from '../physics/linalg'
import { blochVector, KET, Rz, type Vec3 } from '../physics/spin'
import { ketLines, short2 } from '../stage/scenes/bloch/blochLabels'

/** Degrees per step of the ± pad and its DOM twin. */
export const PHI_STEP = 15
/**
 * The control runs over two full turns, [0°, 720°): R_z(360°) = −I (the ket changes sign although the point is
 * home), and only R_z(720°) = I brings the ket back (Lecture 7 §7.2). A [0°, 360°) control would hide that.
 */
export const PHI_TURN = 720

/** Any angle in degrees → [0, 720), whole degrees (the slider's resolution). */
export function wrapDeg(deg: number): number {
  if (!Number.isFinite(deg)) return 0
  const d = Math.round(deg) % PHI_TURN
  return d < 0 ? d + PHI_TURN : d
}

export interface FrameView {
  phiDeg: number
  ket: Vec
  /** Bloch vector of ψ (engine). */
  r: Vec3
  /** DOM readout lines (engine values, formatted). */
  readouts: string[]
}

export function frameView(phiDeg: number): FrameView {
  const phi = wrapDeg(phiDeg)
  const ket = apply(Rz((phi * Math.PI) / 180), KET['+x'])
  const r = blochVector(ket)
  const [k1, k2] = ketLines(ket)
  return {
    phiDeg: phi,
    ket,
    r,
    readouts: [`R_z(${phi}°) |+x⟩`, `r = (${r.map(short2).join(', ')})`, k1, k2],
  }
}
