/**
 * Lecture 6 scroll story (owner: P). Beats per docs/roles/proposals/P-L6-story.md §1, with the judge's rulings:
 * Lecture 5 owns the basis-change machinery, so `l6-active:b1` is a one-beat link-back to Units 5.3–5.5 that defines
 * nothing, and the second passes over Lecture 5's averages (`l6-bloch:b2`, `b7`, `l6-equator:b8`) name Unit 5.1 and
 * add only what is new. Notation (Q1): the notes' equatorial θ is written φ, stated once (`l6-equator:b4`); the
 * rotation angle is φ and a starting longitude φ₀; θ stays the polar angle. No rotation goes past 180°: the 360° sign
 * is Lecture 7 §7.2. The time-evolution beat (`l6-generator:b7`) and the mixtures unit are badged beyond the lecture.
 *
 * Rules kept here (as in L1–L5.story.ts):
 * - Stage states carry physics inputs only; the resolver computes every probability. Numbers in the prose come
 *   from L6.values.ts and are backed by keyed claims.
 * - Clue beats are click-to-reveal: `text` is the question, `reveal` the reasoning.
 * - Core text: ≤ 25 words per sentence, symbols defined before use (content/symbols.test.ts).
 */
import type { BallState, Beat, BlochState, HilbertPlaneState, HopfState, LabBench, LabState, OperatorState, Ref, StageKind, TermTarget } from './schema'
import type { Anchor } from './stageVocab'
import { V, claim, close, d, pct } from './L6.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const t = (kind: StageKind, anchor: Anchor): TermTarget => ({ kind, anchor })
const bloch = (s: Omit<BlochState, 'kind'>): BlochState => ({ kind: 'bloch', shot: 'B-STD', ...s })
const plane = (s: Omit<HilbertPlaneState, 'kind'>): HilbertPlaneState => ({ kind: 'hilbert-plane', shot: 'H-FLAT', ...s })
/** Operator space with the σ passport (Lecture 4 defined the Pauli matrices); the gauge is off (a₀ = 0 throughout). */
const op = (s: Omit<OperatorState, 'kind'>): OperatorState => ({ kind: 'operator-space', shot: 'O-STD', gauge: false, ...s })
const hopf = (s: Omit<HopfState, 'kind'>): HopfState => ({ kind: 'hopf', mini: true, ...s })
const ball = (s: Omit<BallState, 'kind'>): BallState => ({ kind: 'bloch-ball', shot: 'B-STD', ...s })
const bench = (id: LabBench['id'], source: LabBench['source'], axis: 'z' | 'x', showPrep = false): LabBench =>
  showPrep ? { id, source, showPrep, devices: [{ axis }] } : { id, source, devices: [{ axis }] }
const lab2 = (a: LabBench, b: LabBench): LabState => ({ kind: 'lab-r3', benches: [a, b], readouts: ['fill-bar'], shot: 'L-3Q' })

const sweep = (from: number, to: number) => ({ from, to })
/** ψ★ = cos 30°|+z⟩ + e^{i45°} sin 30°|−z⟩: Bloch angles (60°, 45°). */
const STAR = { thetaDeg: 60, phiDeg: 45 }
/** The notes' halfway state on the equator. */
const EQ45 = { thetaDeg: 90, phiDeg: 45 }
const EQ120 = { thetaDeg: 90, phiDeg: 120 }
const P60 = { thetaDeg: 60, phiDeg: 0 }
/** m̂ = (x̂ + ẑ)/√2, the axis of the half turn hidden in B_{z←x}. */
const M_HAT = { thetaDeg: 45, phiDeg: 0 }
const turnZ = (to: number) => ({ axis: 'z' as const, angleDeg: sweep(0, to) })
const half = (a: '+z' | '-z' | '+x' | '-x' | '+y', b: '+z' | '-z' | '+x' | '-x' | '+y') => ({ mix: [{ of: a, w: 0.5 }, { of: b, w: 0.5 }] })
/** 0.1 rad in degrees. */
const TENTH_RAD_DEG = 0.1 * (180 / Math.PI)

