/**
 * Lecture 7 scroll story (owner: P). Beats per docs/roles/proposals/P-L7-story.md §1, with the judge's rulings:
 * - Built from notes pp. 1–13 (page 14 is missing). References A and B stay in the story; the text says each time
 *   that the notes keep them outside the class plan.
 * - Link-back beats define nothing and name their unit: `l7-two-angles:b1` → Units 6.1–6.2, `b3` → Unit 1.5;
 *   `l7-full-turn:b1` and the Reference B recaps (`l7-full-turn:b5`, `l7-spreads:b5`) → Unit 6.3; the generator recap
 *   `l7-full-turn:b4` → Unit 6.4; `l7-order:b1` → Units 3.4 and 4.2; `l7-spreads:b1` → Unit 3.6.
 * - Notation: θ is polar, φ the azimuth (φ₀ a starting longitude), R_z(φ) the turn, α and β the amplitudes. The notes'
 *   equatorial θ is our φ (said once, `l7-two-angles:b1`). The notes' common-eigenbasis label |n⟩ is |k⟩ here (n̂ is an
 *   axis), and their axis index i is j (i is the imaginary unit).
 * - Townsend's Example 1.2 slip belongs to Lecture 3's errata; `l7-spreads:b6` mentions it in one sentence.
 * - The stage has no commutator field: `l7-compatible:b4` draws −i[S_x, S_y] from its explicit a-vector 2 a×b.
 *
 * Rules kept here (as in L1–L6.story.ts): stage states carry physics inputs only (the resolver computes every
 * probability); every number in the prose comes from L7.values.ts and is backed by a keyed claim; clue beats are
 * click-to-reveal; core text keeps sentences ≤ 25 words and defines symbols before use.
 */
import type { BallState, Beat, BlochState, HilbertPlaneState, HopfState, LabBench, LabDevice, LabState, OperatorState, Ref, StageKind, TermTarget } from './schema'
import type { Anchor } from './stageVocab'
import type { MatrixGridState, SpinLadderState } from './stage'
import { V, claim, close, d, tf, uf } from './L7.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const t = (kind: StageKind, anchor: Anchor): TermTarget => ({ kind, anchor })
const bloch = (s: Omit<BlochState, 'kind'>): BlochState => ({ kind: 'bloch', shot: 'B-STD', ...s })
const plane = (s: Omit<HilbertPlaneState, 'kind'>): HilbertPlaneState => ({ kind: 'hilbert-plane', shot: 'H-FLAT', ...s })
/** Operator space with the σ passport (Lecture 4 defined the Pauli matrices); the gauge is off unless a beat needs a₀. */
const op = (s: Omit<OperatorState, 'kind'>): OperatorState => ({ kind: 'operator-space', shot: 'O-STD', gauge: false, ...s })
/** The shared matrix grid (Townsend pass): a labelled 2 x 2 matrix drawn from engine inputs, never typed entries. */
const matrix = (s: Omit<MatrixGridState, 'kind'>): MatrixGridState => ({ kind: 'matrix', shot: 'M-GRID', labels: 'spin', ...s })
/** The m ladder of spin j (Townsend pass G2b; stage/svg/spinLadder.ts). */
const ladder = (s: Omit<SpinLadderState, 'kind'>): SpinLadderState => ({ kind: 'spin-ladder', shot: 'SL-LADDER', ...s })
const hopf = (s: Omit<HopfState, 'kind'>): HopfState => ({ kind: 'hopf', mini: true, shot: 'HF-FIBER', ...s })
const ball = (s: Omit<BallState, 'kind'>): BallState => ({ kind: 'bloch-ball', shot: 'B-STD', ...s })
const Z = (keep?: '+' | '-'): LabDevice => (keep ? { axis: 'z', keep } : { axis: 'z' })
const X = (keep?: '+' | '-'): LabDevice => (keep ? { axis: 'x', keep } : { axis: 'x' })
const main = (source: LabBench['source'], devices: LabDevice[]): LabBench => ({ id: 'main', source, showPrep: true, devices })
const lab = (bench: LabBench, s: Omit<LabState, 'kind' | 'benches'> = {}): LabState => ({ kind: 'lab-r3', benches: [bench], shot: 'L-WIDE', ...s })
/** Two benches from |+z⟩: z then x (top, A) and x then z (bottom, B), each keeping + at its first magnet. */
const orders = (bFires: boolean, readouts: LabState['readouts']): LabState => ({
  kind: 'lab-r3',
  benches: [
    { id: 'A', source: '+z', showPrep: true, devices: [Z('+'), X()] },
    bFires ? { id: 'B', source: '+z', showPrep: true, devices: [X('+'), Z()] } : { id: 'B', source: '+z', showPrep: true, devices: [X('+'), Z()], fires: false },
  ],
  readouts,
  shot: 'L-3Q',
})

const sweep = (from: number, to: number) => ({ from, to })
const turnZ = (to: number) => ({ axis: 'z' as const, angleDeg: sweep(0, to) })
/** The generic state of Units 7.5–7.6: θ = 60°, φ = 45°. */
const STAR = { thetaDeg: 60, phiDeg: 45 }
const P60 = { thetaDeg: 60, phiDeg: 0 }
const DEG = Math.PI / 180
/** 0.1 radian in degrees: the small turn of Unit 7.4's commutator beat. */
const E01 = 0.1 / DEG
/** The equator state at azimuth 60 degrees: the kept piece of the Schwarz split vanishes there. */
const EQ60 = { thetaDeg: 90, phiDeg: 60 }
/** The spin along an axis tilted 60° from z toward x, as an operator-space arrow (ħ = 1: length ½). */
const SPIN60: [number, number, number] = [Math.sin(60 * DEG) / 2, 0, Math.cos(60 * DEG) / 2]

