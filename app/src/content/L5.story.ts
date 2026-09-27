/**
 * Lecture 5 scroll story (owner: P). Beats per docs/roles/proposals/P-L5-story.md §1, with the judge's rulings:
 * Lecture 4 owns S_x, S_y, the Pauli matrices and the S_x eigenproblem, so `l5-averages:b1` and `l5-inverse:b1` are
 * one-beat link-backs to Units 4.5 and 4.6 that define nothing; the assigned S_y eigenproblem stays a hints-only
 * challenge of Unit 4.6 (no L5 item works it); the notes' ΔS_z check becomes the projector check of
 * `l5-invariance:b2` plus one link back to Unit 3.6; the `bloch` stage appears in `l5-averages` only as a plot of the
 * three averages ("Lecture 6 names this the Bloch sphere"); the |+y⟩ source of `l5-averages:b8` arrives ready-made
 * (fidelity `lab-prepared-offstage`). The basis-change direction B_{z←x} (output ← input) is stated once, in
 * `l5-coordinates:b3`. Where the plan's beat repeated a Lecture 4 beat (Susskind's tilted magnet, the phase of |+x⟩),
 * the beat keeps only what Lecture 5 adds: any direction in space, and the phase of a basis vector in a matrix.
 *
 * Rules kept here (as in L1–L4.story.ts):
 * - Stage states carry physics inputs only; the resolver computes every probability. Numbers in the prose come
 *   from L5.values.ts and are backed by keyed claims.
 * - Clue beats are click-to-reveal: `text` is the question, `reveal` the reasoning.
 * - Core text: ≤ 25 words per sentence, symbols defined before use (content/symbols.test.ts).
 */
import type { Beat, BlochState, HilbertPlaneState, LabBench, LabState, OperatorState, Ref, StageKind, TermTarget } from './schema'
import type { Anchor } from './stageVocab'
import { V, claim, close, d, tf, uf } from './L5.values'

/* ---------------------------------------------------------------------------------------------- */
/* Small builders (plain data out)                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const t = (kind: StageKind, anchor: Anchor): TermTarget => ({ kind, anchor })
const plane = (s: Omit<HilbertPlaneState, 'kind'>): HilbertPlaneState => ({ kind: 'hilbert-plane', shot: 'H-FLAT', ...s })
/** Operator space with the σ passport (Lecture 4 defined the Pauli matrices). */
const op = (s: Omit<OperatorState, 'kind'>): OperatorState => ({ kind: 'operator-space', shot: 'O-STD', ...s })
/** The Bloch stage as a plot of the three averages (judge ruling Q3: a preview of Lecture 6). */
const bloch = (s: Omit<BlochState, 'kind'>): BlochState => ({ kind: 'bloch', shot: 'B-STD', ...s })
const bench = (id: LabBench['id'], source: LabBench['source'], axis: 'z' | 'x'): LabBench => ({ id, source, devices: [{ axis }] })
const lab2 = (a: LabBench, b: LabBench, extra: Omit<LabState, 'kind' | 'benches'> = {}): LabState => ({ kind: 'lab-r3', benches: [a, b], ...extra })

const sweep = (from: number, to: number) => ({ from, to })
const at30 = { planeDeg: 30 }
/** The notes' p. 5 state (√3/2, i/2): Bloch angles (60°, 90°). */
const EX = { thetaDeg: 60, phiDeg: 90 }
const circle = { thetaDeg: 60, phiDeg: sweep(0, 360) }

