/**
 * Lecture 10 review cards: the exam layer (owner: P; P-L10-story §6).
 * ≤ 5 points, ≤ 25 words per sentence; every number comes from L10.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, uf } from './L10.values'

export const L10_REVIEW: Record<string, ReviewCard> = {
  'l10-local': {
    points: [
      'Alice’s operators act on her slot only: $Z_A = Z \\otimes I$. Bob’s act on his: $X_B = I \\otimes X$. The identity keeps the other spin untouched.',
      'For example $Z_A|du\\rangle = -|du\\rangle$, while $X_B|du\\rangle = |dd\\rangle$.',
      'Operators on different spins commute, $[A_A, B_B] = 0$, so the order of two measurements on different spins never matters.',
      'Two operators on the same spin, such as $X_A$ and $Y_A$, need not commute.',
    ],
    equations: 'Z_A = Z \\otimes I,\\qquad [A_A, B_B] = 0',
    trap: 'Applying $Z_A$ to Bob’s label. It acts on the first letter only.',
    claims: [
      claim('l10ZAdu', 'Z_A|du⟩ = −|du⟩', () => V.l10ZAdu === -1),
      claim('l10XAYAcommute', 'X_A and Y_A do not commute', () => V.l10XAYAcommute === 0),
    ],
  },
  'l10-empty-centre': {
    points: [
      'For the singlet $\\langle X_A\\rangle = \\langle Y_A\\rangle = \\langle Z_A\\rangle = 0$, and the same for Bob.',
      `So along every axis Alice reads $+1$ or $-1$ with chance ${uf(V.l10Phalf)}: her arrow sits at the centre of the ball.`,
      'A centre can mean ignorance of a pure state, as for half $|{+z}\\rangle$ and half $|{-z}\\rangle$. Here nobody is ignorant of the pair: it is one known pure state.',
      'Alice alone looks like a spin in a completely unknown direction. We call the pair maximally entangled.',
    ],
    equations: '\\vec r_A = (0,0,0)',
    trap: 'Reading “the centre” as “we do not know the pair’s state”. The pair is known exactly.',
    claims: [
      claim('l10RA', 'the length of Alice’s arrow is 0', () => close(V.l10RA, 0)),
      claim('l10Phalf', 'Alice reads +1 with chance ½ along any axis', () => close(V.l10Phalf, 0.5)),
      claim('l10PairPure', 'the pair’s purity is 1', () => close(V.l10PairPure, 1)),
    ],
  },
  'l10-correlations': {
    points: [
      'Measure $Z$ on both spins and multiply: $Z_AZ_B|\\mathrm{sing}\\rangle = -|\\mathrm{sing}\\rangle$, so $z_Az_B = -1$ with certainty.',
      'The same holds for $X$ and for $Y$: every matched axis gives opposite results.',
      'Mismatched axes give nothing: $\\langle Z_AX_B\\rangle = 0$ and all four result pairs have chance ¼.',
      'Each result alone is a coin toss. What the state fixes is the relation between them.',
    ],
    equations: 'Z_AZ_B|\\mathrm{sing}\\rangle = -|\\mathrm{sing}\\rangle,\\quad X_AX_B|\\mathrm{sing}\\rangle = -|\\mathrm{sing}\\rangle',
    trap: 'Treating $ZZ = -1$ alone as quantum. A dealer’s penny and dime do that classically; the three matched axes together are what a table struggles to explain.',
    claims: [
      claim('l10ZZ', 'ZZ eigenvalue −1', () => V.l10ZZ === -1),
      claim('l10XX', 'XX eigenvalue −1', () => V.l10XX === -1),
      claim('l10ZX', '⟨Z_AX_B⟩ = 0', () => close(V.l10ZX, 0)),
      claim('l10ZXjoint', 'each of the four chances is ¼', () => close(V.l10ZXjoint, 0.25)),
    ],
  },
  'l10-instructions': {
    points: [
      'An instruction table is a list of answers fixed in advance, one for each measurement a particle might meet.',
      'Matching $ZZ = -1$ and $XX = -1$ is easy: Bob’s sheet is minus Alice’s. Four of the sixteen two-setting tables do it.',
      'Local means: an answer may use the player’s own setting and anything agreed beforehand, never a partner’s later choice.',
      'Shared randomness is allowed, because it only picks a table. Matched axes alone can never refute tables.',
    ],
    equations: 'A_Z = -B_Z,\\qquad A_X = -B_X',
    trap: 'Calling shared randomness communication. It is agreed in advance, so it is allowed.',
    claims: [
      claim('l10Tables2', '4 two-setting tables match', () => V.l10Tables2 === 4),
      claim('l10Tables2Of', '16 two-setting tables in all', () => V.l10Tables2Of === 16),
    ],
  },
  'l10-ghz-game': {
    points: [
      'Three spins live in a space of dimension $2 \\cdot 2 \\cdot 2 = 8$, with basis $|000\\rangle$ to $|111\\rangle$.',
      'The referee picks $ZZZ$, $ZXX$, $XZX$ or $XXZ$; each player measures their letter and answers $\\pm1$.',
      'They win with an even number of $-1$ answers for $ZZZ$ and an odd number for the other three.',
      'Always answering $-1$ wins three inputs and loses $ZZZ$.',
    ],
    equations: '\\text{ZZZ: even};\\quad \\text{ZXX, XZX, XXZ: odd}',
    trap: 'Mixing bits with signs. An even number of $-1$s means a product of $+1$.',
    claims: [
      claim('l10Dim3', '8 basis states', () => V.l10Dim3 === 8),
      claim('l10AllMinusWins', '“always −1” wins 3 inputs', () => V.l10AllMinusWins === 3),
    ],
  },
  'l10-no-table': {
    points: [
      'A winning plan would need $A_ZB_ZC_Z = +1$ and the other three products $-1$, all at once.',
      'Multiply the four: each of the six answers appears twice, so the left side is $+1$. The right side is $-1$.',
      'So every plan fails at least one input, and the best classical win chance is ¾.',
      'Shared randomness only picks a plan at random, so it cannot beat ¾.',
    ],
    equations: '(A_ZB_ZC_Z)(A_ZB_XC_X)(A_XB_ZC_X)(A_XB_XC_Z) = +1 \\ne -1',
    trap: 'Thinking randomizing helps. An average of numbers each at most ¾ is at most ¾.',
    claims: [
      claim('l10Classical', 'the best classical win chance is ¾', () => close(V.l10Classical, 0.75)),
      claim('l10ProdCard', 'the four row products multiply to +1', () => V.l10ProdCard === 1),
      claim('l10ProdTarget', 'the four needs multiply to −1', () => V.l10ProdTarget === -1),
    ],
  },
  'l10-quantum-wins': {
    points: [
      'The three share $|G\\rangle = \\tfrac12(|000\\rangle - |011\\rangle - |101\\rangle - |110\\rangle)$; each measures the letter shown and reports the result.',
      'Every term has an even number of 1s, so $ZZZ|G\\rangle = +|G\\rangle$. Flipping the last two bits and then a sign gives $ZXX|G\\rangle = -|G\\rangle$.',
      'By symmetry $XZX$ and $XXZ$ also give $-1$. All four conditions hold, and $P_{\\mathrm{win}} = 1$.',
      'The product is certain, the single results are not: Alice’s own answer is $+1$ with chance ½ for every input.',
    ],
    equations: 'ZZZ|G\\rangle = +|G\\rangle,\\quad ZXX|G\\rangle = -|G\\rangle',
    trap: 'Reading “the product is +1” as “every answer is +1”. The triple (+1, −1, −1) also multiplies to +1.',
    claims: [
      claim('l10ZZZ', 'ZZZ eigenvalue +1', () => V.l10ZZZ === 1),
      claim('l10ZXX', 'ZXX eigenvalue −1', () => V.l10ZXX === -1),
      claim('l10QWin', 'the win chance is 1 for every input', () => close(V.l10QWin, 1)),
      claim('l10AliceZXX', 'Alice’s answer is +1 with chance ½', () => close(V.l10AliceZXX, 0.5)),
    ],
  },
  'l10-what-ghz-proves': {
    points: [
      'A local hidden-variable theory gives one answer for each measurement for every value of $\\lambda$, fixed by the player’s own setting alone.',
      'Every $\\lambda$ would then need all four GHZ conditions: the same contradiction. No such theory fits, while quantum mechanics meets all four with certainty.',
      'This is a Bell theorem without an inequality. Bell’s own statistical bound is tested in experiments, and they violate it.',
      'No signalling: Alice cannot choose her $\\pm1$, and her chance stays ½ whatever the others measure.',
    ],
    equations: 'P_{\\mathrm{win}}^{\\mathrm{LHV}} \\le \\tfrac34 < 1 = P_{\\mathrm{win}}^{\\mathrm{QM}}',
    trap: 'Saying that Alice’s choice changes Bob’s spin. Only the later comparison shows the correlation.',
    claims: [
      claim('l10Classical', 'every local plan is capped at ¾', () => close(V.l10Classical, 0.75)),
      claim('l10QWin', 'quantum mechanics wins every round', () => close(V.l10QWin, 1)),
      claim('l10NoSignal', 'Alice’s chance stays ½', () => close(V.l10NoSignal, 0.5)),
    ],
  },
}