const susskind = (where: string, adds: string): Ref => ({ source: 'susskind', where, adds })
const townsend = (where: string, adds: string): Ref => ({ source: 'townsend', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* l7-two-angles — Sphere angles are twice state angles                                            */
/* ---------------------------------------------------------------------------------------------- */

const twoAngles: Beat[] = [
  {
    id: 'l7-two-angles:b1',
    phase: 'lecture',
    text: 'Recall Units 6.1 and 6.2. The [[bloch-vector|Bloch vector]] $\\vec r = \\tfrac{2}{\\hbar}(\\langle S_x\\rangle, \\langle S_y\\rangle, \\langle S_z\\rangle)$ lists the three spin averages. On the equator a $z$ magnet splits 50/50, and the [[relative-phase|relative phase]] $\\varphi$ of $|\\psi(\\varphi)\\rangle = \\tfrac{1}{\\sqrt2}(|{+z}\\rangle + e^{i\\varphi}|{-z}\\rangle)$ sets the direction, $\\vec r = (\\cos\\varphi, \\sin\\varphi, 0)$. Today’s question: how far apart are two such states?',
    caption: `the notes call this angle θ; on our sphere it is the [[azimuth]] $\\varphi$, and θ always means the angle from $+z$ · at $\\varphi = 60^\\circ$ the {{pt|point}} is $(${d(V.l7EqR60x)},\\ ${d(V.l7EqR60y)},\\ 0)$`,
    stage: bloch({ state: { thetaDeg: 90, phiDeg: sweep(0, 360) }, measure: 'z', trail: true, shot: 'B-EQUATOR' }),
    terms: { pt: t('bloch', 'point') },
    fidelity: ['bloch-phase-is-longitude'],
    claims: [
      claim('l7EqHalfZ', 'p(+z) = ½ at every sampled φ on the equator', () => close(V.l7EqHalfZ, 0.5)),
      claim('l7EqR60x', 'at φ = 60°: r = (0.500, …', () => close(V.l7EqR60x, 0.5)),
      claim('l7EqR60y', '… 0.866, …', () => close(V.l7EqR60y, Math.sqrt(3) / 2)),
      claim('l7EqR60z', '… 0)', () => close(V.l7EqR60z, 0)),
    ],
  },
  {
    id: 'l7-two-angles:b2',
    phase: 'lecture',
    text: 'Take two equatorial states, $|\\psi_1\\rangle = |\\psi(\\varphi_1)\\rangle$ and $|\\psi_2\\rangle = |\\psi(\\varphi_2)\\rangle$. Their [[bloch-separation|Bloch separation]] $\\Delta\\varphi$ is the smaller angle between the two arrows, from 0° to 180°. When $\\varphi_2 = \\varphi_1 + \\Delta\\varphi$, the overlap is $\\langle\\psi_1|\\psi_2\\rangle = e^{i\\Delta\\varphi/2}\\cos\\tfrac{\\Delta\\varphi}{2}$. So the chance of finding one state in the other is $\\cos^2\\tfrac{\\Delta\\varphi}{2}$.',
    caption: `the {{ax|magnet along x}} asks “is it $|\\psi(0)\\rangle = |{+x}\\rangle$?” · at $\\Delta\\varphi = 120^\\circ$: $\\langle\\psi(0)|\\psi(120^\\circ)\\rangle = ${d(V.l7Ov120Re, 2)} + ${d(V.l7Ov120Im)}i$, of size ${d(V.l7Ov120Abs, 1)}, so $p(+x) = ${d(V.l7Ov120P, 2)}$`,
    stage: bloch({ state: { thetaDeg: 90, phiDeg: sweep(0, 180) }, measure: 'x', shot: 'B-EQUATOR' }),
    terms: { ax: t('bloch', 'axis-n') },
    claims: [
      claim('l7Ov120Re', '⟨ψ(0)|ψ(120°)⟩ = 0.25 …', () => close(V.l7Ov120Re, 0.25)),
      claim('l7Ov120Im', '… + 0.433i', () => close(V.l7Ov120Im, Math.sqrt(3) / 4)),
      claim('l7Ov120Abs', 'its size is cos 60° = 0.5 …', () => close(V.l7Ov120Abs, 0.5)),
      claim('l7Ov120Arg', '… and its phase is Δφ/2 = 60°', () => close(V.l7Ov120Arg, 60)),
      claim('l7Ov120P', 'p(+x) = cos² 60° = 0.25', () => close(V.l7Ov120P, 0.25)),
      claim('l7Ov90P', 'at Δφ = 90°: p(+x) = 0.5', () => close(V.l7Ov90P, 0.5)),
    ],
  },
  {
    id: 'l7-two-angles:b3',
    phase: 'lecture',
    text: 'Unit 1.5 met this half angle with real states. Now define the [[ray-angle|ray angle]] between two [[state-ray|state rays]], $\\eta = \\arccos|\\langle\\psi_1|\\psi_2\\rangle|$; it ignores every phase. It equals $\\Delta\\varphi/2$, half the angle between the Bloch arrows. Opposite arrows, like $|{+x}\\rangle$ and $|{-x}\\rangle$, are [[orthogonal]] states. Perpendicular ones, like $|{+x}\\rangle$ and $|{+y}\\rangle$, overlap with probability ½.',
    caption: `$|{+x}\\rangle$, $|{-x}\\rangle$: 180° apart on the sphere, $\\eta = ${d(V.l7EtaXmX, 0)}^\\circ$ · $|{+x}\\rangle$, $|{+y}\\rangle$: ${d(V.l7SepXY, 0)}° apart on the {{eq|equator}}, $\\eta = ${d(V.l7EtaXY, 0)}^\\circ$`,
    stage: bloch({ state: '+y', measure: 'x', shot: 'B-EQUATOR' }),
    terms: { eq: t('bloch', 'equator') },
    fidelity: ['bloch-double-angle'],
    claims: [
      claim('l7EtaXmX', 'η(+x, −x) = 90°', () => close(V.l7EtaXmX, 90)),
      claim('l7EtaXY', 'η(+x, +y) = 45° …', () => close(V.l7EtaXY, 45)),
      claim('l7SepXY', '… while their arrows are 90° apart', () => close(V.l7SepXY, 90)),
      claim('l7PXY', 'the overlap probability of +x and +y is ½', () => close(V.l7PXY, 0.5)),
      claim('l7HalfRule', 'η = Δφ/2 for every sampled pair of states, on the equator or off it', () => close(V.l7HalfRule, 0)),
    ],
  },
  {
    id: 'l7-two-angles:b4',
    phase: 'books',
    text: 'Townsend writes any state as $|{+\\hat n}\\rangle = \\cos\\tfrac{\\theta}{2}|{+z}\\rangle + e^{i\\varphi}\\sin\\tfrac{\\theta}{2}|{-z}\\rangle$. The [[polar-angle|polar angle]] θ runs from $+z$ and $\\varphi$ runs around from $+x$: the same letters as our sphere. With both angles free, the half-angle rule holds for any two states. $|{+z}\\rangle$ and the state at $\\theta = 120^\\circ$ are 120° apart, so the probability is $\\cos^2 60^\\circ = \\tfrac14$.',
    caption: `$p(+z) = ${tf(V.l7PzT120)} = \\cos^2(120^\\circ/2)$ along the {{ax|z magnet}}`,
    stage: bloch({ state: { thetaDeg: 120, phiDeg: 0 }, measure: 'z' }),
    terms: { ax: t('bloch', 'axis-n') },
    refs: [
      townsend('Problem 1.3, p. 26', 'The state along any direction, written with the polar and azimuthal angles; cited for notation only (a book exercise, not course homework).'),
      townsend('§2.2, p. 40, eq. (2.42)', 'A 90° turn about $z$ takes $|{+x}\\rangle$ to $|{+y}\\rangle$ up to a phase, and the two overlap with probability one half.'),
    ],
    claims: [
      claim('l7PzT120', 'p(+z) = ¼ for the state at θ = 120° …', () => close(V.l7PzT120, 0.25)),
      claim('l7PzT120Rule', '… = (1 + cos 120°)/2 = cos² 60°', () => close(V.l7PzT120Rule, 0.25)),
      claim('l7HalfRule', 'the half-angle rule holds off the equator too', () => close(V.l7HalfRule, 0)),
    ],
  },
  {
    id: 'l7-two-angles:b5',
    phase: 'clue',
    text: 'The notes advise against picturing state vectors directly. Could the real slice of Unit 1.5 show the rays of $|{+x}\\rangle$ and $|{+y}\\rangle$ at 45°?',
    stage: {
      layout: 'split',
      top: bloch({ state: '+y', measure: 'x', shot: 'B-EQUATOR' }),
      bottom: plane({ psi: '+x', others: [{ ket: '-x', role: 'second' }], rightAngle: true }),
    },
    fidelity: ['plane-real-slice'],
    reveal: {
      text: 'No: the slice holds only real coefficients. $|{+x}\\rangle$ and $|{-x}\\rangle$ are real, so the flat slice shows them at a right angle. $|{+y}\\rangle$ needs the coefficient $i$, so it has no arrow there. The sphere holds every state, at the price of doubling each angle.',
      caption: `the real pair $|{+z}\\rangle$, $|{+x}\\rangle$: 90° apart on the sphere, and the {{arc|arc}} between them in the slice is $\\eta = ${d(V.l7EtaZX, 0)}^\\circ$, overlap probability ${d(V.l7PZX, 1)}`,
      stage: {
        layout: 'split',
        top: bloch({ state: '+x', measure: 'z', shot: 'B-EQUATOR' }),
        bottom: plane({ psi: '+x', basis: 'z', arc: true }),
      },
      terms: { arc: t('hilbert-plane', 'angle-arc') },
      fidelity: ['plane-real-slice', 'bloch-double-angle', 'plane-half-angles'],
      claims: [
        claim('l7EtaZX', 'η(+z, +x) = 45°', () => close(V.l7EtaZX, 45)),
        claim('l7PZX', '|⟨+z|+x⟩|² = 0.5', () => close(V.l7PZX, 0.5)),
      ],
    },
  },
  {
    id: 'l7-two-angles:b6',
    phase: 'clue',
    text: 'Two equatorial states sit at $\\varphi_1 = 10^\\circ$ and $\\varphi_2 = 350^\\circ$. Subtracting gives 340°. So is $\\eta = 170^\\circ$?',
    stage: bloch({ state: { thetaDeg: 90, phiDeg: 350 }, measure: { thetaDeg: 90, phiDeg: 10 }, shot: 'B-EQUATOR' }),
    reveal: {
      text: `No. Go the short way round: the arrows are ${d(V.l7SepShort, 0)}° apart, so $\\eta = ${d(V.l7EtaShort, 0)}^\\circ$ and $|\\langle\\psi_1|\\psi_2\\rangle| = \\cos 10^\\circ \\approx ${d(V.l7OvShort)}$. A ray angle never exceeds 90°. With 340° you would need $\\cos 170^\\circ$, which is negative, and a size never is.`,
      caption: `probability $\\cos^2 10^\\circ \\approx ${d(V.l7PShort)}$ · the {{ax|magnet}} points at $\\varphi_1$, the {{pt|point}} sits at $\\varphi_2$`,
      terms: { ax: t('bloch', 'axis-n'), pt: t('bloch', 'point') },
      claims: [
        claim('l7SepShort', 'the arrows at 10° and 350° are 20° apart', () => close(V.l7SepShort, 20)),
        claim('l7EtaShort', 'so η = 10°', () => close(V.l7EtaShort, 10)),
        claim('l7OvShort', '|⟨ψ₁|ψ₂⟩| = cos 10° = 0.985', () => close(V.l7OvShort, Math.cos(10 * DEG))),
        claim('l7PShort', 'probability cos² 10° = 0.970', () => close(V.l7PShort, Math.cos(10 * DEG) ** 2)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l7-full-turn — A full turn flips the sign                                                       */
/* ---------------------------------------------------------------------------------------------- */

const SZ_OP = op({ op: { named: 'Sz' }, eigen: true })

const fullTurn: Beat[] = [
  {
    id: 'l7-full-turn:b1',
    phase: 'lecture',
    text: 'Unit 6.3 built the turn about $z$, the [[rotation-operator|rotation operator]] $R_z(\\varphi) = \\mathrm{diag}(e^{-i\\varphi/2}, e^{i\\varphi/2})$. On the equatorial state at azimuth $\\varphi_0$ it gives $R_z(\\varphi)|\\psi(\\varphi_0)\\rangle = e^{-i\\varphi/2}|\\psi(\\varphi_0 + \\varphi)\\rangle$. The arrow moves on by $\\varphi$, and a common phase $e^{-i\\varphi/2}$ rides along that no probability can see.',
    caption: `$\\langle{+y}|R_z(90^\\circ)|{+x}\\rangle = e^{-i\\pi/4} = ${d(V.l7Rz90Re)} - ${d(V.l7Rz90ImSize)}i$: the {{pt|point}} reaches $+y$`,
    stage: bloch({ state: '+x', rotate: turnZ(90), trail: true, shot: 'B-EQUATOR' }),
    terms: { pt: t('bloch', 'point') },
    fidelity: ['bloch-rotation-exact', 'bloch-global-phase-hidden'],
    claims: [
      claim('l7RzShift', 'Rz(100°)ψ(30°) = e^{−i50°} ψ(130°), entry by entry', () => V.l7RzShift === 1),
      claim('l7Rz90Same', 'Rz(90°)|+x⟩ is |+y⟩ up to phase', () => V.l7Rz90Same === 1),
      claim('l7Rz90Re', '⟨+y|Rz(90°)|+x⟩ = 0.707 …', () => close(V.l7Rz90Re, Math.SQRT1_2)),
      claim('l7Rz90Im', '… − 0.707i …', () => close(V.l7Rz90Im, -Math.SQRT1_2)),
      claim('l7Rz90ImSize', '(size 0.707)', () => close(V.l7Rz90ImSize, Math.SQRT1_2)),
    ],
  },
  {
    id: 'l7-full-turn:b2',
    phase: 'lecture',
    text: 'Keep turning to $\\varphi = 360^\\circ$. The arrow makes one full lap and lands exactly where it began. But each diagonal entry becomes $e^{\\mp i\\pi} = -1$, so $R_z(2\\pi) = -I$. The ket comes back as $-|\\psi\\rangle$: the [[full-turn-sign|full-turn sign]].',
    caption: `after one lap: the same {{pt|point}} and $p(+x) = ${d(V.l7Rz2piP, 0)}$, but $\\langle{+x}|R_z(2\\pi)|{+x}\\rangle = -${d(-V.l7Rz2piX, 0)}$`,
    stage: bloch({ state: '+x', rotate: turnZ(360), trail: true, shot: 'B-EQUATOR' }),
    terms: { pt: t('bloch', 'point') },
    fidelity: ['bloch-sign-hidden', 'bloch-trail-not-phase'],
    claims: [
      claim('l7Rz2piNeg', 'Rz(2π) = −I', () => V.l7Rz2piNeg === 1),
      claim('l7Rz2piX', '⟨+x|Rz(2π)|+x⟩ = −1', () => close(V.l7Rz2piX, -1)),
      claim('l7Rz2piRx', 'the turned point is (1, 0, 0) again …', () => close(V.l7Rz2piRx, 1)),
      claim('l7Rz2piP', '… and p(+x) = 1', () => close(V.l7Rz2piP, 1)),
    ],
  },
  {
    id: 'l7-full-turn:b3',
    phase: 'lecture',
    text: 'The minus sign is a [[global-phase|global phase]]: the ray, the Bloch arrow and every probability are back. A second full turn removes the sign too, since $R_z(4\\pi) = +I$. Only 720° returns the ket itself.',
    caption: 'the {{mk|bead}} is on the far side of its {{fb|circle}} after 360° and home after 720°; the {{mp|small sphere’s point}} laps twice',
    stage: hopf({ fibers: 'one', marked: { state: '+x', rotate: { axis: 'z', angleDeg: sweep(0, 720) } } }),
    terms: { mk: t('hopf', 'marker'), fb: t('hopf', 'fiber'), mp: t('hopf', 'mini-point') },
    fidelity: ['hopf-fiber-state', 'hopf-turn-half'],
    claims: [
      claim('l7Rz2piSame', 'after 360° the ket is the same ray as |+x⟩', () => V.l7Rz2piSame === 1),
      claim('l7FullSign', '… with phase −1', () => close(V.l7FullSign, -1)),
      claim('l7Rz4piId', 'Rz(4π) = +I', () => V.l7Rz4piId === 1),
      claim('l7Rz4piX', '⟨+x|Rz(4π)|+x⟩ = +1', () => close(V.l7Rz4piX, 1)),
      claim('l7Rz4piBack', 'Rz(4π)|+x⟩ is |+x⟩ entry by entry', () => V.l7Rz4piBack === 1),
      claim('l7FullSign4', 'the phase after 720° is +1', () => close(V.l7FullSign4, 1)),
    ],
  },
  {
    id: 'l7-full-turn:b4',
    phase: 'lecture',
    text: 'Unit 6.4 showed that $R_z(\\varphi) = e^{-i\\varphi S_z/\\hbar}$, a [[matrix-exponential|matrix exponential]]. For a [[infinitesimal|tiny turn]] $d\\varphi$, $R_z(d\\varphi) \\approx I - \\tfrac{i}{\\hbar}S_z\\,d\\varphi$. So $S_z$ is the [[generator]] of turns about $z$, and $R_z$ carries them out.',
    caption: 'the generator’s {{ar|arrow}} is the turning axis; its {{ep|eigenstates}} $|{\\pm z}\\rangle$ only pick up phases, at every angle',
    stage: SZ_OP,
    terms: { ar: t('operator-space', 'arrow-a'), ep: t('operator-space', 'eigen-plus') },
    fidelity: ['op-generator-axis'],
    refs: [
      { source: 'lecture', where: 'L6 notes §6.3 (Unit 6.4 here; L7 p. 4 finishes it)', adds: 'The full derivation of the generator; Lecture 7 only recalls it.' },
      townsend('§2.2, pp. 36–37 (eqs. 2.29–2.32)', 'Builds the finite turn from many tiny ones.'),
    ],
    claims: [
      claim('l7ExpRz', 'e^{−iφSz} = Rz(φ) (checked at φ = 1.234)', () => V.l7ExpRz === 1),
      claim('l7GenSz', 'i(Rz(h) − Rz(−h))/2h recovers Sz', () => V.l7GenSz === 1),
      claim('l7PoleFixed', 'Rz(φ)|+z⟩ is |+z⟩ up to a phase', () => V.l7PoleFixed === 1),
    ],
  },
  {
    id: 'l7-full-turn:b5',
    phase: 'lecture',
    text: 'Reference B, outside the class plan, is Unit 6.3’s check on any state $\\alpha|{+z}\\rangle + \\beta|{-z}\\rangle$. Under the turn, $|\\alpha|^2$, $|\\beta|^2$ and $\\langle S_z\\rangle$ stay, while $(\\langle S_x\\rangle, \\langle S_y\\rangle)$ turns like an arrow about $z$.',
    caption: `a quarter turn takes $\\vec r = (${d(V.l7RefB0x)},\\ ${d(V.l7RefB0y)},\\ ${d(V.l7RefB0z)})$ to $(-${d(V.l7RefB1xSize)},\\ ${d(V.l7RefB1y)},\\ ${d(V.l7RefB1z)})$ · the {{h|height}} stays`,
    stage: bloch({ state: { thetaDeg: 60, phiDeg: 30 }, rotate: turnZ(90), trail: true }),
    terms: { h: t('bloch', 'z') },
    fidelity: ['bloch-rotation-exact'],
    claims: [
      claim('l7RefB0x', 'start: r = (0.750, …', () => close(V.l7RefB0x, 0.75)),
      claim('l7RefB0y', '… 0.433, …', () => close(V.l7RefB0y, Math.sqrt(3) / 4)),
      claim('l7RefB0z', '… 0.500)', () => close(V.l7RefB0z, 0.5)),
      claim('l7RefB1x', 'after Rz(90°): r = (−0.433, …', () => close(V.l7RefB1x, -Math.sqrt(3) / 4)),
      claim('l7RefB1xSize', '(size 0.433) …', () => close(V.l7RefB1xSize, Math.sqrt(3) / 4)),
      claim('l7RefB1y', '… 0.750, …', () => close(V.l7RefB1y, 0.75)),
      claim('l7RefB1z', '… 0.500): the height stays', () => close(V.l7RefB1z, 0.5)),
      claim('l7RefBSo3', 'an ordinary rotation of the start vector gives the same arrow', () => close(V.l7RefBSo3, 0, 1e-12)),
    ],
  },
  {
    id: 'l7-full-turn:b6',
    phase: 'books',
    text: 'Townsend builds $R_z$ from many tiny turns and checks that 90° takes $|{+x}\\rangle$ to $e^{-i\\pi/4}|{+y}\\rangle$. In a worked example he turns $|{+x}\\rangle$ by 180° into $-i|{-x}\\rangle$, which is the state $|{-x}\\rangle$. He also flags the minus sign after 360°. It shows only against an unturned partner beam; his Chapter 4 describes such a test.',
    caption: `$\\langle{-x}|R_z(180^\\circ)|{+x}\\rangle = -i$, with real part ${d(V.l7Rz180Re, 0)}: the {{pt|point}} ends diametrically opposite, at $-x$ on the {{eq|equator}}`,
    stage: bloch({ state: '+x', rotate: turnZ(180), trail: true, shot: 'B-EQUATOR' }),
    terms: { pt: t('bloch', 'point'), eq: t('bloch', 'equator') },
    refs: [townsend('§2.2, pp. 36–41 (eqs. 2.29, 2.32, 2.42, 2.43; Example 2.2)', 'The rotation operator built from tiny turns, and worked turns of $|{+x}\\rangle$ by 90° and 180°. It also gives a first mention of the sign after a full turn.')],
    claims: [
      claim('l7Rz180Same', 'Rz(180°)|+x⟩ is |−x⟩ up to phase', () => V.l7Rz180Same === 1),
      claim('l7Rz180Im', '⟨−x|Rz(180°)|+x⟩ = −i …', () => close(V.l7Rz180Im, -1)),
      claim('l7Rz180Re', '… with real part 0', () => close(V.l7Rz180Re, 0)),
      claim('l7Rz90Re', 'the 90° case: e^{−iπ/4}', () => close(V.l7Rz90Re, Math.SQRT1_2)),
    ],
  },
  {
    id: 'l7-full-turn:b7',
    phase: 'clue',
    text: 'The formula repeats every 360°: $|\\psi(\\varphi_0 + 360^\\circ)\\rangle = |\\psi(\\varphi_0)\\rangle$ exactly. So why does a 360° turn give $-|\\psi\\rangle$?',
    stage: bloch({ state: '+x', path: { about: 'z' }, shot: 'B-EQUATOR' }),
    reveal: {
      text: 'The formula always keeps the first entry real and positive, so it never shows an overall phase. The turn carries the extra factor $e^{-i\\varphi/2}$, which is $-1$ at 360°. Same ray and same point; only the phase bookkeeping differs.',
      caption: `$|\\psi(360^\\circ)\\rangle$ starts with $+${d(V.l7Eq360a)}$, while $R_z(2\\pi)|{+x}\\rangle$ starts with $-${d(V.l7Rz2piASize)}$ · a global phase from 0° to 180° leaves the {{pt|point}} where it is`,
      stage: bloch({ state: '+x', globalPhaseDeg: sweep(0, 180), shot: 'B-EQUATOR' }),
      terms: { pt: t('bloch', 'point') },
      fidelity: ['bloch-global-phase-hidden', 'bloch-sign-hidden'],
      claims: [
        claim('l7Eq360a', 'ψ(360°) = (0.707, 0.707) …', () => close(V.l7Eq360a, Math.SQRT1_2)),
        claim('l7Eq360Same', '… = ψ(0) entry by entry', () => V.l7Eq360Same === 1),
        claim('l7Rz2piA', 'Rz(2π)|+x⟩ = (−0.707, −0.707)', () => close(V.l7Rz2piA, -Math.SQRT1_2)),
        claim('l7Rz2piASize', '(size 0.707)', () => close(V.l7Rz2piASize, Math.SQRT1_2)),
        claim('l7ExpMinusPi', 'e^{−iπ} = −1', () => close(V.l7ExpMinusPi, -1)),
      ],
    },
  },
  {
    id: 'l7-full-turn:b8',
    phase: 'clue',
    text: 'After one full turn, is the angle between the starting and final rays $\\eta = 360^\\circ/2 = 180^\\circ$?',
    stage: bloch({ state: '+x', rotate: turnZ(360), trail: true, shot: 'B-EQUATOR' }),
    fidelity: ['bloch-trail-not-phase'],
    reveal: {
      text: 'No. η compares where two rays end up, not how far you turned. Both ends are the same ray: $|\\langle\\psi|R_z(2\\pi)|\\psi\\rangle| = 1$, so $\\eta = 0$. The turn survives only as the sign, and that sign comes from the spin matrix, not from the closed loop the arrow drew.',
      caption: 'the {{mk|bead}} sits on the same {{fb|circle}} it started on (the same ray), but on the opposite side of it: $-|\\psi\\rangle$',
      stage: hopf({ fibers: 'one', marked: { state: '+x', rotate: { axis: 'z', angleDeg: 360 } } }),
      terms: { mk: t('hopf', 'marker'), fb: t('hopf', 'fiber') },
      fidelity: ['hopf-turn-half'],
      claims: [
        claim('l7OvFull', '|⟨+x|Rz(2π)|+x⟩| = 1, so η = arccos 1 = 0', () => close(V.l7OvFull, 1)),
        claim('l7FullSign', 'the phase between the two ends is −1', () => close(V.l7FullSign, -1)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l7-order — Swapping the order of two measurements                                               */
/* ---------------------------------------------------------------------------------------------- */

const order: Beat[] = [
  {
    id: 'l7-order:b1',
    phase: 'lecture',
    text: 'Recall the update rule of Unit 3.4 and Unit 4.2. Write an observable as $A = \\sum_a a\\,P_a$, with $P_a$ the [[projector]] onto outcome $a$. The outcome $a$ comes with probability $p(a) = \\langle\\psi|P_a|\\psi\\rangle$. It leaves the state $P_a|\\psi\\rangle/\\sqrt{p(a)}$, the [[state-update|state update]]. The new question: what does that update do to the *next* measurement?',
    caption: `$p(+x) = \\langle{+z}|P_{+x}|{+z}\\rangle = ${tf(V.l7PxFromZ)}$; the kept part has length ${d(V.l7BranchLen)} before rescaling, and the atom is then $|{+x}\\rangle$ · lower-case $p$ is a probability, capital $P_a$ a projector`,
    stage: ball({ point: '+z', measure: 'x', update: 'selective' }),
    fidelity: ['ball-update-cut'],
    claims: [
      claim('l7PxFromZ', 'p(+x) = ⟨+z|P₊ₓ|+z⟩ = ½', () => close(V.l7PxFromZ, 0.5)),
      claim('l7BranchLen', '|P₊ₓ|+z⟩| = 0.707', () => close(V.l7BranchLen, Math.SQRT1_2)),
      claim('l7BranchIsX', 'rescaled, the branch is |+x⟩', () => V.l7BranchIsX === 1),
      claim('l7MeasureHalf', 'the engine’s measurement of Sx on |+z⟩ gives ½ and ½', () => close(V.l7MeasureHalf, 0.5)),
    ],
  },
  {
    id: 'l7-order:b2',
    phase: 'lecture',
    text: 'Prepare $|{+z}\\rangle$ and measure $S_z$ first. The result is certainly $+\\hbar/2$, and the state stays $|{+z}\\rangle$. Then $S_x$ gives $\\pm\\hbar/2$, half each.',
    caption: `top, $z$ then $x$: {{bs|the stop}} after the $z$ magnet catches ${d(V.l7ZxBlocked, 0)} atoms, and the plate splits ${uf(V.l7ZxPlus)} and ${uf(V.l7ZxMinus)} · the bottom bench waits`,
    stage: orders(false, ['blocked']),
    terms: { bs: t('lab-r3', 'beam-stop') },
    fidelity: ['lab-born-fractions'],
    claims: [
      claim('l7ZxBlocked', 'z first: nothing is blocked …', () => close(V.l7ZxBlocked, 0)),
      claim('l7ZxPlus', '… ½ on + …', () => close(V.l7ZxPlus, 0.5)),
      claim('l7ZxMinus', '… and ½ on −', () => close(V.l7ZxMinus, 0.5)),
    ],
  },
  {
    id: 'l7-order:b3',
    phase: 'lecture',
    text: 'Swap the order. $S_x$ first leaves $|{+x}\\rangle$ or $|{-x}\\rangle$, half each, and either way $S_z$ then splits 50/50. So $p(-z) = \\tfrac12\\cdot\\tfrac12 + \\tfrac12\\cdot\\tfrac12 = \\tfrac12$. The certain $z$ answer has become a coin toss.',
    caption: `bottom, $x$ then $z$, keeping the +x branch: ${uf(V.l7XzBlocked)} is stopped and ${uf(V.l7XzPlusMinus)} lands on the {{sm|− spot}}. Without the stop, the −x branch adds another ${uf(V.l7XzMinusMinus)}, so ${uf(V.l7XzPMinusZ)} in all`,
    stage: orders(true, ['blocked']),
    terms: { sm: t('lab-r3', 'spot-minus') },
    fidelity: ['lab-kept-branch'],
    claims: [
      claim('l7XzBlocked', 'x first, keeping +x: ½ is stopped …', () => close(V.l7XzBlocked, 0.5)),
      claim('l7XzPlusMinus', '… and ¼ lands −z', () => close(V.l7XzPlusMinus, 0.25)),
      claim('l7XzMinusMinus', 'keeping −x instead: ¼ lands −z', () => close(V.l7XzMinusMinus, 0.25)),
      claim('l7XzPMinusZ', 'p(−z) = ¼ + ¼ = ½', () => close(V.l7XzPMinusZ, 0.5)),
      claim('l7SeqMinusZ', 'the same ½ with no beam stop at all (every sign path)', () => close(V.l7SeqMinusZ, 0.5)),
    ],
  },
  {
    id: 'l7-order:b4',
    phase: 'lecture',
    text: 'Checkpoint: after the $x$ step, measure $S_z$ twice in a row. The second reading always repeats the first. The first $z$ reading left a $z$ eigenstate, which gives its own value every time.',
    caption: `${uf(V.l7XzzPlus)} of the atoms get past both kept outputs, and at the {{m3|last magnet}} all of them land +: ${d(V.l7XzzMinus, 0)} on −`,
    stage: lab(main('+z', [X('+'), Z('+'), Z()]), { readouts: ['fractions'] }),
    terms: { m3: t('lab-r3', 'magnet-3') },
    claims: [
      claim('l7XzzPlus', 'x, z, z keeping + and +: ¼ lands + …', () => close(V.l7XzzPlus, 0.25)),
      claim('l7XzzMinus', '… and 0 lands −', () => close(V.l7XzzMinus, 0)),
    ],
  },
  {
    id: 'l7-order:b5',
    phase: 'books',
    text: 'Susskind asks for a state that is an eigenvector of both observables at once. Measuring either one then gives a definite value and leaves the state alone, in any order. For spin components along two non-parallel axes, no such state exists.',
    caption: `along $z$, $|{+z}\\rangle$ is certain: $p(+z) = ${d(V.l7PzZ, 0)}$ on the {{ax|magnet axis}}; along $x$ it is not: $p(+x) = ${tf(V.l7PxFromZ)}$`,
    stage: ball({ point: '+z', measure: 'z' }),
    terms: { ax: t('bloch-ball', 'axis-n') },
    refs: [susskind('Lecture 5, §5.1.1–5.2', 'Simultaneous eigenvectors, and which spin components can be measured together. His “any axes” means axes that are not parallel.')],
    claims: [
      claim('l7PzZ', 'p(+z) = 1 for |+z⟩', () => close(V.l7PzZ, 1)),
      claim('l7PxFromZ', 'p(+x) = ½ for |+z⟩', () => close(V.l7PxFromZ, 0.5)),
    ],
  },
  {
    id: 'l7-order:b6',
    phase: 'clue',
    text: 'Randomness alone is not the problem. A $|{+x}\\rangle$ beam through two $z$ magnets gives a random first reading, yet two identical magnets cannot care about their order. So what makes $x$-then-$z$ differ from $z$-then-$x$?',
    caption: `${uf(V.l7XzzRepeatPlus)} of the atoms pass the first $z$ magnet, and every one lands + at the {{m2|second}}: ${d(V.l7ZzMinus, 0)} on −`,
    stage: lab(main('+x', [Z('+'), Z()]), { readouts: ['fractions'] }),
    terms: { m2: t('lab-r3', 'magnet-2') },
    claims: [
      claim('l7XzzRepeatPlus', '|+x⟩, z then z keeping +: ½ lands + …', () => close(V.l7XzzRepeatPlus, 0.5)),
      claim('l7ZzMinus', '… and 0 lands −', () => close(V.l7ZzMinus, 0)),
    ],
    reveal: {
      text: 'Whether the first measurement leaves the second one’s states intact. A $z$ magnet leaves $|{\\pm z}\\rangle$ as they are, so a second $z$ reading cannot change. An $x$ magnet turns $|{+z}\\rangle$ into $|{\\pm x}\\rangle$, which are not $z$ states, so the $z$ answer is lost.',
      caption: `after an $x$ magnet the atom is $|{+x}\\rangle$, the {{pt|point}} on the equator: along $z$, $p(+z) = ${tf(V.l7PzX)}$`,
      stage: ball({ point: '+x', measure: 'z' }),
      terms: { pt: t('bloch-ball', 'point') },
      claims: [claim('l7PzX', 'p(+z) = ½ for |+x⟩', () => close(V.l7PzX, 0.5))],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l7-compatible — Compatible measurements share a basis and commute                               */
/* ---------------------------------------------------------------------------------------------- */

/** S_z and B = I + 4S_z (ħ = 1): B = I + 2σ_z, eigenvalues 3 and −1 on |±z⟩. */
const SZ_B = (gauge: boolean) => op({ op: { named: 'Sz' }, add: { a0: 1, a: [0, 0, 2] }, eigen: true, gauge, shot: gauge ? 'O-GAUGE' : 'O-STD' })

const compatible: Beat[] = [
  {
    id: 'l7-compatible:b1',
    phase: 'lecture',
    text: 'Suppose one state is an eigenstate of both observables: $A|k\\rangle = a_k|k\\rangle$ and $B|k\\rangle = b_k|k\\rangle$. Then either order returns the pair $(a_k, b_k)$ and leaves $|k\\rangle$ unchanged. That is a fact about this one state.',
    caption: `$S_z$ and $B = I + 4S_z/\\hbar$: both {{ar|arrows}} lie on the $z$ axis, so both have the eigenstates $|{\\pm z}\\rangle$; $B$ has eigenvalues ${d(V.l7BEig1, 0)} and −${d(-V.l7BEig2, 0)} · the third arrow is their sum`,
    stage: SZ_B(false),
    terms: { ar: t('operator-space', 'arrow-a') },
    fidelity: ['op-sum', 'op-sum-not-commutator'],
    claims: [
      claim('l7BEig1', 'B = I + 4Sz has eigenvalues 3 …', () => close(V.l7BEig1, 3)),
      claim('l7BEig2', '… and −1', () => close(V.l7BEig2, -1)),
      claim('l7BIsI4Sz', '3|+z⟩⟨+z| − |−z⟩⟨−z| = I + 4Sz', () => V.l7BIsI4Sz === 1),
      claim('l7BVecs', 'with eigenvectors |+z⟩ and |−z⟩', () => V.l7BVecs === 1),
    ],
  },
  {
    id: 'l7-compatible:b2',
    phase: 'lecture',
    text: 'If a whole basis is shared, $AB|k\\rangle = a_kb_k|k\\rangle = BA|k\\rangle$ for every basis state, and so for every state. So the [[commutator]] $[A, B] = AB - BA$ is the zero operator. For [[hermitian|Hermitian]] matrices the converse holds too: $[A, B] = 0$ guarantees a [[common-eigenbasis|shared eigenbasis]]. Such observables are [[compatible]].',
    caption: `$[S_z, B] = 0$: every entry is ${d(V.l7CommSzB, 0)} · the {{g|gauge}} shows the $a_0$ of the sum`,
    stage: SZ_B(true),
    terms: { g: t('operator-space', 'gauge-a0') },
    fidelity: ['op-parallel-commute'],
    claims: [claim('l7CommSzB', '[Sz, I + 4Sz] = 0', () => close(V.l7CommSzB, 0))],
  },
  {
    id: 'l7-compatible:b3',
    phase: 'lecture',
    text: 'Multiplying by $A$ is not measuring $A$. Let $P_a$ project onto outcome $a$ of $A$, and $Q_b$ onto outcome $b$ of $B$. The two orders leave $Q_bP_a|\\psi\\rangle$ and $P_aQ_b|\\psi\\rangle$, whose squared lengths are the [[joint-probability|joint probabilities]]. Commuting observables have commuting projectors, and then the two orders agree.',
    caption: `from $|{+z}\\rangle$, + then + on the {{sp|+ spots}}: ${uf(V.l7JointZX)} for $z$ then $x$ (top) and ${uf(V.l7JointXZ)} for $x$ then $z$ (bottom), because $P_{+x}P_{+z} \\ne P_{+z}P_{+x}$`,
    stage: orders(true, ['fractions']),
    terms: { sp: t('lab-r3', 'spot-plus') },
    fidelity: ['lab-filter-is-projector'],
    claims: [
      claim('l7JointZX', '‖P₊ₓP₊z|+z⟩‖² = ½ …', () => close(V.l7JointZX, 0.5)),
      claim('l7JointXZ', '… ‖P₊zP₊ₓ|+z⟩‖² = ¼', () => close(V.l7JointXZ, 0.25)),
      claim('l7JointBench', 'the benches land the same two fractions', () => V.l7JointBench === 1),
      claim('l7ProjCommute', 'P₊ₓ and P₊z do not commute', () => V.l7ProjCommute === 0),
    ],
  },
  {
    id: 'l7-compatible:b4',
    phase: 'lecture',
    text: 'Now the spin case: $S_xS_y = \\tfrac{\\hbar^2}{4}\\begin{pmatrix}i&0\\\\0&-i\\end{pmatrix}$ and $S_yS_x = \\tfrac{\\hbar^2}{4}\\begin{pmatrix}-i&0\\\\0&i\\end{pmatrix}$. Subtracting gives $[S_x, S_y] = i\\hbar S_z$. The same steps give $[S_y, S_z] = i\\hbar S_x$ and $[S_z, S_x] = i\\hbar S_y$, and reversing an order flips the sign.',
    caption: `the {{ar|arrow}} drawn is $-\\tfrac{i}{\\hbar}[S_x, S_y]$, built from its entries. For the arrows $\\vec a$ of $S_x$ and $\\vec b$ of $S_y$ it is $2\\,\\vec a\\times\\vec b = (0, 0, ${d(V.l7CommArrowZ, 1)})$, the arrow of $S_z$ (ħ = 1) · the diagonal entries of $S_xS_y$ are $\\pm ${d(V.l7SxSyIm, 2)}\\,i$`,
    stage: op({ op: { a0: 0, a: [0, 0, 0.5] }, eigen: true }),
    terms: { ar: t('operator-space', 'arrow-a') },
    fidelity: ['op-commutator-arrow'],
    claims: [
      claim('l7SxSyIm', 'SxSy = diag(0.25i, −0.25i) …', () => close(V.l7SxSyIm, 0.25)),
      claim('l7SySxIm', '… SySx = diag(−0.25i, 0.25i)', () => close(V.l7SySxIm, -0.25)),
      claim('l7SySxImSize', '(size 0.25)', () => close(V.l7SySxImSize, 0.25)),
      claim('l7CommXY', '[Sx, Sy] = iSz', () => V.l7CommXY === 1),
      claim('l7CommCyclic', '[Sy, Sz] = iSx and [Sz, Sx] = iSy', () => V.l7CommCyclic === 1),
      claim('l7CommRev', '[Sy, Sx] = −iSz', () => V.l7CommRev === 1),
      claim('l7CommArrowZ', '−i[Sx, Sy] has the arrow (0, 0, 0.5) …', () => close(V.l7CommArrowZ, 0.5)),
      claim('l7CommArrowCross', '… which is 2 a×b for a = (½, 0, 0), b = (0, ½, 0)', () => V.l7CommArrowCross === 1),
    ],
  },
  {
    id: 'l7-compatible:b5a',
    phase: 'books',
    text: 'Townsend starts with a book. Turn it 90° about $x$ and then about $y$, then repeat in the other order: it ends up facing another way. For small turns the two orders differ by a tiny turn about $z$. That mismatch is where $[S_x, S_y] = i\\hbar S_z$ comes from; he writes J for the generators.',
    caption: `$|{+z}\\rangle$ turned 90° about $x$: the {{pt|point}} reaches $-y$, where a turn about $y$ leaves it · $x$ then $y$ ends at $r_y = -${d(-V.l7XYendY, 0)}$, $y$ then $x$ at $r_x = ${d(V.l7YXendX, 0)}$`,
    stage: bloch({ state: '+z', rotate: { axis: 'x', angleDeg: sweep(0, 90) }, trail: true }),
    terms: { pt: t('bloch', 'point') },
    fidelity: ['bloch-rotation-exact'],
    refs: [townsend('§3.1, pp. 75–79 (Fig. 3.1, eqs. 3.12–3.14)', 'Rotations about different axes do not commute. For small turns the mismatch is a turn about the third axis, which fixes the commutators of the generators.')],
    claims: [
      claim('l7XYendY', '+z turned 90° about x, then about y: (0, −1, 0)', () => close(V.l7XYendY, -1)),
      claim('l7YXendX', 'the other order: (1, 0, 0)', () => close(V.l7YXendX, 1)),
      claim('l7SmallTurns', 'Rx(ε)Ry(ε) − Ry(ε)Rx(ε) = −iε²Sz to order ε² (ε = 0.01)', () => V.l7SmallTurns === 1),
    ],
  },
  {
    id: 'l7-compatible:b5b',
    phase: 'books',
    text: `Townsend §3.1, pp. 76–79, Eq. 3.2 to Eq. 3.14, gets the commutator from rotations of ordinary vectors. A $3 \\times 3$ matrix $T_z(\\varphi)$ turns a vector about $z$, and $T_x$ and $T_y$ follow by renaming the axes. Keep terms up to second order in a small angle $\\varepsilon$. Then the two orders of two small turns differ by a tiny turn about the third axis. Put the same turns on spin states, as exponentials of the generators, and the difference is $-\\tfrac{\\varepsilon^2}{\\hbar^2}[\\hat J_x, \\hat J_y]$. Matching the two gives $[\\hat J_x, \\hat J_y] = i\\hbar\\hat J_z$. His $\\hat J$ is our $S$ for spin ½, and his turn is a $3 \\times 3$ matrix on vectors, not our $2 \\times 2$. Take $\\varepsilon$ a tenth of a radian. The vector turns differ by ${d(V.l7TComm310, 6)} in the lower-left place, against ${d(V.l7TComm3Ref, 2)} from Eq. 3.8. The spin turns differ by $-i\\,${d(V.l7TCommDiag, 6)}$ at the top left. That is ${d(V.l7TCommRatio, 4)} of $\\varepsilon^2$, close to the one half of $S_z$'s top level.`,
    caption: `the difference of the two orders of $R_x(\\varepsilon)$ and $R_y(\\varepsilon)$ grows like $\\varepsilon^2$ · at $\\varepsilon$ a tenth of a radian its top-left entry is $-i\\,${d(V.l7TCommDiag, 6)}$`,
    stage: matrix({ source: { lin: [{ c: '+1', src: { product: [{ gate: { name: 'Rx', params: [sweep(0, 30)] } }, { gate: { name: 'Ry', params: [sweep(0, 30)] } }] } }, { c: '-1', src: { product: [{ gate: { name: 'Ry', params: [sweep(0, 30)] } }, { gate: { name: 'Rx', params: [sweep(0, 30)] } }] } }] }, values: 'decimal' }),
    derivation: {
      result: '[\\hat J_x, \\hat J_y] = i\\hbar\\hat J_z',
      ground: [
        {
          tex: 'T_z(\\varphi) = \\begin{pmatrix}\\cos\\varphi&-\\sin\\varphi&0\\\\ \\sin\\varphi&\\cos\\varphi&0\\\\0&0&1\\end{pmatrix}',
          why: 'A vector turned counterclockwise about $z$ keeps its $z$ part and turns its $x$–$y$ part; the other two axes follow by renaming.',
        },
        {
          tex: 'T_x(\\varepsilon)T_y(\\varepsilon) - T_y(\\varepsilon)T_x(\\varepsilon) = T_z(\\varepsilon^2) - I',
          why: 'Multiply the matrices and keep terms to second order in $\\varepsilon$: the order matters at second order only.',
          view: matrix({ source: { lin: [{ c: '+1', src: { product: [{ gate: { name: 'Rx', params: [E01] } }, { gate: { name: 'Ry', params: [E01] } }] } }, { c: '-1', src: { product: [{ gate: { name: 'Ry', params: [E01] } }, { gate: { name: 'Rx', params: [E01] } }] } }] }, values: 'decimal' }),
          viewCaption: 'the spin version of the difference, at $\\varepsilon$ a tenth of a radian',
          claims: [
            claim('l7TComm310', 'the vector turns differ by 0.009967 in the lower-left place …', () => close(V.l7TComm310, 0.009967, 5e-7)),
            claim('l7TComm3Ref', '… against ε² = 0.01 from Eq. 3.8', () => close(V.l7TComm3Ref, 0.01, 1e-12)),
          ],
        },
        {
          tex: 'R_x(\\varepsilon) = 1 - \\tfrac{i}{\\hbar}\\hat J_x\\varepsilon - \\frac{(\\hat J_x\\varepsilon)^2}{2\\hbar^2}',
          why: 'The operator turn about each axis is the exponential series cut after the second-order term, and $R_y$ is the same with $\\hat J_y$.',
        },
        {
          tex: 'R_x(\\varepsilon)R_y(\\varepsilon) - R_y(\\varepsilon)R_x(\\varepsilon) = -\\tfrac{\\varepsilon^2}{\\hbar^2}[\\hat J_x, \\hat J_y]',
          why: 'The first-order terms and the squares cancel in the difference, and only the two cross terms survive.',
          claims: [
            claim('l7TCommDiag', 'the spin turns differ at the top left by −i times 0.004996 …', () => close(V.l7TCommDiag, 0.004996, 5e-7)),
            claim('l7TCommRatio', '… which is 0.4996 of ε²', () => close(V.l7TCommRatio, 0.4996, 5e-5)),
          ],
        },
        {
          tex: '-\\tfrac{\\varepsilon^2}{\\hbar^2}[\\hat J_x, \\hat J_y] = -\\tfrac{i}{\\hbar}\\hat J_z\\,\\varepsilon^2',
          why: 'For vectors the same difference was a turn by $\\varepsilon^2$ about $z$ minus the identity, which for the operators is $-\\tfrac{i}{\\hbar}\\hat J_z\\varepsilon^2$.',
          view: op({ op: { named: 'Sz' }, eigen: true }),
          viewCaption: 'the generator of the turn about $z$, a real arrow',
        },
        {
          tex: '[\\hat J_x, \\hat J_y] = i\\hbar\\hat J_z',
          why: 'Cancel $-\\varepsilon^2/\\hbar^2$ on both sides; renaming $x \\to y \\to z \\to x$ gives the other two.',
        },
      ],
    },
    refs: [townsend('§3.1, pp. 75–79, Eq. 3.2 to Eq. 3.14, Figs. 3.1–3.2', 'Rotations of ordinary vectors do not commute; at second order the mismatch is a turn about the third axis, and matching it with the operator turns gives the commutators of the generators.')],
    claims: [
      claim('l7TComm310', 'the vector turns differ by 0.009967 in the lower-left place …', () => close(V.l7TComm310, 0.009967, 5e-7)),
      claim('l7TComm3Ref', '… against ε² = 0.01 from Eq. 3.8', () => close(V.l7TComm3Ref, 0.01, 1e-12)),
      claim('l7TCommDiag', 'the spin turns differ at the top left by −i times 0.004996 …', () => close(V.l7TCommDiag, 0.004996, 5e-7)),
      claim('l7TCommRatio', '… which is 0.4996 of ε²', () => close(V.l7TCommRatio, 0.4996, 5e-5)),
      claim('l7TOrderGap', 'the two orders of two quarter turns end 90° apart', () => close(V.l7TOrderGap, 90, 1e-9)),
    ],
  },
  {
    id: 'l7-compatible:b6',
    phase: 'books',
    text: 'Townsend proves the converse for one eigenvalue. If $[A, B] = 0$ and only one state gives $a$, that state is an eigenstate of $B$ too. When an eigenvalue is [[degenerate]] you must pick combinations: a definite energy need not fix which way a free particle moves. Zwiebach’s Notes 5 §7, which the notes cite, proves the full shared-basis theorem.',
    caption: `$\\vec a = 0$: both eigenvalues equal ${d(V.l7IdEig, 0)}, so every spin state is an {{ep|eigenstate}}. For a spin ½ this is the only way an eigenvalue can repeat`,
    stage: op({ op: { a0: 1, a: [0, 0, 0] }, gauge: true, eigen: true, shot: 'O-GAUGE' }),
    terms: { ep: t('operator-space', 'eigen-plus') },
    refs: [
      townsend('§3.2, pp. 80–81 (eqs. 3.17–3.21, Fig. 3.3)', 'Commuting operators with a nondegenerate eigenvalue share that eigenstate; a degenerate eigenvalue needs a choice of combinations.'),
      { source: 'mit805', where: 'Zwiebach, MIT 8.05 Notes 5 §7 (cited by the notes)', adds: 'The full theorem: commuting Hermitian operators have a complete common eigenbasis.' },
      susskind('Lecture 5, §5.1.1', 'Simultaneous eigenvectors and why commuting is necessary.'),
    ],
    claims: [
      claim('l7IdEig', 'I has the eigenvalue 1 twice', () => close(V.l7IdEig, 1)),
      claim('l7CommIdX', '[I, Sx] = 0', () => close(V.l7CommIdX, 0)),
    ],
  },
  {
    id: 'l7-compatible:b7',
    phase: 'clue',
    text: '$[S_z, S_x] \\ne 0$, so the order can matter. Must every starting state show a difference?',
    stage: ball({ point: '+y', measure: 'z' }),
    reveal: {
      text: 'Not in every number. From $|{+y}\\rangle$ the chance of + then + is ¼ in both orders. But the atom ends in $|{+x}\\rangle$ after $z$-then-$x$, and in $|{+z}\\rangle$ after $x$-then-$z$. The final states still differ.',
      caption: `the same joint probability, ${uf(V.l7JointYZX)} and ${uf(V.l7JointYXZ)}, but different final states: the {{pt|point}} $|{+x}\\rangle$ and the {{cmp|second marker}} $|{+z}\\rangle$`,
      stage: ball({ point: '+x', compare: '+z' }),
      terms: { pt: t('bloch-ball', 'point'), cmp: t('bloch-ball', 'compare') },
      fidelity: ['ball-update-cut'],
      claims: [
        claim('l7JointYZX', 'from |+y⟩: z then x gives + then + with ¼ …', () => close(V.l7JointYZX, 0.25)),
        claim('l7JointYXZ', '… and x then z also ¼', () => close(V.l7JointYXZ, 0.25)),
        claim('l7FinalZX', 'z then x leaves |+x⟩ …', () => V.l7FinalZX === 1),
        claim('l7FinalXZ', '… x then z leaves |+z⟩', () => V.l7FinalXZ === 1),
      ],
    },
  },
  {
    id: 'l7-compatible:b8',
    phase: 'clue',
    text: 'For a spin ½, can spin components along two different axes ever be measured compatibly?',
    caption: `$S_z$ and the spin along $-z$: two {{ar|arrows}} on one line, and $[S_z, -S_z] = ${d(V.l7CommOpp, 0)}$`,
    stage: op({ op: { named: 'Sz' }, add: { a0: 0, a: [0, 0, -0.5] }, eigen: true }),
    terms: { ar: t('operator-space', 'arrow-a') },
    fidelity: ['op-parallel-commute'],
    claims: [
      claim('l7CommOpp', '[Sz, −Sz] = 0', () => close(V.l7CommOpp, 0)),
    ],
    reveal: {
      text: 'Only if the axes are parallel or opposite. Let $S_{\\hat n}$ and $S_{\\hat m}$ be the spins along unit vectors $\\hat n$ and $\\hat m$, and $\\vec S = (S_x, S_y, S_z)$. Then $[S_{\\hat n}, S_{\\hat m}] = i\\hbar(\\hat n\\times\\hat m)\\cdot\\vec S$, which vanishes only when the [[cross-product|cross product]] $\\hat n\\times\\hat m$ is zero. A $z$ magnet and an upside-down $z$ magnet are compatible; tilt one, and they are not.',
      caption: `tilted by 60°: $|\\hat n\\times\\hat m| = \\sin 60^\\circ \\approx ${d(V.l7Cross60)}$, so the commutator is not zero · the second {{ar|arrow}} is the tilted spin`,
      stage: op({ op: { named: 'Sz' }, add: { a0: 0, a: SPIN60 }, eigen: true }),
      claims: [
        claim('l7CrossRule', '[S_n, S_m] = i (n × m)·S for n, m at 30° and 50° from z in different planes', () => V.l7CrossRule === 1),
        claim('l7Cross60', '|ẑ × n̂| = sin 60° = 0.866 for a 60° tilt', () => close(V.l7Cross60, Math.sqrt(3) / 2)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l7-spreads — Spreads you can read off the sphere                                                */
/* ---------------------------------------------------------------------------------------------- */

const spreads: Beat[] = [
  {
    id: 'l7-spreads:b1',
    phase: 'lecture',
    text: 'Recall Unit 3.6. On many copies of one state, the readings of $A$ have the [[uncertainty|spread]] $\\Delta A$, with the [[variance]] $(\\Delta A)^2 = \\langle A^2\\rangle - \\langle A\\rangle^2$. The spread is zero exactly in an eigenstate of $A$. Unit 3.6 found one spread at a time; now we want all three spin components of any state at once.',
    caption: `$|{+z}\\rangle$ into a magnet tilted 60°: $p(+) = ${tf(V.l7Tilt60P)}$ on the {{fb|fill bar}}, the {{c|average}} $\\langle S_{\\hat n}\\rangle = \\hbar/4$, and $\\Delta S_{\\hat n} \\approx ${d(V.l7Tilt60Sd)}\\,\\hbar$`,
    stage: lab(main('+z', [{ axis: { tiltDeg: 60 } }]), { readouts: ['centroid', 'fill-bar'], shot: 'L-PLATE' }),
    terms: { fb: t('lab-r3', 'fill-bar'), c: t('lab-r3', 'centroid') },
    fidelity: ['lab-centroid-is-mean'],
    claims: [
      claim('l7Tilt60P', 'p(+) = ¾ at a 60° tilt', () => close(V.l7Tilt60P, 0.75)),
      claim('l7Tilt60Avg', '⟨Sₙ⟩ = 0.25ħ', () => close(V.l7Tilt60Avg, 0.25)),
      claim('l7Tilt60Sd', 'ΔSₙ = 0.433ħ …', () => close(V.l7Tilt60Sd, Math.sqrt(3) / 4)),
      claim('l7Tilt60Var', '… the square root of the variance ¾·(¼)² + ¼·(¾)² = 0.1875 (ħ²)', () => close(V.l7Tilt60Var, 0.1875)),
    ],
  },
  {
    id: 'l7-spreads:b2',
    phase: 'lecture',
    text: 'Every spin reading is $\\pm\\hbar/2$, so $S_j^2 = \\tfrac{\\hbar^2}{4}I$ for each axis $j = x, y, z$. With $\\langle S_j\\rangle = \\tfrac{\\hbar}{2}r_j$, this gives $(\\Delta S_j)^2 = \\tfrac{\\hbar^2}{4}(1 - r_j^2)$. The Bloch arrow fixes all three spreads.',
    caption: `the {{pt|point}} $\\vec r = (${d(V.l7R60x)}, 0, ${d(V.l7R60z)})$: $\\Delta S_x = ${d(V.l7Sd60x)}\\,\\hbar$, $\\Delta S_y = ${d(V.l7Sd60y)}\\,\\hbar$ and $\\Delta S_z \\approx ${d(V.l7Sd60z)}\\,\\hbar$, as the readout shows`,
    stage: bloch({ state: P60, measure: 'z', readouts: ['averages', 'spreads'] }),
    terms: { pt: t('bloch', 'point') },
    fidelity: ['bloch-fresh-copies'],
    claims: [
      claim('l7SqQuarter', 'Sx² = Sy² = Sz² = ¼ I (ħ = 1)', () => V.l7SqQuarter === 1),
      claim('l7SpreadFormula', '(ΔS_j)² = (1 − r_j²)/4 for every j and every sampled state', () => close(V.l7SpreadFormula, 0)),
      claim('l7SpreadFromBloch', 'the engine’s spreads-from-r agree with the sandwiches', () => close(V.l7SpreadFromBloch, 0)),
      claim('l7R60x', 'r = (0.866, …', () => close(V.l7R60x, Math.sqrt(3) / 2)),
      claim('l7R60z', '… 0, 0.500)', () => close(V.l7R60z, 0.5)),
      claim('l7Sd60x', 'ΔSx = 0.250ħ', () => close(V.l7Sd60x, 0.25)),
      claim('l7Sd60y', 'ΔSy = 0.500ħ', () => close(V.l7Sd60y, 0.5)),
      claim('l7Sd60z', 'ΔSz = 0.433ħ', () => close(V.l7Sd60z, Math.sqrt(3) / 4)),
    ],
  },
  {
    id: 'l7-spreads:b3',
    phase: 'lecture',
    text: 'In $|{+z}\\rangle$, $\\vec r = (0, 0, 1)$, so $\\Delta S_z = 0$ while $\\Delta S_x = \\Delta S_y = \\hbar/2$. The $z$ value is definite, and each sideways component is a fair coin.',
    caption: `$p(\\pm x) = ${tf(V.l7PZX)}$ each along the {{ax|x magnet}}, so $\\Delta S_x = \\hbar/2$`,
    stage: bloch({ state: '+z', measure: 'x', readouts: ['spreads'] }),
    terms: { ax: t('bloch', 'axis-n') },
    claims: [
      claim('l7VarZz', 'ΔSz = 0 in |+z⟩', () => close(V.l7VarZz, 0)),
      claim('l7SdZx', 'ΔSx = ħ/2 …', () => close(V.l7SdZx, 0.5)),
      claim('l7SdZy', '… = ΔSy', () => close(V.l7SdZy, 0.5)),
      claim('l7PZX', 'p(+x) = ½ for |+z⟩', () => close(V.l7PZX, 0.5)),
    ],
  },
  {
    id: 'l7-spreads:b4',
    phase: 'lecture',
    text: 'These spreads belong to one prepared state, measured on fresh copies: a [[preparation-uncertainty|preparation spread]]. They are not instrument error, not the kick from an earlier measurement, and not the error of an average. The [[sample-mean-error|error of the average]] over $N$ trials shrinks like $\\Delta A/\\sqrt N$, while $\\Delta A$ stays put.',
    caption: `single readings: $\\Delta S_x = \\hbar/2$ whatever the batch size · the {{sb|band}} for the average of 100 atoms: $\\pm ${d(V.l7SemX100, 2)}\\,\\hbar$`,
    stage: lab(main('+z', [X()]), { batches: [10, 100, 1000], readouts: ['sigma-band'], shot: 'L-PLATE' }),
    terms: { sb: t('lab-r3', 'sigma-band') },
    fidelity: ['lab-born-fractions', 'lab-spread-vs-band'],
    claims: [
      claim('l7SdZx', 'ΔSx = ħ/2 for |+z⟩', () => close(V.l7SdZx, 0.5)),
      claim('l7SemX100', 'ΔSx/√100 = 0.05ħ', () => close(V.l7SemX100, 0.05)),
    ],
  },
  {
    id: 'l7-spreads:b5',
    phase: 'lecture',
    text: 'Reference B’s last line lies outside the class plan and recalls Unit 6.3. For a spin ½ the average along any axis $\\hat n$ fixes both probabilities, $p_\\pm = \\tfrac12 \\pm \\langle S_{\\hat n}\\rangle/\\hbar$. At θ = 60°, measured along $z$, $\\langle S_z\\rangle = \\hbar/4$. So $p_+ = \\tfrac34$ and $p_- = \\tfrac14$.',
    caption: `$p_+ = \\tfrac12 + ${tf(V.l7AvgZ60)} = ${tf(V.l7PplusRule)}$ along the {{ax|z magnet}}`,
    stage: bloch({ state: P60, measure: 'z' }),
    terms: { ax: t('bloch', 'axis-n') },
    fidelity: ['bloch-born'],
    claims: [
      claim('l7PzX', 'the ½ in p± = ½ ± ⟨Sₙ⟩/ħ is p₊ when ⟨Sₙ⟩ = 0', () => close(V.l7PzX, 0.5)),
      claim('l7AvgZ60', '⟨Sz⟩ = ħ/4 at θ = 60°', () => close(V.l7AvgZ60, 0.25)),
      claim('l7PplusRule', 'p₊ = ½ + ¼ = ¾ …', () => close(V.l7PplusRule, 0.75)),
      claim('l7PminusRule', '… p₋ = ¼', () => close(V.l7PminusRule, 0.25)),
      claim('l7PplusBorn', 'the same p₊ as |⟨+z|ψ⟩|²', () => V.l7PplusBorn === 1),
    ],
  },
  {
    id: 'l7-spreads:b6',
    phase: 'books',
    text: 'Townsend computes the same kind of spread for $|\\psi\\rangle = \\tfrac12|{+z}\\rangle + \\tfrac{i\\sqrt3}{2}|{-z}\\rangle$. He finds $\\langle S_z\\rangle = -\\hbar/4$ and $\\Delta S_z = \\tfrac{\\sqrt3}{4}\\hbar \\approx 0.43\\,\\hbar$. His next sentence gives the 75 % to $+\\hbar/2$; it belongs to $-\\hbar/2$, as the Lecture 3 errata note.',
    caption: `$p(+z) = ${tf(V.l7TPz)}$, $\\langle S_z\\rangle = -\\hbar/4$ and $\\Delta S_z \\approx ${d(V.l7TSd)}\\,\\hbar$ along the {{ax|z magnet}}: the spread of θ = 60°, mirrored below the equator`,
    stage: bloch({ state: { thetaDeg: 120, phiDeg: 90 }, measure: 'z' }),
    terms: { ax: t('bloch', 'axis-n') },
    refs: [
      townsend('§1.4, pp. 15–17 (eq. 1.21, Example 1.2)', 'The spread of $S_z$ for a state with complex amplitudes. The sentence after the example swaps the two outcomes (Lecture 3 errata).'),
      susskind('Lecture 5, §5.4', 'The same definition through the shifted operator, the observable minus its average.'),
    ],
    claims: [
      claim('l7TAlpha', 'Townsend’s amplitude of |+z⟩ is ½ …', () => close(V.l7TAlpha, 0.5)),
      claim('l7TIsSphere', '… and his state is the sphere point θ = 120°, φ = 90°', () => V.l7TIsSphere === 1),
      claim('l7TPz', 'p(+z) = ¼ …', () => close(V.l7TPz, 0.25)),
      claim('l7TPminus', '… so −ħ/2 has the 75 %', () => close(V.l7TPminus, 0.75)),
      claim('l7TAvg', '⟨Sz⟩ = −ħ/4', () => close(V.l7TAvg, -0.25)),
      claim('l7TAvgSize', '(size 0.25)', () => close(V.l7TAvgSize, 0.25)),
      claim('l7TSd', 'ΔSz = √3/4 ħ = 0.433ħ', () => close(V.l7TSd, Math.sqrt(3) / 4)),
    ],
  },
  {
    id: 'l7-spreads:b7',
    phase: 'clue',
    text: 'Is there always an axis along which a [[pure-state|pure state]] has zero spread?',
    stage: bloch({ state: STAR, measure: 'x' }),
    refs: [susskind('Lecture 3, §3.8', 'Every spin state reads + for certain along some direction.')],
    reveal: {
      text: 'Yes: the direction $\\hat r$ of its own Bloch arrow. Along $\\hat r$ the state is an eigenstate, so $\\Delta S_{\\hat r} = 0$; Susskind calls this the [[spin-polarization|spin-polarization principle]]. A spread describes a state *and* an axis, not a fuzzy state.',
      caption: `measured along its own arrow, the {{ax|magnet}} gives $p(+) = ${d(V.l7OwnAxisP, 0)}$`,
      stage: bloch({ state: STAR, measure: STAR }),
      terms: { ax: t('bloch', 'axis-n') },
      fidelity: ['bloch-born'],
      claims: [
        claim('l7OwnAxisVar', 'the variance along r̂ is 0 for every sampled state …', () => close(V.l7OwnAxisVar, 0)),
        claim('l7OwnAxisP', '… and p(+) along r̂ is 1', () => close(V.l7OwnAxisP, 1)),
      ],
    },
  },
  {
    id: 'l7-spreads:b8',
    phase: 'clue',
    text: '$\\Delta S_x = \\tfrac{\\hbar}{2}\\sqrt{1 - r_x^2}$. Where is that length on the sphere?',
    stage: bloch({ state: STAR, measure: 'x' }),
    reveal: {
      text: 'Because $r_x^2 + r_y^2 + r_z^2 = 1$, $\\sqrt{1 - r_x^2} = \\sqrt{r_y^2 + r_z^2}$ is the distance from the Bloch point to the $x$ axis. So $\\Delta S_x$ is ħ/2 times that distance: zero on the axis, largest on the great circle perpendicular to it. The three squared spreads always add to $\\tfrac{\\hbar^2}{2}$.',
      caption: `the dashed line from the {{pt|point}} to the $x$ axis has length ${d(V.l7Dist6045x)}, so $\\Delta S_x \\approx ${d(V.l7Sd6045x)}\\,\\hbar$ · $(\\Delta S_x)^2 + (\\Delta S_y)^2 + (\\Delta S_z)^2 = ${d(V.l7SumSq, 1)}\\,\\hbar^2$`,
      stage: bloch({ state: STAR, measure: 'x', dropLines: ['x'], readouts: ['spreads'] }),
      terms: { pt: t('bloch', 'point') },
      fidelity: ['bloch-spread-distance'],
      claims: [
        claim('l7Dist6045x', 'distance from r to the x axis: 0.791 …', () => close(V.l7Dist6045x, Math.sqrt(0.625))),
        claim('l7Sd6045x', '… so ΔSx = 0.395ħ', () => close(V.l7Sd6045x, Math.sqrt(0.625) / 2)),
        claim('l7DistRule', 'ΔSx = ½ × that distance', () => V.l7DistRule === 1),
        claim('l7SumSq', 'the three variances add to 0.5ħ² for every sampled state', () => close(V.l7SumSq, 0.5)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l7-uncertainty — A floor under the product of spreads                                           */
/* ---------------------------------------------------------------------------------------------- */

const BOUND_READOUTS: BlochState['readouts'] = ['spreads', 'bound']

const uncertainty: Beat[] = [
  {
    id: 'l7-uncertainty:b1',
    phase: 'lecture',
    text: 'For a pure state the Bloch arrow has length 1: $r_x^2 + r_y^2 + r_z^2 = 1$. Multiplying two of the spreads gives $(\\Delta S_x\\Delta S_y)^2 = \\tfrac{\\hbar^4}{16}(1 - r_x^2)(1 - r_y^2) = \\tfrac{\\hbar^4}{16}(r_z^2 + r_x^2r_y^2)$.',
    caption: `θ = 60°, φ = 45°: $(1 - r_x^2)(1 - r_y^2) = ${d(V.l7IdLeft, 4)} = r_z^2 + r_x^2r_y^2$, and $\\Delta S_x\\Delta S_y \\approx ${d(V.l7Prod6045)}\\,\\hbar^2$ for the {{pt|point}}`,
    stage: bloch({ state: STAR, measure: 'z', readouts: BOUND_READOUTS }),
    terms: { pt: t('bloch', 'point') },
    claims: [
      claim('l7IdLeft', '(1 − rx²)(1 − ry²) = 0.3906 …', () => close(V.l7IdLeft, 0.390625)),
      claim('l7IdRight', '… = rz² + rx²ry²', () => close(V.l7IdRight, V.l7IdLeft)),
      claim('l7Prod6045', 'ΔSxΔSy = 0.156ħ²', () => close(V.l7Prod6045, 0.15625)),
    ],
  },
  {
    id: 'l7-uncertainty:b2',
    phase: 'lecture',
    text: 'The term $r_x^2r_y^2$ is never negative, so dropping it leaves $\\Delta S_x\\Delta S_y \\ge \\tfrac{\\hbar^2}{4}\\lvert r_z\\rvert = \\tfrac{\\hbar}{2}\\lvert\\langle S_z\\rangle\\rvert$. That is an [[uncertainty-relation|uncertainty relation]]. Because $[S_x, S_y] = i\\hbar S_z$, the same line reads $\\Delta S_x\\Delta S_y \\ge \\tfrac12\\lvert\\langle[S_x, S_y]\\rangle\\rvert$.',
    caption: `${d(V.l7Prod6045)} ħ² ≥ ${d(V.l7Bound6045)} ħ² at the {{pt|point}}: product against bound in the readout`,
    stage: bloch({ state: STAR, measure: 'z', readouts: BOUND_READOUTS }),
    terms: { pt: t('bloch', 'point') },
    claims: [
      claim('l7Prod6045', 'ΔSxΔSy = 0.156ħ² …', () => close(V.l7Prod6045, 0.15625)),
      claim('l7Bound6045', '… ≥ ½|⟨Sz⟩| = 0.125ħ²', () => close(V.l7Bound6045, 0.125)),
      claim('l7BoundComm', 'the same bound from ½|⟨[Sx, Sy]⟩| (complex sandwich)', () => close(V.l7BoundComm, 0.125)),
      claim('l7Holds6045', 'the inequality holds', () => V.l7Holds6045 === 1),
      claim('l7BoundSharp', 'the ½ in front of the commutator: at |+z⟩, ΔSxΔSy = ½|⟨[Sx, Sy]⟩|', () => close(V.l7BoundSharp, 0.5)),
    ],
  },
  {
    id: 'l7-uncertainty:b3',
    phase: 'lecture',
    text: 'Along the $x$–$z$ circle $r_y = 0$, so the bound is met exactly: it is [[saturated]], from $\\tfrac{\\hbar^2}{4}$ at $|{+z}\\rangle$ down to 0 at $|{+x}\\rangle$. At $|{+x}\\rangle$ the floor is zero although $[S_x, S_y] \\ne 0$; only its average $i\\hbar\\langle S_z\\rangle$ vanishes. And $\\Delta S_y$ is still $\\hbar/2$, so a zero product does not make both values definite.',
    caption: `θ from 0° to 90° at φ = 0: product = bound all the way. It is ${d(V.l7SatP0)} ħ² at 0°, ${d(V.l7SatP60)} ħ² at 60° and 0 at 90° · the {{ax|magnet}} is along $y$`,
    stage: bloch({ state: { thetaDeg: sweep(0, 90), phiDeg: 0 }, measure: 'y', trail: true, readouts: BOUND_READOUTS }),
    terms: { ax: t('bloch', 'axis-n') },
    claims: [
      claim('l7SatP0', 'at θ = 0: product = bound = 0.25ħ²', () => close(V.l7SatP0, 0.25)),
      claim('l7SatP60', 'at θ = 60°: product 0.125ħ² …', () => close(V.l7SatP60, 0.125)),
      claim('l7SatB60', '… = bound', () => close(V.l7SatB60, 0.125)),
      claim('l7SatP90Sq', 'at θ = 90°: product 0', () => close(V.l7SatP90Sq, 0)),
      claim('l7SatSlack', 'product = bound at every sampled θ on the x–z circle', () => close(V.l7SatSlack, 0)),
      claim('l7CommXYNonzero', '[Sx, Sy] is not the zero matrix (entries of size 0.5)', () => close(V.l7CommXYNonzero, 0.5)),
      claim('l7CommAvgX', '⟨+x|[Sx, Sy]|+x⟩ = 0', () => close(V.l7CommAvgX, 0)),
      claim('l7VarXx', 'ΔSx = 0 in |+x⟩ …', () => close(V.l7VarXx, 0)),
      claim('l7SdXy', '… ΔSy = ħ/2', () => close(V.l7SdXy, 0.5)),
    ],
  },
  {
    id: 'l7-uncertainty:b4',
    phase: 'lecture',
    text: 'For any two observables in one prepared state, the [[robertson-relation|Robertson relation]] says $\\Delta A\\,\\Delta B \\ge \\tfrac12\\lvert\\langle[A, B]\\rangle\\rvert$. Its floor depends on the state, unless the commutator is a multiple of $I$. A preview, not derived here: [[position]] $x$ and [[momentum]] $p_x$ will obey $[x, p_x] = i\\hbar I$, which gives $\\Delta x\\,\\Delta p_x \\ge \\hbar/2$ in every state.',
    caption: `$A = S_x$, $B$ the spin along the {{ax|45° magnet}} in the $x$–$z$ plane, state $|{+y}\\rangle$: ${d(V.l7RobProd)} ħ² ≥ ${d(V.l7RobBound)} ħ²`,
    stage: bloch({ state: '+y', measure: { tiltDeg: 45 } }),
    terms: { ax: t('bloch', 'axis-n') },
    claims: [
      claim('l7RobProd', 'ΔSx·ΔS45 = 0.25ħ² for |+y⟩ …', () => close(V.l7RobProd, 0.25)),
      claim('l7RobBound', '… ≥ ½|⟨[Sx, S45]⟩| = 0.177ħ²', () => close(V.l7RobBound, Math.SQRT2 / 8)),
      claim('l7BoundSharp', 'the ½ in the bound: at |+z⟩, ΔSxΔSy = ½|⟨[Sx, Sy]⟩|', () => close(V.l7BoundSharp, 0.5)),
    ],
  },
  {
    id: 'l7-uncertainty:b5',
    phase: 'lecture',
    text: 'Reference A, also outside the class plan, proves the rule without the Schwarz inequality. Shift each observable by its average, $\\delta A = A - \\langle A\\rangle I$, the [[shifted-operator|shifted operator]]. When neither spread is zero, the vector $\\big(\\tfrac{\\delta A}{\\Delta A} \\pm i\\tfrac{\\delta B}{\\Delta B}\\big)|\\psi\\rangle$ has squared length $2 \\pm i\\langle[A, B]\\rangle/(\\Delta A\\,\\Delta B)$. A squared length is never negative, and the two signs together give the bound. If one spread is zero, both sides of the bound are zero.',
    caption: `$|{+z}\\rangle$ with $A = S_x$ and $B = S_y$: the two squared lengths are ${d(V.l7RefAPlus, 0)} and ${d(V.l7RefAMinus, 0)}. The + vector vanishes, so the bound is met exactly at this {{pt|point}}`,
    stage: bloch({ state: '+z', measure: 'x' }),
    terms: { pt: t('bloch', 'point') },
    claims: [
      claim('l7RefAPlus', '‖(2Sx + 2iSy)|+z⟩‖² = 0 …', () => close(V.l7RefAPlus, 0)),
      claim('l7RefAMinus', '… ‖(2Sx − 2iSy)|+z⟩‖² = 4', () => close(V.l7RefAMinus, 4)),
      claim('l7RefAi', 'i⟨[Sx, Sy]⟩ = −½ at |+z⟩', () => close(V.l7RefAi, -0.5)),
      claim('l7RefAFormulaPlus', '2 + (−½)/(½·½) = 0 …', () => close(V.l7RefAFormulaPlus, 0)),
      claim('l7RefAFormulaMinus', '… 2 − (−½)/(½·½) = 4', () => close(V.l7RefAFormulaMinus, 4)),
    ],
  },
  {
    id: 'l7-uncertainty:b6a',
    phase: 'books',
    text: 'Townsend (§3.5) and Susskind (§5.4–5.7) reach the same general rule through the Schwarz inequality; Susskind’s exercise uses the notes’ shifted operators. Townsend applies it to spin: when $S_z$ has a definite nonzero value, neither $S_x$ nor $S_y$ can be definite. Zwiebach’s Notes 5 §2, which the notes cite, gives the standard proof.',
    caption: `$|{+z}\\rangle$: $\\Delta S_x = \\Delta S_y = \\hbar/2$, both above zero, while $\\Delta S_z = 0$ · the {{ax|magnet}} is along $y$`,
    stage: bloch({ state: '+z', measure: 'y', readouts: ['spreads'] }),
    terms: { ax: t('bloch', 'axis-n') },
    refs: [
      townsend('§3.5, pp. 91–93 (eqs. 3.63–3.75)', 'The general uncertainty relation through the Schwarz inequality, applied to the components of angular momentum.'),
      susskind('Lecture 5, §5.4–5.7', 'The same relation, with the shifted operators of the notes in an exercise.'),
      { source: 'mit805', where: 'Zwiebach, MIT 8.05 Notes 5 §2 (cited by the notes)', adds: 'The standard proof of the uncertainty relation.' },
    ],
    claims: [
      claim('l7SdZx', 'ΔSx = ħ/2 in |+z⟩ …', () => close(V.l7SdZx, 0.5)),
      claim('l7SdZy', '… = ΔSy', () => close(V.l7SdZy, 0.5)),
      claim('l7VarZz', 'ΔSz = 0', () => close(V.l7VarZz, 0)),
    ],
  },
  {
    id: 'l7-uncertainty:b6b',
    phase: 'books',
    text: `Townsend §3.5, pp. 92–93, Eq. 3.64 to Eq. 3.75, proves the bound with the Schwarz inequality, $\\langle\\alpha|\\alpha\\rangle\\langle\\beta|\\beta\\rangle \\ge \\lvert\\langle\\alpha|\\beta\\rangle\\rvert^2$. Shift each operator by its average: $|\\alpha\\rangle = (\\hat A - \\langle A\\rangle)|\\psi\\rangle$, and $|\\beta\\rangle$ likewise with $\\hat B$. The left side is then $(\\Delta A)^2(\\Delta B)^2$. The overlap splits into a real part and an imaginary part. Its squared size is $\\frac{\\langle F\\rangle^2}{4} + \\frac{\\langle C\\rangle^2}{4}$, where $[\\hat A, \\hat B] = i\\hat C$ and $F$ is the sum of the product and its adjoint. Dropping the first piece gives the bound. His $C$ is Hermitian, so his bound reads $\\frac{\\lvert\\langle C\\rangle\\rvert}{2}$, and for spin $C = \\hbar S_z$. At $\\theta = 60^\\circ$, $\\varphi = 45^\\circ$ the pieces are ${d(V.l7TSchwarzCov, 6)} and ${d(V.l7TSchwarzComm, 6)} in units of $\\hbar^4$. They add to ${d(V.l7TSchwarzSum, 6)}, the squared product of the spreads. For a [[qubit|qubit]] both shifted kets are orthogonal to $|\\psi\\rangle$, so they are parallel and the Schwarz inequality is an equality. The dropped piece is then exactly the $r_x^2r_y^2$ term that an earlier beat of this unit dropped.`,
    caption: `the state at $\\theta = 60^\\circ$, $\\varphi = 45^\\circ$ · kept piece ${d(V.l7TSchwarzComm, 6)}, dropped piece ${d(V.l7TSchwarzCov, 6)}, in units of $\\hbar^4$ · the dashed lines drop the $x$ and $y$ averages`,
    stage: bloch({ state: STAR, measure: 'z', dropLines: ['x', 'y'], readouts: ['averages', 'spreads'] }),
    derivation: {
      result: '\\Delta A\\,\\Delta B \\ge \\frac{\\lvert\\langle C\\rangle\\rvert}{2}',
      ground: [
        {
          tex: '|\\alpha\\rangle = (\\hat A - \\langle A\\rangle)|\\psi\\rangle,\\quad \\langle\\alpha|\\alpha\\rangle = (\\Delta A)^2',
          why: 'Shifting by the average makes the squared length of the ket equal to the variance, and $|\\beta\\rangle$ does the same for $\\hat B$.',
        },
        {
          tex: '\\langle\\alpha|\\alpha\\rangle\\langle\\beta|\\beta\\rangle \\ge \\lvert\\langle\\alpha|\\beta\\rangle\\rvert^2',
          why: 'This is the Schwarz inequality: the product of two squared lengths is at least the squared size of their overlap, as for ordinary vectors.',
        },
        {
          tex: '\\hat O = (\\hat A - \\langle A\\rangle)(\\hat B - \\langle B\\rangle) = \\frac{\\hat F}{2} + \\frac{i\\hat C}{2}',
          why: 'Any product is a Hermitian part plus $i$ times another Hermitian part, and the second one is the commutator divided by $i$.',
          view: bloch({ state: STAR, measure: 'z', dropLines: ['x', 'y'], readouts: ['averages', 'spreads'] }),
          viewCaption: 'the state at $\\theta = 60^\\circ$, $\\varphi = 45^\\circ$',
        },
        {
          tex: '\\lvert\\langle\\alpha|\\beta\\rangle\\rvert^2 = \\frac{\\langle F\\rangle^2}{4} + \\frac{\\langle C\\rangle^2}{4}',
          why: 'Averages of Hermitian operators are real, so the overlap is real plus $i$ times real, and its squared size adds the two squares.',
          claims: [
            claim('l7TSchwarzCov', 'the dropped piece is 0.008789 …', () => close(V.l7TSchwarzCov, 0.008789, 5e-7)),
            claim('l7TSchwarzComm', '… the kept piece 0.015625 …', () => close(V.l7TSchwarzComm, 0.015625, 5e-7)),
            claim('l7TSchwarzSum', '… and they add to 0.024414', () => close(V.l7TSchwarzSum, 0.024414, 5e-7)),
          ],
        },
        {
          tex: '\\Delta A\\,\\Delta B \\ge \\frac{\\lvert\\langle C\\rangle\\rvert}{2}',
          why: 'Drop the first piece, which cannot be negative, and take the square root.',
          view: bloch({ state: EQ60, measure: 'z', dropLines: ['x', 'y'], readouts: ['averages', 'spreads'] }),
          viewCaption: `on the equator ($\\varphi = 60^\\circ$) the kept piece is zero and the dropped piece, ${d(V.l7TSchwarzEqCov, 6)}, is the whole product`,
        },
      ],
    },
    refs: [townsend('§3.5, pp. 91–94, Eq. 3.64 to Eq. 3.75', 'The Schwarz inequality applied to the shifted kets; the squared overlap is a covariance piece plus a commutator piece, and the bound keeps only the second.')],
    claims: [
      claim('l7TSchwarzCov', 'the dropped piece is 0.008789 …', () => close(V.l7TSchwarzCov, 0.008789, 5e-7)),
      claim('l7TSchwarzComm', '… the kept piece 0.015625 …', () => close(V.l7TSchwarzComm, 0.015625, 5e-7)),
      claim('l7TSchwarzSum', '… and they add to 0.024414', () => close(V.l7TSchwarzSum, 0.024414, 5e-7)),
      claim('l7TSpreadProdSq', 'the squared product of the spreads is 0.024414', () => close(V.l7TSpreadProdSq, V.l7TSchwarzSum)),
      claim('l7TSchwarzGap', 'the Schwarz inequality is an equality for a qubit: the gap is 0', () => close(V.l7TSchwarzGap, 0)),
      claim('l7TSchwarzEqCov', 'on the equator at φ = 60° the dropped piece is 0.011719 …', () => close(V.l7TSchwarzEqCov, 0.011719, 5e-7)),
      claim('l7TSchwarzEqComm', '… and the kept piece 0', () => close(V.l7TSchwarzEqComm, 0)),
    ],
  },
  {
    id: 'l7-uncertainty:b7',
    phase: 'clue',
    text: 'Townsend reads this bound as the reason an $S_z$ measurement spoils a later $S_x$ measurement. Is that what the inequality says?',
    stage: lab(main('+z', [Z('+'), X()])),
    refs: [townsend('§3.5, p. 93', 'Reads the bound as measurement disturbance; the notes (p. 8) keep the two ideas apart.')],
    reveal: {
      text: 'Not quite. Both spreads in it belong to one prepared state, each measured on fresh copies, with no measurement before the other. The kick one measurement gives the next is the update rule of Unit 7.3. The bound only limits what a single preparation can have.',
      caption: 'fresh copies of $|{+z}\\rangle$: $\\Delta S_z = 0$ and $\\Delta S_x = \\hbar/2$, with no earlier measurement involved · the {{ax|magnet}} is along $x$',
      stage: bloch({ state: '+z', measure: 'x', readouts: ['spreads'] }),
      terms: { ax: t('bloch', 'axis-n') },
      fidelity: ['bloch-fresh-copies'],
      claims: [
        claim('l7VarZz', 'ΔSz = 0 in |+z⟩ …', () => close(V.l7VarZz, 0)),
        claim('l7SdZx', '… ΔSx = ħ/2', () => close(V.l7SdZx, 0.5)),
      ],
    },
  },
  {
    id: 'l7-uncertainty:b8',
    phase: 'clue',
    text: 'The derivation dropped $r_x^2r_y^2$. What is that term, and when is the bound met exactly?',
    stage: bloch({ state: { thetaDeg: 90, phiDeg: 45 }, measure: 'z', readouts: BOUND_READOUTS }),
    reveal: {
      text: 'It is $16\\langle S_x\\rangle^2\\langle S_y\\rangle^2/\\hbar^4$. So the notes’ own line before the ≥ is an exact equation: $(\\Delta S_x\\Delta S_y)^2 = \\tfrac{\\hbar^2}{4}\\langle S_z\\rangle^2 + \\langle S_x\\rangle^2\\langle S_y\\rangle^2$. The bound is met exactly whenever $r_xr_y = 0$. The gap is largest, $\\tfrac{\\hbar^2}{8}$, on the equator halfway between $x$ and $y$, shown before this reveal.',
      caption: `on the equator at φ = 45°: product ${d(V.l7Prod9045)} ħ², bound 0 · here, at θ = 60°, φ = 0: product = bound = ${d(V.l7SatP60)} ħ² for the {{pt|point}}`,
      stage: bloch({ state: P60, measure: 'z', readouts: BOUND_READOUTS }),
      terms: { pt: t('bloch', 'point') },
      claims: [
        claim('l7ExactEq', '(ΔSxΔSy)² − (½⟨Sz⟩)² = (⟨Sx⟩⟨Sy⟩)² for eight states', () => close(V.l7ExactEq, 0)),
        claim('l7MaxGap', 'the largest gap on a 3° grid is 0.125ħ²', () => close(V.l7MaxGap, 0.125)),
        claim('l7Prod9045', 'at (90°, 45°): product 0.125ħ² …', () => close(V.l7Prod9045, 0.125)),
        claim('l7Bound9045', '… bound 0', () => close(V.l7Bound9045, 0)),
        claim('l7SatP60', 'at (60°, 0): product 0.125ħ² …', () => close(V.l7SatP60, 0.125)),
        claim('l7SatB60', '… = bound', () => close(V.l7SatB60, 0.125)),
        claim('l7Anti', 'SxSy + SySx = 0: no anticommutator term for spin ½', () => close(V.l7Anti, 0)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l7-ladder — Angular momentum from the commutators (beyond the lecture; Townsend pass, G2b)       */
/* ---------------------------------------------------------------------------------------------- */

const ladderUnit: Beat[] = [
  {
    id: 'l7-ladder:b1',
    phase: 'books',
    text: `The notes stay with spin ½, so this unit goes beyond them: the three commutators alone fix every allowed spin and every matrix element. Townsend §3.3, p. 82, Eq. 3.22 to Eq. 3.24, starts with the squared length $\\hat{\\mathbf J}^2 = \\hat J_x^2 + \\hat J_y^2 + \\hat J_z^2$. The identity $[\\hat A, \\hat B\\hat C] = \\hat B[\\hat A, \\hat C] + [\\hat A, \\hat B]\\hat C$ carries $\\hat J_z$ past each square, and the four terms cancel in pairs. So $\\hat{\\mathbf J}^2$ commutes with every component. For spin ½ it is ${d(V.l7TJ2Half, 2)} $\\hbar^2$ times the identity, and for spin 1 it is ${d(V.l7TJ2One, 0)} $\\hbar^2$ times the identity.`,
    caption: `$\\hat{\\mathbf J}^2$ for spin ½: ${d(V.l7TJ2Half, 2)} on the diagonal and zero elsewhere · for spin 1 the diagonal is ${d(V.l7TJ2One, 0)}`,
    stage: ladder({ j: 0.5, matrix: 'J2' }),
    derivation: {
      result: '[\\hat J_z, \\hat{\\mathbf J}^2] = 0',
      ground: [
        {
          tex: '\\hat{\\mathbf J}^2 = \\hat J_x^2 + \\hat J_y^2 + \\hat J_z^2',
          why: 'The squared length is the sum of the three squared components.',
          view: ladder({ j: 0.5, matrix: 'J2' }),
          viewCaption: 'spin ½: a multiple of the identity',
          claims: [claim('l7TJ2Half', 'for spin ½ the squared length is 0.75 ħ² times the identity …', () => close(V.l7TJ2Half, 0.75))],
        },
        {
          tex: '[\\hat J_z, \\hat J_x^2] = \\hat J_x[\\hat J_z, \\hat J_x] + [\\hat J_z, \\hat J_x]\\hat J_x = i\\hbar(\\hat J_x\\hat J_y + \\hat J_y\\hat J_x)',
          why: 'Carry $\\hat J_z$ past one factor at a time, then use $[\\hat J_z, \\hat J_x] = i\\hbar\\hat J_y$.',
        },
        {
          tex: '[\\hat J_z, \\hat J_y^2] = \\hat J_y[\\hat J_z, \\hat J_y] + [\\hat J_z, \\hat J_y]\\hat J_y = -i\\hbar(\\hat J_y\\hat J_x + \\hat J_x\\hat J_y)',
          why: 'The same steps with $[\\hat J_z, \\hat J_y] = -i\\hbar\\hat J_x$ give the opposite sign.',
        },
        {
          tex: '[\\hat J_z, \\hat{\\mathbf J}^2] = i\\hbar(\\hat J_x\\hat J_y + \\hat J_y\\hat J_x) - i\\hbar(\\hat J_y\\hat J_x + \\hat J_x\\hat J_y) = 0',
          why: 'The two pieces are equal and opposite, and $[\\hat J_z, \\hat J_z^2]$ is zero, so the sum vanishes.',
          view: ladder({ j: 1, matrix: 'J2' }),
          viewCaption: 'spin 1: the diagonal is 2 and nothing else',
          claims: [
            claim('l7TJ2One', '… and for spin 1 it is 2 ħ² times the identity', () => close(V.l7TJ2One, 2)),
            claim('l7TJ2Off', 'the squared length differs from a multiple of the identity by 0', () => close(V.l7TJ2Off, 0)),
          ],
        },
      ],
    },
    refs: [townsend('§3.3, pp. 82–84, Eq. 3.22 to Eq. 3.29; §3.8, p. 104, Eq. 3.118', 'The squared length of the angular momentum commutes with each component, so the two can share eigenstates.')],
    claims: [
      claim('l7TJ2Half', 'for spin ½ the squared length is 0.75 ħ² times the identity …', () => close(V.l7TJ2Half, 0.75)),
      claim('l7TJ2One', '… and for spin 1 it is 2 ħ² times the identity', () => close(V.l7TJ2One, 2)),
      claim('l7TJ2Off', 'the squared length differs from a multiple of the identity by 0', () => close(V.l7TJ2Off, 0)),
    ],
  },
  {
    id: 'l7-ladder:b2',
    phase: 'books',
    text: `Townsend §3.3, pp. 85–86, Eq. 3.37 to Eq. 3.42, builds the [[ladder-operator|ladder operators]] $\\hat J_\\pm = \\hat J_x \\pm i\\hat J_y$. The commutator $[\\hat J_z, \\hat J_\\pm] = \\pm\\hbar\\hat J_\\pm$ says that $\\hat J_+$ raises the $\\hat J_z$ value by one step of $\\hbar$ and $\\hat J_-$ lowers it. The squared length $\\hat{\\mathbf J}^2$ does not notice. A ket with $\\hat J_z$ value $m\\hbar$ becomes a ket with $(m \\pm 1)\\hbar$, and the step has a weight. For spin 1, $\\hat J_+$ takes the middle level to the top one with weight ${d(V.l7TLadder10, 4)} $\\hbar$. For spin three halves, the step from just below the middle weighs ${d(V.l7TLadder32m12, 0)} $\\hbar$ and the step from just above it weighs ${d(V.l7TLadder32p12, 4)} $\\hbar$.`,
    caption: `$\\hat J_+$ on the middle level of spin 1: one step up, weight ${d(V.l7TLadder10, 4)}`,
    stage: ladder({ j: 1, ket: { axis: 'z', m: 0 }, apply: 'J+' }),
    derivation: {
      result: '\\hat J_z\\big(\\hat J_\\pm|\\lambda, m\\rangle\\big) = (m \\pm 1)\\hbar\\,\\big(\\hat J_\\pm|\\lambda, m\\rangle\\big)',
      ground: [
        {
          tex: '\\hat J_\\pm = \\hat J_x \\pm i\\hat J_y,\\quad \\hat J_+^\\dagger = \\hat J_-',
          why: 'Define the pair; the adjoint of one is the other, because $\\hat J_x$ and $\\hat J_y$ are Hermitian.',
        },
        {
          tex: '[\\hat J_z, \\hat J_\\pm] = \\pm\\hbar\\hat J_\\pm',
          why: 'Insert $[\\hat J_z, \\hat J_x] = i\\hbar\\hat J_y$ and $[\\hat J_z, \\hat J_y] = -i\\hbar\\hat J_x$, then collect the terms.',
          view: ladder({ j: 1, ket: { axis: 'z', m: 0 }, apply: 'J+' }),
          viewCaption: 'spin 1: the middle level steps to the top one',
          claims: [claim('l7TLadder10', 'J+ on the middle level of spin 1 has weight 1.4142 …', () => close(V.l7TLadder10, Math.SQRT2))],
        },
        {
          tex: '\\hat J_z\\hat J_+|\\lambda, m\\rangle = (\\hat J_+\\hat J_z + \\hbar\\hat J_+)|\\lambda, m\\rangle = (m + 1)\\hbar\\,\\hat J_+|\\lambda, m\\rangle',
          why: 'Move $\\hat J_z$ through $\\hat J_+$, which costs one extra $\\hbar\\hat J_+$, and let $\\hat J_z$ act on $|\\lambda, m\\rangle$.',
        },
        {
          tex: '\\hat J_z\\big(\\hat J_\\pm|\\lambda, m\\rangle\\big) = (m \\pm 1)\\hbar\\,\\big(\\hat J_\\pm|\\lambda, m\\rangle\\big)',
          why: 'The lower sign works the same way, and $\\hat{\\mathbf J}^2$ commutes with $\\hat J_\\pm$ because it commutes with both components.',
          view: ladder({ j: 1.5, ket: { axis: 'z', m: -0.5 }, apply: 'J+' }),
          viewCaption: 'spin three halves: the level just below the middle steps up with weight 2',
          claims: [
            claim('l7TLadder32m12', '… for spin three halves the step from just below the middle weighs 2 …', () => close(V.l7TLadder32m12, 2)),
            claim('l7TLadder32p12', '… and from just above it 1.7321', () => close(V.l7TLadder32p12, Math.sqrt(3))),
          ],
        },
      ],
    },
    refs: [townsend('§3.3, pp. 84–86, Eq. 3.30 to Eq. 3.42', 'The operators J plus and J minus step the Jz value by one unit of hbar at a fixed squared length.')],
    claims: [
      claim('l7TLadder10', 'J+ on the middle level of spin 1 has weight 1.4142 …', () => close(V.l7TLadder10, Math.SQRT2)),
      claim('l7TLadder32m12', '… for spin three halves the step from just below the middle weighs 2 …', () => close(V.l7TLadder32m12, 2)),
      claim('l7TLadder32p12', '… and from just above it 1.7321', () => close(V.l7TLadder32p12, Math.sqrt(3))),
    ],
  },
  {
    id: 'l7-ladder:b3',
    phase: 'books',
    text: `Townsend §3.3, pp. 86–89, Eq. 3.43 to Eq. 3.53, Fig. 3.5 and Fig. 3.6: the ladder must end. Because $m^2 \\le \\lambda$, there is a top level $j$ where $\\hat J_+$ gives zero, and that forces $\\lambda = j(j+1)$. The same argument at the bottom level gives $-j$. Steps of one from $j$ down to $-j$ need $2j$ to be a whole number. So the [[spin-j|spin $j$]] is 0, a half, 1, three halves and so on, with $2j + 1$ levels. Spin ½ has ${d(V.l7TLevels05, 0)} levels, spin 1 has ${d(V.l7TLevels1, 0)}, and spin three halves has ${d(V.l7TLevels15, 0)}.`,
    caption: `spin 1: the levels $+1$, $0$ and $-1$ · ${d(V.l7TLevels1, 0)} levels, $2j + 1$ with $j = 1$`,
    stage: ladder({ j: 1, readouts: ['levels'] }),
    derivation: {
      result: '2j = 0, 1, 2, 3, \\dots',
      ground: [
        {
          tex: 'm^2 \\le \\lambda',
          why: 'The squared lengths of $\\hat J_x|\\lambda, m\\rangle$ and $\\hat J_y|\\lambda, m\\rangle$ cannot be negative, so $\\lambda - m^2$ cannot be either.',
          view: ladder({ j: 0.5, readouts: ['levels'] }),
          viewCaption: 'spin ½: two levels',
          claims: [claim('l7TLevels05', 'spin ½ has 2 levels …', () => V.l7TLevels05 === 2)],
        },
        {
          tex: '\\hat J_+|\\lambda, j\\rangle = 0\\ \\Rightarrow\\ \\lambda = j(j+1)',
          why: 'A ladder that cannot go on forever stops at a top level $j$; then $\\hat J_-\\hat J_+ = \\hat{\\mathbf J}^2 - \\hat J_z^2 - \\hbar\\hat J_z$ gives $\\lambda = j(j+1)$.',
        },
        {
          tex: '\\hat J_-|\\lambda, j\'\\rangle = 0\\ \\Rightarrow\\ \\lambda = j\'(j\' - 1),\\ j\' = -j',
          why: 'The same argument at the bottom level $j\'$ uses $\\hat J_+\\hat J_- = \\hat{\\mathbf J}^2 - \\hat J_z^2 + \\hbar\\hat J_z$, and comparing the two values of $\\lambda$ gives $j\' = -j$.',
          view: ladder({ j: 1, readouts: ['levels'] }),
          viewCaption: 'spin 1: three levels',
          claims: [claim('l7TLevels1', '… spin 1 has 3 …', () => V.l7TLevels1 === 3)],
        },
        {
          tex: 'j - (-j) = 2j = 0, 1, 2, 3, \\dots',
          why: 'Whole steps from $j$ down to $-j$ need $2j$ to be a whole number, so $j$ is a whole number or a half of one.',
          view: ladder({ j: 1.5, readouts: ['levels'] }),
          viewCaption: 'spin three halves: four levels',
          claims: [claim('l7TLevels15', '… and spin three halves has 4', () => V.l7TLevels15 === 4)],
        },
      ],
    },
    refs: [townsend('§3.3, pp. 86–89, Eq. 3.43 to Eq. 3.53, Figs. 3.5–3.6', 'The ladder must stop at both ends, and that fixes the squared length at j(j+1) and the allowed j as whole or half-whole numbers.')],
    claims: [
      claim('l7TLevels05', 'spin ½ has 2 levels …', () => V.l7TLevels05 === 2),
      claim('l7TLevels1', '… spin 1 has 3 …', () => V.l7TLevels1 === 3),
      claim('l7TLevels15', '… and spin three halves has 4', () => V.l7TLevels15 === 4),
    ],
  },
  {
    id: 'l7-ladder:b4',
    phase: 'books',
    text: `Townsend §3.4, pp. 90–91, Eq. 3.55 to Eq. 3.62, and §3.6, pp. 94–96, Eq. 3.76 to Eq. 3.90. The weight of a step is fixed by the length of the stepped ket: $\\hat J_+|j, m\\rangle = \\sqrt{j(j+1) - m(m+1)}\\,\\hbar\\,|j, m+1\\rangle$, with the phase chosen real and positive. So every matrix follows from the commutators alone. For spin ½ it gives $\\hat S_+ = \\hbar\\begin{pmatrix}0&1\\\\0&0\\end{pmatrix}$. Then $\\hat S_x$ and $\\hat S_y$ are the sum and the difference of $\\hat S_+$ and $\\hat S_-$, halved or divided by $2i$. The result is the pair of Pauli matrices of Unit 4.5, now with no Stern–Gerlach data. Each entry of $\\hat S_y$ has size ${d(V.l7TSyHalf, 1)}, in units of $\\hbar$. For spin 1, each nonzero entry of $\\hat J_y$ has size ${d(V.l7TJy1Entry, 4)}.`,
    caption: `spin ½: $\\hat S_+$ has a single entry, ${d(V.l7TJp05, 0)}, in units of $\\hbar$`,
    stage: ladder({ j: 0.5, matrix: 'J+' }),
    derivation: {
      result: '\\hat S_y = \\tfrac{\\hbar}{2}\\begin{pmatrix}0&-i\\\\i&0\\end{pmatrix}',
      ground: [
        {
          tex: '\\hat J_+|j, m\\rangle = \\sqrt{j(j+1) - m(m+1)}\\,\\hbar\\,|j, m+1\\rangle',
          why: 'The squared length of the stepped ket is $[j(j+1) - m(m+1)]\\hbar^2$, so that is the weight, and the phase is a free choice taken real and positive.',
          view: ladder({ j: 0.5, matrix: 'J+' }),
          viewCaption: 'spin ½: the raising matrix',
          claims: [claim('l7TJp05', 'for spin ½ the raising matrix has one entry, 1', () => close(V.l7TJp05, 1))],
        },
        {
          tex: '\\hat S_+|{-z}\\rangle = \\hbar|{+z}\\rangle,\\quad \\hat S_+|{+z}\\rangle = 0,\\quad \\hat S_- = \\hat S_+^\\dagger',
          why: 'For spin ½ the formula gives weight 1 from the bottom level and 0 from the top one, and the lowering matrix is the adjoint.',
        },
        {
          tex: '\\hat S_x = \\frac{\\hat S_+ + \\hat S_-}{2},\\quad \\hat S_y = \\frac{\\hat S_+ - \\hat S_-}{2i}',
          why: 'Undo the definition $\\hat S_\\pm = \\hat S_x \\pm i\\hat S_y$.',
        },
        {
          tex: '\\hat S_y = \\tfrac{\\hbar}{2}\\begin{pmatrix}0&-i\\\\i&0\\end{pmatrix}',
          why: 'Put in the two matrices: the $y$ matrix is the one of Unit 4.5, now derived from the commutators alone.',
          view: ladder({ j: 0.5, matrix: 'Jy' }),
          viewCaption: 'spin ½: the $y$ matrix, entries of size ½ in units of $\\hbar$',
          claims: [
            claim('l7TSyHalf', 'each entry of Sy has size 0.5 ħ', () => close(V.l7TSyHalf, 0.5)),
            claim('l7TJy1Entry', 'for spin 1 each nonzero entry of Jy has size 0.7071 ħ', () => close(V.l7TJy1Entry, Math.SQRT1_2)),
          ],
        },
      ],
    },
    refs: [townsend('§3.4, pp. 90–91, Eq. 3.55 to Eq. 3.62; §3.6, pp. 94–96, Eq. 3.76 to Eq. 3.90, Example 3.3', 'The weights of the ladder steps follow from the length of the stepped ket; for spin one half they rebuild the Pauli matrices without any Stern-Gerlach data.')],
    claims: [
      claim('l7TJp05', 'for spin ½ the raising matrix has one entry, 1', () => close(V.l7TJp05, 1)),
      claim('l7TSyHalf', 'each entry of Sy has size 0.5 ħ', () => close(V.l7TSyHalf, 0.5)),
      claim('l7TJy1Entry', 'for spin 1 each nonzero entry of Jy has size 0.7071 ħ', () => close(V.l7TJy1Entry, Math.SQRT1_2)),
    ],
  },
  {
    id: 'l7-ladder:b5',
    phase: 'books',
    text: `Townsend §3.3, p. 87, Fig. 3.4, and p. 89, and §3.5, p. 93, give the length of $\\hat{\\mathbf J}$. It is $\\sqrt{j(j+1)}\\,\\hbar$, always longer than the largest projection $j\\hbar$. For spin ½ it is ${d(V.l7TLen05, 4)} $\\hbar$, for spin 1 it is ${d(V.l7TLen1, 4)} $\\hbar$, and for spin three halves ${d(V.l7TLen15, 4)} $\\hbar$. A vector of that length with that projection would lean $${d(V.l7TCone05, 2)}^\\circ$, $${d(V.l7TCone1, 0)}^\\circ$ and $${d(V.l7TCone15, 2)}^\\circ$ from $z$. That lean is a picture of two lengths, not of a direction. If $J_z$ is sharp and not zero, $\\Delta J_x\\Delta J_y \\ge \\tfrac{\\hbar}{2}\\lvert\\langle J_z\\rangle\\rvert$ keeps $J_x$ and $J_y$ from being sharp too.`,
    caption: `spin 1: $|J| = ${d(V.l7TLen1, 4)}\\hbar$ against the top projection $\\hbar$ · the lean from $z$ is $${d(V.l7TCone1, 0)}^\\circ$, a picture of two lengths and not a direction`,
    stage: ladder({ j: 1, readouts: ['length', 'cone'] }),
    fidelity: ['spin-ladder-cone'],
    refs: [townsend('§3.3, p. 87, Fig. 3.4, and p. 89; §3.5, p. 93, Eq. 3.75; Problem 3.21, p. 109', 'The length of J always exceeds the largest projection, so J cannot point along an axis; the cone picture shows two lengths and nothing about a direction.')],
    claims: [
      claim('l7TLen05', 'the length for spin ½ is 0.8660 ħ …', () => close(V.l7TLen05, Math.sqrt(3) / 2)),
      claim('l7TLen1', '… for spin 1 it is 1.4142 ħ …', () => close(V.l7TLen1, Math.SQRT2)),
      claim('l7TLen15', '… for spin three halves 1.9365 ħ', () => close(V.l7TLen15, Math.sqrt(15) / 2)),
      claim('l7TCone05', 'the lean from z at the top level of spin ½ is 54.74°', () => close(V.l7TCone05, 54.7356, 5e-3)),
      claim('l7TCone1', '… for spin 1, 45°', () => close(V.l7TCone1, 45, 1e-9)),
      claim('l7TCone15', '… for spin three halves 39.23°', () => close(V.l7TCone15, 39.2315, 5e-3)),
    ],
  },
  {
    id: 'l7-ladder:b6',
    phase: 'books',
    text: `Townsend §3.7, pp. 99–103 (Eqs. 3.104–3.115), sends a spin-1 beam with $S_y = \\hbar$ through a $z$ magnet. Solving the eigenproblem of the 3 by 3 matrix for $\\hat S_y$ gives three beams, with chances ${d(V.l7TSgY1up, 2)}, ${d(V.l7TSgY1mid, 1)} and ${d(V.l7TSgY1down, 2)}. A spin-½ beam would give ${d(V.l7TSgHalfUp, 1)} and ${d(V.l7TSgHalfUp, 1)}. The same method for spin three halves, in the $S_x$ state of one half of $\\hbar$, gives ${d(V.l7TSg32a, 3)}, ${d(V.l7TSg32b, 3)}, ${d(V.l7TSg32c, 3)} and ${d(V.l7TSg32d, 3)}.`,
    caption: `a spin-1 beam with $S_y = \\hbar$ through an SGz: chances ${d(V.l7TSgY1up, 2)}, ${d(V.l7TSgY1mid, 1)}, ${d(V.l7TSgY1down, 2)} for $S_z = \\hbar, 0, -\\hbar$`,
    stage: ladder({ j: 1, ket: { axis: 'y', m: 1 }, readouts: ['chances'] }),
    derivation: {
      result: 'P(S_z = \\hbar, 0, -\\hbar) = 0.25,\\ 0.5,\\ 0.25',
      ground: [
        {
          tex: '\\hat S_y = \\frac{\\hbar}{\\sqrt2}\\begin{pmatrix}0&-i&0\\\\i&0&-i\\\\0&i&0\\end{pmatrix}',
          why: 'Take $\\hat J_y$ of spin 1 from the ladder weights, written in the $z$ basis.',
          view: ladder({ j: 1, matrix: 'Jy' }),
          viewCaption: 'spin 1: the $y$ matrix in the $z$ basis',
        },
        {
          tex: '\\det\\big(\\hat S_y/\\hbar - \\mu\\big) = 0\\ \\Rightarrow\\ \\mu(\\mu^2 - 1) = 0,\\ \\mu = 1, 0, -1',
          why: 'A nonzero column exists only when the determinant vanishes, and there are three values, as many as there are levels.',
        },
        {
          tex: '-ib = \\sqrt2\\,a,\\quad ib = \\sqrt2\\,c',
          why: 'For $\\mu = 1$ the first and last rows of the eigen-equation tie the three entries $(a, b, c)$ together.',
        },
        {
          tex: '(a, b, c) = a\\,(1,\\ i\\sqrt2,\\ -1)',
          why: 'So $c = -a$ and $b = i\\sqrt2\\,a$.',
        },
        {
          tex: '|a|^2(1 + 2 + 1) = 1\\ \\Rightarrow\\ |a| = \\tfrac12',
          why: 'The squared sizes of the entries add to 1, which fixes the size of $a$ and the column up to a phase.',
        },
        {
          tex: 'P(S_z = \\hbar, 0, -\\hbar) = 0.25,\\ 0.5,\\ 0.25',
          why: 'Each chance is the squared size of one entry of the column, and the three add to 1.',
          view: ladder({ j: 1, ket: { axis: 'y', m: 1 }, readouts: ['chances'] }),
          viewCaption: 'the bars are the squared sizes of the column',
          claims: [
            claim('l7TSgY1up', 'S_z = ħ with chance 0.25 …', () => close(V.l7TSgY1up, 0.25)),
            claim('l7TSgY1mid', '… 0 with chance 0.5 …', () => close(V.l7TSgY1mid, 0.5)),
            claim('l7TSgY1down', '… −ħ with chance 0.25', () => close(V.l7TSgY1down, 0.25)),
          ],
        },
      ],
    },
    refs: [townsend('§3.7, pp. 99–103, Eq. 3.104 to Eq. 3.115, Figs. 3.8–3.10, Example 3.5; Problem 3.22, p. 109', 'The three chances of a spin-1 beam through a z magnet come from the squared sizes of one column of the eigenvector of the y spin matrix.')],
    claims: [
      claim('l7TSgY1up', 'S_z = ħ with chance 0.25 …', () => close(V.l7TSgY1up, 0.25)),
      claim('l7TSgY1mid', '… 0 with chance 0.5 …', () => close(V.l7TSgY1mid, 0.5)),
      claim('l7TSgY1down', '… −ħ with chance 0.25', () => close(V.l7TSgY1down, 0.25)),
      claim('l7TSgHalfUp', 'a spin-½ beam gives 0.5 and 0.5', () => close(V.l7TSgHalfUp, 0.5)),
      claim('l7TSg32a', 'spin three halves, S_x = ħ/2, on z: 0.375 …', () => close(V.l7TSg32a, 0.375)),
      claim('l7TSg32b', '… 0.125 …', () => close(V.l7TSg32b, 0.125)),
      claim('l7TSg32c', '… 0.125 …', () => close(V.l7TSg32c, 0.125)),
      claim('l7TSg32d', '… 0.375', () => close(V.l7TSg32d, 0.375)),
    ],
  },
  {
    id: 'l7-ladder:b7',
    phase: 'clue',
    text: 'A spin-1 beam with $S_y = 0$ enters a $z$ magnet. Do any atoms leave through the $S_z = 0$ exit?',
    stage: ladder({ j: 1 }),
    reveal: {
      text: `None. The $S_y = 0$ column is the sum of the top and bottom $z$ levels. So half the atoms leave through each, with chances ${d(V.l7TSgY0up, 1)} and ${d(V.l7TSgY0up, 1)}, and ${d(V.l7TSgY0mid, 0)} through the middle exit. The zero level of one axis has no zero level along a perpendicular one (Townsend, Ex. 3.5).`,
      caption: `the bars: ${d(V.l7TSgY0up, 1)}, ${d(V.l7TSgY0mid, 0)}, ${d(V.l7TSgY0up, 1)}`,
      stage: ladder({ j: 1, ket: { axis: 'y', m: 0 }, readouts: ['chances'] }),
      claims: [
        claim('l7TSgY0up', 'the S_y = 0 beam gives 0.5 up and 0.5 down …', () => close(V.l7TSgY0up, 0.5)),
        claim('l7TSgY0mid', '… and 0 in the middle', () => close(V.l7TSgY0mid, 0)),
      ],
    },
  },
]

export const L7_STORY: Record<string, Beat[]> = {
  'l7-two-angles': twoAngles,
  'l7-full-turn': fullTurn,
  'l7-order': order,
  'l7-compatible': compatible,
  'l7-spreads': spreads,
  'l7-uncertainty': uncertainty,
  'l7-ladder': ladderUnit,
}
