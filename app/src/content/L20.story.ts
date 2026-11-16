/**
 * Lecture 20 scroll story (owner: P). Beats per docs/roles/proposals/P-L20-story.md §1, with the judge's rulings (docs/roles/decisions/448-L19L20.md, R1–R10, and the Townsend-pass
 * conventions 448-townsend.md, T1–T11):
 * - R2: the infinite well MOVED here from Lecture 14: `l14-box:b1` is `l20-infinite:b6`, `l14-box:b2` (Ex. 6.6) is `l20-infinite:b7`, its clue `l14-box:b3` is `l20-infinite:b8`; the keys took the
 *   `l20` prefix. `l14-stationary:b6` keeps a pointer.
 * - R3: the stage additions of the stage agent: the `wavefunction` source `well: {V0, a, n}` (the bound level n of the finite well, with its tails) and the `plot` curves `wellMatchEven` and
 *   `wellMatchOdd` (the matching mismatch against E/V₀). Every other picture is an existing kind: a `box` state, a packet in a harmonic potential, a `plot` of points.
 * - R7: `l20-finite:b9` is the Go-deeper beat (the plan's b7: the order of the phases puts the books beat and the clue before it); `l20-oscillator` is optional, four beats, and nothing later relies on it.
 * - M4/R8: notation as Lectures 14–18: the notes' u(x) is φ(x), Townsend's q is κ (one Rosetta line, `l20-reverse:b3`); the notes' energy zero is the bottom of the well (`l20-finite:b1`).
 * One track (448): sentences stay ≤ 25 words, symbols are defined before use, link-back beats name the lecture they recall and define nothing new. Scenario F is the finite well with V₀ = 8 and
 * a = 2 (ħ = m = 1), which holds three bound levels.
 *
 * Rules kept here (as in L1–L18.story.ts): stage states carry physics inputs only; every number in the prose comes from L20.values.ts and is backed by a keyed claim; clue beats are click-to-reveal
 * and last in their unit but for one Go-deeper beat; lengths are in ℓ, momenta in ħ/ℓ, energies in ħ²/mℓ², times in mℓ²/ħ. A fraction with a digit on both sides of the bar is read as a number by
 * the number reader, so formulas write \dfrac{k_2}{k_1} and the like, and an input such as an energy typed in a sentence would need a claim: the beats point at a marked energy instead.
 */
