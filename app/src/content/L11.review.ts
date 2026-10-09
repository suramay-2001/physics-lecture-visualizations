/**
 * Lecture 11 review cards: the exam layer (owner: P; P-L11-story §6).
 * ≤ 5 points, ≤ 25 words per sentence; every number comes from L11.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d } from './L11.values'

export const L11_REVIEW: Record<string, ReviewCard> = {
  'l11-wait': {
    points: [
      'Until now quantum mechanics was static. The new question: from $|\\psi\\rangle$ at $t = 0$, which state do we hold at time $t$?',
      'The ket follows an exact law from its starting value, yet each measurement outcome stays random.',
      'Waiting will have the structure of a rotation: a tiny turn is $R_z(d\\varphi) \\approx I - \\tfrac{i}{\\hbar}S_z\\,d\\varphi$.',
    ],
    equations: 'R_z(d\\varphi) \\approx I - \\tfrac{i}{\\hbar}S_z\\,d\\varphi',
    trap: 'Thinking a deterministic ket means predictable readings. The state is exact; its chances are not certainties.',
  },
  'l11-unitary': {
    points: [
      'The state after a wait is $|\\psi(t)\\rangle = U(t)|\\psi(0)\\rangle$.',
      'A closed system keeps the total probability for every starting state, so $U^\\dagger U = I$: waiting is unitary.',
      `Checking a basis is not enough. A matrix can keep $|{\\pm z}\\rangle$ at length 1 and still stretch $|{+x}\\rangle$ to ${d(V.l11BadX, 3)}.`,
    ],
    equations: 'U^\\dagger U = I',
    trap: 'Checking only a basis. The condition must hold for every state.',
    claims: [claim('l11BadX', 'a matrix that keeps |±z⟩ can stretch |+x⟩ to squared length 1.707', () => close(V.l11BadX, 1 + Math.SQRT1_2, 1e-9))],
  },
  'l11-generator': {
    points: [
      'A tiny wait is $U(dt) = I + A\\,dt$, and unitarity to first order forces $A^\\dagger = -A$.',
      'Writing $A = -\\tfrac{i}{\\hbar}H$ leaves $H^\\dagger = H$: the Hamiltonian, the energy observable, generates time translations.',
      'Chaining many tiny waits gives $U(t) = e^{-iHt/\\hbar}$, exactly as $R_z(\\varphi) = e^{-i\\varphi S_z/\\hbar}$ for rotations.',
    ],
    equations: 'U(t) = e^{-iHt/\\hbar}',
    trap: 'Forgetting the $i$. It makes $A$ anti-Hermitian and $H$ Hermitian, so $H$ has real eigenvalues, energies.',
  },
  'l11-schrodinger': {
    points: [
      'From the tiny wait, $d|\\psi\\rangle/dt = -\\tfrac{i}{\\hbar}H|\\psi\\rangle$, or $i\\hbar\\,d|\\psi\\rangle/dt = H|\\psi\\rangle$.',
      'It is not a new law: for a time-independent $H$ it says the same as $U(t) = e^{-iHt/\\hbar}$.',
      'The equation is first order in time, so the state at one instant fixes the whole future.',
    ],
    equations: 'i\\hbar\\,\\frac{d}{dt}|\\psi\\rangle = H|\\psi\\rangle',
    trap: 'Thinking it adds a new law. It is the differential form of the same time evolution.',
  },
  'l11-stationary': {
    points: [
      'If $H|E\\rangle = E|E\\rangle$, then $|E\\rangle$ only gains the overall phase $e^{-iEt/\\hbar}$.',
      'An overall phase changes no probability, so an energy eigenstate is stationary.',
      'Observable motion needs a relative phase: a superposition of different energies.',
    ],
    equations: '|E(t)\\rangle = e^{-iEt/\\hbar}|E\\rangle',
    trap: 'Reading “stationary” as “the ket is constant”. The ket’s phase turns; only the predictions stand still.',
  },
  'l11-two-level': {
    points: [
      'For $H = \\bar E I + \\tfrac{\\hbar\\omega}{2}Z$, $U(t) \\cong R_z(\\omega t)$: waiting turns the arrow about $z$.',
      `Start in $|{+x}\\rangle$: each energy component has its own clock, and the gap between the hands is the azimuth $\\varphi(t) = \\omega t$.`,
      'The arrow turns at $\\omega = (E_+ - E_-)/\\hbar$. The mean energy $\\bar E$ is only an overall phase.',
      `For $3\\varepsilon$ and $\\varepsilon$, one lap takes $\\varepsilon t/\\hbar = ${d(V.l11LapDeg, 0)}^\\circ$.`,
    ],
    equations: '|\\psi(t)\\rangle \\cong \\tfrac{1}{\\sqrt2}\\left(|{+z}\\rangle + e^{i\\omega t}|{-z}\\rangle\\right)',
    trap: 'Saying the arrow turns at $E_+/\\hbar$. Only the difference of the energies is seen.',
    claims: [claim('l11LapDeg', 'one lap takes εt/ħ = 180° for 3ε and ε', () => close(V.l11LapDeg, 180, 1e-9))],
  },
}
