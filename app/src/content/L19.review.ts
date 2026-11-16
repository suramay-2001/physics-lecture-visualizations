/**
 * Lecture 19 review cards: the exam layer (owner: P; P-L19-story §6).
 * ≤ 5 points, ≤ 25 words per sentence; every number comes from L19.values.ts (or L18.values.ts under its own key) and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d } from './L19.values'
import { V as V18, claim as claim18 } from './L18.values'

export const L19_REVIEW: Record<string, ReviewCard> = {
  'l19-recap': {
    points: [
      'A decaying tail has density but no current. A second edge lets it join a travelling wave, and that is tunnelling.',
      `A packet that meets a barrier ends as two packets whose areas are $R$ and $T$. For the barrier of the lecture $T$ is ${d(V18.l18BarrierT1, 4)}.`,
    ],
    equations: 'R + T = 1',
    trap: 'Saying that a tail means transmission. Transmission needs a travelling wave on the far side.',
    claims: [claim18('l18BarrierT1', 'T = 0.4200 for κa = 1', () => close(V18.l18BarrierT1, 0.419974, 5e-5))],
  },
  'l19-regions': {
    points: [
      'Where $E > V$ the solutions turn, $e^{\\pm ikx}$. Where $E < V$ they grow and fall, $e^{\\pm\\kappa x}$.',
      'Both exponentials stay inside a finite barrier. Region III has only the outgoing wave $\\tau e^{ikx}$.',
      `For $E = 2$ and $V_0 = 4$ the two constants are equal: $k = \\kappa = ${d(V.l19KS, 0)}$.`,
    ],
    equations: "\\varphi'' = -k^2\\varphi,\\quad \\varphi'' = \\kappa^2\\varphi",
    trap: 'Dropping one of the two exponentials inside the barrier, as one does for an infinitely wide region.',
    claims: [claim('l19KS', 'k = 2 for E = 2', () => close(V.l19KS, 2, 1e-12))],
  },
  'l19-match': {
    points: [
      'Four matching conditions, two at each edge, fix the four amplitudes $r$, $A$, $B$ and $\\tau$.',
      `The transmitted amplitude has size ${d(V.l19AbsT, 3)} for $\\kappa a = 1$ and $k = \\kappa$, and $T = |\\tau|^2$ because both sides have $V = 0$.`,
      `The current is the same in all three regions: ${d(V.l19CurrentLeft, 4)} for the lecture's barrier.`,
    ],
    equations: 'T = |\\tau|^2',
    trap: 'Using $T = |\\tau|^2$ when the potential on the right differs from the one on the left. Then a speed factor enters.',
    claims: [
      claim('l19AbsT', '|τ| = 0.648', () => close(V.l19AbsT, 0.648054, 5e-5)),
      claim('l19CurrentLeft', 'the current is 0.8399', () => close(V.l19CurrentLeft, 0.839949, 5e-5)),
    ],
  },
  'l19-thick': {
    points: [
      'For a thick barrier $T \\simeq 16\\,\\tfrac{E(V_0 - E)}{V_0^2}\\,e^{-2\\kappa a}$: the amplitude falls as $e^{-\\kappa a}$ and the chance is its square.',
      `Doubling the width squares the exponential factor. From $\\kappa a = ${d(V.l19Ka15, 1)}$ to $3$ the transmission falls by ${d(V.l19DoubleFactor, 4)}.`,
      'A taller barrier or a heavier particle raises $\\kappa$, and $\\kappa \\propto \\sqrt m$, so $T$ falls fast.',
    ],
    equations: 'T \\simeq 16\\,\\tfrac{E(V_0 - E)}{V_0^2}\\,e^{-2\\kappa a}',
    trap: 'Using the thick-barrier form as $E \\to V_0$ or as $a \\to 0$. The exact $T$ stays finite and tends to 1.',
    claims: [
      claim('l19Ka15', 'κa = 1.5 half-way', () => close(V.l19Ka15, 1.5, 1e-12)),
      claim('l19DoubleFactor', 'the factor is 0.0546', () => close(V.l19DoubleFactor, 0.054597, 5e-5)),
    ],
  },
  'l19-energy': {
    points: [
      `The energy is the same on both sides: $\\tfrac{k^2}{2} = ${d(V.l19EnergyOut, 0)}$ outside and $V_0 - \\tfrac{\\kappa^2}{2}$ inside. The barrier filters; it does not lend.`,
      `A tunnelling microscope uses the steep fall of $T$ with the gap: one ångström more cuts the current by ${d(V.l19StmFactorExact, 4)}.`,
      `Alpha decay is a thick-barrier exponent: in the model, ${d(V.l19GamowFactor10, 1)} decades of $T$ separate 4.27 MeV from 8 MeV.`,
    ],
    equations: 'E = \\tfrac{k^2}{2} = V_0 - \\tfrac{\\kappa^2}{2}',
    trap: 'Saying that tunnelling violates the conservation of energy. The state has one energy throughout.',
    claims: [
      claim('l19EnergyOut', 'E = 2 outside', () => close(V.l19EnergyOut, 2, 1e-12)),
      claim('l19StmFactorExact', 'the factor is 0.1288', () => close(V.l19StmFactorExact, 0.128837, 5e-5)),
      claim('l19GamowFactor10', 'a gap of 19.5 decades', () => close(V.l19GamowFactor10, 19.54914, 5e-2)),
      claim('l19AlphaE', 'the first alpha energy is 4.27 MeV', () => close(V.l19AlphaE, 4.27, 1e-12)),
    ],
  },
}
