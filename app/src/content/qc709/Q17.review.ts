/**
 * Chapter Q17 review cards: the exam layer in both tracks (P-Q17-story §6). Ground-up ≤ 25 words per sentence, Formal ≤ 40; ≤ 5 points each.
 * Every displayed number comes from Q17.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { V, claim, close, d } from './Q17.values'

export const Q17_REVIEW: Record<string, ReviewCard> = {
  'q17-oracle': {
    points: [
      'The oracle flips the sign of one string and leaves every other alone.',
      'A sign changes no chance, so the mark alone does not help.',
      `After the mark every one of the eight strings still has chance $${d(V.q17Blind, 3)}$.`,
      'One Grover step is: mark, H\u2019s, flip every string except $000$, H\u2019s.',
    ],
    equations: 'Q = -U_HU_0U_HU_f',
    trap: 'Expecting the mark alone to make the marked string more likely: it changes a sign, not a chance.',
    claims: [claim('q17Blind', 'after the mark each of the eight strings still has chance $0.125$', () => close(V.q17Blind, 1 / 8, 1e-9))],
    formal: {
      points: [
        '$U_f = I - 2|x_0\\rangle\\langle x_0|$ and $|\\langle x|U_f|w_0\\rangle|^2 = 1/N$ for every $x$: a phase oracle is invisible to one reading.',
        '$U_0 = I - 2|0\\rangle\\langle0|$, $U_H = H^{\\otimes n}$, $|w_0\\rangle = U_H|0\\rangle$.',
        '$Q = -U_HU_0U_HU_f$; the circuit\u2019s third column is $-U_0$.',
      ],
      trap: 'Reading the minus sign of $-U_0$ as part of the oracle: it is the sign of $Q$, only a global phase when dropped.',
    },
  },
  'q17-plane': {
    points: [
      'The state stays in one flat real plane: $|x_0\\rangle$ up, the even mix of the others across.',
      `The start sits at angle $\\alpha$ with $\\sin\\alpha = 1/\\sqrt N$, which is $${d(V.q17SinA, 4)}$ for eight strings.`,
      'Angles in this plane are true state angles, never doubled.',
      'The unmarked strings always share one amplitude, so they act as one direction.',
    ],
    equations: '|w_0\\rangle = \\sin\\alpha|x_0\\rangle + \\cos\\alpha|x_0^\\perp\\rangle',
    trap: 'Drawing this plane as a Bloch sphere: there states with no overlap sit $180°$ apart, here $90°$.',
    claims: [claim('q17SinA', 'for eight strings $\\sin\\alpha = 0.3536$', () => close(V.q17SinA, 1 / Math.sqrt(8), 1e-9))],
    formal: {
      points: [
        '$U_f|w_0\\rangle = |w_0\\rangle - \\tfrac{2}{\\sqrt N}|x_0\\rangle$ and $-U_{w_0}|x_0\\rangle = \\tfrac{2}{\\sqrt N}|w_0\\rangle - |x_0\\rangle$, so $Q$ maps $S$ into $S$ (Eq. 7.15, corrected).',
        '$|x_0^\\perp\\rangle = (|w_0\\rangle - \\langle x_0|w_0\\rangle|x_0\\rangle)/\\sqrt{1 - 1/N}$, with a minus sign.',
        '$\\sin\\alpha = 1/\\sqrt N$, $\\cos\\alpha = \\sqrt{1 - 1/N}$ (Eq. 7.17); N&C write $\\theta/2$ for $\\alpha$.',
      ],
      trap: 'Copying Bergou\u2019s plus sign in $|x_0^\\perp\\rangle$: with it the two basis vectors are not orthogonal.',
    },
  },
  'q17-two-reflections': {
    points: [
      'The mark is a mirror along the across axis; the rest of the step is a mirror along the line through $|w_0\\rangle$.',
      'Two mirrors that meet at angle $\\alpha$ turn everything by $2\\alpha$.',
      `One step therefore turns the arrow by $${d(V.q17TwoAlphaDeg, 2)}°$ for eight strings.`,
      'Mirrors do not commute: the reversed order turns the other way.',
    ],
    equations: 'R_{w_0}R_{x_0^\\perp} = R(2\\alpha)',
    trap: 'Thinking one step turns the arrow by $\\alpha$, the angle between the mirrors, instead of $2\\alpha$.',
    claims: [claim('q17TwoAlphaDeg', 'one step turns the arrow by $41.41°$', () => close(V.q17TwoAlphaDeg, (2 * Math.asin(1 / Math.sqrt(8)) * 180) / Math.PI, 1e-9))],
    formal: {
      points: [
        'On $S$, $U_f$ is the reflection about $|x_0^\\perp\\rangle$\u2019s line and $D = -U_{w_0}$ the reflection about $|w_0\\rangle$\u2019s line (Eq. 7.16).',
        'Theorem 1 (Bergou p. 122): reflecting in $M_1$ and then in $M_2$ is a rotation by twice the angle between the two lines.',
        '$R_{x_0^\\perp}R_{w_0} = R(-2\\alpha)$ is the inverse of $Q$ on $S$.',
      ],
      trap: 'Reading $R_{w_0}R_{x_0^\\perp}$ with the mirrors in the other order: it turns toward $|x_0^\\perp\\rangle$, away from the target.',
    },
  },
  'q17-iterate': {
    points: [
      `After $k$ steps the chance of $x_0$ is $\\sin^2((2k+1)\\alpha)$: $${d(V.q17P1, 4)}$ after one step and $${d(V.q17P2, 4)}$ after two.`,
      'In bars, the last three moves reflect every bar about the average.',
      `Stop at the closest whole number of steps, $k^* = ${V.q17Kopt8}$ for eight strings and $${V.q17Kopt1024}$ for 1024.`,
      `One step too many overshoots: the chance falls to $${d(V.q17P3, 4)}$.`,
    ],
    equations: 'k^* = \\mathrm{CI}\\left(\\tfrac{\\pi - 2\\alpha}{4\\alpha}\\right)',
    trap: 'Thinking more steps always mean a better chance: the arrow keeps turning past vertical.',
    claims: [
      claim('q17P1', 'one step gives chance $0.7813$', () => close(V.q17P1, 25 / 32, 1e-9)),
      claim('q17P2', 'two steps give $0.9453$', () => close(V.q17P2, 121 / 128, 1e-9)),
      claim('q17P3', 'three steps give $0.3301$', () => close(V.q17P3, 169 / 512, 1e-9)),
    ],
    formal: {
      points: [
        `$Q^k|w_0\\rangle = \\sin((2k+1)\\alpha)|x_0\\rangle + \\cos((2k+1)\\alpha)|x_0^\\perp\\rangle$ (Eq. 7.18), so $P_k = \\sin^2((2k+1)\\alpha)$.`,
        '$D = 2|w_0\\rangle\\langle w_0| - I$ is the inversion about the mean $\\bar a$: $a_x \\mapsto 2\\bar a - a_x$ (N&C Eq. 6.7).',
        '$k^* = \\mathrm{CI}((\\pi - 2\\alpha)/(4\\alpha))$, and the miss chance at $k^*$ is at most $\\sin^2\\alpha = 1/N$.',
        'With $M$ marked strings, $\\sin\\alpha = \\sqrt{M/N}$ and $|x_0\\rangle$ is their even mix.',
      ],
      trap: 'Using $P_k$ beyond $k^*$: $Q$ is a rotation, so $P_k$ is periodic and falls after the first peak.',
    },
  },
  'q17-optimal': {
    points: [
      'Compare every run of any search method with the same fixed steps and no oracle.',
      'Each query adds only a little to the total difference: after $k$ queries it is at most $4k^2$.',
      'Success above one half forces the difference to grow like $N$, so $k$ must grow like $\\sqrt N$.',
      `For $N = 1024$ the bound asks for $${d(V.q17Bbbv1024, 2)}$ queries and Grover uses $${V.q17Kopt1024}$: the same growth.`,
    ],
    equations: 'k \\ge \\tfrac{\\sqrt{2-\\sqrt2}}{2}\\sqrt N\\sqrt{1 - \\tfrac{2}{(2-\\sqrt2)\\sqrt N}}',
    trap: `Reading $${V.q17BbbvQueries1024}$ against $${V.q17Kopt1024}$ as Grover being far from optimal: the bound is only for success above one half, and the growth is the same.`,
    claims: [claim('q17Bbbv1024', 'for 1024 strings the bound is $11.57$ queries', () => close(V.q17Bbbv1024, Math.sqrt((1024 * (2 - Math.SQRT2) - 2 * 32) / 4), 1e-9))],
    formal: {
      points: [
        '$D_{k+1} \\le D_k + 4\\sqrt{D_k} + 4$ gives $D_k \\le 4k^2$ (Eqs. 7.21\u20137.25).',
        'Success above one half for every $x$ forces $D_k \\ge N(2-\\sqrt2) - 2\\sqrt N$ (Eq. 7.27).',
        'Together: Eq. 7.29, so any algorithm needs a number of queries of order $\\sqrt N$, and Grover\u2019s method is optimal.',
      ],
      trap: 'Confusing $D_k$, a sum of differences between runs, with the diffusion operator $D$ of Unit 17.3.',
    },
  },
}
