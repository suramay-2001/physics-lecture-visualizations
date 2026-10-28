/**
 * Chapter Q23 scroll story (Physics 709; roles P + W). Beats per docs/roles/proposals/P-Q23-story.md §1, in both tracks, with the rulings of docs/roles/decisions/qc709-Q20-Q27.md
 * (Z1-Z7: Q9 owns the quantum trace distance and fidelity, so Q23 teaches the classical versions, the measurement bridge, relative entropy, mutual information and the Holevo bound).
 *
 * Build notes against the plan:
 * - Phase `'books'` throughout (the 709 notes stop at von Neumann and conditional entropy, which Q9 and Q12 already teach): ramp beats are `books`, the clues are `clue`, the Go-deeper
 *   beats are `deeper` and last in their unit.
 * - Every number is the ENGINE's (Q23.values.ts), printed through d(), tf() and uf(); a typed decimal in prose is a model input (a coin's chances, a flip chance, a mixing weight) with
 *   its own input claim, `q23In...`. Equations are cited as "Eq. 11.4" (the number reader takes "(11.4)" for a decimal), and a Bergou problem is "Problem 4" (cited, never worked).
 * - The overlap table of Klein's proof keeps the name r; the middle coin of Unit 23.1 is therefore called w.
 * - A stage `split` never repeats a kind, so each pair below is matrix + ball, circuit + matrix or bars + matrix.
 */
import type { Circuit } from '../../physics/qc/circuit'
import type { AmpSource, AmplitudesState, BallPoint, BallState, Beat, CircuitStageState, HilbertPlaneState, MatrixGridState, MatrixSource, PlotPointsState, PlotState, StageLayout, StageState } from '../schema'
import { C_BSC, C_DEPH, C_GHZ, C_W3, TAB, V, claim, close, d } from './Q23.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan "Stage shorthand"), as plain builder functions                              */
/* ---------------------------------------------------------------------------------------------- */
const circ = (C: Circuit, upTo: number): CircuitStageState => ({ kind: 'circuit', circuit: C, upTo, shot: 'Q-WIRES' })
const amp = (C: Circuit, upTo: number, mode: AmplitudesState['mode'], extra: Partial<Omit<AmplitudesState, 'kind' | 'state' | 'mode' | 'shot'>> = {}): AmplitudesState => ({
  kind: 'amplitudes',
  state: { circuit: C, upTo },
  mode,
  shot: 'A-BARS',
  ...extra,
})
const mx = (source: MatrixSource, extra: Partial<Omit<MatrixGridState, 'kind' | 'source' | 'labels'>> = {}): MatrixGridState => ({ kind: 'matrix', source, labels: 'kets', values: 'decimal', shot: 'M-GRID', ...extra })
/** A table of chances (the pair view carries its own labels). */
const tbl = (source: MatrixSource, extra: Partial<Omit<MatrixGridState, 'kind' | 'source' | 'labels'>> = {}): MatrixGridState => ({ kind: 'matrix', source, values: 'decimal', shot: 'M-GRID', ...extra })
const ball = (point: BallPoint, extra: Partial<Omit<BallState, 'kind' | 'point'>> = {}): BallState => ({ kind: 'bloch-ball', point, purity: true, shot: 'B-STD', ...extra })
const hp = (extra: Partial<Omit<HilbertPlaneState, 'kind' | 'shot'>> = {}): HilbertPlaneState => ({ kind: 'hilbert-plane', shot: 'H-FLAT', ...extra })
const plot = (curve: PlotState['curve'], markers: number[] = [], extra: Partial<Omit<PlotState, 'kind' | 'curve' | 'markers'>> = {}): PlotState => ({
  kind: 'plot',
  curve,
  markers: markers.map((x) => ({ x })),
  shot: 'P-CURVE',
  ...extra,
})
/** Chance tables as points: one group per table, x = the outcome's number, y = its chance (every y is a model input of Q23.values.ts). */
const pts = (groups: [string, readonly number[]][], extra: Partial<Omit<PlotPointsState, 'kind' | 'points' | 'shot'>> = {}): PlotPointsState => ({
  kind: 'plot',
  points: groups.flatMap(([group, ys]) => ys.map((y, k) => ({ x: k + 1, y, status: 'computed' as const, group }))),
  xLabel: 'outcome',
  yLabel: 'chance',
  shot: 'P-CURVE',
  ...extra,
})
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })
/** A mixture of kets: weights add to 1. */
const mix = (...parts: [number, AmpSource][]): MatrixSource => ({ rho: { mixture: parts.map(([w, ket]) => ({ w, ket })) } })
const k = (label: string): AmpSource => ({ ket: label })
const b = (name: string): AmpSource => ({ bell: name })
/** The Helstrom measurement axis of Unit 14.5 for |0> against |+>: the eigen-axis of their difference. */
const HELSTROM_AXIS = { thetaDeg: 45, phiDeg: 180 } as const
const RHO9 = mix([0.9, k('0')], [0.1, k('1')])
/** The ensemble ball of Units 23.4 and 23.6: |0> and |+> with chance one half each, with the ingredients drawn. */
const PAIR_BALL = (extra: Partial<Omit<BallState, 'kind' | 'point'>> = {}): BallState => ball({ mix: [{ of: '+z', w: 0.5 }, { of: '+x', w: 0.5 }] }, { recipe: true, ...extra })
/** The square-root arrows of the fair coin (45 degrees) and of the biased coin (18.4 degrees). */
const ARROW_P = hp({ psi: { planeDeg: V.q23PlaneP } })
const ARROWS_PQ = hp({ psi: { planeDeg: V.q23PlaneP }, others: [{ ket: { planeDeg: V.q23PlaneQ }, role: 'basis' }], arc: true, arcLabel: '$\\theta$' })
/** The input claims of the running examples: a model input is a number the chapter states, not a result. */
const inCoins = () => [
  claim('q23InFair', 'the fair coin gives each face chance $0.5$', () => close(V.q23InFair, 0.5, 1e-12)),
  claim('q23InBiasHi', 'the biased coin gives its first face chance $0.9$', () => close(V.q23InBiasHi, 0.9, 1e-12)),
  claim('q23InBiasLo', 'and its second face $0.1$', () => close(V.q23InBiasLo, 0.1, 1e-12)),
]

/* ---------------------------------------------------------------------------------------------- */
/* q23-classical-compare — Comparing two chance tables                                               */
/* ---------------------------------------------------------------------------------------------- */

