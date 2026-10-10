/**
 * Chapter F8 review cards: the exam layer in both tracks (P-F8-story §6). Ground-up ≤ 25 words per sentence, Formal ≤ 40; ≤ 5 points each.
 * Every displayed number comes from F8.values.ts and is backed by a keyed claim.
 */
import type { ReviewCard } from '../schema'
import { LISTS, V, claim, close } from './F8.values'

export const F8_REVIEW: Record<string, ReviewCard> = {
  'f8-clock': {
    points: [
      'Mod $N$ keeps only the remainder after dividing by $N$, so numbers live on a clock of $N$ marks.',
      `A list has period $r$ if every value comes back $r$ steps later. The powers of 2 mod 21 have period ${V.f8Period2Pow}.`,
      `An exponent only matters mod the period: $2^{100}$ matches $2^{${V.f8HundredMod6}}$, which is ${V.f8Pow2e100}.`,
      `The places where $2^x \\bmod 21 = 1$ form a comb with step ${V.f8Comb32Step}, and the rest of the chapter reads that step.`,
    ],
    equations: 'a \\equiv b \\pmod N',
    trap: `Leaving a remainder negative: $-3 \\bmod 12$ is ${V.f8NegMod}, not $-3$.`,
    claims: [
      claim('f8Period2Pow', 'the powers of 2 mod 21 have period 6', () => V.f8Period2Pow === 6),
      claim('f8Pow2e100', '2^100 mod 21 matches 2^4 and is 16', () => V.f8Pow2e100 === 16 && V.f8HundredMod6 === 4),
      claim('f8Comb32Step', 'the comb of 2^x ≡ 1 has step 6', () => V.f8Comb32Step === 6),
      claim('f8NegMod', '−3 mod 12 is 9', () => V.f8NegMod === 9),
    ],
    formal: {
      points: [
        '$a \\equiv b \\pmod N$ means $N$ divides $a - b$; $a \\bmod N \\in \\{0, \\ldots, N-1\\}$, and sums and products pass to remainders (N&C p. 626).',
        `$f$ has period $r$ if $f(x + r) = f(x)$ for all $x$, with $r$ least. $f(x) = 2^x \\bmod 21$ has $r = ${V.f8Period2Pow}$.`,
        `Since $2^6 \\equiv 1$, $2^{100} = (2^6)^{16}2^4 \\equiv 2^{${V.f8HundredMod6}} = ${V.f8Pow2e100}$: exponents count only mod the period.`,
        `The level set $\\{x < 32 : 2^x \\equiv 1\\}$ is the comb $\\{0, 6, \\ldots, 30\\}$ of step ${V.f8Comb32Step}.`,
      ],
      trap: `Taking the remainder of a negative number as negative: $-3 \\bmod 12 = ${V.f8NegMod}$.`,
    },
  },
  'f8-euclid': {
    points: [
      `Euclid’s shortcut swaps the pair for the smaller number and the remainder: $\\gcd(84, 36) = \\gcd(36, 12) = ${V.f8Gcd8436}$.`,
      `An inverse of $a$ mod $N$ exists exactly when $a$ and $N$ share no factor. Mod 21, $2^{-1} = ${V.f8Inv2mod21}$ and $4^{-1} = ${V.f8Inv4mod21}$.`,
      `The order of $x$ is the number of multiplications that return to 1. Doubling mod 21 has order ${V.f8Order2mod21}.`,
      `An even order splits $N$: $2^3 = ${V.f8HalfPow}$ gives $\\gcd(7, 21) = ${V.f8FacA}$ and $\\gcd(9, 21) = ${V.f8FacB}$.`,
    ],
    equations: '\\gcd(a, b) = \\gcd(b, a \\bmod b)',
    trap: 'Expecting every number to have an order: 3 shares a factor with 21, and its powers never reach 1.',
    claims: [
      claim('f8Gcd8436', 'gcd(84, 36) = 12', () => V.f8Gcd8436 === 12),
      claim('f8Inv2mod21', 'the inverses of 2 and 4 mod 21 are 11 and 16', () => V.f8Inv2mod21 === 11 && V.f8Inv4mod21 === 16),
      claim('f8Order2mod21', 'doubling mod 21 has order 6', () => V.f8Order2mod21 === 6),
      claim('f8FacA', 'gcd(7, 21) = 7 and gcd(9, 21) = 3, from 2³ = 8', () => V.f8HalfPow === 8 && V.f8FacA === 7 && V.f8FacB === 3),
    ],
    formal: {
      points: [
        `$\\gcd(a, b) = \\gcd(b, a \\bmod b)$ (N&C p. 628); Euclid back-substituted writes $\\gcd$ as the least positive $ax + by$, here $${V.f8Gcd8436} = 1 \\cdot 84 - 2 \\cdot 36$ (N&C p. 626).`,
        `$a^{-1} \\bmod N$ exists iff $\\gcd(a, N) = 1$ (N&C p. 627); $\\gcd(3, 21) = ${V.f8Gcd321}$ leaves 3 with none.`,
        `The order is the least $r > 0$ with $x^r \\equiv 1$ (N&C p. 633); it divides the count of residues with an inverse, ${V.f8Units21} for $N = 21$.`,
        `If $r$ is even and $x^{r/2} \\not\\equiv -1$, then $\\gcd(x^{r/2} \\pm 1, N)$ are proper factors (N&C pp. 633–635): $21 = 7 \\times 3$.`,
      ],
      trap: 'Expecting an order for every $x$: it exists exactly when $\\gcd(x, N) = 1$.',
    },
  },
  'f8-roots': {
    points: [
      'Turn by $360°/N$ again and again from 1: after $N$ turns you are back, and the $N$ stops are the roots of unity.',
      'The $N$ roots, laid tip to tail, close into a regular $N$-gon, so they add to 0.',
      `Stepping $j$ corners at a time, the $N$ arrows still add to 0. If $N$ divides $j$, all point at 1 and the sum is $N$.`,
      `Cancelling needs a full lap: for $N = 12$ the first three roots alone have a sum of length ${(Math.round(V.f8First3of12 * 1000) / 1000).toFixed(3)}.`,
    ],
    equations: '\\sum_{k=0}^{N-1}\\omega^{jk} = 0 \\text{ unless } N \\mid j',
    trap: 'Thinking any $N$ arrows of length 1 add to 0: only an even spread round the circle does.',
    claims: [
      claim('f8RootSum5', 'the 5th roots add to 0', () => close(V.f8RootSum5, 0, 1e-12)),
      claim('f8PowSum8j8', 'for N = 8 and j = 8 the arrows add to 8', () => close(V.f8PowSum8j8, 8, 1e-12)),
      claim('f8First3of12', '1 + ω + ω² has length 2.732 for N = 12', () => close(V.f8First3of12, 2.732, 5e-4)),
    ],
    formal: {
      points: [
        '$\\omega = e^{2\\pi i/N}$; $\\omega^k$ for $k < N$ are all the roots of $z^N = 1$ (Axler p. 125; at most $N$ zeros, Axler p. 123).',
        '$S = \\sum_k\\omega^k$ satisfies $\\omega S = S$, and $\\omega \\ne 1$ gives $S = 0$ for $N \\ge 2$.',
        '$\\sum_{k<N}\\omega^{jk} = N$ if $N$ divides $j$ and 0 otherwise, since $z = \\omega^j$ obeys $zS = S$.',
        `A partial lap does not cancel: $|1 + \\omega + \\omega^2| = ${(Math.round(V.f8First3of12 * 10000) / 10000).toFixed(4)}$ for $N = 12$.`,
      ],
      trap: 'Applying $\\sum_k\\omega^k = 0$ to a sum over fewer than all $N$ roots.',
    },
  },
  'f8-dft': {
    points: [
      'The transform turns a list $c_0, \\ldots, c_{N-1}$ into $\\hat c_0, \\ldots, \\hat c_{N-1}$: each entry adds the list times a row of arrows $\\omega^{jk}$, then divides by $\\sqrt N$.',
      'Its columns are perpendicular unit vectors, so it is unitary and loses nothing.',
      `A comb of step $r$ in $N$ places gives spikes $N/r$ apart. For step 2 in 8, the two spikes are each ${(Math.round(V.f8Comb2Peak * 10000) / 10000).toFixed(4)}.`,
      'Sliding the comb only turns the spikes; the sizes stay the same.',
    ],
    equations: '(F_N)_{kj} = \\omega^{jk}/\\sqrt N',
    trap: 'Using numpy’s fft for $F_N$: its sign is minus, and ours is plus.',
    claims: [
      claim('f8DftUnitary', 'F†F = I for N = 8', () => close(V.f8DftUnitary, 0, 1e-12)),
      claim('f8Comb2Peak', 'the spikes of the step-2 comb are 0.7071', () => close(V.f8Comb2Peak, 0.7071, 5e-5)),
      claim('f8ShiftSizeGap', 'a shift leaves every size unchanged', () => close(V.f8ShiftSizeGap, 0, 1e-12)),
    ],
    formal: {
      points: [
        '$\\hat c_k = \\frac{1}{\\sqrt N}\\sum_jc_j\\omega^{jk}$ and $(F_N)_{kj} = \\omega^{jk}/\\sqrt N$ (N&C Eq. 5.1, p. 217); the sign is $+$, numpy’s fft has $-$.',
        '$(F^\\dagger F)_{jl} = \\frac1N\\sum_k\\omega^{k(l-j)} = \\delta_{jl}$, so $F_N$ is unitary and $F^{-1} = F^\\dagger$ (N&C ⚑ Ex. 5.1).',
        '$c_j = \\sqrt{r/N}$ on $j \\equiv 0 \\pmod r$, with $r$ dividing $N$, gives $\\hat c_k = 1/\\sqrt r$ when $N/r$ divides $k$ and 0 otherwise.',
        'A shift $c_j \\to c_{j-s}$ multiplies $\\hat c_k$ by $\\omega^{sk}$: sizes unchanged, phases turned.',
      ],
      trap: 'Writing the transform with $e^{-2\\pi ijk/N}$: that is numpy’s sign, not N&C’s.',
    },
  },
  'f8-geometric': {
    points: [
      'Multiply a geometric sum by $u$ and subtract: nearly everything cancels, leaving $(1 - u^M)/(1 - u)$.',
      `The gap from 1 to $e^{i\\theta}$ is a chord of length $2\\sin(\\theta/2)$; it is 1 at $60°$.`,
      `Eight arrows each turned $\\delta$ more than the last keep at least $2/\\pi \\approx ${(Math.round(V.f8TwoOverPi * 1000) / 1000).toFixed(3)}$ of their straight length, when $\\delta$ is at most half a step.`,
      'More arrows make the peak narrower, and the worst case settles at $2/\\pi$ from above.',
    ],
    equations: '|1 - e^{i\\theta}| = 2|\\sin\\tfrac\\theta2|',
    trap: 'Expecting more arrows to raise the worst case at half a step: it only settles toward $2/\\pi$.',
    claims: [
      claim('f8GeomHalf4', 'with u = 0.5 and M = 4 the sum is 1.875', () => close(V.f8GeomHalf4, 1.875, 1e-12)),
      claim('f8Chord60', 'the chord at 60° is 1', () => close(V.f8Chord60, 1, 1e-12)),
      claim('f8TwoOverPi', '2/π = 0.637', () => close(V.f8TwoOverPi, 0.637, 5e-4)),
    ],
    formal: {
      points: [
        '$\\sum_{t<M}u^t = (1 - u^M)/(1 - u)$ for $u \\ne 1$; for $u = e^{i\\theta}$ the terms form a chain of arrows (Bergou Eq. 7.39, p. 128).',
        `$|1 - e^{i\\theta}| = 2|\\sin(\\theta/2)|$, and $\\tfrac{2|\\theta|}{\\pi} \\le |1 - e^{i\\theta}| \\le |\\theta|$ for $|\\theta| \\le \\pi$ (Bergou Eqs. 7.40–7.41).`,
        `$D_M(\\delta) = |\\sin\\pi M\\delta| / (M|\\sin\\pi\\delta|) \\ge 2/\\pi$ for $|\\delta| \\le 1/(2M)$ (Bergou Eqs. 7.39–7.42), so the chance is at least $4/\\pi^2 = ${(Math.round(V.f8FourOverPi2 * 10000) / 10000).toFixed(4)}$.`,
        'A comb of $A$ teeth has $|\\hat c_k| = \\sqrt{A/N}\\,D_A(rk/N)$: the leak of a step that does not divide $N$.',
      ],
      trap: 'Reading $D_M(1/(2M)) \\ge 2/\\pi$ as a bound that gets better with $M$: it is sharp as $M$ grows.',
    },
  },
  'f8-fractions': {
    points: [
      `A binary fraction writes a number below 1 in halves, quarters and eighths: $0{.}101_2 = ${V.f8Bin101}$, a turn of $225°$.`,
      'Doubling shifts the digits left, and a whole turn changes nothing, so doubling drops the leading digit.',
      `A continued fraction rewrites $5/32$ as $[0; 6, 2, 2]$; stopping early gives the convergents $1/6$, $2/13$ and $5/32$.`,
      `A tall bar at $y$ of $32$ is read as $y/32$; its convergent $1/6$ passes the check $2^6 \\equiv 1$, so the period is 6.`,
    ],
    equations: '\\Big|\\frac{y}{2^m} - \\frac kr\\Big| \\le \\frac{1}{2r^2}',
    trap: 'Trusting a convergent without checking $x^q \\equiv 1$: bar 11 suggests 3, and $2^3$ is 8, not 1.',
    claims: [
      claim('f8Bin101', '0.101 in binary is 0.625', () => V.f8Bin101 === 0.625),
      claim('f8Conv1', 'the convergents of 5/32 are 1/6, 2/13, 5/32', () => close(V.f8Conv1, 1 / 6) && close(V.f8Conv2, 2 / 13) && close(V.f8Conv3, 5 / 32)),
      claim('f8Pick5', 'bar 5 gives the period 6', () => V.f8Pick5 === 6 && LISTS.SUCCESS.includes(5)),
    ],
    formal: {
      points: [
        `$0{.}d_1d_2\\ldots d_m = \\sum_ld_l2^{-l}$ (N&C p. 218); $e^{2\\pi i\\,2^s x} = e^{2\\pi i\\,(2^s x \\bmod 1)}$, so multiplying by $2^s$ drops the leading $s$ digits of $x$.`,
        `$p/q = [a_0; a_1, \\ldots, a_n]$ with the quotients of Euclid’s algorithm; the convergents obey $p_l = a_lp_{l-1} + p_{l-2}$ (N&C pp. 635–637).`,
        `If $|y/2^m - k/r| \\le 1/(2r^2)$, then $k/r$ is a convergent of $y/2^m$ (N&C p. 637); test each denominator $q$ with $x^q \\equiv 1$.`,
        `For the 32-point comb of period 6, only $y = 5$ and $27$ return $r = 6$, with total chance ${(Math.round(V.f8SuccessP * 10000) / 10000).toFixed(4)}$.`,
      ],
      trap: 'Taking a convergent’s denominator for the period without testing it: $k$ and $r$ may share a factor.',
    },
  },
}
