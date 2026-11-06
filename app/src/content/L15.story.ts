/**
 * Lecture 15 scroll story (owner: P). Beats per docs/roles/proposals/P-L15-story.md §1, under the judge's rulings (docs/roles/decisions/448-L14L18.md M1–M7) and the Townsend-pass
 * conventions (docs/roles/decisions/448-townsend.md T1–T11):
 * - M2: the two-wave fringes (old `l13-schrodinger:b8`) and the free-centre clue (old `l13-schrodinger:b3`) moved here as `l15-group-velocity:b1` and `l15-puzzle:b3`; their keys took the lecture
 *   prefix (`l15FringeSpacing`, `l15FringeSpeed`, `l15FringeSpeedFormula`, `l15FreeMean2`) because the claim lint needs it.
 * - M3: the plot curves `freeOmega` and `linearOmega` of Lecture 14 are the only curves used; every other picture is an existing `wavefunction` state.
 * - Plan §8 holds: no Correction box. The exact Gaussian width and Ehrenfest's theorem stay with Lecture 16 (notes p. 11), so this lecture shows only measured numbers and says so.
 * One track (448): sentences stay ≤ 25 words, symbols are defined before use, link-back beats name the unit they recall and define nothing new. Stage states carry physics inputs only; every number in
 * the prose comes from L15.values.ts and is backed by a keyed claim; clue beats are click-to-reveal and last in their unit; lengths are in ℓ, momenta in ħ/ℓ, times in mℓ²/ħ. The width demos use
 * p₀ = 1.5 (a p₀ = 3 packet run to t = 6 would wrap the periodic window). A fraction such as one half is never typed in a formula where the number reader would ask for a claim.
 */
import type { Beat, Claim, PlotState, Ref, Scrub, WavefunctionState } from './schema'
import { V, claim, close, d } from './L15.values'

