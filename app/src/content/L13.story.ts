/**
 * Lecture 13 scroll story (owner: P). Beats per docs/roles/proposals/P-L13-story.md §1, with the judge's rulings
 * (docs/roles/decisions/448-L12L13.md, R1-R8):
 * - R1: Lecture 12 owns the shared pieces (the `wavefunction` kind, physics/wave.ts, physics/constants.ts); this chapter adds only its own files and the
 *   engine functions it needs (the momentum picture, widths, wavelengths, the ring shift, the trace of a commutator).
 * - R2: p̂ = -iħ d/dx is derived in Unit 12.6; Unit 13.2 recaps it in one beat (`l13-generator:b1`) and adds the notes' justification.
 * - R4: the translation operator is T(a), time evolution is U(t); the notes' T̂ for the hypothetical time operator is written t̂ (the notation beat `l13-time:b2`).
 *   The momentum amplitude is ψ̃(p), "psi tilde", where the notes write ϕ(p) (`l13-momentum-space:b1`); Townsend's packet parameter a is √2 σ (`l13-momentum-space:b5`).
 * - R5: the notes' optional §13.10 is a Go-deeper beat (phase 'deeper'), the last beat of Unit 13.6, not a unit.
 * - R7: the `wave-lab` widget is deferred. Every Try-it uses an existing widget and says what it does and does not show.
 * - R8: the notes' slips are layout and notation only, so there is no Correction box.
 * One track (448): sentences stay ≤ 25 words, symbols are defined before use, link-back beats name the unit they recall and define nothing new.
 *
 * Rules kept here (as in L1–L12.story.ts): stage states carry physics inputs only (the resolvers compute every angle, length, chance and sample); every
 * number in the prose comes from L13.values.ts and is backed by a keyed claim; clue beats are click-to-reveal and last in their unit (a Go-deeper beat
 * follows them); lengths are in ℓ, momenta in ħ/ℓ, times in mℓ²/ħ. A fraction such as one half is never typed in a formula, because the number reader
 * would ask for a claim: kinetic energy is written \tfrac{p^2}{2m}.
 */
