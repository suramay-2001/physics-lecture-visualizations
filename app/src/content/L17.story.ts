/**
 * Lecture 17 scroll story (owner: P). Beats per docs/roles/proposals/P-L17-story.md §1, with the judge's rulings (docs/roles/decisions/448-L14L18.md, M1–M7):
 * - M2: `l13-flow` b1–b2 and the practice question `l17-pr-step` MOVED here (as `l17-current:b2`, `l17-current:b8` and `l17-pr-step`, whose id the ruling for a moved question
 *   keeps); their claim keys keep the names `l13…` and their twins stay in claims-448/g4b.json.
 * - M3: the `wavefunction` kind's new `potential` field (built with this lecture) draws the packet pictures; the plot curve `stepDensityRatio` draws |τ|².
 * - M4: reflection amplitude r, transmission amplitude τ (the notes' t, which is also time), transmission share T; one Rosetta line in `l17-step:b3`. The notes' u_E is the
 *   course's φ_E: one Rosetta line in `l17-step:b2`.
 * One track (448): sentences stay ≤ 25 words, symbols are defined before use, link-back beats name the unit they recall and define nothing new. The notes' optional Appendices A and C
 * are folded into lecture beats (`l17-mean-force:b4`, `l17-current:b4`); Appendix B is the Go-deeper beat of unit 2. Below the step, barriers and tunnelling are Lecture 18.
 *
 * Rules kept here (as in L1–L13.story.ts): stage states carry physics inputs only (the resolvers compute every sample, scale, chance and moment); every number in the prose comes
 * from L17.values.ts and is backed by a keyed claim; clue beats are click-to-reveal and last in their unit but for one Go-deeper beat; lengths are in ℓ, momenta in ħ/ℓ, times in
 * mℓ²/ħ. A fraction with a digit on both sides of the bar is read as a number by the number reader, so formulas write \tfrac{k_2}{k_1}, \tfrac{F''(\mu)}{2} and the like.
 */
