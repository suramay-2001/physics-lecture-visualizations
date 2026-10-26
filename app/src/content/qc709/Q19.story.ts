/**
 * Chapter Q19 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q19-story.md §1, in both tracks, with the judge's rulings
 * (docs/roles/decisions/qc709-Q19.md): Bergou's scattering walk on the star graph is the chapter's walk (R1), the Hadamard coin walk on a line is ONE `deeper` beat
 * labelled "beyond the book" (random-walk:b5), the extra-edge search is its own unit (R2), the picture is the SVG kind `walk-graph` (R3), no Correction box (R6),
 * N = SPOKES throughout with one Rosetta line (R10), VQE is only named (R7), N&C is used for the Trotter formula only (R8).
 *
 * Build notes against the plan:
 * - Phase `'books'` throughout (no 709 notes reach Chapter 7 §7.6-7.8): ramp beats are `books`, the clues are `clue`, the Go-deeper beats are `deeper` and last in their unit.
 * - Every number is the ENGINE's, worded from the computed value: the star search started on the arriving edges peaks at step 5, not 4 (star-search:b6); the first-order
 *   error halves as M doubles (ratio 2.00 from M = 4 to 8); a `...Gap` is about 1e-15 and is shown through d(x, 0), which prints 0.
 * - The number reader takes digits around a point for a decimal, so equations are cited as "Eq. 7.49" or "Eqs. 7.50–7.53" (never the bare number in brackets), no theorem numbers appear in
 *   prose (N&C is cited by printed page), and an angle is written with its degree sign outside the TeX.
 * - A stage `split` never repeats a kind, so each pair below is picture + bars, graph + bars, curve + graph or circuit + bars.
 * - Unit mentions inside Foundations and Spin Lab are bridge chips `<<id|Unit F4.4>>`; this chapter's own units and the other 709 chapters are named in words ("Unit 19.4", "Chapter Q17").
 */
import type { Circuit } from '../../physics/qc/circuit'
import type { AmplitudesState, Beat, CircuitStageState, ComplexPlaneState, PlotState, StageLayout, StageState, WalkGraphState } from '../schema'
import { BETA_STAR, C_BOND, C_COINS2, C_G8, C_Q, C_TR, C_V, C_W, GAMMA_STAR, V, claim, close, d, tf } from './Q19.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan "Stage shorthand"), as plain builder functions                              */
/* ---------------------------------------------------------------------------------------------- */
const circ = (C: Circuit, upTo: number): CircuitStageState => ({ kind: 'circuit', circuit: C, upTo, shot: 'Q-WIRES' })
const amp = (C: Circuit, upTo: number, mode: AmplitudesState['mode']): AmplitudesState => ({ kind: 'amplitudes', state: { circuit: C, upTo }, mode, shot: 'A-BARS' })
const cp = (s: Omit<ComplexPlaneState, 'kind' | 'shot'>): ComplexPlaneState => ({ kind: 'complex-plane', shot: 'C-FLAT', ...s })
const spokes = (phasesDeg: number[]): Pick<ComplexPlaneState, 'spokes'> => ({ spokes: { phasesDeg } })
/** The walk graph: a star (N spokes; marked spoke or extra edge) or a ring; `walker` and the rest as in WalkGraphState. */
const wg = (graph: WalkGraphState['graph'], extra: Partial<Omit<WalkGraphState, 'kind' | 'graph' | 'shot'>> = {}): WalkGraphState => ({
  kind: 'walk-graph',
  graph,
  shot: 'star' in graph ? 'WG-STAR' : 'WG-RING',
  ...extra,
})
const plot = (curve: PlotState['curve'], markers: number[] = [], extra: Partial<Omit<PlotState, 'kind' | 'curve' | 'markers'>> = {}): PlotState => ({
  kind: 'plot',
  curve,
  markers: markers.map((x) => ({ x })),
  shot: 'P-CURVE',
  ...extra,
})
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })
const STAR8 = { star: { N: 8 } }
const STAR8M = { star: { N: 8, marked: 1 } }
const STAR8X = { star: { N: 8, extra: [1, 2] as [number, number] } }
const RING4 = { ring: { n: 4 } }
/** Chapter Q19's four eigen-arrows of the 8-spoke star: ±α and 180° ± α (the angles are the engine's, in degrees). */
const ALPHA = V.q19Alpha8
const FOUR_ARROWS = (): ComplexPlaneState => cp(spokes([ALPHA, -ALPHA, 180 - ALPHA, 180 + ALPHA]))
/** The squares of the roots: ±2α. */
const SQUARES = (): ComplexPlaneState => cp(spokes([2 * ALPHA, -2 * ALPHA]))
const PW8 = (markers: number[] = [4]): PlotState => plot({ fn: 'starWalkMarked8', x: { from: 0, to: 10 }, samples: 11 }, markers)
const PX64 = (markers: number[] = [], vs = false): PlotState => plot({ fn: 'extraWalk64', ...(vs ? { vs: 'extraWalk64Plus' as const } : {}), x: { from: 0, to: 40 } }, markers)
const TE1 = (markers: number[] = []): PlotState => plot({ fn: 'trotterErr1', x: { from: 1, to: 32 } }, markers, { xScale: 'log', yScale: 'log' })
const TE = (markers: number[] = []): PlotState => plot({ fn: 'trotterErr1', vs: 'trotterErr2', x: { from: 1, to: 32 } }, markers, { xScale: 'log', yScale: 'log' })

/* ---------------------------------------------------------------------------------------------- */
/* q19-random-walk — A walker that flips a coin                                                      */
/* ---------------------------------------------------------------------------------------------- */

