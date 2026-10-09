/**
 * Lecture 8 review cards: the exam layer (owner: P; P-L8-story §6).
 * ≤ 5 points, ≤ 25 words per sentence; every number comes from L8.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from './schema'
import { V, claim, close, d } from './L8.values'

export const L8_REVIEW: Record<string, ReviewCard> = {
  'l8-variance-sum': {
    points: [
      'Each Pauli reading is $\\pm 1$, so $\\sigma_i^2 = I$ and the variance is $(\\Delta\\sigma_i)^2 = 1 - r_i^2$.',
      'A pure state has $r^2 = 1$, so the three variances always total $3 - r^2 = 2$.',
      'A state only moves the total between components. If one component is certain, the other two have variance 1.',
      `For θ = 60° and φ = 45° the variances are ${d(V.l8VarStarX, 3)}, ${d(V.l8VarStarY, 3)} and ${d(V.l8VarStarZ, 3)}.`,
    ],
    equations: '\\sum_i(\\Delta\\sigma_i)^2 = 3 - r^2 = 2',
    trap: 'Trying to make all three variances small at once. The total is fixed at 2.',
    claims: [
      claim('l8VarStarX', '(Δσ_x)² = 0.625', () => close(V.l8VarStarX, 0.625)),
      claim('l8VarStarY', '(Δσ_y)² = 0.625', () => close(V.l8VarStarY, 0.625)),
      claim('l8VarStarZ', '(Δσ_z)² = 0.750', () => close(V.l8VarStarZ, 0.75)),
    ],
  },
  'l8-polarization': {
    points: [
      'A polarization is $|\\psi\\rangle = \\alpha|H\\rangle + \\beta|V\\rangle$, and $H$ clicks with chance $|\\alpha|^2$. Each photon makes exactly one click.',
      'In the D/A basis, $|D\\rangle = (|H\\rangle + |V\\rangle)/\\sqrt2$ and $|A\\rangle = (|H\\rangle - |V\\rangle)/\\sqrt2$.',
      'H/V and D/A are mutually unbiased: each state of one pair gives 50/50 in the other, and certainty in its own.',
    ],
    equations: 'P(H) = |\\alpha|^2,\\qquad |D\\rangle,\\ |A\\rangle = \\tfrac{1}{\\sqrt2}\\left(|H\\rangle \\pm |V\\rangle\\right)',
    trap: 'Picturing half a photon at each detector. A photon makes one click; the chances show up over many photons.',
    claims: [claim('l8PDH', 'a cross chance is ½', () => close(V.l8PDH, 0.5))],
  },
  'l8-turning': {
    points: [
      'The turn of light comes from geometry: the columns of $R_{\\mathrm{pol}}(\\varphi)$ are where $H$ and $V$ end up.',
      'An analyzer at $\\chi_a$ passes a photon at $\\chi$ with chance $\\cos^2\\Delta\\chi$; the other port gets $\\sin^2\\Delta\\chi$.',
      'Crossed analyzers, 90° apart, block everything. Light uses the full angle where spin uses half of it.',
      `At Δχ = 15° the ports pass ${d(V.l8Pal15, 3)} and ${d(V.l8PalOther15, 3)}.`,
    ],
    equations: 'R_{\\mathrm{pol}}(\\varphi) = \\begin{pmatrix}\\cos\\varphi & -\\sin\\varphi\\\\ \\sin\\varphi & \\cos\\varphi\\end{pmatrix},\\qquad P = \\cos^2\\Delta\\chi',
    trap: 'Using the half angle of spin for light. A polarizer needs only a 90° turn to block a beam.',
    claims: [
      claim('l8Pal15', 'the aligned port passes cos² 15° = 0.933', () => close(V.l8Pal15, Math.cos(Math.PI / 12) ** 2)),
      claim('l8PalOther15', 'the other port passes 0.067', () => close(V.l8PalOther15, Math.sin(Math.PI / 12) ** 2)),
    ],
  },
  'l8-photon-spin': {
    points: [
      'The generator of the turn is $G = \\sigma_y$, which is $J_z/\\hbar$ written in the H/V basis.',
      'Its eigenstates $|C_\\pm\\rangle$ have helicity $\\pm 1$ and only gain phases $e^{\\mp i\\varphi}$. The photon has spin 1.',
      'A turn of the light by $\\varphi$ moves its Bloch point by $2\\varphi$. An electron’s point moves by $\\varphi$.',
    ],
    equations: 'R_{\\mathrm{pol}}(\\varphi) = e^{-i\\varphi\\sigma_y},\\qquad \\text{sphere turn} = 2\\varphi',
    trap: 'Reading the sphere’s $y$ axis as the lab’s $y$ axis. The sphere’s axes are averages, not directions in the lab.',
  },
  'l8-key': {
    points: [
      'A one-time pad sends $c = x \\oplus k$, and Bob recovers $x = c \\oplus k$ with the same key.',
      'Two unbiased bases stop Eve from reading all four states perfectly with one measurement.',
      'BB84 assumes an authenticated public channel and an ideal quantum channel.',
    ],
    equations: 'c = x \\oplus k,\\qquad x = c \\oplus k',
    trap: 'Thinking BB84 carries the message. It distributes key material only.',
  },
  'l8-bb84': {
    points: [
      'Alice prepares, Bob measures, they announce bases, keep the matching rounds, then test a sample.',
      'With no Eve, matched bases always agree and mismatched rounds are a fair coin.',
      'On the notes’ board, rounds 1, 4, 5 and 6 are kept, and both sifted strings read 0010.',
    ],
    equations: 'P(B_A = B_B) = \\tfrac12,\\qquad P(b \\ne a \\mid B_A = B_B) = 0',
    trap: 'Keeping the rounds whose bits happen to agree. Sift by the bases, never by the bits.',
    claims: [
      claim('l8PMatch', 'P(B_A = B_B) = ½', () => close(V.l8PMatch, 0.5)),
      claim('l8ErrNoEve', 'matched rounds never disagree without Eve', () => close(V.l8ErrNoEve, 0)),
    ],
  },
  'l8-attack': {
    points: [
      'If Eve guesses the wrong basis, Bob errs with chance ½. With the right basis he never errs.',
      'Averaging over her two choices, the error rate of the sifted key is $Q = \\tfrac12\\cdot 0 + \\tfrac12\\cdot\\tfrac12 = \\tfrac14$.',
      'In this attack Eve knows half of the sifted bits.',
    ],
    equations: 'Q = \\tfrac12\\cdot 0 + \\tfrac12\\cdot\\tfrac12 = \\tfrac14',
    trap: 'Writing Q = ⅛ because half of the rounds are dropped. Sifting is already counted in Q.',
    claims: [
      claim('l8ErrEveWrong', 'with Eve in the wrong basis Bob errs with chance ½', () => close(V.l8ErrEveWrong, 0.5)),
      claim('l8Q', 'Q = ¼', () => close(V.l8Q, 0.25)),
      claim('l8PerPhoton', 'the kept-and-wrong rate per photon is ⅛', () => close(V.l8PerPhoton, 0.125)),
    ],
  },
  'l8-test': {
    points: [
      'A test of $m$ sifted bits shows no error with chance $(\\tfrac34)^m$, under the full attack.',
      `For m = 20 that is ${d(V.l8Miss20 * 100, 2)}%; seventeen bits are the fewest that push it below 1%.`,
      'Then estimate the error rate, reconcile the strings, and hash them into a shorter key.',
    ],
    equations: 'P(\\text{no error in } m) = \\left(\\tfrac34\\right)^m',
    trap: 'Treating ¼ as a universal threshold. It is the error rate of this one attack only.',
    claims: [
      claim('l8Agree', 'a tested bit agrees with chance ¾', () => close(V.l8Agree, 0.75)),
      claim('l8Miss20', '(¾)^20 = 0.32 %', () => close(V.l8Miss20, 0.0032, 5e-5)),
      claim('l8Q', 'the full attack has Q = ¼', () => close(V.l8Q, 0.25)),
      claim('l8Risk', 'a miss chance of 1 % is the target', () => close(V.l8Risk, 0.01)),
    ],
  },
}
