/**
 * Lecture 18 scroll story (owner: P). Beats per docs/roles/proposals/P-L18-story.md §1, with the judge's rulings (docs/roles/decisions/448-L14L18.md, M1–M7, and the Townsend-pass
 * conventions 448-townsend.md, T1–T11):
 * - M2: the books-only unit l13-flow MOVED here: its step-below-the-top beat is `l18-below:b5`, its barrier beat (with the Townsend p. 231 Correction, in L18.ts) is `l18-tunnel:b5`, its clue is
 *   `l18-tunnel:b7` and its Go-deeper beat is `l18-tunnel:b8`; the practice question is `l18-pr-tunnel`. Their claim keys took the lecture prefix (`l13TStepRbelow` → `l18TStepRbelow`, …).
 * - M3: no new stage piece. The `wavefunction` kind's `potential` field (built with Lecture 17) draws every packet picture, the plot curves are Lecture 17's and Lecture 13's.
 * - M4: reflection amplitude r, transmission amplitude τ (the notes' t, which is also time: one Rosetta line, `l18-packet:b1`), transmission share T; Townsend's q is our κ and his k₀ our k₂.
 * One track (448): sentences stay ≤ 25 words, symbols are defined before use, link-back beats name the unit they recall and define nothing new. The optional Appendix A (the exact barrier) is
 * `l18-tunnel:b2`; Appendix B is folded into `l18-detector:b9` (the spreading current) and `l18-tunnel:b4` (the current inside a barrier). The scenes keep every packet inside the 64-long box.
 *
 * Rules kept here (as in L1–L17.story.ts): stage states carry physics inputs only (the resolvers compute every sample, scale, chance and moment); every number in the prose comes
 * from L18.values.ts and is backed by a keyed claim; clue beats are click-to-reveal and last in their unit but for one Go-deeper beat; lengths are in ℓ, momenta in ħ/ℓ, times in
 * mℓ²/ħ. A fraction with a digit on both sides of the bar is read as a number by the number reader, so formulas write \tfrac{k_2}{k_1} and the like. A time that is not a whole
 * number is never typed ("at the end of the run"): the reader would ask for a claim.
 */
