/**
 * Chapter Q19 review cards: the exam layer in both tracks (P-Q19-story §6). Ground-up ≤ 25 words per sentence, Formal ≤ 40; ≤ 5 points each.
 * Every displayed number comes from Q19.values.ts and is backed by a keyed claim (a claim of the card or of its unit's beats).
 */
import type { ReviewCard } from '../schema'
import { V, claim, close, d, tf } from './Q19.values'

export const Q19_REVIEW: Record<string, ReviewCard> = {
  'q19-random-walk': {
    points: [
      `A fair-coin walker spreads like the square root of the steps: $${d(V.q19SigmaClass100, 0)}$ after 100 steps.`,
      `After ten steps it is back at 0 with chance $${d(V.q19P10Zero, 4)}$.`,
      'On a graph, $2N^3$ random steps test for a path, and $m$ runs err below $2^{-m}$.',
      'A quantum coin changes the spread: it grows in proportion to the steps (beyond the book).',
    ],
    equations: 'p(x;n) = \\binom{n}{(n+x)/2}2^{-n},\\quad \\sigma = \\sqrt n',
    trap: 'Saying that a quantum walker spreads like $\\sqrt n$ too: with a quantum coin the spread is linear.',
    claims: [
      claim('q19P10Zero', 'ten steps return to 0 with chance $0.2461$', () => close(V.q19P10Zero, 252 / 1024, 1e-12)),
      claim('q19P4Zero', 'four steps return to 0 with chance $0.375$ (a challenge)', () => close(V.q19P4Zero, 6 / 16, 1e-12)),
      claim('q19Conn6', 'for six dots the path test walks $2N^3 = 432$ steps (a challenge)', () => V.q19Conn6 === 432),
    ],
    formal: {
      points: [
        '$p(x;n) = \\binom{n}{(n+x)/2}2^{-n}$ and $\\sigma(n) = \\sqrt n$, from the variances of independent steps (Bergou p. 130).',
        'A walk of $2N^3$ steps finds an existing path with probability above $\\tfrac12$ (Bergou p. 131), so $m$ runs err below $2^{-m}$.',
        `Beyond the book: the Hadamard-coin walk has $\\sigma(n)/n \\to ${d(V.q19CoinRatio100, 4)}$, a linear spread.`,
      ],
      trap: 'Carrying $\\sigma = \\sqrt n$ over to the coined quantum walk, whose spread is linear in $n$.',
    },
  },
  'q19-scatter': {
    points: [
      'A quantum walker lives on edges: an edge state says which edge it is on and which way it moves.',
      'At a vertex with $n$ edges it bounces with amplitude $-r$ or goes on with amplitude $t$.',
      `Unitarity forces $r = (n-2)/n$ and $t = 2/n$: ${d(V.q19Vertex8R, 2)} and ${d(V.q19Vertex8T, 2)} at $n = 8$.`,
      'The centre of the star is Grover’s mirror: reflect every amplitude about the mean.',
    ],
    equations: 'r = \\tfrac{n-2}{n},\\quad t = \\tfrac2n',
    trap: 'Giving every edge the same amplitude $1/n$: that table does not keep chance equal to 1.',
    claims: [
      claim('q19Vertex8R', 'at a vertex with 8 edges $r = 0.75$', () => close(V.q19Vertex8R, 0.75, 1e-9)),
      claim('q19Vertex8T', 'and $t = 0.25$', () => close(V.q19Vertex8T, 0.25, 1e-9)),
      claim('q19Vertex5T', 'at a vertex with 5 edges $t = 0.4$ (a challenge)', () => close(V.q19Vertex5T, 0.4, 1e-12)),
      claim('q19Vertex5MinusR', 'and the bounce amplitude $-r = -0.6$ (a challenge)', () => close(V.q19Vertex5MinusR, -0.6, 1e-12)),
    ],
    formal: {
      points: [
        'Edge states $|v_1, v_2\\rangle$ form an orthonormal basis of dimension $2E$, and the walk step is $U = \\prod_vU_v$ (Bergou p. 131).',
        'Eqs. 7.45–7.48: $U_v|j,v\\rangle = -r|v,j\\rangle + t\\sum_{k\\ne j}|v,k\\rangle$ with $r = (n-2)/n$ and $t = 2/n$ from unitarity.',
        `For $n = 8$ the table is $2|s\\rangle\\langle s| - I$, the inversion about the mean of Chapter Q17: ${d(V.q19Vertex8R, 2)} and ${d(V.q19Vertex8T, 2)}.`,
      ],
      trap: 'Using equal amplitudes $1/n$ on all edges, which is not unitary.',
    },
  },
  'q19-star-search': {
    points: [
      'By symmetry the walker stays inside four combined states, so one step is a $4\\times4$ table.',
      `Its eigen-angle $\\alpha$ has $\\sin\\alpha = 1/\\sqrt N$: ${d(V.q19Alpha8, 1)}° for $N = 8$.`,
      `The marked spoke is found after about $\\tfrac\\pi2\\sqrt N$ steps: its chance is ${d(V.q19StarP4, 4)} at step 4.`,
      'The walk gives exactly Grover’s chances, two walk steps for each Grover step.',
    ],
    equations: '\\lambda = \\pm e^{\\pm i\\alpha},\\quad \\sin\\alpha = \\tfrac{1}{\\sqrt N}',
    trap: 'Thinking the walk needs about $N$ steps: it needs about $\\sqrt N$.',
    claims: [
      claim('q19Alpha8', 'for $N = 8$ the exact angle is $20.705°$', () => close(V.q19Alpha8, 20.705, 5e-4)),
      claim('q19StarP4', 'the chance at step 4 is $0.9453$', () => close(V.q19StarP4, 0.9453, 5e-5)),
      claim('q19Alpha16', 'for 16 spokes $\\alpha = 14.478°$ (a challenge)', () => close(V.q19Alpha16, 14.478, 5e-4)),
      claim('q19StarPeak64', 'and for 64 spokes the first peak is at step 12 (a challenge)', () => V.q19StarPeak64 === 12),
    ],
    formal: {
      points: [
        'Eqs. 7.49–7.54: the span of $\\psi_1, \\ldots, \\psi_4$ is invariant, and $\\lambda^4 - 2r\\lambda^2 + 1 = 0$ gives $\\lambda = \\pm e^{\\pm i\\alpha}$, $\\sin^2\\alpha = 1/N$.',
        'Eqs. 7.62–7.63 and our calculation: $P_{\\mathrm{walk}}(n) = \\sin^2((2\\lfloor n/2\\rfloor + 1)\\alpha)$, Chapter Q17’s chance after $\\lfloor n/2\\rfloor$ steps.',
        `For $N = 1024$ the first peak is at $n = ${V.q19StarN1024}$ with chance ${d(V.q19StarP1024, 4)}, against ${d(V.q19ClassAvg1024, 1)} classical checks on average.`,
      ],
      trap: 'Using Bergou’s $\\Delta = 1/\\sqrt N$ as if it were exact: the exact angle is $\\alpha$.',
    },
  },
  'q19-extra-edge': {
    points: [
      'When two spokes share an extra edge, a five-dimensional space carries the walk.',
      'The start has a minus sign between its leaving and its arriving edges.',
      'At the peak, a reading of the spokes finds the edge with chance $\\tfrac23$.',
      `With a plus sign the search fails: in 40 steps, at best ${d(V.q19ExtraPlus64, 3)} for 64 spokes.`,
    ],
    equations: '\\Delta = \\sqrt{\\tfrac{2t}{3}} = \\tfrac{2}{\\sqrt{3N}}',
    trap: 'Thinking that the sign of the start does not matter.',
    claims: [
      claim('q19ExtraAsym', 'at the peak the chance on spokes 1 and 2 is $\\tfrac23$', () => close(V.q19ExtraAsym, 2 / 3, 1e-12)),
      claim('q19ExtraPlus64', 'from the plus start at $N = 64$ the best chance over $n \\le 40$ is $0.0829$', () => close(V.q19ExtraPlus64, 0.0829, 5e-5)),
    ],
    formal: {
      points: [
        'Eqs. 7.64–7.73: $S = \\mathrm{span}\\{\\psi_1, \\ldots, \\psi_5\\}$ is invariant, and the double root near $-1$ splits as $-1 \\pm i\\Delta$ with $\\Delta = 2/\\sqrt{3N}$.',
        `Eq. 7.79: at $n\\Delta = \\pi/2$ the weights on $\\psi_1$, $\\psi_2$, $\\psi_5$ are $${tf(V.q19ExtraAsymEdge)}$ each, so spokes 1 and 2 have chance $\\tfrac23$.`,
        `For $N = 64$ the engine peaks at $n = ${V.q19ExtraPeak64}$ with ${d(V.q19ExtraNear64, 4)}; for $N = 1024$ the highest peak of the first swing is at $n = ${V.q19ExtraPeak1024}$.`,
      ],
      trap: 'Starting with plus in Eq. 7.67, which does not concentrate the walker.',
    },
  },
  'q19-simulation': {
    points: [
      'Imitating $N$ spins takes $N$ qubits, where a classical computer must store $2^N$ numbers.',
      'Each bond is a two-qubit gate: a mix of doing nothing and swapping.',
      'Bonds that share a spin do not commute, so the product of bond gates is only close to the truth.',
      `With $M$ pieces the error falls like $1/M$: ${d(V.q19TrotErr8, 3)} at $M = 8$ for the three-spin chain.`,
    ],
    equations: '\\|U - (U_1U_2)^M\\| \\le \\tfrac{t^2}{2M}\\|[H_1,H_2]\\|',
    trap: 'Believing that each bond gate is exact, so their product is exact too.',
    claims: [
      claim('q19TrotErr8', 'with eight pieces the error is $0.0911$', () => close(V.q19TrotErr8, 0.0911, 5e-5)),
      claim('q19TrotErr4', 'with four pieces it is $0.1825$, twice the error at eight', () => close(V.q19TrotErr4, 0.1825, 5e-5)),
      claim('q19Amps20', 'twenty spins need $1048576$ amplitudes (a challenge)', () => V.q19Amps20 === 2 ** 20),
      claim('q19SwapJt', 'a bond is exactly a swap at $Jt = \\pi$ (a challenge)', () => close(V.q19SwapJt, Math.PI, 1e-12)),
    ],
    formal: {
      points: [
        'Eq. 7.80: $H = -J\\sum_n\\mathbf S_n\\cdot\\mathbf S_{n+1}$, and each term is $U_n(t) = e^{-iJt/4}[\\cos(Jt/2)\\,I + i\\sin(Jt/2)\\,\\mathrm{SWAP}]$.',
        'Eqs. 7.81–7.82 and N&C p. 207: $\\|U(t) - [U_1(t/M)U_2(t/M)]^M\\| \\le t^2\\|[H_1,H_2]\\|/2M$.',
        `The symmetric split (N&C p. 208) falls as $1/M^2$: ${d(V.q19Trot2Ratio, 2)} per doubling, against ${d(V.q19TrotRatio1, 2)} for first order.`,
      ],
      trap: 'Reading $e^{-it(H_1+H_2)} = e^{-itH_1}e^{-itH_2}$ when $[H_1,H_2] \\ne 0$.',
    },
  },
  'q19-qaoa': {
    points: [
      'Phases carry each string’s cut number, and the mixer turns phase differences into chances.',
      'Two angles $\\gamma$ and $\\beta$ are tuned by a classical computer: a hybrid loop.',
      `On the square one layer reaches an average cut of ${d(V.q19FStar, 0)}, three quarters of the best.`,
      `The best cut shows up with chance ${d(V.q19QaoaPOpt, 3)}, against ${d(V.q19CutRandomP, 3)} for a guess.`,
    ],
    equations: 'F = 2 + \\sin4\\beta\\sin2\\gamma',
    trap: 'Expecting one layer to find the best cut for sure.',
    claims: [
      claim('q19FStar', 'the best average cut is $3$', () => close(V.q19FStar, 3, 1e-12)),
      claim('q19QaoaPOpt', 'the best cut appears with chance $0.531$', () => close(V.q19QaoaPOpt, 17 / 32, 1e-12)),
      claim('q19CutRandomP', 'a random guess finds it with chance $0.125$', () => close(V.q19CutRandomP, 0.125, 1e-12)),
      claim('q19Cut0011', 'the teams 0011 cut $2$ sides (a challenge)', () => V.q19Cut0011 === 2),
    ],
    formal: {
      points: [
        'Eqs. 7.83–7.86: $|\\gamma,\\beta\\rangle = e^{-i\\beta H_B}e^{-i\\gamma H_C}|\\psi_{\\mathrm{in}}\\rangle$ and $F = \\langle\\gamma,\\beta|H_C|\\gamma,\\beta\\rangle$ is maximised by a classical optimiser.',
        `Our calculation finds $F = 2 + \\sin4\\beta\\sin2\\gamma$ on the 4-cycle, with $F^* = ${d(V.q19FStar, 0)}$ at $(\\pi/4, \\pi/8)$ and ratio ${d(V.q19QaoaRatio, 2)}.`,
        `A pattern search from $(${d(V.q19LoopStartG, 1)}, ${d(V.q19LoopStartB, 1)})$ takes ${V.q19LoopMoves} moves and ${V.q19LoopEvals} evaluations to reach ${d(V.q19LoopEnd, 4)}.`,
      ],
      trap: 'Taking a single layer for an algorithm that always returns an optimal cut.',
    },
  },
}