const susskind = (where: string, adds: string): Ref => ({ source: 'susskind', where, adds })
const townsend = (where: string, adds: string): Ref => ({ source: 'townsend', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* l5-averages — Three averages from one column                                                    */
/* ---------------------------------------------------------------------------------------------- */

const averages: Beat[] = [
  {
    id: 'l5-averages:b1',
    phase: 'lecture',
    text: 'Unit 4.5 built each [[spin-matrices|spin matrix]] from its outcomes and their [[projector|projectors]], for example $S_y = \\tfrac{\\hbar}{2}(P_{+y} - P_{-y})$. The bra $\\langle{+y}|$ carries $-i$, the [[complex-conjugate|conjugate]] of the ket’s $i$. In the $z$ basis, $S_k = \\tfrac{\\hbar}{2}\\sigma_k$ for $k = x, y, z$, with the [[pauli-matrices|Pauli matrices]] $\\sigma_k$. All three are [[hermitian|Hermitian]].',
    caption: `Unit 4.5’s picture: $S_y$ is an {{arrow|arrow}} ${uf(V.l5SyArrow)} long along $a_y$ (ħ = 1), and the {{ep|ends}} of its axis mark $|{\\pm y}\\rangle$`,
    stage: op({ op: { named: 'Sy' }, eigen: true }),
    terms: { arrow: t('operator-space', 'arrow-a'), ep: t('operator-space', 'eigen-plus') },
    fidelity: ['operator-arrow-not-state'],
    claims: [
      claim('l5SpecSy', '(ħ/2)(P₊y − P₋y) = Sy', () => V.l5SpecSy === 1),
      claim('l5PyEntry11', 'P₊y has ½ in its lower-right corner …', () => close(V.l5PyEntry11, 0.5)),
      claim('l5NoConj11', '… which reads −½ without the conjugate', () => close(V.l5NoConj11, -0.5)),
      claim('l5SpinHerm', 'Sx, Sy and Sz are Hermitian', () => V.l5SpinHerm === 1),
      claim('l5SyArrow', 'the arrow of Sy is ½ long, along y', () => close(V.l5SyArrow, 0.5)),
    ],
  },
  {
    id: 'l5-averages:b2',
    phase: 'lecture',
    text: 'Write a [[normalized]] state as the column $c_z = (\\alpha, \\beta)$, meaning $|\\psi\\rangle = \\alpha|{+z}\\rangle + \\beta|{-z}\\rangle$. Its $z$ [[expectation|average]] is $\\langle S_z\\rangle = \\langle\\psi|S_z|\\psi\\rangle = \\tfrac{\\hbar}{2}(|\\alpha|^2 - |\\beta|^2)$. Only the [[population|populations]] $|\\alpha|^2$ and $|\\beta|^2$ enter.',
    caption: `each state is drawn as the {{pt|point}} $(\\langle\\sigma_x\\rangle, \\langle\\sigma_y\\rangle, \\langle\\sigma_z\\rangle)$; Lecture 6 names this picture the [[bloch-sphere|Bloch sphere]] · turning the phase of $\\beta$ keeps the {{h|height}}: $\\langle S_z\\rangle = ${tf(V.l5SzAtEveryPhase)}\\hbar$ all the way round`,
    stage: bloch({ state: circle, measure: 'z', trail: true, dropLines: ['z'], readouts: ['averages'] }),
    terms: { pt: t('bloch', 'point'), h: t('bloch', 'z') },
    fidelity: ['bloch-preview', 'bloch-height-populations'],
    claims: [claim('l5SzAtEveryPhase', '⟨Sz⟩ = ħ/4 at every sampled phase of β', () => close(V.l5SzAtEveryPhase, 0.25))],
  },
  {
    id: 'l5-averages:b3',
    phase: 'lecture',
    text: '$S_x$ swaps the two entries of the column. So $\\langle S_x\\rangle = \\tfrac{\\hbar}{2}(\\alpha^*\\beta + \\beta^*\\alpha) = \\hbar\\,\\mathrm{Re}(\\alpha^*\\beta)$, where $\\alpha^*$ is the conjugate of $\\alpha$. The product $\\alpha^*\\beta$ is the [[coherence]], and its [[real-part|real part]] sets the $x$ average.',
    caption: `the same circle of states · the {{xc|x coordinate}} swings, so $\\langle S_x\\rangle$ runs from $+${d(V.l5SxPhi0)}\\hbar$ to $-${d(-V.l5SxPhi180)}\\hbar$`,
    stage: bloch({ state: circle, measure: 'x', trail: true, dropLines: ['x'], readouts: ['averages'] }),
    terms: { xc: t('bloch', 'x') },
    fidelity: ['bloch-global-phase-hidden'],
    claims: [
      claim('l5SxPhi0', 'at φ = 0: ⟨Sx⟩ = √3/4 = 0.433 (ħ) …', () => close(V.l5SxPhi0, Math.sqrt(3) / 4)),
      claim('l5SxPhi180', '… and at φ = 180°: −0.433', () => close(V.l5SxPhi180, -Math.sqrt(3) / 4)),
      claim('l5CohRuleX', '⟨Sx⟩ = ħ Re(α*β) for every fixture state', () => close(V.l5CohRuleX, 0)),
    ],
  },
  {
    id: 'l5-averages:b4',
    phase: 'lecture',
    text: '$S_y$ also swaps the entries, with $-i$ on the top one and $+i$ on the bottom one. That gives $\\langle S_y\\rangle = \\tfrac{\\hbar}{2}(-i\\alpha^*\\beta + i\\beta^*\\alpha) = \\hbar\\,\\mathrm{Im}(\\alpha^*\\beta)$, the [[imaginary-part|imaginary part]]. It is a real number, although $S_y$ has imaginary entries.',
    caption: `the {{yc|y coordinate}} peaks, at $\\langle S_y\\rangle = ${d(V.l5SyPhi90)}\\hbar$, when $\\alpha^*\\beta$ is [[pure-imaginary|purely imaginary]]`,
    stage: bloch({ state: circle, measure: 'y', trail: true, dropLines: ['y'], readouts: ['averages'] }),
    terms: { yc: t('bloch', 'y') },
    claims: [
      claim('l5SyPhi90', 'at φ = 90°: ⟨Sy⟩ = 0.433 (ħ) …', () => close(V.l5SyPhi90, Math.sqrt(3) / 4)),
      claim('l5SyPhi270', '… and at φ = 270°: −0.433', () => close(V.l5SyPhi270, -Math.sqrt(3) / 4)),
      claim('l5CohRuleY', '⟨Sy⟩ = ħ Im(α*β) for every fixture state', () => close(V.l5CohRuleY, 0)),
      claim('l5SyReal', '⟨ψ|Sy|ψ⟩ has no imaginary part', () => close(V.l5SyReal, 0)),
    ],
  },
  {
    id: 'l5-averages:b5',
    phase: 'lecture',
    text: `Take $\\alpha = \\tfrac{\\sqrt3}{2}$ and $\\beta = \\tfrac{i}{2}$. The populations are $${tf(V.l5PopUp)}$ and $${tf(V.l5PopDown)}$, and the coherence is $\\alpha^*\\beta = \\tfrac{i\\sqrt3}{4}$. So $\\langle S_z\\rangle = \\tfrac{\\hbar}{4}$, $\\langle S_x\\rangle = 0$ and $\\langle S_y\\rangle = \\tfrac{\\sqrt3}{4}\\hbar \\approx ${d(V.l5MeanSy)}\\,\\hbar$. Each average needs its own [[ensemble]] of freshly prepared atoms; no single atom carries all three values.`,
    caption: `$c_z = (\\tfrac{\\sqrt3}{2}, \\tfrac{i}{2})$ · the {{pt|point}} sits at $(\\langle\\sigma_x\\rangle, \\langle\\sigma_y\\rangle, \\langle\\sigma_z\\rangle) = (0,\\ ${d(V.l5BlochY)},\\ ${d(V.l5BlochZ, 1)})$`,
    stage: bloch({ state: EX, readouts: ['averages'] }),
    terms: { pt: t('bloch', 'point') },
    fidelity: ['bloch-three-ensembles', 'bloch-one-point'],
    claims: [
      claim('l5PsiExIsNotes', 'the point at (60°, 90°) is the notes’ column (√3/2, i/2)', () => V.l5PsiExIsNotes === 1),
      claim('l5PopUp', 'populations ¾ …', () => close(V.l5PopUp, 0.75)),
      claim('l5PopDown', '… and ¼', () => close(V.l5PopDown, 0.25)),
      claim('l5CohExIm', 'α*β = i√3/4: imaginary part 0.433 …', () => close(V.l5CohExIm, Math.sqrt(3) / 4)),
      claim('l5CohExRe', '… real part 0', () => close(V.l5CohExRe, 0)),
      claim('l5MeanSz', '⟨Sz⟩ = ħ/4', () => close(V.l5MeanSz, 0.25)),
      claim('l5MeanSx', '⟨Sx⟩ = 0', () => close(V.l5MeanSx, 0)),
      claim('l5MeanSy', '⟨Sy⟩ = √3ħ/4 ≈ 0.433ħ', () => close(V.l5MeanSy, Math.sqrt(3) / 4)),
      claim('l5SyPsi0', 'the notes’ direct check: Sy ψ = (ħ/2)(½, i√3/2) …', () => close(V.l5SyPsi0, 0.25)),
      claim('l5SyPsi1Im', '… whose second entry is 0.433i (ħ = 1)', () => close(V.l5SyPsi1Im, Math.sqrt(3) / 4)),
      claim('l5BlochX', 'the point: ⟨σx⟩ = 0 …', () => close(V.l5BlochX, 0)),
      claim('l5BlochY', '… ⟨σy⟩ = 0.866 …', () => close(V.l5BlochY, Math.sqrt(3) / 2)),
      claim('l5BlochZ', '… ⟨σz⟩ = 0.5', () => close(V.l5BlochZ, 0.5)),
    ],
  },
  {
    id: 'l5-averages:b6',
    phase: 'books',
    text: `Townsend (§2.6) writes the same average as a row, times a matrix, times a column. His worked example there swaps our populations: $\\alpha = ${tf(V.l5TownsendAlpha)}$ and $\\beta = \\tfrac{i\\sqrt3}{2}$. He gets $\\langle S_z\\rangle = -\\tfrac{\\hbar}{4}$, and he reaches the same Pauli matrices by another road (§3.6).`,
    caption: 'Townsend’s state sits below the {{eq|equator}}: $\\langle S_z\\rangle = -\\tfrac{\\hbar}{4}$',
    stage: bloch({ state: { thetaDeg: 120, phiDeg: 90 }, measure: 'z', readouts: ['averages'] }),
    terms: { eq: t('bloch', 'equator') },
    refs: [
      townsend('§2.6, pp. 58–59 (eq. 2.105, Ex. 2.7)', 'The average as a row times a matrix times a column, and a worked complex example with the populations swapped.'),
      townsend('§3.6, pp. 94–96 (eqs. 3.77–3.90)', 'Builds $S_x$ and $S_y$ from raising and lowering operators instead of projectors, and lands on the same Pauli matrices.'),
    ],
    claims: [
      claim('l5TownsendKet', 'the point at (120°, 90°) is (½, i√3/2)', () => V.l5TownsendKet === 1),
      claim('l5TownsendAlpha', 'α = ½', () => close(V.l5TownsendAlpha, 0.5)),
      claim('l5TownsendSz', '⟨Sz⟩ = −ħ/4', () => close(V.l5TownsendSz, -0.25)),
    ],
  },
  {
    id: 'l5-averages:b7',
    phase: 'books',
    text: `Susskind shows that every spin state reads + for certain along some axis (§3.8), his [[spin-polarization|spin-polarization principle]]. So the three averages can never all be zero. In fact $\\langle\\sigma_x\\rangle^2 + \\langle\\sigma_y\\rangle^2 + \\langle\\sigma_z\\rangle^2 = 1$ for every state; here $0 + ${d(V.l5SqY, 2)} + ${d(V.l5SqZ, 2)} = 1$.`,
    caption: 'a magnet along the state’s own {{ax|axis}}: every atom reads +',
    stage: bloch({ state: EX, measure: EX }),
    terms: { ax: t('bloch', 'axis-n') },
    fidelity: ['bloch-born'],
    refs: [
      susskind('§3.8 (printed pp. 90–91, as the L6 notes cite)', 'The spin-polarization principle: every pure spin state is the + state of some component, so the squared averages of σx, σy and σz add to 1.'),
      susskind('§3.4', 'The same three matrices, built from the eigenvector conditions for |u⟩, |d⟩, |r⟩, |l⟩, |i⟩, |o⟩ (our ±z, ±x, ±y).'),
    ],
    claims: [
      claim('l5SqY', '⟨σy⟩² = 0.75 …', () => close(V.l5SqY, 0.75)),
      claim('l5SqZ', '… ⟨σz⟩² = 0.25 …', () => close(V.l5SqZ, 0.25)),
      claim('l5SqSum', '… and the three squares add to 1', () => close(V.l5SqSum, 1)),
      claim('l5PolarizedEx', 'along its own axis the state reads + with probability 1', () => close(V.l5PolarizedEx, 1)),
      claim('l5PolarizedAll', 'so does every fixture state', () => close(V.l5PolarizedAll, 1)),
    ],
  },
  {
    id: 'l5-averages:b8',
    phase: 'clue',
    text: 'Prepare $|{+y}\\rangle$. A $z$ magnet splits it 50/50, and so does an $x$ magnet, just like the oven’s [[unpolarized]] beam. Are the two beams the same?',
    caption: '$|{+y}\\rangle$ into a $z$ magnet (top) and an $x$ magnet (bottom): both {{fb|50/50}}',
    stage: lab2(bench('A', '+y', 'z'), bench('B', '+y', 'x'), { readouts: ['fill-bar'], shot: 'L-3Q' }),
    terms: { fb: t('lab-r3', 'fill-bar') },
    fidelity: ['lab-prepared-offstage'],
    claims: [
      claim('l5YonZ', '|+y⟩ along z: ½ read + …', () => close(V.l5YonZ, 0.5)),
      claim('l5YonX', '… and along x: ½', () => close(V.l5YonX, 0.5)),
      claim('l5OvenZ', 'the oven along z: ½', () => close(V.l5OvenZ, 0.5)),
    ],
    reveal: {
      text: 'No. For $|{+y}\\rangle$ the coherence $\\alpha^*\\beta = \\tfrac{i}{2}$ is purely imaginary, so $\\langle S_x\\rangle = 0$ but $\\langle S_y\\rangle = +\\tfrac{\\hbar}{2}$: every atom reads + along $y$. The oven’s beam averages zero along every axis. This bench cannot show the difference, because no magnet here can point along the beam’s own direction, $y$.',
      caption: '$|{+y}\\rangle$ is the {{pt|point}} on the $y$ axis: $(\\langle S_x\\rangle, \\langle S_y\\rangle, \\langle S_z\\rangle) = (0, \\tfrac{\\hbar}{2}, 0)$',
      stage: bloch({ state: '+y', measure: 'y', readouts: ['averages'], shot: 'B-EQUATOR' }),
      terms: { pt: t('bloch', 'point') },
      fidelity: ['lab-beam-along-y'],
      claims: [
        claim('l5PlusYSx', '|+y⟩: ⟨Sx⟩ = 0 …', () => close(V.l5PlusYSx, 0)),
        claim('l5PlusYSy', '… ⟨Sy⟩ = ħ/2 …', () => close(V.l5PlusYSy, 0.5)),
        claim('l5PlusYSz', '… ⟨Sz⟩ = 0', () => close(V.l5PlusYSz, 0)),
        claim('l5PlusYCohIm', 'its coherence is i/2', () => close(V.l5PlusYCohIm, 0.5)),
        claim('l5OvenAvg', 'the oven averages zero along every sampled tilt', () => close(V.l5OvenAvg, 0)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l5-inverse — Matrix in, outcomes and states out                                                 */
/* ---------------------------------------------------------------------------------------------- */

const inverse: Beat[] = [
  {
    id: 'l5-inverse:b1',
    phase: 'lecture',
    text: 'Unit 4.6 solved the [[eigenvalue-problem|eigenvalue problem]] for $S_x$: which numbers $\\lambda$ allow a nonzero column $\\binom{c_1}{c_2}$ with $S_x\\binom{c_1}{c_2} = \\lambda\\binom{c_1}{c_2}$? The [[determinant]] $\\det(S_x - \\lambda I) = \\lambda^2 - \\tfrac{\\hbar^2}{4}$ must vanish, so $\\lambda = \\pm\\tfrac{\\hbar}{2}$. Putting each $\\lambda$ back gives $c_2 = \\pm c_1$, hence $|{\\pm x}\\rangle = \\tfrac{1}{\\sqrt2}\\binom{1}{\\pm1}$.',
    caption: 'the [[characteristic-equation|characteristic equation]] gives the outcomes; back-substitution gives the {{ep|definite states}}',
    stage: op({ op: { named: 'Sx' }, eigen: true }),
    terms: { ep: t('operator-space', 'eigen-plus') },
    claims: [
      claim('l5CharPolyLin', 'det(Sx − λI) has no λ term …', () => close(V.l5CharPolyLin, 0)),
      claim('l5CharPolyDet', '… and constant −¼: λ² − ħ²/4', () => close(V.l5CharPolyDet, -0.25)),
      claim('l5DetAtPlus', 'it vanishes at λ = +½ …', () => close(V.l5DetAtPlus, 0)),
      claim('l5DetAtMinus', '… and at λ = −½', () => close(V.l5DetAtMinus, 0)),
      claim('l5SxBackSub', 'back-substitution gives |+x⟩ and |−x⟩', () => V.l5SxBackSub === 1),
    ],
  },
  {
    id: 'l5-inverse:b2',
    phase: 'lecture',
    text: 'The answer delivers two things. The eigenvalues are the possible readings, and the unit eigenvectors are the states that give them for sure. Because those eigenvectors are [[orthonormal-basis|orthonormal]], they can also serve as new coordinate axes: an [[eigenbasis]], in which $S_x$ will look simplest.',
    caption: 'the $x$ frame as new {{ax|coordinate axes}}: $|{+x}\\rangle$ and $|{-x}\\rangle$ meet at a {{ra|right angle}}, and both have length 1',
    stage: plane({ psi: '+x', others: [{ ket: '-x', role: 'second' }], basis: 'x', rightAngle: true }),
    terms: { ax: t('hilbert-plane', 'basis-1'), ra: t('hilbert-plane', 'right-angle') },
    fidelity: ['plane-half-angles'],
    claims: [
      claim('l5XOrth', '⟨+x|−x⟩ = 0', () => close(V.l5XOrth, 0)),
      claim('l5XNorms', 'both have length 1', () => close(V.l5XNorms, 1)),
      claim('l5ComplX', 'P₊x + P₋x = I: together they are complete', () => V.l5ComplX === 1),
    ],
  },
  {
    id: 'l5-inverse:b3',
    phase: 'lecture',
    text: 'The same recipe applied to $S_y$ is assigned homework (L5 p. 1), and it waits among the challenges of Unit 4.6. The entries $\\mp\\tfrac{i\\hbar}{2}$ make the algebra complex, but the steps do not change: determinant, back-substitution, normalization, phase choice.',
    caption: '$S_y = \\tfrac{\\hbar}{2}\\begin{pmatrix}0&-i\\\\ i&0\\end{pmatrix}$ with its eigen-axis hidden: this one is homework, so the app gives hints, not the working',
    stage: op({ op: { named: 'Sy' }, eigen: false }),
    claims: [claim('l5SyHerm', 'Sy is Hermitian (nothing here solves the homework)', () => V.l5SyHerm === 1)],
  },
  {
    id: 'l5-inverse:b4',
    phase: 'books',
    text: 'Unit 4.6 met Susskind’s magnet tilted within the $x$–$z$ plane. In the same section he lets the [[unit-vector|unit vector]] $\\hat n$ point anywhere: $\\sigma_n = \\hat n\\cdot\\vec\\sigma = n_x\\sigma_x + n_y\\sigma_y + n_z\\sigma_z$. The readings are still $\\pm1$ in every direction, with [[orthogonal]] eigenvectors.',
    caption: `$\\sigma_n$ along $\\htmlClass{term-ar}{\\hat n} = (0,\\ ${d(V.l5BlochY)},\\ ${d(V.l5BlochZ, 1)})$, the axis of the state of Unit 5.1: readings $\\pm1$, and the {{ep|+ end}} is that state`,
    stage: op({ op: { a0: 0, a: [0, V.l5BlochY, V.l5BlochZ] }, eigen: true }),
    terms: { ar: t('operator-space', 'arrow-a'), ep: t('operator-space', 'eigen-plus') },
    fidelity: ['op-length-not-size'],
    refs: [susskind('§3.7 (Ex. 3.3–3.4)', 'The eigenvalue problem for a spin component along any direction: always ±1, always orthogonal eigenvectors; Ex. 3.4 leaves the x–z plane.')],
    claims: [
      claim('l5DirEigUp', 'σn has the eigenvalue +1 in every sampled direction …', () => close(V.l5DirEigUp, 1)),
      claim('l5DirEigDown', '… and −1', () => close(V.l5DirEigDown, -1)),
      claim('l5DirOrth', 'its two eigenvectors are orthogonal', () => close(V.l5DirOrth, 0)),
      claim('l5BlochY', 'n̂ = (0, 0.866, …', () => close(V.l5BlochY, Math.sqrt(3) / 2)),
      claim('l5BlochZ', '… 0.5)', () => close(V.l5BlochZ, 0.5)),
      claim('l5DirExUp', 'along that n̂ the + reading is 1 …', () => close(V.l5DirExUp, 1)),
      claim('l5DirExIsPsi', '… and its + state is the state of Unit 5.1', () => V.l5DirExIsPsi === 1),
    ],
  },
  {
    id: 'l5-inverse:b5',
    phase: 'books',
    text: 'Townsend (§2.4, p. 50) shows that a Hermitian operator’s matrix obeys $A_{jk} = A_{kj}^*$, so complex entries are allowed. Every Hermitian 2×2 matrix can be written $a_0 I + \\vec a\\cdot\\vec\\sigma$, with real numbers $a_0$ and $\\vec a = (a_x, a_y, a_z)$. Its readings are $a_0 \\pm |\\vec a|$, always real.',
    caption: `$H = \\begin{pmatrix}2&1-i\\\\ 1+i&0\\end{pmatrix}$: {{g|gauge}} $a_0 = 1$, {{ar|arrow}} $\\vec a = (1, 1, 1)$, readings $1 \\pm \\sqrt3$, about ${d(V.l5AEigUp)} and $-${d(V.l5AEigDownSize)}$`,
    stage: op({ op: { matrix: [['2', '1-i'], ['1+i', '0']] }, eigen: true, gauge: true, shot: 'O-GAUGE' }),
    terms: { g: t('operator-space', 'gauge-a0'), ar: t('operator-space', 'arrow-a') },
    fidelity: ['op-one-point', 'op-a0-gauge'],
    beyondLecture: true,
    refs: [townsend('§2.4, p. 50 (eqs. 2.79–2.80)', 'The matrix of the adjoint is the transpose conjugate, so a Hermitian operator’s entries mirror as conjugates across the diagonal.')],
    claims: [
      claim('l5AHerm', 'H is Hermitian', () => V.l5AHerm === 1),
      claim('l5AA0', 'a₀ = 1 …', () => close(V.l5AA0, 1)),
      claim('l5AAx', '… a = (1, …', () => close(V.l5AAx, 1)),
      claim('l5AAy', '… 1, …', () => close(V.l5AAy, 1)),
      claim('l5AAz', '… 1)', () => close(V.l5AAz, 1)),
      claim('l5AEigUp', 'readings 1 + √3 ≈ 2.732 …', () => close(V.l5AEigUp, 1 + Math.sqrt(3))),
      claim('l5AEigDown', '… and 1 − √3 ≈ −0.732', () => close(V.l5AEigDown, 1 - Math.sqrt(3))),
      claim('l5AEigDownSize', 'of size 0.732', () => close(V.l5AEigDownSize, Math.sqrt(3) - 1)),
    ],
  },
  {
    id: 'l5-inverse:b6',
    phase: 'clue',
    text: 'Unit 4.6 showed that $-|{+x}\\rangle$ and $i|{+x}\\rangle$ are the same state as $|{+x}\\rangle$. So is the sign of $|{-x}\\rangle$ ours to choose, with nothing to show for it?',
    stage: plane({ psi: '-x', basis: 'z' }),
    reveal: {
      text: 'For the state, yes: a common factor of size 1 is a [[global-phase|global phase]], and it changes no prediction. For matrices, no. The course keeps $|{-x}\\rangle = \\tfrac{1}{\\sqrt2}\\binom{1}{-1}$, while Townsend flips its sign and gets different entries for the very same operator (Unit 5.4).',
      caption: 'the flipped vector is the {{gh|second arrow}}: the same state, but a different column',
      stage: plane({ psi: '-x', others: [{ ket: { neg: '-x' }, role: 'ghost', badge: 'same state' }], basis: 'z' }),
      terms: { gh: t('hilbert-plane', 'ghost') },
      fidelity: ['plane-sign-twice'],
      claims: [
        claim('l5MinusXNegSame', '−|−x⟩ is the same state as |−x⟩', () => V.l5MinusXNegSame === 1),
        claim('l5SzInXOff', 'with our |−x⟩, Sz in the x basis has off-diagonal +½ …', () => close(V.l5SzInXOff, 0.5)),
        claim('l5SzInXTOff', '… with Townsend’s, −½', () => close(V.l5SzInXTOff, -0.5)),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l5-coordinates — Same state, new coordinates                                                    */
/* ---------------------------------------------------------------------------------------------- */

const coordinates: Beat[] = [
  {
    id: 'l5-coordinates:b1',
    phase: 'lecture',
    text: 'Our column $(\\alpha, \\beta)$ holds the [[amplitude|amplitudes]] for the two $z$ outcomes. To predict an $x$ measurement, write the same ket as $|\\psi\\rangle = u|{+x}\\rangle + v|{-x}\\rangle$. Here $u = \\langle{+x}|\\psi\\rangle$ and $v = \\langle{-x}|\\psi\\rangle$ are the $x$ amplitudes.',
    caption: `$|\\psi\\rangle = \\tfrac{\\sqrt3}{2}|{+z}\\rangle + \\tfrac12|{-z}\\rangle$, the state of Unit 4.3 · $z$ {{b1|bars}} ${d(V.l5Psi30Up, 2)} and ${d(V.l5Psi30Down, 2)}`,
    stage: plane({ psi: at30, basis: 'z', shadows: true }),
    terms: { b1: t('hilbert-plane', 'bar-1') },
    fidelity: ['plane-angles-true'],
    claims: [
      claim('l5Psi30Beta', 'the −z amplitude is ½', () => close(V.l5Psi30Beta, 0.5)),
      claim('l5Psi30Up', 'z bars: 0.75 …', () => close(V.l5Psi30Up, 0.75)),
      claim('l5Psi30Down', '… and 0.25', () => close(V.l5Psi30Down, 0.25)),
    ],
  },
  {
    id: 'l5-coordinates:b2',
    phase: 'lecture',
    text: 'Substitute $|{\\pm x}\\rangle = (|{+z}\\rangle \\pm |{-z}\\rangle)/\\sqrt2$ and collect terms. A ket has only one set of coefficients in a basis, so $\\alpha = \\tfrac{u+v}{\\sqrt2}$ and $\\beta = \\tfrac{u-v}{\\sqrt2}$.',
    caption: `the frame turns to $x$ and the arrow stays put · {{sh|shadows}} $u = ${d(V.l5Psi30U)}$ and $v = ${d(V.l5Psi30V)}$ · $x$ {{b1|bars}} ${d(V.l5Psi30XUp)} and ${d(V.l5Psi30XDown)}`,
    stage: plane({ psi: at30, basis: 'x', shadows: true }),
    terms: { sh: t('hilbert-plane', 'shadow-1'), b1: t('hilbert-plane', 'bar-1') },
    fidelity: ['plane-frame-turn-passive'],
    claims: [
      claim('l5Psi30U', 'u = 0.966 …', () => close(V.l5Psi30U, Math.cos(Math.PI / 12))),
      claim('l5Psi30V', '… v = 0.259', () => close(V.l5Psi30V, Math.sin(Math.PI / 12))),
      claim('l5Psi30XUp', 'x bars: 0.933 …', () => close(V.l5Psi30XUp, (2 + Math.sqrt(3)) / 4)),
      claim('l5Psi30XDown', '… and 0.067', () => close(V.l5Psi30XDown, (2 - Math.sqrt(3)) / 4)),
      claim('l5RebuildAlpha', '(u + v)/√2 = 0.866 = α …', () => close(V.l5RebuildAlpha, Math.sqrt(3) / 2)),
      claim('l5RebuildBeta', '… and (u − v)/√2 = ½ = β', () => close(V.l5RebuildBeta, 0.5)),
    ],
  },
  {
    id: 'l5-coordinates:b3',
    phase: 'lecture',
    text: 'A matrix acting on a column returns a blend of the matrix’s own columns, weighted by that column’s entries. So both equations are one, $c_z = B_{z\\leftarrow x}\\,c_x$ with $c_x = (u, v)$. The [[basis-change-matrix|basis-change matrix]] $B_{z\\leftarrow x} = \\tfrac{1}{\\sqrt2}\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}$ has $|{+x}\\rangle$ and $|{-x}\\rangle$, written in $z$ coordinates, as its columns. The notes call it $B_x$; read the arrow as “into $z$, from $x$”.',
    caption: 'its {{cols|columns}} are the new basis vectors in old coordinates, and the weights are the new coordinates $c_x$',
    stage: plane({ psi: at30, basis: 'x', shadows: true }),
    terms: { cols: t('hilbert-plane', 'basis-1') },
    fidelity: ['plane-frame-is-basis'],
    claims: [
      claim('l5BzxEntries', 'B_{z←x} = (1/√2)[[1, 1], [1, −1]]', () => V.l5BzxEntries === 1),
      claim('l5BzxIsColumns', 'its columns are |+x⟩ and |−x⟩', () => V.l5BzxIsColumns === 1),
      claim('l5Rebuild', 'B_{z←x} c_x gives back c_z', () => V.l5Rebuild === 1),
    ],
  },
  {
    id: 'l5-coordinates:b4',
    phase: 'lecture',
    text: 'To go the other way we need the [[inverse]], $c_x = B_{z\\leftarrow x}^{-1}c_z$. A matrix whose columns are orthonormal is [[unitary]]: $B^\\dagger B = I$, with $B$ short for $B_{z\\leftarrow x}$. So its inverse is its [[hermitian-conjugate|conjugate transpose]], $B_{x\\leftarrow z} = B_{z\\leftarrow x}^\\dagger$. Each row of $B^\\dagger$ is a bra, so $c_x = (\\langle{+x}|\\psi\\rangle, \\langle{-x}|\\psi\\rangle)$.',
    caption: `$c_x = (${d(V.l5Psi30U)},\\ ${d(V.l5Psi30V)})$: the two {{sh|shadows}}, whose squares add to 1`,
    stage: plane({ psi: at30, basis: 'x', shadows: true }),
    terms: { sh: t('hilbert-plane', 'shadow-1') },
    fidelity: ['plane-shadow-born'],
    claims: [
      claim('l5BzxUnitary', 'B_{z←x} is unitary', () => V.l5BzxUnitary === 1),
      claim('l5BxzIsDagger', 'B_{x←z} = B_{z←x}†', () => V.l5BxzIsDagger === 1),
      claim('l5UIsBra', 'each new coordinate is the bra of a new basis vector on ψ', () => V.l5UIsBra === 1),
      claim('l5Psi30U', 'c_x = (0.966, …', () => close(V.l5Psi30U, Math.cos(Math.PI / 12))),
      claim('l5Psi30V', '… 0.259)', () => close(V.l5Psi30V, Math.sin(Math.PI / 12))),
      claim('l5Cx30Norm', 'its length is 1', () => close(V.l5Cx30Norm, 1)),
    ],
  },
  {
    id: 'l5-coordinates:b5',
    phase: 'lecture',
    text: '$|{+z}\\rangle$ has $c_z = (1, 0)$ and $c_x = \\tfrac{1}{\\sqrt2}(1, 1)$. $|{+x}\\rangle$ has $c_z = \\tfrac{1}{\\sqrt2}(1, 1)$ and $c_x = (1, 0)$. So the column $(1, 0)$ names a state only once you say which basis it is in.',
    caption: `$|{+z}\\rangle$ read in the $x$ frame: two equal {{sh|shadows}} of ${d(V.l5ZcxU)}, each squaring to ${d(V.l5ZonXPlus, 1)}`,
    stage: plane({ psi: '+z', basis: 'x', shadows: true }),
    terms: { sh: t('hilbert-plane', 'shadow-1') },
    claims: [
      claim('l5ZcxU', '|+z⟩ in x coordinates: (0.707, …', () => close(V.l5ZcxU, Math.SQRT1_2)),
      claim('l5ZcxV', '… 0.707)', () => close(V.l5ZcxV, Math.SQRT1_2)),
      claim('l5ZonXPlus', 'each squares to 0.5', () => close(V.l5ZonXPlus, 0.5)),
      claim('l5XinX', '|+x⟩ in x coordinates is (1, 0)', () => V.l5XinX === 1),
    ],
  },
  {
    id: 'l5-coordinates:b6',
    phase: 'books',
    text: 'Townsend (§2.5) builds the same matrix by slipping the identity $|{+z}\\rangle\\langle{+z}| + |{-z}\\rangle\\langle{-z}|$ between a bra and a ket. Each entry is then an overlap, such as $\\langle{-z}|{+x}\\rangle$. His advice: rederive the matrix this way each time instead of memorizing it.',
    caption: `each entry of $B_{z\\leftarrow x}$ is an overlap of a $z$ bra (the row) with an $x$ ket (the column): top right is $\\langle{+z}|{-x}\\rangle \\approx ${d(V.l5Bzx01)}$`,
    stage: plane({ psi: at30, basis: 'x', shadows: true }),
    refs: [
      townsend(
        '§2.5, pp. 54–55 (eqs. 2.94–2.95, footnote 10)',
        'Gets the change-of-basis matrix from overlaps by inserting the identity operator, and recommends rederiving it that way. He calls it S; his rotation reading of it is Lecture 6 material.',
      ),
    ],
    claims: [
      claim('l5BzxOverlaps', 'entry (j, k) of B_{z←x} is ⟨z_j|x_k⟩', () => V.l5BzxOverlaps === 1),
      claim('l5Bzx01', 'top right: ⟨+z|−x⟩ = 0.707', () => close(V.l5Bzx01, Math.SQRT1_2)),
      claim('l5Bzx11', 'bottom right: ⟨−z|−x⟩ = −0.707', () => close(V.l5Bzx11, -Math.SQRT1_2)),
    ],
  },
  {
    id: 'l5-coordinates:b7',
    phase: 'clue',
    text: 'Here $B_{z\\leftarrow x}$ and $B_{x\\leftarrow z}$ have exactly the same entries. So does the direction of the arrow not matter?',
    stage: plane({ psi: at30, basis: 'x', shadows: true }),
    reveal: {
      text: 'It matters. The $x$ columns are real and the matrix is symmetric, so it equals its own conjugate transpose by luck. For the $y$ basis, $B_{z\\leftarrow y} = \\tfrac{1}{\\sqrt2}\\begin{pmatrix}1&1\\\\ i&-i\\end{pmatrix}$ but $B_{y\\leftarrow z} = \\tfrac{1}{\\sqrt2}\\begin{pmatrix}1&-i\\\\ 1&i\\end{pmatrix}$: keep the arrow.',
      caption: 'the $y$ columns are complex, so this flat plane cannot draw them',
      fidelity: ['plane-real-slice'],
      claims: [
        claim('l5BxSym', 'for x the two arrows have the same entries …', () => V.l5BxSym === 1),
        claim('l5BySym', '… for y they do not', () => V.l5BySym === 0),
        claim('l5Bzy10Im', 'B_{z←y} has +i/√2 bottom left …', () => close(V.l5Bzy10Im, Math.SQRT1_2)),
        claim('l5Byz01Im', '… B_{y←z} has −i/√2 top right', () => close(V.l5Byz01Im, -Math.SQRT1_2)),
      ],
    },
  },
  {
    id: 'l5-coordinates:b8',
    phase: 'clue',
    text: 'Undoing $B_{z\\leftarrow x}$ took no algebra: we flipped it and conjugated it. Would that shortcut work for any pair of basis arrows?',
    caption: 'the $x$ frame: two arrows of length 1 at a {{ra|right angle}}',
    stage: plane({ psi: '+z', basis: 'x', rightAngle: true }),
    terms: { ra: t('hilbert-plane', 'right-angle') },
    reveal: {
      text: `Only for orthonormal ones. Each entry of $B^\\dagger B$ is an [[inner-product|inner product]] of two columns, and it gives $I$ only when the columns are orthonormal. With the arrows $|{+z}\\rangle$ and $|{+x}\\rangle$, only 45° apart, the dagger gives $(1,\\ ${d(V.l5SkewDagger1)})$ for $|{+z}\\rangle$. The true coordinates are $(1, 0)$.`,
      caption: 'two {{bs|basis arrows}} that are not at a right angle: the dagger is no longer the inverse',
      stage: plane({ psi: '+z', others: [{ ket: '+z', role: 'basis', badge: 'column 1' }, { ket: '+x', role: 'basis', badge: 'column 2' }] }),
      terms: { bs: t('hilbert-plane', 'basis-1') },
      claims: [
        claim('l5SkewUnitary', 'the pair (|+z⟩, |+x⟩) is not unitary', () => V.l5SkewUnitary === 0),
        claim('l5SkewDagger1', 'its dagger gives |+z⟩ the second coordinate 0.707 …', () => close(V.l5SkewDagger1, Math.SQRT1_2)),
        claim('l5SkewInvOk', '… while the true inverse gives (1, 0)', () => V.l5SkewInvOk === 1),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l5-operators — Operators change coordinates too                                                 */
/* ---------------------------------------------------------------------------------------------- */

const split = (top: OperatorState) => ({ layout: 'split' as const, top, bottom: plane({ psi: '+x', others: [{ ket: '-x', role: 'second' }], basis: 'x', rightAngle: true }) })

const operators: Beat[] = [
  {
    id: 'l5-operators:b1',
    phase: 'lecture',
    text: 'Let an operator act: $|\\chi\\rangle = A|\\psi\\rangle$. Write $\\psi_z$ for the $z$ column of $|\\psi\\rangle$, our $c_z$. Then $\\chi_z = A^{(z)}\\psi_z$, where the superscript names the basis: $A^{(z)}$ is the [[representation]] of $A$ in $z$ coordinates. Which matrix $A^{(x)}$ does the same job on $x$ columns?',
    caption: `the example $A = S_z$: the {{ar|arrow}}, ${uf(V.l5SzArrowZ)} long along $a_z$ (ħ = 1), is the operator itself, not a table of numbers`,
    stage: op({ op: { named: 'Sz' }, eigen: true }),
    terms: { ar: t('operator-space', 'arrow-a') },
    fidelity: ['operator-basis-free'],
    claims: [claim('l5SzArrowZ', 'Sz is the arrow ½ along z', () => close(V.l5SzArrowZ, 0.5))],
  },
  {
    id: 'l5-operators:b2',
    phase: 'lecture',
    text: 'Put $\\psi_z = B_{z\\leftarrow x}\\psi_x$ and $\\chi_z = B_{z\\leftarrow x}\\chi_x$ into $\\chi_z = A^{(z)}\\psi_z$, then multiply on the left by $B_{x\\leftarrow z}$. That leaves $\\chi_x = B_{x\\leftarrow z}A^{(z)}B_{z\\leftarrow x}\\,\\psi_x$. So $A^{(x)} = B_{x\\leftarrow z}\\,A^{(z)}\\,B_{z\\leftarrow x}$, which the notes write $A_{\\text{new}} = B^\\dagger A_{\\text{old}}B$.',
    caption: 'the same {{ar|arrow}}; only its table of numbers will change',
    stage: op({ op: { named: 'Sz' }, eigen: true }),
    terms: { ar: t('operator-space', 'arrow-a') },
    claims: [claim('l5ActConvert', 'acting then converting = converting then acting, for every fixture operator, state and basis', () => close(V.l5ActConvert, 0))],
  },
  {
    id: 'l5-operators:b3',
    phase: 'lecture',
    text: 'Read the product from right to left. $B_{z\\leftarrow x}$ turns the input into $z$ coordinates, $A^{(z)}$ acts there, and $B_{x\\leftarrow z}$ turns the output back into $x$ coordinates. The rule holds for any [[linear-operator|linear operator]], Hermitian or not.',
    caption: '$x$ in → $z$ → act → $z$ → $x$ out',
    stage: op({ op: { named: 'Sz' }, eigen: true }),
    claims: [
      claim('l5ActConvertAny', 'the rule holds for non-Hermitian operators too …', () => close(V.l5ActConvertAny, 0)),
      claim('l5AnyNotHerm', '… none of the operators tried is Hermitian', () => V.l5AnyNotHerm === 1),
    ],
  },
  {
    id: 'l5-operators:b4',
    phase: 'lecture',
    text: 'Try $A = S_x$, with the basis made of $S_x$’s own eigenvectors. Then $B_{x\\leftarrow z}S_x^{(z)}B_{z\\leftarrow x} = \\tfrac{\\hbar}{2}\\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix}$. The off-diagonal entries vanish, and the eigenvalues $\\pm\\tfrac{\\hbar}{2}$ sit down the diagonal: the matrix is [[diagonal-matrix|diagonal]].',
    caption: `$S_x^{(x)} = \\tfrac{\\hbar}{2}\\,\\mathrm{diag}(1, -1)$: its {{ep|eigenvalues}} $\\pm${tf(V.l5SxInX00)}$ (ħ = 1) on the diagonal · the new {{fr|frame}} is the [[eigenbasis]] of $S_x$`,
    stage: split(op({ op: { named: 'Sx' }, eigen: true })),
    terms: { ep: t('operator-space', 'eigen-plus'), fr: t('hilbert-plane', 'basis-1') },
    fidelity: ['plane-bloch-doubles', 'op-ghost-sphere'],
    claims: [
      claim('l5SxInX00', 'Sx in the x basis: top left ½ …', () => close(V.l5SxInX00, 0.5)),
      claim('l5SxInX11', '… bottom right −½', () => close(V.l5SxInX11, -0.5)),
      claim('l5SxInXDiag', '… and nothing off the diagonal', () => V.l5SxInXDiag === 1),
    ],
  },
  {
    id: 'l5-operators:b5',
    phase: 'lecture',
    text: 'Why diagonal? Let the columns of $B$ be unit eigenvectors $v_1, v_2$ of $A$, with $Av_1 = \\lambda_1v_1$ and $Av_2 = \\lambda_2v_2$. Then $AB$ has columns $\\lambda_1v_1$ and $\\lambda_2v_2$, and so does $BD$ with $D = \\mathrm{diag}(\\lambda_1, \\lambda_2)$. So $AB = BD$, and $B^\\dagger B = I$ turns it into $B^\\dagger AB = D$: [[diagonalization]].',
    caption: '$AB = BD$, one column at a time: each {{fr|frame arrow}} is only rescaled by $A$',
    stage: split(op({ op: { named: 'Sx' }, eigen: true })),
    terms: { fr: t('hilbert-plane', 'basis-1') },
    claims: [
      claim('l5ABeqBD', 'Sx B = B diag(½, −½)', () => V.l5ABeqBD === 1),
      claim('l5DiagAll', 'B†AB is diagonal in its eigenbasis, for every fixture operator', () => close(V.l5DiagAll, 0)),
    ],
  },
  {
    id: 'l5-operators:b6',
    phase: 'lecture',
    text: 'The same $B$ turns $S_z$ into $S_z^{(x)} = \\tfrac{\\hbar}{2}\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$. Those are the numbers of $S_x^{(z)}$, but this is still the $z$ spin, written in $x$ coordinates. A basis change never changes which component is measured.',
    caption: `the {{ar|arrow}} stays on $a_z$: $S_z$ is still $S_z$, although its off-diagonal entries in $x$ are now ${uf(V.l5SzInXOff)} (ħ = 1). This stage always reads $z$-basis entries.`,
    stage: op({ op: { named: 'Sz' }, eigen: true }),
    terms: { ar: t('operator-space', 'arrow-a') },
    fidelity: ['op-z-basis-entries', 'operator-basis-free'],
    claims: [
      claim('l5SzInXIsSx', 'Sz in the x basis has the entries of Sx …', () => V.l5SzInXIsSx === 1),
      claim('l5SxInXIsSz', '… and Sx in the x basis has those of Sz', () => V.l5SxInXIsSz === 1),
      claim('l5SzInXOff', 'its off-diagonal entries are ½', () => close(V.l5SzInXOff, 0.5)),
    ],
  },
  {
    id: 'l5-operators:b7',
    phase: 'books',
    text: 'Townsend (§2.5) runs the same example with $|{-x}\\rangle$ multiplied by $-1$. He gets $S_z^{(x)} = -\\tfrac{\\hbar}{2}\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$, then redoes it with our phases in a later example and gets $+$. Both are right: the phase of a basis vector changes matrix entries, never predictions.',
    caption: `Townsend’s main text: off-diagonal $-\\tfrac{\\hbar}{2}$ · his later example and our notes: $+\\tfrac{\\hbar}{2}$ · for $|{+z}\\rangle$ both give $\\langle S_z\\rangle = \\tfrac{\\hbar}{2}$, and his column is $(${d(V.l5ZcxU)},\\ -${d(-V.l5TownsendPlusZ1)})$`,
    stage: op({ op: { named: 'Sz' }, eigen: true }),
    refs: [
      townsend('§2.4, pp. 48–49 (eq. 2.70)', 'An operator written in its own eigenbasis is diagonal, with the eigenvalues on the diagonal.'),
      townsend('§2.5, pp. 55–57 (eqs. 2.98–2.101, Ex. 2.5)', 'The same rule for operators (he calls the basis-change matrix S), worked for $S_z$ in the $x$ basis with two different phase choices for $|{-x}\\rangle$.'),
    ],
    claims: [
      claim('l5SzInXTOff', 'with Townsend’s |−x⟩: off-diagonal −½', () => close(V.l5SzInXTOff, -0.5)),
      claim('l5ZcxU', '|+z⟩ has first x coordinate 0.707 …', () => close(V.l5ZcxU, Math.SQRT1_2)),
      claim('l5TownsendPlusZ1', '… and, in his phase, second −0.707 (his eq. 2.101)', () => close(V.l5TownsendPlusZ1, -Math.SQRT1_2)),
      claim('l5TownsendMean', 'his ⟨Sz⟩ for |+z⟩ is ħ/2 …', () => close(V.l5TownsendMean, 0.5)),
      claim('l5OurMean', '… and so is ours', () => close(V.l5OurMean, 0.5)),
    ],
  },
  {
    id: 'l5-operators:b8',
    phase: 'clue',
    text: 'The $y$ basis has complex columns. Does $B_{y\\leftarrow z}\\,S_y^{(z)}\\,B_{z\\leftarrow y}$ still come out diagonal?',
    stage: op({ op: { named: 'Sy' }, eigen: false }),
    reveal: {
      text: 'Yes: $\\tfrac{\\hbar}{2}\\,\\mathrm{diag}(1, -1)$, because the columns of $B_{z\\leftarrow y}$ are the eigenvectors $\\htmlClass{term-ep}{|{\\pm y}\\rangle}$ of $S_y$, known since Lecture 2. The argument never used real entries. It needed only that each column is an eigenvector, and that $B^\\dagger B = I$.',
      caption: `the eigen-axis of $S_y$ runs along $a_y$; written in its own basis, $S_y$ has $${tf(V.l5SyInY00)}$ and $-${tf(V.l5SyInY00)}$ on the diagonal (ħ = 1)`,
      stage: op({ op: { named: 'Sy' }, eigen: true }),
      terms: { ep: t('operator-space', 'eigen-plus') },
      claims: [
        claim('l5SyInY00', 'Sy in the y basis: top left ½ …', () => close(V.l5SyInY00, 0.5)),
        claim('l5SyInYDiag', '… diag(½, −½)', () => V.l5SyInYDiag === 1),
        claim('l5ByUnitary', 'B_{z←y} is unitary', () => V.l5ByUnitary === 1),
      ],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* l5-invariance — Predictions ignore the coordinates                                              */
/* ---------------------------------------------------------------------------------------------- */

const invariance: Beat[] = [
  {
    id: 'l5-invariance:b1',
    phase: 'lecture',
    text: 'Prepare $|{+z}\\rangle$ and work in $x$ coordinates: $c_x = \\tfrac{1}{\\sqrt2}(1, 1)$ and $S_z^{(x)} = \\tfrac{\\hbar}{2}\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$. Then $\\langle S_z\\rangle = c_x^\\dagger S_z^{(x)} c_x = \\tfrac{\\hbar}{2}$, exactly the answer in $z$ coordinates.',
    caption: `two equal {{sh|shadows}} of ${d(V.l5ZcxU)}, and still $\\langle S_z\\rangle = \\tfrac{\\hbar}{2}$`,
    stage: plane({ psi: '+z', basis: 'x', shadows: true }),
    terms: { sh: t('hilbert-plane', 'shadow-1') },
    claims: [
      claim('l5ZMeanInX', 'in x coordinates: ⟨Sz⟩ = ħ/2 …', () => close(V.l5ZMeanInX, 0.5)),
      claim('l5ZMeanInZ', '… as in z coordinates', () => close(V.l5ZMeanInZ, 0.5)),
      claim('l5ZcxU', 'each shadow is 0.707', () => close(V.l5ZcxU, Math.SQRT1_2)),
    ],
  },
  {
    id: 'l5-invariance:b2',
    phase: 'lecture',
    text: 'Two nonzero entries in $c_x$ do not make the $z$ reading uncertain: they are amplitudes for $x$ outcomes. Transform the outcome projector too, $P_{+z}^{(x)} = B_{x\\leftarrow z}P_{+z}B_{z\\leftarrow x}$. Then the chance of reading $+\\tfrac{\\hbar}{2}$ is $c_x^\\dagger P_{+z}^{(x)}c_x = 1$. In the words of Unit 3.6, the [[uncertainty|spread]] of $S_z$ is zero in either basis.',
    caption: `$P_{+z}^{(x)} = ${tf(V.l5PzInX00)}\\begin{pmatrix}1&1\\\\1&1\\end{pmatrix}$ gives probability 1 for $+z$ · the {{b1|bars}} still show the $x$ odds, ${d(V.l5ZonXPlus, 1)} and ${d(V.l5ZonXPlus, 1)}`,
    stage: plane({ psi: '+z', basis: 'x', shadows: true }),
    terms: { b1: t('hilbert-plane', 'bar-1') },
    claims: [
      claim('l5PzInX00', 'P₊z in the x basis: every entry ½', () => close(V.l5PzInX00, 0.5) && V.l5PzInXAll === 1),
      claim('l5PzInXAll', 'P₊z⁽ˣ⁾ = ½[[1, 1], [1, 1]]', () => V.l5PzInXAll === 1),
      claim('l5PzInXProb', 'c_x† P₊z⁽ˣ⁾ c_x = 1', () => close(V.l5PzInXProb, 1)),
      claim('l5ZVarInX', 'the variance of Sz is 0 in the x basis too', () => close(V.l5ZVarInX, 0)),
      claim('l5ZonXPlus', 'the x bars: 0.5 each', () => close(V.l5ZonXPlus, 0.5)),
    ],
  },
  {
    id: 'l5-invariance:b3',
    phase: 'lecture',
    text: 'For any old and new basis, $c_{\\text{new}}^\\dagger A^{(\\text{new})}c_{\\text{new}} = (c_{\\text{old}}^\\dagger B)(B^\\dagger A^{(\\text{old})}B)(B^\\dagger c_{\\text{old}})$. Each inner pair $BB^\\dagger$ equals $I$, which for a square $B$ follows from $B^\\dagger B = I$. What remains is $c_{\\text{old}}^\\dagger A^{(\\text{old})}c_{\\text{old}}$, so no average and no Born probability changes: [[invariance|basis independence]].',
    caption: 'the state of Unit 4.3 in either {{fr|frame}}: $\\langle S_z\\rangle = \\tfrac{\\hbar}{4}$',
    stage: plane({ psi: at30, basis: 'x', shadows: true }),
    terms: { fr: t('hilbert-plane', 'basis-1') },
    claims: [
      claim('l5Psi30Mean', 'in z: ⟨Sz⟩ = ħ/4 …', () => close(V.l5Psi30Mean, 0.25)),
      claim('l5Psi30MeanX', '… and in x: ħ/4', () => close(V.l5Psi30MeanX, 0.25)),
      claim('l5BBdagger', 'B B† = I', () => V.l5BBdagger === 1),
      claim('l5InvarAll', 'every fixture average is the same in the x, y and a random basis', () => close(V.l5InvarAll, 0)),
    ],
  },
  {
    id: 'l5-invariance:b4',
    phase: 'books',
    text: 'Townsend (§2.5, §2.6) makes the same point twice. The eigenvalue equation $S_z|{+z}\\rangle = \\tfrac{\\hbar}{2}|{+z}\\rangle$ holds in $x$ coordinates too. And $\\langle S_z\\rangle$ for $|{+x}\\rangle$ is 0 in either basis: in $z$ the matrix is simple, in $x$ the column is.',
    caption: '$|{+x}\\rangle$ in $x$ coordinates is the {{sh|single shadow}} $(1, 0)$ · $\\langle S_z\\rangle = 0$ both ways',
    stage: plane({ psi: '+x', basis: 'x', shadows: true }),
    terms: { sh: t('hilbert-plane', 'shadow-1') },
    refs: [
      townsend('§2.5, p. 56 (eq. 2.102)', 'An eigenvalue equation is a statement about the operator and the state, so it holds in every representation.'),
      townsend('§2.6, pp. 58–59 (eq. 2.107, Ex. 2.6)', 'The same expectation value computed in two bases; one makes the operator simple, the other the state.'),
    ],
    claims: [
      claim('l5EigenEqInX', 'Sz⁽ˣ⁾ c_x = ½ c_x for |+z⟩', () => V.l5EigenEqInX === 1),
      claim('l5XMeanZInX', '|+x⟩: ⟨Sz⟩ = 0 in x coordinates …', () => close(V.l5XMeanZInX, 0)),
      claim('l5XMeanZ', '… and in z coordinates', () => close(V.l5XMeanZ, 0)),
    ],
  },
  {
    id: 'l5-invariance:b5',
    phase: 'clue',
    text: 'A friend converts $|{+z}\\rangle$ to $x$ coordinates but keeps the $z$-basis matrix $S_z^{(z)} = \\tfrac{\\hbar}{2}\\,\\mathrm{diag}(1, -1)$. What does she get for $\\langle S_z\\rangle$?',
    stage: plane({ psi: '+z', basis: 'x', shadows: true }),
    reveal: {
      text: 'She gets $c_x^\\dagger S_z^{(z)}c_x = 0$, which is wrong: the right answer is $\\tfrac{\\hbar}{2}$. A column from one basis and a matrix from another describe nothing at all. Transform both, or neither.',
      caption: 'the {{sh|shadows}} are $x$ coordinates; only $S_z^{(x)}$ can read them',
      terms: { sh: t('hilbert-plane', 'shadow-1') },
      claims: [
        claim('l5MixedWrong', 'the mixed-up product gives 0 …', () => close(V.l5MixedWrong, 0)),
        claim('l5ZMeanInX', '… the right one ħ/2', () => close(V.l5ZMeanInX, 0.5)),
      ],
    },
  },
  {
    id: 'l5-invariance:b6',
    phase: 'clue',
    text: 'A basis-change matrix is [[unitary]], and so is Lecture 6’s rotation $R_z(\\phi) = e^{-i\\phi S_z/\\hbar}$, which turns a state by the angle $\\phi$ about $z$. Is a change of basis the same as rotating the atoms?',
    stage: plane({ psi: at30, basis: 'z', shadows: true }),
    reveal: {
      text: `No. A change of basis keeps the state and only [[passive-change|relabels]] it, so every prediction stays, as shown above. A rotation changes the state inside fixed coordinates, so predictions change. $R_z(90^\\circ)$ takes $|{+x}\\rangle$ to $|{+y}\\rangle$, and $P(+x)$ drops from 1 to $${tf(V.l5RzXProb)}$. Lecture 6 builds rotations, with $S_z$ as their generator.`,
      caption: 'passive: the {{fr|frame}} moved, the state did not',
      stage: plane({ psi: at30, basis: 'x', shadows: true }),
      terms: { fr: t('hilbert-plane', 'basis-1') },
      fidelity: ['plane-frame-turn-passive'],
      claims: [
        claim('l5BzxUnitary', 'B_{z←x} is unitary …', () => V.l5BzxUnitary === 1),
        claim('l5RzUnitary', '… and so is Rz(90°)', () => V.l5RzUnitary === 1),
        claim('l5RzXtoY', 'Rz(90°) takes |+x⟩ to |+y⟩ (up to phase)', () => V.l5RzXtoY === 1),
        claim('l5XX', 'P(+x) for |+x⟩ is 1 …', () => close(V.l5XX, 1)),
        claim('l5RzXProb', '… and ½ after the turn', () => close(V.l5RzXProb, 0.5)),
      ],
    },
  },
]

export const L5_STORY: Record<string, Beat[]> = {
  'l5-averages': averages,
  'l5-inverse': inverse,
  'l5-coordinates': coordinates,
  'l5-operators': operators,
  'l5-invariance': invariance,
}