const sweep = (from: number, to: number): Scrub => ({ from, to })
/** A Gaussian packet: ⟨x⟩ = x0, Δx = σ, ⟨p⟩ = p0 (in ħ/ℓ). */
const PK = (x0: Scrub, sigma: Scrub, p0?: Scrub): WavefunctionState['source'] => ({ packet: { x0, sigma, ...(p0 === undefined ? {} : { p0 }) } })
/** A plane wave e^{ipx} and the sum of two. */
const PL = (p: number): WavefunctionState['source'] => ({ plane: { p } })
const TW = (p1: number, p2: number): WavefunctionState['source'] => ({ twoWaves: { p1, p2 } })
/** Townsend §6.9 with the wall at 0: a box of width L, level n or an equal pair [n1, n2]. */
const BOX = (L: number, n: number | [number, number]): WavefunctionState['source'] => ({ box: { L, n } })
const W = (source: WavefunctionState['source'], o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => ({ kind: 'wavefunction', source, shot: 'W-STD', ...o })
/** The window that holds the p₀ = 1.5 packet from t = 0 to t = 6 (its centre reaches 9). */
const RUN = { x: [-4, 16] as [number, number] }
/** The dispersion curves of Lecture 14: matter ω = k²/2 (ħ = m = 1) beside light's ω = |k|, with dots at k = 1, 2, 3. */
const OMEGA_LIGHT: PlotState = { kind: 'plot', shot: 'P-CURVE', curve: { fn: 'freeOmega', vs: 'linearOmega', samples: 120 }, markers: [{ x: 1 }, { x: 2 }, { x: 3 }] }
const OMEGA: PlotState = { kind: 'plot', shot: 'P-CURVE', curve: { fn: 'freeOmega', samples: 120 }, markers: [{ x: 1 }, { x: 2 }, { x: 3 }] }

const townsend = (where: string, adds: string): Ref => ({ source: 'townsend', where, adds })
const susskind = (where: string, adds: string): Ref => ({ source: 'susskind', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* l15-puzzle — Stationary states do not move                                                     */
/* ---------------------------------------------------------------------------------------------- */

const puzzle: Beat[] = [
  {
    id: 'l15-puzzle:b1',
    phase: 'lecture',
    text: 'Unit 14.5 showed that an energy ket with $H|E\\rangle = E|E\\rangle$ evolves as $|\\psi(t)\\rangle = e^{-iEt/\\hbar}|E\\rangle$, so its density never changes. Mix two energies and the [[relative-phase|relative phase]] between them does change the density. That change is the ingredient of motion. The picture shows two box levels mixed. This beat defines nothing new.',
    caption: 'two box levels mixed: the density sloshes, which one level alone never does',
    stage: W(BOX(4, [1, 2]), { time: sweep(0, 6.8), show: ['density'] }),
    fidelity: ['wavefunction-box-walls'],
  },
  {
    id: 'l15-puzzle:b2',
    phase: 'lecture',
    text: `Set up the motion. Prepare a particle near a point $x_0$, with momenta spread around a mean $p_0$, and then switch off every force. The Hamiltonian is $H = \\tfrac{\\hat p^2}{2m}$ with $V = 0$. Classically the particle then moves at $v_0 = p_0/m$, which is ${d(V.l15ClassicalV, 1)} $\\ell$ per unit time for $p_0 = 3$ and $m = 1$. Does the whole density move at $v_0$, and does it keep its shape?`,
    caption: 'the packet we will release, with mean momentum 3',
    stage: W(PK(0, 1, 3), { time: 0, show: ['density'], readouts: ['pmean'] }),
    claims: [claim('l15ClassicalV', 'the classical speed p₀/m is 3 ℓ per unit time for p₀ = 3', () => close(V.l15ClassicalV, 3, 1e-9))],
  },
  {
    id: 'l15-puzzle:b3',
    phase: 'clue',
    text: 'A free packet with $p_0 = 3$ and $\\sigma = 1\\,\\ell$ starts at the origin. Where is its centre at $t = 2$?',
    stage: W(PK(0, 1, 3), { time: 0, readouts: ['xmean'] }),
    reveal: {
      text: `At ${d(V.l15FreeMean2, 1)} $\\ell$, the classical answer $p_0t/m$. The next units show why the whole density moves at that speed, and what else it does on the way.`,
      caption: 'the centre has moved to 6',
      stage: W(PK(0, 1, 3), { time: 2, readouts: ['xmean'] }),
      claims: [claim('l15FreeMean2', 'the free packet’s centre is at 6 ℓ at t = 2', () => close(V.l15FreeMean2, 6, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l15-free-eigenstate — A free momentum state is an energy state                                 */
/* ---------------------------------------------------------------------------------------------- */

const freeEigenstate: Beat[] = [
  {
    id: 'l15-free-eigenstate:b1',
    phase: 'lecture',
    text: 'Momentum kets are energy kets of the [[free-particle|free particle]]. Because $\\hat p|p\\rangle = p|p\\rangle$, applying $\\hat p$ twice gives $\\hat p^2|p\\rangle = p^2|p\\rangle$, so $\\hat H|p\\rangle = \\tfrac{p^2}{2m}|p\\rangle$. Write $E_p = \\tfrac{p^2}{2m}$ for this energy. The reverse is false: $p$ and $-p$ share one energy.',
    caption: 'two momenta, one energy: the plane waves with $p = 2$ and $p = -2$',
    stage: W(PL(2), { show: ['re'] }),
    derivation: {
      result: '\\hat H|p\\rangle = \\tfrac{\\hat p^2}{2m}|p\\rangle = \\tfrac{p^2}{2m}|p\\rangle',
      ground: [
        {
          tex: '\\hat p|p\\rangle = p|p\\rangle',
          why: 'A momentum ket is an eigenket of the momentum operator, with the number $p$ as its eigenvalue.',
          view: W(PL(2), { show: ['re'] }),
          viewCaption: 'a momentum state with $p = 2$',
        },
        {
          tex: '\\hat p^2|p\\rangle = p\\,\\hat p|p\\rangle = p^2|p\\rangle',
          why: 'Apply $\\hat p$ twice; each time it returns the number $p$.',
        },
        {
          tex: '\\hat H|p\\rangle = \\tfrac{\\hat p^2}{2m}|p\\rangle = \\tfrac{p^2}{2m}|p\\rangle',
          why: 'Put the free Hamiltonian $\\tfrac{\\hat p^2}{2m}$ in front of the ket and use the line above.',
          view: W(PL(-2), { show: ['re'] }),
          viewCaption: 'the same energy with $p = -2$',
        },
      ],
    },
  },
  {
    id: 'l15-free-eigenstate:b2',
    phase: 'lecture',
    text: `Evolve it in the position basis. The wavefunction is $\\psi_p(x,t) = \\tfrac{1}{\\sqrt{2\\pi\\hbar}}\\,e^{i(px - E_pt)/\\hbar}$, a wave $e^{i(kx-\\omega t)}$ with $\\omega(k) = \\tfrac{\\hbar k^2}{2m}$ from Unit 14.3. Take $p = ${d(V.l15PlaneP15, 1)}$ with $\\hbar = m = 1$. Then $E_p = ${d(V.l15E15, 3)}$, the phase at a point turns once in ${d(V.l15PlanePeriod, 2)} time units, and the crests of $\\mathrm{Re}\\,\\psi$ move right at ${d(V.l15CrestSpeed15, 2)}, which is $p/2m$.`,
    caption: 'the crests slide to the right as the phase turns',
    stage: W(PL(1.5), { time: sweep(0, 5.6), show: ['re', 'phase'] }),
    claims: [
      claim('l15PlaneP15', 'the plane wave of the unit has p = 1.5', () => close(V.l15PlaneP15, 1.5, 1e-9)),
      claim('l15E15', 'its energy p²/2m is 1.125', () => close(V.l15E15, 1.125, 1e-9)),
      claim('l15PlanePeriod', 'the phase at a point turns once in 5.59 time units', () => close(V.l15PlanePeriod, 2 * Math.PI / 1.125, 1e-9)),
      claim('l15CrestSpeed15', 'the crests move at 0.75, which is p/2m', () => close(V.l15CrestSpeed15, 0.75, 1e-9)),
    ],
  },
  {
    id: 'l15-free-eigenstate:b3',
    phase: 'lecture',
    text: 'Is this a particle moving to the right? The crests move, but $|\\psi_p|^2 = 1/h$ is the same at every $x$ and every time, where $h = 2\\pi\\hbar$. The momentum is perfectly defined and no place is preferred. The integral of this density over all $x$ diverges, so $|p\\rangle$ is a delta-normalised, [[generalized-eigenstate|generalised eigenstate]], not a state we can [[normalized|normalise]]. The constant $1/h$ is a formal squared amplitude, not the chance of a stretch.',
    caption: 'a flat density for a perfectly sharp momentum',
    stage: W(PL(1.5), { show: ['density'], readouts: ['pmean', 'pspread'] }),
    claims: [claim('l15FlatDensity', 'the density of the plane wave varies by 0 over the window and over time (to rounding)', () => close(V.l15FlatDensity, 0, 1e-12))],
  },
  {
    id: 'l15-free-eigenstate:b4',
    phase: 'books',
    text: 'Townsend §6.6 (p. 204, Eq. 6.58) puts it this way: the chance weight $|\\langle x|p\\rangle|^2dx = \\tfrac{dx}{2\\pi\\hbar}$ does not depend on $x$, so $\\Delta x$ is infinite and the state is not physical. Susskind and Friedman, Lecture 9, §9.3, solve the time-independent equation for a free particle and find momentum eigenvectors with $E = \\tfrac{p^2}{2m}$.',
    caption: 'the same flat density, written as Townsend writes it',
    stage: W(PL(1.5), { show: ['density'] }),
    refs: [
      townsend('§6.6, p. 204 (Eq. 6.58)', 'The weight $dx/2\\pi\\hbar$ of a momentum state is the same at every $x$, so $\\Delta x$ is infinite.'),
      susskind('Lecture 9, §9.3', 'Momentum eigenvectors solve the time-independent equation of a free particle, with $E = p^2/2m$.'),
    ],
  },
  {
    id: 'l15-free-eigenstate:b5',
    phase: 'clue',
    text: 'A free particle of mass 1 has energy $E = 2$. How many different momenta can carry that energy?',
    stage: W(PL(2), { show: ['re'] }),
    reveal: {
      text: `${d(V.l15SameEnergyCount, 0)} of them, $p = 2$ and $p = -2$: the same energy with opposite directions. Their equal mix is a standing pattern, not a moving one.`,
      caption: 'the sum of the two waves: a density that does not move',
      stage: W(TW(2, -2), { show: ['density'] }),
      claims: [claim('l15SameEnergyCount', 'two momenta carry E = 2', () => close(V.l15SameEnergyCount, 2, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l15-packet-evolution — Evolve each momentum component                                          */
/* ---------------------------------------------------------------------------------------------- */

const packetEvolution: Beat[] = [
  {
    id: 'l15-packet-evolution:b1',
    phase: 'lecture',
    text: `One ket holds many momentum amplitudes: $|\\psi(0)\\rangle = \\int dp\\,\\tilde\\psi(p,0)\\,|p\\rangle$ (Unit 13.4). The notes call the amplitude $\\phi(p,t)$; here it keeps its name $\\tilde\\psi(p,t)$ from Unit 13.4. The choice of $\\tilde\\psi(p,0)$ decides where the packet sits and how sharply. The packet in the picture has mean momentum ${d(V.l15MeanP15, 1)} in units of $\\hbar/\\ell$.`,
    caption: 'one state in two panels: where it is, and how fast it is going',
    stage: W(PK(0, 1, 1.5), { panels: ['position', 'momentum'], readouts: ['pmean'] }),
    claims: [claim('l15MeanP15', 'the unit packet has mean momentum 1.5', () => close(V.l15MeanP15, 1.5, 1e-9))],
  },
  {
    id: 'l15-packet-evolution:b2',
    phase: 'lecture',
    text: `Which basis makes the evolution easy? One where $\\hat H$ is diagonal, so the momentum basis, in which every $|p\\rangle$ is an energy ket. Each component keeps its size and only turns: $\\tilde\\psi(p,t) = e^{-ip^2t/2m\\hbar}\\,\\tilde\\psi(p,0)$. After $t = ${d(V.l15EchoT12, 1)}$ the $p = 1$ component has turned through $-${d(V.l15PhaseP1DegMag, 1)}^\\circ$, and the $p = 2$ component through $-${d(V.l15PhaseP2DegMag, 1)}^\\circ$.`,
    caption: 'the height of each momentum component stays; the colour of its phase band shifts',
    stage: W(PK(0, 1, 1.5), { panels: ['momentum'], show: ['density', 'phase'], time: sweep(0, 1.2) }),
    derivation: {
      result: '\\tilde\\psi(p,t) = e^{-ip^2t/2m\\hbar}\\,\\tilde\\psi(p,0)',
      ground: [
        {
          tex: '|\\psi(0)\\rangle = \\int dp\\,\\tilde\\psi(p,0)\\,|p\\rangle',
          why: 'Expand the start in momentum kets; $\\tilde\\psi(p,0)$ is the amplitude of each.',
          view: W(PK(0, 1, 1.5), { panels: ['momentum'], show: ['density', 'phase'] }),
          viewCaption: 'the amplitudes at the start',
        },
        {
          tex: '|\\psi(t)\\rangle = e^{-i\\hat Ht/\\hbar}\\int dp\\,\\tilde\\psi(p,0)\\,|p\\rangle',
          why: 'Let the whole ket evolve. The law is linear, so the operator acts on every term of the sum.',
        },
        {
          tex: '|\\psi(t)\\rangle = \\int dp\\,\\tilde\\psi(p,0)\\,e^{-iE_pt/\\hbar}\\,|p\\rangle',
          why: 'Each $|p\\rangle$ is an energy ket, so $e^{-i\\hat Ht/\\hbar}$ turns it into the number $e^{-iE_pt/\\hbar}$ times itself.',
        },
        {
          tex: '\\tilde\\psi(p,t) = e^{-ip^2t/2m\\hbar}\\,\\tilde\\psi(p,0)',
          why: 'Take the overlap with $\\langle p|$ and put in $E_p = \\tfrac{p^2}{2m}$.',
          view: W(PK(0, 1, 1.5), { panels: ['momentum'], show: ['density', 'phase'], time: 1.2 }),
          viewCaption: 'a moment later the phase band has shifted and the heights have not',
        },
      ],
    },
    claims: [
      claim('l15EchoT12', 'the time at which the phases are read is 1.2', () => close(V.l15EchoT12, 1.2, 1e-12)),
      claim('l15PhaseP1DegMag', 'the p = 1 component has turned through 34.4°', () => close(V.l15PhaseP1DegMag, 34.3775, 5e-4)),
      claim('l15PhaseP2DegMag', 'and the p = 2 component through 137.5°', () => close(V.l15PhaseP2DegMag, 137.5099, 5e-4)),
    ],
  },
  {
    id: 'l15-packet-evolution:b3',
    phase: 'lecture',
    text: `Back in position space, insert the transform of the evolved amplitudes: $\\psi(x,t) = \\tfrac{1}{\\sqrt{2\\pi\\hbar}}\\int dp\\,\\tilde\\psi(p,0)\\,e^{i(px - p^2t/2m)/\\hbar}$. This is the free solution for any normalisable start. The packet stays normalised: its total chance at $t = 6$ is ${d(V.l15NormT6, 0)}.`,
    caption: 'the packet runs to the right and widens, and its total chance stays 1',
    stage: W(PK(0, 1, 1.5), { panels: ['position', 'momentum'], time: sweep(0, 6), readouts: ['norm'], window: RUN }),
    claims: [claim('l15NormT6', 'the total chance at t = 6 is 1', () => close(V.l15NormT6, 1, 1e-9))],
  },
  {
    id: 'l15-packet-evolution:b4',
    phase: 'lecture',
    text: `What changes and what does not. $|\\tilde\\psi(p,t)|^2$ is fixed, so $\\langle p\\rangle$ and $\\Delta p$ are constant: $\\Delta p = ${d(V.l15DpT0, 1)}$ at $t = 0$ and ${d(V.l15DpT6, 1)} at $t = 6$, and $\\langle p\\rangle = ${d(V.l15MeanPT6, 1)}$ at $t = 6$. But $|\\psi(x,t)|^2$ moves and flattens: its peak falls to ${d(V.l15PeakRatioT6, 3)} of its start by $t = 6$. Different phases make the components add differently at each $x$.`,
    caption: 'the momentum curve stays put while the position curve moves and flattens',
    stage: W(PK(0, 1, 1.5), { panels: ['position', 'momentum'], time: sweep(0, 6), readouts: ['pspread', 'pmean', 'peak'], window: RUN }),
    claims: [
      claim('l15DpT0', 'Δp is 0.5 at t = 0', () => close(V.l15DpT0, 0.5, 1e-9)),
      claim('l15DpT6', 'and still 0.5 at t = 6', () => close(V.l15DpT6, 0.5, 1e-9)),
      claim('l15MeanPT6', 'the mean momentum is still 1.5 at t = 6', () => close(V.l15MeanPT6, 1.5, 1e-9)),
      claim('l15PeakRatioT6', 'the peak of the density at t = 6 is 0.316 of its start', () => close(V.l15PeakRatioT6, 1 / Math.sqrt(10), 1e-9)),
      claim('l15PhiDrift', '|φ(p, 6)|² equals |φ(p, 0)|² to rounding (a check, not shown)', () => close(V.l15PhiDrift, 0, 1e-9)),
    ],
  },
  {
    id: 'l15-packet-evolution:b5',
    phase: 'books',
    text: 'Townsend §6.6 (pp. 208–210, Eqs. 6.73–6.75) takes the same route: momentum states are energy states, so multiply each by its phase and transform back. He notes that the chance of each momentum is the same at every time. Susskind and Friedman, Lecture 9, §9.3, put it as a conservation law. Only the phase of the momentum amplitude changes, so momentum is conserved for a free particle.',
    caption: 'the same evolution, read as a phase per momentum',
    stage: W(PK(0, 1, 1.5), { panels: ['position', 'momentum'], time: sweep(0, 6), window: RUN }),
    refs: [
      townsend('§6.6, pp. 208–210 (Eqs. 6.73–6.75)', 'Multiply each momentum state by $e^{-ip^2t/2m\\hbar}$ and transform back; the chance of each momentum is unchanged.'),
      susskind('Lecture 9, §9.3', 'Only the phase of the momentum amplitude changes, so the distribution of momenta is constant.'),
    ],
  },
  {
    id: 'l15-packet-evolution:b6',
    phase: 'clue',
    text: 'The momentum distribution never changes. How can the position distribution change?',
    stage: W(PK(0, 1, 1.5), { panels: ['momentum'], time: 0 }),
    reveal: {
      text: 'Through the phases between the components. Each keeps its size but turns at its own rate, so the interference at each $x$ keeps changing. Compare $t = 0$ with $t = 6$.',
      caption: 'the momentum curve is the same, the position curve is not',
      stage: W(PK(0, 1, 1.5), { panels: ['position', 'momentum'], time: 6, window: RUN }),
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l15-group-velocity — How fast does a packet move?                                              */
/* ---------------------------------------------------------------------------------------------- */

const groupVelocity: Beat[] = [
  {
    id: 'l15-group-velocity:b1',
    phase: 'lecture',
    text: `An easier route to the speed: add just two waves with nearby momenta. They cannot be normalised and their pattern repeats, yet the envelope of the pattern moves like a narrow packet. Take $p_1 = 2$ and $p_2 = 4$ with $m = 1$. The density of $\\tfrac{1}{\\sqrt2}\\left(e^{ip_1x - iE_1t} + e^{ip_2x - iE_2t}\\right)$ has fringes ${d(V.l15FringeSpacing, 3)} $\\ell$ apart. They travel at ${d(V.l15FringeSpeed, 1)} $\\ell$ per unit time, which equals $(p_1 + p_2)/2m$.`,
    caption: 'two plane waves: the fringes of the density travel to the right',
    stage: W(TW(2, 4), { time: sweep(0, 2), show: ['density'] }),
    claims: [
      claim('l15FringeSpacing', 'the fringes of p = 2 and 4 are π ℓ apart', () => close(V.l15FringeSpacing, Math.PI, 1e-9)),
      claim('l15FringeSpeed', 'the tracked fringe moves at 3.0 ℓ per unit time', () => close(V.l15FringeSpeed, 3, 1e-9)),
      claim('l15FringeSpeedFormula', 'which equals (p₁ + p₂)/2m', () => close(V.l15FringeSpeedFormula, V.l15FringeSpeed, 1e-9)),
    ],
  },
  {
    id: 'l15-group-velocity:b2',
    phase: 'lecture',
    text: `Why does the pattern have an envelope? Take wave numbers $k_1$ and $k_2$ close together, with frequencies $\\omega_1 = \\omega(k_1)$ and $\\omega_2 = \\omega(k_2)$. Write $k_0$ and $\\bar\\omega$ for their means, and $\\Delta k$ and $\\Delta\\omega$ for their differences. Since $e^{iA} + e^{iB} = 2e^{i(A+B)/2}\\cos\\tfrac{A-B}{2}$, the sum is a fast carrier times a slow [[envelope|envelope]]. For $k_1 = ${d(V.l15EchoK1Near, 1)}$ and $k_2 = ${d(V.l15EchoK2Near, 1)}$ the fringes are ${d(V.l15FringeSpacingNear, 1)} $\\ell$ apart.`,
    caption: 'a fast carrier inside a slow envelope',
    stage: W(TW(2.8, 3.2), { window: { x: [-16, 16] }, show: ['re', 'density'] }),
    derivation: {
      result: 'v_{\\rm env} = \\tfrac{\\Delta\\omega}{\\Delta k}\\to\\tfrac{d\\omega}{dk}',
      ground: [
        {
          tex: '\\psi \\propto e^{i(k_1x-\\omega_1t)} + e^{i(k_2x-\\omega_2t)}',
          why: 'Two plane waves with nearby wave numbers, each with its own frequency.',
          view: W(TW(2.8, 3.2), { window: { x: [-16, 16] }, show: ['re', 'density'] }),
          viewCaption: 'the pair at the start',
        },
        {
          tex: 'e^{iA} + e^{iB} = 2e^{i(A+B)/2}\\cos\\tfrac{A-B}{2}',
          why: 'Pull out the average phase; what is left over is a cosine of half the difference.',
        },
        {
          tex: '\\psi \\propto 2e^{i(k_0x-\\bar\\omega t)}\\cos\\tfrac{\\Delta k\\,x-\\Delta\\omega\\,t}{2}',
          why: 'The first factor is a fast carrier. The cosine does not change sign with its argument, so it is a slow envelope.',
        },
        {
          tex: '\\Delta k\\,x-\\Delta\\omega\\,t = \\text{const}\\ \\Rightarrow\\ \\Delta k\\,\\tfrac{dx}{dt} = \\Delta\\omega',
          why: 'The envelope keeps its phase where its argument is constant; differentiate in time.',
          view: W(TW(2.8, 3.2), { window: { x: [-16, 16] }, show: ['re', 'density'], time: 3 }),
          viewCaption: 'the same pair a few time units later: the envelope has moved',
        },
        {
          tex: 'v_{\\rm env} = \\tfrac{\\Delta\\omega}{\\Delta k}\\to\\tfrac{d\\omega}{dk}',
          why: 'Solve for the speed. Letting the two wave numbers approach each other turns the ratio into a derivative.',
        },
      ],
    },
    claims: [
      claim('l15EchoK1Near', 'the first wave number is 2.8', () => close(V.l15EchoK1Near, 2.8, 1e-12)),
      claim('l15EchoK2Near', 'and the second is 3.2', () => close(V.l15EchoK2Near, 3.2, 1e-12)),
      claim('l15FringeSpacingNear', 'the fringes of the near pair are 15.7 ℓ apart (2π/Δk)', () => close(V.l15FringeSpacingNear, 2 * Math.PI / 0.4, 1e-9)),
    ],
  },
  {
    id: 'l15-group-velocity:b3',
    phase: 'lecture',
    text: `Follow the envelope, not the crests. Its phase is fixed where $\\Delta k\\,x - \\Delta\\omega\\,t$ is constant, so it moves at $v_{\\rm env} = \\Delta\\omega/\\Delta k$. Let $\\Delta k\\to0$: the speed becomes the [[group-velocity|group velocity]] $v_g = d\\omega/dk$. For the pair above, $\\Delta\\omega/\\Delta k$ is ${d(V.l15EnvSpeedNear, 1)} in units of $\\ell$ per unit time.`,
    caption: 'the fringes of the density slide at the envelope speed',
    stage: W(TW(2.8, 3.2), { window: { x: [-16, 16] }, time: sweep(0, 3), show: ['density'] }),
    claims: [claim('l15EnvSpeedNear', 'the envelope of the near pair moves at Δω/Δk = 3.0', () => close(V.l15EnvSpeedNear, 3, 1e-9))],
  },
  {
    id: 'l15-group-velocity:b4',
    phase: 'lecture',
    text: `For the free particle $\\omega = \\tfrac{\\hbar k^2}{2m}$, so $v_g = \\tfrac{\\hbar k}{m} = \\tfrac{p}{m}$: the classical velocity, recovered without following any trajectory. A packet with $p_0 = 3$ has its centre at ${d(V.l15Centre3, 0)} $\\ell$ at $t = 3$.`,
    caption: 'the centre of the packet moves at 3 and reaches 9',
    stage: W(PK(0, 1, 3), { time: sweep(0, 3), readouts: ['xmean'], window: RUN }),
    claims: [claim('l15Centre3', 'the centre of the p₀ = 3 packet is at 9 ℓ at t = 3', () => close(V.l15Centre3, 9, 1e-9))],
  },
  {
    id: 'l15-group-velocity:b5',
    phase: 'lecture',
    text: `An aside, short if you are late. A lone plane wave has crests that travel at $v_{\\rm phase} = \\omega/k = \\tfrac{p}{2m}$, the [[phase-velocity|phase velocity]]. At $k = 3$ that is ${d(V.l15PhaseV3, 1)}, against 3 for the envelope: a ratio of ${d(V.l15GroupPhaseRatio, 0)}. The crests of the near pair go at ${d(V.l15CarrierSpeedNear, 3)}. There is no contradiction: a crest is not the particle.`,
    caption: 'the crests inside the envelope run slower than the envelope',
    stage: W(TW(2.8, 3.2), { window: { x: [-16, 16] }, time: sweep(0, 3), show: ['re', 'density'] }),
    claims: [
      claim('l15PhaseV3', 'the crests of one plane wave at k = 3 move at 1.5', () => close(V.l15PhaseV3, 1.5, 1e-9)),
      claim('l15GroupPhaseRatio', 'the envelope runs 2 times as fast', () => close(V.l15GroupPhaseRatio, 2, 1e-9)),
      claim('l15CarrierSpeedNear', 'the crests of the near pair go at ω̄/k₀ = 1.507', () => close(V.l15CarrierSpeedNear, 4.52 / 3, 1e-9)),
    ],
  },
  {
    id: 'l15-group-velocity:b6',
    phase: 'books',
    text: 'Townsend §6.3 (p. 199, Eq. 6.33) gives a second route for any packet: the mean position obeys $\\tfrac{d\\langle x\\rangle}{dt} = \\tfrac{\\langle p\\rangle}{m}$ exactly. Lecture 16 derives it. Susskind and Friedman, Lecture 9, §9.4, say the packet centre travels at the mean of $p/m$. In §9.1 a Hamiltonian $c\\hat p$ moves every component at the speed $c$.',
    caption: 'the centre of a free packet runs at the mean of $p/m$',
    stage: W(PK(0, 1, 3), { time: sweep(0, 3), window: RUN }),
    refs: [
      townsend('§6.3, p. 199 (Eq. 6.33)', 'For any packet the mean position obeys $d\\langle x\\rangle/dt = \\langle p\\rangle/m$, a second route to the same speed.'),
      susskind('Lecture 9, §9.1 and §9.4', 'The centre of the packet travels at the mean of $p/m$; with $H = c\\hat p$ every component moves at $c$.'),
    ],
  },
  {
    id: 'l15-group-velocity:b7',
    phase: 'clue',
    text: 'A packet is centred on $p_0 = -3$ with $m = 1$. Which way does it go, and is its energy negative?',
    stage: W(PK(0, 1, -3), { time: 0 }),
    reveal: {
      text: `To the left: its centre is at $-${d(V.l15NegCentre2Mag, 0)}\\,\\ell$ at $t = 2$, because $v_g = p_0/m$. The mean energy $\\big\\langle\\tfrac{\\hat p^2}{2m}\\big\\rangle$ is ${d(V.l15NegEnergy, 3)}, positive for either sign of the momentum.`,
      caption: 'the centre has moved to −6; the energy readout does not care about the sign',
      stage: W(PK(0, 1, -3), { time: 2, readouts: ['xmean'] }),
      claims: [
        claim('l15NegCentre2Mag', 'the centre is at −6 ℓ at t = 2', () => close(V.l15NegCentre2Mag, 6, 1e-9)),
        claim('l15NegEnergy', 'the mean energy is 4.625', () => close(V.l15NegEnergy, 4.625, 1e-9)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l15-dispersion — Why does the packet spread?                                                   */
/* ---------------------------------------------------------------------------------------------- */

const dispersion: Beat[] = [
  {
    id: 'l15-dispersion:b1',
    phase: 'lecture',
    text: `The group velocity $v_g = p/m$ depends on $p$. A packet with momentum spread $\\Delta p$ holds velocities spread by $\\Delta v\\sim\\Delta p/m$, which is ${d(V.l15DeltaV, 1)} for $\\Delta p = 0.5$. Faster parts run ahead and slower parts lag: this is [[dispersion|dispersion]]. The velocity is ${d(V.l15Vg1, 0)} at $k = 1$ and ${d(V.l15Vg3, 0)} at $k = 3$.`,
    caption: 'the packet widens as its fast and slow parts part company',
    stage: W(PK(0, 1, 1.5), { panels: ['position', 'momentum'], time: sweep(0, 6), readouts: ['xspread', 'pspread'], window: RUN }),
    claims: [
      claim('l15DeltaV', 'Δv = Δp/m is 0.5 for Δp = 0.5', () => close(V.l15DeltaV, 0.5, 1e-9)),
      claim('l15Vg1', 'the group velocity is 1 at k = 1', () => close(V.l15Vg1, 1, 1e-9)),
      claim('l15Vg3', 'and 3 at k = 3', () => close(V.l15Vg3, 3, 1e-9)),
    ],
  },
  {
    id: 'l15-dispersion:b2',
    phase: 'lecture',
    text: `Is spreading inevitable because $\\Delta p > 0$? No. The uncertainty relation says that several momenta are needed, but what they do depends on how $\\omega$ varies with $k$. Expand about the mean wave number $k_0$ with $q = k - k_0$. The linear term only shifts the envelope. The curvature $\\omega_0''$ adds relative phases, so the shape changes. For the free particle $\\omega'' = \\hbar/m$, which is ${d(V.l15Omega2nd, 0)}.`,
    caption: 'the curve of ω(k): its slope sets the speed, its bend sets the spreading',
    stage: OMEGA,
    fidelity: ['plot-free-omega'],
    derivation: {
      result: 'kx-\\omega(k)t \\approx (k_0x-\\omega_0t) + q(x-v_gt) - \\tfrac12\\,\\omega_0\'\'\\,q^2t',
      ground: [
        {
          tex: '\\psi \\propto \\int dk\\,A(k)\\,e^{i[kx-\\omega(k)t]}',
          why: 'A packet is a sum of plane waves, with amplitudes $A(k)$ that are large near the mean wave number $k_0$.',
          view: W(PK(0, 1, 1.5), { show: ['re', 'density'], window: RUN }),
          viewCaption: 'the packet at the start',
        },
        {
          tex: 'q = k - k_0,\\qquad \\omega(k) \\approx \\omega_0 + v_g\\,q + \\tfrac12\\,\\omega_0\'\'\\,q^2',
          why: 'Expand $\\omega$ about $k_0$; the slope there is $v_g$ and the curvature is $\\omega_0\'\'$.',
        },
        {
          tex: 'kx-\\omega(k)t \\approx (k_0x-\\omega_0t) + q(x-v_gt) - \\tfrac12\\,\\omega_0\'\'\\,q^2t',
          why: 'Put $k = k_0 + q$ into the phase and collect the terms by powers of $q$. The linear term moves the envelope rigidly; the quadratic term changes its shape.',
          view: W(PK(0, 1, 1.5), { show: ['re', 'density'], time: 6, window: RUN }),
          viewCaption: 'the quadratic term has had time to act',
        },
      ],
    },
    claims: [claim('l15Omega2nd', 'the free ω″ is ħ/m = 1', () => close(V.l15Omega2nd, 1, 1e-9))],
  },
  {
    id: 'l15-dispersion:b3',
    phase: 'lecture',
    text: 'Compare a linear and a quadratic relation. For $\\omega = ck$ with $k > 0$ the curvature $\\omega_0\'\'$ is zero and every component moves at $c$, so the envelope slides without broadening. For $\\omega = \\tfrac{\\hbar k^2}{2m}$ the curvature is $\\hbar/m$ and the components part ways. In the picture a rigid shift stands in for $\\omega = ck$, because it moves every component by the same distance, as $i\\hbar\\,\\partial_t\\psi = c\\hat p\\psi$ would.',
    caption: 'above, a rigid shift: the width stays the same; below, the two relations, a straight line and a parabola',
    stage: { layout: 'split', top: W(PK(0, 1, 1.5), { shift: sweep(0, 6), overlay: ['original'], readouts: ['xspread'], window: RUN }), bottom: OMEGA_LIGHT },
    fidelity: ['plot-free-omega'],
  },
  {
    id: 'l15-dispersion:b4',
    phase: 'lecture',
    text: 'Payoff and care. A packet can obey the uncertainty relation and still keep its width, if every wave number it holds travels at one speed. That needs an idealised one-way wave in one dimension; real beams diffract and real media disperse. Spreading need not even grow steadily: a correlation between position and momentum can first squeeze a packet. The simple picture is for an unchirped Gaussian with a real envelope.',
    caption: 'matter waves bend upward; light’s line does not',
    stage: OMEGA_LIGHT,
    fidelity: ['plot-free-omega'],
  },
  {
    id: 'l15-dispersion:b5',
    phase: 'books',
    text: 'Susskind and Friedman, Lecture 9, §9.1–9.2, set two cases side by side. The packet of a first-order equation keeps its shape. The packet of a free particle moves and spreads. Townsend §6.6 (p. 209, Eq. 6.77) shows that the width grows while $\\Delta p$ does not. Lecture 16 derives the width.',
    caption: 'a free packet travels and widens',
    stage: W(PK(0, 1, 1.5), { time: sweep(0, 6), window: RUN }),
    refs: [
      susskind('Lecture 9, §9.1–9.2', 'A first-order equation with $H = c\\hat p$ keeps the shape; $H = \\hat p^2/2m$ gives packets that move and spread.'),
      townsend('§6.6, p. 209 (Eq. 6.77)', 'The width of the free Gaussian grows with time while the spread of momentum stays fixed.'),
    ],
  },
  {
    id: 'l15-dispersion:b6',
    phase: 'clue',
    text: 'A packet with $\\sigma = 1\\,\\ell$ is followed for 6 time units. How wide is it if every component moves at one speed, and how wide for the free particle?',
    stage: W(PK(0, 1, 1.5), { time: 0, readouts: ['xspread'], window: RUN }),
    reveal: {
      text: `${d(V.l15LinearWidth6, 0)} $\\ell$ against ${d(V.l15QuadWidth6, 2)} $\\ell$. A rigid shift cannot change a width; the free packet widens because its components run at different speeds.`,
      caption: 'the free packet at t = 6, with the starting packet dashed: 3.16 wide instead of 1',
      stage: W(PK(0, 1, 1.5), { time: 6, overlay: ['original'], readouts: ['xspread'], window: RUN }),
      claims: [
        claim('l15LinearWidth6', 'a rigid shift leaves the width at 1 ℓ', () => close(V.l15LinearWidth6, 1, 1e-9)),
        claim('l15QuadWidth6', 'the free packet is 3.16 ℓ wide at t = 6', () => close(V.l15QuadWidth6, Math.sqrt(10), 1e-9)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l15-gaussian — The Gaussian: uncertainty meets dynamics                                        */
/* ---------------------------------------------------------------------------------------------- */

const gaussian: Beat[] = [
  {
    id: 'l15-gaussian:b1',
    phase: 'lecture',
    text: `The Gaussian of the homework is $\\psi(x,0) = \\tfrac{1}{\\sqrt[4]{2\\pi\\sigma^2}}\\exp\\left[-\\tfrac{(x-x_0)^2}{4\\sigma^2} + \\tfrac{ip_0(x-x_0)}{\\hbar}\\right]$. Its mean position is $x_0$ and its spread is $\\Delta x = \\sigma$. Its momentum amplitude is another [[gaussian-packet|Gaussian]] about $p_0$ with $\\Delta p = \\tfrac{\\hbar}{2\\sigma}$, so $\\Delta x\\,\\Delta p = \\tfrac{\\hbar}{2}$. For $\\sigma = ${d(V.l15Dx08, 1)}$ the spread $\\Delta p$ is ${d(V.l15Dp08, 3)} and the product is ${d(V.l15Prod08, 1)}. <<sl-q3-uncertainty|Go further in 709: the uncertainty relation>>`,
    caption: 'the same Gaussian in two panels: narrower in position, wider in momentum',
    stage: W(PK(0, 0.8, 1.5), { panels: ['position', 'momentum'], readouts: ['xspread', 'pspread', 'product'] }),
    claims: [
      claim('l15Dx08', 'the position spread of the example is σ = 0.8', () => close(V.l15Dx08, 0.8, 1e-9)),
      claim('l15Dp08', 'its momentum spread is ħ/2σ = 0.625', () => close(V.l15Dp08, 0.625, 1e-9)),
      claim('l15Prod08', 'and the product is 0.5, in units of ħ', () => close(V.l15Prod08, 0.5, 1e-9)),
    ],
  },
  {
    id: 'l15-gaussian:b2',
    phase: 'lecture',
    text: `What should happen? The centre moves at $p_0/m$. The spread of momenta is a spread of velocities, $\\Delta v\\sim\\Delta p/m = \\tfrac{\\hbar}{2m\\sigma}$, which is ${d(V.l15Dv08, 3)} here. A narrower packet has the larger $\\Delta p$, so it spreads faster. The uncertainty relation does not push the packet apart. Schrödinger evolution does, acting on the momenta that the relation says must be present.`,
    caption: 'the centre runs at $p_0/m$ while the packet widens',
    stage: W(PK(0, 0.8, 1.5), { time: sweep(0, 3), window: RUN }),
    claims: [claim('l15Dv08', 'the spread of velocities Δp/m is 0.625', () => close(V.l15Dv08, 0.625, 1e-9))],
  },
  {
    id: 'l15-gaussian:b3',
    phase: 'lecture',
    text: `A quick scaling argument. The velocity spread matters once $\\Delta v\\,t$ is as large as the width $\\sigma$. That gives the [[spreading-time|spreading time]] $t_{\\rm spread}\\sim\\tfrac{\\sigma}{\\Delta v} = \\tfrac{2m\\sigma^2}{\\hbar}$. It is ${d(V.l15Tspread08, 2)} for $\\sigma = 0.8$ and ${d(V.l15Tspread04, 2)} for $\\sigma = ${d(V.l15Dx04, 1)}$.`,
    caption: 'the packet over its first spreading time',
    stage: W(PK(0, 0.8, 1.5), { time: sweep(0, 1.28), window: RUN }),
    derivation: {
      result: 't_{\\rm spread}\\sim\\tfrac{\\sigma}{\\Delta v} = \\tfrac{2m\\sigma^2}{\\hbar}',
      ground: [
        {
          tex: '\\Delta p = \\tfrac{\\hbar}{2\\sigma}',
          why: 'A Gaussian saturates the uncertainty relation, so its momentum spread is fixed by its width.',
          view: W(PK(0, 0.8, 1.5), { panels: ['position', 'momentum'], readouts: ['pspread'] }),
          viewCaption: 'the example with $\\sigma = 0.8$',
        },
        {
          tex: '\\Delta v\\sim\\tfrac{\\Delta p}{m} = \\tfrac{\\hbar}{2m\\sigma}',
          why: 'Each momentum travels at $p/m$, so a spread of momenta is a spread of velocities.',
        },
        {
          tex: '\\Delta v\\,t\\sim\\sigma',
          why: 'The spread of velocities matters once it has carried a part of the packet a width away.',
        },
        {
          tex: 't_{\\rm spread}\\sim\\tfrac{\\sigma}{\\Delta v} = \\tfrac{2m\\sigma^2}{\\hbar}',
          why: 'Solve for the time and put in $\\Delta v$ from the second line.',
          view: W(PK(0, 0.4, 1.5), { panels: ['position', 'momentum'], readouts: ['pspread'] }),
          viewCaption: 'half the width: twice the momentum spread, so a quarter of the time',
        },
      ],
    },
    claims: [
      claim('l15Tspread08', 'the spreading time for σ = 0.8 is 1.28', () => close(V.l15Tspread08, 1.28, 1e-9)),
      claim('l15Tspread04', 'and 0.32 for σ = 0.4', () => close(V.l15Tspread04, 0.32, 1e-9)),
      claim('l15Dx04', 'the narrower packet has σ = 0.4', () => close(V.l15Dx04, 0.4, 1e-9)),
    ],
  },
  {
    id: 'l15-gaussian:b4',
    phase: 'lecture',
    text: `An optional preview, derived in Lecture 16. For this Gaussian $\\langle x\\rangle_t = x_0 + \\tfrac{p_0t}{m}$ and $\\Delta x(t) = \\sigma\\sqrt{1 + \\left(\\tfrac{\\hbar t}{2m\\sigma^2}\\right)^2}$. At $t = t_{\\rm spread}$ the root is $\\sqrt2$, so the width has grown by the factor ${d(V.l15WidthAtTSpread, 3)}.`,
    caption: 'the packet at one spreading time: its width read off the engine',
    stage: W(PK(0, 0.8, 1.5), { time: 1.28, readouts: ['xspread'], window: RUN }),
    claims: [claim('l15WidthAtTSpread', 'at t_spread the width has grown by √2 = 1.414', () => close(V.l15WidthAtTSpread, Math.SQRT2, 1e-9))],
  },
  {
    id: 'l15-gaussian:b5',
    phase: 'lecture',
    text: 'Three results to keep. First, $\\tilde\\psi(p,t) = e^{-ip^2t/2m\\hbar}\\,\\tilde\\psi(p,0)$, with $|\\tilde\\psi|^2$ fixed. Second, $\\psi(x,t) = \\tfrac{1}{\\sqrt{2\\pi\\hbar}}\\int dp\\,\\tilde\\psi(p,0)\\,e^{i(px-p^2t/2m)/\\hbar}$. Third, $\\omega = \\tfrac{\\hbar k^2}{2m}$ and $v_g = \\tfrac{p}{m}$. A momentum eigenstate has a sharp velocity and no place. A packet gets its place from many momenta, and the phases between them keep shifting, so it moves and spreads.',
    caption: 'the whole story in one packet: it moves at $p_0/m$ and it widens',
    stage: W(PK(0, 0.8, 1.5), { panels: ['position', 'momentum'], time: sweep(0, 4), window: RUN }),
  },
  {
    id: 'l15-gaussian:b6',
    phase: 'books',
    text: `Townsend §6.6 (pp. 208–209, Eq. 6.77) defines a time $T$ by $\\hbar^2T^2/m^2a^4 = 1$, so $T = ma^2/\\hbar$. His width constant is $a = \\sqrt2\\,\\sigma$ (Unit 13.4), so $T$ becomes $2m\\sigma^2/\\hbar$, the scale of the scaling argument: the ratio is ${d(V.l15TspreadEqTownsend, 0)}. Lecture 16 gives his numbers for an electron and for a marble.`,
    caption: 'a narrow packet spreads quickly',
    stage: W(PK(0, 0.5), { time: sweep(0, 2) }),
    refs: [townsend('§6.6, pp. 208–209 (Eq. 6.77)', 'The time $T = ma^2/\\hbar$ for significant spreading; with $a = \\sqrt2\\,\\sigma$ it is $2m\\sigma^2/\\hbar$.')],
    claims: [claim('l15TspreadEqTownsend', 'Townsend’s ma²/ħ with a = √2σ equals 2mσ²/ħ (ratio 1)', () => close(V.l15TspreadEqTownsend, 1, 1e-9))],
  },
  {
    id: 'l15-gaussian:b7',
    phase: 'clue',
    text: 'Squeeze a packet to half its width. What happens to its spreading time?',
    stage: W(PK(0, 0.8, 1.5), { time: 0.5, window: RUN }),
    reveal: {
      text: `It becomes a quarter as long: ${d(V.l15Tspread08, 2)} drops to ${d(V.l15Tspread04, 2)}, a factor of ${d(V.l15TspreadRatio, 0)}. The momentum spread doubled, and the time goes as the square of the width.`,
      caption: 'the narrower packet has already widened more at the same moment',
      stage: W(PK(0, 0.4, 1.5), { time: 0.5, window: RUN }),
      claims: [
        claim('l15Tspread08', 'the spreading time for σ = 0.8 is 1.28', () => close(V.l15Tspread08, 1.28, 1e-9)),
        claim('l15Tspread04', 'and 0.32 after halving σ', () => close(V.l15Tspread04, 0.32, 1e-9)),
        claim('l15TspreadRatio', 'a factor of 4', () => close(V.l15TspreadRatio, 4, 1e-9)),
      ],
    },
  },
]

export const L15_STORY: Record<string, Beat[]> = {
  'l15-puzzle': puzzle,
  'l15-free-eigenstate': freeEigenstate,
  'l15-packet-evolution': packetEvolution,
  'l15-group-velocity': groupVelocity,
  'l15-dispersion': dispersion,
  'l15-gaussian': gaussian,
}

/** Every claim of a unit's beats, reveals and derivation steps (each unit's `claims`: the number reader backs a unit's prose with it). */
const claimsOf = (beats: Beat[]): Claim[] => beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground ?? []).flatMap((s) => s.claims ?? [])])
export const L15_UNIT_CLAIMS: Record<string, Claim[]> = Object.fromEntries(Object.entries(L15_STORY).map(([id, beats]) => [id, claimsOf(beats)]))