import type { Beat, Claim, ComplexPlaneState, PlotPointsState, PlotState, Ref, Scrub, WavefunctionState } from './schema'
import { V, claim, close, d, tf } from './L17.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const sweep = (from: number, to: number): Scrub => ({ from, to })
/** A whole number that may be a rounding-noise zero: shown as 0, never −0. */
const dz = (x: number): string => (Math.abs(x) < 1e-9 ? '0' : d(x, 0))
const cp = (o: Omit<ComplexPlaneState, 'kind'>): ComplexPlaneState => ({ kind: 'complex-plane', shot: 'C-FLAT', ...o })
/** A Gaussian packet: ⟨x⟩ = x0, Δx = σ, ⟨p⟩ = p0 (in ħ/ℓ). */
const PK = (x0: Scrub, sigma: Scrub, p0?: Scrub): WavefunctionState['source'] => ({ packet: { x0, sigma, ...(p0 === undefined ? {} : { p0 }) } })
/** A plane wave e^{ipx} and the sum of two. */
const PL = (p: number): WavefunctionState['source'] => ({ plane: { p } })
const TW = (p1: number, p2: number): WavefunctionState['source'] => ({ twoWaves: { p1, p2 } })
const W = (source: WavefunctionState['source'], o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => ({ kind: 'wavefunction', source, shot: 'W-STD', ...o })

/** The running example: a step of height V₀ = 27/8 and a packet with p₀ = 3, so E = 9/2 = 4V₀/3, k₁ = 3 and k₂ = 3/2. The packet starts at −8 and is shown for six time units. */
const STEP_POT = { step: { V0: 3.375 } }
const STEP_PACKET = (o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => W(PK(-8, 3, 3), { potential: STEP_POT, time: sweep(0, 6), window: { x: [-16, 16] }, ...o })
/** The reflected (R) and transmitted (T) shares of the current at a step, against E/V₀ (Eq. 6.135; R = 1 and T = 0 below the step). Dots at E = 2V₀ and 3V₀. */
const STEP_RT: PlotState = { kind: 'plot', shot: 'P-CURVE', curve: { fn: 'stepT', vs: 'stepR', samples: 120 }, markers: [{ x: 2 }, { x: 3 }] }
const STEP_RT_43: PlotState = { kind: 'plot', shot: 'P-CURVE', curve: { fn: 'stepT', vs: 'stepR', samples: 120 }, markers: [{ x: 4 / 3 }] }
/** The transmitted DENSITY over the incident one, |τ|², beside T = (k₂/k₁)|τ|² (which never exceeds 1); the dot is E = 4V₀/3. */
const DENSITY_RATIO = (markers: { x: number }[] = [{ x: 4 / 3 }]): PlotState => ({ kind: 'plot', shot: 'P-CURVE', curve: { fn: 'stepDensityRatio', vs: 'stepT', x: { from: 1.0001, to: 4 }, samples: 120 }, markers })
const STEP_R_ONLY: PlotState = { kind: 'plot', shot: 'P-CURVE', curve: { fn: 'stepR', samples: 120 }, markers: [{ x: 4 / 3 }] }
const STEP_T_ONLY: PlotState = { kind: 'plot', shot: 'P-CURVE', curve: { fn: 'stepT', samples: 120 }, markers: [{ x: 4 / 3 }] }
const STEP_R_NEAR: PlotState = { kind: 'plot', shot: 'P-CURVE', curve: { fn: 'stepR', vs: 'stepT', samples: 120 }, markers: [{ x: 1.0001 }] }

const townsend = (where: string, adds: string): Ref => ({ source: 'townsend', where, adds })
const susskind = (where: string, adds: string): Ref => ({ source: 'susskind', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* l17-mean-force — Mean force against force at the mean                                           */
/* ---------------------------------------------------------------------------------------------- */

const TWO_PEAKS: PlotPointsState = {
  kind: 'plot',
  shot: 'P-CURVE',
  xLabel: 'position x',
  yLabel: 'chance or force',
  points: [
    { x: -2, y: 0.5, group: 'chance in each peak' },
    { x: 2, y: 0.5, group: 'chance in each peak' },
    { x: -2, y: 4, group: 'force at that x' },
    { x: 0, y: 0, group: 'force at that x' },
    { x: 2, y: 4, group: 'force at that x' },
  ],
  yLines: [{ y: V.l17TwoPeakMeanF, label: 'mean force' }],
}
const RESTORING: PlotPointsState = {
  kind: 'plot',
  shot: 'P-CURVE',
  xLabel: 'position x',
  yLabel: 'chance or force',
  points: [
    { x: 0, y: 0.5, group: 'chance in each peak' },
    { x: 2, y: 0.5, group: 'chance in each peak' },
    { x: 0, y: 0, group: 'force at that x' },
    { x: 2, y: -4, group: 'force at that x' },
  ],
}
const SINE_POINTS: PlotPointsState = {
  kind: 'plot',
  shot: 'P-CURVE',
  xLabel: 'packet width σ',
  yLabel: 'size of the mean force',
  points: [
    { x: 0.5, y: V.l17SineExactA, group: 'exact' },
    { x: 1, y: V.l17SineExactB, group: 'exact' },
    { x: 0.5, y: V.l17SineTaylorA, group: 'first correction' },
    { x: 1, y: V.l17SineTaylorB, group: 'first correction' },
  ],
}

const meanForce: Beat[] = [
  {
    id: 'l17-mean-force:b1',
    phase: 'lecture',
    text: `Lecture 16 ended with two exact equations for the means: $d\\langle x\\rangle/dt = \\langle p\\rangle/m$ and $d\\langle p\\rangle/dt = \\langle F(\\hat x)\\rangle$, where $F = -dV/dx$. Together they give $m\\,d^2\\langle x\\rangle/dt^2 = \\langle F(\\hat x)\\rangle$. A classical particle sitting at the mean position would feel $F(\\langle x\\rangle)$ instead. Are the two forces equal? The first is the [[mean-force|mean force]], an average over the whole density. A quick check: a fixed mean position does not mean a fixed width, so the width may matter.`,
    caption: 'a free packet with $p_0 = 3$ moves and spreads: its mean position and its width are two separate numbers',
    stage: W(PK(0, 1, 3), { time: sweep(0, 4), window: { x: [-4, 16] }, readouts: ['xmean', 'xspread'] }),
  },
  {
    id: 'l17-mean-force:b2',
    phase: 'lecture',
    text: `Three cases are exact. A free particle has $\\langle x\\rangle = x_0 + p_0t/m$. A constant force $F_0$ adds $\\tfrac{F_0t^2}{2m}$. With $x_0 = 0$, $p_0 = 3$ and $F_0 = 1$ the mean sits at ${d(V.l17ConstMean2, 0)} after $t = 2$. The width is still the free ${d(V.l17ConstDx2, 3)}. A harmonic force $F = -m\\Omega^2x$ ($\\Omega$ is the oscillator’s angular frequency; the period is $2\\pi/\\Omega$) gives $d^2\\langle x\\rangle/dt^2 = -\\Omega^2\\langle x\\rangle$. For any force $F = \\alpha + \\beta x$, the mean force is the force at the mean, whatever the width or shape. None of this turns the state into a point. Take a well with $\\Omega = 1$ and a packet of width 1 that starts at 2. A quarter period later its mean is ${dz(V.l17HarmMeanHalfPi)} and its width is ${d(V.l17HarmDxHalfPi, 1)}. After half a period the mean is ${d(V.l17HarmMeanPi, 0)} and the width is back to ${d(V.l17HarmDxPi, 1)}.`,
    caption: 'a constant force carries the packet along $x_0 + p_0t + \\tfrac{F_0t^2}{2}$ without changing its width',
    stage: W(PK(0, 1, 3), { potential: { force: { F: 1 } }, time: sweep(0, 2), window: { x: [-4, 16] }, readouts: ['xmean', 'xspread'] }),
    derivation: {
      result: `\\langle F\\rangle = \\alpha + \\beta\\langle x\\rangle = F(\\langle x\\rangle)`,
      ground: [
        {
          tex: `F(\\hat x) = \\alpha + \\beta\\hat x`,
          why: 'A linear force is a constant plus a constant times the position operator.',
          view: W(PK(0, 1, 3), { potential: { force: { F: 1 } }, time: sweep(0, 2), window: { x: [-4, 16] }, readouts: ['xmean'] }),
          viewCaption: 'a constant force, the simplest linear force',
        },
        {
          tex: `\\langle F\\rangle = \\alpha + \\beta\\langle x\\rangle`,
          why: 'The average of a constant plus a multiple of $x$ is the constant plus that multiple of the average of $x$.',
        },
        {
          tex: `\\langle F\\rangle = \\alpha + \\beta\\langle x\\rangle = F(\\langle x\\rangle)`,
          why: 'The right-hand side is the force $F$ evaluated at the mean position. So $m\\,d^2\\langle x\\rangle/dt^2 = F(\\langle x\\rangle)$ exactly.',
          view: W(PK(2, 1), { potential: { harmonic: { omega: 1 } }, time: sweep(0, Math.PI), readouts: ['xmean', 'xspread'] }),
          viewCaption: 'a harmonic well: the mean swings like a classical particle, while the width breathes',
        },
      ],
    },
    fidelity: ['wavefunction-potential-splitstep'],
    claims: [
      claim('l17ConstMean2', 'with F₀ = 1, p₀ = 3 and x₀ = 0 the mean is at 8 after t = 2', () => close(V.l17ConstMean2, 8, 1e-9)),
      claim('l17ConstDx2', 'a constant force leaves the width at the free value √2', () => close(V.l17ConstDx2, Math.SQRT2, 1e-9)),
      claim('l17HarmMeanHalfPi', 'in the well the mean is 0 a quarter period later', () => close(V.l17HarmMeanHalfPi, 0, 1e-9)),
      claim('l17HarmDxHalfPi', 'and the width is 0.5', () => close(V.l17HarmDxHalfPi, 0.5, 1e-9)),
      claim('l17HarmMeanPi', 'after half a period the mean is at −2', () => close(V.l17HarmMeanPi, -2, 1e-9)),
      claim('l17HarmDxPi', 'and the width is back to 1', () => close(V.l17HarmDxPi, 1, 1e-9)),
    ],
  },
  {
    id: 'l17-mean-force:b3',
    phase: 'lecture',
    text: `Now a nonlinear force, $F = \\gamma x^2$ with $\\gamma > 0$, and a position distribution with two narrow peaks, at $-a$ and $+a$, holding equal chances. (This two-peak example is Susskind and Friedman’s, in §9.7.) The mean position is ${dz(V.l17TwoPeakMeanX)}, and so is the force at the mean. Yet the mean force is the average of $\\gamma a^2$ over the two peaks, which is $\\gamma a^2$. With peaks of width one tenth at $\\pm 2$ and $\\gamma = 1$ it is ${d(V.l17TwoPeakMeanF, 2)}. The centre of the distribution accelerates where the force is zero. This is a local model, not a force that confines.`,
    caption: 'two narrow peaks at $\\pm 2$: the force at the middle is zero, but the mean force is about $a^2$',
    stage: TWO_PEAKS,
    claims: [
      claim('l17TwoPeakMeanX', 'the mean position of the two peaks is 0', () => close(V.l17TwoPeakMeanX, 0, 1e-9)),
      claim('l17TwoPeakMeanF', 'and the mean force of F = x² is 4.01 (4 for infinitely narrow peaks)', () => close(V.l17TwoPeakMeanF, 4.01, 1e-9)),
    ],
  },
  {
    id: 'l17-mean-force:b4',
    phase: 'lecture',
    text: `The width enters through $\\langle x^2\\rangle = (\\Delta x)^2 + \\langle x\\rangle^2$. For $F = \\gamma x^2$ it gives $m\\,d^2\\langle x\\rangle/dt^2 = \\gamma\\left(\\langle x\\rangle^2 + (\\Delta x)^2\\right)$. Take a Gaussian packet centred at 2 with $\\sigma = 1$. The force at the mean is $${d(V.l17GaussForceAtMean, 0)}\\gamma$, but the mean force is $${d(V.l17GaussMeanF, 0)}\\gamma$. In general, expand the force about the mean $\\mu$. The first correction is $\\tfrac{F''(\\mu)}{2}(\\Delta x)^2$. A narrow packet in a slowly varying force obeys $m\\ddot\\mu \\approx F(\\mu)$, which is an approximation and not a new law.`,
    caption: 'narrowing the packet shrinks the width term: the mean force approaches the force at the mean',
    stage: W(PK(2, 1), { readouts: ['xmean', 'xspread'] }),
    derivation: {
      result: `m\\ddot\\mu = F(\\mu) + \\tfrac{F''(\\mu)}{2}(\\Delta x)^2 + \\dots`,
      ground: [
        {
          tex: `F(\\mu + \\delta x) = F(\\mu) + F'(\\mu)\\,\\delta x + \\tfrac{F''(\\mu)}{2}\\,\\delta x^2 + \\dots`,
          why: 'Expand the force in the small displacement $\\delta x = x - \\mu$ from the mean $\\mu = \\langle x\\rangle$.',
          view: W(PK(2, 1), { readouts: ['xmean', 'xspread'] }),
          viewCaption: 'a packet of width 1 about its mean',
        },
        {
          tex: `\\langle F\\rangle = F(\\mu) + F'(\\mu)\\langle\\delta x\\rangle + \\tfrac{F''(\\mu)}{2}\\langle\\delta x^2\\rangle + \\dots`,
          why: 'Average term by term. The derivatives are numbers, so they come out of the average.',
        },
        {
          tex: `\\langle\\delta x\\rangle = 0,\\qquad \\langle\\delta x^2\\rangle = (\\Delta x)^2`,
          why: 'The mean displacement from the mean is zero, and the mean square displacement is the variance.',
          view: W(PK(2, sweep(1, 0.5)), { readouts: ['xspread'] }),
          viewCaption: 'a narrower packet: the variance, and with it the correction, falls',
        },
        {
          tex: `m\\ddot\\mu = F(\\mu) + \\tfrac{F''(\\mu)}{2}(\\Delta x)^2 + \\dots`,
          why: `Ehrenfest’s equation turns the left side into $m\\ddot\\mu$. For $F = \\gamma x^2$ the correction is $\\gamma(\\Delta x)^2$, which is $${d(V.l17VarCorrection, 0)}\\gamma$ here.`,
          claims: [claim('l17VarCorrection', 'for F = γx² and σ = 1 the correction ½F″(Δx)² is 1·γ', () => close(V.l17VarCorrection, 1, 1e-9))],
        },
      ],
    },
    claims: [
      claim('l17GaussForceAtMean', 'for a Gaussian at 2 with σ = 1 the force at the mean is 4γ', () => close(V.l17GaussForceAtMean, 4, 1e-9)),
      claim('l17GaussMeanF', 'and the mean force is 5γ', () => close(V.l17GaussMeanF, 5, 1e-9)),
    ],
  },
  {
    id: 'l17-mean-force:b5',
    phase: 'books',
    text: `Townsend (§6.3, p. 200, Eqs. 6.35–6.36) makes the same expansion for the momentum. The mean momentum changes by the force at the mean plus a term with the second derivative of the force and the variance. The extra term can be dropped for a packet of microscopic width in a force that varies only over macroscopic distances. This is why beams of atoms in a magnetic field follow classical paths. Susskind and Friedman (§9.7) add the condition for a classical picture: the potential must change slowly across the packet. A sharply varying potential can break a packet into pieces.`,
    caption: 'a packet of width 1 centred at 2: the width is the size of the region the force is averaged over',
    stage: W(PK(2, 1), { readouts: ['xspread'] }),
    refs: [
      townsend('§6.3, p. 200 (Eqs. 6.35–6.36)', 'The same expansion of the force about the mean: the correction is the second derivative times the variance, negligible for a narrow packet in a smooth force.'),
      susskind('Lecture 9, §9.7', 'When a state is classical: the potential must vary slowly across the packet; two separated peaks show how the mean force and the force at the mean differ.'),
    ],
  },
  {
    id: 'l17-mean-force:b6',
    phase: 'clue',
    text: 'The restoring force is $F = -\\kappa x|x|$ with $\\kappa = 1$, and the position distribution has two narrow peaks, one at 0 and one at 2, with equal chances. By what factor is the mean force larger than the force at the mean position?',
    stage: RESTORING,
    reveal: {
      text: `About twice: the mean force is $-2$ against $-1$ at the mean position, so the factor is ${d(V.l17RestoringRatio, 3)}. A packet that reaches negative $x$ needs the full $-\\kappa x|x|$, not a formula meant for positive $x$.`,
      caption: 'the force at the mean position and the mean force over the two peaks',
      stage: { ...RESTORING, yLines: [{ y: -1, label: 'force at the mean' }, { y: -V.l17RestoringRatio, label: 'mean force' }] },
      claims: [claim('l17RestoringRatio', 'the mean force is 2.005 times the force at the mean', () => close(V.l17RestoringRatio, 2.005, 1e-9))],
    },
  },
  {
    id: 'l17-mean-force:b7',
    phase: 'deeper',
    text: `Beyond the notes: take the pendulum-like force $F = -\\sin x$ on a Gaussian packet at $\\mu = \\pi/2$. The exact mean force has size $\\exp\\left(-\\tfrac{\\sigma^2}{2}\\right)$, and the first correction gives $1 - \\tfrac{\\sigma^2}{2}$. For $\\sigma = \\tfrac12$ the two are ${d(V.l17SineExactA, 4)} and ${d(V.l17SineTaylorA, 3)}. For $\\sigma = 1$ they are ${d(V.l17SineExactB, 4)} and ${d(V.l17SineTaylorB, 1)}. The expansion works for a narrow packet and fails for a broad one.`,
    caption: 'the exact mean force of $-\\sin x$ and its first correction, for two packet widths',
    stage: SINE_POINTS,
    claims: [
      claim('l17SineExactA', 'for σ = ½ the exact mean force of −sin x has size 0.8825', () => close(V.l17SineExactA, Math.exp(-1 / 8), 1e-9)),
      claim('l17SineTaylorA', 'and the first correction gives 0.875', () => close(V.l17SineTaylorA, 0.875, 1e-9)),
      claim('l17SineExactB', 'for σ = 1 the exact size is 0.6065', () => close(V.l17SineExactB, Math.exp(-0.5), 1e-9)),
      claim('l17SineTaylorB', 'and the first correction gives 0.5', () => close(V.l17SineTaylorB, 0.5, 1e-9)),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l17-step — A wave meets a potential step                                                        */
/* ---------------------------------------------------------------------------------------------- */

const step: Beat[] = [
  {
    id: 'l17-step:b1',
    phase: 'lecture',
    text: `The free particle is solved, so we can add the simplest potential that changes: a [[potential-step|potential step]], $V = 0$ for $x < 0$ and $V = V_0$ for $x > 0$. Let the energy satisfy $E > V_0$. The kinetic energy is $E$ on the left and $E - V_0$ on the right. A classical particle crosses and slows down. A wave can also reflect, as light does at a glass face where it can travel on both sides. A packet of narrow energy will split into two (Lecture 18). This is not the smooth-force limit of the last unit, and Ehrenfest’s equations do not decide it.`,
    caption: 'a packet meets a step with $E = \\tfrac{4V_0}{3}$: most of it goes on, slower, and some comes back',
    stage: STEP_PACKET(),
    fidelity: ['wavefunction-potential-splitstep'],
  },
  {
    id: 'l17-step:b2',
    phase: 'lecture',
    text: `An energy eigenstate evolves as $\\varphi_E(x)e^{-iEt/\\hbar}$ (Unit 11.5). The notes call the function $u_E$; this course calls it $\\varphi_E$ (Unit 14.5). It solves $-\\tfrac{\\hbar^2}{2m}\\varphi_E'' + V\\varphi_E = E\\varphi_E$. Where $V$ is constant, $\\varphi_E'' = -k^2\\varphi_E$ with $k^2 = 2m(E - V)/\\hbar^2$, so $e^{ikx}$ and $e^{-ikx}$ solve it, with momenta $+\\hbar k$ and $-\\hbar k$. These extended waves are [[scattering-state|scattering states]]: energy components, not particles. A packet is a sum of them, so we solve one energy first. A stationary density can still carry a flow. Take $E = 2$ and $V_0 = \\tfrac{3E}{4}$: then $k_1 = ${d(V.l17K1, 0)}$ on the left and $k_2 = ${d(V.l17K2, 0)}$ on the right.`,
    caption: 'the real part of a wave of momentum 2: a plane wave is an energy component, not a particle',
    stage: W(PL(2), { show: ['re', 'im'] }),
    claims: [
      claim('l17K1', 'for E = 2 and V₀ = 3E/4 the wave number on the left is 2', () => close(V.l17K1, 2, 1e-9)),
      claim('l17K2', 'and on the right it is 1', () => close(V.l17K2, 1, 1e-9)),
    ],
  },
  {
    id: 'l17-step:b3',
    phase: 'lecture',
    text: `Choose the waves. On the left write $\\varphi = Ae^{ik_1x} + Be^{-ik_1x}$, on the right $\\varphi = Ce^{ik_2x}$. The wave $A$ is incident, $B$ is reflected and $C$ is transmitted; nothing comes in from the right. The function and its slope must both be continuous at $x = 0$ (the last beat of this unit says why). That gives $A + B = C$ and $k_1(A - B) = k_2C$. Write $r = B/A$ and $\\tau = C/A$: these are the [[reflection-amplitude|amplitude ratios]]. The notes write $t$ for the second one, but here $t$ is time, so it is $\\tau$. Then $r = \\tfrac{k_1 - k_2}{k_1 + k_2}$ and $\\tau = 1 + r$. For our step $r = ${tf(V.l17StepRAmp43)}$ and $\\tau = ${tf(V.l17StepTau43)}$.`,
    caption: 'the incident arrow of length 1 and the reflected arrow of length $r$, tip to tail, add to the transmitted amplitude',
    stage: cp({ chain: { phasesDeg: [0, 0], sizes: [1, V.l17StepRAmp43] } }),
    derivation: {
      result: `r = \\tfrac{k_1 - k_2}{k_1 + k_2},\\quad \\tau = 1 + r`,
      ground: [
        {
          tex: `\\varphi = Ae^{ik_1x} + Be^{-ik_1x}\\ (x < 0),\\qquad \\varphi = Ce^{ik_2x}\\ (x > 0)`,
          why: 'On each side $V$ is constant, so the solutions are plane waves; nothing arrives from the right.',
          view: W(PL(2), { show: ['re'] }),
          viewCaption: 'the incident wave: a plane wave moving to the right',
        },
        {
          tex: `A + B = C`,
          why: 'The function is continuous at $x = 0$, where every exponential equals 1.',
        },
        {
          tex: `k_1(A - B) = k_2C`,
          why: 'The slope is continuous too: differentiate each piece first, then set $x = 0$.',
          view: cp({ chain: { phasesDeg: [0, 0], sizes: [1, V.l17StepRAmp43] } }),
          viewCaption: 'incident plus reflected arrows end where the transmitted amplitude ends',
        },
        {
          tex: `(k_1 - k_2)A = (k_1 + k_2)B`,
          why: 'Eliminate $C$ with $C = A + B$ in the second condition, then collect the terms in $A$ and in $B$.',
        },
        {
          tex: `r = \\tfrac{k_1 - k_2}{k_1 + k_2},\\quad \\tau = 1 + r`,
          why: 'Divide by $A$ and by $k_1 + k_2$; then $C/A = 1 + B/A$.',
        },
      ],
    },
    claims: [
      claim('l17StepRAmp43', 'for k₂/k₁ = ½ the amplitude ratio r is 1/3', () => close(V.l17StepRAmp43, 1 / 3, 1e-12)),
      claim('l17StepTau43', 'and τ = 1 + r is 4/3', () => close(V.l17StepTau43, 4 / 3, 1e-12)),
    ],
  },
  {
    id: 'l17-step:b4',
    phase: 'lecture',
    text: `For $E = \\tfrac{4V_0}{3}$ the transmitted density is ${d(V.l17StepDens43, 3)} times the incident density, which looks like too much probability. The curve shows this ratio falling from 4 at the threshold to 1 far above the step. It is no violation: the transmitted wave is slower, so a given density carries less flow. For a step up $0 < r < 1$ and $\\tau > 1$, and both are amplitudes, not probabilities.`,
    caption: 'the density ratio $|\\tau|^2$ against $E/V_0$ is above 1; the transmitted share $T$ never is',
    stage: DENSITY_RATIO(),
    claims: [claim('l17StepDens43', 'the transmitted density is 16/9 = 1.778 times the incident density', () => close(V.l17StepDens43, 16 / 9, 1e-12))],
  },
  {
    id: 'l17-step:b5',
    phase: 'lecture',
    text: `Two checks. With no step, $V_0 \\to 0$, so $k_2 \\to k_1$ and $r \\to 0$. Approaching the threshold from above, $E \\to V_0$, so $k_2 \\to 0$, $r \\to 1$ and $\\tau \\to 2$. Just above it, with $E - V_0$ one part in ten thousand of $V_0$, $\\tau$ is ${d(V.l17StepTau1p0001, 3)}. Yet almost everything comes back: the chance of reflection, defined in the next unit, is ${d(V.l17StepR1p0001, 3)}. A large $\\tau$ does not mean much gets through.`,
    caption: 'the reflected and transmitted shares; the dot marks an energy a hair above the threshold',
    stage: STEP_R_NEAR,
    claims: [
      claim('l17StepTau1p0001', 'just above the threshold τ is 1.980', () => close(V.l17StepTau1p0001, 1.98, 5e-4)),
      claim('l17StepR1p0001', 'and the chance of reflection is 0.961', () => close(V.l17StepR1p0001, 0.961, 5e-4)),
    ],
  },
  {
    id: 'l17-step:b6',
    phase: 'books',
    text: `Townsend (§6.10, pp. 226–229, Eqs. 6.117–6.134, Fig. 6.14) writes the same three waves and the same two matching conditions, with his $k_0$ in the place of our $k_2$. His step also reflects a wave that arrives from the right (Problem 6.22). <<sl-q26-beamsplitter|Go further in 709: the beam splitter, where both exits have the same speed>>.`,
    caption: 'the reflected and transmitted shares against $E/V_0$, with dots at $2V_0$ and $3V_0$',
    stage: STEP_RT,
    refs: [townsend('§6.10, pp. 226–229 (Eqs. 6.117–6.134, Fig. 6.14)', 'The same three waves and matching conditions, with $k_0$ for the wave number beyond the step.')],
  },
  {
    id: 'l17-step:b7',
    phase: 'clue',
    text: 'Nothing is lost: the potential does not change in time and every wave has the same energy. Yet a wave goes back. Why must a reflected wave appear at all?',
    stage: W(PL(2), { show: ['re'] }),
    reveal: {
      text: `One incident wave and one transmitted wave of different wavelengths cannot match both the function and its slope at $x = 0$. The ratio of slope to function is $ik_1$ on one side and $ik_2$ on the other, and $k_2/k_1$ is ${d(V.l17StepRatio43, 1)} for our step. The reflected wave lets both conditions hold.`,
      caption: 'with the reflected arrow added, the amplitudes close up',
      stage: cp({ chain: { phasesDeg: [0, 0], sizes: [1, V.l17StepRAmp43] } }),
      claims: [claim('l17StepRatio43', 'for E = 4V₀/3 the ratio k₂/k₁ is 0.5', () => close(V.l17StepRatio43, 0.5, 1e-12))],
    },
  },
  {
    id: 'l17-step:b8',
    phase: 'deeper',
    text: `Beyond the main line: why must the slope be continuous? Integrate the energy equation over a tiny stretch $\\epsilon$ on each side of $x = 0$: $-\\tfrac{\\hbar^2}{2m}\\left[\\varphi'(\\epsilon) - \\varphi'(-\\epsilon)\\right] + \\int (V - E)\\varphi\\,dx = 0$. For a finite step the integral shrinks to zero with $\\epsilon$, so the slope cannot jump. A jump in the function would put the derivative of a delta function in $\\varphi''$, and nothing balances that. A delta potential or an infinite wall can break the rule. The cost of a jump shows in the kinetic energy. Take a block of plateau length 10 with linear ramps of width $\\epsilon$ at its edges. Its $\\langle T\\rangle$ is ${d(V.l17TrapT1, 3)} for $\\epsilon = 1$ and ${d(V.l17TrapT05, 3)} for $\\epsilon = \\tfrac12$, in units of $\\hbar^2/m\\ell^2$. Halving the ramp more than doubles it, by a factor ${d(V.l17TrapRatio, 3)}. A true jump costs infinite energy.`,
    caption: 'a narrow packet: the narrower the structure, the larger its kinetic energy',
    stage: W(PK(0, 1), { show: ['density'] }),
    claims: [
      claim('l17TrapT1', 'a ramp of width 1 gives ⟨T⟩ = 0.094', () => close(V.l17TrapT1, 0.09375, 1e-9)),
      claim('l17TrapT05', 'a ramp of width ½ gives 0.194', () => close(V.l17TrapT05, 0.1935484, 1e-6)),
      claim('l17TrapRatio', 'the ratio is 2.065', () => close(V.l17TrapRatio, 2.0645161, 1e-6)),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l17-current — Why probability flows, and R and T                                                */
/* ---------------------------------------------------------------------------------------------- */

const current: Beat[] = [
  {
    id: 'l17-current:b1',
    phase: 'lecture',
    text: `What fraction of the particles crosses a detector on the right? The ratio $|C|^2/|A|^2$ cannot say. It compares two densities, and the particles are slower on the high side. A steady stream has a flow even though its density never changes. Conservation gives the right quantity. The chance in a stretch $[a, b]$ is $P(t) = \\int_a^b\\rho\\,dx$ with $\\rho = |\\psi|^2$. It changes only by flow in at $a$ and out at $b$, so $dP/dt = j(a) - j(b)$ for the rightward current $j$. Locally this is the [[continuity-equation|continuity equation]] $\\partial_t\\rho + \\partial_xj = 0$. Its formula for $j$ has to be derived, not guessed. A packet with $p_0 = 1.5$ has a total current of $${d(V.l17CurrentMean, 1)}\\,\\hbar/\\ell$ per unit mass, which is $\\langle p\\rangle/m$.`,
    caption: 'the density of a packet with $p_0 = 1.5$ slides to the right: probability flows past each point',
    stage: W(PK(0, 1, 1.5), { time: sweep(0, 4), show: ['density'], readouts: ['pmean'] }),
    claims: [claim('l17CurrentMean', 'the total current of the packet with p₀ = 1.5 is ⟨p⟩/m = 1.5', () => close(V.l17CurrentMean, 1.5, 1e-9))],
  },
  {
    id: 'l17-current:b2',
    phase: 'lecture',
    text: `Differentiate $\\rho = \\psi^*\\psi$ with the Schrödinger equation and its complex conjugate. The terms with $V$ cancel, and what is left is a derivative: $\\partial_t\\rho = -\\partial_xj$ with the [[probability-current|probability current]] $j = \\tfrac{\\hbar}{2mi}\\left(\\psi^*\\psi' - \\psi\\psi^{*\\prime}\\right) = \\tfrac{\\hbar}{m}\\,\\mathrm{Im}\\left(\\psi^*\\psi'\\right)$. This is not an extra postulate. On the grid the equation holds to rounding error for a free packet. It holds also for a packet across a smooth step, because $V$ drops out.`,
    caption: 'a packet at rest has no net flow; a moving one carries a positive current',
    stage: W(PK(0, 1), { show: ['density'] }),
    derivation: {
      result: `\\partial_t\\rho = -\\partial_xj`,
      ground: [
        {
          tex: `i\\hbar\\,\\partial_t\\psi = -\\tfrac{\\hbar^2}{2m}\\psi'' + V\\psi,\\qquad -i\\hbar\\,\\partial_t\\psi^* = -\\tfrac{\\hbar^2}{2m}\\psi^{*\\prime\\prime} + V\\psi^*`,
          why: 'The Schrödinger equation and its complex conjugate; $V$ is real, so it comes through unchanged.',
          view: W(PK(0, 1), { show: ['density'] }),
          viewCaption: 'a packet at rest: its density has no net flow',
        },
        {
          tex: `\\partial_t\\rho = \\psi\\,\\partial_t\\psi^* + \\psi^*\\partial_t\\psi`,
          why: 'The product rule for the density.',
        },
        {
          tex: `\\partial_t\\rho = \\tfrac{i\\hbar}{2m}\\left(\\psi^*\\psi'' - \\psi\\,\\psi^{*\\prime\\prime}\\right)`,
          why: 'Put in the two equations; the $V$ terms cancel because they enter with opposite signs.',
        },
        {
          tex: `\\psi^*\\psi'' - \\psi\\,\\psi^{*\\prime\\prime} = \\partial_x\\left(\\psi^*\\psi' - \\psi\\,\\psi^{*\\prime}\\right)`,
          why: 'On the right the cross terms $\\psi^{*\\prime}\\psi\'$ cancel, so the bracket is the derivative of one function.',
          view: W(PK(0, 1, 1.5), { time: sweep(0, 4), show: ['density'], readouts: ['pmean'] }),
          viewCaption: 'with $p_0 = 1.5$ the density slides right: the current is positive',
        },
        {
          tex: `j = \\tfrac{\\hbar}{2mi}\\left(\\psi^*\\psi' - \\psi\\,\\psi^{*\\prime}\\right)\\ \\Rightarrow\\ \\partial_t\\rho = -\\partial_xj`,
          why: 'Name the function inside the derivative: it is the probability current.',
          claims: [
            claim('l17ContResidualFree', 'on the grid, ∂ρ/∂t + ∂j/∂x vanishes to rounding error for the free packet with p₀ = 1.5', () => V.l17ContResidualFree < 1e-9),
            claim('l17ContResidualStep', 'and for a packet across a smooth step, because V cancels', () => V.l17ContResidualStep < 1e-9),
          ],
        },
      ],
    },
    refs: [townsend('§6.10, pp. 225–227 (Eqs. 6.111–6.116, Fig. 6.13)', 'The Schrödinger equation and its conjugate give a continuity equation: the density’s rate is minus the derivative of the probability current.')],
  },
  {
    id: 'l17-current:b3',
    phase: 'lecture',
    text: `The payoff. For a stationary state the density $|\\varphi|^2$ does not change with time, so $\\partial_xj = 0$. The current on the left equals the current on the right. It has one value everywhere. That value need not be zero: whatever flows into the step in total also flows out of it.`,
    caption: 'the density of a standing wave does not move, but it can still carry a flow',
    stage: W(PL(2), { show: ['density'] }),
  },
  {
    id: 'l17-current:b4',
    phase: 'lecture',
    text: `A right-moving wave $De^{ikx}$ has $\\psi^*\\psi' = ik|D|^2$, so $j = \\hbar k|D|^2/m = v|D|^2$, where $v$ is its speed. A left-moving wave has the opposite sign. So $j_{\\mathrm{in}} = v_1|A|^2$, $j_{\\mathrm{ref}} = -v_1|B|^2$ and $j_{\\mathrm{tr}} = v_2|C|^2$, and the balance is $j_{\\mathrm{in}} + j_{\\mathrm{ref}} = j_{\\mathrm{tr}}$. With $k_1 = 2$ and $A = 1$ the incident current is ${d(V.l17Jin, 0)}, the reflected one is minus ${d(V.l17JrefMag, 3)} and the transmitted one is ${d(V.l17Jtr, 3)}. The incident current minus the reflected size equals the transmitted one. The density on the left has fringes, between ${d(V.l17FringeMin, 3)} and ${d(V.l17FringeMax, 3)}, repeating every ${d(V.l17FringeSpacing, 3)}. The current has none.`,
    caption: 'incident plus reflected wave: the density ripples, the current does not',
    stage: W(TW(2, -2), { show: ['density'] }),
    derivation: {
      result: `j_{\\mathrm{left}} = \\tfrac{\\hbar k_1}{m}\\left(|A|^2 - |B|^2\\right)`,
      ground: [
        {
          tex: `\\varphi = Ae^{ik_1x} + Be^{-ik_1x}`,
          why: 'The wave on the left is the incident wave plus the reflected one; together they make a ripple in the density.',
          view: W(TW(2, -2), { show: ['density'] }),
          viewCaption: 'two equal waves moving in opposite directions: a standing ripple',
        },
        {
          tex: `\\varphi^*\\varphi' = ik_1\\left(|A|^2 - |B|^2\\right) + ik_1\\left(Z - Z^*\\right),\\qquad Z = AB^*e^{2ik_1x}`,
          why: 'Multiply out. The terms in $|A|^2$ and $|B|^2$ do not oscillate; the two cross terms do, and they are a number $Z$ and its conjugate.',
        },
        {
          tex: `Z - Z^* = 2i\\,\\mathrm{Im}\\,Z`,
          why: 'The difference of a complex number and its conjugate is purely imaginary.',
          view: W(TW(2, -2), { show: ['re', 'im'] }),
          viewCaption: 'the real and imaginary parts of the two opposite waves: the cross term oscillates along $x$',
        },
        {
          tex: `\\mathrm{Im}\\left(\\varphi^*\\varphi'\\right) = k_1\\left(|A|^2 - |B|^2\\right)`,
          why: 'Times $ik_1$ the bracket becomes real, so it does not touch the imaginary part: the cross terms drop out of the current.',
        },
        {
          tex: `j_{\\mathrm{left}} = \\tfrac{\\hbar k_1}{m}\\left(|A|^2 - |B|^2\\right)`,
          why: 'The current is $\\hbar/m$ times that imaginary part.',
        },
      ],
    },
    claims: [
      claim('l17Jin', 'for k₁ = 2 and A = 1 the incident current is 2', () => close(V.l17Jin, 2, 1e-9)),
      claim('l17JrefMag', 'the reflected current has size 0.222', () => close(V.l17JrefMag, 2 / 9, 1e-12)),
      claim('l17Jtr', 'the transmitted current is 1.778', () => close(V.l17Jtr, 16 / 9, 1e-12)),
      claim('l17JBalance', 'and the balance j_in + j_ref − j_tr is 0', () => close(V.l17JBalance, 0, 1e-12)),
      claim('l17FringeMax', 'the density on the left peaks at 1.778', () => close(V.l17FringeMax, 16 / 9, 1e-12)),
      claim('l17FringeMin', 'it dips to 0.444', () => close(V.l17FringeMin, 4 / 9, 1e-12)),
      claim('l17FringeSpacing', 'and repeats every π/k₁ = 1.571', () => close(V.l17FringeSpacing, Math.PI / 2, 1e-12)),
    ],
  },
  {
    id: 'l17-current:b5',
    phase: 'lecture',
    text: `Now the fractions. The reflected wave moves at the speed of the incident one, so $R = |j_{\\mathrm{ref}}|/j_{\\mathrm{in}} = |r|^2$. The transmitted share is $T = j_{\\mathrm{tr}}/j_{\\mathrm{in}} = \\tfrac{k_2}{k_1}|\\tau|^2$. With the formulas for $r$ and $\\tau$, $R = \\tfrac{(k_1 - k_2)^2}{(k_1 + k_2)^2}$ and $T = \\tfrac{4k_1k_2}{(k_1 + k_2)^2}$. [[transmission-coefficient|These two coefficients]] add to ${d(V.l17RplusT, 0)} because probability is conserved locally, not by an algebraic accident. A packet of narrow energy has about these chances. A broad one needs the average of $R(E)$ and $T(E)$ over its energies, and Lecture 18 shows how broad is too broad.`,
    caption: 'the reflected and transmitted shares against $E/V_0$; they add to 1 at every energy',
    stage: STEP_RT_43,
    derivation: {
      result: 'R + T = 1',
      ground: [
        {
          tex: `R = |r|^2,\\qquad T = \\tfrac{k_2}{k_1}|\\tau|^2`,
          why: 'Each share is a ratio of currents; the transmitted current carries the speed ratio.',
          view: STEP_R_ONLY,
          viewCaption: 'the reflected share against the energy',
        },
        {
          tex: `R + T = \\tfrac{(k_1 - k_2)^2 + 4k_1k_2}{(k_1 + k_2)^2}`,
          why: 'Put in $r = \\tfrac{k_1 - k_2}{k_1 + k_2}$ and $\\tau = \\tfrac{2k_1}{k_1 + k_2}$ and use a common denominator.',
          view: STEP_T_ONLY,
          viewCaption: 'the transmitted share against the energy',
        },
        {
          tex: `(k_1 - k_2)^2 + 4k_1k_2 = (k_1 + k_2)^2`,
          why: 'Expand both sides: the numerator is exactly the square of the sum.',
        },
        {
          tex: 'R + T = 1',
          why: 'What is not reflected is transmitted, as local conservation of probability demands.',
        },
      ],
    },
    claims: [claim('l17RplusT', 'R + T = 1 at E = 4V₀/3 (and at every energy tried)', () => close(V.l17RplusT, 1, 1e-12))],
  },
  {
    id: 'l17-current:b6',
    phase: 'lecture',
    text: `The numbers for $E = \\tfrac{4V_0}{3}$. The ratio $k_2/k_1$ is ${d(V.l17StepRatio43, 1)}, so $r = ${tf(V.l17StepRAmp43)}$ and $\\tau = ${tf(V.l17StepTau43)}$. Then $R = ${tf(V.l17StepR43)}$ and $T = \\tfrac12\\left(\\tfrac43\\right)^2 = ${tf(V.l17StepT43)}$. The transmitted density is $${tf(V.l17StepDens43)}$ of the incident one, its speed is half, and its flux is $${tf(V.l17StepT43)}$ of the incident flux. The reflected share is the missing $${tf(V.l17StepR43)}$.`,
    caption: 'at $E = \\tfrac{4V_0}{3}$ the step reflects one ninth and transmits eight ninths',
    stage: STEP_RT_43,
    claims: [
      claim('l17StepRatio43', 'for E = 4V₀/3 the ratio k₂/k₁ is 0.5', () => close(V.l17StepRatio43, 0.5, 1e-12)),
      claim('l17StepRAmp43', 'so r = 1/3', () => close(V.l17StepRAmp43, 1 / 3, 1e-12)),
      claim('l17StepTau43', 'and τ = 4/3', () => close(V.l17StepTau43, 4 / 3, 1e-12)),
      claim('l17StepR43', 'at E = 4V₀/3 the step reflects 1/9', () => close(V.l17StepR43, 1 / 9, 1e-12)),
      claim('l17StepT43', 'and transmits 8/9', () => close(V.l17StepT43, 8 / 9, 1e-12)),
    ],
  },
  {
    id: 'l17-current:b7',
    phase: 'lecture',
    text: `Three distinctions to keep. The mean force equals the force at the mean exactly for a linear force and approximately for a narrow packet in a slowly varying force. Matching the function and its slope fixes the amplitudes, while the Schrödinger equation itself gives local conservation. The current turns amplitudes into outgoing fractions, so $T$ carries the ratio of the speeds. Next we lower the energy below the step. There a wave can decay into the step while no flux passes through.`,
    caption: 'the packet and the step again, now with the chance on each side of the step',
    stage: STEP_PACKET({ readouts: ['reflected', 'transmitted'] }),
    fidelity: ['wavefunction-potential-splitstep'],
  },
  {
    id: 'l17-current:b8',
    phase: 'books',
    text: `Townsend (§6.10, pp. 225–229, Eqs. 6.111–6.136, Fig. 6.12 to Fig. 6.14) reaches the same continuity equation and the same step. He defines $R$ and $T$ as ratios of currents. Such a packet, narrow in energy and far wider than the interaction region, may be treated as a plane wave (p. 225). At $E = 2V_0$ the step reflects ${d(V.l17StepR2, 4)} and transmits ${d(V.l17StepT2, 4)}. At $E = 3V_0$ it reflects ${d(V.l17StepR3, 4)} and transmits ${d(V.l17StepT3, 4)}.`,
    caption: 'the share of the current that is reflected and transmitted against $E/V_0$: all reflected below the step, almost all transmitted well above it',
    stage: STEP_RT,
    refs: [townsend('§6.10, pp. 225–229 (Eqs. 6.111–6.136, Figs. 6.12–6.14)', 'The continuity equation, the current of a wave, and the step with $E > V_0$: $R$ and $T$ are ratios of currents and add to 1.')],
    claims: [
      claim('l17StepR2', 'at E = 2V₀ the step reflects 0.0294', () => close(V.l17StepR2, 0.0294373, 1e-6)),
      claim('l17StepT2', 'and transmits 0.9706', () => close(V.l17StepT2, 0.9705627, 1e-6)),
      claim('l17StepR3', 'at E = 3V₀ it reflects 0.0102', () => close(V.l17StepR3, 0.0102051, 1e-6)),
      claim('l17StepT3', 'and transmits 0.9898', () => close(V.l17StepT3, 0.9897949, 1e-6)),
    ],
  },
  {
    id: 'l17-current:b9',
    phase: 'clue',
    text: `A student takes $T = |C|^2/|A|^2$ for $E = \\tfrac{4V_0}{3}$ and gets $${tf(V.l17StepDens43)}$, more than 1. What was forgotten?`,
    stage: DENSITY_RATIO(),
    reveal: {
      text: `The ratio of the speeds, $k_2/k_1 = ${d(V.l17StepRatio43, 1)}$. The correct value is $T = \\tfrac{k_2}{k_1}|\\tau|^2 = ${tf(V.l17StepT43)}$.`,
      caption: 'the transmitted share, with the speed ratio included, never exceeds 1',
      stage: STEP_RT_43,
      claims: [claim('l17StepT43', 'with the speed ratio k₂/k₁ = 0.5 the transmitted share is 8/9', () => close(V.l17StepT43, 8 / 9, 1e-12))],
    },
  },
]

export const L17_STORY: Record<string, Beat[]> = {
  'l17-mean-force': meanForce,
  'l17-step': step,
  'l17-current': current,
}

/** Every claim of a unit's beats, reveals and derivation steps (each unit's `claims`: the number reader backs a unit's prose with it). */
const claimsOf = (beats: Beat[]): Claim[] => beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground ?? []).flatMap((s) => s.claims ?? [])])
export const L17_UNIT_CLAIMS: Record<string, Claim[]> = Object.fromEntries(Object.entries(L17_STORY).map(([id, beats]) => [id, claimsOf(beats)]))