const randomWalk: Beat[] = [
  {
    id: 'q19-random-walk:b1',
    phase: 'books',
    text:
      `A walker stands at 0 and flips a fair coin. Heads: one step right. Tails: one step left. ` +
      `After two steps the chances are $${d(V.q19P2Left, 2)}$ at $-2$, $${d(V.q19P2Mid, 1)}$ at $0$ and $${d(V.q19P2Left, 2)}$ at $2$ (<<qc-f5-probability|Unit F5.1>>). This is a [[qc-random-walk|random walk]].`,
    formal:
      `A [[qc-random-walk|random walk]] on the integers (Bergou §7.6, p. 130): $p(x;n) = \\binom{n}{(n+x)/2}2^{-n}$ is the chance of position $x$ after $n$ unbiased steps. ` +
      `For $n = 2$: $p(\\pm2;2) = ${tf(V.q19P2Left)}$ and $p(0;2) = ${tf(V.q19P2Mid)}$.`,
    caption: 'two coins: four equal chances, at positions −2, 0, 0 and 2',
    captionFormal: `$H^{\\otimes2}$ then reading: chance $${tf(V.q19P2Left)}$ per string, position $2k - 2$ for $k$ ones`,
    stage: amp(C_COINS2, 1, 'probability'),
    claims: [
      claim('q19P2Left', 'after two steps the walker is at $-2$ (and at $2$) with chance $0.25$', () => close(V.q19P2Left, 0.25, 1e-9)),
      claim('q19P2Mid', 'and at $0$ with chance $0.5$', () => close(V.q19P2Mid, 0.5, 1e-9)),
    ],
  },
  {
    id: 'q19-random-walk:b2',
    phase: 'books',
    text:
      `After ten steps the walker is back at 0 with chance $${d(V.q19P10Zero, 4)}$. After a hundred steps its typical distance from 0 is $${d(V.q19SigmaClass100, 0)}$, the square root of 100. ` +
      `The walker wanders slowly.`,
    formal:
      `$p(0;10) = 252/1024 = ${d(V.q19P10Zero, 4)}$. The spread is $\\sigma(n) = \\sqrt n$, since the variances of $n$ independent $\\pm1$ steps add; the engine sums the exact $p(x;100)$ and finds $${d(V.q19SigmaClass100, 0)}$.`,
    caption: 'typical distance against steps: the square-root curve, 10 at 100 steps',
    captionFormal: 'the spread $\\sigma(n) = \\sqrt n$ against $n$: 10 at $n = 100$',
    stage: plot({ fn: 'randomWalkSigma', x: { from: 0, to: 100 } }, [100]),
    claims: [
      claim('q19P10Zero', 'after ten steps the chance of being back at 0 is $0.2461$', () => close(V.q19P10Zero, 252 / 1024, 1e-12)),
      claim('q19SigmaClass100', 'after a hundred steps the typical distance is $10$', () => close(V.q19SigmaClass100, 10, 1e-9)),
    ],
  },
  {
    id: 'q19-random-walk:b3',
    phase: 'books',
    text:
      `A [[qc-graph|graph]] is dots (vertices) joined by lines (edges). To ask whether a path joins $u$ to $v$, walk randomly from $u$ for $2N^3$ steps. ` +
      `If a path exists, one walk misses $v$ with chance below $\\tfrac12$. So $m$ walks in a row all miss with chance below $2^{-m}$. ` +
      `For $N = 10$ dots that is $${d(V.q19ConnSteps10, 0)}$ steps a walk, and five walks all miss with chance below $${d(V.q19ConnFail5, 3)}$.`,
    formal:
      `A [[qc-graph|graph]] $G = (V, E)$ on $N$ vertices; each step moves to a uniformly chosen neighbour. If a path joins $u$ and $v$, a walk of $2N^3$ steps misses $v$ with probability below $\\tfrac12$ (Bergou p. 131), ` +
      `so $m$ independent walks all miss with probability below $2^{-m}$. For $N = 10$ that is $${d(V.q19ConnSteps10, 0)}$ steps per walk and, for $m = 5$, an error below $${d(V.q19ConnFail5, 3)}$.`,
    caption: 'a star graph: a centre with eight spokes',
    captionFormal: 'the star graph used from Unit 19.2 on: a centre joined to eight outer vertices (Bergou’s Fig. 7.7)',
    stage: wg(STAR8),
    claims: [
      claim('q19ConnSteps10', 'for $N = 10$ the path test walks $2N^3 = 2000$ steps', () => V.q19ConnSteps10 === 2 * 10 ** 3),
      claim('q19ConnFail5', 'five walks all miss with chance below $2^{-5} = 0.031$', () => close(V.q19ConnFail5, 1 / 32, 1e-12)),
    ],
  },
  {
    id: 'q19-random-walk:b4',
    phase: 'clue',
    text: 'On a path of ten dots, the walker starts at one end. About how many steps to reach the other end?',
    formal: 'On a path of $N = 10$ vertices, reflecting at the start, what is the mean number of steps to reach the far end? Compare with $2N^3$.',
    caption: 'the walk lives on a graph; the star of this chapter is drawn for scale, while the question is about a path of ten dots',
    captionFormal: 'any graph on $N$ vertices: the bound $2N^3$ must hold for all of them',
    stage: wg(STAR8),
    reveal: {
      text: `On average ${d(V.q19PathHit10, 0)} steps, the square of nine. The bound of ${d(V.q19ConnSteps10, 0)} is generous because it must hold for every graph.`,
      formal:
        `$E_k = 1 + (E_{k-1} + E_{k+1})/2$ with $E_0 = 1 + E_1$ and $E_{N-1} = 0$ gives $E_0 = (N-1)^2 = ${d(V.q19PathHit10, 0)}$, far below $2N^3 = ${d(V.q19ConnSteps10, 0)}$ (our calculation; the book states the bound only).`,
      caption: 'n² against the steps n: height 81 at 9, the nine gaps of the path',
      captionFormal: 'the curve $n^2$: height 81 at $n = 9 = N - 1$',
      stage: plot({ fn: 'nSquared', x: { from: 0, to: 12 } }, [9]),
      claims: [claim('q19PathHit10', 'the mean number of steps along a path of ten dots is $81$', () => close(V.q19PathHit10, 81, 1e-9))],
    },
  },
  {
    id: 'q19-random-walk:b5',
    phase: 'deeper',
    text:
      `This beat goes beyond the book. Give the walker a quantum coin: a Hadamard on the coin, then a step by its state. Paths now interfere. ` +
      `After 100 steps the typical distance is $${d(V.q19CoinSigma100, 1)}$, not 10. After three steps nothing yet differs.`,
    formal:
      `This goes beyond the book (neither Bergou nor N&C treats it). For the Hadamard coin and the symmetric start $(|0\\rangle + i|1\\rangle)/\\sqrt2$ the spread is $\\sigma(10) = ${d(V.q19CoinSigma10, 2)}$ and $\\sigma(100) = ${d(V.q19CoinSigma100, 2)}$, ` +
      `against $\\sqrt{10}$ and $10$ for the fair coin, and $\\sigma(n)/n \\to ${d(V.q19CoinRatio100, 4)}$, a linear spread. After three steps the chances equal the classical $${tf(V.q19P3Edge)}, ${tf(V.q19P3Mid)}, ${tf(V.q19P3Mid)}, ${tf(V.q19P3Edge)}$ (engine gap $${d(V.q19Coin3Binomial, 0)}$). ` +
      `Two routes agree: a step-by-step simulation and a Fourier-space integral.`,
    caption: 'quantum spread against the square-root curve',
    captionFormal: 'the coined spread $\\sigma(n)$ (linear) against $\\sqrt n$, both to $n = 100$',
    stage: plot({ fn: 'coinWalkSigma', vs: 'randomWalkSigma', x: { from: 0, to: 100 } }, [100]),
    claims: [
      claim('q19CoinSigma10', 'the coined spread after ten steps is $5.473$', () => close(V.q19CoinSigma10, 5.473, 5e-4)),
      claim('q19CoinSigma100', 'after a hundred steps it is $54.12$', () => close(V.q19CoinSigma100, 54.12, 5e-3)),
      claim('q19CoinRatio100', 'so $\\sigma(100)/100 = 0.5412$', () => close(V.q19CoinRatio100, 0.5412, 5e-5)),
      claim('q19Coin3Binomial', 'after three steps the coined chances equal the classical ones', () => close(V.q19Coin3Binomial, 0, 1e-12)),
      claim('q19P3Edge', 'the classical chance of an end place after three steps is $\\tfrac18$', () => close(V.q19P3Edge, 1 / 8, 1e-12)),
      claim('q19P3Mid', 'and of a middle place $\\tfrac38$', () => close(V.q19P3Mid, 3 / 8, 1e-12)),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q19-scatter — A particle that lives on the edges                                                  */
/* ---------------------------------------------------------------------------------------------- */

const scatter: Beat[] = [
  {
    id: 'q19-scatter:b1',
    phase: 'books',
    introduces: ['qc-edge-state'],
    text:
      `A quantum walker has no single position. Its [[qc-edge-state|edge state]] says which edge it is on and which way it moves. ` +
      `The [[qc-star-graph|star graph]] with 8 spokes has $${d(V.q19EdgeStates8, 0)}$ such states: 8 leaving the centre and 8 arriving.`,
    formal:
      `In the [[qc-scattering-walk|scattering walk]] (Bergou p. 131) each edge $\\{v_1, v_2\\}$ carries two [[qc-orthogonal|orthogonal]] states, [[qc-edge-state|$|v_1, v_2\\rangle$]] (moving from $v_1$ to $v_2$) and $|v_2, v_1\\rangle$. ` +
      `All of them form an [[qc-orthonormal-basis|orthonormal basis]], so $E$ edges give dimension $2E$: $${d(V.q19EdgeStates8, 0)}$ for the [[qc-star-graph|star graph]] with $N = 8$ (Fig. 7.7). ` +
      `Bergou’s $N$ counts the outer vertices here but the vertices of a whole graph in §7.8; in this chapter $N$ is always the number of spokes and $n$ a vertex’s degree or a ring’s size.`,
    caption: '16 bars, one per edge state: first bit 0 = leaving the centre, 1 = arriving; last three bits = spoke number minus 1',
    captionFormal: 'the start $\\tfrac{1}{\\sqrt N}\\sum_j|0,j\\rangle$ (Eq. 7.49) on the 16 edge states: first wire the direction, three wires the spoke',
    stage: split(wg(STAR8M, { walker: { step: 0 } }), amp(C_W(1), 1, 'probability')),
    fidelity: ['qc-walk-graph-layout'],
    claims: [claim('q19EdgeStates8', 'the star with 8 spokes has $16$ edge states', () => V.q19EdgeStates8 === 16)],
  },
  {
    id: 'q19-scatter:b2',
    phase: 'books',
    text:
      `At a vertex, arriving edge states turn into leaving ones, and every edge is treated alike. ` +
      `A walker arriving along edge $j$ goes back along it with amplitude $-r$ or onto each other edge with amplitude $t$.`,
    formal:
      `A local unitary $U_v$ maps the arriving states to the leaving ones, the same way for each of the $n$ edges at $v$: $U_v|j,v\\rangle = -r|v,j\\rangle + t\\sum_{k\\ne j}|v,k\\rangle$ (Eq. 7.45). ` +
      `The walk step $U$ is the combined action of all the $U_v$. The numbers $r$ and $t$ are fixed by unitarity (next beat; <<qc-f4-unitary|Unit F4.4>>).`,
    caption: 'a vertex: one arrival, a bounce −r and transmissions t',
    captionFormal: 'a vertex of degree $n$: arrival $j$ goes to $-r$ on itself and $t$ on each of the other $n - 1$',
    stage: wg(STAR8),
  },
  {
    id: 'q19-scatter:b3',
    phase: 'books',
    text:
      `Total chance stays 1: $r^2 + (n-1)t^2 = 1$. Two different arrivals must leave differently: $-2rt + (n-2)t^2 = 0$. ` +
      `Together they give $r = (n-2)/n$ and $t = 2/n$. For $n = 8$: $r = ${d(V.q19Vertex8R, 2)}$ and $t = ${d(V.q19Vertex8T, 2)}$.`,
    formal:
      `Eq. 7.46 gives $|r|^2 + (n-1)|t|^2 = 1$ and Eq. 7.47 gives $-r^*t - rt^* + (n-2)|t|^2 = 0$. For real $r$ and $t$ the second says $r = (n-2)t/2$ and the first then says $\\tfrac{n^2}{4}t^2 = 1$, ` +
      `so $r = (n-2)/n$ and $t = 2/n$ (Eq. 7.48), and $r + t = 1$. At $n = 8$ the engine finds $${d(V.q19Vertex8R, 2)}$, $${d(V.q19Vertex8T, 2)}$ and a unitarity gap $${d(V.q19VertexUnit8, 0)}$.`,
    caption: `the centre acting on arrival 1: amplitude −${d(V.q19Vertex8R, 2)} on the same spoke, ${d(V.q19Vertex8T, 2)} on each of the other seven`,
    captionFormal: `$U_v$ on the arrival from spoke 1: $-${d(V.q19Vertex8R, 2)}$ on spoke 1 and $${d(V.q19Vertex8T, 2)}$ on each other spoke`,
    stage: split(wg(STAR8), amp(C_V, 1, 'signed')),
    claims: [
      claim('q19Vertex8R', 'at a vertex with 8 edges the bounce has size $r = 0.75$', () => close(V.q19Vertex8R, 0.75, 1e-9)),
      claim('q19Vertex8T', 'and each transmission $t = 0.25$', () => close(V.q19Vertex8T, 0.25, 1e-9)),
      claim('q19VertexUnit8', 'the 8-edge vertex table is unitary', () => close(V.q19VertexUnit8, 0, 1e-12)),
    ],
    derivation: {
      result: 't = \\tfrac2n,\\ r = \\tfrac{n-2}{n}',
      ground: [
        {
          tex: 'r^2 + (n-1)t^2 = 1',
          why: 'An arrival keeps its total chance: the bounce and the $n-1$ other exits share it.',
          view: wg(STAR8),
          viewCaption: 'the star: one arrival, seven exits',
        },
        {
          tex: '-2rt + (n-2)t^2 = 0 \\ \\Rightarrow\\ r = \\tfrac{n-2}{2}\\,t',
          why: 'Two different arrivals must leave apart, so their outputs have no overlap; this ties $r$ to $t$.',
          view: amp(C_V, 1, 'signed'),
          viewCaption: 'the centre’s output: −0.75 and seven times 0.25',
        },
        {
          tex: '\\tfrac{n^2}{4}t^2 = 1 \\ \\Rightarrow\\ t = \\tfrac2n,\\ r = \\tfrac{n-2}{n}',
          why: 'Put $r$ into the first equation: $t$ comes out, and then $r$.',
        },
      ],
      formal: [
        {
          tex: '|r|^2 + (n-1)|t|^2 = 1,\\quad -r^*t - rt^* + (n-2)|t|^2 = 0',
          why: 'Unitarity: the rows of $U_v$ have length 1 and different rows are orthogonal (Eqs. 7.46–7.47).',
          view: wg(STAR8),
          viewCaption: 'one arrival, seven exits',
        },
        {
          tex: 'r = \\tfrac{n-2}{2}\\,t,\\ \\tfrac{n^2}{4}t^2 = 1 \\ \\Rightarrow\\ t = \\tfrac2n,\\ r = \\tfrac{n-2}{n}',
          why: 'For real $r$ and $t$ the two equations solve at once (Eq. 7.48).',
          view: amp(C_V, 1, 'signed'),
          viewCaption: 'the centre’s output: −0.75 and seven times 0.25',
        },
      ],
    },
  },
  {
    id: 'q19-scatter:b4',
    phase: 'books',
    text:
      `As a table, $U_v$ has $-r$ on the diagonal and $t$ elsewhere. That is [[qc-inversion-about-mean|reflect about the mean]] from Chapter Q17: each amplitude becomes twice the average minus itself. ` +
      `A marked outer vertex also flips a sign. Chapter Q17’s circuit does the same two moves.`,
    formal:
      `For $n = 8$, $U_v = 2|s\\rangle\\langle s| - I$ with $|s\\rangle$ the uniform state (engine gap $${d(V.q19VertexIsInv8, 0)}$): the [[qc-inversion-about-mean|inversion about the mean]] of Chapter Q17. ` +
      `An outer vertex has $n = 1$ and reflects ($-r = +1$); the marked one reflects with a $-1$, a phase oracle. Chapter Q17’s step on three wires is the same oracle and mirror.`,
    caption: `one oracle and one mirror about the mean: the marked bar ends at size ${d(V.q19Grover8Marked, 3)}, the seven others at ${d(V.q19Grover8Other, 3)}`,
    captionFormal: `$H^{\\otimes3}$, the oracle, the mirror: amplitudes ${d(V.q19Grover8Marked, 3)} on the marked string and ${d(V.q19Grover8Other, 3)} on each of the others`,
    stage: split(circ(C_G8, 5), amp(C_G8, 5, 'signed')),
    claims: [
      claim('q19VertexIsInv8', 'the 8-edge vertex table equals twice the uniform projector minus the identity', () => close(V.q19VertexIsInv8, 0, 1e-12)),
      claim('q19Grover8Marked', 'after one oracle and one mirror the marked bar has size $0.8839$', () => close(V.q19Grover8Marked, 0.8839, 5e-5)),
      claim('q19Grover8Other', 'and each of the seven others $0.1768$', () => close(V.q19Grover8Other, 0.1768, 5e-5)),
    ],
  },
  {
    id: 'q19-scatter:b5',
    phase: 'clue',
    text: 'What does the rule do at a vertex with only one edge? And at a vertex with exactly two?',
    formal: 'Evaluate $-r$ and $t$ for $n = 1$ and $n = 2$ and interpret.',
    caption: 'a dead end and a straight line',
    captionFormal: 'degree 1 and degree 2 in the same table $-r = (2 - n)/n$, $t = 2/n$',
    stage: wg(STAR8),
    reveal: {
      text: 'One edge: $-r = +1$, so the walker is turned back, as at a wall. Two edges: $r = 0$ and $t = 1$, so it passes straight through, like a wire.',
      formal: '$n = 1$: $-r = +1$, total reflection with no transmission term. $n = 2$: $r = 0$ and $t = 1$, perfect transmission. The rule interpolates between a wall and a wire.',
      caption: 'the walker meets a wall (one edge) or runs along a wire (two edges)',
      captionFormal: '$n = 1$: reflection with phase $+1$; $n = 2$: transmission with $r = 0$',
      stage: wg(STAR8),
      claims: [
        claim('q19Vertex1', 'with one edge the bounce amplitude $-r$ is $+1$', () => V.q19Vertex1 === 1),
        claim('q19Vertex2R', 'with two edges $r = 0$', () => close(V.q19Vertex2R, 0, 1e-12)),
        claim('q19Vertex2T', 'and $t = 1$', () => close(V.q19Vertex2T, 1, 1e-12)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q19-star-search — Finding the marked spoke                                                        */
/* ---------------------------------------------------------------------------------------------- */

const starSearch: Beat[] = [
  {
    id: 'q19-star-search:b1',
    phase: 'books',
    text:
      `Start the walker on all 8 outgoing edges equally. One step does two things at once. ` +
      `Walkers heading out reach an outer vertex and turn back, and the marked one flips sign. Walkers heading in meet the centre and scatter.`,
    formal:
      `The start is $|\\psi_{\\mathrm{init}}\\rangle = \\tfrac{1}{\\sqrt N}\\sum_j|0,j\\rangle$ (Eq. 7.49). Then $U|0,j\\rangle = |j,0\\rangle$ for $j \\ge 2$, $U|0,1\\rangle = -|1,0\\rangle$, and $U_v$ acts at the centre. ` +
      `On four wires $U = X_{\\mathrm{dir}}\\,(|0\\rangle\\langle0|\\otimes O + |1\\rangle\\langle1|\\otimes D)$, with $O$ the sign flip of spoke 1 and $D = U_v$: a $16\\times16$ matrix. ` +
      `Built vertex by vertex and as a circuit, the engine finds a gap $${d(V.q19WalkCircuitGap, 0)}$.`,
    caption: 'the start (Hadamards on the three spoke wires) and four steps W',
    captionFormal: '$W = U$ on four wires; the bars are chances of the 16 edge states',
    stage: split(circ(C_W(4), 5), amp(C_W(4), 5, 'probability')),
    claims: [
      claim('q19WalkUnit8', 'the 16-by-16 walk step is orthogonal', () => close(V.q19WalkUnit8, 0, 1e-12)),
      claim('q19WalkCircuitGap', 'and the circuit form equals the vertex-by-vertex step', () => close(V.q19WalkCircuitGap, 0, 1e-12)),
    ],
  },
  {
    id: 'q19-star-search:b2',
    phase: 'books',
    text:
      `By symmetry the walker stays inside four combined states, an [[qc-invariant-subspace|invariant subspace]]. Two are the marked edge, leaving or arriving. ` +
      `Two are the seven other spokes, each as an equal mix. One step is then a $4\\times4$ table.`,
    formal:
      `The states $|\\psi_1\\rangle = |0,1\\rangle$, $|\\psi_2\\rangle = |1,0\\rangle$, and $|\\psi_3\\rangle$, $|\\psi_4\\rangle$, the uniform sums of $|0,j\\rangle$ and of $|j,0\\rangle$ over $j \\ge 2$, span an [[qc-invariant-subspace|invariant subspace]] of $U$ (Eqs. 7.50–7.53). ` +
      `On it $U$ has the matrix $M$ with $M_{jk} = \\langle\\psi_j|U|\\psi_k\\rangle$, and the start is $|\\psi_{\\mathrm{init}}\\rangle = \\tfrac{1}{\\sqrt N}|\\psi_1\\rangle + \\sqrt{(N-1)/N}\\,|\\psi_3\\rangle$ (Eq. 7.52). ` +
      `At $N = 8$ the table holds $r = ${d(V.q19MR, 2)}$ and $t\\sqrt{N-1} = ${d(V.q19MT, 4)}$, and the engine finds a gap $${d(V.q19MGap, 0)}$ to the full matrix.`,
    caption: `after two steps: the marked bar at ${d(V.q19StarP2, 3)}, the seven others at ${d(V.q19StarP2Other, 3)} each; the four combined states stay closed`,
    captionFormal: `after two steps: chance $${d(V.q19StarP2, 3)}$ on $|0,1\\rangle$ and $${d(V.q19StarP2Other, 3)}$ on each $|0,j\\rangle$, $j \\ge 2$; the span of $\\psi_1\\ldots\\psi_4$ is closed`,
    stage: amp(C_W(4), 3, 'probability'),
    claims: [
      claim('q19MGap', 'the 4-by-4 table equals the full step on the four combined states', () => close(V.q19MGap, 0, 1e-12)),
      claim('q19MR', 'at $N = 8$ the table holds $r = 0.75$', () => close(V.q19MR, 0.75, 1e-9)),
      claim('q19MT', 'and $t\\sqrt{N-1} = 0.6614$', () => close(V.q19MT, Math.sqrt(7) / 4, 1e-9)),
      claim('q19StarP2', 'after two steps the marked spoke has chance $0.781$', () => close(V.q19StarP2, 0.78125, 1e-9)),
      claim('q19StarP2Other', 'and each other spoke $0.031$', () => close(V.q19StarP2Other, 0.03125, 1e-9)),
    ],
  },
  {
    id: 'q19-star-search:b3',
    phase: 'books',
    text:
      `Its [[eigenvalue|eigenvalues]] solve $\\lambda^4 - 2r\\lambda^2 + 1 = 0$. The four roots are arrows on the unit circle at $\\pm\\alpha$ and $180° \\pm \\alpha$, where $\\sin\\alpha = 1/\\sqrt N$. ` +
      `For $N = 8$ the angle $\\alpha$ is ${d(V.q19Alpha8, 1)}°: Grover’s angle from Chapter Q17.`,
    formal:
      `The characteristic equation (Eq. 7.54) is $\\lambda^4 - 2r\\lambda^2 + 1 = 0$, so $\\lambda^2 = e^{\\pm i\\theta}$ with $\\cos\\theta = r = 1 - 2/N$, and $\\lambda = \\pm e^{\\pm i\\alpha}$ with $\\sin^2\\alpha = 1/N$ exactly, Chapter Q17’s $\\alpha$. ` +
      `Bergou’s large-$N$ expansion (Eqs. 7.55–7.58) gives $\\pm(1 \\pm i\\Delta)$ with $\\Delta = \\sqrt{t/2} = 1/\\sqrt N$: ${d(V.q19Delta8Deg, 2)}° against our exact ${d(V.q19Alpha8, 2)}° at $N = 8$.`,
    caption: `four eigen-arrows at ±${d(V.q19Alpha8, 1)}° and 180° ± ${d(V.q19Alpha8, 1)}°`,
    captionFormal: `the roots $\\pm e^{\\pm i\\alpha}$ for $N = 8$: angles ±${d(V.q19Alpha8, 1)}° and 180° ± ${d(V.q19Alpha8, 1)}°`,
    stage: FOUR_ARROWS(),
    claims: [
      claim('q19Alpha8', 'for $N = 8$ the exact angle is $\\alpha = 20.705°$', () => close(V.q19Alpha8, 20.705, 5e-4) && close(Math.sin(V.q19Alpha8 * (Math.PI / 180)) ** 2, 1 / 8, 1e-12)),
      claim('q19Delta8Deg', 'and Bergou’s large-$N$ value is $20.257°$', () => close(V.q19Delta8Deg, 20.257, 5e-4)),
      claim('q19CharPoly8', 'the characteristic polynomial of the 4-by-4 table is $\\lambda^4 - 2r\\lambda^2 + 1$', () => close(V.q19CharPoly8, 0, 1e-12)),
      claim('q19EigenGap8', 'and its eigenvalues are $\\pm e^{\\pm i\\alpha}$', () => close(V.q19EigenGap8, 0, 1e-12)),
    ],
    derivation: {
      result: '\\lambda = \\pm e^{\\pm i\\alpha},\\ \\sin^2\\alpha = \\tfrac1N',
      ground: [
        {
          tex: '\\mu^2 - 2r\\mu + 1 = 0,\\quad \\mu = \\lambda^2',
          why: 'Call $\\mu = \\lambda^2$: the equation becomes a quadratic in $\\mu$.',
          view: SQUARES(),
          viewCaption: 'the squares of the roots, ±41.4°',
        },
        {
          tex: '\\mu = r \\pm i\\sqrt{1 - r^2} = e^{\\pm i\\theta},\\quad \\cos\\theta = r',
          why: 'Its two roots sit on the unit circle, at the angles $\\pm\\theta$.',
        },
        {
          tex: '\\sin^2\\tfrac\\theta2 = \\tfrac{1-r}{2} = \\tfrac1N \\ \\Rightarrow\\ \\lambda = \\pm e^{\\pm i\\alpha},\\ \\sin^2\\alpha = \\tfrac1N',
          why: 'Half the angle is $\\alpha$, so $\\lambda$ has the four angles $\\pm\\alpha$ and $180° \\pm \\alpha$.',
          view: FOUR_ARROWS(),
          viewCaption: 'the four roots, ±20.7° and 180° ± 20.7°',
        },
      ],
      formal: [
        {
          tex: '\\lambda^2 = e^{\\pm i\\theta},\\quad \\cos\\theta = r = 1 - \\tfrac2N',
          why: 'The quartic is a quadratic in $\\lambda^2$, with its roots on the unit circle.',
          view: SQUARES(),
          viewCaption: 'the squares of the roots, ±41.4°',
        },
        {
          tex: '\\sin^2\\tfrac\\theta2 = \\tfrac{1-r}{2} = \\tfrac1N \\ \\Rightarrow\\ \\lambda = \\pm e^{\\pm i\\alpha},\\ \\sin^2\\alpha = \\tfrac1N',
          why: 'Half the angle is $\\alpha$.',
          view: FOUR_ARROWS(),
          viewCaption: 'the four roots, ±20.7° and 180° ± 20.7°',
        },
      ],
    },
  },
  {
    id: 'q19-star-search:b4',
    phase: 'books',
    text:
      `Let $\\Delta = 1/\\sqrt N$, a slightly rough value of $\\alpha$. The marked spoke’s chance follows a squared sine and peaks near $n\\Delta = \\pi/2$, here $n = ${d(V.q19Bergou8, 2)}$. ` +
      `At $n = 4$ it is $${d(V.q19StarP4, 4)}$, as in two Grover steps. At $n = 2$ it is $${d(V.q19StarP2, 3)}$.`,
    formal:
      `Eqs. 7.62–7.63: $U^n|\\psi_{\\mathrm{init}}\\rangle$ has weight $\\sin^2(n\\Delta)$ on spoke 1, as $|0,1\\rangle$ for even $n$ or $-|1,0\\rangle$ for odd $n$, with amplitudes $\\pm${d(Math.abs(V.q19StarAmp4), 4)}$ at $n = 4, 5$. ` +
      `Our calculation finds exactly $P_{\\mathrm{walk}}(n) = \\sin^2((2\\lfloor n/2\\rfloor + 1)\\alpha)$, Chapter Q17’s chance after $\\lfloor n/2\\rfloor$ Grover steps (gap $${d(V.q19WalkIsGrover, 0)}$ for $N = 4, 8, 16$ and $n \\le 30$).`,
    caption: `chance of the marked spoke against steps to step 10, N = 8: pairs of equal values, first peak ${d(V.q19StarP4, 3)} at 4 and 5`,
    captionFormal: `$P_{\\mathrm{walk}}(n)$ for $N = 8$, $n \\le 10$: equal pairs at $n = 2k, 2k + 1$, first peak $${d(V.q19StarP4, 3)}$ at $n = 4, 5$; the graph shows step 4`,
    stage: split(PW8([4]), wg(STAR8M, { walker: { step: 4 } })),
    fidelity: ['qc-walk-graph-width'],
    claims: [
      claim('q19StarP2', 'at $n = 2$ the marked spoke has chance $0.781$', () => close(V.q19StarP2, 0.78125, 1e-9)),
      claim('q19StarP4', 'at $n = 4$ it has $0.9453$', () => close(V.q19StarP4, 0.9453, 5e-5) && close(V.q19StarP4, Math.sin(5 * Math.asin(1 / Math.sqrt(8))) ** 2, 1e-12)),
      claim('q19StarAmp4', 'the amplitude on $|0,1\\rangle$ at $n = 4$ is $+0.9723$', () => close(V.q19StarAmp4, 0.9723, 5e-5)),
      claim('q19StarAmp5', 'and on $|1,0\\rangle$ at $n = 5$ it is $-0.9723$', () => close(V.q19StarAmp5, -0.9723, 5e-5)),
      claim('q19StarPeak8', 'the first peak for $N = 8$ is at $n = 4$', () => V.q19StarPeak8 === 4),
      claim('q19Bergou8', 'and $\\pi/(2\\Delta) = 4.44$', () => close(V.q19Bergou8, 4.443, 5e-4)),
      claim('q19WalkIsGrover', 'the walk equals Grover’s search at every step pair', () => close(V.q19WalkIsGrover, 0, 1e-12)),
    ],
    derivation: {
      result: 'n \\approx \\tfrac\\pi2\\sqrt N',
      ground: [
        {
          tex: 'P(n) = \\sin^2(n\\Delta)',
          why: 'The marked spoke’s weight after $n$ steps is $\\sin^2(n\\Delta)$ (Eq. 7.63).',
          view: PW8([4]),
          viewCaption: 'chance of the marked spoke against steps',
        },
        {
          tex: '\\sin^2(n\\Delta)\\ \\text{is largest at}\\ n\\Delta = \\tfrac\\pi2',
          why: 'A sine squared is largest when its angle is a quarter turn.',
          view: wg(STAR8M, { walker: { step: 4 } }),
          viewCaption: 'the walker on the marked edge at step 4',
        },
        {
          tex: '\\Delta = \\tfrac{1}{\\sqrt N},\\ n\\Delta \\approx \\tfrac\\pi2 \\ \\Rightarrow\\ n \\approx \\tfrac\\pi2\\sqrt N',
          why: 'Put in $\\Delta = 1/\\sqrt N$: the number of steps grows like the square root of $N$.',
        },
      ],
      formal: [
        {
          tex: 'P(n) = \\sin^2(n\\Delta)',
          why: 'Eqs. 7.62–7.63 give this weight on spoke 1.',
          view: PW8([4]),
          viewCaption: 'chance of the marked spoke against steps',
        },
        {
          tex: 'n\\Delta \\approx \\tfrac\\pi2,\\ \\Delta = \\tfrac{1}{\\sqrt N} \\ \\Rightarrow\\ n \\approx \\tfrac\\pi2\\sqrt N',
          why: 'The weight is largest at a quarter turn of the sine.',
          view: wg(STAR8M, { walker: { step: 4 } }),
          viewCaption: 'the walker on the marked edge at step 4',
        },
      ],
    },
  },
  {
    id: 'q19-star-search:b5',
    phase: 'clue',
    text: 'A star has 1024 spokes. About how many steps find the marked one? Classically you check about 512.',
    formal: 'Estimate $n$ from $n\\Delta \\approx \\pi/2$ at $N = 1024$, then locate the first peak with the reduced walk, and compare with $(N+1)/2$ classical checks.',
    caption: 'N = 16 for scale: first peak at 6 steps',
    captionFormal: `$N = 16$ for scale: first peak at $n = ${V.q19StarPeak16}$`,
    stage: wg({ star: { N: 16, marked: 1 } }, { walker: { step: 6 } }),
    reveal: {
      text:
        `About 50 steps: $\\tfrac\\pi2 \\times 32 = ${d(V.q19Bergou1024, 1)}$. The chance is then $${d(V.q19StarP1024, 4)}$. ` +
        `A classical search averages ${d(V.q19ClassAvg1024, 1)} checks, so the walk gives a square-root speed-up. It is the same speed-up as Grover’s search, not a further one. At $N = 16$ the peak is at step ${V.q19StarPeak16}.`,
      formal:
        `$n \\approx \\tfrac\\pi2\\sqrt N = ${d(V.q19Bergou1024, 2)}$. The reduced $4\\times4$ walk, which equals the full walk where both can be run, peaks first at $n = ${V.q19StarN1024}$ with ${d(V.q19StarP1024, 4)}, ` +
        `against $(N+1)/2 = ${d(V.q19ClassAvg1024, 1)}$ classical checks (our arithmetic; Bergou p. 135 gives $O(N)$). This is the speed-up of Grover’s search, not a further one. At $N = 16$ the first peak is at $n = ${V.q19StarPeak16}$ with chance $${d(V.q19StarP16, 4)}$.`,
      caption: 'the walk at N = 16, step 6: the marked spoke carries almost all the chance',
      captionFormal: `$N = 16$, $n = ${V.q19StarPeak16}$: chance $${d(V.q19StarP16, 4)}$ on spoke 1`,
      stage: wg({ star: { N: 16, marked: 1 } }, { walker: { step: 6 } }),
      claims: [
        claim('q19StarN1024', 'for 1024 spokes the first peak is at step $50$', () => V.q19StarN1024 === 50),
        claim('q19StarP1024', 'with chance $0.9995$', () => close(V.q19StarP1024, 0.9995, 5e-5)),
        claim('q19Bergou1024', 'and $\\tfrac\\pi2\\sqrt N = 50.27$', () => close(V.q19Bergou1024, 50.265, 5e-4)),
        claim('q19ClassAvg1024', 'a classical search averages $512.5$ checks', () => close(V.q19ClassAvg1024, 512.5, 1e-9)),
        claim('q19StarPeak16', 'for 16 spokes the first peak is at step $6$', () => V.q19StarPeak16 === 6),
        claim('q19StarP16', 'with chance $0.9613$', () => close(V.q19StarP16, 0.9613, 5e-5)),
      ],
    },
  },
  {
    id: 'q19-star-search:b6',
    phase: 'deeper',
    text:
      `Start instead with the walker on all eight arriving edges. The search still works, with the same best chance, $${d(V.q19InStart8, 4)}$, but one step later: at step ${V.q19InStartStep}, not 4. ` +
      `At step 4 the chance is only $${d(V.q19InStart4, 3)}$. In Unit 19.4 this choice will matter.`,
    formal:
      `Starting in an equal [[qc-superposition|superposition]] of the ingoing states works as well as the outgoing start (Bergou p. 137, in the remark before the extra-edge search). ` +
      `At $N = 8$ the engine finds the same maximum $${d(V.q19InStart8, 4)}$, reached at step ${V.q19InStartStep} instead of 4; at step 4 the chance is $${d(V.q19InStart4, 3)}$.`,
    caption: 'the arriving start at step 5: the chance has reached its peak one step later than before',
    captionFormal: `the walker started on the arriving edges, step ${V.q19InStartStep}: the maximum $${d(V.q19InStart8, 4)}$ comes one step later`,
    stage: wg(STAR8M, { walker: { step: V.q19InStartStep, start: 'in' } }),
    fidelity: ['qc-walk-graph-width'],
    claims: [
      claim('q19InStart8', 'from the arriving start the best chance is again $0.9453$', () => close(V.q19InStart8, 0.9453, 5e-5)),
      claim('q19InStartStep', 'reached at step $5$', () => V.q19InStartStep === 5),
      claim('q19InStart4', 'while at step 4 it is $0.781$', () => close(V.q19InStart4, 0.78125, 1e-9)),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q19-extra-edge — Finding an extra edge                                                            */
/* ---------------------------------------------------------------------------------------------- */

const extraEdge: Beat[] = [
  {
    id: 'q19-extra-edge:b1',
    phase: 'books',
    text:
      `Now no vertex is marked. Instead two outer vertices, 1 and 2, share an extra edge, and we must find it. A vertex with two edges passes the walker straight on (Unit 19.2). ` +
      `With 8 spokes there are $${d(V.q19Extra8Dim, 0)}$ edge states.`,
    formal:
      `Fig. 7.8: the star plus the edge $\\{1,2\\}$ with the extra states $|1,2\\rangle$ and $|2,1\\rangle$, so $2N + 2 = ${d(V.q19Extra8Dim, 0)}$ states at $N = 8$. Now $U|0,1\\rangle = |1,2\\rangle$, $U|0,2\\rangle = |2,1\\rangle$, $U|1,2\\rangle = |2,0\\rangle$ and $U|2,1\\rangle = |1,0\\rangle$ (Eq. 7.64); ` +
      `the other spokes reflect and the centre scatters as before. The engine’s $U$ is orthogonal (gap $${d(V.q19ExtraUnit, 0)}$).`,
    caption: 'the star with an extra edge between spokes 1 and 2: 18 edge states',
    captionFormal: 'Fig. 7.8: the star with the extra edge $\\{1,2\\}$ and its two extra edge states',
    stage: wg(STAR8X, { walker: { step: 0 } }),
    claims: [
      claim('q19Extra8Dim', 'the star with 8 spokes and the extra edge has $18$ edge states', () => V.q19Extra8Dim === 18),
      claim('q19ExtraUnit', 'and its walk step is orthogonal', () => close(V.q19ExtraUnit, 0, 1e-12)),
    ],
  },
  {
    id: 'q19-extra-edge:b2',
    phase: 'books',
    text:
      `Symmetry again keeps the walker in a small space, now five combined states. The start has a minus sign between its leaving and its arriving edges. ` +
      `The eigenvalues near $-1$ split by $\\pm i\\Delta$, with $\\Delta = 2/\\sqrt{3N}$: ${d(V.q19ExtraDelta64, 4)} at $N = 64$.`,
    formal:
      `The span $S$ of $\\psi_1, \\ldots, \\psi_5$ is invariant (Eq. 7.65), with $U$ acting as the table $M$ (Eqs. 7.66–7.68), and its eigenvalues solve $\\lambda^5 - (r-t)\\lambda^3 + (r-t)\\lambda^2 - 1 = 0$ (Eq. 7.69): ` +
      `the root $\\lambda = 1$ and the quartic $\\lambda^4 + \\lambda^3 + 2t\\lambda^2 + \\lambda + 1 = 0$ (Eq. 7.70). As $t \\to 0$ the roots are $-1$ twice and $e^{\\pm i\\pi/3}$ (Eq. 7.71); ` +
      `the double root splits as $-1 \\pm i\\Delta$ with $\\Delta = \\sqrt{2t/3} = 2/\\sqrt{3N}$ (Eqs. 7.72–7.73), ${d(V.q19ExtraDelta64, 4)} at $N = 64$. The engine finds gaps $${d(V.q19M5Gap, 0)}$ to $M$ and $${d(V.q19ExtraPoly, 0)}$ to Eq. 7.69.`,
    caption: 'zero-order roots: −1 as a double root, and the two arrows at 60° and −60° from +1',
    captionFormal: 'the roots at $t = 0$: $-1$ (twice) and $e^{\\pm i\\pi/3}$',
    stage: cp(spokes([60, 180, 300])),
    claims: [
      claim('q19M5Gap', 'the 5-by-5 table equals the full step on the five combined states', () => close(V.q19M5Gap, 0, 1e-12)),
      claim('q19ExtraPoly', 'and its characteristic polynomial is the quintic of the book', () => close(V.q19ExtraPoly, 0, 1e-12)),
      claim('q19ExtraDelta64', 'for 64 spokes $\\Delta = 2/\\sqrt{3N} = 0.1443$', () => close(V.q19ExtraDelta64, 2 / Math.sqrt(3 * 64), 1e-12)),
    ],
  },
  {
    id: 'q19-extra-edge:b3',
    phase: 'books',
    text:
      `At $n\\Delta \\approx \\pi/2$ the weight splits evenly over three combined states: two beside the extra edge and the extra edge itself. We read the spokes only, so we find spoke 1 or 2 with chance $\\tfrac23$. ` +
      `For $N = 64$ the exact peak is ${d(V.q19ExtraNear64, 2)} at step ${V.q19ExtraPeak64}.`,
    formal:
      `Eq. 7.79: in the basis $\\psi_1, \\ldots, \\psi_5$, $U^n|\\psi_{\\mathrm{init}}\\rangle = (-1)^n\\tfrac{1}{\\sqrt3}(\\sin n\\Delta,\\ \\sin n\\Delta,\\ \\tfrac{\\sqrt3}{\\sqrt2}\\cos n\\Delta,\\ -\\tfrac{\\sqrt3}{\\sqrt2}\\cos n\\Delta,\\ -\\sin n\\Delta)$. ` +
      `At $n\\Delta = \\pi/2$ the weights on $\\psi_1$, $\\psi_2$ and $\\psi_5$ are $${tf(V.q19ExtraAsymEdge)}$ each, so a spoke reading finds spoke 1 or 2 with chance $${tf(V.q19ExtraAsym)}$. ` +
      `Engine, $N = 64$: ${d(V.q19ExtraNear64, 4)} at $n = ${V.q19ExtraPeak64}$ ($\\pi/2\\Delta = ${d(V.q19ExtraBergou64, 2)}$) and ${d(V.q19ExtraEdge64, 4)} on the extra edge; at $N = 8$: ${d(V.q19Extra8Near, 3)} at $n = ${V.q19ExtraPeak8}$.`,
    caption: 'chance of spokes 1 and 2 against steps for N = 64, and the N = 8 picture at its peak (step 3)',
    captionFormal: `$N = 64$: the chance on spokes 1, 2, peak ${d(V.q19ExtraNear64, 2)} at $n = ${V.q19ExtraPeak64}$; $N = 8$: the graph at its peak, step ${V.q19ExtraPeak8}`,
    stage: split(PX64([V.q19ExtraPeak64]), wg(STAR8X, { walker: { step: V.q19ExtraPeak8 } })),
    fidelity: ['qc-walk-graph-width'],
    claims: [
      claim('q19ExtraAsym', 'at $n\\Delta = \\pi/2$ the chance on spokes 1 and 2 is $\\tfrac23$', () => close(V.q19ExtraAsym, 2 / 3, 1e-12)),
      claim('q19ExtraAsymEdge', 'and on the extra edge $\\tfrac13$', () => close(V.q19ExtraAsymEdge, 1 / 3, 1e-12)),
      claim('q19ExtraPeak64', 'for $N = 64$ the peak is at step $11$', () => V.q19ExtraPeak64 === 11),
      claim('q19ExtraNear64', 'with chance $0.7002$ on spokes 1 and 2', () => close(V.q19ExtraNear64, 0.7002, 5e-5)),
      claim('q19ExtraEdge64', 'and $0.2928$ on the extra edge', () => close(V.q19ExtraEdge64, 0.2928, 5e-5)),
      claim('q19ExtraBergou64', 'while $\\pi/(2\\Delta) = 10.88$', () => close(V.q19ExtraBergou64, 10.88, 5e-3)),
      claim('q19ExtraPeak8', 'for $N = 8$ the peak is at step $3$', () => V.q19ExtraPeak8 === 3),
      claim('q19Extra8Near', 'with chance $0.625$ on spokes 1 and 2', () => close(V.q19Extra8Near, 0.625, 1e-9)),
    ],
  },
  {
    id: 'q19-extra-edge:b4',
    phase: 'books',
    text:
      `Replace the minus sign of the start by plus and the search fails. Within 40 steps at $N = 64$ the walker is never on spokes 1 and 2 with more than ${d(V.q19ExtraPlus64, 3)}, against ${d(V.q19ExtraNear64, 2)} with the minus sign. ` +
      `The [[relative-phase|relative sign]] of the leaving and arriving parts decides whether the pieces add up.`,
    formal:
      `With $+$ in Eq. 7.67 the book says the search fails. The engine at $N = 64$ and $n \\le 40$ finds at best ${d(V.q19ExtraPlus64, 4)} on spokes 1 and 2 and ${d(V.q19ExtraPlusEdge64, 4)} on the extra edge, against ${d(V.q19ExtraNear64, 4)} with the minus sign. ` +
      `The [[relative-phase|relative sign]] of the leaving and arriving parts decides whether the pieces add up.`,
    caption: `the two starts: minus (peak ${d(V.q19ExtraNear64, 2)}) and plus (flat, at most ${d(V.q19ExtraPlus64, 3)})`,
    captionFormal: `chance on spokes 1, 2 for $N = 64$: the minus start peaks at ${d(V.q19ExtraNear64, 4)}, the plus start stays at most ${d(V.q19ExtraPlus64, 4)} for $n \\le 40$`,
    stage: PX64([V.q19ExtraPeak64], true),
    claims: [
      claim('q19ExtraPlus64', 'from the plus start the best chance on spokes 1 and 2 is $0.0829$', () => close(V.q19ExtraPlus64, 0.0829, 5e-5)),
      claim('q19ExtraPlusEdge64', 'and on the extra edge $0.0587$', () => close(V.q19ExtraPlusEdge64, 0.0587, 5e-5)),
    ],
  },
  {
    id: 'q19-extra-edge:b5',
    phase: 'clue',
    text: 'A star has 1024 spokes. How many steps to find the extra edge? A list of the graph has about 1024 entries to read.',
    formal: 'Estimate $n \\approx \\pi/(2\\Delta)$ at $N = 1024$ and compare with the engine’s highest peak of the first swing, $n \\le \\pi/\\Delta$.',
    caption: 'the N = 64 curve for scale',
    captionFormal: 'the $N = 64$ curve for scale; at $N = 1024$ the peak moves out',
    stage: PX64(),
    reveal: {
      text: `About 44 steps, the highest peak of the first swing (${d(V.q19ExtraBergou1024, 1)} from the formula). Reading the graph’s list takes about 1024 entries, so this sets steps against list entries. Again a square-root speed-up.`,
      formal:
        `$\\pi/(2\\Delta) = \\tfrac\\pi4\\sqrt{3N} = ${d(V.q19ExtraBergou1024, 2)}$; the engine’s highest peak of the first swing ($n \\le \\pi/\\Delta$) is at $n = ${V.q19ExtraPeak1024}$; a classical search of an adjacency list is $O(N)$ entries (Bergou p. 139), so steps are set against list entries.`,
      caption: 'the N = 64 curve for scale; for N = 1024 the highest peak of the first swing moves out to 44',
      captionFormal: `the $N = 64$ curve; at $N = 1024$ the highest first-swing peak is at $n = ${V.q19ExtraPeak1024}$`,
      stage: PX64([V.q19ExtraPeak64]),
      claims: [
        claim('q19ExtraPeak1024', 'for 1024 spokes the highest peak of the first swing ($n \\le \\pi/\\Delta$) is at step $44$', () => V.q19ExtraPeak1024 === 44),
        claim('q19ExtraBergou1024', 'and $\\pi/(2\\Delta) = 43.53$', () => close(V.q19ExtraBergou1024, 43.53, 5e-3)),
      ],
    },
  },
  {
    id: 'q19-extra-edge:b6',
    phase: 'deeper',
    text:
      `A loop on one spoke is another variation, and a simple maze can be solved with a speed-up. Element distinctness uses a kind of walk too. We cite these and do not work them.`,
    formal:
      `Bergou’s Problem 7.1 (p. 142, flagged: a loop on spoke 1, started from the state of Eq. 7.67) and the remarks on mazes and on element distinctness (p. 139) are cited, not worked. ` +
      `The extra-edge search of this unit stays at $N = 8$ for the picture, with $${d(V.q19Extra8Dim, 0)}$ edge states.`,
    caption: 'the star with its extra edge, as a reminder of what is searched',
    captionFormal: 'the star with the extra edge $\\{1,2\\}$, the object of the search',
    stage: wg(STAR8X, { walker: { step: 0 } }),
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q19-simulation — Imitating a spin chain with gates                                                */
/* ---------------------------------------------------------------------------------------------- */

const simulation: Beat[] = [
  {
    id: 'q19-simulation:b1',
    phase: 'books',
    text:
      `[[qc-quantum-simulation|Quantum simulation]] means using a quantum computer to imitate another quantum system. Take a [[qc-heisenberg-chain|chain of $N$ spins]]. A classical computer must store $2^N$ numbers for it. ` +
      `For $N = 50$ that is $${d(V.q19Amps50, 3)} \\times 10^{15}$ numbers, about ${d(V.q19Bytes50, 1)} petabytes at 16 bytes each. A quantum computer needs 50 [[qubit|qubits]] (<<qc-l11-schrodinger|Unit 11.4>>).`,
    formal:
      `[[qc-quantum-simulation|Quantum simulation]] (Bergou §7.7, p. 140) applies $U(t) = e^{-itH}$ for the [[qc-heisenberg-chain|Heisenberg chain]] $H = -J\\sum_{n=1}^{N-1}\\mathbf S_n\\cdot\\mathbf S_{n+1}$ (Eq. 7.80; $\\hbar = 1$, $\\mathbf S = \\boldsymbol\\sigma/2$). ` +
      `A classical computer holds $2^N$ amplitudes: $2^{50} = ${d(V.q19Amps50, 3)} \\times 10^{15}$, or ${d(V.q19Bytes50, 1)} PB at 16 bytes each. $N$ [[qubit|qubits]] suffice, and the $N - 1 = ${V.q19Terms50}$ terms each touch two spins (<<qc-l11-schrodinger|Unit 11.4>>).`,
    caption: `the number of amplitudes 2ⁿ against the number of spins n: ${d(V.q19Amps50, 3)} × 10¹⁵ at 50`,
    captionFormal: `$2^n$ against $n$ on a log axis: ${d(V.q19Amps50, 3)} × 10¹⁵ at $n = 50$`,
    stage: plot({ fn: 'twoToN', x: { from: 1, to: 50 } }, [50], { yScale: 'log' }),
    claims: [
      claim('q19Amps50', 'for 50 spins a classical computer stores $1.126 \\times 10^{15}$ amplitudes', () => close(V.q19Amps50 * 1e15, 2 ** 50, 1)),
      claim('q19Bytes50', 'which is $18.0$ petabytes at 16 bytes each', () => close(V.q19Bytes50, 18.0, 5e-2)),
      claim('q19Terms50', 'and the chain has $49$ two-spin terms', () => V.q19Terms50 === 49),
    ],
  },
  {
    id: 'q19-simulation:b2',
    phase: 'books',
    text:
      `Each term acts on two neighbours. The [[qc-swap-gate|SWAP]] gate of Chapter Q4 swaps two spins, and for two spins $\\mathbf S_1\\cdot\\mathbf S_2 = (2\\,\\mathrm{SWAP} - I)/4$. ` +
      `So the bond’s gate is part “do nothing”, of size $\\cos(Jt/2)$, and part “swap”, of size $\\sin(Jt/2)$. At $Jt = \\pi$ it is a pure swap (<<qc-l11-generator|Unit 11.3>>).`,
    formal:
      `$XX + YY + ZZ = 2\\,\\mathrm{SWAP} - I$, so $H_n = -J\\mathbf S_n\\cdot\\mathbf S_{n+1} = -\\tfrac{J}{2}\\mathrm{SWAP} + \\tfrac{J}{4}$ and $U_n(t) = e^{-iJt/4}[\\cos(Jt/2)\\,I + i\\sin(Jt/2)\\,\\mathrm{SWAP}]$. ` +
      `At $Jt = \\pi$ this is $e^{-i\\pi/4}\\,i\\,\\mathrm{SWAP}$, Chapter Q4’s gate (<<qc-l11-generator|Unit 11.3>>: $H$ generates the turn). ` +
      `The engine finds a gap $${d(V.q19SwapIdentity, 0)}$ for the identity and $${d(V.q19BondClosed, 0)}$ between the closed form and a matrix exponential of $H_n$; $|10\\rangle \\to |01\\rangle$ with chance $${d(V.q19BondSwapChance, 0)}$.`,
    caption: 'one bond at Jt = π: the flipped spin moves from wire 0 to wire 1',
    captionFormal: 'the bond gate $U_n$ at $Jt = \\pi$ on $|10\\rangle$: all the chance moves to $|01\\rangle$',
    stage: split(circ(C_BOND, 1), amp(C_BOND, 1, 'probability')),
    claims: [
      claim('q19SwapIdentity', 'the identity $XX + YY + ZZ = 2\\,\\mathrm{SWAP} - I$ holds', () => close(V.q19SwapIdentity, 0, 1e-12)),
      claim('q19BondClosed', 'the closed-form bond gate equals the matrix exponential', () => close(V.q19BondClosed, 0, 1e-12)),
      claim('q19BondSwapChance', 'at $Jt = \\pi$ the flip moves to the next wire with chance $1$', () => close(V.q19BondSwapChance, 1, 1e-12)),
    ],
  },
  {
    id: 'q19-simulation:b3',
    phase: 'books',
    text:
      `With three spins there are two bonds sharing the middle spin. They do not [[qc-commutator|commute]], so $e^{-it(H_1+H_2)}$ is not $e^{-itH_1}e^{-itH_2}$. ` +
      `[[qc-trotter-formula|Trotter’s formula]] cuts the time into $M$ pieces and alternates the bonds. At $t = 2$ the error is $${d(V.q19TrotErr1, 3)}$ with one piece and $${d(V.q19TrotErr8, 3)}$ with eight.`,
    formal:
      `$[H_1, H_2] \\ne 0$, with operator norm $\\|[H_1,H_2]\\| = \\tfrac{\\sqrt3}{4} = ${d(V.q19Comm, 4)}$ at $J = 1$. [[qc-trotter-formula|Trotter’s formula]] $e^{i(A+B)\\Delta t} = e^{iA\\Delta t}e^{iB\\Delta t} + O((\\Delta t)^2)$ (Eq. 7.81; N&C p. 207) gives ` +
      `$U(t) = [U_1(t/M)U_2(t/M)]^M + O(t^2/M)$ (Eq. 7.82). At $t = 2$ the error is $${d(V.q19TrotErr1, 4)}$ for $M = 1$ and $${d(V.q19TrotErr8, 4)}$ for $M = 8$, under the bound $t^2\\|[H_1,H_2]\\|/2M = ${d(V.q19TrotBound8, 4)}$.`,
    caption: 'error against pieces M on log scales: a straight line of slope −1; beside it the circuit for M = 1',
    captionFormal: 'the error $\\|U(t) - (U_1U_2)^M\\|$ against $M$ on log axes, slope $-1$; the circuit for $M = 1$',
    stage: split(TE1(), circ(C_TR(1, 1), 2)),
    claims: [
      claim('q19Comm', 'the two bonds have commutator of size $\\sqrt3/4 = 0.4330$', () => close(V.q19Comm, Math.sqrt(3) / 4, 1e-12)),
      claim('q19TrotErr1', 'with one piece the error at $t = 2$ is $0.7327$', () => close(V.q19TrotErr1, 0.7327, 5e-5)),
      claim('q19TrotErr8', 'with eight pieces $0.0911$', () => close(V.q19TrotErr8, 0.0911, 5e-5)),
      claim('q19TrotBound8', 'under the bound $0.1083$', () => close(V.q19TrotBound8, 0.1083, 5e-5) && V.q19TrotErr8 < V.q19TrotBound8),
      claim('q19TrotRatio1', 'doubling the pieces from 4 to 8 divides the error by $2.00$', () => close(V.q19TrotRatio1, 2.0, 5e-3)),
    ],
    derivation: {
      result: 'M\\cdot\\tfrac{(t/M)^2}{2}\\|[H_1,H_2]\\| = \\tfrac{t^2}{2M}\\|[H_1,H_2]\\|',
      ground: [
        {
          tex: 'e^{-iA\\tau} = 1 - iA\\tau - \\tfrac{A^2\\tau^2}{2} + \\cdots',
          why: 'Expand each exponential to second order in the small time step $\\tau = t/M$.',
          view: circ(C_TR(1, 1), 2),
          viewCaption: 'one piece of each bond',
        },
        {
          tex: 'e^{-iA\\tau}e^{-iB\\tau} - e^{-i(A+B)\\tau} = -\\tfrac{[A,B]}{2}\\,\\tau^2 + \\cdots',
          why: 'The product has $-\\tfrac{A^2+B^2}{2} - AB$ at second order, the exact one $-\\tfrac{(A+B)^2}{2}$; they differ by the commutator.',
          view: TE1(),
          viewCaption: 'error against pieces',
        },
        {
          tex: '\\|e^{-iA\\tau}e^{-iB\\tau} - e^{-i(A+B)\\tau}\\| \\le \\tfrac{\\tau^2}{2}\\|[A,B]\\|',
          why: 'So one piece is off by at most half of $\\tau^2$ times the size of $[A,B]$.',
          view: circ(C_TR(1, 1), 2),
          viewCaption: 'one piece of each bond',
        },
        {
          tex: 'M\\cdot\\tfrac{(t/M)^2}{2}\\|[H_1,H_2]\\| = \\tfrac{t^2}{2M}\\|[H_1,H_2]\\|',
          why: 'The $M$ pieces add their errors, which gives $t^2/2M$ times the commutator’s size.',
          view: TE1(),
          viewCaption: 'error against pieces',
        },
      ],
      formal: [
        {
          tex: 'e^{-iA\\tau}e^{-iB\\tau} = 1 - i(A+B)\\tau - \\tfrac{A^2 + B^2 + 2AB}{2}\\tau^2 + \\cdots',
          why: 'Expand to second order in $\\tau = t/M$.',
          view: circ(C_TR(1, 1), 2),
          viewCaption: 'one piece of each bond',
        },
        {
          tex: '\\|e^{-iA\\tau}e^{-iB\\tau} - e^{-i(A+B)\\tau}\\| \\le \\tfrac{\\tau^2}{2}\\|[A,B]\\|',
          why: 'The difference with the exact exponential is $-\\tfrac{[A,B]}{2}\\tau^2$ at lowest order.',
          view: TE1(),
          viewCaption: 'error against pieces',
        },
        {
          tex: 'M\\cdot\\tfrac{(t/M)^2}{2}\\|[H_1,H_2]\\| = \\tfrac{t^2}{2M}\\|[H_1,H_2]\\|',
          why: 'Summing the $M$ pieces gives the bound of Eq. 7.82.',
        },
      ],
    },
  },
  {
    id: 'q19-simulation:b4',
    phase: 'books',
    text:
      `Flip the first of three spins: $|100\\rangle$. The flip wanders along the chain. At $t = 2$, with $J = 1$, the exact chances for spin 1, 2 and 3 are $${d(V.q19MagnonExact1, 3)}$, $${d(V.q19MagnonExact2, 3)}$ and $${d(V.q19MagnonExact3, 3)}$. ` +
      `With one piece the circuit puts $${d(V.q19MagnonTrotM1, 3)}$ on spin 3; with eight pieces, $${d(V.q19MagnonTrotM8, 3)}$.`,
    formal:
      `Circuit: from $|100\\rangle$, $M$ repeats of $U_1(t/M)$ on wires 0 and 1 and then $U_2(t/M)$ on wires 1 and 2. The exact chances at $t = 2$ are $(${d(V.q19MagnonExact1, 4)}, ${d(V.q19MagnonExact2, 4)}, ${d(V.q19MagnonExact3, 4)})$ from a matrix exponential; ` +
      `a $3\\times3$ hopping matrix agrees (engine gap $${d(V.q19MagnonRoutes, 0)}$). On spin 3 the circuit gives $${d(V.q19MagnonTrotM1, 4)}$ for $M = 1$, $${d(V.q19MagnonTrotM4, 4)}$ for $M = 4$ and $${d(V.q19MagnonTrotM8, 4)}$ for $M = 8$, approaching the exact $${d(V.q19MagnonExact3, 4)}$.`,
    caption: 'the circuit for M = 4 and the chances of the eight strings (the flip on wire 0, 1 or 2)',
    captionFormal: 'the Trotter circuit for $M = 4$ (8 columns) and the chances of the strings $|100\\rangle$, $|010\\rangle$, $|001\\rangle$',
    stage: split(circ(C_TR(4, 1), 8), amp(C_TR(4, 1), 8, 'probability')),
    claims: [
      claim('q19MagnonExact1', 'the exact chance of the flip on spin 1 at $t = 2$ is $0.3896$', () => close(V.q19MagnonExact1, 0.3896, 5e-5)),
      claim('q19MagnonExact2', 'on spin 2 $0.4422$', () => close(V.q19MagnonExact2, 0.4422, 5e-5)),
      claim('q19MagnonExact3', 'on spin 3 $0.1681$', () => close(V.q19MagnonExact3, 0.1681, 5e-5) && close(V.q19MagnonExact1 + V.q19MagnonExact2 + V.q19MagnonExact3, 1, 1e-9)),
      claim('q19MagnonTrotM1', 'with one piece the chance on spin 3 is $0.5014$', () => close(V.q19MagnonTrotM1, 0.5014, 5e-5)),
      claim('q19MagnonTrotM4', 'with four pieces $0.2394$', () => close(V.q19MagnonTrotM4, 0.2394, 5e-5)),
      claim('q19MagnonTrotM8', 'with eight pieces $0.2027$', () => close(V.q19MagnonTrotM8, 0.2027, 5e-5)),
      claim('q19MagnonRoutes', 'the hopping matrix and the matrix exponential agree', () => close(V.q19MagnonRoutes, 0, 1e-12)),
    ],
  },
  {
    id: 'q19-simulation:b5',
    phase: 'clue',
    text: 'We want the operator error below $0.05$ at $t = 2$. How many pieces does the simple formula need?',
    formal: 'Find the least $M$ with $\\|U(t) - [U_1U_2]^M\\| < 0.05$ at $t = 2$, $J = 1$; use the $1/M$ scaling to estimate first.',
    caption: 'the error line crosses 0.05 between 14 and 15 pieces',
    captionFormal: 'the first-order error against $M$ on log axes',
    stage: TE1(),
    reveal: {
      text: `$M = ${V.q19TrotMFor05}$ gives ${d(V.q19TrotErr15, 4)}; $M = 14$ misses with ${d(V.q19TrotErr14, 4)}. One more digit of accuracy costs ten times as many pieces.`,
      formal: `$M = ${V.q19TrotMFor05}$ (errors $${d(V.q19TrotErr14, 4)}$ at 14 and $${d(V.q19TrotErr15, 4)}$ at 15): first order scales as $1/M$, so a decimal digit costs ten times the gates.`,
      caption: 'the error line passes 0.05 at 15 pieces',
      captionFormal: `the first-order error crosses $0.05$ at $M = ${V.q19TrotMFor05}$`,
      stage: TE1([V.q19TrotMFor05]),
      claims: [
        claim('q19TrotMFor05', 'the least number of pieces with error below $0.05$ is $15$', () => V.q19TrotMFor05 === 15),
        claim('q19TrotErr14', 'fourteen pieces leave an error of $0.0521$', () => close(V.q19TrotErr14, 0.0521, 5e-5)),
        claim('q19TrotErr15', 'fifteen leave $0.0486$', () => close(V.q19TrotErr15, 0.0486, 5e-5)),
      ],
    },
  },
  {
    id: 'q19-simulation:b6',
    phase: 'deeper',
    text:
      `Put half of $U_1$ before and half after: $U_1(\\Delta t/2)\\,U_2(\\Delta t)\\,U_1(\\Delta t/2)$. The error of each piece shrinks as $\\Delta t^3$, so the total falls as $1/M^2$. Three pieces already give ${d(V.q19Trot2Err3, 4)}.`,
    formal:
      `$e^{i(A+B)\\Delta t} = e^{iA\\Delta t/2}e^{iB\\Delta t}e^{iA\\Delta t/2} + O((\\Delta t)^3)$ (N&C Eq. 4.104, p. 208): the total error scales as $1/M^2$, a ratio of ${d(V.q19Trot2Ratio, 2)} per doubling of $M$ against ${d(V.q19TrotRatio1, 2)} for first order. ` +
      `The error is ${d(V.q19Trot2Err4, 4)} at $M = 4$, and $M = ${V.q19Trot2MFor05}$ is the least giving less than $0.05$.`,
    caption: 'second-order line of slope −2 under the first-order line',
    captionFormal: 'first and second order on log axes: slopes $-1$ and $-2$; marks at $M = 3, 4$',
    stage: TE([3, 4]),
    claims: [
      claim('q19Trot2Err3', 'with three pieces the second-order error is $0.0246$', () => close(V.q19Trot2Err3, 0.0246, 5e-5)),
      claim('q19Trot2Err4', 'with four $0.0138$', () => close(V.q19Trot2Err4, 0.0138, 5e-5)),
      claim('q19Trot2Ratio', 'doubling the pieces divides it by $4.00$', () => close(V.q19Trot2Ratio, 4.0, 5e-3)),
      claim('q19Trot2MFor05', 'and three pieces are the least giving less than $0.05$', () => V.q19Trot2MFor05 === 3),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q19-qaoa — Quantum circuit, classical tuner                                                       */
/* ---------------------------------------------------------------------------------------------- */

const QA = () => C_Q(V.q19GammaA, V.q19BetaA)

const qaoa: Beat[] = [
  {
    id: 'q19-qaoa:b1',
    phase: 'books',
    text:
      `Split the four corners of a square into two teams, 0 and 1. A side is “cut” when its ends are on different teams. Of the ${V.q19Assign4} ways, two cut all four sides: 0101 and 1010. The average is only 2. This is [[qc-maxcut|MaxCut]].`,
    formal:
      `[[qc-maxcut|MaxCut]] on the 4-cycle with edges $E = \\{01, 12, 23, 30\\}$ (Bergou p. 141; there $N$ counts vertices, here $n = 4$): for $x \\in \\{0,1\\}^4$, $\\mathrm{cut}(x)$ counts the edges with different ends. ` +
      `Over the ${V.q19Assign4} strings the cut is 0 for ${V.q19CutHist0}, 2 for ${V.q19CutHist2} and 4 for ${V.q19CutCount4} (0101 and 1010); the mean is ${d(V.q19CutMean, 0)}. The aim is a good cut, not necessarily the best.`,
    caption: 'the square with the cut 0101: every side cut',
    captionFormal: 'the 4-cycle with $x = 0101$: all four edges cut',
    stage: wg(RING4, { cut: '0101' }),
    claims: [
      claim('q19Assign4', 'four corners have $16$ team assignments', () => V.q19Assign4 === 16),
      claim('q19MaxCut', 'the best cut cuts $4$ sides', () => V.q19MaxCut === 4),
      claim('q19CutCount4', 'and exactly $2$ assignments reach it', () => V.q19CutCount4 === 2),
      claim('q19CutMean', 'a random assignment cuts $2$ sides on average', () => close(V.q19CutMean, 2, 1e-12)),
      claim('q19CutHist0', 'two assignments cut no side', () => V.q19CutHist0 === 2),
      claim('q19CutHist2', 'and twelve cut two', () => V.q19CutHist2 === 12),
    ],
  },
  {
    id: 'q19-qaoa:b2',
    phase: 'books',
    introduces: ['qc-cost-hamiltonian'],
    text:
      `Write each team as a qubit. The [[qc-cost-hamiltonian|cost $H_C$]] gives each string its cut number. Then $e^{-i\\gamma H_C}$ turns each string’s arrow by $\\gamma$ times its cut number. Only phases change. ` +
      `Each side is one small two-qubit gate.`,
    formal:
      `[[qc-cost-hamiltonian|$H_C = \\sum_{jk\\in E}\\frac{1 - \\sigma^z_j\\sigma^z_k}{2}$]] (Eq. 7.83) is diagonal, $H_C|x\\rangle = \\mathrm{cut}(x)|x\\rangle$. ` +
      `$U_C(\\gamma) = e^{-i\\gamma H_C}$ multiplies $|x\\rangle$ by $e^{-i\\gamma\\,\\mathrm{cut}(x)}$ and splits into $\\mathrm{diag}(1, e^{-i\\gamma}, e^{-i\\gamma}, 1)$ per edge. Engine: $H_C$ built from $\\sigma^z$ equals the cut table (gap $${d(V.q19HcGap, 0)}$).`,
    caption: `after the Hadamards and the phase step: sixteen bars of equal size ${d(V.q19QaoaBar, 2)}, different phase colours`,
    captionFormal: `$U_C|\\psi_{\\mathrm{in}}\\rangle$: every amplitude has size $${tf(V.q19QaoaBar)}$ and phase $-\\gamma\\,\\mathrm{cut}(x)$`,
    stage: split(circ(QA(), 3), amp(QA(), 3, 'amplitude')),
    claims: [
      claim('q19HcGap', 'the cost Hamiltonian built from $\\sigma^z$ equals the cut table', () => close(V.q19HcGap, 0, 1e-12)),
      claim('q19QaoaBar', 'after the phase step all sixteen amplitudes have size $0.25$', () => close(V.q19QaoaBar, 0.25, 1e-12)),
    ],
    derivation: {
      result: 'H_C|x\\rangle = \\mathrm{cut}(x)|x\\rangle',
      ground: [
        {
          tex: '\\sigma^z|x\\rangle = (-1)^{x}|x\\rangle',
          why: 'A bit 0 has $z = +1$ and a bit 1 has $z = -1$.',
          view: wg(RING4, { cut: '0000' }),
          viewCaption: 'no side cut: all teams equal',
        },
        {
          tex: 'x_j = x_k:\\quad \\tfrac{1 - z_jz_k}{2} = 0',
          why: 'With the same ends, $z_jz_k = +1$, so the term is $0$.',
        },
        {
          tex: 'x_j \\ne x_k:\\quad \\tfrac{1 - z_jz_k}{2} = 1',
          why: 'With different ends, $z_jz_k = -1$, so the term is $1$.',
          view: wg(RING4, { cut: '0101' }),
          viewCaption: 'every side cut: 0101',
        },
        {
          tex: 'H_C|x\\rangle = \\sum_{jk\\in E}[x_j \\ne x_k]\\,|x\\rangle = \\mathrm{cut}(x)|x\\rangle',
          why: 'Add up the sides: the sum counts the cut ones.',
          view: amp(QA(), 3, 'amplitude'),
          viewCaption: 'the strings’ phases after the step',
        },
      ],
      formal: [
        {
          tex: '\\sigma^z|x\\rangle = (-1)^{x}|x\\rangle',
          why: 'Each bit is an eigenstate of $\\sigma^z$ with eigenvalue $(-1)^x$.',
          view: wg(RING4, { cut: '0000' }),
          viewCaption: 'no side cut: all teams equal',
        },
        {
          tex: '\\tfrac{1 - z_jz_k}{2} = [x_j \\ne x_k]',
          why: 'Each term is $0$ for equal ends and $1$ for different ends.',
          view: wg(RING4, { cut: '0011' }),
          viewCaption: 'two sides cut: 0011',
        },
        {
          tex: 'H_C|x\\rangle = \\mathrm{cut}(x)|x\\rangle',
          why: 'Summing over the edges counts the cut ones.',
          view: amp(QA(), 3, 'amplitude'),
          viewCaption: 'the strings’ phases after the step',
        },
      ],
    },
  },
  {
    id: 'q19-qaoa:b3',
    phase: 'books',
    text:
      `Start with all 16 strings equal, apply the phase step, then the mixer: turn every qubit by $2\\beta$ about $x$. Phases alone change no chances; the mixer turns phase differences into chances. ` +
      `With $\\gamma = 0$ or $\\beta = 0$ the average cut stays ${d(V.q19F0Gamma, 0)}. The whole circuit is [[qc-qaoa|QAOA]].`,
    formal:
      `$|\\psi_{\\mathrm{in}}\\rangle = 4^{-1}\\sum_x|x\\rangle$ (Eq. 7.84); $U_B(\\beta) = e^{-i\\beta H_B}$ with $H_B = \\sum_j\\sigma^x_j$ (Eq. 7.85) is $R_x(2\\beta)$ on every wire; ` +
      `$|\\gamma,\\beta\\rangle = U_BU_C|\\psi_{\\mathrm{in}}\\rangle$ is the [[qc-qaoa|QAOA]] state, and $F(\\gamma,\\beta) = \\langle\\gamma,\\beta|H_C|\\gamma,\\beta\\rangle$ (Eq. 7.86). ` +
      `Engine: $F = ${d(V.q19F0Gamma, 0)}$ at $\\gamma = 0$ or $\\beta = 0$, and the circuit equals the dense exponentials (gap $${d(V.q19QaoaCircuitGap, 0)}$).`,
    caption: `the whole circuit and the sixteen chances after the mixer, γ = ${d(V.q19GammaA, 1)}, β = ${d(V.q19BetaA, 1)}`,
    captionFormal: `the four columns (H, two phase columns, $R_x(2\\beta)$) and the chances of the 16 strings at $\\gamma = ${d(V.q19GammaA, 1)}$, $\\beta = ${d(V.q19BetaA, 1)}$`,
    stage: split(circ(QA(), 4), amp(QA(), 4, 'probability')),
    claims: [
      claim('q19GammaA', 'the drawn circuit has $\\gamma = 0.7$', () => close(V.q19GammaA, 0.7, 1e-12)),
      claim('q19BetaA', 'and $\\beta = 0.3$', () => close(V.q19BetaA, 0.3, 1e-12)),
      claim('q19F0Gamma', 'at $\\gamma = 0$ the average cut stays $2$', () => close(V.q19F0Gamma, 2, 1e-12)),
      claim('q19F0Beta', 'and at $\\beta = 0$ too', () => close(V.q19F0Beta, 2, 1e-12)),
      claim('q19QaoaCircuitGap', 'the circuit equals the dense exponentials', () => close(V.q19QaoaCircuitGap, 0, 1e-12)),
    ],
  },
  {
    id: 'q19-qaoa:b4',
    phase: 'books',
    text:
      `Scan $\\gamma$ and $\\beta$. On the square the average cut is $F = 2 + \\sin4\\beta\\,\\sin2\\gamma$. Its best is ${d(V.q19FStar, 0)} at $\\gamma$ = ${d(V.q19GammaStar, 0)}° and $\\beta$ = ${d(V.q19BetaStar, 1)}°: three quarters of the best cut. ` +
      `The best cut itself appears with chance ${d(V.q19QaoaPOpt, 3)}, against ${d(V.q19CutRandomP, 3)} for a guess.`,
    formal:
      `Our calculation finds $F(\\gamma,\\beta) = 2 + \\sin4\\beta\\sin2\\gamma$ for this ring (gap ${d(V.q19RingFormulaGap, 0)} at three points against the dense state); its best is $F^* = ${d(V.q19FStar, 0)}$ at $(\\pi/4, \\pi/8)$, so $F^*/\\mathrm{cut}_{\\max} = ${d(V.q19QaoaRatio, 2)}$. ` +
      `There $P(\\mathrm{cut}\\,4) = 17/32 = ${d(V.q19QaoaPOpt, 3)}$ (${d(V.q19QaoaP0101, 4)} each for 0101 and 1010), $P(2) = ${d(V.q19QaoaP2, 4)}$ and $P(0) = ${d(V.q19QaoaP0, 3)}$.`,
    caption: 'left: F against angle, γ-slice at β = 22.5° and β-slice at γ = 45°; right: the sixteen chances at the best angles',
    captionFormal: `$F$ against the angle in degrees (slices through the best point) and the 16 chances at $(\\pi/4, \\pi/8)$: $P(\\mathrm{cut}\\,4) = ${d(V.q19QaoaPOpt, 3)}$`,
    stage: split(
      plot({ fn: 'qaoaGammaSlice', vs: 'qaoaBetaSlice', x: { from: 0, to: 180 } }, [22.5, 45]),
      amp(C_Q(GAMMA_STAR, BETA_STAR), 4, 'probability'),
    ),
    claims: [
      claim('q19RingFormulaGap', 'the closed form $F = 2 + \\sin4\\beta\\sin2\\gamma$ matches the dense state at three points', () => close(V.q19RingFormulaGap, 0, 1e-12)),
      claim('q19FStar', 'the best average cut is $3$', () => close(V.q19FStar, 3, 1e-12)),
      claim('q19GammaStar', 'at $\\gamma = 45°$', () => close(V.q19GammaStar, 45, 1e-9)),
      claim('q19BetaStar', 'and $\\beta = 22.5°$', () => close(V.q19BetaStar, 22.5, 1e-9)),
      claim('q19QaoaRatio', 'which is $0.75$ of the best cut', () => close(V.q19QaoaRatio, 0.75, 1e-12)),
      claim('q19QaoaPOpt', 'the best cut appears with chance $17/32 = 0.531$', () => close(V.q19QaoaPOpt, 17 / 32, 1e-12)),
      claim('q19QaoaP0101', 'each of 0101 and 1010 has $0.2656$', () => close(V.q19QaoaP0101, 0.2656, 5e-5)),
      claim('q19QaoaP2', 'a cut of 2 has $0.4375$', () => close(V.q19QaoaP2, 0.4375, 5e-5)),
      claim('q19QaoaP0', 'and a cut of 0 has $0.031$', () => close(V.q19QaoaP0, 0.031, 5e-4)),
      claim('q19CutRandomP', 'a random guess finds the best cut with chance $0.125$', () => close(V.q19CutRandomP, 0.125, 1e-12)),
    ],
  },
  {
    id: 'q19-qaoa:b5',
    phase: 'clue',
    text:
      `A classical computer picks $\\gamma$ and $\\beta$. Start at $\\gamma = ${d(V.q19LoopStartG, 1)}$, $\\beta = ${d(V.q19LoopStartB, 1)}$ (radians). Each round try four small moves and keep the best; if none helps, halve the step. How good does it get?`,
    formal:
      `Pattern search from $(${d(V.q19LoopStartG, 1)}, ${d(V.q19LoopStartB, 1)})$ with first step $${d(V.q19LoopStartB, 1)}$ and the neighbours $\\pm\\gamma$, $\\pm\\beta$ (the first best wins), stopping when the step falls below one hundredth: how many accepted moves, how many evaluations of $F$, and what final $F$?`,
    caption: `the circuit at the start (${d(V.q19LoopStartG, 1)}, ${d(V.q19LoopStartB, 1)}) and, after the loop, at its end`,
    captionFormal: `the QAOA circuit at the starting angles $(${d(V.q19LoopStartG, 1)}, ${d(V.q19LoopStartB, 1)})$`,
    stage: circ(C_Q(V.q19LoopStartG, V.q19LoopStartB), 4),
    reveal: {
      text:
        `${V.q19LoopMoves} moves and ${V.q19LoopEvals} evaluations raise the average cut from ${d(V.q19LoopStart, 3)} to ${d(V.q19LoopEnd, 4)}, at $\\gamma$ = ${d(V.q19LoopGammaDeg, 1)}°, $\\beta$ = ${d(V.q19LoopBetaDeg, 1)}°. ` +
        `Each evaluation is many runs of the quantum circuit, and a classical computer steers: a [[qc-hybrid-algorithm|hybrid algorithm]].`,
      formal:
        `${V.q19LoopMoves} accepted moves and ${V.q19LoopEvals} evaluations: $F$ rises from ${d(V.q19LoopStart, 4)} to ${d(V.q19LoopEnd, 4)} at $(${d(V.q19LoopGamma, 4)}, ${d(V.q19LoopBeta, 4)})$ rad $= (${d(V.q19LoopGammaDeg, 1)}°, ${d(V.q19LoopBetaDeg, 1)}°)$. ` +
        `On hardware each $F$ is estimated from repeated runs and the optimiser is classical: the [[qc-hybrid-algorithm|hybrid]] loop (Bergou p. 142).`,
      caption: 'the circuit at the end of the loop',
      captionFormal: `the QAOA circuit at the final angles $(${d(V.q19LoopGamma, 4)}, ${d(V.q19LoopBeta, 4)})$`,
      stage: circ(C_Q(V.q19LoopGamma, V.q19LoopBeta), 4),
      claims: [
        claim('q19LoopStartG', 'the search starts at $\\gamma = 0.3$', () => close(V.q19LoopStartG, 0.3, 1e-12)),
        claim('q19LoopStartB', 'and $\\beta = 0.2$', () => close(V.q19LoopStartB, 0.2, 1e-12)),
        claim('q19LoopMoves', 'it makes $7$ accepted moves', () => V.q19LoopMoves === 7),
        claim('q19LoopEvals', 'and $49$ evaluations', () => V.q19LoopEvals === 49),
        claim('q19LoopStart', 'the average cut rises from $2.405$', () => close(V.q19LoopStart, 2.405, 5e-4)),
        claim('q19LoopEnd', 'to $2.9998$', () => close(V.q19LoopEnd, 2.9998, 5e-5)),
        claim('q19LoopGamma', 'at $\\gamma = 0.7875$', () => close(V.q19LoopGamma, 0.7875, 5e-5)),
        claim('q19LoopBeta', 'and $\\beta = 0.3875$', () => close(V.q19LoopBeta, 0.3875, 5e-5)),
        claim('q19LoopGammaDeg', 'that is $45.1°$', () => close(V.q19LoopGammaDeg, 45.1, 5e-2)),
        claim('q19LoopBetaDeg', 'and $22.2°$', () => close(V.q19LoopBetaDeg, 22.2, 5e-2)),
      ],
    },
  },
  {
    id: 'q19-qaoa:b6',
    phase: 'deeper',
    text:
      `One layer on a ring gets three quarters of the best cut. Whether such hybrids beat classical methods is open. They aim at noisy machines of about a hundred qubits. ` +
      `To see an optimal cut at least once, with confidence nine in ten, takes ${V.q19Shots90} runs here, against ${V.q19Shots90Random} for a random guess. ` +
      `This leaves out the tuning, which costs far more runs, so there is no saving here.`,
    formal:
      `Bergou calls the advantage over classical methods an open question under study (p. 142) and places the method in the era of noisy machines of roughly 100 qubits (p. 141). ` +
      `To see an optimal cut with confidence nine in ten takes the least $m$ with $(1 - p)^m \\le ${d(V.q19ShotsMiss, 1)}$: $${V.q19Shots90}$ runs at $p = ${d(V.q19QaoaPOpt, 3)}$, against $${V.q19Shots90Random}$ at $p = ${tf(V.q19CutRandomP)}$. These counts leave out the ${V.q19LoopEvals} tuning evaluations, each many runs, so they show no saving. ` +
      `Other variational algorithms share the loop; the variational eigensolver is only named here.`,
    caption: 'the square again, cut 0101, with the two best strings',
    captionFormal: 'the 4-cycle with $x = 0101$, one of the two optimal strings',
    stage: wg(RING4, { cut: '0101' }),
    claims: [
      claim('q19Shots90', 'to see the best cut with confidence nine in ten takes $4$ runs', () => V.q19Shots90 === 4),
      claim('q19Shots90Random', 'a random guess needs $18$ runs', () => V.q19Shots90Random === 18),
      claim('q19ShotsMiss', 'the chance of missing every time must be at most $0.1$', () => close(V.q19ShotsMiss, 0.1, 1e-12)),
    ],
  },
]

export const Q19_STORY: Record<string, Beat[]> = {
  'q19-random-walk': randomWalk,
  'q19-scatter': scatter,
  'q19-star-search': starSearch,
  'q19-extra-edge': extraEdge,
  'q19-simulation': simulation,
  'q19-qaoa': qaoa,
}

/** Every claim used anywhere in a unit's beats, for Unit.claims (content.test.tsx "claims hold"). */
function allClaims(beats: Beat[]) {
  return beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground.flatMap((s) => s.claims ?? []) ?? []), ...(b.derivation?.formal?.flatMap((s) => s.claims ?? []) ?? [])])
}
export const Q19_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof allClaims>> = Object.fromEntries(Object.entries(Q19_STORY).map(([id, beats]) => [id, allClaims(beats)]))