import type { Beat, Claim, ComplexPlaneState, PlotPointsState, PlotState, Ref, Scrub, WavefunctionState } from './schema'
import { V, claim, close, d, tf } from './L18.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const sweep = (from: number, to: number): Scrub => ({ from, to })
/** A whole number that may be a rounding-noise zero: shown as 0, never −0. */
const dz = (x: number): string => (Math.abs(x) < 1e-9 ? '0' : d(x, 0))
const cp = (o: Omit<ComplexPlaneState, 'kind'>): ComplexPlaneState => ({ kind: 'complex-plane', shot: 'C-FLAT', ...o })
/** A Gaussian packet: ⟨x⟩ = x0, Δx = σ, ⟨p⟩ = p0 (in ħ/ℓ). */
const PK = (x0: Scrub, sigma: Scrub, p0?: Scrub): WavefunctionState['source'] => ({ packet: { x0, sigma, ...(p0 === undefined ? {} : { p0 }) } })
const TW = (p1: number, p2: number): WavefunctionState['source'] => ({ twoWaves: { p1, p2 } })
const W = (source: WavefunctionState['source'], o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => ({ kind: 'wavefunction', source, shot: 'W-STD', ...o })

/** The running step: p₀ = 4 and V₀ = 6, so E = 8 = 4V₀/3 (k₁ = 4, k₂ = 2). The packet has width 2 and starts at −8; the run ends at t = 5.5, when the two bumps are apart. */
const STEP_RUN = (o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => W(PK(-8, 2, 4), { potential: { step: { V0: 6 } }, time: sweep(0, 5.5), window: { x: [-16, 16] }, ...o })
/** Below the step: p₀ = 2 and V₀ = 4, so E = 2 = V₀/2 and k = κ = 2; the packet reaches the step at t = 4. */
const LOW_RUN = (o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => W(PK(-8, 2, 2), { potential: { step: { V0: 4 } }, time: sweep(0, 9), window: { x: [-16, 16] }, ...o })
/** The same energy at a barrier of height 4 and width ½, so κa = 1. */
const BAR_RUN = (o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => W(PK(-8, 2, 2), { potential: { barrier: { V0: 4, a: 0.5 } }, time: sweep(0, 9), window: { x: [-16, 16] }, ...o })
/** A free packet and a detector: width 3, p₀ = 2, from −6, a thin slice at x_d = 4 (shaded in the picture). */
const DET_FREE = (o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => W(PK(-6, 3, 2), { time: sweep(0, 8), window: { x: [-16, 16] }, ...o })
const DET_RUN = (o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => DET_FREE({ interval: [3.9, 4.1], readouts: ['interval'], ...o })

/** The reflected (R) and transmitted (T) shares of the current at a step, against E/V₀ (Eq. 6.135; R = 1 and T = 0 below the step). */
const STEP_RT_43: PlotState = { kind: 'plot', shot: 'P-CURVE', curve: { fn: 'stepT', vs: 'stepR', samples: 120 }, markers: [{ x: 4 / 3 }] }
const STEP_RT_LOW: PlotState = { kind: 'plot', shot: 'P-CURVE', curve: { fn: 'stepT', vs: 'stepR', samples: 120 }, markers: [{ x: 0.5 }] }
/** The transmitted DENSITY over the incident one, |τ|², beside T = (k₂/k₁)|τ|² (which never exceeds 1); the dot is E = 4V₀/3. */
const DENSITY_RATIO: PlotState = { kind: 'plot', shot: 'P-CURVE', curve: { fn: 'stepDensityRatio', vs: 'stepT', x: { from: 1.0001, to: 4 }, samples: 120 }, markers: [{ x: 4 / 3 }] }
/** The transmission of a barrier with E = V₀/2 against κa (Eq. 6.144), with a dot at the given κa; and the same from κa = 1 beside the thick-barrier form of Eq. 6.146. */
const BARRIER_T = (ka: number): PlotState => ({ kind: 'plot', shot: 'P-CURVE', curve: { fn: 'barrierT', samples: 120 }, markers: [{ x: ka }] })
const BARRIER_THICK = (ka: number): PlotState => ({ kind: 'plot', shot: 'P-CURVE', curve: { fn: 'barrierT', vs: 'barrierThick', x: { from: 1, to: 4 }, samples: 90 }, markers: [{ x: ka }] })
/** The energy-weighted R against the packet width: the average of R(E) over the packet's energies (dots) and the plane-wave R of its middle energy (line). */
const WEIGHTED_R: PlotPointsState = {
  kind: 'plot',
  shot: 'P-CURVE',
  xLabel: 'packet width σ',
  yLabel: 'reflected share R',
  points: [
    { x: 2, y: V.l18StepWeightedR, group: 'average of R(E)' },
    { x: 3, y: V.l18WeightedR3, group: 'average of R(E)' },
    { x: 6, y: V.l18WeightedR6, group: 'average of R(E)' },
    { x: 12, y: V.l18WeightedR12, group: 'average of R(E)' },
  ],
  yLines: [{ y: V.l18StepR43, label: 'plane wave' }],
}

const townsend = (where: string, adds: string): Ref => ({ source: 'townsend', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* l18-packet — A packet splits at the step                                                        */
/* ---------------------------------------------------------------------------------------------- */

const packetBeats: Beat[] = [
  {
    id: 'l18-packet:b1',
    phase: 'lecture',
    text: `Unit 17.2 matched the function and its slope at $x = 0$. It found the amplitude ratios $r = \\tfrac{k_1 - k_2}{k_1 + k_2}$ and $\\tau = 1 + r$. This beat defines nothing new; it keeps two identities apart. The first, $1 + r = \\tau$, comes from $A + B = C$ at one point, so it is about amplitudes. The second, $R + T = 1$, is conservation of probability, so it is about fractions. For $E = \\tfrac{4V_0}{3}$ the first reads $1 + ${tf(V.l18StepRAmp43)} = ${tf(V.l18StepTau43)}$ and the second $${tf(V.l18StepR43)} + ${tf(V.l18StepT43)} = 1$. The notes write $t$ for the amplitude $\\tau$, but here $t$ is time. Do not swap the two: $r + \\tau$ is not 1.`,
    caption: 'the arrows $1$ and $r$ placed tip to tail add up to the arrow $\\tau$: an identity for amplitudes',
    stage: cp({ chain: { phasesDeg: [0, 0], sizes: [1, V.l18StepRAmp43] } }),
    claims: [
      claim('l18StepRAmp43', 'for E = 4V₀/3 the amplitude ratio r is 1/3', () => close(V.l18StepRAmp43, 1 / 3, 1e-12)),
      claim('l18StepTau43', 'and τ is 4/3', () => close(V.l18StepTau43, 4 / 3, 1e-12)),
      claim('l18AmpIdentity', '1 + r − τ vanishes (amplitudes: A + B = C divided by A)', () => V.l18AmpIdentity < 1e-12),
      claim('l18StepR43', 'the reflected share is R = 1/9', () => close(V.l18StepR43, 1 / 9, 1e-12)),
      claim('l18StepT43', 'the transmitted share is T = 8/9', () => close(V.l18StepT43, 8 / 9, 1e-12)),
      claim('l18FracIdentity', 'R + T − 1 vanishes (fractions: conservation of probability)', () => Math.abs(V.l18FracIdentity) < 1e-12),
    ],
  },
  {
    id: 'l18-packet:b2',
    phase: 'lecture',
    text: 'A plane wave has the same density everywhere, so nothing in it can be seen crossing the step. Use a packet instead: the [[normalized|normalised]] [[wave-packet|wave packet]] of Lectures 15 and 16. It is a finite sum of waves with momenta close to $p_0 = 4$. It runs at the step with the energy $E = \\tfrac{4V_0}{3}$ of Lecture 17. After the collision two localised packets leave: one goes back to the left and one goes on to the right.',
    caption: 'a packet with $p_0 = 4$ meets the step: afterwards one bump goes back and a narrower one goes on',
    stage: STEP_RUN(),
    fidelity: ['wavefunction-potential-splitstep'],
  },
  {
    id: 'l18-packet:b3',
    phase: 'lecture',
    text: `Define the chances before any current. Once the two pieces are well away from the step, $R = \\int_{-\\infty}^{0}|\\psi|^2dx$ and $T = \\int_{0}^{\\infty}|\\psi|^2dx$. These are real probabilities: the areas under the two outgoing bumps. In Lecture 17 the same letters were ratios of currents; the next unit shows the two meanings agree. The state is normalised and nothing is absorbed, so $R + T = 1$. At the end of the run the readouts give ${d(V.l18StepAreaL, 3)} on the left and ${d(V.l18StepAreaR, 3)} on the right, and the total is ${d(V.l18StepNorm, 0)}. Compare areas, not heights: the two bumps have different widths.`,
    caption: 'the chance on each side of the step at the end of the run: the area under each bump, not its height',
    stage: STEP_RUN({ time: 5.5, readouts: ['reflected', 'transmitted'] }),
    fidelity: ['wavefunction-potential-splitstep'],
    claims: [
      claim('l18StepAreaL', 'at the end of the run the chance left of the step is 0.148', () => close(V.l18StepAreaL, 0.14807, 5e-4)),
      claim('l18StepAreaR', 'and the chance on the right is 0.852', () => close(V.l18StepAreaR, 0.85193, 5e-4)),
      claim('l18StepNorm', 'the state stays normalised: the total is 1', () => close(V.l18StepNorm, 1, 1e-9)),
    ],
  },
  {
    id: 'l18-packet:b4',
    phase: 'lecture',
    text: `The full time-dependent problem would follow every momentum through the step. Instead solve one plane wave at a time, as in Lecture 17. For a narrow range of energies $r$ and $\\tau$ hardly change across the packet. The outgoing packets are then about $r$ and $\\tau$ times the incoming envelope, and the different speeds fix the ratio of the areas. A broad packet needs the average of $R(E)$ over its energies. For $\\sigma = 2$ that average is ${d(V.l18StepWeightedR, 4)}, close to the ${d(V.l18StepAreaL, 3)} read off the run. For $\\sigma = 3, 6, 12$ it is ${d(V.l18WeightedR3, 4)}, ${d(V.l18WeightedR6, 4)} and ${d(V.l18WeightedR12, 4)}, falling toward the plane-wave value $${tf(V.l18StepR43)}$.`,
    caption: 'the energy-weighted $R$ against the packet width: a wider packet has a narrower range of energies, and the average falls to the plane-wave value',
    stage: WEIGHTED_R,
    claims: [
      claim('l18StepWeightedR', 'the energy-weighted R for σ = 2 is 0.1489', () => close(V.l18StepWeightedR, 0.148892, 5e-5)),
      claim('l18StepAreaL', 'the run gives 0.148', () => close(V.l18StepAreaL, 0.14807, 5e-4)),
      claim('l18WeightedR3', 'for σ = 3 it is 0.1230', () => close(V.l18WeightedR3, 0.122970, 5e-5)),
      claim('l18WeightedR6', 'for σ = 6 it is 0.1135', () => close(V.l18WeightedR6, 0.113532, 5e-5)),
      claim('l18WeightedR12', 'for σ = 12 it is 0.1117', () => close(V.l18WeightedR12, 0.111696, 5e-5)),
      claim('l18StepR43', 'and the plane-wave R is 1/9', () => close(V.l18StepR43, 1 / 9, 1e-12)),
    ],
  },
  {
    id: 'l18-packet:b5',
    phase: 'books',
    text: 'Townsend (§6.10, p. 225, Fig. 6.12) draws the same experiment. A packet sent at a step or a barrier splits into a reflected and a transmitted part. He adds that a packet sharply peaked in energy, and so broad in space, acts like a plane wave (footnote 20). That is the narrow-energy case of the last beat, where $r$ and $\\tau$ can be used as they stand.',
    caption: 'the packet of this unit again: the split the book draws as a sketch, here computed',
    stage: STEP_RUN(),
    fidelity: ['wavefunction-potential-splitstep'],
    refs: [townsend('§6.10, p. 225 (Fig. 6.12, footnote 20)', 'A packet sent at a step or barrier splits into a reflected and a transmitted part; a packet sharply peaked in energy and broad against the interaction region may be treated as a plane wave.')],
  },
  {
    id: 'l18-packet:b6',
    phase: 'clue',
    text: 'Which gives the chance of reflection: the height of the reflected bump, or its area?',
    stage: STEP_RUN({ time: 5.5, readouts: ['reflected'] }),
    reveal: {
      text: `Its area. The two bumps have different widths, so their heights mislead. The area on the left is ${d(V.l18StepAreaL, 3)} and the area on the right is ${d(V.l18StepAreaR, 3)}.`,
      caption: 'both readouts at the end of the run: the chances are the areas, and together they make 1',
      stage: STEP_RUN({ time: 5.5, readouts: ['reflected', 'transmitted'] }),
      claims: [
        claim('l18StepAreaL', 'the area on the left is 0.148', () => close(V.l18StepAreaL, 0.14807, 5e-4)),
        claim('l18StepAreaR', 'and on the right 0.852', () => close(V.l18StepAreaR, 0.85193, 5e-4)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l18-detector — Probability current from a moving Gaussian                                       */
/* ---------------------------------------------------------------------------------------------- */

const detectorBeats: Beat[] = [
  {
    id: 'l18-detector:b1',
    phase: 'lecture',
    text: 'Now something we can picture. Place a detector at a fixed point $x_d$ and let a localised packet of mean speed $v_0 = p_0/m$ go past it. At what rate does probability cross the detector? If the packet barely spreads while it passes, its density is $\\rho(x,t) \\simeq \\tfrac{1}{\\sqrt{2\\pi}\\,\\sigma}\\,e^{-(x - x_0 - v_0t)^2/2\\sigma^2}$. Nothing is new: it is the Gaussian of Lectures 15 and 16 with its centre moving to the right.',
    caption: 'a packet moves past a thin shaded slice at the detector: the chance in the slice rises, peaks and falls',
    stage: DET_RUN(),
  },
  {
    id: 'l18-detector:b2',
    phase: 'lecture',
    text: `In a short time $dt$ the packet moves a distance $dx = v_0\\,dt$. The probability in the thin slice that passes the detector is $dP \\simeq \\rho(x_d, t)\\,dx$. Divide by $dt$: the rate is $j(x_d, t) = dP/dt \\simeq v_0\\,\\rho(x_d, t)$. This $j$ is the [[probability-flux|probability flux]]: probability per unit time, positive for motion to the right and negative for motion to the left. Its units are probability per length times length per time. It is a rate, not a new kind of density. For the packet of the picture the rigid peak of $v_0\\rho$ is ${d(V.l18DetPeakRigid, 4)} per unit time.`,
    caption: 'the slice that crosses the detector in the time $dt$ holds the chance $\\rho\\,dx$',
    stage: DET_RUN(),
    derivation: {
      result: 'j(x_d,t)\\simeq v_0\\,\\rho(x_d,t)',
      ground: [
        {
          tex: 'x_c(t) = x_0 + v_0t',
          why: 'The centre of the packet moves at the constant speed $v_0$.',
          view: DET_FREE({ readouts: ['xmean'] }),
          viewCaption: 'the packet and its mean position as time runs',
        },
        {
          tex: 'dx = v_0\\,dt',
          why: 'In a short time $dt$ the whole packet shifts by this distance.',
        },
        {
          tex: 'dP \\simeq \\rho(x_d,t)\\,dx',
          why: 'The chance in the slice that crosses $x_d$ is its density times its width.',
          view: DET_RUN({ time: 5 }),
          viewCaption: 'the shaded slice at the detector holds the chance that crosses in the time $dt$',
        },
        {
          tex: '\\tfrac{dP}{dt} = j(x_d,t) \\simeq v_0\\,\\rho(x_d,t)',
          why: 'Divide by $dt$ and put in $dx = v_0\\,dt$: length per time times probability per length.',
          claims: [claim('l18DetPeakRigid', 'the rigid peak of v₀ρ for σ = 3 and p₀ = 2 is 0.2660', () => close(V.l18DetPeakRigid, 0.265962, 5e-5))],
        },
      ],
    },
    claims: [claim('l18DetPeakRigid', 'the rigid peak of v₀ρ for σ = 3 and p₀ = 2 is 0.2660', () => close(V.l18DetPeakRigid, 0.265962, 5e-5))],
  },
  {
    id: 'l18-detector:b3',
    phase: 'lecture',
    text: `An optional payoff. Add up the probability that crosses over the whole passage: $\\int j\\,dt = \\int v_0\\rho\\,dt$. For a packet that keeps its shape this is a Gaussian integral in time, and it equals ${d(V.l18DetTotal, 0)}, because the whole packet goes by once. A chain-rule check agrees with Lecture 17: $\\partial_t\\rho = -v_0\\partial_x\\rho$ and $\\partial_xj = v_0\\partial_x\\rho$, so $\\partial_t\\rho + \\partial_xj = 0$ without redoing that derivation. A real packet spreads, so rigid translation holds only while the passage is short. The exact free Gaussian also gives ${d(V.l18DetTotal, 0)}.`,
    caption: 'the packet has almost passed the detector: over the whole passage the chance that crossed is the whole packet, 1',
    stage: DET_RUN({ time: 6 }),
    claims: [claim('l18DetTotal', 'the current of the exact free Gaussian, integrated over all times, is 1', () => close(V.l18DetTotal, 1, 1e-9))],
  },
  {
    id: 'l18-detector:b4',
    phase: 'lecture',
    text: 'Back to the experiment. Far from the step, each outgoing packet is made of travelling waves again. The reflected packet moves left with speed $v_1 = \\hbar k_1/m$, the transmitted one moves right with speed $v_2 = \\hbar k_2/m$. Use $j = v\\rho$ for each travelling piece. Then $j_{\\mathrm{in}} = +v_1|A|^2$, $j_{\\mathrm{ref}} = -v_1|B|^2$ and $j_{\\mathrm{tr}} = +v_2|C|^2$. The minus sign in $j_{\\mathrm{ref}}$ says "leftward". These are one-way pieces, not the total wave on the left, whose density has ripples.',
    caption: 'the outgoing packets: the left one moves back at about the incident speed, the right one on at about half of it',
    stage: STEP_RUN(),
    fidelity: ['wavefunction-potential-splitstep'],
  },
  {
    id: 'l18-detector:b5',
    phase: 'lecture',
    text: `Unit 17.3 defined the two shares as ratios of currents; this beat only joins that to the packets and defines nothing new. The reflected share is $R = |j_{\\mathrm{ref}}|/j_{\\mathrm{in}} = |r|^2$. The transmitted share is $T = j_{\\mathrm{tr}}/j_{\\mathrm{in}} = \\tfrac{k_2}{k_1}|\\tau|^2$. The reflected packet has the incident speed, so $R$ carries the factor ${d(V.l18CurrentFactorR, 0)}. The transmitted packet is slower, so $T$ carries the factor ${d(V.l18CurrentFactorT, 1)} here. A slower packet is squeezed in space: that is the difference between a ratio of densities and an area.`,
    caption: 'the density ratio $|\\tau|^2$ is above 1; the share $T$, with the speed factor, never is',
    stage: DENSITY_RATIO,
    claims: [
      claim('l18CurrentFactorR', 'the reflected share carries the speed factor 1', () => close(V.l18CurrentFactorR, 1, 1e-12)),
      claim('l18CurrentFactorT', 'the transmitted share carries k₂/k₁ = 0.5', () => close(V.l18CurrentFactorT, 0.5, 1e-12)),
    ],
  },
  {
    id: 'l18-detector:b6',
    phase: 'lecture',
    text: `The numbers for $E = \\tfrac{4V_0}{3}$. The ratio $k_2/k_1 = v_2/v_1$ is ${d(V.l18StepRatio43, 1)}, so $r = ${tf(V.l18StepRAmp43)}$ and $\\tau = ${tf(V.l18StepTau43)}$. Then $R = ${tf(V.l18StepR43)}$ and $T = \\tfrac12\\left(\\tfrac43\\right)^2 = ${tf(V.l18StepT43)}$. The transmitted density is $${tf(V.l18StepDens43)}$ times the incident one, but it moves at half the speed. Its share of the flow is $${tf(V.l18StepT43)}$, not $${tf(V.l18StepDens43)}$. The missing $${tf(V.l18StepR43)}$ is the reflected packet.`,
    caption: 'at $E = \\tfrac{4V_0}{3}$ the transmitted density is $\\tfrac{16}{9}$ of the incident one, and its share of the flow is $\\tfrac89$',
    stage: DENSITY_RATIO,
    claims: [
      claim('l18StepRatio43', 'for E = 4V₀/3 the ratio k₂/k₁ is 0.5', () => close(V.l18StepRatio43, 0.5, 1e-12)),
      claim('l18StepRAmp43', 'r = 1/3', () => close(V.l18StepRAmp43, 1 / 3, 1e-12)),
      claim('l18StepTau43', 'τ = 4/3', () => close(V.l18StepTau43, 4 / 3, 1e-12)),
      claim('l18StepR43', 'R = 1/9', () => close(V.l18StepR43, 1 / 9, 1e-12)),
      claim('l18StepT43', 'T = 8/9', () => close(V.l18StepT43, 8 / 9, 1e-12)),
      claim('l18StepDens43', 'the transmitted density is 16/9 of the incident one', () => close(V.l18StepDens43, 16 / 9, 1e-12)),
    ],
  },
  {
    id: 'l18-detector:b7',
    phase: 'books',
    text: 'Townsend (§6.10, pp. 227–228, Eqs. 6.122–6.126) finds the current in the region left of the step from the incident and reflected waves. It is $\\hbar k/m$ times $|A|^2 - |B|^2$: the interference terms drop out. He defines $R$ and $T$ as ratios of currents. His $k_0$ is our $k_2$. The step, the numbers and the shares are the ones of Unit 17.3.',
    caption: 'the two shares against $E/V_0$: the same step as in Lecture 17, now read as areas of two bumps',
    stage: STEP_RT_43,
    refs: [townsend('§6.10, pp. 227–228 (Eqs. 6.122–6.126)', 'The current left of the step is $\\hbar k/m$ times $|A|^2 - |B|^2$; the reflection and transmission coefficients are ratios of currents.')],
  },
  {
    id: 'l18-detector:b8',
    phase: 'clue',
    text: 'The reflected packet moves as fast as the incident one. So why does $T$ carry a speed factor and $R$ none?',
    stage: DENSITY_RATIO,
    reveal: {
      text: `$R$ compares two flows at the same speed, so the speeds cancel. The transmitted wave is slower, so the same density carries less flow. The factor is ${d(V.l18CurrentFactorT, 1)} for our step.`,
      caption: 'the transmitted share, with its speed factor, stays below 1',
      stage: STEP_RT_43,
      claims: [
        claim('l18CurrentFactorR', 'the reflected share carries the speed factor 1', () => close(V.l18CurrentFactorR, 1, 1e-12)),
        claim('l18CurrentFactorT', 'the transmitted share carries k₂/k₁ = 0.5', () => close(V.l18CurrentFactorT, 0.5, 1e-12)),
      ],
    },
  },
  {
    id: 'l18-detector:b9',
    phase: 'deeper',
    text: `Beyond the notes: a real free Gaussian spreads (Unit 16.3). Its exact current is $j = \\rho\\left[v_0 + \\tfrac{\\dot\\sigma}{\\sigma}(x - x_c)\\right]$, where $\\sigma(t) = \\sigma_0\\sqrt{1 + (\\hbar t/2m\\sigma_0^2)^2}$ and $x_c = x_0 + v_0t$. The first term carries the packet. The second is an outward flow from its centre. For the packet of the picture the detector's peak current is ${d(V.l18DetPeakExact, 4)}, which is ${d(V.l18DetPeakRatio, 3)} of the rigid ${d(V.l18DetPeakRigid, 4)}. The whole passage still carries ${d(V.l18DetTotal, 0)}.`,
    caption: 'the exact packet is a little wider at the detector than the rigid one, so its peak current is a little lower',
    stage: DET_RUN({ time: 5 }),
    claims: [
      claim('l18DetPeakExact', 'the exact current at the detector peaks at 0.2565', () => close(V.l18DetPeakExact, 0.256509, 5e-5)),
      claim('l18DetPeakRatio', 'which is 0.964 of the rigid peak', () => close(V.l18DetPeakRatio, 0.964458, 5e-4)),
      claim('l18DetPeakRigid', 'the rigid peak is 0.2660', () => close(V.l18DetPeakRigid, 0.265962, 5e-5)),
      claim('l18DetTotal', 'the whole passage carries 1', () => close(V.l18DetTotal, 1, 1e-9)),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l18-below — Below the step: a tail is not transmission                                          */
/* ---------------------------------------------------------------------------------------------- */

const belowBeats: Beat[] = [
  {
    id: 'l18-below:b1',
    phase: 'lecture',
    text: `Now let the energy fall below the step. A classical particle turns round. The Schrödinger equation still decides what the wave does on the right. There $\\varphi'' = \\kappa^2\\varphi$ with $\\kappa = \\sqrt{2m(V_0 - E)}/\\hbar$, a positive number. The solutions are real exponentials, not travelling waves: such a wave is [[evanescent-wave|evanescent]]. On the left nothing changes: $k = \\sqrt{2mE}/\\hbar$. Take $E = \\tfrac{V_0}{2}$ with $V_0 = 4$. Then $k = ${d(V.l18K, 0)}$ and $\\kappa = ${d(V.l18Kappa, 0)}$ are equal.`,
    caption: 'a packet with $E = \\tfrac{V_0}{2}$ comes to the step: it turns back, and the step is drawn as a high ledge',
    stage: LOW_RUN(),
    fidelity: ['wavefunction-potential-splitstep'],
    claims: [
      claim('l18K', 'for E = V₀/2 with V₀ = 4 the wave number on the left is 2', () => close(V.l18K, 2, 1e-12)),
      claim('l18Kappa', 'and the decay constant on the right is 2', () => close(V.l18Kappa, 2, 1e-12)),
    ],
  },
  {
    id: 'l18-below:b2',
    phase: 'lecture',
    text: `On the right the growing exponential cannot stay bounded, so keep only the decaying one. Write $\\varphi = Ae^{ikx} + Be^{-ikx}$ on the left and $\\varphi = Ce^{-\\kappa x}$ on the right. Matching the function and its slope at $x = 0$ gives $A + B = C$ and $ik(A - B) = -\\kappa C$. With $r = B/A$ this solves to $r = \\tfrac{k - i\\kappa}{k + i\\kappa}$. Top and bottom are complex conjugates, so they have the same size: $|r| = ${d(V.l18AbsR, 0)}$ and $R = |r|^2 = ${d(V.l18RBelow, 0)}$. Every particle comes back, yet $\\varphi$ on the right is not zero. For $k = \\kappa$ we get $r = -i$: a turn through $-${d(V.l18PhaseDegMag, 0)}^\\circ$, and the density at the edge is $|1 + r|^2 = ${d(V.l18EdgeDensity, 0)}$.`,
    caption: 'the arrows $1$ and $r = -i$: the reflected wave is as long as the incident one, turned a quarter turn clockwise',
    stage: cp({ chain: { phasesDeg: [0, -90], sizes: [1, 1] } }),
    derivation: {
      result: 'r = \\tfrac{k - i\\kappa}{k + i\\kappa}',
      ground: [
        {
          tex: '\\varphi_L = Ae^{ikx} + Be^{-ikx},\\quad \\varphi_R = Ce^{-\\kappa x}',
          why: 'On the left an incident and a reflected wave; on the right only the bounded exponential.',
          view: LOW_RUN({ time: 3 }),
          viewCaption: 'the incident packet before it reaches the step',
        },
        {
          tex: 'A + B = C',
          why: 'The function is continuous at $x = 0$, where every exponential equals 1.',
        },
        {
          tex: 'ik(A - B) = -\\kappa C',
          why: 'The slope is continuous too: differentiate each piece first, then put in $x = 0$.',
          view: cp({ chain: { phasesDeg: [0, -90], sizes: [1, 1] } }),
          viewCaption: 'the incident and reflected arrows end at the point $1 + r$',
        },
        {
          tex: 'ik(1 - r) = -\\kappa(1 + r)',
          why: 'Divide both conditions by $A$ and write $r = B/A$.',
        },
        {
          tex: 'r = \\tfrac{k - i\\kappa}{k + i\\kappa}',
          why: 'Collect the terms in $r$ and solve. The top and the bottom are conjugates, so they have the same size and $|r| = 1$.',
        },
      ],
    },
    claims: [
      claim('l18AbsR', '|r| = 1 below the step', () => close(V.l18AbsR, 1, 1e-12)),
      claim('l18RBelow', 'so R = |r|² = 1', () => close(V.l18RBelow, 1, 1e-12)),
      claim('l18PhaseDegMag', 'for k = κ the angle of r is −90°', () => close(V.l18PhaseDegMag, 90, 1e-9)),
      claim('l18EdgeDensity', 'and the density at the edge is |1 + r|² = 2', () => close(V.l18EdgeDensity, 2, 1e-12)),
    ],
  },
  {
    id: 'l18-below:b3',
    phase: 'lecture',
    text: `Penetration is not transmission. On the right the density is $\\rho_R = |C|^2e^{-2\\kappa x}$, which is not zero. The amplitude falls by a factor $e$ over $1/\\kappa$, here ${d(V.l18DecayLenAmp, 1)}. The density falls by $e$ over the [[penetration-depth|decay length]] $1/2\\kappa$, here ${d(V.l18DecayLenDensity, 2)}. A packet can have a temporary tail inside, but nothing travels on toward $+\\infty$: with $R = 1$ the final transmission is zero. A density in $x > 0$ does not mean a flow out. In the run at most ${d(V.l18MaxPenetration, 2)} of the chance is in $x > 0$, at $t = ${d(V.l18PenetrationTime, 0)}$, and the tail then drains away.`,
    caption: 'the chance in $x > 0$ rises while the packet is at the step and then drains away; nothing travels on to the right',
    stage: LOW_RUN({ readouts: ['transmitted'] }),
    fidelity: ['wavefunction-potential-splitstep'],
    claims: [
      claim('l18DecayLenAmp', 'the amplitude falls by e over 1/κ = 0.5', () => close(V.l18DecayLenAmp, 0.5, 1e-12)),
      claim('l18DecayLenDensity', 'the density falls by e over 1/2κ = 0.25', () => close(V.l18DecayLenDensity, 0.25, 1e-12)),
      claim('l18MaxPenetration', 'at most 0.10 of the chance is ever in x > 0', () => close(V.l18MaxPenetration, 0.10246, 5e-3)),
      claim('l18PenetrationTime', 'it peaks at t = 4, when the centre reaches the step', () => close(V.l18PenetrationTime, 4, 1e-12)),
    ],
  },
  {
    id: 'l18-below:b4',
    phase: 'lecture',
    text: `A check, if you want one. For $\\varphi = Ce^{-\\kappa x}$ the product $\\varphi^*\\varphi'$ is $-\\kappa|C|^2e^{-2\\kappa x}$, which is real. The current is $\\tfrac{\\hbar}{m}$ times its imaginary part, so $j = ${dz(V.l18EvanescentCurrent)}$ at every depth. One real exponential carries no current. That is why $T = 0$ below the step, whatever the density inside.`,
    caption: 'the transmitted share is zero for every energy below the step, and the reflected share is 1',
    stage: STEP_RT_LOW,
    claims: [claim('l18EvanescentCurrent', 'the current of Ce^{−κx} is 0 (checked at x = 1)', () => Math.abs(V.l18EvanescentCurrent) < 1e-12)],
  },
  {
    id: 'l18-below:b5',
    phase: 'books',
    text: `Townsend (§6.10, pp. 229–230, Eqs. 6.137–6.140) solves the same step. His $q$ is our $\\kappa$ and his $k_0$ is our $k_2$. He gets the solution from the case above the step by the substitution $ik_0 \\to -q$. Then $R = ${d(V.l18TStepRbelow, 0)}$, because $|k - iq| = |k + iq|$. And $C = 2kA/(k + iq)$ is not zero: the wave enters the step. No current flows there, because $\\varphi^*\\varphi'$ is real for a real exponent, so $T = ${d(V.l18TStepTbelow, 0)}$. The substitution works for $R$ but not for $T$: $T$ is a ratio of currents, not of squared amplitudes.`,
    caption: 'the density to the left of the step when everything is reflected: the incident and reflected waves form a standing ripple',
    stage: W(TW(3, -3), { show: ['density'] }),
    refs: [townsend('§6.10, pp. 229–230 (Eqs. 6.137–6.140)', 'Below the step the reflection is total, yet the function enters it as a decaying exponential; the transmission is zero because that wave carries no current.')],
    claims: [
      claim('l18TStepRbelow', 'below the step everything is reflected: R = 1', () => close(V.l18TStepRbelow, 1, 1e-12)),
      claim('l18TStepTbelow', 'and T = 0', () => close(V.l18TStepTbelow, 0, 1e-12)),
    ],
  },
  {
    id: 'l18-below:b6',
    phase: 'clue',
    text: 'For $E = \\tfrac{V_0}{2}$ with $V_0 = 4$, how far into the step does the density fall to one hundredth of its edge value?',
    stage: LOW_RUN({ time: 5 }),
    reveal: {
      text: `At $x = \\tfrac{\\ln 100}{2\\kappa} = ${d(V.l18X1pct, 2)}\\,\\ell$. The density is $e^{-2\\kappa x}$ times its edge value, so $2\\kappa x = \\ln 100$. That is several decay lengths: the tail is a thin film on the face of the step.`,
      caption: 'the density of the evanescent wave: its edge value times $e^{-2\\kappa x}$',
      stage: LOW_RUN({ time: 5 }),
      claims: [claim('l18X1pct', 'the density is one hundredth of its edge value at x = ln 100/2κ = 1.15', () => close(V.l18X1pct, 1.1513, 5e-4))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l18-tunnel — A finite barrier lets it through                                                   */
/* ---------------------------------------------------------------------------------------------- */

const tunnelBeats: Beat[] = [
  {
    id: 'l18-tunnel:b1',
    phase: 'lecture',
    text: `Suppose the potential falls back to 0 after a width $a$. An infinitely wide step holds only a tail, with $T = 0$. But far enough on, travelling waves are allowed again. Now there are three regions: $\\varphi_I = Ae^{ikx} + Be^{-ikx}$ for $x < 0$, $\\varphi_{II} = Ce^{\\kappa x} + De^{-\\kappa x}$ inside, and $\\varphi_{III} = Fe^{ik(x - a)}$ beyond. Both exponentials are needed inside, because the barrier is finite. Match the function and its slope at $x = 0$ and at $x = a$. A wave leaves although $E < V_0$: that is [[tunnelling|tunnelling]]. For $E = \\tfrac{V_0}{2}$ and $\\kappa a = 1$ the transmission is ${d(V.l18BarrierT1, 4)}. A packet of width 2 averages it over its energies to ${d(V.l18BarrierWeightedT, 4)}.`,
    caption: 'a packet with $E = \\tfrac{V_0}{2}$ meets a thin barrier: part of it tunnels through and part comes back',
    stage: BAR_RUN({ readouts: ['reflected', 'transmitted'] }),
    fidelity: ['wavefunction-potential-splitstep'],
    claims: [
      claim('l18BarrierT1', 'for E = V₀/2 and κa = 1 the transmission is 0.4200', () => close(V.l18BarrierT1, 0.419974, 5e-5)),
      claim('l18BarrierWeightedT', 'a packet of width 2 averages it to 0.4196', () => close(V.l18BarrierWeightedT, 0.419649, 5e-5)),
    ],
  },
  {
    id: 'l18-tunnel:b2',
    phase: 'lecture',
    text: `The short route to $T$ is the notes’ optional Appendix A. Carry the value and the slope of $\\varphi$ backward from $x = a$, where $\\varphi(a) = F$ and $\\varphi'(a) = ikF$. Inside, $\\varphi = F\\cosh\\kappa(x - a) + \\tfrac{ikF}{\\kappa}\\sinh\\kappa(x - a)$. At $x = 0$ this gives $A/F = \\cosh\\kappa a + \\tfrac{i}{2}\\left(\\tfrac{\\kappa}{k} - \\tfrac{k}{\\kappa}\\right)\\sinh\\kappa a$. The speed is the same on both sides, so $T = |F/A|^2$. The result is $T = \\left[1 + \\tfrac{V_0^2}{4E(V_0 - E)}\\sinh^2\\kappa a\\right]^{-1}$. For our barrier this route gives ${d(V.l18AppendixAT, 4)}, the same as the four matching conditions solved at once.`,
    caption: 'the transmission of the barrier against $\\kappa a$: the dot is $\\kappa a = 1$',
    stage: BARRIER_T(1),
    derivation: {
      result: 'T = \\left[1 + \\tfrac{V_0^2}{4E(V_0 - E)}\\sinh^2\\kappa a\\right]^{-1}',
      ground: [
        {
          tex: '\\varphi(a) = F,\\quad \\varphi\'(a) = ikF',
          why: 'Beyond the barrier only the transmitted wave exists, so its value and slope at $x = a$ are known.',
          view: BARRIER_T(1),
          viewCaption: 'the transmission against $\\kappa a$, which the steps below work out',
        },
        {
          tex: '\\varphi(x) = F\\cosh\\kappa(x - a) + \\tfrac{ikF}{\\kappa}\\sinh\\kappa(x - a)',
          why: 'Inside, $\\varphi\'\' = \\kappa^2\\varphi$, and this combination has the right value and slope at $x = a$.',
        },
        {
          tex: '\\varphi(0) = F\\left(\\cosh\\kappa a - \\tfrac{ik}{\\kappa}\\sinh\\kappa a\\right),\\quad \\varphi\'(0) = F\\left(-\\kappa\\sinh\\kappa a + ik\\cosh\\kappa a\\right)',
          why: 'Put in $x = 0$.',
          view: BAR_RUN({ time: 6 }),
          viewCaption: 'the packet at the barrier: the function and its slope are matched at both edges',
        },
        {
          tex: '2A = \\varphi(0) + \\tfrac{\\varphi\'(0)}{ik}',
          why: 'On the left $\\varphi(0) = A + B$ and $\\varphi\'(0) = ik(A - B)$, so adding them cancels $B$.',
        },
        {
          tex: '\\tfrac{A}{F} = \\cosh\\kappa a + \\tfrac{i}{2}\\left(\\tfrac{\\kappa}{k} - \\tfrac{k}{\\kappa}\\right)\\sinh\\kappa a',
          why: 'Put in the two lines above and collect the terms.',
        },
        {
          tex: 'T = \\left|\\tfrac{F}{A}\\right|^2 = \\left[1 + \\tfrac{(\\kappa^2 + k^2)^2}{4k^2\\kappa^2}\\sinh^2\\kappa a\\right]^{-1}',
          why: 'The speeds match on both sides, so $T = |F/A|^2$. Use $\\cosh^2 = 1 + \\sinh^2$ and add the squares of the real and imaginary parts.',
        },
        {
          tex: 'T = \\left[1 + \\tfrac{V_0^2}{4E(V_0 - E)}\\sinh^2\\kappa a\\right]^{-1}',
          why: 'Put in $k^2 = 2mE/\\hbar^2$ and $\\kappa^2 = 2m(V_0 - E)/\\hbar^2$: then $k^2 + \\kappa^2$ is proportional to $V_0$ and $k^2\\kappa^2$ to $E(V_0 - E)$.',
          claims: [claim('l18AppendixAT', 'the A/F route gives T = 0.4200 for κa = 1', () => close(V.l18AppendixAT, 0.419974, 5e-5))],
        },
      ],
    },
    claims: [claim('l18AppendixAT', 'the A/F route gives T = 0.4200 for E = V₀/2 and κa = 1', () => close(V.l18AppendixAT, 0.419974, 5e-5))],
  },
  {
    id: 'l18-tunnel:b3',
    phase: 'lecture',
    text: `Limits. For $E = \\tfrac{V_0}{2}$ the prefactor $\\tfrac{V_0^2}{4E(V_0 - E)}$ is exactly 1, so $T = 1/\\cosh^2\\kappa a$. For $\\kappa a = \\tfrac12, 1, 2, 3$ this gives ${d(V.l18BarrierT05, 4)}, ${d(V.l18BarrierT1, 4)}, ${d(V.l18BarrierT2, 4)} and ${d(V.l18BarrierT3, 5)}. For $\\kappa a \\gg 1$ use $\\sinh\\kappa a \\simeq e^{\\kappa a}/2$: then $T \\simeq 16\\,\\tfrac{E(V_0 - E)}{V_0^2}\\,e^{-2\\kappa a}$, which is $4e^{-2\\kappa a}$ here. At $\\kappa a = 3$ the thick form gives ${d(V.l18BarrierThick3, 5)}, half a percent above the exact value. As $a \\to 0$ the exact $T$ goes to 1, but the thick form would give ${d(V.l18ThickAtZero, 0)}. Never use it there.`,
    caption: 'the exact transmission and its thick-barrier form: they meet for large $\\kappa a$, and the form is wrong for a thin barrier',
    stage: BARRIER_THICK(3),
    claims: [
      claim('l18BarrierT05', 'for κa = ½ the transmission is 0.7864', () => close(V.l18BarrierT05, 0.786448, 5e-5)),
      claim('l18BarrierT1', 'for κa = 1 it is 0.4200', () => close(V.l18BarrierT1, 0.419974, 5e-5)),
      claim('l18BarrierT2', 'for κa = 2 it is 0.0707', () => close(V.l18BarrierT2, 0.070651, 5e-5)),
      claim('l18BarrierT3', 'for κa = 3 it is 0.00987', () => close(V.l18BarrierT3, 0.0098660, 5e-6)),
      claim('l18BarrierThick3', 'the thick form gives 0.00992 at κa = 3', () => close(V.l18BarrierThick3, 0.0099150, 5e-6)),
      claim('l18ThickAtZero', 'as a → 0 the thick form tends to 4', () => close(V.l18ThickAtZero, 4, 1e-12)),
    ],
  },
  {
    id: 'l18-tunnel:b4',
    phase: 'lecture',
    text: `The current survives inside the barrier. For $\\varphi = Ce^{\\kappa x} + De^{-\\kappa x}$ the product $\\varphi^*\\varphi'$ is $\\kappa|C|^2e^{2\\kappa x} - \\kappa|D|^2e^{-2\\kappa x} + \\kappa(D^*C - C^*D)$. The first two terms are real; the cross term is not: it is $2i\\kappa\\,\\mathrm{Im}(D^*C)$. So $j = \\tfrac{2\\hbar\\kappa}{m}\\mathrm{Im}(D^*C)$. Two exponentials that carry no current alone can carry one together, and it equals $T$ times the incident current. For $k = 2$ and $\\kappa a = 1$ both are ${d(V.l18BarrierInnerCurrent, 4)}.`,
    caption: 'the same barrier: inside it the function is two exponentials, yet a current flows through',
    stage: BAR_RUN({ time: 6 }),
    fidelity: ['wavefunction-potential-splitstep'],
    derivation: {
      result: 'j = \\tfrac{2\\hbar\\kappa}{m}\\,\\mathrm{Im}(D^*C)',
      ground: [
        {
          tex: '\\varphi^*\\varphi\' = \\kappa|C|^2e^{2\\kappa x} - \\kappa|D|^2e^{-2\\kappa x} + \\kappa(D^*C - C^*D)',
          why: 'Multiply $\\varphi^*$ by $\\varphi\'$ and collect the four products.',
          view: BAR_RUN({ time: 6 }),
          viewCaption: 'the packet at the barrier',
        },
        {
          tex: 'D^*C - C^*D = 2i\\,\\mathrm{Im}(D^*C)',
          why: 'A number minus its conjugate is purely imaginary. The first two terms are real and do not touch the current.',
        },
        {
          tex: 'j = \\tfrac{\\hbar}{m}\\mathrm{Im}\\left(\\varphi^*\\varphi\'\\right) = \\tfrac{2\\hbar\\kappa}{m}\\,\\mathrm{Im}(D^*C)',
          why: 'The current is $\\hbar/m$ times the imaginary part of $\\varphi^*\\varphi\'$.',
          view: BARRIER_T(1),
          viewCaption: 'the transmission that this current equals, as a share of the incident current',
        },
      ],
    },
    claims: [
      claim('l18BarrierInnerCurrent', 'the current inside is 2κ Im(D*C) = 0.8399 for k = 2 and κa = 1', () => close(V.l18BarrierInnerCurrent, 0.839949, 5e-5)),
      claim('l18BarrierOuterCurrent', 'which is T times the incident current, 0.8399', () => close(V.l18BarrierOuterCurrent, 0.839949, 5e-5)),
    ],
  },
  {
    id: 'l18-tunnel:b5',
    phase: 'books',
    text: `Townsend (§6.10, pp. 230–233, Eqs. 6.141–6.146, Fig. 6.15) solves the four matching conditions of Eq. 6.143 and gets the same $T$. (His $F$, $G$ and $C$ are our $C$, $D$ and $F$.) At $E = V_0$ exactly the function inside is a straight line, and Ex. 6.7 (p. 232) finds $T = 1/(1 + k^2a^2/4)$, which is ${d(V.l18TEV0T, 1)} for $ka = 2$. His own electron has 5 eV against a barrier 10 eV high and 53 pm wide (p. 231), so $\\kappa a = ${d(V.l18TBookQa, 3)}$. Our calculation finds $T = ${d(V.l18TBookAT, 3)}$ where the page prints a smaller number; see the Correction. The thick form would give ${d(V.l18TBookThick, 2)}, which is no probability, because $\\kappa a$ is below 1. The printed value would need a width of ${d(V.l18BookWidthFor068, 3)} Å.`,
    caption: 'the transmission of the barrier with $E = \\tfrac{V_0}{2}$ against $\\kappa a$; the dot marks $\\kappa a = 0.607$, the electron of the text',
    stage: BARRIER_T(0.607),
    refs: [townsend('§6.10, pp. 230–233 (Eqs. 6.141–6.146, Ex. 6.7, Figs. 6.15–6.16)', 'Four matching conditions give the barrier’s transmission; for a thick barrier it falls as $e^{-2qa}$; at $E = V_0$ it is $1/(1 + k^2a^2/4)$.')],
    claims: [
      claim('l18TBookQa', 'for the book’s electron κa = 0.607', () => close(V.l18TBookQa, 0.60715, 5e-4)),
      claim('l18TBookAT', 'and the transmission is 0.706', () => close(V.l18TBookAT, 0.70610, 5e-4)),
      claim('l18TEV0T', 'at E = V₀ with ka = 2 the transmission is 1/(1 + 1) = 0.5', () => close(V.l18TEV0T, 0.5, 1e-9)),
      claim('l18TBookThick', 'the thick form would give 1.19 for it', () => close(V.l18TBookThick, 1.18766, 5e-3)),
      claim('l18BookWidthFor068', 'the printed value would need a width of 0.560 Å', () => close(V.l18BookWidthFor068, 0.55968, 5e-4)),
    ],
  },
  {
    id: 'l18-tunnel:b6',
    phase: 'books',
    text: 'Townsend (§6.10, pp. 233–234, Eqs. 6.147–6.149, Fig. 6.17) turns the thick form into a rule for a smooth barrier. Cut it into thin square slices of width $\\Delta x$, each with its own $\\kappa_i$. Each slice multiplies $T$ by $e^{-2\\kappa_i\\Delta x}$. So $T \\simeq \\exp\\left(-2\\int\\sqrt{2m(V - E)}\\,dx/\\hbar\\right)$ over the stretch where the root is real. It fails near the turning points, where $E = V$. Tunnelling of this kind also sets the ammonia flip of Unit 11.6. <<sl-q27-josephson|Go further in 709: Cooper pairs tunnelling through an insulating barrier>>.',
    caption: 'the exact transmission and its thick-barrier form: the exponent is the only part that matters for a wide barrier',
    stage: BARRIER_THICK(3),
    refs: [townsend('§6.10, pp. 233–234 (Eqs. 6.147–6.149, Fig. 6.17)', 'A smooth barrier as a stack of square ones: $T \\simeq \\exp(-2\\int\\sqrt{2m(V - E)}\\,dx/\\hbar)$, which fails near the turning points.')],
  },
  {
    id: 'l18-tunnel:b7',
    phase: 'clue',
    text: 'Make a thick barrier wider by one decay length, $1/\\kappa$. By what factor does the transmission fall?',
    stage: BARRIER_THICK(3),
    reveal: {
      text: `By $e^{-2}$, about ${d(V.l18TDecayFactor, 3)}. The thick form has $e^{-2\\kappa a}$, and $a$ grew by $1/\\kappa$, so the exponent grew by 2.`,
      caption: 'the thick-barrier curve falls by a fixed factor for each added decay length',
      stage: BARRIER_THICK(3),
      claims: [claim('l18TDecayFactor', 'one more decay length multiplies the thick-barrier T by e⁻² = 0.135', () => close(V.l18TDecayFactor, Math.exp(-2), 1e-9))],
    },
  },
  {
    id: 'l18-tunnel:b8',
    phase: 'deeper',
    text: `Beyond the notes: for 5 eV against a barrier 10 eV high and 300 pm wide, how good is the thick form? The exact transmission is ${d(V.l18TThickRatio, 3)} of it. That is why $e^{-2\\kappa a}$ with the prefactor is the working formula for the thick barriers of real devices.`,
    caption: 'the exact transmission and its thick-barrier form meet for large $\\kappa a$',
    stage: BARRIER_THICK(3),
    claims: [claim('l18TThickRatio', 'the exact transmission is 0.998 of the thick-barrier form for 5 eV against 10 eV and 300 pm', () => close(V.l18TThickRatio, 0.99793, 5e-5))],
  },
]

export const L18_STORY: Record<string, Beat[]> = {
  'l18-packet': packetBeats,
  'l18-detector': detectorBeats,
  'l18-below': belowBeats,
  'l18-tunnel': tunnelBeats,
}

/** Every claim of a unit's beats, reveals and derivation steps (each unit's `claims`: the number reader backs a unit's prose with it). */
const claimsOf = (beats: Beat[]): Claim[] => beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground ?? []).flatMap((s) => s.claims ?? [])])
export const L18_UNIT_CLAIMS: Record<string, Claim[]> = Object.fromEntries(Object.entries(L18_STORY).map(([id, beats]) => [id, claimsOf(beats)]))