import type { Beat, Claim, ClocksState, ComplexPlaneState, MatrixGridState, MatrixSource, Ref, Scrub, WavefunctionState } from './schema'
import { V, claim, close, d } from './L13.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const sweep = (from: number, to: number): Scrub => ({ from, to })
const cp = (o: Omit<ComplexPlaneState, 'kind'>): ComplexPlaneState => ({ kind: 'complex-plane', shot: 'C-FLAT', ...o })
const mx = (source: MatrixSource, o: Omit<MatrixGridState, 'kind' | 'source'> = {}): MatrixGridState => ({ kind: 'matrix', source, labels: 'none', values: 'exact', shot: 'M-GRID', ...o })
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
/** A plane wave e^{ipx} and the sum of two. */
const PL = (p: number): WavefunctionState['source'] => ({ plane: { p } })
const TW = (p1: number, p2: number): WavefunctionState['source'] => ({ twoWaves: { p1, p2 } })
const W = (source: WavefunctionState['source'], o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => ({ kind: 'wavefunction', source, shot: 'W-STD', ...o })

const townsend = (where: string, adds: string): Ref => ({ source: 'townsend', where, adds })
const susskind = (where: string, adds: string): Ref => ({ source: 'susskind', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* l13-delta — A position eigenstate is a spike                                                    */
/* ---------------------------------------------------------------------------------------------- */

const delta: Beat[] = [
  {
    id: 'l13-delta:b1',
    phase: 'lecture',
    text: 'Unit 12.4 wrote the state of a particle on a line as the wavefunction $\\psi(x,t) = \\langle x|\\psi(t)\\rangle$, and Unit 12.5 made $\\hat x$ multiply by $x$. The notes’ shorthand $(\\hat x\\psi)(x,t) = \\langle x|\\hat x|\\psi(t)\\rangle$ means that $\\hat x$ acts on the whole function. It gives a new function of $x$, not one number for the whole state.',
    caption: 'the packet $\\psi$ and, drawn dashed beside it, the new function $\\hat x\\psi$',
    stage: W(PK(0, 1), { overlay: ['xpsi'] }),
  },
  {
    id: 'l13-delta:b2',
    phase: 'lecture',
    text: 'What does a state of one exact position $x_0$ look like in the position basis? It must obey $\\hat x|x_0\\rangle = x_0|x_0\\rangle$. Project this on $\\langle x|$ and write $\\psi_{x_0}(x) = \\langle x|x_0\\rangle$. Then $(x - x_0)\\,\\psi_{x_0}(x) = 0$, so the amplitude vanishes at every $x \\neq x_0$. Only a spike at $x_0$ is left: $\\langle x|x_0\\rangle = \\delta(x - x_0)$, the [[dirac-delta|Dirac delta]].',
    caption: 'a packet narrowing toward the spike: the amplitude is squeezed into one place',
    stage: W(PK(0, sweep(1, 0.125)), { show: ['density'] }),
    derivation: {
      result: '\\langle x|x_0\\rangle = \\delta(x - x_0)',
      ground: [
        {
          tex: '\\hat x|x_0\\rangle = x_0|x_0\\rangle',
          why: 'A state of one exact position is an eigenstate of $\\hat x$ with the eigenvalue $x_0$.',
          view: W(PK(0, 1), { show: ['density'] }),
          viewCaption: 'a packet of width 1: far from a spike',
        },
        {
          tex: 'x\\,\\psi_{x_0}(x) = x_0\\,\\psi_{x_0}(x)',
          why: 'Project on $\\langle x|$. On the left $\\hat x$ multiplies by $x$ (Unit 12.5); on the right sits a number times the amplitude.',
        },
        {
          tex: '(x - x_0)\\,\\psi_{x_0}(x) = 0',
          why: 'Move everything to one side. A product is zero only if one of its factors is zero.',
          view: W(PK(0, 0.125), { show: ['density'] }),
          viewCaption: 'a packet eight times narrower: much closer to a spike',
        },
        {
          tex: '\\langle x|x_0\\rangle = \\delta(x - x_0)',
          why: 'The factor $x - x_0$ is zero only at $x_0$, so the amplitude can be nonzero there alone: a spike.',
        },
      ],
    },
  },
  {
    id: 'l13-delta:b3',
    phase: 'lecture',
    text: `A column with one nonzero entry is an eigenvector. The position eigenstate is its continuous cousin: no amplitude anywhere but at $x_0$. A real state is a very narrow packet near $x_0$. Narrow the packet with width $\\sigma = 1\\ell$, then half and one eighth of that. The peak density rises to ${d(V.l13Peak1, 3)}, ${d(V.l13Peak05, 3)} and ${d(V.l13Peak0125, 2)} per $\\ell$. The chance of finding the particle within a quarter of $\\ell$ of the centre rises from ${d(V.l13NarrowP1, 3)} to ${d(V.l13NarrowP05, 3)} and ${d(V.l13NarrowP0125, 3)}.`,
    caption: 'the density grows taller and thinner as the packet narrows, and the shaded stretch fills up',
    stage: W(PK(0, sweep(1, 0.125)), { show: ['density'], interval: [-0.25, 0.25], readouts: ['interval', 'peak'] }),
    claims: [
      claim('l13Peak1', 'the peak density of the σ = 1 packet is 0.399 per ℓ', () => close(V.l13Peak1, 1 / Math.sqrt(2 * Math.PI), 1e-12)),
      claim('l13Peak05', 'and of the σ = ½ packet 0.798', () => close(V.l13Peak05, 1 / (0.5 * Math.sqrt(2 * Math.PI)), 1e-12)),
      claim('l13Peak0125', 'and of the σ = ⅛ packet 3.19', () => close(V.l13Peak0125, 1 / (0.125 * Math.sqrt(2 * Math.PI)), 1e-12)),
      claim('l13NarrowP1', 'within ¼ℓ of the centre the chance is 0.197 for σ = 1', () => close(V.l13NarrowP1, 0.1974126513, 1e-6)),
      claim('l13NarrowP05', 'and 0.383 for σ = ½', () => close(V.l13NarrowP05, 0.3829249213, 1e-6)),
      claim('l13NarrowP0125', 'and 0.954 for σ = ⅛', () => close(V.l13NarrowP0125, 0.9544997361, 1e-6)),
    ],
  },
  {
    id: 'l13-delta:b4',
    phase: 'lecture',
    text: `Unlike an ordinary function, the delta has meaning only inside an integral: $\\int\\delta(x - x_0)\\,f(x)\\,dx = f(x_0)$. So $|x_0\\rangle$ is a [[generalized-eigenstate|generalised eigenstate]], one that cannot be [[normalized|normalised]]. Never square a delta. The narrow packets show why: their peak density grows without limit, yet each packet stays normalised, with total chance ${d(V.l13NarrowNorm0125, 3)}.`,
    caption: 'the narrowest packet: a very tall peak, and still a total chance of one',
    stage: W(PK(0, 0.125), { show: ['density'], readouts: ['norm', 'peak'] }),
    claims: [claim('l13NarrowNorm0125', 'the narrowest packet has total chance 1', () => close(V.l13NarrowNorm0125, 1, 1e-9))],
  },
  {
    id: 'l13-delta:b5',
    phase: 'books',
    text: 'Townsend §6.1 uses $\\delta(x - x\')$ only inside integrals, and his Eq. 6.64 on p. 205 writes it as the limit of ever narrower Gaussians, as in the beats above. Susskind §8.2.1 shows that the eigenvectors of the position operator $X$ are delta functions.',
    caption: 'a Gaussian eight times narrower than the unit packet: the delta is the limit',
    stage: W(PK(0, 0.125), { show: ['density'] }),
    refs: [
      townsend('§6.1, pp. 193–194; p. 205', '$\\delta(x - x\')$ appears only inside integrals (Eqs. 6.5–6.8), and is the limit of ever narrower Gaussians (Eq. 6.64).'),
      susskind('§8.2.1', 'The eigenvectors of the position operator $X$ are delta functions.'),
    ],
  },
  {
    id: 'l13-delta:b6',
    phase: 'clue',
    text: 'Can a real particle be in the state $|x_0\\rangle$?',
    stage: W(PK(0, 0.125), { show: ['density'] }),
    reveal: {
      text: `No. A sharper position needs a wider spread of momentum. Write $\\Delta p$ for the typical size of that scatter of momentum. The narrowest packet here has $\\Delta p = ${d(V.l13Dp0125, 1)}\\,\\hbar/\\ell$ (Unit 13.4).`,
      caption: 'the narrow packet in position and in momentum: a tall spike above a very wide curve',
      stage: W(PK(0, 0.125), { panels: ['position', 'momentum'], show: ['density'], readouts: ['pspread'] }),
      claims: [claim('l13Dp0125', 'the σ = ⅛ packet has Δp = 4 ħ/ℓ', () => close(V.l13Dp0125, 4, 1e-6))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l13-generator — Why the shift's generator is momentum                                           */
/* ---------------------------------------------------------------------------------------------- */

const generator: Beat[] = [
  {
    id: 'l13-generator:b1',
    phase: 'lecture',
    text: 'Unit 12.6 showed that the shift $T(a)$ moves a wavefunction right: $\\langle x|T(a)|\\psi\\rangle = \\psi(x - a)$. For a tiny shift this is $\\psi - a\\psi\'$, and $T(a) = e^{-ia\\hat p/\\hbar} \\simeq I - ia\\hat p/\\hbar$. Matching the terms linear in $a$ gave $(\\hat p\\psi)(x) = -i\\hbar\\,\\psi\'(x)$. This beat only recalls that result.',
    caption: 'the shifted packet, the original dashed, and $\\hat p\\psi$ drawn beside them',
    stage: W(PK(0, 1), { shift: 0.5, overlay: ['original', 'ppsi'] }),
  },
  {
    id: 'l13-generator:b2',
    phase: 'lecture',
    text: `Unitarity gives a Hermitian generator of shifts, but not its name. Calling it momentum rests on experiment. A wave $e^{ikx}$ turns its phase by $k$ per unit length, where $k$ is the [[wave-number|wave number]]. Such a wave is found to carry the [[de-broglie-relation|de Broglie]] momentum $\\hbar k$. The sign comes from $T$ being a rightward shift. So a packet that carries the factor $e^{3ix}$ should have the average momentum $\\langle p\\rangle = ${d(V.l13MeanP3, 1)}\\,\\hbar/\\ell$.`,
    caption: 'a packet with the factor $e^{3ix}$: its real and imaginary parts oscillate, and its mean momentum is read off',
    stage: W(PK(0, 1, 3), { show: ['re', 'im', 'density'], readouts: ['pmean'] }),
    claims: [claim('l13MeanP3', 'a packet carrying e^{3ix} has ⟨p⟩ = 3 ħ/ℓ', () => close(V.l13MeanP3, 3, 1e-9))],
  },
  {
    id: 'l13-generator:b3',
    phase: 'lecture',
    text: `Two quick checks on $\\hat p = -i\\hbar\\,d/dx$. The operator $\\hbar\\,d/dx$ has the units of momentum, because $\\hbar$ has the units of momentum times length. And the factor $i$ makes $\\hat p$ Hermitian: integrating by parts moves the derivative onto the other function, and the conjugate absorbs the sign flip. For the packet with $p_0 = 3$ centred at 0, $\\hat p\\psi$ at the centre is ${d(V.l13PPsiCentre, 3)}, which is $3\\psi(0)$.`,
    caption: '$\\hat p\\psi$ drawn dashed over a packet with $p_0 = 3$: almost $3\\psi$',
    stage: W(PK(0, 1, 3), { overlay: ['ppsi'] }),
    derivation: {
      result: '\\int\\chi^*(-i\\hbar\\psi\')\\,dx = \\int(-i\\hbar\\chi\')^*\\psi\\,dx',
      ground: [
        {
          tex: '\\langle\\chi|\\hat p\\psi\\rangle = \\int\\chi^*(-i\\hbar\\psi\')\\,dx',
          why: 'Write the [[inner-product|inner product]] of any function $\\chi$ with $\\hat p\\psi$, using $\\hat p = -i\\hbar\\,d/dx$.',
          view: W(PK(-1, 1, 2), { overlay: ['ppsi'] }),
          viewCaption: 'one packet, with $\\hat p\\psi$ dashed',
        },
        {
          tex: '= \\Big[-i\\hbar\\,\\chi^*\\psi\\Big] + \\int(i\\hbar\\,\\chi\'^*)\\,\\psi\\,dx',
          why: 'Integrate by parts: the derivative moves from $\\psi$ onto $\\chi^*$, and the sign flips.',
        },
        {
          tex: 'i\\hbar\\,\\chi\'^* = (-i\\hbar\\,\\chi\')^*',
          why: 'The bracket is zero because normalisable functions die away at both ends. Conjugating $-i\\hbar\\,\\chi\'$ flips the sign of $i$.',
          view: W(PK(0, 1, 3), { overlay: ['ppsi'] }),
          viewCaption: 'another packet, with $\\hat p\\psi$ dashed',
        },
        {
          tex: '\\int\\chi^*(-i\\hbar\\psi\')\\,dx = \\int(-i\\hbar\\chi\')^*\\psi\\,dx',
          why: 'So $\\langle\\chi|\\hat p\\psi\\rangle = \\langle\\hat p\\chi|\\psi\\rangle$, which says that $\\hat p$ is Hermitian.',
        },
      ],
    },
    claims: [
      claim('l13HermResidual', 'p̂ is Hermitian: ⟨a|p̂b⟩ − ⟨p̂a|b⟩ is zero for two packets', () => V.l13HermResidual < 1e-12),
      claim('l13PPsiCentre', '(p̂ψ) at the centre of the p₀ = 3 packet is 1.895, three times ψ(0)', () => close(V.l13PPsiCentre, 3 * Math.pow(2 * Math.PI, -0.25), 1e-9)),
    ],
  },
  {
    id: 'l13-generator:b4',
    phase: 'books',
    text: 'Townsend §6.3 shows that the generator of translations is Hermitian (Eq. 6.27), derives $[\\hat x,\\hat p] = i\\hbar$ from the translation (Eqs. 6.28–6.31), and justifies the name momentum with the relation $d\\langle x\\rangle/dt = \\langle\\hat p\\rangle/m$ (Eq. 6.33). His footnote on p. 197 warns that other books define $T(a)$ the other way round. Susskind §8.2.2 fixes the form $-i\\hbar\\,d/dx$ by Hermiticity and units.',
    caption: 'the shifted packet again: the generator’s sign follows from a rightward shift',
    stage: W(PK(0, 1), { shift: sweep(0, 2) }),
    refs: [
      townsend('§6.3, pp. 198–200', 'The generator is Hermitian, $[\\hat x,\\hat p] = i\\hbar$ follows from the translation, and momentum is justified by $d\\langle x\\rangle/dt = \\langle\\hat p\\rangle/m$ (Ehrenfest).'),
      susskind('§8.2.2', '$-iD$ is Hermitian, and $\\hbar$ fixes the units of $\\hat p$.'),
    ],
  },
  {
    id: 'l13-generator:b5',
    phase: 'clue',
    text: 'Is the average momentum of a packet with a real wavefunction zero?',
    stage: W(PK(0, 1)),
    reveal: {
      text: `Yes. For a real $\\psi$ the function $\\hat p\\psi = -i\\hbar\\psi'$ is purely imaginary, so $\\langle\\hat p\\rangle = \\int\\psi\\,(\\hat p\\psi)\\,dx$ would be imaginary. But the average of a Hermitian operator is real, so it must vanish. A packet needs a phase such as $e^{3ix}$ to carry momentum: that one has $\\langle p\\rangle = ${d(V.l13MeanP3, 1)}\\,\\hbar/\\ell$.`,
      caption: 'with the phase $e^{3ix}$ the same packet carries the mean momentum 3',
      stage: W(PK(0, 1, 3), { readouts: ['pmean'] }),
      claims: [claim('l13MeanPReal', 'a real wavefunction has ⟨p⟩ = 0', () => Math.abs(V.l13MeanPReal) < 1e-12)],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l13-plane-wave — A momentum eigenstate is a plane wave                                          */
/* ---------------------------------------------------------------------------------------------- */

const planeWave: Beat[] = [
  {
    id: 'l13-plane-wave:b1',
    phase: 'lecture',
    text: 'A momentum eigenstate obeys $\\hat p|p\\rangle = p|p\\rangle$. Project on $\\langle x|$ and use $\\hat p = -i\\hbar\\,d/dx$. Then $-i\\hbar\\,\\tfrac{d}{dx}\\langle x|p\\rangle = p\\,\\langle x|p\\rangle$. The solution is the [[plane-wave|plane wave]] $\\langle x|p\\rangle = Ce^{ipx/\\hbar} = Ce^{ikx}$, where $k = p/\\hbar$ and $C$ is a constant.',
    caption: 'a plane wave: the real part is a cosine, the imaginary part a sine, and the phase turns steadily',
    stage: W(PL(3), { show: ['re', 'im'] }),
    derivation: {
      result: '\\langle x|p\\rangle = Ce^{ipx/\\hbar}',
      ground: [
        {
          tex: '\\hat p|p\\rangle = p|p\\rangle',
          why: 'A momentum eigenstate is an eigenstate of $\\hat p$ with the eigenvalue $p$.',
          view: W(PL(3), { show: ['re', 'im'] }),
          viewCaption: 'a candidate: a plane wave with $p = 3$',
        },
        {
          tex: '-i\\hbar\\,\\tfrac{d}{dx}\\langle x|p\\rangle = p\\,\\langle x|p\\rangle',
          why: 'Project on $\\langle x|$ and use $\\hat p = -i\\hbar\\,d/dx$ (Unit 12.6).',
        },
        {
          tex: '\\tfrac{d}{dx}\\langle x|p\\rangle = \\tfrac{ip}{\\hbar}\\,\\langle x|p\\rangle',
          why: 'Divide by $-i\\hbar$, using $1/(-i) = i$. The slope is a constant times the function itself.',
        },
        {
          tex: '\\langle x|p\\rangle = Ce^{ipx/\\hbar}',
          why: 'The function whose slope is a constant times itself is an exponential; $C$ is the constant of integration.',
          view: W(PL(3), { show: ['phase'] }),
          viewCaption: 'the phase of the solution turns steadily with $x$',
        },
      ],
    },
  },
  {
    id: 'l13-plane-wave:b2',
    phase: 'lecture',
    text: `Normalising with the delta gives $\\langle x|p\\rangle = e^{ipx/\\hbar}/\\sqrt{2\\pi\\hbar}$; differentiating checks that it solves the equation. Now shift the wave. The translation $T(a)$ multiplies $e^{ikx}$ by the pure phase $e^{-ika}$, so the generator’s value on it is $\\hbar k$: the momentum. For $p = 2$ and a shift of a quarter of the wavelength, the phase turns by $-${d(V.l13ShiftPhaseDegMag, 0)}^\\circ$.`,
    caption: 'a plane wave shifted by a quarter of its wavelength: its phase has turned by a quarter of a turn',
    stage: W(PL(2), { shift: sweep(0, Math.PI / 4), show: ['re', 'im', 'phase'] }),
    claims: [
      claim('l13ShiftPhaseDegMag', 'a quarter-wavelength shift turns the phase of e^{2ix} by −90°', () => close(V.l13ShiftPhaseDegMag, 90, 1e-9)),
      claim('l13ShiftPhaseRadMag', 'which is π/2 radians', () => close(V.l13ShiftPhaseRadMag, Math.PI / 2, 1e-12)),
    ],
  },
  {
    id: 'l13-plane-wave:b3',
    phase: 'lecture',
    text: `A plane wave has one exact momentum, but the same density $|\\psi|^2$ at every $x$. It is completely spread out, the opposite of the spike of Unit 13.1. Its density at different positions agrees to ${d(V.l13FlatSingle, 3)}.`,
    caption: 'the density of a plane wave is a flat line',
    stage: W(PL(3), { show: ['density'], readouts: ['pmean', 'pspread'] }),
    claims: [claim('l13FlatSingle', '|ψ|² of a plane wave is the same at every x (spread zero)', () => V.l13FlatSingle < 1e-12)],
  },
  {
    id: 'l13-plane-wave:b4',
    phase: 'lecture',
    text: `A caveat: $\\int|e^{ipx/\\hbar}|^2dx$ is infinite, so $|p\\rangle$ is also a generalised eigenstate, normalised only to a delta function. Real states are normalisable [[superposition|superpositions]] of plane waves, called [[wave-packet|wave packets]]. A very broad packet, with $\\sigma = 4\\ell$, is almost a plane wave: its spread of momentum is only $\\Delta p = ${d(V.l13Dp4, 3)}\\,\\hbar/\\ell$. The readout rounds it to two decimals.`,
    caption: 'a broad packet with $p_0 = 3$ in position and in momentum: a long wave and a narrow momentum curve',
    stage: W(PK(0, 4, 3), { panels: ['position', 'momentum'], readouts: ['pspread'] }),
    claims: [claim('l13Dp4', 'the σ = 4 packet has Δp = 0.125 ħ/ℓ', () => close(V.l13Dp4, 0.125, 1e-9))],
  },
  {
    id: 'l13-plane-wave:b5',
    phase: 'books',
    text: `Townsend §6.5 derives the normalisation $1/\\sqrt{2\\pi\\hbar}$ from the delta function (Eqs. 6.46–6.56, pp. 202–204) and the de Broglie relation $\\lambda = h/p$. His Ex. 6.5 on pp. 211–212 sends helium atoms at 2200 m/s through slits 8 μm apart. The wavelength is ${d(V.l13LambdaHePm, 0)} pm. With a screen 195 cm behind the slits, the fringes are ${d(V.l13FringeHeUm, 0)} μm apart.`,
    caption: 'a plane wave of one wavelength: the wavelength is read off the picture',
    stage: W(PL(3), { readouts: ['wavelength'] }),
    refs: [townsend('§6.5, pp. 202–204; Example 6.5, pp. 211–212', 'The normalisation $1/\\sqrt{2\\pi\\hbar}$ from the delta function, $\\lambda = h/p$, and helium at 2200 m/s through two slits.')],
    claims: [
      claim('l13LambdaHePm', 'helium at 2200 m/s has λ = 45 pm', () => close(V.l13LambdaHePm, 45.31, 0.01)),
      claim('l13FringeHeUm', 'behind slits 8 μm apart, the fringes at 195 cm are 11 μm apart', () => close(V.l13FringeHeUm, 11.05, 0.01)),
    ],
  },
  {
    id: 'l13-plane-wave:b6',
    phase: 'clue',
    text: 'For $p = 3\\hbar/\\ell$, over what length does the phase of the plane wave turn once?',
    stage: W(PL(3), { show: ['re'] }),
    reveal: {
      text: `One wavelength, $\\lambda = 2\\pi\\hbar/p = ${d(V.l13Lambda3, 3)}\\,\\ell$.`,
      caption: 'the real part repeats after one wavelength',
      stage: W(PL(3), { show: ['re'], readouts: ['wavelength'] }),
      claims: [claim('l13Lambda3', 'λ = 2π/3 = 2.094 ℓ for p = 3', () => close(V.l13Lambda3, (2 * Math.PI) / 3, 1e-12))],
    },
  },
  {
    id: 'l13-plane-wave:b7',
    phase: 'deeper',
    text: 'Beyond the notes: put the particle on a ring of six sites, with the shift $T|j\\rangle = |j+1\\rangle$ and site 6 followed by site 1. This $T$ is unitary, and its eigenvalues are the six sixth roots of unity, with phases $0^\\circ$, $-60^\\circ$, $-120^\\circ$, $-180^\\circ$, $-240^\\circ$ and $-300^\\circ$. Its eigenvectors are discrete plane waves: the columns of the discrete Fourier transform, which turns $T$ into a diagonal matrix. <<sl-f8-dft|Go further in 709: the discrete Fourier transform>>',
    caption: 'the six eigenvalues of the ring shift, numbered 0 to 5 around the circle',
    stage: cp({ clock: 6, spokes: { phasesDeg: [0, -60, -120, -180, -240, -300] } }),
    claims: [
      claim('l13RingPhase1', 'the first nonzero eigenphase of the six-site shift has size 60°', () => close(V.l13RingPhase1, 60, 1e-9)),
      claim('l13RingPhase2', 'the next 120°', () => close(V.l13RingPhase2, 120, 1e-9)),
      claim('l13RingPhase3', 'the middle one 180°', () => close(V.l13RingPhase3, 180, 1e-9)),
      claim('l13RingDiag', 'the Fourier columns diagonalise T (off-diagonal part zero)', () => V.l13RingDiag < 1e-12),
      claim('l13RingUnitary', 'and T is unitary', () => V.l13RingUnitary < 1e-12),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l13-momentum-space — One ket, two sets of components                                            */
/* ---------------------------------------------------------------------------------------------- */

const momentumSpace: Beat[] = [
  {
    id: 'l13-momentum-space:b1',
    phase: 'lecture',
    text: `A basis of momentum eigenstates is as good as the position basis. Write $|\\psi\\rangle = \\int dp\\,\\tilde\\psi(p)\\,|p\\rangle$, where $\\tilde\\psi(p,t) = \\langle p|\\psi(t)\\rangle$ is the [[momentum-wavefunction|momentum amplitude]] (read “psi tilde”). The notes call it $\\phi(p,t)$; we keep $\\varphi$ for the azimuth. It is another representation of the same ket, not another state. For the packet with $e^{3ix}$ the average $\\int p\\,|\\tilde\\psi|^2dp$ is ${d(V.l13MeanPFromPhi, 1)} $\\hbar/\\ell$.`,
    caption: 'one state in two panels: the position curve above and the momentum curve below',
    stage: W(PK(0, 1, 3), { panels: ['position', 'momentum'] }),
    claims: [claim('l13MeanPFromPhi', 'the mean of the momentum density of the e^{3ix} packet is 3', () => close(V.l13MeanPFromPhi, 3, 1e-9))],
  },
  {
    id: 'l13-momentum-space:b2',
    phase: 'lecture',
    text: `Insert $\\int dp\\,|p\\rangle\\langle p|$ into $\\psi(x) = \\langle x|\\psi\\rangle$ and use $\\langle x|p\\rangle = e^{ipx/\\hbar}/\\sqrt{2\\pi\\hbar}$. This gives $\\psi(x)$ as a sum of plane waves with the weights $\\tilde\\psi(p)$, and inversely $\\tilde\\psi(p) = \\tfrac{1}{\\sqrt{2\\pi\\hbar}}\\int dx\\,e^{-ipx/\\hbar}\\psi(x)$. This pair is the [[fourier-transform|Fourier transform]], with $p/\\hbar$ as the wave number. For the unit packet the peak of $|\\tilde\\psi|^2$ is ${d(V.l13PhiPeak1, 3)} per $\\hbar/\\ell$.`,
    caption: 'the unit packet: a Gaussian in position and a Gaussian in momentum',
    stage: W(PK(0, 1), { panels: ['position', 'momentum'] }),
    derivation: {
      result: '\\psi(x) = \\tfrac{1}{\\sqrt{2\\pi\\hbar}}\\int dp\\,e^{ipx/\\hbar}\\tilde\\psi(p)',
      ground: [
        {
          tex: '\\psi(x) = \\int dp\\,\\langle x|p\\rangle\\langle p|\\psi\\rangle',
          why: 'Insert the momentum identity $I = \\int dp\\,|p\\rangle\\langle p|$ between the bra $\\langle x|$ and the ket.',
          view: W(PK(0, 1), { show: ['re', 'im', 'density'] }),
          viewCaption: 'the position panel only',
        },
        {
          tex: '\\psi(x) = \\int dp\\,\\tfrac{e^{ipx/\\hbar}}{\\sqrt{2\\pi\\hbar}}\\,\\tilde\\psi(p)',
          why: 'Put in $\\langle x|p\\rangle$ from Unit 13.3, and call $\\langle p|\\psi\\rangle = \\tilde\\psi(p)$.',
        },
        {
          tex: '\\psi(x) = \\tfrac{1}{\\sqrt{2\\pi\\hbar}}\\int dp\\,e^{ipx/\\hbar}\\tilde\\psi(p)',
          why: 'Pull the constant out of the integral. Inserting $\\int dx\\,|x\\rangle\\langle x|$ instead gives the inverse formula.',
          view: W(PK(0, 1), { panels: ['position', 'momentum'] }),
          viewCaption: 'both panels: the same state in two sets of components',
        },
      ],
    },
    claims: [claim('l13PhiPeak1', 'the peak of |ψ̃|² for σ = 1 is 0.798 per ħ/ℓ', () => close(V.l13PhiPeak1, Math.sqrt(2 / Math.PI), 1e-9))],
  },
  {
    id: 'l13-momentum-space:b3',
    phase: 'lecture',
    text: 'Both $|\\psi(x,t)|^2dx$ and $|\\tilde\\psi(p,t)|^2dp$ are chances. There is one ket and one system, with two sets of amplitudes, and both sets are equally valid. A position measurement uses the first, a momentum measurement the second.',
    caption: 'the densities in position and in momentum: two sets of chances for one state',
    stage: W(PK(0, 1), { panels: ['position', 'momentum'], show: ['density'], readouts: ['norm'] }),
  },
  {
    id: 'l13-momentum-space:b4',
    phase: 'lecture',
    text: `Both normalisations hold, and they are one rule: the Fourier transform keeps the total chance, so $\\int|\\tilde\\psi|^2dp = \\int|\\psi|^2dx$ for every width. For the widths $\\sigma = \\tfrac12\\ell$ and $2\\ell$ the momentum integrals are ${d(V.l13NormP05, 3)} and ${d(V.l13NormP2, 3)}. The word “representation” is the right one; “picture” is kept for later.`,
    caption: 'the packet widens from half to twice the unit width; both panels keep the total chance',
    stage: W(PK(0, sweep(0.5, 2)), { panels: ['position', 'momentum'], show: ['density'], readouts: ['norm'] }),
    claims: [
      claim('l13NormP05', 'the momentum density of the σ = ½ packet has total chance 1', () => close(V.l13NormP05, 1, 1e-9)),
      claim('l13NormP2', 'and so does the σ = 2 packet', () => close(V.l13NormP2, 1, 1e-9)),
      claim('l13NormP1', 'and the unit packet', () => close(V.l13NormP1, 1, 1e-9)),
    ],
  },
  {
    id: 'l13-momentum-space:b5',
    phase: 'books',
    text: `Townsend §6.5 writes the pair as Eq. 6.57 on p. 204, and §6.6 (pp. 204–209) finds that the transform of a Gaussian is a Gaussian. His packet has $\\Delta x = a/\\sqrt2$ and $\\Delta p = \\hbar/(\\sqrt2\\,a)$, so $\\Delta x\\,\\Delta p = \\hbar/2$, the smallest value allowed. His parameter $a$ is $\\sqrt2\\,\\sigma$ in our notation. For the widths $\\sigma = 1\\ell$, half of that and twice that, our $\\Delta p$ is ${d(V.l13Dp1, 2)}, ${d(V.l13Dp05, 2)} and ${d(V.l13Dp2, 2)} in $\\hbar/\\ell$. Susskind §8.3 and §8.5 treat the same pair.`,
    caption: 'the packet narrows from $\\sigma = 1$ to half of that: the momentum curve widens and the product stays put',
    stage: W(PK(0, sweep(1, 0.5)), { panels: ['position', 'momentum'], readouts: ['xspread', 'pspread', 'product'] }),
    refs: [
      townsend('§6.5, p. 204; §6.6, pp. 204–209', 'The transform pair, and the Gaussian packet with $\\Delta x\\,\\Delta p = \\hbar/2$; his $a$ is $\\sqrt2\\,\\sigma$.'),
      susskind('§8.3, §8.5', 'The momentum representation and the uncertainty principle.'),
    ],
    claims: [
      claim('l13Dp1', 'Δp = ħ/2σ = 0.50 for σ = 1', () => close(V.l13Dp1, 0.5, 1e-9)),
      claim('l13Dp05', 'Δp = 1.00 for σ = ½', () => close(V.l13Dp05, 1, 1e-9)),
      claim('l13Dp2', 'Δp = 0.25 for σ = 2', () => close(V.l13Dp2, 0.25, 1e-9)),
      claim('l13DxDp1', 'ΔxΔp = ½ ħ for σ = 1', () => close(V.l13DxDp1, 0.5, 1e-9)),
    ],
  },
  {
    id: 'l13-momentum-space:b6',
    phase: 'clue',
    text: 'Halve the width of a packet in position. What happens to its spread in momentum?',
    stage: W(PK(0, 1), { panels: ['position', 'momentum'], readouts: ['product'] }),
    reveal: {
      text: `It doubles: $\\Delta p = \\hbar/2\\sigma$, so $\\sigma = \\tfrac12\\ell$ gives $\\Delta p = ${d(V.l13Dp05, 1)}\\,\\hbar/\\ell$. The product $\\Delta x\\,\\Delta p$ stays at ${d(V.l13DxDp05, 1)} $\\hbar$.`,
      caption: 'half the width: twice the spread of momentum, the same product',
      stage: W(PK(0, 0.5), { panels: ['position', 'momentum'], readouts: ['product'] }),
      claims: [claim('l13DxDp05', 'ΔxΔp = ½ ħ for σ = ½', () => close(V.l13DxDp05, 0.5, 1e-9))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l13-two-bases — Position in the momentum basis                                                  */
/* ---------------------------------------------------------------------------------------------- */

const twoBases: Beat[] = [
  {
    id: 'l13-two-bases:b1',
    phase: 'lecture',
    text: 'In its own basis, momentum is multiplication, just as position is in the position basis: $\\langle p|\\hat p|\\psi\\rangle = p\\,\\tilde\\psi(p)$, parallel to $\\langle x|\\hat x|\\psi\\rangle = x\\,\\psi(x)$. Swap the roles and position must become a derivative. As a check of the first formula, the average $\\int p\\,|\\tilde\\psi|^2dp$ is zero for a packet at rest.',
    caption: 'the packet at rest: its momentum curve is centred on $p = 0$',
    stage: W(PK(0, 1), { panels: ['position', 'momentum'], readouts: ['pmean'] }),
    claims: [claim('l13PMeanFromPhiMul', 'the mean of p|ψ̃|² for the packet at rest is zero', () => Math.abs(V.l13PMeanFromPhiMul) < 1e-12)],
  },
  {
    id: 'l13-two-bases:b2',
    phase: 'lecture',
    text: `To find $\\hat x$ in the momentum basis, differentiate the transform of Unit 13.4 with respect to $p$. Each exponential brings down $-ix/\\hbar$. Multiplying by $i\\hbar$ gives the transform of $x\\psi(x)$, which is $\\langle p|\\hat x|\\psi\\rangle$. So $\\hat x$ acts as $i\\hbar\\,\\partial/\\partial p$. As a check, $\\langle x\\rangle = \\int\\tilde\\psi^*\\,(i\\hbar\\,\\partial_p\\tilde\\psi)\\,dp$ gives ${d(V.l13XMeanFromP, 3)} $\\ell$ for the packet centred at $x_0 = 2\\ell$.`,
    caption: 'the packet centred at 2 in momentum: the phase of $\\tilde\\psi$ turns with $p$, and its slope carries the position',
    stage: W(PK(2, 1), { panels: ['momentum'], show: ['re', 'im'] }),
    derivation: {
      result: '\\langle p|\\hat x|\\psi\\rangle = i\\hbar\\,\\partial_p\\tilde\\psi(p)',
      ground: [
        {
          tex: '\\tilde\\psi(p) = \\tfrac{1}{\\sqrt{2\\pi\\hbar}}\\int dx\\,e^{-ipx/\\hbar}\\psi(x)',
          why: 'Start from the transform of Unit 13.4.',
          view: W(PK(2, 1), { panels: ['momentum'], show: ['re', 'im'] }),
          viewCaption: 'the momentum panel of the packet centred at 2',
        },
        {
          tex: '\\partial_p\\tilde\\psi = \\tfrac{1}{\\sqrt{2\\pi\\hbar}}\\int dx\\,\\Big(-\\tfrac{ix}{\\hbar}\\Big)e^{-ipx/\\hbar}\\psi(x)',
          why: 'Differentiate under the integral. Only the exponential depends on $p$, and it brings down $-ix/\\hbar$.',
        },
        {
          tex: 'i\\hbar\\,\\partial_p\\tilde\\psi = \\tfrac{1}{\\sqrt{2\\pi\\hbar}}\\int dx\\,e^{-ipx/\\hbar}\\,x\\psi(x)',
          why: 'Multiply by $i\\hbar$: the factor $-ix/\\hbar$ becomes $x$. The right side is the transform of the function $x\\psi(x)$.',
          view: W(PK(2, 1), { overlay: ['xpsi'], show: ['re', 'im'] }),
          viewCaption: 'the position panel with $\\hat x\\psi = x\\psi$ dashed',
        },
        {
          tex: '\\langle p|\\hat x|\\psi\\rangle = i\\hbar\\,\\partial_p\\tilde\\psi(p)',
          why: 'The transform of $x\\psi$ is the momentum component of $\\hat x|\\psi\\rangle$, so $\\hat x$ acts as $i\\hbar\\,\\partial_p$.',
        },
      ],
    },
    claims: [claim('l13XMeanFromP', '⟨x⟩ = ∫ψ̃*(iħ∂ₚψ̃)dp is 2.000 for the packet at x₀ = 2 (seven-point difference)', () => close(V.l13XMeanFromP, 2, 5e-5))],
  },
  {
    id: 'l13-two-bases:b3',
    phase: 'lecture',
    text: 'The notes’ table: in the position basis $\\hat x$ is $x$ and $\\hat p$ is $-i\\hbar\\,d/dx$. In the momentum basis $\\hat x$ is $i\\hbar\\,d/dp$ and $\\hat p$ is $p$. Neither operator changed. The basis did.',
    caption: 'the same state with $\\hat x\\psi$ and $\\hat p\\psi$ dashed in the position panel, and its momentum curve below',
    stage: W(PK(2, 1, 3), { panels: ['position', 'momentum'], overlay: ['xpsi', 'ppsi'] }),
  },
  {
    id: 'l13-two-bases:b4',
    phase: 'lecture',
    text: `In the position basis, test the commutator on a wavefunction. First $\\hat x\\hat p\\psi = -i\\hbar\\,x\\psi'$. Then $\\hat p\\hat x\\psi = -i\\hbar\\,(x\\psi)'$, and the product rule gives $(x\\psi)' = \\psi + x\\psi'$. Subtracting leaves $[\\hat x,\\hat p]\\psi = i\\hbar\\psi$. At three positions the ratio $([\\hat x,\\hat p]\\psi)/\\psi$ is the number $i$, and the average $\\langle[\\hat x,\\hat p]\\rangle$ over the packet has imaginary part ${d(V.l13CommExpIm, 3)} $\\hbar$.`,
    caption: '$\\hat x\\psi$ and $\\hat p\\psi$ dashed over the packet at 2: the order of the two operators matters',
    stage: W(PK(2, 1), { overlay: ['xpsi', 'ppsi'], show: ['re', 'im'] }),
    derivation: {
      result: '[\\hat x,\\hat p]\\,\\psi = i\\hbar\\,\\psi',
      ground: [
        {
          tex: '\\hat x\\hat p\\,\\psi = x\\cdot(-i\\hbar\\,\\psi\') = -i\\hbar\\,x\\psi\'',
          why: 'First $\\hat p$ differentiates, then $\\hat x$ multiplies the result by $x$.',
          view: W(PK(2, 1), { overlay: ['ppsi'], show: ['re', 'im'] }),
          viewCaption: '$\\hat p\\psi$ dashed over the packet',
        },
        {
          tex: '\\hat p\\hat x\\,\\psi = -i\\hbar\\,(x\\psi)\'',
          why: 'First $\\hat x$ multiplies by $x$, then $\\hat p$ differentiates the whole product.',
          view: W(PK(2, 1), { overlay: ['xpsi'], show: ['re', 'im'] }),
          viewCaption: '$\\hat x\\psi$ dashed over the packet',
        },
        {
          tex: '(x\\psi)\' = \\psi + x\\psi\'',
          why: 'The product rule: the derivative also acts on the factor $x$.',
        },
        {
          tex: '[\\hat x,\\hat p]\\,\\psi = i\\hbar\\,\\psi',
          why: 'Subtract the two results. The $x\\psi\'$ terms cancel and a single $i\\hbar\\psi$ is left.',
        },
      ],
    },
    claims: [
      claim('l13CommResidual', '([x̂, p̂]ψ)/ψ = i at x = −1, ½ and 2 (residual zero)', () => V.l13CommResidual < 1e-9),
      claim('l13CommExpIm', '⟨[x̂, p̂]⟩ has imaginary part 1 ħ', () => close(V.l13CommExpIm, 1, 1e-9)),
      claim('l13CommExpRe', 'and real part zero', () => Math.abs(V.l13CommExpRe) < 1e-9),
    ],
  },
  {
    id: 'l13-two-bases:b5',
    phase: 'lecture',
    text: `In the momentum basis the same test gives $i\\hbar\\,\\partial_p(p\\tilde\\psi) - i\\hbar\\,p\\,\\partial_p\\tilde\\psi = i\\hbar\\,\\tilde\\psi$. The surviving term is again the derivative acting on the multiplying variable. So $[\\hat x,\\hat p] = i\\hbar\\,I$ in every basis. This cashes in the preview of Unit 7.6: $\\Delta x\\,\\Delta p \\ge \\hbar/2$. The Gaussians of Unit 13.4 sit exactly on that floor: for $\\sigma = 2\\ell$ the product is ${d(V.l13DxDp2, 2)} $\\hbar$. <<sl-q3-uncertainty|Go further in 709: the uncertainty relation>>`,
    caption: 'a wide Gaussian in both panels: its product of spreads still sits on the floor',
    stage: W(PK(0, 2), { panels: ['position', 'momentum'], readouts: ['product'] }),
    claims: [claim('l13DxDp2', 'ΔxΔp = ½ ħ for σ = 2', () => close(V.l13DxDp2, 0.5, 1e-9))],
  },
  {
    id: 'l13-two-bases:b6',
    phase: 'books',
    text: 'Townsend §6.3 (p. 199, Eq. 6.31) gives $[\\hat x,\\hat p] = i\\hbar$. His §6.4 (p. 202, Eqs. 6.43–6.45) gives the matrix elements and the form of $\\hat p$ in the position basis. Susskind §8.4 treats commutators and Poisson brackets, and §8.5 the uncertainty principle.',
    caption: 'the same state in the two representations',
    stage: W(PK(0, 1), { panels: ['position', 'momentum'] }),
    refs: [
      townsend('§6.3, p. 199; §6.4, p. 202', 'Matrix elements of $\\hat p$ in the position basis and the commutator $[\\hat x,\\hat p] = i\\hbar$.'),
      susskind('§8.4, §8.5', 'Commutators and Poisson brackets, then the uncertainty principle.'),
    ],
  },
  {
    id: 'l13-two-bases:b7',
    phase: 'clue',
    text: 'Why does the commutator survive, when each of $\\hat x$ and $\\hat p$ is so simple?',
    stage: W(PK(2, 1), { overlay: ['xpsi'], show: ['re', 'im'] }),
    reveal: {
      text: 'Because differentiation also acts on the factor that multiplies: $\\partial_x(x\\psi) - x\\,\\partial_x\\psi = \\psi$. In the momentum basis the same happens with $p$. If both operators were plain multiplications, they would commute.',
      caption: '$\\hat x\\psi$ and $\\hat p\\psi$ both drawn: the derivative sees the factor $x$',
      stage: W(PK(2, 1), { overlay: ['xpsi', 'ppsi'], show: ['re', 'im'] }),
    },
  },
  {
    id: 'l13-two-bases:b8',
    phase: 'deeper',
    text: `Beyond the notes: could $[\\hat x,\\hat p] = i\\hbar$ hold for finite matrices? No. The trace of every commutator is zero, because $\\mathrm{tr}(XP) = \\mathrm{tr}(PX)$, while the trace of $i\\hbar I_3$ is $3i\\hbar$. For two fixed $3\\times 3$ matrices the engine finds $|\\mathrm{tr}(XP - PX)| = ${d(V.l13TraceComm, 1)}$, and $|\\mathrm{tr}(i\\hbar I_3)|/\\hbar = ${d(V.l13TraceIdentity, 1)}$. That is why position needs an infinite-dimensional space; the continuous position basis supplies one.`,
    caption: 'the commutator of two Pauli matrices: its trace is zero, as for every commutator',
    stage: mx(
      { lin: [{ c: '+1', src: { product: [{ pauli: 'X' }, { pauli: 'Z' }] } }, { c: '-1', src: { product: [{ pauli: 'Z' }, { pauli: 'X' }] } }] },
      { trace: true },
    ),
    claims: [
      claim('l13TraceComm', 'the trace of XP − PX is 0 for two 3×3 matrices', () => V.l13TraceComm < 1e-12),
      claim('l13TraceIdentity', 'the trace of iħI₃ has size 3 ħ', () => close(V.l13TraceIdentity, 3, 1e-12)),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l13-schrodinger — The Schrödinger equation of a particle                                        */
/* ---------------------------------------------------------------------------------------------- */

const schrodinger: Beat[] = [
  {
    id: 'l13-schrodinger:b1',
    phase: 'lecture',
    text: 'Unit 11.4 and Unit 12.1 gave the law $i\\hbar\\,d|\\psi\\rangle/dt = H|\\psi\\rangle$. For one particle of mass $m$ on a line, in a potential $V$, the classical energy $\\tfrac{p^2}{2m} + V$ suggests $H = \\tfrac{\\hat p^2}{2m} + V(\\hat x,t)$. The first term is the [[kinetic-energy-operator|kinetic-energy operator]]; the second is the potential energy through $\\hat x$. This is not a new law, only a choice of $H$.',
    caption: 'a free packet waiting: the law is the same, only $H$ is chosen',
    stage: W(PK(0, 1, 3), { time: sweep(0, 2) }),
  },
  {
    id: 'l13-schrodinger:b2',
    phase: 'lecture',
    text: 'Project the law on $\\langle x|$. The position kets do not depend on $t$, so $\\langle x|$ passes through the time derivative. Applying $-i\\hbar\\,d/dx$ twice gives $\\langle x|\\hat p^2|\\psi\\rangle = -\\hbar^2\\psi\'\'$. The result is the [[position-space-schrodinger|position-space Schrödinger equation]], a differential equation for the wavefunction.',
    caption: 'the same free packet in both representations while time runs',
    stage: W(PK(0, 1, 3), { time: sweep(0, 2), panels: ['position', 'momentum'] }),
    derivation: {
      result: 'i\\hbar\\,\\partial_t\\psi = -\\tfrac{\\hbar^2}{2m}\\,\\partial_x^2\\psi + V\\psi',
      ground: [
        {
          tex: 'i\\hbar\\,\\partial_t\\psi(x,t) = \\langle x|H|\\psi(t)\\rangle',
          why: 'Project the law on $\\langle x|$. The position kets do not change with $t$, so $\\langle x|$ passes through the derivative.',
          view: W(PK(0, 1, 3), { time: sweep(0, 2) }),
          viewCaption: 'the position panel while time runs',
        },
        {
          tex: '\\langle x|\\hat p^2|\\psi\\rangle = -\\hbar^2\\,\\psi\'\'(x)',
          why: 'Apply $\\hat p = -i\\hbar\\,d/dx$ twice. The factor $(-i\\hbar)^2$ is $-\\hbar^2$.',
        },
        {
          tex: '\\langle x|V(\\hat x)|\\psi\\rangle = V(x)\\,\\psi(x)',
          why: 'The potential is a function of $\\hat x$, and $\\hat x$ multiplies by $x$ (Unit 12.5).',
        },
        {
          tex: 'i\\hbar\\,\\partial_t\\psi = -\\tfrac{\\hbar^2}{2m}\\,\\partial_x^2\\psi + V\\psi',
          why: 'Add the kinetic part $\\tfrac{\\hat p^2}{2m}$ and the potential part, as in $H$ of the previous beat.',
          view: W(PK(0, 1, 3), { time: sweep(0, 2), panels: ['position', 'momentum'] }),
          viewCaption: 'both panels: only the position curve moves',
        },
      ],
    },
    claims: [claim('l13SchroOk', 'a finite difference of the free evolution obeys iħ∂ₜψ = Ĥψ to 1e−4 (a check, not shown)', () => V.l13SchroOk === 1)],
  },
  {
    id: 'l13-schrodinger:b3',
    phase: 'lecture',
    text: `What did and did not happen. Kinetic energy entered through $\\hat p$, potential energy through $\\hat x$, and the position basis turned the abstract law into a differential equation. The wavefunction $\\psi(x,t)$ is an amplitude, not a displacement. The scope is one spinless particle, one dimension and a potential that depends on position and time. For $p_0 = 3$ and $V = 0$ the centre of the packet is at ${d(V.l13FreeMean2, 1)} $\\ell$ when $t = 2$, which is $p_0t/m$.`,
    caption: 'the free packet runs to the right at $p_0/m$',
    stage: W(PK(0, 1, 3), { time: sweep(0, 2), show: ['density'] }),
    claims: [claim('l13FreeMean2', 'the free packet’s centre is at 6 ℓ at t = 2', () => close(V.l13FreeMean2, 6, 1e-9))],
  },
  {
    id: 'l13-schrodinger:b4',
    phase: 'lecture',
    text: `The historical route starts from a plane wave $Ae^{i(kx - \\omega t)}$ with $E = \\hbar\\omega$, $p = \\hbar k$ and $E = \\tfrac{p^2}{2m}$. Then $i\\hbar\\,\\partial_t\\psi = \\hbar\\omega\\psi = E\\psi$ and $-\\tfrac{\\hbar^2}{2m}\\partial_x^2\\psi = \\tfrac{\\hbar^2k^2}{2m}\\psi = E\\psi$, so one equation covers both. For $k = 2$ and $m = 1$, $\\omega = \\tfrac{\\hbar k^2}{2m}$ is ${d(V.l13OmegaK2, 1)} in units $\\hbar/m\\ell^2$, and by $t = 1$ the phase at a point has turned through $${d(V.l13PlanePhaseDegMag, 1)}^\\circ$.`,
    caption: 'a plane wave with $p = 2$ waiting: the phase pattern slides to the right',
    stage: W(PL(2), { time: sweep(0, 1), show: ['re', 'im', 'phase'] }),
    derivation: {
      result: 'i\\hbar\\,\\partial_t\\psi = -\\tfrac{\\hbar^2}{2m}\\,\\partial_x^2\\psi',
      ground: [
        {
          tex: '\\psi = Ae^{i(kx - \\omega t)}',
          why: 'A plane wave with wave number $k$ and angular frequency $\\omega$; $A$ is a constant.',
          view: W(PL(2), { show: ['re', 'im', 'phase'] }),
          viewCaption: 'the wave at $t = 0$',
        },
        {
          tex: 'i\\hbar\\,\\partial_t\\psi = \\hbar\\omega\\,\\psi = E\\psi',
          why: 'The time derivative brings down $-i\\omega$, and $E = \\hbar\\omega$.',
        },
        {
          tex: '-\\tfrac{\\hbar^2}{2m}\\,\\partial_x^2\\psi = \\tfrac{\\hbar^2k^2}{2m}\\,\\psi = E\\psi',
          why: 'Two space derivatives bring down $(ik)^2 = -k^2$, and $E = \\tfrac{p^2}{2m}$ with $p = \\hbar k$.',
          view: W(PL(2), { time: 1, show: ['re', 'im', 'phase'] }),
          viewCaption: 'the same wave at $t = 1$',
        },
        {
          tex: 'i\\hbar\\,\\partial_t\\psi = -\\tfrac{\\hbar^2}{2m}\\,\\partial_x^2\\psi',
          why: 'Both left-hand sides equal $E\\psi$ for the same $\\psi$, so they equal each other. That is the equation.',
        },
      ],
    },
    claims: [
      claim('l13OmegaK2', 'ω = ħk²/2m = 2 for k = 2 and m = 1', () => close(V.l13OmegaK2, 2, 1e-9)),
      claim('l13PlanePhaseDegMag', 'the phase at a point turns through 114.6° by t = 1', () => close(V.l13PlanePhaseDegMag, 114.59155902616465, 1e-9)),
    ],
  },
  {
    id: 'l13-schrodinger:b5',
    phase: 'lecture',
    text: 'What this shows and what it does not. A first time derivative stands for the energy, and a second space derivative for the kinetic energy. The equation is linear, so superpositions of plane waves also solve it. A single plane wave solves it only for a constant potential, here $V = 0$. And $\\psi$ is an amplitude: a water wave is an observable displacement, a $\\psi$ is not.',
    caption: 'a packet is a superposition of many plane waves, each running at its own speed',
    stage: W(PK(0, 1, 3), { time: sweep(0, 4), window: { x: [-4, 16] } }),
  },
  {
    id: 'l13-schrodinger:b6',
    phase: 'books',
    text: `Townsend §6.6 (pp. 208–210, Eqs. 6.73–6.77) follows a Gaussian under free evolution. Its width grows as $\\sigma\\sqrt{1 + (\\hbar t/2m\\sigma^2)^2}$ while $\\Delta p = ${d(V.l13FreeDp4, 1)}\\,\\hbar/\\ell$ never changes. The spreading time $m a^2/\\hbar$, with $a = \\sqrt2\\,\\sigma$ (Unit 13.4), is $${d(V.l13SpreadElectronMant, 1)}\\times 10^{-17}$ s for an electron in an atom-sized packet ($a = 10^{-10}$ m). For a one-gram marble with $a = 1$ mm it is $${d(V.l13SpreadMarbleMant, 1)}\\times 10^{24}$ s, about $${d(V.l13SpreadMarbleYearsMant, 1)}\\times 10^{17}$ years. Chapter 4 §4.1 on p. 112 notes that Schrödinger first wrote the equation as a wave equation. Susskind Lecture 9, §9.1–9.2 builds the same equation.`,
    caption: 'the free packet at four times in both panels: the position curve spreads, the momentum curve does not',
    stage: W(PK(0, 1, 3), { time: sweep(0, 4), panels: ['position', 'momentum'], window: { x: [-4, 16] } }),
    refs: [
      townsend('§6.6, pp. 208–210; §4.1, p. 112', 'The spreading Gaussian, $\\sigma\\sqrt{1 + (\\hbar t/2m\\sigma^2)^2}$, and the spreading time $m a^2/\\hbar$ for an electron and for a marble.'),
      susskind('Lecture 9, §9.1–9.2', 'The Schrödinger equation of a particle on a line and its free solutions.'),
    ],
    claims: [
      claim('l13FreeDp4', 'Δp stays 0.5 ħ/ℓ at every time', () => close(V.l13FreeDp4, 0.5, 1e-9)),
      claim('l13SpreadElectronMant', 'an electron in an atom-sized packet spreads in 8.6e−17 s', () => close(V.l13SpreadElectronMant, 8.6, 0.05)),
      claim('l13SpreadMarbleMant', 'a one-gram marble with a = 1 mm in 9.5e24 s', () => close(V.l13SpreadMarbleMant, 9.5, 0.05)),
      claim('l13SpreadMarbleYearsMant', 'about 3.0e17 years', () => close(V.l13SpreadMarbleYearsMant, 3.0, 0.05)),
      claim('l13SpreadElectronLog10', 'the electron’s time is 10^{−16.06} s', () => close(V.l13SpreadElectronLog10, -16.06, 0.01)),
    ],
  },
  {
    id: 'l13-schrodinger:b7',
    phase: 'clue',
    text: 'Does a free packet keep its width?',
    stage: W(PK(0, 1, 3), { time: 0, show: ['density'], readouts: ['xspread'], window: { x: [-4, 16] } }),
    reveal: {
      text: `No. For $\\sigma = 1\\ell$, $\\Delta x$ grows to ${d(V.l13FreeSd2, 2)} $\\ell$ at $t = 2$ and ${d(V.l13FreeSd4, 2)} $\\ell$ at $t = 4$, following $\\sigma\\sqrt{1 + (\\hbar t/2m\\sigma^2)^2}$, while $\\Delta p$ stays ${d(V.l13FreeDp4, 1)} $\\hbar/\\ell$.`,
      caption: 'the same packet at $t = 4$: wider, and no longer tall',
      stage: W(PK(0, 1, 3), { time: 4, show: ['density'], readouts: ['xspread'], window: { x: [-4, 16] } }),
      claims: [
        claim('l13FreeSd2', 'Δx = 1.41 ℓ at t = 2', () => close(V.l13FreeSd2, Math.SQRT2, 1e-9)),
        claim('l13FreeSd4', 'and 2.24 ℓ at t = 4', () => close(V.l13FreeSd4, Math.sqrt(5), 1e-9)),
      ],
    },
  },
  {
    id: 'l13-schrodinger:b8',
    phase: 'deeper',
    text: `The notes’ optional §13.10: for a time-independent $H$ and the start state $|E\\rangle$ with $H|E\\rangle = E|E\\rangle$, the state is $|\\psi(t)\\rangle = e^{-iEt/\\hbar}|E\\rangle$ (Unit 11.5 and Unit 12.1). Project $H|E\\rangle = E|E\\rangle$ on $\\langle x|$ and write $\\varphi_E(x) = \\langle x|E\\rangle$, the [[energy-eigenfunction|energy eigenfunction]]. Then $\\left[-\\tfrac{\\hbar^2}{2m}\\tfrac{d^2}{dx^2} + V\\right]\\varphi_E = E\\varphi_E$, not a separate postulate. The state is stationary: $\\psi(x,t) = e^{-iEt/\\hbar}\\varphi_E(x)$ has a fixed $|\\psi|^2$. Beyond the notes: two energies make a moving pattern. The plane waves $p = 2$ and $p = 4$, with $m = 1$, give fringes ${d(V.l13FringeSpacing, 3)} $\\ell$ apart. They travel at ${d(V.l13FringeSpeed, 1)} $\\ell$ per unit time, which equals $(p_1 + p_2)/2m$.`,
    caption: 'two plane waves: the fringes of the density travel to the right',
    stage: W(TW(2, 4), { time: sweep(0, 2), show: ['density'] }),
    refs: [susskind('Lecture 9, §9.3', 'The time-independent equation for free particles; any solution is a sum of energy eigenstates, and only phases change.')],
    claims: [
      claim('l13FringeSpacing', 'the fringes of p = 2 and 4 are π ℓ apart', () => close(V.l13FringeSpacing, Math.PI, 1e-9)),
      claim('l13FringeSpeed', 'the tracked fringe moves at 3.0 ℓ per unit time', () => close(V.l13FringeSpeed, 3, 1e-9)),
      claim('l13FringeSpeedFormula', 'which equals (p₁ + p₂)/2m', () => close(V.l13FringeSpeedFormula, V.l13FringeSpeed, 1e-9)),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l13-time — Why time is a parameter, not an operator                                             */
/* ---------------------------------------------------------------------------------------------- */

const time: Beat[] = [
  {
    id: 'l13-time:b1',
    phase: 'lecture',
    text: `There is a real difference between $x$ and $t$. The experimenter chooses the time of a measurement with a clock, and the state then gives the chances of positions at that time: $P(x\\text{ in }dx\\mid t) = |\\psi(x,t)|^2dx$. At each $t$ the wavefunction is a complete state. And $|\\psi|^2$ is not a joint density of $x$ and $t$. At $t = 4$ the free packet is wider, but its total chance is still ${d(V.l13FreeNorm4, 3)}.`,
    caption: 'the free packet at each time is a full state: wider with time, its area stays one',
    stage: W(PK(0, 1, 3), { time: sweep(0, 4), show: ['density'], readouts: ['norm'], window: { x: [-4, 16] } }),
    claims: [claim('l13FreeNorm4', 'the free packet at t = 4 has total chance 1', () => close(V.l13FreeNorm4, 1, 1e-9))],
  },
  {
    id: 'l13-time:b2',
    phase: 'lecture',
    text: 'No conflict with generators: a generator’s parameter need not be an observable. The shift $T(a) = e^{-ia\\hat p/\\hbar}$ moves a state in space and $U(t) = e^{-iHt/\\hbar}$ moves it in time. With no explicit $t$ in $H$, time symmetry gives energy conservation (Noether, Unit 12.1), and no separate operator is needed. For a free particle $[H,\\hat p] = 0$, so momentum is conserved. A note on letters: the notes write $\\hat T$ both for the shift $T(a)$ and for a hypothetical [[time-operator|time operator]]. Here the shift stays $T(a)$, the evolution stays $U(t)$, and the hypothetical operator is $\\hat t$. Unit 11.6 used $T$ for the period.',
    caption: 'a shift in space above and a wait in time below: two unitary maps with a parameter that is not an observable',
    stage: { layout: 'split', top: W(PK(0, 1), { shift: sweep(0, 3) }), bottom: K(sweep(0, 90)) },
    introduces: ['time-operator'],
    claims: [claim('l13FreeCommutatorOk', '[H, p̂]ψ is zero for the free particle, so momentum is conserved', () => V.l13FreeCommutatorOk === 1)],
  },
  {
    id: 'l13-time:b3',
    phase: 'lecture',
    text: `Could time be conjugate to energy, $[\\hat t,H] = i\\hbar$? Then $W(\\epsilon) = e^{-i\\epsilon\\hat t/\\hbar}$ gives $WHW^\\dagger = H + \\epsilon$, so every energy is shifted by any amount $\\epsilon$ (here $\\epsilon$ is any number, not Lecture 11’s energy unit). The same algebra for $\\hat x$ and $\\hat p$ shifts a momentum curve rigidly: multiplying $\\psi$ by $e^{i\\epsilon x}$ adds $\\epsilon$ to every momentum. With $\\epsilon = ${d(V.l13BoostMean, 1)}$ the mean momentum moves from 0 to ${d(V.l13BoostMean, 1)} and $\\Delta p$ stays ${d(V.l13BoostSd, 1)}.`,
    caption: 'multiplying by $e^{i\\epsilon x}$: the momentum curve slides rigidly to the right and keeps its width',
    stage: W(PK(0, 1), { panels: ['position', 'momentum'], boost: sweep(0, 1.5), readouts: ['pmean', 'pspread'] }),
    derivation: {
      result: 'WHW^\\dagger = H + \\epsilon',
      ground: [
        {
          tex: 'WHW^\\dagger = H - \\tfrac{i\\epsilon}{\\hbar}[\\hat t,H] + \\cdots',
          why: 'Expand $W = e^{-i\\epsilon\\hat t/\\hbar}$ in powers of $\\epsilon$. The first correction is the commutator.',
          view: W(PK(0, 1), { panels: ['position', 'momentum'], boost: 0, readouts: ['pmean'] }),
          viewCaption: 'the twin: no boost yet, the momentum curve sits at 0',
        },
        {
          tex: '[\\hat t,H] = i\\hbar',
          why: 'Suppose $\\hat t$ and $H$ obeyed the same rule as $\\hat x$ and $\\hat p$. The commutator is a plain number, so the series stops here.',
        },
        {
          tex: 'WHW^\\dagger = H + \\epsilon',
          why: 'The correction is $-\\tfrac{i\\epsilon}{\\hbar}\\,i\\hbar = \\epsilon$. Every energy is shifted by $\\epsilon$.',
          view: W(PK(0, 1), { panels: ['position', 'momentum'], boost: 1.5, readouts: ['pmean'] }),
          viewCaption: 'the twin after the boost: every momentum shifted by $\\epsilon$',
        },
      ],
    },
    claims: [
      claim('l13BoostMean', 'a boost by ε = 1.5 moves the mean momentum to 1.5', () => close(V.l13BoostMean, 1.5, 1e-9)),
      claim('l13BoostSd', 'and leaves Δp = 0.5', () => close(V.l13BoostSd, 0.5, 1e-9)),
      claim('l13WpWdag', 'e^{−iεx̂} p̂ e^{iεx̂} = p̂ + ε (residual zero)', () => V.l13WpWdag < 1e-9),
    ],
  },
  {
    id: 'l13-time:b4',
    phase: 'lecture',
    text: 'But energies have a lowest value, $E \\ge E_0$ (the [[lowest-energy|lowest energy]]). A free particle has $E = \\tfrac{p^2}{2m} \\ge 0$, and a negative shift would need states below it. Read this carefully. Time evolution changes the phases of existing energy components. Clocks and time intervals are measurable. Pauli’s argument rules out a universal operator conjugate to a Hamiltonian that is bounded below, not every time observable.',
    caption: 'the phase clocks of Lecture 11: time passes, and the energies stay where they are',
    stage: K(sweep(0, 90)),
  },
  {
    id: 'l13-time:b5',
    phase: 'lecture',
    text: 'The notes’ four points. The state is a ket, and wavefunctions are its components. In the position basis $\\hat x = x$ and $\\hat p = -i\\hbar\\,d/dx$; in the momentum basis $\\hat p = p$ and $\\hat x = i\\hbar\\,d/dp$. The differential equation is the abstract law written in the position basis. And $H$ generates time shifts without a universal energy-shifting operator: time says when the positions are predicted.',
    caption: 'one state in two representations while time runs',
    stage: W(PK(0, 1, 3), { panels: ['position', 'momentum'], time: sweep(0, 2) }),
  },
  {
    id: 'l13-time:b6',
    phase: 'books',
    text: `Townsend §6.3 (pp. 199–200, Eqs. 6.33–6.36) shows that momentum is conserved exactly when $H$ commutes with $\\hat p$. That is the case when $V$ does not depend on $x$: the spatial twin of energy conservation. Our example: for the potential $V = \\tfrac{x^2}{2}$ and a packet centred at $x_0 = 2\\ell$, the force gives $d\\langle p\\rangle/dt = -\\langle V'\\rangle = -2$ in units $\\hbar/\\ell$ per unit time.`,
    caption: 'the packet at 2 with $\\hat p\\psi$ dashed: a force pushes the mean momentum down',
    stage: W(PK(2, 1), { overlay: ['ppsi'] }),
    refs: [townsend('§6.3, pp. 199–200', 'Momentum is conserved when $H$ commutes with $\\hat p$; Ehrenfest’s relations for $d\\langle x\\rangle/dt$ and $d\\langle p\\rangle/dt$.')],
    claims: [claim('l13EhrenfestDpDt', 'd⟨p⟩/dt = −⟨V′⟩ = −2 for V = x²/2 and a packet at 2', () => close(V.l13EhrenfestDpDt, -2, 1e-9))],
  },
  {
    id: 'l13-time:b7',
    phase: 'clue',
    text: 'Why would shifting every free-particle energy by $-1$ break something?',
    stage: W(PL(0), { show: ['re'] }),
    reveal: {
      text: `The lowest free energy is ${d(V.l13MinFreeEnergy, 1)}, at $p = 0$. A shift by $-1$ would need an energy below it, and the spectrum has no such state.`,
      caption: 'the momentum curve of a packet: it reaches down to $p = 0$ and beyond, but the energy $\\tfrac{p^2}{2m}$ never goes below zero',
      stage: W(PK(0, 1), { panels: ['momentum'], readouts: ['pmean'] }),
      claims: [claim('l13MinFreeEnergy', 'the lowest free energy is 0', () => Math.abs(V.l13MinFreeEnergy) < 1e-12)],
    },
  },
]

export const L13_STORY: Record<string, Beat[]> = {
  'l13-delta': delta,
  'l13-generator': generator,
  'l13-plane-wave': planeWave,
  'l13-momentum-space': momentumSpace,
  'l13-two-bases': twoBases,
  'l13-schrodinger': schrodinger,
  'l13-time': time,
}

/** Every claim of a unit's beats, reveals and derivation steps (each unit's `claims`: the number reader backs a unit's prose with it). */
const claimsOf = (beats: Beat[]): Claim[] => beats.flatMap((b) => [...(b.claims ?? []), ...(b.reveal?.claims ?? []), ...(b.derivation?.ground ?? []).flatMap((s) => s.claims ?? [])])
export const L13_UNIT_CLAIMS: Record<string, Claim[]> = Object.fromEntries(Object.entries(L13_STORY).map(([id, beats]) => [id, claimsOf(beats)]))