const classicalCompare: Beat[] = [
  {
    id: 'q23-classical-compare:b1',
    phase: 'books',
    text:
      `Two coins: a fair one with chances $p = (0.5, 0.5)$ and a biased one with $q = (0.9, 0.1)$. ` +
      `Add the gap at each face and halve the sum: $D = \\tfrac12(${d(V.q23Dpq, 1)} + ${d(V.q23Dpq, 1)}) = ${d(V.q23Dpq, 1)}$. This number is the [[qc-kolmogorov-distance|distance between the two tables]].`,
    formal:
      `The [[qc-kolmogorov-distance|classical trace distance]], also called the $L^1$ or Kolmogorov distance (Bergou §11.1, p. 190; N&C p. 400), is $D(p,q) = \\tfrac12\\sum_x|p(x) - q(x)|$, Eq. 11.1. ` +
      `Here $D = ${d(V.q23Dpq, 1)}$. For commuting states, <<qc-q9-distance|Unit 9.6>> gives $D(\\rho,\\sigma)$ as this number for the two eigenvalue tables.`,
    caption: 'two chance tables as points: the fair coin flat, the biased coin tilted',
    captionFormal: '$D$ is half the sum of the vertical gaps between the two tables',
    stage: pts([
      ['fair coin p', TAB.p],
      ['biased coin q', TAB.q],
    ]),
    claims: [claim('q23Dpq', 'the fair and the biased coin are $0.4$ apart', () => close(V.q23Dpq, 0.4, 1e-9)), ...inCoins()],
  },
  {
    id: 'q23-classical-compare:b2',
    phase: 'books',
    text:
      `A good distance obeys the triangle rule: a detour through a third table is never shorter. Take $w = (0.7, 0.3)$. ` +
      `Then $D(p,w) = ${d(V.q23Dpr, 1)}$ and $D(w,q) = ${d(V.q23Dqr, 1)}$, and they add to ${d(V.q23Dpq, 1)}. The two routes tie because $w$ lies on the line from $p$ to $q$.`,
    formal:
      `$D$ is symmetric and $D(p,w) \\le D(p,q) + D(q,w)$, so it is a metric (Bergou p. 190; the proof is Problem 4, cited and not worked). For $w = (0.7, 0.3)$ both $D(p,w)$ and $D(w,q)$ are $${d(V.q23Dpr, 1)}$ and $D(p,q) = ${d(V.q23Dpq, 1)}$, so the rule holds with equality. ` +
      `Over all $3375$ triples of three-outcome tables with entries that are multiples of a quarter, the smallest slack is $${d(V.q23TriangleGridSlack, 0)}$ and none is negative.`,
    caption: 'three tables on one line: the middle coin sits halfway between the other two',
    captionFormal: 'the tables $p$, $w$, $q$ on a line: $D(p,w) + D(w,q) = D(p,q)$',
    stage: pts([
      ['fair coin p', TAB.p],
      ['middle coin w', TAB.r],
      ['biased coin q', TAB.q],
    ]),
    claims: [
      claim('q23Dpr', 'the fair coin and the middle coin $w$ are $0.2$ apart', () => close(V.q23Dpr, 0.2, 1e-9)),
      claim('q23Dqr', 'and the middle coin and the biased coin $0.2$ apart', () => close(V.q23Dqr, 0.2, 1e-9)),
      claim('q23TriangleGridSlack', 'over all $3375$ triples of three-outcome tables in quarter steps the smallest triangle slack is $0$', () => close(V.q23TriangleGridSlack, 0, 1e-12)),
      claim('q23InMidHi', 'the middle coin gives its first face chance $0.7$', () => close(V.q23InMidHi, 0.7, 1e-12)),
      claim('q23InMidLo', 'and its second face $0.3$', () => close(V.q23InMidLo, 0.3, 1e-12)),
    ],
  },
  {
    id: 'q23-classical-compare:b3',
    phase: 'books',
    text:
      `Take square roots of the chances: $\\sqrt p = (${d(V.q23SqrtP, 3)}, ${d(V.q23SqrtP, 3)})$ and $\\sqrt q = (${d(V.q23SqrtQ0, 3)}, ${d(V.q23SqrtQ1, 3)})$. Each is an arrow of length 1. ` +
      `Their dot product, ${d(V.q23Fpq, 3)}, is the cosine of the angle between them, ${d(V.q23ThetaPq, 1)}°. That dot product is the [[qc-classical-fidelity|classical fidelity]].`,
    formal:
      `The vectors $u_x = \\sqrt{p(x)}$ and $v_x = \\sqrt{q(x)}$ have length 1, and the [[qc-classical-fidelity|classical fidelity]] is $F(p,q) = \\vec u\\cdot\\vec v = \\sum_x\\sqrt{p(x)q(x)} = \\cos\\theta$, Eq. 11.2. ` +
      `$F$ is not a metric but $\\theta = \\cos^{-1}F$ is (Bergou p. 190): $\\theta(p,q) = ${d(V.q23ThetaPq, 2)}^\\circ$, and through $w$ the two legs are $${d(V.q23ThetaPr, 2)}^\\circ + ${d(V.q23ThetaRq, 2)}^\\circ$.`,
    caption: 'the two square-root arrows in a plane, and the angle between them',
    captionFormal: '$F = \\cos\\theta$ with the angle $\\theta$ between the two arrows',
    stage: ARROWS_PQ,
    claims: [
      claim('q23SqrtP', 'the square-root arrow of the fair coin is $(0.707, 0.707)$', () => close(V.q23SqrtP, 0.7071, 5e-5)),
      claim('q23SqrtQ0', 'that of the biased coin is $(0.949, 0.316)$: first entry', () => close(V.q23SqrtQ0, 0.9487, 5e-5)),
      claim('q23SqrtQ1', 'second entry', () => close(V.q23SqrtQ1, 0.3162, 5e-5)),
      claim('q23Fpq', 'the classical fidelity of the two coins is $0.8944$', () => close(V.q23Fpq, 0.8944, 5e-5)),
      claim('q23ThetaPq', 'the angle between their arrows is $26.57$ degrees', () => close(V.q23ThetaPq, 26.57, 5e-3)),
      claim('q23ThetaPr', 'the fair coin and the middle coin are $11.79$ degrees apart', () => close(V.q23ThetaPr, 11.79, 5e-3)),
      claim('q23ThetaRq', 'the middle coin and the biased coin are $14.78$ degrees apart', () => close(V.q23ThetaRq, 14.78, 5e-3)),
      claim('q23PlaneP', 'the fair coin’s arrow lies at $45$ degrees in the plane', () => close(V.q23PlaneP, 45, 1e-9)),
      claim('q23PlaneQ', 'the biased coin’s arrow at $18.43$ degrees', () => close(V.q23PlaneQ, 18.43, 5e-3)),
    ],
    derivation: {
      result: 'F = \\sum_x\\sqrt{p_xq_x} = \\cos\\theta',
      ground: [
        {
          tex: '\\vec u\\cdot\\vec u = \\sum_x p_x = 1',
          why: 'Squaring the arrow’s parts gives the chances, which add to 1, so the arrow has length 1.',
          view: ARROW_P,
          viewCaption: 'the arrow $\\sqrt p$ at 45°',
        },
        {
          tex: '\\vec u\\cdot\\vec v = |\\vec u||\\vec v|\\cos\\theta = \\cos\\theta',
          why: 'The same holds for $\\sqrt q$; the dot product of two arrows of length 1 is the cosine of the angle between them.',
          view: ARROWS_PQ,
          viewCaption: 'both arrows and the angle $\\theta$',
        },
        {
          tex: '\\vec u\\cdot\\vec v = \\sum_x\\sqrt{p_xq_x}\\ \\Rightarrow\\ F = \\sum_x\\sqrt{p_xq_x} = \\cos\\theta',
          why: 'Multiply the arrows part by part and add: that sum is the fidelity.',
        },
      ],
      formal: [
        {
          tex: 'u_x = \\sqrt{p_x},\\ v_x = \\sqrt{q_x},\\ \\|u\\| = \\|v\\| = 1',
          why: 'Unit vectors from the two tables.',
          view: ARROW_P,
          viewCaption: 'the arrow $\\sqrt p$',
        },
        {
          tex: 'F = u\\cdot v = \\sum_x\\sqrt{p_xq_x} = \\cos\\theta',
          why: 'The dot product of two unit vectors is the cosine of their angle (Eq. 11.2).',
          view: ARROWS_PQ,
          viewCaption: 'both arrows',
        },
      ],
    },
  },
  {
    id: 'q23-classical-compare:b4',
    phase: 'books',
    introduces: ['qc-relative-entropy'],
    text:
      `A third way to compare is the [[qc-relative-entropy|relative entropy]], $H(p\\|q) = \\sum_x p(x)\\log_2\\frac{p(x)}{q(x)}$, counted in bits. ` +
      `For our two coins it is $${d(V.q23Hpq, 3)}$. The other way round it is $${d(V.q23Hqp, 3)}$. The two differ, so it is not a distance.`,
    formal:
      `$H(p\\|q) = \\sum_x p(x)\\log_2\\frac{p(x)}{q(x)} = -H(X) - \\sum_x p(x)\\log_2 q(x)$, Eq. 11.4, is the [[qc-relative-entropy|relative entropy]] (Kullback–Leibler divergence; Bergou p. 191), where $H(X)$ is the [[qc-shannon-entropy|Shannon entropy]] of <<qc-f5-surprise|Unit F5.4>>. ` +
      `Here $H(p\\|q) = ${d(V.q23Hpq, 4)}$, $H(q\\|p) = ${d(V.q23Hqp, 4)}$ and $H(p\\|p) = 0$. It is infinite when $q(x) = 0 \\ne p(x)$.`,
    caption: '$H(p\\|q)$ and $H(q\\|p)$ for the same two tables: different numbers',
    captionFormal: '$H(p\\|q) \\ne H(q\\|p)$ for the same two tables',
    stage: pts([
      ['fair coin p', TAB.p],
      ['biased coin q', TAB.q],
    ]),
    claims: [
      claim('q23Hpq', 'the relative entropy $H(p\\|q)$ of the fair coin from the biased one is $0.7370$', () => close(V.q23Hpq, 0.737, 5e-5)),
      claim('q23Hqp', 'and the other way round $H(q\\|p) = 0.5310$', () => close(V.q23Hqp, 0.531, 5e-5)),
    ],
  },
  {
    id: 'q23-classical-compare:b5',
    phase: 'books',
    text:
      `Why is it never below zero? For every positive $x$, $\\ln x \\le x - 1$. Put $x = q/p$, weight each term by $p$ and add. ` +
      `The sum $-\\sum p\\ln(q/p)$ is at least $-\\sum(q - p)$, and that is $0$.`,
    formal:
      `The argument follows the Klein inequality of Bergou p. 49 (Eq. 3.46): $H(p\\|q) = -\\sum_x p\\log_2\\frac qp \\ge \\frac{1}{\\ln 2}\\sum_x p\\,(1 - \\frac qp) = \\frac{1}{\\ln 2}\\sum_x(p - q) = 0$, over the support of $p$, with equality only if $p = q$. ` +
      `On the $15$ three-outcome tables in quarter steps the smallest finite value is $${d(V.q23HrelGridMin, 0)}$, and $${d(V.q23HrelGridInf, 0)}$ of the $225$ ordered pairs are infinite.`,
    caption: 'the same two tables: $H(p\\|q) \\ge 0$',
    captionFormal: 'the same two tables: $H(p\\|q) \\ge 0$, with equality only for $p = q$',
    stage: pts([
      ['fair coin p', TAB.p],
      ['biased coin q', TAB.q],
    ]),
    claims: [
      claim('q23HrelGridMin', 'over the $15$ quarter-step tables the smallest finite relative entropy is $0$', () => close(V.q23HrelGridMin, 0, 1e-12)),
      claim('q23HrelGridInf', 'and $132$ of the $225$ ordered pairs have an infinite one', () => V.q23HrelGridInf === 132),
    ],
    derivation: {
      result: 'H(p\\|q) \\ge 0',
      ground: [
        {
          tex: '\\ln x \\le x - 1\\quad (x > 0)',
          why: 'A curve that bends down stays under its tangent line at $x = 1$.',
          view: pts([
            ['fair coin p', TAB.p],
            ['biased coin q', TAB.q],
          ]),
          viewCaption: 'the two tables',
        },
        {
          tex: '-\\sum p\\ln\\tfrac qp \\ge -\\sum p(\\tfrac qp - 1)',
          why: 'Put $x = q/p$, multiply by $p$ and add over the faces; the minus signs flip the inequality.',
          view: pts([
            ['fair coin p', TAB.p],
            ['middle coin w', TAB.r],
          ]),
          viewCaption: 'a table on the line between them',
        },
        {
          tex: '-\\sum(q - p) = -(1 - 1) = 0\\ \\Rightarrow\\ H(p\\|q) \\ge 0',
          why: 'Both tables add to 1, so the right side is exactly 0.',
        },
      ],
      formal: [
        {
          tex: '\\ln x \\le x - 1\\ \\text{summed over the support of } p',
          why: 'Apply the inequality at $x = q(x)/p(x)$ and weight by $p(x)$.',
          view: pts([
            ['fair coin p', TAB.p],
            ['biased coin q', TAB.q],
          ]),
          viewCaption: 'the two tables',
        },
        {
          tex: 'H(p\\|q) \\ge \\tfrac{1}{\\ln 2}\\sum_x(p - q) = 0\\ \\Rightarrow\\ H(p\\|q) \\ge 0',
          why: 'The two sums are both 1.',
          view: pts([
            ['fair coin p', TAB.p],
            ['middle coin w', TAB.r],
          ]),
          viewCaption: 'a table on the line between them',
        },
      ],
    },
  },
  {
    id: 'q23-classical-compare:b6',
    phase: 'clue',
    text: 'Which is larger, $H(p\\|q)$ or $H(q\\|p)$, for our two coins? And what if $q$ calls one outcome impossible although $p$ allows it?',
    formal: 'Compare $H(p\\|q)$ and $H(q\\|p)$ for $p = (0.5, 0.5)$ and $q = (0.9, 0.1)$, then replace $q$ by $(1, 0)$.',
    caption: 'the two tables, then the table with a zero',
    captionFormal: 'the two tables, then $q = (1, 0)$',
    stage: pts([
      ['fair coin p', TAB.p],
      ['biased coin q', TAB.q],
    ]),
    reveal: {
      text: `$${d(V.q23Hpq, 3)}$ against $${d(V.q23Hqp, 3)}$: they differ, so it is no distance. With $q = (1, 0)$ the first is infinite: an outcome you called impossible happened.`,
      formal: `$H(p\\|q) = ${d(V.q23Hpq, 4)} \\ne ${d(V.q23Hqp, 4)} = H(q\\|p)$. For $q = (1,0)$, $H(p\\|q) = \\infty$ (Bergou p. 191), because $q$ gives zero chance to an outcome that $p$ allows.`,
      caption: 'the table with a zero chance on the second face',
      captionFormal: '$q = (1, 0)$: zero chance where $p$ has one half',
      stage: pts([
        ['fair coin p', TAB.p],
        ['q with a zero', TAB.qZero],
      ]),
      claims: [
        claim('q23Hpq', 'the first relative entropy is $0.7370$', () => close(V.q23Hpq, 0.737, 5e-5)),
        claim('q23Hqp', 'the second is $0.5310$', () => close(V.q23Hqp, 0.531, 5e-5)),
        claim('q23HInfFlag', 'with a zero in $q$ the relative entropy is infinite (flag $1$)', () => V.q23HInfFlag === 1),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q23-quantum-compare — The same questions for quantum states                                       */
/* ---------------------------------------------------------------------------------------------- */

const quantumCompare: Beat[] = [
  {
    id: 'q23-quantum-compare:b1',
    phase: 'books',
    text:
      `<<qc-q9-distance|Unit 9.6>> gave the quantum distance $D$. A measurement turns two states into two chance tables. Their distance never exceeds $D$. ` +
      `For the two [[qubit|qubit]] states $|0\\rangle$ and $|{+}\\rangle$, reading $z$ or $x$ gives $${d(V.q23DmeasZ, 1)}$, and the best axis gives $${d(V.q23DmeasBest, 3)}$.`,
    formal:
      `For a projective measurement $\\{P, I - P\\}$ on one [[qubit|qubit]], the two tables differ by $|\\mathrm{Tr}\\,P(\\rho - \\sigma)|$, so every table distance is at most $D(\\rho,\\sigma) = \\max_P\\mathrm{Tr}\\,P(\\rho - \\sigma)$ (Bergou p. 27, after Eq. 2.60, and Eq. 11.5). ` +
      `Equality holds for the projector onto the positive part of $\\rho - \\sigma$: the Helstrom measurement of <<qc-q14-min-error|Unit 14.5>>. ` +
      `Here $D = ${d(V.q23DquantumZP, 4)}$; $z$ gives $${d(V.q23DmeasZ, 1)}$, $x$ gives $${d(V.q23DmeasX, 1)}$, the eigenbasis of $\\rho - \\sigma$ gives $${d(V.q23DmeasBest, 4)}$, and a grid of $3601$ axes in the $xz$ plane has maximum $${d(V.q23DmeasGridMax, 4)}$.`,
    caption: 'the two states on the ball and the best measurement axis',
    captionFormal: 'table distance $\\le D$, with equality on the eigenbasis of $\\rho - \\sigma$',
    stage: ball('+z', { compare: '+x', measure: HELSTROM_AXIS }),
    claims: [
      claim('q23DquantumZP', 'the quantum distance of $|0\\rangle$ and $|{+}\\rangle$ is $0.7071$', () => close(V.q23DquantumZP, 0.7071, 5e-5)),
      claim('q23DmeasZ', 'the tables of a $z$ reading are $0.5$ apart', () => close(V.q23DmeasZ, 0.5, 1e-9)),
      claim('q23DmeasX', 'the tables of an $x$ reading are $0.5$ apart', () => close(V.q23DmeasX, 0.5, 1e-9)),
      claim('q23DmeasBest', 'the tables of the best axis are $0.7071$ apart', () => close(V.q23DmeasBest, 0.7071, 5e-5)),
      claim('q23DmeasGridMax', 'over $3601$ axes in the $xz$ plane no table distance exceeds $0.7071$', () => close(V.q23DmeasGridMax, 0.7071, 5e-5)),
    ],
  },
  {
    id: 'q23-quantum-compare:b2',
    phase: 'books',
    text:
      `Chapter Q9’s fidelity becomes the cosine picture when the two states commute. Take $\\rho = \\mathrm{diag}(0.5, 0.5)$ and $\\sigma = \\mathrm{diag}(0.9, 0.1)$. ` +
      `Their fidelity is ${d(V.q23FquantumDiag, 3)}, the same number as for the two coins.`,
    formal:
      `$F(\\rho,\\sigma) = \\mathrm{Tr}\\sqrt{\\sigma^{1/2}\\rho\\,\\sigma^{1/2}}$ is symmetric, lies in $[0,1]$, equals 1 only if $\\rho = \\sigma$ and is 0 for [[qc-orthogonal|orthogonal]] supports (Bergou p. 192, Eqs. 11.6–11.7). ` +
      `For commuting states it is $\\sum_x\\sqrt{p_xq_x}$ of the eigenvalue tables: $${d(V.q23FquantumDiag, 4)}$. As for tables, $\\cos^{-1}F$ is a metric and $F$ is not.`,
    caption: 'the biased coin written as a diagonal state',
    captionFormal: '$\\sigma = \\mathrm{diag}(0.9, 0.1)$: the eigenvalue table of the biased coin',
    stage: mx(RHO9),
    claims: [claim('q23FquantumDiag', 'the root fidelity of the two diagonal states is $0.8944$, equal to the coins’ $\\sum_x\\sqrt{p_xq_x}$', () => close(V.q23FquantumDiag, 0.8944, 5e-5) && close(V.q23FquantumDiag, V.q23Fpq, 1e-9)), ...inCoins()],
  },
  {
    id: 'q23-quantum-compare:b3',
    phase: 'books',
    text:
      `For states, the [[qc-quantum-relative-entropy|quantum relative entropy]] is $S(\\rho\\|\\sigma) = \\mathrm{Tr}\\,\\rho(\\log_2\\rho - \\log_2\\sigma)$. If both states are diagonal in one basis, it is the chance-table version. ` +
      `Take $\\rho = \\mathrm{diag}(0.75, 0.25)$ against $\\tfrac12 I$: $${d(V.q23SrelA, 3)}$ bits. The other way round: $${d(V.q23SrelAreverse, 3)}$.`,
    formal:
      `$S(\\rho\\|\\sigma) = \\mathrm{Tr}\\,\\rho\\log_2\\rho - \\mathrm{Tr}\\,\\rho\\log_2\\sigma$, Eq. 3.42, is the [[qc-quantum-relative-entropy|quantum relative entropy]]; it is $+\\infty$ if $\\sigma$ vanishes somewhere $\\rho$ does not (Bergou p. 48). ` +
      `For $[\\rho,\\sigma] = 0$ it is $H(p\\|q)$ of the eigenvalue tables: $S(\\rho\\|\\tfrac12 I) = 1 - S(\\rho) = ${d(V.q23SrelA, 4)}$, with $S(\\rho) = ${d(V.q23SDiag75, 4)}$, and $S(\\tfrac12 I\\|\\rho) = ${d(V.q23SrelAreverse, 4)}$. ` +
      `For $|{+}\\rangle\\langle{+}|$ against $\\mathrm{diag}(0.9, 0.1)$ it is $${d(V.q23SrelPureVsMixed, 4)}$, and in the reverse order it is infinite.`,
    caption: '$\\rho = \\mathrm{diag}(0.75, 0.25)$: its entropy readout, and the gap to the flat state',
    captionFormal: '$S(\\rho) = 0.8113$ bit for $\\rho = \\mathrm{diag}(0.75, 0.25)$, and $S(\\rho\\|\\tfrac12 I) = 1 - S(\\rho)$',
    stage: mx(mix([0.75, k('0')], [0.25, k('1')]), { spectrum: 'entropy' }),
    claims: [
      claim('q23SrelA', 'the relative entropy of $\\mathrm{diag}(0.75, 0.25)$ from $\\tfrac12 I$ is $0.1887$', () => close(V.q23SrelA, 0.1887, 5e-5)),
      claim('q23SrelAreverse', 'and the other way round $0.2075$', () => close(V.q23SrelAreverse, 0.2075, 5e-5)),
      claim('q23SDiag75', 'the entropy of $\\mathrm{diag}(0.75, 0.25)$ is $0.8113$', () => close(V.q23SDiag75, 0.8113, 5e-5)),
      claim('q23SrelPureVsMixed', '$|{+}\\rangle$ against $\\mathrm{diag}(0.9, 0.1)$ gives $1.7370$', () => close(V.q23SrelPureVsMixed, 1.737, 5e-5)),
      claim('q23SrelMixedVsPureInf', 'the reverse order is infinite (flag $1$)', () => V.q23SrelMixedVsPureInf === 1),
      claim('q23InQuarter3', 'the diagonal state has chances $0.75$ and', () => close(V.q23InQuarter3, 0.75, 1e-12)),
      claim('q23InQuarter1', 'and $0.25$', () => close(V.q23InQuarter1, 0.25, 1e-12)),
      ...inCoins(),
    ],
  },
  {
    id: 'q23-quantum-compare:b4',
    phase: 'books',
    text:
      `The [[qc-klein-inequality|Klein inequality]] says $S(\\rho\\|\\sigma) \\ge 0$, with $0$ only if $\\rho = \\sigma$. The idea is to write each state in its own eigenbasis and build a third chance table $r$ from the overlaps. ` +
      `Then $S(\\rho\\|\\sigma) \\ge H(p\\|r) \\ge 0$, and the classical result finishes the proof.`,
    formal:
      `Let $\\rho = \\sum_ip_i|u_i\\rangle\\langle u_i|$, $\\sigma = \\sum_jq_j|v_j\\rangle\\langle v_j|$ and $r_i = \\sum_j|\\langle u_i|v_j\\rangle|^2q_j$ (Bergou pp. 48–49, Eqs. 3.43–3.46; N&C p. 511). Concavity of $\\log$ gives $S(\\rho\\|\\sigma) \\ge \\sum_ip_i\\log\\frac{p_i}{r_i}$, Eq. 3.45, and then $\\ln x \\le x - 1$ gives $\\ge 0$, Eq. 3.46. ` +
      `For $\\rho = \\mathrm{diag}(0.9, 0.1)$ and $\\sigma = \\tfrac12(I + 0.8X)$: $S = ${d(V.q23SrelNC, 3)} \\ge H(p\\|r) = ${d(V.q23KleinH, 3)} \\ge 0$, with $r = (\\tfrac12, \\tfrac12)$. The Corrections box lists a sign slip in the step before Eq. 3.45.`,
    caption: 'same eigenvalues, turned eigenvectors: the chain 1.268, 0.531, 0',
    captionFormal: 'Eq. 3.45: $S(\\rho\\|\\sigma) \\ge H(p\\|r)$, with $r = (\\tfrac12, \\tfrac12)$',
    stage: split(mx(RHO9), ball({ r: [0.8, 0, 0] })),
    claims: [
      claim('q23SrelNC', 'for $\\rho = \\mathrm{diag}(0.9, 0.1)$ and $\\sigma$ of the same eigenvalues along $x$ the quantum relative entropy is $1.268$', () => close(V.q23SrelNC, 1.268, 5e-4)),
      claim('q23KleinH', 'the classical $H(p\\|r)$ of Klein’s chain is $0.5310$', () => close(V.q23KleinH, 0.531, 5e-4)),
      claim('q23KleinR0', 'and the overlap table has first entry $0.5$', () => close(V.q23KleinR0, 0.5, 1e-9)),
      claim('q23InX08', 'the arrow of $\\sigma$ has length $0.8$', () => close(V.q23InX08, 0.8, 1e-12)),
      ...inCoins(),
    ],
    derivation: {
      result: 'S(\\rho\\|\\sigma) \\ge H(p\\|r) \\ge 0',
      ground: [
        {
          tex: 'S(\\rho\\|\\sigma) = \\sum_ip_i(\\log p_i - \\langle u_i|\\log\\sigma|u_i\\rangle)',
          why: 'Write $\\rho$ in its own eigenbasis; the cross term is $\\sigma$’s logarithm seen from each $|u_i\\rangle$.',
          view: mx(RHO9),
          viewCaption: '$\\rho$, diagonal in the $z$ basis',
        },
        {
          tex: '\\langle u_i|\\log\\sigma|u_i\\rangle = \\sum_j|\\langle u_i|v_j\\rangle|^2\\log q_j \\le \\log r_i',
          why: 'That is an average of $\\log q_j$ with weights adding to 1. Since $\\log$ bends down, the average is at most the log of the average.',
          view: ball({ r: [0.8, 0, 0] }),
          viewCaption: '$\\sigma$, an arrow of length 0.8 along $x$',
        },
        {
          tex: '\\sum_ip_i\\log\\tfrac{p_i}{r_i} = H(p\\|r)\\ \\Rightarrow\\ S(\\rho\\|\\sigma) \\ge H(p\\|r) \\ge 0',
          why: 'Put the inequality into the sum; what remains is a classical relative entropy, which is never negative (Unit 23.1).',
        },
      ],
      formal: [
        {
          tex: 'S(\\rho\\|\\sigma) = \\sum_ip_i(\\log p_i - \\langle u_i|\\log\\sigma|u_i\\rangle)',
          why: 'Eq. 3.44, in the eigenbasis of $\\rho$.',
          view: mx(RHO9),
          viewCaption: '$\\rho$, diagonal in the $z$ basis',
        },
        {
          tex: '\\langle u_i|\\log\\sigma|u_i\\rangle \\le \\log r_i',
          why: 'Concavity of the logarithm (Eq. 3.45).',
          view: ball({ r: [0.8, 0, 0] }),
          viewCaption: '$\\sigma$, an arrow of length 0.8 along $x$',
        },
        {
          tex: 'S(\\rho\\|\\sigma) \\ge H(p\\|r) \\ge 0',
          why: 'The classical inequality of Unit 23.1 (Eq. 3.46).',
        },
      ],
    },
  },
  {
    id: 'q23-quantum-compare:b5',
    phase: 'clue',
    text: 'Two states have the same eigenvalues, $0.9$ and $0.1$, but their eigenvectors point along different axes. Is $S(\\rho\\|\\sigma)$ zero?',
    formal: 'Take $\\rho = \\mathrm{diag}(0.9, 0.1)$ and $\\sigma = \\tfrac12(I + 0.8X)$, with the same eigenvalue table. Compare $S(\\rho\\|\\sigma)$ with the classical $H$ of the two tables.',
    caption: 'same spectrum, turned axes: $\\rho$ first',
    captionFormal: '$\\rho = \\mathrm{diag}(0.9, 0.1)$, then $\\sigma$ with the same eigenvalues along $x$',
    stage: mx(RHO9),
    reveal: {
      text: `No: ${d(V.q23SrelSameEig, 3)} bits. The classical formula on the two eigenvalue lists would say $${d(V.q23HeigSame, 0)}$. Turning the eigenvectors counts.`,
      formal: `$S(\\rho\\|\\sigma) = ${d(V.q23SrelSameEig, 3)}$, against $H(p\\|p) = ${d(V.q23HeigSame, 0)}$ for the identical tables: the quantum quantity is not the classical $H$ of anything read off the eigenvalues alone. This is what the Corrections box says about the sentence after Eq. 11.4.`,
      caption: 'the same eigenvalues, now along $x$',
      captionFormal: '$\\sigma = 0.9|{+}\\rangle\\langle{+}| + 0.1|{-}\\rangle\\langle{-}|$',
      stage: mx(mix([0.9, k('+')], [0.1, k('-')])),
      claims: [
        claim('q23SrelSameEig', 'the relative entropy of the two states with one eigenvalue table is $1.268$', () => close(V.q23SrelSameEig, 1.268, 5e-4)),
        claim('q23HeigSame', 'and the classical $H$ of the two identical eigenvalue tables is $0$', () => close(V.q23HeigSame, 0, 1e-12)),
        ...inCoins(),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q23-entropy-props — What entropy can and cannot do                                                */
/* ---------------------------------------------------------------------------------------------- */

const entropyProps: Beat[] = [
  {
    id: 'q23-entropy-props:b1',
    phase: 'books',
    text:
      `A $d$-level system has entropy at most $\\log_2d$. Compare the state with the flat state $I/d$: the relative entropy is $\\log_2d - S(\\rho)$, and it cannot be negative. ` +
      `A four-level state with chances $0.4, 0.3, 0.2, 0.1$ has $S = ${d(V.q23S4Level, 3)}$ of at most $2$.`,
    formal:
      `$0 \\le S(\\rho) \\le \\log_2d$ (Bergou p. 49, Eq. 3.47; <<qc-q9-entropy|Unit 9.3>>): with $\\sigma = I/d$, $S(\\rho\\|I/d) = \\log_2d - S(\\rho) \\ge 0$ by Klein, with equality only for $\\rho = I/d$, the [[qc-maximally-mixed|maximally mixed]] state. ` +
      `The engine gives $S = ${d(V.q23S4Level, 4)}$ for $\\rho = \\mathrm{diag}(0.4, 0.3, 0.2, 0.1)$, and the two sides of $S(\\rho\\|I/4) = 2 - S(\\rho)$ differ by $${d(V.q23SMaxGap, 0)}$.`,
    caption: 'a four-level diagonal state and its entropy readout',
    captionFormal: '$\\rho = \\mathrm{diag}(0.4, 0.3, 0.2, 0.1)$: $S = 1.8464$ against the largest value 2',
    stage: mx(mix([0.4, k('00')], [0.3, k('01')], [0.2, k('10')], [0.1, k('11')]), { spectrum: 'entropy' }),
    claims: [
      claim('q23S4Level', 'the four-level state has entropy $1.8464$ bits', () => close(V.q23S4Level, 1.8464, 5e-5)),
      claim('q23SMaxGap', 'and $S(\\rho\\|I/4)$ equals $2 - S(\\rho)$ to engine precision', () => close(V.q23SMaxGap, 0, 1e-12)),
      claim('q23InL1', 'the four chances are $0.4$,', () => close(V.q23InL1, 0.4, 1e-12)),
      claim('q23InL2', '$0.3$,', () => close(V.q23InL2, 0.3, 1e-12)),
      claim('q23InL3', '$0.2$', () => close(V.q23InL3, 0.2, 1e-12)),
      claim('q23InL4', 'and $0.1$', () => close(V.q23InL4, 0.1, 1e-12)),
    ],
    derivation: {
      result: 'S(\\rho\\|I/d) = \\log_2d - S(\\rho) \\ge 0',
      ground: [
        {
          tex: '\\log(I/d) = -\\log d\\cdot I',
          why: 'The flat state is the same number $1/d$ on every diagonal place, so its logarithm is the same number everywhere.',
          view: mx(mix([0.4, k('00')], [0.3, k('01')], [0.2, k('10')], [0.1, k('11')]), { spectrum: 'entropy' }),
          viewCaption: 'a four-level state: entropy 1.846',
        },
        {
          tex: 'S(\\rho\\|I/d) = -S(\\rho) + \\log_2d',
          why: 'Put it into the definition: the first term is minus the entropy, the second is $\\log d$ times the trace, which is 1.',
        },
        {
          tex: 'S(\\rho\\|I/d) \\ge 0\\ \\Rightarrow\\ \\log_2d - S(\\rho) \\ge 0',
          why: 'Klein’s inequality: so $S(\\rho) \\le \\log_2d$, with equality only for the flat state.',
          view: mx(mix([0.25, k('00')], [0.25, k('01')], [0.25, k('10')], [0.25, k('11')]), { spectrum: 'entropy' }),
          viewCaption: 'the flat state: entropy 2',
        },
      ],
      formal: [
        {
          tex: 'S(\\rho\\|I/d) = -S(\\rho) - \\mathrm{Tr}\\,\\rho\\log_2(I/d)',
          why: 'The definition of Eq. 3.42 with $\\sigma = I/d$.',
          view: mx(mix([0.4, k('00')], [0.3, k('01')], [0.2, k('10')], [0.1, k('11')]), { spectrum: 'entropy' }),
          viewCaption: 'a four-level state: entropy 1.846',
        },
        {
          tex: 'S(\\rho\\|I/d) = \\log_2d - S(\\rho) \\ge 0',
          why: '$\\log_2(I/d) = -\\log_2d\\cdot I$ and $\\mathrm{Tr}\\,\\rho = 1$; the sign is Klein’s inequality.',
          view: mx(mix([0.25, k('00')], [0.25, k('01')], [0.25, k('10')], [0.25, k('11')]), { spectrum: 'entropy' }),
          viewCaption: 'the flat state: entropy 2',
        },
      ],
    },
  },
  {
    id: 'q23-entropy-props:b2',
    phase: 'books',
    text:
      `Label which of several states was made, in an extra register. The entropy is the label’s entropy plus the average entropy of the states. ` +
      `A fair label with $\\tfrac12 I$ or $|{+}\\rangle$ gives $1 + \\tfrac12\\cdot1 + \\tfrac12\\cdot0 = ${d(V.q23SBlock, 1)}$ bits.`,
    formal:
      `$S(\\sum_ip_i|i\\rangle\\langle i|\\otimes\\rho_i) = H(\\{p_i\\}) + \\sum_ip_iS(\\rho_i)$ (Bergou p. 49, Eq. 3.48), because the eigenvalues are $p_i\\lambda_{ij}$ (Eq. 3.49). ` +
      `Example: $\\tfrac12|0\\rangle\\langle0|\\otimes\\tfrac12I + \\tfrac12|1\\rangle\\langle1|\\otimes|{+}\\rangle\\langle{+}|$ has $S = ${d(V.q23SBlock, 4)}$ both by its eigenvalues and by the formula.`,
    caption: 'the label wire and the state wire: entropy 1.5',
    captionFormal: 'eigenvalue bars $\\tfrac14, \\tfrac14, \\tfrac12$ and $0$: $S = 1.5000$',
    stage: mx(mix([0.25, k('00')], [0.25, k('01')], [0.5, k('1+')]), { spectrum: 'entropy' }),
    claims: [
      claim('q23SBlock', 'the label-plus-state entropy is $1.5$ bits, by eigenvalues and by the formula', () => close(V.q23SBlock, 1.5, 1e-9)),
      claim('q23InFair', 'the label is fair: each value has chance $0.5$', () => close(V.q23InFair, 0.5, 1e-12)),
      claim('q23InQuarter1', 'the two states of the first label value have chance $0.25$ each', () => close(V.q23InQuarter1, 0.25, 1e-12)),
    ],
  },
  {
    id: 'q23-entropy-props:b3',
    phase: 'books',
    text:
      `The whole is never more uncertain than its parts added: $S(AB) \\le S(A) + S(B)$. A Bell pair gives $0 \\le 1 + 1$. ` +
      `The missing ${d(V.q23SubaddGap, 0)} bits are the correlation, named in Unit 23.5. This rule is called [[qc-subadditivity|subadditivity]].`,
    formal:
      `Apply Klein with $\\rho = \\rho_{AB}$ and $\\sigma = \\rho_A\\otimes\\rho_B$: $S(\\rho_{AB}\\|\\rho_A\\otimes\\rho_B) = S(A) + S(B) - S(AB) \\ge 0$ (Bergou p. 50, Eqs. 3.50–3.53, the entropy triangle inequality; [[qc-subadditivity|subadditivity]]). ` +
      `Problem 2 asks for the relative-entropy form of the mutual information; it is this line, cited and not worked. For a Bell pair $S(AB) = 0$, $S(A) + S(B) = 2$ and the gap is $${d(V.q23SubaddGap, 0)}$.`,
    caption: 'a Bell pair, and the entropy of one half',
    captionFormal: 'a Bell pair: one half has entropy 1 while the whole has entropy 0',
    stage: mx({ rho: { ket: b('00+11') } }, { partialTrace: 'B', spectrum: 'entropy' }),
    claims: [claim('q23SubaddGap', 'the gap $S(A) + S(B) - S(AB)$ of a Bell pair is $2$ bits', () => close(V.q23SubaddGap, 2, 1e-9))],
  },
  {
    id: 'q23-entropy-props:b4',
    phase: 'books',
    text:
      `Mixing states never lowers entropy below the average of the parts. Take $|0\\rangle$ and $|{+}\\rangle$, each pure, and mix them half and half. ` +
      `The parts have entropy $0$ and the mixture has $${d(V.q23SConcaveMix, 3)}$. This rule is [[qc-concavity-of-entropy|concavity of entropy]], and the half-and-half state is a [[qc-mixture|mixture]] of the two.`,
    formal:
      `$S(\\sum_ip_i\\rho_i) \\ge \\sum_ip_iS(\\rho_i)$ (Bergou pp. 50–51, Eq. 3.54; [[qc-concavity-of-entropy|concavity of entropy]]). Attach a register with $\\rho_{AB} = \\sum_ip_i\\rho_i\\otimes|i\\rangle\\langle i|$ and use Eq. 3.48 with subadditivity: $H(\\{p\\}) + \\sum_ip_iS(\\rho_i) \\le S(\\sum_ip_i\\rho_i) + H(\\{p\\})$, Eq. 3.55. ` +
      `For the [[qc-mixture|mixture]] $\\tfrac12(|0\\rangle\\langle0| + |{+}\\rangle\\langle{+}|)$ the entropy is $${d(V.q23SConcaveMix, 4)}$ and the average is $${d(V.q23SConcaveAvg, 0)}$. That gap is the Holevo $\\chi$ of Unit 23.6.`,
    caption: 'the mix of $|0\\rangle$ and $|{+}\\rangle$: a point inside the ball',
    captionFormal: 'the half-and-half state $\\tfrac12(|0\\rangle\\langle0| + |{+}\\rangle\\langle{+}|)$ as a point inside the ball',
    stage: PAIR_BALL(),
    claims: [
      claim('q23SConcaveMix', 'the half-and-half mixture of $|0\\rangle$ and $|{+}\\rangle$ has entropy $0.6009$', () => close(V.q23SConcaveMix, 0.6009, 5e-5)),
      claim('q23SConcaveAvg', 'while the average entropy of its two pure parts is $0$', () => close(V.q23SConcaveAvg, 0, 1e-12)),
      claim('q23InFair', 'the two parts have chance $0.5$ each', () => close(V.q23InFair, 0.5, 1e-12)),
    ],
  },
  {
    id: 'q23-entropy-props:b5',
    phase: 'books',
    text:
      `A deeper rule, stated here without proof, is [[qc-strong-subadditivity|strong subadditivity]]: $S(A) + S(B) \\le S(AC) + S(BC)$ and $S(ABC) + S(B) \\le S(AB) + S(BC)$. ` +
      `Check it on half a $W$ state plus half $|000\\rangle$: $${d(V.q23SsaLhs1, 3)}$ is at most $${d(V.q23SsaRhs1, 3)}$, and $${d(V.q23SsaLhs2, 3)}$ is at most $${d(V.q23SsaRhs2, 3)}$.`,
    formal:
      `Bergou p. 195, Eq. 11.18, with a proof in N&C pp. 519–521: $S(\\rho_{ABC}) + S(\\rho_B) \\le S(\\rho_{AB}) + S(\\rho_{BC})$ is [[qc-strong-subadditivity|strong subadditivity]]. ` +
      `For $\\rho_{ABC} = \\tfrac12|W\\rangle\\langle W| + \\tfrac12|000\\rangle\\langle000|$: $S(A) = S(B) = ${d(V.q23SsaMixSA, 4)}$, $S(AC) = S(BC) = S(AB) = ${d(V.q23SsaMixSAC, 4)}$ and $S(ABC) = ${d(V.q23SsaMixS, 0)}$. The two gaps are $${d(V.q23SsaGap1, 4)}$ and $${d(V.q23SsaGap2, 4)}$, both positive.`,
    caption: 'the three-wire state and the entropy of one wire',
    captionFormal: '$\\rho_{ABC}$ with the entropy of $\\rho_A$: $0.6500$',
    stage: mx(mix([0.5, { circuit: C_W3, upTo: 1 }], [0.5, k('000')]), { partialTrace: { keep: [0] }, spectrum: 'entropy' }),
    claims: [
      claim('q23SsaMixSA', 'one wire of the state has entropy $0.6500$', () => close(V.q23SsaMixSA, 0.65, 5e-5)),
      claim('q23SsaMixSAC', 'two wires have entropy $0.9183$', () => close(V.q23SsaMixSAC, 0.9183, 5e-5)),
      claim('q23SsaMixS', 'and all three have entropy $1$', () => close(V.q23SsaMixS, 1, 1e-9)),
      claim('q23SsaLhs1', 'the first left side is $1.300$', () => close(V.q23SsaLhs1, 1.3, 5e-4)),
      claim('q23SsaRhs1', 'and the first right side $1.837$', () => close(V.q23SsaRhs1, 1.8366, 5e-4)),
      claim('q23SsaLhs2', 'the second left side is $1.650$', () => close(V.q23SsaLhs2, 1.65, 5e-4)),
      claim('q23SsaRhs2', 'and the second right side $1.837$', () => close(V.q23SsaRhs2, 1.8366, 5e-4)),
      claim('q23SsaGap1', 'the first gap is $0.5366$', () => close(V.q23SsaGap1, 0.5366, 1e-4)),
      claim('q23SsaGap2', 'the second gap is $0.1866$', () => close(V.q23SsaGap2, 0.1866, 1e-4)),
      claim('q23InFair', 'the mixture is half and half: weights $0.5$', () => close(V.q23InFair, 0.5, 1e-12)),
    ],
  },
  {
    id: 'q23-entropy-props:b6',
    phase: 'clue',
    text: 'For two coins, $H(X,Y) \\ge H(X)$: the pair is at least as uncertain as one coin. Is $S(AB) \\ge S(A)$ for a Bell pair?',
    formal: 'Evaluate $S(AB)$, $S(A)$ and $S(A|B) = S(AB) - S(B)$ for a Bell pair (<<qc-q12-entropy|Unit 12.5>>).',
    caption: 'a Bell pair: whole 0, half 1',
    captionFormal: 'a Bell pair: the readout is the entropy of one half',
    stage: mx({ rho: { ket: b('00+11') } }, { partialTrace: 'B', spectrum: 'entropy' }),
    reveal: {
      text: `No: $S(AB) = ${d(V.q23SBell, 0)}$ is below $S(A) = ${d(V.q23SBellA, 0)}$. The whole is less uncertain than a part. Subadditivity still holds: $0 \\le 2$.`,
      formal: `$S(AB) = ${d(V.q23SBell, 0)}$, $S(A) = ${d(V.q23SBellA, 0)}$ and $S(A|B) = ${d(V.q23SCondBell, 0)}$: the classical inequality $H(X,Y) \\ge H(X)$ fails for quantum states (Chapter Q12), while subadditivity $S(AB) \\le S(A) + S(B)$ survives.`,
      caption: 'the same pair: whole 0, half 1',
      captionFormal: 'the same pair, with $S(AB) = 0$ and $S(A|B) = -1$',
      stage: mx({ rho: { ket: b('00+11') } }, { partialTrace: 'B', spectrum: 'entropy' }),
      claims: [
        claim('q23SBell', 'a Bell pair has total entropy $0$', () => close(V.q23SBell, 0, 1e-9)),
        claim('q23SBellA', 'one half has entropy $1$', () => close(V.q23SBellA, 1, 1e-9)),
        claim('q23SCondBell', 'and the conditional entropy $S(A|B)$ is $-1$', () => close(V.q23SCondBell, -1, 1e-9)),
        claim('q23SubaddGap', 'the subadditivity gap is $2$', () => close(V.q23SubaddGap, 2, 1e-9)),
      ],
    },
  },
]

export const PART_ONE_UNITS = { 'q23-classical-compare': classicalCompare, 'q23-quantum-compare': quantumCompare, 'q23-entropy-props': entropyProps }

/* ---------------------------------------------------------------------------------------------- */
/* q23-two-variables — Two chances at once: joint, conditional, mutual                                */
/* ---------------------------------------------------------------------------------------------- */

/** The noisy wire's four joint chances, and the marginal of the sent bit alone (wire 0). */
const BSC_BARS = amp(C_BSC, 1, 'probability')
const BSC_SENT = amp(C_BSC, 1, 'probability', { keep: [0] })
const CAP_CURVE = (markers: number[] = [], extra: Partial<Omit<PlotState, 'kind' | 'curve' | 'markers'>> = {}): PlotState => plot({ fn: 'bscCapacity', x: { from: 0, to: 0.5 } }, markers, extra)
/** The Bell pair and the entropy of one half (the readout of a partial trace over B). */
const BELL_HALF = mx({ rho: { ket: b('00+11') } }, { partialTrace: 'B', spectrum: 'entropy' })

const twoVariables: Beat[] = [
  {
    id: 'q23-two-variables:b1',
    phase: 'books',
    text:
      `A noisy wire: a bit $x$ goes in and a bit $y$ comes out. With chance $0.1$ the wire flips it, as in <<qc-q21-classical|Unit 21.1>>. For a fair input the four joint chances are $${d(V.q23BscJoint00, 2)}, ${d(V.q23BscJoint01, 2)}, ${d(V.q23BscJoint01, 2)}, ${d(V.q23BscJoint00, 2)}$. ` +
      `The [[qc-joint-entropy|joint entropy]] of the pair is $${d(V.q23JointH, 3)}$ bits. Given the input, the output is a coin with flip chance $0.1$, whose uncertainty is the [[qc-binary-entropy|binary entropy]] $h(0.1) = ${d(V.q23HYgX, 3)}$.`,
    formal:
      `$H(X,Y) = -\\sum_{x,y}p(x,y)\\log_2p(x,y)$, Eq. 11.10, is the [[qc-joint-entropy|joint entropy]]. $H(Y|X) = \\sum_xp_X(x)H(Y|X = x)$ is the classical twin of the [[qc-conditional-entropy|conditional entropy]] of <<qc-q12-entropy|Unit 12.5>>, and $H(X,Y) = H(X) + H(Y|X)$ is the chain rule (Bergou p. 193, Eqs. 11.11–11.12). ` +
      `For the binary symmetric channel with flip chance $f = 0.1$ and a uniform input: $H(X,Y) = ${d(V.q23JointH, 4)}$, $H(X) = ${d(V.q23HX, 0)}$ and $H(Y|X) = h(0.1) = ${d(V.q23HYgX, 4)}$.`,
    caption: 'the four joint chances of (sent, received) as bars',
    captionFormal: '$p(x,y)$ for flip chance $f = 0.1$ and a fair input',
    stage: BSC_BARS,
    claims: [
      claim('q23JointH', 'the joint entropy of the noisy wire is $1.4690$ bits', () => close(V.q23JointH, 1.469, 5e-5)),
      claim('q23HX', 'the sent bit has entropy $1$', () => close(V.q23HX, 1, 1e-9)),
      claim('q23HYgX', 'and given it the received bit has entropy $0.4690$', () => close(V.q23HYgX, 0.469, 5e-5)),
      claim('q23BscJoint00', 'the joint chance of (0 sent, 0 received) is $0.45$', () => close(V.q23BscJoint00, 0.45, 1e-9)),
      claim('q23BscJoint01', 'and of (0 sent, 1 received) $0.05$', () => close(V.q23BscJoint01, 0.05, 1e-9)),
      claim('q23InFlip', 'the wire flips a bit with chance $0.1$', () => close(V.q23InFlip, 0.1, 1e-12)),
    ],
    derivation: {
      result: 'H(X,Y) = H(X) + H(Y|X)',
      ground: [
        {
          tex: 'p(x,y) = p_X(x)\\,p(y|x)',
          why: 'The chance of both is the chance of the first times the chance of the second given the first.',
          view: BSC_BARS,
          viewCaption: 'the joint chances',
        },
        {
          tex: '-\\sum p(x,y)\\log p(x,y) = -\\sum p(x,y)\\log p_X(x) - \\sum p(x,y)\\log p(y|x)',
          why: 'The logarithm of a product is a sum, so the entropy splits into two sums.',
          view: BSC_SENT,
          viewCaption: 'the chances of the sent bit alone',
        },
        {
          tex: 'H(X,Y) = H(X) + H(Y|X)',
          why: 'Adding over $y$ turns the first sum into the entropy of $x$; the second is the average entropy of $y$ given $x$.',
        },
      ],
      formal: [
        {
          tex: 'H(X,Y) = -\\sum_{x,y}p(x,y)\\log_2[p_X(x)\\,p(y|x)]',
          why: 'Write the joint chance as a product (Eq. 11.12).',
          view: BSC_BARS,
          viewCaption: 'the joint chances',
        },
        {
          tex: 'H(X,Y) = H(X) + H(Y|X)',
          why: 'Sum over $y$ first: the marginal of $x$ appears.',
          view: BSC_SENT,
          viewCaption: 'the chances of the sent bit alone',
        },
      ],
    },
  },
  {
    id: 'q23-two-variables:b2',
    phase: 'books',
    introduces: ['qc-mutual-information'],
    text:
      `How much does $y$ tell about $x$? The [[qc-mutual-information|mutual information]] is $I(X{:}Y) = H(X) + H(Y) - H(X,Y) = 1 + 1 - ${d(V.q23JointH, 3)} = ${d(V.q23Imutual, 3)}$ bits. ` +
      `It is also how far the true table sits from the table of two independent variables.`,
    formal:
      `$I(X{:}Y) = H(p_{XY}\\|p_Xp_Y) = H(X) - H(X|Y) = H(Y) - H(Y|X) = H(X) + H(Y) - H(X,Y)$, Eqs. 11.13–11.16, is the [[qc-mutual-information|mutual information]]; it is symmetric in $X$ and $Y$. ` +
      `For the binary symmetric channel it is $${d(V.q23Imutual, 4)}$ by the sum and $${d(V.q23ImutualAsRel, 4)}$ by the relative entropy. Independent variables give $0$; perfectly correlated ones give $H(X) = ${d(V.q23ImutualCorr, 0)}$ (Bergou p. 194).`,
    caption: 'the joint chances beside the table of independent chances: all four boxes one quarter',
    captionFormal: '$I = H(p_{XY}\\|p_Xp_Y)$: the true table against the product of its marginals',
    stage: split(BSC_BARS, tbl({ table: { classical: 'independent', pA: 0.5, pB: 0.5 } })),
    claims: [
      claim('q23Imutual', 'the noisy wire’s mutual information is $0.5310$ bits', () => close(V.q23Imutual, 0.531, 5e-5)),
      claim('q23ImutualAsRel', 'and the relative entropy of its joint table from the independent one is the same $0.5310$', () => close(V.q23ImutualAsRel, 0.531, 5e-5) && close(V.q23ImutualAsRel, V.q23Imutual, 1e-12)),
      claim('q23ImutualCorr', 'two perfectly correlated fair bits share $1$ bit', () => close(V.q23ImutualCorr, 1, 1e-9)),
      claim('q23JointH', 'the joint entropy is $1.469$', () => close(V.q23JointH, 1.469, 5e-4)),
      claim('q23HX', 'and each bit has entropy $1$', () => close(V.q23HX, 1, 1e-9)),
    ],
  },
  {
    id: 'q23-two-variables:b3',
    phase: 'books',
    text:
      `A channel is a table $p(y|x)$ of what comes out for each input. The most it can tell, over all ways of feeding it, is its [[qc-channel-capacity|capacity]]. ` +
      `For the wire with flip chance $0.1$ it is $1 - h(0.1) = ${d(V.q23BscCap, 3)}$ bits per use, reached by fair inputs. At flip chance one half it is $0$.`,
    formal:
      `$C = \\max_{p_X}I(X{:}Y)$ is the [[qc-channel-capacity|capacity]]: the largest rate of reliable communication (Bergou p. 194; the coding theorem is stated there, after a long proof the book omits). ` +
      `For the binary symmetric channel $C = 1 - h(f)$, at $p_X = (\\tfrac12, \\tfrac12)$ (a grid of $1001$ inputs puts the maximum at $${d(V.q23BscCapArg, 1)}$). Flip chance $0.25$ gives $${d(V.q23BscCap25, 4)}$, $0.11$ gives $${d(V.q23BscCap11, 4)}$, and $\\tfrac12$ gives $${d(V.q23BscCapHalf, 0)}$.`,
    caption: 'capacity against the flip chance: 0.531 at 0.1, zero at one half',
    captionFormal: '$C(f) = 1 - h(f)$ on $0 \\le f \\le \\tfrac12$, marked at $f = 0.1$',
    stage: CAP_CURVE([0.1]),
    claims: [
      claim('q23BscCap', 'the capacity of the wire with flip chance $0.1$ is $0.5310$ bits per use', () => close(V.q23BscCap, 0.531, 5e-5)),
      claim('q23BscCapArg', 'it is reached by the fair input $0.5$', () => close(V.q23BscCapArg, 0.5, 1e-9)),
      claim('q23BscCap25', 'at flip chance $0.25$ it is $0.1887$', () => close(V.q23BscCap25, 0.1887, 5e-5)),
      claim('q23BscCap11', 'at flip chance $0.11$ it is $0.5001$', () => close(V.q23BscCap11, 0.5001, 5e-5)),
      claim('q23BscCapHalf', 'and at flip chance one half it is $0$', () => close(V.q23BscCapHalf, 0, 1e-9)),
      claim('q23InFlip', 'the first wire flips a bit with chance $0.1$', () => close(V.q23InFlip, 0.1, 1e-12)),
      claim('q23InFlip11', 'a second wire flips a bit with chance $0.11$', () => close(V.q23InFlip11, 0.11, 1e-12)),
    ],
  },
  {
    id: 'q23-two-variables:b4',
    phase: 'books',
    text:
      `Three copies and a majority vote turn flip chance $0.1$ into $${d(V.q23Rep3Fail, 3)}$, at a third of the speed. ` +
      `The capacity, $${d(V.q23BscCap, 3)}$ bits per use, says that cleverer codes can go much faster than a third.`,
    formal:
      `Repetition-3 on this wire has block error $3f^2(1 - f) + f^3 = ${d(V.q23Rep3Fail, 3)}$ and rate $\\tfrac13$ bit per use (Chapter Q21). Shannon’s theorem, stated on Bergou p. 194, says every rate below $C = ${d(V.q23BscCap, 4)}$ is reachable with error as small as we like; the vote is far from that ceiling.`,
    caption: 'the capacity curve, and one third of a bit per use well below it',
    captionFormal: 'the capacity curve of the same wire: the vote’s rate $\\tfrac13$ sits far under $C(0.1)$',
    stage: CAP_CURVE([0.1], { yLines: [{ y: V.q23Rep3Rate, label: 'three copies' }] }),
    claims: [
      claim('q23Rep3Fail', 'three copies and a majority vote fail with chance $0.028$', () => close(V.q23Rep3Fail, 0.028, 1e-9)),
      claim('q23Rep3Rate', 'at rate $\\tfrac13$ bit per use', () => close(V.q23Rep3Rate, 1 / 3, 1e-9)),
      claim('q23BscCap', 'the capacity is $0.5310$', () => close(V.q23BscCap, 0.531, 5e-5)),
      claim('q23InFlip', 'the flip chance is $0.1$', () => close(V.q23InFlip, 0.1, 1e-12)),
    ],
  },
  {
    id: 'q23-two-variables:b5',
    phase: 'clue',
    text: 'A dealer hands two people a penny and a dime at random. Another table has two separate dealers, one coin each. Which pair of coins shares more information?',
    formal: 'Compute $I(X{:}Y)$ for the one-dealer table and for two independent fair coins.',
    caption: 'the two tables of chances',
    captionFormal: 'the dealer table: only the two off-diagonal boxes are used',
    stage: tbl({ table: { classical: 'dealer' } }),
    reveal: {
      text: `One dealer: $${d(V.q23IDealer, 0)}$ bit; knowing one coin tells the other. Two dealers: $${d(V.q23IIndep, 0)}$.`,
      formal: `Dealer table: $p(+,-) = p(-,+) = \\tfrac12$, so $I = H(X) = ${d(V.q23IDealer, 0)}$ (Eq. 11.14). Independent fair coins: every box is $\\tfrac14$ and $I = ${d(V.q23IIndep, 0)}$.`,
      caption: 'two separate dealers: every box one quarter',
      captionFormal: 'independent fair coins: all four boxes $\\tfrac14$',
      stage: tbl({ table: { classical: 'independent', pA: 0.5, pB: 0.5 } }),
      claims: [
        claim('q23IDealer', 'one dealer gives the two coins $1$ bit of mutual information', () => close(V.q23IDealer, 1, 1e-9)),
        claim('q23IIndep', 'two independent fair coins share $0$', () => close(V.q23IIndep, 0, 1e-12)),
        claim('q23InQuarter1', 'each box of the independent table holds $0.25$', () => close(V.q23InQuarter1, 0.25, 1e-12)),
        claim('q23InFair', 'and each coin is fair, $0.5$', () => close(V.q23InFair, 0.5, 1e-12)),
      ],
    },
  },
  {
    id: 'q23-two-variables:b6',
    phase: 'deeper',
    text: 'Quantum channels have a capacity for classical bits too. The Holevo–Schumacher–Westmoreland theorem gives it. We name it and do not prove it.',
    formal: 'The coding theorem for sending classical bits through a quantum channel, due to Holevo, Schumacher and Westmoreland, has the one-letter bound of Unit 23.6’s $\\chi$ as its core. It is named here, not derived (N&C pp. 531 ff.).',
    caption: 'the classical capacity curve again',
    captionFormal: 'the classical curve $C(f)$, for comparison with what a quantum channel can carry',
    stage: CAP_CURVE(),
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q23-quantum-mutual — Quantum correlations that noise cannot raise                                  */
/* ---------------------------------------------------------------------------------------------- */

const NOISY_PAIR = mx(mix([0.9, b('00+11')], [0.1, b('00-11')]), { spectrum: 'entropy' })
const DEPH_PICTURE = split(circ(C_DEPH, 4), mx({ rho: { ket: { circuit: C_DEPH, upTo: 4 } } }, { partialTrace: { keep: [0, 1] }, spectrum: 'entropy' }))
const GHZ_PICTURE = split(circ(C_GHZ, 3), mx({ rho: { ket: { circuit: C_GHZ, upTo: 3 } } }, { partialTrace: { keep: [0, 1] }, spectrum: 'entropy' }))

const quantumMutual: Beat[] = [
  {
    id: 'q23-quantum-mutual:b1',
    phase: 'books',
    text:
      `The same recipe for quantum systems gives the [[qc-quantum-mutual-information|quantum mutual information]]: $S(A{:}B) = S(A) + S(B) - S(AB)$. A Bell pair gives $1 + 1 - 0 = ${d(V.q23IBell, 0)}$ bits, twice what two classical bits can share. ` +
      `It also equals $S(A) - S(A|B)$, where <<qc-q12-entropy|Unit 12.5>> taught the conditional entropy.`,
    formal:
      `$S(A|B) = S(\\rho_{AB}) - S(\\rho_B)$ and the [[qc-quantum-mutual-information|quantum mutual information]] is $S(A{:}B) = S(\\rho_A) + S(\\rho_B) - S(\\rho_{AB}) = S(A) - S(A|B)$, Eq. 11.17 (N&C p. 514); <<qc-q12-entropy|Unit 12.5>> owns the conditional entropy. ` +
      `For a Bell pair $S(A|B) = ${d(V.q23SCondBell, 0)}$ and $S(A{:}B) = ${d(V.q23IBell, 0)}$; a classical pair of fair bits reaches only $${d(V.q23ImutualCorr, 0)}$.`,
    caption: 'a Bell pair: whole entropy 0, one half entropy 1',
    captionFormal: 'a Bell pair, with the entropy of one half read out: $S(A) = 1$ and $S(AB) = 0$',
    stage: BELL_HALF,
    claims: [
      claim('q23IBell', 'a Bell pair has quantum mutual information $2$ bits', () => close(V.q23IBell, 2, 1e-9)),
      claim('q23SCondBell', 'and conditional entropy $-1$', () => close(V.q23SCondBell, -1, 1e-9)),
      claim('q23ImutualCorr', 'a classical pair of fair bits shares at most $1$', () => close(V.q23ImutualCorr, 1, 1e-9)),
    ],
  },
  {
    id: 'q23-quantum-mutual:b2',
    phase: 'books',
    text:
      `Noise on Bob’s half: with chance $p$ apply $Z$, a phase flip. At $p = 0.1$ the pair $0.9\\,\\Phi^+ + 0.1\\,\\Phi^-$ has $S(AB) = ${d(V.q23SDeph01, 3)}$, so $S(A{:}B) = 1 + 1 - ${d(V.q23SDeph01, 3)} = ${d(V.q23IDeph01, 3)}$. ` +
      `At $p = \\tfrac12$ only $1$ is left.`,
    formal:
      `$\\rho_{AB}(p) = (1 - p)\\Phi^+ + p\\,\\Phi^-$, with $\\Phi^\\pm = (|00\\rangle \\pm |11\\rangle)/\\sqrt2$ in the course’s names (Bergou swaps the letters $\\Phi$ and $\\Psi$), has $S(AB) = h(p)$ and $S(A) = S(B) = 1$. So $S(A{:}B) = 2 - h(p)$: $${d(V.q23IDeph01, 4)}$ at $p = 0.1$ and $${d(V.q23IDeph05, 0)}$ at $p = \\tfrac12$, the classical correlation of $|00\\rangle$ and $|11\\rangle$ only. ` +
      `Problem 3 uses a depolarizing channel instead: cited, not worked.`,
    caption: 'the noisy pair’s matrix and its entropy readout',
    captionFormal: '$\\rho_{AB}(0.1)$ with $S(AB) = h(0.1) = 0.469$ read out',
    stage: NOISY_PAIR,
    claims: [
      claim('q23SDeph01', 'the pair with a phase error of chance $0.1$ has entropy $0.469$', () => close(V.q23SDeph01, 0.469, 5e-4)),
      claim('q23IDeph01', 'its quantum mutual information is $1.531$', () => close(V.q23IDeph01, 1.531, 5e-4)),
      claim('q23IDeph05', 'and with a phase error of chance one half it is $1$', () => close(V.q23IDeph05, 1, 1e-9)),
      claim('q23InFlip', 'the phase error has chance $0.1$', () => close(V.q23InFlip, 0.1, 1e-12)),
      claim('q23InFlipKeep', 'and the pair keeps its phase with chance $0.9$', () => close(V.q23InFlipKeep, 0.9, 1e-12)),
      claim('q23InFair', 'at flip chance one half the weights are $0.5$', () => close(V.q23InFair, 0.5, 1e-12)),
    ],
  },
  {
    id: 'q23-quantum-mutual:b3',
    phase: 'books',
    text:
      `Throwing a system away cannot make the others more correlated: $S(A{:}B) \\le S(A{:}BC)$. In the three-qubit [[ghz-state|GHZ state]], $S(A{:}B) = ${d(V.q23IGhzAB, 0)}$ but $S(A{:}BC) = ${d(V.q23IGhzABC, 0)}$. ` +
      `The third qubit held the missing part.`,
    formal:
      `Rewrite the second strong-subadditivity inequality as $S(\\rho_B) - S(\\rho_{AB}) \\le S(\\rho_{BC}) - S(\\rho_{ABC})$, Eq. 11.19, and add $S(\\rho_A)$ to both sides: $S(A{:}B) \\le S(A{:}BC)$ (Bergou p. 195). ` +
      `For the GHZ state $S(A{:}B) = ${d(V.q23IGhzAB, 0)}$ and $S(A{:}BC) = ${d(V.q23IGhzABC, 0)}$.`,
    caption: 'the GHZ circuit and the two qubits A, B alone',
    captionFormal: 'the GHZ circuit and $\\rho_{AB}$, whose entropy readout is 1',
    stage: GHZ_PICTURE,
    claims: [
      claim('q23IGhzAB', 'two qubits of a GHZ state share $1$ bit', () => close(V.q23IGhzAB, 1, 1e-9)),
      claim('q23IGhzABC', 'one qubit shares $2$ bits with the other two', () => close(V.q23IGhzABC, 2, 1e-9)),
    ],
  },
  {
    id: 'q23-quantum-mutual:b4',
    phase: 'books',
    text:
      `A noisy operation on Bob’s half is a unitary on Bob plus a helper $C$, then discarding $C$ (<<qc-q13-stinespring|Unit 13.3>>). A helper in a pure state adds no entropy, and neither does a unitary. ` +
      `Discarding $C$ cannot raise $S(A{:}B)$. So local noise only lowers the correlation.`,
    formal:
      `A trace-preserving operation $\\mathcal E$ on $B$ is a pure ancilla $C$, a unitary $U_{BC}$, then $\\mathrm{Tr}_C$ (Stinespring, <<qc-q13-stinespring|Unit 13.3>>). Because $C$ starts pure, $S(\\rho_{BC}) = S(\\rho_B)$ and $S(\\rho_{ABC}) = S(\\rho_{AB})$; Bergou p. 195 writes the first as $S(\\rho_{AB}) = S(\\rho_B)$, which the Corrections box fixes. ` +
      `So $S(A{:}B) = S(A{:}BC)$, unchanged by $I\\otimes U_{BC}$ and then lowered by discarding. Example: $\\Phi^+$ with $Z$ applied to $B$ when $C = |1\\rangle$, prepared with chance $0.1$: $S(A{:}B)$ falls from $${d(V.q23IBell, 0)}$ to $${d(V.q23IDeph01, 4)}$, a drop of $${d(V.q23DataProcFall, 4)}$.`,
    caption: 'the circuit: Bell pair, helper, controlled Z, then the helper is discarded',
    captionFormal: 'the circuit and $\\rho_{AB}$ after tracing out $C$: the dephased pair of Eq. 11.19’s argument',
    stage: DEPH_PICTURE,
    claims: [
      claim('q23DephCircuitGap', 'the circuit with $C$ traced out equals the dephased pair to engine precision', () => close(V.q23DephCircuitGap, 0, 1e-12)),
      claim('q23DataProcFall', 'the correlation falls by $0.4690$', () => close(V.q23DataProcFall, 0.469, 5e-5)),
      claim('q23IBell', 'from $2$ bits', () => close(V.q23IBell, 2, 1e-9)),
      claim('q23IDeph01', 'to $1.5310$', () => close(V.q23IDeph01, 1.531, 5e-5)),
      claim('q23SlipSAB', 'the Bell pair’s own entropy $S(\\rho_{AB})$ is $0$', () => close(V.q23SlipSAB, 0, 1e-9)),
      claim('q23SlipSB', 'while $S(\\rho_B)$ is $1$', () => close(V.q23SlipSB, 1, 1e-9)),
      claim('q23SlipSBC', 'and with a pure helper $S(\\rho_{BC})$ is $1$ too', () => close(V.q23SlipSBC, 1, 1e-9) && close(V.q23SlipSBC, V.q23SlipSB, 1e-9)),
      claim('q23InFlip', 'the helper is prepared in $|1\\rangle$ with chance $0.1$', () => close(V.q23InFlip, 0.1, 1e-12)),
    ],
  },
  {
    id: 'q23-quantum-mutual:b5',
    phase: 'clue',
    text: 'Alice leaves her qubit alone and Bob turns his half of a Bell pair by any one-qubit gate. Does $S(A{:}B)$ change?',
    formal: 'Apply a local unitary $I\\otimes V$ to $\\Phi^+$ and evaluate $S(A{:}B)$ before and after.',
    caption: 'the Bell pair, before the turn',
    captionFormal: '$\\Phi^+$: $S(A) = 1$ and $S(AB) = 0$',
    stage: BELL_HALF,
    reveal: {
      text: `No: $${d(V.q23IBell, 0)}$ before and $${d(V.q23ILocalU, 0)}$ after. A unitary changes no eigenvalue of the pair or of either half.`,
      formal: `$S(\\rho_{AB})$ and the spectra of $\\rho_A$ and $\\rho_B$ are unchanged by $I\\otimes V$, with $\\rho_B \\to V\\rho_BV^\\dagger$: $S(A{:}B) = ${d(V.q23ILocalU, 0)}$ throughout.`,
      caption: 'the Bell pair, unchanged in entropy',
      captionFormal: 'the same readout after $I\\otimes V$',
      stage: BELL_HALF,
      claims: [
        claim('q23IBell', 'before the local turn $S(A{:}B)$ is $2$', () => close(V.q23IBell, 2, 1e-9)),
        claim('q23ILocalU', 'after a local one-qubit gate it is still $2$', () => close(V.q23ILocalU, 2, 1e-9)),
      ],
    },
  },
  {
    id: 'q23-quantum-mutual:b6',
    phase: 'deeper',
    text: 'Bergou’s Problem 3 asks for a depolarizing channel on half a Bell pair. We used a phase error and cite the problem without working it. Both only lower the correlation.',
    formal: 'Problem 3 (cited, not worked) leaves the depolarizing case to the reader. The dephasing case above carries the same lesson: $S(A{:}B)$ falls from $2$ towards $1$ and never rises.',
    caption: 'the noisy pair again',
    captionFormal: 'the dephased pair, for comparison with the depolarized one of Problem 3',
    stage: NOISY_PAIR,
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* q23-holevo — How much can one particle carry?                                                       */
/* ---------------------------------------------------------------------------------------------- */

const BB84_BALL = (extra: Partial<Omit<BallState, 'kind' | 'point'>> = {}): BallState =>
  ball(
    {
      mix: [
        { of: '+z', w: 0.25 },
        { of: '-z', w: 0.25 },
        { of: '+x', w: 0.25 },
        { of: '-x', w: 0.25 },
      ],
    },
    { recipe: true, ...extra },
  )
const OTHER_PAIR_BALL = ball(
  {
    mix: [
      { of: '+z', w: 0.5 },
      { of: { thetaDeg: 60, phiDeg: 0 }, w: 0.5 },
    ],
  },
  { recipe: true },
)
const CHI_CURVE = (markers: number[] = []): PlotState => plot({ fn: 'holevoChiPair', vs: 'accessibleInfoPair', x: { from: 0, to: 1 } }, markers)
const USD_CURVE = (markers: number[] = []): PlotState => plot({ fn: 'usdBoundPair', vs: 'usdFailPair', x: { from: 0, to: 1 } }, markers)
const PQ_STATE = mx(mix([0.5, k('00')], [0.5, k('1+')]), { partialTrace: { keep: [1] }, spectrum: 'entropy' })
const PQ_AFTER = mx(mix([0.5, k('00')], [0.25, k('10')], [0.25, k('11')]), { spectrum: 'entropy' })

const holevo: Beat[] = [
  {
    id: 'q23-holevo:b1',
    phase: 'books',
    introduces: ['qc-holevo-bound'],
    text:
      `Alice sends one of several [[qubit|qubit]] states, chosen with known chances. Bob measures. The mutual information $I(X{:}Y)$ is what Bob learns. ` +
      `Holevo’s bound says that whatever he does, $I \\le \\chi = S(\\rho) - \\sum p_xS(\\rho_x)$, where $\\rho$ is the average state, a [[qc-mixture|mixture]] (<<qc-q8-mixed|Unit 8.4>>). That limit is the [[qc-holevo-bound|Holevo bound]].`,
    formal:
      `Alice sends $\\rho_x$ with chance $p_x$, and Bob’s POVM $\\{E_y\\}$ gives $p(y|x) = \\mathrm{Tr}\\,E_y\\rho_x$ (Bergou p. 196, Eq. 11.20; N&C p. 531). Then $I(X{:}Y) \\le \\chi = S(\\rho) - \\sum_xp_xS(\\rho_x)$ with $\\rho = \\sum_xp_x\\rho_x$: the [[qc-holevo-bound|Holevo bound]]. ` +
      `The largest $I$ over all POVMs is the [[qc-accessible-information|accessible information]]. It is at most $\\chi$, and in general smaller.`,
    caption: 'an ensemble on the ball: Alice’s states and their average',
    captionFormal: '$\\chi = S(\\rho) - \\sum_xp_xS(\\rho_x)$: the average $\\rho$ lies inside the ball',
    stage: PAIR_BALL(),
  },
  {
    id: 'q23-holevo:b2',
    phase: 'books',
    text:
      `Alice sends $|0\\rangle$ or $|{+}\\rangle$ by a fair coin. The average state’s arrow has length $${d(V.q23PairArrow, 3)}$, so its entropy is $${d(V.q23ChiZP, 3)}$ bits. ` +
      `The parts are pure and add nothing: $\\chi = ${d(V.q23ChiZP, 3)}$, far below $1$ bit. States that are not [[qc-orthogonal|orthogonal]] can never be told apart perfectly.`,
    formal:
      `$\\rho = \\tfrac12(|0\\rangle\\langle0| + |{+}\\rangle\\langle{+}|)$ has eigenvalues $${d(V.q23PairEig1, 4)}$ and $${d(V.q23PairEig2, 4)}$ and $S(\\rho_x) = 0$, so $\\chi = S(\\rho) = h(\\tfrac{1+s}{2}) = ${d(V.q23ChiZP, 4)}$ with $s = ${d(V.q23PairOverlap, 4)}$ the overlap. ` +
      `Orthogonal states, $s = 0$, give $\\chi = ${d(V.q23ChiOrth, 0)}$; identical ones, $s = 1$, give $${d(V.q23ChiSame, 0)}$.`,
    caption: 'the average of the two states lies inside the ball, at distance 0.707 from the centre',
    captionFormal: '$\\rho$ for $\\{|0\\rangle, |{+}\\rangle\\}$: the arrow has length $s$',
    stage: PAIR_BALL(),
    claims: [
      claim('q23ChiZP', 'the Holevo number of $\\{|0\\rangle, |{+}\\rangle\\}$ is $0.6009$ bits', () => close(V.q23ChiZP, 0.6009, 5e-5)),
      claim('q23ChiZPClosed', 'and equals $h((1+s)/2)$ to engine precision', () => close(V.q23ChiZPClosed, 0, 1e-12)),
      claim('q23PairArrow', 'the average state’s arrow has length $0.707$', () => close(V.q23PairArrow, 0.7071, 5e-5)),
      claim('q23PairOverlap', 'the overlap of the two states is $0.7071$', () => close(V.q23PairOverlap, 0.7071, 5e-5)),
      claim('q23PairEig1', 'the average state has eigenvalues $0.8536$', () => close(V.q23PairEig1, 0.8536, 5e-5)),
      claim('q23PairEig2', 'and $0.1464$', () => close(V.q23PairEig2, 0.1464, 5e-5)),
      claim('q23ChiOrth', 'orthogonal states have $\\chi = 1$', () => close(V.q23ChiOrth, 1, 1e-9)),
      claim('q23ChiSame', 'identical states have $\\chi = 0$', () => close(V.q23ChiSame, 0, 1e-9)),
    ],
    derivation: {
      result: '\\chi = h(\\tfrac{1+s}{2})',
      ground: [
        {
          tex: '\\chi = S(\\rho) - \\sum p_xS(\\rho_x) = S(\\rho)',
          why: 'Both states are pure, so every $S(\\rho_x)$ is 0 and only the average state counts.',
          view: PAIR_BALL(),
          viewCaption: 'the ensemble and its average',
        },
        {
          tex: '|\\mathbf r| = s,\\quad \\lambda_\\pm = \\tfrac{1 \\pm s}{2}',
          why: 'The average state’s arrow has length $s$, the overlap, and a one-qubit state with arrow length $s$ has these two eigenvalues.',
          view: OTHER_PAIR_BALL,
          viewCaption: 'another overlap',
        },
        {
          tex: '\\chi = -\\sum\\lambda\\log_2\\lambda = h(\\tfrac{1+s}{2})',
          why: 'The entropy of two chances is the binary entropy.',
          view: CHI_CURVE(),
          viewCaption: '$\\chi$ against the overlap',
        },
      ],
      formal: [
        {
          tex: '\\rho = \\tfrac12(\\psi_1 + \\psi_2),\\quad |\\mathbf r| = s,\\quad \\lambda_\\pm = \\tfrac{1 \\pm s}{2}',
          why: 'For two pure states the parts add no entropy, and the average state has these eigenvalues.',
          view: PAIR_BALL(),
          viewCaption: 'the ensemble and its average',
        },
        {
          tex: '\\chi = S(\\rho) = h(\\tfrac{1+s}{2})',
          why: 'The binary entropy of the larger eigenvalue.',
          view: CHI_CURVE(),
          viewCaption: '$\\chi$ against the overlap',
        },
      ],
    },
  },
  {
    id: 'q23-holevo:b3',
    phase: 'books',
    text:
      `Bob measures along $z$: he learns $${d(V.q23IZPz, 3)}$ bits. The best axis, along the difference of the two arrows, learns $${d(V.q23IBestZP, 3)}$. ` +
      `No measurement reaches $${d(V.q23ChiZP, 3)}$: the Holevo number is a ceiling, not a promise.`,
    formal:
      `A $z$ reading gives $I = H(Y) - H(Y|X) = ${d(V.q23PairZHY, 4)} - ${d(V.q23PairZHYgX, 1)} = ${d(V.q23IZPz, 4)}$. Over a grid of $3601$ projective measurements in the $xz$ plane the maximum is $${d(V.q23IBestZP, 4)} = 1 - h(\\tfrac12(1 - \\sqrt{1 - s^2}))$, at the Helstrom axis of <<qc-q14-min-error|Unit 14.5>>. ` +
      `So $${d(V.q23IBestZP, 4)} \\le I_{\\mathrm{acc}} \\le \\chi = ${d(V.q23ChiZP, 4)}$. An optimiser over rank-one POVMs with up to six outcomes found nothing above $${d(V.q23IBestZP, 4)}$; that search is our evidence, not a claim.`,
    caption: 'the same ensemble with Bob’s best measurement axis',
    captionFormal: '$I_{\\mathrm{acc}} \\ge 0.3991$ at the Helstrom axis; $\\chi = 0.6009$ is the ceiling',
    stage: PAIR_BALL({ measure: HELSTROM_AXIS }),
    claims: [
      claim('q23IZPz', 'a $z$ reading of $\\{|0\\rangle, |{+}\\rangle\\}$ gives $0.3113$ bits', () => close(V.q23IZPz, 0.3113, 5e-5)),
      claim('q23PairZHY', 'the readout has entropy $0.8113$', () => close(V.q23PairZHY, 0.8113, 5e-5)),
      claim('q23PairZHYgX', 'and given the state $0.5$', () => close(V.q23PairZHYgX, 0.5, 1e-9)),
      claim('q23IBestZP', 'the best of $3601$ projective axes gives $0.3991$', () => close(V.q23IBestZP, 0.3991, 5e-5)),
      claim('q23IHelstromClosed', 'which is $1 - h(\\tfrac12(1 - \\sqrt{1 - s^2}))$, also $0.3991$', () => close(V.q23IHelstromClosed, 0.3991, 5e-5) && close(V.q23IHelstromClosed, V.q23IBestZP, 1e-9)),
      claim('q23ChiZP', 'the ceiling is $0.6009$', () => close(V.q23ChiZP, 0.6009, 5e-5)),
    ],
  },
  {
    id: 'q23-holevo:b4',
    phase: 'books',
    text:
      `The proof is a chain of steps that cannot raise mutual information. At the start Alice’s label and her particle share $\\chi$. Bob’s measurement is an operation. ` +
      `Then he discards the particle. At the end the label and his result share $I(X{:}Y)$.`,
    formal:
      `Registers $P$ (the label), $Q$ (the system) and $M$ (the readout, starting in $|0\\rangle$) hold $\\rho_{PQM} = \\sum_xp_x|x\\rangle\\langle x|\\otimes\\rho_x\\otimes|0\\rangle\\langle0|$, Eq. 11.21. Bob’s POVM is the map with Kraus operators $K_y = \\sqrt{E_y}\\otimes U_y$ and $\\sum_yK_y^\\dagger K_y = I$, Eq. 11.22. ` +
      `Then $S(P{:}Q) = S(P{:}QM) \\ge S(P'{:}Q'M') \\ge S(P'{:}M')$ by Unit 23.5, with $S(P{:}Q) = \\chi$ (Eqs. 11.23–11.26) and $S(P'{:}M') = I(X{:}Y)$ (Eqs. 11.27–11.29). For the pair read along $z$: $${d(V.q23ProofStart, 4)} \\ge ${d(V.q23ProofEnd, 4)}$.`,
    caption: 'the label-and-particle state, with the entropy of the particle alone read out',
    captionFormal: '$\\rho_{PQ}$ for $\\{|0\\rangle, |{+}\\rangle\\}$: $S(P{:}Q) = \\chi$',
    stage: PQ_STATE,
    claims: [
      claim('q23ProofStart', 'before the measurement the label and the particle share $0.6009$ bits', () => close(V.q23ProofStart, 0.6009, 5e-5) && close(V.q23ProofStart, V.q23ChiZP, 1e-9)),
      claim('q23ProofEnd', 'after a $z$ reading the label and the result share $0.3113$', () => close(V.q23ProofEnd, 0.3113, 5e-5) && close(V.q23ProofEnd, V.q23IZPz, 1e-9)),
    ],
    derivation: {
      result: 'I(X{:}Y) \\le \\chi',
      ground: [
        {
          tex: 'S(P{:}Q) = S(\\rho) - \\sum_xp_xS(\\rho_x) = \\chi',
          why: 'The label tells which state the particle is in, so what they share is $\\chi$.',
          view: PQ_STATE,
          viewCaption: 'label and particle',
        },
        {
          tex: 'S(P{:}Q) = S(P{:}QM)',
          why: 'The readout register starts in a fixed state, uncorrelated with anything, so adding it changes nothing.',
        },
        {
          tex: `S(P{:}QM) \\ge S(P'{:}Q'M') \\ge S(P'{:}M')`,
          why: `Bob’s measurement is an operation and discarding $Q'$ is another; neither raises mutual information (Unit 23.5).`,
          view: PQ_AFTER,
          viewCaption: 'label and Bob’s result',
        },
        {
          tex: `S(P'{:}M') = I(X{:}Y)\\ \\Rightarrow\\ I(X{:}Y) \\le \\chi`,
          why: 'What is left is the label and the readout: the classical mutual information.',
        },
      ],
      formal: [
        {
          tex: '\\rho_{PQM} = \\sum_xp_x|x\\rangle\\langle x|\\otimes\\rho_x\\otimes|0\\rangle\\langle0|,\\quad S(P{:}Q) = \\chi',
          why: 'Eqs. 11.21–11.26.',
          view: PQ_STATE,
          viewCaption: 'label and particle',
        },
        {
          tex: `K_y = \\sqrt{E_y}\\otimes U_y,\\quad S(P{:}QM) \\ge S(P'{:}Q'M')`,
          why: 'Eq. 11.22: the measurement as a trace-preserving map.',
          view: PQ_AFTER,
          viewCaption: 'label and Bob’s result',
        },
        {
          tex: `S(P'{:}Q'M') \\ge S(P'{:}M') = I(X{:}Y)\\ \\Rightarrow\\ I(X{:}Y) \\le \\chi`,
          why: `Discard $Q'$, then read the classical table (Eqs. 11.27–11.29).`,
        },
      ],
    },
  },
  {
    id: 'q23-holevo:b5',
    phase: 'books',
    text:
      `Holevo caps what any unambiguous measurement can tell. Alice sends one of two equal-chance pure states, and Bob names it or says “failed”. ` +
      `The chance of failing is at least $1 - h(\\tfrac{1+s}{2})$: $${d(V.q23UsdBound05, 3)}$ at overlap $s = 0.5$. The best machine of <<qc-q14-usd|Unit 14.4>> fails with chance $${d(V.q23UsdPfExact05, 1)}$.`,
    formal:
      `Let $P_f$ be the total failure chance and $q_x = p_x(1 - p_{xx})/P_f$. Then $I = H(\\{p_x\\}) - P_fH(\\{q_x\\})$, Eq. 11.37 (Bergou pp. 198–199, Eqs. 11.30–11.40). Holevo gives $I \\le S(\\rho)$ and $H(\\{q_x\\}) \\le \\log N$, so $P_f \\ge (H(\\{p_x\\}) - S(\\rho))/\\log N$, Eq. 11.40. ` +
      `For two equiprobable pure states at overlap $s$ the bound is $1 - h(\\tfrac{1+s}{2})$: $0$ at $s = 0$, $${d(V.q23UsdBound05, 4)}$ at $0.5$, $${d(V.q23UsdBound0707, 4)}$ at $${d(V.q23PairOverlap, 4)}$ and $${d(V.q23UsdBound09, 4)}$ at $0.9$. ` +
      `The exact optimum fails with chance $s$ (Chapter Q14): $${d(V.q23UsdPfExact05, 1)}$, $${d(V.q23UsdPfExact0707, 4)}$ and $${d(V.q23UsdPfExact09, 1)}$. At $s = 0.5$ the optimum has $I = ${d(V.q23UsdInfo05, 1)} \\le \\chi = ${d(V.q23ChiS05, 4)}$.`,
    caption: 'the failure bound under the exact failure chance, against the overlap',
    captionFormal: 'the bound $1 - \\chi$ and the exact failure $s$, marked at $s = 0.5$',
    stage: USD_CURVE([0.5]),
    claims: [
      claim('q23UsdBound05', 'the failure bound at overlap $0.5$ is $0.1887$', () => close(V.q23UsdBound05, 0.1887, 5e-5)),
      claim('q23UsdBound0707', 'at overlap $0.7071$ it is $0.3991$', () => close(V.q23UsdBound0707, 0.3991, 5e-5)),
      claim('q23UsdBound09', 'at overlap $0.9$ it is $0.7136$', () => close(V.q23UsdBound09, 0.7136, 5e-5)),
      claim('q23UsdPfExact05', 'the best unambiguous measurement fails with chance $0.5$ at overlap $0.5$', () => close(V.q23UsdPfExact05, 0.5, 1e-9)),
      claim('q23UsdPfExact0707', 'with chance $0.7071$ at overlap $0.7071$', () => close(V.q23UsdPfExact0707, 0.7071, 5e-5)),
      claim('q23UsdPfExact09', 'and with chance $0.9$ at overlap $0.9$', () => close(V.q23UsdPfExact09, 0.9, 1e-9)),
      claim('q23UsdInfo05', 'its information is $0.5$ bit', () => close(V.q23UsdInfo05, 0.5, 1e-9)),
      claim('q23ChiS05', 'against a Holevo number $0.8113$', () => close(V.q23ChiS05, 0.8113, 5e-5)),
    ],
    derivation: {
      result: 'P_f \\ge (H(\\{p_x\\}) - S(\\rho))/\\log N',
      ground: [
        {
          tex: 'I = H(\\{p_x\\}) - P_fH(\\{q_x\\})',
          why: 'Bob learns the label unless he fails; when he fails the label is still uncertain, with entropy $H(\\{q_x\\})$.',
          view: USD_CURVE(),
          viewCaption: 'the failure bound under the exact failure chance',
        },
        {
          tex: 'I \\le \\chi = S(\\rho)',
          why: 'Holevo’s bound; the states are pure, so $\\chi = S(\\rho)$.',
        },
        {
          tex: 'H(\\{q_x\\}) \\le \\log N',
          why: 'A list of $N$ chances has entropy at most $\\log N$.',
          view: USD_CURVE([0.5]),
          viewCaption: 'at overlap 0.5',
        },
        {
          tex: 'P_f \\ge (H(\\{p_x\\}) - S(\\rho))/\\log N',
          why: 'Put the two bounds into the first line and solve for the failure chance.',
        },
      ],
      formal: [
        {
          tex: 'I = H(\\{p_x\\}) - P_fH(\\{q_x\\})',
          why: 'Eq. 11.37.',
          view: USD_CURVE(),
          viewCaption: 'the failure bound under the exact failure chance',
        },
        {
          tex: 'I \\le S(\\rho),\\quad H(\\{q_x\\}) \\le \\log N',
          why: 'Holevo and the maximum entropy of $N$ chances (Eq. 11.39).',
        },
        {
          tex: 'P_f \\ge (H(\\{p_x\\}) - S(\\rho))/\\log N',
          why: 'Eq. 11.40.',
          view: USD_CURVE([0.5]),
          viewCaption: 'at overlap 0.5',
        },
      ],
    },
  },
  {
    id: 'q23-holevo:b6',
    phase: 'clue',
    text: 'Alice sends $|0\\rangle$, $|1\\rangle$, $|{+}\\rangle$ and $|{-}\\rangle$ with chance one quarter each. What does Holevo allow, and what does Bob learn by measuring in $z$?',
    formal: 'Find $\\chi$ for the BB84 ensemble (<<qc-q15-bb84|Unit 15.3>>) and $I(X{:}Y)$ for a $z$ measurement, an $x$ measurement and the best of a grid of axes.',
    caption: 'four states: their average is the centre, entropy 1',
    captionFormal: 'the BB84 ensemble on the ball: the average $\\tfrac12 I$ is the centre',
    stage: BB84_BALL(),
    reveal: {
      text: `The average state is $\\tfrac12 I$ and all the parts are pure, so $\\chi = ${d(V.q23ChiBB84, 0)}$ bit. Reading $z$ gives $${d(V.q23IBB84z, 1)}$ bit, reading $x$ also $${d(V.q23IBB84x, 1)}$, and no axis does better. A single qubit never gives more than 1 bit.`,
      formal: `$\\chi = S(\\tfrac12 I) = ${d(V.q23ChiBB84, 0)}$; $z$ and $x$ readings give $H(Y) - H(Y|X) = 1 - \\tfrac12 = ${d(V.q23IBB84z, 1)}$; the best of $3601$ axes in the $xz$ plane is $${d(V.q23IBB84Best, 1)}$. An optimiser over rank-one POVMs found nothing higher, which is our evidence in words.`,
      caption: 'the same four states, read along z',
      captionFormal: 'the BB84 ensemble with the $z$ axis drawn',
      stage: BB84_BALL({ measure: 'z' }),
      claims: [
        claim('q23ChiBB84', 'the BB84 ensemble has $\\chi = 1$ bit', () => close(V.q23ChiBB84, 1, 1e-9)),
        claim('q23IBB84z', 'a $z$ reading learns $0.5$ bit', () => close(V.q23IBB84z, 0.5, 1e-9)),
        claim('q23IBB84x', 'an $x$ reading also $0.5$', () => close(V.q23IBB84x, 0.5, 1e-9)),
        claim('q23IBB84Best', 'and the best of $3601$ axes still $0.5$', () => close(V.q23IBB84Best, 0.5, 1e-9)),
        claim('q23InFair', 'each reading outcome has chance $0.5$', () => close(V.q23InFair, 0.5, 1e-12)),
      ],
    },
  },
  {
    id: 'q23-holevo:b7',
    phase: 'deeper',
    text:
      `This beat goes beyond the book. [[qc-dense-coding|Dense coding]] (<<qc-q11-dense-coding|Unit 11.2>>) sends 2 bits with one qubit, and Holevo agrees. Alice’s qubit alone is $\\tfrac12 I$ in all four cases, so it carries $\\chi = ${d(V.q23ChiBellAliceOnly, 0)}$. ` +
      `With Bob’s half, the four Bell states give $\\chi = ${d(V.q23ChiBellPair, 0)}$.`,
    formal:
      `Beyond Bergou’s text: the four Bell states with chance one quarter each give $\\chi_{AB} = S(\\tfrac14 I) - 0 = ${d(V.q23ChiBellPair, 0)}$, while Alice’s half alone has $\\rho_A = \\tfrac12 I$ for every message, so $\\chi_A = ${d(V.q23ChiBellAliceOnly, 0)}$. ` +
      `Bob’s Bell measurement attains $I = ${d(V.q23IBellMeasure, 4)}$, and $\\chi \\le \\log_2d$ (Eq. 3.47) equals $2$ for $d = 4$.`,
    caption: 'the four Bell states on a two-qubit matrix: entropy 2 for the average',
    captionFormal: 'the average of the four Bell states, $\\tfrac14 I$, with entropy 2 read out',
    stage: mx(mix([0.25, b('00+11')], [0.25, b('00-11')], [0.25, b('01+10')], [0.25, b('01-10')]), { spectrum: 'entropy' }),
    claims: [
      claim('q23ChiBellPair', 'the four Bell states have $\\chi = 2$ bits', () => close(V.q23ChiBellPair, 2, 1e-9)),
      claim('q23ChiBellAliceOnly', 'while Alice’s half alone gives $\\chi = 0$', () => close(V.q23ChiBellAliceOnly, 0, 1e-9)),
      claim('q23IBellMeasure', 'and Bob’s Bell measurement learns $2$', () => close(V.q23IBellMeasure, 2, 1e-9)),
      claim('q23InQuarter1', 'each Bell state has chance $0.25$', () => close(V.q23InQuarter1, 0.25, 1e-12)),
      claim('q23InFair', 'and Alice’s half is the flat state, with chances $0.5$', () => close(V.q23InFair, 0.5, 1e-12)),
    ],
  },
]

export const Q23_STORY: Record<string, Beat[]> = {
  ...PART_ONE_UNITS,
  'q23-two-variables': twoVariables,
  'q23-quantum-mutual': quantumMutual,
  'q23-holevo': holevo,
}

/** Every claim used anywhere in a unit's beats, for Unit.claims (content.test.tsx "claims hold"). */
function allClaims(beats: Beat[]) {
  return beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground.flatMap((s) => s.claims ?? []) ?? []), ...(b.derivation?.formal?.flatMap((s) => s.claims ?? []) ?? [])])
}
export const Q23_UNIT_CLAIMS_BY_ID: Record<string, ReturnType<typeof allClaims>> = Object.fromEntries(Object.entries(Q23_STORY).map(([id, beats]) => [id, allClaims(beats)]))
