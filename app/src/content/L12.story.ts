/**
 * Lecture 12 scroll story (owner: P). Beats per docs/roles/proposals/P-L12-story.md §1, with the judge's rulings
 * (docs/roles/decisions/448-L12L13.md, R1-R8):
 * - R1: this chapter owns the shared pieces. The SVG kind `wavefunction` (stage/svg/wavefunction.ts), the engine physics/wave.ts, physics/constants.ts and
 *   the `levels` helpers of physics/dynamics.ts are built here; Lecture 13 adds only its own files.
 * - R2: the momentum operator in the position basis, p̂ = -iħ d/dx, is derived here (`l12-translations:b4`); Lecture 13 recaps it in one beat.
 * - R3: the precession chance cos²(ωt/2), which Lecture 11 states in its Go deeper 3, is taught here as lecture material (`l12-motion:b3`).
 * - R4: the translation operator is T(a), as Townsend writes it; time evolution stays U(t) as in Lecture 11. p̂ wears its hat.
 * - R7: the `wave-lab` widget is deferred. Units 3-6 borrow the nearest existing widget for their Try-it and say what it does and does not show.
 * - R8: the notes' slips are layout and notation only, so there is no Correction box. The notation slips are handled by the Rosettas: the notes' "∼"
 *   is written ≅ and the notes' θ(t) = ωt is the azimuth φ(t) (`l12-motion:b1`), and the notes' rotation generator L̂ is our S_z (`l12-law:b3`).
 * One track (448): sentences stay ≤ 25 words, symbols are defined before use, link-back beats name the unit they recall and define nothing new.
 *
 * Rules kept here (as in L1–L11.story.ts): stage states carry physics inputs only (the resolvers compute every angle, length, chance and sample); every
 * number in the prose comes from L12.values.ts and is backed by a keyed claim; clue beats are click-to-reveal and last in their unit (a Go-deeper beat
 * follows them); lengths are in ℓ, momenta in ħ/ℓ, times in mℓ²/ħ.
 */
