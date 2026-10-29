/**
 * Chapter Q25 review cards (Physics 709; P-Q25-story §6), one per unit, in both tracks. Every number on a card is backed by a claim of its unit (content/claims.test.ts); the Formal block
 * has its own points, equations and trap.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close, d, grp } from './Q25.values'

export const Q25_REVIEW: Record<string, ReviewCard> = {
  'q25-cooling': {
    points: [
      'Each absorbed photon kicks the atom by a fixed small speed, and each scattered photon also heats it.',
      'Cooling beams balance the heating at the Doppler limit, $k_BT_D = \\hbar\\gamma/2$.',
      `For rubidium that limit is ${d(V.q25TDRb, 1)} µK, and one photon heats by ${d(V.q25HeatPerPhoton, 4)} µK.`,
      'Far-detuned light holds one atom per site, but only about half the sites end up full.',
    ],
    equations: 'k_BT_D = \\hbar\\gamma/2',
    trap: 'Believing that a deeper trap is free: at a fixed detuning, more depth means more scattering.',
    claims: [claim('q25TDRb', 'the Doppler limit of rubidium is 145.7 microkelvin', () => close(V.q25TDRb, 145.7, 0.05)), claim('q25HeatPerPhoton', 'one photon heats rubidium by 0.1207 microkelvin', () => close(V.q25HeatPerPhoton, 0.1207, 5e-5))],
    formal: {
      points: [
        'Eqs. 13.1–13.5 give the recoil, the heating $T_r/3$ per photon and the Doppler limit $\\hbar\\gamma/2k_B$ (Bergou pp. 223–225).',
        `Recomputing the table on p. 225 finds one clear slip: the narrow-line Doppler temperature is ${d(V.q25TDSr689, 3)} µK, printed as ${d(V.q25TDPrinted, 2)}.`,
        `Poisson loading with pair loss leaves one atom with chance $(1 - e^{-2\\mu})/2$, ${d(V.q25PodMu1, 3)} at $\\mu = 1$.`,
      ],
      trap: 'Taking the trap depth as free: scattering grows with intensity at a fixed detuning.',
    },
  },
  'q25-readout': {
    points: [
      'Photon counts are Poisson: the chance of $n$ counts is $e^{-\\bar n}\\bar n^n/n!$.',
      'Choose a cutoff $n_c$ between the dark and bright counts; the error is the sum of the two misreadings.',
      `For means ${d(V.q25MeanDark, 1)} and ${d(V.q25MeanBright, 1)} the best cutoff is ${V.q25ncOpt} and the error is ${d(V.q25ErrOpt, 4)}.`,
      'Motion spreads the phase of a Ramsey signal and sets $T_2^*$.',
    ],
    equations: 'E(n_c) = |c_0|^2P(N_d \\ge n_c) + |c_1|^2P(N_b < n_c)',
    trap: 'Putting the cutoff at the bright mean: the best cutoff sits near the dark side.',
    claims: [claim('q25ErrOpt', 'the best error for means 0.2 and 8.2 is 0.0065', () => close(V.q25ErrOpt, 0.0065, 5e-5)), claim('q25ncOpt', 'the best cutoff is 3', () => V.q25ncOpt === 3)],
    formal: {
      points: [
        'Eq. 13.6: signal and background Poisson counts add into one Poisson law; the threshold error has an incomplete-gamma form (Bergou pp. 228–229).',
        `The thermal envelope $1/\\sqrt{(1 + t^2/T_0^2)^3}$ falls to $1/e$ at $T_2^* = ${d(V.q25T2starCoeff, 3)}\\hbar/\\bar\\eta k_BT$ (Eq. 13.10).`,
      ],
      trap: 'Setting $n_c$ at the mean of the bright histogram: the dark side sets the best cutoff.',
    },
  },
  'q25-atom-gates': {
    points: [
      'Two global turns around one local turn make a local $x$ or $y$ rotation.',
      'The Rydberg interaction grows as $n^{11}$, so a high level blocks its neighbour.',
      'Pulses of $\\pi$, $2\\pi$ and $\\pi$ give $\\mathrm{diag}(1,-1,-1,-1)$, a controlled-Z up to single-atom phases.',
      `The best gate error falls as $(B\\tau)^{-${d(V.q25TwoThirdsArg, 4)}}$: tenfold more $B\\tau$ gives ${d(V.q25TenfoldFactor, 3)} of the error.`,
    ],
    equations: 'U = \\mathrm{diag}(1,-1,-1,-1)',
    trap: 'Believing that a bigger blockade needs a faster pulse: the best rate rises only as the two-thirds power of the blockade.',
    claims: [claim('q25TwoThirdsArg', 'the exponent is two thirds', () => close(V.q25TwoThirdsArg, 2 / 3, 1e-12)), claim('q25TenfoldFactor', 'tenfold B tau gives 0.215 of the error', () => close(V.q25TenfoldFactor, 0.215, 5e-4))],
    formal: {
      points: [
        'The sandwich $G_y(\\tfrac{\\pi}{2})R_z G_y(-\\tfrac{\\pi}{2})$ equals $R_x$ exactly (Bergou p. 233); a Raman $\\pi$ pulse loses $(\\pi/2)\\gamma/|\\Delta|$ (our calculation).',
        `Fig. 13.7: $U = (Z\\otimes Z)\\,\\mathrm{CZ}$; the error scales as $(B\\tau)^{-${d(V.q25TwoThirdsArg, 4)}}$ and the best rate as $(B\\tau)^{-${d(V.q25OneThirdArg, 4)}}$ (Bergou p. 235).`,
      ],
      trap: 'Expecting the best rate to follow $B$ linearly: the exponent is two thirds.',
    },
  },
  'q25-ion-trap': {
    points: [
      'A still electric field cannot trap a charge, because its curvatures in three directions must add to zero.',
      'Flipping the field fast turns the saddle into a trap for $\\tilde q$ below 0.908.',
      `A beryllium ion has $\\tilde q = ${d(V.q25qz, 4)}$ and a secular frequency of ${d(V.q25wz, 3)} MHz along the axis.`,
      `Two ions sit ${d(V.q25Zeq, 2)} µm apart, and the stretch mode is $\\sqrt3$ times stiffer.`,
    ],
    equations: '\\omega_z = \\tilde q\\,\\omega_{\\rm rf}/\\sqrt{8}',
    trap: 'Believing that a strong enough static field could hold the ion: Earnshaw’s theorem forbids it.',
    claims: [claim('q25qz', 'the beryllium trap has q tilde 0.5411', () => close(V.q25qz, 0.5411, 5e-5)), claim('q25wz', 'the axial frequency is 1.913 MHz', () => close(V.q25wz, 1.913, 5e-4)), claim('q25Zeq', 'two ions sit 5.97 micrometres apart', () => close(V.q25Zeq, 5.97, 5e-3))],
    formal: {
      points: [
        'Earnshaw: $\\nabla^2\\phi = 0$. The Mathieu equation has a first stable region $0 \\le \\tilde q_z \\le 0.908$, and the effective well has $\\omega_z = \\tilde q\\omega_{\\rm rf}/\\sqrt{8}$ (Bergou p. 238).',
        `At $\\tilde q = ${d(V.q25qz, 4)}$ the exact secular frequency is ${d(V.q25SecDiff * 100, 1)} % above that value (our calculation); the pair has $Z_{\\rm eq}^3 = \\frac{q^2}{2\\pi\\epsilon_0m\\omega_z^2}$.`,
      ],
      trap: 'Treating the effective potential as exact: it is a small-$\\tilde q$ approximation.',
    },
  },
  'q25-phonons': {
    points: [
      'An ion has a spin and a phonon count; a sideband drive changes both together.',
      `The Lamb–Dicke number $\\eta$ is small: ${d(V.q25eta0, 4)} for beryllium at 313 nm, so sidebands are slower than the carrier by $\\eta$.`,
      'Red pulses plus decay cool the ion to $|g,0\\rangle$, which has no red sideband.',
      'A microwave’s wavelength is about a hundred thousand times that of light, so it cannot move the ion.',
    ],
    equations: '\\eta_0^2 = E_R/\\hbar\\omega_z',
    trap: 'Believing that microwaves can cool the motion: their photons carry too little momentum.',
    claims: [claim('q25eta0', 'the Lamb-Dicke number for 313 nm is 0.3433', () => close(V.q25eta0, 0.3433, 5e-5))],
    formal: {
      points: [
        `$e^{i\\eta(\\hat a + \\hat a^\\dagger)} = \\exp(-\\tfrac{\\eta^2}{2})e^{i\\eta\\hat a^\\dagger}e^{i\\eta\\hat a}$; the first-order sideband $\\eta\\Omega\\sqrt{n+1}$ overestimates at larger $n$ (Bergou p. 243).`,
        `Cooling from $n = 10$ takes ${d(V.q25CoolT10, 2)} in units of $1/\\eta\\Omega$; the microwave $\\eta$ is $${d(V.q25etaMicro, 3)}\\times10^{-6}$.`,
      ],
      trap: 'Using one pulse length for every level: the red rate goes as $\\sqrt n$.',
    },
  },
  'q25-ion-gates': {
    points: [
      'The Cirac–Zoller gate needs the ion in its motional ground state.',
      `From $n = 1$ its Bell chance is only ${d(V.q25CZbell1, 3)}.`,
      'The Mølmer–Sørensen gate does not care about the phonon number, if its loop closes.',
      `The same pulse entangles two or four ions; with this one pulse three ions cannot reach a GHZ state, the best chance being ${d(V.q25GHZfid3, 1)} (our calculation).`,
    ],
    equations: '\\tilde\\Omega = -(\\eta\\Omega)^2/(\\omega_z - \\delta)',
    trap: 'Believing that the gate works at any time: it must end after a whole number of loops.',
    claims: [claim('q25CZbell1', 'from n = 1 the Bell chance is 0.254', () => close(V.q25CZbell1, 0.254, 5e-4))],
    formal: {
      points: [
        'Cirac–Zoller: three sideband pulses through one phonon, valid for $n = 0$ only (Bergou p. 244).',
        `Mølmer–Sørensen: $\\tilde\\Omega$ has no $n$ in it; the gate needs $K = (\\omega_z-\\delta)^2/4(\\eta\\Omega)^2$ whole loops (p. 245, our calculation).`,
      ],
      trap: 'Stopping at $\\tilde\\Omega t = \\pi/2$ without closing the loop: the ions stay tangled with the motion.',
    },
  },
}
void grp
