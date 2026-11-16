/**
 * Lecture 19 scroll story (owner: P). Beats per docs/roles/proposals/P-L19-story.md §1, with the judge's rulings (docs/roles/decisions/448-L19L20.md, R1–R10, and the Townsend-pass
 * conventions 448-townsend.md, T1–T11, 448-L14L18.md M1–M7):
 * - R1: the barrier result stays in Lecture 18 (the App. A route, the thick form, the inner current, the p. 231 Correction). L19 owns the direct-elimination route (all four amplitudes), the
 *   stationary state as a whole, the reading of T against width, height and mass, the E → V₀ caution, and the energy bookkeeping and uses. `l19-match:b1` is a link-back, not a second derivation.
 *   Numbers Lecture 18 owns are cited under their L18 keys (`claim18`, `V18`), never re-keyed.
 * - R3: the stage source `barrierWave: {E, V0, a}` draws the stationary state; every packet picture is Lecture 17's `wavefunction` with a `potential`; the plot curves are `barrierT` and `barrierThick`.
 * - R6: Townsend Problem 6.21 (the delta barrier) and the p. 231 macroscopic estimate were read on their page images. Problem 6.23 asks for a derivation of Eq. 6.144 and Problem 6.25 is field
 *   emission, so the width and the tunnelling-microscope practice questions cite the chapter's problems without a number of their own.
 * - R7: alpha decay is a labelled MODEL (no reported half-lives, ruling T4); `l19-energy:b5` is the approved Go-deeper beat.
 * - R8: the notes' t is our τ (M4), Townsend's q is our κ and his F, G, C are our A, B, τ; the instructor's editing note on p. 6 is ignored.
 * One track (448): sentences stay ≤ 25 words, symbols are defined before use, link-back beats name the unit they recall and define nothing new.
 *
 * Rules kept here (as in L1–L18.story.ts): stage states carry physics inputs only; every number in the prose comes from L19.values.ts (or L18.values.ts under its own key) and is backed by a keyed
 * claim; clue beats are click-to-reveal and last in their unit but for one Go-deeper beat; lengths are in ℓ, momenta in ħ/ℓ, times in mℓ²/ħ. A fraction with a digit on both sides of the bar is read as a
 * number by the number reader, so formulas write \tfrac{k}{\kappa} and the like, and an input that is not a whole number is a key too (`l19Ka15`) or is not typed.
 */