import type { Beat, BlochState, ClocksState, Claim, ComplexPlaneState, Ref, Scrub, WavefunctionState } from './schema'
import { V, claim, close, d, tf } from './L12.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const sweep = (from: number, to: number): Scrub => ({ from, to })
const cp = (o: Omit<ComplexPlaneState, 'kind'>): ComplexPlaneState => ({ kind: 'complex-plane', shot: 'C-FLAT', ...o })
const bl = (state: BlochState['state'], o: Omit<BlochState, 'kind' | 'state'> = {}): BlochState => ({ kind: 'bloch', state, shot: 'B-STD', ...o })
/** The two phase clocks of Lecture 11: E₊ = 3ε, E₋ = ε, start |+x⟩, time as the angle εt/ħ in degrees. */
const K = (timeDeg: Scrub, o: Omit<ClocksState, 'kind' | 'levels' | 'timeDeg'> = {}): ClocksState => ({
  kind: 'clocks',
  levels: { upper: 3, lower: 1 },
  start: '+x',
  timeDeg,
  shot: 'K-STD',
  ...o,
})
/** A Gaussian packet: ⟨x⟩ = x0, Δx = σ, ⟨p⟩ = p0 (in ħ/ℓ). */
const PK = (x0: Scrub, sigma: Scrub, p0?: Scrub): WavefunctionState['source'] => ({ packet: { x0, sigma, ...(p0 === undefined ? {} : { p0 }) } })
const W = (source: WavefunctionState['source'], o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => ({ kind: 'wavefunction', source, shot: 'W-STD', ...o })
/** The three equal arrows (size 1/√3 each) of the equal superposition of three energies, at the given phases (degrees). */
const S3 = 1 / Math.sqrt(3)
const three = (phasesDeg: number[]) => ({ phasesDeg, sizes: [S3, S3, S3] })
/** The chain for the chance of finding the start state again: each arrow is weighted |c_n|² = 1/3, so each is 1/3 long. */
const third = (phasesDeg: number[]) => ({ phasesDeg, sizes: [1 / 3, 1 / 3, 1 / 3] })

const townsend = (where: string, adds: string): Ref => ({ source: 'townsend', where, adds })
const susskind = (where: string, adds: string): Ref => ({ source: 'susskind', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* l12-law — One law, three generators                                                             */
/* ---------------------------------------------------------------------------------------------- */

const law: Beat[] = [
  {
    id: 'l12-law:b1',
    phase: 'lecture',
    text: 'Unit 11.4 reached the equation $i\\hbar\\,d|\\psi\\rangle/dt = H|\\psi\\rangle$, where $H$ is the Hamiltonian and $t$ is time. Its full name is the [[schrodinger-equation|time-dependent Schrödinger equation]]. “Time-dependent” says that the state $|\\psi\\rangle$ changes with $t$.',
    caption: 'the two clocks of Lecture 11: the state’s two energy parts turn, so the state changes',
    stage: K(30, { show: ['clocks'] }),
  },
  {
    id: 'l12-law:b2',
    phase: 'lecture',
    text: 'A second idea is separate. The Hamiltonian $H$ might vary with time, or it might not. If $\\partial H/\\partial t = 0$, it is [[time-independent-hamiltonian|time independent]]. Only then does $|\\psi(t)\\rangle = e^{-iHt/\\hbar}|\\psi(0)\\rangle$ hold. The equation itself holds either way.',
    caption: 'a constant $H$: the two clocks keep their speeds all the way from $0^\\circ$ to $90^\\circ$',
    stage: K(sweep(0, 90)),
  },
  {
    id: 'l12-law:b3',
    phase: 'lecture',
    text: 'Unitarity gives a Hermitian generator, but not which observable it is. [[noether-theorem|Noether’s theorem]], roughly: each continuous symmetry pairs a generator with a conserved quantity. Shifts in space pair with [[momentum|momentum]], written $\\hat p$ here. Turns pair with angular momentum $\\hat L$. Shifts in time pair with energy $H$. The notes write $\\hat L$ where our spin lectures wrote $S_z$. Lecture 7’s $p_x$ is this $\\hat p$ in one dimension. Let $T(a)$ shift a state by $a$ and $R(\\varphi)$ turn it by $\\varphi$. The three unitaries share one shape: $T(a) = e^{-ia\\hat p/\\hbar}$, $R(\\varphi) = e^{-i\\varphi\\hat L/\\hbar}$ and $U(t) = e^{-itH/\\hbar}$.',
    caption: 'a shift of a curve along a line, and a turn of the Bloch arrow about $z$: two unitaries of one shape',
    stage: { layout: 'split', top: W(PK(0, 1), { shift: sweep(0, 3) }), bottom: bl('+x', { rotate: { axis: 'z', angleDeg: sweep(0, 90) }, trail: true }) },
  },
  {
    id: 'l12-law:b4',
    phase: 'lecture',
    text: 'Suppose $H(t)$ does depend on time. The equation still tells how the state changes from one instant to the next, yet the energy may now rise or fall with time. For a constant $H$, time-shift symmetry does give energy conservation (Unit 11.5).',
    caption: 'the two hands and their angles: for a constant $H$ the gap between them grows steadily',
    stage: K(sweep(0, 90), { readouts: ['phases'] }),
  },
  {
    id: 'l12-law:b5',
    phase: 'lecture',
    text: `The energies a measurement can return solve $H|E_n\\rangle = E_n|E_n\\rangle$. Historically this is the [[energy-eigenvalue-equation|time-independent Schrödinger equation]], but it is an ordinary eigenvalue problem (Unit 3.2). Take $H = \\mathrm{diag}(\\varepsilon, 2\\varepsilon, 4\\varepsilon)$ with eigenstates $|E_1\\rangle$, $|E_2\\rangle$, $|E_3\\rangle$. Make an equal [[superposition|superposition]] of them, with amplitudes $c_n = 1/\\sqrt3$. The average energy is $\\langle H\\rangle = ${tf(V.l12MeanH)}\\,\\varepsilon$.`,
    caption: 'the three equal amplitudes of the superposition at $t = 0$: all three arrows point the same way',
    stage: cp({ spokes: three([0, 0, 0]) }),
    claims: [claim('l12MeanH', '⟨H⟩ of the equal mix of ε, 2ε, 4ε is 7/3 ε', () => close(V.l12MeanH, 7 / 3))],
  },
  {
    id: 'l12-law:b6',
    phase: 'lecture',
    text: `If every state were an energy eigenstate, nothing would move. Superpositions move. Write $|\\psi(0)\\rangle = \\sum_n c_n|E_n\\rangle$. Then $|\\psi(t)\\rangle = \\sum_n c_n e^{-iE_nt/\\hbar}|E_n\\rangle$. For the equal mix at $\\varepsilon t/\\hbar = 90^\\circ$, each energy keeps its chance $${tf(V.l12EnergyChance90)}$. The chance of finding the start state again falls to $${tf(V.l12Survival90)}$.`,
    caption: `the three hands at $\\varepsilon t/\\hbar = 90^\\circ$ point at $-90^\\circ$, $-180^\\circ$ and $0^\\circ$; at $45^\\circ$ the chance of finding the start state is $${tf(V.l12Survival45)}$`,
    stage: cp({ chain: third([-90, -180, 0]) }),
    derivation: {
      result: '|\\psi(t)\\rangle = \\sum_n c_n e^{-iE_nt/\\hbar}|E_n\\rangle',
      ground: [
        {
          tex: '|\\psi(0)\\rangle = \\sum_n c_n|E_n\\rangle',
          why: 'Write the start state in the energy basis. The amplitude $c_n$ is the part along $|E_n\\rangle$.',
          view: cp({ spokes: three([0, 0, 0]) }),
          viewCaption: 'the three amplitudes at $t = 0$',
        },
        {
          tex: '|\\psi(t)\\rangle = \\sum_n c_n\\,U(t)|E_n\\rangle',
          why: 'The operator $U(t)$ is linear, so it acts on each term of the sum.',
        },
        {
          tex: 'U(t)|E_n\\rangle = e^{-iE_nt/\\hbar}|E_n\\rangle',
          why: 'An energy ket only gains a phase as time passes (Unit 11.5): each energy hand just turns.',
          view: cp({ spokes: three([-90, -180, 0]) }),
          viewCaption: 'the three hands after $\\varepsilon t/\\hbar = 90^\\circ$',
          claims: [
            claim('l12Hand90a', 'the first hand sits at −90°', () => close(V.l12Hand90a, 90, 1e-9)),
            claim('l12Hand90b', 'the second at −180°', () => close(V.l12Hand90b, 180, 1e-9)),
            claim('l12Hand90c', 'the third at 0°', () => close(V.l12Hand90c, 0, 1e-9)),
          ],
        },
        {
          tex: '|\\psi(t)\\rangle = \\sum_n c_n e^{-iE_nt/\\hbar}|E_n\\rangle',
          why: 'Put the phases back into the sum. The amplitude of finding the start state is the chain of the three weighted arrows.',
          view: cp({ chain: third([-90, -180, 0]) }),
          viewCaption: 'the chain of the three arrows ends close to the start',
        },
      ],
    },
    claims: [
      claim('l12EnergyChance90', 'each energy keeps the chance 1/3 at εt/ħ = 90°', () => close(V.l12EnergyChance90, 1 / 3)),
      claim('l12Survival90', 'the chance of finding the start state is 1/9 at 90°', () => close(V.l12Survival90, 1 / 9)),
      claim('l12Survival45', 'and 1/3 at 45°', () => close(V.l12Survival45, 1 / 3)),
    ],
  },
  {
    id: 'l12-law:b7',
    phase: 'books',
    text: 'Townsend §4.1 builds the same law step by step. He starts from the unitarity of $U$, writes $U(dt) = 1 - iH\\,dt/\\hbar$, and gets the equation. Chaining many steps gives $e^{-iHt/\\hbar}$. He shows that $\\langle H\\rangle$ stays constant and that $U(t)|E\\rangle = e^{-iEt/\\hbar}|E\\rangle$. He calls the law simply the Schrödinger equation.',
    caption: 'the three energy hands of the equal mix after $\\varepsilon t/\\hbar = 90^\\circ$, each one turned by its own energy',
    stage: cp({ spokes: three([-90, -180, 0]) }),
    refs: [townsend('§4.1, pp. 111–114', 'Unitarity, the tiny step $U(dt) = 1 - iH\\,dt/\\hbar$, the equation, $e^{-iHt/\\hbar}$ as a limit of steps, constant $\\langle H\\rangle$, and $U(t)|E\\rangle = e^{-iEt/\\hbar}|E\\rangle$.')],
  },
  {
    id: 'l12-law:b8',
    phase: 'clue',
    text: 'The law is called “time-dependent”. Does that mean $H$ depends on $t$?',
    stage: K(30),
    reveal: {
      text: `No. The state depends on $t$; $H$ need not. And if all three energies were equal, nothing observable would change. The chance of finding the start state would stay at ${d(V.l12SurvivalEqual, 0)}.`,
      caption: 'three equal energies: all three hands turn together to the same angle, so their gaps never change',
      stage: cp({ chain: third([-180, -180, -180]) }),
      claims: [
        claim('l12SurvivalEqual', 'with three equal energies the survival chance stays 1', () => close(V.l12SurvivalEqual, 1)),
        claim('l12EqualHand', 'the three equal hands all sit at −180°', () => close(V.l12EqualHand, 180, 1e-9)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l12-motion — Seeing the motion in a measurement                                                 */
/* ---------------------------------------------------------------------------------------------- */

const motion: Beat[] = [
  {
    id: 'l12-motion:b1',
    phase: 'lecture',
    text: 'Unit 11.6 solved the two-level case. Its Hamiltonian $H = \\bar E I + \\tfrac{\\hbar\\omega}{2}Z$ gives $U(t) \\cong R_z(\\omega t)$. Here $\\cong$ means “the same state up to an overall phase”; the notes write “∼”. So $|\\psi(t)\\rangle \\cong (|{+z}\\rangle + e^{i\\omega t}|{-z}\\rangle)/\\sqrt2$, the equator state at azimuth $\\varphi = \\omega t$. The notes call that azimuth $\\theta(t)$.',
    caption: 'the gap between the two hands is the azimuth $\\varphi = \\omega t$',
    stage: K(sweep(0, 90), { show: ['clocks', 'gap'] }),
  },
  {
    id: 'l12-motion:b2',
    phase: 'lecture',
    text: `Prepare $|{+x}\\rangle$ again and again, wait a time $t$, then measure along $x$. The amplitude for the result $+x$ is $\\langle{+x}|\\psi(t)\\rangle = \\tfrac12\\left(1 + e^{i\\omega t}\\right)$. That is two arrows of length $\\tfrac12$ laid tip to tail. At $\\omega t = 60^\\circ$ their sum has size ${d(V.l12AmpAbs60, 3)}.`,
    caption: 'two arrows of length ½ at $0^\\circ$ and $60^\\circ$, laid tip to tail: their sum is the amplitude',
    stage: cp({ chain: { phasesDeg: [0, 60], sizes: [0.5, 0.5] } }),
    claims: [claim('l12AmpAbs60', 'the amplitude for +x has size 0.866 at ωt = 60°', () => close(V.l12AmpAbs60, Math.cos(Math.PI / 6)))],
  },
  {
    id: 'l12-motion:b3',
    phase: 'lecture',
    text: `Square the amplitude. The chance of $+x$ is $P(+x;t) = \\cos^2(\\omega t/2)$, and the chance of $-x$ is $P(-x;t) = \\sin^2(\\omega t/2)$. At $\\omega t = 60^\\circ$ the chance of $+x$ is ${d(V.l12Px60, 2)} and the chance of $-x$ is ${d(V.l12PmX60, 2)}. At $\\omega t = 90^\\circ$ the chance of $+x$ is ${d(V.l12Px90, 1)}.`,
    caption: 'the chance of $+x$ as the hands turn: $\\cos^2$ of half the gap',
    stage: K(sweep(0, 90), { readouts: ['px'] }),
    derivation: {
      result: 'P(+x;t) = \\cos^2(\\omega t/2)',
      ground: [
        {
          tex: '\\langle{+x}|\\psi(t)\\rangle = \\tfrac12\\left(1 + e^{i\\omega t}\\right)',
          why: 'Two arrows of length $\\tfrac12$, the second turned by $\\omega t$ from the first, laid tip to tail.',
          view: cp({ chain: { phasesDeg: [0, 60], sizes: [0.5, 0.5] } }),
          viewCaption: 'the two arrows at $\\omega t = 60^\\circ$',
        },
        {
          tex: 'P(+x;t) = \\left|\\tfrac12\\left(1 + e^{i\\omega t}\\right)\\right|^2',
          why: 'The chance of an outcome is the squared size of its amplitude: the [[born-rule|Born rule]].',
        },
        {
          tex: '1 + e^{i\\omega t} = 2e^{i\\omega t/2}\\cos\\tfrac{\\omega t}{2}',
          why: 'Two unit arrows span a rhombus. Its diagonal points at half the angle and has length $2\\cos$ of that half angle.',
          view: cp({ chain: { phasesDeg: [0, 60], sizes: [1, 1] } }),
          viewCaption: 'two unit arrows: the diagonal points at $30^\\circ$',
        },
        {
          tex: 'P(+x;t) = \\cos^2(\\omega t/2)',
          why: 'The factor $e^{i\\omega t/2}$ has size 1, so only $\\cos^2$ is left.',
          view: K(30, { readouts: ['px'] }),
          viewCaption: 'the readout $P(+x)$ at $\\omega t = 60^\\circ$',
        },
      ],
    },
    claims: [
      claim('l12Px60', 'P(+x) at ωt = 60° is cos² 30° = 0.75', () => close(V.l12Px60, Math.cos(Math.PI / 6) ** 2)),
      claim('l12PmX60', 'P(−x) at ωt = 60° is sin² 30° = 0.25', () => close(V.l12PmX60, Math.sin(Math.PI / 6) ** 2)),
      claim('l12Px90', 'P(+x) at ωt = 90° is ½', () => close(V.l12Px90, 0.5)),
    ],
  },
  {
    id: 'l12-motion:b4',
    phase: 'lecture',
    text: `This is the notes’ first complete dynamical example. The energy splitting makes the relative phase grow. The growing phase turns the arrow about $z$. The turning arrow makes the chance of $+x$ oscillate. After one period $T = 2\\pi/\\omega$ the chance is back to ${d(V.l12PxPeriod, 0)}.`,
    caption: 'one full lap: $\\omega t$ runs from $0^\\circ$ to $360^\\circ$ and the chance of $+x$ comes back',
    stage: { layout: 'split', top: K(sweep(0, 180), { show: ['top'], readouts: ['px'] }), bottom: bl('+x', { rotate: { axis: 'z', angleDeg: sweep(0, 360) }, measure: 'x' }) },
    claims: [claim('l12PxPeriod', 'after one period the chance of +x is 1 again', () => close(V.l12PxPeriod, 1))],
  },
  {
    id: 'l12-motion:b5',
    phase: 'books',
    text: `Townsend §4.3 treats a spin in a magnetic field $B_0$ along $z$. Its Hamiltonian is $H = \\omega_0 S_z$, and the notes’ $\\omega$ is his $\\omega_0$, the frequency of the [[precession|precession]]. He finds the amplitude $\\cos(\\omega_0 t/2)$ for $+x$ and the average $\\langle S_x\\rangle = \\tfrac{\\hbar}{2}\\cos\\omega_0 t$. At $\\omega_0 t = 180^\\circ$ the chance of $+x$ is ${d(V.l12Px180, 0)}.`,
    caption: 'at $\\omega t = 180^\\circ$ the gap is half a turn and the chance of $+x$ is zero',
    stage: K(90, { readouts: ['px'] }),
    refs: [townsend('§4.3, pp. 115–117', 'A spin in a field $B_0$ along $z$ has $H = \\omega_0 S_z$ (his $\\omega_0$, the frequency of the precession, is the notes’ $\\omega$). He finds the amplitude $\\cos(\\omega_0 t/2)$ for $+x$ and $\\langle S_x\\rangle = \\tfrac{\\hbar}{2}\\cos\\omega_0 t$.')],
    claims: [claim('l12Px180', 'P(+x) at ωt = 180° is 0', () => close(V.l12Px180, 0, 1e-12))],
  },
  {
    id: 'l12-motion:b6',
    phase: 'clue',
    text: 'When does an $x$ magnet first read $-x$ with certainty?',
    stage: K(0, { readouts: ['px'] }),
    reveal: {
      text: `At half a period: $\\omega t = ${d(V.l12HalfOmegaT, 0)}^\\circ$, that is $\\varepsilon t/\\hbar = 90^\\circ$. The arrow then points at $-x$, so the chance of $-x$ is ${d(V.l12PminusXHalfPeriod, 0)}.`,
      caption: 'the hands half a turn apart: the arrow points at $-x$ and $P(+x)$ is zero',
      stage: K(90, { readouts: ['px'] }),
      claims: [
        claim('l12HalfOmegaT', 'half a period is ωt = 180°', () => close(V.l12HalfOmegaT, 180, 1e-9)),
        claim('l12PminusXHalfPeriod', 'the chance of −x is 1 there', () => close(V.l12PminusXHalfPeriod, 1)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l12-continuum — From a few basis states to a continuum                                          */
/* ---------------------------------------------------------------------------------------------- */

const continuum: Beat[] = [
  {
    id: 'l12-continuum:b1',
    phase: 'lecture',
    text: 'Until now every basis was finite: two states for one spin, eight for three. Lecture 1 set a particle’s position and mass aside. Now we bring them back, for a particle that can be anywhere on a line.',
    caption: 'a particle on a line: its state will be a curve along the line',
    stage: W(PK(0, 1)),
  },
  {
    id: 'l12-continuum:b2',
    phase: 'lecture',
    text: `A position measurement can return any real number $x$, so the basis is labelled by $x$. The [[position-eigenstate|position eigenstate]] $|x\\rangle$ obeys $\\hat x|x\\rangle = x|x\\rangle$, the same structure as $Z|{\\pm z}\\rangle = \\pm|{\\pm z}\\rangle$. Lengths are measured in a fixed length $\\ell$. A [[wave-packet|packet]] is a bell-shaped bump of amplitude along the line. In the window from $-8\\ell$ to $8\\ell$, chop the line into 4 equal cells. For a packet of width $\\sigma = 1\\ell$ centred at $x_0 = 0$, the cell from 0 to $4\\ell$ holds the chance ${d(V.l12CellP4, 3)}.`,
    caption: 'a packet of width $\\sigma = 1\\ell$ centred at $x_0 = 0$, chopped into 4 cells: each bar is one cell’s chance',
    stage: W(PK(0, 1), { cells: 4, readouts: ['cell'] }),
    claims: [claim('l12CellP4', 'the cell [0, 4ℓ) of the unit packet holds 0.500', () => close(V.l12CellP4, 0.5, 5e-4))],
  },
  {
    id: 'l12-continuum:b3',
    phase: 'lecture',
    text: `Completeness, $\\sum_n|n\\rangle\\langle n| = I$, becomes the [[continuous-completeness|continuous completeness relation]] $I = \\int dx\\,|x\\rangle\\langle x|$. For an [[orthonormal-basis|orthonormal basis]], $\\langle n|m\\rangle = \\delta_{nm}$, and this becomes $\\langle x|x'\\rangle = \\delta(x - x')$, with the [[dirac-delta|Dirac delta]]. With 8 cells the cell that starts at $0$ holds ${d(V.l12CellP8, 3)}. With 64 cells all the chances add to ${d(V.l12CellsSum64, 0)}.`,
    caption: 'the same packet in 8 cells: the bars add to 1, and finer cells give bars that follow the curve',
    stage: W(PK(0, 1), { cells: 8, readouts: ['cell'] }),
    derivation: {
      result: '\\int dx\\,|x\\rangle\\langle x| = I',
      ground: [
        {
          tex: 'I = \\sum_n |n\\rangle\\langle n|',
          why: 'The discrete completeness relation: the projectors onto a basis add up to the identity.',
          view: W(PK(0, 1), { cells: 4 }),
          viewCaption: '4 cells: a coarse basis',
        },
        {
          tex: '|c_n|^2 \\to |\\psi(x_n)|^2\\,\\Delta x',
          why: 'Refine the cells. A cell’s chance becomes the packet’s squared height $|\\psi(x_n)|^2$ at its centre $x_n$ times its width $\\Delta x$.',
          view: W(PK(0, 1), { cells: 64 }),
          viewCaption: '64 cells: the bars follow the curve',
          claims: [claim('l12CellsSum64', 'the 64 cell chances add to 1', () => close(V.l12CellsSum64, 1, 1e-9))],
        },
        {
          tex: '\\sum_n \\Delta x\\,|x_n\\rangle\\langle x_n| \\to \\int dx\\,|x\\rangle\\langle x|',
          why: 'As the cells shrink, the sum of the areas becomes the area under a curve: an integral.',
        },
        {
          tex: '\\int dx\\,|x\\rangle\\langle x| = I',
          why: 'The same identity, now over a continuum of positions.',
          view: W(PK(0, 1)),
          viewCaption: 'the limit: a smooth curve',
        },
      ],
    },
    claims: [claim('l12CellP8', 'the cell [0, 2ℓ) of 8 holds 0.477', () => close(V.l12CellP8, 0.477, 5e-4))],
  },
  {
    id: 'l12-continuum:b4',
    phase: 'lecture',
    text: `Do not dwell on $\\delta$. It is the continuous cousin of the Kronecker delta of Unit 4.1: zero unless $x = x'$, with area 1. Its job is twofold: two different positions are [[orthogonal|orthogonal]], and the sum over all positions still adds up to the identity. In 64 cells the cell that starts at $0$ holds ${d(V.l12CellP64, 4)}. Divided by its width, that is ${d(V.l12CellDensity64, 3)} per $\\ell$.`,
    caption: 'the cell of 64 that starts at 0: its chance divided by its width is the chance per $\\ell$ it approaches',
    stage: W(PK(0, 1), { cells: 64, readouts: ['cell'] }),
    claims: [
      claim('l12CellP64', 'the cell [0, ¼ℓ) of 64 holds 0.0987', () => close(V.l12CellP64, 0.0987, 5e-5)),
      claim('l12CellDensity64', 'its chance over its width is 0.395 per ℓ', () => close(V.l12CellDensity64, 0.395, 5e-4)),
    ],
  },
  {
    id: 'l12-continuum:b5',
    phase: 'books',
    text: `Townsend §6.1 explains why a sum cannot work: infinitely many points lie between any two positions. He builds the integral, the relation $I = \\int dx\\,|x\\rangle\\langle x|$ and $\\langle x|x'\\rangle = \\delta(x - x')$. Susskind §8.1.2 reads a function as a vector with one component per $x$: sums become integrals and the Kronecker delta becomes $\\delta$. In 512 cells the cell that starts at $0$ holds ${d(V.l12CellP512, 4)}, which is ${d(V.l12CellDensity512, 3)} per $\\ell$.`,
    caption: '512 cells: the bars fuse into the curve',
    stage: W(PK(0, 1), { cells: 512, readouts: ['cell'] }),
    refs: [
      townsend('§6.1, pp. 191–194', 'Why a sum over positions fails, the integral, $I = \\int dx\\,|x\\rangle\\langle x|$ and $\\langle x|x\'\\rangle = \\delta(x - x\')$.'),
      susskind('§8.1.2', 'A function as a vector: sums become integrals and the Kronecker delta becomes the Dirac delta.'),
    ],
    claims: [
      claim('l12CellP512', 'the cell [0, ℓ/32) of 512 holds 0.0125', () => close(V.l12CellP512, 0.0125, 5e-5)),
      claim('l12CellDensity512', 'its chance over its width is 0.399 per ℓ', () => close(V.l12CellDensity512, 0.399, 5e-4)),
    ],
  },
  {
    id: 'l12-continuum:b6',
    phase: 'clue',
    text: 'Can a measurement leave the particle at exactly one position $x$?',
    stage: W(PK(0, 1), { cells: 512 }),
    reveal: {
      text: `No. A real position measurement has a finite resolution (Townsend pp. 191–192: a microscope resolves only about a wavelength), so $|x\\rangle$ is an idealisation. The curve $|\\psi|^2$ still gives every interval’s chance. At $x = 0$ it is ${d(V.l12DensityAt0, 3)} per $\\ell$.`,
      caption: 'the chance per $\\ell$ of the unit packet at its centre',
      stage: W(PK(0, 1), { readouts: ['peak'] }),
      claims: [claim('l12DensityAt0', 'the unit packet’s density at 0 is 0.399 per ℓ', () => close(V.l12DensityAt0, 1 / Math.sqrt(2 * Math.PI), 1e-12))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l12-wavefunction — The wavefunction is the ket in the position basis                            */
/* ---------------------------------------------------------------------------------------------- */

const wavefunction: Beat[] = [
  {
    id: 'l12-wavefunction:b1',
    phase: 'lecture',
    text: 'Insert the identity $I = \\int dx\\,|x\\rangle\\langle x|$ into $|\\psi\\rangle = I|\\psi\\rangle$. You get $|\\psi\\rangle = \\int dx\\,\\psi(x)|x\\rangle$, where $\\psi(x) = \\langle x|\\psi\\rangle$ is the [[wavefunction|wavefunction]]. With time, $\\psi(x,t) = \\langle x|\\psi(t)\\rangle$. It is not a new object. It lists the components of the same ket, as a continuous column vector.',
    caption: 'the real part, the imaginary part and the density of one wavefunction: a complex number at every $x$',
    stage: W(PK(0, 1), { show: ['re', 'im', 'density'] }),
  },
  {
    id: 'l12-wavefunction:b2',
    phase: 'lecture',
    text: `A state has total chance $\\int|\\psi|^2dx = ${d(V.l12Norm, 0)}$. One exact point has zero chance. The quantity $|\\psi(x)|^2$ is a [[probability-density|probability density]]: the chance of finding the particle in a short stretch $dx$ is $|\\psi|^2dx$. For the packet centred at 0, the chance of finding it to the right of $x = 0$ is ${d(V.l12PRight, 2)}.`,
    caption: 'the density $|\\psi|^2$ of the unit packet: its area is 1',
    stage: W(PK(0, 1), { show: ['density'], readouts: ['norm', 'peak'] }),
    claims: [
      claim('l12Norm', 'the unit packet has total chance 1', () => close(V.l12Norm, 1, 1e-9)),
      claim('l12PRight', 'the chance to the right of 0 is 0.50', () => close(V.l12PRight, 0.5, 1e-6)),
    ],
  },
  {
    id: 'l12-wavefunction:b3',
    phase: 'lecture',
    text: `The chance of finding the particle between $a$ and $b$ is $\\int_a^b|\\psi|^2dx$. For the unit packet, the stretch $-1 < x < 1$ has chance ${d(V.l12P1sigma, 3)} and the stretch $-2 < x < 2$ has chance ${d(V.l12P2sigma, 3)}.`,
    caption: 'the shaded stretch from $-1$ to $1$ under the density: its area is the chance',
    stage: W(PK(0, 1), { show: ['density'], interval: [-1, 1], readouts: ['interval'] }),
    derivation: {
      result: 'P(a<x<b) = \\int_a^b|\\psi(x)|^2dx',
      ground: [
        {
          tex: '\\Pi = \\int_a^b dx\\,|x\\rangle\\langle x|',
          why: 'The projector onto positions between $a$ and $b$ keeps those position states and drops the rest (Unit 3.3).',
          view: W(PK(0, 1), { show: ['density'], interval: [-1, 1] }),
          viewCaption: 'the stretch that the projector keeps',
        },
        {
          tex: 'P = \\langle\\psi|\\Pi|\\psi\\rangle',
          why: 'The chance of landing in the kept part is the squared length of that part: the Born rule for a projector.',
        },
        {
          tex: 'P = \\int_a^b dx\\,\\langle\\psi|x\\rangle\\langle x|\\psi\\rangle',
          why: 'Put the projector’s integral between the bra and the ket. Only positions from $a$ to $b$ remain.',
        },
        {
          tex: 'P(a<x<b) = \\int_a^b|\\psi(x)|^2dx',
          why: 'The two brackets are $\\psi^*(x)$ and $\\psi(x)$, and they multiply to $|\\psi(x)|^2$.',
          view: W(PK(0, 1), { show: ['density'], cells: 8, interval: [-2, 2] }),
          viewCaption: 'the stretch from $-2$ to $2$ is two of the 8 cells’ worth of area',
        },
      ],
    },
    claims: [
      claim('l12P1sigma', 'P(−1 < x < 1) = 0.683 for the unit packet', () => close(V.l12P1sigma, 0.6826894921, 1e-6)),
      claim('l12P2sigma', 'P(−2 < x < 2) = 0.954', () => close(V.l12P2sigma, 0.9544997361, 1e-6)),
    ],
  },
  {
    id: 'l12-wavefunction:b4',
    phase: 'lecture',
    text: 'This is the [[born-rule|Born rule]] again (Unit 1.2). Before, the chance of the outcome $n$ was $P(n) = |\\langle n|\\psi\\rangle|^2$. Now the chance of finding the position between $x$ and $x + dx$ is $|\\langle x|\\psi\\rangle|^2dx$. The sum over outcomes became an integral over $x$, and nothing else changed.',
    caption: 'sixteen cells of the density: each bar is a chance of the form $|\\psi|^2$ times a width',
    stage: W(PK(0, 1), { cells: 16 }),
  },
  {
    id: 'l12-wavefunction:b5',
    phase: 'books',
    text: 'Townsend §6.1 puts the identity $I = \\int dx\\,|x\\rangle\\langle x|$ between two states to get $\\langle\\chi|\\psi\\rangle = \\int dx\\,\\chi^*(x)\\psi(x)$, and checks it on its first worked example. Susskind §8.1.1 reviews $\\psi(x)$ as the components of the state vector in the position basis.',
    caption: 'one wavefunction as a list of complex components, one for each $x$',
    stage: W(PK(0, 1), { show: ['re', 'im', 'density'] }),
    refs: [
      townsend('§6.1, pp. 194–195', 'Inserting the identity gives $\\langle\\chi|\\psi\\rangle = \\int dx\\,\\chi^*(x)\\psi(x)$ (his Example 6.1, p. 195).'),
      susskind('§8.1.1', 'The wavefunction as the components of the state in the position basis.'),
    ],
  },
  {
    id: 'l12-wavefunction:b6',
    phase: 'clue',
    text: `A packet four times narrower has density ${d(V.l12PeakQuarter, 2)} per $\\ell$ at its centre. That is above 1. Is something wrong?`,
    stage: W(PK(0, 0.25), { show: ['density'], readouts: ['peak'] }),
    reveal: {
      text: `No. A density is not a chance, and every interval’s chance is at most 1. The stretch one width either side of the centre holds ${d(V.l12QuarterP, 3)}, just as for the wider packet.`,
      caption: 'the narrow packet’s shaded stretch: a tall and thin area, still less than 1',
      stage: W(PK(0, 0.25), { show: ['density'], interval: [-0.25, 0.25], readouts: ['interval', 'peak'] }),
      claims: [claim('l12QuarterP', 'one width either side of the narrow packet’s centre holds 0.683', () => close(V.l12QuarterP, 0.6826894921, 1e-6))],
    },
    claims: [claim('l12PeakQuarter', 'the packet of width σ = ¼ℓ has peak density 1.60 per ℓ', () => close(V.l12PeakQuarter, 1 / (0.25 * Math.sqrt(2 * Math.PI)), 1e-12))],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l12-position-op — Position is multiplication by x                                               */
/* ---------------------------------------------------------------------------------------------- */

const positionOp: Beat[] = [
  {
    id: 'l12-position-op:b1',
    phase: 'lecture',
    text: `The bra $\\langle x|$ is an eigenbra of the [[position-operator|position operator]] $\\hat x$, with $\\langle x|\\hat x = x\\langle x|$. So $\\langle x|\\hat x|\\psi\\rangle = x\\,\\psi(x)$: in the position representation, $\\hat x$ acts as multiplication by $x$. For a packet centred at $x_0 = 2$, the value of $\\hat x\\psi$ at $x = 2$ is ${d(V.l12XPsiAt2, 3)}, which is twice the value of $\\psi$ there.`,
    caption: 'the packet $\\psi$ and the dashed $\\hat x\\psi$: the same curve, multiplied by $x$ at each point',
    stage: W(PK(2, 1), { overlay: ['xpsi'] }),
    derivation: {
      result: '\\langle x|\\hat x|\\psi\\rangle = x\\,\\psi(x)',
      ground: [
        {
          tex: '\\langle x|\\hat x = x\\langle x|',
          why: 'The ket $|x\\rangle$ is an eigenket of $\\hat x$ with eigenvalue $x$. Taking the bra keeps the same eigenvalue.',
          view: W(PK(2, 1), { show: ['re'] }),
          viewCaption: 'the real part of $\\psi$',
        },
        {
          tex: '\\langle x|\\hat x|\\psi\\rangle = x\\langle x|\\psi\\rangle',
          why: 'Put the ket $|\\psi\\rangle$ on the right. The number $x$ moves out in front.',
        },
        {
          tex: '\\langle x|\\hat x|\\psi\\rangle = x\\,\\psi(x)',
          why: 'The bracket $\\langle x|\\psi\\rangle$ is the wavefunction $\\psi(x)$.',
          view: W(PK(2, 1), { overlay: ['xpsi'] }),
          viewCaption: '$\\psi$ and the dashed $x\\psi(x)$',
        },
      ],
    },
    claims: [claim('l12XPsiAt2', '(x̂ψ)(2) = 2 ψ(2) = 1.263 for the packet at 2', () => close(V.l12XPsiAt2, 2 * Math.pow(2 * Math.PI, -0.25), 1e-12))],
  },
  {
    id: 'l12-position-op:b2',
    phase: 'lecture',
    text: `The average is $\\langle\\hat x\\rangle = \\langle\\psi|\\hat x|\\psi\\rangle = \\int dx\\,x\\,|\\psi|^2$: the mean of the probability density. For the packet centred at $x_0 = 2$ with $\\sigma = 1\\ell$, we get $\\langle\\hat x\\rangle = ${d(V.l12MeanX, 0)}\\,\\ell$ and a spread $\\Delta x = ${d(V.l12SdX, 0)}\\,\\ell$.`,
    caption: 'the density of the packet at 2: its mean and its spread are read from the readouts',
    stage: W(PK(2, 1), { show: ['density'], readouts: ['xmean', 'xspread'] }),
    claims: [
      claim('l12MeanX', '⟨x̂⟩ = 2 for the packet at 2', () => close(V.l12MeanX, 2, 1e-9)),
      claim('l12SdX', 'Δx = 1', () => close(V.l12SdX, 1, 1e-9)),
    ],
  },
  {
    id: 'l12-position-op:b3',
    phase: 'lecture',
    text: `Nothing about observables has changed. The operator is still Hermitian, and the values a measurement can return are still its eigenvalues (Unit 3.2). Only the basis changed. For this packet $\\langle\\hat x^2\\rangle = ${d(V.l12MeanX2, 0)}$, which is $x_0^2 + \\sigma^2$.`,
    caption: 'the same packet: the average of $x^2$ is $x_0^2 + \\sigma^2$',
    stage: W(PK(2, 1), { show: ['density'] }),
    claims: [claim('l12MeanX2', '⟨x̂²⟩ = 5 = x₀² + σ²', () => close(V.l12MeanX2, 5, 1e-9))],
  },
  {
    id: 'l12-position-op:b4',
    phase: 'books',
    text: 'Townsend §6.1 writes the average as $\\langle x\\rangle = \\int dx\\,\\psi^*(x)\\,x\\,\\psi(x)$. Susskind §8.2 shows that the eigenvectors of $X$ are delta functions. His §8.1.4 shows that $X$ is Hermitian.',
    caption: 'the dashed curve is $x\\psi(x)$, the packet times $x$',
    stage: W(PK(2, 1), { overlay: ['xpsi'] }),
    refs: [
      townsend('§6.1, p. 195', 'The average of position, $\\langle x\\rangle = \\int dx\\,\\psi^*(x)\\,x\\,\\psi(x)$ (his Eqs. 6.13–6.14).'),
      susskind('§8.2, §8.1.4', 'The eigenvectors of $X$ are delta functions, and $X$ is Hermitian.'),
    ],
  },
  {
    id: 'l12-position-op:b5',
    phase: 'clue',
    text: 'Is “multiply by $x$” a Hermitian operation?',
    stage: W(PK(-1, 1), { overlay: ['xpsi'] }),
    reveal: {
      text: `Yes. The number $x$ is real, so $\\int\\chi^*\\,(x\\psi)\\,dx = \\int (x\\chi)^*\\,\\psi\\,dx$. For two different packets the difference comes out as ${d(V.l12XHermResidual, 0)}, a rounding error.`,
      caption: 'a second packet, narrower and centred elsewhere: the identity holds for any pair',
      stage: W(PK(1.5, 0.7), { overlay: ['xpsi'] }),
      claims: [claim('l12XHermResidual', '∫φ*(xψ)dx − ∫(xφ)*ψ dx is zero for two packets', () => V.l12XHermResidual < 1e-12)],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l12-translations — Momentum is the generator of shifts                                          */
/* ---------------------------------------------------------------------------------------------- */

const translations: Beat[] = [
  {
    id: 'l12-translations:b1',
    phase: 'lecture',
    text: `Let $T(a)$ move a state to the right by $a$: $T(a)|x\\rangle = |x + a\\rangle$. This is the [[translation-operator|translation operator]]. It is unitary (Unit 11.2), so its tiny step is $I - \\tfrac{i}{\\hbar}G\\,da$ with $G$ Hermitian (Unit 11.3, Unit 6.4). Physics says $G$ is the [[momentum-operator|momentum operator]] $\\hat p$, so $T(a) = e^{-ia\\hat p/\\hbar}$. A shift by $a = 3$ keeps the total chance $\\int|\\psi|^2dx$ at ${d(V.l12ShiftNorm, 0)}.`,
    caption: 'the unit packet slides right by 3: the picture moves and its area stays 1',
    stage: W(PK(0, 1), { shift: sweep(0, 3) }),
    claims: [claim('l12ShiftNorm', 'T(3) keeps the total chance at 1', () => close(V.l12ShiftNorm, 1, 1e-9))],
  },
  {
    id: 'l12-translations:b2',
    phase: 'lecture',
    text: 'Three generators now stand side by side. A turn $\\varphi$ is generated by $S_z$, a wait $t$ by $H$, and a shift $a$ by $\\hat p$. The three unitaries are $R_z(\\varphi) = e^{-i\\varphi S_z/\\hbar}$, $U(t) = e^{-itH/\\hbar}$ and $T(a) = e^{-ia\\hat p/\\hbar}$.',
    caption: 'a turn of the Bloch arrow and a shift of the packet: each is a unitary built from its own generator',
    stage: { layout: 'split', top: bl('+x', { rotate: { axis: 'z', angleDeg: sweep(0, 90) } }), bottom: W(PK(0, 1), { shift: sweep(0, 3) }) },
  },
  {
    id: 'l12-translations:b3',
    phase: 'lecture',
    text: `The shifted state has the wavefunction $\\psi_a(x) = \\langle x|T(a)|\\psi\\rangle = \\psi(x - a)$. The amplitude that was at $x - a$ is now at $x$. The notes stress this sign: shifting right moves the graph right. For the unit packet shifted by 3, $\\langle x\\rangle = ${d(V.l12ShiftMean, 0)}$ and the peak density is ${d(V.l12ShiftPeak, 3)} per $\\ell$. The engine’s $T(3)\\psi$ differs from $\\psi(x - 3)$ by ${d(V.l12ShiftErr, 0)}, a rounding error.`,
    caption: 'the dashed original and the shifted curve: the whole graph moved right by 3',
    stage: W(PK(0, 1), { shift: sweep(0, 3), overlay: ['original'], readouts: ['xmean'] }),
    claims: [
      claim('l12ShiftMean', 'the shifted packet has ⟨x⟩ = 3', () => close(V.l12ShiftMean, 3, 1e-9)),
      claim('l12ShiftPeak', 'its peak density is still 0.399 per ℓ', () => close(V.l12ShiftPeak, 1 / Math.sqrt(2 * Math.PI), 1e-9)),
      claim('l12ShiftErr', 'T(3)ψ equals ψ(x − 3) to rounding', () => V.l12ShiftErr < 1e-11),
    ],
  },
  {
    id: 'l12-translations:b4',
    phase: 'lecture',
    text: `Take a tiny shift $a = da$. Route 1 expands the wavefunction: $\\psi(x - da) \\simeq \\psi(x) - da\\,\\psi'(x)$, where $\\psi'$ is the slope. Route 2 expands the operator: $\\psi_{da}(x) = \\psi(x) - \\tfrac{i}{\\hbar}da\\,\\langle x|\\hat p|\\psi\\rangle$. Compare the $da$ terms to get $\\langle x|\\hat p|\\psi\\rangle = -i\\hbar\\,\\psi'(x)$. For the unit packet the first-order step is off by about ${d(V.l12FirstOrderCoef, 3)} $da^2$. At $x = 1$ the imaginary part of $\\hat p\\psi$ is ${d(V.l12PPsiIm1, 3)}.`,
    caption: 'the shifted packet against the dashed original: the change from one to the other is $-da$ times the slope',
    stage: W(PK(0, 1), { shift: 0.01, overlay: ['original'] }),
    derivation: {
      result: '\\langle x|\\hat p|\\psi\\rangle = -i\\hbar\\,\\psi\'(x)',
      ground: [
        {
          tex: '\\psi_{da}(x) = \\psi(x - da)',
          why: 'A shift right by $da$ moves the amplitude that was at $x - da$ to $x$.',
          view: W(PK(0, 1), { shift: 0.01, overlay: ['original'] }),
          viewCaption: 'a tiny shift of $0.01$',
        },
        {
          tex: '\\psi(x - da) \\simeq \\psi(x) - da\\,\\psi\'(x)',
          why: 'Expand to first order in $da$: the change is minus the slope times the step.',
          claims: [claim('l12FirstOrderCoef', 'the first-order step is off by about 0.158 da² for the unit packet', () => close(V.l12FirstOrderCoef, 0.5 * 0.5 * Math.pow(2 * Math.PI, -0.25), 1e-12))],
        },
        {
          tex: '\\psi_{da}(x) = \\psi(x) - \\tfrac{i}{\\hbar}da\\,\\langle x|\\hat p|\\psi\\rangle',
          why: 'The same shifted wavefunction, from the operator: $T(da) = I - \\tfrac{i}{\\hbar}\\hat p\\,da$ acting on $|\\psi\\rangle$.',
        },
        {
          tex: '-\\tfrac{i}{\\hbar}\\langle x|\\hat p|\\psi\\rangle = -\\psi\'(x)',
          why: 'Both routes describe the same state, so the coefficients of $da$ must agree.',
          view: W(PK(0, 1), { overlay: ['ppsi'] }),
          viewCaption: 'the dashed curve is $\\hat p\\psi$: its imaginary part follows minus the slope',
          claims: [claim('l12PPsiIm1', '(p̂ψ)(1) has imaginary part 0.246 for the unit packet', () => close(V.l12PPsiIm1, 0.5 * Math.pow(2 * Math.PI, -0.25) * Math.exp(-1 / 4), 1e-9))],
        },
        {
          tex: '\\langle x|\\hat p|\\psi\\rangle = -i\\hbar\\,\\psi\'(x)',
          why: 'Multiply both sides by $i\\hbar$.',
        },
      ],
    },
  },
  {
    id: 'l12-translations:b5',
    phase: 'lecture',
    text: `The endpoint. In the position representation, $\\hat x$ is multiplication by $x$ and $\\hat p = -i\\hbar\\,d/dx$. The next lecture puts them into the Hamiltonian $H = \\hat p^2/2m + V(\\hat x)$, where $m$ is the mass and $V$ the potential. A real wavefunction gives an imaginary $\\hat p\\psi$: for the unit packet the real part of $\\hat p\\psi$ at $x = 1$ is ${d(V.l12PPsiRe1, 0)}.`,
    caption: 'the packet is real, so the dashed $\\hat p\\psi$ is purely imaginary',
    stage: W(PK(0, 1), { overlay: ['ppsi'], show: ['re', 'im'] }),
    claims: [claim('l12PPsiRe1', 'Re(p̂ψ)(1) = 0 for a real ψ', () => close(V.l12PPsiRe1, 0, 1e-12))],
  },
  {
    id: 'l12-translations:b6',
    phase: 'books',
    text: 'Townsend §6.2 shows that translation is unitary and compares an active shift with a passive one. His §6.3 proves that the generator is Hermitian and finds $[\\hat x, G] = i\\hbar$. His §6.4 follows the same Taylor route. Susskind §8.2.2 reaches $P = -i\\hbar\\,d/dx$ a second way, from Hermiticity and units.',
    caption: 'the shift once more: the dashed curve is where the packet started',
    stage: W(PK(0, 1), { shift: sweep(0, 3), overlay: ['original'] }),
    refs: [
      townsend('§6.2–6.4, pp. 195–202', 'Translation is unitary (active against passive, footnote p. 197), its generator is Hermitian with $[\\hat x, G] = i\\hbar$, and the same Taylor route.'),
      susskind('§8.2.2', 'A second route to $P = -i\\hbar\\,d/dx$, fixed by Hermiticity and units.'),
    ],
  },
  {
    id: 'l12-translations:b7',
    phase: 'clue',
    text: 'Why is a rightward shift $\\psi(x - a)$ and not $\\psi(x + a)$?',
    stage: W(PK(1, 1), { overlay: ['original'] }),
    reveal: {
      text: `A peak of $\\psi$ at $b$ moves to the point where $x - a = b$, that is $x = a + b$ (Townsend p. 196). A packet with its peak at $b = 1$, shifted by $a = 2$, peaks at $x = ${d(V.l12PeakPos, 0)}$.`,
      caption: 'the dashed original peaks at 1; after a shift of 2 the peak is at 3',
      stage: W(PK(1, 1), { shift: 2, overlay: ['original'], readouts: ['xmean'] }),
      claims: [claim('l12PeakPos', 'a packet peaking at 1 and shifted by 2 peaks at 3 (b + a)', () => close(V.l12PeakPos, 3, 1e-9))],
    },
  },
  {
    id: 'l12-translations:b8',
    phase: 'deeper',
    text: `Beyond the notes: build a finite shift from tiny ones, as Unit 11.3 built a wait. The product $\\left(I - \\tfrac{i}{\\hbar}\\hat p\\,\\tfrac{a}{N}\\right)^N$ tends to $T(a)$. Take $a = 2$ and the unit packet. For $N = 1, 4, 16, 64, 256$ the squared length is ${d(V.l12StepNorm1, 3)}, ${d(V.l12StepNorm4, 3)}, ${d(V.l12StepNorm16, 3)}, ${d(V.l12StepNorm64, 3)} and ${d(V.l12StepNorm256, 3)}. The distance to the exact shift is ${d(V.l12StepGap1, 3)}, ${d(V.l12StepGap4, 3)}, ${d(V.l12StepGap16, 3)}, ${d(V.l12StepGap64, 4)} and ${d(V.l12StepGap256, 4)}. The product is never unitary, and the gap shrinks like $1/N$. <<sl-f4-unitary|Go further in 709: maps that keep every length>>`,
    caption: 'the exact shift by 2 against the dashed original; the many-step products close in on it as $N$ grows',
    stage: W(PK(0, 1), { shift: 2, overlay: ['original'] }),
    claims: [
      claim('l12StepNorm1', 'N = 1: squared length 2.000', () => close(V.l12StepNorm1, 2, 5e-4)),
      claim('l12StepNorm4', 'N = 4: 1.337', () => close(V.l12StepNorm4, 1.337, 5e-4)),
      claim('l12StepNorm16', 'N = 16: 1.069', () => close(V.l12StepNorm16, 1.069, 5e-4)),
      claim('l12StepNorm64', 'N = 64: 1.016', () => close(V.l12StepNorm64, 1.016, 5e-4)),
      claim('l12StepNorm256', 'N = 256: 1.004', () => close(V.l12StepNorm256, 1.004, 5e-4)),
      claim('l12StepGap1', 'N = 1: distance 0.758', () => close(V.l12StepGap1, 0.758, 5e-4)),
      claim('l12StepGap4', 'N = 4: 0.267', () => close(V.l12StepGap4, 0.267, 5e-4)),
      claim('l12StepGap16', 'N = 16: 0.058', () => close(V.l12StepGap16, 0.058, 5e-4)),
      claim('l12StepGap64', 'N = 64: 0.0138', () => close(V.l12StepGap64, 0.0138, 5e-5)),
      claim('l12StepGap256', 'N = 256: 0.0034', () => close(V.l12StepGap256, 0.0034, 5e-5)),
    ],
  },
]

export const L12_STORY: Record<string, Beat[]> = {
  'l12-law': law,
  'l12-motion': motion,
  'l12-continuum': continuum,
  'l12-wavefunction': wavefunction,
  'l12-position-op': positionOp,
  'l12-translations': translations,
}

/** Every claim of a unit's beats, reveals and derivation steps (each unit's `claims`: the number reader backs a unit's prose with it). */
const claimsOf = (beats: Beat[]): Claim[] => beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground ?? []).flatMap((s) => s.claims ?? [])])
export const L12_UNIT_CLAIMS: Record<string, Claim[]> = Object.fromEntries(Object.entries(L12_STORY).map(([id, beats]) => [id, claimsOf(beats)]))
