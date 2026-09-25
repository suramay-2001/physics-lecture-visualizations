/**
 * Lecture 1 review cards: the exam layer (owner: P; P2-L1-story §4 with the P1 notation fixes).
 * ≤ 5 points, ≤ 25 words per sentence; every number comes from L1.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d, pct, tf, uf } from './L1.values'

export const L1_REVIEW: Record<string, ReviewCard> = {
  'l1-quantized': {
    points: [
      'An SG$_z$ magnet splits an oven beam into **two** spots, 50/50. It never makes a continuous band.',
      'Classical random moments would give a band, because $\\mu_z = \\mu\\cos\\theta_\\mu$ takes every value from $-\\mu$ to $+\\mu$.',
      `Keep the + beam and repeat SG$_z$: **${pct(V.repeatZPlate)}** land in +. Repeating a measurement repeats its result.`,
      'The magnet needs a field **gradient**. A uniform field only makes the moment precess; it does not separate the beams.',
    ],
    equations: `S_z \\in \\{+\\tfrac{\\hbar}{2},\\,-\\tfrac{\\hbar}{2}\\},\\qquad \\sigma = \\tfrac{2S_z}{\\hbar} = \\pm1,\\qquad P(+z\\mid{+z}) = ${tf(V.repeatZPlate)}`,
    trap: 'Believing two outcomes alone prove something quantum. A coin also has two outcomes; the quantum surprise comes in the next unit.',
    claims: [
      claim('ovenZPlus', 'oven → z: 50/50', () => close(V.ovenZPlus, 0.5)),
      claim('repeatZPlate', 'z then z: every plate atom is +', () => close(V.repeatZPlate, 1)),
    ],
  },
  'l1-sequential': {
    points: [
      'Measure x on $|{+z}\\rangle$ atoms and get ±x at 50/50. There is no zero outcome.',
      'A measurement **prepares** the state that matches its result. After a +x result the atom is in $|{+x}\\rangle$.',
      `z(+) → x(+) → z: **${uf(V.zxzPlus)} of the oven atoms** end in +, which is ${uf(V.zxzPlate)} of the atoms that reach the plate. Check which denominator the question asks for.`,
      `Remove the middle x magnet and the final z magnet sends ${pct(V.repeatZPlate)} to + again. The x measurement did the erasing.`,
    ],
    equations: `P(\\pm x\\mid{+z}) = P(\\pm z\\mid{+x}) = ${tf(V.pXgivenZ)},\\qquad ${tf(V.zxzAlive1)}\\cdot${tf(V.pXgivenZ)}\\cdot${tf(V.pZgivenX)} = ${tf(V.zxzPlus)}\\ \\text{of the oven}`,
    trap: 'Thinking the x magnet "reads" an x value the atom already had. The final z result shows that the x magnet rewrote the state.',
    claims: [
      claim('pXgivenZ', 'P(±x | +z) = 1/2', () => close(V.pXgivenZ, 0.5)),
      claim('pZgivenX', 'P(±z | +x) = 1/2', () => close(V.pZgivenX, 0.5)),
      claim('zxzAlive1', 'half the oven passes the first z magnet', () => close(V.zxzAlive1, 0.5)),
      claim('zxzPlus', 'z(+) → x(+) → z: 1/8 of the oven ends in +', () => close(V.zxzPlus, 0.125)),
      claim('zxzPlate', 'z(+) → x(+) → z: 1/2 of the plate atoms are +', () => close(V.zxzPlate, 0.5)),
      claim('repeatZPlate', 'without the x magnet: every plate atom is +', () => close(V.repeatZPlate, 1)),
    ],
  },
  'l1-average': {
    points: [
      'Each atom still reads only ±1. The tilt changes only the **split** between the two spots.',
      'The average reading equals the classical projection $\\hat n\\cdot\\hat m$, but only on average, never for one atom.',
      `At 45°, $P(+) \\approx ${d(V.p45)}$ and $\\langle\\sigma_n\\rangle \\approx ${d(V.avg45)}$. At 60°, $P(+) = ${tf(V.p60)}$. At 90°, $P(+) = ${tf(V.p90)}$.`,
      'The scatter of the mean of many readings shrinks like $1/\\sqrt{N_{\\text{atoms}}}$.',
      `Errata: the notes put the ${uf(V.p60)} split at 45°, but it happens at 60°.`,
    ],
    equations: '\\langle\\sigma_n\\rangle = \\hat n\\cdot\\hat m = \\cos\\theta,\\qquad \\langle\\sigma_n\\rangle = 2P(+)-1,\\qquad P(+) = \\tfrac{1+\\cos\\theta}{2} = \\cos^2\\tfrac{\\theta}{2}',
    trap: `Mixing up the average with the probability. At 45°, $\\cos\\theta \\approx ${d(V.avg45)}$ is the **average**, and $P(+) \\approx ${d(V.p45)}$ is the **probability**.`,
    claims: [
      claim('p45', 'P(+) at 45° = cos²(22.5°)', () => close(V.p45, Math.cos(Math.PI / 8) ** 2)),
      claim('avg45', 'average at 45° = 1/√2', () => close(V.avg45, Math.SQRT1_2)),
      claim('p60', 'P(+) at 60° = 3/4', () => close(V.p60, 0.75)),
      claim('p90', 'P(+) at 90° = 1/2', () => close(V.p90, 0.5)),
    ],
  },
  'l1-logic': {
    points: [
      'Test "up OR right" on atoms prepared in $|{+z}\\rangle$.',
      `Checking z first, the claim is **never** false. Checking x first, it is false for **${uf(V.falseXFirst)}** of the atoms (left, then down).`,
      'Order matters because the first check changes the state before the second one.',
      "So quantum propositions cannot be checked like facts about a set. Ruling out every hidden-answer model needs Bell's theorem, which comes later.",
    ],
    equations: `P(\\text{false}\\mid x\\text{ first}) = P(-x\\mid{+z})\\,P(-z\\mid{-x}) = ${tf(V.pLeftGivenUp)}\\cdot${tf(V.pDownGivenLeft)} = ${tf(V.falseXFirst)},\\qquad P(\\text{false}\\mid z\\text{ first}) = ${tf(V.falseZFirst)}`,
    trap: 'Blaming the word "or" itself. The assumption that fails is that checking does not disturb.',
    claims: [
      claim('falseXFirst', 'x-first: false for 1/4', () => close(V.falseXFirst, 0.25)),
      claim('falseZFirst', 'z-first: never false', () => close(V.falseZFirst, 0)),
      claim('pLeftGivenUp', 'P(−x | +z) = 1/2', () => close(V.pLeftGivenUp, 0.5)),
      claim('pDownGivenLeft', 'P(−z | −x) = 1/2', () => close(V.pDownGivenLeft, 0.5)),
    ],
  },
  'l1-vectors': {
    points: [
      'A state is a **unit vector**, and $|{+z}\\rangle$, $|{-z}\\rangle$ form an orthonormal basis.',
      'Probabilities are squared coefficients (the Born rule). Normalized means they add to 1.',
      '$|{+x}\\rangle$ and $|{-x}\\rangle$ differ by a relative sign, and they are orthogonal. Orthogonal means perfectly distinguishable.',
      'An overall sign (global phase) changes nothing, but a relative sign between the terms does.',
      'Angles in state space are **half** of lab angles: up and down are 180° apart in the lab and 90° apart as vectors.',
    ],
    equations: '|\\psi\\rangle = \\alpha|{+z}\\rangle + \\beta|{-z}\\rangle,\\quad |\\alpha|^2+|\\beta|^2 = 1,\\qquad |{\\pm x}\\rangle = \\tfrac{1}{\\sqrt2}(|{+z}\\rangle \\pm |{-z}\\rangle),\\qquad P = |\\langle\\text{outcome}|\\psi\\rangle|^2',
    trap: 'Writing $|{-z}\\rangle = -|{+z}\\rangle$ because "down is the opposite of up". In fact $-|{+z}\\rangle$ is the **same** state as $|{+z}\\rangle$, and $|{-z}\\rangle$ is orthogonal to it.',
    claims: [
      claim('negSame', '−|+x⟩ is the same state as |+x⟩', () => V.negSame === 1),
      claim('pRightLeft', '+x ⟂ −x', () => close(V.pRightLeft, 0)),
    ],
  },
}
