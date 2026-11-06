/**
 * Lecture 15 review cards: the exam layer (owner: P; P-L15-story §6). ≤ 5 points, ≤ 25 words per sentence; every number comes from L15.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d } from './L15.values'

export const L15_REVIEW: Record<string, ReviewCard> = {
  'l15-puzzle': {
    points: [
      'An energy eigenstate has a fixed density, because its time dependence is one overall phase that cancels in $|\\psi|^2$.',
      'Motion needs a mix of several energies: the phase between the parts changes the interference, and so the density.',
      'A free packet released with momentum $p_0$ has its centre at $p_0t/m$; for $p_0 = 3$ and $m = 1$ it is at 6 when $t = 2$.',
    ],
    equations: '|\\psi(t)\\rangle = e^{-iEt/\\hbar}|E\\rangle',
    trap: 'Expecting a stationary state to move, or a single energy to describe a particle that travels.',
  },
  'l15-free-eigenstate': {
    points: [
      'A momentum state is an energy state of the free particle, with $E_p = \\tfrac{p^2}{2m}$. The states $p$ and $-p$ share one energy.',
      'Its wavefunction has crests that move, but $|\\psi_p|^2$ is the same at every $x$ and time.',
      `For $p = ${d(V.l15PlaneP15, 1)}$ and $m = 1$ the crests move at ${d(V.l15CrestSpeed15, 2)}, which is $p/2m$.`,
      'No momentum state can be normalised, so none is a particle with a place.',
    ],
    equations: '\\psi_p(x,t) = \\tfrac{1}{\\sqrt{2\\pi\\hbar}}\\,e^{i(px-E_pt)/\\hbar}',
    trap: 'Reading the moving crests of a plane wave as a particle moving at that speed.',
    claims: [
      claim('l15PlaneP15', 'the plane wave of the unit has p = 1.5', () => close(V.l15PlaneP15, 1.5, 1e-9)),
      claim('l15CrestSpeed15', 'its crests move at 0.75, which is p/2m', () => close(V.l15CrestSpeed15, 0.75, 1e-9)),
    ],
  },
  'l15-packet-evolution': {
    points: [
      'Expand the start in momentum states and give each component its own phase: $\\tilde\\psi(p,t) = e^{-ip^2t/2m\\hbar}\\,\\tilde\\psi(p,0)$.',
      `Each component keeps its size, so $\\langle p\\rangle$ and $\\Delta p$ never change; for the unit packet $\\Delta p$ stays at ${d(V.l15DpT6, 1)}.`,
      'The density $|\\psi(x,t)|^2$ does change, because the phases between components change the interference at each $x$.',
    ],
    equations: '\\tilde\\psi(p,t) = e^{-ip^2t/2m\\hbar}\\,\\tilde\\psi(p,0)',
    trap: 'Believing the momentum spread grows as the packet spreads in space.',
    claims: [claim('l15DpT6', 'Δp is still 0.5 at t = 6', () => close(V.l15DpT6, 0.5, 1e-9))],
  },
  'l15-group-velocity': {
    points: [
      'Two nearby waves make a fast carrier times a slow envelope. The envelope moves at $\\Delta\\omega/\\Delta k$, which becomes $d\\omega/dk$.',
      'For the free particle $v_g = p/m$: the classical velocity, with no trajectory assumed.',
      'The crests of one plane wave move at $p/2m$, half as fast as the envelope. A crest is not the particle.',
    ],
    equations: 'v_g = \\tfrac{d\\omega}{dk} = \\tfrac{p}{m}',
    trap: 'Giving the particle the phase velocity $\\omega/k$ instead of the group velocity.',
  },
  'l15-dispersion': {
    points: [
      'Velocities $p/m$ differ across a packet, so fast parts run ahead of slow ones. That is dispersion.',
      'Expand $\\omega(k)$ about $k_0$: the linear term shifts the envelope, and the curvature $\\omega_0\'\'$ changes its shape.',
      `For the free particle $\\omega'' = \\hbar/m$, which is ${d(V.l15Omega2nd, 0)} here. A linear relation $\\omega = ck$ has no curvature and keeps the shape.`,
    ],
    equations: '\\omega\'\' = \\hbar/m',
    trap: 'Blaming the uncertainty principle directly for the spreading, instead of the curvature of $\\omega(k)$.',
    claims: [claim('l15Omega2nd', 'the free ω″ is ħ/m = 1', () => close(V.l15Omega2nd, 1, 1e-9))],
  },
  'l15-gaussian': {
    points: [
      'A Gaussian has $\\Delta p = \\tfrac{\\hbar}{2\\sigma}$, so $\\Delta x\\,\\Delta p = \\tfrac{\\hbar}{2}$, the least allowed.',
      'The spread of velocities $\\Delta v\\sim\\tfrac{\\hbar}{2m\\sigma}$ gives the spreading time $t_{\\rm spread}\\sim\\tfrac{2m\\sigma^2}{\\hbar}$.',
      `Halving $\\sigma$ makes the time ${d(V.l15TspreadRatio, 0)} times shorter: ${d(V.l15Tspread08, 2)} drops to ${d(V.l15Tspread04, 2)}.`,
    ],
    equations: 't_{\\rm spread}\\sim\\tfrac{2m\\sigma^2}{\\hbar}',
    trap: 'Believing a narrower packet spreads more slowly. It spreads faster, because its momentum spread is larger.',
    claims: [
      claim('l15TspreadRatio', 'halving σ makes the spreading time 4 times shorter', () => close(V.l15TspreadRatio, 4, 1e-9)),
      claim('l15Tspread08', 'the spreading time for σ = 0.8 is 1.28', () => close(V.l15Tspread08, 1.28, 1e-9)),
      claim('l15Tspread04', 'and 0.32 for σ = 0.4', () => close(V.l15Tspread04, 0.32, 1e-9)),
    ],
  },
}