const susskind = (where: string, adds: string): Ref => ({ source: 'susskind', where, adds })
const townsend = (where: string, adds: string): Ref => ({ source: 'townsend', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* l6-bloch — Three averages make a point                                                          */
/* ---------------------------------------------------------------------------------------------- */

const blochUnit: Beat[] = [
  {
    id: 'l6-bloch:b1',
    phase: 'lecture',
    text: `From any state we can compute three averages, $\\langle S_x\\rangle$, $\\langle S_y\\rangle$ and $\\langle S_z\\rangle$. Multiply each by $2/\\hbar$ and use the three as coordinates: $\\vec r = \\tfrac{2}{\\hbar}(\\langle S_x\\rangle, \\langle S_y\\rangle, \\langle S_z\\rangle)$ is the [[bloch-vector|Bloch vector]]. For the state on stage, $\\vec r = (${d(V.l6RStarX)},\\ ${d(V.l6RStarY)},\\ ${d(V.l6RStarZ)})$.`,
    caption: `$\\langle S_x\\rangle = \\langle S_y\\rangle = ${d(V.l6AvgStarX)}\\,\\hbar$ and $\\langle S_z\\rangle = ${d(V.l6AvgStarZ)}\\,\\hbar$ · each dashed line from the {{pt|point}} meets its axis at that coordinate`,
    stage: bloch({ state: STAR, dropLines: ['x', 'y', 'z'], readouts: ['averages'] }),
    terms: { pt: t('bloch', 'point') },
    fidelity: ['bloch-one-point', 'bloch-axes-unitless'],
    claims: [
      claim('l6RStarX', 'r = (0.612, …', () => close(V.l6RStarX, Math.sqrt(6) / 4)),
      claim('l6RStarY', '… 0.612, …', () => close(V.l6RStarY, Math.sqrt(6) / 4)),
      claim('l6RStarZ', '… 0.500)', () => close(V.l6RStarZ, 0.5)),
      claim('l6AvgStarX', '⟨Sx⟩ = 0.306ħ …', () => close(V.l6AvgStarX, Math.sqrt(6) / 8)),
      claim('l6AvgStarY', '… = ⟨Sy⟩ …', () => close(V.l6AvgStarY, Math.sqrt(6) / 8)),
      claim('l6AvgStarZ', '… and ⟨Sz⟩ = 0.250ħ', () => close(V.l6AvgStarZ, 0.25)),
    ],
  },
  {
    id: 'l6-bloch:b2',
    phase: 'lecture',
    text: `Unit 5.1 read these averages off a state’s two $z$ amplitudes: $\\langle S_x\\rangle = \\hbar\\,\\mathrm{Re}\\,\\alpha^*\\beta$, $\\langle S_y\\rangle = \\hbar\\,\\mathrm{Im}\\,\\alpha^*\\beta$ and $\\langle S_z\\rangle = \\tfrac{\\hbar}{2}(|\\alpha|^2 - |\\beta|^2)$. Scaled by $2/\\hbar$, they give $\\vec r = (2\\,\\mathrm{Re}\\,\\alpha^*\\beta,\\ 2\\,\\mathrm{Im}\\,\\alpha^*\\beta,\\ |\\alpha|^2 - |\\beta|^2)$. Here the [[coherence]] is $\\alpha^*\\beta = ${d(V.l6CohStarRe)} + ${d(V.l6CohStarIm)}i$, and the [[population|populations]] are ${d(V.l6PopStarUp, 2)} and ${d(V.l6PopStarDown, 2)}.`,
    caption: `$2\\alpha^*\\beta = ${d(V.l6RStarX)} + ${d(V.l6RStarY)}i$ gives the {{eq|shadow on the equator}}, $(r_x, r_y)$ · $${d(V.l6PopStarUp, 2)} - ${d(V.l6PopStarDown, 2)} = r_z$, the {{h|height}}`,
    stage: bloch({ state: STAR, readouts: ['averages'] }),
    terms: { eq: t('bloch', 'equator'), h: t('bloch', 'z') },
    fidelity: ['bloch-height-populations'],
    claims: [
      claim('l6CohStarRe', 'α*β = 0.306 …', () => close(V.l6CohStarRe, Math.sqrt(6) / 8)),
      claim('l6CohStarIm', '… + 0.306i', () => close(V.l6CohStarIm, Math.sqrt(6) / 8)),
      claim('l6PopStarUp', 'populations 0.75 …', () => close(V.l6PopStarUp, 0.75)),
      claim('l6PopStarDown', '… and 0.25', () => close(V.l6PopStarDown, 0.25)),
      claim('l6RStarX', '2α*β = 0.612 …', () => close(V.l6RStarX, 2 * V.l6CohStarRe)),
      claim('l6RStarY', '… + 0.612i', () => close(V.l6RStarY, 2 * V.l6CohStarIm)),
    ],
  },
  {
    id: 'l6-bloch:b3',
    phase: 'lecture',
    text: `Every state written as one ket, $\\alpha|{+z}\\rangle + \\beta|{-z}\\rangle$, lands at distance 1 from the centre: $|\\vec r|^2 = 4|\\alpha|^2|\\beta|^2 + (|\\alpha|^2 - |\\beta|^2)^2 = (|\\alpha|^2 + |\\beta|^2)^2 = 1$. So these states lie on the surface of a unit sphere, the [[bloch-sphere|Bloch sphere]]. For our state, $${d(V.l6UnitCross, 2)} + ${d(V.l6UnitHeight, 2)} = 1$.`,
    caption: `$4|\\alpha|^2|\\beta|^2 = ${d(V.l6UnitCross, 2)}$ and $(|\\alpha|^2 - |\\beta|^2)^2 = ${d(V.l6UnitHeight, 2)}$ · the {{pt|point}} sweeps down a half circle and never leaves the surface`,
    stage: bloch({ state: { thetaDeg: sweep(0, 180), phiDeg: 45 }, trail: true }),
    terms: { pt: t('bloch', 'point') },
    claims: [
      claim('l6UnitSphere', '|r| = 1 at every sampled polar angle and for every fixture state', () => close(V.l6UnitSphere, 1)),
      claim('l6UnitCross', '4|α|²|β|² = 0.75 …', () => close(V.l6UnitCross, 0.75)),
      claim('l6UnitHeight', '… and (|α|² − |β|²)² = 0.25', () => close(V.l6UnitHeight, 0.25)),
    ],
  },
  {
    id: 'l6-bloch:b4',
    phase: 'lecture',
    text: 'Now place the six states we know. $|{\\pm z}\\rangle$ land on the poles $(0, 0, \\pm1)$, $|{\\pm x}\\rangle$ at $(\\pm1, 0, 0)$ and $|{\\pm y}\\rangle$ at $(0, \\pm1, 0)$ on the equator. Each pair of opposite points is a pair of [[orthogonal]] states.',
    caption: 'poles: $|{\\pm z}\\rangle$ on the {{z|vertical axis}} · the {{pt|point}} tours the equator through $|{+x}\\rangle$, $|{+y}\\rangle$, $|{-x}\\rangle$ and $|{-y}\\rangle$',
    stage: bloch({ state: { thetaDeg: 90, phiDeg: sweep(0, 270) }, trail: true }),
    terms: { z: t('bloch', 'z'), pt: t('bloch', 'point') },
    fidelity: ['bloch-double-angle'],
    claims: [claim('l6SixPoints', 'the six named kets land on (0, 0, ±1), (±1, 0, 0) and (0, ±1, 0)', () => V.l6SixPoints === 1)],
  },
  {
    id: 'l6-bloch:b5',
    phase: 'lecture',
    text: `The three coordinates are averages over many atoms, not three readings of one atom. A single atom sent through any magnet still gives $+\\hbar/2$ or $-\\hbar/2$. For this state a $z$ magnet sends ${pct(V.l6PzRule)} of the atoms up. We treat [[pure-state|pure states]] only, so every point used here lies on the surface.`,
    caption: `along $z$: $P(+) = \\tfrac{1 + r_z}{2} = ${d(V.l6PzRule, 2)}$, read off the {{ax|magnet axis}} and the height alone`,
    stage: bloch({ state: STAR, measure: 'z' }),
    terms: { ax: t('bloch', 'axis-n') },
    fidelity: ['bloch-born', 'bloch-three-ensembles'],
    claims: [
      claim('l6PzRule', '(1 + r_z)/2 = 0.75 …', () => close(V.l6PzRule, 0.75)),
      claim('l6PzRuleBorn', '… the same number as |⟨+z|ψ⟩|²', () => V.l6PzRuleBorn === 1),
    ],
  },
  {
    id: 'l6-bloch:b6',
    phase: 'books',
    text: 'Susskind (§2.5) counts. Two complex amplitudes are four real numbers. Normalization removes one, and the unobservable [[global-phase|overall phase]] removes another. That leaves two, exactly the two angles that fix a direction in space.',
    caption: `two numbers are left: the [[polar-angle|polar angle]] $\\theta$ and the [[azimuth]] $\\varphi$ · the {{pt|point}} sweeps through many pairs; our state has $\\theta = ${d(V.l6TwoTheta, 0)}^\\circ$, $\\varphi = ${d(V.l6TwoPhi, 0)}^\\circ$`,
    stage: bloch({ state: { thetaDeg: sweep(20, 160), phiDeg: sweep(0, 300) }, trail: true }),
    terms: { pt: t('bloch', 'point') },
    refs: [susskind('§2.5', 'Counts the real parameters of a spin state: four, minus normalization, minus the overall phase, leaves the two angles of a direction.')],
    claims: [
      claim('l6TwoTheta', 'ψ★ has polar angle 60° …', () => close(V.l6TwoTheta, 60, 1e-9)),
      claim('l6TwoPhi', '… and azimuth 45°', () => close(V.l6TwoPhi, 45, 1e-9)),
      claim('l6TwoRecover', 'the two angles rebuild the state up to an overall phase', () => V.l6TwoRecover === 1),
    ],
  },
  {
    id: 'l6-bloch:b7',
    phase: 'books',
    text: 'Unit 5.1 met Susskind’s principle (§3.8): every spin state gives + with certainty along some axis, its [[spin-polarization|polarization]] direction. On the sphere that axis is $\\vec r$ itself, so a magnet along $\\vec r$ passes every atom. Townsend writes the state along $\\hat n(\\theta, \\varphi)$ as $\\cos\\tfrac{\\theta}{2}|{+z}\\rangle + e^{i\\varphi}\\sin\\tfrac{\\theta}{2}|{-z}\\rangle$ (Problem 1.3).',
    caption: 'a magnet along the state’s own {{ax|axis}}: every atom reads +',
    stage: bloch({ state: STAR, measure: STAR }),
    terms: { ax: t('bloch', 'axis-n') },
    fidelity: ['bloch-born'],
    refs: [
      susskind('§3.8 (the notes cite printed pp. 90–91)', 'The spin-polarization principle: every pure spin state reads + for certain along one direction. On the sphere that direction is the point itself.'),
      townsend('Problem 1.3, p. 26 (Fig. 1.11)', 'The + state along any direction, written with the two Bloch angles; a book exercise, not course homework.'),
    ],
    claims: [
      claim('l6Polarized', 'along r★ the state reads + with probability 1 …', () => close(V.l6Polarized, 1)),
      claim('l6PolarizedMean', '… so its average there is ħ/2', () => close(V.l6PolarizedMean, 0.5)),
      claim('l6TownsendN', 'ψ★ = (cos 30°, e^{i45°} sin 30°)', () => V.l6TownsendN === 1),
    ],
  },
  {
    id: 'l6-bloch:b8',
    phase: 'clue',
    text: '$|{+z}\\rangle$ and $|{-z}\\rangle$ sit at opposite poles. Is $|{-z}\\rangle$ just the vector $-|{+z}\\rangle$?',
    stage: bloch({ state: '-z' }),
    fidelity: ['bloch-double-angle'],
    reveal: {
      text: 'No. $-|{+z}\\rangle$ is $|{+z}\\rangle$ times an [[global-phase|overall sign]], so it sits on the north pole too. $|{-z}\\rangle$ is orthogonal to $|{+z}\\rangle$: 90° apart as vectors, 180° apart on the sphere. Angles on the sphere are twice the angles between state vectors.',
      caption: 'top: $|{-z}\\rangle$ at the south pole · bottom: $|{-z}\\rangle$ at a {{ra|right angle}} to $|{+z}\\rangle$, and $-|{+z}\\rangle$ as a {{gh|second arrow}} for the same state',
      stage: {
        layout: 'split',
        top: bloch({ state: '-z' }),
        bottom: plane({ psi: '+z', others: [{ ket: '-z', role: 'second' }, { ket: { neg: '+z' }, role: 'ghost', badge: 'same state as |+z⟩' }], rightAngle: true }),
      },
      terms: { ra: t('hilbert-plane', 'right-angle'), gh: t('hilbert-plane', 'ghost') },
      fidelity: ['plane-bloch-doubles', 'plane-sign-twice'],
      claims: [
        claim('l6ZOrth', '⟨+z|−z⟩ = 0', () => close(V.l6ZOrth, 0)),
        claim('l6NegSame', '−|+z⟩ is the same state as |+z⟩ …', () => V.l6NegSame === 1),
        claim('l6NegSameZ', '… and its point is the north pole, r_z = 1', () => close(V.l6NegSameZ, 1)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l6-equator — Relative phase sets the longitude                                                  */
/* ---------------------------------------------------------------------------------------------- */

const equator: Beat[] = [
  {
    id: 'l6-equator:b1',
    phase: 'lecture',
    text: 'In $z$ coordinates the four equatorial states are $|{\\pm x}\\rangle = \\tfrac{1}{\\sqrt2}(|{+z}\\rangle \\pm |{-z}\\rangle)$ and $|{\\pm y}\\rangle = \\tfrac{1}{\\sqrt2}(|{+z}\\rangle \\pm i|{-z}\\rangle)$. A $z$ magnet splits every one of them 50/50. They differ only in the factor on $|{-z}\\rangle$ relative to $|{+z}\\rangle$: $1$, $i$, $-1$, $-i$ for $+x$, $+y$, $-x$, $-y$. The angle of that factor is their [[relative-phase|relative phase]].',
    caption: `along $z$: $P(+) = ${d(V.l6EqHalf, 1)}$ at every stop · the relative phase is the {{eq|longitude}}: ${d(V.l6PhaseX, 0)}°, ${d(V.l6PhaseY, 0)}°, ${d(V.l6PhaseMinusX, 0)}° and −${d(-V.l6PhaseMinusY, 0)}°`,
    stage: bloch({ state: { thetaDeg: 90, phiDeg: sweep(0, 270) }, measure: 'z', trail: true }),
    terms: { eq: t('bloch', 'equator') },
    claims: [
      claim('l6EqHalf', 'P(+z) = ½ for |±x⟩ and |±y⟩', () => close(V.l6EqHalf, 0.5)),
      claim('l6PhaseX', 'longitudes: +x at 0°, …', () => close(V.l6PhaseX, 0)),
      claim('l6PhaseY', '… +y at 90°, …', () => close(V.l6PhaseY, 90)),
      claim('l6PhaseMinusX', '… −x at 180°, …', () => close(V.l6PhaseMinusX, 180)),
      claim('l6PhaseMinusY', '… −y at −90°', () => close(V.l6PhaseMinusY, -90)),
    ],
  },
  {
    id: 'l6-equator:b2',
    phase: 'lecture',
    text: 'Halfway from $+x$ to $+y$ the Bloch vector is $\\vec r = (\\tfrac{1}{\\sqrt2}, \\tfrac{1}{\\sqrt2}, 0)$. Its state is $\\tfrac{1}{\\sqrt2}|{+z}\\rangle + \\tfrac{1+i}{2}|{-z}\\rangle$. Compared with $|{+x}\\rangle$, the $|{-z}\\rangle$ part carries an extra factor $\\tfrac{1+i}{\\sqrt2}$. That factor has size 1, so the $z$ outcomes stay 50/50.',
    caption: `$\\beta = ${d(V.l6Psi45BetaRe, 1)} + ${d(V.l6Psi45BetaIm, 1)}i$ and $|\\beta|^2 = ${d(V.l6Psi45Pz, 1)}$ · seen from above, the {{pt|point}} sits at $(${d(V.l6Psi45Rx)},\\ ${d(V.l6Psi45Ry)},\\ 0)$`,
    stage: bloch({ state: EQ45, shot: 'B-POLE' }),
    terms: { pt: t('bloch', 'point') },
    claims: [
      claim('l6Psi45Alpha', 'α = 1/√2', () => close(V.l6Psi45Alpha, Math.SQRT1_2)),
      claim('l6Psi45BetaRe', 'β = 0.5 …', () => close(V.l6Psi45BetaRe, 0.5)),
      claim('l6Psi45BetaIm', '… + 0.5i', () => close(V.l6Psi45BetaIm, 0.5)),
      claim('l6Psi45Rx', 'r = (0.707, …', () => close(V.l6Psi45Rx, Math.SQRT1_2)),
      claim('l6Psi45Ry', '… 0.707, …', () => close(V.l6Psi45Ry, Math.SQRT1_2)),
      claim('l6Psi45Rz', '… 0)', () => close(V.l6Psi45Rz, 0)),
      claim('l6UnitFactor', 'the extra factor (1 + i)/√2 has size 1', () => close(V.l6UnitFactor, 1)),
      claim('l6Psi45Pz', '|β|² = 0.5: still 50/50 along z', () => close(V.l6Psi45Pz, 0.5)),
    ],
  },
  {
    id: 'l6-equator:b3',
    phase: 'lecture',
    text: `Check the position with the averages. Here $\\alpha^*\\beta = \\tfrac{1+i}{2\\sqrt2}$, so $\\langle S_x\\rangle = \\langle S_y\\rangle = \\tfrac{\\hbar}{2\\sqrt2} \\approx ${d(V.l6Avg45X)}\\,\\hbar$ and $\\langle S_z\\rangle = 0$. Equal $x$ and $y$ parts put the point at 45° on the equator.`,
    caption: `$\\langle S_x\\rangle = \\langle S_y\\rangle = ${d(V.l6Avg45X)}\\,\\hbar$ and $\\langle S_z\\rangle = ${d(V.l6Avg45Z, 0)}$ · the {{pt|point}} halfway between $+x$ and $+y$`,
    stage: bloch({ state: EQ45, shot: 'B-POLE', readouts: ['averages'] }),
    terms: { pt: t('bloch', 'point') },
    claims: [
      claim('l6Avg45X', '⟨Sx⟩ = 0.354ħ …', () => close(V.l6Avg45X, Math.SQRT2 / 4)),
      claim('l6Avg45Y', '… = ⟨Sy⟩ …', () => close(V.l6Avg45Y, Math.SQRT2 / 4)),
      claim('l6Avg45Z', '… and ⟨Sz⟩ = 0', () => close(V.l6Avg45Z, 0)),
      claim('l6Coh45Re', 'α*β = (1 + i)/(2√2): real part 0.354 …', () => close(V.l6Coh45Re, Math.SQRT2 / 4)),
      claim('l6Coh45Im', '… imaginary part 0.354', () => close(V.l6Coh45Im, Math.SQRT2 / 4)),
    ],
  },
  {
    id: 'l6-equator:b4',
    phase: 'lecture',
    text: 'Now take any angle $\\varphi$, measured from $+x$ toward $+y$. We need $\\vec r = (\\cos\\varphi, \\sin\\varphi, 0)$, which forces $\\alpha^*\\beta = \\tfrac12 e^{i\\varphi}$ and $|\\alpha|^2 = |\\beta|^2 = \\tfrac12$. Choosing $\\alpha = \\tfrac{1}{\\sqrt2}$ gives $|\\psi(\\varphi)\\rangle = \\tfrac{1}{\\sqrt2}(|{+z}\\rangle + e^{i\\varphi}|{-z}\\rangle)$: the relative phase *is* the longitude.',
    caption: `the notes call this angle θ; here θ is the polar angle, so the longitude is $\\varphi$ · at $\\varphi = 120^\\circ$ the {{pt|point}} is $(-${d(V.l6EqAnyXSize, 1)},\\ ${d(V.l6EqAnyY)},\\ 0)$`,
    stage: bloch({ state: { thetaDeg: 90, phiDeg: sweep(0, 360) }, trail: true, shot: 'B-POLE' }),
    terms: { pt: t('bloch', 'point') },
    fidelity: ['bloch-phase-is-longitude', 'bloch-double-angle'],
    claims: [
      claim('l6EqHalf', '|α|² = |β|² = ½ on the equator', () => close(V.l6EqHalf, 0.5)),
      claim('l6EqAnyX', 'at φ = 120°: r = (−0.5, …', () => close(V.l6EqAnyX, -0.5)),
      claim('l6EqAnyXSize', '(size 0.5) …', () => close(V.l6EqAnyXSize, 0.5)),
      claim('l6EqAnyY', '… 0.866, …', () => close(V.l6EqAnyY, Math.sqrt(3) / 2)),
      claim('l6EqAnyZ', '… 0)', () => close(V.l6EqAnyZ, 0)),
      claim('l6AzimuthIsPhase', 'the azimuth of ψ(φ) is φ at every sampled φ …', () => close(V.l6AzimuthIsPhase, 0)),
      claim('l6ArgIsPhase', '… and so is the phase of β/α', () => close(V.l6ArgIsPhase, 0)),
    ],
  },
  {
    id: 'l6-equator:b5',
    phase: 'books',
    text: 'Townsend (§1.5) derives $|{+y}\\rangle$ from 50/50 data alone. The data fix the relative phase of $|{+y}\\rangle$ only as $\\pm 90^\\circ$, and picking $+90^\\circ$ amounts to picking [[right-handed]] axes. Shifting the relative phase of $|{+x}\\rangle$ by 90° gives $|{+y}\\rangle$ (his §1.6).',
    caption: `$|{+x}\\rangle \\to |{+y}\\rangle$ along the {{eq|equator}}: the relative phase goes from 0° to 90° · along $x$, $P(+)$ falls from ${d(V.l6PlusXAlongX, 0)} for $|{+x}\\rangle$ to ${d(V.l6YX, 1)} for $|{+y}\\rangle$`,
    stage: bloch({ state: '+y', path: { about: 'z' } }),
    terms: { eq: t('bloch', 'equator') },
    refs: [
      townsend('§1.5, pp. 18–20 (eqs. 1.23–1.31, Fig. 1.10)', 'Derives $|{+y}\\rangle$ from 50/50 measurement data alone; the sign of its phase is a choice of right-handed axes.'),
      townsend('§1.6, p. 25 (footnote 13)', 'Relative phases matter: shifting the phase of one component turns $|{+x}\\rangle$ into $|{+y}\\rangle$.'),
    ],
    claims: [
      claim('l6YFromPhase', 'the equatorial state at 90° is |+y⟩', () => V.l6YFromPhase === 1),
      claim('l6YX', '|⟨+y|+x⟩|² = 0.5', () => close(V.l6YX, 0.5)),
      claim('l6PlusXAlongX', '|+x⟩ along x: P(+) = 1', () => close(V.l6PlusXAlongX, 1)),
    ],
  },
  {
    id: 'l6-equator:b6',
    phase: 'books',
    text: 'Susskind (§2.4) shows, in an exercise, that for $|{+y}\\rangle$ the product $\\alpha^*\\beta$ must be [[pure-imaginary|purely imaginary]]. On the sphere that is simply $r_x = 2\\,\\mathrm{Re}\\,\\alpha^*\\beta = 0$: the point sits on the $y$ axis. Real $\\alpha$ and $\\beta$ can never do that with 50/50 odds, so complex amplitudes are forced.',
    caption: `$|{+y}\\rangle$: $\\alpha^*\\beta = ${d(V.l6CohYIm, 1)}i$, so $r_x = ${d(V.l6PlusYRx, 0)}$ and $r_y = ${d(V.l6PlusYRy, 0)}$ · the {{pt|point}} on the $y$ axis`,
    stage: bloch({ state: '+y', shot: 'B-POLE' }),
    terms: { pt: t('bloch', 'point') },
    refs: [susskind('§2.4, Exercise 2.3', 'Shows that the coefficients of his $|i\\rangle$ (our $|{+y}\\rangle$) cannot all be real: the product $\\alpha^*\\beta$ must be purely imaginary.')],
    claims: [
      claim('l6CohYIm', 'for |+y⟩: α*β = 0.5i …', () => close(V.l6CohYIm, 0.5)),
      claim('l6CohYRe', '… with real part 0', () => close(V.l6CohYRe, 0)),
      claim('l6PlusYRx', 'r_x = 0 …', () => close(V.l6PlusYRx, 0)),
      claim('l6PlusYRy', '… r_y = 1', () => close(V.l6PlusYRy, 1)),
      claim('l6EqHalf', 'still 50/50 along z', () => close(V.l6EqHalf, 0.5)),
    ],
  },
  {
    id: 'l6-equator:b7',
    phase: 'clue',
    text: 'The derivation chose $\\alpha = \\tfrac{1}{\\sqrt2}$, real and positive. Did that choice leave any states out?',
    caption: `an overall phase $e^{i\\chi}$ turns from 0° to 180°; the {{pt|point}} stays at $(-${d(V.l6EqAnyXSize, 1)},\\ ${d(V.l6GlobalY)},\\ 0)$`,
    stage: bloch({ state: EQ120, globalPhaseDeg: sweep(0, 180) }),
    terms: { pt: t('bloch', 'point') },
    fidelity: ['bloch-global-phase-hidden'],
    claims: [
      claim('l6EqAnyXSize', 'r_x = −0.5 …', () => close(V.l6EqAnyXSize, 0.5)),
      claim('l6GlobalY', '… r_y = 0.866, with or without the phase', () => close(V.l6GlobalY, Math.sqrt(3) / 2)),
    ],
    reveal: {
      text: 'No. Any other choice multiplies both amplitudes by one common factor $e^{i\\chi}$. That changes the vector but not $\\alpha^*\\beta$ or the sizes, so the point and every prediction stay put. The Hopf picture shows the hidden circle of vectors over each point, its [[hopf-fiber|Hopf fiber]].',
      caption: 'the {{mk|bead}} laps its {{fb|fiber}}: every vector on it is the same state, and the {{mp|mini-sphere point}} never moves',
      stage: hopf({ fibers: 'one', marked: { state: EQ120, globalPhaseDeg: sweep(0, 360) }, shot: 'HF-FIBER' }),
      terms: { mk: t('hopf', 'marker'), fb: t('hopf', 'fiber'), mp: t('hopf', 'mini-point') },
      fidelity: ['hopf-fiber-state', 'hopf-brightness'],
      claims: [
        claim('l6GlobalX', 'i·ψ(120°) has r_x = −0.5 …', () => close(V.l6GlobalX, -0.5)),
        claim('l6GlobalY', '… and r_y = 0.866: the same point', () => close(V.l6GlobalY, V.l6EqAnyY)),
        claim('l6GlobalSame', 'e^{iχ}ψ is the same state at every sampled χ', () => V.l6GlobalSame === 1),
      ],
    },
  },
  {
    id: 'l6-equator:b8',
    phase: 'clue',
    text: 'All four equatorial states give 50/50 along $z$, and so does the [[unpolarized]] oven beam. Could $|{+x}\\rangle$ be an oven beam in disguise?',
    caption: `top: $|{+x}\\rangle$ into a $z$ magnet · bottom: the oven into a $z$ magnet · both {{fb|fill bars}} show ${pct(V.l6PlusXAlongZ)}`,
    stage: lab2(bench('A', '+x', 'z', true), bench('B', 'oven', 'z')),
    terms: { fb: t('lab-r3', 'fill-bar') },
    fidelity: ['lab-born-fractions', 'lab-chips-captions'],
    claims: [
      claim('l6PlusXAlongZ', '|+x⟩ along z: ½ read + …', () => close(V.l6PlusXAlongZ, 0.5)),
      claim('l6OvenAlongZ', '… and the oven: ½', () => close(V.l6OvenAlongZ, 0.5)),
    ],
    reveal: {
      text: `No. Turn both magnets to $x$: the $|{+x}\\rangle$ beam sends ${pct(V.l6PlusXAlongX)} to +, while the oven beam still splits 50/50. A state on the equator is one definite state with its own direction; the oven beam is a [[mixture]]. Unit 5.1 asked the same of $|{+y}\\rangle$, which no magnet on this bench can test.`,
      caption: `along $x$: the {{fb|+ fraction}} is ${pct(V.l6PlusXAlongX)} for $|{+x}\\rangle$ and ${pct(V.l6OvenAlongX)} for the oven`,
      stage: lab2(bench('A', '+x', 'x', true), bench('B', 'oven', 'x')),
      terms: { fb: t('lab-r3', 'fill-bar') },
      fidelity: ['lab-beam-along-y'],
      claims: [
        claim('l6PlusXAlongX', '|+x⟩ along x: every atom reads +', () => close(V.l6PlusXAlongX, 1)),
        claim('l6OvenAlongX', 'the oven along x: ½', () => close(V.l6OvenAlongX, 0.5)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l6-active — Turn the state, keep the axes                                                       */
/* ---------------------------------------------------------------------------------------------- */

const active: Beat[] = [
  {
    id: 'l6-active:b1',
    phase: 'lecture',
    text: 'Unit 5.3 rewrote one state in new coordinates with the [[basis-change-matrix|basis-change matrix]], $\\psi_x = B_{x\\leftarrow z}\\,\\psi_z$. Unit 5.4 let every operator follow, $A^{(x)} = B_{x\\leftarrow z}A^{(z)}B_{z\\leftarrow x}$, and Unit 5.5 found that no prediction changed. That is a [[passive-change|passive change]]: the atom is untouched, and only our description moves.',
    caption: `top, passive: the same {{psi|arrow}} read in the $x$ frame, $(${d(V.l6PassiveU)},\\ ${d(V.l6PassiveV)})$ · bottom: what this chapter builds, the state itself turned from $|{+x}\\rangle$ to $|{+y}\\rangle$`,
    stage: {
      layout: 'split',
      top: plane({ psi: { blochDeg: 60 }, basis: 'x', shadows: true }),
      bottom: bloch({ state: '+x', rotate: turnZ(90), trail: true }),
    },
    terms: { psi: t('hilbert-plane', 'psi') },
    fidelity: ['plane-frame-is-basis', 'plane-frame-turn-passive', 'bloch-one-point'],
    claims: [
      claim('l6PassiveU', 'x coordinates of Lecture 4’s state: (0.966, …', () => close(V.l6PassiveU, Math.cos(Math.PI / 12))),
      claim('l6PassiveV', '… 0.259)', () => close(V.l6PassiveV, Math.sin(Math.PI / 12))),
      claim('l6PassiveMeanX', 'in x coordinates ⟨Sz⟩ = ħ/4 …', () => close(V.l6PassiveMeanX, 0.25)),
      claim('l6PassiveMeanZ', '… as in z coordinates: nothing moved', () => close(V.l6PassiveMeanZ, 0.25)),
      claim('l6ActiveRx', 'Rz(90°)|+x⟩ has r_x = 0 …', () => close(V.l6ActiveRx, 0)),
      claim('l6ActiveRy', '… and r_y = 1: the point moved to +y', () => close(V.l6ActiveRy, 1)),
    ],
  },
  {
    id: 'l6-active:b2',
    phase: 'lecture',
    text: 'The new move is an [[active-rotation|active rotation]]: keep the $z$ basis and change the state itself, so its point moves on the sphere. The last chapter showed that raising the relative phase by $\\varphi$ turns the point by $\\varphi$ around the equator. The matrix $\\mathrm{diag}(1, e^{i\\varphi})$ does exactly that. An overall phase on a matrix changes no physical state, so the standard choice pulls out $e^{-i\\varphi/2}$ and splits the phase evenly. The result is the [[rotation-operator|rotation operator]] $$R_z(\\varphi) = e^{-i\\varphi/2}\\begin{pmatrix}1&0\\\\0&e^{i\\varphi}\\end{pmatrix} = \\begin{pmatrix}e^{-i\\varphi/2}&0\\\\0&e^{i\\varphi/2}\\end{pmatrix}.$$ A state at longitude $\\varphi_0$ goes to longitude $\\varphi_0 + \\varphi$.',
    caption: `start at $\\varphi_0 = 30^\\circ$ and turn by $\\varphi = 60^\\circ$: the {{pt|point}} lands at longitude ${d(V.l6DiagTurns, 0)}° · the notes write the turn angle with the same letter`,
    stage: bloch({ state: { thetaDeg: 90, phiDeg: 30 }, rotate: turnZ(60), trail: true, shot: 'B-POLE' }),
    terms: { pt: t('bloch', 'point') },
    claims: [
      claim('l6DiagTurns', 'diag(1, e^{i60°}) takes longitude 30° to 90°', () => close(V.l6DiagTurns, 90)),
      claim('l6RzEven', 'Rz(φ) = e^{−iφ/2} diag(1, e^{iφ})', () => V.l6RzEven === 1),
      claim('l6RzSameState', 'the two matrices give the same physical state', () => V.l6RzSameState === 1),
    ],
  },
  {
    id: 'l6-active:b3',
    phase: 'lecture',
    text: 'On a state on the equator, $R_z(\\varphi)\\,\\psi_z(\\varphi_0) = e^{-i\\varphi/2}\\,\\psi_z(\\varphi_0 + \\varphi)$. The point moves by $\\varphi$, and an extra overall phase comes along that no measurement can see. For $|{+x}\\rangle$ and $\\varphi = 90^\\circ$ the result is $e^{-i\\pi/4}|{+y}\\rangle$, physically just $|{+y}\\rangle$.',
    caption: `$\\langle{+y}|R_z(90^\\circ)|{+x}\\rangle = e^{-i\\pi/4} = ${d(V.l6Rz90xRe)} - ${d(V.l6Rz90xImSize)}i$ · the {{pt|point}} reaches $+y$`,
    stage: bloch({ state: '+x', rotate: turnZ(90), trail: true, shot: 'B-POLE' }),
    terms: { pt: t('bloch', 'point') },
    fidelity: ['bloch-global-phase-hidden'],
    claims: [
      claim('l6Rz90xRe', '⟨+y|Rz(90°)|+x⟩ = 0.707 …', () => close(V.l6Rz90xRe, Math.SQRT1_2)),
      claim('l6Rz90xIm', '… − 0.707i …', () => close(V.l6Rz90xIm, -Math.SQRT1_2)),
      claim('l6Rz90xImSize', '(size 0.707)', () => close(V.l6Rz90xImSize, Math.SQRT1_2)),
      claim('l6Rz90xState', 'Rz(90°)|+x⟩ is |+y⟩ up to phase', () => V.l6Rz90xState === 1),
    ],
  },
  {
    id: 'l6-active:b4',
    phase: 'lecture',
    text: 'Four checks can be read straight off the diagonal. $R_z(0) = I$, and $R_z(\\varphi)^\\dagger R_z(\\varphi) = I$, so $R_z$ is [[unitary]] and lengths and probabilities survive the turn. $R_z(-\\varphi) = R_z(\\varphi)^\\dagger$ undoes it. And $R_z(\\varphi_2)R_z(\\varphi_1) = R_z(\\varphi_1 + \\varphi_2)$, so turns about one axis add.',
    caption: 'a turn of 30° and then one of 60° land the {{pt|point}} where a single 90° turn does',
    stage: bloch({ state: '+x', rotate: turnZ(90), trail: true }),
    terms: { pt: t('bloch', 'point') },
    claims: [claim('l6RzProps', 'Rz(0) = I; Rz is unitary; Rz(−φ) = Rz(φ)†; Rz(60°)Rz(30°) = Rz(90°)', () => V.l6RzProps === 1)],
  },
  {
    id: 'l6-active:b5',
    phase: 'lecture',
    text: 'The notes’ reference page applies the turn to any state. It multiplies $\\alpha$ by $e^{-i\\varphi/2}$ and $\\beta$ by $e^{i\\varphi/2}$, so both sizes stay and $\\alpha^*\\beta$ gains the factor $e^{i\\varphi}$. So $(\\langle S_x\\rangle, \\langle S_y\\rangle)$ turns [[counterclockwise-turn|counterclockwise]] by $\\varphi$, while $\\langle S_z\\rangle$ stays. Along any axis $\\hat n$ the odds are $p_\\pm = \\tfrac12 \\pm \\langle S_n\\rangle/\\hbar$, so every prediction turns with the arrow.',
    caption: `$\\langle S_z\\rangle = ${d(V.l6SzKept, 2)}\\,\\hbar$ throughout · the {{pt|point}} swings toward the {{ax|y magnet}}, and $P(+)$ goes from ${d(V.l6PyBefore)} to ${d(V.l6PyAfter)}`,
    stage: bloch({ state: P60, rotate: turnZ(90), measure: 'y', trail: true, readouts: ['averages'] }),
    terms: { pt: t('bloch', 'point'), ax: t('bloch', 'axis-n') },
    fidelity: ['bloch-rotation-exact', 'bloch-sweep-speed'],
    claims: [
      claim('l6Psi60Rx', 'before: r = (0.866, 0, …', () => close(V.l6Psi60Rx, Math.sqrt(3) / 2)),
      claim('l6Psi60Rz', '… 0.5)', () => close(V.l6Psi60Rz, 0.5)),
      claim('l6TurnedRx', 'after Rz(90°): r = (0, …', () => close(V.l6TurnedRx, 0)),
      claim('l6TurnedRy', '… 0.866, 0.5)', () => close(V.l6TurnedRy, Math.sqrt(3) / 2)),
      claim('l6SzKept', '⟨Sz⟩ = 0.25ħ at every sampled angle of the turn', () => close(V.l6SzKept, 0.25)),
      claim('l6PyBefore', 'P(+y) = 0.500 before …', () => close(V.l6PyBefore, 0.5)),
      claim('l6PyAfter', '… and 0.933 after', () => close(V.l6PyAfter, (2 + Math.sqrt(3)) / 4)),
      claim('l6SyAfter', '= ½ + ⟨Sy⟩/ħ with ⟨Sy⟩ = 0.433ħ', () => close(V.l6PyAfter, 0.5 + V.l6SyAfter) && close(V.l6SyAfter, Math.sqrt(3) / 4)),
      claim('l6So3', 'the average arrow turns like an ordinary 3-vector (quaternion route), also about tilted axes', () => close(V.l6So3, 0, 1e-12)),
    ],
  },
  {
    id: 'l6-active:b6',
    phase: 'books',
    text: 'Townsend (§2.2) builds the same operator for a counterclockwise turn about $z$, seen from $+z$. His results match ours: $90^\\circ$ takes $|{+x}\\rangle$ to $e^{-i\\pi/4}|{+y}\\rangle$, and $180^\\circ$ takes it to $|{-x}\\rangle$ up to a phase. In §2.5 he adds that turning the state one way matches turning the axes the other way.',
    caption: '$R_z(180^\\circ)|{+x}\\rangle = -i\\,|{-x}\\rangle$: the {{pt|point}} ends diametrically opposite, at $-x$ on the {{eq|equator}}',
    stage: bloch({ state: '+x', rotate: turnZ(180), trail: true, shot: 'B-POLE' }),
    terms: { pt: t('bloch', 'point'), eq: t('bloch', 'equator') },
    refs: [
      townsend('§2.2, pp. 33–35 and 39–41 (eqs. 2.25–2.28, 2.41–2.42, Ex. 2.2)', 'The rotation operator about $z$, its unitarity, and worked turns of $|{+x}\\rangle$ by 90° and 180°. His operator for a turn by φ about k is our $R_z(\\varphi)$.'),
      townsend('§2.5, pp. 52–54 (Fig. 2.9)', 'Active versus passive: turning the state one way is equivalent to turning the axes the other way.'),
    ],
    claims: [
      claim('l6Rz180xIm', '⟨−x|Rz(180°)|+x⟩ = −i …', () => close(V.l6Rz180xIm, -1)),
      claim('l6Rz180xRe', '… with real part 0', () => close(V.l6Rz180xRe, 0)),
      claim('l6Rz180xState', 'Rz(180°)|+x⟩ is |−x⟩ up to phase', () => V.l6Rz180xState === 1),
    ],
  },
  {
    id: 'l6-active:b7',
    phase: 'clue',
    text: 'Turn $|{+z}\\rangle$ about $z$ by $\\varphi$. Where does its point go?',
    stage: bloch({ state: '+z', rotate: turnZ(180) }),
    fidelity: ['bloch-global-phase-hidden'],
    reveal: {
      text: `Nowhere. $R_z(\\varphi)|{+z}\\rangle = e^{-i\\varphi/2}|{+z}\\rangle$ is only an overall phase, because $|{+z}\\rangle$ lies on the turning axis, like a top spun about its own axis (Townsend, Fig. 2.3). In the Hopf picture the point stays, and the vector slides back along its fiber by $\\varphi/2$. A [[superposition]] picks up two *different* phases, so its relative phase changes and its point moves. Turned by $90^\\circ$, Lecture 4’s state $\\cos 30^\\circ|{+z}\\rangle + \\sin 30^\\circ|{-z}\\rangle$ matches its old self with probability only ${d(V.l6SuperOverlap)}.`,
      caption: `at $\\varphi = 90^\\circ$ the vector is $(${d(V.l6RzPlusZRe)} - ${d(V.l6RzPlusZRe)}i)\\,|{+z}\\rangle$: the {{mk|bead}} has slid, the {{mp|mini-sphere point}} has not`,
      stage: hopf({ fibers: 'pair', marked: { state: '+z', rotate: turnZ(180) }, shot: 'HF-PAIR' }),
      terms: { mk: t('hopf', 'marker'), mp: t('hopf', 'mini-point') },
      fidelity: ['hopf-fiber-state', 'hopf-mini-exact', 'hopf-rotation-slides'],
      claims: [
        claim('l6RzPlusZRe', 'Rz(90°)|+z⟩ = (0.707 …', () => close(V.l6RzPlusZRe, Math.SQRT1_2)),
        claim('l6RzPlusZIm', '… − 0.707i)|+z⟩', () => close(V.l6RzPlusZIm, -Math.SQRT1_2)),
        claim('l6RzPlusZState', 'Rz(φ)|+z⟩ is |+z⟩ up to phase at every sampled φ ≤ 180°', () => V.l6RzPlusZState === 1),
        claim('l6SuperMoves', 'Lecture 4’s real state does move under Rz(90°) …', () => V.l6SuperMoves === 0),
        claim('l6SuperOverlap', '… its overlap with itself drops to 0.625', () => close(V.l6SuperOverlap, 0.625)),
      ],
    },
  },
  {
    id: 'l6-active:b8',
    phase: 'clue',
    text: 'Unit 5.3’s matrix $B_{z\\leftarrow x}$ is unitary, just like $R_z(\\varphi)$. Is a change of basis secretly a rotation of the atom?',
    caption: `$B_{z\\leftarrow x}$ happens to be Hermitian as well, so operator space can draw it: its {{ar|arrow}} points along $\\hat m = (\\hat x + \\hat z)/\\sqrt2$, with $a_x = a_z = ${d(V.l6BArrowX)}$`,
    stage: op({ op: { matrix: [['1/sqrt(2)', '1/sqrt(2)'], ['1/sqrt(2)', '-1/sqrt(2)']] }, eigen: true }),
    terms: { ar: t('operator-space', 'arrow-a') },
    fidelity: ['op-length-not-size', 'op-unitary-not-drawn'],
    claims: [
      claim('l6BArrowX', 'B_{z←x} = a·σ with a = (0.707, …', () => close(V.l6BArrowX, Math.SQRT1_2)),
      claim('l6BArrowZ', '… 0, 0.707)', () => close(V.l6BArrowZ, Math.SQRT1_2)),
    ],
    reveal: {
      text: 'As a matrix, almost. $B_{z\\leftarrow x}$ is $i$ times a half turn about $\\hat m$, and that turn swaps the $x$ and $z$ directions. Its [[determinant]] is $-1$, while every turn, such as $R_z(\\varphi)$, has $+1$. That is no mirror: in a $2\\times2$ determinant the phase $i$ counts twice, and $i^2 = -1$. We *use* it passively: the atom is never turned, and we only rename which axis is called $z$.',
      caption: `the half turn about $\\hat m$ carries the {{pt|point}} of $|{+z}\\rangle$ to $|{+x}\\rangle$ · $\\det B_{z\\leftarrow x} = -${d(-V.l6DetB, 0)}$, $\\det R_z = ${d(V.l6DetRz, 0)}$`,
      stage: bloch({ state: '+z', rotate: { axis: M_HAT, angleDeg: sweep(0, 180) }, measure: M_HAT, trail: true }),
      terms: { pt: t('bloch', 'point') },
      fidelity: ['bloch-not-lab-space'],
      claims: [
        claim('l6DetB', 'det B_{z←x} = −1 …', () => close(V.l6DetB, -1)),
        claim('l6DetRz', '… det Rz(φ) = +1', () => close(V.l6DetRz, 1)),
        claim('l6BIsHalfTurn', 'B_{z←x} = i · R_m(180°), m̂ = (x̂ + ẑ)/√2', () => V.l6BIsHalfTurn === 1),
        claim('l6PassiveIsActive', 'ψ★ in x coordinates is, up to phase, the column of ψ★ turned 180° about m̂', () => V.l6PassiveIsActive === 1),
        claim('l6HalfTurnZ', 'that turn sends +z to +x …', () => close(V.l6HalfTurnZ, 1)),
        claim('l6HalfTurnY', '… and +y to −y', () => close(V.l6HalfTurnY, -1)),
      ],
    },
    refs: [
      townsend('§2.5, p. 57 (Ex. 2.5)', 'With the standard phases, his basis-change matrix (our $B_{z\\leftarrow x}$) is not the 90° turn about $y$ that his section started from. It is the same phase issue, seen from the rotation side.'),
    ],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l6-generator — S_z generates the turn                                                           */
/* ---------------------------------------------------------------------------------------------- */

const SZ_OP = op({ op: { named: 'Sz' }, eigen: true })

const generator: Beat[] = [
  {
    id: 'l6-generator:b1',
    phase: 'lecture',
    text: 'What could $e^M$ mean when $M$ is a matrix? Use the same [[power-series|power series]] as for numbers, each power divided by its [[factorial]]: $e^M = I + M + \\tfrac{M^2}{2!} + \\tfrac{M^3}{3!} + \\cdots$, the [[matrix-exponential|matrix exponential]]. Take $M = -\\tfrac{i\\pi}{2\\hbar}S_z$: stopping at the tenth power already matches the exact answer to about $10^{-9}$.',
    caption: `stop after $M^1, M^2, M^3, M^5, M^{10}$: largest error ${d(V.l6SeriesErr1, 2)} · ${d(V.l6SeriesErr2)} · ${d(V.l6SeriesErr3)} · ${d(V.l6SeriesErr5, 4)} · $${(V.l6SeriesErr10 * 1e9).toFixed(0)} \\times 10^{-9}$ · the {{ar|arrow}} is $S_z$`,
    stage: SZ_OP,
    terms: { ar: t('operator-space', 'arrow-a') },
    claims: [
      claim('l6SeriesErr1', 'partial sums of e^M, M = −(iπ/2)Sz: error 0.30 after M¹, …', () => close(V.l6SeriesErr1, 0.3031764802147394, 1e-12)),
      claim('l6SeriesErr2', '… 0.080 after M², …', () => close(V.l6SeriesErr2, 0.07981717251091003, 1e-12)),
      claim('l6SeriesErr3', '… 0.016 after M³, …', () => close(V.l6SeriesErr3, 0.015724606611578214, 1e-12)),
      claim('l6SeriesErr5', '… 0.0003 after M⁵, …', () => close(V.l6SeriesErr5, 0.00032445853158624433, 1e-12)),
      claim('l6SeriesErr10', '… 2 × 10⁻⁹ after M¹⁰', () => V.l6SeriesErr10 > 1e-9 && V.l6SeriesErr10 < 2.5e-9),
      claim('l6SeriesLimit', 'the full exponential is Rz(90°)', () => V.l6SeriesLimit === 1),
    ],
  },
  {
    id: 'l6-generator:b2',
    phase: 'lecture',
    text: 'Every power of a [[diagonal-matrix|diagonal matrix]] is diagonal, so $\\exp\\begin{pmatrix}a&0\\\\0&b\\end{pmatrix} = \\begin{pmatrix}e^a&0\\\\0&e^b\\end{pmatrix}$. Since $S_z = \\tfrac{\\hbar}{2}\\,\\mathrm{diag}(1, -1)$, the exponent $-\\tfrac{i\\varphi}{\\hbar}S_z$ is $\\mathrm{diag}(-\\tfrac{i\\varphi}{2}, \\tfrac{i\\varphi}{2})$. Its exponential is exactly the $R_z(\\varphi)$ built by hand in the last chapter.',
    caption: `at $\\varphi = ${d(V.l6ExpAngle, 1)}$: $-\\tfrac{i\\varphi}{\\hbar}S_z = \\mathrm{diag}(-${d(V.l6ExpDiagTopSize, 1)}i,\\ ${d(V.l6ExpDiagBottom, 1)}i)$, and its exponential is $R_z$ · the {{ar|arrow}} is still $S_z$`,
    stage: SZ_OP,
    terms: { ar: t('operator-space', 'arrow-a') },
    claims: [
      claim('l6ExpAngle', 'Rz(1.2) multiplies β by e^{0.6i}: the angle is 1.2', () => close(V.l6ExpAngle, 1.2)),
      claim('l6ExpDiagTop', '−(i·1.2)Sz = diag(−0.6i, …', () => close(V.l6ExpDiagTop, -0.6)),
      claim('l6ExpDiagTopSize', '(size 0.6) …', () => close(V.l6ExpDiagTopSize, 0.6)),
      claim('l6ExpDiagBottom', '… 0.6i)', () => close(V.l6ExpDiagBottom, 0.6)),
      claim('l6ExpIsRz', 'its exponential is Rz(1.2)', () => V.l6ExpIsRz === 1),
    ],
  },
  {
    id: 'l6-generator:b3',
    phase: 'lecture',
    text: 'So $R_z(\\varphi) = \\exp(-i\\varphi S_z/\\hbar)$. The angle has no units and neither has $S_z/\\hbar$, so the exponent is a plain number times a matrix. In [[operator-space|operator space]] the arrow of $S_z$ points along the turning axis. Its eigenstates $|{\\pm z}\\rangle$ are the two points the turn leaves in place.',
    caption: `the [[generator]] $S_z$: {{ep|eigenstates}} at the ends of the turning axis, eigenvalues $\\pm${d(V.l6SzEigUp, 1)}\\,\\hbar$ · below, the {{pt|point}} circles that axis`,
    stage: {
      layout: 'split',
      top: SZ_OP,
      bottom: bloch({ state: P60, rotate: turnZ(180), trail: true }),
    },
    terms: { ep: t('operator-space', 'eigen-plus'), pt: t('bloch', 'point') },
    fidelity: ['op-generator-axis', 'op-length-not-size'],
    claims: [
      claim('l6SzEigUp', 'Sz has eigenvalues 0.5 …', () => close(V.l6SzEigUp, 0.5)),
      claim('l6SzEigDown', '… and −0.5 (ħ = 1)', () => close(V.l6SzEigDown, -0.5)),
      claim('l6SzEigVecs', 'with eigenvectors |+z⟩ and |−z⟩', () => V.l6SzEigVecs === 1),
      claim('l6PolesFixed', 'Rz leaves |±z⟩ in place, up to phase', () => V.l6PolesFixed === 1),
    ],
  },
  {
    id: 'l6-generator:b4',
    phase: 'lecture',
    text: `For a [[infinitesimal|tiny angle]] $d\\varphi$, keep only the first two terms: $R_z(d\\varphi) = I - \\tfrac{i}{\\hbar}S_z\\,d\\varphi + O(d\\varphi^2)$. Here the [[big-o|big-O term]] $O(d\\varphi^2)$ stands for leftovers no bigger than a fixed multiple of $d\\varphi^2$. At a tenth of a radian the leftover is about ${d(V.l6LinErr01, 5)}. At a hundredth it is a hundred times smaller.`,
    caption: `a ten times smaller angle, a hundred times smaller leftover: the ratio is ${d(V.l6LinRatio, 0)} · the {{pt|point}} barely starts to move`,
    stage: bloch({ state: '+x', rotate: turnZ(TENTH_RAD_DEG), trail: true, shot: 'B-POLE' }),
    terms: { pt: t('bloch', 'point') },
    claims: [
      claim('l6LinErr01', 'at dφ = 0.1 the two-term formula is off by 0.00125', () => close(V.l6LinErr01, 0.0012499131968556475, 1e-12)),
      claim('l6LinRatio', 'at dφ = 0.01 the leftover is about 100 times smaller', () => Math.abs(V.l6LinRatio - 100) < 0.01),
    ],
  },
  {
    id: 'l6-generator:b5',
    phase: 'lecture',
    text: 'Divide the small change by $d\\varphi$ to get a rate: $\\tfrac{d\\psi_z}{d\\varphi} = -\\tfrac{i}{\\hbar}S_z\\,\\psi_z$. Starting from $|{+x}\\rangle$, this sends the Bloch arrow toward $+y$, one radian of turn per radian of $\\varphi$. So $S_z$ is the [[generator]] of turns about $z$: it says how the state starts to move, and $R_z(\\varphi)$ carries out the whole turn.',
    caption: `$-\\tfrac{i}{\\hbar}S_z|{+x}\\rangle = (-${d(V.l6RateTopImSize)}i,\\ ${d(V.l6RateBottomIm)}i)$ · the {{pt|point}} sets off toward $+y$`,
    stage: bloch({ state: '+x', rotate: turnZ(30), trail: true, shot: 'B-POLE' }),
    terms: { pt: t('bloch', 'point') },
    claims: [
      claim('l6RateTopIm', '−iSz|+x⟩ = (−0.354i, …', () => close(V.l6RateTopIm, -Math.SQRT2 / 4)),
      claim('l6RateTopImSize', '(size 0.354) …', () => close(V.l6RateTopImSize, Math.SQRT2 / 4)),
      claim('l6RateBottomIm', '… 0.354i)', () => close(V.l6RateBottomIm, Math.SQRT2 / 4)),
      claim('l6RateFd', 'a finite difference of Rz(φ)|+x⟩ at φ = 0 agrees', () => V.l6RateFd === 1),
      claim('l6GenIsSz', 'i(Rz(h) − Rz(−h))/2h recovers Sz', () => V.l6GenIsSz === 1),
      claim('l6BlochVelY', 'the Bloch velocity ẑ × r is (0, 1, 0) …', () => close(V.l6BlochVelY, 1)),
      claim('l6BlochVelFd', '… as a finite difference of the turned point confirms', () => V.l6BlochVelFd === 1),
    ],
  },
  {
    id: 'l6-generator:b6',
    phase: 'books',
    text: `Townsend (§2.2) runs the argument the other way round, and writes $\\hat J_z$ for our $S_z$. He starts from the small turn $1 - \\tfrac{i}{\\hbar}\\hat J_z\\,d\\varphi$ and builds a finite turn from $N$ equal small turns: $(1 - \\tfrac{i}{\\hbar}\\hat J_z\\tfrac{\\varphi}{N})^N \\to e^{-i\\hat J_z\\varphi/\\hbar}$. For a 90° turn the gap to $R_z$ shrinks like $1/N$: ${d(V.l6Compound10)} at $N = 10$ and ${d(V.l6Compound1000, 4)} at $N = 1000$.`,
    caption: `$N = 1, 10, 100, 1000$ small turns: the gap is ${d(V.l6Compound1, 2)}, ${d(V.l6Compound10)}, ${d(V.l6Compound100, 4)}, ${d(V.l6Compound1000, 5)} · the {{pt|point}} makes the 90° turn`,
    stage: bloch({ state: '+x', rotate: turnZ(90), trail: true, shot: 'B-POLE' }),
    terms: { pt: t('bloch', 'point') },
    refs: [townsend('§2.2, pp. 36–37 (eqs. 2.29–2.32)', 'Builds a finite rotation from many infinitesimal ones. His generator is the $z$ angular momentum, which for spin ½ is our $S_z$ (he fixes its eigenvalues on pp. 38–39).')],
    claims: [
      claim('l6Compound1', '(I − iφSz/N)^N against Rz(90°): gap 0.30 at N = 1, …', () => close(V.l6Compound1, V.l6SeriesErr1, 1e-12)),
      claim('l6Compound10', '… 0.031 at N = 10, …', () => Math.abs(V.l6Compound10 - 0.03127) < 1e-5),
      claim('l6Compound100', '… 0.0031 at N = 100, …', () => Math.abs(V.l6Compound100 - 0.003089) < 1e-6),
      claim('l6Compound1000', '… 0.0003 at N = 1000', () => Math.abs(V.l6Compound1000 - 0.0003085) < 1e-7),
    ],
  },
  {
    id: 'l6-generator:b7',
    phase: 'books',
    text: 'Susskind (§4.5) builds change in *time* the same way. Over a short time $\\varepsilon$ the step is $I - i\\varepsilon H/\\hbar$, with the [[hamiltonian|Hamiltonian]] $H$ as its generator. Keeping lengths fixed forces $H$ to be [[hermitian|Hermitian]]. For a spin in a field along $z$, $H$ is proportional to $S_z$ (§4.11), so waiting in that field turns the spin about $z$.',
    caption: 'with $H = S_z$ in suitable units, waiting a time $t$ is exactly $R_z(t)$: the {{pt|point}} turns as time passes',
    stage: bloch({ state: P60, rotate: turnZ(180), trail: true }),
    terms: { pt: t('bloch', 'point') },
    beyondLecture: true,
    refs: [susskind('§4.5, §4.11', 'Time evolution by small unitary steps whose generator is the Hamiltonian; for a spin in a field along z the Hamiltonian is a multiple of σz, so the state turns about z.')],
    claims: [claim('l6EvolveIsRz', 'e^{−iSz t} = Rz(t) (checked at t = 1.2)', () => V.l6EvolveIsRz === 1)],
  },
  {
    id: 'l6-generator:b8',
    phase: 'clue',
    text: 'Why the $-i$? Would $R_z(d\\varphi) = I + S_z\\,d\\varphi/\\hbar$ do the same job?',
    stage: SZ_OP,
    reveal: {
      text: `No. Take a small number $\\varepsilon$, say a tenth. Then $I + \\varepsilon S_z/\\hbar$ stretches $|{+z}\\rangle$ to length ${d(V.l6NoI, 2)}, a first-order change, so the probabilities would stop adding up to 1. With the $-i$, $(I - i\\varepsilon S/\\hbar)^\\dagger(I - i\\varepsilon S/\\hbar) = I + \\varepsilon^2S^2/\\hbar^2$ for any Hermitian $S$, so the length is off only at second order: ${d(V.l6WithI, 5)}. Townsend’s footnote 5 makes the same point: the $i$ lets the generator be Hermitian.`,
      claims: [
        claim('l6NoI', '|(I + 0.1 Sz)|+z⟩| = 1.05', () => close(V.l6NoI, 1.05)),
        claim('l6WithI', '|(I − 0.1i Sz)|+z⟩| = 1.00125', () => close(V.l6WithI, Math.sqrt(1 + 0.0025))),
      ],
    },
    refs: [townsend('§2.2, p. 37 (footnote 5)', 'Without the $i$ the generator of a unitary turn could not be Hermitian.')],
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l6-mixture — Superposition or mixture? (beyond the lecture)                                     */
/* ---------------------------------------------------------------------------------------------- */

const mixture: Beat[] = [
  {
    id: 'l6-mixture:b1',
    phase: 'books',
    text: 'The notes stop at pure states, on the surface. Townsend (§5.7) adds [[mixture|mixtures]]: beams in which different atoms were prepared in different states, like the oven beam. No single ket describes a mixture. It is a point *inside* the sphere, at the weighted average of its ingredients’ Bloch vectors. The oven beam sits at the centre of this [[bloch-ball|Bloch ball]].',
    caption: `$|{+x}\\rangle$ is the {{pt|point}} on the surface, $|\\vec r| = ${d(V.l6BallPlusX, 0)}$ · the oven sits at the {{c|centre}}, $|\\vec r| = ${d(V.l6BallOvenLen, 0)}$`,
    stage: ball({ point: '+x', compare: 'oven' }),
    terms: { pt: t('bloch-ball', 'point'), c: t('bloch-ball', 'center') },
    fidelity: ['ball-surface-pure', 'ball-inside-not-partly-up'],
    refs: [townsend('§5.7, pp. 171–174', 'Pure and mixed beams: a beam whose atoms were prepared in different states is described by a density operator, not by one ket.')],
    claims: [
      claim('l6BallPlusX', '|+x⟩ has r = (1, 0, 0)', () => close(V.l6BallPlusX, 1)),
      claim('l6BallOvenLen', 'the oven (½ +z, ½ −z) has r = 0', () => close(V.l6BallOvenLen, 0)),
    ],
  },
  {
    id: 'l6-mixture:b2',
    phase: 'books',
    text: 'Inside the ball the same rule gives the odds: along a magnet axis $\\hat n$, $P(+) = \\tfrac{1 + \\hat n\\cdot\\vec r}{2}$. Sweep the magnet through the $x$–$z$ plane. For $|{+x}\\rangle$ the chance rises and falls with the angle, but for the oven beam it never leaves ½.',
    caption: `at a 60° tilt: $|{+x}\\rangle$ gives ${d(V.l6BallP60Pure)} and the oven ${d(V.l6BallP60Oven)} along the {{ax|magnet axis}}`,
    stage: ball({ point: '+x', compare: 'oven', measure: { tiltDeg: sweep(0, 180) } }),
    terms: { ax: t('bloch-ball', 'axis-n') },
    fidelity: ['ball-born-inside'],
    claims: [
      claim('l6BallP60Pure', 'at a 60° tilt: |+x⟩ gives 0.933 …', () => close(V.l6BallP60Pure, (2 + Math.sqrt(3)) / 4)),
      claim('l6BallP60Oven', '… and the oven ½', () => close(V.l6BallP60Oven, 0.5)),
    ],
  },
  {
    id: 'l6-mixture:b3',
    phase: 'books',
    text: 'Different recipes can land on the same point. Half $|{+z}\\rangle$ with half $|{-z}\\rangle$ sits at the centre, and so does half $|{+x}\\rangle$ with half $|{-x}\\rangle$. No measurement can tell those two beams apart, so the ball keeps only the point.',
    caption: `two recipes, one {{pt|point}}: $\\vec r = ${d(V.l6RecipesLen, 0)}$, so $P(+) = ${d(V.l6RecipesP, 1)}$ along every axis`,
    stage: ball({ point: half('+z', '-z'), compare: half('+x', '-x'), recipe: true }),
    terms: { pt: t('bloch-ball', 'point') },
    fidelity: ['ball-many-recipes'],
    refs: [townsend('§5.7, Example 5.5(a) and the caution after it, pp. 175–176', 'Rewrites the half-and-half beam of ±x in the z basis and gets exactly the oven’s density operator. The printed page gives its purity as one half.')],
    claims: [
      claim('l6RecipesLen', 'both recipes give r = 0 …', () => close(V.l6RecipesLen, 0)),
      claim('l6RecipesP', '… so P(+) = 0.5 along every sampled axis', () => close(V.l6RecipesP, 0.5)),
    ],
  },
  {
    id: 'l6-mixture:b4',
    phase: 'books',
    text: `Mix half $|{+z}\\rangle$ atoms with half $|{+x}\\rangle$ atoms, and the point sits inside, at $(${d(V.l6MixZXx, 1)}, 0, ${d(V.l6MixZXz, 1)})$, length ${d(V.l6MixZXLen)}. Add the amplitudes instead, $|{+z}\\rangle + |{+x}\\rangle$ [[normalized]], and you get a new pure state on the surface at $(${d(V.l6SupZXx)}, 0, ${d(V.l6SupZXz)})$. Adding amplitudes makes a new state; mixing beams only averages probabilities. Townsend describes any beam by its [[density-operator|density operator]] $\\rho$, and its [[purity]] $\\mathrm{tr}\\,\\rho^2$ is below 1 for every mixture.`,
    caption: `the mixture, the {{pt|point}}: $|\\vec r| = ${d(V.l6MixZXLen)}$ and purity ${d(V.l6MixZXPurity, 2)} · the superposition, the {{cmp|dot on the surface}}: $|\\vec r| = 1$`,
    stage: ball({ point: half('+z', '+x'), compare: { thetaDeg: 45, phiDeg: 0 }, recipe: true, purity: true, shot: 'B-SECTION' }),
    terms: { pt: t('bloch-ball', 'point'), cmp: t('bloch-ball', 'compare') },
    claims: [
      claim('l6MixZXx', 'the mix sits at (0.5, …', () => close(V.l6MixZXx, 0.5)),
      claim('l6MixZXz', '… 0, 0.5)', () => close(V.l6MixZXz, 0.5)),
      claim('l6MixZXLen', 'length 0.707', () => close(V.l6MixZXLen, Math.SQRT1_2)),
      claim('l6MixZXPurity', 'purity (1 + |r|²)/2 = 0.75 …', () => close(V.l6MixZXPurity, 0.75)),
      claim('l6MixZXPurityRho', '… the same as tr ρ²', () => close(V.l6MixZXPurityRho, 0.75)),
      claim('l6SupZXx', 'the superposition sits at (0.707, …', () => close(V.l6SupZXx, Math.SQRT1_2)),
      claim('l6SupZXz', '… 0, 0.707)', () => close(V.l6SupZXz, Math.SQRT1_2)),
    ],
  },
  {
    id: 'l6-mixture:b5',
    phase: 'books',
    text: `Townsend (§5.7) fills a chamber from two magnets, one giving $|{+z}\\rangle$ atoms and one giving $|{-x}\\rangle$ atoms, half each. The mixture sits at $(-${d(V.l6T55XSize, 1)}, 0, ${d(V.l6T55Z, 1)})$, so $\\langle S_x\\rangle = -\\hbar/4$, and a magnet along $x$ sends only a quarter of the atoms to +. Its purity is ${d(V.l6T55Purity, 2)}, below 1: the mark of a mixture.`,
    caption: `along $x$: $P(+) = ${d(V.l6T55Px, 2)}$ for the {{pt|point}} · the oven’s purity is ${d(V.l6OvenPurity, 1)}`,
    stage: ball({ point: half('+z', '-x'), recipe: true, purity: true, measure: 'x' }),
    terms: { pt: t('bloch-ball', 'point') },
    refs: [townsend('§5.7, Example 5.5(b), pp. 175–176 (Fig. 5.11)', 'A chamber filled half from a z magnet and half from an x magnet. The example finds the density matrix, the average of $S_x$, and a purity below 1.')],
    claims: [
      claim('l6T55X', 'r = (−0.5, …', () => close(V.l6T55X, -0.5)),
      claim('l6T55XSize', '(size 0.5) …', () => close(V.l6T55XSize, 0.5)),
      claim('l6T55Z', '… 0, 0.5)', () => close(V.l6T55Z, 0.5)),
      claim('l6T55Sx', '⟨Sx⟩ = −ħ/4', () => close(V.l6T55Sx, -0.25)),
      claim('l6T55Purity', 'tr ρ² = 0.75', () => close(V.l6T55Purity, 0.75)),
      claim('l6OvenPurity', 'the oven: tr ρ² = 0.5', () => close(V.l6OvenPurity, 0.5)),
      claim('l6T55Px', 'along x: P(+) = 0.25', () => close(V.l6T55Px, 0.25)),
    ],
  },
  {
    id: 'l6-mixture:b6',
    phase: 'clue',
    text: 'Rotations carry pure states around the sphere. What does $R_z(90^\\circ)$ do to the oven beam, and to the mix of half $|{+z}\\rangle$ and half $|{+x}\\rangle$?',
    stage: ball({ point: 'oven', compare: half('+z', '+x'), recipe: true }),
    reveal: {
      text: `Turn every ingredient, then average again. The $|{+z}\\rangle$ atoms stay put, and the $|{+x}\\rangle$ atoms become $|{+y}\\rangle$ atoms. So the mix moves to $(0, ${d(V.l6MixTurnY, 1)}, ${d(V.l6MixTurnZ, 1)})$ at the same length, ${d(V.l6MixTurnLen)}: a turn never changes purity. The oven beam is the one point that every rotation leaves fixed.`,
      caption: 'the {{cmp|mix}} has turned a quarter turn about $z$; the oven at the {{c|centre}} has not moved',
      stage: ball({ point: 'oven', compare: half('+z', '+y'), recipe: true, purity: true }),
      terms: { cmp: t('bloch-ball', 'compare'), c: t('bloch-ball', 'center') },
      fidelity: ['ball-direction-average', 'ball-rotation-rigid'],
      claims: [
        claim('l6MixTurnX', 'after Rz(90°) the mix sits at (0, …', () => close(V.l6MixTurnX, 0)),
        claim('l6MixTurnY', '… 0.5, …', () => close(V.l6MixTurnY, 0.5)),
        claim('l6MixTurnZ', '… 0.5)', () => close(V.l6MixTurnZ, 0.5)),
        claim('l6MixTurnLen', 'at the same length 0.707', () => close(V.l6MixTurnLen, Math.SQRT1_2)),
        claim('l6OvenTurned', 'the oven stays at r = 0', () => close(V.l6OvenTurned, 0)),
      ],
    },
  },
]

export const L6_STORY: Record<string, Beat[]> = {
  'l6-bloch': blochUnit,
  'l6-equator': equator,
  'l6-active': active,
  'l6-generator': generator,
  'l6-mixture': mixture,
}