import type { Beat, Claim, PlotPointsState, PlotState, Ref, Scrub, WavefunctionState } from './schema'
import { V, claim, close, d } from './L20.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const sweep = (from: number, to: number): Scrub => ({ from, to })
const W = (source: WavefunctionState['source'], o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => ({ kind: 'wavefunction', source, shot: 'W-STD', ...o })
const PK = (x0: Scrub, sigma: Scrub, p0?: Scrub): WavefunctionState['source'] => ({ packet: { x0, sigma, ...(p0 === undefined ? {} : { p0 }) } })
const BOX = (L: number, n: number | [number, number]): WavefunctionState['source'] => ({ box: { L, n } })
/** Level n of scenario F (V₀ = 8, a = 2); the window shows a little of the tails. */
const WELL = (n: number, o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => W({ well: { V0: 8, a: 2, n } }, { window: { x: [-3, 3] }, ...o })

/** The matching mismatch of the even (odd) states against E/V₀, scenario F; a dot at each level of its own parity (the zeros) and any extra marked energies. */
const MATCH_EVEN = (extra: number[] = []): PlotState => ({
  kind: 'plot',
  shot: 'P-CURVE',
  curve: { fn: 'wellMatchEven', samples: 160 },
  markers: [{ x: V.l20E1Fin / 8 }, { x: V.l20E3Fin / 8 }, ...extra.map((x) => ({ x }))],
})
const MATCH_ODD: PlotState = { kind: 'plot', shot: 'P-CURVE', curve: { fn: 'wellMatchOdd', samples: 160 }, markers: [{ x: V.l20E2Fin / 8 }] }
/** The energies of Section 1's clue: one above and one below the ground level (E/V₀ for E = 1.2 and E = 0.4). */
const MARKED_HIGH = 0.15
const MARKED_LOW = 0.05

/** The three levels of scenario F against their infinite-well twins: the ratio E_n over n²π²/2a² for a = 2. */
const RATIO_LEVELS: PlotPointsState = {
  kind: 'plot',
  shot: 'P-CURVE',
  xLabel: 'level n',
  yLabel: 'finite / infinite energy',
  points: [
    { x: 1, y: V.l20E1Ratio, group: 'V₀ = 8, a = 2' },
    { x: 2, y: V.l20E2Ratio, group: 'V₀ = 8, a = 2' },
    { x: 3, y: V.l20E3Ratio, group: 'V₀ = 8, a = 2' },
  ],
  yLines: [{ y: 1, label: 'infinite well' }],
}
/** The ground level over its infinite twin as the depth grows (a = 2): the walls go up and the ratio climbs toward 1. */
const RATIO_DEPTH: PlotPointsState = {
  kind: 'plot',
  shot: 'P-CURVE',
  xLabel: 'well depth V₀',
  yLabel: 'ground-level ratio',
  xScale: 'log',
  points: [
    { x: 8, y: V.l20E1Ratio, group: 'ground level' },
    { x: 32, y: V.l20RatioV32, group: 'ground level' },
    { x: 128, y: V.l20RatioV128, group: 'ground level' },
    { x: 512, y: V.l20RatioV512, group: 'ground level' },
    { x: 2048, y: V.l20RatioV2048, group: 'ground level' },
  ],
  yLines: [{ y: 1, label: 'infinite well' }],
}

const townsend = (where: string, adds: string): Ref => ({ source: 'townsend', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* l20-reverse — From scattering to bound states                                                   */
/* ---------------------------------------------------------------------------------------------- */

const reverse: Beat[] = [
  {
    id: 'l20-reverse:b1',
    phase: 'lecture',
    classMark: { class: 20 },
    text: `Lecture 19 used one equation in two kinds of region. Where $E > V$ it reads $\\varphi'' = -k^2\\varphi$, and where $E < V$ it reads $\\varphi'' = \\kappa^2\\varphi$. Nothing is new here. There we chose $E$ and solved for the reflected and transmitted waves, and the state could not be [[normalized|normalised]]. A bound state is different: no beam arrives from far away, the particle stays near the well, and $E$ itself is unknown. The picture shows the lowest state of a well in which $k = ${d(V.l20K1, 3)}$ and $\\kappa = ${d(V.l20Kappa1, 3)}$.`,
    caption: 'the lowest bound state of a well: a wave inside and a decaying tail on each side',
    stage: WELL(1),
    fidelity: ['wavefunction-well-eigen'],
    claims: [
      claim('l20K1', 'for the lowest level of the well with V₀ = 8 and a = 2, k = 1.252', () => close(V.l20K1, 1.25235, 5e-5)),
      claim('l20Kappa1', 'and κ = 3.799', () => close(V.l20Kappa1, 3.79890, 5e-5)),
    ],
  },
  {
    id: 'l20-reverse:b2',
    phase: 'lecture',
    text: `One test separates the two kinds of state: the integral of $|\\varphi|^2\\,dx$ over all $x$. For a [[bound-state|bound state]] it is finite, and we scale it to 1. For a scattering state it is not. So a bound state has exponentially decaying tails on both sides, and no flux arrives from infinity. In the lowest state of the picture the chance of finding the particle outside the well is ${d(V.l20TailGround, 4)}.`,
    caption: 'the same state with its tail chance in the readout: the area outside the well is small but not zero',
    stage: WELL(1, { readouts: ['tail', 'norm'] }),
    fidelity: ['wavefunction-well-eigen'],
    claims: [claim('l20TailGround', 'the lowest level of the well (V₀ = 8, a = 2) has 0.0204 of its chance outside the well', () => close(V.l20TailGround, 0.0204264, 5e-5))],
  },
  {
    id: 'l20-reverse:b3',
    phase: 'books',
    text: `Townsend (§6.8, pp. 214–216, Eqs. 6.86–6.95, Fig. 6.8) studies this same finite well. In each outer region he drops whichever exponential grows, then joins the value and the slope at each wall. Only special energies join smoothly, and his figure shows how the function bends away when the energy misses. He postpones the exact condition. His decay constant $q$ is our $\\kappa$. Unit 20.3 derives the condition.`,
    caption: 'the mismatch of the matching condition against the energy: it vanishes only at the bound levels of this parity',
    stage: MATCH_EVEN(),
    fidelity: ['plot-well-match'],
    refs: [townsend('§6.8, pp. 214–216 (Eqs. 6.86–6.95, Figs. 6.7–6.8)', 'The finite well: discard the growing exponential in each outer region, join value and slope at the walls, and only special energies match.')],
  },
  {
    id: 'l20-reverse:b4',
    phase: 'clue',
    text: 'Inside the well a sine or a cosine fits any wave number. So why can we not pick any energy we like?',
    stage: MATCH_EVEN([MARKED_HIGH, MARKED_LOW]),
    fidelity: ['plot-well-match'],
    reveal: {
      text: `Because the function must also join a decaying tail on each side. One that fits at the left edge generally bends away and grows at the right edge. The scaled mismatch is zero at the ground energy, $-${d(V.l20MismatchHigh, 3)}$ at the marked energy above it and $${d(V.l20MismatchLow, 3)}$ at the marked one below. Only special energies decay on both sides.`,
      caption: 'the scaled mismatch of the even condition: zero at the levels, nonzero at the two marked energies',
      stage: MATCH_EVEN([MARKED_HIGH, MARKED_LOW]),
      claims: [
        claim('l20MismatchE1', 'the mismatch is zero at the ground energy', () => Math.abs(V.l20MismatchE1) < 1e-12),
        claim('l20MismatchHigh', 'its size is 0.367 at the marked energy above', () => close(V.l20MismatchHigh, 0.367293, 5e-5)),
        claim('l20MismatchLow', 'and 0.436 at the marked energy below', () => close(V.l20MismatchLow, 0.435736, 5e-5)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l20-infinite — The infinite well fixes the energies                                             */
/* ---------------------------------------------------------------------------------------------- */

const infinite: Beat[] = [
  {
    id: 'l20-infinite:b1',
    phase: 'lecture',
    text: 'Put walls at $x = 0$ and $x = a$, with $V = \\infty$ outside. The chance outside is zero, so $\\varphi(0) = \\varphi(a) = 0$. Between the walls $V = 0$. An electron in an [[infinite-well|infinite well]] 4 Å wide is the scale to keep in mind.',
    caption: 'a particle between two walls: the function is zero at both ends',
    stage: W(BOX(4, 1), { show: ['re', 'density'] }),
    fidelity: ['wavefunction-box-walls'],
  },
  {
    id: 'l20-infinite:b2',
    phase: 'lecture',
    text: `Inside the walls $\\varphi'' + k^2\\varphi = 0$ with $k = \\sqrt{2mE}/\\hbar$, so $\\varphi = A\\sin kx + B\\cos kx$. The left wall gives $B = 0$. The right wall gives $A\\sin ka = 0$, so $ka = n\\pi$ and $E_n = \\dfrac{n^2\\pi^2\\hbar^2}{2ma^2}$. We never assumed quantisation: two walls chose $k$. The value $n = 0$ is no particle, and $-n$ is the same state with a sign. For $a = 4$ and $m = \\hbar = 1$, $E_1 = ${d(V.l20BoxE1L4, 4)}$ and level 3 is ${d(V.l20BoxE3overE1, 0)} times higher.`,
    caption: 'level 3 is a sine that fits three half-waves between the walls; level 1 fits one',
    stage: W(BOX(4, 3), { show: ['re'] }),
    fidelity: ['wavefunction-box-walls'],
    derivation: {
      result: 'E_n = \\dfrac{n^2\\pi^2\\hbar^2}{2ma^2}',
      ground: [
        {
          tex: '\\varphi\'\' + k^2\\varphi = 0',
          why: 'Inside the walls $V = 0$, so the time-independent equation takes this form, with $k = \\sqrt{2mE}/\\hbar$.',
          view: W(BOX(4, 3), { show: ['re'] }),
          viewCaption: 'a candidate inside the box: level 3, a sine with three half-waves',
        },
        { tex: '\\varphi = A\\sin kx + B\\cos kx', why: 'A sine and a cosine solve it; $A$ and $B$ are constants.' },
        { tex: '\\varphi(0) = B = 0', why: 'The left wall forces the function to vanish at $x = 0$, which removes the cosine.' },
        {
          tex: '\\varphi(a) = A\\sin ka = 0',
          why: 'The right wall asks for a zero at $x = a$ too. $A$ cannot vanish, or there is no state, so the sine must.',
          view: W(BOX(4, 1), { show: ['re', 'density'] }),
          viewCaption: 'level 1: the walls leave room for one half-wave',
        },
        { tex: 'k_n = \\dfrac{n\\pi}{a},\\quad n = 1, 2, 3, \\dots', why: 'A sine vanishes only at whole multiples of $\\pi$.' },
        { tex: 'E_n = \\dfrac{\\hbar^2k_n^2}{2m} = \\dfrac{n^2\\pi^2\\hbar^2}{2ma^2}', why: 'Put $k_n$ into $E = \\dfrac{\\hbar^2k^2}{2m}$.' },
      ],
    },
    claims: [
      claim('l20BoxE1L4', 'in a box of width 4 the lowest energy is 0.3084', () => close(V.l20BoxE1L4, 0.308425, 5e-5)),
      claim('l20BoxE3overE1', 'and level 3 is 9 times higher', () => close(V.l20BoxE3overE1, 9, 1e-9)),
    ],
  },
  {
    id: 'l20-infinite:b3',
    phase: 'lecture',
    text: `Normalise: $\\int|A\\sin(n\\pi x/a)|^2dx = |A|^2a/2$, so $\\varphi_n = \\sqrt{2/a}\\,\\sin(n\\pi x/a)$. For $a = 4$ the amplitude is $${d(V.l20BoxAmpL4, 4)}$. Level $n$ has $n$ half-waves and $n - 1$ interior [[node|nodes]]: level 3 has ${d(V.l20Nodes3, 0)}. The full state is $\\Psi_n = \\varphi_ne^{-iE_nt/\\hbar}$. Its phase turns as time passes, but $|\\Psi_n|^2$ does not.`,
    caption: 'level 3 with its density: the real part has two interior nodes and the density never moves',
    stage: W(BOX(4, 3), { show: ['re', 'density'], time: sweep(0, 6) }),
    fidelity: ['wavefunction-box-walls'],
    claims: [
      claim('l20BoxAmpL4', 'for a = 4 the amplitude √(2/a) is 0.7071', () => close(V.l20BoxAmpL4, 0.707107, 5e-5)),
      claim('l20Nodes3', 'level 3 has 2 interior nodes (counted on the grid)', () => V.l20Nodes3 === 2),
    ],
  },
  {
    id: 'l20-infinite:b4',
    phase: 'lecture',
    text: `Why is $E = 0$ not allowed? The only zero-energy solution that meets both walls is $\\varphi = 0$, which is no particle. Confinement forces a spread of momentum. For the ground state with $a = 4$, $\\Delta x = ${d(V.l20DxL4, 3)}$ and $\\Delta p = ${d(V.l20DpL4, 3)}\\,\\hbar/\\ell$, so $\\Delta x\\,\\Delta p = ${d(V.l20ProductGround, 3)}\\hbar$. That is above one half, but not by much.`,
    caption: 'the ground state in position (top) and momentum (bottom): the readout shows the product of the spreads',
    stage: W(BOX(4, 1), { panels: ['position', 'momentum'], show: ['re', 'density'], readouts: ['product'] }),
    fidelity: ['wavefunction-box-walls'],
    claims: [
      claim('l20DxL4', 'the ground state of a box of width 4 has Δx = 0.723', () => close(V.l20DxL4, 0.723024, 5e-5)),
      claim('l20DpL4', 'and Δp = 0.785', () => close(V.l20DpL4, 0.785398, 5e-5)),
      claim('l20ProductGround', 'so ΔxΔp = 0.568, above one half', () => close(V.l20ProductGround, 0.567862, 5e-5)),
    ],
  },
  {
    id: 'l20-infinite:b5',
    phase: 'lecture',
    text: `A caution. At a finite jump of $V$ the function and its slope are both continuous. An infinitely high wall is an idealisation: $\\varphi = 0$ at the wall, but $\\varphi'$ jumps from ${d(V.l20WallSlope, 3)} just inside (level 1, $a = 4$) to zero outside. Imposing the finite-step rule here would delete every state. Townsend's Eq. 6.96 says a step in the slope needs an infinite $V$.`,
    caption: 'level 1 meets the wall at a slant: the slope inside the wall is not zero, and the wall absorbs the jump',
    stage: W(BOX(4, 1), { show: ['re'] }),
    fidelity: ['wavefunction-box-walls'],
    claims: [claim('l20WallSlope', 'for level 1 of a box of width 4 the slope just inside the wall is 0.5554', () => close(V.l20WallSlope, 0.555360, 5e-5))],
  },
  {
    id: 'l20-infinite:b6',
    phase: 'books',
    text: `Townsend (§6.9, pp. 219–221, Eqs. 6.99–6.110) reaches the same energies by a second route. The function vanishes at both walls and is $A\\sin kx + B\\cos kx$ between them. Two conditions on two unknowns have a nonzero solution only when a determinant vanishes. That gives $\\sin ka = 0$, so $k_na = n\\pi$, and the normalised functions are $\\sqrt{2/a}\\,\\sin(n\\pi x/a)$. An electron in a well 4 Å wide has $E_1 = ${d(V.l20TBoxE1Ev, 2)}$ eV. Townsend centres the box, so his functions alternate cosine and sine. Here one wall is at 0, his Problem 6.13 choice: one formula for every $n$, the same energies.`,
    caption: 'level 1 in position (top) and momentum (bottom): the momentum curve has two lobes, near $\\pm\\pi\\hbar/a$',
    stage: W(BOX(4, 1), { panels: ['position', 'momentum'], show: ['re', 'density'], readouts: ['energy', 'pspread'] }),
    derivation: {
      result: 'E_n = \\dfrac{\\hbar^2\\pi^2n^2}{2ma^2}',
      ground: [
        {
          tex: '\\begin{pmatrix} 0 & 1 \\\\ \\sin ka & \\cos ka \\end{pmatrix}\\begin{pmatrix} A \\\\ B \\end{pmatrix} = 0',
          why: 'The two wall conditions, $B = 0$ and $A\\sin ka + B\\cos ka = 0$, are two linear equations for $A$ and $B$ (the analogue of Eqs. 6.101–6.102, for a wall at zero).',
          view: W(BOX(4, 3), { show: ['re'] }),
          viewCaption: 'a candidate inside the box: level 3 is a sine that fits three half-waves',
        },
        {
          tex: '\\det = -\\sin ka = 0 \\;\\Rightarrow\\; k_na = n\\pi',
          why: 'A nonzero solution needs the determinant to vanish (the analogue of Eqs. 6.103–6.105), and a sine vanishes only at whole multiples of $\\pi$.',
          view: W(BOX(4, 2), { show: ['re', 'density'] }),
          viewCaption: 'the walls leave room for a whole number of half-waves',
        },
        {
          tex: '\\int_0^a \\varphi_n^2\\,dx = \\dfrac{A^2a}{2} = 1 \\;\\Rightarrow\\; \\varphi_n = \\sqrt{\\dfrac{2}{a}}\\,\\sin\\dfrac{n\\pi x}{a}',
          why: 'Normalise: the average of $\\sin^2$ over the box is one half, so $A = \\sqrt{2/a}$ (Eqs. 6.107–6.108).',
        },
        {
          tex: 'E_n = \\dfrac{\\hbar^2k_n^2}{2m} = \\dfrac{\\hbar^2\\pi^2n^2}{2ma^2}',
          why: 'Put $k_n = n\\pi/a$ into $E = \\dfrac{\\hbar^2k^2}{2m}$ (Eq. 6.110).',
          view: W(BOX(4, 1), { panels: ['position', 'momentum'], show: ['re', 'density'], readouts: ['energy', 'pspread'] }),
          viewCaption: 'level 1: its energy and its momentum spread',
          claims: [claim('l20TBoxE1Ev', 'an electron in a well 0.4 nm wide has E₁ = 2.35 eV', () => close(V.l20TBoxE1Ev, 2.3502, 5e-4))],
        },
      ],
    },
    refs: [townsend('§6.9, pp. 219–221 (Eqs. 6.99–6.110, Fig. 6.10)', 'An infinite well forces nodes at the walls; a determinant condition gives $k_na = n\\pi$, and $E_n = \\hbar^2\\pi^2n^2/2ma^2$. He centres the box, so his functions alternate cosine and sine; here one wall is at 0 (his Problem 6.13).')],
    fidelity: ['wavefunction-box-walls'],
    claims: [claim('l20TBoxE1Ev', 'an electron in a well 0.4 nm wide has E₁ = 2.35 eV', () => close(V.l20TBoxE1Ev, 2.3502, 5e-4))],
  },
  {
    id: 'l20-infinite:b7',
    phase: 'books',
    text: `Walls that move away: Townsend's Ex. 6.6 (pp. 221–224). Measure the energy, so the state is the ground state of a box of width $a$. Then pull both walls out at once, so the width doubles about the same centre. The state cannot change that fast, but it is no longer stationary. Square the overlap with the new lowest level to get the chance of that energy. The overlap is ${d(V.l20TBoxOverlap, 3)} ($8/(3\\pi)$), so the chance is ${d(V.l20TBoxP1, 2)}. The new third level gets ${d(V.l20TBoxP3, 2)}. Levels with even $n$ get ${d(V.l20TBoxP2, 0)} by parity. Levels with odd $n$ share all the rest, and their chances add to ${d(V.l20TBoxSumOdd, 0)}.`,
    caption: 'two levels mixed are not stationary: the density sloshes (two levels stand in for the many that the wider box produces)',
    stage: W(BOX(4, [1, 2]), { time: sweep(0, 2), show: ['density'], readouts: ['energy'] }),
    refs: [townsend('§6.9, pp. 221–224 (Ex. 6.6, Fig. 6.11)', 'The ground state of a box, widened suddenly to twice its width, overlaps the new ground state with $8/3\\pi$. The chance of the new ground energy is $64/9\\pi^2$.')],
    claims: [
      claim('l20TBoxOverlap', 'the overlap of the old ground state with the new one is 8/3π = 0.849', () => close(V.l20TBoxOverlap, 8 / (3 * Math.PI), 1e-9)),
      claim('l20TBoxP1', 'so the chance of the new ground state is 64/9π² = 0.72', () => close(V.l20TBoxP1, 64 / (9 * Math.PI ** 2), 1e-9)),
      claim('l20TBoxP3', 'the new third level gets 64/25π² = 0.26', () => close(V.l20TBoxP3, 64 / (25 * Math.PI ** 2), 1e-9)),
      claim('l20TBoxP2', 'the even levels get 0 by parity', () => close(V.l20TBoxP2, 0, 1e-12)),
      claim('l20TBoxSumOdd', 'and the odd levels’ chances add to 1 (399 levels summed)', () => close(V.l20TBoxSumOdd, 1, 1e-6)),
    ],
  },
  {
    id: 'l20-infinite:b8',
    phase: 'clue',
    text: 'Squeeze the box to half its width. What happens to the lowest energy and to the momentum spread of the state? What if the mass doubles instead?',
    stage: W(BOX(4, 1), { panels: ['position', 'momentum'], show: ['re', 'density'], readouts: ['energy', 'pspread'] }),
    reveal: {
      text: `The energy goes as $1/a^2$, so it is multiplied by ${d(V.l20TBoxEnergyRatio, 0)}. The momentum spread is $\\pi\\hbar/a$, so it is multiplied by ${d(V.l20TBoxDpRatio, 0)}. The walls pin the particle more tightly, and a tighter position costs momentum. A doubled mass halves every energy, because $m$ sits in the denominator of $E_n$.`,
      caption: 'a box half as wide: the energy readout is four times larger and the momentum spread twice as large',
      stage: W(BOX(2, 1), { panels: ['position', 'momentum'], show: ['re', 'density'], readouts: ['energy', 'pspread'] }),
      claims: [
        claim('l20TBoxEnergyRatio', 'half the width gives four times the energy', () => close(V.l20TBoxEnergyRatio, 4, 1e-9)),
        claim('l20TBoxDpRatio', 'and twice the momentum spread', () => close(V.l20TBoxDpRatio, 2, 1e-9)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l20-finite — Lower the walls: tails, parity, matching                                            */
/* ---------------------------------------------------------------------------------------------- */

const finite: Beat[] = [
  {
    id: 'l20-finite:b1',
    phase: 'lecture',
    text: `Now centre a [[finite-well|finite well]] at $x = 0$: $V = 0$ for $|x| < a/2$ and $V = V_0$ outside, with $0 < E < V_0$. Put $k = \\sqrt{2mE}/\\hbar$ and $\\kappa = \\sqrt{2m(V_0 - E)}/\\hbar$, so $k^2 + \\kappa^2 = 2mV_0/\\hbar^2$. Inside, $\\varphi = A\\cos kx + B\\sin kx$. Outside, $\\varphi = Ce^{\\kappa x} + De^{-\\kappa x}$, and the growing exponential cannot be normalised, so it goes. The barrier kept both exponentials because its region was finite; here the regions reach to infinity. For $V_0 = 8$ the sum $k^2 + \\kappa^2$ is ${d(V.l20SumSq, 0)}. The notes put the energy zero at the bottom of the well. Putting it outside shifts every energy down by $V_0$.`,
    caption: 'the three bound levels of this well share one sum: $k^2 + \\kappa^2 = 16$ for each',
    stage: WELL(1),
    fidelity: ['wavefunction-well-eigen'],
    claims: [claim('l20SumSq', 'for V₀ = 8 the sum k² + κ² is 16 for the lowest level (to 1e-9)', () => close(V.l20SumSq, 16, 1e-9))],
  },
  {
    id: 'l20-finite:b2',
    phase: 'lecture',
    text: `Compare with the infinite well. Now $\\varphi$ does not vanish at the wall, and it leaks into the forbidden region over a distance of about $1/\\kappa$. Value and slope are continuous at the wall. For the lowest level with $V_0 = 8$ and $a = 2$, the value at the wall is ${d(100 * V.l20WallValueRatio, 1)} % of the value at the centre and $1/\\kappa = ${d(V.l20DecayLen1, 3)}$. The chance outside the well is ${d(100 * V.l20TailGround, 2)} %.`,
    caption: 'the lowest level: the dashed energy line sits inside the well and the tails reach past the walls',
    stage: WELL(1, { readouts: ['tail'] }),
    fidelity: ['wavefunction-well-eigen'],
    claims: [
      claim('l20WallValueRatio', 'the wall value is 31.3 % of the centre value', () => close(V.l20WallValueRatio, 0.313088, 5e-5)),
      claim('l20DecayLen1', '1/κ = 0.263', () => close(V.l20DecayLen1, 0.263234, 5e-4)),
      claim('l20TailGround', 'the chance outside the well is 2.04 %', () => close(V.l20TailGround, 0.0204264, 5e-5)),
    ],
  },
  {
    id: 'l20-finite:b3',
    phase: 'lecture',
    text: `The tails are not a stream of particles leaving. A bound state is real, and for a real function $j = \\tfrac{\\hbar}{m}\\,\\mathrm{Im}(\\varphi^*\\varphi')$ vanishes. The engine finds ${d(V.l20WellCurrent, 0)} at points inside the well and outside it. Unit 18.3 found the same zero for a lone exponential. Lecture 19's tail was followed by a travelling wave; here there is none, so nothing carries the probability away.`,
    caption: 'the bound state is real, so its tails carry no current: the readouts have no flux to show',
    stage: WELL(1, { readouts: ['tail'], show: ['re', 'density'] }),
    fidelity: ['wavefunction-well-eigen'],
    claims: [claim('l20WellCurrent', 'the current of the bound state is 0 at every point asked', () => Math.abs(V.l20WellCurrent) < 1e-12)],
  },
  {
    id: 'l20-finite:b4',
    phase: 'lecture',
    text: `Symmetry. If $V(-x) = V(x)$ and $\\varphi(x)$ is a solution, then so is $\\varphi(-x)$, with the same $E$. A bound level in one dimension has a single shape, so $\\varphi(-x) = c\\,\\varphi(x)$ for some constant $c$. Reflect again and $c^2 = 1$. So every bound state is [[even-odd-state|even or odd]]. In scenario F the levels are even, odd, even, with ${d(V.l20Nodes1Fin, 0)}, ${d(V.l20Nodes2Fin, 0)} and ${d(V.l20Nodes3Fin, 0)} nodes. The overlap $\\int\\varphi(x)\\varphi(-x)dx$ is $+1$, $-1$, $+1$.`,
    caption: 'level 1 is even; the next picture is level 2, which is odd and has a node at the centre',
    stage: WELL(1),
    fidelity: ['wavefunction-well-eigen'],
    derivation: {
      result: '\\varphi(-x) = \\pm\\varphi(x)',
      ground: [
        {
          tex: 'V(-x) = V(x)',
          why: 'The well is symmetric about its centre.',
          view: WELL(1),
          viewCaption: 'level 1 of the symmetric well: even',
        },
        { tex: '\\tilde\\varphi(x) = \\varphi(-x)\\ \\text{has the same } E', why: 'Replacing $x$ by $-x$ leaves the equation unchanged, because $V$ and the second derivative do not care about the sign of $x$.' },
        { tex: '\\varphi(-x) = c\\,\\varphi(x)', why: 'A bound level in one dimension has one shape, so the mirror image is a constant multiple of it.' },
        {
          tex: '\\varphi(x) = c\\,\\varphi(-x) = c^2\\varphi(x)',
          why: 'Reflect once more: the same relation applied to $\\varphi(-x)$.',
          view: WELL(2),
          viewCaption: 'level 2: odd, with a node at the centre',
        },
        { tex: 'c^2 = 1 \\;\\Rightarrow\\; \\varphi(-x) = \\pm\\varphi(x)', why: 'A constant whose square is 1 is plus or minus 1.' },
      ],
    },
    claims: [
      claim('l20Nodes1Fin', 'level 1 has 0 nodes', () => V.l20Nodes1Fin === 0),
      claim('l20Nodes2Fin', 'level 2 has 1 node', () => V.l20Nodes2Fin === 1),
      claim('l20Nodes3Fin', 'level 3 has 2 nodes', () => V.l20Nodes3Fin === 2),
      claim('l20Parity1', 'the overlap of φ(x) and φ(−x) is +1 for level 1', () => close(V.l20Parity1, 1, 1e-9)),
      claim('l20Parity2', '−1 for level 2', () => close(V.l20Parity2, -1, 1e-9)),
      claim('l20Parity3', '+1 for level 3', () => close(V.l20Parity3, 1, 1e-9)),
    ],
  },
  {
    id: 'l20-finite:b5',
    phase: 'lecture',
    text: `Take an even state and the edge at $x = a/2$. Inside it is $A\\cos kx$ and outside $Ce^{-\\kappa(x - a/2)}$. Match the value and the slope there, and divide: $k\\tan\\tfrac{ka}{2} = \\kappa$. The left edge is automatic by symmetry. Both $k$ and $\\kappa$ depend on $E$, so this [[matching-energy|quantization condition]] holds only at isolated energies. Check it on level 1: $k\\tan\\tfrac{ka}{2} = ${d(V.l20EvenLeft1, 3)}$, and it equals $\\kappa = ${d(V.l20Kappa1, 3)}$.`,
    caption: 'level 1 above and the matching mismatch below: the mismatch crosses zero at the energy of the level',
    stage: { layout: 'split', top: WELL(1), bottom: MATCH_EVEN() },
    fidelity: ['wavefunction-well-eigen', 'plot-well-match'],
    derivation: {
      result: 'k\\tan\\tfrac{ka}{2} = \\kappa',
      ground: [
        {
          tex: '\\varphi = A\\cos kx\\ (|x| < a/2),\\qquad \\varphi = Ce^{-\\kappa(x - a/2)}\\ (x > a/2)',
          why: 'An even state is a cosine inside and a decaying exponential outside.',
          view: WELL(1),
          viewCaption: 'level 1: a cosine inside and a decaying tail',
        },
        { tex: 'A\\cos\\tfrac{ka}{2} = C', why: 'The function is continuous at $x = a/2$.' },
        {
          tex: '-Ak\\sin\\tfrac{ka}{2} = -\\kappa C',
          why: 'The slope is continuous at $x = a/2$ too.',
          view: MATCH_EVEN(),
          viewCaption: 'the scaled mismatch of the two conditions, against the energy',
        },
        { tex: 'k\\tan\\tfrac{ka}{2} = \\kappa', why: 'Divide the slope condition by the value condition: $A$ and $C$ cancel.' },
      ],
    },
    claims: [
      claim('l20EvenLeft1', 'for level 1, k tan(ka/2) = 3.799', () => close(V.l20EvenLeft1, 3.79890, 5e-4)),
      claim('l20Kappa1', 'and κ = 3.799', () => close(V.l20Kappa1, 3.79890, 5e-4)),
      claim('l20EvenResidual1', 'the two sides differ by 0 (to 1e-9)', () => Math.abs(V.l20EvenResidual1) < 1e-9),
    ],
  },
  {
    id: 'l20-finite:b6',
    phase: 'lecture',
    text: `Odd states have $A\\sin kx$ inside. At $x = a/2$ the value gives $A\\sin\\tfrac{ka}{2} = C$ and the slope gives $Ak\\cos\\tfrac{ka}{2} = -\\kappa C$, so $-k\\cot\\tfrac{ka}{2} = \\kappa$. With $k^2 + \\kappa^2 = 2mV_0/\\hbar^2$ the two conditions fix the discrete energies. We read them from the engine and do not solve them by hand. For $V_0 = 8$ and $a = 2$ the well holds ${d(V.l20NBound, 0)} levels: $E = ${d(V.l20E1Fin, 3)}$, ${d(V.l20E2Fin, 3)} and ${d(V.l20E3Fin, 3)}. Levels 1 and 3 are even; level 2 is odd.`,
    caption: 'level 2 above and the odd mismatch below: its zero marks the odd level',
    stage: { layout: 'split', top: WELL(2), bottom: MATCH_ODD },
    fidelity: ['wavefunction-well-eigen', 'plot-well-match'],
    claims: [
      claim('l20E1Fin', 'the lowest level has E = 0.784', () => close(V.l20E1Fin, 0.784194, 5e-4)),
      claim('l20E2Fin', 'the next has E = 3.062', () => close(V.l20E2Fin, 3.06177, 5e-4)),
      claim('l20E3Fin', 'and the third has E = 6.463', () => close(V.l20E3Fin, 6.46311, 5e-4)),
      claim('l20NBound', 'the well holds 3 levels', () => V.l20NBound === 3),
      claim('l20NEven', 'two of them are even', () => V.l20NEven === 2),
    ],
  },
  {
    id: 'l20-finite:b7',
    phase: 'books',
    text: `Townsend (§6.8, pp. 215–217, Fig. 6.9) draws a well with four bound states, and the higher ones have longer tails. He postpones the matching condition. In ours the decay length $1/\\kappa$ grows over the three levels, to ${d(V.l20DecayLen1, 3)}, ${d(V.l20DecayLen2, 3)} and ${d(V.l20DecayLen3, 3)}, because each level lies closer to the top. The constants are $\\kappa = ${d(V.l20Kappa1, 3)}$, ${d(V.l20Kappa2, 3)} and ${d(V.l20Kappa3, 3)}.`,
    caption: 'level 3, the highest of the three: its tail is the longest (the window clips it)',
    stage: WELL(3),
    fidelity: ['wavefunction-well-eigen'],
    refs: [townsend('§6.8, pp. 215–217 (Fig. 6.9)', 'A finite well with four bound states: the oscillation inside matches a decaying exponential outside, and the higher levels have longer tails.')],
    claims: [
      claim('l20DecayLen1', 'the decay length of level 1 is 0.263', () => close(V.l20DecayLen1, 0.263234, 5e-4)),
      claim('l20DecayLen2', 'of level 2 it is 0.318', () => close(V.l20DecayLen2, 0.318199, 5e-4)),
      claim('l20DecayLen3', 'of level 3 it is 0.570', () => close(V.l20DecayLen3, 0.570379, 5e-4)),
      claim('l20Kappa1', 'κ is 3.799 for level 1', () => close(V.l20Kappa1, 3.79890, 5e-4)),
      claim('l20Kappa2', '3.143 for level 2', () => close(V.l20Kappa2, 3.14269, 5e-4)),
      claim('l20Kappa3', 'and 1.753 for level 3', () => close(V.l20Kappa3, 1.75322, 5e-4)),
    ],
  },
  {
    id: 'l20-finite:b8',
    phase: 'clue',
    text: 'A barrier and a well both have exponentials where $E < V$. Why does one give a transmission probability and the other a list of allowed energies?',
    stage: WELL(2),
    fidelity: ['wavefunction-well-eigen'],
    reveal: {
      text: `For the barrier we choose $E$ and solve for the amplitudes, because the incoming beam sets the scale. For the well nothing may grow without bound, and that demand fixes $E$. Level 2 sits at ${d(V.l20E2Fin, 3)}, where the odd mismatch crosses zero.`,
      caption: 'the odd mismatch crosses zero only at the odd level',
      stage: { layout: 'split', top: WELL(2), bottom: MATCH_ODD },
      fidelity: ['wavefunction-well-eigen', 'plot-well-match'],
      claims: [claim('l20E2Fin', 'level 2 sits at 3.062', () => close(V.l20E2Fin, 3.06177, 5e-4))],
    },
  },
  {
    id: 'l20-finite:b9',
    phase: 'deeper',
    text: `Beyond the notes: why only finitely many levels? Below $V_0$ the inside wave number stays under $\\sqrt{2mV_0}/\\hbar$, so only so many half-waves fit. Level $n$ exists once $V_0$ exceeds the infinite-well energy of level $n - 1$ for the same width. For $a = 2$ the second, third and fourth levels appear at $V_0 = ${d(V.l20Thresh2, 3)}$, ${d(V.l20Thresh3, 3)} and ${d(V.l20Thresh4, 2)}. A well of any depth keeps at least one level: even a very shallow one holds ${d(V.l20ShallowCount, 0)}.`,
    caption: 'the even mismatch for the well with V₀ = 8: its zeros are the two even levels, and a deeper well would add more zeros',
    stage: MATCH_EVEN(),
    fidelity: ['plot-well-match'],
    claims: [
      claim('l20Thresh2', 'the second level appears at V₀ = 1.234', () => close(V.l20Thresh2, 1.2337, 5e-4)),
      claim('l20Thresh3', 'the third at 4.935', () => close(V.l20Thresh3, 4.9348, 5e-4)),
      claim('l20Thresh4', 'and the fourth at 11.10', () => close(V.l20Thresh4, 11.1033, 5e-3)),
      claim('l20ShallowCount', 'a very shallow well holds 1 level', () => V.l20ShallowCount === 1),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l20-compare — Finite against infinite; bound but moving                                         */
/* ---------------------------------------------------------------------------------------------- */

const compare: Beat[] = [
  {
    id: 'l20-compare:b1',
    phase: 'lecture',
    text: `Compare the finite well with the infinite one of the same width, $a = 2$. The infinite levels are ${d(V.l20E1Inf, 3)}, ${d(V.l20E2Inf, 3)} and ${d(V.l20E3Inf, 2)}. The finite ones are ${d(V.l20E1Fin, 3)}, ${d(V.l20E2Fin, 3)} and ${d(V.l20E3Fin, 3)}, which is ${d(V.l20E1Ratio, 3)}, ${d(V.l20E2Ratio, 3)} and ${d(V.l20E3Ratio, 3)} of their twins. Every finite level lies below its twin. Above $V_0$ the outside wave stops decaying, and a continuum of scattering states begins.`,
    caption: 'the finite-well levels as a fraction of the infinite-well levels: all three lie below 1',
    stage: RATIO_LEVELS,
    claims: [
      claim('l20E1Inf', 'the infinite-well levels of width 2 start at 1.234', () => close(V.l20E1Inf, 1.2337, 5e-4)),
      claim('l20E2Inf', 'then 4.935', () => close(V.l20E2Inf, 4.9348, 5e-4)),
      claim('l20E3Inf', 'and 11.10', () => close(V.l20E3Inf, 11.1033, 5e-3)),
      claim('l20E1Fin', 'the finite ones start at 0.784', () => close(V.l20E1Fin, 0.784194, 5e-4)),
      claim('l20E2Fin', 'then 3.062', () => close(V.l20E2Fin, 3.06177, 5e-4)),
      claim('l20E3Fin', 'and 6.463', () => close(V.l20E3Fin, 6.46311, 5e-4)),
      claim('l20E1Ratio', 'the ratios are 0.636', () => close(V.l20E1Ratio, 0.635644, 5e-4)),
      claim('l20E2Ratio', '0.620', () => close(V.l20E2Ratio, 0.620443, 5e-4)),
      claim('l20E3Ratio', 'and 0.582', () => close(V.l20E3Ratio, 0.582089, 5e-4)),
    ],
  },
  {
    id: 'l20-compare:b2',
    phase: 'lecture',
    text: `Raise the walls and the finite well turns into the infinite one. The ground level climbs toward the infinite value: the ratio is ${d(V.l20E1Ratio, 3)}, ${d(V.l20RatioV32, 3)}, ${d(V.l20RatioV128, 3)}, ${d(V.l20RatioV512, 3)} and ${d(V.l20RatioV2048, 3)} for $V_0 = 8, 32, 128, 512, 2048$. The chance outside shrinks: ${d(100 * V.l20TailGround, 2)} %, ${d(100 * V.l20TailV32, 3)} %, ${d(100 * V.l20TailV128, 4)} %, ${d(100 * V.l20TailV512, 5)} % and ${d(100 * V.l20TailV2048, 6)} %. In the two conditions $\\kappa \\to \\infty$ makes $\\tan\\tfrac{ka}{2}$ and $-\\cot\\tfrac{ka}{2}$ grow without bound. Both conditions need $\\tfrac{ka}{2}$ to approach the pole from below, so $k$ stays under $n\\pi/a$ and every finite level lies under its twin.`,
    caption: 'the ground level over its infinite twin as the well deepens: the ratio climbs toward 1',
    stage: RATIO_DEPTH,
    derivation: {
      result: 'k_n = \\dfrac{n\\pi}{a}',
      ground: [
        {
          tex: '\\kappa \\to \\infty',
          why: 'Raise the walls: $\\kappa = \\sqrt{2m(V_0 - E)}/\\hbar$ grows without limit at a fixed $E$.',
          view: RATIO_DEPTH,
          viewCaption: 'the ground level as the walls rise: the ratio climbs toward 1',
        },
        {
          tex: '\\tan\\tfrac{ka}{2} = \\dfrac{\\kappa}{k} \\to +\\infty \\;\\Rightarrow\\; k = \\dfrac{(2j + 1)\\pi}{a}',
          why: 'The even condition needs a tangent that grows without bound, so $\\tfrac{ka}{2}$ approaches an odd multiple of $\\tfrac{\\pi}{2}$.',
        },
        {
          tex: '-\\cot\\tfrac{ka}{2} = \\dfrac{\\kappa}{k} \\to +\\infty \\;\\Rightarrow\\; k = \\dfrac{2j\\pi}{a}',
          why: 'The odd condition needs a cotangent that grows, so $\\tfrac{ka}{2}$ approaches a multiple of $\\pi$.',
          view: WELL(2),
          viewCaption: 'level 2 of the well: odd, the sine with one node',
        },
        { tex: 'k = \\dfrac{(2j + 1)\\pi}{a}\\ \\mathrm{or}\\ \\dfrac{2j\\pi}{a} \\;\\Rightarrow\\; k_n = \\dfrac{n\\pi}{a}', why: 'Odd and even multiples together are every whole multiple: the infinite well.' },
      ],
    },
    claims: [
      claim('l20TailGround', 'for V₀ = 8 the tail chance is 2.04 %', () => close(V.l20TailGround, 0.0204264, 5e-5)),
      claim('l20RatioV32', 'for V₀ = 32 the ratio is 0.789', () => close(V.l20RatioV32, 0.789221, 5e-4)),
      claim('l20RatioV128', 'for 128 it is 0.886', () => close(V.l20RatioV128, 0.885664, 5e-4)),
      claim('l20RatioV512', 'for 512 it is 0.940', () => close(V.l20RatioV512, 0.940291, 5e-4)),
      claim('l20RatioV2048', 'and for 2048 it is 0.969', () => close(V.l20RatioV2048, 0.969465, 5e-4)),
      claim('l20TailV32', 'the tail chance for V₀ = 32 is 0.343 %', () => close(V.l20TailV32, 0.00342748, 5e-6)),
      claim('l20TailV128', 'for 128 it is 0.0504 %', () => close(V.l20TailV128, 0.000504164, 5e-7)),
      claim('l20TailV512', 'for 512 it is 0.00687 %', () => close(V.l20TailV512, 6.8733e-5, 5e-8)),
      claim('l20TailV2048', 'and for 2048 it is 0.000899 %', () => close(V.l20TailV2048, 8.98718e-6, 5e-9)),
    ],
  },
  {
    id: 'l20-compare:b3',
    phase: 'lecture',
    text: 'Unit 14.5 showed that one energy state has a fixed density, and that two energies make the density move. The same holds for bound states. Take a box of width 6 and the mix $\\Psi = (\\varphi_1e^{-iE_1t} + \\varphi_2e^{-iE_2t})/\\sqrt{2}$ of two real states. Then $|\\Psi|^2 = \\dfrac{\\varphi_1^2 + \\varphi_2^2}{2} + \\varphi_1\\varphi_2\\cos\\dfrac{(E_2 - E_1)t}{\\hbar}$. A direct complex evolution and this formula agree to rounding error. Bound does not mean motionless.',
    caption: 'a mix of levels 1 and 2: the density slides back and forth between the walls while the energy readout stays fixed',
    stage: W(BOX(6, [1, 2]), { time: sweep(0, 8), show: ['density'], readouts: ['xmean', 'energy'] }),
    fidelity: ['wavefunction-box-walls'],
    claims: [claim('l20SloshFormulaGap', 'the pair density and the formula differ by 0 (to rounding)', () => V.l20SloshFormulaGap < 1e-12)],
  },
  {
    id: 'l20-compare:b4',
    phase: 'lecture',
    text: `The size and rhythm, for a box of width 6. Here $E_1 = ${d(V.l20E1L6, 4)}$ and $E_2 - E_1 = 3E_1 = ${d(V.l20DeltaEL6, 3)}$, so the density repeats after $2\\pi\\hbar/(E_2 - E_1) = ${d(V.l20SloshPeriodL6, 2)}$. The mean position swings between ${d(V.l20MeanXmin, 3)} and ${d(V.l20MeanXmax, 3)} about the centre 3. The amplitude $16a/(9\\pi^2) = ${d(V.l20SloshAmpL6, 3)}$ is the matrix element of $x$ between levels 1 and 2.`,
    caption: 'the mean position over one period: a swing of about one unit either side of the centre',
    stage: W(BOX(6, [1, 2]), { time: sweep(0, 8), show: ['density'], readouts: ['xmean'] }),
    fidelity: ['wavefunction-box-walls'],
    claims: [
      claim('l20E1L6', 'in a box of width 6, E₁ = 0.1371', () => close(V.l20E1L6, 0.137078, 5e-5)),
      claim('l20DeltaEL6', 'and E₂ − E₁ = 0.411', () => close(V.l20DeltaEL6, 0.411234, 5e-4)),
      claim('l20SloshPeriodL6', 'so the period is 15.28', () => close(V.l20SloshPeriodL6, 15.2789, 5e-3)),
      claim('l20MeanXmin', 'the mean position reaches 1.919', () => close(V.l20MeanXmin, 1.91924, 5e-4)),
      claim('l20MeanXmax', 'and 4.081', () => close(V.l20MeanXmax, 4.08076, 5e-4)),
      claim('l20SloshAmpL6', 'with amplitude 1.081', () => close(V.l20SloshAmpL6, 1.08076, 5e-4)),
    ],
  },
  {
    id: 'l20-compare:b5',
    phase: 'clue',
    text: 'In the level-2 eigenstate of a box, does the density change with time? What about in a mix of levels 1 and 2?',
    stage: W(BOX(6, 2), { time: sweep(0, 8), show: ['density'] }),
    reveal: {
      text: `In one eigenstate only the phase turns, so the density stays put. In the mix the density slides back and forth, repeating every ${d(V.l20SloshPeriodL6, 2)}. Two energies make motion; one energy never does.`,
      caption: 'the mix of levels 1 and 2: the density now moves',
      stage: W(BOX(6, [1, 2]), { time: sweep(0, 8), show: ['density'] }),
      claims: [claim('l20SloshPeriodL6', 'the period is 15.28', () => close(V.l20SloshPeriodL6, 15.2789, 5e-3))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l20-oscillator — A first look at the oscillator (optional)                                      */
/* ---------------------------------------------------------------------------------------------- */

const oscillator: Beat[] = [
  {
    id: 'l20-oscillator:b1',
    phase: 'lecture',
    text: `This unit is optional, and nothing later relies on it. Most real traps are smooth. Near a stable minimum $V \\approx V(0) + \\dfrac{V''(0)}{2}x^2$, so $m\\omega^2 = V''(0)$ and the oscillator is the first approximation. For $V = 2(1 - \\cos x)$ with $m = 1$, $V''(0) = ${d(V.l20Curvature, 0)}$ and $\\omega = ${d(V.l20OmegaPend, 3)}$.`,
    caption: 'a packet displaced from the bottom of a harmonic well swings back and forth',
    stage: W(PK(2, 1, 0), { potential: { harmonic: { omega: V.l20OmegaPend } }, time: sweep(0, 6), window: { x: [-8, 8] } }),
    fidelity: ['wavefunction-potential-splitstep'],
    claims: [
      claim('l20Curvature', 'the curvature of 2(1 − cos x) at 0 is 2', () => close(V.l20Curvature, 2, 1e-12)),
      claim('l20OmegaPend', 'so ω = 1.414', () => close(V.l20OmegaPend, Math.SQRT2, 1e-9)),
    ],
  },
  {
    id: 'l20-oscillator:b2',
    phase: 'lecture',
    text: `Could the lowest state sit at $x = 0$, $p = 0$ and $E = 0$? No: a sharp $x$ and a sharp $p$ cannot coexist. A Gaussian with $\\Delta p = \\hbar/2\\sigma$ has $\\langle H\\rangle = \\dfrac{\\hbar^2}{8m\\sigma^2} + \\dfrac{m\\omega^2\\sigma^2}{2}$. In units with $\\hbar = m = \\omega = 1$ it is smallest at $\\sigma = ${d(V.l20HEstimateWidth, 4)}$, where it equals ${d(V.l20HEstimate, 3)}, that is $\\hbar\\omega/2$. This is an estimate from uncertainty alone. A later lecture finds the energies exactly.`,
    caption: 'a Gaussian of the best width in the well: it does not breathe, and the product of its spreads is one half',
    stage: W(PK(0, V.l20HEstimateWidth, 0), { potential: { harmonic: { omega: 1 } }, time: sweep(0, 4), readouts: ['xspread', 'pspread'] }),
    fidelity: ['wavefunction-potential-splitstep'],
    claims: [
      claim('l20HEstimateWidth', 'the width that minimises the energy is 0.7071', () => close(V.l20HEstimateWidth, Math.SQRT1_2, 5e-5)),
      claim('l20HEstimate', 'and the minimum is 0.500', () => close(V.l20HEstimate, 0.5, 1e-9)),
    ],
  },
  {
    id: 'l20-oscillator:b3',
    phase: 'lecture',
    text: 'Make the variables dimensionless: $X = \\sqrt{m\\omega/\\hbar}\\,\\hat x$ and $P = \\hat p/\\sqrt{m\\hbar\\omega}$. Then $[X, P] = i$ and $H = \\tfrac{\\hbar\\omega}{2}(X^2 + P^2)$. The engine checks $[\\hat x, \\hat p]\\psi = i\\hbar\\psi$ on a Gaussian on its grid and finds agreement to the grid\'s accuracy. The overlays show $\\hat x\\psi$ and $\\hat p\\psi$ for the Gaussian.',
    caption: 'the Gaussian with its $x\\psi$ and $p\\psi$ overlays: the factor of $x$ stretches it, the factor of $p$ turns it imaginary',
    stage: W(PK(0, V.l20HEstimateWidth, 0), { overlay: ['xpsi', 'ppsi'] }),
  },
  {
    id: 'l20-oscillator:b4',
    phase: 'clue',
    text: 'Define $\\hat a = (X + iP)/\\sqrt{2}$ and $\\hat a^\\dagger = (X - iP)/\\sqrt{2}$. Why is $\\hat a^\\dagger\\hat a$ not simply $(X^2 + P^2)/2$?',
    stage: W(PK(0, V.l20HEstimateWidth, 0), { overlay: ['xpsi', 'ppsi'] }),
    reveal: {
      text: 'The reason is that $X$ and $P$ fail to commute. Multiplying out gives $\\hat a^\\dagger\\hat a = \\tfrac{1}{2}(X^2 + P^2 - 1)$, so $H = \\hbar\\omega(\\hat a^\\dagger\\hat a + \\tfrac{1}{2})$. We stop here. Why $\\hat a$ and $\\hat a^\\dagger$ lower and raise the energy is the next question.',
      caption: 'the same Gaussian: the commutator is the extra $-1$ in the product',
      stage: W(PK(0, V.l20HEstimateWidth, 0), { overlay: ['xpsi', 'ppsi'] }),
    },
  },
]

export const L20_STORY: Record<string, Beat[]> = {
  'l20-reverse': reverse,
  'l20-infinite': infinite,
  'l20-finite': finite,
  'l20-compare': compare,
  'l20-oscillator': oscillator,
}

/** Every claim of a unit's beats, reveals and derivation steps (each unit's `claims`: the number reader backs a unit's prose with it). */
const claimsOf = (beats: Beat[]): Claim[] => beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground ?? []).flatMap((s) => s.claims ?? [])])
export const L20_UNIT_CLAIMS: Record<string, Claim[]> = Object.fromEntries(Object.entries(L20_STORY).map(([id, beats]) => [id, claimsOf(beats)]))