import type { Beat, Claim, ComplexPlaneState, PlotState, Ref, Scrub, WavefunctionState } from './schema'
import { V, claim, close, d } from './L19.values'
import { V as V18, claim as claim18 } from './L18.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const sweep = (from: number, to: number): Scrub => ({ from, to })
const cp = (o: Omit<ComplexPlaneState, 'kind'>): ComplexPlaneState => ({ kind: 'complex-plane', shot: 'C-FLAT', ...o })
const PK = (x0: Scrub, sigma: Scrub, p0?: Scrub): WavefunctionState['source'] => ({ packet: { x0, sigma, ...(p0 === undefined ? {} : { p0 }) } })
const W = (source: WavefunctionState['source'], o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => ({ kind: 'wavefunction', source, shot: 'W-STD', ...o })

/** Below the step: p₀ = 2 and V₀ = 4, so E = 2 = V₀/2 and k = κ = 2 (Lecture 18's run); the packet reaches the step at t = 4. */
const LOW_RUN = (o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => W(PK(-8, 2, 2), { potential: { step: { V0: 4 } }, time: sweep(0, 9), window: { x: [-16, 16] }, ...o })
/** The same packet at a barrier of height 4 and width ½ (κa = 1). */
const BAR_RUN = (o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => W(PK(-8, 2, 2), { potential: { barrier: { V0: 4, a: 0.5 } }, time: sweep(0, 9), window: { x: [-16, 16] }, ...o })
/** The stationary state with E = 2 and V₀ = 4 (k = κ = 2) and a barrier of width a: κa = 2a. */
const S = (a: number, o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => W({ barrierWave: { E: 2, V0: 4, a } }, o)
const FIDELITY_S = ['wavefunction-barrier-stationary']
const FIDELITY_P = ['wavefunction-potential-splitstep']

/** The transmission of a barrier with E = V₀/2 against κa (Eq. 6.144), with a dot at each given κa; and the same beside the thick-barrier form of Eq. 6.146. */
const BARRIER_T = (...ka: number[]): PlotState => ({ kind: 'plot', shot: 'P-CURVE', curve: { fn: 'barrierT', samples: 120 }, markers: ka.map((x) => ({ x })) })
const BARRIER_THICK = (...ka: number[]): PlotState => ({ kind: 'plot', shot: 'P-CURVE', curve: { fn: 'barrierT', vs: 'barrierThick', x: { from: 1, to: 4 }, samples: 90 }, markers: ka.map((x) => ({ x })) })

const townsend = (where: string, adds: string): Ref => ({ source: 'townsend', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* l19-recap — A tail is not transmission                                                          */
/* ---------------------------------------------------------------------------------------------- */

const recapBeats: Beat[] = [
  {
    id: 'l19-recap:b1',
    phase: 'lecture',
    text: `Unit 18.1 and Unit 18.3 split a packet at a step and gave it a decaying tail. This beat defines nothing new; it recalls what we keep. A packet that meets a potential ends as a reflected packet and a transmitted one. Their areas are $R$ and $T$, and $R + T = 1$. We solve for plane waves because they are easy to solve, not because a plane wave is a particle. If the potential is the same on both sides, $T = |\\tau|^2$; with unequal sides the speed factor of Unit 18.2 appears. In the step run of Unit 18.3 at most ${d(V18.l18MaxPenetration, 2)} of the packet is ever inside the step.`,
    caption: 'a packet below the top of an infinite step: it enters as a tail and turns back',
    stage: LOW_RUN(),
    fidelity: FIDELITY_P,
    claims: [claim18('l18MaxPenetration', 'at most 0.10 of the packet is ever inside the step', () => close(V18.l18MaxPenetration, 0.10246, 5e-5))],
  },
  {
    id: 'l19-recap:b2',
    phase: 'lecture',
    text: `An infinite step has a tail but no outgoing wave. A barrier of finite width has a second edge, so the tail can reach it and turn into a travelling wave. We send the same packet at a barrier with $\\kappa a = 1$, where $\\kappa$ is the decay constant of Unit 18.3 and $a$ the width. Averaged over its energies, the share found beyond the barrier is ${d(V18.l18BarrierWeightedT, 4)}. A wave that arrives beyond a barrier it could not climb has [[tunnelling|tunnelled]].`,
    caption: 'the same packet at a thin barrier: part of it comes out on the far side',
    stage: BAR_RUN({ readouts: ['reflected', 'transmitted'] }),
    fidelity: FIDELITY_P,
    claims: [claim18('l18BarrierWeightedT', 'a packet of width 2 has 0.4196 beyond the barrier', () => close(V18.l18BarrierWeightedT, 0.419649, 5e-5))],
  },
  {
    id: 'l19-recap:b3',
    phase: 'clue',
    text: 'Why did the infinite step have a tail but no transmission?',
    stage: LOW_RUN(),
    reveal: {
      text: 'Nothing lay beyond the tail to carry the flow away. A single decaying exponential is real, up to a constant, so its probability current is zero. A second edge gives the tail somewhere to go.',
      caption: 'with a second edge the tail joins a travelling wave on the far side',
      stage: BAR_RUN({ readouts: ['transmitted'] }),
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l19-regions — Three regions, two kinds of solution                                              */
/* ---------------------------------------------------------------------------------------------- */

const regionsBeats: Beat[] = [
  {
    id: 'l19-regions:b1',
    phase: 'lecture',
    text: `One equation, two signs. A state of definite energy obeys $-\\tfrac{\\hbar^2}{2m}\\varphi'' + V\\varphi = E\\varphi$. Outside the barrier $V = 0$, so $\\varphi'' = -k^2\\varphi$ with $k = \\sqrt{2mE}/\\hbar$, and the solutions turn: $e^{\\pm ikx}$. Inside, $V_0 > E$, so $\\varphi'' = +\\kappa^2\\varphi$ with $\\kappa = \\sqrt{2m(V_0 - E)}/\\hbar$, and the solutions grow and fall: $e^{\\pm\\kappa x}$. Where the curvature changes sign, the shape changes with it. We take $\\hbar = m = 1$, $E = 2$ and $V_0 = 4$, so $k = ${d(V.l19KS, 0)}$ and $\\kappa = ${d(V.l19KappaS, 0)}$.`,
    caption: 'the stationary state at a barrier with $\\kappa a = 2$: it oscillates outside and bends the other way inside',
    stage: S(1, { show: ['re', 'density'] }),
    fidelity: FIDELITY_S,
    claims: [
      claim('l19KS', 'for E = 2 the wave number is k = 2', () => close(V.l19KS, 2, 1e-12)),
      claim('l19KappaS', 'for V₀ − E = 2 the decay constant is κ = 2', () => close(V.l19KappaS, 2, 1e-12)),
    ],
  },
  {
    id: 'l19-regions:b2',
    phase: 'lecture',
    text: `Write one solution in three pieces, with incident amplitude 1. For $x < 0$ it is $\\varphi_I = e^{ikx} + re^{-ikx}$. For $0 \\le x \\le a$, where $a$ is the width of the barrier, it is $\\varphi_{II} = Ae^{\\kappa x} + Be^{-\\kappa x}$. For $x > a$ it is $\\varphi_{III} = \\tau e^{ikx}$. Nothing comes in from the right, so region III has no $e^{-ikx}$. The notes write $t$ for the amplitude $\\tau$, but here $t$ is time. These four numbers are [[reflection-amplitude|amplitudes]], not yet chances.`,
    caption: 'the three regions of the barrier: incident and reflected waves, two exponentials, one transmitted wave',
    stage: S(0.5),
    fidelity: FIDELITY_S,
  },
  {
    id: 'l19-regions:b3',
    phase: 'clue',
    text: 'The barrier has a finite width $a$. Why do we keep both exponentials inside it?',
    stage: S(1, { show: ['density'] }),
    reveal: {
      text: `Neither one can blow up, because the region ends. In an infinite region the growing one would be dropped, as for the infinite step. For $k = \\kappa$ and $\\kappa a = 2$ the coefficient $B$ is larger than $A$ by $|B/A| = e^{2\\kappa a} = ${d(V.l19RatioBA2, 1)}$.`,
      caption: 'inside the barrier the density falls and rises again: both exponentials are present',
      stage: S(1, { show: ['density'] }),
      fidelity: FIDELITY_S,
      claims: [claim('l19RatioBA2', 'for k = κ and κa = 2 the ratio |B/A| is e⁴ = 54.6', () => close(V.l19RatioBA2, Math.exp(4), 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l19-match — Four conditions give the transmitted amplitude                                      */
/* ---------------------------------------------------------------------------------------------- */

const matchBeats: Beat[] = [
  {
    id: 'l19-match:b1',
    phase: 'lecture',
    text: `Unit 18.4 matched the function and its slope at both edges. This beat defines nothing new; it writes the conditions in today's notation. At a finite jump of $V$ both $\\varphi$ and $\\varphi'$ are continuous, so we have four [[matching-conditions|matching conditions]]. At $x = 0$: $1 + r = A + B$ and $ik(1 - r) = \\kappa(A - B)$. At $x = a$: $Ae^{\\kappa a} + Be^{-\\kappa a} = \\tau e^{ika}$ and $\\kappa(Ae^{\\kappa a} - Be^{-\\kappa a}) = ik\\tau e^{ika}$. They fix the four amplitudes $r$, $A$, $B$ and $\\tau$. Unit 18.4 carried the data back from $x = a$ and kept only $|F/A|^2$; today we eliminate directly and keep every amplitude. The engine's solution satisfies all four to rounding error.`,
    caption: 'the same state, with the reflected and transmitted shares that the four conditions fix',
    stage: S(0.5, { show: ['density'], readouts: ['reflection', 'transmission'] }),
    fidelity: FIDELITY_S,
    claims: [claim('l19MatchResidual', 'the engine’s solution leaves a residual of rounding size in the four conditions', () => close(V.l19MatchResidual, 0, 1e-12))],
  },
  {
    id: 'l19-match:b2',
    phase: 'lecture',
    text: `Step 1: use the right edge. Divide the slope condition at $x = a$ by $\\kappa$. Add the two equations to isolate $Ae^{\\kappa a}$, and subtract them to isolate $Be^{-\\kappa a}$. The results are $A = \\tfrac{\\tau}{2}\\left(1 + \\tfrac{ik}{\\kappa}\\right)e^{ika - \\kappa a}$ and $B = \\tfrac{\\tau}{2}\\left(1 - \\tfrac{ik}{\\kappa}\\right)e^{ika + \\kappa a}$. The factors $e^{\\pm\\kappa a}$ appear because we matched at $x = a$, not at the origin. For $\\kappa a = 1$ and $k = \\kappa$ the sizes are $|A| = ${d(V.l19AbsA, 3)}$ and $|B| = ${d(V.l19AbsB, 3)}$ per unit incident amplitude.`,
    caption: 'the number $1 + ik/\\kappa$ for $k = \\kappa$: the arrow $1$ followed by the arrow $i$',
    stage: cp({ chain: { phasesDeg: [0, 90] } }),
    claims: [
      claim('l19AbsA', 'for κa = 1 and k = κ the size of A is 0.169', () => close(V.l19AbsA, 0.168578, 5e-5)),
      claim('l19AbsB', 'and the size of B is 1.246', () => close(V.l19AbsB, 1.245635, 5e-5)),
    ],
  },
  {
    id: 'l19-match:b3',
    phase: 'lecture',
    text: `Steps 2 and 3: use the left edge. Adding $1 + r = A + B$ to $1 - r = \\tfrac{\\kappa}{ik}(A - B)$ removes $r$: $2 = A + B + \\tfrac{\\kappa}{ik}(A - B)$. Put in Step 1 and group the terms in $e^{\\kappa a}$ and $e^{-\\kappa a}$. Dividing gives the transmitted amplitude below (D1). For $k = \\kappa$ the bracket is real, so $\\tau = e^{-ika}/\\cosh\\kappa a$. Its size is $|\\tau| = ${d(V.l19AbsT, 3)}$ and it lags the incident wave by $ka$, which is ${d(V.l19PhaseTMag, 1)}° here. Its square is ${d(V.l19L18Route, 4)}, the number that the route of Unit 18.4 found.`,
    caption: 'the transmission against $\\kappa a$: the dot is $\\kappa a = 1$, where $|\\tau|^2$ is read off',
    stage: BARRIER_T(1),
    derivation: {
      result: '\\tau = \\dfrac{4e^{-ika}}{4\\cosh\\kappa a + 2i\\left(\\tfrac{\\kappa}{k} - \\tfrac{k}{\\kappa}\\right)\\sinh\\kappa a}',
      ground: [
        {
          tex: '1 + r = A + B,\\quad ik(1 - r) = \\kappa(A - B),\\quad Ae^{\\kappa a} + Be^{-\\kappa a} = \\tau e^{ika},\\quad \\kappa(Ae^{\\kappa a} - Be^{-\\kappa a}) = ik\\tau e^{ika}',
          why: 'Continuity of the function and of its slope at the two edges.',
          view: S(0.5, { show: ['re', 'density'] }),
          viewCaption: 'the state whose four amplitudes the conditions fix',
        },
        {
          tex: 'Ae^{\\kappa a} + Be^{-\\kappa a} = \\tau e^{ika},\\quad Ae^{\\kappa a} - Be^{-\\kappa a} = \\tfrac{ik}{\\kappa}\\tau e^{ika}',
          why: 'Divide the slope condition at $x = a$ by $\\kappa$.',
          view: cp({ chain: { phasesDeg: [0, 90] } }),
          viewCaption: 'the number $1 + ik/\\kappa$ that appears next, for $k = \\kappa$',
        },
        {
          tex: 'A = \\tfrac{\\tau}{2}\\left(1 + \\tfrac{ik}{\\kappa}\\right)e^{ika - \\kappa a},\\quad B = \\tfrac{\\tau}{2}\\left(1 - \\tfrac{ik}{\\kappa}\\right)e^{ika + \\kappa a}',
          why: 'Add the two lines to isolate $Ae^{\\kappa a}$, and subtract them to isolate $Be^{-\\kappa a}$.',
        },
        {
          tex: '2 = A + B + \\tfrac{\\kappa}{ik}(A - B)',
          why: 'Add the two conditions at $x = 0$: the unknown $r$ cancels.',
        },
        {
          tex: '2 = \\tfrac{\\tau}{2}\\left[\\left(2 + i\\tfrac{k}{\\kappa} - i\\tfrac{\\kappa}{k}\\right)e^{ika - \\kappa a} + \\left(2 - i\\tfrac{k}{\\kappa} + i\\tfrac{\\kappa}{k}\\right)e^{ika + \\kappa a}\\right]',
          why: 'Put Step 1 in, and collect the terms in $e^{-\\kappa a}$ and in $e^{\\kappa a}$. This is substitution, not a new principle.',
        },
        {
          tex: '\\tau = \\dfrac{4e^{-ika}}{4\\cosh\\kappa a + 2i\\left(\\tfrac{\\kappa}{k} - \\tfrac{k}{\\kappa}\\right)\\sinh\\kappa a}',
          why: 'Group the growing and the decaying terms, using $e^{\\kappa a} \\pm e^{-\\kappa a} = 2\\cosh\\kappa a$ or $2\\sinh\\kappa a$, then divide by the bracket.',
          view: BARRIER_T(1),
          viewCaption: 'the transmission $|\\tau|^2$ for $E = \\tfrac{V_0}{2}$, against $\\kappa a$',
          claims: [claim('l19L18Route', 'the route of Unit 18.4 gives the same T = 0.4200 for κa = 1', () => close(V.l19L18Route, 0.419974, 5e-5))],
        },
      ],
    },
    claims: [
      claim('l19AbsT', 'for κa = 1 and k = κ the size of τ is 0.648', () => close(V.l19AbsT, 0.648054, 5e-5)),
      claim('l19PhaseTMag', 'its phase is −ka, 57.3° behind the incident wave', () => close(V.l19PhaseTMag, 57.29578, 5e-5)),
      claim('l19L18Route', '|τ|² is 0.4200, the value of the route of Unit 18.4', () => close(V.l19L18Route, 0.419974, 5e-5)),
    ],
  },
  {
    id: 'l19-match:b4',
    phase: 'lecture',
    text: `Both outside regions have $V = 0$, so $k$ and the speed are the same on both sides, and the speed factor of Unit 18.2 cancels: $T = |\\tau|^2$. For $\\kappa a = 1$ this is ${d(V18.l18BarrierT1, 4)}, the value of Unit 18.4. The reflected share comes from the same solution: $R = |r|^2 = ${d(V.l19R1, 4)}$. Together $R + T = ${d(V.l19RplusT, 0)}$.`,
    caption: 'the shares of the stationary state: the barrier sends some back and lets some through',
    stage: S(0.5, { show: ['density'], readouts: ['reflection', 'transmission'] }),
    fidelity: FIDELITY_S,
    claims: [
      claim18('l18BarrierT1', 'T = |τ|² = 0.4200 for κa = 1', () => close(V18.l18BarrierT1, 0.419974, 5e-5)),
      claim('l19R1', 'the reflected share is 0.5800', () => close(V.l19R1, 0.580026, 5e-5)),
      claim('l19RplusT', 'and R + T = 1', () => close(V.l19RplusT, 1, 1e-12)),
    ],
  },
  {
    id: 'l19-match:b5',
    phase: 'lecture',
    text: `Now the whole stationary state is in view. Left of the barrier the incident and reflected waves interfere, and the density swings between $(1 - |r|)^2 = ${d(V.l19FringeMin, 4)}$ and $(1 + |r|)^2 = ${d(V.l19FringeMax, 3)}$. Inside, it falls and rises as $e^{\\pm\\kappa x}$. Right of the barrier it is flat, at $T$. The current is the same everywhere. Left of the barrier it is $k(1 - |r|^2) = ${d(V.l19CurrentLeft, 4)}$, and inside it is the ${d(V18.l18BarrierInnerCurrent, 4)} of Unit 18.4.`,
    caption: 'the density: fringes on the left, a dip and rise inside, a flat level on the right',
    stage: S(0.5, { show: ['density'] }),
    fidelity: FIDELITY_S,
    claims: [
      claim('l19FringeMax', 'the density peaks at (1 + |r|)² = 3.103', () => close(V.l19FringeMax, 3.103214, 5e-4)),
      claim('l19FringeMin', 'and dips to (1 − |r|)² = 0.0568', () => close(V.l19FringeMin, 0.056837, 5e-5)),
      claim('l19CurrentLeft', 'the current left of the barrier is k(1 − |r|²) = 0.8399', () => close(V.l19CurrentLeft, 0.839949, 5e-5)),
      claim18('l18BarrierInnerCurrent', 'the current inside is 0.8399', () => close(V18.l18BarrierInnerCurrent, 0.839949, 5e-5)),
    ],
  },
  {
    id: 'l19-match:b6',
    phase: 'books',
    text: `Townsend (§6.10, pp. 230–231, Eqs. 6.143–6.144) solves the same four conditions. His $F$, $G$ and $C$ are our $A$, $B$ and $\\tau$, with the incident amplitude divided out, and his $q$ is our $\\kappa$. He reaches $T = 1/[1 + ((k^2 + q^2)/2kq)^2\\sinh^2 qa]$. That is the form of the notes, because $\\tfrac{V_0^2}{E(V_0 - E)} = \\left(\\tfrac{\\kappa}{k} + \\tfrac{k}{\\kappa}\\right)^2$, which is ${d(V.l19Identity, 0)} here. For $\\kappa a = 1$ both give ${d(V18.l18BarrierT1, 4)}, equal to rounding error.`,
    caption: 'the transmission of the barrier with $E = \\tfrac{V_0}{2}$ against $\\kappa a$; the dot marks $\\kappa a = 1$',
    stage: BARRIER_T(1),
    refs: [townsend('§6.10, pp. 230–231 (Eqs. 6.143–6.144)', 'The four matching conditions at a square barrier and the transmission coefficient that they give, in the book’s symbols.')],
    claims: [
      claim('l19Identity', 'for k = κ the identity V₀²/E(V₀ − E) = (κ/k + k/κ)² has the value 4', () => close(V.l19Identity, 4, 1e-12)),
      claim('l19FormDiff', 'the notes’ form and Townsend’s agree to rounding error', () => close(V.l19FormDiff, 0, 1e-12)),
      claim18('l18BarrierT1', 'both forms give 0.4200 for κa = 1', () => close(V18.l18BarrierT1, 0.419974, 5e-5)),
    ],
  },
  {
    id: 'l19-match:b7',
    phase: 'clue',
    text: 'The potential is the same on both sides of the barrier. What links the transmitted amplitude $\\tau$ to the chance $T$ of getting through?',
    stage: S(0.5, { show: ['density'] }),
    reveal: {
      text: `The square: $T = |\\tau|^2$, because the speeds on the two sides are equal. If the right side had another potential, $k$ would differ there and the speed factor $\\tfrac{k_2}{k_1}$ of Unit 18.2 would enter. Here $|\\tau|^2 = ${d(V18.l18BarrierT1, 4)}$.`,
      caption: 'the transmitted share, read from the amplitude',
      stage: S(0.5, { show: ['density'], readouts: ['transmission'] }),
      fidelity: FIDELITY_S,
      claims: [claim18('l18BarrierT1', '|τ|² = 0.4200', () => close(V18.l18BarrierT1, 0.419974, 5e-5))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l19-thick — Reading T: width, height, mass                                                      */
/* ---------------------------------------------------------------------------------------------- */

const thickBeats: Beat[] = [
  {
    id: 'l19-thick:b1',
    phase: 'lecture',
    text: `The boxed result of the notes is $T = \\left[1 + \\tfrac{V_0^2}{16E(V_0 - E)}(e^{\\kappa a} - e^{-\\kappa a})^2\\right]^{-1}$. It is positive for every finite $a$, so a particle can pass a region where $E < V_0$. Squaring the size of the denominator in D1 gives it in a few lines (D2, optional). For $\\kappa a = 2$ it is ${d(V18.l18BarrierT2, 4)}.`,
    caption: 'the stationary state for $\\kappa a = 2$: much less gets through than for $\\kappa a = 1$',
    stage: S(1, { show: ['density'], readouts: ['transmission'] }),
    fidelity: FIDELITY_S,
    derivation: {
      result: 'T^{-1} = 1 + \\tfrac{V_0^2}{16E(V_0 - E)}(e^{\\kappa a} - e^{-\\kappa a})^2',
      ground: [
        {
          tex: '16T^{-1} = 4(e^{\\kappa a} + e^{-\\kappa a})^2 + \\left(\\tfrac{\\kappa}{k} - \\tfrac{k}{\\kappa}\\right)^2(e^{\\kappa a} - e^{-\\kappa a})^2',
          why: 'Write the denominator of D1 with exponentials. Its squared size is the real part squared plus the imaginary part squared, and $|e^{-ika}|^2 = 1$.',
          view: S(1, { show: ['density'], readouts: ['transmission'] }),
          viewCaption: 'the state whose transmitted share $T$ is being found',
        },
        {
          tex: '(e^{\\kappa a} + e^{-\\kappa a})^2 = (e^{\\kappa a} - e^{-\\kappa a})^2 + 4',
          why: 'Use the identity $4uv = (u + v)^2 - (u - v)^2$ with $u = e^{\\kappa a}$ and $v = e^{-\\kappa a}$, so that $uv = 1$.',
          view: BARRIER_THICK(2),
          viewCaption: 'the exact transmission and its thick-barrier form, which this identity leads to',
        },
        {
          tex: '16T^{-1} = 16 + \\left[4 + \\left(\\tfrac{\\kappa}{k} - \\tfrac{k}{\\kappa}\\right)^2\\right](e^{\\kappa a} - e^{-\\kappa a})^2',
          why: 'Put the identity into the first line and collect the terms in $(e^{\\kappa a} - e^{-\\kappa a})^2$.',
        },
        {
          tex: '4 + \\left(\\tfrac{\\kappa}{k} - \\tfrac{k}{\\kappa}\\right)^2 = \\left(\\tfrac{\\kappa}{k} + \\tfrac{k}{\\kappa}\\right)^2 = \\tfrac{V_0^2}{E(V_0 - E)}',
          why: 'The product of $\\tfrac{\\kappa}{k}$ and $\\tfrac{k}{\\kappa}$ is 1. And $k^2 = 2mE/\\hbar^2$ with $\\kappa^2 = 2m(V_0 - E)/\\hbar^2$ give $(k^2 + \\kappa^2)^2/k^2\\kappa^2 = V_0^2/E(V_0 - E)$.',
        },
        {
          tex: 'T^{-1} = 1 + \\tfrac{V_0^2}{16E(V_0 - E)}(e^{\\kappa a} - e^{-\\kappa a})^2',
          why: 'Divide by 16.',
          view: BARRIER_T(2),
          viewCaption: 'the transmission for $E = \\tfrac{V_0}{2}$; the dot is $\\kappa a = 2$',
          claims: [claim18('l18BarrierT2', 'for κa = 2 the transmission is 0.0707', () => close(V18.l18BarrierT2, 0.070651, 5e-5))],
        },
      ],
    },
    claims: [claim18('l18BarrierT2', 'for κa = 2 the transmission is 0.0707', () => close(V18.l18BarrierT2, 0.070651, 5e-5))],
  },
  {
    id: 'l19-thick:b2',
    phase: 'lecture',
    text: `For $\\kappa a \\gg 1$ we have $e^{\\kappa a} - e^{-\\kappa a} \\simeq e^{\\kappa a}$, so $T \\simeq 16\\,\\tfrac{E(V_0 - E)}{V_0^2}\\,e^{-2\\kappa a}$. The amplitude falls as $e^{-\\kappa a}$ and the chance is its square, which is why the exponent has a 2. This is the [[thick-barrier|thick-barrier]] form. For $E = \\tfrac{V_0}{2}$ the exact transmission is ${d(V.l19ThickRatio2, 3)} of it at $\\kappa a = 2$ and ${d(V.l19ThickRatio3, 3)} at $\\kappa a = 3$. Unit 18.4 had ${d(V18.l18BarrierT3, 5)} against ${d(V18.l18BarrierThick3, 5)}.`,
    caption: 'the exact transmission and its thick-barrier form meet for large $\\kappa a$',
    stage: BARRIER_THICK(3),
    claims: [
      claim('l19ThickRatio2', 'exact over thick is 0.964 at κa = 2', () => close(V.l19ThickRatio2, 0.964351, 5e-4)),
      claim('l19ThickRatio3', 'and 0.995 at κa = 3', () => close(V.l19ThickRatio3, 0.995061, 5e-4)),
      claim18('l18BarrierT3', 'the exact value at κa = 3 is 0.00987', () => close(V18.l18BarrierT3, 0.0098660, 5e-6)),
      claim18('l18BarrierThick3', 'against 0.00992 for the thick form', () => close(V18.l18BarrierThick3, 0.0099150, 5e-6)),
    ],
  },
  {
    id: 'l19-thick:b3',
    phase: 'lecture',
    text: `Width. Widen the barrier by $\\delta a$ and $T$ falls by about $e^{-2\\kappa\\,\\delta a}$. Doubling the width does not halve the effect; it doubles the exponent. From $\\kappa a = ${d(V.l19Ka15, 1)}$ to $\\kappa a = 3$, at $E = \\tfrac{V_0}{2}$, $T$ goes from ${d(V.l19T15, 4)} to ${d(V18.l18BarrierT3, 5)}, a factor ${d(V.l19DoubleFactor, 4)}. The slope of $\\ln T$ against $a$ tends to $-2\\kappa = -${d(V.l19TwoKappa, 0)}$; between $\\kappa a = 3$ and $4$ it is $-${d(V.l19LogSlopeMag, 2)}$. Height. Raise $V_0$ from 4 to 8 with $E$ and $a$ unchanged: $\\kappa$ goes from 2 to ${d(V.l19KappaV8, 2)} and $T$ from ${d(V18.l18BarrierT1, 3)} to ${d(V.l19TV8, 4)}.`,
    caption: 'the transmission against $\\kappa a$: the dots are $\\kappa a = 1.5$ and $\\kappa a = 3$',
    stage: BARRIER_T(1.5, 3),
    claims: [
      claim('l19Ka15', 'the half-way width has κa = 1.5', () => close(V.l19Ka15, 1.5, 1e-12)),
      claim('l19T15', 'there T = 0.1807', () => close(V.l19T15, 0.180707, 5e-5)),
      claim18('l18BarrierT3', 'and at κa = 3 it is 0.00987', () => close(V18.l18BarrierT3, 0.0098660, 5e-6)),
      claim('l19DoubleFactor', 'a fall by the factor 0.0546', () => close(V.l19DoubleFactor, 0.054597, 5e-5)),
      claim('l19TwoKappa', '2κ = 4', () => close(V.l19TwoKappa, 4, 1e-12)),
      claim('l19LogSlopeMag', 'the slope of ln T between κa = 3 and 4 is −3.99', () => close(V.l19LogSlopeMag, 3.991439, 5e-3)),
      claim('l19KappaV8', 'for V₀ = 8 and E = 2, κ = 3.46', () => close(V.l19KappaV8, 3.464102, 5e-3)),
      claim18('l18BarrierT1', 'T was 0.420 for V₀ = 4', () => close(V18.l18BarrierT1, 0.419974, 5e-4)),
      claim('l19TV8', 'and is 0.0910 for V₀ = 8', () => close(V.l19TV8, 0.090967, 5e-5)),
    ],
  },
  {
    id: 'l19-thick:b4',
    phase: 'lecture',
    text: `Mass. Since $\\kappa \\propto \\sqrt m$, a heavier particle meets a taller barrier. Take a barrier 1 eV above the particle's energy and 1 Å wide. For an electron $\\kappa = ${d(V.l19KappaEl, 3)}$ per ångström; for a proton it is ${d(V.l19KappaPr, 2)}, which is ${d(V.l19MassKappaRatio, 2)} times larger. Now give the particle 1 eV and the barrier 2 eV. The electron's $T$ is ${d(V.l19TElectron, 4)}, and the proton's is $10^{-${d(V.l19TProtonLog10Mag, 2)}}$. The length $1/\\kappa$ is the penetration length.`,
    caption: 'the same curves as before: a heavier particle has a larger $\\kappa a$ for the same barrier, so it sits far to the right',
    stage: BARRIER_THICK(3),
    claims: [
      claim('l19KappaEl', 'for the electron κ = 0.512 per ångström', () => close(V.l19KappaEl, 0.512317, 5e-4)),
      claim('l19KappaPr', 'for the proton 21.95', () => close(V.l19KappaPr, 21.95295, 5e-3)),
      claim('l19MassKappaRatio', 'a ratio of 42.85', () => close(V.l19MassKappaRatio, 42.85035, 5e-3)),
      claim('l19TElectron', 'the electron’s T is 0.7775', () => close(V.l19TElectron, 0.777454, 5e-5)),
      claim('l19TProtonLog10Mag', 'the proton’s T is 10 to the −18.47', () => close(V.l19TProtonLog10Mag, 18.46603, 5e-3)),
    ],
  },
  {
    id: 'l19-thick:b5',
    phase: 'lecture',
    text: `Do not stretch the thick form. As $E \\to V_0$ we have $\\kappa \\to 0$ and the displayed prefactor misleads, but the exact $T$ stays finite. Use $e^{\\kappa a} - e^{-\\kappa a} \\simeq 2\\kappa a$ in the exact form: then $T \\to 1/(1 + \\tfrac{k^2a^2}{4})$, Ex. 6.7 of Unit 18.4. For $ka = 2$ that is ${d(V18.l18TEV0T, 1)}. A thousandth below the top the exact value is ${d(V.l19LimitT999, 4)}; a billionth below it is ${d(V.l19LimitT, 4)}. And as $a \\to 0$ the thick form tends to ${d(V18.l18ThickAtZero, 0)}, while the exact $T$ tends to 1.`,
    caption: 'the state a thousandth below the top of the barrier, for $ka$ near 2: about half gets through',
    stage: W({ barrierWave: { E: 1.998, V0: 2, a: 1 } }, { show: ['density'], readouts: ['transmission'] }),
    fidelity: FIDELITY_S,
    claims: [
      claim18('l18TEV0T', 'at E = V₀ with ka = 2 the transmission is 0.5', () => close(V18.l18TEV0T, 0.5, 1e-9)),
      claim('l19LimitT999', 'a thousandth below the top it is 0.4994', () => close(V.l19LimitT999, 0.499417, 5e-5)),
      claim('l19LimitT', 'a billionth below it is 0.5000', () => close(V.l19LimitT, 0.5, 1e-8)),
      claim18('l18ThickAtZero', 'as a → 0 the thick form tends to 4', () => close(V18.l18ThickAtZero, 4, 1e-12)),
    ],
  },
  {
    id: 'l19-thick:b6',
    phase: 'books',
    text: `Townsend (§6.10, p. 231) shows why tunnelling is not an everyday event. Take a body of 1 g, 1 erg below the top of a barrier 1 cm wide. Then $\\kappa a$ is of order $10^{27}$ and $T \\sim e^{-10^{27}}$, which no count could ever see. We recompute $\\kappa a = ${d(V.l19MacroKappaA, 3)}\\times10^{27}$ in CGS units.`,
    caption: 'the thick-barrier form: the exponent is the whole story once $\\kappa a$ is large',
    stage: BARRIER_THICK(3),
    refs: [townsend('§6.10, p. 231 (below Eq. 6.146)', 'A macroscopic mass, energy drop and width give a $\\kappa a$ of order $10^{27}$, so tunnelling of everyday objects is never seen.')],
    claims: [claim('l19MacroKappaA', 'for 1 g, 1 erg and 1 cm, κa = 1.341 × 10²⁷', () => close(V.l19MacroKappaA, 1.341, 1.5e-3))],
  },
  {
    id: 'l19-thick:b7',
    phase: 'clue',
    text: 'A thick barrier is made twice as wide. Does $T$ fall to half, or by more?',
    stage: BARRIER_T(1.5, 3),
    reveal: {
      text: `By much more. Doubling $a$ doubles the exponent $2\\kappa a$, so the exponential factor is squared, not halved. From $\\kappa a = ${d(V.l19Ka15, 1)}$ to $\\kappa a = 3$ the factor is ${d(V.l19DoubleFactor, 4)}.`,
      caption: 'two widths on the transmission curve: the longer one is far lower',
      stage: BARRIER_T(1.5, 3),
      claims: [
        claim('l19Ka15', 'the half-way width has κa = 1.5', () => close(V.l19Ka15, 1.5, 1e-12)),
        claim('l19DoubleFactor', 'T falls by the factor 0.0546', () => close(V.l19DoubleFactor, 0.054597, 5e-5)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l19-energy — Tunnelling without borrowing energy                                                */
/* ---------------------------------------------------------------------------------------------- */

const energyBeats: Beat[] = [
  {
    id: 'l19-energy:b1',
    phase: 'lecture',
    text: `Does tunnelling break energy conservation? No. The potential does not depend on time, and we solved for one energy $E$. Beyond the barrier the wave has the same $k$, so the same energy $\\tfrac{k^2}{2} = ${d(V.l19EnergyOut, 0)}$. Inside, $V_0 - \\tfrac{\\kappa^2}{2}$ is also ${d(V.l19EnergyIn, 0)}. The barrier lends nothing. Inside, $E - V_0 = -2$ is not a kinetic energy that any particle could show; the wave there is not a classical particle with that energy. A packet is a sum of such states, each with its own fixed energy.`,
    caption: 'a packet at the barrier: each part of it keeps the energy it came with',
    stage: BAR_RUN({ readouts: ['transmitted'] }),
    fidelity: FIDELITY_P,
    claims: [
      claim('l19EnergyOut', 'outside, E = k²/2 = 2', () => close(V.l19EnergyOut, 2, 1e-12)),
      claim('l19EnergyIn', 'inside, E = V₀ − κ²/2 = 2', () => close(V.l19EnergyIn, 2, 1e-12)),
    ],
  },
  {
    id: 'l19-energy:b2',
    phase: 'lecture',
    text: `In a [[scanning-tunnelling-microscope|scanning tunnelling microscope]] electrons cross the vacuum gap between a sharp tip and a surface. Say their energy lies 4 eV below the top of the barrier. Then $\\kappa = ${d(V.l19StmKappa, 3)}$ per ångström, and a gap one ångström wider cuts the current by the factor ${d(V.l19StmFactorExact, 4)}. The thick form gives ${d(V.l19StmFactorThick, 4)}, the same to four digits. Each ${d(V.l19StmDecade, 2)} Å of extra gap costs a factor of ten, so the current senses less than an atom's width. <<sl-q27-josephson|Go further in 709: Cooper pairs tunnelling through an insulating barrier>>.`,
    caption: 'the thick-barrier form: every added decay length multiplies the current by a fixed factor',
    stage: BARRIER_THICK(3),
    claims: [
      claim('l19StmKappa', 'for a barrier 4 eV above the electron, κ = 1.025 per ångström', () => close(V.l19StmKappa, 1.024633, 5e-4)),
      claim('l19StmFactorExact', 'a gap one ångström wider (5 Å to 6 Å) cuts the current by 0.1288', () => close(V.l19StmFactorExact, 0.128837, 5e-5)),
      claim('l19StmFactorThick', 'the thick form gives 0.1288', () => close(V.l19StmFactorThick, 0.128829, 5e-5)),
      claim('l19StmDecade', 'a decade of current takes 1.12 Å', () => close(V.l19StmDecade, 1.123614, 5e-3)),
    ],
  },
  {
    id: 'l19-energy:b3',
    phase: 'lecture',
    text: `[[alpha-decay|Alpha decay]] is tunnelling through the Coulomb barrier of a nucleus. We build a model, not a fit: a point alpha particle, a daughter nucleus of charge 90 and radius ${d(V.l19AlphaR, 1)} fm. At ${d(V.l19AlphaE, 2)} MeV the barrier ends at ${d(V.l19TurnB4, 1)} fm, and the exponent $2\\int\\kappa\\,dr$ is ${d(V.l19Gamow4, 1)}. At 8 MeV it is ${d(V.l19Gamow8, 1)}. The difference is ${d(V.l19GamowFactor10, 1)} decades of $T$. This is the stack of thin barriers of Unit 18.4, and it shows how sharply the rate depends on the energy. The model predicts no half-lives.`,
    caption: 'the thick-barrier form: a small change in the exponent is a large change in $T$',
    stage: BARRIER_THICK(3),
    claims: [
      claim('l19AlphaR', 'the daughter’s radius is 7.4 fm', () => close(V.l19AlphaR, 7.4, 1e-12)),
      claim('l19AlphaE', 'the first alpha energy is 4.27 MeV', () => close(V.l19AlphaE, 4.27, 1e-12)),
      claim('l19TurnB4', 'at 4.27 MeV the barrier ends at 60.7 fm', () => close(V.l19TurnB4, 60.70108, 5e-3)),
      claim('l19Gamow4', 'the exponent is 97.4', () => close(V.l19Gamow4, 97.35728, 5e-2)),
      claim('l19Gamow8', 'at 8.0 MeV it is 52.3', () => close(V.l19Gamow8, 52.34373, 5e-2)),
      claim('l19GamowFactor10', 'a difference of 19.5 decades', () => close(V.l19GamowFactor10, 19.54914, 5e-2)),
    ],
  },
  {
    id: 'l19-energy:b4',
    phase: 'books',
    text: `Townsend Problem 6.21 (end of Ch. 6, p. 243) asks for the reflection and transmission of a delta barrier. It is the limit of a barrier whose height grows as its width shrinks, with $V_0 a$ fixed. In our units its strength is $g = 2V_0a$. For $g = 3$ and $k = 2$ the result is $T = 1/(1 + \\tfrac{g^2}{4k^2}) = ${d(V.l19DeltaTexact, 3)}$. The exact barrier of the same strength gives ${d(V.l19DeltaTw1, 4)}, ${d(V.l19DeltaTw2, 4)} and ${d(V.l19DeltaTw3, 4)} for widths of a tenth, a hundredth and a thousandth.`,
    caption: 'the transmission against $\\kappa a$; a thin tall barrier lies at the left edge, where $T$ is still large',
    stage: BARRIER_T(1),
    refs: [townsend('Problem 6.21, end of Ch. 6 (p. 243)', 'The delta-function barrier: find its reflection and transmission coefficients, using the jump of the slope at the delta.')],
    claims: [
      claim('l19DeltaTexact', 'for g = 3 and k = 2 the delta barrier has T = 0.640', () => close(V.l19DeltaTexact, 0.64, 5e-4)),
      claim('l19DeltaTw1', 'the exact barrier of width 0.1 gives 0.6200', () => close(V.l19DeltaTw1, 0.619974, 5e-5)),
      claim('l19DeltaTw2', 'width 0.01 gives 0.6377', () => close(V.l19DeltaTw2, 0.637726, 5e-5)),
      claim('l19DeltaTw3', 'and width 0.001 gives 0.6398', () => close(V.l19DeltaTw3, 0.639770, 5e-5)),
    ],
  },
  {
    id: 'l19-energy:b5',
    phase: 'deeper',
    text: `Beyond the notes: the part of a packet that gets through can carry more kinetic energy than the packet started with. Nothing is lent. $T$ grows with the energy, so the barrier passes the high-energy end of the packet more easily. For the packet in the picture the mean kinetic energy is ${d(V.l19IncMeanKin, 3)}. Weighting each momentum by $T(p)$ gives ${d(V.l19TransKinMean, 3)} for the transmitted part, and the reflected part has ${d(V.l19ReflKinMean, 3)}. The two parts together return the starting value.`,
    caption: 'the packet before and after: the barrier has sorted its momenta, not changed them',
    stage: BAR_RUN({ readouts: ['reflected', 'transmitted'] }),
    fidelity: FIDELITY_P,
    claims: [
      claim('l19IncMeanKin', 'the packet’s mean kinetic energy is 2.031', () => close(V.l19IncMeanKin, 2.03125, 5e-4)),
      claim('l19TransKinMean', 'the transmitted part has 2.125', () => close(V.l19TransKinMean, 2.124877, 5e-4)),
      claim('l19ReflKinMean', 'the reflected part has 1.964', () => close(V.l19ReflKinMean, 1.963549, 5e-4)),
    ],
  },
]

export const L19_STORY: Record<string, Beat[]> = {
  'l19-recap': recapBeats,
  'l19-regions': regionsBeats,
  'l19-match': matchBeats,
  'l19-thick': thickBeats,
  'l19-energy': energyBeats,
}

/** Every claim of a unit's beats, reveals and derivation steps (each unit's `claims`: the number reader backs a unit's prose with it). */
const claimsOf = (beats: Beat[]): Claim[] => beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground ?? []).flatMap((s) => s.claims ?? [])])
export const L19_UNIT_CLAIMS: Record<string, Claim[]> = Object.fromEntries(Object.entries(L19_STORY).map(([id, beats]) => [id, claimsOf(beats)]))
