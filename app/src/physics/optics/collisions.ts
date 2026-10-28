/**
 * The Optics Lab engine, part two (Metcalf and van der Straten, Chapters 6 and 7): cold collisions (the Langevin barrier and the partial
 * waves), the fountain clock, the atom mirror and splitter, and the line widths of thermal vapours. SI units; the atoms and their masses
 * come from `cooling.ts`. The long-range constants C₆ are STATED INPUTS (Derevianko et al., Phys. Rev. Lett. 82, 3589 (1999)), given in
 * atomic units and converted here. Not in the entry closure (imported by the optics pages' values, the lazy `plot` kind and the bench
 * presets); the numpy twins find each barrier by bounded minimisation, each threshold by root finding and each fringe width numerically.
 */
import { C_LIGHT, HBAR, H_PLANCK, K_BOLTZMANN } from '../constants'
import { G_STANDARD, waveNumber, type AtomLine } from './cooling'

/** E_h a₀⁶ in J·m⁶ (Hartree 4.3597447222×10⁻¹⁸ J, Bohr radius 5.29177210903×10⁻¹¹ m): one atomic unit of C₆. */
export const AU_C6 = 4.3597447222e-18 * (5.29177210903e-11) ** 6
/** C₆ of the Na–Na and Cs–Cs ground-state pairs in atomic units (stated inputs, Derevianko et al. 1999). */
export const C6_NA_AU = 1556
export const C6_CS_AU = 6860
/** The caesium ground-state hyperfine frequency that defines the second, Hz (exact). */
export const CS_HFS_HZ = 9192631770

/* ----------------------------------------------------------------------------- the Langevin barrier (§6.3) */
/** The barrier of V(R) = −C_n/Rⁿ + ħ²ℓ(ℓ+1)/2mR² for the reduced mass m: its radius R_c and height V_c (J). */
export function langevinBarrier(n: number, Cn: number, m: number, ell: number): { Rc: number; Vc: number } {
  const L = ell * (ell + 1)
  const Rc = ((n * m * Cn) / (HBAR * HBAR * L)) ** (1 / (n - 2))
  return { Rc, Vc: langevinPotential(n, Cn, m, ell, Rc) }
}
/** V(R) = −C_n/Rⁿ + ħ²ℓ(ℓ+1)/2mR², J. */
export const langevinPotential = (n: number, Cn: number, m: number, ell: number, R: number): number => -Cn / R ** n + (HBAR * HBAR * ell * (ell + 1)) / (2 * m * R * R)
/** The barrier height as Eq. (6.3) must read: ((n−2)/2)(ħ²ℓ(ℓ+1)/nm)^{n/(n−2)} C_n^{−2/(n−2)}, J (Correction C9). */
export const barrierTop = (n: number, Cn: number, m: number, ell: number): number => ((n - 2) / 2) * ((HBAR * HBAR * ell * (ell + 1)) / (n * m)) ** (n / (n - 2)) * Cn ** (-2 / (n - 2))
/** The same expression as the book prints it: ħ²ℓ(ℓ+1)/2m in the base and C_n^{+2/(n−2)} (not an energy). */
export const barrierTopPrinted = (n: number, Cn: number, m: number, ell: number): number => ((n - 2) / 2) * ((HBAR * HBAR * ell * (ell + 1)) / (2 * m)) ** (n / (n - 2)) * Cn ** (2 / (n - 2))
/** ℓ(ℓ+1) of the largest partial wave whose barrier lies below (3/2)k_BT (Eq. 6.5), then ℓ_c itself. */
export function partialWaves(n: number, Cn: number, m: number, T: number): number {
  const L = ((n * m) / (HBAR * HBAR)) * Cn ** (2 / n) * ((3 * K_BOLTZMANN * T) / (n - 2)) ** ((n - 2) / n)
  return (-1 + Math.sqrt(1 + 4 * L)) / 2
}
/** The temperature at which the ℓ = 1 barrier reaches (3/2)k_BT: below it only ℓ = 0 collides, K. */
export const quantumOnsetT = (n: number, Cn: number, m: number): number => (((n - 2) / (3 * K_BOLTZMANN)) * ((2 * HBAR * HBAR) / (n * m)) ** (n / (n - 2))) * Cn ** (-2 / (n - 2))
/** σ = πb_c² at collision energy E (J), where b_c = ħ√(ℓ(ℓ+1))/√(2mE) and ℓ is set by V_c(ℓ) = E, m²: it falls as E^{−2/n} (Correction C10). */
export function thresholdCross(n: number, Cn: number, m: number, E: number): number {
  const L = ((n * m) / (HBAR * HBAR)) * (((2 * E) / (n - 2)) ** ((n - 2) / n)) * Cn ** (2 / n)
  return (Math.PI * HBAR * HBAR * L) / (2 * m * E)
}

/* ----------------------------------------------------------------------------- clocks and atom optics (Ch. 6) */
/** The chance cos²(πΔνT) of the second pulse's transition at detuning Δν (Hz) for the time T between pulses. */
export const ramseyChance = (dnu: number, T: number): number => Math.cos(Math.PI * dnu * T) ** 2
/** The full width at half height 1/2T of the central fringe, Hz. */
export const ramseyWidth = (T: number): number => 1 / (2 * T)
/** The time between the two cavity passes of an atom that rises h above the cavity and falls back, 2√(2h/g), s. */
export const fountainTime = (h: number): number => 2 * Math.sqrt((2 * h) / G_STANDARD)
/** The time an atom dropped from h takes to bounce off an atom mirror and return to h, s. */
export const bounceTime = (h: number): number => fountainTime(h)
/** The angle n·2ħk/(Mv) of the beam after n two-photon kicks of a standing-wave splitter, rad. */
export const kapitzaDiracAngle = (a: AtomLine, v: number, nKicks: number): number => (nKicks * 2 * HBAR * waveNumber(a)) / (a.massKg * v)
/** The Doppler-broadened full width (2/λ)√(2 ln2 k_BT/M) of the line, Hz. */
export const dopplerFwhm = (a: AtomLine, T: number): number => (2 / a.lambdaM) * Math.sqrt((2 * Math.LN2 * K_BOLTZMANN * T) / a.massKg)
/** hc·ν̃/k_B for a wavenumber in cm⁻¹, K. */
export const wavenumberToK = (perCm: number): number => (H_PLANCK * C_LIGHT * perCm * 100) / K_BOLTZMANN
/** hν/k_B for a frequency in Hz, K. */
export const hzToK = (hz: number): number => (H_PLANCK * hz) / K_BOLTZMANN
/** The speed √(ΔE/M) each of two equal atoms gets when a collision releases the energy ΔE (J) between them, m/s. */
export const releaseSpeed = (massKg: number, energyJ: number): number => Math.sqrt(energyJ / massKg)
